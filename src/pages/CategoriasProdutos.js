// src/pages/CategoriasProdutos.js
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
  Collapse,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  FolderShared as FolderSharedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronRight as ChevronRightIcon,
  DragHandle as DragHandleIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PhotoCamera as PhotoCameraIcon,
  ColorLens as ColorIcon,
  Palette as PaletteIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalOffer as LocalOfferIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Build as BuildIcon,
  Spa as SpaIcon,
  Face as FaceIcon,
  Brush as BrushIcon,
  ContentCut as ContentCutIcon,
  WaterDrop as WaterDropIcon,
  Air as AirIcon,
  // Ícones personalizados (podem ser criados ou substituídos)
} from '@mui/icons-material';

// Para ícones que não existem no Material-UI, podemos usar alternativas ou criar SVGs
const CreamIcon = () => <span>🧴</span>;
const PerfumeIcon = () => <span>🌸</span>;
import { motion, Reorder, useDragControls } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Cores para categorias
const coresCategoria = [
  { value: '#f44336', label: 'Vermelho' },
  { value: '#e91e63', label: 'Rosa' },
  { value: '#9c27b0', label: 'Roxo' },
  { value: '#673ab7', label: 'Roxo Escuro' },
  { value: '#3f51b5', label: 'Azul' },
  { value: '#2196f3', label: 'Azul Claro' },
  { value: '#03a9f4', label: 'Azul Celeste' },
  { value: '#00bcd4', label: 'Ciano' },
  { value: '#009688', label: 'Verde Água' },
  { value: '#4caf50', label: 'Verde' },
  { value: '#8bc34a', label: 'Verde Claro' },
  { value: '#cddc39', label: 'Lima' },
  { value: '#ffeb3b', label: 'Amarelo' },
  { value: '#ffc107', label: 'Âmbar' },
  { value: '#ff9800', label: 'Laranja' },
  { value: '#ff5722', label: 'Laranja Escuro' },
  { value: '#795548', label: 'Marrom' },
  { value: '#9e9e9e', label: 'Cinza' },
  { value: '#607d8b', label: 'Azul Acinzentado' },
];

// Ícones disponíveis
const iconesDisponiveis = [
  { value: 'inventory', label: '📦 Estoque', icon: <InventoryIcon /> },
  { value: 'category', label: '📁 Categoria', icon: <CategoryIcon /> },
  { value: 'folder', label: '📂 Pasta', icon: <FolderIcon /> },
  { value: 'shopping', label: '🛒 Compras', icon: <ShoppingCartIcon /> },
  { value: 'local_offer', label: '🏷️ Oferta', icon: <LocalOfferIcon /> },
  { value: 'star', label: '⭐ Estrela', icon: <StarIcon /> },
  { value: 'favorite', label: '❤️ Favorito', icon: <FavoriteIcon /> },
  { value: 'build', label: '🔧 Ferramenta', icon: <BuildIcon /> },
  { value: 'spa', label: '🌸 Spa', icon: <SpaIcon /> },
  { value: 'face', label: '😊 Rosto', icon: <FaceIcon /> },
  { value: 'brush', label: '🎨 Pincel', icon: <BrushIcon /> },
  { value: 'scissors', label: '✂️ Tesoura', icon: <ContentCutIcon /> },
  { value: 'water', label: '💧 Água', icon: <WaterDropIcon /> },
  { value: 'dry', label: '💨 Secador', icon: <AirIcon /> },
  { value: 'cream', label: '🧴 Creme', icon: <CreamIcon /> },
  { value: 'perfume', label: '🌸 Perfume', icon: <PerfumeIcon /> },
];

function CategoriasProdutos() {
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [categoriaParaDeletar, setCategoriaParaDeletar] = useState(null);
  const [expandidas, setExpandidas] = useState({});
  const [modoExibicao, setModoExibicao] = useState('arvore'); // 'arvore' ou 'lista'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [usuario, setUsuario] = useState(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#9c27b0',
    icone: 'category',
    categoriaPai: '',
    ativo: true,
    destaque: false,
    ordem: 0,
    metaDescricao: '',
    palavrasChave: [],
    imagem: null,
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
      const [categoriasData, produtosData] = await Promise.all([
        firebaseService.getAll('categorias_produtos').catch(() => []),
        firebaseService.getAll('produtos').catch(() => [])
      ]);

      // Ordenar categorias por ordem
      const categoriasOrdenadas = (categoriasData || []).sort((a, b) => 
        (a.ordem || 0) - (b.ordem || 0)
      );

      setCategorias(categoriasOrdenadas);
      setProdutos(produtosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar categorias');
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

  const handleOpenDialog = (categoria = null) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setFormData({
        nome: categoria.nome || '',
        descricao: categoria.descricao || '',
        cor: categoria.cor || '#9c27b0',
        icone: categoria.icone || 'category',
        categoriaPai: categoria.categoriaPai || '',
        ativo: categoria.ativo !== false,
        destaque: categoria.destaque || false,
        ordem: categoria.ordem || 0,
        metaDescricao: categoria.metaDescricao || '',
        palavrasChave: categoria.palavrasChave || [],
        imagem: categoria.imagem || null,
      });
    } else {
      setCategoriaEditando(null);
      setFormData({
        nome: '',
        descricao: '',
        cor: '#9c27b0',
        icone: 'category',
        categoriaPai: categoriaSelecionada?.id || '',
        ativo: true,
        destaque: false,
        ordem: categorias.length,
        metaDescricao: '',
        palavrasChave: [],
        imagem: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCategoriaEditando(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePalavrasChaveChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      palavrasChave: newValue
    }));
  };

  const handleSalvar = async () => {
    try {
      if (!formData.nome) {
        mostrarSnackbar('Nome da categoria é obrigatório', 'error');
        return;
      }

      const dadosParaSalvar = {
        ...formData,
        palavrasChave: formData.palavrasChave || [],
        criadoPor: usuario?.id,
        criadoPorNome: usuario?.nome,
        criadoEm: categoriaEditando ? categoriaEditando.criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      if (categoriaEditando) {
        await firebaseService.update('categorias_produtos', categoriaEditando.id, dadosParaSalvar);
        mostrarSnackbar('Categoria atualizada com sucesso!');
      } else {
        await firebaseService.add('categorias_produtos', dadosParaSalvar);
        mostrarSnackbar('Categoria criada com sucesso!');
      }

      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      mostrarSnackbar(error.message || 'Erro ao salvar categoria', 'error');
    }
  };

  const handleDeleteClick = (categoria) => {
    // Verificar se existem produtos nesta categoria
    const produtosNaCategoria = produtos.filter(p => p.categoriaId === categoria.id);
    if (produtosNaCategoria.length > 0) {
      mostrarSnackbar(
        `Não é possível excluir: existem ${produtosNaCategoria.length} produto(s) nesta categoria`,
        'error'
      );
      return;
    }

    // Verificar se existem subcategorias
    const subcategorias = categorias.filter(c => c.categoriaPai === categoria.id);
    if (subcategorias.length > 0) {
      mostrarSnackbar(
        `Não é possível excluir: existem ${subcategorias.length} subcategoria(s)`,
        'error'
      );
      return;
    }

    setCategoriaParaDeletar(categoria);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await firebaseService.delete('categorias_produtos', categoriaParaDeletar.id);
      mostrarSnackbar('Categoria excluída com sucesso!');
      setOpenDeleteDialog(false);
      setCategoriaParaDeletar(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      mostrarSnackbar('Erro ao excluir categoria', 'error');
    }
  };

  const handleToggleExpand = (categoriaId) => {
    setExpandidas(prev => ({
      ...prev,
      [categoriaId]: !prev[categoriaId]
    }));
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(categorias);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualizar ordem no estado
    setCategorias(items);

    // Atualizar ordem no banco de dados
    try {
      const updates = items.map((item, index) => 
        firebaseService.update('categorias_produtos', item.id, { ordem: index })
      );
      await Promise.all(updates);
    } catch (error) {
      console.error('Erro ao salvar nova ordem:', error);
      mostrarSnackbar('Erro ao salvar ordem das categorias', 'error');
    }
  };

  const getIcone = (iconeNome) => {
    const icone = iconesDisponiveis.find(i => i.value === iconeNome);
    return icone?.icon || <CategoryIcon />;
  };

  const contarProdutosNaCategoria = (categoriaId) => {
    return produtos.filter(p => p.categoriaId === categoriaId).length;
  };

  const getSubcategorias = (categoriaPaiId) => {
    return categorias.filter(c => c.categoriaPai === categoriaPaiId);
  };

  const renderArvoreCategorias = (categoriasParaRenderizar, nivel = 0) => {
    return categoriasParaRenderizar.map((categoria) => {
      const subcategorias = getSubcategorias(categoria.id);
      const expandida = expandidas[categoria.id] || false;
      const produtosCount = contarProdutosNaCategoria(categoria.id);

      return (
        <React.Fragment key={categoria.id}>
          <Draggable draggableId={categoria.id} index={categorias.indexOf(categoria)}>
            {(provided, snapshot) => (
              <Paper
                ref={provided.innerRef}
                {...provided.draggableProps}
                sx={{
                  mb: 1,
                  bgcolor: snapshot.isDragging ? alpha('#9c27b0', 0.1) : 'white',
                  boxShadow: snapshot.isDragging ? 3 : 1,
                  position: 'relative',
                  '&:hover': {
                    bgcolor: alpha('#9c27b0', 0.02),
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    pl: 2 + nivel * 3,
                  }}
                >
                  <Box {...provided.dragHandleProps} sx={{ mr: 1, cursor: 'grab' }}>
                    <DragHandleIcon sx={{ color: '#999' }} />
                  </Box>
                  
                  {subcategorias.length > 0 && (
                    <IconButton size="small" onClick={() => handleToggleExpand(categoria.id)}>
                      {expandida ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                  
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: categoria.cor || '#9c27b0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    {React.cloneElement(getIcone(categoria.icone), { 
                      sx: { fontSize: 18, color: 'white' } 
                    })}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {categoria.nome}
                      </Typography>
                      {categoria.destaque && (
                        <Chip label="Destaque" size="small" color="warning" sx={{ height: 20 }} />
                      )}
                      {!categoria.ativo && (
                        <Chip label="Inativo" size="small" color="error" sx={{ height: 20 }} />
                      )}
                    </Box>
                    {categoria.descricao && (
                      <Typography variant="caption" color="textSecondary">
                        {categoria.descricao}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                    <Tooltip title="Produtos">
                      <Chip
                        label={produtosCount}
                        size="small"
                        icon={<InventoryIcon sx={{ fontSize: 14 }} />}
                        variant="outlined"
                      />
                    </Tooltip>
                    
                    {subcategorias.length > 0 && (
                      <Chip
                        label={`${subcategorias.length} sub`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Box>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(categoria)}
                        sx={{ color: '#ff4081' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Adicionar Subcategoria">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setCategoriaSelecionada(categoria);
                          handleOpenDialog();
                        }}
                        sx={{ color: '#4caf50' }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(categoria)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            )}
          </Draggable>
          
          {subcategorias.length > 0 && expandida && (
            <Box sx={{ ml: 2 }}>
              {renderArvoreCategorias(subcategorias, nivel + 1)}
            </Box>
          )}
        </React.Fragment>
      );
    });
  };

  const categoriasFiltradas = categorias.filter(categoria => {
    if (!filtro) return true;
    return categoria.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
           categoria.descricao?.toLowerCase().includes(filtro.toLowerCase());
  });

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Categorias de Produtos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Organize seus produtos em categorias e subcategorias
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={modoExibicao === 'arvore' ? <SortIcon /> : <FolderIcon />}
            onClick={() => setModoExibicao(modoExibicao === 'arvore' ? 'lista' : 'arvore')}
          >
            {modoExibicao === 'arvore' ? 'Visualizar Lista' : 'Visualizar Árvore'}
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              Nova Categoria
            </Button>
          </motion.div>
        </Box>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {categorias.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total de Categorias
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                  <FolderIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {categorias.filter(c => !c.categoriaPai).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Categorias Principais
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {produtos.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Produtos no Estoque
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtro e Busca */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar categorias..."
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
            <Grid item xs={12} md={6}>
              <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} sx={{ justifyContent: 'flex-end' }}>
                <Link color="inherit" href="#" onClick={() => setCategoriaSelecionada(null)}>
                  Todas as categorias
                </Link>
                {categoriaSelecionada && (
                  <Typography color="textPrimary">{categoriaSelecionada.nome}</Typography>
                )}
              </Breadcrumbs>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Categorias */}
      <Card>
        <CardContent>
          {categoriasFiltradas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CategoryIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Nenhuma categoria encontrada
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2 }}
              >
                Criar primeira categoria
              </Button>
            </Box>
          ) : modoExibicao === 'arvore' ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categorias">
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef}>
                    {renderArvoreCategorias(categoriasFiltradas.filter(c => !c.categoriaPai))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Categoria</strong></TableCell>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell><strong>Subcategorias</strong></TableCell>
                    <TableCell><strong>Produtos</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoriasFiltradas.map((categoria) => {
                    const subcategorias = getSubcategorias(categoria.id);
                    const produtosCount = contarProdutosNaCategoria(categoria.id);
                    const categoriaPai = categorias.find(c => c.id === categoria.categoriaPai);

                    return (
                      <TableRow key={categoria.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                bgcolor: categoria.cor || '#9c27b0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {React.cloneElement(getIcone(categoria.icone), { 
                                sx: { fontSize: 18, color: 'white' } 
                              })}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {categoria.nome}
                              </Typography>
                              {categoriaPai && (
                                <Typography variant="caption" color="textSecondary">
                                  Subcategoria de: {categoriaPai.nome}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {categoria.descricao || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {subcategorias.length > 0 ? (
                            <Chip
                              label={`${subcategorias.length} subcategoria(s)`}
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={produtosCount}
                            size="small"
                            icon={<InventoryIcon sx={{ fontSize: 14 }} />}
                            color={produtosCount > 0 ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={categoria.ativo ? 'Ativo' : 'Inativo'}
                            size="small"
                            color={categoria.ativo ? 'success' : 'error'}
                          />
                          {categoria.destaque && (
                            <Chip
                              label="Destaque"
                              size="small"
                              color="warning"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(categoria)}
                                sx={{ color: '#ff4081' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Adicionar Subcategoria">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setCategoriaSelecionada(categoria);
                                  handleOpenDialog();
                                }}
                                sx={{ color: '#4caf50' }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(categoria)}
                                sx={{ color: '#f44336' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Nome da Categoria"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria Pai</InputLabel>
                <Select
                  name="categoriaPai"
                  value={formData.categoriaPai}
                  label="Categoria Pai"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Nenhuma (categoria principal)</MenuItem>
                  {categorias
                    .filter(c => c.id !== categoriaEditando?.id)
                    .map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.nome}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="descricao"
                multiline
                rows={2}
                value={formData.descricao}
                onChange={handleInputChange}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Cor da Categoria</InputLabel>
                <Select
                  name="cor"
                  value={formData.cor}
                  label="Cor da Categoria"
                  onChange={handleInputChange}
                >
                  {coresCategoria.map(cor => (
                    <MenuItem key={cor.value} value={cor.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, bgcolor: cor.value, borderRadius: 1 }} />
                        {cor.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Ícone</InputLabel>
                <Select
                  name="icone"
                  value={formData.icone}
                  label="Ícone"
                  onChange={handleInputChange}
                >
                  {iconesDisponiveis.map(icone => (
                    <MenuItem key={icone.value} value={icone.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {icone.icon}
                        {icone.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.ativo}
                      onChange={handleInputChange}
                      name="ativo"
                    />
                  }
                  label="Ativo"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.destaque}
                      onChange={handleInputChange}
                      name="destaque"
                    />
                  }
                  label="Destaque"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 2 }}>
                SEO e Palavras-chave
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Descrição (para SEO)"
                name="metaDescricao"
                multiline
                rows={2}
                value={formData.metaDescricao}
                onChange={handleInputChange}
                size="small"
                helperText="Descrição que aparecerá nos mecanismos de busca"
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.palavrasChave}
                onChange={handlePalavrasChaveChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Palavras-chave"
                    size="small"
                    placeholder="Digite e pressione Enter"
                    helperText="Palavras-chave para facilitar a busca"
                  />
                )}
              />
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
            {categoriaEditando ? 'Atualizar' : 'Criar Categoria'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Tem certeza que deseja excluir a categoria "{categoriaParaDeletar?.nome}"?
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
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

export default CategoriasProdutos;
