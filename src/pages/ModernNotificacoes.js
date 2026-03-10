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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';

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
    const user = usuariosService.getUsuarioAtual();
    setUsuario(user);
    if (user) {
      carregarNotificacoes(user.id);
    }
  }, []);

  useEffect(() => {
    filtrarNotificacoes();
  }, [notifications, tabValue, filterType]);

  const carregarNotificacoes = async (usuarioId) => {
    try {
      setLoading(true);
      // Usar o ID do usuário passado como parâmetro
      const data = await firebaseService.query('notificacoes', [
        { field: 'usuarioId', operator: '==', value: usuarioId }
      ], 'data');
      
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };
  
  // No useEffect
  useEffect(() => {
    const user = usuariosService.getUsuarioAtual();
    setUsuario(user);
    if (user && user.uid) { // Usar user.uid
      carregarNotificacoes(user.uid);
    }
  }, []);

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
      const dateA = a.data?.toDate ? a.data.toDate() : new Date(a.data);
      const dateB = b.data?.toDate ? b.data.toDate() : new Date(b.data);
      return dateB - dateA;
    });

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await firebaseService.update('notificacoes', id, { 
        lida: true,
        updatedAt: new Date().toISOString()
      });
      await carregarNotificacoes(usuario.id);
      toast.success('Notificação marcada como lida');
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
      toast.error('Erro ao marcar notificação');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const naoLidas = notifications.filter(n => !n.lida);
      
      const promises = naoLidas.map(n => 
        firebaseService.update('notificacoes', n.id, { 
          lida: true,
          updatedAt: new Date().toISOString()
        })
      );
      
      await Promise.all(promises);
      await carregarNotificacoes(usuario.id);
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar notificações:', error);
      toast.error('Erro ao marcar notificações');
    }
  };

  const handleDelete = async (id) => {
    try {
      await firebaseService.delete('notificacoes', id);
      await carregarNotificacoes(usuario.id);
      toast.success('Notificação removida');
      handleCloseMenu();
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
      toast.error('Erro ao remover notificação');
    }
  };

  const handleDeleteAll = async () => {
    try {
      const promises = notifications.map(n => firebaseService.delete('notificacoes', n.id));
      await Promise.all(promises);
      await carregarNotificacoes(usuario.id);
      toast.success('Todas as notificações removidas');
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao remover notificações:', error);
      toast.error('Erro ao remover notificações');
    }
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
      default:
        return <InfoIcon sx={{ color: '#2196f3', fontSize: 40 }} />;
    }
  };

  const getNotificationTypeLabel = (tipo) => {
    switch (tipo) {
      case 'agendamento': return 'Agendamento';
      case 'cliente': return 'Cliente';
      case 'estoque': return 'Estoque';
      case 'lembrete': return 'Lembrete';
      default: return 'Sistema';
    }
  };

  const getNotificationTypeColor = (tipo) => {
    switch (tipo) {
      case 'agendamento': return '#9c27b0';
      case 'cliente': return '#ff4081';
      case 'estoque': return '#f44336';
      case 'lembrete': return '#ff9800';
      default: return '#2196f3';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (date.toDate) {
      return date.toDate().toLocaleString('pt-BR');
    }
    return new Date(date).toLocaleString('pt-BR');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
        <Grid item xs={12} md={3}>
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
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Não lidas
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff4081' }}>
                {unreadCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Agendamentos
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {notifications.filter(n => n.tipo === 'agendamento').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Alertas
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#f44336' }}>
                {notifications.filter(n => n.tipo === 'estoque').length}
              </Typography>
            </CardContent>
          </Card>
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

              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
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
                          '&:hover': {
                            boxShadow: 2,
                          },
                        }}
                      >
                        <CardContent>
                          <Grid container spacing={2} alignItems="flex-start">
                            <Grid item xs={12} sm={1}>
                              {getNotificationIcon(notification.tipo)}
                            </Grid>
                            
                            <Grid item xs={12} sm={8}>
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
                            
                            <Grid item xs={12} sm={3}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                {!notification.lida && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    color="success"
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
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
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
