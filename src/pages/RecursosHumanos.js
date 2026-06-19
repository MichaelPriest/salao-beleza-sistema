import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Groups as GroupsIcon,
  Payments as PaymentsIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { firebaseService } from '../services/firebase';
import ProfissionaisSectionNav from '../components/ProfissionaisSectionNav';

const RH_EVENTOS_KEY = 'rh.eventos';
const RH_PONTOS_KEY = 'rh.pontos';

const tiposEvento = [
  { value: 'ferias', label: 'Férias', color: 'info' },
  { value: 'folga', label: 'Folga', color: 'success' },
  { value: 'licenca', label: 'Licença', color: 'warning' },
  { value: 'treinamento', label: 'Treinamento', color: 'secondary' },
  { value: 'documento', label: 'Documento', color: 'primary' },
  { value: 'advertencia', label: 'Advertência', color: 'error' },
];

const statusEvento = [
  { value: 'pendente', label: 'Pendente', color: 'warning' },
  { value: 'aprovado', label: 'Aprovado', color: 'success' },
  { value: 'rejeitado', label: 'Rejeitado', color: 'error' },
  { value: 'concluido', label: 'Concluído', color: 'info' },
];

const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(Number(valor) || 0);

const calcularDias = (inicio, fim) => {
  if (!inicio || !fim) return 0;
  const dataInicio = new Date(`${inicio}T00:00:00`);
  const dataFim = new Date(`${fim}T00:00:00`);
  if (Number.isNaN(dataInicio.getTime()) || Number.isNaN(dataFim.getTime())) return 0;
  return Math.max(1, Math.round((dataFim - dataInicio) / 86400000) + 1);
};

function RecursosHumanos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [profissionais, setProfissionais] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [eventos, setEventos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RH_EVENTOS_KEY) || '[]');
    } catch (error) {
      return [];
    }
  });
  const [pontos, setPontos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RH_PONTOS_KEY) || '[]');
    } catch (error) {
      return [];
    }
  });
  const [pontoProfissionalId, setPontoProfissionalId] = useState('');
  const [openEventoDialog, setOpenEventoDialog] = useState(false);
  const [eventoForm, setEventoForm] = useState({
    profissionalId: '',
    tipo: 'ferias',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    status: 'pendente',
    observacoes: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    localStorage.setItem(RH_EVENTOS_KEY, JSON.stringify(eventos));
  }, [eventos]);

  useEffect(() => {
    localStorage.setItem(RH_PONTOS_KEY, JSON.stringify(pontos));
  }, [pontos]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [profissionaisData, disponibilidadesData, atendimentosData, comissoesData, servicosData] = await Promise.all([
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('disponibilidades').catch(() => []),
        firebaseService.getAll('atendimentos').catch(() => []),
        firebaseService.getAll('comissoes').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
      ]);
      setProfissionais(profissionaisData || []);
      setDisponibilidades(disponibilidadesData || []);
      setAtendimentos(atendimentosData || []);
      setComissoes(comissoesData || []);
      setServicos(servicosData || []);
    } catch (error) {
      console.error('Erro ao carregar RH:', error);
    } finally {
      setLoading(false);
    }
  };

  const profissionaisAtivos = profissionais.filter((profissional) => profissional.status !== 'inativo' && profissional.ativo !== false);
  const disponibilidadesAtivas = disponibilidades.filter((item) => item.ativo !== false);
  const eventosPendentes = eventos.filter((evento) => evento.status === 'pendente');

  const folhaPrevista = useMemo(() => profissionaisAtivos.reduce((total, profissional) => {
    const valorHora = Number(profissional.precoHora) || 0;
    const diasAtivos = disponibilidadesAtivas.filter((item) => item.profissionalId === profissional.id).length || (profissional.diasTrabalho || []).length;
    return total + (valorHora * 8 * diasAtivos * 4);
  }, 0), [profissionaisAtivos, disponibilidadesAtivas]);

  const comissoesPendentes = comissoes
    .filter((comissao) => ['pendente', 'a_pagar'].includes(comissao.status || 'pendente'))
    .reduce((total, comissao) => total + (Number(comissao.valor) || Number(comissao.valorComissao) || 0), 0);


  const relatorioProfissionais = useMemo(() => profissionais.map((profissional) => {
    const atendimentosProfissional = atendimentos.filter((atendimento) => atendimento.profissionalId === profissional.id);
    const faturamento = atendimentosProfissional.reduce((total, atendimento) => {
      const servico = servicos.find((item) => item.id === atendimento.servicoId);
      const valorAtendimento = (atendimento.servicosRealizados || []).reduce((sum, item) => sum + (Number(item.preco) || 0), 0);
      return total + (valorAtendimento || Number(servico?.preco) || 0);
    }, 0);
    const comissoesProfissional = comissoes
      .filter((comissao) => comissao.profissionalId === profissional.id)
      .reduce((total, comissao) => total + (Number(comissao.valor) || Number(comissao.valorComissao) || 0), 0);
    const escalasAtivas = disponibilidadesAtivas.filter((item) => item.profissionalId === profissional.id).length;
    const eventosAbertos = eventos.filter((evento) => evento.profissionalId === profissional.id && evento.status === 'pendente').length;

    return {
      id: profissional.id,
      nome: profissional.nome,
      status: profissional.status || 'ativo',
      especialidades: (profissional.especialidades || [profissional.especialidade]).filter(Boolean).join(', '),
      atendimentos: atendimentosProfissional.length,
      faturamento,
      comissoes: comissoesProfissional,
      escalasAtivas,
      eventosAbertos,
    };
  }), [profissionais, atendimentos, servicos, comissoes, disponibilidadesAtivas, eventos]);

  const exportarRelatorioRh = () => {
    const cabecalho = ['Nome', 'Status', 'Especialidades', 'Atendimentos', 'Faturamento', 'Comissões', 'Escalas Ativas', 'Pendências'];
    const linhas = relatorioProfissionais.map((item) => [
      item.nome,
      item.status,
      item.especialidades,
      item.atendimentos,
      item.faturamento,
      item.comissoes,
      item.escalasAtivas,
      item.eventosAbertos,
    ]);
    const csv = [cabecalho, ...linhas]
      .map((linha) => linha.map((valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_rh_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const salvarEvento = () => {
    if (!eventoForm.profissionalId || !eventoForm.dataInicio || !eventoForm.dataFim) return;
    const profissional = profissionais.find((item) => item.id === eventoForm.profissionalId);
    const novoEvento = {
      ...eventoForm,
      id: crypto.randomUUID(),
      profissionalNome: profissional?.nome || 'Profissional',
      dias: calcularDias(eventoForm.dataInicio, eventoForm.dataFim),
      createdAt: new Date().toISOString(),
    };
    setEventos([novoEvento, ...eventos]);
    setOpenEventoDialog(false);
    setEventoForm({
      profissionalId: '',
      tipo: 'ferias',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: new Date().toISOString().split('T')[0],
      status: 'pendente',
      observacoes: '',
    });
  };

  const sincronizarEventoComDisponibilidade = async (evento, status) => {
    if (status !== 'aprovado' || evento.ausenciaId || !['ferias', 'folga', 'licenca', 'treinamento'].includes(evento.tipo)) return null;

    const ausencia = await firebaseService.add('ausencias', {
      profissionalId: evento.profissionalId,
      tipo: evento.tipo === 'licenca' ? 'licenca' : evento.tipo,
      dataInicio: evento.dataInicio,
      dataFim: evento.dataFim,
      motivo: `${getTipo(evento.tipo).label} aprovada no módulo de RH`,
      observacoes: evento.observacoes || '',
      status: 'aprovado',
      origem: 'rh',
      rhEventoId: evento.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return ausencia?.id;
  };

  const atualizarStatusEvento = async (id, status) => {
    const evento = eventos.find((item) => item.id === id);
    if (!evento) return;

    try {
      const ausenciaId = await sincronizarEventoComDisponibilidade(evento, status);
      setEventos(eventos.map((item) => (
        item.id === id ? { ...item, status, ausenciaId: ausenciaId || item.ausenciaId, updatedAt: new Date().toISOString() } : item
      )));
    } catch (error) {
      console.error('Erro ao sincronizar evento RH:', error);
      setEventos(eventos.map((item) => (
        item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
      )));
    }
  };

  const registrarPonto = (tipo) => {
    if (!pontoProfissionalId) return;
    const profissional = profissionais.find((item) => item.id === pontoProfissionalId);
    const hoje = new Date().toISOString().split('T')[0];
    const agora = new Date().toISOString();
    const pontoDoDia = pontos.find((ponto) => ponto.profissionalId === pontoProfissionalId && ponto.data === hoje);

    if (!pontoDoDia) {
      if (tipo !== 'entrada') return;
      setPontos([{ id: crypto.randomUUID(), profissionalId: pontoProfissionalId, profissionalNome: profissional?.nome || 'Profissional', data: hoje, entrada: agora, intervaloSaida: '', intervaloRetorno: '', saida: '', createdAt: agora }, ...pontos]);
      return;
    }

    const campoPorTipo = {
      entrada: 'entrada',
      intervaloSaida: 'intervaloSaida',
      intervaloRetorno: 'intervaloRetorno',
      saida: 'saida',
    };
    const campo = campoPorTipo[tipo];
    if (!campo || pontoDoDia[campo]) return;

    setPontos(pontos.map((ponto) => (
      ponto.id === pontoDoDia.id ? { ...ponto, [campo]: agora, updatedAt: agora } : ponto
    )));
  };

  const exportarRelatorioPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório Integrado de RH', 14, 18);
    doc.setFontSize(10);
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 26);
    let y = 38;
    relatorioProfissionais.slice(0, 28).forEach((item) => {
      doc.text(`${item.nome} | ${item.status} | Atend.: ${item.atendimentos} | Fat.: ${formatarMoeda(item.faturamento)} | Com.: ${formatarMoeda(item.comissoes)} | Escalas: ${item.escalasAtivas}`, 14, y);
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 18;
      }
    });
    doc.save(`relatorio_rh_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getTipo = (tipo) => tiposEvento.find((item) => item.value === tipo) || tiposEvento[0];
  const getStatus = (status) => statusEvento.find((item) => item.value === status) || statusEvento[0];

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <ProfissionaisSectionNav subtitle="Painel de RH conectado a profissionais, disponibilidade, serviços e comissões." />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Recursos Humanos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gestão de colaboradores, escalas, folha, documentos e ocorrências.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenEventoDialog(true)}>
          Novo evento RH
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card><CardContent><GroupsIcon color="primary" /><Typography variant="h5">{profissionaisAtivos.length}</Typography><Typography color="textSecondary">Colaboradores ativos</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent><ScheduleIcon color="success" /><Typography variant="h5">{disponibilidadesAtivas.length}</Typography><Typography color="textSecondary">Escalas ativas</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent><PaymentsIcon color="success" /><Typography variant="h5">{formatarMoeda(folhaPrevista + comissoesPendentes)}</Typography><Typography color="textSecondary">Folha + comissões</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent><WarningIcon color="warning" /><Typography variant="h5">{eventosPendentes.length}</Typography><Typography color="textSecondary">Pendências RH</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(event, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab label="Colaboradores" icon={<BadgeIcon />} iconPosition="start" />
          <Tab label="Escalas e ponto" icon={<CalendarIcon />} iconPosition="start" />
          <Tab label="Folha e comissões" icon={<PaymentsIcon />} iconPosition="start" />
          <Tab label="Documentos e eventos" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Ponto eletrônico" icon={<ScheduleIcon />} iconPosition="start" />
          <Tab label="Relatórios" icon={<DescriptionIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead><TableRow><TableCell>Nome</TableCell><TableCell>Especialidade</TableCell><TableCell>Status</TableCell><TableCell>Valor/hora</TableCell><TableCell>Dias</TableCell><TableCell>Ações</TableCell></TableRow></TableHead>
            <TableBody>
              {profissionais.map((profissional) => (
                <TableRow key={profissional.id} hover>
                  <TableCell>{profissional.nome}</TableCell>
                  <TableCell>{profissional.especialidade}</TableCell>
                  <TableCell><Chip size="small" label={profissional.status || 'ativo'} color={profissional.status === 'inativo' ? 'error' : 'success'} /></TableCell>
                  <TableCell>{formatarMoeda(profissional.precoHora)}</TableCell>
                  <TableCell>{(profissional.diasTrabalho || []).join(', ') || '-'}</TableCell>
                  <TableCell><Button size="small" onClick={() => navigate('/profissionais')}>Abrir cadastro</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Alert severity="info" sx={{ mb: 2 }}>As escalas são sincronizadas com o cadastro de profissionais e usadas pela página Disponibilidade.</Alert>
            <TableContainer component={Paper}>
              <Table>
                <TableHead><TableRow><TableCell>Profissional</TableCell><TableCell>Dia</TableCell><TableCell>Horário</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                <TableBody>
                  {disponibilidades.map((item) => {
                    const profissional = profissionais.find((prof) => prof.id === item.profissionalId);
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>{profissional?.nome || item.profissionalId}</TableCell>
                        <TableCell>{['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][item.diaSemana]}</TableCell>
                        <TableCell>{item.horarioInicio} - {item.horarioFim}</TableCell>
                        <TableCell><Chip size="small" label={item.ativo === false ? 'Inativo' : 'Ativo'} color={item.ativo === false ? 'default' : 'success'} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card><CardContent><Typography variant="h6">Ações rápidas</Typography><Button fullWidth sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/disponibilidade')}>Abrir disponibilidade</Button><Button fullWidth sx={{ mt: 1 }} variant="outlined" onClick={() => navigate('/profissionais')}>Ajustar horários no cadastro</Button></CardContent></Card>
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><Card><CardContent><Typography color="textSecondary">Folha prevista por valor/hora</Typography><Typography variant="h5">{formatarMoeda(folhaPrevista)}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={4}><Card><CardContent><Typography color="textSecondary">Comissões pendentes</Typography><Typography variant="h5">{formatarMoeda(comissoesPendentes)}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={4}><Card><CardContent><Typography color="textSecondary">Atendimentos no período</Typography><Typography variant="h5">{atendimentos.length}</Typography></CardContent></Card></Grid>
          <Grid item xs={12}><Alert severity="success">Use este painel para conferência gerencial. Pagamentos continuam integrados ao financeiro/comissões.</Alert></Grid>
        </Grid>
      )}

      {tab === 3 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead><TableRow><TableCell>Tipo</TableCell><TableCell>Profissional</TableCell><TableCell>Período</TableCell><TableCell>Dias</TableCell><TableCell>Status</TableCell><TableCell>Observações</TableCell><TableCell>Ações</TableCell></TableRow></TableHead>
            <TableBody>
              {eventos.map((evento) => (
                <TableRow key={evento.id} hover>
                  <TableCell><Chip size="small" label={getTipo(evento.tipo).label} color={getTipo(evento.tipo).color} /></TableCell>
                  <TableCell>{evento.profissionalNome}</TableCell>
                  <TableCell>{evento.dataInicio} até {evento.dataFim}</TableCell>
                  <TableCell>{evento.dias}</TableCell>
                  <TableCell><Chip size="small" label={getStatus(evento.status).label} color={getStatus(evento.status).color} /></TableCell>
                  <TableCell>{evento.observacoes || '-'}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => atualizarStatusEvento(evento.id, 'aprovado')}>Aprovar</Button>
                    <Button size="small" onClick={() => atualizarStatusEvento(evento.id, 'concluido')}>Concluir</Button>
                  </TableCell>
                </TableRow>
              ))}
              {eventos.length === 0 && <TableRow><TableCell colSpan={7}><Alert severity="info">Nenhum evento RH cadastrado.</Alert></TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}


      {tab === 4 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Ponto eletrônico</Typography>
                <TextField select fullWidth label="Profissional" value={pontoProfissionalId} onChange={(e) => setPontoProfissionalId(e.target.value)} sx={{ mb: 2 }}>
                  {profissionaisAtivos.map((profissional) => <MenuItem key={profissional.id} value={profissional.id}>{profissional.nome}</MenuItem>)}
                </TextField>
                <Grid container spacing={1}>
                  <Grid item xs={6}><Button fullWidth variant="contained" onClick={() => registrarPonto('entrada')}>1ª Entrada</Button></Grid>
                  <Grid item xs={6}><Button fullWidth variant="outlined" onClick={() => registrarPonto('intervaloSaida')}>2ª Saída intervalo</Button></Grid>
                  <Grid item xs={6}><Button fullWidth variant="outlined" onClick={() => registrarPonto('intervaloRetorno')}>3ª Retorno</Button></Grid>
                  <Grid item xs={6}><Button fullWidth variant="contained" onClick={() => registrarPonto('saida')}>4ª Saída</Button></Grid>
                </Grid>
                <Alert severity="info" sx={{ mt: 2 }}>O ponto eletrônico agora usa quatro marcações: entrada, saída para intervalo, retorno e saída final.</Alert>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead><TableRow><TableCell>Profissional</TableCell><TableCell>Data</TableCell><TableCell>Entrada</TableCell><TableCell>Saída intervalo</TableCell><TableCell>Retorno</TableCell><TableCell>Saída final</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                <TableBody>
                  {pontos.map((ponto) => (
                    <TableRow key={ponto.id} hover>
                      <TableCell>{ponto.profissionalNome}</TableCell>
                      <TableCell>{ponto.data}</TableCell>
                      <TableCell>{ponto.entrada ? new Date(ponto.entrada).toLocaleTimeString('pt-BR') : '-'}</TableCell>
                      <TableCell>{ponto.intervaloSaida ? new Date(ponto.intervaloSaida).toLocaleTimeString('pt-BR') : '-'}</TableCell>
                      <TableCell>{ponto.intervaloRetorno ? new Date(ponto.intervaloRetorno).toLocaleTimeString('pt-BR') : '-'}</TableCell>
                      <TableCell>{ponto.saida ? new Date(ponto.saida).toLocaleTimeString('pt-BR') : '-'}</TableCell>
                      <TableCell><Chip size="small" label={ponto.saida ? 'Fechado' : 'Aberto'} color={ponto.saida ? 'success' : 'warning'} /></TableCell>
                    </TableRow>
                  ))}
                  {pontos.length === 0 && <TableRow><TableCell colSpan={7}><Alert severity="info">Nenhum ponto registrado.</Alert></TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}


      {tab === 5 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Relatório integrado de profissionais</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}><Button variant="outlined" onClick={exportarRelatorioRh}>Exportar CSV</Button><Button variant="contained" onClick={exportarRelatorioPdf}>Exportar PDF</Button></Box>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow><TableCell>Profissional</TableCell><TableCell>Status</TableCell><TableCell>Especialidades</TableCell><TableCell>Atendimentos</TableCell><TableCell>Faturamento</TableCell><TableCell>Comissões</TableCell><TableCell>Escalas</TableCell><TableCell>Pendências</TableCell></TableRow></TableHead>
              <TableBody>
                {relatorioProfissionais.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell><Chip size="small" label={item.status} color={item.status === 'inativo' ? 'error' : 'success'} /></TableCell>
                    <TableCell>{item.especialidades || '-'}</TableCell>
                    <TableCell>{item.atendimentos}</TableCell>
                    <TableCell>{formatarMoeda(item.faturamento)}</TableCell>
                    <TableCell>{formatarMoeda(item.comissoes)}</TableCell>
                    <TableCell>{item.escalasAtivas}</TableCell>
                    <TableCell>{item.eventosAbertos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={openEventoDialog} onClose={() => setOpenEventoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo evento RH</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField select fullWidth label="Profissional" value={eventoForm.profissionalId} onChange={(e) => setEventoForm({ ...eventoForm, profissionalId: e.target.value })}>
                {profissionais.map((profissional) => <MenuItem key={profissional.id} value={profissional.id}>{profissional.nome}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}><TextField select fullWidth label="Tipo" value={eventoForm.tipo} onChange={(e) => setEventoForm({ ...eventoForm, tipo: e.target.value })}>{tiposEvento.map((tipo) => <MenuItem key={tipo.value} value={tipo.value}>{tipo.label}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><TextField select fullWidth label="Status" value={eventoForm.status} onChange={(e) => setEventoForm({ ...eventoForm, status: e.target.value })}>{statusEvento.map((status) => <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Início" value={eventoForm.dataInicio} onChange={(e) => setEventoForm({ ...eventoForm, dataInicio: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Fim" value={eventoForm.dataFim} onChange={(e) => setEventoForm({ ...eventoForm, dataFim: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Observações" value={eventoForm.observacoes} onChange={(e) => setEventoForm({ ...eventoForm, observacoes: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarEvento}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RecursosHumanos;
