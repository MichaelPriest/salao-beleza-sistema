// src/pages/ModernEstoque.js
import React, { useState, useEffect, useRef } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  FormHelperText,
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
  Category as CategoryIcon,
  Save as SaveIcon,
  Assessment as AssessmentIcon,
  Map as MapIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  GridOn as GridIcon,
  ViewModule as ViewModuleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { useReactToPrint } from 'react-to-print';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Lista completa de unidades de medida
const UNIDADES_MEDIDA = [
  { value: 'un', label: 'Unidade', simbolo: 'un' },
  { value: 'pç', label: 'Peça', simbolo: 'pç' },
  { value: 'cx', label: 'Caixa', simbolo: 'cx' },
  { value: 'pct', label: 'Pacote', simbolo: 'pct' },
  { value: 'kit', label: 'Kit', simbolo: 'kit' },
  { value: 'par', label: 'Par', simbolo: 'par' },
  { value: 'dz', label: 'Dúzia', simbolo: 'dz' },
  { value: 'kg', label: 'Quilograma', simbolo: 'kg' },
  { value: 'g', label: 'Grama', simbolo: 'g' },
  { value: 'mg', label: 'Miligrama', simbolo: 'mg' },
  { value: 'L', label: 'Litro', simbolo: 'L' },
  { value: 'ml', label: 'Mililitro', simbolo: 'ml' },
  { value: 'm', label: 'Metro', simbolo: 'm' },
  { value: 'cm', label: 'Centímetro', simbolo: 'cm' },
  { value: 'mm', label: 'Milímetro', simbolo: 'mm' },
  { value: 'm²', label: 'Metro Quadrado', simbolo: 'm²' },
  { value: 'fr', label: 'Frasco', simbolo: 'fr' },
  { value: 'tb', label: 'Tablete', simbolo: 'tb' },
];

// CORES PARA GRÁFICOS
const COLORS = ['#9c27b0', '#ff4081', '#4caf50', '#ff9800', '#f44336', '#2196f3', '#00bcd4', '#795548'];

// TIPOS DE SETORES PARA O MAPA
const SETORES = [
  { id: 'A', nome: 'Setor A - Cosméticos', cor: '#9c27b0' },
  { id: 'B', nome: 'Setor B - Cabelos', cor: '#ff4081' },
  { id: 'C', nome: 'Setor C - Unhas', cor: '#4caf50' },
  { id: 'D', nome: 'Setor D - Estética', cor: '#ff9800' },
  { id: 'E', nome: 'Setor E - Descartáveis', cor: '#2196f3' },
  { id: 'F', nome: 'Setor F - Equipamentos', cor: '#f44336' },
  { id: 'G', nome: 'Setor G - Perfumaria', cor: '#00bcd4' },
  { id: 'H', nome: 'Setor H - Promoções', cor: '#795548' },
];

// Configuração das prateleiras por setor
const PRATELEIRAS_POR_SETOR = {
  'A': Array.from({ length: 20 }, (_, i) => ({
    id: `A-${String(i + 1).padStart(2, '0')}`,
    label: `Prateleira A-${String(i + 1).padStart(2, '0')}`,
    posicao: `${Math.floor(i / 5) + 1}-${(i % 5) + 1}`,
  })),
  'B': Array.from({ length: 20 }, (_, i) => ({
    id: `B-${String(i + 1).padStart(2, '0')}`,
    label: `Prateleira B-${String(i + 1).padStart(2, '0')}`,
    posicao: `${Math.floor(i / 5) + 1}-${(i % 5) + 1}`,
  })),
  'C': Array.from({ length: 15 }, (_, i) => ({
    id: `C-${String(i + 1).padStart(2, '0')}`,
    label: `Prateleira C-${String(i + 1).padStart(2, '0')}`,
    posicao: `${Math.floor(i / 5) + 1}-${(i % 5) + 1}`,
  })),
  'D': Array.from({ length: 15 }, (_, i) => ({
    id: `D-${String(i + 1).padStart(2, '0')}`,
    label: `Prateleira D-${String(i + 1).padStart(2, '0')}`,
    posicao: `${Math.floor(i / 5) + 1}-${(i % 5) + 1}`,
  })),
  'E': Array.from({ length: 25 }, (_, i) => ({
    id: `E-${String(i + 1).padStart(2, '0')}`,
    label: `Prateleira E-${String(i + 1).padStart(2, '0')}`,
    posicao: `${Math.floor(i / 5) + 1}-${(i % 5) + 1}`,
  })),
  'F': Array.from({ length: 10 }, (_, i) => ({
    id: `F-${String(i + 1).padStart(2, '0')}`,
    label: `Prateleira F-${String(i + 1).padStart(2, '0')}`,
    posicao: `${Math.floor(i / 5) + 1}-${(i % 5) + 1}`,
  })),
  'G': Array.from({ length: 20 }, (_, i) => ({
    id: `G-${String(i + 1).padStart(2, '0')}`,
    label: `Prateleira G-${String(i + 1).padStart(2, '0')}`,
    posicao: `${Math.floor(i / 5) + 1}-${(i % 5) + 1}`,
  })),
  'H': Array.from({ length: 30 }, (_, i) => ({
    id: `H-${String(i + 1).padStart(2, '0')}`,
    label: `Prateleira H-${String(i + 1).padStart(2, '0')}`,
    posicao: `${Math.floor(i / 5) + 1}-${(i % 5) + 1}`,
  })),
};

// Componente de seleção de prateleira
const SeletorPrateleira = ({ setor, value, onChange, error, helperText }) => {
  const [modoVisualizacao, setModoVisualizacao] = useState('grade');
  
  if (!setor) {
    return (
      <FormControl fullWidth size="small" error={error}>
        <InputLabel>Prateleira</InputLabel>
        <Select
          value={value || ''}
          label="Prateleira"
          onChange={(e) => onChange(e.target.value)}
          disabled
        >
          <MenuItem value="">Selecione um setor primeiro</MenuItem>
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }

  const prateleirasDisponiveis = PRATELEIRAS_POR_SETOR[setor] || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" color="textSecondary">
          Prateleiras disponíveis no {SETORES.find(s => s.id === setor)?.nome}
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={modoVisualizacao}
          exclusive
          onChange={(e, novoModo) => novoModo && setModoVisualizacao(novoModo)}
        >
          <ToggleButton value="grade">
            <GridIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="lista">
            <ViewModuleIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {modoVisualizacao === 'grade' ? (
        <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
          <Grid container spacing={1}>
            {prateleirasDisponiveis.map((prateleira) => {
              const isSelected = value === prateleira.id;
              const setorInfo = SETORES.find(s => s.id === setor);
              
              return (
                <Grid item xs={6} sm={4} md={3} key={prateleira.id}>
                  <Paper
                    variant="outlined"
                    onClick={() => onChange(prateleira.id)}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: isSelected ? `${setorInfo?.cor}20` : 'transparent',
                      borderColor: isSelected ? setorInfo?.cor : '#e0e0e0',
                      borderWidth: isSelected ? 2 : 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: setorInfo?.cor,
                        bgcolor: `${setorInfo?.cor}10`,
                      },
                    }}
                  >
                    <LocationIcon sx={{ fontSize: 20, color: isSelected ? setorInfo?.cor : '#999', mb: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                      {prateleira.id}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Pos: {prateleira.posicao}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      ) : (
        <FormControl fullWidth size="small" error={error}>
          <InputLabel>Prateleira</InputLabel>
          <Select
            value={value || ''}
            label="Prateleira"
            onChange={(e) => onChange(e.target.value)}
            MenuProps={{ style: { maxHeight: 400 } }}
          >
            <MenuItem value="">
              <em>Selecione uma prateleira</em>
            </MenuItem>
            {prateleirasDisponiveis.map((prateleira) => (
              <MenuItem key={prateleira.id} value={prateleira.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon sx={{ fontSize: 16, color: SETORES.find(s => s.id === setor)?.cor }} />
                  <Typography variant="body2">
                    {prateleira.label} (Posição: {prateleira.posicao})
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      )}
    </Box>
  );
};

// Componente de relatório para impressão
const RelatorioEstoque = React.forwardRef((props, ref) => {
  const { produtos, categorias, fornecedores, stats, SETORES, getUnidadeSimbolo } = props;
  
  const getEstoqueStatus = (quantidade, minimo) => {
    const qtd = Number(quantidade || 0);
    const min = Number(minimo || 5);
    if (qtd === 0) return { label: 'Sem Estoque', color: '#f44336' };
    if (qtd <= min) return { label: 'Estoque Baixo', color: '#ff9800' };
    return { label: 'Normal', color: '#4caf50' };
  };

  return (
    <Box ref={ref} sx={{ p: 4, backgroundColor: 'white', minWidth: '800px' }}>
      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #9c27b0', pb: 2 }}>
        <Typography variant="h3" sx={{ color: '#9c27b0', fontWeight: 700, mb: 1 }}>
          RELATÓRIO DE ESTOQUE
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </Typography>
      </Box>

      {/* Resumo em Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f3e5f5', borderRadius: 2 }}>
            <Typography variant="body2" color="textSecondary">Total de Produtos</Typography>
            <Typography variant="h3" sx={{ color: '#9c27b0', fontWeight: 700 }}>{stats.totalProdutos}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e8f5e9', borderRadius: 2 }}>
            <Typography variant="body2" color="textSecondary">Valor em Estoque</Typography>
            <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>R$ {stats.valorEstoque.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff3e0', borderRadius: 2 }}>
            <Typography variant="body2" color="textSecondary">Estoque Baixo</Typography>
            <Typography variant="h3" sx={{ color: '#ff9800', fontWeight: 700 }}>{stats.produtosBaixo}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#ffebee', borderRadius: 2 }}>
            <Typography variant="body2" color="textSecondary">Sem Estoque</Typography>
            <Typography variant="h3" sx={{ color: '#f44336', fontWeight: 700 }}>{stats.produtosSemEstoque}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Informações Adicionais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Resumo Financeiro</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Valor Total (Custo):</Typography>
              <Typography sx={{ fontWeight: 600 }}>R$ {stats.valorTotalCusto.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Valor Total (Venda):</Typography>
              <Typography sx={{ fontWeight: 600, color: '#4caf50' }}>R$ {stats.valorEstoque.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Lucro Potencial:</Typography>
              <Typography sx={{ fontWeight: 600, color: stats.lucroPotencial > 0 ? '#4caf50' : '#f44336' }}>
                R$ {stats.lucroPotencial.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Distribuição por Setor</Typography>
            {SETORES.map(setor => {
              const produtosNoSetor = produtos.filter(p => p.setor === setor.id);
              if (produtosNoSetor.length === 0) return null;
              return (
                <Box key={setor.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{setor.nome}:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {produtosNoSetor.length} produtos
                  </Typography>
                </Box>
              );
            })}
          </Paper>
        </Grid>
      </Grid>

      {/* Tabela de Produtos */}
      <Typography variant="h5" sx={{ mb: 2, color: '#9c27b0', fontWeight: 600 }}>
        Lista Detalhada de Produtos
      </Typography>
      
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#9c27b0' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Produto</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Categoria</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fornecedor</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Preço Custo</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Preço Venda</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Estoque</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Localização</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.map((produto, index) => {
              const categoria = categorias.find(c => c.id === produto.categoria);
              const fornecedor = fornecedores.find(f => f.id === produto.fornecedorId);
              const setor = SETORES.find(s => s.id === produto.setor);
              const status = getEstoqueStatus(produto.quantidadeEstoque, produto.estoqueMinimo);
              
              return (
                <TableRow key={produto.id} sx={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {produto.nome}
                    </Typography>
                    {produto.codigoBarras && (
                      <Typography variant="caption" color="textSecondary">
                        Cód: {produto.codigoBarras}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{categoria?.nome || '-'}</TableCell>
                  <TableCell>{fornecedor?.nome || '-'}</TableCell>
                  <TableCell align="right">R$ {Number(produto.precoCusto || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">R$ {Number(produto.precoVenda || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    {Number(produto.quantidadeEstoque || 0)} {getUnidadeSimbolo(produto.unidadeEstoque)}
                  </TableCell>
                  <TableCell>
                    {setor ? (
                      <Box>
                        <Typography variant="body2">{setor.nome}</Typography>
                        {produto.prateleira && (
                          <Typography variant="caption" color="textSecondary">
                            Prat: {produto.prateleira}
                          </Typography>
                        )}
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: status.color + '20',
                        color: status.color,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      {status.label}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Rodapé */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary', borderTop: '1px solid #e0e0e0', pt: 2 }}>
        <Typography variant="body2">
          Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </Typography>
        <Typography variant="caption">
          Documento gerado pelo Sistema de Gestão - Todos os direitos reservados
        </Typography>
      </Box>
    </Box>
  );
});

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ModernEstoque() {
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCategoriaDialog, setOpenCategoriaDialog] = useState(false);
  const [openRelatorioDialog, setOpenRelatorioDialog] = useState(false);
  const [openMapaDialog, setOpenMapaDialog] = useState(false);
  
  // Selected items
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [produtoToDelete, setProdutoToDelete] = useState(null);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // REF PARA IMPRESSÃO
  const relatorioRef = useRef();
  
  // ESTADO PARA O MAPA DE LOCALIZAÇÃO
  const [mapaConfig, setMapaConfig] = useState({
    setores: SETORES,
    linhas: 5,
    colunas: 8,
    celulas: [],
  });

  // Estado para controlar a visualização do mapa
  const [modoVisualizacaoMapa, setModoVisualizacaoMapa] = useState('grade');

  // Stats
  const [stats, setStats] = useState({
    totalProdutos: 0,
    valorEstoque: 0,
    produtosBaixo: 0,
    produtosSemEstoque: 0,
    valorTotalCusto: 0,
    lucroPotencial: 0,
  });

  // ESTATÍSTICAS PARA RELATÓRIOS
  const [dadosGrafico, setDadosGrafico] = useState({
    porCategoria: [],
    porFornecedor: [],
    porSetor: [],
    movimentacoes: [],
  });

  // Formulário de produto
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    precoCusto: '',
    precoVenda: '',
    quantidadeEstoque: '',
    unidadeEstoque: 'un',
    unidadeVenda: 'un',
    fatorConversao: 1,
    fornecedorId: '',
    estoqueMinimo: '',
    localizacao: '',
    setor: '',
    prateleira: '',
    codigoBarras: '',
  });

  // Formulário de categoria
  const [categoriaForm, setCategoriaForm] = useState({
    nome: '',
    descricao: '',
  });

  // Configuração do react-to-print
  const handlePrint = useReactToPrint({
    contentRef: relatorioRef,
    documentTitle: `relatorio_estoque_${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      toast.loading('Preparando relatório para impressão...', { id: 'print' });
    },
    onAfterPrint: () => {
      toast.success('Relatório enviado para impressão!', { id: 'print' });
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      toast.error('Erro ao imprimir relatório', { id: 'print' });
    },
  });

  // Função segura para imprimir
  const handlePrintRelatorio = () => {
    if (!relatorioRef.current) {
      toast.error('Não há dados para imprimir');
      return;
    }
    
    if (produtos.length === 0) {
      toast.error('Não há produtos cadastrados para gerar relatório');
      return;
    }
    
    handlePrint();
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    filtrarProdutos();
    calcularStats();
    gerarDadosGraficos();
  }, [produtos, searchTerm]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [produtosData, categoriasData, fornecedoresData] = await Promise.all([
        firebaseService.getAll('produtos').catch(() => []),
        firebaseService.getAll('categorias_produtos').catch(() => []),
        firebaseService.getAll('fornecedores').catch(() => []),
      ]);
      
      setProdutos(produtosData || []);
      setCategorias(categoriasData || []);
      setFornecedores(fornecedoresData || []);
      
      // Inicializar mapa
      inicializarMapa();
      
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar estoque');
    } finally {
      setLoading(false);
    }
  };

  // INICIALIZAR MAPA DE LOCALIZAÇÃO
  const inicializarMapa = () => {
    const celulas = [];
    for (let l = 0; l < mapaConfig.linhas; l++) {
      for (let c = 0; c < mapaConfig.colunas; c++) {
        const setorId = SETORES[Math.floor(Math.random() * SETORES.length)].id;
        celulas.push({
          id: `${l}-${c}`,
          linha: l,
          coluna: c,
          setor: setorId,
          produtos: [],
        });
      }
    }
    setMapaConfig(prev => ({ ...prev, celulas }));
  };

  // ATUALIZAR MAPA COM PRODUTOS
  useEffect(() => {
    if (produtos.length > 0 && mapaConfig.celulas.length > 0) {
      const novasCelulas = mapaConfig.celulas.map(celula => {
        const produtosNaCelula = produtos.filter(p => 
          p.setor === celula.setor && 
          p.prateleira && 
          PRATELEIRAS_POR_SETOR[p.setor]?.find(pr => 
            pr.id === p.prateleira && pr.posicao === `${celula.linha + 1}-${celula.coluna + 1}`
          )
        );
        return {
          ...celula,
          produtos: produtosNaCelula,
          quantidade: produtosNaCelula.reduce((acc, p) => acc + (p.quantidadeEstoque || 0), 0),
        };
      });
      setMapaConfig(prev => ({ ...prev, celulas: novasCelulas }));
    }
  }, [produtos]);

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
        p.codigoBarras?.includes(searchTerm) ||
        p.setor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prateleira?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProdutos(filtered);
  };

  const calcularStats = () => {
    const total = produtos.length;
    const valorVenda = produtos.reduce((acc, p) => acc + (Number(p.precoVenda) * Number(p.quantidadeEstoque || 0)), 0);
    const valorCusto = produtos.reduce((acc, p) => acc + (Number(p.precoCusto) * Number(p.quantidadeEstoque || 0)), 0);
    const baixo = produtos.filter(p => Number(p.quantidadeEstoque) <= Number(p.estoqueMinimo || 5)).length;
    const semEstoque = produtos.filter(p => Number(p.quantidadeEstoque) === 0).length;

    setStats({
      totalProdutos: total,
      valorEstoque: valorVenda,
      produtosBaixo: baixo,
      produtosSemEstoque: semEstoque,
      valorTotalCusto: valorCusto,
      lucroPotencial: valorVenda - valorCusto,
    });
  };

  // GERAR DADOS PARA GRÁFICOS
  const gerarDadosGraficos = () => {
    // Por categoria
    const categoriasMap = {};
    produtos.forEach(p => {
      const cat = p.categoria || 'Sem categoria';
      categoriasMap[cat] = (categoriasMap[cat] || 0) + (p.quantidadeEstoque || 0);
    });
    
    const porCategoria = Object.keys(categoriasMap).map(key => ({
      name: categorias.find(c => c.id === key)?.nome || key,
      quantidade: categoriasMap[key],
      valor: produtos.filter(p => p.categoria === key).reduce((acc, p) => acc + (Number(p.precoVenda) * Number(p.quantidadeEstoque || 0)), 0),
    }));

    // Por setor
    const setoresMap = {};
    produtos.forEach(p => {
      const setor = p.setor || 'Sem setor';
      setoresMap[setor] = (setoresMap[setor] || 0) + (p.quantidadeEstoque || 0);
    });

    const porSetor = Object.keys(setoresMap).map(key => ({
      name: SETORES.find(s => s.id === key)?.nome || key,
      quantidade: setoresMap[key],
    }));

    setDadosGrafico({
      porCategoria,
      porSetor,
    });
  };

  const getUnidadeSimbolo = (unidade) => {
    const unidadeEncontrada = UNIDADES_MEDIDA.find(u => u.value === unidade);
    return unidadeEncontrada?.simbolo || unidade;
  };

  // Funções para categorias
  const handleOpenCategoriaDialog = (categoria = null) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setCategoriaForm({
        nome: categoria.nome || '',
        descricao: categoria.descricao || '',
      });
    } else {
      setCategoriaEditando(null);
      setCategoriaForm({
        nome: '',
        descricao: '',
      });
    }
    setOpenCategoriaDialog(true);
  };

  const handleCloseCategoriaDialog = () => {
    setOpenCategoriaDialog(false);
    setCategoriaEditando(null);
    setCategoriaForm({ nome: '', descricao: '' });
  };

  const handleSalvarCategoria = async () => {
    try {
      if (!categoriaForm.nome.trim()) {
        mostrarSnackbar('Nome da categoria é obrigatório', 'error');
        return;
      }

      const categoriaData = {
        nome: String(categoriaForm.nome).trim(),
        descricao: categoriaForm.descricao ? String(categoriaForm.descricao).trim() : '',
        updatedAt: new Date().toISOString(),
      };

      if (categoriaEditando) {
        await firebaseService.update('categorias_produtos', categoriaEditando.id, categoriaData);
        setCategorias(categorias.map(c => 
          c.id === categoriaEditando.id ? { ...c, ...categoriaData, id: categoriaEditando.id } : c
        ));
        mostrarSnackbar('Categoria atualizada com sucesso!');
      } else {
        categoriaData.dataCriacao = new Date().toISOString();
        const novoId = await firebaseService.add('categorias_produtos', categoriaData);
        setCategorias([...categorias, { ...categoriaData, id: novoId }]);
        mostrarSnackbar('Categoria criada com sucesso!');
      }

      handleCloseCategoriaDialog();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      mostrarSnackbar('Erro ao salvar categoria', 'error');
    }
  };

  const handleExcluirCategoria = async (id) => {
    const produtosNaCategoria = produtos.filter(p => p.categoria === id);
    
    if (produtosNaCategoria.length > 0) {
      mostrarSnackbar(`Não é possível excluir: ${produtosNaCategoria.length} produtos usam esta categoria`, 'error');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await firebaseService.delete('categorias_produtos', id);
        setCategorias(categorias.filter(c => c.id !== id));
        mostrarSnackbar('Categoria excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        mostrarSnackbar('Erro ao excluir categoria', 'error');
      }
    }
  };

  // Funções para produtos
  const handleAdd = () => {
    setSelectedProduto(null);
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      precoCusto: '',
      precoVenda: '',
      quantidadeEstoque: '',
      unidadeEstoque: 'un',
      unidadeVenda: 'un',
      fatorConversao: 1,
      fornecedorId: '',
      estoqueMinimo: '',
      localizacao: '',
      setor: '',
      prateleira: '',
      codigoBarras: '',
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
      unidadeEstoque: produto.unidadeEstoque || 'un',
      unidadeVenda: produto.unidadeVenda || 'un',
      fatorConversao: produto.fatorConversao || 1,
      fornecedorId: produto.fornecedorId || '',
      estoqueMinimo: produto.estoqueMinimo || '',
      localizacao: produto.localizacao || '',
      setor: produto.setor || '',
      prateleira: produto.prateleira || '',
      codigoBarras: produto.codigoBarras || '',
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

    if (!formData.nome) {
      mostrarSnackbar('Nome do produto é obrigatório', 'error');
      return;
    }

    const precoCustoNum = parseFloat(formData.precoCusto);
    const precoVendaNum = parseFloat(formData.precoVenda);
    const quantidadeNum = parseInt(formData.quantidadeEstoque);
    const estoqueMinimoNum = parseInt(formData.estoqueMinimo) || 5;
    const fatorConversaoNum = parseFloat(formData.fatorConversao) || 1;

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

    if (fatorConversaoNum <= 0) {
      mostrarSnackbar('Fator de conversão deve ser maior que zero', 'error');
      return;
    }

    const produtoData = {
      nome: String(formData.nome).trim(),
      descricao: formData.descricao ? String(formData.descricao).trim() : '',
      categoria: formData.categoria || '',
      precoCusto: Number(precoCustoNum),
      precoVenda: Number(precoVendaNum),
      quantidadeEstoque: Number(quantidadeNum),
      unidadeEstoque: String(formData.unidadeEstoque),
      unidadeVenda: String(formData.unidadeVenda),
      fatorConversao: Number(fatorConversaoNum),
      fornecedorId: formData.fornecedorId || '',
      estoqueMinimo: Number(estoqueMinimoNum),
      localizacao: formData.localizacao ? String(formData.localizacao).trim() : '',
      setor: formData.setor || '',
      prateleira: formData.prateleira || '',
      codigoBarras: formData.codigoBarras ? String(formData.codigoBarras).trim() : '',
      updatedAt: new Date().toISOString(),
    };

    try {
      if (selectedProduto) {
        await firebaseService.update('produtos', selectedProduto.id, produtoData);
        const produtosAtualizados = produtos.map(p => 
          p.id === selectedProduto.id ? { ...p, ...produtoData, id: selectedProduto.id } : p
        );
        setProdutos(produtosAtualizados);
        mostrarSnackbar('Produto atualizado com sucesso!');
      } else {
        produtoData.dataCriacao = new Date().toISOString();
        const novoId = await firebaseService.add('produtos', produtoData);
        setProdutos([...produtos, { ...produtoData, id: novoId }]);
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

  // FUNÇÕES PARA RELATÓRIOS
  const handleExportCSV = () => {
    try {
      const headers = ['Nome', 'Categoria', 'Fornecedor', 'Preço Custo', 'Preço Venda', 'Estoque', 'Setor', 'Prateleira', 'Status'];
      const data = produtos.map(p => {
        const categoria = categorias.find(c => c.id === p.categoria);
        const fornecedor = fornecedores.find(f => f.id === p.fornecedorId);
        const status = getEstoqueStatus(p.quantidadeEstoque, p.estoqueMinimo);
        const setor = SETORES.find(s => s.id === p.setor);
        
        return [
          p.nome,
          categoria?.nome || '-',
          fornecedor?.nome || '-',
          p.precoCusto?.toFixed(2),
          p.precoVenda?.toFixed(2),
          `${p.quantidadeEstoque} ${getUnidadeSimbolo(p.unidadeEstoque)}`,
          setor?.nome || '-',
          p.prateleira || '-',
          status.label,
        ];
      });

      const csvContent = [headers, ...data]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `estoque_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      mostrarSnackbar('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar relatório', 'error');
    }
  };

  // COMPONENTE DE MAPA DE LOCALIZAÇÃO
  const MapaLocalizacao = () => {
    // Função para agrupar produtos por setor na visualização de módulos
    const produtosPorSetor = () => {
      const setoresMap = {};
      produtos.forEach(produto => {
        if (produto.setor) {
          if (!setoresMap[produto.setor]) {
            setoresMap[produto.setor] = {
              setor: SETORES.find(s => s.id === produto.setor),
              produtos: [],
              totalQuantidade: 0
            };
          }
          setoresMap[produto.setor].produtos.push(produto);
          setoresMap[produto.setor].totalQuantidade += produto.quantidadeEstoque || 0;
        }
      });
      return Object.values(setoresMap);
    };

    if (modoVisualizacaoMapa === 'grade') {
      return (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {SETORES.map(setor => (
              <Chip
                key={setor.id}
                label={setor.nome}
                size="small"
                sx={{ bgcolor: setor.cor, color: 'white', fontWeight: 500 }}
              />
            ))}
          </Box>

          <Paper variant="outlined" sx={{ p: 2, overflow: 'auto' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${mapaConfig.colunas}, 1fr)`,
                gap: 1,
                minWidth: 600,
              }}
            >
              {mapaConfig.celulas.map((celula) => {
                const setor = SETORES.find(s => s.id === celula.setor);
                const temProdutos = celula.produtos && celula.produtos.length > 0;
                
                return (
                  <Tooltip
                    key={celula.id}
                    title={
                      <Box>
                        <Typography variant="body2"><strong>Setor:</strong> {setor?.nome}</Typography>
                        <Typography variant="body2"><strong>Posição:</strong> {celula.linha + 1}-{celula.coluna + 1}</Typography>
                        {temProdutos && (
                          <>
                            <Typography variant="body2"><strong>Produtos:</strong> {celula.produtos.length}</Typography>
                            <Typography variant="body2"><strong>Quantidade:</strong> {celula.quantidade}</Typography>
                            <Box sx={{ mt: 1, maxHeight: 100, overflow: 'auto' }}>
                              {celula.produtos.map(p => (
                                <Typography key={p.id} variant="caption" display="block">
                                  • {p.nome} ({p.quantidadeEstoque} {getUnidadeSimbolo(p.unidadeEstoque)})
                                </Typography>
                              ))}
                            </Box>
                          </>
                        )}
                      </Box>
                    }
                  >
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: temProdutos ? `${setor?.cor}20` : '#f5f5f5',
                        borderColor: temProdutos ? setor?.cor : '#e0e0e0',
                        borderWidth: temProdutos ? 2 : 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => {
                        if (temProdutos) {
                          setSearchTerm(setor?.nome || '');
                          setTabValue(0);
                          setOpenMapaDialog(false);
                        }
                      }}
                    >
                      <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>
                        {celula.linha + 1}-{celula.coluna + 1}
                      </Typography>
                      {temProdutos && (
                        <Badge badgeContent={celula.produtos.length} color="primary" sx={{ mt: 1 }}>
                          <InventoryIcon sx={{ fontSize: 20, color: setor?.cor }} />
                        </Badge>
                      )}
                    </Paper>
                  </Tooltip>
                );
              })}
            </Box>
          </Paper>
        </Box>
      );
    } else {
      // Visualização de Módulos (agrupado por setor)
      const setoresComProdutos = produtosPorSetor();
      
      return (
        <Box>
          <Grid container spacing={2}>
            {SETORES.map(setor => {
              const setorData = setoresComProdutos.find(s => s.setor?.id === setor.id);
              const temProdutos = setorData && setorData.produtos.length > 0;
              
              return (
                <Grid item xs={12} md={6} lg={4} key={setor.id}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      borderColor: setor.cor,
                      borderWidth: temProdutos ? 2 : 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => {
                      if (temProdutos) {
                        setSearchTerm(setor.nome);
                        setTabValue(0);
                        setOpenMapaDialog(false);
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: setor.cor, mr: 2 }}>
                          <InventoryIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {setor.nome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {temProdutos ? `${setorData.produtos.length} produtos` : 'Vazio'}
                          </Typography>
                        </Box>
                      </Box>

                      {temProdutos ? (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2">
                              Total: {setorData.totalQuantidade} unidades
                            </Typography>
                            <Chip 
                              size="small" 
                              label={`${setorData.produtos.length} itens`}
                              sx={{ bgcolor: `${setor.cor}20`, color: setor.cor }}
                            />
                          </Box>

                          <Paper variant="outlined" sx={{ maxHeight: 150, overflow: 'auto', p: 1 }}>
                            {setorData.produtos.slice(0, 5).map(produto => (
                              <Box key={produto.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" noWrap sx={{ maxWidth: '60%' }}>
                                  • {produto.nome}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={`${produto.quantidadeEstoque} ${getUnidadeSimbolo(produto.unidadeEstoque)}`}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                            ))}
                            {setorData.produtos.length > 5 && (
                              <Typography variant="caption" color="textSecondary">
                                + {setorData.produtos.length - 5} produtos...
                              </Typography>
                            )}
                          </Paper>
                        </>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <InventoryIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            Nenhum produto neste setor
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      );
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Estoque
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              startIcon={<MapIcon />}
              onClick={() => setOpenMapaDialog(true)}
              sx={{ borderColor: '#4caf50', color: '#4caf50' }}
            >
              Mapa do Estoque
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={() => setOpenRelatorioDialog(true)}
              sx={{ borderColor: '#ff4081', color: '#ff4081' }}
            >
              Relatórios
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              startIcon={<CategoryIcon />}
              onClick={() => handleOpenCategoriaDialog()}
              sx={{ borderColor: '#ff9800', color: '#ff9800' }}
            >
              Categorias
            </Button>
          </motion.div>
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

      {/* Tabs */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Produtos" />
            <Tab label="Categorias" />
            <Tab label="Fornecedores" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Barra de Pesquisa */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar produtos por nome, descrição, código de barras, setor ou prateleira..."
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
                  <TableCell><strong>Fornecedor</strong></TableCell>
                  <TableCell align="right"><strong>Preço Custo</strong></TableCell>
                  <TableCell align="right"><strong>Preço Venda</strong></TableCell>
                  <TableCell align="right"><strong>Lucro</strong></TableCell>
                  <TableCell align="right"><strong>Estoque</strong></TableCell>
                  <TableCell><strong>Localização</strong></TableCell>
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
                      const categoria = categorias.find(c => c.id === produto.categoria);
                      const fornecedor = fornecedores.find(f => f.id === produto.fornecedorId);
                      const setor = SETORES.find(s => s.id === produto.setor);
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
                                <Typography variant="caption" color="textSecondary" display="block">
                                  {produto.descricao}
                                </Typography>
                              )}
                              {produto.codigoBarras && (
                                <Typography variant="caption" color="textSecondary">
                                  Código: {produto.codigoBarras}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {categoria && (
                              <Chip
                                label={categoria.nome}
                                size="small"
                                sx={{ bgcolor: '#f3e5f5', color: '#9c27b0' }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {fornecedor ? (
                              <Box>
                                <Typography variant="body2">{fornecedor.nome}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {fornecedor.telefone}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                Não informado
                              </Typography>
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
                              {Number(produto.quantidadeEstoque || 0)} {getUnidadeSimbolo(produto.unidadeEstoque)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Venda: {getUnidadeSimbolo(produto.unidadeVenda)}
                              {produto.fatorConversao > 1 && ` (1 ${getUnidadeSimbolo(produto.unidadeEstoque)} = ${produto.fatorConversao} ${getUnidadeSimbolo(produto.unidadeVenda)})`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {setor ? (
                              <Tooltip title={`Setor: ${setor.nome} - Prateleira: ${produto.prateleira || 'Não definida'}`}>
                                <Box>
                                  <Chip
                                    label={`${setor.id}`}
                                    size="small"
                                    sx={{ bgcolor: `${setor.cor}20`, color: setor.cor, mr: 0.5 }}
                                  />
                                  {produto.prateleira && (
                                    <Chip
                                      label={produto.prateleira}
                                      size="small"
                                      variant="outlined"
                                      sx={{ borderColor: setor.cor, color: setor.cor }}
                                    />
                                  )}
                                </Box>
                              </Tooltip>
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                Não definido
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              size="small"
                              color={status.color}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Editar">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEdit(produto)}
                                sx={{ color: '#ff4081' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDelete(produto.id)}
                                sx={{ color: '#f44336' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                </AnimatePresence>
                
                {filteredProdutos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
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
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.nome}
                      </MenuItem>
                    ))}
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
                  label="Código de Barras"
                  value={formData.codigoBarras}
                  onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Setor</InputLabel>
                  <Select
                    value={formData.setor}
                    label="Setor"
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        setor: e.target.value,
                        prateleira: ''
                      });
                    }}
                  >
                    <MenuItem value="">
                      <em>Nenhum</em>
                    </MenuItem>
                    {SETORES.map(setor => (
                      <MenuItem key={setor.id} value={setor.id}>
                        {setor.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <SeletorPrateleira
                  setor={formData.setor}
                  value={formData.prateleira}
                  onChange={(prateleira) => setFormData({ ...formData, prateleira })}
                  error={formData.setor && !formData.prateleira}
                  helperText={formData.setor && !formData.prateleira ? "Selecione uma prateleira" : ""}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Localização Detalhada (Opcional)"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  size="small"
                  placeholder="Informações adicionais sobre a localização"
                  helperText="Complemento da localização, se necessário"
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
                  <InputLabel>Unidade de Estoque</InputLabel>
                  <Select
                    value={formData.unidadeEstoque}
                    label="Unidade de Estoque"
                    onChange={(e) => setFormData({ ...formData, unidadeEstoque: e.target.value })}
                  >
                    {UNIDADES_MEDIDA.map(unidade => (
                      <MenuItem key={unidade.value} value={unidade.value}>
                        {unidade.label} ({unidade.simbolo})
                      </MenuItem>
                    ))}
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
                  helperText="Alerta quando abaixo deste valor"
                  size="small"
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Unidade de Venda</InputLabel>
                  <Select
                    value={formData.unidadeVenda}
                    label="Unidade de Venda"
                    onChange={(e) => setFormData({ ...formData, unidadeVenda: e.target.value })}
                  >
                    {UNIDADES_MEDIDA.map(unidade => (
                      <MenuItem key={unidade.value} value={unidade.value}>
                        {unidade.label} ({unidade.simbolo})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fator de Conversão"
                  type="number"
                  value={formData.fatorConversao}
                  onChange={(e) => setFormData({ ...formData, fatorConversao: e.target.value })}
                  helperText="1 unidade estoque = X unidades venda"
                  size="small"
                  inputProps={{ min: 0.01, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fornecedor</InputLabel>
                  <Select
                    value={formData.fornecedorId}
                    label="Fornecedor"
                    onChange={(e) => setFormData({ ...formData, fornecedorId: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>Nenhum</em>
                    </MenuItem>
                    {fornecedores.map(forn => (
                      <MenuItem key={forn.id} value={forn.id}>
                        {forn.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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

      {/* Dialog de Categorias */}
      <Dialog open={openCategoriaDialog} onClose={handleCloseCategoriaDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff4081', color: 'white' }}>
          {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Categoria"
                value={categoriaForm.nome}
                onChange={(e) => setCategoriaForm({ ...categoriaForm, nome: e.target.value })}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                multiline
                rows={2}
                value={categoriaForm.descricao}
                onChange={(e) => setCategoriaForm({ ...categoriaForm, descricao: e.target.value })}
                size="small"
                placeholder="Descrição da categoria"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                Categorias Existentes
              </Typography>
              <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                <List dense>
                  {categorias.map((cat) => (
                    <React.Fragment key={cat.id}>
                      <ListItem>
                        <ListItemText
                          primary={cat.nome}
                          secondary={cat.descricao || 'Sem descrição'}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => {
                              handleOpenCategoriaDialog(cat);
                            }}
                            sx={{ mr: 1, color: '#ff4081' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleExcluirCategoria(cat.id)}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseCategoriaDialog}>Cancelar</Button>
          <Button
            onClick={handleSalvarCategoria}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#ff4081' }}
          >
            {categoriaEditando ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Mapa do Estoque */}
      <Dialog open={openMapaDialog} onClose={() => setOpenMapaDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          Mapa do Estoque
        </DialogTitle>
        <DialogContent>
          <MapaLocalizacao />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Box>
            <Button 
              size="small" 
              startIcon={<GridIcon />} 
              variant={modoVisualizacaoMapa === 'grade' ? 'contained' : 'outlined'}
              onClick={() => setModoVisualizacaoMapa('grade')}
              sx={modoVisualizacaoMapa === 'grade' ? { bgcolor: '#4caf50', mr: 1 } : { mr: 1 }}
            >
              Grade
            </Button>
            <Button 
              size="small" 
              startIcon={<ViewModuleIcon />} 
              variant={modoVisualizacaoMapa === 'modulos' ? 'contained' : 'outlined'}
              onClick={() => setModoVisualizacaoMapa('modulos')}
              sx={modoVisualizacaoMapa === 'modulos' ? { bgcolor: '#4caf50' } : {}}
            >
              Módulos
            </Button>
          </Box>
          <Box>
            <Button onClick={() => setOpenMapaDialog(false)} sx={{ mr: 1 }}>
              Fechar
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setOpenMapaDialog(false);
                handlePrintRelatorio();
              }}
              startIcon={<PrintIcon />}
              sx={{ bgcolor: '#4caf50' }}
            >
              Imprimir Relatório
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Dialog de Relatórios */}
      <Dialog open={openRelatorioDialog} onClose={() => setOpenRelatorioDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff4081', color: 'white' }}>
          Relatórios do Estoque
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#9c27b0' }}>
                    Resumo do Estoque
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Total de Produtos" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{stats.totalProdutos}</Typography>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Valor em Estoque (Venda)" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                        R$ {stats.valorEstoque.toFixed(2)}
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Valor em Estoque (Custo)" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        R$ {stats.valorTotalCusto.toFixed(2)}
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Lucro Potencial" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: stats.lucroPotencial > 0 ? '#4caf50' : '#f44336' }}>
                        R$ {stats.lucroPotencial.toFixed(2)}
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Produtos com Estoque Baixo" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                        {stats.produtosBaixo}
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Produtos sem Estoque" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336' }}>
                        {stats.produtosSemEstoque}
                      </Typography>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#9c27b0' }}>
                    Distribuição por Setor
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosGrafico.porSetor}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          dataKey="quantidade"
                        >
                          {dadosGrafico.porSetor.map((entry, index) => {
                            const setor = SETORES.find(s => s.nome === entry.name);
                            return (
                              <Cell key={`cell-${index}`} fill={setor?.cor || COLORS[index % COLORS.length]} />
                            );
                          })}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#9c27b0' }}>
                    Distribuição por Categoria
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosGrafico.porCategoria}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="quantidade" fill="#9c27b0" />
                        <Bar dataKey="valor" fill="#ff4081" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRelatorioDialog(false)}>Fechar</Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            Exportar CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => {
              setOpenRelatorioDialog(false);
              handlePrintRelatorio();
            }}
            sx={{ bgcolor: '#ff4081' }}
          >
            Imprimir Relatório
          </Button>
        </DialogActions>
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

      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <RelatorioEstoque 
          ref={relatorioRef}
          produtos={produtos}
          categorias={categorias}
          fornecedores={fornecedores}
          stats={stats}
          SETORES={SETORES}
          getUnidadeSimbolo={getUnidadeSimbolo}
        />
      </Box>

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
