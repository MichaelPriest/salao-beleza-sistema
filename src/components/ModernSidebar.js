// src/components/ModernSidebar.js - ATUALIZADO COM NOVAS ROTAS SAAS

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Avatar,
  Typography,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Collapse,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
  Fab,
  Zoom,
  Paper,
  alpha,
} from '@mui/material';
import {
  // Dashboard
  Dashboard as DashboardIcon,
  DashboardCustomize as DashboardCustomizeIcon,

  // Notificações
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,

  // Agendamentos
  CalendarMonth as CalendarIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  DateRange as DateRangeIcon,
  Schedule as ScheduleIcon,

  // Atendimentos
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,

  // Clientes
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PersonSearch as PersonSearchIcon,
  Group as GroupIcon,

  // Histórico
  History as HistoryIcon,
  Restore as RestoreIcon,
  Timeline as TimelineIcon,

  // Profissionais
  Person as PersonIcon,
  Badge as BadgeIcon,
  Groups as GroupsIcon,

  // Serviços
  ContentCut as CutIcon,
  Build as BuildIcon,
  Handyman as HandymanIcon,

  // Financeiro
  AttachMoney as MoneyIcon,
  AccountBalance as AccountBalanceIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ReceiptOutlined as ReceiptOutlinedIcon,

  // Compras
  ShoppingCart as ShoppingCartIcon,
  AddShoppingCart as AddShoppingCartIcon,
  RemoveShoppingCart as RemoveShoppingCartIcon,

  // Relatórios
  Summarize as SummarizeIcon,
  Description as DescriptionIcon,
  FilePresent as FilePresentIcon,

  // Estoque
  Inventory as InventoryIcon,
  Inventory2 as Inventory2Icon,
  Warehouse as WarehouseIcon,
  Storage as StorageIcon,

  // Entradas
  Input as InputIcon,
  MoveToInbox as MoveToInboxIcon,
  Unarchive as UnarchiveIcon,

  // Fornecedores
  LocalShipping as LocalShippingIcon,
  DeliveryDining as DeliveryDiningIcon,
  Factory as FactoryIcon,

  // Usuários
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManageAccountsIcon,
  Security as SecurityIcon,

  // Configurações
  Settings as SettingsIcon,
  SettingsApplications as SettingsApplicationsIcon,
  Tune as TuneIcon,
  Business as BusinessIcon,
  Apartment as ApartmentIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Payments as PaymentsIcon,
  Language as LanguageIcon,

  // Ícones de navegação
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,

  // Ícones adicionais
  Spa as SpaIcon,
  PriceCheck as PriceCheckIcon,
  PointOfSale as PointOfSaleIcon,
  CreditCard as CreditCardIcon,
  Pix as PixIcon,
  QrCodeScanner as QrCodeIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Backup as BackupIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  HelpCenter as HelpCenterIcon,
  Close as CloseIcon,
  EmojiEvents as EmojiEventsIcon,
  CardGiftcard as CardGiftcardIcon,
  Loyalty as LoyaltyIcon,
  Stars as StarsIcon,
  Redeem as RedeemIcon,

  // Ícones para cupons
  LocalOffer as TagIcon,
  Sell as SellIcon,

  // Ícones para relatórios adicionais
  ShowChart as ShowChartIcon,
  Equalizer as EqualizerIcon,
  Analytics as AnalyticsIcon,

  // Ícones para campanhas
  Campaign as CampaignIcon,

  // Ícones para categorias
  Category as CategoryIcon,

  // Anamnese
  Quiz as QuizIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Checklist as ChecklistIcon,
  FormatListBulleted as ListBulletedIcon,
  Ballot as BallotIcon,
  SwapHoriz as SwapHorizIcon,
  SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { motion, AnimatePresence } from 'framer-motion';
import { firebaseService, getTenantContext } from '../services/firebase';
import { useFidelidadeAtiva } from '../hooks/useFidelidadeAtiva';
import { usuariosService } from '../services/usuariosService';
import { isSaasPlatformAdmin } from '../utils/saasAccess';
import { saasService } from '../services/saasService';

// ============================================
// ESTRUTURA DO MENU ATUALIZADA
// ============================================
const menuGroups = [
  {
    title: 'INÍCIO',
    icon: <DashboardCustomizeIcon />,
    items: [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
        permission: 'visualizar_dashboard',
        cargos: ['admin', 'gerente', 'atendente', 'profissional', 'cliente']
      },
      {
        text: 'Notificações',
        icon: <NotificationsActiveIcon />,
        path: '/notificacoes',
        permission: 'visualizar_notificacoes',
        cargos: ['admin', 'gerente', 'atendente', 'profissional', 'cliente'],
        badge: 'unread'
      },
    ],
  },
  {
    title: 'AGENDA E ATENDIMENTOS',
    icon: <EventAvailableIcon />,
    items: [
      {
        text: 'Agenda',
        icon: <DateRangeIcon />,
        path: '/agendamentos',
        permission: 'gerenciar_agendamentos',
        cargos: ['admin', 'gerente', 'atendente', 'profissional', 'cliente']
      },
      {
        text: 'Atendimentos',
        icon: <AssignmentTurnedInIcon />,
        path: '/atendimentos',
        permission: 'gerenciar_atendimentos',
        cargos: ['admin', 'gerente', 'atendente', 'profissional']
      },
      {
        text: 'Histórico de Atendimentos',
        icon: <HistoryIcon />,
        path: '/historico',
        permission: 'visualizar_relatorios',
        cargos: ['admin', 'gerente', 'atendente', 'profissional', 'cliente']
      },
    ],
  },
  {
    title: 'CLIENTES E FIDELIDADE',
    icon: <PersonSearchIcon />,
    items: [
      {
        text: 'Clientes',
        icon: <GroupIcon />,
        path: '/clientes',
        permission: 'gerenciar_clientes',
        cargos: ['admin', 'gerente', 'atendente']
      },
      {
        text: 'Fidelidade',
        icon: <EmojiEventsIcon />,
        path: '/fidelidade',
        permission: 'visualizar_fidelidade',
        cargos: ['admin', 'gerente', 'atendente', 'cliente']
      },
      {
        text: 'Gerenciar Fidelidade',
        icon: <EmojiEventsIcon />,
        path: '/fidelidade/gerenciar',
        permission: 'visualizar_fidelidade',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Baixar Resgates',
        icon: <RedeemIcon />,
        path: '/fidelidade/gerenciar?tab=resgates',
        permission: 'visualizar_fidelidade',
        cargos: ['admin', 'gerente', 'atendente']
      },
      {
        text: 'Recompensas',
        icon: <CardGiftcardIcon />,
        path: '/fidelidade/recompensas',
        permission: 'visualizar_fidelidade',
        cargos: ['admin', 'gerente', 'atendente', 'cliente']
      },
      {
        text: 'Indicações',
        icon: <RedeemIcon />,
        path: '/indicacoes',
        permission: 'gerenciar_indicacoes',
        cargos: ['admin', 'gerente', 'atendente', 'cliente']
      },
    ],
  },
  {
    title: 'PROFISSIONAIS E SERVIÇOS',
    icon: <GroupsIcon />,
    items: [
      {
        text: 'Profissionais',
        icon: <BadgeIcon />,
        path: '/profissionais',
        permission: 'gerenciar_profissionais',
        cargos: ['admin', 'gerente', 'atendente']
      },
      {
        text: 'RH',
        icon: <GroupsIcon />,
        path: '/rh',
        permission: 'gerenciar_profissionais',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Serviços',
        icon: <HandymanIcon />,
        path: '/servicos',
        permission: 'gerenciar_servicos',
        cargos: ['admin', 'gerente', 'atendente']
      },
      {
        text: 'Comissões',
        icon: <MoneyIcon />,
        path: '/minhas-comissoes',
        permission: 'visualizar_comissoes',
        cargos: ['admin', 'gerente', 'profissional']
      },
      {
        text: 'Disponibilidade',
        icon: <ScheduleIcon />,
        path: '/disponibilidade',
        permission: 'gerenciar_disponibilidade',
        cargos: ['admin', 'gerente', 'profissional']
      },
    ],
  },
  {
    title: 'ESTOQUE E PRODUTOS',
    icon: <Inventory2Icon />,
    items: [
      {
        text: 'Produtos',
        icon: <StorageIcon />,
        path: '/estoque',
        permission: 'gerenciar_estoque',
        cargos: ['admin', 'gerente', 'atendente']
      },
      {
        text: 'Categorias',
        icon: <CategoryIcon />,
        path: '/categorias-produtos',
        permission: 'gerenciar_estoque',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Entradas',
        icon: <MoveToInboxIcon />,
        path: '/entradas',
        permission: 'gerenciar_estoque',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Fornecedores',
        icon: <FactoryIcon />,
        path: '/fornecedores',
        permission: 'gerenciar_compras',
        cargos: ['admin', 'gerente']
      },
    ],
  },
  {
    title: 'FINANCEIRO',
    icon: <AccountBalanceWalletIcon />,
    items: [
      {
        text: 'Dashboard',
        icon: <BarChartIcon />,
        path: '/financeiro',
        permission: 'financeiro',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Contas a Receber',
        icon: <TrendingUpIcon />,
        path: '/financeiro/receber',
        permission: 'financeiro',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Contas a Pagar',
        icon: <TrendingDownIcon />,
        path: '/financeiro/pagar',
        permission: 'financeiro',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Fluxo de Caixa',
        icon: <TimelineIcon />,
        path: '/financeiro/fluxo',
        permission: 'financeiro',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Compras',
        icon: <AddShoppingCartIcon />,
        path: '/compras',
        permission: 'gerenciar_compras',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Relatórios',
        icon: <SummarizeIcon />,
        path: '/relatorios',
        permission: 'visualizar_relatorios',
        cargos: ['admin', 'gerente']
      },
    ],
  },
  {
    title: 'MARKETING E PROMOÇÕES',
    icon: <SellIcon />,
    items: [
      {
        text: 'Cupons de Desconto',
        icon: <TagIcon />,
        path: '/cupons',
        permission: 'gerenciar_cupons',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Campanhas',
        icon: <CampaignIcon />,
        path: '/campanhas',
        permission: 'gerenciar_cupons',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Análise de Cupons',
        icon: <AnalyticsIcon />,
        path: '/analise-cupons',
        permission: 'visualizar_relatorios',
        cargos: ['admin', 'gerente']
      },
    ],
  },
  {
    title: 'ANAMNESE E FORMULÁRIOS',
    icon: <ChecklistIcon />,
    items: [
      {
        text: 'Formulários',
        icon: <AssignmentIcon />,
        path: '/anamnese/formularios',
        permission: 'gerenciar_anamnese',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Respostas',
        icon: <QuestionAnswerIcon />,
        path: '/anamnese/respostas',
        permission: 'visualizar_anamnese',
        cargos: ['admin', 'gerente', 'atendente', 'profissional']
      },
      {
        text: 'Modelos',
        icon: <BallotIcon />,
        path: '/anamnese/modelos',
        permission: 'gerenciar_anamnese',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Relatórios',
        icon: <ListBulletedIcon />,
        path: '/anamnese/relatorios',
        permission: 'visualizar_relatorios',
        cargos: ['admin', 'gerente']
      },
    ],
  },
  {
    title: 'RELATÓRIOS E ANÁLISES',
    icon: <AssessmentIcon />,
    items: [
      {
        text: 'Relatórios Gerenciais',
        icon: <SummarizeIcon />,
        path: '/relatorios',
        permission: 'visualizar_relatorios',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Análise de Vendas',
        icon: <ShowChartIcon />,
        path: '/analise-vendas',
        permission: 'visualizar_relatorios',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Performance',
        icon: <EqualizerIcon />,
        path: '/performance',
        permission: 'visualizar_relatorios',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Auditoria',
        icon: <SecurityIcon />,
        path: '/auditoria',
        permission: 'visualizar_relatorios',
        cargos: ['admin']
      },
    ],
  },
  // ============================================
  // 🔥 ATUALIZADO: ADMIN SAAS COM NOVAS ROTAS
  // ============================================
  {
    title: 'ADMIN SAAS',
    icon: <WorkspacePremiumIcon />,
    items: [
      {
        text: 'Painel SaaS',
        icon: <DashboardIcon />,
        path: '/saas-admin',
        permission: 'admin_saas',
        cargos: ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'],
        plataformaOnly: true
      },
      {
        text: 'Empresas/Tenants',
        icon: <BusinessIcon />,
        path: '/saas-admin/empresas',
        permission: 'admin_saas',
        cargos: ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'],
        plataformaOnly: true
      },
      {
        text: 'Planos e Assinaturas',
        icon: <WorkspacePremiumIcon />,
        path: '/saas-admin/assinaturas',
        permission: 'admin_saas',
        cargos: ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'],
        plataformaOnly: true
      },
      {
        text: 'Cobranças',
        icon: <ReceiptLongIcon />,
        path: '/saas-admin/cobrancas',
        permission: 'admin_saas',
        cargos: ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'],
        plataformaOnly: true
      },
      {
        text: 'Config. Pagamentos',
        icon: <PaymentsIcon />,
        path: '/saas-admin/pagamentos',
        permission: 'admin_saas',
        cargos: ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'],
        plataformaOnly: true
      },
      {
        text: 'Relatórios SaaS',
        icon: <AnalyticsIcon />,
        path: '/saas-admin/relatorios',
        permission: 'admin_saas',
        cargos: ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'],
        plataformaOnly: true
      },
      {
        text: 'Chamados',
        icon: <SupportAgentIcon />,
        path: '/chamados',
        permission: 'admin_saas',
        cargos: ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'],
        plataformaOnly: true
      },
      {
        text: 'Acessar Empresa',
        icon: <SwapHorizIcon />,
        path: '/selecionar-empresa',
        permission: 'admin_saas',
        cargos: ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'],
        plataformaOnly: true
      },
    ],
  },
  // ============================================
  // 🔥 ATUALIZADO: MINHA EMPRESA COM NOVAS ROTAS
  // ============================================
  {
    title: 'MINHA EMPRESA',
    icon: <BusinessIcon />,
    items: [
      {
        text: 'Dados da Empresa',
        icon: <BusinessIcon />,
        path: '/empresa',
        permission: 'configurar_sistema',
        cargos: ['admin']
      },
      {
        text: 'Unidades',
        icon: <ApartmentIcon />,
        path: '/empresa/unidades',
        permission: 'configurar_sistema',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Planos',
        icon: <WorkspacePremiumIcon />,
        path: '/empresa/planos',
        permission: 'configurar_sistema',
        cargos: ['admin']
      },
      {
        text: 'Assinatura',
        icon: <WorkspacePremiumIcon />,
        path: '/empresa/assinatura',
        permission: 'configurar_sistema',
        cargos: ['admin']
      },
      {
        text: 'Cobrança',
        icon: <PaymentsIcon />,
        path: '/empresa/cobranca',
        permission: 'financeiro',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Página Pública',
        icon: <LanguageIcon />,
        path: '/empresa/site',
        permission: 'configurar_sistema',
        cargos: ['admin', 'gerente']
      },
    ],
  },
  {
    title: 'ADMINISTRAÇÃO',
    icon: <ManageAccountsIcon />,
    items: [
      {
        text: 'Usuários',
        icon: <AdminIcon />,
        path: '/usuarios',
        permission: 'gerenciar_usuarios',
        cargos: ['admin']
      },
      {
        text: 'Configurações',
        icon: <TuneIcon />,
        path: '/configuracoes',
        permission: 'configurar_sistema',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Manual do Sistema',
        icon: <HelpCenterIcon />,
        path: '/manual',
        cargos: ['admin', 'gerente', 'atendente', 'profissional']
      },
      {
        text: 'Suporte',
        icon: <SupportAgentIcon />,
        path: '/chamados',
        permission: 'visualizar_chamados',
        cargos: ['admin', 'gerente']
      },
      {
        text: 'Backup',
        icon: <BackupIcon />,
        path: '/backup',
        permission: 'gerenciar_backup',
        cargos: ['admin']
      },
      {
        text: 'Logs do Sistema',
        icon: <InfoIcon />,
        path: '/logs',
        permission: 'visualizar_logs',
        cargos: ['admin']
      },
    ],
  },
];

// ============================================
// ÍCONES EXTRAS
// ============================================
export const extraIcons = {
  success: <CheckCircleIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
  info: <InfoIcon />,
  print: <PrintIcon />,
  download: <DownloadIcon />,
  upload: <UploadIcon />,
  backup: <BackupIcon />,
  restore: <RestoreFromTrashIcon />,
  pix: <PixIcon />,
  creditCard: <CreditCardIcon />,
  pointOfSale: <PointOfSaleIcon />,
  priceCheck: <PriceCheckIcon />,
  qrCode: <QrCodeIcon />,
  emojiEvents: <EmojiEventsIcon />,
  cardGiftcard: <CardGiftcardIcon />,
  loyalty: <LoyaltyIcon />,
  stars: <StarsIcon />,
  redeem: <RedeemIcon />,
  tag: <TagIcon />,
  sell: <SellIcon />,
  analytics: <AnalyticsIcon />,
  showChart: <ShowChartIcon />,
  equalizer: <EqualizerIcon />,
  campaign: <CampaignIcon />,
  category: <CategoryIcon />,
  schedule: <ScheduleIcon />,
  assignment: <AssignmentIcon />,
  quiz: <QuizIcon />,
  questionAnswer: <QuestionAnswerIcon />,
  checklist: <ChecklistIcon />,
  listBulleted: <ListBulletedIcon />,
  ballot: <BallotIcon />,
  swapHoriz: <SwapHorizIcon />,
  supportAgent: <SupportAgentIcon />,
  business: <BusinessIcon />,
  apartment: <ApartmentIcon />,
  workspacePremium: <WorkspacePremiumIcon />,
  payments: <PaymentsIcon />,
  language: <LanguageIcon />,
};

// ============================================
// COMPONENTE MOBILE SIDEBAR
// ============================================
const MobileSidebar = ({ open, onClose, usuario, fotoUrl, unreadCount, filteredGroups, location, handleGroupClick, openGroups, isGroupActive }) => {
  const theme = useTheme();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const temFotoValida = () => {
    return fotoUrl && fotoUrl !== 'null' && fotoUrl !== 'undefined' && fotoUrl.trim() !== '';
  };

  const renderUserProfile = () => (
    <Box
      sx={{
        p: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
        <Avatar
          src={temFotoValida() ? fotoUrl : undefined}
          sx={{
            width: 56,
            height: 56,
            border: '3px solid white',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            bgcolor: '#ffffff',
            color: theme.palette.primary.main,
            fontWeight: 'bold',
          }}
        >
          {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', mb: 0.5 }}>
            {usuario?.nome || 'Usuário'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'capitalize' }}>
              {usuario?.cargo || 'Usuário'}
            </Typography>
            <Badge
              variant="dot"
              color="success"
              sx={{
                '& .MuiBadge-badge': {
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const renderGroup = (group) => {
    const groupActive = isGroupActive(group);
    const isOpen = openGroups[group.title] || false;

    return (
      <Box key={group.title} sx={{ mb: 1 }}>
        <ListItemButton
          onClick={() => handleGroupClick(group.title)}
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 2,
            mx: 1,
            backgroundColor: groupActive && !isOpen ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{
            minWidth: 40,
            color: groupActive ? theme.palette.primary.main : theme.palette.text.secondary,
          }}>
            {group.icon}
          </ListItemIcon>
          <ListItemText
            primary={group.title}
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: groupActive ? theme.palette.primary.main : 'textSecondary',
            }}
          />
          {isOpen ? <ExpandLessIcon sx={{ color: 'textSecondary' }} /> : <ExpandMoreIcon sx={{ color: 'textSecondary' }} />}
        </ListItemButton>

        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {group.items.map((item) => {
              const itemPath = item.path?.split('?')[0] || '';
              const itemSearch = item.path?.includes('?') ? `?${item.path.split('?')[1]}` : '';
              const isActive = (location.pathname === itemPath && (!itemSearch || location.search === itemSearch)) ||
                (!itemSearch && itemPath !== '/' && location.pathname.startsWith(itemPath));

              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem
                    component={Link}
                    to={item.path}
                    onClick={onClose}
                    sx={{
                      pl: 4,
                      py: 1.2,
                      ml: 2,
                      mr: 1,
                      borderRadius: 2,
                      backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                      color: isActive ? theme.palette.primary.main : 'text.primary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                      '& .MuiListItemIcon-root': {
                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                        minWidth: 36,
                      },
                    }}
                  >
                    <ListItemIcon>
                      {item.text === 'Notificações' ? (
                        <Badge badgeContent={unreadCount} color="secondary" max={99}>
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  </ListItem>
                </motion.div>
              );
            })}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableBackdropTransition={true}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          width: 280,
          backgroundColor: '#ffffff',
          borderRadius: '0 20px 20px 0',
          backgroundImage: 'none',
        },
      }}
    >
      {renderUserProfile()}

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 2,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.action.hover,
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.primary.main,
            borderRadius: '4px',
          },
        }}
      >
        {filteredGroups.map(renderGroup)}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Versão 3.0.0
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'textSecondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </SwipeableDrawer>
  );
};

// ============================================
// COMPONENTE DESKTOP SIDEBAR
// ============================================
const DesktopSidebar = ({ collapsed, onToggleCollapse, usuario, fotoUrl, unreadCount, filteredGroups, location, handleGroupClick, openGroups, isGroupActive }) => {
  const theme = useTheme();
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const temFotoValida = () => {
    return fotoUrl && fotoUrl !== 'null' && fotoUrl !== 'undefined' && fotoUrl.trim() !== '';
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? 80 : 300,
        flexShrink: 0,
        transition: theme => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: collapsed ? 80 : 300,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
          overflowX: 'hidden',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: collapsed ? 1 : 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {!collapsed ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpaIcon sx={{ fontSize: 40, color: '#667eea' }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                Beauty<span style={{ color: '#764ba2' }}>Pro</span>
              </Typography>
            </Box>
            <Tooltip title="Recolher menu" placement="right">
              <IconButton onClick={onToggleCollapse} size="small">
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Expandir menu" placement="right">
            <IconButton onClick={onToggleCollapse} sx={{ mx: 'auto' }}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Perfil */}
      <Box sx={{ px: 2, py: 3, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: collapsed ? 1 : 2,
            backgroundColor: alpha('#667eea', 0.08),
            borderRadius: 3,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Avatar
            src={temFotoValida() ? fotoUrl : undefined}
            sx={{
              width: collapsed ? 40 : 56,
              height: collapsed ? 40 : 56,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
          </Avatar>

          {!collapsed && (
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" color="textSecondary" noWrap>
                Bem-vindo(a)
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                {usuario?.nome?.split(' ')[0] || 'Usuário'}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize' }} noWrap>
                {usuario?.cargo || 'Usuário'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Menu */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 1,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.action.hover,
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#667eea',
            borderRadius: '4px',
          },
        }}
      >
        {filteredGroups.map((group) => {
          const groupActive = isGroupActive(group);
          const isOpen = openGroups[group.title] || false;

          return (
            <Box key={group.title} sx={{ mb: 1 }}>
              {!collapsed ? (
                <>
                  <ListItemButton
                    onClick={() => handleGroupClick(group.title)}
                    sx={{
                      py: 1,
                      px: 2,
                      borderRadius: 2,
                      backgroundColor: groupActive && !isOpen ? alpha('#667eea', 0.08) : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha('#667eea', 0.08),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: groupActive ? '#667eea' : alpha('#000', 0.54) }}>
                      {group.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={group.title}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: groupActive ? '#667eea' : 'textSecondary',
                      }}
                    />
                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>

                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {group.items.map((item) => {
                        const itemPath = item.path?.split('?')[0] || '';
                        const itemSearch = item.path?.includes('?') ? `?${item.path.split('?')[1]}` : '';
                        const isActive = (location.pathname === itemPath && (!itemSearch || location.search === itemSearch)) ||
                          (!itemSearch && itemPath !== '/' && location.pathname.startsWith(itemPath));

                        return (
                          <motion.div
                            key={item.text}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ListItem
                              component={Link}
                              to={item.path}
                              sx={{
                                pl: 4,
                                py: 0.8,
                                borderRadius: '0 20px 20px 0',
                                mr: 1,
                                backgroundColor: isActive ? alpha('#667eea', 0.12) : 'transparent',
                                color: isActive ? '#667eea' : 'text.primary',
                                '&:hover': {
                                  backgroundColor: alpha('#667eea', 0.08),
                                },
                                '& .MuiListItemIcon-root': {
                                  color: isActive ? '#667eea' : theme.palette.text.secondary,
                                  minWidth: 36,
                                },
                              }}
                            >
                              <ListItemIcon>
                                {item.text === 'Notificações' ? (
                                  <Badge badgeContent={unreadCount} color="secondary">
                                    {item.icon}
                                  </Badge>
                                ) : (
                                  item.icon
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                  fontSize: '0.95rem',
                                  fontWeight: isActive ? 600 : 400,
                                  noWrap: true,
                                }}
                              />
                            </ListItem>
                          </motion.div>
                        );
                      })}
                    </List>
                  </Collapse>
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, my: 1 }}>
                  <Tooltip title={group.title} placement="right">
                    <IconButton
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: groupActive ? alpha('#667eea', 0.12) : 'transparent',
                        color: groupActive ? '#667eea' : theme.palette.text.secondary,
                        '&:hover': {
                          backgroundColor: alpha('#667eea', 0.08),
                        },
                      }}
                    >
                      {group.icon}
                    </IconButton>
                  </Tooltip>

                  {group.items.map((item) => {
                    const itemPath = item.path?.split('?')[0] || '';
                    const itemSearch = item.path?.includes('?') ? `?${item.path.split('?')[1]}` : '';
                    const isActive = location.pathname === itemPath && (!itemSearch || location.search === itemSearch);
                    return (
                      <Tooltip key={item.text} title={item.text} placement="right">
                        <IconButton
                          component={Link}
                          to={item.path}
                          size="small"
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: isActive ? alpha('#667eea', 0.12) : 'transparent',
                            color: isActive ? '#667eea' : theme.palette.text.secondary,
                            '&:hover': {
                              backgroundColor: alpha('#667eea', 0.08),
                            },
                          }}
                        >
                          {item.text === 'Notificações' && unreadCount > 0 ? (
                            <Badge badgeContent={unreadCount} color="secondary" variant="dot">
                              {item.icon}
                            </Badge>
                          ) : (
                            item.icon
                          )}
                        </IconButton>
                      </Tooltip>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {!collapsed && (
        <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="textSecondary">
            Versão 3.0.0
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function ModernSidebar() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [recursosPlano, setRecursosPlano] = useState([]);
  const { fidelidadeAtiva } = useFidelidadeAtiva();

  const carregarUsuario = () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      setUsuario(user);
      if (user?.avatar && user.avatar !== 'null' && user.avatar !== 'undefined' && user.avatar.trim() !== '') {
        setFotoUrl(user.avatar);
      } else {
        setFotoUrl(null);
      }
    } catch (error) {
      console.error('Sidebar - Erro ao carregar usuário:', error);
      setUsuario(null);
      setFotoUrl(null);
    }
  };

  const carregarRecursosPlano = async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      if (!user || isSaasPlatformAdmin(user)) {
        setRecursosPlano([]);
        return;
      }
      const empresaId = user.empresaId || user.tenantId || user.empresa?.id;
      if (!empresaId) {
        setRecursosPlano([]);
        return;
      }
      const assinatura = await saasService.buscarAssinaturaAtual(empresaId).catch(() => null);
      const plano = await saasService.buscarPlano(assinatura?.planoId || user.planoId || user.empresa?.planoId).catch(() => null);
      setRecursosPlano(plano?.recursos || assinatura?.recursos || user.recursosPlano || []);
    } catch (error) {
      console.error('Erro ao carregar recursos do plano:', error);
      setRecursosPlano([]);
    }
  };

  useEffect(() => {
    carregarUsuario();
    carregarRecursosPlano();

    const initialOpenState = {};
    menuGroups.forEach(group => {
      initialOpenState[group.title] = false;
    });
    setOpenGroups(initialOpenState);

    const handleUsuarioAtualizado = () => {
      carregarUsuario();
      carregarRecursosPlano();
    };

    window.addEventListener('usuarioAtualizado', handleUsuarioAtualizado);
    return () => window.removeEventListener('usuarioAtualizado', handleUsuarioAtualizado);
  }, []);

  const carregarNotificacoes = async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      if (user && user.uid) {
        const data = await firebaseService.query('notificacoes', [
          { field: 'usuarioId', operator: '==', value: user.uid }
        ], 'data');
        setUnreadCount(data.filter(n => !n.lida).length);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const recursoLiberadoNoPlano = (item) => {
    if (!item.recursoPlano && recursosPlano.length === 0) return true;
    const recurso = item.recursoPlano || null;
    if (!recurso) return true;
    return recursosPlano.includes(recurso);
  };

  const temPermissao = (item) => {
    if (!usuario) return false;
    if (!recursoLiberadoNoPlano(item)) return false;

    if (item.plataformaOnly) {
      return isSaasPlatformAdmin(usuario);
    }

    if (isSaasPlatformAdmin(usuario) && getTenantContext().empresaId) return true;
    if (usuario.cargo === 'admin') return true;

    if (item.cargos && Array.isArray(item.cargos)) {
      return item.cargos.includes(usuario.cargo);
    }

    if (item.permission) {
      return usuario.permissoes?.includes(item.permission) || false;
    }

    return true;
  };

  const toggleCollapse = () => setCollapsed(!collapsed);
  const handleMobileOpen = () => setMobileOpen(true);
  const handleMobileClose = () => setMobileOpen(false);

  const handleGroupClick = (groupTitle) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  const isGroupActive = (group) => {
    return group.items.some(item => {
      const itemPath = item.path?.split('?')[0] || '';
      const itemSearch = item.path?.includes('?') ? `?${item.path.split('?')[1]}` : '';
      return (location.pathname === itemPath && (!itemSearch || location.search === itemSearch)) ||
        (!itemSearch && itemPath !== '/' && location.pathname.startsWith(itemPath));
    });
  };

  useEffect(() => {
    const newOpenGroups = { ...openGroups };
    let changed = false;

    menuGroups.forEach(group => {
      const groupActive = isGroupActive(group);
      if (groupActive && !openGroups[group.title]) {
        newOpenGroups[group.title] = true;
        changed = true;
      }
    });

    if (changed) setOpenGroups(newOpenGroups);
  }, [location.pathname, location.search]);

  const filteredGroups = menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => temPermissao(item))
    }))
    .filter(group => group.items.length > 0);

  if (isMobile) {
    return (
      <>
        <Zoom in={!mobileOpen}>
          <Fab
            color="primary"
            aria-label="menu"
            onClick={handleMobileOpen}
            sx={{
              position: 'fixed',
              bottom: 16,
              left: 16,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8a 100%)',
              },
            }}
          >
            <MenuIcon />
          </Fab>
        </Zoom>

        <MobileSidebar
          open={mobileOpen}
          onClose={handleMobileClose}
          usuario={usuario}
          fotoUrl={fotoUrl}
          unreadCount={unreadCount}
          filteredGroups={filteredGroups}
          location={location}
          handleGroupClick={handleGroupClick}
          openGroups={openGroups}
          isGroupActive={isGroupActive}
        />
      </>
    );
  }

  return (
    <DesktopSidebar
      collapsed={collapsed}
      onToggleCollapse={toggleCollapse}
      usuario={usuario}
      fotoUrl={fotoUrl}
      unreadCount={unreadCount}
      filteredGroups={filteredGroups}
      location={location}
      handleGroupClick={handleGroupClick}
      openGroups={openGroups}
      isGroupActive={isGroupActive}
    />
  );
}

export default ModernSidebar;
