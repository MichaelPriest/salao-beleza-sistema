import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { notificacoesService } from '../services/notificacoesService';
import { usuariosService } from '../services/usuariosService';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
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

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

function ModernHeader() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);
  
  // Usar useRef para armazenar o estado atual sem causar re-renders
  const usuarioRef = useRef(usuario);

  // Função para carregar usuário do localStorage
  const carregarUsuario = () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      console.log('Header - Usuário carregado:', user);
      
      // Verificar se o usuário mudou antes de atualizar o estado
      if (JSON.stringify(user) !== JSON.stringify(usuarioRef.current)) {
        setUsuario(user);
        usuarioRef.current = user;
        
        // Verificar e setar a foto
        if (user?.avatar && user.avatar !== 'null' && user.avatar !== 'undefined' && user.avatar.trim() !== '') {
          console.log('Header - Foto encontrada:', user.avatar);
          setFotoUrl(user.avatar);
        } else {
          console.log('Header - Sem foto válida');
          setFotoUrl(null);
        }
      }
    } catch (error) {
      console.error('Header - Erro ao carregar usuário:', error);
      setUsuario(null);
      setFotoUrl(null);
    }
  };

  useEffect(() => {
    // Carregar dados iniciais
    carregarUsuario();
    carregarNotificacoes();

    // Listener para eventos personalizados
    const handleUsuarioAtualizado = () => {
      console.log('Header - Evento usuarioAtualizado recebido');
      carregarUsuario();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'usuario') {
        console.log('Header - Storage changed');
        carregarUsuario();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('usuarioAtualizado', handleUsuarioAtualizado);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('usuarioAtualizado', handleUsuarioAtualizado);
    };
  }, []); // Array vazio - executa apenas uma vez na montagem

  const carregarNotificacoes = async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      if (user) {
        const data = await notificacoesService.listar(user.id);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.lida).length);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.lida) {
        await notificacoesService.marcarComoLida(notification.id);
        await carregarNotificacoes();
      }
      
      if (notification.link) {
        navigate(notification.link);
      }
      
      handleNotificationsClose();
    } catch (error) {
      toast.error('Erro ao processar notificação');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      await notificacoesService.marcarTodasComoLidas(user.id);
      await carregarNotificacoes();
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      toast.error('Erro ao marcar notificações');
    }
  };

  const handleClearAll = async () => {
    try {
      const promises = notifications.map(n => notificacoesService.excluir(n.id));
      await Promise.all(promises);
      await carregarNotificacoes();
      toast.success('Notificações removidas');
      handleNotificationsClose();
    } catch (error) {
      toast.error('Erro ao remover notificações');
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'agendamento':
        return <EventIcon sx={{ color: '#9c27b0' }} />;
      case 'cliente':
        return <PersonIcon sx={{ color: '#ff4081' }} />;
      case 'estoque':
        return <WarningIcon sx={{ color: '#f44336' }} />;
      default:
        return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const handleLogout = () => {
    usuariosService.logout();
    setUsuario(null);
    setFotoUrl(null);
    usuarioRef.current = null;
    navigate('/login');
    toast.success('Logout realizado com sucesso!');
  };

  const handlePerfil = () => {
    navigate('/perfil');
    handleClose();
  };

  const handleConfiguracoes = () => {
    navigate('/configuracoes');
    handleClose();
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

  return (
    <AppBar 
      position="static" 
      color="inherit" 
      elevation={0}
      sx={{ 
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255,255,255,0.9)',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Olá, {usuario?.nome?.split(' ')[0] || 'Usuário'} 👋
        </Typography>

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Buscar clientes, serviços..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Notificações */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={unreadCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </motion.div>

          {/* Menu do Usuário */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                alt={usuario?.nome || 'Usuário'}
                src={temFotoValida() ? fotoUrl : undefined}
                key={fotoUrl}
                imgProps={{
                  onError: (e) => {
                    console.log('Erro ao carregar imagem:', fotoUrl);
                    e.target.style.display = 'none';
                  },
                  onLoad: () => console.log('Imagem carregada com sucesso')
                }}
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: '#9c27b0',
                }}
              >
                {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
              </Avatar>
            </IconButton>
          </motion.div>
        </Box>

        {/* Menu de Notificações */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              width: 360,
              maxHeight: 480,
            },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notificações
            </Typography>
            <Box>
              <IconButton size="small" onClick={handleMarkAllAsRead} title="Marcar todas como lidas">
                <DoneAllIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleClearAll} title="Limpar todas">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          <Divider />
          
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Nenhuma notificação
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              <AnimatePresence>
                {notifications.slice(0, 5).map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <ListItem
                      button
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        bgcolor: notification.lida ? 'transparent' : '#f3e5f5',
                        '&:hover': {
                          bgcolor: '#f3e5f5',
                        },
                      }}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.tipo)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {notification.titulo}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary" noWrap>
                              {notification.mensagem}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(notification.data).toLocaleString('pt-BR')}
                            </Typography>
                          </>
                        }
                      />
                      {!notification.lida && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#9c27b0',
                            ml: 1,
                          }}
                        />
                      )}
                    </ListItem>
                    <Divider />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {notifications.length > 5 && (
                <Box sx={{ p: 1, textAlign: 'center' }}>
                  <Button size="small" onClick={() => navigate('/notificacoes')}>
                    Ver todas ({notifications.length})
                  </Button>
                </Box>
              )}
            </List>
          )}
        </Menu>

        {/* Menu do Usuário */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              minWidth: 200,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={temFotoValida() ? fotoUrl : undefined}
              sx={{ 
                bgcolor: '#9c27b0',
                width: 40, 
                height: 40 
              }}
            >
              {!temFotoValida() && (usuario?.nome ? getInitials(usuario.nome) : 'U')}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {usuario?.nome}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {usuario?.cargo}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <MenuItem onClick={handlePerfil}>
            <PersonIcon sx={{ mr: 2, fontSize: 20 }} /> Perfil
          </MenuItem>
          <MenuItem onClick={handleConfiguracoes}>
            <SettingsIcon sx={{ mr: 2, fontSize: 20 }} /> Configurações
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: '#ff4081' }}>
            <LogoutIcon sx={{ mr: 2, fontSize: 20 }} /> Sair
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default ModernHeader;