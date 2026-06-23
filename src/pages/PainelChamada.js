import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import { firebaseService } from '../services/firebase';

const CHAMADAS_KEY = 'painel.chamadas';
const carregarChamadas = () => {
  try { return JSON.parse(localStorage.getItem(CHAMADAS_KEY) || '[]'); } catch (error) { return []; }
};

const formatarTempo = (inicio) => {
  if (!inicio) return '00:00';
  const diff = Math.max(0, Date.now() - new Date(inicio).getTime());
  const min = Math.floor(diff / 60000);
  const seg = Math.floor((diff % 60000) / 1000);
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
};

const normalizarConfigPainel = (cfg = {}) => ({
  nomeEmpresa: cfg.salao?.nomeFantasia || cfg.salao?.nome || cfg.nomeEmpresa || cfg.nomeSalao || 'Salão de Beleza',
  logoUrl: cfg.salao?.logo || cfg.logoUrl || cfg.logo || '',
  mensagem: cfg.painelChamada?.mensagem || 'Acompanhe sua chamada no painel',
  corFundo: cfg.painelChamada?.corFundo || '#111827',
  corPrimaria: cfg.painelChamada?.corPrimaria || cfg.tema?.corPrimaria || '#9c27b0',
  vozAtiva: cfg.painelChamada?.vozAtiva !== false,
});

function PainelChamada() {
  const [chamadas, setChamadas] = useState(carregarChamadas);
  const [atendimentos, setAtendimentos] = useState([]);
  const [config, setConfig] = useState(normalizarConfigPainel());
  const ultimaFaladoRef = useRef('');

  const carregarConfiguracaoPainel = () => {
    Promise.all([
      firebaseService.getAll('configuracoes').catch(() => []),
      firebaseService.getAll('atendimentos').catch(() => []),
    ]).then(([dados, atendimentosData]) => {
      setConfig(normalizarConfigPainel(dados?.[0] || {}));
      setAtendimentos(atendimentosData || []);
    }).catch(() => null);
  };

  useEffect(() => {
    carregarConfiguracaoPainel();
    const interval = setInterval(() => {
      setChamadas(carregarChamadas());
      carregarConfiguracaoPainel();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const ultimaChamada = chamadas.find((item) => ['chamado', 'em_atendimento'].includes(item.status)) || chamadas[0];
  const aguardando = chamadas.filter((item) => item.status === 'aguardando');
  const emAtendimento = chamadas.filter((item) => item.status === 'em_atendimento');
  const historicoAtendimentos = [
    ...chamadas
      .filter((item) => item.status === 'atendido')
      .map((item) => ({ ...item, origem: 'painel', dataHistorico: item.updatedAt || item.createdAt })),
    ...atendimentos
      .filter((item) => ['finalizado', 'concluido', 'concluído', 'em_andamento'].includes(String(item.status || '').toLowerCase()))
      .map((item) => ({
        id: item.id,
        clienteNome: item.clienteNome || item.cliente?.nome || 'Cliente',
        profissionalNome: item.profissionalNome || item.profissional?.nome || '',
        servicoNome: item.servicoNome || item.servico?.nome || 'Atendimento',
        destino: item.profissionalNome || item.profissional?.nome || 'Atendimento',
        status: item.status,
        origem: 'atendimento',
        dataHistorico: item.finalizadoEm || item.updatedAt || item.data || item.createdAt,
      })),
  ]
    .filter((item, index, lista) => lista.findIndex((comparar) => comparar.id === item.id && comparar.origem === item.origem) === index)
    .sort((a, b) => new Date(b.dataHistorico || 0) - new Date(a.dataHistorico || 0))
    .slice(0, 8);

  useEffect(() => {
    if (!ultimaChamada || ultimaFaladoRef.current === ultimaChamada.id || ultimaChamada.status !== 'chamado' || !config.vozAtiva) return;
    ultimaFaladoRef.current = ultimaChamada.id;
    if ('speechSynthesis' in window) {
      const destino = ultimaChamada.destino || ultimaChamada.profissionalNome || 'recepção';
      const frase = `${ultimaChamada.clienteNome}, por favor dirigir-se a ${destino}`;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(frase));
    }
  }, [ultimaChamada]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: config.corFundo, color: 'white', p: { xs: 2, md: 4 }, background: `radial-gradient(circle at top left, ${config.corPrimaria} 0, ${config.corFundo} 38%, #020617 100%)` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={config.logoUrl} sx={{ width: 72, height: 72, bgcolor: 'white', color: config.corPrimaria, fontWeight: 800 }}>{(config.nomeEmpresa || 'S').charAt(0)}</Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>{config.nomeEmpresa || 'Salão de Beleza'}</Typography>
            <Typography variant="h6" sx={{ opacity: 0.8 }}>{config.mensagem || 'Acompanhe sua chamada no painel'}</Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h5">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Typography>
          <Typography>{new Date().toLocaleDateString('pt-BR')}</Typography>
        </Box>
      </Box>

      {ultimaChamada ? (
        <Card sx={{ mb: 4, bgcolor: '#ffffff', color: '#111827', borderRadius: 4, boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}>
          <CardContent sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
            <Typography variant="h2" sx={{ fontWeight: 900, color: config.corPrimaria }}>{ultimaChamada.clienteNome}</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>{ultimaChamada.destino || ultimaChamada.profissionalNome || 'Recepção'}</Typography>
            <Typography variant="h5" sx={{ mt: 1, color: '#555' }}>{ultimaChamada.servicoNome || 'Atendimento'}</Typography>
            <Chip sx={{ mt: 3, px: 2, py: 3, fontSize: 20, bgcolor: config.corPrimaria, color: 'white', fontWeight: 900 }} label={ultimaChamada.status === 'em_atendimento' ? 'EM ATENDIMENTO' : 'CHAMADO'} />
          </CardContent>
        </Card>
      ) : (
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 4 }}>Nenhum cliente aguardando.</Typography>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 800 }}>Aguardando</Typography>
          <Grid container spacing={2}>
            {aguardando.slice(0, 8).map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}><CardContent><Typography variant="h6">{item.clienteNome}</Typography><Typography>{item.servicoNome || item.destino || 'Aguardando'}</Typography><Typography variant="caption">{item.profissionalNome || item.destino || ''}</Typography></CardContent></Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 800 }}>Em atendimento</Typography>
          {emAtendimento.slice(0, 5).map((item) => <Card key={item.id} sx={{ mb: 1, bgcolor: '#064e3b', color: 'white' }}><CardContent><Typography>{item.clienteNome}</Typography><Typography variant="caption">{item.destino || item.profissionalNome} • {formatarTempo(item.updatedAt || item.createdAt)}</Typography></CardContent></Card>)}
          <Typography variant="h5" sx={{ mt: 3, mb: 2, fontWeight: 800 }}>Histórico de atendimentos</Typography>
          {historicoAtendimentos.length > 0 ? historicoAtendimentos.map((item) => (
            <Card key={`${item.origem}-${item.id}`} sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.14)' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography sx={{ fontWeight: 800 }}>{item.clienteNome}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>{item.servicoNome || 'Atendimento'} • {item.destino || item.profissionalNome || 'Recepção'}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>{item.dataHistorico ? new Date(item.dataHistorico).toLocaleString('pt-BR') : 'Sem horário registrado'}</Typography>
              </CardContent>
            </Card>
          )) : (
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white', border: '1px dashed rgba(255,255,255,0.2)' }}>
              <CardContent><Typography>Nenhum atendimento concluído ainda.</Typography></CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default PainelChamada;
