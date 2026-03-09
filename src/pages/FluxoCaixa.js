// src/pages/FluxoCaixa.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
  LinearProgress,
  TablePagination,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as MoneyIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0'];

function FluxoCaixa() {
  const [loading, setLoading] = useState(true);
  const [transacoes, setTransacoes] = useState([]);
  const [fluxo, setFluxo] = useState([]);
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [caixa, setCaixa] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    carregarDados();
  }, [dataInicio, dataFim]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [transacoesRes, fluxoRes, caixaRes] = await Promise.all([
        api.get('/transacoes').catch(() => ({ data: [] })),
        api.get('/fluxo_caixa').catch(() => ({ data: [] })),
        api.get('/caixa').catch(() => ({ data: null })),
      ]);
      
      setTransacoes(transacoesRes.data || []);
      setFluxo(fluxoRes.data || []);
      setCaixa(caixaRes.data || null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar transações por período
  const transacoesFiltradas = transacoes.filter(t => {
    const data = new Date(t.data);
    return data >= new Date(dataInicio) && data <= new Date(dataFim);
  });

  // Calcular totais
  const totalReceitas = transacoesFiltradas
    .filter(t => t.tipo === 'receita' && t.status === 'pago')
    .reduce((acc, t) => acc + (t.valor || 0), 0);

  const totalDespesas = transacoesFiltradas
    .filter(t => t.tipo === 'despesa' && t.status === 'pago')
    .reduce((acc, t) => acc + (t.valor || 0), 0);

  const saldoPeriodo = totalReceitas - totalDespesas;

  // Dados para gráfico de linha
  const dadosGrafico = [];
  const dataAtual = new Date(dataInicio);
  const dataFinal = new Date(dataFim);

  while (dataAtual <= dataFinal) {
    const diaStr = dataAtual.toISOString().split('T')[0];
    const receitasDia = transacoesFiltradas
      .filter(t => t.tipo === 'receita' && t.status === 'pago' && t.data === diaStr)
      .reduce((acc, t) => acc + (t.valor || 0), 0);
    const despesasDia = transacoesFiltradas
      .filter(t => t.tipo === 'despesa' && t.status === 'pago' && t.data === diaStr)
      .reduce((acc, t) => acc + (t.valor || 0), 0);

    dadosGrafico.push({
      dia: dataAtual.toLocaleDateString('pt-BR'),
      receitas: receitasDia,
      despesas: despesasDia,
      saldo: receitasDia - despesasDia,
    });

    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  // Dados para gráfico de pizza por categoria
  const categorias = {};
  transacoesFiltradas
    .filter(t => t.status === 'pago')
    .forEach(t => {
      const cat = t.categoria || 'Outros';
      if (!categorias[cat]) {
        categorias[cat] = 0;
      }
      categorias[cat] += t.valor || 0;
    });

  const dadosPizza = Object.keys(categorias).map(cat => ({
    name: cat,
    value: categorias[cat],
  }));

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Fluxo de Caixa
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Acompanhe todas as movimentações financeiras
        </Typography>
      </Box>

      {/* Filtro de Período */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Data Início"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Data Fim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={carregarDados}
              >
                Atualizar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total de Receitas
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      R$ {totalReceitas.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                    <TrendingUpIcon />
                  </Avatar>
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
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total de Despesas
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                      R$ {totalDespesas.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#f44336', width: 56, height: 56 }}>
                    <TrendingDownIcon />
                  </Avatar>
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
            <Card sx={{ bgcolor: saldoPeriodo >= 0 ? '#e8f5e9' : '#ffebee' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Saldo do Período
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: saldoPeriodo >= 0 ? '#4caf50' : '#f44336' 
                      }}
                    >
                      R$ {saldoPeriodo.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                    <AccountBalanceIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Evolução Diária
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dadosGrafico}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value) => `R$ ${value.toFixed(2)}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="receitas" 
                        stackId="1" 
                        stroke="#4caf50" 
                        fill="#4caf50" 
                        fillOpacity={0.6} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="despesas" 
                        stackId="1" 
                        stroke="#f44336" 
                        fill="#f44336" 
                        fillOpacity={0.6} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribuição por Categoria
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosPizza}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {dadosPizza.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => `R$ ${value.toFixed(2)}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Tabela de Movimentações */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Movimentações do Período
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Data</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Tipo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transacoesFiltradas
                  .filter(t => t.status === 'pago')
                  .sort((a, b) => new Date(b.data) - new Date(a.data))
                  .map((transacao) => (
                    <TableRow key={transacao.id}>
                      <TableCell>
                        {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{transacao.descricao}</TableCell>
                      <TableCell>
                        <Chip
                          label={transacao.categoria || '—'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            color: transacao.tipo === 'receita' ? '#4caf50' : '#f44336',
                            fontWeight: 600,
                          }}
                        >
                          {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor?.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                          size="small"
                          color={transacao.tipo === 'receita' ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default FluxoCaixa;