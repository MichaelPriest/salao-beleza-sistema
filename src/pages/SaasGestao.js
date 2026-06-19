// src/pages/SaasGestao.js - CORRIGIDO (Removendo abas vazias)
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  ContentCopy as ContentCopyIcon,
  CreditCard as CreditCardIcon,
  DomainAdd as DomainAddIcon,
  Edit as EditIcon,
  Language as LanguageIcon,
  Launch as LaunchIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  ReceiptLong as ReceiptIcon,
  Payments as PaymentsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ArrowForward as ArrowForwardIcon,
  WhatsApp as WhatsAppIcon,
  Palette as PaletteIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { firebaseService, setTenantContext } from '../services/firebase';
import BillingPaymentForms from '../components/saas/BillingPaymentForms';
import {
  CONFIG_COBRANCA_PADRAO,
  PLANOS_PADRAO,
  STATUS_ASSINATURA,
  metodoPagamentoLabel,
  metodosAtivosNoGateway,
  metodosSomentePreferencial,
  primeiroMetodoDisponivel,
  saasService,
} from '../services/saasService';

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const formatCurrency = (value, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
};

const withTimeout = (promise, timeoutMs, fallbackValue, timeoutMessage) => {
  let timeoutId;
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(timeoutMessage);
      resolve(fallbackValue);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const getUsuarioAtual = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario') || 'null');
  } catch (error) {
    return null;
  }
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

const TabPanel = ({ children, value, index }) => {
  if (value !== index) return null;
  return <Box sx={{ mt: 3 }}>{children}</Box>;
};

const StatusBadge = ({ status, size = 'medium' }) => {
  const statusMap = {
    [STATUS_ASSINATURA.TRIAL]: { color: 'info', label: 'Trial', icon: '🎯' },
    [STATUS_ASSINATURA.ATIVA]: { color: 'success', label: 'Ativa', icon: '✅' },
    [STATUS_ASSINATURA.PENDENTE]: { color: 'warning', label: 'Pendente', icon: '⏳' },
    [STATUS_ASSINATURA.INADIMPLENTE]: { color: 'error', label: 'Inadimplente', icon: '⚠️' },
    [STATUS_ASSINATURA.CANCELADA]: { color: 'default', label: 'Cancelada', icon: '❌' },
    [STATUS_ASSINATURA.EXPIRADA]: { color: 'error', label: 'Expirada', icon: '⏰' },
  };
  
  const config = statusMap[status] || { color: 'default', label: status || 'Indefinido', icon: '❓' };
  
  return (
    <Chip 
      label={`${config.icon} ${config.label}`}
      color={config.color}
      size={size}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
};

function SaasGestao({ initialTab = 0, embedded = false }) {
  const theme = useTheme();
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
  const [paymentConfig, setPaymentConfig] = useState(CONFIG_COBRANCA_PADRAO);
  
  const [empresaForm, setEmpresaForm] = useState({
    nome: '', documento: '', razaoSocial: '', email: '', telefone: '',
    planoId: 'individual', responsavelFinanceiro: '', emailFinanceiro: '',
    telefoneFinanceiro: '', documentoCobranca: '', enderecoCobranca: '',
    diaVencimento: 5, observacoesCobranca: ''
  });
  
  const [unidadeForm, setUnidadeForm] = useState({ nome: '', telefone: '', endereco: '' });
  
  const [portalForm, setPortalForm] = useState({
    slug: '', titulo: '', subtitulo: 'Agende seus serviços online com facilidade.',
    corPrimaria: '#9c27b0', ativo: true, mostrarServicos: true,
    mostrarProfissionais: true, logo: '', bannerUrl: '', whatsapp: '',
    temaLayout: 'moderno', mostrarContato: true, mostrarAreaRestrita: true,
    mostrarRedesSociais: true, mostrarBanner: true,
  });

  const planoAtual = useMemo(() => {
    const planoId = assinatura?.planoId || empresa?.planoId || empresaForm.planoId;
    return planos.find((plano) => plano.id === planoId) || PLANOS_PADRAO[planoId] || PLANOS_PADRAO.individual;
  }, [assinatura?.planoId, empresa?.planoId, empresaForm.planoId, planos]);

  const completionSteps = useMemo(() => {
    return [
      { label: 'Empresa', completed: !!empresa?.nome },
      { label: 'Unidade', completed: unidades.length > 0 },
      { label: 'Plano', completed: !!assinatura?.planoId },
      { label: 'Cobrança', completed: !!empresa?.cobranca?.provider },
      { label: 'Página', completed: !!empresa?.slug },
    ];
  }, [empresa, unidades, assinatura]);

  const preencherFormulariosEmpresa = (dadosEmpresa = {}) => {
    const cobranca = dadosEmpresa.cobranca || {};
    setEmpresaForm({
      nome: dadosEmpresa.nome || '',
      documento: dadosEmpresa.documento || '',
      razaoSocial: dadosEmpresa.razaoSocial || cobranca.razaoSocial || '',
      email: dadosEmpresa.email || '',
      telefone: dadosEmpresa.telefone || '',
      planoId: dadosEmpresa.planoId || 'individual',
      responsavelFinanceiro: cobranca.responsavelFinanceiro || '',
      emailFinanceiro: cobranca.emailFinanceiro || '',
      telefoneFinanceiro: cobranca.telefoneFinanceiro || '',
      documentoCobranca: cobranca.documentoCobranca || '',
      enderecoCobranca: cobranca.enderecoCobranca || '',
      diaVencimento: cobranca.diaVencimento || 5,
      observacoesCobranca: cobranca.observacoes || ''
    });

    const sitePublico = dadosEmpresa.sitePublico || {};
    setPortalForm((prev) => ({
      ...prev,
      slug: dadosEmpresa.slug || '',
      titulo: sitePublico.titulo || dadosEmpresa.nome || '',
      subtitulo: sitePublico.subtitulo || prev.subtitulo,
      corPrimaria: sitePublico.corPrimaria || prev.corPrimaria,
      ativo: sitePublico.ativo !== false,
      mostrarServicos: sitePublico.mostrarServicos !== false,
      mostrarProfissionais: sitePublico.mostrarProfissionais !== false,
      logo: sitePublico.logo || '',
      bannerUrl: sitePublico.bannerUrl || '',
      whatsapp: sitePublico.whatsapp || '',
      temaLayout: sitePublico.temaLayout || 'moderno',
      mostrarContato: sitePublico.mostrarContato !== false,
      mostrarAreaRestrita: sitePublico.mostrarAreaRestrita !== false,
      mostrarRedesSociais: sitePublico.mostrarRedesSociais !== false,
      mostrarBanner: sitePublico.mostrarBanner !== false,
    }));

    setPaymentConfig({
      ...CONFIG_COBRANCA_PADRAO,
      ...(dadosEmpresa.cobranca?.configPagamento || dadosEmpresa.cobranca || {})
    });
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      const usuario = getUsuarioAtual();
      const contexto = saasService.getContextoAtual();
      const empresaId = contexto.empresaId || usuario?.empresaId || usuario?.tenantId || usuario?.empresa?.id;

      let empresaData = contexto.empresa || usuario?.empresa || null;
      const [planosData, configCobranca, empresaDataResolvida] = await Promise.all([
        withTimeout(
          saasService.listarPlanos(),
          8000,
          Object.values(PLANOS_PADRAO),
          'Tempo limite ao carregar planos SaaS. Usando planos padrão.'
        ),
        withTimeout(
          saasService.buscarConfigCobranca(),
          8000,
          CONFIG_COBRANCA_PADRAO,
          'Tempo limite ao carregar configuração de cobrança. Usando padrão.'
        ),
        empresaId
          ? withTimeout(
            firebaseService.getById('empresas', empresaId).catch(() => empresaData),
            8000,
            empresaData,
            'Tempo limite ao carregar empresa. Usando dados locais.'
          )
          : Promise.resolve(empresaData)
      ]);

      setPlanos(planosData.length ? planosData : Object.values(PLANOS_PADRAO));
      setPaymentConfig(configCobranca);
      empresaData = empresaDataResolvida;

      if (!empresaData) {
        preencherFormulariosEmpresa({ nome: usuario?.empresaNome || usuario?.nomeEmpresa || '' });
        return;
      }

      setEmpresa(empresaData);
      setTenantContext({ empresaId: empresaData.id, empresa: empresaData });
      preencherFormulariosEmpresa(empresaData);

      const [unidadesData, assinaturaData, faturasData, pagamentosData] = await Promise.all([
        withTimeout(saasService.listarUnidades(empresaData.id).catch(() => []), 8000, [], 'Tempo limite ao carregar unidades.'),
        withTimeout(saasService.buscarAssinaturaAtual(empresaData.id).catch(() => null), 8000, null, 'Tempo limite ao carregar assinatura.'),
        withTimeout(firebaseService.query('faturas_saas', [{ field: 'empresaId', operator: '==', value: empresaData.id }]).catch(() => []), 8000, [], 'Tempo limite ao carregar faturas.'),
        withTimeout(firebaseService.query('pagamentos_saas', [{ field: 'empresaId', operator: '==', value: empresaData.id }]).catch(() => []), 8000, [], 'Tempo limite ao carregar pagamentos.')
      ]);

      setUnidades(unidadesData);
      setAssinatura(assinaturaData);
      setFaturas(faturasData);
      setPagamentos(pagamentosData);
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
      toast.error('Não foi possível carregar todos os dados da empresa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const salvarEmpresa = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (empresa?.id) {
        const payload = {
          nome: empresaForm.nome,
          documento: empresaForm.documento,
          razaoSocial: empresaForm.razaoSocial,
          email: empresaForm.email,
          telefone: empresaForm.telefone,
          planoId: empresaForm.planoId,
          cobranca: {
            ...(empresa.cobranca || {}),
            responsavelFinanceiro: empresaForm.responsavelFinanceiro,
            emailFinanceiro: empresaForm.emailFinanceiro,
            telefoneFinanceiro: empresaForm.telefoneFinanceiro,
            documentoCobranca: empresaForm.documentoCobranca,
            enderecoCobranca: empresaForm.enderecoCobranca,
            diaVencimento: Number(empresaForm.diaVencimento || 5),
            observacoes: empresaForm.observacoesCobranca,
          },
          updatedAt: new Date().toISOString()
        };
        await firebaseService.update('empresas', empresa.id, payload);
        const empresaAtualizada = { ...empresa, ...payload };
        setEmpresa(empresaAtualizada);
        setTenantContext({ empresaId: empresaAtualizada.id, empresa: empresaAtualizada });
        toast.success('Empresa atualizada com sucesso!');
      } else {
        const resultado = await saasService.criarEmpresa(empresaForm);
        setEmpresa(resultado.empresa);
        setUnidades([resultado.unidade]);
        setAssinatura(resultado.assinatura);
        preencherFormulariosEmpresa(resultado.empresa);
        setTab(1);
        toast.success('Empresa criada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast.error(error.message || 'Erro ao salvar empresa.');
    } finally {
      setSaving(false);
    }
  };

  const criarUnidade = async (event) => {
    event.preventDefault();
    if (!empresa?.id) return;
    setSaving(true);
    try {
      const unidade = await saasService.criarUnidade({
        empresaId: empresa.id,
        nome: unidadeForm.nome,
        telefone: unidadeForm.telefone,
        endereco: { descricao: unidadeForm.endereco }
      });
      setUnidades((prev) => [...prev, unidade]);
      setUnidadeForm({ nome: '', telefone: '', endereco: '' });
      toast.success('Unidade criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar unidade:', error);
      toast.error(error.message || 'Erro ao criar unidade.');
    } finally {
      setSaving(false);
    }
  };

  const trocarUnidade = async (unidade) => {
    await saasService.trocarUnidade(unidade);
    toast.success(`Unidade ${unidade.nome} selecionada.`);
  };

  const iniciarCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const resultado = await saasService.iniciarCheckout({
        empresaId: empresa?.id,
        planoId: empresaForm.planoId,
        provider: paymentConfig.provider,
        metodosPagamento: paymentConfig.metodosPagamento,
        dadosPagamento: paymentConfig
      });
      setCheckout(resultado);
      if (resultado?.checkoutUrl) window.open(resultado.checkoutUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      toast.error(error.message || 'Erro ao iniciar checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const salvarConfiguracaoPagamentoEmpresa = async () => {
    if (!empresa?.id) return;
    setSaving(true);
    try {
      const payload = {
        cobranca: {
          ...(empresa.cobranca || {}),
          configPagamento: paymentConfig,
          provider: paymentConfig.provider,
          metodoPreferencial: paymentConfig.metodoPreferencial || primeiroMetodoDisponivel(paymentConfig.metodosPagamento),
        },
        updatedAt: new Date().toISOString()
      };
      await firebaseService.update('empresas', empresa.id, payload);
      setEmpresa((prev) => ({ ...prev, ...payload }));
      toast.success('Método de cobrança salvo!');
    } catch (error) {
      console.error('Erro ao salvar cobrança:', error);
      toast.error(error.message || 'Erro ao salvar cobrança.');
    } finally {
      setSaving(false);
    }
  };

  const salvarPortalEmpresa = async (event) => {
    event.preventDefault();
    if (!empresa?.id) return;
    setSaving(true);
    try {
      const empresaAtualizada = await saasService.salvarPortalEmpresa(empresa.id, {
        slug: portalForm.slug,
        sitePublico: portalForm
      });
      setEmpresa(empresaAtualizada);
      preencherFormulariosEmpresa(empresaAtualizada);
      toast.success('Página pública salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar página pública:', error);
      toast.error(error.message || 'Erro ao salvar página pública.');
    } finally {
      setSaving(false);
    }
  };

  const copiarLinkEmpresa = async () => {
    const link = empresa?.linkPublico || (portalForm.slug ? `${window.location.origin}/e/${portalForm.slug}` : '');
    if (!link) return;
    await navigator.clipboard?.writeText(link);
    toast.success('Link copiado!');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Carregando dados da empresa...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: embedded ? 0 : { xs: 2, md: 4 }, 
      bgcolor: embedded ? 'transparent' : '#f8f9ff',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Card sx={{ mb: 4, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: theme.palette.primary.light,
                    fontSize: 28,
                    fontWeight: 700
                  }}
                >
                  {empresa?.nome?.charAt(0)?.toUpperCase() || '🏢'}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {empresa?.nome || 'Minha Empresa'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {empresa ? 'Gerencie sua empresa, unidades e assinatura' : 'Configure sua empresa para começar'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <StatusBadge status={assinatura?.status || 'sem_assinatura'} />
                <Chip 
                  icon={<WorkspacePremiumIcon />}
                  label={planoAtual?.nome || 'Sem plano'} 
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Progresso da configuração
            </Typography>
            <Grid container spacing={1}>
              {completionSteps.map((step, index) => (
                <Grid item xs key={index}>
                  <Paper 
                    variant="outlined"
                    sx={{ 
                      p: 1.5, 
                      textAlign: 'center',
                      bgcolor: step.completed ? `${theme.palette.success.light}20` : 'transparent',
                      borderColor: step.completed ? 'success.main' : 'divider',
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      color={step.completed ? 'success.main' : 'text.secondary'}
                      sx={{ fontWeight: 600 }}
                    >
                      {step.completed ? '✅' : '⬜'} {step.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, mb: 3 }}>
        <Tabs 
          value={tab} 
          onChange={(_, next) => setTab(next)} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              fontWeight: 600,
            }
          }}
        >
          <Tab icon={<BusinessIcon />} iconPosition="start" label="Empresa" />
          <Tab icon={<ApartmentIcon />} iconPosition="start" label="Unidades" disabled={!empresa} />
          <Tab icon={<ReceiptIcon />} iconPosition="start" label="Assinatura" disabled={!empresa} />
          <Tab icon={<CreditCardIcon />} iconPosition="start" label="Cobrança" disabled={!empresa} />
          <Tab icon={<LanguageIcon />} iconPosition="start" label="Página Pública" disabled={!empresa} />
        </Tabs>
      </Paper>

      {/* Aba 0: Empresa */}
      <TabPanel value={tab} index={0}>
        <Card sx={{ boxShadow: 2 }}>
          <CardContent component="form" onSubmit={salvarEmpresa} sx={{ p: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Dados da Empresa
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Informações principais do seu negócio
                </Typography>
              </Box>
            </Stack>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Nome fantasia" value={empresaForm.nome} onChange={(e) => setEmpresaForm({ ...empresaForm, nome: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Razão social" value={empresaForm.razaoSocial} onChange={(e) => setEmpresaForm({ ...empresaForm, razaoSocial: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="CNPJ/CPF" value={empresaForm.documento} onChange={(e) => setEmpresaForm({ ...empresaForm, documento: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Telefone comercial" value={empresaForm.telefone} onChange={(e) => setEmpresaForm({ ...empresaForm, telefone: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="email" label="Email principal" value={empresaForm.email} onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })} variant="outlined" />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}><Chip label="Dados de Cobrança" color="primary" variant="outlined" /></Divider>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Responsável financeiro" value={empresaForm.responsavelFinanceiro} onChange={(e) => setEmpresaForm({ ...empresaForm, responsavelFinanceiro: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="email" label="Email de cobrança" value={empresaForm.emailFinanceiro} onChange={(e) => setEmpresaForm({ ...empresaForm, emailFinanceiro: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="WhatsApp financeiro" value={empresaForm.telefoneFinanceiro} onChange={(e) => setEmpresaForm({ ...empresaForm, telefoneFinanceiro: e.target.value })} variant="outlined" InputProps={{ startAdornment: (<InputAdornment position="start"><WhatsAppIcon color="success" /></InputAdornment>) }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Documento para nota/cobrança" value={empresaForm.documentoCobranca} onChange={(e) => setEmpresaForm({ ...empresaForm, documentoCobranca: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="number" label="Dia de vencimento" value={empresaForm.diaVencimento} onChange={(e) => setEmpresaForm({ ...empresaForm, diaVencimento: e.target.value })} inputProps={{ min: 1, max: 28 }} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Plano" value={empresaForm.planoId} onChange={(e) => setEmpresaForm({ ...empresaForm, planoId: e.target.value })} variant="outlined">
                  {planos.map((plano) => (<MenuItem key={plano.id} value={plano.id}>{plano.nome} - {formatCurrency(plano.precoMensal, plano.moeda)}/mês</MenuItem>))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField fullWidth multiline minRows={2} label="Endereço de cobrança" value={empresaForm.enderecoCobranca} onChange={(e) => setEmpresaForm({ ...empresaForm, enderecoCobranca: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth multiline minRows={2} label="Observações" value={empresaForm.observacoesCobranca} onChange={(e) => setEmpresaForm({ ...empresaForm, observacoesCobranca: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" size="large" disabled={saving} startIcon={empresa ? <SaveIcon /> : <ArrowForwardIcon />} sx={{ fontWeight: 700 }}>
                  {empresa ? 'Salvar Alterações' : 'Criar Empresa e Continuar'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Aba 1: Unidades */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent component="form" onSubmit={criarUnidade} sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: theme.palette.success.light }}><DomainAddIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Nova Unidade</Typography>
                </Stack>
                <Stack spacing={3}>
                  <TextField required label="Nome da unidade" value={unidadeForm.nome} onChange={(e) => setUnidadeForm({ ...unidadeForm, nome: e.target.value })} variant="outlined" />
                  <TextField label="Telefone" value={unidadeForm.telefone} onChange={(e) => setUnidadeForm({ ...unidadeForm, telefone: e.target.value })} variant="outlined" />
                  <TextField label="Endereço" multiline minRows={2} value={unidadeForm.endereco} onChange={(e) => setUnidadeForm({ ...unidadeForm, endereco: e.target.value })} variant="outlined" />
                  <Button type="submit" variant="contained" disabled={saving} startIcon={<DomainAddIcon />} fullWidth size="large">Criar Unidade</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card sx={{ boxShadow: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: 700 }}>Unidade</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Principal</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unidades.map((unidade) => (
                      <TableRow key={unidade.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: theme.palette.info.light }}><ApartmentIcon /></Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600 }}>{unidade.nome}</Typography>
                              {unidade.endereco?.descricao && <Typography variant="caption" color="text.secondary">{unidade.endereco.descricao}</Typography>}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell><Chip size="small" label={unidade.status || 'Ativa'} color={unidade.status === 'inativa' ? 'default' : 'success'} variant="outlined" /></TableCell>
                        <TableCell>{unidade.principal ? <Chip label="Principal" color="primary" size="small" /> : <Typography variant="body2" color="text.secondary">Não</Typography>}</TableCell>
                        <TableCell align="right"><Button size="small" variant="outlined" onClick={() => trocarUnidade(unidade)} startIcon={<ArrowForwardIcon />}>Usar Unidade</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Aba 2: Assinatura */}
      <TabPanel value={tab} index={2}>
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.warning.light }}><ReceiptIcon /></Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Assinatura Atual</Typography>
                <Typography variant="body2" color="text.secondary">Detalhes da sua assinatura e cobranças</Typography>
              </Box>
            </Stack>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography color="text.secondary">Plano</Typography>
                <Typography variant="h6">{planoAtual?.nome || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography color="text.secondary">Status</Typography>
                <StatusBadge status={assinatura?.status || 'sem_assinatura'} />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography color="text.secondary">Valor mensal</Typography>
                <Typography variant="h6">{formatCurrency(assinatura?.valorMensal || planoAtual?.precoMensal, assinatura?.moeda || planoAtual?.moeda)}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography color="text.secondary">Próxima cobrança</Typography>
                <Typography variant="h6">{formatDate(assinatura?.proximaCobrancaEm)}</Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Button variant="contained" disabled={checkoutLoading} startIcon={<LaunchIcon />} onClick={iniciarCheckout}>
              {checkoutLoading ? 'Abrindo...' : 'Abrir checkout'}
            </Button>
            {checkout && <Alert severity="info" sx={{ mt: 2 }}>Método: {metodoPagamentoLabel(checkout.metodoPreferencial)} · Gateway: {checkout.provider}</Alert>}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Aba 3: Cobrança */}
      <TabPanel value={tab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: theme.palette.info.light }}><CreditCardIcon /></Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Método de Cobrança</Typography>
                    <Typography variant="body2" color="text.secondary">Configure como deseja pagar a mensalidade</Typography>
                  </Box>
                </Stack>
                
                <BillingPaymentForms value={paymentConfig} onChange={setPaymentConfig} mode="tenant" />
                
                <Button variant="contained" disabled={saving} onClick={salvarConfiguracaoPagamentoEmpresa} startIcon={<SaveIcon />} sx={{ mt: 3, fontWeight: 700 }}>
                  Salvar método de cobrança
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Aba 4: Página Pública */}
      <TabPanel value={tab} index={4}>
        <Card sx={{ boxShadow: 2 }}>
          <CardContent component="form" onSubmit={salvarPortalEmpresa} sx={{ p: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.success.light }}><LanguageIcon /></Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Página Pública</Typography>
                <Typography variant="body2" color="text.secondary">Configure o link e aparência da sua página</Typography>
              </Box>
            </Stack>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Slug do link" value={portalForm.slug} onChange={(e) => setPortalForm({ ...portalForm, slug: e.target.value })} helperText="Exemplo: minha-empresa" variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Link público" value={empresa?.linkPublico || (portalForm.slug ? `/e/${portalForm.slug}` : '')} InputProps={{ readOnly: true }} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Título da página" value={portalForm.titulo} onChange={(e) => setPortalForm({ ...portalForm, titulo: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="color" label="Cor principal" value={portalForm.corPrimaria} onChange={(e) => setPortalForm({ ...portalForm, corPrimaria: e.target.value })} InputLabelProps={{ shrink: true }} variant="outlined" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label="Subtítulo" value={portalForm.subtitulo} onChange={(e) => setPortalForm({ ...portalForm, subtitulo: e.target.value })} variant="outlined" />
              </Grid>
              <Grid item xs={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button type="submit" variant="contained" disabled={saving} startIcon={<SaveIcon />} sx={{ fontWeight: 700 }}>Salvar página</Button>
                  <Button variant="outlined" onClick={copiarLinkEmpresa} startIcon={<ContentCopyIcon />} disabled={!empresa?.linkPublico && !portalForm.slug}>Copiar link</Button>
                  <Button variant="outlined" href={empresa?.linkPublico || `/e/${portalForm.slug}`} target="_blank" rel="noreferrer" startIcon={<LaunchIcon />} disabled={!empresa?.linkPublico && !portalForm.slug}>Abrir página</Button>
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
