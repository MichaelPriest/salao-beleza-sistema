// src/pages/AnaliseVendas.js
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
  ToggleButton,
  ToggleButtonGroup,
  Rating,
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
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
} from 'recharts';

const [openFiltros, setOpenFiltros] = useState(false);

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

const agrupamentos = [
  { value: 'dia', label: 'Por dia' },
  { value: 'semana', label: 'Por semana' },
  { value: 'mes', label: 'Por mês' },
  { value: 'trimestre', label: 'Por trimestre' },
  { value: 'ano', label: 'Por ano' },
];

const tiposGrafico = [
  { value: 'linha', label: 'Linha', icon: <ShowChartIcon /> },
  { value: 'barra', label: 'Barra', icon: <BarChartIcon /> },
  { value: 'area', label: 'Área', icon: <TimelineIcon /> },
  { value: 'pizza', label: 'Pizza', icon: <PieChartIcon /> },
  { value: 'radar', label: 'Radar', icon: <BubbleChartIcon /> },
];

const CORES_GRAFICOS = [
  '#9c27b0', '#ff4081', '#4caf50', '#2196f3', '#ff9800', 
  '#f44336', '#00bcd4', '#795548', '#607d8b', '#e91e63',
  '#673ab7', '#3f51b5', '#03a9f4', '#009688', '#8bc34a',
  '#cddc39', '#ffeb3b', '#ffc107', '#ff5722', '#9e9e9e'
];

function AnaliseVendas() {
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [periodo, setPeriodo] = useState('ultimos30');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [agrupamento, setAgrupamento] = useState('dia');
  const [tipoGrafico, setTipoGrafico] = useState('linha');
  const [filtroServico, setFiltroServico] = useState('todos');
  const [filtroProfissional, setFiltroProfissional] = useState('todos');
  const [filtroCliente, setFiltroCliente] = useState('todos');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [dadosProcessados, setDadosProcessados] = useState({
    vendasPorPeriodo: [],
    vendasPorServico: [],
    vendasPorProfissional: [],
    vendasPorCliente: [],
    ticketMedio: [],
    horariosPico: [],
    diasSemana: [],
    comparativo: [],
    topServicos: [],
    topProfissionais: [],
    topClientes: [],
  });
  const [metricas, setMetricas] = useState({
    totalVendas: 0,
    faturamentoTotal: 0,
    ticketMedio: 0,
    clientesAtendidos: 0,
    servicosRealizados: 0,
    produtosVendidos: 0,
    crescimento: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    processarDados();
  }, [vendas, periodo, dataInicio, dataFim, agrupamento, filtroServico, filtroProfissional, filtroCliente]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [vendasData, clientesData, profissionaisData, servicosData, produtosData] = await Promise.all([
        firebaseService.getAll('atendimentos').catch(() => []),
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('produtos').catch(() => [])
      ]);

      // Filtrar apenas atendimentos finalizados
      const vendasFinalizadas = (vendasData || []).filter(v => v.status === 'finalizado');

      setVendas(vendasFinalizadas);
      setClientes(clientesData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);
      setProdutos(produtosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const processarDados = () => {
    // Filtrar vendas por período
    let vendasFiltradas = [...vendas];
    
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
      case 'anoPassado':
        inicio = new Date(hoje.getFullYear() - 1, 0, 1);
        fim = new Date(hoje.getFullYear() - 1, 11, 31);
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
      vendasFiltradas = vendasFiltradas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda >= inicio && dataVenda <= fim;
      });
    }

    // Aplicar filtros adicionais
    if (filtroServico !== 'todos') {
      vendasFiltradas = vendasFiltradas.filter(venda => 
        venda.servicoId === filtroServico ||
        venda.itensServico?.some(item => item.id === filtroServico)
      );
    }

    if (filtroProfissional !== 'todos') {
      vendasFiltradas = vendasFiltradas.filter(venda => 
        venda.profissionalId === filtroProfissional
      );
    }

    if (filtroCliente !== 'todos') {
      vendasFiltradas = vendasFiltradas.filter(venda => 
        venda.clienteId === filtroCliente
      );
    }

    // Calcular métricas gerais
    const faturamentoTotal = vendasFiltradas.reduce((acc, v) => acc + (v.valorTotal || 0), 0);
    const clientesAtendidos = new Set(vendasFiltradas.map(v => v.clienteId)).size;
    const servicosRealizados = vendasFiltradas.reduce((acc, v) => 
      acc + (v.itensServico?.length || (v.servicoId ? 1 : 0)), 0
    );
    const produtosVendidos = vendasFiltradas.reduce((acc, v) => 
      acc + (v.itensProduto?.reduce((sum, p) => sum + (p.quantidade || 1), 0) || 0), 0
    );

    // Calcular crescimento comparado ao período anterior
    const diasPeriodo = differenceInDays(fim, inicio);
    const inicioAnterior = subDays(inicio, diasPeriodo);
    const fimAnterior = subDays(fim, diasPeriodo);
    
    const vendasAnteriores = vendas.filter(v => {
      const dataVenda = new Date(v.data);
      return dataVenda >= inicioAnterior && dataVenda <= fimAnterior;
    });
    
    const faturamentoAnterior = vendasAnteriores.reduce((acc, v) => acc + (v.valorTotal || 0), 0);
    const crescimento = faturamentoAnterior > 0 
      ? ((faturamentoTotal - faturamentoAnterior) / faturamentoAnterior) * 100 
      : 100;

    setMetricas({
      totalVendas: vendasFiltradas.length,
      faturamentoTotal,
      ticketMedio: vendasFiltradas.length > 0 ? faturamentoTotal / vendasFiltradas.length : 0,
      clientesAtendidos,
      servicosRealizados,
      produtosVendidos,
      crescimento,
    });

    // 1. Vendas por período (linha do tempo)
    const vendasPorPeriodo = {};
    vendasFiltradas.forEach(venda => {
      let chave;
      const data = new Date(venda.data);
      
      if (agrupamento === 'dia') {
        chave = format(data, 'dd/MM');
      } else if (agrupamento === 'semana') {
        chave = `Semana ${format(data, 'w')}`;
      } else if (agrupamento === 'mes') {
        chave = format(data, 'MMM/yy', { locale: ptBR });
      } else if (agrupamento === 'trimestre') {
        const trimestre = Math.floor(data.getMonth() / 3) + 1;
        chave = `T${trimestre}/${data.getFullYear()}`;
      } else if (agrupamento === 'ano') {
        chave = data.getFullYear().toString();
      }

      if (!vendasPorPeriodo[chave]) {
        vendasPorPeriodo[chave] = {
          periodo: chave,
          quantidade: 0,
          valor: 0,
        };
      }
      vendasPorPeriodo[chave].quantidade += 1;
      vendasPorPeriodo[chave].valor += venda.valorTotal || 0;
    });

    const dadosVendasPorPeriodo = Object.values(vendasPorPeriodo).sort((a, b) => {
      if (agrupamento === 'dia') {
        const [d1, m1] = a.periodo.split('/');
        const [d2, m2] = b.periodo.split('/');
        return new Date(2024, parseInt(m1) - 1, parseInt(d1)) - new Date(2024, parseInt(m2) - 1, parseInt(d2));
      }
      return 0;
    });

    // 2. Vendas por serviço
    const vendasPorServico = {};
    vendasFiltradas.forEach(venda => {
      const servicosVenda = venda.itensServico || 
        (venda.servicoId ? [{ id: venda.servicoId, preco: venda.valorTotal }] : []);
      
      servicosVenda.forEach(item => {
        if (!vendasPorServico[item.id]) {
          const servico = servicos.find(s => s.id === item.id);
          vendasPorServico[item.id] = {
            id: item.id,
            nome: item.nome || servico?.nome || 'Serviço',
            quantidade: 0,
            valor: 0,
          };
        }
        vendasPorServico[item.id].quantidade += 1;
        vendasPorServico[item.id].valor += item.preco || 0;
      });
    });

    const dadosVendasPorServico = Object.values(vendasPorServico)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    // 3. Vendas por profissional
    const vendasPorProfissional = {};
    vendasFiltradas.forEach(venda => {
      if (!vendasPorProfissional[venda.profissionalId]) {
        const profissional = profissionais.find(p => p.id === venda.profissionalId);
        vendasPorProfissional[venda.profissionalId] = {
          id: venda.profissionalId,
          nome: profissional?.nome || 'Profissional',
          quantidade: 0,
          valor: 0,
        };
      }
      vendasPorProfissional[venda.profissionalId].quantidade += 1;
      vendasPorProfissional[venda.profissionalId].valor += venda.valorTotal || 0;
    });

    const dadosVendasPorProfissional = Object.values(vendasPorProfissional)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    // 4. Vendas por cliente
    const vendasPorCliente = {};
    vendasFiltradas.forEach(venda => {
      if (!vendasPorCliente[venda.clienteId]) {
        const cliente = clientes.find(c => c.id === venda.clienteId);
        vendasPorCliente[venda.clienteId] = {
          id: venda.clienteId,
          nome: cliente?.nome || 'Cliente',
          quantidade: 0,
          valor: 0,
        };
      }
      vendasPorCliente[venda.clienteId].quantidade += 1;
      vendasPorCliente[venda.clienteId].valor += venda.valorTotal || 0;
    });

    const dadosVendasPorCliente = Object.values(vendasPorCliente)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    // 5. Ticket médio por período
    const ticketMedio = dadosVendasPorPeriodo.map(item => ({
      periodo: item.periodo,
      ticketMedio: item.quantidade > 0 ? item.valor / item.quantidade : 0,
    }));

    // 6. Horários de pico
    const horariosPico = Array(24).fill(0).map((_, hora) => ({
      hora: `${hora}h`,
      quantidade: 0,
      valor: 0,
    }));

    vendasFiltradas.forEach(venda => {
      if (venda.horaInicio) {
        const hora = parseInt(venda.horaInicio.split(':')[0]);
        if (hora >= 0 && hora < 24) {
          horariosPico[hora].quantidade += 1;
          horariosPico[hora].valor += venda.valorTotal || 0;
        }
      }
    });

    // 7. Vendas por dia da semana
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const vendasPorDia = diasSemana.map((dia, index) => ({
      dia,
      quantidade: 0,
      valor: 0,
    }));

    vendasFiltradas.forEach(venda => {
      const data = new Date(venda.data);
      const diaSemana = data.getDay();
      vendasPorDia[diaSemana].quantidade += 1;
      vendasPorDia[diaSemana].valor += venda.valorTotal || 0;
    });

    setDadosProcessados({
      vendasPorPeriodo: dadosVendasPorPeriodo,
      vendasPorServico: dadosVendasPorServico,
      vendasPorProfissional: dadosVendasPorProfissional,
      vendasPorCliente: dadosVendasPorCliente,
      ticketMedio,
      horariosPico,
      diasSemana: vendasPorDia,
      topServicos: dadosVendasPorServico.slice(0, 5),
      topProfissionais: dadosVendasPorProfissional.slice(0, 5),
      topClientes: dadosVendasPorCliente.slice(0, 5),
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
      // Implementar exportação CSV
      toast.success('Dados exportados para CSV');
    } else if (formato === 'pdf') {
      // Implementar exportação PDF
      toast.success('Relatório PDF gerado');
    } else if (formato === 'excel') {
      // Implementar exportação Excel
      toast.success('Planilha Excel gerada');
    }
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarNumero = (valor) => {
    return valor.toLocaleString('pt-BR');
  };

  const getCrescimentoColor = () => {
    if (metricas.crescimento > 0) return '#4caf50';
    if (metricas.crescimento < 0) return '#f44336';
    return '#ff9800';
  };

  const getCrescimentoIcon = () => {
    if (metricas.crescimento > 0) return <TrendingUpIcon />;
    if (metricas.crescimento < 0) return <TrendingDownIcon />;
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
              Análise de Vendas
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Métricas detalhadas e insights sobre o desempenho de vendas
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportar('csv')}
            >
              Exportar CSV
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

        {/* Filtros */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
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
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Agrupar por</InputLabel>
                  <Select
                    value={agrupamento}
                    label="Agrupar por"
                    onChange={(e) => setAgrupamento(e.target.value)}
                  >
                    {agrupamentos.map(agg => (
                      <MenuItem key={agg.value} value={agg.value}>{agg.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo Gráfico</InputLabel>
                  <Select
                    value={tipoGrafico}
                    label="Tipo Gráfico"
                    onChange={(e) => setTipoGrafico(e.target.value)}
                  >
                    {tiposGrafico.map(tipo => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {tipo.icon}
                          {tipo.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setOpenFiltros(!openFiltros)}
                  sx={{ height: '40px' }}
                >
                  Mais Filtros
                </Button>
              </Grid>
            </Grid>

            {/* Filtros avançados (podem ser expandidos) */}
            <Collapse in={openFiltros}>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Serviço</InputLabel>
                      <Select
                        value={filtroServico}
                        label="Serviço"
                        onChange={(e) => setFiltroServico(e.target.value)}
                      >
                        <MenuItem value="todos">Todos os serviços</MenuItem>
                        {servicos.map(serv => (
                          <MenuItem key={serv.id} value={serv.id}>{serv.nome}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Profissional</InputLabel>
                      <Select
                        value={filtroProfissional}
                        label="Profissional"
                        onChange={(e) => setFiltroProfissional(e.target.value)}
                      >
                        <MenuItem value="todos">Todos os profissionais</MenuItem>
                        {profissionais.map(prof => (
                          <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Cliente</InputLabel>
                      <Select
                        value={filtroCliente}
                        label="Cliente"
                        onChange={(e) => setFiltroCliente(e.target.value)}
                      >
                        <MenuItem value="todos">Todos os clientes</MenuItem>
                        {clientes.map(cli => (
                          <MenuItem key={cli.id} value={cli.id}>{cli.nome}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Cards de Métricas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card sx={{ 
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total de Vendas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatarNumero(metricas.totalVendas)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getCrescimentoIcon()}
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {metricas.crescimento > 0 ? '+' : ''}{metricas.crescimento.toFixed(1)}% vs período anterior
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                    Faturamento Total
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatarMoeda(metricas.faturamentoTotal)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {metricas.totalVendas} transações
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Ticket Médio
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {formatarMoeda(metricas.ticketMedio)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    por atendimento
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Clientes Atendidos
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196f3' }}>
                    {formatarNumero(metricas.clientesAtendidos)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {((metricas.clientesAtendidos / clientes.length) * 100).toFixed(1)}% da base
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
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
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#00bcd4' }}>
                    {formatarNumero(metricas.servicosRealizados)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    média de {(metricas.servicosRealizados / metricas.totalVendas || 0).toFixed(1)} por venda
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
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
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff4081' }}>
                    {formatarNumero(metricas.produtosVendidos)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    em {vendas.filter(v => v.itensProduto?.length > 0).length} vendas
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3}>
          {/* Gráfico Principal */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Evolução de Vendas</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {tipoGrafico === 'linha' && (
                      <LineChart data={dadosProcessados.vendasPorPeriodo}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodo" />
                        <YAxis yAxisId="left" orientation="left" stroke="#9c27b0" />
                        <YAxis yAxisId="right" orientation="right" stroke="#ff4081" />
                        <RechartsTooltip 
                          formatter={(value, name) => {
                            if (name === 'valor') return formatarMoeda(value);
                            return value;
                          }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="quantidade" 
                          stroke="#9c27b0" 
                          name="Quantidade"
                          strokeWidth={2}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="valor" 
                          stroke="#ff4081" 
                          name="Valor (R$)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    )}

                    {tipoGrafico === 'barra' && (
                      <BarChart data={dadosProcessados.vendasPorPeriodo}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodo" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value, name) => {
                            if (name === 'valor') return formatarMoeda(value);
                            return value;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="quantidade" fill="#9c27b0" name="Quantidade" />
                        <Bar dataKey="valor" fill="#ff4081" name="Valor (R$)" />
                      </BarChart>
                    )}

                    {tipoGrafico === 'area' && (
                      <AreaChart data={dadosProcessados.vendasPorPeriodo}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodo" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value, name) => {
                            if (name === 'valor') return formatarMoeda(value);
                            return value;
                          }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="quantidade" 
                          stackId="1"
                          stroke="#9c27b0" 
                          fill="#9c27b0" 
                          fillOpacity={0.3}
                          name="Quantidade"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="valor" 
                          stackId="2"
                          stroke="#ff4081" 
                          fill="#ff4081" 
                          fillOpacity={0.3}
                          name="Valor (R$)"
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ticket Médio */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Ticket Médio</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosProcessados.ticketMedio}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value) => formatarMoeda(value)}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ticketMedio" 
                        stroke="#ff9800" 
                        name="Ticket Médio"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Horários de Pico */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Horários de Pico</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosProcessados.horariosPico}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hora" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="quantidade" fill="#9c27b0" name="Quantidade" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Dias da Semana */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Vendas por Dia da Semana</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={dadosProcessados.diasSemana}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dia" />
                      <PolarRadiusAxis />
                      <Radar 
                        name="Quantidade" 
                        dataKey="quantidade" 
                        stroke="#9c27b0" 
                        fill="#9c27b0" 
                        fillOpacity={0.6} 
                      />
                      <Radar 
                        name="Valor" 
                        dataKey="valor" 
                        stroke="#ff4081" 
                        fill="#ff4081" 
                        fillOpacity={0.6} 
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Serviços */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Top 5 Serviços</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosProcessados.topServicos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.nome}: ${entry.quantidade}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="quantidade"
                      >
                        {dadosProcessados.topServicos.map((entry, index) => (
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

          {/* Top Profissionais */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Top 5 Profissionais</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosProcessados.topProfissionais}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.nome}: ${entry.quantidade}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="quantidade"
                      >
                        {dadosProcessados.topProfissionais.map((entry, index) => (
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

          {/* Top Clientes */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Top 5 Clientes</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosProcessados.topClientes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.nome}: ${entry.valor.toFixed(2)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {dadosProcessados.topClientes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => formatarMoeda(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Tabela Detalhada */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Detalhamento de Vendas</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Período</strong></TableCell>
                        <TableCell align="right"><strong>Quantidade</strong></TableCell>
                        <TableCell align="right"><strong>Valor</strong></TableCell>
                        <TableCell align="right"><strong>Ticket Médio</strong></TableCell>
                        <TableCell align="right"><strong>Participação</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dadosProcessados.vendasPorPeriodo.map((item, index) => {
                        const participacao = (item.valor / metricas.faturamentoTotal) * 100;
                        return (
                          <TableRow key={index} hover>
                            <TableCell>{item.periodo}</TableCell>
                            <TableCell align="right">{item.quantidade}</TableCell>
                            <TableCell align="right">
                              <Typography sx={{ fontWeight: 600, color: '#4caf50' }}>
                                {formatarMoeda(item.valor)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {formatarMoeda(item.quantidade > 0 ? item.valor / item.quantidade : 0)}
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                <Typography variant="body2">
                                  {participacao.toFixed(1)}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={participacao}
                                  sx={{ 
                                    width: 60, 
                                    height: 6, 
                                    borderRadius: 3,
                                    bgcolor: '#f0f0f0',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: '#9c27b0',
                                    },
                                  }}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
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

export default AnaliseVendas;
