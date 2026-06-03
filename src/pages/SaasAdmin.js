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
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  Business as BusinessIcon,
  CreditCard as CreditCardIcon,
  ReceiptLong as ReceiptLongIcon,
  Refresh as RefreshIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { PLANOS_PADRAO, STATUS_ASSINATURA, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
};

const getStatusColor = (status) => {
  const colors = {
    [STATUS_ASSINATURA.TRIAL]: 'info',
    [STATUS_ASSINATURA.ATIVA]: 'success',
    [STATUS_ASSINATURA.PENDENTE]: 'warning',
    [STATUS_ASSINATURA.INADIMPLENTE]: 'error',
    [STATUS_ASSINATURA.CANCELADA]: 'default',
    [STATUS_ASSINATURA.EXPIRADA]: 'error',
  };
  return colors[status] || 'default';
};

function SaasAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState('');
  const [faturaForm, setFaturaForm] = useState({ valor: '', vencimentoEm: '', descricao: 'Mensalidade SaaS' });

  const assinaturaPorEmpresa = useMemo(() => {
    return assinaturas.reduce((acc, assinatura) => ({ ...acc, [assinatura.empresaId || assinatura.id]: assinatura }), {});
  }, [assinaturas]);

  const planoPorId = useMemo(() => {
    const todos = [...Object.values(PLANOS_PADRAO), ...planos];
    return todos.reduce((acc, plano) => ({ ...acc, [plano.id]: plano }), {});
  }, [planos]);

  const totais = useMemo(() => {
    const receitaMensal = assinaturas
      .filter((assinatura) => [STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(assinatura.status))
      .reduce((total, assinatura) => total + Number(assinatura.valorMensal || 0), 0);

    return {
      empresas: empresas.length,
      unidades: unidades.length,
      assinaturasAtivas: assinaturas.filter((assinatura) => [STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(assinatura.status)).length,
      faturasAbertas: faturas.filter((fatura) => fatura.status !== 'paga').length,
      receitaMensal,
    };
  }, [assinaturas, empresas.length, faturas, unidades.length]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [empresasData, unidadesData, assinaturasData, faturasData, planosData] = await Promise.all([
        firebaseService.getAll('empresas').catch(() => []),
        firebaseService.getAll('unidades').catch(() => []),
        firebaseService.getAll('assinaturas').catch(() => []),
        firebaseService.getAll('faturas_saas').catch(() => []),
        saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO)),
      ]);

      setEmpresas(empresasData);
      setUnidades(unidadesData);
      setAssinaturas(assinaturasData);
      setFaturas(faturasData);
      setPlanos(planosData);
      setEmpresaSelecionadaId((current) => current || empresasData[0]?.id || '');
    } catch (error) {
      console.error('Erro ao carregar admin SaaS:', error);
      toast.error(error.message || 'Erro ao carregar admin SaaS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const atualizarStatusAssinatura = async (assinatura, status) => {
    setSaving(true);
    try {
      await firebaseService.update('assinaturas', assinatura.id || assinatura.empresaId, {
        status,
        updatedAt: new Date().toISOString(),
      });
      toast.success('Status da assinatura atualizado.');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      toast.error(error.message || 'Erro ao atualizar assinatura.');
    } finally {
      setSaving(false);
    }
  };

  const criarFatura = async (event) => {
    event.preventDefault();
    if (!empresaSelecionadaId) {
      toast.error('Selecione uma empresa.');
      return;
    }

    setSaving(true);
    try {
      const assinatura = assinaturaPorEmpresa[empresaSelecionadaId];
      await saasService.criarFatura({
        empresaId: empresaSelecionadaId,
        assinaturaId: assinatura?.id || empresaSelecionadaId,
        valor: Number(faturaForm.valor || assinatura?.valorMensal || 0),
        vencimentoEm: faturaForm.vencimentoEm,
        descricao: faturaForm.descricao,
      });
      setFaturaForm({ valor: '', vencimentoEm: '', descricao: 'Mensalidade SaaS' });
      toast.success('Fatura criada para a empresa.');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao criar fatura SaaS admin:', error);
      toast.error(error.message || 'Erro ao criar fatura.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 360 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Admin SaaS da plataforma
          </Typography>
          <Typography color="text.secondary">
            Área isolada para operar empresas contratantes, assinaturas e cobrança do produto SaaS.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={carregarDados}>Atualizar</Button>
      </Stack>

      <Alert severity="warning" sx={{ mb: 3 }}>
        Esta área é da plataforma SaaS. Ela não altera o contexto ativo de uma empresa cliente e deve ser liberada apenas para usuários `admin_saas`, `saas_admin`, `admin_plataforma` ou `superadmin`.
      </Alert>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}><Card><CardContent><BusinessIcon color="primary" /><Typography variant="h5">{totais.empresas}</Typography><Typography color="text.secondary">Empresas</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent><ApartmentIcon color="primary" /><Typography variant="h5">{totais.unidades}</Typography><Typography color="text.secondary">Unidades</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent><WorkspacePremiumIcon color="primary" /><Typography variant="h5">{totais.assinaturasAtivas}</Typography><Typography color="text.secondary">Assinaturas ativas/trial</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent><ReceiptLongIcon color="primary" /><Typography variant="h5">{totais.faturasAbertas}</Typography><Typography color="text.secondary">Faturas abertas</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent><CreditCardIcon color="primary" /><Typography variant="h5">{formatCurrency(totais.receitaMensal)}</Typography><Typography color="text.secondary">MRR estimado</Typography></CardContent></Card></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Empresas contratantes</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Empresa</TableCell>
                      <TableCell>Plano</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Unidades</TableCell>
                      <TableCell>Próx. cobrança</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {empresas.map((empresa) => {
                      const assinatura = assinaturaPorEmpresa[empresa.id];
                      const plano = planoPorId[assinatura?.planoId || empresa.planoId] || PLANOS_PADRAO.individual;
                      const totalUnidades = unidades.filter((unidade) => unidade.empresaId === empresa.id).length;

                      return (
                        <TableRow key={empresa.id} selected={empresaSelecionadaId === empresa.id}>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600 }}>{empresa.nome}</Typography>
                            <Typography variant="caption" color="text.secondary">{empresa.email || empresa.documento || empresa.id}</Typography>
                          </TableCell>
                          <TableCell>{plano.nome}</TableCell>
                          <TableCell><Chip size="small" label={assinatura?.status || 'sem assinatura'} color={getStatusColor(assinatura?.status)} /></TableCell>
                          <TableCell>{totalUnidades}</TableCell>
                          <TableCell>{formatDate(assinatura?.proximaCobrancaEm)}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button size="small" onClick={() => setEmpresaSelecionadaId(empresa.id)}>Selecionar</Button>
                              {assinatura && assinatura.status !== STATUS_ASSINATURA.ATIVA && (
                                <Button size="small" disabled={saving} onClick={() => atualizarStatusAssinatura(assinatura, STATUS_ASSINATURA.ATIVA)}>Ativar</Button>
                              )}
                              {assinatura && assinatura.status !== STATUS_ASSINATURA.INADIMPLENTE && (
                                <Button size="small" color="warning" disabled={saving} onClick={() => atualizarStatusAssinatura(assinatura, STATUS_ASSINATURA.INADIMPLENTE)}>Inadimplente</Button>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent component="form" onSubmit={criarFatura}>
              <Typography variant="h6" sx={{ mb: 2 }}>Criar fatura para empresa</Typography>
              <Stack spacing={2}>
                <TextField select required label="Empresa" value={empresaSelecionadaId} onChange={(event) => setEmpresaSelecionadaId(event.target.value)}>
                  {empresas.map((empresa) => <MenuItem key={empresa.id} value={empresa.id}>{empresa.nome}</MenuItem>)}
                </TextField>
                <TextField label="Valor" type="number" value={faturaForm.valor} onChange={(event) => setFaturaForm({ ...faturaForm, valor: event.target.value })} />
                <TextField label="Vencimento" type="datetime-local" InputLabelProps={{ shrink: true }} value={faturaForm.vencimentoEm} onChange={(event) => setFaturaForm({ ...faturaForm, vencimentoEm: event.target.value })} />
                <TextField label="Descrição" value={faturaForm.descricao} onChange={(event) => setFaturaForm({ ...faturaForm, descricao: event.target.value })} />
                <Button type="submit" variant="contained" disabled={saving}>Criar fatura</Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Faturas recentes</Typography>
              <Stack spacing={1} divider={<Divider flexItem />}>
                {faturas.slice(0, 8).map((fatura) => {
                  const empresa = empresas.find((item) => item.id === fatura.empresaId);
                  return (
                    <Box key={fatura.id}>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography sx={{ fontWeight: 600 }}>{empresa?.nome || fatura.empresaId}</Typography>
                        <Chip size="small" label={fatura.status} color={fatura.status === 'paga' ? 'success' : 'warning'} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{formatCurrency(fatura.valor, fatura.moeda)} · venc. {formatDate(fatura.vencimentoEm)}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SaasAdmin;
