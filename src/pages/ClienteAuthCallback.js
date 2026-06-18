// src/pages/ClienteAuthCallback.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
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

  useEffect(() => {
    const processCallback = async () => {
      try {
        const authError = getAuthErrorFromUrl();
        if (authError) {
          throw new Error(`Google não concluiu a autenticação: ${authError}`);
        }

        const session = await consumeSupabaseAuthRedirect();
        const user = session?.user;

        if (!user?.id || !user?.email) {
          throw new Error('Sessão do Google não encontrada. Tente entrar novamente.');
        }

        const empresaSlug = new URLSearchParams(window.location.search).get('empresa') || window.sessionStorage.getItem('empresa_publica_slug');
        let empresaId = window.sessionStorage.getItem('empresa_publica_id');
        let empresaNome = window.sessionStorage.getItem('empresa_publica_nome');

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

        setTenantContext({ empresaId, empresa: { id: empresaId, nome: empresaNome } });

        const clienteEncontrado = await buscarClientePortalNoTenant({
          uid: user.id,
          email: user.email,
          empresaId,
        });

        if (!clienteEncontrado) {
          window.sessionStorage.setItem('pending_google_user', JSON.stringify({
            uid: user.id,
            email: user.email,
            nome: user.user_metadata?.full_name || user.email.split('@')[0],
            foto: user.user_metadata?.avatar_url || null,
            empresaId,
            empresaNome,
          }));

          navigate(`/cliente/cadastro-complementar${empresaSlug ? `?empresa=${encodeURIComponent(empresaSlug)}` : ''}`, { replace: true });
          return;
        }

        const clienteAtualizado = await vincularAuthClientePortal(clienteEncontrado, {
          uid: user.id,
          provider: 'google',
          foto: user.user_metadata?.avatar_url || null,
        });
        localStorage.setItem('cliente', JSON.stringify(clienteAtualizado));
        setTenantContextFromUser(clienteAtualizado);

        toast.success(`Bem-vindo(a), ${clienteAtualizado.nome}!`);
        navigate('/cliente/dashboard', { replace: true });
      } catch (err) {
        console.error('❌ Erro no callback Google do cliente:', err);
        const mensagemErro = String(err.message || 'Erro ao autenticar com Google');
        const mensagemAmigavel = mensagemErro.includes('Unable to exchange external code')
          ? 'O Google não concluiu a autenticação. Tente entrar novamente e selecione sua conta Google outra vez.'
          : mensagemErro;
        setError(mensagemAmigavel);
        localStorage.removeItem('supabase.auth.session');
        localStorage.removeItem('supabase.access_token');
        const empresaSlug = new URLSearchParams(window.location.search).get('empresa') || window.sessionStorage.getItem('empresa_publica_slug');
        setTimeout(() => {
          navigate(`/cliente/login${empresaSlug ? `?empresa=${encodeURIComponent(empresaSlug)}` : ''}`, { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [navigate]);

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao autenticar: {error}
        </Alert>
        <Typography>Redirecionando para o login...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6">Autenticando...</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
        Aguarde enquanto processamos seu login com Google
      </Typography>
    </Box>
  );
}

export default ClienteAuthCallback;
