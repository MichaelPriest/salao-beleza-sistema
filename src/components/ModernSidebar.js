// src/components/ModernSidebar.js
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
  ReceiptLong as ReceiptLongIcon,
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
  Close as CloseIcon,
  EmojiEvents as EmojiEventsIcon,
  CardGiftcard as CardGiftcardIcon,
  Loyalty as LoyaltyIcon,
  Stars as StarsIcon,
  Redeem as RedeemIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';

// Estrutura do menu com ícones únicos
const menuGroups = [
  {
    title: 'PRINCIPAL',
    icon: <DashboardCustomizeIcon />,
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/', permission: 'visualizar_dashboard' },
      { text: 'Notificações', icon: <NotificationsActiveIcon />, path: '/notificacoes', permission: 'visualizar_notificacoes', badge: 'unread' },
    ],
  },
  {
    title: 'AGENDAMENTOS',
    icon: <EventAvailableIcon />,
    items: [
      { text: 'Agenda', icon: <DateRangeIcon />, path: '/agendamentos', permission: 'gerenciar_agendamentos' },
      { text: 'Atendimentos', icon: <AssignmentTurnedInIcon />, path: '/atendimentos', permission: 'gerenciar_atendimentos' },
    ],
  },
  {
    title: 'CLIENTES',
    icon: <PersonSearchIcon />,
    items: [
      { text: 'Clientes', icon: <GroupIcon />, path: '/clientes', permission: 'gerenciar_clientes' },
      { text: 'Histórico', icon: <RestoreIcon />, path: '/historico', permission: 'visualizar_relatorios' },
    ],
  },
  {
    title: 'FIDELIDADE',
    icon: <EmojiEventsIcon />,
    items: [
      { text: 'Recompensas', icon: <CardGiftcardIcon />, path: '/fidelidade/recompensas', permission: 'visualizar_fidelidade' },
      { text: 'Meus Pontos', icon: <StarsIcon />, path: '/meus-pontos', permission: 'visualizar_fidelidade' },
      { text: 'Gerenciar', icon: <EmojiEventsIcon />, path: '/fidelidade/gerenciar', permission: 'gerenciar_fidelidade' },
    ],
  },
  {
    title: 'PROFISSIONAIS',
    icon: <GroupsIcon />,
    items: [
      { text: 'Profissionais', icon: <BadgeIcon />, path: '/profissionais', permission: 'gerenciar_profissionais' },
      { text: 'Serviços', icon: <HandymanIcon />, path: '/servicos', permission: 'gerenciar_servicos' },
      { text: 'Minhas Comissões', icon: <MoneyIcon />, path: '/minhas-comissoes', permission: 'visualizar_comissoes' },
    ],
  },
  {
    title: 'FINANCEIRO',
    icon: <AccountBalanceWalletIcon />,
    items: [
      { text: 'Dashboard', icon: <BarChartIcon />, path: '/financeiro', permission: 'financeiro' },
      { text: 'Contas a Receber', icon: <TrendingUpIcon />, path: '/financeiro/receber', permission: 'financeiro' },
      { text: 'Contas a Pagar', icon: <TrendingDownIcon />, path: '/financeiro/pagar', permission: 'financeiro' },
      { text: 'Fluxo de Caixa', icon: <TimelineIcon />, path: '/financeiro/fluxo', permission: 'financeiro' },
      { text: 'Compras', icon: <AddShoppingCartIcon />, path: '/compras', permission: 'gerenciar_compras' },
      { text: 'Relatórios', icon: <SummarizeIcon />, path: '/relatorios', permission: 'visualizar_relatorios' },
    ],
  },
  {
    title: 'ESTOQUE',
    icon: <Inventory2Icon />,
    items: [
      { text: 'Produtos', icon: <StorageIcon />, path: '/estoque', permission: 'gerenciar_estoque' },
      { text: 'Entradas', icon: <MoveToInboxIcon />, path: '/entradas', permission: 'gerenciar_estoque' },
      { text: 'Fornecedores', icon: <FactoryIcon />, path: '/fornecedores', permission: 'gerenciar_compras' },
    ],
  },
  {
    title: 'ADMINISTRAÇÃO',
    icon: <ManageAccountsIcon />,
    items: [
      { text: 'Usuários', icon: <AdminIcon />, path: '/usuarios', permission: 'gerenciar_usuarios' },
      { text: 'Configurações', icon: <TuneIcon />, path: '/configuracoes', permission: 'configurar_sistema' },
      { text: 'Auditoria', icon: <SecurityIcon />, path: '/auditoria', permission: 'visualizar_relatorios' },
    ],
  },
];

// Ícones extras que podem ser usados em badges ou situações específicas
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
};

// Componente Mobile Sidebar Otimizado
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

  // Função para renderizar o perfil do usuário
  const renderUserProfile = () => (
    <Box
      sx={{
        p: 2,
        background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Elementos decorativos */}
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
            color: '#9c27b0',
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

  // Função para renderizar um grupo do menu
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
            backgroundColor: groupActive && !isOpen ? alpha('#9c27b0', 0.08) : 'transparent',
            '&:hover': {
              backgroundColor: alpha('#9c27b0', 0.04),
            },
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 40, 
            color: groupActive ? '#9c27b0' : alpha('#000', 0.54),
          }}>
            {group.icon}
          </ListItemIcon>
          <ListItemText
            primary={group.title}
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: groupActive ? '#9c27b0' : 'textSecondary',
            }}
          />
          {isOpen ? <ExpandLessIcon sx={{ color: 'textSecondary' }} /> : <ExpandMoreIcon sx={{ color: 'textSecondary' }} />}
        </ListItemButton>

        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem
                    button
                    component={Link}
                    to={item.path}
                    onClick={onClose}
                    sx={{
                      pl: 4,
                      py: 1.2,
                      ml: 2,
                      mr: 1,
                      borderRadius: 2,
                      backgroundColor: isActive ? alpha('#9c27b0', 0.08) : 'transparent',
                      color: isActive ? '#9c27b0' : 'text.primary',
                      '&:hover': {
                        backgroundColor: alpha('#9c27b0', 0.04),
                      },
                      '& .MuiListItemIcon-root': {
                        color: isActive ? '#9c27b0' : alpha('#000', 0.54),
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
      {/* Perfil do Usuário */}
      {renderUserProfile()}

      {/* Menu Mobile */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 2,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#9c27b0',
            borderRadius: '4px',
          },
        }}
      >
        {filteredGroups.map(renderGroup)}
      </Box>

      {/* Versão e Fechar */}
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
          Versão 2.0.0
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'textSecondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </SwipeableDrawer>
  );
};

// Componente Desktop Sidebar Otimizado
const DesktopSidebar = ({ collapsed, onToggleCollapse, usuario, fotoUrl, unreadCount, filteredGroups, location, handleGroupClick, openGroups, isGroupActive }) => {
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
          backgroundColor: '#ffffff',
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
          overflowX: 'hidden',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Logo com botão de colapso */}
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
              <SpaIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                Beauty<span style={{ color: '#ff4081' }}>Pro</span>
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

      {/* Perfil do Usuário */}
      <AnimatePresence mode="wait">
        <motion.div
          key={collapsed ? 'collapsed' : 'expanded'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{ px: 2, py: 3, mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: collapsed ? 1 : 2,
                backgroundColor: alpha('#9c27b0', 0.04),
                borderRadius: 3,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <Avatar
                alt={usuario?.nome || 'Usuário'}
                src={temFotoValida() ? fotoUrl : undefined}
                sx={{
                  width: collapsed ? 40 : 56,
                  height: collapsed ? 40 : 56,
                  background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
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
        </motion.div>
      </AnimatePresence>

      {/* Menu Itens Agrupados */}
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
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#9c27b0',
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
                      backgroundColor: groupActive && !isOpen ? alpha('#9c27b0', 0.08) : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha('#9c27b0', 0.04),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: groupActive ? '#9c27b0' : alpha('#000', 0.54) }}>
                      {group.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={group.title}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: groupActive ? '#9c27b0' : 'textSecondary',
                      }}
                    />
                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>

                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.path ||
                          (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                          <motion.div
                            key={item.text}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ListItem
                              button
                              component={Link}
                              to={item.path}
                              sx={{
                                pl: 4,
                                py: 0.8,
                                borderRadius: '0 20px 20px 0',
                                mr: 1,
                                backgroundColor: isActive ? alpha('#9c27b0', 0.08) : 'transparent',
                                color: isActive ? '#9c27b0' : 'text.primary',
                                '&:hover': {
                                  backgroundColor: alpha('#9c27b0', 0.04),
                                },
                                '& .MuiListItemIcon-root': {
                                  color: isActive ? '#9c27b0' : alpha('#000', 0.54),
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
                        backgroundColor: groupActive ? alpha('#9c27b0', 0.08) : 'transparent',
                        color: groupActive ? '#9c27b0' : alpha('#000', 0.54),
                        '&:hover': {
                          backgroundColor: alpha('#9c27b0', 0.04),
                        },
                      }}
                    >
                      {group.icon}
                    </IconButton>
                  </Tooltip>

                  {group.items.slice(0, 2).map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Tooltip key={item.text} title={item.text} placement="right">
                        <IconButton
                          component={Link}
                          to={item.path}
                          size="small"
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: isActive ? alpha('#9c27b0', 0.08) : 'transparent',
                            color: isActive ? '#9c27b0' : alpha('#000', 0.54),
                            '&:hover': {
                              backgroundColor: alpha('#9c27b0', 0.04),
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

                  {group.items.length > 2 && (
                    <Tooltip title={`+${group.items.length - 2} mais`} placement="right">
                      <IconButton
                        size="small"
                        sx={{
                          width: 32,
                          height: 32,
                          color: alpha('#000', 0.38),
                        }}
                      >
                        <ExpandMoreIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Rodapé */}
      {!collapsed && (
        <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="textSecondary">
            Versão 2.0.0
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

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

  // Função para carregar usuário do localStorage
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

  useEffect(() => {
    carregarUsuario();
    carregarNotificacoes();

    // Inicializar todos os grupos como FECHADOS
    const initialOpenState = {};
    menuGroups.forEach(group => {
      initialOpenState[group.title] = false;
    });
    setOpenGroups(initialOpenState);

    const handleUsuarioAtualizado = () => {
      carregarUsuario();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'usuario') {
        carregarUsuario();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('usuarioAtualizado', handleUsuarioAtualizado);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('usuarioAtualizado', handleUsuarioAtualizado);
    };
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

  const temPermissao = (item) => {
    if (!usuario) return false;
    if (usuario.cargo === 'admin' || usuario.permissoes?.includes('admin')) return true;
    if (item.permission) {
      return usuario.permissoes?.includes(item.permission) || false;
    }
    return true;
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleMobileOpen = () => {
    setMobileOpen(true);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const handleGroupClick = (groupTitle) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  const isGroupActive = (group) => {
    return group.items.some(item =>
      location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path))
    );
  };

  // Abrir grupo automaticamente se um item estiver ativo
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

    if (changed) {
      setOpenGroups(newOpenGroups);
    }
  }, [location.pathname]);

  // Filtrar grupos baseado nas permissões
  const filteredGroups = menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => temPermissao(item))
    }))
    .filter(group => group.items.length > 0);

  // Versão Mobile com Floating Action Button
  if (isMobile) {
    return (
      <>
        {/* Botão flutuante para abrir o menu mobile */}
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
              background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
              boxShadow: '0 4px 12px rgba(156,39,176,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7b1fa2 0%, #f50057 100%)',
              },
            }}
          >
            <MenuIcon />
          </Fab>
        </Zoom>

        {/* Mobile Drawer */}
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

  // Versão Desktop
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
