// src/pages/ModernFinanceiro.js
import React, { useState, useEffect, useMemo } from 'react';
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
  TablePagination,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
  FileCopy as FileCopyIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
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
  BarChart,
  Bar,
  Line,
  ComposedChart,
} from 'recharts';

// Importar serviço de dados
import { useDados } from '../hooks/useDados';
import { firebaseService } from '../services/firebase';
import { notificacoesService } from '../services/notificacoesService';

const COLORS = ['#9c27b0', '#ff4081', '#4caf50', '#ff9800', '#f44336', '#2196f3'];

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente', icon: <WarningIcon /> },
  pago: { color: '#4caf50', label: 'Pago', icon: <CheckCircleIcon /> },
  atrasado: { color: '#f44336', label: 'Atrasado', icon: <CancelIcon /> },
  cancelado: { color: '#9e9e9e', label: 'Cancelado', icon: <CancelIcon /> },
  recebido: { color: '#4caf50', label: 'Recebido', icon: <CheckCircleIcon /> },
};

const tipoColors = {
  receita: { color: '#4caf50', label: 'Receita', icon: <TrendingUpIcon /> },
  despesa: { color: '#f44336', label: 'Despesa', icon: <TrendingDownIcon /> },
};

const formasPagamento = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '⚡' },
  { value: 'boleto', label: 'Boleto', icon: '📄' },
  { value: 'transferencia', label: 'Transferência', icon: '🔄' },
];

function ModernFinanceiro() {
  const { dados, carregando, recarregar, transacoes, clientes, caixaAtual } = useDados();
  
  const [tabValue, setTabValue] = useState(0);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openCaixaDialog, setOpenCaixaDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState(null);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [usuario, setUsuario] = useState(null);

  const [formData, setFormData] = useState({
    tipo: 'receita',
    descricao: '',
    valor: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    dataVencimento: format(new Date(), 'yyyy-MM-dd'),
    categoria: '',
    formaPagamento: 'dinheiro',
    status: 'pendente',
    clienteId: '',
    observacoes: '',
    parcelas: 1,
  });

  useEffect(() => {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsuario(user);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    }
  }, []);

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleOpenDialog = (transacao = null) => {
    if (transacao) {
      setTransacaoEditando(transacao);
      setFormData({
        tipo: transacao.tipo || 'receita',
        descricao: transacao.descricao || '',
        valor: transacao.valor || '',
        data: transacao.data || format(new Date(), 'yyyy-MM-dd'),
        dataVencimento: transacao.dataVencimento || format(new Date(), 'yyyy-MM-dd'),
        categoria: transacao.categoria || '',
        formaPagamento: transacao.formaPagamento || 'dinheiro',
        status: transacao.status || 'pendente',
        clienteId: transacao.clienteId || '',
        observacoes: transacao.observacoes || '',
        parcelas: transacao.parcelas || 1,
      });
    } else {
      setTransacaoEditando(null);
      setFormData({
        tipo: 'receita',
        descricao: '',
        valor: '',
        data: format(new Date(), 'yyyy-MM-dd'),
        dataVencimento: format(new Date(), 'yyyy-MM-dd'),
        categoria: '',
        formaPagamento: 'dinheiro',
        status: 'pendente',
        clienteId: '',
        observacoes: '',
        parcelas: 1,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTransacaoEditando(null);
  };

  const handleOpenCaixaDialog = () => setOpenCaixaDialog(true);
  const handleCloseCaixaDialog = () => setOpenCaixaDialog(false);

  const handleOpenDetalhes = (transacao) => {
    setTransacaoSelecionada(transacao);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setTransacaoSelecionada(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePeriodoChange = (periodo) => {
    setPeriodoSelecionado(periodo);
    const hoje = new Date();
    
    switch(periodo) {
      case 'hoje':
        setDataInicio(format(hoje, 'yyyy-MM-dd'));
        setDataFim(format(hoje, 'yyyy-MM-dd'));
        break;
      case 'ontem':
        const ontem = subDays(hoje, 1);
        setDataInicio(format(ontem, 'yyyy-MM-dd'));
        setDataFim(format(ontem, 'yyyy-MM-dd'));
        break;
      case 'semana':
        setDataInicio(format(subDays(hoje, 7), 'yyyy-MM-dd'));
        setDataFim(format(hoje, 'yyyy-MM-dd'));
        break;
      case 'mes':
        setDataInicio(format(startOfMonth(hoje), 'yyyy-MM-dd'));
        setDataFim(format(hoje, 'yyyy-MM-dd'));
        break;
      case 'mesPassado':
        const mesPassado = subMonths(hoje, 1);
        setDataInicio(format(startOfMonth(mesPassado), 'yyyy-MM-dd'));
        setDataFim(format(endOfMonth(mesPassado), 'yyyy-MM-dd'));
        break;
      default:
        break;
    }
  };

  const handleSalvar = async () => {
    try {
      if (!formData.descricao?.trim()) {
        mostrarSnackbar('Descrição é obrigatória', 'error');
        return;
      }

      const valorNumerico = parseFloat(formData.valor);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        mostrarSnackbar('Valor deve ser maior que zero', 'error');
        return;
      }

      const dadosParaSalvar = {
        tipo: formData.tipo,
        descricao: formData.descricao.trim(),
        valor: valorNumerico,
        data: formData.data,
        dataVencimento: formData.dataVencimento,
        categoria: formData.categoria || null,
        formaPagamento: formData.formaPagamento,
        status: formData.status,
        clienteId: formData.clienteId || null,
        observacoes: formData.observacoes || null,
        parcelas: Number(formData.parcelas) || 1,
        updatedAt: new Date().toISOString(),
      };

      if (formData.status === 'pago') {
        dadosParaSalvar.dataPagamento = new Date().toISOString();
      }

      if (transacaoEditando) {
        await firebaseService.update('transacoes', transacaoEditando.id, dadosParaSalvar);
        mostrarSnackbar('Transação atualizada com sucesso!');
      } else {
        dadosParaSalvar.createdAt = new Date().toISOString();
        await firebaseService.add('transacoes', dadosParaSalvar);
        mostrarSnackbar('Transação criada com sucesso!');
      }

      await recarregar();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      mostrarSnackbar('Erro ao salvar transação', 'error');
    }
  };

  const handleAbrirFecharCaixa = async () => {
    try {
      const userId = usuario?.uid || usuario?.id;
      if (!userId) {
        mostrarSnackbar('Usuário não identificado', 'error');
        return;
      }

      if (!caixaAtual) {
        // Abrir caixa
        const novoCaixa = {
          dataAbertura: new Date().toISOString(),
          saldoInicial: 0,
          saldoAtual: 0,
          movimentacoes: [],
          status: 'aberto',
          responsavelId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await firebaseService.add('caixa', novoCaixa);
        mostrarSnackbar('✅ Caixa aberto com sucesso!');
      } else {
        // Fechar caixa
        const dadosAtualizacao = {
          status: 'fechado',
          dataFechamento: new Date().toISOString(),
          saldoFinal: caixaAtual.saldoAtual || 0,
          updatedAt: new Date().toISOString(),
        };
        
        await firebaseService.update('caixa', caixaAtual.id, dadosAtualizacao);
        mostrarSnackbar('✅ Caixa fechado com sucesso!');
      }

      await recarregar();
      handleCloseCaixaDialog();
    } catch (error) {
      console.error('Erro ao abrir/fechar caixa:', error);
      mostrarSnackbar('Erro ao operar caixa', 'error');
    }
  };

  const handleMarcarComoPago = async (transacao) => {
    try {
      const dadosTransacao = {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await firebaseService.update('transacoes', transacao.id, dadosTransacao);

      // Atualizar caixa se estiver aberto
      if (caixaAtual) {
        const valorOperacao = transacao.tipo === 'receita' ? transacao.valor : -transacao.valor;
        const novoSaldo = (caixaAtual.saldoAtual || 0) + valorOperacao;
        
        const novaMovimentacao = {
          id: Date.now().toString(),
          tipo: transacao.tipo,
          valor: Number(transacao.valor),
          descricao: transacao.descricao,
          data: new Date().toISOString(),
          transacaoId: transacao.id,
        };
        
        const movimentacoesAtuais = Array.isArray(caixaAtual.movimentacoes) ? caixaAtual.movimentacoes : [];
        const novasMovimentacoes = [...movimentacoesAtuais, novaMovimentacao];
        
        await firebaseService.update('caixa', caixaAtual.id, {
          saldoAtual: novoSaldo,
          movimentacoes: novasMovimentacoes,
          updatedAt: new Date().toISOString(),
        });
      }

      await recarregar();
      mostrarSnackbar('✅ Transação marcada como paga!');
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      mostrarSnackbar('Erro ao processar pagamento', 'error');
    }
  };

  // Calcular estatísticas
  const stats = useMemo(() => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    const transacoesPeriodo = transacoes.filter(t => {
      if (!t.data) return false;
      const data = new Date(t.data);
      return data >= inicio && data <= fim && t.status === 'pago';
    });

    const receitas = transacoesPeriodo
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const despesas = transacoesPeriodo
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const aReceber = transacoes
      .filter(t => t.tipo === 'receita' && (t.status === 'pendente' || t.status === 'atrasado'))
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const aPagar = transacoes
      .filter(t => t.tipo === 'despesa' && (t.status === 'pendente' || t.status === 'atrasado'))
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const atrasados = transacoes.filter(t => {
      if (t.status !== 'pendente') return false;
      const vencimento = new Date(t.dataVencimento);
      return vencimento < new Date();
    }).length;

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      aReceber,
      aPagar,
      atrasados,
    };
  }, [transacoes, dataInicio, dataFim]);

  // Dados para gráficos
  const dadosGrafico = useMemo(() => {
    const dias = {};
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const dia = format(d, 'yyyy-MM-dd');
      dias[dia] = { 
        receitas: 0, 
        despesas: 0, 
        saldo: 0,
        dia: format(d, 'dd/MM')
      };
    }

    transacoes
      .filter(t => t.status === 'pago')
      .forEach(t => {
        const data = t.data.split('T')[0];
        if (dias[data]) {
          const valor = Number(t.valor) || 0;
          if (t.tipo === 'receita') {
            dias[data].receitas += valor;
          } else {
            dias[data].despesas += valor;
          }
          dias[data].saldo = dias[data].receitas - dias[data].despesas;
        }
      });

    return Object.values(dias);
  }, [transacoes, dataInicio, dataFim]);

  const dadosPizza = useMemo(() => {
    const categorias = {};
    transacoes
      .filter(t => t.status === 'pago')
      .forEach(t => {
        const cat = t.categoria || 'Outros';
        if (!categorias[cat]) {
          categorias[cat] = 0;
        }
        categorias[cat] += Number(t.valor) || 0;
      });

    return Object.entries(categorias)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transacoes]);

  // Filtrar transações
  const transacoesFiltradas = useMemo(() => {
    let lista = transacoes;
    
    if (tabValue === 1) {
      lista = transacoes.filter(t => t.tipo === 'receita');
    } else if (tabValue === 2) {
      lista = transacoes.filter(t => t.tipo === 'despesa');
    }

    return lista.filter(t => {
      const matchesTexto = filtro === '' || 
        t.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
        t.categoria?.toLowerCase().includes(filtro.toLowerCase());

      const matchesStatus = filtroStatus === 'todos' || t.status === filtroStatus;
      const matchesTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
      const matchesCategoria = filtroCategoria === 'todas' || t.categoria === filtroCategoria;

      return matchesTexto && matchesStatus && matchesTipo && matchesCategoria;
    });
  }, [transacoes, tabValue, filtro, filtroStatus, filtroTipo, filtroCategoria]);

  const categoriasUnicas = useMemo(() => {
    return [...new Set(transacoes.map(t => t.categoria).filter(Boolean))];
  }, [transacoes]);

  if (carregando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon sx={{ fontSize: 40 }} />
                Financeiro
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Gerencie receitas, despesas e fluxo de caixa
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={recarregar}
              >
                Atualizar
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AccountBalanceIcon />}
                onClick={handleOpenCaixaDialog}
                color={caixaAtual ? 'success' : 'primary'}
              >
                {caixaAtual ? 'Fechar Caixa' : 'Abrir Caixa'}
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
              >
                Nova Transação
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Status do Caixa */}
        {caixaAtual && (
          <Fade in={true}>
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={handleOpenCaixaDialog}>
                  Fechar Caixa
                </Button>
              }
            >
              <strong>Caixa Aberto</strong> - Saldo atual: R$ {(caixaAtual.saldoAtual || 0).toFixed(2)} | 
              Abertura: {caixaAtual.dataAbertura ? new Date(caixaAtual.dataAbertura).toLocaleString('pt-BR') : ''}
            </Alert>
          </Fade>
        )}

        {/* Cards de Resumo */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Saldo do Período
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: stats.saldo >= 0 ? '#4caf50' : '#f44336' 
                      }}>
                        R$ {stats.saldo.toFixed(2)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: stats.saldo >= 0 ? '#4caf50' : '#f44336', width: 56, height: 56 }}>
                      <MoneyIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Receitas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        R$ {stats.receitas.toFixed(2)}
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

          <Grid item xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Despesas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                        R$ {stats.despesas.toFixed(2)}
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

          <Grid item xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card sx={{ bgcolor: stats.atrasados > 0 ? '#ffebee' : '#f5f5f5' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Atrasados
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: stats.atrasados > 0 ? '#f44336' : '#9e9e9e' 
                      }}>
                        {stats.atrasados}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: stats.atrasados > 0 ? '#f44336' : '#9e9e9e', width: 56, height: 56 }}>
                      <WarningIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Filtro de Período */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={periodoSelecionado}
                    label="Período"
                    onChange={(e) => handlePeriodoChange(e.target.value)}
                  >
                    <MenuItem value="hoje">Hoje</MenuItem>
                    <MenuItem value="ontem">Ontem</MenuItem>
                    <MenuItem value="semana">Últimos 7 dias</MenuItem>
                    <MenuItem value="mes">Este mês</MenuItem>
                    <MenuItem value="mesPassado">Mês passado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Data Início"
                  value={new Date(dataInicio)}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDataInicio(format(newValue, 'yyyy-MM-dd'));
                      setPeriodoSelecionado('personalizado');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Data Fim"
                  value={new Date(dataFim)}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDataFim(format(newValue, 'yyyy-MM-dd'));
                      setPeriodoSelecionado('personalizado');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  A receber: R$ {stats.aReceber.toFixed(2)} | A pagar: R$ {stats.aPagar.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Fluxo de Caixa Diário
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dadosGrafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dia" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value) => `R$ ${value.toFixed(2)}`}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="receitas" fill="#4caf50" fillOpacity={0.3} stroke="#4caf50" />
                        <Area type="monotone" dataKey="despesas" fill="#f44336" fillOpacity={0.3} stroke="#f44336" />
                        <Line type="monotone" dataKey="saldo" stroke="#9c27b0" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
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
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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

        {/* Tabs e Tabela */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Todas" />
              <Tab label="Receitas" />
              <Tab label="Despesas" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Filtros */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por descrição ou categoria..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: filtro && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setFiltro('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtroStatus}
                    label="Status"
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {Object.keys(statusColors).map(status => (
                      <MenuItem key={status} value={status}>
                        {statusColors[status].label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtroTipo}
                    label="Tipo"
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="receita">Receitas</MenuItem>
                    <MenuItem value="despesa">Despesas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={filtroCategoria}
                    label="Categoria"
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <MenuItem value="todas">Todas</MenuItem>
                    {categoriasUnicas.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setFiltro('');
                    setFiltroStatus('todos');
                    setFiltroTipo('todos');
                    setFiltroCategoria('todas');
                  }}
                >
                  Limpar Filtros
                </Button>
              </Grid>
            </Grid>

            {/* Tabela */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell><strong>Categoria</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {transacoesFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transacao, index) => {
                      const cliente = clientes.find(c => c.id === transacao.clienteId);
                      
                      return (
                        <motion.tr
                          key={transacao.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TableCell>
                            {transacao.data ? new Date(transacao.data).toLocaleDateString('pt-BR') : '-'}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {transacao.tipo === 'receita' ? (
                                <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                              ) : (
                                <TrendingDownIcon sx={{ color: '#f44336', fontSize: 20 }} />
                              )}
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {transacao.descricao}
                                </Typography>
                                {cliente && (
                                  <Typography variant="caption" color="textSecondary">
                                    Cliente: {cliente.nome}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transacao.categoria || 'Sem categoria'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: transacao.tipo === 'receita' ? '#4caf50' : '#f44336',
                              }}
                            >
                              {transacao.tipo === 'receita' ? '+' : '-'} R$ {Number(transacao.valor).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusColors[transacao.status]?.icon}
                              label={statusColors[transacao.status]?.label || transacao.status}
                              size="small"
                              sx={{
                                bgcolor: `${statusColors[transacao.status]?.color}20`,
                                color: statusColors[transacao.status]?.color,
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Ver Detalhes">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDetalhes(transacao)}
                                  sx={{ color: '#9c27b0' }}
                                >
                                  <ReceiptIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {transacao.status === 'pendente' && (
                                <Tooltip title="Marcar como Pago">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarcarComoPago(transacao)}
                                    sx={{ color: '#4caf50' }}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(transacao)}
                                  sx={{ color: '#ff4081' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Duplicar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog({ ...transacao, descricao: `${transacao.descricao} (cópia)`, status: 'pendente' })}
                                  sx={{ color: '#2196f3' }}
                                >
                                  <FileCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>

                  {transacoesFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="body1" color="textSecondary">
                          Nenhuma transação encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={transacoesFiltradas.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Itens por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Dialogs - manter os mesmos dialogs do código original */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {/* ... conteúdo do dialog ... */}
      </Dialog>

      <Dialog open={openCaixaDialog} onClose={handleCloseCaixaDialog} maxWidth="sm" fullWidth>
        {/* ... conteúdo do dialog ... */}
      </Dialog>

      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="sm" fullWidth>
        {/* ... conteúdo do dialog ... */}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}

export default ModernFinanceiro;
