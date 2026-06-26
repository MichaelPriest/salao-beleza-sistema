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
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Rating,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  HourglassTop as HourglassIcon,
  Person as PersonIcon,
  RateReview as RateReviewIcon,
  Spa as SpaIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { formatLocalDate } from '../utils/dateTimeUtils';

const getClienteIds = (cliente, firebaseUser) => Array.from(new Set([
  firebaseUser?.uid, cliente?.id, cliente?.uid, cliente?.authUid, cliente?.googleUid, cliente?.email,
].filter(Boolean)));

const getServicoNome = (atendimento = {}) => atendimento.servicoNome
  || atendimento.servicos?.[0]?.nome
  || atendimento.servicosNomes
  || 'Atendimento';

const getProfissionalNome = (atendimento = {}) => atendimento.profissionalNome
  || atendimento.profissional?.nome
  || atendimento.nomeProfissional
  || 'Profissional não informado';

const formatarData = (data) => formatLocalDate(data, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const getStatusDepoimento = (depoimento) => {
  if (!depoimento) return { label: 'Ainda não enviado', color: 'default', icon: <RateReviewIcon fontSize="small" /> };
  if (depoimento.status === 'aprovado') return { label: 'Publicado', color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
  if (depoimento.status === 'reprovado') return { label: 'Não publicado', color: 'error', icon: <RateReviewIcon fontSize="small" /> };
  return { label: 'Aguardando aprovação', color: 'warning', icon: <HourglassIcon fontSize="small" /> };
};

function ClienteDepoimentos() {
  const { cliente, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [atendimentos, setAtendimentos] = useState([]);
  const [depoimentos, setDepoimentos] = useState([]);
  const [formularios, setFormularios] = useState({});
  const [tabFiltro, setTabFiltro] = useState('pendentes');

  const depoimentosPorAtendimento = useMemo(() => new Map(depoimentos.map((d) => [d.atendimentoId, d])), [depoimentos]);

  const estatisticas = useMemo(() => {
    const enviados = atendimentos.filter((atendimento) => depoimentosPorAtendimento.has(atendimento.id)).length;
    const aprovados = depoimentos.filter((depoimento) => depoimento.status === 'aprovado').length;
    const pendentesAprovacao = depoimentos.filter((depoimento) => depoimento.status !== 'aprovado').length;
    return {
      total: atendimentos.length,
      pendentes: Math.max(0, atendimentos.length - enviados),
      enviados,
      aprovados,
      pendentesAprovacao,
    };
  }, [atendimentos, depoimentos, depoimentosPorAtendimento]);

  const atendimentosFiltrados = useMemo(() => atendimentos.filter((atendimento) => {
    const depoimento = depoimentosPorAtendimento.get(atendimento.id);
    if (tabFiltro === 'pendentes') return !depoimento;
    if (tabFiltro === 'publicados') return depoimento?.status === 'aprovado';
    if (tabFiltro === 'analise') return depoimento && depoimento.status !== 'aprovado';
    return true;
  }), [atendimentos, depoimentosPorAtendimento, tabFiltro]);

  useEffect(() => {
    if (cliente || firebaseUser) carregarDados();
  }, [cliente, firebaseUser]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const idsCliente = getClienteIds(cliente, firebaseUser);
      const [atendimentosData, depoimentosData] = await Promise.all([
        Promise.all(idsCliente.map((id) => firebaseService.query('atendimentos', [{ field: 'clienteId', operator: '==', value: id }], 'data', 'desc').catch(() => []))),
        Promise.all(idsCliente.map((id) => firebaseService.query('avaliacoes', [{ field: 'clienteId', operator: '==', value: id }], 'createdAt', 'desc').catch(() => []))),
      ]);
      const atendimentosUnicos = Array.from(new Map(atendimentosData.flat().map((a) => [a.id, a])).values());
      const depoimentosUnicos = Array.from(new Map(depoimentosData.flat()
        .filter((d) => !d.tipo || d.tipo === 'depoimento_atendimento')
        .map((d) => [d.id, d])).values());
      setAtendimentos(atendimentosUnicos);
      setDepoimentos(depoimentosUnicos);
      setFormularios(Object.fromEntries(atendimentosUnicos.map((atendimento) => {
        const depoimento = depoimentosUnicos.find((item) => item.atendimentoId === atendimento.id);
        return [atendimento.id, {
          nota: depoimento?.nota || 5,
          texto: depoimento?.texto || '',
          autorizadoPublicar: depoimento?.autorizadoPublicar ?? true,
        }];
      })));
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error);
      toast.error('Não foi possível carregar seus atendimentos.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarFormulario = (atendimentoId, campo, valor) => setFormularios((prev) => ({
    ...prev,
    [atendimentoId]: { nota: 5, texto: '', autorizadoPublicar: true, ...(prev[atendimentoId] || {}), [campo]: valor }
  }));

  const salvarDepoimento = async (atendimento) => {
    const form = formularios[atendimento.id] || {};
    const texto = String(form.texto || '').trim();
    if (texto.length < 10) return toast.error('Escreva um depoimento com pelo menos 10 caracteres.');

    try {
      setSalvando(true);
      const existente = depoimentosPorAtendimento.get(atendimento.id);
      const payload = {
        atendimentoId: atendimento.id,
        clienteId: cliente?.id || firebaseUser?.uid,
        clienteNome: cliente?.nome || cliente?.email || 'Cliente',
        clienteFoto: cliente?.foto || '',
        servicoNome: getServicoNome(atendimento),
        profissionalNome: getProfissionalNome(atendimento),
        dataAtendimento: atendimento.data || atendimento.createdAt || '',
        nota: Number(form.nota || 5),
        texto,
        autorizadoPublicar: Boolean(form.autorizadoPublicar),
        status: 'pendente',
        origem: 'portal_cliente',
        tipo: 'depoimento_atendimento',
        updatedAt: new Date().toISOString(),
      };
      if (existente?.id) await firebaseService.update('avaliacoes', existente.id, payload);
      else await firebaseService.add('avaliacoes', { ...payload, createdAt: new Date().toISOString() });
      toast.success('Depoimento enviado para aprovação!');
      await carregarDados();
      setTabFiltro('analise');
    } catch (error) {
      console.error('Erro ao salvar depoimento:', error);
      toast.error('Erro ao salvar depoimento.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 1, sm: 2 }, pb: 4 }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: 'white', background: 'linear-gradient(135deg, #7b1fa2 0%, #ec407a 100%)', overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'absolute', right: -60, top: -80, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.12)' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ position: 'relative' }}>
          <Box>
            <Chip label="Depoimentos atrelados aos atendimentos" sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 700 }} />
            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.12 }}>Compartilhe sua experiência</Typography>
            <Typography sx={{ opacity: 0.9, maxWidth: 740, mt: 1 }}>Avalie seus atendimentos realizados. O salão revisa no administrativo e só publica no site quando você autorizar e a equipe aprovar.</Typography>
          </Box>
          <Avatar sx={{ width: 76, height: 76, bgcolor: 'rgba(255,255,255,0.2)' }}><RateReviewIcon fontSize="large" /></Avatar>
        </Stack>
      </Paper>

      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {[
          { label: 'Atendimentos', value: estatisticas.total, color: '#7b1fa2' },
          { label: 'Pendentes', value: estatisticas.pendentes, color: '#ff9800' },
          { label: 'Em análise', value: estatisticas.pendentesAprovacao, color: '#ec407a' },
          { label: 'Publicados', value: estatisticas.aprovados, color: '#4caf50' },
        ].map((item) => (
          <Grid item xs={6} md={3} key={item.label}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 10px 24px rgba(123,31,162,.08)' }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: item.color }}>{item.value}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{item.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mb: 2.5, borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tabFiltro} onChange={(e, value) => setTabFiltro(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab value="pendentes" label={`Para avaliar (${estatisticas.pendentes})`} />
          <Tab value="analise" label={`Em análise (${estatisticas.pendentesAprovacao})`} />
          <Tab value="publicados" label={`Publicados (${estatisticas.aprovados})`} />
          <Tab value="todos" label={`Todos (${estatisticas.total})`} />
        </Tabs>
      </Paper>

      {atendimentos.length === 0 ? (
        <Alert severity="info">Você ainda não possui atendimentos disponíveis para avaliar.</Alert>
      ) : atendimentosFiltrados.length === 0 ? (
        <Alert severity="info">Nenhum atendimento encontrado neste filtro.</Alert>
      ) : (
        <Grid container spacing={2.5}>
          {atendimentosFiltrados.map((atendimento) => {
            const form = formularios[atendimento.id] || { nota: 5, texto: '', autorizadoPublicar: true };
            const depoimento = depoimentosPorAtendimento.get(atendimento.id);
            const status = getStatusDepoimento(depoimento);
            const textoLength = String(form.texto || '').length;

            return (
              <Grid item xs={12} md={6} key={atendimento.id}>
                <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #f1e4f7', boxShadow: '0 10px 30px rgba(123,31,162,0.08)' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', width: 48, height: 48 }}><SpaIcon /></Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>{getServicoNome(atendimento)}</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" icon={<CalendarIcon />} label={formatarData(atendimento.data || atendimento.createdAt)} />
                          <Chip size="small" icon={<PersonIcon />} label={getProfissionalNome(atendimento)} />
                          <Chip size="small" color={status.color} icon={status.icon} label={status.label} />
                        </Stack>
                      </Box>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>Sua nota</Typography>
                        <Rating value={Number(form.nota || 5)} onChange={(e, value) => atualizarFormulario(atendimento.id, 'nota', value || 5)} />
                      </Box>
                      <Chip icon={<StarIcon />} label={`${Number(form.nota || 5).toFixed(1)} de 5`} sx={{ bgcolor: '#fff8e1', color: '#f57c00', fontWeight: 700 }} />
                    </Stack>

                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Conte como foi sua experiência"
                      value={form.texto}
                      onChange={(e) => atualizarFormulario(atendimento.id, 'texto', e.target.value)}
                      inputProps={{ maxLength: 500 }}
                      helperText={`${textoLength}/500 caracteres • mínimo recomendado: 10`}
                    />

                    <FormControlLabel
                      sx={{ mt: 1, alignItems: 'flex-start' }}
                      control={<Switch checked={Boolean(form.autorizadoPublicar)} onChange={(e) => atualizarFormulario(atendimento.id, 'autorizadoPublicar', e.target.checked)} />}
                      label={<Typography variant="body2">Autorizo publicar meu depoimento no site/app do salão após aprovação.</Typography>}
                    />

                    <Button fullWidth variant="contained" disabled={salvando || textoLength < 10} onClick={() => salvarDepoimento(atendimento)} sx={{ mt: 2, py: 1.2, borderRadius: 2, bgcolor: '#7b1fa2' }}>
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
