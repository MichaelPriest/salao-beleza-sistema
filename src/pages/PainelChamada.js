import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { Campaign, Schedule, Spa } from '@mui/icons-material';
import { firebaseService } from '../services/firebase';

function PainelChamada() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [hora, setHora] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    carregar();
    const reload = setInterval(carregar, 30000);
    return () => { clearInterval(timer); clearInterval(reload); };
  }, []);
  const carregar = async () => {
    const hoje = new Date().toISOString().split('T')[0];
    const data = await firebaseService.query('agendamentos', [{ field: 'data', operator: '==', value: hoje }], 'horario', 'asc').catch(() => []);
    setAgendamentos(data || []);
  };
  const proximos = useMemo(() => agendamentos.filter((a) => !['cancelado', 'finalizado'].includes(a.status)).slice(0, 8), [agendamentos]);
  const atual = proximos[0];
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#13051f', color: 'white', p: { xs: 2, md: 5 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box><Typography variant="h3" sx={{ fontWeight: 900 }}>Painel de Chamada</Typography><Typography sx={{ opacity: .75 }}>Acompanhe os próximos atendimentos em tempo real.</Typography></Box>
        <Chip icon={<Schedule />} label={hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,.14)', fontSize: 22, p: 3 }} />
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 5, color: 'white', background: 'linear-gradient(135deg,#7b1fa2,#ec407a)' }}>
            <Campaign sx={{ fontSize: 70 }} />
            <Typography variant="h6" sx={{ mt: 2, opacity: .85 }}>Chamando agora</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, my: 1 }}>{atual?.clienteNome || atual?.cliente || 'Aguardando próximo cliente'}</Typography>
            <Typography variant="h5">{atual?.servicoNome || atual?.servicos?.[0]?.nome || 'Sem chamada ativa'}</Typography>
            {atual?.profissionalNome && <Chip label={`Profissional: ${atual.profissionalNome}`} sx={{ mt: 3, bgcolor: 'rgba(255,255,255,.18)', color: 'white' }} />}
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            {proximos.slice(1).map((item, index) => (
              <Paper key={item.id || index} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,.08)', color: 'white', border: '1px solid rgba(255,255,255,.12)' }}>
                <Stack direction="row" spacing={2} alignItems="center"><Avatar sx={{ bgcolor: '#ec407a' }}><Spa /></Avatar><Box sx={{ flex: 1 }}><Typography variant="h6" sx={{ fontWeight: 800 }}>{item.clienteNome || item.cliente || 'Cliente'}</Typography><Typography sx={{ opacity: .75 }}>{item.horario || '--:--'} • {item.servicoNome || item.servicos?.[0]?.nome || 'Serviço'}</Typography></Box></Stack>
              </Paper>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
export default PainelChamada;
