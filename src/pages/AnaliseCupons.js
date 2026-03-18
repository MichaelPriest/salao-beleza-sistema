// src/pages/AnaliseCupons.js
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
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
import { auditoriaService } from '../services/auditoriaService'; // 🔥 ADICIONADO
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
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
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';

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
  
  // 🔥 Estado para usuário atual
  const [usuario, setUsuario] = useState(null);

  // Dados processados para gráficos
  const [dadosGrafico, setDadosGrafico] = useState({
    usosPorDia: [],
    cuponsMaisUsados: [],
    tiposCupom: [],
    horariosUso: [],
    desempenho: [],
    topClientes: [],
  });

  // 🔥 Carregar usuário atual
  useEffect(() => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        setUsuario(JSON.parse(usuarioStr));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    processarDados();
  }, [cupons, usos, periodo, dataInicio, dataFim, filtroCupom]);

  // 🔥 Função para registrar auditoria
  const registrarAuditoria = async (acao, entidadeId, detalhes, dados = {}) => {
    try {
      await auditoriaService.registrar(acao, {
        entidade: 'analise_cupons',
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
      
      // 🔥 LOG TÉCNICO
      await firebaseService.log('info', 'Carregando dados de análise de cupons');
      
      const [cuponsData, usosData, clientesData] = await Promise.all([
        cupomService.listarCupons(),
        firebaseService.getAll('usos_cupons').catch(() => []),
        firebaseService.getAll('clientes').catch(() => [])
      ]);
      
      setCupons(cuponsData || []);
      setUsos(usosData || []);
      setClientes(clientesData || []);
      
      // 🔥 AUDITORIA
      await registrarAuditoria(
        'carregar_analise_cupons',
        'analise',
        'Análise de cupons carregada',
        { totalCupons: cuponsData?.length, totalUsos: usosData?.length }
      );
      
      // 🔥 LOG TÉCNICO
      await firebaseService.log('success', 'Dados de análise carregados', {
        totalCupons: cuponsData?.length,
        totalUsos: usosData?.length
      });
      
      toast.success('Dados carregados!');
    } catch (error) {
      // 🔥 LOG DE ERRO
      await firebaseService.log('error', 'Erro ao carregar dados de análise', {
        error: error.message
      });
      
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNÇÃO CORRIGIDA - com async adicionado
  const processarDados = async () => {
    try {
      // Definir intervalo de datas
      let inicio = null;
      let fim = new Date();
  
      if (periodo === 'hoje') {
        inicio = startOfDay(new Date());
      } else if (periodo === 'ontem') {
        inicio = startOfDay(subDays(new Date(), 1));
        fim = endOfDay(subDays(new Date(), 1));
      } else if (periodo === 'ultimos7') {
        inicio = subDays(new Date(), 7);
      } else if (periodo === 'ultimos30') {
        inicio = subDays(new Date(), 30);
      } else if (periodo === 'esteMes') {
        inicio = startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
      } else if (periodo === 'mesPassado') {
        inicio = startOfDay(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
        fim = endOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 0));
      } else if (periodo === 'personalizado' && dataInicio && dataFim) {
        inicio = startOfDay(new Date(dataInicio));
        fim = endOfDay(new Date(dataFim));
      }
  
      // Filtrar usos pelo período
      let usosFiltrados = usos;
      if (inicio && fim) {
        usosFiltrados = usos.filter(uso => {
          const dataUso = uso.data ? new Date(uso.data) : null;
          return dataUso && dataUso >= inicio && dataUso <= fim;
        });
      }
  
      // Filtrar por cupom específico
      if (filtroCupom !== 'todos') {
        usosFiltrados = usosFiltrados.filter(uso => uso.cupomId === filtroCupom);
      }
  
      // Filtrar por cliente
      if (filtroCliente) {
        usosFiltrados = usosFiltrados.filter(uso => 
          uso.clienteNome?.toLowerCase().includes(filtroCliente.toLowerCase())
        );
      }
  
      // Processar usos por dia
      const usosPorDia = {};
      usosFiltrados.forEach(uso => {
        if (uso.data) {
          const dataStr = format(new Date(uso.data), 'dd/MM');
          usosPorDia[dataStr] = (usosPorDia[dataStr] || 0) + 1;
        }
      });
  
      const dadosUsosPorDia = Object.entries(usosPorDia).map(([data, usos]) => ({
        data,
        usos
      })).sort((a, b) => {
        const [diaA, mesA] = a.data.split('/').map(Number);
        const [diaB, mesB] = b.data.split('/').map(Number);
        return mesA === mesB ? diaA - diaB : mesA - mesB;
      });
  
      // Processar cupons mais usados
      const usosPorCupom = {};
      usosFiltrados.forEach(uso => {
        if (uso.cupomId) {
          usosPorCupom[uso.cupomId] = (usosPorCupom[uso.cupomId] || 0) + 1;
        }
      });
  
      const cuponsMaisUsados = Object.entries(usosPorCupom)
        .map(([cupomId, qtd]) => {
          const cupom = cupons.find(c => c.id === cupomId) || { codigo: 'Desconhecido', tipo: 'fixo', valor: 0 };
          return {
            id: cupomId,
            nome: cupom.codigo,
            tipo: cupom.tipo,
            valor: cupom.valor,
            usos: qtd
          };
        })
        .sort((a, b) => b.usos - a.usos)
        .slice(0, 10);
  
      // Processar tipos de cupom
      const tiposCupom = {};
      usosFiltrados.forEach(uso => {
        const cupom = cupons.find(c => c.id === uso.cupomId);
        const tipo = cupom?.tipo || 'desconhecido';
        tiposCupom[tipo] = (tiposCupom[tipo] || 0) + 1;
      });
  
      const dadosTiposCupom = Object.entries(tiposCupom).map(([tipo, qtd]) => ({
        name: tipo === 'percentual' ? 'Percentual' :
              tipo === 'fixo' ? 'Valor Fixo' :
              tipo === 'frete' ? 'Frete Grátis' :
              tipo === 'produto' ? 'Produto' : 'Outros',
        value: qtd
      }));
  
      // Processar horários de uso
      const horariosUso = {};
      usosFiltrados.forEach(uso => {
        if (uso.data) {
          const hora = format(new Date(uso.data), 'HH:00');
          horariosUso[hora] = (horariosUso[hora] || 0) + 1;
        }
      });
  
      const dadosHorariosUso = Object.entries(horariosUso)
        .map(([hora, qtd]) => ({ hora, usos: qtd }))
        .sort((a, b) => a.hora.localeCompare(b.hora));
  
      // Processar desempenho financeiro
      const desempenho = dadosUsosPorDia.map(item => {
        const usosNoDia = usosFiltrados.filter(uso => {
          return uso.data && format(new Date(uso.data), 'dd/MM') === item.data;
        });
        
        const valorTotal = usosNoDia.reduce((acc, uso) => acc + (uso.valorDesconto || 0), 0);
        
        return {
          data: item.data,
          valor: valorTotal
        };
      });
  
      // Processar top clientes
      const usosPorCliente = {};
      usosFiltrados.forEach(uso => {
        const clienteNome = uso.clienteNome || 'Desconhecido';
        usosPorCliente[clienteNome] = (usosPorCliente[clienteNome] || 0) + 1;
      });
  
      const topClientes = Object.entries(usosPorCliente)
        .map(([nome, usos]) => ({ nome, usos }))
        .sort((a, b) => b.usos - a.usos)
        .slice(0, 10);
  
      setDadosGrafico({
        usosPorDia: dadosUsosPorDia,
        cuponsMaisUsados,
        tiposCupom: dadosTiposCupom,
        horariosUso: dadosHorariosUso,
        desempenho,
        topClientes,
      });
  
      // 🔥 LOG TÉCNICO - agora funciona com await
      await firebaseService.log('info', 'Dados processados para análise', {
        totalUsosFiltrados: usosFiltrados.length,
        periodo: periodo
      });
  
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      
      // 🔥 LOG DE ERRO
      await firebaseService.log('error', 'Erro ao processar dados de análise', {
        error: error.message
      });
    }
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

  const handleExportar = async (formato) => {
    try {
      // 🔥 LOG TÉCNICO
      await firebaseService.log('info', `Exportando dados para ${formato}`);
      
      if (formato === 'csv') {
        const dadosExport = usos.map(uso => {
          const cupom = cupons.find(c => c.id === uso.cupomId);
          return {
            Data: uso.data ? new Date(uso.data).toLocaleDateString('pt-BR') : '',
            Cupom: cupom?.codigo || '',
            Cliente: uso.clienteNome || '',
            'Valor Original': uso.valorOriginal || 0,
            Desconto: uso.valorDesconto || 0,
            'Valor Final': uso.valorFinal || 0,
          };
        });

        const csvContent = [
          Object.keys(dadosExport[0] || {}).join(','),
          ...dadosExport.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analise-cupons-${format(new Date(), 'yyyyMMdd')}.csv`;
        link.click();
        
        // 🔥 AUDITORIA
        await registrarAuditoria(
          'exportar_analise_cupons',
          'exportacao',
          `Dados exportados para CSV`,
          { totalRegistros: usos.length }
        );
        
        toast.success('Dados exportados para CSV');
      } else if (formato === 'json') {
        const dadosExport = {
          exportadoEm: new Date().toISOString(),
          metricas,
          usos,
          cupons
        };
        
        const blob = new Blob([JSON.stringify(dadosExport, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analise-cupons-${format(new Date(), 'yyyyMMdd')}.json`;
        link.click();
        
        // 🔥 AUDITORIA
        await registrarAuditoria(
          'exportar_analise_cupons',
          'exportacao',
          `Dados exportados para JSON`,
          { totalRegistros: usos.length }
        );
        
        toast.success('Dados exportados para JSON');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      
      // 🔥 LOG DE ERRO
      await firebaseService.log('error', 'Erro ao exportar dados', {
        error: error.message,
        formato
      });
      
      toast.error('Erro ao exportar dados');
    }
  };

  const handleVerDetalhesCupom = async (cupomId) => {
    const cupom = cupons.find(c => c.id === cupomId);
    if (cupom) {
      setCupomSelecionado(cupom);
      setOpenDetalhesDialog(true);
      
      // 🔥 AUDITORIA
      await registrarAuditoria(
        'visualizar_detalhes_cupom',
        cupomId,
        `Detalhes do cupom ${cupom.codigo} visualizados`
      );
      
      // 🔥 LOG TÉCNICO
      await firebaseService.log('info', 'Detalhes de cupom visualizados', {
        cupomId,
        cupomCodigo: cupom.codigo
      });
    }
  };

  const handleRefresh = async () => {
    // 🔥 LOG TÉCNICO
    await firebaseService.log('info', 'Atualização manual de dados');
    await carregarDados();
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
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExportar('json')}
            >
              Exportar JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
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
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="valor" fill="#4caf50" name="Valor dos Descontos (R$)" />
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
                  
                  {dadosGrafico.cuponsMaisUsados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <TagIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="body1" color="textSecondary">
                          Nenhum dado encontrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
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
                                <TableCell>{uso.data ? new Date(uso.data).toLocaleDateString('pt-BR') : '-'}</TableCell>
                                <TableCell>{uso.clienteNome || 'N/A'}</TableCell>
                                <TableCell align="right">R$ {(uso.valorOriginal || 0).toFixed(2)}</TableCell>
                                <TableCell align="right" sx={{ color: '#4caf50' }}>
                                  - R$ {(uso.valorDesconto || 0).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">R$ {(uso.valorFinal || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          {usos.filter(u => u.cupomId === cupomSelecionado.id).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                                Nenhum uso registrado
                              </TableCell>
                            </TableRow>
                          )}
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
