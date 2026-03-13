// src/pages/Recompensas.js
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
  CardActions,
  CardMedia,
  CardActionArea,
  Snackbar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  Redeem as RewardIcon,
  History as HistoryIcon,
  MonetizationOn as CoinIcon,
  LocalOffer as TagIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

// Níveis de fidelidade
const niveis = {
  bronze: { cor: '#cd7f32', nome: 'Bronze', minimo: 0 },
  prata: { cor: '#c0c0c0', nome: 'Prata', minimo: 500 },
  ouro: { cor: '#ffd700', nome: 'Ouro', minimo: 2000 },
  platina: { cor: '#e5e4e2', nome: 'Platina', minimo: 5000 },
};

function Recompensas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [recompensas, setRecompensas] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [filtro, setFiltro] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [recompensaSelecionada, setRecompensaSelecionada] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [resgatando, setResgatando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
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
      console.error('Erro ao carregar dados:', error);
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

      // Calcular saldo
      const creditos = (pontuacaoData || [])
        .filter(p => p.tipo === 'credito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);

      const debitos = (pontuacaoData || [])
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
      ]).catch(() => []);

      // Filtrar por nível mínimo
      const recompensasFiltradas = (recompensasData || []).filter(r => {
        const niveisOrdenados = ['bronze', 'prata', 'ouro', 'platina'];
        const indexNivelCliente = niveisOrdenados.indexOf(nivelAtual);
        const indexNivelRecompensa = niveisOrdenados.indexOf(r.nivelMinimo);
        return indexNivelCliente >= indexNivelRecompensa;
      });

      setRecompensas(recompensasFiltradas);
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleResgatar = (recompensa) => {
    setRecompensaSelecionada(recompensa);
    setOpenConfirmDialog(true);
  };

  const confirmarResgate = async () => {
    if (!recompensaSelecionada) return;

    if (saldo < recompensaSelecionada.pontosNecessarios) {
      mostrarSnackbar('Saldo insuficiente para resgatar esta recompensa', 'error');
      setOpenConfirmDialog(false);
      return;
    }

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
        createdAt: new Date().toISOString(),
      };

      await firebaseService.add('resgates_fidelidade', resgateData);

      // Registrar a movimentação de pontos
      const pontuacaoData = {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        quantidade: recompensaSelecionada.pontosNecessarios,
        tipo: 'debito',
        motivo: `Resgate: ${recompensaSelecionada.nome}`,
        data: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await firebaseService.add('pontuacao', pontuacaoData);

      // Atualizar saldo local
      setSaldo(prev => prev - recompensaSelecionada.pontosNecessarios);

      mostrarSnackbar(`Recompensa resgatada com sucesso! Código: ${resgateData.codigo}`, 'success');
      setOpenConfirmDialog(false);
      setRecompensaSelecionada(null);
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error);
      mostrarSnackbar('Erro ao resgatar recompensa', 'error');
    } finally {
      setResgatando(false);
    }
  };

  const irParaMeusPontos = () => {
    navigate('/meus-pontos');
  };

  // Filtrar recompensas
  const recompensasFiltradas = recompensas.filter(r => {
    const matchesTexto = filtro === '' || 
      r.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      r.descricao?.toLowerCase().includes(filtro.toLowerCase());

    const matchesNivel = filtroNivel === 'todos' || r.nivelMinimo === filtroNivel;

    return matchesTexto && matchesNivel;
  });

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
            Recompensas
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Resgate seus pontos por recompensas incríveis
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={irParaMeusPontos}
          >
            Meus Pontos
          </Button>
        </Box>
      </Box>

      {/* Card de Saldo */}
      <Card sx={{ mb: 4, bgcolor: niveis[nivel].corFundo || '#f5f5f5' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ bgcolor: niveis[nivel].cor, width: 64, height: 64 }}>
                  <TrophyIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {saldo}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Pontos disponíveis
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Chip
                  label={`Nível ${nivel.toUpperCase()}`}
                  sx={{
                    bgcolor: niveis[nivel].cor,
                    color: '#fff',
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

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar recompensa..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: filtro && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setFiltro('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por Nível</InputLabel>
                <Select
                  value={filtroNivel}
                  label="Filtrar por Nível"
                  onChange={(e) => setFiltroNivel(e.target.value)}
                >
                  <MenuItem value="todos">Todos os Níveis</MenuItem>
                  <MenuItem value="bronze">Bronze</MenuItem>
                  <MenuItem value="prata">Prata</MenuItem>
                  <MenuItem value="ouro">Ouro</MenuItem>
                  <MenuItem value="platina">Platina</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Recompensas */}
      <Grid container spacing={3}>
        {recompensasFiltradas.map((recompensa, index) => (
          <Grid item xs={12} sm={6} md={4} key={recompensa.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea>
                  <Box
                    sx={{
                      height: 140,
                      bgcolor: niveis[recompensa.nivelMinimo]?.corFundo || '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {recompensa.imagem ? (
                      <CardMedia
                        component="img"
                        height="140"
                        image={recompensa.imagem}
                        alt={recompensa.nome}
                      />
                    ) : (
                      <GiftIcon sx={{ fontSize: 64, color: niveis[recompensa.nivelMinimo]?.cor || '#999' }} />
                    )}
                    <Chip
                      size="small"
                      label={recompensa.nivelMinimo.toUpperCase()}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: niveis[recompensa.nivelMinimo]?.cor,
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {recompensa.nome}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {recompensa.descricao}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                          {recompensa.pontosNecessarios}
                        </Typography>
                      </Box>
                      {recompensa.tipo === 'desconto' && recompensa.valor && (
                        <Chip
                          size="small"
                          label={`${recompensa.valor}% OFF`}
                          color="success"
                        />
                      )}
                      {recompensa.tipo === 'produto' && recompensa.valor && (
                        <Chip
                          size="small"
                          label={`R$ ${recompensa.valor}`}
                          color="primary"
                        />
                      )}
                    </Box>

                    {recompensa.quantidadeDisponivel && (
                      <Typography variant="caption" color="textSecondary">
                        {recompensa.quantidadeDisponivel} disponíveis
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ mt: 'auto', p: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={saldo < recompensa.pontosNecessarios}
                    onClick={() => handleResgatar(recompensa)}
                    sx={{
                      bgcolor: saldo >= recompensa.pontosNecessarios ? '#ff9800' : undefined,
                      '&:hover': {
                        bgcolor: saldo >= recompensa.pontosNecessarios ? '#f57c00' : undefined,
                      },
                    }}
                  >
                    {saldo >= recompensa.pontosNecessarios ? 'Resgatar' : 'Pontos insuficientes'}
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {recompensasFiltradas.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <InfoIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Nenhuma recompensa encontrada
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tente ajustar os filtros ou aguarde novas recompensas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog de Confirmação de Resgate */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle sx={{ color: '#ff9800' }}>Confirmar Resgate</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <GiftIcon sx={{ fontSize: 64, color: '#ff9800', mb: 2 }} />
            
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Seu saldo atual:</Typography>
              <Typography sx={{ fontWeight: 600, color: saldo >= (recompensaSelecionada?.pontosNecessarios || 0) ? '#4caf50' : '#f44336' }}>
                {saldo}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Saldo após resgate:</Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {saldo - (recompensaSelecionada?.pontosNecessarios || 0)}
              </Typography>
            </Box>

            {saldo < (recompensaSelecionada?.pontosNecessarios || 0) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Saldo insuficiente para este resgate
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
          <Button
            onClick={confirmarResgate}
            variant="contained"
            disabled={saldo < (recompensaSelecionada?.pontosNecessarios || 0) || resgatando}
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
          >
            {resgatando ? <CircularProgress size={24} /> : 'Confirmar Resgate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Recompensas;
