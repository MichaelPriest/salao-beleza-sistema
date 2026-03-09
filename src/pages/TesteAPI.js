import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert,
  Button,
  TextField 
} from '@mui/material';
import api from '../services/api';

function TesteAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dados, setDados] = useState(null);
  const [endpoint, setEndpoint] = useState('clientes');
  const [status, setStatus] = useState(null);

  const testarAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      setStatus('Conectando...');
      
      const response = await api.get(`/${endpoint}`);
      setDados(response.data);
      setStatus(`✅ Conectado! ${response.data.length} registros encontrados.`);
      
    } catch (err) {
      setError(err.message);
      setStatus(`❌ Erro: ${err.message}`);
      setDados(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testarAPI();
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#9c27b0' }}>
        🔧 Diagnóstico da API
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status da Conexão
          </Typography>
          
          {status && (
            <Alert severity={error ? 'error' : 'success'} sx={{ mb: 2 }}>
              {status}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <TextField
              label="Endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              onClick={testarAPI}
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Testar'}
            </Button>
          </Box>
          
          <Typography variant="body2" color="textSecondary">
            URL da API: http://localhost:3001/{endpoint}
          </Typography>
        </CardContent>
      </Card>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {dados && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📦 Dados Recebidos:
            </Typography>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {JSON.stringify(dados, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default TesteAPI;