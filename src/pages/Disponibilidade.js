// src/pages/Disponibilidade.js
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
  TablePagination,
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
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
} from 'date-fns';
import { pt } from 'date-fns/locale';

const diasSemana = [
  { value: 0, label: 'Domingo', abreviado: 'DOM' },
  { value: 1, label: 'Segunda', abreviado: 'SEG' },
  { value: 2, label: 'Terça', abreviado: 'TER' },
  { value: 3, label: 'Quarta', abreviado: 'QUA' },
  { value: 4, label: 'Quinta', abreviado: 'QUI' },
  { value: 5, label: 'Sexta', abreviado: 'SEX' },
  { value: 6, label: 'Sábado', abreviado: 'SAB' },
];

const tiposAusencia = [
  { value: 'folga', label: 'Folga', color: '#4caf50' },
  { value: 'ferias', label: 'Férias', color: '#2196f3' },
  { value: 'licenca', label: 'Licença', color: '#ff9800' },
  { value: 'falta', label: 'Falta', color: '#f44336' },
  { value: 'treinamento', label: 'Treinamento', color: '#9c27b0' },
  { value: 'evento', label: 'Evento', color: '#00bcd4' },
];

const periodosRepeticao = [
  { value: 'nao', label: 'Não repetir' },
  { value: 'diario', label: 'Diariamente' },
  { value: 'semanal', label: 'Semanalmente' },
  { value: 'quinzenal', label: 'Quinzenalmente' },
  { value: 'mensal', label: 'Mensalmente' },
];

function Disponibilidade() {
  const [loading, setLoading] = useState(true);
  const [profissionais, setProfissionais] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [ausencias, setAusencias] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [dataReferencia, setDataReferencia] = useState(new Date());
  const [profissionalSelecionado, setProfissionalSelecionado] = useState('todos');
  const [visao, setVisao] = useState('semana'); // 'dia', 'semana', 'mes'
  const [openDialog, setOpenDialog] = useState(false);
  const [openAusenciaDialog, setOpenAusenciaDialog] = useState(false);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [disponibilidadeEditando, setDisponibilidadeEditando] = useState(null);
  const [ausenciaEditando, setAusenciaEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [horarios, setHorarios] = useState([]);
  
  // 🔥 Estado para usuário atual
  const [usuario, setUsuario] = useState(null);

  // Estado do formulário de disponibilidade
  const [formData, setFormData] = useState({
    profissionalId: '',
    diaSemana: 1,
    horarioInicio: '09:00',
    horarioFim: '18:00',
    intervaloInicio: '12:00',
    intervaloFim: '13:00',
    ativo: true,
    observacoes: '',
  });

  // Estado do formulário de ausência
  const [ausenciaForm, setAusenciaForm] = useState({
    profissionalId: '',
    tipo: 'folga',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    horarioInicio: '00:00',
    horarioFim: '23:59',
    repetir: 'nao',
    observacoes: '',
  });

  // 🔥 Carregar usuário atual
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

  // 🔥 Função para registrar na auditoria
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
      
      // 🔥 LOG TÉCNICO
      await firebaseService.log('info', 'Carregando dados de disponibilidade');
      
      const [profissionaisData, disponibilidadesData, ausenciasData, agendamentosData] = await Promise.all([
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('disponibilidades').catch(() => []),
        firebaseService.getAll('ausencias').catch(() => []),
        firebaseService.query('agendamentos', [
          { field: 'status', operator: '!=', value: 'cancelado' }
        ]).catch(() => [])
      ]);

      setProfissionais(profissionaisData || []);
      setDisponibilidades(disponibilidadesData || []);
      setAusencias(ausenciasData || []);
      setAgendamentos(agendamentosData || []);
      
      // 🔥 AUDITORIA
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
      
      // 🔥 LOG TÉCNICO
      await firebaseService.log('success', 'Dados de disponibilidade carregados', {
        profissionais: profissionaisData?.length,
        disponibilidades: disponibilidadesData?.length
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      
      // 🔥 LOG DE ERRO
      await firebaseService.log('error', 'Erro ao carregar dados de disponibilidade', {
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
    // 🔥 LOG TÉCNICO
    await firebaseService.log('info', 'Atualização manual da página de disponibilidade');
    await carregarDados();
  };

  const handleOpenDialog = (disponibilidade = null) => {
    if (disponibilidade) {
      setDisponibilidadeEditando(disponibilidade);
      setFormData({
        profissionalId: disponibilidade.profissionalId,
        diaSemana: disponibilidade.diaSemana || 1,
        horarioInicio: disponibilidade.horarioInicio || '09:00',
        horarioFim: disponibilidade.horarioFim || '18:00',
        intervaloInicio: disponibilidade.intervaloInicio || '12:00',
        intervaloFim: disponibilidade.intervaloFim || '13:00',
        ativo: disponibilidade.ativo !== false,
        observacoes: disponibilidade.observacoes || '',
      });
    } else {
      setDisponibilidadeEditando(null);
      setFormData({
        profissionalId: profissionalSelecionado !== 'todos' ? profissionalSelecionado : '',
        diaSemana: 1,
        horarioInicio: '09:00',
        horarioFim: '18:00',
        intervaloInicio: '12:00',
        intervaloFim: '13:00',
        ativo: true,
        observacoes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleOpenAusenciaDialog = (ausencia = null) => {
    if (ausencia) {
      setAusenciaEditando(ausencia);
      setAusenciaForm({
        profissionalId: ausencia.profissionalId || '',
        tipo: ausencia.tipo || 'folga',
        dataInicio: ausencia.dataInicio || new Date().toISOString().split('T')[0],
        dataFim: ausencia.dataFim || new Date().toISOString().split('T')[0],
        horarioInicio: ausencia.horarioInicio || '00:00',
        horarioFim: ausencia.horarioFim || '23:59',
        repetir: ausencia.repetir || 'nao',
        observacoes: ausencia.observacoes || '',
      });
    } else {
      setAusenciaEditando(null);
      setAusenciaForm({
        profissionalId: profissionalSelecionado !== 'todos' ? profissionalSelecionado : '',
        tipo: 'folga',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0],
        horarioInicio: '00:00',
        horarioFim: '23:59',
        repetir: 'nao',
        observacoes: '',
      });
    }
    setOpenAusenciaDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDisponibilidadeEditando(null);
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

  const handleAusenciaInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAusenciaForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSalvarDisponibilidade = async () => {
    try {
      if (!formData.profissionalId) {
        mostrarSnackbar('Selecione um profissional', 'error');
        return;
      }

      // 🔥 LOG TÉCNICO
      await firebaseService.log('info', 'Salvando configuração de disponibilidade');

      const dadosParaSalvar = {
        ...formData,
        criadoEm: disponibilidadeEditando ? disponibilidadeEditando.criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      if (disponibilidadeEditando) {
        await firebaseService.update('disponibilidades', disponibilidadeEditando.id, dadosParaSalvar);
        
        // 🔥 AUDITORIA
        await registrarAuditoria(
          'atualizar_disponibilidade',
          disponibilidadeEditando.id,
          `Disponibilidade atualizada para ${formData.diaSemana}`,
          { profissionalId: formData.profissionalId, diaSemana: formData.diaSemana }
        );
        
        mostrarSnackbar('Disponibilidade atualizada com sucesso!');
      } else {
        const novaDisponibilidade = await firebaseService.add('disponibilidades', dadosParaSalvar);
        
        // 🔥 AUDITORIA
        await registrarAuditoria(
          'criar_disponibilidade',
          novaDisponibilidade.id,
          `Nova disponibilidade criada para dia ${formData.diaSemana}`,
          { profissionalId: formData.profissionalId, diaSemana: formData.diaSemana }
        );
        
        mostrarSnackbar('Disponibilidade cadastrada com sucesso!');
      }

      // 🔥 LOG TÉCNICO
      await firebaseService.log('success', 'Disponibilidade salva com sucesso');

      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar disponibilidade:', error);
      
      // 🔥 LOG DE ERRO
      await firebaseService.log('error', 'Erro ao salvar disponibilidade', {
        error: error.message
      });
      
      mostrarSnackbar(error.message || 'Erro ao salvar disponibilidade', 'error');
    }
  };

  const handleSalvarAusencia = async () => {
    try {
      if (!ausenciaForm.profissionalId) {
        mostrarSnackbar('Selecione um profissional', 'error');
        return;
      }

      // 🔥 LOG TÉCNICO
      await firebaseService.log('info', 'Salvando ausência de profissional');

      const dadosParaSalvar = {
        ...ausenciaForm,
        criadoEm: ausenciaEditando ? ausenciaEditando.criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      if (ausenciaEditando) {
        await firebaseService.update('ausencias', ausenciaEditando.id, dadosParaSalvar);
        
        // 🔥 AUDITORIA
        await registrarAuditoria(
          'atualizar_ausencia',
          ausenciaEditando.id,
          `Ausência atualizada para ${ausenciaForm.tipo}`,
          { profissionalId: ausenciaForm.profissionalId, tipo: ausenciaForm.tipo }
        );
        
        mostrarSnackbar('Ausência atualizada com sucesso!');
      } else {
        const novaAusencia = await firebaseService.add('ausencias', dadosParaSalvar);
        
        // 🔥 AUDITORIA
        await registrarAuditoria(
          'criar_ausencia',
          novaAusencia.id,
          `Nova ausência criada: ${ausenciaForm.tipo}`,
          { profissionalId: ausenciaForm.profissionalId, tipo: ausenciaForm.tipo }
        );
        
        mostrarSnackbar('Ausência cadastrada com sucesso!');
      }

      // 🔥 LOG TÉCNICO
      await firebaseService.log('success', 'Ausência salva com sucesso');

      handleCloseAusenciaDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar ausência:', error);
      
      // 🔥 LOG DE ERRO
      await firebaseService.log('error', 'Erro ao salvar ausência', {
        error: error.message
      });
      
      mostrarSnackbar(error.message || 'Erro ao salvar ausência', 'error');
    }
  };

  const handleRemoverAusencia = async (id, ausencia) => {
    if (window.confirm('Deseja realmente remover esta ausência?')) {
      try {
        // 🔥 LOG TÉCNICO
        await firebaseService.log('warning', 'Removendo ausência', { ausenciaId: id });
        
        await firebaseService.delete('ausencias', id);
        
        // 🔥 AUDITORIA
        await registrarAuditoria(
          'remover_ausencia',
          id,
          `Ausência removida`,
          { profissionalId: ausencia.profissionalId, tipo: ausencia.tipo }
        );
        
        mostrarSnackbar('Ausência removida com sucesso!');
        carregarDados();
      } catch (error) {
        console.error('Erro ao remover ausência:', error);
        mostrarSnackbar('Erro ao remover ausência', 'error');
      }
    }
  };

  const handleMudarVisao = (event, novaVisao) => {
    if (novaVisao !== null) {
      setVisao(novaVisao);
      
      // 🔥 LOG TÉCNICO (opcional, pode ser removido se gerar muitos logs)
      firebaseService.log('debug', 'Mudança de visualização', { novaVisao });
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
    // Verificar se é dia da semana disponível
    const diaSemana = data.getDay();
    const disponibilidade = disponibilidades.find(
      d => d.profissionalId === profissionalId && d.diaSemana === diaSemana && d.ativo
    );

    if (!disponibilidade) return false;

    // Verificar se está dentro do horário de trabalho
    const [horaInicio, minInicio] = disponibilidade.horarioInicio.split(':').map(Number);
    const [horaFim, minFim] = disponibilidade.horarioFim.split(':').map(Number);
    const [horaAtual, minAtual] = hora.split(':').map(Number);
    
    const minutosInicio = horaInicio * 60 + minInicio;
    const minutosFim = horaFim * 60 + minFim;
    const minutosAtual = horaAtual * 60 + minAtual;

    if (minutosAtual < minutosInicio || minutosAtual >= minutosFim) return false;

    // Verificar intervalo de almoço
    if (disponibilidade.intervaloInicio && disponibilidade.intervaloFim) {
      const [horaIntInicio, minIntInicio] = disponibilidade.intervaloInicio.split(':').map(Number);
      const [horaIntFim, minIntFim] = disponibilidade.intervaloFim.split(':').map(Number);
      
      const minutosIntInicio = horaIntInicio * 60 + minIntInicio;
      const minutosIntFim = horaIntFim * 60 + minIntFim;

      if (minutosAtual >= minutosIntInicio && minutosAtual < minutosIntFim) return false;
    }

    // Verificar ausências
    const dataStr = format(data, 'yyyy-MM-dd');
    const ausencia = ausencias.find(a => 
      a.profissionalId === profissionalId &&
      dataStr >= a.dataInicio &&
      dataStr <= a.dataFim &&
      (
        (a.horarioInicio === '00:00' && a.horarioFim === '23:59') ||
        (hora >= a.horarioInicio && hora < a.horarioFim)
      )
    );

    if (ausencia) return false;

    // Verificar agendamentos existentes
    const agendamento = agendamentos.find(a =>
      a.profissionalId === profissionalId &&
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

        {/* Tabela de Disponibilidade */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 1200 }}>
              {/* Cabeçalho com dias */}
              <Grid container sx={{ bgcolor: '#f5f5f5', borderBottom: '2px solid #9c27b0' }}>
                <Grid item xs={2} sx={{ p: 2, borderRight: '1px solid #ddd' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Profissional / Horário
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

              {/* Linhas de profissionais e horários */}
              {profissionaisFiltrados.map((profissional) => (
                <Box key={profissional.id}>
                  {/* Nome do profissional */}
                  <Grid container sx={{ bgcolor: '#faf5ff', borderBottom: '1px solid #e0e0e0' }}>
                    <Grid item xs={2} sx={{ p: 1.5, borderRight: '1px solid #ddd' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={profissional.foto} 
                          sx={{ width: 32, height: 32, bgcolor: '#9c27b0' }}
                        >
                          {profissional.nome?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {profissional.nome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {profissional.especialidade || 'Profissional'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    {/* Células de horários por dia */}
                    {diasVisao.map((dia, index) => {
                      const disponivel = verificarDisponivel(profissional.id, dia, '09:00');
                      const temAusencia = ausencias.some(a => 
                        a.profissionalId === profissional.id &&
                        format(dia, 'yyyy-MM-dd') >= a.dataInicio &&
                        format(dia, 'yyyy-MM-dd') <= a.dataFim
                      );

                      let bgcolor = '#fff';
                      let texto = 'Disponível';
                      
                      if (temAusencia) {
                        bgcolor = alpha('#f44336', 0.1);
                        texto = 'Ausente';
                      } else if (!disponivel) {
                        bgcolor = alpha('#999', 0.1);
                        texto = 'Indisponível';
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
                            '&:hover': {
                              bgcolor: alpha('#9c27b0', 0.05),
                            },
                          }}
                          onClick={() => {
                            if (temAusencia) {
                              const aus = ausencias.find(a => 
                                a.profissionalId === profissional.id &&
                                format(dia, 'yyyy-MM-dd') >= a.dataInicio &&
                                format(dia, 'yyyy-MM-dd') <= a.dataFim
                              );
                              if (aus) handleOpenAusenciaDialog(aus);
                            }
                          }}
                        >
                          <Tooltip title={texto}>
                            <Box>
                              {temAusencia ? (
                                <EventBusyIcon sx={{ fontSize: 20, color: '#f44336' }} />
                              ) : disponivel ? (
                                <EventAvailableIcon sx={{ fontSize: 20, color: '#4caf50' }} />
                              ) : (
                                <BlockIcon sx={{ fontSize: 20, color: '#999' }} />
                              )}
                              <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>
                                {texto}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Horários detalhados (opcional, para visão de dia) */}
                  {visao === 'dia' && (
                    <Grid container>
                      <Grid item xs={2} sx={{ p: 1, borderRight: '1px solid #ddd', bgcolor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary">
                          Horários
                        </Typography>
                      </Grid>
                      {horariosDia.map((hora, idx) => {
                        const disponivel = verificarDisponivel(profissional.id, dataReferencia, hora);
                        return (
                          <Grid 
                            key={idx} 
                            item 
                            xs={1.2} 
                            sx={{ 
                              p: 0.5, 
                              textAlign: 'center',
                              borderRight: idx < horariosDia.length - 1 ? '1px solid #e0e0e0' : 'none',
                              bgcolor: disponivel ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
                            }}
                          >
                            <Typography variant="caption">
                              {hora}
                            </Typography>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Box>
              ))}

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
        <Card sx={{ mt: 4 }}>
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
                    .filter(a => new Date(a.dataFim) >= new Date())
                    .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))
                    .map((ausencia, index) => {
                      const profissional = profissionais.find(p => p.id === ausencia.profissionalId);
                      const tipo = tiposAusencia.find(t => t.value === ausencia.tipo);

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
                              label={tipo?.label || ausencia.tipo}
                              size="small"
                              sx={{ bgcolor: tipo?.color, color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(ausencia.dataInicio).toLocaleDateString('pt-BR')}
                              {ausencia.dataInicio !== ausencia.dataFim && 
                                ` a ${new Date(ausencia.dataFim).toLocaleDateString('pt-BR')}`}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {ausencia.horarioInicio} - {ausencia.horarioFim}
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

        {/* Dialog de Configuração de Horário */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            {disponibilidadeEditando ? 'Editar Horário' : 'Configurar Horário'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    name="profissionalId"
                    value={formData.profissionalId}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Dia da Semana</InputLabel>
                  <Select
                    name="diaSemana"
                    value={formData.diaSemana}
                    label="Dia da Semana"
                    onChange={handleInputChange}
                  >
                    {diasSemana.map(dia => (
                      <MenuItem key={dia.value} value={dia.value}>{dia.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário Início"
                  name="horarioInicio"
                  type="time"
                  value={formData.horarioInicio}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário Fim"
                  name="horarioFim"
                  type="time"
                  value={formData.horarioFim}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Início do Intervalo"
                  name="intervaloInicio"
                  type="time"
                  value={formData.intervaloInicio}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fim do Intervalo"
                  name="intervaloFim"
                  type="time"
                  value={formData.intervaloFim}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

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
                    name="profissionalId"
                    value={ausenciaForm.profissionalId}
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
                      <MenuItem key={tipo.value} value={tipo.value}>{tipo.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Início"
                    value={ausenciaForm.dataInicio ? new Date(ausenciaForm.dataInicio + 'T12:00:00') : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setAusenciaForm({ 
                          ...ausenciaForm, 
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
                    value={ausenciaForm.dataFim ? new Date(ausenciaForm.dataFim + 'T12:00:00') : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setAusenciaForm({ 
                          ...ausenciaForm, 
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário Início"
                  name="horarioInicio"
                  type="time"
                  value={ausenciaForm.horarioInicio}
                  onChange={handleAusenciaInputChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário Fim"
                  name="horarioFim"
                  type="time"
                  value={ausenciaForm.horarioFim}
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
