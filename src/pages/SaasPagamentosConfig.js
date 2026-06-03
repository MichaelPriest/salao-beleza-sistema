// src/pages/SaasPagamentosConfig.js
import React, { useEffect, useState } from 'react';
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
  CreditCard as CreditCardIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import BillingPaymentForms from '../components/saas/BillingPaymentForms';
import { CONFIG_COBRANCA_PADRAO, saasService } from '../services/saasService';

const secretLabels = {
  stripe: ['STRIPE_SECRET_KEY'],
  mercadopago: ['MERCADOPAGO_ACCESS_TOKEN'],
  pagseguro: ['PAGSEGURO_TOKEN', 'PAGSEGURO_ENVIRONMENT', 'PAGSEGURO_NOTIFICATION_URL'],
  manual: ['BILLING_MANUAL_INSTRUCTIONS'],
};

function SaasPagamentosConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(CONFIG_COBRANCA_PADRAO);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const data = await saasService.buscarConfigCobranca();
        setConfig(data);
      } catch (error) {
        console.error('Erro ao carregar configuração de pagamentos:', error);
        toast.error(error.message || 'Erro ao carregar configuração.');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const salvar = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await saasService.salvarConfigCobranca(config);
      setConfig(data);
      toast.success('APIs e formas de pagamento configuradas.');
    } catch (error) {
      console.error('Erro ao salvar APIs de pagamento:', error);
      toast.error(error.message || 'Erro ao salvar configuração.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Configurar APIs de pagamento</Typography>
          <Typography color="text.secondary">Defina gateway, automação, cartão, PIX, boleto e variáveis necessárias para Stripe, Mercado Pago, PagSeguro/PagBank ou cobrança manual.</Typography>
        </Box>
        <Chip icon={<CreditCardIcon />} label={config.provider} color="primary" />
      </Stack>

      <Alert severity="warning" sx={{ mb: 3 }} icon={<SecurityIcon />}>
        Por segurança, esta página não grava chaves secret no Supabase. Configure as chaves no ambiente do servidor/Vercel e use esta tela para escolher o provedor, formas de pagamento e comportamento automático.
      </Alert>

      <Card>
        <CardContent component="form" onSubmit={salvar}>
          <BillingPaymentForms value={config} onChange={setConfig} mode="platform" />

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Variáveis que precisam existir no servidor</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} flexWrap="wrap">
                {(secretLabels[config.provider] || []).map((label) => <Chip key={label} label={label} variant="outlined" />)}
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={saving} startIcon={<SaveIcon />}>Salvar configuração</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SaasPagamentosConfig;
