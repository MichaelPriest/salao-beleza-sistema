// src/pages/ModernCaixa.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  PointOfSale as PointOfSaleIcon,
  PriceCheck as ConferenciaIcon,
  RemoveCircleOutline as SangriaIcon,
  AddCircleOutline as ReforcoIcon,
  LockOpen as AbrirIcon,
  Lock as FecharIcon,
  ReceiptLong as ReceiptIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { caixaService, formatarMoedaCaixa, METODOS_CAIXA } from '../services/caixaService';

const dialogInicial = {
  tipo: 'venda',
  valor: '',
  formaPagamento: 'dinheiro',
  descricao: '',
  observacao: '',
};

function ModernCaixa() {
  const [loading, setLoading] = useState(true);
  const [caixaAberto, setCaixaAberto] = useState(null);
  const [movimentos, setMovimentos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [openAbrir, setOpenAbrir] = useState(false);
  const [openMovimento, setOpenMovimento] = useState(false);
  const [openFechar, setOpenFechar] = useState(false);
  const [valorAbertura, setValorAbertura] = useState('');
  const [valorConferido, setValorConferido] = useState('');
  const [observacaoFechamento, setObservacaoFechamento] = useState('');
  const [movimentoForm, setMovimentoForm] = useState(dialogInicial);

  const carregarCaixa = useCallback(async () => {
    try {
      setLoading(true);
      const resumo = await caixaService.carregarResumoAtual();
      setCaixaAberto(resumo.caixaAberto);
      setMovimentos(resumo.movimentos);
      setHistorico(resumo.historico);
      setValorConferido(resumo.totais.saldoAtual ? String(resumo.totais.saldoAtual.toFixed(2)) : '');
    } catch (error) {
      console.error('Erro ao carregar caixa:', error);
      toast.error('Erro ao carregar caixa');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarCaixa();
  }, [carregarCaixa]);

  const totais = useMemo(() => caixaService.calcularTotais(caixaAberto, movimentos), [caixaAberto, movimentos]);
  const movimentosOrdenados = useMemo(() => [...movimentos].sort((a, b) => new Date(b.createdAt || b.data) - new Date(a.createdAt || a.data)), [movimentos]);

  const abrirCaixa = async () => {
    try {
      await caixaService.abrirCaixa({ valorAbertura, observacao: 'Abertura manual do caixa' });
      toast.success('Caixa aberto com sucesso');
      setOpenAbrir(false);
      setValorAbertura('');
      carregarCaixa();
    } catch (error) {
      toast.error(error.message || 'Erro ao abrir caixa');
    }
  };

  const registrarMovimento = async () => {
    try {
      await caixaService.registrarMovimento({ caixaId: caixaAberto?.id, ...movimentoForm });
      toast.success('Movimento registrado');
      setOpenMovimento(false);
      setMovimentoForm(dialogInicial);
      carregarCaixa();
    } catch (error) {
      toast.error(error.message || 'Erro ao registrar movimento');
    }
  };

  const fecharCaixa = async () => {
    try {
      await caixaService.fecharCaixa(caixaAberto.id, {
        valorConferido,
        observacao: observacaoFechamento,
      });
      toast.success('Caixa fechado com sucesso');
      setOpenFechar(false);
      setObservacaoFechamento('');
      carregarCaixa();
    } catch (error) {
      toast.error(error.message || 'Erro ao fechar caixa');
    }
  };

  const resumoCards = [
    { label: 'Abertura', value: totais.valorAbertura, color: 'info.main' },
    { label: 'Entradas', value: totais.entradas, color: 'success.main' },
    { label: 'Sangrias', value: totais.sangrias, color: 'error.main' },
    { label: 'Saldo esperado', value: totais.saldoAtual, color: 'primary.main' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Sistema de Caixa</Typography>
          <Typography color="text.secondary">Abertura, sangria, reforço, lançamentos e fechamento com conferência.</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button startIcon={<RefreshIcon />} onClick={carregarCaixa}>Atualizar</Button>
          {!caixaAberto ? (
            <Button variant="contained" startIcon={<AbrirIcon />} onClick={() => setOpenAbrir(true)}>Abrir caixa</Button>
          ) : (
            <>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenMovimento(true)}>Novo movimento</Button>
              <Button color="error" variant="outlined" startIcon={<FecharIcon />} onClick={() => setOpenFechar(true)}>Fechar caixa</Button>
            </>
          )}
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {!caixaAberto ? (
        <Alert severity="warning" sx={{ mb: 3 }}>Nenhum caixa aberto. Abra o caixa para registrar vendas, sangrias e reforços.</Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3 }} icon={<PointOfSaleIcon />}>Caixa aberto desde {new Date(caixaAberto.abertoEm || caixaAberto.createdAt).toLocaleString('pt-BR')}.</Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {resumoCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                <Typography variant="h5" fontWeight={800} color={card.color}>{formatarMoedaCaixa(card.value)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}><ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Movimentos do caixa</Typography>
                <Chip label={`${movimentos.length} movimentos`} />
              </Stack>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Forma</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movimentosOrdenados.map((movimento) => (
                      <TableRow key={movimento.id} hover>
                        <TableCell>{new Date(movimento.createdAt || movimento.data).toLocaleString('pt-BR')}</TableCell>
                        <TableCell><Chip size="small" color={movimento.tipo === 'sangria' ? 'error' : 'success'} label={caixaService.tipoLabel(movimento.tipo)} /></TableCell>
                        <TableCell>{movimento.descricao || movimento.observacao || '—'}</TableCell>
                        <TableCell>{METODOS_CAIXA[movimento.formaPagamento] || movimento.formaPagamento || '—'}</TableCell>
                        <TableCell align="right">{formatarMoedaCaixa(movimento.valor)}</TableCell>
                      </TableRow>
                    ))}
                    {movimentosOrdenados.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center">Nenhum movimento registrado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}><ConferenciaIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Conferência por forma</Typography>
              <Divider sx={{ my: 2 }} />
              {Object.entries(totais.porForma).map(([forma, valor]) => (
                <Stack key={forma} direction="row" justifyContent="space-between" sx={{ py: 0.7 }}>
                  <Typography>{METODOS_CAIXA[forma] || forma}</Typography>
                  <Typography fontWeight={700}>{formatarMoedaCaixa(valor)}</Typography>
                </Stack>
              ))}
              {Object.keys(totais.porForma).length === 0 && <Typography color="text.secondary">Sem lançamentos por forma.</Typography>}
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}><WalletIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Últimos caixas</Typography>
              <Divider sx={{ my: 2 }} />
              {historico.slice(0, 5).map((caixa) => (
                <Box key={caixa.id} sx={{ mb: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={700}>{caixa.status === 'aberto' ? 'Aberto' : 'Fechado'}</Typography>
                    <Chip size="small" label={formatarMoedaCaixa(caixa.saldoFinal ?? caixa.saldoEsperado ?? caixa.valorAbertura)} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{new Date(caixa.abertoEm || caixa.createdAt).toLocaleString('pt-BR')}</Typography>
                </Box>
              ))}
              {historico.length === 0 && <Typography color="text.secondary">Sem histórico de caixas.</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openAbrir} onClose={() => setOpenAbrir(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Abrir caixa</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Valor inicial" value={valorAbertura} onChange={(e) => setValorAbertura(e.target.value)} margin="normal" InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenAbrir(false)}>Cancelar</Button><Button variant="contained" onClick={abrirCaixa}>Abrir</Button></DialogActions>
      </Dialog>

      <Dialog open={openMovimento} onClose={() => setOpenMovimento(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo movimento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Tipo" value={movimentoForm.tipo} onChange={(e) => setMovimentoForm({ ...movimentoForm, tipo: e.target.value })}>
                <MenuItem value="venda">Venda/Recebimento</MenuItem>
                <MenuItem value="reforco"><ReforcoIcon fontSize="small" /> Reforço</MenuItem>
                <MenuItem value="sangria"><SangriaIcon fontSize="small" /> Sangria</MenuItem>
                <MenuItem value="despesa">Despesa</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Forma" value={movimentoForm.formaPagamento} onChange={(e) => setMovimentoForm({ ...movimentoForm, formaPagamento: e.target.value })}>
                {Object.entries(METODOS_CAIXA).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Valor" value={movimentoForm.valor} onChange={(e) => setMovimentoForm({ ...movimentoForm, valor: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Descrição" value={movimentoForm.descricao} onChange={(e) => setMovimentoForm({ ...movimentoForm, descricao: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Observação" value={movimentoForm.observacao} onChange={(e) => setMovimentoForm({ ...movimentoForm, observacao: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenMovimento(false)}>Cancelar</Button><Button variant="contained" onClick={registrarMovimento}>Registrar</Button></DialogActions>
      </Dialog>

      <Dialog open={openFechar} onClose={() => setOpenFechar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Fechar caixa</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>Saldo esperado: <strong>{formatarMoedaCaixa(totais.saldoAtual)}</strong></Alert>
          <TextField fullWidth label="Valor conferido" value={valorConferido} onChange={(e) => setValorConferido(e.target.value)} margin="normal" InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
          <TextField fullWidth multiline rows={3} label="Observações de fechamento" value={observacaoFechamento} onChange={(e) => setObservacaoFechamento(e.target.value)} margin="normal" />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenFechar(false)}>Cancelar</Button><Button color="error" variant="contained" onClick={fecharCaixa}>Fechar caixa</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModernCaixa;
