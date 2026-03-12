// src/pages/ModernNotificacoes.js - CORRIGIDO
import React, { useState, useEffect } from 'react';
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
  TextField,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { notificacoesService } from '../services/notificacoesService';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function ModernNotificacoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState(null);
  const [filterType, setFilterType] = useState('todos');
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUsuario(user);
      if (user?.uid) { // 🔥 CORRIGIDO: usar uid em vez de id
        carregarNotificacoes(user.uid);
      }
    }
  }, []);

  useEffect(() => {
    filtrarNotificacoes();
  }, [notifications, tabValue, filterType]);

  const carregarNotificacoes = async (usuarioId) => {
    try {
      setLoading(true);
      const data = await notificacoesService.listar(usuarioId);
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const filtrarNotificacoes = () => {
    let filtered = [...notifications];

    // Filtro por status (tabs)
    if (tabValue === 0) {
      // Todas
    } else if (tabValue === 1) {
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

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id) => {
    const success = await notificacoesService.marcarComoLida(id);
    if (success) {
      await carregarNotificacoes(usuario.uid); // 🔥 CORRIGIDO
      toast.success('Notificação marcada como lida');
    } else {
      toast.error('Erro ao marcar notificação');
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await notificacoesService.marcarTodasComoLidas(usuario.uid); // 🔥 CORRIGIDO
    if (success) {
      await carregarNotificacoes(usuario.uid);
      toast.success('Todas as notificações marcadas como lidas');
    } else {
      toast.error('Erro ao marcar notificações');
    }
  };

  const handleDelete = async (id) => {
    const success = await notificacoesService.excluir(id);
    if (success) {
      await carregarNotificacoes(usuario.uid); // 🔥 CORRIGIDO
      toast.success('Notificação removida');
    } else {
      toast.error('Erro ao remover notificação');
    }
    handleCloseMenu();
  };

  const handleDeleteAll = async () => {
    const success = await notificacoesService.excluirTodas(usuario.uid); // 🔥 CORRIGIDO
    if (success) {
      await carregarNotificacoes(usuario.uid);
      toast.success('Todas as notificações removidas');
    } else {
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

  // 🔥 FUNÇÃO CORRIGIDA PARA NAVEGAR CORRETAMENTE
  const handleNavigate = (link, tipo, detalhes) => {
    setOpenDetailsDialog(false);
    
    console.log('Navegando para:', { link, tipo, detalhes });
    
    // 🔥 CORREÇÃO: Para agendamentos e lembretes, vai para a lista
    if (tipo === 'agendamento' || tipo === 'lembrete') {
      navigate('/agendamentos');
    } 
    // 🔥 Para clientes, vai para a lista de clientes
    else if (tipo === 'cliente') {
      navigate('/clientes');
    }
    // 🔥 Para estoque, vai para o estoque
    else if (tipo === 'estoque') {
      navigate('/estoque');
    }
    // 🔥 Para pagamento, vai para o financeiro
    else if (tipo === 'pagamento') {
      navigate('/financeiro/receber');
    }
    // 🔥 Para atendimento, vai para o atendimento específico
    else if (tipo === 'atendimento' && detalhes?.id) {
      navigate(`/atendimento/${detalhes.id}`);
    }
    // 🔥 Fallback para outros casos
    else if (link) {
      navigate(link);
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'agendamento':
        return <EventIcon sx={{ color: '#9c27b0', fontSize: 40 }} />;
      case 'cliente':
        return <PersonIcon sx={{ color: '#ff4081', fontSize: 40 }} />;
      case 'estoque':
        return <InventoryIcon sx={{ color: '#f44336', fontSize: 40 }} />;
      case 'pagamento':
        return <PaymentIcon sx={{ color: '#4caf50', fontSize: 40 }} />;
      case 'lembrete':
        return <AccessTimeIcon sx={{ color: '#ff9800', fontSize: 40 }} />;
      default:
        return <InfoIcon sx={{ color: '#2196f3', fontSize: 40 }} />;
    }
  };

  const getNotificationTypeLabel = (tipo) => {
    switch (tipo) {
      case 'agendamento': return 'Agendamento';
      case 'cliente': return 'Cliente';
      case 'estoque': return 'Estoque';
      case 'pagamento': return 'Pagamento';
      case 'lembrete': return 'Lembrete';
      default: return 'Sistema';
    }
  };

  const getNotificationTypeColor = (tipo) => {
    switch (tipo) {
      case 'agendamento': return '#9c27b0';
      case 'cliente': return '#ff4081';
      case 'estoque': return '#f44336';
      case 'pagamento': return '#4caf50';
      case 'lembrete': return '#ff9800';
      default: return '#2196f3';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const renderDetalhesAgendamento = (detalhes) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, bgcolor: '#f3e5f5' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#9c27b0' }}>
            Informações do Agendamento
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Data</Typography>
              <Typography variant="body2">{detalhes.dataFormatada || detalhes.data}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Horário</Typography>
              <Typography variant="body2">{detalhes.horario}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Status</Typography>
              <Chip
                label={detalhes.status}
                size="small"
                color={detalhes.status === 'confirmado' ? 'success' : 
                       detalhes.status === 'pendente' ? 'warning' : 
                       detalhes.status === 'cancelado' ? 'error' : 'default'}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Origem</Typography>
              <Typography variant="body2">{detalhes.origem === 'site' ? 'Site' : 'Sistema'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#9c27b0' }}>
            Dados do Cliente
          </Typography>
          <Typography variant="body2"><strong>Nome:</strong> {detalhes.clienteNome}</Typography>
          {detalhes.clienteEmail && <Typography variant="body2"><strong>Email:</strong> {detalhes.clienteEmail}</Typography>}
          {detalhes.clienteTelefone && <Typography variant="body2"><strong>Telefone:</strong> {detalhes.clienteTelefone}</Typography>}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#9c27b0' }}>
            Dados do Serviço
          </Typography>
          <Typography variant="body2"><strong>Serviço:</strong> {detalhes.servicoNome}</Typography>
          {detalhes.servicoPreco && <Typography variant="body2"><strong>Valor:</strong> {formatCurrency(detalhes.servicoPreco)}</Typography>}
          {detalhes.servicoDuracao && <Typography variant="body2"><strong>Duração:</strong> {detalhes.servicoDuracao} min</Typography>}
          <Typography variant="body2"><strong>Profissional:</strong> {detalhes.profissionalNome}</Typography>
          {detalhes.profissionalEspecialidade && <Typography variant="body2"><strong>Especialidade:</strong> {detalhes.profissionalEspecialidade}</Typography>}
        </Paper>
      </Grid>

      {detalhes.observacoes && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#9c27b0' }}>
              Observações
            </Typography>
            <Typography variant="body2">{detalhes.observacoes}</Typography>
          </Paper>
        </Grid>
      )}
    </Grid>
  );

  const renderDetalhesCliente = (detalhes) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, bgcolor: '#f3e5f5' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#9c27b0' }}>
            Informações do Cliente
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Nome</Typography>
              <Typography variant="body2">{detalhes.nome}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Status</Typography>
              <Chip
                label={detalhes.status}
                size="small"
                color={detalhes.status === 'VIP' ? 'secondary' : 
                       detalhes.status === 'Regular' ? 'primary' : 'default'}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Email</Typography>
              <Typography variant="body2">{detalhes.email}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Telefone</Typography>
              <Typography variant="body2">{detalhes.telefone}</Typography>
            </Grid>
            {detalhes.cpf && (
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">CPF</Typography>
                <Typography variant="body2">{detalhes.cpf}</Typography>
              </Grid>
            )}
            {detalhes.dataNascimento && (
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Data Nasc.</Typography>
                <Typography variant="body2">{detalhes.dataNascimento}</Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">Data Cadastro</Typography>
              <Typography variant="body2">{new Date(detalhes.dataCadastro).toLocaleDateString('pt-BR')}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderDetalhesEstoque = (detalhes) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#f44336' }}>
            Alerta de Estoque Baixo
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Produto</Typography>
              <Typography variant="body2"><strong>{detalhes.nome}</strong></Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Código</Typography>
              <Typography variant="body2">{detalhes.codigo}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Categoria</Typography>
              <Typography variant="body2">{detalhes.categoria}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Localização</Typography>
              <Typography variant="body2">{detalhes.localizacao}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="textSecondary">Estoque Atual</Typography>
              <Typography variant="h6" color="error">{detalhes.quantidadeEstoque} unid.</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="textSecondary">Estoque Mínimo</Typography>
              <Typography variant="h6">{detalhes.estoqueMinimo} unid.</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="textSecondary">Fornecedor</Typography>
              <Typography variant="body2">{detalhes.fornecedor}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Preço Custo</Typography>
              <Typography variant="body2">{formatCurrency(detalhes.precoCusto)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Preço Venda</Typography>
              <Typography variant="body2">{formatCurrency(detalhes.precoVenda)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderDetalhesPagamento = (detalhes) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#4caf50' }}>
            Pagamento Recebido
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Cliente</Typography>
              <Typography variant="body2"><strong>{detalhes.clienteNome}</strong></Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Valor</Typography>
              <Typography variant="h6" color="#4caf50">{formatCurrency(detalhes.valor)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Forma de Pagamento</Typography>
              <Typography variant="body2">{detalhes.formaPagamentoLabel}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Parcelas</Typography>
              <Typography variant="body2">{detalhes.parcelas}x</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Data</Typography>
              <Typography variant="body2">{detalhes.dataFormatada}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Status</Typography>
              <Chip label={detalhes.status} size="small" color="success" />
            </Grid>
            {detalhes.observacoes && (
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">Observações</Typography>
                <Typography variant="body2">{detalhes.observacoes}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderDetalhesLembrete = (detalhes) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#ff9800' }}>
            Lembrete de Agendamento
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Cliente</Typography>
              <Typography variant="body2"><strong>{detalhes.clienteNome}</strong></Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Data</Typography>
              <Typography variant="body2"><strong>{detalhes.dataFormatada}</strong> às {detalhes.horario}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Serviço</Typography>
              <Typography variant="body2">{detalhes.servicoNome}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Profissional</Typography>
              <Typography variant="body2">{detalhes.profissionalNome}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderDetalhes = () => {
    if (!notificationDetails || !notificationDetails.detalhes) return null;

    switch (notificationDetails.tipo) {
      case 'agendamento':
        return renderDetalhesAgendamento(notificationDetails.detalhes);
      case 'cliente':
        return renderDetalhesCliente(notificationDetails.detalhes);
      case 'estoque':
        return renderDetalhesEstoque(notificationDetails.detalhes);
      case 'pagamento':
        return renderDetalhesPagamento(notificationDetails.detalhes);
      case 'lembrete':
        return renderDetalhesLembrete(notificationDetails.detalhes);
      default:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2">Detalhes não disponíveis</Typography>
              </Paper>
            </Grid>
          </Grid>
        );
    }
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Notificações
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Marcar todas como lidas
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

      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {notifications.length}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Não lidas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {unreadCount}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: '#f3e5f5' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Agendamentos
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {notifications.filter(n => n.tipo === 'agendamento').length}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Alertas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {notifications.filter(n => n.tipo === 'estoque' || n.tipo === 'alerta').length}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Filtros e Listagem */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                  <Tab label="Todas" />
                  <Tab label={`Não lidas (${unreadCount})`} />
                  <Tab label="Lidas" />
                </Tabs>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <FilterIcon color="action" />
                <Typography variant="body2">Filtrar por tipo:</Typography>
                <Chip
                  label="Todos"
                  onClick={() => setFilterType('todos')}
                  variant={filterType === 'todos' ? 'filled' : 'outlined'}
                  color="primary"
                />
                <Chip
                  label="Agendamento"
                  onClick={() => setFilterType('agendamento')}
                  variant={filterType === 'agendamento' ? 'filled' : 'outlined'}
                  sx={{ color: '#9c27b0', borderColor: '#9c27b0' }}
                />
                <Chip
                  label="Cliente"
                  onClick={() => setFilterType('cliente')}
                  variant={filterType === 'cliente' ? 'filled' : 'outlined'}
                  sx={{ color: '#ff4081', borderColor: '#ff4081' }}
                />
                <Chip
                  label="Estoque"
                  onClick={() => setFilterType('estoque')}
                  variant={filterType === 'estoque' ? 'filled' : 'outlined'}
                  sx={{ color: '#f44336', borderColor: '#f44336' }}
                />
                <Chip
                  label="Pagamento"
                  onClick={() => setFilterType('pagamento')}
                  variant={filterType === 'pagamento' ? 'filled' : 'outlined'}
                  sx={{ color: '#4caf50', borderColor: '#4caf50' }}
                />
                <Chip
                  label="Lembrete"
                  onClick={() => setFilterType('lembrete')}
                  variant={filterType === 'lembrete' ? 'filled' : 'outlined'}
                  sx={{ color: '#ff9800', borderColor: '#ff9800' }}
                />
              </Box>

              {filteredNotifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <NotificationsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    Nenhuma notificação encontrada
                  </Typography>
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
                          bgcolor: notification.lida ? 'transparent' : '#f3e5f5',
                          position: 'relative',
                          borderLeft: !notification.lida ? '4px solid #9c27b0' : 'none',
                          '&:hover': {
                            boxShadow: 3,
                          },
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
                                {!notification.lida && (
                                  <Chip
                                    icon={<TimeIcon />}
                                    label="Nova"
                                    size="small"
                                    color="secondary"
                                  />
                                )}
                                {notification.origem === 'site' && (
                                  <Chip
                                    label="Site"
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                  />
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
                            </Grid>
                            
                            <Grid item xs={12} sm={2}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(notification)}
                                  sx={{ color: '#9c27b0' }}
                                  title="Ver detalhes"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                                {!notification.lida && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    sx={{ color: '#4caf50' }}
                                    title="Marcar como lida"
                                  >
                                    <CheckIcon />
                                  </IconButton>
                                )}
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, notification)}
                                >
                                  <MoreIcon />
                                </IconButton>
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {selectedNotification && !selectedNotification.lida && (
          <MenuItem onClick={() => {
            handleMarkAsRead(selectedNotification.id);
            handleCloseMenu();
          }}>
            <CheckIcon sx={{ mr: 1, fontSize: 20 }} /> Marcar como lida
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleDelete(selectedNotification?.id);
        }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20, color: '#f44336' }} /> Excluir
        </MenuItem>
      </Menu>

      {/* Dialog de Detalhes - CORRIGIDO */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes da Notificação
        </DialogTitle>
        <DialogContent>
          {notificationDetails && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {notificationDetails.titulo}
              </Typography>
              <Typography variant="body1" paragraph>
                {notificationDetails.mensagem}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {renderDetalhes()}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="caption" color="textSecondary" display="block">
                Recebido em: {formatDate(notificationDetails.data)}
              </Typography>
              {notificationDetails.detalhes?.criadoEm && (
                <Typography variant="caption" color="textSecondary" display="block">
                  Processado em: {notificationDetails.detalhes.criadoEm}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Fechar</Button>
          
          {/* 🔥 BOTÃO CORRIGIDO PARA AGENDAMENTOS */}
          {notificationDetails?.tipo === 'agendamento' && (
            <Button
              variant="contained"
              onClick={() => handleNavigate('/agendamentos', 'agendamento', notificationDetails.detalhes)}
              sx={{ bgcolor: '#9c27b0' }}
            >
              Ver Agendamentos
            </Button>
          )}
          
          {/* 🔥 BOTÃO PARA LEMBRETES */}
          {notificationDetails?.tipo === 'lembrete' && (
            <Button
              variant="contained"
              onClick={() => handleNavigate('/agendamentos', 'lembrete', notificationDetails.detalhes)}
              sx={{ bgcolor: '#ff9800' }}
            >
              Ver Agenda
            </Button>
          )}
          
          {/* 🔥 BOTÃO PARA CLIENTES */}
          {notificationDetails?.tipo === 'cliente' && (
            <Button
              variant="contained"
              onClick={() => handleNavigate('/clientes', 'cliente', notificationDetails.detalhes)}
              sx={{ bgcolor: '#ff4081' }}
            >
              Ver Clientes
            </Button>
          )}
          
          {/* 🔥 BOTÃO PARA ESTOQUE */}
          {notificationDetails?.tipo === 'estoque' && (
            <Button
              variant="contained"
              onClick={() => handleNavigate('/estoque', 'estoque', notificationDetails.detalhes)}
              sx={{ bgcolor: '#f44336' }}
            >
              Ver Estoque
            </Button>
          )}
          
          {/* 🔥 BOTÃO PARA PAGAMENTO */}
          {notificationDetails?.tipo === 'pagamento' && (
            <Button
              variant="contained"
              onClick={() => handleNavigate('/financeiro/receber', 'pagamento', notificationDetails.detalhes)}
              sx={{ bgcolor: '#4caf50' }}
            >
              Ver Financeiro
            </Button>
          )}
          
          {/* 🔥 BOTÃO PARA ATENDIMENTO */}
          {notificationDetails?.tipo === 'atendimento' && notificationDetails?.detalhes?.id && (
            <Button
              variant="contained"
              onClick={() => handleNavigate(`/atendimento/${notificationDetails.detalhes.id}`, 'atendimento', notificationDetails.detalhes)}
              sx={{ bgcolor: '#2196f3' }}
            >
              Ver Atendimento
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Limpar todas as notificações
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Tem certeza que deseja remover todas as notificações?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAll}
          >
            Limpar todas
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModernNotificacoes;
