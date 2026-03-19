// src/pages/ClienteAnamnese.js
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
  CircularProgress,
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  MobileStepper,
  FormHelperText,
  Slider,
  Rating,
  Switch,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Badge,
  Autocomplete,
  Collapse,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Zoom,
  Fade,
  Grow,
  Slide,
  Modal,
  Backdrop,
  Popper,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  ButtonGroup,
  Stack,
  AlertTitle,
  CardHeader,
  CardMedia,
  CardActions,
  Collapse as MuiCollapse,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Person as PersonIcon,
  CloudUpload as CloudUploadIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  AttachMoney as MoneyIcon,
  Numbers as NumbersIcon,
  Tag as TagIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Brush as BrushIcon,
  Signature as SignatureIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FileUpload as FileUploadIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { NumericFormat } from 'react-number-format';
import InputMask from 'react-input-mask';
import SignatureCanvas from 'react-signature-canvas';

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

const MaskedInputCustom = ({ mask, value, onChange, disabled, ...props }) => {
  return (
    <InputMask
      mask={mask}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      maskChar={null}
    >
      {(inputProps) => <TextField {...inputProps} {...props} fullWidth size="small" />}
    </InputMask>
  );
};

// ============================================
// COMPONENTE DE ASSINATURA
// ============================================

const SignaturePad = ({ value, onChange, disabled, perguntaId }) => {
  const [sigPad, setSigPad] = useState(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [preview, setPreview] = useState(value);

  useEffect(() => {
    if (value) {
      setHasSignature(true);
      setPreview(value);
    }
  }, [value]);

  const clear = () => {
    if (sigPad) {
      sigPad.clear();
      setHasSignature(false);
      setPreview(null);
      onChange('');
    }
  };

  const save = () => {
    if (sigPad && !sigPad.isEmpty()) {
      const dataUrl = sigPad.getCanvas().toDataURL('image/png');
      setHasSignature(true);
      setPreview(dataUrl);
      onChange(dataUrl);
    }
  };

  return (
    <Box>
      {!disabled ? (
        <>
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
                  cursor: 'crosshair'
                }
              }}
              onEnd={save}
            />
          </Paper>
          <Button
            size="small"
            onClick={clear}
            sx={{ mt: 1 }}
            startIcon={<DeleteIcon />}
          >
            Limpar assinatura
          </Button>
          {hasSignature && (
            <Typography variant="caption" color="success.main" sx={{ ml: 2 }}>
              ✓ Assinatura capturada
            </Typography>
          )}
        </>
      ) : (
        preview && (
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src={preview} 
              alt="Assinatura" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '150px', 
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }} 
            />
          </Box>
        )
      )}
    </Box>
  );
};

// ============================================
// COMPONENTE DE UPLOAD DE ARQUIVO
// ============================================

const FileUploadField = ({ perguntaId, value, onChange, disabled, accept = "*/*", multiple = false }) => {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value && typeof value === 'string') {
      // Se for URL ou base64
      setFiles([{ name: 'Arquivo carregado', url: value }]);
    } else if (Array.isArray(value)) {
      setFiles(value);
    }
  }, [value]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Aqui você implementaria o upload para storage
    // Por enquanto, apenas salvamos os nomes
    const fileInfos = selectedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }));

    if (multiple) {
      onChange([...files, ...fileInfos]);
    } else {
      onChange(fileInfos[0]);
      setFiles([fileInfos[0]]);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (newFiles.length === 0) {
      onChange(null);
    } else if (multiple) {
      onChange(newFiles);
    } else {
      onChange(newFiles[0]);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        id={`upload-${perguntaId}`}
        onChange={handleFileChange}
        disabled={disabled}
      />
      <label htmlFor={`upload-${perguntaId}`}>
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={disabled}
          sx={{ mb: 2 }}
        >
          Selecionar arquivo{multiple && 's'}
        </Button>
      </label>

      {files.length > 0 && (
        <List dense>
          {files.map((file, index) => (
            <ListItem
              key={index}
              secondaryAction={
                !disabled && (
                  <IconButton edge="end" onClick={() => removeFile(index)}>
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <ListItemIcon>
                {file.type?.startsWith('image/') ? (
                  <ImageIcon />
                ) : file.type === 'application/pdf' ? (
                  <PdfIcon />
                ) : (
                  <DescriptionIcon />
                )}
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function ClienteAnamnese() {
  console.log('🔥 ClienteAnamnese MONTADO - INÍCIO');
  
  const navigate = useNavigate();
  const params = useParams();
  const { atendimentoId, agendamentoId } = params;
  const auth = useAuthCliente();
  const { cliente, firebaseUser } = auth;

  console.log('📌 Parâmetros completos:', params);
  console.log('📌 atendimentoId:', atendimentoId);
  console.log('📌 agendamentoId:', agendamentoId);
  console.log('📌 Cliente do contexto:', cliente);
  console.log('📌 FirebaseUser:', firebaseUser);
  
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [atendimento, setAtendimento] = useState(null);
  const [formulario, setFormulario] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [validacao, setValidacao] = useState({});
  const [camposCondicionais, setCamposCondicionais] = useState({});

  // Determinar qual ID usar
  const entityId = atendimentoId || agendamentoId;
  const entityType = atendimentoId ? 'atendimento' : 'agendamento';

  useEffect(() => {
    console.log('📌 useEffect executado - entityId:', entityId);
    if (entityId) {
      carregarDados();
    } else {
      console.error('❌ entityId não definido');
      toast.error('ID não encontrado');
      setLoading(false);
    }
  }, [entityId]);

  // Efeito para verificar campos condicionais quando as respostas mudam
  useEffect(() => {
    if (formulario) {
      verificarCamposCondicionais();
    }
  }, [respostas, formulario]);

  const buscarServicoNome = async (servicoId) => {
    try {
      console.log('🔍 Buscando nome do serviço para ID:', servicoId);
      const servico = await firebaseService.getById('servicos', servicoId);
      console.log('✅ Serviço encontrado:', servico);
      return servico?.nome || 'Serviço';
    } catch (error) {
      console.error('❌ Erro ao buscar nome do serviço:', error);
      return 'Serviço';
    }
  };

  const carregarDados = async () => {
    console.log('📥 INÍCIO carregarDados para entityId:', entityId);
    console.log('🔍 entityType:', entityType);
    
    try {
      setLoading(true);
      console.log('⏳ Loading set to true');
      
      let atendimentoData;
      
      if (entityType === 'atendimento') {
        console.log('🔍 Buscando atendimento com ID:', entityId);
        atendimentoData = await firebaseService.getById('atendimentos', entityId);
        console.log('✅ Atendimento encontrado:', atendimentoData);
      } else {
        console.log('🔍 Buscando agendamento com ID:', entityId);
        const agendamento = await firebaseService.getById('agendamentos', entityId);
        console.log('✅ Agendamento encontrado:', agendamento);
        
        if (!agendamento) {
          console.error('❌ Agendamento não encontrado');
          toast.error('Agendamento não encontrado');
          setLoading(false);
          return;
        }
        
        console.log('🔍 Verificando atendimentos existentes para este agendamento...');
        const atendimentosExistentes = await firebaseService.query('atendimentos', [
          { field: 'agendamentoId', operator: '==', value: entityId }
        ]).catch(() => []);
        console.log('✅ Atendimentos existentes:', atendimentosExistentes);
        
        if (atendimentosExistentes.length > 0) {
          console.log('🔄 Redirecionando para atendimento:', atendimentosExistentes[0].id);
          navigate(`/cliente/atendimento/${atendimentosExistentes[0].id}/anamnese`, { replace: true });
          return;
        }
        
        console.log('🔍 Buscando nome do serviço...');
        const servicoNome = agendamento.servicoNome || (await buscarServicoNome(agendamento.servicoId));
        console.log('✅ Nome do serviço:', servicoNome);
        
        atendimentoData = {
          id: agendamento.id,
          agendamentoId: agendamento.id,
          clienteId: agendamento.clienteId,
          profissionalId: agendamento.profissionalId,
          profissionalNome: agendamento.profissionalNome,
          servicoId: agendamento.servicoId,
          servicoNome: servicoNome,
          data: agendamento.data,
          horaInicio: agendamento.horario,
        };
      }

      setAtendimento(atendimentoData);
      console.log('✅ atendimentoData setado:', atendimentoData);

      if (!atendimentoData) {
        console.error('❌ atendimentoData é null');
        toast.error('Atendimento não encontrado');
        setLoading(false);
        return;
      }

      // Verificar se já existe resposta
      console.log('🔍 Verificando respostas existentes...');
      let respostasExistentes = [];
      
      try {
        if (atendimentoData.agendamentoId) {
          respostasExistentes = await firebaseService.query('respostas_anamnese', [
            { field: 'agendamentoId', operator: '==', value: atendimentoData.agendamentoId }
          ]);
        } else {
          respostasExistentes = await firebaseService.query('respostas_anamnese', [
            { field: 'atendimentoId', operator: '==', value: atendimentoData.id }
          ]);
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar respostas (ignorado):', error.message);
      }
      
      console.log('✅ Respostas existentes:', respostasExistentes);

      if (respostasExistentes.length > 0) {
        console.log('🔄 Redirecionando para visualização da resposta:', respostasExistentes[0].id);
        navigate(`/cliente/anamnese/${respostasExistentes[0].id}`);
        return;
      }

      // Buscar formulários associados ao serviço
      console.log('🔍 Buscando formulários para serviço:', atendimentoData.servicoId);
      const formularios = await firebaseService.query('formularios_anamnese', [
        { field: 'servicoIds', operator: 'array-contains', value: atendimentoData.servicoId },
        { field: 'ativo', operator: '==', value: true }
      ]).catch(() => []);
      console.log('✅ Formulários encontrados:', formularios.length);
      console.log('📋 Detalhes dos formulários:', formularios);

      if (formularios.length > 0) {
        console.log('📋 Formulário selecionado:', formularios[0]);
        setFormulario(formularios[0]);
        
        // Inicializar respostas vazias
        const respostasIniciais = {};
        formularios[0].questoes?.forEach(q => {
          if (q.tipo === 'checkbox' || q.tipo === 'multiselect') {
            respostasIniciais[q.id] = [];
          } else {
            respostasIniciais[q.id] = '';
          }
        });
        setRespostas(respostasIniciais);
      } else {
        console.log('⚠️ Nenhum formulário encontrado para este serviço');
      }

    } catch (error) {
      console.error('❌ ERRO em carregarDados:', error);
      console.error('Stack trace:', error.stack);
      toast.error('Erro ao carregar formulário: ' + error.message);
    } finally {
      console.log('⏳ Finalizando carregamento - setLoading(false)');
      setLoading(false);
    }
  };

  // Verificar campos condicionais
  const verificarCamposCondicionais = () => {
    const visiveis = {};
    
    formulario.questoes?.forEach(questao => {
      if (questao.condicional) {
        const perguntaBase = formulario.questoes.find(q => q.id === questao.condicional.perguntaId);
        if (perguntaBase) {
          const valorBase = respostas[perguntaBase.id]?.valor;
          const condicional = questao.condicional;
          
          let condicaoAtendida = false;
          
          switch(condicional.operador) {
            case '==':
              condicaoAtendida = valorBase == condicional.valor;
              break;
            case '!=':
              condicaoAtendida = valorBase != condicional.valor;
              break;
            case '>':
              condicaoAtendida = parseFloat(valorBase) > parseFloat(condicional.valor);
              break;
            case '<':
              condicaoAtendida = parseFloat(valorBase) < parseFloat(condicional.valor);
              break;
            case '>=':
              condicaoAtendida = parseFloat(valorBase) >= parseFloat(condicional.valor);
              break;
            case '<=':
              condicaoAtendida = parseFloat(valorBase) <= parseFloat(condicional.valor);
              break;
            case 'contains':
              condicaoAtendida = Array.isArray(valorBase) && valorBase.includes(condicional.valor);
              break;
            default:
              condicaoAtendida = true;
          }
          
          visiveis[questao.id] = condicaoAtendida;
        }
      } else {
        visiveis[questao.id] = true;
      }
    });
    
    setCamposCondicionais(visiveis);
  };

  const handleRespostaChange = (perguntaId, value, tipo) => {
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: {
        perguntaId,
        valor: value,
        tipo
      }
    }));

    const questao = formulario?.questoes?.find(q => q.id === perguntaId);
    if (questao?.obrigatoria) {
      setValidacao(prev => ({
        ...prev,
        [perguntaId]: !!value && (Array.isArray(value) ? value.length > 0 : true)
      }));
    }
  };

  const handleFileUpload = async (perguntaId, file) => {
    // Implementar upload para storage
    console.log('Upload de arquivo:', file);
    
    // Simular upload (substituir por implementação real)
    const fakeUrl = URL.createObjectURL(file);
    handleRespostaChange(perguntaId, fakeUrl, 'arquivo');
  };

  const validarFormulario = () => {
    if (!formulario) return false;
    
    const novosErros = {};
    let valido = true;
    
    formulario.questoes?.forEach(questao => {
      // Só validar se o campo estiver visível (condicional)
      if (camposCondicionais[questao.id] !== false && questao.obrigatoria) {
        const resposta = respostas[questao.id]?.valor;
        if (!resposta || (Array.isArray(resposta) && resposta.length === 0)) {
          novosErros[questao.id] = false;
          valido = false;
        } else {
          novosErros[questao.id] = true;
        }
      }
    });

    setValidacao(novosErros);
    return valido;
  };

  const handleProximo = () => {
    if (!formulario) return;
    
    if (activeStep === formulario.questoes.length - 1) {
      if (validarFormulario()) {
        handleEnviar();
      } else {
        toast.error('Preencha todos os campos obrigatórios');
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleAnterior = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleEnviar = async () => {
    try {
      setEnviando(true);

      const uid = firebaseUser?.uid || cliente?.id;

      // Filtrar apenas campos visíveis
      const respostasVisiveis = Object.entries(respostas).filter(([perguntaId]) => 
        camposCondicionais[perguntaId] !== false
      );

      const respostasFormatadas = respostasVisiveis.map(([perguntaId, data]) => {
        const questao = formulario.questoes?.find(q => q.id === perguntaId);
        return {
          perguntaId,
          pergunta: questao?.pergunta || '',
          resposta: data.valor || '',
          tipo: data.tipo || ''
        };
      });

      const dadosResposta = {
        formularioId: formulario.id || '',
        formularioTitulo: formulario.titulo || '',
        clienteId: uid || '',
        clienteNome: cliente?.nome || 'Cliente',
        profissionalId: atendimento?.profissionalId || '',
        profissionalNome: atendimento?.profissionalNome || 'Não informado',
        servicoId: atendimento?.servicoId || '',
        servicoNome: atendimento?.servicoNome || 'Serviço',
        status: 'respondido',
        respostas: respostasFormatadas,
        respondidoEm: new Date().toISOString(),
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now()
      };

      if (atendimento?.agendamentoId) {
        dadosResposta.agendamentoId = atendimento.agendamentoId;
      } else {
        dadosResposta.atendimentoId = atendimento?.id || '';
      }

      console.log('📤 Enviando dados:', dadosResposta);
      
      await firebaseService.add('respostas_anamnese', dadosResposta);

      setSnackbar({
        open: true,
        message: 'Formulário enviado com sucesso!',
        severity: 'success'
      });
      
      toast.success('Formulário enviado com sucesso!');
      
      setTimeout(() => {
        navigate('/cliente/anamnese');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao enviar formulário:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao enviar formulário',
        severity: 'error'
      });
      toast.error('Erro ao enviar formulário');
    } finally {
      setEnviando(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    try {
      return format(new Date(data + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleVoltar = () => {
    navigate('/cliente/anamnese');
  };

  // Renderizar campo baseado no tipo
  const renderizarCampo = (questao) => {
    const { id, tipo, pergunta, obrigatoria, placeholder, opcoes, valorMinimo, valorMaximo, passo, mascara } = questao;
    const valor = respostas[id]?.valor || '';
    const erro = validacao[id] === false;
    const visivel = camposCondicionais[id] !== false;

    if (!visivel) return null;

    // Campos básicos
    if (tipo === 'texto') {
      return (
        <TextField
          fullWidth
          size="small"
          placeholder={placeholder || 'Digite aqui...'}
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          error={erro}
          helperText={erro && 'Campo obrigatório'}
        />
      );
    }

    if (tipo === 'textarea') {
      return (
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder={placeholder || 'Digite aqui...'}
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          error={erro}
          helperText={erro && 'Campo obrigatório'}
        />
      );
    }

    if (tipo === 'numero') {
      return (
        <TextField
          type="number"
          fullWidth
          size="small"
          placeholder={placeholder || '0'}
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          error={erro}
          helperText={erro && 'Campo obrigatório'}
          InputProps={{
            inputProps: { 
              min: valorMinimo !== null ? valorMinimo : undefined,
              max: valorMaximo !== null ? valorMaximo : undefined,
              step: passo !== null ? passo : undefined
            },
            startAdornment: <NumbersIcon color="action" sx={{ mr: 1 }} />
          }}
        />
      );
    }

    if (tipo === 'data') {
      return (
        <TextField
          type="date"
          fullWidth
          size="small"
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          error={erro}
          helperText={erro && 'Campo obrigatório'}
          InputLabelProps={{ shrink: true }}
        />
      );
    }

    if (tipo === 'hora') {
      return (
        <TextField
          type="time"
          fullWidth
          size="small"
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          error={erro}
          helperText={erro && 'Campo obrigatório'}
          InputLabelProps={{ shrink: true }}
        />
      );
    }

    // Campos de seleção
    if (tipo === 'select') {
      return (
        <FormControl fullWidth size="small" error={erro}>
          <InputLabel>Selecione uma opção</InputLabel>
          <Select
            value={valor}
            label="Selecione uma opção"
            onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          >
            <MenuItem value="">Selecione...</MenuItem>
            {opcoes?.map((op, i) => (
              <MenuItem key={i} value={op}>{op}</MenuItem>
            ))}
          </Select>
          {erro && <FormHelperText>Campo obrigatório</FormHelperText>}
        </FormControl>
      );
    }

    if (tipo === 'multiselect') {
      return (
        <FormControl fullWidth size="small" error={erro}>
          <InputLabel>Selecione opções</InputLabel>
          <Select
            multiple
            value={valor || []}
            label="Selecione opções"
            onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {opcoes?.map((op, i) => (
              <MenuItem key={i} value={op}>
                <Checkbox checked={valor?.includes(op) || false} />
                <ListItemText primary={op} />
              </MenuItem>
            ))}
          </Select>
          {erro && <FormHelperText>Campo obrigatório</FormHelperText>}
        </FormControl>
      );
    }

    if (tipo === 'radio') {
      return (
        <FormControl component="fieldset" error={erro}>
          <RadioGroup
            value={valor}
            onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          >
            {opcoes?.map((op, i) => (
              <FormControlLabel key={i} value={op} control={<Radio />} label={op} />
            ))}
          </RadioGroup>
          {erro && <FormHelperText>Campo obrigatório</FormHelperText>}
        </FormControl>
      );
    }

    if (tipo === 'checkbox') {
      return (
        <FormControl component="fieldset" error={erro}>
          <FormGroup>
            {opcoes?.map((op, i) => {
              const valores = valor || [];
              return (
                <FormControlLabel
                  key={i}
                  control={
                    <Checkbox
                      checked={valores.includes(op)}
                      onChange={(e) => {
                        const novosValores = e.target.checked
                          ? [...valores, op]
                          : valores.filter(v => v !== op);
                        handleRespostaChange(id, novosValores, tipo);
                      }}
                    />
                  }
                  label={op}
                />
              );
            })}
          </FormGroup>
          {erro && <FormHelperText>Campo obrigatório</FormHelperText>}
        </FormControl>
      );
    }

    // Campos com máscara
    if (tipo === 'cpf') {
      return (
        <MaskedInputCustom
          mask="999.999.999-99"
          label="CPF"
          value={valor}
          onChange={(val) => handleRespostaChange(id, val, tipo)}
          disabled={false}
          error={erro}
          helperText={erro && 'Campo obrigatório'}
        />
      );
    }

    if (tipo === 'cnpj') {
      return (
        <MaskedInputCustom
          mask="99.999.999/9999-99"
          label="CNPJ"
          value={valor}
          onChange={(val) => handleRespostaChange(id, val, tipo)}
          disabled={false}
          error={erro}
          helperText={erro && 'Campo obrigatório'}
        />
      );
    }

    if (tipo === 'telefone') {
      return (
        <MaskedInputCustom
          mask="(99) 99999-9999"
          label="Telefone"
          value={valor}
          onChange={(val) => handleRespostaChange(id, val, tipo)}
          disabled={false}
          error={erro}
          helperText={erro && 'Campo obrigatório'}
        />
      );
    }

    if (tipo === 'cep') {
      return (
        <MaskedInputCustom
          mask="99999-999"
          label="CEP"
          value={valor}
          onChange={(val) => handleRespostaChange(id, val, tipo)}
          disabled={false}
          error={erro}
          helperText={erro && 'Campo obrigatório'}
        />
      );
    }

    if (tipo === 'dinheiro') {
      return (
        <TextField
          fullWidth
          size="small"
          label="Valor"
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          error={erro}
          helperText={erro && 'Campo obrigatório'}
          InputProps={{
            inputComponent: NumericFormatCustom,
          }}
        />
      );
    }

    // Campos especiais
    if (tipo === 'assinatura') {
      return (
        <SignaturePad
          perguntaId={id}
          value={valor}
          onChange={(val) => handleRespostaChange(id, val, tipo)}
          disabled={false}
        />
      );
    }

    if (tipo === 'arquivo' || tipo === 'imagem' || tipo === 'pdf' || tipo === 'video') {
      const acceptMap = {
        'imagem': 'image/*',
        'pdf': 'application/pdf',
        'video': 'video/*',
        'arquivo': '*/*'
      };
      
      return (
        <FileUploadField
          perguntaId={id}
          value={valor}
          onChange={(val) => handleRespostaChange(id, val, tipo)}
          disabled={false}
          accept={acceptMap[tipo] || '*/*'}
        />
      );
    }

    // Fallback
    return (
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder || 'Digite aqui...'}
        value={valor}
        onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
        error={erro}
        helperText={erro && 'Campo obrigatório'}
      />
    );
  };

  if (loading) {
    console.log('⏳ Renderizando loading...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#9c27b0' }} />
      </Box>
    );
  }

  if (!formulario) {
    console.log('⚠️ Renderizando sem formulário - formulario é null');
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert 
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={handleVoltar}>
              Voltar
            </Button>
          }
        >
          Não há formulário para preencher neste atendimento.
        </Alert>
      </Box>
    );
  }

  console.log('✅ Renderizando formulário completo');
  
  // Filtrar questões visíveis
  const questoesVisiveis = formulario.questoes?.filter(q => camposCondicionais[q.id] !== false) || [];
  const questaoAtual = questoesVisiveis[activeStep];

  if (!questaoAtual && questoesVisiveis.length > 0) {
    // Se a questão atual não for visível, ajustar o passo
    setActiveStep(0);
    return null;
  }

  if (questoesVisiveis.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="warning">
          Nenhuma pergunta disponível para este formulário.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 8, px: 2 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={handleVoltar} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            {formulario.titulo}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {atendimento?.servicoNome} • {formatarData(atendimento?.data)} às {atendimento?.horaInicio}
          </Typography>
          {formulario.tempoEstimado && (
            <Typography variant="caption" color="textSecondary">
              Tempo estimado: {formulario.tempoEstimado} minutos
            </Typography>
          )}
        </Box>
      </Box>

      {/* Barra de progresso */}
      {formulario.configuracoes?.mostrarBarraProgresso && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="textSecondary">
              Progresso
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {activeStep + 1} de {questoesVisiveis.length}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((activeStep + 1) / questoesVisiveis.length) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {/* Informações do atendimento */}
      <Card sx={{ mb: 4, bgcolor: '#faf5ff' }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon sx={{ color: '#9c27b0' }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Data</Typography>
                  <Typography variant="body2">
                    {formatarData(atendimento?.data)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ color: '#9c27b0' }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Horário</Typography>
                  <Typography variant="body2">{atendimento?.horaInicio}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: '#9c27b0' }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Profissional</Typography>
                  <Typography variant="body2">{atendimento?.profissionalNome || 'Não informado'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Instruções */}
      {formulario.instrucoes && (
        <Alert severity="info" sx={{ mb: 4 }}>
          {formulario.instrucoes}
        </Alert>
      )}

      {/* Formulário */}
      <Card>
        <CardContent>
          {/* Stepper */}
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {questoesVisiveis.map((q, index) => (
                <Step key={q.id}>
                  <StepLabel
                    optional={
                      <Typography variant="caption" color="textSecondary">
                        {index + 1}/{questoesVisiveis.length}
                      </Typography>
                    }
                  >
                    {q.pergunta.length > 20 
                      ? `${q.pergunta.substring(0, 20)}...` 
                      : q.pergunta}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Questão atual */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {activeStep + 1}. {questaoAtual.pergunta}
              {questaoAtual.obrigatoria && <span style={{ color: '#f44336' }}> *</span>}
            </Typography>

            {questaoAtual.descricao && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {questaoAtual.descricao}
              </Typography>
            )}

            {renderizarCampo(questaoAtual)}
          </Paper>

          {/* Botões de navegação */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={handleAnterior}
              disabled={activeStep === 0}
              startIcon={<KeyboardArrowLeft />}
            >
              Anterior
            </Button>
            
            {activeStep === questoesVisiveis.length - 1 ? (
              <Button
                variant="contained"
                color="success"
                onClick={handleEnviar}
                disabled={enviando}
                startIcon={<SendIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)',
                }}
              >
                {enviando ? 'Enviando...' : 'Enviar Formulário'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleProximo}
                endIcon={<KeyboardArrowRight />}
                sx={{
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                }}
              >
                Próxima
              </Button>
            )}
          </Box>

          {/* Indicador de questões condicionais */}
          {questaoAtual.condicional && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Chip
                icon={<InfoIcon />}
                label="Esta pergunta aparece apenas quando uma condição é atendida"
                size="small"
                variant="outlined"
                color="warning"
              />
            </Box>
          )}
        </CardContent>
      </Card>

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

export default ClienteAnamnese;
