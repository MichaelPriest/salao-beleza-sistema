import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';

const CHAMADAS_KEY = 'painel.chamadas';

const carregarChamadas = () => {
  try {
    return JSON.parse(localStorage.getItem(CHAMADAS_KEY) || '[]');
  } catch (error) {
    return [];
  }
};

function PainelChamada() {
  const [chamadas, setChamadas] = useState(carregarChamadas);

  useEffect(() => {
    const interval = setInterval(() => setChamadas(carregarChamadas()), 2000);
    return () => clearInterval(interval);
  }, []);

  const ultimaChamada = chamadas[0];
  const aguardando = chamadas.filter((item) => item.status === 'aguardando');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111827', color: 'white', p: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>Painel de Chamada</Typography>
      {ultimaChamada ? (
        <Card sx={{ mb: 4, bgcolor: '#9c27b0', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h2" sx={{ fontWeight: 900 }}>{ultimaChamada.clienteNome}</Typography>
            <Typography variant="h4">{ultimaChamada.destino || ultimaChamada.profissionalNome || 'Recepção'}</Typography>
            <Typography variant="h6">{ultimaChamada.servicoNome || 'Atendimento'}</Typography>
            <Chip sx={{ mt: 2, bgcolor: 'white', color: '#9c27b0', fontWeight: 700 }} label={ultimaChamada.status === 'chamado' ? 'CHAMADO' : 'AGUARDANDO'} />
          </CardContent>
        </Card>
      ) : (
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 4 }}>Nenhum cliente aguardando.</Typography>
      )}
      <Grid container spacing={2}>
        {aguardando.slice(0, 8).map((item) => (
          <Grid item xs={12} md={3} key={item.id}>
            <Card sx={{ bgcolor: '#1f2937', color: 'white' }}><CardContent><Typography variant="h6">{item.clienteNome}</Typography><Typography>{item.servicoNome || item.destino || 'Aguardando'}</Typography><Typography variant="caption">{item.profissionalNome || item.destino || ''}</Typography></CardContent></Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default PainelChamada;
