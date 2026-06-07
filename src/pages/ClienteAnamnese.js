// src/pages/ClienteAnamnese.js
// VERSÃO COMPLETA - COM TODOS OS COMPONENTES E FUNCIONALIDADES

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  useMediaQuery,
  useTheme,
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
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { Timestamp } from '../services/firebase';
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

const MaskedInputCustom = ({ mask, value, onChange, disabled, error, helperText, label, ...props }) => {
  return (
    <InputMask
      mask={mask}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      maskChar={null}
    >
      {(inputProps) => (
        <TextField
          {...inputProps}
          {...props}
          fullWidth
          size="small"
          label={label}
          error={error}
          helperText={helperText}
        />
      )}
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              bgcolor: '#faf5ff',
              overflow: 'auto',
              touchAction: 'none',
            }}
          >
            <SignatureCanvas
              ref={(ref) => setSigPad(ref)}
              canvasProps={{
                width: isMobile ? 300 : 500,
                height: 180,
                className: 'sigCanvas',
                style: {
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '100%',
                  height: '180px',
                  backgroundColor: 'white',
                  cursor: 'crosshair',
                  touchAction: 'none',
                },
              }}
              onEnd={save}
            />
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Button size="small" onClick={clear} startIcon={<DeleteIcon />}>
              Limpar assinatura
            </Button>
            {hasSignature && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Assinatura capturada"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        </>
      ) : (
        preview && (
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={preview}
              alt="Assinatura"
              style={{
                maxWidth: '100%',
                maxHeight: '120px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
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
      setFiles([{ name: 'Arquivo carregado', url: value }]);
    } else if (Array.isArray(value)) {
      setFiles(value);
    }
  }, [value]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
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
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { atendimentoId, agendamentoId } = params;
  const { cliente, firebaseUser } = useAuthCliente();

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [atendimento, setAtendimento] = useState(null);
  const [formulario, setFormulario] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [validacao, setValidacao] = useState({});
  const [camposCondicionais, setCamposCondicionais] = useState({});

  const entityId = atendimentoId || agendamentoId;
  const entityType = atendimentoId ? 'atendimento' : 'agendamento';
  const formularioIdSelecionado = searchParams.get('formularioId');

  const getClienteIds = useCallback(() => Array.from(new Set([
    firebaseUser?.uid,
    cliente?.id,
    cliente?.authUid,
    cliente?.googleUid,
  ].filter(Boolean))), [cliente, firebaseUser]);

  const getServicoIds = (origem = {}) => Array.from(new Set([
    origem.servicoId,
    ...(origem.servicosIds || []),
    ...(origem.servicoIds || []),
    ...(origem.servicos || []).map((servico) => servico.id),
  ].flat().filter(Boolean)));

  // ==========================================
  // FUNÇÕES DE BUSCA
  // ==========================================

  const buscarProfissionalNome = useCallback(async (profissionalId) => {
    if (!profissionalId) return 'Não informado';
    try {
      const profissional = await firebaseService.getById('profissionais', profissionalId);
      return profissional?.nome || 'Não informado';
    } catch (error) {
      console.error('Erro ao buscar profissional:', error);
      return 'Não informado';
    }
  }, []);

  const buscarServicoNome = useCallback(async (servicoId) => {
    if (!servicoId) return 'Serviço';
    try {
      const servico = await firebaseService.getById('servicos', servicoId);
      return servico?.nome || 'Serviço';
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      return 'Serviço';
    }
  }, []);

  // ==========================================
  // CARREGAR DADOS
  // ==========================================

  const carregarDados = useCallback(async () => {
    if (!entityId) {
      toast.error('ID não encontrado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let atendimentoData;

      if (entityType === 'atendimento') {
        atendimentoData = await firebaseService.getById('atendimentos', entityId);
      } else {
        const agendamento = await firebaseService.getById('agendamentos', entityId);

        if (!agendamento) {
          toast.error('Agendamento não encontrado');
          setLoading(false);
          return;
        }

        const atendimentosExistentes = await firebaseService
          .query('atendimentos', [{ field: 'agendamentoId', operator: '==', value: entityId }])
          .catch(() => []);

        if (atendimentosExistentes.length > 0) {
          navigate(`/cliente/atendimento/${atendimentosExistentes[0].id}/anamnese`, { replace: true });
          return;
        }

        const profissionalNome = agendamento.profissionalNome || 
          (agendamento.profissionalId ? await buscarProfissionalNome(agendamento.profissionalId) : 'Não informado');
        
        const servicoIds = getServicoIds(agendamento);
        const nomesServicos = agendamento.servicosNomes || agendamento.servicoNome || await Promise.all(servicoIds.map(buscarServicoNome));
        const servicoNome = Array.isArray(nomesServicos) ? nomesServicos.filter(Boolean).join(', ') : nomesServicos;

        atendimentoData = {
          id: agendamento.id,
          agendamentoId: agendamento.id,
          clienteId: agendamento.clienteId,
          profissionalId: agendamento.profissionalId,
          profissionalNome: profissionalNome,
          servicoId: servicoIds[0],
          servicosIds: servicoIds,
          servicoNome: servicoNome || 'Serviço',
          data: agendamento.data,
          horaInicio: agendamento.horario,
        };
      }

      if (!atendimentoData) {
        toast.error('Atendimento não encontrado');
        setLoading(false);
        return;
      }

      setAtendimento(atendimentoData);

      let respostasExistentes = [];

      if (atendimentoData.agendamentoId) {
        respostasExistentes = await firebaseService.query('respostas_anamnese', [
          { field: 'agendamentoId', operator: '==', value: atendimentoData.agendamentoId },
        ]);
      } else {
        respostasExistentes = await firebaseService.query('respostas_anamnese', [
          { field: 'atendimentoId', operator: '==', value: atendimentoData.id },
        ]);
      }

      if (formularioIdSelecionado) {
        const respostaDoFormulario = respostasExistentes.find((resposta) => resposta.formularioId === formularioIdSelecionado);
        if (respostaDoFormulario) {
          navigate(`/cliente/anamnese/${respostaDoFormulario.id}`);
          return;
        }
      } else if (respostasExistentes.length > 0) {
        const servicoIdsAtendimento = getServicoIds(atendimentoData);
        const formulariosPorServicoExistentes = await Promise.all(servicoIdsAtendimento.flatMap((servicoId) => [
          firebaseService.query('formularios_anamnese', [
            { field: 'servicoIds', operator: 'array-contains', value: servicoId },
            { field: 'ativo', operator: '==', value: true },
          ]).catch(() => []),
          firebaseService.query('formularios_anamnese', [
            { field: 'servicosIds', operator: 'array-contains', value: servicoId },
            { field: 'ativo', operator: '==', value: true },
          ]).catch(() => []),
        ]));
        const formulariosExistentes = Array.from(new Map(formulariosPorServicoExistentes.flat().map((item) => [item.id, item])).values());
        const todosRespondidos = formulariosExistentes.length > 0 && formulariosExistentes.every((formularioItem) =>
          respostasExistentes.some((resposta) => resposta.formularioId === formularioItem.id)
        );
        if (todosRespondidos || formulariosExistentes.length <= 1) {
          navigate(`/cliente/anamnese/${respostasExistentes[0].id}`);
          return;
        }
      }

      const servicoIdsAtendimento = getServicoIds(atendimentoData);
      const formulariosPorServico = await Promise.all(servicoIdsAtendimento.flatMap((servicoId) => [
        firebaseService.query('formularios_anamnese', [
          { field: 'servicoIds', operator: 'array-contains', value: servicoId },
          { field: 'ativo', operator: '==', value: true },
        ]).catch(() => []),
        firebaseService.query('formularios_anamnese', [
          { field: 'servicosIds', operator: 'array-contains', value: servicoId },
          { field: 'ativo', operator: '==', value: true },
        ]).catch(() => []),
      ]));
      const formularios = Array.from(new Map(formulariosPorServico.flat().map((item) => [item.id, item])).values());

      if (formularios.length > 0) {
        const formularioAtual = formularios.find((item) => item.id === formularioIdSelecionado) || formularios[0];
        setFormulario(formularioAtual);

        const respostasIniciais = {};
        formularioAtual.questoes?.forEach((q) => {
          if (q.tipo === 'checkbox' || q.tipo === 'multiselect') {
            respostasIniciais[q.id] = [];
          } else {
            respostasIniciais[q.id] = '';
          }
        });
        setRespostas(respostasIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar formulário');
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType, navigate, buscarProfissionalNome, buscarServicoNome, formularioIdSelecionado]);

  useEffect(() => {
    if (entityId) {
      carregarDados();
    } else {
      setLoading(false);
    }
  }, [entityId, carregarDados]);

  // ==========================================
  // CAMPOS CONDICIONAIS
  // ==========================================

  useEffect(() => {
    if (formulario) {
      const visiveis = {};
      formulario.questoes?.forEach((questao) => {
        if (questao.condicional) {
          const perguntaBase = formulario.questoes.find((q) => q.id === questao.condicional.perguntaId);
          if (perguntaBase) {
            const valorBase = respostas[perguntaBase.id]?.valor;
            const { operador, valor } = questao.condicional;
            let condicaoAtendida = false;

            switch (operador) {
              case '==':
                condicaoAtendida = valorBase == valor;
                break;
              case '!=':
                condicaoAtendida = valorBase != valor;
                break;
              case '>':
                condicaoAtendida = parseFloat(valorBase) > parseFloat(valor);
                break;
              case '<':
                condicaoAtendida = parseFloat(valorBase) < parseFloat(valor);
                break;
              case '>=':
                condicaoAtendida = parseFloat(valorBase) >= parseFloat(valor);
                break;
              case '<=':
                condicaoAtendida = parseFloat(valorBase) <= parseFloat(valor);
                break;
              case 'contains':
                condicaoAtendida = Array.isArray(valorBase) && valorBase.includes(valor);
                break;
              default:
                condicaoAtendida = true;
            }
            visiveis[questao.id] = condicaoAtendida;
          } else {
            visiveis[questao.id] = true;
          }
        } else {
          visiveis[questao.id] = true;
        }
      });
      setCamposCondicionais(visiveis);
    }
  }, [respostas, formulario]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleRespostaChange = (perguntaId, value, tipo) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: { perguntaId, valor: value, tipo },
    }));

    const questao = formulario?.questoes?.find((q) => q.id === perguntaId);
    if (questao?.obrigatoria) {
      setValidacao((prev) => ({
        ...prev,
        [perguntaId]: !!value && (Array.isArray(value) ? value.length > 0 : true),
      }));
    }
  };

  const handleFileUpload = async (perguntaId, file) => {
    console.log('Upload de arquivo:', file);
    const fakeUrl = URL.createObjectURL(file);
    handleRespostaChange(perguntaId, fakeUrl, 'arquivo');
  };

  const validarFormulario = () => {
    if (!formulario) return false;

    const novosErros = {};
    let valido = true;

    formulario.questoes?.forEach((questao) => {
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

  const handleEnviar = async () => {
    if (!validarFormulario()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setEnviando(true);

      const uid = getClienteIds()[0];
      if (!uid) {
        toast.error('Cliente não identificado. Faça login novamente.');
        return;
      }

      const respostasVisiveis = Object.entries(respostas).filter(
        ([perguntaId]) => camposCondicionais[perguntaId] !== false
      );

      const respostasFormatadas = respostasVisiveis.map(([perguntaId, data]) => {
        const questao = formulario.questoes?.find((q) => q.id === perguntaId);
        return {
          perguntaId,
          pergunta: questao?.pergunta || '',
          resposta: data.valor || '',
          tipo: data.tipo || '',
        };
      });

      const dadosResposta = {
        formularioId: formulario.id,
        formularioTitulo: formulario.titulo,
        clienteId: uid,
        clienteNome: cliente?.nome || 'Cliente',
        profissionalId: atendimento?.profissionalId,
        profissionalNome: atendimento?.profissionalNome || 'Não informado',
        servicoId: atendimento?.servicoId,
        servicosIds: getServicoIds(atendimento),
        servicoNome: atendimento?.servicoNome,
        status: 'respondido',
        respostas: respostasFormatadas,
        respondidoEm: new Date().toISOString(),
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now(),
      };

      if (atendimento?.agendamentoId) {
        dadosResposta.agendamentoId = atendimento.agendamentoId;
      } else {
        dadosResposta.atendimentoId = atendimento?.id;
      }

      await firebaseService.add('respostas_anamnese', dadosResposta);
      toast.success('Formulário enviado com sucesso!');
      setTimeout(() => navigate('/cliente/anamnese'), 2000);
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast.error('Erro ao enviar formulário');
    } finally {
      setEnviando(false);
    }
  };

  const renderizarCampo = (questao) => {
    const { id, tipo, pergunta, obrigatoria, placeholder, opcoes, valorMinimo, valorMaximo, passo, mascara } = questao;
    const valor = respostas[id]?.valor || '';
    const erro = validacao[id] === false;
    const visivel = camposCondicionais[id] !== false;

    if (!visivel) return null;

    const campoBase = {
      fullWidth: true,
      size: 'small',
      error: erro,
      helperText: erro && 'Campo obrigatório',
    };

    if (tipo === 'texto') {
      return (
        <TextField
          {...campoBase}
          placeholder={placeholder || 'Digite aqui...'}
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
        />
      );
    }

    if (tipo === 'textarea') {
      return (
        <TextField
          {...campoBase}
          multiline
          rows={isMobile ? 3 : 4}
          placeholder={placeholder || 'Digite aqui...'}
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
        />
      );
    }

    if (tipo === 'numero') {
      return (
        <TextField
          {...campoBase}
          type="number"
          placeholder={placeholder || '0'}
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          InputProps={{
            inputProps: { min: valorMinimo, max: valorMaximo, step: passo },
            startAdornment: <NumbersIcon color="action" sx={{ mr: 1 }} />,
          }}
        />
      );
    }

    if (tipo === 'data') {
      return (
        <TextField
          {...campoBase}
          type="date"
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          InputLabelProps={{ shrink: true }}
        />
      );
    }

    if (tipo === 'hora') {
      return (
        <TextField
          {...campoBase}
          type="time"
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          InputLabelProps={{ shrink: true }}
        />
      );
    }

    if (tipo === 'select') {
      return (
        <FormControl fullWidth size="small" error={erro}>
          <InputLabel shrink>Selecione uma opção</InputLabel>
          <Select
            value={valor}
            label="Selecione uma opção"
            onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
            displayEmpty
          >
            <MenuItem value="">Selecione...</MenuItem>
            {opcoes?.map((op, i) => (
              <MenuItem key={i} value={op}>
                {op}
              </MenuItem>
            ))}
          </Select>
          {erro && <FormHelperText>Campo obrigatório</FormHelperText>}
        </FormControl>
      );
    }

    if (tipo === 'multiselect') {
      return (
        <FormControl fullWidth size="small" error={erro}>
          <InputLabel shrink>Selecione opções</InputLabel>
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
          <RadioGroup value={valor} onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}>
            {opcoes?.map((op, i) => (
              <FormControlLabel key={i} value={op} control={<Radio />} label={op} />
            ))}
          </RadioGroup>
          {erro && <FormHelperText>Campo obrigatório</FormHelperText>}
        </FormControl>
      );
    }

    if (tipo === 'checkbox') {
      const valores = valor || [];
      return (
        <FormControl component="fieldset" error={erro}>
          <FormGroup>
            {opcoes?.map((op, i) => (
              <FormControlLabel
                key={i}
                control={
                  <Checkbox
                    checked={valores.includes(op)}
                    onChange={(e) => {
                      const novosValores = e.target.checked
                        ? [...valores, op]
                        : valores.filter((v) => v !== op);
                      handleRespostaChange(id, novosValores, tipo);
                    }}
                  />
                }
                label={op}
              />
            ))}
          </FormGroup>
          {erro && <FormHelperText>Campo obrigatório</FormHelperText>}
        </FormControl>
      );
    }

    if (tipo === 'cpf') {
      return (
        <MaskedInputCustom
          mask="999.999.999-99"
          label="CPF"
          value={valor}
          onChange={(val) => handleRespostaChange(id, val, tipo)}
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
          error={erro}
          helperText={erro && 'Campo obrigatório'}
        />
      );
    }

    if (tipo === 'dinheiro') {
      return (
        <TextField
          {...campoBase}
          value={valor}
          onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
          InputProps={{
            inputComponent: NumericFormatCustom,
          }}
        />
      );
    }

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

    return (
      <TextField
        {...campoBase}
        placeholder={placeholder || 'Digite aqui...'}
        value={valor}
        onChange={(e) => handleRespostaChange(id, e.target.value, tipo)}
      />
    );
  };

  const formatarData = (data) => {
    if (!data) return '';
    try {
      return format(new Date(data + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  const questoesVisiveis = formulario?.questoes?.filter((q) => camposCondicionais[q.id] !== false) || [];
  const questaoAtual = questoesVisiveis[activeStep];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={isMobile ? 40 : 60} thickness={4} sx={{ color: '#9c27b0' }} />
      </Box>
    );
  }

  if (!formulario) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/cliente/anamnese')}>
              Voltar
            </Button>
          }
        >
          Não há formulário para preencher neste atendimento.
        </Alert>
      </Box>
    );
  }

  if (questoesVisiveis.length === 0) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="warning">Nenhuma pergunta disponível para este formulário.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: isMobile ? 2 : 4, mb: isMobile ? 4 : 8, px: isMobile ? 1 : 2 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 2 : 4 }}>
        <IconButton onClick={() => navigate('/cliente/anamnese')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{ fontWeight: 700, color: '#9c27b0', fontSize: isMobile ? '1.25rem' : undefined }}
          >
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
      {formulario.configuracoes?.mostrarBarraProgresso !== false && (
        <Box sx={{ mb: isMobile ? 2 : 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="textSecondary">Progresso</Typography>
            <Typography variant="caption" color="textSecondary">
              {activeStep + 1} de {questoesVisiveis.length}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((activeStep + 1) / questoesVisiveis.length) * 100}
            sx={{ height: isMobile ? 4 : 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {/* Informações do atendimento */}
      <Card sx={{ mb: isMobile ? 2 : 4, bgcolor: '#faf5ff', borderRadius: isMobile ? 2 : 3 }}>
        <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon sx={{ color: '#9c27b0', fontSize: isMobile ? 18 : 20 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                    Data
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                    {formatarData(atendimento?.data)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ color: '#9c27b0', fontSize: isMobile ? 18 : 20 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                    Horário
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                    {atendimento?.horaInicio}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: '#9c27b0', fontSize: isMobile ? 18 : 20 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                    Profissional
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                    {atendimento?.profissionalNome || 'Não informado'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Instruções */}
      {formulario.instrucoes && (
        <Alert severity="info" sx={{ mb: isMobile ? 2 : 4, borderRadius: 2 }}>
          <Typography variant="body2">{formulario.instrucoes}</Typography>
        </Alert>
      )}

      {/* Formulário */}
      <Card sx={{ borderRadius: isMobile ? 2 : 3 }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          {/* Stepper Desktop */}
          {!isMobile && (
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
                      {q.pergunta.length > 20 ? `${q.pergunta.substring(0, 20)}...` : q.pergunta}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {/* Navegação Mobile */}
          {isMobile && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button size="small" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>
                <KeyboardArrowLeft /> Anterior
              </Button>
              <Chip label={`${activeStep + 1}/${questoesVisiveis.length}`} size="small" variant="outlined" />
              <Button
                size="small"
                onClick={() => setActiveStep(Math.min(questoesVisiveis.length - 1, activeStep + 1))}
                disabled={activeStep === questoesVisiveis.length - 1}
              >
                Próxima <KeyboardArrowRight />
              </Button>
            </Box>
          )}

          {/* Questão atual */}
          <Paper variant="outlined" sx={{ p: isMobile ? 2 : 3, borderRadius: 2 }}>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom sx={{ fontWeight: 600 }}>
              {activeStep + 1}. {questaoAtual.pergunta}
              {questaoAtual.obrigatoria && <span style={{ color: '#f44336' }}> *</span>}
            </Typography>

            {questaoAtual.descricao && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: isMobile ? 2 : 3 }}>
                {questaoAtual.descricao}
              </Typography>
            )}

            {renderizarCampo(questaoAtual)}
          </Paper>

          {/* Botões Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} startIcon={<KeyboardArrowLeft />}>
                Anterior
              </Button>

              {activeStep === questoesVisiveis.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleEnviar}
                  disabled={enviando}
                  startIcon={<SendIcon />}
                  sx={{ background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)' }}
                >
                  {enviando ? 'Enviando...' : 'Enviar Formulário'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(activeStep + 1)}
                  endIcon={<KeyboardArrowRight />}
                  sx={{ background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)' }}
                >
                  Próxima
                </Button>
              )}
            </Box>
          )}

          {/* Botão Enviar Mobile */}
          {isMobile && activeStep === questoesVisiveis.length - 1 && (
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={handleEnviar}
              disabled={enviando}
              startIcon={<SendIcon />}
              sx={{ mt: 2, py: 1.5, background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)' }}
            >
              {enviando ? 'Enviando...' : 'Enviar Formulário'}
            </Button>
          )}

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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ClienteAnamnese;
