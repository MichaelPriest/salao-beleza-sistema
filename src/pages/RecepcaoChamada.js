import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { firebaseService } from '../services/firebase';

const CHAMADAS_KEY = 'painel.chamadas';
const CONFIG_KEY = 'painel.config';
const SALAS_KEY = 'painel.salas';

const carregarChamadas = () => {
  try { return JSON.parse(localStorage.getItem(CHAMADAS_KEY) || '[]'); } catch (error) { return []; }
};
const carregarConfig = () => {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{\"nomeEmpresa\":\"Salão de Beleza\",\"logoUrl\":\"\",\"mensagem\":\"Aguarde sua chamada\"}'); } catch (error) { return { nomeEmpresa: 'Salão de Beleza', logoUrl: '', mensagem: 'Aguarde sua chamada' }; }
};
const carregarSalas = () => {
  try { return JSON.parse(localStorage.getItem(SALAS_KEY) || '[\"Recepção\",\"Sala 1\",\"Sala 2\",\"Lavagem\"]'); } catch (error) { return ['Recepção', 'Sala 1', 'Sala 2', 'Lavagem']; }
};

const hojeIso = () => new Date().toISOString().split('T')[0];

const getDataAgendamento = (agendamento) => {
  const valor = agendamento.data || agendamento.dataAgendamento || agendamento.inicio;
  if (!valor) return '';
  if (typeof valor === 'string') return valor.split('T')[0];
  if (valor?.toDate) return valor.toDate().toISOString().split('T')[0];
  return new Date(valor).toISOString().split('T')[0];
};

function RecepcaoChamada() {
  const [clientes, setClientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [chamadas, setChamadas] = useState(carregarChamadas);
  const [config, setConfig] = useState(carregarConfig);
  const [salas, setSalas] = useState(carregarSalas);
  const [novaSala, setNovaSala] = useState('');
  const [form, setForm] = useState({ agendamentoId: '', clienteId: '', clienteNome: '', destino: 'Recepção' });

  useEffect(() => {
    Promise.all([
      firebaseService.getAll('clientes').catch(() => []),
      firebaseService.getAll('agendamentos').catch(() => []),
      firebaseService.getAll('atendimentos').catch(() => []),
      firebaseService.getAll('profissionais').catch(() => []),
      firebaseService.getAll('servicos').catch(() => []),
    ]).then(([clientesData, agendamentosData, atendimentosData, profissionaisData, servicosData]) => {
      setClientes(clientesData || []);
      setAgendamentos(agendamentosData || []);
      setAtendimentos(atendimentosData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);
    });
  }, []);

  const agendamentosHoje = useMemo(() => agendamentos
    .filter((agendamento) => getDataAgendamento(agendamento) === hojeIso())
    .filter((agendamento) => !['cancelado', 'finalizado'].includes(agendamento.status)), [agendamentos]);

  const salvarChamadas = (lista) => {
    setChamadas(lista);
    localStorage.setItem(CHAMADAS_KEY, JSON.stringify(lista));
  };

  const salvarConfig = (novaConfig) => {
    setConfig(novaConfig);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(novaConfig));
  };

  const adicionarSala = () => {
    const sala = novaSala.trim();
    if (!sala || salas.includes(sala)) return;
    const novasSalas = [...salas, sala];
    setSalas(novasSalas);
    localStorage.setItem(SALAS_KEY, JSON.stringify(novasSalas));
    setNovaSala('');
  };

  const montarChamada = () => {
    const agendamento = agendamentos.find((item) => item.id === form.agendamentoId);
    const cliente = clientes.find((item) => item.id === (agendamento?.clienteId || form.clienteId));
    const profissional = profissionais.find((item) => item.id === agendamento?.profissionalId);
    const servico = servicos.find((item) => item.id === agendamento?.servicoId);
    const clienteNome = cliente?.nome || agendamento?.clienteNome || form.clienteNome;
    if (!clienteNome) return null;

    return {
      id: crypto.randomUUID(),
      agendamentoId: agendamento?.id || '',
      clienteId: cliente?.id || form.clienteId || '',
      clienteNome,
      profissionalId: profissional?.id || agendamento?.profissionalId || '',
      profissionalNome: profissional?.nome || agendamento?.profissionalNome || '',
      servicoId: servico?.id || agendamento?.servicoId || '',
      servicoNome: servico?.nome || agendamento?.servicoNome || '',
      destino: form.destino || profissional?.nome || 'Recepção',
      status: 'aguardando',
      createdAt: new Date().toISOString(),
    };
  };

  const adicionar = () => {
    const chamada = montarChamada();
    if (!chamada) return;
    salvarChamadas([chamada, ...chamadas]);
    setForm({ agendamentoId: '', clienteId: '', clienteNome: '', destino: 'Recepção' });
  };

  const atualizarStatus = async (id, status) => {
    const chamada = chamadas.find((item) => item.id === id);
    salvarChamadas(chamadas.map((item) => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
    if (chamada?.agendamentoId) {
      await firebaseService.update('agendamentos', chamada.agendamentoId, { status, updatedAt: new Date().toISOString() }).catch(() => null);
    }
  };

  const iniciarAtendimento = async (chamada) => {
    const atendimento = await firebaseService.add('atendimentos', {
      clienteId: chamada.clienteId,
      clienteNome: chamada.clienteNome,
      profissionalId: chamada.profissionalId,
      profissionalNome: chamada.profissionalNome,
      servicoId: chamada.servicoId,
      servicoNome: chamada.servicoNome,
      agendamentoId: chamada.agendamentoId,
      status: 'em_andamento',
      data: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }).catch(() => null);
    setAtendimentos([{ ...(atendimento || {}), clienteNome: chamada.clienteNome }, ...atendimentos]);
    await atualizarStatus(chamada.id, 'em_atendimento');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 3 }}>Recepção - Chamada de Clientes</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h5">{chamadas.filter(c => c.status === 'aguardando').length}</Typography><Typography>Aguardando</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h5">{chamadas.filter(c => c.status === 'chamado').length}</Typography><Typography>Chamados</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h5">{chamadas.filter(c => c.status === 'em_atendimento').length}</Typography><Typography>Em atendimento</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h5">{agendamentosHoje.length}</Typography><Typography>Agendados hoje</Typography></CardContent></Card></Grid>
      </Grid>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Configuração do painel</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}><TextField fullWidth label="Nome da empresa" value={config.nomeEmpresa || ''} onChange={(e) => salvarConfig({ ...config, nomeEmpresa: e.target.value })} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="URL do logo" value={config.logoUrl || ''} onChange={(e) => salvarConfig({ ...config, logoUrl: e.target.value })} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Mensagem do painel" value={config.mensagem || ''} onChange={(e) => salvarConfig({ ...config, mensagem: e.target.value })} /></Grid>
          <Grid item xs={12} md={10}><TextField fullWidth label="Nova sala/guichê" value={novaSala} onChange={(e) => setNovaSala(e.target.value)} /></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={adicionarSala}>Criar sala</Button></Grid>
        </Grid>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Adicionar cliente à fila</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField select fullWidth label="Agendamento de hoje" value={form.agendamentoId} onChange={(e) => setForm({ ...form, agendamentoId: e.target.value, clienteId: '', clienteNome: '' })}><MenuItem value="">Sem agendamento</MenuItem>{agendamentosHoje.map((agendamento) => <MenuItem key={agendamento.id} value={agendamento.id}>{agendamento.clienteNome || clientes.find(c => c.id === agendamento.clienteId)?.nome || 'Cliente'} - {agendamento.hora || agendamento.horario || ''}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Cliente cadastrado" value={form.clienteId} disabled={!!form.agendamentoId} onChange={(e) => setForm({ ...form, clienteId: e.target.value, clienteNome: '' })}><MenuItem value="">Digitar nome manualmente</MenuItem>{clientes.map((cliente) => <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Nome do cliente" value={form.clienteNome} disabled={!!form.clienteId || !!form.agendamentoId} onChange={(e) => setForm({ ...form, clienteNome: e.target.value })} /></Grid>
          <Grid item xs={12} md={1}><TextField select fullWidth label="Sala" value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })}>{salas.map((sala) => <MenuItem key={sala} value={sala}>{sala}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1}><Button fullWidth variant="contained" onClick={adicionar}>Add</Button></Grid>
        </Grid>
      </Paper>
      <Alert severity="info" sx={{ mb: 2 }}>Abra o painel público em /painel-chamada. Chamadas com agendamento atualizam também o status do agendamento; ao iniciar atendimento, um atendimento é criado.</Alert>
      <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Cliente</TableCell><TableCell>Serviço</TableCell><TableCell>Profissional/Destino</TableCell><TableCell>Status</TableCell><TableCell>Ações</TableCell></TableRow></TableHead><TableBody>{chamadas.map((item) => <TableRow key={item.id}><TableCell>{item.clienteNome}</TableCell><TableCell>{item.servicoNome || '-'}</TableCell><TableCell>{item.profissionalNome || item.destino}</TableCell><TableCell><Chip size="small" label={item.status} /></TableCell><TableCell><Button onClick={() => atualizarStatus(item.id, 'chamado')}>Chamar</Button><Button onClick={() => iniciarAtendimento(item)}>Iniciar atendimento</Button><Button onClick={() => atualizarStatus(item.id, 'atendido')}>Atendido</Button><Button color="error" onClick={() => salvarChamadas(chamadas.filter(c => c.id !== item.id))}>Remover</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
    </Box>
  );
}

export default RecepcaoChamada;
