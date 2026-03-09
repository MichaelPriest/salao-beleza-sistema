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
  Divider,
  LinearProgress,
  TablePagination,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente' },
  pago: { color: '#4caf50', label: 'Pago' },
  atrasado: { color: '#f44336', label: 'Atrasado' },
  cancelado: { color: '#9e9e9e', label: 'Cancelado' },
};

function ContasPagar() {
  const [loading, setLoading] = useState(true);
  const [contas, setContas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPagamentoDialog, setOpenPagamentoDialog] = useState(false);
  const [contaEditando, setContaEditando] = useState(null);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    dataVencimento: new Date().toISOString().split('T')[0],
    categoria: 'Fornecedor',
    fornecedorId: '',
    formaPagamento: 'boleto',
    observacoes: '',
    status: 'pendente',
    recorrente: false,
    parcelas: 1,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [contasRes, fornecedoresRes] = await Promise.all([
        api.get('/contas_pagar').catch(() => ({ data: [] })),
        api.get('/fornecedores').catch(() => ({ data: [] })),
      ]);
      setContas(contasRes.data || []);
      setFornecedores(fornecedoresRes.data || []);
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
    if (conta) {
      setContaEditando(conta);
      setFormData({
        descricao: conta.descricao || '',
        valor: conta.valor || '',
        dataVencimento: conta.dataVencimento || new Date().toISOString().split('T')[0],
        categoria: conta.categoria || 'Fornecedor',
        fornecedorId: conta.fornecedorId || '',
        formaPagamento: conta.formaPagamento || 'boleto',
        observacoes: conta.observacoes || '',
        status: conta.status || 'pendente',
        recorrente: conta.recorrente || false,
        parcelas: conta.parcelas || 1,
      });
    } else {
      setContaEditando(null);
      setFormData({
        descricao: '',
        valor: '',
        dataVencimento: new Date().toISOString().split('T')[0],
        categoria: 'Fornecedor',
        fornecedorId: '',
        formaPagamento: 'boleto',
        observacoes: '',
        status: 'pendente',
        recorrente: false,
        parcelas: 1,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    try {
      if (!formData.descricao) {
        mostrarSnackbar('Descrição é obrigatória', 'error');
        return;
      }

      if (!formData.valor || formData.valor <= 0) {
        mostrarSnackbar('Valor deve ser maior que zero', 'error');
        return;
      }

      const dadosParaSalvar = {
        ...formData,
        valor: parseFloat(formData.valor),
        updatedAt: new Date().toISOString(),
      };

      if (contaEditando) {
        await api.patch(`/contas_pagar/${contaEditando.id}`, dadosParaSalvar);
        mostrarSnackbar('Conta atualizada com sucesso!');
      } else {
        dadosParaSalvar.id = Date.now();
        dadosParaSalvar.dataCriacao = new Date().toISOString();
        await api.post('/contas_pagar', dadosParaSalvar);
        mostrarSnackbar('Conta registrada com sucesso!');
      }

      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      mostrarSnackbar('Erro ao salvar conta', 'error');
    }
  };

  const handleRegistrarPagamento = async () => {
    try {
      await api.patch(`/contas_pagar/${contaSelecionada.id}`, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Atualizar caixa
      const caixaRes = await api.get('/caixa');
      const caixa = caixaRes.data;
      if (caixa && caixa.status === 'aberto') {
        await api.patch(`/caixa/${caixa.id}`, {
          saldoAtual: caixa.saldoAtual - contaSelecionada.valor,
          movimentacoes: [
            ...(caixa.movimentacoes || []),
            {
              id: Date.now(),
              tipo: 'saida',
              valor: contaSelecionada.valor,
              descricao: `Pagamento: ${contaSelecionada.descricao}`,
              data: new Date().toISOString(),
            },
          ],
        });
      }

      mostrarSnackbar('Pagamento registrado com sucesso!');
      handleClosePagamento();
      carregarDados();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      mostrarSnackbar('Erro ao registrar pagamento', 'error');
    }
  };

  // Verificar contas atrasadas
  useEffect(() => {
    const verificarAtrasados = () => {
      const hoje = new Date();
      contas.forEach(async (conta) => {
        if (conta.status === 'pendente') {
          const vencimento = new Date(conta.dataVencimento);
          if (vencimento < hoje) {
            await api.patch(`/contas_pagar/${conta.id}`, {
              status: 'atrasado',
            });
          }
        }
      });
    };

    if (contas.length > 0) {
      verificarAtrasados();
    }
  }, [contas]);

  // Filtrar contas
  const contasFiltradas = contas.filter(conta => {
    const matchesTexto = filtro === '' || 
      conta.descricao?.toLowerCase().includes(filtro.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || conta.status === filtroStatus;

    let matchesPeriodo = true;
    if (filtroPeriodo === 'hoje') {
      const hoje = new Date().toISOString().split('T')[0];
      matchesPeriodo = conta.dataVencimento === hoje;
    } else if (filtroPeriodo === 'semana') {
      const dataVenc = new Date(conta.dataVencimento);
      const umaSemana = new Date();
      umaSemana.setDate(umaSemana.getDate() + 7);
      matchesPeriodo = dataVenc <= umaSemana && dataVenc >= new Date();
    } else if (filtroPeriodo === 'vencidas') {
      const dataVenc = new Date(conta.dataVencimento);
      matchesPeriodo = dataVenc < new Date() && conta.status === 'pendente';
    }

    return matchesTexto && matchesStatus && matchesPeriodo;
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
    total: contas.length,
    pendentes: contas.filter(c => c.status === 'pendente').length,
    atrasadas: contas.filter(c => c.status === 'atrasado').length,
    pagas: contas.filter(c => c.status === 'pago').length,
    valorTotal: contas.filter(c => c.status !== 'pago').reduce((acc, c) => acc + (c.valor || 0), 0),
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
            Gerencie todas as contas e despesas do salão
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#9c27b0' }}
        >
          Nova Conta
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total a Pagar
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                R$ {stats.valorTotal.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
                placeholder="Buscar contas..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
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
                  <MenuItem value="pendente">Pendentes</MenuItem>
                  <MenuItem value="pago">Pagas</MenuItem>
                  <MenuItem value="atrasado">Atrasadas</MenuItem>
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
                <TableCell>Descrição</TableCell>
                <TableCell>Fornecedor</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedContas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell>{conta.descricao}</TableCell>
                  <TableCell>
                    {fornecedores.find(f => f.id === conta.fornecedorId)?.nome || '—'}
                  </TableCell>
                  <TableCell>
                    {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                    {new Date(conta.dataVencimento) < new Date() && conta.status === 'pendente' && (
                      <Chip
                        size="small"
                        label="Vencida"
                        color="error"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      R$ {conta.valor?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusColors[conta.status]?.label}
                      size="small"
                      sx={{
                        bgcolor: `${statusColors[conta.status]?.color}20`,
                        color: statusColors[conta.status]?.color,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {conta.status !== 'pago' && (
                        <Tooltip title="Registrar Pagamento">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenPagamento(conta)}
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={contasFiltradas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Dialog de Nova Conta */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {contaEditando ? 'Editar Conta' : 'Nova Conta a Pagar'}
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
                  {fornecedores.map(f => (
                    <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>
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
          <Button onClick={handleSalvar} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Pagamento */}
      <Dialog open={openPagamentoDialog} onClose={handleClosePagamento} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Pagamento</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              Deseja registrar o pagamento de:
            </Alert>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">{contaSelecionada?.descricao}</Typography>
              <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                R$ {contaSelecionada?.valor?.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Vencimento: {contaSelecionada && new Date(contaSelecionada.dataVencimento).toLocaleDateString('pt-BR')}
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

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ContasPagar;