// src/pages/MeusPontos.js
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Rating,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  Redeem as RewardIcon,
  History as HistoryIcon,
  MonetizationOn as CoinIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useFirebase } from '../hooks/useFirebase';
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Níveis de fidelidade
const niveis = {
  bronze: { cor: '#cd7f32', corFundo: '#fff3e0', minimo: 0, multiplicador: 1 },
  prata: { cor: '#c0c0c0', corFundo: '#f5f5f5', minimo: 500, multiplicador: 1.2 },
  ouro: { cor: '#ffd700', corFundo: '#fff9e6', minimo: 2000, multiplicador: 1.5 },
  platina: { cor: '#e5e4e2', corFundo: '#f0f0f0', minimo: 5000, multiplicador: 2 },
};

// Benefícios por nível
const beneficios = {
  bronze: ['5% de desconto em serviços', 'Pontuação normal', 'Aniversário: 50 pontos extras'],
  prata: ['10% de desconto em serviços', '1.2x pontos', 'Prioridade no agendamento', 'Cortesia no aniversário'],
  ouro: ['15% de desconto em serviços', '1.5x pontos', 'Agendamento VIP', 'Brinde surpresa', 'Convite para eventos'],
  platina: ['20% de desconto em serviços', '2x pontos', 'Acesso antecipado a promoções', 'Presente de aniversário', 'Consultoria exclusiva'],
};

function MeusPontos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [pontuacao, setPontuacao] = useState([]);
  const [resgates, setResgates] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [progresso, setProgresso] = useState(0);
  const [pontosFaltantes, setPontosFaltantes] = useState(0);
  const [recompensasDisponiveis, setRecompensasDisponiveis] = useState([]);
  const [ultimosPontos, setUltimosPontos] = useState([]);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (!usuarioStr) {
        toast.error('Usuário não encontrado');
        navigate('/login');
        return;
      }

      const user = JSON.parse(usuarioStr);
      setUsuario(user);

      if (!user.clienteId) {
        toast.error('Você não possui um perfil de cliente');
        return;
      }

      await carregarDadosCliente(user.clienteId);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const carregarDadosCliente = async (clienteId) => {
    try {
      // Carregar dados do cliente
      const clienteData = await firebaseService.getById('clientes', clienteId);
      setCliente(clienteData);

      // Carregar pontuação
      const pontuacaoData = await firebaseService.query('pontuacao', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]).catch(() => []);
      
      setPontuacao(pontuacaoData || []);

      // Carregar resgates
      const resgatesData = await firebaseService.query('resgates_fidelidade', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]).catch(() => []);
      
      setResgates(resgatesData || []);

      // Carregar recompensas disponíveis
      const recompensasData = await firebaseService.getAll('recompensas').catch(() => []);
      setRecompensasDisponiveis(recompensasData || []);

      // Calcular saldo
      const pontosGanhos = (pontuacaoData || [])
        .filter(p => p.tipo === 'credito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);

      const pontosGastos = (pontuacaoData || [])
        .filter(p => p.tipo === 'debito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);

      const saldoAtual = pontosGanhos - pontosGastos;
      setSaldo(saldoAtual);

      // Determinar nível
      let nivelAtual = 'bronze';
      if (saldoAtual >= 5000) nivelAtual = 'platina';
      else if (saldoAtual >= 2000) nivelAtual = 'ouro';
      else if (saldoAtual >= 500) nivelAtual = 'prata';
      setNivel(nivelAtual);

      // Calcular progresso para próximo nível
      const proximoNivel = nivelAtual === 'bronze' ? 'prata' : 
                          nivelAtual === 'prata' ? 'ouro' : 
                          nivelAtual === 'ouro' ? 'platina' : null;

      if (proximoNivel) {
        const pontosProximo = niveis[proximoNivel].minimo;
        const pontosAtualNivel = niveis[nivelAtual].minimo;
        const progressoCalculado = ((saldoAtual - pontosAtualNivel) / (pontosProximo - pontosAtualNivel)) * 100;
        setProgresso(Math.min(progressoCalculado, 100));
        setPontosFaltantes(pontosProximo - saldoAtual);
      } else {
        setProgresso(100);
        setPontosFaltantes(0);
      }

      // Últimos pontos (últimos 10)
      const ultimos = [...(pontuacaoData || [])]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 10);
      setUltimosPontos(ultimos);

    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const irParaRecompensas = () => {
    navigate('/fidelidade/recompensas');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cliente) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Você não está vinculado a um perfil de cliente.
          Entre em contato com o administrador.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Meus Pontos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Acompanhe sua pontuação e benefícios
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<GiftIcon />}
          onClick={irParaRecompensas}
          sx={{ bgcolor: '#9c27b0' }}
        >
          Ver Recompensas
        </Button>
      </Box>

      {/* Card Principal */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: niveis[nivel].corFundo,
            border: `2px solid ${niveis[nivel].cor}`,
            height: '100%'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: niveis[nivel].cor, 
                width: 80, 
                height: 80,
                margin: '0 auto 16px'
              }}>
                <TrophyIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h3" sx={{ fontWeight: 700, color: niveis[nivel].cor, mb: 1 }}>
                {saldo}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Pontos Acumulados
              </Typography>
              
              <Chip
                label={nivel.toUpperCase()}
                sx={{
                  bgcolor: niveis[nivel].cor,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 2,
                  mt: 1
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Progresso para o próximo nível
              </Typography>

              {nivel !== 'platina' ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Nível atual: {nivel.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Faltam {pontosFaltantes} pontos
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={progresso}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      mb: 2,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: niveis[nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'platina'].cor,
                      },
                    }}
                  />

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Próximo nível: {
                      nivel === 'bronze' ? 'PRATA (500 pontos)' :
                      nivel === 'prata' ? 'OURO (2.000 pontos)' :
                      'PLATINA (5.000 pontos)'
                    }
                  </Typography>
                </>
              ) : (
                <Alert severity="success" icon={<TrophyIcon />}>
                  Parabéns! Você atingiu o nível máximo (PLATINA).
                </Alert>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Benefícios do seu nível
              </Typography>

              <Grid container spacing={2}>
                {beneficios[nivel].map((beneficio, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                      <Typography variant="body2">{beneficio}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4caf50' }}>
                  <CheckIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {pontuacao.filter(p => p.tipo === 'credito').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Créditos recebidos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#f44336' }}>
                  <CancelIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {pontuacao.filter(p => p.tipo === 'debito').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Débitos realizados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800' }}>
                  <GiftIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {resgates.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Recompensas resgatadas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {recompensasDisponiveis.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Recompensas disponíveis
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Últimas Movimentações */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Últimas Movimentações
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell><strong>Descrição</strong></TableCell>
                  <TableCell align="right"><strong>Pontos</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ultimosPontos.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{formatarData(item.data)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.tipo === 'credito' ? 'Crédito' : 'Débito'}
                        color={item.tipo === 'credito' ? 'success' : 'error'}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>{item.motivo || '—'}</TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: item.tipo === 'credito' ? '#4caf50' : '#f44336',
                        }}
                      >
                        {item.tipo === 'credito' ? '+' : '-'}{item.quantidade}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}

                {ultimosPontos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <InfoIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography color="textSecondary">
                        Nenhuma movimentação encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pontuacao.length > 10 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Mostrando as 10 últimas movimentações de {pontuacao.length}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default MeusPontos;
