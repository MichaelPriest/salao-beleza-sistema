// src/pages/ModernAgendamentos.js
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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  ViewWeek as WeekIcon,
  ViewModule as MonthIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Timer as TimerIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// 🔥 Função para obter usuário do localStorage
const getUsuarioLocal = () => {
  try {
    const userStr = localStorage.getItem('usuario');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Funções auxiliares de data
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

// 🔥 Dados mockados para teste
const mockClientes = [
  { 
    id: '1', 
    nome: 'João Silva', 
    telefone: '(11) 99999-9999',
    email: 'joao@email.com',
    foto: null
  },
  { 
    id: '2', 
    nome: 'Maria Oliveira', 
    telefone: '(11) 98888-8888',
    email: 'maria@email.com',
    foto: null
  },
  { 
    id: '3', 
    nome: 'Carlos Santos', 
    telefone: '(11) 97777-7777',
    email: 'carlos@email.com',
    foto: null
  }
];

const mockProfissionais = [
  { id: '1', nome: 'Ana Souza', especialidade: 'Cabelo' },
  { id: '2', nome: 'Pedro Lima', especialidade: 'Barba' }
];

const mockServicos = [
  { id: '1', nome: 'Corte de Cabelo', preco: 50, duracao: 30 },
  { id: '2', nome: 'Barba', preco: 30, duracao: 20 },
  { id: '3', nome: 'Hidratação', preco: 80, duracao: 45 }
];

// 🔥 Dados mockados de agendamentos
const mockAgendamentos = [
  {
    id: '1',
    clienteId: '1',
    profissionalId: '1',
    data: formatDate(new Date()),
    horario: '09:00',
    status: 'confirmado',
    tipo: 'agendamento',
    servicos: [mockServicos[0]],
    valorTotal: 50,
    observacoes: 'Cliente regular'
  },
  {
    id: '2',
    clienteId: '2',
    profissionalId: '2',
    data: formatDate(new Date()),
    horario: '10:30',
    status: 'pendente',
    tipo: 'agendamento',
    servicos: [mockServicos[1], mockServicos[0]],
    valorTotal: 80,
    observacoes: ''
  }
];

// 🔥 Funções auxiliares
const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  return telefone;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function ModernAgendamentos() {
  const [usuario, setUsuario] = useState(null);
  const [cargo, setCargo] = useState('');
  const [agendamentos, setAgendamentos] = useState(mockAgendamentos);
  const [clientes] = useState(mockClientes);
  const [profissionais] = useState(mockProfissionais);
  const [loading, setLoading] = useState(false);
  
  const [viewMode, setViewMode] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    clienteId: '',
    profissionalId: '',
    data: selectedDate,
    horario: '',
    observacoes: '',
    status: 'pendente'
  });

  useEffect(() => {
    const user = getUsuarioLocal();
    setUsuario(user);
    setCargo(user?.cargo || '');
  }, []);

  // Filtrar eventos
  const filteredEvents = agendamentos.filter(event => {
    const professionalMatch = selectedProfessional === 'all' || event.profissionalId === selectedProfessional;
    const statusMatch = selectedStatus === 'all' || event.status === selectedStatus;
    const dataMatch = event.data === selectedDate;
    return professionalMatch && statusMatch && dataMatch;
  });

  const dayEvents = filteredEvents;

  const getClienteData = (clienteId) => {
    return clientes.find(c => c.id === clienteId) || null;
  };

  const getProfissionalData = (profissionalId) => {
    return profissionais.find(p => p.id === profissionalId) || null;
  };

  const handlePrevious = () => {
    const newDate = addDays(new Date(selectedDate), -1);
    setSelectedDate(formatDate(newDate));
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = addDays(new Date(selectedDate), 1);
    setSelectedDate(formatDate(newDate));
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(formatDate(today));
  };

  const handleAdd = () => {
    setSelectedAppointment(null);
    setFormData({
      clienteId: '',
      profissionalId: '',
      data: selectedDate,
      horario: '',
      observacoes: '',
      status: 'pendente'
    });
    setOpenDialog(true);
  };

  const handleEdit = (event) => {
    setSelectedAppointment(event);
    setFormData({
      clienteId: event.clienteId,
      profissionalId: event.profissionalId,
      data: event.data,
      horario: event.horario,
      observacoes: event.observacoes || '',
      status: event.status
    });
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    setAppointmentToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    setAgendamentos(agendamentos.filter(a => a.id !== appointmentToDelete));
    toast.success('Agendamento cancelado com sucesso!');
    setOpenDeleteDialog(false);
    setAppointmentToDelete(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.profissionalId || !formData.horario) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (selectedAppointment) {
      // Editar
      setAgendamentos(agendamentos.map(a => 
        a.id === selectedAppointment.id 
          ? { ...a, ...formData, servicos: a.servicos }
          : a
      ));
      toast.success('Agendamento atualizado!');
    } else {
      // Novo
      const novoAgendamento = {
        id: Date.now().toString(),
        ...formData,
        tipo: 'agendamento',
        servicos: [mockServicos[0]],
        valorTotal: 50
      };
      setAgendamentos([...agendamentos, novoAgendamento]);
      toast.success('Agendamento criado!');
    }
    
    setOpenDialog(false);
  };

  const handleStatusChange = (id, newStatus) => {
    setAgendamentos(agendamentos.map(a => 
      a.id === id ? { ...a, status: newStatus } : a
    ));
    toast.success(`Status alterado para ${newStatus}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmado': return 'success';
      case 'pendente': return 'warning';
      case 'cancelado': return 'error';
      case 'finalizado': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmado': return <CheckIcon />;
      case 'pendente': return <ScheduleIcon />;
      case 'cancelado': return <CancelIcon />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Finalizado';
      default: return status;
    }
  };

  const isHorarioDisponivel = (horario) => {
    return !agendamentos.some(apt => 
      apt.data === formData.data && 
      apt.horario === horario && 
      apt.profissionalId === formData.profissionalId &&
      apt.id !== selectedAppointment?.id &&
      apt.status !== 'cancelado'
    );
  };

  const getHeaderText = () => {
    return new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Agenda
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie os agendamentos do salão
          </Typography>
        </Box>
        
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
            <ToggleButton value="week" disabled>
              <WeekIcon sx={{ mr: 1 }} /> Semana
            </ToggleButton>
            <ToggleButton value="month" disabled>
              <MonthIcon sx={{ mr: 1 }} /> Mês
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
            }}
          >
            Novo Agendamento
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
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
            
            <Grid item xs={12} md={3}>
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

            <Grid item xs={12} md={3}>
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
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                  <MenuItem value="finalizado">Finalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Chip 
                label={`${dayEvents.length} agendamento(s)`} 
                color="primary" 
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Visualização por Dia */}
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
                        eventsAtTime.map(event => {
                          const cliente = getClienteData(event.clienteId);
                          const profissional = getProfissionalData(event.profissionalId);
                          const servicosLista = event.servicos || [];

                          return (
                            <Card key={event.id} variant="outlined" sx={{ 
                              p: 2,
                              mb: 1,
                              borderLeft: '4px solid',
                              borderLeftColor: 
                                event.status === 'confirmado' ? '#4caf50' :
                                event.status === 'pendente' ? '#ff9800' :
                                event.status === 'cancelado' ? '#f44336' : '#9c27b0',
                            }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6} md={4}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar 
                                      sx={{ 
                                        bgcolor: '#9c27b0',
                                        width: 48,
                                        height: 48
                                      }}
                                    >
                                      {cliente?.nome?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {cliente?.nome}
                                      </Typography>
                                      {cliente?.telefone && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <PhoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                          <Typography variant="caption" color="textSecondary">
                                            {formatarTelefone(cliente.telefone)}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant="body2">
                                    {profissional?.nome}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {servicosLista.length} serviço(s)
                                  </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6} md={2}>
                                  <Chip
                                    icon={getStatusIcon(event.status)}
                                    label={getStatusLabel(event.status)}
                                    size="small"
                                    color={getStatusColor(event.status)}
                                  />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    {event.status === 'pendente' && (
                                      <>
                                        <Tooltip title="Confirmar">
                                          <IconButton 
                                            size="small" 
                                            onClick={() => handleStatusChange(event.id, 'confirmado')}
                                            color="success"
                                          >
                                            <CheckIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancelar">
                                          <IconButton 
                                            size="small" 
                                            onClick={() => handleStatusChange(event.id, 'cancelado')}
                                            color="error"
                                          >
                                            <CancelIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    )}
                                    
                                    <Tooltip title="Editar">
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleEdit(event)}
                                        color="primary"
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    
                                    {event.status !== 'finalizado' && event.status !== 'cancelado' && (
                                      <Tooltip title="Excluir">
                                        <IconButton 
                                          size="small" 
                                          onClick={() => handleDelete(event.id)}
                                          color="error"
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>

                              {event.observacoes && (
                                <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #9c27b0' }}>
                                  <Typography variant="caption" color="textSecondary">
                                    <strong>Obs:</strong> {event.observacoes}
                                  </Typography>
                                </Box>
                              )}
                            </Card>
                          );
                        })
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

      {/* Dialog de Agendamento */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={formData.clienteId}
                    label="Cliente"
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  >
                    {clientes.map(cliente => (
                      <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required size="small">
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
                <TextField
                  fullWidth
                  type="date"
                  label="Data"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Horário</InputLabel>
                  <Select
                    value={formData.horario}
                    label="Horário"
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  >
                    <MenuItem value="">Selecione</MenuItem>
                    {timeSlots.map(time => (
                      <MenuItem 
                        key={time} 
                        value={time}
                        disabled={!isHorarioDisponivel(time)}
                      >
                        {time} {!isHorarioDisponivel(time) && '(Ocupado)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  size="small"
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
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
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
