// src/pages/ClienteLogin.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link,
  Divider,
  Paper,
  Avatar,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Spa as SpaIcon,
  ArrowBack as ArrowBackIcon,
  Google as GoogleIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  FormatQuote as FormatQuoteIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { saasService } from '../services/saasService';
import { formatarCPF, removerMascaraCPF, validarCPF } from '../utils/cpfUtils';


const getEmpresaLogo = (empresa = {}) => empresa?.sitePublico?.logo
  || empresa?.logo
  || empresa?.logoBase64
  || empresa?.logoUrl
  || empresa?.configuracoes?.salao?.logo
  || '';

function ClienteLogin() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login, loginComGoogle, completarCadastroGoogle, loading, isAuthenticated, cliente } = useAuthCliente();

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [empresaPublica, setEmpresaPublica] = useState(null);
  const [depoimentoAtual, setDepoimentoAtual] = useState(0);
  
  const [openCadastroComplementar, setOpenCadastroComplementar] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [dadosComplementares, setDadosComplementares] = useState({
    cpf: '',
    telefone: '',
    dataNascimento: '',
    genero: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  const [loadingComplementar, setLoadingComplementar] = useState(false);
  const [cpfError, setCpfError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const redirectType = params.get('type') || window.sessionStorage.getItem('supabase.auth.redirect_type');
    if (redirectType === 'signup') {
      setSuccess('Email confirmado com sucesso! Você já pode acessar sua área do cliente.');
      window.sessionStorage.removeItem('supabase.auth.redirect_type');
    }
  }, []);

  useEffect(() => {
    const carregarEmpresaPublica = async () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('empresa') || window.sessionStorage.getItem('empresa_publica_slug');
      if (!slug) {
        console.log('❌ Nenhum slug de empresa encontrado na URL');
        return;
      }
      
      console.log('🔍 Buscando empresa por slug:', slug);
      const empresa = await saasService.buscarEmpresaPorSlug(slug).catch((err) => {
        console.error('Erro ao buscar empresa:', err);
        return null;
      });
      
      if (!empresa) {
        console.log('❌ Empresa não encontrada para o slug:', slug);
        return;
      }
      
      console.log('✅ Empresa encontrada:', empresa.id, empresa.nome);
      saasService.setContextoAtual({ empresa });
      setEmpresaPublica(empresa);
      window.sessionStorage.setItem('empresa_publica_slug', slug);
      window.sessionStorage.setItem('empresa_publica_id', empresa.id);
      window.sessionStorage.setItem('empresa_publica_nome', empresa.nome || '');
    };

    carregarEmpresaPublica();
  }, []);

  // Monitorar autenticação
  useEffect(() => {
    console.log('🔍 Monitorando autenticação - isAuthenticated:', isAuthenticated, 'cliente:', cliente);
    if (isAuthenticated && cliente) {
      console.log('✅ Cliente autenticado, redirecionando para dashboard');
      setTimeout(() => {
        navigate('/cliente/dashboard');
      }, 500);
    }
  }, [isAuthenticated, cliente, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.senha) {
      setError('Preencha todos os campos');
      return;
    }

    const empresaId = empresaPublica?.id || window.sessionStorage.getItem('empresa_publica_id');
    if (!empresaId) {
      setError('Acesse pelo link da empresa/salão para entrar na área do cliente.');
      return;
    }

    console.log('🔐 Tentando login com email:', formData.email, 'empresaId:', empresaId);
    
    const result = await login(formData.email, formData.senha, { 
      empresaId, 
      empresaNome: empresaPublica?.nome 
    });
    
    console.log('📊 Resultado do login:', result);
    
    if (result?.success) {
      setSuccess('Login realizado com sucesso! Redirecionando...');
    } else if (result?.error) {
      setError(result.error === 'cliente_fora_do_tenant' 
        ? 'Conta não encontrada para esta empresa. Verifique se você está no link correto do salão.'
        : 'Email ou senha inválidos');
    }
  };

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setDadosComplementares(prev => ({
            ...prev,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleCpfChange = (e) => {
    const cpfFormatado = formatarCPF(e.target.value);
    setDadosComplementares({ ...dadosComplementares, cpf: cpfFormatado });
    
    if (cpfFormatado.length === 14) {
      const cpfLimpo = removerMascaraCPF(cpfFormatado);
      if (!validarCPF(cpfLimpo)) {
        setCpfError('CPF inválido');
      } else {
        setCpfError('');
      }
    } else {
      setCpfError('');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      
      const empresaId = empresaPublica?.id || window.sessionStorage.getItem('empresa_publica_id');
      if (!empresaId) {
        setError('Acesse pelo link da empresa/salão para entrar com Google.');
        return;
      }

      console.log('🔐 Tentando login com Google para empresa:', empresaId);
      
      const result = await loginComGoogle({ 
        empresaId, 
        empresaNome: empresaPublica?.nome 
      });
      
      console.log('📊 Resultado do login Google:', result);
      
      if (result?.success) {
        console.log('✅ Login Google bem-sucedido!');
        setSuccess('Login realizado com sucesso! Redirecionando...');
        return;
      }
      
      if (result?.needCompletion) {
        console.log('📝 Usuário Google não encontrado, abrindo cadastro complementar');
        setGoogleUserData(result.userData);
        setOpenCadastroComplementar(true);
      }
      
      if (result?.error) {
        setError('Erro ao fazer login com Google: ' + result.error);
      }
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setError('Erro ao fazer login com Google. Tente novamente.');
    }
  };

  const handleCompletarCadastro = async () => {
    const cpfLimpo = removerMascaraCPF(dadosComplementares.cpf);
    if (!validarCPF(cpfLimpo)) {
      setCpfError('CPF inválido');
      return;
    }

    try {
      setLoadingComplementar(true);
      
      console.log('📝 Completando cadastro para:', googleUserData?.email);
      console.log('📝 Dados complementares:', dadosComplementares);
      
      const empresaId = empresaPublica?.id || window.sessionStorage.getItem('empresa_publica_id');
      
      const result = await completarCadastroGoogle({ 
        ...dadosComplementares, 
        empresaId, 
        empresaNome: empresaPublica?.nome 
      });
      
      console.log('📊 Resultado do completar cadastro:', result);
      
      if (result?.success) {
        console.log('✅ Cadastro completado com sucesso!');
        setOpenCadastroComplementar(false);
        setSuccess('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          navigate('/cliente/dashboard');
        }, 1500);
      } else {
        setError('Erro ao completar cadastro. Tente novamente.');
      }
      
    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
      setError('Erro ao completar cadastro. Tente novamente.');
    } finally {
      setLoadingComplementar(false);
    }
  };

  const handleDadosComplementaresChange = (e) => {
    const { name, value } = e.target;
    setDadosComplementares(prev => ({ ...prev, [name]: value }));
    
    if (name === 'cep') {
      const cepLimpo = value.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        buscarCep(cepLimpo);
      }
    }
  };

  const handleVoltar = () => {
    navigate('/');
  };

  const sitePublicoCliente = empresaPublica?.sitePublico || {};
  const depoimentosConfigurados = Array.isArray(sitePublicoCliente.depoimentos)
    ? sitePublicoCliente.depoimentos.filter((depoimento) => depoimento?.nome || depoimento?.texto)
    : [];
  const depoimentoDestaque = sitePublicoCliente.depoimentoDestaque
    ? [{ nome: 'Cliente satisfeito', texto: sitePublicoCliente.depoimentoDestaque }]
    : [];
  const depoimentosLogin = depoimentosConfigurados.length > 0 ? depoimentosConfigurados : depoimentoDestaque;

  useEffect(() => {
    if (depoimentosLogin.length <= 1) {
      setDepoimentoAtual(0);
      return undefined;
    }

    const interval = setInterval(() => {
      setDepoimentoAtual((atual) => (atual + 1) % depoimentosLogin.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [depoimentosLogin.length]);

  const depoimentoAtivo = depoimentosLogin[depoimentoAtual] || depoimentosLogin[0];

  const empresaSlug = empresaPublica?.slug || window.sessionStorage.getItem('empresa_publica_slug') || '';
  const tenantQuery = empresaSlug ? `?empresa=${encodeURIComponent(empresaSlug)}` : '';
  const empresaLogo = getEmpresaLogo(empresaPublica);

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
          p: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: depoimentoAtivo ? 980 : 450 }}
        >
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={depoimentoAtivo ? 6 : 12}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden', height: '100%' }}>
                <Box
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
                    color: 'white',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <IconButton
                    onClick={handleVoltar}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: 16,
                      color: 'white',
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>

                  {empresaLogo ? (
                    <Avatar
                      src={empresaLogo}
                      alt={empresaPublica?.nome || 'Logo da empresa'}
                      sx={{
                        width: 76,
                        height: 76,
                        mx: 'auto',
                        mb: 1.5,
                        bgcolor: 'white',
                        border: '3px solid rgba(255,255,255,0.75)',
                        '& img': { objectFit: 'contain', p: 0.75 },
                      }}
                    />
                  ) : (
                    <SpaIcon sx={{ fontSize: 48, mb: 1 }} />
                  )}
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {empresaPublica?.nome || 'BeautyPro'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Área do Cliente
                  </Typography>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                    Login
                  </Typography>

                  {empresaPublica ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Acessando área do cliente de <strong>{empresaPublica.nome}</strong>.
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      Use o link da empresa ou salão para entrar. Assim sua conta fica vinculada ao tenant correto.
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      {success}
                    </Alert>
                  )}

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    startIcon={<GoogleIcon />}
                    sx={{
                      mb: 2,
                      py: 1.5,
                      borderColor: '#ddd',
                      color: '#333',
                      '&:hover': {
                        borderColor: '#9c27b0',
                        backgroundColor: 'rgba(156,39,176,0.04)',
                      },
                    }}
                  >
                    Continuar com Google
                  </Button>

                  <Box sx={{ position: 'relative', my: 3 }}>
                    <Divider>
                      <Typography variant="body2" color="textSecondary" sx={{ px: 1 }}>
                        ou
                      </Typography>
                    </Divider>
                  </Box>

                  <form onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      margin="normal"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Senha"
                      name="senha"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.senha}
                      onChange={handleChange}
                      margin="normal"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        mt: 3,
                        mb: 2,
                        py: 1.5,
                        background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                        fontSize: '1.1rem',
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Entrar com Email'}
                    </Button>
                  </form>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Não tem uma conta?
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/cliente/cadastro${tenantQuery}`}
                      variant="outlined"
                      fullWidth
                      sx={{
                        mt: 1,
                        borderColor: '#9c27b0',
                        color: '#9c27b0',
                        '&:hover': {
                          borderColor: '#ff4081',
                          backgroundColor: 'rgba(156,39,176,0.04)',
                        },
                      }}
                    >
                      Criar nova conta
                    </Button>
                  </Box>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Link
                      component={RouterLink}
                      to={`/cliente/recuperar-senha${tenantQuery}`}
                      variant="body2"
                      sx={{ color: '#9c27b0', cursor: 'pointer' }}
                    >
                      Esqueci minha senha
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {depoimentoAtivo && (
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    minHeight: isMobile ? 260 : 520,
                    borderRadius: 4,
                    p: { xs: 3, md: 4 },
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(145deg, rgba(76,0,130,0.95), rgba(255,64,129,0.88))',
                    border: '1px solid rgba(255,255,255,0.28)',
                    boxShadow: '0 24px 70px rgba(74, 0, 103, 0.32)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <FormatQuoteIcon sx={{ position: 'absolute', right: 24, top: 18, fontSize: 82, opacity: 0.16 }} />
                  <Box>
                    <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.82 }}>
                      Depoimentos
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
                      Clientes que confiam em {empresaPublica?.nome || 'nosso salão'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 3 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} sx={{ color: '#ffd54f' }} />
                      ))}
                    </Box>
                    <Typography variant="h6" sx={{ lineHeight: 1.65, fontWeight: 500 }}>
                      “{depoimentoAtivo.texto || 'Atendimento incrível e experiência completa do início ao fim.'}”
                    </Typography>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4 }}>
                      <Avatar
                        src={depoimentoAtivo.foto || depoimentoAtivo.avatar || ''}
                        sx={{ width: 58, height: 58, bgcolor: 'rgba(255,255,255,0.22)', fontWeight: 800 }}
                      >
                        {(depoimentoAtivo.nome || 'C').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {depoimentoAtivo.nome || 'Cliente'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.78 }}>
                          Depoimento publicado na área do cliente
                        </Typography>
                      </Box>
                    </Box>

                    {depoimentosLogin.length > 1 && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                        {depoimentosLogin.map((_, index) => (
                          <Box
                            key={index}
                            onClick={() => setDepoimentoAtual(index)}
                            sx={{
                              width: depoimentoAtual === index ? 30 : 10,
                              height: 10,
                              borderRadius: 999,
                              bgcolor: depoimentoAtual === index ? 'white' : 'rgba(255,255,255,0.45)',
                              cursor: 'pointer',
                              transition: 'all 0.25s ease',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </motion.div>
      </Box>

      <Dialog 
        open={openCadastroComplementar} 
        onClose={() => setOpenCadastroComplementar(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Complete seu Cadastro
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Olá {googleUserData?.nome}! Para finalizar seu cadastro, precisamos de mais algumas informações.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPF *"
                name="cpf"
                value={dadosComplementares.cpf}
                onChange={handleCpfChange}
                error={!!cpfError}
                helperText={cpfError || 'Digite apenas números'}
                size="small"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={dadosComplementares.telefone}
                onChange={handleDadosComplementaresChange}
                size="small"
                placeholder="(11) 99999-9999"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Data de Nascimento"
                name="dataNascimento"
                value={dadosComplementares.dataNascimento}
                onChange={handleDadosComplementaresChange}
                InputLabelProps={{ shrink: true }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CakeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Gênero</InputLabel>
                <Select
                  name="genero"
                  value={dadosComplementares.genero}
                  onChange={handleDadosComplementaresChange}
                  label="Gênero"
                >
                  <MenuItem value="feminino">Feminino</MenuItem>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="outro">Outro</MenuItem>
                  <MenuItem value="nao_informar">Prefiro não informar</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CEP"
                name="cep"
                value={dadosComplementares.cep}
                onChange={handleDadosComplementaresChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Logradouro"
                name="logradouro"
                value={dadosComplementares.logradouro}
                onChange={handleDadosComplementaresChange}
                size="small"
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Número"
                name="numero"
                value={dadosComplementares.numero}
                onChange={handleDadosComplementaresChange}
                size="small"
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Complemento"
                name="complemento"
                value={dadosComplementares.complemento}
                onChange={handleDadosComplementaresChange}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bairro"
                name="bairro"
                value={dadosComplementares.bairro}
                onChange={handleDadosComplementaresChange}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cidade"
                name="cidade"
                value={dadosComplementares.cidade}
                onChange={handleDadosComplementaresChange}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="UF"
                name="estado"
                value={dadosComplementares.estado}
                onChange={handleDadosComplementaresChange}
                size="small"
                inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCadastroComplementar(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCompletarCadastro}
            disabled={loadingComplementar || !dadosComplementares.cpf || !!cpfError}
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
          >
            {loadingComplementar ? <CircularProgress size={24} /> : 'Finalizar Cadastro'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ClienteLogin;
