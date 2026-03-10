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
  AttachMoney as AttachMoneyIcon,
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
      { text: 'Calendário', icon: <DateRangeIcon />, path: '/agendamentos', permission: 'gerenciar_agendamentos' },
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
    title: 'PROFISSIONAIS',
    icon: <GroupsIcon />,
    items: [
      { text: 'Profissionais', icon: <BadgeIcon />, path: '/profissionais', permission: 'gerenciar_profissionais' },
      { text: 'Serviços', icon: <HandymanIcon />, path: '/servicos', permission: 'gerenciar_servicos' },
      { text: 'Minhas Comissões', icon: <MoneyIcon />, path: '/minhas-comissoes', permission: 'visualizar_comissoes' }, // NOVO
    ],
  },
  {
    title: 'FINANCEIRO',
    icon: <AccountBalanceWalletIcon />,
    items: [
      { text: 'Dashboard Financeiro', icon: <BarChartIcon />, path: '/financeiro', permission: 'financeiro' },
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
      { text: 'Auditoria', icon: <SecurityIcon />, path: '/auditoria', permission: 'visualizar_relatorios' },
      { text: 'Configurações', icon: <TuneIcon />, path: '/configuracoes', permission: 'configurar_sistema' },
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
};

function ModernSidebar() {
  const location = useLocation();
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
        console.log('Buscando notificações para usuário:', user.uid);
        
        const data = await firebaseService.query('notificacoes', [
          { field: 'usuarioId', operator: '==', value: user.uid }
        ], 'data');
        
        setUnreadCount(data.filter(n => !n.lida).length);
      } else {
        console.log('Usuário não tem uid:', user);
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

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleGroup = (groupTitle) => {
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

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? 80 : 300,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: collapsed ? 80 : 300,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
        },
      }}
    >
      {/* Logo com botão de colapso */}
      <Box sx={{ 
        p: collapsed ? 1 : 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: 1,
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        {!collapsed ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpaIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                Beauty<span style={{ color: '#ff4081' }}>Pro</span>
              </Typography>
            </Box>
            <Tooltip title="Recolher menu">
              <IconButton onClick={toggleCollapse} size="small">
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Expandir menu">
            <IconButton onClick={toggleCollapse} sx={{ mx: 'auto' }}>
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
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: collapsed ? 1 : 2,
              backgroundColor: '#faf5ff',
              borderRadius: 3,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}>
              <Avatar 
                alt={usuario?.nome || 'Usuário'}
                src={temFotoValida() ? fotoUrl : undefined}
                key={fotoUrl}
                imgProps={{
                  onError: (e) => {
                    e.target.style.display = 'none';
                  },
                }}
                sx={{ 
                  width: collapsed ? 40 : 56, 
                  height: collapsed ? 40 : 56,
                  background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
                }}
              >
                {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
              </Avatar>
              
              {!collapsed && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Bem-vindo(a)
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {usuario?.nome?.split(' ')[0] || 'Usuário'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                    {usuario?.cargo || 'Usuário'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Menu Itens Agrupados */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden',
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
      }}>
        {filteredGroups.map((group) => {
          const groupActive = isGroupActive(group);
          const isOpen = openGroups[group.title] || false;
          
          return (
            <Box key={group.title} sx={{ mb: 2 }}>
              {!collapsed ? (
                <>
                  <ListItemButton
                    onClick={() => toggleGroup(group.title)}
                    sx={{
                      py: 1,
                      px: 3,
                      backgroundColor: groupActive && !isOpen ? '#f3e5f5' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: groupActive ? '#9c27b0' : '#666' }}>
                      {group.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={group.title}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'textSecondary',
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
                                py: 1,
                                borderRadius: '0 20px 20px 0',
                                mr: 2,
                                backgroundColor: isActive ? '#f3e5f5' : 'transparent',
                                color: isActive ? '#9c27b0' : '#666',
                                '&:hover': {
                                  backgroundColor: '#f3e5f5',
                                },
                                '& .MuiListItemIcon-root': {
                                  color: isActive ? '#9c27b0' : '#999',
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title={group.title} placement="right">
                    <IconButton
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: groupActive ? '#f3e5f5' : 'transparent',
                        color: groupActive ? '#9c27b0' : '#666',
                        '&:hover': {
                          backgroundColor: '#f3e5f5',
                        },
                      }}
                    >
                      {group.icon}
                    </IconButton>
                  </Tooltip>
                  
                  {group.items.slice(0, 3).map((item) => {
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
                            backgroundColor: isActive ? '#f3e5f5' : 'transparent',
                            color: isActive ? '#9c27b0' : '#999',
                            '&:hover': {
                              backgroundColor: '#f3e5f5',
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
                  
                  {group.items.length > 3 && (
                    <Tooltip title={`+${group.items.length - 3} mais`} placement="right">
                      <IconButton
                        size="small"
                        sx={{
                          width: 32,
                          height: 32,
                          color: '#999',
                        }}
                      >
                        <ExpandMoreIcon />
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
}

export default ModernSidebar;
