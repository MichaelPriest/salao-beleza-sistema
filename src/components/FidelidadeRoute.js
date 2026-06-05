import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useFidelidadeAtiva } from '../hooks/useFidelidadeAtiva';

function FidelidadeRoute({ children, cliente = false }) {
  const { fidelidadeAtiva, fidelidadeLoading } = useFidelidadeAtiva();

  if (fidelidadeLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!fidelidadeAtiva) {
    return <Navigate to={cliente ? '/cliente/dashboard' : '/dashboard'} replace />;
  }

  return children;
}

export default FidelidadeRoute;
