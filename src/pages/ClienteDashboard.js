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
  const { cliente, logout, loading: authLoading, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
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

  // 🔥 FUNÇÃO PARA CARREGAR DADOS COM FALLBACK
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const uid = firebaseUser?.uid;
      const clienteDocId = cliente?.id;
      
      console.log('🔍 DEBUG - Firebase Auth UID:', uid);
      console.log('🔍 DEBUG - ID do documento cliente:', clienteDocId);
      console.log('🔍 DEBUG - Email do cliente:', cliente?.email);

      if (!uid && !clienteDocId) {
        console.error('❌ IDs não encontrados');
        setError('Erro de autenticação. Faça login novamente.');
        return;
      }

      // Array de IDs para tentar (UID primeiro, depois ID do documento)
      const idsParaBuscar = [];
      if (uid) idsParaBuscar.push(uid);
      if (clienteDocId && clienteDocId !== uid) idsParaBuscar.push(clienteDocId);

      console.log('📌 IDs para busca:', idsParaBuscar);

      // 🔥 CARREGAR PROFISSIONAIS PRIMEIRO
      try {
        const profissionaisData = await firebaseService.getAll('profissionais');
        setProfissionais(profissionaisData || []);
        console.log('✅ Profissionais carregados:', profissionaisData?.length || 0);
      } catch (err) {
        console.error('Erro ao carregar profissionais:', err);
      }

      // 🔥 CARREGAR AGENDAMENTOS
      try {
        console.log('📌 Buscando agendamentos...');
        let todosAgendamentos = [];
        
        for (const id of idsParaBuscar) {
          const resultados = await firebaseService.query('agendamentos', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc');
          
          console.log(`✅ Encontrados ${resultados.length} agendamentos para ID: ${id}`);
          todosAgendamentos = [...todosAgendamentos, ...resultados];
        }
        
        // Remover duplicatas
        const agendamentosUnicos = Array.from(new Map(todosAgendamentos.map(item => [item.id, item])).values());
        
        console.log('✅ Total agendamentos únicos:', agendamentosUnicos.length);
        setAgendamentos(agendamentosUnicos);
      } catch (err) {
        console.error('❌ Erro ao carregar agendamentos:', err);
      }

      // 🔥 CARREGAR PONTUAÇÕES
      try {
        let todasPontuacoes = [];
        
        for (const id of idsParaBuscar) {
          const resultados = await firebaseService.query('pontuacao', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc');
          
          todasPontuacoes = [...todasPontuacoes, ...resultados];
        }
        
        const pontuacoesUnicas = Array.from(new Map(todasPontuacoes.map(item => [item.id, item])).values());
        console.log('✅ Pontuações carregadas:', pontuacoesUnicas.length);
        setPontuacoes(pontuacoesUnicas || []);
      } catch (err) {
        console.error('Erro ao carregar pontuações:', err);
      }

      // 🔥 CARREGAR RECOMPENSAS DISPONÍVEIS
      try {
        const recompensasData = await firebaseService.query('recompensas', [
          { field: 'ativo', operator: '==', value: true }
        ]);
        
        const recompensasOrdenadas = (recompensasData || []).sort((a, b) => 
          (a.pontosNecessarios || 0) - (b.pontosNecessarios || 0)
        );
        
        setRecompensasDisponiveis(recompensasOrdenadas.slice(0, 3));
        console.log('✅ Recompensas disponíveis:', recompensasOrdenadas.length);
      } catch (err) {
        console.error('Erro ao carregar recompensas:', err);
      }

      // 🔥 CARREGAR RESGATES DO CLIENTE
      try {
        let todosResgates = [];
        
        for (const id of idsParaBuscar) {
          const resultados = await firebaseService.query('resgates_fidelidade', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc');
          
          todosResgates = [...todosResgates, ...resultados];
        }
        
        const resgatesUnicos = Array.from(new Map(todosResgates.map(item => [item.id, item])).values());
        setResgatesRecentes(resgatesUnicos.slice(0, 5));
        console.log('✅ Resgates carregados:', resgatesUnicos.length);
      } catch (err) {
        console.error('Erro ao carregar resgates:', err);
      }

      // 🔥 CARREGAR ATENDIMENTOS
      try {
        let todosAtendimentos = [];
        
        for (const id of idsParaBuscar) {
          const resultados = await firebaseService.query('atendimentos', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc');
          
          todosAtendimentos = [...todosAtendimentos, ...resultados];
        }
        
        const atendimentosUnicos = Array.from(new Map(todosAtendimentos.map(item => [item.id, item])).values());
        setHistoricoAtendimentos(atendimentosUnicos?.slice(0, 10) || []);
        console.log('✅ Atendimentos carregados:', atendimentosUnicos.length);
      } catch (err) {
        console.error('Erro ao carregar atendimentos:', err);
      }

    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
      setError('Alguns dados não puderam ser carregados. Tente atualizar a página.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 CALCULAR SALDO E NÍVEL QUANDO PONTUAÇÕES MUDAREM
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

    // Filtrar próximos agendamentos (futuros e não cancelados/finalizados)
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
      return new Date(data).toLocaleDateString('pt-BR', {
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
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
    return (saldo / info.proximo) * 100;
  };

  const getProximoNivelNome = () => {
    if (nivel === 'bronze') return 'Prata';
    if (nivel === 'prata') return 'Ouro';
    if (nivel === 'ouro') return 'Platina';
    return null;
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cliente) {
    return null;
  }

  const nivelInfo = getNivelInfo();
  const pontosFaltantes = getPontosProximoNivel();
  const progresso = getProgressoProximoNivel();
  const proximoNivel = getProximoNivelNome();

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

      <TabPanel value={tabValue} index={0}>
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

      <TabPanel value={tabValue} index={1}>
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
                      
                      // 🔥 NOME DO PROFISSIONAL - Buscar na lista de profissionais
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

      <TabPanel value={tabValue} index={2}>
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
