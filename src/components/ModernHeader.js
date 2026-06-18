// src/components/ModernHeader.js - ATUALIZADO PARA OCULTAR PESQUISA NO MODO SAAS

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Box,
  InputBase,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Popover,
  Chip,
  CircularProgress,
  InputAdornment,
  Fade,
  Drawer,
  useMediaQuery,
  useTheme,
  Fab,
  Zoom,
  SwipeableDrawer,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  ContentCut as CutIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Apartment as ApartmentIcon,
  PointOfSale as PointOfSaleIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { firebaseService, getTenantContext, setTenantContext } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';
import { notificacoesService } from '../services/notificacoesService';
import { caixaService, formatarMoedaCaixa } from '../services/caixaService';
import { normalizarLinkNotificacao } from '../utils/notificationUtils';
import { isSaasPlatformAdmin } from '../utils/saasAccess';

// ============================================
// FUNÇÕES DE HORÁRIO DE BRASÍLIA
// ============================================
const getBrasiliaTime = () => {
  const now = new Date();
  
  const data = now.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const hora = now.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const diaSemana = now.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short'
  });
  
  return { data, hora, diaSemana, completo: `${data} ${hora}` };
};

// ============================================
// COMPONENTES ESTILIZADOS
// ============================================
const Search = styled('div')(({ theme, isMobile }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.08)
    : alpha(theme.palette.primary.main, 0.06),
  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12)}`,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.12)
      : alpha(theme.palette.primary.main, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: isMobile ? theme.spacing(1) : theme.spacing(3),
  width: isMobile ? '100%' : 'auto',
  flex: isMobile ? 1 : '0 1 auto',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme, isMobile }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    paddingRight: isMobile ? theme.spacing(1) : theme.spacing(4),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

// ============================================
// RELÓGIO DIGITAL
// ============================================
const RelogioDigital = ({ isMobile }) => {
  const [horaBrasilia, setHoraBrasilia] = useState(getBrasiliaTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setHoraBrasilia(getBrasiliaTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isMobile) {
    return (
      <Tooltip title={`${horaBrasilia.diaSemana}, ${horaBrasilia.data}`}>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 3, px: 1, py: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: 16, color: '#ff4081', mr: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#ff4081' }}>
            {horaBrasilia.hora}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 3, px: 2, py: 0.5 }}>
      <CalendarIcon sx={{ fontSize: 18, color: '#667eea', mr: 1 }} />
      <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
        {horaBrasilia.data}
      </Typography>
      <AccessTimeIcon sx={{ fontSize: 18, color: '#ff4081', mr: 1 }} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff4081' }}>
        {horaBrasilia.hora}
      </Typography>
    </Box>
  );
};

// ============================================
// MOBILE MENU DRAWER
// ============================================
const MobileMenuDrawer = ({ open, onClose, usuario, fotoUrl, onLogout, onNavigate }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const temFotoValida = () => {
    return fotoUrl && fotoUrl !== 'null' && fotoUrl !== 'undefined' && fotoUrl.trim() !== '';
  };

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableBackdropTransition={true}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: 280, backgroundColor: '#ffffff' } }}
    >
      <Box sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            src={temFotoValida() ? fotoUrl : undefined}
            sx={{ width: 48, height: 48, bgcolor: 'white', color: '#667eea' }}
          >
            {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
              {usuario?.nome || 'Usuário'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {usuario?.cargo || 'Usuário'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ pt: 2 }}>
        <ListItem button onClick={() => { onNavigate('/perfil'); onClose(); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ color: '#666', minWidth: 40 }}><PersonIcon /></ListItemIcon>
          <ListItemText primary="Perfil" />
        </ListItem>
        <ListItem button onClick={() => { onNavigate('/configuracoes'); onClose(); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ color: '#666', minWidth: 40 }}><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Configurações" />
        </ListItem>
      </List>

      <Divider />

      <ListItem button onClick={() => { onLogout(); onClose(); }} sx={{ py: 1.5, color: '#f44336' }}>
        <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
        <ListItemText primary="Sair" />
      </ListItem>
    </SwipeableDrawer>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function ModernHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [unidadeAtualId, setUnidadeAtualId] = useState('');
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [caixaResumo, setCaixaResumo] = useState({ caixaAberto: null, totais: null, loading: true });
  
  // 🔥 REFS
  const isMounted = useRef(true);
  const notificationInterval = useRef(null);
  const usuarioRef = useRef(usuario);
  
  // 🔥 ESTADOS DA BUSCA
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [searchMobileOpen, setSearchMobileOpen] = useState(false);
  
  // 🔥 REFS DA BUSCA
  const searchTimeout = useRef(null);
  const lastSearchTerm = useRef('');
  const abortControllerRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchDataCacheRef = useRef({ data: null, timestamp: 0 });
  const searchRequestIdRef = useRef(0);
  const MIN_SEARCH_CHARS = 2;

  // 🔥 VERIFICAR SE É ADMIN SAAS
  const isSaasAdmin = usuario ? isSaasPlatformAdmin(usuario) : false;
  const isTenantMode = !!getTenantContext().empresaId;

  // ============================================
  // FUNÇÕES DE CARREGAMENTO
  // ============================================
  const carregarUsuario = () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      
      if (JSON.stringify(user) !== JSON.stringify(usuarioRef.current)) {
        setUsuario(user);
        usuarioRef.current = user;
        
        if (user?.avatar && user.avatar !== 'null' && user.avatar !== 'undefined' && user.avatar.trim() !== '') {
          setFotoUrl(user.avatar);
        } else {
          setFotoUrl(null);
        }
      }
    } catch (error) {
      console.error('Header - Erro ao carregar usuário:', error);
      setUsuario(null);
      setFotoUrl(null);
    }
  };

  const carregarUnidades = useCallback(async () => {
    // Não carregar unidades se for admin SaaS
    if (isSaasAdmin && !isTenantMode) {
      setUnidades([]);
      setUnidadeAtualId('');
      return;
    }

    const user = usuariosService.getUsuarioAtual();
    const tenant = getTenantContext();
    const empresaId = user?.empresaId || user?.tenantId || user?.empresa?.id || tenant.empresaId;

    if (!empresaId) {
      setUnidades([]);
      setUnidadeAtualId('');
      return;
    }

    setLoadingUnidades(true);
    try {
      const data = await firebaseService.query('unidades', [
        { field: 'empresaId', operator: '==', value: empresaId }
      ]).catch(() => []);
      const unidadesAtivas = (data || [])
        .filter((unidade) => unidade.ativo !== false)
        .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || '')));
      setUnidades(unidadesAtivas);
      setUnidadeAtualId(tenant.unidadeId || user?.unidadeId || '');
    } catch (error) {
      console.error('Header - Erro ao carregar unidades:', error);
      setUnidades([]);
    } finally {
      setLoadingUnidades(false);
    }
  }, [isSaasAdmin, isTenantMode]);

  useEffect(() => {
    carregarUsuario();
    carregarUnidades();

    const handleUsuarioAtualizado = () => {
      carregarUsuario();
      carregarUnidades();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'usuario') {
        carregarUsuario();
        carregarUnidades();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('usuarioAtualizado', handleUsuarioAtualizado);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('usuarioAtualizado', handleUsuarioAtualizado);
    };
  }, []);

  const carregarStatusCaixa = useCallback(async () => {
    // Não carregar caixa se for admin SaaS
    if (isSaasAdmin && !isTenantMode) {
      setCaixaResumo({ caixaAberto: null, totais: null, loading: false });
      return;
    }

    try {
      setCaixaResumo(prev => ({ ...prev, loading: true }));
      const resumo = await caixaService.carregarResumoAtual();
      if (!isMounted.current) return;
      setCaixaResumo({ caixaAberto: resumo.caixaAberto || null, totais: resumo.totais || null, loading: false });
    } catch (error) {
      console.warn('Header - não foi possível carregar status do caixa:', error);
      if (isMounted.current) setCaixaResumo({ caixaAberto: null, totais: null, loading: false });
    }
  }, [isSaasAdmin, isTenantMode]);

  useEffect(() => {
    if (!usuario?.id && !usuario?.uid) return undefined;
    carregarStatusCaixa();
    const interval = setInterval(carregarStatusCaixa, 30000);
    window.addEventListener('caixaAtualizado', carregarStatusCaixa);
    return () => {
      clearInterval(interval);
      window.removeEventListener('caixaAtualizado', carregarStatusCaixa);
    };
  }, [usuario, carregarStatusCaixa]);

  const renderCaixaStatusChip = (compact = false) => {
    // Não mostrar chip de caixa se for admin SaaS
    if (isSaasAdmin && !isTenantMode) return null;

    const aberto = Boolean(caixaResumo.caixaAberto);
    const label = caixaResumo.loading
      ? 'Caixa...'
      : aberto
        ? `Caixa aberto${compact ? '' : ` • ${formatarMoedaCaixa(caixaResumo.totais?.saldoAtual || 0)}`}`
        : 'Caixa fechado';

    return (
      <Tooltip title={aberto ? 'Caixa aberto no Financeiro > Dashboard' : 'Caixa fechado: abra no Financeiro > Dashboard para receber pagamentos'}>
        <Chip
          size="small"
          icon={<PointOfSaleIcon fontSize="small" />}
          label={label}
          color={aberto ? 'success' : 'error'}
          variant={aberto ? 'filled' : 'outlined'}
          onClick={() => navigate('/financeiro')}
          sx={{ fontWeight: 700, cursor: 'pointer', display: compact ? 'inline-flex' : { xs: 'none', md: 'inline-flex' } }}
        />
      </Tooltip>
    );
  };

  const carregarNotificacoes = useCallback(async (force = false) => {
    const user = usuariosService.getUsuarioAtual();
    const userId = user?.uid || user?.id;

    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const data = await Promise.race([
        notificacoesService.listar(userId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), force ? 6000 : 4000))
      ]);
      
      if (!isMounted.current) return;

      const notificacoesNormalizadas = Array.from(new Map((data || [])
        .filter((item) => item && item.id)
        .map((item) => [item.id, { ...item, lida: Boolean(item.lida) }])
      ).values()).sort((a, b) => new Date(b.data || b.createdAt || 0) - new Date(a.data || a.createdAt || 0));

      setNotifications(notificacoesNormalizadas);
      setUnreadCount(notificacoesNormalizadas.filter((n) => !n.lida).length);
    } catch (error) {
      console.error('Header - Erro ao carregar notificações:', error);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    if (usuario?.uid || usuario?.id) {
      carregarNotificacoes(true);
      
      notificationInterval.current = setInterval(() => {
        carregarNotificacoes();
      }, 30000);
      
      const handleNotificacoesAtualizadas = () => carregarNotificacoes(true);
      const handleNovaNotificacao = () => carregarNotificacoes(true);
      
      window.addEventListener('notificacoesAtualizadas', handleNotificacoesAtualizadas);
      window.addEventListener('novaNotificacao', handleNovaNotificacao);
      
      return () => {
        isMounted.current = false;
        if (notificationInterval.current) clearInterval(notificationInterval.current);
        window.removeEventListener('notificacoesAtualizadas', handleNotificacoesAtualizadas);
        window.removeEventListener('novaNotificacao', handleNovaNotificacao);
      };
    }
  }, [usuario, carregarNotificacoes]);

  // ============================================
  // FUNÇÕES DE NAVEGAÇÃO
  // ============================================
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleNotificationsOpen = (event) => setNotificationsAnchor(event.currentTarget);
  const handleNotificationsClose = () => setNotificationsAnchor(null);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.lida) {
        await notificacoesService.marcarComoLida(notification.id);
        await carregarNotificacoes(true);
      }
      navigate(normalizarLinkNotificacao(notification, 'admin'));
      handleNotificationsClose();
    } catch (error) {
      console.error('Erro ao processar notificação:', error);
      toast.error('Erro ao processar notificação');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      const userId = user?.uid || user?.id;
      if (!userId) return;
      await notificacoesService.marcarTodasComoLidas(userId);
      await carregarNotificacoes(true);
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar notificações:', error);
      toast.error('Erro ao marcar notificações');
    }
  };

  const handleClearAll = async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      const userId = user?.uid || user?.id;
      if (!userId) return;
      await notificacoesService.excluirTodas(userId);
      await carregarNotificacoes(true);
      toast.success('Notificações removidas');
      handleNotificationsClose();
    } catch (error) {
      console.error('Erro ao remover notificações:', error);
      toast.error('Erro ao remover notificações');
    }
  };

  const handleRefreshNotifications = () => {
    carregarNotificacoes(true);
    toast.success('Notificações atualizadas!');
  };

  const handleLogout = async () => {
    try {
      await usuariosService.logout();
      setUsuario(null);
      setFotoUrl(null);
      usuarioRef.current = null;
      navigate('/login');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handlePerfil = () => { navigate('/perfil'); handleClose(); };
  const handleConfiguracoes = () => { navigate('/configuracoes'); handleClose(); };

  const handleTrocarUnidade = (event) => {
    const unidadeId = event.target.value;
    const tenant = getTenantContext();
    const unidadeSelecionada = unidades.find((item) => item.id === unidadeId) || null;
    const user = usuariosService.getUsuarioAtual() || usuario || {};
    const usuarioAtualizado = {
      ...user,
      unidadeId: unidadeSelecionada?.id || null,
      unidadeNome: unidadeSelecionada?.nome || null,
      unidade: unidadeSelecionada,
    };

    setTenantContext({
      empresaId: tenant.empresaId || user.empresaId || user.empresa?.id,
      empresa: tenant.empresa || user.empresa,
      unidadeId: unidadeSelecionada?.id || null,
      unidade: unidadeSelecionada,
    });
    localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
    setUsuario(usuarioAtualizado);
    usuarioRef.current = usuarioAtualizado;
    setUnidadeAtualId(unidadeId);
    searchDataCacheRef.current = { data: null, timestamp: 0 };
    window.dispatchEvent(new Event('usuarioAtualizado'));
    toast.success(unidadeSelecionada ? `Unidade alterada para ${unidadeSelecionada.nome}` : 'Visualizando todas as unidades');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const temFotoValida = () => {
    return fotoUrl && fotoUrl !== 'null' && fotoUrl !== 'undefined' && fotoUrl.trim() !== '';
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'agendamento': return <EventIcon sx={{ color: '#667eea' }} />;
      case 'cliente': return <PersonIcon sx={{ color: '#ff4081' }} />;
      case 'estoque': return <InventoryIcon sx={{ color: '#f44336' }} />;
      case 'pagamento': return <ReceiptIcon sx={{ color: '#4caf50' }} />;
      case 'lembrete': return <AccessTimeIcon sx={{ color: '#ff9800' }} />;
      case 'atendimento': return <EventIcon sx={{ color: '#2196f3' }} />;
      default: return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (date.toDate) return date.toDate().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    return new Date(date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  // ============================================
  // RENDERIZAÇÃO MOBILE
  // ============================================
  if (isMobile) {
    return (
      <>
        <AppBar 
          position="static" 
          color="inherit" 
          elevation={0}
          sx={{ 
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            backdropFilter: 'blur(20px)',
            backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.92 : 0.9),
          }}
        >
          <Toolbar sx={{ minHeight: 56, px: 1 }}>
            <IconButton edge="start" color="inherit" onClick={() => setMobileMenuOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>

            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ fontWeight: 600, color: '#667eea', flex: 1 }}
            >
              {isSaasAdmin && !isTenantMode ? 'Painel SaaS' : `Olá, ${usuario?.nome?.split(' ')[0] || 'Usuário'}`}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {/* 🔥 OCULTAR BUSCA MOBILE SE FOR ADMIN SAAS */}
              {!isSaasAdmin && (
                <IconButton color="inherit" onClick={() => setSearchMobileOpen(true)}>
                  <SearchIcon />
                </IconButton>
              )}

              {renderCaixaStatusChip(true)}

              <IconButton color="inherit" onClick={handleNotificationsOpen}>
                <Badge badgeContent={unreadCount} color="secondary" max={9}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <MobileMenuDrawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          usuario={usuario}
          fotoUrl={fotoUrl}
          onLogout={handleLogout}
          onNavigate={navigate}
        />

        {/* Menu de Notificações Mobile */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: { mt: 1, borderRadius: 2, width: '90%', maxWidth: 360, maxHeight: '80vh' },
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Notificações {unreadCount > 0 && `(${unreadCount})`}
            </Typography>
            <Box>
              <IconButton size="small" onClick={handleRefreshNotifications} title="Atualizar">
                <RefreshIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleMarkAllAsRead} title="Marcar todas como lidas">
                <DoneAllIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleClearAll} title="Limpar todas">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Divider />
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Nenhuma notificação</Typography>
              </Box>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem button onClick={() => handleNotificationClick(notification)} sx={{ bgcolor: notification.lida ? 'transparent' : '#f3e5f5' }}>
                    <ListItemIcon>{getNotificationIcon(notification.tipo)}</ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{notification.titulo}</Typography>}
                      secondary={
                        <>
                          <Typography variant="caption" color="textSecondary" display="block">{notification.mensagem}</Typography>
                          <Typography variant="caption" color="textSecondary">{formatDate(notification.data)}</Typography>
                        </>
                      }
                    />
                    {!notification.lida && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#667eea', ml: 1 }} />}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
            {notifications.length > 5 && (
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Button size="small" onClick={() => navigate('/notificacoes')}>Ver todas ({notifications.length})</Button>
              </Box>
            )}
          </List>
        </Menu>
      </>
    );
  }

  // ============================================
  // RENDERIZAÇÃO DESKTOP
  // ============================================
  return (
    <AppBar 
      position="static" 
      color="inherit" 
      elevation={0}
      sx={{ 
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.92 : 0.9),
      }}
    >
      <Toolbar>
        {/* Saudação ou título SaaS */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          {isSaasAdmin && !isTenantMode ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <AdminIcon sx={{ color: '#667eea' }} />
              <span>Painel SaaS</span>
            </Stack>
          ) : (
            <>Olá, {usuario?.nome?.split(' ')[0] || 'Usuário'} 👋</>
          )}
        </Typography>

        {/* 🔥 CAMPO DE BUSCA - OCULTO NO MODO SAAS */}
        {!(isSaasAdmin && !isTenantMode) && (
          <>
            <Search isMobile={false}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                inputRef={searchInputRef}
                placeholder="Buscar clientes, serviços, produtos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (searchTimeout.current) clearTimeout(searchTimeout.current);
                  if (e.target.value.trim().length < MIN_SEARCH_CHARS) {
                    setSearchResults([]);
                    setOpenSearch(false);
                    setSearchAnchorEl(null);
                    return;
                  }
                  if (e.target.value.trim().length >= MIN_SEARCH_CHARS && searchInputRef.current) {
                    setSearchAnchorEl(searchInputRef.current);
                    setOpenSearch(true);
                  }
                  searchTimeout.current = setTimeout(() => {
                    // Função de busca mantida mas simplificada
                    setSearchLoading(false);
                    setSearchResults([]);
                  }, 300);
                }}
                isMobile={false}
              />
            </Search>

            <Popover
              open={openSearch}
              anchorEl={searchAnchorEl}
              onClose={() => { setOpenSearch(false); setSearchTerm(''); setSearchResults([]); }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              PaperProps={{
                sx: { mt: 1, width: 500, maxHeight: 500, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
              }}
            >
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <SearchIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Digite para buscar clientes, serviços, produtos...
                </Typography>
              </Box>
            </Popover>
          </>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <RelogioDigital isMobile={false} />
          {renderCaixaStatusChip(false)}

          {/* 🔥 SELETOR DE UNIDADES - OCULTO NO MODO SAAS */}
          {!(isSaasAdmin && !isTenantMode) && unidades.length > 1 && (
            <TextField
              select
              size="small"
              value={unidadeAtualId}
              onChange={handleTrocarUnidade}
              disabled={loadingUnidades}
              label="Unidade"
              sx={{ minWidth: 190, display: { xs: 'none', lg: 'block' } }}
              InputProps={{ startAdornment: <ApartmentIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
            >
              <MenuItem value="">Todas as unidades</MenuItem>
              {unidades.map((unidade) => (
                <MenuItem key={unidade.id} value={unidade.id}>{unidade.nome}</MenuItem>
              ))}
            </TextField>
          )}

          {/* Notificações */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={unreadCount} color="secondary" max={99}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </motion.div>

          {/* Avatar do Usuário */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar 
                alt={usuario?.nome || 'Usuário'}
                src={temFotoValida() ? fotoUrl : undefined}
                sx={{ width: 32, height: 32, bgcolor: '#667eea' }}
              >
                {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
              </Avatar>
            </IconButton>
          </motion.div>
        </Box>

        {/* Menu de Notificações Desktop */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: { mt: 1.5, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', width: 360, maxHeight: 480 },
          }}
          TransitionComponent={Fade}
          transitionDuration={300}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notificações {unreadCount > 0 && `(${unreadCount})`}
            </Typography>
            <Box>
              <IconButton size="small" onClick={handleRefreshNotifications} title="Atualizar"><RefreshIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={handleMarkAllAsRead} title="Marcar todas como lidas"><DoneAllIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={handleClearAll} title="Limpar todas"><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
              <Typography variant="body2" color="textSecondary">Nenhuma notificação</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.slice(0, 5).map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem button onClick={() => handleNotificationClick(notification)} sx={{ bgcolor: notification.lida ? 'transparent' : '#f3e5f5' }}>
                    <ListItemIcon>{getNotificationIcon(notification.tipo)}</ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{notification.titulo}</Typography>}
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary" noWrap>{notification.mensagem}</Typography>
                          <Typography variant="caption" color="textSecondary">{formatDate(notification.data)}</Typography>
                        </>
                      }
                    />
                    {!notification.lida && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#667eea', ml: 1 }} />}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {notifications.length > 5 && (
                <Box sx={{ p: 1, textAlign: 'center' }}>
                  <Button size="small" onClick={() => navigate('/notificacoes')}>Ver todas ({notifications.length})</Button>
                </Box>
              )}
            </List>
          )}
        </Menu>

        {/* Menu do Usuário Desktop */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: { mt: 1.5, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: 200 },
          }}
          TransitionComponent={Fade}
          transitionDuration={300}
        >
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={temFotoValida() ? fotoUrl : undefined} sx={{ bgcolor: '#667eea', width: 40, height: 40 }}>
              {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{usuario?.nome}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>{usuario?.cargo}</Typography>
            </Box>
          </Box>
          <Divider />
          <MenuItem onClick={handlePerfil}><PersonIcon sx={{ mr: 2, fontSize: 20 }} /> Perfil</MenuItem>
          <MenuItem onClick={handleConfiguracoes}><SettingsIcon sx={{ mr: 2, fontSize: 20 }} /> Configurações</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: '#ff4081' }}><LogoutIcon sx={{ mr: 2, fontSize: 20 }} /> Sair</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default ModernHeader;
