// src/pages/ModernNotificacoes.js - VERSÃO ATUALIZADA COM ANAMNESE
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Paper,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon, // 🔥 Ícone para anamnese
  Quiz as QuizIcon, // 🔥 Ícone para formulário
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { notificacoesService } from '../services/notificacoesService';
import { anamneseService } from '../services/anamneseService'; // 🔥 Importar serviço de anamnese
import { firebaseService } from '../services/firebase';

function ModernNotificacoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState(null);
  const [filterType, setFilterType] = useState('todos');
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState(null);
  const [carregado, setCarregado] = useState(false);
  
  // 🔥 ESTADOS PARA ANAMNESE
  const [anamnesePendentes, setAnamnesePendentes] = useState([]);
  const [loadingAnamnese, setLoadingAnamnese] = useState(false);
  const [openAnamneseDialog, setOpenAnamneseDialog] = useState(false);
  const [selectedAnamnese, setSelectedAnamnese] = useState(null);

  // Carregar usuário do localStorage apenas uma vez
  useEffect(() => {
    try {
      console.log('📝 Iniciando carregamento da página de notificações');
      const userStr = localStorage.getItem('usuario');
      console.log('📝 userStr:', userStr);
      
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('👤 Usuário carregado do localStorage:', user);
        
        // 🔥 CORREÇÃO: Normalizar o objeto do usuário para ter uid
        const userNormalized = {
          ...user,
          uid: user.uid || user.id  // Se não tiver uid, usa o id
        };
        
        console.log('👤 Usuário normalizado:', userNormalized);
        setUsuario(userNormalized);
      } else {
        console.log('❌ Nenhum usuário encontrado no localStorage');
        setError('Usuário não encontrado. Faça login novamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      setError('Erro ao carregar usuário');
      setLoading(false);
    }
  }, []);

  // 🔥 CARREGAR ANAMNESES PENDENTES
  const carregarAnamnesesPendentes = useCallback(async () => {
    try {
      setLoadingAnamnese(true);
      console.log('📋 Carregando anamneses pendentes...');
      
      // Buscar todos os agendamentos de hoje em diante
      const agendamentos = await firebaseService.getAll('agendamentos');
      const hoje = new Date().toISOString().split('T')[0];
      
      const agendamentosFuturos = agendamentos.filter(a => 
        a.data >= hoje && 
        a.status !== 'cancelado' && 
        a.status !== 'finalizado'
      );
      
      console.log(`📅 Encontrados ${agendamentosFuturos.length} agendamentos futuros`);
      
      // Verificar quais têm formulário pendente
      const pendentes = [];
      
      for (const agendamento of agendamentosFuturos) {
        const temFormulario = await anamneseService.verificarFormularioPendente(agendamento.id);
        
        if (temFormulario) {
          const formulario = await anamneseService.obterFormularioParaAgendamento(agendamento.id);
          
          pendentes.push({
            id: agendamento.id,
            agendamentoId: agendamento.id,
            clienteId: agendamento.clienteId,
            clienteNome: agendamento.clienteNome || 'Cliente',
            profissionalId: agendamento.profissionalId,
            profissionalNome: agendamento.profissionalNome || 'Profissional',
            servicoId: agendamento.servicoId,
            servicoNome: agendamento.servicoNome || 'Serviço',
            data: agendamento.data,
            horaInicio: agendamento.horaInicio,
            formularioTitulo: formulario?.titulo || 'Formulário de Anamnese',
            formularioId: formulario?.id,
            status: 'pendente'
          });
        }
      }
      
      console.log(`📋 ${pendentes.length} anamneses pendentes encontradas`);
      setAnamnesePendentes(pendentes);
      
      // 🔥 Criar notificações para anamneses pendentes
      await criarNotificacoesAnamnese(pendentes);
      
    } catch (error) {
      console.error('❌ Erro ao carregar anamneses pendentes:', error);
    } finally {
      setLoadingAnamnese(false);
    }
  }, []);

  // 🔥 CRIAR NOTIFICAÇÕES PARA ANAMNESE
  const criarNotificacoesAnamnese = async (pendentes) => {
    const userId = usuario?.uid || usuario?.id;
    if (!userId) return;

    try {
      for (const item of pendentes) {
        // Verificar se já existe notificação para este agendamento
        const notificacoesExistentes = await notificacoesService.listar(userId);
        const existeNotificacao = notificacoesExistentes.some(n => 
          n.tipo === 'anamnese' && 
          n.detalhes?.agendamentoId === item.agendamentoId &&
          !n.lida
        );

        if (!existeNotificacao) {
          const notificacao = {
            usuarioId: userId,
            tipo: 'anamnese',
            titulo: '📋 Formulário de Anamnese Pendente',
            mensagem: `${item.clienteNome} precisa preencher o formulário antes do atendimento de ${item.servicoNome}`,
            data: new Date().toISOString(),
            lida: false,
            prioridade: 'alta',
            acao: {
              texto: 'Preencher formulário',
              link: `/anamnese/${item.agendamentoId}`
            },
            detalhes: {
              agendamentoId: item.agendamentoId,
              clienteId: item.clienteId,
              clienteNome: item.clienteNome,
              servicoId: item.servicoId,
              servicoNome: item.servicoNome,
              profissionalId: item.profissionalId,
              profissionalNome: item.profissionalNome,
              data: item.data,
              horaInicio: item.horaInicio,
              dataFormatada: new Date(item.data).toLocaleDateString('pt-BR'),
              horario: item.horaInicio,
              formularioTitulo: item.formularioTitulo
            }
          };

          await notificacoesService.criar(notificacao);
          console.log('✅ Notificação de anamnese criada para:', item.clienteNome);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar notificações de anamnese:', error);
    }
  };

  // Carregar notificações quando o usuário estiver disponível
  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      const userId = usuario?.uid || usuario?.id;
      
      if (!userId) {
        console.log('⏳ Aguardando usuário...', { usuario });
        return;
      }

      try {
        console.log('📥 Iniciando carregamento de notificações para userId:', userId);
        setLoading(true);
        setError(null);
        
        // Timeout para evitar loading infinito
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao carregar notificações')), 10000)
        );

        const dataPromise = notificacoesService.listar(userId);
        
        const data = await Promise.race([dataPromise, timeoutPromise]);
        
        if (mounted) {
          console.log('✅ Notificações carregadas com sucesso:', data?.length || 0);
          setNotifications(data || []);
          setCarregado(true);
          
          // 🔥 Carregar anamneses pendentes
          await carregarAnamnesesPendentes();
        }
      } catch (error) {
        if (mounted) {
          console.error('❌ Erro ao carregar notificações:', error);
          setError(error.message || 'Erro ao carregar notificações');
          toast.error('Erro ao carregar notificações');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, [usuario, carregarAnamnesesPendentes]);

  // Log para debug
  useEffect(() => {
    const userId = usuario?.uid || usuario?.id;
    console.log('📊 Estado atual:', {
      loading,
      carregado,
      error,
      notificationsCount: notifications.length,
      anamnesePendentesCount: anamnesePendentes.length,
      userId,
      usuario: usuario ? 'presente' : 'ausente'
    });
  }, [loading, carregado, error, notifications.length, anamnesePendentes.length, usuario]);

  // 🔥 FILTRAGEM MEMOIZADA (incluindo tipo 'anamnese')
  const filteredNotifications = useMemo(() => {
    console.log('🔍 Filtrando notificações...');
    let filtered = [...notifications];

    // Filtro por status (tabs)
    if (tabValue === 1) {
      filtered = filtered.filter(n => !n.lida);
    } else if (tabValue === 2) {
      filtered = filtered.filter(n => n.lida);
    }

    // Filtro por tipo
    if (filterType !== 'todos') {
      filtered = filtered.filter(n => n.tipo === filterType);
    }

    // Ordenar por data (mais recentes primeiro)
    filtered.sort((a, b) => {
      const dateA = a.data ? new Date(a.data) : new Date(0);
      const dateB = b.data ? new Date(b.data) : new Date(0);
      return dateB - dateA;
    });

    console.log(`📊 ${filtered.length} notificações após filtros`);
    return filtered;
  }, [notifications, tabValue, filterType]);

  // 🔥 UNREAD COUNT MEMOIZADO
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.lida).length;
  }, [notifications]);

  // 🔥 CONTAGEM POR TIPO
  const countsByType = useMemo(() => {
    const counts = {
      todos: notifications.length,
      agendamento: notifications.filter(n => n.tipo === 'agendamento').length,
      cliente: notifications.filter(n => n.tipo === 'cliente').length,
      estoque: notifications.filter(n => n.tipo === 'estoque').length,
      pagamento: notifications.filter(n => n.tipo === 'pagamento').length,
      lembrete: notifications.filter(n => n.tipo === 'lembrete').length,
      anamnese: notifications.filter(n => n.tipo === 'anamnese').length, // 🔥 NOVO
    };
    return counts;
  }, [notifications]);

  // 🔥 FUNÇÕES CORRIGIDAS PARA USAR uid OU id
  const carregarNotificacoes = useCallback(async () => {
    const userId = usuario?.uid || usuario?.id;
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Recarregando notificações manualmente para userId:', userId);
      
      // Recarregar notificações
      const data = await notificacoesService.listar(userId);
      console.log('📊 Notificações recarregadas:', data.length);
      setNotifications(data);
      
      // Recarregar anamneses pendentes
      await carregarAnamnesesPendentes();
      
    } catch (error) {
      console.error('❌ Erro ao recarregar notificações:', error);
      setError(error.message);
      toast.error('Erro ao recarregar notificações');
    } finally {
      setLoading(false);
    }
  }, [usuario, carregarAnamnesesPendentes]);

  const handleMarkAsRead = async (id) => {
    try {
      const success = await notificacoesService.marcarComoLida(id);
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, lida: true } : n)
        );
        toast.success('Notificação marcada como lida');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao marcar notificação');
    }
  };

  const handleMarkAllAsRead = async () => {
    const userId = usuario?.uid || usuario?.id;
    if (!userId) return;
    
    try {
      const success = await notificacoesService.marcarTodasComoLidas(userId);
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
        toast.success('Todas as notificações marcadas como lidas');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao marcar notificações');
    }
  };

  const handleDelete = async (id) => {
    try {
      const success = await notificacoesService.excluir(id);
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success('Notificação removida');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao remover notificação');
    }
    handleCloseMenu();
  };

  const handleDeleteAll = async () => {
    const userId = usuario?.uid || usuario?.id;
    if (!userId) return;
    
    try {
      const success = await notificacoesService.excluirTodas(userId);
      if (success) {
        setNotifications([]);
        toast.success('Todas as notificações removidas');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao remover notificações');
    }
    setOpenDialog(false);
  };

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleViewDetails = (notification) => {
    setNotificationDetails(notification);
    setOpenDetailsDialog(true);
  };

  // 🔥 FUNÇÃO PARA VER DETALHES DA ANAMNESE
  const handleViewAnamneseDetails = (item) => {
    setSelectedAnamnese(item);
    setOpenAnamneseDialog(true);
  };

  // 🔥 FUNÇÃO PARA IR PARA O FORMULÁRIO DE ANAMNESE
  const handleIrParaAnamnese = (agendamentoId) => {
    setOpenAnamneseDialog(false);
    navigate(`/anamnese/${agendamentoId}`);
  };

  const handleNavigate = (tipo, detalhes) => {
    setOpenDetailsDialog(false);
    
    console.log('🧭 Navegando:', { tipo, detalhes });
    
    switch (tipo) {
      case 'agendamento':
      case 'lembrete':
        navigate('/agendamentos');
        break;
      case 'cliente':
        navigate('/clientes');
        break;
      case 'estoque':
        navigate('/estoque');
        break;
      case 'pagamento':
        navigate('/financeiro/receber');
        break;
      case 'atendimento':
        if (detalhes?.id) {
          navigate(`/atendimento/${detalhes.id}`);
        }
        break;
      case 'anamnese': // 🔥 NOVO CASO
        if (detalhes?.agendamentoId) {
          navigate(`/anamnese/${detalhes.agendamentoId}`);
        } else {
          navigate('/anamnese');
        }
        break;
      default:
        if (detalhes?.link) {
          navigate(detalhes.link);
        }
    }
  };

  // 🔥 FUNÇÃO PARA OBTER ÍCONE (ATUALIZADA)
  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'agendamento': return <EventIcon sx={{ color: '#9c27b0', fontSize: 40 }} />;
      case 'cliente': return <PersonIcon sx={{ color: '#ff4081', fontSize: 40 }} />;
      case 'estoque': return <InventoryIcon sx={{ color: '#f44336', fontSize: 40 }} />;
      case 'pagamento': return <PaymentIcon sx={{ color: '#4caf50', fontSize: 40 }} />;
      case 'lembrete': return <TimeIcon sx={{ color: '#ff9800', fontSize: 40 }} />;
      case 'anamnese': return <AssignmentIcon sx={{ color: '#2196f3', fontSize: 40 }} />; // 🔥 NOVO
      default: return <InfoIcon sx={{ color: '#2196f3', fontSize: 40 }} />;
    }
  };

  // 🔥 FUNÇÃO PARA OBTER LABEL DO TIPO (ATUALIZADA)
  const getNotificationTypeLabel = (tipo) => {
    const labels = {
      agendamento: 'Agendamento',
      cliente: 'Cliente',
      estoque: 'Estoque',
      pagamento: 'Pagamento',
      lembrete: 'Lembrete',
      anamnese: 'Anamnese' // 🔥 NOVO
    };
    return labels[tipo] || 'Sistema';
  };

  // 🔥 FUNÇÃO PARA OBTER COR DO TIPO (ATUALIZADA)
  const getNotificationTypeColor = (tipo) => {
    const colors = {
      agendamento: '#9c27b0',
      cliente: '#ff4081',
      estoque: '#f44336',
      pagamento: '#4caf50',
      lembrete: '#ff9800',
      anamnese: '#2196f3' // 🔥 NOVO
    };
    return colors[tipo] || '#2196f3';
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleString('pt-BR');
    } catch {
      return '';
    }
  };

  const formatDateShort = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  // Renderização condicional
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={carregarNotificacoes}>
              Tentar novamente
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: 2 }}>
        <CircularProgress size={60} sx={{ color: '#9c27b0' }} />
        <Typography variant="body1" color="textSecondary">
          Carregando notificações...
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {usuario?.uid || usuario?.id ? `ID: ${usuario.uid || usuario.id}` : 'Aguardando usuário...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header com botão de recarregar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Notificações
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={carregarNotificacoes}
            disabled={loading || loadingAnamnese}
          >
            {loadingAnamnese ? 'Carregando...' : 'Recarregar'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Marcar todas como lidas ({unreadCount})
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDialog(true)}
            disabled={notifications.length === 0}
          >
            Limpar todas
          </Button>
        </Box>
      </Box>

      {/* Debug info (remover em produção) */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="caption" component="div">
          <strong>Debug:</strong> ID: {usuario?.uid || usuario?.id || 'N/A'} | 
          Notificações: {notifications.length} | 
          Anamnese Pendentes: {anamnesePendentes.length} |
          Carregado: {carregado ? 'Sim' : 'Não'}
        </Typography>
      </Paper>

      {/* 🔥 AVISO DE ANAMNESE PENDENTE */}
      {anamnesePendentes.length > 0 && (
        <Alert 
          severity="info" 
          icon={<AssignmentIcon />}
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => setFilterType('anamnese')}
            >
              Ver todos ({anamnesePendentes.length})
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>{anamnesePendentes.length} formulário(s) de anamnese</strong> pendente(s) para preenchimento antes dos atendimentos.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Total</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {countsByType.todos}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Não lidas</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {unreadCount}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card sx={{ bgcolor: '#f3e5f5' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Agendamentos</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {countsByType.agendamento}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Anamnese</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {countsByType.anamnese}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Filtros e Listagem */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                  <Tab label={`Todas (${countsByType.todos})`} />
                  <Tab label={`Não lidas (${unreadCount})`} />
                  <Tab label={`Lidas (${countsByType.todos - unreadCount})`} />
                </Tabs>
              </Box>

              {/* Filtros por tipo */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <FilterIcon color="action" />
                <Typography variant="body2">Filtrar:</Typography>
                {['todos', 'agendamento', 'cliente', 'estoque', 'pagamento', 'lembrete', 'anamnese'].map(tipo => (
                  <Badge
                    key={tipo}
                    badgeContent={tipo !== 'todos' ? countsByType[tipo] : 0}
                    color="primary"
                    invisible={tipo === 'todos' || countsByType[tipo] === 0}
                  >
                    <Chip
                      label={tipo === 'todos' ? 'Todos' : getNotificationTypeLabel(tipo)}
                      onClick={() => setFilterType(tipo)}
                      variant={filterType === tipo ? 'filled' : 'outlined'}
                      icon={tipo === 'anamnese' ? <AssignmentIcon /> : undefined}
                      sx={filterType === tipo ? {
                        bgcolor: tipo === 'todos' ? 'primary.main' : getNotificationTypeColor(tipo),
                        color: 'white'
                      } : {
                        color: tipo === 'todos' ? 'primary.main' : getNotificationTypeColor(tipo),
                        borderColor: tipo === 'todos' ? 'primary.main' : getNotificationTypeColor(tipo)
                      }}
                    />
                  </Badge>
                ))}
              </Box>

              {/* Lista de notificações */}
              {filteredNotifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <NotificationsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    {notifications.length === 0 
                      ? 'Nenhuma notificação encontrada' 
                      : 'Nenhuma notificação com os filtros selecionados'}
                  </Typography>
                  {notifications.length === 0 && (
                    <Button 
                      variant="contained" 
                      onClick={carregarNotificacoes}
                      sx={{ mt: 2, bgcolor: '#9c27b0' }}
                    >
                      Recarregar
                    </Button>
                  )}
                </Box>
              ) : (
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          mb: 2,
                          bgcolor: notification.lida ? 'transparent' : `${getNotificationTypeColor(notification.tipo)}10`,
                          borderLeft: !notification.lida ? `4px solid ${getNotificationTypeColor(notification.tipo)}` : 'none',
                          '&:hover': { boxShadow: 3 }
                        }}
                      >
                        <CardContent>
                          <Grid container spacing={2} alignItems="flex-start">
                            <Grid item xs={12} sm={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                              <Avatar sx={{ bgcolor: `${getNotificationTypeColor(notification.tipo)}20`, width: 56, height: 56 }}>
                                {getNotificationIcon(notification.tipo)}
                              </Avatar>
                            </Grid>
                            
                            <Grid item xs={12} sm={9}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label={getNotificationTypeLabel(notification.tipo)}
                                  size="small"
                                  sx={{
                                    bgcolor: `${getNotificationTypeColor(notification.tipo)}20`,
                                    color: getNotificationTypeColor(notification.tipo),
                                    fontWeight: 600,
                                  }}
                                />
                                {notification.prioridade === 'alta' && (
                                  <Chip 
                                    icon={<WarningIcon />} 
                                    label="Prioridade Alta" 
                                    size="small" 
                                    color="error" 
                                  />
                                )}
                                {!notification.lida && (
                                  <Chip icon={<TimeIcon />} label="Nova" size="small" color="secondary" />
                                )}
                              </Box>
                              
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {notification.titulo}
                              </Typography>
                              
                              <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                                {notification.mensagem}
                              </Typography>
                              
                              <Typography variant="caption" color="textSecondary">
                                {formatDate(notification.data)}
                              </Typography>

                              {notification.tipo === 'anamnese' && notification.detalhes && (
                                <Box sx={{ mt: 1 }}>
                                  <Chip
                                    size="small"
                                    label={`${notification.detalhes.dataFormatada} às ${notification.detalhes.horario}`}
                                    sx={{ mr: 1 }}
                                  />
                                  <Chip
                                    size="small"
                                    label={notification.detalhes.servicoNome}
                                    sx={{ bgcolor: '#e3f2fd' }}
                                  />
                                </Box>
                              )}
                            </Grid>
                            
                            <Grid item xs={12} sm={2}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Tooltip title="Ver detalhes">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewDetails(notification)}
                                    sx={{ color: '#9c27b0' }}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                {!notification.lida && (
                                  <Tooltip title="Marcar como lida">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      sx={{ color: '#4caf50' }}
                                    >
                                      <CheckIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Mais opções">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, notification)}
                                  >
                                    <MoreIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Menu de Ações */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {selectedNotification && !selectedNotification.lida && (
          <MenuItem onClick={() => {
            handleMarkAsRead(selectedNotification.id);
            handleCloseMenu();
          }}>
            <CheckIcon sx={{ mr: 1, fontSize: 20 }} /> Marcar como lida
          </MenuItem>
        )}
        {selectedNotification?.tipo === 'anamnese' && (
          <MenuItem onClick={() => {
            handleNavigate('anamnese', selectedNotification.detalhes);
            handleCloseMenu();
          }}>
            <AssignmentIcon sx={{ mr: 1, fontSize: 20, color: '#2196f3' }} /> Preencher formulário
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDelete(selectedNotification?.id)}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20, color: '#f44336' }} /> Excluir
        </MenuItem>
      </Menu>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: getNotificationTypeColor(notificationDetails?.tipo), color: 'white' }}>
          Detalhes da Notificação
        </DialogTitle>
        <DialogContent>
          {notificationDetails && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>{notificationDetails.titulo}</Typography>
              <Typography variant="body1" paragraph>{notificationDetails.mensagem}</Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2">
                <strong>Tipo:</strong> {getNotificationTypeLabel(notificationDetails.tipo)}
              </Typography>
              <Typography variant="body2">
                <strong>Data:</strong> {formatDate(notificationDetails.data)}
              </Typography>
              <Typography variant="body2">
                <strong>Prioridade:</strong> {notificationDetails.prioridade || 'normal'}
              </Typography>
              
              {notificationDetails.detalhes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>Detalhes adicionais:</Typography>
                  
                  {notificationDetails.tipo === 'anamnese' ? (
                    // 🔥 DETALHES ESPECÍFICOS PARA ANAMNESE
                    <>
                      <Typography variant="body2">
                        <strong>Cliente:</strong> {notificationDetails.detalhes.clienteNome}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Serviço:</strong> {notificationDetails.detalhes.servicoNome}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Profissional:</strong> {notificationDetails.detalhes.profissionalNome}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Data/Horário:</strong> {notificationDetails.detalhes.dataFormatada} às {notificationDetails.detalhes.horario}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Formulário:</strong> {notificationDetails.detalhes.formularioTitulo}
                      </Typography>
                    </>
                  ) : (
                    // DETALHES GERAIS
                    Object.entries(notificationDetails.detalhes).map(([key, value]) => (
                      <Typography key={key} variant="body2">
                        <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </Typography>
                    ))
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Fechar</Button>
          <Button
            variant="contained"
            onClick={() => handleNavigate(notificationDetails?.tipo, notificationDetails?.detalhes)}
            sx={{ bgcolor: getNotificationTypeColor(notificationDetails?.tipo) }}
          >
            {notificationDetails?.tipo === 'anamnese' ? 'Preencher Formulário' : 'Ir para'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔥 DIALOG DE ANAMNESE PENDENTE */}
      <Dialog open={openAnamneseDialog} onClose={() => setOpenAnamneseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon />
            <Typography variant="h6">Formulário de Anamnese Pendente</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAnamnese && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Este formulário precisa ser preenchido antes do atendimento.
              </Alert>

              <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Cliente
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedAnamnese.clienteNome}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Serviço
                    </Typography>
                    <Typography variant="body1">
                      {selectedAnamnese.servicoNome}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Profissional
                    </Typography>
                    <Typography variant="body1">
                      {selectedAnamnese.profissionalNome}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Data/Horário
                    </Typography>
                    <Typography variant="body1">
                      {formatDateShort(selectedAnamnese.data)} às {selectedAnamnese.horaInicio}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Formulário
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#2196f3' }}>
                      {selectedAnamnese.formularioTitulo}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAnamneseDialog(false)}>
            Fechar
          </Button>
          <Button
            variant="contained"
            onClick={() => handleIrParaAnamnese(selectedAnamnese?.agendamentoId)}
            sx={{ bgcolor: '#2196f3' }}
            startIcon={<QuizIcon />}
          >
            Preencher Formulário Agora
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Limpar todas as notificações
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Tem certeza que deseja remover todas as {notifications.length} notificações?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDeleteAll}>
            Limpar todas
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModernNotificacoes;
