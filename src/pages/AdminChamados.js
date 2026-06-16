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
import { firebaseService, getTenantContext } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';
import { isSaasPlatformAdmin } from '../utils/saasAccess';

const statusOptions = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'aguardando_empresa', label: 'Aguardando empresa' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'fechado', label: 'Fechado' },
];

const statusColor = {
  aberto: 'warning',
  em_analise: 'info',
  aguardando_empresa: 'secondary',
  resolvido: 'success',
  fechado: 'default',
};

const categorias = [
  { value: 'bug', label: 'Bug / Erro' },
  { value: 'acesso', label: 'Acesso / Login' },
  { value: 'cobranca', label: 'Cobrança' },
  { value: 'configuracao', label: 'Configuração' },
  { value: 'melhoria', label: 'Melhoria' },
  { value: 'outro', label: 'Outro' },
];

const prioridades = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const statusLabel = Object.fromEntries(statusOptions.map((item) => [item.value, item.label]));
const formatDate = (value) => (value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '-');
const platformRoles = ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'];

function AdminChamados() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [respostas, setRespostas] = useState({});
  const [novoChamado, setNovoChamado] = useState({ empresaId: '', titulo: '', categoria: 'bug', prioridade: 'media', descricao: '' });

  const usuarioAtual = usuariosService.getUsuarioAtual() || {};
  const usuarioEhGestorSaas = isSaasPlatformAdmin(usuarioAtual);

  const carregar = async () => {
    setLoading(true);
    try {
      const [data, empresasData] = await Promise.all([
        firebaseService.getAll('chamados_suporte').catch(() => []),
        firebaseService.getAll('empresas').catch(() => []),
      ]);
      setChamados((data || []).sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)));
      setEmpresas((empresasData || []).sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''))));
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

  const notificarUsuarios = async (usuarios, payload) => {
    await Promise.all((usuarios || []).map((usuario) => firebaseService.add('notificacoes', {
      usuarioId: usuario.uid || usuario.id,
      tipo: 'chamado',
      titulo: payload.titulo,
      mensagem: payload.mensagem,
      link: '/chamados',
      lida: false,
      prioridade: payload.prioridade || 'media',
      data: new Date().toISOString(),
      detalhes: payload.detalhes || {},
    }).catch(() => null)));
    window.dispatchEvent(new CustomEvent('novaNotificacao'));
  };

  const notificarGestoresSaas = async (chamado, mensagem = null) => {
    const usuarios = await firebaseService.getAll('usuarios').catch(() => []);
    const gestores = (usuarios || []).filter((usuario) => platformRoles.includes(usuario.cargo || usuario.role) || usuario.isSaasAdmin || usuario.adminSaas);
    await notificarUsuarios(gestores, {
      titulo: 'Chamado de empresa recebido',
      mensagem: mensagem || `${chamado.empresaNome || 'Empresa'} abriu: ${chamado.titulo}`,
      prioridade: chamado.prioridade,
      detalhes: { chamadoId: chamado.id, empresaId: chamado.empresaId },
    });
  };

  const notificarSolicitante = async (chamado, mensagem) => {
    if (!chamado.solicitanteId) return;
    await notificarUsuarios([{ id: chamado.solicitanteId }], {
      titulo: 'Chamado atualizado pelo suporte SaaS',
      mensagem,
      prioridade: chamado.prioridade,
      detalhes: { chamadoId: chamado.id, empresaId: chamado.empresaId },
    });
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
      const tenant = getTenantContext();
      const empresaSelecionada = empresas.find((item) => item.id === novoChamado.empresaId) || tenant.empresa || usuario.empresa || null;
      const empresaId = empresaSelecionada?.id || novoChamado.empresaId || tenant.empresaId || usuario.empresaId || null;
      const agora = new Date().toISOString();
      const payload = {
        titulo: novoChamado.titulo.trim(),
        categoria: novoChamado.categoria,
        prioridade: novoChamado.prioridade,
        descricao: novoChamado.descricao.trim(),
        status: 'aberto',
        origem: usuarioEhGestorSaas ? 'gestor_saas' : 'empresa_admin',
        empresaId,
        empresaNome: empresaSelecionada?.nome || usuario.empresaNome || tenant.empresa?.nome || '',
        solicitanteId: usuario.id || usuario.uid || null,
        solicitanteNome: usuario.nome || usuario.email || 'Gestor da empresa',
        solicitanteEmail: usuario.email || '',
        mensagens: [{ autorTipo: usuarioEhGestorSaas ? 'saas' : 'empresa', autorNome: usuario.nome || usuario.email || 'Solicitante', mensagem: novoChamado.descricao.trim(), createdAt: agora }],
        atendenteId: usuarioEhGestorSaas ? (usuario.id || usuario.uid || null) : null,
        atendenteNome: usuarioEhGestorSaas ? (usuario.nome || usuario.email || '') : '',
        createdAt: agora,
        updatedAt: agora,
      };
      const criado = await firebaseService.add('chamados_suporte', payload);
      if (!usuarioEhGestorSaas) await notificarGestoresSaas({ ...payload, id: criado?.id });
      setNovoChamado({ empresaId: '', titulo: '', categoria: 'bug', prioridade: 'media', descricao: '' });
      toast.success('Chamado enviado ao suporte SaaS.');
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
        mensagens.push({ autorTipo: usuarioEhGestorSaas ? 'saas' : 'empresa', autorNome: usuario.nome || usuario.email || 'Suporte', mensagem: resposta, createdAt: agora });
      }
      await firebaseService.update('chamados_suporte', chamado.id, {
        ...patch,
        respostaAdmin: resposta || chamado.respostaAdmin || '',
        mensagens,
        atendenteId: usuarioEhGestorSaas ? (usuario.id || usuario.uid || null) : chamado.atendenteId || null,
        atendenteNome: usuarioEhGestorSaas ? (usuario.nome || usuario.email || '') : chamado.atendenteNome || '',
        updatedAt: agora,
      });
      if (usuarioEhGestorSaas && (resposta || patch.status)) {
        await notificarSolicitante(chamado, resposta || `Status alterado para ${statusLabel[patch.status] || patch.status}.`);
      } else if (!usuarioEhGestorSaas && resposta) {
        await notificarGestoresSaas(chamado, `${chamado.empresaNome || 'Empresa'} respondeu o chamado: ${chamado.titulo}`);
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Chamados SaaS</Typography>
          <Typography color="text.secondary">
            {usuarioEhGestorSaas ? 'Acompanhe solicitações enviadas pelas empresas da plataforma.' : 'Abra e acompanhe solicitações da sua empresa para o gestor SaaS.'}
          </Typography>
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
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{usuarioEhGestorSaas ? 'Registrar chamado SaaS' : 'Abrir chamado para o suporte SaaS'}</Typography>
          <Grid container spacing={2}>
            {usuarioEhGestorSaas && (
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Empresa" value={novoChamado.empresaId} onChange={(e) => setNovoChamado({ ...novoChamado, empresaId: e.target.value })}>
                  <MenuItem value="">Sem vínculo</MenuItem>
                  {empresas.map((empresa) => <MenuItem key={empresa.id} value={empresa.id}>{empresa.nome || empresa.slug || empresa.id}</MenuItem>)}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} md={usuarioEhGestorSaas ? 4 : 6}><TextField fullWidth label="Título" value={novoChamado.titulo} onChange={(e) => setNovoChamado({ ...novoChamado, titulo: e.target.value })} required /></Grid>
            <Grid item xs={12} sm={6} md={2}><TextField select fullWidth label="Categoria" value={novoChamado.categoria} onChange={(e) => setNovoChamado({ ...novoChamado, categoria: e.target.value })}>{categorias.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} sm={6} md={2}><TextField select fullWidth label="Prioridade" value={novoChamado.prioridade} onChange={(e) => setNovoChamado({ ...novoChamado, prioridade: e.target.value })}>{prioridades.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Descrição" value={novoChamado.descricao} onChange={(e) => setNovoChamado({ ...novoChamado, descricao: e.target.value })} required /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={savingId === 'novo'}>{savingId === 'novo' ? 'Enviando...' : 'Abrir chamado'}</Button></Grid>
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
                      <Typography variant="body2" color="text.secondary">{chamado.empresaNome || chamado.empresaId || 'Empresa não vinculada'} · {chamado.solicitanteNome || chamado.solicitanteEmail || 'Solicitante'}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDate(chamado.createdAt)}</Typography>
                    </Box>
                    <Chip size="small" label={statusLabel[chamado.status] || chamado.status} color={statusColor[chamado.status] || 'default'} />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ my: 2 }} flexWrap="wrap">
                    <Chip size="small" variant="outlined" label={`Categoria: ${chamado.categoria}`} />
                    <Chip size="small" variant="outlined" label={`Prioridade: ${chamado.prioridade}`} />
                    <Chip size="small" variant="outlined" label={`Origem: ${chamado.origem || 'empresa_admin'}`} />
                  </Stack>
                  <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{chamado.descricao}</Typography>
                  {chamado.respostaAdmin && <Alert severity="info" sx={{ mb: 2 }}>{chamado.respostaAdmin}</Alert>}
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label={usuarioEhGestorSaas ? 'Resposta do suporte SaaS' : 'Complemento da empresa'}
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
