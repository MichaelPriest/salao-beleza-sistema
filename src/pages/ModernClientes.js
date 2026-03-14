// src/pages/ModernClientes.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Tab,
  Tabs,
  Autocomplete,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Print as PrintIcon,
  Star as StarIcon, // 🔥 NOVO ÍCONE
  EmojiEvents as TrophyIcon, // 🔥 NOVO ÍCONE
  PersonAdd as PersonAddIcon, // 🔥 NOVO ÍCONE
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';
import { 
  masks, 
  MaskedInput, 
  CepInput, 
  ImageUpload, 
  EnderecoForm,
  HistoricoAtendimentosCliente,
  imageCompressor
} from '../utils/plugins';
import { ImprimirCliente } from '../components/ImprimirCliente';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ModernClientes() {
  const componentRef = useRef(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openIndicacaoDialog, setOpenIndicacaoDialog] = useState(false); // 🔥 NOVO
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteIndicado, setClienteIndicado] = useState(null); // 🔥 NOVO
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [indicacoes, setIndicacoes] = useState([]); // 🔥 NOVO
  const [isPrinting, setIsPrinting] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    telefone2: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    observacoes: '',
    status: 'Regular',
    foto: null,
    preferencias: {
      profissionalPreferido: '',
      servicosPreferidos: [],
      notificacoes: true,
    },
    // 🔥 NOVOS CAMPOS PARA INDICAÇÃO
    indicadoPor: '',
    indicadoPorNome: '',
    dataIndicacao: null,
  });

  // 🔥 FUNÇÃO DE IMPRESSÃO CORRIGIDA
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: selectedCliente 
      ? `cliente_${String(selectedCliente.nome || 'sem_nome').replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}`
      : `cliente_${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      toast.loading('Preparando impressão...', { id: 'print' });
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      toast.success('Impressão concluída!', { id: 'print' });
    },
    onPrintError: (error) => {
      setIsPrinting(false);
      console.error('Erro na impressão:', error);
      toast.error('Erro ao imprimir. Tente novamente.', { id: 'print' });
    }
  });

  const handlePrintCliente = () => {
    if (!selectedCliente) {
      toast.error('Nenhum cliente selecionado para impressão');
      return;
    }
    
    // Pequeno delay para garantir que o componente esteja renderizado
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  // Carregar clientes do Firebase
  useEffect(() => {
    carregarClientes();
  }, []);

  // 🔥 Carregar indicações quando cliente é selecionado
  useEffect(() => {
    if (selectedCliente?.id) {
      carregarIndicacoes(selectedCliente.id);
    }
  }, [selectedCliente]);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.getAll('clientes');
      setClientes(data || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Erro ao carregar clientes');
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Carregar indicações do cliente
  const carregarIndicacoes = async (clienteId) => {
    try {
      const indicacoesData = await firebaseService.query('indicacoes', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]);
      setIndicacoes(indicacoesData || []);
    } catch (error) {
      console.error('Erro ao carregar indicações:', error);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm) ||
    cliente.cpf?.includes(searchTerm)
  );

  const handleAdd = () => {
    setSelectedCliente(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      telefone2: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      observacoes: '',
      status: 'Regular',
      foto: null,
      preferencias: {
        profissionalPreferido: '',
        servicosPreferidos: [],
        notificacoes: true,
      },
      indicadoPor: '',
      indicadoPorNome: '',
      dataIndicacao: null,
    });
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      nome: cliente.nome || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      telefone2: cliente.telefone2 || '',
      cpf: cliente.cpf || '',
      rg: cliente.rg || '',
      dataNascimento: cliente.dataNascimento || '',
      cep: cliente.cep || '',
      logradouro: cliente.logradouro || '',
      numero: cliente.numero || '',
      complemento: cliente.complemento || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      observacoes: cliente.observacoes || '',
      status: cliente.status || 'Regular',
      foto: cliente.foto || null,
      preferencias: cliente.preferencias || {
        profissionalPreferido: '',
        servicosPreferidos: [],
        notificacoes: true,
      },
      indicadoPor: cliente.indicadoPor || '',
      indicadoPorNome: cliente.indicadoPorNome || '',
      dataIndicacao: cliente.dataIndicacao || null,
    });
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleView = (cliente) => {
    setSelectedCliente(cliente);
    setOpenViewDialog(true);
  };

  // 🔥 FUNÇÃO PARA ABRIR DIALOG DE INDICAÇÃO
  const handleOpenIndicacao = (cliente) => {
    setSelectedCliente(cliente);
    setClienteIndicado(null);
    setOpenIndicacaoDialog(true);
  };

  // 🔥 FUNÇÃO PARA REGISTRAR INDICAÇÃO
  const handleRegistrarIndicacao = async () => {
    if (!clienteIndicado) {
      toast.error('Selecione o cliente indicado');
      return;
    }

    if (clienteIndicado.id === selectedCliente.id) {
      toast.error('O cliente não pode indicar a si mesmo');
      return;
    }

    try {
      // Verificar se já existe indicação para este cliente
      const indicacoesExistentes = await firebaseService.query('indicacoes', [
        { field: 'clienteIndicadoId', operator: '==', value: clienteIndicado.id }
      ]);

      if (indicacoesExistentes.length > 0) {
        toast.error('Este cliente já foi indicado por alguém');
        return;
      }

      // Buscar configurações de fidelidade
      const configFidelidade = await firebaseService.getAll('config_fidelidade');
      const config = configFidelidade[0] || { bonusIndicacao: 100 };

      const indicacaoData = {
        clienteId: selectedCliente.id, // Quem indicou
        clienteNome: selectedCliente.nome,
        clienteIndicadoId: clienteIndicado.id,
        clienteIndicadoNome: clienteIndicado.nome,
        dataIndicacao: new Date().toISOString(),
        status: 'pendente', // pendente, confirmada, cancelada
        pontosGanhos: 0,
        pontosBonus: config.bonusIndicacao || 100,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await firebaseService.add('indicacoes', indicacaoData);

      // Atualizar o cliente indicado com quem o indicou
      await firebaseService.update('clientes', clienteIndicado.id, {
        indicadoPor: selectedCliente.id,
        indicadoPorNome: selectedCliente.nome,
        dataIndicacao: new Date().toISOString(),
        updatedAt: Timestamp.now()
      });

      toast.success(`Indicação registrada! ${config.bonusIndicacao || 100} pontos serão creditados quando ${clienteIndicado.nome} realizar o primeiro atendimento.`);
      
      setOpenIndicacaoDialog(false);
      carregarIndicacoes(selectedCliente.id);
      
    } catch (err) {
      console.error('Erro ao registrar indicação:', err);
      toast.error('Erro ao registrar indicação');
    }
  };

  // 🔥 FUNÇÃO PARA CONFIRMAR INDICAÇÃO (quando o indicado faz primeiro atendimento)
  const handleConfirmarIndicacao = async (indicacaoId) => {
    try {
      const indicacao = indicacoes.find(i => i.id === indicacaoId);
      if (!indicacao) return;

      // Buscar configurações de fidelidade
      const configFidelidade = await firebaseService.getAll('config_fidelidade');
      const config = configFidelidade[0] || { bonusIndicacao: 100 };
      const pontosBonus = config.bonusIndicacao || 100;

      // Atualizar status da indicação
      await firebaseService.update('indicacoes', indicacaoId, {
        status: 'confirmada',
        pontosGanhos: pontosBonus,
        dataConfirmacao: new Date().toISOString(),
        updatedAt: Timestamp.now()
      });

      // Adicionar pontos ao cliente que indicou
      await firebaseService.add('pontuacao', {
        clienteId: indicacao.clienteId,
        clienteNome: indicacao.clienteNome,
        quantidade: pontosBonus,
        tipo: 'credito',
        motivo: `Bônus por indicação de ${indicacao.clienteIndicadoNome}`,
        data: new Date().toISOString(),
        indicacaoId: indicacaoId,
        createdAt: Timestamp.now()
      });

      toast.success(`Indicação confirmada! ${pontosBonus} pontos creditados para ${indicacao.clienteNome}.`);
      carregarIndicacoes(selectedCliente.id);
      
    } catch (error) {
      console.error('Erro ao confirmar indicação:', error);
      toast.error('Erro ao confirmar indicação');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await firebaseService.delete('clientes', id);
        await carregarClientes();
        toast.success('Cliente excluído com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    
    // Validações
    if (!formData.nome) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.email) {
      toast.error('Email é obrigatório');
      return;
    }
    if (!formData.telefone) {
      toast.error('Telefone é obrigatório');
      return;
    }
  
    if (formData.foto && imageCompressor) {
      try {
        const size = imageCompressor.getImageSize(formData.foto);
        if (size > 250) {
          toast.error(`Foto muito grande (${size.toFixed(0)}KB). Máximo 200KB.`);
          return;
        }
      } catch (err) {
        console.warn('Erro ao verificar tamanho da imagem:', err);
      }
    }
  
    const agora = new Date().toISOString();
    const hoje = new Date().toISOString().split('T')[0];
  
    const dadosParaSalvar = {
      ...formData,
      dataCadastro: selectedCliente ? selectedCliente.dataCadastro : hoje,
      ultimaVisita: selectedCliente ? selectedCliente.ultimaVisita : null,
      totalGasto: selectedCliente ? selectedCliente.totalGasto : 0,
      updatedAt: agora,
    };
  
    try {
      if (selectedCliente) {
        await firebaseService.update('clientes', selectedCliente.id, dadosParaSalvar);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        dadosParaSalvar.createdAt = agora;
        await firebaseService.add('clientes', dadosParaSalvar);
        toast.success('Cliente cadastrado com sucesso!');
      }
      
      setOpenDialog(false);
      carregarClientes();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      
      if (err.code === 'invalid-argument' && err.message.includes('too large')) {
        toast.error('Foto muito grande. Escolha uma imagem menor.');
      } else {
        toast.error('Erro ao salvar cliente');
      }
    }
  };

  const handleCepFound = (dados) => {
    setFormData(prev => ({
      ...prev,
      logradouro: dados.logradouro || prev.logradouro,
      bairro: dados.bairro || prev.bairro,
      cidade: dados.cidade || prev.cidade,
      estado: dados.estado || prev.estado,
      complemento: dados.complemento || prev.complemento,
    }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'VIP': return '#9c27b0';
      case 'Regular': return '#1976d2';
      case 'Novo': return '#2e7d32';
      default: return '#666';
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case 'VIP': return '#f3e5f5';
      case 'Regular': return '#e3f2fd';
      case 'Novo': return '#e8f5e8';
      default: return '#f5f5f5';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Clientes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie todos os clientes do salão
          </Typography>
        </Box>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              color: 'white',
              boxShadow: '0 3px 15px rgba(156,39,176,0.3)',
            }}
          >
            Novo Cliente
          </Button>
        </motion.div>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total de Clientes
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {clientes.length}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#f3e5f5' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Clientes VIP
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {clientes.filter(c => c.status === 'VIP').length}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Clientes Novos
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                  {clientes.filter(c => c.status === 'Novo').length}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total Gasto
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  R$ {clientes.reduce((acc, c) => acc + (c.totalGasto || 0), 0).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Barra de Pesquisa */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar clientes por nome, email, telefone ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Tabela de Clientes */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#faf5ff' }}>
                <TableCell><strong>Cliente</strong></TableCell>
                <TableCell><strong>Contato</strong></TableCell>
                <TableCell><strong>CPF</strong></TableCell>
                <TableCell><strong>Última Visita</strong></TableCell>
                <TableCell><strong>Total Gasto</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {filteredClientes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((cliente, index) => (
                    <motion.tr
                      key={cliente.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{ display: 'table-row' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={cliente.foto}
                            sx={{ 
                              width: 40, 
                              height: 40,
                              bgcolor: '#9c27b0',
                            }}
                          >
                            {!cliente.foto && cliente.nome?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {cliente.nome}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ID: {cliente.id ? String(cliente.id).substring(0, 8) : 'N/A'}
                            </Typography>
                            {cliente.indicadoPorNome && (
                              <Chip
                                icon={<StarIcon />}
                                label={`Indicado por: ${cliente.indicadoPorNome}`}
                                size="small"
                                sx={{ 
                                  mt: 0.5, 
                                  bgcolor: '#fff3e0',
                                  color: '#ff9800',
                                  fontSize: '0.6rem',
                                  height: 20
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            {cliente.telefone}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon fontSize="small" color="action" />
                            {cliente.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{cliente.cpf || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        {cliente.ultimaVisita ? new Date(cliente.ultimaVisita).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                          R$ {cliente.totalGasto?.toFixed(2) || '0,00'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={cliente.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusBgColor(cliente.status),
                            color: getStatusColor(cliente.status),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Ver detalhes">
                            <IconButton 
                              size="small" 
                              onClick={() => handleView(cliente)}
                              sx={{ color: '#9c27b0' }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Registrar indicação">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenIndicacao(cliente)}
                              sx={{ color: '#ff9800' }}
                            >
                              <PersonAddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEdit(cliente)}
                              sx={{ color: '#ff4081' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(cliente.id)}
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </motion.tr>
                  ))}
              </AnimatePresence>
              
              {filteredClientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <SearchIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      Nenhum cliente encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredClientes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label="Dados Pessoais" />
                <Tab label="Endereço" />
                <Tab label="Preferências" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ImageUpload
                    value={formData.foto}
                    onChange={(value) => setFormData({ ...formData, foto: value })}
                    label="Foto do Cliente"
                    maxSizeKB={150}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MaskedInput
                    mask="telefone"
                    label="Telefone Principal"
                    name="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    required
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MaskedInput
                    mask="telefone"
                    label="Telefone Secundário"
                    name="telefone2"
                    value={formData.telefone2}
                    onChange={(e) => setFormData({ ...formData, telefone2: e.target.value })}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MaskedInput
                    mask="cpf"
                    label="CPF"
                    name="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MaskedInput
                    mask="rg"
                    label="RG"
                    name="rg"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    size="small"
                    placeholder="00.000.000-0"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MaskedInput
                    mask="data"
                    label="Data de Nascimento"
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                    size="small"
                    placeholder="DD/MM/AAAA"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="VIP">VIP</MenuItem>
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="Novo">Novo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* 🔥 CAMPO DE INDICAÇÃO */}
                <Grid item xs={12}>
                  <Autocomplete
                    options={clientes.filter(c => c.id !== (selectedCliente?.id || ''))}
                    getOptionLabel={(option) => `${option.nome} - ${option.telefone || ''}`}
                    value={clientes.find(c => c.id === formData.indicadoPor) || null}
                    onChange={(e, newValue) => setFormData({
                      ...formData,
                      indicadoPor: newValue?.id || '',
                      indicadoPorNome: newValue?.nome || '',
                      dataIndicacao: newValue ? new Date().toISOString() : null
                    })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Indicado por (cliente)"
                        placeholder="Buscar cliente que indicou..."
                        helperText="Selecione o cliente que fez a indicação"
                        size="small"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <EnderecoForm
                endereco={{
                  cep: formData.cep,
                  logradouro: formData.logradouro,
                  numero: formData.numero,
                  complemento: formData.complemento,
                  bairro: formData.bairro,
                  cidade: formData.cidade,
                  estado: formData.estado,
                }}
                onChange={(campo, valor) => {
                  setFormData(prev => ({ ...prev, [campo]: valor }));
                }}
                onCepFound={(dados) => {
                  setFormData(prev => ({
                    ...prev,
                    logradouro: dados.logradouro || prev.logradouro,
                    bairro: dados.bairro || prev.bairro,
                    cidade: dados.cidade || prev.cidade,
                    estado: dados.estado || prev.estado,
                    complemento: dados.complemento || prev.complemento,
                  }));
                  toast.success('Endereço preenchido automaticamente!');
                }}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Profissional Preferido"
                    value={formData.preferencias.profissionalPreferido}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferencias: { ...formData.preferencias, profissionalPreferido: e.target.value }
                    })}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Serviços Preferidos</InputLabel>
                    <Select
                      multiple
                      value={formData.preferencias.servicosPreferidos}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferencias: { ...formData.preferencias, servicosPreferidos: e.target.value }
                      })}
                      label="Serviços Preferidos"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="Corte">Corte</MenuItem>
                      <MenuItem value="Manicure">Manicure</MenuItem>
                      <MenuItem value="Pedicure">Pedicure</MenuItem>
                      <MenuItem value="Coloração">Coloração</MenuItem>
                      <MenuItem value="Hidratação">Hidratação</MenuItem>
                      <MenuItem value="Maquiagem">Maquiagem</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Receber Notificações</InputLabel>
                    <Select
                      value={formData.preferencias.notificacoes}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferencias: { ...formData.preferencias, notificacoes: e.target.value === 'true' }
                      })}
                      label="Receber Notificações"
                    >
                      <MenuItem value={true}>Sim</MenuItem>
                      <MenuItem value={false}>Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    multiline
                    rows={3}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    size="small"
                    placeholder="Observações adicionais sobre o cliente..."
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              {selectedCliente ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes do Cliente
        </DialogTitle>
        <DialogContent>
          {selectedCliente && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={selectedCliente.foto}
                    sx={{
                      width: 150,
                      height: 150,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: '#9c27b0',
                      fontSize: '3rem',
                    }}
                  >
                    {!selectedCliente.foto && selectedCliente.nome?.charAt(0)}
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    {selectedCliente.nome}
                  </Typography>
                  <Chip
                    label={selectedCliente.status}
                    sx={{
                      backgroundColor: getStatusBgColor(selectedCliente.status),
                      color: getStatusColor(selectedCliente.status),
                      fontWeight: 600,
                    }}
                  />
                  
                  {/* 🔥 INFORMAÇÃO DE INDICAÇÃO */}
                  {selectedCliente.indicadoPorNome && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#ff9800', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon fontSize="small" />
                        Indicado por: {selectedCliente.indicadoPorNome}
                      </Typography>
                      {selectedCliente.dataIndicacao && (
                        <Typography variant="caption" color="textSecondary">
                          em {new Date(selectedCliente.dataIndicacao).toLocaleDateString('pt-BR')}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={8}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Informações de Contato
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Telefone</Typography>
                        <Typography variant="body2">{selectedCliente.telefone}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Telefone 2</Typography>
                        <Typography variant="body2">{selectedCliente.telefone2 || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Email</Typography>
                        <Typography variant="body2">{selectedCliente.email}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">CPF</Typography>
                        <Typography variant="body2">{selectedCliente.cpf || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">RG</Typography>
                        <Typography variant="body2">{selectedCliente.rg || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">Data Nasc.</Typography>
                        <Typography variant="body2">
                          {selectedCliente.dataNascimento 
                            ? new Date(selectedCliente.dataNascimento).toLocaleDateString('pt-BR')
                            : '-'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Endereço
                    </Typography>
                    <Typography variant="body2">
                      {selectedCliente.logradouro || ''} {selectedCliente.numero || ''}
                      {selectedCliente.complemento && ` - ${selectedCliente.complemento}`}
                      <br />
                      {selectedCliente.bairro || ''} - {selectedCliente.cidade || ''}/{selectedCliente.estado || ''}
                      <br />
                      CEP: {selectedCliente.cep || ''}
                    </Typography>

                    {selectedCliente.observacoes && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Observações
                        </Typography>
                        <Typography variant="body2">{selectedCliente.observacoes}</Typography>
                      </>
                    )}
                  </Card>
                </Grid>

                {/* 🔥 SEÇÃO DE INDICAÇÕES FEITAS POR ESTE CLIENTE */}
                {indicacoes.length > 0 && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ff9800' }}>
                          <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Indicações Feitas
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Cliente Indicado</TableCell>
                                <TableCell>Data</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Pontos</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {indicacoes.map((ind) => (
                                <TableRow key={ind.id}>
                                  <TableCell>{ind.clienteIndicadoNome}</TableCell>
                                  <TableCell>{new Date(ind.dataIndicacao).toLocaleDateString('pt-BR')}</TableCell>
                                  <TableCell>
                                    <Chip
                                      size="small"
                                      label={ind.status === 'confirmada' ? 'Confirmada' : ind.status === 'pendente' ? 'Pendente' : 'Cancelada'}
                                      color={ind.status === 'confirmada' ? 'success' : ind.status === 'pendente' ? 'warning' : 'error'}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    {ind.status === 'confirmada' ? (
                                      <Typography sx={{ fontWeight: 600, color: '#4caf50' }}>
                                        +{ind.pontosGanhos}
                                      </Typography>
                                    ) : (
                                      <Typography sx={{ color: '#ff9800' }}>
                                        +{ind.pontosBonus} (pendente)
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Fechar</Button>
          {selectedCliente && (
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintCliente}
              disabled={isPrinting}
              sx={{ mr: 1 }}
            >
              {isPrinting ? 'Imprimindo...' : 'Imprimir Ficha'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 🔥 DIALOG DE INDICAÇÃO */}
      <Dialog open={openIndicacaoDialog} onClose={() => setOpenIndicacaoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
          <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Registrar Indicação
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Ao indicar um novo cliente, você ganhará pontos de fidelidade quando ele realizar o primeiro atendimento.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Cliente que está indicando:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#faf5ff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={selectedCliente?.foto} sx={{ bgcolor: '#9c27b0' }}>
                      {selectedCliente?.nome?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedCliente?.nome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {selectedCliente?.telefone}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Cliente indicado:
                </Typography>
                <Autocomplete
                  options={clientes.filter(c => c.id !== selectedCliente?.id)}
                  getOptionLabel={(option) => `${option.nome} - ${option.telefone || ''}`}
                  value={clienteIndicado}
                  onChange={(e, newValue) => setClienteIndicado(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar cliente indicado"
                      placeholder="Digite o nome do cliente..."
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIndicacaoDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleRegistrarIndicacao}
            disabled={!clienteIndicado}
            sx={{ bgcolor: '#ff9800' }}
          >
            Registrar Indicação
          </Button>
        </DialogActions>
      </Dialog>

      {/* Componente oculto para impressão */}
      {selectedCliente && (
        <Box sx={{ display: 'none' }}>
          <ImprimirCliente
            ref={componentRef}
            cliente={selectedCliente}
          />
        </Box>
      )}
    </Box>
  );
}

export default ModernClientes;
