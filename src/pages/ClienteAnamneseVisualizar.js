// src/pages//ClienteAnamneseVisualizar.js
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
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
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

  useEffect(() => {
    if (respostaId) {
      carregarResposta();
    }
  }, [respostaId]);

  const carregarResposta = async () => {
    try {
      setLoading(true);
      
      // Buscar a resposta
      const respostaData = await firebaseService.getById('respostas_anamnese', respostaId);
      console.log('📝 Resposta encontrada:', respostaData);
      
      if (!respostaData) {
        alert('Resposta não encontrada');
        navigate('/cliente/anamnese');
        return;
      }
      
      setResposta(respostaData);
      
      // Buscar o formulário
      const formularioData = await firebaseService.getById('formularios_anamnese', respostaData.formularioId);
      setFormulario(formularioData);
      
      // Buscar dados do atendimento/agendamento
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!resposta) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Resposta não encontrada</Alert>
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
                      {format(new Date(atendimento.data), 'dd/MM/yyyy')}
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
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
              Respondido em: {formatarData(resposta.respondidoEm)}
            </Typography>
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
