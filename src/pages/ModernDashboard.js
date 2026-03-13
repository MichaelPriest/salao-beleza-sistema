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
  EmojiEvents as TrophyIcon,
  CardGiftcard as GiftIcon,
  History as HistoryIcon,
  Spa as SpaIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowIcon,
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
import { usuariosService } from '../services/usuariosService';

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

// Componente de Card para estatísticas (adaptado para diferentes cargos)
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
                <Tooltip title={`${trend > 0 ? 'Aumento' : trend < 0 ? 'Queda' : 'Estável'} de ${Math.abs(trend).toFixed(1)}%`}>
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

// Card de agendamento para profissionais e atendentes
const AppointmentCard = ({ appointment, client, service }) => {
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

// Card de fidelidade para clientes
const FidelidadeCard = ({ saldo, nivel, pontosFaltantes, ultimosPontos }) => {
  const niveis = {
    bronze: { cor: '#cd7f32', nome: 'Bronze', proximo: 500 },
    prata: { cor: '#c0c0c0', nome: 'Prata', proximo: 2000 },
    ouro: { cor: '#ffd700', nome: 'Ouro', proximo: 5000 },
    platina: { cor: '#e5e4e2', nome: 'Platina', proximo: null },
  };

  const progresso = niveis[nivel].proximo 
    ? Math.min(100, (saldo / niveis[nivel].proximo) * 100)
    : 100;

  return (
    <Card sx={{ bgcolor: '#faf5ff', border: `2px solid ${niveis[nivel].cor}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: niveis[nivel].cor, width: 60, height: 60 }}>
            <TrophyIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
              {saldo}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Pontos acumulados
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Nível {nivel.toUpperCase()}
            </Typography>
            {niveis[nivel].proximo && (
              <Typography variant="body2" color="textSecondary">
                {pontosFaltantes} pts para {niveis[nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'platina'].nome}
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={progresso}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: niveis[nivel].cor,
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Últimos pontos
        </Typography>
        <List dense>
          {ultimosPontos.slice(0, 3).map((ponto, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: ponto.tipo === 'credito' ? '#4caf50' : '#f44336', width: 24, height: 24 }}>
                  {ponto.tipo === 'credito' ? '+' : '-'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={ponto.motivo}
                secondary={format(new Date(ponto.data), 'dd/MM/yyyy')}
                primaryTypographyProps={{ variant: 'body2' }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600, color: ponto.tipo === 'credito' ? '#4caf50' : '#f44336' }}>
                {ponto.tipo === 'credito' ? '+' : '-'}{ponto.quantidade}
              </Typography>
            </ListItem>
          ))}
        </List>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GiftIcon />}
          onClick={() => window.location.href = '/fidelidade/recompensas'}
          sx={{ mt: 1, borderColor: niveis[nivel].cor, color: niveis[nivel].cor }}
        >
          Ver Recompensas
        </Button>
      </CardContent>
    </Card>
  );
};

// Card de comissões para profissionais
const ComissoesCard = ({ comissoes, totalPendente, totalPago }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Minhas Comissões
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, bgcolor: '#fff3e0', textAlign: 'center' }}>
              <Typography variant="subtitle2" color="textSecondary">
                Pendente
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, bgcolor: '#e8f5e8', textAlign: 'center' }}>
              <Typography variant="subtitle2" color="textSecondary">
                Recebido
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Últimas comissões
        </Typography>
        <List dense>
          {comissoes.slice(0, 5).map((comissao, index) => (
            <ListItem key={index} divider={index < 4}>
              <ListItemText
                primary={comissao.descricao || 'Comissão de serviço'}
                secondary={format(new Date(comissao.data), 'dd/MM/yyyy')}
              />
              <Chip
                size="small"
                label={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comissao.valor)}
                color={comissao.status === 'pago' ? 'success' : 'warning'}
                sx={{ fontWeight: 600 }}
              />
            </ListItem>
          ))}
        </List>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={() => window.location.href = '/minhas-comissoes'}
          sx={{ mt: 1 }}
        >
          Ver Histórico Completo
        </Button>
      </CardContent>
    </Card>
  );
};

function ModernDashboard() {
  const [usuario, setUsuario] = useState(null);
  const [cargo, setCargo] = useState('');
  const [stats, setStats] = useState({});
  const [trends, setTrends] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [professionalsData, setProfessionalsData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Dados específicos por cargo
  const [fidelidadeData, setFidelidadeData] = useState({
    saldo: 0,
    nivel: 'bronze',
    pontosFaltantes: 0,
    ultimosPontos: [],
  });
  
  const [comissoesData, setComissoesData] = useState({
    pendentes: [],
    pagas: [],
    totalPendente: 0,
    totalPago: 0,
  });

  // Hooks do Firebase
  const { data: agendamentos, loading: loadingAgendamentos } = useFirebase('agendamentos');
  const { data: atendimentos, loading: loadingAtendimentos } = useFirebase('atendimentos');
  const { data: clientes, loading: loadingClientes } = useFirebase('clientes');
  const { data: profissionais, loading: loadingProfissionais } = useFirebase('profissionais');
  const { data: servicos, loading: loadingServicos } = useFirebase('servicos');
  const { data: pagamentos, loading: loadingPagamentos } = useFirebase('pagamentos');
  const { data: comissoes, loading: loadingComissoes } = useFirebase('comissoes');
  const { data: produtos, loading: loadingProdutos } = useFirebase('produtos');
  const { data: pontuacoes, loading: loadingPontuacoes } = useFirebase('pontuacao');
  const { data: recompensas, loading: loadingRecompensas } = useFirebase('recompensas');

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = () => {
    const user = usuariosService.getUsuarioAtual();
    setUsuario(user);
    setCargo(user?.cargo || '');
  };

  useEffect(() => {
    if (!usuario) return;

    const allLoaded = !loadingAgendamentos && !loadingAtendimentos && !loadingClientes && 
                      !loadingProfissionais && !loadingServicos && !loadingPagamentos && 
                      !loadingComissoes && !loadingProdutos && !loadingPontuacoes && 
                      !loadingRecompensas;

    if (allLoaded) {
      calcularDadosPorCargo();
      setLoading(false);
    }
  }, [usuario, loadingAgendamentos, loadingAtendimentos, loadingClientes, 
      loadingProfissionais, loadingServicos, loadingPagamentos, loadingComissoes, 
      loadingProdutos, loadingPontuacoes, loadingRecompensas, period, customDateRange]);

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

  const calcularDadosPorCargo = () => {
    const { start, end } = getDateRange();
    const hoje = new Date();

    // ============================================
    // DADOS PARA ADMIN E GERENTE
    // ============================================
    if (cargo === 'admin' || cargo === 'gerente') {
      calcularDadosAdmin(start, end, hoje);
    }
    // ============================================
    // DADOS PARA ATENDENTE
    // ============================================
    else if (cargo === 'atendente') {
      calcularDadosAtendente(start, end, hoje);
    }
    // ============================================
    // DADOS PARA PROFISSIONAL
    // ============================================
    else if (cargo === 'profissional') {
      calcularDadosProfissional(start, end, hoje);
    }
    // ============================================
    // DADOS PARA CLIENTE
    // ============================================
    else if (cargo === 'cliente') {
      calcularDadosCliente(start, end, hoje);
    }
  };

  const calcularDadosAdmin = (start, end, hoje) => {
    // Faturamento
    const pagamentosPeriodo = (pagamentos || []).filter(p => {
      const dataPagamento = p.data?.toDate ? p.data.toDate() : new Date(p.data);
      return dataPagamento >= start && dataPagamento <= end;
    });

    const faturamento = pagamentosPeriodo.reduce((acc, p) => acc + (p.valor || 0), 0);

    const pagamentosHoje = (pagamentos || []).filter(p => {
      const dataPagamento = p.data?.toDate ? p.data.toDate() : new Date(p.data);
      return dataPagamento.toDateString() === hoje.toDateString();
    });
    const faturamentoHoje = pagamentosHoje.reduce((acc, p) => acc + (p.valor || 0), 0);

    // Clientes
    const totalClientes = (clientes || []).length;
    const clientesNovosPeriodo = (clientes || []).filter(c => {
      const dataCadastro = c.dataCadastro ? new Date(c.dataCadastro) : (c.createdAt?.toDate ? c.createdAt.toDate() : null);
      return dataCadastro && dataCadastro >= start && dataCadastro <= end;
    }).length;

    // Agendamentos
    const agendamentosHoje = (agendamentos || []).filter(a => a.data === format(hoje, 'yyyy-MM-dd'));
    const agendamentosConfirmados = agendamentosHoje.filter(a => a.status === 'confirmado').length;
    const agendamentosPendentes = agendamentosHoje.filter(a => a.status === 'pendente').length;

    // Taxa de ocupação
    const totalHorarios = 12;
    const agendamentosHojeNaoCancelados = agendamentosHoje.filter(a => a.status !== 'cancelado').length;
    const taxaOcupacao = Math.min(100, Math.round((agendamentosHojeNaoCancelados / totalHorarios) * 100));

    // Ticket médio
    const atendimentosPeriodo = (atendimentos || []).filter(a => {
      return a.data >= format(start, 'yyyy-MM-dd') && a.data <= format(end, 'yyyy-MM-dd');
    });
    const ticketMedio = atendimentosPeriodo.length > 0 ? faturamento / atendimentosPeriodo.length : 0;

    // Serviços realizados
    const servicosRealizadosMes = atendimentosPeriodo.length;

    // Comissões
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

    setStats({
      faturamentoMensal: faturamento,
      faturamentoHoje,
      totalClientes,
      clientesNovosMes: clientesNovosPeriodo,
      taxaOcupacao,
      agendamentosHoje: agendamentosHoje.length,
      agendamentosConfirmados,
      agendamentosPendentes,
      agendamentosCancelados: agendamentosHoje.filter(a => a.status === 'cancelado').length,
      ticketMedio,
      servicosRealizadosMes,
      produtosVendidosMes: 0, // Implementar se necessário
      comissoesPendentes,
      comissoesPagas,
    });

    // Dados para gráficos
    gerarDadosGraficos(start, end);
  };

  const calcularDadosAtendente = (start, end, hoje) => {
    const agendamentosHoje = (agendamentos || []).filter(a => a.data === format(hoje, 'yyyy-MM-dd'));
    
    const agendamentosConfirmados = agendamentosHoje.filter(a => a.status === 'confirmado').length;
    const agendamentosPendentes = agendamentosHoje.filter(a => a.status === 'pendente').length;
    const agendamentosCancelados = agendamentosHoje.filter(a => a.status === 'cancelado').length;

    // Total de clientes para referência
    const totalClientes = (clientes || []).length;

    // Clientes que chegam hoje (para atendente recepcionar)
    const clientesHoje = agendamentosHoje
      .filter(a => a.status !== 'cancelado')
      .map(a => {
        const cliente = clientes?.find(c => c.id === a.clienteId);
        const servico = servicos?.find(s => s.id === a.servicoId);
        return { ...a, cliente, servico };
      })
      .sort((a, b) => a.horario.localeCompare(b.horario));

    setStats({
      agendamentosHoje: agendamentosHoje.length,
      agendamentosConfirmados,
      agendamentosPendentes,
      agendamentosCancelados,
      totalClientes,
      clientesHoje,
    });

    setAppointments(clientesHoje);
  };

  const calcularDadosProfissional = (start, end, hoje) => {
    // Filtrar agendamentos do profissional logado
    const profissionalId = usuario?.profissionalId;
    
    if (!profissionalId) return;

    const agendamentosProfissional = (agendamentos || []).filter(a => 
      a.profissionalId === profissionalId && a.data === format(hoje, 'yyyy-MM-dd')
    );

    const agendamentosConfirmados = agendamentosProfissional.filter(a => a.status === 'confirmado').length;
    const agendamentosPendentes = agendamentosProfissional.filter(a => a.status === 'pendente').length;

    // Próximos agendamentos
    const proximosAgendamentos = agendamentosProfissional
      .filter(a => a.status !== 'cancelado')
      .map(a => {
        const cliente = clientes?.find(c => c.id === a.clienteId);
        const servico = servicos?.find(s => s.id === a.servicoId);
        return { ...a, cliente, servico };
      })
      .sort((a, b) => a.horario.localeCompare(b.horario));

    // Comissões do profissional
    const minhasComissoes = (comissoes || []).filter(c => c.profissionalId === profissionalId);
    
    const comissoesPendentes = minhasComissoes
      .filter(c => c.status === 'pendente')
      .reduce((acc, c) => acc + (c.valor || 0), 0);

    const comissoesPagas = minhasComissoes
      .filter(c => c.status === 'pago')
      .reduce((acc, c) => acc + (c.valor || 0), 0);

    // Atendimentos realizados no período
    const atendimentosRealizados = (atendimentos || []).filter(a => 
      a.profissionalId === profissionalId && 
      a.data >= format(start, 'yyyy-MM-dd') && 
      a.data <= format(end, 'yyyy-MM-dd')
    ).length;

    setStats({
      agendamentosHoje: agendamentosProfissional.length,
      agendamentosConfirmados,
      agendamentosPendentes,
      proximosAgendamentos,
      comissoesPendentes,
      comissoesPagas,
      atendimentosRealizados,
    });

    setAppointments(proximosAgendamentos);
    
    setComissoesData({
      pendentes: minhasComissoes.filter(c => c.status === 'pendente'),
      pagas: minhasComissoes.filter(c => c.status === 'pago'),
      totalPendente: comissoesPendentes,
      totalPago: comissoesPagas,
    });
  };

  const calcularDadosCliente = (start, end, hoje) => {
    const clienteId = usuario?.clienteId;
    
    if (!clienteId) return;

    // Pontuação do cliente
    const minhasPontuacoes = (pontuacoes || []).filter(p => p.clienteId === clienteId);
    
    const creditos = minhasPontuacoes
      .filter(p => p.tipo === 'credito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);

    const debitos = minhasPontuacoes
      .filter(p => p.tipo === 'debito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);

    const saldo = creditos - debitos;

    // Determinar nível
    let nivel = 'bronze';
    if (saldo >= 5000) nivel = 'platina';
    else if (saldo >= 2000) nivel = 'ouro';
    else if (saldo >= 500) nivel = 'prata';

    const pontosProximoNivel = nivel === 'bronze' ? 500 : nivel === 'prata' ? 2000 : nivel === 'ouro' ? 5000 : null;
    const pontosFaltantes = pontosProximoNivel ? pontosProximoNivel - saldo : 0;

    // Agendamentos do cliente
    const meusAgendamentos = (agendamentos || []).filter(a => 
      a.clienteId === clienteId && a.data >= format(start, 'yyyy-MM-dd')
    );

    const agendamentosFuturos = meusAgendamentos
      .filter(a => a.data >= format(hoje, 'yyyy-MM-dd') && a.status !== 'cancelado')
      .map(a => {
        const servico = servicos?.find(s => s.id === a.servicoId);
        const profissional = profissionais?.find(p => p.id === a.profissionalId);
        return { ...a, servico, profissional };
      })
      .sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario));

    // Histórico de atendimentos
    const historicoAtendimentos = (atendimentos || [])
      .filter(a => a.clienteId === clienteId)
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5);

    setStats({
      saldo,
      nivel,
      pontosFaltantes,
      totalAgendamentos: meusAgendamentos.length,
      agendamentosFuturos: agendamentosFuturos.length,
      historicoAtendimentos,
    });

    setFidelidadeData({
      saldo,
      nivel,
      pontosFaltantes,
      ultimosPontos: minhasPontuacoes.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 5),
    });

    setAppointments(agendamentosFuturos);
  };

  const gerarDadosGraficos = (start, end) => {
    // Receita por período
    const revenueByPeriod = [];
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 31) {
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
        });
      }
    } else {
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
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    handleMenuClose();
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
      calcularDadosPorCargo();
      setLoading(false);
    }, 500);
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

  // ============================================
  // RENDERIZAÇÃO POR CARGO
  // ============================================

  // DASHBOARD ADMIN / GERENTE
  if (cargo === 'admin' || cargo === 'gerente') {
    return (
      <Box>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Dashboard {cargo === 'admin' ? 'Administrativo' : 'Gerencial'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Visão completa do negócio
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
            
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => handlePeriodChange('day')}><Today sx={{ mr: 1 }} /> Hoje</MenuItem>
              <MenuItem onClick={() => handlePeriodChange('week')}><DateRange sx={{ mr: 1 }} /> Últimos 7 dias</MenuItem>
              <MenuItem onClick={() => handlePeriodChange('month')}><Event sx={{ mr: 1 }} /> Este mês</MenuItem>
              <MenuItem onClick={() => handlePeriodChange('year')}><CalendarToday sx={{ mr: 1 }} /> Este ano</MenuItem>
              <Divider />
              <MenuItem onClick={() => handlePeriodChange('custom')}>Personalizado</MenuItem>
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
                  <Chip size="small" label={`${stats.agendamentosConfirmados} confirmados`} color="success" />
                  <Chip size="small" label={`${stats.agendamentosPendentes} pendentes`} color="warning" />
                  <Chip size="small" label={`${stats.agendamentosCancelados} cancelados`} color="error" />
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
                <Typography variant="caption" color="textSecondary">no período</Typography>
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
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Ticket Médio
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {formatarMoeda(stats.ticketMedio)}
                </Typography>
                <Typography variant="caption" color="textSecondary">por atendimento</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#fce4ec' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Novos Clientes
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff4081' }}>
                  {formatarNumero(stats.clientesNovosMes)}
                </Typography>
                <Typography variant="caption" color="textSecondary">neste período</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Evolução da Receita
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
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
                      <Area type="monotone" dataKey="valor" stroke="#9c27b0" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
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
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length], mr: 1 }} />
                            <Typography variant="body2" sx={{ flex: 1 }}>{service.name}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{service.value}</Typography>
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

          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                          {formatarMoeda(client.total)}
                        </Typography>
                      </ListItem>
                    ))}
                    {topClients.length === 0 && (
                      <ListItem>
                        <ListItemText primary="Nenhum dado disponível" align="center" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Agenda de Hoje
                  </Typography>
                  {appointments.length > 0 ? (
                    appointments.slice(0, 5).map((apt) => {
                      const cliente = clientes?.find(c => c.id === apt.clienteId);
                      const servico = servicos?.find(s => s.id === apt.servicoId);
                      return (
                        <AppointmentCard
                          key={apt.id}
                          appointment={apt}
                          client={cliente}
                          service={servico}
                        />
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                      Nenhum agendamento para hoje
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // DASHBOARD ATENDENTE
  if (cargo === 'atendente') {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Painel do Atendente
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie os atendimentos do dia
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#f3e5f5', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
                  Resumo do Dia
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Total de Agendamentos:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.agendamentosHoje || 0}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Confirmados:</Typography>
                  <Chip label={stats.agendamentosConfirmados || 0} color="success" size="small" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Pendentes:</Typography>
                  <Chip label={stats.agendamentosPendentes || 0} color="warning" size="small" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Cancelados:</Typography>
                  <Chip label={stats.agendamentosCancelados || 0} color="error" size="small" />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total de Clientes:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.totalClientes || 0}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Próximos Atendimentos
                </Typography>
                {stats.clientesHoje && stats.clientesHoje.length > 0 ? (
                  stats.clientesHoje.map((apt) => (
                    <Card key={apt.id} variant="outlined" sx={{ mb: 1, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#9c27b0' }}>
                          <Person />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {apt.cliente?.nome}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {apt.servico?.nome} • {apt.horario}
                          </Typography>
                        </Box>
                        <Chip
                          label={apt.status}
                          color={apt.status === 'confirmado' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                    Nenhum atendimento agendado para hoje
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ações Rápidas
                  </Typography>
                </Box>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Event />}
                      onClick={() => window.location.href = '/agendamentos'}
                      sx={{ bgcolor: '#9c27b0' }}
                    >
                      Novo Agendamento
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Person />}
                      onClick={() => window.location.href = '/clientes'}
                      sx={{ bgcolor: '#ff4081' }}
                    >
                      Cadastrar Cliente
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Receipt />}
                      onClick={() => window.location.href = '/atendimentos'}
                      sx={{ bgcolor: '#ff9800' }}
                    >
                      Iniciar Atendimento
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // DASHBOARD PROFISSIONAL
  if (cargo === 'profissional') {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Olá, {usuario?.nome?.split(' ')[0]}!
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Aqui está sua agenda e comissões
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Minha Agenda de Hoje
                </Typography>
                {appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      client={apt.cliente}
                      service={apt.servico}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                    Nenhum agendamento para hoje
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <ComissoesCard
              comissoes={comissoesData.pendentes}
              totalPendente={comissoesData.totalPendente}
              totalPago={comissoesData.totalPago}
            />
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Estatísticas do Período
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                      <Typography variant="subtitle2" color="textSecondary">Atendimentos Realizados</Typography>
                      <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                        {stats.atendimentosRealizados || 0}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                      <Typography variant="subtitle2" color="textSecondary">Agendamentos Hoje</Typography>
                      <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>
                        {stats.agendamentosHoje || 0}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                      <Typography variant="subtitle2" color="textSecondary">Confirmados</Typography>
                      <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>
                        {stats.agendamentosConfirmados || 0}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // DASHBOARD CLIENTE
  if (cargo === 'cliente') {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Olá, {usuario?.nome?.split(' ')[0]}!
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Acompanhe seus pontos e agendamentos
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <FidelidadeCard
              saldo={fidelidadeData.saldo}
              nivel={fidelidadeData.nivel}
              pontosFaltantes={fidelidadeData.pontosFaltantes}
              ultimosPontos={fidelidadeData.ultimosPontos}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Próximos Agendamentos
                </Typography>
                {appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <Card key={apt.id} variant="outlined" sx={{ mb: 1, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#ff9800' }}>
                          <Event />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {apt.servico?.nome}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {format(new Date(apt.data), "dd 'de' MMMM")} às {apt.horario}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Profissional: {apt.profissional?.nome}
                          </Typography>
                        </Box>
                        <Chip
                          label={apt.status}
                          color={apt.status === 'confirmado' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                    Você não tem agendamentos futuros
                  </Typography>
                )}
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  onClick={() => window.location.href = '/agendamentos'}
                  sx={{ mt: 2 }}
                >
                  Agendar Novo Serviço
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Histórico de Atendimentos
                </Typography>
                {stats.historicoAtendimentos && stats.historicoAtendimentos.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Data</TableCell>
                          <TableCell>Serviço</TableCell>
                          <TableCell>Profissional</TableCell>
                          <TableCell>Valor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.historicoAtendimentos.map((atend, index) => (
                          <TableRow key={index}>
                            <TableCell>{format(new Date(atend.data), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{atend.servico?.nome || '-'}</TableCell>
                            <TableCell>{atend.profissional?.nome || '-'}</TableCell>
                            <TableCell>{formatarMoeda(atend.valor)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                    Nenhum histórico de atendimentos
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Fallback
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info">
        Bem-vindo ao sistema! Selecione uma opção no menu para começar.
      </Alert>
    </Box>
  );
}

export default ModernDashboard;
