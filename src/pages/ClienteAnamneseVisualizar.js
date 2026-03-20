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
  ZoomIn as ZoomInIcon,
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

  // Função para processar a assinatura base64
  const processarAssinatura = () => {
    // Verifica todos os campos possíveis para a assinatura
    const assinaturaRaw = resposta.assinaturaUrl || resposta.assinatura || resposta.assinaturaDigital || resposta.assinaturaBase64;
    
    if (!assinaturaRaw) {
      return null;
    }

    console.log('📸 Assinatura encontrada (primeiros 50 caracteres):', assinaturaRaw.substring(0, 50));

    // Se já for uma data URL completa, retorna ela
    if (assinaturaRaw.startsWith('data:image')) {
      return assinaturaRaw;
    }

    // Se começar com o padrão base64 puro
    if (assinaturaRaw.match(/^[A-Za-z0-9+/=]+$/)) {
      return `data:image/png;base64,${assinaturaRaw}`;
    }

    // Se tiver o texto "data:image/png;base64," no meio
    if (assinaturaRaw.includes('base64,')) {
      const parts = assinaturaRaw.split('base64,');
      return `data:image/png;base64,${parts[1]}`;
    }

    // Se for apenas o código base64
    return `data:image/png;base64,${assinaturaRaw}`;
  };

  // Função para renderizar a assinatura
  const renderizarAssinatura = () => {
    const src = processarAssinatura();
    
    if (!src) {
      return null;
    }

    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography 
          variant="subtitle2" 
          color="textSecondary" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 600
          }}
        >
          Assinatura Digital
        </Typography>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            bgcolor: '#faf5ff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            border: '1px dashed #9c27b0',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: '#f3e5f5',
              border: '1px solid #9c27b0',
            }
          }}
          onClick={() => setModalAssinaturaAberta(true)}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 1,
            mb: 1
          }}>
            <ZoomInIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
            <Typography variant="caption" sx={{ color: '#9c27b0', fontWeight: 500 }}>
              Clique para ampliar
            </Typography>
          </Box>
          
          {/* Miniatura da assinatura */}
          <Box sx={{
            width: '100%',
            maxHeight: '80px',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img 
              src={src}
              alt="Assinatura digital"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '80px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem');
                e.target.style.display = 'none';
                const parent = e.target.parentNode;
                const fallback = document.createElement('div');
                fallback.innerHTML = `
                  <div style="text-align: center; color: #666; padding: 10px;">
                    <p style="margin: 0; font-size: 0.875rem;">⚠️ Erro ao carregar assinatura</p>
                  </div>
                `;
                parent.appendChild(fallback);
              }}
            />
          </Box>
        </Paper>

        {/* Modal para visualização ampliada */}
        <Dialog
          open={modalAssinaturaAberta}
          onClose={() => setModalAssinaturaAberta(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              m: { xs: 1, sm: 2 }
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            py: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 3 }
          }}>
            <Typography variant="h6" sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: '#9c27b0',
              fontWeight: 600
            }}>
              Assinatura Digital
            </Typography>
            <IconButton
              onClick={() => setModalAssinaturaAberta(false)}
              size="small"
              sx={{ color: '#666' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ 
            p: { xs: 2, sm: 3 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: { xs: '250px', sm: '300px' }
          }}>
            <img 
              src={src}
              alt="Assinatura digital"
              style={{ 
                maxWidth: '100%', 
                maxHeight: { xs: '300px', sm: '400px' },
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </DialogContent>
        </Dialog>
      </Box>
    );
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon sx={{ color: '#9c27b0', fontSize: { xs: 20, sm: 24 } }} />
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
                  <ScheduleIcon sx={{ color: '#9c27b0', fontSize: { xs: 20, sm: 24 } }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Horário</Typography>
                    <Typography variant="body2">{atendimento.horario || atendimento.horaInicio}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: '#9c27b0', fontSize: { xs: 20, sm: 24 } }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Profissional</Typography>
                    <Typography variant="body2">{resposta.profissionalNome || 'Não informado'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <AssignmentIcon sx={{ color: '#9c27b0', fontSize: { xs: 18, sm: 20 } }} />
              <Typography variant="caption" color="textSecondary">
                Respondido em: {formatarData(resposta.respondidoEm)}
              </Typography>
            </Box>

            {/* Assinatura */}
            {renderizarAssinatura()}
          </CardContent>
        </Card>
      )}

      {/* Respostas */}
      <Card sx={{ borderRadius: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
          <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 600 }}>
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
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                {item.pergunta}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {Array.isArray(item.resposta) ? (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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
              fullWidth
              variant="contained"
              onClick={() => navigate('/cliente/anamnese')}
              sx={{ 
                bgcolor: '#9c27b0',
                maxWidth: { sm: '300px' }
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
