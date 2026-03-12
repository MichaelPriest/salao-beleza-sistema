// src/pages/ContasPagar.js
import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useDados } from '../hooks/useDados';
import { firebaseService } from '../services/firebase';

const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente' },
  pago: { color: '#4caf50', label: 'Pago' },
  atrasado: { color: '#f44336', label: 'Atrasado' },
  cancelado: { color: '#9e9e9e', label: 'Cancelado' },
};

function ContasPagar() {
  const { dados, carregando, recarregar, caixaAtual } = useDados();
  
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
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
  });

  // Filtrar apenas contas a pagar (transações do tipo despesa)
  const contas = useMemo(() => {
    return dados.transacoes.filter(t => t.tipo === 'despesa');
  }, [dados.transacoes]);

  const fornecedores = dados.fornecedores || [];

  useEffect(() => {
    const verificarAtrasadas = async () => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      for (const conta of contas) {
        if (conta.status === 'pendente') {
          const vencimento = new Date(conta.dataVencimento);
          vencimento.setHours(0, 0, 0, 0);
          
          if (vencimento < hoje) {
            try {
              await firebaseService.update('transacoes', conta.id, {
                status: 'atrasado',
                updatedAt: new Date().toISOString(),
              });
              await recarregar();
            } catch (error) {
              console.error('Erro ao atualizar conta atrasada:', error);
            }
          }
        }
      }
    };

    if (contas.length > 0) {
      verificarAtrasadas();
    }
  }, [contas]);

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
        tipo: 'despesa',
        descricao: formData.descricao.trim(),
        valor: valorNumerico,
        dataVencimento: formData.dataVencimento,
        data: formData.dataVencimento, // Para facilitar a busca
        categoria: formData.categoria,
        fornecedorId: formData.fornecedorId || null,
        formaPagamento: formData.formaPagamento,
        observacoes: formData.observacoes || null,
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };

      if (contaEditando) {
        await firebaseService.update('transacoes', contaEditando.id, dadosParaSalvar);
        mostrarSnackbar('Conta atualizada com sucesso!');
      } else {
        dadosParaSalvar.createdAt = new Date().toISOString();
        await firebaseService.add('transacoes', dadosParaSalvar);
        mostrarSnackbar('Conta registrada com sucesso!');
      }

      await recarregar();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      mostrarSnackbar('Erro ao salvar conta', 'error');
    }
  };

  const handleRegistrarPagamento = async () => {
    try {
      if (!contaSelecionada) return;

      const dadosConta = {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await firebaseService.update('transacoes', contaSelecionada.id, dadosConta);

      // Atualizar caixa se estiver aberto
      if (caixaAtual) {
        const novoSaldo = (caixaAtual.saldoAtual || 0) - Number(contaSelecionada.valor);
        
        const novaMovimentacao = {
          id: Date.now().toString(),
          tipo: 'despesa',
          valor: Number(contaSelecionada.valor),
          descricao: `Pagamento: ${contaSelecionada.descricao}`,
          data: new Date().toISOString(),
          transacaoId: contaSelecionada.id,
        };
        
        const movimentacoesAtuais = Array.isArray(caixaAtual.movimentacoes) ? caixaAtual.movimentacoes : [];
        const novasMovimentacoes = [...movimentacoesAtuais, novaMovimentacao];
        
        await firebaseService.update('caixa', caixaAtual.id, {
          saldoAtual: novoSaldo,
          movimentacoes: novasMovimentacoes,
          updatedAt: new Date().toISOString(),
        });
      }

      await recarregar();
      mostrarSnackbar('Pagamento registrado com sucesso!');
      handleClosePagamento();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      mostrarSnackbar('Erro ao registrar pagamento', 'error');
    }
  };

  const contasFiltradas = contas.filter(conta => {
    const fornecedor = fornecedores.find(f => f.id === conta.fornecedorId);
    const matchesTexto = filtro === '' || 
      conta.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
      fornecedor?.nome?.toLowerCase().includes(filtro.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || conta.status === filtroStatus;

    return matchesTexto && matchesStatus;
  });

  const stats = {
    pendentes: contas.filter(c => c.status === 'pendente').length,
    atrasadas: contas.filter(c => c.status === 'atrasado').length,
    pagas: contas.filter(c => c.status === 'pago').length,
    valorPendente: contas
      .filter(c => c.status === 'pendente' || c.status === 'atrasado')
      .reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
  };

  if (carregando) {
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
          sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
        >
          Nova Conta
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Valor Pendente</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                  R$ {stats.valorPendente.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Pendentes</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {stats.pendentes}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Atrasadas</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {stats.atrasadas}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Pagas</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.pagas}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por descrição ou fornecedor..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
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
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={recarregar}
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
                <TableCell><strong>Fornecedor</strong></TableCell>
                <TableCell><strong>Vencimento</strong></TableCell>
                <TableCell align="right"><strong>Valor</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {contasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((conta, index) => {
                  const fornecedor = fornecedores.find(f => f.id === conta.fornecedorId);
                  const hoje = new Date();
                  hoje.setHours(0, 0, 0, 0);
                  const vencimento = new Date(conta.dataVencimento);
                  vencimento.setHours(0, 0, 0, 0);
                  const isVencida = vencimento < hoje && conta.status === 'pendente';
                  
                  return (
                    <motion.tr
                      key={conta.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>{conta.descricao}</TableCell>
                      <TableCell>{fornecedor?.nome || '—'}</TableCell>
                      <TableCell>
                        {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                        {isVencida && (
                          <Chip
                            size="small"
                            label="Vencida"
                            color="error"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
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
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {contasFiltradas.length === 0 && (
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={contasFiltradas.length}
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

      {/* Dialog de Nova Conta */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
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
                  <MenuItem value="boleto">Boleto</MenuItem>
                  <MenuItem value="dinheiro">Dinheiro</MenuItem>
                  <MenuItem value="cartao_credito">Cartão de Crédito</MenuItem>
                  <MenuItem value="cartao_debito">Cartão de Débito</MenuItem>
                  <MenuItem value="pix">PIX</MenuItem>
                  <MenuItem value="transferencia">Transferência</MenuItem>
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
              <Typography variant="subtitle2">{contaSelecionada?.descricao}</Typography>
              <Typography variant="h5" color="primary" sx={{ mt: 1, fontWeight: 600 }}>
                R$ {Number(contaSelecionada?.valor).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ContasPagar;
