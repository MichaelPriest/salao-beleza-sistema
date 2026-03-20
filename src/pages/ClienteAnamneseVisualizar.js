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
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
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

  const formatarDataSimples = (data) => {
    if (!data) return '';
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
  };

  // Função para renderizar a assinatura
  const renderizarAssinatura = () => {
    if (resposta.assinaturaUrl) {
      return (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Assinatura do Cliente
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              bgcolor: '#faf5ff',
              display: 'inline-block',
              maxWidth: '100%'
            }}
          >
            <img 
              src={resposta.assinaturaUrl} 
              alt="Assinatura do cliente"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '150px',
                objectFit: 'contain'
              }}
            />
          </Paper>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        px: 2
      }}>
        <CircularProgress size={50} thickness={4} sx={{ color: '#9c27b0' }} />
      </Box>
    );
  }

  if (!resposta) {
    return (
      <Box sx={{ p: 2, maxWidth: 600, mx: 'auto', mt: 2 }}>
        <Alert severity="error">Resposta não encontrada</Alert>
        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate('/cliente/anamnese')}
          sx={{ mt: 2, bgcolor: '#9c27b0' }}
        >
          Voltar para lista
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      mt: { xs: 1, sm: 2, md: 4 }, 
      mb: { xs: 4, sm: 6, md: 8 }, 
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      {/* Cabeçalho */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: { xs: 2, sm: 3, md: 4 },
        flexWrap: 'wrap',
        gap: 1
      }}>
        <IconButton 
          onClick={() => navigate('/cliente/anamnese')} 
          sx={{ 
            mr: 1,
            p: { xs: 1, sm: 1.5 }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: '#9c27b0',
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
              lineHeight: 1.2,
              wordBreak: 'break-word'
            }}
          >
            {formulario?.titulo || 'Anamnese'}
          </Typography>
          <Typography 
            variant="body2" 
            color="textSecondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Visualização das respostas
          </Typography>
        </Box>
      </Box>

      {/* Informações do atendimento */}
      {atendimento && (
        <Card sx={{ 
          mb: { xs: 2, sm: 3, md: 4 }, 
          bgcolor: '#faf5ff',
          borderRadius: { xs: 2, sm: 3 }
        }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  flexWrap: 'wrap'
                }}>
                  <EventIcon sx={{ color: '#9c27b0', fontSize: { xs: 20, sm: 24 } }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    >
                      Data
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      {formatarDataSimples(atendimento.data)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  flexWrap: 'wrap'
                }}>
                  <ScheduleIcon sx={{ color: '#9c27b0', fontSize: { xs: 20, sm: 24 } }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    >
                      Horário
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      {atendimento.horario || atendimento.horaInicio}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  flexWrap: 'wrap'
                }}>
                  <PersonIcon sx={{ color: '#9c27b0', fontSize: { xs: 20, sm: 24 } }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    >
                      Profissional
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      {resposta.profissionalNome || 'Não informado'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            {/* Data da resposta */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mt: 2,
              flexWrap: 'wrap'
            }}>
              <AssignmentIcon sx={{ color: '#9c27b0', fontSize: { xs: 18, sm: 20 } }} />
              <Typography 
                variant="caption" 
                color="textSecondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Respondido em: {formatarData(resposta.respondidoEm)}
              </Typography>
            </Box>

            {/* Assinatura - AGORA MOSTRA A ASSINATURA EM VEZ DA DATA */}
            {renderizarAssinatura()}
          </CardContent>
        </Card>
      )}

      {/* Respostas */}
      <Card sx={{ borderRadius: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: { xs: 2, sm: 3 }, 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
            }}
          >
            Respostas
          </Typography>

          {resposta.respostas?.map((item, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                mb: 1.5,
                bgcolor: index % 2 === 0 ? '#faf5ff' : 'white',
                borderRadius: 2
              }}
            >
              <Typography 
                variant="subtitle2" 
                color="textSecondary" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  fontWeight: 600
                }}
              >
                {item.pergunta}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                  wordBreak: 'break-word'
                }}
              >
                {Array.isArray(item.resposta) ? (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 0.5, 
                    flexWrap: 'wrap',
                    mt: 0.5
                  }}>
                    {item.resposta.map((opt, i) => (
                      <Chip 
                        key={i} 
                        label={opt} 
                        size="small"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          height: { xs: 24, sm: 28 }
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  item.resposta || (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                      Não respondido
                    </span>
                  )
                )}
              </Typography>
            </Paper>
          ))}

          {/* Botão de voltar */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: { xs: 2, sm: 3 },
            px: 2
          }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/cliente/anamnese')}
              sx={{ 
                bgcolor: '#9c27b0',
                maxWidth: { sm: '300px' },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.85rem', sm: '0.95rem' }
              }}
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
