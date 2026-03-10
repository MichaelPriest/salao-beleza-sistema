// src/pages/HistoricoAtendimentos.js
import React, { useState, useEffect, useRef } from 'react';
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
  Avatar,
  Rating,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { 
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot 
} from '@mui/lab';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';
import { ImprimirHistorico } from '../components/ImprimirHistorico';

const statusColors = {
  realizado: { color: '#4caf50', label: 'Realizado' },
  cancelado: { color: '#f44336', label: 'Cancelado' },
  remarcado: { color: '#ff9800', label: 'Remarcado' },
  faltou: { color: '#9e9e9e', label: 'Faltou' },
  finalizado: { color: '#4caf50', label: 'Finalizado' },
  em_andamento: { color: '#ff9800', label: 'Em Andamento' },
};

function HistoricoAtendimentos() {
  const componentRef = useRef();
  const [loading, setLoading] = useState(true);
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('todos');
  const [filtroProfissional, setFiltroProfissional] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    carregarDados();
  }, []);

  // Função de impressão
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `historico_atendimentos_${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      toast.loading('Preparando impressão...', { id: 'print' });
    },
    onAfterPrint: () => {
      toast.success('Impressão enviada!', { id: 'print' });
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      toast.error('Erro ao imprimir', { id: 'print' });
    }
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [atendimentosData, clientesData, profissionaisData, servicosData] = await Promise.all([
        firebaseService.getAll('atendimentos').catch(() => []),
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
      ]);
      
      const atendimentosFinalizados = atendimentosData.filter(a => 
        a.status === 'finalizado' || a.status === 'cancelado'
      );
      
      console.log('📊 Atendimentos carregados:', atendimentosFinalizados.length);
      
      setAtendimentos(atendimentosFinalizados || []);
      setClientes(clientesData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);
      
      if (atendimentosFinalizados.length === 0) {
        toast.info('Nenhum atendimento finalizado encontrado');
      } else {
        toast.success(`${atendimentosFinalizados.length} atendimentos carregados!`);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getClienteNome = (clienteId) => {
    if (!clienteId) return 'Cliente não identificado';
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || 'Cliente não encontrado';
  };

  const getProfissionalNome = (profissionalId) => {
    if (!profissionalId) return 'Profissional não identificado';
    const profissional = profissionais.find(p => p.id === profissionalId);
    return profissional?.nome || 'Profissional não encontrado';
  };

  const getServicosNomes = (atendimento) => {
    if (atendimento.itensServico && atendimento.itensServico.length > 0) {
      return atendimento.itensServico.map(item => item.nome);
    } else if (atendimento.servicoId) {
      const servico = servicos.find(s => s.id === atendimento.servicoId);
      return [servico?.nome || 'Serviço não encontrado'];
    }
    return [];
  };

  const getValorTotal = (atendimento) => {
    if (atendimento.valorTotal) return atendimento.valorTotal;
    
    if (atendimento.itensServico && atendimento.itensServico.length > 0) {
      return atendimento.itensServico.reduce((acc, item) => acc + (item.preco || 0), 0);
    } else if (atendimento.servicoId) {
      const servico = servicos.find(s => s.id === atendimento.servicoId);
      return servico?.preco || 0;
    }
    return 0;
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDetalhes = (atendimento) => {
    setAtendimentoSelecionado(atendimento);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setAtendimentoSelecionado(null);
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Data', 'Cliente', 'Profissional', 'Serviços', 'Valor', 'Status', 'Observações'];
      const data = atendimentosFiltrados.map(a => [
        new Date(a.data).toLocaleDateString('pt-BR'),
        getClienteNome(a.clienteId),
        getProfissionalNome(a.profissionalId),
        getServicosNomes(a).join(', '),
        getValorTotal(a).toFixed(2),
        a.status,
        a.observacoes || '',
      ]);

      const csvContent = [headers, ...data]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `historico_atendimentos_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      mostrarSnackbar('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar relatório', 'error');
    }
  };

  // Filtrar atendimentos
  const atendimentosFiltrados = atendimentos.filter(atendimento => {
    const clienteNome = getClienteNome(atendimento.clienteId);
    const profissionalNome = getProfissionalNome(atendimento.profissionalId);
    const servicosNomes = getServicosNomes(atendimento);
    
    const matchesTexto = filtro === '' || 
      clienteNome.toLowerCase().includes(filtro.toLowerCase()) ||
      profissionalNome.toLowerCase().includes(filtro.toLowerCase()) ||
      servicosNomes.some(s => s?.toLowerCase().includes(filtro.toLowerCase()));

    const matchesCliente = filtroCliente === 'todos' || atendimento.clienteId === filtroCliente;
    const matchesProfissional = filtroProfissional === 'todos' || atendimento.profissionalId === filtroProfissional;

    let matchesPeriodo = true;
    if (filtroPeriodo === 'hoje') {
      const hoje = new Date().toISOString().split('T')[0];
      matchesPeriodo = atendimento.data === hoje;
    } else if (filtroPeriodo === 'semana') {
      const dataAtend = new Date(atendimento.data);
      const umaSemanaAtras = new Date();
      umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
      matchesPeriodo = dataAtend >= umaSemanaAtras;
    } else if (filtroPeriodo === 'mes') {
      const dataAtend = new Date(atendimento.data);
      const umMesAtras = new Date();
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);
      matchesPeriodo = dataAtend >= umMesAtras;
    } else if (filtroPeriodo === 'personalizado') {
      const dataAtend = new Date(atendimento.data);
      matchesPeriodo = dataAtend >= new Date(dataInicio) && dataAtend <= new Date(dataFim);
    }

    return matchesTexto && matchesCliente && matchesProfissional && matchesPeriodo;
  });

  // Paginação
  const paginatedAtendimentos = atendimentosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Estatísticas
  const stats = {
    total: atendimentosFiltrados.length,
    realizados: atendimentosFiltrados.filter(a => a.status === 'finalizado' || a.status === 'realizado').length,
    cancelados: atendimentosFiltrados.filter(a => a.status === 'cancelado').length,
    remarcados: atendimentosFiltrados.filter(a => a.status === 'remarcado').length,
    faltas: atendimentosFiltrados.filter(a => a.status === 'faltou').length,
    valorTotal: atendimentosFiltrados
      .filter(a => a.status === 'finalizado' || a.status === 'realizado')
      .reduce((acc, a) => acc + (getValorTotal(a) || 0), 0),
  };

  const formatarDataFirebase = (data) => {
    if (!data) return '';
    if (data.toDate) {
      return data.toDate().toLocaleDateString('pt-BR');
    }
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarHoraFirebase = (hora) => {
    if (!hora) return '';
    if (hora.toDate) {
      return hora.toDate().toLocaleTimeString('pt-BR');
    }
    return hora;
  };

  const getPeriodoTexto = () => {
    if (filtroPeriodo === 'hoje') return 'Hoje';
    if (filtroPeriodo === 'semana') return 'Últimos 7 dias';
    if (filtroPeriodo === 'mes') return 'Últimos 30 dias';
    if (filtroPeriodo === 'personalizado') return `${dataInicio} a ${dataFim}`;
    return 'Todos os períodos';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Histórico de Atendimentos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualize todo o histórico de atendimentos realizados
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total no Período
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Realizados
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.realizados}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Cancelados
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {stats.cancelados}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Faturamento
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  R$ {stats.valorTotal.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por cliente, profissional ou serviço..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  label="Cliente"
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  {clientes.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Profissional</InputLabel>
                <Select
                  value={filtroProfissional}
                  onChange={(e) => setFiltroProfissional(e.target.value)}
                  label="Profissional"
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  {profissionais.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Período</InputLabel>
                <Select
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                  label="Período"
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="semana">Últimos 7 dias</MenuItem>
                  <MenuItem value="mes">Últimos 30 dias</MenuItem>
                  <MenuItem value="personalizado">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={carregarDados}
              >
                Atualizar
              </Button>
            </Grid>

            {filtroPeriodo === 'personalizado' && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data Início"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data Fim"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Timeline de Atendimentos */}
      {paginatedAtendimentos.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Linha do Tempo
            </Typography>
            <Timeline position="alternate">
              {paginatedAtendimentos.slice(0, 5).map((atendimento, index) => {
                const status = atendimento.status === 'finalizado' ? 'realizado' : atendimento.status;
                return (
                  <TimelineItem key={atendimento.id}>
                    <TimelineSeparator>
                      <TimelineDot color={
                        status === 'realizado' ? 'success' :
                        status === 'cancelado' ? 'error' :
                        status === 'remarcado' ? 'warning' : 'grey'
                      }>
                        {status === 'realizado' ? <CheckCircleIcon /> :
                         status === 'cancelado' ? <CancelIcon /> :
                         <ScheduleIcon />}
                      </TimelineDot>
                      {index < paginatedAtendimentos.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="subtitle2">
                          {formatarDataFirebase(atendimento.data)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>{getClienteNome(atendimento.clienteId)}</strong> - {getProfissionalNome(atendimento.profissionalId)}
                        </Typography>
                        <Chip
                          size="small"
                          label={statusColors[status]?.label || status}
                          sx={{
                            mt: 1,
                            bgcolor: `${statusColors[status]?.color}20`,
                            color: statusColors[status]?.color,
                          }}
                        />
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Atendimentos */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Data</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Profissional</TableCell>
                <TableCell>Serviços</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {paginatedAtendimentos.map((atendimento, index) => {
                  const status = atendimento.status === 'finalizado' ? 'realizado' : atendimento.status;
                  
                  return (
                    <motion.tr
                      key={atendimento.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>
                        {formatarDataFirebase(atendimento.data)}
                        <Typography variant="caption" display="block" color="textSecondary">
                          {atendimento.horaInicio} - {atendimento.horaFim}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#9c27b0' }}>
                            <PersonIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{getClienteNome(atendimento.clienteId)}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{getProfissionalNome(atendimento.profissionalId)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {getServicosNomes(atendimento).map((servico, i) => (
                            <Chip
                              key={i}
                              label={servico}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                          R$ {getValorTotal(atendimento).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusColors[status]?.label || status}
                          size="small"
                          sx={{
                            bgcolor: `${statusColors[status]?.color}20`,
                            color: statusColors[status]?.color,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver Detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDetalhes(atendimento)}
                            sx={{ color: '#9c27b0' }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {paginatedAtendimentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      Nenhum atendimento encontrado no período
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={atendimentosFiltrados.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes do Atendimento
        </DialogTitle>
        <DialogContent>
          {atendimentoSelecionado && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Informações Gerais
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: '#9c27b0' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{getClienteNome(atendimentoSelecionado.clienteId)}</Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Data</Typography>
                        <Typography variant="body2">
                          {formatarDataFirebase(atendimentoSelecionado.data)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Horário</Typography>
                        <Typography variant="body2">
                          {atendimentoSelecionado.horaInicio} - {atendimentoSelecionado.horaFim}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Profissional</Typography>
                        <Typography variant="body2">{getProfissionalNome(atendimentoSelecionado.profissionalId)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Chip
                          size="small"
                          label={statusColors[atendimentoSelecionado.status]?.label || atendimentoSelecionado.status}
                          sx={{
                            bgcolor: `${statusColors[atendimentoSelecionado.status]?.color}20`,
                            color: statusColors[atendimentoSelecionado.status]?.color,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Serviços Realizados
                    </Typography>
                    
                    {atendimentoSelecionado.itensServico?.map((servico, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{servico.nome}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          R$ {servico.preco?.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">Total</Typography>
                      <Typography variant="h6" sx={{ color: '#4caf50' }}>
                        R$ {getValorTotal(atendimentoSelecionado).toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Observações
                    </Typography>
                    <Typography variant="body2">
                      {atendimentoSelecionado.observacoes || 'Sem observações'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <ImprimirHistorico
          ref={componentRef}
          atendimentos={atendimentosFiltrados}
          clienteNome="Todos os Clientes"
          periodo={getPeriodoTexto()}
        />
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default HistoricoAtendimentos;
