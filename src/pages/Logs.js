// src/pages/Logs.js
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Switch,
  FormControlLabel,
  Autocomplete,
  Badge,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  Slider,
  Tab,
  Tabs,
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
  Collapse,
  Breadcrumbs,
  Link,
  CardActions,
  CardHeader,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Zoom,
  Fade,
  Grow,
  Slide,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronRight as ChevronRightIcon,
  DragHandle as DragHandleIcon,
  Sort as SortIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  SettingsApplications as SettingsIcon,
  Tune as TuneIcon,
  BugReport as BugIcon,
  Code as CodeIcon,
  Terminal as TerminalIcon,
  Storage as StorageIcon,
  Database as DatabaseIcon,
  CloudQueue as CloudQueueIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  CloudSync as CloudSyncIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  LockOutline as LockOutlineIcon,
  VerifiedUser as VerifiedUserIcon,
  AdminPanelSettings as AdminIcon,
  SupervisedUserCircle as UserIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AssignmentLate as AssignmentLateIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import {
  format,
  subDays,
  subMonths,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachMonthOfInterval,
  differenceInDays,
  isSameDay,
  isWithinInterval,
  parseISO,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';

const niveisLog = [
  { value: 'info', label: 'Informação', color: '#2196f3', icon: <InfoIcon /> },
  { value: 'success', label: 'Sucesso', color: '#4caf50', icon: <CheckIcon /> },
  { value: 'warning', label: 'Aviso', color: '#ff9800', icon: <WarningIcon /> },
  { value: 'error', label: 'Erro', color: '#f44336', icon: <ErrorIcon /> },
  { value: 'debug', label: 'Debug', color: '#9c27b0', icon: <BugIcon /> },
];

const categoriasLog = [
  { value: 'sistema', label: 'Sistema' },
  { value: 'usuario', label: 'Usuários' },
  { value: 'cliente', label: 'Clientes' },
  { value: 'agendamento', label: 'Agendamentos' },
  { value: 'atendimento', label: 'Atendimentos' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'estoque', label: 'Estoque' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'backup', label: 'Backup' },
  { value: 'api', label: 'API' },
];

function Logs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [nivel, setNivel] = useState('todos');
  const [categoria, setCategoria] = useState('todos');
  const [usuario, setUsuario] = useState('todos');
  const [dataInicio, setDataInicio] = useState(subDays(new Date(), 7));
  const [dataFim, setDataFim] = useState(new Date());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [logSelecionado, setLogSelecionado] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    info: 0,
    success: 0,
    warning: 0,
    error: 0,
    debug: 0,
    ultimaHora: 0,
    ultimas24h: 0,
  });

  useEffect(() => {
    carregarLogs();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(carregarLogs, 30000); // Atualizar a cada 30 segundos
    }
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    carregarLogs();
  }, [nivel, categoria, usuario, dataInicio, dataFim]);

  const carregarLogs = async () => {
    try {
      setLoading(true);
      
      // Buscar logs do Firebase
      let logsData = await firebaseService.getAll('logs').catch(() => []);
      
      // Filtrar por data
      logsData = logsData.filter(log => {
        const dataLog = new Date(log.timestamp);
        return dataLog >= dataInicio && dataLog <= dataFim;
      });

      // Filtrar por nível
      if (nivel !== 'todos') {
        logsData = logsData.filter(log => log.nivel === nivel);
      }

      // Filtrar por categoria
      if (categoria !== 'todos') {
        logsData = logsData.filter(log => log.categoria === categoria);
      }

      // Filtrar por usuário
      if (usuario !== 'todos') {
        logsData = logsData.filter(log => log.usuarioId === usuario);
      }

      // Filtrar por texto
      if (filtro) {
        logsData = logsData.filter(log => 
          log.mensagem?.toLowerCase().includes(filtro.toLowerCase()) ||
          log.detalhes?.toLowerCase().includes(filtro.toLowerCase()) ||
          log.usuarioNome?.toLowerCase().includes(filtro.toLowerCase())
        );
      }

      // Ordenar por data (mais recentes primeiro)
      logsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setLogs(logsData);

      // Calcular estatísticas
      const agora = new Date();
      const umaHoraAtras = subDays(agora, 1/24);
      const umDiaAtras = subDays(agora, 1);

      setEstatisticas({
        total: logsData.length,
        info: logsData.filter(l => l.nivel === 'info').length,
        success: logsData.filter(l => l.nivel === 'success').length,
        warning: logsData.filter(l => l.nivel === 'warning').length,
        error: logsData.filter(l => l.nivel === 'error').length,
        debug: logsData.filter(l => l.nivel === 'debug').length,
        ultimaHora: logsData.filter(l => new Date(l.timestamp) >= umaHoraAtras).length,
        ultimas24h: logsData.filter(l => new Date(l.timestamp) >= umDiaAtras).length,
      });

    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast.error('Erro ao carregar logs');
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

  const handleVerDetalhes = (log) => {
    setLogSelecionado(log);
    setOpenDetalhesDialog(true);
  };

  const handleExportarLogs = () => {
    try {
      const dadosExportacao = logs.map(log => ({
        data: format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss'),
        nivel: log.nivel,
        categoria: log.categoria,
        usuario: log.usuarioNome || 'Sistema',
        acao: log.acao,
        mensagem: log.mensagem,
        detalhes: log.detalhes,
        ip: log.ip,
        dispositivo: log.dispositivo,
      }));

      const jsonContent = JSON.stringify(dadosExportacao, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      mostrarSnackbar('Logs exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      mostrarSnackbar('Erro ao exportar logs', 'error');
    }
  };

  const handleLimparLogs = async () => {
    if (window.confirm('Deseja realmente limpar todos os logs? Esta ação não pode ser desfeita.')) {
      try {
        // Implementar lógica para limpar logs antigos
        toast.success('Logs limpos com sucesso!');
        carregarLogs();
      } catch (error) {
        console.error('Erro ao limpar logs:', error);
        toast.error('Erro ao limpar logs');
      }
    }
  };

  const getNivelInfo = (nivelValue) => {
    return niveisLog.find(n => n.value === nivelValue) || niveisLog[0];
  };

  const getCategoriaLabel = (categoriaValue) => {
    return categoriasLog.find(c => c.value === categoriaValue)?.label || categoriaValue;
  };

  const formatarTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const data = new Date(timestamp);
    const hoje = new Date();
    const ontem = subDays(hoje, 1);

    if (isSameDay(data, hoje)) {
      return `Hoje, ${format(data, 'HH:mm:ss')}`;
    } else if (isSameDay(data, ontem)) {
      return `Ontem, ${format(data, 'HH:mm:ss')}`;
    } else {
      return format(data, 'dd/MM/yyyy HH:mm:ss');
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Logs do Sistema
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitore todas as atividades e eventos do sistema
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto Atualizar"
            />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportarLogs}
            >
              Exportar
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={carregarLogs}
            >
              Atualizar
            </Button>
          </Box>
        </Box>

        {/* Cards de Estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                    <HistoryIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {estatisticas.total}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total de Logs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}>
                    <InfoIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {estatisticas.info}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Informações
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                    <CheckIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {estatisticas.success}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Sucessos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {estatisticas.warning}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avisos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#f44336', width: 48, height: 48 }}>
                    <ErrorIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {estatisticas.error}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Erros
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
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar em logs..."
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
                  <InputLabel>Nível</InputLabel>
                  <Select
                    value={nivel}
                    label="Nível"
                    onChange={(e) => setNivel(e.target.value)}
                  >
                    <MenuItem value="todos">Todos os níveis</MenuItem>
                    {niveisLog.map(n => (
                      <MenuItem key={n.value} value={n.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: n.color }}>{n.icon}</Box>
                          {n.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={categoria}
                    label="Categoria"
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <MenuItem value="todos">Todas</MenuItem>
                    {categoriasLog.map(c => (
                      <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <DatePicker
                  label="Data Início"
                  value={dataInicio}
                  onChange={setDataInicio}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <DatePicker
                  label="Data Fim"
                  value={dataFim}
                  onChange={setDataFim}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </Grid>

              <Grid item xs={12} md={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={carregarLogs}
                  sx={{ height: '40px' }}
                >
                  Filtrar
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Timeline de Logs */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Registros de Atividades</Typography>
              <Chip
                label={`${logs.length} registro(s)`}
                size="small"
                color="primary"
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Timestamp</strong></TableCell>
                    <TableCell><strong>Nível</strong></TableCell>
                    <TableCell><strong>Categoria</strong></TableCell>
                    <TableCell><strong>Usuário</strong></TableCell>
                    <TableCell><strong>Ação</strong></TableCell>
                    <TableCell><strong>Mensagem</strong></TableCell>
                    <TableCell align="center"><strong>Detalhes</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((log, index) => {
                      const nivelInfo = getNivelInfo(log.nivel);
                      
                      return (
                        <TableRow key={log.id || index} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {formatarTimestamp(log.timestamp)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={nivelInfo.icon}
                              label={nivelInfo.label}
                              size="small"
                              sx={{ bgcolor: nivelInfo.color, color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getCategoriaLabel(log.categoria)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                                {log.usuarioNome?.charAt(0) || 'S'}
                              </Avatar>
                              <Typography variant="body2">
                                {log.usuarioNome || 'Sistema'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {log.acao || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 300 }}>
                              {log.mensagem || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalhes">
                              <IconButton
                                size="small"
                                onClick={() => handleVerDetalhes(log)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <HistoryIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="body1" color="textSecondary">
                          Nenhum log encontrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[25, 50, 100, 200]}
              component="div"
              count={logs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Registros por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </CardContent>
        </Card>

        {/* Dialog de Detalhes */}
        <Dialog open={openDetalhesDialog} onClose={() => setOpenDetalhesDialog(false)} maxWidth="md" fullWidth>
          {logSelecionado && (
            <>
              <DialogTitle sx={{ bgcolor: getNivelInfo(logSelecionado.nivel)?.color, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getNivelInfo(logSelecionado.nivel)?.icon}
                  <Typography variant="h6">Detalhes do Log</Typography>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Timestamp</Typography>
                    <Typography variant="body1">
                      {format(new Date(logSelecionado.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Nível</Typography>
                    <Chip
                      icon={getNivelInfo(logSelecionado.nivel)?.icon}
                      label={getNivelInfo(logSelecionado.nivel)?.label}
                      size="small"
                      sx={{ bgcolor: getNivelInfo(logSelecionado.nivel)?.color, color: 'white', mt: 0.5 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Categoria</Typography>
                    <Typography variant="body1">{getCategoriaLabel(logSelecionado.categoria)}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Usuário</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {logSelecionado.usuarioNome?.charAt(0) || 'S'}
                      </Avatar>
                      <Typography variant="body1">
                        {logSelecionado.usuarioNome || 'Sistema'}
                      </Typography>
                    </Box>
                    {logSelecionado.usuarioId && (
                      <Typography variant="caption" color="textSecondary">
                        ID: {logSelecionado.usuarioId}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Ação</Typography>
                    <Typography variant="body1">{logSelecionado.acao || '-'}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Mensagem</Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                      <Typography variant="body1">{logSelecionado.mensagem}</Typography>
                    </Paper>
                  </Grid>

                  {logSelecionado.detalhes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Detalhes Adicionais</Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {JSON.stringify(logSelecionado.detalhes, null, 2)}
                        </pre>
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">IP</Typography>
                    <Typography variant="body1">{logSelecionado.ip || 'Não registrado'}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Dispositivo</Typography>
                    <Typography variant="body1">{logSelecionado.dispositivo || 'Não registrado'}</Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetalhesDialog(false)}>Fechar</Button>
              </DialogActions>
            </>
          )}
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
    </LocalizationProvider>
  );
}

export default Logs;
