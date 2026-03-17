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
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  CardActions,
  CardMedia,
  CardActionArea,
  Fab,
  Zoom,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  DateRange as DateRangeIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  Assessment as AssessmentIcon,
  Equalizer as EqualizerIcon,
  BubbleChart as BubbleChartIcon,
  CompareArrows as CompareArrowsIcon,
  SwapHoriz as SwapHorizIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  MilitaryTech as MedalIcon,
  WorkspacePremium as PremiumIcon,
  Whatshot as HotIcon,
  NewReleases as NewIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  HourglassEmpty as HourglassIcon,
  Speed as GaugeIcon,
  Leaderboard as LeaderboardIcon,
  Psychology as PsychologyIcon,
  GroupWork as GroupWorkIcon,
  BusinessCenter as BusinessIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  QueryStats as StatsIcon,
  CandlestickChart as CandlestickIcon,
  ScatterPlot as ScatterIcon,
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
  differenceInMinutes,
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
  { value: 'personalizado', label: 'Personalizado' },
];

const metricasDisponiveis = [
  { value: 'faturamento', label: 'Faturamento', icon: <MoneyIcon />, cor: '#4caf50' },
  { value: 'atendimentos', label: 'Atendimentos', icon: <AssignmentIcon />, cor: '#2196f3' },
  { value: 'clientes', label: 'Clientes Atendidos', icon: <PersonIcon />, cor: '#ff9800' },
  { value: 'ticketMedio', label: 'Ticket Médio', icon: <MoneyIcon />, cor: '#9c27b0' },
  { value: 'taxaConversao', label: 'Taxa de Conversão', icon: <TrendingUpIcon />, cor: '#00bcd4' },
  { value: 'satisfacao', label: 'Satisfação', icon: <StarIcon />, cor: '#ff4081' },
  { value: 'produtividade', label: 'Produtividade', icon: <SpeedIcon />, cor: '#f44336' },
  { value: 'retencao', label: 'Retenção', icon: <LoopIcon />, cor: '#795548' },
];

const tiposRanking = [
  { value: 'profissionais', label: 'Profissionais' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'produtos', label: 'Produtos' },
];

const periodosComparacao = [
  { value: 'anterior', label: 'Período anterior' },
  { value: 'anoPassado', label: 'Ano passado' },
  { value: 'meta', label: 'Meta' },
  { value: 'media', label: 'Média histórica' },
];

const CORES_RANKING = ['#FFD700', '#C0C0C0', '#CD7F32', '#9c27b0', '#ff4081'];

function Performance() {
  const [loading, setLoading] = useState(true);
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [periodo, setPeriodo] = useState('ultimos30');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [metricaSelecionada, setMetricaSelecionada] = useState('faturamento');
  const [tipoRanking, setTipoRanking] = useState('profissionais');
  const [comparacao, setComparacao] = useState('anterior');
  const [metas, setMetas] = useState({
    faturamento: 50000,
    atendimentos: 200,
    clientes: 150,
    ticketMedio: 250,
    satisfacao: 4.5,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openMetasDialog, setOpenMetasDialog] = useState(false);
  const [dadosProcessados, setDadosProcessados] = useState({
    performanceGeral: {},
    historico: [],
    ranking: [],
    comparativo: {},
    tendencias: [],
    kpis: [],
    satisfacao: [],
    produtividade: [],
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    processarDados();
  }, [atendimentos, clientes, profissionais, servicos, avaliacoes, periodo, dataInicio, dataFim]);

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

      const atendimentosFinalizados = (atendimentosData || []).filter(a => a.status === 'finalizado');

      setAtendimentos(atendimentosFinalizados);
      setClientes(clientesData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);
      setProdutos(produtosData || []);
      setAvaliacoes(avaliacoesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const processarDados = () => {
    // Filtrar atendimentos por período
    let atendimentosFiltrados = [...atendimentos];
    
    const hoje = new Date();
    let inicio = new Date();
    let fim = new Date();

    switch (periodo) {
      case 'hoje':
        inicio = new Date(hoje.setHours(0, 0, 0, 0));
        fim = new Date(hoje.setHours(23, 59, 59, 999));
        break;
      case 'ontem':
        inicio = new Date(hoje.setDate(hoje.getDate() - 1));
        inicio.setHours(0, 0, 0, 0);
        fim = new Date(hoje.setDate(hoje.getDate() - 1));
        fim.setHours(23, 59, 59, 999);
        break;
      case 'ultimos7':
        inicio = subDays(hoje, 7);
        fim = new Date();
        break;
      case 'ultimos30':
        inicio = subDays(hoje, 30);
        fim = new Date();
        break;
      case 'ultimos90':
        inicio = subDays(hoje, 90);
        fim = new Date();
        break;
      case 'esteMes':
        inicio = startOfMonth(hoje);
        fim = endOfMonth(hoje);
        break;
      case 'mesPassado':
        inicio = startOfMonth(subMonths(hoje, 1));
        fim = endOfMonth(subMonths(hoje, 1));
        break;
      case 'esteAno':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        fim = new Date(hoje.getFullYear(), 11, 31);
        break;
      case 'personalizado':
        if (dataInicio && dataFim) {
          inicio = dataInicio;
          fim = dataFim;
        }
        break;
      default:
        break;
    }

    if (inicio && fim) {
      atendimentosFiltrados = atendimentosFiltrados.filter(a => {
        const dataAtendimento = new Date(a.data);
        return dataAtendimento >= inicio && dataAtendimento <= fim;
      });
    }

    // Calcular período anterior para comparação
    const diasPeriodo = differenceInDays(fim, inicio);
    const inicioAnterior = subDays(inicio, diasPeriodo);
    const fimAnterior = subDays(fim, diasPeriodo);
    
    const atendimentosAnteriores = atendimentos.filter(a => {
      const dataAtendimento = new Date(a.data);
      return dataAtendimento >= inicioAnterior && dataAtendimento <= fimAnterior;
    });

    // Calcular métricas do período atual
    const faturamento = atendimentosFiltrados.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
    const quantidade = atendimentosFiltrados.length;
    const clientesAtendidos = new Set(atendimentosFiltrados.map(a => a.clienteId)).size;
    const ticketMedio = quantidade > 0 ? faturamento / quantidade : 0;
    
    // Calcular satisfação
    const avaliacoesPeriodo = avaliacoes.filter(av => {
      const dataAv = new Date(av.data);
      return dataAv >= inicio && dataAv <= fim;
    });
    const satisfacaoMedia = avaliacoesPeriodo.length > 0
      ? avaliacoesPeriodo.reduce((acc, av) => acc + (av.nota || 0), 0) / avaliacoesPeriodo.length
      : 0;

    // Calcular métricas do período anterior
    const faturamentoAnterior = atendimentosAnteriores.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
    const quantidadeAnterior = atendimentosAnteriores.length;
    const clientesAtendidosAnterior = new Set(atendimentosAnteriores.map(a => a.clienteId)).size;
    const ticketMedioAnterior = quantidadeAnterior > 0 ? faturamentoAnterior / quantidadeAnterior : 0;

    // Calcular crescimento percentual
    const crescimentoFaturamento = faturamentoAnterior > 0 
      ? ((faturamento - faturamentoAnterior) / faturamentoAnterior) * 100 
      : 100;
    const crescimentoAtendimentos = quantidadeAnterior > 0 
      ? ((quantidade - quantidadeAnterior) / quantidadeAnterior) * 100 
      : 100;
    const crescimentoClientes = clientesAtendidosAnterior > 0 
      ? ((clientesAtendidos - clientesAtendidosAnterior) / clientesAtendidosAnterior) * 100 
      : 100;
    const crescimentoTicketMedio = ticketMedioAnterior > 0 
      ? ((ticketMedio - ticketMedioAnterior) / ticketMedioAnterior) * 100 
      : 100;

    // Calcular taxas
    const taxaConversao = (quantidade / (atendimentosFiltrados.length + atendimentosFiltrados.filter(a => a.status === 'cancelado').length)) * 100 || 0;
    const taxaRetencao = clientesAtendidosAnterior > 0 
      ? (clientesAtendidos / clientesAtendidosAnterior) * 100 
      : 100;

    // Calcular produtividade dos profissionais
    const produtividadeProfissionais = profissionais.map(prof => {
      const atendimentosProf = atendimentosFiltrados.filter(a => a.profissionalId === prof.id);
      const totalAtendimentos = atendimentosProf.length;
      const totalValor = atendimentosProf.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
      const tempoTotal = atendimentosProf.reduce((acc, a) => {
        if (a.horaInicio && a.horaFim) {
          const minutos = differenceInMinutes(parseISO(`2000-01-01T${a.horaFim}`), parseISO(`2000-01-01T${a.horaInicio}`));
          return acc + minutos;
        }
        return acc;
      }, 0);
      
      return {
        ...prof,
        atendimentos: totalAtendimentos,
        faturamento: totalValor,
        ticketMedio: totalAtendimentos > 0 ? totalValor / totalAtendimentos : 0,
        tempoMedio: totalAtendimentos > 0 ? tempoTotal / totalAtendimentos : 0,
        produtividade: tempoTotal > 0 ? (totalValor / tempoTotal) * 60 : 0, // Valor por hora
      };
    });

    // Gerar dados históricos para gráficos
    const diasIntervalo = eachDayOfInterval({ start: inicio, end: fim });
    const historico = diasIntervalo.map(dia => {
      const atendimentosDia = atendimentosFiltrados.filter(a => 
        isSameDay(parseISO(a.data), dia)
      );
      
      const faturamentoDia = atendimentosDia.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
      const avaliacoesDia = avaliacoesPeriodo.filter(av => 
        isSameDay(parseISO(av.data), dia)
      );
      const satisfacaoDia = avaliacoesDia.length > 0
        ? avaliacoesDia.reduce((acc, av) => acc + (av.nota || 0), 0) / avaliacoesDia.length
        : null;

      return {
        data: format(dia, 'dd/MM'),
        faturamento: faturamentoDia,
        atendimentos: atendimentosDia.length,
        clientes: new Set(atendimentosDia.map(a => a.clienteId)).size,
        satisfacao: satisfacaoDia,
        ticketMedio: atendimentosDia.length > 0 ? faturamentoDia / atendimentosDia.length : 0,
      };
    });

    // Gerar ranking baseado no tipo selecionado
    let ranking = [];
    switch (tipoRanking) {
      case 'profissionais':
        ranking = produtividadeProfissionais
          .filter(p => p.atendimentos > 0)
          .sort((a, b) => {
            switch (metricaSelecionada) {
              case 'faturamento': return b.faturamento - a.faturamento;
              case 'atendimentos': return b.atendimentos - a.atendimentos;
              case 'ticketMedio': return b.ticketMedio - a.ticketMedio;
              case 'produtividade': return b.produtividade - a.produtividade;
              default: return b.faturamento - a.faturamento;
            }
          })
          .slice(0, 10);
        break;

      case 'servicos':
        const servicosMap = new Map();
        atendimentosFiltrados.forEach(atendimento => {
          (atendimento.servicos || []).forEach(servicoId => {
            const servico = servicos.find(s => s.id === servicoId);
            if (servico) {
              const atual = servicosMap.get(servicoId) || {
                ...servico,
                quantidade: 0,
                faturamento: 0,
              };
              atual.quantidade += 1;
              atual.faturamento += servico.preco || 0;
              servicosMap.set(servicoId, atual);
            }
          });
        });
        ranking = Array.from(servicosMap.values())
          .sort((a, b) => {
            switch (metricaSelecionada) {
              case 'faturamento': return b.faturamento - a.faturamento;
              case 'atendimentos': return b.quantidade - a.quantidade;
              default: return b.faturamento - a.faturamento;
            }
          })
          .slice(0, 10);
        break;

      case 'clientes':
        const clientesMap = new Map();
        atendimentosFiltrados.forEach(atendimento => {
          const cliente = clientes.find(c => c.id === atendimento.clienteId);
          if (cliente) {
            const atual = clientesMap.get(atendimento.clienteId) || {
              ...cliente,
              atendimentos: 0,
              gastoTotal: 0,
              ultimaVisita: null,
            };
            atual.atendimentos += 1;
            atual.gastoTotal += atendimento.valorTotal || 0;
            const dataAtendimento = new Date(atendimento.data);
            if (!atual.ultimaVisita || dataAtendimento > new Date(atual.ultimaVisita)) {
              atual.ultimaVisita = atendimento.data;
            }
            clientesMap.set(atendimento.clienteId, atual);
          }
        });
        ranking = Array.from(clientesMap.values())
          .sort((a, b) => {
            switch (metricaSelecionada) {
              case 'faturamento': return b.gastoTotal - a.gastoTotal;
              case 'atendimentos': return b.atendimentos - a.atendimentos;
              case 'ticketMedio': return (b.gastoTotal / b.atendimentos) - (a.gastoTotal / a.atendimentos);
              default: return b.gastoTotal - a.gastoTotal;
            }
          })
          .slice(0, 10);
        break;

      case 'produtos':
        const produtosMap = new Map();
        atendimentosFiltrados.forEach(atendimento => {
          (atendimento.produtos || []).forEach(item => {
            const produto = produtos.find(p => p.id === item.produtoId);
            if (produto) {
              const atual = produtosMap.get(item.produtoId) || {
                ...produto,
                quantidade: 0,
                faturamento: 0,
              };
              atual.quantidade += item.quantidade || 1;
              atual.faturamento += (item.preco || 0) * (item.quantidade || 1);
              produtosMap.set(item.produtoId, atual);
            }
          });
        });
        ranking = Array.from(produtosMap.values())
          .sort((a, b) => {
            switch (metricaSelecionada) {
              case 'faturamento': return b.faturamento - a.faturamento;
              case 'atendimentos': return b.quantidade - a.quantidade;
              default: return b.faturamento - a.faturamento;
            }
          })
          .slice(0, 10);
        break;

      default:
        break;
    }

    // Calcular tendências
    const tendencias = [];
    const ultimos7Dias = historico.slice(-7);
    const media7Dias = ultimos7Dias.reduce((acc, dia) => acc + dia.faturamento, 0) / 7;
    const tendenciaFaturamento = historico.length > 1
      ? ((historico[historico.length - 1].faturamento - historico[0].faturamento) / historico[0].faturamento) * 100
      : 0;

    // Gerar KPIs
    const kpis = [
      {
        titulo: 'Faturamento',
        valor: `R$ ${faturamento.toFixed(2)}`,
        variacao: crescimentoFaturamento,
        periodo: 'vs período anterior',
        icone: <MoneyIcon />,
        cor: '#4caf50',
      },
      {
        titulo: 'Atendimentos',
        valor: quantidade,
        variacao: crescimentoAtendimentos,
        periodo: 'vs período anterior',
        icone: <AssignmentIcon />,
        cor: '#2196f3',
      },
      {
        titulo: 'Clientes Atendidos',
        valor: clientesAtendidos,
        variacao: crescimentoClientes,
        periodo: 'vs período anterior',
        icone: <PersonIcon />,
        cor: '#ff9800',
      },
      {
        titulo: 'Ticket Médio',
        valor: `R$ ${ticketMedio.toFixed(2)}`,
        variacao: crescimentoTicketMedio,
        periodo: 'vs período anterior',
        icone: <MoneyIcon />,
        cor: '#9c27b0',
      },
      {
        titulo: 'Taxa de Conversão',
        valor: `${taxaConversao.toFixed(1)}%`,
        variacao: 0,
        periodo: 'média do período',
        icone: <TrendingUpIcon />,
        cor: '#00bcd4',
      },
      {
        titulo: 'Satisfação',
        valor: satisfacaoMedia.toFixed(1),
        variacao: 0,
        periodo: `de ${avaliacoesPeriodo.length} avaliações`,
        icone: <StarIcon />,
        cor: '#ff4081',
      },
    ];

    // Calcular metas vs realizado
    const metasComparacao = {
      faturamento: {
        meta: metas.faturamento,
        realizado: faturamento,
        percentual: (faturamento / metas.faturamento) * 100,
      },
      atendimentos: {
        meta: metas.atendimentos,
        realizado: quantidade,
        percentual: (quantidade / metas.atendimentos) * 100,
      },
      clientes: {
        meta: metas.clientes,
        realizado: clientesAtendidos,
        percentual: (clientesAtendidos / metas.clientes) * 100,
      },
      ticketMedio: {
        meta: metas.ticketMedio,
        realizado: ticketMedio,
        percentual: (ticketMedio / metas.ticketMedio) * 100,
      },
      satisfacao: {
        meta: metas.satisfacao,
        realizado: satisfacaoMedia,
        percentual: (satisfacaoMedia / metas.satisfacao) * 100,
      },
    };

    // Gerar dados de satisfação por período
    const satisfacaoPorDia = historico
      .filter(d => d.satisfacao !== null)
      .map(d => ({
        data: d.data,
        satisfacao: d.satisfacao,
      }));

    // Calcular projeções
    const projecoes = {
      faturamentoMensal: faturamento * (30 / diasPeriodo),
      atendimentosMensais: quantidade * (30 / diasPeriodo),
      tendencia30dias: tendenciaFaturamento,
    };

    setDadosProcessados({
      performanceGeral: {
        faturamento,
        quantidade,
        clientesAtendidos,
        ticketMedio,
        satisfacaoMedia,
        taxaConversao,
        taxaRetencao,
      },
      historico,
      ranking,
      comparativo: {
        atual: { faturamento, quantidade, clientesAtendidos, ticketMedio },
        anterior: { faturamento: faturamentoAnterior, quantidade: quantidadeAnterior, clientesAtendidos: clientesAtendidosAnterior, ticketMedio: ticketMedioAnterior },
        variacao: {
          faturamento: crescimentoFaturamento,
          quantidade: crescimentoAtendimentos,
          clientes: crescimentoClientes,
          ticketMedio: crescimentoTicketMedio,
        },
      },
      tendencias: {
        media7Dias,
        tendenciaFaturamento,
        projecoes,
      },
      kpis,
      metasComparacao,
      satisfacao: satisfacaoPorDia,
      produtividade: produtividadeProfissionais,
    });
  };

  const handleRefresh = () => {
    carregarDados();
    toast.success('Dados atualizados com sucesso!');
  };

  const handleExportar = () => {
    try {
      const dadosExport = {
        periodo: periodos.find(p => p.value === periodo)?.label,
        dataExportacao: new Date().toISOString(),
        performance: dadosProcessados.performanceGeral,
        ranking: dadosProcessados.ranking,
        historico: dadosProcessados.historico,
        kpis: dadosProcessados.kpis,
      };

      const blob = new Blob([JSON.stringify(dadosExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: 'Dados exportados com sucesso!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao exportar dados',
        severity: 'error',
      });
    }
  };

  const handleSalvarMetas = () => {
    // Aqui você pode implementar a lógica para salvar as metas no backend
    setOpenMetasDialog(false);
    setSnackbar({
      open: true,
      message: 'Metas salvas com sucesso!',
      severity: 'success',
    });
  };

  const getVariacaoCor = (variacao) => {
    if (variacao > 0) return '#4caf50';
    if (variacao < 0) return '#f44336';
    return '#ff9800';
  };

  const getVariacaoIcone = (variacao) => {
    if (variacao > 0) return <TrendingUpIcon />;
    if (variacao < 0) return <TrendingDownIcon />;
    return <ShowChartIcon />;
  };

  const formatarValor = (valor, tipo) => {
    if (tipo === 'moeda') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }
    if (tipo === 'percentual') {
      return `${valor.toFixed(1)}%`;
    }
    if (tipo === 'numero') {
      return valor.toFixed(0);
    }
    return valor;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header com título e ações */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Performance e Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Definir Metas">
            <IconButton onClick={() => setOpenMetasDialog(true)} color="primary">
              <TrophyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar Dados">
            <IconButton onClick={handleExportar} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Atualizar">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
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
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Início"
                    value={dataInicio}
                    onChange={setDataInicio}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Fim"
                    value={dataFim}
                    onChange={setDataFim}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            </>
          )}
          
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Métrica</InputLabel>
              <Select
                value={metricaSelecionada}
                label="Métrica"
                onChange={(e) => setMetricaSelecionada(e.target.value)}
              >
                {metricasDisponiveis.map(m => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Comparação</InputLabel>
              <Select
                value={comparacao}
                label="Comparação"
                onChange={(e) => setComparacao(e.target.value)}
              >
                {periodosComparacao.map(p => (
                  <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={() => processarDados()}
            >
              Aplicar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* KPIs Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {dadosProcessados.kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(kpi.cor, 0.1), color: kpi.cor, mr: 1 }}>
                      {kpi.icone}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {kpi.titulo}
                    </Typography>
                  </Box>
                  <Typography variant="h5" component="div" gutterBottom>
                    {kpi.valor}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      size="small"
                      icon={getVariacaoIcone(kpi.variacao)}
                      label={`${kpi.variacao > 0 ? '+' : ''}${kpi.variacao.toFixed(1)}%`}
                      sx={{
                        bgcolor: alpha(getVariacaoCor(kpi.variacao), 0.1),
                        color: getVariacaoCor(kpi.variacao),
                        mr: 1,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {kpi.periodo}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Gráficos principais */}
      <Grid container spacing={3}>
        {/* Gráfico de linha - Evolução */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evolução de {metricasDisponiveis.find(m => m.value === metricaSelecionada)?.label}
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosProcessados.historico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={metricaSelecionada}
                      stroke={metricasDisponiveis.find(m => m.value === metricaSelecionada)?.cor || '#8884d8'}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Metas vs Realizado */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Metas vs Realizado
              </Typography>
              <Box sx={{ height: 300, overflowY: 'auto' }}>
                {Object.entries(dadosProcessados.metasComparacao || {}).map(([key, value]) => {
                  const metrica = metricasDisponiveis.find(m => m.value === key);
                  return (
                    <Box key={key} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {metrica?.label || key}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatarValor(value.realizado, key === 'faturamento' || key === 'ticketMedio' ? 'moeda' : 'numero')} / {formatarValor(value.meta, key === 'faturamento' || key === 'ticketMedio' ? 'moeda' : 'numero')}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(value.percentual, 100)}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: alpha(metrica?.cor || '#000', 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: value.percentual >= 100 ? '#4caf50' : metrica?.cor,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                        {value.percentual.toFixed(1)}% atingido
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ranking */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Ranking de {tiposRanking.find(t => t.value === tipoRanking)?.label}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={tipoRanking}
                    label="Tipo"
                    onChange={(e) => setTipoRanking(e.target.value)}
                  >
                    {tiposRanking.map(t => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Pos</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell align="right">{metricasDisponiveis.find(m => m.value === metricaSelecionada)?.label}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dadosProcessados.ranking.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: index < 3 ? CORES_RANKING[index] : alpha('#000', 0.1),
                              color: index < 3 ? '#000' : 'text.secondary',
                              fontSize: '0.875rem',
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {item.nome || item.descricao || item.nomeCompleto}
                            {index === 0 && <TrophyIcon sx={{ ml: 1, color: '#FFD700', fontSize: 16 }} />}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {metricaSelecionada === 'faturamento'
                            ? formatarValor(item.faturamento || item.gastoTotal || item.preco, 'moeda')
                            : metricaSelecionada === 'atendimentos'
                            ? item.atendimentos || item.quantidade
                            : metricaSelecionada === 'ticketMedio'
                            ? formatarValor(item.ticketMedio || (item.gastoTotal / item.atendimentos), 'moeda')
                            : formatarValor(item[metricaSelecionada], 'numero')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribuição de Satisfação */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Satisfação dos Clientes
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosProcessados.satisfacao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis domain={[0, 5]} />
                    <RechartsTooltip />
                    <Bar dataKey="satisfacao" fill="#ff4081" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Produtividade por Profissional */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Produtividade dos Profissionais
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dadosProcessados.produtividade}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="faturamento" fill="#4caf50" name="Faturamento" />
                    <Line yAxisId="right" type="monotone" dataKey="atendimentos" stroke="#2196f3" name="Atendimentos" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Análise de Tendências */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Análise de Tendências
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: alpha('#2196f3', 0.05) }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Média últimos 7 dias
                    </Typography>
                    <Typography variant="h4">
                      {formatarValor(dadosProcessados.tendencias?.media7Dias || 0, 'moeda')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Faturamento médio diário
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: alpha('#ff9800', 0.05) }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tendência 30 dias
                    </Typography>
                    <Typography variant="h4" sx={{ color: getVariacaoCor(dadosProcessados.tendencias?.tendenciaFaturamento || 0) }}>
                      {dadosProcessados.tendencias?.tendenciaFaturamento > 0 ? '+' : ''}
                      {dadosProcessados.tendencias?.tendenciaFaturamento.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Variação no período
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: alpha('#4caf50', 0.05) }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Projeção mensal
                    </Typography>
                    <Typography variant="h4">
                      {formatarValor(dadosProcessados.tendencias?.projecoes?.faturamentoMensal || 0, 'moeda')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Baseado no período atual
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de Metas */}
      <Dialog open={openMetasDialog} onClose={() => setOpenMetasDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrophyIcon sx={{ mr: 1 }} />
            Definir Metas
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta de Faturamento"
                type="number"
                value={metas.faturamento}
                onChange={(e) => setMetas({ ...metas, faturamento: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta de Atendimentos"
                type="number"
                value={metas.atendimentos}
                onChange={(e) => setMetas({ ...metas, atendimentos: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta de Clientes Atendidos"
                type="number"
                value={metas.clientes}
                onChange={(e) => setMetas({ ...metas, clientes: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta de Ticket Médio"
                type="number"
                value={metas.ticketMedio}
                onChange={(e) => setMetas({ ...metas, ticketMedio: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta de Satisfação"
                type="number"
                value={metas.satisfacao}
                onChange={(e) => setMetas({ ...metas, satisfacao: Number(e.target.value) })}
                inputProps={{ step: 0.1, min: 0, max: 5 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMetasDialog(false)}>Cancelar</Button>
          <Button onClick={handleSalvarMetas} variant="contained" color="primary">
            Salvar Metas
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Performance;
