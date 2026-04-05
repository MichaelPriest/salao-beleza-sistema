// src/pages/CadastroIndicacao.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
  Avatar,
  Divider,
  Paper,
  Chip,
  Link,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { masks, MaskedInput } from '../utils/plugins';

const steps = ['Dados Pessoais', 'Contato', 'Confirmação'];

function CadastroIndicacao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const indicacaoId = searchParams.get('indicacao');
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [indicacao, setIndicacao] = useState(null);
  const [carregandoIndicacao, setCarregandoIndicacao] = useState(true);
  const [erroIndicacao, setErroIndicacao] = useState(null);
  const [cadastroRealizado, setCadastroRealizado] = useState(false);
  const [config, setConfig] = useState({ 
    pontosIndicacao: 100,
    pontosBoasVindas: 50,
    diasValidadeIndicacao: 30 
  });
  const [configSalao, setConfigSalao] = useState(null);
  const [redesSociais, setRedesSociais] = useState({
    instagram: '',
    facebook: '',
    whatsapp: ''
  });

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    telefone2: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  // Carregar dados da indicação e configurações do salão
  useEffect(() => {
    const carregarDados = async () => {
      if (!indicacaoId) {
        setErroIndicacao('Link de indicação inválido');
        setCarregandoIndicacao(false);
        return;
      }

      try {
        // Carregar configurações do salão
        const configData = await firebaseService.getAll('configuracoes');
        if (configData && configData.length > 0) {
          const configSalaoData = configData[0];
          setConfigSalao(configSalaoData);
          
          // Configurar redes sociais
          const contato = configSalaoData?.salao?.contato || {};
          setRedesSociais({
            instagram: contato.instagram || '',
            facebook: contato.facebook || '',
            whatsapp: contato.whatsapp || '',
          });
        }

        // Carregar configurações de fidelidade
        const configFidelidade = await firebaseService.getAll('config_fidelidade');
        if (configFidelidade && configFidelidade.length > 0) {
          setConfig(prev => ({
            ...prev,
            pontosIndicacao: configFidelidade[0].pontosIndicacao || 100,
            pontosBoasVindas: configFidelidade[0].pontosBoasVindas || 50,
            diasValidadeIndicacao: configFidelidade[0].diasValidadeIndicacao || 30,
          }));
        }

        // Buscar indicação
        let indicacaoEncontrada = null;
        
        try {
          indicacaoEncontrada = await firebaseService.getById('indicacoes', indicacaoId);
        } catch (e) {
          const indicacoes = await firebaseService.query('indicacoes', [
            { field: 'id', operator: '==', value: indicacaoId }
          ]);
          indicacaoEncontrada = indicacoes?.[0];
        }

        if (!indicacaoEncontrada) {
          setErroIndicacao('Indicação não encontrada ou expirada');
          setCarregandoIndicacao(false);
          return;
        }

        // Verificar status
        if (indicacaoEncontrada.status === 'expirada') {
          setErroIndicacao('Esta indicação expirou');
          setCarregandoIndicacao(false);
          return;
        }

        if (indicacaoEncontrada.status === 'confirmada') {
          setErroIndicacao('Esta indicação já foi confirmada');
          setCarregandoIndicacao(false);
          return;
        }

        if (indicacaoEncontrada.status === 'cancelada') {
          setErroIndicacao('Esta indicação foi cancelada');
          setCarregandoIndicacao(false);
          return;
        }

        // Verificar data de expiração
        if (indicacaoEncontrada.dataExpiracao) {
          const dataExpiracao = new Date(indicacaoEncontrada.dataExpiracao);
          if (dataExpiracao < new Date()) {
            await firebaseService.update('indicacoes', indicacaoEncontrada.id, {
              status: 'expirada',
              updatedAt: new Date().toISOString(),
            });
            setErroIndicacao('Esta indicação expirou');
            setCarregandoIndicacao(false);
            return;
          }
        }

        setIndicacao(indicacaoEncontrada);
        
        // Pré-preencher dados
        if (indicacaoEncontrada.clienteIndicadoNome) {
          setFormData(prev => ({ ...prev, nome: indicacaoEncontrada.clienteIndicadoNome }));
        }
        if (indicacaoEncontrada.clienteIndicadoEmail) {
          setFormData(prev => ({ ...prev, email: indicacaoEncontrada.clienteIndicadoEmail }));
        }
        if (indicacaoEncontrada.clienteIndicadoTelefone) {
          setFormData(prev => ({ ...prev, telefone: indicacaoEncontrada.clienteIndicadoTelefone }));
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setErroIndicacao('Erro ao carregar dados da indicação');
      } finally {
        setCarregandoIndicacao(false);
      }
    };

    carregarDados();
  }, [indicacaoId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCepFound = (dados) => {
    setFormData(prev => ({
      ...prev,
      logradouro: dados.logradouro || prev.logradouro,
      bairro: dados.bairro || prev.bairro,
      cidade: dados.cidade || prev.cidade,
      estado: dados.estado || prev.estado,
    }));
    toast.success('Endereço preenchido automaticamente!');
  };

  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validarTelefone = (telefone) => {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 10;
  };

  const validarCPF = (cpf) => {
    if (!cpf) return true;
    const numeros = cpf.replace(/\D/g, '');
    if (numeros.length !== 11) return false;
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(numeros.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(numeros.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(10, 11))) return false;
    
    return true;
  };

  const validarStep1 = () => {
    if (!formData.nome) {
      toast.error('Nome completo é obrigatório');
      return false;
    }
    if (formData.nome.length < 3) {
      toast.error('Nome deve ter pelo menos 3 caracteres');
      return false;
    }
    if (formData.cpf && !validarCPF(formData.cpf)) {
      toast.error('CPF inválido');
      return false;
    }
    return true;
  };

  const validarStep2 = () => {
    if (!formData.email) {
      toast.error('E-mail é obrigatório');
      return false;
    }
    if (!validarEmail(formData.email)) {
      toast.error('E-mail inválido');
      return false;
    }
    if (!formData.telefone) {
      toast.error('Telefone é obrigatório');
      return false;
    }
    if (!validarTelefone(formData.telefone)) {
      toast.error('Telefone inválido');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validarStep1()) return;
    if (activeStep === 1 && !validarStep2()) return;
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validarStep1() || !validarStep2()) return;
    
    setLoading(true);
    
    try {
      // Verificar se cliente já existe
      const clientesExistentes = await firebaseService.query('clientes', [
        { field: 'email', operator: '==', value: formData.email }
      ]);

      if (clientesExistentes && clientesExistentes.length > 0) {
        toast.error('Já existe um cliente cadastrado com este e-mail');
        setLoading(false);
        return;
      }

      // Criar novo cliente
      const agora = new Date();
      const hoje = agora.toISOString().split('T')[0];
      
      const novoCliente = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        telefone2: formData.telefone2 || '',
        cpf: formData.cpf || '',
        rg: formData.rg || '',
        dataNascimento: formData.dataNascimento || '',
        cep: formData.cep || '',
        logradouro: formData.logradouro || '',
        numero: formData.numero || '',
        complemento: formData.complemento || '',
        bairro: formData.bairro || '',
        cidade: formData.cidade || '',
        estado: formData.estado || '',
        status: 'Novo',
        nivelFidelidade: 'bronze',
        totalPontos: 0,
        totalGasto: 0,
        dataCadastro: hoje,
        indicadoPor: indicacao?.clienteId,
        indicadoPorNome: indicacao?.clienteNome,
        dataIndicacao: agora.toISOString(),
        primeiroAtendimentoRealizado: false, // 🔥 Controle do primeiro atendimento
        pontosIndicacaoLiberados: false, // 🔥 Pontos de indicação ainda não liberados
        createdAt: agora.toISOString(),
        updatedAt: agora.toISOString(),
      };

      const clienteId = await firebaseService.add('clientes', novoCliente);

      // 🔥 ATUALIZAR INDICAÇÃO - NÃO LIBERAR PONTOS AINDA
      await firebaseService.update('indicacoes', indicacao.id, {
        clienteIndicadoId: clienteId,
        clienteIndicadoNome: formData.nome,
        clienteIndicadoEmail: formData.email,
        clienteIndicadoTelefone: formData.telefone,
        status: 'pendente', // 🔥 Continua pendente até primeiro atendimento
        dataCadastro: agora.toISOString(),
        pontosLiberados: false, // 🔥 Pontos ainda não liberados
        updatedAt: agora.toISOString(),
      });

      // 🔥 ADICIONAR PONTOS DE BOAS-VINDAS (liberados imediatamente)
      await firebaseService.add('pontuacao', {
        clienteId: clienteId,
        clienteNome: formData.nome,
        quantidade: config.pontosBoasVindas,
        tipo: 'credito',
        motivo: 'Bônus de boas-vindas',
        data: agora.toISOString(),
        createdAt: agora.toISOString(),
      });

      setCadastroRealizado(true);
      toast.success('Cadastro realizado com sucesso!');
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/cliente/login');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao realizar cadastro:', error);
      toast.error('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatarHorarioFuncionamento = () => {
    if (!configSalao?.horarioFuncionamento) return 'Segunda a Sexta: 09:00 - 19:00 | Sábado: 09:00 - 18:00';
    
    const nomesDias = {
      segunda: 'Segunda',
      terca: 'Terça',
      quarta: 'Quarta',
      quinta: 'Quinta',
      sexta: 'Sexta',
      sabado: 'Sábado',
      domingo: 'Domingo'
    };
    
    const diasAbertos = Object.entries(configSalao.horarioFuncionamento)
      .filter(([_, h]) => h && h.aberto === true)
      .map(([dia, h]) => `${nomesDias[dia]}: ${h.abertura} - ${h.fechamento}`);
    
    return diasAbertos.join(' | ');
  };

  if (carregandoIndicacao) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (erroIndicacao) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CloseIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Link Inválido
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {erroIndicacao}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ bgcolor: '#9c27b0' }}
            >
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (cadastroRealizado) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CheckIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Cadastro Realizado com Sucesso!
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Seja bem-vindo(a) ao {configSalao?.salao?.nome || 'nosso salão'}!
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Você recebeu {config.pontosBoasVindas} pontos de boas-vindas.
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>⭐ Você ganhará mais {config.pontosIndicacao} pontos quando realizar seu primeiro atendimento!</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Em breve você será redirecionado para fazer login.
              </Typography>
              <CircularProgress size={24} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Coluna do Formulário */}
        <Grid item xs={12} md={7}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: 4 }}>
                {/* Header com informações do indicador */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: '#9c27b0',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1 }}>
                    Você foi indicado(a)!
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {indicacao?.clienteNome} indicou você para conhecer nosso salão.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                    <Chip
                      icon={<StarIcon />}
                      label={`${config.pontosBoasVindas} pontos de boas-vindas`}
                      sx={{ bgcolor: '#e8f5e9', color: '#4caf50' }}
                    />
                    <Chip
                      icon={<TrophyIcon />}
                      label={`+${config.pontosIndicacao} pontos no 1º atendimento`}
                      sx={{ bgcolor: '#fff3e0', color: '#ff9800' }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Formulário */}
                <Box component="form" noValidate>
                  {activeStep === 0 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Nome Completo *"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          required
                          autoFocus
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MaskedInput
                          mask="cpf"
                          label="CPF"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MaskedInput
                          mask="rg"
                          label="RG"
                          name="rg"
                          value={formData.rg}
                          onChange={handleInputChange}
                          placeholder="00.000.000-0"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <MaskedInput
                          mask="data"
                          label="Data de Nascimento"
                          name="dataNascimento"
                          value={formData.dataNascimento}
                          onChange={handleInputChange}
                          placeholder="DD/MM/AAAA"
                        />
                      </Grid>
                    </Grid>
                  )}

                  {activeStep === 1 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="E-mail *"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MaskedInput
                          mask="telefone"
                          label="Telefone *"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleInputChange}
                          required
                          startAdornment={
                            <InputAdornment position="start">
                              <PhoneIcon color="action" />
                            </InputAdornment>
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <MaskedInput
                          mask="telefone"
                          label="Telefone Secundário"
                          name="telefone2"
                          value={formData.telefone2}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <MaskedInput
                          mask="cep"
                          label="CEP"
                          name="cep"
                          value={formData.cep}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (e.target.value.replace(/\D/g, '').length === 8) {
                              // Buscar endereço automático
                              fetch(`https://viacep.com.br/ws/${e.target.value.replace(/\D/g, '')}/json/`)
                                .then(res => res.json())
                                .then(data => {
                                  if (!data.erro) {
                                    handleCepFound(data);
                                  }
                                })
                                .catch(console.error);
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          label="Logradouro"
                          name="logradouro"
                          value={formData.logradouro}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Número"
                          name="numero"
                          value={formData.numero}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Complemento"
                          name="complemento"
                          value={formData.complemento}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Bairro"
                          name="bairro"
                          value={formData.bairro}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Cidade"
                          name="cidade"
                          value={formData.cidade}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="UF"
                          name="estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                          inputProps={{ maxLength: 2 }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {activeStep === 2 && (
                    <Box>
                      <Alert severity="success" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Revise seus dados antes de finalizar
                        </Typography>
                      </Alert>

                      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">
                              Nome Completo
                            </Typography>
                            <Typography variant="body1">{formData.nome}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                              E-mail
                            </Typography>
                            <Typography variant="body1">{formData.email}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                              Telefone
                            </Typography>
                            <Typography variant="body1">{formData.telefone}</Typography>
                          </Grid>
                          {formData.cpf && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="textSecondary">
                                CPF
                              </Typography>
                              <Typography variant="body1">{formData.cpf}</Typography>
                            </Grid>
                          )}
                          {formData.dataNascimento && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="textSecondary">
                                Data de Nascimento
                              </Typography>
                              <Typography variant="body1">{formData.dataNascimento}</Typography>
                            </Grid>
                          )}
                          {(formData.logradouro || formData.cidade) && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="textSecondary">
                                Endereço
                              </Typography>
                              <Typography variant="body1">
                                {formData.logradouro} {formData.numero}
                                {formData.complemento && ` - ${formData.complemento}`}
                                <br />
                                {formData.bairro && `${formData.bairro} - `}
                                {formData.cidade}/{formData.estado}
                                {formData.cep && ` - CEP: ${formData.cep}`}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>

                      <Alert severity="info" icon={<TrophyIcon />}>
                        <Typography variant="body2">
                          <strong>🎁 Benefícios exclusivos:</strong>
                          <br />
                          • ✅ {config.pontosBoasVindas} pontos de boas-vindas (liberados agora)
                          <br />
                          • ⭐ {config.pontosIndicacao} pontos extras quando realizar seu primeiro atendimento
                          <br />
                          • 🎯 Programa de fidelidade com descontos exclusivos
                          <br />
                          • 💝 Brinde especial na primeira visita
                        </Typography>
                      </Alert>
                    </Box>
                  )}

                  {/* Botões de navegação */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      variant="outlined"
                    >
                      Voltar
                    </Button>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{
                          background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                        }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Finalizar Cadastro'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ bgcolor: '#9c27b0' }}
                      >
                        Próximo
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Coluna de Informações do Salão */}
        <Grid item xs={12} md={5}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent sx={{ p: 4 }}>
                {/* Logo do Salão */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  {configSalao?.salao?.logo ? (
                    <Box
                      component="img"
                      src={configSalao.salao.logo}
                      alt={configSalao.salao.nome}
                      sx={{
                        height: 80,
                        width: 'auto',
                        maxWidth: 200,
                        objectFit: 'contain',
                        mx: 'auto',
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#9c27b0',
                        mx: 'auto',
                      }}
                    >
                      <PersonAddIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                  )}
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 2, color: '#9c27b0' }}>
                    {configSalao?.salao?.nome || 'Beauty Pro'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Informações de Contato */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ color: '#9c27b0' }} /> Contato
                </Typography>
                
                {configSalao?.salao?.contato?.telefone && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Telefone</Typography>
                    <Typography variant="body1">{configSalao.salao.contato.telefone}</Typography>
                  </Box>
                )}
                
                {configSalao?.salao?.contato?.whatsapp && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">WhatsApp</Typography>
                    <Typography variant="body1">{configSalao.salao.contato.whatsapp}</Typography>
                  </Box>
                )}
                
                {configSalao?.salao?.contato?.email && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">E-mail</Typography>
                    <Typography variant="body1">{configSalao.salao.contato.email}</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Endereço */}
                {configSalao?.salao?.endereco && (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon sx={{ color: '#9c27b0' }} /> Endereço
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {configSalao.salao.endereco.logradouro || ''} {configSalao.salao.endereco.numero || ''}
                      {configSalao.salao.endereco.complemento && ` - ${configSalao.salao.endereco.complemento}`}
                      <br />
                      {configSalao.salao.endereco.bairro && `${configSalao.salao.endereco.bairro}, `}
                      {configSalao.salao.endereco.cidade}/{configSalao.salao.endereco.estado}
                      <br />
                      CEP: {configSalao.salao.endereco.cep}
                    </Typography>
                    <Divider sx={{ my: 3 }} />
                  </>
                )}

                {/* Horário de Funcionamento */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon sx={{ color: '#9c27b0' }} /> Horário de Funcionamento
                </Typography>
                <Typography variant="body2">
                  {formatarHorarioFuncionamento()}
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Redes Sociais */}
                {(redesSociais.instagram || redesSociais.facebook || redesSociais.whatsapp) && (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Redes Sociais
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {redesSociais.instagram && (
                        <IconButton
                          href={`https://instagram.com/${redesSociais.instagram.replace('@', '')}`}
                          target="_blank"
                          sx={{ color: '#E1306C' }}
                        >
                          <InstagramIcon />
                        </IconButton>
                      )}
                      {redesSociais.facebook && (
                        <IconButton
                          href={redesSociais.facebook.startsWith('http') ? redesSociais.facebook : `https://facebook.com/${redesSociais.facebook}`}
                          target="_blank"
                          sx={{ color: '#4267B2' }}
                        >
                          <FacebookIcon />
                        </IconButton>
                      )}
                      {redesSociais.whatsapp && (
                        <IconButton
                          href={`https://wa.me/${redesSociais.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          sx={{ color: '#25D366' }}
                        >
                          <WhatsAppIcon />
                        </IconButton>
                      )}
                    </Box>
                  </>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Benefícios */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  🎯 Como funciona?
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Cadastre-se através deste link exclusivo
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Ganhe {config.pontosBoasVindas} pontos de boas-vindas
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Agende seu primeiro serviço
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Após realizar o atendimento, você e quem te indicou ganham {config.pontosIndicacao} pontos cada!
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CadastroIndicacao;
