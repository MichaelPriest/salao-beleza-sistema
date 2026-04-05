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
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [config, setConfig] = useState({ pontosIndicacao: 100 });

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    senha: '',
  });

  // Carregar dados da indicação
  useEffect(() => {
    const carregarIndicacao = async () => {
      if (!indicacaoId) {
        setErroIndicacao('Link de indicação inválido');
        setCarregandoIndicacao(false);
        return;
      }

      try {
        // Buscar indicação
        const indicacoes = await firebaseService.query('indicacoes', [
          { field: 'id', operator: '==', value: indicacaoId }
        ]);
        
        let indicacaoEncontrada = indicacoes?.[0];
        
        if (!indicacaoEncontrada) {
          // Tentar buscar por documentId
          try {
            indicacaoEncontrada = await firebaseService.getById('indicacoes', indicacaoId);
          } catch (e) {
            console.error('Erro ao buscar indicação por ID:', e);
          }
        }

        if (!indicacaoEncontrada) {
          setErroIndicacao('Indicação não encontrada ou expirada');
          setCarregandoIndicacao(false);
          return;
        }

        // Verificar se indicação expirou
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
        
        // Pré-preencher dados se fornecidos
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
        console.error('Erro ao carregar indicação:', error);
        setErroIndicacao('Erro ao carregar dados da indicação');
      } finally {
        setCarregandoIndicacao(false);
      }
    };

    carregarIndicacao();
    carregarConfiguracoes();
  }, [indicacaoId]);

  const carregarConfiguracoes = async () => {
    try {
      const configs = await firebaseService.getAll('config_fidelidade');
      if (configs && configs.length > 0) {
        setConfig(configs[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    const numeros = cpf.replace(/\D/g, '');
    if (numeros.length !== 11) return false;
    
    // Validação básica de CPF
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
        cpf: formData.cpf || '',
        dataNascimento: formData.dataNascimento || '',
        status: 'Novo',
        nivelFidelidade: 'bronze',
        totalPontos: 0,
        totalGasto: 0,
        dataCadastro: hoje,
        indicadoPor: indicacao?.clienteId,
        indicadoPorNome: indicacao?.clienteNome,
        dataIndicacao: agora.toISOString(),
        createdAt: agora.toISOString(),
        updatedAt: agora.toISOString(),
      };

      const clienteId = await firebaseService.add('clientes', novoCliente);

      // Atualizar indicação
      await firebaseService.update('indicacoes', indicacao.id, {
        clienteIndicadoId: clienteId,
        clienteIndicadoNome: formData.nome,
        clienteIndicadoEmail: formData.email,
        clienteIndicadoTelefone: formData.telefone,
        status: 'confirmada',
        dataConfirmacao: agora.toISOString(),
        pontosGanhos: config.pontosIndicacao,
        updatedAt: agora.toISOString(),
      });

      // Adicionar pontos para o indicador
      await firebaseService.add('pontuacao', {
        clienteId: indicacao.clienteId,
        clienteNome: indicacao.clienteNome,
        quantidade: config.pontosIndicacao,
        tipo: 'credito',
        motivo: `Bônus por indicação de ${formData.nome}`,
        data: agora.toISOString(),
        indicacaoId: indicacao.id,
        createdAt: agora.toISOString(),
      });

      // Adicionar pontos de boas-vindas para o novo cliente (opcional)
      await firebaseService.add('pontuacao', {
        clienteId: clienteId,
        clienteNome: formData.nome,
        quantidade: 50,
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
                Seja bem-vindo(a) ao nosso salão! Você recebeu 50 pontos de boas-vindas.
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
              <Chip
                icon={<StarIcon />}
                label={`Ganhe ${config.pontosIndicacao} pontos no primeiro atendimento`}
                sx={{ mt: 2, bgcolor: '#fff3e0', color: '#ff9800' }}
              />
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
                  <Grid item xs={12}>
                    <MaskedInput
                      mask="cpf"
                      label="CPF"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
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
                  <Grid item xs={12}>
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
                  <Grid item xs={12}>
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
                    </Grid>
                  </Paper>

                  <Alert severity="info" icon={<TrophyIcon />}>
                    <Typography variant="body2">
                      <strong>Benefícios de se cadastrar:</strong>
                      <br />
                      • 50 pontos de boas-vindas
                      <br />
                      • {config.pontosIndicacao} pontos extras quando realizar o primeiro atendimento
                      <br />
                      • Programa de fidelidade com descontos exclusivos
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
    </Container>
  );
}

export default CadastroIndicacao;
