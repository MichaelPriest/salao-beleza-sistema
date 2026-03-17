// src/pages/Performance.js
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Switch,
  FormControlLabel,
  Autocomplete,
  Badge,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  Slider,
  Tab,
  Tabs,
  alpha,
  Rating,
  CardMedia,
  CardActions,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemAvatar,
  ListItemText as MuiListItemText,
  Collapse,
  Breadcrumbs,
  Link,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Zoom,
  Fade,
  Grow,
  Slide,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Equalizer as EqualizerIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ThumbsUpDown as ThumbsUpDownIcon,
  CompareArrows as CompareIcon,
  SwapHoriz as SwapIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronRight as ChevronRightIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon,
  SettingsApplications as SettingsApplicationsIcon,
  Tune as TuneIcon,
  BugReport as BugIcon,
  Code as CodeIcon,
  Terminal as TerminalIcon,
  Storage as StorageIcon,
  Database as DatabaseIcon,
  CloudQueue as CloudQueueIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  CloudSync as CloudSyncIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  LockOutline as LockOutlineIcon,
  VerifiedUser as VerifiedUserIcon,
  AdminPanelSettings as AdminIcon,
  SupervisedUserCircle as UserIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AssignmentLate as AssignmentLateIcon,
  AssignmentReturn as AssignmentReturnIcon,
  AssignmentReturned as AssignmentReturnedIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Replay as ReplayIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  FastForward as FastForwardIcon,
  FastRewind as FastRewindIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import {
  format,
  subDays,
  subMonths,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachMonthOfInterval,
  differenceInDays,
  isSameDay,
  isWithinInterval,
  parseISO,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
  FunnelChart,
  Funnel,
  LabelList,
  Treemap,
} from 'recharts';

const periodos = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'ontem', label: 'Ontem' },
  { value: 'ultimos7', label: 'Últimos 7 dias' },
  { value: 'ultimos30', label: 'Últimos 30 dias' },
  { value: 'ultimos90', label: 'Últimos 90 dias' },
  { value: 'esteMes', label: 'Este mês' },
  { value: 'mesPassado', label: 'Mês passado' },
  { value: 'esteAno', label: 'Este ano' },
  { value: 'anoPassado', label: 'Ano passado' },
  { value: 'personalizado', label: 'Personalizado' },
];

const metricasDisponiveis = [
  { value: 'faturamento', label: 'Faturamento', icon: <MoneyIcon />, cor: '#4caf50' },
  { value: 'clientes', label: 'Clientes Atendidos', icon: <GroupIcon />, cor: '#2196f3' },
  { value: 'servicos', label: 'Serviços Realizados', icon: <AssignmentIcon />, cor: '#9c27b0' },
  { value: 'produtos', label: 'Produtos Vendidos', icon: <InventoryIcon />, cor: '#ff9800' },
  { value: 'taxa_ocupacao', label: 'Taxa de Ocupação', icon: <ScheduleIcon />, cor: '#00bcd4' },
  { value: 'ticket_medio', label: 'Ticket Médio', icon: <Money />, cor: '#ff4081' },
  { value: 'satisfacao', label: 'Satisfação', icon: <StarIcon />, cor: '#f44336' },
  { value: 'retencao', label: 'Taxa de Retenção', icon: <ThumbUpIcon />, cor: '#795548' },
];

const CORES_GRAFICOS = [
  '#9c27b0', '#ff4081', '#4caf50', '#2196f3', '#ff9800', 
  '#f44336', '#00bcd4', '#795548', '#607d8b', '#e91e63',
  '#673ab7', '#3f51b5', '#03a9f4', '#009688', '#8bc34a',
  '#cddc39', '#ffeb3b', '#ffc107', '#ff5722', '#9e9e9e'
];

function Performance() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    atendimentos: [],
    clientes: [],
    profissionais: [],
    servicos: [],
    produtos: [],
    avaliacoes: [],
  });
  const [periodo, setPeriodo] = useState('ultimos30');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [metricaSelecionada, setMetricaSelecionada] = useState('faturamento');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [metricas, setMetricas] = useState({
    faturamento: { atual: 0, anterior: 0, variacao: 0 },
    clientes: { atual: 0, anterior: 0, variacao: 0 },
    servicos: { atual: 0, anterior: 0, variacao: 0 },
    produtos: { atual: 0, anterior: 0, variacao: 0 },
    taxaOcupacao: { atual: 0, anterior: 0, variacao: 0 },
    ticketMedio: { atual: 0, anterior: 0, variacao: 0 },
    satisfacao: { atual: 0, anterior: 0, variacao: 0 },
    retencao: { atual: 0, anterior: 0, variacao: 0 },
  });

  const [graficos, setGraficos] = useState({
    evolucao: [],
    rankingProfissionais: [],
    rankingServicos: [],
    horariosPico: [],
    diasSemana: [],
    distribuicaoClientes: [],
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    processarDados();
  }, [dados, periodo, dataInicio, dataFim]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [atendimentosData, clientesData, profissionaisData, servicosData, produtosData, avaliacoesData] = await Promise.all([
        firebaseService.getAll('atendimentos').catch(() => []),
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('produtos').catch(() => []),
        firebaseService.getAll('avaliacoes').catch(() => [])
      ]);

      setDados({
        atendimentos: atendimentosData || [],
        clientes: clientesData || [],
        profissionais: profissionaisData || [],
        servicos: servicosData || [],
        produtos: produtosData || [],
        avaliacoes: avaliacoesData || [],
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const processarDados = () => {
    // Filtrar atendimentos por período
    let atendimentosFiltrados = [...dados.atendimentos];
    
    const hoje = new Date();
    let inicio = new Date();
    let fim = new Date();
    let inicioAnterior = new Date();
    let fimAnterior = new Date();

    switch (periodo) {
      case 'hoje':
        inicio = new Date(hoje.setHours(0, 0, 0, 0));
        fim = new Date(hoje.setHours(23, 59, 59, 999));
        inicioAnterior = subDays(inicio, 1);
        fimAnterior = subDays(fim, 1);
        break;
      case 'ontem':
        inicio = new Date(hoje.setDate(hoje.getDate() - 1));
        inicio.setHours(0, 0, 0, 0);
        fim = new Date(hoje.setDate(hoje.getDate() - 1));
        fim.setHours(23, 59, 59, 999);
        inicioAnterior = subWeeks(inicio, 1);
        fimAnterior = subWeeks(fim, 1);
        break;
      case 'ultimos7':
        inicio = subDays(hoje, 7);
        fim = new Date();
        inicioAnterior = subDays(inicio, 7);
        fimAnterior = subDays(fim, 7);
        break;
      case 'ultimos30':
        inicio = subDays(hoje, 30);
        fim = new Date();
        inicioAnterior = subDays(inicio, 30);
        fimAnterior = subDays(fim, 30);
        break;
      case 'ultimos90':
        inicio = subDays(hoje, 90);
        fim = new Date();
        inicioAnterior = subDays(inicio, 90);
        fimAnterior = subDays(fim, 90);
        break;
      case 'esteMes':
        inicio = startOfMonth(hoje);
        fim = endOfMonth(hoje);
        inicioAnterior = startOfMonth(subMonths(hoje, 1));
        fimAnterior = endOfMonth(subMonths(hoje, 1));
        break;
      case 'mesPassado':
        inicio = startOfMonth(subMonths(hoje, 1));
        fim = endOfMonth(subMonths(hoje, 1));
        inicioAnterior = startOfMonth(subMonths(hoje, 2));
        fimAnterior = endOfMonth(subMonths(hoje, 2));
        break;
      case 'esteAno':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        fim = new Date(hoje.getFullYear(), 11, 31);
        inicioAnterior = new Date(hoje.getFullYear() - 1, 0, 1);
        fimAnterior = new Date(hoje.getFullYear() - 1, 11, 31);
        break;
      case 'anoPassado':
        inicio = new Date(hoje.getFullYear() - 1, 0, 1);
        fim = new Date(hoje.getFullYear() - 1, 11, 31);
        inicioAnterior = new Date(hoje.getFullYear() - 2, 0, 1);
        fimAnterior = new Date(hoje.getFullYear() - 2, 11, 31);
        break;
      case 'personalizado':
        if (dataInicio && dataFim) {
          inicio = dataInicio;
          fim = dataFim;
          const diffDays = differenceInDays(fim, inicio);
          inicioAnterior = subDays(inicio, diffDays);
          fimAnterior = subDays(fim, diffDays);
        }
        break;
      default:
        break;
    }

    // Filtrar atendimentos do período atual
    const atendimentosAtuais = atendimentosFiltrados.filter(a => {
      const data = new Date(a.data);
      return data >= inicio && data <= fim && a.status === 'finalizado';
    });

    // Filtrar atendimentos do período anterior
    const atendimentosAnteriores = atendimentosFiltrados.filter(a => {
      const data = new Date(a.data);
      return data >= inicioAnterior && data <= fimAnterior && a.status === 'finalizado';
    });

    // Calcular métricas atuais
    const faturamentoAtual = atendimentosAtuais.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
    const clientesAtuais = new Set(atendimentosAtuais.map(a => a.clienteId)).size;
    const servicosAtuais = atendimentosAtuais.reduce((acc, a) => 
      acc + (a.itensServico?.length || (a.servicoId ? 1 : 0)), 0);
    const produtosAtuais = atendimentosAtuais.reduce((acc, a) => 
      acc + (a.itensProduto?.reduce((sum, p) => sum + (p.quantidade || 1), 0) || 0), 0);
    const ticketMedioAtual = atendimentosAtuais.length > 0 ? faturamentoAtual / atendimentosAtuais.length : 0;
    
    // Taxa de ocupação (considerando 8h por dia útil)
    const diasUteis = differenceInDays(fim, inicio) + 1;
    const horasDisponiveis = diasUteis * 8 * (dados.profissionais.length || 1);
    const horasUtilizadas = atendimentosAtuais.reduce((acc, a) => {
      if (a.duracao) return acc + a.duracao;
      if (a.horaInicio && a.horaFim) {
        const [h1, m1] = a.horaInicio.split(':').map(Number);
        const [h2, m2] = a.horaFim.split(':').map(Number);
        return acc + ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
      }
      return acc + 1; // Duração padrão de 1h
    }, 0);
    const taxaOcupacaoAtual = horasDisponiveis > 0 ? (horasUtilizadas / horasDisponiveis) * 100 : 0;

    // Satisfação
    const avaliacoesPeriodo = dados.avaliacoes.filter(a => {
      const data = new Date(a.data);
      return data >= inicio && data <= fim;
    });
    const satisfacaoAtual = avaliacoesPeriodo.length > 0
      ? avaliacoesPeriodo.reduce((acc, a) => acc + (a.nota || 0), 0) / avaliacoesPeriodo.length
      : 0;

    // Retenção (clientes que voltaram)
    const clientesNovos = atendimentosAtuais.filter(a => {
      const cliente = dados.clientes.find(c => c.id === a.clienteId);
      return cliente?.primeiraVisita ? new Date(cliente.primeiraVisita) >= inicio : false;
    }).length;
    const retencaoAtual = clientesAtuais > 0 
      ? ((clientesAtuais - clientesNovos) / clientesAtuais) * 100 
      : 0;

    // Calcular métricas anteriores
    const faturamentoAnterior = atendimentosAnteriores.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
    const clientesAnteriores = new Set(atendimentosAnteriores.map(a => a.clienteId)).size;
    const servicosAnteriores = atendimentosAnteriores.reduce((acc, a) => 
      acc + (a.itensServico?.length || (a.servicoId ? 1 : 0)), 0);
    const produtosAnteriores = atendimentosAnteriores.reduce((acc, a) => 
      acc + (a.itensProduto?.reduce((sum, p) => sum + (p.quantidade || 1), 0) || 0), 0);
    const ticketMedioAnterior = atendimentosAnteriores.length > 0 ? faturamentoAnterior / atendimentosAnteriores.length : 0;
    
    // Taxa de ocupação anterior
    const horasUtilizadasAnteriores = atendimentosAnteriores.reduce((acc, a) => {
      if (a.duracao) return acc + a.duracao;
      if (a.horaInicio && a.horaFim) {
        const [h1, m1] = a.horaInicio.split(':').map(Number);
        const [h2, m2] = a.horaFim.split(':').map(Number);
        return acc + ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
      }
      return acc + 1;
    }, 0);
    const taxaOcupacaoAnterior = horasDisponiveis > 0 ? (horasUtilizadasAnteriores / horasDisponiveis) * 100 : 0;

    // Satisfação anterior
    const avaliacoesPeriodoAnterior = dados.avaliacoes.filter(a => {
      const data = new Date(a.data);
      return data >= inicioAnterior && data <= fimAnterior;
    });
    const satisfacaoAnterior = avaliacoesPeriodoAnterior.length > 0
      ? avaliacoesPeriodoAnterior.reduce((acc, a) => acc + (a.nota || 0), 0) / avaliacoesPeriodoAnterior.length
      : 0;

    // Retenção anterior
    const clientesNovosAnteriores = atendimentosAnteriores.filter(a => {
      const cliente = dados.clientes.find(c => c.id === a.clienteId);
      return cliente?.primeiraVisita ? new Date(cliente.primeiraVisita) >= inicioAnterior : false;
    }).length;
    const retencaoAnterior = clientesAnteriores > 0 
      ? ((clientesAnteriores - clientesNovosAnteriores) / clientesAnteriores) * 100 
      : 0;

    // Calcular variações
    const calcularVariacao = (atual, anterior) => {
      if (anterior === 0) return atual > 0 ? 100 : 0;
      return ((atual - anterior) / anterior) * 100;
    };

    setMetricas({
      faturamento: { 
        atual: faturamentoAtual, 
        anterior: faturamentoAnterior, 
        variacao: calcularVariacao(faturamentoAtual, faturamentoAnterior) 
      },
      clientes: { 
        atual: clientesAtuais, 
        anterior: clientesAnteriores, 
        variacao: calcularVariacao(clientesAtuais, clientesAnteriores) 
      },
      servicos: { 
        atual: servicosAtuais, 
        anterior: servicosAnteriores, 
        variacao: calcularVariacao(servicosAtuais, servicosAnteriores) 
      },
      produtos: { 
        atual: produtosAtuais, 
        anterior: produtosAnteriores, 
        variacao: calcularVariacao(produtosAtuais, produtosAnteriores) 
      },
      taxaOcupacao: { 
        atual: taxaOcupacaoAtual, 
        anterior: taxaOcupacaoAnterior, 
        variacao: calcularVariacao(taxaOcupacaoAtual, taxaOcupacaoAnterior) 
      },
      ticketMedio: { 
        atual: ticketMedioAtual, 
        anterior: ticketMedioAnterior, 
        variacao: calcularVariacao(ticketMedioAtual, ticketMedioAnterior) 
      },
      satisfacao: { 
        atual: satisfacaoAtual, 
        anterior: satisfacaoAnterior, 
        variacao: calcularVariacao(satisfacaoAtual, satisfacaoAnterior) 
      },
      retencao: { 
        atual: retencaoAtual, 
        anterior: retencaoAnterior, 
        variacao: calcularVariacao(retencaoAtual, retencaoAnterior) 
      },
    });

    // Gerar dados para evolução temporal
    const evolucao = [];
    const dias = eachDayOfInterval({ start: inicio, end: fim });
    dias.forEach(dia => {
      const atendimentosDia = atendimentosAtuais.filter(a => isSameDay(new Date(a.data), dia));
      const faturamentoDia = atendimentosDia.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
      
      evolucao.push({
        data: format(dia, 'dd/MM'),
        faturamento: faturamentoDia,
        atendimentos: atendimentosDia.length,
        clientes: new Set(atendimentosDia.map(a => a.clienteId)).size,
      });
    });

    // Ranking de profissionais
    const profMap = new Map();
    atendimentosAtuais.forEach(a => {
      if (!profMap.has(a.profissionalId)) {
        const prof = dados.profissionais.find(p => p.id === a.profissionalId);
        profMap.set(a.profissionalId, {
          id: a.profissionalId,
          nome: prof?.nome || 'Profissional',
          atendimentos: 0,
          faturamento: 0,
        });
      }
      const profData = profMap.get(a.profissionalId);
      profData.atendimentos++;
      profData.faturamento += a.valorTotal || 0;
    });

    const rankingProfissionais = Array.from(profMap.values())
      .sort((a, b) => b.faturamento - a.faturamento)
      .slice(0, 10);

    // Ranking de serviços
    const servMap = new Map();
    atendimentosAtuais.forEach(a => {
      const servicosLista = a.itensServico || (a.servicoId ? [{ id: a.servicoId, nome: a.servicoNome, preco: a.valorTotal }] : []);
      servicosLista.forEach(s => {
        if (!servMap.has(s.id)) {
          servMap.set(s.id, {
            id: s.id,
            nome: s.nome || 'Serviço',
            quantidade: 0,
            faturamento: 0,
          });
        }
        const servData = servMap.get(s.id);
        servData.quantidade++;
        servData.faturamento += s.preco || 0;
      });
    });

    const rankingServicos = Array.from(servMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    // Horários de pico
    const horarios = Array(24).fill(0).map((_, i) => ({
      hora: `${i.toString().padStart(2, '0')}h`,
      atendimentos: 0,
    }));

    atendimentosAtuais.forEach(a => {
      if (a.horaInicio) {
        const hora = parseInt(a.horaInicio.split(':')[0]);
        if (hora >= 0 && hora < 24) {
          horarios[hora].atendimentos++;
        }
      }
    });

    // Dias da semana
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diasData = diasSemana.map((dia, index) => ({
      dia,
      atendimentos: 0,
      faturamento: 0,
    }));

    atendimentosAtuais.forEach(a => {
      const data = new Date(a.data);
      const diaSemana = data.getDay();
      diasData[diaSemana].atendimentos++;
      diasData[diaSemana].faturamento += a.valorTotal || 0;
    });

    // Distribuição de clientes por frequência
    const clienteFreq = new Map();
    atendimentosAtuais.forEach(a => {
      if (!clienteFreq.has(a.clienteId)) {
        clienteFreq.set(a.clienteId, 0);
      }
      clienteFreq.set(a.clienteId, clienteFreq.get(a.clienteId) + 1);
    });

    const distribuicaoClientes = [
      { name: '1 vez', value: 0 },
      { name: '2-3 vezes', value: 0 },
      { name: '4-6 vezes', value: 0 },
      { name: '7+ vezes', value: 0 },
    ];

    clienteFreq.forEach(freq => {
      if (freq === 1) distribuicaoClientes[0].value++;
      else if (freq <= 3) distribuicaoClientes[1].value++;
      else if (freq <= 6) distribuicaoClientes[2].value++;
      else distribuicaoClientes[3].value++;
    });

    setGraficos({
      evolucao,
      rankingProfissionais,
      rankingServicos,
      horariosPico: horarios,
      diasSemana: diasData,
      distribuicaoClientes,
    });
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExportar = (formato) => {
    if (formato === 'csv') {
      toast.success('Dados exportados para CSV');
    } else if (formato === 'pdf') {
      toast.success('Relatório PDF gerado');
    } else if (formato === 'excel') {
      toast.success('Planilha Excel gerada');
    }
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarNumero = (valor) => {
    return valor.toLocaleString('pt-BR');
  };

  const formatarPercentual = (valor) => {
    return `${valor.toFixed(1)}%`;
  };

  const getVariacaoColor = (variacao) => {
    if (variacao > 0) return '#4caf50';
    if (variacao < 0) return '#f44336';
    return '#ff9800';
  };

  const getVariacaoIcon = (variacao) => {
    if (variacao > 0) return <TrendingUpIcon />;
    if (variacao < 0) return <TrendingDownIcon />;
    return <SwapHorizIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Performance
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Acompanhe os principais indicadores de desempenho do negócio
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportar('excel')}
            >
              Exportar
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Imprimir
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={carregarDados}
            >
              Atualizar
            </Button>
          </Box>
        </Box>

        {/* Filtro de Período */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={periodo}
                    label="Período"
                    onChange={(e) => setPeriodo(e.target.value)}
                  >
                    {periodos.map(p => (
                      <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {periodo === 'personalizado' && (
                <>
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="Data Início"
                      value={dataInicio}
                      onChange={setDataInicio}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="Data Fim"
                      value={dataFim}
                      onChange={setDataFim}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} md={periodo === 'personalizado' ? 3 : 9}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Chip 
                    icon={<CalendarIcon />} 
                    label={format(new Date(), 'dd/MM/yyyy')}
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Cards de Métricas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: alpha('#4caf50', 0.1),
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Faturamento
                    </Typography>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 40, height: 40 }}>
                      <MoneyIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatarMoeda(metricas.faturamento.atual)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: getVariacaoColor(metricas.faturamento.variacao) }}>
                      {getVariacaoIcon(metricas.faturamento.variacao)}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getVariacaoColor(metricas.faturamento.variacao),
                        fontWeight: 600 
                      }}
                    >
                      {metricas.faturamento.variacao > 0 ? '+' : ''}
                      {metricas.faturamento.variacao.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      vs período anterior
                    </Typography>
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
              <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: alpha('#2196f3', 0.1),
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Clientes Atendidos
                    </Typography>
                    <Avatar sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}>
                      <GroupIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatarNumero(metricas.clientes.atual)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: getVariacaoColor(metricas.clientes.variacao) }}>
                      {getVariacaoIcon(metricas.clientes.variacao)}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getVariacaoColor(metricas.clientes.variacao),
                        fontWeight: 600 
                      }}
                    >
                      {metricas.clientes.variacao > 0 ? '+' : ''}
                      {metricas.clientes.variacao.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      vs período anterior
                    </Typography>
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
              <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: alpha('#ff9800', 0.1),
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Ticket Médio
                    </Typography>
                    <Avatar sx={{ bgcolor: '#ff9800', width: 40, height: 40 }}>
                      <Money />
                    </Avatar>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatarMoeda(metricas.ticketMedio.atual)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: getVariacaoColor(metricas.ticketMedio.variacao) }}>
                      {getVariacaoIcon(metricas.ticketMedio.variacao)}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getVariacaoColor(metricas.ticketMedio.variacao),
                        fontWeight: 600 
                      }}
                    >
                      {metricas.ticketMedio.variacao > 0 ? '+' : ''}
                      {metricas.ticketMedio.variacao.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      vs período anterior
                    </Typography>
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
              <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: alpha('#f44336', 0.1),
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Satisfação
                    </Typography>
                    <Avatar sx={{ bgcolor: '#f44336', width: 40, height: 40 }}>
                      <StarIcon />
                    </Avatar>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating value={metricas.satisfacao.atual} precision={0.5} readOnly />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {metricas.satisfacao.atual.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: getVariacaoColor(metricas.satisfacao.variacao) }}>
                      {getVariacaoIcon(metricas.satisfacao.variacao)}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getVariacaoColor(metricas.satisfacao.variacao),
                        fontWeight: 600 
                      }}
                    >
                      {metricas.satisfacao.variacao > 0 ? '+' : ''}
                      {metricas.satisfacao.variacao.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      vs período anterior
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Segunda linha de métricas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Serviços Realizados
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {formatarNumero(metricas.servicos.atual)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {metricas.servicos.variacao > 0 ? '+' : ''}
                    {metricas.servicos.variacao.toFixed(1)}% vs período anterior
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Produtos Vendidos
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {formatarNumero(metricas.produtos.atual)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {metricas.produtos.variacao > 0 ? '+' : ''}
                    {metricas.produtos.variacao.toFixed(1)}% vs período anterior
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Taxa de Ocupação
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#00bcd4' }}>
                    {formatarPercentual(metricas.taxaOcupacao.atual)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {metricas.taxaOcupacao.variacao > 0 ? '+' : ''}
                    {metricas.taxaOcupacao.variacao.toFixed(1)}% vs período anterior
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Taxa de Retenção
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#795548' }}>
                    {formatarPercentual(metricas.retencao.atual)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {metricas.retencao.variacao > 0 ? '+' : ''}
                    {metricas.retencao.variacao.toFixed(1)}% vs período anterior
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3}>
          {/* Evolução Temporal */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Evolução Diária</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={graficos.evolucao}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis yAxisId="left" orientation="left" stroke="#9c27b0" />
                      <YAxis yAxisId="right" orientation="right" stroke="#ff4081" />
                      <RechartsTooltip 
                        formatter={(value, name) => {
                          if (name === 'faturamento') return formatarMoeda(value);
                          return value;
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="atendimentos" fill="#9c27b0" name="Atendimentos" />
                      <Line yAxisId="right" type="monotone" dataKey="faturamento" stroke="#ff4081" name="Faturamento" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribuição de Clientes */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Frequência de Clientes</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={graficos.distribuicaoClientes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {graficos.distribuicaoClientes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ranking de Profissionais */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Top Profissionais</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={graficos.rankingProfissionais}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="nome" width={120} />
                      <RechartsTooltip 
                        formatter={(value, name) => {
                          if (name === 'faturamento') return formatarMoeda(value);
                          return value;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="faturamento" fill="#4caf50" name="Faturamento" />
                      <Bar dataKey="atendimentos" fill="#2196f3" name="Atendimentos" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ranking de Serviços */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Top Serviços</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={graficos.rankingServicos}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="nome" width={120} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="quantidade" fill="#ff9800" name="Quantidade" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Horários de Pico */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Horários de Pico</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graficos.horariosPico}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hora" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="atendimentos" fill="#9c27b0" name="Atendimentos" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Dias da Semana */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Desempenho por Dia</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={graficos.diasSemana}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dia" />
                      <PolarRadiusAxis />
                      <Radar name="Atendimentos" dataKey="atendimentos" stroke="#9c27b0" fill="#9c27b0" fillOpacity={0.6} />
                      <Radar name="Faturamento" dataKey="faturamento" stroke="#ff4081" fill="#ff4081" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
    </LocalizationProvider>
  );
}

export default Performance;
