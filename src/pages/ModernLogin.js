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
  const [errorDetails, setErrorDetails] = useState('');
  const [errorType, setErrorType] = useState('error'); // 'error', 'warning', 'info'
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    senha: ''
  });

  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  // Validar campos do formulário
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

  // Verificar se usuário existe no Firestore
  const verificarUsuarioFirestore = async (user) => {
    try {
      const userRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log('❌ Usuário não encontrado no Firestore:', user.uid);
        return { 
          error: true, 
          type: 'not_found',
          message: 'Usuário não cadastrado no sistema. Contate o administrador.' 
        };
      }

      const usuarioData = userSnap.data();
      
      // Verificar se usuário está ativo
      if (usuarioData.status !== 'ativo') {
        console.log('❌ Usuário inativo:', user.uid);
        return { 
          error: true, 
          type: 'inactive',
          message: 'Usuário inativo. Contate o administrador para reativar seu acesso.' 
        };
      }

      // Atualizar último acesso
      await setDoc(userRef, { 
        ...usuarioData,
        ultimoAcesso: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return { success: true, data: { id: user.uid, ...usuarioData } };
    } catch (error) {
      console.error('Erro ao verificar usuário no Firestore:', error);
      return { 
        error: true, 
        type: 'database',
        message: 'Erro ao verificar dados do usuário. Tente novamente.' 
      };
    }
  };

  // Login com email/senha
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetails('');
    
    // Validar campos
    if (!validarCampos()) {
      setErrorType('warning');
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.senha
      );
      
      const user = userCredential.user;
      
      // Verificar se usuário existe no Firestore
      const resultado = await verificarUsuarioFirestore(user);
      
      if (resultado.error) {
        // Usuário não autorizado - fazer logout
        await auth.signOut();
        
        setErrorType(resultado.type === 'not_found' ? 'error' : 'warning');
        setError(resultado.message);
        
        if (resultado.type === 'not_found') {
          setErrorDetails('Seu email está autenticado no Google, mas não possui cadastro no sistema.');
        } else if (resultado.type === 'inactive') {
          setErrorDetails('Seu acesso foi desativado. Entre em contato com o administrador.');
        }
        
        setLoading(false);
        return;
      }
      
      // Salvar no localStorage
      localStorage.setItem('usuario', JSON.stringify(resultado.data));
      
      toast.success(`Bem-vindo, ${resultado.data.nome}!`);
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Mapear erros do Firebase Auth
      const errorMap = {
        'auth/user-not-found': {
          message: 'Email não encontrado',
          details: 'Verifique se o email está correto ou cadastre-se no sistema.'
        },
        'auth/wrong-password': {
          message: 'Senha incorreta',
          details: 'Verifique sua senha e tente novamente.'
        },
        'auth/invalid-email': {
          message: 'Email inválido',
          details: 'Digite um endereço de email válido.'
        },
        'auth/user-disabled': {
          message: 'Usuário desabilitado',
          details: 'Sua conta foi desativada. Contate o administrador.'
        },
        'auth/too-many-requests': {
          message: 'Muitas tentativas',
          details: 'Acesso temporariamente bloqueado por muitas tentativas. Tente novamente mais tarde.'
        },
        'auth/network-request-failed': {
          message: 'Erro de conexão',
          details: 'Verifique sua conexão com a internet e tente novamente.'
        },
        'auth/invalid-credential': {
          message: 'Credenciais inválidas',
          details: 'Email ou senha incorretos.'
        }
      };

      const errorCode = error.code;
      const errorInfo = errorMap[errorCode] || {
        message: 'Erro ao fazer login',
        details: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      };

      setErrorType('error');
      setError(errorInfo.message);
      setErrorDetails(errorInfo.details);
    } finally {
      setLoading(false);
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    setError('');
    setErrorDetails('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Verificar se usuário existe no Firestore
      const resultado = await verificarUsuarioFirestore(user);
      
      if (resultado.error) {
        // Usuário não autorizado - fazer logout
        await auth.signOut();
        
        setErrorType(resultado.type === 'not_found' ? 'error' : 'warning');
        setError(resultado.message);
        
        if (resultado.type === 'not_found') {
          setErrorDetails('Seu email está autenticado no Google, mas não possui cadastro no sistema. Entre em contato com o administrador para solicitar acesso.');
        } else if (resultado.type === 'inactive') {
          setErrorDetails('Seu acesso foi desativado. Entre em contato com o administrador para reativar sua conta.');
        }
        
        setLoading(false);
        return;
      }
      
      // Salvar no localStorage
      localStorage.setItem('usuario', JSON.stringify(resultado.data));
      
      toast.success(`Bem-vindo, ${resultado.data.nome}!`);
      navigate('/');
    } catch (error) {
      console.error('Erro no login com Google:', error);
      
      // Mapear erros do Google
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorType('info');
        setError('Login cancelado');
        setErrorDetails('Você fechou a janela de login do Google.');
      } else if (error.code === 'auth/popup-blocked') {
        setErrorType('warning');
        setError('Popup bloqueado');
        setErrorDetails('Permita popups para este site ou tente novamente.');
      } else {
        setErrorType('error');
        setError('Erro no login com Google');
        setErrorDetails('Não foi possível fazer login com Google. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Limpar erros ao digitar
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

            {/* Mensagem de erro principal */}
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

            {/* Rodapé */}
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
