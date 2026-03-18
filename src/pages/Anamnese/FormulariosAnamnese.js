// src/pages/Anamnese/FormulariosAnamnese.js
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  DragHandle as DragHandleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  FormatListBulleted as ListIcon,
  Quiz as QuizIcon,
  Help as HelpIcon,
  TextFields as TextIcon,
  Notes as NotesIcon,
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckBoxIcon,
  DateRange as DateIcon,
  AccessTime as TimeIcon,
  AttachFile as FileIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  DragIndicator as DragIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  Send as SendIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as TurnedInIcon,
} from '@mui/icons-material';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../../services/firebase';
import { auditoriaService } from '../../services/auditoriaService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Tipos de questões
const tiposQuestao = [
  { value: 'texto', label: 'Texto curto', icon: <TextIcon /> },
  { value: 'textarea', label: 'Texto longo', icon: <NotesIcon /> },
  { value: 'select', label: 'Lista suspensa', icon: <ListIcon /> },
  { value: 'radio', label: 'Opção única', icon: <RadioIcon /> },
  { value: 'checkbox', label: 'Múltipla escolha', icon: <CheckBoxIcon /> },
  { value: 'data', label: 'Data', icon: <DateIcon /> },
  { value: 'hora', label: 'Hora', icon: <TimeIcon /> },
  { value: 'arquivo', label: 'Upload de arquivo', icon: <FileIcon /> },
];

function FormulariosAnamnese() {
  const [loading, setLoading] = useState(true);
  const [formularios, setFormularios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formularioEditando, setFormularioEditando] = useState(null);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [formularioPreview, setFormularioPreview] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    servicoIds: [],
    ativo: true,
    obrigatorio: true,
    tempoEstimado: 5,
    instrucoes: '',
    questoes: []
  });

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [formulariosData, servicosData, modelosData] = await Promise.all([
        firebaseService.getAll('formularios_anamnese'),
        firebaseService.getAll('servicos'),
        firebaseService.getAll('modelos_anamnese')
      ]);
      setFormularios(formulariosData || []);
      setServicos(servicosData || []);
      setModelos(modelosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar formulários');
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

  // Abrir diálogo para novo/editar
  const handleOpenDialog = (formulario = null) => {
    if (formulario) {
      setFormularioEditando(formulario);
      setFormData({
        titulo: formulario.titulo || '',
        descricao: formulario.descricao || '',
        servicoIds: formulario.servicoIds || [],
        ativo: formulario.ativo !== false,
        obrigatorio: formulario.obrigatorio !== false,
        tempoEstimado: formulario.tempoEstimado || 5,
        instrucoes: formulario.instrucoes || '',
        questoes: formulario.questoes || []
      });
    } else {
      setFormularioEditando(null);
      setFormData({
        titulo: '',
        descricao: '',
        servicoIds: [],
        ativo: true,
        obrigatorio: true,
        tempoEstimado: 5,
        instrucoes: '',
        questoes: []
      });
    }
    setOpenDialog(true);
  };

  // Adicionar nova questão
  const adicionarQuestao = () => {
    const novaQuestao = {
      id: `q${Date.now()}`,
      tipo: 'texto',
      pergunta: '',
      descricao: '',
      obrigatoria: true,
      opcoes: [],
      multipla: false,
      placeholder: '',
      ordem: formData.questoes.length
    };
    setFormData({
      ...formData,
      questoes: [...formData.questoes, novaQuestao]
    });
  };

  // Remover questão
  const removerQuestao = (index) => {
    const novasQuestoes = formData.questoes.filter((_, i) => i !== index);
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  // Atualizar questão
  const atualizarQuestao = (index, campo, valor) => {
    const novasQuestoes = [...formData.questoes];
    novasQuestoes[index] = { ...novasQuestoes[index], [campo]: valor };
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  // Mover questão para cima
  const moverQuestaoCima = (index) => {
    if (index === 0) return;
    const novasQuestoes = [...formData.questoes];
    [novasQuestoes[index - 1], novasQuestoes[index]] = [novasQuestoes[index], novasQuestoes[index - 1]];
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  // Mover questão para baixo
  const moverQuestaoBaixo = (index) => {
    if (index === formData.questoes.length - 1) return;
    const novasQuestoes = [...formData.questoes];
    [novasQuestoes[index + 1], novasQuestoes[index]] = [novasQuestoes[index], novasQuestoes[index + 1]];
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  // Duplicar questão
  const duplicarQuestao = (index) => {
    const questao = { ...formData.questoes[index], id: `q${Date.now()}` };
    const novasQuestoes = [...formData.questoes];
    novasQuestoes.splice(index + 1, 0, questao);
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  // Salvar formulário
  const handleSalvar = async () => {
    try {
      if (!formData.titulo) {
        mostrarSnackbar('Título é obrigatório', 'error');
        return;
      }

      if (formData.questoes.length === 0) {
        mostrarSnackbar('Adicione pelo menos uma questão', 'error');
        return;
      }

      const dadosParaSalvar = {
        ...formData,
        criadoEm: formularioEditando ? formularioEditando.criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };

      if (formularioEditando) {
        await firebaseService.update('formularios_anamnese', formularioEditando.id, dadosParaSalvar);
        mostrarSnackbar('Formulário atualizado com sucesso!');
      } else {
        await firebaseService.add('formularios_anamnese', dadosParaSalvar);
        mostrarSnackbar('Formulário criado com sucesso!');
      }

      setOpenDialog(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      mostrarSnackbar('Erro ao salvar formulário', 'error');
    }
  };

  // Excluir formulário
  const handleExcluir = async (formulario) => {
    if (window.confirm(`Deseja realmente excluir o formulário "${formulario.titulo}"?`)) {
      try {
        await firebaseService.delete('formularios_anamnese', formulario.id);
        mostrarSnackbar('Formulário excluído com sucesso!');
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir formulário:', error);
        mostrarSnackbar('Erro ao excluir formulário', 'error');
      }
    }
  };

  // Duplicar formulário
  const handleDuplicar = async (formulario) => {
    try {
      const novoFormulario = {
        ...formulario,
        titulo: `${formulario.titulo} (cópia)`,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };
      delete novoFormulario.id;
      
      await firebaseService.add('formularios_anamnese', novoFormulario);
      mostrarSnackbar('Formulário duplicado com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao duplicar formulário:', error);
      mostrarSnackbar('Erro ao duplicar formulário', 'error');
    }
  };

  // Preview do formulário
  const handlePreview = (formulario) => {
    setFormularioPreview(formulario);
    setOpenPreviewDialog(true);
  };

  const formulariosFiltrados = formularios.filter(f => 
    f.titulo?.toLowerCase().includes(filtro.toLowerCase()) ||
    f.descricao?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Formulários de Anamnese
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Crie e gerencie formulários para seus clientes preencherem
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
          }}
        >
          Novo Formulário
        </Button>
      </Box>

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formularios.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total de Formulários
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                  <QuizIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formularios.reduce((acc, f) => acc + (f.questoes?.length || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total de Questões
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                  <TurnedInIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formularios.filter(f => f.ativo).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Formulários Ativos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtro e busca */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar formulários..."
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
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Formulários */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Título</strong></TableCell>
                <TableCell><strong>Serviços</strong></TableCell>
                <TableCell><strong>Questões</strong></TableCell>
                <TableCell><strong>Tempo</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formulariosFiltrados
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((form) => {
                  const servicosAssociados = servicos.filter(s => form.servicoIds?.includes(s.id));
                  
                  return (
                    <TableRow key={form.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {form.titulo}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {form.descricao?.substring(0, 50)}
                          {form.descricao?.length > 50 ? '...' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {servicosAssociados.length > 0 ? (
                            servicosAssociados.slice(0, 2).map(s => (
                              <Chip
                                key={s.id}
                                label={s.nome}
                                size="small"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              Todos os serviços
                            </Typography>
                          )}
                          {servicosAssociados.length > 2 && (
                            <Chip
                              label={`+${servicosAssociados.length - 2}`}
                              size="small"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={form.questoes?.length || 0}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {form.tempoEstimado || 5} min
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={form.ativo ? 'Ativo' : 'Inativo'}
                          size="small"
                          color={form.ativo ? 'success' : 'error'}
                        />
                        {form.obrigatorio && (
                          <Chip
                            label="Obrigatório"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Visualizar">
                            <IconButton
                              size="small"
                              onClick={() => handlePreview(form)}
                              sx={{ color: '#2196f3' }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Duplicar">
                            <IconButton
                              size="small"
                              onClick={() => handleDuplicar(form)}
                              sx={{ color: '#4caf50' }}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(form)}
                              sx={{ color: '#ff4081' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              onClick={() => handleExcluir(form)}
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {formulariosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      Nenhum formulário encontrado
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
          count={formulariosFiltrados.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {formularioEditando ? 'Editar Formulário' : 'Novo Formulário'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Título do Formulário"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Tempo estimado (minutos)"
                value={formData.tempoEstimado}
                onChange={(e) => setFormData({ ...formData, tempoEstimado: parseInt(e.target.value) || 5 })}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                multiline
                rows={2}
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                size="small"
                placeholder="Descreva o objetivo deste formulário"
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={servicos}
                getOptionLabel={(option) => option.nome}
                value={servicos.filter(s => formData.servicoIds?.includes(s.id))}
                onChange={(e, newValue) => {
                  setFormData({
                    ...formData,
                    servicoIds: newValue.map(s => s.id)
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Serviços associados (deixe em branco para todos)"
                    size="small"
                    placeholder="Selecione os serviços..."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instruções para o cliente"
                multiline
                rows={2}
                value={formData.instrucoes}
                onChange={(e) => setFormData({ ...formData, instrucoes: e.target.value })}
                size="small"
                placeholder="Instruções que aparecerão antes do formulário"
              />
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  />
                }
                label="Formulário ativo"
              />
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.obrigatorio}
                    onChange={(e) => setFormData({ ...formData, obrigatorio: e.target.checked })}
                  />
                }
                label="Obrigatório para o serviço"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#9c27b0' }}>
                  Questões do Formulário
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={adicionarQuestao}
                  sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                >
                  Adicionar Questão
                </Button>
              </Box>

              {formData.questoes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <QuizIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary">
                    Nenhuma questão adicionada
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Clique em "Adicionar Questão" para começar
                  </Typography>
                </Paper>
              ) : (
                <List>
                  {formData.questoes.map((questao, index) => (
                    <Paper
                      key={questao.id}
                      variant="outlined"
                      sx={{ mb: 2, p: 2, position: 'relative' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ minWidth: 40, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ color: '#9c27b0' }}>
                            {index + 1}
                          </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Tipo da questão</InputLabel>
                                <Select
                                  value={questao.tipo}
                                  label="Tipo da questão"
                                  onChange={(e) => atualizarQuestao(index, 'tipo', e.target.value)}
                                >
                                  {tiposQuestao.map(tipo => (
                                    <MenuItem key={tipo.value} value={tipo.value}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {tipo.icon}
                                        {tipo.label}
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Pergunta"
                                value={questao.pergunta}
                                onChange={(e) => atualizarQuestao(index, 'pergunta', e.target.value)}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Descrição/Instrução (opcional)"
                                value={questao.descricao}
                                onChange={(e) => atualizarQuestao(index, 'descricao', e.target.value)}
                              />
                            </Grid>

                            {['select', 'radio', 'checkbox'].includes(questao.tipo) && (
                              <Grid item xs={12}>
                                <Autocomplete
                                  multiple
                                  freeSolo
                                  options={[]}
                                  value={questao.opcoes || []}
                                  onChange={(e, newValue) => atualizarQuestao(index, 'opcoes', newValue)}
                                  renderTags={(value, getTagProps) =>
                                    value.map((option, i) => (
                                      <Chip
                                        {...getTagProps({ index: i })}
                                        key={i}
                                        label={option}
                                        size="small"
                                      />
                                    ))
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Opções"
                                      size="small"
                                      placeholder="Digite e pressione Enter"
                                      helperText="Opções disponíveis para seleção"
                                    />
                                  )}
                                />
                              </Grid>
                            )}

                            {questao.tipo === 'texto' && (
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Placeholder"
                                  value={questao.placeholder || ''}
                                  onChange={(e) => atualizarQuestao(index, 'placeholder', e.target.value)}
                                />
                              </Grid>
                            )}

                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={questao.obrigatoria}
                                    onChange={(e) => atualizarQuestao(index, 'obrigatoria', e.target.checked)}
                                  />
                                }
                                label="Obrigatória"
                              />
                            </Grid>
                          </Grid>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Tooltip title="Mover para cima">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => moverQuestaoCima(index)}
                                disabled={index === 0}
                              >
                                <ArrowUpIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Mover para baixo">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => moverQuestaoBaixo(index)}
                                disabled={index === formData.questoes.length - 1}
                              >
                                <ArrowDownIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Duplicar">
                            <IconButton
                              size="small"
                              onClick={() => duplicarQuestao(index)}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remover">
                            <IconButton
                              size="small"
                              onClick={() => removerQuestao(index)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            sx={{ bgcolor: '#9c27b0' }}
          >
            {formularioEditando ? 'Atualizar' : 'Criar Formulário'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Preview */}
      <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f3e5f5' }}>
          <Typography variant="h6" sx={{ color: '#9c27b0' }}>
            Preview: {formularioPreview?.titulo}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {formularioPreview?.instrucoes && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {formularioPreview.instrucoes}
              </Alert>
            )}

            {formularioPreview?.questoes?.map((questao, index) => (
              <Paper key={questao.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {index + 1}. {questao.pergunta}
                  {questao.obrigatoria && <span style={{ color: '#f44336' }}> *</span>}
                </Typography>
                {questao.descricao && (
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                    {questao.descricao}
                  </Typography>
                )}

                {questao.tipo === 'texto' && (
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={questao.placeholder || 'Digite aqui...'}
                    disabled
                  />
                )}

                {questao.tipo === 'textarea' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    placeholder="Digite aqui..."
                    disabled
                  />
                )}

                {questao.tipo === 'select' && (
                  <FormControl fullWidth size="small">
                    <Select value="" displayEmpty disabled>
                      <MenuItem value="">Selecione uma opção</MenuItem>
                      {questao.opcoes?.map((op, i) => (
                        <MenuItem key={i} value={op}>{op}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {questao.tipo === 'radio' && (
                  <RadioGroup value="">
                    {questao.opcoes?.map((op, i) => (
                      <FormControlLabel
                        key={i}
                        value={op}
                        control={<Radio disabled />}
                        label={op}
                      />
                    ))}
                  </RadioGroup>
                )}

                {questao.tipo === 'checkbox' && (
                  <Box>
                    {questao.opcoes?.map((op, i) => (
                      <FormControlLabel
                        key={i}
                        control={<Checkbox disabled />}
                        label={op}
                      />
                    ))}
                  </Box>
                )}

                {questao.tipo === 'data' && (
                  <TextField
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                )}

                {questao.tipo === 'hora' && (
                  <TextField
                    type="time"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                )}

                {questao.tipo === 'arquivo' && (
                  <Button
                    variant="outlined"
                    startIcon={<FileIcon />}
                    disabled
                  >
                    Upload de arquivo
                  </Button>
                )}
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

export default FormulariosAnamnese;
