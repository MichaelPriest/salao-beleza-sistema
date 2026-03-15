// src/pages/GerenciarFidelidade.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
  Rating,
  Badge,
  CardActions,
  CardMedia,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Zoom,
  Fab,
  Skeleton,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Pagination,
  Stack,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  Redeem as RewardIcon,
  History as HistoryIcon,
  MonetizationOn as CoinIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Share as ShareIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Níveis de fidelidade
const niveis = {
  bronze: { 
    cor: '#cd7f32', 
    corFundo: '#fff3e0',
    nome: 'Bronze', 
    minimo: 0, 
    multiplicador: 1,
    icone: <StarIcon />
  },
  prata: { 
    cor: '#c0c0c0', 
    corFundo: '#f5f5f5',
    nome: 'Prata', 
    minimo: 500, 
    multiplicador: 1.2,
    icone: <StarIcon />
  },
  ouro: { 
    cor: '#ffd700', 
    corFundo: '#fff9e6',
    nome: 'Ouro', 
    minimo: 2000, 
    multiplicador: 1.5,
    icone: <StarIcon />
  },
  platina: { 
    cor: '#e5e4e2', 
    corFundo: '#f0f0f0',
    nome: 'Platina', 
    minimo: 5000, 
    multiplicador: 2,
    icone: <StarIcon />
  },
};

// Função utilitária para formatar data com segurança
const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '—';
  
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (!isValid(dateObj)) return '—';
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '—';
  }
};

// Função para obter iniciais do nome
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Função para verificar se a foto é válida
const temFotoValida = (foto) => {
  return foto && foto !== 'null' && foto !== 'undefined' && foto.trim() !== '';
};

// Componente de Card de Cliente Mobile
const ClienteMobileCard = ({ cliente, saldo, nivel, resgatesCount, onGerenciarPontos, onVerHistorico }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 3,
          },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={temFotoValida(cliente.foto) ? cliente.foto : undefined}
              sx={{ 
                bgcolor: niveis[nivel]?.cor || '#9c27b0',
                width: 48,
                height: 48,
              }}
            >
              {!temFotoValida(cliente.foto) && getInitials(cliente.nome)}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {cliente.nome}
                </Typography>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={cliente.email || 'Sem email'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                
                <Chip
                  size="small"
                  label={cliente.telefone || 'Sem telefone'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  size="small"
                  label={nivel.toUpperCase()}
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: niveis[nivel].cor,
                    color: nivel === 'ouro' ? '#000' : '#fff',
                    fontWeight: 600,
                  }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CoinIcon sx={{ fontSize: 14, color: '#ff9800' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#ff9800' }}>
                    {saldo} pontos
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  {resgatesCount} resgates
                </Typography>
              </Box>

              <Collapse in={expanded}>
                <Box sx={{ 
                  mt: 2, 
                  pt: 2, 
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'flex-end'
                }} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Gerenciar Pontos">
                    <IconButton
                      size="small"
                      onClick={() => onGerenciarPontos(cliente)}
                      sx={{ color: '#ff9800' }}
                    >
                      <StarIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ver Histórico">
                    <IconButton
                      size="small"
                      onClick={() => onVerHistorico(cliente.id)}
                      sx={{ color: '#2196f3' }}
                    >
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de Card de Recompensa Mobile
const RecompensaMobileCard = ({ recompensa, onEditar, onExcluir }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          opacity: recompensa.ativo ? 1 : 0.6,
          bgcolor: recompensa.ativo ? 'white' : '#f5f5f5',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 3,
          },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={recompensa.imagem}
              sx={{ 
                bgcolor: niveis[recompensa.nivelMinimo]?.cor || '#999',
                width: 48,
                height: 48,
              }}
            >
              <GiftIcon />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {recompensa.nome}
                </Typography>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={recompensa.tipo}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                
                <Chip
                  size="small"
                  label={recompensa.nivelMinimo?.toUpperCase()}
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: niveis[recompensa.nivelMinimo]?.cor || '#999',
                    color: '#fff',
                  }}
                />

                {!recompensa.ativo && (
                  <Chip
                    size="small"
                    label="Inativo"
                    color="error"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ fontSize: 14, color: '#ff9800' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#ff9800' }}>
                    {recompensa.pontosNecessarios} pontos
                  </Typography>
                </Box>

                {recompensa.quantidadeDisponivel ? (
                  <Chip
                    size="small"
                    label={`${recompensa.quantidadeDisponivel} disponíveis`}
                    color={recompensa.quantidadeDisponivel > 0 ? 'success' : 'error'}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                ) : (
                  <Chip
                    size="small"
                    label="Ilimitado"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>

              <Collapse in={expanded}>
                <Box sx={{ 
                  mt: 2, 
                  pt: 2, 
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'flex-end'
                }} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => onEditar(recompensa)}
                      sx={{ color: '#ff9800' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      onClick={() => onExcluir(recompensa)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de Item de Resgate Mobile
const ResgateItem = ({ resgate, cliente }) => {
  return (
    <ListItem divider>
      <ListItemAvatar>
        <Avatar 
          src={temFotoValida(cliente?.foto) ? cliente.foto : undefined}
          sx={{ bgcolor: '#9c27b0' }}
        >
          {!temFotoValida(cliente?.foto) && (cliente?.nome ? getInitials(cliente.nome) : '?')}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={resgate.clienteNome || 'Cliente'}
        secondary={
          <>
            <Typography variant="caption" display="block">
              {resgate.recompensaNome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(resgate.data)}
            </Typography>
          </>
        }
      />
      <ListItemSecondaryAction>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#ff9800', display: 'block' }}>
            {resgate.pontosGastos} pts
          </Typography>
          <Chip
            size="small"
            label={resgate.status || 'Resgatado'}
            color={resgate.status === 'cancelado' ? 'error' : 'success'}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

// Componente Principal
function GerenciarFidelidade() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [pontuacoes, setPontuacoes] = useState([]);
  const [resgates, setResgates] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [filtro, setFiltro] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRecompensaDialog, setOpenRecompensaDialog] = useState(false);
  const [openPontosDialog, setOpenPontosDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [recompensaEditando, setRecompensaEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // Estado para pontos
  const [pontosForm, setPontosForm] = useState({
    clienteId: '',
    quantidade: '',
    tipo: 'credito',
    motivo: '',
  });

  // Estado para recompensa
  const [recompensaForm, setRecompensaForm] = useState({
    nome: '',
    descricao: '',
    pontosNecessarios: '',
    tipo: 'desconto',
    valor: '',
    nivelMinimo: 'bronze',
    imagem: '',
    quantidadeDisponivel: '',
    ativo: true,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados de fidelidade...');

      const [clientesData, pontuacoesData, resgatesData, recompensasData] = await Promise.all([
        firebaseService.getAll('clientes').catch(err => {
          console.error('Erro ao buscar clientes:', err);
          return [];
        }),
        firebaseService.getAll('pontuacao').catch(err => {
          console.error('Erro ao buscar pontuacoes:', err);
          return [];
        }),
        firebaseService.getAll('resgates_fidelidade').catch(err => {
          console.error('Erro ao buscar resgates:', err);
          return [];
        }),
        firebaseService.getAll('recompensas').catch(err => {
          console.error('Erro ao buscar recompensas:', err);
          return [];
        })
      ]);
      
      setClientes(clientesData || []);
      setPontuacoes(pontuacoesData || []);
      setResgates(resgatesData || []);
      setRecompensas(recompensasData || []);

      // Registrar acesso na auditoria
      await auditoriaService.registrar('acesso_gerenciar_fidelidade', {
        entidade: 'fidelidade',
        detalhes: 'Acesso à página de gerenciamento de fidelidade',
        dados: {
          totalClientes: clientesData?.length || 0,
          totalRecompensas: recompensasData?.length || 0,
          totalResgates: resgatesData?.length || 0
        }
      });

      console.log('📊 Dados carregados:', {
        clientes: clientesData?.length || 0,
        pontuacoes: pontuacoesData?.length || 0,
        resgates: resgatesData?.length || 0,
        recompensas: recompensasData?.length || 0
      });

      mostrarSnackbar('Dados carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_gerenciar_fidelidade',
        detalhes: 'Erro ao carregar dados de fidelidade'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleOpenPontosDialog = (cliente = null) => {
    if (cliente) {
      setClienteSelecionado(cliente);
      setPontosForm({
        clienteId: cliente.id,
        quantidade: '',
        tipo: 'credito',
        motivo: '',
      });
    }
    setOpenPontosDialog(true);
  };

  const handleClosePontosDialog = () => {
    setOpenPontosDialog(false);
    setClienteSelecionado(null);
  };

  const handleOpenRecompensaDialog = (recompensa = null) => {
    if (recompensa) {
      setRecompensaEditando(recompensa);
      setRecompensaForm({
        nome: recompensa.nome || '',
        descricao: recompensa.descricao || '',
        pontosNecessarios: recompensa.pontosNecessarios || '',
        tipo: recompensa.tipo || 'desconto',
        valor: recompensa.valor || '',
        nivelMinimo: recompensa.nivelMinimo || 'bronze',
        imagem: recompensa.imagem || '',
        quantidadeDisponivel: recompensa.quantidadeDisponivel || '',
        ativo: recompensa.ativo !== false,
      });
    } else {
      setRecompensaEditando(null);
      setRecompensaForm({
        nome: '',
        descricao: '',
        pontosNecessarios: '',
        tipo: 'desconto',
        valor: '',
        nivelMinimo: 'bronze',
        imagem: '',
        quantidadeDisponivel: '',
        ativo: true,
      });
    }
    setOpenRecompensaDialog(true);
  };

  const handleCloseRecompensaDialog = () => {
    setOpenRecompensaDialog(false);
    setRecompensaEditando(null);
  };

  const handlePontosInputChange = (e) => {
    const { name, value } = e.target;
    setPontosForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRecompensaInputChange = (e) => {
    const { name, value } = e.target;
    setRecompensaForm(prev => ({ ...prev, [name]: value }));
  };

  const calcularSaldoCliente = useCallback((clienteId) => {
    const pontosCliente = pontuacoes.filter(p => p.clienteId === clienteId);
    const creditos = pontosCliente
      .filter(p => p.tipo === 'credito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);
    const debitos = pontosCliente
      .filter(p => p.tipo === 'debito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);
    return creditos - debitos;
  }, [pontuacoes]);

  const getNivelCliente = useCallback((saldo) => {
    if (saldo >= 5000) return 'platina';
    if (saldo >= 2000) return 'ouro';
    if (saldo >= 500) return 'prata';
    return 'bronze';
  }, []);

  const handleSalvarPontos = async () => {
    try {
      if (!pontosForm.quantidade || pontosForm.quantidade <= 0) {
        mostrarSnackbar('Quantidade inválida', 'error');
        return;
      }

      if (!pontosForm.motivo.trim()) {
        mostrarSnackbar('Motivo é obrigatório', 'error');
        return;
      }

      const cliente = clientes.find(c => c.id === pontosForm.clienteId);
      const quantidade = parseInt(pontosForm.quantidade);
      
      const pontuacaoData = {
        clienteId: pontosForm.clienteId,
        clienteNome: cliente?.nome || 'Cliente',
        quantidade: quantidade,
        tipo: pontosForm.tipo,
        motivo: pontosForm.motivo,
        data: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        usuarioResponsavel: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
      };

      await firebaseService.add('pontuacao', pontuacaoData);

      // Registrar na auditoria
      await auditoriaService.registrar(
        pontosForm.tipo === 'credito' ? 'credito_pontos_manual' : 'debito_pontos_manual',
        {
          entidade: 'pontuacao',
          entidadeId: pontosForm.clienteId,
          detalhes: `${pontosForm.tipo === 'credito' ? 'Adição' : 'Remoção'} de ${quantidade} pontos para ${cliente?.nome}`,
          dados: {
            clienteId: pontosForm.clienteId,
            clienteNome: cliente?.nome,
            quantidade,
            motivo: pontosForm.motivo,
            tipo: pontosForm.tipo
          }
        }
      );

      // Atualizar lista local
      setPontuacoes(prev => [...prev, pontuacaoData]);

      mostrarSnackbar('Pontos adicionados com sucesso!');
      handleClosePontosDialog();
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      mostrarSnackbar('Erro ao adicionar pontos', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'salvar_pontos_fidelidade',
        dados: pontosForm
      });
    }
  };

  const handleSalvarRecompensa = async () => {
    try {
      if (!recompensaForm.nome.trim()) {
        mostrarSnackbar('Nome da recompensa é obrigatório', 'error');
        return;
      }

      if (!recompensaForm.pontosNecessarios || recompensaForm.pontosNecessarios <= 0) {
        mostrarSnackbar('Pontos necessários inválidos', 'error');
        return;
      }

      const recompensaData = {
        nome: recompensaForm.nome.trim(),
        descricao: recompensaForm.descricao.trim(),
        pontosNecessarios: parseInt(recompensaForm.pontosNecessarios),
        tipo: recompensaForm.tipo,
        valor: recompensaForm.valor ? parseFloat(recompensaForm.valor) : null,
        nivelMinimo: recompensaForm.nivelMinimo,
        imagem: recompensaForm.imagem || null,
        quantidadeDisponivel: recompensaForm.quantidadeDisponivel ? parseInt(recompensaForm.quantidadeDisponivel) : null,
        ativo: recompensaForm.ativo,
        updatedAt: new Date().toISOString(),
      };

      if (recompensaEditando) {
        // Buscar dados antigos para auditoria
        const recompensaAntiga = { ...recompensaEditando };
        
        await firebaseService.update('recompensas', recompensaEditando.id, recompensaData);
        
        setRecompensas(prev => prev.map(r => 
          r.id === recompensaEditando.id ? { ...r, ...recompensaData, id: recompensaEditando.id } : r
        ));

        // Registrar na auditoria
        await auditoriaService.registrarAtualizacao(
          'recompensas',
          recompensaEditando.id,
          recompensaAntiga,
          recompensaData,
          `Atualização da recompensa: ${recompensaData.nome}`
        );

        mostrarSnackbar('Recompensa atualizada com sucesso!');
      } else {
        recompensaData.createdAt = new Date().toISOString();
        const novoId = await firebaseService.add('recompensas', recompensaData);
        setRecompensas([...recompensas, { ...recompensaData, id: novoId }]);

        // Registrar na auditoria
        await auditoriaService.registrarCriacao(
          'recompensas',
          novoId,
          recompensaData,
          `Criação da recompensa: ${recompensaData.nome}`
        );

        mostrarSnackbar('Recompensa criada com sucesso!');
      }

      handleCloseRecompensaDialog();
    } catch (error) {
      console.error('Erro ao salvar recompensa:', error);
      mostrarSnackbar('Erro ao salvar recompensa', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: recompensaEditando ? 'atualizar_recompensa' : 'criar_recompensa',
        dados: recompensaForm
      });
    }
  };

  const handleDeleteRecompensa = async () => {
    try {
      await firebaseService.delete('recompensas', confirmDelete.id);
      setRecompensas(recompensas.filter(r => r.id !== confirmDelete.id));

      // Registrar na auditoria
      await auditoriaService.registrar('excluir_recompensa', {
        entidade: 'recompensas',
        entidadeId: confirmDelete.id,
        detalhes: `Exclusão da recompensa: ${confirmDelete.nome}`,
        dados: { recompensa: confirmDelete }
      });

      mostrarSnackbar('Recompensa excluída com sucesso!');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erro ao excluir recompensa:', error);
      mostrarSnackbar('Erro ao excluir recompensa', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'excluir_recompensa',
        recompensaId: confirmDelete?.id
      });
    }
  };

  const handlePrintPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFillColor(156, 39, 176);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE FIDELIDADE', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 30, { align: 'center' });

      // Estatísticas
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      let yPos = 50;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, 170, 60, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total de Clientes:', 25, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.totalClientes), 70, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total de Pontos:', 100, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.totalPontos), 130, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total de Resgates:', 25, yPos + 25);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.totalResgates), 70, yPos + 25);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total de Recompensas:', 100, yPos + 25);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.totalRecompensas), 145, yPos + 25);
      
      // Distribuição por nível
      doc.setFont('helvetica', 'bold');
      doc.text('Distribuição por Nível:', 25, yPos + 40);
      
      let xPos = 25;
      Object.entries(stats.niveis).forEach(([nivel, count]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(nivel.toUpperCase() + ':', xPos, yPos + 50);
        doc.setFont('helvetica', 'normal');
        doc.text(String(count), xPos + 30, yPos + 50);
        xPos += 60;
      });
      
      yPos += 70;

      // Tabela de clientes
      const tableColumn = ['Cliente', 'Nível', 'Pontos', 'Resgates'];
      const tableRows = [];
      
      clientes.slice(0, 30).forEach(cliente => {
        const saldo = calcularSaldoCliente(cliente.id);
        const nivel = getNivelCliente(saldo);
        const resgatesCliente = resgates.filter(r => r.clienteId === cliente.id).length;
        
        const row = [
          cliente.nome,
          nivel.toUpperCase(),
          String(saldo),
          String(resgatesCliente),
        ];
        tableRows.push(row);
      });
      
      doc.autoTable({
        startY: yPos,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [156, 39, 176],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
      });
      
      // Registrar na auditoria
      await auditoriaService.registrar('exportar_relatorio_fidelidade', {
        entidade: 'fidelidade',
        detalhes: 'Exportação de relatório de fidelidade',
        dados: {
          formato: 'PDF',
          stats
        }
      });
      
      window.open(doc.output('bloburl'), '_blank');
      setOpenPrintDialog(false);
      mostrarSnackbar('PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarSnackbar('Erro ao gerar PDF', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_relatorio_fidelidade_pdf'
      });
    }
  };

  const handleExportarCSV = async () => {
    try {
      const dadosExport = clientes.map(cliente => {
        const saldo = calcularSaldoCliente(cliente.id);
        const nivel = getNivelCliente(saldo);
        const resgatesCliente = resgates.filter(r => r.clienteId === cliente.id).length;
        
        return {
          'Cliente': cliente.nome,
          'Email': cliente.email || '',
          'Telefone': cliente.telefone || '',
          'Nível': nivel.toUpperCase(),
          'Pontos': saldo,
          'Resgates': resgatesCliente,
        };
      });

      const headers = ['Cliente', 'Email', 'Telefone', 'Nível', 'Pontos', 'Resgates'];
      const csvContent = [
        headers.join(','),
        ...dadosExport.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `fidelidade_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      await auditoriaService.registrar('exportar_relatorio_fidelidade', {
        entidade: 'fidelidade',
        detalhes: 'Exportação de relatório de fidelidade',
        dados: {
          formato: 'CSV',
          totalClientes: clientes.length
        }
      });

      setOpenPrintDialog(false);
      mostrarSnackbar('CSV exportado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      mostrarSnackbar('Erro ao exportar CSV', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_relatorio_fidelidade_csv'
      });
    }
  };

  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesTexto = filtro === '' || 
        cliente.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(filtro.toLowerCase()) ||
        cliente.telefone?.includes(filtro);

      if (filtroNivel !== 'todos') {
        const saldo = calcularSaldoCliente(cliente.id);
        const nivel = getNivelCliente(saldo);
        return matchesTexto && nivel === filtroNivel;
      }

      return matchesTexto;
    });
  }, [clientes, filtro, filtroNivel, calcularSaldoCliente, getNivelCliente]);

  // Filtrar recompensas
  const recompensasFiltradas = useMemo(() => {
    return recompensas.filter(r => {
      const matchesTexto = filtro === '' || 
        r.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        r.descricao?.toLowerCase().includes(filtro.toLowerCase());
      return matchesTexto;
    });
  }, [recompensas, filtro]);

  // Estatísticas
  const stats = useMemo(() => {
    return {
      totalClientes: clientes.length,
      totalPontos: pontuacoes.reduce((acc, p) => acc + (p.tipo === 'credito' ? p.quantidade : -p.quantidade), 0),
      totalResgates: resgates.length,
      totalRecompensas: recompensas.length,
      niveis: {
        bronze: clientes.filter(c => getNivelCliente(calcularSaldoCliente(c.id)) === 'bronze').length,
        prata: clientes.filter(c => getNivelCliente(calcularSaldoCliente(c.id)) === 'prata').length,
        ouro: clientes.filter(c => getNivelCliente(calcularSaldoCliente(c.id)) === 'ouro').length,
        platina: clientes.filter(c => getNivelCliente(calcularSaldoCliente(c.id)) === 'platina').length,
      }
    };
  }, [clientes, pontuacoes, resgates, recompensas, calcularSaldoCliente, getNivelCliente]);

  // Paginação
  const paginatedClientes = clientesFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const paginatedRecompensas = recompensasFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={6} sm={2.4} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 120 : 60} sx={{ borderRadius: 2, mb: 2 }} />
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
            Gerenciar Fidelidade
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {stats.totalClientes} clientes | {stats.totalRecompensas} recompensas
          </Typography>
        </Box>
        
        <Zoom in={true}>
          <Fab
            size="small"
            onClick={() => setOpenPrintDialog(true)}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
            }}
          >
            <PrintIcon />
          </Fab>
        </Zoom>
      </Box>

      {/* Cards de Estatísticas Mobile */}
      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Clientes
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {stats.totalClientes}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Total Pontos
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {stats.totalPontos}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Resgates
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.totalResgates}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Recompensas
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {stats.totalRecompensas}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Clientes Platina
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#e5e4e2' }}>
                  {stats.niveis.platina}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Cards de Níveis Mobile */}
      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        {Object.entries(niveis).map(([key, nivel]) => (
          <Grid item xs={6} sm={6} md={3} key={key}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card sx={{ bgcolor: nivel.corFundo || '#f5f5f5' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: nivel.cor, fontWeight: 600 }}>
                        {nivel.nome}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: nivel.cor }}>
                        {stats.niveis[key]}
                      </Typography>
                    </Box>
                    <TrophyIcon sx={{ fontSize: 32, color: nivel.cor, opacity: 0.5 }} />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Mínimo: {nivel.minimo} pontos
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Barra de Pesquisa e Filtros */}
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
          placeholder={tabValue === 0 ? "Buscar cliente..." : tabValue === 1 ? "Buscar recompensa..." : "Buscar resgate..."}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', ml: 1 }} />
              </InputAdornment>
            ),
            endAdornment: filtro && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setFiltro('')}>
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
            color: filtroNivel !== 'todos' ? '#9c27b0' : 'text.secondary'
          }}
        >
          <Badge 
            variant="dot" 
            color="primary"
            invisible={filtroNivel === 'todos'}
          >
            <FilterIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={carregarDados} sx={{ color: 'text.secondary' }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Botão Nova Recompensa Mobile */}
      {tabValue === 1 && (
        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenRecompensaDialog()}
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
          >
            Nova Recompensa
          </Button>
        </Box>
      )}

      {/* Tabs Mobile */}
      <Paper sx={{ mb: 2, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
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
            label="Resgates" 
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
            {paginatedClientes.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Nenhum cliente encontrado
                </Typography>
              </Paper>
            ) : (
              paginatedClientes.map((cliente) => {
                const saldo = calcularSaldoCliente(cliente.id);
                const nivel = getNivelCliente(saldo);
                const resgatesCliente = resgates.filter(r => r.clienteId === cliente.id).length;

                return (
                  <ClienteMobileCard
                    key={cliente.id}
                    cliente={cliente}
                    saldo={saldo}
                    nivel={nivel}
                    resgatesCount={resgatesCliente}
                    onGerenciarPontos={handleOpenPontosDialog}
                    onVerHistorico={(clienteId) => navigate(`/fidelidade/historico/${clienteId}`)}
                  />
                );
              })
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
            {paginatedRecompensas.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <GiftIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Nenhuma recompensa encontrada
                </Typography>
              </Paper>
            ) : (
              paginatedRecompensas.map((recompensa) => (
                <RecompensaMobileCard
                  key={recompensa.id}
                  recompensa={recompensa}
                  onEditar={handleOpenRecompensaDialog}
                  onExcluir={setConfirmDelete}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Tab Resgates */}
        {tabValue === 2 && (
          <motion.div
            key="resgates"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card>
              <List>
                {resgates
                  .sort((a, b) => new Date(b.data) - new Date(a.data))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((resgate, index) => {
                    const cliente = clientes.find(c => c.id === resgate.clienteId);
                    return (
                      <ResgateItem
                        key={index}
                        resgate={resgate}
                        cliente={cliente}
                      />
                    );
                  })}
                
                {resgates.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="Nenhum resgate encontrado"
                      secondary="Os resgates aparecerão aqui"
                      sx={{ textAlign: 'center' }}
                    />
                  </ListItem>
                )}
              </List>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paginação */}
      {((tabValue === 0 && clientesFiltrados.length > rowsPerPage) ||
        (tabValue === 1 && recompensasFiltradas.length > rowsPerPage) ||
        (tabValue === 2 && resgates.length > rowsPerPage)) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(
                (tabValue === 0 ? clientesFiltrados.length :
                 tabValue === 1 ? recompensasFiltradas.length :
                 resgates.length) / rowsPerPage
              )}
              page={page + 1}
              onChange={(e, v) => setPage(v - 1)}
              color="primary"
              size={isMobile ? "small" : "large"}
            />
          </Stack>
        </Box>
      )}

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
              Filtrar por Nível
            </Typography>
            <IconButton onClick={() => setOpenFilterDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant={filtroNivel === 'todos' ? 'contained' : 'outlined'}
              onClick={() => {
                setFiltroNivel('todos');
                setOpenFilterDrawer(false);
              }}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todos os níveis
            </Button>
            
            {Object.entries(niveis).map(([key, nivel]) => (
              <Button
                key={key}
                fullWidth
                variant={filtroNivel === key ? 'contained' : 'outlined'}
                onClick={() => {
                  setFiltroNivel(key);
                  setOpenFilterDrawer(false);
                }}
                sx={{ 
                  justifyContent: 'flex-start',
                  bgcolor: filtroNivel === key ? nivel.cor : 'transparent',
                  color: filtroNivel === key ? (key === 'ouro' ? '#000' : '#fff') : nivel.cor,
                  borderColor: nivel.cor,
                  '&:hover': {
                    bgcolor: filtroNivel === key ? nivel.cor : `${nivel.cor}20`,
                  }
                }}
              >
                {nivel.nome}
              </Button>
            ))}
          </Box>
        </Box>
      </SwipeableDrawer>

      {/* Dialog de Pontos */}
      <Dialog 
        open={openPontosDialog} 
        onClose={handleClosePontosDialog}
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
            <IconButton edge="start" color="inherit" onClick={handleClosePontosDialog}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            Gerenciar Pontos - {clienteSelecionado?.nome}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Saldo Atual: <strong>{clienteSelecionado ? calcularSaldoCliente(clienteSelecionado.id) : 0} pontos</strong>
            </Alert>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de Movimentação</InputLabel>
                  <Select
                    name="tipo"
                    value={pontosForm.tipo}
                    label="Tipo de Movimentação"
                    onChange={handlePontosInputChange}
                  >
                    <MenuItem value="credito">Adicionar Pontos (Crédito)</MenuItem>
                    <MenuItem value="debito">Remover Pontos (Débito)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantidade de Pontos"
                  name="quantidade"
                  type="number"
                  value={pontosForm.quantidade}
                  onChange={handlePontosInputChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StarIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Motivo"
                  name="motivo"
                  value={pontosForm.motivo}
                  onChange={handlePontosInputChange}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Ex: Compra de serviço, Indicação, Aniversário..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={handleClosePontosDialog} fullWidth={isMobile}>Cancelar</Button>
          <Button
            onClick={handleSalvarPontos}
            variant="contained"
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
            fullWidth={isMobile}
          >
            Salvar Movimentação
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Recompensa */}
      <Dialog 
        open={openRecompensaDialog} 
        onClose={handleCloseRecompensaDialog}
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
            <IconButton edge="start" color="inherit" onClick={handleCloseRecompensaDialog}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            {recompensaEditando ? 'Editar Recompensa' : 'Nova Recompensa'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Recompensa"
                name="nome"
                value={recompensaForm.nome}
                onChange={handleRecompensaInputChange}
                required
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="descricao"
                value={recompensaForm.descricao}
                onChange={handleRecompensaInputChange}
                multiline
                rows={2}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pontos Necessários"
                name="pontosNecessarios"
                type="number"
                value={recompensaForm.pontosNecessarios}
                onChange={handleRecompensaInputChange}
                required
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="tipo"
                  value={recompensaForm.tipo}
                  label="Tipo"
                  onChange={handleRecompensaInputChange}
                >
                  <MenuItem value="desconto">Desconto</MenuItem>
                  <MenuItem value="produto">Produto</MenuItem>
                  <MenuItem value="servico">Serviço</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={recompensaForm.tipo === 'desconto' ? 'Percentual (%)' : 'Valor (R$)'}
                name="valor"
                type="number"
                value={recompensaForm.valor}
                onChange={handleRecompensaInputChange}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Nível Mínimo</InputLabel>
                <Select
                  name="nivelMinimo"
                  value={recompensaForm.nivelMinimo}
                  label="Nível Mínimo"
                  onChange={handleRecompensaInputChange}
                >
                  <MenuItem value="bronze">Bronze</MenuItem>
                  <MenuItem value="prata">Prata</MenuItem>
                  <MenuItem value="ouro">Ouro</MenuItem>
                  <MenuItem value="platina">Platina</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantidade Disponível"
                name="quantidadeDisponivel"
                type="number"
                value={recompensaForm.quantidadeDisponivel}
                onChange={handleRecompensaInputChange}
                variant="outlined"
                size="small"
                helperText="Deixe em branco para quantidade ilimitada"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={recompensaForm.ativo}
                    onChange={(e) => setRecompensaForm(prev => ({ ...prev, ativo: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Recompensa Ativa"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL da Imagem"
                name="imagem"
                value={recompensaForm.imagem}
                onChange={handleRecompensaInputChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={handleCloseRecompensaDialog} fullWidth={isMobile}>Cancelar</Button>
          <Button
            onClick={handleSalvarRecompensa}
            variant="contained"
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
            fullWidth={isMobile}
          >
            {recompensaEditando ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog 
        open={!!confirmDelete} 
        onClose={() => setConfirmDelete(null)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <WarningIcon sx={{ fontSize: 48, color: '#f44336', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Tem certeza que deseja excluir a recompensa <strong>{confirmDelete?.nome}</strong>?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Esta ação não poderá ser desfeita.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={() => setConfirmDelete(null)} fullWidth={isMobile}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteRecompensa}
            fullWidth={isMobile}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Impressão */}
      <Dialog 
        open={openPrintDialog} 
        onClose={() => setOpenPrintDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PrintIcon />
            <Typography variant="h6">Exportar Relatório</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Escolha o formato para exportar:
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePrintPDF}
                  sx={{ 
                    p: 3,
                    bgcolor: '#f44336',
                    '&:hover': { bgcolor: '#d32f2f' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <PictureAsPdfIcon sx={{ fontSize: 40 }} />
                  <Typography variant="body1">PDF</Typography>
                  <Typography variant="caption">Relatório profissional</Typography>
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleExportarCSV}
                  sx={{ 
                    p: 3,
                    bgcolor: '#2196f3',
                    '&:hover': { bgcolor: '#1976d2' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <DownloadIcon sx={{ fontSize: 40 }} />
                  <Typography variant="body1">CSV</Typography>
                  <Typography variant="caption">Planilha/editável</Typography>
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  Total de clientes: {stats.totalClientes}
                </Typography>
                <Typography variant="body2">
                  Total de pontos: {stats.totalPontos}
                </Typography>
                <Typography variant="body2">
                  Total de resgates: {stats.totalResgates}
                </Typography>
                <Typography variant="body2">
                  Total de recompensas: {stats.totalRecompensas}
                </Typography>
              </Alert>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)}>Cancelar</Button>
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
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  break;
                case 1:
                  setOpenFilterDrawer(true);
                  break;
                case 2:
                  setOpenPrintDialog(true);
                  break;
                case 3:
                  handleOpenRecompensaDialog();
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
            <BottomNavigationAction label="Início" icon={<TrophyIcon />} />
            <BottomNavigationAction 
              label="Filtros" 
              icon={
                <Badge 
                  variant="dot" 
                  color="primary"
                  invisible={filtroNivel === 'todos'}
                >
                  <FilterIcon />
                </Badge>
              } 
            />
            <BottomNavigationAction label="Exportar" icon={<PrintIcon />} />
            <BottomNavigationAction label="Nova" icon={<AddIcon />} />
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

export default GerenciarFidelidade;
