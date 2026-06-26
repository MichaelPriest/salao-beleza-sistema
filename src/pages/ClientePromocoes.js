import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  ContentCopy as CopyIcon,
  LocalOffer as LocalOfferIcon,
  OpenInNew as OpenInNewIcon,
  Share as ShareIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { formatLocalDate, getLocalDateInputValue } from '../utils/dateTimeUtils';

const isPromocaoDisponivel = (campanha = {}) => {
  const hoje = getLocalDateInputValue();
  const inicioOk = !campanha.dataInicio || campanha.dataInicio <= hoje;
  const fimOk = !campanha.dataFim || campanha.dataFim >= hoje;
  const status = String(campanha.status || '').toLowerCase();
  return inicioOk && fimOk && !['rascunho', 'cancelada', 'cancelado', 'erro', 'inativa'].includes(status);
};

const formatarPeriodo = (campanha = {}) => {
  const inicio = campanha.dataInicio ? formatLocalDate(campanha.dataInicio) : 'Hoje';
  const fim = campanha.dataFim ? formatLocalDate(campanha.dataFim) : 'Enquanto durar';
  return `${inicio} até ${fim}`;
};

function ClientePromocoes() {
  const [loading, setLoading] = useState(true);
  const [campanhas, setCampanhas] = useState([]);

  const promocoesAtivas = useMemo(() => (campanhas || [])
    .filter(isPromocaoDisponivel)
    .sort((a, b) => String(a.dataFim || '9999-12-31').localeCompare(String(b.dataFim || '9999-12-31'))), [campanhas]);

  useEffect(() => {
    carregarPromocoes();
  }, []);

  const carregarPromocoes = async () => {
    try {
      setLoading(true);
      const campanhasData = await firebaseService.getAll('campanhas').catch(() => []);
      setCampanhas(campanhasData || []);
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
      toast.error('Não foi possível carregar as promoções.');
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = async (campanha) => {
    const link = `${window.location.origin}/promocoes/${campanha.id}`;
    await navigator.clipboard?.writeText(link);
    toast.success('Link da promoção copiado!');
  };

  const compartilhar = async (campanha) => {
    const link = `${window.location.origin}/promocoes/${campanha.id}`;
    if (navigator.share) {
      await navigator.share({ title: campanha.nome, text: campanha.descricao || campanha.objetivo || '', url: link });
      return;
    }
    await copiarLink(campanha);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 1, sm: 2 }, pb: 4 }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: 'white', background: 'linear-gradient(135deg, #ff6f00 0%, #ec407a 55%, #7b1fa2 100%)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', right: -60, top: -70, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.14)' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ position: 'relative' }}>
          <Box>
            <Chip icon={<StarIcon />} label="Ofertas especiais para você" sx={{ mb: 1, bgcolor: 'rgba(255,255,255,.18)', color: 'white', fontWeight: 800 }} />
            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>Promoções do salão</Typography>
            <Typography sx={{ opacity: 0.92, maxWidth: 720, mt: 1 }}>Veja campanhas, benefícios e ofertas disponíveis para seus próximos agendamentos.</Typography>
          </Box>
          <Avatar sx={{ width: 76, height: 76, bgcolor: 'rgba(255,255,255,.22)' }}><LocalOfferIcon fontSize="large" /></Avatar>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
        <Chip color="warning" label={`${promocoesAtivas.length} promoção(ões) ativa(s)`} sx={{ fontWeight: 800 }} />
        <Chip label="Confira as regras de cada oferta antes de usar" />
      </Stack>

      {promocoesAtivas.length === 0 ? (
        <Alert severity="info">Nenhuma promoção ativa no momento. Volte em breve para conferir novas ofertas.</Alert>
      ) : (
        <Grid container spacing={2.5}>
          {promocoesAtivas.map((campanha) => (
            <Grid item xs={12} md={6} key={campanha.id}>
              <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid rgba(236,64,122,.16)', boxShadow: '0 12px 32px rgba(123,31,162,.08)' }}>
                <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#fff3e0', color: '#ff6f00', width: 52, height: 52 }}><LocalOfferIcon /></Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>{campanha.nome || 'Promoção especial'}</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        <Chip size="small" icon={<CalendarIcon />} label={formatarPeriodo(campanha)} />
                        <Chip size="small" label={campanha.tipo || 'campanha'} />
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48, mb: 2 }}>
                    {campanha.descricao || campanha.objetivo || 'Promoção disponível para clientes do salão.'}
                  </Typography>

                  {campanha.beneficios?.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                      {campanha.beneficios.slice(0, 3).map((beneficio, index) => (
                        <Chip key={index} size="small" color="secondary" variant="outlined" label={beneficio.nome || beneficio.descricao || beneficio} />
                      ))}
                    </Stack>
                  )}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button fullWidth variant="contained" endIcon={<OpenInNewIcon />} href={`/promocoes/${campanha.id}`} target="_blank" sx={{ bgcolor: '#7b1fa2' }}>
                      Ver detalhes
                    </Button>
                    <Button variant="outlined" startIcon={<ShareIcon />} onClick={() => compartilhar(campanha)}>
                      Compartilhar
                    </Button>
                    <Button variant="text" startIcon={<CopyIcon />} onClick={() => copiarLink(campanha)}>
                      Copiar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default ClientePromocoes;
