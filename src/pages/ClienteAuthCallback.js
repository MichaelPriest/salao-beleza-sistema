// src/pages/ClienteAuthCallback.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { toast } from 'react-hot-toast';

const SUPABASE_URL = 'https://kvjrerxqwtrxttiiqkgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9mLVarTs_RJIO26978SX5Q_uMtcfYzW';

function ClienteAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Pegar token da URL
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hashParams.get('access_token');
        
        if (!accessToken) {
          throw new Error('Token não encontrado');
        }
        
        console.log('🔐 Token recebido, buscando usuário...');
        
        // Buscar usuário no Supabase
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        const user = await response.json();
        console.log('📊 Usuário Supabase:', user);
        
        if (!user || !user.email) {
          throw new Error('Usuário não encontrado');
        }
        
        const empresaId = sessionStorage.getItem('empresa_publica_id');
        const empresaNome = sessionStorage.getItem('empresa_publica_nome');
        
        console.log('🔍 Buscando cliente no tenant:', empresaId);
        
        // Buscar cliente pelo email no tenant
        const url = `${SUPABASE_URL}/rest/v1/clientes?data->>email=eq.${encodeURIComponent(user.email)}&data->>empresaId=eq.${empresaId}&select=*`;
        const clientesResponse = await fetch(url, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        const clientes = await clientesResponse.json();
        console.log('📊 Clientes encontrados:', clientes);
        
        let cliente = null;
        
        if (clientes && clientes.length > 0) {
          cliente = clientes[0].data;
          console.log('✅ Cliente encontrado:', cliente.nome);
          
          // Atualizar authUid
          await fetch(`${SUPABASE_URL}/rest/v1/clientes?document_id=eq.${clientes[0].document_id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              data: {
                ...cliente,
                authUid: user.id,
                googleUid: user.id,
                updatedAt: new Date().toISOString()
              }
            })
          });
        } else {
          // Cliente não existe, verificar se precisa criar
          console.log('🆕 Cliente não encontrado, redirecionando para cadastro complementar');
          sessionStorage.setItem('pending_google_user', JSON.stringify({
            uid: user.id,
            email: user.email,
            nome: user.user_metadata?.full_name || user.email.split('@')[0],
            foto: user.user_metadata?.avatar_url || null
          }));
          navigate(`/cliente/cadastro-complementar?empresa=${sessionStorage.getItem('empresa_publica_slug')}`);
          return;
        }
        
        // Salvar cliente no localStorage
        localStorage.setItem('cliente', JSON.stringify(cliente));
        localStorage.setItem('supabase.auth.session', JSON.stringify({
          access_token: accessToken,
          user: user
        }));
        
        toast.success(`Bem-vindo(a), ${cliente.nome}!`);
        navigate('/cliente/dashboard');
        
      } catch (err) {
        console.error('❌ Erro no callback:', err);
        setError(err.message);
        setTimeout(() => {
          navigate('/cliente/login');
        }, 3000);
      }
    };
    
    processCallback();
  }, [navigate]);
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
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
        Aguarde enquanto processamos seu login
      </Typography>
    </Box>
  );
}

export default ClienteAuthCallback;
