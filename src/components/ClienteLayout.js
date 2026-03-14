// src/components/ClienteLayout.js
import React, { useState } from 'react';
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
  Fab,
  Zoom,
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthCliente } from '../contexts/AuthClienteContext';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/cliente/dashboard' },
  { text: 'Agendamentos', icon: <CalendarIcon />, path: '/cliente/agendamentos' },
  { text: 'Recompensas', icon: <GiftIcon />, path: '/cliente/recompensas' },
  { text: 'Meus Pontos', icon: <StarIcon />, path: '/cliente/pontos' },
  { text: 'Histórico', icon: <HistoryIcon />, path: '/cliente/historico' },
  { text: 'Perfil', icon: <PersonIcon />, path: '/cliente/perfil' },
];

function ClienteLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { cliente, logout } = useAuthCliente();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <Avatar
              src={cliente?.foto}
              sx={{ width: 32, height: 32, bgcolor: '#9c27b0' }}
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
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </Box>
    </Box>
  );
}

export default ClienteLayout;
