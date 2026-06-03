// src/pages/SaasPlanos.js
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import { WorkspacePremium as WorkspacePremiumIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, STATUS_ASSINATURA, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

function SaasPlanos() {
  const [loading, setLoading] = useState(true);
  const [planos, setPlanos] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const [planosData, assinaturasData] = await Promise.all([
          saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO)),
          firebaseService.getAll('assinaturas').catch(() => []),
        ]);
        setPlanos(planosData);
        setAssinaturas(assinaturasData);
      } catch (error) {
        console.error('Erro ao carregar planos SaaS:', error);
        toast.error(error.message || 'Erro ao carregar planos.');
      } finally {
        setLoading(false);
      }
    };

    carregar();
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

  if (loading) return <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 800 }}>Planos e assinaturas</Typography><Typography color="text.secondary">Visão dos planos comerciais, limites e uso por empresas contratantes.</Typography></Box>
        <Chip icon={<WorkspacePremiumIcon />} label={`${planos.length} planos`} color="primary" />
      </Stack>

      <Grid container spacing={3}>
        {planos.map((plano) => {
          const uso = usoPorPlano[plano.id] || { total: 0, ativas: 0 };
          return (
            <Grid item xs={12} md={6} key={plano.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{plano.nome}</Typography>
                    <Chip label={plano.tipo || plano.id} />
                  </Stack>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>{formatCurrency(plano.precoMensal, plano.moeda)}<Typography component="span" variant="body2">/mês</Typography></Typography>
                  {plano.precoPorUnidade && <Typography color="text.secondary">+ {formatCurrency(plano.precoPorUnidade, plano.moeda)} por unidade adicional</Typography>}
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}><Chip color="success" label={`${uso.ativas} ativas`} /><Chip label={`${uso.total} no total`} /></Stack>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Limites</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>{Object.entries(plano.limites || {}).map(([chave, valor]) => <Chip key={chave} size="small" label={`${chave}: ${valor}`} variant="outlined" />)}</Stack>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Recursos</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">{(plano.recursos || []).map((recurso) => <Chip key={recurso} size="small" label={recurso} variant="outlined" />)}</Stack>
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
