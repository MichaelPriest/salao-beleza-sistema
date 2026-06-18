// src/pages/SaasLanding.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Avatar,
  AvatarGroup,
  Rating,
  Divider,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RocketLaunch as RocketLaunchIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  HeadsetMic as SuporteIcon,
  TrendingUp as TrendingUpIcon,
  DevicesOutlined as DevicesIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, RECURSOS_SAAS, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const initialForm = {
  nome: '',
  razaoSocial: '',
  documento: '',
  email: '',
  telefone: '',
  planoId: 'individual',
  responsavelFinanceiro: '',
  segmento: 'salao',
  tamanhoEquipe: '1-5',
  origem: 'landing_saas',
  observacoes: '',
};

const vantagens = [
  { icon: <RocketLaunchIcon />, titulo: 'Setup em minutos', desc: 'Empresa online com página pública e checkout ativo rapidamente' },
  { icon: <SecurityIcon />, titulo: 'Dados isolados', desc: 'Cada empresa com banco de dados independente e seguro' },
  { icon: <SpeedIcon />, titulo: 'Performance', desc: 'Infraestrutura otimizada para alta disponibilidade' },
  { icon: <DevicesIcon />, titulo: 'Multi-plataforma', desc: 'Acesso web responsivo para todos os dispositivos' },
];

const depoimentos = [
  { nome: 'Ana Silva', empresa: 'Beleza Total', estrelas: 5, texto: 'Aumentamos 40% em agendamentos no primeiro mês. A gestão multiunidade é perfeita!' },
  { nome: 'Carlos Mendes', empresa: 'Barbearia Premium', estrelas: 5, texto: 'O checkout integrado facilitou nossa cobrança recorrente. Excelente custo-benefício.' },
  { nome: 'Marina Costa', empresa: 'Spa Harmony', estrelas: 4.5, texto: 'Página pública personalizada trouxe mais visibilidade. Suporte nota 10!' },
];

function SaasLanding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planos, setPlanos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [billingCycle, setBillingCycle] = useState('mensal');

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const planosData = await saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO));
        const ativos = planosData.filter(
          (plano) => (plano.status || 'ativo') !== 'inativo' && (plano.status || 'ativo') !== 'oculto'
        );
        setPlanos(ativos);
        setForm((current) => ({ ...current, planoId: ativos[0]?.id || 'individual' }));
      } catch (error) {
        console.error('Erro ao carregar landing SaaS:', error);
        toast.error('Erro ao carregar planos.');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const planoSelecionado = useMemo(
    () => planos.find((plano) => plano.id === form.planoId) || PLANOS_PADRAO[form.planoId],
    [form.planoId, planos]
  );

  const atualizarForm = (campo, valor) => setForm((current) => ({ ...current, [campo]: valor }));

  const getPrecoExibicao = (plano) => {
    if (billingCycle === 'anual') {
      return (plano.precoMensal * 10); // 2 meses grátis
    }
    return plano.precoMensal;
  };

  const cadastrarEmpresa = async (event) => {
    event.preventDefault();
    if (!form.nome || !form.email || !form.planoId) {
      toast.error('Informe empresa, e-mail e plano.');
      return;
    }

    setSaving(true);
    try {
      const leadPayload = {
        ...form,
        status: 'novo',
        etapa: 'cadastro_iniciado',
        planoNome: planoSelecionado?.nome || form.planoId,
        valorPlano: planoSelecionado?.precoMensal || 0,
        billingCycle,
        createdAt: new Date().toISOString(),
      };
      await firebaseService.add('leads_saas', leadPayload).catch((error) => 
        console.warn('Lead SaaS não gravado:', error)
      );

      const resultado = await saasService.criarEmpresa({
        ...form,
        emailFinanceiro: form.email,
        telefoneFinanceiro: form.telefone,
        planoId: form.planoId,
        billingCycle,
      });
      
      toast.success('Empresa cadastrada! Complete os dados e a cobrança em Minha Empresa.');
      navigate(`/empresa?onboarding=1&empresa=${resultado.empresa?.slug || resultado.empresa?.id}`);
    } catch (error) {
      console.error('Erro ao cadastrar empresa SaaS:', error);
      toast.error(error.message || 'Erro ao cadastrar empresa.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip 
                icon={<VerifiedIcon />} 
                label="Plataforma confiável por +500 empresas" 
                sx={{ 
                  mb: 3, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                  fontWeight: 600,
                }} 
              />
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 900, 
                  lineHeight: 1.1, 
                  mb: 2, 
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  color: 'white',
                }}
              >
                Revolucione seu Negócio de Beleza e Estética
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                }}
              >
                Plataforma completa com agendamento, checkout integrado e gestão multiunidade. 
                Cada empresa com seu próprio ambiente, link público e formas de pagamento.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => document.getElementById('planos-saas')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ 
                    bgcolor: 'white', 
                    color: '#667eea',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#f0f0f0' },
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                  }}
                >
                  Começar Agora Grátis
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => document.getElementById('cadastro-saas')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    fontWeight: 700,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                  }}
                >
                  Ver Demonstração
                </Button>
              </Stack>
              
              {/* Métricas rápidas */}
              <Stack direction="row" spacing={4} sx={{ mt: 6 }}>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>+500</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Empresas ativas</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>98%</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Satisfação</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>24/7</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Suporte Premium</Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper 
                elevation={24} 
                sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  bgcolor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                  Por que escolher nossa plataforma?
                </Typography>
                {[
                  'Página pública personalizada para sua marca',
                  'Checkout Stripe, Mercado Pago e PagSeguro',
                  'Cartão, Pix e boleto automáticos',
                  'Ambiente isolado por empresa e unidade',
                  'Gestão completa de agendamentos',
                  'Relatórios e análises em tempo real',
                ].map((item, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                    <Typography variant="body1">{item}</Typography>
                  </Stack>
                ))}
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={1} alignItems="center">
                  <AvatarGroup>
                    <Avatar alt="Cliente 1" src="/static/images/avatar/1.jpg" />
                    <Avatar alt="Cliente 2" src="/static/images/avatar/2.jpg" />
                    <Avatar alt="Cliente 3" src="/static/images/avatar/3.jpg" />
                  </AvatarGroup>
                  <Typography variant="body2" color="text.secondary">
                    +500 empresas confiam
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Seção de Vantagens */}
      <Box sx={{ bgcolor: '#f8f9ff', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
            Vantagens Exclusivas
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
            Tecnologia completa para escalar seu marketplace de beleza
          </Typography>
          
          <Grid container spacing={4}>
            {vantagens.map((vantagem, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', boxShadow: 3 }}>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <IconButton sx={{ bgcolor: '#667eea', color: 'white', mb: 2, p: 2 }}>
                      {vantagem.icon}
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {vantagem.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {vantagem.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Planos */}
      <Box id="planos-saas" sx={{ bgcolor: '#ffffff', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
            Planos que Crescem com Você
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
            Escolha o plano ideal e comece a transformar seu negócio
          </Typography>
          
          {/* Toggle billing cycle */}
          <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 6 }}>
            <Button 
              variant={billingCycle === 'mensal' ? 'contained' : 'outlined'}
              onClick={() => setBillingCycle('mensal')}
            >
              Mensal
            </Button>
            <Button 
              variant={billingCycle === 'anual' ? 'contained' : 'outlined'}
              onClick={() => setBillingCycle('anual')}
              sx={{ position: 'relative' }}
            >
              Anual
              <Chip 
                label="20% OFF" 
                size="small" 
                color="success" 
                sx={{ position: 'absolute', top: -10, right: -10 }} 
              />
            </Button>
          </Stack>
          
          <Grid container spacing={4} justifyContent="center">
            {planos.map((plano) => (
              <Grid item xs={12} md={4} key={plano.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    border: form.planoId === plano.id ? '3px solid' : '1px solid', 
                    borderColor: form.planoId === plano.id ? '#667eea' : 'divider',
                    boxShadow: form.planoId === plano.id ? 8 : 1,
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    {plano.tipo === 'destaque' && (
                      <Chip label="Mais Popular" color="primary" sx={{ mb: 2 }} />
                    )}
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                      {plano.nome}
                    </Typography>
                    <Typography variant="h3" color="primary" sx={{ fontWeight: 900 }}>
                      {formatCurrency(getPrecoExibicao(plano), plano.moeda)}
                      <Typography component="span" variant="body2" color="text.secondary">
                        /{billingCycle === 'anual' ? 'ano' : 'mês'}
                      </Typography>
                    </Typography>
                    {billingCycle === 'anual' && (
                      <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        Economize {formatCurrency(plano.precoMensal * 2, plano.moeda)} por ano!
                      </Typography>
                    )}
                    {plano.descricao && (
                      <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                        {plano.descricao}
                      </Typography>
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      {(plano.recursos || []).slice(0, 8).map((recurso, idx) => (
                        <Stack key={idx} direction="row" spacing={1.5}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2">
                            {RECURSOS_SAAS.find((item) => item.id === recurso)?.nome || recurso}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                    <Button 
                      fullWidth 
                      variant={form.planoId === plano.id ? 'contained' : 'outlined'} 
                      size="large"
                      onClick={() => {
                        atualizarForm('planoId', plano.id);
                        document.getElementById('cadastro-saas')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      sx={{ fontWeight: 700 }}
                    >
                      {form.planoId === plano.id ? 'Selecionado' : 'Escolher Plano'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Depoimentos */}
      <Box sx={{ bgcolor: '#f8f9ff', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', mb: 6 }}>
            O Que Nossos Clientes Dizem
          </Typography>
          
          <Grid container spacing={4}>
            {depoimentos.map((depoimento, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Rating value={depoimento.estrelas} readOnly precision={0.5} sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                      "{depoimento.texto}"
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar>{depoimento.nome[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {depoimento.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {depoimento.empresa}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Formulário de Cadastro */}
      <Box id="cadastro-saas" sx={{ bgcolor: '#ffffff', py: 8 }}>
        <Container maxWidth="md">
          <Card component="form" onSubmit={cadastrarEmpresa} sx={{ boxShadow: 8, scrollMarginTop: 80 }}>
            <CardContent sx={{ p: { xs: 3, md: 6 } }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>
                Comece sua Jornada Agora
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Cadastre sua empresa e comece a usar a plataforma em minutos. 
                Sem compromisso, cancele quando quiser.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Nome da empresa *" 
                    value={form.nome} 
                    onChange={(e) => atualizarForm('nome', e.target.value)} 
                    fullWidth 
                    required 
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Razão social" 
                    value={form.razaoSocial} 
                    onChange={(e) => atualizarForm('razaoSocial', e.target.value)} 
                    fullWidth 
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField 
                    label="CNPJ/CPF" 
                    value={form.documento} 
                    onChange={(e) => atualizarForm('documento', e.target.value)} 
                    fullWidth 
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField 
                    label="E-mail *" 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => atualizarForm('email', e.target.value)} 
                    fullWidth 
                    required 
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField 
                    label="WhatsApp" 
                    value={form.telefone} 
                    onChange={(e) => atualizarForm('telefone', e.target.value)} 
                    fullWidth 
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    select 
                    label="Segmento" 
                    value={form.segmento} 
                    onChange={(e) => atualizarForm('segmento', e.target.value)} 
                    fullWidth 
                    variant="outlined"
                  >
                    <MenuItem value="salao">Salão de beleza</MenuItem>
                    <MenuItem value="barbearia">Barbearia</MenuItem>
                    <MenuItem value="clinica_estetica">Clínica estética</MenuItem>
                    <MenuItem value="spa">Spa</MenuItem>
                    <MenuItem value="outro">Outro</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    select 
                    label="Tamanho da equipe" 
                    value={form.tamanhoEquipe} 
                    onChange={(e) => atualizarForm('tamanhoEquipe', e.target.value)} 
                    fullWidth 
                    variant="outlined"
                  >
                    <MenuItem value="1-5">1 a 5 pessoas</MenuItem>
                    <MenuItem value="6-15">6 a 15 pessoas</MenuItem>
                    <MenuItem value="16-50">16 a 50 pessoas</MenuItem>
                    <MenuItem value="50+">Mais de 50 pessoas</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Responsável financeiro" 
                    value={form.responsavelFinanceiro} 
                    onChange={(e) => atualizarForm('responsavelFinanceiro', e.target.value)} 
                    fullWidth 
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    select 
                    label="Plano *" 
                    value={form.planoId} 
                    onChange={(e) => atualizarForm('planoId', e.target.value)} 
                    fullWidth 
                    required 
                    variant="outlined"
                  >
                    {planos.map((plano) => (
                      <MenuItem key={plano.id} value={plano.id}>
                        {plano.nome} - {formatCurrency(getPrecoExibicao(plano), plano.moeda)}/{billingCycle === 'anual' ? 'ano' : 'mês'}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                {planoSelecionado && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Plano {planoSelecionado.nome} selecionado
                      </Typography>
                      <Typography variant="body2">
                        Recursos incluídos: {(planoSelecionado.recursos || []).map((recurso, idx) => (
                          <Chip 
                            key={idx}
                            label={RECURSOS_SAAS.find((item) => item.id === recurso)?.nome || recurso}
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <TextField 
                    label="Qual seu principal objetivo?" 
                    multiline 
                    minRows={3} 
                    value={form.observacoes} 
                    onChange={(e) => atualizarForm('observacoes', e.target.value)} 
                    fullWidth 
                    variant="outlined"
                    placeholder="Ex.: automatizar agendamentos, aumentar vendas online, gerenciar múltiplas unidades..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    fullWidth
                    disabled={saving}
                    sx={{ 
                      py: 2, 
                      fontWeight: 700, 
                      fontSize: '1.1rem',
                      bgcolor: '#667eea',
                      '&:hover': { bgcolor: '#5568d3' },
                    }}
                  >
                    {saving ? (
                      <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                    ) : (
                      <RocketLaunchIcon sx={{ mr: 1 }} />
                    )}
                    {saving ? 'Processando...' : 'Começar Agora - Grátis por 7 dias'}
                  </Button>
                </Grid>
                
                <Grid item xs={12} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    <SecurityIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Seus dados estão seguros. Não compartilhamos informações com terceiros.
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box sx={{ bgcolor: '#2d3748', py: 4, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            © 2024 Sua Plataforma SaaS. Todos os direitos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default SaasLanding;
