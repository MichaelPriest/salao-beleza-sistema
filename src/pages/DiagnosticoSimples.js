import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import api from '../services/api';

function DiagnosticoSimples() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  const testarAPI = async () => {
    setLoading(true);
    setErro(null);
    try {
      const response = await api.get('/usuarios');
      setResultado({
        status: '✅ API OK',
        dados: response.data,
        url: api.defaults.baseURL + '/usuarios'
      });
    } catch (error) {
      setErro({
        mensagem: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const testarLogin = () => {
    try {
      // Mock de login para teste
      const mockUser = {
        id: 1,
        nome: "Usuário Teste",
        email: "teste@email.com",
        cargo: "admin"
      };
      localStorage.setItem('usuario', JSON.stringify(mockUser));
      setResultado({
        status: '✅ Login Mock OK',
        usuario: mockUser
      });
    } catch (error) {
      setErro({ mensagem: error.message });
    }
  };

  const limparStorage = () => {
    localStorage.clear();
    setResultado({ status: '✅ Storage limpo' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Diagnóstico Simples
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuração da API
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography><strong>Base URL:</strong> {api.defaults.baseURL}</Typography>
                <Typography><strong>Ambiente:</strong> {process.env.NODE_ENV}</Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Testes Rápidos
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={testarAPI}
                  disabled={loading}
                >
                  Testar API (/usuarios)
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={testarLogin}
                >
                  Login Mock
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={limparStorage}
                >
                  Limpar Storage
                </Button>
              </Box>

              {loading && <CircularProgress />}

              {resultado && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">{resultado.status}</Typography>
                  <pre style={{ overflow: 'auto', maxHeight: '200px', background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
                    {JSON.stringify(resultado, null, 2)}
                  </pre>
                </Alert>
              )}

              {erro && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">❌ Erro:</Typography>
                  <pre style={{ overflow: 'auto', background: '#ffebee', padding: '10px', borderRadius: '4px' }}>
                    {JSON.stringify(erro, null, 2)}
                  </pre>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Atual
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <pre>
                  {JSON.stringify({
                    usuario: localStorage.getItem('usuario')
                  }, null, 2)}
                </pre>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DiagnosticoSimples;
