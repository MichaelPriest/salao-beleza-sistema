import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { firebaseService } from '../services/firebase';

const CHAMADAS_KEY = 'painel.chamadas';

const carregarChamadas = () => {
  try { return JSON.parse(localStorage.getItem(CHAMADAS_KEY) || '[]'); } catch (error) { return []; }
};

function RecepcaoChamada() {
  const [clientes, setClientes] = useState([]);
  const [chamadas, setChamadas] = useState(carregarChamadas);
  const [form, setForm] = useState({ clienteId: '', clienteNome: '', destino: 'Recepção' });

  useEffect(() => {
    firebaseService.getAll('clientes').then((data) => setClientes(data || [])).catch(() => setClientes([]));
  }, []);

  const salvarChamadas = (lista) => {
    setChamadas(lista);
    localStorage.setItem(CHAMADAS_KEY, JSON.stringify(lista));
  };

  const adicionar = () => {
    const cliente = clientes.find((item) => item.id === form.clienteId);
    const clienteNome = cliente?.nome || form.clienteNome;
    if (!clienteNome) return;
    salvarChamadas([{ id: crypto.randomUUID(), clienteId: form.clienteId, clienteNome, destino: form.destino, status: 'aguardando', createdAt: new Date().toISOString() }, ...chamadas]);
    setForm({ clienteId: '', clienteNome: '', destino: 'Recepção' });
  };

  const atualizarStatus = (id, status) => {
    salvarChamadas(chamadas.map((item) => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 3 }}>Recepção - Chamada de Clientes</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h5">{chamadas.filter(c => c.status === 'aguardando').length}</Typography><Typography>Aguardando</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h5">{chamadas.filter(c => c.status === 'chamado').length}</Typography><Typography>Chamados</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h5">{chamadas.filter(c => c.status === 'atendido').length}</Typography><Typography>Atendidos</Typography></CardContent></Card></Grid>
      </Grid>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField select fullWidth label="Cliente cadastrado" value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value, clienteNome: '' })}><MenuItem value="">Digitar nome manualmente</MenuItem>{clientes.map((cliente) => <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Nome do cliente" value={form.clienteNome} disabled={!!form.clienteId} onChange={(e) => setForm({ ...form, clienteNome: e.target.value })} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Destino/Guichê" value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} /></Grid>
          <Grid item xs={12} md={1}><Button fullWidth variant="contained" onClick={adicionar}>Adicionar</Button></Grid>
        </Grid>
      </Paper>
      <Alert severity="info" sx={{ mb: 2 }}>Abra o painel público em /painel-chamada para visualização em TV/monitor.</Alert>
      <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Cliente</TableCell><TableCell>Destino</TableCell><TableCell>Status</TableCell><TableCell>Ações</TableCell></TableRow></TableHead><TableBody>{chamadas.map((item) => <TableRow key={item.id}><TableCell>{item.clienteNome}</TableCell><TableCell>{item.destino}</TableCell><TableCell><Chip size="small" label={item.status} /></TableCell><TableCell><Button onClick={() => atualizarStatus(item.id, 'chamado')}>Chamar</Button><Button onClick={() => atualizarStatus(item.id, 'atendido')}>Atendido</Button><Button color="error" onClick={() => salvarChamadas(chamadas.filter(c => c.id !== item.id))}>Remover</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
    </Box>
  );
}

export default RecepcaoChamada;
