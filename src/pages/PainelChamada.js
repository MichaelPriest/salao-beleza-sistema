import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { Campaign, Schedule, Spa, VolumeUp } from '@mui/icons-material';
import { firebaseService } from '../services/firebase';
import { getLocalDateInputValue } from '../utils/dateTimeUtils';

const getServicoNome = (item = {}) => item.servicoNome || item.servicos?.[0]?.nome || item.servicosNomes || 'Serviço';
const getClienteNome = (item = {}) => item.clienteNomeResolvido || item.clienteNome || item.cliente || item.nomeCliente || 'Cliente';
const getProfissionalNome = (item = {}) => item.profissionalNomeResolvido || item.profissionalNome || item.nomeProfissional || item.profissional?.nome || 'Profissional';

const normalizarTexto = (valor) => String(valor || '').trim().toLowerCase();

const resolveClientePainel = (agendamento = {}, clientes = []) => {
  const ids = [
    agendamento.clienteId,
    agendamento.clienteUid,
    agendamento.clienteAuthUid,
    agendamento.authUid,
    agendamento.usuarioId,
    agendamento.userId,
  ].filter(Boolean).map(String);
  const email = normalizarTexto(agendamento.clienteEmail || agendamento.email);

  return clientes.find((cliente) => {
    const clienteIds = [cliente.id, cliente.uid, cliente.authUid, cliente.googleUid, cliente.userId]
      .filter(Boolean)
      .map(String);
    const matchId = ids.some((id) => clienteIds.includes(id));
    const matchEmail = email && normalizarTexto(cliente.email) === email;
    return matchId || matchEmail;
  });
};

const resolveProfissionalPainel = (agendamento = {}, profissionais = []) => {
  const ids = [agendamento.profissionalId, agendamento.profissionalUid, agendamento.profissional?.id]
    .filter(Boolean)
    .map(String);
  const nome = normalizarTexto(agendamento.profissionalNome || agendamento.nomeProfissional || agendamento.profissional?.nome);

  return profissionais.find((profissional) => {
    const profissionalIds = [profissional.id, profissional.uid].filter(Boolean).map(String);
    const matchId = ids.some((id) => profissionalIds.includes(id));
    const matchNome = nome && normalizarTexto(profissional.nome) === nome;
    return matchId || matchNome;
  });
};

const enriquecerAgendamentosPainel = (agendamentos = [], clientes = [], profissionais = []) => agendamentos.map((agendamento) => {
  const cliente = resolveClientePainel(agendamento, clientes);
  const profissional = resolveProfissionalPainel(agendamento, profissionais);
  return {
    ...agendamento,
    clienteNomeResolvido: cliente?.nome || cliente?.nomeCompleto || agendamento.clienteNome || agendamento.cliente || agendamento.nomeCliente,
    clienteFotoResolvida: cliente?.foto || cliente?.avatar || agendamento.clienteFoto || '',
    profissionalNomeResolvido: profissional?.nome || agendamento.profissionalNome || agendamento.nomeProfissional || agendamento.profissional?.nome,
    profissionalFotoResolvida: profissional?.foto || profissional?.avatar || agendamento.profissionalFoto || '',
  };
});

function PainelChamada() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [config, setConfig] = useState({});
  const [hora, setHora] = useState(new Date());

  const intervalo = Math.max(Number(config.intervaloAtualizacao || 30), 5) * 1000;
  const quantidadeProximos = Number(config.quantidadeProximos || 8);
  const corPrimaria = config.corPrimaria || '#7b1fa2';

  useEffect(() => {
    carregar();
    const timer = setInterval(() => setHora(new Date()), 1000);
    const reload = setInterval(carregar, intervalo);
    return () => { clearInterval(timer); clearInterval(reload); };
  }, [intervalo]);

  const carregar = async () => {
    const hoje = getLocalDateInputValue();
    const [agendamentosData, configuracoesData, clientesData, profissionaisData] = await Promise.all([
      firebaseService.query('agendamentos', [{ field: 'data', operator: '==', value: hoje }], 'horario', 'asc').catch(() => []),
      firebaseService.getAll('configuracoes').catch(() => []),
      firebaseService.getAll('clientes').catch(() => []),
      firebaseService.getAll('profissionais').catch(() => []),
    ]);
    setAgendamentos(enriquecerAgendamentosPainel(agendamentosData || [], clientesData || [], profissionaisData || []));
    setConfig(configuracoesData?.[0]?.painelChamada || {});
  };

  const proximos = useMemo(() => agendamentos
    .filter((a) => !['cancelado', 'finalizado'].includes(String(a.status || '').toLowerCase()))
    .slice(0, quantidadeProximos), [agendamentos, quantidadeProximos]);
  const atual = proximos[0];

  return (
    <Box sx={{ minHeight: '100vh', color: 'white', p: { xs: 2, md: 5 }, background: `radial-gradient(circle at top left, ${corPrimaria}66, transparent 30%), linear-gradient(135deg,#13051f,#27113b 55%,#100414)` }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Chip icon={<VolumeUp />} label="Recepção" sx={{ mb: 1, color: 'white', bgcolor: 'rgba(255,255,255,.14)' }} />
          <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1 }}>{config.titulo || 'Painel de Chamada'}</Typography>
          <Typography variant="h6" sx={{ opacity: .78 }}>{config.subtitulo || 'Acompanhe os próximos atendimentos em tempo real.'}</Typography>
        </Box>
        <Paper sx={{ px: 3, py: 2, borderRadius: 4, color: 'white', bgcolor: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.16)' }}>
          <Stack direction="row" spacing={1.5} alignItems="center"><Schedule /><Typography variant="h4" sx={{ fontWeight: 900 }}>{hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Typography></Stack>
          <Typography variant="caption" sx={{ opacity: .75 }}>{hora.toLocaleDateString('pt-BR')}</Typography>
        </Paper>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ minHeight: { xs: 320, md: 470 }, p: { xs: 3, md: 6 }, borderRadius: 6, color: 'white', background: `linear-gradient(135deg,${corPrimaria},#ec407a)`, boxShadow: '0 28px 80px rgba(0,0,0,.35)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Campaign sx={{ fontSize: { xs: 64, md: 92 }, opacity: .9 }} />
            <Typography variant="h5" sx={{ mt: 2, opacity: .86, fontWeight: 700 }}>Chamando agora</Typography>
            <Typography variant="h1" sx={{ fontWeight: 900, my: 1, fontSize: { xs: '2.4rem', md: '4.8rem' }, lineHeight: 1 }}>{atual ? getClienteNome(atual) : (config.mensagemVazio || 'Aguardando próximo cliente')}</Typography>
            <Typography variant="h4" sx={{ opacity: .92 }}>{atual ? getServicoNome(atual) : 'Sem chamada ativa'}</Typography>
            {atual && <Chip label={`Profissional: ${getProfissionalNome(atual)}`} sx={{ mt: 3, alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,.2)', color: 'white', fontSize: 18, py: 2.3 }} />}
          </Paper>
        </Grid>
        {config.mostrarProximos !== false && (
          <Grid item xs={12} md={5}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Próximos chamados</Typography>
            <Stack spacing={2}>
              {proximos.slice(1).map((item, index) => (
                <Paper key={item.id || index} sx={{ p: 2.5, borderRadius: 4, bgcolor: 'rgba(255,255,255,.09)', color: 'white', border: '1px solid rgba(255,255,255,.14)' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={item.clienteFotoResolvida || undefined} sx={{ width: 54, height: 54, bgcolor: '#ec407a', fontWeight: 900 }}>{item.clienteFotoResolvida ? '' : index + 2}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" noWrap sx={{ fontWeight: 800 }}>{getClienteNome(item)}</Typography>
                      <Typography sx={{ opacity: .75 }}>{item.horario || '--:--'} • {getServicoNome(item)}</Typography>
                    </Box>
                    <Chip label={getProfissionalNome(item)} size="small" icon={<Spa />} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,.12)', maxWidth: 180 }} />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
export default PainelChamada;
