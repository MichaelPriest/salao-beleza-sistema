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
  
  // 🔥 ESTADOS PARA BUSCA LIVRE
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]); // 🔥 MUDEI PARA ARRAY SIMPLES
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  
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

  // 🔥 FUNÇÃO DE BUSCA LIVRE - OTIMIZADA
  const realizarBusca = useCallback(async (termo) => {
    // Cancelar busca anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    // 🔥 AGORA PERMITE 1 CARACTERE
    if (!termo || termo.length < 1) {
      setSearchResults([]);
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

      // 🔥 FILTRAR RESULTADOS COM LIMITE POR CATEGORIA
      const resultados = [];

      // Clientes
      if (clientesData && clientesData.length > 0) {
        const clientesFiltrados = clientesData
          .filter(c => 
            c.nome?.toLowerCase().includes(termoLower) ||
            c.email?.toLowerCase().includes(termoLower) ||
            c.telefone?.includes(termo) ||
            c.cpf?.includes(termo)
          )
          .slice(0, 5)
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
          .slice(0, 5)
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
          .slice(0, 5)
          .map(s => ({
            id: s.id,
            titulo: s.nome,
            subtitulo: `R$ ${s.preco?.toFixed(2)}`,
            tipo: 'servico',
            icone: <ContentCutIcon />,
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
          .slice(0, 5)
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
          .slice(0, 5)
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
          .slice(0, 5)
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

      // Ordenar resultados por relevância (começa com o termo)
      resultados.sort((a, b) => {
        const aTitulo = a.titulo?.toLowerCase() || '';
        const bTitulo = b.titulo?.toLowerCase() || '';
        
        if (aTitulo.startsWith(termoLower) && !bTitulo.startsWith(termoLower)) return -1;
        if (!aTitulo.startsWith(termoLower) && bTitulo.startsWith(termoLower)) return 1;
        return 0;
      });

      setSearchResults(resultados.slice(0, 15)); // Limite total de 15 resultados
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
  }, []);

  // 🔥 HANDLER DE MUDANÇA NA BUSCA - AGORA COM 1 CARACTERE
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Limpar timeout anterior
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // 🔥 AGORA PERMITE 1 CARACTERE
    if (value.length < 1) {
      setSearchResults([]);
      setOpenSearch(false);
      setSearchAnchorEl(null);
      return;
    }

    // Abrir popover se houver pelo menos 1 caractere
    if (value.length >= 1 && searchInputRef.current) {
      setSearchAnchorEl(searchInputRef.current);
      setOpenSearch(true);
    }

    // Debounce de 300ms para busca mais rápida
    searchTimeout.current = setTimeout(() => {
      realizarBusca(value);
    }, 300);
  }, [realizarBusca]);

  // 🔥 HANDLER DE FOCO NA BUSCA
  const handleSearchFocus = (e) => {
    if (searchTerm.length >= 1) {
      setSearchAnchorEl(e.currentTarget);
      setOpenSearch(true);
    }
  };

  // 🔥 HANDLER DE CLIQUE NO INPUT
  const handleSearchClick = (e) => {
    if (searchTerm.length >= 1) {
      setSearchAnchorEl(e.currentTarget);
      setOpenSearch(true);
    }
  };

  // 🔥 FUNÇÃO PARA FECHAR A BUSCA
  const handleSearchClose = () => {
    setOpenSearch(false);
    setTimeout(() => {
      setSearchAnchorEl(null);
    }, 200);
  };

  // 🔥 FUNÇÃO PARA LIMPAR A BUSCA
  const handleClearSearch = () => {
    setSearchTerm('');
    setOpenSearch(false);
    setSearchAnchorEl(null);
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
    const rotas = {
      cliente: `/clientes`,
      profissional: `/profissionais`,
      servico: `/servicos`,
      produto: `/estoque`,
      agendamento: `/agendamentos`,
      atendimento: `/atendimentos`,
    };

    if (item.tipo === 'cliente') {
      navigate(`/clientes`);
      toast.success(`${item.titulo} encontrado! Verifique na lista.`);
    } else if (item.tipo === 'profissional') {
      navigate(`/profissionais`);
      toast.success(`${item.titulo} encontrado! Verifique na lista.`);
    } else if (item.tipo === 'servico') {
      navigate(`/servicos`);
      toast.success(`${item.titulo} encontrado! Verifique na lista.`);
    } else if (item.tipo === 'produto') {
      navigate(`/estoque`);
      window.dispatchEvent(new CustomEvent('buscarProduto', { detail: item.titulo }));
      toast.success(`${item.titulo} encontrado! Verifique na lista.`);
    } else {
      navigate(rotas[item.tipo]);
    }
    
    handleClearSearch();
  };

  // 🔥 RENDERIZAR RESULTADOS DA BUSCA
  const renderSearchResults = () => {
    if (searchTerm.length < 1) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Digite para começar a buscar
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

    if (searchResults.length === 0) {
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
        {searchResults.map((item, index) => (
          <React.Fragment key={`${item.tipo}-${item.id}-${index}`}>
            <ListItem
              button
              onClick={() => handleResultClick(item)}
              sx={{
                '&:hover': {
                  bgcolor: `${item.cor}10`,
                },
              }}
            >
              <ListItemIcon sx={{ color: item.cor, minWidth: 40 }}>
                {item.icone}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {item.titulo}
                  </Typography>
                }
                secondary={item.subtitulo}
              />
              <Chip 
                label={item.tipo} 
                size="small" 
                sx={{ 
                  bgcolor: `${item.cor}20`,
                  color: item.cor,
                  fontWeight: 600,
                  textTransform: 'capitalize'
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
        // 🔥 Se for agendamento, vai para a lista de agendamentos
        if (notification.tipo === 'agendamento' || notification.tipo === 'lembrete') {
          navigate('/agendamentos');
        } 
        // 🔥 Se for cliente, vai para a lista de clientes
        else if (notification.tipo === 'cliente') {
          navigate('/clientes');
        }
        // 🔥 Se for estoque, vai para o estoque
        else if (notification.tipo === 'estoque') {
          navigate('/estoque');
        }
        // 🔥 Se for pagamento, vai para o financeiro
        else if (notification.tipo === 'pagamento') {
          navigate('/financeiro/receber');
        }
        // 🔥 Se for atendimento, vai para o atendimento específico
        else if (notification.tipo === 'atendimento') {
          navigate(notification.link); // Esse link tem o ID específico
        }
        // 🔥 Para outros tipos, usa o link genérico
        else {
          navigate(notification.link);
        }
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

        {/* 🔥 CAMPO DE BUSCA LIVRE */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            inputRef={searchInputRef}
            placeholder="Buscar clientes, serviços, produtos... (busca livre)"
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

        {/* 🔥 POPOVER DE RESULTADOS DA BUSCA */}
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
