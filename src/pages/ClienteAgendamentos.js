// src/pages/ClienteAgendamentos.js - VERSÃO OTIMIZADA PARA MOBILE
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
  Checkbox,
  FormControlLabel,
  Collapse,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Zoom,
  SwipeableDrawer,
  Badge,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { agendaDisponibilidadeService, TIME_SLOTS_PADRAO } from '../services/agendaDisponibilidadeService';


const getNomeProfissionalAgendamento = (agendamento = {}, profissional = null) => {
  const candidato = profissional?.nome
    || agendamento.profissionalNome
    || agendamento.nomeProfissional
    || agendamento.profissional?.nome
    || agendamento.profissional?.label
    || agendamento.profissional
    || agendamento.profissionalId;

  if (!candidato || candidato === 'null' || candidato === 'undefined') return 'Profissional não informado';
  return String(candidato);
};

const getFotoProfissionalAgendamento = (agendamento = {}, profissional = null) => profissional?.foto || profissional?.avatar || agendamento.profissionalFoto || agendamento.profissional?.foto || '';

// Componente de card de agendamento para mobile
const MobileAgendamentoCard = ({ agendamento, profissional, onDetalhes, onCancelar }) => {
  const nomeProfissional = getNomeProfissionalAgendamento(agendamento, profissional);
  const fotoProfissional = getFotoProfissionalAgendamento(agendamento, profissional);

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

  const formatarData = (data) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return data;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 2,
          borderLeft: '4px solid',
          borderLeftColor: getStatusColor(agendamento.status),
          borderRadius: 3,
          boxShadow: '0 10px 26px rgba(156,39,176,0.08)',
          borderColor: 'rgba(156,39,176,0.12)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.25 }, '&:last-child': { pb: { xs: 2, sm: 2.25 } } }}>
          {/* Cabeçalho com data e status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ color: '#9c27b0', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {formatarData(agendamento.data)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
                <TimeIcon sx={{ color: '#ff4081', fontSize: 17 }} />
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                  {agendamento.horario}
                </Typography>
              </Box>
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

          {/* Serviço */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, color: '#2c2c2c' }}>
            {agendamento.quantidadeServicos > 1 
              ? `${agendamento.quantidadeServicos} serviços` 
              : agendamento.servicosNomes || agendamento.servicoNome}
          </Typography>

          {/* Chips de serviços (apenas 1) */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
            {agendamento.servicos?.slice(0, 1).map((servico, idx) => (
              <Chip
                key={idx}
                label={servico.nome}
                size="small"
                variant="outlined"
                sx={{ height: 24 }}
              />
            ))}
            {agendamento.servicos?.length > 1 && (
              <Chip
                label={`+${agendamento.servicos.length - 1}`}
                size="small"
                sx={{ height: 24 }}
              />
            )}
          </Box>

          {/* Profissional e valor */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Avatar 
                src={fotoProfissional}
                sx={{ width: 28, height: 28, bgcolor: '#ff9800', fontSize: '0.85rem' }}
              >
                {!fotoProfissional && (nomeProfissional?.charAt(0) || '?')}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {nomeProfissional}
              </Typography>
            </Box>
            {agendamento.valorTotal > 0 && (
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0', fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
                R$ {agendamento.valorTotal.toFixed(2)}
              </Typography>
            )}
          </Box>

          {/* Botões de ação */}
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="text"
              onClick={() => onDetalhes(agendamento)}
              sx={{ color: '#9c27b0', fontWeight: 700, minWidth: 'auto', px: 1.25 }}
            >
              Detalhes
            </Button>
            {agendamento.status?.toLowerCase() === 'pendente' && (
              <Button
                size="small"
                variant="text"
                color="error"
                onClick={() => onCancelar(agendamento)}
                sx={{ fontWeight: 700, minWidth: 'auto', px: 1.25 }}
              >
                Cancelar
              </Button>
            )}
          </Box>

          {/* Observações (se houver) */}
          {agendamento.observacoes && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.78rem' }}>
              Obs: {agendamento.observacoes}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de filtro mobile
const MobileFilterDrawer = ({ open, onClose, filterStatus, setFilterStatus }) => {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '70vh'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Filtrar por status
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {[
            { value: 'todos', label: 'Todos' },
            { value: 'pendente', label: 'Pendentes', color: '#ff9800' },
            { value: 'confirmado', label: 'Confirmados', color: '#4caf50' },
            { value: 'cancelado', label: 'Cancelados', color: '#f44336' },
            { value: 'finalizado', label: 'Realizados', color: '#2196f3' },
          ].map((item) => (
            <ListItem
              key={item.value}
              button
              onClick={() => {
                setFilterStatus(item.value);
                onClose();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: filterStatus === item.value ? (item.color ? `${item.color}20` : '#f3e5f5') : 'transparent',
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: filterStatus === item.value ? 600 : 400,
                    color: item.color || 'inherit'
                  }
                }}
              />
              {filterStatus === item.value && (
                <CheckIcon sx={{ color: item.color || '#9c27b0', fontSize: 20 }} />
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  );
};

// Componente de carregamento
const LoadingSkeleton = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress />
  </Box>
);

function ClienteAgendamentos() {
  const navigate = useNavigate();
  const { cliente, firebaseUser } = useAuthCliente();
  
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [ausencias, setAusencias] = useState([]);
  
  // Estados para diálogos
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  
  // Estados de dados
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [selectedServicos, setSelectedServicos] = useState([]);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [servicoExpandido, setServicoExpandido] = useState(false);
  // NOVO: controla se deve mostrar todos os históricos
  const [showAllHistory, setShowAllHistory] = useState(false);
  
  // Formulário de novo agendamento
  const [formData, setFormData] = useState({
    profissionalId: '',
    data: '',
    horario: '',
    observacoes: '',
  });

  const timeSlots = TIME_SLOTS_PADRAO;

  // --- Funções auxiliares ---
  const getClienteIdsBusca = () => {
    const ids = new Set();
    if (cliente?.id) ids.add(String(cliente.id));
    if (cliente?.uid) ids.add(String(cliente.uid));
    if (cliente?.authUid) ids.add(String(cliente.authUid));
    if (cliente?.googleUid) ids.add(String(cliente.googleUid));
    if (firebaseUser?.uid) ids.add(String(firebaseUser.uid));
    if (cliente?.email) ids.add(String(cliente.email));
    return Array.from(ids).filter(id => id && id !== 'undefined' && id !== 'null');
  };

  const getClienteEmail = () => cliente?.email || firebaseUser?.email || null;

  const calcularHorarioFim = (horario, duracaoTotal = 60) => agendaDisponibilidadeService.calcularHorarioFim(horario, duracaoTotal);
  const calcularDuracaoSelecionada = () => selectedServicos.reduce((total, servico) => total + Number(servico.duracao || 60), 0) || 60;

  const getMotivoIndisponibilidade = (profissionalId, data, horario) => agendaDisponibilidadeService.obterMotivoIndisponibilidade({
    profissionalId,
    data,
    horario,
    duracaoMinutos: calcularDuracaoSelecionada(),
    disponibilidades,
    ausencias,
    agendamentos,
  });

  const isHorarioDisponivel = (horario) => {
    if (!formData.profissionalId || !formData.data || selectedServicos.length === 0) return false;
    return getMotivoIndisponibilidade(formData.profissionalId, formData.data, horario) === null;
  };

  // --- Carregamento de dados ---
  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const clienteIds = getClienteIdsBusca();
      const emailCliente = getClienteEmail();

      if (clienteIds.length === 0 && !emailCliente) {
        toast.error('Erro ao identificar o cliente');
        setLoading(false);
        return;
      }

      console.log('🔍 IDs do cliente:', clienteIds);
      console.log('🔍 Email do cliente:', emailCliente);

      // Buscar todos os agendamentos
      let todosAgendamentos = await firebaseService.getAll('agendamentos').catch(() => []);
      
      // Se não encontrou por IDs, tentar buscar por email
      if (todosAgendamentos.length === 0 && emailCliente) {
        const agendamentosPorEmail = await firebaseService.query('agendamentos', [
          { field: 'clienteEmail', operator: '==', value: emailCliente }
        ]).catch(() => []);
        todosAgendamentos = agendamentosPorEmail;
      }

      console.log('📋 Total de agendamentos no sistema:', todosAgendamentos.length);

      // Filtrar agendamentos do cliente com normalização
      const agendamentosCliente = (todosAgendamentos || []).filter((agendamento) => {
        const agendamentoIds = [
          agendamento.clienteId,
          agendamento.clienteUid,
          agendamento.clienteAuthUid,
          agendamento.authUid,
          agendamento.googleUid,
          agendamento.clienteEmail,
          agendamento.email,
          agendamento.usuarioId,
          agendamento.userId,
        ]
          .filter(Boolean)
          .map(String);

        const match = clienteIds.some(clienteId => 
          agendamentoIds.some(id => id === String(clienteId))
        ) || (emailCliente && agendamento.clienteEmail === emailCliente);

        if (match) {
          console.log('✅ Agendamento encontrado:', agendamento.id);
        }
        return match;
      });

      console.log('📋 Agendamentos do cliente encontrados:', agendamentosCliente.length);

      // Ordenar por data (mais recentes primeiro)
      const agendamentosOrdenados = agendamentosCliente.sort((a, b) => {
        const dataA = `${a.data || ''} ${a.horario || a.horaInicio || ''}`;
        const dataB = `${b.data || ''} ${b.horario || b.horaInicio || ''}`;
        return dataB.localeCompare(dataA);
      });
      
      setAgendamentos(agendamentosOrdenados);
      
      // Carregar outros dados
      const [servicosData, profissionaisData, dispData, ausData] = await Promise.all([
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('disponibilidades').catch(() => []),
        firebaseService.getAll('ausencias').catch(() => [])
      ]);
      
      setServicos(servicosData || []);
      setProfissionais(profissionaisData || []);
      setDisponibilidades(dispData || []);
      setAusencias(ausData || []);
      
      if (agendamentosOrdenados.length === 0) {
        console.log('ℹ️ Nenhum agendamento encontrado para este cliente');
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cliente) {
      carregarDados();
    }
  }, [cliente]);

  // --- Handlers ---
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

  const calcularTotal = () => {
    return selectedServicos.reduce((total, servico) => total + (servico.preco || 0), 0);
  };

  const handleSalvarAgendamento = async () => {
    try {
      if (selectedServicos.length === 0) {
        toast.error('Selecione pelo menos um serviço');
        return;
      }

      if (!formData.profissionalId) {
        toast.error('Selecione um profissional para ver os horários disponíveis');
        return;
      }

      if (!formData.data || !formData.horario) {
        toast.error('Preencha todos os campos');
        return;
      }

      const motivoIndisponibilidade = getMotivoIndisponibilidade(formData.profissionalId, formData.data, formData.horario);
      if (motivoIndisponibilidade) {
        toast.error(`Horário indisponível: ${motivoIndisponibilidade}`);
        return;
      }

      const clienteIdPrincipal = cliente?.id || firebaseUser?.uid;
      const authUid = firebaseUser?.uid || cliente?.authUid || cliente?.uid || null;
      const profissional = profissionais.find(p => p.id === formData.profissionalId);
      const servicosNormalizados = selectedServicos.map(s => ({
        id: s.id,
        nome: s.nome,
        preco: Number(s.preco || 0),
        duracao: Number(s.duracao || 60)
      }));
      const servicoIds = servicosNormalizados.map(s => s.id);
      const duracaoTotal = servicosNormalizados.reduce((total, servico) => total + Number(servico.duracao || 60), 0);
      const primeiroServico = servicosNormalizados[0] || {};
      const servicoOriginal = servicos.find(s => s.id === primeiroServico.id);
      const unidadeId = cliente?.unidadeId || profissional?.unidadeId || servicoOriginal?.unidadeId || null;

      const novoAgendamento = {
        empresaId: cliente?.empresaId || null,
        unidadeId,
        unidadeNome: cliente?.unidadeNome || profissional?.unidadeNome || servicoOriginal?.unidadeNome || null,
        clienteId: clienteIdPrincipal,
        clienteUid: cliente?.uid || null,
        clienteAuthUid: authUid,
        authUid,
        googleUid: cliente?.googleUid || null,
        clienteNome: cliente.nome,
        clienteEmail: cliente.email,
        clienteTelefone: cliente.telefone,
        servicos: servicosNormalizados,
        servicoId: primeiroServico.id || null,
        servicoNome: primeiroServico.nome || '',
        servicoIds,
        servicosIds: servicoIds,
        servicosNomes: servicosNormalizados.map(s => s.nome).join(', '),
        quantidadeServicos: servicosNormalizados.length,
        valorTotal: calcularTotal(),
        valor: calcularTotal(),
        preco: Number(primeiroServico.preco || 0),
        duracao: duracaoTotal,
        profissionalId: formData.profissionalId || null,
        profissionalNome: profissional?.nome || null,
        data: formData.data,
        horario: formData.horario,
        horaInicio: formData.horario,
        horaFim: calcularHorarioFim(formData.horario, duracaoTotal),
        observacoes: formData.observacoes,
        status: 'pendente',
        origem: 'cliente',
        origemPortalCliente: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await firebaseService.add('agendamentos', novoAgendamento);
      
      toast.success('Agendamento solicitado!');
      setOpenDialog(false);
      carregarDados();
      
    } catch (error) {
      console.error('Erro:', error);
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

      toast.success('Agendamento cancelado!');
      setOpenCancelDialog(false);
      carregarDados();
      
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao cancelar');
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

  const formatarMoeda = (valor) => {
    if (!valor) return 'R$ 0';
    return `R$ ${valor.toFixed(2)}`;
  };

  // --- Filtros e agrupamentos ---
  const agendamentosFiltrados = agendamentos.filter(a => {
    if (filterStatus === 'todos') return true;
    return a.status?.toLowerCase() === filterStatus;
  });

  const agendamentosFuturos = agendamentosFiltrados.filter(a => {
    const status = a.status?.toLowerCase() || '';
    return status !== 'cancelado' && status !== 'finalizado';
  });

  const agendamentosPassados = agendamentosFiltrados.filter(a => {
    const status = a.status?.toLowerCase() || '';
    return status === 'cancelado' || status === 'finalizado';
  });

  // Controlar quantos itens do histórico exibir
  const historyToShow = showAllHistory ? agendamentosPassados : agendamentosPassados.slice(0, 3);

  // Resetar showAllHistory quando o filtro mudar
  useEffect(() => {
    setShowAllHistory(false);
  }, [filterStatus]);

  // --- Render ---
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Box sx={{ pb: 7, maxWidth: 1120, mx: 'auto', px: { xs: 0, sm: 1 } }}>
      {/* Header */}
      <Paper sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, borderRadius: 3, background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Meus Agendamentos</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Acompanhe próximos horários, histórico e detalhes dos serviços.</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={() => setOpenFilterDrawer(true)} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.26)' } }}>
              <Badge badgeContent={filterStatus !== 'todos' ? 1 : 0} color="secondary">
                <FilterIcon fontSize="small" />
              </Badge>
            </IconButton>
            <IconButton size="small" onClick={carregarDados} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.26)' } }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Cards de Resumo */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', py: 1.5, borderRadius: 3, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              {agendamentosFuturos.length}
            </Typography>
            <Typography variant="caption">Futuros</Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', py: 1.5, borderRadius: 3, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#ff9800' }}>
              {agendamentos.filter(a => a.status === 'pendente').length}
            </Typography>
            <Typography variant="caption">Pend.</Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', py: 1.5, borderRadius: 3, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4caf50' }}>
              {agendamentos.filter(a => a.status === 'confirmado').length}
            </Typography>
            <Typography variant="caption">Conf.</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de Agendamentos */}
      <Box>
        {/* Próximos Agendamentos */}
        {agendamentosFuturos.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 1 }}>
              Próximos
            </Typography>
            <AnimatePresence>
              {agendamentosFuturos.map((agendamento) => {
                const profissional = profissionais.find(p =>
                  p.id === agendamento.profissionalId || p.uid === agendamento.profissionalId || p.nome === agendamento.profissionalNome
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
            </AnimatePresence>
          </>
        )}

        {/* Histórico */}
        {agendamentosPassados.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
              Histórico
            </Typography>
            <AnimatePresence>
              {historyToShow.map((agendamento) => {
                const profissional = profissionais.find(p =>
                  p.id === agendamento.profissionalId || p.uid === agendamento.profissionalId || p.nome === agendamento.profissionalNome
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
            </AnimatePresence>

            {/* Botão "Ver mais" / "Ver menos" */}
            {agendamentosPassados.length > 3 && (
              <Button
                fullWidth
                size="small"
                onClick={() => setShowAllHistory(!showAllHistory)}
                sx={{ color: '#9c27b0', mt: 0.5 }}
                startIcon={showAllHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showAllHistory 
                  ? `Ver menos (${agendamentosPassados.length})` 
                  : `Ver mais (${agendamentosPassados.length - 3})`}
              </Button>
            )}
          </>
        )}

        {/* Empty State */}
        {agendamentos.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
            <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Nenhum agendamento
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={handleNovoAgendamento}
              sx={{ mt: 1, bgcolor: '#9c27b0' }}
            >
              Agendar agora
            </Button>
          </Paper>
        )}
      </Box>

      {/* Filter Drawer */}
      <MobileFilterDrawer
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* FAB para novo agendamento */}
      <Zoom in={true}>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 70,
            right: 16,
            bgcolor: '#9c27b0',
            '&:hover': { bgcolor: '#7b1fa2' }
          }}
          onClick={handleNovoAgendamento}
        >
          <AddIcon />
        </Fab>
      </Zoom>

      {/* Dialog de Novo Agendamento */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white', py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Novo Agendamento</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {/* Seção de Serviços */}
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: '#faf5ff' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => setServicoExpandido(!servicoExpandido)}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                Serviços ({selectedServicos.length})
              </Typography>
              <IconButton size="small">
                {servicoExpandido ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Box>

            <Collapse in={servicoExpandido}>
              <Box sx={{ mt: 1.5 }}>
                <List dense sx={{ maxHeight: 250, overflow: 'auto' }}>
                  {servicos.map((servico) => {
                    const isSelected = selectedServicos.some(s => s.id === servico.id);
                    return (
                      <ListItem 
                        key={servico.id}
                        button
                        dense
                        onClick={() => handleToggleServico(servico)}
                        sx={{
                          bgcolor: isSelected ? '#f3e5f5' : 'transparent',
                          borderRadius: 1,
                          mb: 0.5,
                          py: 0.5
                        }}
                      >
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                              {servico.nome}
                            </Typography>
                          }
                          secondary={`R$ ${servico.preco?.toFixed(2)} • ${servico.duracao}min`}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    );
                  })}
                </List>

                {selectedServicos.length > 0 && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Total: {formatarMoeda(calcularTotal())}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>

          {/* Profissional */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Profissional</InputLabel>
            <Select
              value={formData.profissionalId}
              label="Profissional"
              onChange={(e) => setFormData({ ...formData, profissionalId: e.target.value })}
            >
              <MenuItem value="">Selecione um profissional</MenuItem>
              {profissionais.map(prof => (
                <MenuItem key={prof.id} value={prof.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={prof.foto} sx={{ width: 20, height: 20 }}>
                      {prof.nome?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">{prof.nome}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Data e Horário */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Data"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value, horario: '' })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Horário</InputLabel>
                <Select
                  value={formData.horario}
                  label="Horário"
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                >
                  {timeSlots.map(time => {
                    const disponivel = isHorarioDisponivel(time);
                    const motivo = formData.profissionalId && formData.data && selectedServicos.length > 0
                      ? getMotivoIndisponibilidade(formData.profissionalId, formData.data, time)
                      : 'Selecione serviço, profissional e data';
                    return (
                      <MenuItem key={time} value={time} disabled={!disponivel}>
                        {time}{!disponivel && motivo ? ` — ${motivo}` : ''}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Observações */}
          <TextField
            fullWidth
            label="Observações"
            multiline
            rows={2}
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            size="small"
            placeholder="Opcional"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button size="small" onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            size="small"
            onClick={handleSalvarAgendamento}
            variant="contained"
            sx={{ bgcolor: '#9c27b0' }}
          >
            Solicitar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Cancelamento */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white', py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Cancelar Agendamento</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Tem certeza que deseja cancelar?
          </Typography>
          {selectedAgendamento && (
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f5f5f5' }}>
              <Typography variant="caption" display="block">
                <strong>Data:</strong> {selectedAgendamento.data} às {selectedAgendamento.horario}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Serviço:</strong> {selectedAgendamento.servicosNomes}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button size="small" onClick={() => setOpenCancelDialog(false)}>Voltar</Button>
          <Button size="small" onClick={confirmarCancelamento} color="error" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white', py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Detalhes</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {selectedAgendamento && (
            <Box>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Data</Typography>
                  <Typography variant="body2">{selectedAgendamento.data}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Horário</Typography>
                  <Typography variant="body2">{selectedAgendamento.horario}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Serviços</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {selectedAgendamento.servicos?.map((s, i) => (
                      <Chip key={i} label={s.nome} size="small" sx={{ fontSize: '0.78rem' }} />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Valor</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                    {formatarMoeda(selectedAgendamento.valorTotal)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Status</Typography>
                  <Chip
                    label={selectedAgendamento.status}
                    color={getStatusColor(selectedAgendamento.status)}
                    size="small"
                    sx={{ height: 20, fontSize: '0.78rem' }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button size="small" onClick={() => setOpenDetailsDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClienteAgendamentos;
