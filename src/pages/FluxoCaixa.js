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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Snackbar,
  InputAdornment,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Zoom,
  Fab,
  Skeleton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
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
  CalendarToday as CalendarIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
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
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { format, subDays, subMonths, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];

// Função utilitária para formatar data com segurança
const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '—';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '—';
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '—';
  }
};

// Componente de Card de Movimentação Mobile
const TransacaoMobileCard = ({ transacao, onDetalhes }) => {
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
        }}
        onClick={() => onDetalhes(transacao)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: transacao.tipo === 'receita' ? '#4caf50' : '#f44336',
                width: 48,
                height: 48,
              }}
            >
              {transacao.tipo === 'receita' ? <TrendingUpIcon /> : <TrendingDownIcon />}
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
                  label={transacao.categoria || 'Sem categoria'}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    bgcolor: '#f5f5f5',
                  }}
                />
                
                {transacao.formaPagamento && (
                  <Chip
                    size="small"
                    label={transacao.formaPagamento}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                
                <Typography variant="caption" color="text.secondary">
                  {formatDate(transacao.data)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente Principal
function FluxoCaixa() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [loading, setLoading] = useState(true);
  const [transacoes, setTransacoes] = useState([]);
  const [caixa, setCaixa] = useState(null);
  const [dataInicio, setDataInicio] = useState(
    format(new Date(new Date().setDate(1)), 'yyyy-MM-dd')
  );
  const [dataFim, setDataFim] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openDetalheDialog, setOpenDetalheDialog] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(isMobile ? 5 : 10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bottomNavValue, setBottomNavValue] = useState(0);

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
      
      const [transacoesData, caixaData] = await Promise.all([
        firebaseService.getAll('transacoes').catch(() => []),
        firebaseService.getAll('caixa').catch(() => []),
      ]);
      
      setTransacoes(transacoesData || []);
      
      // Pega o caixa atual (último caixa aberto)
      const caixaAtual = caixaData?.length > 0 
        ? caixaData.filter(c => c && c.status === 'aberto')
            .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))[0]
        : null;
      setCaixa(caixaAtual);

      // Registrar acesso na auditoria
      await auditoriaService.registrar('acesso_fluxo_caixa', {
        entidade: 'fluxo_caixa',
        detalhes: 'Acesso à página de fluxo de caixa',
        dados: {
          periodoInicio: dataInicio,
          periodoFim: dataFim,
          totalTransacoes: transacoesData?.length || 0
        }
      });
      
      mostrarSnackbar('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_fluxo_caixa',
        detalhes: 'Erro ao carregar dados de fluxo de caixa'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar transações por período e outros filtros
  const transacoesFiltradas = useMemo(() => {
    let resultados = transacoes.filter(t => {
      if (!t.data) return false;
      const data = new Date(t.data);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      return data >= inicio && data <= fim;
    });

    // Aplicar filtro de texto
    if (filtro) {
      const termo = filtro.toLowerCase();
      resultados = resultados.filter(t => 
        t.descricao?.toLowerCase().includes(termo) ||
        t.categoria?.toLowerCase().includes(termo) ||
        t.formaPagamento?.toLowerCase().includes(termo)
      );
    }

    // Aplicar filtro por tipo
    if (filtroTipo !== 'todos') {
      resultados = resultados.filter(t => t.tipo === filtroTipo);
    }

    // Aplicar filtro por categoria
    if (filtroCategoria !== 'todos') {
      resultados = resultados.filter(t => t.categoria === filtroCategoria);
    }

    return resultados;
  }, [transacoes, dataInicio, dataFim, filtro, filtroTipo, filtroCategoria]);

  // Calcular totais
  const totais = useMemo(() => {
    const receitas = transacoesFiltradas
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const despesas = transacoesFiltradas
      .filter(t => t.tipo === 'despesa' && t.status === 'pago')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const saldo = receitas - despesas;

    // Receitas pendentes
    const receitasPendentes = transacoesFiltradas
      .filter(t => t.tipo === 'receita' && t.status === 'pendente')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    // Despesas pendentes
    const despesasPendentes = transacoesFiltradas
      .filter(t => t.tipo === 'despesa' && t.status === 'pendente')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    return {
      receitas,
      despesas,
      saldo,
      receitasPendentes,
      despesasPendentes,
      totalTransacoes: transacoesFiltradas.length,
    };
  }, [transacoesFiltradas]);

  // Dados para gráfico de linha (evolução diária)
  const dadosGraficoLinha = useMemo(() => {
    const dados = [];
    const dataAtual = new Date(dataInicio);
    const dataFinal = new Date(dataFim);
    dataFinal.setHours(23, 59, 59, 999);

    while (dataAtual <= dataFinal) {
      const diaStr = dataAtual.toISOString().split('T')[0];
      
      const receitasDia = transacoesFiltradas
        .filter(t => t.tipo === 'receita' && t.status === 'pago' && t.data?.startsWith(diaStr))
        .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
        
      const despesasDia = transacoesFiltradas
        .filter(t => t.tipo === 'despesa' && t.status === 'pago' && t.data?.startsWith(diaStr))
        .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

      dados.push({
        dia: format(dataAtual, 'dd/MM'),
        data: dataAtual.toISOString(),
        receitas: receitasDia,
        despesas: despesasDia,
        saldo: receitasDia - despesasDia,
      });

      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    return dados;
  }, [transacoesFiltradas, dataInicio, dataFim]);

  // Dados para gráfico de pizza por categoria
  const dadosGraficoPizza = useMemo(() => {
    const categorias = {};
    
    transacoesFiltradas
      .filter(t => t.status === 'pago')
      .forEach(t => {
        const cat = t.categoria || 'Outros';
        if (!categorias[cat]) {
          categorias[cat] = 0;
        }
        categorias[cat] += Number(t.valor) || 0;
      });

    return Object.entries(categorias)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transacoesFiltradas]);

  // Dados para gráfico de barras por categoria
  const dadosGraficoBarras = useMemo(() => {
    const categorias = {};
    
    transacoesFiltradas
      .filter(t => t.status === 'pago')
      .forEach(t => {
        const cat = t.categoria || 'Outros';
        if (!categorias[cat]) {
          categorias[cat] = { receitas: 0, despesas: 0 };
        }
        if (t.tipo === 'receita') {
          categorias[cat].receitas += Number(t.valor) || 0;
        } else {
          categorias[cat].despesas += Number(t.valor) || 0;
        }
      });

    return Object.entries(categorias)
      .map(([categoria, valores]) => ({
        categoria,
        receitas: valores.receitas,
        despesas: valores.despesas,
        saldo: valores.receitas - valores.despesas,
      }))
      .sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo))
      .slice(0, 8);
  }, [transacoesFiltradas]);

  // Categorias únicas para filtro
  const categoriasUnicas = useMemo(() => {
    const cats = new Set();
    transacoes.forEach(t => {
      if (t.categoria) cats.add(t.categoria);
    });
    return ['todos', ...Array.from(cats)];
  }, [transacoes]);

  // Paginação
  const transacoesPaginadas = transacoesFiltradas
    .filter(t => t.status === 'pago')
    .sort((a, b) => new Date(b.data) - new Date(a.data));
  
  const totalPages = Math.ceil(transacoesPaginadas.length / itemsPerPage);
  const transacoesPaginaAtual = transacoesPaginadas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleVerDetalhes = (transacao) => {
    setTransacaoSelecionada(transacao);
    setOpenDetalheDialog(true);
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
      doc.text('RELATÓRIO DE FLUXO DE CAIXA', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Período: ${formatDate(dataInicio)} a ${formatDate(dataFim)}`, 105, 30, { align: 'center' });

      // Informações principais
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      let yPos = 50;
      
      // Resumo
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, 170, 40, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text('Receitas:', 25, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(`R$ ${totais.receitas.toFixed(2)}`, 50, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Despesas:', 80, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(`R$ ${totais.despesas.toFixed(2)}`, 105, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Saldo:', 135, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(`R$ ${totais.saldo.toFixed(2)}`, 160, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total de Transações:', 25, yPos + 25);
      doc.setFont('helvetica', 'normal');
      doc.text(String(totais.totalTransacoes), 70, yPos + 25);
      
      yPos += 55;

      // Tabela de transações
      const tableColumn = ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo'];
      const tableRows = [];
      
      transacoesPaginadas.slice(0, 30).forEach(t => {
        const row = [
          formatDate(t.data),
          t.descricao || '—',
          t.categoria || '—',
          `R$ ${Number(t.valor || 0).toFixed(2)}`,
          t.tipo === 'receita' ? 'Receita' : 'Despesa',
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
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 25 },
        },
      });
      
      // Rodapé
      const finalY = doc.lastAutoTable.finalY || yPos + 50;
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Documento gerado pelo sistema de gestão', 105, finalY + 10, { align: 'center' });
      doc.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, finalY + 15, { align: 'center' });
      
      // Registrar na auditoria
      await auditoriaService.registrar('exportar_fluxo_caixa', {
        entidade: 'fluxo_caixa',
        detalhes: 'Exportação de relatório de fluxo de caixa',
        dados: {
          formato: 'PDF',
          periodoInicio: dataInicio,
          periodoFim: dataFim,
          totalTransacoes: transacoesPaginadas.length,
          totais
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
      // Criar dados para exportação
      const dadosExport = transacoesPaginadas.map(t => ({
        Data: formatDate(t.data),
        Descrição: t.descricao || '',
        Categoria: t.categoria || '',
        'Forma de Pagamento': t.formaPagamento || '',
        Valor: Number(t.valor || 0).toFixed(2),
        Tipo: t.tipo === 'receita' ? 'Receita' : 'Despesa',
        Status: t.status || 'pago',
      }));

      // Criar CSV
      const headers = ['Data', 'Descrição', 'Categoria', 'Forma de Pagamento', 'Valor', 'Tipo', 'Status'];
      const csvContent = [
        headers.join(','),
        ...dadosExport.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `fluxo_caixa_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      // Registrar na auditoria
      await auditoriaService.registrar('exportar_fluxo_caixa', {
        entidade: 'fluxo_caixa',
        detalhes: 'Exportação de relatório de fluxo de caixa',
        dados: {
          formato: 'CSV',
          periodoInicio: dataInicio,
          periodoFim: dataFim,
          totalTransacoes: transacoesPaginadas.length,
          totais
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
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 100 : 60} sx={{ borderRadius: 2, mb: 2 }} />
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
            Fluxo de Caixa
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Acompanhe as movimentações financeiras
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
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Data Início"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Data Fim"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
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
            color: filtroTipo !== 'todos' || filtroCategoria !== 'todos' ? '#9c27b0' : 'text.secondary'
          }}
        >
          <Badge 
            variant="dot" 
            color="primary"
            invisible={filtroTipo === 'todos' && filtroCategoria === 'todos'}
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
        <Grid item xs={12} sm={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      Receitas
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      R$ {totais.receitas.toFixed(2)}
                    </Typography>
                    {totais.receitasPendentes > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        + R$ {totais.receitasPendentes.toFixed(2)} pendentes
                      </Typography>
                    )}
                  </Box>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      Despesas
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                      R$ {totais.despesas.toFixed(2)}
                    </Typography>
                    {totais.despesasPendentes > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        + R$ {totais.despesasPendentes.toFixed(2)} pendentes
                      </Typography>
                    )}
                  </Box>
                  <Avatar sx={{ bgcolor: '#f44336', width: 48, height: 48 }}>
                    <TrendingDownIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: totais.saldo >= 0 ? '#e8f5e9' : '#ffebee' }}>
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
                        color: totais.saldo >= 0 ? '#4caf50' : '#f44336' 
                      }}
                    >
                      R$ {totais.saldo.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {totais.totalTransacoes} transações
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                    <AccountBalanceIcon />
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
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, px: 1 }}>
                  Evolução Diária
                </Typography>
                <Box sx={{ height: isMobile ? 250 : 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dadosGraficoLinha}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <RechartsTooltip 
                        formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="receitas" 
                        stackId="1" 
                        stroke="#4caf50" 
                        fill="#4caf50" 
                        fillOpacity={0.6} 
                        name="Receitas"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="despesas" 
                        stackId="1" 
                        stroke="#f44336" 
                        fill="#f44336" 
                        fillOpacity={0.6} 
                        name="Despesas"
                      />
                    </AreaChart>
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
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, px: 1 }}>
                  Distribuição
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
                        formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Gráfico de Barras por Categoria */}
      {dadosGraficoBarras.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: isMobile ? 1 : 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, px: 1 }}>
              Categorias (Receitas vs Despesas)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGraficoBarras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" tick={{ fontSize: isMobile ? 8 : 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                  />
                  <Legend />
                  <Bar dataKey="receitas" fill="#4caf50" name="Receitas" />
                  <Bar dataKey="despesas" fill="#f44336" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Lista de Movimentações Mobile */}
      <Card>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Movimentações do Período
          </Typography>
          
          {transacoesPaginaAtual.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <AccountBalanceIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhuma movimentação encontrada
              </Typography>
            </Paper>
          ) : (
            <>
              <AnimatePresence>
                {transacoesPaginaAtual.map((transacao) => (
                  <TransacaoMobileCard
                    key={transacao.id}
                    transacao={transacao}
                    onDetalhes={handleVerDetalhes}
                  />
                ))}
              </AnimatePresence>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Stack spacing={2}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size={isMobile ? "small" : "large"}
                    />
                  </Stack>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
              variant={filtroCategoria === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroCategoria('todos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todas as categorias
            </Button>
            {categoriasUnicas.filter(c => c !== 'todos').map((cat) => (
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
        onClose={() => setOpenDetalheDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        {transacaoSelecionada && (
          <>
            <DialogTitle sx={{ 
              bgcolor: transacaoSelecionada.tipo === 'receita' ? '#4caf50' : '#f44336', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: isMobile ? 2 : 3,
            }}>
              {isMobile && (
                <IconButton edge="start" color="inherit" onClick={() => setOpenDetalheDialog(false)}>
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Typography variant={isMobile ? "subtitle1" : "h6"}>
                Detalhes da Transação
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: transacaoSelecionada.tipo === 'receita' ? '#4caf50' : '#f44336', mb: 2 }}>
                      {transacaoSelecionada.descricao}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Data</Typography>
                        <Typography variant="body2">{formatDate(transacaoSelecionada.data)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Tipo</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={transacaoSelecionada.tipo === 'receita' ? 'Receita' : 'Despesa'}
                            color={transacaoSelecionada.tipo === 'receita' ? 'success' : 'error'}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider />
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Valor</Typography>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 700,
                            color: transacaoSelecionada.tipo === 'receita' ? '#4caf50' : '#f44336'
                          }}
                        >
                          R$ {Number(transacaoSelecionada.valor || 0).toFixed(2)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={transacaoSelecionada.status || 'pago'}
                            color={transacaoSelecionada.status === 'pago' ? 'success' : 'warning'}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Categoria</Typography>
                        <Typography variant="body2">{transacaoSelecionada.categoria || '—'}</Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Forma de Pagamento</Typography>
                        <Typography variant="body2">{transacaoSelecionada.formaPagamento || '—'}</Typography>
                      </Grid>

                      {transacaoSelecionada.observacoes && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">Observações</Typography>
                          <Typography variant="body2">{transacaoSelecionada.observacoes}</Typography>
                        </Grid>
                      )}

                      {transacaoSelecionada.clienteNome && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">Cliente</Typography>
                          <Typography variant="body2">{transacaoSelecionada.clienteNome}</Typography>
                        </Grid>
                      )}

                      {transacaoSelecionada.usuarioNome && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">Responsável</Typography>
                          <Typography variant="body2">{transacaoSelecionada.usuarioNome}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
              <Button onClick={() => setOpenDetalheDialog(false)} fullWidth={isMobile}>
                Fechar
              </Button>
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
                  Período: {formatDate(dataInicio)} a {formatDate(dataFim)}
                </Typography>
                <Typography variant="body2">
                  Total de transações: {totais.totalTransacoes}
                </Typography>
              </Alert>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)}>Cancelar</Button>
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
                  invisible={filtroTipo === 'todos' && filtroCategoria === 'todos'}
                >
                  <FilterIcon />
                </Badge>
              } 
            />
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

export default FluxoCaixa;
