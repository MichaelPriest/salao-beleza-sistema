// src/pages/ClienteRecuperarSenha.js
import React, { useEffect, useState } from 'react';
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
import { Email as EmailIcon, ArrowBack as ArrowBackIcon, Lock as LockIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { consumeSupabaseAuthRedirect, getAuth, sendPasswordResetEmail, updatePassword } from '../services/firebase';

function ClienteRecuperarSenha() {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [modoRedefinicao, setModoRedefinicao] = useState(false);
  const [senhaAlterada, setSenhaAlterada] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const tipo = params.get('type');
    const token = params.get('access_token');

    if (tipo === 'recovery' && token) {
      setModoRedefinicao(true);
      consumeSupabaseAuthRedirect().catch((error) => {
        console.error('Erro ao validar link de recuperação:', error);
        setError('Link de recuperação inválido ou expirado. Solicite um novo email.');
      });
    }
  }, []);

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
      setError(error.message || 'Erro ao enviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setError('');

    if (novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(getAuth(), novaSenha);
      setSenhaAlterada(true);
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setError(error.message || 'Erro ao redefinir senha. Solicite um novo link e tente novamente.');
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
              {modoRedefinicao ? 'Criar nova senha' : 'Recuperar Senha'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4, textAlign: 'center' }}>
              {modoRedefinicao
                ? 'Digite uma nova senha para concluir a recuperação'
                : 'Enviaremos um link para redefinir sua senha'}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {senhaAlterada ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                Senha redefinida com sucesso! Você já pode fazer login com a nova senha.
              </Alert>
            ) : modoRedefinicao ? (
              <form onSubmit={handleRedefinirSenha}>
                <TextField
                  fullWidth
                  label="Nova senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirmar nova senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
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
                  {loading ? <CircularProgress size={24} /> : 'Redefinir senha'}
                </Button>
              </form>
            ) : enviado ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                Email enviado! Verifique sua caixa de entrada e clique no link para criar uma nova senha.
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
