// src/pages/ClienteRecuperarSenha.js
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
  Link,
  InputAdornment,
} from '@mui/material';
import { Email as EmailIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

function ClienteRecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setEnviado(true);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      if (error.code === 'auth/user-not-found') {
        setError('Email não encontrado');
      } else {
        setError('Erro ao enviar email. Tente novamente.');
      }
    } finally {
      setLoading(false);
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
        style={{ width: '100%', maxWidth: 450 }}
      >
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Button
                component={RouterLink}
                to="/cliente/login"
                startIcon={<ArrowBackIcon />}
                sx={{ color: '#9c27b0' }}
              >
                Voltar
              </Button>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
              Recuperar Senha
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4, textAlign: 'center' }}>
              Enviaremos um link para redefinir sua senha
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {enviado ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                Email enviado! Verifique sua caixa de entrada.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
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
                    py: 1.5,
                    background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Enviar'}
                </Button>
              </form>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Lembrou sua senha?{' '}
                <Link
                  component={RouterLink}
                  to="/cliente/login"
                  sx={{ color: '#9c27b0', cursor: 'pointer', fontWeight: 600 }}
                >
                  Faça login
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

export default ClienteRecuperarSenha;
