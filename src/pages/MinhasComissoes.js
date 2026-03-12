// src/pages/MinhasComissoes.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Event as EventIcon,
  Person as PersonIcon,
  ReceiptLong as ReceiptLongIcon,
  Percent as PercentIcon,
  FilterList as FilterIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { useFeedback } from '../contexts/FeedbackContext';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';

// Componente para impressão
const RelatorioComissoes = React.forwardRef(({ dados, profissional, periodo, filtros }, ref) => {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <Box ref={ref} sx={{ p: 4, fontFamily: 'Arial' }}>
      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
          Relatório de Comissões
        </Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>
          {profissional?.nome}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Período: {periodo}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Emitido em: {new Date().toLocaleString('pt-BR')}
        </Typography>
      </Box>

      {/* Resumo */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Resumo do Período
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" color="textSecondary">Total de Comissões</Typography>
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {formatarMoeda(dados.resumo.totalPeriodo)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" color="textSecondary">A Receber</Typography>
              <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {formatarMoeda(dados.resumo.aReceber)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" color="textSecondary">Recebido</Typography>
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {formatarMoeda(dados.resumo.recebido)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Atendimentos */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Atendimentos no Período
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Cliente</strong></TableCell>
                <TableCell><strong>Serviços</strong></TableCell>
                <TableCell align="right"><strong>Valor</strong></TableCell>
                <TableCell align="right"><strong>Comissão</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dados.atendimentos.map((atendimento, index) => (
                <TableRow key={index}>
                  <TableCell>{formatarData(atendimento.data)}</TableCell>
                  <TableCell>{atendimento.cliente?.nome || '—'}</TableCell>
                  <TableCell>
                    {atendimento.servicos?.map(s => s.nome).join(', ')}
                  </TableCell>
                  <TableCell align="right">R$ {atendimento.valorTotal?.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <strong>R$ {atendimento.comissaoTotal?.toFixed(2)}</strong>
                  </TableCell>
                  <TableCell>
                    {atendimento.comissaoPaga ? 'Pago' : 'Pendente'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Comissões Detalhadas */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Detalhamento das Comissões
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Serviço</strong></TableCell>
                <TableCell align="right"><strong>%</strong></TableCell>
                <TableCell align="right"><strong>Valor Base</strong></TableCell>
                <TableCell align="right"><strong>Comissão</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Pagamento</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dados.comissoes.map((comissao, index) => (
                <TableRow key={index}>
                  <TableCell>{formatarData(comissao.data)}</TableCell>
                  <TableCell>{comissao.servicoNome}</TableCell>
                  <TableCell align="right">{comissao.percentual}%</TableCell>
                  <TableCell align="right">R$ {comissao.valorAtendimento?.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <strong>R$ {comissao.valor?.toFixed(2)}</strong>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={comissao.status}
                      size="small"
                      color={comissao.status === 'pago' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    {comissao.dataPagamento ? formatarData(comissao.dataPagamento) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Rodapé */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption">
          Relatório gerado automaticamente pelo sistema • Documento não fiscal
        </Typography>
      </Box>
    </Box>
  );
});

function MinhasComissoes() {
  const { showSnackbar, showLoading, hideLoading } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [comissoes, setComissoes] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [profissional, setProfissional] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Filtros
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroBusca, setFiltroBusca] = useState('');
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);
  const [openRelatorioDialog, setOpenRelatorioDialog] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState('completo');

  // Refs para impressão
  const relatorioRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => relatorioRef.current,
    onBeforePrint: () => toast.info('Preparando impressão...'),
    onAfterPrint: () => toast.success('Impressão concluída!'),
  });

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = [2024, 2025, 2026, 2027];

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (profissional) {
      carregarComissoes();
      carregarAtendimentos();
    }
  }, [profissional, filtroMes, filtroAno, filtroStatus]);

  // Recalcular resumo quando comissões mudarem
  useEffect(() => {
    if (comissoes.length > 0) {
      calcularResumo();
      calcularEstatisticas();
    }
  }, [comissoes]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar profissional atual do localStorage
      let profissionalId = null;
      let profissionalNome = '';
      
      try {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
          const usuario = JSON.parse(usuarioStr);
          profissionalId = usuario?.profissionalId;
          profissionalNome = usuario?.nome;
        }
      } catch (e) {
        console.warn('Erro ao parsear usuário:', e);
      }

      // Se não encontrar no localStorage, buscar do serviço de usuários
      if (!profissionalId) {
        // Aqui você pode implementar a lógica para buscar o profissional atual
        // Por enquanto, vamos usar um ID de exemplo
        profissionalId = 'k3yNJZdaVnrz0hrmSegt'; // ID da Rosangela Santana
        profissionalNome = 'Rosangela Santana';
      }

      setProfissional({
        id: profissionalId,
        nome: profissionalNome
      });

      // Carregar dados
      await Promise.all([
        carregarComissoes(profissionalId),
        carregarAtendimentos(profissionalId),
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showSnackbar('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarComissoes = async (profissionalId) => {
    try {
      const comissoesData = await firebaseService.getAll('comissoes');
      
      // Filtrar comissões do profissional
      let comissoesFiltradas = comissoesData.filter(c => 
        c.profissionalId === profissionalId
      );

      // Filtrar por mês/ano
      if (filtroMes && filtroAno) {
        comissoesFiltradas = comissoesFiltradas.filter(c => {
          const data = new Date(c.dataRegistro || c.createdAt || c.data);
          return data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno;
        });
      }

      // Filtrar por status
      if (filtroStatus !== 'todos') {
        comissoesFiltradas = comissoesFiltradas.filter(c => c.status === filtroStatus);
      }

      // Ordenar por data (mais recentes primeiro)
      comissoesFiltradas.sort((a, b) => {
        const dataA = new Date(a.dataRegistro || a.createdAt || a.data || 0);
        const dataB = new Date(b.dataRegistro || b.createdAt || b.data || 0);
        return dataB - dataA;
      });

      // Formatar datas para exibição
      comissoesFiltradas = comissoesFiltradas.map(c => ({
        ...c,
        dataFormatada: formatarData(c.dataRegistro || c.createdAt || c.data),
        valor: Number(c.valor) || 0,
        valorAtendimento: Number(c.valorAtendimento) || 0,
        percentual: Number(c.percentual) || 0
      }));

      setComissoes(comissoesFiltradas);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
      setComissoes([]);
    }
  };

  const carregarAtendimentos = async (profissionalId) => {
    try {
      const atendimentosData = await firebaseService.getAll('atendimentos');
      
      // Filtrar atendimentos do profissional e finalizados
      let atendimentosFiltrados = atendimentosData.filter(a => {
        // Verificar se o profissional participou do atendimento
        const temProfissional = a.itensServico?.some(
          item => item.profissionalId === profissionalId
        ) || a.servicos?.some(
          s => s.profissionalId === profissionalId
        );
        
        return temProfissional && a.status === 'finalizado';
      });

      // Filtrar por mês/ano
      if (filtroMes && filtroAno) {
        atendimentosFiltrados = atendimentosFiltrados.filter(a => {
          const data = new Date(a.data);
          return data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno;
        });
      }

      // Buscar dados dos clientes
      const clientes = await firebaseService.getAll('clientes');
      
      // Enriquecer atendimentos com dados do cliente
      atendimentosFiltrados = atendimentosFiltrados.map(atendimento => {
        const cliente = clientes.find(c => c.id === atendimento.clienteId);
        return {
          ...atendimento,
          cliente: cliente || { nome: 'Cliente não encontrado' },
          valorTotal: Number(atendimento.valorTotal) || 0,
          // Calcular comissão total do atendimento para este profissional
          comissaoTotal: calcularComissaoProfissional(atendimento, profissionalId)
        };
      });

      // Ordenar por data (mais recentes primeiro)
      atendimentosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));

      setAtendimentos(atendimentosFiltrados);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
      setAtendimentos([]);
    }
  };

  const calcularComissaoProfissional = (atendimento, profissionalId) => {
    let total = 0;
    
    // Verificar itensServico
    if (atendimento.itensServico) {
      atendimento.itensServico.forEach(item => {
        if (item.profissionalId === profissionalId) {
          // Encontrar a comissão correspondente
          const comissao = comissoes.find(c => 
            c.atendimentoId === atendimento.id && 
            c.servicoId === item.servicoId
          );
          if (comissao) {
            total += Number(comissao.valor) || 0;
          } else {
            // Calcular comissão estimada
            total += (Number(item.preco) * (Number(item.comissao) || 0)) / 100;
          }
        }
      });
    }
    
    // Verificar servicos (formato antigo)
    if (atendimento.servicos) {
      atendimento.servicos.forEach(servico => {
        if (servico.profissionalId === profissionalId) {
          const comissao = comissoes.find(c => 
            c.atendimentoId === atendimento.id && 
            c.servicoId === servico.id
          );
          if (comissao) {
            total += Number(comissao.valor) || 0;
          } else {
            total += (Number(servico.preco) * (Number(servico.comissao) || 0)) / 100;
          }
        }
      });
    }
    
    return total;
  };

  const calcularResumo = () => {
    // Calcular totais do período
    const totalPeriodo = comissoes
      .filter(c => c.status !== 'cancelado')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
    
    const aReceber = comissoes
      .filter(c => c.status === 'pendente')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
    
    const recebido = comissoes
      .filter(c => c.status === 'pago')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
    
    const cancelado = comissoes
      .filter(c => c.status === 'cancelado')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

    // Agrupar por serviço
    const porServico = {};
    comissoes.forEach(c => {
      if (c.status !== 'cancelado') {
        const nome = c.servicoNome || 'Outros';
        if (!porServico[nome]) {
          porServico[nome] = {
            nome,
            quantidade: 0,
            valor: 0
          };
        }
        porServico[nome].quantidade++;
        porServico[nome].valor += Number(c.valor) || 0;
      }
    });

    const porServicoArray = Object.values(porServico)
      .sort((a, b) => b.valor - a.valor);

    setResumo({
      totalPeriodo,
      aReceber,
      recebido,
      cancelado,
      porServico: porServicoArray,
      quantidade: comissoes.length,
      quantidadePendente: comissoes.filter(c => c.status === 'pendente').length,
      quantidadePaga: comissoes.filter(c => c.status === 'pago').length,
      quantidadeCancelada: comissoes.filter(c => c.status === 'cancelado').length,
    });
  };

  const calcularEstatisticas = () => {
    // Calcular média por atendimento
    const comissoesPagas = comissoes.filter(c => c.status === 'pago');
    const mediaPorAtendimento = comissoesPagas.length > 0
      ? comissoesPagas.reduce((acc, c) => acc + (Number(c.valor) || 0), 0) / comissoesPagas.length
      : 0;

    // Agrupar por mês
    const porMes = [];
    const mesesDados = {};

    comissoes.forEach(c => {
      const data = new Date(c.dataRegistro || c.createdAt || c.data || 0);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      const chave = `${ano}-${mes}`;
      
      if (!mesesDados[chave]) {
        mesesDados[chave] = {
          mes,
          ano,
          quantidade: 0,
          total: 0
        };
      }
      
      if (c.status !== 'cancelado') {
        mesesDados[chave].quantidade++;
        mesesDados[chave].total += Number(c.valor) || 0;
      }
    });

    Object.keys(mesesDados).sort().forEach(chave => {
      porMes.push(mesesDados[chave]);
    });

    setEstatisticas({
      mediaPorAtendimento,
      porMes: porMes.slice(-6) // Últimos 6 meses
    });
  };

  const getStatusChip = (status) => {
    const config = {
      pendente: { color: 'warning', icon: <PendingIcon />, label: 'Pendente' },
      pago: { color: 'success', icon: <CheckCircleIcon />, label: 'Pago' },
      cancelado: { color: 'error', icon: <CancelIcon />, label: 'Cancelado' }
    };
    
    const { color, icon, label } = config[status] || config.pendente;
    
    return (
      <Chip
        icon={icon}
        label={label}
        size="small"
        color={color}
        variant="outlined"
      />
    );
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDetalhes = (atendimento) => {
    setAtendimentoSelecionado(atendimento);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setAtendimentoSelecionado(null);
  };

  const handleOpenRelatorio = () => {
    setOpenRelatorioDialog(true);
  };

  const handleCloseRelatorio = () => {
    setOpenRelatorioDialog(false);
  };

  const handleExportPDF = () => {
    toast.success('PDF gerado com sucesso!');
    // Implementar geração de PDF
  };

  const handleExportExcel = () => {
    toast.success('Planilha exportada com sucesso!');
    // Implementar exportação Excel
  };

  // Filtrar comissões por busca
  const comissoesFiltradas = comissoes.filter(c => {
    if (!filtroBusca) return true;
    
    const termo = filtroBusca.toLowerCase();
    return (
      c.servicoNome?.toLowerCase().includes(termo) ||
      c.profissionalNome?.toLowerCase().includes(termo) ||
      c.atendimentoId?.toLowerCase().includes(termo)
    );
  });

  // Filtrar atendimentos por busca
  const atendimentosFiltrados = atendimentos.filter(a => {
    if (!filtroBusca) return true;
    
    const termo = filtroBusca.toLowerCase();
    return (
      a.cliente?.nome?.toLowerCase().includes(termo) ||
      a.id?.toLowerCase().includes(termo) ||
      a.servicos?.some(s => s.nome?.toLowerCase().includes(termo))
    );
  });

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!profissional) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Você não está vinculado a um perfil de profissional.
          Entre em contato com o administrador.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Minhas Comissões
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Olá, {profissional.nome}! Acompanhe suas comissões e rendimentos
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Imprimir Relatório
          </Button>
          
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleOpenRelatorio}
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Cards de Resumo */}
      {resumo && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                      <MoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        Total do Período
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {formatarMoeda(resumo.totalPeriodo)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {resumo.quantidade} comissões
                      </Typography>
                    </Box>
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
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                      <PendingIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        A Receber
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                        {formatarMoeda(resumo.aReceber)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {resumo.quantidadePendente} pendentes
                      </Typography>
                    </Box>
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
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        Recebido
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {formatarMoeda(resumo.recebido)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {resumo.quantidadePaga} pagas
                      </Typography>
                    </Box>
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
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56 }}>
                      <TimelineIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        Média por Atend.
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196f3' }}>
                        {formatarMoeda(estatisticas?.mediaPorAtendimento || 0)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {atendimentos.length} atendimentos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: filtroBusca && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setFiltroBusca('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Mês</InputLabel>
                <Select
                  value={filtroMes}
                  label="Mês"
                  onChange={(e) => setFiltroMes(e.target.value)}
                >
                  {meses.map(mes => (
                    <MenuItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Ano</InputLabel>
                <Select
                  value={filtroAno}
                  label="Ano"
                  onChange={(e) => setFiltroAno(e.target.value)}
                >
                  {anos.map(ano => (
                    <MenuItem key={ano} value={ano}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroStatus}
                  label="Status"
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="pago">Pago</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setFiltroBusca('');
                    setFiltroMes(new Date().getMonth() + 1);
                    setFiltroAno(new Date().getFullYear());
                    setFiltroStatus('todos');
                    carregarDados();
                  }}
                >
                  Limpar
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleExportPDF}
                  color="error"
                >
                  PDF
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportExcel}
                  color="success"
                >
                  Excel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Comissões" icon={<PercentIcon />} iconPosition="start" />
          <Tab 
            label={
              <Badge badgeContent={atendimentos.length} color="primary">
                Atendimentos
              </Badge>
            } 
            icon={<EventIcon />} 
            iconPosition="start" 
          />
          <Tab label="Resumo por Serviço" icon={<PieChartIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab de Comissões */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Detalhamento das Comissões
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Serviço</strong></TableCell>
                    <TableCell align="right"><strong>%</strong></TableCell>
                    <TableCell align="right"><strong>Valor Base</strong></TableCell>
                    <TableCell align="right"><strong>Comissão</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Pagamento</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comissoesFiltradas.map((comissao) => (
                    <TableRow key={comissao.id} hover>
                      <TableCell>
                        {formatarData(comissao.dataRegistro || comissao.createdAt || comissao.data)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ReceiptLongIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
                          {comissao.servicoNome}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${comissao.percentual}%`}
                          size="small"
                          variant="outlined"
                          sx={{ bgcolor: '#f3e5f5' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatarMoeda(comissao.valorAtendimento)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="#4caf50">
                          {formatarMoeda(comissao.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(comissao.status)}
                      </TableCell>
                      <TableCell>
                        {comissao.dataPagamento ? (
                          <Tooltip title={`Pago em ${formatarData(comissao.dataPagamento)}`}>
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Pago"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          <Chip
                            icon={<PendingIcon />}
                            label="Aguardando"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {comissoesFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography color="textSecondary">
                          Nenhuma comissão encontrada para o período
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab de Atendimentos */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Atendimentos Realizados
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Hora</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Serviços</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell align="right"><strong>Comissão</strong></TableCell>
                    <TableCell><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {atendimentosFiltrados.map((atendimento) => (
                    <TableRow key={atendimento.id} hover>
                      <TableCell>{formatarData(atendimento.data)}</TableCell>
                      <TableCell>
                        {atendimento.horaInicio || '--:--'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ color: '#757575', fontSize: 20 }} />
                          {atendimento.cliente?.nome || '—'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {atendimento.servicos?.map(s => s.nome).join(', ') || 
                         atendimento.itensServico?.map(i => i.nome).join(', ')}
                      </TableCell>
                      <TableCell align="right">
                        {formatarMoeda(atendimento.valorTotal)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="#4caf50">
                          {formatarMoeda(atendimento.comissaoTotal)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDetalhes(atendimento)}
                            sx={{ color: '#9c27b0' }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {atendimentosFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography color="textSecondary">
                          Nenhum atendimento encontrado para o período
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab de Resumo por Serviço */}
      {tabValue === 2 && resumo?.porServico && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Comissões por Serviço
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Serviço</strong></TableCell>
                    <TableCell align="right"><strong>Quantidade</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>% do Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resumo.porServico.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell align="right">{item.quantidade}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="#4caf50">
                          {formatarMoeda(item.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${((item.valor / resumo.totalPeriodo) * 100).toFixed(1)}%`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Histórico Mensal */}
      {estatisticas && estatisticas.porMes.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Histórico dos Últimos Meses
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Período</TableCell>
                    <TableCell align="right">Atendimentos</TableCell>
                    <TableCell align="right">Comissões</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estatisticas.porMes.map((mes, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {meses.find(m => m.value === mes.mes)?.label} / {mes.ano}
                      </TableCell>
                      <TableCell align="right">{mes.quantidade}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="#4caf50">
                          {formatarMoeda(mes.total)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Detalhes do Atendimento */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes do Atendimento
        </DialogTitle>
        <DialogContent>
          {atendimentoSelecionado && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Data e Hora
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatarData(atendimentoSelecionado.data)} às {atendimentoSelecionado.horaInicio}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Cliente
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {atendimentoSelecionado.cliente?.nome || '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Serviços Realizados
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Serviço</TableCell>
                          <TableCell align="right">Valor</TableCell>
                          <TableCell align="right">Comissão %</TableCell>
                          <TableCell align="right">Sua Comissão</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(atendimentoSelecionado.servicos || atendimentoSelecionado.itensServico || []).map((servico, idx) => {
                          const comissaoServico = comissoes.find(c => 
                            c.atendimentoId === atendimentoSelecionado.id && 
                            c.servicoId === (servico.servicoId || servico.id)
                          );
                          
                          return (
                            <TableRow key={idx}>
                              <TableCell>{servico.nome}</TableCell>
                              <TableCell align="right">
                                R$ {(servico.preco || servico.valor || 0).toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                {servico.comissao || comissaoServico?.percentual || 0}%
                              </TableCell>
                              <TableCell align="right">
                                <Typography color="#4caf50" fontWeight={600}>
                                  R$ {(comissaoServico?.valor || 0).toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Resumo do Atendimento
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Total do Atendimento
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatarMoeda(atendimentoSelecionado.valorTotal)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Sua Comissão Total
                        </Typography>
                        <Typography variant="h6" color="#4caf50">
                          {formatarMoeda(atendimentoSelecionado.comissaoTotal)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Status das Comissões
                        </Typography>
                        {comissoes
                          .filter(c => c.atendimentoId === atendimentoSelecionado.id)
                          .map((c, idx) => (
                            <Chip
                              key={idx}
                              size="small"
                              label={c.status}
                              color={c.status === 'pago' ? 'success' : 'warning'}
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Exportação/Relatório */}
      <Dialog open={openRelatorioDialog} onClose={handleCloseRelatorio} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Exportar Relatório
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selecione o formato desejado:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => {
                    handleCloseRelatorio();
                    handlePrint();
                  }}
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                >
                  <Box>
                    <Typography variant="subtitle1">Imprimir Relatório</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Gera uma versão para impressão
                    </Typography>
                  </Box>
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => {
                    handleCloseRelatorio();
                    handleExportPDF();
                  }}
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                  color="error"
                >
                  <Box>
                    <Typography variant="subtitle1">Exportar como PDF</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Gera um arquivo PDF com todas as informações
                    </Typography>
                  </Box>
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    handleCloseRelatorio();
                    handleExportExcel();
                  }}
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                  color="success"
                >
                  <Box>
                    <Typography variant="subtitle1">Exportar como Excel</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Gera uma planilha com todos os dados
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRelatorio}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <RelatorioComissoes
          ref={relatorioRef}
          dados={{
            resumo: resumo || { totalPeriodo: 0, aReceber: 0, recebido: 0 },
            comissoes: comissoesFiltradas,
            atendimentos: atendimentosFiltrados
          }}
          profissional={profissional}
          periodo={`${meses.find(m => m.value === filtroMes)?.label} / ${filtroAno}`}
          filtros={{ mes: filtroMes, ano: filtroAno, status: filtroStatus }}
        />
      </Box>
    </Box>
  );
}

export default MinhasComissoes;
