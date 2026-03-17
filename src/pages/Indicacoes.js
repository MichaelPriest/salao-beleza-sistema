// src/pages/Indicacoes.js
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
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Switch,
  FormControlLabel,
  Autocomplete,
  Badge,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  Slider,
  Tab,
  Tabs,
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemAvatar,
  ListItemText as MuiListItemText,
  Collapse,
  Breadcrumbs,
  Link,
  CardActions,
  CardHeader,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Zoom,
  Fade,
  Grow,
  Slide,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import {
  format,
  subDays,
  subMonths,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachMonthOfInterval,
  differenceInDays,
  isSameDay,
  isWithinInterval,
  parseISO,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';
import QRCode from 'qrcode.react';

const statusIndicacao = [
  { value: 'pendente', label: 'Pendente', color: '#ff9800', icon: <ScheduleIcon /> },
  { value: 'confirmada', label: 'Confirmada', color: '#4caf50', icon: <CheckIcon /> },
  { value: 'cancelada', label: 'Cancelada', color: '#f44336', icon: <CancelIcon /> },
  { value: 'expirada', label: 'Expirada', color: '#9e9e9e', icon: <InfoIcon /> },
];

const periodos = [
  { value: 'todos', label: 'Todos' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'ontem', label: 'Ontem' },
  { value: 'ultimos7', label: 'Últimos 7 dias' },
  { value: 'ultimos30', label: 'Últimos 30 dias' },
  { value: 'esteMes', label: 'Este mês' },
  { value: 'personalizado', label: 'Personalizado' },
];

function Indicacoes() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [indicacoes, setIndicacoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [config, setConfig] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    confirmadas: 0,
    canceladas: 0,
    expiradas: 0,
    totalPontos: 0,
  });
  
  // Estados para filtros
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Estados para dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);
  const [indicacaoSelecionada, setIndicacaoSelecionada] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Mobile states
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    clienteId: '',
    clienteNome: '',
    clienteEmail: '',
    clienteTelefone: '',
    observacoes: '',
  });

  useEffect(() => {
    carregarUsuario();
    carregarDados();
    carregarConfiguracoes();
  }, []);

  useEffect(() => {
    calcularEstatisticas();
  }, [indicacoes]);

  const carregarUsuario = () => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const user = JSON.parse(usuarioStr);
        setUsuario(user);
        setIsAdmin(user.cargo === 'admin' || user.cargo === 'gerente');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const carregarConfiguracoes = async () => {
    try {
      const configs = await firebaseService.getAll('config_fidelidade').catch(() => []);
      if (configs && configs.length > 0) {
        setConfig(configs[0]);
      } else {
        // Configurações padrão
        setConfig({
          pontosIndicacao: 100,
          diasValidadeIndicacao: 30,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [indicacoesData, clientesData] = await Promise.all([
        firebaseService.getAll('indicacoes').catch(() => []),
        firebaseService.getAll('clientes').catch(() => [])
      ]);

      // Filtrar por permissão do usuário
      let indicacoesFiltradas = indicacoesData || [];
      
      if (!isAdmin && usuario?.clienteId) {
        // Cliente só vê suas próprias indicações
        indicacoesFiltradas = indicacoesFiltradas.filter(i => 
          i.clienteId === usuario.clienteId
        );
      }

      setIndicacoes(indicacoesFiltradas);
      setClientes(clientesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar indicações');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = () => {
    const stats = {
      total: indicacoes.length,
      pendentes: indicacoes.filter(i => i.status === 'pendente').length,
      confirmadas: indicacoes.filter(i => i.status === 'confirmada').length,
      canceladas: indicacoes.filter(i => i.status === 'cancelada').length,
      expiradas: indicacoes.filter(i => i.status === 'expirada').length,
      totalPontos: indicacoes
        .filter(i => i.status === 'confirmada')
        .reduce((acc, i) => acc + (i.pontosGanhos || 0), 0),
    };
    setStats(stats);
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = () => {
    setFormData({
      clienteId: '',
      clienteNome: '',
      clienteEmail: '',
      clienteTelefone: '',
      observacoes: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClienteChange = (event, newValue) => {
    if (newValue) {
      setFormData({
        ...formData,
        clienteId: newValue.id,
        clienteNome: newValue.nome,
        clienteEmail: newValue.email || '',
        clienteTelefone: newValue.telefone || '',
      });
    } else {
      setFormData({
        ...formData,
        clienteId: '',
        clienteNome: '',
        clienteEmail: '',
        clienteTelefone: '',
      });
    }
  };

  const handleSalvarIndicacao = async () => {
    try {
      if (!formData.clienteNome) {
        mostrarSnackbar('Nome do cliente indicado é obrigatório', 'error');
        return;
      }

      // Verificar se o cliente indicador está logado
      if (!usuario?.clienteId && !isAdmin) {
        mostrarSnackbar('Você precisa estar logado como cliente para fazer indicações', 'error');
        return;
      }

      // Calcular data de expiração
      const dataAtual = new Date();
      const diasValidade = config?.diasValidadeIndicacao || 30;
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataAtual.getDate() + diasValidade);

      const indicacaoData = {
        clienteId: isAdmin ? (formData.clienteId || usuario?.clienteId) : usuario?.clienteId,
        clienteNome: isAdmin && formData.clienteId 
          ? clientes.find(c => c.id === formData.clienteId)?.nome || 'Cliente'
          : usuario?.nome || 'Cliente',
        clienteIndicadoId: null, // Será preenchido quando o cliente se cadastrar
        clienteIndicadoNome: formData.clienteNome,
        clienteIndicadoEmail: formData.clienteEmail,
        clienteIndicadoTelefone: formData.clienteTelefone,
        status: 'pendente',
        pontosGanhos: config?.pontosIndicacao || 100,
        dataCriacao: dataAtual.toISOString(),
        dataExpiracao: dataExpiracao.toISOString(),
        observacoes: formData.observacoes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await firebaseService.add('indicacoes', indicacaoData);

      mostrarSnackbar('Indicação registrada com sucesso!');
      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar indicação:', error);
      mostrarSnackbar('Erro ao salvar indicação', 'error');
    }
  };

  const handleVerDetalhes = (indicacao) => {
    setIndicacaoSelecionada(indicacao);
    setOpenDetalhesDialog(true);
  };

  const handleAbrirQRCode = (indicacao) => {
    setIndicacaoSelecionada(indicacao);
    setOpenQrCodeDialog(true);
  };

  const handleConfirmarIndicacao = async (indicacao) => {
    try {
      if (!isAdmin) {
        mostrarSnackbar('Apenas administradores podem confirmar indicações', 'error');
        return;
      }

      await firebaseService.update('indicacoes', indicacao.id, {
        status: 'confirmada',
        dataConfirmacao: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Adicionar pontos ao cliente que indicou
      if (indicacao.pontosGanhos > 0) {
        const pontuacaoData = {
          clienteId: indicacao.clienteId,
          clienteNome: indicacao.clienteNome,
          quantidade: indicacao.pontosGanhos,
          tipo: 'credito',
          motivo: `Bônus por indicação de ${indicacao.clienteIndicadoNome}`,
          data: new Date().toISOString(),
          indicacaoId: indicacao.id,
          createdAt: new Date().toISOString(),
        };
        await firebaseService.add('pontuacao', pontuacaoData);
      }

      mostrarSnackbar('Indicação confirmada e pontos creditados!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao confirmar indicação:', error);
      mostrarSnackbar('Erro ao confirmar indicação', 'error');
    }
  };

  const handleCancelarIndicacao = async (indicacao) => {
    if (!window.confirm('Deseja realmente cancelar esta indicação?')) return;

    try {
      await firebaseService.update('indicacoes', indicacao.id, {
        status: 'cancelada',
        updatedAt: new Date().toISOString(),
      });

      mostrarSnackbar('Indicação cancelada');
      carregarDados();
    } catch (error) {
      console.error('Erro ao cancelar indicação:', error);
      mostrarSnackbar('Erro ao cancelar indicação', 'error');
    }
  };

  const handleReenviarConvite = async (indicacao) => {
    try {
      // Gerar link de convite
      const link = `${window.location.origin}/cadastro?indicacao=${indicacao.id}`;
      
      if (indicacao.clienteIndicadoTelefone) {
        // Enviar WhatsApp
        const mensagem = `Olá! Você foi indicado(a) para conhecer nosso salão. Use este link para se cadastrar e ganhar benefícios: ${link}`;
        window.open(`https://wa.me/55${indicacao.clienteIndicadoTelefone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`, '_blank');
      } else if (indicacao.clienteIndicadoEmail) {
        // Simular envio de email
        toast.success('Convite enviado por email (simulação)');
      }

      mostrarSnackbar('Convite reenviado!');
    } catch (error) {
      console.error('Erro ao reenviar convite:', error);
      mostrarSnackbar('Erro ao reenviar convite', 'error');
    }
  };

  const handleCopiarLink = (indicacao) => {
    const link = `${window.location.origin}/cadastro?indicacao=${indicacao.id}`;
    navigator.clipboard.writeText(link);
    mostrarSnackbar('Link copiado para a área de transferência!');
  };

  // Filtrar indicações
  const indicacoesFiltradas = indicacoes.filter(indicacao => {
    const matchesTexto = filtro === '' || 
      indicacao.clienteIndicadoNome?.toLowerCase().includes(filtro.toLowerCase()) ||
      indicacao.clienteIndicadoEmail?.toLowerCase().includes(filtro.toLowerCase()) ||
      indicacao.clienteIndicadoTelefone?.includes(filtro);

    const matchesStatus = filtroStatus === 'todos' || indicacao.status === filtroStatus;

    let matchesPeriodo = true;
    if (filtroPeriodo !== 'todos' && indicacao.dataCriacao) {
      const dataCriacao = new Date(indicacao.dataCriacao);
      const hoje = new Date();

      if (filtroPeriodo === 'hoje') {
        matchesPeriodo = dataCriacao.toDateString() === hoje.toDateString();
      } else if (filtroPeriodo === 'ontem') {
        const ontem = subDays(hoje, 1);
        matchesPeriodo = dataCriacao.toDateString() === ontem.toDateString();
      } else if (filtroPeriodo === 'ultimos7') {
        matchesPeriodo = dataCriacao >= subDays(hoje, 7);
      } else if (filtroPeriodo === 'ultimos30') {
        matchesPeriodo = dataCriacao >= subDays(hoje, 30);
      } else if (filtroPeriodo === 'esteMes') {
        matchesPeriodo = dataCriacao >= startOfMonth(hoje);
      } else if (filtroPeriodo === 'personalizado' && dataInicio && dataFim) {
        matchesPeriodo = dataCriacao >= new Date(dataInicio) && dataCriacao <= new Date(dataFim);
      }
    }

    return matchesTexto && matchesStatus && matchesPeriodo;
  });

  const paginatedIndicacoes = indicacoesFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusInfo = (status) => {
    return statusIndicacao.find(s => s.value === status) || statusIndicacao[0];
  };

  const getClienteInfo = (clienteId) => {
    return clientes.find(c => c.id === clienteId);
  };

  const verificarExpirada = (indicacao) => {
    if (indicacao.status !== 'pendente') return false;
    if (!indicacao.dataExpiracao) return false;
    
    const hoje = new Date();
    const dataExpiracao = new Date(indicacao.dataExpiracao);
    return hoje > dataExpiracao;
  };

  // Atualizar status para expirada se necessário
  useEffect(() => {
    const verificarEAtualizarExpiradas = async () => {
      const expiradas = indicacoes.filter(i => 
        i.status === 'pendente' && 
        i.dataExpiracao && 
        new Date(i.dataExpiracao) < new Date()
      );

      for (const indicacao of expiradas) {
        await firebaseService.update('indicacoes', indicacao.id, {
          status: 'expirada',
          updatedAt: new Date().toISOString(),
        });
      }

      if (expiradas.length > 0) {
        carregarDados();
      }
    };

    verificarEAtualizarExpiradas();
  }, [indicacoes]);

  const renderFilterDrawer = () => (
    <SwipeableDrawer
      anchor="bottom"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '80vh',
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtrar Indicações
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nome, email ou telefone..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="todos">Todos</MenuItem>
                {statusIndicacao.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Período</InputLabel>
              <Select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                label="Período"
              >
                {periodos.map(p => (
                  <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {filtroPeriodo === 'personalizado' && (
            <>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Início"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fim"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
            </>
          )}

          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setFiltro('');
                setFiltroStatus('todos');
                setFiltroPeriodo('todos');
                setDataInicio(null);
                setDataFim(null);
                setFilterDrawerOpen(false);
              }}
            >
              Limpar
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={{ bgcolor: '#9c27b0' }}
            >
              Aplicar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </SwipeableDrawer>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Cabeçalho Mobile */}
        {isMobile && (
          <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #f0f0f0' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0', flex: 1 }}>
                Indicações
              </Typography>
              <IconButton onClick={() => setFilterDrawerOpen(true)}>
                <Badge badgeContent={filtroStatus !== 'todos' || filtroPeriodo !== 'todos' || filtro ? 1 : 0} color="secondary">
                  <FilterIcon />
                </Badge>
              </IconButton>
              <IconButton onClick={carregarDados}>
                <RefreshIcon />
              </IconButton>
            </Box>

            {/* Cards de estatísticas mobile */}
            <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
              <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center' }}>
                <Typography variant="caption">Total</Typography>
                <Typography variant="h6">{stats.total}</Typography>
              </Paper>
              <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#fff3e0' }}>
                <Typography variant="caption">Pendentes</Typography>
                <Typography variant="h6">{stats.pendentes}</Typography>
              </Paper>
              <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="caption">Confirmadas</Typography>
                <Typography variant="h6">{stats.confirmadas}</Typography>
              </Paper>
              <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="caption">Pontos</Typography>
                <Typography variant="h6">{stats.totalPontos}</Typography>
              </Paper>
            </Box>
          </Box>
        )}

        {/* Cabeçalho Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                Programa de Indicações
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Indique amigos e ganhe pontos! Cada indicação confirmada vale {config?.pontosIndicacao || 100} pontos.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenDialog}
                sx={{
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                }}
              >
                Nova Indicação
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={carregarDados}
              >
                Atualizar
              </Button>
            </Box>
          </Box>
        )}

        {/* Cards de Estatísticas Desktop */}
        {!isMobile && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Total de Indicações
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#fff3e0' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Pendentes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {stats.pendentes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Confirmadas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {stats.confirmadas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#ffebee' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Canceladas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {stats.canceladas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#f3e5f5' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Pontos Gerados
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {stats.totalPontos}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filtros Desktop */}
        {!isMobile && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por nome, email ou telefone..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
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
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      {statusIndicacao.map(status => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Período</InputLabel>
                    <Select
                      value={filtroPeriodo}
                      onChange={(e) => setFiltroPeriodo(e.target.value)}
                      label="Período"
                    >
                      {periodos.map(p => (
                        <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {filtroPeriodo === 'personalizado' && (
                  <>
                    <Grid item xs={12} md={1.5}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Início"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Fim"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12} md={filtroPeriodo === 'personalizado' ? 2 : 3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setFiltro('');
                      setFiltroStatus('todos');
                      setFiltroPeriodo('todos');
                      setDataInicio(null);
                      setDataFim(null);
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Lista de Indicações */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Lista de Indicações</Typography>

            {indicacoesFiltradas.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PersonAddIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Nenhuma indicação encontrada
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                  sx={{ mt: 2, bgcolor: '#9c27b0' }}
                >
                  Fazer primeira indicação
                </Button>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Indicado</strong></TableCell>
                        <TableCell><strong>Indicador</strong></TableCell>
                        <TableCell><strong>Data</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell align="right"><strong>Pontos</strong></TableCell>
                        <TableCell align="center"><strong>Ações</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedIndicacoes.map((indicacao, index) => {
                        const statusInfo = getStatusInfo(indicacao.status);
                        const clienteIndicador = getClienteInfo(indicacao.clienteId);
                        
                        return (
                          <TableRow key={indicacao.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#9c27b0' }}>
                                  {indicacao.clienteIndicadoNome?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {indicacao.clienteIndicadoNome}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {indicacao.clienteIndicadoEmail || indicacao.clienteIndicadoTelefone}
                                  </Typography>
                                </Box>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {format(new Date(indicacao.dataCriacao), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                icon={statusInfo.icon}
                                label={statusInfo.label}
                                sx={{
                                  bgcolor: alpha(statusInfo.color, 0.1),
                                  color: statusInfo.color,
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography sx={{ fontWeight: 600, color: '#9c27b0' }}>
                                {indicacao.status === 'confirmada' ? indicacao.pontosGanhos : 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="Ver detalhes">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleVerDetalhes(indicacao)}
                                    sx={{ color: '#9c27b0' }}
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="QR Code">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleAbrirQRCode(indicacao)}
                                    sx={{ color: '#9c27b0' }}
                                  >
                                    <QrCodeIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Copiar link">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCopiarLink(indicacao)}
                                    sx={{ color: '#9c27b0' }}
                                  >
                                    <CopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                {indicacao.status === 'pendente' && !verificarExpirada(indicacao) && (
                                  <Tooltip title="Reenviar convite">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleReenviarConvite(indicacao)}
                                      sx={{ color: '#25D366' }}
                                    >
                                      <WhatsAppIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {isAdmin && indicacao.status === 'pendente' && (
                                  <>
                                    <Tooltip title="Confirmar">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleConfirmarIndicacao(indicacao)}
                                        sx={{ color: '#4caf50' }}
                                      >
                                        <CheckIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancelar">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleCancelarIndicacao(indicacao)}
                                        sx={{ color: '#f44336' }}
                                      >
                                        <CancelIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={indicacoesFiltradas.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  labelRowsPerPage="Linhas por página"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog para nova indicação */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon />
            <span>Nova Indicação</span>
            <IconButton
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {isAdmin && (
                <Grid item xs={12}>
                  <Autocomplete
                    options={clientes}
                    getOptionLabel={(option) => option.nome}
                    onChange={handleClienteChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente que está indicando"
                        placeholder="Buscar cliente..."
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
                  Dados do Indicado
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome completo *"
                  name="clienteNome"
                  value={formData.clienteNome}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-mail"
                  name="clienteEmail"
                  type="email"
                  value={formData.clienteEmail}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="clienteTelefone"
                  value={formData.clienteTelefone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  name="observacoes"
                  multiline
                  rows={3}
                  value={formData.observacoes}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon />}>
                  Ao se cadastrar, o indicado ganhará um bônus e você receberá {config?.pontosIndicacao || 100} pontos quando a indicação for confirmada.
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSalvarIndicacao}
              sx={{ bgcolor: '#9c27b0' }}
            >
              Registrar Indicação
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de detalhes */}
        <Dialog
          open={openDetalhesDialog}
          onClose={() => setOpenDetalhesDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          {indicacaoSelecionada && (
            <>
              <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
                Detalhes da Indicação
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: '#9c27b0' }}>
                        {indicacaoSelecionada.clienteIndicadoNome?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {indicacaoSelecionada.clienteIndicadoNome}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {indicacaoSelecionada.clienteIndicadoEmail || 'Sem e-mail'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {indicacaoSelecionada.clienteIndicadoTelefone || 'Sem telefone'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Indicador
                    </Typography>
                    <Typography variant="body1">
                      {indicacaoSelecionada.clienteNome}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip
                      size="small"
                      icon={getStatusInfo(indicacaoSelecionada.status).icon}
                      label={getStatusInfo(indicacaoSelecionada.status).label}
                      sx={{
                        bgcolor: alpha(getStatusInfo(indicacaoSelecionada.status).color, 0.1),
                        color: getStatusInfo(indicacaoSelecionada.status).color,
                      }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Data da Indicação
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(indicacaoSelecionada.dataCriacao), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Data de Expiração
                    </Typography>
                    <Typography variant="body1">
                      {indicacaoSelecionada.dataExpiracao 
                        ? format(new Date(indicacaoSelecionada.dataExpiracao), 'dd/MM/yyyy')
                        : 'Não definida'}
                    </Typography>
                  </Grid>

                  {indicacaoSelecionada.status === 'confirmada' && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Data da Confirmação
                        </Typography>
                        <Typography variant="body1">
                          {indicacaoSelecionada.dataConfirmacao
                            ? format(new Date(indicacaoSelecionada.dataConfirmacao), 'dd/MM/yyyy HH:mm')
                            : '-'}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Pontos Ganhos
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                          {indicacaoSelecionada.pontosGanhos}
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {indicacaoSelecionada.observacoes && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Observações
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                          <Typography variant="body2">
                            {indicacaoSelecionada.observacoes}
                          </Typography>
                        </Paper>
                      </Grid>
                    </>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetalhesDialog(false)}>
                  Fechar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Dialog QR Code */}
        <Dialog
          open={openQrCodeDialog}
          onClose={() => setOpenQrCodeDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          {indicacaoSelecionada && (
            <>
              <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white', textAlign: 'center' }}>
                QR Code da Indicação
              </DialogTitle>
              <DialogContent>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <QRCode
                    value={`${window.location.origin}/cadastro?indicacao=${indicacaoSelecionada.id}`}
                    size={256}
                    level="H"
                    includeMargin
                    style={{
                      margin: '0 auto',
                      padding: 16,
                      background: 'white',
                      borderRadius: 8,
                    }}
                  />
                  <Typography variant="body1" sx={{ mt: 2, fontWeight: 500 }}>
                    {indicacaoSelecionada.clienteIndicadoNome}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Escaneie para cadastrar o indicado
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                      const link = document.createElement('a');
                      link.download = `qrcode-indicacao-${indicacaoSelecionada.id}.png`;
                      link.href = canvas.toDataURL();
                      link.click();
                    }
                  }}
                  sx={{ bgcolor: '#9c27b0' }}
                >
                  Download
                </Button>
                <Button onClick={() => setOpenQrCodeDialog(false)}>
                  Fechar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Mobile Filter Drawer */}
        {renderFilterDrawer()}

        {/* Mobile FAB */}
        {isMobile && (
          <Zoom in={true}>
            <Fab
              color="primary"
              sx={{
                position: 'fixed',
                bottom: 80,
                right: 16,
                bgcolor: '#9c27b0',
              }}
              onClick={handleOpenDialog}
            >
              <AddIcon />
            </Fab>
          </Zoom>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

export default Indicacoes;
