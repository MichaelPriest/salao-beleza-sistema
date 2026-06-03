// src/pages/SaasAdmin.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Payments as PaymentsIcon,
  ReceiptLong as ReceiptLongIcon,
  Settings as SettingsIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, STATUS_ASSINATURA, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

function SaasAdmin() {
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [billingConfig, setBillingConfig] = useState(null);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
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
      } catch (error) {
        console.error('Erro ao carregar painel SaaS:', error);
        toast.error(error.message || 'Erro ao carregar painel SaaS.');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const totais = useMemo(() => {
    const ativas = assinaturas.filter((assinatura) => [STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(assinatura.status));
    return {
      empresas: empresas.length,
      unidades: unidades.length,
      assinaturasAtivas: ativas.length,
      faturasAbertas: faturas.filter((fatura) => fatura.status !== 'paga').length,
      receitaMensal: ativas.reduce((total, assinatura) => total + Number(assinatura.valorMensal || 0), 0),
    };
  }, [assinaturas, empresas.length, faturas, unidades.length]);

  if (loading) {
    return <Box sx={{ minHeight: 360, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
  }

  const cards = [
    { label: 'Empresas', value: totais.empresas, icon: <BusinessIcon color="primary" />, to: '/saas-admin/empresas' },
    { label: 'Unidades', value: totais.unidades, icon: <BusinessIcon color="secondary" />, to: '/saas-admin/empresas' },
    { label: 'Assinaturas ativas', value: totais.assinaturasAtivas, icon: <WorkspacePremiumIcon color="success" />, to: '/saas-admin/assinaturas' },
    { label: 'Faturas abertas', value: totais.faturasAbertas, icon: <ReceiptLongIcon color="warning" />, to: '/saas-admin/cobrancas' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Gestão SaaS da plataforma</Typography>
          <Typography color="text.secondary">Painel central sem duplicação: use as páginas específicas para empresas, planos, cobranças e APIs.</Typography>
        </Box>
        <Chip icon={<PaymentsIcon />} label={`Gateway: ${billingConfig?.provider || 'manual'}`} color="primary" />
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        Esta área é exclusiva da plataforma. A área da empresa cliente fica separada em Minha Empresa, com dados de cobrança e assinatura do próprio tenant.
      </Alert>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card component={RouterLink} to={card.to} sx={{ display: 'block', textDecoration: 'none', height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  {card.icon}
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{card.value}</Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ mt: 1 }}>{card.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card><CardContent><Typography variant="h6">Receita mensal estimada</Typography><Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>{formatCurrency(totais.receitaMensal)}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Páginas de gestão SaaS</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                <Button component={RouterLink} to="/saas-admin/empresas" variant="contained" startIcon={<BusinessIcon />}>Empresas e tenants</Button>
                <Button component={RouterLink} to="/saas-admin/assinaturas" variant="outlined" startIcon={<WorkspacePremiumIcon />}>Planos e assinaturas</Button>
                <Button component={RouterLink} to="/saas-admin/cobrancas" variant="outlined" startIcon={<ReceiptLongIcon />}>Cobranças e faturas</Button>
                <Button component={RouterLink} to="/saas-admin/pagamentos" variant="outlined" startIcon={<SettingsIcon />}>APIs de pagamento</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SaasAdmin;
