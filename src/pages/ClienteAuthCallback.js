// src/pages/ClienteAuthCallback.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Paper } from '@mui/material';
import { toast } from 'react-hot-toast';
import { saasService } from '../services/saasService';
import { buscarClientePortalNoTenant, vincularAuthClientePortal } from '../services/clientePortalLookupService';
import {
  consumeSupabaseAuthRedirect,
  setTenantContext,
  setTenantContextFromUser,
} from '../services/firebase';

const getAuthErrorFromUrl = () => {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const searchParams = new URLSearchParams(window.location.search);
  const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
  const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
  const errorMessage = searchParams.get('error') || hashParams.get('error');

  if (!errorCode && !errorDescription && !errorMessage) return null;

  return decodeURIComponent(errorDescription || errorMessage || errorCode || 'Erro desconhecido no login com Google');
};

function ClienteAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Verificar erros na URL
        const authError = getAuthErrorFromUrl();
        if (authError) {
          throw new Error(`Google não concluiu a autenticação: ${authError}`);
        }

        // Consumir o redirect do Supabase (agora com PKCE)
        console.log('🔄 Processando callback OAuth com PKCE...');
        const session = await consumeSupabaseAuthRedirect();
        const user = session?.user;

        if (!user?.id || !user?.email) {
          throw new Error('Sessão do Google não encontrada. Tente entrar novamente.');
        }

        console.log('✅ Usuário autenticado:', user.email);

        // Recuperar dados da empresa
        const empresaSlug = new URLSearchParams(window.location.search).get('empresa') || window.sessionStorage.getItem('empresa_publica_slug');
        let empresaId = window.sessionStorage.getItem('empresa_publica_id');
        let empresaNome = window.sessionStorage.getItem('empresa_publica_nome');

        // Se não tiver empresaId mas tiver slug, buscar
        if (!empresaId && empresaSlug) {
          const empresa = await saasService.buscarEmpresaPorSlug(empresaSlug).catch(() => null);
          if (empresa?.id) {
            empresaId = empresa.id;
            empresaNome = empresa.nome || '';
            window.sessionStorage.setItem('empresa_publica_slug', empresaSlug);
            window.sessionStorage.setItem('empresa_publica_id', empresaId);
            window.sessionStorage.setItem('empresa_publica_nome', empresaNome);
          }
        }

        if (!empresaId) {
          throw new Error('Empresa não identificada. Acesse pelo link público do salão.');
        }

        // Definir contexto do tenant
        setTenantContext({ empresaId, empresa: { id: empresaId, nome: empresaNome } });

        // Buscar cliente no tenant
        const clienteEncontrado = await buscarClientePortalNoTenant({
          uid: user.id,
          email: user.email,
          empresaId,
        });

        // Se cliente não existe, salvar dados pendentes e redirecionar para cadastro complementar
        if (!clienteEncontrado) {
          console.log('📝 Usuário novo, salvando dados pendentes para cadastro complementar');
          window.sessionStorage.setItem('pending_google_user', JSON.stringify({
            uid: user.id,
            email: user.email,
            nome: user.user_metadata?.full_name || user.email.split('@')[0] || 'Cliente',
            foto: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            empresaId,
            empresaNome,
          }));

          setLoading(false);
          navigate(`/cliente/cadastro-complementar${empresaSlug ? `?empresa=${encodeURIComponent(empresaSlug)}` : ''}`, { replace: true });
          return;
        }

        // Cliente existe - vincular e fazer login
        console.log('✅ Cliente encontrado, vinculando conta Google');
        const clienteAtualizado = await vincularAuthClientePortal(clienteEncontrado, {
          uid: user.id,
          provider: 'google',
          foto: user.user_metadata?.avatar_url || null,
        });
        
        localStorage.setItem('cliente', JSON.stringify(clienteAtualizado));
        setTenantContextFromUser(clienteAtualizado);

        toast.success(`Bem-vindo(a), ${clienteAtualizado.nome}!`);
        setLoading(false);
        navigate('/cliente/dashboard', { replace: true });
        
      } catch (err) {
        console.error('❌ Erro no callback Google do cliente:', err);
        const mensagemErro = String(err.message || 'Erro ao autenticar com Google');
        
        // Mensagem amigável para erros comuns
        let mensagemAmigavel = mensagemErro;
        if (mensagemErro.includes('Unable to exchange external code')) {
          mensagemAmigavel = 'O Google não concluiu a autenticação. Tente entrar novamente e selecione sua conta Google outra vez.';
        } else if (mensagemErro.includes('invalid_grant')) {
          mensagemAmigavel = 'O código de autenticação expirou. Tente fazer login novamente.';
        } else if (mensagemErro.includes('JWT expired')) {
          mensagemAmigavel = 'Sessão expirada. Tente fazer login novamente.';
        }
        
        setError(mensagemAmigavel);
        setLoading(false);
        
        // Limpar sessão inválida
        localStorage.removeItem('supabase.auth.session');
        localStorage.removeItem('supabase.access_token');
        localStorage.removeItem('cliente');
        sessionStorage.removeItem('pending_google_user');
        
        // Redirecionar para login após 3 segundos
        const empresaSlug = new URLSearchParams(window.location.search).get('empresa') || window.sessionStorage.getItem('empresa_publica_slug');
        setTimeout(() => {
          navigate(`/cliente/login${empresaSlug ? `?empresa=${encodeURIComponent(empresaSlug)}` : ''}`, { replace: true });
        }, 4000);
      }
    };

    processCallback();
  }, [navigate]);

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        p: 2,
        bgcolor: '#f5f5f5'
      }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao autenticar
          </Alert>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="textSecondary">
              Redirecionando para o login...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Autenticando com Google
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Aguarde enquanto processamos seu login
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="textSecondary">
            Isso pode levar alguns segundos...
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default ClienteAuthCallback;
