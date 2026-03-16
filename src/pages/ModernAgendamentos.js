// src/pages/ModernAgendamentos.js
import React, { useState, useEffect, useRef } from 'react';
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
import { usuariosService } from '../services/usuariosService';
import { auditoriaService } from '../services/auditoriaService';
import { Timestamp } from 'firebase/firestore';

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

// Componente para impressão da agenda - VERSÃO MELHORADA
const RelatorioAgenda = React.forwardRef(({ 
  eventos, 
  profissional, 
  periodo, 
  clientes,
  profissionais,
  viewMode,
  dataInicio,
  dataFim,
  usuarioCargo,
  configuracoes
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

  // Calcular estatísticas
  const totalEventos = eventos.length;
  const totalAgendamentos = eventos.filter(e => e.tipo === 'agendamento').length;
  const totalAtendimentos = eventos.filter(e => e.tipo === 'atendimento').length;
  const totalAndamento = eventos.filter(e => e.status === 'em_andamento').length;
  const totalConfirmados = eventos.filter(e => e.status === 'confirmado').length;
  const totalPendentes = eventos.filter(e => e.status === 'pendente').length;
  const totalCancelados = eventos.filter(e => e.status === 'cancelado').length;
  const totalFinalizados = eventos.filter(e => e.status === 'finalizado').length;

  return (
    <Box ref={ref} sx={{ p: 3, fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Cabeçalho com Logo */}
      <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '2px solid #9c27b0', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 0.5, fontSize: '1.8rem' }}>
          Relatório de Agenda
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#555', fontSize: '1rem' }}>
          {profissionalNome}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
          Período: {formatarData(dataInicio)} - {formatarData(dataFim)}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
          Emitido em: {new Date().toLocaleString('pt-BR')}
        </Typography>
      </Box>

      {/* Estatísticas - VERSÃO COMPACTA */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333', fontSize: '0.9rem', borderBottom: '1px solid #ccc', pb: 0.5 }}>
          Resumo do Período
        </Typography>
        <Grid container spacing={0.5}>
          <Grid item xs={3}>
            <Paper sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem' }}>Total</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{totalEventos}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem' }}>Agend.</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0', fontSize: '0.8rem' }}>{totalAgendamentos}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem' }}>Atend.</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800', fontSize: '0.8rem' }}>{totalAtendimentos}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem' }}>Andam.</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336', fontSize: '0.8rem' }}>{totalAndamento}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Estatísticas detalhadas */}
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip label={`✅ ${totalConfirmados} confirmados`} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: '#e8f5e9' }} />
          <Chip label={`⏳ ${totalPendentes} pendentes`} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: '#fff3e0' }} />
          <Chip label={`❌ ${totalCancelados} cancelados`} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: '#ffebee' }} />
          <Chip label={`✅ ${totalFinalizados} finalizados`} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: '#e3f2fd' }} />
        </Box>
      </Box>

      {/* Eventos por Dia - VERSÃO COMPACTA */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333', fontSize: '0.9rem', borderBottom: '1px solid #ccc', pb: 0.5 }}>
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
            <Card key={data} variant="outlined" sx={{ mb: 1.5 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#9c27b0', fontSize: '0.8rem' }}>
                  {formatarData(data)}
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                        <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}><strong>Hor.</strong></TableCell>
                        <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}><strong>Cliente</strong></TableCell>
                        <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}><strong>Serviços</strong></TableCell>
                        <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}><strong>Prof.</strong></TableCell>
                        <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}><strong>Tipo</strong></TableCell>
                        <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}><strong>Status</strong></TableCell>
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
                            <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>{evento.horario || evento.horaInicio}</TableCell>
                            <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>{cliente?.nome || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>
                              {servicos.map(s => s.nome).join(', ')}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>{profissional?.nome || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>
                              {evento.tipo === 'agendamento' ? 'Agend.' : 'Atend.'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.6rem', p: 0.5 }}>
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
      <Box sx={{ mt: 2, textAlign: 'center', color: 'text.secondary', borderTop: '1px solid #ccc', pt: 1 }}>
        <Typography variant="caption" sx={{ fontSize: '0.5rem' }}>
          Relatório gerado automaticamente • Documento não fiscal
        </Typography>
      </Box>
    </Box>
  );
});

function ModernAgendamentos() {
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
  
  // 🔥 Trigger para forçar atualização
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

  // Configurações do salão
  const [configuracoes, setConfiguracoes] = useState(null);

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

  // Carregar configurações
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      const configData = await firebaseService.getAll('configuracoes');
      if (configData && configData.length > 0) {
        setConfiguracoes(configData[0]);
      }
    };
    carregarConfiguracoes();
  }, []);

  useEffect(() => {
    const user = usuariosService.getUsuarioAtual();
    setUsuario(user);
    setCargo(user?.cargo || '');

    // Registrar acesso na auditoria
    auditoriaService.registrar('acesso_agenda', {
      entidade: 'agendamentos',
      detalhes: `Acesso à página de agenda`,
      dados: {
        usuarioId: user?.id,
        cargo: user?.cargo
      }
    });

    // Se for profissional, filtrar automaticamente pelo profissional
    if (user?.cargo === 'profissional' && user?.profissionalId) {
      setSelectedProfessional(user.profissionalId);
    }

    // Se for cliente, mostrar apenas seus agendamentos
    if (user?.cargo === 'cliente' && user?.clienteId) {
      setSelectedProfessional('all');
    }
  }, []);

  const loading = loadingAgendamentos || loadingAtendimentos || loadingClientes || loadingProfissionais || loadingServicos || loadingUsuarios;

  // ============================================
  // 🔥 FUNÇÕES CORRIGIDAS PARA ACESSAR DADOS DO CLIENTE
  // ============================================

  // Função para obter dados do cliente de forma segura
  const getClienteData = (clienteId) => {
    if (!clienteId || !clientes) return null;
    
    // Buscar cliente pelo ID (pode ser o uid do Firebase Auth ou o id do documento)
    const cliente = clientes.find(c => 
      c.id === clienteId || 
      c.uid === clienteId || 
      c.googleUid === clienteId
    );
    
    if (!cliente) return null;
    
    // Retornar objeto padronizado com todos os campos necessários
    return {
      id: cliente.id || cliente.uid || cliente.googleUid,
      nome: cliente.nome || cliente.displayName || 'Cliente',
      telefone: cliente.telefone || cliente.phoneNumber || 'Não informado',
      email: cliente.email || '',
      cpf: cliente.cpf || '',
      foto: cliente.foto || cliente.photoURL || null,
      dataNascimento: cliente.dataNascimento || '',
      genero: cliente.genero || '',
      cep: cliente.cep || '',
      logradouro: cliente.logradouro || '',
      numero: cliente.numero || '',
      complemento: cliente.complemento || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      status: cliente.status || 'Ativo'
    };
  };

  // Função para obter dados do profissional
  const getProfissionalData = (profissionalId) => {
    if (!profissionalId || !profissionais) return null;
    
    const profissional = profissionais.find(p => 
      p.id === profissionalId || 
      p.uid === profissionalId
    );
    
    if (!profissional) return null;
    
    return {
      id: profissional.id || profissional.uid,
      nome: profissional.nome || profissional.displayName || 'Profissional',
      especialidade: profissional.especialidade || '',
      foto: profissional.foto || profissional.photoURL || null
    };
  };

  // Função para obter dados do usuário do sistema
  const getUsuarioSistemaData = (usuarioId) => {
    if (!usuarioId || !usuarios) return null;
    
    const usuario = usuarios.find(u => 
      u.id === usuarioId || 
      u.uid === usuarioId
    );
    
    return usuario || null;
  };

  // Função para formatar telefone
  const formatarTelefone = (telefone) => {
    if (!telefone || telefone === 'Não informado') return telefone;
    
    // Remove tudo que não é número
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

  // Função para formatar data no formato brasileiro
  const formatarDataBrasil = (data) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  };

  // Filtrar eventos baseado no cargo do usuário
  const filtrarEventosPorUsuario = (eventos) => {
    if (!usuario) return eventos;

    // Cliente: ver apenas seus próprios eventos
    if (cargo === 'cliente' && usuario.clienteId) {
      return eventos.filter(e => e.clienteId === usuario.clienteId);
    }

    // Profissional: ver apenas seus eventos
    if (cargo === 'profissional' && usuario.profissionalId) {
      return eventos.filter(e => e.profissionalId === usuario.profissionalId);
    }

    // Admin, Gerente, Atendente: ver todos
    return eventos;
  };

  // Combinar agendamentos e atendimentos
  const todosEventos = filtrarEventosPorUsuario([
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

  // ============================================
  // FUNÇÕES PARA FILTRAR SERVIÇOS POR PROFISSIONAL
  // ============================================

  // Atualizar serviços disponíveis quando profissional é selecionado
  useEffect(() => {
    if (formData.profissionalId && servicos) {
      // Buscar o profissional selecionado
      const profissional = profissionais?.find(p => p.id === formData.profissionalId);
      
      if (profissional && profissional.servicosIds) {
        // Filtrar serviços pelos IDs associados ao profissional
        const servicosDoProfissional = servicos.filter(s => 
          profissional.servicosIds.includes(s.id) && s.ativo !== false
        );
        setServicosDisponiveis(servicosDoProfissional);
      } else {
        // Se profissional não tem serviços específicos, mostrar todos ativos
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

  // ============================================
  // FUNÇÕES PARA GERENCIAR MÚLTIPLOS SERVIÇOS
  // ============================================

  // Adicionar serviço à lista
  const adicionarServico = () => {
    if (!servicoAtual) {
      toast.error('Selecione um serviço');
      return;
    }

    const servico = servicos?.find(s => s.id === servicoAtual);
    if (!servico) return;

    // Verificar se serviço já foi adicionado
    if (servicosSelecionados.some(s => s.id === servico.id)) {
      toast.error('Este serviço já foi adicionado');
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

    setServicosSelecionados([...servicosSelecionados, novoServico]);
    setServicoAtual('');
    setBuscaServico('');
    
    // Calcular novo valor total
    const novoTotal = [...servicosSelecionados, novoServico].reduce((acc, s) => acc + (s.preco || 0), 0);
    setFormData({ ...formData, valorTotal: novoTotal, servicos: [...servicosSelecionados, novoServico] });
  };

  // Remover serviço da lista
  const removerServico = (id) => {
    const novosServicos = servicosSelecionados.filter(s => s.id !== id);
    setServicosSelecionados(novosServicos);
    
    // Calcular novo valor total
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

  // ============================================
  // FUNÇÕES DE PESQUISA DE CLIENTES
  // ============================================

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
    toast.success(`Cliente ${cliente.nome} selecionado`);
  };

  const handleClearClient = () => {
    setFormData({ ...formData, clienteId: '' });
  };

  const getSelectedClientData = () => {
    return getClienteData(formData.clienteId);
  };

  // Filtrar eventos
  const filteredEvents = todosEventos.filter(event => {
    const professionalMatch = selectedProfessional === 'all' || event.profissionalId === selectedProfessional;
    const statusMatch = selectedStatus === 'all' || event.status === selectedStatus;
    const tipoMatch = showAtendimentos ? true : event.tipo === 'agendamento';
    
    // Se for profissional, só vê eventos do seu profissionalId (já filtrado no filtrarEventosPorUsuario)
    if (cargo === 'profissional') {
      return statusMatch && tipoMatch;
    }
    
    // Se for cliente, só vê seus eventos (já filtrado no filtrarEventosPorUsuario)
    if (cargo === 'cliente') {
      return statusMatch && tipoMatch;
    }
    
    // Admin, Gerente, Atendente: todos com filtros
    return professionalMatch && statusMatch && tipoMatch;
  });

  const dayEvents = filteredEvents.filter(event => event.data === selectedDate);
  const atendimentosEmAndamento = (atendimentos || []).filter(att => att.status === 'em_andamento');

  const weekDays_list = getWeekDays(currentDate);
  const weekEvents = weekDays_list.map(day => ({
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
    // Profissionais e clientes não podem criar agendamentos
    if (cargo === 'profissional') {
      toast.error('Profissionais não podem criar agendamentos');
      return;
    }
    
    if (cargo === 'cliente') {
      // Cliente pode criar? Se sim, redirecionar para página específica
      toast.info('Para agendar, entre em contato com a recepção');
      return;
    }
    
    setSelectedAppointment(null);
    setOpenDialog(true);
  };

  const handleEdit = (event) => {
    // Profissionais e clientes não podem editar
    if (cargo === 'profissional' || cargo === 'cliente') {
      toast.error('Você não tem permissão para editar agendamentos');
      return;
    }
    
    if (event.tipo === 'agendamento') {
      setSelectedAppointment(event);
      setOpenDialog(true);
    } else {
      toast('Atendimentos não podem ser editados diretamente');
    }
  };

  const handleDelete = (id, tipo) => {
    // Profissionais e clientes não podem excluir
    if (cargo === 'profissional' || cargo === 'cliente') {
      toast.error('Você não tem permissão para cancelar agendamentos');
      return;
    }
    
    if (tipo === 'agendamento') {
      setAppointmentToDelete(id);
      setOpenDeleteDialog(true);
    } else {
      toast('Atendimentos não podem ser excluídos');
    }
  };

  const confirmDelete = async () => {
    try {
      const agendamento = agendamentos?.find(a => a.id === appointmentToDelete);
      
      await excluir(appointmentToDelete);
      
      // Registrar na auditoria
      await auditoriaService.registrar('cancelar_agendamento', {
        entidade: 'agendamentos',
        entidadeId: appointmentToDelete,
        detalhes: `Agendamento cancelado`,
        dados: {
          clienteId: agendamento?.clienteId,
          profissionalId: agendamento?.profissionalId,
          data: agendamento?.data,
          horario: agendamento?.horario
        },
        usuarioId: usuario?.id
      });

      toast.success('Agendamento cancelado com sucesso!');
      setUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao cancelar agendamento');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'cancelar_agendamento',
        agendamentoId: appointmentToDelete
      });
    }
    setOpenDeleteDialog(false);
    setAppointmentToDelete(null);
  };

  // 🔥 FUNÇÃO CORRIGIDA: Atualizar status com trigger
  const handleStatusChange = async (id, newStatus) => {
    // Profissionais e clientes não podem alterar status
    if (cargo === 'profissional' || cargo === 'cliente') {
      toast.error('Você não tem permissão para alterar status');
      return;
    }
    
    try {
      const toastId = toast.loading('Atualizando status...');
      
      const agendamentoAntigo = agendamentos?.find(a => a.id === id);
      
      await atualizar(id, { status: newStatus });
      
      // Registrar na auditoria
      await auditoriaService.registrar('alterar_status_agendamento', {
        entidade: 'agendamentos',
        entidadeId: id,
        detalhes: `Status alterado para ${newStatus}`,
        dados: {
          statusAnterior: agendamentoAntigo?.status,
          statusNovo: newStatus,
          clienteId: agendamentoAntigo?.clienteId,
          profissionalId: agendamentoAntigo?.profissionalId
        },
        usuarioId: usuario?.id
      });
      
      setUpdateTrigger(prev => prev + 1);
      
      toast.dismiss(toastId);
      toast.success(`Status alterado para ${getStatusLabel(newStatus)}!`);
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
      
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
        toast.error('Selecione um cliente');
        return;
      }

      if (servicosSelecionados.length === 0) {
        toast.error('Adicione pelo menos um serviço');
        return;
      }

      if (!formData.horario) {
        toast.error('Selecione um horário');
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
        toast.error('Este horário já está ocupado para este profissional');
        return;
      }

      const dadosParaSalvar = {
        clienteId: formData.clienteId,
        profissionalId: formData.profissionalId,
        servicoId: servicosSelecionados[0]?.id, // Primeiro serviço para compatibilidade
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
        
        // Registrar na auditoria
        await auditoriaService.registrarAtualizacao(
          'agendamentos',
          selectedAppointment.id,
          agendamentoAntigo,
          dadosParaSalvar,
          `Agendamento atualizado`
        );

        agendamentoCriado = { ...dadosParaSalvar, id: selectedAppointment.id };
        toast.success('Agendamento atualizado!');
      } else {
        agendamentoCriado = await adicionar(dadosParaSalvar);
        
        // Registrar na auditoria
        await auditoriaService.registrarCriacao(
          'agendamentos',
          agendamentoCriado.id,
          dadosParaSalvar,
          `Novo agendamento criado`
        );

        toast.success('Agendamento criado!');
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
      toast.error('Erro ao salvar agendamento');
      
      await auditoriaService.registrarErro(error, { 
        acao: selectedAppointment ? 'atualizar_agendamento' : 'criar_agendamento',
        dados: formData
      });
    }
  };

  const iniciarAtendimento = async (agendamento) => {
    // Profissionais e clientes não podem iniciar atendimentos
    if (cargo === 'cliente') {
      toast.error('Apenas funcionários podem iniciar atendimentos');
      return;
    }
    
    try {
      if (!agendamento || !agendamento.id) {
        toast.error('Agendamento não encontrado');
        return;
      }

      const toastId = toast.loading('Iniciando atendimento...');

      const atendimentoExistente = (atendimentos || []).find(a => a.agendamentoId === agendamento.id);
      
      if (atendimentoExistente) {
        toast.dismiss(toastId);
        toast.success('Atendimento já existe!');
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

      // Registrar na auditoria
      await auditoriaService.registrar('iniciar_atendimento', {
        entidade: 'atendimentos',
        entidadeId: atendimentoCriado.id,
        detalhes: `Atendimento iniciado a partir do agendamento ${agendamento.id}`,
        dados: {
          agendamentoId: agendamento.id,
          clienteId: agendamento.clienteId,
          profissionalId: agendamento.profissionalId,
          servicos: servicosLista.length
        }
      });

      setUpdateTrigger(prev => prev + 1);

      toast.dismiss(toastId);
      toast.success('Atendimento iniciado com sucesso!');
      
      navigate(`/atendimento/${atendimentoCriado.id}`);
      
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      toast.error('Erro ao iniciar atendimento');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'iniciar_atendimento',
        agendamentoId: agendamento?.id
      });
    }
  };

  const continuarAtendimento = (atendimento) => {
    // Profissionais e atendentes podem continuar, clientes não
    if (cargo === 'cliente') {
      toast.error('Você não tem acesso a esta funcionalidade');
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

  const getTipoIcon = (tipo) => {
    return tipo === 'agendamento' ? <ScheduleIcon fontSize="small" /> : <TimerIcon fontSize="small" />;
  };

  const getTipoLabel = (tipo) => {
    return tipo === 'agendamento' ? 'Agendamento' : 'Atendimento';
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

  // ============================================
  // FUNÇÕES DE EXPORTAÇÃO E IMPRESSÃO MELHORADAS
  // ============================================

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenRelatorio = () => {
    // Apenas admin, gerente e atendente podem gerar relatórios
    if (cargo === 'profissional' || cargo === 'cliente') {
      toast.error('Você não tem permissão para gerar relatórios');
      return;
    }
    setOpenRelatorioDialog(true);
  };

  const handleCloseRelatorio = () => {
    setOpenRelatorioDialog(false);
  };

  // Função para imprimir a agenda - VERSÃO MELHORADA
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
              @page {
                size: A4;
                margin: 1.5cm;
              }
              body { 
                font-family: 'Arial', sans-serif; 
                margin: 0;
                padding: 15px;
                background: white;
                font-size: 11px;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .MuiPaper-root {
                  box-shadow: none !important;
                  border: 1px solid #ddd !important;
                }
                table {
                  page-break-inside: avoid;
                  border-collapse: collapse;
                  width: 100%;
                }
                tr {
                  page-break-inside: avoid;
                  page-break-after: auto;
                }
                thead {
                  display: table-header-group;
                }
                tfoot {
                  display: table-footer-group;
                }
                .MuiChip-root {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              .stats-grid {
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
                justify-content: center;
                margin-bottom: 15px;
              }
              .stat-item {
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 10px;
                font-weight: 600;
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
      
      // Aguardar carregamento e imprimir
      setTimeout(() => {
        printWindow.print();
        mostrarSnackbar('Impressão concluída!', 'success');
        
        // Registrar na auditoria
        auditoriaService.registrar('imprimir_relatorio_agenda', {
          entidade: 'agendamentos',
          detalhes: 'Impressão de relatório de agenda',
          dados: {
            periodo: periodoRelatorio.tipo,
            profissional: selectedProfessional
          }
        });
      }, 500);
      
    } catch (error) {
      console.error('Erro na impressão:', error);
      mostrarSnackbar('Erro ao imprimir', 'error');
      
      auditoriaService.registrarErro(error, { 
        acao: 'imprimir_relatorio_agenda'
      });
    }
  };

  // Função para exportar PDF - VERSÃO MELHORADA
  const handleExportPDF = async () => {
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
        return (a.horario || a.horaInicio || '').localeCompare(b.horario || b.horaInicio || '');
      });

      // Cabeçalho
      doc.setFontSize(18);
      doc.setTextColor(156, 39, 176);
      doc.text('Relatório de Agenda', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const profissionalNome = selectedProfessional === 'all' ? 'Todos os Profissionais' : 
        profissionais?.find(p => p.id === selectedProfessional)?.nome || 'Profissional';
      doc.text(`Profissional: ${profissionalNome}`, pageWidth / 2, 22, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const dataInicioFormat = new Date(periodoRelatorio.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR');
      const dataFimFormat = periodoRelatorio.tipo === 'dia' ? dataInicioFormat : 
        new Date(periodoRelatorio.dataFim + 'T12:00:00').toLocaleDateString('pt-BR');
      doc.text(`Período: ${dataInicioFormat} - ${dataFimFormat}`, pageWidth / 2, 28, { align: 'center' });
      
      doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 34, { align: 'center' });

      let yPos = 40;

      // Estatísticas
      const totalEventos = eventosFiltrados.length;
      const totalAgendamentos = eventosFiltrados.filter(e => e.tipo === 'agendamento').length;
      const totalAtendimentos = eventosFiltrados.filter(e => e.tipo === 'atendimento').length;
      const totalAndamento = eventosFiltrados.filter(e => e.status === 'em_andamento').length;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumo do Período', 14, yPos);
      yPos += 6;

      const statsData = [
        ['Total de Eventos', totalEventos.toString()],
        ['Agendamentos', totalAgendamentos.toString()],
        ['Atendimentos', totalAtendimentos.toString()],
        ['Em Andamento', totalAndamento.toString()],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Descrição', 'Quantidade']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [156, 39, 176], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 8;

      // Eventos por dia
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Agenda Detalhada', 14, yPos);
      yPos += 6;

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

        doc.setFontSize(10);
        doc.setTextColor(156, 39, 176);
        doc.text(new Date(data + 'T12:00:00').toLocaleDateString('pt-BR'), 14, yPos);
        yPos += 4;

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
          headStyles: { fillColor: [156, 39, 176], fontSize: 7 },
          bodyStyles: { fontSize: 6 },
          margin: { left: 14, right: 14 },
          columnStyles: {
            0: { cellWidth: 18 },
            1: { cellWidth: 35 },
            2: { cellWidth: 40 },
            3: { cellWidth: 25 },
            4: { cellWidth: 15 },
            5: { cellWidth: 20 },
          },
        });

        yPos = doc.lastAutoTable.finalY + 6;
      });

      // Salvar PDF
      const fileName = `agenda_${profissionalNome.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
      // Registrar na auditoria
      await auditoriaService.registrar('exportar_pdf_agenda', {
        entidade: 'agendamentos',
        detalhes: 'Exportação de relatório de agenda em PDF',
        dados: {
          periodo: periodoRelatorio.tipo,
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

  // Função para exportar Excel - VERSÃO MELHORADA
  const handleExportExcel = async () => {
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
        return (a.horario || a.horaInicio || '').localeCompare(b.horario || b.horaInicio || '');
      });

      // Criar workbook
      const wb = XLSX.utils.book_new();

      const profissionalNome = selectedProfessional === 'all' ? 'Todos os Profissionais' : 
        profissionais?.find(p => p.id === selectedProfessional)?.nome || 'Profissional';
      const dataInicioFormat = new Date(periodoRelatorio.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR');
      const dataFimFormat = periodoRelatorio.tipo === 'dia' ? dataInicioFormat : 
        new Date(periodoRelatorio.dataFim + 'T12:00:00').toLocaleDateString('pt-BR');

      // Aba de Informações
      const infoData = [
        ['RELATÓRIO DE AGENDA'],
        [''],
        ['Informações do Relatório'],
        ['Profissional', profissionalNome],
        ['Período', `${dataInicioFormat} - ${dataFimFormat}`],
        ['Data de Emissão', new Date().toLocaleString('pt-BR')],
        ['Total de Eventos', eventosFiltrados.length],
      ];

      const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
      XLSX.utils.book_append_sheet(wb, wsInfo, 'Informações');

      // Aba de Resumo por Status
      const statsPorStatus = {
        'Agendamentos': eventosFiltrados.filter(e => e.tipo === 'agendamento').length,
        'Atendimentos': eventosFiltrados.filter(e => e.tipo === 'atendimento').length,
        'Confirmados': eventosFiltrados.filter(e => e.status === 'confirmado').length,
        'Pendentes': eventosFiltrados.filter(e => e.status === 'pendente').length,
        'Em Andamento': eventosFiltrados.filter(e => e.status === 'em_andamento').length,
        'Cancelados': eventosFiltrados.filter(e => e.status === 'cancelado').length,
        'Finalizados': eventosFiltrados.filter(e => e.status === 'finalizado').length,
      };

      const statsData = [
        ['Resumo por Categoria', 'Quantidade'],
        ...Object.entries(statsPorStatus).map(([cat, qtd]) => [cat, qtd])
      ];

      const wsStats = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, wsStats, 'Resumo');

      // Aba de Agenda Detalhada
      const agendaData = [
        ['Data', 'Horário', 'Cliente', 'Telefone', 'Serviços', 'Profissional', 'Tipo', 'Status', 'Valor', 'Observações'],
        ...eventosFiltrados.map(evento => {
          const cliente = clientes?.find(c => c.id === evento.clienteId || c.uid === evento.clienteId || c.googleUid === evento.clienteId);
          const profissional = profissionais?.find(p => p.id === evento.profissionalId);
          const servicos = evento.servicos || 
            (evento.servicoId ? [{ nome: evento.servicoNome || 'Serviço', preco: evento.preco || 0 }] : []);
          
          return [
            new Date(evento.data + 'T12:00:00').toLocaleDateString('pt-BR'),
            evento.horario || evento.horaInicio || '--:--',
            cliente?.nome || '—',
            cliente?.telefone || '—',
            servicos.map(s => s.nome).join(', '),
            profissional?.nome || '—',
            evento.tipo === 'agendamento' ? 'Agendamento' : 'Atendimento',
            evento.status || '—',
            evento.valorTotal ? `R$ ${evento.valorTotal.toFixed(2)}` : '—',
            evento.observacoes || '—'
          ];
        })
      ];

      const wsAgenda = XLSX.utils.aoa_to_sheet(agendaData);
      XLSX.utils.book_append_sheet(wb, wsAgenda, 'Agenda Detalhada');

      // Salvar arquivo
      const fileName = `agenda_${profissionalNome.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      // Registrar na auditoria
      await auditoriaService.registrar('exportar_excel_agenda', {
        entidade: 'agendamentos',
        detalhes: 'Exportação de relatório de agenda em Excel',
        dados: {
          periodo: periodoRelatorio.tipo,
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorAgendamentos) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{errorAgendamentos}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            {cargo === 'cliente' ? 'Meus Agendamentos' : 'Agenda'}
          </Typography>
          {cargo === 'cliente' && (
            <Typography variant="body2" color="textSecondary">
              Acompanhe seus agendamentos e histórico
            </Typography>
          )}
          {cargo === 'profissional' && (
            <Typography variant="body2" color="textSecondary">
              Sua agenda de atendimentos
            </Typography>
          )}
          {cargo === 'atendente' && (
            <Typography variant="body2" color="textSecondary">
              Gerencie os agendamentos do dia
            </Typography>
          )}
          {(cargo === 'admin' || cargo === 'gerente') && (
            <Typography variant="body2" color="textSecondary">
              Gerencie todos os agendamentos do salão
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handleOpenRelatorio}
            >
              Relatórios
            </Button>
          )}
          
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
          
          {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
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
          )}
        </Box>
      </Box>

      {/* Atendimentos em Andamento - Apenas para admin/gerente/atendente/profissional */}
      {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente' || cargo === 'profissional') && atendimentosEmAndamento.length > 0 && (
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
                const cliente = getClienteData(atendimento.clienteId);
                const profissional = getProfissionalData(atendimento.profissionalId);
                const servicosLista = atendimento.servicos || [];

                return (
                  <Grid item xs={12} md={4} key={atendimento.id}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          src={cliente?.foto}
                          sx={{ 
                            bgcolor: '#ff9800', 
                            mr: 2,
                            width: 48,
                            height: 48
                          }}
                        >
                          {!cliente?.foto && cliente?.nome?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {cliente?.nome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {servicosLista.length} serviço(s)
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
            
            {/* Filtro de Profissional - Visível para admin/gerente/atendente */}
            {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    value={selectedProfessional}
                    label="Profissional"
                    onChange={(e) => setSelectedProfessional(e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    {(profissionais || []).map(prof => (
                      <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Filtro de Status - Visível para todos exceto cliente */}
            {cargo !== 'cliente' && (
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
            )}

            {/* Filtro de Mostrar - Visível para admin/gerente/atendente */}
            {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
              <Grid item xs={12} md={2}>
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
            )}

            <Grid item xs={12} md={cargo === 'cliente' ? 10 : cargo === 'profissional' ? 8 : 4}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Chip 
                  label={`${stats.total} ${cargo === 'cliente' ? 'agendamentos' : 'hoje'}`} 
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
                {viewMode === 'day' && stats.atendimentos > 0 && (cargo !== 'cliente') && (
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
              {cargo === 'cliente' ? 'Meus Agendamentos' : getHeaderText()}
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
                                const cliente = getClienteData(event.clienteId);
                                const profissional = getProfissionalData(event.profissionalId);
                                const servicosLista = event.servicos || [];

                                if (!cliente) return null;

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
                                              <Avatar 
                                                src={cliente.foto}
                                                sx={{ 
                                                  bgcolor: event.tipo === 'atendimento' ? '#ff9800' : '#9c27b0', 
                                                  width: 40, 
                                                  height: 40 
                                                }}
                                              >
                                                {!cliente.foto && cliente.nome?.charAt(0)}
                                              </Avatar>
                                              <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                  {cliente.nome}
                                                </Typography>
                                                {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && cliente.telefone && (
                                                  <Typography variant="caption" color="textSecondary">
                                                    {formatarTelefone(cliente.telefone)}
                                                  </Typography>
                                                )}
                                              </Box>
                                            </Box>
                                          </Grid>

                                          <Grid item xs={12} sm={6} md={2}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                              {servicosLista.length} serviço(s)
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                              {servicosLista.map(s => s.nome).join(', ')}
                                            </Typography>
                                          </Grid>

                                          {cargo !== 'cliente' && (
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
                                          )}

                                          <Grid item xs={12} sm={6} md={cargo === 'cliente' ? 3 : 2}>
                                            <Chip
                                              icon={getStatusIcon(event.status)}
                                              label={getStatusLabel(event.status)}
                                              size="small"
                                              color={getStatusColor(event.status)}
                                              sx={{ fontWeight: 500 }}
                                            />
                                          </Grid>

                                          <Grid item xs={12} md={cargo === 'cliente' ? 4 : 3}>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                              {cargo !== 'cliente' && event.tipo === 'agendamento' && event.status === 'confirmado' && (
                                                <Button
                                                  size="small"
                                                  variant="contained"
                                                  color="success"
                                                  startIcon={<PlayIcon />}
                                                  onClick={() => iniciarAtendimento(event)}
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
                                                  onClick={() => continuarAtendimento(event)}
                                                >
                                                  Continuar
                                                </Button>
                                              )}
                                              
                                              {cargo !== 'cliente' && event.tipo === 'agendamento' && event.status === 'pendente' && (
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
                                              
                                              {cargo !== 'cliente' && event.tipo === 'agendamento' && (
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

                                              {cargo === 'cliente' && (
                                                <Tooltip title="Detalhes do agendamento">
                                                  <IconButton 
                                                    size="small"
                                                    color="info"
                                                    onClick={() => handleDayDetails(event.data, [event])}
                                                  >
                                                    <VisibilityIcon fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
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
                            const cliente = getClienteData(event.clienteId);
                            const servicosLista = event.servicos || [];
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
                                  {event.horario} - {cliente?.nome?.split(' ')[0]} ({servicosLista.length})
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
                              const cliente = getClienteData(event.clienteId);
                              const servicosLista = event.servicos || [];
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
                                    {event.horario} - {cliente?.nome?.split(' ')[0]} ({servicosLista.length})
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
              const cliente = getClienteData(event.clienteId);
              const profissional = getProfissionalData(event.profissionalId);
              const servicosLista = event.servicos || [];

              if (!cliente) return null;

              return (
                <Card key={`${event.tipo}-${event.id}`} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Cliente</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Avatar 
                          src={cliente.foto}
                          sx={{ width: 32, height: 32 }}
                        >
                          {!cliente.foto && cliente.nome?.charAt(0)}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {cliente.nome}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Horário</Typography>
                      <Typography variant="body1">{event.horario}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Serviços</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {servicosLista.map(servico => (
                          <Chip
                            key={servico.id}
                            label={`${servico.nome} - R$ ${servico.preco?.toFixed(2)}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        Total: R$ {event.valorTotal?.toFixed(2)}
                      </Typography>
                    </Grid>
                    {cargo !== 'cliente' && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Profissional</Typography>
                        <Typography variant="body1">{profissional?.nome}</Typography>
                      </Grid>
                    )}
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
                    {cargo !== 'cliente' && event.tipo === 'agendamento' && event.status === 'confirmado' && (
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
                    {cargo !== 'cliente' && event.tipo === 'atendimento' && event.status === 'em_andamento' && (
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
                        if (event.tipo === 'agendamento' && cargo !== 'cliente') {
                          handleEdit(event);
                        }
                      }}
                    >
                      Fechar
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

      {/* Dialog de Agendamento - Apenas para admin/gerente/atendente */}
      {openDialog && (cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <form onSubmit={handleSave}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Campo de Cliente com Pesquisa */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    {!formData.clienteId ? (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                            Selecione o Cliente
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<PersonSearchIcon />}
                            onClick={handleOpenClientSearch}
                            variant="contained"
                            sx={{
                              background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                            }}
                          >
                            Buscar Cliente
                          </Button>
                        </Box>

                        {/* Painel de Pesquisa */}
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
                                  endAdornment: searchClientTerm && (
                                    <InputAdornment position="end">
                                      <IconButton size="small" onClick={() => setSearchClientTerm('')}>
                                        <ClearIcon fontSize="small" />
                                      </IconButton>
                                    </InputAdornment>
                                  )
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

                            {/* Resultados da Busca */}
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
                                        sx={{
                                          borderRadius: 1,
                                          '&:hover': { bgcolor: '#f3e5f5' }
                                        }}
                                      >
                                        <ListItemAvatar>
                                          <Avatar 
                                            src={cliente.foto}
                                            sx={{ bgcolor: '#9c27b0' }}
                                          >
                                            {!cliente.foto && cliente.nome?.charAt(0)}
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
                                                  📞 {formatarTelefone(cliente.telefone)}
                                                </Typography>
                                              )}
                                              {cliente.dataNascimento && (
                                                <Typography variant="caption">
                                                  🎂 {formatarDataBrasil(cliente.dataNascimento)}
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

                            {searchClientTerm && searchClientResults.length === 0 && (
                              <Alert severity="info" sx={{ mt: 2 }}>
                                Nenhum cliente encontrado com os dados informados.
                              </Alert>
                            )}
                          </Card>
                        </Collapse>
                      </Box>
                    ) : (
                      // Cliente Selecionado
                      <Card variant="outlined" sx={{ p: 2, bgcolor: '#f3e5f5' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Avatar 
                            src={getSelectedClientData()?.foto}
                            sx={{ 
                              bgcolor: '#9c27b0', 
                              width: 48, 
                              height: 48 
                            }}
                          >
                            {!getSelectedClientData()?.foto && getSelectedClientData()?.nome?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {getSelectedClientData()?.nome}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              {getSelectedClientData()?.cpf && (
                                <Typography variant="caption">
                                  CPF: {formatarCPF(getSelectedClientData()?.cpf)}
                                </Typography>
                              )}
                              {getSelectedClientData()?.telefone && (
                                <Typography variant="caption">
                                  📞 {formatarTelefone(getSelectedClientData()?.telefone)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Tooltip title="Trocar cliente">
                            <IconButton onClick={handleClearClient} color="primary">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Card>
                    )}
                  </Box>
                </Grid>

                {/* Seção de Serviços Múltiplos */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
                    Serviços do Agendamento
                  </Typography>

                  {/* Lista de Serviços Selecionados */}
                  {servicosSelecionados.length > 0 && (
                    <Card variant="outlined" sx={{ mb: 2, p: 2, bgcolor: '#faf5ff' }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Serviço</TableCell>
                              <TableCell align="right">Preço</TableCell>
                              <TableCell align="right">Duração</TableCell>
                              <TableCell align="center">Ações</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {servicosSelecionados.map((servico) => (
                              <TableRow key={servico.id}>
                                <TableCell>{servico.nome}</TableCell>
                                <TableCell align="right">R$ {servico.preco?.toFixed(2)}</TableCell>
                                <TableCell align="right">{servico.duracao} min</TableCell>
                                <TableCell align="center">
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
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={3} align="right">
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  Total:
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                                  R$ {formData.valorTotal?.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </TableContainer>
                    </Card>
                  )}

                  {/* Adicionar Novo Serviço com Autocomplete */}
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
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
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Profissional"
                            size="small"
                            placeholder="Digite para buscar..."
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box>
                              <Typography variant="body2">{option.nome}</Typography>
                              {option.especialidade && (
                                <Typography variant="caption" color="textSecondary">
                                  {option.especialidade}
                                </Typography>
                              )}
                            </Box>
                          </li>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={5}>
                      <Autocomplete
                        options={servicosFiltrados}
                        getOptionLabel={(option) => `${option.nome} - R$ ${option.preco?.toFixed(2)}`}
                        value={servicos?.find(s => s.id === servicoAtual) || null}
                        onChange={(e, newValue) => setServicoAtual(newValue?.id || '')}
                        inputValue={buscaServico}
                        onInputChange={(e, newValue) => setBuscaServico(newValue)}
                        disabled={!formData.profissionalId}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Serviço"
                            size="small"
                            placeholder="Digite para buscar..."
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box>
                              <Typography variant="body2">{option.nome}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                R$ {option.preco?.toFixed(2)} • {option.duracao} min
                              </Typography>
                            </Box>
                          </li>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AddCircleIcon />}
                        onClick={adicionarServico}
                        disabled={!servicoAtual}
                        sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                      >
                        Adicionar
                      </Button>
                    </Grid>
                  </Grid>

                  {servicosSelecionados.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={limparServicos}
                      >
                        Limpar todos
                      </Button>
                    </Box>
                  )}
                </Grid>

                {/* Data e Hora */}
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
                      <MenuItem value="">Selecione um horário</MenuItem>
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
                      <MenuItem value="em_andamento">Em andamento</MenuItem>   
                      <MenuItem value="finalizado">Finalizado</MenuItem>  
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
      )}

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

      {/* Dialog de Relatórios - Apenas para admin/gerente/atendente */}
      {openRelatorioDialog && (cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
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
                  <Grid item xs={12} md={6}>
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
          configuracoes={configuracoes}
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

export default ModernAgendamentos;
