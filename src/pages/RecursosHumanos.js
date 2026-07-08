// src/pages/RecursosHumanos.js
// VERSÃO COMPLETA - GESTÃO DE RH COM SUPABASE (FIREBASESERVICE)

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
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Snackbar,
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
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  EventNote as EventNoteIcon,
  FilePresent as FilePresentIcon,
  MedicalServices as MedicalIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Today as TodayIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import ProfissionaisSectionNav from '../components/ProfissionaisSectionNav';

// ============================================
// CONSTANTES
// ============================================

const RH_EVENTOS_KEY = 'rh.eventos';

const tiposEvento = [
  { value: 'ferias', label: 'Férias', color: 'info' },
  { value: 'folga', label: 'Folga', color: 'success' },
  { value: 'licenca', label: 'Licença', color: 'warning' },
  { value: 'treinamento', label: 'Treinamento', color: 'secondary' },
  { value: 'documento', label: 'Documento', color: 'primary' },
  { value: 'advertencia', label: 'Advertência', color: 'error' },
  { value: 'atestado', label: 'Atestado', color: 'error' },
  { value: 'avaliacao', label: 'Avaliação', color: 'info' },
];

const statusEvento = [
  { value: 'pendente', label: 'Pendente', color: 'warning' },
  { value: 'aprovado', label: 'Aprovado', color: 'success' },
  { value: 'rejeitado', label: 'Rejeitado', color: 'error' },
  { value: 'concluido', label: 'Concluído', color: 'info' },
];

const cargos = [
  'Administrador',
  'Gerente',
  'Coordenador',
  'Supervisor',
  'Recepcionista',
  'Atendente',
  'Profissional',
  'Auxiliar',
  'Estagiário',
  'Jovem Aprendiz',
];

const tiposDocumento = [
  'RG',
  'CPF',
  'CTPS',
  'PIS',
  'Título de Eleitor',
  'Reservista',
  'Carteira de Motorista',
  'Certificado de Conclusão',
  'Diploma',
  'Comprovante de Residência',
  'Atestado de Saúde',
  'Exame Admissional',
  'Exame Periódico',
  'Outros',
];

const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(Number(valor) || 0);

const formatarData = (data) => {
  if (!data) return '-';
  try {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return data;
  }
};

const calcularDias = (inicio, fim) => {
  if (!inicio || !fim) return 0;
  const dataInicio = new Date(`${inicio}T00:00:00`);
  const dataFim = new Date(`${fim}T00:00:00`);
  if (Number.isNaN(dataInicio.getTime()) || Number.isNaN(dataFim.getTime())) return 0;
  return Math.max(1, Math.round((dataFim - dataInicio) / 86400000) + 1);
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function RecursosHumanos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dados principais (já existentes)
  const [profissionais, setProfissionais] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [eventos, setEventos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RH_EVENTOS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // NOVOS ESTADOS RH (Supabase)
  const [funcionarios, setFuncionarios] = useState([]);
  const [pontos, setPontos] = useState([]);
  const [ferias, setFerias] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  // Diálogos
  const [openEventoDialog, setOpenEventoDialog] = useState(false);
  const [openFuncionarioDialog, setOpenFuncionarioDialog] = useState(false);
  const [openPontoDialog, setOpenPontoDialog] = useState(false);
  const [openFeriasDialog, setOpenFeriasDialog] = useState(false);
  const [openDocumentoDialog, setOpenDocumentoDialog] = useState(false);
  const [openAvaliacaoDialog, setOpenAvaliacaoDialog] = useState(false);

  // Formulários
  const [eventoForm, setEventoForm] = useState({
    profissionalId: '',
    tipo: 'ferias',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    status: 'pendente',
    observacoes: '',
  });

  const [funcionarioForm, setFuncionarioForm] = useState({
    nome: '',
    cargo: '',
    email: '',
    telefone: '',
    dataAdmissao: new Date().toISOString().split('T')[0],
    salarioBase: '',
    valeTransporte: false,
    valeRefeicao: false,
    planoSaude: false,
    status: 'ativo',
    observacoes: '',
  });

  const [pontoForm, setPontoForm] = useState({
    funcionarioId: '',
    data: new Date().toISOString().split('T')[0],
    entrada1: '',
    saida1: '',
    entrada2: '',
    saida2: '',
    observacoes: '',
  });

  const [feriasForm, setFeriasForm] = useState({
    funcionarioId: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    dias: 30,
    status: 'pendente',
    observacoes: '',
  });

  const [documentoForm, setDocumentoForm] = useState({
    funcionarioId: '',
    tipo: 'RG',
    numero: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    dataValidade: '',
    arquivoUrl: '',
    observacoes: '',
  });

  const [avaliacaoForm, setAvaliacaoForm] = useState({
    funcionarioId: '',
    data: new Date().toISOString().split('T')[0],
    competencias: '',
    pontosFortes: '',
    pontosMelhoria: '',
    nota: 5,
    proximaAvaliacao: '',
    observacoes: '',
  });

  // ==========================================
  // CARREGAR DADOS
  // ==========================================
  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    localStorage.setItem(RH_EVENTOS_KEY, JSON.stringify(eventos));
  }, [eventos]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [
        profissionaisData,
        disponibilidadesData,
        atendimentosData,
        comissoesData,
        funcionariosData,
        pontosData,
        feriasData,
        documentosData,
        avaliacoesData,
      ] = await Promise.all([
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('disponibilidades').catch(() => []),
        firebaseService.getAll('atendimentos').catch(() => []),
        firebaseService.getAll('comissoes').catch(() => []),
        firebaseService.getAll('rh_funcionarios').catch(() => []),
        firebaseService.getAll('rh_pontos').catch(() => []),
        firebaseService.getAll('rh_ferias').catch(() => []),
        firebaseService.getAll('rh_documentos').catch(() => []),
        firebaseService.getAll('rh_avaliacoes').catch(() => []),
      ]);
      setProfissionais(profissionaisData || []);
      setDisponibilidades(disponibilidadesData || []);
      setAtendimentos(atendimentosData || []);
      setComissoes(comissoesData || []);
      setFuncionarios(funcionariosData || []);
      setPontos(pontosData || []);
      setFerias(feriasData || []);
      setDocumentos(documentosData || []);
      setAvaliacoes(avaliacoesData || []);
    } catch (error) {
      console.error('Erro ao carregar RH:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ==========================================
  // FUNÇÕES CRUD - FUNCIONÁRIOS
  // ==========================================
  const salvarFuncionario = async () => {
    if (!funcionarioForm.nome || !funcionarioForm.cargo || !funcionarioForm.email) {
      mostrarSnackbar('Preencha nome, cargo e email', 'error');
      return;
    }
    try {
      const dados = { ...funcionarioForm, updatedAt: new Date().toISOString() };
      if (editandoId) {
        await firebaseService.update('rh_funcionarios', editandoId, dados);
        mostrarSnackbar('Funcionário atualizado!');
      } else {
        dados.createdAt = new Date().toISOString();
        await firebaseService.add('rh_funcionarios', dados);
        mostrarSnackbar('Funcionário cadastrado!');
      }
      setOpenFuncionarioDialog(false);
      setEditandoId(null);
      resetFuncionarioForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      mostrarSnackbar('Erro ao salvar funcionário', 'error');
    }
  };

  const editarFuncionario = (funcionario) => {
    setEditandoId(funcionario.id);
    setFuncionarioForm({
      nome: funcionario.nome || '',
      cargo: funcionario.cargo || '',
      email: funcionario.email || '',
      telefone: funcionario.telefone || '',
      dataAdmissao: funcionario.dataAdmissao || new Date().toISOString().split('T')[0],
      salarioBase: funcionario.salarioBase || '',
      valeTransporte: funcionario.valeTransporte || false,
      valeRefeicao: funcionario.valeRefeicao || false,
      planoSaude: funcionario.planoSaude || false,
      status: funcionario.status || 'ativo',
      observacoes: funcionario.observacoes || '',
    });
    setOpenFuncionarioDialog(true);
  };

  const excluirFuncionario = async (id) => {
    if (window.confirm('Deseja realmente excluir este funcionário?')) {
      try {
        await firebaseService.delete('rh_funcionarios', id);
        mostrarSnackbar('Funcionário excluído!');
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        mostrarSnackbar('Erro ao excluir', 'error');
      }
    }
  };

  const resetFuncionarioForm = () => {
    setFuncionarioForm({
      nome: '',
      cargo: '',
      email: '',
      telefone: '',
      dataAdmissao: new Date().toISOString().split('T')[0],
      salarioBase: '',
      valeTransporte: false,
      valeRefeicao: false,
      planoSaude: false,
      status: 'ativo',
      observacoes: '',
    });
    setEditandoId(null);
  };

  // ==========================================
  // FUNÇÕES CRUD - PONTO
  // ==========================================
  const salvarPonto = async () => {
    if (!pontoForm.funcionarioId || !pontoForm.data) {
      mostrarSnackbar('Selecione funcionário e data', 'error');
      return;
    }
    try {
      const funcionario = funcionarios.find(f => f.id === pontoForm.funcionarioId);
      const dados = {
        ...pontoForm,
        funcionarioNome: funcionario?.nome || '',
        createdAt: new Date().toISOString(),
      };
      await firebaseService.add('rh_pontos', dados);
      mostrarSnackbar('Ponto registrado!');
      setOpenPontoDialog(false);
      resetPontoForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      mostrarSnackbar('Erro ao registrar ponto', 'error');
    }
  };

  const resetPontoForm = () => {
    setPontoForm({
      funcionarioId: '',
      data: new Date().toISOString().split('T')[0],
      entrada1: '',
      saida1: '',
      entrada2: '',
      saida2: '',
      observacoes: '',
    });
  };

  // ==========================================
  // FUNÇÕES CRUD - FÉRIAS
  // ==========================================
  const salvarFerias = async () => {
    if (!feriasForm.funcionarioId || !feriasForm.dataInicio || !feriasForm.dataFim) {
      mostrarSnackbar('Preencha todos os campos', 'error');
      return;
    }
    try {
      const funcionario = funcionarios.find(f => f.id === feriasForm.funcionarioId);
      const dias = calcularDias(feriasForm.dataInicio, feriasForm.dataFim);
      const dados = {
        ...feriasForm,
        dias,
        funcionarioNome: funcionario?.nome || '',
        createdAt: new Date().toISOString(),
      };
      await firebaseService.add('rh_ferias', dados);
      mostrarSnackbar('Solicitação de férias registrada!');
      setOpenFeriasDialog(false);
      resetFeriasForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar férias:', error);
      mostrarSnackbar('Erro ao salvar férias', 'error');
    }
  };

  const resetFeriasForm = () => {
    setFeriasForm({
      funcionarioId: '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: new Date().toISOString().split('T')[0],
      dias: 30,
      status: 'pendente',
      observacoes: '',
    });
  };

  const atualizarStatusFerias = async (id, status) => {
    try {
      await firebaseService.update('rh_ferias', id, { status, updatedAt: new Date().toISOString() });
      mostrarSnackbar(`Status atualizado para ${status}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      mostrarSnackbar('Erro ao atualizar status', 'error');
    }
  };

  // ==========================================
  // FUNÇÕES CRUD - DOCUMENTOS
  // ==========================================
  const salvarDocumento = async () => {
    if (!documentoForm.funcionarioId || !documentoForm.tipo || !documentoForm.numero) {
      mostrarSnackbar('Preencha todos os campos', 'error');
      return;
    }
    try {
      const funcionario = funcionarios.find(f => f.id === documentoForm.funcionarioId);
      const dados = {
        ...documentoForm,
        funcionarioNome: funcionario?.nome || '',
        createdAt: new Date().toISOString(),
      };
      await firebaseService.add('rh_documentos', dados);
      mostrarSnackbar('Documento cadastrado!');
      setOpenDocumentoDialog(false);
      resetDocumentoForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      mostrarSnackbar('Erro ao salvar documento', 'error');
    }
  };

  const resetDocumentoForm = () => {
    setDocumentoForm({
      funcionarioId: '',
      tipo: 'RG',
      numero: '',
      dataEmissao: new Date().toISOString().split('T')[0],
      dataValidade: '',
      arquivoUrl: '',
      observacoes: '',
    });
  };

  // ==========================================
  // FUNÇÕES CRUD - AVALIAÇÕES
  // ==========================================
  const salvarAvaliacao = async () => {
    if (!avaliacaoForm.funcionarioId || !avaliacaoForm.data) {
      mostrarSnackbar('Selecione funcionário e data', 'error');
      return;
    }
    try {
      const funcionario = funcionarios.find(f => f.id === avaliacaoForm.funcionarioId);
      const dados = {
        ...avaliacaoForm,
        funcionarioNome: funcionario?.nome || '',
        nota: Number(avaliacaoForm.nota) || 5,
        createdAt: new Date().toISOString(),
      };
      await firebaseService.add('rh_avaliacoes', dados);
      mostrarSnackbar('Avaliação registrada!');
      setOpenAvaliacaoDialog(false);
      resetAvaliacaoForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      mostrarSnackbar('Erro ao salvar avaliação', 'error');
    }
  };

  const resetAvaliacaoForm = () => {
    setAvaliacaoForm({
      funcionarioId: '',
      data: new Date().toISOString().split('T')[0],
      competencias: '',
      pontosFortes: '',
      pontosMelhoria: '',
      nota: 5,
      proximaAvaliacao: '',
      observacoes: '',
    });
  };

  // ==========================================
  // FUNÇÕES CRUD - EVENTOS (locais)
  // ==========================================
  const salvarEvento = () => {
    if (!eventoForm.profissionalId || !eventoForm.dataInicio || !eventoForm.dataFim) {
      mostrarSnackbar('Preencha todos os campos', 'error');
      return;
    }
    const profissional = profissionais.find(p => p.id === eventoForm.profissionalId);
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
    mostrarSnackbar('Evento RH cadastrado!');
  };

  const atualizarStatusEvento = (id, status) => {
    setEventos(eventos.map(e => (
      e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e
    )));
    mostrarSnackbar('Status atualizado!');
  };

  // ==========================================
  // MÉTRICAS E INDICADORES
  // ==========================================
  const profissionaisAtivos = profissionais.filter(p => p.status !== 'inativo' && p.ativo !== false);
  const funcionariosAtivos = funcionarios.filter(f => f.status === 'ativo');
  const disponibilidadesAtivas = disponibilidades.filter(d => d.ativo !== false);
  const eventosPendentes = eventos.filter(e => e.status === 'pendente');
  const feriasPendentes = ferias.filter(f => f.status === 'pendente');
  const avaliacoesRecentes = avaliacoes.slice(0, 5);

  const folhaPrevista = useMemo(() => {
    let total = 0;
    funcionariosAtivos.forEach(func => {
      const salario = Number(func.salarioBase) || 0;
      total += salario;
    });
    profissionaisAtivos.forEach(prof => {
      const valorHora = Number(prof.precoHora) || 0;
      const diasAtivos = disponibilidadesAtivas.filter(d => d.profissionalId === prof.id).length || (prof.diasTrabalho || []).length;
      total += (valorHora * 8 * diasAtivos * 4);
    });
    return total;
  }, [funcionariosAtivos, profissionaisAtivos, disponibilidadesAtivas]);

  const comissoesPendentes = comissoes
    .filter(c => ['pendente', 'a_pagar'].includes(c.status || 'pendente'))
    .reduce((total, c) => total + (Number(c.valor) || Number(c.valorComissao) || 0), 0);

  const totalFuncionarios = funcionariosAtivos.length + profissionaisAtivos.length;

  const getTipo = (tipo) => tiposEvento.find(t => t.value === tipo) || tiposEvento[0];
  const getStatus = (status) => statusEvento.find(s => s.value === status) || statusEvento[0];

  // ==========================================
  // RENDER
  // ==========================================
  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <ProfissionaisSectionNav subtitle="Painel completo de RH com gestão de funcionários, ponto, férias, documentos e avaliações." />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Recursos Humanos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gestão completa de colaboradores, frequência, folha, documentos e desempenho.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => { resetFuncionarioForm(); setOpenFuncionarioDialog(true); }}>Novo Funcionário</Button>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpenEventoDialog(true)}>Evento RH</Button>
        </Box>
      </Box>

      {/* Cards de métricas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><GroupsIcon color="primary" /><Typography variant="h5">{totalFuncionarios}</Typography><Typography color="textSecondary">Total de colaboradores</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><ScheduleIcon color="success" /><Typography variant="h5">{disponibilidadesAtivas.length}</Typography><Typography color="textSecondary">Escalas ativas</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><PaymentsIcon color="success" /><Typography variant="h5">{formatarMoeda(folhaPrevista + comissoesPendentes)}</Typography><Typography color="textSecondary">Folha + comissões (estimado)</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><WarningIcon color="warning" /><Typography variant="h5">{eventosPendentes.length + feriasPendentes.length}</Typography><Typography color="textSecondary">Pendências RH</Typography></CardContent></Card>
        </Grid>
      </Grid>

      {/* Abas */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Colaboradores" icon={<BadgeIcon />} iconPosition="start" />
          <Tab label="Ponto Eletrônico" icon={<AccessTimeIcon />} iconPosition="start" />
          <Tab label="Férias" icon={<CalendarIcon />} iconPosition="start" />
          <Tab label="Documentos" icon={<FilePresentIcon />} iconPosition="start" />
          <Tab label="Avaliações" icon={<StarIcon />} iconPosition="start" />
          <Tab label="Eventos RH" icon={<EventNoteIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Aba 0 - Colaboradores */}
      {tab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Cargo</TableCell>
                <TableCell>Admissão</TableCell>
                <TableCell>Salário Base</TableCell>
                <TableCell>Benefícios</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {funcionarios.map((func) => (
                <TableRow key={func.id} hover>
                  <TableCell>{func.nome}</TableCell>
                  <TableCell>{func.cargo}</TableCell>
                  <TableCell>{formatarData(func.dataAdmissao)}</TableCell>
                  <TableCell>{formatarMoeda(func.salarioBase)}</TableCell>
                  <TableCell>
                    {func.valeTransporte && <Chip size="small" label="VT" />}
                    {func.valeRefeicao && <Chip size="small" label="VR" />}
                    {func.planoSaude && <Chip size="small" label="Saúde" />}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={func.status} color={func.status === 'ativo' ? 'success' : 'error'} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => editarFuncionario(func)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => excluirFuncionario(func.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {funcionarios.length === 0 && (
                <TableRow><TableCell colSpan={7}><Alert severity="info">Nenhum funcionário cadastrado. Clique em "Novo Funcionário".</Alert></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Aba 1 - Ponto Eletrônico */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenPontoDialog(true)}>Registrar Ponto</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Funcionário</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Entrada 1</TableCell>
                  <TableCell>Saída 1</TableCell>
                  <TableCell>Entrada 2</TableCell>
                  <TableCell>Saída 2</TableCell>
                  <TableCell>Obs.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pontos.map((ponto) => (
                  <TableRow key={ponto.id} hover>
                    <TableCell>{ponto.funcionarioNome || '—'}</TableCell>
                    <TableCell>{formatarData(ponto.data)}</TableCell>
                    <TableCell>{ponto.entrada1 || '—'}</TableCell>
                    <TableCell>{ponto.saida1 || '—'}</TableCell>
                    <TableCell>{ponto.entrada2 || '—'}</TableCell>
                    <TableCell>{ponto.saida2 || '—'}</TableCell>
                    <TableCell>{ponto.observacoes || '—'}</TableCell>
                  </TableRow>
                ))}
                {pontos.length === 0 && <TableRow><TableCell colSpan={7}><Alert severity="info">Nenhum registro de ponto.</Alert></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Aba 2 - Férias */}
      {tab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenFeriasDialog(true)}>Solicitar Férias</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Funcionário</TableCell>
                  <TableCell>Período</TableCell>
                  <TableCell>Dias</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Obs.</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ferias.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell>{f.funcionarioNome || '—'}</TableCell>
                    <TableCell>{formatarData(f.dataInicio)} - {formatarData(f.dataFim)}</TableCell>
                    <TableCell>{f.dias}</TableCell>
                    <TableCell>
                      <Chip size="small" label={f.status} color={f.status === 'aprovado' ? 'success' : f.status === 'pendente' ? 'warning' : 'error'} />
                    </TableCell>
                    <TableCell>{f.observacoes || '—'}</TableCell>
                    <TableCell>
                      {f.status === 'pendente' && (
                        <>
                          <Button size="small" onClick={() => atualizarStatusFerias(f.id, 'aprovado')}>Aprovar</Button>
                          <Button size="small" onClick={() => atualizarStatusFerias(f.id, 'rejeitado')}>Rejeitar</Button>
                        </>
                      )}
                      {f.status === 'aprovado' && (
                        <Button size="small" onClick={() => atualizarStatusFerias(f.id, 'concluido')}>Concluir</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {ferias.length === 0 && <TableRow><TableCell colSpan={6}><Alert severity="info">Nenhuma solicitação de férias.</Alert></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Aba 3 - Documentos */}
      {tab === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDocumentoDialog(true)}>Adicionar Documento</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Funcionário</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Emissão</TableCell>
                  <TableCell>Validade</TableCell>
                  <TableCell>Obs.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentos.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>{doc.funcionarioNome || '—'}</TableCell>
                    <TableCell><Chip size="small" label={doc.tipo} /></TableCell>
                    <TableCell>{doc.numero}</TableCell>
                    <TableCell>{formatarData(doc.dataEmissao)}</TableCell>
                    <TableCell>{formatarData(doc.dataValidade)}</TableCell>
                    <TableCell>{doc.observacoes || '—'}</TableCell>
                  </TableRow>
                ))}
                {documentos.length === 0 && <TableRow><TableCell colSpan={6}><Alert severity="info">Nenhum documento cadastrado.</Alert></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Aba 4 - Avaliações */}
      {tab === 4 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAvaliacaoDialog(true)}>Nova Avaliação</Button>
          </Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Últimas avaliações</Typography>
                  <List>
                    {avaliacoesRecentes.map((av) => (
                      <ListItem key={av.id} divider>
                        <ListItemAvatar><Avatar sx={{ bgcolor: av.nota >= 7 ? '#4caf50' : av.nota >= 5 ? '#ff9800' : '#f44336' }}>
                          {av.nota}
                        </Avatar></ListItemAvatar>
                        <ListItemText primary={av.funcionarioNome || '—'} secondary={`${formatarData(av.data)} - ${av.competencias || 'Sem competências'}`} />
                      </ListItem>
                    ))}
                    {avaliacoesRecentes.length === 0 && <Typography color="textSecondary">Nenhuma avaliação.</Typography>}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Funcionário</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Competências</TableCell>
                  <TableCell>Pontos Fortes</TableCell>
                  <TableCell>Nota</TableCell>
                  <TableCell>Próx. Avaliação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {avaliacoes.map((av) => (
                  <TableRow key={av.id} hover>
                    <TableCell>{av.funcionarioNome || '—'}</TableCell>
                    <TableCell>{formatarData(av.data)}</TableCell>
                    <TableCell>{av.competencias || '—'}</TableCell>
                    <TableCell>{av.pontosFortes || '—'}</TableCell>
                    <TableCell><Chip size="small" label={av.nota || 0} color={av.nota >= 7 ? 'success' : av.nota >= 5 ? 'warning' : 'error'} /></TableCell>
                    <TableCell>{formatarData(av.proximaAvaliacao)}</TableCell>
                  </TableRow>
                ))}
                {avaliacoes.length === 0 && <TableRow><TableCell colSpan={6}><Alert severity="info">Nenhuma avaliação registrada.</Alert></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Aba 5 - Eventos RH */}
      {tab === 5 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Profissional</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Dias</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Observações</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventos.map((evento) => (
                <TableRow key={evento.id} hover>
                  <TableCell><Chip size="small" label={getTipo(evento.tipo).label} color={getTipo(evento.tipo).color} /></TableCell>
                  <TableCell>{evento.profissionalNome}</TableCell>
                  <TableCell>{formatarData(evento.dataInicio)} - {formatarData(evento.dataFim)}</TableCell>
                  <TableCell>{evento.dias}</TableCell>
                  <TableCell><Chip size="small" label={getStatus(evento.status).label} color={getStatus(evento.status).color} /></TableCell>
                  <TableCell>{evento.observacoes || '-'}</TableCell>
                  <TableCell>
                    {evento.status === 'pendente' && (
                      <>
                        <Button size="small" onClick={() => atualizarStatusEvento(evento.id, 'aprovado')}>Aprovar</Button>
                        <Button size="small" onClick={() => atualizarStatusEvento(evento.id, 'rejeitado')}>Rejeitar</Button>
                      </>
                    )}
                    {evento.status === 'aprovado' && (
                      <Button size="small" onClick={() => atualizarStatusEvento(evento.id, 'concluido')}>Concluir</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {eventos.length === 0 && <TableRow><TableCell colSpan={7}><Alert severity="info">Nenhum evento RH cadastrado.</Alert></TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ========================================== */}
      {/* DIÁLOGOS */}
      {/* ========================================== */}

      {/* Dialog Funcionário */}
      <Dialog open={openFuncionarioDialog} onClose={() => { setOpenFuncionarioDialog(false); resetFuncionarioForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editandoId ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField fullWidth label="Nome" value={funcionarioForm.nome} onChange={(e) => setFuncionarioForm({ ...funcionarioForm, nome: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cargo</InputLabel>
                <Select value={funcionarioForm.cargo} label="Cargo" onChange={(e) => setFuncionarioForm({ ...funcionarioForm, cargo: e.target.value })}>
                  {cargos.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" type="email" value={funcionarioForm.email} onChange={(e) => setFuncionarioForm({ ...funcionarioForm, email: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Telefone" value={funcionarioForm.telefone} onChange={(e) => setFuncionarioForm({ ...funcionarioForm, telefone: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Data Admissão" value={funcionarioForm.dataAdmissao} onChange={(e) => setFuncionarioForm({ ...funcionarioForm, dataAdmissao: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Salário Base" value={funcionarioForm.salarioBase} onChange={(e) => setFuncionarioForm({ ...funcionarioForm, salarioBase: e.target.value })} placeholder="0,00" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={funcionarioForm.status} label="Status" onChange={(e) => setFuncionarioForm({ ...funcionarioForm, status: e.target.value })}>
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                  <MenuItem value="ferias">Férias</MenuItem>
                  <MenuItem value="licenca">Licença</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={funcionarioForm.valeTransporte} onChange={(e) => setFuncionarioForm({ ...funcionarioForm, valeTransporte: e.target.checked })} />} label="Vale Transporte" />
              <FormControlLabel control={<Switch checked={funcionarioForm.valeRefeicao} onChange={(e) => setFuncionarioForm({ ...funcionarioForm, valeRefeicao: e.target.checked })} />} label="Vale Refeição" />
              <FormControlLabel control={<Switch checked={funcionarioForm.planoSaude} onChange={(e) => setFuncionarioForm({ ...funcionarioForm, planoSaude: e.target.checked })} />} label="Plano de Saúde" />
            </Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Observações" value={funcionarioForm.observacoes} onChange={(e) => setFuncionarioForm({ ...funcionarioForm, observacoes: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenFuncionarioDialog(false); resetFuncionarioForm(); }}>Cancelar</Button>
          <Button variant="contained" onClick={salvarFuncionario}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Ponto */}
      <Dialog open={openPontoDialog} onClose={() => { setOpenPontoDialog(false); resetPontoForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Ponto</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Funcionário</InputLabel>
                <Select value={pontoForm.funcionarioId} label="Funcionário" onChange={(e) => setPontoForm({ ...pontoForm, funcionarioId: e.target.value })}>
                  {funcionarios.map(f => <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="date" label="Data" value={pontoForm.data} onChange={(e) => setPontoForm({ ...pontoForm, data: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}><TextField fullWidth type="time" label="Entrada 1" value={pontoForm.entrada1} onChange={(e) => setPontoForm({ ...pontoForm, entrada1: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField fullWidth type="time" label="Saída 1" value={pontoForm.saida1} onChange={(e) => setPontoForm({ ...pontoForm, saida1: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField fullWidth type="time" label="Entrada 2" value={pontoForm.entrada2} onChange={(e) => setPontoForm({ ...pontoForm, entrada2: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField fullWidth type="time" label="Saída 2" value={pontoForm.saida2} onChange={(e) => setPontoForm({ ...pontoForm, saida2: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Observações" value={pontoForm.observacoes} onChange={(e) => setPontoForm({ ...pontoForm, observacoes: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenPontoDialog(false); resetPontoForm(); }}>Cancelar</Button>
          <Button variant="contained" onClick={salvarPonto}>Registrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Férias */}
      <Dialog open={openFeriasDialog} onClose={() => { setOpenFeriasDialog(false); resetFeriasForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>Solicitar Férias</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Funcionário</InputLabel>
                <Select value={feriasForm.funcionarioId} label="Funcionário" onChange={(e) => setFeriasForm({ ...feriasForm, funcionarioId: e.target.value })}>
                  {funcionarios.map(f => <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth type="date" label="Data Início" value={feriasForm.dataInicio} onChange={(e) => setFeriasForm({ ...feriasForm, dataInicio: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField fullWidth type="date" label="Data Fim" value={feriasForm.dataFim} onChange={(e) => setFeriasForm({ ...feriasForm, dataFim: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Dias (calculado automaticamente)" value={calcularDias(feriasForm.dataInicio, feriasForm.dataFim)} disabled /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={feriasForm.status} label="Status" onChange={(e) => setFeriasForm({ ...feriasForm, status: e.target.value })}>
                  {statusEvento.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Observações" value={feriasForm.observacoes} onChange={(e) => setFeriasForm({ ...feriasForm, observacoes: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenFeriasDialog(false); resetFeriasForm(); }}>Cancelar</Button>
          <Button variant="contained" onClick={salvarFerias}>Solicitar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Documento */}
      <Dialog open={openDocumentoDialog} onClose={() => { setOpenDocumentoDialog(false); resetDocumentoForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Documento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Funcionário</InputLabel>
                <Select value={documentoForm.funcionarioId} label="Funcionário" onChange={(e) => setDocumentoForm({ ...documentoForm, funcionarioId: e.target.value })}>
                  {funcionarios.map(f => <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select value={documentoForm.tipo} label="Tipo" onChange={(e) => setDocumentoForm({ ...documentoForm, tipo: e.target.value })}>
                  {tiposDocumento.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Número" value={documentoForm.numero} onChange={(e) => setDocumentoForm({ ...documentoForm, numero: e.target.value })} />
            </Grid>
            <Grid item xs={6}><TextField fullWidth type="date" label="Data Emissão" value={documentoForm.dataEmissao} onChange={(e) => setDocumentoForm({ ...documentoForm, dataEmissao: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField fullWidth type="date" label="Data Validade" value={documentoForm.dataValidade} onChange={(e) => setDocumentoForm({ ...documentoForm, dataValidade: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Observações" value={documentoForm.observacoes} onChange={(e) => setDocumentoForm({ ...documentoForm, observacoes: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDocumentoDialog(false); resetDocumentoForm(); }}>Cancelar</Button>
          <Button variant="contained" onClick={salvarDocumento}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Avaliação */}
      <Dialog open={openAvaliacaoDialog} onClose={() => { setOpenAvaliacaoDialog(false); resetAvaliacaoForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Avaliação de Desempenho</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Funcionário</InputLabel>
                <Select value={avaliacaoForm.funcionarioId} label="Funcionário" onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, funcionarioId: e.target.value })}>
                  {funcionarios.map(f => <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="date" label="Data da Avaliação" value={avaliacaoForm.data} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, data: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Competências Avaliadas" value={avaliacaoForm.competencias} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, competencias: e.target.value })} placeholder="Ex: Atendimento, Técnica, Pontualidade..." />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Pontos Fortes" value={avaliacaoForm.pontosFortes} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, pontosFortes: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Pontos a Melhorar" value={avaliacaoForm.pontosMelhoria} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, pontosMelhoria: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="number" label="Nota (0 a 10)" value={avaliacaoForm.nota} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, nota: Math.min(10, Math.max(0, Number(e.target.value))) })} inputProps={{ min: 0, max: 10, step: 0.5 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="date" label="Próxima Avaliação" value={avaliacaoForm.proximaAvaliacao} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, proximaAvaliacao: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Observações" value={avaliacaoForm.observacoes} onChange={(e) => setAvaliacaoForm({ ...avaliacaoForm, observacoes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAvaliacaoDialog(false); resetAvaliacaoForm(); }}>Cancelar</Button>
          <Button variant="contained" onClick={salvarAvaliacao}>Salvar Avaliação</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Evento RH */}
      <Dialog open={openEventoDialog} onClose={() => setOpenEventoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Evento RH</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField select fullWidth label="Profissional" value={eventoForm.profissionalId} onChange={(e) => setEventoForm({ ...eventoForm, profissionalId: e.target.value })}>
                {profissionais.map(p => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Tipo" value={eventoForm.tipo} onChange={(e) => setEventoForm({ ...eventoForm, tipo: e.target.value })}>
                {tiposEvento.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Status" value={eventoForm.status} onChange={(e) => setEventoForm({ ...eventoForm, status: e.target.value })}>
                {statusEvento.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField fullWidth type="date" label="Início" value={eventoForm.dataInicio} onChange={(e) => setEventoForm({ ...eventoForm, dataInicio: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField fullWidth type="date" label="Fim" value={eventoForm.dataFim} onChange={(e) => setEventoForm({ ...eventoForm, dataFim: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Observações" value={eventoForm.observacoes} onChange={(e) => setEventoForm({ ...eventoForm, observacoes: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarEvento}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RecursosHumanos;
