import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
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
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Badge,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  ContentCut as CutIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  ViewWeek as WeekIcon,
  ViewModule as MonthIcon,
  PlayArrow as PlayIcon,
  AccessTime as TimeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Funções auxiliares de data
const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addWeeks = (date, weeks) => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const getWeekDays = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1);
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
};

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function ModernAgendamentos() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [openDayDialog, setOpenDayDialog] = useState(false);
  const [showAtendimentos, setShowAtendimentos] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dados da API
  const [agendamentos, setAgendamentos] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);

  // Carregar dados da API
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [agendamentosRes, atendimentosRes, clientesRes, profissionaisRes, servicosRes] = await Promise.all([
        api.get('/agendamentos'),
        api.get('/atendimentos'),
        api.get('/clientes'),
        api.get('/profissionais'),
        api.get('/servicos'),
      ]);
      
      setAgendamentos(agendamentosRes.data || []);
      setAtendimentos(atendimentosRes.data || []);
      setClientes(clientesRes.data || []);
      setProfissionais(profissionaisRes.data || []);
      setServicos(servicosRes.data || []);
      
      console.log('✅ Dados carregados');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const adicionarAgendamento = async (dados) => {
    try {
      // Validar dados obrigatórios
      if (!dados.clienteId || !dados.profissionalId || !dados.servicoId || !dados.data || !dados.horario) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
  
      // Verificar se o ID já existe
      const novoId = Date.now();
      
      // Preparar dados no formato correto para o JSON Server
      const novoAgendamento = {
        id: novoId,
        clienteId: parseInt(dados.clienteId),
        profissionalId: parseInt(dados.profissionalId),
        servicoId: parseInt(dados.servicoId),
        data: dados.data,
        horario: dados.horario,
        observacoes: dados.observacoes || '',
        status: dados.status || 'pendente',
        dataCriacao: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      console.log('📝 Criando agendamento:', novoAgendamento);
  
      // Fazer a requisição POST
      const response = await api.post('/agendamentos', novoAgendamento);
      
      console.log('✅ Agendamento criado:', response.data);
      
      // Atualizar a lista local
      setAgendamentos(prev => [...prev, response.data]);
      
      toast.success('Agendamento criado com sucesso!');
      return response.data;
      
    } catch (error) {
      console.error('❌ Erro detalhado ao adicionar agendamento:', error);
      
      // Mostrar mensagem de erro mais específica
      if (error.response) {
        console.error('Resposta do servidor:', error.response.data);
        toast.error(`Erro ${error.response.status}: ${error.response.data?.message || 'Erro ao criar agendamento'}`);
      } else if (error.request) {
        toast.error('Erro de conexão. Verifique se o servidor está rodando.');
      } else {
        toast.error('Erro ao criar agendamento: ' + error.message);
      }
      
      throw error;
    }
  };

  const atualizarAgendamento = async (id, dados) => {
    try {
      // Preparar dados no formato correto
      const dadosAtualizados = {
        clienteId: parseInt(dados.clienteId),
        profissionalId: parseInt(dados.profissionalId),
        servicoId: parseInt(dados.servicoId),
        data: dados.data,
        horario: dados.horario,
        observacoes: dados.observacoes || '',
        status: dados.status || 'pendente',
        updatedAt: new Date().toISOString()
      };
  
      console.log('📝 Atualizando agendamento:', id, dadosAtualizados);
  
      const response = await api.patch(`/agendamentos/${id}`, dadosAtualizados);
      
      console.log('✅ Agendamento atualizado:', response.data);
      
      // Atualizar a lista local
      setAgendamentos(prev => prev.map(item => item.id === id ? response.data : item));
      
      toast.success('Agendamento atualizado com sucesso!');
      return response.data;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar agendamento:', error);
      
      if (error.response) {
        toast.error(`Erro ${error.response.status}: ${error.response.data?.message || 'Erro ao atualizar agendamento'}`);
      } else {
        toast.error('Erro ao atualizar agendamento');
      }
      
      throw error;
    }
  };

  const excluirAgendamento = async (id) => {
    try {
      await api.delete(`/agendamentos/${id}`);
      setAgendamentos(agendamentos.filter(item => item.id !== id));
      toast.success('Agendamento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
      throw error;
    }
  };

  // Combinar agendamentos e atendimentos
  const todosEventos = [
    ...agendamentos.map(apt => ({
      ...apt,
      tipo: 'agendamento',
      icone: <ScheduleIcon />,
    })),
    ...atendimentos.map(att => ({
      ...att,
      tipo: 'atendimento',
      icone: <TimerIcon />,
      status: att.status || 'em_andamento',
    }))
  ];

  // Estado do formulário
  const [formData, setFormData] = useState({
    clienteId: '',
    profissionalId: '',
    servicoId: '',
    data: selectedDate,
    horario: '',
    observacoes: '',
    status: 'pendente'
  });

  // Reset form quando abrir modal
  useEffect(() => {
    if (openDialog) {
      if (selectedAppointment) {
        setFormData({
          clienteId: selectedAppointment.clienteId || '',
          profissionalId: selectedAppointment.profissionalId || '',
          servicoId: selectedAppointment.servicoId || '',
          data: selectedAppointment.data || selectedDate,
          horario: selectedAppointment.horario || '',
          observacoes: selectedAppointment.observacoes || '',
          status: selectedAppointment.status || 'pendente'
        });
      } else {
        setFormData({
          clienteId: '',
          profissionalId: '',
          servicoId: '',
          data: selectedDate,
          horario: '',
          observacoes: '',
          status: 'pendente'
        });
      }
    }
  }, [openDialog, selectedAppointment, selectedDate]);

  // Filtrar eventos
  const filteredEvents = todosEventos.filter(event => {
    const professionalMatch = selectedProfessional === 'all' || event.profissionalId === parseInt(selectedProfessional);
    const statusMatch = selectedStatus === 'all' || event.status === selectedStatus;
    const tipoMatch = showAtendimentos ? true : event.tipo === 'agendamento';
    return professionalMatch && statusMatch && tipoMatch;
  });

  // Eventos do dia selecionado
  const dayEvents = filteredEvents.filter(event => event.data === selectedDate);

  // Atendimentos em andamento
  const atendimentosEmAndamento = atendimentos.filter(att => att.status === 'em_andamento');

  // Agendamentos da semana
  const weekDays_list = getWeekDays(currentDate);
  const weekEvents = weekDays_list.map(day => ({
    date: formatDate(day),
    dayName: weekDays[day.getDay() === 0 ? 6 : day.getDay() - 1],
    events: filteredEvents.filter(event => event.data === formatDate(day))
  }));

  // Eventos do mês
  const monthDays = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthMatrix = [];
  let dayCounter = 1;

  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay - 1) {
        week.push(null);
      } else if (dayCounter <= monthDays) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayCounter);
        const dateStr = formatDate(date);
        const dayEvents = filteredEvents.filter(event => event.data === dateStr);
        week.push({
          day: dayCounter,
          date: dateStr,
          events: dayEvents,
          count: dayEvents.length,
          atendimentos: dayEvents.filter(e => e.tipo === 'atendimento').length,
          agendamentos: dayEvents.filter(e => e.tipo === 'agendamento').length,
        });
        dayCounter++;
      } else {
        week.push(null);
      }
    }
    monthMatrix.push(week);
    if (dayCounter > monthDays) break;
  }

  // Estatísticas
  const stats = {
    total: dayEvents.length,
    agendamentos: dayEvents.filter(e => e.tipo === 'agendamento').length,
    atendimentos: dayEvents.filter(e => e.tipo === 'atendimento').length,
    confirmados: dayEvents.filter(e => e.status === 'confirmado').length,
    pendentes: dayEvents.filter(e => e.status === 'pendente').length,
    em_andamento: dayEvents.filter(e => e.status === 'em_andamento').length,
    cancelados: dayEvents.filter(e => e.status === 'cancelado').length,
    finalizados: dayEvents.filter(e => e.status === 'finalizado').length,
  };

  const handlePrevious = () => {
    if (viewMode === 'day') {
      const newDate = addDays(new Date(selectedDate), -1);
      setSelectedDate(formatDate(newDate));
      setCurrentDate(newDate);
    } else if (viewMode === 'week') {
      const newDate = addWeeks(currentDate, -1);
      setCurrentDate(newDate);
      setSelectedDate(formatDate(newDate));
    } else {
      const newDate = addMonths(currentDate, -1);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      const newDate = addDays(new Date(selectedDate), 1);
      setSelectedDate(formatDate(newDate));
      setCurrentDate(newDate);
    } else if (viewMode === 'week') {
      const newDate = addWeeks(currentDate, 1);
      setCurrentDate(newDate);
      setSelectedDate(formatDate(newDate));
    } else {
      const newDate = addMonths(currentDate, 1);
      setCurrentDate(newDate);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(formatDate(today));
  };

  const handleAdd = () => {
    setSelectedAppointment(null);
    setOpenDialog(true);
  };

  const handleEdit = (event) => {
    if (event.tipo === 'agendamento') {
      setSelectedAppointment(event);
      setOpenDialog(true);
    } else {
      toast('Atendimentos não podem ser editados diretamente');
    }
  };

  const handleDelete = (id, tipo) => {
    if (tipo === 'agendamento') {
      setAppointmentToDelete(id);
      setOpenDeleteDialog(true);
    } else {
      toast('Atendimentos não podem ser excluídos');
    }
  };

  const confirmDelete = async () => {
    try {
      await excluirAgendamento(appointmentToDelete);
    } catch (error) {
      // Erro já tratado na função
    }
    setOpenDeleteDialog(false);
    setAppointmentToDelete(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await atualizarAgendamento(id, { status: newStatus });
    } catch (error) {
      // Erro já tratado na função
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    
    try {
      if (!formData.clienteId || !formData.profissionalId || !formData.servicoId || !formData.horario) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const horarioOcupado = agendamentos.some(apt => 
        apt.data === formData.data && 
        apt.horario === formData.horario && 
        apt.profissionalId === parseInt(formData.profissionalId) &&
        apt.id !== selectedAppointment?.id &&
        apt.status !== 'cancelado'
      );

      if (horarioOcupado) {
        toast.error('Este horário já está ocupado para este profissional');
        return;
      }

      if (selectedAppointment) {
        await atualizarAgendamento(selectedAppointment.id, formData);
      } else {
        await adicionarAgendamento(formData);
      }
      
      setOpenDialog(false);
    } catch (error) {
      // Erro já tratado nas funções
    }
  };

  const iniciarAtendimento = async (agendamento) => {
    console.log('🎯 Função iniciarAtendimento chamada com:', agendamento);
    
    try {
      if (!agendamento || !agendamento.id) {
        toast.error('Agendamento não encontrado');
        return;
      }

      const toastId = toast.loading('Iniciando atendimento...');

      // Verificar se já existe um atendimento para este agendamento
      const atendimentoExistente = atendimentos.find(a => a.agendamentoId === agendamento.id);
      
      if (atendimentoExistente) {
        toast.dismiss(toastId);
        toast.success('Atendimento já existe!');
        navigate(`/atendimento/${atendimentoExistente.id}`);
        return;
      }

      // Criar novo atendimento
      const novoAtendimento = {
        id: Date.now(),
        agendamentoId: agendamento.id,
        clienteId: agendamento.clienteId,
        profissionalId: agendamento.profissionalId,
        servicoId: agendamento.servicoId,
        data: agendamento.data,
        horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        horaFim: null,
        status: 'em_andamento',
        observacoes: '',
        itensServico: [{
          id: agendamento.servicoId,
          nome: servicos.find(s => s.id === agendamento.servicoId)?.nome || 'Serviço',
          preco: servicos.find(s => s.id === agendamento.servicoId)?.preco || 0,
          principal: true
        }],
        itensProduto: [],
        valorTotal: servicos.find(s => s.id === agendamento.servicoId)?.preco || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await api.post('/atendimentos', novoAtendimento);
      
      // Atualizar status do agendamento
      await api.patch(`/agendamentos/${agendamento.id}`, { 
        status: 'em_andamento',
        updatedAt: new Date().toISOString()
      });

      toast.dismiss(toastId);
      toast.success('Atendimento iniciado com sucesso!');
      
      navigate(`/atendimento/${response.data.id}`);
      
    } catch (error) {
      console.error('❌ Erro detalhado:', error);
      toast.error('Erro ao iniciar atendimento');
    }
  };

  const continuarAtendimento = (atendimento) => {
    console.log('Continuando atendimento:', atendimento);
    navigate(`/atendimento/${atendimento.agendamentoId || atendimento.id}`);
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  const handleDayDetails = (date, events) => {
    setSelectedDayDetails({ date, events });
    setOpenDayDialog(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmado': return 'success';
      case 'pendente': return 'warning';
      case 'cancelado': return 'error';
      case 'finalizado': return 'info';
      case 'em_andamento': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmado': return <CheckIcon />;
      case 'pendente': return <ScheduleIcon />;
      case 'cancelado': return <CancelIcon />;
      case 'finalizado': return <CheckIcon />;
      case 'em_andamento': return <TimerIcon />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Finalizado';
      case 'em_andamento': return 'Em Andamento';
      default: return status;
    }
  };

  const getTipoIcon = (tipo) => {
    return tipo === 'agendamento' ? <ScheduleIcon fontSize="small" /> : <TimerIcon fontSize="small" />;
  };

  const getTipoLabel = (tipo) => {
    return tipo === 'agendamento' ? 'Agendamento' : 'Atendimento';
  };

  const isHorarioDisponivel = (horario) => {
    if (!formData.profissionalId || !formData.data) return true;
    
    return !agendamentos.some(apt => 
      apt.data === formData.data && 
      apt.horario === horario && 
      apt.profissionalId === parseInt(formData.profissionalId) &&
      apt.id !== selectedAppointment?.id &&
      apt.status !== 'cancelado'
    );
  };

  const getHeaderText = () => {
    if (viewMode === 'day') {
      return new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewMode === 'week') {
      const start = weekDays_list[0];
      const end = weekDays_list[6];
      return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
    } else {
      return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Agenda
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleToday}
            startIcon={<TodayIcon />}
          >
            Hoje
          </Button>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newView) => newView && setViewMode(newView)}
            size="small"
          >
            <ToggleButton value="day">
              <TodayIcon sx={{ mr: 1 }} /> Dia
            </ToggleButton>
            <ToggleButton value="week">
              <WeekIcon sx={{ mr: 1 }} /> Semana
            </ToggleButton>
            <ToggleButton value="month">
              <MonthIcon sx={{ mr: 1 }} /> Mês
            </ToggleButton>
          </ToggleButtonGroup>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                color: 'white',
                boxShadow: '0 3px 15px rgba(156,39,176,0.3)',
              }}
            >
              Novo Agendamento
            </Button>
          </motion.div>
        </Box>
      </Box>

      {/* Atendimentos em Andamento - Destaque */}
      {atendimentosEmAndamento.length > 0 && (
        <Card sx={{ mb: 4, border: '2px solid #ff9800', bgcolor: '#fff3e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimerIcon sx={{ color: '#ff9800', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                Atendimentos em Andamento ({atendimentosEmAndamento.length})
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              {atendimentosEmAndamento.slice(0, 3).map(atendimento => {
                const cliente = clientes.find(c => c.id === atendimento.clienteId);
                const profissional = profissionais.find(p => p.id === atendimento.profissionalId);
                const servico = servicos.find(s => s.id === atendimento.servicoId);

                return (
                  <Grid item xs={12} md={4} key={atendimento.id}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                          {cliente?.nome?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {cliente?.nome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {servico?.nome}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Profissional:</strong> {profissional?.nome}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Início:</strong> {atendimento.horaInicio}
                        </Typography>
                      </Box>

                      <LinearProgress 
                        variant="determinate" 
                        value={75} 
                        sx={{ mb: 2, height: 6, borderRadius: 3 }}
                      />
                      
                      <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        startIcon={<PlayIcon />}
                        onClick={() => continuarAtendimento(atendimento)}
                      >
                        Continuar
                      </Button>
                    </Card>
                  </Grid>
                );
              })}
              {atendimentosEmAndamento.length > 3 && (
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    onClick={() => setViewMode('day')}
                  >
                    Ver todos os {atendimentosEmAndamento.length} atendimentos
                  </Button>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Controles de Navegação e Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handlePrevious} size="small">
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontWeight: 500 }}>
                  {getHeaderText()}
                </Typography>
                <IconButton onClick={handleNext} size="small">
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Profissional</InputLabel>
                <Select
                  value={selectedProfessional}
                  label="Profissional"
                  onChange={(e) => setSelectedProfessional(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {profissionais.map(prof => (
                    <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="confirmado">Confirmado</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                  <MenuItem value="finalizado">Finalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Mostrar</InputLabel>
                <Select
                  value={showAtendimentos ? 'todos' : 'agendamentos'}
                  label="Mostrar"
                  onChange={(e) => setShowAtendimentos(e.target.value === 'todos')}
                >
                  <MenuItem value="todos">Agendamentos e Atendimentos</MenuItem>
                  <MenuItem value="agendamentos">Apenas Agendamentos</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Chip 
                  label={`${stats.total} hoje`} 
                  color="primary" 
                  size="small"
                  variant="outlined"
                />
                {viewMode === 'day' && stats.agendamentos > 0 && (
                  <Chip 
                    icon={<ScheduleIcon />}
                    label={`${stats.agendamentos} agend.`} 
                    color="info" 
                    size="small"
                  />
                )}
                {viewMode === 'day' && stats.atendimentos > 0 && (
                  <Chip 
                    icon={<TimerIcon />}
                    label={`${stats.atendimentos} atend.`} 
                    color="warning" 
                    size="small"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Visualização por Dia */}
      {viewMode === 'day' && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textTransform: 'capitalize' }}>
              {getHeaderText()}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {timeSlots.map(time => {
                const eventsAtTime = dayEvents.filter(event => event.horario === time);
                
                return (
                  <motion.div
                    key={time}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        backgroundColor: eventsAtTime.length > 0 ? '#faf5ff' : 'transparent',
                        borderLeft: eventsAtTime.length > 0 ? '4px solid #9c27b0' : 'none',
                      }}
                    >
                      <Box sx={{ minWidth: 80 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                          {time}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        {eventsAtTime.length > 0 ? (
                          <AnimatePresence>
                            <Grid container spacing={2}>
                              {eventsAtTime.map(event => {
                                const cliente = clientes.find(c => c.id === event.clienteId);
                                const profissional = profissionais.find(p => p.id === event.profissionalId);
                                const servico = servicos.find(s => s.id === event.servicoId);

                                return (
                                  <Grid item xs={12} key={`${event.tipo}-${event.id}`}>
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                    >
                                      <Card variant="outlined" sx={{ 
                                        p: 2,
                                        borderLeft: '4px solid',
                                        borderLeftColor: 
                                          event.tipo === 'atendimento' ? '#ff9800' :
                                          event.status === 'confirmado' ? '#4caf50' :
                                          event.status === 'pendente' ? '#ff9800' :
                                          event.status === 'cancelado' ? '#f44336' : '#9c27b0',
                                      }}>
                                        <Grid container spacing={2} alignItems="center">
                                          <Grid item xs={12} sm={6} md={3}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Avatar sx={{ bgcolor: event.tipo === 'atendimento' ? '#ff9800' : '#9c27b0', width: 32, height: 32 }}>
                                                {cliente?.nome?.charAt(0)}
                                              </Avatar>
                                              <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                  {cliente?.nome || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                  {cliente?.telefone || '---'}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          </Grid>

                                          <Grid item xs={12} sm={6} md={2}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                              {servico?.nome || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                              R$ {servico?.preco?.toFixed(2) || '0,00'}
                                            </Typography>
                                          </Grid>

                                          <Grid item xs={12} sm={6} md={2}>
                                            <Typography variant="body2">
                                              {profissional?.nome || 'N/A'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                              {getTipoIcon(event.tipo)}
                                              <Typography variant="caption" color="textSecondary">
                                                {getTipoLabel(event.tipo)}
                                              </Typography>
                                            </Box>
                                          </Grid>

                                          <Grid item xs={12} sm={6} md={2}>
                                            <Chip
                                              icon={getStatusIcon(event.status)}
                                              label={getStatusLabel(event.status)}
                                              size="small"
                                              color={getStatusColor(event.status)}
                                              sx={{ fontWeight: 500 }}
                                            />
                                          </Grid>

                                          <Grid item xs={12} md={3}>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                              {event.tipo === 'agendamento' && event.status === 'confirmado' && (
                                                <Button
                                                  size="small"
                                                  variant="contained"
                                                  color="success"
                                                  startIcon={<PlayIcon />}
                                                  onClick={() => {
                                                    console.log('Botão Iniciar clicado para:', event);
                                                    iniciarAtendimento(event);
                                                  }}
                                                >
                                                  Iniciar
                                                </Button>
                                              )}
                                              
                                              {event.tipo === 'atendimento' && event.status === 'em_andamento' && (
                                                <Button
                                                  size="small"
                                                  variant="contained"
                                                  color="warning"
                                                  startIcon={<PlayIcon />}
                                                  onClick={() => continuarAtendimento(event)}
                                                >
                                                  Continuar
                                                </Button>
                                              )}
                                              
                                              {event.tipo === 'agendamento' && event.status === 'pendente' && (
                                                <>
                                                  <IconButton 
                                                    size="small" 
                                                    onClick={() => handleStatusChange(event.id, 'confirmado')}
                                                    color="success"
                                                    title="Confirmar"
                                                  >
                                                    <CheckIcon fontSize="small" />
                                                  </IconButton>
                                                  <IconButton 
                                                    size="small" 
                                                    onClick={() => handleStatusChange(event.id, 'cancelado')}
                                                    color="error"
                                                    title="Cancelar"
                                                  >
                                                    <CancelIcon fontSize="small" />
                                                  </IconButton>
                                                </>
                                              )}
                                              
                                              {event.tipo === 'agendamento' && (
                                                <>
                                                  <IconButton 
                                                    size="small" 
                                                    onClick={() => handleEdit(event)}
                                                    color="primary"
                                                    title="Editar"
                                                  >
                                                    <EditIcon fontSize="small" />
                                                  </IconButton>
                                                  
                                                  {event.status !== 'finalizado' && event.status !== 'cancelado' && (
                                                    <IconButton 
                                                      size="small" 
                                                      onClick={() => handleDelete(event.id, event.tipo)}
                                                      color="error"
                                                      title="Excluir"
                                                    >
                                                      <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                  )}
                                                </>
                                              )}
                                            </Box>
                                          </Grid>
                                        </Grid>

                                        {event.observacoes && (
                                          <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid #ccc' }}>
                                            <Typography variant="caption" color="textSecondary">
                                              Obs: {event.observacoes}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Card>
                                    </motion.div>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </AnimatePresence>
                        ) : (
                          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                            Horário disponível
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </motion.div>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Visualização por Semana */}
      {viewMode === 'week' && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Semana de {getHeaderText()}
            </Typography>

            <Grid container spacing={2}>
              {weekEvents.map((day, index) => (
                <Grid item xs={12} md={6} lg key={index}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: day.date === selectedDate ? '#f3e5f5' : 'white',
                      '&:hover': { boxShadow: 3 }
                    }}
                    onClick={() => handleDayClick(day.date)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                        {day.dayName}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {new Date(day.date + 'T12:00:00').getDate()}
                      </Typography>
                      
                      {day.events.length > 0 ? (
                        <Box>
                          {day.events.slice(0, 3).map(event => {
                            const cliente = clientes.find(c => c.id === event.clienteId);
                            return (
                              <Box key={`${event.tipo}-${event.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Badge
                                  color={getStatusColor(event.status)}
                                  variant="dot"
                                >
                                  {event.tipo === 'atendimento' ? (
                                    <TimerIcon fontSize="inherit" sx={{ color: '#ff9800' }} />
                                  ) : (
                                    <ScheduleIcon fontSize="inherit" sx={{ color: '#9c27b0' }} />
                                  )}
                                </Badge>
                                <Typography variant="caption">
                                  {event.horario} - {cliente?.nome?.split(' ')[0]}
                                </Typography>
                              </Box>
                            );
                          })}
                          {day.events.length > 3 && (
                            <Typography variant="caption" color="textSecondary">
                              +{day.events.length - 3} mais
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                          Sem eventos
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Visualização por Mês */}
      {viewMode === 'month' && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textTransform: 'capitalize' }}>
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </Typography>

            <Grid container spacing={1} sx={{ mb: 2 }}>
              {weekDays.map(day => (
                <Grid item xs key={day}>
                  <Typography variant="subtitle2" align="center" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {monthMatrix.map((week, weekIndex) => (
              <Grid container spacing={1} key={weekIndex} sx={{ mb: 1 }}>
                {week.map((day, dayIndex) => (
                  <Grid item xs key={dayIndex}>
                    {day ? (
                      <Card
                        variant="outlined"
                        sx={{
                          p: 1,
                          minHeight: 100,
                          cursor: 'pointer',
                          bgcolor: day.date === selectedDate ? '#f3e5f5' : 'white',
                          borderLeft: day.count > 0 ? '3px solid' : 'none',
                          borderLeftColor: '#9c27b0',
                          '&:hover': { boxShadow: 3, bgcolor: '#faf5ff' }
                        }}
                        onClick={() => day.count > 0 ? handleDayDetails(day.date, day.events) : handleDayClick(day.date)}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          {day.day}
                        </Typography>
                        
                        {day.count > 0 && (
                          <Box>
                            <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                              {day.agendamentos > 0 && (
                                <Chip
                                  icon={<ScheduleIcon style={{ fontSize: 14 }} />}
                                  label={day.agendamentos}
                                  size="small"
                                  sx={{
                                    bgcolor: '#9c27b0',
                                    color: 'white',
                                    height: 20,
                                    '& .MuiChip-icon': { color: 'white', fontSize: 14 }
                                  }}
                                />
                              )}
                              
                              {day.atendimentos > 0 && (
                                <Chip
                                  icon={<TimerIcon style={{ fontSize: 14 }} />}
                                  label={day.atendimentos}
                                  size="small"
                                  sx={{
                                    bgcolor: '#ff9800',
                                    color: 'white',
                                    height: 20,
                                    '& .MuiChip-icon': { color: 'white', fontSize: 14 }
                                  }}
                                />
                              )}
                            </Box>
                            
                            {day.events.slice(0, 2).map(event => {
                              const cliente = clientes.find(c => c.id === event.clienteId);
                              return (
                                <Box key={`${event.tipo}-${event.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: 
                                        event.tipo === 'atendimento' ? '#ff9800' :
                                        event.status === 'confirmado' ? '#4caf50' :
                                        event.status === 'pendente' ? '#ff9800' :
                                        event.status === 'cancelado' ? '#f44336' : '#9c27b0',
                                    }}
                                  />
                                  <Typography variant="caption" noWrap sx={{ fontSize: '0.65rem' }}>
                                    {event.horario} - {cliente?.nome?.split(' ')[0]}
                                  </Typography>
                                </Box>
                              );
                            })}
                            
                            {day.count > 2 && (
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                                +{day.count - 2} mais
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Card>
                    ) : (
                      <Box sx={{ p: 1, minHeight: 100, bgcolor: '#f5f5f5', borderRadius: 1 }} />
                    )}
                  </Grid>
                ))}
              </Grid>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dialog de Detalhes do Dia */}
      <Dialog open={openDayDialog} onClose={() => setOpenDayDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
          {selectedDayDetails?.date && 
            new Date(selectedDayDetails.date + 'T12:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedDayDetails?.events.map(event => {
              const cliente = clientes.find(c => c.id === event.clienteId);
              const profissional = profissionais.find(p => p.id === event.profissionalId);
              const servico = servicos.find(s => s.id === event.servicoId);

              return (
                <Card key={`${event.tipo}-${event.id}`} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Cliente</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {cliente?.nome}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Horário</Typography>
                      <Typography variant="body1">{event.horario}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Serviço</Typography>
                      <Typography variant="body1">{servico?.nome}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        R$ {servico?.preco?.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Profissional</Typography>
                      <Typography variant="body1">{profissional?.nome}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          icon={event.tipo === 'atendimento' ? <TimerIcon /> : <ScheduleIcon />}
                          label={getTipoLabel(event.tipo)}
                          size="small"
                          color={event.tipo === 'atendimento' ? 'warning' : 'info'}
                        />
                        <Chip
                          icon={getStatusIcon(event.status)}
                          label={getStatusLabel(event.status)}
                          size="small"
                          color={getStatusColor(event.status)}
                        />
                      </Box>
                    </Grid>
                    {event.observacoes && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">Observações</Typography>
                        <Typography variant="body2">{event.observacoes}</Typography>
                      </Grid>
                    )}
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    {event.tipo === 'agendamento' && event.status === 'confirmado' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => {
                          setOpenDayDialog(false);
                          iniciarAtendimento(event);
                        }}
                        sx={{ mr: 1 }}
                      >
                        Iniciar
                      </Button>
                    )}
                    {event.tipo === 'atendimento' && event.status === 'em_andamento' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        onClick={() => {
                          setOpenDayDialog(false);
                          continuarAtendimento(event);
                        }}
                        sx={{ mr: 1 }}
                      >
                        Continuar
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setOpenDayDialog(false);
                        if (event.tipo === 'agendamento') {
                          handleEdit(event);
                        }
                      }}
                    >
                      Ver detalhes
                    </Button>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDayDialog(false)}>Fechar</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenDayDialog(false);
              handleDayClick(selectedDayDetails.date);
            }}
            sx={{
              background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
            }}
          >
            Ver dia completo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Agendamento */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
          {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={formData.clienteId}
                    label="Cliente"
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  >
                    {clientes.map(cliente => (
                      <MenuItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    value={formData.profissionalId}
                    label="Profissional"
                    onChange={(e) => setFormData({ ...formData, profissionalId: e.target.value })}
                  >
                    {profissionais.map(prof => (
                      <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Serviço</InputLabel>
                  <Select
                    value={formData.servicoId}
                    label="Serviço"
                    onChange={(e) => setFormData({ ...formData, servicoId: e.target.value })}
                  >
                    {servicos.map(service => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.nome} - R$ {service.preco}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Horário</InputLabel>
                  <Select
                    value={formData.horario}
                    label="Horário"
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  >
                    {timeSlots.map(time => (
                      <MenuItem 
                        key={time} 
                        value={time}
                        disabled={!isHorarioDisponivel(time)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon fontSize="small" />
                          {time}
                          {!isHorarioDisponivel(time) && ' (Ocupado)'}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                  multiline
                  rows={3}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Alguma observação especial?"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              {selectedAppointment ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
          Cancelar Agendamento
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Tem certeza que deseja cancelar este agendamento?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Voltar</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={confirmDelete}
          >
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModernAgendamentos;
