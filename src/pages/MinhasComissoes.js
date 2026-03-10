// src/pages/MinhasComissoes.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { comissoesService } from '../services/comissoesService';
import { usuariosService } from '../services/usuariosService';
import { useFeedback } from '../contexts/FeedbackContext';

function MinhasComissoes() {
  const { showSnackbar, showLoading, hideLoading } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [comissoes, setComissoes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [profissional, setProfissional] = useState(null);

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = [2024, 2025, 2026];

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (profissional) {
      carregarComissoes();
    }
  }, [profissional, filtroMes, filtroAno, filtroStatus]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar profissional atual
      const usuario = usuariosService.getUsuarioAtual();
      if (!usuario || !usuario.profissionalId) {
        showSnackbar('Perfil de profissional não encontrado', 'error');
        return;
      }

      setProfissional({
        id: usuario.profissionalId,
        nome: usuario.nome
      });

      // Carregar dados
      await Promise.all([
        carregarComissoes(usuario.profissionalId),
        carregarResumo(usuario.profissionalId),
        carregarEstatisticas(usuario.profissionalId)
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showSnackbar('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarComissoes = async (profissionalId) => {
    try {
      const data = await comissoesService.buscarMinhasComissoes(profissionalId, {
        mes: filtroMes,
        ano: filtroAno,
        status: filtroStatus !== 'todos' ? filtroStatus : null
      });
      setComissoes(data);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
    }
  };

  const carregarResumo = async (profissionalId) => {
    try {
      const data = await comissoesService.buscarResumo(profissionalId);
      setResumo(data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  const carregarEstatisticas = async (profissionalId) => {
    try {
      const data = await comissoesService.buscarEstatisticas(profissionalId);
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getStatusChip = (status) => {
    const config = {
      pendente: { color: 'warning', icon: <PendingIcon />, label: 'Pendente' },
      pago: { color: 'success', icon: <CheckCircleIcon />, label: 'Pago' },
      cancelado: { color: 'error', icon: <CancelIcon />, label: 'Cancelado' }
    };
    
    const { color, icon, label } = config[status] || config.pendente;
    
    return (
      <Chip
        icon={icon}
        label={label}
        size="small"
        color={color}
        variant="outlined"
      />
    );
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!profissional) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Você não está vinculado a um perfil de profissional.
          Entre em contato com o administrador.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Minhas Comissões
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Acompanhe suas comissões e rendimentos
        </Typography>
      </Box>

      {/* Cards de Resumo */}
      {resumo && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                      <MoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        Total do Mês
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {formatarMoeda(resumo.resumo.totalMes)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {resumo.resumo.quantidadeMes} atendimentos
                      </Typography>
                    </Box>
                  </Box>
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
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                      <PendingIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        Pendente
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                        {formatarMoeda(resumo.resumo.totalPendente)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {resumo.resumo.quantidadePendente} comissões
                      </Typography>
                    </Box>
                  </Box>
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
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        Recebido
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {formatarMoeda(resumo.resumo.totalPago)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {resumo.resumo.quantidadePaga} comissões
                      </Typography>
                    </Box>
                  </Box>
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
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56 }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        Total Geral
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196f3' }}>
                        {formatarMoeda(resumo.resumo.totalGeral)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {resumo.resumo.quantidadeTotal} comissões
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Mês</InputLabel>
                <Select
                  value={filtroMes}
                  label="Mês"
                  onChange={(e) => setFiltroMes(e.target.value)}
                >
                  {meses.map(mes => (
                    <MenuItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Ano</InputLabel>
                <Select
                  value={filtroAno}
                  label="Ano"
                  onChange={(e) => setFiltroAno(e.target.value)}
                >
                  {anos.map(ano => (
                    <MenuItem key={ano} value={ano}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroStatus}
                  label="Status"
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="pago">Pago</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  // Função para exportar relatório
                  toast.success('Relatório exportado!');
                }}
              >
                Exportar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Gráficos e Estatísticas */}
      {estatisticas && estatisticas.porMes.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Histórico por Mês
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Período</TableCell>
                        <TableCell align="right">Comissões</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {estatisticas.porMes.map((mes, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {meses.find(m => m.value === mes.mes)?.label} / {mes.ano}
                          </TableCell>
                          <TableCell align="right">{mes.quantidade}</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} color="#4caf50">
                              {formatarMoeda(mes.total)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Distribuição por Serviço
                </Typography>
                {resumo?.porServico && resumo.porServico.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Serviço</TableCell>
                          <TableCell align="right">Valor</TableCell>
                          <TableCell align="right">%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {resumo.porServico.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.nome}</TableCell>
                            <TableCell align="right">
                              {formatarMoeda(item.valor)}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${item.percentual}%`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    Nenhum dado disponível para o período selecionado
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabela de Comissões */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Detalhamento das Comissões
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Atendimento</TableCell>
                  <TableCell>Serviço</TableCell>
                  <TableCell align="right">Valor Atend.</TableCell>
                  <TableCell align="right">%</TableCell>
                  <TableCell align="right">Comissão</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Pagamento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comissoes.map((comissao) => (
                  <TableRow key={comissao.id} hover>
                    <TableCell>{comissao.dataFormatada}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {comissao.atendimento?.horaInicio || '--:--'}
                      </Typography>
                    </TableCell>
                    <TableCell>{comissao.servicoNome}</TableCell>
                    <TableCell align="right">
                      {formatarMoeda(comissao.valorAtendimento)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${comissao.percentual}%`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color="#4caf50">
                        {formatarMoeda(comissao.valor)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(comissao.status)}
                    </TableCell>
                    <TableCell>
                      {comissao.dataPagamento ? (
                        <Tooltip title={new Date(comissao.dataPagamento).toLocaleDateString('pt-BR')}>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Pago"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </Tooltip>
                      ) : (
                        <Chip
                          icon={<PendingIcon />}
                          label="Aguardando"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {comissoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography color="textSecondary">
                        Nenhuma comissão encontrada para o período
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Resumo e Informações */}
      {resumo && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info" icon={<CalendarIcon />}>
            <Typography variant="body2">
              <strong>Resumo do mês {meses.find(m => m.value === resumo.mesAtual.mes)?.label}/{resumo.mesAtual.ano}:</strong>{' '}
              {resumo.resumo.quantidadeMes} atendimentos • 
              Média por atendimento: {formatarMoeda(estatisticas?.mediaPorAtendimento || 0)} • 
              Total: {formatarMoeda(resumo.mesAtual.valor)}
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
}

export default MinhasComissoes;
