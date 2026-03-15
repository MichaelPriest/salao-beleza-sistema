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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  LinearProgress,
  TablePagination,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Warehouse as WarehouseIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  Note as NoteIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente', icon: <ScheduleIcon /> },
  conferido: { color: '#2196f3', label: 'Conferido', icon: <VisibilityIcon /> },
  finalizado: { color: '#4caf50', label: 'Finalizado', icon: <CheckCircleIcon /> },
  cancelado: { color: '#f44336', label: 'Cancelado', icon: <CancelIcon /> },
};

function Entradas() {
  const [loading, setLoading] = useState(true);
  const [entradas, setEntradas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [compras, setCompras] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [openConferenciaDialog, setOpenConferenciaDialog] = useState(false);
  const [entradaEditando, setEntradaEditando] = useState(null);
  const [entradaSelecionada, setEntradaSelecionada] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      
      // Registrar erro na auditoria
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Se selecionar uma compra, carregar os itens
    if (name === 'compraId' && value) {
      const compra = compras.find(c => c.id === value);
      if (compra) {
        setFormData(prev => ({
          ...prev,
          fornecedorId: compra.fornecedorId,
          itens: (compra.itens || []).map(item => ({
            ...item,
            quantidadeConferida: 0,
            lote: '',
            dataValidade: '',
          })),
          valorTotal: Number(compra.valorTotal) || 0,
        }));
      }
    }
  };

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const novosItens = [...prev.itens];
      novosItens[index] = { ...novosItens[index], [name]: value };
      
      // Calcular divergência se for quantidade conferida
      if (name === 'quantidadeConferida') {
        const quantidade = Number(value) || 0;
        const prevista = Number(novosItens[index].quantidade) || 0;
        novosItens[index].divergencia = quantidade - prevista;
      }
      
      return { ...prev, itens: novosItens };
    });
  };

  const handleAdicionarItemManual = () => {
    if (!novoItem.produtoId) {
      mostrarSnackbar('Selecione um produto', 'error');
      return;
    }

    const quantidade = Number(novoItem.quantidade);
    if (quantidade <= 0) {
      mostrarSnackbar('Quantidade deve ser maior que zero', 'error');
      return;
    }

    const produto = produtos.find(p => p.id === novoItem.produtoId);
    
    const itemCompleto = {
      ...novoItem,
      produtoId: String(novoItem.produtoId),
      produtoNome: produto?.nome || 'Produto',
      quantidade: Number(quantidade),
      quantidadeConferida: 0,
      divergencia: 0,
      valorUnitario: Number(produto?.precoCusto) || 0,
      total: quantidade * (Number(produto?.precoCusto) || 0),
      lote: novoItem.lote || '',
      dataFabricacao: novoItem.dataFabricacao || '',
      dataValidade: novoItem.dataValidade || '',
      localizacao: novoItem.localizacao || '',
    };

    setFormData(prev => {
      const novosItens = [...prev.itens, itemCompleto];
      const novoTotal = novosItens.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
      return {
        ...prev,
        itens: novosItens,
        valorTotal: novoTotal,
      };
    });

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

  const handleRemoverItem = (index) => {
    setFormData(prev => {
      const novosItens = prev.itens.filter((_, i) => i !== index);
      const novoTotal = novosItens.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
      return {
        ...prev,
        itens: novosItens,
        valorTotal: novoTotal,
      };
    });
  };

  const handleFinalizarConferencia = async () => {
    try {
      if (!entradaSelecionada || !entradaSelecionada.id) {
        mostrarSnackbar('Entrada inválida', 'error');
        return;
      }

      // Registrar ação na auditoria
      await auditoriaService.registrar('conferencia_entrada', {
        entidade: 'entradas',
        entidadeId: entradaSelecionada.id,
        detalhes: `Conferência de entrada: ${entradaSelecionada.numeroEntrada}`,
        dados: {
          itens: formData.itens
        }
      });

      // Verificar se há divergências
      const temDivergencia = formData.itens.some(item => (item.divergencia || 0) !== 0);
      
      const dadosAtualizados = {
        ...entradaSelecionada,
        itens: formData.itens,
        status: temDivergencia ? 'conferido' : 'finalizado',
        dataConferencia: new Date().toISOString(),
        responsavelConferencia: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
        updatedAt: new Date().toISOString(),
      };

      await firebaseService.update('entradas', entradaSelecionada.id, dadosAtualizados);

      // Registrar atualização na auditoria
      await auditoriaService.registrarAtualizacao(
        'entradas',
        entradaSelecionada.id,
        entradaSelecionada,
        dadosAtualizados,
        temDivergencia ? 'Conferência com divergências' : 'Conferência finalizada'
      );

      // Atualizar estoque dos produtos
      for (const item of formData.itens) {
        if (item.quantidadeConferida > 0) {
          const produto = produtos.find(p => p.id === item.produtoId);
          if (produto) {
            const novaQuantidade = (Number(produto.quantidadeEstoque) || 0) + Number(item.quantidadeConferida);
            await firebaseService.update('produtos', item.produtoId, {
              quantidadeEstoque: novaQuantidade,
              updatedAt: new Date().toISOString(),
            });
            
            // Atualizar estado local dos produtos
            setProdutos(prev => prev.map(p => 
              p.id === item.produtoId 
                ? { ...p, quantidadeEstoque: novaQuantidade }
                : p
            ));
          }
        }
      }

      // Atualizar estado local das entradas
      setEntradas(prev => prev.map(e => 
        e.id === entradaSelecionada.id ? dadosAtualizados : e
      ));

      mostrarSnackbar(
        temDivergencia 
          ? 'Conferência finalizada com divergências' 
          : 'Entrada finalizada com sucesso!'
      );
      
      handleCloseConferencia();
    } catch (error) {
      console.error('Erro ao finalizar conferência:', error);
      mostrarSnackbar('Erro ao finalizar conferência', 'error');
      
      // Registrar erro na auditoria
      await auditoriaService.registrarErro(error, { 
        acao: 'finalizar_conferencia',
        entradaId: entradaSelecionada?.id
      });
    }
  };

  const handleSalvar = async () => {
    try {
      if (formData.itens.length === 0) {
        mostrarSnackbar('Adicione pelo menos um item', 'error');
        return;
      }

      // Preparar dados para salvar
      const dadosParaSalvar = {
        ...formData,
        fornecedorId: formData.fornecedorId ? String(formData.fornecedorId) : null,
        compraId: formData.compraId ? String(formData.compraId) : null,
        dataEntrada: String(formData.dataEntrada),
        dataPrevista: formData.dataPrevista ? String(formData.dataPrevista) : null,
        tipo: String(formData.tipo),
        status: String(formData.status),
        responsavel: String(formData.responsavel),
        documento: formData.documento ? String(formData.documento) : null,
        observacoes: formData.observacoes ? String(formData.observacoes) : null,
        valorTotal: Number(formData.valorTotal) || 0,
        itens: formData.itens.map(item => ({
          ...item,
          produtoId: String(item.produtoId),
          quantidade: Number(item.quantidade),
          quantidadeConferida: Number(item.quantidadeConferida || 0),
          divergencia: Number(item.divergencia || 0),
          valorUnitario: Number(item.valorUnitario || 0),
          total: Number(item.total || 0),
          lote: item.lote || null,
          dataValidade: item.dataValidade || null,
        })),
        updatedAt: new Date().toISOString(),
      };

      if (entradaEditando) {
        // Buscar dados antigos para auditoria
        const entradaAntiga = { ...entradaEditando };
        
        await firebaseService.update('entradas', entradaEditando.id, dadosParaSalvar);
        
        // Registrar atualização na auditoria
        await auditoriaService.registrarAtualizacao(
          'entradas',
          entradaEditando.id,
          entradaAntiga,
          dadosParaSalvar,
          `Atualização de entrada: ${formData.numeroEntrada}`
        );
        
        // Atualizar estado local
        setEntradas(prev => prev.map(e => 
          e.id === entradaEditando.id ? { ...e, ...dadosParaSalvar, id: entradaEditando.id } : e
        ));
        
        mostrarSnackbar('Entrada atualizada com sucesso!');
      } else {
        dadosParaSalvar.dataCriacao = new Date().toISOString();
        
        const novoId = await firebaseService.add('entradas', dadosParaSalvar);
        
        // Registrar criação na auditoria
        await auditoriaService.registrarCriacao(
          'entradas',
          novoId,
          dadosParaSalvar,
          `Criação de entrada: ${formData.numeroEntrada}`
        );
        
        setEntradas([...entradas, { ...dadosParaSalvar, id: novoId }]);
        
        mostrarSnackbar('Entrada registrada com sucesso!');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      mostrarSnackbar('Erro ao salvar entrada', 'error');
      
      // Registrar erro na auditoria
      await auditoriaService.registrarErro(error, { 
        acao: entradaEditando ? 'atualizar_entrada' : 'criar_entrada',
        dados: formData
      });
    }
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

  // Paginação
  const paginatedEntradas = entradasFiltradas.slice(
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

  // Estatísticas
  const stats = {
    total: entradas.length,
    pendentes: entradas.filter(e => e.status === 'pendente').length,
    conferidas: entradas.filter(e => e.status === 'conferido').length,
    finalizadas: entradas.filter(e => e.status === 'finalizado').length,
    valorTotal: entradas.reduce((acc, e) => acc + (Number(e.valorTotal) || 0), 0),
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Entradas no Estoque
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Registre e confira todas as entradas de produtos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
        >
          Nova Entrada
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Entradas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pendentes
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {stats.pendentes}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Conferidas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {stats.conferidas}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Finalizadas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.finalizadas}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Valor Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  R$ {stats.valorTotal.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por número da entrada ou documento..."
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroStatus}
                  label="Status"
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  {Object.keys(statusColors).map(status => (
                    <MenuItem key={status} value={status}>
                      {statusColors[status].label}
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
                  label="Período"
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="semana">Últimos 7 dias</MenuItem>
                  <MenuItem value="mes">Últimos 30 dias</MenuItem>
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

      {/* Tabela de Entradas */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Nº Entrada</strong></TableCell>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Fornecedor</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell align="right"><strong>Itens</strong></TableCell>
                <TableCell align="right"><strong>Valor</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {paginatedEntradas.map((entrada, index) => {
                  const fornecedor = fornecedores.find(f => f.id === entrada.fornecedorId);
                  return (
                    <motion.tr
                      key={entrada.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {entrada.numeroEntrada}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {entrada.documento}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {entrada.dataEntrada ? new Date(entrada.dataEntrada).toLocaleDateString('pt-BR') : '—'}
                      </TableCell>
                      <TableCell>{fornecedor?.nome || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={entrada.tipo === 'compra' ? 'Compra' : 'Manual'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {entrada.itens?.length || 0} itens
                      </TableCell>
                      <TableCell align="right">
                        R$ {Number(entrada.valorTotal || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusColors[entrada.status]?.label || entrada.status}
                          size="small"
                          sx={{
                            bgcolor: `${statusColors[entrada.status]?.color}20`,
                            color: statusColors[entrada.status]?.color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Ver Detalhes">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetalhes(entrada)}
                              sx={{ color: '#9c27b0' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>

                          {entrada.status === 'pendente' && (
                            <Tooltip title="Conferir Entrada">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenConferencia(entrada)}
                                sx={{ color: '#2196f3' }}
                              >
                                <QrCodeIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Imprimir">
                            <IconButton
                              size="small"
                              onClick={() => window.print()}
                              sx={{ color: '#4caf50' }}
                            >
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>

                          {entrada.status === 'pendente' && (
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(entrada)}
                                sx={{ color: '#ff4081' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {paginatedEntradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <WarehouseIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      Nenhuma entrada encontrada
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
          count={entradasFiltradas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      {/* Dialog de Nova Entrada */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {entradaEditando ? 'Editar Entrada' : 'Nova Entrada no Estoque'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Informações da Entrada</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Número da Entrada"
                      name="numeroEntrada"
                      value={formData.numeroEntrada}
                      onChange={handleInputChange}
                      size="small"
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        name="tipo"
                        value={formData.tipo}
                        label="Tipo"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="compra">Compra</MenuItem>
                        <MenuItem value="manual">Entrada Manual</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.tipo === 'compra' ? (
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Selecionar Compra</InputLabel>
                        <Select
                          name="compraId"
                          value={formData.compraId}
                          label="Selecionar Compra"
                          onChange={handleInputChange}
                        >
                          {compras
                            .filter(c => c.status === 'entregue' || c.status === 'aprovada')
                            .map(compra => (
                              <MenuItem key={compra.id} value={compra.id}>
                                {compra.numeroPedido} - R$ {Number(compra.valorTotal || 0).toFixed(2)}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  ) : (
                    <>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Fornecedor</InputLabel>
                          <Select
                            name="fornecedorId"
                            value={formData.fornecedorId}
                            label="Fornecedor"
                            onChange={handleInputChange}
                          >
                            <MenuItem value="">Nenhum</MenuItem>
                            {fornecedores.map(f => (
                              <MenuItem key={f.id} value={f.id}>
                                {f.nome}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Documento (NF/Protocolo)"
                          name="documento"
                          value={formData.documento}
                          onChange={handleInputChange}
                          size="small"
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Data da Entrada"
                      name="dataEntrada"
                      value={formData.dataEntrada}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Data Prevista"
                      name="dataPrevista"
                      value={formData.dataPrevista}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Observações"
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                      size="small"
                      placeholder="Observações sobre a entrada..."
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                    sx={{ bgcolor: '#9c27b0' }}
                  >
                    Próximo
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Itens da Entrada</StepLabel>
              <StepContent>
                {formData.tipo === 'manual' && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#9c27b0' }}>
                      Adicionar Item Manualmente
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Produto</InputLabel>
                          <Select
                            value={novoItem.produtoId}
                            label="Produto"
                            onChange={(e) => setNovoItem({ ...novoItem, produtoId: e.target.value })}
                          >
                            {produtos.map(p => (
                              <MenuItem key={p.id} value={p.id}>
                                {p.nome} - R$ {Number(p.precoCusto || 0).toFixed(2)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={6} md={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Qtd"
                          value={novoItem.quantidade}
                          onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
                          size="small"
                          inputProps={{ min: 1 }}
                        />
                      </Grid>

                      <Grid item xs={6} md={2}>
                        <TextField
                          fullWidth
                          label="Lote"
                          value={novoItem.lote}
                          onChange={(e) => setNovoItem({ ...novoItem, lote: e.target.value })}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={6} md={2}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Validade"
                          value={novoItem.dataValidade}
                          onChange={(e) => setNovoItem({ ...novoItem, dataValidade: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          onClick={handleAdicionarItemManual}
                          size="small"
                          sx={{ bgcolor: '#9c27b0' }}
                        >
                          Adicionar Item
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Produto</TableCell>
                        <TableCell align="right">Qtd</TableCell>
                        <TableCell>Lote</TableCell>
                        <TableCell>Validade</TableCell>
                        <TableCell align="center"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.itens.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.produtoNome}</TableCell>
                          <TableCell align="right">{item.quantidade}</TableCell>
                          <TableCell>{item.lote || '—'}</TableCell>
                          <TableCell>
                            {item.dataValidade 
                              ? new Date(item.dataValidade).toLocaleDateString('pt-BR')
                              : '—'}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoverItem(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {formData.itens.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                              Nenhum item adicionado
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={() => setActiveStep(0)}>Voltar</Button>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(2)}
                    disabled={formData.itens.length === 0}
                    sx={{ bgcolor: '#9c27b0' }}
                  >
                    Revisar
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Revisão e Finalização</StepLabel>
              <StepContent>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
                    Resumo da Entrada
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Número
                      </Typography>
                      <Typography variant="body2">{formData.numeroEntrada}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Data
                      </Typography>
                      <Typography variant="body2">
                        {formData.dataEntrada ? new Date(formData.dataEntrada).toLocaleDateString('pt-BR') : '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Total de Itens
                      </Typography>
                      <Typography variant="body2">{formData.itens.length}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Valor Total
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#4caf50' }}>
                        R$ {Number(formData.valorTotal || 0).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={() => setActiveStep(1)}>Voltar</Button>
                  <Button
                    variant="contained"
                    onClick={handleSalvar}
                    sx={{ bgcolor: '#9c27b0' }}
                  >
                    {entradaEditando ? 'Atualizar' : 'Registrar Entrada'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Conferência */}
      <Dialog open={openConferenciaDialog} onClose={handleCloseConferencia} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white' }}>
          Conferir Entrada - {entradaSelecionada?.numeroEntrada}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Confira cada item e registre as quantidades recebidas
            </Alert>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Produto</strong></TableCell>
                    <TableCell align="right"><strong>Qtd. Prevista</strong></TableCell>
                    <TableCell align="right"><strong>Qtd. Conferida</strong></TableCell>
                    <TableCell align="right"><strong>Divergência</strong></TableCell>
                    <TableCell><strong>Lote</strong></TableCell>
                    <TableCell><strong>Validade</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entradaSelecionada?.itens?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.produtoNome}</TableCell>
                      <TableCell align="right">{item.quantidade}</TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={formData.itens[index]?.quantidadeConferida || 0}
                          onChange={(e) => handleItemChange({
                            target: { name: 'quantidadeConferida', value: e.target.value }
                          }, index)}
                          inputProps={{ min: 0, style: { width: 80 } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={formData.itens[index]?.divergencia || 0}
                          size="small"
                          color={
                            (formData.itens[index]?.divergencia || 0) === 0
                              ? 'success'
                              : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={formData.itens[index]?.lote || ''}
                          onChange={(e) => handleItemChange({
                            target: { name: 'lote', value: e.target.value }
                          }, index)}
                          placeholder="Lote"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          size="small"
                          value={formData.itens[index]?.dataValidade || ''}
                          onChange={(e) => handleItemChange({
                            target: { name: 'dataValidade', value: e.target.value }
                          }, index)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConferencia}>Cancelar</Button>
          <Button
            onClick={handleFinalizarConferencia}
            variant="contained"
            color="primary"
          >
            Finalizar Conferência
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes da Entrada - {entradaSelecionada?.numeroEntrada}
        </DialogTitle>
        <DialogContent>
          {entradaSelecionada && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Número da Entrada
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {entradaSelecionada.numeroEntrada}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Data da Entrada
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {entradaSelecionada.dataEntrada ? new Date(entradaSelecionada.dataEntrada).toLocaleDateString('pt-BR') : '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Fornecedor
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {fornecedores.find(f => f.id === entradaSelecionada.fornecedorId)?.nome || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Documento
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {entradaSelecionada.documento || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Responsável
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {entradaSelecionada.responsavel || '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={statusColors[entradaSelecionada.status]?.label || entradaSelecionada.status}
                    size="small"
                    sx={{
                      bgcolor: `${statusColors[entradaSelecionada.status]?.color}20`,
                      color: statusColors[entradaSelecionada.status]?.color,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                    Observações
                  </Typography>
                  <Typography variant="body2">
                    {entradaSelecionada.observacoes || 'Sem observações'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 2, color: '#9c27b0' }}>
                    Itens da Entrada
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell><strong>Produto</strong></TableCell>
                          <TableCell align="right"><strong>Qtd.</strong></TableCell>
                          <TableCell align="right"><strong>Qtd. Conferida</strong></TableCell>
                          <TableCell align="right"><strong>Divergência</strong></TableCell>
                          <TableCell><strong>Lote</strong></TableCell>
                          <TableCell><strong>Validade</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {entradaSelecionada.itens?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.produtoNome}</TableCell>
                            <TableCell align="right">{item.quantidade}</TableCell>
                            <TableCell align="right">{item.quantidadeConferida || 0}</TableCell>
                            <TableCell align="right">
                              <Chip
                                label={item.divergencia || 0}
                                size="small"
                                color={(item.divergencia || 0) === 0 ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>{item.lote || '—'}</TableCell>
                            <TableCell>
                              {item.dataValidade 
                                ? new Date(item.dataValidade).toLocaleDateString('pt-BR')
                                : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {entradaSelecionada.dataConferencia && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Conferido por {entradaSelecionada.responsavelConferencia} em{' '}
                      {new Date(entradaSelecionada.dataConferencia).toLocaleString('pt-BR')}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
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
  );
}

export default Entradas;
