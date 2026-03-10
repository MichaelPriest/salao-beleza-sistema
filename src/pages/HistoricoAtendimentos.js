// src/pages/HistoricoAtendimentos.js
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
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';

const statusColors = {
  realizado: { color: '#4caf50', label: 'Realizado' },
  cancelado: { color: '#f44336', label: 'Cancelado' },
  remarcado: { color: '#ff9800', label: 'Remarcado' },
  faltou: { color: '#9e9e9e', label: 'Faltou' },
};

function HistoricoAtendimentos() {
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

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [atendimentosData, clientesData, profissionaisData, servicosData] = await Promise.all([
        firebaseService.getAll('historico_atendimentos').catch(() => []),
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
      ]);
      
      setAtendimentos(atendimentosData || []);
      setClientes(clientesData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
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
        a.cliente,
        a.profissional,
        a.servicos?.join(', '),
        a.valor?.toFixed(2),
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
    const matchesTexto = filtro === '' || 
      atendimento.cliente?.toLowerCase().includes(filtro.toLowerCase()) ||
      atendimento.profissional?.toLowerCase().includes(filtro.toLowerCase()) ||
      atendimento.servicos?.some(s => s?.toLowerCase().includes(filtro.toLowerCase()));

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
    realizados: atendimentosFiltrados.filter(a => a.status === 'realizado').length,
    cancelados: atendimentosFiltrados.filter(a => a.status === 'cancelado').length,
    remarcados: atendimentosFiltrados.filter(a => a.status === 'remarcado').length,
    faltas: atendimentosFiltrados.filter(a => a.status === 'faltou').length,
    valorTotal: atendimentosFiltrados
      .filter(a => a.status === 'realizado')
      .reduce((acc, a) => acc + (a.valor || 0), 0),
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
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
        >
          Exportar Relatório
        </Button>
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
                  Total
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
                  Remarcados
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {stats.remarcados}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
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
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Linha do Tempo
          </Typography>
          <Timeline position="alternate">
            {paginatedAtendimentos.slice(0, 5).map((atendimento, index) => (
              <TimelineItem key={atendimento.id}>
                <TimelineSeparator>
                  <TimelineDot color={
                    atendimento.status === 'realizado' ? 'success' :
                    atendimento.status === 'cancelado' ? 'error' :
                    atendimento.status === 'remarcado' ? 'warning' : 'grey'
                  }>
                    {atendimento.status === 'realizado' ? <CheckCircleIcon /> :
                     atendimento.status === 'cancelado' ? <CancelIcon /> :
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
                      <strong>{atendimento.cliente}</strong> - {atendimento.profissional}
                    </Typography>
                    <Chip
                      size="small"
                      label={statusColors[atendimento.status]?.label}
                      sx={{
                        mt: 1,
                        bgcolor: `${statusColors[atendimento.status]?.color}20`,
                        color: statusColors[atendimento.status]?.color,
                      }}
                    />
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </CardContent>
      </Card>

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
                {paginatedAtendimentos.map((atendimento, index) => (
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
                          <Typography variant="body2">{atendimento.cliente}</Typography>
                          {atendimento.avaliacao && (
                            <Rating value={atendimento.avaliacao} size="small" readOnly />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{atendimento.profissional}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {atendimento.servicos?.map((servico, i) => (
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
                        R$ {atendimento.valor?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusColors[atendimento.status]?.label}
                        size="small"
                        sx={{
                          bgcolor: `${statusColors[atendimento.status]?.color}20`,
                          color: statusColors[atendimento.status]?.color,
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
                ))}
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
                        <Typography variant="h6">{atendimentoSelecionado.cliente}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {atendimentoSelecionado.clienteEmail}
                        </Typography>
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
                        <Typography variant="body2">{atendimentoSelecionado.profissional}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Chip
                          size="small"
                          label={statusColors[atendimentoSelecionado.status]?.label}
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
                    
                    {atendimentoSelecionado.servicos?.map((servico, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{servico}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          R$ {atendimentoSelecionado.valores?.[index]?.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">Total</Typography>
                      <Typography variant="h6" sx={{ color: '#4caf50' }}>
                        R$ {atendimentoSelecionado.valor?.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="textSecondary">Forma de Pagamento</Typography>
                      <Typography variant="body2">{atendimentoSelecionado.formaPagamento}</Typography>
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

                    {atendimentoSelecionado.avaliacao && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Avaliação do Cliente
                        </Typography>
                        <Rating value={atendimentoSelecionado.avaliacao} readOnly />
                        {atendimentoSelecionado.comentario && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            "{atendimentoSelecionado.comentario}"
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default HistoricoAtendimentos;
