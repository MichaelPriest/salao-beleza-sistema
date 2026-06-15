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
import { METODOS_PAGAMENTO_COBRANCA, PROVEDORES_COBRANCA, metodosAtivosNoGateway, primeiroMetodoDisponivel } from '../../services/saasService';

export const PAYMENT_METHODS = METODOS_PAGAMENTO_COBRANCA.map((metodo) => ({
  ...metodo,
  label: metodo.id === 'card' ? 'Cartão de crédito/débito' : metodo.nome
}));

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
  const provedoresAutomaticos = PROVEDORES_COBRANCA.filter((provedor) => provedor.id !== 'manual');
  const provider = config.provider && config.provider !== 'manual' ? config.provider : provedoresAutomaticos[0]?.id || 'stripe';
  const metodos = metodosAtivosNoGateway(provider, config.metodosPagamento || { card: true, pix: true, boleto: true });

  const setConfig = (patch) => onChange({ ...config, ...patch });
  const setProvider = (nextProvider) => {
    const nextMethods = metodosAtivosNoGateway(nextProvider, config.metodosPagamento || { card: true, pix: true, boleto: true });
    setConfig({ provider: nextProvider, metodosPagamento: nextMethods, metodoPreferencial: primeiroMetodoDisponivel(nextMethods) });
  };
  const setSection = (section, patch) => onChange(updateNested(config, section, patch));
  const toggleMetodo = (metodo, checked) => {
    const nextMethods = metodosAtivosNoGateway(provider, { ...metodos, [metodo]: checked });
    const nextPreferred = nextMethods[config.metodoPreferencial] !== false ? config.metodoPreferencial : primeiroMetodoDisponivel(nextMethods);
    setConfig({ metodosPagamento: nextMethods, metodoPreferencial: nextPreferred });
  };
  const metodosDisponiveis = metodosAtivosNoGateway(provider, config.metodosDisponiveis || metodos);
  const enabledTenantMethods = PAYMENT_METHODS.filter((metodo) => metodosDisponiveis[metodo.id] !== false);
  const selectedTenantMethod = enabledTenantMethods.some((metodo) => metodo.id === config.metodoPreferencial)
    ? config.metodoPreferencial
    : enabledTenantMethods[0]?.id || 'card';
  const setTenantMethod = (metodo) => setConfig({ metodoPreferencial: metodo });
  const setDadosCobranca = (patch) => setSection('dadosCobranca', patch);
  const enderecoCobranca = typeof config.dadosCobranca?.endereco === 'object' && config.dadosCobranca.endereco !== null
    ? config.dadosCobranca.endereco
    : { logradouro: config.dadosCobranca?.endereco || '' };
  const setEnderecoCobranca = (patch) => setDadosCobranca({ endereco: { ...enderecoCobranca, ...patch } });

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
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="CEP" value={enderecoCobranca.cep || enderecoCobranca.zipCode || ''} onChange={(e) => setEnderecoCobranca({ cep: e.target.value })} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Endereço de cobrança" value={enderecoCobranca.logradouro || enderecoCobranca.street || ''} onChange={(e) => setEnderecoCobranca({ logradouro: e.target.value })} />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField fullWidth label="Número" value={enderecoCobranca.numero || enderecoCobranca.number || ''} onChange={(e) => setEnderecoCobranca({ numero: e.target.value })} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Bairro" value={enderecoCobranca.bairro || enderecoCobranca.district || ''} onChange={(e) => setEnderecoCobranca({ bairro: e.target.value })} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Cidade" value={enderecoCobranca.cidade || enderecoCobranca.city || ''} onChange={(e) => setEnderecoCobranca({ cidade: e.target.value })} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Estado/UF" value={enderecoCobranca.estado || enderecoCobranca.state || ''} onChange={(e) => setEnderecoCobranca({ estado: e.target.value })} />
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
        <TextField select fullWidth label="Gateway padrão" value={provider} onChange={(e) => setProvider(e.target.value)}>
          {provedoresAutomaticos.map((provedor) => <MenuItem key={provedor.id} value={provedor.id}>{provedor.nome}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth type="number" label="Dias antes do vencimento" value={config.diasAntesVencimento || 0} onChange={(e) => setConfig({ diasAntesVencimento: Number(e.target.value || 0) })} />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth type="number" label="Dia padrão de vencimento" value={config.diaVencimentoPadrao || 1} onChange={(e) => setConfig({ diaVencimentoPadrao: Number(e.target.value || 1) })} />
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControlLabel control={<Switch checked disabled />} label="Checkout automático sempre ativo" />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel control={<Switch checked disabled />} label="Faturas automáticas sempre ativas" />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField select fullWidth label="Ambiente PagSeguro/PagBank" value={config.pagseguro?.environment || 'sandbox'} onChange={(e) => setSection('pagseguro', { environment: e.target.value })}>
          <MenuItem value="sandbox">Sandbox</MenuItem>
          <MenuItem value="production">Produção</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Formas de pagamento liberadas no gateway ativo</Typography>
        <Typography variant="body2" color="text.secondary">A empresa só poderá escolher métodos suportados e ativados para o gateway selecionado.</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
          {PAYMENT_METHODS.map((metodo) => (
            <FormControlLabel
              key={metodo.id}
              control={<Switch checked={metodos[metodo.id] !== false} disabled={metodosAtivosNoGateway(provider, { [metodo.id]: true })[metodo.id] === false} onChange={(e) => toggleMetodo(metodo.id, e.target.checked)} />}
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
        <TextField fullWidth multiline minRows={2} label="Mensagem de fallback quando o gateway não retornar link" value={config.instrucoesManual || ''} onChange={(e) => setConfig({ instrucoesManual: e.target.value })} />
      </Grid>

      <Grid item xs={12}>
        <Alert severity={isTenant ? 'info' : 'warning'}>
          {isTenant
            ? 'A empresa pode escolher preferências de cobrança, formas de pagamento e dados para cartão/PIX/boleto. O checkout real usa o gateway ativo da plataforma.'
            : 'Chaves secret continuam somente no servidor/Vercel. Esta tela salva preferências públicas do gateway; a geração de faturas e a baixa de pagamentos seguem o fluxo automático do sistema.'}
        </Alert>
      </Grid>
    </Grid>
  );
}

export default BillingPaymentForms;
