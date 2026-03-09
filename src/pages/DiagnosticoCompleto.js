import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import api from '../services/api';
import { usuariosService } from '../services/usuariosService';

function DiagnosticoCompleto() {
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState({});
  const [usuario, setUsuario] = useState(usuariosService.getUsuarioAtual());

  const testarAPI = async (endpoint) => {
    setLoading(true);
    try {
      const response = await api.get(`/${endpoint}`);
      setResultados(prev => ({
        ...prev,
        [endpoint]: { status: '✅ OK', dados: response.data }
      }));
    } catch (error) {
      setResultados(prev => ({
        ...prev,
        [endpoint]: { status: '❌ Erro', erro: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testarTodasAPIs = async () => {
    const endpoints = ['usuarios', 'clientes', 'servicos', 'profissionais', 'agendamentos', 'atendimentos', 'pagamentos'];
    for (const endpoint of endpoints) {
      await testarAPI(endpoint);
    }
  };

  const testarLogin = async () => {
    setLoading(true);
    try {
      const user = await usuariosService.login('ana@salao.com', '123456');
      setUsuario(user);
      setResultados(prev => ({
        ...prev,
        login: { status: '✅ Login OK', usuario: user }
      }));
    } catch (error) {
      setResultados(prev => ({
        ...prev,
        login: { status: '❌ Erro', erro: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>🔍 Diagnóstico Completo do Sistema</Typography>

      <Grid container spacing={3}>
        {/* Informações do Sistema */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>📊 Informações do Sistema</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">URL Atual:</Typography>
                  <Chip label={window.location.href} variant="outlined" sx={{ mb: 1 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Ambiente:</Typography>
                  <Chip 
                    label={process.env.NODE_ENV} 
                    color={process.env.NODE_ENV === 'production' ? 'primary' : 'success'} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">API Base URL:</Typography>
                  <Chip 
                    label={api.defaults.baseURL} 
                    variant="outlined" 
                    color="info"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Usuário Logado */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>👤 Usuário Logado</Typography>
              {usuario ? (
                <Box>
                  <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
                    {JSON.stringify(usuario, null, 2)}
                  </pre>
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={() => {
                      usuariosService.logout();
                      setUsuario(null);
                    }}
                    sx={{ mt: 2 }}
                  >
                    Logout
                  </Button>
                </Box>
              ) : (
                <Alert severity="warning">Nenhum usuário logado</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Ações de Teste */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>🧪 Testes</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  onClick={testarTodasAPIs}
                  disabled={loading}
                >
                  Testar Todas APIs
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={testarLogin}
                  disabled={loading}
                >
                  Testar Login
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resultados dos Testes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>📋 Resultados</Typography>
              {loading && <CircularProgress />}
              {Object.entries(resultados).map(([key, value]) => (
                <Paper key={key} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {key}: {value.status}
                  </Typography>
                  <pre style={{ overflow: 'auto', maxHeight: 200 }}>
                    {JSON.stringify(value.dados || value.erro || value.usuario, null, 2)}
                  </pre>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Dashboard Test */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>📊 Dashboard Test</Typography>
              <Alert severity="info">
                O dashboard abaixo deve carregar os dados se a API estiver funcionando
              </Alert>
              <Box sx={{ mt: 2 }}>
                {/* Aqui você pode importar e renderizar o ModernDashboard */}
                <Typography variant="body2" color="textSecondary">
                  Se o dashboard não aparecer, verifique os logs do console
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DiagnosticoCompleto;
