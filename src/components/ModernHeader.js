// src/components/ModernHeader.js
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
  Tooltip, // 🔥 IMPORTANTE: ADICIONAR ESTE IMPORT
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
  Home as HomeIcon,
  Today as TodayIcon,
  AttachMoney as MoneyIcon,
  EmojiEvents as TrophyIcon,
  CardGiftcard as GiftIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
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
    minute: '2-digit'
  });
  
  const diaSemana = now.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short'
  });
  
  return {
    data,
    hora,
    diaSemana,
    completo: `${data} ${hora}`,
  };
};

const Search = styled('div')(({ theme, isMobile }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: isMobile ? theme.spacing(1) : 0,
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

// Componente de Relógio Digital (versão mobile simplificada)
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f5f5f5',
            borderRadius: 3,
            px: 1,
            py: 0.5,
            mr: 1,
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 16, color: '#ff4081', mr: 0.5 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#ff4081' }}>
            {horaBrasilia.hora}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

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

// Componente de Menu Mobile
const MobileMenuDrawer = ({ open, onClose, usuario, fotoUrl, onLogout, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/' },
    { text: 'Agenda', icon: <TodayIcon />, path: '/agendamentos' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
    { text: 'Profissionais', icon: <PersonIcon />, path: '/profissionais' },
    { text: 'Serviços', icon: <CutIcon />, path: '/servicos' },
    { text: 'Financeiro', icon: <MoneyIcon />, path: '/financeiro' },
    { text: 'Estoque', icon: <InventoryIcon />, path: '/estoque' },
    { text: 'Fidelidade', icon: <TrophyIcon />, path: '/fidelidade/recompensas' },
    { text: 'Meus Pontos', icon: <StarIcon />, path: '/meus-pontos' },
    { text: 'Perfil', icon: <PersonIcon />, path: '/perfil' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes' },
  ];

  // Filtrar menu baseado no cargo
  const filteredMenu = menuItems.filter(item => {
    if (usuario?.cargo === 'cliente') {
      return ['Dashboard', 'Meus Pontos', 'Perfil'].includes(item.text);
    }
    if (usuario?.cargo === 'profissional') {
      return !['Financeiro', 'Estoque', 'Clientes'].includes(item.text);
    }
    return true;
  });

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
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: '#ffffff',
        },
      }}
    >
      {/* Header do Menu Mobile */}
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            src={temFotoValida() ? fotoUrl : undefined}
            sx={{ 
              width: 48, 
              height: 48,
              bgcolor: 'white',
              color: '#9c27b0',
            }}
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

      {/* Itens do Menu */}
      <List sx={{ pt: 2 }}>
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.text}
              button
              onClick={() => {
                onNavigate(item.path);
                onClose();
              }}
              sx={{
                py: 1.5,
                bgcolor: isActive ? '#f3e5f5' : 'transparent',
                '&:hover': {
                  bgcolor: '#f3e5f5',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#9c27b0' : '#666', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#9c27b0' : 'inherit',
                }}
              />
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Botão de Sair */}
      <ListItem
        button
        onClick={() => {
          onLogout();
          onClose();
        }}
        sx={{ py: 1.5, color: '#f44336' }}
      >
        <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Sair" />
      </ListItem>
    </SwipeableDrawer>
  );
};

function ModernHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 🔥 ESTADOS PARA BUSCA LIVRE
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [searchMobileOpen, setSearchMobileOpen] = useState(false);
  
  // 🔥 REFS PARA CONTROLE DA BUSCA
  const searchTimeout = useRef(null);
  const lastSearchTerm = useRef('');
  const abortControllerRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const usuarioRef = useRef(usuario);

  // Função para carregar usuário do localStorage
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

  useEffect(() => {
    carregarUsuario();

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

  // 🔥 CARREGAR NOTIFICAÇÕES
  const carregarNotificacoes = useCallback(async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      if (user && user.uid) {
        const data = await notificacoesService.listar(user.uid);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.lida).length);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }, []);

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

  // 🔥 FUNÇÃO DE BUSCA LIVRE - OTIMIZADA
  const realizarBusca = useCallback(async (termo) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    if (!termo || termo.length < 1) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    if (termo === lastSearchTerm.current) {
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const termoLower = termo.toLowerCase();
    lastSearchTerm.current = termo;

    try {
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

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const resultados = [];

      // Limitar resultados baseado no dispositivo
      const limitePorCategoria = isMobile ? 3 : 5;
      const limiteTotal = isMobile ? 10 : 15;

      // Clientes
      if (clientesData && clientesData.length > 0) {
        const clientesFiltrados = clientesData
          .filter(c => 
            c.nome?.toLowerCase().includes(termoLower) ||
            c.email?.toLowerCase().includes(termoLower) ||
            c.telefone?.includes(termo) ||
            c.cpf?.includes(termo)
          )
          .slice(0, limitePorCategoria)
          .map(c => ({
            id: c.id,
            titulo: c.nome,
            subtitulo: c.telefone || c.email || 'Cliente',
            tipo: 'cliente',
            icone: <PeopleIcon />,
            cor: '#9c27b0',
            dados: c
          }));
        resultados.push(...clientesFiltrados);
      }

      // Profissionais
      if (profissionaisData && profissionaisData.length > 0) {
        const profissionaisFiltrados = profissionaisData
          .filter(p => 
            p.nome?.toLowerCase().includes(termoLower) ||
            p.especialidade?.toLowerCase().includes(termoLower) ||
            p.email?.toLowerCase().includes(termoLower)
          )
          .slice(0, limitePorCategoria)
          .map(p => ({
            id: p.id,
            titulo: p.nome,
            subtitulo: p.especialidade || 'Profissional',
            tipo: 'profissional',
            icone: <PersonIcon />,
            cor: '#ff9800',
            dados: p
          }));
        resultados.push(...profissionaisFiltrados);
      }

      // Serviços
      if (servicosData && servicosData.length > 0) {
        const servicosFiltrados = servicosData
          .filter(s => 
            s.nome?.toLowerCase().includes(termoLower) ||
            s.descricao?.toLowerCase().includes(termoLower)
          )
          .slice(0, limitePorCategoria)
          .map(s => ({
            id: s.id,
            titulo: s.nome,
            subtitulo: `R$ ${s.preco?.toFixed(2)}`,
            tipo: 'servico',
            icone: <CutIcon />,
            cor: '#9c27b0',
            dados: s
          }));
        resultados.push(...servicosFiltrados);
      }

      // Produtos
      if (produtosData && produtosData.length > 0) {
        const produtosFiltrados = produtosData
          .filter(p => 
            p.nome?.toLowerCase().includes(termoLower) ||
            p.descricao?.toLowerCase().includes(termoLower) ||
            p.codigoBarras?.includes(termo) ||
            p.codigo?.includes(termo)
          )
          .slice(0, limitePorCategoria)
          .map(p => ({
            id: p.id,
            titulo: p.nome,
            subtitulo: `Estoque: ${p.quantidadeEstoque} | R$ ${p.precoVenda?.toFixed(2)}`,
            tipo: 'produto',
            icone: <InventoryIcon />,
            cor: '#f44336',
            dados: p
          }));
        resultados.push(...produtosFiltrados);
      }

      // Agendamentos
      if (agendamentosData && agendamentosData.length > 0) {
        const agendamentosFiltrados = agendamentosData
          .filter(a => 
            a.clienteNome?.toLowerCase().includes(termoLower) ||
            a.profissionalNome?.toLowerCase().includes(termoLower) ||
            a.servicoNome?.toLowerCase().includes(termoLower)
          )
          .slice(0, limitePorCategoria)
          .map(a => ({
            id: a.id,
            titulo: a.clienteNome,
            subtitulo: `${a.data} às ${a.horario} - ${a.servicoNome}`,
            tipo: 'agendamento',
            icone: <EventIcon />,
            cor: '#2196f3',
            dados: a
          }));
        resultados.push(...agendamentosFiltrados);
      }

      // Atendimentos
      if (atendimentosData && atendimentosData.length > 0) {
        const atendimentosFiltrados = atendimentosData
          .filter(a => 
            a.clienteNome?.toLowerCase().includes(termoLower) ||
            a.profissionalNome?.toLowerCase().includes(termoLower) ||
            a.servicoNome?.toLowerCase().includes(termoLower)
          )
          .slice(0, limitePorCategoria)
          .map(a => ({
            id: a.id,
            titulo: a.clienteNome,
            subtitulo: `R$ ${a.valorTotal?.toFixed(2)} - ${a.status}`,
            tipo: 'atendimento',
            icone: <ReceiptIcon />,
            cor: '#4caf50',
            dados: a
          }));
        resultados.push(...atendimentosFiltrados);
      }

      // Ordenar resultados
      resultados.sort((a, b) => {
        const aTitulo = a.titulo?.toLowerCase() || '';
        const bTitulo = b.titulo?.toLowerCase() || '';
        
        if (aTitulo.startsWith(termoLower) && !bTitulo.startsWith(termoLower)) return -1;
        if (!aTitulo.startsWith(termoLower) && bTitulo.startsWith(termoLower)) return 1;
        return 0;
      });

      setSearchResults(resultados.slice(0, limiteTotal));
    } catch (error) {
      if (error.message === 'Timeout') {
        console.error('Busca excedeu o tempo limite');
      } else if (error.name !== 'AbortError') {
        console.error('Erro na busca:', error);
      }
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [isMobile]);

  // 🔥 HANDLER DE MUDANÇA NA BUSCA
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length < 1) {
      setSearchResults([]);
      if (!isMobile) {
        setOpenSearch(false);
        setSearchAnchorEl(null);
      }
      return;
    }

    if (!isMobile && value.length >= 1 && searchInputRef.current) {
      setSearchAnchorEl(searchInputRef.current);
      setOpenSearch(true);
    }

    searchTimeout.current = setTimeout(() => {
      realizarBusca(value);
    }, 300);
  }, [realizarBusca, isMobile]);

  // 🔥 HANDLER PARA MOBILE - ABRIR TELA DE BUSCA
  const handleOpenSearchMobile = () => {
    setSearchMobileOpen(true);
  };

  const handleCloseSearchMobile = () => {
    setSearchMobileOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  // 🔥 FUNÇÃO PARA LIMPAR A BUSCA
  const handleClearSearch = () => {
    setSearchTerm('');
    if (!isMobile) {
      setOpenSearch(false);
      setSearchAnchorEl(null);
    }
    setSearchResults([]);
    
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
  const handleResultClick = (item) => {
    if (item.tipo === 'cliente') {
      navigate('/clientes');
      toast.success(`${item.titulo} encontrado!`);
    } else if (item.tipo === 'profissional') {
      navigate('/profissionais');
      toast.success(`${item.titulo} encontrado!`);
    } else if (item.tipo === 'servico') {
      navigate('/servicos');
      toast.success(`${item.titulo} encontrado!`);
    } else if (item.tipo === 'produto') {
      navigate('/estoque');
      window.dispatchEvent(new CustomEvent('buscarProduto', { detail: item.titulo }));
      toast.success(`${item.titulo} encontrado!`);
    } else if (item.tipo === 'agendamento') {
      navigate('/agendamentos');
    } else if (item.tipo === 'atendimento') {
      navigate('/atendimentos');
    }
    
    if (isMobile) {
      handleCloseSearchMobile();
    } else {
      handleClearSearch();
    }
  };

  // 🔥 RENDERIZAR RESULTADOS DA BUSCA
  const renderSearchResults = () => {
    if (searchTerm.length < 1) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: isMobile ? 32 : 40, color: '#ccc', mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Digite para começar a buscar
          </Typography>
        </Box>
      );
    }

    if (searchLoading) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={isMobile ? 32 : 40} sx={{ color: '#9c27b0', mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Buscando...
          </Typography>
        </Box>
      );
    }

    if (searchResults.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: isMobile ? 32 : 40, color: '#ccc', mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Nenhum resultado encontrado para "{searchTerm}"
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ p: 0 }}>
        {searchResults.map((item, index) => (
          <React.Fragment key={`${item.tipo}-${item.id}-${index}`}>
            <ListItem
              button
              onClick={() => handleResultClick(item)}
              sx={{
                py: isMobile ? 1.5 : 1,
                '&:hover': {
                  bgcolor: `${item.cor}10`,
                },
              }}
            >
              <ListItemIcon sx={{ color: item.cor, minWidth: isMobile ? 32 : 40 }}>
                {item.icone}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant={isMobile ? "body2" : "subtitle2"} sx={{ fontWeight: 600 }}>
                    {item.titulo}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="textSecondary">
                    {item.subtitulo}
                  </Typography>
                }
              />
              <Chip 
                label={item.tipo} 
                size="small" 
                sx={{ 
                  bgcolor: `${item.cor}20`,
                  color: item.cor,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                  height: isMobile ? 20 : 24,
                }} 
              />
            </ListItem>
            {index < searchResults.length - 1 && <Divider />}
          </React.Fragment>
        ))}
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
      await notificacoesService.marcarTodasComoLidas(user.uid);
      await carregarNotificacoes();
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar notificações:', error);
      toast.error('Erro ao marcar notificações');
    }
  };

  const handleClearAll = async () => {
    try {
      const user = usuariosService.getUsuarioAtual();
      await notificacoesService.excluirTodas(user.uid);
      await carregarNotificacoes();
      toast.success('Notificações removidas');
      handleNotificationsClose();
    } catch (error) {
      console.error('Erro ao remover notificações:', error);
      toast.error('Erro ao remover notificações');
    }
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

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'agendamento': return <EventIcon sx={{ color: '#9c27b0' }} />;
      case 'cliente': return <PersonIcon sx={{ color: '#ff4081' }} />;
      case 'estoque': return <WarningIcon sx={{ color: '#f44336' }} />;
      default: return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (date.toDate) {
      return date.toDate().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    }
    return new Date(date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  // Renderização Mobile
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
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          <Toolbar sx={{ minHeight: 56, px: 1 }}>
            {/* Menu Mobile Button */}
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo ou Título da Página */}
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ 
                fontWeight: 600,
                color: '#9c27b0',
                flex: 1,
              }}
            >
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname.includes('agendamentos') && 'Agenda'}
              {location.pathname.includes('clientes') && 'Clientes'}
              {location.pathname.includes('profissionais') && 'Profissionais'}
              {location.pathname.includes('servicos') && 'Serviços'}
              {location.pathname.includes('financeiro') && 'Financeiro'}
              {location.pathname.includes('estoque') && 'Estoque'}
              {location.pathname.includes('fidelidade') && 'Fidelidade'}
              {location.pathname.includes('meus-pontos') && 'Meus Pontos'}
              {location.pathname.includes('perfil') && 'Perfil'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {/* Botão de Busca Mobile */}
              <IconButton color="inherit" onClick={handleOpenSearchMobile}>
                <SearchIcon />
              </IconButton>

              {/* Relógio (simplificado) */}
              <RelogioDigital isMobile={true} />

              {/* Notificações */}
              <IconButton color="inherit" onClick={handleNotificationsOpen}>
                <Badge badgeContent={unreadCount} color="secondary" max={9}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Menu Mobile Drawer */}
        <MobileMenuDrawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          usuario={usuario}
          fotoUrl={fotoUrl}
          onLogout={handleLogout}
          onNavigate={navigate}
        />

        {/* Tela de Busca Mobile */}
        <Drawer
          anchor="top"
          open={searchMobileOpen}
          onClose={handleCloseSearchMobile}
          PaperProps={{
            sx: {
              height: '100%',
              backgroundColor: '#ffffff',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            {/* Header da Busca */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconButton onClick={handleCloseSearchMobile}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Buscar
              </Typography>
            </Box>

            {/* Campo de Busca */}
            <TextField
              fullWidth
              autoFocus
              variant="outlined"
              placeholder="Buscar clientes, serviços, produtos..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Resultados da Busca */}
            <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
              {renderSearchResults()}
            </Box>
          </Box>
        </Drawer>

        {/* Menu de Notificações Mobile */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              width: '90%',
              maxWidth: 360,
              maxHeight: '80vh',
            },
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Notificações {unreadCount > 0 && `(${unreadCount})`}
            </Typography>
            <Box>
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <DoneAllIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleClearAll}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Divider />
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Nenhuma notificação
                </Typography>
              </Box>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.lida ? 'transparent' : '#f3e5f5',
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.tipo)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {notification.titulo}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" color="textSecondary" display="block">
                            {notification.mensagem}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(notification.data)}
                          </Typography>
                        </>
                      }
                    />
                    {!notification.lida && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9c27b0', ml: 1 }} />
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Menu>
      </>
    );
  }

  // Renderização Desktop
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

        {/* 🔥 CAMPO DE BUSCA LIVRE - DESKTOP */}
        <Search isMobile={false}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            inputRef={searchInputRef}
            placeholder="Buscar clientes, serviços, produtos..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchChange}
            isMobile={false}
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
          />
        </Search>

        {/* 🔥 POPOVER DE RESULTADOS DA BUSCA - DESKTOP */}
        <Popover
          open={openSearch}
          anchorEl={searchAnchorEl}
          onClose={handleClearSearch}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
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
              Resultados da busca {searchResults.length > 0 && `(${searchResults.length})`}
            </Typography>
            <IconButton size="small" onClick={handleClearSearch}>
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
          <RelogioDigital isMobile={false} />

          {/* Notificações */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={unreadCount} color="secondary" max={99}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </motion.div>

          {/* Menu do Usuário */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar 
                alt={usuario?.nome || 'Usuário'}
                src={temFotoValida() ? fotoUrl : undefined}
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

        {/* Menu de Notificações Desktop */}
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
              Notificações {unreadCount > 0 && `(${unreadCount})`}
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
              {notifications.slice(0, 5).map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.lida ? 'transparent' : '#f3e5f5',
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
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9c27b0', ml: 1 }} />
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
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

        {/* Menu do Usuário Desktop */}
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
              <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
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
