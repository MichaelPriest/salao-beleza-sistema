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
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Spa as SpaIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon,
  EmojiEvents as TrophyIcon,
  Redeem as RedeemIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { notificacoesPushService } from '../services/notificacoesPushService';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/cliente/dashboard' },
  { text: 'Agendamentos', icon: <CalendarIcon />, path: '/cliente/agendamentos' },
  { text: 'Recompensas', icon: <GiftIcon />, path: '/cliente/recompensas' },
  { text: 'Meus Pontos', icon: <StarIcon />, path: '/cliente/pontos' },
  { text: 'Histórico', icon: <HistoryIcon />, path: '/cliente/historico' },
  { text: 'Perfil', icon: <PersonIcon />, path: '/cliente/perfil' },
  { text: 'Notificações', icon: <NotificationsIcon />, path: '/cliente/notificacoes' }, // NOVO
];

function ClienteLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { cliente, logout, firebaseUser } = useAuthCliente();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // 🔥 ESTADOS PARA NOTIFICAÇÕES
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [notificacoesAnchor, setNotificacoesAnchor] = useState(null);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(false);

  useEffect(() => {
    if (cliente) {
      carregarNotificacoes();
      
      // Inscrever para receber atualizações em tempo real
      const unsubscribe = notificacoesPushService.inscrever((notificacao) => {
        if (notificacao.tipo === 'contagem') {
          setNotificacoesNaoLidas(notificacao.quantidade);
        } else if (notificacao.tipo === 'nova') {
          setNotificacoes(prev => [notificacao.dados, ...prev]);
          setNotificacoesNaoLidas(prev => prev + 1);
        }
      });
      
      return unsubscribe;
    }
  }, [cliente]);

  const carregarNotificacoes = async () => {
    if (!cliente?.id) return;
    
    try {
      setLoadingNotificacoes(true);
      const uid = firebaseUser?.uid || cliente?.id;
      const data = await notificacoesPushService.buscarNotificacoes(uid);
      setNotificacoes(data);
      setNotificacoesNaoLidas(data.filter(n => !n.lida).length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
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
    switch(tipo) {
      case 'agendamento': return <EventIcon sx={{ color: '#9c27b0' }} />;
      case 'pontos': return <StarIcon sx={{ color: '#ff9800' }} />;
      case 'nivel': return <TrophyIcon sx={{ color: '#4caf50' }} />;
      case 'recompensa': return <GiftIcon sx={{ color: '#ff4081' }} />;
      case 'resgate': return <RedeemIcon sx={{ color: '#2196f3' }} />;
      case 'lembrete': return <EventIcon sx={{ color: '#ff9800' }} />;
      default: return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    try {
      const date = new Date(data);
      const agora = new Date();
      const diff = Math.floor((agora - date) / 1000); // diferença em segundos
      
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

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header do Drawer */}
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

      {/* Perfil do Cliente */}
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

      {/* Menu Itens */}
      <List sx={{ flex: 1, p: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
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
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Botão de Sair */}
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar para mobile */}
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
            
            {/* 🔥 ÍCONE DE NOTIFICAÇÕES MOBILE */}
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

      {/* Drawer para desktop */}
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

      {/* Drawer para mobile */}
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
        }}
      >
        {/* 🔥 ÍCONE DE NOTIFICAÇÕES DESKTOP (fora do drawer) */}
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

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </Box>

      {/* 🔥 POPOVER DE NOTIFICAÇÕES */}
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
