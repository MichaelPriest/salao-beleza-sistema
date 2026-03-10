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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Snackbar,
  InputAdornment,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
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
import { firebaseService } from '../services/firebase';

const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0'];

function FluxoCaixa() {
  const [loading, setLoading] = useState(true);
  const [transacoes, setTransacoes] = useState([]);
  const [caixa, setCaixa] = useState(null);
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (transacoes.length > 0) {
      // Recarregar quando as datas mudarem (filtro local)
      setLoading(false);
    }
  }, [dataInicio, dataFim, transacoes]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [transacoesData, caixaData] = await Promise.all([
        firebaseService.getAll('transacoes').catch(() => []),
        firebaseService.getAll('caixa').catch(() => []),
      ]);
      
      setTransacoes(transacoesData || []);
      
      // Pega o caixa atual (último caixa aberto)
      const caixaAtual = caixaData?.length > 0 
        ? caixaData.filter(c => c && c.status === 'aberto')
            .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))[0]
        : null;
      setCaixa(caixaAtual);
      
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar transações por período
  const transacoesFiltradas = transacoes.filter(t => {
    if (!t.data) return false;
    const data = new Date(t.data);
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999); // Incluir todo o dia final
    return data >= inicio && data <= fim;
  });

  // Calcular totais
  const totalReceitas = transacoesFiltradas
    .filter(t => t.tipo === 'receita' && t.status === 'pago')
    .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

  const totalDespesas = transacoesFiltradas
    .filter(t => t.tipo === 'despesa' && t.status === 'pago')
    .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

  const saldoPeriodo = totalReceitas - totalDespesas;

  // Dados para gráfico de linha
  const gerarDadosGrafico = () => {
    const dados = [];
    const dataAtual = new Date(dataInicio);
    const dataFinal = new Date(dataFim);
    dataFinal.setHours(23, 59, 59, 999);

    while (dataAtual <= dataFinal) {
      const diaStr = dataAtual.toISOString().split('T')[0];
      
      const receitasDia = transacoesFiltradas
        .filter(t => t.tipo === 'receita' && t.status === 'pago' && t.data?.startsWith(diaStr))
        .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
        
      const despesasDia = transacoesFiltradas
        .filter(t => t.tipo === 'despesa' && t.status === 'pago' && t.data?.startsWith(diaStr))
        .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

      dados.push({
        dia: dataAtual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        receitas: receitasDia,
        despesas: despesasDia,
        saldo: receitasDia - despesasDia,
      });

      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    return dados;
  };

  // Dados para gráfico de pizza por categoria
  const gerarDadosPizza = () => {
    const categorias = {};
    
    transacoesFiltradas
      .filter(t => t.status === 'pago')
      .forEach(t => {
        const cat = t.categoria || 'Outros';
        if (!categorias[cat]) {
          categorias[cat] = 0;
        }
        categorias[cat] += Number(t.valor) || 0;
      });

    return Object.keys(categorias).map(cat => ({
      name: cat,
      value: categorias[cat],
    }));
  };

  const dadosGrafico = gerarDadosGrafico();
  const dadosPizza = gerarDadosPizza();

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
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Evolução Diária
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dadosGrafico}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="receitas" 
                        stackId="1" 
                        stroke="#4caf50" 
                        fill="#4caf50" 
                        fillOpacity={0.6} 
                        name="Receitas"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="despesas" 
                        stackId="1" 
                        stroke="#f44336" 
                        fill="#f44336" 
                        fillOpacity={0.6} 
                        name="Despesas"
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
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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
                        label={({ name, percent }) => 
                          percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                        }
                        outerRadius={80}
                        dataKey="value"
                      >
                        {dadosPizza.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
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
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Movimentações do Período
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Descrição</strong></TableCell>
                  <TableCell><strong>Categoria</strong></TableCell>
                  <TableCell align="right"><strong>Valor</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transacoesFiltradas
                  .filter(t => t.status === 'pago')
                  .sort((a, b) => new Date(b.data) - new Date(a.data))
                  .map((transacao) => (
                    <TableRow key={transacao.id} hover>
                      <TableCell>
                        {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{transacao.descricao}</TableCell>
                      <TableCell>
                        <Chip
                          label={transacao.categoria || 'Sem categoria'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            color: transacao.tipo === 'receita' ? '#4caf50' : '#f44336',
                            fontWeight: 600,
                          }}
                        >
                          {transacao.tipo === 'receita' ? '+' : '-'} R$ {Number(transacao.valor).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                          size="small"
                          color={transacao.tipo === 'receita' ? 'success' : 'error'}
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                {transacoesFiltradas.filter(t => t.status === 'pago').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        Nenhuma movimentação encontrada no período
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default FluxoCaixa;
