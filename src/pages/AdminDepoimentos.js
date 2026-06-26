import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import { CheckCircle as CheckIcon, RateReview as RateReviewIcon, Refresh as RefreshIcon, Star as StarIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { saasService } from '../services/saasService';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR');
};

function AdminDepoimentos() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [depoimentos, setDepoimentos] = useState([]);
  const [empresa, setEmpresa] = useState(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const contexto = saasService.getContextoAtual();
      const [empresaData, avaliacoesData] = await Promise.all([
        contexto.empresaId ? firebaseService.getById('empresas', contexto.empresaId).catch(() => contexto.empresa || null) : Promise.resolve(contexto.empresa || null),
        firebaseService.query('avaliacoes', [{ field: 'tipo', operator: '==', value: 'depoimento_atendimento' }], 'createdAt', 'desc').catch(() => []),
      ]);
      setEmpresa(empresaData);
      setDepoimentos((avaliacoesData || []).filter((item) => item.origem === 'portal_cliente' || item.tipo === 'depoimento_atendimento'));
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error);
      toast.error('Erro ao carregar depoimentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const aprovarDepoimento = async (depoimento) => {
    if (!empresa?.id) {
      toast.error('Empresa não identificada para publicar o depoimento.');
      return;
    }

    try {
      setSavingId(depoimento.id);
      const depoimentoPublicado = {
        id: depoimento.id,
        nome: depoimento.clienteNome || 'Cliente',
        texto: depoimento.texto || '',
        nota: depoimento.nota || 5,
        servicoNome: depoimento.servicoNome || '',
        atendimentoId: depoimento.atendimentoId || null,
      };
      const depoimentosPublicos = [
        ...((empresa.sitePublico?.depoimentos || []).filter((item) => item.id !== depoimento.id)),
        depoimentoPublicado,
      ];

      await saasService.salvarPortalEmpresa(empresa.id, {
        slug: empresa.slug || empresa.nome,
        sitePublico: {
          ...(empresa.sitePublico || {}),
          depoimentos: depoimentosPublicos,
          mostrarDepoimentos: true,
        },
      });
      await firebaseService.update('avaliacoes', depoimento.id, {
        status: 'aprovado',
        aprovadoEm: new Date().toISOString(),
      });
      toast.success('Depoimento aprovado e publicado no site.');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao aprovar depoimento:', error);
      toast.error('Erro ao aprovar depoimento.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, background: 'linear-gradient(135deg,#7b1fa2,#ec407a)', color: 'white' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Depoimentos para aprovação</Typography>
            <Typography sx={{ opacity: 0.9 }}>Aprove os depoimentos enviados pelo portal do cliente antes de publicar no site.</Typography>
          </Box>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={carregarDados} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }}>Atualizar</Button>
        </Stack>
      </Paper>

      {depoimentos.length === 0 ? (
        <Alert severity="info">Nenhum depoimento recebido pelo portal do cliente ainda.</Alert>
      ) : (
        <Grid container spacing={2.5}>
          {depoimentos.map((depoimento) => (
            <Grid item xs={12} md={6} key={depoimento.id}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 10px 28px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
                    <RateReviewIcon color="secondary" />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{depoimento.clienteNome || 'Cliente'}</Typography>
                    <Chip size="small" icon={<StarIcon />} label={`${depoimento.nota || 5} estrelas`} color="warning" />
                    <Chip size="small" label={depoimento.status === 'aprovado' ? 'Aprovado' : 'Pendente'} color={depoimento.status === 'aprovado' ? 'success' : 'default'} />
                  </Stack>
                  <Typography variant="body1" sx={{ mb: 1 }}>“{depoimento.texto || 'Sem texto'}”</Typography>
                  <Typography variant="body2" color="text.secondary">{depoimento.servicoNome || 'Atendimento'} • {formatDate(depoimento.createdAt || depoimento.dataAtendimento)}</Typography>
                  <Button fullWidth variant="contained" startIcon={<CheckIcon />} disabled={depoimento.status === 'aprovado' || savingId === depoimento.id} onClick={() => aprovarDepoimento(depoimento)} sx={{ mt: 2 }}>
                    {depoimento.status === 'aprovado' ? 'Já publicado' : 'Aprovar e publicar no site'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default AdminDepoimentos;
