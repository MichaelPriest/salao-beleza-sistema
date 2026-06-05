// src/components/ClienteLayout.js
// VERSÃO CORRIGIDA - COM NOTIFICAÇÕES FUNCIONANDO

import React, { useState, useEffect, useCallback } from 'react';
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
  Popover,
  Button,
  Paper,
  CircularProgress,
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
  Spa as SpaIcon,
  Notifications as NotificationsIcon,
  Event as EventIcon,
  EmojiEvents as TrophyIcon,
  Redeem as RedeemIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  HelpCenter as HelpCenterIcon,
  SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { notificacoesPushService } from '../services/notificacoesPushService';
import { firebaseService } from '../services/firebase';
import Footer from './Footer';
import { useFidelidadeAtiva } from '../hooks/useFidelidadeAtiva';

// ============================================
// CONSTANTES
// ============================================

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/cliente/dashboard' },
  { text: 'Agendamentos', icon: <CalendarIcon />, path: '/cliente/agendamentos' },
  { text: 'Recompensas', icon: <GiftIcon />, path: '/cliente/recompensas', recurso: 'fidelidade' },
  { text: 'Meus Pontos', icon: <StarIcon />, path: '/cliente/pontos', recurso: 'fidelidade' },
  { text: 'Histórico', icon: <HistoryIcon />, path: '/cliente/historico' },
  { text: 'Perfil', icon: <PersonIcon />, path: '/cliente/perfil' },
  { text: 'Notificações', icon: <NotificationsIcon />, path: '/cliente/notificacoes' },
  { text: 'Anamnese', icon: <AssignmentIcon />, path: '/cliente/anamnese' },
  { text: 'Manual de Uso', icon: <HelpCenterIcon />, path: '/cliente/manual' },
  { text: 'Chamados', icon: <SupportAgentIcon />, path: '/cliente/chamados' },
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
  const { fidelidadeAtiva } = useFidelidadeAtiva();

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
  // FUNÇÃO PARA CARREGAR NOTIFICAÇÕES
  // ==========================================
  const carregarNotificacoes = useCallback(async () => {
    if (!cliente?.id) return [];
    
    try {
      setLoadingNotificacoes(true);
      const uid = firebaseUser?.uid || cliente?.id;
      console.log('🔍 Buscando notificações para cliente:', uid);
      
      // Buscar notificações do cliente
      const data = await firebaseService.query('notificacoes_cliente', [
        { field: 'clienteId', operator: '==', value: uid }
      ]).catch(err => {
        console.error('❌ Erro ao buscar notificações:', err);
        return [];
      });
      
      // Ocultar notificações do programa quando a fidelidade estiver desativada
      const tiposFidelidade = ['pontos', 'nivel', 'recompensa', 'resgate'];
      const notificacoesVisiveis = fidelidadeAtiva ? (data || []) : (data || []).filter((item) => !tiposFidelidade.includes(item.tipo));

      // Ordenar por data (mais recentes primeiro)
      const notificacoesOrdenadas = notificacoesVisiveis.sort((a, b) =>
        new Date(b.createdAt || b.data) - new Date(a.createdAt || a.data)
      );
      
      console.log('✅ Notificações carregadas:', notificacoesOrdenadas.length);
      
      setNotificacoes(notificacoesOrdenadas);
      const naoLidas = notificacoesOrdenadas.filter(n => !n.lida).length;
      setNotificacoesNaoLidas(naoLidas);
      
      return notificacoesOrdenadas;
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      return [];
    } finally {
      setLoadingNotificacoes(false);
    }
  }, [cliente, firebaseUser, fidelidadeAtiva]);

  // ==========================================
  // FUNÇÃO PARA VERIFICAR FORMULÁRIOS PENDENTES
  // ==========================================
  const verificarFormulariosPendentes = useCallback(async () => {
    if (!cliente?.id) return 0;
    
    try {
      const uid = firebaseUser?.uid || cliente?.id;
      
      // Buscar agendamentos do cliente
      const agendamentos = await firebaseService.query('agendamentos', [
        { field: 'clienteId', operator: '==', value: uid },
        { field: 'status', operator: 'in', value: ['confirmado', 'pendente'] }
      ]).catch(() => []);
      
      console.log(`📅 Total de agendamentos: ${agendamentos.length}`);
      
      let pendentesCount = 0;
      
      for (const agendamento of agendamentos) {
        try {
          // Verificar se o serviço tem formulário
          const formularios = await firebaseService.query('formularios_anamnese', [
            { field: 'servicoIds', operator: 'array-contains', value: agendamento.servicoId },
            { field: 'ativo', operator: '==', value: true }
          ]).catch(() => []);
          
          if (formularios.length > 0) {
            // Verificar se já existe resposta
            const respostas = await firebaseService.query('respostas_anamnese', [
              { field: 'agendamentoId', operator: '==', value: agendamento.id }
            ]).catch(() => []);
            
            if (respostas.length === 0) {
              pendentesCount++;
            }
          }
        } catch (e) {
          console.log('Erro ao verificar formulário:', e);
        }
      }
      
      console.log(`📊 Formulários pendentes: ${pendentesCount}`);
      setFormulariosPendentes(pendentesCount);
      return pendentesCount;
    } catch (error) {
      console.error('❌ Erro ao verificar formulários:', error);
      return 0;
    }
  }, [cliente, firebaseUser]);

  // ==========================================
  // FUNÇÃO PARA MARCAR NOTIFICAÇÃO COMO LIDA
  // ==========================================
  const marcarNotificacaoComoLida = useCallback(async (notificacaoId) => {
    try {
      await firebaseService.update('notificacoes_cliente', notificacaoId, {
        lida: true,
        lidaEm: new Date().toISOString()
      });
      
      setNotificacoes(prev =>
        prev.map(n => n.id === notificacaoId ? { ...n, lida: true } : n)
      );
      setNotificacoesNaoLidas(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      return false;
    }
  }, []);

  // ==========================================
  // FUNÇÃO PARA MARCAR TODAS COMO LIDAS
  // ==========================================
  const marcarTodasComoLidas = useCallback(async () => {
    const naoLidas = notificacoes.filter(n => !n.lida);
    if (naoLidas.length === 0) return;
    
    try {
      for (const notificacao of naoLidas) {
        await firebaseService.update('notificacoes_cliente', notificacao.id, {
          lida: true,
          lidaEm: new Date().toISOString()
        });
      }
      
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      setNotificacoesNaoLidas(0);
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
    }
  }, [notificacoes]);

  // ==========================================
  // FUNÇÃO PARA IR PARA PRIMEIRO FORMULÁRIO PENDENTE
  // ==========================================
  const irParaPrimeiroFormularioPendente = useCallback(async () => {
    try {
      const uid = firebaseUser?.uid || cliente?.id;
      
      const agendamentos = await firebaseService.query('agendamentos', [
        { field: 'clienteId', operator: '==', value: uid },
        { field: 'status', operator: 'in', value: ['confirmado', 'pendente'] }
      ]).catch(() => []);
      
      agendamentos.sort((a, b) => a.data.localeCompare(b.data));
      
      for (const agendamento of agendamentos) {
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
      }
      
      navigate('/cliente/anamnese');
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      navigate('/cliente/anamnese');
    }
  }, [cliente, firebaseUser, navigate]);

  // ==========================================
  // EFEITO PARA CARREGAR DADOS INICIAIS
  // ==========================================
  useEffect(() => {
    if (!cliente?.id) return;
    
    console.log('📌 ClienteLayout - Carregando dados para cliente:', cliente.id);
    
    const carregarDados = async () => {
      await carregarNotificacoes();
      await verificarFormulariosPendentes();
    };
    
    carregarDados();
    
    // Intervalo para atualizar notificações a cada 30 segundos
    const interval = setInterval(() => {
      carregarNotificacoes();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [cliente, carregarNotificacoes, verificarFormulariosPendentes]);

  // ==========================================
  // HANDLERS
  // ==========================================
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

  const handleNotificacoesClick = (event) => {
    setNotificacoesAnchor(event.currentTarget);
  };

  const handleNotificacoesClose = () => {
    setNotificacoesAnchor(null);
  };

  const handleNotificacaoClick = async (notificacao) => {
    if (!notificacao.lida) {
      await marcarNotificacaoComoLida(notificacao.id);
    }
    
    if (notificacao.link) {
      navigate(notificacao.link);
    }
    
    handleNotificacoesClose();
  };

  const getIconeNotificacao = (tipo) => {
    return NOTIFICATION_ICONS[tipo] || NOTIFICATION_ICONS.default;
  };

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
  // DRAWER
  // ==========================================
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SpaIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>BeautyPro</Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, bgcolor: '#faf5ff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={cliente?.foto} sx={{ width: 48, height: 48, bgcolor: '#9c27b0' }}>
            {!cliente?.foto && getInitials(cliente?.nome)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Bem-vindo(a)</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {cliente?.nome?.split(' ')[0] || 'Cliente'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flex: 1, p: 1 }}>
        {MENU_ITEMS.filter((item) => item.recurso !== 'fidelidade' || fidelidadeAtiva).map((item) => {
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
                '&:hover': { bgcolor: '#f3e5f5' },
                '& .MuiListItemIcon-root': { color: isActive ? '#9c27b0' : 'inherit' },
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

      <ListItem button onClick={handleLogout} sx={{ m: 1, borderRadius: 2, color: '#f44336', '&:hover': { bgcolor: '#ffebee' } }}>
        <ListItemIcon sx={{ color: '#f44336' }}><LogoutIcon /></ListItemIcon>
        <ListItemText primary="Sair" />
      </ListItem>
    </Box>
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* AppBar Mobile */}
        {isMobile && (
          <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 1200 }}>
            <Toolbar>
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle}><MenuIcon /></IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', color: '#9c27b0' }}>BeautyPro</Typography>
              <IconButton color="inherit" onClick={handleNotificacoesClick}>
                <Badge badgeContent={notificacoesNaoLidas} color="secondary"><NotificationsIcon /></Badge>
              </IconButton>
              <Avatar src={cliente?.foto} sx={{ width: 32, height: 32, bgcolor: '#9c27b0', ml: 1 }}>
                {!cliente?.foto && getInitials(cliente?.nome)}
              </Avatar>
            </Toolbar>
          </AppBar>
        )}

        {/* Drawer Desktop */}
        {!isMobile && (
          <Drawer variant="permanent" sx={{ width: 280, flexShrink: 0, '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box', borderRight: 'none', boxShadow: '4px 0 20px rgba(0,0,0,0.05)' } }}>
            {drawer}
          </Drawer>
        )}

        {/* Drawer Mobile */}
        <SwipeableDrawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle} onOpen={() => {}} disableBackdropTransition ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: 280, backgroundColor: '#ffffff' } }}>
          {drawer}
        </SwipeableDrawer>

        {/* Conteúdo Principal */}
        <Box component="main" sx={{ flexGrow: 1, p: isMobile ? 2 : 3, pt: isMobile ? '80px' : 3, backgroundColor: '#faf5ff', minHeight: '100vh', position: 'relative' }}>
          {/* Botão de Notificações Desktop */}
          {!isMobile && (
            <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
              <IconButton onClick={handleNotificacoesClick} sx={{ bgcolor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#f5f5f5' } }}>
                <Badge badgeContent={notificacoesNaoLidas} color="secondary"><NotificationsIcon /></Badge>
              </IconButton>
            </Box>
          )}

          {/* Badge Formulários Pendentes */}
          {formulariosPendentes > 0 && (
            <Box sx={{ position: 'fixed', top: isMobile ? 70 : 80, right: 20, zIndex: 999, cursor: 'pointer' }} onClick={irParaPrimeiroFormularioPendente}>
              <Paper elevation={3} sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ff9800', '&:hover': { bgcolor: '#ffe0b2' } }}>
                <Badge badgeContent={formulariosPendentes} color="warning"><AssignmentIcon sx={{ color: '#ff9800' }} /></Badge>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                  Formulário{formulariosPendentes > 1 ? 's' : ''} pendente{formulariosPendentes > 1 ? 's' : ''}
                </Typography>
              </Paper>
            </Box>
          )}

          <motion.div key={location.pathname} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </Box>
      </Box>
      
      <Footer />
      
      {/* Popover de Notificações */}
      <Popover
        open={Boolean(notificacoesAnchor)}
        anchorEl={notificacoesAnchor}
        onClose={handleNotificacoesClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, maxHeight: 480, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Notificações</Typography>
          {notificacoesNaoLidas > 0 && (
            <Button size="small" onClick={marcarTodasComoLidas}>Marcar todas como lidas</Button>
          )}
        </Box>
        <Divider />
        
        {loadingNotificacoes ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={30} />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Carregando...</Typography>
          </Box>
        ) : notificacoes.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
            <Typography variant="body2" color="textSecondary">Nenhuma notificação</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notificacoes.slice(0, 10).map((notificacao) => (
              <React.Fragment key={notificacao.id}>
                <ListItem button onClick={() => handleNotificacaoClick(notificacao)} sx={{ bgcolor: notificacao.lida ? 'transparent' : '#f3e5f5', py: 1.5 }}>
                  <ListItemIcon>{getIconeNotificacao(notificacao.tipo)}</ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{notificacao.titulo}</Typography>}
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary" noWrap>{notificacao.mensagem}</Typography>
                        <Typography variant="caption" color="textSecondary">{formatarData(notificacao.createdAt || notificacao.data)}</Typography>
                      </>
                    }
                  />
                  {!notificacao.lida && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9c27b0', ml: 1 }} />}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {notificacoes.length > 10 && (
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Button size="small" onClick={() => { handleNotificacoesClose(); navigate('/cliente/notificacoes'); }}>
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
