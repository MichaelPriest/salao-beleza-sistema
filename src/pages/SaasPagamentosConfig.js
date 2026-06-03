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
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { CONFIG_COBRANCA_PADRAO, PROVEDORES_COBRANCA, saasService } from '../services/saasService';

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
      toast.success('APIs de pagamento configuradas.');
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
          <Typography color="text.secondary">Defina gateway padrão, automação e variáveis necessárias para Stripe, Mercado Pago, PagSeguro/PagBank ou cobrança manual.</Typography>
        </Box>
        <Chip icon={<CreditCardIcon />} label={config.provider} color="primary" />
      </Stack>

      <Alert severity="warning" sx={{ mb: 3 }} icon={<SecurityIcon />}>
        Por segurança, esta página não grava chaves secret no Supabase. Configure as chaves no ambiente do servidor/Vercel e use esta tela apenas para escolher o provedor e comportamento automático.
      </Alert>

      <Card>
        <CardContent component="form" onSubmit={salvar}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Gateway padrão" value={config.provider} onChange={(e) => setConfig({ ...config, provider: e.target.value })}>
                {PROVEDORES_COBRANCA.map((provedor) => <MenuItem key={provedor.id} value={provedor.id}>{provedor.nome}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Dias antes do vencimento" value={config.diasAntesVencimento} onChange={(e) => setConfig({ ...config, diasAntesVencimento: Number(e.target.value || 0) })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Dia padrão de vencimento" value={config.diaVencimentoPadrao} onChange={(e) => setConfig({ ...config, diaVencimentoPadrao: Number(e.target.value || 1) })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel control={<Switch checked={Boolean(config.modoAutomatico)} onChange={(e) => setConfig({ ...config, modoAutomatico: e.target.checked })} />} label="Checkout automático" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel control={<Switch checked={Boolean(config.gerarFaturaAutomaticamente)} onChange={(e) => setConfig({ ...config, gerarFaturaAutomaticamente: e.target.checked })} />} label="Gerar faturas automaticamente" />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Ambiente PagSeguro/PagBank" value={config.pagseguro?.environment || 'sandbox'} onChange={(e) => setConfig({ ...config, pagseguro: { ...(config.pagseguro || {}), environment: e.target.value } })}>
                <MenuItem value="sandbox">Sandbox</MenuItem>
                <MenuItem value="production">Produção</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Path sucesso" value={config.successPath} onChange={(e) => setConfig({ ...config, successPath: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Path cancelamento" value={config.cancelPath} onChange={(e) => setConfig({ ...config, cancelPath: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Path webhook" value={config.webhookPath} onChange={(e) => setConfig({ ...config, webhookPath: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={2} label="Instruções cobrança manual" value={config.instrucoesManual} onChange={(e) => setConfig({ ...config, instrucoesManual: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Variáveis esperadas para o provedor selecionado: {(secretLabels[config.provider] || []).map((item) => <Chip key={item} label={item} size="small" sx={{ mx: 0.5 }} />)}
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={saving} startIcon={<SaveIcon />}>Salvar configuração das APIs</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SaasPagamentosConfig;
