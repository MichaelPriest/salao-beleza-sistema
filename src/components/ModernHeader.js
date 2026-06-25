// src/components/ModernHeader.js - CORRIGIDO (Stack substituído por Box)
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
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
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { firebaseService, getTenantContext, setTenantContext } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';
import { notificacoesService } from '../services/notificacoesService';
import { caixaService, formatarMoedaCaixa } from '../services/caixaService';
import { normalizarLinkNotificacao } from '../utils/notificationUtils';
import { isSaasPlatformAdmin } from '../utils/saasAccess';
import { safeSetUsuarioStorage } from '../utils/storageUtils';

// ============================================
// FUNÇÕES DE HORÁRIO DE BRASÍLIA
// ============================================
const getBrasiliaTime = () => {
  const now = new Date();
  const data = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  const diaSemana = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short' });
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
    [theme.breakpoints.up('md')]: { width: '40ch' },
  },
}));

// ============================================
// RELÓGIO DIGITAL
// ============================================
const RelogioDigital = ({ isMobile }) => {
  const [horaBrasilia, setHoraBrasilia] = useState(getBrasiliaTime());
  useEffect(() => {
    const timer = setInterval(() => setHoraBrasilia(getBrasiliaTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isMobile) {
    return (
      <Tooltip title={`${horaBrasilia.diaSemana}, ${horaBrasilia.data}`}>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 3, px: 1, py: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: 16, color: '#ff4081', mr: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#ff4081' }}>{horaBrasilia.hora}</Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 3, px: 2, py: 0.5 }}>
      <CalendarIcon sx={{ fontSize: 18, color: '#667eea', mr: 1 }} />
      <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>{horaBrasilia.data}</Typography>
      <AccessTimeIcon sx={{ fontSize: 18, color: '#ff4081', mr: 1 }} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff4081' }}>{horaBrasilia.hora}</Typography>
    </Box>
  );
};

// ============================================
// MOBILE MENU DRAWER
// ============================================
const MobileMenuDrawer = ({ open, onClose, usuario, fotoUrl, onLogout, onNavigate }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };
  const temFotoValida = () => fotoUrl && fotoUrl !== 'null' && fotoUrl !== 'undefined' && fotoUrl.trim() !== '';

  return (
    <SwipeableDrawer
      anchor="left" open={open} onClose={onClose} onOpen={() => {}}
      disableBackdropTransition ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: 280, backgroundColor: '#ffffff' } }}
    >
      <Box sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={temFotoValida() ? fotoUrl : undefined} sx={{ width: 48, height: 48, bgcolor: 'white', color: '#667eea' }}>
            {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>{usuario?.nome || 'Usuário'}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>{usuario?.cargo || 'Usuário'}</Typography>
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
  const [promptCaixa, setPromptCaixa] = useState({ open: false, valorAbertura: 0, observacao: '', concluir: null });
  
  const isMounted = useRef(true);
  const notificationInterval = useRef(null);
  const usuarioRef = useRef(usuario);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  
  const searchTimeout = useRef(null);
  const searchInputRef = useRef(null);
  const MIN_SEARCH_CHARS = 2;

  const isSaasAdmin = usuario ? isSaasPlatformAdmin(usuario) : false;
  const isTenantMode = !!getTenantContext().empresaId;

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
    }
  };

  const carregarUnidades = useCallback(async () => {
    if (isSaasAdmin && !isTenantMode) {
      setUnidades([]);
      setUnidadeAtualId('');
      return;
    }
    const user = usuariosService.getUsuarioAtual();
    const tenant = getTenantContext();
    const empresaId = user?.empresaId || user?.tenantId || user?.empresa?.id || tenant.empresaId;
    if (!empresaId) { setUnidades([]); setUnidadeAtualId(''); return; }
    setLoadingUnidades(true);
    try {
      const data = await firebaseService.query('unidades', [{ field: 'empresaId', operator: '==', value: empresaId }]).catch(() => []);
      const unidadesAtivas = (data || []).filter(u => u.ativo !== false).sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || '')));
      setUnidades(unidadesAtivas);
      setUnidadeAtualId(tenant.unidadeId || user?.unidadeId || '');
    } catch (error) {
      setUnidades([]);
    } finally {
      setLoadingUnidades(false);
    }
  }, [isSaasAdmin, isTenantMode]);

  useEffect(() => {
    carregarUsuario();
    carregarUnidades();
    const handleUsuarioAtualizado = () => { carregarUsuario(); carregarUnidades(); };
    window.addEventListener('usuarioAtualizado', handleUsuarioAtualizado);
    return () => window.removeEventListener('usuarioAtualizado', handleUsuarioAtualizado);
  }, []);

  const carregarStatusCaixa = useCallback(async () => {
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
      if (isMounted.current) setCaixaResumo({ caixaAberto: null, totais: null, loading: false });
    }
  }, [isSaasAdmin, isTenantMode]);

  useEffect(() => {
    if (!usuario?.id && !usuario?.uid) return;
    carregarStatusCaixa();
    const interval = setInterval(carregarStatusCaixa, 30000);
    return () => clearInterval(interval);
  }, [usuario, carregarStatusCaixa]);

  useEffect(() => {
    const handleSolicitarAberturaCaixa = (event) => {
      event.detail?.marcarComoTratado?.();
      setPromptCaixa({ open: true, valorAbertura: 0, observacao: '', concluir: event.detail?.concluir });
    };
    window.addEventListener('caixaSolicitarAbertura', handleSolicitarAberturaCaixa);
    return () => window.removeEventListener('caixaSolicitarAbertura', handleSolicitarAberturaCaixa);
  }, []);

  const fecharPromptCaixa = async (abrir = false) => {
    const concluir = promptCaixa.concluir;
    const payload = { abrir, valorAbertura: promptCaixa.valorAbertura, observacao: promptCaixa.observacao || 'Abertura solicitada pelo sistema' };
    setPromptCaixa({ open: false, valorAbertura: 0, observacao: '', concluir: null });
    if (concluir) await concluir(payload);
    if (abrir) {
      toast.success('Caixa aberto com sucesso');
      carregarStatusCaixa();
    }
  };

  const carregarNotificacoes = useCallback(async (force = false) => {
    const user = usuariosService.getUsuarioAtual();
    const userId = user?.uid || user?.id;
    if (!userId) { setNotifications([]); setUnreadCount(0); return; }
    try {
      const data = await Promise.race([notificacoesService.listar(userId), new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), force ? 6000 : 4000))]);
      if (!isMounted.current) return;
      const normalized = Array.from(new Map((data || []).filter(i => i?.id).map(i => [i.id, { ...i, lida: Boolean(i.lida) }])).values()).sort((a, b) => new Date(b.data || b.createdAt || 0) - new Date(a.data || a.createdAt || 0));
      setNotifications(normalized);
      setUnreadCount(normalized.filter(n => !n.lida).length);
    } catch (error) { /* silencioso */ }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    if (usuario?.uid || usuario?.id) {
      carregarNotificacoes(true);
      notificationInterval.current = setInterval(() => carregarNotificacoes(), 30000);
    }
    return () => { isMounted.current = false; if (notificationInterval.current) clearInterval(notificationInterval.current); };
  }, [usuario, carregarNotificacoes]);

  const renderCaixaStatusChip = (compact = false) => {
    if (isSaasAdmin && !isTenantMode) return null;
    const aberto = Boolean(caixaResumo.caixaAberto);
    const label = caixaResumo.loading ? 'Caixa...' : aberto ? `Caixa aberto${compact ? '' : ` • ${formatarMoedaCaixa(caixaResumo.totais?.saldoAtual || 0)}`}` : 'Caixa fechado';
    return (
      <Tooltip title={aberto ? 'Caixa aberto' : 'Caixa fechado'}>
        <Chip size="small" icon={<PointOfSaleIcon fontSize="small" />} label={label} color={aberto ? 'success' : 'error'}
          variant={aberto ? 'filled' : 'outlined'} onClick={() => navigate('/financeiro')}
          sx={{ fontWeight: 700, cursor: 'pointer', display: compact ? 'inline-flex' : { xs: 'none', md: 'inline-flex' } }} />
      </Tooltip>
    );
  };

  // Handlers
  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleNotificationsOpen = (e) => setNotificationsAnchor(e.currentTarget);
  const handleNotificationsClose = () => setNotificationsAnchor(null);
  const handleLogout = async () => {
    await usuariosService.logout();
    setUsuario(null); setFotoUrl(null); usuarioRef.current = null;
    navigate('/login');
    toast.success('Logout realizado!');
  };
  const handlePerfil = () => { navigate('/perfil'); handleClose(); };
  const handleConfiguracoes = () => { navigate('/configuracoes'); handleClose(); };

  const handleTrocarUnidade = (event) => {
    const unidadeId = event.target.value;
    const tenant = getTenantContext();
    const unidadeSelecionada = unidades.find(u => u.id === unidadeId) || null;
    const user = usuariosService.getUsuarioAtual() || usuario || {};
    const usuarioAtualizado = { ...user, unidadeId: unidadeSelecionada?.id || null, unidadeNome: unidadeSelecionada?.nome || null, unidade: unidadeSelecionada };
    setTenantContext({ empresaId: tenant.empresaId || user.empresaId || user.empresa?.id, empresa: tenant.empresa || user.empresa, unidadeId: unidadeSelecionada?.id || null, unidade: unidadeSelecionada });
    safeSetUsuarioStorage(usuarioAtualizado);
    setUsuario(usuarioAtualizado);
    usuarioRef.current = usuarioAtualizado;
    setUnidadeAtualId(unidadeId);
    window.dispatchEvent(new Event('usuarioAtualizado'));
    toast.success(unidadeSelecionada ? `Unidade: ${unidadeSelecionada.nome}` : 'Todas as unidades');
  };

  const getInitials = (name) => !name ? 'U' : name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const temFotoValida = () => fotoUrl && fotoUrl !== 'null' && fotoUrl !== 'undefined' && fotoUrl.trim() !== '';
  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'agendamento': return <EventIcon sx={{ color: '#667eea' }} />;
      case 'cliente': return <PersonIcon sx={{ color: '#ff4081' }} />;
      case 'estoque': return <InventoryIcon sx={{ color: '#f44336' }} />;
      case 'pagamento': return <ReceiptIcon sx={{ color: '#4caf50' }} />;
      case 'lembrete': return <AccessTimeIcon sx={{ color: '#ff9800' }} />;
      default: return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  // ============================================
  // RENDERIZAÇÃO MOBILE
  // ============================================
  if (isMobile) {
    return (
      <>
        <AppBar position="static" color="inherit" elevation={0}
          sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(20px)', backgroundColor: alpha(theme.palette.background.paper, 0.9) }}>
          <Toolbar sx={{ minHeight: 56, px: 1 }}>
            <IconButton edge="start" color="inherit" onClick={() => setMobileMenuOpen(true)} sx={{ mr: 1 }}><MenuIcon /></IconButton>
            <Typography variant="subtitle1" noWrap component="div" sx={{ fontWeight: 600, color: '#667eea', flex: 1 }}>
              {isSaasAdmin && !isTenantMode ? 'Painel SaaS' : `Olá, ${usuario?.nome?.split(' ')[0] || 'Usuário'}`}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {!isSaasAdmin && <IconButton color="inherit"><SearchIcon /></IconButton>}
              {renderCaixaStatusChip(true)}
              <IconButton color="inherit" onClick={handleNotificationsOpen}>
                <Badge badgeContent={unreadCount} color="secondary" max={9}><NotificationsIcon /></Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <MobileMenuDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} usuario={usuario} fotoUrl={fotoUrl} onLogout={handleLogout} onNavigate={navigate} />
      </>
    );
  }

  // ============================================
  // RENDERIZAÇÃO DESKTOP
  // ============================================
  return (
    <>
    <AppBar position="static" color="inherit" elevation={0}
      sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(20px)', backgroundColor: alpha(theme.palette.background.paper, 0.9) }}>
      <Toolbar>
        {/* ✅ CORRIGIDO: Box no lugar de Stack */}
        <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {isSaasAdmin && !isTenantMode ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AdminIcon sx={{ color: '#667eea' }} />
              <span>Painel SaaS</span>
            </Box>
          ) : (
            <>Olá, {usuario?.nome?.split(' ')[0] || 'Usuário'} 👋</>
          )}
        </Typography>

        {!(isSaasAdmin && !isTenantMode) && (
          <Search isMobile={false}>
            <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
            <StyledInputBase inputRef={searchInputRef} placeholder="Buscar clientes, serviços, produtos..." value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value.trim().length < MIN_SEARCH_CHARS) { setOpenSearch(false); setSearchAnchorEl(null); } else if (searchInputRef.current) { setSearchAnchorEl(searchInputRef.current); setOpenSearch(true); } }}
              isMobile={false} />
          </Search>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <RelogioDigital isMobile={false} />
          {renderCaixaStatusChip(false)}

          {!(isSaasAdmin && !isTenantMode) && unidades.length > 1 && (
            <TextField select size="small" value={unidadeAtualId} onChange={handleTrocarUnidade} disabled={loadingUnidades} label="Unidade"
              sx={{ minWidth: 190, display: { xs: 'none', lg: 'block' } }}
              InputProps={{ startAdornment: <ApartmentIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}>
              <MenuItem value="">Todas as unidades</MenuItem>
              {unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>)}
            </TextField>
          )}

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={unreadCount} color="secondary" max={99}><NotificationsIcon /></Badge>
            </IconButton>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar src={temFotoValida() ? fotoUrl : undefined} sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
              </Avatar>
            </IconButton>
          </motion.div>
        </Box>

        {/* Menu Notificações */}
        <Menu anchorEl={notificationsAnchor} open={Boolean(notificationsAnchor)} onClose={handleNotificationsClose}
          PaperProps={{ sx: { mt: 1.5, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', width: 360, maxHeight: 480 } }}
          TransitionComponent={Fade} transitionDuration={300}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Notificações {unreadCount > 0 && `(${unreadCount})`}</Typography>
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><NotificationsIcon sx={{ fontSize: 40, color: '#ccc' }} /><Typography variant="body2" color="textSecondary">Nenhuma notificação</Typography></Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.slice(0, 5).map(n => (
                <ListItem key={n.id} button onClick={() => { if (!n.lida) notificacoesService.marcarComoLida(n.id); navigate(normalizarLinkNotificacao(n, 'admin')); handleNotificationsClose(); }}
                  sx={{ bgcolor: n.lida ? 'transparent' : '#f3e5f5' }}>
                  <ListItemIcon>{getNotificationIcon(n.tipo)}</ListItemIcon>
                  <ListItemText primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{n.titulo}</Typography>}
                    secondary={<Typography variant="body2" color="textSecondary" noWrap>{n.mensagem}</Typography>} />
                  {!n.lida && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#667eea', ml: 1 }} />}
                </ListItem>
              ))}
            </List>
          )}
        </Menu>

        {/* Menu Usuário */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
          PaperProps={{ sx: { mt: 1.5, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: 200 } }}
          TransitionComponent={Fade} transitionDuration={300}>
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={temFotoValida() ? fotoUrl : undefined} sx={{ bgcolor: '#667eea', width: 40, height: 40 }}>
              {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
            </Avatar>
            <Box><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{usuario?.nome}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>{usuario?.cargo}</Typography></Box>
          </Box>
          <Divider />
          <MenuItem onClick={handlePerfil}><PersonIcon sx={{ mr: 2, fontSize: 20 }} /> Perfil</MenuItem>
          <MenuItem onClick={handleConfiguracoes}><SettingsIcon sx={{ mr: 2, fontSize: 20 }} /> Configurações</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: '#ff4081' }}><LogoutIcon sx={{ mr: 2, fontSize: 20 }} /> Sair</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
    <Dialog open={promptCaixa.open} onClose={() => fecharPromptCaixa(false)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}><AccountBalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Abrir caixa agora?</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>Não há caixa aberto. Para finalizar recebimentos e integrar o financeiro, abra o caixa antes de continuar.</Alert>
          <TextField fullWidth type="number" label="Valor de abertura" value={promptCaixa.valorAbertura} onChange={(e) => setPromptCaixa({ ...promptCaixa, valorAbertura: e.target.value })} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
          <TextField fullWidth multiline rows={3} label="Observação" value={promptCaixa.observacao} onChange={(e) => setPromptCaixa({ ...promptCaixa, observacao: e.target.value })} placeholder="Ex.: fundo inicial entregue ao operador." />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => fecharPromptCaixa(false)}>Agora não</Button>
        <Button variant="contained" color="success" onClick={() => fecharPromptCaixa(true)}>Abrir caixa</Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

export default ModernHeader;
