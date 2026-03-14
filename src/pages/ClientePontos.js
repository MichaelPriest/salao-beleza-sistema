// src/pages/ClientePontos.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';

const niveis = {
  bronze: { cor: '#cd7f32', nome: 'Bronze', minimo: 0, proximo: 500 },
  prata: { cor: '#c0c0c0', nome: 'Prata', minimo: 500, proximo: 2000 },
  ouro: { cor: '#ffd700', nome: 'Ouro', minimo: 2000, proximo: 5000 },
  platina: { cor: '#e5e4e2', nome: 'Platina', minimo: 5000, proximo: null },
};

function ClientePontos() {
  const { cliente } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [pontuacoes, setPontuacoes] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [estatisticas, setEstatisticas] = useState({
    totalGanhos: 0,
    totalGastos: 0,
    totalTransacoes: 0,
  });

  useEffect(() => {
    if (cliente) {
      carregarPontuacoes();
    }
  }, [cliente]);

  const carregarPontuacoes = async () => {
    try {
      setLoading(true);

      const pontuacoesData = await firebaseService.query('pontuacao', [
        { field: 'clienteId', operator: '==', value: cliente.id }
      ], 'data', 'desc');

      setPontuacoes(pontuacoesData || []);

      const creditos = (pontuacoesData || [])
        .filter(p => p.tipo === 'credito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);
      const debitos = (pontuacoesData || [])
        .filter(p => p.tipo === 'debito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);
      
      const saldoAtual = creditos - debitos;
      setSaldo(saldoAtual);

      let nivelAtual = 'bronze';
      if (saldoAtual >= 5000) nivelAtual = 'platina';
      else if (saldoAtual >= 2000) nivelAtual = 'ouro';
      else if (saldoAtual >= 500) nivelAtual = 'prata';
      setNivel(nivelAtual);

      setEstatisticas({
        totalGanhos: creditos,
        totalGastos: debitos,
        totalTransacoes: pontuacoesData?.length || 0,
      });

    } catch (error) {
      console.error('Erro ao carregar pontuações:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressoParaProximoNivel = niveis[nivel].proximo 
    ? (saldo / niveis[nivel].proximo) * 100 
    : 100;

  const pontosFaltantes = niveis[nivel].proximo 
    ? niveis[nivel].proximo - saldo 
    : 0;

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Meus Pontos
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Acompanhe sua pontuação e benefícios
        </Typography>
      </Box>

      {/* Card Principal */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ 
              bgcolor: niveis[nivel].corFundo || '#f5f5f5',
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
                
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800', mb: 1 }}>
                  {saldo}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  Pontos Acumulados
                </Typography>
                
                <Chip
                  label={nivel.toUpperCase()}
                  sx={{
                    bgcolor: niveis[nivel].cor,
                    color: nivel === 'ouro' ? '#000' : '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2,
                    mt: 1
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Progresso
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
                      value={progressoParaProximoNivel}
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

                    <Typography variant="body2" color="textSecondary">
                      Próximo nível: {
                        nivel === 'bronze' ? 'PRATA (500 pontos)' :
                        nivel === 'prata' ? 'OURO (2.000 pontos)' :
                        'PLATINA (5.000 pontos)'
                      }
                    </Typography>
                  </>
                ) : (
                  <Alert severity="success" icon={<TrophyIcon />}>
                    Parabéns! Você atingiu o nível máximo!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4caf50' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {estatisticas.totalGanhos}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pontos ganhos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#f44336' }}>
                  <TrendingDownIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {estatisticas.totalGastos}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pontos utilizados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0' }}>
                  <HistoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {estatisticas.totalTransacoes}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Movimentações
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Histórico de Pontos */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Histórico de Pontos
          </Typography>

          {pontuacoes.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align="right">Pontos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pontuacoes.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatarData(item.data)}</TableCell>
                      <TableCell>{item.motivo}</TableCell>
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
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <StarIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhuma movimentação encontrada
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ClientePontos;
