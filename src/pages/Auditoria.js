// src/pages/Auditoria.js
import React, { useState, useEffect, useCallback } from 'react';
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
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';

const acoesColors = {
  login: { color: '#4caf50', icon: <LoginIcon />, label: 'Login' },
  logout: { color: '#9e9e9e', icon: <LogoutIcon />, label: 'Logout' },
  criar: { color: '#2196f3', icon: <CreateIcon />, label: 'Criação' },
  atualizar: { color: '#ff9800', icon: <EditIcon />, label: 'Atualização' },
  excluir: { color: '#f44336', icon: <DeleteIcon />, label: 'Exclusão' },
  visualizar: { color: '#9c27b0', icon: <VisibilityIcon />, label: 'Visualização' },
  erro: { color: '#f44336', icon: <ErrorIcon />, label: 'Erro' },
  alerta: { color: '#ff9800', icon: <WarningIcon />, label: 'Alerta' },
  acesso_negado: { color: '#f44336', icon: <LockIcon />, label: 'Acesso Negado' },
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
  notificacoes: 'Notificações',
  auditoria: 'Auditoria',
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
      
      const [logsData, usuariosData] = await Promise.all([
        firebaseService.getAll('auditoria').catch(() => []),
        firebaseService.getAll('usuarios').catch(() => []),
      ]);
      
      setLogs(logsData || []);
      setUsuarios(usuariosData || []);
      
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
    const seteDiasAtras = subDays(new Date(), 7).toISOString();
    const trintaDiasAtras = subDays(new Date(), 30).toISOString();

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
        log.data ? new Date(log.data).toLocaleString('pt-BR') : '',
        log.usuario || 'Sistema',
        acoesColors[log.acao]?.label || log.acao,
        entidadesLabels[log.entidade] || log.entidade || '-',
        log.entidadeId || '-',
        log.ip || '-',
        (log.detalhes || '').replace(/"/g, '""'),
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

  // Função para limpar logs antigos (opcional - para administradores)
  const handleLimparLogsAntigos = async () => {
    if (!window.confirm('Tem certeza que deseja limpar logs com mais de 90 dias? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const noventaDiasAtras = subDays(new Date(), 90).toISOString();
      const logsAntigos = logs.filter(log => log.data < noventaDiasAtras);
      
      for (const log of logsAntigos) {
        await firebaseService.delete('auditoria', log.id);
      }
      
      toast.success(`${logsAntigos.length} logs antigos removidos!`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      toast.error('Erro ao limpar logs');
    }
  };

  // Filtrar logs
  const logsFiltrados = logs.filter(log => {
    const matchesTexto = filtro === '' || 
      (log.usuario && log.usuario.toLowerCase().includes(filtro.toLowerCase())) ||
      (log.detalhes && log.detalhes.toLowerCase().includes(filtro.toLowerCase())) ||
      (log.ip && log.ip.includes(filtro)) ||
      (log.entidadeId && log.entidadeId.includes(filtro));

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
                       log.data <= new Date(dataFim + 'T23:59:59').toISOString();
    }

    return matchesTexto && matchesAcao && matchesUsuario && matchesEntidade && matchesPeriodo;
  });

  // Ordenar por data (mais recentes primeiro)
  const logsOrdenados = [...logsFiltrados].sort((a, b) => {
    if (!a.data) return 1;
    if (!b.data) return -1;
    return new Date(b.data) - new Date(a.data);
  });

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Auditoria do Sistema
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualize todas as ações realizadas no sistema
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleLimparLogsAntigos}
          >
            Limpar Antigos
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={carregarDados}
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
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
                placeholder="Buscar por usuário, IP, ID ou detalhes..."
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
                  <MenuItem value="Sistema">Sistema</MenuItem>
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

      {/* Timeline de Atividades Recentes */}
      {logsOrdenados.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0', fontWeight: 600 }}>
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
                        {log.data ? new Date(log.data).toLocaleString('pt-BR') : 'Data não informada'}
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
      )}

      {/* Tabela de Logs */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Data/Hora</strong></TableCell>
                <TableCell><strong>Usuário</strong></TableCell>
                <TableCell><strong>Ação</strong></TableCell>
                <TableCell><strong>Entidade</strong></TableCell>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>IP</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
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
                      {log.data ? (
                        <>
                          {new Date(log.data).toLocaleDateString('pt-BR')}
                          <Typography variant="caption" display="block" color="textSecondary">
                            {new Date(log.data).toLocaleTimeString('pt-BR')}
                          </Typography>
                        </>
                      ) : (
                        '-'
                      )}
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
                    {logSelecionado.data ? new Date(logSelecionado.data).toLocaleString('pt-BR') : 'Não informada'}
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
                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f5f5f5', overflow: 'auto', maxHeight: 300 }}>
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

export default Auditoria;
