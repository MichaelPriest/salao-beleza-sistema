// src/pages/Anamnese/RelatorioAnamnese.js
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
  Avatar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../../services/firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
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
} from 'recharts';

const COLORS = ['#9c27b0', '#ff4081', '#4caf50', '#2196f3', '#ff9800', '#f44336', '#00bcd4'];

function RelatorioAnamnese() {
  const [loading, setLoading] = useState(true);
  const [formularios, setFormularios] = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [periodo, setPeriodo] = useState('mes');
  const [dataInicio, setDataInicio] = useState(startOfMonth(new Date()));
  const [dataFim, setDataFim] = useState(endOfMonth(new Date()));
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dados processados para gráficos
  const [estatisticas, setEstatisticas] = useState({
    totalFormularios: 0,
    totalRespostas: 0,
    taxaResposta: 0,
    pendentes: 0,
    respondidos: 0,
    visualizados: 0,
    arquivados: 0,
  });

  const [dadosGrafico, setDadosGrafico] = useState({
    respostasPorDia: [],
    formulariosMaisUsados: [],
    respostasPorStatus: [],
    clientesPorFormulario: [],
    tempoMedioResposta: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    processarDados();
  }, [formularios, respostas, clientes, dataInicio, dataFim]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [formulariosData, respostasData, clientesData] = await Promise.all([
        firebaseService.getAll('formularios_anamnese').catch(() => []),
        firebaseService.getAll('respostas_anamnese').catch(() => []),
        firebaseService.getAll('clientes').catch(() => [])
      ]);

      setFormularios(formulariosData || []);
      setRespostas(respostasData || []);
      setClientes(clientesData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const processarDados = () => {
    // Filtrar respostas por período
    const respostasFiltradas = respostas.filter(r => {
      const data = new Date(r.respondidoEm || r.criadoEm);
      return data >= dataInicio && data <= dataFim;
    });

    // Estatísticas gerais
    const totalFormularios = formularios.length;
    const totalRespostas = respostasFiltradas.length;
    const pendentes = respostasFiltradas.filter(r => r.status === 'pendente').length;
    const respondidos = respostasFiltradas.filter(r => r.status === 'respondido').length;
    const visualizados = respostasFiltradas.filter(r => r.status === 'visto').length;
    const arquivados = respostasFiltradas.filter(r => r.status === 'arquivado').length;

    // Taxa de resposta
    const taxaResposta = totalFormularios > 0 
      ? (totalRespostas / totalFormularios) * 100 
      : 0;

    setEstatisticas({
      totalFormularios,
      totalRespostas,
      taxaResposta,
      pendentes,
      respondidos,
      visualizados,
      arquivados,
    });

    // Respostas por dia
    const respostasPorDia = {};
    respostasFiltradas.forEach(r => {
      const data = format(new Date(r.respondidoEm || r.criadoEm), 'dd/MM');
      respostasPorDia[data] = (respostasPorDia[data] || 0) + 1;
    });

    const dadosRespostasPorDia = Object.entries(respostasPorDia)
      .map(([data, quantidade]) => ({ data, quantidade }))
      .sort((a, b) => {
        const [d1, m1] = a.data.split('/');
        const [d2, m2] = b.data.split('/');
        return new Date(2024, parseInt(m1) - 1, parseInt(d1)) - new Date(2024, parseInt(m2) - 1, parseInt(d2));
      });

    // Formulários mais usados
    const usosPorFormulario = {};
    respostasFiltradas.forEach(r => {
      if (r.formularioId) {
        usosPorFormulario[r.formularioId] = (usosPorFormulario[r.formularioId] || 0) + 1;
      }
    });

    const formulariosMaisUsados = Object.entries(usosPorFormulario)
      .map(([id, qtd]) => {
        const formulario = formularios.find(f => f.id === id);
        return {
          id,
          nome: formulario?.titulo || 'Desconhecido',
          quantidade: qtd
        };
      })
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    // Respostas por status
    const respostasPorStatus = [
      { name: 'Pendente', value: pendentes, color: '#ff9800' },
      { name: 'Respondido', value: respondidos, color: '#2196f3' },
      { name: 'Visualizado', value: visualizados, color: '#4caf50' },
      { name: 'Arquivado', value: arquivados, color: '#9e9e9e' },
    ].filter(item => item.value > 0);

    // Clientes que mais respondem
    const clientesPorResposta = {};
    respostasFiltradas.forEach(r => {
      if (r.clienteId) {
        clientesPorResposta[r.clienteId] = (clientesPorResposta[r.clienteId] || 0) + 1;
      }
    });

    const clientesTop = Object.entries(clientesPorResposta)
      .map(([id, qtd]) => {
        const cliente = clientes.find(c => c.id === id);
        return {
          id,
          nome: cliente?.nome || 'Cliente',
          quantidade: qtd
        };
      })
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    setDadosGrafico({
      respostasPorDia: dadosRespostasPorDia,
      formulariosMaisUsados,
      respostasPorStatus,
      clientesPorFormulario: clientesTop,
    });

  };

  const handleExportar = (formato) => {
    if (formato === 'csv') {
      // Gerar CSV
      const dados = respostas.map(r => ({
        Cliente: r.clienteNome,
        Formulário: formularios.find(f => f.id === r.formularioId)?.titulo,
        'Data Resposta': format(new Date(r.respondidoEm || r.criadoEm), 'dd/MM/yyyy'),
        Status: r.status,
        'Nº Respostas': r.respostas?.length || 0
      }));

      const csvContent = [
        Object.keys(dados[0] || {}).join(','),
        ...dados.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-anamnese-${format(new Date(), 'yyyyMMdd')}.csv`;
      a.click();
      
      toast.success('Relatório exportado com sucesso!');
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
              Relatórios de Anamnese
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Análise estatística dos formulários respondidos
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

        {/* Filtro de período */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={periodo}
                    label="Período"
                    onChange={(e) => setPeriodo(e.target.value)}
                  >
                    <MenuItem value="hoje">Hoje</MenuItem>
                    <MenuItem value="semana">Últimos 7 dias</MenuItem>
                    <MenuItem value="mes">Este mês</MenuItem>
                    <MenuItem value="personalizado">Personalizado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {periodo === 'personalizado' && (
                <>
                  <Grid item xs={12} md={4}>
                    <DatePicker
                      label="Data Início"
                      value={dataInicio}
                      onChange={setDataInicio}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DatePicker
                      label="Data Fim"
                      value={dataFim}
                      onChange={setDataFim}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Cards de estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total de Formulários
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {estatisticas.totalFormularios}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total de Respostas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {estatisticas.totalRespostas}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Taxa de Resposta
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {estatisticas.taxaResposta.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Pendentes
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {estatisticas.pendentes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Média por Dia
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {(estatisticas.totalRespostas / 30).toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
              <Tab label="Respostas por Período" />
              <Tab label="Formulários Mais Usados" />
              <Tab label="Status das Respostas" />
              <Tab label="Top Clientes" />
            </Tabs>

            {tabValue === 0 && (
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosGrafico.respostasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="quantidade" stroke="#9c27b0" name="Respostas" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {tabValue === 1 && (
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico.formulariosMaisUsados}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="quantidade" fill="#ff4081" name="Quantidade de usos" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {tabValue === 2 && (
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGrafico.respostasPorStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={entry => `${entry.name}: ${entry.value}`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosGrafico.respostasPorStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                  <BarChart data={dadosGrafico.clientesPorFormulario} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="nome" width={120} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="quantidade" fill="#4caf50" name="Respostas" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Tabela detalhada */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Detalhamento por Formulário</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Formulário</strong></TableCell>
                    <TableCell><strong>Total Respostas</strong></TableCell>
                    <TableCell><strong>Pendentes</strong></TableCell>
                    <TableCell><strong>Respondidos</strong></TableCell>
                    <TableCell><strong>Visualizados</strong></TableCell>
                    <TableCell><strong>Arquivados</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formularios.map((form) => {
                    const respostasForm = respostas.filter(r => r.formularioId === form.id);
                    const pendentes = respostasForm.filter(r => r.status === 'pendente').length;
                    const respondidos = respostasForm.filter(r => r.status === 'respondido').length;
                    const visualizados = respostasForm.filter(r => r.status === 'visto').length;
                    const arquivados = respostasForm.filter(r => r.status === 'arquivado').length;

                    return (
                      <TableRow key={form.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {form.titulo}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{respostasForm.length}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={pendentes}
                            size="small"
                            sx={{ bgcolor: '#ff9800', color: 'white' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={respondidos}
                            size="small"
                            sx={{ bgcolor: '#2196f3', color: 'white' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={visualizados}
                            size="small"
                            sx={{ bgcolor: '#4caf50', color: 'white' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={arquivados}
                            size="small"
                            sx={{ bgcolor: '#9e9e9e', color: 'white' }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

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

export default RelatorioAnamnese;
