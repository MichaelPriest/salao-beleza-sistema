// src/pages/ClienteAnamneseVisualizar.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function ClienteAnamneseVisualizar() {
  const navigate = useNavigate();
  const { respostaId } = useParams();
  const { cliente } = useAuthCliente();
  
  const [loading, setLoading] = useState(true);
  const [resposta, setResposta] = useState(null);
  const [formulario, setFormulario] = useState(null);
  const [atendimento, setAtendimento] = useState(null);
  const [modalAssinaturaAberta, setModalAssinaturaAberta] = useState(false);
  const [assinaturaSrc, setAssinaturaSrc] = useState(null);

  useEffect(() => {
    if (respostaId) {
      carregarResposta();
    }
  }, [respostaId]);

  useEffect(() => {
    if (resposta) {
      console.log('📄 Resposta completa:', resposta);
      
      // Tenta encontrar a assinatura em qualquer campo
      let assinatura = null;
      
      // Lista de possíveis nomes de campo para a assinatura
      const camposPossiveis = [
        'assinaturaUrl',
        'assinatura', 
        'assinaturaDigital',
        'assinaturaBase64',
        'dataUrl',
        'signature',
        'signatureUrl'
      ];
      
      for (const campo of camposPossiveis) {
        if (resposta[campo]) {
          assinatura = resposta[campo];
          console.log(`✅ Assinatura encontrada no campo: ${campo}`);
          break;
        }
      }
      
      // Se encontrou a assinatura, processa
      if (assinatura) {
        console.log('📸 Assinatura raw (primeiros 50 chars):', assinatura.substring(0, 50));
        
        // Se já for uma data URL completa, usa diretamente
        if (assinatura.startsWith('data:image')) {
          setAssinaturaSrc(assinatura);
        } 
        // Se for apenas o base64, adiciona o prefixo
        else {
          // Remove qualquer texto antes do base64
          const base64Pattern = /(?:base64,)?([A-Za-z0-9+/=]+)$/;
          const match = assinatura.match(base64Pattern);
          
          if (match && match[1]) {
            const base64Data = match[1];
            setAssinaturaSrc(`data:image/png;base64,${base64Data}`);
            console.log('✅ Assinura processada com sucesso');
          } else {
            // Tenta usar direto mesmo assim
            setAssinaturaSrc(`data:image/png;base64,${assinatura}`);
          }
        }
      } else {
        console.log('❌ Nenhuma assinatura encontrada nos campos');
      }
    }
  }, [resposta]);

  const carregarResposta = async () => {
    try {
      setLoading(true);
      
      const respostaData = await firebaseService.getById('respostas_anamnese', respostaId);
      
      if (!respostaData) {
        alert('Resposta não encontrada');
        navigate('/cliente/anamnese');
        return;
      }
      
      setResposta(respostaData);
      
      const formularioData = await firebaseService.getById('formularios_anamnese', respostaData.formularioId);
      setFormulario(formularioData);
      
      if (respostaData.atendimentoId) {
        const atend = await firebaseService.getById('atendimentos', respostaData.atendimentoId);
        setAtendimento(atend);
      } else if (respostaData.agendamentoId) {
        const agend = await firebaseService.getById('agendamentos', respostaData.agendamentoId);
        setAtendimento(agend);
      }
      
    } catch (error) {
      console.error('Erro ao carregar resposta:', error);
      alert('Erro ao carregar resposta');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    return format(new Date(data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatarDataSimples = (data) => {
    if (!data) return '';
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#9c27b0' }} />
      </Box>
    );
  }

  if (!resposta) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">Resposta não encontrada</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/cliente/anamnese')}
          sx={{ mt: 2, bgcolor: '#9c27b0' }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 8, px: 2 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/cliente/anamnese')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            {formulario?.titulo || 'Anamnese'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualização das respostas
          </Typography>
        </Box>
      </Box>

      {/* Informações do atendimento */}
      {atendimento && (
        <Card sx={{ mb: 4, bgcolor: '#faf5ff' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon sx={{ color: '#9c27b0' }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Data</Typography>
                    <Typography variant="body2">
                      {formatarDataSimples(atendimento.data)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon sx={{ color: '#9c27b0' }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Horário</Typography>
                    <Typography variant="body2">{atendimento.horario || atendimento.horaInicio}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: '#9c27b0' }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Profissional</Typography>
                    <Typography variant="body2">{resposta.profissionalNome || 'Não informado'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <AssignmentIcon sx={{ color: '#9c27b0' }} />
              <Typography variant="caption" color="textSecondary">
                Respondido em: {formatarData(resposta.respondidoEm)}
              </Typography>
            </Box>

            {/* ASSINATURA DIGITAL - VERSÃO SIMPLIFICADA */}
            {assinaturaSrc && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Assinatura Digital
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'white',
                    display: 'inline-block',
                    cursor: 'pointer',
                    border: '1px solid #9c27b0',
                    '&:hover': {
                      opacity: 0.9
                    }
                  }}
                  onClick={() => setModalAssinaturaAberta(true)}
                >
                  <img 
                    src={assinaturaSrc}
                    alt="Assinatura digital"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100px',
                      width: 'auto',
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.error('Erro ao carregar imagem');
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML += '<p style="color: red;">Erro ao carregar assinatura</p>';
                    }}
                  />
                </Paper>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#9c27b0' }}>
                  Clique na assinatura para ampliar
                </Typography>
              </Box>
            )}

            {/* Modal para ampliar */}
            <Dialog
              open={modalAssinaturaAberta}
              onClose={() => setModalAssinaturaAberta(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>
                Assinatura Digital
                <IconButton
                  onClick={() => setModalAssinaturaAberta(false)}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                <img 
                  src={assinaturaSrc}
                  alt="Assinatura digital ampliada"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '70vh',
                    width: 'auto'
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Respostas */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Respostas
          </Typography>

          {resposta.respostas?.map((item, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{ p: 2, mb: 2, bgcolor: index % 2 === 0 ? '#faf5ff' : 'white' }}
            >
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                {item.pergunta}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {Array.isArray(item.resposta) ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {item.resposta.map((opt, i) => (
                      <Chip key={i} label={opt} size="small" />
                    ))}
                  </Box>
                ) : (
                  item.resposta || <span style={{ color: '#999', fontStyle: 'italic' }}>Não respondido</span>
                )}
              </Typography>
            </Paper>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/cliente/anamnese')}
              sx={{ bgcolor: '#9c27b0' }}
            >
              Voltar para lista
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ClienteAnamneseVisualizar;
