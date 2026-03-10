// src/pages/ModernFinanceiro.js
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
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
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
  Legend,
} from 'recharts';

const COLORS = ['#9c27b0', '#ff4081', '#4caf50', '#ff9800', '#f44336', '#2196f3'];

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente' },
  pago: { color: '#4caf50', label: 'Pago' },
  atrasado: { color: '#f44336', label: 'Atrasado' },
  cancelado: { color: '#9e9e9e', label: 'Cancelado' },
};

const tipoColors = {
  receita: { color: '#4caf50', label: 'Receita', icon: <TrendingUpIcon /> },
  despesa: { color: '#f44336', label: 'Despesa', icon: <TrendingDownIcon /> },
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ModernFinanceiro() {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Dados
  const [transacoes, setTransacoes] = useState([]);
  const [contasPagar, setContasPagar] = useState([]);
  const [contasReceber, setContasReceber] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [caixa, setCaixa] = useState(null);
  
  // Filtros
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [openCaixaDialog, setOpenCaixaDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState(null);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    tipo: 'receita',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    dataVencimento: '',
    categoria: '',
    formaPagamento: 'dinheiro',
    status: 'pendente',
    clienteId: '',
    fornecedorId: '',
    observacoes: '',
    parcelas: 1,
    recorrente: false,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const normalizarValor = (valor) => {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
  };

  const normalizarData = (data) => {
    if (!data) return null;
    const dataObj = new Date(data);
    return Number.isNaN(dataObj.getTime()) ? null : dataObj;
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [transacoesData, caixaData] = await Promise.all([
        firebaseService.getAll('transacoes').catch(() => []),
        firebaseService.getAll('caixa').catch(() => []),
      ]);
      
      const transacoesNormalizadas = (transacoesData || []).map((transacao) => ({
        ...transacao,
        valor: normalizarValor(transacao?.valor),
      }));

      setTransacoes(transacoesNormalizadas);
      setContasPagar(transacoesNormalizadas.filter(t => t.tipo === 'despesa'));
      setContasReceber(transacoesNormalizadas.filter(t => t.tipo === 'receita'));
      
      // Pega o caixa atual (último caixa aberto)
      let caixaAtual = null;
      if (caixaData && caixaData.length > 0) {
        // Ordenar por data de abertura (mais recente primeiro)
        caixaAtual = caixaData
          .filter(c => c && c.dataAbertura) // Filtrar caixas válidos
          .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))[0];
      }
      
      setCaixa(caixaAtual || { 
        saldoAtual: 0, 
        status: 'fechado',
        movimentacoes: [] 
      });
      
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (transacao = null) => {
    if (transacao) {
      setTransacaoEditando(transacao);
      setFormData({
        tipo: transacao.tipo || 'receita',
        descricao: transacao.descricao || '',
        valor: transacao.valor || '',
        data: transacao.data || new Date().toISOString().split('T')[0],
        dataVencimento: transacao.dataVencimento || '',
        categoria: transacao.categoria || '',
        formaPagamento: transacao.formaPagamento || 'dinheiro',
        status: transacao.status || 'pendente',
        clienteId: transacao.clienteId || '',
        fornecedorId: transacao.fornecedorId || '',
        observacoes: transacao.observacoes || '',
        parcelas: transacao.parcelas || 1,
        recorrente: transacao.recorrente || false,
      });
    } else {
      setTransacaoEditando(null);
      setFormData({
        tipo: 'receita',
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        dataVencimento: '',
        categoria: '',
        formaPagamento: 'dinheiro',
        status: 'pendente',
        clienteId: '',
        fornecedorId: '',
        observacoes: '',
        parcelas: 1,
        recorrente: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTransacaoEditando(null);
  };

  const handleOpenCaixaDialog = () => {
    setOpenCaixaDialog(true);
  };

  const handleCloseCaixaDialog = () => {
    setOpenCaixaDialog(false);
  };

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

const handleSalvar = async () => {
  try {
    // Validações
    if (!formData.descricao?.trim()) {
      mostrarSnackbar('Descrição é obrigatória', 'error');
      return;
    }

    const valorNumerico = parseFloat(formData.valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      mostrarSnackbar('Valor deve ser maior que zero', 'error');
      return;
    }

    // Preparar dados para salvar
    const dadosParaSalvar = {
      tipo: String(formData.tipo),
      descricao: String(formData.descricao).trim(),
      valor: Number(valorNumerico),
      data: String(formData.data),
      dataVencimento: formData.dataVencimento ? String(formData.dataVencimento) : null,
      categoria: formData.categoria ? String(formData.categoria) : null,
      formaPagamento: String(formData.formaPagamento),
      status: String(formData.status),
      clienteId: formData.clienteId ? String(formData.clienteId) : null,
      fornecedorId: formData.fornecedorId ? String(formData.fornecedorId) : null,
      observacoes: formData.observacoes ? String(formData.observacoes) : null,
      parcelas: Number(formData.parcelas) || 1,
      recorrente: Boolean(formData.recorrente),
      updatedAt: new Date().toISOString(),
    };

    // Adicionar data de pagamento se status for pago
    if (formData.status === 'pago') {
      dadosParaSalvar.dataPagamento = new Date().toISOString();
    }

    // Remover campos undefined
    Object.keys(dadosParaSalvar).forEach(key => {
      if (dadosParaSalvar[key] === undefined) {
        delete dadosParaSalvar[key];
      }
    });

    if (transacaoEditando) {
      await firebaseService.update('transacoes', transacaoEditando.id, dadosParaSalvar);
      
      // Atualizar estado local
      const transacoesAtualizadas = transacoes.map(t => 
        t.id === transacaoEditando.id ? { ...t, ...dadosParaSalvar, id: transacaoEditando.id } : t
      );
      setTransacoes(transacoesAtualizadas);
      setContasPagar(transacoesAtualizadas.filter(t => t.tipo === 'despesa'));
      setContasReceber(transacoesAtualizadas.filter(t => t.tipo === 'receita'));
      
      mostrarSnackbar('Transação atualizada com sucesso!');
    } else {
      dadosParaSalvar.dataCriacao = new Date().toISOString();
      
      const novoId = await firebaseService.add('transacoes', dadosParaSalvar);
      
      const novaTransacao = { ...dadosParaSalvar, id: novoId };
      const novasTransacoes = [...transacoes, novaTransacao];
      setTransacoes(novasTransacoes);
      setContasPagar(novasTransacoes.filter(t => t.tipo === 'despesa'));
      setContasReceber(novasTransacoes.filter(t => t.tipo === 'receita'));
      
      mostrarSnackbar('Transação criada com sucesso!');
    }

    handleCloseDialog();
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
    mostrarSnackbar('Erro ao salvar transação', 'error');
  }
};

const handleAbrirFecharCaixa = async () => {
  try {
    if (!caixa || caixa.status === 'fechado') {
      // Abrir caixa
      // Buscar usuário do localStorage com segurança
      let usuarioId = 'sistema'; // Valor padrão
      try {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
          const usuario = JSON.parse(usuarioStr);
          usuarioId = usuario?.id || 'sistema';
        }
      } catch (e) {
        console.warn('Erro ao parsear usuário do localStorage:', e);
      }

      // Garantir que todos os campos têm valores válidos
      const novoCaixa = {
        dataAbertura: new Date().toISOString(),
        saldoInicial: 0,
        saldoAtual: 0,
        movimentacoes: [], // Array vazio, não null
        status: 'aberto',
        responsavelId: String(usuarioId), // Converter para string
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Validar se não há undefined
      Object.keys(novoCaixa).forEach(key => {
        if (novoCaixa[key] === undefined) {
          novoCaixa[key] = null; // Substituir undefined por null
        }
      });
      
      const novoId = await firebaseService.add('caixa', novoCaixa);
      setCaixa({ ...novoCaixa, id: novoId });
      mostrarSnackbar('Caixa aberto com sucesso!');
    } else {
      // Fechar caixa - garantir que só enviamos os campos necessários
      const dadosAtualizacao = {
        status: 'fechado',
        dataFechamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Validar se não há undefined
      Object.keys(dadosAtualizacao).forEach(key => {
        if (dadosAtualizacao[key] === undefined) {
          dadosAtualizacao[key] = null;
        }
      });
      
      await firebaseService.update('caixa', caixa.id, dadosAtualizacao);
      
      setCaixa({ 
        ...caixa, 
        status: 'fechado',
        dataFechamento: new Date().toISOString() 
      });
      
      mostrarSnackbar('Caixa fechado com sucesso!');
    }
    handleCloseCaixaDialog();
  } catch (error) {
    console.error('Erro ao abrir/fechar caixa:', error);
    mostrarSnackbar('Erro ao operar caixa', 'error');
  }
};

const handleMarcarComoPago = async (transacao) => {
  try {
    // Validar dados da transação
    if (!transacao || !transacao.id) {
      mostrarSnackbar('Transação inválida', 'error');
      return;
    }

    // Atualizar transação
    const dadosTransacao = {
      status: 'pago',
      dataPagamento: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await firebaseService.update('transacoes', transacao.id, dadosTransacao);

    // Atualizar estado local
    const transacoesAtualizadas = transacoes.map(t => 
      t.id === transacao.id ? { ...t, ...dadosTransacao } : t
    );
    setTransacoes(transacoesAtualizadas);
    setContasPagar(transacoesAtualizadas.filter(t => t.tipo === 'despesa'));
    setContasReceber(transacoesAtualizadas.filter(t => t.tipo === 'receita'));

    // Atualizar saldo do caixa se estiver aberto
    if (caixa && caixa.status === 'aberto' && caixa.id) {
      // Calcular novo saldo
      const valorTransacao = normalizarValor(transacao.valor);
      const valorOperacao = transacao.tipo === 'receita' ? valorTransacao : -valorTransacao;
      const novoSaldo = (caixa.saldoAtual || 0) + valorOperacao;
      
      // Criar nova movimentação
      const novaMovimentacao = {
        id: Date.now().toString(),
        tipo: transacao.tipo,
        valor: valorTransacao,
        descricao: String(transacao.descricao || ''),
        data: new Date().toISOString(),
        transacaoId: String(transacao.id),
      };
      
      // Garantir que movimentacoes é um array
      const movimentacoesAtuais = Array.isArray(caixa.movimentacoes) ? caixa.movimentacoes : [];
      const novasMovimentacoes = [...movimentacoesAtuais, novaMovimentacao];
      
      // Dados para atualizar o caixa
      const dadosCaixa = {
        saldoAtual: Number(novoSaldo), // Garantir que é número
        movimentacoes: novasMovimentacoes,
        updatedAt: new Date().toISOString(),
      };
      
      // Validar dados antes de enviar
      Object.keys(dadosCaixa).forEach(key => {
        if (dadosCaixa[key] === undefined) {
          dadosCaixa[key] = null;
        }
      });
      
      await firebaseService.update('caixa', caixa.id, dadosCaixa);
      
      setCaixa({ 
        ...caixa, 
        saldoAtual: novoSaldo, 
        movimentacoes: novasMovimentacoes 
      });
    }

    mostrarSnackbar('Transação marcada como paga!');
  } catch (error) {
    console.error('Erro ao marcar como pago:', error);
    mostrarSnackbar('Erro ao processar pagamento', 'error');
  }
};

  // Cálculo das estatísticas
  const calcularEstatisticas = () => {
    const transacoesPeriodo = transacoes.filter(t => {
      const data = normalizarData(t.data);
      if (!data) return false;
      return data >= new Date(dataInicio) && data <= new Date(dataFim);
    });

    const receitas = transacoesPeriodo
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + normalizarValor(t.valor), 0);

    const despesas = transacoesPeriodo
      .filter(t => t.tipo === 'despesa' && t.status === 'pago')
      .reduce((acc, t) => acc + normalizarValor(t.valor), 0);

    const saldo = receitas - despesas;

    const aReceber = transacoesPeriodo
      .filter(t => t.tipo === 'receita' && t.status === 'pendente')
      .reduce((acc, t) => acc + normalizarValor(t.valor), 0);

    const aPagar = transacoesPeriodo
      .filter(t => t.tipo === 'despesa' && t.status === 'pendente')
      .reduce((acc, t) => acc + normalizarValor(t.valor), 0);

    const atrasados = transacoesPeriodo.filter(t => {
      if (t.status !== 'pendente') return false;
      const vencimento = normalizarData(t.dataVencimento);
      if (!vencimento) return false;
      const hoje = new Date();
      return vencimento < hoje;
    }).length;

    return {
      receitas,
      despesas,
      saldo,
      aReceber,
      aPagar,
      atrasados,
    };
  };

  // Dados para gráficos
  const gerarDadosGraficoLinha = () => {
    const dias = {};
    const dataInicioObj = new Date(dataInicio);
    const dataFimObj = new Date(dataFim);
    
    for (let d = new Date(dataInicioObj); d <= dataFimObj; d.setDate(d.getDate() + 1)) {
      const dia = d.toISOString().split('T')[0];
      dias[dia] = { receitas: 0, despesas: 0, saldo: 0 };
    }

    transacoes
      .filter(t => t.status === 'pago')
      .forEach(t => {
        const data = (t.data || '').split('T')[0];
        const valorTransacao = normalizarValor(t.valor);
        if (dias[data]) {
          if (t.tipo === 'receita') {
            dias[data].receitas += valorTransacao;
          } else {
            dias[data].despesas += valorTransacao;
          }
          dias[data].saldo = dias[data].receitas - dias[data].despesas;
        }
      });

    return Object.keys(dias).map(dia => ({
      dia: new Date(dia).toLocaleDateString('pt-BR'),
      receitas: dias[dia].receitas,
      despesas: dias[dia].despesas,
      saldo: dias[dia].saldo,
    }));
  };

  const gerarDadosGraficoPizza = () => {
    const categorias = {};
    transacoes
      .filter(t => t.status === 'pago')
      .forEach(t => {
        const cat = t.categoria || 'Outros';
        if (!categorias[cat]) {
          categorias[cat] = 0;
        }
        categorias[cat] += normalizarValor(t.valor);
      });

    return Object.keys(categorias).map(cat => ({
      name: cat,
      value: categorias[cat],
    }));
  };

  const stats = calcularEstatisticas();
  const dadosGraficoLinha = gerarDadosGraficoLinha();
  const dadosGraficoPizza = gerarDadosGraficoPizza();

  // Filtrar transações baseado na tab atual
  const getTransacoesFiltradas = () => {
    let lista = [];
    if (tabValue === 0) lista = transacoes;
    else if (tabValue === 1) lista = contasReceber;
    else if (tabValue === 2) lista = contasPagar;

    return lista.filter(t => {
      const matchesTexto = filtro === '' || 
        t.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
        t.categoria?.toLowerCase().includes(filtro.toLowerCase());

      const matchesStatus = filtroStatus === 'todos' || t.status === filtroStatus;
      const matchesTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;

      return matchesTexto && matchesStatus && matchesTipo;
    });
  };

  const transacoesFiltradas = getTransacoesFiltradas();
  const paginatedTransacoes = transacoesFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Financeiro
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie receitas, despesas e fluxo de caixa
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AccountBalanceIcon />}
            onClick={handleOpenCaixaDialog}
            color={caixa?.status === 'aberto' ? 'success' : 'primary'}
          >
            {caixa?.status === 'aberto' ? 'Fechar Caixa' : 'Abrir Caixa'}
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

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Saldo Atual
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stats.saldo >= 0 ? '#4caf50' : '#f44336' }}>
                      R$ {stats.saldo.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                    <MoneyIcon />
                  </Avatar>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Caixa: {caixa?.status === 'aberto' ? 'Aberto' : 'Fechado'}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
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
                <Typography variant="caption" color="textSecondary">
                  A receber: R$ {stats.aReceber.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
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
                <Typography variant="caption" color="textSecondary">
                  A pagar: R$ {stats.aPagar.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ bgcolor: stats.atrasados > 0 ? '#ffebee' : '#f5f5f5' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Atrasados
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stats.atrasados > 0 ? '#f44336' : '#9e9e9e' }}>
                      {stats.atrasados}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stats.atrasados > 0 ? '#f44336' : '#9e9e9e', width: 56, height: 56 }}>
                    <WarningIcon />
                  </Avatar>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Contas vencidas
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Filtro de Período */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={carregarDados}
                sx={{ mr: 1 }}
              >
                Atualizar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Fluxo de Caixa
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dadosGraficoLinha}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value) => `R$ ${normalizarValor(value).toFixed(2)}`}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="receitas" stackId="1" stroke="#4caf50" fill="#4caf50" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="despesas" stackId="1" stroke="#f44336" fill="#f44336" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="saldo" stroke="#9c27b0" fill="none" strokeWidth={2} />
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
            transition={{ delay: 0.6 }}
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
                        data={dadosGraficoPizza}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosGraficoPizza.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => `R$ ${normalizarValor(value).toFixed(2)}`}
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
            <Tab label="Todas Transações" />
            <Tab label="Contas a Receber" />
            <Tab label="Contas a Pagar" />
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

            <Grid item xs={12} md={3}>
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

            <Grid item xs={12} md={3}>
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
          </Grid>

          {/* Tabela */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Descrição</strong></TableCell>
                  <TableCell><strong>Categoria</strong></TableCell>
                  <TableCell><strong>Valor</strong></TableCell>
                  <TableCell><strong>Vencimento</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {paginatedTransacoes.map((transacao, index) => (
                    <motion.tr
                      key={transacao.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>
                        {new Date(transacao.data).toLocaleDateString('pt-BR')}
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
                            {transacao.parcelas > 1 && (
                              <Typography variant="caption" color="textSecondary">
                                {transacao.parcelas}x
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
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: transacao.tipo === 'receita' ? '#4caf50' : '#f44336',
                          }}
                        >
                          {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor?.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {transacao.dataVencimento ? (
                          <Box>
                            <Typography variant="body2">
                              {new Date(transacao.dataVencimento).toLocaleDateString('pt-BR')}
                            </Typography>
                            {transacao.status === 'pendente' && new Date(transacao.dataVencimento) < new Date() && (
                              <Typography variant="caption" color="error">
                                Vencida
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
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
                              <ReceiptIcon />
                            </IconButton>
                          </Tooltip>

                          {transacao.status === 'pendente' && (
                            <Tooltip title="Marcar como Pago">
                              <IconButton
                                size="small"
                                onClick={() => handleMarcarComoPago(transacao)}
                                sx={{ color: '#4caf50' }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(transacao)}
                              sx={{ color: '#ff4081' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {paginatedTransacoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
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
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={transacoesFiltradas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </CardContent>
      </Card>

      {/* Dialog de Transação */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {transacaoEditando ? 'Editar Transação' : 'Nova Transação'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="tipo"
                  value={formData.tipo}
                  label="Tipo *"
                  onChange={handleInputChange}
                >
                  <MenuItem value="receita">Receita</MenuItem>
                  <MenuItem value="despesa">Despesa</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descrição"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                required
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Valor"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                required
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Data"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Data de Vencimento"
                name="dataVencimento"
                value={formData.dataVencimento}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                size="small"
                placeholder="Ex: Vendas, Salários, etc"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  name="formaPagamento"
                  value={formData.formaPagamento}
                  label="Forma de Pagamento"
                  onChange={handleInputChange}
                >
                  <MenuItem value="dinheiro">Dinheiro</MenuItem>
                  <MenuItem value="cartao_credito">Cartão de Crédito</MenuItem>
                  <MenuItem value="cartao_debito">Cartão de Débito</MenuItem>
                  <MenuItem value="pix">PIX</MenuItem>
                  <MenuItem value="boleto">Boleto</MenuItem>
                  <MenuItem value="transferencia">Transferência</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="pago">Pago</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                multiline
                rows={3}
                size="small"
                placeholder="Observações adicionais..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
          >
            {transacaoEditando ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Caixa */}
      <Dialog open={openCaixaDialog} onClose={handleCloseCaixaDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {caixa?.status === 'aberto' ? 'Fechar Caixa' : 'Abrir Caixa'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {caixa?.status === 'aberto' ? (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Resumo do Caixa
                </Alert>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#4caf50' }}>
                        <MoneyIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Saldo Atual"
                      secondary={`R$ ${caixa.saldoAtual?.toFixed(2)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#ff9800' }}>
                        <ReceiptIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Movimentações"
                      secondary={`${caixa.movimentacoes?.length || 0} transações`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#2196f3' }}>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Aberto em"
                      secondary={new Date(caixa.dataAbertura).toLocaleString('pt-BR')}
                    />
                  </ListItem>
                </List>
              </Box>
            ) : (
              <Typography>
                Deseja abrir o caixa para iniciar as operações do dia?
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCaixaDialog}>Cancelar</Button>
          <Button
            onClick={handleAbrirFecharCaixa}
            variant="contained"
            color={caixa?.status === 'aberto' ? 'error' : 'success'}
          >
            {caixa?.status === 'aberto' ? 'Fechar Caixa' : 'Abrir Caixa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes da Transação
        </DialogTitle>
        <DialogContent>
          {transacaoSelecionada && (
            <Box sx={{ mt: 2 }}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#9c27b0' }}>
                      <ReceiptIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Descrição"
                    secondary={transacaoSelecionada.descricao}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: transacaoSelecionada.tipo === 'receita' ? '#4caf50' : '#f44336' }}>
                      {transacaoSelecionada.tipo === 'receita' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Valor"
                    secondary={`R$ ${transacaoSelecionada.valor?.toFixed(2)}`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#ff9800' }}>
                      <CalendarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Data"
                    secondary={new Date(transacaoSelecionada.data).toLocaleDateString('pt-BR')}
                  />
                </ListItem>

                {transacaoSelecionada.dataVencimento && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#f44336' }}>
                        <WarningIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Vencimento"
                      secondary={new Date(transacaoSelecionada.dataVencimento).toLocaleDateString('pt-BR')}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#2196f3' }}>
                      <PaymentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Forma de Pagamento"
                    secondary={transacaoSelecionada.formaPagamento || 'Não informado'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#9e9e9e' }}>
                      <BarChartIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Categoria"
                    secondary={transacaoSelecionada.categoria || 'Sem categoria'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: statusColors[transacaoSelecionada.status]?.color || '#9e9e9e'
                    }}>
                      {transacaoSelecionada.status === 'pago' ? <CheckCircleIcon /> : 
                       transacaoSelecionada.status === 'atrasado' ? <WarningIcon /> : 
                       <CancelIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Status"
                    secondary={statusColors[transacaoSelecionada.status]?.label || transacaoSelecionada.status}
                  />
                </ListItem>

                {transacaoSelecionada.observacoes && (
                  <ListItem>
                    <ListItemText
                      primary="Observações"
                      secondary={transacaoSelecionada.observacoes}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ModernFinanceiro;
