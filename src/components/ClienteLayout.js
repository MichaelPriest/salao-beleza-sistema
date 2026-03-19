// src/components/ClienteLayout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  Badge,
  Menu,
  MenuItem,
  Popover,
  Button,
  Paper,
} from '@mui/material';
import {
  // Ícones de Menu e Navegação
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Spa as SpaIcon,
  
  // Ícones de Notificações
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon,
  EmojiEvents as TrophyIcon,
  Redeem as RedeemIcon,
  Info as InfoIcon,
  
  // Ícones de Anamnese
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Checklist as ChecklistIcon,
  
  // Ícones Auxiliares
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { notificacoesPushService } from '../services/notificacoesPushService';
import { firebaseService } from '../services/firebase';

// ============================================
// CONSTANTES
// ============================================

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/cliente/dashboard' },
  { text: 'Agendamentos', icon: <CalendarIcon />, path: '/cliente/agendamentos' },
  { text: 'Recompensas', icon: <GiftIcon />, path: '/cliente/recompensas' },
  { text: 'Meus Pontos', icon: <StarIcon />, path: '/cliente/pontos' },
  { text: 'Histórico', icon: <HistoryIcon />, path: '/cliente/historico' },
  { text: 'Perfil', icon: <PersonIcon />, path: '/cliente/perfil' },
  { text: 'Notificações', icon: <NotificationsIcon />, path: '/cliente/notificacoes' },
  { text: 'Anamnese', icon: <AssignmentIcon />, path: '/cliente/anamnese' },
];

const NOTIFICATION_ICONS = {
  agendamento: <EventIcon sx={{ color: '#9c27b0' }} />,
  pontos: <StarIcon sx={{ color: '#ff9800' }} />,
  nivel: <TrophyIcon sx={{ color: '#4caf50' }} />,
  recompensa: <GiftIcon sx={{ color: '#ff4081' }} />,
  resgate: <RedeemIcon sx={{ color: '#2196f3' }} />,
  lembrete: <EventIcon sx={{ color: '#ff9800' }} />,
  formulario: <AssignmentIcon sx={{ color: '#9c27b0' }} />,
  default: <InfoIcon sx={{ color: '#2196f3' }} />,
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function ClienteLayout() {
  // ==========================================
  // HOOKS
  // ==========================================
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { cliente, logout, firebaseUser } = useAuthCliente();

  // ==========================================
  // ESTADOS
  // ==========================================
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Estados de Notificações
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [notificacoesAnchor, setNotificacoesAnchor] = useState(null);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(false);
  
  // Estados de Anamnese
  const [formulariosPendentes, setFormulariosPendentes] = useState(0);

  // ==========================================
  // EFEITOS
  // ==========================================
  useEffect(() => {
    console.log('📌 ClienteLayout - useEffect iniciado');
    console.log('📌 Cliente:', cliente);
    
    if (!cliente) {
      console.log('📌 ClienteLayout - aguardando cliente...');
      return;
    }

    console.log('📌 ClienteLayout - carregando dados...');
    
    // Carregar notificações e formulários pendentes
    Promise.all([
      carregarNotificacoes().catch(err => {
        console.error('❌ Erro ao carregar notificações:', err);
        return [];
      }),
      verificarFormulariosPendentes().catch(err => {
        console.error('❌ Erro ao verificar formulários:', err);
        return 0;
      })
    ]).then(([notifData, pendentes]) => {
      console.log('✅ Dados carregados - Notificações:', notifData?.length);
      console.log('✅ Dados carregados - Formulários pendentes:', pendentes);
    });

    // Inscrever para receber atualizações em tempo real
    const unsubscribe = notificacoesPushService.inscrever((notificacao) => {
      console.log('📨 Nova notificação recebida:', notificacao);
      
      if (notificacao.tipo === 'contagem') {
        setNotificacoesNaoLidas(notificacao.quantidade);
      } else if (notificacao.tipo === 'nova') {
        setNotificacoes(prev => [notificacao.dados, ...prev]);
        setNotificacoesNaoLidas(prev => prev + 1);
      }
    });
    
    return unsubscribe;
  }, [cliente]);

  // ==========================================
  // FUNÇÕES DE NOTIFICAÇÕES
  // ==========================================
  
  const carregarNotificacoes = async () => {
    if (!cliente?.id) return [];
    
    try {
      setLoadingNotificacoes(true);
      const uid = firebaseUser?.uid || cliente?.id;
      console.log('🔍 Buscando notificações para cliente:', uid);
      
      const data = await notificacoesPushService.buscarNotificacoes(uid);
      console.log('✅ Notificações carregadas:', data?.length);
      
      setNotificacoes(data);
      const naoLidas = data.filter(n => !n.lida).length;
      setNotificacoesNaoLidas(naoLidas);
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      return [];
    } finally {
      setLoadingNotificacoes(false);
    }
  };

  const handleNotificacoesClick = (event) => {
    setNotificacoesAnchor(event.currentTarget);
  };

  const handleNotificacoesClose = () => {
    setNotificacoesAnchor(null);
  };

  const handleNotificacaoClick = async (notificacao) => {
    if (!notificacao.lida) {
      await notificacoesPushService.marcarComoLida(notificacao.id);
      setNotificacoes(prev =>
        prev.map(n => n.id === notificacao.id ? { ...n, lida: true } : n)
      );
      setNotificacoesNaoLidas(prev => Math.max(0, prev - 1));
    }
    
    if (notificacao.link) {
      navigate(notificacao.link);
    }
    
    handleNotificacoesClose();
  };

  const handleMarcarTodasComoLidas = async () => {
    const uid = firebaseUser?.uid || cliente?.id;
    await notificacoesPushService.marcarTodasComoLidas(uid);
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    setNotificacoesNaoLidas(0);
  };

  const getIconeNotificacao = (tipo) => {
    return NOTIFICATION_ICONS[tipo] || NOTIFICATION_ICONS.default;
  };

  // ==========================================
  // FUNÇÕES DE ANAMNESE
  // ==========================================

  const verificarFormulariosPendentes = async () => {
    if (!cliente?.id) return 0;
    
    try {
      const uid = firebaseUser?.uid || cliente?.id;
      const hoje = new Date().toISOString().split('T')[0];
      
      // Buscar agendamentos futuros do cliente
      let agendamentos = [];
      
      // Buscar agendamentos confirmados
      try {
        const confirmados = await firebaseService.query('agendamentos', [
          { field: 'clienteId', operator: '==', value: uid },
          { field: 'data', operator: '>=', value: hoje },
          { field: 'status', operator: '==', value: 'confirmado' }
        ]);
        agendamentos = [...agendamentos, ...confirmados];
      } catch (err) {
        console.log('⚠️ Erro ao buscar confirmados:', err);
      }
      
      // Buscar agendamentos pendentes
      try {
        const pendentes = await firebaseService.query('agendamentos', [
          { field: 'clienteId', operator: '==', value: uid },
          { field: 'data', operator: '>=', value: hoje },
          { field: 'status', operator: '==', value: 'pendente' }
        ]);
        agendamentos = [...agendamentos, ...pendentes];
      } catch (err) {
        console.log('⚠️ Erro ao buscar pendentes:', err);
      }
      
      let pendentesCount = 0;
      
      for (const agendamento of agendamentos) {
        try {
          const formularios = await firebaseService.query('formularios_anamnese', [
            { field: 'servicoIds', operator: 'array-contains', value: agendamento.servicoId },
            { field: 'ativo', operator: '==', value: true }
          ]).catch(() => []);
          
          if (formularios.length > 0) {
            const respostas = await firebaseService.query('respostas_anamnese', [
              { field: 'agendamentoId', operator: '==', value: agendamento.id }
            ]).catch(() => []);
            
            if (respostas.length === 0) {
              pendentesCount++;
            }
          }
        } catch (e) {
          console.log('Erro ao verificar formulário para agendamento:', agendamento.id);
        }
      }
      
      setFormulariosPendentes(pendentesCount);
      return pendentesCount;
    } catch (error) {
      console.error('Erro ao verificar formulários pendentes:', error);
      return 0;
    }
  };

  const irParaPrimeiroFormularioPendente = async () => {
    try {
      const uid = firebaseUser?.uid || cliente?.id;
      const hoje = new Date().toISOString().split('T')[0];
      
      // Buscar agendamentos futuros do cliente
      let agendamentos = [];
      
      // Buscar agendamentos confirmados
      try {
        const confirmados = await firebaseService.query('agendamentos', [
          { field: 'clienteId', operator: '==', value: uid },
          { field: 'data', operator: '>=', value: hoje },
          { field: 'status', operator: '==', value: 'confirmado' }
        ]);
        agendamentos = [...agendamentos, ...confirmados];
      } catch (err) {
        console.log('⚠️ Erro ao buscar confirmados:', err);
      }
      
      // Buscar agendamentos pendentes
      try {
        const pendentes = await firebaseService.query('agendamentos', [
          { field: 'clienteId', operator: '==', value: uid },
          { field: 'data', operator: '>=', value: hoje },
          { field: 'status', operator: '==', value: 'pendente' }
        ]);
        agendamentos = [...agendamentos, ...pendentes];
      } catch (err) {
        console.log('⚠️ Erro ao buscar pendentes:', err);
      }
      
      // Ordenar por data
      agendamentos.sort((a, b) => a.data.localeCompare(b.data));
      
      for (const agendamento of agendamentos) {
        try {
          const formularios = await firebaseService.query('formularios_anamnese', [
            { field: 'servicoIds', operator: 'array-contains', value: agendamento.servicoId },
            { field: 'ativo', operator: '==', value: true }
          ]).catch(() => []);
          
          if (formularios.length > 0) {
            const respostas = await firebaseService.query('respostas_anamnese', [
              { field: 'agendamentoId', operator: '==', value: agendamento.id }
            ]).catch(() => []);
            
            if (respostas.length === 0) {
              navigate(`/cliente/agendamento/${agendamento.id}/anamnese`);
              return;
            }
          }
        } catch (e) {
          console.log('Erro ao verificar formulário:', e);
        }
      }
      
      navigate('/cliente/anamnese');
    } catch (error) {
      console.error('Erro ao redirecionar para formulário:', error);
      navigate('/cliente/anamnese');
    }
  };

  // ==========================================
  // FUNÇÕES AUXILIARES
  // ==========================================

  const formatarData = (data) => {
    if (!data) return '';
    try {
      const date = new Date(data);
      const agora = new Date();
      const diff = Math.floor((agora - date) / 1000);
      
      if (diff < 60) return 'agora';
      if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} h atrás`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} d atrás`;
      
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/cliente/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ==========================================
  // COMPONENTE DO DRAWER
  // ==========================================

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SpaIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            BeautyPro
          </Typography>
        </Box>
      </Box>

      {/* Perfil */}
      <Box sx={{ p: 2, bgcolor: '#faf5ff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={cliente?.foto}
            sx={{
              width: 48,
              height: 48,
              bgcolor: '#9c27b0',
            }}
          >
            {!cliente?.foto && getInitials(cliente?.nome)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Bem-vindo(a)
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {cliente?.nome?.split(' ')[0] || 'Cliente'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Menu */}
      <List sx={{ flex: 1, p: 1 }}>
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const isAnamnese = item.text === 'Anamnese';
          const badgeCount = isAnamnese ? formulariosPendentes : 0;
          
          return (
            <ListItem
              key={item.text}
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: isActive ? '#f3e5f5' : 'transparent',
                color: isActive ? '#9c27b0' : 'inherit',
                '&:hover': {
                  bgcolor: '#f3e5f5',
                },
                '& .MuiListItemIcon-root': {
                  color: isActive ? '#9c27b0' : 'inherit',
                },
              }}
            >
              <ListItemIcon>
                {badgeCount > 0 ? (
                  <Badge badgeContent={badgeCount} color="secondary">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {badgeCount > 0 && (
                <Typography variant="caption" sx={{ color: '#9c27b0', fontWeight: 600 }}>
                  {badgeCount}
                </Typography>
              )}
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Logout */}
      <ListItem
        button
        onClick={handleLogout}
        sx={{
          m: 1,
          borderRadius: 2,
          color: '#f44336',
          '&:hover': {
            bgcolor: '#ffebee',
          },
        }}
      >
        <ListItemIcon sx={{ color: '#f44336' }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Sair" />
      </ListItem>
    </Box>
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar Mobile */}
      {isMobile && (
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', color: '#9c27b0' }}>
              BeautyPro
            </Typography>
            
            <IconButton color="inherit" onClick={handleNotificacoesClick}>
              <Badge badgeContent={notificacoesNaoLidas} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <Avatar
              src={cliente?.foto}
              sx={{ width: 32, height: 32, bgcolor: '#9c27b0', ml: 1 }}
            >
              {!cliente?.foto && getInitials(cliente?.nome)}
            </Avatar>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              borderRight: 'none',
              boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Drawer Mobile */}
      <SwipeableDrawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        onOpen={() => {}}
        disableBackdropTransition
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: '#ffffff',
          },
        }}
      >
        {drawer}
      </SwipeableDrawer>

      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 2 : 3,
          pt: isMobile ? '80px' : 3,
          backgroundColor: '#faf5ff',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        {/* Notificações Desktop */}
        {!isMobile && (
          <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
            <IconButton
              onClick={handleNotificacoesClick}
              sx={{
                bgcolor: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <Badge badgeContent={notificacoesNaoLidas} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
        )}

        {/* Badge de Formulários Pendentes */}
        {formulariosPendentes > 0 && (
          <Box
            sx={{
              position: 'fixed',
              top: isMobile ? 70 : 80,
              right: 20,
              zIndex: 999,
              cursor: 'pointer',
            }}
            onClick={irParaPrimeiroFormularioPendente}
          >
            <Paper
              elevation={3}
              sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#fff3e0',
                borderRadius: 2,
                border: '1px solid #ff9800',
                '&:hover': {
                  bgcolor: '#ffe0b2',
                },
              }}
            >
              <Badge badgeContent={formulariosPendentes} color="warning">
                <AssignmentIcon sx={{ color: '#ff9800' }} />
              </Badge>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                Formulário{formulariosPendentes > 1 ? 's' : ''} pendente{formulariosPendentes > 1 ? 's' : ''}
              </Typography>
            </Paper>
          </Box>
        )}

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </Box>

      {/* Popover de Notificações */}
      <Popover
        open={Boolean(notificacoesAnchor)}
        anchorEl={notificacoesAnchor}
        onClose={handleNotificacoesClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notificações
          </Typography>
          {notificacoesNaoLidas > 0 && (
            <Button size="small" onClick={handleMarcarTodasComoLidas}>
              Marcar todas como lidas
            </Button>
          )}
        </Box>
        <Divider />
        
        {loadingNotificacoes ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">Carregando...</Typography>
          </Box>
        ) : notificacoes.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Nenhuma notificação
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notificacoes.slice(0, 5).map((notificacao) => (
              <React.Fragment key={notificacao.id}>
                <ListItem
                  button
                  onClick={() => handleNotificacaoClick(notificacao)}
                  sx={{
                    bgcolor: notificacao.lida ? 'transparent' : '#f3e5f5',
                    py: 1.5,
                  }}
                >
                  <ListItemIcon>
                    {getIconeNotificacao(notificacao.tipo)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {notificacao.titulo}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {notificacao.mensagem}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatarData(notificacao.data)}
                        </Typography>
                      </>
                    }
                  />
                  {!notificacao.lida && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9c27b0', ml: 1 }} />
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {notificacoes.length > 5 && (
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Button size="small" onClick={() => navigate('/cliente/notificacoes')}>
                  Ver todas ({notificacoes.length})
                </Button>
              </Box>
            )}
          </List>
        )}
      </Popover>
    </Box>
  );
}

export default ClienteLayout;
