// src/pages/ContasReceber.js
import React, { useState, useEffect, useRef } from 'react';
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
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Fab,
  Zoom,
  useMediaQuery,
  useTheme,
  Badge,
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
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { auditoriaService } from '../services/auditoriaService';
import { useReactToPrint } from 'react-to-print';

// Componente de Impressão
const RelatorioContasReceber = React.forwardRef(({ contas, filtros, estatisticas, config, clientes }, ref) => {
  const logo = config?.salao?.logo || '';
  const empresa = config?.salao || {
    nome: 'Sistema de Gestão',
    cnpj: '',
    endereco: {}
  };

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || 'Não informado';
  };

  return (
    <Box ref={ref} sx={{ p: 4, fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #9c27b0', pb: 2 }}>
        {logo && (
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              maxHeight: 80, 
              maxWidth: 200, 
              marginBottom: 10,
              objectFit: 'contain'
            }} 
          />
        )}
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
          {empresa.nome || 'Sistema de Gestão'}
        </Typography>
        {empresa.nomeFantasia && (
          <Typography variant="h5" sx={{ color: '#666', mb: 1 }}>
            {empresa.nomeFantasia}
          </Typography>
        )}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
          Relatório de Contas a Receber
        </Typography>
        
        {/* Informações da empresa */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2, fontSize: '0.9rem' }}>
          {empresa.cnpj && (
            <Typography variant="body2" color="textSecondary">
              CNPJ: {empresa.cnpj}
            </Typography>
          )}
          {empresa.endereco?.cidade && empresa.endereco?.estado && (
            <Typography variant="body2" color="textSecondary">
              {empresa.endereco.cidade}/{empresa.endereco.estado}
            </Typography>
          )}
        </Box>

        <Typography variant="subtitle1" color="textSecondary">
          Período: {filtros.periodo}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Emitido em: {new Date().toLocaleString('pt-BR')}
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Resumo Financeiro
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2">Total a Receber</Typography>
              <Typography variant="h6" sx={{ color: '#4caf50' }}>
                R$ {estatisticas.valorTotal.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#fff3e0', textAlign: 'center' }}>
              <Typography variant="body2">Pendentes</Typography>
              <Typography variant="h6" sx={{ color: '#ff9800' }}>
                {estatisticas.pendentes}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#ffebee', textAlign: 'center' }}>
              <Typography variant="body2">Atrasadas</Typography>
              <Typography variant="h6" sx={{ color: '#f44336' }}>
                {estatisticas.atrasadas}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#e8f5e9', textAlign: 'center' }}>
              <Typography variant="body2">Recebidas</Typography>
              <Typography variant="h6" sx={{ color: '#4caf50' }}>
                {estatisticas.recebidas}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Tabela de Contas */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Lista de Contas
      </Typography>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#9c27b0', color: 'white' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>Descrição</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Cliente</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Vencimento</th>
            <th style={{ padding: 10, textAlign: 'right' }}>Valor</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Forma</th>
          </tr>
        </thead>
        <tbody>
          {contas.slice(0, 100).map((conta, index) => {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const vencimento = conta.dataVencimento ? new Date(conta.dataVencimento) : null;
            if (vencimento) vencimento.setHours(0, 0, 0, 0);
            const isVencida = vencimento && vencimento < hoje && conta.status === 'pendente';

            return (
              <tr key={index} style={{ 
                borderBottom: '1px solid #ddd',
                backgroundColor: isVencida ? '#ffebee20' : 'white'
              }}>
                <td style={{ padding: 8 }}>{conta.descricao}</td>
                <td style={{ padding: 8 }}>{getClienteNome(conta.clienteId)}</td>
                <td style={{ padding: 8 }}>
                  {conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : '-'}
                  {isVencida && <span style={{ color: '#f44336', marginLeft: 8 }}>(Vencida)</span>}
                </td>
                <td style={{ padding: 8, textAlign: 'right', fontWeight: 600, color: '#4caf50' }}>
                  R$ {Number(conta.valor).toFixed(2)}
                </td>
                <td style={{ padding: 8 }}>
                  <span style={{
                    backgroundColor: 
                      conta.status === 'recebido' ? '#4caf5020' :
                      conta.status === 'pendente' ? '#ff980020' :
                      conta.status === 'atrasado' ? '#f4433620' : '#f5f5f5',
                    color:
                      conta.status === 'recebido' ? '#4caf50' :
                      conta.status === 'pendente' ? '#ff9800' :
                      conta.status === 'atrasado' ? '#f44336' : '#666',
                    padding: '4px 8px',
                    borderRadius: 16,
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {conta.status === 'recebido' ? 'Recebido' :
                     conta.status === 'pendente' ? 'Pendente' :
                     conta.status === 'atrasado' ? 'Atrasado' : conta.status}
                  </span>
                </td>
                <td style={{ padding: 8 }}>
                  {conta.formaPagamento === 'dinheiro' ? '💵 Dinheiro' :
                   conta.formaPagamento === 'cartao_credito' ? '💳 Cartão Crédito' :
                   conta.formaPagamento === 'cartao_debito' ? '💳 Cartão Débito' :
                   conta.formaPagamento === 'pix' ? '⚡ PIX' :
                   conta.formaPagamento === 'transferencia' ? '🔄 Transferência' :
                   conta.formaPagamento || '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Rodapé */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary', borderTop: '1px solid #ccc', pt: 2 }}>
        <Typography variant="caption">
          Relatório gerado automaticamente pelo sistema • Documento não fiscal
        </Typography>
      </Box>
    </Box>
  );
});

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente', icon: <WarningIcon /> },
  recebido: { color: '#4caf50', label: 'Recebido', icon: <CheckCircleIcon /> },
  atrasado: { color: '#f44336', label: 'Atrasado', icon: <WarningIcon /> },
  cancelado: { color: '#9e9e9e', label: 'Cancelado', icon: <CancelIcon /> },
};

const formasPagamento = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '⚡' },
  { value: 'transferencia', label: 'Transferência', icon: '🔄' },
];

const formatarDataISO = (data) => {
  if (!data) return '';
  const d = new Date(data);
  return d.toISOString().split('T')[0];
};

function ContasReceber() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const printRef = useRef();

  const [loading, setLoading] = useState(true);
  const [contas, setContas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [caixa, setCaixa] = useState(null);
  const [config, setConfig] = useState(null);
  
  // Filtros
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [openRecebimentoDialog, setOpenRecebimentoDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [contaEditando, setContaEditando] = useState(null);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mobile states
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // Formulário
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: formatarDataISO(new Date()),
    categoria: 'Serviços',
    clienteId: '',
    formaPagamento: 'dinheiro',
    observacoes: '',
    status: 'pendente',
    parcelas: 1,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [contasData, clientesData, caixaData, configData] = await Promise.all([
        firebaseService.getAll('contas_receber').catch(() => []),
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('caixa').catch(() => []),
        firebaseService.getAll('configuracoes').catch(() => []),
      ]);
      
      const contasArray = Array.isArray(contasData) ? contasData : [];
      const clientesArray = Array.isArray(clientesData) ? clientesData : [];
      
      setContas(contasArray);
      setClientes(clientesArray);
      setConfig(configData?.[0] || null);
      
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
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_contas_receber',
        detalhes: 'Erro ao carregar dados de contas a receber'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `contas_receber_${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      toast.loading('Preparando impressão...', { id: 'print' });
    },
    onAfterPrint: () => {
      toast.success('Impressão enviada!', { id: 'print' });
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      toast.error('Erro ao imprimir', { id: 'print' });
    }
  });

  const handleExportCSV = () => {
    try {
      const headers = ['Descrição', 'Cliente', 'Vencimento', 'Valor', 'Status', 'Forma de Pagamento'];
      const data = contasFiltradas.map(conta => {
        const cliente = clientes.find(c => c.id === conta.clienteId);
        
        return [
          conta.descricao,
          cliente?.nome || '',
          conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : '',
          `R$ ${Number(conta.valor).toFixed(2)}`,
          statusColors[conta.status]?.label || conta.status,
          formasPagamento.find(f => f.value === conta.formaPagamento)?.label || conta.formaPagamento
        ];
      });

      const csvContent = [headers, ...data]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `contas_receber_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      mostrarSnackbar('Planilha exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar', 'error');
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ========== FUNÇÕES DE DIÁLOGO ==========
  const handleOpenDialog = (conta = null) => {
    if (conta) {
      setContaEditando(conta);
      setFormData({
        descricao: conta.descricao || '',
        valor: conta.valor || '',
        dataVencimento: conta.dataVencimento || formatarDataISO(new Date()),
        categoria: conta.categoria || 'Serviços',
        clienteId: conta.clienteId || '',
        formaPagamento: conta.formaPagamento || 'dinheiro',
        observacoes: conta.observacoes || '',
        status: conta.status || 'pendente',
        parcelas: conta.parcelas || 1,
      });
    } else {
      setContaEditando(null);
      setFormData({
        descricao: '',
        valor: '',
        dataVencimento: formatarDataISO(new Date()),
        categoria: 'Serviços',
        clienteId: '',
        formaPagamento: 'dinheiro',
        observacoes: '',
        status: 'pendente',
        parcelas: 1,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setContaEditando(null);
  };

  const handleOpenRecebimento = (conta) => {
    setContaSelecionada(conta);
    setOpenRecebimentoDialog(true);
  };

  const handleCloseRecebimento = () => {
    setOpenRecebimentoDialog(false);
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

  // ========== FUNÇÕES DE CRUD ==========
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

      const dadosParaSalvar = {
        descricao: String(formData.descricao).trim(),
        valor: Number(valorNumerico),
        dataVencimento: String(formData.dataVencimento),
        categoria: String(formData.categoria),
        clienteId: formData.clienteId ? String(formData.clienteId) : null,
        formaPagamento: String(formData.formaPagamento),
        observacoes: formData.observacoes ? String(formData.observacoes) : null,
        status: String(formData.status),
        parcelas: Number(formData.parcelas) || 1,
        updatedAt: new Date().toISOString(),
      };

      Object.keys(dadosParaSalvar).forEach(key => {
        if (dadosParaSalvar[key] === undefined) {
          delete dadosParaSalvar[key];
        }
      });

      if (contaEditando) {
        const contaAntiga = { ...contaEditando };
        
        await firebaseService.update('contas_receber', contaEditando.id, dadosParaSalvar);
        
        await auditoriaService.registrarAtualizacao(
          'contas_receber',
          contaEditando.id,
          contaAntiga,
          dadosParaSalvar,
          `Atualização de conta a receber: ${formData.descricao}`
        );
        
        const contasAtualizadas = contas.map(c => 
          c.id === contaEditando.id ? { ...c, ...dadosParaSalvar, id: contaEditando.id } : c
        );
        setContas(contasAtualizadas);
        
        mostrarSnackbar('Conta atualizada com sucesso!');
      } else {
        dadosParaSalvar.dataCriacao = new Date().toISOString();
        const novoId = await firebaseService.add('contas_receber', dadosParaSalvar);
        
        await auditoriaService.registrarCriacao(
          'contas_receber',
          novoId,
          dadosParaSalvar,
          `Criação de conta a receber: ${formData.descricao}`
        );
        
        setContas([...contas, { ...dadosParaSalvar, id: novoId }]);
        
        mostrarSnackbar('Conta registrada com sucesso!');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      mostrarSnackbar('Erro ao salvar conta', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: contaEditando ? 'atualizar_conta_receber' : 'criar_conta_receber',
        dados: formData
      });
    }
  };

  const handleRegistrarRecebimento = async () => {
    try {
      if (!contaSelecionada || !contaSelecionada.id) {
        mostrarSnackbar('Conta inválida', 'error');
        return;
      }

      await auditoriaService.registrar('recebimento', {
        entidade: 'contas_receber',
        entidadeId: contaSelecionada.id,
        detalhes: `Recebimento de conta: ${contaSelecionada.descricao}`,
        dados: {
          valor: contaSelecionada.valor,
          formaPagamento: contaSelecionada.formaPagamento
        }
      });

      const dadosConta = {
        status: 'recebido',
        dataRecebimento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await firebaseService.update('contas_receber', contaSelecionada.id, dadosConta);

      const contasAtualizadas = contas.map(c => 
        c.id === contaSelecionada.id ? { ...c, ...dadosConta } : c
      );
      setContas(contasAtualizadas);

      if (caixa && caixa.status === 'aberto' && caixa.id) {
        const novoSaldo = (caixa.saldoAtual || 0) + Number(contaSelecionada.valor);
        
        const novaMovimentacao = {
          id: Date.now().toString(),
          tipo: 'receita',
          valor: Number(contaSelecionada.valor),
          descricao: `Recebimento: ${contaSelecionada.descricao}`,
          data: new Date().toISOString(),
          contaId: contaSelecionada.id,
        };
        
        const movimentacoesAtuais = Array.isArray(caixa.movimentacoes) ? caixa.movimentacoes : [];
        const novasMovimentacoes = [...movimentacoesAtuais, novaMovimentacao];
        
        const dadosCaixa = {
          saldoAtual: Number(novoSaldo),
          movimentacoes: novasMovimentacoes,
          updatedAt: new Date().toISOString(),
        };
        
        await firebaseService.update('caixa', caixa.id, dadosCaixa);
        
        setCaixa({ 
          ...caixa, 
          saldoAtual: novoSaldo, 
          movimentacoes: novasMovimentacoes 
        });
      }

      mostrarSnackbar('Recebimento registrado com sucesso!');
      handleCloseRecebimento();
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      mostrarSnackbar('Erro ao registrar recebimento', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'registrar_recebimento',
        contaId: contaSelecionada?.id
      });
    }
  };

  // Verificar contas atrasadas
  useEffect(() => {
    const verificarEAtualizarAtrasadas = async () => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      for (const conta of contas) {
        if (conta.status === 'pendente') {
          const vencimento = new Date(conta.dataVencimento);
          vencimento.setHours(0, 0, 0, 0);
          
          if (vencimento < hoje) {
            try {
              await firebaseService.update('contas_receber', conta.id, {
                status: 'atrasado',
                updatedAt: new Date().toISOString(),
              });
              
              setContas(prev => prev.map(c => 
                c.id === conta.id ? { ...c, status: 'atrasado' } : c
              ));
            } catch (error) {
              console.error('Erro ao atualizar conta atrasada:', error);
            }
          }
        }
      }
    };

    if (contas.length > 0) {
      verificarEAtualizarAtrasadas();
    }
  }, [contas]);

  // Filtrar contas
  const contasFiltradas = contas.filter(conta => {
    const matchesTexto = filtro === '' || 
      conta.descricao?.toLowerCase().includes(filtro.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || conta.status === filtroStatus;

    let matchesPeriodo = true;
    if (filtroPeriodo === 'hoje' && conta.dataVencimento) {
      const hoje = new Date().toISOString().split('T')[0];
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

    return matchesTexto && matchesStatus && matchesPeriodo;
  });

  // Ordenar por data de vencimento
  const contasOrdenadas = [...contasFiltradas].sort((a, b) => {
    const dataA = new Date(a.dataVencimento || a.dataCriacao);
    const dataB = new Date(b.dataVencimento || b.dataCriacao);
    return dataA - dataB;
  });

  // Paginação
  const paginatedContas = contasOrdenadas.slice(
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
    total: contas.length,
    pendentes: contas.filter(c => c.status === 'pendente').length,
    atrasadas: contas.filter(c => c.status === 'atrasado').length,
    recebidas: contas.filter(c => c.status === 'recebido').length,
    valorTotal: contas
      .filter(c => c.status !== 'recebido')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
  };

  // Renderização mobile
  const renderMobileList = () => {
    if (paginatedContas.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1" color="textSecondary">
            Nenhuma conta encontrada
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ p: 0 }}>
        <AnimatePresence>
          {paginatedContas.map((conta, index) => {
            const cliente = clientes.find(c => c.id === conta.clienteId);
            
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const vencimento = conta.dataVencimento ? new Date(conta.dataVencimento) : null;
            if (vencimento) vencimento.setHours(0, 0, 0, 0);
            const isVencida = vencimento && vencimento < hoje && conta.status === 'pendente';

            return (
              <motion.div
                key={conta.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 2,
                    borderLeft: '4px solid',
                    borderLeftColor: 
                      conta.status === 'recebido' ? '#4caf50' :
                      conta.status === 'atrasado' ? '#f44336' :
                      conta.status === 'pendente' ? '#ff9800' : '#9c27b0',
                    bgcolor: isVencida ? '#ffebee20' : 'white',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32 }}>
                          <MoneyIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {conta.descricao}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {cliente?.nome || 'Cliente não informado'}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={statusColors[conta.status]?.label}
                        size="small"
                        sx={{
                          bgcolor: `${statusColors[conta.status]?.color}20`,
                          color: statusColors[conta.status]?.color,
                          fontWeight: 500,
                          height: 24,
                        }}
                      />
                    </Box>

                    {/* Detalhes */}
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            Vencimento
                          </Typography>
                          <Typography variant="body2">
                            {conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : '—'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            Valor
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                            R$ {Number(conta.valor).toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">
                            Forma de Pagamento
                          </Typography>
                          <Typography variant="body2">
                            {formasPagamento.find(f => f.value === conta.formaPagamento)?.label || conta.formaPagamento}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Ações */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                      <Tooltip title="Detalhes">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetalhes(conta)}
                          sx={{ color: '#9c27b0' }}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>

                      {conta.status !== 'recebido' && (
                        <Tooltip title="Registrar Recebimento">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenRecebimento(conta)}
                            sx={{ color: '#4caf50' }}
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(conta)}
                          sx={{ color: '#2196f3' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {isVencida && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          label="Vencida"
                          color="error"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </List>
    );
  };

  const renderFilterDrawer = () => (
    <SwipeableDrawer
      anchor="bottom"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '80vh',
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtrar Contas
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por descrição..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
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

          <Grid item xs={12}>
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

          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setFilterDrawerOpen(false);
                setFiltroStatus('todos');
                setFiltroPeriodo('todos');
                setFiltro('');
              }}
            >
              Limpar
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={{ bgcolor: '#9c27b0' }}
            >
              Aplicar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </SwipeableDrawer>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <RelatorioContasReceber
          ref={printRef}
          contas={contasOrdenadas}
          filtros={{
            periodo: filtroPeriodo === 'hoje' ? 'Hoje' :
                     filtroPeriodo === 'semana' ? 'Próximos 7 dias' :
                     filtroPeriodo === 'vencidas' ? 'Vencidas' : 'Todos'
          }}
          estatisticas={stats}
          config={config}
          clientes={clientes}
        />
      </Box>

      {/* Header Mobile */}
      {isMobile && (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0', flex: 1 }}>
              Contas a Receber
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(true)}>
              <Badge badgeContent={filtroStatus !== 'todos' || filtroPeriodo !== 'todos' || filtro ? 1 : 0} color="secondary">
                <FilterIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={carregarDados}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Cards de estatísticas mobile */}
          <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
            <Paper sx={{ p: 1.5, minWidth: 100, textAlign: 'center' }}>
              <Typography variant="caption">Total</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                R$ {stats.valorTotal.toFixed(2)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="caption">Pendentes</Typography>
              <Typography variant="subtitle2">{stats.pendentes}</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#ffebee' }}>
              <Typography variant="caption">Atrasadas</Typography>
              <Typography variant="subtitle2">{stats.atrasadas}</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#e8f5e9' }}>
              <Typography variant="caption">Recebidas</Typography>
              <Typography variant="subtitle2">{stats.recebidas}</Typography>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Header Desktop */}
      {!isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Contas a Receber
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie todas as contas e recebimentos do salão
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Imprimir
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
            >
              Nova Conta
            </Button>
          </Box>
        </Box>
      )}

      {/* Cards de Estatísticas Desktop */}
      {!isMobile && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Total a Receber</Typography>
                <Typography variant="h4" sx={{ color: '#4caf50' }}>
                  R$ {stats.valorTotal.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography color="textSecondary">Pendentes</Typography>
                <Typography variant="h4" sx={{ color: '#ff9800' }}>
                  {stats.pendentes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography color="textSecondary">Atrasadas</Typography>
                <Typography variant="h4" sx={{ color: '#f44336' }}>
                  {stats.atrasadas}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography color="textSecondary">Recebidas</Typography>
                <Typography variant="h4" sx={{ color: '#4caf50' }}>
                  {stats.recebidas}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros Desktop */}
      {!isMobile && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por descrição..."
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
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
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
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo principal */}
      <Card>
        <CardContent sx={{ p: isMobile ? 1 : 3 }}>
          {isMobile ? (
            renderMobileList()
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Vencimento</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedContas.map((conta, index) => {
                    const cliente = clientes.find(c => c.id === conta.clienteId);
                    
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    const vencimento = conta.dataVencimento ? new Date(conta.dataVencimento) : null;
                    if (vencimento) vencimento.setHours(0, 0, 0, 0);
                    const isVencida = vencimento && vencimento < hoje && conta.status === 'pendente';

                    return (
                      <TableRow key={conta.id} hover>
                        <TableCell>{conta.descricao}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#9c27b0' }}>
                              <PersonIcon sx={{ fontSize: 14 }} />
                            </Avatar>
                            {cliente?.nome || '—'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : '—'}
                            {isVencida && (
                              <Chip
                                size="small"
                                label="Vencida"
                                color="error"
                                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="#4caf50">
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
                            {conta.status !== 'recebido' && (
                              <Tooltip title="Registrar Recebimento">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenRecebimento(conta)}
                                  sx={{ color: '#4caf50' }}
                                >
                                  <PaymentIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Ver Detalhes">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDetalhes(conta)}
                                sx={{ color: '#9c27b0' }}
                              >
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(conta)}
                                sx={{ color: '#2196f3' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Paginação Desktop */}
      {!isMobile && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={contasOrdenadas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}

      {/* Bottom Navigation Mobile */}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }} elevation={3}>
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => setBottomNavValue(newValue)}
            showLabels
          >
            <BottomNavigationAction label="Lista" icon={<ReceiptIcon />} />
            <BottomNavigationAction 
              label="Imprimir" 
              icon={<PrintIcon />} 
              onClick={handlePrint}
            />
            <BottomNavigationAction 
              label="Exportar" 
              icon={<DownloadIcon />}
              onClick={handleExportCSV}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* FAB para filtros mobile */}
      {isMobile && (
        <Zoom in={!filterDrawerOpen}>
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 80, right: 16 }}
            onClick={() => setFilterDrawerOpen(true)}
          >
            <FilterIcon />
          </Fab>
        </Zoom>
      )}

      {/* Drawer de filtros mobile */}
      {renderFilterDrawer()}

      {/* Dialog de Nova Conta */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {contaEditando ? 'Editar Conta' : 'Nova Conta a Receber'}
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
                  <MenuItem value="Serviços">Serviços</MenuItem>
                  <MenuItem value="Produtos">Produtos</MenuItem>
                  <MenuItem value="Pacotes">Pacotes</MenuItem>
                  <MenuItem value="Comissões">Comissões</MenuItem>
                  <MenuItem value="Outros">Outros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Cliente</InputLabel>
                <Select
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleInputChange}
                  label="Cliente"
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {clientes.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
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

      {/* Dialog de Recebimento */}
      <Dialog open={openRecebimentoDialog} onClose={handleCloseRecebimento} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          Confirmar Recebimento
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Deseja registrar o recebimento de:
            </Alert>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">{contaSelecionada?.descricao}</Typography>
              <Typography variant="h5" color="primary" sx={{ mt: 1, fontWeight: 600 }}>
                R$ {Number(contaSelecionada?.valor).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Vencimento: {contaSelecionada && new Date(contaSelecionada.dataVencimento).toLocaleDateString('pt-BR')}
              </Typography>
              {contaSelecionada && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Cliente: {clientes.find(c => c.id === contaSelecionada.clienteId)?.nome || '—'}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRecebimento}>Cancelar</Button>
          <Button
            onClick={handleRegistrarRecebimento}
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Confirmar Recebimento
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Descrição</Typography>
                  <Typography variant="body2">{contaSelecionada.descricao}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Categoria</Typography>
                  <Typography variant="body2">{contaSelecionada.categoria}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Valor</Typography>
                  <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                    R$ {Number(contaSelecionada.valor).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Vencimento</Typography>
                  <Typography variant="body2">
                    {contaSelecionada.dataVencimento ? new Date(contaSelecionada.dataVencimento).toLocaleDateString('pt-BR') : '—'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Cliente</Typography>
                  <Typography variant="body2">
                    {clientes.find(c => c.id === contaSelecionada.clienteId)?.nome || 'Não informado'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Forma de Pagamento</Typography>
                  <Typography variant="body2">
                    {formasPagamento.find(f => f.value === contaSelecionada.formaPagamento)?.label || contaSelecionada.formaPagamento}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Status</Typography>
                  <Chip
                    label={statusColors[contaSelecionada.status]?.label}
                    size="small"
                    sx={{
                      bgcolor: `${statusColors[contaSelecionada.status]?.color}20`,
                      color: statusColors[contaSelecionada.status]?.color,
                      mt: 0.5,
                    }}
                  />
                </Grid>
                {contaSelecionada.dataRecebimento && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Recebido em</Typography>
                    <Typography variant="body2">
                      {new Date(contaSelecionada.dataRecebimento).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Grid>
                )}
                {contaSelecionada.observacoes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Observações</Typography>
                    <Typography variant="body2">{contaSelecionada.observacoes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
          {contaSelecionada?.status !== 'recebido' && (
            <Button
              onClick={() => {
                handleCloseDetalhes();
                handleOpenRecebimento(contaSelecionada);
              }}
              variant="contained"
              color="success"
              startIcon={<PaymentIcon />}
            >
              Receber
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default ContasReceber;
