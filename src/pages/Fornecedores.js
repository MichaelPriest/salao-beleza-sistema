// src/pages/Fornecedores.js
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
  Rating,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  LocalShipping as ShippingIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';

function Fornecedores() {
  const [loading, setLoading] = useState(true);
  const [fornecedores, setFornecedores] = useState([]);
  const [compras, setCompras] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [openComprasDialog, setOpenComprasDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [fornecedorEditando, setFornecedorEditando] = useState(null);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [fornecedorToDelete, setFornecedorToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    nome: '',
    nomeFantasia: '',
    cnpj: '',
    ie: '',
    telefone: '',
    celular: '',
    email: '',
    site: '',
    categoria: 'materiais',
    rating: 0,
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    },
    contato: {
      nome: '',
      cargo: '',
      telefone: '',
      email: '',
    },
    observacoes: '',
    status: 'ativo',
    prazoEntrega: 5,
    formasPagamento: [],
  });

  const categorias = [
    { value: 'materiais', label: 'Materiais de Beleza' },
    { value: 'cosmeticos', label: 'Cosméticos' },
    { value: 'equipamentos', label: 'Equipamentos' },
    { value: 'moveis', label: 'Móveis' },
    { value: 'descartaveis', label: 'Descartáveis' },
    { value: 'outros', label: 'Outros' },
  ];

  const formasPagamentoOpcoes = [
    'dinheiro',
    'cartao_credito',
    'cartao_debito',
    'pix',
    'boleto',
    'transferencia',
    'cheque',
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [fornecedoresData, comprasData] = await Promise.all([
        firebaseService.getAll('fornecedores').catch(() => []),
        firebaseService.getAll('compras').catch(() => []),
      ]);
      
      setFornecedores(fornecedoresData || []);
      setCompras(comprasData || []);
      
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

  const handleOpenDialog = (fornecedor = null) => {
    if (fornecedor) {
      setFornecedorEditando(fornecedor);
      setFormData({
        nome: fornecedor.nome || '',
        nomeFantasia: fornecedor.nomeFantasia || '',
        cnpj: fornecedor.cnpj || '',
        ie: fornecedor.ie || '',
        telefone: fornecedor.telefone || '',
        celular: fornecedor.celular || '',
        email: fornecedor.email || '',
        site: fornecedor.site || '',
        categoria: fornecedor.categoria || 'materiais',
        rating: fornecedor.rating || 0,
        endereco: fornecedor.endereco || {
          logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
        },
        contato: fornecedor.contato || {
          nome: '', cargo: '', telefone: '', email: ''
        },
        observacoes: fornecedor.observacoes || '',
        status: fornecedor.status || 'ativo',
        prazoEntrega: fornecedor.prazoEntrega || 5,
        formasPagamento: fornecedor.formasPagamento || [],
      });
    } else {
      setFornecedorEditando(null);
      setFormData({
        nome: '',
        nomeFantasia: '',
        cnpj: '',
        ie: '',
        telefone: '',
        celular: '',
        email: '',
        site: '',
        categoria: 'materiais',
        rating: 0,
        endereco: {
          logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
        },
        contato: {
          nome: '', cargo: '', telefone: '', email: ''
        },
        observacoes: '',
        status: 'ativo',
        prazoEntrega: 5,
        formasPagamento: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFornecedorEditando(null);
  };

  const handleOpenDetalhes = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setFornecedorSelecionado(null);
  };

  const handleOpenCompras = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setOpenComprasDialog(true);
  };

  const handleCloseCompras = () => {
    setOpenComprasDialog(false);
    setFornecedorSelecionado(null);
  };

  const handleDelete = (id) => {
    setFornecedorToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await firebaseService.delete('fornecedores', fornecedorToDelete);
      setFornecedores(fornecedores.filter(f => f.id !== fornecedorToDelete));
      mostrarSnackbar('Fornecedor excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      mostrarSnackbar('Erro ao excluir fornecedor', 'error');
    }
    setOpenDeleteDialog(false);
    setFornecedorToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormaPagamentoChange = (forma) => {
    setFormData(prev => ({
      ...prev,
      formasPagamento: prev.formasPagamento.includes(forma)
        ? prev.formasPagamento.filter(f => f !== forma)
        : [...prev.formasPagamento, forma]
    }));
  };

  const handleSalvar = async () => {
    try {
      if (!formData.nome) {
        mostrarSnackbar('Nome do fornecedor é obrigatório', 'error');
        return;
      }

      if (!formData.cnpj) {
        mostrarSnackbar('CNPJ é obrigatório', 'error');
        return;
      }

      // Preparar dados para salvar
      const dadosParaSalvar = {
        nome: String(formData.nome).trim(),
        nomeFantasia: formData.nomeFantasia ? String(formData.nomeFantasia).trim() : null,
        cnpj: String(formData.cnpj).replace(/[^\d]/g, ''),
        ie: formData.ie ? String(formData.ie) : null,
        telefone: formData.telefone ? String(formData.telefone) : null,
        celular: formData.celular ? String(formData.celular) : null,
        email: formData.email ? String(formData.email).toLowerCase() : null,
        site: formData.site ? String(formData.site).toLowerCase() : null,
        categoria: String(formData.categoria),
        rating: Number(formData.rating) || 0,
        endereco: formData.endereco,
        contato: formData.contato,
        observacoes: formData.observacoes ? String(formData.observacoes).trim() : null,
        status: String(formData.status),
        prazoEntrega: Number(formData.prazoEntrega) || 5,
        formasPagamento: formData.formasPagamento,
        updatedAt: new Date().toISOString(),
      };

      if (fornecedorEditando) {
        await firebaseService.update('fornecedores', fornecedorEditando.id, dadosParaSalvar);
        
        // Atualizar estado local
        const fornecedoresAtualizados = fornecedores.map(f => 
          f.id === fornecedorEditando.id ? { ...f, ...dadosParaSalvar, id: fornecedorEditando.id } : f
        );
        setFornecedores(fornecedoresAtualizados);
        
        mostrarSnackbar('Fornecedor atualizado com sucesso!');
      } else {
        dadosParaSalvar.dataCadastro = new Date().toISOString();
        dadosParaSalvar.totalCompras = 0;
        dadosParaSalvar.valorTotalCompras = 0;
        
        const novoId = await firebaseService.add('fornecedores', dadosParaSalvar);
        setFornecedores([...fornecedores, { ...dadosParaSalvar, id: novoId }]);
        
        mostrarSnackbar('Fornecedor cadastrado com sucesso!');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      mostrarSnackbar('Erro ao salvar fornecedor', 'error');
    }
  };

  const handleToggleStatus = async (fornecedor) => {
    try {
      const novoStatus = fornecedor.status === 'ativo' ? 'inativo' : 'ativo';
      
      await firebaseService.update('fornecedores', fornecedor.id, {
        status: novoStatus,
        updatedAt: new Date().toISOString(),
      });

      // Atualizar estado local
      setFornecedores(prev => prev.map(f => 
        f.id === fornecedor.id ? { ...f, status: novoStatus } : f
      ));

      mostrarSnackbar(`Fornecedor ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarSnackbar('Erro ao alterar status', 'error');
    }
  };

  // Calcular estatísticas do fornecedor
  const getFornecedorStats = (fornecedorId) => {
    const comprasFornecedor = compras.filter(c => c.fornecedorId === fornecedorId);
    return {
      totalCompras: comprasFornecedor.length,
      valorTotal: comprasFornecedor.reduce((acc, c) => acc + (Number(c.valorTotal) || 0), 0),
      ultimaCompra: comprasFornecedor.length > 0 
        ? new Date(Math.max(...comprasFornecedor.map(c => new Date(c.dataCompra))))
        : null,
    };
  };

  // Filtrar fornecedores
  const fornecedoresFiltrados = fornecedores.filter(f => {
    const matchesTexto = filtro === '' || 
      f.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      f.nomeFantasia?.toLowerCase().includes(filtro.toLowerCase()) ||
      f.cnpj?.includes(filtro.replace(/[^\d]/g, '')) ||
      f.email?.toLowerCase().includes(filtro.toLowerCase());

    const matchesCategoria = filtroCategoria === 'todos' || f.categoria === filtroCategoria;

    return matchesTexto && matchesCategoria;
  });

  // Paginação
  const paginatedFornecedores = fornecedoresFiltrados.slice(
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
    total: fornecedores.length,
    ativos: fornecedores.filter(f => f.status === 'ativo').length,
    inativos: fornecedores.filter(f => f.status === 'inativo').length,
    categorias: categorias.length,
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
            Fornecedores
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie todos os fornecedores e parceiros comerciais
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
        >
          Novo Fornecedor
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
                  Total de Fornecedores
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
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Fornecedores Ativos
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.ativos}
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
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Fornecedores Inativos
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {stats.inativos}
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
                <Typography color="textSecondary" gutterBottom>
                  Categorias
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {stats.categorias}
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
                placeholder="Buscar por nome, CNPJ ou email..."
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
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={filtroCategoria}
                  label="Categoria"
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <MenuItem value="todos">Todas as Categorias</MenuItem>
                  {categorias.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
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

      {/* Tabela de Fornecedores */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Fornecedor</strong></TableCell>
                <TableCell><strong>Contato</strong></TableCell>
                <TableCell><strong>Categoria</strong></TableCell>
                <TableCell align="center"><strong>Avaliação</strong></TableCell>
                <TableCell align="right"><strong>Compras</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {paginatedFornecedores.map((fornecedor, index) => {
                  const stats = getFornecedorStats(fornecedor.id);
                  return (
                    <motion.tr
                      key={fornecedor.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#9c27b0' }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {fornecedor.nome}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {fornecedor.cnpj}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{fornecedor.contato?.nome || '—'}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {fornecedor.telefone || fornecedor.celular || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={categorias.find(c => c.value === fornecedor.categoria)?.label || fornecedor.categoria}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Rating
                          value={Number(fornecedor.rating) || 0}
                          readOnly
                          size="small"
                          precision={0.5}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {stats.totalCompras} compras
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            R$ {stats.valorTotal.toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={fornecedor.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          size="small"
                          color={fornecedor.status === 'ativo' ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Ver Detalhes">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetalhes(fornecedor)}
                              sx={{ color: '#9c27b0' }}
                            >
                              <BusinessIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Histórico de Compras">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenCompras(fornecedor)}
                              sx={{ color: '#ff4081' }}
                            >
                              <ShoppingCartIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(fornecedor)}
                              sx={{ color: '#2196f3' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={fornecedor.status === 'ativo' ? 'Desativar' : 'Ativar'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(fornecedor)}
                              sx={{ color: fornecedor.status === 'ativo' ? '#f44336' : '#4caf50' }}
                            >
                              {fornecedor.status === 'ativo' ? <DeleteIcon /> : <CheckIcon />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {paginatedFornecedores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <BusinessIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      Nenhum fornecedor encontrado
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
          count={fornecedoresFiltrados.length}
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
          {fornecedorEditando ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Razão Social"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Fantasia"
                name="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="CNPJ"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleInputChange}
                required
                size="small"
                placeholder="00.000.000/0000-00"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Inscrição Estadual"
                name="ie"
                value={formData.ie}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria</InputLabel>
                <Select
                  name="categoria"
                  value={formData.categoria}
                  label="Categoria"
                  onChange={handleInputChange}
                >
                  {categorias.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#9c27b0' }}>
                Endereço
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Logradouro"
                name="endereco.logradouro"
                value={formData.endereco.logradouro}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Número"
                name="endereco.numero"
                value={formData.endereco.numero}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Complemento"
                name="endereco.complemento"
                value={formData.endereco.complemento}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bairro"
                name="endereco.bairro"
                value={formData.endereco.bairro}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cidade"
                name="endereco.cidade"
                value={formData.endereco.cidade}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Estado"
                name="endereco.estado"
                value={formData.endereco.estado}
                onChange={handleInputChange}
                size="small"
                placeholder="UF"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="CEP"
                name="endereco.cep"
                value={formData.endereco.cep}
                onChange={handleInputChange}
                size="small"
                placeholder="00000-000"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 1, color: '#9c27b0' }}>
                Contato
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                size="small"
                placeholder="(00) 0000-0000"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                size="small"
                placeholder="(00) 00000-0000"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site"
                name="site"
                value={formData.site}
                onChange={handleInputChange}
                size="small"
                placeholder="www.exemplo.com"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Contato"
                name="contato.nome"
                value={formData.contato.nome}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cargo do Contato"
                name="contato.cargo"
                value={formData.contato.cargo}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 1, color: '#9c27b0' }}>
                Informações Comerciais
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Prazo de Entrega (dias)"
                name="prazoEntrega"
                value={formData.prazoEntrega}
                onChange={handleInputChange}
                size="small"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>Avaliação:</Typography>
                <Rating
                  name="rating"
                  value={Number(formData.rating)}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({ ...prev, rating: newValue }));
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#9c27b0' }}>
                Formas de Pagamento Aceitas
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formasPagamentoOpcoes.map(forma => (
                  <Chip
                    key={forma}
                    label={forma.replace('_', ' ').toUpperCase()}
                    onClick={() => handleFormaPagamentoChange(forma)}
                    color={formData.formasPagamento.includes(forma) ? 'primary' : 'default'}
                    variant={formData.formasPagamento.includes(forma) ? 'filled' : 'outlined'}
                    size="small"
                    sx={{
                      bgcolor: formData.formasPagamento.includes(forma) ? '#9c27b0' : 'transparent',
                      color: formData.formasPagamento.includes(forma) ? 'white' : 'inherit',
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                multiline
                rows={3}
                size="small"
                placeholder="Observações sobre o fornecedor..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
          >
            {fornecedorEditando ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes do Fornecedor
        </DialogTitle>
        <DialogContent>
          {fornecedorSelecionado && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 1, bgcolor: '#9c27b0' }}>
                      <BusinessIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h6">{fornecedorSelecionado.nome}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {fornecedorSelecionado.cnpj}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Rating value={Number(fornecedorSelecionado.rating) || 0} readOnly size="small" />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
                      Informações de Contato
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Telefone</Typography>
                        <Typography variant="body2">{fornecedorSelecionado.telefone || '—'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Celular</Typography>
                        <Typography variant="body2">{fornecedorSelecionado.celular || '—'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Email</Typography>
                        <Typography variant="body2">{fornecedorSelecionado.email || '—'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Site</Typography>
                        <Typography variant="body2">{fornecedorSelecionado.site || '—'}</Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#9c27b0' }}>
                      Endereço
                    </Typography>
                    <Typography variant="body2">
                      {fornecedorSelecionado.endereco?.logradouro}, {fornecedorSelecionado.endereco?.numero}
                      {fornecedorSelecionado.endereco?.complemento && ` - ${fornecedorSelecionado.endereco.complemento}`}
                      <br />
                      {fornecedorSelecionado.endereco?.bairro} - {fornecedorSelecionado.endereco?.cidade}/{fornecedorSelecionado.endereco?.estado}
                      <br />
                      CEP: {fornecedorSelecionado.endereco?.cep}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#9c27b0' }}>
                      Informações Comerciais
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">Categoria</Typography>
                        <Typography variant="body2">
                          {categorias.find(c => c.value === fornecedorSelecionado.categoria)?.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">Prazo de Entrega</Typography>
                        <Typography variant="body2">{fornecedorSelecionado.prazoEntrega} dias</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Chip
                          label={fornecedorSelecionado.status}
                          size="small"
                          color={fornecedorSelecionado.status === 'ativo' ? 'success' : 'error'}
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">Cadastro</Typography>
                        <Typography variant="body2">
                          {fornecedorSelecionado.dataCadastro ? new Date(fornecedorSelecionado.dataCadastro).toLocaleDateString('pt-BR') : '—'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#9c27b0' }}>
                        Formas de Pagamento
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {fornecedorSelecionado.formasPagamento?.map(forma => (
                          <Chip
                            key={forma}
                            label={forma.replace('_', ' ').toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {(!fornecedorSelecionado.formasPagamento || fornecedorSelecionado.formasPagamento.length === 0) && (
                          <Typography variant="caption" color="textSecondary">
                            Nenhuma forma de pagamento informada
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {fornecedorSelecionado.observacoes && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#9c27b0' }}>
                          Observações
                        </Typography>
                        <Typography variant="body2">{fornecedorSelecionado.observacoes}</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Histórico de Compras */}
      <Dialog open={openComprasDialog} onClose={handleCloseCompras} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff4081', color: 'white' }}>
          Histórico de Compras - {fornecedorSelecionado?.nome}
        </DialogTitle>
        <DialogContent>
          {fornecedorSelecionado && (
            <Box sx={{ mt: 2 }}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell><strong>Nº Pedido</strong></TableCell>
                      <TableCell><strong>Data</strong></TableCell>
                      <TableCell align="right"><strong>Valor</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {compras
                      .filter(c => c.fornecedorId === fornecedorSelecionado.id)
                      .map(compra => (
                        <TableRow key={compra.id}>
                          <TableCell>{compra.numeroPedido}</TableCell>
                          <TableCell>
                            {compra.dataCompra ? new Date(compra.dataCompra).toLocaleDateString('pt-BR') : '—'}
                          </TableCell>
                          <TableCell align="right">
                            R$ {Number(compra.valorTotal || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={compra.status || '—'}
                              size="small"
                              color={
                                compra.status === 'entregue' ? 'success' :
                                compra.status === 'pendente' ? 'warning' : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    
                    {compras.filter(c => c.fornecedorId === fornecedorSelecionado.id).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <ShoppingCartIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            Nenhuma compra encontrada
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {compras.filter(c => c.fornecedorId === fornecedorSelecionado.id).length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">Total de Compras</Typography>
                      <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 600 }}>
                        {compras.filter(c => c.fornecedorId === fornecedorSelecionado.id).length}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">Valor Total</Typography>
                      <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                        R$ {compras
                          .filter(c => c.fornecedorId === fornecedorSelecionado.id)
                          .reduce((acc, c) => acc + (Number(c.valorTotal) || 0), 0)
                          .toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">Ticket Médio</Typography>
                      <Typography variant="h6" sx={{ color: '#ff4081', fontWeight: 600 }}>
                        R$ {(compras
                          .filter(c => c.fornecedorId === fornecedorSelecionado.id)
                          .reduce((acc, c) => acc + (Number(c.valorTotal) || 0), 0) / 
                          Math.max(1, compras.filter(c => c.fornecedorId === fornecedorSelecionado.id).length)
                        ).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompras}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Tem certeza que deseja excluir este fornecedor?
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

export default Fornecedores;
