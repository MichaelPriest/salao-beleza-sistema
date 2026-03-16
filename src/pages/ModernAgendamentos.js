// src/pages/ModernAgendamentos.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Zoom,
  Fab,
  Skeleton,
  Pagination,
  Stack,
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
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../hooks/useFirebase';
import { firebaseService } from '../services/firebase';
import { notificacoesService } from '../services/notificacoesService';
import { usuariosService } from '../services/usuariosService';
import { auditoriaService } from '../services/auditoriaService';
import { Timestamp } from 'firebase/firestore';
import { format, isValid, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';

// Importações para PDF e Excel
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Funções auxiliares de data
const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

const formatDateBr = (date) => {
  if (!date) return '—';
  try {
    const dateObj = typeof date === 'string' ? new Date(date + 'T12:00:00') : date;
    if (!isValid(dateObj)) return '—';
    return format(dateObj, 'dd/MM/yyyy', { locale: dateFnsPtBR });
  } catch {
    return '—';
  }
};

const formatDateTime = (date, time) => {
  if (!date) return '—';
  try {
    const dateObj = typeof date === 'string' ? new Date(date + 'T12:00:00') : date;
    if (!isValid(dateObj)) return '—';
    if (time) {
      return `${format(dateObj, 'dd/MM/yyyy')} ${time}`;
    }
    return format(dateObj, 'dd/MM/yyyy HH:mm');
  } catch {
    return '—';
  }
};

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// Função para obter iniciais do nome
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Função para formatar telefone
const formatarTelefone = (telefone) => {
  if (!telefone || telefone === 'Não informado') return telefone;
  const numeros = telefone.replace(/\D/g, '');
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
};

// Função para formatar CPF
const formatarCPF = (cpf) => {
  if (!cpf) return '';
  const numeros = cpf.replace(/\D/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Função para remover máscara do CPF
const removerMascaraCPF = (cpf) => {
  return cpf ? cpf.replace(/\D/g, '') : '';
};

// Componente de Card de Evento Mobile
const EventoMobileCard = ({ event, cliente, profissional, servicos, cargo, onIniciar, onContinuar, onConfirmar, onCancelar, onEditar, onExcluir, onDetalhes }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmado': return '#4caf50';
      case 'pendente': return '#ff9800';
      case 'cancelado': return '#f44336';
      case 'finalizado': return '#2196f3';
      case 'em_andamento': return '#ff4081';
      default: return '#9c27b0';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'confirmado': return '#e8f5e9';
      case 'pendente': return '#fff3e0';
      case 'cancelado': return '#ffebee';
      case 'finalizado': return '#e3f2fd';
      case 'em_andamento': return '#f3e5f5';
      default: return '#f3e5f5';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          borderLeft: '4px solid',
          borderLeftColor: event.tipo === 'atendimento' ? '#ff9800' : getStatusColor(event.status),
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={cliente?.foto}
              sx={{ 
                bgcolor: event.tipo === 'atendimento' ? '#ff9800' : '#9c27b0',
                width: 48,
                height: 48,
              }}
            >
              {!cliente?.foto && getInitials(cliente?.nome)}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {cliente?.nome || 'Cliente não encontrado'}
                </Typography>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(event.data, event.horario || event.horaInicio)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={event.tipo === 'agendamento' ? 'Agendamento' : 'Atendimento'}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    bgcolor: event.tipo === 'atendimento' ? '#fff3e0' : '#f3e5f5',
                    color: event.tipo === 'atendimento' ? '#ff9800' : '#9c27b0',
                  }}
                />
                
                <Chip
                  size="small"
                  label={getStatusLabel(event.status)}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    bgcolor: getStatusBg(event.status),
                    color: getStatusColor(event.status),
                  }}
                />

                {profissional && (
                  <Chip
                    size="small"
                    icon={<WorkIcon sx={{ fontSize: 12 }} />}
                    label={profissional.nome}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>

              <Box sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {servicos.map(s => s.nome).join(', ')}
                </Typography>
              </Box>

              <Collapse in={expanded}>
                <Box sx={{ 
                  mt: 2, 
                  pt: 2, 
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap'
                }} onClick={(e) => e.stopPropagation()}>
                  
                  <Tooltip title="Ver Detalhes">
                    <IconButton
                      size="small"
                      onClick={() => onDetalhes(event)}
                      sx={{ color: '#9c27b0' }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {cargo !== 'cliente' && event.tipo === 'agendamento' && event.status === 'confirmado' && (
                    <Tooltip title="Iniciar Atendimento">
                      <IconButton
                        size="small"
                        onClick={() => onIniciar(event)}
                        sx={{ color: '#4caf50' }}
                      >
                        <PlayIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {cargo !== 'cliente' && event.tipo === 'atendimento' && event.status === 'em_andamento' && (
                    <Tooltip title="Continuar Atendimento">
                      <IconButton
                        size="small"
                        onClick={() => onContinuar(event)}
                        sx={{ color: '#ff9800' }}
                      >
                        <PlayIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {cargo !== 'cliente' && event.tipo === 'agendamento' && event.status === 'pendente' && (
                    <>
                      <Tooltip title="Confirmar">
                        <IconButton
                          size="small"
                          onClick={() => onConfirmar(event)}
                          sx={{ color: '#4caf50' }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancelar">
                        <IconButton
                          size="small"
                          onClick={() => onCancelar(event)}
                          sx={{ color: '#f44336' }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  
                  {cargo !== 'cliente' && event.tipo === 'agendamento' && (
                    <>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => onEditar(event)}
                          sx={{ color: '#2196f3' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {event.status !== 'finalizado' && event.status !== 'cancelado' && (
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => onExcluir(event)}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  )}
                </Box>
              </Collapse>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente para impressão da agenda
const RelatorioAgenda = React.forwardRef(({ 
  eventos, 
  profissional, 
  periodo, 
  clientes,
  profissionais,
  viewMode,
  dataInicio,
  dataFim,
  usuarioCargo
}, ref) => {
  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const calcularDuracaoTotal = (servicos) => {
    if (!servicos || servicos.length === 0) return 0;
    return servicos.reduce((acc, s) => acc + (s.duracao || 60), 0);
  };

  const formatarDuracao = (minutos) => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  const profissionalNome = profissional === 'all' ? 'Todos os Profissionais' : 
    profissionais?.find(p => p.id === profissional)?.nome || 'Profissional';

  return (
    <Box ref={ref} sx={{ p: 3, fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #9c27b0', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1 }}>
          Relatório de Agenda
        </Typography>
        <Typography variant="h5" sx={{ mt: 1, color: '#555', fontSize: '1.2rem' }}>
          {profissionalNome}
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
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#333', borderBottom: '1px solid #ccc', pb: 1, fontSize: '1.1rem' }}>
          Resumo do Período
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={3}>
            <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {eventos.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Agend.</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0', fontSize: '1rem' }}>
                {eventos.filter(e => e.tipo === 'agendamento').length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Atend.</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800', fontSize: '1rem' }}>
                {eventos.filter(e => e.tipo === 'atendimento').length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Andam.</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#f44336', fontSize: '1rem' }}>
                {eventos.filter(e => e.status === 'em_andamento').length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Eventos por Dia */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#333', borderBottom: '1px solid #ccc', pb: 1, fontSize: '1.1rem' }}>
          Agenda Detalhada
        </Typography>
        
        {/* Agrupar eventos por data */}
        {Object.entries(
          eventos.reduce((acc, evento) => {
            const data = evento.data;
            if (!acc[data]) acc[data] = [];
            acc[data].push(evento);
            return acc;
          }, {})
        ).sort(([dataA], [dataB]) => dataA.localeCompare(dataB)).map(([data, eventosDoDia]) => {
          const eventosOrdenados = eventosDoDia.sort((a, b) => 
            (a.horario || a.horaInicio || '').localeCompare(b.horario || b.horaInicio || '')
          );

          return (
            <Card key={data} variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#9c27b0', fontSize: '1rem' }}>
                  {formatarData(data)}
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                        <TableCell><strong>Horário</strong></TableCell>
                        <TableCell><strong>Cliente</strong></TableCell>
                        <TableCell><strong>Serviços</strong></TableCell>
                        <TableCell><strong>Prof.</strong></TableCell>
                        <TableCell><strong>Tipo</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eventosOrdenados.map(evento => {
                        const cliente = clientes?.find(c => c.id === evento.clienteId || c.uid === evento.clienteId || c.googleUid === evento.clienteId);
                        const profissional = profissionais?.find(p => p.id === evento.profissionalId);
                        const servicos = evento.servicos || 
                          (evento.servicoId ? [{ 
                            id: evento.servicoId, 
                            nome: evento.servicoNome || 'Serviço'
                          }] : []);
                        
                        return (
                          <TableRow key={evento.id}>
                            <TableCell sx={{ fontSize: '0.8rem' }}>{evento.horario || evento.horaInicio}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem' }}>{cliente?.nome || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem' }}>
                              {servicos.map(s => s.nome).join(', ')}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem' }}>{profissional?.nome || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem' }}>
                              {evento.tipo === 'agendamento' ? 'Agend.' : 'Atend.'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem' }}>
                              {evento.status}
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
      <Box sx={{ mt: 3, textAlign: 'center', color: 'text.secondary', borderTop: '1px solid #ccc', pt: 2 }}>
        <Typography variant="caption">
          Relatório gerado automaticamente • Documento não fiscal
        </Typography>
      </Box>
    </Box>
  );
});

function ModernAgendamentos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [cargo, setCargo] = useState('');
  
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
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  
  // Trigger para forçar atualização
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Estados para impressão/exportação
  const [openRelatorioDialog, setOpenRelatorioDialog] = useState(false);
  const [periodoRelatorio, setPeriodoRelatorio] = useState({
    tipo: 'dia',
    dataInicio: formatDate(new Date()),
    dataFim: formatDate(new Date())
  });
  const relatorioRef = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estados para pesquisa de clientes
  const [searchClientTerm, setSearchClientTerm] = useState('');
  const [searchClientType, setSearchClientType] = useState('nome');
  const [searchClientResults, setSearchClientResults] = useState([]);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [cpfInput, setCpfInput] = useState('');
  const [dataNascimentoInput, setDataNascimentoInput] = useState(null);

  // Estados para múltiplos serviços
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [servicoAtual, setServicoAtual] = useState('');
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [profissionaisDisponiveis, setProfissionaisDisponiveis] = useState([]);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState('');

  // Estados para pesquisa de profissionais e serviços nos selects
  const [buscaProfissional, setBuscaProfissional] = useState('');
  const [buscaServico, setBuscaServico] = useState('');

  // Hooks do Firebase
  const { data: agendamentos, loading: loadingAgendamentos, error: errorAgendamentos, adicionar, atualizar, excluir } = useFirebase('agendamentos');
  const { data: atendimentos, loading: loadingAtendimentos } = useFirebase('atendimentos');
  const { data: clientes, loading: loadingClientes } = useFirebase('clientes');
  const { data: profissionais, loading: loadingProfissionais } = useFirebase('profissionais');
  const { data: servicos, loading: loadingServicos } = useFirebase('servicos');
  const { data: usuarios, loading: loadingUsuarios } = useFirebase('usuarios');

  useEffect(() => {
    const user = usuariosService.getUsuarioAtual();
    setUsuario(user);
    setCargo(user?.cargo || '');

    if (user?.cargo === 'profissional' && user?.profissionalId) {
      setSelectedProfessional(user.profissionalId);
    }

    if (user?.cargo === 'cliente' && user?.clienteId) {
      setSelectedProfessional('all');
    }

    // Registrar acesso na auditoria
    auditoriaService.registrar('acesso_agenda', {
      entidade: 'agendamentos',
      detalhes: `Acesso à página de agenda - ${user?.cargo || 'visitante'}`,
      dados: { usuarioId: user?.id }
    });

  }, []);

  const loading = loadingAgendamentos || loadingAtendimentos || loadingClientes || loadingProfissionais || loadingServicos || loadingUsuarios;

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Função para obter dados do cliente de forma segura
  const getClienteData = useCallback((clienteId) => {
    if (!clienteId || !clientes) return null;
    
    const cliente = clientes.find(c => 
      c.id === clienteId || 
      c.uid === clienteId || 
      c.googleUid === clienteId
    );
    
    if (!cliente) return null;
    
    return {
      id: cliente.id || cliente.uid || cliente.googleUid,
      nome: cliente.nome || cliente.displayName || 'Cliente',
      telefone: cliente.telefone || cliente.phoneNumber || 'Não informado',
      email: cliente.email || '',
      cpf: cliente.cpf || '',
      foto: cliente.foto || cliente.photoURL || null,
      dataNascimento: cliente.dataNascimento || ''
    };
  }, [clientes]);

  // Função para obter dados do profissional
  const getProfissionalData = useCallback((profissionalId) => {
    if (!profissionalId || !profissionais) return null;
    
    const profissional = profissionais.find(p => p.id === profissionalId);
    return profissional || null;
  }, [profissionais]);

  // Filtrar eventos baseado no cargo do usuário
  const filtrarEventosPorUsuario = useCallback((eventos) => {
    if (!usuario) return eventos;

    if (cargo === 'cliente' && usuario.clienteId) {
      return eventos.filter(e => e.clienteId === usuario.clienteId);
    }

    if (cargo === 'profissional' && usuario.profissionalId) {
      return eventos.filter(e => e.profissionalId === usuario.profissionalId);
    }

    return eventos;
  }, [usuario, cargo]);

  // Combinar agendamentos e atendimentos
  const todosEventos = useMemo(() => {
    return filtrarEventosPorUsuario([
      ...(agendamentos || []).map(apt => ({
        ...apt,
        tipo: 'agendamento',
        icone: <ScheduleIcon />,
        dataObj: apt.data,
        horarioObj: apt.horario
      })),
      ...(atendimentos || []).map(att => ({
        ...att,
        tipo: 'atendimento',
        icone: <TimerIcon />,
        status: att.status || 'em_andamento',
        dataObj: att.data,
        horarioObj: att.horaInicio
      }))
    ]);
  }, [agendamentos, atendimentos, filtrarEventosPorUsuario]);

  // Atendimentos em andamento
  const atendimentosEmAndamento = useMemo(() => {
    return (atendimentos || []).filter(att => att.status === 'em_andamento');
  }, [atendimentos]);

  // Estado do formulário
  const [formData, setFormData] = useState({
    clienteId: '',
    profissionalId: cargo === 'profissional' && usuario?.profissionalId ? usuario.profissionalId : '',
    servicoId: '',
    data: selectedDate,
    horario: '',
    observacoes: '',
    status: 'pendente',
    servicos: [],
    valorTotal: 0
  });

  // Atualizar serviços disponíveis quando profissional é selecionado
  useEffect(() => {
    if (formData.profissionalId && servicos) {
      const profissional = profissionais?.find(p => p.id === formData.profissionalId);
      
      if (profissional && profissional.servicosIds) {
        const servicosDoProfissional = servicos.filter(s => 
          profissional.servicosIds.includes(s.id) && s.ativo !== false
        );
        setServicosDisponiveis(servicosDoProfissional);
      } else {
        setServicosDisponiveis(servicos.filter(s => s.ativo !== false));
      }
    } else {
      setServicosDisponiveis([]);
    }
  }, [formData.profissionalId, servicos, profissionais, updateTrigger]);

  // Filtrar serviços pela busca
  const servicosFiltrados = servicosDisponiveis.filter(servico => 
    servico.nome?.toLowerCase().includes(buscaServico.toLowerCase())
  );

  // Filtrar profissionais pela busca
  const profissionaisFiltrados = (profissionais || []).filter(prof => 
    prof.nome?.toLowerCase().includes(buscaProfissional.toLowerCase())
  );

  // Adicionar serviço à lista
  const adicionarServico = () => {
    if (!servicoAtual) {
      mostrarSnackbar('Selecione um serviço', 'error');
      return;
    }

    const servico = servicos?.find(s => s.id === servicoAtual);
    if (!servico) return;

    if (servicosSelecionados.some(s => s.id === servico.id)) {
      mostrarSnackbar('Este serviço já foi adicionado', 'error');
      return;
    }

    const novoServico = {
      id: servico.id,
      nome: servico.nome,
      preco: servico.preco || 0,
      duracao: servico.duracao || 60,
      comissao: servico.comissaoProfissional || 50,
      profissionalId: profissionalSelecionado || formData.profissionalId
    };

    const novosServicos = [...servicosSelecionados, novoServico];
    setServicosSelecionados(novosServicos);
    setServicoAtual('');
    setBuscaServico('');
    
    const novoTotal = novosServicos.reduce((acc, s) => acc + (s.preco || 0), 0);
    setFormData({ ...formData, valorTotal: novoTotal, servicos: novosServicos });
  };

  // Remover serviço da lista
  const removerServico = (id) => {
    const novosServicos = servicosSelecionados.filter(s => s.id !== id);
    setServicosSelecionados(novosServicos);
    
    const novoTotal = novosServicos.reduce((acc, s) => acc + (s.preco || 0), 0);
    setFormData({ ...formData, valorTotal: novoTotal, servicos: novosServicos });
  };

  // Limpar lista de serviços
  const limparServicos = () => {
    setServicosSelecionados([]);
    setFormData({ ...formData, valorTotal: 0, servicos: [] });
  };

  // Reset quando abrir modal
  useEffect(() => {
    if (openDialog) {
      if (selectedAppointment) {
        setFormData({
          clienteId: selectedAppointment.clienteId || '',
          profissionalId: selectedAppointment.profissionalId || (cargo === 'profissional' && usuario?.profissionalId ? usuario.profissionalId : ''),
          servicoId: selectedAppointment.servicoId || '',
          data: selectedAppointment.data || selectedDate,
          horario: selectedAppointment.horario || '',
          observacoes: selectedAppointment.observacoes || '',
          status: selectedAppointment.status || 'pendente',
          servicos: selectedAppointment.servicos || [],
          valorTotal: selectedAppointment.valorTotal || 0
        });
        setServicosSelecionados(selectedAppointment.servicos || []);
      } else {
        setFormData({
          clienteId: '',
          profissionalId: cargo === 'profissional' && usuario?.profissionalId ? usuario.profissionalId : '',
          servicoId: '',
          data: selectedDate,
          horario: '',
          observacoes: '',
          status: 'pendente',
          servicos: [],
          valorTotal: 0
        });
        setServicosSelecionados([]);
        setServicoAtual('');
        setProfissionalSelecionado('');
        setBuscaProfissional('');
        setBuscaServico('');
      }
    }
  }, [openDialog, selectedAppointment, selectedDate, usuario, cargo, updateTrigger]);

  // Funções de navegação
  const handlePrevious = () => {
    if (viewMode === 'day') {
      const newDate = subDays(new Date(selectedDate), 1);
      setSelectedDate(formatDate(newDate));
      setCurrentDate(newDate);
    } else if (viewMode === 'week') {
      const newDate = subWeeks(currentDate, 1);
      setCurrentDate(newDate);
      setSelectedDate(formatDate(newDate));
    } else {
      const newDate = subMonths(currentDate, 1);
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

  // Funções de ações
  const handleAdd = () => {
    if (cargo === 'profissional') {
      mostrarSnackbar('Profissionais não podem criar agendamentos', 'error');
      return;
    }
    
    if (cargo === 'cliente') {
      mostrarSnackbar('Para agendar, entre em contato com a recepção', 'info');
      return;
    }
    
    setSelectedAppointment(null);
    setOpenDialog(true);
  };

  const handleEdit = (event) => {
    if (cargo === 'profissional' || cargo === 'cliente') {
      mostrarSnackbar('Você não tem permissão para editar agendamentos', 'error');
      return;
    }
    
    if (event.tipo === 'agendamento') {
      setSelectedAppointment(event);
      setOpenDialog(true);
    } else {
      mostrarSnackbar('Atendimentos não podem ser editados diretamente', 'info');
    }
  };

  const handleDelete = (id, tipo) => {
    if (cargo === 'profissional' || cargo === 'cliente') {
      mostrarSnackbar('Você não tem permissão para cancelar agendamentos', 'error');
      return;
    }
    
    if (tipo === 'agendamento') {
      setAppointmentToDelete(id);
      setOpenDeleteDialog(true);
    } else {
      mostrarSnackbar('Atendimentos não podem ser excluídos', 'info');
    }
  };

  const confirmDelete = async () => {
    try {
      await excluir(appointmentToDelete);
      
      await auditoriaService.registrar('cancelar_agendamento', {
        entidade: 'agendamentos',
        entidadeId: appointmentToDelete,
        detalhes: 'Agendamento cancelado',
        usuarioId: usuario?.id
      });

      mostrarSnackbar('Agendamento cancelado com sucesso!');
      setUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      mostrarSnackbar('Erro ao cancelar agendamento', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'cancelar_agendamento',
        agendamentoId: appointmentToDelete
      });
    }
    setOpenDeleteDialog(false);
    setAppointmentToDelete(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    if (cargo === 'profissional' || cargo === 'cliente') {
      mostrarSnackbar('Você não tem permissão para alterar status', 'error');
      return;
    }
    
    try {
      mostrarSnackbar('Atualizando status...', 'info');
      
      await atualizar(id, { status: newStatus });
      
      await auditoriaService.registrar('alterar_status_agendamento', {
        entidade: 'agendamentos',
        entidadeId: id,
        detalhes: `Status alterado para ${newStatus}`,
        usuarioId: usuario?.id
      });
      
      setUpdateTrigger(prev => prev + 1);
      
      mostrarSnackbar(`Status alterado!`);
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarSnackbar('Erro ao alterar status', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'alterar_status_agendamento',
        agendamentoId: id
      });
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    
    try {
      if (!formData.clienteId) {
        mostrarSnackbar('Selecione um cliente', 'error');
        return;
      }

      if (servicosSelecionados.length === 0) {
        mostrarSnackbar('Adicione pelo menos um serviço', 'error');
        return;
      }

      if (!formData.horario) {
        mostrarSnackbar('Selecione um horário', 'error');
        return;
      }

      // Verificar horário ocupado
      const horarioOcupado = (agendamentos || []).some(apt => 
        apt.data === formData.data && 
        apt.horario === formData.horario && 
        apt.profissionalId === formData.profissionalId &&
        apt.id !== selectedAppointment?.id &&
        apt.status !== 'cancelado'
      );

      if (horarioOcupado) {
        mostrarSnackbar('Este horário já está ocupado para este profissional', 'error');
        return;
      }

      const dadosParaSalvar = {
        clienteId: formData.clienteId,
        profissionalId: formData.profissionalId,
        servicoId: servicosSelecionados[0]?.id,
        servicos: servicosSelecionados,
        data: formData.data,
        horario: formData.horario,
        observacoes: formData.observacoes || '',
        status: formData.status || 'pendente',
        valorTotal: formData.valorTotal,
        origem: 'sistema',
        createdBy: usuario?.id || usuario?.uid || 'sistema',
        createdByName: usuario?.nome || 'Sistema',
        createdByCargo: usuario?.cargo || 'sistema'
      };

      let agendamentoCriado;

      if (selectedAppointment) {
        const agendamentoAntigo = { ...selectedAppointment };
        
        await atualizar(selectedAppointment.id, dadosParaSalvar);
        
        await auditoriaService.registrarAtualizacao(
          'agendamentos',
          selectedAppointment.id,
          agendamentoAntigo,
          dadosParaSalvar,
          `Agendamento atualizado`
        );

        agendamentoCriado = { ...dadosParaSalvar, id: selectedAppointment.id };
        mostrarSnackbar('Agendamento atualizado!');
      } else {
        agendamentoCriado = await adicionar(dadosParaSalvar);
        
        await auditoriaService.registrarCriacao(
          'agendamentos',
          agendamentoCriado.id,
          dadosParaSalvar,
          `Novo agendamento criado`
        );

        mostrarSnackbar('Agendamento criado!');
      }

      setUpdateTrigger(prev => prev + 1);

      // Notificar profissional
      if (usuario && formData.profissionalId) {
        try {
          const usuarios = await firebaseService.getAll('usuarios');
          const profissionalUser = usuarios.find(u => u.profissionalId === formData.profissionalId);
          
          if (profissionalUser) {
            await notificacoesService.notificarAgendamento(agendamentoCriado, profissionalUser.id);
          }
        } catch (notifError) {
          console.error('Erro ao enviar notificação:', notifError);
        }
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      mostrarSnackbar('Erro ao salvar agendamento', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: selectedAppointment ? 'atualizar_agendamento' : 'criar_agendamento',
        dados: formData
      });
    }
  };

  const iniciarAtendimento = async (agendamento) => {
    if (cargo === 'cliente') {
      mostrarSnackbar('Apenas funcionários podem iniciar atendimentos', 'error');
      return;
    }
    
    try {
      if (!agendamento || !agendamento.id) {
        mostrarSnackbar('Agendamento não encontrado', 'error');
        return;
      }

      mostrarSnackbar('Iniciando atendimento...', 'info');

      const atendimentoExistente = (atendimentos || []).find(a => a.agendamentoId === agendamento.id);
      
      if (atendimentoExistente) {
        mostrarSnackbar('Atendimento já existe!');
        navigate(`/atendimento/${atendimentoExistente.id}`);
        return;
      }

      const servicosLista = agendamento.servicos || [];
      const primeiroServico = servicosLista[0] || {};

      const novoAtendimento = {
        agendamentoId: agendamento.id,
        clienteId: agendamento.clienteId,
        profissionalId: agendamento.profissionalId,
        servicoId: primeiroServico.id,
        servicos: servicosLista,
        data: agendamento.data,
        horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        horaFim: null,
        status: 'em_andamento',
        observacoes: agendamento.observacoes || '',
        itensServico: servicosLista.map(s => ({
          id: s.id,
          nome: s.nome,
          preco: s.preco || 0,
          principal: s.id === primeiroServico.id
        })),
        itensProduto: [],
        valorTotal: agendamento.valorTotal || 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        iniciadoPor: usuario?.nome || 'Sistema',
        iniciadoPorId: usuario?.id || usuario?.uid
      };

      const atendimentoCriado = await firebaseService.add('atendimentos', novoAtendimento);
      
      await atualizar(agendamento.id, { 
        status: 'em_andamento',
        updatedAt: Timestamp.now()
      });

      await auditoriaService.registrar('iniciar_atendimento', {
        entidade: 'atendimentos',
        entidadeId: atendimentoCriado.id,
        detalhes: `Atendimento iniciado a partir do agendamento ${agendamento.id}`,
        agendamentoId: agendamento.id
      });

      setUpdateTrigger(prev => prev + 1);

      mostrarSnackbar('Atendimento iniciado com sucesso!');
      
      navigate(`/atendimento/${atendimentoCriado.id}`);
      
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      mostrarSnackbar('Erro ao iniciar atendimento', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'iniciar_atendimento',
        agendamentoId: agendamento?.id
      });
    }
  };

  const continuarAtendimento = (atendimento) => {
    if (cargo === 'cliente') {
      mostrarSnackbar('Você não tem acesso a esta funcionalidade', 'error');
      return;
    }
    navigate(`/atendimento/${atendimento.id}`);
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

  const isHorarioDisponivel = (horario) => {
    if (!formData.profissionalId || !formData.data) return true;
    
    return !(agendamentos || []).some(apt => 
      apt.data === formData.data && 
      apt.horario === horario && 
      apt.profissionalId === formData.profissionalId &&
      apt.id !== selectedAppointment?.id &&
      apt.status !== 'cancelado'
    );
  };

  const getHeaderText = () => {
    if (viewMode === 'day') {
      return formatDateTime(selectedDate);
    } else if (viewMode === 'week') {
      const start = addDays(currentDate, -currentDate.getDay() + 1);
      const end = addDays(start, 6);
      return `${formatDateBr(start)} - ${formatDateBr(end)}`;
    } else {
      return format(currentDate, 'MMMM yyyy', { locale: dateFnsPtBR });
    }
  };

  // Funções de busca de clientes
  const buscarClientes = () => {
    if (!clientes) return [];

    let resultados = [];

    switch (searchClientType) {
      case 'nome':
        if (!searchClientTerm || searchClientTerm.length < 2) return [];
        resultados = clientes.filter(cliente => 
          cliente.nome?.toLowerCase().includes(searchClientTerm.toLowerCase())
        );
        break;

      case 'cpf':
        if (!cpfInput || cpfInput.length < 3) return [];
        const cpfBusca = removerMascaraCPF(cpfInput);
        resultados = clientes.filter(cliente => {
          const cpfCliente = removerMascaraCPF(cliente.cpf || '');
          return cpfCliente.includes(cpfBusca);
        });
        break;

      case 'dataNascimento':
        if (!dataNascimentoInput) return [];
        const dataBusca = formatDate(dataNascimentoInput);
        resultados = clientes.filter(cliente => {
          const dataCliente = cliente.dataNascimento ? 
            formatDate(new Date(cliente.dataNascimento)) : '';
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
  }, [searchClientTerm, cpfInput, dataNascimentoInput, searchClientType, clientes, showClientSearch, updateTrigger]);

  const handleOpenClientSearch = () => {
    setShowClientSearch(true);
    setSearchClientTerm('');
    setCpfInput('');
    setDataNascimentoInput(null);
    setSearchClientType('nome');
  };

  const handleCloseClientSearch = () => {
    setShowClientSearch(false);
  };

  const handleSelectClient = (cliente) => {
    setFormData({ ...formData, clienteId: cliente.id });
    setShowClientSearch(false);
    mostrarSnackbar(`Cliente ${cliente.nome} selecionado`);
  };

  const handleClearClient = () => {
    setFormData({ ...formData, clienteId: '' });
  };

  const getSelectedClientData = () => {
    return getClienteData(formData.clienteId);
  };

  // Filtrar eventos
  const filteredEvents = useMemo(() => {
    return todosEventos.filter(event => {
      const professionalMatch = selectedProfessional === 'all' || event.profissionalId === selectedProfessional;
      const statusMatch = selectedStatus === 'all' || event.status === selectedStatus;
      const tipoMatch = showAtendimentos ? true : event.tipo === 'agendamento';
      
      return professionalMatch && statusMatch && tipoMatch;
    });
  }, [todosEventos, selectedProfessional, selectedStatus, showAtendimentos]);

  const dayEvents = useMemo(() => {
    return filteredEvents.filter(event => event.data === selectedDate);
  }, [filteredEvents, selectedDate]);

  const weekDaysList = useMemo(() => {
    const start = addDays(currentDate, -currentDate.getDay() + 1);
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    return days;
  }, [currentDate]);

  const weekEvents = weekDaysList.map(day => ({
    date: formatDate(day),
    dayName: weekDays[day.getDay() === 0 ? 6 : day.getDay() - 1],
    events: filteredEvents.filter(event => event.data === formatDate(day))
  }));

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
        const dayEventsList = filteredEvents.filter(event => event.data === dateStr);
        week.push({
          day: dayCounter,
          date: dateStr,
          events: dayEventsList,
          count: dayEventsList.length,
          atendimentos: dayEventsList.filter(e => e.tipo === 'atendimento').length,
          agendamentos: dayEventsList.filter(e => e.tipo === 'agendamento').length,
        });
        dayCounter++;
      } else {
        week.push(null);
      }
    }
    monthMatrix.push(week);
    if (dayCounter > monthDays) break;
  }

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

  // Funções de exportação
  const handleOpenRelatorio = () => {
    if (cargo === 'profissional' || cargo === 'cliente') {
      mostrarSnackbar('Você não tem permissão para gerar relatórios', 'error');
      return;
    }
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
      
      auditoriaService.registrarErro(error, { 
        acao: 'imprimir_relatorio_agenda'
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      mostrarSnackbar('Gerando PDF...', 'info');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      let eventosFiltrados = filteredEvents;
      if (periodoRelatorio.tipo === 'dia') {
        eventosFiltrados = eventosFiltrados.filter(e => e.data === periodoRelatorio.dataInicio);
      } else {
        eventosFiltrados = eventosFiltrados.filter(e => 
          e.data >= periodoRelatorio.dataInicio && e.data <= periodoRelatorio.dataFim
        );
      }

      eventosFiltrados.sort((a, b) => {
        if (a.data !== b.data) return a.data.localeCompare(b.data);
        return (a.horario || a.horaInicio || '').localeCompare(b.horario || b.horaInicio || '');
      });

      doc.setFontSize(20);
      doc.setTextColor(156, 39, 176);
      doc.text('Relatório de Agenda', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const profissionalNome = selectedProfessional === 'all' ? 'Todos os Profissionais' : 
        profissionais?.find(p => p.id === selectedProfessional)?.nome || 'Profissional';
      doc.text(`Profissional: ${profissionalNome}`, pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Período: ${formatDateBr(periodoRelatorio.dataInicio)} - ${formatDateBr(periodoRelatorio.dataFim)}`, pageWidth / 2, 38, { align: 'center' });
      doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 46, { align: 'center' });

      let yPos = 55;

      const totalEventos = eventosFiltrados.length;
      const totalAgendamentos = eventosFiltrados.filter(e => e.tipo === 'agendamento').length;
      const totalAtendimentos = eventosFiltrados.filter(e => e.tipo === 'atendimento').length;

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumo', 14, yPos);
      yPos += 8;

      const statsData = [
        ['Total de Eventos', totalEventos.toString()],
        ['Agendamentos', totalAgendamentos.toString()],
        ['Atendimentos', totalAtendimentos.toString()],
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

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Agenda Detalhada', 14, yPos);
      yPos += 8;

      const eventosPorData = {};
      eventosFiltrados.forEach(evento => {
        if (!eventosPorData[evento.data]) {
          eventosPorData[evento.data] = [];
        }
        eventosPorData[evento.data].push(evento);
      });

      Object.keys(eventosPorData).sort().forEach(data => {
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(156, 39, 176);
        doc.text(formatDateBr(data), 14, yPos);
        yPos += 6;

        const eventosDoDia = eventosPorData[data];
        const tableData = eventosDoDia.map(evento => {
          const cliente = clientes?.find(c => c.id === evento.clienteId || c.uid === evento.clienteId || c.googleUid === evento.clienteId);
          const profissional = profissionais?.find(p => p.id === evento.profissionalId);
          const servicos = evento.servicos || 
            (evento.servicoId ? [{ nome: evento.servicoNome || 'Serviço' }] : []);
          
          return [
            evento.horario || evento.horaInicio || '--:--',
            cliente?.nome || '—',
            servicos.map(s => s.nome).join(', ').substring(0, 30),
            profissional?.nome || '—',
            evento.tipo === 'agendamento' ? 'Agend.' : 'Atend.',
            evento.status || '—'
          ];
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Horário', 'Cliente', 'Serviços', 'Profissional', 'Tipo', 'Status']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8 },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      });

      const fileName = `agenda_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);

      await auditoriaService.registrar('exportar_pdf_agenda', {
        entidade: 'agendamentos',
        detalhes: 'Exportação de relatório de agenda em PDF',
        dados: {
          periodo: `${formatDateBr(periodoRelatorio.dataInicio)} - ${formatDateBr(periodoRelatorio.dataFim)}`,
          profissional: profissionalNome,
          totalEventos: eventosFiltrados.length
        }
      });
      
      mostrarSnackbar('PDF gerado com sucesso!', 'success');
      handleCloseRelatorio();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarSnackbar('Erro ao gerar PDF', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_pdf_agenda'
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      mostrarSnackbar('Gerando planilha...', 'info');
      
      let eventosFiltrados = filteredEvents;
      if (periodoRelatorio.tipo === 'dia') {
        eventosFiltrados = eventosFiltrados.filter(e => e.data === periodoRelatorio.dataInicio);
      } else {
        eventosFiltrados = eventosFiltrados.filter(e => 
          e.data >= periodoRelatorio.dataInicio && e.data <= periodoRelatorio.dataFim
        );
      }

      eventosFiltrados.sort((a, b) => {
        if (a.data !== b.data) return a.data.localeCompare(b.data);
        return (a.horario || a.horaInicio || '').localeCompare(b.horario || b.horaInicio || '');
      });

      const wb = XLSX.utils.book_new();

      const profissionalNome = selectedProfessional === 'all' ? 'Todos os Profissionais' : 
        profissionais?.find(p => p.id === selectedProfessional)?.nome || 'Profissional';

      const resumoData = [
        ['Relatório de Agenda'],
        [''],
        ['Profissional', profissionalNome],
        ['Período', `${formatDateBr(periodoRelatorio.dataInicio)} - ${formatDateBr(periodoRelatorio.dataFim)}`],
        ['Data de Emissão', new Date().toLocaleString('pt-BR')],
        [''],
        ['Resumo do Período'],
        ['Total de Eventos', eventosFiltrados.length],
        ['Agendamentos', eventosFiltrados.filter(e => e.tipo === 'agendamento').length],
        ['Atendimentos', eventosFiltrados.filter(e => e.tipo === 'atendimento').length],
      ];

      const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

      const agendaData = [
        ['Data', 'Horário', 'Cliente', 'Serviços', 'Profissional', 'Tipo', 'Status'],
        ...eventosFiltrados.map(evento => {
          const cliente = clientes?.find(c => c.id === evento.clienteId || c.uid === evento.clienteId || c.googleUid === evento.clienteId);
          const profissional = profissionais?.find(p => p.id === evento.profissionalId);
          const servicos = evento.servicos || 
            (evento.servicoId ? [{ nome: evento.servicoNome || 'Serviço' }] : []);
          
          return [
            formatDateBr(evento.data),
            evento.horario || evento.horaInicio || '--:--',
            cliente?.nome || '—',
            servicos.map(s => s.nome).join(', '),
            profissional?.nome || '—',
            evento.tipo === 'agendamento' ? 'Agendamento' : 'Atendimento',
            evento.status || '—'
          ];
        })
      ];

      const wsAgenda = XLSX.utils.aoa_to_sheet(agendaData);
      XLSX.utils.book_append_sheet(wb, wsAgenda, 'Agenda Detalhada');

      const statsPorStatus = {};
      eventosFiltrados.forEach(evento => {
        const status = evento.status || 'desconhecido';
        if (!statsPorStatus[status]) statsPorStatus[status] = 0;
        statsPorStatus[status]++;
      });

      const statsData = [
        ['Status', 'Quantidade'],
        ...Object.entries(statsPorStatus).map(([status, qtd]) => [status, qtd])
      ];

      const wsStats = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, wsStats, 'Por Status');

      const fileName = `agenda_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      await auditoriaService.registrar('exportar_excel_agenda', {
        entidade: 'agendamentos',
        detalhes: 'Exportação de relatório de agenda em Excel',
        dados: {
          periodo: `${formatDateBr(periodoRelatorio.dataInicio)} - ${formatDateBr(periodoRelatorio.dataFim)}`,
          profissional: profissionalNome,
          totalEventos: eventosFiltrados.length
        }
      });
      
      mostrarSnackbar('Planilha gerada com sucesso!', 'success');
      handleCloseRelatorio();
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      mostrarSnackbar('Erro ao gerar planilha', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_excel_agenda'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 120 : 60} sx={{ borderRadius: 2, mb: 2 }} />
        ))}
      </Box>
    );
  }

  if (errorAgendamentos) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Alert severity="error">{errorAgendamentos}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      pb: isMobile ? 10 : 3,
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      {/* Cabeçalho Mobile */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ 
              fontWeight: 700, 
              color: '#9c27b0',
              fontSize: isMobile ? '1.5rem' : '2.125rem'
            }}
          >
            {cargo === 'cliente' ? 'Meus Agendamentos' : 'Agenda'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {cargo === 'cliente' ? 'Acompanhe seus agendamentos' : 
             cargo === 'profissional' ? 'Sua agenda de atendimentos' :
             'Gerencie os agendamentos do salão'}
          </Typography>
        </Box>
        
        <Zoom in={true}>
          <Fab
            size="small"
            onClick={handleOpenRelatorio}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
            }}
          >
            <PrintIcon />
          </Fab>
        </Zoom>
      </Box>

      {/* Atendimentos em Andamento */}
      {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente' || cargo === 'profissional') && atendimentosEmAndamento.length > 0 && (
        <Card sx={{ mb: 3, border: '2px solid #ff9800', bgcolor: '#fff3e0' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TimerIcon sx={{ color: '#ff9800', mr: 1, fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                Atendimentos em Andamento ({atendimentosEmAndamento.length})
              </Typography>
            </Box>
            
            <Grid container spacing={1}>
              {atendimentosEmAndamento.slice(0, 3).map(atendimento => {
                const cliente = getClienteData(atendimento.clienteId);
                const profissional = getProfissionalData(atendimento.profissionalId);
                const servicosLista = atendimento.servicos || [];

                return (
                  <Grid item xs={12} key={atendimento.id}>
                    <Card variant="outlined" sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar 
                          src={cliente?.foto}
                          sx={{ width: 32, height: 32 }}
                        >
                          {!cliente?.foto && getInitials(cliente?.nome)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {cliente?.nome}
                          </Typography>
                          <Typography variant="caption" display="block" color="textSecondary">
                            {servicosLista.length} serviço(s) • {atendimento.horaInicio}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          startIcon={<PlayIcon />}
                          onClick={() => continuarAtendimento(atendimento)}
                          sx={{ height: 28, fontSize: '0.7rem' }}
                        >
                          Continuar
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Controles de Navegação e Filtros Mobile */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={handlePrevious} size="small">
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontWeight: 500, fontSize: '0.8rem' }}>
                {getHeaderText()}
              </Typography>
              <IconButton onClick={handleNext} size="small">
                <ChevronRightIcon />
              </IconButton>
              <IconButton onClick={handleToday} size="small" sx={{ color: '#9c27b0' }}>
                <TodayIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newView) => newView && setViewMode(newView)}
                size="small"
                sx={{ flex: 1 }}
              >
                <ToggleButton value="day" sx={{ fontSize: '0.7rem', py: 0.5 }}>
                  <TodayIcon sx={{ fontSize: 16, mr: 0.5 }} /> Dia
                </ToggleButton>
                <ToggleButton value="week" sx={{ fontSize: '0.7rem', py: 0.5 }}>
                  <WeekIcon sx={{ fontSize: 16, mr: 0.5 }} /> Sem.
                </ToggleButton>
                <ToggleButton value="month" sx={{ fontSize: '0.7rem', py: 0.5 }}>
                  <MonthIcon sx={{ fontSize: 16, mr: 0.5 }} /> Mês
                </ToggleButton>
              </ToggleButtonGroup>

              <IconButton 
                onClick={() => setOpenFilterDrawer(true)}
                sx={{ 
                  bgcolor: selectedProfessional !== 'all' || selectedStatus !== 'all' ? '#f3e5f5' : 'transparent',
                  color: selectedProfessional !== 'all' || selectedStatus !== 'all' ? '#9c27b0' : 'text.secondary'
                }}
              >
                <Badge 
                  variant="dot" 
                  color="primary"
                  invisible={selectedProfessional === 'all' && selectedStatus === 'all' && showAtendimentos}
                >
                  <FilterIcon />
                </Badge>
              </IconButton>

              {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  sx={{ 
                    bgcolor: '#9c27b0',
                    '&:hover': { bgcolor: '#7b1fa2' },
                    fontSize: '0.7rem',
                    py: 0.5
                  }}
                >
                  Novo
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Chip 
                label={`${stats.total} hoje`} 
                color="primary" 
                size="small"
                sx={{ height: 24, fontSize: '0.7rem' }}
              />
              {viewMode === 'day' && stats.agendamentos > 0 && (
                <Chip 
                  icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
                  label={`${stats.agendamentos}`} 
                  color="info" 
                  size="small"
                  sx={{ height: 24, fontSize: '0.7rem' }}
                />
              )}
              {viewMode === 'day' && stats.atendimentos > 0 && (cargo !== 'cliente') && (
                <Chip 
                  icon={<TimerIcon sx={{ fontSize: 14 }} />}
                  label={`${stats.atendimentos}`} 
                  color="warning" 
                  size="small"
                  sx={{ height: 24, fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Visualização por Dia Mobile */}
      {viewMode === 'day' && (
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              {cargo === 'cliente' ? 'Meus Agendamentos' : 'Agenda do Dia'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <AnimatePresence>
                {timeSlots.map(time => {
                  const eventsAtTime = dayEvents.filter(event => event.horario === time);
                  
                  if (eventsAtTime.length === 0) return null;

                  return eventsAtTime.map(event => {
                    const cliente = getClienteData(event.clienteId);
                    const profissional = getProfissionalData(event.profissionalId);
                    const servicosLista = event.servicos || [];

                    return (
                      <EventoMobileCard
                        key={`${event.tipo}-${event.id}`}
                        event={event}
                        cliente={cliente}
                        profissional={profissional}
                        servicos={servicosLista}
                        cargo={cargo}
                        onIniciar={iniciarAtendimento}
                        onContinuar={continuarAtendimento}
                        onConfirmar={(e) => handleStatusChange(e.id, 'confirmado')}
                        onCancelar={(e) => handleStatusChange(e.id, 'cancelado')}
                        onEditar={handleEdit}
                        onExcluir={(e) => handleDelete(e.id, e.tipo)}
                        onDetalhes={(e) => handleDayDetails(e.data, [e])}
                      />
                    );
                  });
                })}
              </AnimatePresence>

              {dayEvents.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <EventIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Nenhum evento para hoje
                  </Typography>
                </Paper>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Visualização por Semana Mobile */}
      {viewMode === 'week' && (
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Semana de {formatDateBr(weekDaysList[0])}
            </Typography>

            <Grid container spacing={1}>
              {weekEvents.map((day, index) => (
                <Grid item xs={12} key={index}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: day.date === selectedDate ? '#f3e5f5' : 'white',
                    }}
                    onClick={() => handleDayClick(day.date)}
                  >
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                          {day.dayName}
                        </Typography>
                        <Typography variant="caption">
                          {formatDateBr(day.date)}
                        </Typography>
                      </Box>
                      
                      {day.events.length > 0 ? (
                        <Box>
                          {day.events.slice(0, 2).map(event => {
                            const cliente = getClienteData(event.clienteId);
                            return (
                              <Box key={`${event.tipo}-${event.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <Badge
                                  color={getStatusColor(event.status)}
                                  variant="dot"
                                >
                                  {event.tipo === 'atendimento' ? (
                                    <TimerIcon sx={{ fontSize: 12, color: '#ff9800' }} />
                                  ) : (
                                    <ScheduleIcon sx={{ fontSize: 12, color: '#9c27b0' }} />
                                  )}
                                </Badge>
                                <Typography variant="caption">
                                  {event.horario} - {cliente?.nome?.split(' ')[0]}
                                </Typography>
                              </Box>
                            );
                          })}
                          {day.events.length > 2 && (
                            <Typography variant="caption" color="textSecondary">
                              +{day.events.length - 2} mais
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="textSecondary">
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

      {/* Visualização por Mês Mobile */}
      {viewMode === 'month' && (
        <Card>
          <CardContent sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, textTransform: 'capitalize', px: 1 }}>
              {format(currentDate, 'MMMM yyyy', { locale: dateFnsPtBR })}
            </Typography>

            <Grid container spacing={0.5} sx={{ mb: 1 }}>
              {weekDays.map(day => (
                <Grid item xs key={day}>
                  <Typography variant="caption" align="center" sx={{ fontWeight: 600, color: '#9c27b0', display: 'block', fontSize: '0.6rem' }}>
                    {day.substring(0, 3)}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {monthMatrix.map((week, weekIndex) => (
              <Grid container spacing={0.5} key={weekIndex} sx={{ mb: 0.5 }}>
                {week.map((day, dayIndex) => (
                  <Grid item xs key={dayIndex}>
                    {day ? (
                      <Card
                        variant="outlined"
                        sx={{
                          p: 0.5,
                          minHeight: 60,
                          cursor: 'pointer',
                          bgcolor: day.date === selectedDate ? '#f3e5f5' : 'white',
                          borderLeft: day.count > 0 ? '2px solid #9c27b0' : 'none',
                        }}
                        onClick={() => day.count > 0 ? handleDayDetails(day.date, day.events) : handleDayClick(day.date)}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                          {day.day}
                        </Typography>
                        
                        {day.count > 0 && (
                          <Box>
                            <Box sx={{ display: 'flex', gap: 0.25, mb: 0.5, flexWrap: 'wrap' }}>
                              {day.agendamentos > 0 && (
                                <Chip
                                  icon={<ScheduleIcon style={{ fontSize: 10 }} />}
                                  label={day.agendamentos}
                                  size="small"
                                  sx={{
                                    bgcolor: '#9c27b0',
                                    color: 'white',
                                    height: 16,
                                    fontSize: '0.5rem',
                                    '& .MuiChip-icon': { fontSize: 10 }
                                  }}
                                />
                              )}
                              
                              {day.atendimentos > 0 && (
                                <Chip
                                  icon={<TimerIcon style={{ fontSize: 10 }} />}
                                  label={day.atendimentos}
                                  size="small"
                                  sx={{
                                    bgcolor: '#ff9800',
                                    color: 'white',
                                    height: 16,
                                    fontSize: '0.5rem',
                                    '& .MuiChip-icon': { fontSize: 10 }
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        )}
                      </Card>
                    ) : (
                      <Box sx={{ p: 0.5, minHeight: 60, bgcolor: '#f5f5f5', borderRadius: 1 }} />
                    )}
                  </Grid>
                ))}
              </Grid>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Drawer de Filtros */}
      <SwipeableDrawer
        anchor="bottom"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        onOpen={() => setOpenFilterDrawer(true)}
        disableSwipeToOpen={false}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80vh',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filtros
            </Typography>
            <IconButton onClick={() => setOpenFilterDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
                Profissional
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                <Button
                  fullWidth
                  variant={selectedProfessional === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedProfessional('all')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Todos os profissionais
                </Button>
                {(profissionais || []).map(prof => (
                  <Button
                    key={prof.id}
                    fullWidth
                    variant={selectedProfessional === prof.id ? 'contained' : 'outlined'}
                    onClick={() => setSelectedProfessional(prof.id)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    <WorkIcon sx={{ mr: 1, fontSize: 18 }} />
                    {prof.nome}
                  </Button>
                ))}
              </Box>
            </>
          )}

          {cargo !== 'cliente' && (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
                Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                <Button
                  fullWidth
                  variant={selectedStatus === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedStatus('all')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Todos os status
                </Button>
                <Button
                  fullWidth
                  variant={selectedStatus === 'confirmado' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedStatus('confirmado')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    color: selectedStatus === 'confirmado' ? 'white' : '#4caf50',
                    borderColor: '#4caf50',
                    bgcolor: selectedStatus === 'confirmado' ? '#4caf50' : 'transparent',
                  }}
                >
                  <CheckIcon sx={{ mr: 1, fontSize: 18 }} />
                  Confirmado
                </Button>
                <Button
                  fullWidth
                  variant={selectedStatus === 'pendente' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedStatus('pendente')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    color: selectedStatus === 'pendente' ? 'white' : '#ff9800',
                    borderColor: '#ff9800',
                    bgcolor: selectedStatus === 'pendente' ? '#ff9800' : 'transparent',
                  }}
                >
                  <ScheduleIcon sx={{ mr: 1, fontSize: 18 }} />
                  Pendente
                </Button>
                <Button
                  fullWidth
                  variant={selectedStatus === 'em_andamento' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedStatus('em_andamento')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    color: selectedStatus === 'em_andamento' ? 'white' : '#ff4081',
                    borderColor: '#ff4081',
                    bgcolor: selectedStatus === 'em_andamento' ? '#ff4081' : 'transparent',
                  }}
                >
                  <TimerIcon sx={{ mr: 1, fontSize: 18 }} />
                  Em Andamento
                </Button>
                <Button
                  fullWidth
                  variant={selectedStatus === 'cancelado' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedStatus('cancelado')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    color: selectedStatus === 'cancelado' ? 'white' : '#f44336',
                    borderColor: '#f44336',
                    bgcolor: selectedStatus === 'cancelado' ? '#f44336' : 'transparent',
                  }}
                >
                  <CancelIcon sx={{ mr: 1, fontSize: 18 }} />
                  Cancelado
                </Button>
              </Box>
            </>
          )}

          {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
                Mostrar
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant={showAtendimentos ? 'contained' : 'outlined'}
                  onClick={() => setShowAtendimentos(true)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Agendamentos e Atendimentos
                </Button>
                <Button
                  fullWidth
                  variant={!showAtendimentos ? 'contained' : 'outlined'}
                  onClick={() => setShowAtendimentos(false)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Apenas Agendamentos
                </Button>
              </Box>
            </>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={() => setOpenFilterDrawer(false)}
            sx={{ bgcolor: '#9c27b0', mt: 3 }}
          >
            Aplicar Filtros
          </Button>
        </Box>
      </SwipeableDrawer>

      {/* Dialog de Detalhes do Dia */}
      <Dialog 
        open={openDayDialog} 
        onClose={() => setOpenDayDialog(false)}
        fullScreen={isMobile}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#9c27b0', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: isMobile ? 2 : 3,
        }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={() => setOpenDayDialog(false)}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            {selectedDayDetails?.date && formatDateTime(selectedDayDetails.date)}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box>
            {selectedDayDetails?.events.map(event => {
              const cliente = getClienteData(event.clienteId);
              const profissional = getProfissionalData(event.profissionalId);
              const servicosLista = event.servicos || [];

              return (
                <Card key={`${event.tipo}-${event.id}`} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar 
                      src={cliente?.foto}
                      sx={{ width: 40, height: 40 }}
                    >
                      {!cliente?.foto && getInitials(cliente?.nome)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {cliente?.nome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {event.horario || event.horaInicio}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Serviços</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {servicosLista.map(servico => (
                          <Chip
                            key={servico.id}
                            label={`${servico.nome} - R$ ${servico.preco?.toFixed(2)}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 24, fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Total</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        R$ {event.valorTotal?.toFixed(2)}
                      </Typography>
                    </Grid>

                    {cargo !== 'cliente' && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Profissional</Typography>
                        <Typography variant="body2">{profissional?.nome}</Typography>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          icon={event.tipo === 'atendimento' ? <TimerIcon /> : <ScheduleIcon />}
                          label={event.tipo === 'atendimento' ? 'Atendimento' : 'Agendamento'}
                          size="small"
                          color={event.tipo === 'atendimento' ? 'warning' : 'info'}
                          sx={{ height: 24 }}
                        />
                        <Chip
                          icon={getStatusIcon(event.status)}
                          label={getStatusLabel(event.status)}
                          size="small"
                          color={getStatusColor(event.status)}
                          sx={{ height: 24 }}
                        />
                      </Box>
                    </Grid>

                    {event.observacoes && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Observações</Typography>
                        <Typography variant="body2">{event.observacoes}</Typography>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                    {cargo !== 'cliente' && event.tipo === 'agendamento' && event.status === 'confirmado' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<PlayIcon />}
                        onClick={() => {
                          setOpenDayDialog(false);
                          iniciarAtendimento(event);
                        }}
                      >
                        Iniciar
                      </Button>
                    )}
                    {cargo !== 'cliente' && event.tipo === 'atendimento' && event.status === 'em_andamento' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        startIcon={<PlayIcon />}
                        onClick={() => {
                          setOpenDayDialog(false);
                          continuarAtendimento(event);
                        }}
                      >
                        Continuar
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setOpenDayDialog(false)}
                    >
                      Fechar
                    </Button>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog de Agendamento */}
      {openDialog && (cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          fullScreen={isMobile}
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle sx={{ 
            bgcolor: '#9c27b0', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: isMobile ? 2 : 3,
          }}>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={() => setOpenDialog(false)}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant={isMobile ? "subtitle1" : "h6"}>
              {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSave}>
            <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
              <Grid container spacing={2}>
                {/* Campo de Cliente com Pesquisa */}
                <Grid item xs={12}>
                  {!formData.clienteId ? (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                          Selecione o Cliente
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<PersonSearchIcon />}
                          onClick={handleOpenClientSearch}
                          variant="contained"
                          sx={{ bgcolor: '#9c27b0' }}
                        >
                          Buscar
                        </Button>
                      </Box>

                      <Collapse in={showClientSearch}>
                        <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#faf5ff' }}>
                          <Typography variant="caption" sx={{ mb: 2, display: 'block', color: '#9c27b0' }}>
                            Buscar cliente por:
                          </Typography>
                          
                          <RadioGroup
                            row
                            value={searchClientType}
                            onChange={(e) => setSearchClientType(e.target.value)}
                            sx={{ mb: 2 }}
                          >
                            <FormControlLabel value="nome" control={<Radio size="small" />} label={<Typography variant="caption">Nome</Typography>} />
                            <FormControlLabel value="cpf" control={<Radio size="small" />} label={<Typography variant="caption">CPF</Typography>} />
                            <FormControlLabel value="dataNascimento" control={<Radio size="small" />} label={<Typography variant="caption">Nascimento</Typography>} />
                          </RadioGroup>

                          {searchClientType === 'nome' && (
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Digite o nome..."
                              value={searchClientTerm}
                              onChange={(e) => setSearchClientTerm(e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonSearchIcon fontSize="small" />
                                  </InputAdornment>
                                ),
                                endAdornment: searchClientTerm && (
                                  <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchClientTerm('')}>
                                      <ClearIcon fontSize="small" />
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />
                          )}

                          {searchClientType === 'cpf' && (
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Digite o CPF"
                              value={cpfInput}
                              onChange={(e) => setCpfInput(e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FingerprintIcon fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
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
                              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                                {searchClientResults.map((cliente) => (
                                  <React.Fragment key={cliente.id}>
                                    <ListItem 
                                      button
                                      onClick={() => handleSelectClient(cliente)}
                                      sx={{ py: 0.5 }}
                                    >
                                      <ListItemAvatar>
                                        <Avatar 
                                          src={cliente.foto}
                                          sx={{ width: 32, height: 32 }}
                                        >
                                          {!cliente.foto && getInitials(cliente.nome)}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {cliente.nome}
                                          </Typography>
                                        }
                                        secondary={
                                          <Typography variant="caption" color="textSecondary">
                                            {cliente.cpf && `CPF: ${formatarCPF(cliente.cpf)} • `}
                                            {cliente.telefone && formatarTelefone(cliente.telefone)}
                                          </Typography>
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
                        <Avatar 
                          src={getSelectedClientData()?.foto}
                          sx={{ width: 40, height: 40 }}
                        >
                          {!getSelectedClientData()?.foto && getInitials(getSelectedClientData()?.nome)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {getSelectedClientData()?.nome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {getSelectedClientData()?.cpf && `CPF: ${formatarCPF(getSelectedClientData()?.cpf)}`}
                          </Typography>
                        </Box>
                        <Tooltip title="Trocar cliente">
                          <IconButton onClick={handleClearClient} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  )}
                </Grid>

                {/* Seção de Serviços */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#9c27b0' }}>
                    Serviços
                  </Typography>

                  {servicosSelecionados.length > 0 && (
                    <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {servicosSelecionados.map((servico) => (
                              <TableRow key={servico.id}>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{servico.nome}</TableCell>
                                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>R$ {servico.preco?.toFixed(2)}</TableCell>
                                <TableCell align="center" sx={{ width: 40 }}>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => removerServico(servico.id)}
                                  >
                                    <RemoveCircleIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={2} align="right">
                                <Typography variant="subtitle2">Total:</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2" sx={{ color: '#9c27b0' }}>
                                  R$ {formData.valorTotal?.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  )}

                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Autocomplete
                        options={profissionaisFiltrados}
                        getOptionLabel={(option) => option.nome || ''}
                        value={profissionais?.find(p => p.id === formData.profissionalId) || null}
                        onChange={(e, newValue) => {
                          setFormData({ ...formData, profissionalId: newValue?.id || '' });
                          setProfissionalSelecionado(newValue?.id || '');
                        }}
                        inputValue={buscaProfissional}
                        onInputChange={(e, newValue) => setBuscaProfissional(newValue)}
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Profissional"
                            placeholder="Digite para buscar..."
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={9}>
                      <Autocomplete
                        options={servicosFiltrados}
                        getOptionLabel={(option) => `${option.nome} - R$ ${option.preco?.toFixed(2)}`}
                        value={servicos?.find(s => s.id === servicoAtual) || null}
                        onChange={(e, newValue) => setServicoAtual(newValue?.id || '')}
                        inputValue={buscaServico}
                        onInputChange={(e, newValue) => setBuscaServico(newValue)}
                        disabled={!formData.profissionalId}
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Serviço"
                            placeholder="Digite para buscar..."
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={3}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={adicionarServico}
                        disabled={!servicoAtual}
                        sx={{ height: '100%', borderColor: '#9c27b0', color: '#9c27b0' }}
                      >
                        <AddIcon />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Data e Hora */}
                <Grid item xs={6}>
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

                <Grid item xs={6}>
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

                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
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
                    rows={2}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    size="small"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
              <Button onClick={() => setOpenDialog(false)} fullWidth={isMobile}>Cancelar</Button>
              <Button 
                type="submit" 
                variant="contained"
                sx={{ bgcolor: '#9c27b0' }}
                fullWidth={isMobile}
              >
                {selectedAppointment ? 'Atualizar' : 'Salvar'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          Cancelar Agendamento
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <WarningIcon sx={{ fontSize: 48, color: '#f44336', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Tem certeza que deseja cancelar este agendamento?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} fullWidth={isMobile}>Voltar</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={confirmDelete}
            fullWidth={isMobile}
          >
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Relatórios */}
      {openRelatorioDialog && (cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
        <Dialog 
          open={openRelatorioDialog} 
          onClose={handleCloseRelatorio}
          fullScreen={isMobile}
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon />
              <Typography variant="h6">Exportar Agenda</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selecione o período:
              </Typography>
              
              <RadioGroup
                value={periodoRelatorio.tipo}
                onChange={(e) => setPeriodoRelatorio({ ...periodoRelatorio, tipo: e.target.value })}
                sx={{ mb: 2 }}
              >
                <FormControlLabel value="dia" control={<Radio size="small" />} label={<Typography variant="body2">Dia atual</Typography>} />
                <FormControlLabel value="semana" control={<Radio size="small" />} label={<Typography variant="body2">Semana atual</Typography>} />
                <FormControlLabel value="mes" control={<Radio size="small" />} label={<Typography variant="body2">Mês atual</Typography>} />
                <FormControlLabel value="personalizado" control={<Radio size="small" />} label={<Typography variant="body2">Personalizado</Typography>} />
              </RadioGroup>

              {periodoRelatorio.tipo === 'personalizado' && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                      <DatePicker
                        label="Data Início"
                        value={new Date(periodoRelatorio.dataInicio + 'T12:00:00')}
                        onChange={(newValue) => {
                          if (newValue) {
                            setPeriodoRelatorio({ 
                              ...periodoRelatorio, 
                              dataInicio: formatDate(newValue) 
                            });
                          }
                        }}
                        renderInput={(params) => (
                          <TextField {...params} fullWidth size="small" />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                      <DatePicker
                        label="Data Fim"
                        value={new Date(periodoRelatorio.dataFim + 'T12:00:00')}
                        onChange={(newValue) => {
                          if (newValue) {
                            setPeriodoRelatorio({ 
                              ...periodoRelatorio, 
                              dataFim: formatDate(newValue) 
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

              <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>
                Formato de exportação:
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => {
                      handleCloseRelatorio();
                      handlePrint();
                    }}
                    sx={{ p: 1.5 }}
                  >
                    <Box>
                      <Typography variant="body2">Imprimir</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Versão para impressão
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PdfIcon />}
                    onClick={() => {
                      handleCloseRelatorio();
                      handleExportPDF();
                    }}
                    sx={{ p: 1.5 }}
                    color="error"
                  >
                    <Box>
                      <Typography variant="body2">PDF</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Documento profissional
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ExcelIcon />}
                    onClick={() => {
                      handleCloseRelatorio();
                      handleExportExcel();
                    }}
                    sx={{ p: 1.5 }}
                    color="success"
                  >
                    <Box>
                      <Typography variant="body2">Excel</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Planilha editável
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
      )}

      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <RelatorioAgenda
          ref={relatorioRef}
          eventos={filteredEvents}
          profissional={selectedProfessional}
          periodo={periodoRelatorio}
          clientes={clientes}
          profissionais={profissionais}
          viewMode={viewMode}
          dataInicio={periodoRelatorio.dataInicio}
          dataFim={periodoRelatorio.dataFim}
          usuarioCargo={cargo}
        />
      </Box>

      {/* Bottom Navigation Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1000,
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => {
              setBottomNavValue(newValue);
              switch(newValue) {
                case 0:
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  break;
                case 1:
                  setOpenFilterDrawer(true);
                  break;
                case 2:
                  handleOpenRelatorio();
                  break;
                case 3:
                  if (cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') {
                    handleAdd();
                  }
                  break;
                default:
                  break;
              }
            }}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root.Mui-selected': {
                color: '#9c27b0',
              },
            }}
          >
            <BottomNavigationAction label="Início" icon={<EventIcon />} />
            <BottomNavigationAction 
              label="Filtros" 
              icon={
                <Badge 
                  variant="dot" 
                  color="primary"
                  invisible={selectedProfessional === 'all' && selectedStatus === 'all' && showAtendimentos}
                >
                  <FilterIcon />
                </Badge>
              } 
            />
            <BottomNavigationAction label="Exportar" icon={<PrintIcon />} />
            {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
              <BottomNavigationAction label="Novo" icon={<AddIcon />} />
            )}
          </BottomNavigation>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ModernAgendamentos;
