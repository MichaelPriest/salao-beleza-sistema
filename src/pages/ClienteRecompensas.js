// src/pages/ClienteRecompensas.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  CardGiftcard as GiftIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';

function ClienteRecompensas() {
  const { cliente } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [recompensas, setRecompensas] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [openResgateDialog, setOpenResgateDialog] = useState(false);
  const [recompensaSelecionada, setRecompensaSelecionada] = useState(null);
  const [resgatando, setResgatando] = useState(false);

  const niveis = {
    bronze: { cor: '#cd7f32', nome: 'Bronze', minimo: 0 },
    prata: { cor: '#c0c0c0', nome: 'Prata', minimo: 500 },
    ouro: { cor: '#ffd700', nome: 'Ouro', minimo: 2000 },
    platina: { cor: '#e5e4e2', nome: 'Platina', minimo: 5000 },
  };

  useEffect(() => {
    if (cliente) {
      carregarDados();
    }
  }, [cliente]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar pontuação do cliente
      const pontuacoes = await firebaseService.query('pontuacao', [
        { field: 'clienteId', operator: '==', value: cliente.id }
      ]);

      const creditos = pontuacoes
        .filter(p => p.tipo === 'credito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);
      const debitos = pontuacoes
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

      // Carregar recompensas disponíveis
      const recompensasData = await firebaseService.query('recompensas', [
        { field: 'ativo', operator: '==', value: true }
      ]);

      // Filtrar por nível do cliente
      const niveisOrdenados = ['bronze', 'prata', 'ouro', 'platina'];
      const indexNivelCliente = niveisOrdenados.indexOf(nivelAtual);
      
      const recompensasFiltradas = (recompensasData || []).filter(r => {
        const indexNivelRecompensa = niveisOrdenados.indexOf(r.nivelMinimo);
        return indexNivelCliente >= indexNivelRecompensa;
      });

      setRecompensas(recompensasFiltradas);

    } catch (error) {
      console.error('Erro ao carregar recompensas:', error);
      toast.error('Erro ao carregar recompensas');
    } finally {
      setLoading(false);
    }
  };

  const handleResgatar = (recompensa) => {
    if (saldo < recompensa.pontosNecessarios) {
      toast.error('Saldo insuficiente');
      return;
    }
    setRecompensaSelecionada(recompensa);
    setOpenResgateDialog(true);
  };

  const confirmarResgate = async () => {
    try {
      setResgatando(true);

      // Registrar o resgate
      const resgateData = {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        recompensaId: recompensaSelecionada.id,
        recompensaNome: recompensaSelecionada.nome,
        pontosGastos: recompensaSelecionada.pontosNecessarios,
        data: new Date().toISOString(),
        status: 'resgatado',
        codigo: 'RES' + Date.now() + Math.floor(Math.random() * 1000),
        utilizado: false,
        createdAt: new Date().toISOString()
      };

      await firebaseService.add('resgates_fidelidade', resgateData);

      // Registrar a movimentação de pontos
      await firebaseService.add('pontuacao', {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        quantidade: recompensaSelecionada.pontosNecessarios,
        tipo: 'debito',
        motivo: `Resgate: ${recompensaSelecionada.nome}`,
        data: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      toast.success(`Recompensa resgatada! Código: ${resgateData.codigo}`);
      setOpenResgateDialog(false);
      carregarDados();

    } catch (error) {
      console.error('Erro ao resgatar:', error);
      toast.error('Erro ao resgatar recompensa');
    } finally {
      setResgatando(false);
    }
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
          Recompensas
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Troque seus pontos por benefícios exclusivos
        </Typography>
      </Box>

      {/* Card de Saldo */}
      <Card sx={{ mb: 4, bgcolor: niveis[nivel].corFundo || '#f5f5f5' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: niveis[nivel].cor, width: 56, height: 56 }}>
                  <TrophyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {saldo}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pontos disponíveis
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Chip
                  label={`Nível ${nivel.toUpperCase()}`}
                  sx={{
                    bgcolor: niveis[nivel].cor,
                    color: nivel === 'ouro' ? '#000' : '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Recompensas */}
      <Grid container spacing={3}>
        {recompensas.map((recompensa, index) => (
          <Grid item xs={12} sm={6} md={4} key={recompensa.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={recompensa.imagem || 'https://via.placeholder.com/300x140?text=Recompensa'}
                  alt={recompensa.nome}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {recompensa.nome}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {recompensa.descricao}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <StarIcon sx={{ color: '#ff9800' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {recompensa.pontosNecessarios}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      pontos
                    </Typography>
                  </Box>

                  {recompensa.tipo === 'desconto' && recompensa.valor && (
                    <Chip
                      label={`${recompensa.valor}% OFF`}
                      size="small"
                      color="success"
                    />
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={saldo < recompensa.pontosNecessarios}
                    onClick={() => handleResgatar(recompensa)}
                    sx={{
                      bgcolor: saldo >= recompensa.pontosNecessarios ? '#ff9800' : undefined,
                    }}
                  >
                    {saldo >= recompensa.pontosNecessarios ? 'Resgatar' : 'Pontos insuficientes'}
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {recompensas.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <GiftIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Nenhuma recompensa disponível
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Volte mais tarde para ver as novidades
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog de Confirmação */}
      <Dialog open={openResgateDialog} onClose={() => setOpenResgateDialog(false)}>
        <DialogTitle sx={{ color: '#ff9800' }}>Confirmar Resgate</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <GiftIcon sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {recompensaSelecionada?.nome}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {recompensaSelecionada?.descricao}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Pontos necessários:</Typography>
              <Typography sx={{ fontWeight: 600, color: '#ff9800' }}>
                {recompensaSelecionada?.pontosNecessarios}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Seu saldo:</Typography>
              <Typography sx={{ fontWeight: 600, color: '#4caf50' }}>
                {saldo}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResgateDialog(false)}>Cancelar</Button>
          <Button
            onClick={confirmarResgate}
            variant="contained"
            disabled={resgatando}
            sx={{ bgcolor: '#ff9800' }}
          >
            {resgatando ? <CircularProgress size={24} /> : 'Confirmar Resgate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClienteRecompensas;
