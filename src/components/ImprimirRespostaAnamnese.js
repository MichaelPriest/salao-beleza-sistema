// src/pages/Anamnese/RespostasAnamnese.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Switch,
  FormControlLabel,
  Autocomplete,
  Badge,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  Slider,
  Tab,
  Tabs,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
  Collapse,
  Breadcrumbs,
  Link,
  CardActions,
  CardHeader,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Zoom,
  Fade,
  Grow,
  Slide,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AssignmentLate as LateIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Archive as ArchiveIcon,
  Close as CloseIcon,
  EditNote as EditNoteIcon,
  Image as ImageIcon,
  FileCopy as FileCopyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import { firebaseService } from '../services/firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, subDays } from 'date-fns';
import ImprimirRespostaAnamnese from '../components/ImprimirRespostaAnamnese';

// ============================================
// FUNÇÕES PARA PROCESSAR ASSINATURA (CORRIGIDAS)
// ============================================

/**
 * Verifica se uma resposta é uma assinatura digital
 * Apenas considera como assinatura se:
 * - O tipo for explicitamente 'assinatura'
 * - A pergunta contém palavras-chave de assinatura
 * - O valor é uma imagem base64 longa (assinatura real)
 */
const isRespostaAssinatura = (respostaItem) => {
  if (!respostaItem) return false;
  
  // 1. Verificar pelo tipo da pergunta no formulário
  const tipo = respostaItem?.tipo;
  if (tipo === 'assinatura') return true;
  
  // 2. Verificar pelo nome da pergunta
  const pergunta = respostaItem?.pergunta?.toLowerCase() || '';
  const palavrasAssinatura = ['assinatura', 'assinado', 'rubrica', 'signature', 'assinatura digital', 'assinar'];
  
  if (palavrasAssinatura.some(palavra => pergunta.includes(palavra))) {
    return true;
  }
  
  // 3. Verificar se o valor é uma imagem base64 (apenas para perguntas que parecem ser assinatura)
  const valor = respostaItem?.resposta;
  if (typeof valor === 'string' && pergunta.includes('assinatura')) {
    // Assinaturas são strings base64 longas (> 500 caracteres)
    const isLongBase64 = valor.length > 500 && (
      valor.startsWith('data:image') || 
      valor.startsWith('iVBOR') || 
      valor.startsWith('/9j/')
    );
    if (isLongBase64) return true;
  }
  
  return false;
};

/**
 * Processa o valor da assinatura para exibição como imagem
 */
const processarAssinatura = (valor) => {
  if (!valor) return null;
  
  // Se já for uma data URL completa
  if (typeof valor === 'string' && valor.startsWith('data:image')) {
    return valor;
  }
  
  // Se for base64 puro de PNG (começa com iVBOR)
  if (typeof valor === 'string' && valor.startsWith('iVBOR')) {
    return `data:image/png;base64,${valor}`;
  }
  
  // Se for base64 puro de JPEG (começa com /9j/)
  if (typeof valor === 'string' && valor.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${valor}`;
  }
  
  // Se contiver base64 no meio (ex: "data:image/png;base64,iVBOR...")
  if (typeof valor === 'string' && valor.includes('base64,')) {
    const parts = valor.split('base64,');
    if (parts[1] && parts[1].length > 100) {
      // Determinar o tipo pela string
      const tipoImagem = parts[1].startsWith('iVBOR') ? 'png' : 
                         parts[1].startsWith('/9j/') ? 'jpeg' : 'png';
      return `data:image/${tipoImagem};base64,${parts[1]}`;
    }
  }
  
  return null;
};

// ============================================
// COMPONENTE DE ASSINATURA
// ============================================
const AssinaturaViewer = ({ dataUrl, label = "Assinatura Digital" }) => {
  const [modalAberta, setModalAberta] = useState(false);
  const [erroImagem, setErroImagem] = useState(false);

  if (!dataUrl || erroImagem) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <EditNoteIcon sx={{ fontSize: 40, color: '#999', mb: 1 }} />
        <Typography variant="caption" color="textSecondary">
          Assinatura não disponível
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          mt: 1,
          p: 2,
          bgcolor: '#faf5ff',
          borderRadius: 2,
          border: '1px dashed #9c27b0',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: '#f3e5f5',
            transform: 'scale(1.02)',
          },
        }}
        onClick={() => setModalAberta(true)}
      >
        <Typography variant="caption" color="textSecondary" gutterBottom>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <img
            src={dataUrl}
            alt="Assinatura"
            style={{
              maxWidth: '100%',
              maxHeight: '80px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
            }}
            onError={() => setErroImagem(true)}
          />
        </Box>
        <Typography variant="caption" color="#9c27b0" sx={{ mt: 1, display: 'block' }}>
          Clique para ampliar
        </Typography>
      </Box>

      {/* Modal para ampliar assinatura */}
      <Dialog
        open={modalAberta}
        onClose={() => setModalAberta(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{label}</Typography>
          <IconButton onClick={() => setModalAberta(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <img
            src={dataUrl}
            alt="Assinatura ampliada"
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              width: 'auto',
              borderRadius: '8px',
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

function RespostasAnamnese() {
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroFormulario, setFiltroFormulario] = useState('todos');
  const [dataInicio, setDataInicio] = useState(subDays(new Date(), 30));
  const [dataFim, setDataFim] = useState(new Date());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef(null);
  const [dadosImpressao, setDadosImpressao] = useState({
    resposta: null,
    formulario: null,
    cliente: null,
    profissional: null
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [respostasData, formulariosData, clientesData, profissionaisData] = await Promise.all([
        firebaseService.getAll('respostas_anamnese'),
        firebaseService.getAll('formularios_anamnese'),
        firebaseService.getAll('clientes'),
        firebaseService.getAll('profissionais')
      ]);
      setRespostas(respostasData || []);
      setFormularios(formulariosData || []);
      setClientes(clientesData || []);
      setProfissionais(profissionaisData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar respostas');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintResposta = async (resposta) => {
    try {
      setIsPrinting(true);
      toast.loading('Carregando dados para impressão...', { id: 'print-anamnese' });
      
      const formulario = formularios.find(f => f.id === resposta.formularioId);
      const cliente = clientes.find(c => c.id === resposta.clienteId);
      
      let profissional = null;
      if (resposta.profissionalId) {
        profissional = profissionais.find(p => p.id === resposta.profissionalId);
        if (!profissional) {
          try {
            profissional = await firebaseService.getById('profissionais', resposta.profissionalId);
          } catch (error) {
            console.error('Erro ao carregar profissional:', error);
          }
        }
      }
      
      setDadosImpressao({
        resposta,
        formulario,
        cliente,
        profissional
      });
      
      setTimeout(() => {
        toast.dismiss('print-anamnese');
        setTimeout(() => {
          handlePrint();
        }, 100);
      }, 500);
      
    } catch (error) {
      console.error('❌ Erro ao preparar impressão:', error);
      toast.error('Erro ao preparar impressão', { id: 'print-anamnese' });
      setIsPrinting(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: dadosImpressao.resposta 
      ? `anamnese_${dadosImpressao.resposta.clienteNome}_${new Date().toISOString().split('T')[0]}`
      : `anamnese_${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => {
      setIsPrinting(false);
      toast.success('Impressão concluída!', { id: 'print-anamnese' });
    },
    onPrintError: (error) => {
      setIsPrinting(false);
      console.error('Erro na impressão:', error);
      toast.error('Erro ao imprimir. Tente novamente.', { id: 'print-anamnese' });
    }
  });

  const handleMarcarComoVisto = async (resposta) => {
    try {
      await firebaseService.update('respostas_anamnese', resposta.id, {
        status: 'visto',
        vistoEm: new Date().toISOString(),
        vistoPor: 'usuarioId'
      });
      toast.success('Marcado como visto');
      carregarDados();
    } catch (error) {
      console.error('Erro ao marcar como visto:', error);
      toast.error('Erro ao atualizar');
    }
  };

  const handleArquivar = async (resposta) => {
    try {
      await firebaseService.update('respostas_anamnese', resposta.id, {
        status: 'arquivado'
      });
      toast.success('Arquivado com sucesso');
      carregarDados();
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      toast.error('Erro ao arquivar');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pendente': return 'warning';
      case 'respondido': return 'info';
      case 'visto': return 'success';
      case 'arquivado': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pendente': return <LateIcon />;
      case 'respondido': return <AssignmentTurnedInIcon />;
      case 'visto': return <CheckIcon />;
      case 'arquivado': return <CancelIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'pendente': return 'Aguardando';
      case 'respondido': return 'Respondido';
      case 'visto': return 'Visualizado';
      case 'arquivado': return 'Arquivado';
      default: return status;
    }
  };

  const respostasFiltradas = respostas.filter(r => {
    const matchesTexto = filtro === '' || 
      r.clienteNome?.toLowerCase().includes(filtro.toLowerCase()) ||
      r.servicoNome?.toLowerCase().includes(filtro.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || r.status === filtroStatus;

    const matchesFormulario = filtroFormulario === 'todos' || r.formularioId === filtroFormulario;

    const dataResposta = new Date(r.respondidoEm || r.criadoEm);
    const matchesData = dataResposta >= dataInicio && dataResposta <= dataFim;

    return matchesTexto && matchesStatus && matchesFormulario && matchesData;
  });

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Respostas de Anamnese
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Visualize e gerencie os formulários respondidos pelos clientes
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={carregarDados}
          >
            Atualizar
          </Button>
        </Box>

        {/* Cards de estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {respostas.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total de Respostas
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                    <LateIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {respostas.filter(r => r.status === 'pendente').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Aguardando
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}>
                    <AssignmentTurnedInIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                      {respostas.filter(r => r.status === 'respondido').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Respondidos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                    <CheckIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {respostas.filter(r => r.status === 'visto').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Visualizados
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por cliente ou serviço..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: filtro && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setFiltro('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtroStatus}
                    label="Status"
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="pendente">Aguardando</MenuItem>
                    <MenuItem value="respondido">Respondido</MenuItem>
                    <MenuItem value="visto">Visualizado</MenuItem>
                    <MenuItem value="arquivado">Arquivado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Formulário</InputLabel>
                  <Select
                    value={filtroFormulario}
                    label="Formulário"
                    onChange={(e) => setFiltroFormulario(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {formularios.map(f => (
                      <MenuItem key={f.id} value={f.id}>{f.titulo}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <DatePicker
                  label="Data Início"
                  value={dataInicio}
                  onChange={setDataInicio}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <DatePicker
                  label="Data Fim"
                  value={dataFim}
                  onChange={setDataFim}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabela de Respostas */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell><strong>Serviço</strong></TableCell>
                  <TableCell><strong>Formulário</strong></TableCell>
                  <TableCell><strong>Data Resposta</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {respostasFiltradas
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((res) => {
                    const formulario = formularios.find(f => f.id === res.formularioId);
                    const cliente = clientes.find(c => c.id === res.clienteId);
                    
                    return (
                      <TableRow key={res.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={cliente?.foto} sx={{ width: 32, height: 32 }}>
                              {res.clienteNome?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {res.clienteNome}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={res.servicoNome}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formulario?.titulo || 'Formulário'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {res.respondidoEm ? (
                            <Box>
                              <Typography variant="body2">
                                {new Date(res.respondidoEm).toLocaleDateString('pt-BR')}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {new Date(res.respondidoEm).toLocaleTimeString('pt-BR')}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              {new Date(res.criadoEm).toLocaleDateString('pt-BR')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(res.status)}
                            label={getStatusLabel(res.status)}
                            size="small"
                            color={getStatusColor(res.status)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Visualizar respostas">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setRespostaSelecionada(res);
                                  setOpenDetalhesDialog(true);
                                }}
                                sx={{ color: '#2196f3' }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {res.status === 'respondido' && (
                              <Tooltip title="Marcar como visto">
                                <IconButton
                                  size="small"
                                  onClick={() => handleMarcarComoVisto(res)}
                                  sx={{ color: '#4caf50' }}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Arquivar">
                              <IconButton
                                size="small"
                                onClick={() => handleArquivar(res)}
                                sx={{ color: '#ff9800' }}
                              >
                                <ArchiveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Imprimir">
                              <IconButton
                                size="small"
                                onClick={() => handlePrintResposta(res)}
                                disabled={isPrinting}
                                sx={{ color: '#9c27b0' }}
                              >
                                {isPrinting ? <CircularProgress size={18} /> : <PrintIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {respostasFiltradas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Nenhuma resposta encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={respostasFiltradas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* Dialog de Detalhes - COM ASSINATURA CORRIGIDA */}
        <Dialog open={openDetalhesDialog} onClose={() => setOpenDetalhesDialog(false)} maxWidth="md" fullWidth>
          {respostaSelecionada && (
            <>
              <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon />
                    <Typography variant="h6">Respostas do Formulário</Typography>
                  </Box>
                  <IconButton onClick={() => setOpenDetalhesDialog(false)} sx={{ color: 'white' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  {/* Informações do cliente */}
                  <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Cliente
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {respostaSelecionada.clienteNome}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Serviço
                        </Typography>
                        <Typography variant="body1">
                          {respostaSelecionada.servicoNome}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Profissional
                        </Typography>
                        <Typography variant="body1">
                          {respostaSelecionada.profissionalNome || 'Não informado'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Respondido em
                        </Typography>
                        <Typography variant="body1">
                          {new Date(respostaSelecionada.respondidoEm).toLocaleString('pt-BR')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Respostas - APENAS ASSINATURA COMO IMAGEM */}
                  <Typography variant="h6" gutterBottom>
                    Respostas:
                  </Typography>
                  
                  {respostaSelecionada.respostas?.map((resposta, index) => {
                    const isAssinatura = isRespostaAssinatura(resposta);
                    const assinaturaSrc = isAssinatura ? processarAssinatura(resposta.resposta) : null;
                    const deveMostrarAssinatura = isAssinatura && assinaturaSrc && assinaturaSrc.startsWith('data:image');
                    
                    return (
                      <Accordion key={index} defaultExpanded={index === 0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {resposta.pergunta}
                            {deveMostrarAssinatura && (
                              <Chip 
                                icon={<EditNoteIcon />} 
                                label="Assinatura Digital" 
                                size="small" 
                                sx={{ ml: 1, height: 20, fontSize: '0.65rem', bgcolor: '#f3e5f5', color: '#9c27b0' }} 
                              />
                            )}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {deveMostrarAssinatura ? (
                            <AssinaturaViewer dataUrl={assinaturaSrc} label="Assinatura Digital" />
                          ) : resposta.tipo === 'checkbox' && Array.isArray(resposta.resposta) ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {resposta.resposta.map((item, i) => (
                                <Chip key={i} label={item} size="small" />
                              ))}
                            </Box>
                          ) : resposta.tipo === 'arquivo' || resposta.tipo === 'imagem' ? (
                            <Box sx={{ textAlign: 'center' }}>
                              <Button
                                variant="outlined"
                                startIcon={<ImageIcon />}
                                onClick={() => window.open(resposta.resposta, '_blank')}
                              >
                                Ver arquivo anexado
                              </Button>
                            </Box>
                          ) : (
                            <Typography variant="body1">
                              {resposta.resposta || <span style={{ color: '#999', fontStyle: 'italic' }}>Não respondido</span>}
                            </Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}

                  {/* Observações do profissional */}
                  <TextField
                    fullWidth
                    label="Observações do profissional"
                    multiline
                    rows={3}
                    value={respostaSelecionada.observacoesProfissional || ''}
                    placeholder="Adicione observações sobre este formulário..."
                    sx={{ mt: 3 }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetalhesDialog(false)}>Fechar</Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setOpenDetalhesDialog(false);
                    handlePrintResposta(respostaSelecionada);
                  }}
                  startIcon={isPrinting ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />}
                  disabled={isPrinting}
                  sx={{ bgcolor: '#9c27b0' }}
                >
                  {isPrinting ? 'Preparando...' : 'Imprimir'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Componente oculto para impressão personalizada */}
        <Box sx={{ display: 'none' }}>
          <ImprimirRespostaAnamnese
            ref={printRef}
            resposta={dadosImpressao.resposta}
            formulario={dadosImpressao.formulario}
            cliente={dadosImpressao.cliente}
            profissional={dadosImpressao.profissional}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default RespostasAnamnese;
