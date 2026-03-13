// src/pages/GerenciarFidelidade.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
  LinearProgress,
  TablePagination,
  Tabs,
  Tab,
  Rating,
  Badge,
  CardActions,
  CardMedia,
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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // 🔥 IMPORT ADICIONADO
import { firebaseService } from '../services/firebase';

// Níveis de fidelidade - CORRIGIDO: adicionado corFundo
const niveis = {
  bronze: { 
    cor: '#cd7f32', 
    corFundo: '#fff3e0', // 🔥 CORRIGIDO
    nome: 'Bronze', 
    minimo: 0, 
    multiplicador: 1 
  },
  prata: { 
    cor: '#c0c0c0', 
    corFundo: '#f5f5f5', // 🔥 CORRIGIDO
    nome: 'Prata', 
    minimo: 500, 
    multiplicador: 1.2 
  },
  ouro: { 
    cor: '#ffd700', 
    corFundo: '#fff9e6', // 🔥 CORRIGIDO
    nome: 'Ouro', 
    minimo: 2000, 
    multiplicador: 1.5 
  },
  platina: { 
    cor: '#e5e4e2', 
    corFundo: '#f0f0f0', // 🔥 CORRIGIDO
    nome: 'Platina', 
    minimo: 5000, 
    multiplicador: 2 
  },
};

function GerenciarFidelidade() {
  const navigate = useNavigate(); // 🔥 HOOK ADICIONADO
  
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [pontuacoes, setPontuacoes] = useState([]);
  const [resgates, setResgates] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [filtro, setFiltro] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRecompensaDialog, setOpenRecompensaDialog] = useState(false);
  const [openPontosDialog, setOpenPontosDialog] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [recompensaEditando, setRecompensaEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Estado para pontos
  const [pontosForm, setPontosForm] = useState({
    clienteId: '',
    quantidade: '',
    tipo: 'credito',
    motivo: '',
  });

  // Estado para recompensa
  const [recompensaForm, setRecompensaForm] = useState({
    nome: '',
    descricao: '',
    pontosNecessarios: '',
    tipo: 'desconto',
    valor: '',
    nivelMinimo: 'bronze',
    imagem: '',
    quantidadeDisponivel: '',
    ativo: true,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [clientesData, pontuacoesData, resgatesData, recompensasData] = await Promise.all([
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('pontuacao').catch(() => []),
        firebaseService.getAll('resgates_fidelidade').catch(() => []),
        firebaseService.getAll('recompensas').catch(() => [])
      ]);
      
      setClientes(clientesData || []);
      setPontuacoes(pontuacoesData || []);
      setResgates(resgatesData || []);
      setRecompensas(recompensasData || []);
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleOpenPontosDialog = (cliente = null) => {
    if (cliente) {
      setClienteSelecionado(cliente);
      setPontosForm({
        clienteId: cliente.id,
        quantidade: '',
        tipo: 'credito',
        motivo: '',
      });
    }
    setOpenPontosDialog(true);
  };

  const handleClosePontosDialog = () => {
    setOpenPontosDialog(false);
    setClienteSelecionado(null);
  };

  const handleOpenRecompensaDialog = (recompensa = null) => {
    if (recompensa) {
      setRecompensaEditando(recompensa);
      setRecompensaForm({
        nome: recompensa.nome || '',
        descricao: recompensa.descricao || '',
        pontosNecessarios: recompensa.pontosNecessarios || '',
        tipo: recompensa.tipo || 'desconto',
        valor: recompensa.valor || '',
        nivelMinimo: recompensa.nivelMinimo || 'bronze',
        imagem: recompensa.imagem || '',
        quantidadeDisponivel: recompensa.quantidadeDisponivel || '',
        ativo: recompensa.ativo !== false,
      });
    } else {
      setRecompensaEditando(null);
      setRecompensaForm({
        nome: '',
        descricao: '',
        pontosNecessarios: '',
        tipo: 'desconto',
        valor: '',
        nivelMinimo: 'bronze',
        imagem: '',
        quantidadeDisponivel: '',
        ativo: true,
      });
    }
    setOpenRecompensaDialog(true);
  };

  const handleCloseRecompensaDialog = () => {
    setOpenRecompensaDialog(false);
    setRecompensaEditando(null);
  };

  const handlePontosInputChange = (e) => {
    const { name, value } = e.target;
    setPontosForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRecompensaInputChange = (e) => {
    const { name, value } = e.target;
    setRecompensaForm(prev => ({ ...prev, [name]: value }));
  };

  const calcularSaldoCliente = (clienteId) => {
    const pontosCliente = pontuacoes.filter(p => p.clienteId === clienteId);
    const creditos = pontosCliente
      .filter(p => p.tipo === 'credito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);
    const debitos = pontosCliente
      .filter(p => p.tipo === 'debito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);
    return creditos - debitos;
  };

  const getNivelCliente = (saldo) => {
    if (saldo >= 5000) return 'platina';
    if (saldo >= 2000) return 'ouro';
    if (saldo >= 500) return 'prata';
    return 'bronze';
  };

  const handleSalvarPontos = async () => {
    try {
      if (!pontosForm.quantidade || pontosForm.quantidade <= 0) {
        mostrarSnackbar('Quantidade inválida', 'error');
        return;
      }

      if (!pontosForm.motivo.trim()) {
        mostrarSnackbar('Motivo é obrigatório', 'error');
        return;
      }

      const cliente = clientes.find(c => c.id === pontosForm.clienteId);
      
      const pontuacaoData = {
        clienteId: pontosForm.clienteId,
        clienteNome: cliente?.nome || 'Cliente',
        quantidade: parseInt(pontosForm.quantidade),
        tipo: pontosForm.tipo,
        motivo: pontosForm.motivo,
        data: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        usuarioResponsavel: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
      };

      await firebaseService.add('pontuacao', pontuacaoData);

      // Atualizar lista local
      setPontuacoes(prev => [...prev, pontuacaoData]);

      mostrarSnackbar('Pontos adicionados com sucesso!');
      handleClosePontosDialog();
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      mostrarSnackbar('Erro ao adicionar pontos', 'error');
    }
  };

  const handleSalvarRecompensa = async () => {
    try {
      if (!recompensaForm.nome.trim()) {
        mostrarSnackbar('Nome da recompensa é obrigatório', 'error');
        return;
      }

      if (!recompensaForm.pontosNecessarios || recompensaForm.pontosNecessarios <= 0) {
        mostrarSnackbar('Pontos necessários inválidos', 'error');
        return;
      }

      const recompensaData = {
        nome: recompensaForm.nome.trim(),
        descricao: recompensaForm.descricao.trim(),
        pontosNecessarios: parseInt(recompensaForm.pontosNecessarios),
        tipo: recompensaForm.tipo,
        valor: recompensaForm.valor ? parseFloat(recompensaForm.valor) : null,
        nivelMinimo: recompensaForm.nivelMinimo,
        imagem: recompensaForm.imagem || null,
        quantidadeDisponivel: recompensaForm.quantidadeDisponivel ? parseInt(recompensaForm.quantidadeDisponivel) : null,
        ativo: recompensaForm.ativo,
        updatedAt: new Date().toISOString(),
      };

      if (recompensaEditando) {
        await firebaseService.update('recompensas', recompensaEditando.id, recompensaData);
        setRecompensas(prev => prev.map(r => 
          r.id === recompensaEditando.id ? { ...r, ...recompensaData, id: recompensaEditando.id } : r
        ));
        mostrarSnackbar('Recompensa atualizada com sucesso!');
      } else {
        recompensaData.createdAt = new Date().toISOString();
        const novoId = await firebaseService.add('recompensas', recompensaData);
        setRecompensas([...recompensas, { ...recompensaData, id: novoId }]);
        mostrarSnackbar('Recompensa criada com sucesso!');
      }

      handleCloseRecompensaDialog();
    } catch (error) {
      console.error('Erro ao salvar recompensa:', error);
      mostrarSnackbar('Erro ao salvar recompensa', 'error');
    }
  };

  const handleDeleteRecompensa = async () => {
    try {
      await firebaseService.delete('recompensas', confirmDelete.id); // 🔥 CORRIGIDO: remover espaço
      setRecompensas(recompensas.filter(r => r.id !== confirmDelete.id));
      mostrarSnackbar('Recompensa excluída com sucesso!');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erro ao excluir recompensa:', error);
      mostrarSnackbar('Erro ao excluir recompensa', 'error');
    }
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const matchesTexto = filtro === '' || 
      cliente.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.telefone?.includes(filtro);

    if (filtroNivel !== 'todos') {
      const saldo = calcularSaldoCliente(cliente.id);
      const nivel = getNivelCliente(saldo);
      return matchesTexto && nivel === filtroNivel;
    }

    return matchesTexto;
  });

  // Filtrar recompensas
  const recompensasFiltradas = recompensas.filter(r => {
    const matchesTexto = filtro === '' || 
      r.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      r.descricao?.toLowerCase().includes(filtro.toLowerCase());
    return matchesTexto;
  });

  // Paginação
  const paginatedItems = (tabValue === 0 ? clientesFiltrados : recompensasFiltradas).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Estatísticas
  const stats = {
    totalClientes: clientes.length,
    totalPontos: pontuacoes.reduce((acc, p) => acc + (p.tipo === 'credito' ? p.quantidade : -p.quantidade), 0),
    totalResgates: resgates.length,
    totalRecompensas: recompensas.length,
    niveis: {
      bronze: clientes.filter(c => getNivelCliente(calcularSaldoCliente(c.id)) === 'bronze').length,
      prata: clientes.filter(c => getNivelCliente(calcularSaldoCliente(c.id)) === 'prata').length,
      ouro: clientes.filter(c => getNivelCliente(calcularSaldoCliente(c.id)) === 'ouro').length,
      platina: clientes.filter(c => getNivelCliente(calcularSaldoCliente(c.id)) === 'platina').length,
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Gerenciar Fidelidade
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie o programa de fidelidade, pontos e recompensas
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={carregarDados}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenRecompensaDialog()}
            sx={{ bgcolor: '#ff9800' }}
          >
            Nova Recompensa
          </Button>
        </Box>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Clientes
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {stats.totalClientes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Pontos
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {stats.totalPontos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resgates
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {stats.totalResgates}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Recompensas
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#2196f3' }}>
                {stats.totalRecompensas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Clientes Platina
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#e5e4e2' }}>
                {stats.niveis.platina}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Distribuição por Nível */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(niveis).map(([key, nivel]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Card sx={{ bgcolor: nivel.corFundo || '#f5f5f5' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: nivel.cor, fontWeight: 600 }}>
                      {nivel.nome}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: nivel.cor }}>
                      {stats.niveis[key]}
                    </Typography>
                  </Box>
                  <TrophyIcon sx={{ fontSize: 48, color: nivel.cor, opacity: 0.5 }} />
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Mínimo: {nivel.minimo} pontos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Clientes" />
          <Tab label="Recompensas" />
          <Tab label="Resgates" />
        </Tabs>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder={tabValue === 0 ? "Buscar cliente..." : "Buscar recompensa..."}
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

            {tabValue === 0 && (
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
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Conteúdo das Tabs */}
      <Card>
        {tabValue === 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Contato</strong></TableCell>
                    <TableCell align="center"><strong>Nível</strong></TableCell>
                    <TableCell align="right"><strong>Pontos</strong></TableCell>
                    <TableCell align="center"><strong>Resgates</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {paginatedItems.map((cliente, index) => {
                      const saldo = calcularSaldoCliente(cliente.id);
                      const nivel = getNivelCliente(saldo);
                      const resgatesCliente = resgates.filter(r => r.clienteId === cliente.id).length;

                      return (
                        <motion.tr
                          key={cliente.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar src={cliente.avatar}>
                                {cliente.nome?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {cliente.nome}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {cliente.cpf || 'Sem CPF'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{cliente.email}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {cliente.telefone || 'Telefone não informado'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={nivel.toUpperCase()}
                              size="small"
                              sx={{
                                bgcolor: niveis[nivel].cor,
                                color: nivel === 'ouro' ? '#000' : '#fff',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                              {saldo}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{resgatesCliente}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Gerenciar Pontos">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenPontosDialog(cliente)}
                                sx={{ color: '#ff9800' }}
                              >
                                <StarIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Ver Histórico">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/fidelidade/historico/${cliente.id}`)}
                                sx={{ color: '#2196f3' }}
                              >
                                <HistoryIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>

                  {paginatedItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="textSecondary">
                          Nenhum cliente encontrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {tabValue === 1 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Recompensa</strong></TableCell>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell align="center"><strong>Nível Mínimo</strong></TableCell>
                    <TableCell align="center"><strong>Tipo</strong></TableCell>
                    <TableCell align="right"><strong>Pontos</strong></TableCell>
                    <TableCell align="center"><strong>Disponível</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {paginatedItems.map((recompensa, index) => (
                      <motion.tr
                        key={recompensa.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={recompensa.imagem}
                              sx={{ bgcolor: niveis[recompensa.nivelMinimo]?.cor || '#999' }}
                            >
                              <GiftIcon />
                            </Avatar>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {recompensa.nome}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{recompensa.descricao}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={recompensa.nivelMinimo?.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: niveis[recompensa.nivelMinimo]?.cor || '#999',
                              color: '#fff',
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={recompensa.tipo === 'desconto' ? '%' : 'Produto'}
                            size="small"
                            variant="outlined"
                          />
                          {recompensa.valor && (
                            <Typography variant="caption" display="block">
                              {recompensa.tipo === 'desconto' ? `${recompensa.valor}%` : `R$ ${recompensa.valor}`}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                            {recompensa.pontosNecessarios}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {recompensa.quantidadeDisponivel ? (
                            <Chip
                              label={recompensa.quantidadeDisponivel}
                              size="small"
                              color={recompensa.quantidadeDisponivel > 0 ? 'success' : 'error'}
                            />
                          ) : (
                            <Chip label="Ilimitado" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenRecompensaDialog(recompensa)}
                                sx={{ color: '#ff9800' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={() => setConfirmDelete(recompensa)}
                                sx={{ color: '#f44336' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                  {paginatedItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="textSecondary">
                          Nenhuma recompensa encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {tabValue === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell><strong>Recompensa</strong></TableCell>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell align="right"><strong>Pontos Gastos</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resgates.slice().sort((a, b) => new Date(b.data) - new Date(a.data)).map((resgate, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2">{resgate.clienteNome || 'Cliente'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{resgate.recompensaNome}</Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(resgate.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 600, color: '#ff9800' }}>
                        {resgate.pontosGastos}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={resgate.status || 'Resgatado'}
                        color={resgate.status === 'cancelado' ? 'error' : 'success'}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {resgates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="textSecondary">
                        Nenhum resgate encontrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={tabValue === 0 ? clientesFiltrados.length : tabValue === 1 ? recompensasFiltradas.length : resgates.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      {/* Dialog de Pontos */}
      <Dialog open={openPontosDialog} onClose={handleClosePontosDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
          Gerenciar Pontos - {clienteSelecionado?.nome}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#ff9800', fontWeight: 600 }}>
              Saldo Atual: {clienteSelecionado ? calcularSaldoCliente(clienteSelecionado.id) : 0} pontos
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de Movimentação</InputLabel>
                  <Select
                    name="tipo"
                    value={pontosForm.tipo}
                    label="Tipo de Movimentação"
                    onChange={handlePontosInputChange}
                  >
                    <MenuItem value="credito">Adicionar Pontos (Crédito)</MenuItem>
                    <MenuItem value="debito">Remover Pontos (Débito)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantidade de Pontos"
                  name="quantidade"
                  type="number"
                  value={pontosForm.quantidade}
                  onChange={handlePontosInputChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StarIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Motivo"
                  name="motivo"
                  value={pontosForm.motivo}
                  onChange={handlePontosInputChange}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Ex: Compra de serviço, Indicação, Aniversário..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePontosDialog}>Cancelar</Button>
          <Button
            onClick={handleSalvarPontos}
            variant="contained"
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
          >
            Salvar Movimentação
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Recompensa */}
      <Dialog open={openRecompensaDialog} onClose={handleCloseRecompensaDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
          {recompensaEditando ? 'Editar Recompensa' : 'Nova Recompensa'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Recompensa"
                name="nome"
                value={recompensaForm.nome}
                onChange={handleRecompensaInputChange}
                required
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="descricao"
                value={recompensaForm.descricao}
                onChange={handleRecompensaInputChange}
                multiline
                rows={2}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pontos Necessários"
                name="pontosNecessarios"
                type="number"
                value={recompensaForm.pontosNecessarios}
                onChange={handleRecompensaInputChange}
                required
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="tipo"
                  value={recompensaForm.tipo}
                  label="Tipo"
                  onChange={handleRecompensaInputChange}
                >
                  <MenuItem value="desconto">Desconto</MenuItem>
                  <MenuItem value="produto">Produto</MenuItem>
                  <MenuItem value="servico">Serviço</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={recompensaForm.tipo === 'desconto' ? 'Percentual (%)' : 'Valor (R$)'}
                name="valor"
                type="number"
                value={recompensaForm.valor}
                onChange={handleRecompensaInputChange}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Nível Mínimo</InputLabel>
                <Select
                  name="nivelMinimo"
                  value={recompensaForm.nivelMinimo}
                  label="Nível Mínimo"
                  onChange={handleRecompensaInputChange}
                >
                  <MenuItem value="bronze">Bronze</MenuItem>
                  <MenuItem value="prata">Prata</MenuItem>
                  <MenuItem value="ouro">Ouro</MenuItem>
                  <MenuItem value="platina">Platina</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantidade Disponível"
                name="quantidadeDisponivel"
                type="number"
                value={recompensaForm.quantidadeDisponivel}
                onChange={handleRecompensaInputChange}
                variant="outlined"
                size="small"
                helperText="Deixe em branco para quantidade ilimitada"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={recompensaForm.ativo}
                    onChange={(e) => setRecompensaForm(prev => ({ ...prev, ativo: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Recompensa Ativa"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL da Imagem"
                name="imagem"
                value={recompensaForm.imagem}
                onChange={handleRecompensaInputChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRecompensaDialog}>Cancelar</Button>
          <Button
            onClick={handleSalvarRecompensa}
            variant="contained"
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
          >
            {recompensaEditando ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle sx={{ color: '#f44336' }}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a recompensa <strong>{confirmDelete?.nome}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Esta ação não poderá ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button onClick={handleDeleteRecompensa} color="error" variant="contained">
            Excluir
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

export default GerenciarFidelidade;
