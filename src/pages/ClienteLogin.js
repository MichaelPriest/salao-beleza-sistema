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
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Spa as SpaIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthCliente } from '../contexts/AuthClienteContext';

function ClienteLogin() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login, loading } = useAuthCliente();

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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

  const handleVoltar = () => {
    navigate('/');
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
                {loading ? <CircularProgress size={24} /> : 'Entrar'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="textSecondary">
                ou
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
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
                to="/cliente/esqueci-senha"
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
  );
}

export default ClienteLogin;
