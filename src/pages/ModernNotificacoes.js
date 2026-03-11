// src/pages/ModernNotificacoes.js
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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { notificacoesService } from '../services/notificacoesService';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function ModernNotificacoes() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterType, setFilterType] = useState('todos');
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUsuario(user);
      if (user?.id) {
        carregarNotificacoes(user.id);
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
      await carregarNotificacoes(usuario.id);
      toast.success('Notificação marcada como lida');
    } else {
      toast.error('Erro ao marcar notificação');
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await notificacoesService.marcarTodasComoLidas(usuario.id);
    if (success) {
      await carregarNotificacoes(usuario.id);
      toast.success('Todas as notificações marcadas como lidas');
    } else {
      toast.error('Erro ao marcar notificações');
    }
  };

  const handleDelete = async (id) => {
    const success = await notificacoesService.excluir(id);
    if (success) {
      await carregarNotificacoes(usuario.id);
      toast.success('Notificação removida');
    } else {
      toast.error('Erro ao remover notificação');
    }
    handleCloseMenu();
  };

  const handleDeleteAll = async () => {
    const success = await notificacoesService.excluirTodas(usuario.id);
    if (success) {
      await carregarNotificacoes(usuario.id);
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
