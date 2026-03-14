// src/pages/ClienteCadastro.js
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
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Spa as SpaIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { masks, MaskedInput } from '../utils/plugins';

const steps = ['Dados Pessoais', 'Login', 'Preferências', 'Confirmação'];

function ClienteCadastro() {
  const navigate = useNavigate();
  const { cadastrar, loading } = useAuthCliente();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    
    // Login
    senha: '',
    confirmarSenha: '',
    
    // Preferências
    genero: '',
    profissionalPreferido: '',
    servicosPreferidos: [],
    receberPromocoes: true,
    
    // Endereço (opcional)
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleNext = () => {
    // Validações por etapa
    if (activeStep === 0) {
      if (!formData.nome || !formData.email || !formData.telefone) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
      if (!formData.email.includes('@')) {
        setError('Email inválido');
        return;
      }
    }

    if (activeStep === 1) {
      if (!formData.senha || !formData.confirmarSenha) {
        setError('Preencha todos os campos');
        return;
      }
      if (formData.senha.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (formData.senha !== formData.confirmarSenha) {
        setError('As senhas não conferem');
        return;
      }
    }

    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    try {
      const success = await cadastrar(formData);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/cliente/login');
        }, 3000);
      }
    } catch (err) {
      setError('Erro ao realizar cadastro. Tente novamente.');
    }
  };

  const handleVoltar = () => {
    navigate('/');
  };

  const servicosDisponiveis = [
    'Corte de Cabelo',
    'Manicure',
    'Pedicure',
    'Coloração',
    'Hidratação',
    'Maquiagem',
    'Design de Sobrancelhas',
    'Depilação',
  ];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo *"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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

            <Grid item xs={12} md={6}>
              <MaskedInput
                mask="telefone"
                label="Telefone *"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
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
              <MaskedInput
                mask="cpf"
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
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
              <MaskedInput
                mask="data"
                label="Data de Nascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
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
              <FormControl fullWidth>
                <InputLabel>Gênero</InputLabel>
                <Select
                  name="genero"
                  value={formData.genero}
                  label="Gênero"
                  onChange={handleChange}
                >
                  <MenuItem value="F">Feminino</MenuItem>
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="O">Outro</MenuItem>
                  <MenuItem value="N">Prefiro não informar</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha *"
                name="senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={handleChange}
                required
                helperText="Mínimo de 6 caracteres"
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
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmar Senha *"
                name="confirmarSenha"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                error={formData.senha !== formData.confirmarSenha && formData.confirmarSenha !== ''}
                helperText={
                  formData.senha !== formData.confirmarSenha && formData.confirmarSenha !== ''
                    ? 'As senhas não conferem'
                    : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Profissional Preferido</InputLabel>
                <Select
                  name="profissionalPreferido"
                  value={formData.profissionalPreferido}
                  label="Profissional Preferido"
                  onChange={handleChange}
                >
                  <MenuItem value="">Nenhum em específico</MenuItem>
                  <MenuItem value="joana">Joana Silva</MenuItem>
                  <MenuItem value="carlos">Carlos Santos</MenuItem>
                  <MenuItem value="ana">Ana Oliveira</MenuItem>
                  <MenuItem value="marcos">Marcos Souza</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Serviços de Interesse</InputLabel>
                <Select
                  multiple
                  name="servicosPreferidos"
                  value={formData.servicosPreferidos}
                  onChange={handleChange}
                  label="Serviços de Interesse"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {servicosDisponiveis.map((servico) => (
                    <MenuItem key={servico} value={servico}>
                      {servico}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#9c27b0' }}>
                Endereço (opcional)
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <MaskedInput
                mask="cep"
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Logradouro"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={8} md={2}>
              <TextField
                fullWidth
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={4} md={1}>
              <TextField
                fullWidth
                label="UF"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                inputProps={{ maxLength: 2 }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {success ? (
              <>
                <CheckIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Cadastro realizado com sucesso!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Você será redirecionado para a página de login em instantes...
                </Typography>
              </>
            ) : (
              <>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#9c27b0',
                    margin: '0 auto 16px',
                  }}
                >
                  <SpaIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Revise seus dados
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 2, textAlign: 'left' }}>
                  <Typography variant="subtitle2" color="primary">
                    Dados Pessoais
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nome:</strong> {formData.nome}<br />
                    <strong>Email:</strong> {formData.email}<br />
                    <strong>Telefone:</strong> {formData.telefone}<br />
                    <strong>CPF:</strong> {formData.cpf || 'Não informado'}<br />
                    <strong>Data Nasc.:</strong> {formData.dataNascimento || 'Não informada'}
                  </Typography>

                  {formData.servicosPreferidos.length > 0 && (
                    <>
                      <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                        Serviços de Interesse
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {formData.servicosPreferidos.map(servico => (
                          <Chip key={servico} label={servico} size="small" />
                        ))}
                      </Box>
                    </>
                  )}
                </Paper>
              </>
            )}
          </Box>
        );

      default:
        return 'Passo desconhecido';
    }
  };

  return (
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
        style={{ width: '100%', maxWidth: 800 }}
      >
        <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
              color: 'white',
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
            
            <Box sx={{ textAlign: 'center' }}>
              <SpaIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                BeautyPro
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Crie sua conta
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || success}
              >
                Voltar
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || success}
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
                    sx={{
                      background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                    }}
                  >
                    Próximo
                  </Button>
                )}
              </Box>
            </Box>

            {activeStep === 0 && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Já tem uma conta?{' '}
                  <Link
                    component={RouterLink}
                    to="/cliente/login"
                    sx={{ color: '#9c27b0', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Faça login
                  </Link>
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

export default ClienteCadastro;
