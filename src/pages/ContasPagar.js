// src/pages/ContasPagar.js
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
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  LinearProgress,
  TablePagination,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
  Percent as PercentIcon,
  Cancel as CancelIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  ReceiptLong as ReceiptLongIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente', icon: <WarningIcon /> },
  pago: { color: '#4caf50', label: 'Pago', icon: <CheckCircleIcon /> },
  atrasado: { color: '#f44336', label: 'Atrasado', icon: <WarningIcon /> },
  cancelado: { color: '#9e9e9e', label: 'Cancelado', icon: <CancelIcon /> },
  concluida: { color: '#4caf50', label: 'Concluída', icon: <CheckCircleIcon /> },
  cancelada: { color: '#f44336', label: 'Cancelada', icon: <CancelIcon /> },
};

const origemColors = {
  manual: { color: '#757575', label: 'Manual', icon: <ReceiptIcon /> },
  comissao: { color: '#9c27b0', label: 'Comissão', icon: <PercentIcon /> },
  compra: { color: '#ff9800', label: 'Compra', icon: <ShoppingCartIcon /> },
};

const formasPagamento = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '⚡' },
  { value: 'boleto', label: 'Boleto', icon: '📄' },
  { value: 'transferencia', label: 'Transferência', icon: '🔄' },
  { value: 'credito_loja', label: 'Crédito na Loja', icon: '🏪' },
];

// Função para formatar data
const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};

const formatarDataISO = (data) => {
  if (!data) return '';
  const d = new Date(data);
  return d.toISOString().split('T')[0];
};

function ContasPagar() {
  const [loading, setLoading] = useState(true);
  const [contas, setContas] = useState([]);
  const [contasManuais, setContasManuais] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [caixa, setCaixa] = useState(null);
  
  // Filtros
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroOrigem, setFiltroOrigem] = useState('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [openPagamentoDialog, setOpenPagamentoDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [contaEditando, setContaEditando] = useState(null);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Formulário
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: formatarDataISO(new Date()),
    categoria: 'Fornecedor',
    fornecedorId: '',
    profissionalId: '',
    atendimentoId: '',
    percentual: '',
    formaPagamento: 'boleto',
    observacoes: '',
    status: 'pendente',
    recorrente: false,
    parcelas: 1,
    origem: 'manual',
    origemId: '',
    itens: [],
    numeroPedido: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [
        contasData,
        comissoesData,
        comprasData,
        fornecedoresData,
        profissionaisData,
        caixaData
      ] = await Promise.all([
        firebaseService.getAll('contas_pagar').catch(() => []),
        firebaseService.getAll('comissoes').catch(() => []),
        firebaseService.getAll('compras').catch(() => []),
        firebaseService.getAll('fornecedores').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('caixa').catch(() => []),
      ]);
      
      // Garantir que todos os dados são arrays
      const contasArray = Array.isArray(contasData) ? contasData : [];
      const comissoesArray = Array.isArray(comissoesData) ? comissoesData : [];
      const comprasArray = Array.isArray(comprasData) ? comprasData : [];
      const fornecedoresArray = Array.isArray(fornecedoresData) ? fornecedoresData : [];
      const profissionaisArray = Array.isArray(profissionaisData) ? profissionaisData : [];
      
      setContasManuais(contasArray);
      setComissoes(comissoesArray);
      setCompras(comprasArray);
      setFornecedores(fornecedoresArray);
      setProfissionais(profissionaisArray);
      
      // Converter comissões para contas a pagar
      const contasComissoes = comissoesArray
        .filter(c => c.status !== 'pago' && c.status !== 'cancelado')
        .map(comissao => ({
          id: `comissao_${comissao.id}`,
          origem: 'comissao',
          origemId: comissao.id,
          descricao: `Comissão - ${comissao.servicoNome || 'Serviço'}`,
          valor: comissao.valor || 0,
          dataVencimento: comissao.data || comissao.dataRegistro?.split('T')[0],
          categoria: 'Comissões',
          formaPagamento: 'credito_loja',
          status: comissao.status === 'atrasado' ? 'atrasado' : 'pendente',
          profissionalId: comissao.profissionalId,
          profissionalNome: comissao.profissionalNome,
          atendimentoId: comissao.atendimentoId,
          servicoId: comissao.servicoId,
          servicoNome: comissao.servicoNome,
          percentual: comissao.percentual,
          valorAtendimento: comissao.valorAtendimento,
          observacoes: `Comissão de ${comissao.percentual}% sobre atendimento de R$ ${comissao.valorAtendimento}`,
          dataCriacao: comissao.createdAt,
        }));

      // Converter compras para contas a pagar
      const contasCompras = comprasArray
        .filter(c => c.status !== 'pago' && c.status !== 'cancelada')
        .map(compra => ({
          id: `compra_${compra.id}`,
          origem: 'compra',
          origemId: compra.id,
          descricao: `Compra - ${compra.numeroPedido || 'Pedido'}`,
          valor: compra.valorTotal || 0,
          dataVencimento: compra.dataCompra,
          categoria: 'Compras',
          formaPagamento: compra.formaPagamento || 'pix',
          status: compra.status === 'atrasado' ? 'atrasado' : 'pendente',
          fornecedorId: compra.fornecedorId,
          numeroPedido: compra.numeroPedido,
          prazoEntrega: compra.prazoEntrega,
          itens: compra.itens || [],
          observacoes: compra.observacoes,
          dataCriacao: compra.createdAt,
        }));

      // Combinar todas as contas
      const todasContas = [
        ...contasArray.map(c => ({ ...c, origem: 'manual' })),
        ...contasComissoes,
        ...contasCompras
      ];

      // Ordenar por data de vencimento (mais próximas primeiro)
      todasContas.sort((a, b) => {
        const dataA = new Date(a.dataVencimento || a.dataCriacao);
        const dataB = new Date(b.dataVencimento || b.dataCriacao);
        return dataA - dataB;
      });

      setContas(todasContas);
      
      // Pega o caixa atual (último caixa aberto)
      const caixaAtual = caixaData?.length > 0 
        ? caixaData.filter(c => c && c.status === 'aberto')
            .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))[0]
        : null;
      setCaixa(caixaAtual);
      
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

  const handleOpenDialog = (conta = null) => {
    if (conta && conta.origem === 'manual') {
      setContaEditando(conta);
      setFormData({
        descricao: conta.descricao || '',
        valor: conta.valor || '',
        dataVencimento: conta.dataVencimento || formatarDataISO(new Date()),
        categoria: conta.categoria || 'Fornecedor',
        fornecedorId: conta.fornecedorId || '',
        profissionalId: conta.profissionalId || '',
        percentual: conta.percentual || '',
        formaPagamento: conta.formaPagamento || 'boleto',
        observacoes: conta.observacoes || '',
        status: conta.status || 'pendente',
        recorrente: conta.recorrente || false,
        parcelas: conta.parcelas || 1,
        origem: 'manual',
        origemId: '',
        itens: [],
        numeroPedido: '',
      });
    } else if (conta) {
      // Não permitir edição de comissões/compras diretamente
      mostrarSnackbar('Esta conta não pode ser editada diretamente', 'warning');
      return;
    } else {
      setContaEditando(null);
      setFormData({
        descricao: '',
        valor: '',
        dataVencimento: formatarDataISO(new Date()),
        categoria: 'Fornecedor',
        fornecedorId: '',
        profissionalId: '',
        percentual: '',
        formaPagamento: 'boleto',
        observacoes: '',
        status: 'pendente',
        recorrente: false,
        parcelas: 1,
        origem: 'manual',
        origemId: '',
        itens: [],
        numeroPedido: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setContaEditando(null);
  };

  const handleOpenPagamento = (conta) => {
    setContaSelecionada(conta);
    setOpenPagamentoDialog(true);
  };

  const handleClosePagamento = () => {
    setOpenPagamentoDialog(false);
    setContaSelecionada(null);
  };

  const handleOpenDetalhes = (conta) => {
    setContaSelecionada(conta);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setContaSelecionada(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função para pagar comissão
  const handlePagarComissao = async (comissaoId) => {
    try {
      await firebaseService.update('comissoes', comissaoId, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      mostrarSnackbar('✅ Comissão paga com sucesso!');
      await carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao pagar comissão:', error);
      mostrarSnackbar('Erro ao pagar comissão', 'error');
    }
  };

  // Função para pagar compra
  const handlePagarCompra = async (compraId) => {
    try {
      await firebaseService.update('compras', compraId, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      mostrarSnackbar('✅ Compra paga com sucesso!');
      await carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao pagar compra:', error);
      mostrarSnackbar('Erro ao pagar compra', 'error');
    }
  };

  const handleRegistrarPagamento = async () => {
    try {
      if (!contaSelecionada || !contaSelecionada.id) {
        mostrarSnackbar('Conta inválida', 'error');
        return;
      }

      // Pagamento específico por origem
      if (contaSelecionada.origem === 'comissao' && contaSelecionada.origemId) {
        await handlePagarComissao(contaSelecionada.origemId);
        handleClosePagamento();
        return;
      }

      if (contaSelecionada.origem === 'compra' && contaSelecionada.origemId) {
        await handlePagarCompra(contaSelecionada.origemId);
        handleClosePagamento();
        return;
      }

      // Para contas manuais
      const dadosConta = {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await firebaseService.update('contas_pagar', contaSelecionada.id, dadosConta);

      // Atualizar caixa se estiver aberto
      if (caixa && caixa.status === 'aberto' && caixa.id) {
        const novoSaldo = (caixa.saldoAtual || 0) - Number(contaSelecionada.valor);
        
        const novaMovimentacao = {
          id: Date.now().toString(),
          tipo: 'despesa',
          valor: Number(contaSelecionada.valor),
          descricao: `Pagamento: ${contaSelecionada.descricao}`,
          data: new Date().toISOString(),
          contaId: contaSelecionada.id,
          origem: contaSelecionada.origem,
        };
        
        const movimentacoesAtuais = Array.isArray(caixa.movimentacoes) ? caixa.movimentacoes : [];
        const novasMovimentacoes = [...movimentacoesAtuais, novaMovimentacao];
        
        await firebaseService.update('caixa', caixa.id, {
          saldoAtual: Number(novoSaldo),
          movimentacoes: novasMovimentacoes,
          updatedAt: new Date().toISOString(),
        });
      }

      mostrarSnackbar('Pagamento registrado com sucesso!');
      await carregarDados(); // Recarregar dados
      handleClosePagamento();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      mostrarSnackbar('Erro ao registrar pagamento', 'error');
    }
  };

  const handleSalvar = async () => {
    try {
      if (!formData.descricao?.trim()) {
        mostrarSnackbar('Descrição é obrigatória', 'error');
        return;
      }

      const valorNumerico = parseFloat(formData.valor);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        mostrarSnackbar('Valor deve ser maior que zero', 'error');
        return;
      }

      // Preparar dados para salvar
      const dadosParaSalvar = {
        descricao: String(formData.descricao).trim(),
        valor: Number(valorNumerico),
        dataVencimento: String(formData.dataVencimento),
        categoria: String(formData.categoria),
        fornecedorId: formData.fornecedorId ? String(formData.fornecedorId) : null,
        formaPagamento: String(formData.formaPagamento),
        observacoes: formData.observacoes ? String(formData.observacoes) : null,
        status: String(formData.status),
        recorrente: Boolean(formData.recorrente),
        parcelas: Number(formData.parcelas) || 1,
        origem: 'manual',
        updatedAt: new Date().toISOString(),
      };

      // Remover campos undefined
      Object.keys(dadosParaSalvar).forEach(key => {
        if (dadosParaSalvar[key] === undefined) {
          delete dadosParaSalvar[key];
        }
      });

      if (contaEditando) {
        await firebaseService.update('contas_pagar', contaEditando.id, dadosParaSalvar);
        mostrarSnackbar('Conta atualizada com sucesso!');
      } else {
        dadosParaSalvar.dataCriacao = new Date().toISOString();
        await firebaseService.add('contas_pagar', dadosParaSalvar);
        mostrarSnackbar('Conta registrada com sucesso!');
      }

      await carregarDados(); // Recarregar dados
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      mostrarSnackbar('Erro ao salvar conta', 'error');
    }
  };

  // Verificar contas atrasadas
  useEffect(() => {
    const verificarEAtualizarAtrasadas = async () => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      for (const conta of contas) {
        if (conta.status === 'pendente' && conta.dataVencimento) {
          const vencimento = new Date(conta.dataVencimento);
          vencimento.setHours(0, 0, 0, 0);
          
          if (vencimento < hoje) {
            try {
              if (conta.origem === 'comissao' && conta.origemId) {
                await firebaseService.update('comissoes', conta.origemId, {
                  status: 'atrasado',
                  updatedAt: new Date().toISOString(),
                });
              } else if (conta.origem === 'compra' && conta.origemId) {
                await firebaseService.update('compras', conta.origemId, {
                  status: 'atrasado',
                  updatedAt: new Date().toISOString(),
                });
              } else if (conta.origem === 'manual') {
                await firebaseService.update('contas_pagar', conta.id, {
                  status: 'atrasado',
                  updatedAt: new Date().toISOString(),
                });
              }
            } catch (error) {
              console.error('Erro ao atualizar conta atrasada:', error);
            }
          }
        }
      }
      
      // Recarregar após verificação
      if (contas.length > 0) {
        await carregarDados();
      }
    };

    verificarEAtualizarAtrasadas();
    // Verificar a cada hora
    const interval = setInterval(verificarEAtualizarAtrasadas, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [contas.length]);

  // Filtrar contas
  const contasFiltradas = contas.filter(conta => {
    const matchesTexto = filtro === '' || 
      conta.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
      conta.profissionalNome?.toLowerCase().includes(filtro.toLowerCase()) ||
      conta.servicoNome?.toLowerCase().includes(filtro.toLowerCase()) ||
      conta.numeroPedido?.toLowerCase().includes(filtro.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || conta.status === filtroStatus;
    const matchesOrigem = filtroOrigem === 'todas' || conta.origem === filtroOrigem;

    let matchesPeriodo = true;
    if (filtroPeriodo === 'hoje' && conta.dataVencimento) {
      const hoje = formatarDataISO(new Date());
      matchesPeriodo = conta.dataVencimento === hoje;
    } else if (filtroPeriodo === 'semana' && conta.dataVencimento) {
      const dataVenc = new Date(conta.dataVencimento);
      const umaSemana = new Date();
      umaSemana.setDate(umaSemana.getDate() + 7);
      matchesPeriodo = dataVenc <= umaSemana && dataVenc >= new Date();
    } else if (filtroPeriodo === 'vencidas' && conta.dataVencimento) {
      const dataVenc = new Date(conta.dataVencimento);
      matchesPeriodo = dataVenc < new Date() && conta.status === 'pendente';
    }

    return matchesTexto && matchesStatus && matchesOrigem && matchesPeriodo;
  });

  // Paginação
  const paginatedContas = contasFiltradas.slice(
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
    total: contas.filter(c => c.status !== 'pago').length,
    valorTotal: contas
      .filter(c => c.status !== 'pago')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
    pendentes: contas.filter(c => c.status === 'pendente').length,
    atrasadas: contas.filter(c => c.status === 'atrasado').length,
    pagas: contas.filter(c => c.status === 'pago').length,
    comissoesPendentes: contas
      .filter(c => c.origem === 'comissao' && c.status !== 'pago')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
    comprasPendentes: contas
      .filter(c => c.origem === 'compra' && c.status !== 'pago')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Contas a Pagar
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie todas as contas, despesas, comissões e compras do salão
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
        >
          Nova Conta Manual
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ bgcolor: stats.valorTotal > 0 ? '#ffebee' : '#f5f5f5' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total a Pagar
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                  R$ {stats.valorTotal.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {stats.total} contas pendentes
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
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pendentes
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {stats.pendentes}
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
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Atrasadas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {stats.atrasadas}
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
                <Typography color="textSecondary" gutterBottom>
                  Pagas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.pagas}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Cards de Resumo por Origem */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                  <PercentIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Comissões a Pagar
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                    R$ {stats.comissoesPendentes.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                  <ShoppingCartIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Compras a Pagar
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#ff9800' }}>
                    R$ {stats.comprasPendentes.toFixed(2)}
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por descrição, profissional, pedido..."
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
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  {Object.keys(statusColors).map(status => (
                    <MenuItem key={status} value={status}>
                      {statusColors[status].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Origem</InputLabel>
                <Select
                  value={filtroOrigem}
                  onChange={(e) => setFiltroOrigem(e.target.value)}
                  label="Origem"
                >
                  <MenuItem value="todas">Todas</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="comissao">Comissão</MenuItem>
                  <MenuItem value="compra">Compra</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Período</InputLabel>
                <Select
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                  label="Período"
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="hoje">Vencem Hoje</MenuItem>
                  <MenuItem value="semana">Próximos 7 dias</MenuItem>
                  <MenuItem value="vencidas">Vencidas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={carregarDados}
              >
                Atualizar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Descrição</strong></TableCell>
                <TableCell><strong>Origem</strong></TableCell>
                <TableCell><strong>Vencimento</strong></TableCell>
                <TableCell align="right"><strong>Valor</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {paginatedContas.map((conta, index) => {
                  const fornecedor = fornecedores.find(f => f.id === conta.fornecedorId);
                  const profissional = profissionais.find(p => p.id === conta.profissionalId) || 
                                     { nome: conta.profissionalNome };
                  
                  const hoje = new Date();
                  hoje.setHours(0, 0, 0, 0);
                  
                  let vencimento = null;
                  if (conta.dataVencimento) {
                    vencimento = new Date(conta.dataVencimento);
                    vencimento.setHours(0, 0, 0, 0);
                  }
                  
                  const isVencida = vencimento && vencimento < hoje && conta.status === 'pendente';
                  
                  return (
                    <motion.tr
                      key={conta.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        backgroundColor: isVencida ? '#ffebee20' : 'white',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ 
                            bgcolor: origemColors[conta.origem]?.color || '#757575',
                            width: 32,
                            height: 32
                          }}>
                            {origemColors[conta.origem]?.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {conta.descricao}
                            </Typography>
                            {conta.origem === 'comissao' && profissional && (
                              <Typography variant="caption" color="textSecondary">
                                {profissional.nome} • {conta.servicoNome} ({conta.percentual}%)
                              </Typography>
                            )}
                            {conta.origem === 'compra' && fornecedor && (
                              <Typography variant="caption" color="textSecondary">
                                {fornecedor.nome} • Pedido: {conta.numeroPedido}
                              </Typography>
                            )}
                            {conta.origem === 'manual' && fornecedor && (
                              <Typography variant="caption" color="textSecondary">
                                {fornecedor.nome}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={origemColors[conta.origem]?.icon}
                          label={origemColors[conta.origem]?.label}
                          size="small"
                          sx={{
                            bgcolor: `${origemColors[conta.origem]?.color}20`,
                            color: origemColors[conta.origem]?.color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {conta.dataVencimento ? formatarData(conta.dataVencimento) : '—'}
                          </Typography>
                          {isVencida && (
                            <Chip
                              size="small"
                              label="Vencida"
                              color="error"
                              sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Typography fontWeight={600} color="#f44336">
                          R$ {Number(conta.valor).toFixed(2)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={statusColors[conta.status]?.label}
                          size="small"
                          sx={{
                            bgcolor: `${statusColors[conta.status]?.color}20`,
                            color: statusColors[conta.status]?.color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Ver Detalhes">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetalhes(conta)}
                              sx={{ color: '#9c27b0' }}
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {conta.status !== 'pago' && conta.status !== 'cancelado' && (
                            <Tooltip title="Registrar Pagamento">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenPagamento(conta)}
                                sx={{ color: '#4caf50' }}
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {conta.origem === 'manual' && (
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(conta)}
                                sx={{ color: '#2196f3' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {paginatedContas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      Nenhuma conta encontrada
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
          count={contasFiltradas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      {/* Dialog de Nova Conta Manual */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {contaEditando ? 'Editar Conta Manual' : 'Nova Conta a Pagar'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                size="small"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Valor"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Data Vencimento"
                name="dataVencimento"
                value={formData.dataVencimento}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria</InputLabel>
                <Select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  label="Categoria"
                >
                  <MenuItem value="Fornecedor">Fornecedor</MenuItem>
                  <MenuItem value="Aluguel">Aluguel</MenuItem>
                  <MenuItem value="Água">Água</MenuItem>
                  <MenuItem value="Luz">Luz</MenuItem>
                  <MenuItem value="Telefone">Telefone</MenuItem>
                  <MenuItem value="Salários">Salários</MenuItem>
                  <MenuItem value="Impostos">Impostos</MenuItem>
                  <MenuItem value="Outros">Outros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Fornecedor</InputLabel>
                <Select
                  name="fornecedorId"
                  value={formData.fornecedorId}
                  onChange={handleInputChange}
                  label="Fornecedor"
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {fornecedores.map(f => (
                    <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  name="formaPagamento"
                  value={formData.formaPagamento}
                  onChange={handleInputChange}
                  label="Forma de Pagamento"
                >
                  {formasPagamento.map(fp => (
                    <MenuItem key={fp.value} value={fp.value}>
                      {fp.icon} {fp.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                multiline
                rows={3}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSalvar} 
            variant="contained"
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Pagamento */}
      <Dialog open={openPagamentoDialog} onClose={handleClosePagamento} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          Confirmar Pagamento
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Deseja registrar o pagamento de:
            </Alert>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar sx={{ 
                  bgcolor: origemColors[contaSelecionada?.origem]?.color || '#757575',
                  width: 32,
                  height: 32
                }}>
                  {origemColors[contaSelecionada?.origem]?.icon}
                </Avatar>
                <Typography variant="subtitle2">{contaSelecionada?.descricao}</Typography>
              </Box>
              
              <Typography variant="h5" color="primary" sx={{ mt: 2, fontWeight: 600 }}>
                R$ {Number(contaSelecionada?.valor).toFixed(2)}
              </Typography>
              
              {contaSelecionada?.origem === 'comissao' && (
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Profissional: {contaSelecionada?.profissionalNome}
                </Typography>
              )}
              
              {contaSelecionada?.origem === 'compra' && (
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Pedido: {contaSelecionada?.numeroPedido}
                </Typography>
              )}
              
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Vencimento: {contaSelecionada?.dataVencimento && formatarData(contaSelecionada.dataVencimento)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePagamento}>Cancelar</Button>
          <Button
            onClick={handleRegistrarPagamento}
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes da Conta
        </DialogTitle>
        <DialogContent>
          {contaSelecionada && (
            <Box sx={{ mt: 2 }}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: origemColors[contaSelecionada.origem]?.color || '#757575' }}>
                      {origemColors[contaSelecionada.origem]?.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Descrição"
                    secondary={contaSelecionada.descricao}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#f44336' }}>
                      <ReceiptIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Valor"
                    secondary={`R$ ${Number(contaSelecionada.valor).toFixed(2)}`}
                  />
                </ListItem>

                {contaSelecionada.dataVencimento && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#ff9800' }}>
                        <WarningIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Vencimento"
                      secondary={formatarData(contaSelecionada.dataVencimento)}
                    />
                  </ListItem>
                )}

                {contaSelecionada.origem === 'comissao' && (
                  <>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#9c27b0' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Profissional"
                        secondary={contaSelecionada.profissionalNome}
                      />
                    </ListItem>
                    
                    {contaSelecionada.servicoNome && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#ff4081' }}>
                            <ReceiptLongIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Serviço"
                          secondary={`${contaSelecionada.servicoNome} (${contaSelecionada.percentual}% de R$ ${contaSelecionada.valorAtendimento})`}
                        />
                      </ListItem>
                    )}
                  </>
                )}

                {contaSelecionada.origem === 'compra' && (
                  <>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#ff9800' }}>
                          <StoreIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Fornecedor"
                        secondary={fornecedores.find(f => f.id === contaSelecionada.fornecedorId)?.nome || 'Não informado'}
                      />
                    </ListItem>
                    
                    {contaSelecionada.numeroPedido && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#00bcd4' }}>
                            <ReceiptIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Número do Pedido"
                          secondary={contaSelecionada.numeroPedido}
                        />
                      </ListItem>
                    )}
                    
                    {contaSelecionada.itens && contaSelecionada.itens.length > 0 && (
                      <ListItem>
                        <ListItemText
                          primary="Itens da Compra"
                          secondary={
                            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                              {contaSelecionada.itens.map((item, idx) => (
                                <li key={idx}>
                                  {item.produtoNome} - {item.quantidade}x R$ {item.valorUnitario} = R$ {item.total}
                                </li>
                              ))}
                            </Box>
                          }
                        />
                      </ListItem>
                    )}
                  </>
                )}

                {contaSelecionada.origem === 'manual' && contaSelecionada.fornecedorId && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#2196f3' }}>
                        <StoreIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Fornecedor"
                      secondary={fornecedores.find(f => f.id === contaSelecionada.fornecedorId)?.nome}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#9e9e9e' }}>
                      <InfoIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Categoria"
                    secondary={contaSelecionada.categoria || 'Não categorizado'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: statusColors[contaSelecionada.status]?.color || '#9e9e9e'
                    }}>
                      {statusColors[contaSelecionada.status]?.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Status"
                    secondary={statusColors[contaSelecionada.status]?.label}
                  />
                </ListItem>

                {contaSelecionada.dataPagamento && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#4caf50' }}>
                        <CheckCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Data do Pagamento"
                      secondary={formatarData(contaSelecionada.dataPagamento)}
                    />
                  </ListItem>
                )}

                {contaSelecionada.observacoes && (
                  <ListItem>
                    <ListItemText
                      primary="Observações"
                      secondary={contaSelecionada.observacoes}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
          {contaSelecionada?.status !== 'pago' && contaSelecionada?.status !== 'cancelado' && (
            <Button
              onClick={() => {
                handleCloseDetalhes();
                handleOpenPagamento(contaSelecionada);
              }}
              variant="contained"
              color="success"
              startIcon={<PaymentIcon />}
            >
              Pagar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ContasPagar;
