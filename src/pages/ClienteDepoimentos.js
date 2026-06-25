import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Paper, Rating, Stack, TextField, Typography } from '@mui/material';
import { CalendarToday as CalendarIcon, CheckCircle as CheckCircleIcon, RateReview as RateReviewIcon, Spa as SpaIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';

const getClienteIds = (cliente, firebaseUser) => Array.from(new Set([
  firebaseUser?.uid, cliente?.id, cliente?.uid, cliente?.authUid, cliente?.googleUid, cliente?.email,
].filter(Boolean)));
const formatarData = (data) => {
  if (!data) return 'Data não informada';
  try { return new Date(data).toLocaleDateString('pt-BR'); } catch { return data; }
};

function ClienteDepoimentos() {
  const { cliente, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [atendimentos, setAtendimentos] = useState([]);
  const [depoimentos, setDepoimentos] = useState([]);
  const [formularios, setFormularios] = useState({});

  const depoimentosPorAtendimento = useMemo(() => new Map(depoimentos.map((d) => [d.atendimentoId, d])), [depoimentos]);

  useEffect(() => { if (cliente || firebaseUser) carregarDados(); }, [cliente, firebaseUser]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const idsCliente = getClienteIds(cliente, firebaseUser);
      const [atendimentosData, depoimentosData] = await Promise.all([
        Promise.all(idsCliente.map((id) => firebaseService.query('atendimentos', [{ field: 'clienteId', operator: '==', value: id }], 'data', 'desc').catch(() => []))),
        Promise.all(idsCliente.map((id) => firebaseService.query('depoimentos_atendimentos', [{ field: 'clienteId', operator: '==', value: id }], 'createdAt', 'desc').catch(() => []))),
      ]);
      const atendimentosUnicos = Array.from(new Map(atendimentosData.flat().map((a) => [a.id, a])).values());
      const depoimentosUnicos = Array.from(new Map(depoimentosData.flat().map((d) => [d.id, d])).values());
      setAtendimentos(atendimentosUnicos);
      setDepoimentos(depoimentosUnicos);
      setFormularios(Object.fromEntries(atendimentosUnicos.map((a) => {
        const d = depoimentosUnicos.find((item) => item.atendimentoId === a.id);
        return [a.id, { nota: d?.nota || 5, texto: d?.texto || '', autorizadoPublicar: d?.autorizadoPublicar ?? true }];
      })));
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error);
      toast.error('Não foi possível carregar seus atendimentos.');
    } finally { setLoading(false); }
  };

  const atualizarFormulario = (atendimentoId, campo, valor) => setFormularios((prev) => ({
    ...prev,
    [atendimentoId]: { nota: 5, texto: '', autorizadoPublicar: true, ...(prev[atendimentoId] || {}), [campo]: valor }
  }));

  const salvarDepoimento = async (atendimento) => {
    const form = formularios[atendimento.id] || {};
    if (!form.texto?.trim()) return toast.error('Escreva seu depoimento antes de salvar.');
    try {
      setSalvando(true);
      const existente = depoimentosPorAtendimento.get(atendimento.id);
      const payload = {
        atendimentoId: atendimento.id,
        clienteId: cliente?.id || firebaseUser?.uid,
        clienteNome: cliente?.nome || cliente?.email || 'Cliente',
        clienteFoto: cliente?.foto || '',
        servicoNome: atendimento.servicoNome || atendimento.servicos?.[0]?.nome || 'Atendimento',
        profissionalNome: atendimento.profissionalNome || '',
        dataAtendimento: atendimento.data || atendimento.createdAt || '',
        nota: Number(form.nota || 5),
        texto: form.texto.trim(),
        autorizadoPublicar: Boolean(form.autorizadoPublicar),
        status: 'pendente',
        origem: 'portal_cliente',
        updatedAt: new Date().toISOString(),
      };
      if (existente?.id) await firebaseService.update('depoimentos_atendimentos', existente.id, payload);
      else await firebaseService.add('depoimentos_atendimentos', { ...payload, createdAt: new Date().toISOString() });
      toast.success('Depoimento enviado para aprovação!');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao salvar depoimento:', error);
      toast.error('Erro ao salvar depoimento.');
    } finally { setSalvando(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 1, sm: 2 }, pb: 4 }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: 'white', background: 'linear-gradient(135deg, #7b1fa2 0%, #ec407a 100%)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
          <Box>
            <Chip label="Atrelado aos atendimentos" sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Meus depoimentos</Typography>
            <Typography sx={{ opacity: 0.9, maxWidth: 720 }}>Avalie os atendimentos realizados. O salão visualiza no administrativo e só publica no site após aprovação.</Typography>
          </Box>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.2)' }}><RateReviewIcon fontSize="large" /></Avatar>
        </Stack>
      </Paper>

      {atendimentos.length === 0 ? (
        <Alert severity="info">Você ainda não possui atendimentos disponíveis para avaliar.</Alert>
      ) : (
        <Grid container spacing={2.5}>
          {atendimentos.map((atendimento) => {
            const form = formularios[atendimento.id] || { nota: 5, texto: '', autorizadoPublicar: true };
            const depoimento = depoimentosPorAtendimento.get(atendimento.id);
            return (
              <Grid item xs={12} md={6} key={atendimento.id}>
                <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #f1e4f7', boxShadow: '0 10px 30px rgba(123,31,162,0.08)' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2' }}><SpaIcon /></Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{atendimento.servicoNome || atendimento.servicos?.[0]?.nome || 'Atendimento'}</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip size="small" icon={<CalendarIcon />} label={formatarData(atendimento.data)} />
                          {depoimento && <Chip size="small" color={depoimento.status === 'aprovado' ? 'success' : 'warning'} icon={<CheckCircleIcon />} label={depoimento.status === 'aprovado' ? 'Publicado' : 'Aguardando aprovação'} />}
                        </Stack>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Sua nota</Typography>
                    <Rating value={Number(form.nota || 5)} onChange={(e, value) => atualizarFormulario(atendimento.id, 'nota', value || 5)} sx={{ mb: 2 }} />
                    <TextField fullWidth multiline minRows={4} label="Conte como foi sua experiência" value={form.texto} onChange={(e) => atualizarFormulario(atendimento.id, 'texto', e.target.value)} />
                    <Button fullWidth variant="contained" disabled={salvando} onClick={() => salvarDepoimento(atendimento)} sx={{ mt: 2, py: 1.2, borderRadius: 2, bgcolor: '#7b1fa2' }}>
                      {depoimento ? 'Atualizar depoimento' : 'Enviar depoimento'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export default ClienteDepoimentos;
