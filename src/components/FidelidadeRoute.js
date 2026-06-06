import React from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { useFidelidadeAtiva } from '../hooks/useFidelidadeAtiva';

function FidelidadeRoute({ children, cliente = false, allowInactive = false }) {
  const navigate = useNavigate();
  const { fidelidadeAtiva, fidelidadeLoading } = useFidelidadeAtiva();

  if (fidelidadeLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!fidelidadeAtiva && !allowInactive) {
    return <Navigate to={cliente ? '/cliente/dashboard' : '/dashboard'} replace />;
  }

  if (!fidelidadeAtiva && allowInactive) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Programa de fidelidade desativado
            </Typography>
            <Typography variant="body2">
              A área administrativa permanece disponível para revisar clientes, recompensas e reativar o módulo nas configurações.
              As páginas do cliente e os atalhos públicos continuam ocultos enquanto a fidelidade estiver desligada.
            </Typography>
            <Box>
              <Button size="small" variant="contained" onClick={() => navigate('/configuracoes?tab=fidelidade')}>
                Abrir configurações
              </Button>
            </Box>
          </Stack>
        </Alert>
        {children}
      </Box>
    );
  }

  return children;
}

export default FidelidadeRoute;
