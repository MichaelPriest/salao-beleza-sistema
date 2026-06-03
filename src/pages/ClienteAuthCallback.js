// src/pages/ClienteAuthCallback.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { toast } from 'react-hot-toast';
import {
  consumeSupabaseAuthRedirect,
  firebaseService,
  setTenantContext,
  setTenantContextFromUser,
} from '../services/firebase';

function ClienteAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const session = await consumeSupabaseAuthRedirect();
        const user = session?.user;

        if (!user?.id || !user?.email) {
          throw new Error('Sessão do Google não encontrada. Tente entrar novamente.');
        }

        const empresaId = window.sessionStorage.getItem('empresa_publica_id');
        const empresaNome = window.sessionStorage.getItem('empresa_publica_nome');
        const empresaSlug = window.sessionStorage.getItem('empresa_publica_slug');

        if (!empresaId) {
          throw new Error('Empresa não identificada. Acesse pelo link público do salão.');
        }

        setTenantContext({ empresaId, empresa: { id: empresaId, nome: empresaNome } });

        const clientes = await firebaseService.query('clientes', [
          { field: 'email', operator: '==', value: user.email },
          { field: 'empresaId', operator: '==', value: empresaId },
        ]);

        if (!clientes?.length) {
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

        const clienteEncontrado = clientes[0];
        const dadosVinculo = {
          authUid: user.id,
          googleUid: user.id,
          foto: clienteEncontrado.foto || user.user_metadata?.avatar_url || null,
          ultimoAcesso: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (clienteEncontrado.authUid !== user.id || clienteEncontrado.googleUid !== user.id) {
          await firebaseService.update('clientes', clienteEncontrado.id, dadosVinculo);
        }

        const clienteAtualizado = { ...clienteEncontrado, ...dadosVinculo };
        localStorage.setItem('cliente', JSON.stringify(clienteAtualizado));
        setTenantContextFromUser(clienteAtualizado);

        toast.success(`Bem-vindo(a), ${clienteAtualizado.nome}!`);
        navigate('/cliente/dashboard', { replace: true });
      } catch (err) {
        console.error('❌ Erro no callback Google do cliente:', err);
        setError(err.message || 'Erro ao autenticar com Google');
        setTimeout(() => {
          navigate('/cliente/login', { replace: true });
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
