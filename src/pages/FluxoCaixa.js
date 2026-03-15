// src/pages/FluxoCaixa.js
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
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
  LinearProgress,
  Avatar,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  PictureAsPdf as PictureAsPdfIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Category as CategoryIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
  FileCopy as FileCopyIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  ReceiptLong as ReceiptLongIcon,
  PriceCheck as PriceCheckIcon,
  SwapHoriz as SwapHorizIcon,
  Savings as SavingsIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon,
  ShoppingCart as ShoppingCartIcon,
  Percent as PercentIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, isValid } from 'date-fns';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Constantes
const COLORS = ['#9c27b0', '#ff4081', '#4caf50', '#ff9800', '#f44336', '#2196f3', '#00bcd4', '#795548'];

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente', icon: <WarningIcon /> },
  pago: { color: '#4caf50', label: 'Pago', icon: <CheckCircleIcon /> },
  atrasado: { color: '#f44336', label: 'Atrasado', icon: <CancelIcon /> },
  cancelado: { color: '#9e9e9e', label: 'Cancelado', icon: <CancelIcon /> },
  recebido: { color: '#4caf50', label: 'Recebido', icon: <CheckCircleIcon /> },
  agendado: { color: '#2196f3', label: 'Agendado', icon: <CalendarIcon /> },
  concluida: { color: '#4caf50', label: 'Concluída', icon: <CheckCircleIcon /> },
  cancelada: { color: '#f44336', label: 'Cancelada', icon: <CancelIcon /> },
};

const tipoColors = {
  receita: { color: '#4caf50', label: 'Receita', icon: <TrendingUpIcon /> },
  despesa: { color: '#f44336', label: 'Despesa', icon: <TrendingDownIcon /> },
  transferencia: { color: '#9c27b0', label: 'Transferência', icon: <SwapHorizIcon /> },
  investimento: { color: '#ff9800', label: 'Investimento', icon: <ShowChartIcon /> },
  comissao: { color: '#9c27b0', label: 'Comissão', icon: <PercentIcon /> },
  compra: { color: '#ff9800', label: 'Compra', icon: <ShoppingCartIcon /> },
};

const formasPagamento = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '⚡' },
  { value: 'boleto', label: 'Boleto', icon: '📄' },
  { value: 'transferencia', label: 'Transferência', icon: '🔄' },
  { value: 'cheque', label: 'Cheque', icon: '📝' },
  { value: 'credito_loja', label: 'Crédito na Loja', icon: '🏪' },
];

// Função para formatar data no horário de Brasília
const formatarDataBrasilia = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'yyyy-MM-dd');
};

const formatarDataExibicao = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (!isValid(d)) return '—';
    return format(d, 'dd/MM/yyyy');
  } catch {
    return '—';
  }
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Componente de Card de Transação Mobile
const TransacaoMobileCard = ({ transacao, onDetalhes, onMarcarPago, onDuplicar, onArquivar, clientes, fornecedores, profissionais }) => {
  const cliente = clientes?.find(c => c.id === transacao.clienteId);
  const fornecedor = fornecedores?.find(f => f.id === transacao.fornecedorId);
  const profissional = profissionais?.find(p => p.id === transacao.profissionalId);
  
  let iconeTipo = <ReceiptIcon />;
  let corTipo = '#757575';
  
  if (transacao.origem === 'comissao') {
    iconeTipo = <PercentIcon />;
    corTipo = '#9c27b0';
  } else if (transacao.origem === 'compra') {
    iconeTipo = <ShoppingCartIcon />;
    corTipo = '#ff9800';
  } else if (transacao.tipo === 'receita') {
    iconeTipo = <TrendingUpIcon />;
    corTipo = '#4caf50';
  } else if (transacao.tipo === 'despesa') {
    iconeTipo = <TrendingDownIcon />;
    corTipo = '#f44336';
  }

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
          opacity: transacao.arquivado ? 0.7 : 1,
          bgcolor: transacao.arquivado ? '#f5f5f5' : 'white',
          '&:hover': {
            boxShadow: 3,
          },
        }}
        onClick={() => onDetalhes(transacao)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: corTipo,
                width: 48,
                height: 48,
              }}
            >
              {iconeTipo}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {transacao.descricao || 'Sem descrição'}
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 700,
                    color: transacao.tipo === 'receita' ? '#4caf50' : '#f44336'
                  }}
                >
                  {transacao.tipo === 'receita' ? '+' : '-'} R$ {Number(transacao.valor || 0).toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={transacao.origem === 'comissao' ? 'Comissão' : 
                         transacao.origem === 'compra' ? 'Compra' : 
                         transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    bgcolor: transacao.origem === 'comissao' ? '#f3e5f5' :
                            transacao.origem === 'compra' ? '#fff3e0' :
                            transacao.tipo === 'receita' ? '#e8f5e9' : '#ffebee',
                    color: transacao.origem === 'comissao' ? '#9c27b0' :
                           transacao.origem === 'compra' ? '#ff9800' :
                           transacao.tipo === 'receita' ? '#4caf50' : '#f44336',
                  }}
                />
                
                {transacao.categoria && (
                  <Chip
                    size="small"
                    label={transacao.categoria}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                
                {transacao.formaPagamento && (
                  <Chip
                    size="small"
                    label={formasPagamento.find(fp => fp.value === transacao.formaPagamento)?.label || transacao.formaPagamento}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}

                {(profissional || transacao.profissionalNome) && (
                  <Chip
                    size="small"
                    icon={<PeopleIcon sx={{ fontSize: 12 }} />}
                    label={profissional?.nome || transacao.profissionalNome}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}

                {transacao.percentual && (
                  <Chip
                    size="small"
                    label={`${transacao.percentual}%`}
                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f3e5f5' }}
                  />
                )}
                
                <Typography variant="caption" color="text.secondary">
                  {formatarDataExibicao(transacao.data)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  size="small"
                  icon={statusColors[transacao.status]?.icon}
                  label={statusColors[transacao.status]?.label || transacao.status}
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: `${statusColors[transacao.status]?.color}20`,
                    color: statusColors[transacao.status]?.color,
                    '& .MuiChip-icon': { color: statusColors[transacao.status]?.color, fontSize: 12 },
                  }}
                />

                {transacao.dataVencimento && new Date(transacao.dataVencimento) < new Date() && transacao.status === 'pendente' && (
                  <Chip
                    size="small"
                    label="Vencida"
                    color="error"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}

                {transacao.parcelas > 1 && (
                  <Chip
                    size="small"
                    label={`${transacao.parcelas}x`}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}

                {transacao.arquivado && (
                  <Chip
                    size="small"
                    label="Arquivado"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>

              {/* Ações - Parar propagação do clique */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: 0.5,
                mt: 1,
              }} onClick={(e) => e.stopPropagation()}>
                <Tooltip title="Ver Detalhes">
                  <IconButton
                    size="small"
                    onClick={() => onDetalhes(transacao)}
                    sx={{ color: '#9c27b0' }}
                  >
                    <ReceiptIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {transacao.status === 'pendente' && !transacao.arquivado && (
                  <Tooltip title="Marcar como Pago">
                    <IconButton
                      size="small"
                      onClick={() => onMarcarPago(transacao)}
                      sx={{ color: '#4caf50' }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {transacao.origem === 'manual' && !transacao.arquivado && (
                  <Tooltip title="Duplicar">
                    <IconButton
                      size="small"
                      onClick={() => onDuplicar(transacao)}
                      sx={{ color: '#2196f3' }}
                    >
                      <FileCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {transacao.origem === 'manual' && (
                  <Tooltip title={transacao.arquivado ? 'Desarquivar' : 'Arquivar'}>
                    <IconButton
                      size="small"
                      onClick={() => onArquivar(transacao)}
                      sx={{ color: transacao.arquivado ? '#ff9800' : '#757575' }}
                    >
                      {transacao.arquivado ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function FluxoCaixa() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estados
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  
  // Dados
  const [transacoes, setTransacoes] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [contasPagar, setContasPagar] = useState([]);
  const [contasReceber, setContasReceber] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [caixa, setCaixa] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  
  // Filtros
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [dataInicio, setDataInicio] = useState(formatarDataBrasilia(startOfMonth(new Date())));
  const [dataFim, setDataFim] = useState(formatarDataBrasilia(new Date()));
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // UI States
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openDetalheDialog, setOpenDetalheDialog] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [openRelatorioDialog, setOpenRelatorioDialog] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      
      console.log('🔄 Carregando dados financeiros...');

      const [
        transacoesData,
        comissoesData,
        comprasData,
        caixaData, 
        clientesData, 
        fornecedoresData,
        profissionaisData,
        servicosData
      ] = await Promise.all([
        firebaseService.getAll('transacoes').catch(err => {
          console.error('Erro ao buscar transacoes:', err);
          return [];
        }),
        firebaseService.getAll('comissoes').catch(err => {
          console.error('Erro ao buscar comissoes:', err);
          return [];
        }),
        firebaseService.getAll('compras').catch(err => {
          console.error('Erro ao buscar compras:', err);
          return [];
        }),
        firebaseService.getAll('caixa').catch(err => {
          console.error('Erro ao buscar caixa:', err);
          return [];
        }),
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('fornecedores').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
      ]);
      
      // Garantir que todos os dados são arrays
      const transacoesArray = Array.isArray(transacoesData) ? transacoesData : [];
      const comissoesArray = Array.isArray(comissoesData) ? comissoesData : [];
      const comprasArray = Array.isArray(comprasData) ? comprasData : [];
      const clientesArray = Array.isArray(clientesData) ? clientesData : [];
      const fornecedoresArray = Array.isArray(fornecedoresData) ? fornecedoresData : [];
      const profissionaisArray = Array.isArray(profissionaisData) ? profissionaisData : [];
      const servicosArray = Array.isArray(servicosData) ? servicosData : [];
      
      setComissoes(comissoesArray);
      setCompras(comprasArray);
      setClientes(clientesArray);
      setFornecedores(fornecedoresArray);
      setProfissionais(profissionaisArray);
      setServicos(servicosArray);
      
      // Converter comissões para transações financeiras
      const transacoesComissoes = comissoesArray
        .filter(c => c.status !== 'cancelado')
        .map(comissao => ({
          id: `comissao_${comissao.id}`,
          tipo: 'despesa',
          origem: 'comissao',
          origemId: comissao.id,
          descricao: `Comissão - ${comissao.servicoNome || 'Serviço'} - ${comissao.profissionalNome || ''}`,
          valor: comissao.valor || 0,
          data: comissao.dataRegistro ? comissao.dataRegistro.split('T')[0] : comissao.data,
          dataVencimento: comissao.data,
          categoria: 'Comissões',
          formaPagamento: 'credito_loja',
          status: comissao.status === 'pago' ? 'pago' : 'pendente',
          profissionalId: comissao.profissionalId,
          profissionalNome: comissao.profissionalNome,
          atendimentoId: comissao.atendimentoId,
          servicoId: comissao.servicoId,
          servicoNome: comissao.servicoNome,
          percentual: comissao.percentual,
          valorAtendimento: comissao.valorAtendimento,
          observacoes: `Comissão de ${comissao.percentual}% sobre atendimento de R$ ${comissao.valorAtendimento}`,
          createdAt: comissao.createdAt,
          updatedAt: comissao.updatedAt,
          arquivado: false,
        }));

      // Converter compras para transações financeiras
      const transacoesCompras = comprasArray
        .filter(c => c.status !== 'cancelada')
        .map(compra => ({
          id: `compra_${compra.id}`,
          tipo: 'despesa',
          origem: 'compra',
          origemId: compra.id,
          descricao: `Compra - ${compra.numeroPedido || 'Pedido'}`,
          valor: compra.valorTotal || 0,
          data: compra.dataCompra,
          dataVencimento: compra.dataCompra,
          categoria: 'Compras',
          formaPagamento: compra.formaPagamento || 'pix',
          status: compra.status === 'pago' ? 'pago' : (compra.status === 'cancelada' ? 'cancelado' : 'pendente'),
          fornecedorId: compra.fornecedorId,
          numeroPedido: compra.numeroPedido,
          prazoEntrega: compra.prazoEntrega,
          itens: compra.itens || [],
          observacoes: compra.observacoes,
          createdAt: compra.createdAt,
          updatedAt: compra.updatedAt,
          arquivado: false,
        }));

      // Combinar todas as transações
      const todasTransacoes = [
        ...transacoesArray,
        ...transacoesComissoes,
        ...transacoesCompras
      ];

      // Ordenar por data (mais recentes primeiro)
      todasTransacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

      setTransacoes(todasTransacoes);
      
      // Separar contas a pagar e receber
      const aPagar = todasTransacoes.filter(t => 
        t.tipo === 'despesa' && t.status !== 'pago' && t.status !== 'cancelado' && !t.arquivado
      );
      const aReceber = todasTransacoes.filter(t => 
        t.tipo === 'receita' && t.status !== 'pago' && t.status !== 'cancelado' && !t.arquivado
      );
      
      setContasPagar(aPagar);
      setContasReceber(aReceber);
      
      // Extrair categorias únicas
      const categoriasUnicas = [...new Set(todasTransacoes
        .map(t => t.categoria)
        .filter(Boolean)
      )];
      setCategorias(categoriasUnicas);
      
      // Processar caixa
      if (caixaData && caixaData.length > 0) {
        const caixaAtual = caixaData
          .filter(c => c && c.dataAbertura)
          .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))[0];
        setCaixa(caixaAtual);
      } else {
        setCaixa({ saldoAtual: 0, status: 'fechado', movimentacoes: [] });
      }

      // Registrar acesso na auditoria
      await auditoriaService.registrar('acesso_fluxo_caixa', {
        entidade: 'fluxo_caixa',
        detalhes: 'Acesso à página de fluxo de caixa',
        dados: {
          periodoInicio: dataInicio,
          periodoFim: dataFim,
          totalTransacoes: transacoesArray.length,
          totalComissoes: comissoesArray.length,
          totalCompras: comprasArray.length
        }
      });
      
      console.log('📊 Dados carregados:', {
        transacoes: transacoesArray.length,
        comissoes: comissoesArray.length,
        compras: comprasArray.length,
        clientes: clientesArray.length,
        fornecedores: fornecedoresArray.length,
        profissionais: profissionaisArray.length
      });

      mostrarSnackbar('Dados carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_fluxo_caixa',
        detalhes: 'Erro ao carregar dados de fluxo de caixa'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para pagar comissão
  const handlePagarComissao = async (comissaoId) => {
    try {
      await firebaseService.update('comissoes', comissaoId, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Atualizar estado local
      const comissoesAtualizadas = comissoes.map(c => 
        c.id === comissaoId ? { ...c, status: 'pago', dataPagamento: new Date().toISOString() } : c
      );
      setComissoes(comissoesAtualizadas);

      // Recarregar transações
      await carregarDados();

      // Registrar na auditoria
      await auditoriaService.registrar('pagar_comissao', {
        entidade: 'comissoes',
        entidadeId: comissaoId,
        detalhes: 'Pagamento de comissão',
      });

      mostrarSnackbar('✅ Comissão paga com sucesso!');
    } catch (error) {
      console.error('Erro ao pagar comissão:', error);
      mostrarSnackbar('Erro ao pagar comissão', 'error');
    }
  };

  // Função para pagar compra
  const handlePagarCompra = async (compraId) => {
    try {
      await firebaseService.update('compras', compraId, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const comprasAtualizadas = compras.map(c => 
        c.id === compraId ? { ...c, status: 'pago', dataPagamento: new Date().toISOString() } : c
      );
      setCompras(comprasAtualizadas);

      await carregarDados();

      await auditoriaService.registrar('pagar_compra', {
        entidade: 'compras',
        entidadeId: compraId,
        detalhes: 'Pagamento de compra',
      });

      mostrarSnackbar('✅ Compra paga com sucesso!');
    } catch (error) {
      console.error('Erro ao pagar compra:', error);
      mostrarSnackbar('Erro ao pagar compra', 'error');
    }
  };

  // Função para marcar transação como paga
  const handleMarcarComoPago = async (transacao) => {
    try {
      if (!transacao || !transacao.id) {
        mostrarSnackbar('Transação inválida', 'error');
        return;
      }

      if (transacao.origem === 'comissao' && transacao.origemId) {
        await handlePagarComissao(transacao.origemId);
        return;
      }

      if (transacao.origem === 'compra' && transacao.origemId) {
        await handlePagarCompra(transacao.origemId);
        return;
      }

      const dadosTransacao = {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await firebaseService.update('transacoes', transacao.id, dadosTransacao);

      await carregarDados();

      if (caixa && caixa.status === 'aberto' && caixa.id) {
        const valorOperacao = transacao.tipo === 'receita' ? transacao.valor : -transacao.valor;
        const novoSaldo = (caixa.saldoAtual || 0) + valorOperacao;
        
        const novaMovimentacao = {
          id: Date.now().toString(),
          tipo: transacao.tipo,
          valor: Number(transacao.valor),
          descricao: String(transacao.descricao || ''),
          data: new Date().toISOString(),
          transacaoId: String(transacao.id),
        };
        
        const movimentacoesAtuais = Array.isArray(caixa.movimentacoes) ? caixa.movimentacoes : [];
        const novasMovimentacoes = [...movimentacoesAtuais, novaMovimentacao];
        
        await firebaseService.update('caixa', caixa.id, {
          saldoAtual: Number(novoSaldo),
          movimentacoes: novasMovimentacoes,
          updatedAt: new Date().toISOString(),
        });
        
        setCaixa({ 
          ...caixa, 
          saldoAtual: novoSaldo, 
          movimentacoes: novasMovimentacoes 
        });
      }

      await auditoriaService.registrar('marcar_transacao_paga', {
        entidade: 'transacoes',
        entidadeId: transacao.id,
        detalhes: `Transação marcada como paga: ${transacao.descricao}`,
      });

      mostrarSnackbar('✅ Transação marcada como paga!');
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      mostrarSnackbar('Erro ao processar pagamento', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'marcar_transacao_paga',
        transacaoId: transacao?.id
      });
    }
  };

  // Função para duplicar transação
  const handleDuplicar = async (transacao) => {
    try {
      if (transacao.origem !== 'manual') {
        mostrarSnackbar('Apenas transações manuais podem ser duplicadas', 'warning');
        return;
      }

      const { id, createdAt, updatedAt, ...dados } = transacao;
      
      const novaTransacao = {
        ...dados,
        descricao: `${dados.descricao} (cópia)`,
        status: 'pendente',
        data: formatarDataBrasilia(new Date()),
        dataVencimento: formatarDataBrasilia(new Date()),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await firebaseService.add('transacoes', novaTransacao);
      
      await carregarDados();
      
      await auditoriaService.registrar('duplicar_transacao', {
        entidade: 'transacoes',
        detalhes: `Transação duplicada: ${transacao.descricao}`,
      });

      mostrarSnackbar('📋 Transação duplicada com sucesso!');
    } catch (error) {
      console.error('Erro ao duplicar:', error);
      mostrarSnackbar('Erro ao duplicar transação', 'error');
    }
  };

  // Função para arquivar/desarquivar
  const handleArquivar = async (transacao) => {
    try {
      if (transacao.origem !== 'manual') {
        mostrarSnackbar('Apenas transações manuais podem ser arquivadas', 'warning');
        return;
      }

      const novoStatus = !transacao.arquivado;
      await firebaseService.update('transacoes', transacao.id, {
        arquivado: novoStatus,
        updatedAt: new Date().toISOString(),
      });
      
      await carregarDados();
      
      await auditoriaService.registrar(novoStatus ? 'arquivar_transacao' : 'desarquivar_transacao', {
        entidade: 'transacoes',
        entidadeId: transacao.id,
        detalhes: `Transação ${novoStatus ? 'arquivada' : 'desarquivada'}: ${transacao.descricao}`,
      });
      
      mostrarSnackbar(novoStatus ? '📦 Transação arquivada' : '📂 Transação desarquivada');
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      mostrarSnackbar('Erro ao arquivar transação', 'error');
    }
  };

  // Função para abrir/fechar caixa
  const handleAbrirFecharCaixa = async () => {
    try {
      if (!caixa || caixa.status === 'fechado') {
        let usuarioId = 'sistema';
        try {
          const usuarioStr = localStorage.getItem('usuario');
          if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            usuarioId = usuario?.id || 'sistema';
          }
        } catch (e) {
          console.warn('Erro ao parsear usuário do localStorage:', e);
        }

        const hoje = formatarDataBrasilia(new Date());
        const transacoesHoje = transacoes.filter(t => 
          t.data === hoje && t.status === 'pago'
        );
        
        const saldoInicial = transacoesHoje.reduce((acc, t) => {
          if (t.tipo === 'receita') return acc + t.valor;
          if (t.tipo === 'despesa') return acc - t.valor;
          return acc;
        }, 0);

        const novoCaixa = {
          dataAbertura: new Date().toISOString(),
          saldoInicial: saldoInicial,
          saldoAtual: saldoInicial,
          movimentacoes: transacoesHoje.map(t => ({
            id: Date.now() + Math.random(),
            tipo: t.tipo,
            valor: t.valor,
            descricao: t.descricao,
            data: t.data,
            transacaoId: t.id,
          })),
          status: 'aberto',
          responsavelId: String(usuarioId),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const novoId = await firebaseService.add('caixa', novoCaixa);
        setCaixa({ ...novoCaixa, id: novoId });

        await auditoriaService.registrar('abrir_caixa', {
          entidade: 'caixa',
          entidadeId: novoId,
          detalhes: 'Caixa aberto',
          dados: { saldoInicial }
        });
        
        mostrarSnackbar('✅ Caixa aberto com sucesso!');
      } else {
        const dadosAtualizacao = {
          status: 'fechado',
          dataFechamento: new Date().toISOString(),
          saldoFinal: caixa.saldoAtual || 0,
          updatedAt: new Date().toISOString(),
        };
        
        await firebaseService.update('caixa', caixa.id, dadosAtualizacao);
        
        setCaixa({ 
          ...caixa, 
          ...dadosAtualizacao
        });

        await auditoriaService.registrar('fechar_caixa', {
          entidade: 'caixa',
          entidadeId: caixa.id,
          detalhes: 'Caixa fechado',
          dados: { saldoFinal: caixa.saldoAtual }
        });
        
        mostrarSnackbar('✅ Caixa fechado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao abrir/fechar caixa:', error);
      mostrarSnackbar('Erro ao operar caixa', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'operar_caixa',
        status: caixa?.status
      });
    }
  };

  // Handlers de período
  const handlePeriodoChange = (periodo) => {
    setPeriodoSelecionado(periodo);
    const hoje = new Date();
    
    switch(periodo) {
      case 'hoje':
        setDataInicio(formatarDataBrasilia(hoje));
        setDataFim(formatarDataBrasilia(hoje));
        break;
      case 'ontem':
        const ontem = subDays(hoje, 1);
        setDataInicio(formatarDataBrasilia(ontem));
        setDataFim(formatarDataBrasilia(ontem));
        break;
      case 'semana':
        const semanaPassada = subDays(hoje, 7);
        setDataInicio(formatarDataBrasilia(semanaPassada));
        setDataFim(formatarDataBrasilia(hoje));
        break;
      case 'mes':
        setDataInicio(formatarDataBrasilia(startOfMonth(hoje)));
        setDataFim(formatarDataBrasilia(hoje));
        break;
      case 'mesPassado':
        const mesPassado = subMonths(hoje, 1);
        setDataInicio(formatarDataBrasilia(startOfMonth(mesPassado)));
        setDataFim(formatarDataBrasilia(endOfMonth(mesPassado)));
        break;
      case 'ano':
        setDataInicio(formatarDataBrasilia(startOfYear(hoje)));
        setDataFim(formatarDataBrasilia(hoje));
        break;
      default:
        break;
    }
  };

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    const transacoesPeriodo = transacoes.filter(t => {
      if (t.arquivado) return false;
      const data = new Date(t.data);
      return data >= inicio && data <= fim;
    });

    const receitas = transacoesPeriodo
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const despesas = transacoesPeriodo
      .filter(t => t.tipo === 'despesa' && t.status === 'pago')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const saldo = receitas - despesas;

    const aReceber = transacoesPeriodo
      .filter(t => t.tipo === 'receita' && (t.status === 'pendente' || t.status === 'atrasado'))
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const aPagar = transacoesPeriodo
      .filter(t => t.tipo === 'despesa' && (t.status === 'pendente' || t.status === 'atrasado'))
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const atrasados = transacoesPeriodo.filter(t => {
      if (t.status !== 'pendente') return false;
      const vencimento = new Date(t.dataVencimento || t.data);
      return vencimento < new Date();
    }).length;

    const comissoesPendentes = transacoesPeriodo
      .filter(t => t.origem === 'comissao' && t.status === 'pendente')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const comprasPendentes = transacoesPeriodo
      .filter(t => t.origem === 'compra' && t.status === 'pendente')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const ticketMedio = receitas > 0 
      ? receitas / transacoesPeriodo.filter(t => t.tipo === 'receita' && t.status === 'pago').length 
      : 0;

    return {
      receitas,
      despesas,
      saldo,
      aReceber,
      aPagar,
      atrasados,
      comissoesPendentes,
      comprasPendentes,
      ticketMedio,
      totalTransacoes: transacoesPeriodo.length,
      transacoesPagas: transacoesPeriodo.filter(t => t.status === 'pago').length,
    };
  };

  // Dados para gráficos
  const gerarDadosGraficoLinha = () => {
    const dias = {};
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const dia = format(d, 'yyyy-MM-dd');
      dias[dia] = { 
        receitas: 0, 
        despesas: 0, 
        saldo: 0,
        comissoes: 0,
        compras: 0,
        dia: format(d, 'dd/MM')
      };
    }

    transacoes
      .filter(t => t.status === 'pago' && !t.arquivado)
      .forEach(t => {
        const data = t.data.split('T')[0];
        if (dias[data]) {
          const valor = Number(t.valor) || 0;
          if (t.tipo === 'receita') {
            dias[data].receitas += valor;
          } else {
            dias[data].despesas += valor;
            if (t.origem === 'comissao') {
              dias[data].comissoes += valor;
            } else if (t.origem === 'compra') {
              dias[data].compras += valor;
            }
          }
          dias[data].saldo = dias[data].receitas - dias[data].despesas;
        }
      });

    return Object.values(dias);
  };

  const gerarDadosGraficoPizza = () => {
    const categorias = {};
    transacoes
      .filter(t => t.status === 'pago' && !t.arquivado)
      .forEach(t => {
        let cat = t.categoria || 'Outros';
        if (t.origem === 'comissao') cat = 'Comissões';
        if (t.origem === 'compra') cat = 'Compras';
        
        if (!categorias[cat]) {
          categorias[cat] = 0;
        }
        categorias[cat] += Number(t.valor) || 0;
      });

    return Object.keys(categorias)
      .map(cat => ({
        name: cat,
        value: categorias[cat],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const gerarDadosGraficoMensal = () => {
    const meses = {};
    const hoje = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const data = subMonths(hoje, i);
      const mes = format(data, 'MMM/yyyy');
      meses[mes] = { 
        mes, 
        receitas: 0, 
        despesas: 0,
        comissoes: 0,
        compras: 0,
        lucro: 0,
        data: data.getTime()
      };
    }

    transacoes
      .filter(t => t.status === 'pago' && !t.arquivado)
      .forEach(t => {
        const data = new Date(t.data);
        const mes = format(data, 'MMM/yyyy');
        if (meses[mes]) {
          const valor = Number(t.valor) || 0;
          if (t.tipo === 'receita') {
            meses[mes].receitas += valor;
          } else {
            meses[mes].despesas += valor;
            if (t.origem === 'comissao') {
              meses[mes].comissoes += valor;
            } else if (t.origem === 'compra') {
              meses[mes].compras += valor;
            }
          }
          meses[mes].lucro = meses[mes].receitas - meses[mes].despesas;
        }
      });

    return Object.values(meses).sort((a, b) => a.data - b.data);
  };

  const stats = calcularEstatisticas();
  const dadosGraficoLinha = gerarDadosGraficoLinha();
  const dadosGraficoPizza = gerarDadosGraficoPizza();
  const dadosGraficoMensal = gerarDadosGraficoMensal();

  // Filtrar transações
  const getTransacoesFiltradas = () => {
    let lista = [];
    if (tabValue === 0) lista = transacoes.filter(t => !t.arquivado);
    else if (tabValue === 1) lista = transacoes.filter(t => t.tipo === 'receita' && !t.arquivado);
    else if (tabValue === 2) lista = transacoes.filter(t => t.tipo === 'despesa' && !t.arquivado);
    else if (tabValue === 3) lista = transacoes.filter(t => t.origem === 'comissao' && !t.arquivado);
    else if (tabValue === 4) lista = transacoes.filter(t => t.origem === 'compra' && !t.arquivado);
    else if (tabValue === 5) lista = transacoes.filter(t => t.arquivado);

    // Aplicar filtros de período
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    lista = lista.filter(t => {
      const data = new Date(t.data);
      return data >= inicio && data <= fim;
    });

    // Aplicar filtro de texto
    if (filtro) {
      const termo = filtro.toLowerCase();
      lista = lista.filter(t => 
        t.descricao?.toLowerCase().includes(termo) ||
        t.categoria?.toLowerCase().includes(termo) ||
        (t.profissionalNome?.toLowerCase().includes(termo)) ||
        (t.servicoNome?.toLowerCase().includes(termo)) ||
        (t.numeroPedido?.toLowerCase().includes(termo)) ||
        (t.clienteId && clientes.find(c => c.id === t.clienteId)?.nome?.toLowerCase().includes(termo))
      );
    }

    // Aplicar filtro por status
    if (filtroStatus !== 'todos') {
      lista = lista.filter(t => t.status === filtroStatus);
    }

    // Aplicar filtro por tipo
    if (filtroTipo !== 'todos') {
      lista = lista.filter(t => t.tipo === filtroTipo);
    }

    // Aplicar filtro por categoria
    if (filtroCategoria !== 'todas') {
      lista = lista.filter(t => t.categoria === filtroCategoria);
    }

    return lista;
  };

  const transacoesFiltradas = getTransacoesFiltradas();
  const paginatedTransacoes = transacoesFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetalhes = (transacao) => {
    setTransacaoSelecionada(transacao);
    setOpenDetalheDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalheDialog(false);
    setTransacaoSelecionada(null);
  };

  const handlePrintPDF = async () => {
    try {
      const doc = new jsPDF();
      
      doc.setFillColor(156, 39, 176);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE FLUXO DE CAIXA', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Período: ${formatarDataExibicao(dataInicio)} a ${formatarDataExibicao(dataFim)}`, 105, 30, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      let yPos = 50;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, 170, 60, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text('Receitas:', 25, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(`R$ ${stats.receitas.toFixed(2)}`, 50, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Despesas:', 80, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(`R$ ${stats.despesas.toFixed(2)}`, 105, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Saldo:', 135, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(`R$ ${stats.saldo.toFixed(2)}`, 160, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total de Transações:', 25, yPos + 25);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.totalTransacoes), 70, yPos + 25);
      
      if (stats.comissoesPendentes > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Comissões Pendentes:', 25, yPos + 40);
        doc.setFont('helvetica', 'normal');
        doc.text(`R$ ${stats.comissoesPendentes.toFixed(2)}`, 70, yPos + 40);
      }
      
      if (stats.comprasPendentes > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Compras Pendentes:', 100, yPos + 40);
        doc.setFont('helvetica', 'normal');
        doc.text(`R$ ${stats.comprasPendentes.toFixed(2)}`, 145, yPos + 40);
      }
      
      yPos += 80;

      const tableColumn = ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo', 'Origem', 'Status'];
      const tableRows = [];
      
      transacoesFiltradas.slice(0, 50).forEach(t => {
        const row = [
          formatarDataExibicao(t.data),
          (t.descricao || '').substring(0, 40),
          t.categoria || '—',
          `R$ ${Number(t.valor || 0).toFixed(2)}`,
          t.tipo === 'receita' ? 'Receita' : 'Despesa',
          t.origem || '—',
          t.status || 'pago',
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
          fontSize: 7,
          cellPadding: 1,
        },
      });
      
      const finalY = doc.lastAutoTable.finalY || yPos + 50;
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Documento gerado pelo sistema de gestão', 105, finalY + 10, { align: 'center' });
      doc.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, finalY + 15, { align: 'center' });
      
      await auditoriaService.registrar('exportar_fluxo_caixa', {
        entidade: 'fluxo_caixa',
        detalhes: 'Exportação de relatório de fluxo de caixa',
        dados: {
          formato: 'PDF',
          periodoInicio: dataInicio,
          periodoFim: dataFim,
          totalTransacoes: transacoesFiltradas.length,
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
        acao: 'exportar_fluxo_caixa_pdf',
        detalhes: 'Erro ao gerar PDF de fluxo de caixa'
      });
    }
  };

  const handleExportarCSV = async () => {
    try {
      const dadosExport = transacoesFiltradas.map(t => ({
        Data: formatarDataExibicao(t.data),
        Descrição: t.descricao || '',
        Categoria: t.categoria || '',
        'Forma de Pagamento': formasPagamento.find(fp => fp.value === t.formaPagamento)?.label || t.formaPagamento || '',
        Valor: Number(t.valor || 0).toFixed(2),
        Tipo: t.tipo === 'receita' ? 'Receita' : 'Despesa',
        Origem: t.origem || '',
        Status: t.status || 'pago',
        'Profissional': t.profissionalNome || '',
        'Nº Pedido': t.numeroPedido || '',
      }));

      const headers = ['Data', 'Descrição', 'Categoria', 'Forma de Pagamento', 'Valor', 'Tipo', 'Origem', 'Status', 'Profissional', 'Nº Pedido'];
      const csvContent = [
        headers.join(','),
        ...dadosExport.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `fluxo_caixa_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      await auditoriaService.registrar('exportar_fluxo_caixa', {
        entidade: 'fluxo_caixa',
        detalhes: 'Exportação de relatório de fluxo de caixa',
        dados: {
          formato: 'CSV',
          periodoInicio: dataInicio,
          periodoFim: dataFim,
          totalTransacoes: transacoesFiltradas.length,
          stats
        }
      });

      setOpenPrintDialog(false);
      mostrarSnackbar('CSV exportado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      mostrarSnackbar('Erro ao exportar CSV', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_fluxo_caixa_csv',
        detalhes: 'Erro ao exportar CSV de fluxo de caixa'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        <Skeleton variant="rectangular" height={isMobile ? 150 : 80} sx={{ borderRadius: 2, mb: 3 }} />
        
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 120 : 60} sx={{ borderRadius: 2, mb: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
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
              Fluxo de Caixa
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {stats.totalTransacoes} transações no período
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

        {/* Status do Caixa */}
        {caixa?.status === 'aberto' && (
          <Zoom in={true}>
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={handleAbrirFecharCaixa}>
                  Fechar Caixa
                </Button>
              }
            >
              <strong>Caixa Aberto</strong> - Saldo atual: R$ {caixa.saldoAtual?.toFixed(2)} | 
              Abertura: {formatarDataExibicao(caixa.dataAbertura)} {caixa.dataAbertura?.split('T')[1]?.substring(0,5)}
            </Alert>
          </Zoom>
        )}

        {/* Filtro de Período Mobile */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Período</InputLabel>
                <Select
                  value={periodoSelecionado}
                  label="Período"
                  onChange={(e) => handlePeriodoChange(e.target.value)}
                >
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="ontem">Ontem</MenuItem>
                  <MenuItem value="semana">Últimos 7 dias</MenuItem>
                  <MenuItem value="mes">Este mês</MenuItem>
                  <MenuItem value="mesPassado">Mês passado</MenuItem>
                  <MenuItem value="ano">Este ano</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Data Início"
                value={new Date(dataInicio)}
                onChange={(newValue) => {
                  if (newValue) {
                    setDataInicio(formatarDataBrasilia(newValue));
                    setPeriodoSelecionado('personalizado');
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Data Fim"
                value={new Date(dataFim)}
                onChange={(newValue) => {
                  if (newValue) {
                    setDataFim(formatarDataBrasilia(newValue));
                    setPeriodoSelecionado('personalizado');
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Barra de Pesquisa e Filtros */}
        <Paper
          elevation={0}
          sx={{
            p: 0.5,
            mb: 3,
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
            placeholder="Buscar transação..."
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
              color: filtroStatus !== 'todos' || filtroTipo !== 'todos' || filtroCategoria !== 'todas' ? '#9c27b0' : 'text.secondary'
            }}
          >
            <Badge 
              variant="dot" 
              color="primary"
              invisible={filtroStatus === 'todos' && filtroTipo === 'todos' && filtroCategoria === 'todas'}
            >
              <FilterIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={carregarDados} sx={{ color: 'text.secondary' }}>
            <RefreshIcon />
          </IconButton>
        </Paper>

        {/* Cards de Resumo Mobile */}
        <Grid container spacing={1.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card sx={{ bgcolor: stats.saldo >= 0 ? '#e8f5e9' : '#ffebee' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        Saldo
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          color: stats.saldo >= 0 ? '#4caf50' : '#f44336' 
                        }}
                      >
                        R$ {stats.saldo.toFixed(2)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: stats.saldo >= 0 ? '#4caf50' : '#f44336', width: 48, height: 48 }}>
                      <MoneyIcon />
                    </Avatar>
                  </Box>
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
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        Receitas
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        R$ {stats.receitas.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        A receber: R$ {stats.aReceber.toFixed(2)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                      <TrendingUpIcon />
                    </Avatar>
                  </Box>
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
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        Despesas
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                        R$ {stats.despesas.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        A pagar: R$ {stats.aPagar.toFixed(2)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f44336', width: 48, height: 48 }}>
                      <TrendingDownIcon />
                    </Avatar>
                  </Box>
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
              <Card sx={{ bgcolor: stats.comissoesPendentes > 0 ? '#f3e5f5' : '#f5f5f5' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        Comissões Pend.
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700, 
                        color: stats.comissoesPendentes > 0 ? '#9c27b0' : '#9e9e9e' 
                      }}>
                        R$ {stats.comissoesPendentes.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Compras pend.: R$ {stats.comprasPendentes.toFixed(2)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: stats.comissoesPendentes > 0 ? '#9c27b0' : '#9e9e9e', width: 48, height: 48 }}>
                      <PercentIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Gráficos Mobile */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                    <ShowChartIcon /> Fluxo Diário
                  </Typography>
                  <Box sx={{ height: isMobile ? 250 : 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dadosGraficoLinha}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dia" tick={{ fontSize: isMobile ? 10 : 12 }} />
                        <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                        <RechartsTooltip 
                          formatter={(value) => `R$ ${value.toFixed(2)}`}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="receitas" fill="#4caf50" fillOpacity={0.3} stroke="#4caf50" />
                        <Area type="monotone" dataKey="despesas" fill="#f44336" fillOpacity={0.3} stroke="#f44336" />
                        <Line type="monotone" dataKey="comissoes" stroke="#9c27b0" strokeWidth={2} name="Comissões" />
                        <Line type="monotone" dataKey="compras" stroke="#ff9800" strokeWidth={2} name="Compras" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                    <PieChartIcon /> Distribuição
                  </Typography>
                  <Box sx={{ height: isMobile ? 250 : 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosGraficoPizza}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => 
                            isMobile 
                              ? (percent > 0.1 ? `${(percent * 100).toFixed(0)}%` : '')
                              : (percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : '')
                          }
                          outerRadius={isMobile ? 70 : 80}
                          dataKey="value"
                        >
                          {dadosGraficoPizza.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => `R$ ${value.toFixed(2)}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Gráfico Mensal */}
        {dadosGraficoMensal.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, px: 1 }}>
                Comparativo Mensal
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGraficoMensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" tick={{ fontSize: isMobile ? 8 : 10 }} />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value) => `R$ ${value.toFixed(2)}`}
                    />
                    <Legend />
                    <Bar dataKey="receitas" fill="#4caf50" name="Receitas" />
                    <Bar dataKey="despesas" fill="#f44336" name="Despesas" />
                    <Bar dataKey="comissoes" fill="#9c27b0" name="Comissões" />
                    <Bar dataKey="compras" fill="#ff9800" name="Compras" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tabs Mobile */}
        <Paper sx={{ mb: 2, borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: isMobile ? '0.7rem' : '0.875rem',
              }
            }}
          >
            <Tab label="Todas" icon={<ReceiptIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} iconPosition="start" />
            <Tab label="Receitas" icon={<TrendingUpIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} iconPosition="start" />
            <Tab label="Despesas" icon={<TrendingDownIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} iconPosition="start" />
            <Tab label="Comissões" icon={<PercentIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} iconPosition="start" />
            <Tab label="Compras" icon={<ShoppingCartIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} iconPosition="start" />
            <Tab label="Arquivados" icon={<ArchiveIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Lista de Transações Mobile */}
        <AnimatePresence>
          {paginatedTransacoes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Nenhuma transação encontrada
                </Typography>
              </Paper>
            </motion.div>
          ) : (
            paginatedTransacoes.map((transacao) => (
              <TransacaoMobileCard
                key={transacao.id}
                transacao={transacao}
                onDetalhes={handleOpenDetalhes}
                onMarcarPago={handleMarcarComoPago}
                onDuplicar={handleDuplicar}
                onArquivar={handleArquivar}
                clientes={clientes}
                fornecedores={fornecedores}
                profissionais={profissionais}
              />
            ))
          )}
        </AnimatePresence>

        {/* Paginação */}
        {transacoesFiltradas.length > rowsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={transacoesFiltradas.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
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
              Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Button
                fullWidth
                variant={filtroStatus === 'todos' ? 'contained' : 'outlined'}
                onClick={() => setFiltroStatus('todos')}
                sx={{ justifyContent: 'flex-start' }}
              >
                Todos os status
              </Button>
              {Object.keys(statusColors).map(status => (
                <Button
                  key={status}
                  fullWidth
                  variant={filtroStatus === status ? 'contained' : 'outlined'}
                  onClick={() => setFiltroStatus(status)}
                  sx={{ 
                    justifyContent: 'flex-start',
                    color: filtroStatus === status ? 'white' : statusColors[status].color,
                    borderColor: statusColors[status].color,
                    bgcolor: filtroStatus === status ? statusColors[status].color : 'transparent',
                  }}
                >
                  {statusColors[status].icon} {statusColors[status].label}
                </Button>
              ))}
            </Box>

            <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
              Tipo
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Button
                fullWidth
                variant={filtroTipo === 'todos' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('todos')}
                sx={{ justifyContent: 'flex-start' }}
              >
                Todos os tipos
              </Button>
              <Button
                fullWidth
                variant={filtroTipo === 'receita' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('receita')}
                sx={{ 
                  justifyContent: 'flex-start',
                  color: filtroTipo === 'receita' ? 'white' : '#4caf50',
                  borderColor: '#4caf50',
                  bgcolor: filtroTipo === 'receita' ? '#4caf50' : 'transparent',
                }}
              >
                <TrendingUpIcon sx={{ mr: 1, fontSize: 18 }} />
                Receitas
              </Button>
              <Button
                fullWidth
                variant={filtroTipo === 'despesa' ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipo('despesa')}
                sx={{ 
                  justifyContent: 'flex-start',
                  color: filtroTipo === 'despesa' ? 'white' : '#f44336',
                  borderColor: '#f44336',
                  bgcolor: filtroTipo === 'despesa' ? '#f44336' : 'transparent',
                }}
              >
                <TrendingDownIcon sx={{ mr: 1, fontSize: 18 }} />
                Despesas
              </Button>
            </Box>

            <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
              Categoria
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflow: 'auto' }}>
              <Button
                fullWidth
                variant={filtroCategoria === 'todas' ? 'contained' : 'outlined'}
                onClick={() => setFiltroCategoria('todas')}
                sx={{ justifyContent: 'flex-start' }}
              >
                Todas as categorias
              </Button>
              {categorias.map((cat) => (
                <Button
                  key={cat}
                  fullWidth
                  variant={filtroCategoria === cat ? 'contained' : 'outlined'}
                  onClick={() => setFiltroCategoria(cat)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  <CategoryIcon sx={{ mr: 1, fontSize: 18 }} />
                  {cat}
                </Button>
              ))}
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

        {/* Dialog de Detalhes */}
        <Dialog 
          open={openDetalheDialog} 
          onClose={handleCloseDetalhes}
          fullScreen={isMobile}
          maxWidth="sm" 
          fullWidth
        >
          {transacaoSelecionada && (
            <>
              <DialogTitle sx={{ 
                bgcolor: transacaoSelecionada.tipo === 'receita' ? '#4caf50' : 
                         transacaoSelecionada.origem === 'comissao' ? '#9c27b0' : 
                         transacaoSelecionada.origem === 'compra' ? '#ff9800' : '#f44336', 
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
                  Detalhes da Transação
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#9c27b0' }}>
                        <ReceiptIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Descrição"
                      secondary={transacaoSelecionada.descricao}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: transacaoSelecionada.tipo === 'receita' ? '#4caf50' : '#f44336' }}>
                        {transacaoSelecionada.tipo === 'receita' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Valor"
                      secondary={`R$ ${Number(transacaoSelecionada.valor).toFixed(2)}`}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#ff9800' }}>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Data"
                      secondary={formatarDataExibicao(transacaoSelecionada.data)}
                    />
                  </ListItem>

                  {transacaoSelecionada.dataVencimento && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#f44336' }}>
                          <WarningIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Vencimento"
                        secondary={formatarDataExibicao(transacaoSelecionada.dataVencimento)}
                      />
                    </ListItem>
                  )}

                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#2196f3' }}>
                        <PaymentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Forma de Pagamento"
                      secondary={formasPagamento.find(fp => fp.value === transacaoSelecionada.formaPagamento)?.label || transacaoSelecionada.formaPagamento}
                    />
                  </ListItem>

                  {transacaoSelecionada.origem === 'comissao' && (
                    <>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#9c27b0' }}>
                            <PercentIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Profissional"
                          secondary={transacaoSelecionada.profissionalNome || 'Não informado'}
                        />
                      </ListItem>
                      {transacaoSelecionada.servicoNome && (
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#ff4081' }}>
                              <ReceiptLongIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Serviço"
                            secondary={`${transacaoSelecionada.servicoNome} (${transacaoSelecionada.percentual}% de R$ ${transacaoSelecionada.valorAtendimento})`}
                          />
                        </ListItem>
                      )}
                    </>
                  )}

                  {transacaoSelecionada.origem === 'compra' && (
                    <>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#ff9800' }}>
                            <StoreIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Fornecedor"
                          secondary={fornecedores.find(f => f.id === transacaoSelecionada.fornecedorId)?.nome || 'Não informado'}
                        />
                      </ListItem>
                      {transacaoSelecionada.numeroPedido && (
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#00bcd4' }}>
                              <ReceiptIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Número do Pedido"
                            secondary={transacaoSelecionada.numeroPedido}
                          />
                        </ListItem>
                      )}
                      {transacaoSelecionada.itens && transacaoSelecionada.itens.length > 0 && (
                        <ListItem>
                          <ListItemText
                            primary="Itens da Compra"
                            secondary={
                              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                                {transacaoSelecionada.itens.map((item, idx) => (
                                  <li key={idx}>
                                    {item.produtoNome} - {item.quantidade}x R$ {item.valorUnitario} = R$ {item.total}
                                  </li>
                                ))}
                              </Box>
                            }
                          />
                        </ListItem>
                      )}
                    </>
                  )}

                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#9e9e9e' }}>
                        <CategoryIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Categoria"
                      secondary={transacaoSelecionada.categoria || 'Sem categoria'}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: statusColors[transacaoSelecionada.status]?.color || '#9e9e9e'
                      }}>
                        {statusColors[transacaoSelecionada.status]?.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Status"
                      secondary={statusColors[transacaoSelecionada.status]?.label || transacaoSelecionada.status}
                    />
                  </ListItem>

                  {transacaoSelecionada.observacoes && (
                    <ListItem>
                      <ListItemText
                        primary="Observações"
                        secondary={transacaoSelecionada.observacoes}
                      />
                    </ListItem>
                  )}
                </List>
              </DialogContent>
              <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
                <Button onClick={handleCloseDetalhes} fullWidth={isMobile}>
                  Fechar
                </Button>
                {transacaoSelecionada.status === 'pendente' && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      handleCloseDetalhes();
                      handleMarcarComoPago(transacaoSelecionada);
                    }}
                  >
                    Marcar como Pago
                  </Button>
                )}
              </DialogActions>
            </>
          )}
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
                    Período: {formatarDataExibicao(dataInicio)} a {formatarDataExibicao(dataFim)}
                  </Typography>
                  <Typography variant="body2">
                    Total de transações: {stats.totalTransacoes}
                  </Typography>
                  <Typography variant="body2">
                    Receitas: R$ {stats.receitas.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Despesas: R$ {stats.despesas.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Comissões Pend.: R$ {stats.comissoesPendentes.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Compras Pend.: R$ {stats.comprasPendentes.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Saldo: R$ {stats.saldo.toFixed(2)}
                  </Typography>
                </Alert>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPrintDialog(false)}>Cancelar</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Relatórios */}
        <Dialog 
          open={openRelatorioDialog} 
          onClose={() => setOpenRelatorioDialog(false)}
          fullScreen={isMobile}
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartIcon />
              <Typography variant="h6">Relatórios Financeiros</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Fluxo de Caixa</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Análise detalhada do fluxo de caixa por período
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>DRE</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Demonstrativo de Resultados do Exercício
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Contas a Receber</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Análise de contas a receber por cliente e período
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Contas a Pagar</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Análise de contas a pagar por fornecedor e período
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Comissões</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Relatório de comissões por profissional e período
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Compras</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Análise de compras por fornecedor e período
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRelatorioDialog(false)}>Fechar</Button>
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
                    setOpenPrintDialog(true);
                    break;
                  case 3:
                    setOpenRelatorioDialog(true);
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
              <BottomNavigationAction label="Início" icon={<AccountBalanceIcon />} />
              <BottomNavigationAction 
                label="Filtros" 
                icon={
                  <Badge 
                    variant="dot" 
                    color="primary"
                    invisible={filtroStatus === 'todos' && filtroTipo === 'todos' && filtroCategoria === 'todas'}
                  >
                    <FilterIcon />
                  </Badge>
                } 
              />
              <BottomNavigationAction label="Exportar" icon={<PrintIcon />} />
              <BottomNavigationAction label="Relatórios" icon={<BarChartIcon />} />
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
    </LocalizationProvider>
  );
}

export default FluxoCaixa;
