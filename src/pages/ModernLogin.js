// src/pages/ModernLogin.js - CORRIGIDO PARA SUPABASE
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
import { consumeSupabaseAuthRedirect, supabaseConfig } from '../services/firebase';
import { safeSetUsuarioStorage } from '../utils/storageUtils';

const SUPABASE_URL = supabaseConfig.url;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_9mLVarTs_RJIO26978SX5Q_uMtcfYzW';

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

  // 🔥 FUNÇÃO PARA VERIFICAR USUÁRIO NO SUPABASE
  const verificarUsuarioSupabase = async (email) => {
    try {
      console.log('🔍 Verificando usuário no Supabase:', email);
      
      // Buscar usuário por email na tabela usuarios
      const url = `${SUPABASE_URL}/rest/v1/usuarios?data->>email=eq.${encodeURIComponent(email)}&select=*`;
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const usuarios = await response.json();
      console.log('📊 Usuários encontrados:', usuarios);
      
      if (!usuarios || usuarios.length === 0) {
        return { 
          success: false, 
          error: 'not_found',
          message: 'Usuário não encontrado no sistema. Entre em contato com o administrador.' 
        };
      }
      
      const usuarioData = usuarios[0].data;
      console.log('✅ Usuário encontrado:', usuarioData);
      
      // Verificar se está ativo
      if (usuarioData.status !== 'ativo') {
        return { 
          success: false, 
          error: 'inactive',
          message: 'Usuário inativo. Contate o administrador para reativar seu acesso.' 
        };
      }
      
      return { 
        success: true, 
        data: { 
          id: usuarios[0].document_id,
          ...usuarioData
        } 
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar usuário:', error);
      return { 
        success: false, 
        error: 'system_error',
        message: 'Erro ao verificar usuário. Tente novamente.' 
      };
    }
  };

  // 🔥 FUNÇÃO PARA CRIAR/CONVERTER USUÁRIO DO GOOGLE
  const criarOuConverterUsuarioGoogle = async (userEmail, userNome, userUid) => {
    try {
      console.log('🔄 Verificando se usuário Google já existe:', userEmail);
      
      // Buscar usuário existente
      const url = `${SUPABASE_URL}/rest/v1/usuarios?data->>email=eq.${encodeURIComponent(userEmail)}&select=*`;
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const usuarios = await response.json();
      
      if (usuarios && usuarios.length > 0) {
        // Usuário já existe, atualizar com googleUid
        const usuarioExistente = usuarios[0];
        console.log('✅ Usuário encontrado, atualizando com Google UID:', usuarioExistente);
        
        const updateUrl = `${SUPABASE_URL}/rest/v1/usuarios?document_id=eq.${usuarioExistente.document_id}`;
        const updatedData = {
          ...usuarioExistente.data,
          googleUid: userUid,
          authUid: userUid,
          updatedAt: new Date().toISOString()
        };
        
        await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ data: updatedData })
        });
        
        return {
          success: true,
          data: { id: usuarioExistente.document_id, ...updatedData }
        };
      }
      
      // Usuário não existe, verificar se é um novo cadastro válido
      console.log('🆕 Usuário Google não encontrado, verificar se pode criar...');
      
      // Aqui você pode decidir se permite criação automática ou precisa de convite
      // Por enquanto, retorna erro pedindo contato com admin
      return {
        success: false,
        error: 'not_found',
        message: 'Seu email não está cadastrado no sistema. Entre em contato com o administrador para solicitar acesso.',
        needsInvite: true
      };
      
    } catch (error) {
      console.error('❌ Erro ao processar usuário Google:', error);
      return {
        success: false,
        error: 'system_error',
        message: 'Erro ao processar login. Tente novamente.'
      };
    }
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
      const result = await login(formData.email, formData.senha);
      const usuarioLogado = result?.data || result?.user || result;

      if (result?.success || usuarioLogado?.id || usuarioLogado?.uid || usuarioLogado?.email) {
        toast.success(`Bem-vindo, ${usuarioLogado?.nome || usuarioLogado?.email || 'usuário'}!`);
        navigate('/dashboard', { replace: true });
        return;
      }

      setErrorType('error');
      setError(result?.error || 'Erro ao fazer login');
    } catch (error) {
      console.error('Erro no login:', error);
      setErrorType('error');
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOGIN COM GOOGLE CORRIGIDO
  const handleGoogleLogin = async () => {
    setError('');
    setErrorDetails('');
    setLoading(true);

    try {
      // Redirecionar para Supabase OAuth
      const redirectTo = `${window.location.origin}/login`;
      const authUrl = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
      authUrl.searchParams.set('provider', 'google');
      authUrl.searchParams.set('redirect_to', redirectTo);
      authUrl.searchParams.set('prompt', 'select_account');
      window.location.href = authUrl.toString();
      
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setErrorType('error');
      setError('Erro ao iniciar login com Google');
      setErrorDetails(error.message || 'Tente novamente mais tarde');
      setLoading(false);
    }
  };

  // 🔥 PROCESSAR RETORNO DO GOOGLE (quando voltar do OAuth)
  React.useEffect(() => {
    const processGoogleRedirect = async () => {
      const hasOAuthParams = window.location.hash.includes('access_token=') || window.location.search.includes('code=');
      if (!hasOAuthParams) return;
      
      console.log('🔐 Processando retorno do Google OAuth...');
      setLoading(true);
      
      try {
        const session = await consumeSupabaseAuthRedirect();
        const supabaseUser = session?.user;
        console.log('📊 Usuário Supabase:', supabaseUser);
        
        if (supabaseUser && supabaseUser.email) {
          // Verificar se usuário existe na tabela usuarios
          const resultado = await verificarUsuarioSupabase(supabaseUser.email);
          
          if (!resultado.success) {
            // Usuário não encontrado, tentar criar ou converter
            const criarResultado = await criarOuConverterUsuarioGoogle(
              supabaseUser.email,
              supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
              supabaseUser.id
            );
            
            if (!criarResultado.success) {
              setErrorType('error');
              setError(criarResultado.message);
              setErrorDetails('Entre em contato com o administrador para solicitar acesso.');
              setLoading(false);
              return;
            }
            
            // Salvar usuário no localStorage
            safeSetUsuarioStorage(criarResultado.data);
            toast.success(`Bem-vindo, ${criarResultado.data.nome || criarResultado.data.email}!`);
            
            navigate('/dashboard', { replace: true });
            return;
          }
          
          // Usuário encontrado
          safeSetUsuarioStorage(resultado.data);
          toast.success(`Bem-vindo, ${resultado.data.nome || resultado.data.email}!`);
          
          navigate('/dashboard', { replace: true });
        }
        
      } catch (error) {
        console.error('❌ Erro ao processar retorno Google:', error);
        setErrorType('error');
        setError('Erro ao processar login com Google');
        setErrorDetails(error.message || 'Tente novamente');
      } finally {
        setLoading(false);
      }
    };
    
    processGoogleRedirect();
  }, [navigate]);

  const validarCampos = () => {
    const errors = { email: '', senha: '' };
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
