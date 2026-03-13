// src/pages/Agenda.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
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
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Collapse,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Autocomplete,
  Snackbar,
  Fab,
  Zoom,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
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
  Search as SearchIcon,
  Clear as ClearIcon,
  PersonSearch as PersonSearchIcon,
  Fingerprint as FingerprintIcon,
  Cake as CakeIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  AttachMoney as AttachMoneyIcon,
  Work as WorkIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  Done as DoneIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../hooks/useFirebase';
import { firebaseService } from '../services/firebase';
import { notificacoesService } from '../services/notificacoesService';
import { Timestamp } from 'firebase/firestore';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO, differenceInMinutes } from 'date-fns';

// Importações para PDF e Excel
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ============================================
// CONSTANTES
// ============================================

const COLORS = [
  '#9c27b0', '#ff4081', '#7b1fa2', '#ba68c8', 
  '#f44336', '#2196f3', '#4caf50', '#ff9800',
  '#00bcd4', '#795548', '#607d8b', '#e91e63'
];

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente', icon: <TimerIcon /> },
  confirmado: { color: '#4caf50', label: 'Confirmado', icon: <CheckIcon /> },
  cancelado: { color: '#f44336', label: 'Cancelado', icon: <CancelIcon /> },
  finalizado: { color: '#9e9e9e', label: 'Finalizado', icon: <CheckIcon /> },
  em_andamento: { color: '#9c27b0', label: 'Em Andamento', icon: <TimerIcon /> },
  agendado: { color: '#2196f3', label: 'Agendado', icon: <ScheduleIcon /> },
};

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const AppointmentCard = ({ appointment, client, service, professional, onClick, onStatusChange }) => {
  const statusInfo = statusColors[appointment.status] || statusColors.pendente;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 1,
          cursor: 'pointer',
          borderLeft: 4,
          borderLeftColor: statusInfo.color,
          '&:hover': { bgcolor: '#faf5ff', borderColor: statusInfo.color },
          transition: 'all 0.2s'
        }}
        onClick={() => onClick && onClick(appointment)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: statusInfo.color, width: 40, height: 40 }}>
              {statusInfo.icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {appointment.horario}
                </Typography>
                <Chip
                  label={statusInfo.label}
                  size="small"
                  sx={{
                    bgcolor: `${statusInfo.color}20`,
                    color: statusInfo.color,
                    fontWeight: 500,
                    height: 20,
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {client?.nome || 'Cliente não identificado'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  label={service?.nome || 'Serviço'}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
                <Chip
                  label={professional?.nome || 'Profissional'}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Box>
              {appointment.observacoes && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  📝 {appointment.observacoes.length > 30 
                    ? `${appointment.observacoes.substring(0, 30)}...` 
                    : appointment.observacoes}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TimeSlotColumn = ({ time, appointments, clients, services, professionals, onAppointmentClick, onStatusChange }) => {
  const appointmentsAtTime = appointments.filter(apt => apt.horario === time);
  
  return (
    <Box sx={{ mb: 2 }}>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          backgroundColor: appointmentsAtTime.length > 0 ? '#faf5ff' : 'transparent',
          borderLeft: appointmentsAtTime.length > 0 ? '4px solid #9c27b0' : 'none',
        }}
      >
        <Box sx={{ minWidth: 80 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0' }}>
            {time}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {appointmentsAtTime.length} agendamento(s)
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          {appointmentsAtTime.length > 0 ? (
            <AnimatePresence>
              <Grid container spacing={2}>
                {appointmentsAtTime.map(apt => {
                  const cliente = clients?.find(c => c.id === apt.clienteId);
                  const servico = services?.find(s => s.id === apt.servicoId);
                  const profissional = professionals?.find(p => p.id === apt.profissionalId);
                  
                  return (
                    <Grid item xs={12} key={apt.id}>
                      <AppointmentCard
                        appointment={apt}
                        client={cliente}
                        service={servico}
                        professional={profissional}
                        onClick={onAppointmentClick}
                        onStatusChange={onStatusChange}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </AnimatePresence>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', py: 2 }}>
              Horário disponível
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

const DayView = ({ date, appointments, clients, services, professionals, onAppointmentClick, onStatusChange }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textTransform: 'capitalize' }}>
        {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {timeSlots.map(time => (
          <TimeSlotColumn
            key={time}
            time={time}
            appointments={appointments.filter(apt => apt.data === format(date, 'yyyy-MM-dd'))}
            clients={clients}
            services={services}
            professionals={professionals}
            onAppointmentClick={onAppointmentClick}
            onStatusChange={onStatusChange}
          />
        ))}
      </Box>
    </Box>
  );
};

const WeekView = ({ date, appointments, clients, services, professionals, onAppointmentClick, onStatusChange, onDayClick }) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekDays_list = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Semana de {format(weekStart, 'dd/MM')} a {format(addDays(weekStart, 6), 'dd/MM/yyyy')}
      </Typography>

      <Grid container spacing={2}>
        {weekDays_list.map((day, index) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayAppointments = appointments.filter(apt => apt.data === dayStr);
          
          return (
            <Grid item xs={12} md={6} lg key={index}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: isToday(day) ? '#f3e5f5' : 'white',
                    border: isToday(day) ? '2px solid #9c27b0' : '1px solid rgba(0,0,0,0.12)',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => onDayClick(day)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                        {weekDaysShort[index]}
                      </Typography>
                      <Chip
                        label={format(day, 'dd')}
                        size="small"
                        color={isToday(day) ? 'secondary' : 'default'}
                      />
                    </Box>
                    
                    {dayAppointments.length > 0 ? (
                      <Box>
                        {dayAppointments.slice(0, 3).map(apt => {
                          const cliente = clients?.find(c => c.id === apt.clienteId);
                          return (
                            <Box key={apt.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: statusColors[apt.status]?.color || '#9e9e9e',
                                }}
                              />
                              <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem' }}>
                                {apt.horario} - {cliente?.nome?.split(' ')[0] || 'Cliente'}
                              </Typography>
                            </Box>
                          );
                        })}
                        {dayAppointments.length > 3 && (
                          <Typography variant="caption" color="textSecondary">
                            +{dayAppointments.length - 3} mais
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Sem agendamentos
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

const MonthView = ({ date, appointments, clients, onDayClick }) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weeks = [];
  
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textTransform: 'capitalize' }}>
        {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
      </Typography>

      <Grid container spacing={1} sx={{ mb: 2 }}>
        {weekDaysShort.map(day => (
          <Grid item xs key={day}>
            <Typography variant="subtitle2" align="center" sx={{ fontWeight: 600, color: '#9c27b0' }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {weeks.map((week, weekIndex) => (
        <Grid container spacing={1} key={weekIndex} sx={{ mb: 1 }}>
          {week.map((day, dayIndex) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayAppointments = appointments.filter(apt => apt.data === dayStr);
            const isCurrentMonth = day.getMonth() === date.getMonth();
            
            return (
              <Grid item xs key={dayIndex}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      p: 1,
                      minHeight: 100,
                      cursor: 'pointer',
                      bgcolor: isToday(day) ? '#f3e5f5' : 'white',
                      opacity: isCurrentMonth ? 1 : 0.5,
                      border: isToday(day) ? '2px solid #9c27b0' : '1px solid rgba(0,0,0,0.12)',
                      '&:hover': { boxShadow: 3, bgcolor: '#faf5ff' }
                    }}
                    onClick={() => onDayClick(day)}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {format(day, 'dd')}
                    </Typography>
                    
                    {dayAppointments.length > 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={dayAppointments.length}
                            size="small"
                            sx={{
                              bgcolor: '#9c27b0',
                              color: 'white',
                              height: 20,
                              fontSize: '0.65rem'
                            }}
                          />
                        </Box>
                        
                        {dayAppointments.slice(0, 2).map(apt => {
                          const cliente = clients?.find(c => c.id === apt.clienteId);
                          return (
                            <Box key={apt.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: statusColors[apt.status]?.color || '#9e9e9e',
                                }}
                              />
                              <Typography variant="caption" noWrap sx={{ fontSize: '0.6rem' }}>
                                {apt.horario}
                              </Typography>
                            </Box>
                          );
                        })}
                        
                        {dayAppointments.length > 2 && (
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem' }}>
                            +{dayAppointments.length - 2}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      ))}
    </Box>
  );
};

const AppointmentDetailsDialog = ({ open, appointment, onClose, clients, services, professionals, onEdit, onDelete, onStatusChange, onStart }) => {
  if (!appointment) return null;

  const cliente = clients?.find(c => c.id === appointment.clienteId);
  const servico = services?.find(s => s.id === appointment.servicoId);
  const profissional = professionals?.find(p => p.id === appointment.profissionalId);
  const statusInfo = statusColors[appointment.status] || statusColors.pendente;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: statusInfo.color, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        {statusInfo.icon} Detalhes do Agendamento
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: statusInfo.color, width: 56, height: 56 }}>
                {cliente?.nome?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="h6">{cliente?.nome || 'Cliente não identificado'}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {cliente?.telefone || 'Telefone não informado'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">Data</Typography>
            <Typography variant="body1">{appointment.data ? format(parseISO(appointment.data), 'dd/MM/yyyy') : '-'}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">Horário</Typography>
            <Typography variant="body1">{appointment.horario || '-'}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">Serviço</Typography>
            <Typography variant="body1">{servico?.nome || 'Serviço não informado'}</Typography>
            {servico?.preco && (
              <Typography variant="caption" color="primary">
                R$ {servico.preco.toFixed(2)}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">Profissional</Typography>
            <Typography variant="body1">{profissional?.nome || 'Profissional não informado'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.label}
              sx={{ bgcolor: `${statusInfo.color}20`, color: statusInfo.color, mt: 1 }}
            />
          </Grid>

          {appointment.observacoes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">Observações</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body2">{appointment.observacoes}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Fechar
        </Button>
        
        {appointment.status === 'confirmado' && (
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayIcon />}
            onClick={() => onStart(appointment)}
          >
            Iniciar Atendimento
          </Button>
        )}
        
        {appointment.status === 'pendente' && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={() => onStatusChange(appointment.id, 'confirmado')}
            >
              Confirmar
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => onStatusChange(appointment.id, 'cancelado')}
            >
              Cancelar
            </Button>
          </>
        )}
        
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onEdit(appointment)}
        >
          Editar
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(appointment.id)}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AppointmentFormDialog = ({ open, onClose, onSubmit, appointment, clients, services, professionals, selectedDate }) => {
  const [formData, setFormData] = useState({
    clienteId: '',
    profissionalId: '',
    servicoId: '',
    data: selectedDate || format(new Date(), 'yyyy-MM-dd'),
    horario: '',
    observacoes: '',
    status: 'pendente',
  });

  const [searchClientTerm, setSearchClientTerm] = useState('');
  const [searchClientResults, setSearchClientResults] = useState([]);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [searchClientType, setSearchClientType] = useState('nome');
  const [cpfInput, setCpfInput] = useState('');
  const [dataNascimentoInput, setDataNascimentoInput] = useState(null);
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);

  useEffect(() => {
    if (open) {
      if (appointment) {
        setFormData({
          clienteId: appointment.clienteId || '',
          profissionalId: appointment.profissionalId || '',
          servicoId: appointment.servicoId || '',
          data: appointment.data || selectedDate || format(new Date(), 'yyyy-MM-dd'),
          horario: appointment.horario || '',
          observacoes: appointment.observacoes || '',
          status: appointment.status || 'pendente',
        });
      } else {
        setFormData({
          clienteId: '',
          profissionalId: '',
          servicoId: '',
          data: selectedDate || format(new Date(), 'yyyy-MM-dd'),
          horario: '',
          observacoes: '',
          status: 'pendente',
        });
      }
    }
  }, [open, appointment, selectedDate]);

  useEffect(() => {
    if (formData.profissionalId && services) {
      const profissional = professionals?.find(p => p.id === formData.profissionalId);
      if (profissional && profissional.servicosIds) {
        const servicosDoProfissional = services.filter(s => 
          profissional.servicosIds.includes(s.id) && s.ativo !== false
        );
        setServicosDisponiveis(servicosDoProfissional);
      } else {
        setServicosDisponiveis(services.filter(s => s.ativo !== false));
      }
    } else {
      setServicosDisponiveis([]);
    }
  }, [formData.profissionalId, services, professionals]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatarCPF = (cpf) => {
    if (!cpf) return '';
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const removerMascaraCPF = (cpf) => {
    return cpf ? cpf.replace(/\D/g, '') : '';
  };

  const buscarClientes = () => {
    if (!clients) return [];

    let resultados = [];

    switch (searchClientType) {
      case 'nome':
        if (!searchClientTerm || searchClientTerm.length < 2) return [];
        resultados = clients.filter(cliente => 
          cliente.nome?.toLowerCase().includes(searchClientTerm.toLowerCase())
        );
        break;
      case 'cpf':
        if (!cpfInput || cpfInput.length < 3) return [];
        const cpfBusca = removerMascaraCPF(cpfInput);
        resultados = clients.filter(cliente => {
          const cpfCliente = removerMascaraCPF(cliente.cpf || '');
          return cpfCliente.includes(cpfBusca);
        });
        break;
      case 'dataNascimento':
        if (!dataNascimentoInput) return [];
        const dataBusca = format(dataNascimentoInput, 'yyyy-MM-dd');
        resultados = clients.filter(cliente => {
          const dataCliente = cliente.dataNascimento ? 
            format(new Date(cliente.dataNascimento), 'yyyy-MM-dd') : '';
          return dataCliente === dataBusca;
        });
        break;
      default:
        break;
    }

    return resultados.slice(0, 10);
  };

  useEffect(() => {
    if (showClientSearch) {
      const resultados = buscarClientes();
      setSearchClientResults(resultados);
    }
  }, [searchClientTerm, cpfInput, dataNascimentoInput, searchClientType, clients, showClientSearch]);

  const handleSelectClient = (cliente) => {
    setFormData({ ...formData, clienteId: cliente.id });
    setShowClientSearch(false);
  };

  const isHorarioDisponivel = (horario) => {
    if (!formData.profissionalId || !formData.data) return true;
    // Aqui você pode implementar a lógica para verificar se o horário está disponível
    return true;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
        {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Seleção de Cliente */}
            <Grid item xs={12}>
              {!formData.clienteId ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                      Selecione o Cliente
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<PersonSearchIcon />}
                      onClick={() => setShowClientSearch(!showClientSearch)}
                      variant="contained"
                      sx={{ bgcolor: '#9c27b0' }}
                    >
                      Buscar Cliente
                    </Button>
                  </Box>

                  <Collapse in={showClientSearch}>
                    <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#faf5ff' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#9c27b0' }}>
                        🔍 Buscar cliente por:
                      </Typography>
                      
                      <RadioGroup
                        row
                        value={searchClientType}
                        onChange={(e) => setSearchClientType(e.target.value)}
                        sx={{ mb: 2 }}
                      >
                        <FormControlLabel value="nome" control={<Radio />} label="Nome" />
                        <FormControlLabel value="cpf" control={<Radio />} label="CPF" />
                        <FormControlLabel value="dataNascimento" control={<Radio />} label="Data de Nascimento" />
                      </RadioGroup>

                      {searchClientType === 'nome' && (
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Digite o nome do cliente..."
                          value={searchClientTerm}
                          onChange={(e) => setSearchClientTerm(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonSearchIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          autoFocus
                        />
                      )}

                      {searchClientType === 'cpf' && (
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Digite o CPF (apenas números)"
                          value={cpfInput}
                          onChange={(e) => setCpfInput(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <FingerprintIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          autoFocus
                        />
                      )}

                      {searchClientType === 'dataNascimento' && (
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                          <DatePicker
                            label="Data de Nascimento"
                            value={dataNascimentoInput}
                            onChange={(newValue) => setDataNascimentoInput(newValue)}
                            renderInput={(params) => 
                              <TextField {...params} fullWidth size="small" />
                            }
                          />
                        </LocalizationProvider>
                      )}

                      {searchClientResults.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="textSecondary">
                            {searchClientResults.length} cliente(s) encontrado(s):
                          </Typography>
                          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {searchClientResults.map((cliente) => (
                              <React.Fragment key={cliente.id}>
                                <ListItem 
                                  button
                                  onClick={() => handleSelectClient(cliente)}
                                  sx={{ borderRadius: 1 }}
                                >
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: '#9c27b0' }}>
                                      {cliente.nome?.charAt(0)}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {cliente.nome}
                                        </Typography>
                                        {cliente.cpf && (
                                          <Chip
                                            label={formatarCPF(cliente.cpf)}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem' }}
                                          />
                                        )}
                                      </Box>
                                    }
                                    secondary={
                                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                        {cliente.telefone && (
                                          <Typography variant="caption">
                                            📞 {cliente.telefone}
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItem>
                                <Divider />
                              </React.Fragment>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Card>
                  </Collapse>
                </Box>
              ) : (
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#f3e5f5' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                      {clients?.find(c => c.id === formData.clienteId)?.nome?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {clients?.find(c => c.id === formData.clienteId)?.nome}
                      </Typography>
                      <Typography variant="caption">
                        {clients?.find(c => c.id === formData.clienteId)?.telefone}
                      </Typography>
                    </Box>
                    <Tooltip title="Trocar cliente">
                      <IconButton onClick={() => setFormData({ ...formData, clienteId: '' })} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              )}
            </Grid>

            {/* Profissional */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Profissional</InputLabel>
                <Select
                  name="profissionalId"
                  value={formData.profissionalId}
                  onChange={handleChange}
                  label="Profissional"
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {professionals?.map(prof => (
                    <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Serviço */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required disabled={!formData.profissionalId}>
                <InputLabel>Serviço</InputLabel>
                <Select
                  name="servicoId"
                  value={formData.servicoId}
                  onChange={handleChange}
                  label="Serviço"
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {servicosDisponiveis.map(serv => (
                    <MenuItem key={serv.id} value={serv.id}>
                      {serv.nome} - R$ {serv.preco?.toFixed(2)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Data */}
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data"
                  value={formData.data ? parseISO(formData.data) : null}
                  onChange={(newValue) => setFormData({ 
                    ...formData, 
                    data: newValue ? format(newValue, 'yyyy-MM-dd') : '' 
                  })}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" required />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            {/* Horário */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Horário</InputLabel>
                <Select
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  label="Horário"
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {timeSlots.map(time => (
                    <MenuItem key={time} value={time}>{time}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="confirmado">Confirmado</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                multiline
                rows={3}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{ bgcolor: '#9c27b0' }}
          >
            {appointment ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const DeleteConfirmDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
        Confirmar Exclusão
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Tem certeza que deseja excluir este agendamento?
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Esta ação não poderá ser desfeita.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          variant="contained" 
          color="error"
          onClick={onConfirm}
        >
          Confirmar Exclusão
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RelatorioAgenda = React.forwardRef(({ 
  eventos, 
  profissional, 
  periodo, 
  clientes,
  profissionais,
  servicos,
  dataInicio,
  dataFim
}, ref) => {
  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const getStatusInfo = (status) => {
    return statusColors[status] || { color: '#9e9e9e', label: status };
  };

  return (
    <Box ref={ref} sx={{ p: 4, fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #9c27b0', pb: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#9c27b0', mb: 1 }}>
          Salão de Beleza
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
          Relatório de Agenda
        </Typography>
        <Typography variant="h5" sx={{ mt: 1, color: '#555' }}>
          {profissional === 'all' ? 'Todos os Profissionais' : 
            profissionais?.find(p => p.id === profissional)?.nome || 'Profissional'}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
          Período: {formatarData(dataInicio)} - {formatarData(dataFim)}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Emitido em: {new Date().toLocaleString('pt-BR')}
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#333', borderBottom: '1px solid #ccc', pb: 1 }}>
          Resumo do Período
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Total de Eventos</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {eventos.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Confirmados</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {eventos.filter(e => e.status === 'confirmado').length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Pendentes</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {eventos.filter(e => e.status === 'pendente').length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Cancelados</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {eventos.filter(e => e.status === 'cancelado').length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Eventos por Dia */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#333', borderBottom: '1px solid #ccc', pb: 1 }}>
          Agenda Detalhada
        </Typography>
        
        {Object.entries(
          eventos.reduce((acc, evento) => {
            const data = evento.data;
            if (!acc[data]) acc[data] = [];
            acc[data].push(evento);
            return acc;
          }, {})
        ).sort(([dataA], [dataB]) => dataA.localeCompare(dataB)).map(([data, eventosDoDia]) => {
          const eventosOrdenados = eventosDoDia.sort((a, b) => 
            (a.horario || '').localeCompare(b.horario || '')
          );

          return (
            <Card key={data} variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#9c27b0' }}>
                  {formatarData(data)}
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                        <TableCell><strong>Horário</strong></TableCell>
                        <TableCell><strong>Cliente</strong></TableCell>
                        <TableCell><strong>Serviço</strong></TableCell>
                        <TableCell><strong>Profissional</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eventosOrdenados.map(evento => {
                        const cliente = clientes?.find(c => c.id === evento.clienteId);
                        const servico = servicos?.find(s => s.id === evento.servicoId);
                        const profissional = profissionais?.find(p => p.id === evento.profissionalId);
                        const statusInfo = getStatusInfo(evento.status);
                        
                        return (
                          <TableRow key={evento.id}>
                            <TableCell>{evento.horario}</TableCell>
                            <TableCell>{cliente?.nome || '—'}</TableCell>
                            <TableCell>{servico?.nome || '—'}</TableCell>
                            <TableCell>{profissional?.nome || '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={statusInfo.label}
                                size="small"
                                sx={{ bgcolor: `${statusInfo.color}20`, color: statusInfo.color }}
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
          );
        })}
      </Box>

      {/* Rodapé */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary', borderTop: '1px solid #ccc', pt: 2 }}>
        <Typography variant="caption">
          Relatório gerado automaticamente pelo sistema • Documento não fiscal
        </Typography>
      </Box>
    </Box>
  );
});

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function Agenda() {
  const navigate = useNavigate();
  
  // Estados de visualização
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Estados de filtro
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Estados de diálogos
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRelatorioDialog, setOpenRelatorioDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  
  // Estados de exportação
  const [periodoRelatorio, setPeriodoRelatorio] = useState({
    tipo: 'mes',
    dataInicio: format(new Date(), 'yyyy-MM-dd'),
    dataFim: format(new Date(), 'yyyy-MM-dd')
  });
  const relatorioRef = useRef(null);
  
  // Estados de UI
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Hooks do Firebase
  const { data: agendamentos, loading: loadingAgendamentos, error: errorAgendamentos, adicionar, atualizar, excluir } = useFirebase('agendamentos');
  const { data: atendimentos } = useFirebase('atendimentos');
  const { data: clientes, loading: loadingClientes } = useFirebase('clientes');
  const { data: profissionais, loading: loadingProfissionais } = useFirebase('profissionais');
  const { data: servicos, loading: loadingServicos } = useFirebase('servicos');

  useEffect(() => {
    if (!loadingAgendamentos && !loadingClientes && !loadingProfissionais && !loadingServicos) {
      setLoading(false);
    }
  }, [loadingAgendamentos, loadingClientes, loadingProfissionais, loadingServicos]);

  // Combinar agendamentos e atendimentos
  const todosEventos = [
    ...(agendamentos || []).map(apt => ({
      ...apt,
      tipo: 'agendamento',
    })),
    ...(atendimentos || []).map(att => ({
      ...att,
      tipo: 'atendimento',
      horario: att.horaInicio,
    }))
  ];

  // Filtrar eventos
  const filteredEvents = todosEventos.filter(event => {
    const professionalMatch = selectedProfessional === 'all' || event.profissionalId === selectedProfessional;
    const statusMatch = selectedStatus === 'all' || event.status === selectedStatus;
    return professionalMatch && statusMatch;
  });

  // Estatísticas do dia
  const hojeStr = format(new Date(), 'yyyy-MM-dd');
  const eventosHoje = filteredEvents.filter(e => e.data === hojeStr);
  const stats = {
    total: eventosHoje.length,
    confirmados: eventosHoje.filter(e => e.status === 'confirmado').length,
    pendentes: eventosHoje.filter(e => e.status === 'pendente').length,
    cancelados: eventosHoje.filter(e => e.status === 'cancelado').length,
    em_andamento: eventosHoje.filter(e => e.status === 'em_andamento').length,
  };

  // Handlers de navegação
  const handlePrevious = () => {
    if (viewMode === 'day') {
      setCurrentDate(subDays(currentDate, 1));
      setSelectedDate(format(subDays(currentDate, 1), 'yyyy-MM-dd'));
    } else if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1));
      setSelectedDate(format(addDays(currentDate, 1), 'yyyy-MM-dd'));
    } else if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(format(today, 'yyyy-MM-dd'));
  };

  const handleDayClick = (date) => {
    setCurrentDate(date);
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setViewMode('day');
  };

  // Handlers de agendamentos
  const handleAdd = () => {
    setSelectedAppointment(null);
    setOpenFormDialog(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenFormDialog(true);
    setOpenDetailsDialog(false);
  };

  const handleDelete = (id) => {
    setAppointmentToDelete(id);
    setOpenDeleteDialog(true);
    setOpenDetailsDialog(false);
  };

  const confirmDelete = async () => {
    try {
      await excluir(appointmentToDelete);
      setUpdateTrigger(prev => prev + 1);
      mostrarSnackbar('Agendamento excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      mostrarSnackbar('Erro ao excluir agendamento', 'error');
    }
    setOpenDeleteDialog(false);
    setAppointmentToDelete(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await atualizar(id, { status: newStatus });
      setUpdateTrigger(prev => prev + 1);
      mostrarSnackbar(`Status alterado para ${statusColors[newStatus]?.label || newStatus}!`, 'success');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarSnackbar('Erro ao alterar status', 'error');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (!formData.clienteId) {
        mostrarSnackbar('Selecione um cliente', 'error');
        return;
      }
      if (!formData.profissionalId) {
        mostrarSnackbar('Selecione um profissional', 'error');
        return;
      }
      if (!formData.servicoId) {
        mostrarSnackbar('Selecione um serviço', 'error');
        return;
      }
      if (!formData.horario) {
        mostrarSnackbar('Selecione um horário', 'error');
        return;
      }

      if (selectedAppointment) {
        await atualizar(selectedAppointment.id, formData);
        mostrarSnackbar('Agendamento atualizado!', 'success');
      } else {
        await adicionar(formData);
        mostrarSnackbar('Agendamento criado!', 'success');
      }

      setUpdateTrigger(prev => prev + 1);
      setOpenFormDialog(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      mostrarSnackbar('Erro ao salvar agendamento', 'error');
    }
  };

  const handleStartAtendimento = async (appointment) => {
    try {
      const atendimentoExistente = (atendimentos || []).find(a => a.agendamentoId === appointment.id);
      
      if (atendimentoExistente) {
        navigate(`/atendimento/${atendimentoExistente.id}`);
        return;
      }

      const servico = servicos?.find(s => s.id === appointment.servicoId);

      const novoAtendimento = {
        agendamentoId: appointment.id,
        clienteId: appointment.clienteId,
        profissionalId: appointment.profissionalId,
        servicoId: appointment.servicoId,
        servicoNome: servico?.nome,
        data: appointment.data,
        horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'em_andamento',
        observacoes: appointment.observacoes || '',
        itensServico: [{
          id: servico?.id,
          nome: servico?.nome,
          preco: servico?.preco || 0,
          principal: true
        }],
        itensProduto: [],
        valorTotal: servico?.preco || 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const atendimentoCriado = await firebaseService.add('atendimentos', novoAtendimento);
      
      await atualizar(appointment.id, { 
        status: 'em_andamento',
        updatedAt: Timestamp.now()
      });

      setUpdateTrigger(prev => prev + 1);
      navigate(`/atendimento/${atendimentoCriado.id}`);
      
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      mostrarSnackbar('Erro ao iniciar atendimento', 'error');
    }
  };

  // Handlers de exportação
  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenRelatorio = () => {
    setOpenRelatorioDialog(true);
  };

  const handleCloseRelatorio = () => {
    setOpenRelatorioDialog(false);
  };

  const handlePrint = () => {
    try {
      mostrarSnackbar('Preparando impressão...', 'info');
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        mostrarSnackbar('Pop-up bloqueado. Permita pop-ups para imprimir.', 'error');
        return;
      }
      
      const content = relatorioRef.current;
      if (!content) {
        mostrarSnackbar('Conteúdo não disponível para impressão', 'error');
        return;
      }
      
      const contentClone = content.cloneNode(true);
      
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      let stylesHTML = '';
      styles.forEach(style => {
        if (style.tagName === 'STYLE') {
          stylesHTML += style.outerHTML;
        } else if (style.tagName === 'LINK') {
          stylesHTML += style.outerHTML;
        }
      });
      
      const printHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Relatório de Agenda</title>
            ${stylesHTML}
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${contentClone.outerHTML}
          </body>
        </html>
      `;
      
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        mostrarSnackbar('Impressão concluída!', 'success');
      }, 500);
      
    } catch (error) {
      console.error('Erro na impressão:', error);
      mostrarSnackbar('Erro ao imprimir', 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      mostrarSnackbar('Gerando PDF...', 'info');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Filtrar eventos pelo período
      let eventosFiltrados = filteredEvents;
      if (periodoRelatorio.tipo === 'dia') {
        eventosFiltrados = eventosFiltrados.filter(e => e.data === periodoRelatorio.dataInicio);
      } else {
        eventosFiltrados = eventosFiltrados.filter(e => 
          e.data >= periodoRelatorio.dataInicio && e.data <= periodoRelatorio.dataFim
        );
      }

      // Ordenar por data e horário
      eventosFiltrados.sort((a, b) => {
        if (a.data !== b.data) return a.data.localeCompare(b.data);
        return (a.horario || '').localeCompare(b.horario || '');
      });

      // Título
      doc.setFontSize(20);
      doc.setTextColor(156, 39, 176);
      doc.text('Relatório de Agenda', pageWidth / 2, 20, { align: 'center' });
      
      // Subtítulo
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const profissionalNome = selectedProfessional === 'all' ? 'Todos os Profissionais' : 
        profissionais?.find(p => p.id === selectedProfessional)?.nome || 'Profissional';
      doc.text(`Profissional: ${profissionalNome}`, pageWidth / 2, 30, { align: 'center' });
      
      // Período
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const dataInicioFormat = new Date(periodoRelatorio.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR');
      const dataFimFormat = periodoRelatorio.tipo === 'dia' ? dataInicioFormat : 
        new Date(periodoRelatorio.dataFim + 'T12:00:00').toLocaleDateString('pt-BR');
      doc.text(`Período: ${dataInicioFormat} - ${dataFimFormat}`, pageWidth / 2, 38, { align: 'center' });
      
      // Data de emissão
      doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 46, { align: 'center' });

      let yPos = 55;

      // Estatísticas
      const totalEventos = eventosFiltrados.length;
      const totalConfirmados = eventosFiltrados.filter(e => e.status === 'confirmado').length;
      const totalPendentes = eventosFiltrados.filter(e => e.status === 'pendente').length;
      const totalCancelados = eventosFiltrados.filter(e => e.status === 'cancelado').length;

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumo', 14, yPos);
      yPos += 8;

      const statsData = [
        ['Total de Eventos', totalEventos.toString()],
        ['Confirmados', totalConfirmados.toString()],
        ['Pendentes', totalPendentes.toString()],
        ['Cancelados', totalCancelados.toString()],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Descrição', 'Quantidade']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [156, 39, 176] },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Eventos por dia
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Agenda Detalhada', 14, yPos);
      yPos += 8;

      // Agrupar por data
      const eventosPorData = {};
      eventosFiltrados.forEach(evento => {
        if (!eventosPorData[evento.data]) {
          eventosPorData[evento.data] = [];
        }
        eventosPorData[evento.data].push(evento);
      });

      Object.keys(eventosPorData).sort().forEach(data => {
        // Verificar espaço na página
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(156, 39, 176);
        doc.text(new Date(data + 'T12:00:00').toLocaleDateString('pt-BR'), 14, yPos);
        yPos += 6;

        const eventosDoDia = eventosPorData[data];
        const tableData = eventosDoDia.map(evento => {
          const cliente = clientes?.find(c => c.id === evento.clienteId);
          const servico = servicos?.find(s => s.id === evento.servicoId);
          const profissional = profissionais?.find(p => p.id === evento.profissionalId);
          
          return [
            evento.horario || '--:--',
            cliente?.nome || '—',
            servico?.nome || '—',
            profissional?.nome || '—',
            evento.status || '—'
          ];
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Horário', 'Cliente', 'Serviço', 'Profissional', 'Status']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8 },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      });

      // Salvar PDF
      const fileName = `agenda_${profissionalNome.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
      mostrarSnackbar('PDF gerado com sucesso!', 'success');
      handleCloseRelatorio();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarSnackbar('Erro ao gerar PDF', 'error');
    }
  };

  const handleExportExcel = () => {
    try {
      mostrarSnackbar('Gerando planilha...', 'info');
      
      // Filtrar eventos pelo período
      let eventosFiltrados = filteredEvents;
      if (periodoRelatorio.tipo === 'dia') {
        eventosFiltrados = eventosFiltrados.filter(e => e.data === periodoRelatorio.dataInicio);
      } else {
        eventosFiltrados = eventosFiltrados.filter(e => 
          e.data >= periodoRelatorio.dataInicio && e.data <= periodoRelatorio.dataFim
        );
      }

      // Ordenar por data e horário
      eventosFiltrados.sort((a, b) => {
        if (a.data !== b.data) return a.data.localeCompare(b.data);
        return (a.horario || '').localeCompare(b.horario || '');
      });

      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Aba de Resumo
      const profissionalNome = selectedProfessional === 'all' ? 'Todos os Profissionais' : 
        profissionais?.find(p => p.id === selectedProfessional)?.nome || 'Profissional';
      const dataInicioFormat = new Date(periodoRelatorio.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR');
      const dataFimFormat = periodoRelatorio.tipo === 'dia' ? dataInicioFormat : 
        new Date(periodoRelatorio.dataFim + 'T12:00:00').toLocaleDateString('pt-BR');

      const resumoData = [
        ['Relatório de Agenda'],
        [''],
        ['Profissional', profissionalNome],
        ['Período', `${dataInicioFormat} - ${dataFimFormat}`],
        ['Data de Emissão', new Date().toLocaleString('pt-BR')],
        [''],
        ['Resumo do Período'],
        ['Total de Eventos', eventosFiltrados.length],
        ['Confirmados', eventosFiltrados.filter(e => e.status === 'confirmado').length],
        ['Pendentes', eventosFiltrados.filter(e => e.status === 'pendente').length],
        ['Cancelados', eventosFiltrados.filter(e => e.status === 'cancelado').length],
      ];

      const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

      // Aba de Agenda Detalhada
      const agendaData = [
        ['Data', 'Horário', 'Cliente', 'Serviço', 'Profissional', 'Status'],
        ...eventosFiltrados.map(evento => {
          const cliente = clientes?.find(c => c.id === evento.clienteId);
          const servico = servicos?.find(s => s.id === evento.servicoId);
          const profissional = profissionais?.find(p => p.id === evento.profissionalId);
          
          return [
            new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR'),
            evento.horario || '--:--',
            cliente?.nome || '—',
            servico?.nome || '—',
            profissional?.nome || '—',
            evento.status || '—'
          ];
        })
      ];

      const wsAgenda = XLSX.utils.aoa_to_sheet(agendaData);
      XLSX.utils.book_append_sheet(wb, wsAgenda, 'Agenda Detalhada');

      // Salvar arquivo
      const fileName = `agenda_${profissionalNome.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      mostrarSnackbar('Planilha gerada com sucesso!', 'success');
      handleCloseRelatorio();
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      mostrarSnackbar('Erro ao gerar planilha', 'error');
    }
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
      {/* Cabeçalho */}
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
          <Tooltip title="Filtros">
            <Badge 
              color="secondary" 
              variant="dot" 
              invisible={selectedProfessional === 'all' && selectedStatus === 'all'}
            >
              <IconButton onClick={() => setFilterOpen(!filterOpen)} color={filterOpen ? 'primary' : 'default'}>
                <FilterIcon />
              </IconButton>
            </Badge>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setUpdateTrigger(prev => prev + 1)}
          >
            Atualizar
          </Button>

          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handleOpenRelatorio}
          >
            Relatórios
          </Button>
          
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

      {/* Filtros */}
      <Collapse in={filterOpen}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    value={selectedProfessional}
                    label="Profissional"
                    onChange={(e) => setSelectedProfessional(e.target.value)}
                  >
                    <MenuItem value="all">Todos os Profissionais</MenuItem>
                    {profissionais?.map(prof => (
                      <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Status"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <MenuItem value="all">Todos os Status</MenuItem>
                    <MenuItem value="pendente">Pendente</MenuItem>
                    <MenuItem value="confirmado">Confirmado</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                    <MenuItem value="finalizado">Finalizado</MenuItem>
                    <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSelectedProfessional('all');
                    setSelectedStatus('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      {/* Barra de navegação */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton onClick={handlePrevious} size="large">
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6" sx={{ mx: 2, fontWeight: 500, textAlign: 'center' }}>
                  {viewMode === 'day' && format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
                  {viewMode === 'week' && `Semana de ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM')} a ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM/yyyy')}`}
                  {viewMode === 'month' && format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </Typography>
                <IconButton onClick={handleNext} size="large">
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Chip 
                  icon={<EventIcon />}
                  label={`${stats.total} hoje`} 
                  color="primary" 
                  variant="outlined"
                />
                {stats.confirmados > 0 && (
                  <Chip 
                    icon={<CheckIcon />}
                    label={`${stats.confirmados} confirmados`} 
                    color="success" 
                    size="small"
                  />
                )}
                {stats.pendentes > 0 && (
                  <Chip 
                    icon={<TimerIcon />}
                    label={`${stats.pendentes} pendentes`} 
                    color="warning" 
                    size="small"
                  />
                )}
                {stats.cancelados > 0 && (
                  <Chip 
                    icon={<CancelIcon />}
                    label={`${stats.cancelados} cancelados`} 
                    color="error" 
                    size="small"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Visualizações */}
      <Card>
        <CardContent>
          {viewMode === 'day' && (
            <DayView
              date={currentDate}
              appointments={filteredEvents}
              clients={clientes}
              services={servicos}
              professionals={profissionais}
              onAppointmentClick={(apt) => {
                setSelectedAppointment(apt);
                setOpenDetailsDialog(true);
              }}
              onStatusChange={handleStatusChange}
            />
          )}

          {viewMode === 'week' && (
            <WeekView
              date={currentDate}
              appointments={filteredEvents}
              clients={clientes}
              services={servicos}
              professionals={profissionais}
              onAppointmentClick={(apt) => {
                setSelectedAppointment(apt);
                setOpenDetailsDialog(true);
              }}
              onStatusChange={handleStatusChange}
              onDayClick={handleDayClick}
            />
          )}

          {viewMode === 'month' && (
            <MonthView
              date={currentDate}
              appointments={filteredEvents}
              clients={clientes}
              onDayClick={handleDayClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      <AppointmentDetailsDialog
        open={openDetailsDialog}
        appointment={selectedAppointment}
        onClose={() => setOpenDetailsDialog(false)}
        clients={clientes}
        services={servicos}
        professionals={profissionais}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onStart={handleStartAtendimento}
      />

      <AppointmentFormDialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        onSubmit={handleSubmit}
        appointment={selectedAppointment}
        clients={clientes}
        services={servicos}
        professionals={profissionais}
        selectedDate={selectedDate}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDelete}
      />

      {/* Dialog de Relatórios */}
      <Dialog open={openRelatorioDialog} onClose={handleCloseRelatorio} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Exportar Agenda
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selecione o período:
            </Typography>
            
            <RadioGroup
              value={periodoRelatorio.tipo}
              onChange={(e) => setPeriodoRelatorio({ ...periodoRelatorio, tipo: e.target.value })}
              sx={{ mb: 2 }}
            >
              <FormControlLabel value="dia" control={<Radio />} label="Dia atual" />
              <FormControlLabel value="semana" control={<Radio />} label="Semana atual" />
              <FormControlLabel value="mes" control={<Radio />} label="Mês atual" />
              <FormControlLabel value="personalizado" control={<Radio />} label="Personalizado" />
            </RadioGroup>

            {periodoRelatorio.tipo === 'personalizado' && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                      label="Data Início"
                      value={new Date(periodoRelatorio.dataInicio + 'T12:00:00')}
                      onChange={(newValue) => {
                        if (newValue) {
                          setPeriodoRelatorio({ 
                            ...periodoRelatorio, 
                            dataInicio: format(newValue, 'yyyy-MM-dd') 
                          });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth size="small" />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                      label="Data Fim"
                      value={new Date(periodoRelatorio.dataFim + 'T12:00:00')}
                      onChange={(newValue) => {
                        if (newValue) {
                          setPeriodoRelatorio({ 
                            ...periodoRelatorio, 
                            dataFim: format(newValue, 'yyyy-MM-dd') 
                          });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth size="small" />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            )}

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
              Formato de exportação:
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => {
                    handleCloseRelatorio();
                    handlePrint();
                  }}
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                >
                  <Box>
                    <Typography variant="subtitle1">Imprimir</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Gera uma versão para impressão
                    </Typography>
                  </Box>
                </Button>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PdfIcon />}
                  onClick={() => {
                    handleCloseRelatorio();
                    handleExportPDF();
                  }}
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                  color="error"
                >
                  <Box>
                    <Typography variant="subtitle1">Exportar como PDF</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Gera um arquivo PDF
                    </Typography>
                  </Box>
                </Button>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ExcelIcon />}
                  onClick={() => {
                    handleCloseRelatorio();
                    handleExportExcel();
                  }}
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                  color="success"
                >
                  <Box>
                    <Typography variant="subtitle1">Exportar como Excel</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Gera uma planilha
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRelatorio}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <RelatorioAgenda
          ref={relatorioRef}
          eventos={filteredEvents}
          profissional={selectedProfessional}
          periodo={periodoRelatorio}
          clientes={clientes}
          profissionais={profissionais}
          servicos={servicos}
          dataInicio={periodoRelatorio.dataInicio}
          dataFim={periodoRelatorio.dataFim}
        />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Agenda;
