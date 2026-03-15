// src/pages/Fidelidade.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
  Tab,
  Tabs,
  Badge,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Zoom,
  Fab,
  Skeleton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Snackbar,
  Menu,
  MenuItem as MenuItemMUI,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  Redeem as RewardIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  MonetizationOn as CoinIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from '../hooks/useFirebase';
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';
import { auditoriaService } from '../services/auditoriaService';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função utilitária para formatar data com segurança
const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '—';
  
  try {
    // Handle Firestore Timestamp
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (!isValid(dateObj)) return '—';
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '—';
  }
};

// Função para formatar data com hora
const formatDateTime = (date) => {
  if (!date) return '—';
  
  try {
    // Handle Firestore Timestamp
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (!isValid(dateObj)) return '—';
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    console.warn('Erro ao formatar data/hora:', error);
    return '—';
  }
};

// Configuração dos níveis de fidelidade
const niveis = {
  bronze: { 
    cor: '#cd7f32', 
    corFundo: '#fff3e0',
    minimo: 0, 
    multiplicador: 1,
    beneficios: ['5% de desconto', 'Aniversário: 50 pontos extras'],
    icone: <StarIcon />,
    label: 'Bronze'
  },
  prata: { 
    cor: '#c0c0c0', 
    corFundo: '#f5f5f5',
    minimo: 500, 
    multiplicador: 1.2,
    beneficios: ['10% de desconto', 'Prioridade no agendamento', 'Cortesia no aniversário'],
    icone: <StarIcon />,
    label: 'Prata'
  },
  ouro: { 
    cor: '#ffd700', 
    corFundo: '#fff9e6',
    minimo: 2000, 
    multiplicador: 1.5,
    beneficios: ['15% de desconto', 'Agendamento VIP', 'Brinde surpresa', 'Convite para eventos'],
    icone: <StarIcon />,
    label: 'Ouro'
  },
  platina: { 
    cor: '#e5e4e2', 
    corFundo: '#f0f0f0',
    minimo: 5000, 
    multiplicador: 2,
    beneficios: ['20% de desconto', 'Acesso antecipado a promoções', 'Presente de aniversário', 'Consultoria exclusiva'],
    icone: <StarIcon />,
    label: 'Platina'
  },
};

// Componente de Card de Nível Mobile
const NivelMobileCard = ({ nivel, config, count, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          bgcolor: config.corFundo,
          border: `2px solid ${config.cor}`,
          cursor: 'pointer',
          height: '100%',
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ color: config.cor }}>
              {config.icone}
            </Box>
            <Chip
              label={count}
              size="small"
              sx={{ bgcolor: config.cor, color: 'white', height: 20 }}
            />
          </Box>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', color: config.cor }}>
            {config.label}
          </Typography>
          
          <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
            {config.multiplicador}x pontos
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de Card de Cliente Mobile
const ClienteMobileCard = ({ cliente, isAdmin, onGerenciarPontos, onResgatar }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Card 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Header do Card */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar 
              src={cliente.foto} 
              sx={{ 
                bgcolor: niveis[cliente.nivel]?.cor || '#9c27b0',
                width: 48,
                height: 48,
              }}
            >
              {cliente.nome?.charAt(0)}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {cliente.nome}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {cliente.telefone}
              </Typography>
            </Box>
            
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Nível e Saldo */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip
              label={niveis[cliente.nivel]?.label || cliente.nivel?.toUpperCase()}
              size="small"
              sx={{
                bgcolor: niveis[cliente.nivel] ? `${niveis[cliente.nivel].cor}20` : '#f5f5f5',
                color: niveis[cliente.nivel]?.cor || '#9c27b0',
                fontWeight: 600,
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CoinIcon sx={{ fontSize: 18, color: '#9c27b0' }} />
              <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                {cliente.saldo}
              </Typography>
            </Box>
          </Box>

          {/* Barra de Progresso */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">
                Próximo: {niveis[cliente.proximoNivel]?.label || cliente.proximoNivel}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {cliente.progresso?.toFixed(0) || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={cliente.progresso || 0}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: niveis[cliente.proximoNivel]?.cor || '#9c27b0',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Faltam {cliente.pontosFaltantes} pontos
            </Typography>
          </Box>

          {/* Ações */}
          <Collapse in={expanded}>
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end'
            }}>
              {isAdmin && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CoinIcon />}
                    onClick={() => onGerenciarPontos(cliente)}
                    sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                  >
                    Pontos
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<GiftIcon />}
                    onClick={() => onResgatar(cliente)}
                    sx={{ bgcolor: '#ff9800' }}
                  >
                    Resgatar
                  </Button>
                </>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de Card de Recompensa Mobile (atualizado para os dados do Firebase)
const RecompensaMobileCard = ({ recompensa, saldo, onResgatar, isAdmin }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const podeResgatar = saldo >= (recompensa.pontos || recompensa.pontosNecessarios || 0);
  const pontosNecessarios = recompensa.pontos || recompensa.pontosNecessarios || 0;
  
  // Verificar disponibilidade
  const disponivel = recompensa.ativo && (
    !recompensa.quantidade || 
    recompensa.quantidade > 0 || 
    recompensa.ilimitado
  );

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getIconByCategoria = () => {
    switch(recompensa.categoria) {
      case 'produtos':
        return <InventoryIcon />;
      case 'servicos':
        return <GiftIcon />;
      case 'descontos':
        return <TagIcon />;
      default:
        return <RewardIcon />;
    }
  };

  const getCategoriaLabel = () => {
    const categorias = {
      'produtos': 'Produto',
      'servicos': 'Serviço',
      'descontos': 'Desconto'
    };
    return categorias[recompensa.categoria] || recompensa.tipo || 'Recompensa';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          mb: 1.5,
          opacity: !disponivel || (saldo !== undefined && !podeResgatar) ? 0.5 : 1,
          cursor: disponivel && podeResgatar ? 'pointer' : 'default',
          position: 'relative',
        }}
        onClick={() => disponivel && podeResgatar && onResgatar(recompensa)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: recompensa.destaque ? '#ff9800' : '#9c27b0',
                width: 48,
                height: 48,
              }}
            >
              {recompensa.imagem ? (
                <img src={recompensa.imagem} alt={recompensa.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                getIconByCategoria()
              )}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {recompensa.nome}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                <Chip
                  size="small"
                  label={getCategoriaLabel()}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                {recompensa.nivelMinimo && (
                  <Chip
                    size="small"
                    label={niveis[recompensa.nivelMinimo]?.label || recompensa.nivelMinimo}
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      bgcolor: niveis[recompensa.nivelMinimo] ? `${niveis[recompensa.nivelMinimo].cor}20` : '#f5f5f5',
                      color: niveis[recompensa.nivelMinimo]?.cor || '#666',
                    }}
                  />
                )}
                {recompensa.destaque && (
                  <Chip
                    size="small"
                    label="Destaque"
                    sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#ff9800', color: 'white' }}
                  />
                )}
              </Box>
              {recompensa.descricao && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {recompensa.descricao.substring(0, 40)}
                  {recompensa.descricao.length > 40 ? '...' : ''}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ color: podeResgatar ? '#9c27b0' : '#ccc', fontWeight: 700 }}>
                {pontosNecessarios}
              </Typography>
              <Typography variant="caption">pontos</Typography>
              {!recompensa.ilimitado && recompensa.quantidade > 0 && (
                <Typography variant="caption" display="block" color="text.secondary">
                  {recompensa.quantidade} disponíveis
                </Typography>
              )}
            </Box>
          </Box>

          {!disponivel && (
            <Alert severity="warning" sx={{ mt: 1, py: 0, '& .MuiAlert-message': { fontSize: '0.75rem' } }}>
              Indisponível
            </Alert>
          )}

          {isAdmin && (
            <IconButton
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={handleClick}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItemMUI onClick={() => { handleClose(); /* editar */ }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItemMUI>
        <MenuItemMUI onClick={() => { handleClose(); /* duplicar */ }}>
          <AddIcon fontSize="small" sx={{ mr: 1 }} /> Duplicar
        </MenuItemMUI>
        <MenuItemMUI 
          onClick={() => { handleClose(); /* ativar/desativar */ }}
          sx={{ color: recompensa.ativo ? '#f44336' : '#4caf50' }}
        >
          {recompensa.ativo ? (
            <>
              <CancelIcon fontSize="small" sx={{ mr: 1 }} /> Desativar
            </>
          ) : (
            <>
              <CheckIcon fontSize="small" sx={{ mr: 1 }} /> Ativar
            </>
          )}
        </MenuItemMUI>
        <MenuItemMUI onClick={() => { handleClose(); /* excluir */ }} sx={{ color: '#f44336' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Excluir
        </MenuItemMUI>
      </Menu>
    </motion.div>
  );
};

// Componente de Item de Histórico Mobile
const HistoricoItem = ({ item }) => {
  const getIcon = () => {
    if (item.tipo === 'credito') return <AddIcon sx={{ color: '#4caf50' }} />;
    if (item.tipo === 'debito') return <RemoveIcon sx={{ color: '#f44336' }} />;
    return <GiftIcon sx={{ color: '#ff9800' }} />;
  };

  const getColor = () => {
    if (item.tipo === 'credito') return '#4caf50';
    if (item.tipo === 'debito') return '#f44336';
    return '#ff9800';
  };

  return (
    <ListItem divider>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: `${getColor()}20`, color: getColor() }}>
          {getIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={item.clienteNome || item.clienteId}
        secondary={
          <>
            <Typography variant="caption" display="block">
              {item.motivo || item.recompensaNome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(item.data)}
            </Typography>
          </>
        }
      />
      <ListItemSecondaryAction>
        <Typography
          variant="subtitle2"
          sx={{
            color: getColor(),
            fontWeight: 600,
          }}
        >
          {item.tipo === 'credito' ? '+' : '-'}{item.quantidade || item.pontosGastos}
        </Typography>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

// Componente Principal
function Fidelidade() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [clientesFidelidade, setClientesFidelidade] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [recompensasFirebase, setRecompensasFirebase] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedRecompensa, setSelectedRecompensa] = useState(null);
  const [openPontosDialog, setOpenPontosDialog] = useState(false);
  const [openRecompensaDialog, setOpenRecompensaDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openDetalhesRecompensa, setOpenDetalhesRecompensa] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pontosForm, setPontosForm] = useState({
    quantidade: '',
    motivo: '',
    tipo: 'credito',
  });
  const [config, setConfig] = useState({
    pontosPorReal: 1,
    pontosAniversario: 50,
    pontosIndicacao: 100,
  });
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // Hooks do Firebase
  const { data: clientes, loading: loadingClientes } = useFirebase('clientes');
  const { data: pontuacao, loading: loadingPontuacao } = useFirebase('pontuacao');
  const { data: resgates, loading: loadingResgates } = useFirebase('resgates_fidelidade');
  const { data: configuracoes, loading: loadingConfig } = useFirebase('config_fidelidade');
  const { data: recompensasData, loading: loadingRecompensas } = useFirebase('recompensas');

  useEffect(() => {
    // Carregar usuário do localStorage
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const user = JSON.parse(usuarioStr);
        setUsuario(user);
        setIsAdmin(user.cargo === 'admin' || user.permissoes?.includes('admin'));
      }
    } catch (e) {
      console.error('Erro ao carregar usuário:', e);
    }
  }, []);

  useEffect(() => {
    if (!loadingClientes && !loadingRecompensas) {
      carregarDados();
    }
  }, [loadingClientes, loadingRecompensas, pontuacao, resgates, configuracoes, recompensasData]);

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      
      // Registrar acesso na auditoria
      await auditoriaService.registrar('acesso_fidelidade', {
        entidade: 'fidelidade',
        detalhes: 'Acesso à página de fidelidade',
        usuarioId: usuario?.uid || 'sistema',
        usuarioNome: usuario?.nome || 'Sistema'
      });

      // Carregar configurações
      if (configuracoes && configuracoes.length > 0) {
        setConfig(configuracoes[0]);
      }

      // Carregar recompensas do Firebase
      if (recompensasData) {
        // Filtrar apenas recompensas ativas (ou todas se for admin)
        const recompensasFiltradas = isAdmin 
          ? recompensasData 
          : recompensasData.filter(r => r.ativo === true);
        
        setRecompensasFirebase(recompensasFiltradas);
        setRecompensas(recompensasFiltradas);
      }

      // Calcular pontuação de cada cliente
      const dados = clientes?.map(cliente => {
        const pontosGanhos = pontuacao?.filter(p => p.clienteId === cliente.id && p.tipo === 'credito')
          .reduce((acc, p) => acc + (p.quantidade || 0), 0) || 0;
        
        const pontosGastos = pontuacao?.filter(p => p.clienteId === cliente.id && p.tipo === 'debito')
          .reduce((acc, p) => acc + (p.quantidade || 0), 0) || 0;
        
        const saldo = pontosGanhos - pontosGastos;
        
        let nivel = 'bronze';
        if (saldo >= 5000) nivel = 'platina';
        else if (saldo >= 2000) nivel = 'ouro';
        else if (saldo >= 500) nivel = 'prata';
        
        const proximoNivel = nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'platina';
        const pontosFaltantes = Math.max(0, niveis[proximoNivel]?.minimo - saldo);
        const progresso = Math.min((saldo / (niveis[proximoNivel]?.minimo || 1)) * 100, 100);
        
        // Histórico do cliente
        const historicoCliente = [
          ...(pontuacao?.filter(p => p.clienteId === cliente.id) || []),
          ...(resgates?.filter(r => r.clienteId === cliente.id) || [])
        ].sort((a, b) => {
          const dataA = a.data ? new Date(a.data) : new Date(0);
          const dataB = b.data ? new Date(b.data) : new Date(0);
          return dataB - dataA;
        });

        return {
          ...cliente,
          saldo,
          nivel,
          proximoNivel,
          pontosFaltantes,
          progresso,
          historico: historicoCliente.slice(0, 10),
        };
      }).sort((a, b) => b.saldo - a.saldo) || [];

      setClientesFidelidade(dados);

      // Carregar histórico geral
      const historicoGeral = [
        ...(pontuacao?.map(p => ({ ...p, tipoOriginal: 'pontuacao' })) || []),
        ...(resgates?.map(r => ({ ...r, tipoOriginal: 'resgate', tipo: 'resgate' })) || [])
      ].sort((a, b) => {
        const dataA = a.data ? new Date(a.data) : new Date(0);
        const dataB = b.data ? new Date(b.data) : new Date(0);
        return dataB - dataA;
      });
      setHistorico(historicoGeral);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (!error.message.includes('permissions')) {
        mostrarSnackbar('Erro ao carregar dados de fidelidade', 'error');
      }
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_fidelidade',
        detalhes: 'Erro ao carregar dados de fidelidade'
      });
    } finally {
      setLoading(false);
    }
  }, [clientes, pontuacao, resgates, configuracoes, recompensasData, usuario, isAdmin]);

  const handleAdicionarPontos = async () => {
    try {
      if (!selectedCliente) return;
      if (!pontosForm.quantidade || pontosForm.quantidade <= 0) {
        mostrarSnackbar('Quantidade inválida', 'error');
        return;
      }

      if (!isAdmin) {
        mostrarSnackbar('Apenas administradores podem gerenciar pontos manualmente', 'error');
        return;
      }

      const quantidade = parseInt(pontosForm.quantidade);
      
      // Validar saldo para débito
      if (pontosForm.tipo === 'debito' && selectedCliente.saldo < quantidade) {
        mostrarSnackbar('Saldo insuficiente', 'error');
        return;
      }

      const novaPontuacao = {
        clienteId: selectedCliente.id,
        clienteNome: selectedCliente.nome,
        quantidade,
        tipo: pontosForm.tipo,
        motivo: pontosForm.motivo || (pontosForm.tipo === 'credito' ? 'Crédito manual' : 'Débito manual'),
        data: new Date().toISOString(),
        usuarioId: usuario?.uid || 'sistema',
        usuarioNome: usuario?.nome || 'Sistema',
        createdAt: Timestamp.now(),
      };

      await firebaseService.add('pontuacao', novaPontuacao);

      // Registrar na auditoria
      await auditoriaService.registrar(
        pontosForm.tipo === 'credito' ? 'credito_pontos' : 'debito_pontos',
        {
          entidade: 'pontuacao',
          entidadeId: selectedCliente.id,
          detalhes: `${pontosForm.tipo === 'credito' ? 'Adição' : 'Remoção'} de ${quantidade} pontos para ${selectedCliente.nome}`,
          dados: {
            clienteId: selectedCliente.id,
            clienteNome: selectedCliente.nome,
            quantidade,
            motivo: pontosForm.motivo,
            tipo: pontosForm.tipo,
            saldoAnterior: selectedCliente.saldo,
            saldoNovo: pontosForm.tipo === 'credito' 
              ? selectedCliente.saldo + quantidade 
              : selectedCliente.saldo - quantidade
          }
        }
      );
      
      mostrarSnackbar(
        pontosForm.tipo === 'credito' 
          ? `${quantidade} pontos adicionados!` 
          : `${quantidade} pontos removidos!`
      );

      setOpenPontosDialog(false);
      setPontosForm({ quantidade: '', motivo: '', tipo: 'credito' });
      
      // Recarregar dados
      await carregarDados();
      
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      mostrarSnackbar('Erro ao processar pontos', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'gerenciar_pontos',
        clienteId: selectedCliente?.id,
        dados: pontosForm
      });
    }
  };

  const handleResgatarRecompensa = async (recompensa) => {
    try {
      if (!selectedCliente) {
        mostrarSnackbar('Selecione um cliente primeiro', 'warning');
        return;
      }

      const pontosNecessarios = recompensa.pontos || recompensa.pontosNecessarios || 0;
      
      if (selectedCliente.saldo < pontosNecessarios) {
        mostrarSnackbar('Saldo insuficiente', 'error');
        return;
      }

      // Validar disponibilidade
      if (!recompensa.ativo) {
        mostrarSnackbar('Recompensa não está ativa', 'error');
        return;
      }

      if (!recompensa.ilimitado && recompensa.quantidade <= 0) {
        mostrarSnackbar('Recompensa sem estoque disponível', 'error');
        return;
      }

      // Validar nível mínimo
      if (recompensa.nivelMinimo && niveis[recompensa.nivelMinimo]) {
        const nivelIndex = Object.keys(niveis).indexOf(selectedCliente.nivel);
        const nivelMinimoIndex = Object.keys(niveis).indexOf(recompensa.nivelMinimo);
        
        if (nivelIndex < nivelMinimoIndex) {
          mostrarSnackbar(`Cliente precisa ser nível ${niveis[recompensa.nivelMinimo].label} ou superior`, 'error');
          return;
        }
      }

      if (!isAdmin) {
        mostrarSnackbar('Apenas administradores podem realizar resgates', 'error');
        return;
      }

      const resgate = {
        clienteId: selectedCliente.id,
        clienteNome: selectedCliente.nome,
        recompensaId: recompensa.id,
        recompensaNome: recompensa.nome,
        pontosGastos: pontosNecessarios,
        data: new Date().toISOString(),
        status: 'resgatado',
        utilizado: false,
        usuarioId: usuario?.uid || 'sistema',
        usuarioNome: usuario?.nome || 'Sistema',
        createdAt: Timestamp.now(),
      };

      await firebaseService.add('resgates_fidelidade', resgate);

      // Atualizar quantidade da recompensa se não for ilimitada
      if (!recompensa.ilimitado && recompensa.quantidade > 0) {
        await firebaseService.update('recompensas', recompensa.id, {
          quantidade: recompensa.quantidade - 1,
          updatedAt: Timestamp.now(),
        });
      }

      // Registrar débito dos pontos
      const debito = {
        clienteId: selectedCliente.id,
        clienteNome: selectedCliente.nome,
        quantidade: pontosNecessarios,
        tipo: 'debito',
        motivo: `Resgate: ${recompensa.nome}`,
        data: new Date().toISOString(),
        usuarioId: usuario?.uid || 'sistema',
        usuarioNome: usuario?.nome || 'Sistema',
        createdAt: Timestamp.now(),
      };
      await firebaseService.add('pontuacao', debito);

      // Registrar na auditoria
      await auditoriaService.registrar('resgate_recompensa', {
        entidade: 'resgates_fidelidade',
        detalhes: `Resgate de ${recompensa.nome} por ${selectedCliente.nome}`,
        dados: {
          clienteId: selectedCliente.id,
          clienteNome: selectedCliente.nome,
          recompensaId: recompensa.id,
          recompensaNome: recompensa.nome,
          pontosGastos: pontosNecessarios,
          saldoAnterior: selectedCliente.saldo,
          saldoNovo: selectedCliente.saldo - pontosNecessarios
        }
      });

      mostrarSnackbar(`Recompensa "${recompensa.nome}" resgatada!`);
      setOpenRecompensaDialog(false);
      
      // Recarregar dados
      await carregarDados();
      
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error);
      mostrarSnackbar('Erro ao resgatar recompensa', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'resgatar_recompensa',
        clienteId: selectedCliente?.id,
        recompensaId: recompensa?.id
      });
    }
  };

  // Filtrar recompensas
  const recompensasFiltradas = useMemo(() => {
    return recompensas.filter(r => {
      const matchesCategoria = filtroCategoria === 'todos' || r.categoria === filtroCategoria;
      const matchesNivel = filtroNivel === 'todos' || r.nivelMinimo === filtroNivel;
      const matchesTexto = searchTerm === '' || 
        r.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategoria && matchesNivel && matchesTexto;
    });
  }, [recompensas, searchTerm, filtroCategoria, filtroNivel]);

  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    return clientesFidelidade.filter(c => {
      const matchesTexto = searchTerm === '' || 
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefone?.includes(searchTerm);
      
      const matchesNivel = filtroNivel === 'todos' || c.nivel === filtroNivel;
      
      return matchesTexto && matchesNivel;
    });
  }, [clientesFidelidade, searchTerm, filtroNivel]);

  // Estatísticas
  const stats = useMemo(() => {
    return {
      total: clientesFidelidade.length,
      bronze: clientesFidelidade.filter(c => c.nivel === 'bronze').length,
      prata: clientesFidelidade.filter(c => c.nivel === 'prata').length,
      ouro: clientesFidelidade.filter(c => c.nivel === 'ouro').length,
      platina: clientesFidelidade.filter(c => c.nivel === 'platina').length,
      totalPontos: clientesFidelidade.reduce((acc, c) => acc + c.saldo, 0),
      recompensasAtivas: recompensas.filter(r => r.ativo).length,
    };
  }, [clientesFidelidade, recompensas]);

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rectangular" height={isMobile ? 100 : 150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 180 : 100} sx={{ borderRadius: 2, mb: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      pb: isMobile ? 10 : 3,
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      {/* Cabeçalho Mobile */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ 
              fontWeight: 700, 
              color: '#9c27b0',
              fontSize: isMobile ? '1.5rem' : '2.125rem'
            }}
          >
            Fidelidade
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {stats.recompensasAtivas} recompensas disponíveis
          </Typography>
          {!isAdmin && (
            <Alert severity="info" sx={{ mt: 1, fontSize: '0.8rem' }}>
              Modo cliente - Visualização apenas
            </Alert>
          )}
        </Box>
        
        {isAdmin && (
          <Zoom in={true}>
            <Fab
              size={isMobile ? "medium" : "large"}
              onClick={handleConfigChange}
              sx={{ 
                bgcolor: '#9c27b0',
                '&:hover': { bgcolor: '#7b1fa2' },
              }}
            >
              <SettingsIcon />
            </Fab>
          </Zoom>
        )}
      </Box>

      {/* Cards de Níveis Mobile */}
      <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
        {Object.entries(niveis).map(([nivel, config]) => (
          <Grid item xs={6} sm={6} md={3} key={nivel}>
            <NivelMobileCard
              nivel={nivel}
              config={config}
              count={stats[nivel]}
              onClick={() => {
                setFiltroNivel(nivel);
                setTabValue(0);
              }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Barra de Pesquisa e Filtros Mobile */}
      <Paper
        elevation={0}
        sx={{
          p: 0.5,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={tabValue === 0 ? "Buscar cliente..." : "Buscar recompensa..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', ml: 1 }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ ml: 1 }}
        />
        
        <IconButton 
          onClick={() => setOpenFilterDrawer(true)}
          sx={{ 
            mx: 1,
            color: filtroNivel !== 'todos' || filtroCategoria !== 'todos' ? '#9c27b0' : 'text.secondary'
          }}
        >
          <Badge 
            variant="dot" 
            color="primary"
            invisible={filtroNivel === 'todos' && filtroCategoria === 'todos'}
          >
            <FilterIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={carregarDados} sx={{ color: 'text.secondary' }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Tabs Mobile */}
      <Paper sx={{ mb: 2, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: isMobile ? '0.7rem' : '0.875rem',
            }
          }}
        >
          <Tab 
            icon={<PersonIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Clientes" 
            iconPosition="start"
          />
          <Tab 
            icon={<GiftIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Recompensas" 
            iconPosition="start"
          />
          <Tab 
            icon={<HistoryIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Histórico" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Conteúdo das Tabs */}
      <AnimatePresence mode="wait">
        {/* Tab Clientes */}
        {tabValue === 0 && (
          <motion.div
            key="clientes"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {clientesFiltrados.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography color="textSecondary">
                  Nenhum cliente encontrado
                </Typography>
              </Paper>
            ) : (
              clientesFiltrados.map((cliente) => (
                <ClienteMobileCard
                  key={cliente.id}
                  cliente={cliente}
                  isAdmin={isAdmin}
                  onGerenciarPontos={(c) => {
                    setSelectedCliente(c);
                    setOpenPontosDialog(true);
                  }}
                  onResgatar={(c) => {
                    setSelectedCliente(c);
                    setOpenRecompensaDialog(true);
                  }}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Tab Recompensas */}
        {tabValue === 1 && (
          <motion.div
            key="recompensas"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Total de pontos acumulados: <strong>{stats.totalPontos}</strong>
              </Alert>
            </Box>
            
            {recompensasFiltradas.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <GiftIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography color="textSecondary">
                  Nenhuma recompensa encontrada
                </Typography>
              </Paper>
            ) : (
              recompensasFiltradas.map((recompensa) => (
                <RecompensaMobileCard
                  key={recompensa.id}
                  recompensa={recompensa}
                  saldo={selectedCliente?.saldo}
                  isAdmin={isAdmin}
                  onResgatar={() => handleResgatarRecompensa(recompensa)}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Tab Histórico */}
        {tabValue === 2 && (
          <motion.div
            key="historico"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card>
              <List sx={{ maxHeight: isMobile ? 'calc(100vh - 300px)' : 'auto', overflow: 'auto' }}>
                {historico.slice(0, 50).map((item, index) => (
                  <HistoricoItem key={index} item={item} />
                ))}
                
                {historico.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Nenhuma movimentação"
                      secondary="O histórico será exibido aqui"
                      sx={{ textAlign: 'center' }}
                    />
                  </ListItem>
                )}
              </List>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer de Filtros */}
      <SwipeableDrawer
        anchor="bottom"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        onOpen={() => setOpenFilterDrawer(true)}
        disableSwipeToOpen={false}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80vh',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filtros
            </Typography>
            <IconButton onClick={() => setOpenFilterDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Nível
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            <Button
              fullWidth
              variant={filtroNivel === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroNivel('todos')}
              sx={{ 
                justifyContent: 'flex-start',
                bgcolor: filtroNivel === 'todos' ? '#9c27b0' : 'transparent',
                color: filtroNivel === 'todos' ? 'white' : 'inherit',
              }}
            >
              Todos os níveis
            </Button>
            
            {Object.entries(niveis).map(([nivel, config]) => (
              <Button
                key={nivel}
                fullWidth
                variant={filtroNivel === nivel ? 'contained' : 'outlined'}
                onClick={() => setFiltroNivel(nivel)}
                sx={{ 
                  justifyContent: 'flex-start',
                  bgcolor: filtroNivel === nivel ? config.cor : 'transparent',
                  color: filtroNivel === nivel ? 'white' : config.cor,
                  borderColor: config.cor,
                  '&:hover': {
                    bgcolor: filtroNivel === nivel ? config.cor : `${config.cor}20`,
                  }
                }}
              >
                {config.label}
              </Button>
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Categoria
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant={filtroCategoria === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroCategoria('todos')}
              sx={{ 
                justifyContent: 'flex-start',
                bgcolor: filtroCategoria === 'todos' ? '#9c27b0' : 'transparent',
              }}
            >
              Todas as categorias
            </Button>
            <Button
              fullWidth
              variant={filtroCategoria === 'produtos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroCategoria('produtos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Produtos
            </Button>
            <Button
              fullWidth
              variant={filtroCategoria === 'servicos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroCategoria('servicos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Serviços
            </Button>
            <Button
              fullWidth
              variant={filtroCategoria === 'descontos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroCategoria('descontos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Descontos
            </Button>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={() => setOpenFilterDrawer(false)}
            sx={{ bgcolor: '#9c27b0', mt: 3 }}
          >
            Aplicar Filtros
          </Button>
        </Box>
      </SwipeableDrawer>

      {/* Dialog de Pontos */}
      <Dialog 
        open={openPontosDialog} 
        onClose={() => setOpenPontosDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#9c27b0', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: isMobile ? 2 : 3,
        }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={() => setOpenPontosDialog(false)}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            {selectedCliente?.nome} - Gerenciar Pontos
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Tipo de operação</FormLabel>
                <RadioGroup
                  row
                  value={pontosForm.tipo}
                  onChange={(e) => setPontosForm({ ...pontosForm, tipo: e.target.value })}
                >
                  <FormControlLabel value="credito" control={<Radio />} label="Adicionar" />
                  <FormControlLabel value="debito" control={<Radio />} label="Remover" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantidade de pontos"
                value={pontosForm.quantidade}
                onChange={(e) => setPontosForm({ ...pontosForm, quantidade: e.target.value })}
                size="small"
                InputProps={{
                  inputProps: { min: 1 },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                Saldo atual: <strong>{selectedCliente?.saldo || 0} pontos</strong>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo"
                value={pontosForm.motivo}
                onChange={(e) => setPontosForm({ ...pontosForm, motivo: e.target.value })}
                size="small"
                placeholder="Ex: Indicação, promoção, ajuste..."
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={() => setOpenPontosDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleAdicionarPontos}
            variant="contained"
            sx={{ bgcolor: '#9c27b0' }}
            fullWidth={isMobile}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Recompensas */}
      <Dialog 
        open={openRecompensaDialog} 
        onClose={() => setOpenRecompensaDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#ff9800', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: isMobile ? 2 : 3,
        }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={() => setOpenRecompensaDialog(false)}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            Resgatar Recompensa
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedCliente && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Saldo de {selectedCliente.nome}: <strong>{selectedCliente.saldo} pontos</strong>
            </Alert>
          )}
          
          <Box sx={{ mt: 2 }}>
            {recompensasFiltradas.map((recompensa) => {
              const pontosNecessarios = recompensa.pontos || recompensa.pontosNecessarios || 0;
              const podeResgatar = selectedCliente && 
                selectedCliente.saldo >= pontosNecessarios &&
                recompensa.ativo &&
                (recompensa.ilimitado || recompensa.quantidade > 0);

              return (
                <Card
                  key={recompensa.id}
                  sx={{
                    mb: 1,
                    cursor: selectedCliente && podeResgatar ? 'pointer' : 'default',
                    opacity: !podeResgatar ? 0.5 : 1,
                    '&:hover': selectedCliente && podeResgatar ? { bgcolor: '#f5f5f5' } : {},
                  }}
                  onClick={() => selectedCliente && podeResgatar && handleResgatarRecompensa(recompensa)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: podeResgatar ? '#9c27b0' : '#ccc',
                          width: 48,
                          height: 48,
                        }}
                      >
                        {recompensa.imagem ? (
                          <img src={recompensa.imagem} alt={recompensa.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          recompensa.categoria === 'produtos' ? <InventoryIcon /> : <GiftIcon />
                        )}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {recompensa.nome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {recompensa.categoria || recompensa.tipo}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ color: podeResgatar ? '#9c27b0' : '#ccc', fontWeight: 700 }}>
                          {pontosNecessarios}
                        </Typography>
                        <Typography variant="caption">pontos</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecompensaDialog(false)} fullWidth={isMobile}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bottom Navigation Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1000,
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => {
              setBottomNavValue(newValue);
              switch(newValue) {
                case 0:
                  setTabValue(0);
                  break;
                case 1:
                  setTabValue(1);
                  break;
                case 2:
                  setTabValue(2);
                  break;
                case 3:
                  setOpenFilterDrawer(true);
                  break;
                default:
                  break;
              }
            }}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root.Mui-selected': {
                color: '#9c27b0',
              },
            }}
          >
            <BottomNavigationAction label="Clientes" icon={<PersonIcon />} />
            <BottomNavigationAction label="Recompensas" icon={<GiftIcon />} />
            <BottomNavigationAction label="Histórico" icon={<HistoryIcon />} />
            <BottomNavigationAction 
              label="Filtros" 
              icon={
                <Badge 
                  variant="dot" 
                  color="primary"
                  invisible={filtroNivel === 'todos' && filtroCategoria === 'todos'}
                >
                  <FilterIcon />
                </Badge>
              } 
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Fidelidade;
