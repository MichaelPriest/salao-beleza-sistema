// src/pages/ClienteLogin.js
import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Spa as SpaIcon,
  ArrowBack as ArrowBackIcon,
  Google as GoogleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as WcIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { firebaseService } from '../services/firebase';
import { formatarCPF, removerMascaraCPF, validarCPF } from '../utils/cpfUtils';

function ClienteLogin() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login, loginComGoogle, loading } = useAuthCliente();

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // 🔥 ESTADOS PARA CADASTRO COMPLEMENTAR APÓS LOGIN GOOGLE
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.senha) {
      setError('Preencha todos os campos');
      return;
    }

    const success = await login(formData.email, formData.senha);
    if (success) {
      navigate('/cliente/dashboard');
    }
  };

  // 🔥 FUNÇÃO PARA BUSCAR ENDEREÇO PELO CEP
  const buscarCep = async (cep) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
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

  // 🔥 VALIDAÇÃO E FORMATAÇÃO DE CPF
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

  // 🔥 LOGIN COM GOOGLE - AGORA COM VERIFICAÇÃO POR CPF
  const handleGoogleLogin = async () => {
    try {
      const result = await loginComGoogle();
      
      // Se o login foi bem-sucedido e o cliente já existe
      if (result && result.success) {
        navigate('/cliente/dashboard');
        return;
      }
      
      // Se o usuário do Google não tem cadastro completo, abrir modal
      if (result && result.needCompletion) {
        setGoogleUserData(result.userData);
        setOpenCadastroComplementar(true);
      }
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setError('Erro ao fazer login com Google');
    }
  };

  // 🔥 COMPLETAR CADASTRO APÓS LOGIN GOOGLE
  const handleCompletarCadastro = async () => {
    // Validar CPF
    const cpfLimpo = removerMascaraCPF(dadosComplementares.cpf);
    if (!validarCPF(cpfLimpo)) {
      setCpfError('CPF inválido');
      return;
    }

    // Verificar se CPF já está cadastrado
    try {
      setLoadingComplementar(true);
      
      // Buscar cliente por CPF
      const clientesPorCpf = await firebaseService.query('clientes', [
        { field: 'cpf', operator: '==', value: dadosComplementares.cpf }
      ]);

      if (clientesPorCpf && clientesPorCpf.length > 0) {
        // CPF já cadastrado - vincular conta Google ao cliente existente
        const clienteExistente = clientesPorCpf[0];
        
        // Atualizar o cliente com o UID do Google
        await firebaseService.update('clientes', clienteExistente.id, {
          googleUid: googleUserData.uid,
          foto: googleUserData.foto || clienteExistente.foto,
          ultimoAcesso: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Salvar no localStorage
        const clienteCompleto = {
          ...clienteExistente,
          googleUid: googleUserData.uid,
          foto: googleUserData.foto || clienteExistente.foto
        };
        
        localStorage.setItem('cliente', JSON.stringify(clienteCompleto));
        
        setOpenCadastroComplementar(false);
        navigate('/cliente/dashboard');
        return;
      }

      // Se não encontrou CPF, criar novo cliente com todos os dados
      const novoCliente = {
        id: googleUserData.uid,
        nome: googleUserData.nome,
        email: googleUserData.email,
        foto: googleUserData.foto,
        cpf: dadosComplementares.cpf,
        telefone: dadosComplementares.telefone,
        dataNascimento: dadosComplementares.dataNascimento,
        genero: dadosComplementares.genero,
        cep: dadosComplementares.cep,
        logradouro: dadosComplementares.logradouro,
        numero: dadosComplementares.numero,
        complemento: dadosComplementares.complemento,
        bairro: dadosComplementares.bairro,
        cidade: dadosComplementares.cidade,
        estado: dadosComplementares.estado,
        googleUid: googleUserData.uid,
        dataCadastro: new Date().toISOString().split('T')[0],
        ultimaVisita: null,
        totalGasto: 0,
        status: 'Regular',
        preferencias: {
          notificacoes: true,
          profissionalPreferido: '',
          servicosPreferidos: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await firebaseService.set('clientes', googleUserData.uid, novoCliente);
      
      // Salvar no localStorage
      localStorage.setItem('cliente', JSON.stringify(novoCliente));
      
      setOpenCadastroComplementar(false);
      navigate('/cliente/dashboard');
      
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
    
    // Se for CEP, buscar endereço
    if (name === 'cep' && value.length === 8) {
      buscarCep(value);
    }
  };

  const handleVoltar = () => {
    navigate('/');
  };

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
          style={{ width: '100%', maxWidth: 450 }}
        >
          <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
            {/* Header com logo */}
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
              
              <SpaIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                BeautyPro
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Área do Cliente
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                Login
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* BOTÃO DE LOGIN COM GOOGLE */}
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
                  to="/cliente/cadastro"
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
                  to="/cliente/recuperar-senha"
                  variant="body2"
                  sx={{ color: '#9c27b0', cursor: 'pointer' }}
                >
                  Esqueci minha senha
                </Link>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>

      {/* 🔥 DIALOG DE CADASTRO COMPLEMENTAR APÓS LOGIN GOOGLE */}
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
            {/* CPF - Campo obrigatório para evitar duplicatas */}
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Telefone */}
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

            {/* Data de Nascimento */}
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

            {/* Gênero */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Gênero</InputLabel>
                <Select
                  name="genero"
                  value={dadosComplementares.genero}
                  onChange={handleDadosComplementaresChange}
                  label="Gênero"
                  startAdornment={
                    <InputAdornment position="start">
                      <WcIcon color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="feminino">Feminino</MenuItem>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="outro">Outro</MenuItem>
                  <MenuItem value="nao_informar">Prefiro não informar</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* CEP */}
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

            {/* Logradouro */}
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

            {/* Número */}
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

            {/* Complemento */}
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

            {/* Bairro */}
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

            {/* Cidade */}
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

            {/* Estado */}
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
            disabled={loadingComplementar || !dadosComplementares.cpf || cpfError}
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
