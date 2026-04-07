// src/pages/ModernLogin.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Fade,
} from '@mui/material';
import { 
  Spa as SpaIcon, 
  Google as GoogleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabaseAuthService } from '../services/supabaseAuth';

function ModernLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [errorType, setErrorType] = useState('error');
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    senha: ''
  });

  const validarCampos = () => {
    const errors = {
      email: '',
      senha: ''
    };
    let isValid = true;

    if (!formData.email) {
      errors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    if (!formData.senha) {
      errors.senha = 'Senha é obrigatória';
      isValid = false;
    } else if (formData.senha.length < 6) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };



  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetails('');
    
    if (!validarCampos()) {
      setErrorType('warning');
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.senha);
      // 🔥 REDIRECIONAR PARA DASHBOARD
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      
      setErrorType('error');
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setErrorDetails('');

    try {
      setErrorType('info');
      setError('Redirecionando para login Google...');
      supabaseAuthService.signInWithGoogle();
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setErrorType('error');
      setError('Erro no login com Google');
      setErrorDetails('Não foi possível iniciar o login com Google. Tente novamente mais tarde.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setFieldErrors({ ...fieldErrors, [field]: '' });
    setError('');
    setErrorDetails('');
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
      >
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            maxWidth: 400,
            width: '100%',
          }}
        >
          <Box
            sx={{
              bgcolor: '#9c27b0',
              p: 4,
              textAlign: 'center',
            }}
          >
            <SpaIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
              Beauty Pro
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Sistema de Gerenciamento
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Acessar Sistema
            </Typography>

            {error && (
              <Fade in={!!error}>
                <Alert 
                  severity={errorType} 
                  sx={{ mb: 2 }}
                  icon={
                    errorType === 'error' ? <ErrorIcon /> :
                    errorType === 'warning' ? <WarningIcon /> :
                    <InfoIcon />
                  }
                  onClose={() => {
                    setError('');
                    setErrorDetails('');
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {error}
                  </Typography>
                  {errorDetails && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {errorDetails}
                    </Typography>
                  )}
                </Alert>
              </Fade>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                sx={{ mb: 2 }}
                required
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={formData.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                error={!!fieldErrors.senha}
                helperText={fieldErrors.senha}
                sx={{ mb: 3 }}
                required
                disabled={loading}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                  fontSize: '1.1rem',
                  mb: 2,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
              </Button>
            </form>

            <Divider sx={{ my: 2 }}>ou</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                py: 1.5,
                borderColor: '#9c27b0',
                color: '#9c27b0',
                '&:hover': {
                  borderColor: '#ff4081',
                  backgroundColor: 'rgba(156,39,176,0.04)',
                },
                opacity: loading ? 0.5 : 1,
              }}
            >
              Entrar com Google
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                © 2026 Beauty Pro - Todos os direitos reservados
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default ModernLogin;
