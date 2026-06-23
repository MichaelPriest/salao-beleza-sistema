import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Campaign as CampaignIcon,
  CheckCircle as CheckCircleIcon,
  Groups as GroupsIcon,
  MeetingRoom as MeetingRoomIcon,
  OpenInNew as OpenInNewIcon,
  PlayArrow as PlayArrowIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { firebaseService } from '../services/firebase';

const CHAMADAS_KEY = 'painel.chamadas';

const carregarChamadas = () => {
  try { return JSON.parse(localStorage.getItem(CHAMADAS_KEY) || '[]'); } catch (error) { return []; }
};

const hojeIso = () => new Date().toISOString().split('T')[0];

const formatarTempo = (inicio) => {
  if (!inicio) return '00:00';
  const diff = Math.max(0, Date.now() - new Date(inicio).getTime());
  const horas = Math.floor(diff / 3600000);
  const min = Math.floor((diff % 3600000) / 60000);
  const seg = Math.floor((diff % 60000) / 1000);
  return horas > 0
    ? `${String(horas).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
    : `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
};

const getDataAgendamento = (agendamento) => {
  const valor = agendamento.data || agendamento.dataAgendamento || agendamento.inicio;
  if (!valor) return '';
  if (typeof valor === 'string') return valor.split('T')[0];
  if (valor?.toDate) return valor.toDate().toISOString().split('T')[0];
  return new Date(valor).toISOString().split('T')[0];
};

const normalizarConfigPainel = (cfg = {}) => ({
  nomeEmpresa: cfg.salao?.nomeFantasia || cfg.salao?.nome || cfg.nomeEmpresa || cfg.nomeSalao || 'Salão de Beleza',
  logoUrl: cfg.salao?.logo || cfg.logoUrl || cfg.logo || '',
  mensagem: cfg.painelChamada?.mensagem || 'Aguarde sua chamada no painel',
  corPrimaria: cfg.painelChamada?.corPrimaria || cfg.tema?.corPrimaria || '#9c27b0',
  corFundo: cfg.painelChamada?.corFundo || '#111827',
  salas: cfg.painelChamada?.salas?.length ? cfg.painelChamada.salas : ['Recepção', 'Sala 1', 'Sala 2', 'Lavagem']
});

function RecepcaoChamada() {
  const [clientes, setClientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [chamadas, setChamadas] = useState(carregarChamadas);
  const [configPainel, setConfigPainel] = useState(normalizarConfigPainel());
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState({ agendamentoId: '', clienteId: '', clienteNome: '', destino: 'Recepção' });

  useEffect(() => {
    Promise.all([
      firebaseService.getAll('clientes').catch(() => []),
      firebaseService.getAll('agendamentos').catch(() => []),
      firebaseService.getAll('atendimentos').catch(() => []),
      firebaseService.getAll('profissionais').catch(() => []),
      firebaseService.getAll('servicos').catch(() => []),
      firebaseService.getAll('configuracoes').catch(() => []),
    ]).then(([clientesData, agendamentosData, atendimentosData, profissionaisData, servicosData, configuracoesData]) => {
      setClientes(clientesData || []);
      setAgendamentos(agendamentosData || []);
      setAtendimentos(atendimentosData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);
      setConfigPainel(normalizarConfigPainel(configuracoesData?.[0] || {}));
    });
  }, []);

  const agendamentosHoje = useMemo(() => agendamentos
    .filter((agendamento) => getDataAgendamento(agendamento) === hojeIso())
    .filter((agendamento) => !['cancelado', 'finalizado', 'atendido'].includes(agendamento.status)), [agendamentos]);

  const contadores = useMemo(() => ({
    aguardando: chamadas.filter((c) => c.status === 'aguardando' || c.status === 'chamado').length,
    emAtendimento: chamadas.filter((c) => c.status === 'em_atendimento').length,
    atendidos: chamadas.filter((c) => c.status === 'atendido').length,
  }), [chamadas]);

  const chamadasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return chamadas.filter((item) => {
      const statusOk = filtroStatus === 'todos'
        || (filtroStatus === 'aguardando' && ['aguardando', 'chamado'].includes(item.status))
        || item.status === filtroStatus;
      const buscaOk = !termo
        || String(item.clienteNome || '').toLowerCase().includes(termo)
        || String(item.servicoNome || '').toLowerCase().includes(termo)
        || String(item.profissionalNome || item.destino || '').toLowerCase().includes(termo);
      return statusOk && buscaOk;
    });
  }, [busca, chamadas, filtroStatus]);

  const salvarChamadas = (lista) => {
    setChamadas(lista);
    localStorage.setItem(CHAMADAS_KEY, JSON.stringify(lista));
  };

  const montarChamadaPorAgendamento = (agendamento, destinoSelecionado = '') => {
    const cliente = clientes.find((item) => item.id === agendamento?.clienteId);
    const profissional = profissionais.find((item) => item.id === agendamento?.profissionalId);
    const servico = servicos.find((item) => item.id === agendamento?.servicoId);
    return {
      id: crypto.randomUUID(),
      agendamentoId: agendamento?.id || '',
      clienteId: cliente?.id || agendamento?.clienteId || '',
      clienteNome: cliente?.nome || agendamento?.clienteNome || 'Cliente agendado',
      profissionalId: profissional?.id || agendamento?.profissionalId || '',
      profissionalNome: profissional?.nome || agendamento?.profissionalNome || '',
      servicoId: servico?.id || agendamento?.servicoId || '',
      servicoNome: servico?.nome || agendamento?.servicoNome || '',
      destino: destinoSelecionado || profissional?.nome || agendamento?.profissionalNome || 'Recepção',
      status: 'aguardando',
      createdAt: new Date().toISOString(),
    };
  };

  const montarChamada = () => {
    const agendamento = agendamentos.find((item) => item.id === form.agendamentoId);
    if (agendamento) return montarChamadaPorAgendamento(agendamento, form.destino);

    const cliente = clientes.find((item) => item.id === form.clienteId);
    const clienteNome = cliente?.nome || form.clienteNome;
    if (!clienteNome) return null;

    return {
      id: crypto.randomUUID(),
      agendamentoId: '',
      clienteId: cliente?.id || '',
      clienteNome,
      destino: form.destino || 'Recepção',
      status: 'aguardando',
      createdAt: new Date().toISOString(),
    };
  };

  const adicionar = () => {
    const chamada = montarChamada();
    if (!chamada) return;
    salvarChamadas([chamada, ...chamadas]);
    setForm({ agendamentoId: '', clienteId: '', clienteNome: '', destino: configPainel.salas[0] || 'Recepção' });
  };

  const importarAgendaHoje = () => {
    const agendamentosNaFila = new Set(chamadas.map((item) => item.agendamentoId).filter(Boolean));
    const novasChamadas = agendamentosHoje
      .filter((agendamento) => !agendamentosNaFila.has(agendamento.id))
      .map((agendamento) => montarChamadaPorAgendamento(agendamento));
    if (novasChamadas.length) salvarChamadas([...novasChamadas, ...chamadas]);
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

  const corPrimaria = configPainel.corPrimaria;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 4, background: `linear-gradient(135deg, ${corPrimaria} 0%, #111827 100%)`, color: 'white', overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={configPainel.logoUrl} sx={{ width: 72, height: 72, bgcolor: 'white', color: corPrimaria, fontWeight: 900 }}>
              {configPainel.nomeEmpresa.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.78 }}>Recepção e chamada de clientes</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>{configPainel.nomeEmpresa}</Typography>
              <Typography sx={{ opacity: 0.9 }}>{configPainel.mensagem}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="contained" color="secondary" startIcon={<OpenInNewIcon />} onClick={() => window.open('/painel-chamada', '_blank')}>
              Abrir painel público
            </Button>
            <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)' }} onClick={importarAgendaHoje} startIcon={<TodayIcon />}>
              Importar agenda de hoje
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: `6px solid ${corPrimaria}` }}>
            <CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="h3" sx={{ fontWeight: 900 }}>{contadores.aguardando}</Typography><Typography>Aguardando</Typography></Box><GroupsIcon sx={{ fontSize: 48, color: corPrimaria }} /></Stack></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: '6px solid #0ea5e9' }}>
            <CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="h3" sx={{ fontWeight: 900 }}>{contadores.emAtendimento}</Typography><Typography>Em atendimento</Typography></Box><PlayArrowIcon sx={{ fontSize: 48, color: '#0ea5e9' }} /></Stack></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, borderLeft: '6px solid #16a34a' }}>
            <CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="h3" sx={{ fontWeight: 900 }}>{contadores.atendidos}</Typography><Typography>Atendidos</Typography></Box><CheckCircleIcon sx={{ fontSize: 48, color: '#16a34a' }} /></Stack></CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Adicionar cliente à fila</Typography>
            <Stack spacing={2}>
              <TextField select fullWidth label="Agendamento de hoje" value={form.agendamentoId} onChange={(e) => setForm({ ...form, agendamentoId: e.target.value, clienteId: '', clienteNome: '' })}>
                <MenuItem value="">Sem agendamento</MenuItem>
                {agendamentosHoje.map((agendamento) => <MenuItem key={agendamento.id} value={agendamento.id}>{agendamento.clienteNome || clientes.find(c => c.id === agendamento.clienteId)?.nome || 'Cliente'} - {agendamento.hora || agendamento.horario || ''}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Cliente cadastrado" value={form.clienteId} disabled={!!form.agendamentoId} onChange={(e) => setForm({ ...form, clienteId: e.target.value, clienteNome: '' })}>
                <MenuItem value="">Digitar nome manualmente</MenuItem>
                {clientes.map((cliente) => <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="Nome do cliente" value={form.clienteNome} disabled={!!form.clienteId || !!form.agendamentoId} onChange={(e) => setForm({ ...form, clienteNome: e.target.value })} />
              <TextField select fullWidth label="Sala/guichê" value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })}>
                {configPainel.salas.map((sala) => <MenuItem key={sala} value={sala}>{sala}</MenuItem>)}
              </TextField>
              <Button variant="contained" size="large" onClick={adicionar} startIcon={<CampaignIcon />}>Adicionar na fila</Button>
              <Alert severity="info" icon={<MeetingRoomIcon />}>Salas, mensagem, cores, logo e voz do painel agora são configurados em Configurações &gt; Painel de chamada.</Alert>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
              <TextField fullWidth label="Pesquisar cliente, serviço ou destino" value={busca} onChange={(e) => setBusca(e.target.value)} />
              <TextField select sx={{ minWidth: 220 }} label="Status" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="aguardando">Aguardando/chamados</MenuItem>
                <MenuItem value="em_atendimento">Em atendimento</MenuItem>
                <MenuItem value="atendido">Atendidos</MenuItem>
              </TextField>
            </Stack>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tempo</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chamadasFiltradas.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell><Typography sx={{ fontWeight: 700 }}>{item.clienteNome}</Typography></TableCell>
                      <TableCell>{item.servicoNome || '-'}</TableCell>
                      <TableCell>{item.profissionalNome || item.destino}</TableCell>
                      <TableCell><Chip size="small" label={item.status} color={item.status === 'atendido' ? 'success' : item.status === 'em_atendimento' ? 'info' : 'warning'} /></TableCell>
                      <TableCell>{item.status === 'em_atendimento' ? <Chip size="small" icon={<AccessTimeIcon />} label={formatarTempo(item.updatedAt || item.createdAt)} /> : '-'}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => atualizarStatus(item.id, 'chamado')}>Chamar</Button>
                        <Button size="small" onClick={() => iniciarAtendimento(item)}>Iniciar</Button>
                        <Button size="small" onClick={() => atualizarStatus(item.id, 'atendido')}>Atendido</Button>
                        <Button size="small" color="error" onClick={() => salvarChamadas(chamadas.filter(c => c.id !== item.id))}>Remover</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default RecepcaoChamada;
