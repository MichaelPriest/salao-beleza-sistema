// src/pages/AnaliseCupons.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Percent as PercentIcon,
  Money as MoneyIcon,
  LocalOffer as TagIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Equalizer as EqualizerIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { cupomService } from '../services/cupomService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
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
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

const periodos = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'ontem', label: 'Ontem' },
  { value: 'ultimos7', label: 'Últimos 7 dias' },
  { value: 'ultimos30', label: 'Últimos 30 dias' },
  { value: 'esteMes', label: 'Este mês' },
  { value: 'mesPassado', label: 'Mês passado' },
  { value: 'personalizado', label: 'Personalizado' },
];

const CORES_GRAFICOS = ['#9c27b0', '#ff4081', '#4caf50', '#2196f3', '#ff9800', '#f44336', '#00bcd4', '#795548'];

function AnaliseCupons() {
  const [loading, setLoading] = useState(true);
  const [cupons, setCupons] = useState([]);
  const [usos, setUsos] = useState([]);
  const [periodo, setPeriodo] = useState('ultimos30');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [filtroCupom, setFiltroCupom] = useState('todos');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [clientes, setClientes] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [cupomSelecionado, setCupomSelecionado] = useState(null);

  // Dados processados para gráficos
  const [dadosGrafico, setDadosGrafico] = useState({
    usosPorDia: [],
    cuponsMaisUsados: [],
    tiposCupom: [],
    horariosUso: [],
    desempenho: [],
    topClientes: [],
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    processarDados();
  }, [cupons, usos, periodo, dataInicio, dataFim, filtroCupom]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [cuponsData, usosData, clientesData] = await Promise.all([
        cupomService.listarCupons(),
        firebaseService.getAll('usos_cupons').catch(() => []),
        firebaseService.getAll('clientes').catch(() => [])
      ]);
      setCupons(cuponsData || []);
      setUsos(usosData || []);
      setClientes(clientesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const processarDados = () => {
    // Filtrar usos por período
    let usosFiltrados = [...usos];
    
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
        inicio = new Date(hoje.setDate(hoje.getDate() - 7));
        fim = new Date();
        break;
      case 'ultimos30':
        inicio = new Date(hoje.setDate(hoje.getDate() - 30));
        fim = new Date();
        break;
      case 'esteMes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'mesPassado':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
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
      usosFiltrados = usosFiltrados.filter(uso => {
        const dataUso = new Date(uso.data);
        return dataUso >= inicio && dataUso <= fim;
      });
    }

    // Filtrar por cupom específico
    if (filtroCupom !== 'todos') {
      usosFiltrados = usosFiltrados.filter(uso => uso.cupomId === filtroCupom);
    }

    // Filtrar por cliente (texto)
    if (filtroCliente) {
      usosFiltrados = usosFiltrados.filter(uso => 
        uso.clienteNome?.toLowerCase().includes(filtroCliente.toLowerCase())
      );
    }

    // 1. Usos por dia
    const usosPorDia = {};
    usosFiltrados.forEach(uso => {
      const data = new Date(uso.data).toLocaleDateString('pt-BR');
      usosPorDia[data] = (usosPorDia[data] || 0) + 1;
    });

    const dadosUsosPorDia = Object.keys(usosPorDia).map(data => ({
      data,
      usos: usosPorDia[data],
    })).sort((a, b) => {
      const [d1, m1, a1] = a.data.split('/').map(Number);
      const [d2, m2, a2] = b.data.split('/').map(Number);
      return new Date(a2, m2 - 1, d2) - new Date(a1, m1 - 1, d1);
    });

    // 2. Cupons mais usados
    const usosPorCupom = {};
    usosFiltrados.forEach(uso => {
      usosPorCupom[uso.cupomId] = (usosPorCupom[uso.cupomId] || 0) + 1;
    });

    const dadosCuponsMaisUsados = Object.keys(usosPorCupom)
      .map(cupomId => {
        const cupom = cupons.find(c => c.id === cupomId);
        return {
          id: cupomId,
          nome: cupom?.codigo || 'Desconhecido',
          usos: usosPorCupom[cupomId],
          valor: cupom?.valor || 0,
          tipo: cupom?.tipo || 'desconhecido',
        };
      })
      .sort((a, b) => b.usos - a.usos)
      .slice(0, 10);

    // 3. Distribuição por tipo de cupom
    const usosPorTipo = {};
    usosFiltrados.forEach(uso => {
      const cupom = cupons.find(c => c.id === uso.cupomId);
      const tipo = cupom?.tipo || 'desconhecido';
      usosPorTipo[tipo] = (usosPorTipo[tipo] || 0) + 1;
    });

    const dadosTiposCupom = Object.keys(usosPorTipo).map(tipo => ({
      name: tipo === 'percentual' ? 'Percentual' :
            tipo === 'fixo' ? 'Valor Fixo' :
            tipo === 'frete' ? 'Frete Grátis' :
            tipo === 'produto' ? 'Produto' : tipo,
      value: usosPorTipo[tipo],
    }));

    // 4. Horários de uso
    const usosPorHora = Array(24).fill(0);
    usosFiltrados.forEach(uso => {
      const hora = new Date(uso.data).getHours();
      usosPorHora[hora] = (usosPorHora[hora] || 0) + 1;
    });

    const dadosHorariosUso = usosPorHora.map((count, hora) => ({
      hora: `${hora.toString().padStart(2, '0')}h`,
      usos: count,
    }));

    // 5. Desempenho (valor de descontos por dia)
    const valorPorDia = {};
    usosFiltrados.forEach(uso => {
      const data = new Date(uso.data).toLocaleDateString('pt-BR');
      valorPorDia[data] = (valorPorDia[data] || 0) + (uso.valorDesconto || 0);
    });

    const dadosDesempenho = Object.keys(valorPorDia).map(data => ({
      data,
      valor: valorPorDia[data],
    })).sort((a, b) => {
      const [d1, m1, a1] = a.data.split('/').map(Number);
      const [d2, m2, a2] = b.data.split('/').map(Number);
      return new Date(a2, m2 - 1, d2) - new Date(a1, m1 - 1, d1);
    });

    // 6. Top clientes
    const usosPorCliente = {};
    usosFiltrados.forEach(uso => {
      if (uso.clienteId) {
        usosPorCliente[uso.clienteId] = usosPorCliente[uso.clienteId] || {
          usos: 0,
          valor: 0,
          nome: uso.clienteNome || 'Cliente',
        };
        usosPorCliente[uso.clienteId].usos += 1;
        usosPorCliente[uso.clienteId].valor += uso.valorDesconto || 0;
      }
    });

    const dadosTopClientes = Object.keys(usosPorCliente)
      .map(clienteId => ({
        id: clienteId,
        nome: usosPorCliente[clienteId].nome,
        usos: usosPorCliente[clienteId].usos,
        valor: usosPorCliente[clienteId].valor,
      }))
      .sort((a, b) => b.usos - a.usos)
      .slice(0, 10);

    setDadosGrafico({
      usosPorDia: dadosUsosPorDia,
      cuponsMaisUsados: dadosCuponsMaisUsados,
      tiposCupom: dadosTiposCupom,
      horariosUso: dadosHorariosUso,
      desempenho: dadosDesempenho,
      topClientes: dadosTopClientes,
    });
  };

  const calcularMetricas = () => {
    const totalUsos = usos.length;
    const totalDescontos = usos.reduce((acc, uso) => acc + (uso.valorDesconto || 0), 0);
    const mediaDesconto = totalUsos > 0 ? totalDescontos / totalUsos : 0;
    const cuponsAtivos = cupons.filter(c => c.ativo).length;
    const taxaConversao = cuponsAtivos > 0 ? (totalUsos / cuponsAtivos) * 100 : 0;

    return {
      totalUsos,
      totalDescontos,
      mediaDesconto,
      cuponsAtivos,
      taxaConversao,
    };
  };

  const metricas = calcularMetricas();

  const handleExportar = (formato) => {
    if (formato === 'csv') {
      exportToCSV(usos, 'analise-cupons');
      toast.success('Dados exportados para CSV');
    } else if (formato === 'pdf') {
      exportToPDF('relatorio-cupons', 'Análise de Cupons');
      toast.success('Relatório PDF gerado');
    }
  };

  const handleVerDetalhesCupom = (cupomId) => {
    const cupom = cupons.find(c => c.id === cupomId);
    if (cupom) {
      setCupomSelecionado(cupom);
      setOpenDetalhesDialog(true);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
              Análise de Cupons
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Métricas e estatísticas de uso dos cupons de desconto
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
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
              
              <Grid item xs={12} md={periodo === 'personalizado' ? 3 : 6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cupom Específico</InputLabel>
                  <Select
                    value={filtroCupom}
                    label="Cupom Específico"
                    onChange={(e) => setFiltroCupom(e.target.value)}
                  >
                    <MenuItem value="todos">Todos os cupons</MenuItem>
                    {cupons.map(cupom => (
                      <MenuItem key={cupom.id} value={cupom.id}>
                        {cupom.codigo} - {cupom.descricao || ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Filtrar por cliente..."
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: filtroCliente && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setFiltroCliente('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Cards de Métricas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total de Usos
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {metricas.totalUsos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total em Descontos
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  R$ {metricas.totalDescontos.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Média por Uso
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  R$ {metricas.mediaDesconto.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Cupons Ativos
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {metricas.cuponsAtivos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Taxa de Conversão
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {metricas.taxaConversao.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs para os gráficos */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
              <Tab label="Usos por Período" />
              <Tab label="Cupons Mais Usados" />
              <Tab label="Distribuição por Tipo" />
              <Tab label="Horários de Uso" />
              <Tab label="Desempenho Financeiro" />
              <Tab label="Top Clientes" />
            </Tabs>

            {tabValue === 0 && (
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosGrafico.usosPorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="usos" stroke="#9c27b0" fill="#9c27b0" fillOpacity={0.3} name="Usos" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}

            {tabValue === 1 && (
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico.cuponsMaisUsados} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="nome" width={100} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="usos" fill="#9c27b0" name="Quantidade de Usos" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {tabValue === 2 && (
              <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGrafico.tiposCupom}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={entry => `${entry.name}: ${entry.value}`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosGrafico.tiposCupom.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}

            {tabValue === 3 && (
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico.horariosUso}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hora" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="usos" fill="#ff4081" name="Usos" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {tabValue === 4 && (
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dadosGrafico.desempenho}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="valor" fill="#4caf50" name="Valor dos Descontos (R$)" />
                    <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#ff9800" name="Tendência" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            )}

            {tabValue === 5 && (
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico.topClientes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="nome" width={120} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="usos" fill="#2196f3" name="Usos" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Detalhes */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Detalhamento por Cupom</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Cupom</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell align="right"><strong>Usos</strong></TableCell>
                    <TableCell align="right"><strong>Desconto Total</strong></TableCell>
                    <TableCell align="right"><strong>Ticket Médio</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dadosGrafico.cuponsMaisUsados.map((cupom, index) => {
                    const usosCupom = usos.filter(u => u.cupomId === cupom.id);
                    const totalDesconto = usosCupom.reduce((acc, u) => acc + (u.valorDesconto || 0), 0);
                    const ticketMedio = cupom.usos > 0 ? totalDesconto / cupom.usos : 0;

                    return (
                      <TableRow key={cupom.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                            {cupom.nome}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cupom.tipo === 'percentual' ? 'Percentual' :
                                  cupom.tipo === 'fixo' ? 'Valor Fixo' :
                                  cupom.tipo === 'frete' ? 'Frete Grátis' : 'Produto'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {cupom.tipo === 'percentual' ? `${cupom.valor}%` : `R$ ${cupom.valor?.toFixed(2)}`}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {cupom.usos}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ color: '#4caf50' }}>
                            R$ {totalDesconto.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          R$ {ticketMedio.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalhes">
                            <IconButton
                              size="small"
                              onClick={() => handleVerDetalhesCupom(cupom.id)}
                              sx={{ color: '#2196f3' }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Dialog de Detalhes do Cupom */}
        <Dialog open={openDetalhesDialog} onClose={() => setOpenDetalhesDialog(false)} maxWidth="md" fullWidth>
          {cupomSelecionado && (
            <>
              <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Detalhes do Cupom - {cupomSelecionado.codigo}</Typography>
                  <Chip
                    label={cupomSelecionado.ativo ? 'Ativo' : 'Inativo'}
                    size="small"
                    sx={{ bgcolor: cupomSelecionado.ativo ? '#4caf50' : '#f44336', color: 'white' }}
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Descrição</Typography>
                    <Typography variant="body1">{cupomSelecionado.descricao || 'Sem descrição'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Tipo</Typography>
                    <Typography variant="body1">
                      {cupomSelecionado.tipo === 'percentual' ? 'Percentual' :
                       cupomSelecionado.tipo === 'fixo' ? 'Valor Fixo' :
                       cupomSelecionado.tipo === 'frete' ? 'Frete Grátis' : 'Produto'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Valor do Desconto</Typography>
                    <Typography variant="h6" sx={{ color: '#4caf50' }}>
                      {cupomSelecionado.tipo === 'percentual' ? `${cupomSelecionado.valor}%` : `R$ ${cupomSelecionado.valor?.toFixed(2)}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Validade</Typography>
                    <Typography variant="body1">
                      {cupomSelecionado.dataFim ? new Date(cupomSelecionado.dataFim).toLocaleDateString('pt-BR') : 'Sem validade'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>Estatísticas de Uso</Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#9c27b0' }}>
                        {usos.filter(u => u.cupomId === cupomSelecionado.id).length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Total de Usos</Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#4caf50' }}>
                        R$ {usos.filter(u => u.cupomId === cupomSelecionado.id)
                          .reduce((acc, u) => acc + (u.valorDesconto || 0), 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Desconto Total</Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#ff9800' }}>
                        {cupomSelecionado.usoMaximo ? `${cupomSelecionado.usosAtuais || 0}/${cupomSelecionado.usoMaximo}` : 'Ilimitado'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Limite de Uso</Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                      Últimos Usos
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell align="right">Valor Original</TableCell>
                            <TableCell align="right">Desconto</TableCell>
                            <TableCell align="right">Valor Final</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {usos
                            .filter(u => u.cupomId === cupomSelecionado.id)
                            .slice(0, 5)
                            .map((uso, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{new Date(uso.data).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell>{uso.clienteNome || 'N/A'}</TableCell>
                                <TableCell align="right">R$ {(uso.valorOriginal || 0).toFixed(2)}</TableCell>
                                <TableCell align="right" sx={{ color: '#4caf50' }}>
                                  - R$ {(uso.valorDesconto || 0).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">R$ {(uso.valorFinal || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetalhesDialog(false)}>Fechar</Button>
              </DialogActions>
            </>
          )}
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
    </LocalizationProvider>
  );
}

export default AnaliseCupons;
