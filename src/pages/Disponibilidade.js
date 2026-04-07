// src/pages/Disponibilidade.js
// 🔥 VERSÃO CONVERTIDA PARA SUPABASE

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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Switch,
  FormControlLabel,
  Autocomplete,
  Badge,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  Slider,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  alpha,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fade,
  Grow,
  Zoom,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  DateRange as DateRangeIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Block as BlockIcon,
  Event as EventIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon,
  Today as TodayIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewModuleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
  CopyAll as CopyAllIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabaseService } from '../services/supabase';
import { auditoriaService } from '../services/auditoriaService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  parseISO,
  addWeeks,
  subWeeks,
  subMonths,
  addMonths,
  getWeek,
  getYear,
  setHours,
  setMinutes,
  isAfter,
  isBefore,
} from 'date-fns';
import { pt } from 'date-fns/locale';

// Importar ícones adicionais
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const diasSemana = [
  { value: 0, label: 'Domingo', abreviado: 'DOM', cor: '#f44336' },
  { value: 1, label: 'Segunda', abreviado: 'SEG', cor: '#4caf50' },
  { value: 2, label: 'Terça', abreviado: 'TER', cor: '#4caf50' },
  { value: 3, label: 'Quarta', abreviado: 'QUA', cor: '#4caf50' },
  { value: 4, label: 'Quinta', abreviado: 'QUI', cor: '#4caf50' },
  { value: 5, label: 'Sexta', abreviado: 'SEX', cor: '#4caf50' },
  { value: 6, label: 'Sábado', abreviado: 'SAB', cor: '#ff9800' },
];

const tiposAusencia = [
  { value: 'folga', label: 'Folga', color: '#4caf50', icon: <EventBusyIcon /> },
  { value: 'ferias', label: 'Férias', color: '#2196f3', icon: <BeachAccessIcon /> },
  { value: 'licenca', label: 'Licença', color: '#ff9800', icon: <MedicalServicesIcon /> },
  { value: 'falta', label: 'Falta', color: '#f44336', icon: <WarningIcon /> },
  { value: 'treinamento', label: 'Treinamento', color: '#9c27b0', icon: <SchoolIcon /> },
  { value: 'evento', label: 'Evento', color: '#00bcd4', icon: <EmojiEventsIcon /> },
];

const periodosRepeticao = [
  { value: 'nao', label: 'Não repetir' },
  { value: 'diario', label: 'Diariamente' },
  { value: 'semanal', label: 'Semanalmente' },
  { value: 'quinzenal', label: 'Quinzenalmente' },
  { value: 'mensal', label: 'Mensalmente' },
];

const horariosSugeridos = [
  { label: 'Manhã (08:00 - 12:00)', inicio: '08:00', fim: '12:00', intervalo: false },
  { label: 'Tarde (13:00 - 18:00)', inicio: '13:00', fim: '18:00', intervalo: false },
  { label: 'Integral (08:00 - 18:00)', inicio: '08:00', fim: '18:00', intervalo: true, intervaloInicio: '12:00', intervaloFim: '13:00' },
  { label: 'Meio Período Manhã', inicio: '08:00', fim: '12:00', intervalo: false },
  { label: 'Meio Período Tarde', inicio: '13:00', fim: '18:00', intervalo: false },
  { label: 'Plantão (08:00 - 20:00)', inicio: '08:00', fim: '20:00', intervalo: true, intervaloInicio: '12:00', intervaloFim: '13:00' },
];

function Disponibilidade() {
  const [loading, setLoading] = useState(true);
  const [profissionais, setProfissionais] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [ausencias, setAusencias] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [dataReferencia, setDataReferencia] = useState(new Date());
  const [profissionalSelecionado, setProfissionalSelecionado] = useState('todos');
  const [visao, setVisao] = useState('semana');
  const [openDialog, setOpenDialog] = useState(false);
  const [openAusenciaDialog, setOpenAusenciaDialog] = useState(false);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [disponibilidadeEditando, setDisponibilidadeEditando] = useState(null);
  const [ausenciaEditando, setAusenciaEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [horarios, setHorarios] = useState([]);
  const [modoSelecao, setModoSelecao] = useState('simples');
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [expandedProfissional, setExpandedProfissional] = useState(null);
  const [modoEdicaoRapida, setModoEdicaoRapida] = useState(false);

  // Estado do formulário de disponibilidade
  const [formData, setFormData] = useState({
    profissional_id: '',
    dias_semana: [1],
    horario_inicio: '09:00',
    horario_fim: '18:00',
    intervalo_inicio: '12:00',
    intervalo_fim: '13:00',
    usarIntervalo: true,
    ativo: true,
    observacoes: '',
  });

  // Estado do formulário de ausência
  const [ausenciaForm, setAusenciaForm] = useState({
    profissional_id: '',
    tipo: 'folga',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
    horario_inicio: '00:00',
    horario_fim: '23:59',
    repetir: 'nao',
    observacoes: '',
  });

  // 🔥 FUNÇÃO DE LOG
  const registrarLog = async (nivel, mensagem, dados = {}) => {
    try {
      await supabaseService.log(nivel, mensagem, {
        ...dados,
        modulo: 'disponibilidade'
      });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  };

  useEffect(() => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        setUsuario(JSON.parse(usuarioStr));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  }, []);

  const registrarAuditoria = async (acao, entidadeId, detalhes, dados = {}) => {
    try {
      await auditoriaService.registrar(acao, {
        entidade: 'disponibilidade',
        entidadeId,
        detalhes,
        dados: {
          ...dados,
          usuarioId: usuario?.id,
          usuarioNome: usuario?.nome,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      await registrarLog('info', 'Carregando dados de disponibilidade');
      
      const [profissionaisData, disponibilidadesData, ausenciasData, agendamentosData] = await Promise.all([
        supabaseService.getAll('profissionais').catch(() => []),
        supabaseService.getAll('disponibilidades').catch(() => []),
        supabaseService.getAll('ausencias').catch(() => []),
        supabaseService.query('agendamentos', [
          { field: 'status', operator: '!=', value: 'cancelado' }
        ]).catch(() => [])
      ]);

      setProfissionais(profissionaisData || []);
      setDisponibilidades(disponibilidadesData || []);
      setAusencias(ausenciasData || []);
      setAgendamentos(agendamentosData || []);
      
      await registrarAuditoria(
        'carregar_disponibilidade',
        'listagem',
        'Página de disponibilidade carregada',
        { 
          totalProfissionais: profissionaisData?.length,
          totalDisponibilidades: disponibilidadesData?.length,
          totalAusencias: ausenciasData?.length
        }
      );
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      await registrarLog('error', 'Erro ao carregar dados de disponibilidade', {
        error: error.message
      });
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

  const handleRefresh = async () => {
    await registrarLog('info', 'Atualização manual da página de disponibilidade');
    await carregarDados();
  };

  const handleOpenDialog = (disponibilidade = null) => {
    if (disponibilidade) {
      setDisponibilidadeEditando(disponibilidade);
      setFormData({
        profissional_id: disponibilidade.profissional_id || disponibilidade.profissionalId,
        dias_semana: disponibilidade.dias_semana || [disponibilidade.dia_semana || 1],
        horario_inicio: disponibilidade.horario_inicio || disponibilidade.horarioInicio || '09:00',
        horario_fim: disponibilidade.horario_fim || disponibilidade.horarioFim || '18:00',
        intervalo_inicio: disponibilidade.intervalo_inicio || disponibilidade.intervaloInicio || '12:00',
        intervalo_fim: disponibilidade.intervalo_fim || disponibilidade.intervaloFim || '13:00',
        usarIntervalo: !!(disponibilidade.intervalo_inicio || disponibilidade.intervaloInicio),
        ativo: disponibilidade.ativo !== false,
        observacoes: disponibilidade.observacoes || '',
      });
    } else {
      setDisponibilidadeEditando(null);
      setFormData({
        profissional_id: profissionalSelecionado !== 'todos' ? profissionalSelecionado : '',
        dias_semana: [1],
        horario_inicio: '09:00',
        horario_fim: '18:00',
        intervalo_inicio: '12:00',
        intervalo_fim: '13:00',
        usarIntervalo: true,
        ativo: true,
        observacoes: '',
      });
    }
    setDiasSelecionados([]);
    setOpenDialog(true);
  };

  const handleOpenAusenciaDialog = (ausencia = null) => {
    if (ausencia) {
      setAusenciaEditando(ausencia);
      setAusenciaForm({
        profissional_id: ausencia.profissional_id || ausencia.profissionalId,
        tipo: ausencia.tipo || 'folga',
        data_inicio: ausencia.data_inicio || ausencia.dataInicio || new Date().toISOString().split('T')[0],
        data_fim: ausencia.data_fim || ausencia.dataFim || new Date().toISOString().split('T')[0],
        horario_inicio: ausencia.horario_inicio || ausencia.horarioInicio || '00:00',
        horario_fim: ausencia.horario_fim || ausencia.horarioFim || '23:59',
        repetir: ausencia.repetir || 'nao',
        observacoes: ausencia.observacoes || '',
      });
    } else {
      setAusenciaEditando(null);
      setAusenciaForm({
        profissional_id: profissionalSelecionado !== 'todos' ? profissionalSelecionado : '',
        tipo: 'folga',
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: new Date().toISOString().split('T')[0],
        horario_inicio: '00:00',
        horario_fim: '23:59',
        repetir: 'nao',
        observacoes: '',
      });
    }
    setOpenAusenciaDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDisponibilidadeEditando(null);
    setDiasSelecionados([]);
  };

  const handleCloseAusenciaDialog = () => {
    setOpenAusenciaDialog(false);
    setAusenciaEditando(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDiasSemanaChange = (dias) => {
    setFormData(prev => ({
      ...prev,
      dias_semana: dias
    }));
  };

  const handleAusenciaInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAusenciaForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const aplicarModeloHorario = (modelo) => {
    setFormData(prev => ({
      ...prev,
      horario_inicio: modelo.inicio,
      horario_fim: modelo.fim,
      usarIntervalo: modelo.intervalo || false,
      intervalo_inicio: modelo.intervaloInicio || '12:00',
      intervalo_fim: modelo.intervaloFim || '13:00',
    }));
  };

  const handleSalvarDisponibilidade = async () => {
    try {
      if (!formData.profissional_id) {
        mostrarSnackbar('Selecione um profissional', 'error');
        return;
      }

      if (formData.dias_semana.length === 0) {
        mostrarSnackbar('Selecione pelo menos um dia da semana', 'error');
        return;
      }

      await registrarLog('info', 'Salvando configuração de disponibilidade');

      const promises = formData.dias_semana.map(async (diaSemana) => {
        const disponibilidadeExistente = disponibilidades.find(
          d => (d.profissional_id || d.profissionalId) === formData.profissional_id && 
               (d.dia_semana || d.diaSemana) === diaSemana &&
               (!disponibilidadeEditando || d.id === disponibilidadeEditando.id)
        );

        const dadosParaSalvar = {
          profissional_id: formData.profissional_id,
          dia_semana: diaSemana,
          horario_inicio: formData.horario_inicio,
          horario_fim: formData.horario_fim,
          intervalo_inicio: formData.usarIntervalo ? formData.intervalo_inicio : null,
          intervalo_fim: formData.usarIntervalo ? formData.intervalo_fim : null,
          ativo: formData.ativo,
          observacoes: formData.observacoes,
          updated_at: new Date().toISOString(),
        };

        if (disponibilidadeExistente && !disponibilidadeEditando) {
          await supabaseService.update('disponibilidades', disponibilidadeExistente.id, dadosParaSalvar);
          await registrarAuditoria(
            'atualizar_disponibilidade',
            disponibilidadeExistente.id,
            `Disponibilidade atualizada para ${diasSemana.find(d => d.value === diaSemana)?.label}`,
            { profissional_id: formData.profissional_id, dia_semana: diaSemana }
          );
          return disponibilidadeExistente.id;
        } else if (disponibilidadeEditando && (disponibilidadeEditando.dia_semana || disponibilidadeEditando.diaSemana) === diaSemana) {
          await supabaseService.update('disponibilidades', disponibilidadeEditando.id, dadosParaSalvar);
          await registrarAuditoria(
            'atualizar_disponibilidade',
            disponibilidadeEditando.id,
            `Disponibilidade atualizada para ${diasSemana.find(d => d.value === diaSemana)?.label}`,
            { profissional_id: formData.profissional_id, dia_semana: diaSemana }
          );
          return disponibilidadeEditando.id;
        } else {
          const nova = await supabaseService.add('disponibilidades', {
            ...dadosParaSalvar,
            created_at: new Date().toISOString(),
          });
          await registrarAuditoria(
            'criar_disponibilidade',
            nova.id,
            `Nova disponibilidade criada para ${diasSemana.find(d => d.value === diaSemana)?.label}`,
            { profissional_id: formData.profissional_id, dia_semana: diaSemana }
          );
          return nova.id;
        }
      });

      await Promise.all(promises);

      if (disponibilidadeEditando && !formData.dias_semana.includes(disponibilidadeEditando.dia_semana || disponibilidadeEditando.diaSemana)) {
        await supabaseService.delete('disponibilidades', disponibilidadeEditando.id);
        await registrarAuditoria(
          'remover_disponibilidade',
          disponibilidadeEditando.id,
          `Disponibilidade removida`,
          { profissional_id: formData.profissional_id }
        );
      }

      await registrarLog('success', 'Disponibilidade salva com sucesso');

      mostrarSnackbar('Disponibilidade(s) salva(s) com sucesso!');
      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar disponibilidade:', error);
      await registrarLog('error', 'Erro ao salvar disponibilidade', {
        error: error.message
      });
      mostrarSnackbar(error.message || 'Erro ao salvar disponibilidade', 'error');
    }
  };

  const handleRemoverDisponibilidade = async (id, disponibilidade) => {
    if (window.confirm(`Deseja remover a disponibilidade de ${diasSemana.find(d => d.value === (disponibilidade.dia_semana || disponibilidade.diaSemana))?.label}?`)) {
      try {
        await registrarLog('warning', 'Removendo disponibilidade', { disponibilidadeId: id });
        await supabaseService.delete('disponibilidades', id);
        await registrarAuditoria(
          'remover_disponibilidade',
          id,
          `Disponibilidade removida`,
          { profissional_id: disponibilidade.profissional_id || disponibilidade.profissionalId, dia_semana: disponibilidade.dia_semana || disponibilidade.diaSemana }
        );
        mostrarSnackbar('Disponibilidade removida com sucesso!');
        carregarDados();
      } catch (error) {
        console.error('Erro ao remover disponibilidade:', error);
        mostrarSnackbar('Erro ao remover disponibilidade', 'error');
      }
    }
  };

  const handleSalvarAusencia = async () => {
    try {
      if (!ausenciaForm.profissional_id) {
        mostrarSnackbar('Selecione um profissional', 'error');
        return;
      }

      await registrarLog('info', 'Salvando ausência de profissional');

      const dadosParaSalvar = {
        profissional_id: ausenciaForm.profissional_id,
        tipo: ausenciaForm.tipo,
        data_inicio: ausenciaForm.data_inicio,
        data_fim: ausenciaForm.data_fim,
        horario_inicio: ausenciaForm.horario_inicio,
        horario_fim: ausenciaForm.horario_fim,
        repetir: ausenciaForm.repetir,
        observacoes: ausenciaForm.observacoes,
        updated_at: new Date().toISOString(),
      };

      if (ausenciaEditando) {
        await supabaseService.update('ausencias', ausenciaEditando.id, dadosParaSalvar);
        await registrarAuditoria(
          'atualizar_ausencia',
          ausenciaEditando.id,
          `Ausência atualizada para ${ausenciaForm.tipo}`,
          { profissional_id: ausenciaForm.profissional_id, tipo: ausenciaForm.tipo }
        );
        mostrarSnackbar('Ausência atualizada com sucesso!');
      } else {
        const novaAusencia = await supabaseService.add('ausencias', {
          ...dadosParaSalvar,
          created_at: new Date().toISOString(),
        });
        await registrarAuditoria(
          'criar_ausencia',
          novaAusencia.id,
          `Nova ausência criada: ${ausenciaForm.tipo}`,
          { profissional_id: ausenciaForm.profissional_id, tipo: ausenciaForm.tipo }
        );
        mostrarSnackbar('Ausência cadastrada com sucesso!');
      }

      await registrarLog('success', 'Ausência salva com sucesso');

      handleCloseAusenciaDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar ausência:', error);
      await registrarLog('error', 'Erro ao salvar ausência', {
        error: error.message
      });
      mostrarSnackbar(error.message || 'Erro ao salvar ausência', 'error');
    }
  };

  const handleRemoverAusencia = async (id, ausencia) => {
    if (window.confirm('Deseja realmente remover esta ausência?')) {
      try {
        await registrarLog('warning', 'Removendo ausência', { ausenciaId: id });
        await supabaseService.delete('ausencias', id);
        await registrarAuditoria(
          'remover_ausencia',
          id,
          `Ausência removida`,
          { profissional_id: ausencia.profissional_id || ausencia.profissionalId, tipo: ausencia.tipo }
        );
        mostrarSnackbar('Ausência removida com sucesso!');
        carregarDados();
      } catch (error) {
        console.error('Erro ao remover ausência:', error);
        mostrarSnackbar('Erro ao remover ausência', 'error');
      }
    }
  };

  const handleCopiarDisponibilidade = async (profissionalOrigemId, profissionalDestinoId) => {
    if (!profissionalDestinoId) {
      mostrarSnackbar('Selecione um profissional destino', 'error');
      return;
    }

    try {
      const disponibilidadesOrigem = disponibilidades.filter(d => (d.profissional_id || d.profissionalId) === profissionalOrigemId);
      
      for (const disp of disponibilidadesOrigem) {
        const novaDisponibilidade = {
          profissional_id: profissionalDestinoId,
          dia_semana: disp.dia_semana || disp.diaSemana,
          horario_inicio: disp.horario_inicio || disp.horarioInicio,
          horario_fim: disp.horario_fim || disp.horarioFim,
          intervalo_inicio: disp.intervalo_inicio || disp.intervaloInicio,
          intervalo_fim: disp.intervalo_fim || disp.intervaloFim,
          ativo: disp.ativo,
          observacoes: `Copiado de ${profissionais.find(p => p.id === profissionalOrigemId)?.nome}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        await supabaseService.add('disponibilidades', novaDisponibilidade);
      }
      
      await registrarAuditoria(
        'copiar_disponibilidade',
        profissionalDestinoId,
        `Disponibilidade copiada de ${profissionais.find(p => p.id === profissionalOrigemId)?.nome}`,
        { profissionalOrigemId, profissionalDestinoId }
      );
      
      mostrarSnackbar('Disponibilidade copiada com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao copiar disponibilidade:', error);
      mostrarSnackbar('Erro ao copiar disponibilidade', 'error');
    }
  };

  const handleMudarVisao = (event, novaVisao) => {
    if (novaVisao !== null) {
      setVisao(novaVisao);
      registrarLog('debug', 'Mudança de visualização', { novaVisao });
    }
  };

  const handleNavegar = (direcao) => {
    if (direcao === 'anterior') {
      if (visao === 'dia') setDataReferencia(subDays(dataReferencia, 1));
      if (visao === 'semana') setDataReferencia(subWeeks(dataReferencia, 1));
      if (visao === 'mes') setDataReferencia(subMonths(dataReferencia, 1));
    } else {
      if (visao === 'dia') setDataReferencia(addDays(dataReferencia, 1));
      if (visao === 'semana') setDataReferencia(addWeeks(dataReferencia, 1));
      if (visao === 'mes') setDataReferencia(addMonths(dataReferencia, 1));
    }
  };

  const handleHoje = () => {
    setDataReferencia(new Date());
  };

  const verificarDisponivel = (profissionalId, data, hora) => {
    const diaSemana = data.getDay();
    const disponibilidade = disponibilidades.find(
      d => (d.profissional_id || d.profissionalId) === profissionalId && 
           (d.dia_semana || d.diaSemana) === diaSemana && 
           d.ativo
    );

    if (!disponibilidade) return false;

    const horarioInicio = disponibilidade.horario_inicio || disponibilidade.horarioInicio;
    const horarioFim = disponibilidade.horario_fim || disponibilidade.horarioFim;
    const intervaloInicio = disponibilidade.intervalo_inicio || disponibilidade.intervaloInicio;
    const intervaloFim = disponibilidade.intervalo_fim || disponibilidade.intervaloFim;

    const [horaInicio, minInicio] = horarioInicio.split(':').map(Number);
    const [horaFim, minFim] = horarioFim.split(':').map(Number);
    const [horaAtual, minAtual] = hora.split(':').map(Number);
    
    const minutosInicio = horaInicio * 60 + minInicio;
    const minutosFim = horaFim * 60 + minFim;
    const minutosAtual = horaAtual * 60 + minAtual;

    if (minutosAtual < minutosInicio || minutosAtual >= minutosFim) return false;

    if (intervaloInicio && intervaloFim) {
      const [horaIntInicio, minIntInicio] = intervaloInicio.split(':').map(Number);
      const [horaIntFim, minIntFim] = intervaloFim.split(':').map(Number);
      
      const minutosIntInicio = horaIntInicio * 60 + minIntInicio;
      const minutosIntFim = horaIntFim * 60 + minIntFim;

      if (minutosAtual >= minutosIntInicio && minutosAtual < minutosIntFim) return false;
    }

    const dataStr = format(data, 'yyyy-MM-dd');
    const ausencia = ausencias.find(a => 
      (a.profissional_id || a.profissionalId) === profissionalId &&
      dataStr >= (a.data_inicio || a.dataInicio) &&
      dataStr <= (a.data_fim || a.dataFim) &&
      (
        ((a.horario_inicio || a.horarioInicio) === '00:00' && (a.horario_fim || a.horarioFim) === '23:59') ||
        (hora >= (a.horario_inicio || a.horarioInicio) && hora < (a.horario_fim || a.horarioFim))
      )
    );

    if (ausencia) return false;

    const agendamento = agendamentos.find(a =>
      (a.profissional_id || a.profissionalId) === profissionalId &&
      a.data === dataStr &&
      a.horario === hora &&
      a.status !== 'cancelado'
    );

    return !agendamento;
  };

  const gerarHorarios = (data) => {
    const horariosGerados = [];
    for (let hora = 8; hora <= 20; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        horariosGerados.push(horaStr);
      }
    }
    return horariosGerados;
  };

  const getDiasSemana = () => {
    if (visao === 'dia') {
      return [dataReferencia];
    }
    
    if (visao === 'semana') {
      const inicio = startOfWeek(dataReferencia, { weekStartsOn: 1 });
      const fim = endOfWeek(dataReferencia, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: inicio, end: fim });
    }
    
    if (visao === 'mes') {
      const dias = [];
      const primeiroDia = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth(), 1);
      const ultimoDia = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() + 1, 0);
      
      for (let d = new Date(primeiroDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
        dias.push(new Date(d));
      }
      return dias;
    }
    
    return [];
  };

  const profissionaisFiltrados = profissionalSelecionado === 'todos'
    ? profissionais
    : profissionais.filter(p => p.id === profissionalSelecionado);

  const diasVisao = getDiasSemana();
  const horariosDia = gerarHorarios(dataReferencia);

  const getDisponibilidadesPorProfissional = (profissionalId) => {
    return disponibilidades.filter(d => (d.profissional_id || d.profissionalId) === profissionalId && d.ativo);
  };

  const formatarHorario = (hora) => {
    if (!hora) return '—';
    return hora.substring(0, 5);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Disponibilidade de Profissionais
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie horários, folgas e ausências da equipe
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Atualizar
            </Button>
            <Button
              variant="outlined"
              startIcon={<EventBusyIcon />}
              onClick={() => handleOpenAusenciaDialog()}
            >
              Nova Ausência
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              Configurar Horário
            </Button>
          </Box>
        </Box>

        {/* Controles de Visualização */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    value={profissionalSelecionado}
                    label="Profissional"
                    onChange={(e) => setProfissionalSelecionado(e.target.value)}
                  >
                    <MenuItem value="todos">Todos os profissionais</MenuItem>
                    {profissionais.map(prof => (
                      <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton onClick={() => handleNavegar('anterior')}>
                    <ChevronLeftIcon />
                  </IconButton>
                  
                  <Button
                    variant="outlined"
                    startIcon={<TodayIcon />}
                    onClick={handleHoje}
                    size="small"
                  >
                    Hoje
                  </Button>
                  
                  <Typography variant="body1" sx={{ fontWeight: 600, ml: 2 }}>
                    {visao === 'dia' && format(dataReferencia, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                    {visao === 'semana' && `Semana de ${format(diasVisao[0], 'dd/MM')} a ${format(diasVisao[diasVisao.length - 1], 'dd/MM/yyyy')}`}
                    {visao === 'mes' && format(dataReferencia, "MMMM 'de' yyyy", { locale: pt })}
                  </Typography>
                  
                  <IconButton onClick={() => handleNavegar('proximo')}>
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <ToggleButtonGroup
                  value={visao}
                  exclusive
                  onChange={handleMudarVisao}
                  size="small"
                  sx={{ float: 'right' }}
                >
                  <ToggleButton value="dia">
                    <Tooltip title="Dia">
                      <TodayIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="semana">
                    <Tooltip title="Semana">
                      <ViewWeekIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="mes">
                    <Tooltip title="Mês">
                      <ViewModuleIcon />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabela de Disponibilidade Melhorada */}
        <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 1200 }}>
              {/* Cabeçalho com dias */}
              <Grid container sx={{ bgcolor: '#f5f5f5', borderBottom: '2px solid #9c27b0' }}>
                <Grid item xs={2} sx={{ p: 2, borderRight: '1px solid #ddd' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Profissional
                  </Typography>
                </Grid>
                {diasVisao.map((dia, index) => (
                  <Grid 
                    key={index} 
                    item 
                    xs={visao === 'mes' ? 0.7 : 1.2} 
                    sx={{ 
                      p: 1, 
                      textAlign: 'center',
                      borderRight: index < diasVisao.length - 1 ? '1px solid #ddd' : 'none',
                      bgcolor: isSameDay(dia, new Date()) ? alpha('#9c27b0', 0.1) : 'transparent',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                      {format(dia, 'EEE', { locale: pt }).toUpperCase()}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {format(dia, 'dd/MM')}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Linhas de profissionais */}
              <AnimatePresence>
                {profissionaisFiltrados.map((profissional) => {
                  const disponibilidadesProf = getDisponibilidadesPorProfissional(profissional.id);
                  
                  return (
                    <motion.div
                      key={profissional.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Accordion
                        expanded={expandedProfissional === profissional.id}
                        onChange={() => setExpandedProfissional(
                          expandedProfissional === profissional.id ? null : profissional.id
                        )}
                        sx={{ 
                          '&:before': { display: 'none' },
                          boxShadow: 'none',
                          borderBottom: '1px solid #e0e0e0'
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Grid container alignItems="center">
                            <Grid item xs={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar 
                                  src={profissional.foto} 
                                  sx={{ width: 40, height: 40, bgcolor: '#9c27b0' }}
                                >
                                  {profissional.nome?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {profissional.nome}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {profissional.especialidade || 'Profissional'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={10}>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {disponibilidadesProf.map(disp => {
                                  const diaInfo = diasSemana.find(d => d.value === (disp.dia_semana || disp.diaSemana));
                                  const horarioInicio = disp.horario_inicio || disp.horarioInicio;
                                  const horarioFim = disp.horario_fim || disp.horarioFim;
                                  return (
                                    <Chip
                                      key={disp.id}
                                      label={`${diaInfo?.abreviado}: ${formatarHorario(horarioInicio)} - ${formatarHorario(horarioFim)}`}
                                      size="small"
                                      sx={{ 
                                        bgcolor: diaInfo?.cor || '#9c27b0',
                                        color: 'white',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  );
                                })}
                                {disponibilidadesProf.length === 0 && (
                                  <Typography variant="caption" color="textSecondary">
                                    Nenhum horário configurado
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </AccordionSummary>
                        
                        <AccordionDetails sx={{ p: 0 }}>
                          <Grid container>
                            <Grid item xs={2} sx={{ p: 1, borderRight: '1px solid #ddd', bgcolor: '#faf5ff' }}>
                              <Typography variant="caption" color="textSecondary">
                                Horários
                              </Typography>
                            </Grid>
                            
                            {diasVisao.map((dia, index) => {
                              const diaSemana = dia.getDay();
                              const disponibilidade = disponibilidadesProf.find(d => (d.dia_semana || d.diaSemana) === diaSemana);
                              const temAusencia = ausencias.some(a => 
                                (a.profissional_id || a.profissionalId) === profissional.id &&
                                format(dia, 'yyyy-MM-dd') >= (a.data_inicio || a.dataInicio) &&
                                format(dia, 'yyyy-MM-dd') <= (a.data_fim || a.dataFim)
                              );
                              
                              let status = 'indisponivel';
                              let tooltipText = 'Indisponível';
                              let bgcolor = alpha('#999', 0.1);
                              
                              if (temAusencia) {
                                status = 'ausente';
                                tooltipText = 'Ausente/Folga';
                                bgcolor = alpha('#f44336', 0.1);
                              } else if (disponibilidade) {
                                status = 'disponivel';
                                const horarioInicio = disponibilidade.horario_inicio || disponibilidade.horarioInicio;
                                const horarioFim = disponibilidade.horario_fim || disponibilidade.horarioFim;
                                tooltipText = `Disponível: ${formatarHorario(horarioInicio)} - ${formatarHorario(horarioFim)}`;
                                bgcolor = alpha('#4caf50', 0.1);
                              }
                              
                              return (
                                <Grid 
                                  key={index} 
                                  item 
                                  xs={visao === 'mes' ? 0.7 : 1.2} 
                                  sx={{ 
                                    p: 1, 
                                    textAlign: 'center',
                                    borderRight: index < diasVisao.length - 1 ? '1px solid #e0e0e0' : 'none',
                                    bgcolor,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      bgcolor: alpha('#9c27b0', 0.1),
                                      transform: 'scale(1.02)',
                                    },
                                  }}
                                  onClick={() => {
                                    if (status === 'ausente') {
                                      const aus = ausencias.find(a => 
                                        (a.profissional_id || a.profissionalId) === profissional.id &&
                                        format(dia, 'yyyy-MM-dd') >= (a.data_inicio || a.dataInicio) &&
                                        format(dia, 'yyyy-MM-dd') <= (a.data_fim || a.dataFim)
                                      );
                                      if (aus) handleOpenAusenciaDialog(aus);
                                    } else if (status === 'disponivel' && disponibilidade) {
                                      handleOpenDialog(disponibilidade);
                                    }
                                  }}
                                >
                                  <Tooltip title={tooltipText} arrow>
                                    <Box>
                                      {status === 'ausente' && (
                                        <EventBusyIcon sx={{ fontSize: 24, color: '#f44336' }} />
                                      )}
                                      {status === 'disponivel' && (
                                        <EventAvailableIcon sx={{ fontSize: 24, color: '#4caf50' }} />
                                      )}
                                      {status === 'indisponivel' && (
                                        <BlockIcon sx={{ fontSize: 24, color: '#999' }} />
                                      )}
                                      
                                      {disponibilidade && (
                                        <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem', mt: 0.5 }}>
                                          {formatarHorario(disponibilidade.horario_inicio || disponibilidade.horarioInicio)} - {formatarHorario(disponibilidade.horario_fim || disponibilidade.horarioFim)}
                                        </Typography>
                                      )}
                                      
                                      {temAusencia && (
                                        <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem', color: '#f44336' }}>
                                          Ausente
                                        </Typography>
                                      )}
                                    </Box>
                                  </Tooltip>
                                </Grid>
                              );
                            })}
                          </Grid>
                          
                          <Box sx={{ p: 1, borderTop: '1px solid #e0e0e0', bgcolor: '#faf5ff', display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => handleOpenDialog()}
                            >
                              Adicionar Horário
                            </Button>
                            <Button
                              size="small"
                              startIcon={<CopyAllIcon />}
                              onClick={() => {
                                const destino = window.prompt('ID do profissional destino para copiar horários:');
                                if (destino) handleCopiarDisponibilidade(profissional.id, destino);
                              }}
                            >
                              Copiar Horários
                            </Button>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {profissionaisFiltrados.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary">
                    Nenhum profissional encontrado
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Lista de Ausências */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Próximas Ausências e Folgas</Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Profissional</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell><strong>Período</strong></TableCell>
                    <TableCell><strong>Observações</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ausencias
                    .filter(a => new Date(a.data_fim || a.dataFim) >= new Date())
                    .sort((a, b) => new Date(a.data_inicio || a.dataInicio) - new Date(b.data_inicio || b.dataInicio))
                    .map((ausencia, index) => {
                      const profissional = profissionais.find(p => p.id === (ausencia.profissional_id || ausencia.profissionalId));
                      const tipo = tiposAusencia.find(t => t.value === ausencia.tipo);
                      const dataInicio = ausencia.data_inicio || ausencia.dataInicio;
                      const dataFim = ausencia.data_fim || ausencia.dataFim;
                      const horarioInicio = ausencia.horario_inicio || ausencia.horarioInicio;
                      const horarioFim = ausencia.horario_fim || ausencia.horarioFim;

                      return (
                        <TableRow key={ausencia.id || index} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar src={profissional?.foto} sx={{ width: 32, height: 32 }}>
                                {profissional?.nome?.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">
                                {profissional?.nome || 'Profissional'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={tipo?.icon}
                              label={tipo?.label || ausencia.tipo}
                              size="small"
                              sx={{ bgcolor: tipo?.color, color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(dataInicio).toLocaleDateString('pt-BR')}
                              {dataInicio !== dataFim && 
                                ` a ${new Date(dataFim).toLocaleDateString('pt-BR')}`}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {horarioInicio} - {horarioFim}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {ausencia.observacoes || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenAusenciaDialog(ausencia)}
                              sx={{ color: '#ff4081' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoverAusencia(ausencia.id, ausencia)}
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {ausencias.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <EventBusyIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="body1" color="textSecondary">
                          Nenhuma ausência registrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Dialog de Configuração de Horário Melhorado */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            {disponibilidadeEditando ? 'Editar Horário' : 'Configurar Horário'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    name="profissional_id"
                    value={formData.profissional_id}
                    label="Profissional"
                    onChange={handleInputChange}
                    required
                  >
                    {profissionais.map(prof => (
                      <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Dias da Semana
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {diasSemana.map(dia => (
                    <Chip
                      key={dia.value}
                      label={dia.abreviado}
                      onClick={() => {
                        const novosDias = formData.dias_semana.includes(dia.value)
                          ? formData.dias_semana.filter(d => d !== dia.value)
                          : [...formData.dias_semana, dia.value];
                        handleDiasSemanaChange(novosDias);
                      }}
                      color={formData.dias_semana.includes(dia.value) ? 'primary' : 'default'}
                      sx={{
                        bgcolor: formData.dias_semana.includes(dia.value) ? dia.cor : undefined,
                        color: formData.dias_semana.includes(dia.value) ? 'white' : undefined,
                        '&:hover': {
                          bgcolor: formData.dias_semana.includes(dia.value) ? dia.cor : undefined,
                          opacity: 0.9,
                        }
                      }}
                    />
                  ))}
                </Box>
                {formData.dias_semana.length === 0 && (
                  <Typography variant="caption" color="error">
                    Selecione pelo menos um dia
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Modelos de Horário
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {horariosSugeridos.map((modelo, idx) => (
                    <Chip
                      key={idx}
                      label={modelo.label}
                      onClick={() => aplicarModeloHorario(modelo)}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário Início"
                  name="horario_inicio"
                  type="time"
                  value={formData.horario_inicio}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário Fim"
                  name="horario_fim"
                  type="time"
                  value={formData.horario_fim}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.usarIntervalo}
                      onChange={(e) => setFormData({ ...formData, usarIntervalo: e.target.checked })}
                      name="usarIntervalo"
                    />
                  }
                  label="Usar intervalo de almoço/descanso"
                />
              </Grid>

              {formData.usarIntervalo && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Início do Intervalo"
                      name="intervalo_inicio"
                      type="time"
                      value={formData.intervalo_inicio}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Fim do Intervalo"
                      name="intervalo_fim"
                      type="time"
                      value={formData.intervalo_fim}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.ativo}
                      onChange={handleInputChange}
                      name="ativo"
                    />
                  }
                  label="Horário ativo"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  name="observacoes"
                  multiline
                  rows={2}
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  size="small"
                  placeholder="Observações sobre este horário..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={handleSalvarDisponibilidade}
              variant="contained"
              sx={{ bgcolor: '#9c27b0' }}
            >
              {disponibilidadeEditando ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Ausência */}
        <Dialog open={openAusenciaDialog} onClose={handleCloseAusenciaDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
            {ausenciaEditando ? 'Editar Ausência' : 'Nova Ausência'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    name="profissional_id"
                    value={ausenciaForm.profissional_id}
                    label="Profissional"
                    onChange={handleAusenciaInputChange}
                    required
                  >
                    {profissionais.map(prof => (
                      <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    name="tipo"
                    value={ausenciaForm.tipo}
                    label="Tipo"
                    onChange={handleAusenciaInputChange}
                  >
                    {tiposAusencia.map(tipo => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {tipo.icon}
                          {tipo.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data Início"
                  value={ausenciaForm.data_inicio ? new Date(ausenciaForm.data_inicio + 'T12:00:00') : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setAusenciaForm({ 
                        ...ausenciaForm, 
                        data_inicio: format(newValue, 'yyyy-MM-dd') 
                      });
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data Fim"
                  value={ausenciaForm.data_fim ? new Date(ausenciaForm.data_fim + 'T12:00:00') : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setAusenciaForm({ 
                        ...ausenciaForm, 
                        data_fim: format(newValue, 'yyyy-MM-dd') 
                      });
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário Início"
                  name="horario_inicio"
                  type="time"
                  value={ausenciaForm.horario_inicio}
                  onChange={handleAusenciaInputChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário Fim"
                  name="horario_fim"
                  type="time"
                  value={ausenciaForm.horario_fim}
                  onChange={handleAusenciaInputChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Repetir</InputLabel>
                  <Select
                    name="repetir"
                    value={ausenciaForm.repetir}
                    label="Repetir"
                    onChange={handleAusenciaInputChange}
                  >
                    {periodosRepeticao.map(periodo => (
                      <MenuItem key={periodo.value} value={periodo.value}>{periodo.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  name="observacoes"
                  multiline
                  rows={2}
                  value={ausenciaForm.observacoes}
                  onChange={handleAusenciaInputChange}
                  size="small"
                  placeholder="Motivo da ausência..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAusenciaDialog}>Cancelar</Button>
            <Button
              onClick={handleSalvarAusencia}
              variant="contained"
              sx={{ bgcolor: '#ff9800' }}
            >
              {ausenciaEditando ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Speed Dial para ações rápidas */}
        <SpeedDial
          ariaLabel="Ações rápidas"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={() => setOpenSpeedDial(false)}
          onOpen={() => setOpenSpeedDial(true)}
          open={openSpeedDial}
        >
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="Novo Horário"
            onClick={() => handleOpenDialog()}
          />
          <SpeedDialAction
            icon={<EventBusyIcon />}
            tooltipTitle="Nova Ausência"
            onClick={() => handleOpenAusenciaDialog()}
          />
          <SpeedDialAction
            icon={<RefreshIcon />}
            tooltipTitle="Atualizar"
            onClick={handleRefresh}
          />
        </SpeedDial>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

export default Disponibilidade;
