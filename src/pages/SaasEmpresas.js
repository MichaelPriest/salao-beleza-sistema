// src/pages/SaasEmpresas.js
import React, { useEffect, useMemo, useState } from 'react';
import {
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
  Grid,
  IconButton,
  InputAdornment,
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
  Add as AddIcon,
  Business as BusinessIcon,
  OpenInNew as OpenInNewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Apartment as ApartmentIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, STATUS_ASSINATURA, saasService } from '../services/saasService';

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
};

const formatCurrency = (value, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const getStatusConfig = (status) => {
  const configs = {
    [STATUS_ASSINATURA.TRIAL]: { 
      color: 'info', 
      label: 'Trial', 
      icon: <CheckCircleIcon />,
      description: 'Período de teste'
    },
    [STATUS_ASSINATURA.ATIVA]: { 
      color: 'success', 
      label: 'Ativa', 
      icon: <CheckCircleIcon />,
      description: 'Assinatura ativa'
    },
    [STATUS_ASSINATURA.PENDENTE]: { 
      color: 'warning', 
      label: 'Pendente', 
      icon: <WarningIcon />,
      description: 'Pagamento pendente'
    },
    [STATUS_ASSINATURA.INADIMPLENTE]: { 
      color: 'error', 
      label: 'Inadimplente', 
      icon: <CancelIcon />,
      description: 'Pagamento em atraso'
    },
    [STATUS_ASSINATURA.CANCELADA]: { 
      color: 'default', 
      label: 'Cancelada', 
      icon: <CancelIcon />,
      description: 'Assinatura cancelada'
    },
    [STATUS_ASSINATURA.EXPIRADA]: { 
      color: 'error', 
      label: 'Expirada', 
      icon: <WarningIcon />,
      description: 'Prazo expirado'
    },
  };
  return configs[status] || { color: 'default', label: status || 'Sem assinatura', icon: <WarningIcon />, description: 'Status desconhecido' };
};

const StatusChip = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <Tooltip title={config.description}>
      <Chip 
        icon={config.icon}
        size="small" 
        label={config.label} 
        color={config.color}
        variant="outlined"
        sx={{ fontWeight: 600, minWidth: 100 }}
      />
    </Tooltip>
  );
};

function SaasEmpresas() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [planos, setPlanos] = useState([]);
  
  // Filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPlano, setFiltroPlano] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Diálogos
  const [dialogOpen, setDialogOpen] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);

  const assinaturaPorEmpresa = useMemo(
    () => assinaturas.reduce((acc, assinatura) => ({ 
      ...acc, 
      [assinatura.empresaId || assinatura.id]: assinatura 
    }), {}),
    [assinaturas]
  );
  
  const planoPorId = useMemo(
    () => [...Object.values(PLANOS_PADRAO), ...planos].reduce((acc, plano) => ({ 
      ...acc, 
      [plano.id]: plano 
    }), {}),
    [planos]
  );

  const unidadesPorEmpresa = useMemo(
    () => unidades.reduce((acc, unidade) => {
      if (!acc[unidade.empresaId]) acc[unidade.empresaId] = [];
      acc[unidade.empresaId].push(unidade);
      return acc;
    }, {}),
    [unidades]
  );

  const carregar = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [empresasData, unidadesData, assinaturasData, planosData] = await Promise.all([
        firebaseService.getAll('empresas').catch(() => []),
        firebaseService.getAll('unidades').catch(() => []),
        firebaseService.getAll('assinaturas').catch(() => []),
        saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO)),
      ]);
      setEmpresas(empresasData);
      setUnidades(unidadesData);
      setAssinaturas(assinaturasData);
      setPlanos(planosData);
      
      if (!silent) toast.success('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar empresas SaaS:', error);
      if (!silent) toast.error(error.message || 'Erro ao carregar empresas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const empresasFiltradas = useMemo(() => {
    return empresas.filter(empresa => {
      const assinatura = assinaturaPorEmpresa[empresa.id];
      const plano = planoPorId[assinatura?.planoId || empresa.planoId];
      
      // Filtro de busca
      const matchSearch = !searchTerm || 
        empresa.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.documento?.includes(searchTerm);
      
      // Filtro de status
      const matchStatus = filtroStatus === 'todos' || 
        (assinatura?.status || 'sem_assinatura') === filtroStatus;
      
      // Filtro de plano
      const matchPlano = filtroPlano === 'todos' || 
        (plano?.id || 'individual') === filtroPlano;
      
      return matchSearch && matchStatus && matchPlano;
    });
  }, [empresas, searchTerm, filtroStatus, filtroPlano, assinaturaPorEmpresa, planoPorId]);

  const handleStatusChange = async (empresa, novoStatus) => {
    setEmpresaSelecionada(empresa);
    setAcaoSelecionada({ tipo: 'status', valor: novoStatus });
    setDialogOpen(true);
  };

  const confirmarAcao = async () => {
    setSaving(true);
    try {
      if (acaoSelecionada.tipo === 'status') {
        const assinatura = assinaturaPorEmpresa[empresaSelecionada.id];
        if (assinatura) {
          await firebaseService.update('assinaturas', assinatura.id || assinatura.empresaId, { 
            status: acaoSelecionada.valor, 
            updatedAt: new Date().toISOString() 
          });
          toast.success(`Status alterado para "${getStatusConfig(acaoSelecionada.valor).label}"`);
          await carregar(true);
        }
      } else if (acaoSelecionada.tipo === 'excluir') {
        await firebaseService.delete('empresas', empresaSelecionada.id);
        toast.success('Empresa excluída com sucesso!');
        await carregar(true);
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao executar ação.');
    } finally {
      setSaving(false);
      setDialogOpen(false);
      setEmpresaSelecionada(null);
      setAcaoSelecionada(null);
    }
  };

  const exportarDados = () => {
    const dados = empresasFiltradas.map(empresa => {
      const assinatura = assinaturaPorEmpresa[empresa.id];
      const plano = planoPorId[assinatura?.planoId || empresa.planoId];
      return {
        nome: empresa.nome,
        email: empresa.email,
        documento: empresa.documento,
        plano: plano.nome,
        status: assinatura?.status || 'sem_assinatura',
        unidades: unidadesPorEmpresa[empresa.id]?.length || 0,
      };
    });
    
    const csv = [
      ['Nome', 'Email', 'Documento', 'Plano', 'Status', 'Unidades'],
      ...dados.map(d => [d.nome, d.email, d.documento, d.plano, d.status, d.unidades])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `empresas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Dados exportados com sucesso!');
  };

  const estatisticas = useMemo(() => {
    const total = empresas.length;
    const ativas = assinaturas.filter(a => 
      [STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(a.status)
    ).length;
    const inadimplentes = assinaturas.filter(a => 
      a.status === STATUS_ASSINATURA.INADIMPLENTE
    ).length;
    const trials = assinaturas.filter(a => 
      a.status === STATUS_ASSINATURA.TRIAL
    ).length;
    
    return { total, ativas, inadimplentes, trials };
  }, [empresas, assinaturas]);

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
            Empresas e Tenants
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestão completa das empresas contratantes e suas configurações
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
            onClick={exportarDados}
          >
            Exportar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component="a"
            href="/saas-admin/empresas/nova"
          >
            Nova Empresa
          </Button>
        </Stack>
      </Stack>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total de Empresas', value: estatisticas.total, icon: <BusinessIcon />, color: 'primary' },
          { label: 'Assinaturas Ativas', value: estatisticas.ativas, icon: <CheckCircleIcon />, color: 'success' },
          { label: 'Em Trial', value: estatisticas.trials, icon: <CheckCircleIcon />, color: 'info' },
          { label: 'Inadimplentes', value: estatisticas.inadimplentes, icon: <WarningIcon />, color: 'error' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${stat.color}.light`, color: `${stat.color}.main` }}>
                    {stat.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nome, email ou documento..."
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
                <MenuItem value="todos">Todos os status</MenuItem>
                <MenuItem value={STATUS_ASSINATURA.TRIAL}>Trial</MenuItem>
                <MenuItem value={STATUS_ASSINATURA.ATIVA}>Ativa</MenuItem>
                <MenuItem value={STATUS_ASSINATURA.PENDENTE}>Pendente</MenuItem>
                <MenuItem value={STATUS_ASSINATURA.INADIMPLENTE}>Inadimplente</MenuItem>
                <MenuItem value={STATUS_ASSINATURA.CANCELADA}>Cancelada</MenuItem>
                <MenuItem value="sem_assinatura">Sem assinatura</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Plano"
                value={filtroPlano}
                onChange={(e) => setFiltroPlano(e.target.value)}
              >
                <MenuItem value="todos">Todos os planos</MenuItem>
                {[...Object.values(PLANOS_PADRAO), ...planos].map(plano => (
                  <MenuItem key={plano.id} value={plano.id}>{plano.nome}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setFiltroStatus('todos');
                  setFiltroPlano('todos');
                }}
              >
                Limpar Filtros
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Empresas */}
      <Card sx={{ boxShadow: 2 }}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 700 }}>Empresa</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Plano</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Unidades</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Financeiro</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Link Público</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Próx. Cobrança</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empresasFiltradas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((empresa) => {
                  const assinatura = assinaturaPorEmpresa[empresa.id];
                  const plano = planoPorId[assinatura?.planoId || empresa.planoId] || PLANOS_PADRAO.individual;
                  const totalUnidades = unidadesPorEmpresa[empresa.id]?.length || 0;
                  
                  return (
                    <TableRow 
                      key={empresa.id}
                      hover
                      sx={{ 
                        '&:hover': { 
                          bgcolor: theme.palette.action.hover 
                        },
                        cursor: 'pointer',
                      }}
                      onClick={() => window.location.href = `/saas-admin/empresas/${empresa.id}`}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                            {empresa.nome?.charAt(0)?.toUpperCase() || 'E'}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                              {empresa.nome}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {empresa.documento || empresa.id?.slice(0, 8)}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={plano.nome} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={assinatura?.status || 'sem_assinatura'} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ApartmentIcon color="action" fontSize="small" />
                          <Typography>{totalUnidades}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <MailIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {empresa.cobranca?.emailFinanceiro || empresa.email || '-'}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              Venc. dia {empresa.cobranca?.diaVencimento || assinatura?.diaVencimento || '-'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {empresa.slug ? (
                          <Button
                            size="small"
                            href={empresa.linkPublico || `/e/${empresa.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            startIcon={<OpenInNewIcon />}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Abrir
                          </Button>
                        ) : (
                          <Chip label="Não configurado" size="small" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(assinatura?.proximaCobrancaEm)}
                        </Typography>
                        {assinatura?.valorMensal && (
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(assinatura.valorMensal)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {assinatura && (
                            <>
                              {assinatura.status !== STATUS_ASSINATURA.ATIVA && (
                                <Tooltip title="Ativar assinatura">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    disabled={saving}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(empresa, STATUS_ASSINATURA.ATIVA);
                                    }}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {assinatura.status !== STATUS_ASSINATURA.INADIMPLENTE && assinatura.status !== STATUS_ASSINATURA.CANCELADA && (
                                <Tooltip title="Marcar como inadimplente">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    disabled={saving}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(empresa, STATUS_ASSINATURA.INADIMPLENTE);
                                    }}
                                  >
                                    <WarningIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                          <Tooltip title="Ver detalhes">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/saas-admin/empresas/${empresa.id}`;
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={empresasFiltradas.length}
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

      {/* Diálogo de Confirmação */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>
          Confirmar Ação
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {acaoSelecionada?.tipo === 'status' && (
              <>
                Deseja alterar o status da empresa <strong>{empresaSelecionada?.nome}</strong> para{' '}
                <strong>{getStatusConfig(acaoSelecionada?.valor).label}</strong>?
              </>
            )}
            {acaoSelecionada?.tipo === 'excluir' && (
              <>
                Tem certeza que deseja excluir a empresa <strong>{empresaSelecionada?.nome}</strong>?
                Esta ação não pode ser desfeita.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmarAcao} 
            color={acaoSelecionada?.tipo === 'excluir' ? 'error' : 'primary'}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Processando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SaasEmpresas;
