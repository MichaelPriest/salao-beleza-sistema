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
  Stack,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  FormHelperText,
  Input,
  InputBase,
  TextareaAutosize,
  NativeSelect,
  RadioGroup as MuiRadioGroup,
  Checkbox as MuiCheckbox,
  FormGroup,
  FormLabel,
  ListSubheader,
  MenuList,
  Popover,
  Popper,
  ClickAwayListener,
  Grow as Grow2,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  Drawer,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Container,
  Hidden,
  Backdrop,
  Modal,
  Portal,
  NoSsr,
  Skeleton,
  Fade as MuiFade,
  Zoom as MuiZoom,
  Slide as MuiSlide,
  Grow as MuiGrow,
  Collapse as MuiCollapse,
  alpha as muiAlpha,
  styled,
  ThemeProvider,
  createTheme,
  useTheme,
  useMediaQuery,
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
  Search as SearchIcon,
  Clear as ClearIcon,
  CloudUpload as CloudUploadIcon,
  AttachMoney as MoneyIcon,
  Numbers as NumbersIcon,
  Signature as SignatureIcon,
  Brush as BrushIcon,
  PhotoCamera as PhotoCameraIcon,
  VideoLibrary as VideoIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileGenericIcon,
  Functions as FunctionsIcon,
  CallSplit as ConditionalIcon,
  Merge as MergeIcon,
  Input as InputIcon,
  Output as OutputIcon,
  Code as CodeIcon,
  Calculate as CalculateIcon,
  Percent as PercentIcon,
  Tag as TagIcon,
  Label as LabelIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Restore as RestoreIcon,
  RestorePage as RestorePageIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutLargeIcon,
  BubbleChart as BubbleChartIcon,
  MultilineChart as MultilineChartIcon,
  ScatterPlot as ScatterPlotIcon,
  TableChart as TableChartIcon,
  TableRows as TableRowsIcon,
  ViewColumn as ViewColumnIcon,
  ViewModule as ViewModuleIcon,
  ViewQuilt as ViewQuiltIcon,
  ViewStream as ViewStreamIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
  ViewCarousel as ViewCarouselIcon,
  ViewComfy as ViewComfyIcon,
  ViewCompact as ViewCompactIcon,
  ViewAgenda as ViewAgendaIcon,
  ViewArray as ViewArrayIcon,
  ViewColumnOutlined as ViewColumnOutlinedIcon,
  ViewModuleOutlined as ViewModuleOutlinedIcon,
  ViewQuiltOutlined as ViewQuiltOutlinedIcon,
  ViewStreamOutlined as ViewStreamOutlinedIcon,
  ViewWeekOutlined as ViewWeekOutlinedIcon,
  ViewDayOutlined as ViewDayOutlinedIcon,
  ViewCarouselOutlined as ViewCarouselOutlinedIcon,
  ViewComfyOutlined as ViewComfyOutlinedIcon,
  ViewCompactOutlined as ViewCompactOutlinedIcon,
  ViewAgendaOutlined as ViewAgendaOutlinedIcon,
  ViewArrayOutlined as ViewArrayOutlinedIcon,
} from '@mui/icons-material';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../../services/firebase';
import { auditoriaService } from '../../services/auditoriaService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import SignatureCanvas from 'react-signature-canvas';
import { NumericFormat } from 'react-number-format';
import InputMask from 'react-input-mask';

// ============================================
// TIPOS DE QUESTÕES AVANÇADOS
// ============================================

const tiposQuestao = [
  // Campos básicos
  { value: 'texto', label: 'Texto curto', icon: <TextIcon />, categoria: 'Básico' },
  { value: 'textarea', label: 'Texto longo', icon: <NotesIcon />, categoria: 'Básico' },
  { value: 'numero', label: 'Número', icon: <NumbersIcon />, categoria: 'Básico' },
  { value: 'data', label: 'Data', icon: <DateIcon />, categoria: 'Básico' },
  { value: 'hora', label: 'Hora', icon: <TimeIcon />, categoria: 'Básico' },
  
  // Campos de seleção
  { value: 'select', label: 'Lista suspensa (única)', icon: <ListIcon />, categoria: 'Seleção' },
  { value: 'multiselect', label: 'Lista suspensa (múltipla)', icon: <ListIcon />, categoria: 'Seleção' },
  { value: 'radio', label: 'Opção única', icon: <RadioIcon />, categoria: 'Seleção' },
  { value: 'checkbox', label: 'Múltipla escolha', icon: <CheckBoxIcon />, categoria: 'Seleção' },
  
  // Campos especiais
  { value: 'arquivo', label: 'Upload de arquivo', icon: <FileIcon />, categoria: 'Especial' },
  { value: 'imagem', label: 'Upload de imagem', icon: <ImageIcon />, categoria: 'Especial' },
  { value: 'pdf', label: 'Upload de PDF', icon: <PdfIcon />, categoria: 'Especial' },
  { value: 'video', label: 'Upload de vídeo', icon: <VideoIcon />, categoria: 'Especial' },
  { value: 'assinatura', label: 'Assinatura digital', icon: <BrushIcon />, categoria: 'Especial' },
  
  // Campos com máscara
  { value: 'cpf', label: 'CPF', icon: <TagIcon />, categoria: 'Máscara' },
  { value: 'cnpj', label: 'CNPJ', icon: <TagIcon />, categoria: 'Máscara' },
  { value: 'telefone', label: 'Telefone', icon: <TagIcon />, categoria: 'Máscara' },
  { value: 'cep', label: 'CEP', icon: <TagIcon />, categoria: 'Máscara' },
  { value: 'dinheiro', label: 'Valor monetário', icon: <MoneyIcon />, categoria: 'Máscara' },
  
  // Campos condicionais e calculados
  { value: 'condicional', label: 'Campo condicional', icon: <ConditionalIcon />, categoria: 'Avançado' },
  { value: 'calculado', label: 'Campo calculado', icon: <CalculateIcon />, categoria: 'Avançado' },
];

// ============================================
// COMPONENTES DE MÁSCARA
// ============================================

const NumericFormatCustom = React.forwardRef(function NumericFormatCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      decimalScale={2}
      fixedDecimalScale
    />
  );
});

const MaskedInputCustom = ({ mask, value, onChange, ...props }) => {
  return (
    <InputMask
      mask={mask}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={props.disabled}
      maskChar={null}
    >
      {(inputProps) => <TextField {...inputProps} {...props} fullWidth size="small" />}
    </InputMask>
  );
};

// ============================================
// COMPONENTE DE ASSINATURA
// ============================================

const SignaturePad = ({ value, onChange, disabled }) => {
  const [sigPad, setSigPad] = useState(null);
  const [hasSignature, setHasSignature] = useState(false);

  const clear = () => {
    if (sigPad) {
      sigPad.clear();
      setHasSignature(false);
      onChange('');
    }
  };

  const save = () => {
    if (sigPad && !sigPad.isEmpty()) {
      const dataUrl = sigPad.getCanvas().toDataURL('image/png');
      setHasSignature(true);
      onChange(dataUrl);
    }
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 1, bgcolor: '#faf5ff' }}>
        <SignatureCanvas
          ref={(ref) => setSigPad(ref)}
          canvasProps={{
            width: 500,
            height: 200,
            className: 'sigCanvas',
            style: {
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '100%',
              height: '200px',
              backgroundColor: 'white',
              cursor: disabled ? 'not-allowed' : 'crosshair'
            }
          }}
          disabled={disabled}
          onEnd={save}
        />
      </Paper>
      {!disabled && (
        <Button
          size="small"
          onClick={clear}
          sx={{ mt: 1 }}
          startIcon={<DeleteIcon />}
        >
          Limpar assinatura
        </Button>
      )}
      {hasSignature && (
        <Typography variant="caption" color="success.main" sx={{ ml: 2 }}>
          ✓ Assinatura capturada
        </Typography>
      )}
    </Box>
  );
};

// ============================================
// FUNÇÃO AUXILIAR PARA LIMPAR UNDEFINED
// ============================================
const limparObjeto = (obj) => {
  if (obj === undefined || obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => limparObjeto(item)).filter(item => item !== undefined && item !== null);
  }
  if (typeof obj === 'object') {
    const novoObj = {};
    Object.keys(obj).forEach(key => {
      const valor = obj[key];
      if (valor !== undefined && valor !== null) {
        if (typeof valor === 'object') {
          const valorLimpo = limparObjeto(valor);
          if (valorLimpo !== null && Object.keys(valorLimpo).length > 0) {
            novoObj[key] = valorLimpo;
          }
        } else {
          novoObj[key] = valor;
        }
      }
    });
    return novoObj;
  }
  return obj;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function FormulariosAnamnese() {
  const [loading, setLoading] = useState(true);
  const [formularios, setFormularios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formularioEditando, setFormularioEditando] = useState(null);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [formularioPreview, setFormularioPreview] = useState(null);
  const [openCondicionalDialog, setOpenCondicionalDialog] = useState(false);
  const [questaoCondicional, setQuestaoCondicional] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [secaoAtual, setSecaoAtual] = useState('geral');
  
  // Estado do formulário com campos avançados (todos com null em vez de undefined)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    servicoIds: [],
    ativo: true,
    obrigatorio: true,
    tempoEstimado: 5,
    instrucoes: '',
    categorias: [],
    tags: [],
    secoes: [],
    questoes: [],
    configuracoes: {
      mostrarBarraProgresso: true,
      permitirSalvarRascunho: true,
      notificarProfissional: true,
      expirarEm: null,
      maximoTentativas: 0
    }
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
        categorias: formulario.categorias || [],
        tags: formulario.tags || [],
        secoes: formulario.secoes || [],
        questoes: formulario.questoes || [],
        configuracoes: formulario.configuracoes || {
          mostrarBarraProgresso: true,
          permitirSalvarRascunho: true,
          notificarProfissional: true,
          expirarEm: null,
          maximoTentativas: 0
        }
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
        categorias: [],
        tags: [],
        secoes: [],
        questoes: [],
        configuracoes: {
          mostrarBarraProgresso: true,
          permitirSalvarRascunho: true,
          notificarProfissional: true,
          expirarEm: null,
          maximoTentativas: 0
        }
      });
    }
    setTabValue(0);
    setOpenDialog(true);
  };

  // Adicionar nova seção
  const adicionarSecao = () => {
    const novaSecao = {
      id: `secao_${Date.now()}`,
      titulo: 'Nova Seção',
      descricao: '',
      ordem: formData.secoes.length
    };
    setFormData({
      ...formData,
      secoes: [...formData.secoes, novaSecao]
    });
  };

  // 🔥 FUNÇÃO adicionarQuestao CORRIGIDA (sem undefined)
  const adicionarQuestao = (secaoId = null) => {
    const novaQuestao = {
      id: `q${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tipo: 'texto',
      pergunta: '',
      descricao: '',
      obrigatoria: true,
      opcoes: [],
      multipla: false,
      placeholder: '',
      valorMinimo: null,
      valorMaximo: null,
      passo: null,
      formato: null,
      mascara: null,
      condicional: null,
      calculado: null,
      secaoId: secaoId,
      ordem: formData.questoes.filter(q => q.secaoId === secaoId).length,
      validacoes: {
        required: true,
        minLength: null,
        maxLength: null,
        pattern: null,
        custom: null
      },
      aparencia: {
        cor: null,
        icone: null,
        tamanho: 'medio'
      }
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

  // 🔥 FUNÇÃO atualizarQuestao CORRIGIDA (sem undefined)
  const atualizarQuestao = (index, campo, valor) => {
    const novasQuestoes = [...formData.questoes];
    
    // Se for alterar o tipo, resetar campos específicos
    if (campo === 'tipo') {
      const novoTipo = valor;
      const questao = novasQuestoes[index];
      
      // Resetar campos baseado no novo tipo (usando null em vez de undefined)
      if (['select', 'multiselect', 'radio', 'checkbox'].includes(novoTipo)) {
        questao.opcoes = questao.opcoes || [];
      } else {
        questao.opcoes = [];
      }
      
      if (novoTipo === 'numero') {
        questao.valorMinimo = null;
        questao.valorMaximo = null;
        questao.passo = 1;
      } else {
        questao.valorMinimo = null;
        questao.valorMaximo = null;
        questao.passo = null;
      }
      
      if (['cpf', 'cnpj', 'telefone', 'cep'].includes(novoTipo)) {
        questao.mascara = novoTipo;
      } else {
        questao.mascara = null;
      }
      
      if (novoTipo === 'dinheiro') {
        questao.formato = 'monetario';
      } else {
        questao.formato = null;
      }
      
      // Resetar condicional e calculado
      questao.condicional = null;
      questao.calculado = null;
    }
    
    // Garantir que não estamos passando undefined
    novasQuestoes[index][campo] = valor === undefined ? null : valor;
    
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  // Adicionar opção a uma questão
  const adicionarOpcao = (index) => {
    const novasQuestoes = [...formData.questoes];
    if (!novasQuestoes[index].opcoes) {
      novasQuestoes[index].opcoes = [];
    }
    novasQuestoes[index].opcoes.push(`Opção ${novasQuestoes[index].opcoes.length + 1}`);
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  // Mover questão para cima
  const moverQuestaoCima = (index) => {
    if (index === 0) return;
    const novasQuestoes = [...formData.questoes];
    [novasQuestoes[index - 1], novasQuestoes[index]] = [novasQuestoes[index], novasQuestoes[index - 1]];
    
    // Recalcular ordens
    novasQuestoes.forEach((q, i) => {
      q.ordem = i;
    });
    
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  // Mover questão para baixo
  const moverQuestaoBaixo = (index) => {
    if (index === formData.questoes.length - 1) return;
    const novasQuestoes = [...formData.questoes];
    [novasQuestoes[index + 1], novasQuestoes[index]] = [novasQuestoes[index], novasQuestoes[index + 1]];
    
    // Recalcular ordens
    novasQuestoes.forEach((q, i) => {
      q.ordem = i;
    });
    
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  // Duplicar questão
  const duplicarQuestao = (index) => {
    const questao = { 
      ...formData.questoes[index], 
      id: `q${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pergunta: `${questao.pergunta} (cópia)`
    };
    const novasQuestoes = [...formData.questoes];
    novasQuestoes.splice(index + 1, 0, questao);
    
    // Recalcular ordens
    novasQuestoes.forEach((q, i) => {
      q.ordem = i;
    });
    
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  // Abrir diálogo de condicional
  const handleOpenCondicional = (index) => {
    setQuestaoCondicional({ index, ...formData.questoes[index] });
    setOpenCondicionalDialog(true);
  };

  // Salvar condicional
  const handleSalvarCondicional = () => {
    if (questaoCondicional && questaoCondicional.index !== undefined) {
      const novasQuestoes = [...formData.questoes];
      novasQuestoes[questaoCondicional.index].condicional = questaoCondicional.condicional ? {
        perguntaId: questaoCondicional.condicional.perguntaId || null,
        valor: questaoCondicional.condicional.valor || null,
        operador: questaoCondicional.condicional.operador || '=='
      } : null;
      setFormData({ ...formData, questoes: novasQuestoes });
      setOpenCondicionalDialog(false);
    }
  };

  // 🔥 FUNÇÃO handleSalvar CORRIGIDA (com limpeza de undefined)
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

      // 🔥 LIMPAR DADOS ANTES DE ENVIAR
      const dadosParaSalvar = limparObjeto({
        ...formData,
        criadoEm: formularioEditando ? formularioEditando.criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        versao: formularioEditando ? (formularioEditando.versao || 1) + 1 : 1
      });

      console.log('📦 Dados limpos para salvar:', dadosParaSalvar);

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
      console.error('❌ Erro ao salvar formulário:', error);
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
      mostrarSnackbar('Erro ao salvar formulário: ' + error.message, 'error');
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
      const novoFormulario = limparObjeto({
        ...formulario,
        titulo: `${formulario.titulo} (cópia)`,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        versao: 1
      });
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

  // Renderizar campo de acordo com o tipo
  const renderizarCampoPreview = (questao) => {
    const { tipo, pergunta, obrigatoria, placeholder, opcoes } = questao;
    
    switch(tipo) {
      case 'texto':
        return (
          <TextField
            fullWidth
            size="small"
            placeholder={placeholder || 'Digite aqui...'}
            label={pergunta}
            required={obrigatoria}
            disabled
          />
        );
      
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={placeholder || 'Digite aqui...'}
            label={pergunta}
            required={obrigatoria}
            disabled
          />
        );
      
      case 'numero':
        return (
          <TextField
            type="number"
            fullWidth
            size="small"
            placeholder={placeholder || '0'}
            label={pergunta}
            required={obrigatoria}
            InputProps={{
              inputProps: { min: questao.valorMinimo, max: questao.valorMaximo, step: questao.passo }
            }}
            disabled
          />
        );
      
      case 'data':
        return (
          <TextField
            type="date"
            fullWidth
            size="small"
            label={pergunta}
            InputLabelProps={{ shrink: true }}
            required={obrigatoria}
            disabled
          />
        );
      
      case 'hora':
        return (
          <TextField
            type="time"
            fullWidth
            size="small"
            label={pergunta}
            InputLabelProps={{ shrink: true }}
            required={obrigatoria}
            disabled
          />
        );
      
      case 'select':
      case 'radio':
        return (
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">
              {pergunta} {obrigatoria && '*'}
            </FormLabel>
            <RadioGroup>
              {opcoes?.map((op, i) => (
                <FormControlLabel
                  key={i}
                  value={op}
                  control={<Radio disabled />}
                  label={op}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      
      case 'multiselect':
      case 'checkbox':
        return (
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">
              {pergunta} {obrigatoria && '*'}
            </FormLabel>
            <FormGroup>
              {opcoes?.map((op, i) => (
                <FormControlLabel
                  key={i}
                  control={<Checkbox disabled />}
                  label={op}
                />
              ))}
            </FormGroup>
          </FormControl>
        );
      
      case 'cpf':
      case 'cnpj':
      case 'telefone':
      case 'cep':
        return (
          <MaskedInputCustom
            mask={
              tipo === 'cpf' ? '999.999.999-99' :
              tipo === 'cnpj' ? '99.999.999/9999-99' :
              tipo === 'telefone' ? '(99) 99999-9999' :
              tipo === 'cep' ? '99999-999' : ''
            }
            label={pergunta}
            required={obrigatoria}
            disabled
          />
        );
      
      case 'dinheiro':
        return (
          <TextField
            fullWidth
            size="small"
            label={pergunta}
            required={obrigatoria}
            InputProps={{
              inputComponent: NumericFormatCustom,
            }}
            disabled
          />
        );
      
      case 'assinatura':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {pergunta} {obrigatoria && '*'}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                [Área para assinatura digital]
              </Typography>
            </Paper>
          </Box>
        );
      
      case 'arquivo':
      case 'imagem':
      case 'pdf':
      case 'video':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {pergunta} {obrigatoria && '*'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              disabled
            >
              Upload de arquivo
            </Button>
          </Box>
        );
      
      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={pergunta}
            required={obrigatoria}
            disabled
          />
        );
    }
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
            Crie formulários avançados com campos condicionais, calculados e muito mais
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
        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                  <ConditionalIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formularios.reduce((acc, f) => acc + (f.questoes?.filter(q => q.condicional).length || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Campos Condicionais
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}>
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
                placeholder="Buscar formulários por título ou descrição..."
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
                <TableCell><strong>Condicionais</strong></TableCell>
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
                  const condicionais = form.questoes?.filter(q => q.condicional).length || 0;
                  
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
                        {form.tags?.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {form.tags.slice(0, 2).map(tag => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
                        )}
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
                        {condicionais > 0 ? (
                          <Chip
                            label={condicionais}
                            size="small"
                            color="warning"
                          />
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            -
                          </Typography>
                        )}
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
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Configurações Gerais" />
              <Tab label="Questões" />
              <Tab label="Avançado" />
            </Tabs>
          </Box>

          {/* Aba 0: Configurações Gerais */}
          {tabValue === 0 && (
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

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={formData.tags || []}
                  onChange={(e, newValue) => setFormData({ ...formData, tags: newValue })}
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
                      label="Tags / Palavras-chave"
                      size="small"
                      placeholder="Digite e pressione Enter"
                      helperText="Tags para facilitar a busca"
                    />
                  )}
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
            </Grid>
          )}

          {/* Aba 1: Questões */}
          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#9c27b0' }}>
                  Questões do Formulário
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => adicionarQuestao()}
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
                  {formData.questoes.map((questao, index) => {
                    const tiposCategorizados = tiposQuestao.reduce((acc, tipo) => {
                      if (!acc[tipo.categoria]) acc[tipo.categoria] = [];
                      acc[tipo.categoria].push(tipo);
                      return acc;
                    }, {});

                    return (
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
                                    {Object.entries(tiposCategorizados).map(([categoria, tipos]) => [
                                      <ListSubheader key={categoria}>{categoria}</ListSubheader>,
                                      ...tipos.map(tipo => (
                                        <MenuItem key={tipo.value} value={tipo.value}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {tipo.icon}
                                            {tipo.label}
                                          </Box>
                                        </MenuItem>
                                      ))
                                    ])}
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

                              {['select', 'multiselect', 'radio', 'checkbox'].includes(questao.tipo) && (
                                <Grid item xs={12}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="subtitle2">Opções:</Typography>
                                    <Button
                                      size="small"
                                      startIcon={<AddIcon />}
                                      onClick={() => adicionarOpcao(index)}
                                    >
                                      Adicionar opção
                                    </Button>
                                  </Box>
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
                                          onDelete={() => {
                                            const novasOpcoes = value.filter((_, idx) => idx !== i);
                                            atualizarQuestao(index, 'opcoes', novasOpcoes);
                                          }}
                                        />
                                      ))
                                    }
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        size="small"
                                        placeholder="Digite e pressione Enter"
                                        helperText="Opções disponíveis para seleção"
                                      />
                                    )}
                                  />
                                </Grid>
                              )}

                              {['texto', 'textarea'].includes(questao.tipo) && (
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

                              {questao.tipo === 'numero' && (
                                <Grid container item xs={12} spacing={2}>
                                  <Grid item xs={4}>
                                    <TextField
                                      fullWidth
                                      type="number"
                                      size="small"
                                      label="Valor mínimo"
                                      value={questao.valorMinimo || ''}
                                      onChange={(e) => atualizarQuestao(index, 'valorMinimo', e.target.value)}
                                    />
                                  </Grid>
                                  <Grid item xs={4}>
                                    <TextField
                                      fullWidth
                                      type="number"
                                      size="small"
                                      label="Valor máximo"
                                      value={questao.valorMaximo || ''}
                                      onChange={(e) => atualizarQuestao(index, 'valorMaximo', e.target.value)}
                                    />
                                  </Grid>
                                  <Grid item xs={4}>
                                    <TextField
                                      fullWidth
                                      type="number"
                                      size="small"
                                      label="Passo"
                                      value={questao.passo || ''}
                                      onChange={(e) => atualizarQuestao(index, 'passo', e.target.value)}
                                    />
                                  </Grid>
                                </Grid>
                              )}

                              {/* Campos condicionais */}
                              {questao.condicional && (
                                <Grid item xs={12}>
                                  <Alert severity="info" sx={{ mt: 1 }}>
                                    <Typography variant="body2">
                                      Esta questão aparece apenas se: 
                                      <strong>
                                        {formData.questoes.find(q => q.id === questao.condicional.perguntaId)?.pergunta || 'Pergunta'} 
                                        {' '}for igual a "{questao.condicional.valor}"
                                      </strong>
                                    </Typography>
                                  </Alert>
                                </Grid>
                              )}

                              <Grid item xs={6}>
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

                              <Grid item xs={6}>
                                <Button
                                  size="small"
                                  startIcon={<ConditionalIcon />}
                                  onClick={() => handleOpenCondicional(index)}
                                  variant={questao.condicional ? 'contained' : 'outlined'}
                                  color="warning"
                                >
                                  {questao.condicional ? 'Editar condicional' : 'Adicionar condicional'}
                                </Button>
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
                    );
                  })}
                </List>
              )}
            </Box>
          )}

          {/* Aba 2: Avançado */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Configurações Avançadas
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.configuracoes?.mostrarBarraProgresso}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes: {
                          ...formData.configuracoes,
                          mostrarBarraProgresso: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Mostrar barra de progresso durante o preenchimento"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.configuracoes?.permitirSalvarRascunho}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes: {
                          ...formData.configuracoes,
                          permitirSalvarRascunho: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Permitir salvar rascunho"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.configuracoes?.notificarProfissional}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes: {
                          ...formData.configuracoes,
                          notificarProfissional: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Notificar profissional quando respondido"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Número máximo de tentativas (0 = ilimitado)"
                  value={formData.configuracoes?.maximoTentativas || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    configuracoes: {
                      ...formData.configuracoes,
                      maximoTentativas: parseInt(e.target.value) || 0
                    }
                  })}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de expiração"
                  value={formData.configuracoes?.expirarEm || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    configuracoes: {
                      ...formData.configuracoes,
                      expirarEm: e.target.value
                    }
                  })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 2 }}>
                  Modelos Pré-definidos
                </Typography>
                <Autocomplete
                  options={modelos}
                  getOptionLabel={(option) => option.titulo}
                  onChange={(e, modelo) => {
                    if (modelo && modelo.questoes) {
                      const novasQuestoes = modelo.questoes.map(q => ({
                        ...q,
                        id: `q${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        ordem: formData.questoes.length + (q.ordem || 0)
                      }));
                      setFormData({
                        ...formData,
                        questoes: [...formData.questoes, ...novasQuestoes]
                      });
                      mostrarSnackbar(`${modelo.questoes.length} questões importadas do modelo!`);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Importar questões de um modelo"
                      size="small"
                      placeholder="Selecione um modelo..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}
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

      {/* Dialog de Condicional */}
      <Dialog open={openCondicionalDialog} onClose={() => setOpenCondicionalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
          <ConditionalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Configurar Campo Condicional
        </DialogTitle>
        <DialogContent>
          {questaoCondicional && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Esta questão aparecerá apenas quando a condição abaixo for atendida:
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Pergunta base</InputLabel>
                    <Select
                      value={questaoCondicional.condicional?.perguntaId || ''}
                      label="Pergunta base"
                      onChange={(e) => setQuestaoCondicional({
                        ...questaoCondicional,
                        condicional: {
                          ...(questaoCondicional.condicional || {}),
                          perguntaId: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="">Selecione uma pergunta</MenuItem>
                      {formData.questoes
                        .filter((q, idx) => idx !== questaoCondicional.index && 
                          ['radio', 'select'].includes(q.tipo))
                        .map(q => (
                          <MenuItem key={q.id} value={q.id}>
                            {q.pergunta}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Operador</InputLabel>
                    <Select
                      value={questaoCondicional.condicional?.operador || '=='}
                      label="Operador"
                      onChange={(e) => setQuestaoCondicional({
                        ...questaoCondicional,
                        condicional: {
                          ...(questaoCondicional.condicional || {}),
                          operador: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="==">Igual a</MenuItem>
                      <MenuItem value="!=">Diferente de</MenuItem>
                      <MenuItem value=">">Maior que</MenuItem>
                      <MenuItem value="<">Menor que</MenuItem>
                      <MenuItem value=">=">Maior ou igual</MenuItem>
                      <MenuItem value="<=">Menor ou igual</MenuItem>
                      <MenuItem value="contains">Contém</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Valor"
                    value={questaoCondicional.condicional?.valor || ''}
                    onChange={(e) => setQuestaoCondicional({
                      ...questaoCondicional,
                      condicional: {
                        ...(questaoCondicional.condicional || {}),
                        valor: e.target.value
                      }
                    })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCondicionalDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSalvarCondicional}
            variant="contained"
            sx={{ bgcolor: '#ff9800' }}
          >
            Salvar Condicional
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

            {/* Barra de progresso simulada */}
            {formularioPreview?.configuracoes?.mostrarBarraProgresso && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="textSecondary">
                  Progresso: 0/{formularioPreview.questoes?.length || 0}
                </Typography>
                <LinearProgress variant="determinate" value={0} sx={{ mt: 0.5 }} />
              </Box>
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
                
                {renderizarCampoPreview(questao)}

                {/* Indicador de condicional */}
                {questao.condicional && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                    <ConditionalIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Aparece apenas quando condição for atendida
                  </Typography>
                )}
              </Paper>
            ))}

            {(!formularioPreview?.questoes || formularioPreview.questoes.length === 0) && (
              <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                Este formulário não possui questões
              </Typography>
            )}
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
