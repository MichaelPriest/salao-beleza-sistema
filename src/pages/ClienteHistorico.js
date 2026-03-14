// src/pages/ClienteHistorico.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  History as HistoryIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';

function ClienteHistorico() {
  const { cliente } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [atendimentos, setAtendimentos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    totalAtendimentos: 0,
    totalGasto: 0,
    servicosFavoritos: [],
  });

  useEffect(() => {
    if (cliente) {
      carregarHistorico();
    }
  }, [cliente]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);

      const atendimentosData = await firebaseService.query('atendimentos', [
        { field: 'clienteId', operator: '==', value: cliente.id }
      ], 'data', 'desc');

      setAtendimentos(atendimentosData || []);

      const totalGasto = (atendimentosData || []).reduce((acc, a) => acc + (a.valorTotal || 0), 0);

      // Contar serviços mais frequentes
      const servicosCount = {};
      (atendimentosData || []).forEach(a => {
        if (a.servicoNome) {
          servicosCount[a.servicoNome] = (servicosCount[a.servicoNome] || 0) + 1;
        }
      });

      const servicosFavoritos = Object.entries(servicosCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([nome, count]) => ({ nome, count }));

      setEstatisticas({
        totalAtendimentos: atendimentosData?.length || 0,
        totalGasto,
        servicosFavoritos,
      });

    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Meu Histórico
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Acompanhe todos os seus atendimentos
        </Typography>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <HistoryIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                      {estatisticas.totalAtendimentos}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Atendimentos realizados
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MoneyIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      R$ {estatisticas.totalGasto.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total investido
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PersonIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Serviço favorito
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {estatisticas.servicosFavoritos[0]?.nome || '-'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Lista de Atendimentos */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Todos os Atendimentos
          </Typography>

          {atendimentos.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Profissional</TableCell>
                    <TableCell align="right">Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {atendimentos.map((atendimento, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatarData(atendimento.data)}</TableCell>
                      <TableCell>{atendimento.servicoNome || 'Serviço'}</TableCell>
                      <TableCell>{atendimento.profissionalNome || '-'}</TableCell>
                      <TableCell align="right">
                        R$ {atendimento.valorTotal?.toFixed(2) || '0,00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhum atendimento encontrado
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ClienteHistorico;
