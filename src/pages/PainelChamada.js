import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { Campaign, Schedule, Spa, VolumeUp } from '@mui/icons-material';
import { firebaseService } from '../services/firebase';

const getServicoNome = (item = {}) => item.servicoNome || item.servicos?.[0]?.nome || item.servicosNomes || 'Serviço';
const getClienteNome = (item = {}) => item.clienteNome || item.cliente || item.nomeCliente || 'Cliente';

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
    const hoje = new Date().toISOString().split('T')[0];
    const [agendamentosData, configuracoesData] = await Promise.all([
      firebaseService.query('agendamentos', [{ field: 'data', operator: '==', value: hoje }], 'horario', 'asc').catch(() => []),
      firebaseService.getAll('configuracoes').catch(() => []),
    ]);
    setAgendamentos(agendamentosData || []);
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
            {atual?.profissionalNome && <Chip label={`Profissional: ${atual.profissionalNome}`} sx={{ mt: 3, alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,.2)', color: 'white', fontSize: 18, py: 2.3 }} />}
          </Paper>
        </Grid>
        {config.mostrarProximos !== false && (
          <Grid item xs={12} md={5}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Próximos chamados</Typography>
            <Stack spacing={2}>
              {proximos.slice(1).map((item, index) => (
                <Paper key={item.id || index} sx={{ p: 2.5, borderRadius: 4, bgcolor: 'rgba(255,255,255,.09)', color: 'white', border: '1px solid rgba(255,255,255,.14)' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ width: 54, height: 54, bgcolor: '#ec407a', fontWeight: 900 }}>{index + 2}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" noWrap sx={{ fontWeight: 800 }}>{getClienteNome(item)}</Typography>
                      <Typography sx={{ opacity: .75 }}>{item.horario || '--:--'} • {getServicoNome(item)}</Typography>
                    </Box>
                    <Spa sx={{ opacity: .6 }} />
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
