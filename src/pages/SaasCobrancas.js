// src/pages/SaasCobrancas.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Autorenew as AutorenewIcon,
  Launch as LaunchIcon,
  Payments as PaymentsIcon,
  ReceiptLong as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { metodoPagamentoLabel, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { 
    dateStyle: 'short', 
    timeStyle: 'short' 
  }).format(new Date(value));
};

const formatDateShort = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
};

const getStatusFatura = (fatura) => {
  if (fatura.status === 'paga') return { label: 'Paga', color: 'success', icon: <CheckCircleIcon /> };
  if (fatura.status === 'cancelada') return { label: 'Cancelada', color: 'default', icon: <ErrorIcon /> };
  if (fatura.status === 'reembolsada') return { label: 'Reembolsada', color: 'info', icon: <ErrorIcon /> };
  
  const vencimento = fatura.vencimentoEm ? new Date(fatura.vencimentoEm) : null;
  const hoje = new Date();
  
  if (vencimento && vencimento < hoje) {
    return { label: 'Vencida', color: 'error', icon: <WarningIcon /> };
  }
  
  return { label: 'Pendente', color: 'warning', icon: <ScheduleIcon /> };
};

const StatusFaturaChip = ({ fatura }) => {
  const status = getStatusFatura(fatura);
  return (
    <Chip 
      icon={status.icon}
      size="small" 
      label={status.label} 
      color={status.color}
      variant="outlined"
      sx={{ fontWeight: 600, minWidth: 100 }}
    />
  );
};

function SaasCobrancas() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [checkoutLinks, setCheckoutLinks] = useState({});
  
  // Filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Diálogos
  const [dialogOpen, setDialogOpen] = useState(false);
  const [faturaSelecionada, setFaturaSelecionada] = useState(null);
  const [dialogAction, setDialogAction] = useState('');

  const assinaturaPorEmpresa = useMemo(
    () => assinaturas.reduce((acc, assinatura) => ({ 
      ...acc, 
      [assinatura.empresaId || assinatura.id]: assinatura 
    }), {}),
    [assinaturas]
  );

  const empresaPorId = useMemo(
    () => empresas.reduce((acc, empresa) => ({ ...acc, [empresa.id]: empresa }), {}),
    [empresas]
  );

  const stats = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    const faturasMesAtual = faturas.filter(fatura => {
      const data = new Date(fatura.vencimentoEm || fatura.createdAt);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });
    
    const faturasVencidas = faturas.filter(fatura => {
      if (fatura.status === 'paga' || fatura.status === 'cancelada') return false;
      return fatura.vencimentoEm && new Date(fatura.vencimentoEm) < hoje;
    });
    
    const faturasAVencer = faturas.filter(fatura => {
      if (fatura.status === 'paga' || fatura.status === 'cancelada') return false;
      return fatura.vencimentoEm && new Date(fatura.vencimentoEm) >= hoje;
    });
    
    const receitaMes = faturasMesAtual
      .filter(f => f.status === 'paga')
      .reduce((total, f) => total + Number(f.valor || 0), 0);
    
    const receitaPrevista = faturasAVencer
      .reduce((total, f) => total + Number(f.valor || 0), 0);
    
    const inadimplencia = faturasMesAtual.length > 0
      ? (faturasVencidas.length / faturasMesAtual.length) * 100
      : 0;
    
    return {
      total: faturas.length,
      pendentes: faturasAVencer.length + faturasVencidas.length,
      vencidas: faturasVencidas.length,
      pagas: faturas.filter(f => f.status === 'paga').length,
      receitaConfirmada: pagamentos.reduce((total, p) => total + Number(p.valor || 0), 0),
      receitaMes,
      receitaPrevista,
      inadimplencia: inadimplencia.toFixed(1),
      ticketMedio: faturas.length > 0
        ? faturas.reduce((total, f) => total + Number(f.valor || 0), 0) / faturas.length
        : 0,
    };
  }, [faturas, pagamentos]);

  const carregar = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [empresasData, assinaturasData, faturasData, pagamentosData] = await Promise.all([
        firebaseService.getAll('empresas').catch(() => []),
        firebaseService.getAll('assinaturas').catch(() => []),
        firebaseService.getAll('faturas_saas').catch(() => []),
        firebaseService.getAll('pagamentos_saas').catch(() => []),
      ]);
      
      setEmpresas(empresasData);
      setAssinaturas(assinaturasData);
      setFaturas((faturasData || []).sort((a, b) => 
        new Date(b.vencimentoEm || b.createdAt || 0) - new Date(a.vencimentoEm || a.createdAt || 0)
      ));
      setPagamentos((pagamentosData || []).sort((a, b) => 
        new Date(b.pagoEm || b.createdAt || 0) - new Date(a.pagoEm || a.createdAt || 0)
      ));
      
      if (!silent) toast.success('Dados de cobrança carregados!');
    } catch (error) {
      console.error('Erro ao carregar cobranças SaaS:', error);
      if (!silent) toast.error(error.message || 'Erro ao carregar cobranças.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const faturasFiltradas = useMemo(() => {
    return faturas.filter(fatura => {
      const empresa = empresaPorId[fatura.empresaId];
      
      // Filtro de busca
      const matchSearch = !searchTerm || 
        empresa?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fatura.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fatura.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de status
      const matchStatus = filtroStatus === 'todas' || 
        (filtroStatus === 'vencidas' && getStatusFatura(fatura).label === 'Vencida') ||
        (filtroStatus === 'pendentes' && getStatusFatura(fatura).label === 'Pendente') ||
        (filtroStatus === 'pagas' && fatura.status === 'paga') ||
        fatura.status === filtroStatus;
      
      // Filtro de período
      let matchPeriodo = true;
      if (filtroPeriodo !== 'todos') {
        const data = new Date(fatura.vencimentoEm || fatura.createdAt);
        const hoje = new Date();
        
        if (filtroPeriodo === 'hoje') {
          matchPeriodo = data.toDateString() === hoje.toDateString();
        } else if (filtroPeriodo === 'semana') {
          const inicioSemana = new Date(hoje);
          inicioSemana.setDate(hoje.getDate() - 7);
          matchPeriodo = data >= inicioSemana;
        } else if (filtroPeriodo === 'mes') {
          matchPeriodo = data.getMonth() === hoje.getMonth() && 
                        data.getFullYear() === hoje.getFullYear();
        }
      }
      
      return matchSearch && matchStatus && matchPeriodo;
    });
  }, [faturas, searchTerm, filtroStatus, filtroPeriodo, empresaPorId]);

  const iniciarCheckoutFatura = async (fatura) => {
    setSaving(true);
    try {
      const assinatura = assinaturaPorEmpresa[fatura.empresaId];
      const empresa = empresaPorId[fatura.empresaId];
      
      const checkout = await saasService.iniciarCheckout({
        empresaId: fatura.empresaId,
        planoId: assinatura?.planoId || empresa?.planoId,
        provider: fatura.gateway || empresa?.cobranca?.provider || null,
        metodosPagamento: fatura.metodosPagamento || null,
        dadosPagamento: { 
          metodoPreferencial: fatura.metodoPagamento || empresa?.cobranca?.metodoPreferencial || null 
        },
        faturaId: fatura.id,
      });
      
      setCheckoutLinks((current) => ({ 
        ...current, 
        [fatura.id]: checkout.checkoutUrl || checkout.instrucoes || '' 
      }));
      
      if (checkout.checkoutUrl) {
        window.open(checkout.checkoutUrl, '_blank', 'noopener,noreferrer');
        toast.success('Checkout aberto em nova aba!');
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao iniciar checkout.');
    } finally {
      setSaving(false);
    }
  };

  const processarCobrancasAutomaticas = async () => {
    setSaving(true);
    try {
      const resultado = await saasService.processarCobrancasAutomaticas({ 
        assinaturas, 
        empresas 
      });
      
      if (resultado.geradas > 0) {
        toast.success(`${resultado.geradas} fatura(s) gerada(s) com sucesso!`);
      } else {
        toast.success('Nenhuma cobrança pendente para processar.');
      }
      
      await carregar(true);
    } catch (error) {
      toast.error(error.message || 'Erro ao processar cobranças automáticas.');
    } finally {
      setSaving(false);
    }
  };

  const enviarNotificacao = async (fatura) => {
    setSaving(true);
    try {
      const empresa = empresaPorId[fatura.empresaId];
      await saasService.enviarNotificacaoCobranca({
        faturaId: fatura.id,
        email: empresa?.cobranca?.emailFinanceiro || empresa?.email,
        nome: empresa?.nome,
      });
      toast.success('Notificação de cobrança enviada!');
    } catch (error) {
      toast.error(error.message || 'Erro ao enviar notificação.');
    } finally {
      setSaving(false);
    }
  };

  const cancelarFatura = async (fatura) => {
    setFaturaSelecionada(fatura);
    setDialogAction('cancelar');
    setDialogOpen(true);
  };

  const confirmarCancelamento = async () => {
    setSaving(true);
    try {
      await firebaseService.update('faturas_saas', faturaSelecionada.id, {
        status: 'cancelada',
        canceladoEm: new Date().toISOString(),
      });
      toast.success('Fatura cancelada com sucesso!');
      await carregar(true);
    } catch (error) {
      toast.error(error.message || 'Erro ao cancelar fatura.');
    } finally {
      setSaving(false);
      setDialogOpen(false);
      setFaturaSelecionada(null);
    }
  };

  const exportarFaturas = () => {
    const dados = faturasFiltradas.map(fatura => {
      const empresa = empresaPorId[fatura.empresaId];
      return {
        empresa: empresa?.nome || '-',
        descricao: fatura.descricao,
        valor: fatura.valor,
        status: getStatusFatura(fatura).label,
        vencimento: formatDateShort(fatura.vencimentoEm),
        pagamento: fatura.status === 'paga' ? formatDateShort(fatura.pagoEm) : '-',
      };
    });
    
    const csv = [
      ['Empresa', 'Descrição', 'Valor', 'Status', 'Vencimento', 'Pagamento'],
      ...dados.map(d => [d.empresa, d.descricao, d.valor, d.status, d.vencimento, d.pagamento])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faturas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Faturas exportadas com sucesso!');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9ff', minHeight: '100vh' }}>
      {/* Header */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2} 
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Cobranças SaaS
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestão financeira automatizada de faturas, checkouts e confirmações
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => carregar(true)}
            disabled={refreshing}
          >
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportarFaturas}
          >
            Exportar
          </Button>
          <Button
            variant="contained"
            startIcon={<AutorenewIcon />}
            onClick={processarCobrancasAutomaticas}
            disabled={saving}
          >
            Processar Cobranças
          </Button>
        </Stack>
      </Stack>

      {/* Cards de Métricas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            label: 'Receita do Mês', 
            value: formatCurrency(stats.receitaMes),
            icon: <TrendingUpIcon />,
            color: 'success',
            subtitle: `${stats.pagas} faturas pagas`
          },
          { 
            label: 'Receita Prevista', 
            value: formatCurrency(stats.receitaPrevista),
            icon: <PaymentsIcon />,
            color: 'primary',
            subtitle: 'Faturas a vencer'
          },
          { 
            label: 'Inadimplência', 
            value: `${stats.inadimplencia}%`,
            icon: <WarningIcon />,
            color: stats.inadimplencia > 20 ? 'error' : 'warning',
            subtitle: `${stats.vencidas} faturas vencidas`
          },
          { 
            label: 'Ticket Médio', 
            value: formatCurrency(stats.ticketMedio),
            icon: <ReceiptIcon />,
            color: 'info',
            subtitle: `Total: ${stats.total} faturas`
          },
        ].map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              boxShadow: 2,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {metric.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {metric.subtitle}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${metric.color}.light`, color: `${metric.color}.main` }}>
                    {metric.icon}
                  </Avatar>
                </Stack>
                {index === 2 && (
                  <LinearProgress 
                    variant="determinate" 
                    value={100 - parseFloat(stats.inadimplencia)}
                    color={stats.inadimplencia > 20 ? 'error' : 'success'}
                    sx={{ mt: 2, height: 6, borderRadius: 3 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Automação */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            alignItems={{ xs: 'stretch', md: 'center' }} 
            justifyContent="space-between" 
            spacing={2}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Automação de Cobrança
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Sistema automatizado gera faturas baseado nas assinaturas ativas. 
                Pagamentos confirmados via gateway/webhook.
              </Typography>
            </Box>
          </Stack>
          <Alert severity="info" sx={{ mt: 2 }}>
            Faturas são geradas automaticamente. Use processamento manual apenas para 
            casos excepcionais. Confirmações devem ocorrer via integração com gateway.
          </Alert>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por empresa ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <MenuItem value="todas">Todas as faturas</MenuItem>
                <MenuItem value="pendentes">Pendentes</MenuItem>
                <MenuItem value="vencidas">Vencidas</MenuItem>
                <MenuItem value="pagas">Pagas</MenuItem>
                <MenuItem value="cancelada">Canceladas</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Período"
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
              >
                <MenuItem value="todos">Todo período</MenuItem>
                <MenuItem value="hoje">Hoje</MenuItem>
                <MenuItem value="semana">Últimos 7 dias</MenuItem>
                <MenuItem value="mes">Este mês</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setFiltroStatus('todas');
                  setFiltroPeriodo('todos');
                }}
              >
                Limpar Filtros
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Faturas */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ boxShadow: 2 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                    <TableCell sx={{ fontWeight: 700 }}>Empresa</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Descrição</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Valor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vencimento</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Pagamento</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faturasFiltradas
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((fatura) => {
                      const empresa = empresaPorId[fatura.empresaId];
                      const status = getStatusFatura(fatura);
                      
                      return (
                        <TableRow 
                          key={fatura.id}
                          hover
                          sx={{
                            bgcolor: status.label === 'Vencida' ? 'error.light' : 'inherit',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                {empresa?.nome?.charAt(0) || 'E'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {empresa?.nome || fatura.empresaId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {empresa?.email || '-'}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {fatura.descricao || 'Fatura de assinatura'}
                            </Typography>
                            {checkoutLinks[fatura.id] && (
                              <Chip 
                                label="Checkout gerado" 
                                size="small" 
                                color="info" 
                                sx={{ mt: 1 }} 
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(fatura.valor, fatura.moeda)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusFaturaChip fatura={fatura} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateShort(fatura.vencimentoEm)}
                            </Typography>
                            {fatura.vencimentoEm && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(fatura.vencimentoEm).toLocaleDateString('pt-BR', { weekday: 'long' })}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {fatura.status === 'paga' ? (
                              <Typography variant="body2" color="success.main">
                                {formatDateShort(fatura.pagoEm)}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Pendente
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              {fatura.status !== 'paga' && fatura.status !== 'cancelada' && (
                                <>
                                  <Tooltip title="Gerar checkout">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      disabled={saving}
                                      onClick={() => iniciarCheckoutFatura(fatura)}
                                    >
                                      <LaunchIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Enviar notificação">
                                    <IconButton
                                      size="small"
                                      color="info"
                                      disabled={saving}
                                      onClick={() => enviarNotificacao(fatura)}
                                    >
                                      <EmailIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Cancelar fatura">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      disabled={saving}
                                      onClick={() => cancelarFatura(fatura)}
                                    >
                                      <ErrorIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              {fatura.status === 'paga' && (
                                <Chip 
                                  icon={<CheckCircleIcon />}
                                  label="Confirmada" 
                                  size="small" 
                                  color="success" 
                                />
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {faturasFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Alert severity="info">
                          Nenhuma fatura encontrada com os filtros selecionados.
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={faturasFiltradas.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Card>
        </Grid>

        {/* Sidebar de Pagamentos Recentes */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Pagamentos Recentes
                </Typography>
              </Stack>
              
              <Stack spacing={2} divider={<Divider />}>
                {pagamentos.slice(0, 10).map((pagamento) => (
                  <Box key={pagamento.id}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(pagamento.valor, pagamento.moeda)}
                      </Typography>
                      <Chip 
                        label={pagamento.gateway || 'Gateway'} 
                        size="small" 
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {pagamento.metodoPagamentoLabel || metodoPagamentoLabel(pagamento.metodoPagamento)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {formatDate(pagamento.pagoEm)}
                    </Typography>
                  </Box>
                ))}
                
                {pagamentos.length === 0 && (
                  <Alert severity="info">
                    Nenhum pagamento confirmado ainda. Os pagamentos são processados 
                    automaticamente via gateway/webhook.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Resumo Financeiro
              </Typography>
              
              <Grid container spacing={2}>
                {[
                  { label: 'Total Recebido', value: formatCurrency(stats.receitaConfirmada), color: 'success.main' },
                  { label: 'A Receber', value: formatCurrency(stats.receitaPrevista), color: 'primary.main' },
                  { label: 'Inadimplência', value: `${stats.inadimplencia}%`, color: 'error.main' },
                  { label: 'Ticket Médio', value: formatCurrency(stats.ticketMedio), color: 'info.main' },
                ].map((item, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: item.color }}>
                        {item.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de Confirmação */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirmar Cancelamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja cancelar esta fatura? 
            Esta ação não pode ser desfeita e a cobrança não será mais processada.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Voltar
          </Button>
          <Button 
            onClick={confirmarCancelamento} 
            color="error" 
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SaasCobrancas;
