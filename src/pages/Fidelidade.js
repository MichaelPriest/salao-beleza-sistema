// src/pages/Fidelidade.js
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
  LinearProgress,
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
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  Redeem as RewardIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  MonetizationOn as CoinIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useFirebase } from '../hooks/useFirebase';
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';

// Configuração dos níveis de fidelidade
const niveis = {
  bronze: { 
    cor: '#cd7f32', 
    corFundo: '#fff3e0',
    minimo: 0, 
    multiplicador: 1,
    beneficios: ['5% de desconto', 'Aniversário: 50 pontos extras']
  },
  prata: { 
    cor: '#c0c0c0', 
    corFundo: '#f5f5f5',
    minimo: 500, 
    multiplicador: 1.2,
    beneficios: ['10% de desconto', 'Prioridade no agendamento', 'Cortesia no aniversário']
  },
  ouro: { 
    cor: '#ffd700', 
    corFundo: '#fff9e6',
    minimo: 2000, 
    multiplicador: 1.5,
    beneficios: ['15% de desconto', 'Agendamento VIP', 'Brinde surpresa', 'Convite para eventos']
  },
  platina: { 
    cor: '#e5e4e2', 
    corFundo: '#f0f0f0',
    minimo: 5000, 
    multiplicador: 2,
    beneficios: ['20% de desconto', 'Acesso antecipado a promoções', 'Presente de aniversário', 'Consultoria exclusiva']
  },
};

// Recompensas disponíveis
const recompensasPadrao = [
  { id: 'desc_10', nome: '10% de desconto', pontos: 100, tipo: 'desconto', valor: 10 },
  { id: 'desc_15', nome: '15% de desconto', pontos: 200, tipo: 'desconto', valor: 15 },
  { id: 'desc_20', nome: '20% de desconto', pontos: 300, tipo: 'desconto', valor: 20 },
  { id: 'servico_brinde', nome: 'Serviço Brinde', pontos: 500, tipo: 'servico', valor: 0 },
  { id: 'produto_brinde', nome: 'Produto Brinde', pontos: 400, tipo: 'produto', valor: 0 },
  { id: 'cortesia_aniversario', nome: 'Cortesia de Aniversário', pontos: 0, tipo: 'especial', valor: 0 },
];

// Regras de segurança para o Firebase (adicione no Firebase Console)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para fidelidade
    match /pontuacao/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.usuarioId || 
         request.auth.token.isAdmin == true);
    }
    
    match /resgates_fidelidade/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.usuarioId || 
         request.auth.token.isAdmin == true);
    }
    
    match /config_fidelidade/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.isAdmin == true;
    }
  }
}
*/

function Fidelidade() {
  const [loading, setLoading] = useState(true);
  const [clientesFidelidade, setClientesFidelidade] = useState([]);
  const [recompensas, setRecompensas] = useState(recompensasPadrao);
  const [historico, setHistorico] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [openPontosDialog, setOpenPontosDialog] = useState(false);
  const [openRecompensaDialog, setOpenRecompensaDialog] = useState(false);
  const [pontosForm, setPontosForm] = useState({
    quantidade: '',
    motivo: '',
    tipo: 'credito', // 'credito' ou 'debito'
  });
  const [config, setConfig] = useState({
    pontosPorReal: 1,
    pontosAniversario: 50,
    pontosIndicacao: 100,
  });
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Hooks do Firebase
  const { data: clientes, loading: loadingClientes } = useFirebase('clientes');
  const { data: pontuacao, loading: loadingPontuacao, error: errorPontuacao } = useFirebase('pontuacao');
  const { data: resgates, loading: loadingResgates, error: errorResgates } = useFirebase('resgates_fidelidade');
  const { data: configuracoes, loading: loadingConfig, error: errorConfig } = useFirebase('config_fidelidade');

  useEffect(() => {
    // Carregar usuário do localStorage
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const user = JSON.parse(usuarioStr);
        setUsuario(user);
        setIsAdmin(user.cargo === 'admin' || user.permissoes?.includes('admin'));
      }
    } catch (e) {
      console.error('Erro ao carregar usuário:', e);
    }
  }, []);

  useEffect(() => {
    if (!loadingClientes) {
      carregarDados();
    }
  }, [loadingClientes, pontuacao, resgates, configuracoes]);

  const carregarDados = async () => {
    try {
      // Carregar configurações (se houver erro, usar padrão)
      if (configuracoes && configuracoes.length > 0) {
        setConfig(configuracoes[0]);
      }

      // Calcular pontuação de cada cliente
      const dados = clientes?.map(cliente => {
        const pontosGanhos = pontuacao?.filter(p => p.clienteId === cliente.id && p.tipo === 'credito')
          .reduce((acc, p) => acc + (p.quantidade || 0), 0) || 0;
        
        const pontosGastos = pontuacao?.filter(p => p.clienteId === cliente.id && p.tipo === 'debito')
          .reduce((acc, p) => acc + (p.quantidade || 0), 0) || 0;
        
        const saldo = pontosGanhos - pontosGastos;
        
        let nivel = 'bronze';
        if (saldo >= 5000) nivel = 'platina';
        else if (saldo >= 2000) nivel = 'ouro';
        else if (saldo >= 500) nivel = 'prata';
        
        const proximoNivel = nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'platina';
        const pontosFaltantes = Math.max(0, niveis[proximoNivel].minimo - saldo);
        const progresso = Math.min((saldo / niveis[proximoNivel].minimo) * 100, 100);
        
        // Histórico do cliente
        const historicoCliente = [
          ...(pontuacao?.filter(p => p.clienteId === cliente.id) || []),
          ...(resgates?.filter(r => r.clienteId === cliente.id) || [])
        ].sort((a, b) => {
          const dataA = a.data ? new Date(a.data) : new Date(0);
          const dataB = b.data ? new Date(b.data) : new Date(0);
          return dataB - dataA;
        });

        return {
          ...cliente,
          saldo,
          nivel,
          proximoNivel,
          pontosFaltantes,
          progresso,
          historico: historicoCliente.slice(0, 5),
        };
      }).sort((a, b) => b.saldo - a.saldo) || [];

      setClientesFidelidade(dados);

      // Carregar histórico geral
      const historicoGeral = [
        ...(pontuacao || []),
        ...(resgates || [])
      ].sort((a, b) => {
        const dataA = a.data ? new Date(a.data) : new Date(0);
        const dataB = b.data ? new Date(b.data) : new Date(0);
        return dataB - dataA;
      });
      setHistorico(historicoGeral);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Não mostrar toast para erros de permissão para não poluir a interface
      if (!error.message.includes('permissions')) {
        toast.error('Erro ao carregar dados de fidelidade');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarPontos = async () => {
    try {
      if (!selectedCliente) return;
      if (!pontosForm.quantidade || pontosForm.quantidade <= 0) {
        toast.error('Quantidade inválida');
        return;
      }

      // Verificar se tem permissão (apenas admin pode adicionar/remover pontos manualmente)
      if (!isAdmin) {
        toast.error('Apenas administradores podem gerenciar pontos manualmente');
        return;
      }

      const novaPontuacao = {
        clienteId: selectedCliente.id,
        clienteNome: selectedCliente.nome,
        quantidade: parseInt(pontosForm.quantidade),
        tipo: pontosForm.tipo,
        motivo: pontosForm.motivo || (pontosForm.tipo === 'credito' ? 'Crédito manual' : 'Débito manual'),
        data: new Date().toISOString(),
        usuarioId: usuario?.uid || 'sistema',
        usuarioNome: usuario?.nome || 'Sistema',
        createdAt: Timestamp.now(),
      };

      await firebaseService.add('pontuacao', novaPontuacao);
      
      toast.success(
        pontosForm.tipo === 'credito' 
          ? `${pontosForm.quantidade} pontos adicionados!` 
          : `${pontosForm.quantidade} pontos removidos!`
      );

      setOpenPontosDialog(false);
      setPontosForm({ quantidade: '', motivo: '', tipo: 'credito' });
      
      // Recarregar dados
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      toast.error('Erro ao processar pontos');
    }
  };

  const handleResgatarRecompensa = async (recompensa) => {
    try {
      if (!selectedCliente) return;
      
      if (selectedCliente.saldo < recompensa.pontos) {
        toast.error('Saldo insuficiente');
        return;
      }

      const resgate = {
        clienteId: selectedCliente.id,
        clienteNome: selectedCliente.nome,
        recompensaId: recompensa.id,
        recompensaNome: recompensa.nome,
        pontosGastos: recompensa.pontos,
        data: new Date().toISOString(),
        status: 'resgatado',
        utilizado: false,
        usuarioId: usuario?.uid || 'sistema',
        usuarioNome: usuario?.nome || 'Sistema',
        createdAt: Timestamp.now(),
      };

      await firebaseService.add('resgates_fidelidade', resgate);

      // Registrar débito dos pontos
      const debito = {
        clienteId: selectedCliente.id,
        clienteNome: selectedCliente.nome,
        quantidade: recompensa.pontos,
        tipo: 'debito',
        motivo: `Resgate: ${recompensa.nome}`,
        data: new Date().toISOString(),
        usuarioId: usuario?.uid || 'sistema',
        usuarioNome: usuario?.nome || 'Sistema',
        createdAt: Timestamp.now(),
      };
      await firebaseService.add('pontuacao', debito);

      toast.success(`Recompensa "${recompensa.nome}" resgatada!`);
      setOpenRecompensaDialog(false);
      
      // Recarregar dados
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error);
      toast.error('Erro ao resgatar recompensa');
    }
  };

  const handleConfigChange = async () => {
    try {
      if (!isAdmin) {
        toast.error('Apenas administradores podem alterar configurações');
        return;
      }

      if (configuracoes && configuracoes.length > 0) {
        await firebaseService.update('config_fidelidade', configuracoes[0].id, config);
      } else {
        await firebaseService.add('config_fidelidade', config);
      }
      toast.success('Configurações salvas!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const clientesFiltrados = clientesFidelidade.filter(c => 
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefone?.includes(searchTerm) ||
    c.nivel?.includes(searchTerm.toLowerCase())
  );

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
            Programa de Fidelidade
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Recompense seus clientes mais fiéis
          </Typography>
          {!isAdmin && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Você está no modo cliente. Apenas visualização.
            </Alert>
          )}
        </Box>
        
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={handleConfigChange}
            >
              Configurações
            </Button>
          </Box>
        )}
      </Box>

      {/* Cards dos Níveis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(niveis).map(([nivel, configNivel]) => {
          const count = clientesFidelidade.filter(c => c.nivel === nivel).length;
          return (
            <Grid item xs={12} sm={6} md={3} key={nivel}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ 
                  bgcolor: configNivel.corFundo,
                  border: `2px solid ${configNivel.cor}`,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <StarIcon sx={{ fontSize: 40, color: configNivel.cor }} />
                      <Chip
                        label={`${count} cliente${count !== 1 ? 's' : ''}`}
                        size="small"
                        sx={{ bgcolor: configNivel.cor, color: 'white' }}
                      />
                    </Box>
                    
                    <Typography variant="h5" sx={{ fontWeight: 700, textTransform: 'uppercase', color: configNivel.cor }}>
                      {nivel}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {configNivel.multiplicador}x pontos
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      {configNivel.beneficios.map((beneficio, idx) => (
                        <Typography key={idx} variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                          • {beneficio}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Clientes" icon={<StarIcon />} iconPosition="start" />
          <Tab label="Recompensas" icon={<GiftIcon />} iconPosition="start" />
          <Tab label="Histórico" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab: Clientes */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Clientes Fidelidade
              </Typography>
              
              <TextField
                size="small"
                placeholder="Buscar cliente..."
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
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Nível</strong></TableCell>
                    <TableCell><strong>Saldo</strong></TableCell>
                    <TableCell><strong>Progresso</strong></TableCell>
                    {isAdmin && <TableCell align="center"><strong>Ações</strong></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={cliente.foto} sx={{ bgcolor: niveis[cliente.nivel].cor }}>
                            {cliente.nome?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{cliente.nome}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {cliente.telefone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={cliente.nivel.toUpperCase()}
                          sx={{
                            bgcolor: `${niveis[cliente.nivel].cor}20`,
                            color: niveis[cliente.nivel].cor,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                          {cliente.saldo}
                        </Typography>
                      </TableCell>
                      
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">
                              Próximo: {cliente.proximoNivel}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {cliente.progresso.toFixed(0)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={cliente.progresso}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: niveis[cliente.proximoNivel].cor,
                              },
                            }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            Faltam {cliente.pontosFaltantes} pontos
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      {isAdmin && (
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Adicionar/Remover Pontos">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedCliente(cliente);
                                  setOpenPontosDialog(true);
                                }}
                                sx={{ color: '#9c27b0' }}
                              >
                                <CoinIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Resgatar Recompensa">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedCliente(cliente);
                                  setOpenRecompensaDialog(true);
                                }}
                                sx={{ color: '#ff9800' }}
                              >
                                <GiftIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}

                  {clientesFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 4 }}>
                        <StarIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography color="textSecondary">
                          Nenhum cliente encontrado
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

      {/* Tab: Recompensas */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {recompensas.map((recompensa) => (
            <Grid item xs={12} sm={6} md={4} key={recompensa.id}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#9c27b0' }}>
                        <RewardIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {recompensa.nome}
                        </Typography>
                        <Chip
                          size="small"
                          label={recompensa.tipo}
                          sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h3" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                        {recompensa.pontos}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        pontos necessários
                      </Typography>
                    </Box>

                    {isAdmin && (
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2, borderColor: '#9c27b0', color: '#9c27b0' }}
                        onClick={() => {
                          setSelectedCliente(null);
                          setOpenRecompensaDialog(true);
                        }}
                      >
                        Resgatar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab: Histórico */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Histórico de Movimentações
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell align="right"><strong>Pontos</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historico.slice(0, 50).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>{item.clienteNome || item.clienteId}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.tipo === 'credito' ? 'Crédito' : item.tipo === 'debito' ? 'Débito' : 'Resgate'}
                          color={item.tipo === 'credito' ? 'success' : item.tipo === 'debito' ? 'error' : 'warning'}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>{item.motivo || item.recompensaNome}</TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: item.tipo === 'credito' ? '#4caf50' : '#f44336',
                          }}
                        >
                          {item.tipo === 'credito' ? '+' : '-'}{item.quantidade || item.pontosGastos}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Pontos */}
      <Dialog open={openPontosDialog} onClose={() => setOpenPontosDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {selectedCliente?.nome} - Gerenciar Pontos
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Tipo de operação</FormLabel>
                <RadioGroup
                  row
                  value={pontosForm.tipo}
                  onChange={(e) => setPontosForm({ ...pontosForm, tipo: e.target.value })}
                >
                  <FormControlLabel value="credito" control={<Radio />} label="Adicionar pontos" />
                  <FormControlLabel value="debito" control={<Radio />} label="Remover pontos" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantidade"
                value={pontosForm.quantidade}
                onChange={(e) => setPontosForm({ ...pontosForm, quantidade: e.target.value })}
                size="small"
                InputProps={{
                  inputProps: { min: 1 },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Saldo atual"
                value={selectedCliente?.saldo || 0}
                disabled
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo"
                value={pontosForm.motivo}
                onChange={(e) => setPontosForm({ ...pontosForm, motivo: e.target.value })}
                size="small"
                placeholder="Ex: Indicação, promoção, ajuste..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPontosDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleAdicionarPontos}
            variant="contained"
            sx={{ bgcolor: '#9c27b0' }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Recompensas */}
      <Dialog open={openRecompensaDialog} onClose={() => setOpenRecompensaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
          Resgatar Recompensa
        </DialogTitle>
        <DialogContent>
          {selectedCliente && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Saldo atual de {selectedCliente.nome}: <strong>{selectedCliente.saldo} pontos</strong>
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {recompensas.map((recompensa) => (
              <Grid item xs={12} key={recompensa.id}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: selectedCliente ? 'pointer' : 'default',
                    '&:hover': selectedCliente ? { bgcolor: '#f5f5f5' } : {},
                    opacity: selectedCliente && selectedCliente.saldo < recompensa.pontos ? 0.5 : 1,
                  }}
                  onClick={() => selectedCliente && handleResgatarRecompensa(recompensa)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#9c27b0' }}>
                          <RewardIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {recompensa.nome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {recompensa.tipo}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                          {recompensa.pontos}
                        </Typography>
                        <Typography variant="caption">pontos</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecompensaDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Fidelidade;
