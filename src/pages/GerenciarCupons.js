// src/pages/GerenciarCupons.js
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
  Tabs,
  Tab,
  Avatar,
  Switch,
  FormControlLabel,
  Autocomplete,
  Badge,
  Checkbox, // <-- ADICIONAR ESTA LINHA
  ListItemText, // <-- ADICIONAR ESTA LINHA
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCut as CutIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
  LocalOffer as TagIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cupomService } from '../services/cupomService';
import { firebaseService } from '../services/firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const tiposCupom = [
  { value: 'percentual', label: 'Percentual', icon: <PercentIcon /> },
  { value: 'fixo', label: 'Valor Fixo', icon: <MoneyIcon /> },
  { value: 'frete', label: 'Frete Grátis', icon: <ShoppingCartIcon /> },
  { value: 'produto', label: 'Produto Específico', icon: <InventoryIcon /> },
];

const diasSemana = [
  { value: 'segunda', label: 'Segunda' },
  { value: 'terca', label: 'Terça' },
  { value: 'quarta', label: 'Quarta' },
  { value: 'quinta', label: 'Quinta' },
  { value: 'sexta', label: 'Sexta' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

const clientesElegiveis = [
  { value: 'todos', label: 'Todos os clientes' },
  { value: 'novos', label: 'Apenas novos clientes' },
  { value: 'vip', label: 'Apenas clientes VIP' },
  { value: 'lista', label: 'Lista específica' },
];

function GerenciarCupons() {
  const [loading, setLoading] = useState(true);
  const [cupons, setCupons] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [cupomEditando, setCupomEditando] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Dados para selects
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // Estado do formulário
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    tipo: 'percentual',
    valor: '',
    valorMinimo: '',
    valorMaximoDesconto: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    diasSemana: [],
    horarioInicio: '',
    horarioFim: '',
    usoMaximo: '',
    usoMaximoPorCliente: 1,
    clientesElegiveis: 'todos',
    listaClientesIds: [],
    niveisPermitidos: ['bronze', 'prata', 'ouro', 'platina'],
    servicosElegiveis: 'todos',
    listaServicosIds: [],
    produtosElegiveis: 'todos',
    listaProdutosIds: [],
    ativo: true,
    primeiroAcesso: false,
  });

  useEffect(() => {
    carregarUsuario();
    carregarDados();
    carregarClientesServicosProdutos();
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
      const dados = await cupomService.listarCupons();
      setCupons(dados);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  const carregarClientesServicosProdutos = async () => {
    try {
      const [clientesData, servicosData, produtosData] = await Promise.all([
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('produtos').catch(() => [])
      ]);
      setClientes(clientesData || []);
      setServicos(servicosData || []);
      setProdutos(produtosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (cupom = null) => {
    if (cupom) {
      setCupomEditando(cupom);
      setFormData({
        codigo: cupom.codigo || '',
        descricao: cupom.descricao || '',
        tipo: cupom.tipo || 'percentual',
        valor: cupom.valor || '',
        valorMinimo: cupom.valorMinimo || '',
        valorMaximoDesconto: cupom.valorMaximoDesconto || '',
        dataInicio: cupom.dataInicio || new Date().toISOString().split('T')[0],
        dataFim: cupom.dataFim || '',
        diasSemana: cupom.diasSemana || [],
        horarioInicio: cupom.horarioInicio || '',
        horarioFim: cupom.horarioFim || '',
        usoMaximo: cupom.usoMaximo || '',
        usoMaximoPorCliente: cupom.usoMaximoPorCliente || 1,
        clientesElegiveis: cupom.clientesElegiveis || 'todos',
        listaClientesIds: cupom.listaClientesIds || [],
        niveisPermitidos: cupom.niveisPermitidos || ['bronze', 'prata', 'ouro', 'platina'],
        servicosElegiveis: cupom.servicosElegiveis || 'todos',
        listaServicosIds: cupom.listaServicosIds || [],
        produtosElegiveis: cupom.produtosElegiveis || 'todos',
        listaProdutosIds: cupom.listaProdutosIds || [],
        ativo: cupom.ativo !== false,
        primeiroAcesso: cupom.primeiroAcesso || false,
      });
    } else {
      setCupomEditando(null);
      setFormData({
        codigo: '',
        descricao: '',
        tipo: 'percentual',
        valor: '',
        valorMinimo: '',
        valorMaximoDesconto: '',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: '',
        diasSemana: [],
        horarioInicio: '',
        horarioFim: '',
        usoMaximo: '',
        usoMaximoPorCliente: 1,
        clientesElegiveis: 'todos',
        listaClientesIds: [],
        niveisPermitidos: ['bronze', 'prata', 'ouro', 'platina'],
        servicosElegiveis: 'todos',
        listaServicosIds: [],
        produtosElegiveis: 'todos',
        listaProdutosIds: [],
        ativo: true,
        primeiroAcesso: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCupomEditando(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSalvar = async () => {
    try {
      if (!formData.codigo) {
        mostrarSnackbar('Código do cupom é obrigatório', 'error');
        return;
      }

      if (!formData.valor || formData.valor <= 0) {
        mostrarSnackbar('Valor do desconto é obrigatório', 'error');
        return;
      }

      const dadosParaSalvar = {
        ...formData,
        valor: parseFloat(formData.valor),
        valorMinimo: formData.valorMinimo ? parseFloat(formData.valorMinimo) : 0,
        valorMaximoDesconto: formData.valorMaximoDesconto ? parseFloat(formData.valorMaximoDesconto) : null,
        usoMaximo: formData.usoMaximo ? parseInt(formData.usoMaximo) : null,
        usoMaximoPorCliente: parseInt(formData.usoMaximoPorCliente) || 1,
        criadoPor: usuario?.id,
        criadoPorNome: usuario?.nome,
      };

      if (cupomEditando) {
        await cupomService.atualizarCupom(cupomEditando.id, dadosParaSalvar);
        mostrarSnackbar('Cupom atualizado com sucesso!');
      } else {
        await cupomService.criarCupom(dadosParaSalvar);
        mostrarSnackbar('Cupom criado com sucesso!');
      }

      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      mostrarSnackbar(error.message || 'Erro ao salvar cupom', 'error');
    }
  };

  const handleToggleStatus = async (cupom) => {
    try {
      await cupomService.atualizarCupom(cupom.id, {
        ativo: !cupom.ativo
      });
      mostrarSnackbar(`Cupom ${!cupom.ativo ? 'ativado' : 'desativado'} com sucesso!`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarSnackbar('Erro ao alterar status', 'error');
    }
  };

  const handleVerHistorico = async (cupom) => {
    // Implementar modal de histórico
    const historico = await cupomService.historicoUso(cupom.id);
    console.log('Histórico:', historico);
    // Abrir dialog com histórico
  };

  const cuponsFiltrados = cupons.filter(cupom => {
    const matchesTexto = filtro === '' || 
      cupom.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
      cupom.descricao?.toLowerCase().includes(filtro.toLowerCase());

    const matchesTipo = filtroTipo === 'todos' || cupom.tipo === filtroTipo;
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativo' && cupom.ativo) ||
      (filtroStatus === 'inativo' && !cupom.ativo);

    return matchesTexto && matchesTipo && matchesStatus;
  });

  const paginatedCupons = cuponsFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getTipoIcon = (tipo) => {
    const t = tiposCupom.find(t => t.value === tipo);
    return t?.icon || <TagIcon />;
  };

  const getStatusColor = (ativo, usosAtuais, usoMaximo) => {
    if (!ativo) return 'error';
    if (usoMaximo && usosAtuais >= usoMaximo) return 'warning';
    return 'success';
  };

  const getStatusLabel = (ativo, usosAtuais, usoMaximo) => {
    if (!ativo) return 'Inativo';
    if (usoMaximo && usosAtuais >= usoMaximo) return 'Esgotado';
    return 'Ativo';
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
              Cupons de Desconto
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie todos os cupons e promoções
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
              Novo Cupom
            </Button>
          </motion.div>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por código ou descrição..."
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
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtroTipo}
                    label="Tipo"
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <MenuItem value="todos">Todos os tipos</MenuItem>
                    {tiposCupom.map(tipo => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtroStatus}
                    label="Status"
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="ativo">Ativos</MenuItem>
                    <MenuItem value="inativo">Inativos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={carregarDados}
                >
                  Atualizar
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabela de Cupons */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Código</strong></TableCell>
                  <TableCell><strong>Descrição</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell align="right"><strong>Desconto</strong></TableCell>
                  <TableCell><strong>Validade</strong></TableCell>
                  <TableCell><strong>Usos</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCupons.map((cupom, index) => (
                  <motion.tr
                    key={cupom.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                        {cupom.codigo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{cupom.descricao}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getTipoIcon(cupom.tipo)}
                        label={tiposCupom.find(t => t.value === cupom.tipo)?.label || cupom.tipo}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {cupom.tipo === 'percentual' ? `${cupom.valor}%` : `R$ ${cupom.valor?.toFixed(2)}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {cupom.dataFim ? (
                        <Box>
                          <Typography variant="body2">
                            até {new Date(cupom.dataFim).toLocaleDateString('pt-BR')}
                          </Typography>
                          {new Date(cupom.dataFim) < new Date() && cupom.ativo && (
                            <Chip
                              label="Expirado"
                              size="small"
                              color="error"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Sem validade
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {cupom.usosAtuais || 0} / {cupom.usoMaximo || '∞'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(cupom.ativo, cupom.usosAtuais, cupom.usoMaximo)}
                        color={getStatusColor(cupom.ativo, cupom.usosAtuais, cupom.usoMaximo)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Histórico de uso">
                          <IconButton
                            size="small"
                            onClick={() => handleVerHistorico(cupom)}
                            sx={{ color: '#2196f3' }}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(cupom)}
                            sx={{ color: '#ff4081' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={cupom.ativo ? 'Desativar' : 'Ativar'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(cupom)}
                            sx={{ color: cupom.ativo ? '#f44336' : '#4caf50' }}
                          >
                            {cupom.ativo ? <CancelIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))}
                {paginatedCupons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <TagIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Nenhum cupom encontrado
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
            count={cuponsFiltrados.length}
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
            {cupomEditando ? 'Editar Cupom' : 'Novo Cupom'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Informações Básicas */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Código do Cupom"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  required
                  size="small"
                  placeholder="Ex: PROMO10"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Descrição"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  size="small"
                  placeholder="Ex: 10% de desconto em todos os serviços"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de Desconto</InputLabel>
                  <Select
                    name="tipo"
                    value={formData.tipo}
                    label="Tipo de Desconto"
                    onChange={handleInputChange}
                  >
                    {tiposCupom.map(tipo => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {tipo.icon}
                          {tipo.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={formData.tipo === 'percentual' ? 'Percentual (%)' : 'Valor (R$)'}
                  name="valor"
                  type="number"
                  value={formData.valor}
                  onChange={handleInputChange}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: formData.tipo === 'percentual' ? 
                      <InputAdornment position="start">%</InputAdornment> : 
                      <InputAdornment position="start">R$</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Valor Mínimo da Compra"
                  name="valorMinimo"
                  type="number"
                  value={formData.valorMinimo}
                  onChange={handleInputChange}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>
                  }}
                />
              </Grid>

              {formData.tipo === 'percentual' && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Valor Máx. do Desconto"
                    name="valorMaximoDesconto"
                    type="number"
                    value={formData.valorMaximoDesconto}
                    onChange={handleInputChange}
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>
                    }}
                  />
                </Grid>
              )}

              {/* Validade */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                  Período de Validade
                </Typography>
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
                <FormControl fullWidth size="small">
                  <InputLabel>Dias da Semana (opcional)</InputLabel>
                  <Select
                    multiple
                    name="diasSemana"
                    value={formData.diasSemana}
                    label="Dias da Semana (opcional)"
                    onChange={handleInputChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={diasSemana.find(d => d.value === value)?.label} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {diasSemana.map(dia => (
                      <MenuItem key={dia.value} value={dia.value}>
                        <Checkbox checked={formData.diasSemana.indexOf(dia.value) > -1} />
                        <ListItemText primary={dia.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
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

              <Grid item xs={12} md={3}>
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

              {/* Limites de Uso */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                  Limites de Uso
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Uso Máximo Total"
                  name="usoMaximo"
                  type="number"
                  value={formData.usoMaximo}
                  onChange={handleInputChange}
                  size="small"
                  helperText="Deixe em branco para ilimitado"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Uso Máximo por Cliente"
                  name="usoMaximoPorCliente"
                  type="number"
                  value={formData.usoMaximoPorCliente}
                  onChange={handleInputChange}
                  size="small"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              {/* Restrições de Cliente */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                  Restrições de Cliente
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Clientes Elegíveis</InputLabel>
                  <Select
                    name="clientesElegiveis"
                    value={formData.clientesElegiveis}
                    label="Clientes Elegíveis"
                    onChange={handleInputChange}
                  >
                    {clientesElegiveis.map(opcao => (
                      <MenuItem key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {formData.clientesElegiveis === 'lista' && (
                <Grid item xs={12} md={8}>
                  <Autocomplete
                    multiple
                    options={clientes}
                    getOptionLabel={(option) => `${option.nome} - ${option.telefone || ''}`}
                    value={clientes.filter(c => formData.listaClientesIds.includes(c.id))}
                    onChange={(e, newValue) => {
                      setFormData({
                        ...formData,
                        listaClientesIds: newValue.map(c => c.id)
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Selecionar Clientes"
                        size="small"
                        placeholder="Buscar clientes..."
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Níveis Permitidos</InputLabel>
                  <Select
                    multiple
                    name="niveisPermitidos"
                    value={formData.niveisPermitidos}
                    label="Níveis Permitidos"
                    onChange={handleInputChange}
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
                        <Checkbox checked={formData.niveisPermitidos.indexOf(nivel) > -1} />
                        <ListItemText primary={nivel.toUpperCase()} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Restrições de Serviços/Produtos */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                  Restrições de Serviços
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Serviços Elegíveis</InputLabel>
                  <Select
                    name="servicosElegiveis"
                    value={formData.servicosElegiveis}
                    label="Serviços Elegíveis"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="todos">Todos os serviços</MenuItem>
                    <MenuItem value="lista">Apenas selecionados</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.servicosElegiveis === 'lista' && (
                <Grid item xs={12} md={8}>
                  <Autocomplete
                    multiple
                    options={servicos}
                    getOptionLabel={(option) => `${option.nome} - R$ ${option.preco?.toFixed(2)}`}
                    value={servicos.filter(s => formData.listaServicosIds.includes(s.id))}
                    onChange={(e, newValue) => {
                      setFormData({
                        ...formData,
                        listaServicosIds: newValue.map(s => s.id)
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Selecionar Serviços"
                        size="small"
                        placeholder="Buscar serviços..."
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Opções adicionais */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.ativo}
                        onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      />
                    }
                    label="Cupom ativo"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.primeiroAcesso}
                        onChange={(e) => setFormData({ ...formData, primeiroAcesso: e.target.checked })}
                      />
                    }
                    label="Apenas para primeiro acesso"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={handleSalvar}
              variant="contained"
              sx={{ bgcolor: '#9c27b0' }}
            >
              {cupomEditando ? 'Atualizar' : 'Criar Cupom'}
            </Button>
          </DialogActions>
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

export default GerenciarCupons;
