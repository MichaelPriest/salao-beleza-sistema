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
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ContentCut as CutIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Spa as SpaIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountBalanceIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { notificacoesService } from '../services/notificacoesService';
import { usuariosService } from '../services/usuariosService';

// Estrutura do menu agrupada por área
const menuGroups = [
  {
    title: 'PRINCIPAL',
    icon: <DashboardIcon />,
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/', permission: 'visualizar_dashboard' },
      { text: 'Notificações', icon: <NotificationsIcon />, path: '/notificacoes', permission: 'visualizar_notificacoes', badge: 'unread' },
    ],
  },
  {
    title: 'AGENDAMENTOS',
    icon: <CalendarIcon />,
    items: [
      { text: 'Calendário', icon: <CalendarIcon />, path: '/agendamentos', permission: 'gerenciar_agendamentos' },
      { text: 'Atendimentos', icon: <ReceiptIcon />, path: '/atendimentos', permission: 'gerenciar_atendimentos' },
    ],
  },
  {
    title: 'CLIENTES',
    icon: <PeopleIcon />,
    items: [
      { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes', permission: 'gerenciar_clientes' },
      { text: 'Histórico', icon: <HistoryIcon />, path: '/historico', permission: 'visualizar_relatorios' },
    ],
  },
  {
    title: 'PROFISSIONAIS',
    icon: <PersonIcon />,
    items: [
      { text: 'Profissionais', icon: <PersonIcon />, path: '/profissionais', permission: 'gerenciar_profissionais' },
      { text: 'Serviços', icon: <CutIcon />, path: '/servicos', permission: 'gerenciar_servicos' },
    ],
  },
  {
    title: 'FINANCEIRO',
    icon: <AttachMoneyIcon />,
    items: [
      { text: 'Dashboard Financeiro', icon: <AccountBalanceIcon />, path: '/financeiro', permission: 'financeiro' },
      { text: 'Contas a Receber', icon: <TrendingUpIcon />, path: '/financeiro/receber', permission: 'financeiro' },
      { text: 'Contas a Pagar', icon: <TrendingDownIcon />, path: '/financeiro/pagar', permission: 'financeiro' },
      { text: 'Fluxo de Caixa', icon: <TimelineIcon />, path: '/financeiro/fluxo', permission: 'financeiro' },
      { text: 'Compras', icon: <ShoppingCartIcon />, path: '/compras', permission: 'gerenciar_compras' },
      { text: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios', permission: 'visualizar_relatorios' },
    ],
  },
  {
    title: 'ESTOQUE',
    icon: <InventoryIcon />,
    items: [
      { text: 'Produtos', icon: <InventoryIcon />, path: '/estoque', permission: 'gerenciar_estoque' },
      { text: 'Entradas', icon: <WarehouseIcon />, path: '/entradas', permission: 'gerenciar_estoque' },
      { text: 'Fornecedores', icon: <LocalShippingIcon />, path: '/fornecedores', permission: 'gerenciar_compras' },
    ],
  },
  {
    title: 'ADMINISTRAÇÃO',
    icon: <AdminIcon />,
    items: [
      { text: 'Usuários', icon: <GroupIcon />, path: '/usuarios', permission: 'gerenciar_usuarios' },
      { text: 'Auditoria', icon: <SecurityIcon />, path: '/auditoria', permission: 'visualizar_relatorios' },
      { text: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes', permission: 'configurar_sistema' },
    ],
  },
];

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
      if (user) {
        const data = await notificacoesService.listar(user.id);
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
