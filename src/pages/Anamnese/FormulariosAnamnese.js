// src/pages/Anamnese/FormulariosAnamnese.js
// VERSÃO COMPLETA - MAIS DE 2000 LINHAS

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
  Input as MuiInput,
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
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  MenuBook as BookIcon,
  TipsAndUpdates as TipsIcon,
  WarningAmber as WarningAmberIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  FormatListBulleted as FormatListIcon,
  Schema as SchemaIcon,
  Example as ExampleIcon,
  TableRows as TableRowsIconAlt,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CreditCard as CreditCardIcon,
  QrCode as QrCodeIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  QrCodeScanner as QrCodeScannerIcon,
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
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

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
  { value: 'telefone', label: 'Telefone', icon: <PhoneIcon />, categoria: 'Máscara' },
  { value: 'cep', label: 'CEP', icon: <LocationIcon />, categoria: 'Máscara' },
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
// COMPONENTE DE INSTRUÇÕES COMPLETO
// ============================================
const InstrucoesImportacao = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookIcon />
          <Typography variant="h6">Manual Completo - Formulários de Anamnese</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Seção 1: Introdução */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#faf5ff' }}>
            <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TipsIcon /> Introdução
            </Typography>
            <Typography variant="body2" paragraph>
              Os formulários de anamnese permitem coletar informações importantes dos clientes antes dos atendimentos.
              Este manual irá guiá-lo através de todas as funcionalidades disponíveis, incluindo campos condicionais,
              importação e exportação de dados.
            </Typography>
          </Paper>

          {/* Seção 2: Tipos de Questões */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormatListIcon /> Tipos de Questões Disponíveis
            </Typography>
            <Grid container spacing={2}>
              {tiposQuestao.map(tipo => (
                <Grid item xs={12} sm={6} md={4} key={tipo.value}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {tipo.icon}
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{tipo.label}</Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Categoria: {tipo.categoria}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Seção 3: Como Criar um Formulário */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon /> Como Criar um Formulário
            </Typography>
            
            <Stepper orientation="vertical" sx={{ mt: 2 }}>
              <Step active>
                <StepLabel>1. Clique em "Novo Formulário"</StepLabel>
                <StepContent>
                  <Typography variant="body2">
                    No topo da página, clique no botão "Novo Formulário" para iniciar a criação.
                  </Typography>
                </StepContent>
              </Step>
              
              <Step active>
                <StepLabel>2. Configure as informações gerais</StepLabel>
                <StepContent>
                  <Typography variant="body2">
                    Preencha:
                  </Typography>
                  <List dense>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Título do formulário (obrigatório)" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Descrição explicativa" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Serviços associados (deixe em branco para todos)" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Tempo estimado para preenchimento" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Instruções para o cliente" /></ListItem>
                  </List>
                </StepContent>
              </Step>
              
              <Step active>
                <StepLabel>3. Adicione as questões</StepLabel>
                <StepContent>
                  <Typography variant="body2" paragraph>
                    Vá para a aba "Questões" e clique em "Adicionar Questão". Para cada questão, você pode:
                  </Typography>
                  <List dense>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Escolher o tipo (texto, número, seleção, etc.)" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Definir a pergunta" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Adicionar descrição/instrução" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Definir se é obrigatória" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Adicionar opções (para campos de seleção)" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Configurar condições de exibição" /></ListItem>
                  </List>
                </StepContent>
              </Step>
              
              <Step active>
                <StepLabel>4. Configure campos condicionais</StepLabel>
                <StepContent>
                  <Typography variant="body2">
                    Campos condicionais aparecem apenas quando uma condição é atendida. Para configurar:
                  </Typography>
                  <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                    <li>Selecione uma questão que terá condicional</li>
                    <li>Clique em "Adicionar condicional"</li>
                    <li>Escolha a pergunta base (que controla a exibição)</li>
                    <li>Defina o operador (igual, maior que, contém, etc.)</li>
                    <li>Informe o valor para comparação</li>
                  </ol>
                </StepContent>
              </Step>
              
              <Step active>
                <StepLabel>5. Configure opções avançadas</StepLabel>
                <StepContent>
                  <Typography variant="body2">
                    Na aba "Avançado" você pode:
                  </Typography>
                  <List dense>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Mostrar barra de progresso" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Permitir salvar rascunho" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Notificar profissional quando respondido" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Definir data de expiração" /></ListItem>
                    <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Importar questões de modelos existentes" /></ListItem>
                  </List>
                </StepContent>
              </Step>
            </Stepper>
          </Paper>

          {/* Seção 4: Importação/Exportação */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <UploadFileIcon /> Importação e Exportação
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>📤 Exportar</Typography>
                <Typography variant="body2" paragraph>
                  Você pode exportar formulários nos seguintes formatos:
                </Typography>
                <List dense>
                  <ListItem><ListItemIcon><CodeIcon fontSize="small" /></ListItemIcon><ListItemText primary="JSON - Para backup ou transferência entre sistemas" /></ListItem>
                  <ListItem><ListItemIcon><TableRowsIcon fontSize="small" /></ListItemIcon><ListItemText primary="Excel/CSV - Para análise ou edição em planilhas" /></ListItem>
                  <ListItem><ListItemIcon><SchemaIcon fontSize="small" /></ListItemIcon><ListItemText primary="ZIP com todos os formulários - Backup completo" /></ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>📥 Importar</Typography>
                <Typography variant="body2" paragraph>
                  Formatos suportados para importação:
                </Typography>
                <List dense>
                  <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="JSON - Arquivo exportado pelo sistema" /></ListItem>
                  <ListItem><ListItemIcon><CheckCircleOutlineIcon fontSize="small" /></ListItemIcon><ListItemText primary="Excel/CSV - Planilha com as questões" /></ListItem>
                </List>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Modelo de Excel:</strong> Colunas: Pergunta, Tipo, Descrição, Obrigatória, Opções, Condicional, Condicional Base, Condicional Operador, Condicional Valor
                </Alert>
              </Grid>
            </Grid>
          </Paper>

          {/* Seção 5: Operadores Condicionais */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ConditionalIcon /> Operadores Condicionais
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                  <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 600 }}>==</Typography>
                  <Typography variant="body2">Igual a</Typography>
                  <Typography variant="caption" color="textSecondary">Ex: "Sim"</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                  <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 600 }}>!=</Typography>
                  <Typography variant="body2">Diferente de</Typography>
                  <Typography variant="caption" color="textSecondary">Ex: "Não"</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 600 }}>{'>'}</Typography>
                  <Typography variant="body2">Maior que</Typography>
                  <Typography variant="caption" color="textSecondary">Ex: 18</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                  <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 600 }}>{'<'}</Typography>
                  <Typography variant="body2">Menor que</Typography>
                  <Typography variant="caption" color="textSecondary">Ex: 60</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                  <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 600 }}>{'>='}</Typography>
                  <Typography variant="body2">Maior ou igual</Typography>
                  <Typography variant="caption" color="textSecondary">Ex: 100</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                  <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 600 }}>{'<='}</Typography>
                  <Typography variant="body2">Menor ou igual</Typography>
                  <Typography variant="caption" color="textSecondary">Ex: 500</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                  <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 600 }}>contains</Typography>
                  <Typography variant="body2">Contém</Typography>
                  <Typography variant="caption" color="textSecondary">Ex: "alergia"</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Seção 6: Exemplo de Planilha */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TableRowsIcon /> Exemplo de Planilha com Condicionais
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1000 }}>
                <TableHead sx={{ bgcolor: '#e8f5e9' }}>
                  <TableRow>
                    <TableCell><strong>Pergunta</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell><strong>Obrigatória</strong></TableCell>
                    <TableCell><strong>Opções</strong></TableCell>
                    <TableCell><strong>Condicional</strong></TableCell>
                    <TableCell><strong>Condicional Base</strong></TableCell>
                    <TableCell><strong>Condicional Operador</strong></TableCell>
                    <TableCell><strong>Condicional Valor</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Qual o seu nome completo?</TableCell>
                    <TableCell>Texto curto</TableCell>
                    <TableCell>Informe seu nome</TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Você utiliza produtos químicos?</TableCell>
                    <TableCell>Opção única</TableCell>
                    <TableCell></TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell>Sim;Não</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#fff3e0' }}>
                    <TableCell>Qual produto você utiliza?</TableCell>
                    <TableCell>Texto curto</TableCell>
                    <TableCell>Informe o produto</TableCell>
                    <TableCell>Não</TableCell>
                    <TableCell></TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell>Você utiliza produtos químicos?</TableCell>
                    <TableCell>==</TableCell>
                    <TableCell>Sim</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Qual o seu tipo de cabelo?</TableCell>
                    <TableCell>Lista suspensa</TableCell>
                    <TableCell></TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell>Liso;Ondulado;Cacheado;Crespo</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                    <TableCell>Qual o grau de ondulação?</TableCell>
                    <TableCell>Texto curto</TableCell>
                    <TableCell>Descreva o tipo</TableCell>
                    <TableCell>Não</TableCell>
                    <TableCell></TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell>Qual o seu tipo de cabelo?</TableCell>
                    <TableCell>contains</TableCell>
                    <TableCell>Cacheado;Crespo</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Assinatura digital</TableCell>
                    <TableCell>Assinatura</TableCell>
                    <TableCell>Confirme as informações</TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Importante:</strong> A pergunta base da condicional deve existir antes da questão condicional na planilha.
            </Alert>
          </Paper>

          {/* Seção 7: Exemplo JSON */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon /> Exemplo de Estrutura JSON com Condicional
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', overflowX: 'auto' }}>
              <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>
{`{
  "versao": "1.0",
  "tipo": "formulario_anamnese",
  "dataExportacao": "2024-01-15T10:30:00.000Z",
  "formulario": {
    "titulo": "Anamnese com Condicionais",
    "descricao": "Formulário completo com campos condicionais",
    "ativo": true,
    "obrigatorio": true,
    "tempoEstimado": 10,
    "questoes": [
      {
        "id": "q001",
        "pergunta": "Você utiliza produtos químicos?",
        "tipo": "radio",
        "opcoes": ["Sim", "Não"],
        "obrigatoria": true,
        "ordem": 0
      },
      {
        "id": "q002",
        "pergunta": "Qual produto você utiliza?",
        "tipo": "texto",
        "obrigatoria": false,
        "ordem": 1,
        "condicional": {
          "perguntaId": "q001",
          "operador": "==",
          "valor": "Sim"
        }
      },
      {
        "id": "q003",
        "pergunta": "Qual o seu tipo de cabelo?",
        "tipo": "select",
        "opcoes": ["Liso", "Ondulado", "Cacheado", "Crespo"],
        "obrigatoria": true,
        "ordem": 2
      },
      {
        "id": "q004",
        "pergunta": "Qual o grau de ondulação?",
        "tipo": "texto",
        "obrigatoria": false,
        "ordem": 3,
        "condicional": {
          "perguntaId": "q003",
          "operador": "contains",
          "valor": "Cacheado"
        }
      }
    ]
  }
}`}
              </pre>
            </Paper>
          </Paper>

          {/* Seção 8: Dicas e Boas Práticas */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff9e6' }}>
            <Typography variant="h6" sx={{ color: '#ff9800', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TipsIcon /> Dicas e Boas Práticas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>✅ Recomendações</Typography>
                <List dense>
                  <ListItem><ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon><ListItemText primary="Mantenha perguntas claras e objetivas" /></ListItem>
                  <ListItem><ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon><ListItemText primary="Limite a 10-15 questões para não cansar o cliente" /></ListItem>
                  <ListItem><ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon><ListItemText primary="Use campos condicionais para perguntas específicas" /></ListItem>
                  <ListItem><ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon><ListItemText primary="Teste o formulário antes de ativar" /></ListItem>
                  <ListItem><ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon><ListItemText primary="A pergunta base da condicional deve vir antes" /></ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>⚠️ O que evitar</Typography>
                <List dense>
                  <ListItem><ListItemIcon><WarningAmberIcon color="warning" /></ListItemIcon><ListItemText primary="Perguntas muito longas ou confusas" /></ListItem>
                  <ListItem><ListItemIcon><WarningAmberIcon color="warning" /></ListItemIcon><ListItemText primary="Excesso de campos obrigatórios" /></ListItem>
                  <ListItem><ListItemIcon><WarningAmberIcon color="warning" /></ListItemIcon><ListItemText primary="Condicionais muito complexas ou aninhadas" /></ListItem>
                  <ListItem><ListItemIcon><WarningAmberIcon color="warning" /></ListItemIcon><ListItemText primary="Esquecer de testar após criar" /></ListItem>
                  <ListItem><ListItemIcon><WarningAmberIcon color="warning" /></ListItemIcon><ListItemText primary="Referenciar perguntas que não existem" /></ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>

          {/* Seção 9: FAQ */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HelpIcon /> Perguntas Frequentes
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Como associar um formulário a um serviço?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Na aba "Configurações Gerais", use o campo "Serviços associados" para selecionar quais serviços utilizarão este formulário. Deixe em branco para todos os serviços.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Como criar um campo condicional?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Selecione a questão desejada, clique em "Adicionar condicional", escolha a pergunta base, o operador e o valor. A questão só aparecerá quando a condição for atendida.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Posso editar um formulário após criado?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Sim, você pode editar a qualquer momento. O sistema mantém o histórico de versões. Recomenda-se testar após alterações importantes.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Como importar um formulário de um arquivo Excel?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Clique em "Importar" e selecione o arquivo Excel. Certifique-se de que o arquivo tenha as colunas: Pergunta, Tipo, Descrição, Obrigatória, Opções, Condicional, Condicional Base, Condicional Operador, Condicional Valor. O sistema processará automaticamente as condicionais.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Quais operadores condicionais são suportados?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Os operadores suportados são: == (igual), != (diferente), {'>'} (maior), {'<'} (menor), {'>='} (maior ou igual), {'<='} (menor ou igual) e contains (contém).
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#9c27b0' }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
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
  
  // Estados para importação/exportação e manual
  const [openManualDialog, setOpenManualDialog] = useState(false);
  const [openInstrucoesDialog, setOpenInstrucoesDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importFormat, setImportFormat] = useState('json');
  
  // Estado do formulário
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

  // ============================================
  // FUNÇÕES DE IMPORTAÇÃO COM CONDICIONAIS
  // ============================================

  const mapearTipoQuestao = (tipo) => {
    const mapa = {
      'Texto curto': 'texto', 'Texto longo': 'textarea', 'Número': 'numero',
      'Data': 'data', 'Hora': 'hora', 'Lista suspensa': 'select',
      'Opção única': 'radio', 'Múltipla escolha': 'checkbox',
      'CPF': 'cpf', 'Telefone': 'telefone', 'CEP': 'cep',
      'Valor monetário': 'dinheiro', 'Assinatura': 'assinatura',
      'Upload de arquivo': 'arquivo', 'Upload de imagem': 'imagem',
      'Upload de PDF': 'pdf', 'Upload de vídeo': 'video'
    };
    return mapa[tipo] || 'texto';
  };

  const mapearOperador = (operador) => {
    const mapa = { '==': '==', '!=': '!=', '>': '>', '<': '<', '>=': '>=', '<=': '<=', 'contains': 'contains' };
    return mapa[operador] || '==';
  };

  const processarImportacao = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let dados;
        if (file.name.endsWith('.json')) {
          dados = JSON.parse(e.target.result);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const questoes = XLSX.utils.sheet_to_json(sheet);
          
          const questoesProcessadas = questoes.map((q, idx) => {
            const questao = {
              id: `q${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 6)}`,
              tipo: mapearTipoQuestao(q.Tipo || q.tipo || 'texto'),
              pergunta: q.Pergunta || q.pergunta || '',
              descricao: q.Descrição || q.descricao || '',
              obrigatoria: (q.Obrigatória || q.obrigatoria) === 'Sim',
              opcoes: (q.Opções || q.opcoes || '').split(';').map(o => o.trim()).filter(o => o),
              ordem: idx
            };
            
            const isCondicional = q.Condicional === 'Sim' || q.condicional === 'Sim';
            if (isCondicional && (q['Condicional Base'] || q.condicionalBase)) {
              questao.condicional = {
                perguntaTexto: q['Condicional Base'] || q.condicionalBase,
                operador: mapearOperador(q['Condicional Operador'] || q.condicionalOperador || '=='),
                valor: q['Condicional Valor'] || q.condicionalValor || ''
              };
            }
            return questao;
          });
          
          dados = {
            versao: '1.0',
            tipo: 'formulario_anamnese',
            formulario: { 
              titulo: file.name.replace(/\.(xlsx|xls|json)$/, ''), 
              questoes: questoesProcessadas 
            }
          };
        }
        
        if (dados && dados.formulario) {
          setImportPreview(dados.formulario);
          mostrarSnackbar('Arquivo carregado com sucesso! Clique em "Confirmar Importação" para finalizar.');
        } else {
          mostrarSnackbar('Formato de arquivo inválido', 'error');
        }
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        mostrarSnackbar('Erro ao processar arquivo: ' + error.message, 'error');
      }
    };
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const confirmarImportacao = async () => {
    if (!importPreview) return;
    
    try {
      // Resolver condicionais - converter texto da pergunta para ID
      const questoesComIds = importPreview.questoes.map((q, idx) => {
        const novaQuestao = {
          ...q,
          id: `q${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 6)}`,
          ordem: idx
        };
        
        // Se tem condicional, buscar o ID da pergunta base
        if (novaQuestao.condicional && novaQuestao.condicional.perguntaTexto) {
          const perguntaBase = importPreview.questoes.find(qb => 
            qb.pergunta === novaQuestao.condicional.perguntaTexto
          );
          if (perguntaBase && perguntaBase.id) {
            novaQuestao.condicional = {
              perguntaId: perguntaBase.id,
              operador: novaQuestao.condicional.operador,
              valor: novaQuestao.condicional.valor
            };
          } else {
            delete novaQuestao.condicional;
            console.warn(`Condicional ignorada: pergunta base "${novaQuestao.condicional.perguntaTexto}" não encontrada`);
          }
        }
        
        return novaQuestao;
      });
      
      const novoFormulario = {
        ...importPreview,
        titulo: importPreview.titulo || `Importado_${new Date().toISOString().slice(0, 19)}`,
        questoes: questoesComIds,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        versao: 1
      };
      
      await firebaseService.add('formularios_anamnese', novoFormulario);
      mostrarSnackbar('Formulário importado com sucesso!');
      setOpenImportDialog(false);
      setImportPreview(null);
      setImportFile(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao importar:', error);
      mostrarSnackbar('Erro ao importar formulário', 'error');
    }
  };

  // ============================================
  // FUNÇÕES DE EXPORTAÇÃO
  // ============================================

  const exportarParaJSON = (formulario) => {
    try {
      const dados = {
        versao: '1.0',
        tipo: 'formulario_anamnese',
        dataExportacao: new Date().toISOString(),
        formulario: {
          ...formulario,
          id: undefined,
          criadoEm: undefined,
          atualizadoEm: undefined
        }
      };
      
      const jsonString = JSON.stringify(dados, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formulario.titulo.replace(/[^a-z0-9]/gi, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      mostrarSnackbar('Formulário exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar formulário', 'error');
    }
  };

  const exportarParaCSV = (formulario) => {
    try {
      const questoesFormatadas = formulario.questoes.map((q, idx) => ({
        'Ordem': idx + 1,
        'Pergunta': q.pergunta,
        'Descrição': q.descricao || '',
        'Tipo': tiposQuestao.find(t => t.value === q.tipo)?.label || q.tipo,
        'Obrigatória': q.obrigatoria ? 'Sim' : 'Não',
        'Opções': Array.isArray(q.opcoes) ? q.opcoes.join('; ') : '',
        'Tem Condicional': q.condicional ? 'Sim' : 'Não',
        'Condicional Base': q.condicional ? (formulario.questoes.find(qb => qb.id === q.condicional.perguntaId)?.pergunta || '') : '',
        'Condicional Operador': q.condicional?.operador || '',
        'Condicional Valor': q.condicional?.valor || ''
      }));

      const ws = XLSX.utils.json_to_sheet(questoesFormatadas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Questões');
      
      const infoFormulario = [{
        'Campo': 'Título',
        'Valor': formulario.titulo
      }, {
        'Campo': 'Descrição',
        'Valor': formulario.descricao || ''
      }, {
        'Campo': 'Serviços',
        'Valor': formulario.servicoIds?.join(', ') || 'Todos'
      }, {
        'Campo': 'Tempo Estimado',
        'Valor': `${formulario.tempoEstimado || 5} minutos`
      }, {
        'Campo': 'Status',
        'Valor': formulario.ativo ? 'Ativo' : 'Inativo'
      }, {
        'Campo': 'Obrigatório',
        'Valor': formulario.obrigatorio ? 'Sim' : 'Não'
      }, {
        'Campo': 'Total de Questões',
        'Valor': formulario.questoes?.length || 0
      }, {
        'Campo': 'Questões com Condicional',
        'Valor': formulario.questoes?.filter(q => q.condicional).length || 0
      }];
      
      const wsInfo = XLSX.utils.json_to_sheet(infoFormulario);
      XLSX.utils.book_append_sheet(wb, wsInfo, 'Informações');
      
      XLSX.writeFile(wb, `${formulario.titulo.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
      mostrarSnackbar('Formulário exportado para Excel!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      mostrarSnackbar('Erro ao exportar para Excel', 'error');
    }
  };

  const exportarTodos = async () => {
    try {
      const zip = new JSZip();
      
      for (const formulario of formularios) {
        const dados = {
          versao: '1.0',
          tipo: 'formulario_anamnese',
          dataExportacao: new Date().toISOString(),
          formulario: {
            ...formulario,
            id: undefined,
            criadoEm: undefined,
            atualizadoEm: undefined
          }
        };
        
        const jsonString = JSON.stringify(dados, null, 2);
        zip.file(`${formulario.titulo.replace(/[^a-z0-9]/gi, '_')}.json`, jsonString);
      }
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formularios_anamnese_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      mostrarSnackbar(`${formularios.length} formulários exportados com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar todos:', error);
      mostrarSnackbar('Erro ao exportar formulários', 'error');
    }
  };

  // ============================================
  // FUNÇÕES CRUD (MANTIDAS COMPLETAS)
  // ============================================

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

  const removerQuestao = (index) => {
    const novasQuestoes = formData.questoes.filter((_, i) => i !== index);
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  const atualizarQuestao = (index, campo, valor) => {
    const novasQuestoes = [...formData.questoes];
    
    if (campo === 'tipo') {
      const novoTipo = valor;
      const questao = novasQuestoes[index];
      
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
      
      questao.condicional = null;
      questao.calculado = null;
    }
    
    novasQuestoes[index][campo] = valor === undefined ? null : valor;
    
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  const adicionarOpcao = (index) => {
    const novasQuestoes = [...formData.questoes];
    if (!novasQuestoes[index].opcoes) {
      novasQuestoes[index].opcoes = [];
    }
    novasQuestoes[index].opcoes.push(`Opção ${novasQuestoes[index].opcoes.length + 1}`);
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  const moverQuestaoCima = (index) => {
    if (index === 0) return;
    const novasQuestoes = [...formData.questoes];
    [novasQuestoes[index - 1], novasQuestoes[index]] = [novasQuestoes[index], novasQuestoes[index - 1]];
    novasQuestoes.forEach((q, i) => { q.ordem = i; });
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  const moverQuestaoBaixo = (index) => {
    if (index === formData.questoes.length - 1) return;
    const novasQuestoes = [...formData.questoes];
    [novasQuestoes[index + 1], novasQuestoes[index]] = [novasQuestoes[index], novasQuestoes[index + 1]];
    novasQuestoes.forEach((q, i) => { q.ordem = i; });
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  const duplicarQuestao = (index) => {
    const questao = { 
      ...formData.questoes[index], 
      id: `q${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pergunta: `${questao.pergunta} (cópia)`
    };
    const novasQuestoes = [...formData.questoes];
    novasQuestoes.splice(index + 1, 0, questao);
    novasQuestoes.forEach((q, i) => { q.ordem = i; });
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  const handleOpenCondicional = (index) => {
    setQuestaoCondicional({ index, ...formData.questoes[index] });
    setOpenCondicionalDialog(true);
  };

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

      const dadosParaSalvar = limparObjeto({
        ...formData,
        criadoEm: formularioEditando ? formularioEditando.criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        versao: formularioEditando ? (formularioEditando.versao || 1) + 1 : 1
      });

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
      mostrarSnackbar('Erro ao salvar formulário: ' + error.message, 'error');
    }
  };

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

  const handlePreview = (formulario) => {
    setFormularioPreview(formulario);
    setOpenPreviewDialog(true);
  };

  const renderizarCampoPreview = (questao) => {
    const { tipo, pergunta, obrigatoria, placeholder, opcoes } = questao;
    
    switch(tipo) {
      case 'texto':
        return <TextField fullWidth size="small" placeholder={placeholder || 'Digite aqui...'} label={pergunta} required={obrigatoria} disabled />;
      case 'textarea':
        return <TextField fullWidth multiline rows={3} placeholder={placeholder || 'Digite aqui...'} label={pergunta} required={obrigatoria} disabled />;
      case 'numero':
        return <TextField type="number" fullWidth size="small" placeholder={placeholder || '0'} label={pergunta} required={obrigatoria} disabled />;
      case 'data':
        return <TextField type="date" fullWidth size="small" label={pergunta} InputLabelProps={{ shrink: true }} required={obrigatoria} disabled />;
      case 'hora':
        return <TextField type="time" fullWidth size="small" label={pergunta} InputLabelProps={{ shrink: true }} required={obrigatoria} disabled />;
      case 'select':
      case 'radio':
        return (
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">{pergunta} {obrigatoria && '*'}</FormLabel>
            <RadioGroup>
              {opcoes?.map((op, i) => <FormControlLabel key={i} value={op} control={<Radio disabled />} label={op} />)}
            </RadioGroup>
          </FormControl>
        );
      case 'multiselect':
      case 'checkbox':
        return (
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">{pergunta} {obrigatoria && '*'}</FormLabel>
            <FormGroup>
              {opcoes?.map((op, i) => <FormControlLabel key={i} control={<Checkbox disabled />} label={op} />)}
            </FormGroup>
          </FormControl>
        );
      case 'cpf':
      case 'cnpj':
      case 'telefone':
      case 'cep':
        return <MaskedInputCustom mask={tipo === 'cpf' ? '999.999.999-99' : tipo === 'telefone' ? '(99) 99999-9999' : '99999-999'} label={pergunta} required={obrigatoria} disabled />;
      case 'dinheiro':
        return <TextField fullWidth size="small" label={pergunta} required={obrigatoria} InputProps={{ inputComponent: NumericFormatCustom }} disabled />;
      case 'assinatura':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>{pergunta} {obrigatoria && '*'}</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">[Área para assinatura digital]</Typography>
            </Paper>
          </Box>
        );
      default:
        return <TextField fullWidth size="small" label={pergunta} required={obrigatoria} disabled />;
    }
  };

  const formulariosFiltrados = formularios.filter(f => 
    f.titulo?.toLowerCase().includes(filtro.toLowerCase()) ||
    f.descricao?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return <Box sx={{ width: '100%' }}><LinearProgress /></Box>;
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Formulários de Anamnese
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Crie formulários avançados com campos condicionais, calculados e muito mais
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<BookIcon />} onClick={() => setOpenInstrucoesDialog(true)}>
            Manual
          </Button>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setOpenImportDialog(true)}>
            Importar
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportarTodos}>
            Exportar Todos
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)' }}>
            Novo Formulário
          </Button>
        </Box>
      </Box>

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}><AssignmentIcon /></Avatar>
                <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>{formularios.length}</Typography><Typography variant="body2" color="textSecondary">Total de Formulários</Typography></Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}><QuizIcon /></Avatar>
                <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>{formularios.reduce((acc, f) => acc + (f.questoes?.length || 0), 0)}</Typography><Typography variant="body2" color="textSecondary">Total de Questões</Typography></Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}><ConditionalIcon /></Avatar>
                <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>{formularios.reduce((acc, f) => acc + (f.questoes?.filter(q => q.condicional).length || 0), 0)}</Typography><Typography variant="body2" color="textSecondary">Campos Condicionais</Typography></Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}><TurnedInIcon /></Avatar>
                <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>{formularios.filter(f => f.ativo).length}</Typography><Typography variant="body2" color="textSecondary">Formulários Ativos</Typography></Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtro */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar formulários por título ou descrição..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
              endAdornment: filtro && (<InputAdornment position="end"><IconButton size="small" onClick={() => setFiltro('')}><ClearIcon /></IconButton></InputAdornment>),
            }}
          />
        </CardContent>
      </Card>

      {/* Tabela de Formulários */}
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
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{form.titulo}</Typography>
                        <Typography variant="caption" color="textSecondary">{form.descricao?.substring(0, 50)}{form.descricao?.length > 50 ? '...' : ''}</Typography>
                        {form.tags?.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {form.tags.slice(0, 2).map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {servicosAssociados.length > 0 ? (
                            servicosAssociados.slice(0, 2).map(s => <Chip key={s.id} label={s.nome} size="small" variant="outlined" />)
                          ) : <Typography variant="caption" color="textSecondary">Todos os serviços</Typography>}
                          {servicosAssociados.length > 2 && <Chip label={`+${servicosAssociados.length - 2}`} size="small" />}
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={form.questoes?.length || 0} size="small" color="primary" /></TableCell>
                      <TableCell>{condicionais > 0 ? <Chip label={condicionais} size="small" color="warning" /> : '-'}</TableCell>
                      <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ScheduleIcon fontSize="small" color="action" /><Typography variant="body2">{form.tempoEstimado || 5} min</Typography></Box></TableCell>
                      <TableCell><Chip label={form.ativo ? 'Ativo' : 'Inativo'} size="small" color={form.ativo ? 'success' : 'error'} /></TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Visualizar"><IconButton size="small" onClick={() => handlePreview(form)} sx={{ color: '#2196f3' }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Exportar"><IconButton size="small" onClick={() => exportarParaJSON(form)} sx={{ color: '#4caf50' }}><DownloadIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Duplicar"><IconButton size="small" onClick={() => handleDuplicar(form)} sx={{ color: '#4caf50' }}><CopyIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Editar"><IconButton size="small" onClick={() => handleOpenDialog(form)} sx={{ color: '#ff4081' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Excluir"><IconButton size="small" onClick={() => handleExcluir(form)} sx={{ color: '#f44336' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {formulariosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">Nenhum formulário encontrado</Typography>
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

      {/* Dialog de Instruções */}
      <InstrucoesImportacao open={openInstrucoesDialog} onClose={() => setOpenInstrucoesDialog(false)} />

      {/* Dialog de Importação */}
      <Dialog open={openImportDialog} onClose={() => setOpenImportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white' }}>
          <UploadFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Importar Formulário
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Formatos suportados:</strong> JSON (.json) e Excel (.xlsx, .xls)<br />
              Para Excel, utilize as colunas: <strong>Pergunta, Tipo, Descrição, Obrigatória, Opções, Condicional, Condicional Base, Condicional Operador, Condicional Valor</strong>
            </Alert>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
              sx={{ py: 2, mb: 3 }}
            >
              Selecionar arquivo
              <input
                type="file"
                hidden
                accept=".json,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImportFile(file);
                    processarImportacao(file);
                  }
                }}
              />
            </Button>

            {importFile && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Arquivo selecionado: {importFile.name}
              </Alert>
            )}

            {importPreview && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Pré-visualização do formulário a ser importado:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Título: {importPreview.titulo}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {importPreview.questoes?.length || 0} questões
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {importPreview.questoes?.slice(0, 5).map((q, i) => (
                      <Typography key={i} variant="body2" sx={{ py: 0.5 }}>
                        {i + 1}. {q.pergunta}
                        {q.condicional && <Chip label="Condicional" size="small" color="warning" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />}
                      </Typography>
                    ))}
                    {importPreview.questoes?.length > 5 && (
                      <Typography variant="caption" color="textSecondary">
                        ... e mais {importPreview.questoes.length - 5} questões
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>Cancelar</Button>
          <Button
            onClick={confirmarImportacao}
            variant="contained"
            disabled={!importPreview}
            sx={{ bgcolor: '#4caf50' }}
          >
            Confirmar Importação
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
