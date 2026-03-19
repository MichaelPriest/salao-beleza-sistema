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
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Checklist as ChecklistIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { notificacoesPushService } from '../services/notificacoesPushService';
import { firebaseService } from '../services/firebase';

// MENU ATUALIZADO COM OPÇÃO DE ANAMNESE
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/cliente/dashboard' },
  { text: 'Agendamentos', icon: <CalendarIcon />, path: '/cliente/agendamentos' },
  { text: 'Recompensas', icon: <GiftIcon />, path: '/cliente/recompensas' },
  { text: 'Meus Pontos', icon: <StarIcon />, path: '/cliente/pontos' },
  { text: 'Histórico', icon: <HistoryIcon />, path: '/cliente/historico' },
  { text: 'Perfil', icon: <PersonIcon />, path: '/cliente/perfil' },
  { text: 'Notificações', icon: <NotificationsIcon />, path: '/cliente/notificacoes' },
  { text: 'Anamnese', icon: <AssignmentIcon />, path: '/cliente/anamnese' },
];

function ClienteLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { cliente, logout, firebaseUser } = useAuthCliente();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // ESTADOS PARA NOTIFICAÇÕES
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [notificacoesAnchor, setNotificacoesAnchor] = useState(null);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(false);
  
  // ESTADO PARA FORMULÁRIOS PENDENTES
  const [formulariosPendentes, setFormulariosPendentes] = useState(0);

  useEffect(() => {
    if (cliente) {
      carregarNotificacoes();
      verificarFormulariosPendentes();
      
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

  // VERIFICAR FORMULÁRIOS PENDENTES
  const verificarFormulariosPendentes = async () => {
    if (!cliente?.id) return;
    
    try {
      const uid = firebaseUser?.uid || cliente?.id;
      
      // Buscar agendamentos futuros do cliente
      const hoje = new Date().toISOString().split('T')[0];
      const agendamentos = await firebaseService.query('agendamentos', [
        { field: 'clienteId', operator: '==', value: uid },
        { field: 'data', operator: '>=', value: hoje },
        { field: 'status', operator: 'in', value: ['confirmado', 'pendente'] }
      ]);
      
      let pendentes = 0;
      
      // Para cada agendamento, verificar se tem formulário associado não respondido
      for (const agendamento of agendamentos) {
        // Buscar formulários associados ao serviço
        const formularios = await firebaseService.query('formularios_anamnese', [
          { field: 'servicoIds', operator: 'array-contains', value: agendamento.servicoId },
          { field: 'ativo', operator: '==', value: true }
        ]);
        
        if (formularios.length > 0) {
          // Verificar se já respondeu
          const respostas = await firebaseService.query('respostas_anamnese', [
            { field: 'agendamentoId', operator: '==', value: agendamento.id }
          ]);
          
          if (respostas.length === 0) {
            pendentes++;
          }
        }
      }
      
      setFormulariosPendentes(pendentes);
    } catch (error) {
      console.error('Erro ao verificar formulários pendentes:', error);
    }
  };

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
      case 'formulario': return <AssignmentIcon sx={{ color: '#9c27b0' }} />;
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

  // 🔥 FUNÇÃO PARA REDIRECIONAR PARA O PRIMEIRO FORMULÁRIO PENDENTE
  const irParaPrimeiroFormularioPendente = async () => {
    try {
      const uid = firebaseUser?.uid || cliente?.id;
      const hoje = new Date().toISOString().split('T')[0];
      
      // Buscar agendamentos futuros do cliente
      const agendamentos = await firebaseService.query('agendamentos', [
        { field: 'clienteId', operator: '==', value: uid },
        { field: 'data', operator: '>=', value: hoje },
        { field: 'status', operator: 'in', value: ['confirmado', 'pendente'] }
      ]);
      
      // Procurar o primeiro agendamento com formulário pendente
      for (const agendamento of agendamentos) {
        const formularios = await firebaseService.query('formularios_anamnese', [
          { field: 'servicoIds', operator: 'array-contains', value: agendamento.servicoId },
          { field: 'ativo', operator: '==', value: true }
        ]);
        
        if (formularios.length > 0) {
          const respostas = await firebaseService.query('respostas_anamnese', [
            { field: 'agendamentoId', operator: '==', value: agendamento.id }
          ]);
          
          if (respostas.length === 0) {
            // Encontrou um pendente, redirecionar para o formulário
            navigate(`/cliente/agendamento/${agendamento.id}/anamnese`);
            return;
          }
        }
      }
      
      // Se não encontrar nenhum pendente, vai para a lista
      navigate('/cliente/anamnese');
    } catch (error) {
      console.error('Erro ao redirecionar para formulário:', error);
      navigate('/cliente/anamnese');
    }
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
          
          // VERIFICAR SE É O ITEM DE ANAMNESE COM PENDÊNCIAS
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
            
            {/* ÍCONE DE NOTIFICAÇÕES MOBILE */}
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
          position: 'relative',
        }}
      >
        {/* ÍCONE DE NOTIFICAÇÕES DESKTOP */}
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

        {/* BADGE PARA FORMULÁRIOS PENDENTES (visível apenas quando necessário) */}
        {formulariosPendentes > 0 && (
          <Box
            sx={{
              position: 'fixed',
              top: isMobile ? 70 : 80,
              right: 20,
              zIndex: 999,
              cursor: 'pointer',
            }}
            onClick={irParaPrimeiroFormularioPendente} // 🔥 FUNÇÃO MELHORADA
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

      {/* POPOVER DE NOTIFICAÇÕES */}
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
