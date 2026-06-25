// src/pages/ModernFinanceiro.js
// VERSÃO COMPLETA CORRIGIDA - Trata corretamente datas e objetos do Firebase

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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  Autocomplete,
  Switch,
  Rating,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
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
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  PictureAsPdf as PdfIcon,
  Description as ExcelIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  CompareArrows as CompareArrowsIcon,
  Timeline as TimelineIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptOutlinedIcon,
  LocalAtm as LocalAtmIcon,
  CreditCard as CreditCardIcon,
  QrCode as QrCodeIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { contasPagarParaTransacoes, contasReceberParaTransacoes } from '../services/financeiroContasIntegration';
import { auditoriaService } from '../services/auditoriaService';
import { caixaService, METODOS_CAIXA } from '../services/caixaService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  differenceInDays,
  addMonths,
  isSameDay,
  isWithinInterval,
  parseISO,
  addWeeks,
  subWeeks,
  getWeek,
  getYear,
  setHours,
  setMinutes,
  isAfter,
  isBefore,
} from 'date-fns';
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
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ==================== FUNÇÕES AUXILIARES DE SEGURANÇA ====================

/**
 * Converte qualquer formato de data para string ISO
 * Suporta: string, timestamp Firebase, Date, objeto com toDate()
 */
const toISOString = (value) => {
  if (!value) return null;

  try {
    // Se já é string
    if (typeof value === 'string') {
      // Verifica se é uma data válida
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date.toISOString();
      return value;
    }

    // Se é timestamp do Firebase
    if (value.seconds !== undefined) {
      return new Date(value.seconds * 1000).toISOString();
    }

    // Se tem método toDate (Firestore Timestamp)
    if (typeof value.toDate === 'function') {
      return value.toDate().toISOString();
    }

    // Se é Date
    if (value instanceof Date) {
      if (!isNaN(value.getTime())) return value.toISOString();
    }

    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Converte data para string no formato YYYY-MM-DD
 */
const toDateString = (value) => {
  const isoString = toISOString(value);
  if (!isoString) return null;
  return isoString.split('T')[0];
};

/**
 * Converte data para exibição (dd/MM/yyyy)
 */
const toDisplayDate = (value) => {
  const isoString = toISOString(value);
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return format(date, 'dd/MM/yyyy');
  } catch (e) {
    return '';
  }
};

/**
 * Extrai valor numérico com segurança
 */
const toNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Extrai string com segurança
 */
const toString = (value, defaultValue = '') => {
  if (value === undefined || value === null) return defaultValue;
  return String(value);
};

// ==================== CONSTANTES ====================
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


const MOTIVOS_TRANSACAO = [
  { value: 'venda_servico', label: 'Venda de serviço', tipo: 'receita', categoria: 'Serviços', descricao: 'Recebimento de serviço' },
  { value: 'venda_produto', label: 'Venda de produto', tipo: 'receita', categoria: 'Produtos', descricao: 'Recebimento de produto' },
  { value: 'recebimento_cliente', label: 'Recebimento de cliente', tipo: 'receita', categoria: 'Clientes', descricao: 'Recebimento de cliente' },
  { value: 'reforco_caixa', label: 'Reforço de caixa', tipo: 'receita', categoria: 'Reforço de Caixa', descricao: 'Reforço de caixa', caixaTipo: 'reforco' },
  { value: 'outra_receita', label: 'Outra receita', tipo: 'receita', categoria: 'Outras receitas', descricao: 'Receita manual' },
  { value: 'sangria_caixa', label: 'Sangria de caixa', tipo: 'despesa', categoria: 'Sangria de Caixa', descricao: 'Sangria de caixa', caixaTipo: 'sangria' },
  { value: 'retirada_caixa', label: 'Retirada do caixa', tipo: 'despesa', categoria: 'Retirada de Caixa', descricao: 'Retirada do caixa', caixaTipo: 'retirada' },
  { value: 'despesa_operacional', label: 'Despesa operacional', tipo: 'despesa', categoria: 'Despesas operacionais', descricao: 'Despesa operacional', caixaTipo: 'despesa' },
  { value: 'compra_estoque', label: 'Compra de estoque', tipo: 'despesa', categoria: 'Compras de estoque', descricao: 'Compra de estoque' },
  { value: 'pagamento_fornecedor', label: 'Pagamento a fornecedor', tipo: 'despesa', categoria: 'Fornecedores', descricao: 'Pagamento a fornecedor' },
  { value: 'pagamento_comissao', label: 'Pagamento de comissão', tipo: 'despesa', categoria: 'Comissões', descricao: 'Pagamento de comissão' },
  { value: 'transferencia_contas', label: 'Transferência entre contas', tipo: 'transferencia', categoria: 'Transferências', descricao: 'Transferência entre contas' },
  { value: 'aplicacao_investimento', label: 'Aplicação / investimento', tipo: 'investimento', categoria: 'Investimentos', descricao: 'Aplicação financeira' },
];

const getMotivoTransacao = (value) => MOTIVOS_TRANSACAO.find((motivo) => motivo.value === value) || null;

const periodosRepeticao = [
  { value: 'nao', label: 'Não repetir' },
  { value: 'diario', label: 'Diariamente' },
  { value: 'semanal', label: 'Semanalmente' },
  { value: 'quinzenal', label: 'Quinzenalmente' },
  { value: 'mensal', label: 'Mensalmente' },
];

const perfisAcesso = {
  admin: { nivel: 1, label: 'Administrador', permissoes: ['tudo'] },
  gerente: { nivel: 2, label: 'Gerente', permissoes: ['visualizar', 'criar', 'editar', 'pagar', 'relatorios', 'exportar'] },
  operador: { nivel: 3, label: 'Operador', permissoes: ['visualizar', 'criar', 'pagar'] },
  visualizador: { nivel: 4, label: 'Visualizador', permissoes: ['visualizar'] },
};

// ==================== FUNÇÕES AUXILIARES ====================
const formatarDataBrasilia = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, 'yyyy-MM-dd');
  } catch (e) {
    return '';
  }
};

const formatarDataExibicao = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, 'dd/MM/yyyy');
  } catch (e) {
    return '';
  }
};

const formatarHoraBrasilia = () => {
  return format(new Date(), 'HH:mm');
};

const formatarMoeda = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

// ==================== COMPONENTE PRINCIPAL ====================
function ModernFinanceiro() {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');

  // Dados
  const [transacoesManuais, setTransacoesManuais] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [transacoesCombinadas, setTransacoesCombinadas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [caixa, setCaixa] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [anexos, setAnexos] = useState([]);
  const [caixaOperacao, setCaixaOperacao] = useState({ valorAbertura: 0, valorConferido: 0, observacao: '' });

  // Filtros
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState('todas');
  const [dataInicio, setDataInicio] = useState(formatarDataBrasilia(startOfMonth(new Date())));
  const [dataFim, setDataFim] = useState(formatarDataBrasilia(new Date()));

  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Diálogos
  const [openDialog, setOpenDialog] = useState(false);
  const [openCaixaDialog, setOpenCaixaDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [openRelatorioDialog, setOpenRelatorioDialog] = useState(false);
  const [openComissaoProfissionalDialog, setOpenComissaoProfissionalDialog] = useState(false);
  const [openAnexoDialog, setOpenAnexoDialog] = useState(false);
  const [openConciliacaoDialog, setOpenConciliacaoDialog] = useState(false);
  const [openOrcamentoDialog, setOpenOrcamentoDialog] = useState(false);
  const [openFluxoProjetadoDialog, setOpenFluxoProjetadoDialog] = useState(false);
  const [openPerfilDialog, setOpenPerfilDialog] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState(null);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Alertas
  const [alertasVencimento, setAlertasVencimento] = useState([]);
  const [openAlertasDialog, setOpenAlertasDialog] = useState(false);

  // Usuário e permissões
  const [usuario, setUsuario] = useState(null);
  const [perfilAtual, setPerfilAtual] = useState('operador');

  // Orçamentos
  const [orcamentos, setOrcamentos] = useState([]);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);

  // Conciliação
  const [extratoBancario, setExtratoBancario] = useState([]);
  const [conciliacoes, setConciliacoes] = useState([]);
  const [resultadoConciliacao, setResultadoConciliacao] = useState({ conciliadas: [], pendentes: [] });
  const [processandoConciliacao, setProcessandoConciliacao] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    tipo: 'receita',
    descricao: '',
    valor: '',
    data: formatarDataBrasilia(new Date()),
    dataVencimento: formatarDataBrasilia(new Date()),
    categoria: '',
    motivoTransacao: '',
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

  // Estado do formulário de ausência
  const [ausenciaForm, setAusenciaForm] = useState({
    profissionalId: '',
    tipo: 'folga',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    horarioInicio: '00:00',
    horarioFim: '23:59',
    repetir: 'nao',
    observacoes: '',
  });

  // Estado para relatórios
  const [relatorioTipo, setRelatorioTipo] = useState('fluxo');
  const [relatorioPeriodo, setRelatorioPeriodo] = useState('mes');

  // ==================== FUNÇÕES AUXILIARES DE SEGURANÇA ====================
  const safeToDate = (value) => {
    if (!value) return null;
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    if (value.toDate) return value.toDate();
    if (value.seconds) return new Date(value.seconds * 1000);
    if (value instanceof Date) return value;
    return null;
  };

  const safeToDateString = (value) => {
    const date = safeToDate(value);
    if (!date) return null;
    return format(date, 'yyyy-MM-dd');
  };

  const safeToDisplayDate = (value) => {
    const date = safeToDate(value);
    if (!date) return '';
    return format(date, 'dd/MM/yyyy');
  };

  // ==================== FUNÇÕES PRINCIPAIS ====================
  useEffect(() => {
    carregarUsuario();
    carregarDados();
  }, []);

  const carregarUsuario = () => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const user = JSON.parse(usuarioStr);
        setUsuario(user);
        setPerfilAtual(user.perfil || 'operador');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const verificarPermissao = (permissao) => {
    const perfil = perfisAcesso[perfilAtual];
    if (!perfil) return false;
    if (perfil.nivel === 1) return true;
    return perfil.permissoes.includes(permissao);
  };

  const registrarAuditoria = async (acao, entidadeId, detalhes, dados = {}) => {
    try {
      await auditoriaService.registrar(acao, {
        entidade: 'financeiro',
        entidadeId,
        detalhes,
        dados: {
          ...dados,
          usuarioId: usuario?.id,
          usuarioNome: usuario?.nome,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);

      const [
        transacoesManuaisData,
        comissoesData,
        comprasData,
        contasReceberData,
        contasPagarData,
        caixaData,
        clientesData,
        fornecedoresData,
        profissionaisData,
        servicosData,
        orcamentosData,
        conciliacoesData,
      ] = await Promise.all([
        firebaseService.getAll('transacoes').catch(() => []),
        firebaseService.getAll('comissoes').catch(() => []),
        firebaseService.getAll('compras').catch(() => []),
        firebaseService.getAll('contas_receber').catch(() => []),
        firebaseService.getAll('contas_pagar').catch(() => []),
        firebaseService.getAll('caixa').catch(() => []),
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('fornecedores').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('orcamentos').catch(() => []),
        firebaseService.getAll('conciliacoes').catch(() => []),
      ]);

      // Processar transações manuais
      const transacoesProcessadas = (transacoesManuaisData || []).map(t => ({
        ...t,
        id: toString(t.id),
        tipo: toString(t.tipo, 'receita'),
        descricao: toString(t.descricao),
        valor: toNumber(t.valor),
        data: safeToDateString(t.data) || safeToDateString(t.createdAt) || new Date().toISOString().split('T')[0],
        dataVencimento: safeToDateString(t.dataVencimento),
        dataPagamento: toISOString(t.dataPagamento),
        categoria: toString(t.categoria),
        formaPagamento: toString(t.formaPagamento, 'dinheiro'),
        status: toString(t.status, 'pendente'),
        clienteId: toString(t.clienteId),
        fornecedorId: toString(t.fornecedorId),
        profissionalId: toString(t.profissionalId),
        atendimentoId: toString(t.atendimentoId),
        percentual: toNumber(t.percentual),
        observacoes: toString(t.observacoes),
        parcelas: toNumber(t.parcelas, 1),
        recorrente: !!t.recorrente,
        frequencia: toString(t.frequencia, 'mensal'),
        anexos: t.anexos || [],
        tags: t.tags || [],
        itens: t.itens || [],
        numeroPedido: toString(t.numeroPedido),
        prazoEntrega: toString(t.prazoEntrega),
        origem: toString(t.origem, 'manual'),
        origemId: toString(t.origemId),
        arquivado: !!t.arquivado,
        createdAt: toISOString(t.createdAt),
        updatedAt: toISOString(t.updatedAt),
      }));

      setTransacoesManuais(transacoesProcessadas);

      // Processar comissões
      const comissoesProcessadas = (comissoesData || []).map(c => ({
        ...c,
        id: toString(c.id),
        atendimentoId: toString(c.atendimentoId),
        agendamentoId: toString(c.agendamentoId),
        profissionalId: toString(c.profissionalId),
        profissionalNome: toString(c.profissionalNome),
        servicoId: toString(c.servicoId),
        servicoNome: toString(c.servicoNome),
        valor: toNumber(c.valor),
        valorAtendimento: toNumber(c.valorAtendimento),
        percentual: toNumber(c.percentual),
        status: toString(c.status, 'pendente'),
        data: safeToDateString(c.data) || safeToDateString(c.dataRegistro) || safeToDateString(c.createdAt),
        dataRegistro: toISOString(c.dataRegistro) || toISOString(c.createdAt),
        createdAt: toISOString(c.createdAt),
        updatedAt: toISOString(c.updatedAt),
      }));

      setComissoes(comissoesProcessadas);

      // Processar compras
      const comprasProcessadas = (comprasData || []).map(c => ({
        ...c,
        id: toString(c.id),
        fornecedorId: toString(c.fornecedorId),
        numeroPedido: toString(c.numeroPedido),
        valorTotal: toNumber(c.valorTotal),
        status: toString(c.status, 'pendente'),
        dataCompra: safeToDateString(c.dataCompra) || safeToDateString(c.createdAt),
        dataVencimento: safeToDateString(c.dataVencimento) || safeToDateString(c.prazoEntrega) || safeToDateString(c.dataCompra) || safeToDateString(c.createdAt),
        dataPagamento: toISOString(c.dataPagamento),
        formaPagamento: toString(c.formaPagamento, 'pix'),
        prazoEntrega: toString(c.prazoEntrega),
        itens: c.itens || [],
        observacoes: toString(c.observacoes),
        anexos: c.anexos || [],
        createdAt: toISOString(c.createdAt),
        updatedAt: toISOString(c.updatedAt),
      }));

      setCompras(comprasProcessadas);
      const contasReceberProcessadas = contasReceberParaTransacoes(contasReceberData || []);
      const contasPagarProcessadas = contasPagarParaTransacoes(contasPagarData || []);

      // Processar outros dados
      setClientes(clientesData || []);
      setFornecedores(fornecedoresData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);
      setOrcamentos(orcamentosData || []);
      setConciliacoes(conciliacoesData || []);

      // Processar caixa automatizado no próprio dashboard financeiro
      const resumoCaixa = await caixaService.carregarResumoAtual();
      const caixaAtual = resumoCaixa.caixaAberto || (caixaData || [])
        .filter((item) => item?.status)
        .sort((a, b) => {
          const dateA = safeToDate(a.abertoEm || a.dataAbertura || a.createdAt) || new Date(0);
          const dateB = safeToDate(b.abertoEm || b.dataAbertura || b.createdAt) || new Date(0);
          return dateB - dateA;
        })[0];

      if (caixaAtual) {
        const totaisCaixa = resumoCaixa.caixaAberto?.id === caixaAtual.id
          ? resumoCaixa.totais
          : caixaService.calcularTotais(caixaAtual, caixaAtual.movimentacoes || []);

        setCaixa({
          ...caixaAtual,
          id: toString(caixaAtual.id),
          saldoAtual: toNumber(totaisCaixa?.saldoAtual ?? caixaAtual.saldoAtual ?? caixaAtual.saldoFinal),
          saldoInicial: toNumber(caixaAtual.saldoInicial ?? caixaAtual.valorAbertura),
          status: toString(caixaAtual.status, 'fechado'),
          dataAbertura: toISOString(caixaAtual.abertoEm || caixaAtual.dataAbertura || caixaAtual.createdAt),
          dataFechamento: toISOString(caixaAtual.fechadoEm || caixaAtual.dataFechamento),
          movimentacoes: (resumoCaixa.caixaAberto?.id === caixaAtual.id ? resumoCaixa.movimentos : (caixaAtual.movimentacoes || [])).map(m => ({
            ...m,
            valor: toNumber(m.valor),
            data: toISOString(m.data || m.createdAt),
          })),
          totais: totaisCaixa,
        });
      } else {
        setCaixa({ saldoAtual: 0, status: 'fechado', movimentacoes: [] });
      }

      // Combinar transações
      const comissoesComoTransacoes = comissoesProcessadas.map(c => ({
        id: `comissao_${c.id}`,
        tipo: 'despesa',
        origem: 'comissao',
        origemId: c.id,
        descricao: `Comissão - ${c.servicoNome || 'Serviço'} - ${c.profissionalNome || ''}`,
        valor: c.valor,
        data: c.data,
        dataVencimento: c.data,
        categoria: 'Comissões',
        formaPagamento: 'credito_loja',
        status: c.status === 'pago' ? 'pago' : 'pendente',
        profissionalId: c.profissionalId,
        profissionalNome: c.profissionalNome,
        atendimentoId: c.atendimentoId,
        servicoId: c.servicoId,
        servicoNome: c.servicoNome,
        percentual: c.percentual,
        valorAtendimento: c.valorAtendimento,
        observacoes: `Comissão de ${c.percentual}% sobre atendimento de R$ ${c.valorAtendimento}`,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        anexos: c.anexos || [],
        arquivado: false,
      }));

      const comprasComoTransacoes = comprasProcessadas.map(c => ({
        id: `compra_${c.id}`,
        tipo: 'despesa',
        origem: 'compra',
        origemId: c.id,
        descricao: `Compra - ${c.numeroPedido || 'Pedido'}`,
        valor: c.valorTotal,
        data: c.dataCompra,
        dataVencimento: c.dataVencimento || c.prazoEntrega || c.dataCompra,
        categoria: c.categoriaFinanceira || 'Compras de estoque',
        formaPagamento: c.formaPagamento,
        status: c.status === 'pago' ? 'pago' : (c.status === 'cancelada' ? 'cancelado' : 'pendente'),
        fornecedorId: c.fornecedorId,
        numeroPedido: c.numeroPedido,
        prazoEntrega: c.prazoEntrega,
        itens: c.itens,
        observacoes: c.observacoes,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        anexos: c.anexos || [],
        arquivado: false,
      }));

      const todasTransacoes = [
        ...transacoesProcessadas,
        ...contasReceberProcessadas,
        ...contasPagarProcessadas,
        ...comissoesComoTransacoes,
        ...comprasComoTransacoes,
      ];

      todasTransacoes.sort((a, b) => {
        const dateA = a.data ? new Date(a.data) : new Date(0);
        const dateB = b.data ? new Date(b.data) : new Date(0);
        return dateB - dateA;
      });

      setTransacoesCombinadas(todasTransacoes);

      // Extrair categorias
      const categoriasUnicas = [...new Set(todasTransacoes.map(t => t.categoria).filter(Boolean))];
      setCategorias(categoriasUnicas);

      // Gerar alertas de vencimento
      gerarAlertasVencimento(todasTransacoes);

      await registrarAuditoria(
        'carregar_financeiro',
        'listagem',
        'Página financeira carregada',
        { totalTransacoes: todasTransacoes.length }
      );

      toast.success('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // ==================== FUNÇÕES DE PAGAMENTO ====================
  const handlePagarComissao = async (comissaoId) => {
    try {
      await firebaseService.update('comissoes', comissaoId, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await registrarAuditoria('pagar_comissao', comissaoId, 'Comissão paga');

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

          setCaixa({ ...caixa, saldoAtual: novoSaldo, movimentacoes: novasMovimentacoes });
        }
      }

      await carregarDados();
      mostrarSnackbar('✅ Comissão paga com sucesso!');
    } catch (error) {
      console.error('Erro ao pagar comissão:', error);
      mostrarSnackbar('Erro ao pagar comissão', 'error');
    }
  };

  const handlePagarCompra = async (compraId) => {
    try {
      await firebaseService.update('compras', compraId, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await registrarAuditoria('pagar_compra', compraId, 'Compra paga');

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

          setCaixa({ ...caixa, saldoAtual: novoSaldo, movimentacoes: novasMovimentacoes });
        }
      }

      await carregarDados();
      mostrarSnackbar('✅ Compra paga com sucesso!');
    } catch (error) {
      console.error('Erro ao pagar compra:', error);
      mostrarSnackbar('Erro ao pagar compra', 'error');
    }
  };

  const handleMarcarComoPago = async (transacao) => {
    try {
      if (transacao.origem === 'comissao') {
        await handlePagarComissao(transacao.origemId);
        return;
      }
      if (transacao.origem === 'compra') {
        await handlePagarCompra(transacao.origemId);
        return;
      }

      const dadosTransacao = {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await firebaseService.update('transacoes', transacao.id, dadosTransacao);

      await registrarAuditoria('marcar_pago', transacao.id, 'Transação marcada como paga');

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

        setCaixa({ ...caixa, saldoAtual: novoSaldo, movimentacoes: novasMovimentacoes });
      }

      await carregarDados();
      mostrarSnackbar('✅ Transação marcada como paga!');
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      mostrarSnackbar('Erro ao processar pagamento', 'error');
    }
  };

  // ==================== EXPORTAÇÃO ====================
  const exportarParaExcel = () => {
    try {
      const dadosExportacao = transacoesFiltradas.map(t => ({
        'Data': formatarDataExibicao(t.data),
        'Descrição': t.descricao,
        'Tipo': t.tipo === 'receita' ? 'Receita' : t.origem === 'comissao' ? 'Comissão' : t.origem === 'compra' ? 'Compra' : 'Despesa',
        'Valor': t.valor,
        'Valor Formatado': formatarMoeda(t.valor),
        'Categoria': t.categoria || '-',
        'Forma Pagamento': formasPagamento.find(fp => fp.value === t.formaPagamento)?.label || t.formaPagamento,
        'Status': statusColors[t.status]?.label || t.status,
        'Vencimento': t.dataVencimento ? formatarDataExibicao(t.dataVencimento) : '-',
        'Observações': t.observacoes || '-',
      }));

      const ws = XLSX.utils.json_to_sheet(dadosExportacao);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Financeiro');

      const nomeArquivo = `financeiro_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);

      mostrarSnackbar('✅ Arquivo exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar arquivo', 'error');
    }
  };

  const exportarParaPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Relatório Financeiro', 14, 15);
      doc.setFontSize(10);
      doc.text(`Período: ${formatarDataExibicao(dataInicio)} a ${formatarDataExibicao(dataFim)}`, 14, 25);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 32);

      const tableData = transacoesFiltradas.slice(0, 100).map(t => [
        formatarDataExibicao(t.data),
        t.descricao.substring(0, 40),
        t.tipo === 'receita' ? 'Receita' : t.origem === 'comissao' ? 'Comissão' : t.origem === 'compra' ? 'Compra' : 'Despesa',
        `R$ ${t.valor.toFixed(2)}`,
        statusColors[t.status]?.label || t.status,
      ]);

      doc.autoTable({
        head: [['Data', 'Descrição', 'Tipo', 'Valor', 'Status']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [156, 39, 176] },
      });

      doc.save(`relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      mostrarSnackbar('✅ PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarSnackbar('Erro ao gerar PDF', 'error');
    }
  };

  // ==================== ALERTAS ====================
  const gerarAlertasVencimento = (transacoes) => {
    const hoje = new Date();
    const alertas = [];

    transacoes.forEach(t => {
      if (t.status !== 'pendente') return;

      const vencimento = t.dataVencimento ? new Date(t.dataVencimento) : new Date(t.data);
      if (isNaN(vencimento.getTime())) return;

      const diasAtraso = differenceInDays(hoje, vencimento);
      const diasParaVencer = differenceInDays(vencimento, hoje);

      if (diasAtraso > 0) {
        alertas.push({
          ...t,
          tipo: 'atrasado',
          mensagem: `Conta vencida há ${diasAtraso} dia(s)`,
          severidade: 'error',
        });
      } else if (diasParaVencer <= 3 && diasParaVencer >= 0) {
        alertas.push({
          ...t,
          tipo: 'proximo',
          mensagem: `Vence em ${diasParaVencer} dia(s)`,
          severidade: 'warning',
        });
      }
    });

    setAlertasVencimento(alertas);
  };

  // ==================== RELATÓRIOS ====================
  const gerarRelatorioComissoesProfissional = () => {
    const comissoesPorProfissional = {};

    transacoesCombinadas
      .filter(t => t.origem === 'comissao')
      .forEach(t => {
        const profissional = t.profissionalNome || 'Não identificado';
        if (!comissoesPorProfissional[profissional]) {
          comissoesPorProfissional[profissional] = {
            total: 0,
            pendentes: 0,
            pagas: 0,
            transacoes: [],
          };
        }
        comissoesPorProfissional[profissional].total += t.valor;
        if (t.status === 'pendente') {
          comissoesPorProfissional[profissional].pendentes += t.valor;
        } else if (t.status === 'pago') {
          comissoesPorProfissional[profissional].pagas += t.valor;
        }
        comissoesPorProfissional[profissional].transacoes.push(t);
      });

    return comissoesPorProfissional;
  };

  const gerarRelatorioDRE = () => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    const transacoesPeriodo = transacoesCombinadas.filter(t => {
      const data = new Date(t.data);
      return data >= inicio && data <= fim;
    });

    const receitas = {
      total: 0,
      porCategoria: {},
      porFormaPagamento: {},
    };

    const despesas = {
      total: 0,
      porCategoria: {},
      porFormaPagamento: {},
    };

    transacoesPeriodo.forEach(t => {
      const valor = Number(t.valor) || 0;
      if (t.tipo === 'receita' && t.status === 'pago') {
        receitas.total += valor;
        const cat = t.categoria || 'Outros';
        receitas.porCategoria[cat] = (receitas.porCategoria[cat] || 0) + valor;
        const fp = t.formaPagamento || 'outros';
        receitas.porFormaPagamento[fp] = (receitas.porFormaPagamento[fp] || 0) + valor;
      } else if (t.tipo === 'despesa' && t.status === 'pago') {
        despesas.total += valor;
        const cat = t.categoria || 'Outros';
        despesas.porCategoria[cat] = (despesas.porCategoria[cat] || 0) + valor;
        const fp = t.formaPagamento || 'outros';
        despesas.porFormaPagamento[fp] = (despesas.porFormaPagamento[fp] || 0) + valor;
      }
    });

    return {
      receitas,
      despesas,
      lucroBruto: receitas.total - despesas.total,
      margem: receitas.total > 0 ? ((receitas.total - despesas.total) / receitas.total) * 100 : 0,
    };
  };

  // ==================== FLUXO DE CAIXA PROJETADO ====================
  const calcularFluxoProjetado = (dias = 30) => {
    const hoje = new Date();
    const projecao = [];
    let saldoAtual = caixa?.saldoAtual || 0;

    for (let i = 0; i <= dias; i++) {
      const data = addDays(hoje, i);
      const dataStr = formatarDataBrasilia(data);

      const receber = transacoesCombinadas
        .filter(t => t.tipo === 'receita' && t.status === 'pendente' && t.dataVencimento === dataStr)
        .reduce((acc, t) => acc + t.valor, 0);

      const pagar = transacoesCombinadas
        .filter(t => t.tipo === 'despesa' && t.status === 'pendente' && t.dataVencimento === dataStr)
        .reduce((acc, t) => acc + t.valor, 0);

      saldoAtual += receber - pagar;

      projecao.push({
        data: formatarDataExibicao(data),
        dataOriginal: data,
        receber,
        pagar,
        saldo: saldoAtual,
      });
    }

    return projecao;
  };

  // ==================== CONCILIAÇÃO ====================
  const normalizarValorExtrato = (valor = '') => {
    const texto = String(valor).replace(/R\$/gi, '').trim();
    if (!texto) return 0;
    if (texto.includes(',') && texto.includes('.')) return Number(texto.replace(/\./g, '').replace(',', '.')) || 0;
    if (texto.includes(',')) return Number(texto.replace(',', '.')) || 0;
    return Number(texto) || 0;
  };

  const parseExtratoCSV = (conteudo) => {
    const linhas = conteudo.split(/\r?\n/).map((linha) => linha.trim()).filter(Boolean);
    if (!linhas.length) return [];
    const separador = linhas[0].includes(';') ? ';' : ',';
    const cabecalho = linhas[0].split(separador).map((item) => item.trim().toLowerCase());
    const indiceData = cabecalho.findIndex((item) => ['data', 'date', 'lançamento', 'lancamento'].some((key) => item.includes(key)));
    const indiceDescricao = cabecalho.findIndex((item) => ['descrição', 'descricao', 'histórico', 'historico', 'memo'].some((key) => item.includes(key)));
    const indiceValor = cabecalho.findIndex((item) => ['valor', 'amount', 'crédito', 'credito', 'débito', 'debito'].some((key) => item.includes(key)));

    return linhas.slice(1).map((linha, index) => {
      const colunas = linha.split(separador).map((item) => item.replace(/^"|"$/g, '').trim());
      const dataRaw = colunas[indiceData >= 0 ? indiceData : 0];
      const valorRaw = colunas[indiceValor >= 0 ? indiceValor : colunas.length - 1];
      const descricaoRaw = colunas[indiceDescricao >= 0 ? indiceDescricao : 1] || 'Lançamento bancário';
      const partesData = String(dataRaw || '').split(/[/-]/);
      const dataNormalizada = partesData.length === 3 && partesData[2]?.length === 4
        ? `${partesData[2]}-${partesData[1].padStart(2, '0')}-${partesData[0].padStart(2, '0')}`
        : safeToDateString(dataRaw) || formatarDataBrasilia(new Date());
      return {
        id: `extrato_${Date.now()}_${index}`,
        data: dataNormalizada,
        descricao: descricaoRaw,
        valor: Math.abs(normalizarValorExtrato(valorRaw)),
        valorOriginal: normalizarValorExtrato(valorRaw),
        conciliado: false,
      };
    }).filter((item) => item.valor > 0);
  };

  const localizarTransacaoConciliavel = (item, usadas = new Set()) => transacoesCombinadas.find((transacao) => {
    if (usadas.has(transacao.id)) return false;
    if (transacao.conciliado || transacao.statusConciliacao === 'conciliado') return false;
    const mesmoValor = Math.abs(Number(transacao.valor || 0) - Number(item.valor || 0)) < 0.01;
    const mesmaData = formatarDataBrasilia(new Date(transacao.dataPagamento || transacao.data)) === formatarDataBrasilia(new Date(item.data));
    const vencimentoProximo = transacao.dataVencimento && formatarDataBrasilia(new Date(transacao.dataVencimento)) === formatarDataBrasilia(new Date(item.data));
    return mesmoValor && (mesmaData || vencimentoProximo);
  });

  const resolverDestinoTransacao = (transacao) => {
    if (transacao?.origem === 'compra') return { colecao: 'compras', id: transacao.origemId };
    if (transacao?.origem === 'contas_receber') return { colecao: 'contas_receber', id: transacao.origemId };
    if (transacao?.origem === 'contas_pagar') return { colecao: 'contas_pagar', id: transacao.origemId };
    if (transacao?.origem === 'comissao') return { colecao: 'comissoes', id: transacao.origemId };
    return { colecao: 'transacoes', id: transacao?.origem === 'manual' ? transacao.id : transacao?.origemId || transacao?.id };
  };

  const processarArquivoConciliacao = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setProcessandoConciliacao(true);
      const conteudo = await file.text();
      const extrato = parseExtratoCSV(conteudo);
      setExtratoBancario(extrato);
      await handleConciliarExtrato(extrato, file.name);
    } catch (error) {
      console.error('Erro ao processar extrato:', error);
      mostrarSnackbar('Erro ao processar extrato bancário. Use CSV com colunas data, descrição e valor.', 'error');
    } finally {
      setProcessandoConciliacao(false);
      event.target.value = '';
    }
  };

  const handleConciliarExtrato = async (extrato, arquivoNome = 'extrato.csv') => {
    try {
      const usadas = new Set();
      const conciliadas = [];
      const pendentes = [];

      for (const item of extrato) {
        const transacaoCorrespondente = localizarTransacaoConciliavel(item, usadas);
        if (!transacaoCorrespondente) {
          pendentes.push(item);
          continue;
        }

        usadas.add(transacaoCorrespondente.id);
        const destino = resolverDestinoTransacao(transacaoCorrespondente);
        const conciliacao = {
          arquivoNome,
          extratoId: item.id,
          extratoDescricao: item.descricao,
          transacaoId: transacaoCorrespondente.id,
          transacaoOrigem: transacaoCorrespondente.origem || 'manual',
          transacaoDescricao: transacaoCorrespondente.descricao,
          valor: item.valor,
          data: item.data,
          status: 'conciliado',
          dataConciliacao: new Date().toISOString(),
        };
        await firebaseService.add('conciliacoes', conciliacao);
        if (destino.id) {
          await firebaseService.update(destino.colecao, destino.id, {
            conciliado: true,
            statusConciliacao: 'conciliado',
            conciliadoEm: conciliacao.dataConciliacao,
            status: transacaoCorrespondente.status === 'pendente' ? 'pago' : transacaoCorrespondente.status,
            dataPagamento: transacaoCorrespondente.dataPagamento || conciliacao.dataConciliacao,
            updatedAt: new Date().toISOString(),
          }).catch(() => null);
        }
        conciliadas.push({ ...conciliacao, transacao: transacaoCorrespondente });
      }

      setResultadoConciliacao({ conciliadas, pendentes });
      await carregarDados();
      mostrarSnackbar(`✅ Conciliação concluída: ${conciliadas.length} conciliada(s), ${pendentes.length} pendente(s).`);
    } catch (error) {
      console.error('Erro ao conciliar:', error);
      mostrarSnackbar('Erro ao conciliar', 'error');
    }
  };

  // ==================== ORÇAMENTOS ====================
  const handleSalvarOrcamento = async () => {
    try {
      const novoOrcamento = {
        id: Date.now().toString(),
        ano: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        metaReceitas: 0,
        metaDespesas: 0,
        categorias: {},
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      await firebaseService.add('orcamentos', novoOrcamento);
      await carregarDados();
      mostrarSnackbar('✅ Orçamento criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      mostrarSnackbar('Erro ao salvar orçamento', 'error');
    }
  };

  // ==================== CAIXA ====================
  const handleAbrirFecharCaixa = async () => {
    try {
      if (!caixa || caixa.status === 'fechado') {
        await caixaService.abrirCaixa({
          valorAbertura: caixaOperacao.valorAbertura,
          observacao: caixaOperacao.observacao || 'Abertura pelo dashboard financeiro',
        });
        mostrarSnackbar('✅ Caixa aberto com sucesso!');
      } else {
        await caixaService.fecharCaixa(caixa.id, {
          valorConferido: caixaOperacao.valorConferido,
          observacao: caixaOperacao.observacao || 'Fechamento pelo dashboard financeiro',
        });
        mostrarSnackbar('✅ Caixa fechado com conferência registrada!');
      }
      handleCloseCaixaDialog();
      await carregarDados();
    } catch (error) {
      console.error('Erro ao abrir/fechar caixa:', error);
      mostrarSnackbar(error.message || 'Erro ao operar caixa', 'error');
    }
  };

  // ==================== TRANSAÇÕES ====================
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
        tipo: String(formData.tipo),
        descricao: String(formData.descricao).trim(),
        valor: Number(valorNumerico),
        data: String(formData.data),
        dataVencimento: formData.dataVencimento ? String(formData.dataVencimento) : null,
        categoria: formData.categoria ? String(formData.categoria) : null,
        motivoTransacao: formData.motivoTransacao ? String(formData.motivoTransacao) : null,
        motivoTransacaoLabel: getMotivoTransacao(formData.motivoTransacao)?.label || null,
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
        origem: 'manual',
        origemId: null,
        updatedAt: new Date().toISOString(),
      };

      const motivoSelecionado = getMotivoTransacao(formData.motivoTransacao);
      let caixaAbertoParaMovimento = null;

      if (formData.status === 'pago') {
        dadosParaSalvar.dataPagamento = new Date().toISOString();
        if (motivoSelecionado?.caixaTipo) {
          caixaAbertoParaMovimento = await caixaService.obterCaixaAberto();
          if (!caixaAbertoParaMovimento) {
            mostrarSnackbar('Abra o caixa antes de salvar uma transação paga de sangria, reforço, retirada ou despesa do caixa.', 'error');
            return;
          }
        }
      }

      if (transacaoEditando) {
        await firebaseService.update('transacoes', transacaoEditando.id, dadosParaSalvar);
        if (motivoSelecionado?.caixaTipo && caixaAbertoParaMovimento) {
          await caixaService.removerMovimentosPorReferencia({ referenciaId: transacaoEditando.id, referenciaTipo: 'transacao_manual' }).catch(() => 0);
          await caixaService.registrarMovimento({
            caixaId: caixaAbertoParaMovimento.id,
            tipo: motivoSelecionado.caixaTipo,
            valor: valorNumerico,
            formaPagamento: formData.formaPagamento,
            descricao: dadosParaSalvar.descricao,
            observacao: dadosParaSalvar.observacoes || motivoSelecionado.label,
            origem: 'financeiro',
            referenciaId: transacaoEditando.id,
            referenciaTipo: 'transacao_manual',
            transacaoId: transacaoEditando.id,
            criarTransacao: false,
          });
        }
        await registrarAuditoria('editar_transacao', transacaoEditando.id, 'Transação editada');
        mostrarSnackbar('Transação atualizada com sucesso!');
      } else {
        dadosParaSalvar.createdAt = new Date().toISOString();
        const novoId = await firebaseService.add('transacoes', dadosParaSalvar);
        if (motivoSelecionado?.caixaTipo && caixaAbertoParaMovimento) {
          await caixaService.registrarMovimento({
            caixaId: caixaAbertoParaMovimento.id,
            tipo: motivoSelecionado.caixaTipo,
            valor: valorNumerico,
            formaPagamento: formData.formaPagamento,
            descricao: dadosParaSalvar.descricao,
            observacao: dadosParaSalvar.observacoes || motivoSelecionado.label,
            origem: 'financeiro',
            referenciaId: novoId,
            referenciaTipo: 'transacao_manual',
            transacaoId: novoId,
            criarTransacao: false,
          });
        }
        await registrarAuditoria('criar_transacao', novoId, 'Nova transação criada');
        mostrarSnackbar('Transação criada com sucesso!');
      }

      await carregarDados();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      mostrarSnackbar('Erro ao salvar transação', 'error');
    }
  };

  const handleDuplicar = (transacao) => {
    const { id, ...dados } = transacao;
    setTransacaoEditando(null);
    setFormData({
      ...dados,
      descricao: `${dados.descricao} (cópia)`,
      status: 'pendente',
      origem: 'manual',
      origemId: null,
      data: formatarDataBrasilia(new Date()),
    });
    setOpenDialog(true);
  };

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

      await carregarDados();
      mostrarSnackbar(novoStatus ? '📦 Transação arquivada' : '📂 Transação desarquivada');
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      mostrarSnackbar('Erro ao arquivar transação', 'error');
    }
  };

  // ==================== FUNÇÕES DE UI ====================
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
    if (transacao && transacao.origem === 'manual') {
      setTransacaoEditando(transacao);
      setFormData({
        tipo: transacao.tipo || 'receita',
        descricao: transacao.descricao || '',
        valor: transacao.valor || '',
        data: transacao.data || formatarDataBrasilia(new Date()),
        dataVencimento: transacao.dataVencimento || formatarDataBrasilia(new Date()),
        categoria: transacao.categoria || '',
        motivoTransacao: transacao.motivoTransacao || '',
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
        motivoTransacao: '',
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

  const handleOpenCaixaDialog = () => {
    setCaixaOperacao({
      valorAbertura: caixa?.status === 'aberto' ? (caixa.saldoInicial || caixa.valorAbertura || 0) : 0,
      valorConferido: caixa?.status === 'aberto' ? (caixa.saldoAtual || caixa.totais?.saldoAtual || 0) : 0,
      observacao: '',
    });
    setOpenCaixaDialog(true);
  };
  const handleCloseCaixaDialog = () => setOpenCaixaDialog(false);

  const handleOpenAnexos = (transacao) => {
    setTransacaoSelecionada(transacao);
    setAnexos(transacao?.anexos || []);
    setOpenAnexoDialog(true);
  };

  const fileToAnexo = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      id: `${Date.now()}_${file.name}`,
      nome: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      url: reader.result,
      uploadedAt: new Date().toISOString(),
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const resolverDestinoAnexo = (transacao) => {
    if (transacao?.origem === 'compra') return { colecao: 'compras', id: transacao.origemId };
    if (transacao?.origem === 'contas_receber') return { colecao: 'contas_receber', id: transacao.origemId };
    if (transacao?.origem === 'contas_pagar') return { colecao: 'contas_pagar', id: transacao.origemId };
    return { colecao: 'transacoes', id: transacao?.origem === 'manual' ? transacao.id : transacao?.origemId || transacao?.id };
  };

  const handleUploadAnexoTransacao = async (transacao, file) => {
    if (!file || !transacao) return;
    try {
      const anexo = await fileToAnexo(file);
      const anexosAtualizados = [...(transacao.anexos || []), anexo];
      const destino = resolverDestinoAnexo(transacao);
      if (!destino.id) throw new Error('Transação sem identificador para salvar anexo.');
      await firebaseService.update(destino.colecao, destino.id, { anexos: anexosAtualizados, updatedAt: new Date().toISOString() });
      setAnexos(anexosAtualizados);
      setTransacaoSelecionada({ ...transacao, anexos: anexosAtualizados });
      await carregarDados();
      mostrarSnackbar('✅ Anexo salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar anexo:', error);
      mostrarSnackbar(error.message || 'Erro ao salvar anexo', 'error');
    }
  };



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
    if (name === 'motivoTransacao') {
      const motivo = getMotivoTransacao(value);
      setFormData(prev => ({
        ...prev,
        motivoTransacao: value,
        tipo: motivo?.tipo || prev.tipo,
        categoria: motivo?.categoria || prev.categoria,
        descricao: !prev.descricao?.trim() || MOTIVOS_TRANSACAO.some((item) => item.descricao === prev.descricao)
          ? (motivo?.descricao || prev.descricao)
          : prev.descricao,
      }));
      return;
    }

    if (name === 'tipo') {
      setFormData(prev => ({ ...prev, tipo: value, motivoTransacao: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
        setDataInicio(formatarDataBrasilia(subDays(hoje, 7)));
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

  // ==================== ESTATÍSTICAS ====================
  const calcularEstatisticas = () => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    const transacoesPeriodo = transacoesCombinadas.filter(t => {
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
      const vencimento = t.dataVencimento ? new Date(t.dataVencimento) : new Date(t.data);
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

  // ==================== GRÁFICOS ====================
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

    transacoesCombinadas
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
    transacoesCombinadas
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
      .slice(0, 8);
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

    transacoesCombinadas
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
  const comissoesPorProfissional = gerarRelatorioComissoesProfissional();
  const fluxoProjetado = calcularFluxoProjetado(30);
  const relatorioDRE = gerarRelatorioDRE();

  // Filtrar transações
  const getTransacoesFiltradas = () => {
    let lista = [];

    if (tabValue === 0) lista = transacoesCombinadas.filter(t => !t.arquivado);
    else if (tabValue === 1) lista = transacoesCombinadas.filter(t => t.tipo === 'receita' && !t.arquivado);
    else if (tabValue === 2) lista = transacoesCombinadas.filter(t => t.tipo === 'despesa' && !t.arquivado);
    else if (tabValue === 3) lista = transacoesCombinadas.filter(t => t.origem === 'comissao' && !t.arquivado);
    else if (tabValue === 4) lista = transacoesCombinadas.filter(t => t.origem === 'compra' && !t.arquivado);
    else if (tabValue === 5) lista = transacoesCombinadas.filter(t => t.arquivado);

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
      const matchesFormaPagamento = filtroFormaPagamento === 'todas' || t.formaPagamento === filtroFormaPagamento;

      return matchesTexto && matchesStatus && matchesTipo && matchesCategoria && matchesFormaPagamento;
    });
  };

  const transacoesFiltradas = getTransacoesFiltradas();
  const paginatedTransacoes = transacoesFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              {perfilAtual && (
                <Chip
                  icon={<SecurityIcon />}
                  label={`Perfil: ${perfisAcesso[perfilAtual]?.label || perfilAtual}`}
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => setOpenPerfilDialog(true)}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {alertasVencimento.length > 0 && (
                <Badge badgeContent={alertasVencimento.length} color="error">
                  <Button
                    variant="outlined"
                    startIcon={<NotificationsIcon />}
                    onClick={() => setOpenAlertasDialog(true)}
                    color="warning"
                  >
                    Alertas
                  </Button>
                </Badge>
              )}

              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={carregarDados}>
                Atualizar
              </Button>

              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportarParaExcel}>
                Excel
              </Button>

              <Button variant="outlined" startIcon={<PrintIcon />} onClick={exportarParaPDF}>
                PDF
              </Button>

              <Button variant="outlined" startIcon={<BarChartIcon />} onClick={handleOpenRelatorioDialog}>
                Relatórios
              </Button>

              <Button variant="outlined" startIcon={<PercentIcon />} onClick={() => setOpenComissaoProfissionalDialog(true)}>
                Comissões
              </Button>

              <Button
                variant="contained"
                startIcon={<AccountBalanceIcon />}
                onClick={handleOpenCaixaDialog}
                color={caixa?.status === 'aberto' ? 'success' : 'primary'}
              >
                {caixa?.status === 'aberto' ? 'Fechar Caixa' : 'Abrir Caixa'}
              </Button>

              {verificarPermissao('criar') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                >
                  Nova Transação
                </Button>
              )}
            </Box>
          </Box>
        </motion.div>

        {/* Status do Caixa */}
        {caixa?.status === 'aberto' ? (
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
              <strong>Caixa Aberto</strong> - Saldo atual: {formatarMoeda(caixa.saldoAtual)} |
              Abertura: {safeToDisplayDate(caixa.dataAbertura)} {caixa.dataAbertura ? new Date(caixa.dataAbertura).toLocaleTimeString('pt-BR').substring(0,5) : ''}
            </Alert>
          </Zoom>
        ) : (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleOpenCaixaDialog}>
                Abrir Caixa
              </Button>
            }
          >
            <strong>Caixa fechado.</strong> Abra o caixa no Dashboard Financeiro antes de finalizar pagamentos de atendimentos.
          </Alert>
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
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stats.saldo >= 0 ? '#4caf50' : '#f44336' }}>
                        {formatarMoeda(stats.saldo)}
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
                        {formatarMoeda(stats.receitas)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        A receber: {formatarMoeda(stats.aReceber)}
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
                        {formatarMoeda(stats.despesas)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        A pagar: {formatarMoeda(stats.aPagar)}
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
                        Pendentes
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stats.comissoesPendentes > 0 ? '#9c27b0' : '#9e9e9e' }}>
                        {formatarMoeda(stats.comissoesPendentes + stats.comprasPendentes)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Comissões: {formatarMoeda(stats.comissoesPendentes)} | Compras: {formatarMoeda(stats.comprasPendentes)}
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
                  <Select value={periodoSelecionado} label="Período" onChange={(e) => handlePeriodoChange(e.target.value)}>
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
                  value={dataInicio ? new Date(dataInicio) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDataInicio(formatarDataBrasilia(newValue));
                      setPeriodoSelecionado('personalizado');
                    }
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Data Fim"
                  value={dataFim ? new Date(dataFim) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDataFim(formatarDataBrasilia(newValue));
                      setPeriodoSelecionado('personalizado');
                    }
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" startIcon={<TimelineIcon />} onClick={() => setOpenFluxoProjetadoDialog(true)}>
                    Fluxo Projetado
                  </Button>
                  <Button variant="outlined" startIcon={<AssessmentIcon />} onClick={() => setOpenOrcamentoDialog(true)}>
                    Orçamentos
                  </Button>
                  <Button variant="outlined" startIcon={<CompareArrowsIcon />} onClick={() => setOpenConciliacaoDialog(true)}>
                    Conciliar
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
                        <RechartsTooltip formatter={(value) => formatarMoeda(value)} />
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
                        <RechartsTooltip formatter={(value) => formatarMoeda(value)} />
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
                  <RechartsTooltip formatter={(value) => formatarMoeda(value)} />
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
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por descrição, categoria, profissional, pedido..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                    endAdornment: filtro && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setFiltro('')}><ClearIcon /></IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={filtroStatus} label="Status" onChange={(e) => setFiltroStatus(e.target.value)}>
                    <MenuItem value="todos">Todos</MenuItem>
                    {Object.keys(statusColors).map(status => (
                      <MenuItem key={status} value={status}>{statusColors[status].label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select value={filtroTipo} label="Tipo" onChange={(e) => setFiltroTipo(e.target.value)}>
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="receita">Receitas</MenuItem>
                    <MenuItem value="despesa">Despesas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Forma Pagamento</InputLabel>
                  <Select value={filtroFormaPagamento} label="Forma Pagamento" onChange={(e) => setFiltroFormaPagamento(e.target.value)}>
                    <MenuItem value="todas">Todas</MenuItem>
                    {formasPagamento.map(fp => (
                      <MenuItem key={fp.value} value={fp.value}>{fp.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoria</InputLabel>
                  <Select value={filtroCategoria} label="Categoria" onChange={(e) => setFiltroCategoria(e.target.value)}>
                    <MenuItem value="todas">Todas</MenuItem>
                    <MenuItem value="Comissões">Comissões</MenuItem>
                    <MenuItem value="Compras">Compras</MenuItem>
                    {categorias.filter(c => c !== 'Comissões' && c !== 'Compras').map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={1}>
                <Button fullWidth variant="outlined" onClick={() => {
                  setFiltro('');
                  setFiltroStatus('todos');
                  setFiltroTipo('todos');
                  setFiltroCategoria('todas');
                  setFiltroFormaPagamento('todas');
                }}>
                  Limpar
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
                    <TableCell><strong>Forma Pagto</strong></TableCell>
                    <TableCell><strong>Vencimento</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Anexos</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {paginatedTransacoes.map((transacao, index) => {
                      const cliente = clientes.find(c => c.id === transacao.clienteId);
                      const fornecedor = fornecedores.find(f => f.id === transacao.fornecedorId);
                      const profissional = profissionais.find(p => p.id === transacao.profissionalId);
                      const formaPagto = formasPagamento.find(fp => fp.value === transacao.formaPagamento);

                      let iconeTipo = <ReceiptIcon />;
                      let corTipo = '#757575';
                      let tipoLabel = '';

                      if (transacao.origem === 'comissao') {
                        iconeTipo = <PercentIcon />;
                        corTipo = '#9c27b0';
                        tipoLabel = 'Comissão';
                      } else if (transacao.origem === 'compra') {
                        iconeTipo = <ShoppingCartIcon />;
                        corTipo = '#ff9800';
                        tipoLabel = 'Compra';
                      } else if (transacao.tipo === 'receita') {
                        iconeTipo = <TrendingUpIcon />;
                        corTipo = '#4caf50';
                        tipoLabel = 'Receita';
                      } else if (transacao.tipo === 'despesa') {
                        iconeTipo = <TrendingDownIcon />;
                        corTipo = '#f44336';
                        tipoLabel = 'Despesa';
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
                          <TableCell>{safeToDisplayDate(transacao.data)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ bgcolor: corTipo, width: 32, height: 32 }}>{iconeTipo}</Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{transacao.descricao}</Typography>
                                {profissional && <Typography variant="caption" color="textSecondary">Profissional: {profissional.nome || transacao.profissionalNome}</Typography>}
                                {cliente && <Typography variant="caption" color="textSecondary">Cliente: {cliente.nome}</Typography>}
                                {fornecedor && <Typography variant="caption" color="textSecondary">Fornecedor: {fornecedor.nome}</Typography>}
                                {transacao.servicoNome && <Typography variant="caption" color="textSecondary"> • {transacao.servicoNome}</Typography>}
                                {transacao.numeroPedido && <Typography variant="caption" color="textSecondary"> • Pedido: {transacao.numeroPedido}</Typography>}
                                {transacao.percentual && <Chip label={`${transacao.percentual}%`} size="small" sx={{ ml: 1, height: 20, fontSize: '0.7rem', bgcolor: '#f3e5f5' }} />}
                                {transacao.parcelas > 1 && <Chip label={`${transacao.parcelas}x`} size="small" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tipoLabel}
                              size="small"
                              sx={{
                                bgcolor: transacao.origem === 'comissao' ? '#f3e5f5' : transacao.origem === 'compra' ? '#fff3e0' : transacao.tipo === 'receita' ? '#e8f5e9' : '#ffebee',
                                color: transacao.origem === 'comissao' ? '#9c27b0' : transacao.origem === 'compra' ? '#ff9800' : transacao.tipo === 'receita' ? '#4caf50' : '#f44336',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: transacao.tipo === 'receita' ? '#4caf50' : '#f44336' }}>
                              {transacao.tipo === 'receita' ? '+' : '-'} {formatarMoeda(transacao.valor)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={formaPagto?.label}>
                              <Typography variant="body2">{formaPagto?.icon} {formaPagto?.label}</Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {transacao.dataVencimento ? (
                              <Box>
                                <Typography variant="body2">{safeToDisplayDate(transacao.dataVencimento)}</Typography>
                                {transacao.status === 'pendente' && new Date(transacao.dataVencimento) < new Date() && (
                                  <Chip label="Vencida" size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
                                )}
                              </Box>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusColors[transacao.status]?.icon}
                              label={statusColors[transacao.status]?.label || transacao.status}
                              size="small"
                              sx={{ bgcolor: `${statusColors[transacao.status]?.color}20`, color: statusColors[transacao.status]?.color }}
                            />
                          </TableCell>
                          <TableCell>
                            {transacao.anexos?.length > 0 && (
                              <Tooltip title={`${transacao.anexos.length} anexo(s)`}>
                                <IconButton size="small" onClick={() => handleOpenAnexos(transacao)}>
                                  <AttachFileIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <IconButton size="small" onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.onchange = (e) => {
                                const file = e.target.files[0];
                                handleUploadAnexoTransacao(transacao, file);
                              };
                              input.click();
                            }}>
                              <CloudUploadIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Ver Detalhes">
                                <IconButton size="small" onClick={() => handleOpenDetalhes(transacao)} sx={{ color: '#9c27b0' }}>
                                  <ReceiptIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {transacao.status === 'pendente' && verificarPermissao('pagar') && (
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

                              {transacao.origem === 'manual' && verificarPermissao('editar') && !transacao.arquivado && (
                                <Tooltip title="Editar">
                                  <IconButton size="small" onClick={() => handleOpenDialog(transacao)} sx={{ color: '#ff4081' }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title="Duplicar">
                                <IconButton size="small" onClick={() => handleDuplicar(transacao)} sx={{ color: '#2196f3' }}>
                                  <FileCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {transacao.origem === 'manual' && (
                                <Tooltip title={transacao.arquivado ? 'Desarquivar' : 'Arquivar'}>
                                  <IconButton size="small" onClick={() => handleArquivar(transacao)} sx={{ color: transacao.arquivado ? '#ff9800' : '#757575' }}>
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
                      <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                        <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="body1" color="textSecondary">Nenhuma transação encontrada</Typography>
                        {verificarPermissao('criar') && (
                          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ mt: 2 }}>
                            Nova Transação
                          </Button>
                        )}
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

      {/* ==================== DIÁLOGOS ==================== */}

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
                <Select name="tipo" value={formData.tipo} label="Tipo *" onChange={handleInputChange}>
                  <MenuItem value="receita">💰 Receita</MenuItem>
                  <MenuItem value="despesa">💸 Despesa</MenuItem>
                  <MenuItem value="transferencia">🔄 Transferência</MenuItem>
                  <MenuItem value="investimento">📈 Investimento</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Motivo</InputLabel>
                <Select name="motivoTransacao" value={formData.motivoTransacao} label="Motivo" onChange={handleInputChange}>
                  <MenuItem value="">Selecionar motivo</MenuItem>
                  {MOTIVOS_TRANSACAO.filter((motivo) => motivo.tipo === formData.tipo).map((motivo) => (
                    <MenuItem key={motivo.value} value={motivo.value}>{motivo.label}</MenuItem>
                  ))}
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
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data"
                value={formData.data ? new Date(formData.data) : null}
                onChange={(newValue) => {
                  if (newValue) setFormData({ ...formData, data: formatarDataBrasilia(newValue) });
                }}
                renderInput={(params) => <TextField {...params} fullWidth size="small" required />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data de Vencimento"
                value={formData.dataVencimento ? new Date(formData.dataVencimento) : null}
                onChange={(newValue) => {
                  if (newValue) setFormData({ ...formData, dataVencimento: formatarDataBrasilia(newValue) });
                }}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select name="formaPagamento" value={formData.formaPagamento} label="Forma de Pagamento" onChange={handleInputChange}>
                  {formasPagamento.map(fp => (
                    <MenuItem key={fp.value} value={fp.value}>{fp.icon} {fp.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} label="Status" onChange={handleInputChange}>
                  <MenuItem value="pendente">⏳ Pendente</MenuItem>
                  <MenuItem value="pago">✅ Pago</MenuItem>
                  <MenuItem value="atrasado">⚠️ Atrasado</MenuItem>
                  <MenuItem value="cancelado">❌ Cancelado</MenuItem>
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSalvar} variant="contained" sx={{ bgcolor: '#9c27b0' }}>
            {transacaoEditando ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Caixa */}
      <Dialog open={openCaixaDialog} onClose={handleCloseCaixaDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: caixa?.status === 'aberto' ? '#f44336' : '#4caf50', color: 'white' }}>
          {caixa?.status === 'aberto' ? '🔒 Conferir e fechar caixa' : '🔓 Abrir caixa agora'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {caixa?.status === 'aberto' ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="info">Confira dinheiro, PIX, cartões e demais formas antes de encerrar o turno.</Alert>
                </Grid>
                <Grid item xs={12} sm={6}><Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}><Typography variant="caption" color="textSecondary">Saldo esperado</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>{formatarMoeda(caixa.saldoAtual || caixa.totais?.saldoAtual || 0)}</Typography></Paper></Grid>
                <Grid item xs={12} sm={6}><Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}><Typography variant="caption" color="textSecondary">Movimentações</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>{caixa.movimentacoes?.length || 0}</Typography></Paper></Grid>
                <Grid item xs={12}>
                  <TextField fullWidth type="number" label="Valor conferido no caixa" value={caixaOperacao.valorConferido} onChange={(e) => setCaixaOperacao({ ...caixaOperacao, valorConferido: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity={Number(caixaOperacao.valorConferido || 0) === Number(caixa.saldoAtual || caixa.totais?.saldoAtual || 0) ? 'success' : 'warning'}>
                    Diferença apurada: {formatarMoeda(Number(caixaOperacao.valorConferido || 0) - Number(caixa.saldoAtual || caixa.totais?.saldoAtual || 0))}
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Observação de fechamento" value={caixaOperacao.observacao} onChange={(e) => setCaixaOperacao({ ...caixaOperacao, observacao: e.target.value })} placeholder="Ex.: dinheiro conferido, cartões batidos e PIX conciliado." />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(caixa.totais?.porForma || {}).map(([forma, valor]) => <Chip key={forma} label={`${METODOS_CAIXA[forma] || forma}: ${formatarMoeda(valor)}`} variant="outlined" />)}
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="success" icon={<AccountBalanceIcon />}>
                    Abra o caixa para integrar recebimentos, contas pagas, movimentações e relatórios do financeiro em tempo real.
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f1f8e9' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Deseja abrir o caixa agora?</Typography>
                    <Typography variant="body2" color="textSecondary">Informe o fundo inicial e uma observação para iniciar o controle profissional do turno.</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth type="number" label="Valor de abertura" value={caixaOperacao.valorAbertura} onChange={(e) => setCaixaOperacao({ ...caixaOperacao, valorAbertura: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Observação de abertura" value={caixaOperacao.observacao} onChange={(e) => setCaixaOperacao({ ...caixaOperacao, observacao: e.target.value })} placeholder="Ex.: fundo inicial entregue ao operador responsável." />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseCaixaDialog}>Cancelar</Button>
          <Button onClick={handleAbrirFecharCaixa} variant="contained" color={caixa?.status === 'aberto' ? 'error' : 'success'}>
            {caixa?.status === 'aberto' ? 'Fechar com conferência' : 'Abrir caixa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>📋 Detalhes da Transação</DialogTitle>
        <DialogContent>
          {transacaoSelecionada && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: transacaoSelecionada.tipo === 'receita' ? '#f1f8e9' : '#ffebee' }}>
                    <Typography variant="overline" color="textSecondary">{transacaoSelecionada.origem || 'manual'}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{transacaoSelecionada.descricao}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: transacaoSelecionada.tipo === 'receita' ? '#2e7d32' : '#c62828' }}>{formatarMoeda(transacaoSelecionada.valor)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}><ListItem><ListItemAvatar><Avatar sx={{ bgcolor: '#ff9800' }}><CalendarIcon /></Avatar></ListItemAvatar><ListItemText primary="Data" secondary={safeToDisplayDate(transacaoSelecionada.data)} /></ListItem></Grid>
                {transacaoSelecionada.dataVencimento && <Grid item xs={12} sm={6}><ListItem><ListItemAvatar><Avatar sx={{ bgcolor: '#f44336' }}><WarningIcon /></Avatar></ListItemAvatar><ListItemText primary="Vencimento" secondary={safeToDisplayDate(transacaoSelecionada.dataVencimento)} /></ListItem></Grid>}
                <Grid item xs={12} sm={6}><ListItem><ListItemAvatar><Avatar sx={{ bgcolor: '#2196f3' }}><PaymentIcon /></Avatar></ListItemAvatar><ListItemText primary="Forma de Pagamento" secondary={formasPagamento.find(fp => fp.value === transacaoSelecionada.formaPagamento)?.label || transacaoSelecionada.formaPagamento} /></ListItem></Grid>
                <Grid item xs={12} sm={6}><ListItem><ListItemAvatar><Avatar sx={{ bgcolor: '#9e9e9e' }}><BarChartIcon /></Avatar></ListItemAvatar><ListItemText primary="Categoria" secondary={transacaoSelecionada.categoria || 'Sem categoria'} /></ListItem></Grid>
                <Grid item xs={12} sm={6}><ListItem><ListItemAvatar><Avatar sx={{ bgcolor: statusColors[transacaoSelecionada.status]?.color || '#9e9e9e' }}>{statusColors[transacaoSelecionada.status]?.icon}</Avatar></ListItemAvatar><ListItemText primary="Status" secondary={statusColors[transacaoSelecionada.status]?.label || transacaoSelecionada.status} /></ListItem></Grid>
                <Grid item xs={12} sm={6}><ListItem><ListItemAvatar><Avatar sx={{ bgcolor: transacaoSelecionada.anexos?.length ? '#4caf50' : '#9e9e9e' }}><AttachFileIcon /></Avatar></ListItemAvatar><ListItemText primary="Anexos" secondary={transacaoSelecionada.anexos?.length ? `${transacaoSelecionada.anexos.length} anexo(s) incluído(s)` : 'Nenhum anexo incluído'} /></ListItem></Grid>
                {transacaoSelecionada.observacoes && <Grid item xs={12}><Alert severity="info"><strong>Observações:</strong> {transacaoSelecionada.observacoes}</Alert></Grid>}
                {transacaoSelecionada.anexos?.length > 0 && <Grid item xs={12}><Button startIcon={<AttachFileIcon />} variant="outlined" onClick={() => handleOpenAnexos(transacaoSelecionada)}>Visualizar anexos</Button></Grid>}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
          {transacaoSelecionada?.status === 'pendente' && verificarPermissao('pagar') && (
            <Button variant="contained" color="success" onClick={() => { handleCloseDetalhes(); handleMarcarComoPago(transacaoSelecionada); }}>
              Marcar como Pago
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog de Anexos */}
      <Dialog open={openAnexoDialog} onClose={() => setOpenAnexoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#607d8b', color: 'white' }}><AttachFileIcon sx={{ mr: 1 }} /> Anexos da transação</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth sx={{ mb: 2 }}>Enviar novo anexo<input type="file" hidden onChange={(e) => handleUploadAnexoTransacao(transacaoSelecionada, e.target.files?.[0])} /></Button>
            <Alert severity={anexos.length ? 'success' : 'info'} sx={{ mb: 2 }}>
              {anexos.length ? `${anexos.length} anexo(s) incluído(s) nesta movimentação.` : 'Nenhum anexo incluído nesta movimentação.'}
            </Alert>
            {anexos.length > 0 && (
              <List>
                {anexos.map((anexo, index) => {
                  const nome = anexo.nome || anexo.name || anexo.filename || `Anexo ${index + 1}`;
                  const url = anexo.url || anexo.link || anexo.downloadURL || anexo.path || '';
                  return (
                    <ListItem key={`${nome}-${index}`} secondaryAction={url ? <Button size="small" startIcon={<VisibilityIcon />} href={url} target="_blank" rel="noopener noreferrer">Abrir</Button> : null}>
                      <ListItemAvatar><Avatar sx={{ bgcolor: '#607d8b' }}><AttachFileIcon /></Avatar></ListItemAvatar>
                      <ListItemText primary={nome} secondary={anexo.tipo || anexo.type || anexo.tamanho || anexo.size || 'Arquivo anexado'} />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenAnexoDialog(false)}>Fechar</Button></DialogActions>
      </Dialog>

      {/* Dialog de Relatórios */}
      <Dialog open={openRelatorioDialog} onClose={handleCloseRelatorioDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>📊 Relatórios Financeiros</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => setOpenFluxoProjetadoDialog(true)}>
                  <CardContent><Typography variant="h6" gutterBottom>Fluxo de Caixa</Typography><Typography variant="body2" color="textSecondary">Análise detalhada do fluxo de caixa por período</Typography></CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => setOpenOrcamentoDialog(true)}>
                  <CardContent><Typography variant="h6" gutterBottom>DRE</Typography><Typography variant="body2" color="textSecondary">Demonstrativo de Resultados do Exercício</Typography></CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => setOpenComissaoProfissionalDialog(true)}>
                  <CardContent><Typography variant="h6" gutterBottom>Comissões</Typography><Typography variant="body2" color="textSecondary">Relatório de comissões por profissional e período</Typography></CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => {}}>
                  <CardContent><Typography variant="h6" gutterBottom>Compras</Typography><Typography variant="body2" color="textSecondary">Análise de compras por fornecedor e período</Typography></CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={handleCloseRelatorioDialog}>Fechar</Button></DialogActions>
      </Dialog>

      {/* Dialog de Alertas */}
      <Dialog open={openAlertasDialog} onClose={() => setOpenAlertasDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}><NotificationsIcon sx={{ mr: 1 }} /> Alertas de Vencimento</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {alertasVencimento.length === 0 ? (
              <Typography color="textSecondary">Nenhum alerta no momento</Typography>
            ) : (
              alertasVencimento.map((alerta, index) => (
                <Alert key={index} severity={alerta.severidade} sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => handleMarcarComoPago(alerta)}>Pagar</Button>}>
                  <strong>{alerta.descricao}</strong> - {alerta.mensagem}<br />
                  <small>Valor: {formatarMoeda(alerta.valor)} | Vencimento: {safeToDisplayDate(alerta.dataVencimento)}</small>
                </Alert>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenAlertasDialog(false)}>Fechar</Button></DialogActions>
      </Dialog>

      {/* Dialog de Comissões por Profissional */}
      <Dialog open={openComissaoProfissionalDialog} onClose={() => setOpenComissaoProfissionalDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}><PercentIcon sx={{ mr: 1 }} /> Relatório de Comissões por Profissional</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {Object.entries(comissoesPorProfissional).map(([profissional, dados]) => (
                <Grid item xs={12} md={6} key={profissional}>
                  <Card><CardContent>
                    <Typography variant="h6" gutterBottom><PersonIcon sx={{ mr: 1 }} /> {profissional}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={4}><Typography variant="caption" color="textSecondary">Total</Typography><Typography variant="body1" sx={{ fontWeight: 600, color: '#9c27b0' }}>{formatarMoeda(dados.total)}</Typography></Grid>
                      <Grid item xs={4}><Typography variant="caption" color="textSecondary">Pagas</Typography><Typography variant="body1" sx={{ color: '#4caf50' }}>{formatarMoeda(dados.pagas)}</Typography></Grid>
                      <Grid item xs={4}><Typography variant="caption" color="textSecondary">Pendentes</Typography><Typography variant="body1" sx={{ color: '#ff9800' }}>{formatarMoeda(dados.pendentes)}</Typography></Grid>
                    </Grid>
                  </CardContent></Card>
                </Grid>
              ))}
              {Object.keys(comissoesPorProfissional).length === 0 && <Typography color="textSecondary">Nenhuma comissão encontrada</Typography>}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions><Button startIcon={<DownloadIcon />} onClick={exportarParaExcel}>Exportar</Button><Button onClick={() => setOpenComissaoProfissionalDialog(false)}>Fechar</Button></DialogActions>
      </Dialog>

      {/* Dialog de Fluxo Projetado */}
      <Dialog open={openFluxoProjetadoDialog} onClose={() => setOpenFluxoProjetadoDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white' }}><TimelineIcon sx={{ mr: 1 }} /> Fluxo de Caixa Projetado (30 dias)</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TableContainer><Table size="small">
              <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}><TableCell><strong>Data</strong></TableCell><TableCell align="right"><strong>A Receber</strong></TableCell><TableCell align="right"><strong>A Pagar</strong></TableCell><TableCell align="right"><strong>Saldo Projetado</strong></TableCell></TableRow></TableHead>
              <TableBody>
                {fluxoProjetado.map((dia, index) => (
                  <TableRow key={index} sx={{ bgcolor: dia.saldo < 0 ? '#ffebee' : 'inherit' }}>
                    <TableCell>{dia.data}</TableCell>
                    <TableCell align="right" sx={{ color: '#4caf50' }}>{formatarMoeda(dia.receber)}</TableCell>
                    <TableCell align="right" sx={{ color: '#f44336' }}>{formatarMoeda(dia.pagar)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: dia.saldo >= 0 ? '#4caf50' : '#f44336' }}>{formatarMoeda(dia.saldo)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></TableContainer>
          </Box>
        </DialogContent>
        <DialogActions><Button startIcon={<DownloadIcon />} onClick={exportarParaExcel}>Exportar</Button><Button onClick={() => setOpenFluxoProjetadoDialog(false)}>Fechar</Button></DialogActions>
      </Dialog>

      {/* Dialog de Conciliação Bancária */}
      <Dialog open={openConciliacaoDialog} onClose={() => setOpenConciliacaoDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#00bcd4', color: 'white' }}><CompareArrowsIcon sx={{ mr: 1 }} /> Conciliação Bancária</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>Envie um CSV do banco com colunas como Data, Descrição/Histórico e Valor. O sistema cruza automaticamente data e valor com as transações financeiras.</Alert>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth sx={{ mb: 3, py: 2 }} disabled={processandoConciliacao}>
              {processandoConciliacao ? 'Processando extrato...' : 'Upload do Extrato Bancário (CSV)'}
              <input type="file" hidden accept=".csv,text/csv" onChange={processarArquivoConciliacao} />
            </Button>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}><Typography variant="caption" color="textSecondary">Lançamentos importados</Typography><Typography variant="h5" sx={{ fontWeight: 800 }}>{extratoBancario.length}</Typography></Paper></Grid>
              <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#e8f5e9' }}><Typography variant="caption" color="textSecondary">Conciliados agora</Typography><Typography variant="h5" sx={{ fontWeight: 800, color: '#2e7d32' }}>{resultadoConciliacao.conciliadas.length}</Typography></Paper></Grid>
              <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fff8e1' }}><Typography variant="caption" color="textSecondary">Pendentes de análise</Typography><Typography variant="h5" sx={{ fontWeight: 800, color: '#f57c00' }}>{resultadoConciliacao.pendentes.length}</Typography></Paper></Grid>
            </Grid>

            {resultadoConciliacao.conciliadas.length > 0 && <Typography variant="subtitle2" gutterBottom>Transações conciliadas</Typography>}
            {resultadoConciliacao.conciliadas.slice(0, 8).map((conc) => (
              <Alert key={`${conc.extratoId}_${conc.transacaoId}`} severity="success" sx={{ mb: 1 }}>{safeToDisplayDate(conc.data)} • {conc.transacaoDescricao} • {formatarMoeda(conc.valor)}</Alert>
            ))}

            {resultadoConciliacao.pendentes.length > 0 && <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Lançamentos pendentes</Typography>}
            {resultadoConciliacao.pendentes.slice(0, 8).map((item) => (
              <Alert key={item.id} severity="warning" sx={{ mb: 1 }}>{safeToDisplayDate(item.data)} • {item.descricao} • {formatarMoeda(item.valor)}</Alert>
            ))}

            {conciliacoes.length > 0 && <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Últimas conciliações salvas</Typography>}
            {conciliacoes.slice(0, 5).map((conc, idx) => (
              <Alert key={idx} severity="success" sx={{ mb: 1 }}>Conciliação em {safeToDisplayDate(conc.dataConciliacao)} • {conc.transacaoDescricao || conc.transacaoId} • {formatarMoeda(conc.valor || 0)}</Alert>
            ))}
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenConciliacaoDialog(false)}>Fechar</Button></DialogActions>
      </Dialog>

      {/* Dialog de Orçamentos */}
      <Dialog open={openOrcamentoDialog} onClose={() => setOpenOrcamentoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}><AssessmentIcon sx={{ mr: 1 }} /> Orçamentos e Previsões</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} fullWidth sx={{ mb: 3 }} onClick={handleSalvarOrcamento}>Criar Novo Orçamento</Button>
            {orcamentos.length === 0 ? <Alert severity="info">Nenhum orçamento criado.</Alert> : orcamentos.map((orc, idx) => (
              <Card key={idx} sx={{ mb: 2 }}><CardContent><Typography variant="subtitle1">Orçamento {orc.mes}/{orc.ano}</Typography><Typography variant="body2" color="textSecondary">Criado em: {safeToDisplayDate(orc.criadoEm)}</Typography><Button size="small">Editar</Button><Button size="small">Visualizar</Button></CardContent></Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenOrcamentoDialog(false)}>Fechar</Button></DialogActions>
      </Dialog>

      {/* Dialog de Perfil */}
      <Dialog open={openPerfilDialog} onClose={() => setOpenPerfilDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}><LockIcon sx={{ mr: 1 }} /> Controle de Acesso</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>Perfil atual: <strong>{perfisAcesso[perfilAtual]?.label}</strong></Typography>
            <FormControl fullWidth sx={{ mt: 2 }}><InputLabel>Alterar Perfil</InputLabel><Select value={perfilAtual} label="Alterar Perfil" onChange={(e) => setPerfilAtual(e.target.value)}>
              {Object.entries(perfisAcesso).map(([key, value]) => (<MenuItem key={key} value={key}>{value.label}</MenuItem>))}
            </Select></FormControl>
            <Alert severity="info" sx={{ mt: 3 }}><strong>Permissões do perfil atual:</strong><ul>{perfisAcesso[perfilAtual]?.permissoes.map(perm => (<li key={perm}>{perm}</li>))}</ul></Alert>
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenPerfilDialog(false)}>Fechar</Button></DialogActions>
      </Dialog>

      {/* Speed Dial */}
      <SpeedDial ariaLabel="Ações rápidas" sx={{ position: 'fixed', bottom: 16, right: 16 }} icon={<SpeedDialIcon />} onClose={() => setOpenSpeedDial(false)} onOpen={() => setOpenSpeedDial(true)} open={openSpeedDial}>
        <SpeedDialAction icon={<AddIcon />} tooltipTitle="Nova Transação" onClick={() => handleOpenDialog()} />
        <SpeedDialAction icon={<PercentIcon />} tooltipTitle="Relatório Comissões" onClick={() => setOpenComissaoProfissionalDialog(true)} />
        <SpeedDialAction icon={<TimelineIcon />} tooltipTitle="Fluxo Projetado" onClick={() => setOpenFluxoProjetadoDialog(true)} />
        <SpeedDialAction icon={<RefreshIcon />} tooltipTitle="Atualizar" onClick={carregarDados} />
      </SpeedDial>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}

export default ModernFinanceiro;
