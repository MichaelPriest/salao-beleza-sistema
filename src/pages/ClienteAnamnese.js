// src/pages/Cliente/ClienteAnamnese.js
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
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  MobileStepper,
  FormHelperText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  Help as HelpIcon,
  AttachFile as FileIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { firebaseService } from '../../services/firebase';
import { useAuthCliente } from '../../contexts/AuthClienteContext';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function ClienteAnamnese() {
  const navigate = useNavigate();
  const { atendimentoId, agendamentoId } = useParams(); // 🔥 Aceita ambos
  const { cliente, firebaseUser } = useAuthCliente();
  
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [atendimento, setAtendimento] = useState(null);
  const [formulario, setFormulario] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [validacao, setValidacao] = useState({});

  // Determinar qual ID usar
  const entityId = atendimentoId || agendamentoId;
  const entityType = atendimentoId ? 'atendimento' : 'agendamento';

  useEffect(() => {
    if (entityId) {
      carregarDados();
    }
  }, [entityId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      let atendimentoData;
      
      if (entityType === 'atendimento') {
        // Buscar diretamente pelo atendimento
        atendimentoData = await firebaseService.getById('atendimentos', entityId);
      } else {
        // Buscar o agendamento
        const agendamento = await firebaseService.getById('agendamentos', entityId);
        
        if (!agendamento) {
          toast.error('Agendamento não encontrado');
          return;
        }
        
        // Verificar se já existe atendimento para este agendamento
        const atendimentosExistentes = await firebaseService.query('atendimentos', [
          { field: 'agendamentoId', operator: '==', value: entityId }
        ]);
        
        if (atendimentosExistentes.length > 0) {
          // Se já existe atendimento, redirecionar para ele
          navigate(`/cliente/atendimento/${atendimentosExistentes[0].id}/anamnese`, { replace: true });
          return;
        }
        
        // Se não existe, usar dados do agendamento
        atendimentoData = {
          id: agendamento.id,
          agendamentoId: agendamento.id,
          clienteId: agendamento.clienteId,
          profissionalId: agendamento.profissionalId,
          profissionalNome: agendamento.profissionalNome,
          servicoId: agendamento.servicoId,
          servicoNome: agendamento.servicoNome || (await buscarServicoNome(agendamento.servicoId)),
          data: agendamento.data,
          horaInicio: agendamento.horario,
        };
      }

      setAtendimento(atendimentoData);

      if (!atendimentoData) {
        toast.error('Atendimento não encontrado');
        return;
      }

      // Verificar se já existe resposta para este atendimento/agendamento
      let respostasExistentes;
      if (atendimentoData.agendamentoId) {
        respostasExistentes = await firebaseService.query('respostas_anamnese', [
          { field: 'agendamentoId', operator: '==', value: atendimentoData.agendamentoId }
        ]);
      } else {
        respostasExistentes = await firebaseService.query('respostas_anamnese', [
          { field: 'atendimentoId', operator: '==', value: atendimentoData.id }
        ]);
      }

      if (respostasExistentes.length > 0) {
        // Se já respondeu, redirecionar para visualização
        navigate(`/cliente/anamnese/${respostasExistentes[0].id}`);
        return;
      }

      // Buscar formulários associados ao serviço
      const formularios = await firebaseService.query('formularios_anamnese', [
        { field: 'servicoIds', operator: 'array-contains', value: atendimentoData.servicoId },
        { field: 'ativo', operator: '==', value: true }
      ]);

      if (formularios.length > 0) {
        setFormulario(formularios[0]);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar formulário');
    } finally {
      setLoading(false);
    }
  };

  const buscarServicoNome = async (servicoId) => {
    try {
      const servico = await firebaseService.getById('servicos', servicoId);
      return servico?.nome || 'Serviço';
    } catch {
      return 'Serviço';
    }
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

    // Validar campo obrigatório
    const questao = formulario?.questoes.find(q => q.id === perguntaId);
    if (questao?.obrigatoria) {
      setValidacao(prev => ({
        ...prev,
        [perguntaId]: !!value
      }));
    }
  };

  const handleFileUpload = async (perguntaId, file) => {
    // Implementar upload de arquivo
    console.log('Upload de arquivo:', file);
  };

  const validarFormulario = () => {
    if (!formulario) return false;
    
    const novosErros = {};
    
    formulario.questoes.forEach(questao => {
      if (questao.obrigatoria) {
        const resposta = respostas[questao.id]?.valor;
        if (!resposta || (Array.isArray(resposta) && resposta.length === 0)) {
          novosErros[questao.id] = false;
        } else {
          novosErros[questao.id] = true;
        }
      }
    });

    setValidacao(novosErros);
    return Object.values(novosErros).every(v => v !== false);
  };

  const handleProximo = () => {
    if (!formulario) return;
    
    if (activeStep === formulario.questoes.length - 1) {
      // Última questão, validar tudo
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

      // Montar respostas
      const respostasFormatadas = Object.entries(respostas).map(([perguntaId, data]) => {
        const questao = formulario.questoes.find(q => q.id === perguntaId);
        return {
          perguntaId,
          pergunta: questao.pergunta,
          resposta: data.valor,
          tipo: data.tipo
        };
      });

      // Preparar dados para salvar
      const dadosResposta = {
        formularioId: formulario.id,
        formularioTitulo: formulario.titulo,
        clienteId: uid,
        clienteNome: cliente.nome,
        profissionalId: atendimento.profissionalId,
        servicoId: atendimento.servicoId,
        servicoNome: atendimento.servicoNome,
        status: 'respondido',
        respostas: respostasFormatadas,
        respondidoEm: new Date().toISOString(),
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now()
      };

      // Adicionar IDs apropriados
      if (atendimento.agendamentoId) {
        dadosResposta.agendamentoId = atendimento.agendamentoId;
      } else {
        dadosResposta.atendimentoId = atendimento.id;
      }

      // Salvar no Firebase
      await firebaseService.add('respostas_anamnese', dadosResposta);

      toast.success('Formulário enviado com sucesso!');
      navigate('/cliente/anamnese');
      
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!formulario) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Não há formulário para preencher neste atendimento.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/cliente/anamnese')}
          sx={{ mt: 2 }}
        >
          Voltar para lista
        </Button>
      </Box>
    );
  }

  const questaoAtual = formulario.questoes[activeStep];

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/cliente/anamnese')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            {formulario.titulo}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Atendimento: {atendimento?.servicoNome} • {formatarData(atendimento?.data)}
          </Typography>
        </Box>
      </Box>

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
                  <Typography variant="body2">{atendimento?.profissionalNome}</Typography>
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

      {/* Formulário em etapas */}
      <Card>
        <CardContent>
          <MobileStepper
            variant="progress"
            steps={formulario.questoes.length}
            position="static"
            activeStep={activeStep}
            sx={{ maxWidth: '100%', flexGrow: 1, mb: 3 }}
            nextButton={
              <Button
                size="small"
                onClick={handleProximo}
                disabled={activeStep === formulario.questoes.length - 1 && enviando}
              >
                {activeStep === formulario.questoes.length - 1 ? 'Enviar' : 'Próxima'}
                {activeStep < formulario.questoes.length - 1 && <KeyboardArrowRight />}
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={handleAnterior}
                disabled={activeStep === 0}
              >
                <KeyboardArrowLeft />
                Anterior
              </Button>
            }
          />

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

            {/* Renderizar campo baseado no tipo */}
            {questaoAtual.tipo === 'texto' && (
              <TextField
                fullWidth
                size="small"
                placeholder={questaoAtual.placeholder || 'Digite aqui...'}
                value={respostas[questaoAtual.id]?.valor || ''}
                onChange={(e) => handleRespostaChange(questaoAtual.id, e.target.value, questaoAtual.tipo)}
                error={validacao[questaoAtual.id] === false}
                helperText={validacao[questaoAtual.id] === false && 'Campo obrigatório'}
              />
            )}

            {questaoAtual.tipo === 'textarea' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Digite aqui..."
                value={respostas[questaoAtual.id]?.valor || ''}
                onChange={(e) => handleRespostaChange(questaoAtual.id, e.target.value, questaoAtual.tipo)}
                error={validacao[questaoAtual.id] === false}
                helperText={validacao[questaoAtual.id] === false && 'Campo obrigatório'}
              />
            )}

            {questaoAtual.tipo === 'select' && (
              <FormControl fullWidth size="small" error={validacao[questaoAtual.id] === false}>
                <InputLabel>Selecione uma opção</InputLabel>
                <Select
                  value={respostas[questaoAtual.id]?.valor || ''}
                  label="Selecione uma opção"
                  onChange={(e) => handleRespostaChange(questaoAtual.id, e.target.value, questaoAtual.tipo)}
                >
                  {questaoAtual.opcoes?.map((op, i) => (
                    <MenuItem key={i} value={op}>{op}</MenuItem>
                  ))}
                </Select>
                {validacao[questaoAtual.id] === false && (
                  <FormHelperText>Campo obrigatório</FormHelperText>
                )}
              </FormControl>
            )}

            {questaoAtual.tipo === 'radio' && (
              <RadioGroup
                value={respostas[questaoAtual.id]?.valor || ''}
                onChange={(e) => handleRespostaChange(questaoAtual.id, e.target.value, questaoAtual.tipo)}
              >
                {questaoAtual.opcoes?.map((op, i) => (
                  <FormControlLabel key={i} value={op} control={<Radio />} label={op} />
                ))}
              </RadioGroup>
            )}

            {questaoAtual.tipo === 'checkbox' && (
              <FormGroup>
                {questaoAtual.opcoes?.map((op, i) => {
                  const valores = respostas[questaoAtual.id]?.valor || [];
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
                            handleRespostaChange(questaoAtual.id, novosValores, questaoAtual.tipo);
                          }}
                        />
                      }
                      label={op}
                    />
                  );
                })}
              </FormGroup>
            )}

            {questaoAtual.tipo === 'data' && (
              <TextField
                type="date"
                fullWidth
                size="small"
                value={respostas[questaoAtual.id]?.valor || ''}
                onChange={(e) => handleRespostaChange(questaoAtual.id, e.target.value, questaoAtual.tipo)}
                InputLabelProps={{ shrink: true }}
                error={validacao[questaoAtual.id] === false}
                helperText={validacao[questaoAtual.id] === false && 'Campo obrigatório'}
              />
            )}

            {questaoAtual.tipo === 'hora' && (
              <TextField
                type="time"
                fullWidth
                size="small"
                value={respostas[questaoAtual.id]?.valor || ''}
                onChange={(e) => handleRespostaChange(questaoAtual.id, e.target.value, questaoAtual.tipo)}
                InputLabelProps={{ shrink: true }}
                error={validacao[questaoAtual.id] === false}
                helperText={validacao[questaoAtual.id] === false && 'Campo obrigatório'}
              />
            )}

            {questaoAtual.tipo === 'arquivo' && (
              <Box>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id={`upload-${questaoAtual.id}`}
                  type="file"
                  onChange={(e) => handleFileUpload(questaoAtual.id, e.target.files[0])}
                />
                <label htmlFor={`upload-${questaoAtual.id}`}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                  >
                    Selecionar arquivo
                  </Button>
                </label>
                {respostas[questaoAtual.id]?.valor && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Arquivo selecionado: {respostas[questaoAtual.id].valor.name}
                  </Typography>
                )}
              </Box>
            )}
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
            
            {activeStep === formulario.questoes.length - 1 ? (
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

          {/* Progresso */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography variant="caption" color="textSecondary">
              Questão {activeStep + 1} de {formulario.questoes.length}
            </Typography>
          </Box>
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
