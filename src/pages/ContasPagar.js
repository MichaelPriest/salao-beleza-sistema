// src/pages/ContasPagar.js
import React, { useState, useEffect, useRef } from 'react';
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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Fab,
  Zoom,
  useMediaQuery,
  useTheme,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
  Percent as PercentIcon,
  Cancel as CancelIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  ReceiptLong as ReceiptLongIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { auditoriaService } from '../services/auditoriaService';
import { useReactToPrint } from 'react-to-print';

// Componente de Impressão
const RelatorioContasPagar = React.forwardRef(({ contas, filtros, estatisticas, config, fornecedores, profissionais }, ref) => {
  const logo = config?.salao?.logo || '';
  const empresa = config?.salao || {
    nome: 'Sistema de Gestão',
    cnpj: '',
    endereco: {}
  };

  const getFornecedorNome = (fornecedorId) => {
    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
    return fornecedor?.nome || 'Não informado';
  };

  const getProfissionalNome = (profissionalId) => {
    const profissional = profissionais.find(p => p.id === profissionalId);
    return profissional?.nome || 'Não informado';
  };

  return (
    <Box ref={ref} sx={{ p: 4, fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #9c27b0', pb: 2 }}>
        {logo && (
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              maxHeight: 80, 
              maxWidth: 200, 
              marginBottom: 10,
              objectFit: 'contain'
            }} 
          />
        )}
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
          {empresa.nome || 'Sistema de Gestão'}
        </Typography>
        {empresa.nomeFantasia && (
          <Typography variant="h5" sx={{ color: '#666', mb: 1 }}>
            {empresa.nomeFantasia}
          </Typography>
        )}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
          Relatório de Contas a Pagar
        </Typography>
        
        {/* Informações da empresa */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2, fontSize: '0.9rem' }}>
          {empresa.cnpj && (
            <Typography variant="body2" color="textSecondary">
              CNPJ: {empresa.cnpj}
            </Typography>
          )}
          {empresa.endereco?.cidade && empresa.endereco?.estado && (
            <Typography variant="body2" color="textSecondary">
              {empresa.endereco.cidade}/{empresa.endereco.estado}
            </Typography>
          )}
        </Box>

        <Typography variant="subtitle1" color="textSecondary">
          Período: {filtros.periodo}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Emitido em: {new Date().toLocaleString('pt-BR')}
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Resumo Financeiro
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2">Total a Pagar</Typography>
              <Typography variant="h6" sx={{ color: '#f44336' }}>
                R$ {estatisticas.valorTotal.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#fff3e0', textAlign: 'center' }}>
              <Typography variant="body2">Pendentes</Typography>
              <Typography variant="h6" sx={{ color: '#ff9800' }}>
                {estatisticas.pendentes}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#ffebee', textAlign: 'center' }}>
              <Typography variant="body2">Atrasadas</Typography>
              <Typography variant="h6" sx={{ color: '#f44336' }}>
                {estatisticas.atrasadas}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#e8f5e9', textAlign: 'center' }}>
              <Typography variant="body2">Pagas</Typography>
              <Typography variant="h6" sx={{ color: '#4caf50' }}>
                {estatisticas.pagas}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Resumo por origem */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, bgcolor: '#f3e5f5', textAlign: 'center' }}>
              <Typography variant="body2">Comissões a Pagar</Typography>
              <Typography variant="h6" sx={{ color: '#9c27b0' }}>
                R$ {estatisticas.comissoesPendentes.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, bgcolor: '#fff3e0', textAlign: 'center' }}>
              <Typography variant="body2">Compras a Pagar</Typography>
              <Typography variant="h6" sx={{ color: '#ff9800' }}>
                R$ {estatisticas.comprasPendentes.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Tabela de Contas */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Lista de Contas
      </Typography>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#9c27b0', color: 'white' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>Descrição</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Origem</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Vencimento</th>
            <th style={{ padding: 10, textAlign: 'right' }}>Valor</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {contas.slice(0, 100).map((conta, index) => {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const vencimento = conta.dataVencimento ? new Date(conta.dataVencimento) : null;
            if (vencimento) vencimento.setHours(0, 0, 0, 0);
            const isVencida = vencimento && vencimento < hoje && conta.status === 'pendente';

            return (
              <tr key={index} style={{ 
                borderBottom: '1px solid #ddd',
                backgroundColor: isVencida ? '#ffebee20' : 'white'
              }}>
                <td style={{ padding: 8 }}>
                  {conta.descricao}
                  {conta.origem === 'comissao' && conta.profissionalNome && (
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {conta.profissionalNome}
                    </div>
                  )}
                  {conta.origem === 'compra' && conta.numeroPedido && (
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      Pedido: {conta.numeroPedido}
                    </div>
                  )}
                </td>
                <td style={{ padding: 8 }}>
                  {conta.origem === 'manual' ? 'Manual' :
                   conta.origem === 'comissao' ? 'Comissão' : 'Compra'}
                </td>
                <td style={{ padding: 8 }}>
                  {conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : '-'}
                  {isVencida && <span style={{ color: '#f44336', marginLeft: 8 }}>(Vencida)</span>}
                </td>
                <td style={{ padding: 8, textAlign: 'right', fontWeight: 600, color: '#f44336' }}>
                  R$ {Number(conta.valor).toFixed(2)}
                </td>
                <td style={{ padding: 8 }}>
                  <span style={{
                    backgroundColor: 
                      conta.status === 'pago' ? '#4caf5020' :
                      conta.status === 'pendente' ? '#ff980020' :
                      conta.status === 'atrasado' ? '#f4433620' : '#f5f5f5',
                    color:
                      conta.status === 'pago' ? '#4caf50' :
                      conta.status === 'pendente' ? '#ff9800' :
                      conta.status === 'atrasado' ? '#f44336' : '#666',
                    padding: '4px 8px',
                    borderRadius: 16,
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {conta.status === 'pago' ? 'Pago' :
                     conta.status === 'pendente' ? 'Pendente' :
                     conta.status === 'atrasado' ? 'Atrasado' : conta.status}
                  </span>
                </td>
                <td style={{ padding: 8 }}>
                  {conta.origem === 'comissao' && conta.servicoNome && (
                    <div>{conta.servicoNome} ({conta.percentual}%)</div>
                  )}
                  {conta.origem === 'compra' && conta.fornecedorId && (
                    <div>{getFornecedorNome(conta.fornecedorId)}</div>
                  )}
                  {conta.origem === 'manual' && conta.fornecedorId && (
                    <div>{getFornecedorNome(conta.fornecedorId)}</div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Rodapé */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary', borderTop: '1px solid #ccc', pt: 2 }}>
        <Typography variant="caption">
          Relatório gerado automaticamente pelo sistema • Documento não fiscal
        </Typography>
      </Box>
    </Box>
  );
});

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente', icon: <WarningIcon /> },
  pago: { color: '#4caf50', label: 'Pago', icon: <CheckCircleIcon /> },
  atrasado: { color: '#f44336', label: 'Atrasado', icon: <WarningIcon /> },
  cancelado: { color: '#9e9e9e', label: 'Cancelado', icon: <CancelIcon /> },
  concluida: { color: '#4caf50', label: 'Concluída', icon: <CheckCircleIcon /> },
  cancelada: { color: '#f44336', label: 'Cancelada', icon: <CancelIcon /> },
};

const origemColors = {
  manual: { color: '#757575', label: 'Manual', icon: <ReceiptIcon /> },
  comissao: { color: '#9c27b0', label: 'Comissão', icon: <PercentIcon /> },
  compra: { color: '#ff9800', label: 'Compra', icon: <ShoppingCartIcon /> },
};

function ContasPagar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const printRef = useRef();

  const [loading, setLoading] = useState(true);
  const [contas, setContas] = useState([]);
  const [contasManuais, setContasManuais] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [caixa, setCaixa] = useState(null);
  const [config, setConfig] = useState(null);
  
  // Filtros
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroOrigem, setFiltroOrigem] = useState('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [openPagamentoDialog, setOpenPagamentoDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [contaEditando, setContaEditando] = useState(null);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mobile states
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // Formulário
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: new Date().toISOString().split('T')[0],
    categoria: 'Fornecedor',
    fornecedorId: '',
    profissionalId: '',
    atendimentoId: '',
    percentual: '',
    formaPagamento: 'boleto',
    observacoes: '',
    status: 'pendente',
    recorrente: false,
    parcelas: 1,
    origem: 'manual',
    origemId: '',
    itens: [],
    numeroPedido: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [
        contasData,
        comissoesData,
        comprasData,
        fornecedoresData,
        profissionaisData,
        caixaData,
        configData
      ] = await Promise.all([
        firebaseService.getAll('contas_pagar').catch(() => []),
        firebaseService.getAll('comissoes').catch(() => []),
        firebaseService.getAll('compras').catch(() => []),
        firebaseService.getAll('fornecedores').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('caixa').catch(() => []),
        firebaseService.getAll('configuracoes').catch(() => []),
      ]);
      
      // Garantir que todos os dados são arrays
      const contasArray = Array.isArray(contasData) ? contasData : [];
      const comissoesArray = Array.isArray(comissoesData) ? comissoesData : [];
      const comprasArray = Array.isArray(comprasData) ? comprasData : [];
      const fornecedoresArray = Array.isArray(fornecedoresData) ? fornecedoresData : [];
      const profissionaisArray = Array.isArray(profissionaisData) ? profissionaisData : [];
      
      setContasManuais(contasArray);
      setComissoes(comissoesArray);
      setCompras(comprasArray);
      setFornecedores(fornecedoresArray);
      setProfissionais(profissionaisArray);
      setConfig(configData?.[0] || null);
      
      // Converter comissões para contas a pagar
      const contasComissoes = comissoesArray
        .filter(c => c.status !== 'pago' && c.status !== 'cancelado')
        .map(comissao => ({
          id: `comissao_${comissao.id}`,
          origem: 'comissao',
          origemId: comissao.id,
          descricao: `Comissão - ${comissao.servicoNome || 'Serviço'}`,
          valor: comissao.valor || 0,
          dataVencimento: comissao.data || comissao.dataRegistro?.split('T')[0],
          categoria: 'Comissões',
          formaPagamento: 'credito_loja',
          status: comissao.status === 'atrasado' ? 'atrasado' : 'pendente',
          profissionalId: comissao.profissionalId,
          profissionalNome: comissao.profissionalNome,
          atendimentoId: comissao.atendimentoId,
          servicoId: comissao.servicoId,
          servicoNome: comissao.servicoNome,
          percentual: comissao.percentual,
          valorAtendimento: comissao.valorAtendimento,
          observacoes: `Comissão de ${comissao.percentual}% sobre atendimento de R$ ${comissao.valorAtendimento}`,
          dataCriacao: comissao.createdAt,
        }));

      // Converter compras para contas a pagar
      const contasCompras = comprasArray
        .filter(c => c.status !== 'pago' && c.status !== 'cancelada')
        .map(compra => ({
          id: `compra_${compra.id}`,
          origem: 'compra',
          origemId: compra.id,
          descricao: `Compra - ${compra.numeroPedido || 'Pedido'}`,
          valor: compra.valorTotal || 0,
          dataVencimento: compra.dataCompra,
          categoria: 'Compras',
          formaPagamento: compra.formaPagamento || 'pix',
          status: compra.status === 'atrasado' ? 'atrasado' : 'pendente',
          fornecedorId: compra.fornecedorId,
          numeroPedido: compra.numeroPedido,
          prazoEntrega: compra.prazoEntrega,
          itens: compra.itens || [],
          observacoes: compra.observacoes,
          dataCriacao: compra.createdAt,
        }));

      // Combinar todas as contas
      const todasContas = [
        ...contasArray.map(c => ({ ...c, origem: 'manual' })),
        ...contasComissoes,
        ...contasCompras
      ];

      // Ordenar por data de vencimento (mais próximas primeiro)
      todasContas.sort((a, b) => {
        const dataA = new Date(a.dataVencimento || a.dataCriacao);
        const dataB = new Date(b.dataVencimento || b.dataCriacao);
        return dataA - dataB;
      });

      setContas(todasContas);
      
      // Pega o caixa atual (último caixa aberto)
      const caixaAtual = caixaData?.length > 0 
        ? caixaData.filter(c => c && c.status === 'aberto')
            .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))[0]
        : null;
      setCaixa(caixaAtual);
      
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_contas_pagar',
        detalhes: 'Erro ao carregar dados de contas a pagar'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `contas_pagar_${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      toast.loading('Preparando impressão...', { id: 'print' });
    },
    onAfterPrint: () => {
      toast.success('Impressão enviada!', { id: 'print' });
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      toast.error('Erro ao imprimir', { id: 'print' });
    }
  });

  const handleExportCSV = () => {
    try {
      const headers = ['Descrição', 'Origem', 'Vencimento', 'Valor', 'Status', 'Fornecedor/Profissional'];
      const data = contasFiltradas.map(conta => {
        const fornecedor = fornecedores.find(f => f.id === conta.fornecedorId);
        const profissional = profissionais.find(p => p.id === conta.profissionalId);
        const detalhe = conta.origem === 'comissao' ? profissional?.nome :
                       conta.origem === 'compra' ? fornecedor?.nome :
                       fornecedor?.nome || '';
        
        return [
          conta.descricao,
          conta.origem === 'manual' ? 'Manual' : conta.origem === 'comissao' ? 'Comissão' : 'Compra',
          conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : '',
          `R$ ${Number(conta.valor).toFixed(2)}`,
          statusColors[conta.status]?.label || conta.status,
          detalhe
        ];
      });

      const csvContent = [headers, ...data]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `contas_pagar_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      mostrarSnackbar('Planilha exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar', 'error');
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ... (manter as funções de CRUD existentes: handleOpenDialog, handleSalvar, handlePagarComissao, handlePagarCompra, handleRegistrarPagamento, etc.)

  // Filtrar contas
  const contasFiltradas = contas.filter(conta => {
    const matchesTexto = filtro === '' || 
      conta.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
      conta.profissionalNome?.toLowerCase().includes(filtro.toLowerCase()) ||
      conta.servicoNome?.toLowerCase().includes(filtro.toLowerCase()) ||
      conta.numeroPedido?.toLowerCase().includes(filtro.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || conta.status === filtroStatus;
    const matchesOrigem = filtroOrigem === 'todas' || conta.origem === filtroOrigem;

    let matchesPeriodo = true;
    if (filtroPeriodo === 'hoje' && conta.dataVencimento) {
      const hoje = new Date().toISOString().split('T')[0];
      matchesPeriodo = conta.dataVencimento === hoje;
    } else if (filtroPeriodo === 'semana' && conta.dataVencimento) {
      const dataVenc = new Date(conta.dataVencimento);
      const umaSemana = new Date();
      umaSemana.setDate(umaSemana.getDate() + 7);
      matchesPeriodo = dataVenc <= umaSemana && dataVenc >= new Date();
    } else if (filtroPeriodo === 'vencidas' && conta.dataVencimento) {
      const dataVenc = new Date(conta.dataVencimento);
      matchesPeriodo = dataVenc < new Date() && conta.status === 'pendente';
    }

    return matchesTexto && matchesStatus && matchesOrigem && matchesPeriodo;
  });

  // Ordenar por data de vencimento
  const contasOrdenadas = [...contasFiltradas].sort((a, b) => {
    const dataA = new Date(a.dataVencimento || a.dataCriacao);
    const dataB = new Date(b.dataVencimento || b.dataCriacao);
    return dataA - dataB;
  });

  // Paginação
  const paginatedContas = contasOrdenadas.slice(
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
    total: contas.filter(c => c.status !== 'pago').length,
    valorTotal: contas
      .filter(c => c.status !== 'pago')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
    pendentes: contas.filter(c => c.status === 'pendente').length,
    atrasadas: contas.filter(c => c.status === 'atrasado').length,
    pagas: contas.filter(c => c.status === 'pago').length,
    comissoesPendentes: contas
      .filter(c => c.origem === 'comissao' && c.status !== 'pago')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
    comprasPendentes: contas
      .filter(c => c.origem === 'compra' && c.status !== 'pago')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
  };

  // Renderização mobile
  const renderMobileList = () => {
    if (paginatedContas.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1" color="textSecondary">
            Nenhuma conta encontrada
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ p: 0 }}>
        <AnimatePresence>
          {paginatedContas.map((conta, index) => {
            const fornecedor = fornecedores.find(f => f.id === conta.fornecedorId);
            const profissional = profissionais.find(p => p.id === conta.profissionalId) || 
                               { nome: conta.profissionalNome };
            
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const vencimento = conta.dataVencimento ? new Date(conta.dataVencimento) : null;
            if (vencimento) vencimento.setHours(0, 0, 0, 0);
            const isVencida = vencimento && vencimento < hoje && conta.status === 'pendente';

            return (
              <motion.div
                key={conta.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 2,
                    borderLeft: '4px solid',
                    borderLeftColor: 
                      conta.status === 'pago' ? '#4caf50' :
                      conta.status === 'atrasado' ? '#f44336' :
                      conta.status === 'pendente' ? '#ff9800' : '#9c27b0',
                    bgcolor: isVencida ? '#ffebee20' : 'white',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ 
                          bgcolor: origemColors[conta.origem]?.color || '#757575',
                          width: 32,
                          height: 32
                        }}>
                          {origemColors[conta.origem]?.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {conta.descricao}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {origemColors[conta.origem]?.label}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={statusColors[conta.status]?.label}
                        size="small"
                        sx={{
                          bgcolor: `${statusColors[conta.status]?.color}20`,
                          color: statusColors[conta.status]?.color,
                          fontWeight: 500,
                          height: 24,
                        }}
                      />
                    </Box>

                    {/* Detalhes */}
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            Vencimento
                          </Typography>
                          <Typography variant="body2">
                            {conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : '—'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            Valor
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336' }}>
                            R$ {Number(conta.valor).toFixed(2)}
                          </Typography>
                        </Grid>

                        {conta.origem === 'comissao' && profissional && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="textSecondary">
                              Profissional
                            </Typography>
                            <Typography variant="body2">
                              {profissional.nome} • {conta.servicoNome} ({conta.percentual}%)
                            </Typography>
                          </Grid>
                        )}

                        {conta.origem === 'compra' && fornecedor && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="textSecondary">
                              Fornecedor
                            </Typography>
                            <Typography variant="body2">
                              {fornecedor.nome} • Pedido: {conta.numeroPedido}
                            </Typography>
                          </Grid>
                        )}

                        {conta.origem === 'manual' && fornecedor && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="textSecondary">
                              Fornecedor
                            </Typography>
                            <Typography variant="body2">{fornecedor.nome}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    {/* Ações */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                      <Tooltip title="Detalhes">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetalhes(conta)}
                          sx={{ color: '#9c27b0' }}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>

                      {conta.status !== 'pago' && conta.status !== 'cancelado' && (
                        <Tooltip title="Registrar Pagamento">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenPagamento(conta)}
                            sx={{ color: '#4caf50' }}
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {conta.origem === 'manual' && (
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(conta)}
                            sx={{ color: '#2196f3' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    {isVencida && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          label="Vencida"
                          color="error"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </List>
    );
  };

  const renderFilterDrawer = () => (
    <SwipeableDrawer
      anchor="bottom"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '80vh',
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtrar Contas
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                label="Status"
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

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Origem</InputLabel>
              <Select
                value={filtroOrigem}
                onChange={(e) => setFiltroOrigem(e.target.value)}
                label="Origem"
              >
                <MenuItem value="todas">Todas</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="comissao">Comissão</MenuItem>
                <MenuItem value="compra">Compra</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Período</InputLabel>
              <Select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                label="Período"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="hoje">Vencem Hoje</MenuItem>
                <MenuItem value="semana">Próximos 7 dias</MenuItem>
                <MenuItem value="vencidas">Vencidas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setFilterDrawerOpen(false);
                setFiltroStatus('todos');
                setFiltroOrigem('todas');
                setFiltroPeriodo('todos');
                setFiltro('');
              }}
            >
              Limpar
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={{ bgcolor: '#9c27b0' }}
            >
              Aplicar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </SwipeableDrawer>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <RelatorioContasPagar
          ref={printRef}
          contas={contasOrdenadas}
          filtros={{
            periodo: filtroPeriodo === 'hoje' ? 'Hoje' :
                     filtroPeriodo === 'semana' ? 'Próximos 7 dias' :
                     filtroPeriodo === 'vencidas' ? 'Vencidas' : 'Todos'
          }}
          estatisticas={stats}
          config={config}
          fornecedores={fornecedores}
          profissionais={profissionais}
        />
      </Box>

      {/* Header Mobile */}
      {isMobile && (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0', flex: 1 }}>
              Contas a Pagar
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(true)}>
              <Badge badgeContent={filtroStatus !== 'todos' || filtroOrigem !== 'todas' || filtro ? 1 : 0} color="secondary">
                <FilterIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={carregarDados}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Cards de estatísticas mobile */}
          <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
            <Paper sx={{ p: 1.5, minWidth: 100, textAlign: 'center' }}>
              <Typography variant="caption">Total</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f44336' }}>
                R$ {stats.valorTotal.toFixed(2)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="caption">Pendentes</Typography>
              <Typography variant="subtitle2">{stats.pendentes}</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#ffebee' }}>
              <Typography variant="caption">Atrasadas</Typography>
              <Typography variant="subtitle2">{stats.atrasadas}</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#e8f5e9' }}>
              <Typography variant="caption">Pagas</Typography>
              <Typography variant="subtitle2">{stats.pagas}</Typography>
            </Paper>
          </Box>

          {/* Cards de resumo por origem */}
          <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
            <Paper sx={{ p: 1.5, minWidth: 120, textAlign: 'center', bgcolor: '#f3e5f5' }}>
              <Typography variant="caption">Comissões</Typography>
              <Typography variant="subtitle2" sx={{ color: '#9c27b0' }}>
                R$ {stats.comissoesPendentes.toFixed(2)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 1.5, minWidth: 120, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="caption">Compras</Typography>
              <Typography variant="subtitle2" sx={{ color: '#ff9800' }}>
                R$ {stats.comprasPendentes.toFixed(2)}
              </Typography>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Header Desktop */}
      {!isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Contas a Pagar
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie todas as contas, despesas, comissões e compras do salão
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Imprimir
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
            >
              Nova Conta
            </Button>
          </Box>
        </Box>
      )}

      {/* Cards de Estatísticas Desktop */}
      {!isMobile && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary">Total a Pagar</Typography>
                  <Typography variant="h4" sx={{ color: '#f44336' }}>
                    R$ {stats.valorTotal.toFixed(2)}
                  </Typography>
                  <Typography variant="caption">{stats.total} contas</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fff3e0' }}>
                <CardContent>
                  <Typography color="textSecondary">Pendentes</Typography>
                  <Typography variant="h4" sx={{ color: '#ff9800' }}>
                    {stats.pendentes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#ffebee' }}>
                <CardContent>
                  <Typography color="textSecondary">Atrasadas</Typography>
                  <Typography variant="h4" sx={{ color: '#f44336' }}>
                    {stats.atrasadas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Typography color="textSecondary">Pagas</Typography>
                  <Typography variant="h4" sx={{ color: '#4caf50' }}>
                    {stats.pagas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Cards de Resumo por Origem */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#f3e5f5' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                      <PercentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">Comissões a Pagar</Typography>
                      <Typography variant="h5" sx={{ color: '#9c27b0' }}>
                        R$ {stats.comissoesPendentes.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#fff3e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                      <ShoppingCartIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">Compras a Pagar</Typography>
                      <Typography variant="h5" sx={{ color: '#ff9800' }}>
                        R$ {stats.comprasPendentes.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filtros Desktop */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar..."
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
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                      label="Status"
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
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Origem</InputLabel>
                    <Select
                      value={filtroOrigem}
                      onChange={(e) => setFiltroOrigem(e.target.value)}
                      label="Origem"
                    >
                      <MenuItem value="todas">Todas</MenuItem>
                      <MenuItem value="manual">Manual</MenuItem>
                      <MenuItem value="comissao">Comissão</MenuItem>
                      <MenuItem value="compra">Compra</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Período</InputLabel>
                    <Select
                      value={filtroPeriodo}
                      onChange={(e) => setFiltroPeriodo(e.target.value)}
                      label="Período"
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      <MenuItem value="hoje">Vencem Hoje</MenuItem>
                      <MenuItem value="semana">Próximos 7 dias</MenuItem>
                      <MenuItem value="vencidas">Vencidas</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setFiltroStatus('todos');
                      setFiltroOrigem('todas');
                      setFiltroPeriodo('todos');
                      setFiltro('');
                    }}
                  >
                    Limpar
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {/* Conteúdo principal */}
      <Card>
        <CardContent sx={{ p: isMobile ? 1 : 3 }}>
          {isMobile ? (
            renderMobileList()
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell><strong>Origem</strong></TableCell>
                    <TableCell><strong>Vencimento</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedContas.map((conta, index) => {
                    const fornecedor = fornecedores.find(f => f.id === conta.fornecedorId);
                    const profissional = profissionais.find(p => p.id === conta.profissionalId) || 
                                       { nome: conta.profissionalNome };
                    
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    const vencimento = conta.dataVencimento ? new Date(conta.dataVencimento) : null;
                    if (vencimento) vencimento.setHours(0, 0, 0, 0);
                    const isVencida = vencimento && vencimento < hoje && conta.status === 'pendente';

                    return (
                      <TableRow key={conta.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ 
                              bgcolor: origemColors[conta.origem]?.color || '#757575',
                              width: 32,
                              height: 32
                            }}>
                              {origemColors[conta.origem]?.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {conta.descricao}
                              </Typography>
                              {conta.origem === 'comissao' && profissional && (
                                <Typography variant="caption" color="textSecondary">
                                  {profissional.nome} • {conta.servicoNome} ({conta.percentual}%)
                                </Typography>
                              )}
                              {conta.origem === 'compra' && fornecedor && (
                                <Typography variant="caption" color="textSecondary">
                                  {fornecedor.nome} • Pedido: {conta.numeroPedido}
                                </Typography>
                              )}
                              {conta.origem === 'manual' && fornecedor && (
                                <Typography variant="caption" color="textSecondary">
                                  {fornecedor.nome}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={origemColors[conta.origem]?.icon}
                            label={origemColors[conta.origem]?.label}
                            size="small"
                            sx={{
                              bgcolor: `${origemColors[conta.origem]?.color}20`,
                              color: origemColors[conta.origem]?.color,
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            {conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : '—'}
                            {isVencida && (
                              <Chip
                                size="small"
                                label="Vencida"
                                color="error"
                                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="#f44336">
                            R$ {Number(conta.valor).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusColors[conta.status]?.label}
                            size="small"
                            sx={{
                              bgcolor: `${statusColors[conta.status]?.color}20`,
                              color: statusColors[conta.status]?.color,
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Ver Detalhes">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDetalhes(conta)}
                                sx={{ color: '#9c27b0' }}
                              >
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {conta.status !== 'pago' && conta.status !== 'cancelado' && (
                              <Tooltip title="Registrar Pagamento">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenPagamento(conta)}
                                  sx={{ color: '#4caf50' }}
                                >
                                  <PaymentIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {conta.origem === 'manual' && (
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(conta)}
                                  sx={{ color: '#2196f3' }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
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

      {/* Paginação Desktop */}
      {!isMobile && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={contasOrdenadas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}

      {/* Bottom Navigation Mobile */}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }} elevation={3}>
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => setBottomNavValue(newValue)}
            showLabels
          >
            <BottomNavigationAction label="Lista" icon={<ReceiptIcon />} />
            <BottomNavigationAction 
              label="Imprimir" 
              icon={<PrintIcon />} 
              onClick={handlePrint}
            />
            <BottomNavigationAction 
              label="Exportar" 
              icon={<DownloadIcon />}
              onClick={handleExportCSV}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* FAB para filtros mobile */}
      {isMobile && (
        <Zoom in={!filterDrawerOpen}>
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 80, right: 16 }}
            onClick={() => setFilterDrawerOpen(true)}
          >
            <FilterIcon />
          </Fab>
        </Zoom>
      )}

      {/* Drawer de filtros mobile */}
      {renderFilterDrawer()}

      {/* Dialog de Pagamento */}
      <Dialog open={openPagamentoDialog} onClose={handleClosePagamento} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          Confirmar Pagamento
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Deseja registrar o pagamento de:
            </Alert>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar sx={{ 
                  bgcolor: origemColors[contaSelecionada?.origem]?.color || '#757575',
                  width: 32,
                  height: 32
                }}>
                  {origemColors[contaSelecionada?.origem]?.icon}
                </Avatar>
                <Typography variant="subtitle2">{contaSelecionada?.descricao}</Typography>
              </Box>
              
              <Typography variant="h5" color="primary" sx={{ mt: 2, fontWeight: 600 }}>
                R$ {Number(contaSelecionada?.valor).toFixed(2)}
              </Typography>
              
              {contaSelecionada?.origem === 'comissao' && (
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Profissional: {contaSelecionada?.profissionalNome}
                </Typography>
              )}
              
              {contaSelecionada?.origem === 'compra' && (
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Pedido: {contaSelecionada?.numeroPedido}
                </Typography>
              )}
              
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Vencimento: {contaSelecionada?.dataVencimento && new Date(contaSelecionada.dataVencimento).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePagamento}>Cancelar</Button>
          <Button
            onClick={handleRegistrarPagamento}
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes da Conta
        </DialogTitle>
        <DialogContent>
          {contaSelecionada && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Descrição</Typography>
                  <Typography variant="body2">{contaSelecionada.descricao}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Origem</Typography>
                  <Typography variant="body2">
                    {origemColors[contaSelecionada.origem]?.label}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Valor</Typography>
                  <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 600 }}>
                    R$ {Number(contaSelecionada.valor).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Vencimento</Typography>
                  <Typography variant="body2">
                    {contaSelecionada.dataVencimento ? new Date(contaSelecionada.dataVencimento).toLocaleDateString('pt-BR') : '—'}
                  </Typography>
                </Grid>

                {contaSelecionada.origem === 'comissao' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Profissional</Typography>
                      <Typography variant="body2">{contaSelecionada.profissionalNome}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Serviço</Typography>
                      <Typography variant="body2">
                        {contaSelecionada.servicoNome} ({contaSelecionada.percentual}% de R$ {contaSelecionada.valorAtendimento})
                      </Typography>
                    </Grid>
                  </>
                )}

                {contaSelecionada.origem === 'compra' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Fornecedor</Typography>
                      <Typography variant="body2">
                        {fornecedores.find(f => f.id === contaSelecionada.fornecedorId)?.nome || 'Não informado'}
                      </Typography>
                    </Grid>
                    {contaSelecionada.numeroPedido && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Pedido</Typography>
                        <Typography variant="body2">{contaSelecionada.numeroPedido}</Typography>
                      </Grid>
                    )}
                  </>
                )}

                {contaSelecionada.origem === 'manual' && contaSelecionada.fornecedorId && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Fornecedor</Typography>
                    <Typography variant="body2">
                      {fornecedores.find(f => f.id === contaSelecionada.fornecedorId)?.nome}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Status</Typography>
                  <Chip
                    label={statusColors[contaSelecionada.status]?.label}
                    size="small"
                    sx={{
                      bgcolor: `${statusColors[contaSelecionada.status]?.color}20`,
                      color: statusColors[contaSelecionada.status]?.color,
                      mt: 0.5,
                    }}
                  />
                </Grid>

                {contaSelecionada.dataPagamento && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Pago em</Typography>
                    <Typography variant="body2">
                      {new Date(contaSelecionada.dataPagamento).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Grid>
                )}

                {contaSelecionada.observacoes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Observações</Typography>
                    <Typography variant="body2">{contaSelecionada.observacoes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
          {contaSelecionada?.status !== 'pago' && contaSelecionada?.status !== 'cancelado' && (
            <Button
              onClick={() => {
                handleCloseDetalhes();
                handleOpenPagamento(contaSelecionada);
              }}
              variant="contained"
              color="success"
              startIcon={<PaymentIcon />}
            >
              Pagar
            </Button>
          )}
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

export default ContasPagar;
