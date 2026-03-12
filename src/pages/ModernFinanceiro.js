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
  CircularProgress,
  Fade,
  Zoom,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
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
  FileCopy as FileCopyIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  ReceiptLong as ReceiptLongIcon,
  PriceCheck as PriceCheckIcon,
  SwapHoriz as SwapHorizIcon,
  Savings as SavingsIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Percent as PercentIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
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
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';

// Constantes
const COLORS = ['#9c27b0', '#ff4081', '#4caf50', '#ff9800', '#f44336', '#2196f3', '#00bcd4', '#795548'];

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente', icon: <WarningIcon /> },
  pago: { color: '#4caf50', label: 'Pago', icon: <CheckCircleIcon /> },
  atrasado: { color: '#f44336', label: 'Atrasado', icon: <CancelIcon /> },
  cancelado: { color: '#9e9e9e', label: 'Cancelado', icon: <CancelIcon /> },
  recebido: { color: '#4caf50', label: 'Recebido', icon: <CheckCircleIcon /> },
  agendado: { color: '#2196f3', label: 'Agendado', icon: <CalendarIcon /> },
  concluida: { color: '#4caf50', label: 'Concluída', icon: <CheckCircleIcon /> },
  cancelada: { color: '#f44336', label: 'Cancelada', icon: <CancelIcon /> },
};

const tipoColors = {
  receita: { color: '#4caf50', label: 'Receita', icon: <TrendingUpIcon /> },
  despesa: { color: '#f44336', label: 'Despesa', icon: <TrendingDownIcon /> },
  transferencia: { color: '#9c27b0', label: 'Transferência', icon: <SwapHorizIcon /> },
  investimento: { color: '#ff9800', label: 'Investimento', icon: <ShowChartIcon /> },
  comissao: { color: '#9c27b0', label: 'Comissão', icon: <PercentIcon /> },
  compra: { color: '#ff9800', label: 'Compra', icon: <ShoppingCartIcon /> },
};

const formasPagamento = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '⚡' },
  { value: 'boleto', label: 'Boleto', icon: '📄' },
  { value: 'transferencia', label: 'Transferência', icon: '🔄' },
  { value: 'cheque', label: 'Cheque', icon: '📝' },
  { value: 'credito_loja', label: 'Crédito na Loja', icon: '🏪' },
];

// Função para formatar data no horário de Brasília
const formatarDataBrasilia = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'yyyy-MM-dd');
};

const formatarDataExibicao = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'dd/MM/yyyy');
};

const formatarHoraBrasilia = () => {
  return format(new Date(), 'HH:mm');
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ModernFinanceiro() {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes'); // 'mes', 'ano', 'personalizado'
  
  // Dados
  const [transacoes, setTransacoes] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [contasPagar, setContasPagar] = useState([]);
  const [contasReceber, setContasReceber] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [caixa, setCaixa] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  
  // Filtros
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [dataInicio, setDataInicio] = useState(formatarDataBrasilia(startOfMonth(new Date())));
  const [dataFim, setDataFim] = useState(formatarDataBrasilia(new Date()));
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [openCaixaDialog, setOpenCaixaDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [openRelatorioDialog, setOpenRelatorioDialog] = useState(false);
  const [openFiltroDialog, setOpenFiltroDialog] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState(null);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estado do formulário
  const [formData, setFormData] = useState({
    tipo: 'receita',
    descricao: '',
    valor: '',
    data: formatarDataBrasilia(new Date()),
    dataVencimento: formatarDataBrasilia(new Date()),
    categoria: '',
    formaPagamento: 'dinheiro',
    status: 'pendente',
    clienteId: '',
    fornecedorId: '',
    profissionalId: '',
    atendimentoId: '',
    percentual: '',
    observacoes: '',
    parcelas: 1,
    recorrente: false,
    frequencia: 'mensal',
    anexos: [],
    tags: [],
    // Para compras
    itens: [],
    numeroPedido: '',
    prazoEntrega: '',
    // Origem
    origem: 'manual', // 'manual', 'comissao', 'compra'
    origemId: '',
  });

  // Estado para relatórios
  const [relatorioTipo, setRelatorioTipo] = useState('fluxo');
  const [relatorioPeriodo, setRelatorioPeriodo] = useState('mes');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [
        transacoesData,
        comissoesData,
        comprasData,
        caixaData, 
        clientesData, 
        fornecedoresData,
        profissionaisData,
        servicosData
      ] = await Promise.all([
        firebaseService.getAll('transacoes').catch(() => []),
        firebaseService.getAll('comissoes').catch(() => []),
        firebaseService.getAll('compras').catch(() => []),
        firebaseService.getAll('caixa').catch(() => []),
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('fornecedores').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
      ]);
      
      // Garantir que todos os dados são arrays
      const transacoesArray = Array.isArray(transacoesData) ? transacoesData : [];
      const comissoesArray = Array.isArray(comissoesData) ? comissoesData : [];
      const comprasArray = Array.isArray(comprasData) ? comprasData : [];
      const clientesArray = Array.isArray(clientesData) ? clientesData : [];
      const fornecedoresArray = Array.isArray(fornecedoresData) ? fornecedoresData : [];
      const profissionaisArray = Array.isArray(profissionaisData) ? profissionaisData : [];
      const servicosArray = Array.isArray(servicosData) ? servicosData : [];
      
      setComissoes(comissoesArray);
      setCompras(comprasArray);
      
      // Converter comissões para transações financeiras
      const transacoesComissoes = comissoesArray
        .filter(c => c.status !== 'cancelado')
        .map(comissao => ({
          id: `comissao_${comissao.id}`,
          tipo: 'despesa', // Comissão é despesa para o salão
          origem: 'comissao',
          origemId: comissao.id,
          descricao: `Comissão - ${comissao.servicoNome || 'Serviço'} - ${comissao.profissionalNome || ''}`,
          valor: comissao.valor || 0,
          data: comissao.dataRegistro ? comissao.dataRegistro.split('T')[0] : comissao.data,
          dataVencimento: comissao.data,
          categoria: 'Comissões',
          formaPagamento: 'credito_loja',
          status: comissao.status === 'pago' ? 'pago' : 'pendente',
          profissionalId: comissao.profissionalId,
          profissionalNome: comissao.profissionalNome,
          atendimentoId: comissao.atendimentoId,
          servicoId: comissao.servicoId,
          servicoNome: comissao.servicoNome,
          percentual: comissao.percentual,
          valorAtendimento: comissao.valorAtendimento,
          observacoes: `Comissão de ${comissao.percentual}% sobre atendimento de R$ ${comissao.valorAtendimento}`,
          createdAt: comissao.createdAt,
          updatedAt: comissao.updatedAt,
        }));

      // Converter compras para transações financeiras
      const transacoesCompras = comprasArray
        .filter(c => c.status !== 'cancelada')
        .map(compra => ({
          id: `compra_${compra.id}`,
          tipo: 'despesa',
          origem: 'compra',
          origemId: compra.id,
          descricao: `Compra - ${compra.numeroPedido || 'Pedido'}`,
          valor: compra.valorTotal || 0,
          data: compra.dataCompra,
          dataVencimento: compra.dataCompra,
          categoria: 'Compras',
          formaPagamento: compra.formaPagamento || 'pix',
          status: compra.status === 'pago' ? 'pago' : (compra.status === 'cancelada' ? 'cancelado' : 'pendente'),
          fornecedorId: compra.fornecedorId,
          numeroPedido: compra.numeroPedido,
          prazoEntrega: compra.prazoEntrega,
          itens: compra.itens || [],
          observacoes: compra.observacoes,
          createdAt: compra.createdAt,
          updatedAt: compra.updatedAt,
        }));

      // Combinar todas as transações
      const todasTransacoes = [
        ...transacoesArray,
        ...transacoesComissoes,
        ...transacoesCompras
      ];

      // Ordenar por data (mais recentes primeiro)
      todasTransacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

      setTransacoes(todasTransacoes);
      
      // Separar contas a pagar e receber
      const aPagar = todasTransacoes.filter(t => 
        t.tipo === 'despesa' && t.status !== 'pago' && t.status !== 'cancelado'
      );
      const aReceber = todasTransacoes.filter(t => 
        t.tipo === 'receita' && t.status !== 'pago' && t.status !== 'cancelado'
      );
      
      setContasPagar(aPagar);
      setContasReceber(aReceber);
      
      setClientes(clientesArray);
      setFornecedores(fornecedoresArray);
      setProfissionais(profissionaisArray);
      setServicos(servicosArray);
      
      // Extrair categorias únicas
      const categoriasUnicas = [...new Set(todasTransacoes
        .map(t => t.categoria)
        .filter(Boolean)
      )];
      setCategorias(categoriasUnicas);
      
      // Processar caixa
      if (caixaData && caixaData.length > 0) {
        const caixaAtual = caixaData
          .filter(c => c && c.dataAbertura)
          .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))[0];
        setCaixa(caixaAtual);
      } else {
        setCaixa({ saldoAtual: 0, status: 'fechado', movimentacoes: [] });
      }
      
      toast.success('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Função para pagar comissão
  const handlePagarComissao = async (comissaoId) => {
    try {
      // Atualizar comissão original
      await firebaseService.update('comissoes', comissaoId, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Atualizar estado local
      const comissoesAtualizadas = comissoes.map(c => 
        c.id === comissaoId ? { ...c, status: 'pago', dataPagamento: new Date().toISOString() } : c
      );
      setComissoes(comissoesAtualizadas);

      // Recarregar transações
      await carregarDados();

      // Atualizar caixa
      if (caixa && caixa.status === 'aberto' && caixa.id) {
        const comissao = comissoes.find(c => c.id === comissaoId);
        if (comissao) {
          const novoSaldo = (caixa.saldoAtual || 0) - comissao.valor;
          
          const novaMovimentacao = {
            id: Date.now().toString(),
            tipo: 'despesa',
            valor: comissao.valor,
            descricao: `Pagamento de comissão - ${comissao.profissionalNome}`,
            data: new Date().toISOString(),
            comissaoId: comissaoId,
          };
          
          const movimentacoesAtuais = Array.isArray(caixa.movimentacoes) ? caixa.movimentacoes : [];
          const novasMovimentacoes = [...movimentacoesAtuais, novaMovimentacao];
          
          await firebaseService.update('caixa', caixa.id, {
            saldoAtual: novoSaldo,
            movimentacoes: novasMovimentacoes,
            updatedAt: new Date().toISOString(),
          });
          
          setCaixa({ 
            ...caixa, 
            saldoAtual: novoSaldo, 
            movimentacoes: novasMovimentacoes 
          });
        }
      }

      mostrarSnackbar('✅ Comissão paga com sucesso!');
    } catch (error) {
      console.error('Erro ao pagar comissão:', error);
      mostrarSnackbar('Erro ao pagar comissão', 'error');
    }
  };

  // Função para pagar compra
  const handlePagarCompra = async (compraId) => {
    try {
      // Atualizar compra original
      await firebaseService.update('compras', compraId, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Atualizar estado local
      const comprasAtualizadas = compras.map(c => 
        c.id === compraId ? { ...c, status: 'pago', dataPagamento: new Date().toISOString() } : c
      );
      setCompras(comprasAtualizadas);

      // Recarregar transações
      await carregarDados();

      // Atualizar caixa
      if (caixa && caixa.status === 'aberto' && caixa.id) {
        const compra = compras.find(c => c.id === compraId);
        if (compra) {
          const novoSaldo = (caixa.saldoAtual || 0) - compra.valorTotal;
          
          const novaMovimentacao = {
            id: Date.now().toString(),
            tipo: 'despesa',
            valor: compra.valorTotal,
            descricao: `Pagamento de compra - ${compra.numeroPedido}`,
            data: new Date().toISOString(),
            compraId: compraId,
          };
          
          const movimentacoesAtuais = Array.isArray(caixa.movimentacoes) ? caixa.movimentacoes : [];
          const novasMovimentacoes = [...movimentacoesAtuais, novaMovimentacao];
          
          await firebaseService.update('caixa', caixa.id, {
            saldoAtual: novoSaldo,
            movimentacoes: novasMovimentacoes,
            updatedAt: new Date().toISOString(),
          });
          
          setCaixa({ 
            ...caixa, 
            saldoAtual: novoSaldo, 
            movimentacoes: novasMovimentacoes 
          });
        }
      }

      mostrarSnackbar('✅ Compra paga com sucesso!');
    } catch (error) {
      console.error('Erro ao pagar compra:', error);
      mostrarSnackbar('Erro ao pagar compra', 'error');
    }
  };

  // Função para marcar transação como paga (genérica)
  const handleMarcarComoPago = async (transacao) => {
    try {
      if (!transacao || !transacao.id) {
        mostrarSnackbar('Transação inválida', 'error');
        return;
      }

      // Se for uma comissão, chamar função específica
      if (transacao.origem === 'comissao' && transacao.origemId) {
        await handlePagarComissao(transacao.origemId);
        return;
      }

      // Se for uma compra, chamar função específica
      if (transacao.origem === 'compra' && transacao.origemId) {
        await handlePagarCompra(transacao.origemId);
        return;
      }

      // Para transações manuais
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
      setContasPagar(transacoesAtualizadas.filter(t => t.tipo === 'despesa' && t.status !== 'pago'));
      setContasReceber(transacoesAtualizadas.filter(t => t.tipo === 'receita' && t.status !== 'pago'));

      // Atualizar caixa
      if (caixa && caixa.status === 'aberto' && caixa.id) {
        const valorOperacao = transacao.tipo === 'receita' ? transacao.valor : -transacao.valor;
        const novoSaldo = (caixa.saldoAtual || 0) + valorOperacao;
        
        const novaMovimentacao = {
          id: Date.now().toString(),
          tipo: transacao.tipo,
          valor: Number(transacao.valor),
          descricao: String(transacao.descricao || ''),
          data: new Date().toISOString(),
          transacaoId: String(transacao.id),
        };
        
        const movimentacoesAtuais = Array.isArray(caixa.movimentacoes) ? caixa.movimentacoes : [];
        const novasMovimentacoes = [...movimentacoesAtuais, novaMovimentacao];
        
        await firebaseService.update('caixa', caixa.id, {
          saldoAtual: Number(novoSaldo),
          movimentacoes: novasMovimentacoes,
          updatedAt: new Date().toISOString(),
        });
        
        setCaixa({ 
          ...caixa, 
          saldoAtual: novoSaldo, 
          movimentacoes: novasMovimentacoes 
        });
      }

      mostrarSnackbar('✅ Transação marcada como paga!');
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      mostrarSnackbar('Erro ao processar pagamento', 'error');
    }
  };

  // Funções auxiliares
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

  // Handlers de diálogos
  const handleOpenDialog = (transacao = null) => {
    if (transacao) {
      setTransacaoEditando(transacao);
      setFormData({
        tipo: transacao.tipo || 'receita',
        descricao: transacao.descricao || '',
        valor: transacao.valor || '',
        data: transacao.data || formatarDataBrasilia(new Date()),
        dataVencimento: transacao.dataVencimento || formatarDataBrasilia(new Date()),
        categoria: transacao.categoria || '',
        formaPagamento: transacao.formaPagamento || 'dinheiro',
        status: transacao.status || 'pendente',
        clienteId: transacao.clienteId || '',
        fornecedorId: transacao.fornecedorId || '',
        profissionalId: transacao.profissionalId || '',
        atendimentoId: transacao.atendimentoId || '',
        percentual: transacao.percentual || '',
        observacoes: transacao.observacoes || '',
        parcelas: transacao.parcelas || 1,
        recorrente: transacao.recorrente || false,
        frequencia: transacao.frequencia || 'mensal',
        anexos: transacao.anexos || [],
        tags: transacao.tags || [],
        itens: transacao.itens || [],
        numeroPedido: transacao.numeroPedido || '',
        prazoEntrega: transacao.prazoEntrega || '',
        origem: transacao.origem || 'manual',
        origemId: transacao.origemId || '',
      });
    } else {
      setTransacaoEditando(null);
      setFormData({
        tipo: 'receita',
        descricao: '',
        valor: '',
        data: formatarDataBrasilia(new Date()),
        dataVencimento: formatarDataBrasilia(new Date()),
        categoria: '',
        formaPagamento: 'dinheiro',
        status: 'pendente',
        clienteId: '',
        fornecedorId: '',
        profissionalId: '',
        atendimentoId: '',
        percentual: '',
        observacoes: '',
        parcelas: 1,
        recorrente: false,
        frequencia: 'mensal',
        anexos: [],
        tags: [],
        itens: [],
        numeroPedido: '',
        prazoEntrega: '',
        origem: 'manual',
        origemId: '',
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

  const handleOpenRelatorioDialog = () => setOpenRelatorioDialog(true);
  const handleCloseRelatorioDialog = () => setOpenRelatorioDialog(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função para salvar transação
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
        profissionalId: formData.profissionalId ? String(formData.profissionalId) : null,
        atendimentoId: formData.atendimentoId ? String(formData.atendimentoId) : null,
        percentual: formData.percentual ? Number(formData.percentual) : null,
        observacoes: formData.observacoes ? String(formData.observacoes) : null,
        parcelas: Number(formData.parcelas) || 1,
        recorrente: Boolean(formData.recorrente),
        frequencia: formData.frequencia || 'mensal',
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        origem: formData.origem || 'manual',
        origemId: formData.origemId || null,
        itens: formData.itens || [],
        numeroPedido: formData.numeroPedido || null,
        prazoEntrega: formData.prazoEntrega || null,
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
        // Se for uma transação manual, atualizar
        if (transacaoEditando.origem === 'manual') {
          await firebaseService.update('transacoes', transacaoEditando.id, dadosParaSalvar);
        } else {
          // Se for de origem externa (comissão/compra), não permitir edição direta
          mostrarSnackbar('Transações de comissão/compra não podem ser editadas diretamente', 'warning');
          handleCloseDialog();
          return;
        }
        
        // Recarregar dados
        await carregarDados();
        
        mostrarSnackbar('Transação atualizada com sucesso!');
      } else {
        dadosParaSalvar.createdAt = new Date().toISOString();
        
        const novoId = await firebaseService.add('transacoes', dadosParaSalvar);
        
        // Recarregar dados
        await carregarDados();
        
        mostrarSnackbar('Transação criada com sucesso!');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      mostrarSnackbar('Erro ao salvar transação', 'error');
    }
  };

  // Função para abrir/fechar caixa
  const handleAbrirFecharCaixa = async () => {
    try {
      if (!caixa || caixa.status === 'fechado') {
        // Abrir caixa
        let usuarioId = 'sistema';
        try {
          const usuarioStr = localStorage.getItem('usuario');
          if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            usuarioId = usuario?.id || 'sistema';
          }
        } catch (e) {
          console.warn('Erro ao parsear usuário do localStorage:', e);
        }

        // Calcular saldo inicial baseado nas transações do dia
        const hoje = formatarDataBrasilia(new Date());
        const transacoesHoje = transacoes.filter(t => 
          t.data === hoje && t.status === 'pago'
        );
        
        const saldoInicial = transacoesHoje.reduce((acc, t) => {
          if (t.tipo === 'receita') return acc + t.valor;
          if (t.tipo === 'despesa') return acc - t.valor;
          return acc;
        }, 0);

        const novoCaixa = {
          dataAbertura: new Date().toISOString(),
          saldoInicial: saldoInicial,
          saldoAtual: saldoInicial,
          movimentacoes: transacoesHoje.map(t => ({
            id: Date.now() + Math.random(),
            tipo: t.tipo,
            valor: t.valor,
            descricao: t.descricao,
            data: t.data,
            transacaoId: t.id,
          })),
          status: 'aberto',
          responsavelId: String(usuarioId),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const novoId = await firebaseService.add('caixa', novoCaixa);
        setCaixa({ ...novoCaixa, id: novoId });
        mostrarSnackbar('✅ Caixa aberto com sucesso!');
      } else {
        // Fechar caixa
        const dadosAtualizacao = {
          status: 'fechado',
          dataFechamento: new Date().toISOString(),
          saldoFinal: caixa.saldoAtual || 0,
          updatedAt: new Date().toISOString(),
        };
        
        await firebaseService.update('caixa', caixa.id, dadosAtualizacao);
        
        setCaixa({ 
          ...caixa, 
          ...dadosAtualizacao
        });
        
        mostrarSnackbar('✅ Caixa fechado com sucesso!');
      }
      handleCloseCaixaDialog();
    } catch (error) {
      console.error('Erro ao abrir/fechar caixa:', error);
      mostrarSnackbar('Erro ao operar caixa', 'error');
    }
  };

  // Função para duplicar transação
  const handleDuplicar = (transacao) => {
    const { id, ...dados } = transacao;
    handleOpenDialog({
      ...dados,
      descricao: `${dados.descricao} (cópia)`,
      status: 'pendente',
      origem: 'manual',
      origemId: null,
    });
  };

  // Função para arquivar/desarquivar
  const handleArquivar = async (transacao) => {
    try {
      if (transacao.origem !== 'manual') {
        mostrarSnackbar('Transações de comissão/compra não podem ser arquivadas', 'warning');
        return;
      }

      const novoStatus = transacao.arquivado ? false : true;
      await firebaseService.update('transacoes', transacao.id, {
        arquivado: novoStatus,
        updatedAt: new Date().toISOString(),
      });
      
      setTransacoes(transacoes.map(t => 
        t.id === transacao.id ? { ...t, arquivado: novoStatus } : t
      ));
      
      mostrarSnackbar(novoStatus ? '📦 Transação arquivada' : '📂 Transação desarquivada');
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      mostrarSnackbar('Erro ao arquivar transação', 'error');
    }
  };

  // Cálculo das estatísticas
  const calcularEstatisticas = () => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    const transacoesPeriodo = transacoes.filter(t => {
      if (t.arquivado) return false;
      const data = new Date(t.data);
      return data >= inicio && data <= fim;
    });

    const receitas = transacoesPeriodo
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const despesas = transacoesPeriodo
      .filter(t => t.tipo === 'despesa' && t.status === 'pago')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const saldo = receitas - despesas;

    const aReceber = transacoesPeriodo
      .filter(t => t.tipo === 'receita' && (t.status === 'pendente' || t.status === 'atrasado'))
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const aPagar = transacoesPeriodo
      .filter(t => t.tipo === 'despesa' && (t.status === 'pendente' || t.status === 'atrasado'))
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const atrasados = transacoesPeriodo.filter(t => {
      if (t.status !== 'pendente') return false;
      const vencimento = new Date(t.dataVencimento || t.data);
      return vencimento < new Date();
    }).length;

    const comissoesPendentes = transacoesPeriodo
      .filter(t => t.origem === 'comissao' && t.status === 'pendente')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const comprasPendentes = transacoesPeriodo
      .filter(t => t.origem === 'compra' && t.status === 'pendente')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const ticketMedio = receitas > 0 
      ? receitas / transacoesPeriodo.filter(t => t.tipo === 'receita' && t.status === 'pago').length 
      : 0;

    return {
      receitas,
      despesas,
      saldo,
      aReceber,
      aPagar,
      atrasados,
      comissoesPendentes,
      comprasPendentes,
      ticketMedio,
      totalTransacoes: transacoesPeriodo.length,
      transacoesPagas: transacoesPeriodo.filter(t => t.status === 'pago').length,
    };
  };

  // Dados para gráficos
  const gerarDadosGraficoLinha = () => {
    const dias = {};
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const dia = format(d, 'yyyy-MM-dd');
      dias[dia] = { 
        receitas: 0, 
        despesas: 0, 
        saldo: 0,
        comissoes: 0,
        compras: 0,
        dia: format(d, 'dd/MM')
      };
    }

    transacoes
      .filter(t => t.status === 'pago' && !t.arquivado)
      .forEach(t => {
        const data = t.data.split('T')[0];
        if (dias[data]) {
          const valor = Number(t.valor) || 0;
          if (t.tipo === 'receita') {
            dias[data].receitas += valor;
          } else {
            dias[data].despesas += valor;
            if (t.origem === 'comissao') {
              dias[data].comissoes += valor;
            } else if (t.origem === 'compra') {
              dias[data].compras += valor;
            }
          }
          dias[data].saldo = dias[data].receitas - dias[data].despesas;
        }
      });

    return Object.values(dias);
  };

  const gerarDadosGraficoPizza = () => {
    const categorias = {};
    transacoes
      .filter(t => t.status === 'pago' && !t.arquivado)
      .forEach(t => {
        let cat = t.categoria || 'Outros';
        if (t.origem === 'comissao') cat = 'Comissões';
        if (t.origem === 'compra') cat = 'Compras';
        
        if (!categorias[cat]) {
          categorias[cat] = 0;
        }
        categorias[cat] += Number(t.valor) || 0;
      });

    return Object.keys(categorias)
      .map(cat => ({
        name: cat,
        value: categorias[cat],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categorias
  };

  const gerarDadosGraficoMensal = () => {
    const meses = {};
    const hoje = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const data = subMonths(hoje, i);
      const mes = format(data, 'MMM/yyyy');
      meses[mes] = { 
        mes, 
        receitas: 0, 
        despesas: 0,
        comissoes: 0,
        compras: 0,
        lucro: 0,
        data: data.getTime()
      };
    }

    transacoes
      .filter(t => t.status === 'pago' && !t.arquivado)
      .forEach(t => {
        const data = new Date(t.data);
        const mes = format(data, 'MMM/yyyy');
        if (meses[mes]) {
          const valor = Number(t.valor) || 0;
          if (t.tipo === 'receita') {
            meses[mes].receitas += valor;
          } else {
            meses[mes].despesas += valor;
            if (t.origem === 'comissao') {
              meses[mes].comissoes += valor;
            } else if (t.origem === 'compra') {
              meses[mes].compras += valor;
            }
          }
          meses[mes].lucro = meses[mes].receitas - meses[mes].despesas;
        }
      });

    return Object.values(meses).sort((a, b) => a.data - b.data);
  };

  const stats = calcularEstatisticas();
  const dadosGraficoLinha = gerarDadosGraficoLinha();
  const dadosGraficoPizza = gerarDadosGraficoPizza();
  const dadosGraficoMensal = gerarDadosGraficoMensal();

  // Filtrar transações
  const getTransacoesFiltradas = () => {
    let lista = [];
    if (tabValue === 0) lista = transacoes.filter(t => !t.arquivado);
    else if (tabValue === 1) lista = transacoes.filter(t => t.tipo === 'receita' && !t.arquivado);
    else if (tabValue === 2) lista = transacoes.filter(t => t.tipo === 'despesa' && !t.arquivado);
    else if (tabValue === 3) lista = transacoes.filter(t => t.origem === 'comissao' && !t.arquivado); // Comissões
    else if (tabValue === 4) lista = transacoes.filter(t => t.origem === 'compra' && !t.arquivado); // Compras
    else if (tabValue === 5) lista = transacoes.filter(t => t.arquivado); // Arquivados

    return lista.filter(t => {
      const matchesTexto = filtro === '' || 
        t.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
        t.categoria?.toLowerCase().includes(filtro.toLowerCase()) ||
        (t.profissionalNome?.toLowerCase().includes(filtro.toLowerCase())) ||
        (t.servicoNome?.toLowerCase().includes(filtro.toLowerCase())) ||
        (t.numeroPedido?.toLowerCase().includes(filtro.toLowerCase())) ||
        (t.clienteId && clientes.find(c => c.id === t.clienteId)?.nome?.toLowerCase().includes(filtro.toLowerCase()));

      const matchesStatus = filtroStatus === 'todos' || t.status === filtroStatus;
      const matchesTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
      const matchesCategoria = filtroCategoria === 'todas' || t.categoria === filtroCategoria;

      return matchesTexto && matchesStatus && matchesTipo && matchesCategoria;
    });
  };

  const transacoesFiltradas = getTransacoesFiltradas();
  const paginatedTransacoes = transacoesFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handlers de período
  const handlePeriodoChange = (periodo) => {
    setPeriodoSelecionado(periodo);
    const hoje = new Date();
    
    switch(periodo) {
      case 'hoje':
        setDataInicio(formatarDataBrasilia(hoje));
        setDataFim(formatarDataBrasilia(hoje));
        break;
      case 'ontem':
        const ontem = subDays(hoje, 1);
        setDataInicio(formatarDataBrasilia(ontem));
        setDataFim(formatarDataBrasilia(ontem));
        break;
      case 'semana':
        const semanaPassada = subDays(hoje, 7);
        setDataInicio(formatarDataBrasilia(semanaPassada));
        setDataFim(formatarDataBrasilia(hoje));
        break;
      case 'mes':
        setDataInicio(formatarDataBrasilia(startOfMonth(hoje)));
        setDataFim(formatarDataBrasilia(hoje));
        break;
      case 'mesPassado':
        const mesPassado = subMonths(hoje, 1);
        setDataInicio(formatarDataBrasilia(startOfMonth(mesPassado)));
        setDataFim(formatarDataBrasilia(endOfMonth(mesPassado)));
        break;
      case 'ano':
        setDataInicio(formatarDataBrasilia(startOfYear(hoje)));
        setDataFim(formatarDataBrasilia(hoje));
        break;
      default:
        break;
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Renderização condicional
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#9c27b0' }} />
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
                Gerencie receitas, despesas, comissões e compras
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={carregarDados}
              >
                Atualizar
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<BarChartIcon />}
                onClick={handleOpenRelatorioDialog}
              >
                Relatórios
              </Button>
              
              <Button
                variant="contained"
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
        </motion.div>

        {/* Status do Caixa */}
        {caixa?.status === 'aberto' && (
          <Zoom in={true}>
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={handleOpenCaixaDialog}>
                  Fechar Caixa
                </Button>
              }
            >
              <strong>Caixa Aberto</strong> - Saldo atual: R$ {caixa.saldoAtual?.toFixed(2)} | 
              Abertura: {formatarDataExibicao(caixa.dataAbertura)} {caixa.dataAbertura?.split('T')[1]?.substring(0,5)}
            </Alert>
          </Zoom>
        )}

        {/* Cards de Resumo */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card sx={{ bgcolor: stats.saldo >= 0 ? '#e8f5e9' : '#ffebee', height: '100%' }}>
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
                      <Typography variant="caption" color="textSecondary">
                        Período: {formatarDataExibicao(dataInicio)} - {formatarDataExibicao(dataFim)}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Receitas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        R$ {stats.receitas.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        A receber: R$ {stats.aReceber.toFixed(2)}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Despesas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                        R$ {stats.despesas.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        A pagar: R$ {stats.aPagar.toFixed(2)}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card sx={{ bgcolor: stats.comissoesPendentes > 0 ? '#f3e5f5' : '#f5f5f5', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Comissões Pendentes
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: stats.comissoesPendentes > 0 ? '#9c27b0' : '#9e9e9e' 
                      }}>
                        R$ {stats.comissoesPendentes.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Compras pendentes: R$ {stats.comprasPendentes.toFixed(2)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: stats.comissoesPendentes > 0 ? '#9c27b0' : '#9e9e9e', width: 56, height: 56 }}>
                      <PercentIcon />
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
                    <MenuItem value="ano">Este ano</MenuItem>
                    <MenuItem value="personalizado">Personalizado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Data Início"
                  value={new Date(dataInicio)}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDataInicio(formatarDataBrasilia(newValue));
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
                      setDataFim(formatarDataBrasilia(newValue));
                      setPeriodoSelecionado('personalizado');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => {}}
                  >
                    Exportar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => {}}
                  >
                    Imprimir
                  </Button>
                </Box>
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
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShowChartIcon /> Fluxo de Caixa Diário
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dadosGraficoLinha}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dia" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value) => `R$ ${value.toFixed(2)}`}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="receitas" fill="#4caf50" fillOpacity={0.3} stroke="#4caf50" />
                        <Area type="monotone" dataKey="despesas" fill="#f44336" fillOpacity={0.3} stroke="#f44336" />
                        <Line type="monotone" dataKey="comissoes" stroke="#9c27b0" strokeWidth={2} name="Comissões" />
                        <Line type="monotone" dataKey="compras" stroke="#ff9800" strokeWidth={2} name="Compras" />
                        <Line type="monotone" dataKey="saldo" stroke="#2196f3" strokeWidth={2} />
                      </ComposedChart>
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
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PieChartIcon /> Distribuição por Categoria
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosGraficoPizza}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dadosGraficoPizza.map((entry, index) => (
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

        {/* Gráfico Mensal */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Comparativo Mensal
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGraficoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                  />
                  <Legend />
                  <Bar dataKey="receitas" fill="#4caf50" name="Receitas" />
                  <Bar dataKey="despesas" fill="#f44336" name="Despesas" />
                  <Bar dataKey="comissoes" fill="#9c27b0" name="Comissões" />
                  <Bar dataKey="compras" fill="#ff9800" name="Compras" />
                  <Bar dataKey="lucro" fill="#2196f3" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs e Tabela */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Todas" />
              <Tab label="Receitas" />
              <Tab label="Despesas" />
              <Tab label="Comissões" icon={<PercentIcon />} iconPosition="start" />
              <Tab label="Compras" icon={<ShoppingCartIcon />} iconPosition="start" />
              <Tab label="Arquivados" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Filtros */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por descrição, categoria, profissional, pedido..."
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
                    <MenuItem value="Comissões">Comissões</MenuItem>
                    <MenuItem value="Compras">Compras</MenuItem>
                    {categorias.filter(c => c !== 'Comissões' && c !== 'Compras').map(cat => (
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
                    <TableCell><strong>Tipo/Origem</strong></TableCell>
                    <TableCell><strong>Valor</strong></TableCell>
                    <TableCell><strong>Vencimento</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {paginatedTransacoes.map((transacao, index) => {
                      const cliente = clientes.find(c => c.id === transacao.clienteId);
                      const fornecedor = fornecedores.find(f => f.id === transacao.fornecedorId);
                      const profissional = profissionais.find(p => p.id === transacao.profissionalId);
                      
                      let iconeTipo = <ReceiptIcon />;
                      let corTipo = '#757575';
                      
                      if (transacao.origem === 'comissao') {
                        iconeTipo = <PercentIcon />;
                        corTipo = '#9c27b0';
                      } else if (transacao.origem === 'compra') {
                        iconeTipo = <ShoppingCartIcon />;
                        corTipo = '#ff9800';
                      } else if (transacao.tipo === 'receita') {
                        iconeTipo = <TrendingUpIcon />;
                        corTipo = '#4caf50';
                      } else if (transacao.tipo === 'despesa') {
                        iconeTipo = <TrendingDownIcon />;
                        corTipo = '#f44336';
                      }
                      
                      return (
                        <motion.tr
                          key={transacao.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          style={{
                            backgroundColor: transacao.arquivado ? '#f5f5f5' : 'white',
                            opacity: transacao.arquivado ? 0.7 : 1,
                          }}
                        >
                          <TableCell>
                            {formatarDataExibicao(transacao.data)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ bgcolor: corTipo, width: 32, height: 32 }}>
                                {iconeTipo}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {transacao.descricao}
                                </Typography>
                                {profissional && (
                                  <Typography variant="caption" color="textSecondary">
                                    Profissional: {profissional.nome || transacao.profissionalNome}
                                  </Typography>
                                )}
                                {cliente && (
                                  <Typography variant="caption" color="textSecondary">
                                    Cliente: {cliente.nome}
                                  </Typography>
                                )}
                                {fornecedor && (
                                  <Typography variant="caption" color="textSecondary">
                                    Fornecedor: {fornecedor.nome}
                                  </Typography>
                                )}
                                {transacao.servicoNome && (
                                  <Typography variant="caption" color="textSecondary">
                                    {' '}• {transacao.servicoNome}
                                  </Typography>
                                )}
                                {transacao.numeroPedido && (
                                  <Typography variant="caption" color="textSecondary">
                                    {' '}• Pedido: {transacao.numeroPedido}
                                  </Typography>
                                )}
                                {transacao.percentual && (
                                  <Chip
                                    label={`${transacao.percentual}%`}
                                    size="small"
                                    sx={{ ml: 1, height: 20, fontSize: '0.7rem', bgcolor: '#f3e5f5' }}
                                  />
                                )}
                                {transacao.parcelas > 1 && (
                                  <Chip
                                    label={`${transacao.parcelas}x`}
                                    size="small"
                                    sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transacao.origem === 'comissao' ? 'Comissão' : 
                                    transacao.origem === 'compra' ? 'Compra' : 
                                    transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                              size="small"
                              sx={{
                                bgcolor: transacao.origem === 'comissao' ? '#f3e5f5' :
                                        transacao.origem === 'compra' ? '#fff3e0' :
                                        transacao.tipo === 'receita' ? '#e8f5e9' : '#ffebee',
                                color: transacao.origem === 'comissao' ? '#9c27b0' :
                                       transacao.origem === 'compra' ? '#ff9800' :
                                       transacao.tipo === 'receita' ? '#4caf50' : '#f44336',
                              }}
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
                              {transacao.tipo === 'receita' ? '+' : '-'} R$ {Number(transacao.valor).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {transacao.dataVencimento ? (
                              <Box>
                                <Typography variant="body2">
                                  {formatarDataExibicao(transacao.dataVencimento)}
                                </Typography>
                                {transacao.status === 'pendente' && new Date(transacao.dataVencimento) < new Date() && (
                                  <Chip
                                    label="Vencida"
                                    size="small"
                                    color="error"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            ) : (
                              '-'
                            )}
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
                                '& .MuiChip-icon': { color: statusColors[transacao.status]?.color },
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

                              {transacao.status === 'pendente' && !transacao.arquivado && (
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

                              {transacao.origem === 'manual' && !transacao.arquivado && (
                                <Tooltip title="Editar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(transacao)}
                                    sx={{ color: '#ff4081' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title="Duplicar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDuplicar(transacao)}
                                  sx={{ color: '#2196f3' }}
                                >
                                  <FileCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {transacao.origem === 'manual' && (
                                <Tooltip title={transacao.arquivado ? 'Desarquivar' : 'Arquivar'}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleArquivar(transacao)}
                                    sx={{ color: transacao.arquivado ? '#ff9800' : '#757575' }}
                                  >
                                    {transacao.arquivado ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>

                  {paginatedTransacoes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="body1" color="textSecondary">
                          Nenhuma transação encontrada
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenDialog()}
                          sx={{ mt: 2 }}
                        >
                          Nova Transação
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
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
      </Box>

      {/* Dialog de Transação */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {transacaoEditando ? '✏️ Editar Transação' : '➕ Nova Transação'}
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
                  <MenuItem value="receita">💰 Receita</MenuItem>
                  <MenuItem value="despesa">💸 Despesa</MenuItem>
                  <MenuItem value="transferencia">🔄 Transferência</MenuItem>
                  <MenuItem value="investimento">📈 Investimento</MenuItem>
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
                placeholder="Ex: Venda de serviços, Salário, etc"
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
              <DatePicker
                label="Data"
                value={formData.data ? new Date(formData.data) : null}
                onChange={(newValue) => {
                  if (newValue) {
                    setFormData({ ...formData, data: formatarDataBrasilia(newValue) });
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" required />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data de Vencimento"
                value={formData.dataVencimento ? new Date(formData.dataVencimento) : null}
                onChange={(newValue) => {
                  if (newValue) {
                    setFormData({ ...formData, dataVencimento: formatarDataBrasilia(newValue) });
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
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
                  {formasPagamento.map(fp => (
                    <MenuItem key={fp.value} value={fp.value}>
                      {fp.icon} {fp.label}
                    </MenuItem>
                  ))}
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
                  <MenuItem value="pendente">⏳ Pendente</MenuItem>
                  <MenuItem value="pago">✅ Pago</MenuItem>
                  <MenuItem value="atrasado">⚠️ Atrasado</MenuItem>
                  <MenuItem value="cancelado">❌ Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Cliente (opcional)</InputLabel>
                <Select
                  name="clienteId"
                  value={formData.clienteId}
                  label="Cliente (opcional)"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {clientes.map(cliente => (
                    <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Fornecedor (opcional)</InputLabel>
                <Select
                  name="fornecedorId"
                  value={formData.fornecedorId}
                  label="Fornecedor (opcional)"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {fornecedores.map(fornecedor => (
                    <MenuItem key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</MenuItem>
                  ))}
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
        <DialogActions sx={{ p: 3 }}>
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
          {caixa?.status === 'aberto' ? '🔒 Fechar Caixa' : '🔓 Abrir Caixa'}
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
                      secondary={`R$ ${Number(caixa.saldoAtual || 0).toFixed(2)}`}
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
              <Typography variant="body1">
                Deseja abrir o caixa para iniciar as operações do dia?
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
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
          📋 Detalhes da Transação
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
                    secondary={`R$ ${Number(transacaoSelecionada.valor).toFixed(2)}`}
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
                    secondary={formasPagamento.find(fp => fp.value === transacaoSelecionada.formaPagamento)?.label || transacaoSelecionada.formaPagamento}
                  />
                </ListItem>

                {transacaoSelecionada.origem === 'comissao' && (
                  <>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#9c27b0' }}>
                          <PercentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Profissional"
                        secondary={transacaoSelecionada.profissionalNome || 'Não informado'}
                      />
                    </ListItem>
                    {transacaoSelecionada.servicoNome && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#ff4081' }}>
                            <ReceiptLongIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Serviço"
                          secondary={`${transacaoSelecionada.servicoNome} (${transacaoSelecionada.percentual}% de R$ ${transacaoSelecionada.valorAtendimento})`}
                        />
                      </ListItem>
                    )}
                  </>
                )}

                {transacaoSelecionada.origem === 'compra' && (
                  <>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#ff9800' }}>
                          <StoreIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Fornecedor"
                        secondary={fornecedores.find(f => f.id === transacaoSelecionada.fornecedorId)?.nome || 'Não informado'}
                      />
                    </ListItem>
                    {transacaoSelecionada.numeroPedido && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#00bcd4' }}>
                            <ReceiptIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Número do Pedido"
                          secondary={transacaoSelecionada.numeroPedido}
                        />
                      </ListItem>
                    )}
                    {transacaoSelecionada.itens && transacaoSelecionada.itens.length > 0 && (
                      <ListItem>
                        <ListItemText
                          primary="Itens da Compra"
                          secondary={
                            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                              {transacaoSelecionada.itens.map((item, idx) => (
                                <li key={idx}>
                                  {item.produtoNome} - {item.quantidade}x R$ {item.valorUnitario} = R$ {item.total}
                                </li>
                              ))}
                            </Box>
                          }
                        />
                      </ListItem>
                    )}
                  </>
                )}

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
                      {statusColors[transacaoSelecionada.status]?.icon}
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
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
          {transacaoSelecionada?.status === 'pendente' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleCloseDetalhes();
                handleMarcarComoPago(transacaoSelecionada);
              }}
            >
              Marcar como Pago
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog de Relatórios */}
      <Dialog open={openRelatorioDialog} onClose={handleCloseRelatorioDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          📊 Relatórios Financeiros
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Fluxo de Caixa</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Análise detalhada do fluxo de caixa por período
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>DRE</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Demonstrativo de Resultados do Exercício
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Contas a Receber</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Análise de contas a receber por cliente e período
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Contas a Pagar</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Análise de contas a pagar por fornecedor e período
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Comissões</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Relatório de comissões por profissional e período
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Compras</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Análise de compras por fornecedor e período
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseRelatorioDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
