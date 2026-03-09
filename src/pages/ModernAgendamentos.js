import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import api from '../services/api';

const statusColors = {
  confirmado: { color: '#4caf50', label: 'Confirmado', icon: <CheckCircleIcon /> },
  pendente: { color: '#ff9800', label: 'Pendente', icon: <WarningIcon /> },
  cancelado: { color: '#f44336', label: 'Cancelado', icon: <CancelIcon /> },
  realizado: { color: '#9c27b0', label: 'Realizado', icon: <CheckCircleIcon /> },
};

function ModernAgendamentos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  
  // Filtros
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroProfissional, setFiltroProfissional] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoje');
  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    profissionalId: '',
    servicoId: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    horario: '09:00',
    observacoes: '',
    status: 'pendente',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [agendamentosRes, clientesRes, profissionaisRes, servicosRes] = await Promise.all([
        api.get('/agendamentos'),
        api.get('/clientes'),
        api.get('/profissionais'),
        api.get('/servicos'),
      ]);
      
      setAgendamentos(agendamentosRes.data || []);
      setClientes(clientesRes.data || []);
      setProfissionais(profissionaisRes.data || []);
      setServicos(servicosRes.data || []);
      
      console.log('✅ Dados carregados');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (agendamento = null) => {
    if (agendamento) {
      setAgendamentoEditando(agendamento);
      setFormData({
        clienteId: agendamento.clienteId || '',
        profissionalId: agendamento.profissionalId || '',
        servicoId: agendamento.servicoId || '',
        data: agendamento.data || format(new Date(), 'yyyy-MM-dd'),
        horario: agendamento.horario || '09:00',
        observacoes: agendamento.observacoes || '',
        status: agendamento.status || 'pendente',
      });
    } else {
      setAgendamentoEditando(null);
      setFormData({
        clienteId: '',
        profissionalId: '',
        servicoId: '',
        data: format(new Date(), 'yyyy-MM-dd'),
        horario: '09:00',
        observacoes: '',
        status: 'pendente',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAgendamentoEditando(null);
  };

  const handleOpenDetalhes = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setAgendamentoSelecionado(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    try {
      if (!formData.clienteId) {
        toast.error('Selecione um cliente');
        return;
      }
      if (!formData.profissionalId) {
        toast.error('Selecione um profissional');
        return;
      }
      if (!formData.servicoId) {
        toast.error('Selecione um serviço');
        return;
      }

      const dadosParaSalvar = {
        ...formData,
        clienteId: parseInt(formData.clienteId),
        profissionalId: parseInt(formData.profissionalId),
        servicoId: parseInt(formData.servicoId),
        dataCriacao: agendamentoEditando ? agendamentoEditando.dataCriacao : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (agendamentoEditando) {
        await api.patch(`/agendamentos/${agendamentoEditando.id}`, dadosParaSalvar);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        dadosParaSalvar.id = Date.now();
        await api.post('/agendamentos', dadosParaSalvar);
        toast.success('Agendamento criado com sucesso!');
      }

      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      toast.error('Erro ao salvar agendamento');
    }
  };

  const handleAtualizarStatus = async (id, novoStatus) => {
    try {
      await api.patch(`/agendamentos/${id}`, { 
        status: novoStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Status atualizado para ${statusColors[novoStatus].label}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleIniciarAtendimento = (id) => {
    navigate(`/atendimento/${id}`);
  };

  // Filtrar agendamentos
  const agendamentosFiltrados = agendamentos.filter(ag => {
    const cliente = clientes.find(c => c.id === ag.clienteId);
    const profissional = profissionais.find(p => p.id === ag.profissionalId);
    const servico = servicos.find(s => s.id === ag.servicoId);
    const dataAg = new Date(ag.data);
    const hoje = new Date();

    // Filtro de busca
    const matchesSearch = filtro === '' || 
      cliente?.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      profissional?.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      servico?.nome?.toLowerCase().includes(filtro.toLowerCase());

    // Filtro de status
    const matchesStatus = filtroStatus === 'todos' || ag.status === filtroStatus;

    // Filtro de profissional
    const matchesProfissional = filtroProfissional === 'todos' || ag.profissionalId === parseInt(filtroProfissional);

    // Filtro de período
    let matchesPeriodo = true;
    if (filtroPeriodo === 'hoje') {
      matchesPeriodo = format(dataAg, 'yyyy-MM-dd') === format(hoje, 'yyyy-MM-dd');
    } else if (filtroPeriodo === 'semana') {
      const inicio = startOfWeek(hoje, { weekStartsOn: 0 });
      const fim = endOfWeek(hoje, { weekStartsOn: 0 });
      matchesPeriodo = dataAg >= inicio && dataAg <= fim;
    } else if (filtroPeriodo === 'mes') {
      const inicio = startOfMonth(hoje);
      const fim = endOfMonth(hoje);
      matchesPeriodo = dataAg >= inicio && dataAg <= fim;
    } else if (filtroPeriodo === 'personalizado') {
      matchesPeriodo = dataAg >= dataInicio && dataAg <= dataFim;
    }

    return matchesSearch && matchesStatus && matchesProfissional && matchesPeriodo;
  });

  // Ordenar por data e horário
  const agendamentosOrdenados = [...agendamentosFiltrados].sort((a, b) => {
    if (a.data !== b.data) {
      return new Date(a.data) - new Date(b.data);
    }
    return a.horario.localeCompare(b.horario);
  });

  // Paginação
  const paginatedAgendamentos = agendamentosOrdenados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Estatísticas
  const stats = {
    total: agendamentos.length,
    hoje: agendamentos.filter(a => a.data === format(new Date(), 'yyyy-MM-dd')).length,
    confirmados: agendamentos.filter(a => a.status === 'confirmado').length,
    pendentes: agendamentos.filter(a => a.status === 'pendente').length,
    cancelados: agendamentos.filter(a => a.status === 'cancelado').length,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
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
              Agendamentos
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie todos os agendamentos do salão
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={carregarDados}
            >
              Atualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
            >
              Novo Agendamento
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
                    Total
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
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
              <Card sx={{ bgcolor: '#e3f2fd' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Hoje
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#2196f3' }}>
                    {stats.hoje}
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
              <Card sx={{ bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Confirmados
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {stats.confirmados}
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
                    Pendentes
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {stats.pendentes}
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
              <Card sx={{ bgcolor: '#ffebee' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Cancelados
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {stats.cancelados}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
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
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={filtroPeriodo}
                    label="Período"
                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                  >
                    <MenuItem value="hoje">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TodayIcon fontSize="small" />
                        Hoje
                      </Box>
                    </MenuItem>
                    <MenuItem value="semana">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DateRangeIcon fontSize="small" />
                        Esta semana
                      </Box>
                    </MenuItem>
                    <MenuItem value="mes">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" />
                        Este mês
                      </Box>
                    </MenuItem>
                    <MenuItem value="personalizado">Personalizado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {filtroPeriodo === 'personalizado' && (
                <>
                  <Grid item xs={12} md={2}>
                    <DatePicker
                      label="Data Início"
                      value={dataInicio}
                      onChange={setDataInicio}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <DatePicker
                      label="Data Fim"
                      value={dataFim}
                      onChange={setDataFim}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtroStatus}
                    label="Status"
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="confirmado">Confirmado</MenuItem>
                    <MenuItem value="pendente">Pendente</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    value={filtroProfissional}
                    label="Profissional"
                    onChange={(e) => setFiltroProfissional(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {profissionais.map(prof => (
                      <MenuItem key={prof.id} value={prof.id.toString()}>{prof.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabela de Agendamentos */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#faf5ff' }}>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Profissional</strong></TableCell>
                    <TableCell><strong>Serviço</strong></TableCell>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Horário</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {paginatedAgendamentos.map((agendamento, index) => {
                      const cliente = clientes.find(c => c.id === agendamento.clienteId);
                      const profissional = profissionais.find(p => p.id === agendamento.profissionalId);
                      const servico = servicos.find(s => s.id === agendamento.servicoId);
                      
                      return (
                        <motion.tr
                          key={agendamento.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar src={cliente?.foto} sx={{ width: 32, height: 32, bgcolor: '#9c27b0' }}>
                                {cliente?.nome?.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {cliente?.nome || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{profissional?.nome || 'N/A'}</TableCell>
                          <TableCell>{servico?.nome || 'N/A'}</TableCell>
                          <TableCell>
                            {new Date(agendamento.data).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>{agendamento.horario}</TableCell>
                          <TableCell>
                            <Chip
                              icon={statusColors[agendamento.status]?.icon}
                              label={statusColors[agendamento.status]?.label || agendamento.status}
                              size="small"
                              sx={{
                                bgcolor: `${statusColors[agendamento.status]?.color}20`,
                                color: statusColors[agendamento.status]?.color,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Ver detalhes">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDetalhes(agendamento)}
                                >
                                  <EventIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {agendamento.status === 'pendente' && (
                                <Tooltip title="Confirmar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleAtualizarStatus(agendamento.id, 'confirmado')}
                                    sx={{ color: '#4caf50' }}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {agendamento.status === 'confirmado' && (
                                <Tooltip title="Iniciar atendimento">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleIniciarAtendimento(agendamento.id)}
                                    sx={{ color: '#9c27b0' }}
                                  >
                                    <ScheduleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {agendamento.status !== 'cancelado' && agendamento.status !== 'realizado' && (
                                <Tooltip title="Cancelar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleAtualizarStatus(agendamento.id, 'cancelado')}
                                    sx={{ color: '#f44336' }}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(agendamento)}
                                  sx={{ color: '#ff4081' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>

                  {paginatedAgendamentos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="body1" color="textSecondary">
                          Nenhum agendamento encontrado
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
              count={agendamentosOrdenados.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Linhas por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </CardContent>
        </Card>

        {/* Dialog de Cadastro/Edição */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            {agendamentoEditando ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cliente *</InputLabel>
                  <Select
                    name="clienteId"
                    value={formData.clienteId}
                    label="Cliente *"
                    onChange={handleInputChange}
                  >
                    {clientes.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Profissional *</InputLabel>
                  <Select
                    name="profissionalId"
                    value={formData.profissionalId}
                    label="Profissional *"
                    onChange={handleInputChange}
                  >
                    {profissionais.map(p => (
                      <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Serviço *</InputLabel>
                  <Select
                    name="servicoId"
                    value={formData.servicoId}
                    label="Serviço *"
                    onChange={handleInputChange}
                  >
                    {servicos.map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data"
                  name="data"
                  value={formData.data}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Horário</InputLabel>
                  <Select
                    name="horario"
                    value={formData.horario}
                    label="Horário"
                    onChange={handleInputChange}
                  >
                    {Array.from({ length: 19 }, (_, i) => {
                      const hora = String(i + 8).padStart(2, '0');
                      return (
                        <MenuItem key={hora} value={`${hora}:00`}>{`${hora}:00`}</MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="pendente">Pendente</MenuItem>
                    <MenuItem value="confirmado">Confirmado</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  size="small"
                  placeholder="Observações sobre o agendamento..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={handleSalvar}
              variant="contained"
              sx={{ bgcolor: '#9c27b0' }}
            >
              {agendamentoEditando ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Detalhes */}
        <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            Detalhes do Agendamento
          </DialogTitle>
          <DialogContent>
            {agendamentoSelecionado && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: '#9c27b0' }}>
                        {clientes.find(c => c.id === agendamentoSelecionado.clienteId)?.nome?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {clientes.find(c => c.id === agendamentoSelecionado.clienteId)?.nome}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Cliente
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Profissional</Typography>
                    <Typography variant="body1">
                      {profissionais.find(p => p.id === agendamentoSelecionado.profissionalId)?.nome}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Serviço</Typography>
                    <Typography variant="body1">
                      {servicos.find(s => s.id === agendamentoSelecionado.servicoId)?.nome}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Data</Typography>
                    <Typography variant="body1">
                      {new Date(agendamentoSelecionado.data).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Horário</Typography>
                    <Typography variant="body1">{agendamentoSelecionado.horario}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                    <Chip
                      icon={statusColors[agendamentoSelecionado.status]?.icon}
                      label={statusColors[agendamentoSelecionado.status]?.label || agendamentoSelecionado.status}
                      size="small"
                      sx={{
                        bgcolor: `${statusColors[agendamentoSelecionado.status]?.color}20`,
                        color: statusColors[agendamentoSelecionado.status]?.color,
                      }}
                    />
                  </Grid>

                  {agendamentoSelecionado.observacoes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Observações</Typography>
                      <Typography variant="body2">{agendamentoSelecionado.observacoes}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetalhes}>Fechar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default ModernAgendamentos;
