import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  ContentCut as CutIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  ViewWeek as WeekIcon,
  ViewModule as MonthIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Dados mockados
const initialAppointments = [
  {
    id: 1,
    cliente: 'Maria Silva',
    servico: 'Corte de Cabelo',
    profissional: 'Ana Souza',
    data: '2024-03-15',
    horario: '09:00',
    status: 'confirmado',
    duracao: '60 min',
    preco: 'R$ 120,00',
    telefone: '(11) 99999-9999',
  },
  {
    id: 2,
    cliente: 'João Santos',
    servico: 'Barba',
    profissional: 'Carlos Lima',
    data: '2024-03-15',
    horario: '10:30',
    status: 'pendente',
    duracao: '30 min',
    preco: 'R$ 50,00',
    telefone: '(11) 88888-8888',
  },
  {
    id: 3,
    cliente: 'Ana Oliveira',
    servico: 'Manicure',
    profissional: 'Maria Clara',
    data: '2024-03-15',
    horario: '14:00',
    status: 'confirmado',
    duracao: '50 min',
    preco: 'R$ 80,00',
    telefone: '(11) 77777-7777',
  },
  {
    id: 4,
    cliente: 'Carlos Lima',
    servico: 'Tintura',
    profissional: 'Ana Souza',
    data: '2024-03-15',
    horario: '15:30',
    status: 'cancelado',
    duracao: '120 min',
    preco: 'R$ 250,00',
    telefone: '(11) 66666-6666',
  },
  {
    id: 5,
    cliente: 'Patrícia Santos',
    servico: 'Pedicure',
    profissional: 'Maria Clara',
    data: '2024-03-16',
    horario: '09:30',
    status: 'confirmado',
    duracao: '60 min',
    preco: 'R$ 90,00',
    telefone: '(11) 55555-5555',
  },
  {
    id: 6,
    cliente: 'Roberto Alves',
    servico: 'Corte Masculino',
    profissional: 'Carlos Lima',
    data: '2024-03-16',
    horario: '11:00',
    status: 'confirmado',
    duracao: '45 min',
    preco: 'R$ 70,00',
    telefone: '(11) 44444-4444',
  },
];

const professionals = [
  { id: 1, nome: 'Ana Souza', especialidade: 'Cabelo e Coloração' },
  { id: 2, nome: 'Carlos Lima', especialidade: 'Barba e Corte Masculino' },
  { id: 3, nome: 'Maria Clara', especialidade: 'Unhas' },
  { id: 4, nome: 'Joana Oliveira', especialidade: 'Maquiagem' },
];

const services = [
  { id: 1, nome: 'Corte de Cabelo', duracao: 60, preco: 120 },
  { id: 2, nome: 'Barba', duracao: 30, preco: 50 },
  { id: 3, nome: 'Manicure', duracao: 50, preco: 80 },
  { id: 4, nome: 'Pedicure', duracao: 60, preco: 90 },
  { id: 5, nome: 'Tintura', duracao: 120, preco: 250 },
  { id: 6, nome: 'Corte Masculino', duracao: 45, preco: 70 },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

function ModernAgendamentos() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewMode, setViewMode] = useState('day');
  const [selectedDate, setSelectedDate] = useState('2024-03-15');
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const handleAdd = () => {
    setSelectedAppointment(null);
    setOpenDialog(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      setAppointments(appointments.filter(apt => apt.id !== id));
      toast.success('Agendamento cancelado com sucesso!');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: newStatus } : apt
    ));
    toast.success(`Status alterado para ${newStatus}!`);
  };

  const handleSave = (event) => {
    event.preventDefault();
    toast.success(selectedAppointment ? 'Agendamento atualizado!' : 'Agendamento criado!');
    setOpenDialog(false);
  };

  // Filtrar agendamentos
  const filteredAppointments = appointments.filter(apt => {
    const dateMatch = apt.data === selectedDate;
    const professionalMatch = selectedProfessional === 'all' || apt.profissional === selectedProfessional;
    const statusMatch = selectedStatus === 'all' || apt.status === selectedStatus;
    return dateMatch && professionalMatch && statusMatch;
  });

  // Agrupar por horário para visualização
  const appointmentsByTime = timeSlots.reduce((acc, time) => {
    const apts = filteredAppointments.filter(apt => apt.horario === time);
    if (apts.length > 0) {
      acc[time] = apts;
    }
    return acc;
  }, {});

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmado': return 'success';
      case 'pendente': return 'warning';
      case 'cancelado': return 'error';
      case 'concluido': return 'info';
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
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Agendamentos
        </Typography>
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

      {/* Filtros e Controles */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Data"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Profissional</InputLabel>
                <Select
                  value={selectedProfessional}
                  label="Profissional"
                  onChange={(e) => setSelectedProfessional(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {professionals.map(prof => (
                    <MenuItem key={prof.id} value={prof.nome}>{prof.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
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
                  <MenuItem value="concluido">Concluído</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newView) => newView && setViewMode(newView)}
                sx={{ width: '100%' }}
              >
                <ToggleButton value="day" sx={{ flex: 1 }}>
                  <TodayIcon sx={{ mr: 1 }} /> Dia
                </ToggleButton>
                <ToggleButton value="week" sx={{ flex: 1 }}>
                  <WeekIcon sx={{ mr: 1 }} /> Semana
                </ToggleButton>
                <ToggleButton value="month" sx={{ flex: 1 }}>
                  <MonthIcon sx={{ mr: 1 }} /> Mês
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Timeline de Agendamentos */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Agenda - {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {timeSlots.map(time => {
              const appointmentsAtTime = filteredAppointments.filter(apt => apt.horario === time);
              if (appointmentsAtTime.length === 0 && viewMode === 'day') return null;

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
                      backgroundColor: appointmentsAtTime.length > 0 ? '#faf5ff' : 'transparent',
                    }}
                  >
                    <Box sx={{ minWidth: 80 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                        {time}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      {appointmentsAtTime.length > 0 ? (
                        <Grid container spacing={2}>
                          {appointmentsAtTime.map(apt => (
                            <Grid item xs={12} key={apt.id}>
                              <Card variant="outlined" sx={{ p: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                  <Grid item xs={12} sm={6} md={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar sx={{ bgcolor: '#9c27b0', width: 32, height: 32 }}>
                                        {apt.cliente.charAt(0)}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                          {apt.cliente}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                          {apt.telefone}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>

                                  <Grid item xs={12} sm={6} md={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <CutIcon fontSize="small" color="action" />
                                      <Typography variant="body2">{apt.servico}</Typography>
                                    </Box>
                                  </Grid>

                                  <Grid item xs={12} sm={6} md={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <PersonIcon fontSize="small" color="action" />
                                      <Typography variant="body2">{apt.profissional}</Typography>
                                    </Box>
                                  </Grid>

                                  <Grid item xs={12} sm={6} md={2}>
                                    <Chip
                                      icon={getStatusIcon(apt.status)}
                                      label={getStatusLabel(apt.status)}
                                      size="small"
                                      color={getStatusColor(apt.status)}
                                      sx={{ fontWeight: 500 }}
                                    />
                                  </Grid>

                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleStatusChange(apt.id, 'confirmado')}
                                        color="success"
                                        title="Confirmar"
                                      >
                                        <CheckIcon />
                                      </IconButton>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleEdit(apt)}
                                        color="primary"
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleDelete(apt.id)}
                                        color="error"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
          {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    defaultValue={selectedAppointment?.cliente || ''}
                    label="Cliente"
                    required
                  >
                    <MenuItem value="Maria Silva">Maria Silva</MenuItem>
                    <MenuItem value="João Santos">João Santos</MenuItem>
                    <MenuItem value="Ana Oliveira">Ana Oliveira</MenuItem>
                    <MenuItem value="Carlos Lima">Carlos Lima</MenuItem>
                    <MenuItem value="Patrícia Santos">Patrícia Santos</MenuItem>
                    <MenuItem value="Roberto Alves">Roberto Alves</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    defaultValue={selectedAppointment?.profissional || ''}
                    label="Profissional"
                    required
                  >
                    {professionals.map(prof => (
                      <MenuItem key={prof.id} value={prof.nome}>{prof.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Serviço</InputLabel>
                  <Select
                    defaultValue={selectedAppointment?.servico || ''}
                    label="Serviço"
                    required
                  >
                    {services.map(service => (
                      <MenuItem key={service.id} value={service.nome}>{service.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data"
                  defaultValue={selectedAppointment?.data || selectedDate}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Horário</InputLabel>
                  <Select
                    defaultValue={selectedAppointment?.horario || ''}
                    label="Horário"
                    required
                  >
                    {timeSlots.map(time => (
                      <MenuItem key={time} value={time}>{time}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    defaultValue={selectedAppointment?.status || 'pendente'}
                    label="Status"
                  >
                    <MenuItem value="pendente">Pendente</MenuItem>
                    <MenuItem value="confirmado">Confirmado</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                    <MenuItem value="concluido">Concluído</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
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
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default ModernAgendamentos;
