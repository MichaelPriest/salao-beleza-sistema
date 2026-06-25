// src/pages/SuperAdminSelecionarEmpresa.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
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
  Business as BusinessIcon,
  Login as LoginIcon,
  Search as SearchIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  FilterList as FilterListIcon,
  SortByAlpha as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Apartment as ApartmentIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { firebaseService, clearTenantContext, getTenantContext, setTenantContext } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';
import { isSaasPlatformAdmin } from '../utils/saasAccess';
import { PLANOS_PADRAO, STATUS_ASSINATURA } from '../services/saasService';
import { safeSetUsuarioStorage } from '../utils/storageUtils';

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
};

const formatCurrency = (value, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const getStatusConfig = (status) => {
  const configs = {
    ativa: { color: 'success', icon: <CheckCircleIcon />, label: 'Ativa' },
    inativa: { color: 'default', icon: <CancelIcon />, label: 'Inativa' },
    trial: { color: 'info', icon: <StarIcon />, label: 'Trial' },
    bloqueada: { color: 'error', icon: <WarningIcon />, label: 'Bloqueada' },
  };
  return configs[status] || configs.ativa;
};

function SuperAdminSelecionarEmpresa() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroPlano, setFiltroPlano] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('nome');
  const [modoVisualizacao, setModoVisualizacao] = useState('cards'); // 'cards' ou 'tabela'
  const [tenantAtual, setTenantAtual] = useState(getTenantContext());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const usuario = usuariosService.getUsuarioAtual();

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        if (!isSaasPlatformAdmin(usuario)) {
          toast.error('Acesso restrito ao superadmin da plataforma.');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        const [empresasData, assinaturasData] = await Promise.all([
          firebaseService.getAll('empresas').catch(() => []),
          firebaseService.getAll('assinaturas').catch(() => []),
        ]);
        
        setEmpresas((empresasData || []).sort((a, b) => 
          String(a.nome || '').localeCompare(String(b.nome || ''))
        ));
        setAssinaturas(assinaturasData || []);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        toast.error(error.message || 'Erro ao carregar empresas.');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [navigate]);

  const assinaturaPorEmpresa = useMemo(
    () => assinaturas.reduce((acc, assinatura) => ({
      ...acc,
      [assinatura.empresaId]: assinatura
    }), {}),
    [assinaturas]
  );

  const planosDisponiveis = useMemo(() => {
    const planos = [...new Set(empresas.map(e => e.planoId).filter(Boolean))];
    return planos;
  }, [empresas]);

  const empresasFiltradas = useMemo(() => {
    let resultado = empresas;
    
    // Filtro de busca
    const termo = filtro.trim().toLowerCase();
    if (termo) {
      resultado = resultado.filter((empresa) => 
        [empresa.nome, empresa.razaoSocial, empresa.email, empresa.documento, empresa.slug]
          .filter(Boolean)
          .some((valor) => String(valor).toLowerCase().includes(termo))
      );
    }
    
    // Filtro de status
    if (filtroStatus !== 'todas') {
      resultado = resultado.filter(empresa => empresa.status === filtroStatus);
    }
    
    // Filtro de plano
    if (filtroPlano !== 'todos') {
      resultado = resultado.filter(empresa => empresa.planoId === filtroPlano);
    }
    
    // Ordenação
    if (ordenacao === 'nome') {
      resultado.sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || '')));
    } else if (ordenacao === 'recente') {
      resultado.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (ordenacao === 'antigo') {
      resultado.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    
    return resultado;
  }, [empresas, filtro, filtroStatus, filtroPlano, ordenacao]);

  const estatisticas = useMemo(() => ({
    total: empresas.length,
    ativas: empresas.filter(e => e.status === 'ativa').length,
    trial: empresas.filter(e => e.status === 'trial').length,
    inativas: empresas.filter(e => e.status === 'inativa').length,
  }), [empresas]);

  const atualizarUsuarioLocal = (empresa = null) => {
    const atual = usuariosService.getUsuarioAtual() || usuario || {};
    const atualizado = empresa
      ? {
          ...atual,
          empresaId: empresa.id,
          empresaNome: empresa.nome,
          empresa,
          tenantAssumidoPorSuperadmin: true,
        }
      : {
          ...atual,
          empresaId: null,
          empresaNome: null,
          empresa: null,
          unidadeId: null,
          unidade: null,
          tenantAssumidoPorSuperadmin: false,
        };

    safeSetUsuarioStorage(atualizado);
    window.dispatchEvent(new Event('usuarioAtualizado'));
    return atualizado;
  };

  const confirmarAcesso = (empresa) => {
    setEmpresaSelecionada(empresa);
    setDialogOpen(true);
  };

  const acessarEmpresa = () => {
    if (!empresaSelecionada) return;
    
    clearTenantContext();
    setTenantContext({ 
      empresaId: empresaSelecionada.id, 
      empresa: empresaSelecionada 
    });
    atualizarUsuarioLocal(empresaSelecionada);
    setTenantAtual(getTenantContext());
    
    toast.success(`✅ Acessando ${empresaSelecionada.nome} como superadmin`);
    navigate('/dashboard', { replace: true });
    setDialogOpen(false);
  };

  const sairDoTenant = () => {
    clearTenantContext();
    atualizarUsuarioLocal(null);
    setTenantAtual(getTenantContext());
    toast.success('👋 Contexto da empresa removido. Voltando ao painel principal.');
    navigate('/saas-admin', { replace: true });
  };

  const recarregar = async () => {
    setRefreshing(true);
    try {
      const [empresasData, assinaturasData] = await Promise.all([
        firebaseService.getAll('empresas').catch(() => []),
        firebaseService.getAll('assinaturas').catch(() => []),
      ]);
      setEmpresas(empresasData || []);
      setAssinaturas(assinaturasData || []);
      toast.success('Lista atualizada!');
    } catch (error) {
      toast.error('Erro ao atualizar lista.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Carregando empresas...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9ff', minHeight: '100vh' }}>
      {/* Header */}
      <Card sx={{ mb: 4, boxShadow: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  width: 56, 
                  height: 56, 
                  bgcolor: theme.palette.primary.light,
                  fontSize: 24 
                }}>
                  <AdminIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                    Acesso Superadmin
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Selecione uma empresa para acessar como administrador
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                {tenantAtual.empresaId && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={sairDoTenant}
                    size="small"
                  >
                    Sair do Tenant
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={recarregar}
                  disabled={refreshing}
                  size="small"
                >
                  {refreshing ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Alert de Tenant Atual */}
      {tenantAtual.empresaId && (
        <Alert 
          severity="info" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={sairDoTenant}
              startIcon={<LogoutIcon />}
            >
              Sair
            </Button>
          }
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <BusinessIcon />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Tenant Atual: {tenantAtual.empresa?.nome || tenantAtual.empresaId}
              </Typography>
              <Typography variant="caption">
                Você está visualizando o sistema como administrador desta empresa
              </Typography>
            </Box>
          </Stack>
        </Alert>
      )}

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Empresas', value: estatisticas.total, icon: <BusinessIcon />, color: 'primary' },
          { label: 'Ativas', value: estatisticas.ativas, icon: <CheckCircleIcon />, color: 'success' },
          { label: 'Em Trial', value: estatisticas.trial, icon: <StarIcon />, color: 'info' },
          { label: 'Inativas', value: estatisticas.inativas, icon: <CancelIcon />, color: 'default' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              boxShadow: 2,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
            }}>
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

      {/* Filtros e Controles */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nome, email, documento ou slug..."
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
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <MenuItem value="todas">Todos</MenuItem>
                <MenuItem value="ativa">Ativas</MenuItem>
                <MenuItem value="trial">Trial</MenuItem>
                <MenuItem value="inativa">Inativas</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Plano"
                value={filtroPlano}
                onChange={(e) => setFiltroPlano(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                {planosDisponiveis.map(plano => (
                  <MenuItem key={plano} value={plano}>{plano}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Ordenar"
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SortIcon />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="nome">Nome</MenuItem>
                <MenuItem value="recente">Mais recentes</MenuItem>
                <MenuItem value="antigo">Mais antigos</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Visualização em cards">
                  <IconButton 
                    color={modoVisualizacao === 'cards' ? 'primary' : 'default'}
                    onClick={() => setModoVisualizacao('cards')}
                  >
                    <ViewModuleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Visualização em tabela">
                  <IconButton 
                    color={modoVisualizacao === 'tabela' ? 'primary' : 'default'}
                    onClick={() => setModoVisualizacao('tabela')}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Visualização em Cards */}
      {modoVisualizacao === 'cards' && (
        <>
          <Grid container spacing={3}>
            {empresasFiltradas
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((empresa) => {
                const ativa = tenantAtual.empresaId === empresa.id;
                const assinatura = assinaturaPorEmpresa[empresa.id];
                const plano = PLANOS_PADRAO[assinatura?.planoId || empresa.planoId];
                const statusConfig = getStatusConfig(empresa.status);
                
                return (
                  <Grid item xs={12} sm={6} lg={4} key={empresa.id}>
                    <Card sx={{ 
                      height: '100%', 
                      position: 'relative',
                      border: ativa ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                      borderColor: ativa ? 'primary.main' : 'divider',
                      boxShadow: ativa ? 4 : 2,
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: 6 
                      },
                    }}>
                      {ativa && (
                        <Chip
                          label="Em uso"
                          color="primary"
                          size="small"
                          sx={{ position: 'absolute', top: 12, right: 12 }}
                        />
                      )}
                      
                      <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2}>
                          {/* Cabeçalho */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              badgeContent={
                                <Tooltip title={statusConfig.label}>
                                  <Avatar sx={{ 
                                    width: 22, 
                                    height: 22, 
                                    bgcolor: `${statusConfig.color}.main`,
                                  }}>
                                    {statusConfig.icon}
                                  </Avatar>
                                </Tooltip>
                              }
                            >
                              <Avatar 
                                sx={{ 
                                  width: 56, 
                                  height: 56, 
                                  bgcolor: ativa ? 'primary.main' : 'primary.light',
                                  color: ativa ? 'white' : 'primary.main',
                                  fontSize: 24,
                                  fontWeight: 700
                                }}
                              >
                                {empresa.nome?.charAt(0)?.toUpperCase() || 'E'}
                              </Avatar>
                            </Badge>
                            
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }} noWrap>
                                {empresa.nome || 'Empresa sem nome'}
                              </Typography>
                              {empresa.razaoSocial && (
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {empresa.razaoSocial}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                          
                          <Divider />
                          
                          {/* Informações */}
                          <Stack spacing={1}>
                            {empresa.email && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2" noWrap>
                                  {empresa.email}
                                </Typography>
                              </Stack>
                            )}
                            
                            {empresa.slug && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <LanguageIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                  /e/{empresa.slug}
                                </Typography>
                              </Stack>
                            )}
                            
                            {empresa.documento && (
                              <Typography variant="caption" color="text.secondary">
                                {empresa.documento}
                              </Typography>
                            )}
                          </Stack>
                          
                          {/* Chips */}
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip 
                              icon={statusConfig.icon}
                              size="small" 
                              label={statusConfig.label} 
                              color={statusConfig.color}
                              variant="outlined"
                            />
                            {plano && (
                              <Chip 
                                size="small" 
                                label={plano.nome} 
                                variant="outlined"
                              />
                            )}
                            {assinatura && (
                              <Chip 
                                icon={<PaymentIcon />}
                                size="small" 
                                label={formatCurrency(assinatura.valorMensal)} 
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                          
                          {/* Data de criação */}
                          {empresa.createdAt && (
                            <Typography variant="caption" color="text.secondary">
                              Cliente desde {formatDate(empresa.createdAt)}
                            </Typography>
                          )}
                          
                          {/* Botão de Acesso */}
                          <Button
                            fullWidth
                            variant={ativa ? 'outlined' : 'contained'}
                            startIcon={ativa ? <CheckCircleIcon /> : <LoginIcon />}
                            onClick={() => confirmarAcesso(empresa)}
                            sx={{ 
                              fontWeight: 700,
                              mt: 'auto',
                            }}
                          >
                            {ativa ? 'Acessar Novamente' : 'Acessar Empresa'}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
          
          {empresasFiltradas.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Nenhuma empresa encontrada com os filtros selecionados.
            </Alert>
          )}
          
          <TablePagination
            rowsPerPageOptions={[6, 12, 24, 48]}
            component="div"
            count={empresasFiltradas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Empresas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </>
      )}

      {/* Visualização em Tabela */}
      {modoVisualizacao === 'tabela' && (
        <Card sx={{ boxShadow: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 700 }}>Empresa</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Plano</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assinatura</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contato</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empresasFiltradas
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((empresa) => {
                    const ativa = tenantAtual.empresaId === empresa.id;
                    const assinatura = assinaturaPorEmpresa[empresa.id];
                    const plano = PLANOS_PADRAO[assinatura?.planoId || empresa.planoId];
                    const statusConfig = getStatusConfig(empresa.status);
                    
                    return (
                      <TableRow 
                        key={empresa.id} 
                        hover
                        sx={{ 
                          bgcolor: ativa ? `${theme.palette.primary.light}10` : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                              {empresa.nome?.charAt(0)?.toUpperCase() || 'E'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {empresa.nome || 'Sem nome'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {empresa.slug || empresa.id?.slice(0, 8)}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={statusConfig.icon}
                            size="small" 
                            label={statusConfig.label} 
                            color={statusConfig.color}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={plano?.nome || 'Individual'} 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {assinatura ? (
                            <Stack>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formatCurrency(assinatura.valorMensal)}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={assinatura.status} 
                                color={assinatura.status === 'ativa' ? 'success' : 'warning'}
                              />
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Sem assinatura
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            {empresa.email && (
                              <Typography variant="body2">
                                {empresa.email}
                              </Typography>
                            )}
                            {empresa.telefone && (
                              <Typography variant="caption" color="text.secondary">
                                {empresa.telefone}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant={ativa ? 'outlined' : 'contained'}
                            size="small"
                            startIcon={ativa ? <CheckCircleIcon /> : <LoginIcon />}
                            onClick={() => confirmarAcesso(empresa)}
                          >
                            {ativa ? 'Acessar' : 'Entrar'}
                          </Button>
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
      )}

      {/* Diálogo de Confirmação */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
              <AdminIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                Confirmar Acesso
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Você está prestes a acessar como superadmin
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você irá acessar o sistema como administrador da empresa{' '}
            <strong>{empresaSelecionada?.nome}</strong>.
          </DialogContentText>
          
          {empresaSelecionada && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: theme.palette.grey[50] }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BusinessIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Empresa:</strong> {empresaSelecionada.nome}
                  </Typography>
                </Stack>
                {empresaSelecionada.email && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                      {empresaSelecionada.email}
                    </Typography>
                  </Stack>
                )}
                {empresaSelecionada.planoId && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <WorkspacePremiumIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                      Plano: {empresaSelecionada.planoId}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Paper>
          )}
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            Todas as ações realizadas serão registradas como feitas pelo superadmin 
            em nome desta empresa.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={acessarEmpresa} 
            variant="contained"
            startIcon={<LoginIcon />}
          >
            Acessar Empresa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SuperAdminSelecionarEmpresa;
