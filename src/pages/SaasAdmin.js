// src/pages/SaasAdmin.js
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
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  Payments as PaymentsIcon,
  Settings as SettingsIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  ReceiptLong as ReceiptIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, STATUS_ASSINATURA, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StatusBadge = ({ status }) => {
  const statusMap = {
    ativa: { color: 'success', label: 'Ativa', icon: <CheckCircleIcon /> },
    trial: { color: 'info', label: 'Trial', icon: <CheckCircleIcon /> },
    pendente: { color: 'warning', label: 'Pendente', icon: <WarningIcon /> },
    atrasada: { color: 'error', label: 'Atrasada', icon: <ErrorIcon /> },
    cancelada: { color: 'default', label: 'Cancelada', icon: <ErrorIcon /> },
  };
  
  const config = statusMap[status] || statusMap.pendente;
  return (
    <Chip 
      icon={config.icon}
      label={config.label} 
      color={config.color} 
      size="small" 
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
};

function SaasAdmin() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [billingConfig, setBillingConfig] = useState(null);

  const carregarDados = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [empresasData, unidadesData, assinaturasData, faturasData, planosData, configData] = await Promise.all([
        firebaseService.getAll('empresas').catch(() => []),
        firebaseService.getAll('unidades').catch(() => []),
        firebaseService.getAll('assinaturas').catch(() => []),
        firebaseService.getAll('faturas_saas').catch(() => []),
        saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO)),
        saasService.buscarConfigCobranca().catch(() => null),
      ]);
      
      setEmpresas(empresasData);
      setUnidades(unidadesData);
      setAssinaturas(assinaturasData);
      setFaturas(faturasData);
      setPlanos(planosData);
      setBillingConfig(configData);
      
      if (!silent) toast.success('Painel atualizado!');
    } catch (error) {
      console.error('Erro ao carregar painel SaaS:', error);
      if (!silent) toast.error(error.message || 'Erro ao carregar painel SaaS.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const metricas = useMemo(() => {
    const assinaturasAtivas = assinaturas.filter(assinatura => 
      [STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(assinatura.status)
    );
    
    const assinaturasTrial = assinaturas.filter(assinatura => 
      assinatura.status === STATUS_ASSINATURA.TRIAL
    );
    
    const faturasPendentes = faturas.filter(fatura => 
      fatura.status === 'pendente' || fatura.status === 'atrasada'
    );
    
    const faturasPagas = faturas.filter(fatura => 
      fatura.status === 'paga'
    );
    
    const receitaAtual = assinaturasAtivas.reduce((total, assinatura) => 
      total + Number(assinatura.valorMensal || 0), 0
    );
    
    const receitaAnterior = faturasPagas
      .filter(fatura => {
        const faturaDate = new Date(fatura.dataVencimento);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return faturaDate.getMonth() === lastMonth.getMonth();
      })
      .reduce((total, fatura) => total + Number(fatura.valor || 0), 0);
    
    const crescimento = receitaAnterior > 0 
      ? ((receitaAtual - receitaAnterior) / receitaAnterior * 100).toFixed(1)
      : 0;
    
    const taxaConversao = assinaturas.length > 0
      ? ((assinaturasAtivas.length / assinaturas.length) * 100).toFixed(1)
      : 0;
    
    const inadimplencia = faturas.length > 0
      ? ((faturasPendentes.length / faturas.length) * 100).toFixed(1)
      : 0;
    
    return {
      assinaturasAtivas: assinaturasAtivas.length,
      assinaturasTrial: assinaturasTrial.length,
      totalAssinaturas: assinaturas.length,
      receitaAtual,
      crescimento,
      taxaConversao,
      inadimplencia,
      faturasPendentes: faturasPendentes.length,
      faturasPagas: faturasPagas.length,
      mediaPorEmpresa: assinaturasAtivas.length > 0 
        ? receitaAtual / assinaturasAtivas.length 
        : 0,
      empresasAtivas: empresas.filter(empresa => empresa.status !== 'inativo').length,
    };
  }, [assinaturas, empresas, faturas]);

  const ultimasFaturas = useMemo(() => {
    return faturas
      .sort((a, b) => new Date(b.dataVencimento) - new Date(a.dataVencimento))
      .slice(0, 5);
  }, [faturas]);

  const empresasRecentes = useMemo(() => {
    return empresas
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [empresas]);

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
          Carregando painel SaaS...
        </Typography>
      </Box>
    );
  }

  const metricCards = [
    {
      label: 'Receita Mensal',
      value: formatCurrency(metricas.receitaAtual),
      icon: <AccountBalanceIcon />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light,
      change: `${metricas.crescimento}%`,
      changePositive: metricas.crescimento >= 0,
      subtitle: 'vs. mês anterior',
    },
    {
      label: 'Assinaturas Ativas',
      value: metricas.assinaturasAtivas,
      icon: <WorkspacePremiumIcon />,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light,
      change: `${metricas.taxaConversao}% conversão`,
      changePositive: true,
      subtitle: `${metricas.assinaturasTrial} em trial`,
    },
    {
      label: 'Empresas Ativas',
      value: metricas.empresasAtivas,
      icon: <BusinessIcon />,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light,
      change: `${empresas.length} total`,
      changePositive: true,
      subtitle: `${unidades.length} unidades`,
    },
    {
      label: 'Ticket Médio',
      value: formatCurrency(metricas.mediaPorEmpresa),
      icon: <PaymentsIcon />,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light,
      change: `${metricas.inadimplencia}% inadimplência`,
      changePositive: metricas.inadimplencia < 10,
      subtitle: 'por empresa ativa',
    },
  ];

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      bgcolor: '#f8f9ff', 
      minHeight: '100vh' 
    }}>
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
            Painel SaaS
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestão centralizada de empresas, assinaturas e cobranças
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => carregarDados(true)}
            disabled={refreshing}
            size="small"
          >
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Chip 
            icon={<PaymentsIcon />} 
            label={`Gateway: ${billingConfig?.provider || 'Manual'}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Stack>

      {/* Alert */}
      <Alert 
        severity="info" 
        sx={{ mb: 4, borderRadius: 2 }}
        action={
          <Button color="inherit" size="small" component={RouterLink} to="/saas-admin/config">
            Configurar
          </Button>
        }
      >
        Área exclusiva da plataforma. Dados isolados por tenant. 
        Empresas acessam suas informações em "Minha Empresa".
      </Alert>

      {/* Métricas Principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricCards.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%',
              boxShadow: 2,
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: 4 
              },
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {metric.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                      {metric.value}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {metric.changePositive ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="small" />
                      )}
                      <Typography 
                        variant="body2" 
                        color={metric.changePositive ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 600 }}
                      >
                        {metric.change}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {metric.subtitle}
                    </Typography>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: metric.bgColor, 
                      color: metric.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {metric.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Gráfico de Receita e Links Rápidos */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Links Rápidos
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Empresas e Tenants', icon: <BusinessIcon />, to: '/saas-admin/empresas', color: 'primary' },
                  { label: 'Planos e Assinaturas', icon: <WorkspacePremiumIcon />, to: '/saas-admin/assinaturas', color: 'success' },
                  { label: 'Cobranças e Faturas', icon: <ReceiptIcon />, to: '/saas-admin/cobrancas', color: 'warning' },
                  { label: 'Configurações de Pagamento', icon: <SettingsIcon />, to: '/saas-admin/pagamentos', color: 'info' },
                  { label: 'Relatórios', icon: <AssessmentIcon />, to: '/saas-admin/relatorios', color: 'secondary' },
                  { label: 'Notificações', icon: <NotificationsIcon />, to: '/saas-admin/notificacoes', color: 'error' },
                ].map((link, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Button
                      component={RouterLink}
                      to={link.to}
                      variant="outlined"
                      startIcon={link.icon}
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        justifyContent: 'flex-start',
                        color: 'text.primary',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: `${link.color}.main`,
                          bgcolor: `${link.color}.light`,
                        },
                      }}
                    >
                      {link.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <Card sx={{ boxShadow: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Indicadores de Performance
              </Typography>
              <Stack spacing={3}>
                {[
                  { 
                    label: 'Taxa de Conversão', 
                    value: metricas.taxaConversao, 
                    color: 'primary',
                    description: 'Assinaturas ativas / total de assinaturas'
                  },
                  { 
                    label: 'Taxa de Inadimplência', 
                    value: 100 - metricas.inadimplencia, 
                    color: metricas.inadimplencia > 20 ? 'error' : 'success',
                    description: 'Faturas pagas em dia'
                  },
                  { 
                    label: 'Crescimento Mensal', 
                    value: Math.max(0, metricas.crescimento), 
                    color: 'info',
                    description: 'Comparativo com mês anterior'
                  },
                ].map((indicador, index) => (
                  <Box key={index}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {indicador.label}
                      </Typography>
                      <Typography variant="body2" color={`${indicador.color}.main`} fontWeight={700}>
                        {indicador.value}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={indicador.value} 
                      color={indicador.color}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {indicador.description}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar com Últimas Atividades */}
        <Grid item xs={12} md={4}>
          {/* Últimas Empresas */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Novas Empresas
                </Typography>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/saas-admin/empresas"
                >
                  Ver todas
                </Button>
              </Stack>
              <List disablePadding>
                {empresasRecentes.map((empresa, index) => (
                  <React.Fragment key={empresa.id || index}>
                    <ListItem 
                      component={RouterLink} 
                      to={`/saas-admin/empresas/${empresa.id}`}
                      sx={{ 
                        textDecoration: 'none',
                        color: 'inherit',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                          {empresa.nome?.charAt(0)?.toUpperCase() || 'E'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={empresa.nome || 'Sem nome'}
                        secondary={`Criada em ${formatDate(empresa.createdAt)}`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <StatusBadge status={empresa.status || 'ativa'} />
                    </ListItem>
                    {index < empresasRecentes.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Últimas Faturas */}
          <Card sx={{ boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Últimas Faturas
                </Typography>
                <Button 
                  size="small" 
                  component={RouterLink} 
                  to="/saas-admin/cobrancas"
                >
                  Ver todas
                </Button>
              </Stack>
              <List disablePadding>
                {ultimasFaturas.map((fatura, index) => (
                  <React.Fragment key={fatura.id || index}>
                    <ListItem 
                      component={RouterLink} 
                      to={`/saas-admin/cobrancas/${fatura.id}`}
                      sx={{ 
                        textDecoration: 'none',
                        color: 'inherit',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: fatura.status === 'paga' 
                            ? theme.palette.success.light 
                            : theme.palette.warning.light 
                        }}>
                          <ReceiptIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={formatCurrency(fatura.valor, fatura.moeda)}
                        secondary={`Venc: ${formatDate(fatura.dataVencimento)}`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <StatusBadge status={fatura.status} />
                    </ListItem>
                    {index < ultimasFaturas.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SaasAdmin;
