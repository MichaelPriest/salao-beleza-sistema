// src/pages/SaasCobrancas.js
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Autorenew as AutorenewIcon, Launch as LaunchIcon, Payments as PaymentsIcon } from '@mui/icons-material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { metodoPagamentoLabel, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));
const formatDate = (value) => (value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '-');
const isVencida = (fatura) => fatura.status !== 'paga' && fatura.vencimentoEm && new Date(fatura.vencimentoEm) < new Date();

function SaasCobrancas() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [checkoutLinks, setCheckoutLinks] = useState({});

  const assinaturaPorEmpresa = useMemo(() => assinaturas.reduce((acc, assinatura) => ({ ...acc, [assinatura.empresaId || assinatura.id]: assinatura }), {}), [assinaturas]);
  const stats = useMemo(() => ({
    abertas: faturas.filter((fatura) => fatura.status !== 'paga').length,
    vencidas: faturas.filter(isVencida).length,
    pagas: faturas.filter((fatura) => fatura.status === 'paga').length,
    receitaConfirmada: pagamentos.reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0)
  }), [faturas, pagamentos]);

  const carregar = async () => {
    setLoading(true);
    try {
      const [empresasData, assinaturasData, faturasData, pagamentosData] = await Promise.all([
        firebaseService.getAll('empresas').catch(() => []),
        firebaseService.getAll('assinaturas').catch(() => []),
        firebaseService.getAll('faturas_saas').catch(() => []),
        firebaseService.getAll('pagamentos_saas').catch(() => []),
      ]);
      setEmpresas(empresasData);
      setAssinaturas(assinaturasData);
      setFaturas((faturasData || []).sort((a, b) => new Date(b.vencimentoEm || b.createdAt || 0) - new Date(a.vencimentoEm || a.createdAt || 0)));
      setPagamentos((pagamentosData || []).sort((a, b) => new Date(b.pagoEm || b.createdAt || 0) - new Date(a.pagoEm || a.createdAt || 0)));
    } catch (error) {
      console.error('Erro ao carregar cobranças SaaS:', error);
      toast.error(error.message || 'Erro ao carregar cobranças.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const iniciarCheckoutFatura = async (fatura) => {
    setSaving(true);
    try {
      const assinatura = assinaturaPorEmpresa[fatura.empresaId];
      const empresa = empresas.find((item) => item.id === fatura.empresaId);
      const checkout = await saasService.iniciarCheckout({
        empresaId: fatura.empresaId,
        planoId: assinatura?.planoId || empresa?.planoId,
        provider: fatura.gateway || empresa?.cobranca?.provider || null,
        metodosPagamento: fatura.metodosPagamento || null,
        dadosPagamento: { metodoPreferencial: fatura.metodoPagamento || empresa?.cobranca?.metodoPreferencial || null }
      });
      setCheckoutLinks((current) => ({ ...current, [fatura.id]: checkout.checkoutUrl || checkout.instrucoes || '' }));
      if (checkout.checkoutUrl) window.open(checkout.checkoutUrl, '_blank', 'noopener,noreferrer');
      toast.success('Checkout automático iniciado. A baixa será feita por gateway/webhook.');
    } catch (error) {
      toast.error(error.message || 'Erro ao iniciar checkout automático.');
    } finally {
      setSaving(false);
    }
  };

  const processarCobrancasAutomaticas = async () => {
    setSaving(true);
    try {
      const novas = await saasService.processarCobrancasAutomaticas({ assinaturas, empresas });
      toast.success(novas.length > 0 ? `${novas.length} cobrança(s) automática(s) gerada(s).` : 'Nenhuma assinatura com cobrança vencendo agora.');
      await carregar();
    } catch (error) {
      toast.error(error.message || 'Erro ao processar cobranças automáticas.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Cobranças SaaS</Typography>
          <Typography color="text.secondary">Gestão automática de faturas, checkouts e confirmações por gateway/webhook.</Typography>
        </Box>
        <Chip icon={<PaymentsIcon />} label={`${stats.abertas} faturas abertas`} color={stats.vencidas > 0 ? 'error' : 'warning'} />
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Faturas abertas</Typography><Typography variant="h5" sx={{ fontWeight: 800 }}>{stats.abertas}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Vencidas</Typography><Typography variant="h5" color="error" sx={{ fontWeight: 800 }}>{stats.vencidas}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Pagas</Typography><Typography variant="h5" color="success.main" sx={{ fontWeight: 800 }}>{stats.pagas}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Receita confirmada</Typography><Typography variant="h5" sx={{ fontWeight: 800 }}>{formatCurrency(stats.receitaConfirmada)}</Typography></CardContent></Card></Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h6">Automação de cobrança</Typography>
              <Typography color="text.secondary">As faturas são geradas pelo sistema a partir das assinaturas ativas/trial e não existe criação manual para evitar divergência de valores, vencimentos ou empresa.</Typography>
            </Box>
            <Button variant="contained" disabled={saving} startIcon={<AutorenewIcon />} onClick={processarCobrancasAutomaticas}>Processar agora</Button>
          </Stack>
          <Alert severity="info" sx={{ mt: 2 }}>Use este botão apenas como processamento administrativo da rotina automática. Pagamentos devem ser confirmados por checkout/gateway/webhook, não por baixa manual.</Alert>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow><TableCell>Empresa</TableCell><TableCell>Descrição</TableCell><TableCell>Valor</TableCell><TableCell>Status</TableCell><TableCell>Método</TableCell><TableCell>Vencimento</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead>
              <TableBody>
                {faturas.map((fatura) => {
                  const empresa = empresas.find((item) => item.id === fatura.empresaId);
                  return (
                    <TableRow key={fatura.id} selected={isVencida(fatura)}>
                      <TableCell>{empresa?.nome || fatura.empresaId}</TableCell>
                      <TableCell>{fatura.descricao}{checkoutLinks[fatura.id] && <Alert severity="info" sx={{ mt: 1 }}>Checkout gerado: {checkoutLinks[fatura.id]}</Alert>}</TableCell>
                      <TableCell>{formatCurrency(fatura.valor, fatura.moeda)}</TableCell>
                      <TableCell><Chip size="small" label={isVencida(fatura) ? 'vencida' : fatura.status} color={fatura.status === 'paga' ? 'success' : isVencida(fatura) ? 'error' : 'warning'} /></TableCell>
                      <TableCell><Chip size="small" variant="outlined" label={fatura.metodoPagamentoLabel || metodoPagamentoLabel(fatura.metodoPagamento)} /></TableCell>
                      <TableCell>{formatDate(fatura.vencimentoEm)}</TableCell>
                      <TableCell align="right">{fatura.status !== 'paga' ? <Button size="small" variant="contained" startIcon={<LaunchIcon />} disabled={saving} onClick={() => iniciarCheckoutFatura(fatura)}>Checkout</Button> : <Chip size="small" color="success" label="Confirmada" />}</TableCell>
                    </TableRow>
                  );
                })}
                {faturas.length === 0 && <TableRow><TableCell colSpan={7}><Alert severity="info">Nenhuma fatura gerada ainda. A rotina automática criará cobranças quando houver assinaturas aptas.</Alert></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}><ReceiptLongIcon color="primary" /><Typography variant="h6">Pagamentos recentes</Typography></Stack>
              <Stack spacing={1} divider={<Divider flexItem />}>
                {pagamentos.slice(0, 8).map((pagamento) => <Alert severity="success" key={pagamento.id}>{formatCurrency(pagamento.valor, pagamento.moeda)} via {pagamento.gateway} / {pagamento.metodoPagamentoLabel || metodoPagamentoLabel(pagamento.metodoPagamento)} em {formatDate(pagamento.pagoEm)}</Alert>)}
                {pagamentos.length === 0 && <Alert severity="info">Nenhum pagamento confirmado por gateway/webhook ainda.</Alert>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SaasCobrancas;
