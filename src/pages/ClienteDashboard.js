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

  // 🔥 FUNÇÃO CORRIGIDA PARA CARREGAR DADOS COM FALLBACK
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const uid = firebaseUser?.uid;
      const clienteDocId = cliente?.id;
      
      console.log('🔍 DEBUG - Firebase Auth UID:', uid);
      console.log('🔍 DEBUG - ID do documento cliente:', clienteDocId);

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

      // 🔥 CARREGAR AGENDAMENTOS - TENTAR TODOS OS IDs
      try {
        console.log('📌 Buscando agendamentos...');
        let todosAgendamentos = [];
        
        for (const id of idsParaBuscar) {
          const resultados = await firebaseService.query('agendamentos', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc');
          
          todosAgendamentos = [...todosAgendamentos, ...resultados];
          console.log(`✅ Encontrados ${resultados.length} agendamentos para ID: ${id}`);
        }
        
        // Remover duplicatas
        const agendamentosUnicos = Array.from(new Map(todosAgendamentos.map(item => [item.id, item])).values());
        
        console.log('✅ Total agendamentos únicos:', agendamentosUnicos.length);
        setAgendamentos(agendamentosUnicos);
      } catch (err) {
        console.error('❌ Erro ao carregar agendamentos:', err);
      }

      // 🔥 CARREGAR PONTUAÇÕES - TENTAR TODOS OS IDs
      try {
        let todasPontuacoes = [];
        
        for (const id of idsParaBuscar) {
          const resultados = await firebaseService.query('pontuacao', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc');
          
          todasPontuacoes = [...todasPontuacoes, ...resultados];
        }
        
        const pontuacoesUnicas = Array.from(new Map(todasPontuacoes.map(item => [item.id, item])).values());
        setPontuacoes(pontuacoesUnicas || []);
      } catch (err) {
        console.error('Erro ao carregar pontuações:', err);
      }

      // 🔥 CARREGAR RECOMPENSAS
      try {
        const recompensasData = await firebaseService.query('recompensas', [
          { field: 'ativo', operator: '==', value: true }
        ]);
        
        // Filtrar por nível do cliente (já calculado depois)
        setRecompensasDisponiveis(recompensasData?.slice(0, 5) || []);
      } catch (err) {
        console.error('Erro ao carregar recompensas:', err);
      }

      // 🔥 CARREGAR ATENDIMENTOS - TENTAR TODOS OS IDs
      try {
        let todosAtendimentos = [];
        
        for (const id of idsParaBuscar) {
          const resultados = await firebaseService.query('atendimentos', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc');
          
          todosAtendimentos = [...todosAtendimentos, ...resultados];
        }
        
        const atendimentosUnicos = Array.from(new Map(todosAtendimentos.map(item => [item.id, item])).values());
        setHistoricoAtendimentos(atendimentosUnicos?.slice(0, 5) || []);
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

    // Filtrar recompensas por nível
    const niveisOrdenados = ['bronze', 'prata', 'ouro', 'platina'];
    const indexNivelCliente = niveisOrdenados.indexOf(nivelAtual);
    
    // Esta parte precisa ser ajustada quando as recompensas forem carregadas
    // Por enquanto, mantemos como está

  }, [pontuacoes, agendamentos, nivel]);

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
      default: return status || 'Pendente';
    }
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

  const progressoParaProximoNivel = niveis[nivel]?.proximo 
    ? (saldo / niveis[nivel].proximo) * 100 
    : 100;

  const pontosFaltantes = niveis[nivel]?.proximo 
    ? niveis[nivel].proximo - saldo 
    : 0;

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
              {niveis[nivel]?.proximo && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'white' }}>
                    <Typography variant="body2">Progresso para {niveis[nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'platina']?.nome}</Typography>
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

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : proximosAgendamentos.length > 0 ? (
                  proximosAgendamentos.map((agendamento, index) => {
                    // Buscar nome do serviço dos servicos array ou do campo servicoNome
                    const servicoNome = agendamento.servicos?.[0]?.nome || agendamento.servicoNome || 'Serviço';
                    
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
                  Recompensas Disponíveis
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
                          sx={{ bgcolor: '#fff3e0', color: '#ff9800' }}
                        />
                        <Button 
                          size="small" 
                          sx={{ color: '#9c27b0' }}
                          onClick={() => navigate('/cliente/recompensas')}
                        >
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
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historicoAtendimentos.map((atendimento, index) => {
                      // Buscar nome do serviço dos servicos array ou do campo servicoNome
                      const servicoNome = atendimento.servicos?.[0]?.nome || atendimento.servicoNome || 'Serviço';
                      const profissionalNome = atendimento.profissionalNome || 'Profissional';
                      
                      return (
                        <TableRow key={atendimento.id || index}>
                          <TableCell>{formatarData(atendimento.data)}</TableCell>
                          <TableCell>{servicoNome}</TableCell>
                          <TableCell>{profissionalNome}</TableCell>
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
    </Box>
  );
}

export default ClienteDashboard;
