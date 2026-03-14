// src/pages/ClienteDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  CardGiftcard as GiftIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function ClienteDashboard() {
  const navigate = useNavigate();
  const { cliente, logout, loading: authLoading } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Dados do cliente
  const [agendamentos, setAgendamentos] = useState([]);
  const [pontuacoes, setPontuacoes] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [proximosAgendamentos, setProximosAgendamentos] = useState([]);
  const [historicoAtendimentos, setHistoricoAtendimentos] = useState([]);
  const [recompensasDisponiveis, setRecompensasDisponiveis] = useState([]);

  const niveis = {
    bronze: { cor: '#cd7f32', nome: 'Bronze', minimo: 0, proximo: 500 },
    prata: { cor: '#c0c0c0', nome: 'Prata', minimo: 500, proximo: 2000 },
    ouro: { cor: '#ffd700', nome: 'Ouro', minimo: 2000, proximo: 5000 },
    platina: { cor: '#e5e4e2', nome: 'Platina', minimo: 5000, proximo: null },
  };

  useEffect(() => {
    if (!cliente && !authLoading) {
      navigate('/cliente/login');
    } else if (cliente) {
      carregarDados();
    }
  }, [cliente, authLoading]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar agendamentos do cliente
      const agendamentosData = await firebaseService.query('agendamentos', [
        { field: 'clienteId', operator: '==', value: cliente.id }
      ], 'data', 'desc');
      setAgendamentos(agendamentosData || []);

      // Filtrar próximos agendamentos
      const hoje = new Date().toISOString().split('T')[0];
      const proximos = (agendamentosData || [])
        .filter(a => a.data >= hoje && a.status !== 'cancelado')
        .sort((a, b) => a.data.localeCompare(b.data));
      setProximosAgendamentos(proximos.slice(0, 3));

      // Carregar pontuações
      const pontuacoesData = await firebaseService.query('pontuacao', [
        { field: 'clienteId', operator: '==', value: cliente.id }
      ], 'data', 'desc');
      setPontuacoes(pontuacoesData || []);

      // Calcular saldo
      const creditos = (pontuacoesData || [])
        .filter(p => p.tipo === 'credito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);
      const debitos = (pontuacoesData || [])
        .filter(p => p.tipo === 'debito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);
      
      const saldoAtual = creditos - debitos;
      setSaldo(saldoAtual);

      // Determinar nível
      let nivelAtual = 'bronze';
      if (saldoAtual >= 5000) nivelAtual = 'platina';
      else if (saldoAtual >= 2000) nivelAtual = 'ouro';
      else if (saldoAtual >= 500) nivelAtual = 'prata';
      setNivel(nivelAtual);

      // Carregar atendimentos (histórico)
      const atendimentosData = await firebaseService.query('atendimentos', [
        { field: 'clienteId', operator: '==', value: cliente.id }
      ], 'data', 'desc');
      setHistoricoAtendimentos(atendimentosData?.slice(0, 5) || []);

      // Carregar recompensas disponíveis
      const recompensasData = await firebaseService.query('recompensas', [
        { field: 'ativo', operator: '==', value: true }
      ]);
      
      // Filtrar por nível
      const recompensasFiltradas = (recompensasData || []).filter(r => {
        const niveisOrdenados = ['bronze', 'prata', 'ouro', 'platina'];
        const indexNivelCliente = niveisOrdenados.indexOf(nivelAtual);
        const indexNivelRecompensa = niveisOrdenados.indexOf(r.nivelMinimo);
        return indexNivelCliente >= indexNivelRecompensa;
      });
      
      setRecompensasDisponiveis(recompensasFiltradas.slice(0, 3));

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/cliente/login');
  };

  const handleAgendar = () => {
    navigate('/cliente/agendamento');
  };

  const handleVerRecompensas = () => {
    navigate('/cliente/recompensas');
  };

  const handleVerHistorico = () => {
    setTabValue(1);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmado': return 'success';
      case 'pendente': return 'warning';
      case 'cancelado': return 'error';
      case 'finalizado': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Realizado';
      default: return status;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!cliente) {
    return null;
  }

  const progressoParaProximoNivel = niveis[nivel].proximo 
    ? (saldo / niveis[nivel].proximo) * 100 
    : 100;

  const pontosFaltantes = niveis[nivel].proximo 
    ? niveis[nivel].proximo - saldo 
    : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={cliente.foto}
            sx={{ 
              width: 56, 
              height: 56,
              bgcolor: '#9c27b0',
              border: '2px solid white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            {!cliente.foto && getInitials(cliente.nome)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Olá, {cliente.nome?.split(' ')[0]}!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Bem-vindo(a) à sua área exclusiva
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Configurações">
            <IconButton onClick={() => navigate('/cliente/perfil')} sx={{ color: '#9c27b0' }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sair">
            <IconButton onClick={handleLogout} sx={{ color: '#f44336' }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ bgcolor: '#f3e5f5', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                    <EventIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                      {proximosAgendamentos.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Próximos agendamentos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                    <StarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {saldo}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pontos acumulados
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: '#e8f5e8', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                    <GiftIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {recompensasDisponiveis.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Recompensas disponíveis
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Card de Fidelidade */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'white' }}>
                <TrophyIcon sx={{ fontSize: 48 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Nível {nivel.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {saldo} pontos acumulados
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {niveis[nivel].proximo && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'white' }}>
                    <Typography variant="body2">Progresso para {niveis[nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'platina'].nome}</Typography>
                    <Typography variant="body2">{pontosFaltantes} pontos faltam</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressoParaProximoNivel}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                      },
                    }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Próximos Agendamentos" />
          <Tab label="Histórico" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Próximos Agendamentos */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Seus Agendamentos
                </Typography>

                {proximosAgendamentos.length > 0 ? (
                  proximosAgendamentos.map((agendamento, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon sx={{ color: '#9c27b0' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {formatarData(agendamento.data)} às {agendamento.horario}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {agendamento.servicoNome || 'Serviço'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Chip
                            label={getStatusLabel(agendamento.status)}
                            color={getStatusColor(agendamento.status)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                          >
                            Detalhes
                          </Button>
                        </Grid>
                      </Grid>
                    </Card>
                  ))
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      Você não tem agendamentos futuros
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleAgendar}
                      sx={{ mt: 2, bgcolor: '#9c27b0' }}
                    >
                      Agendar Agora
                    </Button>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recompensas Disponíveis */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recompensas Disponíveis
                </Typography>

                {recompensasDisponiveis.length > 0 ? (
                  recompensasDisponiveis.map((recompensa, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <GiftIcon sx={{ color: '#ff9800' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {recompensa.nome}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {recompensa.descricao}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Chip
                          size="small"
                          label={`${recompensa.pontosNecessarios} pontos`}
                          sx={{ bgcolor: '#fff3e0', color: '#ff9800' }}
                        />
                        <Button size="small" sx={{ color: '#9c27b0' }}>
                          Resgatar
                        </Button>
                      </Box>
                    </Card>
                  ))
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Nenhuma recompensa disponível no momento
                    </Typography>
                  </Paper>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleVerRecompensas}
                  sx={{ mt: 2, borderColor: '#9c27b0', color: '#9c27b0' }}
                >
                  Ver Todas as Recompensas
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Histórico de Atendimentos
            </Typography>

            {historicoAtendimentos.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Serviço</TableCell>
                      <TableCell>Profissional</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historicoAtendimentos.map((atendimento, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatarData(atendimento.data)}</TableCell>
                        <TableCell>{atendimento.servicoNome || 'Serviço'}</TableCell>
                        <TableCell>{atendimento.profissionalNome || '-'}</TableCell>
                        <TableCell align="right">
                          R$ {atendimento.valorTotal?.toFixed(2) || '0,00'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label="Realizado"
                            color="success"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Nenhum histórico de atendimentos encontrado
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}

export default ClienteDashboard;
