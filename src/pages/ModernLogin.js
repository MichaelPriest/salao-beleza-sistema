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
} from '@mui/material';
import { 
  Spa as SpaIcon, 
  Google as GoogleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

function ModernLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });

  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  // Verificar se usuário existe no Firestore
  const verificarUsuarioFirestore = async (user) => {
    try {
      const userRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log('❌ Usuário não encontrado no Firestore:', user.uid);
        return null;
      }

      const usuarioData = userSnap.data();
      
      // Verificar se usuário está ativo
      if (usuarioData.status !== 'ativo') {
        console.log('❌ Usuário inativo:', user.uid);
        return { error: 'inativo' };
      }

      // Atualizar último acesso
      await setDoc(userRef, { 
        ...usuarioData,
        ultimoAcesso: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return { id: user.uid, ...usuarioData };
    } catch (error) {
      console.error('Erro ao verificar usuário no Firestore:', error);
      throw error;
    }
  };

  // Login com email/senha
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.senha
      );
      
      const user = userCredential.user;
      
      // Verificar se usuário existe no Firestore
      const usuarioData = await verificarUsuarioFirestore(user);
      
      if (!usuarioData) {
        // Usuário não encontrado no Firestore - fazer logout
        await auth.signOut();
        setError('Acesso negado! Usuário não cadastrado no sistema.');
        setLoading(false);
        return;
      }

      if (usuarioData.error === 'inativo') {
        await auth.signOut();
        setError('Usuário inativo. Contate o administrador.');
        setLoading(false);
        return;
      }
      
      // Salvar no localStorage
      localStorage.setItem('usuario', JSON.stringify(usuarioData));
      
      toast.success(`Bem-vindo, ${usuarioData.nome}!`);
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Email ou senha inválidos');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Erro de conexão. Verifique sua internet');
      } else {
        setError('Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Verificar se usuário existe no Firestore
      const usuarioData = await verificarUsuarioFirestore(user);
      
      if (!usuarioData) {
        // Usuário não encontrado no Firestore - fazer logout
        await auth.signOut();
        setError('Acesso negado! Usuário não cadastrado no sistema.');
        setLoading(false);
        return;
      }

      if (usuarioData.error === 'inativo') {
        await auth.signOut();
        setError('Usuário inativo. Contate o administrador.');
        setLoading(false);
        return;
      }
      
      // Salvar no localStorage
      localStorage.setItem('usuario', JSON.stringify(usuarioData));
      
      toast.success(`Bem-vindo, ${usuarioData.nome}!`);
      navigate('/');
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setError('Erro ao fazer login com Google');
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
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                sx={{ mb: 3 }}
                required
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
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Entrar'}
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
              }}
            >
              Entrar com Google
            </Button>

            {/* FOOTER - Sem informações de teste */}
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
