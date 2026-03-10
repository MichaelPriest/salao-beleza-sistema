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
  GoogleAuthProvider,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

  // Criar ou atualizar usuário no Firestore
  const salvarUsuarioFirestore = async (user, dadosAdicionais = {}) => {
    try {
      const userRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Usuário não existe, criar novo
        const novoUsuario = {
          uid: user.uid,
          nome: dadosAdicionais.nome || user.displayName || 'Usuário',
          email: user.email,
          avatar: user.photoURL || null,
          cargo: 'admin', // Admin por padrão para o primeiro usuário
          permissoes: [
            'admin',
            'gerenciar_usuarios',
            'gerenciar_clientes',
            'gerenciar_agendamentos',
            'gerenciar_servicos',
            'gerenciar_profissionais',
            'gerenciar_estoque',
            'gerenciar_compras',
            'financeiro',
            'visualizar_relatorios',
            'configurar_sistema',
            'visualizar_notificacoes',
            'visualizar_dashboard',
            'gerenciar_atendimentos'
          ],
          telefone: dadosAdicionais.telefone || '',
          dataCadastro: new Date().toISOString(),
          ultimoAcesso: new Date().toISOString(),
          status: 'ativo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(userRef, novoUsuario);
        return novoUsuario;
      } else {
        // Usuário existe, atualizar último acesso
        const usuarioData = userSnap.data();
        await setDoc(userRef, { 
          ...usuarioData,
          ultimoAcesso: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        return { id: user.uid, ...usuarioData };
      }
    } catch (error) {
      console.error('Erro ao salvar usuário no Firestore:', error);
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
      
      // Salvar/atualizar no Firestore
      const usuarioData = await salvarUsuarioFirestore(user);
      
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
      
      // Salvar/atualizar no Firestore
      const usuarioData = await salvarUsuarioFirestore(user);
      
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

  // Criar usuário específico (michael.rodrigoraimundo@gmail.com)
  const criarUsuarioEspecifico = async () => {
    try {
      setLoading(true);
      
      // Criar no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'michael.rodrigoraimundo@gmail.com',
        'C@de367336'
      );
      
      const user = userCredential.user;
      
      // Dados adicionais do usuário
      const usuarioData = {
        uid: user.uid,
        nome: 'Michael Rodrigo Raimundo',
        email: user.email,
        avatar: null,
        cargo: 'admin',
        permissoes: [
          'admin',
          'gerenciar_usuarios',
          'gerenciar_clientes',
          'gerenciar_agendamentos',
          'gerenciar_servicos',
          'gerenciar_profissionais',
          'gerenciar_estoque',
          'gerenciar_compras',
          'financeiro',
          'visualizar_relatorios',
          'configurar_sistema',
          'visualizar_notificacoes',
          'visualizar_dashboard',
          'gerenciar_atendimentos'
        ],
        telefone: '(11) 99999-0001',
        dataCadastro: new Date().toISOString(),
        ultimoAcesso: new Date().toISOString(),
        status: 'ativo'
      };
      
      // Salvar no Firestore
      const userRef = doc(db, 'usuarios', user.uid);
      await setDoc(userRef, usuarioData);
      
      // Salvar no localStorage
      localStorage.setItem('usuario', JSON.stringify(usuarioData));
      
      toast.success('Usuário criado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        // Se já existe, tenta fazer login
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            'michael.rodrigoraimundo@gmail.com',
            'C@de367336'
          );
          
          const user = userCredential.user;
          const userRef = doc(db, 'usuarios', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            localStorage.setItem('usuario', JSON.stringify(userSnap.data()));
          }
          
          toast.success('Login realizado com sucesso!');
          navigate('/');
        } catch (loginError) {
          setError('Erro ao fazer login. Verifique suas credenciais.');
        }
      } else {
        setError('Erro ao criar usuário');
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
                mb: 2,
              }}
            >
              Entrar com Google
            </Button>

            {/* Botão para criar usuário específico (remover em produção) */}
            <Button
              fullWidth
              size="small"
              variant="text"
              onClick={criarUsuarioEspecifico}
              disabled={loading}
              sx={{ mt: 1, color: '#9c27b0' }}
            >
              Criar usuário de teste
            </Button>

            <Typography variant="body2" color="textSecondary" sx={{ mt: 3, textAlign: 'center' }}>
              Use: ana@salao.com / 123456
            </Typography>
          </CardContent>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default ModernLogin;
