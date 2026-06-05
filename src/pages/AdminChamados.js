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
  const [filtro, setFiltro] = useState('todos');
  const [respostas, setRespostas] = useState({});

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await firebaseService.getAll('chamados_suporte').catch(() => []);
      setChamados((data || []).sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)));
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
