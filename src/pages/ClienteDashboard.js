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
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Zoom,
  Badge,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  CardGiftcard as GiftIcon,
  History as HistoryIcon,
  Event as EventIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  DateRange as DateRangeIcon,
  Redeem as RedeemIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';

function TabPanel({ children, value, index, isMobile }) {
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && (
        <Box sx={{ 
          p: isMobile ? 1 : 3,
          width: '100%'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Componente Mobile otimizado para cards
const MobileCard = ({ children, onClick, active }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileTap={{ scale: 0.98 }}
    style={{ width: '100%' }}
  >
    <Card 
      onClick={onClick}
      sx={{ 
        mb: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: active ? '4px solid #9c27b0' : 'none',
        backgroundColor: active ? '#faf5ff' : 'white',
        '&:active': {
          backgroundColor: '#f3e5f5',
        }
      }}
    >
      {children}
    </Card>
  </motion.div>
);

// Componente de carregamento otimizado
const LoadingSkeleton = () => (
  <Box sx={{ width: '100%', p: 2 }}>
    <LinearProgress sx={{ mb: 2 }} />
    <Grid container spacing={2}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#f0f0f0' }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ width: '60%', height: 20, bgcolor: '#f0f0f0', mb: 1 }} />
                  <Box sx={{ width: '40%', height: 16, bgcolor: '#f0f0f0' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

function ClienteDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const { cliente, logout, loading: authLoading, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState(0);
  
  // Dados do cliente
  const [agendamentos, setAgendamentos] = useState([]);
  const [pontuacoes, setPontuacoes] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [proximosAgendamentos, setProximosAgendamentos] = useState([]);
  const [historicoAtendimentos, setHistoricoAtendimentos] = useState([]);
  const [recompensasDisponiveis, setRecompensasDisponiveis] = useState([]);
  const [resgatesRecentes, setResgatesRecentes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);

  const niveis = {
    bronze: { cor: '#cd7f32', nome: 'Bronze', minimo: 0, proximo: 500, bg: '#fff3e0' },
    prata: { cor: '#c0c0c0', nome: 'Prata', minimo: 500, proximo: 2000, bg: '#f5f5f5' },
    ouro: { cor: '#ffd700', nome: 'Ouro', minimo: 2000, proximo: 5000, bg: '#fff9e6' },
    platina: { cor: '#e5e4e2', nome: 'Platina', minimo: 5000, proximo: null, bg: '#f0f0f0' },
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
      setError(null);

      const uid = firebaseUser?.uid;
      const clienteDocId = cliente?.id;

      if (!uid && !clienteDocId) {
        console.error('❌ IDs não encontrados');
        setError('Erro de autenticação. Faça login novamente.');
        return;
      }

      const idsParaBuscar = [];
      if (uid) idsParaBuscar.push(uid);
      if (clienteDocId && clienteDocId !== uid) idsParaBuscar.push(clienteDocId);

      // Carregar dados em paralelo para melhor performance
      const [
        profissionaisData,
        agendamentosData,
        pontuacoesData,
        recompensasData,
        resgatesData,
        atendimentosData
      ] = await Promise.allSettled([
        firebaseService.getAll('profissionais'),
        Promise.all(idsParaBuscar.map(id => 
          firebaseService.query('agendamentos', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc')
        )),
        Promise.all(idsParaBuscar.map(id => 
          firebaseService.query('pontuacao', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc')
        )),
        firebaseService.query('recompensas', [
          { field: 'ativo', operator: '==', value: true }
        ]),
        Promise.all(idsParaBuscar.map(id => 
          firebaseService.query('resgates_fidelidade', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc')
        )),
        Promise.all(idsParaBuscar.map(id => 
          firebaseService.query('atendimentos', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc')
        ))
      ]);

      // Processar resultados
      if (profissionaisData.status === 'fulfilled') {
        setProfissionais(profissionaisData.value || []);
      }

      if (agendamentosData.status === 'fulfilled') {
        const todosAgendamentos = agendamentosData.value.flat();
        const agendamentosUnicos = Array.from(new Map(todosAgendamentos.map(item => [item.id, item])).values());
        setAgendamentos(agendamentosUnicos);
      }

      if (pontuacoesData.status === 'fulfilled') {
        const todasPontuacoes = pontuacoesData.value.flat();
        const pontuacoesUnicas = Array.from(new Map(todasPontuacoes.map(item => [item.id, item])).values());
        setPontuacoes(pontuacoesUnicas);
      }

      if (recompensasData.status === 'fulfilled') {
        const recompensasOrdenadas = (recompensasData.value || []).sort((a, b) => 
          (a.pontosNecessarios || 0) - (b.pontosNecessarios || 0)
        );
        setRecompensasDisponiveis(recompensasOrdenadas.slice(0, 3));
      }

      if (resgatesData.status === 'fulfilled') {
        const todosResgates = resgatesData.value.flat();
        const resgatesUnicos = Array.from(new Map(todosResgates.map(item => [item.id, item])).values());
        setResgatesRecentes(resgatesUnicos.slice(0, 5));
      }

      if (atendimentosData.status === 'fulfilled') {
        const todosAtendimentos = atendimentosData.value.flat();
        const atendimentosUnicos = Array.from(new Map(todosAtendimentos.map(item => [item.id, item])).values());
        setHistoricoAtendimentos(atendimentosUnicos?.slice(0, 10) || []);
      }

    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
      setError('Alguns dados não puderam ser carregados. Tente atualizar a página.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular saldo e nível
  useEffect(() => {
    const creditos = pontuacoes
      .filter(p => p.tipo === 'credito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);
    const debitos = pontuacoes
      .filter(p => p.tipo === 'debito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);
    
    const saldoAtual = creditos - debitos;
    setSaldo(saldoAtual);

    let nivelAtual = 'bronze';
    if (saldoAtual >= 5000) nivelAtual = 'platina';
    else if (saldoAtual >= 2000) nivelAtual = 'ouro';
    else if (saldoAtual >= 500) nivelAtual = 'prata';
    setNivel(nivelAtual);

    const hoje = new Date().toISOString().split('T')[0];
    const proximos = agendamentos
      .filter(a => a.data >= hoje && a.status !== 'cancelado' && a.status !== 'finalizado')
      .sort((a, b) => a.data.localeCompare(b.data));
    setProximosAgendamentos(proximos.slice(0, 3));

  }, [pontuacoes, agendamentos]);

  const handleLogout = () => {
    logout();
    navigate('/cliente/login');
  };

  const handleAgendar = () => {
    navigate('/cliente/agendamentos');
  };

  const handleVerRecompensas = () => {
    navigate('/cliente/recompensas');
  };

  const handleRefresh = () => {
    carregarDados();
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

  const formatarData = (data) => {
    if (!data) return '-';
    try {
      const date = new Date(data);
      if (isMobile) {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return data;
    }
  };

  const formatarDataHora = (data) => {
    if (!data) return '-';
    try {
      const date = new Date(data);
      if (isMobile) {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return date.toLocaleString('pt-BR');
    } catch {
      return data;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmado': return 'success';
      case 'pendente': return 'warning';
      case 'cancelado': return 'error';
      case 'finalizado': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    if (isMobile) {
      switch(status?.toLowerCase()) {
        case 'confirmado': return 'Conf.';
        case 'pendente': return 'Pend.';
        case 'cancelado': return 'Canc.';
        case 'finalizado': return 'Real.';
        default: return status || 'Pend.';
      }
    }
    switch(status?.toLowerCase()) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Realizado';
      default: return status || 'Pendente';
    }
  };

  const getNivelInfo = () => {
    return niveis[nivel] || niveis.bronze;
  };

  const getPontosProximoNivel = () => {
    const info = getNivelInfo();
    return info.proximo ? info.proximo - saldo : 0;
  };

  const getProgressoProximoNivel = () => {
    const info = getNivelInfo();
    if (!info.proximo) return 100;
    return Math.min((saldo / info.proximo) * 100, 100);
  };

  const getProximoNivelNome = () => {
    if (nivel === 'bronze') return 'Prata';
    if (nivel === 'prata') return 'Ouro';
    if (nivel === 'ouro') return 'Platina';
    return null;
  };

  if (authLoading) {
    return <LoadingSkeleton />;
  }

  if (!cliente) {
    return null;
  }

  const nivelInfo = getNivelInfo();
  const pontosFaltantes = getPontosProximoNivel();
  const progresso = getProgressoProximoNivel();
  const proximoNivel = getProximoNivelNome();

  // Versão Mobile do Dashboard
  if (isMobile) {
    return (
      <Box sx={{ pb: 7 }}>
        {/* Header Mobile */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'white',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setMobileMenuOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              BeautyPro
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => navigate('/cliente/perfil')}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Menu Mobile Drawer */}
        <SwipeableDrawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onOpen={() => {}}
          PaperProps={{
            sx: { width: 280, bgcolor: '#faf5ff' }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => setMobileMenuOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                src={cliente.foto}
                sx={{ 
                  width: 80, 
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#9c27b0',
                }}
              >
                {!cliente.foto && getInitials(cliente.nome)}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {cliente.nome}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {cliente.email}
              </Typography>
            </Box>

            <List>
              <ListItem button onClick={() => { setMobileMenuOpen(false); navigate('/cliente/dashboard'); }}>
                <ListItemIcon><HomeIcon sx={{ color: '#9c27b0' }} /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button onClick={() => { setMobileMenuOpen(false); navigate('/cliente/agendamentos'); }}>
                <ListItemIcon><DateRangeIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                <ListItemText primary="Agendamentos" />
                {proximosAgendamentos.length > 0 && (
                  <Chip label={proximosAgendamentos.length} size="small" color="warning" />
                )}
              </ListItem>
              <ListItem button onClick={() => { setMobileMenuOpen(false); navigate('/cliente/recompensas'); }}>
                <ListItemIcon><RedeemIcon sx={{ color: '#4caf50' }} /></ListItemIcon>
                <ListItemText primary="Recompensas" />
              </ListItem>
              <ListItem button onClick={() => { setMobileMenuOpen(false); navigate('/cliente/pontos'); }}>
                <ListItemIcon><StarIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                <ListItemText primary="Meus Pontos" />
                <Chip label={saldo} size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
              </ListItem>
              <ListItem button onClick={() => { setMobileMenuOpen(false); navigate('/cliente/historico'); }}>
                <ListItemIcon><HistoryIcon sx={{ color: '#2196f3' }} /></ListItemIcon>
                <ListItemText primary="Histórico" />
              </ListItem>
              <ListItem button onClick={() => { setMobileMenuOpen(false); navigate('/cliente/perfil'); }}>
                <ListItemIcon><PersonIcon sx={{ color: '#9c27b0' }} /></ListItemIcon>
                <ListItemText primary="Perfil" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon><LogoutIcon sx={{ color: '#f44336' }} /></ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItem>
            </List>
          </Box>
        </SwipeableDrawer>

        {/* Conteúdo Principal Mobile */}
        <Box sx={{ p: 2 }}>
          {/* Card de Boas Vindas Mobile */}
          <Card sx={{ mb: 2, bgcolor: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Olá, {cliente.nome?.split(' ')[0]}! 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {proximosAgendamentos.length > 0 
                  ? `Você tem ${proximosAgendamentos.length} agendamento(s) agendados`
                  : 'Nenhum agendamento pendente'}
              </Typography>
            </CardContent>
          </Card>

          {/* Cards de Estatísticas Mobile */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', py: 1 }}>
                <CalendarIcon sx={{ color: '#9c27b0', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {proximosAgendamentos.length}
                </Typography>
                <Typography variant="caption">Agend.</Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', py: 1 }}>
                <StarIcon sx={{ color: '#ff9800', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {saldo}
                </Typography>
                <Typography variant="caption">Pontos</Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', py: 1 }}>
                <GiftIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {recompensasDisponiveis.length}
                </Typography>
                <Typography variant="caption">Recomp.</Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Card de Fidelidade Mobile */}
          <Card sx={{ mb: 2, bgcolor: nivelInfo.bg }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrophyIcon sx={{ fontSize: 40, color: nivelInfo.cor }} />
                <Box>
                  <Typography variant="subtitle2">Nível {nivelInfo.nome}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {saldo} pts
                  </Typography>
                </Box>
              </Box>
              {proximoNivel && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Progresso</Typography>
                    <Typography variant="caption">{pontosFaltantes} pts faltam</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progresso}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: nivelInfo.cor,
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Tabs Mobile */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Agendamentos" icon={<EventIcon />} iconPosition="start" />
              <Tab label="Histórico" icon={<HistoryIcon />} iconPosition="start" />
              <Tab label="Resgates" icon={<GiftIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0} isMobile>
            {loading ? (
              <CircularProgress />
            ) : proximosAgendamentos.length > 0 ? (
              <AnimatePresence>
                {proximosAgendamentos.map((agendamento, index) => (
                  <MobileCard key={agendamento.id || index}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {formatarData(agendamento.data)} • {agendamento.horario}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {agendamento.servicos?.[0]?.nome || agendamento.servicoNome}
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusLabel(agendamento.status)}
                          color={getStatusColor(agendamento.status)}
                          size="small"
                        />
                      </Box>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/cliente/agendamentos')}
                        sx={{ mt: 1, borderColor: '#9c27b0', color: '#9c27b0' }}
                      >
                        Ver detalhes
                      </Button>
                    </CardContent>
                  </MobileCard>
                ))}
              </AnimatePresence>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Nenhum agendamento futuro
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleAgendar}
                  sx={{ mt: 1, bgcolor: '#9c27b0' }}
                >
                  Agendar agora
                </Button>
              </Paper>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1} isMobile>
            {loading ? (
              <CircularProgress />
            ) : historicoAtendimentos.length > 0 ? (
              <AnimatePresence>
                {historicoAtendimentos.slice(0, 5).map((atend, index) => {
                  const profissional = profissionais.find(p => p.id === atend.profissionalId);
                  return (
                    <MobileCard key={atend.id || index}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {formatarData(atend.data)}
                          </Typography>
                          <Chip
                            size="small"
                            label="Realizado"
                            color="success"
                          />
                        </Box>
                        <Typography variant="body2">{atend.servicoNome}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            {profissional?.nome || 'Profissional'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#4caf50' }}>
                            R$ {atend.valorTotal?.toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </MobileCard>
                  );
                })}
              </AnimatePresence>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <HistoryIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Nenhum histórico encontrado
                </Typography>
              </Paper>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2} isMobile>
            {loading ? (
              <CircularProgress />
            ) : resgatesRecentes.length > 0 ? (
              <AnimatePresence>
                {resgatesRecentes.map((resgate, index) => (
                  <MobileCard key={resgate.id || index}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {resgate.recompensaNome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatarDataHora(resgate.data)}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`-${resgate.pontosGastos}`}
                          sx={{ bgcolor: '#ffebee', color: '#f44336' }}
                        />
                      </Box>
                    </CardContent>
                  </MobileCard>
                ))}
              </AnimatePresence>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <GiftIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Nenhum resgate realizado
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleVerRecompensas}
                  sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                >
                  Ver recompensas
                </Button>
              </Paper>
            )}
          </TabPanel>
        </Box>

        {/* Bottom Navigation Mobile */}
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: 10,
            borderTop: '1px solid #f0f0f0'
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={mobileTab}
            onChange={(event, newValue) => {
              setMobileTab(newValue);
              if (newValue === 0) navigate('/cliente/dashboard');
              if (newValue === 1) navigate('/cliente/agendamentos');
              if (newValue === 2) navigate('/cliente/recompensas');
              if (newValue === 3) navigate('/cliente/pontos');
            }}
            showLabels
          >
            <BottomNavigationAction label="Início" icon={<HomeIcon />} />
            <BottomNavigationAction 
              label="Agenda" 
              icon={
                <Badge badgeContent={proximosAgendamentos.length} color="secondary">
                  <DateRangeIcon />
                </Badge>
              } 
            />
            <BottomNavigationAction label="Recompensas" icon={<GiftIcon />} />
            <BottomNavigationAction label="Pontos" icon={<StarIcon />} />
          </BottomNavigation>
        </Paper>

        {/* FAB para ações rápidas */}
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              bgcolor: '#9c27b0',
              '&:hover': { bgcolor: '#7b1fa2' }
            }}
            onClick={handleAgendar}
          >
            <CalendarIcon />
          </Fab>
        </Zoom>
      </Box>
    );
  }

  // Versão Desktop (original, mantida)
  return (
    <Box>
      {/* Header com botão de atualizar */}
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
              width: 64, 
              height: 64,
              bgcolor: '#9c27b0',
              border: '3px solid white',
              boxShadow: '0 4px 15px rgba(156,39,176,0.3)'
            }}
          >
            {!cliente.foto && getInitials(cliente.nome)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Olá, {cliente.nome?.split(' ')[0]}!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {cliente.email} • Cliente desde {formatarData(cliente.dataCadastro)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Atualizar">
            <IconButton onClick={handleRefresh} sx={{ color: '#9c27b0' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
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

      {/* Mensagem de erro (se houver) */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ 
              bgcolor: '#f3e5f5', 
              height: '100%',
              '&:hover': { boxShadow: 6 }
            }}>
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
                    {proximosAgendamentos.length > 0 && (
                      <Typography variant="caption" color="textSecondary">
                        Próximo: {formatarData(proximosAgendamentos[0]?.data)}
                      </Typography>
                    )}
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
            <Card sx={{ 
              bgcolor: '#fff3e0', 
              height: '100%',
              '&:hover': { boxShadow: 6 }
            }}>
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
                    <Typography variant="caption" color="textSecondary">
                      Nível {nivelInfo.nome}
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
            <Card sx={{ 
              bgcolor: '#e8f5e8', 
              height: '100%',
              '&:hover': { boxShadow: 6 }
            }}>
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
                    <Typography variant="caption" color="textSecondary">
                      A partir de {recompensasDisponiveis[0]?.pontosNecessarios || 0} pontos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Card de Fidelidade */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
        '&:hover': { boxShadow: 8 }
      }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'white' }}>
                <TrophyIcon sx={{ fontSize: 64 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Nível {nivelInfo.nome.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {saldo} pontos acumulados
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {resgatesRecentes.length} recompensa(s) resgatada(s)
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {proximoNivel && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'white' }}>
                    <Typography variant="body2">Progresso para Nível {proximoNivel}</Typography>
                    <Typography variant="body2">{pontosFaltantes} pontos faltam</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progresso}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                    {Math.round(progresso)}% completo
                  </Typography>
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
          <Tab label="Resgates" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0} isMobile={false}>
        <Grid container spacing={3}>
          {/* Próximos Agendamentos */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Seus Agendamentos
                </Typography>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : proximosAgendamentos.length > 0 ? (
                  proximosAgendamentos.map((agendamento, index) => {
                    const servicoNome = agendamento.servicos?.[0]?.nome || 
                                        agendamento.servicoNome || 
                                        'Serviço';
                    
                    return (
                      <Card key={agendamento.id || index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon sx={{ color: '#9c27b0' }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {formatarData(agendamento.data)} às {agendamento.horario || '--:--'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                              {servicoNome}
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
                              onClick={() => navigate('/cliente/agendamentos')}
                            >
                              Detalhes
                            </Button>
                          </Grid>
                        </Grid>
                      </Card>
                    );
                  })
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
                  Recompensas em Destaque
                </Typography>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : recompensasDisponiveis.length > 0 ? (
                  recompensasDisponiveis.map((recompensa, index) => (
                    <Card key={recompensa.id || index} variant="outlined" sx={{ mb: 2, p: 2 }}>
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
                          label={`${recompensa.pontosNecessarios || 0} pontos`}
                          sx={{ 
                            bgcolor: saldo >= (recompensa.pontosNecessarios || 0) ? '#e8f5e8' : '#fff3e0',
                            color: saldo >= (recompensa.pontosNecessarios || 0) ? '#4caf50' : '#ff9800'
                          }}
                        />
                        <Button 
                          size="small" 
                          sx={{ color: '#9c27b0' }}
                          onClick={() => navigate('/cliente/recompensas')}
                        >
                          Ver
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

      <TabPanel value={tabValue} index={1} isMobile={false}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Histórico de Atendimentos
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : historicoAtendimentos.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Serviço</TableCell>
                      <TableCell>Profissional</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="right">Pontos</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historicoAtendimentos.map((atendimento, index) => {
                      const servicoNome = atendimento.servicos?.[0]?.nome || 
                                         atendimento.servicoNome || 
                                         'Serviço';
                      
                      let profissionalNome = 'Profissional não informado';
                      let profissionalFoto = null;
                      
                      if (atendimento.profissionalId && profissionais.length > 0) {
                        const profissional = profissionais.find(p => 
                          p.id === atendimento.profissionalId || 
                          p.uid === atendimento.profissionalId
                        );
                        if (profissional) {
                          profissionalNome = profissional.nome;
                          profissionalFoto = profissional.foto;
                        }
                      } else if (atendimento.profissionalNome) {
                        profissionalNome = atendimento.profissionalNome;
                      }
                      
                      const pontosGanhos = atendimento.pontosGanhos || 
                                          Math.floor((atendimento.valorTotal || 0) * 0.1);
                      
                      return (
                        <TableRow key={atendimento.id || index}>
                          <TableCell>{formatarData(atendimento.data)}</TableCell>
                          <TableCell>{servicoNome}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                src={profissionalFoto} 
                                sx={{ width: 32, height: 32, bgcolor: '#ff9800' }}
                              >
                                {!profissionalFoto && profissionalNome.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">
                                {profissionalNome}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            R$ {atendimento.valorTotal?.toFixed(2) || '0,00'}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              size="small"
                              label={`+${pontosGanhos}`}
                              sx={{ bgcolor: '#fff3e0', color: '#ff9800' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label="Realizado"
                              color="success"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

      <TabPanel value={tabValue} index={2} isMobile={false}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Histórico de Resgates
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : resgatesRecentes.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Recompensa</TableCell>
                      <TableCell align="right">Pontos Gastos</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resgatesRecentes.map((resgate, index) => (
                      <TableRow key={resgate.id || index}>
                        <TableCell>{formatarDataHora(resgate.data)}</TableCell>
                        <TableCell>{resgate.recompensaNome || 'Recompensa'}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={`-${resgate.pontosGastos || 0}`}
                            sx={{ bgcolor: '#ffebee', color: '#f44336' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={resgate.utilizado ? 'Utilizado' : 'Disponível'}
                            color={resgate.utilizado ? 'default' : 'success'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <GiftIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Você ainda não resgatou nenhuma recompensa
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleVerRecompensas}
                  sx={{ mt: 2, borderColor: '#9c27b0', color: '#9c27b0' }}
                >
                  Ver Recompensas Disponíveis
                </Button>
              </Paper>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}

export default ClienteDashboard;
