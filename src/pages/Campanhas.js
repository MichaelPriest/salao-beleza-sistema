// src/pages/Campanhas.js
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Percent as PercentIcon,
  Money as MoneyIcon,
  LocalOffer as TagIcon,
  Campaign as CampaignIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon,
  PlayArrow as PlayArrowIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const statusCampanha = [
  { value: 'rascunho', label: 'Rascunho', color: '#999' },
  { value: 'agendada', label: 'Agendada', color: '#2196f3' },
  { value: 'ativa', label: 'Ativa', color: '#4caf50' },
  { value: 'pausada', label: 'Pausada', color: '#ff9800' },
  { value: 'encerrada', label: 'Encerrada', color: '#f44336' },
];

const tiposCampanha = [
  { value: 'geral', label: 'Geral (todos os clientes)' },
  { value: 'segmentada', label: 'Segmentada (grupo específico)' },
  { value: 'aniversario', label: 'Aniversário' },
  { value: 'primeira_compra', label: 'Primeira Compra' },
  { value: 'recuperacao', label: 'Recuperação (inativos)' },
  { value: 'vip', label: 'Clientes VIP' },
];

function Campanhas() {
  const [loading, setLoading] = useState(true);
  const [campanhas, setCampanhas] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [campanhaEditando, setCampanhaEditando] = useState(null);
  const [campanhaSelecionada, setCampanhaSelecionada] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'geral',
    status: 'rascunho',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    horarioInicio: '',
    horarioFim: '',
    objetivo: '',
    orcamento: '',
    metaFaturamento: '',
    metaClientes: '',
    cuponsAssociados: [],
    segmento: {
      genero: 'todos',
      idadeMinima: '',
      idadeMaxima: '',
      cidades: [],
      niveis: ['bronze', 'prata', 'ouro', 'platina'],
      ultimaCompraApos: '',
      clientesEspecificos: [],
    },
    canais: {
      email: true,
      whatsapp: true,
      sms: false,
      push: false,
    },
  });

  useEffect(() => {
    carregarUsuario();
    carregarDados();
  }, []);

  const carregarUsuario = () => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        setUsuario(JSON.parse(usuarioStr));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [campanhasData, cuponsData, clientesData] = await Promise.all([
        firebaseService.getAll('campanhas').catch(() => []),
        firebaseService.getAll('cupons').catch(() => []),
        firebaseService.getAll('clientes').catch(() => [])
      ]);
      setCampanhas(campanhasData || []);
      setCupons(cuponsData || []);
      setClientes(clientesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar campanhas');
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

  const handleOpenDialog = (campanha = null) => {
    if (campanha) {
      setCampanhaEditando(campanha);
      setFormData({
        nome: campanha.nome || '',
        descricao: campanha.descricao || '',
        tipo: campanha.tipo || 'geral',
        status: campanha.status || 'rascunho',
        dataInicio: campanha.dataInicio || new Date().toISOString().split('T')[0],
        dataFim: campanha.dataFim || '',
        horarioInicio: campanha.horarioInicio || '',
        horarioFim: campanha.horarioFim || '',
        objetivo: campanha.objetivo || '',
        orcamento: campanha.orcamento || '',
        metaFaturamento: campanha.metaFaturamento || '',
        metaClientes: campanha.metaClientes || '',
        cuponsAssociados: campanha.cuponsAssociados || [],
        segmento: campanha.segmento || {
          genero: 'todos',
          idadeMinima: '',
          idadeMaxima: '',
          cidades: [],
          niveis: ['bronze', 'prata', 'ouro', 'platina'],
          ultimaCompraApos: '',
          clientesEspecificos: [],
        },
        canais: campanha.canais || {
          email: true,
          whatsapp: true,
          sms: false,
          push: false,
        },
      });
    } else {
      setCampanhaEditando(null);
      setFormData({
        nome: '',
        descricao: '',
        tipo: 'geral',
        status: 'rascunho',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: '',
        horarioInicio: '',
        horarioFim: '',
        objetivo: '',
        orcamento: '',
        metaFaturamento: '',
        metaClientes: '',
        cuponsAssociados: [],
        segmento: {
          genero: 'todos',
          idadeMinima: '',
          idadeMaxima: '',
          cidades: [],
          niveis: ['bronze', 'prata', 'ouro', 'platina'],
          ultimaCompraApos: '',
          clientesEspecificos: [],
        },
        canais: {
          email: true,
          whatsapp: true,
          sms: false,
          push: false,
        },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCampanhaEditando(null);
  };

  const handleVerDetalhes = (campanha) => {
    setCampanhaSelecionada(campanha);
    setOpenDetalhesDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSegmentoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      segmento: {
        ...prev.segmento,
        [name]: value
      }
    }));
  };

  const handleCanaisChange = (canal) => {
    setFormData(prev => ({
      ...prev,
      canais: {
        ...prev.canais,
        [canal]: !prev.canais[canal]
      }
    }));
  };

  // FUNÇÃO handleConfigChange ADICIONADA para resolver o erro
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalvar = async () => {
    try {
      if (!formData.nome) {
        mostrarSnackbar('Nome da campanha é obrigatório', 'error');
        return;
      }

      const dadosParaSalvar = {
        ...formData,
        orcamento: formData.orcamento ? parseFloat(formData.orcamento) : 0,
        metaFaturamento: formData.metaFaturamento ? parseFloat(formData.metaFaturamento) : 0,
        metaClientes: formData.metaClientes ? parseInt(formData.metaClientes) : 0,
        criadoPor: usuario?.id,
        criadoPorNome: usuario?.nome,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      if (campanhaEditando) {
        await firebaseService.update('campanhas', campanhaEditando.id, dadosParaSalvar);
        mostrarSnackbar('Campanha atualizada com sucesso!');
      } else {
        await firebaseService.add('campanhas', dadosParaSalvar);
        mostrarSnackbar('Campanha criada com sucesso!');
      }

      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar campanha:', error);
      mostrarSnackbar(error.message || 'Erro ao salvar campanha', 'error');
    }
  };

  const handleMudarStatus = async (campanha, novoStatus) => {
    try {
      await firebaseService.update('campanhas', campanha.id, {
        status: novoStatus,
        atualizadoEm: new Date().toISOString()
      });
      mostrarSnackbar(`Status alterado com sucesso!`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarSnackbar('Erro ao alterar status', 'error');
    }
  };

  const handleDuplicar = async (campanha) => {
    try {
      const novaCampanha = {
        ...campanha,
        nome: `${campanha.nome} (cópia)`,
        status: 'rascunho',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };
      delete novaCampanha.id;
      
      await firebaseService.add('campanhas', novaCampanha);
      mostrarSnackbar('Campanha duplicada com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao duplicar campanha:', error);
      mostrarSnackbar('Erro ao duplicar campanha', 'error');
    }
  };

  const getAlcanceEstimado = (campanha) => {
    if (campanha.tipo === 'geral') {
      return clientes.length;
    }
    
    if (campanha.tipo === 'segmentada' && campanha.segmento) {
      return clientes.filter(c => {
        let match = true;
        if (campanha.segmento.genero !== 'todos' && c.genero !== campanha.segmento.genero) match = false;
        if (campanha.segmento.idadeMinima && c.idade < campanha.segmento.idadeMinima) match = false;
        if (campanha.segmento.idadeMaxima && c.idade > campanha.segmento.idadeMaxima) match = false;
        if (campanha.segmento.cidades?.length > 0 && !campanha.segmento.cidades.includes(c.cidade)) match = false;
        if (campanha.segmento.niveis?.length > 0 && !campanha.segmento.niveis.includes(c.nivel)) match = false;
        return match;
      }).length;
    }
    
    return 0;
  };

  const calcularProgresso = (campanha) => {
    if (!campanha.metaFaturamento || campanha.metaFaturamento === 0) return 0;
    const faturamento = campanha.faturamentoReal || 0;
    return Math.min((faturamento / campanha.metaFaturamento) * 100, 100);
  };

  const campanhasFiltradas = campanhas.filter(campanha => {
    const matchesTexto = filtro === '' || 
      campanha.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      campanha.descricao?.toLowerCase().includes(filtro.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || campanha.status === filtroStatus;

    return matchesTexto && matchesStatus;
  });

  const paginatedCampanhas = campanhasFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    const s = statusCampanha.find(s => s.value === status);
    return s?.color || '#999';
  };

  const getStatusLabel = (status) => {
    const s = statusCampanha.find(s => s.value === status);
    return s?.label || status;
  };

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
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Campanhas
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie campanhas promocionais e ações de marketing
            </Typography>
          </Box>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              Nova Campanha
            </Button>
          </motion.div>
        </Box>

        {/* Cards de Resumo */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Total de Campanhas
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                      {campanhas.length}
                    </Typography>
                  </Box>
                  <CampaignIcon sx={{ fontSize: 48, color: '#9c27b0', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Ativas
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {campanhas.filter(c => c.status === 'ativa').length}
                    </Typography>
                  </Box>
                  <CheckIcon sx={{ fontSize: 48, color: '#4caf50', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Agendadas
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                      {campanhas.filter(c => c.status === 'agendada').length}
                    </Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: 48, color: '#2196f3', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Alcance Total
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {campanhas.reduce((acc, c) => acc + getAlcanceEstimado(c), 0)}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 48, color: '#ff9800', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar campanhas..."
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtroStatus}
                    label="Status"
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {statusCampanha.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabela de Campanhas */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Campanha</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell><strong>Período</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Alcance</strong></TableCell>
                  <TableCell><strong>Progresso</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCampanhas.map((campanha, index) => (
                  <motion.tr
                    key={campanha.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {campanha.nome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {campanha.descricao?.substring(0, 50)}
                        {campanha.descricao?.length > 50 ? '...' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tiposCampanha.find(t => t.value === campanha.tipo)?.label || campanha.tipo}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {new Date(campanha.dataInicio).toLocaleDateString('pt-BR')}
                        </Typography>
                        {campanha.dataFim && (
                          <Typography variant="caption" color="textSecondary">
                            até {new Date(campanha.dataFim).toLocaleDateString('pt-BR')}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(campanha.status)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(campanha.status),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getAlcanceEstimado(campanha)} clientes
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {campanha.cuponsAssociados?.length || 0} cupom(ns)
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={calcularProgresso(campanha)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: '#f0f0f0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#4caf50',
                              },
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 45 }}>
                          {calcularProgresso(campanha).toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleVerDetalhes(campanha)}
                            sx={{ color: '#2196f3' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicar">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicar(campanha)}
                            sx={{ color: '#4caf50' }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(campanha)}
                            sx={{ color: '#ff4081' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {campanha.status === 'rascunho' && (
                          <Tooltip title="Ativar">
                            <IconButton
                              size="small"
                              onClick={() => handleMudarStatus(campanha, 'agendada')}
                              sx={{ color: '#4caf50' }}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {campanha.status === 'ativa' && (
                          <Tooltip title="Pausar">
                            <IconButton
                              size="small"
                              onClick={() => handleMudarStatus(campanha, 'pausada')}
                              sx={{ color: '#ff9800' }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {campanha.status === 'pausada' && (
                          <Tooltip title="Retomar">
                            <IconButton
                              size="small"
                              onClick={() => handleMudarStatus(campanha, 'ativa')}
                              sx={{ color: '#4caf50' }}
                            >
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))}
                {paginatedCampanhas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CampaignIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Nenhuma campanha encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={campanhasFiltradas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* Dialog de Cadastro/Edição */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            {campanhaEditando ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
              <Tab label="Informações Básicas" />
              <Tab label="Segmentação" />
              <Tab label="Cupons" />
              <Tab label="Metas" />
            </Tabs>

            {tabValue === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome da Campanha"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="descricao"
                    multiline
                    rows={3}
                    value={formData.descricao}
                    onChange={handleInputChange}
                    size="small"
                    placeholder="Descreva o objetivo e detalhes da campanha"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de Campanha</InputLabel>
                    <Select
                      name="tipo"
                      value={formData.tipo}
                      label="Tipo de Campanha"
                      onChange={handleInputChange}
                    >
                      {tiposCampanha.map(tipo => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      label="Status"
                      onChange={handleInputChange}
                    >
                      {statusCampanha.map(status => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Data Início"
                    value={formData.dataInicio ? new Date(formData.dataInicio + 'T12:00:00') : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setFormData({ ...formData, dataInicio: newValue.toISOString().split('T')[0] });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Data Fim (opcional)"
                    value={formData.dataFim ? new Date(formData.dataFim + 'T12:00:00') : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setFormData({ ...formData, dataFim: newValue.toISOString().split('T')[0] });
                      } else {
                        setFormData({ ...formData, dataFim: '' });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horário Início"
                    name="horarioInicio"
                    type="time"
                    value={formData.horarioInicio}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horário Fim"
                    name="horarioFim"
                    type="time"
                    value={formData.horarioFim}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                    Canais de Divulgação
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.canais.email}
                          onChange={() => handleCanaisChange('email')}
                        />
                      }
                      label="E-mail"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.canais.whatsapp}
                          onChange={() => handleCanaisChange('whatsapp')}
                        />
                      }
                      label="WhatsApp"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.canais.sms}
                          onChange={() => handleCanaisChange('sms')}
                        />
                      }
                      label="SMS"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.canais.push}
                          onChange={() => handleCanaisChange('push')}
                        />
                      }
                      label="Notificação Push"
                    />
                  </Box>
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Gênero</InputLabel>
                    <Select
                      name="genero"
                      value={formData.segmento.genero}
                      label="Gênero"
                      onChange={handleSegmentoChange}
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      <MenuItem value="masculino">Masculino</MenuItem>
                      <MenuItem value="feminino">Feminino</MenuItem>
                      <MenuItem value="outro">Outro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Idade Mínima"
                    name="idadeMinima"
                    type="number"
                    value={formData.segmento.idadeMinima}
                    onChange={handleSegmentoChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Idade Máxima"
                    name="idadeMaxima"
                    type="number"
                    value={formData.segmento.idadeMaxima}
                    onChange={handleSegmentoChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={clientes}
                    getOptionLabel={(option) => `${option.nome} - ${option.cidade || ''}`}
                    value={clientes.filter(c => formData.segmento.clientesEspecificos?.includes(c.id))}
                    onChange={(e, newValue) => {
                      setFormData({
                        ...formData,
                        segmento: {
                          ...formData.segmento,
                          clientesEspecificos: newValue.map(c => c.id)
                        }
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Clientes Específicos"
                        size="small"
                        placeholder="Selecionar clientes..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Níveis Permitidos</InputLabel>
                    <Select
                      multiple
                      name="niveis"
                      value={formData.segmento.niveis}
                      label="Níveis Permitidos"
                      onChange={handleSegmentoChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value.toUpperCase()} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {['bronze', 'prata', 'ouro', 'platina'].map(nivel => (
                        <MenuItem key={nivel} value={nivel}>
                          <Checkbox checked={formData.segmento.niveis.indexOf(nivel) > -1} />
                          <ListItemText primary={nivel.toUpperCase()} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Última Compra Após (dias)"
                    name="ultimaCompraApos"
                    type="number"
                    value={formData.segmento.ultimaCompraApos}
                    onChange={handleSegmentoChange}
                    size="small"
                    helperText="Clientes que compraram nos últimos X dias"
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={cupons.filter(c => c.ativo)}
                    getOptionLabel={(option) => `${option.codigo} - ${option.descricao || ''}`}
                    value={cupons.filter(c => formData.cuponsAssociados?.includes(c.id))}
                    onChange={(e, newValue) => {
                      setFormData({
                        ...formData,
                        cuponsAssociados: newValue.map(c => c.id)
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cupons da Campanha"
                        size="small"
                        placeholder="Selecionar cupons..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Os cupons selecionados serão disponibilizados durante o período da campanha.
                    Clientes elegíveis poderão utilizar os cupons conforme as regras de cada um.
                  </Alert>
                </Grid>
              </Grid>
            )}

            {tabValue === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Objetivo da Campanha"
                    name="objetivo"
                    multiline
                    rows={2}
                    value={formData.objetivo}
                    onChange={handleInputChange}
                    size="small"
                    placeholder="Ex: Aumentar vendas de serviços em 20%"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Orçamento (R$)"
                    name="orcamento"
                    type="number"
                    value={formData.orcamento}
                    onChange={handleInputChange}
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Meta de Faturamento (R$)"
                    name="metaFaturamento"
                    type="number"
                    value={formData.metaFaturamento}
                    onChange={handleInputChange}
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Meta de Clientes"
                    name="metaClientes"
                    type="number"
                    value={formData.metaClientes}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={handleSalvar}
              variant="contained"
              sx={{ bgcolor: '#9c27b0' }}
            >
              {campanhaEditando ? 'Atualizar' : 'Criar Campanha'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Detalhes */}
        <Dialog open={openDetalhesDialog} onClose={() => setOpenDetalhesDialog(false)} maxWidth="md" fullWidth>
          {campanhaSelecionada && (
            <>
              <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{campanhaSelecionada.nome}</Typography>
                  <Chip
                    label={getStatusLabel(campanhaSelecionada.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(campanhaSelecionada.status),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Typography variant="body1" paragraph>
                      {campanhaSelecionada.descricao}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Período</Typography>
                    <Typography variant="body1">
                      {new Date(campanhaSelecionada.dataInicio).toLocaleDateString('pt-BR')}
                      {campanhaSelecionada.dataFim && ` até ${new Date(campanhaSelecionada.dataFim).toLocaleDateString('pt-BR')}`}
                    </Typography>
                    {campanhaSelecionada.horarioInicio && campanhaSelecionada.horarioFim && (
                      <Typography variant="body2" color="textSecondary">
                        {campanhaSelecionada.horarioInicio} - {campanhaSelecionada.horarioFim}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Tipo</Typography>
                    <Typography variant="body1">
                      {tiposCampanha.find(t => t.value === campanhaSelecionada.tipo)?.label}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>Métricas</Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <PeopleIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {getAlcanceEstimado(campanhaSelecionada)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Clientes Elegíveis
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <LocalOfferIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {campanhaSelecionada.cuponsAssociados?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Cupons na Campanha
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Money sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        R$ {(campanhaSelecionada.faturamentoReal || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Faturamento Gerado
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Progresso da Meta
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calcularProgresso(campanhaSelecionada)}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#4caf50',
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {calcularProgresso(campanhaSelecionada).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Meta: R$ {(campanhaSelecionada.metaFaturamento || 0).toFixed(2)}
                    </Typography>
                  </Grid>

                  {campanhaSelecionada.cuponsAssociados && campanhaSelecionada.cuponsAssociados.length > 0 && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>Cupons da Campanha</Typography>
                      </Grid>
                      {cupons
                        .filter(c => campanhaSelecionada.cuponsAssociados.includes(c.id))
                        .map(cupom => (
                          <Grid item xs={12} md={6} key={cupom.id}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                                    {cupom.codigo}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {cupom.descricao}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`${cupom.usosAtuais || 0}/${cupom.usoMaximo || '∞'}`}
                                  size="small"
                                  color={cupom.usosAtuais >= cupom.usoMaximo ? 'error' : 'success'}
                                />
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                    </>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetalhesDialog(false)}>Fechar</Button>
                <Button
                  variant="contained"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => {
                    setOpenDetalhesDialog(false);
                    // Navegar para análise da campanha
                  }}
                >
                  Ver Análise Completa
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
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

export default Campanhas;
