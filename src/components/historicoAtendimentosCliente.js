// src/components/HistoricoAtendimentosCliente.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Avatar,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { firebaseService } from '../services/firebase';

export const HistoricoAtendimentosCliente = ({ clienteId, clienteNome }) => {
  const [loading, setLoading] = useState(true);
  const [atendimentos, setAtendimentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    valorTotal: 0,
    ultimaVisita: null,
  });

  useEffect(() => {
    if (clienteId) {
      carregarHistorico();
    }
  }, [clienteId]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      
      // Buscar atendimentos do cliente
      const todosAtendimentos = await firebaseService.getAll('atendimentos').catch(() => []);
      const atendimentosCliente = todosAtendimentos.filter(a => 
        a.clienteId === clienteId && 
        (a.status === 'finalizado' || a.status === 'cancelado')
      );
      
      // Buscar profissionais e serviços para enriquecer os dados
      const [profissionaisData, servicosData] = await Promise.all([
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
      ]);

      setAtendimentos(atendimentosCliente);
      setProfissionais(profissionaisData);
      setServicos(servicosData);

      // Calcular estatísticas
      const valorTotal = atendimentosCliente.reduce((acc, a) => {
        if (a.status === 'finalizado') {
          return acc + (a.valorTotal || 0);
        }
        return acc;
      }, 0);

      const ultimoAtendimento = atendimentosCliente.length > 0 
        ? new Date(Math.max(...atendimentosCliente.map(a => new Date(a.data))))
        : null;

      setStats({
        total: atendimentosCliente.length,
        valorTotal,
        ultimaVisita: ultimoAtendimento,
      });

    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError('Erro ao carregar histórico do cliente');
    } finally {
      setLoading(false);
    }
  };

  const getProfissionalNome = (profissionalId) => {
    if (!profissionalId) return 'Profissional não identificado';
    const profissional = profissionais.find(p => p.id === profissionalId);
    return profissional?.nome || 'Profissional não encontrado';
  };

  const getServicosNomes = (atendimento) => {
    if (atendimento.itensServico && atendimento.itensServico.length > 0) {
      return atendimento.itensServico.map(item => item.nome).join(', ');
    } else if (atendimento.servicoId) {
      const servico = servicos.find(s => s.id === atendimento.servicoId);
      return servico?.nome || 'Serviço não encontrado';
    }
    return '-';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'finalizado': return 'success';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#9c27b0' }}>
        Histórico de Atendimentos
      </Typography>

      {/* Cards de resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                  <ReceiptIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total de Atendimentos
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Gasto
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    R$ {stats.valorTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                  <CalendarIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Última Visita
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {stats.ultimaVisita ? formatarData(stats.ultimaVisita) : '-'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de atendimentos */}
      <Card variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Profissional</strong></TableCell>
                <TableCell><strong>Serviços</strong></TableCell>
                <TableCell align="right"><strong>Valor</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {atendimentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      Nenhum atendimento encontrado para este cliente
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                atendimentos.map((atendimento, index) => (
                  <TableRow key={atendimento.id} hover>
                    <TableCell>
                      {formatarData(atendimento.data)}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {atendimento.horaInicio || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getProfissionalNome(atendimento.profissionalId)}
                    </TableCell>
                    <TableCell>
                      {getServicosNomes(atendimento)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                        R$ {atendimento.valorTotal?.toFixed(2) || '0,00'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(atendimento.status)}
                        size="small"
                        color={getStatusColor(atendimento.status)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {atendimentos.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Este cliente ainda não possui atendimentos registrados.
        </Alert>
      )}
    </Box>
  );
};
