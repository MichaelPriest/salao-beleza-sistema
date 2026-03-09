// src/pages/ModernCompras.js
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
  Divider,
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
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  RemoveShoppingCart as EmptyCartIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente' },
  aprovada: { color: '#2196f3', label: 'Aprovada' },
  entregue: { color: '#4caf50', label: 'Entregue' },
  cancelada: { color: '#f44336', label: 'Cancelada' },
};

function ModernCompras() {
  const [loading, setLoading] = useState(true);
  const [compras, setCompras] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [compraEditando, setCompraEditando] = useState(null);
  const [compraSelecionada, setCompraSelecionada] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    fornecedorId: '',
    dataCompra: new Date().toISOString().split('T')[0],
    status: 'pendente',
    itens: [],
    valorTotal: 0,
    observacoes: '',
    formaPagamento: '',
    prazoEntrega: '',
  });

  const [novoItem, setNovoItem] = useState({
    produtoId: '',
    quantidade: 1,
    valorUnitario: 0,
    total: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [comprasRes, fornecedoresRes, produtosRes] = await Promise.all([
        api.get('/compras'),
        api.get('/fornecedores'),
        api.get('/produtos'),
      ]);
      setCompras(comprasRes.data || []);
      setFornecedores(fornecedoresRes.data || []);
      setProdutos(produtosRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
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

  const handleOpenDialog = (compra = null) => {
    if (compra) {
      setCompraEditando(compra);
      setFormData({
        fornecedorId: compra.fornecedorId || '',
        dataCompra: compra.dataCompra || new Date().toISOString().split('T')[0],
        status: compra.status || 'pendente',
        itens: compra.itens || [],
        valorTotal: compra.valorTotal || 0,
        observacoes: compra.observacoes || '',
        formaPagamento: compra.formaPagamento || '',
        prazoEntrega: compra.prazoEntrega || '',
      });
    } else {
      setCompraEditando(null);
      setFormData({
        fornecedorId: '',
        dataCompra: new Date().toISOString().split('T')[0],
        status: 'pendente',
        itens: [],
        valorTotal: 0,
        observacoes: '',
        formaPagamento: '',
        prazoEntrega: '',
      });
      setActiveStep(0);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCompraEditando(null);
  };

  const handleOpenDetalhes = (compra) => {
    setCompraSelecionada(compra);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setCompraSelecionada(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    const updatedItem = { ...novoItem, [name]: value };
    
    if (name === 'produtoId') {
      const produto = produtos.find(p => p.id === parseInt(value));
      if (produto) {
        updatedItem.valorUnitario = produto.precoCusto || 0;
        updatedItem.total = updatedItem.quantidade * updatedItem.valorUnitario;
      }
    } else if (name === 'quantidade' || name === 'valorUnitario') {
      updatedItem.total = updatedItem.quantidade * updatedItem.valorUnitario;
    }
    
    setNovoItem(updatedItem);
  };

  const handleAdicionarItem = () => {
    if (!novoItem.produtoId) {
      mostrarSnackbar('Selecione um produto', 'error');
      return;
    }

    if (novoItem.quantidade <= 0) {
      mostrarSnackbar('Quantidade deve ser maior que zero', 'error');
      return;
    }

    const produto = produtos.find(p => p.id === parseInt(novoItem.produtoId));
    
    const itemCompleto = {
      ...novoItem,
      produtoId: parseInt(novoItem.produtoId),
      produtoNome: produto?.nome || 'Produto',
      quantidade: parseFloat(novoItem.quantidade),
      valorUnitario: parseFloat(novoItem.valorUnitario),
      total: parseFloat(novoItem.quantidade * novoItem.valorUnitario),
    };

    setFormData(prev => {
      const novosItens = [...prev.itens, itemCompleto];
      const novoTotal = novosItens.reduce((acc, item) => acc + item.total, 0);
      return {
        ...prev,
        itens: novosItens,
        valorTotal: novoTotal,
      };
    });

    setNovoItem({
      produtoId: '',
      quantidade: 1,
      valorUnitario: 0,
      total: 0,
    });
  };

  const handleRemoverItem = (index) => {
    setFormData(prev => {
      const novosItens = prev.itens.filter((_, i) => i !== index);
      const novoTotal = novosItens.reduce((acc, item) => acc + item.total, 0);
      return {
        ...prev,
        itens: novosItens,
        valorTotal: novoTotal,
      };
    });
  };

  const handleSalvar = async () => {
    try {
      if (!formData.fornecedorId) {
        mostrarSnackbar('Selecione um fornecedor', 'error');
        return;
      }

      if (formData.itens.length === 0) {
        mostrarSnackbar('Adicione pelo menos um item', 'error');
        return;
      }

      const dadosParaSalvar = {
        ...formData,
        fornecedorId: parseInt(formData.fornecedorId),
        dataCompra: formData.dataCompra,
        updatedAt: new Date().toISOString(),
      };

      if (compraEditando) {
        await api.patch(`/compras/${compraEditando.id}`, dadosParaSalvar);
        mostrarSnackbar('Compra atualizada com sucesso!');
      } else {
        dadosParaSalvar.id = Date.now();
        dadosParaSalvar.dataCriacao = new Date().toISOString();
        dadosParaSalvar.numeroPedido = `PED-${Date.now()}`;
        await api.post('/compras', dadosParaSalvar);
        mostrarSnackbar('Compra criada com sucesso!');
      }

      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      mostrarSnackbar('Erro ao salvar compra', 'error');
    }
  };

  const handleAtualizarStatus = async (compra, novoStatus) => {
    try {
      await api.patch(`/compras/${compra.id}`, {
        status: novoStatus,
        updatedAt: new Date().toISOString(),
      });
      mostrarSnackbar(`Status atualizado para ${statusColors[novoStatus].label}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      mostrarSnackbar('Erro ao atualizar status', 'error');
    }
  };

  // Filtrar compras
  const comprasFiltradas = compras.filter(compra => {
    const matchesTexto = filtro === '' || 
      compra.numeroPedido?.toLowerCase().includes(filtro.toLowerCase()) ||
      fornecedores.find(f => f.id === compra.fornecedorId)?.nome?.toLowerCase().includes(filtro.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || compra.status === filtroStatus;

    return matchesTexto && matchesStatus;
  });

  // Paginação
  const paginatedCompras = comprasFiltradas.slice(
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
    total: compras.length,
    pendentes: compras.filter(c => c.status === 'pendente').length,
    aprovadas: compras.filter(c => c.status === 'aprovada').length,
    entregues: compras.filter(c => c.status === 'entregue').length,
    valorTotal: compras.reduce((acc, c) => acc + (c.valorTotal || 0), 0),
    valorPendente: compras.filter(c => c.status === 'pendente').reduce((acc, c) => acc + (c.valorTotal || 0), 0),
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
            Compras
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie as compras de produtos e materiais
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
        >
          Nova Compra
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Compras
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
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

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Valor Pendente
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336' }}>
                  R$ {stats.valorPendente.toFixed(2)}
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por número do pedido ou fornecedor..."
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
                <InputLabel>Filtrar por Status</InputLabel>
                <Select
                  value={filtroStatus}
                  label="Filtrar por Status"
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <MenuItem value="todos">Todos os Status</MenuItem>
                  {Object.keys(statusColors).map(status => (
                    <MenuItem key={status} value={status}>
                      {statusColors[status].label}
                    </MenuItem>
                  ))}
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

      {/* Tabela de Compras */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Nº Pedido</strong></TableCell>
                <TableCell><strong>Fornecedor</strong></TableCell>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Valor Total</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Itens</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {paginatedCompras.map((compra, index) => {
                  const fornecedor = fornecedores.find(f => f.id === compra.fornecedorId);
                  return (
                    <motion.tr
                      key={compra.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {compra.numeroPedido}
                        </Typography>
                      </TableCell>
                      <TableCell>{fornecedor?.nome || 'Fornecedor não encontrado'}</TableCell>
                      <TableCell>
                        {new Date(compra.dataCompra).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          R$ {compra.valorTotal?.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusColors[compra.status]?.label || compra.status}
                          size="small"
                          sx={{
                            bgcolor: `${statusColors[compra.status]?.color}20`,
                            color: statusColors[compra.status]?.color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${compra.itens?.length || 0} itens`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Ver Detalhes">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetalhes(compra)}
                              sx={{ color: '#9c27b0' }}
                            >
                              <ReceiptIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(compra)}
                              sx={{ color: '#ff4081' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          {compra.status === 'pendente' && (
                            <>
                              <Tooltip title="Aprovar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleAtualizarStatus(compra, 'aprovada')}
                                  sx={{ color: '#2196f3' }}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Receber">
                                <IconButton
                                  size="small"
                                  onClick={() => handleAtualizarStatus(compra, 'entregue')}
                                  sx={{ color: '#4caf50' }}
                                >
                                  <ShippingIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          {compra.status !== 'cancelada' && compra.status !== 'entregue' && (
                            <Tooltip title="Cancelar">
                              <IconButton
                                size="small"
                                onClick={() => handleAtualizarStatus(compra, 'cancelada')}
                                sx={{ color: '#f44336' }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {paginatedCompras.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <EmptyCartIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      Nenhuma compra encontrada
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
          count={comprasFiltradas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {compraEditando ? 'Editar Compra' : 'Nova Compra'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Dados da Compra</StepLabel>
              <StepContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" required>
                      <InputLabel>Fornecedor</InputLabel>
                      <Select
                        name="fornecedorId"
                        value={formData.fornecedorId}
                        label="Fornecedor *"
                        onChange={handleInputChange}
                      >
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
                      type="date"
                      label="Data da Compra"
                      name="dataCompra"
                      value={formData.dataCompra}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Prazo de Entrega"
                      name="prazoEntrega"
                      type="date"
                      value={formData.prazoEntrega}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Forma de Pagamento</InputLabel>
                      <Select
                        name="formaPagamento"
                        value={formData.formaPagamento}
                        label="Forma de Pagamento"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="dinheiro">Dinheiro</MenuItem>
                        <MenuItem value="cartao_credito">Cartão de Crédito</MenuItem>
                        <MenuItem value="cartao_debito">Cartão de Débito</MenuItem>
                        <MenuItem value="pix">PIX</MenuItem>
                        <MenuItem value="boleto">Boleto</MenuItem>
                        <MenuItem value="transferencia">Transferência</MenuItem>
                      </Select>
                    </FormControl>
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
                      placeholder="Observações sobre a compra..."
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                    sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                  >
                    Próximo
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Itens da Compra</StepLabel>
              <StepContent>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Produto</InputLabel>
                      <Select
                        name="produtoId"
                        value={novoItem.produtoId}
                        label="Produto"
                        onChange={handleItemChange}
                      >
                        {produtos.map(p => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.nome} - R$ {p.precoCusto?.toFixed(2)}
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
                      name="quantidade"
                      value={novoItem.quantidade}
                      onChange={handleItemChange}
                      size="small"
                      inputProps={{ min: 1, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Valor Unit."
                      name="valorUnitario"
                      value={novoItem.valorUnitario}
                      onChange={handleItemChange}
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Total"
                      value={novoItem.total.toFixed(2)}
                      size="small"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleAdicionarItem}
                      sx={{ height: 40 }}
                    >
                      Adicionar
                    </Button>
                  </Grid>
                </Grid>

                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Produto</TableCell>
                        <TableCell align="right">Qtd</TableCell>
                        <TableCell align="right">Valor Unit.</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.itens.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.produtoNome}</TableCell>
                          <TableCell align="right">{item.quantidade}</TableCell>
                          <TableCell align="right">R$ {item.valorUnitario.toFixed(2)}</TableCell>
                          <TableCell align="right">R$ {item.total.toFixed(2)}</TableCell>
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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Valor Total: R$ {formData.valorTotal.toFixed(2)}
                  </Typography>
                  <Box>
                    <Button
                      onClick={() => setActiveStep(0)}
                      sx={{ mr: 1 }}
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(2)}
                      disabled={formData.itens.length === 0}
                      sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                    >
                      Próximo
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Revisão e Confirmação</StepLabel>
              <StepContent>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Resumo da Compra
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Fornecedor:</Typography>
                      <Typography variant="body2">
                        {fornecedores.find(f => f.id === formData.fornecedorId)?.nome}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Data:</Typography>
                      <Typography variant="body2">
                        {new Date(formData.dataCompra).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Total de Itens:</Typography>
                      <Typography variant="body2">{formData.itens.length}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Valor Total:</Typography>
                      <Typography variant="h6" sx={{ color: '#4caf50' }}>
                        R$ {formData.valorTotal.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={() => setActiveStep(1)}>
                    Voltar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSalvar}
                    sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                  >
                    {compraEditando ? 'Atualizar' : 'Finalizar Compra'}
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

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes da Compra - {compraSelecionada?.numeroPedido}
        </DialogTitle>
        <DialogContent>
          {compraSelecionada && (
            <Box sx={{ mt: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Fornecedor</Typography>
                    <Typography variant="body1">
                      {fornecedores.find(f => f.id === compraSelecionada.fornecedorId)?.nome}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Data da Compra</Typography>
                    <Typography variant="body1">
                      {new Date(compraSelecionada.dataCompra).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                    <Chip
                      label={statusColors[compraSelecionada.status]?.label}
                      size="small"
                      sx={{
                        bgcolor: `${statusColors[compraSelecionada.status]?.color}20`,
                        color: statusColors[compraSelecionada.status]?.color,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Forma de Pagamento</Typography>
                    <Typography variant="body1">
                      {compraSelecionada.formaPagamento || 'Não informada'}
                    </Typography>
                  </Grid>
                  {compraSelecionada.prazoEntrega && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Prazo de Entrega</Typography>
                      <Typography variant="body1">
                        {new Date(compraSelecionada.prazoEntrega).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Observações</Typography>
                    <Typography variant="body2">
                      {compraSelecionada.observacoes || 'Sem observações'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="h6" sx={{ mb: 2 }}>Itens da Compra</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Valor Unit.</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {compraSelecionada.itens?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.produtoNome}</TableCell>
                        <TableCell align="right">{item.quantidade}</TableCell>
                        <TableCell align="right">R$ {item.valorUnitario.toFixed(2)}</TableCell>
                        <TableCell align="right">R$ {item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell colSpan={3} align="right"><strong>VALOR TOTAL</strong></TableCell>
                      <TableCell align="right"><strong>R$ {compraSelecionada.valorTotal?.toFixed(2)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Imprimir
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
  );
}

export default ModernCompras;