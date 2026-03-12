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
  Checkbox,
  Divider,
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
  Print as PrintIcon,
  RemoveShoppingCart as EmptyCartIcon,
  Inventory as InventoryIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente' },
  aprovada: { color: '#2196f3', label: 'Aprovada' },
  entregue: { color: '#4caf50', label: 'Entregue' },
  cancelada: { color: '#f44336', label: 'Cancelada' },
};

// Função utilitária para garantir precisão decimal no estoque
const formatarQuantidade = (valor) => {
  return parseFloat(parseFloat(valor).toFixed(3));
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
  const [openRecebimentoDialog, setOpenRecebimentoDialog] = useState(false);
  const [compraEditando, setCompraEditando] = useState(null);
  const [compraSelecionada, setCompraSelecionada] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estado para controle de recebimento
  const [itensRecebimento, setItensRecebimento] = useState([]);
  const [recebimentoCompleto, setRecebimentoCompleto] = useState(true);

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
      
      const [comprasData, fornecedoresData, produtosData] = await Promise.all([
        firebaseService.getAll('compras').catch(() => []),
        firebaseService.getAll('fornecedores').catch(() => []),
        firebaseService.getAll('produtos').catch(() => []),
      ]);
      
      setCompras(comprasData || []);
      setFornecedores(fornecedoresData || []);
      setProdutos(produtosData || []);
      
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
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
    setNovoItem({
      produtoId: '',
      quantidade: 1,
      valorUnitario: 0,
      total: 0,
    });
  };

  const handleOpenDetalhes = (compra) => {
    setCompraSelecionada(compra);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setCompraSelecionada(null);
  };

  // Abrir diálogo de recebimento
  const handleOpenRecebimento = (compra) => {
    setCompraSelecionada(compra);
    // Inicializar itens de recebimento com quantidades pendentes
    const itensIniciais = compra.itens.map(item => ({
      ...item,
      quantidadeRecebida: formatarQuantidade(item.quantidade), // Por padrão, recebe tudo
      recebido: true, // Por padrão, todos marcados como recebidos
    }));
    setItensRecebimento(itensIniciais);
    setRecebimentoCompleto(true);
    setOpenRecebimentoDialog(true);
  };

  const handleCloseRecebimento = () => {
    setOpenRecebimentoDialog(false);
    setCompraSelecionada(null);
    setItensRecebimento([]);
    setRecebimentoCompleto(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    const updatedItem = { ...novoItem, [name]: value };
    
    if (name === 'produtoId' && value) {
      const produto = produtos.find(p => p.id === value);
      if (produto) {
        updatedItem.valorUnitario = Number(produto.precoCusto) || 0;
        updatedItem.total = Number(updatedItem.quantidade) * Number(updatedItem.valorUnitario);
      }
    } else if (name === 'quantidade' || name === 'valorUnitario') {
      updatedItem.total = Number(updatedItem.quantidade) * Number(updatedItem.valorUnitario);
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

    const produto = produtos.find(p => p.id === novoItem.produtoId);
    
    const itemCompleto = {
      produtoId: novoItem.produtoId,
      produtoNome: produto?.nome || 'Produto',
      quantidade: formatarQuantidade(novoItem.quantidade),
      valorUnitario: Number(novoItem.valorUnitario),
      total: Number(novoItem.quantidade) * Number(novoItem.valorUnitario),
    };

    setFormData(prev => {
      const novosItens = [...prev.itens, itemCompleto];
      const novoTotal = novosItens.reduce((acc, item) => acc + (item.total || 0), 0);
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
      const novoTotal = novosItens.reduce((acc, item) => acc + (item.total || 0), 0);
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
        fornecedorId: String(formData.fornecedorId),
        dataCompra: String(formData.dataCompra),
        valorTotal: Number(formData.valorTotal),
        prazoEntrega: formData.prazoEntrega ? String(formData.prazoEntrega) : null,
        formaPagamento: formData.formaPagamento ? String(formData.formaPagamento) : null,
        observacoes: formData.observacoes ? String(formData.observacoes) : null,
        itens: formData.itens.map(item => ({
          ...item,
          quantidade: formatarQuantidade(item.quantidade),
          valorUnitario: Number(item.valorUnitario),
          total: Number(item.total),
        })),
        updatedAt: new Date().toISOString(),
      };

      if (!dadosParaSalvar.numeroPedido) {
        dadosParaSalvar.numeroPedido = `PED-${Date.now()}`;
      }

      if (compraEditando) {
        await firebaseService.update('compras', compraEditando.id, dadosParaSalvar);
        
        const comprasAtualizadas = compras.map(c => 
          c.id === compraEditando.id ? { ...c, ...dadosParaSalvar, id: compraEditando.id } : c
        );
        setCompras(comprasAtualizadas);
        
        mostrarSnackbar('Compra atualizada com sucesso!');
      } else {
        dadosParaSalvar.dataCriacao = new Date().toISOString();
        
        const novoId = await firebaseService.add('compras', dadosParaSalvar);
        setCompras([...compras, { ...dadosParaSalvar, id: novoId }]);
        
        mostrarSnackbar('Compra criada com sucesso!');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      mostrarSnackbar('Erro ao salvar compra', 'error');
    }
  };

  const handleAtualizarStatus = async (compra, novoStatus) => {
    try {
      await firebaseService.update('compras', compra.id, {
        status: novoStatus,
        updatedAt: new Date().toISOString(),
      });

      setCompras(prev => prev.map(c => 
        c.id === compra.id ? { ...c, status: novoStatus } : c
      ));

      mostrarSnackbar(`Status atualizado para ${statusColors[novoStatus].label}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      mostrarSnackbar('Erro ao atualizar status', 'error');
    }
  };

  // Handler para mudança na quantidade recebida
  const handleQuantidadeRecebidaChange = (index, valor) => {
    const novaQuantidade = Math.max(0, formatarQuantidade(valor) || 0);
    setItensRecebimento(prev => {
      const novosItens = [...prev];
      novosItens[index] = {
        ...novosItens[index],
        quantidadeRecebida: novaQuantidade,
        recebido: novaQuantidade > 0,
      };
      return novosItens;
    });
  };

  // Handler para toggle de item recebido
  const handleToggleRecebido = (index) => {
    setItensRecebimento(prev => {
      const novosItens = [...prev];
      const item = novosItens[index];
      const novoRecebido = !item.recebido;
      novosItens[index] = {
        ...item,
        recebido: novoRecebido,
        quantidadeRecebida: novoRecebido ? formatarQuantidade(item.quantidade) : 0,
      };
      return novosItens;
    });
  };

  // Toggle para recebimento completo/parcial
  const handleToggleRecebimentoCompleto = () => {
    const novoStatus = !recebimentoCompleto;
    setRecebimentoCompleto(novoStatus);
    setItensRecebimento(prev => prev.map(item => ({
      ...item,
      recebido: novoStatus,
      quantidadeRecebida: novoStatus ? formatarQuantidade(item.quantidade) : 0,
    })));
  };

  // Confirmar recebimento e dar baixa no estoque - VERSÃO CORRIGIDA
  const handleConfirmarRecebimento = async () => {
    try {
      const itensRecebidos = itensRecebimento.filter(item => item.recebido && item.quantidadeRecebida > 0);
      
      if (itensRecebidos.length === 0) {
        mostrarSnackbar('Selecione pelo menos um item para receber', 'error');
        return;
      }

      // Atualizar estoque dos produtos - SOMANDO ao estoque existente
      for (const item of itensRecebidos) {
        const produto = produtos.find(p => p.id === item.produtoId);
        if (produto) {
          // Converte para número garantido e soma ao estoque existente
          const estoqueAtual = formatarQuantidade(produto.quantidadeEstoque || 0);
          const quantidadeRecebida = formatarQuantidade(item.quantidadeRecebida || 0);
          const novaQuantidade = formatarQuantidade(estoqueAtual + quantidadeRecebida);
          
          console.log(`Atualizando estoque - Produto: ${produto.nome}`);
          console.log(`  Estoque atual: ${estoqueAtual}`);
          console.log(`  Quantidade recebida: ${quantidadeRecebida}`);
          console.log(`  Novo estoque: ${novaQuantidade}`);
          
          await firebaseService.update('produtos', item.produtoId, {
            quantidadeEstoque: novaQuantidade,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // Verificar se foi recebimento parcial ou completo
      const totalEsperado = compraSelecionada.itens.reduce((acc, item) => acc + formatarQuantidade(item.quantidade), 0);
      const totalRecebido = itensRecebidos.reduce((acc, item) => acc + formatarQuantidade(item.quantidadeRecebida), 0);
      
      const statusFinal = totalRecebido >= totalEsperado ? 'entregue' : 'aprovada';
      const observacaoRecebimento = totalRecebido < totalEsperado 
        ? `\n[Recebimento Parcial em ${new Date().toLocaleDateString('pt-BR')}]: Recebidos ${totalRecebido.toFixed(3)} de ${totalEsperado.toFixed(3)} unidades.`
        : `\n[Recebimento Completo em ${new Date().toLocaleDateString('pt-BR')}]: Todas as ${totalEsperado.toFixed(3)} unidades recebidas.`;

      // Atualizar compra com dados de recebimento
      const dadosAtualizacao = {
        status: statusFinal,
        itensRecebidos: itensRecebimento.map(item => ({
          produtoId: item.produtoId,
          produtoNome: item.produtoNome,
          quantidadeEsperada: formatarQuantidade(item.quantidade),
          quantidadeRecebida: formatarQuantidade(item.quantidadeRecebida),
          recebido: item.recebido,
        })),
        dataRecebimento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        observacoes: (compraSelecionada.observacoes || '') + observacaoRecebimento,
      };

      await firebaseService.update('compras', compraSelecionada.id, dadosAtualizacao);

      // Atualizar estado local das compras
      setCompras(prev => prev.map(c => 
        c.id === compraSelecionada.id 
          ? { ...c, ...dadosAtualizacao, id: compraSelecionada.id } 
          : c
      ));

      // Atualizar estado local dos produtos imediatamente para refletir na UI
      setProdutos(prev => prev.map(p => {
        const itemRecebido = itensRecebidos.find(ir => ir.produtoId === p.id);
        if (itemRecebido) {
          const estoqueAtual = formatarQuantidade(p.quantidadeEstoque || 0);
          const quantidadeRecebida = formatarQuantidade(itemRecebido.quantidadeRecebida || 0);
          return {
            ...p,
            quantidadeEstoque: formatarQuantidade(estoqueAtual + quantidadeRecebida),
          };
        }
        return p;
      }));

      mostrarSnackbar(
        totalRecebido < totalEsperado 
          ? `Recebimento parcial confirmado! ${totalRecebido.toFixed(3)} unidades adicionadas ao estoque.` 
          : `Recebimento completo! ${totalRecebido.toFixed(3)} unidades adicionadas ao estoque.`,
        'success'
      );

      handleCloseRecebimento();
    } catch (error) {
      console.error('Erro ao confirmar recebimento:', error);
      mostrarSnackbar('Erro ao processar recebimento: ' + error.message, 'error');
    }
  };

  // Filtrar compras
  const comprasFiltradas = compras.filter(compra => {
    const fornecedor = fornecedores.find(f => f.id === compra.fornecedorId);
    const matchesTexto = filtro === '' || 
      compra.numeroPedido?.toLowerCase().includes(filtro.toLowerCase()) ||
      fornecedor?.nome?.toLowerCase().includes(filtro.toLowerCase());

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
    valorTotal: compras.reduce((acc, c) => acc + (Number(c.valorTotal) || 0), 0),
    valorPendente: compras
      .filter(c => c.status === 'pendente' || c.status === 'aprovada')
      .reduce((acc, c) => acc + (Number(c.valorTotal) || 0), 0),
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
        <Grid item xs={12} sm={6} md={2.4}>
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
                  Aprovadas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {stats.aprovadas}
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
                  Valor Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  R$ {stats.valorTotal.toFixed(2)}
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
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Valor Pendente
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
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
                  const podeReceber = compra.status === 'pendente' || compra.status === 'aprovada';
                  const jaEntregue = compra.status === 'entregue';
                  
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
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                          R$ {Number(compra.valorTotal).toFixed(2)}
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

                          {!jaEntregue && (
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(compra)}
                                sx={{ color: '#ff4081' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {compra.status === 'pendente' && (
                            <Tooltip title="Aprovar">
                              <IconButton
                                size="small"
                                onClick={() => handleAtualizarStatus(compra, 'aprovada')}
                                sx={{ color: '#2196f3' }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Botão Receber - ativo para pendente OU aprovada, desde que não entregue */}
                          {podeReceber && (
                            <Tooltip title="Receber Mercadoria">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenRecebimento(compra)}
                                sx={{ color: '#4caf50' }}
                              >
                                <ShippingIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {compra.status !== 'cancelada' && !jaEntregue && (
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
                            {p.nome} - R$ {Number(p.precoCusto).toFixed(2)}
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
                      inputProps={{ min: 0.001, step: 0.001 }}
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
                      sx={{ height: 40, bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
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
                          <TableCell align="right">{formatarQuantidade(item.quantidade).toFixed(3)}</TableCell>
                          <TableCell align="right">R$ {Number(item.valorUnitario).toFixed(2)}</TableCell>
                          <TableCell align="right">R$ {Number(item.total).toFixed(2)}</TableCell>
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
                  <Typography variant="h6" sx={{ color: '#4caf50' }}>
                    Valor Total: R$ {Number(formData.valorTotal).toFixed(2)}
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
                    Resumo da Compra
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Fornecedor:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                      <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                        R$ {Number(formData.valorTotal).toFixed(2)}
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
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
                        fontWeight: 500,
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
                  {compraSelecionada.dataRecebimento && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Data do Recebimento</Typography>
                      <Typography variant="body1">
                        {new Date(compraSelecionada.dataRecebimento).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Observações</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {compraSelecionada.observacoes || 'Sem observações'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="h6" sx={{ mb: 2, color: '#9c27b0' }}>Itens da Compra</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Qtd Esperada</TableCell>
                      <TableCell align="right">Qtd Recebida</TableCell>
                      <TableCell align="right">Valor Unit.</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {compraSelecionada.itens?.map((item, index) => {
                      const itemRecebido = compraSelecionada.itensRecebidos?.find(
                        ir => ir.produtoId === item.produtoId
                      );
                      const qtdRecebida = itemRecebido ? formatarQuantidade(itemRecebido.quantidadeRecebida) : 0;
                      const qtdEsperada = formatarQuantidade(item.quantidade);
                      const completamenteRecebido = qtdRecebida >= qtdEsperada;
                      const parcialmenteRecebido = qtdRecebida > 0 && qtdRecebida < qtdEsperada;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>{item.produtoNome}</TableCell>
                          <TableCell align="right">{qtdEsperada.toFixed(3)}</TableCell>
                          <TableCell align="right">
                            <Typography color={completamenteRecebido ? 'success.main' : parcialmenteRecebido ? 'warning.main' : 'textSecondary'}>
                              {qtdRecebida.toFixed(3)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">R$ {Number(item.valorUnitario).toFixed(2)}</TableCell>
                          <TableCell align="right">R$ {Number(item.total).toFixed(2)}</TableCell>
                          <TableCell align="center">
                            {completamenteRecebido ? (
                              <Chip label="Recebido" size="small" color="success" />
                            ) : parcialmenteRecebido ? (
                              <Chip label="Parcial" size="small" color="warning" />
                            ) : (
                              <Chip label="Pendente" size="small" color="default" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell colSpan={4} align="right"><strong>VALOR TOTAL</strong></TableCell>
                      <TableCell align="right">
                        <strong>R$ {Number(compraSelecionada.valorTotal).toFixed(2)}</strong>
                      </TableCell>
                      <TableCell />
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

      {/* Dialog de Recebimento */}
      <Dialog 
        open={openRecebimentoDialog} 
        onClose={handleCloseRecebimento} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon />
            Recebimento de Mercadoria - {compraSelecionada?.numeroPedido}
          </Box>
        </DialogTitle>
        <DialogContent>
          {compraSelecionada && (
            <Box sx={{ mt: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Fornecedor</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {fornecedores.find(f => f.id === compraSelecionada.fornecedorId)?.nome}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Data Prevista</Typography>
                    <Typography variant="body1">
                      {compraSelecionada.prazoEntrega 
                        ? new Date(compraSelecionada.prazoEntrega).toLocaleDateString('pt-BR')
                        : 'Não informada'
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#4caf50' }}>
                  Itens a Receber
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Recebimento Completo
                  </Typography>
                  <Checkbox
                    checked={recebimentoCompleto}
                    onChange={handleToggleRecebimentoCompleto}
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
                  />
                </Box>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={itensRecebimento.every(i => i.recebido)}
                          indeterminate={
                            itensRecebimento.some(i => i.recebido) && 
                            !itensRecebimento.every(i => i.recebido)
                          }
                          onChange={handleToggleRecebimentoCompleto}
                        />
                      </TableCell>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Qtd Esperada</TableCell>
                      <TableCell align="right">Qtd a Receber</TableCell>
                      <TableCell align="right">Estoque Atual</TableCell>
                      <TableCell align="right">Estoque Após</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itensRecebimento.map((item, index) => {
                      const produto = produtos.find(p => p.id === item.produtoId);
                      const estoqueAtual = formatarQuantidade(produto?.quantidadeEstoque || 0);
                      const qtdReceber = formatarQuantidade(item.quantidadeRecebida || 0);
                      const estoqueApos = formatarQuantidade(estoqueAtual + qtdReceber);
                      
                      return (
                        <TableRow 
                          key={index}
                          sx={{ 
                            bgcolor: item.recebido ? '#e8f5e9' : 'inherit',
                            '&:hover': { bgcolor: item.recebido ? '#c8e6c9' : '#f5f5f5' }
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={item.recebido}
                              onChange={() => handleToggleRecebido(index)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.produtoNome}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="textSecondary">
                              {formatarQuantidade(item.quantidade).toFixed(3)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantidadeRecebida}
                              onChange={(e) => handleQuantidadeRecebidaChange(index, e.target.value)}
                              disabled={!item.recebido}
                              inputProps={{ 
                                min: 0, 
                                max: formatarQuantidade(item.quantidade) * 2,
                                step: 0.001
                              }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={estoqueAtual.toFixed(3)} 
                              size="small" 
                              variant="outlined"
                              color="default"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={estoqueApos.toFixed(3)} 
                              size="small"
                              color={item.recebido ? 'success' : 'default'}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Importante:</strong> Ao confirmar o recebimento, o sistema somará automaticamente 
                  as quantidades recebidas ao estoque existente. Exemplo: se você tem 0.800L e recebe 1.000L, 
                  o estoque será atualizado para 1.800L.
                </Typography>
              </Alert>

              {itensRecebimento.some(item => {
                const qtdEsperada = formatarQuantidade(item.quantidade);
                const qtdRecebida = formatarQuantidade(item.quantidadeRecebida);
                return item.recebido && qtdRecebida !== qtdEsperada;
              }) && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Atenção:</strong> Existem itens com quantidades recebidas diferentes do esperado. 
                    Isso será registrado como recebimento parcial.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
          <Button onClick={handleCloseRecebimento} variant="outlined">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmarRecebimento}
            startIcon={<CheckCircleIcon />}
            sx={{ 
              bgcolor: '#4caf50', 
              '&:hover': { bgcolor: '#388e3c' },
              '&:disabled': { bgcolor: '#cccccc' }
            }}
            disabled={!itensRecebimento.some(i => i.recebido && i.quantidadeRecebida > 0)}
          >
            Confirmar Recebimento e Atualizar Estoque
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
