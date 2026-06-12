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
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, RocketLaunch as RocketLaunchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, RECURSOS_SAAS, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

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

function SaasLanding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planos, setPlanos] = useState([]);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const planosData = await saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO));
        const ativos = planosData.filter((plano) => (plano.status || 'ativo') !== 'inativo' && (plano.status || 'ativo') !== 'oculto');
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

  const planoSelecionado = useMemo(() => planos.find((plano) => plano.id === form.planoId) || PLANOS_PADRAO[form.planoId], [form.planoId, planos]);

  const atualizarForm = (campo, valor) => setForm((current) => ({ ...current, [campo]: valor }));

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
        createdAt: new Date().toISOString(),
      };
      await firebaseService.add('leads_saas', leadPayload).catch((error) => console.warn('Lead SaaS não gravado:', error));

      const resultado = await saasService.criarEmpresa({
        ...form,
        emailFinanceiro: form.email,
        telefoneFinanceiro: form.telefone,
        planoId: form.planoId,
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

  if (loading) return <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f7f2ff 0%, #ffffff 100%)', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 4, md: 7 } }}>
        <Grid container spacing={4} alignItems="center" sx={{ mb: 5 }}>
          <Grid item xs={12} md={6}>
            <Chip icon={<RocketLaunchIcon />} label="Sistema SaaS para salões e clínicas" color="primary" sx={{ mb: 2 }} />
            <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1.05, mb: 2, fontSize: { xs: '2.25rem', md: '3.75rem' } }}>Venda, agende e cobre mensalidades em uma plataforma multiempresa.</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '1rem', md: '1.25rem' } }}>Cada empresa ganha seu próprio link público, página personalizável, unidades isoladas, formas de pagamento e recursos liberados conforme o plano contratado.</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" size="large" onClick={() => document.getElementById('cadastro-saas')?.scrollIntoView({ behavior: 'smooth' })}>Começar agora</Button>
              <Button variant="outlined" size="large" onClick={() => document.getElementById('planos-saas')?.scrollIntoView({ behavior: 'smooth' })}>Ver planos</Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Captação + operação em um fluxo</Typography>
              {['Página pública para captar novos clientes', 'Checkout por Stripe, Mercado Pago ou PagSeguro/PagBank', 'Cartão, Pix e boleto conforme gateway configurado', 'Tenant isolado por empresa e unidade', 'Site público com cores e conteúdo próprios'].map((item) => (
                <Stack key={item} direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}><CheckCircleIcon color="success" /><Typography>{item}</Typography></Stack>
              ))}
            </Paper>
          </Grid>
        </Grid>

        <Box id="planos-saas" sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Planos comerciais</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Os valores e recursos abaixo são editados no admin SaaS e usados automaticamente no cadastro.</Typography>
          <Grid container spacing={3}>
            {planos.map((plano) => (
              <Grid item xs={12} md={4} key={plano.id}>
                <Card sx={{ height: '100%', border: form.planoId === plano.id ? '2px solid' : '1px solid', borderColor: form.planoId === plano.id ? 'primary.main' : 'divider' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}><Typography variant="h5" sx={{ fontWeight: 800 }}>{plano.nome}</Typography><Chip label={plano.tipo || plano.id} /></Stack>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 900 }}>{formatCurrency(plano.precoMensal, plano.moeda)}<Typography component="span" variant="body2">/mês</Typography></Typography>
                    {plano.descricao && <Typography color="text.secondary" sx={{ mt: 1 }}>{plano.descricao}</Typography>}
                    <Stack spacing={1} sx={{ my: 2 }}>
                      {(plano.recursos || []).slice(0, 6).map((recurso) => <Chip key={recurso} size="small" label={RECURSOS_SAAS.find((item) => item.id === recurso)?.nome || recurso} variant="outlined" />)}
                    </Stack>
                    <Button fullWidth variant={form.planoId === plano.id ? 'contained' : 'outlined'} onClick={() => atualizarForm('planoId', plano.id)}>Escolher plano</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Card id="cadastro-saas" component="form" onSubmit={cadastrarEmpresa} sx={{ scrollMarginTop: 24 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Cadastre sua empresa</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Depois do cadastro, configure cobrança, unidades, link público e layout da página da empresa.</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><TextField label="Nome da empresa" value={form.nome} onChange={(e) => atualizarForm('nome', e.target.value)} fullWidth required /></Grid>
              <Grid item xs={12} md={6}><TextField label="Razão social" value={form.razaoSocial} onChange={(e) => atualizarForm('razaoSocial', e.target.value)} fullWidth /></Grid>
              <Grid item xs={12} md={4}><TextField label="CNPJ/CPF" value={form.documento} onChange={(e) => atualizarForm('documento', e.target.value)} fullWidth /></Grid>
              <Grid item xs={12} md={4}><TextField label="E-mail financeiro" type="email" value={form.email} onChange={(e) => atualizarForm('email', e.target.value)} fullWidth required /></Grid>
              <Grid item xs={12} md={4}><TextField label="Telefone/WhatsApp" value={form.telefone} onChange={(e) => atualizarForm('telefone', e.target.value)} fullWidth /></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField select label="Segmento" value={form.segmento} onChange={(e) => atualizarForm('segmento', e.target.value)} fullWidth><MenuItem value="salao">Salão de beleza</MenuItem><MenuItem value="barbearia">Barbearia</MenuItem><MenuItem value="clinica_estetica">Clínica estética</MenuItem><MenuItem value="spa">Spa</MenuItem><MenuItem value="outro">Outro</MenuItem></TextField></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField select label="Tamanho da equipe" value={form.tamanhoEquipe} onChange={(e) => atualizarForm('tamanhoEquipe', e.target.value)} fullWidth><MenuItem value="1-5">1 a 5 pessoas</MenuItem><MenuItem value="6-15">6 a 15 pessoas</MenuItem><MenuItem value="16-50">16 a 50 pessoas</MenuItem><MenuItem value="50+">Mais de 50 pessoas</MenuItem></TextField></Grid>
              <Grid item xs={12} md={6}><TextField label="Responsável" value={form.responsavelFinanceiro} onChange={(e) => atualizarForm('responsavelFinanceiro', e.target.value)} fullWidth /></Grid>
              <Grid item xs={12} md={6}><TextField select label="Plano escolhido" value={form.planoId} onChange={(e) => atualizarForm('planoId', e.target.value)} fullWidth>{planos.map((plano) => <MenuItem key={plano.id} value={plano.id}>{plano.nome} - {formatCurrency(plano.precoMensal, plano.moeda)}/mês</MenuItem>)}</TextField></Grid>
              <Grid item xs={12}>{planoSelecionado && <Alert severity="info">Plano selecionado: <strong>{planoSelecionado.nome}</strong>. Recursos liberados: {(planoSelecionado.recursos || []).map((recurso) => RECURSOS_SAAS.find((item) => item.id === recurso)?.nome || recurso).join(', ') || 'a configurar'}.</Alert>}</Grid>
              <Grid item xs={12}><TextField label="Objetivo principal" multiline minRows={3} value={form.observacoes} onChange={(e) => atualizarForm('observacoes', e.target.value)} fullWidth placeholder="Ex.: captar mais clientes, automatizar cobranças, controlar unidades..." /></Grid>
              <Grid item xs={12}><Button type="submit" variant="contained" size="large" disabled={saving}>{saving ? 'Cadastrando...' : 'Cadastrar e configurar empresa'}</Button></Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default SaasLanding;
