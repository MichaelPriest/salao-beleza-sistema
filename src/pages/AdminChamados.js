import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';

const statusOptions = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'aguardando_cliente', label: 'Aguardando cliente' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'fechado', label: 'Fechado' },
];

const statusColor = {
  aberto: 'warning',
  em_analise: 'info',
  aguardando_cliente: 'secondary',
  resolvido: 'success',
  fechado: 'default',
};

const statusLabel = Object.fromEntries(statusOptions.map((item) => [item.value, item.label]));
const formatDate = (value) => (value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '-');

function AdminChamados() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [respostas, setRespostas] = useState({});
  const [novoChamado, setNovoChamado] = useState({ clienteId: '', titulo: '', categoria: 'bug', prioridade: 'media', descricao: '' });

  const carregar = async () => {
    setLoading(true);
    try {
      const [data, clientesData] = await Promise.all([
        firebaseService.getAll('chamados_suporte').catch(() => []),
        firebaseService.getAll('clientes').catch(() => []),
      ]);
      setChamados((data || []).sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)));
      setClientes((clientesData || []).sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''))));
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
      toast.error(error.message || 'Erro ao carregar chamados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const chamadosFiltrados = useMemo(() => {
    if (filtro === 'todos') return chamados;
    return chamados.filter((item) => item.status === filtro);
  }, [chamados, filtro]);

  const notificarCliente = async (clienteId, payload) => {
    if (!clienteId) return;
    await firebaseService.add('notificacoes_cliente', {
      usuarioId: clienteId,
      clienteId,
      tipo: 'chamado',
      titulo: payload.titulo,
      mensagem: payload.mensagem,
      link: '/cliente/chamados',
      lida: false,
      data: new Date().toISOString(),
      detalhes: payload.detalhes || {},
    }).catch(() => null);
  };

  const criarChamadoAdmin = async (event) => {
    event.preventDefault();
    if (!novoChamado.titulo.trim() || !novoChamado.descricao.trim()) {
      toast.error('Informe título e descrição do chamado.');
      return;
    }

    setSavingId('novo');
    try {
      const usuario = usuariosService.getUsuarioAtual() || {};
      const cliente = clientes.find((item) => item.id === novoChamado.clienteId) || null;
      const agora = new Date().toISOString();
      const payload = {
        titulo: novoChamado.titulo.trim(),
        categoria: novoChamado.categoria,
        prioridade: novoChamado.prioridade,
        descricao: novoChamado.descricao.trim(),
        status: 'aberto',
        origem: 'admin',
        clienteId: cliente?.authUid || cliente?.googleUid || cliente?.id || null,
        clienteDocId: cliente?.id || null,
        clienteNome: cliente?.nome || 'Cliente não vinculado',
        clienteEmail: cliente?.email || '',
        mensagens: [{ autorTipo: 'admin', autorNome: usuario.nome || usuario.email || 'Suporte', mensagem: novoChamado.descricao.trim(), createdAt: agora }],
        atendenteId: usuario.id || usuario.uid || null,
        atendenteNome: usuario.nome || usuario.email || '',
        createdAt: agora,
        updatedAt: agora,
      };
      const criado = await firebaseService.add('chamados_suporte', payload);
      await notificarCliente(payload.clienteId, {
        titulo: 'Chamado aberto pelo suporte',
        mensagem: `Nossa equipe abriu um chamado: ${payload.titulo}`,
        detalhes: { chamadoId: criado?.id },
      });
      setNovoChamado({ clienteId: '', titulo: '', categoria: 'bug', prioridade: 'media', descricao: '' });
      toast.success('Chamado criado.');
      await carregar();
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      toast.error(error.message || 'Erro ao criar chamado.');
    } finally {
      setSavingId(null);
    }
  };

  const atualizarChamado = async (chamado, patch) => {
    setSavingId(chamado.id);
    try {
      const usuario = usuariosService.getUsuarioAtual() || {};
      const agora = new Date().toISOString();
      const resposta = respostas[chamado.id]?.trim();
      const mensagens = [...(chamado.mensagens || [])];
      if (resposta) {
        mensagens.push({ autorTipo: 'admin', autorNome: usuario.nome || usuario.email || 'Suporte', mensagem: resposta, createdAt: agora });
      }
      await firebaseService.update('chamados_suporte', chamado.id, {
        ...patch,
        respostaAdmin: resposta || chamado.respostaAdmin || '',
        mensagens,
        atendenteId: usuario.id || usuario.uid || null,
        atendenteNome: usuario.nome || usuario.email || '',
        updatedAt: agora,
      });
      if (resposta || patch.status) {
        await notificarCliente(chamado.clienteId, {
          titulo: 'Chamado atualizado',
          mensagem: resposta || `Status alterado para ${statusLabel[patch.status] || patch.status}.`,
          detalhes: { chamadoId: chamado.id, status: patch.status || chamado.status },
        });
      }
      setRespostas((current) => ({ ...current, [chamado.id]: '' }));
      toast.success('Chamado atualizado.');
      await carregar();
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
      toast.error(error.message || 'Erro ao atualizar chamado.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Chamados de suporte</Typography>
          <Typography color="text.secondary">Acompanhe bugs e solicitações enviados pelos clientes.</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={carregar}>Atualizar</Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField select label="Filtrar status" value={filtro} onChange={(e) => setFiltro(e.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="todos">Todos</MenuItem>
          {statusOptions.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
        </TextField>
        <Chip icon={<SupportAgentIcon />} label={`${chamadosFiltrados.length} chamado(s)`} color="primary" />
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent component="form" onSubmit={criarChamadoAdmin}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Criar chamado para cliente</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Cliente (opcional)" value={novoChamado.clienteId} onChange={(e) => setNovoChamado({ ...novoChamado, clienteId: e.target.value })}>
                <MenuItem value="">Sem vínculo</MenuItem>
                {clientes.map((cliente) => <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome || cliente.email}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Título" value={novoChamado.titulo} onChange={(e) => setNovoChamado({ ...novoChamado, titulo: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={6} md={2}><TextField select fullWidth label="Categoria" value={novoChamado.categoria} onChange={(e) => setNovoChamado({ ...novoChamado, categoria: e.target.value })}><MenuItem value="bug">Bug</MenuItem><MenuItem value="acesso">Acesso</MenuItem><MenuItem value="pagamento">Pagamento</MenuItem><MenuItem value="melhoria">Melhoria</MenuItem><MenuItem value="outro">Outro</MenuItem></TextField></Grid>
            <Grid item xs={12} sm={6} md={2}><TextField select fullWidth label="Prioridade" value={novoChamado.prioridade} onChange={(e) => setNovoChamado({ ...novoChamado, prioridade: e.target.value })}><MenuItem value="baixa">Baixa</MenuItem><MenuItem value="media">Média</MenuItem><MenuItem value="alta">Alta</MenuItem><MenuItem value="critica">Crítica</MenuItem></TextField></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Descrição" value={novoChamado.descricao} onChange={(e) => setNovoChamado({ ...novoChamado, descricao: e.target.value })} required /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={savingId === 'novo'}>{savingId === 'novo' ? 'Criando...' : 'Criar chamado'}</Button></Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? <CircularProgress /> : (
        <Grid container spacing={2}>
          {chamadosFiltrados.map((chamado) => (
            <Grid item xs={12} md={6} key={chamado.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{chamado.titulo}</Typography>
                      <Typography variant="body2" color="text.secondary">{chamado.clienteNome} · {chamado.clienteEmail}</Typography>
                      <Typography variant="caption" color="text.secondary">{chamado.empresaNome || chamado.empresaId} · {formatDate(chamado.createdAt)}</Typography>
                    </Box>
                    <Chip size="small" label={statusLabel[chamado.status] || chamado.status} color={statusColor[chamado.status] || 'default'} />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ my: 2 }} flexWrap="wrap">
                    <Chip size="small" variant="outlined" label={`Categoria: ${chamado.categoria}`} />
                    <Chip size="small" variant="outlined" label={`Prioridade: ${chamado.prioridade}`} />
                  </Stack>
                  <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{chamado.descricao}</Typography>
                  {chamado.respostaAdmin && <Alert severity="info" sx={{ mb: 2 }}>{chamado.respostaAdmin}</Alert>}
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Resposta/observação para o cliente"
                    value={respostas[chamado.id] || ''}
                    onChange={(e) => setRespostas({ ...respostas, [chamado.id]: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField select size="small" label="Status" value={chamado.status || 'aberto'} onChange={(e) => atualizarChamado(chamado, { status: e.target.value })} sx={{ minWidth: 180 }} disabled={savingId === chamado.id}>
                      {statusOptions.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
                    </TextField>
                    <Button variant="contained" disabled={savingId === chamado.id} onClick={() => atualizarChamado(chamado, { status: chamado.status || 'em_analise' })}>
                      Salvar resposta
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {chamadosFiltrados.length === 0 && <Grid item xs={12}><Alert severity="info">Nenhum chamado encontrado.</Alert></Grid>}
        </Grid>
      )}
    </Box>
  );
}

export default AdminChamados;
