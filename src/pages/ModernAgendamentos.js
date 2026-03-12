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
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, parse, startOfDay, endOfDay, addDays, addWeeks, addMonths, getDay, getDate, getMonth, getYear } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../hooks/useFirebase';
import { firebaseService } from '../services/firebase';
import { notificacoesService } from '../services/notificacoesService';
import { Timestamp } from 'firebase/firestore';

// ============================================
// FUNÇÕES AUXILIARES COM HORÁRIO DE BRASÍLIA
// ============================================

// Obter data atual no horário de Brasília
const getDataBrasilia = () => {
  const now = new Date();
  // Converter para UTC-3 (Brasília)
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return brasiliaTime;
};

// Formatar data para YYYY-MM-DD (para o Firestore)
const formatarDataBrasilia = (date) => {
  if (!date) return '';
  // Garantir que a data está no horário de Brasília
  const brasiliaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return format(brasiliaDate, 'yyyy-MM-dd');
};

// Formatar data para exibição (DD/MM/YYYY)
const formatarDataExibicao = (date) => {
  if (!date) return '';
  const brasiliaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return format(brasiliaDate, 'dd/MM/yyyy');
};

// Obter hora atual no formato HH:MM
const getHoraBrasilia = () => {
  const now = getDataBrasilia();
  return format(now, 'HH:mm');
};

// Converter string YYYY-MM-DD para Date no horário de Brasília
const parseDataBrasilia = (dateStr) => {
  if (!dateStr) return null;
  // Criar data ao meio-dia para evitar problemas de fuso
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
};

// Dias da semana
const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// Slots de horário
const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

// Obter dias do mês
const getDaysInMonth = (date) => {
  const year = getYear(date);
  const month = getMonth(date);
  return new Date(year, month + 1, 0).getDate();
};

// Obter primeiro dia do mês
const getFirstDayOfMonth = (date) => {
  const year = getYear(date);
  const month = getMonth(date);
  const firstDay = new Date(year, month, 1).getDay();
  // Ajustar para começar na segunda (0 = domingo, 1 = segunda...)
  return firstDay === 0 ? 6 : firstDay - 1;
};

// Obter dias da semana atual
const getWeekDays = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1);
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
};

function ModernAgendamentos() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('day');
  
  // Data atual em Brasília
  const [currentDate, setCurrentDate] = useState(getDataBrasilia());
  const [selectedDate, setSelectedDate] = useState(formatarDataBrasilia(getDataBrasilia()));
  
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [openDayDialog, setOpenDayDialog] = useState(false);
  const [showAtendimentos, setShowAtendimentos] = useState(true);
  const [usuario, setUsuario] = useState(null);

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

  // Hooks do Firebase
  const { data: agendamentos, loading: loadingAgendamentos, error: errorAgendamentos, adicionar, atualizar, excluir } = useFirebase('agendamentos');
  const { data: atendimentos, loading: loadingAtendimentos } = useFirebase('atendimentos');
  const { data: clientes, loading: loadingClientes } = useFirebase('clientes');
  const { data: profissionais, loading: loadingProfissionais } = useFirebase('profissionais');
  const { data: servicos, loading: loadingServicos } = useFirebase('servicos');

  const loading = loadingAgendamentos || loadingAtendimentos || loadingClientes || loadingProfissionais || loadingServicos;

  useEffect(() => {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUsuario(user);
    }
  }, []);

  // Combinar agendamentos e atendimentos
  const todosEventos = [
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
  ];

  // Estado do formulário
  const [formData, setFormData] = useState({
    clienteId: '',
    profissionalId: '',
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
  }, [formData.profissionalId, servicos, profissionais]);

  useEffect(() => {
    if (servicoAtual && profissionais) {
      const servico = servicos?.find(s => s.id === servicoAtual);
      
      if (servico && servico.profissionaisIds) {
        const profissionaisDoServico = profissionais.filter(p => 
          servico.profissionaisIds.includes(p.id) && p.ativo !== false
        );
        setProfissionaisDisponiveis(profissionaisDoServico);
      }
    } else {
      setProfissionaisDisponiveis([]);
    }
  }, [servicoAtual, profissionais, servicos]);

  // ============================================
  // FUNÇÕES PARA GERENCIAR MÚLTIPLOS SERVIÇOS
  // ============================================

  const adicionarServico = () => {
    if (!servicoAtual) {
      toast.error('Selecione um serviço');
      return;
    }

    const servico = servicos?.find(s => s.id === servicoAtual);
    if (!servico) return;

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
    
    const novoTotal = [...servicosSelecionados, novoServico].reduce((acc, s) => acc + (s.preco || 0), 0);
    setFormData({ ...formData, valorTotal: novoTotal, servicos: [...servicosSelecionados, novoServico] });
  };

  const removerServico = (id) => {
    const novosServicos = servicosSelecionados.filter(s => s.id !== id);
    setServicosSelecionados(novosServicos);
    
    const novoTotal = novosServicos.reduce((acc, s) => acc + (s.preco || 0), 0);
    setFormData({ ...formData, valorTotal: novoTotal, servicos: novosServicos });
  };

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
          profissionalId: selectedAppointment.profissionalId || '',
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
          profissionalId: '',
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
      }
    }
  }, [openDialog, selectedAppointment, selectedDate]);

  // ============================================
  // FUNÇÕES DE PESQUISA DE CLIENTES
  // ============================================

  const formatarCPF = (cpf) => {
    if (!cpf) return '';
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const removerMascaraCPF = (cpf) => {
    return cpf ? cpf.replace(/\D/g, '') : '';
  };

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
        const dataBusca = formatarDataBrasilia(dataNascimentoInput);
        resultados = clientes.filter(cliente => {
          const dataCliente = cliente.dataNascimento ? 
            formatarDataBrasilia(new Date(cliente.dataNascimento)) : '';
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
  }, [searchClientTerm, cpfInput, dataNascimentoInput, searchClientType, clientes, showClientSearch]);

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
    if (!formData.clienteId) return null;
    return (clientes || []).find(c => c.id === formData.clienteId);
  };

  // Filtrar eventos
  const filteredEvents = todosEventos.filter(event => {
    const professionalMatch = selectedProfessional === 'all' || event.profissionalId === selectedProfessional;
    const statusMatch = selectedStatus === 'all' || event.status === selectedStatus;
    const tipoMatch = showAtendimentos ? true : event.tipo === 'agendamento';
    return professionalMatch && statusMatch && tipoMatch;
  });

  const dayEvents = filteredEvents.filter(event => event.data === selectedDate);
  const atendimentosEmAndamento = (atendimentos || []).filter(att => att.status === 'em_andamento');

  const weekDays_list = getWeekDays(currentDate);
  const weekEvents = weekDays_list.map(day => ({
    date: formatarDataBrasilia(day),
    dayName: weekDays[day.getDay() === 0 ? 6 : day.getDay() - 1],
    events: filteredEvents.filter(event => event.data === formatarDataBrasilia(day))
  }));

  const monthDays = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthMatrix = [];
  let dayCounter = 1;

  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        week.push(null);
      } else if (dayCounter <= monthDays) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayCounter);
        const dateStr = formatarDataBrasilia(date);
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
      const currentDateObj = parseDataBrasilia(selectedDate);
      const newDate = addDays(currentDateObj, -1);
      setSelectedDate(formatarDataBrasilia(newDate));
      setCurrentDate(newDate);
    } else if (viewMode === 'week') {
      const newDate = addWeeks(currentDate, -1);
      setCurrentDate(newDate);
      setSelectedDate(formatarDataBrasilia(newDate));
    } else {
      const newDate = addMonths(currentDate, -1);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      const currentDateObj = parseDataBrasilia(selectedDate);
      const newDate = addDays(currentDateObj, 1);
      setSelectedDate(formatarDataBrasilia(newDate));
      setCurrentDate(newDate);
    } else if (viewMode === 'week') {
      const newDate = addWeeks(currentDate, 1);
      setCurrentDate(newDate);
      setSelectedDate(formatarDataBrasilia(newDate));
    } else {
      const newDate = addMonths(currentDate, 1);
      setCurrentDate(newDate);
    }
  };

  const handleToday = () => {
    const today = getDataBrasilia();
    setCurrentDate(today);
    setSelectedDate(formatarDataBrasilia(today));
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
      await excluir(appointmentToDelete);
      toast.success('Agendamento cancelado com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao cancelar agendamento');
    }
    setOpenDeleteDialog(false);
    setAppointmentToDelete(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await atualizar(id, { status: newStatus });
      toast.success(`Status alterado para ${getStatusLabel(newStatus)}!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
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
        servicoId: servicosSelecionados[0]?.id,
        servicos: servicosSelecionados,
        data: formData.data,
        horario: formData.horario,
        observacoes: formData.observacoes || '',
        status: formData.status || 'pendente',
        valorTotal: formData.valorTotal,
        origem: 'sistema'
      };

      let agendamentoCriado;

      if (selectedAppointment) {
        await atualizar(selectedAppointment.id, dadosParaSalvar);
        agendamentoCriado = { ...dadosParaSalvar, id: selectedAppointment.id };
        toast.success('Agendamento atualizado!');
      } else {
        agendamentoCriado = await adicionar(dadosParaSalvar);
        toast.success('Agendamento criado!');
      }

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
    }
  };

  const iniciarAtendimento = async (agendamento) => {
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

      // Hora atual em Brasília
      const horaAtual = getHoraBrasilia();

      const novoAtendimento = {
        agendamentoId: agendamento.id,
        clienteId: agendamento.clienteId,
        profissionalId: agendamento.profissionalId,
        servicoId: primeiroServico.id,
        servicos: servicosLista,
        data: agendamento.data,
        horaInicio: horaAtual,
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
        updatedAt: Timestamp.now()
      };

      const atendimentoCriado = await firebaseService.add('atendimentos', novoAtendimento);
      
      await atualizar(agendamento.id, { 
        status: 'em_andamento',
        updatedAt: Timestamp.now()
      });

      toast.dismiss(toastId);
      toast.success('Atendimento iniciado com sucesso!');
      
      navigate(`/atendimento/${atendimentoCriado.id}`);
      
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      toast.error('Erro ao iniciar atendimento');
    }
  };

  const continuarAtendimento = (atendimento) => {
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
      const dateObj = parseDataBrasilia(selectedDate);
      return dateObj ? format(dateObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '';
    } else if (viewMode === 'week') {
      const start = weekDays_list[0];
      const end = weekDays_list[6];
      return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`;
    } else {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
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
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
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

      {/* Atendimentos em Andamento */}
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
                const cliente = (clientes || []).find(c => c.id === atendimento.clienteId);
                const profissional = (profissionais || []).find(p => p.id === atendimento.profissionalId);
                const servicosLista = atendimento.servicos || [];

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
                <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', fontWeight: 500, textTransform: 'capitalize' }}>
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
                  {(profissionais || []).map(prof => (
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
                                const cliente = (clientes || []).find(c => c.id === event.clienteId);
                                const profissional = (profissionais || []).find(p => p.id === event.profissionalId);
                                const servicosLista = event.servicos || [];

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
                                              {servicosLista.length} serviço(s)
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                              {servicosLista.map(s => s.nome).join(', ')}
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
                                                  onClick={() => iniciarAtendimento(event)}
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
                        {parseDataBrasilia(day.date)?.getDate()}
                      </Typography>
                      
                      {day.events.length > 0 ? (
                        <Box>
                          {day.events.slice(0, 3).map(event => {
                            const cliente = (clientes || []).find(c => c.id === event.clienteId);
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
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
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
                              const cliente = (clientes || []).find(c => c.id === event.clienteId);
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
            format(parseDataBrasilia(selectedDayDetails.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
          }
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedDayDetails?.events.map(event => {
              const cliente = (clientes || []).find(c => c.id === event.clienteId);
              const profissional = (profissionais || []).find(p => p.id === event.profissionalId);
              const servicosLista = event.servicos || [];

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
                                            {cliente.dataNascimento && (
                                              <Typography variant="caption">
                                                🎂 {format(parseDataBrasilia(cliente.dataNascimento), 'dd/MM/yyyy')}
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
                        <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                          {getSelectedClientData()?.nome?.charAt(0)}
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
                                📞 {getSelectedClientData()?.telefone}
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

                {/* Adicionar Novo Serviço */}
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Profissional</InputLabel>
                      <Select
                        value={formData.profissionalId}
                        label="Profissional"
                        onChange={(e) => {
                          setFormData({ ...formData, profissionalId: e.target.value });
                          setProfissionalSelecionado(e.target.value);
                        }}
                      >
                        <MenuItem value="">Selecione um profissional</MenuItem>
                        {(profissionais || []).map(prof => (
                          <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <FormControl fullWidth size="small" disabled={!formData.profissionalId}>
                      <InputLabel>Serviço</InputLabel>
                      <Select
                        value={servicoAtual}
                        label="Serviço"
                        onChange={(e) => setServicoAtual(e.target.value)}
                      >
                        <MenuItem value="">Selecione um serviço</MenuItem>
                        {servicosDisponiveis.map(servico => (
                          <MenuItem key={servico.id} value={servico.id}>
                            {servico.nome} - R$ {servico.preco?.toFixed(2)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
