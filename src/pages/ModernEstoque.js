// src/pages/ModernEstoque.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Snackbar,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';

function ModernEstoque() {
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [produtoToDelete, setProdutoToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categorias, setCategorias] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    totalProdutos: 0,
    valorEstoque: 0,
    produtosBaixo: 0,
    produtosSemEstoque: 0,
  });

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    precoCusto: '',
    precoVenda: '',
    quantidadeEstoque: '',
    unidade: 'un',
    fornecedor: '',
    estoqueMinimo: '',
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    filtrarProdutos();
    calcularStats();
  }, [produtos, searchTerm]);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const produtosData = await firebaseService.getAll('produtos').catch(() => []);
      setProdutos(produtosData || []);
      
      // Extrair categorias únicas
      const cats = [...new Set((produtosData || []).map(p => p.categoria).filter(Boolean))];
      setCategorias(cats);
      
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar estoque');
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

  const filtrarProdutos = () => {
    let filtered = [...produtos];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProdutos(filtered);
  };

  const calcularStats = () => {
    const total = produtos.length;
    const valor = produtos.reduce((acc, p) => acc + (Number(p.precoVenda) * Number(p.quantidadeEstoque || 0)), 0);
    const baixo = produtos.filter(p => Number(p.quantidadeEstoque) <= Number(p.estoqueMinimo || 5)).length;
    const semEstoque = produtos.filter(p => Number(p.quantidadeEstoque) === 0).length;

    setStats({
      totalProdutos: total,
      valorEstoque: valor,
      produtosBaixo: baixo,
      produtosSemEstoque: semEstoque,
    });
  };

  const handleAdd = () => {
    setSelectedProduto(null);
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      precoCusto: '',
      precoVenda: '',
      quantidadeEstoque: '',
      unidade: 'un',
      fornecedor: '',
      estoqueMinimo: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (produto) => {
    setSelectedProduto(produto);
    setFormData({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      categoria: produto.categoria || '',
      precoCusto: produto.precoCusto || '',
      precoVenda: produto.precoVenda || '',
      quantidadeEstoque: produto.quantidadeEstoque || '',
      unidade: produto.unidade || 'un',
      fornecedor: produto.fornecedor || '',
      estoqueMinimo: produto.estoqueMinimo || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    setProdutoToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await firebaseService.delete('produtos', produtoToDelete);
      setProdutos(produtos.filter(p => p.id !== produtoToDelete));
      mostrarSnackbar('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      mostrarSnackbar('Erro ao excluir produto', 'error');
    }
    setOpenDeleteDialog(false);
    setProdutoToDelete(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    // Validações
    if (!formData.nome) {
      mostrarSnackbar('Nome do produto é obrigatório', 'error');
      return;
    }

    const precoCustoNum = parseFloat(formData.precoCusto);
    const precoVendaNum = parseFloat(formData.precoVenda);
    const quantidadeNum = parseInt(formData.quantidadeEstoque);
    const estoqueMinimoNum = parseInt(formData.estoqueMinimo) || 5;

    if (isNaN(precoCustoNum) || precoCustoNum < 0) {
      mostrarSnackbar('Preço de custo inválido', 'error');
      return;
    }

    if (isNaN(precoVendaNum) || precoVendaNum < 0) {
      mostrarSnackbar('Preço de venda inválido', 'error');
      return;
    }

    if (isNaN(quantidadeNum) || quantidadeNum < 0) {
      mostrarSnackbar('Quantidade inválida', 'error');
      return;
    }

    const produtoData = {
      nome: String(formData.nome).trim(),
      descricao: formData.descricao ? String(formData.descricao).trim() : null,
      categoria: formData.categoria ? String(formData.categoria) : null,
      precoCusto: Number(precoCustoNum),
      precoVenda: Number(precoVendaNum),
      quantidadeEstoque: Number(quantidadeNum),
      unidade: String(formData.unidade),
      fornecedor: formData.fornecedor ? String(formData.fornecedor).trim() : null,
      estoqueMinimo: Number(estoqueMinimoNum),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (selectedProduto) {
        await firebaseService.update('produtos', selectedProduto.id, produtoData);
        
        // Atualizar estado local
        const produtosAtualizados = produtos.map(p => 
          p.id === selectedProduto.id ? { ...p, ...produtoData, id: selectedProduto.id } : p
        );
        setProdutos(produtosAtualizados);
        
        mostrarSnackbar('Produto atualizado com sucesso!');
      } else {
        produtoData.dataCriacao = new Date().toISOString();
        
        const novoId = await firebaseService.add('produtos', produtoData);
        setProdutos([...produtos, { ...produtoData, id: novoId }]);
        
        // Atualizar categorias se necessário
        if (produtoData.categoria && !categorias.includes(produtoData.categoria)) {
          setCategorias([...categorias, produtoData.categoria]);
        }
        
        mostrarSnackbar('Produto adicionado com sucesso!');
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      mostrarSnackbar('Erro ao salvar produto', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getEstoqueStatus = (quantidade, minimo) => {
    const qtd = Number(quantidade || 0);
    const min = Number(minimo || 5);
    
    if (qtd === 0) return { label: 'Sem Estoque', color: 'error' };
    if (qtd <= min) return { label: 'Estoque Baixo', color: 'warning' };
    return { label: 'Normal', color: 'success' };
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Estoque
        </Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              color: 'white',
              boxShadow: '0 3px 15px rgba(156,39,176,0.3)',
            }}
          >
            Novo Produto
          </Button>
        </motion.div>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                    <InventoryIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total de Produtos
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'right' }}>
                  {stats.totalProdutos}
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
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Valor em Estoque
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'right', color: '#4caf50' }}>
                  R$ {stats.valorEstoque.toFixed(2)}
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
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                    <WarningIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Estoque Baixo
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'right', color: '#ff9800' }}>
                  {stats.produtosBaixo}
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
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#f44336', mr: 2 }}>
                    <WarningIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Sem Estoque
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'right', color: '#f44336' }}>
                  {stats.produtosSemEstoque}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Barra de Pesquisa */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar produtos por nome, descrição ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#faf5ff' }}>
                  <TableCell><strong>Produto</strong></TableCell>
                  <TableCell><strong>Categoria</strong></TableCell>
                  <TableCell align="right"><strong>Preço Custo</strong></TableCell>
                  <TableCell align="right"><strong>Preço Venda</strong></TableCell>
                  <TableCell align="right"><strong>Lucro</strong></TableCell>
                  <TableCell align="right"><strong>Quantidade</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredProdutos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((produto, index) => {
                      const status = getEstoqueStatus(produto.quantidadeEstoque, produto.estoqueMinimo);
                      const lucro = produto.precoCusto > 0 
                        ? ((Number(produto.precoVenda) - Number(produto.precoCusto)) / Number(produto.precoCusto) * 100).toFixed(1)
                        : '0';
                      
                      return (
                        <motion.tr
                          key={produto.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {produto.nome}
                              </Typography>
                              {produto.descricao && (
                                <Typography variant="caption" color="textSecondary">
                                  {produto.descricao}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {produto.categoria && (
                              <Chip
                                label={produto.categoria}
                                size="small"
                                sx={{ bgcolor: '#f3e5f5', color: '#9c27b0' }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            R$ {Number(produto.precoCusto || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            R$ {Number(produto.precoVenda || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${lucro}%`}
                              size="small"
                              color={parseFloat(lucro) > 50 ? 'success' : 'default'}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {Number(produto.quantidadeEstoque || 0)} {produto.unidade || 'un'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              size="small"
                              color={status.color}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEdit(produto)}
                              sx={{ color: '#ff4081' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(produto.id)}
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                </AnimatePresence>
                
                {filteredProdutos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <InventoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Nenhum produto encontrado
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
            count={filteredProdutos.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </CardContent>
      </Card>

      {/* Dialog de Produto */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {selectedProduto ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Produto"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={formData.categoria}
                    label="Categoria"
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>Nenhuma</em>
                    </MenuItem>
                    {categorias.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                    <MenuItem value="nova">+ Nova Categoria</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={2}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preço de Custo"
                  type="number"
                  value={formData.precoCusto}
                  onChange={(e) => setFormData({ ...formData, precoCusto: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preço de Venda"
                  type="number"
                  value={formData.precoVenda}
                  onChange={(e) => setFormData({ ...formData, precoVenda: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Quantidade em Estoque"
                  type="number"
                  value={formData.quantidadeEstoque}
                  onChange={(e) => setFormData({ ...formData, quantidadeEstoque: e.target.value })}
                  required
                  size="small"
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Unidade</InputLabel>
                  <Select
                    value={formData.unidade}
                    label="Unidade"
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  >
                    <MenuItem value="un">Unidade</MenuItem>
                    <MenuItem value="cx">Caixa</MenuItem>
                    <MenuItem value="lt">Litro</MenuItem>
                    <MenuItem value="ml">Ml</MenuItem>
                    <MenuItem value="kg">Kg</MenuItem>
                    <MenuItem value="g">Grama</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Estoque Mínimo"
                  type="number"
                  value={formData.estoqueMinimo}
                  onChange={(e) => setFormData({ ...formData, estoqueMinimo: e.target.value })}
                  helperText="Alerta quando estoque abaixo deste valor"
                  size="small"
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  size="small"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Tem certeza que deseja excluir este produto?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Esta ação não poderá ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={confirmDelete}
          >
            Excluir
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

export default ModernEstoque;
