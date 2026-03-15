// src/pages/FidelidadeHistorico.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Pagination,
  Stack,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Zoom,
  Fab,
  Skeleton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Snackbar,
  Badge, // Adicionado Badge
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Event as EventIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';
import { format, subDays, subMonths, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { auditoriaService } from '../services/auditoriaService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Níveis de fidelidade
const niveis = {
  bronze: { cor: '#cd7f32', nome: 'Bronze', minimo: 0, bg: '#fff3e0' },
  prata: { cor: '#c0c0c0', nome: 'Prata', minimo: 500, bg: '#f5f5f5' },
  ouro: { cor: '#ffd700', nome: 'Ouro', minimo: 2000, bg: '#fff9e6' },
  platina: { cor: '#e5e4e2', nome: 'Platina', minimo: 5000, bg: '#f0f0f0' },
};

// Função utilitária para formatar data com segurança
const formatDate = (date, formatString = 'dd/MM/yyyy HH:mm') => {
  if (!date) return '—';
  
  try {
    // Handle Firestore Timestamp
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (!isValid(dateObj)) return '—';
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '—';
  }
};

// Componente de Card de Movimentação Mobile
const MovimentacaoMobileCard = ({ item, onDetalhes }) => {
  const getIcon = () => {
    switch(item.tipoMov) {
      case 'credito':
        return <TrendingUpIcon sx={{ color: '#4caf50' }} />;
      case 'debito':
        return <TrendingDownIcon sx={{ color: '#f44336' }} />;
      case 'resgate':
        return <GiftIcon sx={{ color: '#ff9800' }} />;
      default:
        return <StarIcon sx={{ color: '#9c27b0' }} />;
    }
  };

  const getColor = () => {
    switch(item.tipoMov) {
      case 'credito': return '#4caf50';
      case 'debito': return '#f44336';
      case 'resgate': return '#ff9800';
      default: return '#9c27b0';
    }
  };

  const getLabel = () => {
    switch(item.tipoMov) {
      case 'credito': return 'Crédito';
      case 'debito': return 'Débito';
      case 'resgate': return 'Resgate';
      default: return item.tipoMov;
    }
  };

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
        onClick={() => onDetalhes(item)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: `${getColor()}20`, color: getColor() }}>
              {getIcon()}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {item.motivo || item.recompensaNome || 'Movimentação'}
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 700,
                    color: getColor()
                  }}
                >
                  {item.tipoMov === 'credito' ? '+' : '-'}
                  {Math.abs(item.quantidade || item.pontosGastos || 0)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={getLabel()}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    bgcolor: `${getColor()}20`,
                    color: getColor(),
                  }}
                />
                
                {item.status && (
                  <Chip
                    size="small"
                    label={item.status}
                    color={item.status === 'resgatado' ? 'success' : 'warning'}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                
                <Typography variant="caption" color="text.secondary">
                  {formatDate(item.data, 'dd/MM/yyyy')}
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
function FidelidadeHistorico() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [pontuacoes, setPontuacoes] = useState([]);
  const [resgates, setResgates] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [tabValue, setTabValue] = useState(0);
  const [filtro, setFiltro] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(isMobile ? 5 : 10);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openDetalheDialog, setOpenDetalheDialog] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bottomNavValue, setBottomNavValue] = useState(0);
  
  const [estatisticas, setEstatisticas] = useState({
    totalCreditos: 0,
    totalDebitos: 0,
    totalResgates: 0,
    pontosResgatados: 0,
    mediaMensal: 0,
    melhorMes: { mes: '', pontos: 0 },
  });

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  useEffect(() => {
    calcularEstatisticas();
  }, [pontuacoes, resgates]);

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do cliente
      const clienteData = await firebaseService.getById('clientes', id);
      if (!clienteData) {
        mostrarSnackbar('Cliente não encontrado', 'error');
        navigate('/fidelidade/gerenciar');
        return;
      }
      setCliente(clienteData);
      
      // Carregar foto do cliente
      if (clienteData.foto && clienteData.foto !== 'null' && clienteData.foto !== 'undefined' && clienteData.foto.trim() !== '') {
        setFotoUrl(clienteData.foto);
      } else {
        setFotoUrl(null);
      }

      // Buscar pontuações do cliente
      const pontuacoesData = await firebaseService.query('pontuacao', [
        { field: 'clienteId', operator: '==', value: id }
      ], 'data', 'desc');
      setPontuacoes(pontuacoesData || []);

      // Buscar resgates do cliente
      const resgatesData = await firebaseService.query('resgates_fidelidade', [
        { field: 'clienteId', operator: '==', value: id }
      ], 'data', 'desc');
      setResgates(resgatesData || []);

      // Registrar acesso na auditoria
      await auditoriaService.registrar('visualizar_historico_fidelidade', {
        entidade: 'fidelidade',
        entidadeId: id,
        detalhes: `Visualização do histórico de fidelidade do cliente ${clienteData.nome}`,
        dados: {
          clienteId: id,
          clienteNome: clienteData.nome,
          totalPontuacoes: pontuacoesData?.length || 0,
          totalResgates: resgatesData?.length || 0
        }
      });

      // Calcular saldo
      const creditos = (pontuacoesData || [])
        .filter(p => p.tipo === 'credito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);
      const debitos = (pontuacoesData || [])
        .filter(p => p.tipo === 'debito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);
      
      const saldoAtual = creditos - debitos;
      setSaldo(saldoAtual);

      // Determinar nível
      let nivelAtual = 'bronze';
      if (saldoAtual >= 5000) nivelAtual = 'platina';
      else if (saldoAtual >= 2000) nivelAtual = 'ouro';
      else if (saldoAtual >= 500) nivelAtual = 'prata';
      setNivel(nivelAtual);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar histórico', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_historico_fidelidade',
        clienteId: id
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = () => {
    // Total de créditos
    const totalCreditos = pontuacoes
      .filter(p => p.tipo === 'credito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);

    // Total de débitos
    const totalDebitos = pontuacoes
      .filter(p => p.tipo === 'debito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);

    // Total de resgates
    const totalResgates = resgates.length;
    
    // Pontos resgatados
    const pontosResgatados = resgates
      .reduce((acc, r) => acc + (r.pontosGastos || 0), 0);

    // Média mensal (últimos 12 meses)
    const hoje = new Date();
    const dozeMesesAtras = subMonths(hoje, 12);
    const pontuacoesUltimos12Meses = pontuacoes.filter(p => {
      const data = p.data ? new Date(p.data) : null;
      return data && data >= dozeMesesAtras && data <= hoje;
    });
    
    const totalPontos12Meses = pontuacoesUltimos12Meses
      .filter(p => p.tipo === 'credito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);
    
    const mediaMensal = totalPontos12Meses / 12;

    // Melhor mês
    const pontuacoesPorMes = {};
    pontuacoes.forEach(p => {
      if (p.tipo === 'credito' && p.data) {
        try {
          const mes = format(new Date(p.data), 'MMM/yyyy', { locale: ptBR });
          pontuacoesPorMes[mes] = (pontuacoesPorMes[mes] || 0) + (p.quantidade || 0);
        } catch (e) {
          // Ignorar datas inválidas
        }
      }
    });

    let melhorMes = { mes: '', pontos: 0 };
    Object.entries(pontuacoesPorMes).forEach(([mes, pontos]) => {
      if (pontos > melhorMes.pontos) {
        melhorMes = { mes, pontos };
      }
    });

    setEstatisticas({
      totalCreditos,
      totalDebitos,
      totalResgates,
      pontosResgatados,
      mediaMensal: Math.round(mediaMensal) || 0,
      melhorMes,
    });
  };

  const getNivelCor = (nivel) => {
    return niveis[nivel]?.cor || '#999';
  };

  const getNivelBg = (nivel) => {
    return niveis[nivel]?.bg || '#f5f5f5';
  };

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'credito':
        return <TrendingUpIcon sx={{ color: '#4caf50' }} />;
      case 'debito':
        return <TrendingDownIcon sx={{ color: '#f44336' }} />;
      case 'resgate':
        return <GiftIcon sx={{ color: '#ff9800' }} />;
      default:
        return <StarIcon />;
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'credito':
        return 'Crédito';
      case 'debito':
        return 'Débito';
      case 'resgate':
        return 'Resgate';
      default:
        return tipo;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'resgatado':
        return 'success';
      case 'cancelado':
        return 'error';
      case 'pendente':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Função para obter as iniciais do nome
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Verificar se a foto é válida
  const temFotoValida = () => {
    return fotoUrl && fotoUrl !== 'null' && fotoUrl !== 'undefined' && fotoUrl.trim() !== '';
  };

  // Filtrar movimentações
  const movimentacoesFiltradas = useMemo(() => {
    let resultados = [];

    // Adicionar pontuações
    pontuacoes.forEach(p => {
      resultados.push({
        ...p,
        tipoMov: p.tipo,
        dataObj: p.data ? new Date(p.data) : new Date(0),
        icone: getTipoIcon(p.tipo),
        cor: p.tipo === 'credito' ? '#4caf50' : '#f44336',
      });
    });

    // Adicionar resgates
    resgates.forEach(r => {
      resultados.push({
        id: `resgate-${r.id}`,
        tipo: 'resgate',
        tipoMov: 'resgate',
        quantidade: -r.pontosGastos,
        pontosGastos: r.pontosGastos,
        motivo: `Resgate: ${r.recompensaNome}`,
        data: r.data,
        dataObj: r.data ? new Date(r.data) : new Date(0),
        recompensaId: r.recompensaId,
        recompensaNome: r.recompensaNome,
        status: r.status,
        codigo: r.codigo,
        icone: <GiftIcon sx={{ color: '#ff9800' }} />,
        cor: '#ff9800',
      });
    });

    // Ordenar por data (mais recente primeiro)
    resultados.sort((a, b) => b.dataObj - a.dataObj);

    // Aplicar filtros
    if (filtro) {
      const termo = filtro.toLowerCase();
      resultados = resultados.filter(item => 
        item.motivo?.toLowerCase().includes(termo) ||
        item.recompensaNome?.toLowerCase().includes(termo) ||
        item.quantidade?.toString().includes(termo) ||
        item.pontosGastos?.toString().includes(termo)
      );
    }

    if (filtroTipo !== 'todos') {
      resultados = resultados.filter(item => item.tipoMov === filtroTipo);
    }

    if (filtroPeriodo !== 'todos') {
      const hoje = new Date();
      let dataLimite = new Date();

      switch(filtroPeriodo) {
        case 'hoje':
          dataLimite.setHours(0, 0, 0, 0);
          resultados = resultados.filter(item => item.dataObj >= dataLimite);
          break;
        case 'semana':
          dataLimite = subDays(hoje, 7);
          resultados = resultados.filter(item => item.dataObj >= dataLimite);
          break;
        case 'mes':
          dataLimite = subDays(hoje, 30);
          resultados = resultados.filter(item => item.dataObj >= dataLimite);
          break;
        case 'trimestre':
          dataLimite = subDays(hoje, 90);
          resultados = resultados.filter(item => item.dataObj >= dataLimite);
          break;
        default:
          break;
      }
    }

    return resultados;
  }, [pontuacoes, resgates, filtro, filtroTipo, filtroPeriodo]);

  const totalMovimentacoes = movimentacoesFiltradas.length;
  const totalPages = Math.ceil(totalMovimentacoes / itemsPerPage);
  
  // Paginação
  const paginatedMovimentacoes = movimentacoesFiltradas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleVerDetalhes = (item) => {
    setItemSelecionado(item);
    setOpenDetalheDialog(true);
  };

  const handleVoltar = () => {
    navigate('/fidelidade/gerenciar');
  };

  const handleImprimirPDF = async () => {
    try {
      if (!cliente) return;

      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFillColor(156, 39, 176);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('HISTÓRICO DE FIDELIDADE', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(cliente.nome, 105, 30, { align: 'center' });

      // Informações do cliente
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      let yPos = 50;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Telefone:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(cliente.telefone || '—', 60, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Email:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(cliente.email || '—', 60, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Nível:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(nivel.toUpperCase(), 60, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Saldo:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${saldo} pontos`, 60, yPos);
      
      yPos += 15;

      // Estatísticas
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, 170, 40, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Créditos:', 25, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(estatisticas.totalCreditos), 50, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Débitos:', 80, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(estatisticas.totalDebitos), 105, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Resgates:', 135, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(estatisticas.totalResgates), 160, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Média Mensal:', 25, yPos + 25);
      doc.setFont('helvetica', 'normal');
      doc.text(String(estatisticas.mediaMensal), 60, yPos + 25);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Melhor Mês:', 100, yPos + 25);
      doc.setFont('helvetica', 'normal');
      doc.text(`${estatisticas.melhorMes.mes} (${estatisticas.melhorMes.pontos})`, 130, yPos + 25);
      
      yPos += 55;

      // Tabela de movimentações
      const tableColumn = ['Data', 'Tipo', 'Descrição', 'Pontos'];
      const tableRows = [];
      
      movimentacoesFiltradas.slice(0, 20).forEach(item => {
        const row = [
          formatDate(item.data, 'dd/MM/yyyy HH:mm'),
          getTipoLabel(item.tipoMov),
          item.motivo || item.recompensaNome || '—',
          `${item.tipoMov === 'credito' ? '+' : '-'}${Math.abs(item.quantidade || item.pontosGastos || 0)}`,
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
      
      // Rodapé
      const finalY = doc.lastAutoTable.finalY || yPos + 50;
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Documento gerado pelo sistema de gestão', 105, finalY + 10, { align: 'center' });
      doc.text(`Emitido em: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, finalY + 15, { align: 'center' });
      
      // Registrar na auditoria
      await auditoriaService.registrar('exportar_historico_fidelidade', {
        entidade: 'fidelidade',
        entidadeId: id,
        detalhes: `Exportação do histórico de fidelidade do cliente ${cliente.nome}`,
        dados: {
          formato: 'PDF',
          totalRegistros: movimentacoesFiltradas.length
        }
      });
      
      window.open(doc.output('bloburl'), '_blank');
      setOpenPrintDialog(false);
      mostrarSnackbar('PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarSnackbar('Erro ao gerar PDF', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_historico_fidelidade_pdf',
        clienteId: id
      });
    }
  };

  const handleExportarCSV = async () => {
    try {
      // Criar dados para exportação
      const dadosExport = movimentacoesFiltradas.map(item => ({
        Data: formatDate(item.data, 'dd/MM/yyyy HH:mm'),
        Tipo: getTipoLabel(item.tipoMov),
        Quantidade: item.tipoMov === 'credito' ? `+${item.quantidade}` : `-${Math.abs(item.quantidade || item.pontosGastos || 0)}`,
        Descrição: item.motivo || item.recompensaNome || '',
        Status: item.status || 'concluído',
      }));

      // Criar CSV
      const headers = ['Data', 'Tipo', 'Quantidade', 'Descrição', 'Status'];
      const csvContent = [
        headers.join(','),
        ...dadosExport.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `historico_fidelidade_${cliente?.nome}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      // Registrar na auditoria
      await auditoriaService.registrar('exportar_historico_fidelidade', {
        entidade: 'fidelidade',
        entidadeId: id,
        detalhes: `Exportação do histórico de fidelidade do cliente ${cliente?.nome}`,
        dados: {
          formato: 'CSV',
          totalRegistros: movimentacoesFiltradas.length
        }
      });

      mostrarSnackbar('CSV exportado com sucesso!');
      setOpenPrintDialog(false);
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      mostrarSnackbar('Erro ao exportar CSV', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_historico_fidelidade_csv',
        clienteId: id
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        
        <Skeleton variant="rectangular" height={isMobile ? 200 : 150} sx={{ borderRadius: 2, mb: 3 }} />
        
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 100 : 60} sx={{ borderRadius: 2, mb: 2 }} />
        ))}
      </Box>
    );
  }

  if (!cliente) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Alert severity="error">Cliente não encontrado</Alert>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleVoltar} sx={{ bgcolor: '#f5f5f5' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                fontWeight: 700, 
                color: '#9c27b0',
              }}
            >
              Histórico
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {cliente.nome}
            </Typography>
          </Box>
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

      {/* Card do Cliente Mobile */}
      <Card sx={{ 
        mb: 3, 
        background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={temFotoValida() ? fotoUrl : undefined}
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    border: '2px solid white',
                    bgcolor: '#ffffff',
                    color: '#9c27b0',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {!temFotoValida() && getInitials(cliente.nome)}
                </Avatar>
                <Box sx={{ color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {cliente.nome}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {cliente.telefone || cliente.email || 'Sem contato'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {saldo}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Pontos
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label={nivel.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: getNivelCor(nivel),
                    color: nivel === 'ouro' ? '#000' : '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    height: 32,
                    mb: 0.5
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                  Nível Atual
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas Mobile */}
      <Grid container spacing={1} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="textSecondary" gutterBottom>
                Ganhos
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {estatisticas.totalCreditos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="textSecondary" gutterBottom>
                Utilizados
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                {estatisticas.totalDebitos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="textSecondary" gutterBottom>
                Resgates
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {estatisticas.totalResgates}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="textSecondary" gutterBottom>
                Média
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                {estatisticas.mediaMensal}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Melhor Mês */}
      {estatisticas.melhorMes.pontos > 0 && (
        <Card sx={{ mb: 3, bgcolor: '#faf5ff' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrophyIcon sx={{ fontSize: 32, color: '#ffd700' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Melhor Mês: {estatisticas.melhorMes.mes}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {estatisticas.melhorMes.pontos} pontos acumulados
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

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
          placeholder="Buscar movimentação..."
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
            color: filtroTipo !== 'todos' || filtroPeriodo !== 'todos' ? '#9c27b0' : 'text.secondary'
          }}
        >
          <Badge 
            variant="dot" 
            color="primary"
            invisible={filtroTipo === 'todos' && filtroPeriodo === 'todos'}
          >
            <FilterIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={carregarDados} sx={{ color: 'text.secondary' }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Tabs Mobile */}
      <Paper sx={{ mb: 2, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => {
            setTabValue(v);
            setFiltroTipo(v === 0 ? 'todos' : v === 1 ? 'credito' : v === 2 ? 'debito' : 'resgate');
          }}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: isMobile ? '0.7rem' : '0.875rem',
            }
          }}
        >
          <Tab 
            icon={<HistoryIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Todas" 
            iconPosition="start"
          />
          <Tab 
            icon={<TrendingUpIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Créditos" 
            iconPosition="start"
          />
          <Tab 
            icon={<TrendingDownIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Débitos" 
            iconPosition="start"
          />
          <Tab 
            icon={<GiftIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Resgates" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Lista de Movimentações */}
      <AnimatePresence>
        {paginatedMovimentacoes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhuma movimentação encontrada
              </Typography>
            </Paper>
          </motion.div>
        ) : (
          paginatedMovimentacoes.map((item, index) => (
            <MovimentacaoMobileCard
              key={`${item.id}-${index}`}
              item={item}
              onDetalhes={handleVerDetalhes}
            />
          ))
        )}
      </AnimatePresence>

      {/* Paginação */}
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
              variant={filtroTipo === 'credito' ? 'contained' : 'outlined'}
              onClick={() => setFiltroTipo('credito')}
              sx={{ 
                justifyContent: 'flex-start',
                color: filtroTipo === 'credito' ? 'white' : '#4caf50',
                borderColor: '#4caf50',
                bgcolor: filtroTipo === 'credito' ? '#4caf50' : 'transparent',
              }}
            >
              Créditos
            </Button>
            <Button
              fullWidth
              variant={filtroTipo === 'debito' ? 'contained' : 'outlined'}
              onClick={() => setFiltroTipo('debito')}
              sx={{ 
                justifyContent: 'flex-start',
                color: filtroTipo === 'debito' ? 'white' : '#f44336',
                borderColor: '#f44336',
                bgcolor: filtroTipo === 'debito' ? '#f44336' : 'transparent',
              }}
            >
              Débitos
            </Button>
            <Button
              fullWidth
              variant={filtroTipo === 'resgate' ? 'contained' : 'outlined'}
              onClick={() => setFiltroTipo('resgate')}
              sx={{ 
                justifyContent: 'flex-start',
                color: filtroTipo === 'resgate' ? 'white' : '#ff9800',
                borderColor: '#ff9800',
                bgcolor: filtroTipo === 'resgate' ? '#ff9800' : 'transparent',
              }}
            >
              Resgates
            </Button>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Período
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant={filtroPeriodo === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroPeriodo('todos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todo período
            </Button>
            <Button
              fullWidth
              variant={filtroPeriodo === 'hoje' ? 'contained' : 'outlined'}
              onClick={() => setFiltroPeriodo('hoje')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Hoje
            </Button>
            <Button
              fullWidth
              variant={filtroPeriodo === 'semana' ? 'contained' : 'outlined'}
              onClick={() => setFiltroPeriodo('semana')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Últimos 7 dias
            </Button>
            <Button
              fullWidth
              variant={filtroPeriodo === 'mes' ? 'contained' : 'outlined'}
              onClick={() => setFiltroPeriodo('mes')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Últimos 30 dias
            </Button>
            <Button
              fullWidth
              variant={filtroPeriodo === 'trimestre' ? 'contained' : 'outlined'}
              onClick={() => setFiltroPeriodo('trimestre')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Últimos 90 dias
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

      {/* Dialog de Detalhes */}
      <Dialog 
        open={openDetalheDialog} 
        onClose={() => setOpenDetalheDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        {itemSelecionado && (
          <>
            <DialogTitle sx={{ 
              bgcolor: itemSelecionado.cor || '#9c27b0', 
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
                Detalhes da Movimentação
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Data</Typography>
                  <Typography variant="body2">{formatDate(itemSelecionado.data)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Tipo</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={getTipoLabel(itemSelecionado.tipoMov)}
                      sx={{
                        bgcolor: `${itemSelecionado.cor}20`,
                        color: itemSelecionado.cor,
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Descrição</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {itemSelecionado.motivo || itemSelecionado.recompensaNome}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Quantidade</Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: itemSelecionado.tipoMov === 'credito' ? '#4caf50' : 
                             itemSelecionado.tipoMov === 'debito' ? '#f44336' : '#ff9800'
                    }}
                  >
                    {itemSelecionado.tipoMov === 'credito' ? '+' : '-'}
                    {Math.abs(itemSelecionado.quantidade || itemSelecionado.pontosGastos || 0)} pontos
                  </Typography>
                </Grid>

                {itemSelecionado.tipoMov === 'resgate' && itemSelecionado.status && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Status</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        size="small"
                        label={itemSelecionado.status}
                        color={getStatusColor(itemSelecionado.status)}
                      />
                    </Box>
                  </Grid>
                )}

                {itemSelecionado.recompensaNome && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Recompensa</Typography>
                    <Typography variant="body2">{itemSelecionado.recompensaNome}</Typography>
                  </Grid>
                )}

                {itemSelecionado.codigo && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Código</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {itemSelecionado.codigo}
                    </Typography>
                  </Grid>
                )}

                {itemSelecionado.usuarioNome && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Responsável</Typography>
                    <Typography variant="body2">{itemSelecionado.usuarioNome}</Typography>
                  </Grid>
                )}
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
            <Typography variant="h6">Exportar Histórico</Typography>
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
                  onClick={handleImprimirPDF}
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
                  <Typography variant="caption">Documento profissional</Typography>
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
                  setTabValue(0);
                  setFiltroTipo('todos');
                  break;
                case 1:
                  setTabValue(1);
                  setFiltroTipo('credito');
                  break;
                case 2:
                  setTabValue(2);
                  setFiltroTipo('debito');
                  break;
                case 3:
                  setTabValue(3);
                  setFiltroTipo('resgate');
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
            <BottomNavigationAction label="Todas" icon={<HistoryIcon />} />
            <BottomNavigationAction label="Créditos" icon={<TrendingUpIcon />} />
            <BottomNavigationAction label="Débitos" icon={<TrendingDownIcon />} />
            <BottomNavigationAction label="Resgates" icon={<GiftIcon />} />
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

export default FidelidadeHistorico;
