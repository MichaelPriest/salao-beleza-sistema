// src/pages/FidelidadeHistorico.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Níveis de fidelidade
const niveis = {
  bronze: { cor: '#cd7f32', nome: 'Bronze', minimo: 0 },
  prata: { cor: '#c0c0c0', nome: 'Prata', minimo: 500 },
  ouro: { cor: '#ffd700', nome: 'Ouro', minimo: 2000 },
  platina: { cor: '#e5e4e2', nome: 'Platina', minimo: 5000 },
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function FidelidadeHistorico() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState(null);
  const [pontuacoes, setPontuacoes] = useState([]);
  const [resgates, setResgates] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [tabValue, setTabValue] = useState(0);
  const [filtro, setFiltro] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [openDetalheDialog, setOpenDetalheDialog] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  
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

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do cliente
      const clienteData = await firebaseService.getById('clientes', id);
      if (!clienteData) {
        toast.error('Cliente não encontrado');
        navigate('/fidelidade/gerenciar');
        return;
      }
      setCliente(clienteData);

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
      toast.error('Erro ao carregar histórico');
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
      const data = new Date(p.data);
      return data >= dozeMesesAtras && data <= hoje;
    });
    
    const totalPontos12Meses = pontuacoesUltimos12Meses
      .filter(p => p.tipo === 'credito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);
    
    const mediaMensal = totalPontos12Meses / 12;

    // Melhor mês
    const pontuacoesPorMes = {};
    pontuacoes.forEach(p => {
      if (p.tipo === 'credito') {
        const mes = format(new Date(p.data), 'MMM/yyyy', { locale: ptBR });
        pontuacoesPorMes[mes] = (pontuacoesPorMes[mes] || 0) + (p.quantidade || 0);
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
      mediaMensal,
      melhorMes,
    });
  };

  const getNivelCor = (nivel) => {
    return niveis[nivel]?.cor || '#999';
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Filtrar movimentações
  const filtrarMovimentacoes = () => {
    let resultados = [];

    // Adicionar pontuações
    pontuacoes.forEach(p => {
      resultados.push({
        ...p,
        tipoMov: p.tipo,
        dataObj: new Date(p.data),
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
        motivo: `Resgate: ${r.recompensaNome}`,
        data: r.data,
        dataObj: new Date(r.data),
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
        item.quantidade?.toString().includes(termo)
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
  };

  const movimentacoesFiltradas = filtrarMovimentacoes();
  const totalMovimentacoes = movimentacoesFiltradas.length;
  const totalPagesCalc = Math.ceil(totalMovimentacoes / itemsPerPage);
  
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

  const handleImprimir = () => {
    window.print();
  };

  const handleExportar = () => {
    // Criar dados para exportação
    const dadosExport = movimentacoesFiltradas.map(item => ({
      Data: formatarData(item.data),
      Tipo: getTipoLabel(item.tipoMov),
      Quantidade: item.tipoMov === 'credito' ? `+${item.quantidade}` : `-${Math.abs(item.quantidade)}`,
      Descrição: item.motivo || item.recompensaNome || '',
      Status: item.status || 'concluído',
    }));

    // Criar CSV
    const headers = ['Data', 'Tipo', 'Quantidade', 'Descrição', 'Status'];
    const csvContent = [
      headers.join(','),
      ...dadosExport.map(row => Object.values(row).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico_fidelidade_${cliente?.nome}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cliente) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Cliente não encontrado</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleVoltar} sx={{ bgcolor: '#f5f5f5' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Histórico de Fidelidade
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Acompanhe toda a movimentação de pontos do cliente
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handleImprimir}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportar}
          >
            Exportar CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={carregarDados}
          >
            Atualizar
          </Button>
        </Box>
      </Box>

      {/* Card do Cliente */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  src={cliente.avatar}
                  sx={{ width: 80, height: 80, border: '3px solid white' }}
                >
                  {cliente.nome?.charAt(0)}
                </Avatar>
                <Box sx={{ color: 'white' }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {cliente.nome}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                    {cliente.telefone && (
                      <Typography variant="body2">📞 {cliente.telefone}</Typography>
                    )}
                    {cliente.email && (
                      <Typography variant="body2">✉️ {cliente.email}</Typography>
                    )}
                    {cliente.cpf && (
                      <Typography variant="body2">📄 {cliente.cpf}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: 2, minWidth: 120 }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {saldo}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Pontos Atuais
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: 2, minWidth: 120 }}>
                  <Chip
                    label={nivel.toUpperCase()}
                    sx={{
                      bgcolor: getNivelCor(nivel),
                      color: nivel === 'ouro' ? '#000' : '#fff',
                      fontWeight: 600,
                      fontSize: '1.2rem',
                      py: 2,
                      mb: 1
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Nível Atual
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total de Pontos Ganhos
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {estatisticas.totalCreditos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Pontos Utilizados
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                {estatisticas.totalDebitos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total de Resgates
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {estatisticas.totalResgates}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Média Mensal
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                {Math.round(estatisticas.mediaMensal)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Melhor Mês */}
      {estatisticas.melhorMes.pontos > 0 && (
        <Card sx={{ mb: 4, bgcolor: '#faf5ff' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrophyIcon sx={{ fontSize: 40, color: '#ffd700' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Melhor Mês: {estatisticas.melhorMes.mes}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {estatisticas.melhorMes.pontos} pontos acumulados
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabs e Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Todas Movimentações" />
              <Tab label="Pontuações" />
              <Tab label="Resgates" />
            </Tabs>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por descrição..."
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

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filtroTipo}
                  label="Tipo"
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <MenuItem value="todos">Todos os tipos</MenuItem>
                  <MenuItem value="credito">Créditos</MenuItem>
                  <MenuItem value="debito">Débitos</MenuItem>
                  <MenuItem value="resgate">Resgates</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Período</InputLabel>
                <Select
                  value={filtroPeriodo}
                  label="Período"
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                >
                  <MenuItem value="todos">Todo período</MenuItem>
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="semana">Últimos 7 dias</MenuItem>
                  <MenuItem value="mes">Últimos 30 dias</MenuItem>
                  <MenuItem value="trimestre">Últimos 90 dias</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="textSecondary">
                {totalMovimentacoes} registro(s) encontrado(s)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Movimentações */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell><strong>Descrição</strong></TableCell>
                  <TableCell align="right"><strong>Pontos</strong></TableCell>
                  <TableCell align="center"><strong>Detalhes</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMovimentacoes.map((item, index) => (
                  <TableRow key={`${item.id}-${index}`} hover>
                    <TableCell>{formatarData(item.data)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.icone}
                        <Chip
                          size="small"
                          label={getTipoLabel(item.tipoMov)}
                          sx={{
                            bgcolor: `${item.cor}20`,
                            color: item.cor,
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.motivo || item.recompensaNome}</Typography>
                      {item.recompensaNome && item.status && (
                        <Chip
                          size="small"
                          label={item.status}
                          color={getStatusColor(item.status)}
                          sx={{ mt: 0.5, height: 20 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          color: item.tipoMov === 'credito' ? '#4caf50' : 
                                 item.tipoMov === 'debito' ? '#f44336' : '#ff9800'
                        }}
                      >
                        {item.tipoMov === 'credito' ? '+' : '-'}
                        {Math.abs(item.quantidade || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalhes">
                        <IconButton
                          size="small"
                          onClick={() => handleVerDetalhes(item)}
                          sx={{ color: '#9c27b0' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {paginatedMovimentacoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Nenhuma movimentação encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPagesCalc > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Stack spacing={2}>
                <Pagination
                  count={totalPagesCalc}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalheDialog} onClose={() => setOpenDetalheDialog(false)} maxWidth="sm" fullWidth>
        {itemSelecionado && (
          <>
            <DialogTitle sx={{ bgcolor: itemSelecionado.cor || '#9c27b0', color: 'white' }}>
              Detalhes da Movimentação
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Data</Typography>
                    <Typography variant="body1">{formatarData(itemSelecionado.data)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Tipo</Typography>
                    <Chip
                      size="small"
                      label={getTipoLabel(itemSelecionado.tipoMov)}
                      sx={{
                        bgcolor: `${itemSelecionado.cor}20`,
                        color: itemSelecionado.cor,
                        fontWeight: 500,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Descrição</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {itemSelecionado.motivo || itemSelecionado.recompensaNome}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Quantidade</Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: itemSelecionado.tipoMov === 'credito' ? '#4caf50' : 
                               itemSelecionado.tipoMov === 'debito' ? '#f44336' : '#ff9800'
                      }}
                    >
                      {itemSelecionado.tipoMov === 'credito' ? '+' : '-'}
                      {Math.abs(itemSelecionado.quantidade || 0)} pontos
                    </Typography>
                  </Grid>

                  {itemSelecionado.nivelNoMomento && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Nível no momento</Typography>
                      <Chip
                        label={itemSelecionado.nivelNoMomento.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getNivelCor(itemSelecionado.nivelNoMomento),
                          color: itemSelecionado.nivelNoMomento === 'ouro' ? '#000' : '#fff',
                        }}
                      />
                    </Grid>
                  )}

                  {itemSelecionado.multiplicadorAplicado && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Multiplicador</Typography>
                      <Typography variant="body1">{itemSelecionado.multiplicadorAplicado}x</Typography>
                    </Grid>
                  )}

                  {itemSelecionado.bonusAplicados && itemSelecionado.bonusAplicados.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Bônus aplicados</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {itemSelecionado.bonusAplicados.map((bonus, idx) => (
                          <Chip key={idx} label={bonus} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {itemSelecionado.tipoMov === 'resgate' && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">Recompensa</Typography>
                        <Typography variant="body1">{itemSelecionado.recompensaNome}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">Código</Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                          {itemSelecionado.codigo}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                        <Chip
                          label={itemSelecionado.status}
                          color={getStatusColor(itemSelecionado.status)}
                        />
                      </Grid>
                    </>
                  )}

                  {itemSelecionado.usuarioResponsavel && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Responsável</Typography>
                      <Typography variant="body1">{itemSelecionado.usuarioResponsavel}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetalheDialog(false)}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default FidelidadeHistorico;
