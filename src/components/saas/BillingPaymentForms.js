// src/components/saas/BillingPaymentForms.js
import React from 'react';
import {
  Alert,
  Box,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { PROVEDORES_COBRANCA } from '../../services/saasService';

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Cartão de crédito/débito' },
  { id: 'pix', label: 'PIX' },
  { id: 'boleto', label: 'Boleto' },
];

const updateNested = (value, section, patch) => ({
  ...value,
  [section]: {
    ...(value?.[section] || {}),
    ...patch,
  },
});

function BillingPaymentForms({ value, onChange, mode = 'platform' }) {
  const config = value || {};
  const isTenant = mode === 'tenant';
  const provider = config.provider || 'manual';
  const metodos = config.metodosPagamento || { card: true, pix: true, boleto: true };

  const setConfig = (patch) => onChange({ ...config, ...patch });
  const setSection = (section, patch) => onChange(updateNested(config, section, patch));
  const toggleMetodo = (metodo, checked) => setConfig({ metodosPagamento: { ...metodos, [metodo]: checked } });
  const metodosDisponiveis = config.metodosDisponiveis || metodos;
  const enabledTenantMethods = PAYMENT_METHODS.filter((metodo) => metodosDisponiveis[metodo.id] !== false);
  const selectedTenantMethod = enabledTenantMethods.some((metodo) => metodo.id === config.metodoPreferencial)
    ? config.metodoPreferencial
    : enabledTenantMethods[0]?.id || 'card';
  const setTenantMethod = (metodo) => setConfig({ metodoPreferencial: metodo });
  const setDadosCobranca = (patch) => setSection('dadosCobranca', patch);

  if (isTenant) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Método de cobrança da mensalidade</Typography>
          <Typography variant="body2" color="text.secondary">Escolha como esta empresa quer pagar a assinatura do sistema. O gateway é configurado somente pelo admin SaaS da plataforma.</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField select fullWidth label="Método preferencial" value={selectedTenantMethod} onChange={(e) => setTenantMethod(e.target.value)}>
            {enabledTenantMethods.map((metodo) => <MenuItem key={metodo.id} value={metodo.id}>{metodo.label}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth type="number" label="Dia de vencimento" value={config.diaVencimentoPadrao || 5} onChange={(e) => setConfig({ diaVencimentoPadrao: Number(e.target.value || 5) })} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="E-mail para cobrança" value={config.dadosCobranca?.email || ''} onChange={(e) => setDadosCobranca({ email: e.target.value })} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Nome do responsável financeiro" value={config.dadosCobranca?.responsavel || ''} onChange={(e) => setDadosCobranca({ responsavel: e.target.value })} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="CPF/CNPJ para cobrança" value={config.dadosCobranca?.documento || ''} onChange={(e) => setDadosCobranca({ documento: e.target.value })} />
        </Grid>
        {selectedTenantMethod === 'card' && (
          <Grid item xs={12}>
            <Alert severity="info">Cartão selecionado. Os dados sensíveis do cartão devem ser informados no checkout seguro do gateway; o sistema salva apenas a preferência de cobrança.</Alert>
          </Grid>
        )}
        {selectedTenantMethod === 'pix' && (
          <Grid item xs={12}>
            <Alert severity="info">PIX selecionado. A cobrança automática gerará QR Code/link PIX pelo gateway habilitado pela plataforma.</Alert>
          </Grid>
        )}
        {selectedTenantMethod === 'boleto' && (
          <Grid item xs={12}>
            <Alert severity="info">Boleto selecionado. A cobrança automática gerará boleto pelo gateway habilitado pela plataforma.</Alert>
          </Grid>
        )}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <TextField select fullWidth label="Gateway padrão" value={provider} onChange={(e) => setConfig({ provider: e.target.value })}>
          {PROVEDORES_COBRANCA.map((provedor) => <MenuItem key={provedor.id} value={provedor.id}>{provedor.nome}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth type="number" label="Dias antes do vencimento" value={config.diasAntesVencimento || 0} onChange={(e) => setConfig({ diasAntesVencimento: Number(e.target.value || 0) })} />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth type="number" label="Dia padrão de vencimento" value={config.diaVencimentoPadrao || 1} onChange={(e) => setConfig({ diaVencimentoPadrao: Number(e.target.value || 1) })} />
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControlLabel control={<Switch checked={Boolean(config.modoAutomatico)} onChange={(e) => setConfig({ modoAutomatico: e.target.checked })} />} label="Checkout automático" />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel control={<Switch checked={Boolean(config.gerarFaturaAutomaticamente)} onChange={(e) => setConfig({ gerarFaturaAutomaticamente: e.target.checked })} />} label="Gerar faturas automaticamente" />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField select fullWidth label="Ambiente PagSeguro/PagBank" value={config.pagseguro?.environment || 'sandbox'} onChange={(e) => setSection('pagseguro', { environment: e.target.value })}>
          <MenuItem value="sandbox">Sandbox</MenuItem>
          <MenuItem value="production">Produção</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Formas de pagamento liberadas</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
          {PAYMENT_METHODS.map((metodo) => (
            <FormControlLabel
              key={metodo.id}
              control={<Switch checked={metodos[metodo.id] !== false} onChange={(e) => toggleMetodo(metodo.id, e.target.checked)} />}
              label={metodo.label}
            />
          ))}
        </Stack>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField fullWidth label="Path sucesso" value={config.successPath || ''} onChange={(e) => setConfig({ successPath: e.target.value })} />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth label="Path cancelamento" value={config.cancelPath || ''} onChange={(e) => setConfig({ cancelPath: e.target.value })} />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth label="Path webhook" value={config.webhookPath || ''} onChange={(e) => setConfig({ webhookPath: e.target.value })} />
      </Grid>

      {provider === 'stripe' && (
        <Grid item xs={12}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Stripe</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><FormControlLabel control={<Switch checked={Boolean(config.stripe?.enabled)} onChange={(e) => setSection('stripe', { enabled: e.target.checked })} />} label="Stripe ativo" /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Price ID padrão" value={config.stripe?.priceId || ''} onChange={(e) => setSection('stripe', { priceId: e.target.value })} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Customer Portal URL" value={config.stripe?.portalUrl || ''} onChange={(e) => setSection('stripe', { portalUrl: e.target.value })} /></Grid>
            </Grid>
          </Box>
        </Grid>
      )}

      {provider === 'mercadopago' && (
        <Grid item xs={12}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Mercado Pago</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><FormControlLabel control={<Switch checked={Boolean(config.mercadopago?.enabled)} onChange={(e) => setSection('mercadopago', { enabled: e.target.checked })} />} label="Mercado Pago ativo" /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Collector ID" value={config.mercadopago?.collectorId || ''} onChange={(e) => setSection('mercadopago', { collectorId: e.target.value })} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Statement descriptor" value={config.mercadopago?.statementDescriptor || ''} onChange={(e) => setSection('mercadopago', { statementDescriptor: e.target.value })} /></Grid>
            </Grid>
          </Box>
        </Grid>
      )}

      {provider === 'pagseguro' && (
        <Grid item xs={12}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>PagSeguro/PagBank</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><FormControlLabel control={<Switch checked={Boolean(config.pagseguro?.enabled)} onChange={(e) => setSection('pagseguro', { enabled: e.target.checked })} />} label="PagSeguro ativo" /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Seller ID / Merchant" value={config.pagseguro?.sellerId || ''} onChange={(e) => setSection('pagseguro', { sellerId: e.target.value })} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="URL de notificação" value={config.pagseguro?.notificationUrl || ''} onChange={(e) => setSection('pagseguro', { notificationUrl: e.target.value })} /></Grid>
            </Grid>
          </Box>
        </Grid>
      )}

      <Grid item xs={12}>
        <TextField fullWidth multiline minRows={2} label="Instruções de cobrança manual" value={config.instrucoesManual || ''} onChange={(e) => setConfig({ instrucoesManual: e.target.value })} />
      </Grid>

      <Grid item xs={12}>
        <Alert severity={isTenant ? 'info' : 'warning'}>
          {isTenant
            ? 'A empresa pode escolher preferências de cobrança, formas de pagamento e dados para cartão/PIX/boleto. O checkout real usa o gateway ativo da plataforma.'
            : 'Chaves secret continuam somente no servidor/Vercel. Esta tela salva preferências, caminhos, métodos e metadados públicos do gateway.'}
        </Alert>
      </Grid>
    </Grid>
  );
}

export default BillingPaymentForms;
