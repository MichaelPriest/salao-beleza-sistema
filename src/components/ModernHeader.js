// src/components/ModernHeader.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Paper,
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
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';
import { notificacoesService } from '../services/notificacoesService';

// 🔥 FUNÇÃO PARA OBTER DATA E HORA NO HORÁRIO DE BRASÍLIA
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
    minute: '2-digit',
    second: '2-digit'
  });
  
  const diaSemana = now.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long'
  });
  
  return {
    data,
    hora,
    diaSemana,
    completo: `${data} ${hora}`,
    extenso: `${diaSemana}, ${data} às ${hora}`
  };
};

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
    paddingRight: theme.spacing(4),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

// Componente de Relógio Digital
const RelogioDigital = () => {
  const [horaBrasilia, setHoraBrasilia] = useState(getBrasiliaTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setHoraBrasilia(getBrasiliaTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#f5f5f5',
        borderRadius: 3,
        px: 2,
        py: 0.5,
        mr: 2,
      }}
    >
      <CalendarIcon sx={{ fontSize: 18, color: '#9c27b0', mr: 1 }} />
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

function ModernHeader() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);
  
  // 🔥 ESTADOS PARA BUSCA
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({
    clientes: [],
    profissionais: [],
    servicos: [],
    produtos: [],
    agendamentos: [],
    atendimentos: [],
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  
  // 🔥 REFS PARA CONTROLE DA BUSCA
  const searchTimeout = useRef(null);
  const lastSearchTerm = useRef('');
  const abortControllerRef = useRef(null);
  const searchInputRef = useRef(null);
  const popoverRef = useRef(null);
  
  const usuarioRef = useRef(usuario);

  // Função para carregar usuário do localStorage
  const carregarUsuario = () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      console.log('Header - Usuário carregado:', user);
      
      if (JSON.stringify(user) !== JSON.stringify(usuarioRef.current)) {
        setUsuario(user);
        usuarioRef.current = user;
        
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
    carregarUsuario();

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

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('usuarioAtualizado', handleUsuarioAtualizado);
    };
  }, []);

  // 🔥 CARREGAR NOTIFICAÇÕES
  const carregarNotificacoes = useCallback(async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      if (user && user.uid) {
        console.log('Header - Buscando notificações para:', user.uid);
        
        const data = await notificacoesService.listar(user.uid);
        
        console.log('Header - Notificações carregadas:', data);
        setNotifications(data);
        
        // 🔥 CORREÇÃO: Contar apenas as não lidas
        const naoLidas = data.filter(n => !n.lida);
        console.log('Header - Não lidas:', naoLidas.length);
        setUnreadCount(naoLidas.length);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }, []);

  // 🔥 CARREGAR NOTIFICAÇÕES QUANDO USUÁRIO ESTIVER DISPONÍVEL
  useEffect(() => {
    if (usuario?.uid) {
      carregarNotificacoes();
      
      const handleNotificacoesAtualizadas = () => {
        carregarNotificacoes();
      };
      
      window.addEventListener('notificacoesAtualizadas', handleNotificacoesAtualizadas);
      window.addEventListener('novaNotificacao', handleNotificacoesAtualizadas);
      
      return () => {
        window.removeEventListener('notificacoesAtualizadas', handleNotificacoesAtualizadas);
        window.removeEventListener('novaNotificacao', handleNotificacoesAtualizadas);
      };
    }
  }, [usuario, carregarNotificacoes]);

  // 🔥 FUNÇÃO DE BUSCA CORRIGIDA
  const realizarBusca = useCallback(async (termo) => {
    // Cancelar busca anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    if (!termo || termo.length < 3) {
      setSearchResults({
        clientes: [],
        profissionais: [],
        servicos: [],
        produtos: [],
        agendamentos: [],
        atendimentos: [],
      });
      setSearchLoading(false);
      return;
    }

    // Se o termo for igual ao último, não precisa buscar de novo
    if (termo === lastSearchTerm.current) {
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const termoLower = termo.toLowerCase();
    lastSearchTerm.current = termo;

    try {
      // Usar Promise.all com timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const buscaPromise = Promise.all([
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('produtos').catch(() => []),
        firebaseService.getAll('agendamentos').catch(() => []),
        firebaseService.getAll('atendimentos').catch(() => []),
      ]);

      const [
        clientesData,
        profissionaisData,
        servicosData,
        produtosData,
        agendamentosData,
        atendimentosData,
      ] = await Promise.race([buscaPromise, timeoutPromise]);

      // Verificar se não foi cancelado
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Filtrar resultados
      const resultados = {
        clientes: (clientesData || [])
          .filter(c => 
            c.nome?.toLowerCase().includes(termoLower) ||
            c.email?.toLowerCase().includes(termoLower) ||
            c.telefone?.includes(termo)
          )
          .slice(0, 5)
          .map(c => ({ ...c, tipo: 'cliente' })),

        profissionais: (profissionaisData || [])
          .filter(p => 
            p.nome?.toLowerCase().includes(termoLower) ||
            p.especialidade?.toLowerCase().includes(termoLower) ||
            p.email?.toLowerCase().includes(termoLower)
          )
          .slice(0, 5)
          .map(p => ({ ...p, tipo: 'profissional' })),

        servicos: (servicosData || [])
          .filter(s => 
            s.nome?.toLowerCase().includes(termoLower) ||
            s.descricao?.toLowerCase().includes(termoLower)
          )
          .slice(0, 5)
          .map(s => ({ ...s, tipo: 'servico' })),

        produtos: (produtosData || [])
          .filter(p => 
            p.nome?.toLowerCase().includes(termoLower) ||
            p.descricao?.toLowerCase().includes(termoLower) ||
            p.codigoBarras?.includes(termo)
          )
          .slice(0, 5)
          .map(p => ({ ...p, tipo: 'produto' })),

        agendamentos: (agendamentosData || [])
          .filter(a => 
            a.clienteNome?.toLowerCase().includes(termoLower) ||
            a.profissionalNome?.toLowerCase().includes(termoLower) ||
            a.servicoNome?.toLowerCase().includes(termoLower)
          )
          .slice(0, 5)
          .map(a => ({ ...a, tipo: 'agendamento' })),

        atendimentos: (atendimentosData || [])
          .filter(a => 
            a.clienteNome?.toLowerCase().includes(termoLower) ||
            a.profissionalNome?.toLowerCase().includes(termoLower) ||
            a.servicoNome?.toLowerCase().includes(termoLower)
          )
          .slice(0, 5)
          .map(a => ({ ...a, tipo: 'atendimento' })),
      };

      setSearchResults(resultados);
    } catch (error) {
      if (error.message === 'Timeout') {
        console.error('Busca excedeu o tempo limite');
      } else if (error.name !== 'AbortError') {
        console.error('Erro na busca:', error);
      }
      setSearchResults({
        clientes: [],
        profissionais: [],
        servicos: [],
        produtos: [],
        agendamentos: [],
        atendimentos: [],
      });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // 🔥 HANDLER DE MUDANÇA NA BUSCA CORRIGIDO
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Limpar timeout anterior
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Se o valor for menor que 3, limpar resultados e fechar popover
    if (value.length < 3) {
      setSearchResults({
        clientes: [],
        profissionais: [],
        servicos: [],
        produtos: [],
        agendamentos: [],
        atendimentos: [],
      });
      setOpenSearch(false);
      setSearchAnchorEl(null);
      return;
    }

    // Abrir popover se houver pelo menos 3 caracteres
    if (value.length >= 3 && searchInputRef.current) {
      setSearchAnchorEl(searchInputRef.current);
      setOpenSearch(true);
    }

    // Debounce de 500ms
    searchTimeout.current = setTimeout(() => {
      realizarBusca(value);
    }, 500);
  }, [realizarBusca]);

  // 🔥 HANDLER DE FOCO NA BUSCA
  const handleSearchFocus = (e) => {
    if (searchTerm.length >= 3) {
      setSearchAnchorEl(e.currentTarget);
      setOpenSearch(true);
    }
  };

  // 🔥 HANDLER DE CLIQUE NO INPUT
  const handleSearchClick = (e) => {
    if (searchTerm.length >= 3) {
      setSearchAnchorEl(e.currentTarget);
      setOpenSearch(true);
    }
  };

  // 🔥 FUNÇÃO PARA FECHAR A BUSCA
  const handleSearchClose = () => {
    setOpenSearch(false);
    // Não limpar o anchorEl imediatamente para evitar flicker
    setTimeout(() => {
      setSearchAnchorEl(null);
    }, 200);
  };

  // 🔥 FUNÇÃO PARA LIMPAR A BUSCA
  const handleClearSearch = () => {
    setSearchTerm('');
    setOpenSearch(false);
    setSearchAnchorEl(null);
    setSearchResults({
      clientes: [],
      profissionais: [],
      servicos: [],
      produtos: [],
      agendamentos: [],
      atendimentos: [],
    });
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // 🔥 FUNÇÃO PARA NAVEGAR PARA O RESULTADO
  const handleResultClick = (tipo, id, item) => {
    const rotas = {
      cliente: `/clientes`,
      profissional: `/profissionais`,
      servico: `/servicos`,
      produto: `/estoque`,
      agendamento: `/agendamentos`,
      atendimento: `/atendimentos`,
    };

    if (tipo === 'cliente') {
      navigate(`/clientes`);
      toast.success(`${item.nome} encontrado! Verifique na lista.`);
    } else if (tipo === 'profissional') {
      navigate(`/profissionais`);
      toast.success(`${item.nome} encontrado! Verifique na lista.`);
    } else if (tipo === 'servico') {
      navigate(`/servicos`);
      toast.success(`${item.nome} encontrado! Verifique na lista.`);
    } else if (tipo === 'produto') {
      navigate(`/estoque`);
      window.dispatchEvent(new CustomEvent('buscarProduto', { detail: item.nome }));
      toast.success(`${item.nome} encontrado! Verifique na lista.`);
    } else {
      navigate(rotas[tipo]);
    }
    
    handleClearSearch();
  };

  // 🔥 RENDERIZAR RESULTADOS DA BUSCA
  const renderSearchResults = () => {
    const totalResults = Object.values(searchResults).reduce((acc, arr) => acc + arr.length, 0);

    if (searchTerm.length < 3) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Digite pelo menos 3 caracteres para buscar
          </Typography>
        </Box>
      );
    }

    if (searchLoading) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: '#9c27b0', mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Buscando...
          </Typography>
        </Box>
      );
    }

    if (totalResults === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Nenhum resultado encontrado para "{searchTerm}"
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ p: 0 }}>
        {/* Clientes */}
        {searchResults.clientes.length > 0 && (
          <>
            <ListItem sx={{ bgcolor: '#f3e5f5' }}>
              <ListItemIcon>
                <PeopleIcon sx={{ color: '#9c27b0' }} />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Clientes ({searchResults.clientes.length})
                  </Typography>
                }
              />
            </ListItem>
            {searchResults.clientes.map(cliente => (
              <ListItem 
                key={cliente.id} 
                button 
                onClick={() => handleResultClick('cliente', cliente.id, cliente)}
                sx={{ pl: 4 }}
              >
                <ListItemText
                  primary={cliente.nome}
                  secondary={cliente.telefone || cliente.email}
                />
                <Chip label="Cliente" size="small" sx={{ bgcolor: '#f3e5f5', color: '#9c27b0' }} />
              </ListItem>
            ))}
          </>
        )}

        {/* Outras categorias... (manter o mesmo código) */}
      </List>
    );
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
      console.error('Erro ao processar notificação:', error);
      toast.error('Erro ao processar notificação');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      const success = await notificacoesService.marcarTodasComoLidas(user.uid);
      
      if (success) {
        await carregarNotificacoes();
        toast.success('Todas as notificações marcadas como lidas');
      } else {
        toast.error('Erro ao marcar notificações');
      }
    } catch (error) {
      console.error('Erro ao marcar notificações:', error);
      toast.error('Erro ao marcar notificações');
    }
  };

  const handleClearAll = async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      const success = await notificacoesService.excluirTodas(user.uid);
      
      if (success) {
        await carregarNotificacoes();
        toast.success('Notificações removidas');
        handleNotificationsClose();
      } else {
        toast.error('Erro ao remover notificações');
      }
    } catch (error) {
      console.error('Erro ao remover notificações:', error);
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

  const formatDate = (date) => {
    if (!date) return '';
    if (date.toDate) {
      return date.toDate().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    }
    return new Date(date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
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

        {/* 🔥 CAMPO DE BUSCA */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            inputRef={searchInputRef}
            placeholder="Buscar clientes, serviços, produtos... (mínimo 3 caracteres)"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onClick={handleSearchClick}
            endAdornment={
              searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={handleClearSearch}
                    sx={{ mr: 0.5 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        {/* 🔥 POPOVER DE RESULTADOS DA BUSCA CORRIGIDO */}
        <Popover
          open={openSearch}
          anchorEl={searchAnchorEl}
          onClose={handleSearchClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            ref: popoverRef,
            sx: {
              mt: 1,
              width: 500,
              maxHeight: 500,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            },
          }}
          transitionDuration={300}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Resultados da busca
            </Typography>
            <IconButton size="small" onClick={handleSearchClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
            {renderSearchResults()}
          </Box>
        </Popover>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <RelogioDigital />

          {/* Notificações */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsOpen}
              sx={{ position: 'relative' }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="secondary"
                max={99}
              >
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

        {/* Menu de Notificações CORRIGIDO */}
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
          TransitionComponent={Fade}
          transitionDuration={300}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notificações {unreadCount > 0 && `(${unreadCount} não lidas)`}
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
              <NotificationsIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
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
                              {formatDate(notification.data)}
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
          TransitionComponent={Fade}
          transitionDuration={300}
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
