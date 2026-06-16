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
  Paper,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CardGiftcard as GiftIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  EmojiEvents as TrophyIcon,
  ContentCopy as CopyIcon,
  LocalOffer as TicketIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import {
  getPontosRecompensa,
  getQuantidadeDisponivel,
  resgateFidelidadeService,
} from '../services/resgateFidelidadeService';
import { useAuthCliente } from '../contexts/AuthClienteContext';

// Funções de validação seguras (com nomes diferentes para evitar conflito)
const safeGetPontosRecompensa = (recompensa) => {
  if (!recompensa || typeof recompensa !== 'object') return 0;
  return recompensa.pontosNecessarios || recompensa.pontos || 0;
};

const safeGetQuantidadeDisponivel = (recompensa) => {
  if (!recompensa || typeof recompensa !== 'object') return 0;
  return recompensa.quantidade || recompensa.estoque || Infinity;
};

function ClienteRecompensas() {
  const { cliente, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [recompensas, setRecompensas] = useState([]);
  const [resgatesAtivos, setResgatesAtivos] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [openResgateDialog, setOpenResgateDialog] = useState(false);
  const [recompensaSelecionada, setRecompensaSelecionada] = useState(null);
  const [resgatando, setResgatando] = useState(false);

  const getClienteIds = () => Array.from(new Set([
    firebaseUser?.uid,
    cliente?.id,
    cliente?.uid,
    cliente?.authUid,
    cliente?.googleUid,
    cliente?.email,
  ].filter(Boolean)));

  const niveis = {
    bronze: { cor: '#cd7f32', nome: 'Bronze', minimo: 0, corFundo: '#fff8f0' },
    prata: { cor: '#c0c0c0', nome: 'Prata', minimo: 500, corFundo: '#f5f5f5' },
    ouro: { cor: '#ffd700', nome: 'Ouro', minimo: 2000, corFundo: '#fffae6' },
    platina: { cor: '#e5e4e2', nome: 'Platina', minimo: 5000, corFundo: '#f0f0ff' },
  };

  useEffect(() => {
    if (cliente) {
      carregarDados();
    }
  }, [cliente]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const idsCliente = getClienteIds();

      // Carregar pontuação do cliente por todos os vínculos do portal
      const pontuacoesPorId = await Promise.all(idsCliente.map((id) =>
        firebaseService.query('pontuacao', [
          { field: 'clienteId', operator: '==', value: id }
        ]).catch(() => [])
      ));
      const pontuacoes = Array.from(new Map(pontuacoesPorId.flat().map((item) => [item.id, item])).values());

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
      ]).catch(() => []);

      // Validar e filtrar recompensas
      const recompensasValidas = (recompensasData || [])
        .filter(r => r && typeof r === 'object' && r.id)
        .map(r => ({
          ...r,
          pontosNecessarios: r.pontosNecessarios || r.pontos || 0,
          quantidade: r.quantidade || r.estoque || Infinity,
        }));

      // Filtrar por nível do cliente
      const niveisOrdenados = ['bronze', 'prata', 'ouro', 'platina'];
      const indexNivelCliente = niveisOrdenados.indexOf(nivelAtual);
      
      const recompensasFiltradas = recompensasValidas.filter(r => {
        const nivelRecompensa = r.nivelMinimo || 'bronze';
        const indexNivelRecompensa = niveisOrdenados.indexOf(nivelRecompensa);
        return indexNivelCliente >= indexNivelRecompensa;
      });

      setRecompensas(recompensasFiltradas);

      const resgatesPorId = await Promise.all(idsCliente.map((id) =>
        firebaseService.query('resgates_fidelidade', [
          { field: 'clienteId', operator: '==', value: id }
        ], 'data', 'desc').catch(() => [])
      ));
      const resgates = Array.from(new Map(resgatesPorId.flat().map((item) => [item.id, item])).values())
        .filter((resgate) => !resgate.utilizado && !['utilizado', 'cancelado', 'expirado'].includes(resgate.status))
        .sort((a, b) => new Date(b.createdAt || b.data || 0) - new Date(a.createdAt || a.data || 0));
      setResgatesAtivos(resgates);

    } catch (error) {
      console.error('Erro ao carregar recompensas:', error);
      toast.error('Erro ao carregar recompensas');
    } finally {
      setLoading(false);
    }
  };

  const handleResgatar = (recompensa) => {
    if (saldo < getPontosRecompensa(recompensa)) {
      toast.error('Saldo insuficiente');
      return;
    }
    
    setRecompensaSelecionada(recompensa);
    setOpenResgateDialog(true);
  };

  const confirmarResgate = async () => {
    if (!recompensaSelecionada) {
      toast.error('Selecione uma recompensa para resgatar.');
      return;
    }

    try {
      setResgatando(true);

      // Verificar disponibilidade
      if (getQuantidadeDisponivel(recompensaSelecionada) !== Infinity &&
          getQuantidadeDisponivel(recompensaSelecionada) <= 0) {
        toast.error('Recompensa esgotada');
        return;
      }

      // Registrar o resgate
      const resgateData = {
        clienteId: cliente.id,
        clienteAuthUid: firebaseUser?.uid || cliente.authUid || '',
        authUid: firebaseUser?.uid || cliente.authUid || '',
        googleUid: cliente.googleUid || '',
        clienteNome: cliente.nome,
        recompensaId: recompensaSelecionada.id,
        recompensaNome: recompensaSelecionada.nome,
        recompensaImagem: recompensaSelecionada.imagem || '',
        pontosGastos: getPontosRecompensa(recompensaSelecionada),
        data: new Date().toISOString(),
        status: 'disponivel',
        codigo: 'RES' + Date.now() + Math.floor(Math.random() * 1000),
        utilizado: false,
        validadeAte: recompensaSelecionada.validade || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
      };

      await resgateFidelidadeService.criar({
        ...resgateData,
        origem: 'cliente',
        usuarioId: firebaseUser?.uid || cliente.authUid || cliente.id,
        usuarioNome: cliente.nome || 'Cliente',
      });

      // Atualizar quantidade disponível se necessário
      if (getQuantidadeDisponivel(recompensaSelecionada) !== Infinity) {
        const quantidadeAtual = getQuantidadeDisponivel(recompensaSelecionada);
        await firebaseService.update('recompensas', recompensaSelecionada.id, {
          quantidadeDisponivel: quantidadeAtual - 1,
          quantidade: quantidadeAtual - 1,
          updatedAt: new Date().toISOString()
        });
      }

      toast.success(`Recompensa resgatada! Código: ${resgateData.codigo}`);
      setOpenResgateDialog(false);
      setRecompensaSelecionada(null);
      await carregarDados();

    } catch (error) {
      console.error('Erro ao resgatar:', error);
      toast.error(error.message || 'Erro ao resgatar recompensa');
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
      <Card sx={{ mb: 4, bgcolor: niveis[nivel]?.corFundo || '#f5f5f5' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: niveis[nivel]?.cor || '#cd7f32', width: 56, height: 56 }}>
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
                  label={`Nível ${nivel?.toUpperCase() || 'BRONZE'}`}
                  sx={{
                    bgcolor: niveis[nivel]?.cor || '#cd7f32',
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

      {/* Recompensas resgatadas para uso no salão */}
      <Card sx={{ mb: 4, border: '1px solid', borderColor: 'success.light' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                Minhas recompensas para usar no salão
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Mostre o código abaixo na recepção ou para o profissional no atendimento.
              </Typography>
            </Box>
            <Chip color="success" label={`${resgatesAtivos.length} ativo${resgatesAtivos.length === 1 ? '' : 's'}`} />
          </Box>

          {resgatesAtivos.length === 0 ? (
            <Alert severity="info">Você ainda não possui recompensas resgatadas disponíveis para uso.</Alert>
          ) : (
            <Grid container spacing={2}>
              {resgatesAtivos.map((resgate) => (
                <Grid item xs={12} md={6} key={resgate.id}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar src={resgate.recompensaImagem} sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                      <TicketIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                        {resgate.recompensaNome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Válido até {resgate.validadeAte ? new Date(`${resgate.validadeAte}T12:00:00`).toLocaleDateString('pt-BR') : 'uso no salão'}
                      </Typography>
                      <Chip
                        label={resgate.codigo}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ mt: 1, fontFamily: 'monospace', fontWeight: 700 }}
                      />
                    </Box>
                    <Tooltip title="Copiar código">
                      <IconButton onClick={() => {
                        navigator.clipboard?.writeText(resgate.codigo);
                        toast.success('Código copiado!');
                      }}>
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
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
                      {getPontosRecompensa(recompensa)}
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
                    disabled={saldo < getPontosRecompensa(recompensa)}
                    onClick={() => handleResgatar(recompensa)}
                    sx={{
                      bgcolor: saldo >= getPontosRecompensa(recompensa) ? '#ff9800' : undefined,
                    }}
                  >
                    {saldo >= getPontosRecompensa(recompensa) ? 'Resgatar' : 'Pontos insuficientes'}
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
                {getPontosRecompensa(recompensaSelecionada)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Seu saldo:</Typography>
              <Typography sx={{ fontWeight: 600, color: saldo >= getPontosRecompensa(recompensaSelecionada) ? '#4caf50' : '#f44336' }}>
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
