// src/pages/ClienteAnamneseVisualizar.js
// VERSÃO OTIMIZADA PARA MOBILE

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
  useMediaQuery,
  useTheme,
  Divider,
  Fade,
  Zoom,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  FileCopy as FileCopyIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

function ClienteAnamneseVisualizar() {
  const navigate = useNavigate();
  const { respostaId } = useParams();
  const { cliente } = useAuthCliente();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [resposta, setResposta] = useState(null);
  const [formulario, setFormulario] = useState(null);
  const [atendimento, setAtendimento] = useState(null);
  const [modalAssinaturaAberta, setModalAssinaturaAberta] = useState(false);
  const [assinaturaSrc, setAssinaturaSrc] = useState(null);
  const [copiando, setCopiando] = useState(false);

  useEffect(() => {
    if (respostaId) {
      carregarResposta();
    }
  }, [respostaId]);

  useEffect(() => {
    if (resposta) {
      processarAssinatura();
    }
  }, [resposta]);

  const processarAssinatura = () => {
    let assinatura = null;
    
    const camposPossiveis = [
      'assinaturaUrl', 'assinatura', 'assinaturaDigital', 
      'assinaturaBase64', 'dataUrl', 'signature', 'signatureUrl'
    ];
    
    for (const campo of camposPossiveis) {
      if (resposta[campo]) {
        assinatura = resposta[campo];
        console.log(`✅ Assinatura encontrada no campo: ${campo}`);
        break;
      }
    }
    
    if (assinatura) {
      if (assinatura.startsWith('data:image')) {
        setAssinaturaSrc(assinatura);
      } else {
        const base64Pattern = /(?:base64,)?([A-Za-z0-9+/=]+)$/;
        const match = assinatura.match(base64Pattern);
        
        if (match && match[1]) {
          setAssinaturaSrc(`data:image/png;base64,${match[1]}`);
        } else {
          setAssinaturaSrc(`data:image/png;base64,${assinatura}`);
        }
      }
    }
  };

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

  const formatarHora = (hora) => {
    if (!hora) return '';
    return hora.substring(0, 5);
  };

  const copiarLink = async () => {
    setCopiando(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
    } finally {
      setTimeout(() => setCopiando(false), 1500);
    }
  };

  const renderSkeleton = () => (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />
      <Skeleton variant="text" width="90%" height={30} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={30} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="70%" height={30} />
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={isMobile ? 40 : 60} thickness={4} sx={{ color: '#9c27b0' }} />
      </Box>
    );
  }

  if (!resposta) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">Resposta não encontrada</Alert>
        <Button
          fullWidth={isMobile}
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
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      mt: isMobile ? 2 : 4, 
      mb: isMobile ? 4 : 8, 
      px: isMobile ? 1.5 : 2 
    }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 2 : 4 }}>
        <IconButton 
          onClick={() => navigate('/cliente/anamnese')} 
          sx={{ mr: isMobile ? 1 : 2, p: isMobile ? 1 : 1.5 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              fontWeight: 700, 
              color: '#9c27b0',
              fontSize: isMobile ? '1.25rem' : undefined,
              lineHeight: 1.2
            }}
          >
            {formulario?.titulo || 'Anamnese'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualização das respostas
          </Typography>
        </Box>
        
        {/* Botão copiar link (apenas desktop) */}
        {!isMobile && (
          <IconButton onClick={copiarLink} disabled={copiando} sx={{ color: '#9c27b0' }}>
            <FileCopyIcon />
          </IconButton>
        )}
      </Box>

      {/* Informações do atendimento */}
      {atendimento && (
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Card sx={{ 
            mb: isMobile ? 2 : 4, 
            bgcolor: '#faf5ff',
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden'
          }}>
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
                        {formatarDataSimples(atendimento.data)}
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
                        {formatarHora(atendimento.horario || atendimento.horaInicio)}
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
                        {resposta.profissionalNome || 'Não informado'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: isMobile ? 1.5 : 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon sx={{ color: '#9c27b0', fontSize: isMobile ? 16 : 18 }} />
                  <Typography variant="caption" color="textSecondary">
                    Respondido em: {formatarData(resposta.respondidoEm)}
                  </Typography>
                </Box>
                
                {/* Botão copiar link mobile */}
                {isMobile && (
                  <IconButton size="small" onClick={copiarLink} disabled={copiando} sx={{ color: '#9c27b0' }}>
                    <FileCopyIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              {/* ASSINATURA DIGITAL */}
              {assinaturaSrc && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Box sx={{ mt: isMobile ? 2 : 3, textAlign: 'center' }}>
                    <Typography 
                      variant="subtitle2" 
                      color="textSecondary" 
                      gutterBottom
                      sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                    >
                      Assinatura Digital
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: isMobile ? 1.5 : 2, 
                        bgcolor: 'white',
                        display: 'inline-block',
                        cursor: 'pointer',
                        border: '1px solid #9c27b0',
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 4px 12px rgba(156,39,176,0.2)'
                        }
                      }}
                      onClick={() => setModalAssinaturaAberta(true)}
                    >
                      <img 
                        src={assinaturaSrc}
                        alt="Assinatura digital"
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: isMobile ? '80px' : '100px',
                          width: 'auto',
                          display: 'block'
                        }}
                        onError={(e) => {
                          console.error('Erro ao carregar imagem');
                          e.target.style.display = 'none';
                        }}
                      />
                    </Paper>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1, 
                        color: '#9c27b0',
                        fontSize: isMobile ? '0.65rem' : '0.75rem'
                      }}
                    >
                      Clique na assinatura para ampliar
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </Zoom>
      )}

      {/* Respostas */}
      <Fade in={true} timeout={300}>
        <Card sx={{ borderRadius: isMobile ? 2 : 3 }}>
          <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: isMobile ? 2 : 3, 
                fontWeight: 600,
                fontSize: isMobile ? '1rem' : '1.25rem'
              }}
            >
              Respostas
            </Typography>

            <AnimatePresence>
              {resposta.respostas?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{ 
                      p: isMobile ? 1.5 : 2, 
                      mb: 1.5,
                      bgcolor: index % 2 === 0 ? '#faf5ff' : 'white',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: isMobile ? 'none' : 'translateX(4px)',
                        boxShadow: isMobile ? 'none' : '0 2px 8px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      color="textSecondary" 
                      gutterBottom
                      sx={{ 
                        fontSize: isMobile ? '0.7rem' : '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {item.pergunta}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500,
                        fontSize: isMobile ? '0.85rem' : '0.95rem',
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
                                fontSize: isMobile ? '0.65rem' : '0.75rem',
                                height: isMobile ? 24 : 28
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
                </motion.div>
              ))}
            </AnimatePresence>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: isMobile ? 2 : 3, px: 2 }}>
              <Button
                fullWidth={isMobile}
                variant="contained"
                onClick={() => navigate('/cliente/anamnese')}
                sx={{ 
                  bgcolor: '#9c27b0',
                  maxWidth: isMobile ? '100%' : '300px',
                  py: isMobile ? 1 : 1.5,
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#7b1fa2'
                  }
                }}
              >
                Voltar para lista
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Modal para ampliar assinatura */}
      <Dialog
        open={modalAssinaturaAberta}
        onClose={() => setModalAssinaturaAberta(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 2 : 3,
            m: isMobile ? 1 : 2,
            maxWidth: isMobile ? '95%' : 'md'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: isMobile ? 1.5 : 2,
          bgcolor: '#9c27b0',
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
            Assinatura Digital
          </Typography>
          <IconButton onClick={() => setModalAssinaturaAberta(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          textAlign: 'center', 
          py: isMobile ? 2 : 3,
          px: isMobile ? 2 : 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: isMobile ? '200px' : '300px'
        }}>
          <img 
            src={assinaturaSrc}
            alt="Assinatura digital ampliada"
            style={{ 
              maxWidth: '100%', 
              maxHeight: isMobile ? '50vh' : '70vh',
              width: 'auto',
              borderRadius: '8px'
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ClienteAnamneseVisualizar;
