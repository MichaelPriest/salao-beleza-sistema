// src/pages/ClienteAnamnese.js
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
  CircularProgress,
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  MobileStepper,
  FormHelperText,
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
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

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
    console.log('Upload de arquivo:', file);
    toast.info('Upload de arquivo ainda não implementado');
  };

  const validarFormulario = () => {
    if (!formulario) return false;
    
    const novosErros = {};
    let valido = true;
    
    formulario.questoes?.forEach(questao => {
      if (questao.obrigatoria) {
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

      const respostasFormatadas = Object.entries(respostas).map(([perguntaId, data]) => {
        const questao = formulario.questoes?.find(q => q.id === perguntaId);
        return {
          perguntaId,
          pergunta: questao?.pergunta || '',
          resposta: data.valor,
          tipo: data.tipo
        };
      });

      const dadosResposta = {
        formularioId: formulario.id,
        formularioTitulo: formulario.titulo,
        clienteId: uid,
        clienteNome: cliente?.nome || 'Cliente',
        profissionalId: atendimento?.profissionalId,
        profissionalNome: atendimento?.profissionalNome,
        servicoId: atendimento?.servicoId,
        servicoNome: atendimento?.servicoNome,
        status: 'respondido',
        respostas: respostasFormatadas,
        respondidoEm: new Date().toISOString(),
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now()
      };

      if (atendimento?.agendamentoId) {
        dadosResposta.agendamentoId = atendimento.agendamentoId;
      } else {
        dadosResposta.atendimentoId = atendimento?.id;
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
  const questaoAtual = formulario.questoes?.[activeStep];

  if (!questaoAtual) {
    console.error('❌ Questão atual não encontrada');
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erro ao carregar pergunta. Tente novamente.
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
                  <Typography variant="body2">{atendimento?.profissionalNome || 'Não informado'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {formulario.instrucoes && (
        <Alert severity="info" sx={{ mb: 4 }}>
          {formulario.instrucoes}
        </Alert>
      )}

      <Card>
        <CardContent>
          <MobileStepper
            variant="progress"
            steps={formulario.questoes?.length || 0}
            position="static"
            activeStep={activeStep}
            sx={{ maxWidth: '100%', flexGrow: 1, mb: 3 }}
            nextButton={
              <Button
                size="small"
                onClick={handleProximo}
                disabled={activeStep === (formulario.questoes?.length || 0) - 1 && enviando}
              >
                {activeStep === (formulario.questoes?.length || 0) - 1 ? 'Enviar' : 'Próxima'}
                {activeStep < (formulario.questoes?.length || 0) - 1 && <KeyboardArrowRight />}
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={handleAnterior}
              disabled={activeStep === 0}
              startIcon={<KeyboardArrowLeft />}
            >
              Anterior
            </Button>
            
            {activeStep === (formulario.questoes?.length || 0) - 1 ? (
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

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography variant="caption" color="textSecondary">
              Questão {activeStep + 1} de {formulario.questoes?.length || 0}
            </Typography>
          </Box>
        </CardContent>
      </Card>

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
