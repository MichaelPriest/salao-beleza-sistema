// src/pages/Fornecedores.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
  LinearProgress,
  Rating,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Zoom,
  Fab,
  Skeleton,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Pagination,
  Stack,
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
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Share as ShareIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Função utilitária para formatar data com segurança
const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '—';
  
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (!isValid(dateObj)) return '—';
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '—';
  }
};

// Função para formatar CNPJ
const formatarCNPJ = (cnpj) => {
  if (!cnpj) return '';
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  if (cnpjLimpo.length !== 14) return cnpj;
  return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

// Função para formatar telefone
const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  const telLimpo = telefone.replace(/\D/g, '');
  if (telLimpo.length === 11) {
    return telLimpo.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (telLimpo.length === 10) {
    return telLimpo.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return telefone;
};

// Componente de Card de Fornecedor Mobile
const FornecedorMobileCard = ({ fornecedor, stats, onDetalhes, onCompras, onEditar, onToggleStatus, categorias }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          opacity: fornecedor.status === 'inativo' ? 0.7 : 1,
          bgcolor: fornecedor.status === 'inativo' ? '#f5f5f5' : 'white',
          '&:hover': {
            boxShadow: 3,
          },
        }}
        onClick={() => onDetalhes(fornecedor)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: fornecedor.status === 'ativo' ? '#9c27b0' : '#9e9e9e',
                width: 48,
                height: 48,
              }}
            >
              <BusinessIcon />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {fornecedor.nome}
                </Typography>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={categorias.find(c => c.value === fornecedor.categoria)?.label || fornecedor.categoria}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                
                {fornecedor.telefone && (
                  <Chip
                    size="small"
                    icon={<PhoneIcon sx={{ fontSize: 12 }} />}
                    label={formatarTelefone(fornecedor.telefone)}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                
                <Rating
                  value={Number(fornecedor.rating) || 0}
                  readOnly
                  size="small"
                  precision={0.5}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  size="small"
                  label={fornecedor.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  color={fornecedor.status === 'ativo' ? 'success' : 'error'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                
                <Typography variant="caption" color="text.secondary">
                  {stats.totalCompras} compras | R$ {stats.valorTotal.toFixed(2)}
                </Typography>
              </Box>

              {/* Ações expandidas */}
              <Collapse in={expanded}>
                <Box sx={{ 
                  mt: 2, 
                  pt: 2, 
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'flex-end'
                }} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Histórico de Compras">
                    <IconButton
                      size="small"
                      onClick={() => onCompras(fornecedor)}
                      sx={{ color: '#ff4081' }}
                    >
                      <ShoppingCartIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => onEditar(fornecedor)}
                      sx={{ color: '#2196f3' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={fornecedor.status === 'ativo' ? 'Desativar' : 'Ativar'}>
                    <IconButton
                      size="small"
                      onClick={() => onToggleStatus(fornecedor)}
                      sx={{ color: fornecedor.status === 'ativo' ? '#f44336' : '#4caf50' }}
                    >
                      {fornecedor.status === 'ativo' ? <DeleteIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente Principal
function Fornecedores() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fornecedores, setFornecedores] = useState([]);
  const [compras, setCompras] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [openComprasDialog, setOpenComprasDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [fornecedorEditando, setFornecedorEditando] = useState(null);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [fornecedorToDelete, setFornecedorToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bottomNavValue, setBottomNavValue] = useState(0);

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

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Carregando dados de fornecedores...');

      const [fornecedoresData, comprasData] = await Promise.all([
        firebaseService.getAll('fornecedores').catch(err => {
          console.error('Erro ao buscar fornecedores:', err);
          return [];
        }),
        firebaseService.getAll('compras').catch(err => {
          console.error('Erro ao buscar compras:', err);
          return [];
        }),
      ]);
      
      setFornecedores(fornecedoresData || []);
      setCompras(comprasData || []);

      // Registrar acesso na auditoria
      await auditoriaService.registrar('acesso_fornecedores', {
        entidade: 'fornecedores',
        detalhes: 'Acesso à página de fornecedores',
        dados: {
          totalFornecedores: fornecedoresData?.length || 0,
          totalCompras: comprasData?.length || 0
        }
      });
      
      console.log('📊 Dados carregados:', {
        fornecedores: fornecedoresData?.length || 0,
        compras: comprasData?.length || 0
      });

      mostrarSnackbar('Dados carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_fornecedores',
        detalhes: 'Erro ao carregar dados de fornecedores'
      });
    } finally {
      setLoading(false);
    }
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
      const fornecedor = fornecedores.find(f => f.id === fornecedorToDelete);
      
      await firebaseService.delete('fornecedores', fornecedorToDelete);
      setFornecedores(fornecedores.filter(f => f.id !== fornecedorToDelete));

      // Registrar na auditoria
      await auditoriaService.registrar('excluir_fornecedor', {
        entidade: 'fornecedores',
        entidadeId: fornecedorToDelete,
        detalhes: `Fornecedor excluído: ${fornecedor?.nome}`,
        dados: { fornecedor }
      });

      mostrarSnackbar('Fornecedor excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      mostrarSnackbar('Erro ao excluir fornecedor', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'excluir_fornecedor',
        fornecedorId: fornecedorToDelete
      });
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
        // Buscar dados antigos para auditoria
        const fornecedorAntigo = { ...fornecedorEditando };
        
        await firebaseService.update('fornecedores', fornecedorEditando.id, dadosParaSalvar);
        
        const fornecedoresAtualizados = fornecedores.map(f => 
          f.id === fornecedorEditando.id ? { ...f, ...dadosParaSalvar, id: fornecedorEditando.id } : f
        );
        setFornecedores(fornecedoresAtualizados);

        // Registrar na auditoria
        await auditoriaService.registrarAtualizacao(
          'fornecedores',
          fornecedorEditando.id,
          fornecedorAntigo,
          dadosParaSalvar,
          `Atualização do fornecedor: ${formData.nome}`
        );
        
        mostrarSnackbar('Fornecedor atualizado com sucesso!');
      } else {
        dadosParaSalvar.dataCadastro = new Date().toISOString();
        dadosParaSalvar.totalCompras = 0;
        dadosParaSalvar.valorTotalCompras = 0;
        
        const novoId = await firebaseService.add('fornecedores', dadosParaSalvar);
        setFornecedores([...fornecedores, { ...dadosParaSalvar, id: novoId }]);

        // Registrar na auditoria
        await auditoriaService.registrarCriacao(
          'fornecedores',
          novoId,
          dadosParaSalvar,
          `Criação do fornecedor: ${formData.nome}`
        );
        
        mostrarSnackbar('Fornecedor cadastrado com sucesso!');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      mostrarSnackbar('Erro ao salvar fornecedor', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: fornecedorEditando ? 'atualizar_fornecedor' : 'criar_fornecedor',
        dados: formData
      });
    }
  };

  const handleToggleStatus = async (fornecedor) => {
    try {
      const novoStatus = fornecedor.status === 'ativo' ? 'inativo' : 'ativo';
      
      await firebaseService.update('fornecedores', fornecedor.id, {
        status: novoStatus,
        updatedAt: new Date().toISOString(),
      });

      setFornecedores(prev => prev.map(f => 
        f.id === fornecedor.id ? { ...f, status: novoStatus } : f
      ));

      // Registrar na auditoria
      await auditoriaService.registrar(
        novoStatus === 'ativo' ? 'ativar_fornecedor' : 'desativar_fornecedor',
        {
          entidade: 'fornecedores',
          entidadeId: fornecedor.id,
          detalhes: `Fornecedor ${novoStatus === 'ativo' ? 'ativado' : 'desativado'}: ${fornecedor.nome}`,
          dados: { statusAnterior: fornecedor.status, statusNovo: novoStatus }
        }
      );

      mostrarSnackbar(`Fornecedor ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarSnackbar('Erro ao alterar status', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'toggle_status_fornecedor',
        fornecedorId: fornecedor.id
      });
    }
  };

  const handlePrintPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFillColor(156, 39, 176);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE FORNECEDORES', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 30, { align: 'center' });

      // Estatísticas
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      let yPos = 50;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, 170, 40, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total de Fornecedores:', 25, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.total), 70, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Ativos:', 100, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.ativos), 120, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Inativos:', 140, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.inativos), 160, yPos + 10);
      
      yPos += 25;

      // Tabela de fornecedores
      const tableColumn = ['Fornecedor', 'CNPJ', 'Contato', 'Categoria', 'Avaliação', 'Status'];
      const tableRows = [];
      
      fornecedoresFiltrados.slice(0, 50).forEach(f => {
        const row = [
          f.nome,
          formatarCNPJ(f.cnpj),
          f.telefone || f.celular || '—',
          categorias.find(c => c.value === f.categoria)?.label || f.categoria,
          f.rating ? `${f.rating} ★` : '—',
          f.status === 'ativo' ? 'Ativo' : 'Inativo',
        ];
        tableRows.push(row);
      });
      
      doc.autoTable({
        startY: yPos,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [156, 39, 176],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
      });
      
      // Registrar na auditoria
      await auditoriaService.registrar('exportar_fornecedores', {
        entidade: 'fornecedores',
        detalhes: 'Exportação de relatório de fornecedores',
        dados: {
          formato: 'PDF',
          totalFornecedores: fornecedoresFiltrados.length,
          stats
        }
      });
      
      window.open(doc.output('bloburl'), '_blank');
      setOpenPrintDialog(false);
      mostrarSnackbar('PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarSnackbar('Erro ao gerar PDF', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_fornecedores_pdf',
        detalhes: 'Erro ao gerar PDF de fornecedores'
      });
    }
  };

  const handleExportarCSV = async () => {
    try {
      const dadosExport = fornecedoresFiltrados.map(f => ({
        'Razão Social': f.nome,
        'Nome Fantasia': f.nomeFantasia || '',
        'CNPJ': formatarCNPJ(f.cnpj),
        'Inscrição Estadual': f.ie || '',
        'Telefone': formatarTelefone(f.telefone),
        'Celular': formatarTelefone(f.celular),
        'Email': f.email || '',
        'Site': f.site || '',
        'Categoria': categorias.find(c => c.value === f.categoria)?.label || f.categoria,
        'Avaliação': f.rating || '',
        'Endereço': f.endereco ? `${f.endereco.logradouro}, ${f.endereco.numero} ${f.endereco.complemento || ''} - ${f.endereco.bairro}, ${f.endereco.cidade}/${f.endereco.estado} CEP: ${f.endereco.cep}` : '',
        'Contato Nome': f.contato?.nome || '',
        'Contato Cargo': f.contato?.cargo || '',
        'Contato Telefone': f.contato?.telefone || '',
        'Contato Email': f.contato?.email || '',
        'Prazo Entrega': `${f.prazoEntrega || 0} dias`,
        'Formas Pagamento': f.formasPagamento?.join(', ') || '',
        'Status': f.status === 'ativo' ? 'Ativo' : 'Inativo',
        'Observações': f.observacoes || '',
        'Data Cadastro': f.dataCadastro ? formatDate(f.dataCadastro) : '',
      }));

      const headers = Object.keys(dadosExport[0] || {});
      const csvContent = [
        headers.join(','),
        ...dadosExport.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `fornecedores_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      await auditoriaService.registrar('exportar_fornecedores', {
        entidade: 'fornecedores',
        detalhes: 'Exportação de relatório de fornecedores',
        dados: {
          formato: 'CSV',
          totalFornecedores: fornecedoresFiltrados.length
        }
      });

      setOpenPrintDialog(false);
      mostrarSnackbar('CSV exportado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      mostrarSnackbar('Erro ao exportar CSV', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_fornecedores_csv',
        detalhes: 'Erro ao exportar CSV de fornecedores'
      });
    }
  };

  // Calcular estatísticas do fornecedor
  const getFornecedorStats = useCallback((fornecedorId) => {
    const comprasFornecedor = compras.filter(c => c.fornecedorId === fornecedorId);
    return {
      totalCompras: comprasFornecedor.length,
      valorTotal: comprasFornecedor.reduce((acc, c) => acc + (Number(c.valorTotal) || 0), 0),
      ultimaCompra: comprasFornecedor.length > 0 
        ? new Date(Math.max(...comprasFornecedor.map(c => new Date(c.dataCompra))))
        : null,
    };
  }, [compras]);

  // Filtrar fornecedores
  const fornecedoresFiltrados = useMemo(() => {
    return fornecedores.filter(f => {
      const matchesTexto = filtro === '' || 
        f.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        f.nomeFantasia?.toLowerCase().includes(filtro.toLowerCase()) ||
        f.cnpj?.includes(filtro.replace(/[^\d]/g, '')) ||
        f.email?.toLowerCase().includes(filtro.toLowerCase()) ||
        f.telefone?.includes(filtro);

      const matchesCategoria = filtroCategoria === 'todos' || f.categoria === filtroCategoria;
      const matchesStatus = filtroStatus === 'todos' || f.status === filtroStatus;

      return matchesTexto && matchesCategoria && matchesStatus;
    });
  }, [fornecedores, filtro, filtroCategoria, filtroStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    return {
      total: fornecedores.length,
      ativos: fornecedores.filter(f => f.status === 'ativo').length,
      inativos: fornecedores.filter(f => f.status === 'inativo').length,
      categorias: categorias.length,
      totalCompras: compras.length,
      valorTotalCompras: compras.reduce((acc, c) => acc + (Number(c.valorTotal) || 0), 0),
    };
  }, [fornecedores, compras]);

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

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 120 : 60} sx={{ borderRadius: 2, mb: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      pb: isMobile ? 10 : 3,
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      {/* Cabeçalho Mobile */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ 
              fontWeight: 700, 
              color: '#9c27b0',
              fontSize: isMobile ? '1.5rem' : '2.125rem'
            }}
          >
            Fornecedores
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {stats.total} fornecedores cadastrados
          </Typography>
        </Box>
        
        <Zoom in={true}>
          <Fab
            size="small"
            onClick={() => setOpenPrintDialog(true)}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
            }}
          >
            <PrintIcon />
          </Fab>
        </Zoom>
      </Box>

      {/* Cards de Estatísticas Mobile */}
      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Ativos
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.ativos}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Inativos
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {stats.inativos}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Compras
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {stats.totalCompras}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Barra de Pesquisa e Filtros */}
      <Paper
        elevation={0}
        sx={{
          p: 0.5,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar fornecedor..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', ml: 1 }} />
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
          sx={{ ml: 1 }}
        />
        
        <IconButton 
          onClick={() => setOpenFilterDrawer(true)}
          sx={{ 
            mx: 1,
            color: filtroCategoria !== 'todos' || filtroStatus !== 'todos' ? '#9c27b0' : 'text.secondary'
          }}
        >
          <Badge 
            variant="dot" 
            color="primary"
            invisible={filtroCategoria === 'todos' && filtroStatus === 'todos'}
          >
            <FilterIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={carregarDados} sx={{ color: 'text.secondary' }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Botão Novo Fornecedor Mobile */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
        >
          Novo Fornecedor
        </Button>
      </Box>

      {/* Lista de Fornecedores Mobile */}
      <AnimatePresence>
        {paginatedFornecedores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhum fornecedor encontrado
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2, borderColor: '#9c27b0', color: '#9c27b0' }}
              >
                Novo Fornecedor
              </Button>
            </Paper>
          </motion.div>
        ) : (
          paginatedFornecedores.map((fornecedor) => {
            const stats = getFornecedorStats(fornecedor.id);
            return (
              <FornecedorMobileCard
                key={fornecedor.id}
                fornecedor={fornecedor}
                stats={stats}
                onDetalhes={handleOpenDetalhes}
                onCompras={handleOpenCompras}
                onEditar={handleOpenDialog}
                onToggleStatus={handleToggleStatus}
                categorias={categorias}
              />
            );
          })
        )}
      </AnimatePresence>

      {/* Paginação */}
      {fornecedoresFiltrados.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(fornecedoresFiltrados.length / rowsPerPage)}
              page={page + 1}
              onChange={(e, v) => setPage(v - 1)}
              color="primary"
              size={isMobile ? "small" : "large"}
            />
          </Stack>
        </Box>
      )}

      {/* Drawer de Filtros */}
      <SwipeableDrawer
        anchor="bottom"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        onOpen={() => setOpenFilterDrawer(true)}
        disableSwipeToOpen={false}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80vh',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filtros
            </Typography>
            <IconButton onClick={() => setOpenFilterDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Categoria
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, maxHeight: 200, overflow: 'auto' }}>
            <Button
              fullWidth
              variant={filtroCategoria === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroCategoria('todos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todas as categorias
            </Button>
            {categorias.map((cat) => (
              <Button
                key={cat.value}
                fullWidth
                variant={filtroCategoria === cat.value ? 'contained' : 'outlined'}
                onClick={() => setFiltroCategoria(cat.value)}
                sx={{ justifyContent: 'flex-start' }}
              >
                <CategoryIcon sx={{ mr: 1, fontSize: 18 }} />
                {cat.label}
              </Button>
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Status
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant={filtroStatus === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroStatus('todos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todos os status
            </Button>
            <Button
              fullWidth
              variant={filtroStatus === 'ativo' ? 'contained' : 'outlined'}
              onClick={() => setFiltroStatus('ativo')}
              sx={{ 
                justifyContent: 'flex-start',
                color: filtroStatus === 'ativo' ? 'white' : '#4caf50',
                borderColor: '#4caf50',
                bgcolor: filtroStatus === 'ativo' ? '#4caf50' : 'transparent',
              }}
            >
              <CheckIcon sx={{ mr: 1, fontSize: 18 }} />
              Ativos
            </Button>
            <Button
              fullWidth
              variant={filtroStatus === 'inativo' ? 'contained' : 'outlined'}
              onClick={() => setFiltroStatus('inativo')}
              sx={{ 
                justifyContent: 'flex-start',
                color: filtroStatus === 'inativo' ? 'white' : '#f44336',
                borderColor: '#f44336',
                bgcolor: filtroStatus === 'inativo' ? '#f44336' : 'transparent',
              }}
            >
              <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
              Inativos
            </Button>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={() => setOpenFilterDrawer(false)}
            sx={{ bgcolor: '#9c27b0', mt: 3 }}
          >
            Aplicar Filtros
          </Button>
        </Box>
      </SwipeableDrawer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullScreen={isMobile}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#9c27b0', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: isMobile ? 2 : 3,
        }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={handleCloseDialog}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            {fornecedorEditando ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
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
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={handleCloseDialog} fullWidth={isMobile}>Cancelar</Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
            fullWidth={isMobile}
          >
            {fornecedorEditando ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog 
        open={openDetalhesDialog} 
        onClose={handleCloseDetalhes}
        fullScreen={isMobile}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#9c27b0', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: isMobile ? 2 : 3,
        }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={handleCloseDetalhes}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            Detalhes do Fornecedor
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          {fornecedorSelecionado && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: '#9c27b0' }}>
                        <BusinessIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{fornecedorSelecionado.nome}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatarCNPJ(fornecedorSelecionado.cnpj)}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Rating value={Number(fornecedorSelecionado.rating) || 0} readOnly size="small" />
                        </Box>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Telefone</Typography>
                        <Typography variant="body2">{formatarTelefone(fornecedorSelecionado.telefone) || '—'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Celular</Typography>
                        <Typography variant="body2">{formatarTelefone(fornecedorSelecionado.celular) || '—'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Email</Typography>
                        <Typography variant="body2">{fornecedorSelecionado.email || '—'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Site</Typography>
                        <Typography variant="body2">{fornecedorSelecionado.site || '—'}</Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>
                          Endereço
                        </Typography>
                        <Typography variant="body2">
                          {fornecedorSelecionado.endereco?.logradouro ? (
                            <>
                              {fornecedorSelecionado.endereco.logradouro}, {fornecedorSelecionado.endereco.numero}
                              {fornecedorSelecionado.endereco.complemento && ` - ${fornecedorSelecionado.endereco.complemento}`}
                              <br />
                              {fornecedorSelecionado.endereco.bairro} - {fornecedorSelecionado.endereco.cidade}/{fornecedorSelecionado.endereco.estado}
                              <br />
                              CEP: {fornecedorSelecionado.endereco.cep}
                            </>
                          ) : '—'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Categoria</Typography>
                        <Typography variant="body2">
                          {categorias.find(c => c.value === fornecedorSelecionado.categoria)?.label || fornecedorSelecionado.categoria}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Prazo de Entrega</Typography>
                        <Typography variant="body2">{fornecedorSelecionado.prazoEntrega} dias</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={fornecedorSelecionado.status}
                            size="small"
                            color={fornecedorSelecionado.status === 'ativo' ? 'success' : 'error'}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Cadastro</Typography>
                        <Typography variant="body2">
                          {fornecedorSelecionado.dataCadastro ? formatDate(fornecedorSelecionado.dataCadastro) : '—'}
                        </Typography>
                      </Grid>

                      {fornecedorSelecionado.formasPagamento?.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>
                            Formas de Pagamento
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {fornecedorSelecionado.formasPagamento.map(forma => (
                              <Chip
                                key={forma}
                                label={forma.replace('_', ' ').toUpperCase()}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Grid>
                      )}

                      {fornecedorSelecionado.contato?.nome && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>
                            Contato Principal
                          </Typography>
                          <Typography variant="body2">
                            <strong>{fornecedorSelecionado.contato.nome}</strong>
                            {fornecedorSelecionado.contato.cargo && ` - ${fornecedorSelecionado.contato.cargo}`}
                          </Typography>
                          {fornecedorSelecionado.contato.telefone && (
                            <Typography variant="body2">{formatarTelefone(fornecedorSelecionado.contato.telefone)}</Typography>
                          )}
                          {fornecedorSelecionado.contato.email && (
                            <Typography variant="body2">{fornecedorSelecionado.contato.email}</Typography>
                          )}
                        </Grid>
                      )}

                      {fornecedorSelecionado.observacoes && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>
                            Observações
                          </Typography>
                          <Typography variant="body2">{fornecedorSelecionado.observacoes}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={handleCloseDetalhes} fullWidth={isMobile}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Histórico de Compras */}
      <Dialog 
        open={openComprasDialog} 
        onClose={handleCloseCompras}
        fullScreen={isMobile}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#ff4081', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: isMobile ? 2 : 3,
        }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={handleCloseCompras}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            Histórico de Compras - {fornecedorSelecionado?.nome}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          {fornecedorSelecionado && (
            <Box>
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
                          <TableCell>{compra.dataCompra ? formatDate(compra.dataCompra) : '—'}</TableCell>
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
                <Paper sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5' }}>
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
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={handleCloseCompras} fullWidth={isMobile}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Impressão */}
      <Dialog 
        open={openPrintDialog} 
        onClose={() => setOpenPrintDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PrintIcon />
            <Typography variant="h6">Exportar Relatório</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Escolha o formato para exportar:
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePrintPDF}
                  sx={{ 
                    p: 3,
                    bgcolor: '#f44336',
                    '&:hover': { bgcolor: '#d32f2f' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <PictureAsPdfIcon sx={{ fontSize: 40 }} />
                  <Typography variant="body1">PDF</Typography>
                  <Typography variant="caption">Relatório profissional</Typography>
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleExportarCSV}
                  sx={{ 
                    p: 3,
                    bgcolor: '#2196f3',
                    '&:hover': { bgcolor: '#1976d2' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <DownloadIcon sx={{ fontSize: 40 }} />
                  <Typography variant="body1">CSV</Typography>
                  <Typography variant="caption">Planilha/editável</Typography>
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  Total de fornecedores: {stats.total}
                </Typography>
                <Typography variant="body2">
                  Ativos: {stats.ativos} | Inativos: {stats.inativos}
                </Typography>
                <Typography variant="body2">
                  Total de compras: {stats.totalCompras}
                </Typography>
                <Typography variant="body2">
                  Valor total em compras: R$ {stats.valorTotalCompras.toFixed(2)}
                </Typography>
              </Alert>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <WarningIcon sx={{ fontSize: 48, color: '#f44336', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Tem certeza que deseja excluir este fornecedor?
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Esta ação não poderá ser desfeita. Todas as compras associadas a este fornecedor também serão afetadas.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} fullWidth={isMobile}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={confirmDelete}
            fullWidth={isMobile}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bottom Navigation Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1000,
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => {
              setBottomNavValue(newValue);
              switch(newValue) {
                case 0:
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  break;
                case 1:
                  setOpenFilterDrawer(true);
                  break;
                case 2:
                  handleOpenDialog();
                  break;
                case 3:
                  setOpenPrintDialog(true);
                  break;
                default:
                  break;
              }
            }}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root.Mui-selected': {
                color: '#9c27b0',
              },
            }}
          >
            <BottomNavigationAction label="Início" icon={<BusinessIcon />} />
            <BottomNavigationAction 
              label="Filtros" 
              icon={
                <Badge 
                  variant="dot" 
                  color="primary"
                  invisible={filtroCategoria === 'todos' && filtroStatus === 'todos'}
                >
                  <FilterIcon />
                </Badge>
              } 
            />
            <BottomNavigationAction label="Novo" icon={<AddIcon />} />
            <BottomNavigationAction label="Exportar" icon={<PrintIcon />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Fornecedores;
