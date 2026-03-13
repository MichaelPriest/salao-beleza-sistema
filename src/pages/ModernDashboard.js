// src/pages/ModernDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  TextField,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  CalendarToday,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  Print,
  Download,
  MoreVert,
  Schedule,
  CheckCircle,
  Cancel,
  Warning,
  Event,
  Timer,
  Person,
  Receipt,
  ShoppingBag,
  Percent,
  Star,
  WarningAmber,
  TrendingDown,
  TrendingFlat,
  Today,
  DateRange,
  Assessment,
  PieChart as PieChartIcon,
  ShowChart,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
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
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  Legend,
} from 'recharts';
import { useFirebase } from '../hooks/useFirebase';
import { Timestamp } from 'firebase/firestore';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const COLORS = [
  '#9c27b0', '#ff4081', '#7b1fa2', '#ba68c8', 
  '#f44336', '#2196f3', '#4caf50', '#ff9800',
  '#00bcd4', '#795548', '#607d8b', '#e91e63'
];

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente', icon: <Warning /> },
  confirmado: { color: '#4caf50', label: 'Confirmado', icon: <CheckCircle /> },
  cancelado: { color: '#f44336', label: 'Cancelado', icon: <Cancel /> },
  finalizado: { color: '#9e9e9e', label: 'Finalizado', icon: <CheckCircle /> },
  em_andamento: { color: '#9c27b0', label: 'Em Andamento', icon: <Timer /> },
};

const StatCard = ({ icon, title, value, trend, trendValue, color, loading, subtitle, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
    transition={{ duration: 0.3 }}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default', height: '100%' }}
  >
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}20, ${color}05)`,
          zIndex: 0,
        }}
      />
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
                {icon}
              </Avatar>
              {trend !== undefined && (
                <Tooltip title={`${trend > 0 ? 'Aumento' : trend < 0 ? 'Queda' : 'Estável'} de ${Math.abs(trend).toFixed(1)}% em relação ao período anterior`}>
                  <Chip
                    icon={
                      trend > 0 ? <ArrowUpward /> : 
                      trend < 0 ? <ArrowDownward /> : 
                      <TrendingFlat />
                    }
                    label={`${Math.abs(trend).toFixed(1)}%`}
                    color={trend > 0 ? 'success' : trend < 0 ? 'error' : 'default'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Tooltip>
              )}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const AppointmentCard = ({ appointment, client, service, professional }) => {
  const statusInfo = statusColors[appointment.status] || { color: '#9e9e9e', label: appointment.status, icon: <Warning /> };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card variant="outlined" sx={{ 
        mb: 1,
        borderLeft: 4,
        borderLeftColor: statusInfo.color,
        '&:hover': { bgcolor: '#faf5ff' }
      }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: statusInfo.color, width: 40, height: 40 }}>
              {statusInfo.icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {appointment.horario}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {client?.nome || 'Cliente'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  label={service?.nome || 'Serviço'}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
                <Chip
                  label={professional?.nome || 'Profissional'}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
            <Chip
              label={statusInfo.label}
              size="small"
              sx={{
                bgcolor: `${statusInfo.color}20`,
                color: statusInfo.color,
                fontWeight: 500,
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function ModernDashboard() {
  const [stats, setStats] = useState({
    faturamentoMensal: 0,
    faturamentoHoje: 0,
    totalClientes: 0,
    clientesNovosMes: 0,
    taxaOcupacao: 0,
    agendamentosHoje: 0,
    agendamentosConfirmados: 0,
    agendamentosPendentes: 0,
    agendamentosCancelados: 0,
    ticketMedio: 0,
    servicosRealizadosMes: 0,
    produtosVendidosMes: 0,
    comissoesPendentes: 0,
    comissoesPagas: 0,
  });

  const [trends, setTrends] = useState({
    faturamento: 0,
    clientes: 0,
    ocupacao: 0,
    agendamentos: 0,
    ticketMedio: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [professionalsData, setProfessionalsData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // 'day', 'week', 'month', 'year', 'custom'
  const [customDateRange, setCustomDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Hooks do Firebase
  const { data: agendamentos, loading: loadingAgendamentos } = useFirebase('agendamentos');
  const { data: atendimentos, loading: loadingAtendimentos } = useFirebase('atendimentos');
  const { data: clientes, loading: loadingClientes } = useFirebase('clientes');
  const { data: profissionais, loading: loadingProfissionais } = useFirebase('profissionais');
  const { data: servicos, loading: loadingServicos } = useFirebase('servicos');
  const { data: pagamentos, loading: loadingPagamentos } = useFirebase('pagamentos');
  const { data: comissoes, loading: loadingComissoes } = useFirebase('comissoes');
  const { data: produtos, loading: loadingProdutos } = useFirebase('produtos');

  useEffect(() => {
    if (!loadingAgendamentos && !loadingAtendimentos && !loadingClientes && 
        !loadingProfissionais && !loadingServicos && !loadingPagamentos && 
        !loadingComissoes && !loadingProdutos) {
      calcularDados();
      setLoading(false);
    }
  }, [loadingAgendamentos, loadingAtendimentos, loadingClientes, loadingProfissionais, 
      loadingServicos, loadingPagamentos, loadingComissoes, loadingProdutos, period, customDateRange]);

  const getDateRange = () => {
    const hoje = new Date();
    let start, end;

    switch(period) {
      case 'day':
        start = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        end = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
        break;
      case 'week':
        start = subDays(hoje, 7);
        end = hoje;
        break;
      case 'month':
        start = startOfMonth(hoje);
        end = endOfMonth(hoje);
        break;
      case 'year':
        start = startOfYear(hoje);
        end = endOfYear(hoje);
        break;
      case 'custom':
        start = customDateRange.start;
        end = customDateRange.end;
        break;
      default:
        start = startOfMonth(hoje);
        end = endOfMonth(hoje);
    }

    return { start, end };
  };

  const calcularDados = () => {
    const { start, end } = getDateRange();
    const hoje = new Date();
    
    // Calcular período anterior (mesma duração)
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const periodoAnteriorStart = subDays(start, diffDays);
    const periodoAnteriorEnd = subDays(end, diffDays);

    // ============================================
    // FATURAMENTO
    // ============================================
    const pagamentosPeriodo = (pagamentos || []).filter(p => {
      const dataPagamento = p.data?.toDate ? p.data.toDate() : new Date(p.data);
      return dataPagamento >= start && dataPagamento <= end;
    });

    const faturamento = pagamentosPeriodo.reduce((acc, p) => acc + (p.valor || 0), 0);

    // Faturamento hoje
    const pagamentosHoje = (pagamentos || []).filter(p => {
      const dataPagamento = p.data?.toDate ? p.data.toDate() : new Date(p.data);
      return dataPagamento.toDateString() === hoje.toDateString();
    });
    const faturamentoHoje = pagamentosHoje.reduce((acc, p) => acc + (p.valor || 0), 0);

    // Faturamento período anterior
    const pagamentosPeriodoAnterior = (pagamentos || []).filter(p => {
      const dataPagamento = p.data?.toDate ? p.data.toDate() : new Date(p.data);
      return dataPagamento >= periodoAnteriorStart && dataPagamento <= periodoAnteriorEnd;
    });

    const faturamentoAnterior = pagamentosPeriodoAnterior.reduce((acc, p) => acc + (p.valor || 0), 0);

    // ============================================
    // CLIENTES
    // ============================================
    const totalClientes = (clientes || []).length;

    const clientesNovosPeriodo = (clientes || []).filter(c => {
      const dataCadastro = c.dataCadastro ? new Date(c.dataCadastro) : (c.createdAt?.toDate ? c.createdAt.toDate() : null);
      return dataCadastro && dataCadastro >= start && dataCadastro <= end;
    }).length;

    const clientesNovosPeriodoAnterior = (clientes || []).filter(c => {
      const dataCadastro = c.dataCadastro ? new Date(c.dataCadastro) : (c.createdAt?.toDate ? c.createdAt.toDate() : null);
      return dataCadastro && dataCadastro >= periodoAnteriorStart && dataCadastro <= periodoAnteriorEnd;
    }).length;

    // ============================================
    // AGENDAMENTOS
    // ============================================
    const agendamentosPeriodo = (agendamentos || []).filter(a => {
      return a.data >= format(start, 'yyyy-MM-dd') && a.data <= format(end, 'yyyy-MM-dd');
    });

    const agendamentosPeriodoAnterior = (agendamentos || []).filter(a => {
      return a.data >= format(periodoAnteriorStart, 'yyyy-MM-dd') && a.data <= format(periodoAnteriorEnd, 'yyyy-MM-dd');
    });

    const agendamentosHoje = (agendamentos || []).filter(a => a.data === format(hoje, 'yyyy-MM-dd'));
    
    const agendamentosConfirmados = agendamentosHoje.filter(a => a.status === 'confirmado').length;
    const agendamentosPendentes = agendamentosHoje.filter(a => a.status === 'pendente').length;
    const agendamentosCancelados = agendamentosHoje.filter(a => a.status === 'cancelado').length;

    // Taxa de ocupação
    const totalHorarios = 12; // 12 horários por dia (9h-20h)
    const agendamentosHojeNaoCancelados = agendamentosHoje.filter(a => a.status !== 'cancelado').length;
    const taxaOcupacao = Math.min(100, Math.round((agendamentosHojeNaoCancelados / totalHorarios) * 100));

    // ============================================
    // TICKET MÉDIO
    // ============================================
    const atendimentosPeriodo = (atendimentos || []).filter(a => {
      return a.data >= format(start, 'yyyy-MM-dd') && a.data <= format(end, 'yyyy-MM-dd');
    });

    const ticketMedio = atendimentosPeriodo.length > 0 
      ? faturamento / atendimentosPeriodo.length 
      : 0;

    const atendimentosPeriodoAnterior = (atendimentos || []).filter(a => {
      return a.data >= format(periodoAnteriorStart, 'yyyy-MM-dd') && a.data <= format(periodoAnteriorEnd, 'yyyy-MM-dd');
    });

    const ticketMedioAnterior = atendimentosPeriodoAnterior.length > 0 
      ? faturamentoAnterior / atendimentosPeriodoAnterior.length 
      : 0;

    // ============================================
    // SERVIÇOS E PRODUTOS
    // ============================================
    const servicosRealizadosMes = (atendimentos || []).filter(a => {
      return a.data >= format(start, 'yyyy-MM-dd') && a.data <= format(end, 'yyyy-MM-dd');
    }).length;

    // Produtos vendidos (itens de produto nos atendimentos)
    const produtosVendidosMes = (atendimentos || []).reduce((acc, a) => {
      if (a.data >= format(start, 'yyyy-MM-dd') && a.data <= format(end, 'yyyy-MM-dd')) {
        return acc + (a.itensProduto?.length || 0);
      }
      return acc;
    }, 0);

    // ============================================
    // COMISSÕES
    // ============================================
    const comissoesPeriodo = (comissoes || []).filter(c => {
      const dataComissao = c.dataRegistro ? new Date(c.dataRegistro) : (c.createdAt?.toDate ? c.createdAt.toDate() : null);
      return dataComissao && dataComissao >= start && dataComissao <= end;
    });

    const comissoesPendentes = comissoesPeriodo
      .filter(c => c.status === 'pendente')
      .reduce((acc, c) => acc + (c.valor || 0), 0);

    const comissoesPagas = comissoesPeriodo
      .filter(c => c.status === 'pago')
      .reduce((acc, c) => acc + (c.valor || 0), 0);

    // ============================================
    // TRENDS
    // ============================================
    const trendFaturamento = faturamentoAnterior > 0 
      ? ((faturamento - faturamentoAnterior) / faturamentoAnterior * 100) 
      : 0;

    const trendClientes = clientesNovosPeriodoAnterior > 0
      ? ((clientesNovosPeriodo - clientesNovosPeriodoAnterior) / clientesNovosPeriodoAnterior * 100)
      : clientesNovosPeriodo > 0 ? 100 : 0;

    const trendAgendamentos = agendamentosPeriodoAnterior.length > 0
      ? ((agendamentosPeriodo.length - agendamentosPeriodoAnterior.length) / agendamentosPeriodoAnterior.length * 100)
      : 0;

    const trendTicketMedio = ticketMedioAnterior > 0
      ? ((ticketMedio - ticketMedioAnterior) / ticketMedioAnterior * 100)
      : 0;

    setStats({
      faturamentoMensal: faturamento,
      faturamentoHoje,
      totalClientes,
      clientesNovosMes: clientesNovosPeriodo,
      taxaOcupacao,
      agendamentosHoje: agendamentosHoje.length,
      agendamentosConfirmados,
      agendamentosPendentes,
      agendamentosCancelados,
      ticketMedio,
      servicosRealizadosMes,
      produtosVendidosMes,
      comissoesPendentes,
      comissoesPagas,
    });

    setTrends({
      faturamento: trendFaturamento,
      clientes: trendClientes,
      ocupacao: 0, // Não temos dado anterior
      agendamentos: trendAgendamentos,
      ticketMedio: trendTicketMedio,
    });

    // ============================================
    // DADOS PARA GRÁFICOS
    // ============================================

    // Receita por período
    const revenueByPeriod = [];
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 31) {
      // Últimos 30 dias - mostrar por dia
      for (let i = 0; i <= daysDiff; i++) {
        const data = new Date(start);
        data.setDate(data.getDate() + i);
        const dataStr = format(data, 'yyyy-MM-dd');
        
        const pagamentosDia = (pagamentos || []).filter(p => {
          const dataPagamento = p.data?.toDate ? p.data.toDate() : new Date(p.data);
          return format(dataPagamento, 'yyyy-MM-dd') === dataStr;
        });
        
        const total = pagamentosDia.reduce((acc, p) => acc + (p.valor || 0), 0);
        
        revenueByPeriod.push({
          name: format(data, 'dd/MM'),
          valor: total,
          dia: data.getDate(),
        });
      }
    } else {
      // Mais de 30 dias - agrupar por mês
      const mesesMap = {};
      for (let i = 0; i <= daysDiff; i++) {
        const data = new Date(start);
        data.setDate(data.getDate() + i);
        const mesKey = format(data, 'MMM/yyyy');
        
        if (!mesesMap[mesKey]) {
          mesesMap[mesKey] = 0;
        }
        
        const pagamentosDia = (pagamentos || []).filter(p => {
          const dataPagamento = p.data?.toDate ? p.data.toDate() : new Date(p.data);
          return format(dataPagamento, 'yyyy-MM-dd') === format(data, 'yyyy-MM-dd');
        });
        
        mesesMap[mesKey] += pagamentosDia.reduce((acc, p) => acc + (p.valor || 0), 0);
      }
      
      Object.entries(mesesMap).forEach(([name, valor]) => {
        revenueByPeriod.push({ name, valor });
      });
    }
    
    setRevenueData(revenueByPeriod);

    // Distribuição de serviços
    const servicosCount = {};
    (atendimentos || []).forEach(a => {
      if (a.servicos) {
        a.servicos.forEach(s => {
          servicosCount[s.nome] = (servicosCount[s.nome] || 0) + 1;
        });
      } else if (a.servicoId) {
        const servico = (servicos || []).find(s => s.id === a.servicoId);
        if (servico) {
          servicosCount[servico.nome] = (servicosCount[servico.nome] || 0) + 1;
        }
      }
    });
    
    const servicesDist = Object.entries(servicosCount)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    
    setServicesData(servicesDist);

    // Performance por profissional
    const profPerformance = {};
    (atendimentos || []).forEach(a => {
      if (a.profissionalId) {
        if (!profPerformance[a.profissionalId]) {
          profPerformance[a.profissionalId] = {
            id: a.profissionalId,
            nome: profissionais?.find(p => p.id === a.profissionalId)?.nome || 'Profissional',
            atendimentos: 0,
            valor: 0,
          };
        }
        profPerformance[a.profissionalId].atendimentos++;
        
        // Buscar pagamentos relacionados a este atendimento
        const pagamentosAtendimento = (pagamentos || []).filter(p => p.atendimentoId === a.id);
        const total = pagamentosAtendimento.reduce((acc, p) => acc + (p.valor || 0), 0);
        profPerformance[a.profissionalId].valor += total;
      }
    });
    
    setProfessionalsData(Object.values(profPerformance).sort((a, b) => b.valor - a.valor).slice(0, 5));

    // Dados diários para gráfico de calor
    const dailyMap = {};
    for (let i = 0; i < 7; i++) {
      const data = subDays(hoje, i);
      const dataStr = format(data, 'yyyy-MM-dd');
      const diaSemana = format(data, 'EEE', { locale: ptBR });
      
      const agendamentosDia = (agendamentos || []).filter(a => a.data === dataStr && a.status !== 'cancelado');
      
      dailyMap[diaSemana] = (dailyMap[diaSemana] || 0) + agendamentosDia.length;
    }
    
    setDailyData(Object.entries(dailyMap).map(([name, value]) => ({ name, value })));

    // Top clientes
    const clientSpending = {};
    (pagamentos || []).forEach(p => {
      if (p.clienteId) {
        if (!clientSpending[p.clienteId]) {
          clientSpending[p.clienteId] = {
            id: p.clienteId,
            nome: clientes?.find(c => c.id === p.clienteId)?.nome || 'Cliente',
            total: 0,
            visitas: 0,
          };
        }
        clientSpending[p.clienteId].total += p.valor || 0;
        clientSpending[p.clienteId].visitas++;
      }
    });
    
    setTopClients(Object.values(clientSpending).sort((a, b) => b.total - a.total).slice(0, 5));

    // Agenda de hoje
    const hojeStr = format(hoje, 'yyyy-MM-dd');
    const hojeAppointments = (agendamentos || [])
      .filter(a => a.data === hojeStr)
      .sort((a, b) => a.horario.localeCompare(b.horario));
      
    setAppointments(hojeAppointments);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      calcularDados();
      setLoading(false);
    }, 500);
  };

  const handleExport = () => {
    // Implementar exportação de relatório
    alert('Exportando relatório...');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarNumero = (valor) => {
    return new Intl.NumberFormat('pt-BR').format(valor || 0);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visão geral do seu negócio
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Tooltip title="Período">
            <Button
              variant="outlined"
              startIcon={<DateRange />}
              onClick={handleMenuOpen}
            >
              {period === 'day' && 'Hoje'}
              {period === 'week' && 'Últimos 7 dias'}
              {period === 'month' && 'Este mês'}
              {period === 'year' && 'Este ano'}
              {period === 'custom' && 'Personalizado'}
            </Button>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handlePeriodChange('day'); handleMenuClose(); }}>
              <Today sx={{ mr: 1, fontSize: 20 }} /> Hoje
            </MenuItem>
            <MenuItem onClick={() => { handlePeriodChange('week'); handleMenuClose(); }}>
              <DateRange sx={{ mr: 1, fontSize: 20 }} /> Últimos 7 dias
            </MenuItem>
            <MenuItem onClick={() => { handlePeriodChange('month'); handleMenuClose(); }}>
              <Event sx={{ mr: 1, fontSize: 20 }} /> Este mês
            </MenuItem>
            <MenuItem onClick={() => { handlePeriodChange('year'); handleMenuClose(); }}>
              <CalendarToday sx={{ mr: 1, fontSize: 20 }} /> Este ano
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handlePeriodChange('custom'); handleMenuClose(); }}>
              Personalizado
            </MenuItem>
          </Menu>

          {period === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <DatePicker
                  label="De"
                  value={customDateRange.start}
                  onChange={(newValue) => setCustomDateRange({ ...customDateRange, start: newValue })}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                <DatePicker
                  label="Até"
                  value={customDateRange.end}
                  onChange={(newValue) => setCustomDateRange({ ...customDateRange, end: newValue })}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
              </Box>
            </LocalizationProvider>
          )}

          <Tooltip title="Atualizar">
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Imprimir">
            <IconButton onClick={handlePrint}>
              <Print />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Exportar">
            <IconButton onClick={handleExport}>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AttachMoney />}
            title="Faturamento no Período"
            value={formatarMoeda(stats.faturamentoMensal)}
            trend={trends.faturamento}
            trendValue={Math.abs(trends.faturamento).toFixed(1)}
            color="#9c27b0"
            subtitle={`Hoje: ${formatarMoeda(stats.faturamentoHoje)}`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<People />}
            title="Total de Clientes"
            value={formatarNumero(stats.totalClientes)}
            trend={trends.clientes}
            trendValue={Math.abs(trends.clientes).toFixed(1)}
            color="#ff4081"
            subtitle={`+${stats.clientesNovosMes} neste período`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Taxa de Ocupação"
            value={`${stats.taxaOcupacao}%`}
            color="#7b1fa2"
            subtitle={`${stats.agendamentosHoje} agendamentos hoje`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Receipt />}
            title="Ticket Médio"
            value={formatarMoeda(stats.ticketMedio)}
            trend={trends.ticketMedio}
            trendValue={Math.abs(trends.ticketMedio).toFixed(1)}
            color="#ba68c8"
          />
        </Grid>
      </Grid>

      {/* Cards Secundários */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Agendamentos Hoje
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {stats.agendamentosHoje}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip size="small" label={`${stats.agendamentosConfirmados} confirmados`} color="success" sx={{ height: 20 }} />
                <Chip size="small" label={`${stats.agendamentosPendentes} pendentes`} color="warning" sx={{ height: 20 }} />
                <Chip size="small" label={`${stats.agendamentosCancelados} cancelados`} color="error" sx={{ height: 20 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Serviços Realizados
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {formatarNumero(stats.servicosRealizadosMes)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                no período
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Produtos Vendidos
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {formatarNumero(stats.produtosVendidosMes)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                itens no período
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#e1f5fe' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Comissões Pendentes
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                {formatarMoeda(stats.comissoesPendentes)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Pagas: {formatarMoeda(stats.comissoesPagas)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#fce4ec' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Ticket Médio
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff4081' }}>
                {formatarMoeda(stats.ticketMedio)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                por atendimento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de Receita */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Evolução da Receita
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Gráfico de Área">
                      <IconButton 
                        size="small" 
                        color={selectedMetric === 'revenue' ? 'primary' : 'default'}
                        onClick={() => setSelectedMetric('revenue')}
                      >
                        <ShowChart />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Gráfico de Barras">
                      <IconButton 
                        size="small"
                        color={selectedMetric === 'bar' ? 'primary' : 'default'}
                        onClick={() => setSelectedMetric('bar')}
                      >
                        <PieChartIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <ResponsiveContainer width="100%" height={300}>
                  {selectedMetric === 'revenue' ? (
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#9c27b0" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatarMoeda(value)} />
                      <RechartsTooltip formatter={(value) => formatarMoeda(value)} />
                      <Area 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#9c27b0" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  ) : (
                    <RechartsBarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatarMoeda(value)} />
                      <RechartsTooltip formatter={(value) => formatarMoeda(value)} />
                      <Bar dataKey="valor" fill="#9c27b0" />
                    </RechartsBarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Gráfico de Distribuição de Serviços */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Serviços Mais Realizados
                </Typography>
                {servicesData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={servicesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {servicesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ mt: 2, maxHeight: 150, overflow: 'auto' }}>
                      {servicesData.map((service, index) => (
                        <Box key={service.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: COLORS[index % COLORS.length],
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" sx={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {service.name}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {service.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                    Nenhum dado disponível
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Gráfico de Performance por Profissional */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Performance por Profissional
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Profissional</strong></TableCell>
                        <TableCell align="right"><strong>Atendimentos</strong></TableCell>
                        <TableCell align="right"><strong>Faturamento</strong></TableCell>
                        <TableCell align="right"><strong>%</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {professionalsData.map((prof, index) => (
                        <TableRow key={prof.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ bgcolor: COLORS[index % COLORS.length], width: 24, height: 24, fontSize: '0.75rem' }}>
                                {prof.nome?.charAt(0)}
                              </Avatar>
                              {prof.nome}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{prof.atendimentos}</TableCell>
                          <TableCell align="right">{formatarMoeda(prof.valor)}</TableCell>
                          <TableCell align="right">
                            {stats.faturamentoMensal > 0 
                              ? `${((prof.valor / stats.faturamentoMensal) * 100).toFixed(1)}%`
                              : '0%'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {professionalsData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                            Nenhum dado disponível
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Top Clientes */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Top Clientes
                </Typography>
                <List>
                  {topClients.map((client, index) => (
                    <ListItem key={client.id} divider={index < topClients.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                          {client.nome?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={client.nome}
                        secondary={`${client.visitas} visita${client.visitas !== 1 ? 's' : ''}`}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                          {formatarMoeda(client.total)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {topClients.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Nenhum dado disponível"
                        align="center"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Agenda do Dia */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Agenda de Hoje
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => window.location.href = '/agenda'}
                  >
                    Ver todos
                  </Button>
                </Box>
                
                {appointments.length > 0 ? (
                  <Grid container spacing={2}>
                    {appointments.slice(0, 4).map((apt) => {
                      const cliente = clientes?.find(c => c.id === apt.clienteId);
                      const servico = servicos?.find(s => s.id === apt.servicoId);
                      const profissional = profissionais?.find(p => p.id === apt.profissionalId);
                      
                      return (
                        <Grid item xs={12} sm={6} md={3} key={apt.id}>
                          <AppointmentCard
                            appointment={apt}
                            client={cliente}
                            service={servico}
                            professional={profissional}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                    Nenhum agendamento para hoje
                  </Typography>
                )}
                
                {appointments.length > 4 && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      +{appointments.length - 4} agendamentos não listados
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ModernDashboard;
