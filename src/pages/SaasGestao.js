// src/pages/SaasGestao.js
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
  Tab,
  Tabs,
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
  CheckCircle as CheckCircleIcon,
  ContentCopy as ContentCopyIcon,
  CreditCard as CreditCardIcon,
  DomainAdd as DomainAddIcon,
  Language as LanguageIcon,
  Launch as LaunchIcon,
  ReceiptLong as ReceiptLongIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { firebaseService, setTenantContext } from '../services/firebase';
import { PLANOS_PADRAO, STATUS_ASSINATURA, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
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

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ mt: 3 }}>{children}</Box>;
}

function SaasGestao({ initialTab = 0 }) {
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [planos, setPlanos] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [assinatura, setAssinatura] = useState(null);
  const [faturas, setFaturas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [checkout, setCheckout] = useState(null);
  const [empresaForm, setEmpresaForm] = useState({ nome: '', documento: '', razaoSocial: '', email: '', telefone: '', planoId: 'individual', responsavelFinanceiro: '', emailFinanceiro: '', telefoneFinanceiro: '', documentoCobranca: '', enderecoCobranca: '', diaVencimento: 5, observacoesCobranca: '' });
  const [unidadeForm, setUnidadeForm] = useState({ nome: '', telefone: '', endereco: '' });
  const [faturaForm, setFaturaForm] = useState({ valor: '', vencimentoEm: '', descricao: 'Mensalidade SaaS' });
  const [portalForm, setPortalForm] = useState({
    slug: '',
    titulo: '',
    subtitulo: 'Agende seus serviços online com facilidade.',
    corPrimaria: '#9c27b0',
    ativo: true,
    mostrarServicos: true,
    mostrarProfissionais: true,
  });

  const planoAtual = useMemo(() => {
    const planoId = assinatura?.planoId || empresa?.planoId || empresaForm.planoId;
    return planos.find((plano) => plano.id === planoId) || PLANOS_PADRAO[planoId] || PLANOS_PADRAO.individual;
  }, [assinatura?.planoId, empresa?.planoId, empresaForm.planoId, planos]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const contexto = saasService.getContextoAtual();
      const planosData = await saasService.listarPlanos();
      setPlanos(planosData);

      if (!contexto.empresaId) {
        setEmpresa(null);
        setUnidades([]);
        setAssinatura(null);
        setFaturas([]);
        setPagamentos([]);
        setEmpresaForm((current) => ({ ...current, planoId: planosData[0]?.id || 'individual' }));
        setPortalForm((current) => ({ ...current, slug: '', titulo: '' }));
        return;
      }

      const [empresaData, unidadesData, assinaturaData, faturasData, pagamentosData] = await Promise.all([
        firebaseService.getById('empresas', contexto.empresaId),
        saasService.listarUnidades(contexto.empresaId),
        saasService.buscarAssinaturaAtual(contexto.empresaId),
        firebaseService.query('faturas_saas', [{ field: 'empresaId', operator: '==', value: contexto.empresaId }]).catch(() => []),
        firebaseService.query('pagamentos_saas', [{ field: 'empresaId', operator: '==', value: contexto.empresaId }]).catch(() => []),
      ]);

      setEmpresa(empresaData);
      setUnidades(unidadesData);
      setAssinatura(assinaturaData);
      setFaturas(faturasData);
      setPagamentos(pagamentosData);
      setEmpresaForm({
        nome: empresaData?.nome || '',
        documento: empresaData?.documento || '',
        razaoSocial: empresaData?.razaoSocial || empresaData?.cobranca?.razaoSocial || '',
        email: empresaData?.email || '',
        telefone: empresaData?.telefone || '',
        planoId: empresaData?.planoId || assinaturaData?.planoId || planosData[0]?.id || 'individual',
        responsavelFinanceiro: empresaData?.cobranca?.responsavelFinanceiro || empresaData?.responsavelFinanceiro || '',
        emailFinanceiro: empresaData?.cobranca?.emailFinanceiro || empresaData?.emailFinanceiro || empresaData?.email || '',
        telefoneFinanceiro: empresaData?.cobranca?.telefoneFinanceiro || empresaData?.telefoneFinanceiro || empresaData?.telefone || '',
        documentoCobranca: empresaData?.cobranca?.documentoCobranca || empresaData?.documento || '',
        enderecoCobranca: empresaData?.cobranca?.enderecoCobranca || '',
        diaVencimento: empresaData?.cobranca?.diaVencimento || assinaturaData?.diaVencimento || 5,
        observacoesCobranca: empresaData?.cobranca?.observacoes || '',
      });
      setPortalForm({
        slug: empresaData?.slug || '',
        titulo: empresaData?.sitePublico?.titulo || empresaData?.nome || '',
        subtitulo: empresaData?.sitePublico?.subtitulo || 'Agende seus serviços online com facilidade.',
        corPrimaria: empresaData?.sitePublico?.corPrimaria || '#9c27b0',
        ativo: empresaData?.sitePublico?.ativo !== false,
        mostrarServicos: empresaData?.sitePublico?.mostrarServicos !== false,
        mostrarProfissionais: empresaData?.sitePublico?.mostrarProfissionais !== false,
      });
    } catch (error) {
      console.error('Erro ao carregar SaaS:', error);
      toast.error(error.message || 'Erro ao carregar dados SaaS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const salvarEmpresa = async (event) => {
    event.preventDefault();
    if (!empresaForm.nome.trim()) {
      toast.error('Informe o nome da empresa.');
      return;
    }

    setSaving(true);
    try {
      if (!empresa?.id) {
        const criada = await saasService.criarEmpresa(empresaForm);
        setEmpresa(criada.empresa);
        setUnidades([criada.unidade]);
        setAssinatura(criada.assinatura);
        toast.success('Empresa SaaS criada com trial ativo.');
      } else {
        const atualizada = {
          ...empresa,
          ...empresaForm,
          cobranca: {
            ...(empresa.cobranca || {}),
            razaoSocial: empresaForm.razaoSocial,
            documentoCobranca: empresaForm.documentoCobranca || empresaForm.documento,
            responsavelFinanceiro: empresaForm.responsavelFinanceiro,
            emailFinanceiro: empresaForm.emailFinanceiro || empresaForm.email,
            telefoneFinanceiro: empresaForm.telefoneFinanceiro || empresaForm.telefone,
            enderecoCobranca: empresaForm.enderecoCobranca,
            diaVencimento: Number(empresaForm.diaVencimento || 5),
            observacoes: empresaForm.observacoesCobranca,
          },
          updatedAt: new Date().toISOString(),
        };
        await firebaseService.update('empresas', empresa.id, atualizada);
        if (assinatura?.planoId !== empresaForm.planoId) {
          const plano = planos.find((item) => item.id === empresaForm.planoId) || PLANOS_PADRAO[empresaForm.planoId];
          await firebaseService.update('assinaturas', assinatura?.id || empresa.id, {
            planoId: empresaForm.planoId,
            valorMensal: plano?.precoMensal || 0,
            moeda: plano?.moeda || 'BRL',
            status: assinatura?.status || STATUS_ASSINATURA.ATIVA,
            updatedAt: new Date().toISOString(),
          });
        }
        setTenantContext({ empresa: atualizada });
        toast.success('Empresa SaaS atualizada.');
      }
      await carregarDados();
    } catch (error) {
      console.error('Erro ao salvar empresa SaaS:', error);
      toast.error(error.message || 'Erro ao salvar empresa.');
    } finally {
      setSaving(false);
    }
  };

  const salvarPortalEmpresa = async (event) => {
    event.preventDefault();
    if (!empresa?.id) {
      toast.error('Cadastre a empresa antes de configurar o link público.');
      return;
    }

    setSaving(true);
    try {
      const atualizada = await saasService.salvarPortalEmpresa(empresa.id, {
        slug: portalForm.slug,
        sitePublico: {
          titulo: portalForm.titulo,
          subtitulo: portalForm.subtitulo,
          corPrimaria: portalForm.corPrimaria,
          ativo: portalForm.ativo,
          mostrarServicos: portalForm.mostrarServicos,
          mostrarProfissionais: portalForm.mostrarProfissionais,
        }
      });
      setEmpresa(atualizada);
      setPortalForm({
        slug: atualizada.slug || '',
        titulo: atualizada.sitePublico?.titulo || atualizada.nome || '',
        subtitulo: atualizada.sitePublico?.subtitulo || 'Agende seus serviços online com facilidade.',
        corPrimaria: atualizada.sitePublico?.corPrimaria || '#9c27b0',
        ativo: atualizada.sitePublico?.ativo !== false,
        mostrarServicos: atualizada.sitePublico?.mostrarServicos !== false,
        mostrarProfissionais: atualizada.sitePublico?.mostrarProfissionais !== false,
      });
      toast.success('Página inicial da empresa atualizada.');
    } catch (error) {
      console.error('Erro ao salvar página da empresa:', error);
      toast.error(error.message || 'Erro ao salvar página inicial.');
    } finally {
      setSaving(false);
    }
  };

  const copiarLinkEmpresa = async () => {
    const link = empresa?.linkPublico || (portalForm.slug ? saasService.buildEmpresaLink(portalForm.slug) : '');
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado.');
    } catch (error) {
      toast.error(link);
    }
  };

  const criarUnidade = async (event) => {
    event.preventDefault();
    if (!unidadeForm.nome.trim()) {
      toast.error('Informe o nome da unidade.');
      return;
    }

    setSaving(true);
    try {
      await saasService.criarUnidade({
        nome: unidadeForm.nome,
        telefone: unidadeForm.telefone,
        endereco: unidadeForm.endereco ? { descricao: unidadeForm.endereco } : {},
      });
      setUnidadeForm({ nome: '', telefone: '', endereco: '' });
      toast.success('Unidade criada com sucesso.');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao criar unidade:', error);
      toast.error(error.message || 'Erro ao criar unidade.');
    } finally {
      setSaving(false);
    }
  };

  const trocarUnidade = async (unidade) => {
    saasService.trocarUnidade(unidade);
    toast.success(`Unidade atual alterada para ${unidade.nome}.`);
    await carregarDados();
  };

  const iniciarCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const data = await saasService.iniciarCheckout({ planoId: planoAtual.id });
      setCheckout(data);
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
      }
      toast.success('Checkout iniciado.');
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      toast.error(error.message || 'Erro ao iniciar cobrança.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const criarFatura = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saasService.criarFatura({
        valor: Number(faturaForm.valor || planoAtual.precoMensal || 0),
        vencimentoEm: faturaForm.vencimentoEm,
        descricao: faturaForm.descricao,
      });
      setFaturaForm({ valor: '', vencimentoEm: '', descricao: 'Mensalidade SaaS' });
      toast.success('Fatura criada.');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao criar fatura:', error);
      toast.error(error.message || 'Erro ao criar fatura.');
    } finally {
      setSaving(false);
    }
  };

  const confirmarPagamento = async (fatura) => {
    setSaving(true);
    try {
      await saasService.registrarPagamento({
        faturaId: fatura.id,
        valor: fatura.valor,
        gateway: 'manual',
      });
      toast.success('Pagamento confirmado.');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error(error.message || 'Erro ao confirmar pagamento.');
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
            Minha empresa
          </Typography>
          <Typography color="text.secondary">
            Gerencie somente os dados da sua empresa, unidades, assinatura e cobranças.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip icon={<BusinessIcon />} label={empresa?.nome || 'Sem empresa'} color={empresa ? 'primary' : 'default'} />
          <Chip icon={<CheckCircleIcon />} label={assinatura?.status || 'sem assinatura'} color={getStatusColor(assinatura?.status)} />
        </Stack>
      </Stack>

      {!empresa && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Cadastre a sua empresa para ativar o acesso. O sistema vai criar a unidade principal e iniciar um trial automaticamente.
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<BusinessIcon />} iconPosition="start" label="Empresa" />
          <Tab icon={<ApartmentIcon />} iconPosition="start" label="Unidades" disabled={!empresa} />
          <Tab icon={<WorkspacePremiumIcon />} iconPosition="start" label="Planos" />
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Assinatura" disabled={!empresa} />
          <Tab icon={<CreditCardIcon />} iconPosition="start" label="Cobrança" disabled={!empresa} />
          <Tab icon={<LanguageIcon />} iconPosition="start" label="Página inicial" disabled={!empresa} />
        </Tabs>
      </Paper>

      <TabPanel value={tab} index={0}>
        <Card>
          <CardContent component="form" onSubmit={salvarEmpresa}>
            <Typography variant="h6" sx={{ mb: 2 }}>Dados da minha empresa</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Nome fantasia" value={empresaForm.nome} onChange={(e) => setEmpresaForm({ ...empresaForm, nome: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Razão social" value={empresaForm.razaoSocial} onChange={(e) => setEmpresaForm({ ...empresaForm, razaoSocial: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="CNPJ/CPF" value={empresaForm.documento} onChange={(e) => setEmpresaForm({ ...empresaForm, documento: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Telefone comercial" value={empresaForm.telefone} onChange={(e) => setEmpresaForm({ ...empresaForm, telefone: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="email" label="Email principal" value={empresaForm.email} onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Dados para cobrança da mensalidade</Typography>
                <Typography variant="body2" color="text.secondary">Essas informações serão usadas para emitir faturas, enviar cobrança e identificar pagamentos do SaaS.</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Responsável financeiro" value={empresaForm.responsavelFinanceiro} onChange={(e) => setEmpresaForm({ ...empresaForm, responsavelFinanceiro: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="email" label="Email de cobrança" value={empresaForm.emailFinanceiro} onChange={(e) => setEmpresaForm({ ...empresaForm, emailFinanceiro: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Telefone/WhatsApp financeiro" value={empresaForm.telefoneFinanceiro} onChange={(e) => setEmpresaForm({ ...empresaForm, telefoneFinanceiro: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Documento para nota/cobrança" value={empresaForm.documentoCobranca} onChange={(e) => setEmpresaForm({ ...empresaForm, documentoCobranca: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="number" label="Dia padrão de vencimento" value={empresaForm.diaVencimento} onChange={(e) => setEmpresaForm({ ...empresaForm, diaVencimento: e.target.value })} inputProps={{ min: 1, max: 28 }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Plano" value={empresaForm.planoId} onChange={(e) => setEmpresaForm({ ...empresaForm, planoId: e.target.value })}>
                  {planos.map((plano) => (
                    <MenuItem key={plano.id} value={plano.id}>{plano.nome} - {formatCurrency(plano.precoMensal, plano.moeda)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField fullWidth multiline minRows={2} label="Endereço de cobrança" value={empresaForm.enderecoCobranca} onChange={(e) => setEmpresaForm({ ...empresaForm, enderecoCobranca: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth multiline minRows={2} label="Observações de cobrança" value={empresaForm.observacoesCobranca} onChange={(e) => setEmpresaForm({ ...empresaForm, observacoesCobranca: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={saving} startIcon={<BusinessIcon />}>
                  {empresa ? 'Salvar empresa e cobrança' : 'Criar minha empresa'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent component="form" onSubmit={criarUnidade}>
                <Typography variant="h6" sx={{ mb: 2 }}>Nova unidade</Typography>
                <Stack spacing={2}>
                  <TextField required label="Nome da unidade" value={unidadeForm.nome} onChange={(e) => setUnidadeForm({ ...unidadeForm, nome: e.target.value })} />
                  <TextField label="Telefone" value={unidadeForm.telefone} onChange={(e) => setUnidadeForm({ ...unidadeForm, telefone: e.target.value })} />
                  <TextField label="Endereço resumido" multiline minRows={2} value={unidadeForm.endereco} onChange={(e) => setUnidadeForm({ ...unidadeForm, endereco: e.target.value })} />
                  <Button type="submit" variant="contained" disabled={saving} startIcon={<DomainAddIcon />}>Criar unidade</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Unidade</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Principal</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unidades.map((unidade) => (
                    <TableRow key={unidade.id}>
                      <TableCell>{unidade.nome}</TableCell>
                      <TableCell><Chip size="small" label={unidade.status || 'ativa'} color={unidade.status === 'inativa' ? 'default' : 'success'} /></TableCell>
                      <TableCell>{unidade.principal ? 'Sim' : 'Não'}</TableCell>
                      <TableCell align="right"><Button size="small" onClick={() => trocarUnidade(unidade)}>Usar unidade</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Grid container spacing={3}>
          {planos.map((plano) => (
            <Grid item xs={12} md={6} key={plano.id}>
              <Card variant={planoAtual?.id === plano.id ? 'elevation' : 'outlined'} sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{plano.nome}</Typography>
                    {planoAtual?.id === plano.id && <Chip label="Atual" color="primary" />}
                  </Stack>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>{formatCurrency(plano.precoMensal, plano.moeda)}<Typography component="span" variant="body2">/mês</Typography></Typography>
                  {plano.precoPorUnidade && <Typography color="text.secondary">+ {formatCurrency(plano.precoPorUnidade, plano.moeda)} por unidade adicional</Typography>}
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    {(plano.recursos || []).map((recurso) => <Chip key={recurso} label={recurso} variant="outlined" />)}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Assinatura atual</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><Typography color="text.secondary">Plano</Typography><Typography variant="h6">{planoAtual?.nome}</Typography></Grid>
              <Grid item xs={12} md={3}><Typography color="text.secondary">Status</Typography><Chip label={assinatura?.status || '-'} color={getStatusColor(assinatura?.status)} /></Grid>
              <Grid item xs={12} md={3}><Typography color="text.secondary">Valor mensal</Typography><Typography variant="h6">{formatCurrency(assinatura?.valorMensal || planoAtual?.precoMensal, assinatura?.moeda || planoAtual?.moeda)}</Typography></Grid>
              <Grid item xs={12} md={3}><Typography color="text.secondary">Próxima cobrança</Typography><Typography variant="h6">{formatDate(assinatura?.proximaCobrancaEm)}</Typography></Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Button variant="contained" disabled={checkoutLoading} startIcon={<LaunchIcon />} onClick={iniciarCheckout}>
              {checkoutLoading ? 'Abrindo...' : 'Abrir checkout'}
            </Button>
            {checkout && <Alert severity="info" sx={{ mt: 2 }}>{checkout.checkoutUrl || checkout.instrucoes}</Alert>}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent component="form" onSubmit={criarFatura}>
                <Typography variant="h6" sx={{ mb: 2 }}>Criar fatura manual</Typography>
                <Stack spacing={2}>
                  <TextField label="Valor" type="number" value={faturaForm.valor} onChange={(e) => setFaturaForm({ ...faturaForm, valor: e.target.value })} placeholder={String(planoAtual?.precoMensal || '')} />
                  <TextField label="Vencimento" type="datetime-local" InputLabelProps={{ shrink: true }} value={faturaForm.vencimentoEm} onChange={(e) => setFaturaForm({ ...faturaForm, vencimentoEm: e.target.value })} />
                  <TextField label="Descrição" value={faturaForm.descricao} onChange={(e) => setFaturaForm({ ...faturaForm, descricao: e.target.value })} />
                  <Button type="submit" variant="contained" disabled={saving} startIcon={<ReceiptLongIcon />}>Criar fatura</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faturas.map((fatura) => (
                    <TableRow key={fatura.id}>
                      <TableCell>{fatura.descricao}</TableCell>
                      <TableCell>{formatCurrency(fatura.valor, fatura.moeda)}</TableCell>
                      <TableCell><Chip size="small" label={fatura.status} color={fatura.status === 'paga' ? 'success' : 'warning'} /></TableCell>
                      <TableCell>{formatDate(fatura.vencimentoEm)}</TableCell>
                      <TableCell align="right">{fatura.status !== 'paga' && <Button size="small" onClick={() => confirmarPagamento(fatura)}>Confirmar pagamento</Button>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Pagamentos recentes</Typography>
            <Stack spacing={1}>
              {pagamentos.slice(0, 5).map((pagamento) => (
                <Alert severity="success" key={pagamento.id}>{formatCurrency(pagamento.valor, pagamento.moeda)} via {pagamento.gateway} em {formatDate(pagamento.pagoEm)}</Alert>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={5}>
        <Card>
          <CardContent component="form" onSubmit={salvarPortalEmpresa}>
            <Typography variant="h6" sx={{ mb: 2 }}>Página inicial própria da empresa</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Este é o link que os clientes desta empresa usarão para entrar, criar conta e ver serviços publicados.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <TextField fullWidth required label="Slug do link" value={portalForm.slug} onChange={(e) => setPortalForm({ ...portalForm, slug: saasService.slugifyEmpresa(e.target.value) })} helperText="Exemplo: minha-empresa" />
              </Grid>
              <Grid item xs={12} md={7}>
                <TextField fullWidth label="Link público" value={empresa?.linkPublico || (portalForm.slug ? saasService.buildEmpresaLink(portalForm.slug) : '')} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Título da página" value={portalForm.titulo} onChange={(e) => setPortalForm({ ...portalForm, titulo: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="color" label="Cor principal" value={portalForm.corPrimaria} onChange={(e) => setPortalForm({ ...portalForm, corPrimaria: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label="Subtítulo" value={portalForm.subtitulo} onChange={(e) => setPortalForm({ ...portalForm, subtitulo: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Página ativa" value={portalForm.ativo ? 'sim' : 'nao'} onChange={(e) => setPortalForm({ ...portalForm, ativo: e.target.value === 'sim' })}>
                  <MenuItem value="sim">Sim</MenuItem>
                  <MenuItem value="nao">Não</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Mostrar serviços" value={portalForm.mostrarServicos ? 'sim' : 'nao'} onChange={(e) => setPortalForm({ ...portalForm, mostrarServicos: e.target.value === 'sim' })}>
                  <MenuItem value="sim">Sim</MenuItem>
                  <MenuItem value="nao">Não</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Mostrar equipe" value={portalForm.mostrarProfissionais ? 'sim' : 'nao'} onChange={(e) => setPortalForm({ ...portalForm, mostrarProfissionais: e.target.value === 'sim' })}>
                  <MenuItem value="sim">Sim</MenuItem>
                  <MenuItem value="nao">Não</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button type="submit" variant="contained" disabled={saving} startIcon={<LanguageIcon />}>Salvar página inicial</Button>
                  <Button type="button" variant="outlined" onClick={copiarLinkEmpresa} startIcon={<ContentCopyIcon />} disabled={!empresa?.linkPublico && !portalForm.slug}>Copiar link</Button>
                  <Button type="button" variant="outlined" href={empresa?.linkPublico || saasService.buildEmpresaLink(portalForm.slug)} target="_blank" rel="noreferrer" startIcon={<LaunchIcon />} disabled={!empresa?.linkPublico && !portalForm.slug}>Abrir página</Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}

export default SaasGestao;
