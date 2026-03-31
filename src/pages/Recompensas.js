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
  Tab,
  Tabs,
  Badge,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Switch,
  Slider,
  MenuItem,
  Select,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Rating,
  LinearProgress,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  Redeem as RewardIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  MonetizationOn as CoinIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
  Discount as DiscountIcon,
  Celebration as CelebrationIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  CopyAll as CopyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useFirebase } from '../hooks/useFirebase';
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';

// Tipos de recompensa
const tiposRecompensa = [
  { value: 'desconto', label: 'Desconto em serviços', icon: <PercentIcon />, cor: '#4caf50' },
  { value: 'produto', label: 'Produto grátis', icon: <GiftIcon />, cor: '#ff9800' },
  { value: 'servico', label: 'Serviço grátis', icon: <CelebrationIcon />, cor: '#9c27b0' },
  { value: 'brinde', label: 'Brinde surpresa', icon: <TagIcon />, cor: '#2196f3' },
  { value: 'especial', label: 'Benefício especial', icon: <TrophyIcon />, cor: '#f44336' },
];

// Categorias de recompensa
const categoriasRecompensa = [
  { value: 'todos', label: 'Todas as categorias' },
  { value: 'cabelo', label: 'Cabelo', icon: '💇' },
  { value: 'barba', label: 'Barba', icon: '🧔' },
  { value: 'sobrancelha', label: 'Sobrancelha', icon: '👁️' },
  { value: 'estetica', label: 'Estética', icon: '💅' },
  { value: 'produtos', label: 'Produtos', icon: '🧴' },
];

function Recompensas() {
  const [loading, setLoading] = useState(true);
  const [recompensas, setRecompensas] = useState([]);
  const [recompensasUsuario, setRecompensasUsuario] = useState([]);
  const [resgates, setResgates] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pontosUsuario, setPontosUsuario] = useState(0);
  const [nivelUsuario, setNivelUsuario] = useState('bronze');

  // Dialogs
  const [openCriarDialog, setOpenCriarDialog] = useState(false);
  const [openEditarDialog, setOpenEditarDialog] = useState(false);
  const [openResgatarDialog, setOpenResgatarDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [openCompartilharDialog, setOpenCompartilharDialog] = useState(false);
  const [selectedRecompensa, setSelectedRecompensa] = useState(null);
  const [selectedRecompensaResgate, setSelectedRecompensaResgate] = useState(null);

  // Formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'desconto',
    categoria: 'cabelo',
    pontos: 100,
    valor: 0,
    quantidade: 0,
    ilimitado: false,
    ativo: true,
    destaque: false,
    validade: '',
    imagem: '',
    termos: '',
  });

  // Resgate form
  const [resgateForm, setResgateForm] = useState({
    clienteId: '',
    clienteNome: '',
    observacoes: '',
  });

  // Níveis de fidelidade
  const niveis = {
    bronze: { cor: '#cd7f32', minimo: 0, multiplicador: 1 },
    prata: { cor: '#c0c0c0', minimo: 500, multiplicador: 1.2 },
    ouro: { cor: '#ffd700', minimo: 2000, multiplicador: 1.5 },
    platina: { cor: '#e5e4e2', minimo: 5000, multiplicador: 2 },
  };

  useEffect(() => {
    carregarUsuario();
    carregarRecompensas();
    carregarResgates();
  }, []);

  const carregarUsuario = () => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const user = JSON.parse(usuarioStr);
        setUsuario(user);
        setIsAdmin(user.cargo === 'admin' || user.permissoes?.includes('admin'));
        
        // Carregar pontos do usuário (se for cliente)
        if (user.clienteId) {
          carregarPontosUsuario(user.clienteId);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar usuário:', e);
    }
  };

  const carregarPontosUsuario = async (clienteId) => {
    try {
      const pontuacaoData = await firebaseService.query('pontuacao', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]);

      const pontosGanhos = pontuacaoData
        .filter(p => p.tipo === 'credito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);

      const pontosGastos = pontuacaoData
        .filter(p => p.tipo === 'debito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);

      const saldo = pontosGanhos - pontosGastos;
      setPontosUsuario(saldo);

      // Determinar nível
      if (saldo >= 5000) setNivelUsuario('platina');
      else if (saldo >= 2000) setNivelUsuario('ouro');
      else if (saldo >= 500) setNivelUsuario('prata');
      else setNivelUsuario('bronze');

    } catch (error) {
      console.error('Erro ao carregar pontos:', error);
    }
  };

  const carregarRecompensas = async () => {
    try {
      setLoading(true);
      
      // Carregar recompensas do Firebase
      const recompensasData = await firebaseService.getAll('recompensas').catch(() => []);
      
      // Se não houver recompensas, usar dados de exemplo
      if (!recompensasData || recompensasData.length === 0) {
        const recompensasExemplo = [
          {
            id: '1',
            nome: '10% de desconto',
            descricao: 'Ganhe 10% de desconto em qualquer serviço',
            tipo: 'desconto',
            categoria: 'todos',
            pontos: 100,
            valor: 10,
            quantidade: 999,
            ilimitado: true,
            ativo: true,
            destaque: true,
            imagem: null,
            termos: 'Válido por 30 dias. Não acumulativo.',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            nome: 'Corte de cabelo grátis',
            descricao: 'Corte de cabelo grátis com qualquer profissional',
            tipo: 'servico',
            categoria: 'cabelo',
            pontos: 500,
            valor: 0,
            quantidade: 50,
            ilimitado: false,
            ativo: true,
            destaque: true,
            imagem: null,
            termos: 'Agendamento obrigatório. Válido por 60 dias.',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            nome: 'Shampoo especial',
            descricao: 'Shampoo profissional de 300ml',
            tipo: 'produto',
            categoria: 'produtos',
            pontos: 300,
            valor: 0,
            quantidade: 20,
            ilimitado: false,
            ativo: true,
            destaque: false,
            imagem: null,
            termos: 'Sujeito à disponibilidade em estoque.',
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            nome: 'Design de sobrancelhas',
            descricao: 'Design de sobrancelhas completo',
            tipo: 'servico',
            categoria: 'sobrancelha',
            pontos: 400,
            valor: 0,
            quantidade: 30,
            ilimitado: false,
            ativo: true,
            destaque: true,
            imagem: null,
            termos: 'Agendamento obrigatório.',
            createdAt: new Date().toISOString(),
          },
          {
            id: '5',
            nome: 'Kit de barbearia',
            descricao: 'Kit com pincel, sabonete e bálsamo',
            tipo: 'produto',
            categoria: 'barba',
            pontos: 600,
            valor: 0,
            quantidade: 15,
            ilimitado: false,
            ativo: true,
            destaque: false,
            imagem: null,
            termos: 'Edição limitada.',
            createdAt: new Date().toISOString(),
          },
          {
            id: '6',
            nome: '15% de desconto',
            descricao: '15% de desconto em serviços de estética',
            tipo: 'desconto',
            categoria: 'estetica',
            pontos: 150,
            valor: 15,
            quantidade: 999,
            ilimitado: true,
            ativo: true,
            destaque: false,
            imagem: null,
            termos: 'Válido para serviços de estética facial.',
            createdAt: new Date().toISOString(),
          },
          {
            id: '7',
            nome: 'Brinde surpresa',
            descricao: 'Brinde especial do mês',
            tipo: 'brinde',
            categoria: 'todos',
            pontos: 200,
            valor: 0,
            quantidade: 10,
            ilimitado: false,
            ativo: true,
            destaque: true,
            imagem: null,
            termos: 'Disponível enquanto durarem os estoques.',
            createdAt: new Date().toISOString(),
          },
          {
            id: '8',
            nome: 'Atendimento VIP',
            descricao: 'Atendimento VIP com horário exclusivo',
            tipo: 'especial',
            categoria: 'todos',
            pontos: 1000,
            valor: 0,
            quantidade: 5,
            ilimitado: false,
            ativo: true,
            destaque: true,
            imagem: null,
            termos: 'Agendamento com prioridade máxima.',
            createdAt: new Date().toISOString(),
          },
        ];

        // Salvar recompensas de exemplo no Firebase
        for (const recompensa of recompensasExemplo) {
          const { id, ...data } = recompensa;
          await firebaseService.add('recompensas', {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }

        setRecompensas(recompensasExemplo);
      } else {
        setRecompensas(recompensasData);
      }

      // Carregar categorias únicas
      const categoriasUnicas = [...new Set(recompensasData.map(r => r.categoria))];
      setCategorias(['todos', ...categoriasUnicas]);

    } catch (error) {
      console.error('Erro ao carregar recompensas:', error);
      toast.error('Erro ao carregar recompensas');
    } finally {
      setLoading(false);
    }
  };

  const carregarResgates = async () => {
    try {
      const resgatesData = await firebaseService.getAll('resgates_fidelidade').catch(() => []);
      setResgates(resgatesData || []);
    } catch (error) {
      console.error('Erro ao carregar resgates:', error);
    }
  };

  const handleSalvarRecompensa = async () => {
    try {
      if (!formData.nome) {
        toast.error('Nome da recompensa é obrigatório');
        return;
      }

      if (!formData.pontos || formData.pontos <= 0) {
        toast.error('Pontos deve ser maior que zero');
        return;
      }

      const dadosRecompensa = {
        ...formData,
        pontos: Number(formData.pontos),
        valor: Number(formData.valor),
        quantidade: Number(formData.quantidade),
        updatedAt: Timestamp.now(),
      };

      if (selectedRecompensa) {
        // Editar recompensa existente
        await firebaseService.update('recompensas', selectedRecompensa.id, dadosRecompensa);
        toast.success('Recompensa atualizada com sucesso!');
      } else {
        // Criar nova recompensa
        dadosRecompensa.createdAt = Timestamp.now();
        await firebaseService.add('recompensas', dadosRecompensa);
        toast.success('Recompensa criada com sucesso!');
      }

      setOpenCriarDialog(false);
      setOpenEditarDialog(false);
      carregarRecompensas();
      limparFormulario();

    } catch (error) {
      console.error('Erro ao salvar recompensa:', error);
      toast.error('Erro ao salvar recompensa');
    }
  };

  const handleResgatarRecompensa = async () => {
    try {
      if (!selectedRecompensaResgate) return;

      if (pontosUsuario < selectedRecompensaResgate.pontos) {
        toast.error('Saldo de pontos insuficiente');
        return;
      }

      const resgate = {
        recompensaId: selectedRecompensaResgate.id,
        recompensaNome: selectedRecompensaResgate.nome,
        clienteId: usuario?.clienteId || 'cliente_exemplo',
        clienteNome: usuario?.nome || 'Cliente',
        pontosGastos: selectedRecompensaResgate.pontos,
        data: new Date().toISOString(),
        status: 'resgatado',
        utilizado: false,
        codigo: gerarCodigoResgate(),
        observacoes: resgateForm.observacoes,
        usuarioId: usuario?.uid || 'sistema',
        usuarioNome: usuario?.nome || 'Sistema',
        createdAt: Timestamp.now(),
      };

      await firebaseService.add('resgates_fidelidade', resgate);

      // Registrar débito dos pontos
      const debito = {
        clienteId: usuario?.clienteId || 'cliente_exemplo',
        clienteNome: usuario?.nome || 'Cliente',
        quantidade: selectedRecompensaResgate.pontos,
        tipo: 'debito',
        motivo: `Resgate: ${selectedRecompensaResgate.nome}`,
        data: new Date().toISOString(),
        usuarioId: usuario?.uid || 'sistema',
        usuarioNome: usuario?.nome || 'Sistema',
        createdAt: Timestamp.now(),
      };
      await firebaseService.add('pontuacao', debito);

      // Atualizar quantidade disponível se não for ilimitado
      if (!selectedRecompensaResgate.ilimitado && selectedRecompensaResgate.quantidade > 0) {
        await firebaseService.update('recompensas', selectedRecompensaResgate.id, {
          quantidade: selectedRecompensaResgate.quantidade - 1,
        });
      }

      toast.success('Recompensa resgatada com sucesso!');
      setOpenResgatarDialog(false);
      carregarPontosUsuario(usuario?.clienteId);
      carregarResgates();

    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error);
      toast.error('Erro ao resgatar recompensa');
    }
  };

  const handleExcluirRecompensa = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta recompensa?')) return;

    try {
      await firebaseService.delete('recompensas', id);
      toast.success('Recompensa excluída com sucesso!');
      carregarRecompensas();
    } catch (error) {
      console.error('Erro ao excluir recompensa:', error);
      toast.error('Erro ao excluir recompensa');
    }
  };

  const gerarCodigoResgate = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  };

  const limparFormulario = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'desconto',
      categoria: 'cabelo',
      pontos: 100,
      valor: 0,
      quantidade: 0,
      ilimitado: false,
      ativo: true,
      destaque: false,
      validade: '',
      imagem: '',
      termos: '',
    });
    setSelectedRecompensa(null);
  };

  const abrirEditar = (recompensa) => {
    setSelectedRecompensa(recompensa);
    setFormData({
      nome: recompensa.nome || '',
      descricao: recompensa.descricao || '',
      tipo: recompensa.tipo || 'desconto',
      categoria: recompensa.categoria || 'cabelo',
      pontos: recompensa.pontos || 100,
      valor: recompensa.valor || 0,
      quantidade: recompensa.quantidade || 0,
      ilimitado: recompensa.ilimitado || false,
      ativo: recompensa.ativo !== false,
      destaque: recompensa.destaque || false,
      validade: recompensa.validade || '',
      imagem: recompensa.imagem || '',
      termos: recompensa.termos || '',
    });
    setOpenEditarDialog(true);
  };

  const abrirResgatar = (recompensa) => {
    setSelectedRecompensaResgate(recompensa);
    setResgateForm({
      clienteId: usuario?.clienteId || '',
      clienteNome: usuario?.nome || '',
      observacoes: '',
    });
    setOpenResgatarDialog(true);
  };

  const recompensasFiltradas = recompensas.filter(r => {
    const matchesSearch = r.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filtroCategoria === 'todos' || r.categoria === filtroCategoria;
    const matchesTipo = filtroTipo === 'todos' || r.tipo === filtroTipo;
    const matchesAtivo = r.ativo !== false;
    return matchesSearch && matchesCategoria && matchesTipo && matchesAtivo;
  });

  const recompensasEmDestaque = recompensasFiltradas.filter(r => r.destaque);
  const resgatesDoUsuario = resgates.filter(r => r.clienteId === usuario?.clienteId);

  const getTipoInfo = (tipo) => {
    return tiposRecompensa.find(t => t.value === tipo) || tiposRecompensa[0];
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Recompensas
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Resgate seus pontos por benefícios exclusivos
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Card de pontos do usuário */}
          {usuario?.clienteId && (
            <Card sx={{ bgcolor: '#f3e5f5', px: 3, py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CoinIcon sx={{ color: '#9c27b0', fontSize: 32 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Seus pontos</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {pontosUsuario}
                  </Typography>
                </Box>
                <Chip
                  label={nivelUsuario.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: niveis[nivelUsuario].cor,
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Card>
          )}

          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                limparFormulario();
                setOpenCriarDialog(true);
              }}
              sx={{ bgcolor: '#9c27b0' }}
            >
              Nova Recompensa
            </Button>
          )}
        </Box>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0' }}>
                  <GiftIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {recompensas.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Recompensas disponíveis
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
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {recompensasEmDestaque.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Em destaque
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
                <Avatar sx={{ bgcolor: '#4caf50' }}>
                  <CheckIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {resgates.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Resgates realizados
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
                  <PercentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {Math.min(100, Math.round((resgates.length / (recompensas.length || 1)) * 100))}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Taxa de resgate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar recompensas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={filtroCategoria}
                  label="Categoria"
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <MenuItem value="todos">Todas as categorias</MenuItem>
                  {categorias.filter(c => c !== 'todos').map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {categoriasRecompensa.find(c => c.value === cat)?.icon} {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filtroTipo}
                  label="Tipo"
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <MenuItem value="todos">Todos os tipos</MenuItem>
                  {tiposRecompensa.map(tipo => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.icon} {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setFiltroCategoria('todos');
                  setFiltroTipo('todos');
                }}
              >
                Limpar Filtros
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Todas" icon={<GiftIcon />} iconPosition="start" />
          <Tab label="Em Destaque" icon={<StarIcon />} iconPosition="start" />
          {usuario?.clienteId && (
            <Tab label="Meus Resgates" icon={<HistoryIcon />} iconPosition="start" />
          )}
        </Tabs>
      </Box>

      {/* Tab: Todas as Recompensas */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {recompensasFiltradas.map((recompensa) => {
            const tipoInfo = getTipoInfo(recompensa.tipo);
            const podeResgatar = usuario?.clienteId && pontosUsuario >= recompensa.pontos;

            return (
              <Grid item xs={12} sm={6} md={4} key={recompensa.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    border: recompensa.destaque ? '2px solid #ffd700' : 'none',
                  }}>
                    {recompensa.destaque && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: -30,
                          transform: 'rotate(45deg)',
                          bgcolor: '#ffd700',
                          color: '#000',
                          py: 0.5,
                          px: 4,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        DESTAQUE
                      </Box>
                    )}

                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: tipoInfo.cor }}>
                          {tipoInfo.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {recompensa.nome}
                          </Typography>
                          <Chip
                            size="small"
                            label={recompensa.categoria}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>

                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2, minHeight: 40 }}>
                        {recompensa.descricao}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Pontos necessários
                          </Typography>
                          <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                            {recompensa.pontos}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="textSecondary">
                            Disponível
                          </Typography>
                          <Typography variant="h6">
                            {recompensa.ilimitado ? '∞' : recompensa.quantidade}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {usuario?.clienteId ? (
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<GiftIcon />}
                            onClick={() => abrirResgatar(recompensa)}
                            disabled={!podeResgatar || (!recompensa.ilimitado && recompensa.quantidade <= 0)}
                            sx={{
                              bgcolor: podeResgatar ? '#9c27b0' : '#ccc',
                              '&:hover': {
                                bgcolor: podeResgatar ? '#7b1fa2' : '#ccc',
                              },
                            }}
                          >
                            {podeResgatar ? 'Resgatar' : 'Pontos insuficientes'}
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setOpenDetalhesDialog(true)}
                          >
                            Ver detalhes
                          </Button>
                        )}

                        {isAdmin && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => abrirEditar(recompensa)}
                                sx={{ color: '#2196f3' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={() => handleExcluirRecompensa(recompensa.id)}
                                sx={{ color: '#f44336' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}

          {recompensasFiltradas.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ py: 8, textAlign: 'center' }}>
                <GiftIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Nenhuma recompensa encontrada
                </Typography>
                {isAdmin && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCriarDialog(true)}
                    sx={{ mt: 2, bgcolor: '#9c27b0' }}
                  >
                    Criar primeira recompensa
                  </Button>
                )}
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Tab: Em Destaque */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {recompensasEmDestaque.map((recompensa) => {
            const tipoInfo = getTipoInfo(recompensa.tipo);
            const podeResgatar = usuario?.clienteId && pontosUsuario >= recompensa.pontos;

            return (
              <Grid item xs={12} sm={6} md={4} key={recompensa.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    border: '2px solid #ffd700',
                    background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)',
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: tipoInfo.cor }}>
                          {tipoInfo.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {recompensa.nome}
                          </Typography>
                          <Chip
                            size="small"
                            label="Destaque"
                            sx={{ bgcolor: '#ffd700', color: '#000', height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>

                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {recompensa.descricao}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Pontos necessários
                          </Typography>
                          <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                            {recompensa.pontos}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="textSecondary">
                            Disponível
                          </Typography>
                          <Typography variant="h6">
                            {recompensa.ilimitado ? '∞' : recompensa.quantidade}
                          </Typography>
                        </Box>
                      </Box>

                      {usuario?.clienteId && (
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<GiftIcon />}
                          onClick={() => abrirResgatar(recompensa)}
                          disabled={!podeResgatar || (!recompensa.ilimitado && recompensa.quantidade <= 0)}
                          sx={{
                            bgcolor: podeResgatar ? '#9c27b0' : '#ccc',
                            '&:hover': {
                              bgcolor: podeResgatar ? '#7b1fa2' : '#ccc',
                            },
                          }}
                        >
                          {podeResgatar ? 'Resgatar Agora' : 'Pontos insuficientes'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}

          {recompensasEmDestaque.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ py: 8, textAlign: 'center' }}>
                <StarIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Nenhuma recompensa em destaque
                </Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Tab: Meus Resgates */}
      {tabValue === 2 && usuario?.clienteId && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Histórico de Resgates
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Recompensa</strong></TableCell>
                    <TableCell><strong>Pontos</strong></TableCell>
                    <TableCell><strong>Código</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resgatesDoUsuario.map((resgate) => (
                    <TableRow key={resgate.id} hover>
                      <TableCell>
                        {new Date(resgate.data).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GiftIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
                          {resgate.recompensaNome}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600} color="#9c27b0">
                          {resgate.pontosGastos}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={resgate.codigo}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={resgate.utilizado ? 'Utilizado' : 'Ativo'}
                          size="small"
                          color={resgate.utilizado ? 'default' : 'success'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver código QR">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedRecompensaResgate(resgate);
                              setOpenCompartilharDialog(true);
                            }}
                            sx={{ color: '#9c27b0' }}
                          >
                            <QrCodeIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {resgatesDoUsuario.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography color="textSecondary">
                          Você ainda não resgatou nenhuma recompensa
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Criar/Editar Recompensa */}
      <Dialog open={openCriarDialog || openEditarDialog} onClose={() => {
        setOpenCriarDialog(false);
        setOpenEditarDialog(false);
        limparFormulario();
      }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {selectedRecompensa ? 'Editar Recompensa' : 'Nova Recompensa'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Recompensa"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                multiline
                rows={3}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  {tiposRecompensa.map(tipo => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.icon} {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={formData.categoria}
                  label="Categoria"
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  {categoriasRecompensa.filter(c => c.value !== 'todos').map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Pontos necessários"
                value={formData.pontos}
                onChange={(e) => setFormData({ ...formData, pontos: e.target.value })}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">⭐</InputAdornment>,
                }}
              />
            </Grid>

            {formData.tipo === 'desconto' && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Valor do desconto (%)"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ilimitado}
                    onChange={(e) => setFormData({ ...formData, ilimitado: e.target.checked })}
                  />
                }
                label="Ilimitado"
              />
            </Grid>

            {!formData.ilimitado && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantidade disponível"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                  size="small"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  />
                }
                label="Ativo"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.destaque}
                    onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                  />
                }
                label="Destacar"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Termos e condições"
                value={formData.termos}
                onChange={(e) => setFormData({ ...formData, termos: e.target.value })}
                multiline
                rows={2}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Validade"
                value={formData.validade}
                onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenCriarDialog(false);
            setOpenEditarDialog(false);
            limparFormulario();
          }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvarRecompensa}
            variant="contained"
            sx={{ bgcolor: '#9c27b0' }}
          >
            {selectedRecompensa ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Resgatar Recompensa */}
      <Dialog open={openResgatarDialog} onClose={() => setOpenResgatarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
          Resgatar Recompensa
        </DialogTitle>
        <DialogContent>
          {selectedRecompensaResgate && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Você está prestes a resgatar:
              </Alert>

              <Card variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: getTipoInfo(selectedRecompensaResgate.tipo).cor, width: 56, height: 56 }}>
                    {getTipoInfo(selectedRecompensaResgate.tipo).icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedRecompensaResgate.nome}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedRecompensaResgate.descricao}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Pontos necessários
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                      {selectedRecompensaResgate.pontos}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Seus pontos atuais
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 700 }}>
                      {pontosUsuario}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              <TextField
                fullWidth
                label="Observações (opcional)"
                value={resgateForm.observacoes}
                onChange={(e) => setResgateForm({ ...resgateForm, observacoes: e.target.value })}
                multiline
                rows={2}
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResgatarDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleResgatarRecompensa}
            variant="contained"
            color="warning"
            disabled={pontosUsuario < (selectedRecompensaResgate?.pontos || 0)}
          >
            Confirmar Resgate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Compartilhar Código QR */}
      <Dialog open={openCompartilharDialog} onClose={() => setOpenCompartilharDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Código de Resgate
        </DialogTitle>
        <DialogContent>
          {selectedRecompensaResgate && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Paper sx={{ p: 3, bgcolor: '#f5f5f5', mb: 2 }}>
                <QRCodeSVG
                  value={selectedRecompensaResgate.codigo || 'SEM_CODIGO'}
                  size={200}
                  level="H"
                  includeMargin
                  style={{ margin: '0 auto', display: 'block' }}
                />
              </Paper>

              <Typography variant="h6" gutterBottom>
                {selectedRecompensaResgate.recompensaNome}
              </Typography>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                Código: <strong>{selectedRecompensaResgate.codigo}</strong>
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedRecompensaResgate.codigo);
                    toast.success('Código copiado!');
                  }}
                >
                  Copiar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                >
                  Imprimir
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompartilharDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Recompensas;
