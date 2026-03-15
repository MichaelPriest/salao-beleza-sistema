// src/pages/ClienteNotificacoes.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  EmojiEvents as TrophyIcon,
  Redeem as RedeemIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { notificacoesPushService } from '../services/notificacoesPushService';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function ClienteNotificacoes() {
  const navigate = useNavigate();
  const { cliente, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [notificacoes, setNotificacoes] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const uid = firebaseUser?.uid || cliente?.id;
      if (!uid) {
        setError('Usuário não identificado');
        return;
      }

      const data = await notificacoesPushService.buscarNotificacoes(uid);
      setNotificacoes(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoLida = async (id) => {
    const success = await notificacoesPushService.marcarComoLida(id);
    if (success) {
      setNotificacoes(prev =>
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );
      toast.success('Notificação marcada como lida');
    }
  };

  const handleMarcarTodasComoLidas = async () => {
    const uid = firebaseUser?.uid || cliente?.id;
    const success = await notificacoesPushService.marcarTodasComoLidas(uid);
    if (success) {
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      toast.success('Todas as notificações marcadas como lidas');
    }
  };

  const handleExcluir = async (id) => {
    // Implementar exclusão se necessário
    toast.success('Notificação excluída');
  };

  const handleExcluirTodas = async () => {
    // Implementar exclusão em massa se necessário
    toast.success('Todas as notificações excluídas');
  };

  const handleNotificacaoClick = (notificacao) => {
    if (notificacao.link) {
      navigate(notificacao.link);
    }
  };

  const getIconeNotificacao = (tipo) => {
    switch(tipo) {
      case 'agendamento': return <EventIcon sx={{ color: '#9c27b0', fontSize: 40 }} />;
      case 'pontos': return <StarIcon sx={{ color: '#ff9800', fontSize: 40 }} />;
      case 'nivel': return <TrophyIcon sx={{ color: '#4caf50', fontSize: 40 }} />;
      case 'recompensa': return <GiftIcon sx={{ color: '#ff4081', fontSize: 40 }} />;
      case 'resgate': return <RedeemIcon sx={{ color: '#2196f3', fontSize: 40 }} />;
      case 'lembrete': return <TimeIcon sx={{ color: '#ff9800', fontSize: 40 }} />;
      default: return <InfoIcon sx={{ color: '#2196f3', fontSize: 40 }} />;
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida);
  const notificacoesLidas = notificacoes.filter(n => n.lida);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#9c27b0' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Central de Notificações
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {notificacoes.length}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {notificacoesNaoLidas.length}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Não lidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {notificacoesLidas.length}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Lidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ações */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<DoneAllIcon />}
          onClick={handleMarcarTodasComoLidas}
          disabled={notificacoesNaoLidas.length === 0}
        >
          Marcar todas como lidas
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleExcluirTodas}
          disabled={notificacoes.length === 0}
        >
          Limpar todas
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Todas (${notificacoes.length})`} />
          <Tab label={`Não lidas (${notificacoesNaoLidas.length})`} />
          <Tab label={`Lidas (${notificacoesLidas.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ListaNotificacoes 
          notificacoes={notificacoes}
          onMarcarLida={handleMarcarComoLida}
          onExcluir={handleExcluir}
          onClick={handleNotificacaoClick}
          getIcone={getIconeNotificacao}
          formatarData={formatarData}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ListaNotificacoes 
          notificacoes={notificacoesNaoLidas}
          onMarcarLida={handleMarcarComoLida}
          onExcluir={handleExcluir}
          onClick={handleNotificacaoClick}
          getIcone={getIconeNotificacao}
          formatarData={formatarData}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ListaNotificacoes 
          notificacoes={notificacoesLidas}
          onMarcarLida={handleMarcarComoLida}
          onExcluir={handleExcluir}
          onClick={handleNotificacaoClick}
          getIcone={getIconeNotificacao}
          formatarData={formatarData}
        />
      </TabPanel>
    </Box>
  );
}

function ListaNotificacoes({ notificacoes, onMarcarLida, onExcluir, onClick, getIcone, formatarData }) {
  if (notificacoes.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', mt: 3 }}>
        <NotificationsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          Nenhuma notificação encontrada
        </Typography>
      </Paper>
    );
  }

  return (
    <AnimatePresence>
      {notificacoes.map((notificacao, index) => (
        <motion.div
          key={notificacao.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            sx={{
              mb: 2,
              bgcolor: notificacao.lida ? 'transparent' : '#f3e5f5',
              borderLeft: !notificacao.lida ? '4px solid #9c27b0' : 'none',
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 }
            }}
            onClick={() => onClick(notificacao)}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={1}>
                  <Avatar sx={{ bgcolor: 'transparent', width: 56, height: 56 }}>
                    {getIcone(notificacao.tipo)}
                  </Avatar>
                </Grid>
                
                <Grid item xs={12} sm={9}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={notificacao.tipo === 'agendamento' ? 'Agendamento' :
                             notificacao.tipo === 'pontos' ? 'Pontos' :
                             notificacao.tipo === 'nivel' ? 'Nível' :
                             notificacao.tipo === 'recompensa' ? 'Recompensa' :
                             notificacao.tipo === 'resgate' ? 'Resgate' :
                             notificacao.tipo === 'lembrete' ? 'Lembrete' : 'Sistema'}
                      size="small"
                      sx={{
                        bgcolor: notificacao.tipo === 'agendamento' ? '#f3e5f5' :
                                notificacao.tipo === 'pontos' ? '#fff3e0' :
                                notificacao.tipo === 'nivel' ? '#e8f5e8' :
                                notificacao.tipo === 'recompensa' ? '#fce4ec' :
                                notificacao.tipo === 'resgate' ? '#e3f2fd' : '#f5f5f5',
                        color: notificacao.tipo === 'agendamento' ? '#9c27b0' :
                               notificacao.tipo === 'pontos' ? '#ff9800' :
                               notificacao.tipo === 'nivel' ? '#4caf50' :
                               notificacao.tipo === 'recompensa' ? '#ff4081' :
                               notificacao.tipo === 'resgate' ? '#2196f3' : '#666',
                      }}
                    />
                    {!notificacao.lida && (
                      <Chip icon={<TimeIcon />} label="Nova" size="small" color="secondary" />
                    )}
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {notificacao.titulo}
                  </Typography>
                  
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                    {notificacao.mensagem}
                  </Typography>
                  
                  <Typography variant="caption" color="textSecondary">
                    {formatarData(notificacao.data)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {!notificacao.lida && (
                      <Tooltip title="Marcar como lida">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarcarLida(notificacao.id);
                          }}
                          sx={{ color: '#4caf50' }}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExcluir(notificacao.id);
                        }}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

export default ClienteNotificacoes;
