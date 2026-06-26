import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Button, Chip, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { Campaign, Fullscreen, FullscreenExit, RecordVoiceOver, Schedule, Spa, VolumeUp } from '@mui/icons-material';
import { firebaseService } from '../services/firebase';
import { formatLocalDate, getLocalDateInputValue } from '../utils/dateTimeUtils';
import { getAgendamentoStatusInfo } from '../utils/agendamentoStatus';

const getServicoNome = (item = {}) => item.servicoNome || item.servicos?.[0]?.nome || item.servicosNomes || 'Serviço';
const getClienteNome = (item = {}) => item.clienteNomeResolvido || item.clienteNome || item.cliente || item.nomeCliente || 'Cliente';
const getProfissionalNome = (item = {}) => item.profissionalNomeResolvido || item.profissionalNome || item.nomeProfissional || item.profissional?.nome || 'Profissional';
const normalizarTexto = (valor) => String(valor || '').trim().toLowerCase();
const formatarEnderecoEmpresa = (endereco) => {
  if (!endereco) return '';
  if (typeof endereco === 'string') return endereco;
  return [endereco.rua || endereco.logradouro, endereco.numero, endereco.bairro, endereco.cidade, endereco.estado].filter(Boolean).join(', ');
};

const resolveClientePainel = (agendamento = {}, clientes = []) => {
  const ids = [agendamento.clienteId, agendamento.clienteUid, agendamento.clienteAuthUid, agendamento.authUid, agendamento.usuarioId, agendamento.userId].filter(Boolean).map(String);
  const email = normalizarTexto(agendamento.clienteEmail || agendamento.email);

  return clientes.find((cliente) => {
    const clienteIds = [cliente.id, cliente.uid, cliente.authUid, cliente.googleUid, cliente.userId].filter(Boolean).map(String);
    return ids.some((id) => clienteIds.includes(id)) || (email && normalizarTexto(cliente.email) === email);
  });
};

const resolveProfissionalPainel = (agendamento = {}, profissionais = []) => {
  const ids = [agendamento.profissionalId, agendamento.profissionalUid, agendamento.profissional?.id].filter(Boolean).map(String);
  const nome = normalizarTexto(agendamento.profissionalNome || agendamento.nomeProfissional || agendamento.profissional?.nome);

  return profissionais.find((profissional) => {
    const profissionalIds = [profissional.id, profissional.uid].filter(Boolean).map(String);
    return ids.some((id) => profissionalIds.includes(id)) || (nome && normalizarTexto(profissional.nome) === nome);
  });
};

const enriquecerAgendamentosPainel = (agendamentos = [], clientes = [], profissionais = []) => agendamentos.map((agendamento) => {
  const cliente = resolveClientePainel(agendamento, clientes);
  const profissional = resolveProfissionalPainel(agendamento, profissionais);
  return {
    ...agendamento,
    clienteNomeResolvido: cliente?.nome || cliente?.nomeCompleto || agendamento.clienteNome || agendamento.cliente || agendamento.nomeCliente,
    clienteFotoResolvida: cliente?.foto || cliente?.avatar || agendamento.clienteFoto || '',
    profissionalNomeResolvido: profissional?.nome || agendamento.profissionalNome || agendamento.nomeProfissional || agendamento.profissional?.nome,
    profissionalFotoResolvida: profissional?.foto || profissional?.avatar || agendamento.profissionalFoto || '',
  };
});

function PainelChamada() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [config, setConfig] = useState({});
  const [empresa, setEmpresa] = useState({});
  const [hora, setHora] = useState(new Date());
  const [fullscreenAtivo, setFullscreenAtivo] = useState(false);
  const ultimoAnuncioRef = useRef('');

  const intervalo = Math.max(Number(config.intervaloAtualizacao || 30), 5) * 1000;
  const quantidadeProximos = Number(config.quantidadeProximos || 8);
  const corPrimaria = config.corPrimaria || '#7b1fa2';
  const salao = empresa.salao || {};
  const sistema = empresa.sistema || {};
  const logoEmpresa = salao.logo || empresa.sitePublico?.logo || '';
  const nomeEmpresa = salao.nomeFantasia || salao.nome || sistema.nome || 'Salão de Beleza';
  const enderecoEmpresa = formatarEnderecoEmpresa(salao.endereco) || empresa.sitePublico?.enderecoPublico || 'Endereço não configurado';
  const contatoEmpresa = salao.contato?.telefone || salao.contato?.whatsapp || empresa.sitePublico?.telefone || 'Contato não configurado';

  useEffect(() => {
    carregar();
    const timer = setInterval(() => setHora(new Date()), 1000);
    const reload = setInterval(carregar, intervalo);
    return () => { clearInterval(timer); clearInterval(reload); };
  }, [intervalo]);

  const carregar = async () => {
    const hoje = getLocalDateInputValue();
    const [agendamentosData, configuracoesData, clientesData, profissionaisData] = await Promise.all([
      firebaseService.query('agendamentos', [{ field: 'data', operator: '==', value: hoje }], 'horario', 'asc').catch(() => []),
      firebaseService.getAll('configuracoes').catch(() => []),
      firebaseService.getAll('clientes').catch(() => []),
      firebaseService.getAll('profissionais').catch(() => []),
    ]);
    const configuracao = configuracoesData?.[0] || {};
    setAgendamentos(enriquecerAgendamentosPainel(agendamentosData || [], clientesData || [], profissionaisData || []));
    setConfig(configuracao.painelChamada || {});
    setEmpresa(configuracao);
  };

  const proximos = useMemo(() => agendamentos
    .filter((a) => !['cancelado', 'finalizado', 'concluido'].includes(String(a.status || '').toLowerCase()))
    .slice(0, quantidadeProximos), [agendamentos, quantidadeProximos]);
  const atual = proximos[0];
  const statusAtual = getAgendamentoStatusInfo(atual?.status || 'pendente');

  const anunciarChamada = (item = atual) => {
    if (!item || !window.speechSynthesis) return;
    const texto = `${getClienteNome(item)}, favor dirigir-se ao atendimento com ${getProfissionalNome(item)}. Serviço: ${getServicoNome(item)}.`;
    const voz = config.tipoVoz || 'feminina';
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.92;
    utterance.pitch = voz === 'masculina' ? 0.75 : 1.15;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (config.anunciarAutomaticamente === false || !atual) return;
    const assinatura = `${atual.id || atual.horario}-${getClienteNome(atual)}-${getProfissionalNome(atual)}`;
    if (ultimoAnuncioRef.current === assinatura) return;
    ultimoAnuncioRef.current = assinatura;
    anunciarChamada(atual);
  }, [atual?.id, atual?.horario, config.anunciarAutomaticamente, config.tipoVoz]);

  const alternarFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      setFullscreenAtivo(true);
    } else {
      await document.exitFullscreen?.();
      setFullscreenAtivo(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', color: 'white', p: { xs: 2, md: 5 }, pb: { xs: 16, md: 12 }, background: `radial-gradient(circle at top left, ${corPrimaria}66, transparent 30%), linear-gradient(135deg,#13051f,#27113b 55%,#100414)` }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={logoEmpresa || undefined} sx={{ width: { xs: 58, md: 76 }, height: { xs: 58, md: 76 }, bgcolor: 'rgba(255,255,255,.18)', border: '2px solid rgba(255,255,255,.28)' }}>{!logoEmpresa && nomeEmpresa.charAt(0)}</Avatar>
          <Box>
            <Chip icon={<VolumeUp />} label="Recepção" sx={{ mb: 1, color: 'white', bgcolor: 'rgba(255,255,255,.14)' }} />
            <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1, fontSize: { xs: '2rem', md: '3.75rem' } }}>{config.titulo || 'Painel de Chamada'}</Typography>
            <Typography variant="h6" sx={{ opacity: .78 }}>{config.subtitulo || nomeEmpresa}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button startIcon={<RecordVoiceOver />} onClick={() => anunciarChamada()} disabled={!atual} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,.12)', '&:hover': { bgcolor: 'rgba(255,255,255,.2)' } }}>Áudio</Button>
          <Tooltip title={fullscreenAtivo ? 'Sair da tela cheia' : 'Abrir em tela cheia'}>
            <IconButton onClick={alternarFullscreen} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,.12)' }}>{fullscreenAtivo ? <FullscreenExit /> : <Fullscreen />}</IconButton>
          </Tooltip>
          <Paper sx={{ px: 3, py: 2, borderRadius: 4, color: 'white', bgcolor: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.16)' }}>
            <Stack direction="row" spacing={1.5} alignItems="center"><Schedule /><Typography variant="h4" sx={{ fontWeight: 900 }}>{hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Typography></Stack>
            <Typography variant="caption" sx={{ opacity: .75 }}>{hora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</Typography>
          </Paper>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ minHeight: { xs: 360, md: 520 }, p: { xs: 3, md: 6 }, borderRadius: 6, color: 'white', background: `linear-gradient(135deg,${corPrimaria},#ec407a)`, boxShadow: '0 28px 80px rgba(0,0,0,.35)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Avatar src={atual?.clienteFotoResolvida || undefined} sx={{ width: { xs: 104, md: 138 }, height: { xs: 104, md: 138 }, bgcolor: 'rgba(255,255,255,.22)', fontSize: 44, fontWeight: 900, border: '4px solid rgba(255,255,255,.28)' }}>{atual ? getClienteNome(atual).charAt(0) : <Campaign sx={{ fontSize: 64 }} />}</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ opacity: .86, fontWeight: 700 }}>Chamando agora</Typography>
                <Typography variant="h1" sx={{ fontWeight: 900, my: 1, fontSize: { xs: '2.3rem', md: '4.5rem' }, lineHeight: 1 }}>{atual ? getClienteNome(atual) : (config.mensagemVazio || 'Aguardando próximo cliente')}</Typography>
                <Typography variant="h4" sx={{ opacity: .92 }}>{atual ? getServicoNome(atual) : 'Sem chamada ativa'}</Typography>
              </Box>
            </Stack>

            {atual && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Chip label={statusAtual.label} sx={{ bgcolor: statusAtual.bg, color: statusAtual.hex, fontWeight: 900, fontSize: 16, py: 2.4 }} />
                <Chip avatar={<Avatar src={atual.profissionalFotoResolvida || undefined}>{!atual.profissionalFotoResolvida && getProfissionalNome(atual).charAt(0)}</Avatar>} label={`Profissional: ${getProfissionalNome(atual)}`} sx={{ bgcolor: 'rgba(255,255,255,.2)', color: 'white', fontSize: 18, py: 2.3 }} />
                <Chip label={`${atual.horario || '--:--'} • ${formatLocalDate(atual.data, { weekday: 'long' })}`} sx={{ bgcolor: 'rgba(255,255,255,.2)', color: 'white', fontSize: 16, py: 2.3 }} />
              </Stack>
            )}
          </Paper>
        </Grid>
        {config.mostrarProximos !== false && (
          <Grid item xs={12} md={5}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Próximos chamados</Typography>
            <Stack spacing={2}>
              {proximos.slice(1).map((item, index) => {
                const statusInfo = getAgendamentoStatusInfo(item.status);
                return (
                  <Paper key={item.id || index} sx={{ p: 2.5, borderRadius: 4, bgcolor: 'rgba(255,255,255,.09)', color: 'white', border: '1px solid rgba(255,255,255,.14)' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={item.clienteFotoResolvida || undefined} sx={{ width: 54, height: 54, bgcolor: '#ec407a', fontWeight: 900 }}>{item.clienteFotoResolvida ? '' : getClienteNome(item).charAt(0)}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 800 }}>{getClienteNome(item)}</Typography>
                        <Typography sx={{ opacity: .75 }}>{item.horario || '--:--'} • {getServicoNome(item)}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: .75 }} alignItems="center">
                          <Chip size="small" label={statusInfo.label} sx={{ bgcolor: statusInfo.bg, color: statusInfo.hex, fontWeight: 700 }} />
                          <Chip size="small" avatar={<Avatar src={item.profissionalFotoResolvida || undefined}>{!item.profissionalFotoResolvida && getProfissionalNome(item).charAt(0)}</Avatar>} label={getProfissionalNome(item)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,.12)', maxWidth: 190 }} />
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Grid>
        )}
      </Grid>

      <Paper sx={{ position: 'fixed', left: { xs: 12, md: 32 }, right: { xs: 12, md: 32 }, bottom: { xs: 12, md: 24 }, p: { xs: 1.5, md: 2 }, borderRadius: 4, color: 'white', bgcolor: 'rgba(255,255,255,.12)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,.16)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>{nomeEmpresa}</Typography>
          <Typography variant="caption" sx={{ opacity: .82 }}>{enderecoEmpresa}</Typography>
          <Typography variant="caption" sx={{ opacity: .82 }}>{contatoEmpresa}</Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
export default PainelChamada;
