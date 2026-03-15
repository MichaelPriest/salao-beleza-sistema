// src/pages/HistoricoAtendimentos.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Pagination,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Share as ShareIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { 
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot 
} from '@mui/lab';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { format, isValid, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// 🔥 FUNÇÃO PARA OBTER DADOS DO CLIENTE DE FORMA SEGURA
const getClienteData = (clienteId, clientes) => {
  if (!clienteId || !clientes) return null;
  
  const cliente = clientes.find(c => 
    c.id === clienteId || 
    c.uid === clienteId || 
    c.googleUid === clienteId
  );
  
  if (!cliente) return null;
  
  return {
    id: cliente.id || cliente.uid || cliente.googleUid,
    nome: cliente.nome || cliente.displayName || 'Cliente',
    telefone: cliente.telefone || cliente.phoneNumber || 'Não informado',
    email: cliente.email || '',
    cpf: cliente.cpf || '',
    foto: cliente.foto || cliente.photoURL || cliente.avatar || null,
    dataNascimento: cliente.dataNascimento || '',
    genero: cliente.genero || '',
    cep: cliente.cep || '',
    logradouro: cliente.logradouro || '',
    numero: cliente.numero || '',
    complemento: cliente.complemento || '',
    bairro: cliente.bairro || '',
    cidade: cliente.cidade || '',
    estado: cliente.estado || '',
    status: cliente.status || 'Ativo'
  };
};

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

const formatDateTime = (date, time) => {
  if (!date) return '—';
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (!isValid(dateObj)) return '—';
    if (time) {
      return `${format(dateObj, 'dd/MM/yyyy')} ${time}`;
    }
    return format(dateObj, 'dd/MM/yyyy HH:mm');
  } catch {
    return '—';
  }
};

const statusColors = {
  realizado: { color: '#4caf50', label: 'Realizado', icon: <CheckCircleIcon /> },
  cancelado: { color: '#f44336', label: 'Cancelado', icon: <CancelIcon /> },
  remarcado: { color: '#ff9800', label: 'Remarcado', icon: <ScheduleIcon /> },
  faltou: { color: '#9e9e9e', label: 'Faltou', icon: <CancelIcon /> },
  finalizado: { color: '#4caf50', label: 'Finalizado', icon: <CheckCircleIcon /> },
  em_andamento: { color: '#ff9800', label: 'Em Andamento', icon: <ScheduleIcon /> },
};

// Função para obter iniciais do nome
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Componente de Card de Atendimento Mobile
const AtendimentoMobileCard = ({ atendimento, clienteData, profissional, servicos, onDetalhes }) => {
  const status = atendimento.status === 'finalizado' ? 'realizado' : atendimento.status;
  
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
          '&:hover': {
            boxShadow: 3,
          },
        }}
        onClick={() => onDetalhes(atendimento)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={clienteData?.foto}
              sx={{ 
                bgcolor: '#9c27b0',
                width: 48,
                height: 48,
              }}
            >
              {!clienteData?.foto && getInitials(clienteData?.nome)}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {clienteData?.nome || 'Cliente não identificado'}
                </Typography>
                <Chip
                  size="small"
                  label={statusColors[status]?.label || status}
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: `${statusColors[status]?.color}20`,
                    color: statusColors[status]?.color,
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(atendimento.data)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {atendimento.horaInicio} - {atendimento.horaFim}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Avatar 
                  src={profissional?.foto}
                  sx={{ width: 20, height: 20 }}
                >
                  {!profissional?.foto && profissional?.nome?.charAt(0)}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {profissional?.nome || 'Profissional não identificado'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                {servicos.map((servico, i) => (
                  <Chip
                    key={i}
                    label={servico}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {atendimento.observacoes ? 
                    atendimento.observacoes.substring(0, 30) + (atendimento.observacoes.length > 30 ? '...' : '') 
                    : 'Sem observações'}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  R$ {atendimento.valorTotal?.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de Item de Timeline Mobile
const TimelineItemMobile = ({ atendimento, clienteData, profissional, index, total }) => {
  const status = atendimento.status === 'finalizado' ? 'realizado' : atendimento.status;
  
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color={
          status === 'realizado' ? 'success' :
          status === 'cancelado' ? 'error' :
          status === 'remarcado' ? 'warning' : 'grey'
        }>
          {statusColors[status]?.icon}
        </TimelineDot>
        {index < total - 1 && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <Paper elevation={3} sx={{ p: 2, mb: 1 }}>
          <Typography variant="subtitle2">
            {formatDate(atendimento.data)} {atendimento.horaInicio}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Avatar 
              src={clienteData?.foto} 
              sx={{ width: 24, height: 24 }}
            >
              {!clienteData?.foto && getInitials(clienteData?.nome)}
            </Avatar>
            <Typography variant="body2">
              <strong>{clienteData?.nome}</strong>
            </Typography>
          </Box>
          <Typography variant="caption" display="block" color="text.secondary">
            {profissional?.nome}
          </Typography>
          <Chip
            size="small"
            label={statusColors[status]?.label || status}
            sx={{
              mt: 1,
              height: 20,
              fontSize: '0.65rem',
              bgcolor: `${statusColors[status]?.color}20`,
              color: statusColors[status]?.color,
            }}
          />
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
};

// Componente Principal
function HistoricoAtendimentos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const componentRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('todos');
  const [filtroProfissional, setFiltroProfissional] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [dataInicio, setDataInicio] = useState(
    format(subMonths(new Date(), 1), 'yyyy-MM-dd')
  );
  const [dataFim, setDataFim] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);
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
      console.log('🔄 Carregando histórico de atendimentos...');

      const [atendimentosData, clientesData, profissionaisData, servicosData] = await Promise.all([
        firebaseService.getAll('atendimentos').catch(err => {
          console.error('Erro ao buscar atendimentos:', err);
          return [];
        }),
        firebaseService.getAll('clientes').catch(err => {
          console.error('Erro ao buscar clientes:', err);
          return [];
        }),
        firebaseService.getAll('profissionais').catch(err => {
          console.error('Erro ao buscar profissionais:', err);
          return [];
        }),
        firebaseService.getAll('servicos').catch(err => {
          console.error('Erro ao buscar servicos:', err);
          return [];
        }),
      ]);
      
      const atendimentosFinalizados = (atendimentosData || []).filter(a => 
        a.status === 'finalizado' || a.status === 'cancelado' || a.status === 'realizado'
      );
      
      console.log('📊 Atendimentos carregados:', atendimentosFinalizados.length);
      
      setAtendimentos(atendimentosFinalizados);
      setClientes(clientesData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);

      // Registrar acesso na auditoria
      await auditoriaService.registrar('acesso_historico_atendimentos', {
        entidade: 'atendimentos',
        detalhes: 'Acesso ao histórico de atendimentos',
        dados: {
          totalAtendimentos: atendimentosFinalizados.length,
          totalClientes: clientesData?.length || 0,
          totalProfissionais: profissionaisData?.length || 0
        }
      });

      if (atendimentosFinalizados.length === 0) {
        mostrarSnackbar('Nenhum atendimento finalizado encontrado', 'info');
      } else {
        mostrarSnackbar(`${atendimentosFinalizados.length} atendimentos carregados!`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_historico_atendimentos',
        detalhes: 'Erro ao carregar histórico de atendimentos'
      });
    } finally {
      setLoading(false);
    }
  };

  const getClienteNome = useCallback((clienteId) => {
    if (!clienteId) return 'Cliente não identificado';
    const clienteData = getClienteData(clienteId, clientes);
    return clienteData?.nome || 'Cliente não encontrado';
  }, [clientes]);

  const getClienteFoto = useCallback((clienteId) => {
    if (!clienteId) return null;
    const clienteData = getClienteData(clienteId, clientes);
    return clienteData?.foto || null;
  }, [clientes]);

  const getClienteTelefone = useCallback((clienteId) => {
    if (!clienteId) return null;
    const clienteData = getClienteData(clienteId, clientes);
    return clienteData?.telefone || null;
  }, [clientes]);

  const getProfissionalNome = useCallback((profissionalId) => {
    if (!profissionalId) return 'Profissional não identificado';
    const profissional = profissionais.find(p => p.id === profissionalId);
    return profissional?.nome || 'Profissional não encontrado';
  }, [profissionais]);

  const getProfissionalFoto = useCallback((profissionalId) => {
    if (!profissionalId) return null;
    const profissional = profissionais.find(p => p.id === profissionalId);
    return profissional?.foto || null;
  }, [profissionais]);

  const getServicosNomes = useCallback((atendimento) => {
    if (atendimento.itensServico && atendimento.itensServico.length > 0) {
      return atendimento.itensServico.map(item => item.nome);
    } else if (atendimento.servicoId) {
      const servico = servicos.find(s => s.id === atendimento.servicoId);
      return [servico?.nome || 'Serviço não encontrado'];
    }
    return [];
  }, [servicos]);

  const getValorTotal = useCallback((atendimento) => {
    if (atendimento.valorTotal) return atendimento.valorTotal;
    
    if (atendimento.itensServico && atendimento.itensServico.length > 0) {
      return atendimento.itensServico.reduce((acc, item) => acc + (item.preco || 0), 0);
    } else if (atendimento.servicoId) {
      const servico = servicos.find(s => s.id === atendimento.servicoId);
      return servico?.preco || 0;
    }
    return 0;
  }, [servicos]);

  // 🔥 FUNÇÃO DE IMPRESSÃO
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `historico_atendimentos_${format(new Date(), 'yyyy-MM-dd')}`,
    onBeforeGetContent: () => {
      mostrarSnackbar('Preparando impressão...', 'info');
    },
    onAfterPrint: () => {
      mostrarSnackbar('Impressão enviada!');
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      mostrarSnackbar('Erro ao imprimir', 'error');
      
      auditoriaService.registrarErro(error, { 
        acao: 'imprimir_historico_atendimentos'
      });
    }
  });

  const handlePrintPDF = async () => {
    try {
      const doc = new jsPDF();
      
      doc.setFillColor(156, 39, 176);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE ATENDIMENTOS', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Período: ${getPeriodoTexto()}`, 105, 30, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      let yPos = 50;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, 170, 40, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total:', 25, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.total), 50, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Realizados:', 80, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.realizados), 115, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Cancelados:', 135, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.cancelados), 170, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Faturamento:', 25, yPos + 25);
      doc.setFont('helvetica', 'normal');
      doc.text(`R$ ${stats.valorTotal.toFixed(2)}`, 60, yPos + 25);
      
      yPos += 60;

      const tableColumn = ['Data', 'Cliente', 'Profissional', 'Serviços', 'Valor', 'Status'];
      const tableRows = [];
      
      atendimentosFiltrados.slice(0, 50).forEach(a => {
        const row = [
          formatDate(a.data),
          getClienteNome(a.clienteId),
          getProfissionalNome(a.profissionalId),
          getServicosNomes(a).join(', ').substring(0, 30),
          `R$ ${getValorTotal(a).toFixed(2)}`,
          a.status === 'finalizado' ? 'Realizado' : a.status,
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
      
      await auditoriaService.registrar('exportar_relatorio_atendimentos', {
        entidade: 'atendimentos',
        detalhes: 'Exportação de relatório de atendimentos',
        dados: {
          formato: 'PDF',
          totalAtendimentos: atendimentosFiltrados.length,
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
        acao: 'exportar_relatorio_atendimentos_pdf'
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const headers = ['Data', 'Cliente', 'Profissional', 'Serviços', 'Valor', 'Status', 'Observações'];
      const data = atendimentosFiltrados.map(a => [
        formatDate(a.data),
        getClienteNome(a.clienteId),
        getProfissionalNome(a.profissionalId),
        getServicosNomes(a).join(', '),
        getValorTotal(a).toFixed(2),
        a.status === 'finalizado' ? 'Realizado' : a.status,
        a.observacoes || '',
      ]);

      const csvContent = [headers, ...data]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `historico_atendimentos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      await auditoriaService.registrar('exportar_relatorio_atendimentos', {
        entidade: 'atendimentos',
        detalhes: 'Exportação de relatório de atendimentos',
        dados: {
          formato: 'CSV',
          totalAtendimentos: atendimentosFiltrados.length
        }
      });
      
      mostrarSnackbar('Relatório exportado com sucesso!');
      setOpenPrintDialog(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar relatório', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_relatorio_atendimentos_csv'
      });
    }
  };

  const handleOpenDetalhes = (atendimento) => {
    setAtendimentoSelecionado(atendimento);
    setOpenDetalhesDialog(true);

    // Registrar visualização de detalhes
    auditoriaService.registrar('visualizar_detalhes_atendimento', {
      entidade: 'atendimentos',
      entidadeId: atendimento.id,
      detalhes: `Visualização de detalhes do atendimento`,
    });
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setAtendimentoSelecionado(null);
  };

  // Filtrar atendimentos
  const atendimentosFiltrados = useMemo(() => {
    return atendimentos.filter(atendimento => {
      const clienteNome = getClienteNome(atendimento.clienteId);
      const profissionalNome = getProfissionalNome(atendimento.profissionalId);
      const servicosNomes = getServicosNomes(atendimento);
      
      const matchesTexto = filtro === '' || 
        clienteNome.toLowerCase().includes(filtro.toLowerCase()) ||
        profissionalNome.toLowerCase().includes(filtro.toLowerCase()) ||
        servicosNomes.some(s => s?.toLowerCase().includes(filtro.toLowerCase()));

      const matchesCliente = filtroCliente === 'todos' || atendimento.clienteId === filtroCliente;
      const matchesProfissional = filtroProfissional === 'todos' || atendimento.profissionalId === filtroProfissional;
      const matchesStatus = filtroStatus === 'todos' || atendimento.status === filtroStatus;

      let matchesPeriodo = true;
      if (filtroPeriodo === 'hoje') {
        const hoje = format(new Date(), 'yyyy-MM-dd');
        matchesPeriodo = atendimento.data === hoje;
      } else if (filtroPeriodo === 'semana') {
        const dataAtend = new Date(atendimento.data);
        const umaSemanaAtras = subDays(new Date(), 7);
        matchesPeriodo = dataAtend >= umaSemanaAtras;
      } else if (filtroPeriodo === 'mes') {
        const dataAtend = new Date(atendimento.data);
        const umMesAtras = subMonths(new Date(), 1);
        matchesPeriodo = dataAtend >= umMesAtras;
      } else if (filtroPeriodo === 'personalizado') {
        const dataAtend = new Date(atendimento.data);
        matchesPeriodo = dataAtend >= new Date(dataInicio) && dataAtend <= new Date(dataFim);
      }

      return matchesTexto && matchesCliente && matchesProfissional && matchesPeriodo && matchesStatus;
    });
  }, [atendimentos, filtro, filtroCliente, filtroProfissional, filtroPeriodo, filtroStatus, dataInicio, dataFim, getClienteNome, getProfissionalNome, getServicosNomes]);

  // Paginação
  const paginatedAtendimentos = atendimentosFiltrados.slice(
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
  const stats = useMemo(() => ({
    total: atendimentosFiltrados.length,
    realizados: atendimentosFiltrados.filter(a => a.status === 'finalizado' || a.status === 'realizado').length,
    cancelados: atendimentosFiltrados.filter(a => a.status === 'cancelado').length,
    remarcados: atendimentosFiltrados.filter(a => a.status === 'remarcado').length,
    faltas: atendimentosFiltrados.filter(a => a.status === 'faltou').length,
    valorTotal: atendimentosFiltrados
      .filter(a => a.status === 'finalizado' || a.status === 'realizado')
      .reduce((acc, a) => acc + (getValorTotal(a) || 0), 0),
  }), [atendimentosFiltrados, getValorTotal]);

  const getPeriodoTexto = () => {
    if (filtroPeriodo === 'hoje') return 'Hoje';
    if (filtroPeriodo === 'semana') return 'Últimos 7 dias';
    if (filtroPeriodo === 'mes') return 'Últimos 30 dias';
    if (filtroPeriodo === 'personalizado') return `${formatDate(dataInicio)} a ${formatDate(dataFim)}`;
    return 'Todos os períodos';
  };

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={6} sm={2.4} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 180 : 60} sx={{ borderRadius: 2, mb: 2 }} />
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
            Histórico
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {stats.total} atendimentos no período
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
        <Grid item xs={6} sm={6} md={2.4}>
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

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Realizados
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.realizados}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Cancelados
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {stats.cancelados}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Faturamento
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  R$ {stats.valorTotal.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Média
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  R$ {(stats.valorTotal / (stats.realizados || 1)).toFixed(2)}
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
          placeholder="Buscar por cliente, profissional ou serviço..."
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
            color: filtroCliente !== 'todos' || filtroProfissional !== 'todos' || filtroPeriodo !== 'todos' || filtroStatus !== 'todos' ? '#9c27b0' : 'text.secondary'
          }}
        >
          <Badge 
            variant="dot" 
            color="primary"
            invisible={filtroCliente === 'todos' && filtroProfissional === 'todos' && filtroPeriodo === 'todos' && filtroStatus === 'todos'}
          >
            <FilterIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={carregarDados} sx={{ color: 'text.secondary' }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Timeline Mobile */}
      {paginatedAtendimentos.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon sx={{ fontSize: 18 }} /> Linha do Tempo
            </Typography>
            <Timeline position="right" sx={{ p: 0 }}>
              {paginatedAtendimentos.slice(0, 3).map((atendimento, index) => {
                const clienteData = getClienteData(atendimento.clienteId, clientes);
                const profissional = profissionais.find(p => p.id === atendimento.profissionalId);
                
                return (
                  <TimelineItemMobile
                    key={atendimento.id}
                    atendimento={atendimento}
                    clienteData={clienteData}
                    profissional={profissional}
                    index={index}
                    total={Math.min(paginatedAtendimentos.length, 3)}
                  />
                );
              })}
            </Timeline>
          </CardContent>
        </Card>
      )}

      {/* Lista de Atendimentos Mobile */}
      <AnimatePresence>
        {paginatedAtendimentos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhum atendimento encontrado
              </Typography>
            </Paper>
          </motion.div>
        ) : (
          paginatedAtendimentos.map((atendimento) => {
            const clienteData = getClienteData(atendimento.clienteId, clientes);
            const profissional = profissionais.find(p => p.id === atendimento.profissionalId);
            const servicosNomes = getServicosNomes(atendimento);
            
            return (
              <AtendimentoMobileCard
                key={atendimento.id}
                atendimento={atendimento}
                clienteData={clienteData}
                profissional={profissional}
                servicos={servicosNomes}
                onDetalhes={handleOpenDetalhes}
              />
            );
          })
        )}
      </AnimatePresence>

      {/* Paginação */}
      {atendimentosFiltrados.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(atendimentosFiltrados.length / rowsPerPage)}
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
            Cliente
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, maxHeight: 150, overflow: 'auto' }}>
            <Button
              fullWidth
              variant={filtroCliente === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroCliente('todos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todos os clientes
            </Button>
            {clientes.map(c => {
              const clienteData = getClienteData(c.id, clientes);
              return (
                <Button
                  key={c.id}
                  fullWidth
                  variant={filtroCliente === c.id ? 'contained' : 'outlined'}
                  onClick={() => setFiltroCliente(c.id)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      src={clienteData?.foto} 
                      sx={{ width: 24, height: 24 }}
                    >
                      {!clienteData?.foto && getInitials(clienteData?.nome)}
                    </Avatar>
                    {clienteData?.nome}
                  </Box>
                </Button>
              );
            })}
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Profissional
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, maxHeight: 150, overflow: 'auto' }}>
            <Button
              fullWidth
              variant={filtroProfissional === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroProfissional('todos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todos os profissionais
            </Button>
            {profissionais.map(p => (
              <Button
                key={p.id}
                fullWidth
                variant={filtroProfissional === p.id ? 'contained' : 'outlined'}
                onClick={() => setFiltroProfissional(p.id)}
                sx={{ justifyContent: 'flex-start' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    src={p.foto} 
                    sx={{ width: 24, height: 24 }}
                  >
                    {!p.foto && getInitials(p.nome)}
                  </Avatar>
                  {p.nome}
                </Box>
              </Button>
            ))}
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
            {Object.keys(statusColors).map(key => (
              <Button
                key={key}
                fullWidth
                variant={filtroStatus === key ? 'contained' : 'outlined'}
                onClick={() => setFiltroStatus(key)}
                sx={{ 
                  justifyContent: 'flex-start',
                  color: filtroStatus === key ? 'white' : statusColors[key].color,
                  borderColor: statusColors[key].color,
                  bgcolor: filtroStatus === key ? statusColors[key].color : 'transparent',
                }}
              >
                {statusColors[key].icon} {statusColors[key].label}
              </Button>
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Período
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
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
              variant={filtroPeriodo === 'personalizado' ? 'contained' : 'outlined'}
              onClick={() => setFiltroPeriodo('personalizado')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Personalizado
            </Button>
          </Box>

          {filtroPeriodo === 'personalizado' && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
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
                <Grid item xs={6}>
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
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={() => setOpenFilterDrawer(false)}
            sx={{ bgcolor: '#9c27b0', mt: 2 }}
          >
            Aplicar Filtros
          </Button>
        </Box>
      </SwipeableDrawer>

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
            Detalhes do Atendimento
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          {atendimentoSelecionado && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar 
                        src={getClienteFoto(atendimentoSelecionado.clienteId)} 
                        sx={{ width: 56, height: 56, bgcolor: '#9c27b0' }}
                      >
                        {!getClienteFoto(atendimentoSelecionado.clienteId) && 
                          getInitials(getClienteNome(atendimentoSelecionado.clienteId))}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{getClienteNome(atendimentoSelecionado.clienteId)}</Typography>
                        {getClienteTelefone(atendimentoSelecionado.clienteId) && (
                          <Typography variant="body2" color="textSecondary">
                            {getClienteTelefone(atendimentoSelecionado.clienteId)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Data</Typography>
                        <Typography variant="body2">
                          {formatDate(atendimentoSelecionado.data)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Horário</Typography>
                        <Typography variant="body2">
                          {atendimentoSelecionado.horaInicio} - {atendimentoSelecionado.horaFim}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Profissional</Typography>
                        <Typography variant="body2">{getProfissionalNome(atendimentoSelecionado.profissionalId)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={statusColors[atendimentoSelecionado.status]?.label || atendimentoSelecionado.status}
                            sx={{
                              bgcolor: `${statusColors[atendimentoSelecionado.status]?.color}20`,
                              color: statusColors[atendimentoSelecionado.status]?.color,
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>
                      Serviços Realizados
                    </Typography>
                    
                    {atendimentoSelecionado.itensServico?.map((servico, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{servico.nome}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          R$ {servico.preco?.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">Total</Typography>
                      <Typography variant="h6" sx={{ color: '#4caf50' }}>
                        R$ {getValorTotal(atendimentoSelecionado).toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {atendimentoSelecionado.observacoes && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>
                        Observações
                      </Typography>
                      <Typography variant="body2">
                        {atendimentoSelecionado.observacoes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
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
                  onClick={handleExportCSV}
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
                  Período: {getPeriodoTexto()}
                </Typography>
                <Typography variant="body2">
                  Total de atendimentos: {stats.total}
                </Typography>
                <Typography variant="body2">
                  Realizados: {stats.realizados}
                </Typography>
                <Typography variant="body2">
                  Faturamento: R$ {stats.valorTotal.toFixed(2)}
                </Typography>
              </Alert>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <ImprimirHistorico
          ref={componentRef}
          atendimentos={atendimentosFiltrados}
          clienteNome="Todos os Clientes"
          periodo={getPeriodoTexto()}
        />
      </Box>

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
            <BottomNavigationAction label="Início" icon={<HistoryIcon />} />
            <BottomNavigationAction 
              label="Filtros" 
              icon={
                <Badge 
                  variant="dot" 
                  color="primary"
                  invisible={filtroCliente === 'todos' && filtroProfissional === 'todos' && filtroPeriodo === 'todos' && filtroStatus === 'todos'}
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

export default HistoricoAtendimentos;
