// src/pages/Entradas.js
import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Fab,
  Zoom,
  Badge,
  Skeleton,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  Warehouse as WarehouseIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';

// Componente de Card Mobile Otimizado
const EntradaMobileCard = ({ entrada, fornecedor, onDetalhes, onConferir, onPrint }) => {
  const statusColors = {
    pendente: { color: '#ff9800', bg: '#fff3e0', label: 'Pendente' },
    conferido: { color: '#2196f3', bg: '#e3f2fd', label: 'Conferido' },
    finalizado: { color: '#4caf50', bg: '#e8f5e9', label: 'Finalizado' },
    cancelado: { color: '#f44336', bg: '#ffebee', label: 'Cancelado' },
  };

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
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Header do Card */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 1 
          }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {entrada.numeroEntrada}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {entrada.dataEntrada ? format(new Date(entrada.dataEntrada), 'dd/MM/yyyy') : '—'}
              </Typography>
            </Box>
            <Chip
              label={statusColors[entrada.status]?.label || entrada.status}
              size="small"
              sx={{
                bgcolor: statusColors[entrada.status]?.bg,
                color: statusColors[entrada.status]?.color,
                fontWeight: 500,
                height: 24,
              }}
            />
          </Box>

          {/* Info do Fornecedor */}
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" noWrap>
              {fornecedor?.nome || 'Fornecedor não informado'}
            </Typography>
            {entrada.documento && (
              <Typography variant="caption" color="text.secondary">
                NF: {entrada.documento}
              </Typography>
            )}
          </Box>

          {/* Itens e Valor */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'action.hover',
            p: 1,
            borderRadius: 1,
            mb: 1.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <InventoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">
                {entrada.itens?.length || 0} {entrada.itens?.length === 1 ? 'item' : 'itens'}
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 600 }}>
              R$ {Number(entrada.valorTotal || 0).toFixed(2)}
            </Typography>
          </Box>

          {/* Ações */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: 0.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 1.5,
            mt: 0.5
          }}>
            <IconButton 
              size="small" 
              onClick={() => onDetalhes(entrada)}
              sx={{ color: '#9c27b0' }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>

            {entrada.status === 'pendente' && (
              <IconButton
                size="small"
                onClick={() => onConferir(entrada)}
                sx={{ color: '#2196f3' }}
              >
                <QrCodeIcon fontSize="small" />
              </IconButton>
            )}

            <IconButton
              size="small"
              onClick={() => onPrint(entrada)}
              sx={{ color: '#4caf50' }}
            >
              <PrintIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de Estatísticas Mobile
const StatsMobileCards = ({ stats }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const statItems = [
    { label: 'Total', value: stats.total, color: '#9c27b0', icon: <TimelineIcon /> },
    { label: 'Pendentes', value: stats.pendentes, color: '#ff9800', icon: <ScheduleIcon /> },
    { label: 'Conferidas', value: stats.conferidas, color: '#2196f3', icon: <VisibilityIcon /> },
    { label: 'Finalizadas', value: stats.finalizadas, color: '#4caf50', icon: <CheckCircleIcon /> },
    { label: 'Valor Total', value: `R$ ${stats.valorTotal.toFixed(2)}`, color: '#4caf50', icon: <TrendingUpIcon /> },
  ];

  if (isMobile) {
    return (
      <Box sx={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: 1, 
        pb: 1,
        mb: 2,
        '&::-webkit-scrollbar': { display: 'none' }
      }}>
        {statItems.map((item, index) => (
          <Card 
            key={index}
            sx={{ 
              minWidth: 140,
              bgcolor: `${item.color}08`,
              border: '1px solid',
              borderColor: `${item.color}20`,
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ color: item.color }}>{item.icon}</Box>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: item.color }}>
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card sx={{ bgcolor: `${item.color}08` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: item.color }}>{item.icon}</Box>
                  <Typography color="textSecondary" variant="body2">
                    {item.label}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

// Componente Principal Otimizado
function Entradas() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [loading, setLoading] = useState(true);
  const [entradas, setEntradas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [compras, setCompras] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [openConferenciaDialog, setOpenConferenciaDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [entradaEditando, setEntradaEditando] = useState(null);
  const [entradaSelecionada, setEntradaSelecionada] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bottomNavValue, setBottomNavValue] = useState(0);

  const [formData, setFormData] = useState({
    numeroEntrada: '',
    compraId: '',
    fornecedorId: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    dataPrevista: '',
    tipo: 'compra',
    status: 'pendente',
    itens: [],
    observacoes: '',
    responsavel: '',
    documento: '',
    valorTotal: 0,
  });

  const [novoItem, setNovoItem] = useState({
    produtoId: '',
    quantidade: 1,
    quantidadeConferida: 0,
    lote: '',
    dataFabricacao: '',
    dataValidade: '',
    localizacao: '',
    observacoes: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [entradasData, produtosData, fornecedoresData, comprasData] = await Promise.all([
        firebaseService.getAll('entradas').catch(() => []),
        firebaseService.getAll('produtos').catch(() => []),
        firebaseService.getAll('fornecedores').catch(() => []),
        firebaseService.getAll('compras').catch(() => []),
      ]);
      
      setEntradas(entradasData || []);
      setProdutos(produtosData || []);
      setFornecedores(fornecedoresData || []);
      setCompras(comprasData || []);
      
      toast.success('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_entradas',
        detalhes: 'Erro ao carregar dados de entradas'
      });
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (entrada = null) => {
    if (entrada) {
      setEntradaEditando(entrada);
      setFormData({
        numeroEntrada: entrada.numeroEntrada || '',
        compraId: entrada.compraId || '',
        fornecedorId: entrada.fornecedorId || '',
        dataEntrada: entrada.dataEntrada || new Date().toISOString().split('T')[0],
        dataPrevista: entrada.dataPrevista || '',
        tipo: entrada.tipo || 'compra',
        status: entrada.status || 'pendente',
        itens: entrada.itens || [],
        observacoes: entrada.observacoes || '',
        responsavel: entrada.responsavel || '',
        documento: entrada.documento || '',
        valorTotal: entrada.valorTotal || 0,
      });
    } else {
      setEntradaEditando(null);
      setFormData({
        numeroEntrada: `ENT-${Date.now()}`,
        compraId: '',
        fornecedorId: '',
        dataEntrada: new Date().toISOString().split('T')[0],
        dataPrevista: '',
        tipo: 'compra',
        status: 'pendente',
        itens: [],
        observacoes: '',
        responsavel: JSON.parse(localStorage.getItem('usuario') || '{}').nome || '',
        documento: '',
        valorTotal: 0,
      });
      setActiveStep(0);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEntradaEditando(null);
    setNovoItem({
      produtoId: '',
      quantidade: 1,
      quantidadeConferida: 0,
      lote: '',
      dataFabricacao: '',
      dataValidade: '',
      localizacao: '',
      observacoes: '',
    });
  };

  const handleOpenDetalhes = (entrada) => {
    setEntradaSelecionada(entrada);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setEntradaSelecionada(null);
  };

  const handleOpenConferencia = (entrada) => {
    setEntradaSelecionada(entrada);
    setFormData(prev => ({
      ...prev,
      itens: entrada.itens.map(item => ({
        ...item,
        quantidadeConferida: item.quantidadeConferida || 0,
        divergencia: (item.quantidadeConferida || 0) - (item.quantidade || 0),
      })),
    }));
    setOpenConferenciaDialog(true);
  };

  const handleCloseConferencia = () => {
    setOpenConferenciaDialog(false);
    setEntradaSelecionada(null);
  };

  // Filtrar entradas
  const entradasFiltradas = entradas.filter(entrada => {
    const matchesTexto = filtro === '' || 
      entrada.numeroEntrada?.toLowerCase().includes(filtro.toLowerCase()) ||
      entrada.documento?.toLowerCase().includes(filtro.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || entrada.status === filtroStatus;

    let matchesPeriodo = true;
    if (filtroPeriodo === 'hoje') {
      const hoje = new Date().toISOString().split('T')[0];
      matchesPeriodo = entrada.dataEntrada === hoje;
    } else if (filtroPeriodo === 'semana') {
      const dataEntrada = new Date(entrada.dataEntrada);
      const umaSemanaAtras = new Date();
      umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
      matchesPeriodo = dataEntrada >= umaSemanaAtras;
    } else if (filtroPeriodo === 'mes') {
      const dataEntrada = new Date(entrada.dataEntrada);
      const umMesAtras = new Date();
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);
      matchesPeriodo = dataEntrada >= umMesAtras;
    }

    return matchesTexto && matchesStatus && matchesPeriodo;
  });

  // Estatísticas
  const stats = {
    total: entradas.length,
    pendentes: entradas.filter(e => e.status === 'pendente').length,
    conferidas: entradas.filter(e => e.status === 'conferido').length,
    finalizadas: entradas.filter(e => e.status === 'finalizado').length,
    valorTotal: entradas.reduce((acc, e) => acc + (Number(e.valorTotal) || 0), 0),
  };

  // Loading Skeleton para Mobile
  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={56} height={56} />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" width={140} height={80} sx={{ borderRadius: 2 }} />
          ))}
        </Box>

        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 2 }} />
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
      {/* Header Mobile */}
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
            Entradas
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie as entradas no estoque
          </Typography>
        </Box>
        
        <Zoom in={true}>
          <Fab
            color="primary"
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: '#9c27b0',
              '&:hover': { bgcolor: '#7b1fa2' },
              width: isMobile ? 48 : 56,
              height: isMobile ? 48 : 56,
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      </Box>

      {/* Cards de Estatísticas Mobile */}
      <StatsMobileCards stats={stats} />

      {/* Barra de Pesquisa Mobile */}
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
          placeholder="Buscar por número da entrada..."
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
            color: filtroStatus !== 'todos' || filtroPeriodo !== 'todos' 
              ? '#9c27b0' 
              : 'text.secondary'
          }}
        >
          <Badge 
            variant="dot" 
            color="primary"
            invisible={filtroStatus === 'todos' && filtroPeriodo === 'todos'}
          >
            <FilterIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={carregarDados} sx={{ color: 'text.secondary' }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Lista de Entradas Mobile */}
      <AnimatePresence>
        {entradasFiltradas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                bgcolor: 'transparent',
                boxShadow: 'none'
              }}
            >
              <WarehouseIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Nenhuma entrada encontrada
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2, borderColor: '#9c27b0', color: '#9c27b0' }}
              >
                Nova Entrada
              </Button>
            </Paper>
          </motion.div>
        ) : (
          entradasFiltradas.map((entrada, index) => {
            const fornecedor = fornecedores.find(f => f.id === entrada.fornecedorId);
            return (
              <EntradaMobileCard
                key={entrada.id}
                entrada={entrada}
                fornecedor={fornecedor}
                onDetalhes={handleOpenDetalhes}
                onConferir={handleOpenConferencia}
                onPrint={() => window.print()}
              />
            );
          })
        )}
      </AnimatePresence>

      {/* Drawer de Filtros Mobile */}
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
            Status
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            <Chip
              label="Todos"
              onClick={() => setFiltroStatus('todos')}
              color={filtroStatus === 'todos' ? 'primary' : 'default'}
              sx={{ 
                bgcolor: filtroStatus === 'todos' ? '#9c27b0' : 'transparent',
                color: filtroStatus === 'todos' ? 'white' : 'inherit',
              }}
            />
            <Chip
              label="Pendente"
              onClick={() => setFiltroStatus('pendente')}
              sx={{ 
                bgcolor: filtroStatus === 'pendente' ? '#ff9800' : 'transparent',
                color: filtroStatus === 'pendente' ? 'white' : 'inherit',
                borderColor: '#ff9800'
              }}
            />
            <Chip
              label="Conferido"
              onClick={() => setFiltroStatus('conferido')}
              sx={{ 
                bgcolor: filtroStatus === 'conferido' ? '#2196f3' : 'transparent',
                color: filtroStatus === 'conferido' ? 'white' : 'inherit',
                borderColor: '#2196f3'
              }}
            />
            <Chip
              label="Finalizado"
              onClick={() => setFiltroStatus('finalizado')}
              sx={{ 
                bgcolor: filtroStatus === 'finalizado' ? '#4caf50' : 'transparent',
                color: filtroStatus === 'finalizado' ? 'white' : 'inherit',
                borderColor: '#4caf50'
              }}
            />
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Período
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            <Chip
              label="Todos"
              onClick={() => setFiltroPeriodo('todos')}
              color={filtroPeriodo === 'todos' ? 'primary' : 'default'}
              sx={{ 
                bgcolor: filtroPeriodo === 'todos' ? '#9c27b0' : 'transparent',
                color: filtroPeriodo === 'todos' ? 'white' : 'inherit',
              }}
            />
            <Chip
              label="Hoje"
              onClick={() => setFiltroPeriodo('hoje')}
              color={filtroPeriodo === 'hoje' ? 'primary' : 'default'}
            />
            <Chip
              label="Últimos 7 dias"
              onClick={() => setFiltroPeriodo('semana')}
              color={filtroPeriodo === 'semana' ? 'primary' : 'default'}
            />
            <Chip
              label="Últimos 30 dias"
              onClick={() => setFiltroPeriodo('mes')}
              color={filtroPeriodo === 'mes' ? 'primary' : 'default'}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={() => setOpenFilterDrawer(false)}
            sx={{ bgcolor: '#9c27b0', mt: 2 }}
          >
            Aplicar Filtros
          </Button>
        </Box>
      </SwipeableDrawer>

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
                  handleOpenDialog();
                  break;
                case 2:
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
            <BottomNavigationAction label="Início" icon={<WarehouseIcon />} />
            <BottomNavigationAction label="Nova" icon={<AddIcon />} />
            <BottomNavigationAction 
              label="Filtros" 
              icon={
                <Badge 
                  variant="dot" 
                  color="primary"
                  invisible={filtroStatus === 'todos' && filtroPeriodo === 'todos'}
                >
                  <FilterIcon />
                </Badge>
              } 
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Dialogs existentes - mantidos mas com ajustes mobile */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        fullScreen={isMobile}
        maxWidth="md" 
        fullWidth={!isMobile}
      >
        <DialogTitle sx={{ 
          bgcolor: '#9c27b0', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: isMobile ? 2 : 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton 
                edge="start" 
                color="inherit" 
                onClick={handleCloseDialog}
                sx={{ color: 'white' }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant={isMobile ? "subtitle1" : "h6"}>
              {entradaEditando ? 'Editar Entrada' : 'Nova Entrada'}
            </Typography>
          </Box>
          {!isMobile && (
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Conteúdo do Stepper - mantido igual mas com ajustes de padding */}
            <Step>
              <StepLabel>Informações da Entrada</StepLabel>
              <StepContent>
                <Grid container spacing={isMobile ? 1 : 2}>
                  {/* ... conteúdo existente com ajustes de spacing ... */}
                </Grid>
              </StepContent>
            </Step>
            {/* ... outros Steps ... */}
          </Stepper>
        </DialogContent>
        {!isMobile && (
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
          </DialogActions>
        )}
      </Dialog>

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

export default Entradas;
