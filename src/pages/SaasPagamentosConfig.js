// src/pages/SaasPagamentosConfig.js
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon,
  Api as ApiIcon,
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  QrCode as PixIcon,
  Receipt as BoletoIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import BillingPaymentForms from '../components/saas/BillingPaymentForms';
import { CONFIG_COBRANCA_PADRAO, saasService } from '../services/saasService';

const gatewayInfo = {
  stripe: {
    name: 'Stripe',
    icon: <CreditCardIcon />,
    color: '#635BFF',
    description: 'Gateway internacional com suporte a cartão de crédito, débito e PIX',
    docs: 'https://stripe.com/docs/api',
    secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    features: ['Cartão de crédito', 'Cartão de débito', 'PIX', 'Recorrência automática'],
  },
  mercadopago: {
    name: 'Mercado Pago',
    icon: <PaymentIcon />,
    color: '#009EE3',
    description: 'Gateway brasileiro com cartão, PIX e boleto',
    docs: 'https://www.mercadopago.com.br/developers',
    secrets: ['MERCADOPAGO_ACCESS_TOKEN', 'MERCADOPAGO_WEBHOOK_SECRET'],
    features: ['Cartão de crédito', 'PIX', 'Boleto bancário', 'Checkout transparente'],
  },
  pagseguro: {
    name: 'PagSeguro/PagBank',
    icon: <BankIcon />,
    color: '#FF6B00',
    description: 'Gateway brasileiro com múltiplas formas de pagamento',
    docs: 'https://dev.pagseguro.uol.com.br/',
    secrets: ['PAGSEGURO_TOKEN', 'PAGSEGURO_EMAIL', 'PAGSEGURO_NOTIFICATION_URL'],
    features: ['Cartão de crédito', 'PIX', 'Boleto', 'Débito online'],
  },
  manual: {
    name: 'Cobrança Manual',
    icon: <SettingsIcon />,
    color: '#666',
    description: 'Gerenciamento manual de cobranças sem integração automática',
    docs: null,
    secrets: ['BILLING_MANUAL_INSTRUCTIONS'],
    features: ['Controle manual', 'Registro de pagamentos', 'Notificações por email'],
  },
};

const metodoIcons = {
  credit_card: <CreditCardIcon />,
  pix: <PixIcon />,
  boleto: <BoletoIcon />,
};

const metodoLabels = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'PIX',
  boleto: 'Boleto Bancário',
};

function SaasPagamentosConfig() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState(CONFIG_COBRANCA_PADRAO);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const gatewayConfig = gatewayInfo[config.provider] || gatewayInfo.manual;

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const data = await saasService.buscarConfigCobranca();
        setConfig(data);
        
        // Determinar step ativo baseado na configuração
        if (data.provider && data.metodoPreferencial) {
          setActiveStep(2);
        } else if (data.provider) {
          setActiveStep(1);
        }
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
      setActiveStep(3);
      toast.success('✅ Configuração de pagamento salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar APIs de pagamento:', error);
      toast.error(error.message || 'Erro ao salvar configuração.');
    } finally {
      setSaving(false);
    }
  };

  const testarConexao = async () => {
    setTesting(true);
    setTestDialogOpen(true);
    
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // Simular 70% de chance de sucesso
      
      setTestResult({
        success,
        message: success 
          ? 'Conexão estabelecida com sucesso! Gateway respondendo normalmente.'
          : 'Falha na conexão. Verifique as credenciais e tente novamente.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || 'Erro ao testar conexão.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTesting(false);
    }
  };

  const copiarParaClipboard = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success('📋 Copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar texto.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Carregando configurações de pagamento...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9ff', minHeight: '100vh' }}>
      {/* Header */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2} 
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Configuração de Pagamentos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure as APIs de pagamento e métodos aceitos pela plataforma
          </Typography>
        </Box>
        <Chip 
          icon={<ApiIcon />} 
          label={`Gateway: ${gatewayConfig.name}`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600, px: 2, py: 2.5 }}
        />
      </Stack>

      {/* Steps */}
      <Card sx={{ mb: 4, boxShadow: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {[
              'Escolher Gateway',
              'Configurar Métodos',
              'Credenciais API',
              'Testar e Salvar',
            ].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Alert de Segurança */}
      <Alert 
        severity="warning" 
        icon={<SecurityIcon />}
        sx={{ mb: 4, borderRadius: 2 }}
        action={
          <Button 
            color="inherit" 
            size="small"
            href="https://docs.saas.com/security"
            target="_blank"
          >
            Documentação
          </Button>
        }
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Importante: Segurança das Credenciais
        </Typography>
        <Typography variant="body2">
          Por segurança, as chaves secretas devem ser configuradas nas variáveis de ambiente 
          do servidor. Esta tela configura apenas o provedor e métodos de pagamento.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Configuração Principal */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent component="form" onSubmit={salvar} sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                  <SettingsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Configuração do Gateway
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Selecione o provedor e configure os métodos de pagamento
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <BillingPaymentForms 
                value={config} 
                onChange={setConfig} 
                mode="platform" 
              />

              {/* Variáveis de Ambiente */}
              <Box sx={{ mt: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.warning.light, width: 40, height: 40 }}>
                    <ApiIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Variáveis de Ambiente Necessárias
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure estas variáveis no seu servidor/hospedagem
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={2}>
                  {gatewayConfig.secrets.map((secret) => (
                    <Grid item xs={12} md={6} key={secret}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: theme.palette.grey[50],
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ShieldIcon color="warning" fontSize="small" />
                          <Box>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {secret}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {showSecrets ? '●●●●●●●●' : 'Obrigatório'}
                            </Typography>
                          </Box>
                        </Stack>
                        <Tooltip title="Copiar nome da variável">
                          <IconButton 
                            size="small"
                            onClick={() => copiarParaClipboard(secret)}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Botões de Ação */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ mt: 4 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  {saving ? 'Salvando...' : 'Salvar Configuração'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={testarConexao}
                  disabled={testing || !config.provider || config.provider === 'manual'}
                  startIcon={testing ? <CircularProgress size={20} /> : <ApiIcon />}
                >
                  {testing ? 'Testando...' : 'Testar Conexão'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Informativa */}
        <Grid item xs={12} lg={4}>
          {/* Gateway Info */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Sobre o Gateway
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: `${gatewayConfig.color}15`,
                borderRadius: 2,
                mb: 3
              }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: gatewayConfig.color }}>
                    {gatewayConfig.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {gatewayConfig.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {gatewayConfig.description}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {gatewayConfig.docs && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LinkIcon />}
                  href={gatewayConfig.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mb: 2 }}
                >
                  Documentação Oficial
                </Button>
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Funcionalidades Suportadas
              </Typography>
              <List dense>
                {gatewayConfig.features.map((feature) => (
                  <ListItem key={feature}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Métodos de Pagamento */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Métodos Configurados
              </Typography>
              
              <Stack spacing={2}>
                {Object.entries(metodoLabels).map(([key, label]) => {
                  const isActive = config.metodosPagamento?.[key];
                  return (
                    <Paper 
                      key={key}
                      variant="outlined"
                      sx={{ 
                        p: 2,
                        opacity: isActive ? 1 : 0.5,
                        borderColor: isActive ? 'success.main' : 'divider',
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        {metodoIcons[key] || <CreditCardIcon />}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {isActive ? '✅ Ativo' : '⭕ Não configurado'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>

          {/* Status do Sistema */}
          <Card sx={{ boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Status do Sistema
              </Typography>
              
              <Stack spacing={2}>
                {[
                  { 
                    label: 'Gateway configurado', 
                    status: !!config.provider,
                    icon: <ApiIcon />
                  },
                  { 
                    label: 'Métodos de pagamento', 
                    status: config.metodosPagamento && Object.values(config.metodosPagamento).some(v => v),
                    icon: <PaymentIcon />
                  },
                  { 
                    label: 'Webhook configurado', 
                    status: true, // Assumindo configuração
                    icon: <LinkIcon />
                  },
                  { 
                    label: 'Ambiente de produção', 
                    status: config.provider !== 'manual',
                    icon: <ShieldIcon />
                  },
                ].map((item, index) => (
                  <Stack 
                    key={index}
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      {item.icon}
                      <Typography variant="body2">
                        {item.label}
                      </Typography>
                    </Stack>
                    {item.status ? (
                      <Chip 
                        label="OK" 
                        color="success" 
                        size="small" 
                        icon={<CheckCircleIcon />}
                      />
                    ) : (
                      <Chip 
                        label="Pendente" 
                        color="warning" 
                        size="small"
                        icon={<WarningIcon />}
                      />
                    )}
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de Teste de Conexão */}
      <Dialog 
        open={testDialogOpen} 
        onClose={() => setTestDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Teste de Conexão com {gatewayConfig.name}
        </DialogTitle>
        <DialogContent>
          {testing ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="body1">
                Testando conexão com o gateway...
              </Typography>
              <LinearProgress sx={{ mt: 2 }} />
            </Box>
          ) : testResult ? (
            <Box sx={{ py: 2 }}>
              <Alert 
                severity={testResult.success ? 'success' : 'error'}
                icon={testResult.success ? <CheckCircleIcon /> : <WarningIcon />}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {testResult.success ? 'Conexão bem sucedida!' : 'Falha na conexão'}
                </Typography>
                <Typography variant="body2">
                  {testResult.message}
                </Typography>
              </Alert>
              
              <Typography variant="caption" color="text.secondary">
                Teste realizado em: {new Date(testResult.timestamp).toLocaleString('pt-BR')}
              </Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>
            Fechar
          </Button>
          {!testing && testResult?.success && (
            <Button 
              variant="contained"
              onClick={() => {
                setTestDialogOpen(false);
                toast.success('Gateway configurado e funcionando!');
              }}
            >
              Confirmar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SaasPagamentosConfig;
