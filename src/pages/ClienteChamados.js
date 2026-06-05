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
  BugReport as BugReportIcon,
  SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { firebaseService, getTenantContext } from '../services/firebase';

const categorias = [
  { value: 'bug', label: 'Bug / Erro no sistema' },
  { value: 'acesso', label: 'Acesso / Login' },
  { value: 'agendamento', label: 'Agendamento' },
  { value: 'pagamento', label: 'Pagamento' },
  { value: 'melhoria', label: 'Sugestão de melhoria' },
  { value: 'outro', label: 'Outro assunto' },
];

const prioridades = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const statusColor = {
  aberto: 'warning',
  em_analise: 'info',
  aguardando_cliente: 'secondary',
  resolvido: 'success',
  fechado: 'default',
};

const statusLabel = {
  aberto: 'Aberto',
  em_analise: 'Em análise',
  aguardando_cliente: 'Aguardando cliente',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

const notificarAdminsNovoChamado = async (chamado) => {
  try {
    const usuarios = await firebaseService.getAll('usuarios').catch(() => []);
    const admins = (usuarios || []).filter((usuario) => ['admin', 'gerente', 'superadmin', 'admin_saas', 'saas_admin'].includes(usuario.cargo || usuario.role));
    await Promise.all(admins.map((admin) => firebaseService.add('notificacoes', {
      usuarioId: admin.uid || admin.id,
      tipo: 'chamado',
      titulo: 'Novo chamado de suporte',
      mensagem: `${chamado.clienteNome} abriu: ${chamado.titulo}`,
      link: '/chamados',
      lida: false,
      prioridade: chamado.prioridade || 'media',
      data: chamado.createdAt,
      detalhes: { chamadoId: chamado.id, clienteId: chamado.clienteId },
    }).catch(() => null)));
    window.dispatchEvent(new CustomEvent('novaNotificacao'));
  } catch (error) {
    console.error('Erro ao notificar administradores sobre chamado:', error);
  }
};

const formatDate = (value) => (value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '-');

function ClienteChamados() {
  const { cliente, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chamados, setChamados] = useState([]);
  const [form, setForm] = useState({ titulo: '', categoria: 'bug', prioridade: 'media', descricao: '' });

  const clienteId = firebaseUser?.uid || cliente?.authUid || cliente?.id;

  const carregar = async () => {
    if (!clienteId) return;
    setLoading(true);
    try {
      const ids = Array.from(new Set([cliente?.id, cliente?.authUid, cliente?.googleUid, firebaseUser?.uid].filter(Boolean)));
      const resultados = await Promise.all(ids.map((id) => firebaseService.query('chamados_suporte', [
        { field: 'clienteId', operator: '==', value: id }
      ], 'createdAt', 'desc').catch(() => [])));
      const unicos = Array.from(new Map(resultados.flat().map((item) => [item.id, item])).values())
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setChamados(unicos);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
      toast.error(error.message || 'Erro ao carregar chamados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, [clienteId]);

  const estatisticas = useMemo(() => ({
    abertos: chamados.filter((item) => !['resolvido', 'fechado'].includes(item.status)).length,
    resolvidos: chamados.filter((item) => item.status === 'resolvido').length,
  }), [chamados]);

  const criarChamado = async (event) => {
    event.preventDefault();
    if (!form.titulo.trim() || !form.descricao.trim()) {
      toast.error('Informe título e descrição do chamado.');
      return;
    }

    setSaving(true);
    try {
      const tenant = getTenantContext();
      const agora = new Date().toISOString();
      const payload = {
        titulo: form.titulo.trim(),
        categoria: form.categoria,
        prioridade: form.prioridade,
        descricao: form.descricao.trim(),
        status: 'aberto',
        origem: 'portal_cliente',
        clienteId,
        clienteDocId: cliente?.id || null,
        clienteNome: cliente?.nome || cliente?.email || 'Cliente',
        clienteEmail: cliente?.email || firebaseUser?.email || '',
        empresaId: cliente?.empresaId || tenant.empresaId,
        empresaNome: cliente?.empresaNome || tenant.empresa?.nome || '',
        mensagens: [{ autorTipo: 'cliente', autorNome: cliente?.nome || 'Cliente', mensagem: form.descricao.trim(), createdAt: agora }],
        createdAt: agora,
        updatedAt: agora,
      };
      const criado = await firebaseService.add('chamados_suporte', payload);
      await notificarAdminsNovoChamado({ ...payload, id: criado?.id });
      setForm({ titulo: '', categoria: 'bug', prioridade: 'media', descricao: '' });
      toast.success('Chamado enviado com sucesso.');
      await carregar();
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      toast.error(error.message || 'Erro ao enviar chamado.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#9c27b0' }}>Chamados de suporte</Typography>
          <Typography color="text.secondary">Envie bugs, dúvidas ou solicitações para a equipe do sistema.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip icon={<SupportAgentIcon />} label={`${estatisticas.abertos} aberto(s)`} color="warning" />
          <Chip icon={<BugReportIcon />} label={`${estatisticas.resolvidos} resolvido(s)`} color="success" />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent component="form" onSubmit={criarChamado}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Novo chamado</Typography>
              <Stack spacing={2}>
                <TextField label="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
                <TextField select label="Categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                  {categorias.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
                </TextField>
                <TextField select label="Prioridade" value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })}>
                  {prioridades.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
                </TextField>
                <TextField multiline minRows={5} label="Descreva o problema ou solicitação" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
                <Button type="submit" variant="contained" disabled={saving} startIcon={<AddIcon />}>{saving ? 'Enviando...' : 'Enviar chamado'}</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          {loading ? <CircularProgress /> : (
            <Stack spacing={2}>
              {chamados.map((chamado) => (
                <Card key={chamado.id} variant="outlined">
                  <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{chamado.titulo}</Typography>
                        <Typography variant="body2" color="text.secondary">Criado em {formatDate(chamado.createdAt)}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={statusLabel[chamado.status] || chamado.status} color={statusColor[chamado.status] || 'default'} />
                        <Chip size="small" variant="outlined" label={chamado.prioridade} />
                      </Stack>
                    </Stack>
                    <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{chamado.descricao}</Typography>
                    {chamado.respostaAdmin && <Alert severity="info" sx={{ mt: 2 }}>{chamado.respostaAdmin}</Alert>}
                  </CardContent>
                </Card>
              ))}
              {chamados.length === 0 && <Alert severity="info">Você ainda não abriu chamados.</Alert>}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default ClienteChamados;
