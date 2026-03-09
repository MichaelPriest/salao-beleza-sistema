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
  CircularProgress,
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
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';

function ModernEstoque() {
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categorias, setCategorias] = useState([]);
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
      const response = await api.get('/produtos');
      setProdutos(response.data);
      
      // Extrair categorias únicas
      const cats = [...new Set(response.data.map(p => p.categoria))];
      setCategorias(cats);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar estoque');
    } finally {
      setLoading(false);
    }
  };

  const filtrarProdutos = () => {
    let filtered = [...produtos];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProdutos(filtered);
  };

  const calcularStats = () => {
    const total = produtos.length;
    const valor = produtos.reduce((acc, p) => acc + (p.precoVenda * p.quantidadeEstoque), 0);
    const baixo = produtos.filter(p => p.quantidadeEstoque <= (p.estoqueMinimo || 5)).length;
    const semEstoque = produtos.filter(p => p.quantidadeEstoque === 0).length;

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
      nome: produto.nome,
      descricao: produto.descricao || '',
      categoria: produto.categoria || '',
      precoCusto: produto.precoCusto,
      precoVenda: produto.precoVenda,
      quantidadeEstoque: produto.quantidadeEstoque,
      unidade: produto.unidade || 'un',
      fornecedor: produto.fornecedor || '',
      estoqueMinimo: produto.estoqueMinimo || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        await carregarProdutos();
        toast.success('Produto excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir produto');
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const produtoData = {
      ...formData,
      precoCusto: parseFloat(formData.precoCusto),
      precoVenda: parseFloat(formData.precoVenda),
      quantidadeEstoque: parseInt(formData.quantidadeEstoque),
      estoqueMinimo: parseInt(formData.estoqueMinimo) || 5,
    };

    try {
      if (selectedProduto) {
        await api.put(`/produtos/${selectedProduto.id}`, produtoData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', produtoData);
        toast.success('Produto adicionado com sucesso!');
      }
      
      await carregarProdutos();
      setOpenDialog(false);
    } catch (error) {
      toast.error('Erro ao salvar produto');
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
    if (quantidade === 0) return { label: 'Sem Estoque', color: 'error' };
    if (quantidade <= (minimo || 5)) return { label: 'Estoque Baixo', color: 'warning' };
    return { label: 'Normal', color: 'success' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                  <TableCell>Produto</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="right">Preço Custo</TableCell>
                  <TableCell align="right">Preço Venda</TableCell>
                  <TableCell align="right">Lucro</TableCell>
                  <TableCell align="right">Quantidade</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProdutos
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((produto) => {
                    const status = getEstoqueStatus(produto.quantidadeEstoque, produto.estoqueMinimo);
                    const lucro = ((produto.precoVenda - produto.precoCusto) / produto.precoCusto * 100).toFixed(1);
                    
                    return (
                      <TableRow key={produto.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {produto.nome}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {produto.descricao}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={produto.categoria}
                            size="small"
                            sx={{ bgcolor: '#f3e5f5', color: '#9c27b0' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          R$ {produto.precoCusto.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          R$ {produto.precoVenda.toFixed(2)}
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
                            {produto.quantidadeEstoque} {produto.unidade}
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
                          <IconButton size="small" onClick={() => handleEdit(produto)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(produto.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {filteredProdutos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
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
            labelRowsPerPage="Linhas por página"
          />
        </CardContent>
      </Card>

      {/* Dialog de Produto */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={formData.categoria}
                    label="Categoria"
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  >
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
                  }}
                  required
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
                  }}
                  required
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
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
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
    </Box>
  );
}

export default ModernEstoque;