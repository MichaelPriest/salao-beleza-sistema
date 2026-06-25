import React from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { CalendarMonth, Groups, MonetizationOn, Print, Spa, Star } from '@mui/icons-material';

function FolderDivulgacao() {
  const modulos = [
    ['Agenda inteligente', 'Agendamentos, confirmação, disponibilidade e histórico.'],
    ['Clientes e prontuário', 'Cadastro completo, fotos, anamnese, assinatura e evolução.'],
    ['Financeiro profissional', 'Caixa, fluxo, anexos, orçamento e conciliação bancária.'],
    ['Fidelidade', 'Pontos, recompensas, indicações e resgates.'],
    ['Portal do cliente', 'Dashboard, agendamentos, histórico, pontos e depoimentos.'],
    ['Site público', 'Banners em carrossel, depoimentos aprovados e chamada comercial.'],
  ];
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff7fb', p: { xs: 2, md: 5 } }}>
      <Paper sx={{ maxWidth: 1120, mx: 'auto', p: { xs: 3, md: 5 }, borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(236,64,122,.16), transparent 35%)', pointerEvents: 'none' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" sx={{ position: 'relative' }}>
          <Box sx={{ flex: 1 }}>
            <Chip label="Sistema completo para salão, beleza e estética" color="secondary" sx={{ mb: 2 }} />
            <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1, fontSize: { xs: 38, md: 60 } }}>Gestão moderna para vender mais e atender melhor</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>Controle agenda, clientes, financeiro, estoque, fidelidade, site público e portal do cliente em uma única plataforma.</Typography>
            <Button startIcon={<Print />} variant="contained" onClick={() => window.print()} sx={{ mt: 3, borderRadius: 99, px: 4, bgcolor: '#7b1fa2' }}>Imprimir folder</Button>
          </Box>
          <Card sx={{ width: { xs: '100%', md: 360 }, borderRadius: 4, background: 'linear-gradient(135deg,#7b1fa2,#ec407a)', color: 'white' }}>
            <CardContent sx={{ p: 4 }}>
              <Spa sx={{ fontSize: 70 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 2 }}>Tudo integrado</Typography>
              <Typography sx={{ opacity: .9, mt: 1 }}>Da recepção ao pós-venda, com visão profissional do negócio.</Typography>
            </CardContent>
          </Card>
        </Stack>
        <Grid container spacing={2.5} sx={{ mt: 4, position: 'relative' }}>
          {modulos.map(([titulo, desc], index) => (
            <Grid item xs={12} md={4} key={titulo}>
              <Card sx={{ height: '100%', borderRadius: 3 }}><CardContent>
                {[<CalendarMonth />, <Groups />, <MonetizationOn />, <Star />, <Spa />, <Star />][index]}
                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>{titulo}</Typography>
                <Typography color="text.secondary">{desc}</Typography>
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
export default FolderDivulgacao;
