// src/pages/Debug.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import api from '../services/api';
import { usuariosService } from '../services/usuariosService';

function Debug() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [usuario, setUsuario] = useState(usuariosService.getUsuarioAtual());

  const testarAPI = async () => {
    setLoading(true);
    try {
      const response = await api.get('/usuarios');
      setResultado({ status: '✅ Sucesso', dados: response.data });
    } catch (error) {
      setResultado({ status: '❌ Erro', erro: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testarLogin = async () => {
    setLoading(true);
    try {
      const user = await usuariosService.login('ana@salao.com', '123456');
      setUsuario(user);
      setResultado({ status: '✅ Login OK', usuario: user });
    } catch (error) {
      setResultado({ status: '❌ Erro', erro: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Página de Debug</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Usuário no localStorage:</Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <pre>{JSON.stringify(usuario, null, 2)}</pre>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={testarAPI} disabled={loading}>
          Testar API
        </Button>
        <Button variant="contained" onClick={testarLogin} disabled={loading}>
          Testar Login
        </Button>
      </Box>

      {loading && <CircularProgress />}

      {resultado && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6">{resultado.status}</Typography>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </Paper>
      )}
    </Box>
  );
}

export default Debug;
