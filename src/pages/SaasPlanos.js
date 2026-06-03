// src/pages/SaasPlanos.js
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
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Save as SaveIcon, WorkspacePremium as WorkspacePremiumIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, RECURSOS_SAAS, STATUS_ASSINATURA, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const criarPlanoBase = () => ({
  id: '',
  nome: '',
  tipo: 'individual',
  moeda: 'BRL',
  status: 'ativo',
  precoMensal: 0,
  precoPorUnidade: 0,
  limites: {
    unidades: 1,
    usuarios: 5,
    clientes: 500,
  },
  recursos: [],
  descricao: '',
});

function SaasPlanos() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planos, setPlanos] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [planoForm, setPlanoForm] = useState(criarPlanoBase());

  const carregar = async () => {
    setLoading(true);
    try {
      const [planosData, assinaturasData] = await Promise.all([
        saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO)),
        firebaseService.getAll('assinaturas').catch(() => []),
      ]);
      setPlanos(planosData);
      setAssinaturas(assinaturasData);
      if (!planoForm.id && planosData[0]) {
        editarPlano(planosData[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar planos SaaS:', error);
      toast.error(error.message || 'Erro ao carregar planos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usoPorPlano = useMemo(() => assinaturas.reduce((acc, assinatura) => {
    const planoId = assinatura.planoId || 'individual';
    return {
      ...acc,
      [planoId]: {
        total: (acc[planoId]?.total || 0) + 1,
        ativas: (acc[planoId]?.ativas || 0) + ([STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(assinatura.status) ? 1 : 0),
      }
    };
  }, {}), [assinaturas]);

  const editarPlano = (plano) => {
    setPlanoForm({
      ...criarPlanoBase(),
      ...plano,
      limites: {
        ...criarPlanoBase().limites,
        ...(plano.limites || {}),
      },
      recursos: plano.recursos || [],
    });
  };

  const atualizarCampo = (campo, valor) => {
    setPlanoForm((current) => ({ ...current, [campo]: valor }));
  };

  const atualizarLimite = (campo, valor) => {
    setPlanoForm((current) => ({
      ...current,
      limites: {
        ...(current.limites || {}),
        [campo]: Number(valor || 0),
      },
    }));
  };

  const alternarRecurso = (recursoId) => {
    setPlanoForm((current) => {
      const recursos = current.recursos || [];
      return {
        ...current,
        recursos: recursos.includes(recursoId)
          ? recursos.filter((item) => item !== recursoId)
          : [...recursos, recursoId],
      };
    });
  };

  const salvarPlano = async (event) => {
    event.preventDefault();
    if (!planoForm.id || !planoForm.nome) {
      toast.error('Informe o código e o nome do plano.');
      return;
    }

    setSaving(true);
    try {
      const salvo = await saasService.salvarPlano(planoForm);
      setPlanos((current) => {
        const exists = current.some((plano) => plano.id === salvo.id);
        return exists ? current.map((plano) => (plano.id === salvo.id ? salvo : plano)) : [...current, salvo];
      });
      setPlanoForm({
        ...criarPlanoBase(),
        ...salvo,
        limites: { ...criarPlanoBase().limites, ...(salvo.limites || {}) },
        recursos: salvo.recursos || [],
      });
      toast.success('Plano salvo com valores e recursos atualizados.');
    } catch (error) {
      console.error('Erro ao salvar plano SaaS:', error);
      toast.error(error.message || 'Erro ao salvar plano.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Planos, valores e funcionalidades</Typography>
          <Typography color="text.secondary">Defina mensalidades, limites e recursos liberados para cada plano vendido no SaaS.</Typography>
        </Box>
        <Chip icon={<WorkspacePremiumIcon />} label={`${planos.length} planos`} color="primary" />
      </Stack>

      <Card component="form" onSubmit={salvarPlano} sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Editor comercial do plano</Typography>
              <Typography variant="body2" color="text.secondary">As alterações são usadas no checkout, na landing e no bloqueio de funcionalidades.</Typography>
            </Box>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>{saving ? 'Salvando...' : 'Salvar plano'}</Button>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField label="Código do plano" value={planoForm.id} onChange={(e) => atualizarCampo('id', e.target.value.trim().toLowerCase())} fullWidth required helperText="Ex.: individual, multiunidades" /></Grid>
            <Grid item xs={12} md={5}><TextField label="Nome comercial" value={planoForm.nome} onChange={(e) => atualizarCampo('nome', e.target.value)} fullWidth required /></Grid>
            <Grid item xs={12} md={2}><TextField select label="Tipo" value={planoForm.tipo} onChange={(e) => atualizarCampo('tipo', e.target.value)} fullWidth><MenuItem value="individual">Individual</MenuItem><MenuItem value="multiunidades">Multiunidades</MenuItem><MenuItem value="enterprise">Enterprise</MenuItem></TextField></Grid>
            <Grid item xs={12} md={2}><TextField select label="Status" value={planoForm.status || 'ativo'} onChange={(e) => atualizarCampo('status', e.target.value)} fullWidth><MenuItem value="ativo">Ativo</MenuItem><MenuItem value="inativo">Inativo</MenuItem><MenuItem value="oculto">Oculto</MenuItem></TextField></Grid>
            <Grid item xs={12} md={3}><TextField label="Mensalidade" type="number" value={planoForm.precoMensal} onChange={(e) => atualizarCampo('precoMensal', e.target.value)} fullWidth inputProps={{ min: 0, step: '0.01' }} /></Grid>
            <Grid item xs={12} md={3}><TextField label="Valor por unidade extra" type="number" value={planoForm.precoPorUnidade} onChange={(e) => atualizarCampo('precoPorUnidade', e.target.value)} fullWidth inputProps={{ min: 0, step: '0.01' }} /></Grid>
            <Grid item xs={12} md={2}><TextField label="Unidades" type="number" value={planoForm.limites?.unidades || 0} onChange={(e) => atualizarLimite('unidades', e.target.value)} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField label="Usuários" type="number" value={planoForm.limites?.usuarios || 0} onChange={(e) => atualizarLimite('usuarios', e.target.value)} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField label="Clientes" type="number" value={planoForm.limites?.clientes || 0} onChange={(e) => atualizarLimite('clientes', e.target.value)} fullWidth /></Grid>
            <Grid item xs={12}><TextField label="Descrição para venda" value={planoForm.descricao || ''} onChange={(e) => atualizarCampo('descricao', e.target.value)} fullWidth multiline minRows={2} /></Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>Marque exatamente o que o plano cobre. O menu do sistema usa estes recursos para liberar ou ocultar funcionalidades por empresa.</Alert>
              <Grid container spacing={1}>
                {RECURSOS_SAAS.map((recurso) => (
                  <Grid item xs={12} sm={6} md={4} key={recurso.id}>
                    <FormControlLabel
                      control={<Switch checked={(planoForm.recursos || []).includes(recurso.id)} onChange={() => alternarRecurso(recurso.id)} />}
                      label={recurso.nome}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {planos.map((plano) => {
          const uso = usoPorPlano[plano.id] || { total: 0, ativas: 0 };
          return (
            <Grid item xs={12} md={6} key={plano.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{plano.nome}</Typography>
                    <Button size="small" variant="outlined" onClick={() => editarPlano(plano)}>Editar</Button>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}><Chip label={plano.tipo || plano.id} /><Chip label={plano.status || 'ativo'} color={(plano.status || 'ativo') === 'ativo' ? 'success' : 'default'} /></Stack>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>{formatCurrency(plano.precoMensal, plano.moeda)}<Typography component="span" variant="body2">/mês</Typography></Typography>
                  {plano.precoPorUnidade > 0 && <Typography color="text.secondary">+ {formatCurrency(plano.precoPorUnidade, plano.moeda)} por unidade adicional</Typography>}
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}><Chip color="success" label={`${uso.ativas} ativas`} /><Chip label={`${uso.total} no total`} /></Stack>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Limites</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>{Object.entries(plano.limites || {}).map(([chave, valor]) => <Chip key={chave} size="small" label={`${chave}: ${valor}`} variant="outlined" />)}</Stack>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Recursos liberados</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">{(plano.recursos || []).map((recurso) => <Chip key={recurso} size="small" label={RECURSOS_SAAS.find((item) => item.id === recurso)?.nome || recurso} variant="outlined" />)}</Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default SaasPlanos;
