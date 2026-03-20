// src/pages/ClienteAgendamentos.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Collapse,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Stepper,
  Step,
  StepLabel,
  MobileStepper,
  Slide,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';

// Componente Mobile para cards de agendamento
const MobileAgendamentoCard = ({ agendamento, profissional, onDetalhes, onCancelar }) => {
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmado': return '#4caf50';
      case 'pendente': return '#ff9800';
      case 'cancelado': return '#f44336';
      case 'finalizado': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getStatusBg = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmado': return '#e8f5e9';
      case 'pendente': return '#fff3e0';
      case 'cancelado': return '#ffebee';
      case 'finalizado': return '#e3f2fd';
      default: return '#f5f5f5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 2,
          borderLeft: '4px solid',
          borderLeftColor: getStatusColor(agendamento.status),
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Cabeçalho com data e status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {new Date(agendamento.data).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={agendamento.status}
              sx={{
                bgcolor: getStatusBg(agendamento.status),
                color: getStatusColor(agendamento.status),
                fontWeight: 600,
                height: 24
              }}
            />
          </Box>

          {/* Horário e serviços */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TimeIcon sx={{ color: '#ff4081', fontSize: 16 }} />
            <Typography variant="body2" color="textSecondary">
              {agendamento.horario}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            {agendamento.quantidadeServicos > 1 
              ? `${agendamento.quantidadeServicos} serviços` 
              : agendamento.servicosNomes || agendamento.servicoNome}
          </Typography>

          {/* Chips de serviços (apenas os primeiros 2) */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
            {agendamento.servicos?.slice(0, 2).map((servico, idx) => (
              <Chip
                key={idx}
                label={servico.nome}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {agendamento.servicos?.length > 2 && (
              <Chip
                label={`+${agendamento.servicos.length - 2}`}
                size="small"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>

          {/* Profissional e valor */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar 
                src={profissional?.foto}
                sx={{ width: 24, height: 24, bgcolor: '#ff9800' }}
              >
                {!profissional?.foto && (agendamento.profissionalNome?.charAt(0) || '?')}
              </Avatar>
              <Typography variant="caption">
                {agendamento.profissionalNome || 'A definir'}
              </Typography>
            </Box>
            {agendamento.valorTotal > 0 && (
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                R$ {agendamento.valorTotal.toFixed(2)}
              </Typography>
            )}
          </Box>

          {/* Observações (se houver) */}
          {agendamento.observacoes && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
              Obs: {agendamento.observacoes}
            </Typography>
          )}

          {/* Ações */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onDetalhes(agendamento)}
              sx={{ borderColor: '#9c27b0', color: '#9c27b0', flex: 1 }}
            >
              Detalhes
            </Button>
            {agendamento.status?.toLowerCase() === 'pendente' && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onCancelar(agendamento)}
                sx={{ flex: 1 }}
              >
                Cancelar
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de carregamento
const LoadingSkeleton = () => (
  <Box sx={{ width: '100%', p: 2 }}>
    <CircularProgress />
  </Box>
);

function ClienteAgendamentos() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const { cliente, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [selectedServicos, setSelectedServicos] = useState([]);
  const [servicoExpandido, setServicoExpandido] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [formData, setFormData] = useState({
    profissionalId: '',
    data: '',
    horario: '',
    observacoes: '',
  });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  useEffect(() => {
    if (cliente) {
      carregarDados();
    }
  }, [cliente]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const uid = firebaseUser?.uid || cliente?.id;
      console.log('📌 Buscando agendamentos para clienteId:', uid);
      
      if (!uid) {
        console.error('❌ ID do cliente não encontrado');
        toast.error('Erro ao identificar o cliente');
        return;
      }
      
      const [agendamentosData, servicosData, profissionaisData] = await Promise.all([
        firebaseService.query('agendamentos', [
          { field: 'clienteId', operator: '==', value: uid }
        ], 'data', 'desc'),
        firebaseService.getAll('servicos'),
        firebaseService.getAll('profissionais')
      ]);

      console.log('✅ Agendamentos encontrados:', agendamentosData?.length || 0);
      
      setAgendamentos(agendamentosData || []);
      setServicos(servicosData || []);
      setProfissionais(profissionaisData || []);
      
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleNovoAgendamento = () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataFormatada = amanha.toISOString().split('T')[0];
    
    setSelectedServicos([]);
    setFormData({
      profissionalId: '',
      data: dataFormatada,
      horario: '',
      observacoes: '',
    });
    setServicoExpandido(true);
    setActiveStep(0);
    setOpenDialog(true);
  };

  const handleToggleServico = (servico) => {
    const currentIndex = selectedServicos.findIndex(s => s.id === servico.id);
    const newSelectedServicos = [...selectedServicos];

    if (currentIndex === -1) {
      newSelectedServicos.push({
        id: servico.id,
        nome: servico.nome,
        preco: servico.preco,
        duracao: servico.duracao
      });
    } else {
      newSelectedServicos.splice(currentIndex, 1);
    }

    setSelectedServicos(newSelectedServicos);
  };

  const handleSelectAllServicos = () => {
    if (selectedServicos.length === servicos.length) {
      setSelectedServicos([]);
    } else {
      setSelectedServicos(servicos.map(s => ({
        id: s.id,
        nome: s.nome,
        preco: s.preco,
        duracao: s.duracao
      })));
    }
  };

  const calcularTotal = () => {
    return selectedServicos.reduce((total, servico) => total + (servico.preco || 0), 0);
  };

  const calcularDuracaoTotal = () => {
    return selectedServicos.reduce((total, servico) => total + (servico.duracao || 0), 0);
  };

  const handleNext = () => {
    if (activeStep === 0 && selectedServicos.length === 0) {
      toast.error('Selecione pelo menos um serviço');
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSalvarAgendamento = async () => {
    try {
      if (selectedServicos.length === 0) {
        toast.error('Selecione pelo menos um serviço');
        return;
      }

      if (!formData.data || !formData.horario) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const hoje = new Date().toISOString().split('T')[0];
      if (formData.data < hoje) {
        toast.error('Não é possível agendar para datas passadas');
        return;
      }

      const uid = firebaseUser?.uid || cliente?.id;
      const profissional = profissionais.find(p => p.id === formData.profissionalId);

      const novoAgendamento = {
        clienteId: uid,
        clienteNome: cliente.nome,
        clienteEmail: cliente.email,
        clienteTelefone: cliente.telefone,
        servicos: selectedServicos.map(s => ({
          id: s.id,
          nome: s.nome,
          preco: s.preco,
          duracao: s.duracao
        })),
        servicosIds: selectedServicos.map(s => s.id),
        servicosNomes: selectedServicos.map(s => s.nome).join(', '),
        quantidadeServicos: selectedServicos.length,
        valorTotal: calcularTotal(),
        duracaoTotal: calcularDuracaoTotal(),
        profissionalId: formData.profissionalId || null,
        profissionalNome: profissional?.nome || null,
        data: formData.data,
        horario: formData.horario,
        observacoes: formData.observacoes,
        status: 'pendente',
        origem: 'cliente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await firebaseService.add('agendamentos', novoAgendamento);
      
      toast.success('Agendamento solicitado com sucesso!');
      setOpenDialog(false);
      carregarDados();
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
    }
  };

  const handleCancelarAgendamento = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setOpenCancelDialog(true);
  };

  const confirmarCancelamento = async () => {
    try {
      await firebaseService.update('agendamentos', selectedAgendamento.id, {
        status: 'cancelado',
        updatedAt: new Date().toISOString()
      });

      toast.success('Agendamento cancelado com sucesso!');
      setOpenCancelDialog(false);
      carregarDados();
      
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const handleVerDetalhes = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setOpenDetailsDialog(true);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmado': return 'success';
      case 'pendente': return 'warning';
      case 'cancelado': return 'error';
      case 'finalizado': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    if (isMobile) {
      switch(status?.toLowerCase()) {
        case 'confirmado': return 'Conf.';
        case 'pendente': return 'Pend.';
        case 'cancelado': return 'Canc.';
        case 'finalizado': return 'Real.';
        default: return status || 'Pend.';
      }
    }
    switch(status?.toLowerCase()) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Realizado';
      default: return status || 'Pendente';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmado': return <CheckIcon fontSize="small" />;
      case 'pendente': return <ScheduleIcon fontSize="small" />;
      case 'cancelado': return <CancelIcon fontSize="small" />;
      case 'finalizado': return <CheckIcon fontSize="small" />;
      default: return <EventIcon fontSize="small" />;
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    try {
      const date = new Date(data);
      if (isMobile) {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return data;
    }
  };

  const formatarDataCompleta = (data) => {
    if (!data) return '-';
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return data;
    }
  };

  const formatarMoeda = (valor) => {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const isDataValida = (data) => {
    const hoje = new Date().toISOString().split('T')[0];
    return data >= hoje;
  };

  const agendamentosFiltrados = agendamentos.filter(a => {
    if (filterStatus === 'todos') return true;
    return a.status?.toLowerCase() === filterStatus;
  });

  const agendamentosFuturos = agendamentosFiltrados.filter(a => {
    const status = a.status?.toLowerCase() || '';
    return status !== 'cancelado' && status !== 'finalizado';
  }).sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario));

  const agendamentosPassados = agendamentosFiltrados.filter(a => {
    const status = a.status?.toLowerCase() || '';
    return status === 'cancelado' || status === 'finalizado';
  }).sort((b, a) => b.data.localeCompare(a.data));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Versão Mobile
  if (isMobile) {
    return (
      <Box sx={{ pb: 7 }}>
        {/* Cabeçalho Mobile */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'white',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Meus Agendamentos
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={carregarDados}>
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleNovoAgendamento} sx={{ color: '#9c27b0' }}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Filtros Mobile */}
        <Box sx={{ p: 2, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <Chip
            label="Todos"
            onClick={() => setFilterStatus('todos')}
            color={filterStatus === 'todos' ? 'primary' : 'default'}
            sx={{ mr: 1 }}
          />
          <Chip
            label="Pendentes"
            onClick={() => setFilterStatus('pendente')}
            color={filterStatus === 'pendente' ? 'warning' : 'default'}
            sx={{ mr: 1 }}
          />
          <Chip
            label="Confirmados"
            onClick={() => setFilterStatus('confirmado')}
            color={filterStatus === 'confirmado' ? 'success' : 'default'}
            sx={{ mr: 1 }}
          />
          <Chip
            label="Cancelados"
            onClick={() => setFilterStatus('cancelado')}
            color={filterStatus === 'cancelado' ? 'error' : 'default'}
            sx={{ mr: 1 }}
          />
          <Chip
            label="Realizados"
            onClick={() => setFilterStatus('finalizado')}
            color={filterStatus === 'finalizado' ? 'info' : 'default'}
          />
        </Box>

        {/* Cards de Resumo Mobile */}
        <Grid container spacing={1} sx={{ mb: 2, px: 2 }}>
          <Grid item xs={4}>
            <Card sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {agendamentosFuturos.length}
              </Typography>
              <Typography variant="caption">Futuros</Typography>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {agendamentos.filter(a => a.status?.toLowerCase() === 'pendente').length}
              </Typography>
              <Typography variant="caption">Pend.</Typography>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {agendamentos.filter(a => a.status?.toLowerCase() === 'confirmado').length}
              </Typography>
              <Typography variant="caption">Conf.</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Lista de Agendamentos Mobile */}
        <Box sx={{ px: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Próximos Agendamentos
          </Typography>
          
          <AnimatePresence>
            {agendamentosFuturos.length > 0 ? (
              agendamentosFuturos.map((agendamento) => {
                const profissional = profissionais.find(p => 
                  p.id === agendamento.profissionalId || 
                  p.uid === agendamento.profissionalId
                );
                return (
                  <MobileAgendamentoCard
                    key={agendamento.id}
                    agendamento={agendamento}
                    profissional={profissional}
                    onDetalhes={handleVerDetalhes}
                    onCancelar={handleCancelarAgendamento}
                  />
                );
              })
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Nenhum agendamento futuro
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNovoAgendamento}
                  sx={{ mt: 2, bgcolor: '#9c27b0' }}
                >
                  Agendar Agora
                </Button>
              </Paper>
            )}
          </AnimatePresence>

          {/* Histórico Mobile */}
          {agendamentosPassados.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>
                Histórico
              </Typography>
              
              <AnimatePresence>
                {agendamentosPassados.slice(0, 3).map((agendamento) => {
                  const profissional = profissionais.find(p => 
                    p.id === agendamento.profissionalId || 
                    p.uid === agendamento.profissionalId
                  );
                  return (
                    <MobileAgendamentoCard
                      key={agendamento.id}
                      agendamento={agendamento}
                      profissional={profissional}
                      onDetalhes={handleVerDetalhes}
                      onCancelar={handleCancelarAgendamento}
                    />
                  );
                })}
                {agendamentosPassados.length > 3 && (
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => setFilterStatus('finalizado')}
                    sx={{ color: '#9c27b0' }}
                  >
                    Ver todos ({agendamentosPassados.length})
                  </Button>
                )}
              </AnimatePresence>
            </>
          )}
        </Box>

        {/* FAB para novo agendamento */}
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              bgcolor: '#9c27b0',
              '&:hover': { bgcolor: '#7b1fa2' }
            }}
            onClick={handleNovoAgendamento}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      </Box>
    );
  }

  // Versão Desktop (mantida)
  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Meus Agendamentos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie seus horários e serviços
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Atualizar">
            <IconButton onClick={carregarDados} sx={{ mr: 1, color: '#9c27b0' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNovoAgendamento}
            sx={{ 
              bgcolor: '#9c27b0',
              '&:hover': { bgcolor: '#7b1fa2' }
            }}
          >
            Novo Agendamento
          </Button>
        </Box>
      </Box>

      {/* Filtros Desktop */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <Chip
          label="Todos"
          onClick={() => setFilterStatus('todos')}
          color={filterStatus === 'todos' ? 'primary' : 'default'}
        />
        <Chip
          label="Pendentes"
          onClick={() => setFilterStatus('pendente')}
          color={filterStatus === 'pendente' ? 'warning' : 'default'}
        />
        <Chip
          label="Confirmados"
          onClick={() => setFilterStatus('confirmado')}
          color={filterStatus === 'confirmado' ? 'success' : 'default'}
        />
        <Chip
          label="Cancelados"
          onClick={() => setFilterStatus('cancelado')}
          color={filterStatus === 'cancelado' ? 'error' : 'default'}
        />
        <Chip
          label="Realizados"
          onClick={() => setFilterStatus('finalizado')}
          color={filterStatus === 'finalizado' ? 'info' : 'default'}
        />
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {agendamentosFuturos.length}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Agendamentos futuros
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {agendamentos.filter(a => a.status?.toLowerCase() === 'pendente').length}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Pendentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {agendamentos.filter(a => a.status?.toLowerCase() === 'confirmado').length}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Confirmados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Próximos Agendamentos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Próximos Agendamentos
          </Typography>

          {agendamentosFuturos.length > 0 ? (
            <Grid container spacing={2}>
              {agendamentosFuturos.map((agendamento, index) => {
                const profissional = profissionais.find(p => 
                  p.id === agendamento.profissionalId || 
                  p.uid === agendamento.profissionalId
                );
                
                return (
                  <Grid item xs={12} key={agendamento.id || index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2,
                          borderLeft: '4px solid',
                          borderLeftColor: 
                            agendamento.status?.toLowerCase() === 'confirmado' ? '#4caf50' :
                            agendamento.status?.toLowerCase() === 'pendente' ? '#ff9800' : '#9c27b0',
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon sx={{ color: '#9c27b0' }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {formatarData(agendamento.data)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <TimeIcon sx={{ color: '#ff4081', fontSize: 16 }} />
                              <Typography variant="body2" color="textSecondary">
                                {agendamento.horario}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {agendamento.quantidadeServicos > 1 
                                ? `${agendamento.quantidadeServicos} serviços` 
                                : agendamento.servicosNomes || agendamento.servicoNome}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                              {agendamento.servicos?.map((servico, idx) => (
                                <Chip
                                  key={idx}
                                  label={servico.nome}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              Profissional: {agendamento.profissionalNome || 'A definir'}
                            </Typography>
                            {agendamento.observacoes && (
                              <Typography variant="caption" color="textSecondary" display="block">
                                Obs: {agendamento.observacoes}
                              </Typography>
                            )}
                          </Grid>
                          
                          <Grid item xs={12} sm={2}>
                            <Box>
                              <Chip
                                icon={getStatusIcon(agendamento.status)}
                                label={getStatusLabel(agendamento.status)}
                                color={getStatusColor(agendamento.status)}
                                size="small"
                                sx={{ mb: 1 }}
                              />
                              {agendamento.valorTotal > 0 && (
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                                  {formatarMoeda(agendamento.valorTotal)}
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleVerDetalhes(agendamento)}
                                sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                              >
                                Detalhes
                              </Button>
                              {agendamento.status?.toLowerCase() === 'pendente' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleCancelarAgendamento(agendamento)}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Você não tem agendamentos futuros
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNovoAgendamento}
                sx={{ mt: 2, bgcolor: '#9c27b0' }}
              >
                Agendar Agora
              </Button>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Agendamentos */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Histórico de Agendamentos {agendamentosPassados.length > 0 && `(${agendamentosPassados.length})`}
          </Typography>

          {agendamentosPassados.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Data</TableCell>
                    <TableCell>Horário</TableCell>
                    <TableCell>Serviço(s)</TableCell>
                    <TableCell>Profissional</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agendamentosPassados.map((agendamento, index) => {
                    const profissional = profissionais.find(p => 
                      p.id === agendamento.profissionalId || 
                      p.uid === agendamento.profissionalId
                    );
                    
                    return (
                      <TableRow key={agendamento.id || index} hover>
                        <TableCell>{formatarData(agendamento.data)}</TableCell>
                        <TableCell>{agendamento.horario || '--:--'}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {agendamento.quantidadeServicos > 1 
                              ? `${agendamento.quantidadeServicos} serviços` 
                              : agendamento.servicosNomes || agendamento.servicoNome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {agendamento.servicos?.map(s => s.nome).join(', ') || agendamento.servicoNome}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              src={profissional?.foto}
                              sx={{ width: 32, height: 32, bgcolor: '#ff9800' }}
                            >
                              {!profissional?.foto && (agendamento.profissionalNome?.charAt(0) || '?')}
                            </Avatar>
                            <Typography variant="body2">
                              {agendamento.profissionalNome || 'Não informado'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {agendamento.valorTotal > 0 ? (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatarMoeda(agendamento.valorTotal)}
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(agendamento.status)}
                            label={getStatusLabel(agendamento.status)}
                            color={getStatusColor(agendamento.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhum histórico de agendamentos encontrado
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Novo Agendamento (com Stepper para mobile) */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon />
            <Typography variant="h6">Novo Agendamento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {isMobile && (
            <MobileStepper
              variant="progress"
              steps={2}
              position="static"
              activeStep={activeStep}
              sx={{ mb: 2 }}
              nextButton={
                <Button size="small" onClick={handleNext} disabled={activeStep === 1}>
                  {activeStep === 0 ? 'Próximo' : 'Finalizar'}
                </Button>
              }
              backButton={
                <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                  Voltar
                </Button>
              }
            />
          )}

          <Box sx={{ mt: 2 }}>
            {/* Passo 1: Seleção de Serviços */}
            {(activeStep === 0 || !isMobile) && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#faf5ff' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setServicoExpandido(!servicoExpandido)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                      Serviços * ({selectedServicos.length} selecionados)
                    </Typography>
                    {selectedServicos.length > 0 && (
                      <Chip
                        label={`Total: ${formatarMoeda(calcularTotal())}`}
                        size="small"
                        sx={{ bgcolor: '#9c27b0', color: 'white' }}
                      />
                    )}
                  </Box>
                  <IconButton size="small">
                    {servicoExpandido ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Collapse in={servicoExpandido}>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedServicos.length === servicos.length}
                            indeterminate={selectedServicos.length > 0 && selectedServicos.length < servicos.length}
                            onChange={handleSelectAllServicos}
                          />
                        }
                        label="Selecionar todos"
                      />
                      <Typography variant="caption" color="textSecondary">
                        {selectedServicos.length} de {servicos.length} selecionados
                      </Typography>
                    </Box>

                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {servicos.map((servico) => {
                        const isSelected = selectedServicos.some(s => s.id === servico.id);
                        return (
                          <ListItem 
                            key={servico.id}
                            button
                            onClick={() => handleToggleServico(servico)}
                            sx={{
                              bgcolor: isSelected ? '#f3e5f5' : 'transparent',
                              '&:hover': { bgcolor: '#f3e5f5' },
                              borderRadius: 1,
                              mb: 0.5
                            }}
                          >
                            <Checkbox
                              edge="start"
                              checked={isSelected}
                              tabIndex={-1}
                              disableRipple
                            />
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                                  {servico.nome}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Typography variant="caption" color="textSecondary">
                                    {formatarMoeda(servico.preco)}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    • {servico.duracao} min
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>

                    {selectedServicos.length > 0 && (
                      <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Resumo dos serviços selecionados:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                          {selectedServicos.map((servico, idx) => (
                            <Chip
                              key={idx}
                              label={servico.nome}
                              onDelete={() => handleToggleServico(servico)}
                              deleteIcon={<DeleteIcon />}
                              size="small"
                              sx={{ bgcolor: '#9c27b0', color: 'white' }}
                            />
                          ))}
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Duração total:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {calcularDuracaoTotal()} minutos
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Valor total:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                            {formatarMoeda(calcularTotal())}
                          </Typography>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            )}

            {/* Passo 2: Dados do Agendamento */}
            {(activeStep === 1 || !isMobile) && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Profissional */}
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Profissional</InputLabel>
                    <Select
                      value={formData.profissionalId}
                      label="Profissional"
                      onChange={(e) => setFormData({ ...formData, profissionalId: e.target.value })}
                    >
                      <MenuItem value="">Qualquer profissional disponível</MenuItem>
                      {profissionais.map(prof => (
                        <MenuItem key={prof.id} value={prof.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={prof.foto} sx={{ width: 24, height: 24 }}>
                              {prof.nome?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">{prof.nome}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {prof.especialidade}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Data e Horário */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data *"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    error={formData.data && !isDataValida(formData.data)}
                    helperText={formData.data && !isDataValida(formData.data) ? 'Data inválida' : ''}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Horário *</InputLabel>
                    <Select
                      value={formData.horario}
                      label="Horário *"
                      onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    >
                      {timeSlots.map(time => (
                        <MenuItem key={time} value={time}>{time}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Observações */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    multiline
                    rows={3}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    size="small"
                    placeholder="Alguma observação especial? (ex: alergias, preferências)"
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          {isMobile ? (
            activeStep === 0 ? (
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={selectedServicos.length === 0}
                sx={{ bgcolor: '#9c27b0' }}
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSalvarAgendamento}
                variant="contained"
                disabled={!formData.data || !formData.horario}
                sx={{ bgcolor: '#9c27b0' }}
              >
                Solicitar Agendamento
              </Button>
            )
          ) : (
            <Button
              onClick={handleSalvarAgendamento}
              variant="contained"
              sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
            >
              Solicitar Agendamento {selectedServicos.length > 0 && `(${formatarMoeda(calcularTotal())})`}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog de Cancelamento */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CancelIcon />
            <Typography variant="h6">Cancelar Agendamento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
            Tem certeza que deseja cancelar este agendamento?
          </Typography>
          {selectedAgendamento && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2">
                <strong>Data:</strong> {formatarData(selectedAgendamento.data)} às {selectedAgendamento.horario}
              </Typography>
              <Typography variant="body2">
                <strong>Serviço(s):</strong> {selectedAgendamento.servicosNomes || selectedAgendamento.servicoNome}
              </Typography>
              {selectedAgendamento.valorTotal > 0 && (
                <Typography variant="body2">
                  <strong>Valor:</strong> {formatarMoeda(selectedAgendamento.valorTotal)}
                </Typography>
              )}
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Voltar</Button>
          <Button onClick={confirmarCancelamento} color="error" variant="contained">
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon />
            <Typography variant="h6">Detalhes do Agendamento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAgendamento && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Data</Typography>
                  <Typography variant="body2">
                    {formatarData(selectedAgendamento.data)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Horário</Typography>
                  <Typography variant="body2">{selectedAgendamento.horario}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Serviço(s)</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                    {selectedAgendamento.servicos?.map((servico, idx) => (
                      <Chip
                        key={idx}
                        label={servico.nome}
                        size="small"
                        sx={{ bgcolor: '#f3e5f5' }}
                      />
                    )) || (
                      <Chip
                        label={selectedAgendamento.servicoNome}
                        size="small"
                        sx={{ bgcolor: '#f3e5f5' }}
                      />
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Duração total</Typography>
                  <Typography variant="body2">
                    {selectedAgendamento.duracaoTotal || selectedAgendamento.servicoDuracao || 0} minutos
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Valor total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                    {formatarMoeda(selectedAgendamento.valorTotal || selectedAgendamento.servicoPreco)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Profissional</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar 
                      src={profissionais.find(p => p.id === selectedAgendamento.profissionalId)?.foto}
                      sx={{ width: 32, height: 32 }}
                    >
                      {selectedAgendamento.profissionalNome?.charAt(0) || '?'}
                    </Avatar>
                    <Typography variant="body2">
                      {selectedAgendamento.profissionalNome || 'A definir'}
                    </Typography>
                  </Box>
                </Grid>
                
                {selectedAgendamento.observacoes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Observações</Typography>
                    <Typography variant="body2">{selectedAgendamento.observacoes}</Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Status</Typography>
                  <Chip
                    label={getStatusLabel(selectedAgendamento.status)}
                    color={getStatusColor(selectedAgendamento.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Solicitado em</Typography>
                  <Typography variant="body2">
                    {formatarDataCompleta(selectedAgendamento.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Fechar</Button>
          {selectedAgendamento?.status?.toLowerCase() === 'pendente' && (
            <Button 
              color="error" 
              onClick={() => {
                setOpenDetailsDialog(false);
                handleCancelarAgendamento(selectedAgendamento);
              }}
            >
              Cancelar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClienteAgendamentos;
