// src/components/ClienteLayout.js
// VERSÃO CORRIGIDA E MELHORADA - COM SIDEBAR MODERNO (COLAPSÁVEL E COM ANIMAÇÕES)

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
  Tooltip,
  Collapse,
  alpha,
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
  AccessTime as AccessTimeIcon,
  RateReview as RateReviewIcon,
  LocalOffer as LocalOfferIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { notificacoesPushService } from '../services/notificacoesPushService';
import { browserPushService } from '../services/browserPushService';
import { firebaseService } from '../services/firebase';
import Footer from './Footer';
import { useFidelidadeAtiva } from '../hooks/useFidelidadeAtiva';
import { normalizarLinkNotificacao } from '../utils/notificationUtils';
import { getLocalDateTime } from '../utils/dateTimeUtils';

// ============================================
// CONSTANTES
// ============================================

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/cliente/dashboard' },
  { text: 'Agendamentos', icon: <CalendarIcon />, path: '/cliente/agendamentos' },
  { text: 'Recompensas', icon: <GiftIcon />, path: '/cliente/recompensas', recurso: 'fidelidade' },
  { text: 'Meus Pontos', icon: <StarIcon />, path: '/cliente/pontos', recurso: 'fidelidade' },
  { text: 'Histórico', icon: <HistoryIcon />, path: '/cliente/historico' },
  { text: 'Depoimentos', icon: <RateReviewIcon />, path: '/cliente/depoimentos' },
  { text: 'Promoções', icon: <LocalOfferIcon />, path: '/cliente/promocoes' },
  { text: 'Perfil', icon: <PersonIcon />, path: '/cliente/perfil' },
  { text: 'Notificações', icon: <NotificationsIcon />, path: '/cliente/notificacoes' },
  { text: 'Anamnese', icon: <AssignmentIcon />, path: '/cliente/anamnese' },
  { text: 'Manual de Uso', icon: <HelpCenterIcon />, path: '/cliente/manual' },
];

const PAGE_TITLES = {
  '/cliente/dashboard': 'Dashboard do Cliente',
  '/cliente/agendamentos': 'Meus Agendamentos',
  '/cliente/recompensas': 'Recompensas',
  '/cliente/pontos': 'Meus Pontos',
  '/cliente/historico': 'Histórico',
  '/cliente/depoimentos': 'Depoimentos',
  '/cliente/promocoes': 'Promoções',
  '/cliente/perfil': 'Meu Perfil',
  '/cliente/notificacoes': 'Notificações',
  '/cliente/anamnese': 'Anamnese',
  '/cliente/manual': 'Manual de Uso',
};

const getBrasiliaTime = () => getLocalDateTime();

const portalContentSx = {
  '& .MuiTypography-h3': { fontSize: { xs: '1.45rem', sm: '1.75rem', md: '2rem' }, lineHeight: 1.18, fontWeight: 800 },
  '& .MuiTypography-h4': { fontSize: { xs: '1.3rem', sm: '1.55rem', md: '1.8rem' }, lineHeight: 1.2, fontWeight: 800 },
  '& .MuiTypography-h5': { fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.55rem' }, lineHeight: 1.25, fontWeight: 750 },
  '& .MuiTypography-h6': { fontSize: { xs: '1rem', sm: '1.08rem', md: '1.15rem' }, lineHeight: 1.3, fontWeight: 700 },
  '& .MuiTypography-subtitle1': { fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.35 },
  '& .MuiTypography-subtitle2': { fontSize: { xs: '0.86rem', sm: '0.92rem' }, lineHeight: 1.35 },
  '& .MuiTypography-body1': { fontSize: { xs: '0.9rem', sm: '0.96rem' }, lineHeight: 1.55 },
  '& .MuiTypography-body2': { fontSize: { xs: '0.82rem', sm: '0.88rem' }, lineHeight: 1.5 },
  '& .MuiTypography-caption': { fontSize: { xs: '0.72rem', sm: '0.76rem' }, lineHeight: 1.35 },
  '& .MuiButton-root': { textTransform: 'none', fontSize: { xs: '0.82rem', sm: '0.88rem' }, borderRadius: 2 },
  '& .MuiChip-root': { maxWidth: '100%' },
  '& .MuiChip-label': { fontSize: { xs: '0.7rem', sm: '0.74rem' }, overflow: 'hidden', textOverflow: 'ellipsis' },
  '& .MuiCard-root, & .MuiPaper-root': { boxSizing: 'border-box' },
  '& .MuiCardContent-root': { p: { xs: 1.5, sm: 2, md: 2.5 } },
  '& .MuiGrid-container': { width: '100%', marginLeft: 0 },
  '& .MuiTableContainer-root': { overflowX: 'auto' },
  '& img': { maxWidth: '100%', height: 'auto' },
};

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

const getClienteIds = (cliente, firebaseUser) => Array.from(new Set([
  firebaseUser?.uid,
  cliente?.id,
  cliente?.uid,
  cliente?.authUid,
  cliente?.googleUid,
  cliente?.email,
].filter(Boolean)));

const getAgendamentoServicoIds = (agendamento = {}) => Array.from(new Set([
  agendamento.servicoId,
  ...(agendamento.servicoIds || []),
  ...(agendamento.servicosIds || []),
  ...(agendamento.servicos || []).map((servico) => servico.id),
].flat().filter(Boolean)));

const getFormularioKey = (formulario = {}, index = 0) => {
  const explicitId = formulario.id || formulario.document_id || formulario.uid || formulario.codigo;
  if (explicitId) return String(explicitId);
  const base = [
    formulario.titulo,
    formulario.nome,
    formulario.nomeFormulario,
    formulario.servicoId,
    ...(formulario.servicoIds || []),
    ...(formulario.servicosIds || []),
  ].filter(Boolean).join('_');
  const slug = base.toString().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').toLowerCase();
  return slug || `formulario_${index}`;
};

const formularioAtendeServico = (formulario = {}, servicoIds = []) => {
  const ids = [formulario.servicoId, ...(formulario.servicoIds || []), ...(formulario.servicosIds || [])]
    .flat()
    .filter(Boolean);
  return ids.some((id) => servicoIds.includes(id));
};

// ============================================
// COMPONENTE DO SIDEBAR (MODERNO)
// ============================================
function ClientSidebar({ open, onClose, collapsed, onToggleCollapse, cliente, fidelidadeAtiva, formulariosPendentes, location, handleNavigation }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredItems = MENU_ITEMS.filter(item => item.recurso !== 'fidelidade' || fidelidadeAtiva);

  const logo = cliente?.empresa?.sitePublico?.logo || cliente?.empresaLogo || null;

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: collapsed ? 80 : 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? 80 : 280,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(156,39,176,0.08)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.03)',
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Cabeçalho com logo e botão de colapso */}
      <Box sx={{ p: collapsed ? 1 : 2, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {logo ? (
              <Avatar src={logo} sx={{ width: 40, height: 40 }} />
            ) : (
              <SpaIcon sx={{ fontSize: 36, color: '#9c27b0' }} />
            )}
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0', fontSize: '1.1rem' }}>
              BeautyPro
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <Tooltip title={collapsed ? 'Expandir menu' : 'Recolher menu'} placement="right">
            <IconButton onClick={onToggleCollapse} size="small" sx={{ mx: collapsed ? 'auto' : 0 }}>
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Perfil do cliente */}
      <Box sx={{ px: 2, py: 3, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: collapsed ? 1 : 2, backgroundColor: alpha('#9c27b0', 0.06), borderRadius: 3, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <Avatar src={cliente?.foto} sx={{ width: collapsed ? 40 : 56, height: collapsed ? 40 : 56, bgcolor: '#9c27b0' }}>
            {!cliente?.foto && getInitials(cliente?.nome)}
          </Avatar>
          {!collapsed && (
            <Box sx={{ overflow: 'hidden', flex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary" noWrap>Bem-vindo(a)</Typography>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>{cliente?.nome?.split(' ')[0] || 'Cliente'}</Typography>
              <Typography variant="caption" color="textSecondary" noWrap>{cliente?.email}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Lista de itens do menu */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {filteredItems.map((item) => {
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
                py: collapsed ? 1.2 : 1,
                px: collapsed ? 1 : 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
                backgroundColor: isActive ? alpha('#9c27b0', 0.12) : 'transparent',
                '&:hover': {
                  backgroundColor: alpha('#9c27b0', 0.06),
                },
                '& .MuiListItemIcon-root': {
                  color: isActive ? '#9c27b0' : theme.palette.text.secondary,
                  minWidth: collapsed ? 0 : 36,
                  mr: collapsed ? 0 : 1,
                  justifyContent: 'center',
                },
                '& .MuiListItemText-root': {
                  display: collapsed ? 'none' : 'block',
                },
              }}
            >
              <ListItemIcon>
                {badgeCount > 0 ? (
                  <Badge badgeContent={badgeCount} color="secondary">{item.icon}</Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#9c27b0' : 'inherit',
                  }}
                />
              )}
              {!collapsed && badgeCount > 0 && (
                <Typography variant="caption" sx={{ color: '#9c27b0', fontWeight: 600, ml: 1 }}>{badgeCount}</Typography>
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Botão sair */}
      <Divider sx={{ mx: 2 }} />
      <List sx={{ p: 1 }}>
        <ListItem
          button
          onClick={() => { const logoutFn = onClose?.logout || (() => {}); if (typeof logoutFn === 'function') logoutFn(); }}
          sx={{ borderRadius: 2, color: '#f44336', '&:hover': { bgcolor: '#ffebee' }, justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <ListItemIcon sx={{ color: '#f44336', minWidth: collapsed ? 0 : 36, mr: collapsed ? 0 : 1, justifyContent: 'center' }}><LogoutIcon /></ListItemIcon>
          {!collapsed && <ListItemText primary="Sair" />}
        </ListItem>
      </List>
    </Drawer>
  );
}

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
  const [collapsed, setCollapsed] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [notificacoesAnchor, setNotificacoesAnchor] = useState(null);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(false);
  const [pushStatus, setPushStatus] = useState(browserPushService.getPermission());
  const [ativandoPush, setAtivandoPush] = useState(false);
  const [formulariosPendentes, setFormulariosPendentes] = useState(0);
  const [horaBrasilia, setHoraBrasilia] = useState(getBrasiliaTime());
  const [configSistema, setConfigSistema] = useState(null);

  // ==========================================
  // FUNÇÕES (mesmas do original, mantidas)
  // ==========================================
  const carregarConfigSistema = useCallback(async () => {
    try {
      const configs = await firebaseService.getAll('configuracoes').catch(() => []);
      setConfigSistema(configs?.[0] || null);
    } catch (error) {
      console.warn('ClienteLayout - Erro ao carregar configuração do sistema:', error);
    }
  }, []);

  const carregarNotificacoes = useCallback(async () => {
    const idsCliente = getClienteIds(cliente, firebaseUser);
    if (idsCliente.length === 0) return [];

    try {
      setLoadingNotificacoes(true);
      const data = await notificacoesPushService.buscarNotificacoes(idsCliente).catch(() => []);

      const tiposFidelidade = ['pontos', 'nivel', 'recompensa', 'resgate'];
      const notificacoesVisiveis = fidelidadeAtiva ? (data || []) : (data || []).filter((item) => !tiposFidelidade.includes(item.tipo));

      const notificacoesOrdenadas = notificacoesVisiveis.sort((a, b) =>
        new Date(b.createdAt || b.data || 0) - new Date(a.createdAt || a.data || 0)
      );

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

  const verificarFormulariosPendentes = useCallback(async () => {
    const idsCliente = getClienteIds(cliente, firebaseUser);
    if (idsCliente.length === 0) return 0;

    try {
      const agendamentosPorId = await Promise.all(idsCliente.map((id) =>
        firebaseService.query('agendamentos', [
          { field: 'clienteId', operator: '==', value: id }
        ]).catch(() => [])
      ));
      const agendamentos = Array.from(new Map(agendamentosPorId.flat()
        .filter((agendamento) => ['confirmado', 'pendente'].includes(agendamento.status))
        .map((agendamento) => [agendamento.id, agendamento])).values());

      const formularios = await firebaseService.getAll('formularios_anamnese').catch(() => []);
      const respostasPorId = await Promise.all(idsCliente.map((id) =>
        firebaseService.query('respostas_anamnese', [
          { field: 'clienteId', operator: '==', value: id }
        ]).catch(() => [])
      ));
      const respostas = respostasPorId.flat();

      let pendentesCount = 0;
      for (const agendamento of agendamentos) {
        const servicoIds = getAgendamentoServicoIds(agendamento);
        const formulariosDoServico = formularios.filter((formulario) => formulario.ativo !== false && formularioAtendeServico(formulario, servicoIds));
        pendentesCount += formulariosDoServico.filter((formulario, formularioIndex) => {
          const formularioId = getFormularioKey(formulario, formularioIndex);
          return !respostas.some((resposta) => resposta.agendamentoId === agendamento.id && resposta.formularioId === formularioId);
        }).length;
      }

      setFormulariosPendentes(pendentesCount);
      return pendentesCount;
    } catch (error) {
      console.error('❌ Erro ao verificar formulários:', error);
      return 0;
    }
  }, [cliente, firebaseUser]);

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

  const irParaPrimeiroFormularioPendente = useCallback(async () => {
    try {
      const idsCliente = getClienteIds(cliente, firebaseUser);
      const agendamentosPorId = await Promise.all(idsCliente.map((id) =>
        firebaseService.query('agendamentos', [
          { field: 'clienteId', operator: '==', value: id }
        ]).catch(() => [])
      ));
      const agendamentos = Array.from(new Map(agendamentosPorId.flat()
        .filter((agendamento) => ['confirmado', 'pendente'].includes(agendamento.status))
        .sort((a, b) => String(a.data || '').localeCompare(String(b.data || '')))
        .map((agendamento) => [agendamento.id, agendamento])).values());
      const formularios = await firebaseService.getAll('formularios_anamnese').catch(() => []);
      const respostasPorId = await Promise.all(idsCliente.map((id) =>
        firebaseService.query('respostas_anamnese', [
          { field: 'clienteId', operator: '==', value: id }
        ]).catch(() => [])
      ));
      const respostas = respostasPorId.flat();

      for (const agendamento of agendamentos) {
        const servicoIds = getAgendamentoServicoIds(agendamento);
        const formulario = formularios.find((item, formularioIndex) => {
          const formularioId = getFormularioKey(item, formularioIndex);
          return item.ativo !== false && formularioAtendeServico(item, servicoIds) && !respostas.some((resposta) =>
            resposta.agendamentoId === agendamento.id && resposta.formularioId === formularioId
          );
        });

        if (formulario) {
          const formularioId = getFormularioKey(formulario, formularios.indexOf(formulario));
          navigate(`/cliente/agendamento/${agendamento.id}/anamnese?formularioId=${encodeURIComponent(formularioId)}`);
          return;
        }
      }

      navigate('/cliente/anamnese');
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      navigate('/cliente/anamnese');
    }
  }, [cliente, firebaseUser, navigate]);

  // ==========================================
  // EFEITOS (mantidos)
  // ==========================================
  useEffect(() => {
    const timer = setInterval(() => setHoraBrasilia(getBrasiliaTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!cliente?.id) return;

    const carregarDados = async () => {
      await carregarConfigSistema();
      await carregarNotificacoes();
      await verificarFormulariosPendentes();
    };

    carregarDados();

    const interval = setInterval(() => {
      carregarNotificacoes();
    }, 30000);

    return () => clearInterval(interval);
  }, [cliente, carregarConfigSistema, carregarNotificacoes, verificarFormulariosPendentes]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };
  const handleLogout = () => { logout(); navigate('/cliente/login'); };
  const handleNotificacoesClick = (event) => setNotificacoesAnchor(event.currentTarget);
  const handleNotificacoesClose = () => setNotificacoesAnchor(null);

  const ativarPushCliente = async () => {
    try {
      setAtivandoPush(true);
      const result = await browserPushService.ativar(cliente, 'cliente');
      setPushStatus(browserPushService.getPermission());
      if (result.ok) {
        await browserPushService.exibirLocal({
          titulo: 'Notificações ativadas',
          mensagem: 'Você receberá avisos de agendamentos, pontos, promoções e lembretes neste dispositivo.',
          link: '/cliente/notificacoes',
        });
      }
    } catch (error) {
      console.error('Erro ao ativar push no portal do cliente:', error);
      setPushStatus(browserPushService.getPermission());
    } finally {
      setAtivandoPush(false);
    }
  };

  const handleNotificacaoClick = async (notificacao) => {
    if (!notificacao.lida) await marcarNotificacaoComoLida(notificacao.id);
    navigate(normalizarLinkNotificacao(notificacao, 'cliente'));
    handleNotificacoesClose();
  };

  const getIconeNotificacao = (tipo) => NOTIFICATION_ICONS[tipo] || NOTIFICATION_ICONS.default;
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
    } catch { return ''; }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const salaoConfig = configSistema?.salao || {};
  const logoEstabelecimento = salaoConfig.logo || cliente?.empresa?.sitePublico?.logo || cliente?.empresaLogo || null;
  const nomeEstabelecimento = salaoConfig.nomeFantasia || salaoConfig.nome || cliente?.empresaNome || 'Portal do Cliente';
  const currentTitle = PAGE_TITLES[location.pathname] || (location.pathname.includes('/anamnese') ? 'Anamnese' : 'Área do Cliente');

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            left: { md: isMobile ? 0 : (collapsed ? 80 : 280) },
            width: { xs: '100%', md: isMobile ? '100%' : `calc(100% - ${collapsed ? 80 : 280}px)` },
            borderBottom: '1px solid rgba(156,39,176,0.12)',
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255,255,255,0.94)',
            zIndex: 1200,
            transition: theme.transitions.create(['left', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Toolbar sx={{ px: { xs: 1.5, sm: 2.5, md: 3 }, minHeight: { xs: 64, sm: 72 } }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
              <Avatar src={logoEstabelecimento || undefined} sx={{ width: { xs: 36, sm: 42 }, height: { xs: 36, sm: 42 }, mr: 1.5, background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)' }}>
                {!logoEstabelecimento && <SpaIcon />}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: '#9c27b0', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', display: { xs: 'none', sm: 'block' } }}>
                  {nomeEstabelecimento}
                </Typography>
                <Typography variant="h6" noWrap sx={{ color: '#2c2c2c', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem', md: '1.35rem' } }}>
                  {currentTitle}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 3, px: 2, py: 0.75, mr: 2 }}>
              <CalendarIcon sx={{ fontSize: 18, color: '#9c27b0', mr: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>{horaBrasilia.data}</Typography>
              <AccessTimeIcon sx={{ fontSize: 18, color: '#ff4081', mr: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#ff4081' }}>{horaBrasilia.hora}</Typography>
            </Box>

            <IconButton color="inherit" onClick={handleNotificacoesClick} sx={{ mr: { xs: 0.5, sm: 1 }, bgcolor: 'rgba(156,39,176,0.06)', '&:hover': { bgcolor: 'rgba(156,39,176,0.12)' } }}>
              <Badge badgeContent={notificacoesNaoLidas} color="secondary"><NotificationsIcon /></Badge>
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={cliente?.foto} sx={{ width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 }, bgcolor: '#9c27b0' }}>
                {!cliente?.foto && getInitials(cliente?.nome)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', lg: 'block' }, maxWidth: 180 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>{cliente?.nome || 'Cliente'}</Typography>
                <Typography variant="caption" color="textSecondary" noWrap>{cliente?.email || cliente?.empresaNome || 'Portal do cliente'}</Typography>
              </Box>
              <IconButton onClick={handleLogout} sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: '#f44336' }}>
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar Moderno */}
        <ClientSidebar
          open={mobileOpen}
          onClose={handleDrawerToggle}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          cliente={cliente}
          fidelidadeAtiva={fidelidadeAtiva}
          formulariosPendentes={formulariosPendentes}
          location={location}
          handleNavigation={handleNavigation}
          // Passamos logout para o botão sair
          logout={handleLogout}
        />

        {/* Conteúdo Principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden',
            p: { xs: 1.25, sm: 2, md: 3 },
            pt: { xs: '76px', sm: '88px', md: '96px' },
            backgroundColor: '#faf5ff',
            minHeight: '100vh',
            position: 'relative',
            ...portalContentSx,
          }}
        >
          {/* Badge Formulários Pendentes */}
          {formulariosPendentes > 0 && (
            <Box
              sx={{
                position: 'fixed',
                top: isMobile ? 70 : 80,
                right: { xs: 12, sm: 20 },
                left: { xs: 12, sm: 'auto' },
                zIndex: 999,
                cursor: 'pointer',
              }}
              onClick={irParaPrimeiroFormularioPendente}
            >
              <Paper elevation={3} sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ff9800', '&:hover': { bgcolor: '#ffe0b2' } }}>
                <Badge badgeContent={formulariosPendentes} color="warning"><AssignmentIcon sx={{ color: '#ff9800' }} /></Badge>
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
            style={{ width: '100%', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}
          >
            <Outlet />
          </motion.div>
        </Box>
      </Box>

      <Footer />

      {/* Popover Notificações (mantido) */}
      <Popover
        open={Boolean(notificacoesAnchor)}
        anchorEl={notificacoesAnchor}
        onClose={handleNotificacoesClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: { xs: 'calc(100vw - 24px)', sm: 360 }, maxWidth: 360, maxHeight: { xs: '70vh', sm: 480 }, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Notificações</Typography>
          {notificacoesNaoLidas > 0 && <Button size="small" onClick={marcarTodasComoLidas}>Marcar todas como lidas</Button>}
        </Box>
        {browserPushService.isSupported() && pushStatus !== 'granted' && (
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              onClick={ativarPushCliente}
              disabled={ativandoPush || pushStatus === 'denied'}
              sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)' }}
            >
              {pushStatus === 'denied' ? 'Push bloqueado no navegador' : ativandoPush ? 'Ativando...' : 'Ativar notificação push'}
            </Button>
          </Box>
        )}
        <Divider />

        {loadingNotificacoes ? (
          <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={30} /><Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Carregando...</Typography></Box>
        ) : notificacoes.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}><NotificationsIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} /><Typography variant="body2" color="textSecondary">Nenhuma notificação</Typography></Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notificacoes.slice(0, 10).map((notificacao) => (
              <React.Fragment key={notificacao.id}>
                <ListItem button onClick={() => handleNotificacaoClick(notificacao)} sx={{ bgcolor: notificacao.lida ? 'transparent' : '#f3e5f5', py: 1.5 }}>
                  <ListItemIcon>{getIconeNotificacao(notificacao.tipo)}</ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{notificacao.titulo}</Typography>}
                    secondary={<><Typography variant="body2" color="textSecondary" noWrap>{notificacao.mensagem}</Typography><Typography variant="caption" color="textSecondary">{formatarData(notificacao.createdAt || notificacao.data)}</Typography></>}
                  />
                  {!notificacao.lida && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9c27b0', ml: 1 }} />}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {notificacoes.length > 10 && (
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Button size="small" onClick={() => { handleNotificacoesClose(); navigate('/cliente/notificacoes'); }}>Ver todas ({notificacoes.length})</Button>
              </Box>
            )}
          </List>
        )}
      </Popover>
    </Box>
  );
}

export default ClienteLayout;
