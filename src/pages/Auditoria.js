// src/pages/Auditoria.js
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
  AvatarGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Create as CreateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

const acoesColors = {
  login: { color: '#4caf50', icon: <LoginIcon />, label: 'Login' },
  logout: { color: '#9e9e9e', icon: <LogoutIcon />, label: 'Logout' },
  criar: { color: '#2196f3', icon: <CreateIcon />, label: 'Criação' },
  atualizar: { color: '#ff9800', icon: <EditIcon />, label: 'Atualização' },
  excluir: { color: '#f44336', icon: <DeleteIcon />, label: 'Exclusão' },
  visualizar: { color: '#9c27b0', icon: <VisibilityIcon />, label: 'Visualização' },
  erro: { color: '#f44336', icon: <ErrorIcon />, label: 'Erro' },
  alerta: { color: '#ff9800', icon: <WarningIcon />, label: 'Alerta' },
};

const entidadesLabels = {
  usuarios: 'Usuários',
  clientes: 'Clientes',
  profissionais: 'Profissionais',
  servicos: 'Serviços',
  agendamentos: 'Agendamentos',
  atendimentos: 'Atendimentos',
  pagamentos: 'Pagamentos',
  produtos: 'Produtos',
  compras: 'Compras',
  fornecedores: 'Fornecedores',
  configuracoes: 'Configurações',
};

function Auditoria() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('todos');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [filtroEntidade, setFiltroEntidade] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoje');
  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [logSelecionado, setLogSelecionado] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    hoje: 0,
    semana: 0,
    mes: 0,
    porAcao: {},
    porUsuario: {},
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    calcularEstatisticas();
  }, [logs]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [logsRes, usuariosRes] = await Promise.all([
        api.get('/auditoria').catch(() => ({ data: [] })),
        api.get('/usuarios').catch(() => ({ data: [] })),
      ]);
      
      setLogs(logsRes.data || []);
      setUsuarios(usuariosRes.data || []);
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const seteDiasAtras = subDays(new Date(), 7).toISOString().split('T')[0];
    const trintaDiasAtras = subDays(new Date(), 30).toISOString().split('T')[0];

    const stats = {
      total: logs.length,
      hoje: logs.filter(log => log.data?.split('T')[0] === hoje).length,
      semana: logs.filter(log => log.data >= seteDiasAtras).length,
      mes: logs.filter(log => log.data >= trintaDiasAtras).length,
      porAcao: {},
      porUsuario: {},
    };

    logs.forEach(log => {
      // Por ação
      stats.porAcao[log.acao] = (stats.porAcao[log.acao] || 0) + 1;

      // Por usuário
      if (log.usuario) {
        stats.porUsuario[log.usuario] = (stats.porUsuario[log.usuario] || 0) + 1;
      }
    });

    setEstatisticas(stats);
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDetalhes = (log) => {
    setLogSelecionado(log);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setLogSelecionado(null);
  };

  const handleExportJSON = () => {
    try {
      const dadosExport = {
        geradoEm: new Date().toISOString(),
        totalRegistros: logsFiltrados.length,
        filtrosAplicados: {
          acao: filtroAcao,
          usuario: filtroUsuario,
          entidade: filtroEntidade,
          periodo: filtroPeriodo,
          dataInicio,
          dataFim,
        },
        logs: logsFiltrados,
      };

      const blob = new Blob([JSON.stringify(dadosExport, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `auditoria_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      mostrarSnackbar('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar relatório', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Data/Hora', 'Usuário', 'Ação', 'Entidade', 'ID', 'IP', 'Detalhes'];
      const data = logsFiltrados.map(log => [
        new Date(log.data).toLocaleString('pt-BR'),
        log.usuario || 'Sistema',
        acoesColors[log.acao]?.label || log.acao,
        entidadesLabels[log.entidade] || log.entidade || '-',
        log.entidadeId || '-',
        log.ip || '-',
        log.detalhes || '',
      ]);

      const csvContent = [headers, ...data]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      mostrarSnackbar('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar relatório', 'error');
    }
  };

  // Filtrar logs
  const logsFiltrados = logs.filter(log => {
    const matchesTexto = filtro === '' || 
      log.usuario?.toLowerCase().includes(filtro.toLowerCase()) ||
      log.detalhes?.toLowerCase().includes(filtro.toLowerCase()) ||
      log.ip?.includes(filtro);

    const matchesAcao = filtroAcao === 'todos' || log.acao === filtroAcao;
    const matchesUsuario = filtroUsuario === 'todos' || log.usuario === filtroUsuario;
    const matchesEntidade = filtroEntidade === 'todos' || log.entidade === filtroEntidade;

    let matchesPeriodo = true;
    if (filtroPeriodo === 'hoje') {
      const hoje = new Date().toISOString().split('T')[0];
      matchesPeriodo = log.data?.split('T')[0] === hoje;
    } else if (filtroPeriodo === 'ontem') {
      const ontem = subDays(new Date(), 1).toISOString().split('T')[0];
      matchesPeriodo = log.data?.split('T')[0] === ontem;
    } else if (filtroPeriodo === 'semana') {
      const seteDiasAtras = subDays(new Date(), 7).toISOString();
      matchesPeriodo = log.data >= seteDiasAtras;
    } else if (filtroPeriodo === 'mes') {
      const trintaDiasAtras = subDays(new Date(), 30).toISOString();
      matchesPeriodo = log.data >= trintaDiasAtras;
    } else if (filtroPeriodo === 'personalizado') {
      matchesPeriodo = log.data >= new Date(dataInicio).toISOString() && 
                       log.data <= new Date(dataFim).toISOString();
    }

    return matchesTexto && matchesAcao && matchesUsuario && matchesEntidade && matchesPeriodo;
  });

  // Ordenar por data (mais recentes primeiro)
  const logsOrdenados = [...logsFiltrados].sort((a, b) => 
    new Date(b.data) - new Date(a.data)
  );

  // Paginação
  const paginatedLogs = logsOrdenados.slice(
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
            Auditoria do Sistema
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualize todas as ações realizadas no sistema
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportJSON}
          >
            JSON
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={carregarDados}
            sx={{ bgcolor: '#9c27b0' }}
          >
            Atualizar
          </Button>
        </Box>
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
                <Typography color="textSecondary" gutterBottom>
                  Total de Registros
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {estatisticas.total}
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
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Hoje
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {estatisticas.hoje}
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
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Últimos 7 dias
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {estatisticas.semana}
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
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Últimos 30 dias
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {estatisticas.mes}
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
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por usuário, IP ou detalhes..."
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
                <InputLabel>Ação</InputLabel>
                <Select
                  value={filtroAcao}
                  onChange={(e) => setFiltroAcao(e.target.value)}
                  label="Ação"
                >
                  <MenuItem value="todos">Todas</MenuItem>
                  {Object.keys(acoesColors).map(acao => (
                    <MenuItem key={acao} value={acao}>
                      {acoesColors[acao].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Usuário</InputLabel>
                <Select
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  label="Usuário"
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  {usuarios.map(u => (
                    <MenuItem key={u.id} value={u.nome}>{u.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Entidade</InputLabel>
                <Select
                  value={filtroEntidade}
                  onChange={(e) => setFiltroEntidade(e.target.value)}
                  label="Entidade"
                >
                  <MenuItem value="todos">Todas</MenuItem>
                  {Object.entries(entidadesLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
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
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="ontem">Ontem</MenuItem>
                  <MenuItem value="semana">Últimos 7 dias</MenuItem>
                  <MenuItem value="mes">Últimos 30 dias</MenuItem>
                  <MenuItem value="personalizado">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {filtroPeriodo === 'personalizado' && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data Início"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data Fim"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Timeline de Atividades RecentESTOQUE */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Atividades Recentes
          </Typography>
          <Timeline position="alternate">
            {logsOrdenados.slice(0, 5).map((log, index) => (
              <TimelineItem key={log.id}>
                <TimelineSeparator>
                  <TimelineDot sx={{ bgcolor: acoesColors[log.acao]?.color || '#999' }}>
                    {acoesColors[log.acao]?.icon || <InfoIcon />}
                  </TimelineDot>
                  {index < 4 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="subtitle2">
                      {new Date(log.data).toLocaleString('pt-BR')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{log.usuario || 'Sistema'}</strong> - {acoesColors[log.acao]?.label || log.acao}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {log.detalhes}
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Ação</TableCell>
                <TableCell>Entidade</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>IP</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {paginatedLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <TableCell>
                      {new Date(log.data).toLocaleDateString('pt-BR')}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {new Date(log.data).toLocaleTimeString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#9c27b0', fontSize: '0.75rem' }}>
                          {log.usuario?.charAt(0) || 'S'}
                        </Avatar>
                        {log.usuario || 'Sistema'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={acoesColors[log.acao]?.icon}
                        label={acoesColors[log.acao]?.label || log.acao}
                        size="small"
                        sx={{
                          bgcolor: `${acoesColors[log.acao]?.color}20`,
                          color: acoesColors[log.acao]?.color,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {entidadesLabels[log.entidade] || log.entidade || '-'}
                    </TableCell>
                    <TableCell>
                      {log.entidadeId || '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.ip || '-'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Detalhes">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetalhes(log)}
                          sx={{ color: '#9c27b0' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {paginatedLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <SecurityIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      Nenhum registro de auditoria encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={logsOrdenados.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Registros por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes do Registro
        </DialogTitle>
        <DialogContent>
          {logSelecionado && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Data/Hora</Typography>
                  <Typography variant="body2">
                    {new Date(logSelecionado.data).toLocaleString('pt-BR')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Usuário</Typography>
                  <Typography variant="body2">{logSelecionado.usuario || 'Sistema'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Ação</Typography>
                  <Chip
                    icon={acoesColors[logSelecionado.acao]?.icon}
                    label={acoesColors[logSelecionado.acao]?.label || logSelecionado.acao}
                    size="small"
                    sx={{
                      bgcolor: `${acoesColors[logSelecionado.acao]?.color}20`,
                      color: acoesColors[logSelecionado.acao]?.color,
                      mt: 0.5,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">IP</Typography>
                  <Typography variant="body2">{logSelecionado.ip || 'Não registrado'}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {logSelecionado.entidade && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Entidade</Typography>
                    <Typography variant="body2">
                      {entidadesLabels[logSelecionado.entidade] || logSelecionado.entidade}
                    </Typography>
                  </Grid>
                )}

                {logSelecionado.entidadeId && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">ID da Entidade</Typography>
                    <Typography variant="body2">{logSelecionado.entidadeId}</Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Detalhes</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f5f5f5' }}>
                    <Typography variant="body2">
                      {logSelecionado.detalhes || 'Nenhum detalhe adicional'}
                    </Typography>
                  </Paper>
                </Grid>

                {logSelecionado.dados && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Dados da Operação</Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f5f5f5', overflow: 'auto' }}>
                      <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                        {JSON.stringify(logSelecionado.dados, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Auditoria;