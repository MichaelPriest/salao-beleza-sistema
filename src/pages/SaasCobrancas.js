// src/pages/SaasCobrancas.js
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Payments as PaymentsIcon, ReceiptLong as ReceiptLongIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { metodoPagamentoLabel, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));
const formatDate = (value) => (value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '-');

function SaasCobrancas() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState('');
  const [faturaForm, setFaturaForm] = useState({ valor: '', vencimentoEm: '', descricao: 'Mensalidade SaaS' });
  const [autoForm, setAutoForm] = useState({ vencimentoEm: '' });

  const assinaturaPorEmpresa = useMemo(() => assinaturas.reduce((acc, assinatura) => ({ ...acc, [assinatura.empresaId || assinatura.id]: assinatura }), {}), [assinaturas]);

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
      setFaturas(faturasData);
      setPagamentos(pagamentosData);
      setEmpresaSelecionadaId((current) => current || empresasData[0]?.id || '');
    } catch (error) {
      console.error('Erro ao carregar cobranças SaaS:', error);
      toast.error(error.message || 'Erro ao carregar cobranças.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const criarFatura = async (event) => {
    event.preventDefault();
    if (!empresaSelecionadaId) return toast.error('Selecione uma empresa.');
    setSaving(true);
    try {
      const assinatura = assinaturaPorEmpresa[empresaSelecionadaId];
      const empresa = empresas.find((item) => item.id === empresaSelecionadaId);
      await saasService.criarFatura({
        empresaId: empresaSelecionadaId,
        assinaturaId: assinatura?.id || empresaSelecionadaId,
        valor: Number(faturaForm.valor || assinatura?.valorMensal || 0),
        vencimentoEm: faturaForm.vencimentoEm,
        descricao: faturaForm.descricao || `Mensalidade SaaS - ${empresa?.nome || empresaSelecionadaId}`,
        metodoPagamento: empresa?.cobranca?.metodoPreferencial || null,
      });
      setFaturaForm({ valor: '', vencimentoEm: '', descricao: 'Mensalidade SaaS' });
      toast.success('Fatura criada.');
      await carregar();
    } catch (error) {
      toast.error(error.message || 'Erro ao criar fatura.');
    } finally {
      setSaving(false);
    }
  };

  const confirmarPagamento = async (fatura) => {
    setSaving(true);
    try {
      await saasService.registrarPagamento({ empresaId: fatura.empresaId, faturaId: fatura.id, valor: fatura.valor, gateway: fatura.gateway || 'manual', metodoPagamento: fatura.metodoPagamento });
      toast.success('Pagamento confirmado.');
      await carregar();
    } catch (error) {
      toast.error(error.message || 'Erro ao confirmar pagamento.');
    } finally {
      setSaving(false);
    }
  };

  const gerarFaturasAutomaticas = async () => {
    setSaving(true);
    try {
      const novas = await saasService.gerarFaturasMensais({ assinaturas, empresas, vencimentoEm: autoForm.vencimentoEm || null });
      toast.success(`${novas.length} fatura(s) gerada(s).`);
      await carregar();
    } catch (error) {
      toast.error(error.message || 'Erro ao gerar faturas automáticas.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 800 }}>Cobranças SaaS</Typography><Typography color="text.secondary">Faturas, pagamentos e geração automática de mensalidades da plataforma.</Typography></Box>
        <Chip icon={<PaymentsIcon />} label={`${faturas.filter((f) => f.status !== 'paga').length} faturas abertas`} color="warning" />
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}><CardContent component="form" onSubmit={criarFatura}><Typography variant="h6" sx={{ mb: 2 }}>Criar fatura manual</Typography><Stack spacing={2}><TextField select required label="Empresa" value={empresaSelecionadaId} onChange={(event) => setEmpresaSelecionadaId(event.target.value)}>{empresas.map((empresa) => <MenuItem key={empresa.id} value={empresa.id}>{empresa.nome}</MenuItem>)}</TextField><TextField label="Valor" type="number" value={faturaForm.valor} onChange={(event) => setFaturaForm({ ...faturaForm, valor: event.target.value })} /><TextField label="Vencimento" type="datetime-local" InputLabelProps={{ shrink: true }} value={faturaForm.vencimentoEm} onChange={(event) => setFaturaForm({ ...faturaForm, vencimentoEm: event.target.value })} /><TextField label="Descrição" value={faturaForm.descricao} onChange={(event) => setFaturaForm({ ...faturaForm, descricao: event.target.value })} /><Button type="submit" variant="contained" disabled={saving} startIcon={<ReceiptLongIcon />}>Criar fatura</Button></Stack></CardContent></Card>
          <Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Automação mensal</Typography><Alert severity="info" sx={{ mb: 2 }}>Gera faturas para assinaturas em trial ou ativas usando o próximo vencimento da assinatura ou a data abaixo.</Alert><Stack spacing={2}><TextField label="Vencimento opcional" type="datetime-local" InputLabelProps={{ shrink: true }} value={autoForm.vencimentoEm} onChange={(event) => setAutoForm({ vencimentoEm: event.target.value })} /><Button variant="outlined" disabled={saving} onClick={gerarFaturasAutomaticas}>Gerar faturas automáticas</Button></Stack></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Empresa</TableCell><TableCell>Descrição</TableCell><TableCell>Valor</TableCell><TableCell>Status</TableCell><TableCell>Método</TableCell><TableCell>Vencimento</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead><TableBody>{faturas.map((fatura) => { const empresa = empresas.find((item) => item.id === fatura.empresaId); return <TableRow key={fatura.id}><TableCell>{empresa?.nome || fatura.empresaId}</TableCell><TableCell>{fatura.descricao}</TableCell><TableCell>{formatCurrency(fatura.valor, fatura.moeda)}</TableCell><TableCell><Chip size="small" label={fatura.status} color={fatura.status === 'paga' ? 'success' : 'warning'} /></TableCell><TableCell><Chip size="small" variant="outlined" label={fatura.metodoPagamentoLabel || metodoPagamentoLabel(fatura.metodoPagamento)} /></TableCell><TableCell>{formatDate(fatura.vencimentoEm)}</TableCell><TableCell align="right">{fatura.status !== 'paga' && <Button size="small" disabled={saving} onClick={() => confirmarPagamento(fatura)}>Confirmar pagamento</Button>}</TableCell></TableRow>; })}</TableBody></Table></TableContainer>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Pagamentos recentes</Typography><Stack spacing={1} divider={<Divider flexItem />}>{pagamentos.slice(0, 8).map((pagamento) => <Alert severity="success" key={pagamento.id}>{formatCurrency(pagamento.valor, pagamento.moeda)} via {pagamento.gateway} / {pagamento.metodoPagamentoLabel || metodoPagamentoLabel(pagamento.metodoPagamento)} em {formatDate(pagamento.pagoEm)}</Alert>)}</Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SaasCobrancas;
