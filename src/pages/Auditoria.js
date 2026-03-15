// src/pages/Auditoria.js
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
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Fab,
  Zoom,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
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
  Login as LoginIcon,
  Logout as LogoutIcon,
  Create as CreateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { useReactToPrint } from 'react-to-print';

// Componente de Impressão
const RelatorioAuditoria = React.forwardRef(({ logs, filtros, estatisticas, config }, ref) => {
  const logo = config?.salao?.logo || '';
  const empresa = config?.salao || {
    nome: 'Sistema de Gestão',
    cnpj: '',
    endereco: {}
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
          Relatório de Auditoria
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
          Resumo do Período
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2">Total</Typography>
              <Typography variant="h6">{estatisticas.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2">Hoje</Typography>
              <Typography variant="h6">{estatisticas.hoje}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2">Semana</Typography>
              <Typography variant="h6">{estatisticas.semana}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2">Mês</Typography>
              <Typography variant="h6">{estatisticas.mes}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Tabela de Logs */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Registros de Auditoria
      </Typography>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#9c27b0', color: 'white' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>Data/Hora</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Usuário</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Ação</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Entidade</th>
            <th style={{ padding: 10, textAlign: 'left' }}>IP</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {logs.slice(0, 100).map((log, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 8 }}>
                {log.data ? new Date(log.data).toLocaleString('pt-BR') : '-'}
              </td>
              <td style={{ padding: 8 }}>{log.usuario || 'Sistema'}</td>
              <td style={{ padding: 8 }}>{log.acao}</td>
              <td style={{ padding: 8 }}>{log.entidade || '-'}</td>
              <td style={{ padding: 8 }}>{log.ip || '-'}</td>
              <td style={{ padding: 8 }}>{log.detalhes || '-'}</td>
            </tr>
          ))}
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

const acoesColors = {
  login: { color: '#4caf50', icon: <LoginIcon />, label: 'Login' },
  logout: { color: '#9e9e9e', icon: <LogoutIcon />, label: 'Logout' },
  criar: { color: '#2196f3', icon: <CreateIcon />, label: 'Criação' },
  atualizar: { color: '#ff9800', icon: <EditIcon />, label: 'Atualização' },
  excluir: { color: '#f44336', icon: <DeleteIcon />, label: 'Exclusão' },
  visualizar: { color: '#9c27b0', icon: <VisibilityIcon />, label: 'Visualização' },
  erro: { color: '#f44336', icon: <ErrorIcon />, label: 'Erro' },
  alerta: { color: '#ff9800', icon: <WarningIcon />, label: 'Alerta' },
  acesso_negado: { color: '#f44336', icon: <SecurityIcon />, label: 'Acesso Negado' },
};

function Auditoria() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const printRef = useRef();
  
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [config, setConfig] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('todos');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [filtroEntidade, setFiltroEntidade] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split('T')[0]
  );
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
  
  // Mobile states
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    calcularEstatisticas();
  }, [logs]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [logsData, usuariosData, configData] = await Promise.all([
        firebaseService.getAll('auditoria').catch(() => []),
        firebaseService.getAll('usuarios').catch(() => []),
        firebaseService.getAll('configuracoes').catch(() => []),
      ]);
      
      setLogs(logsData || []);
      setUsuarios(usuariosData || []);
      setConfig(configData?.[0] || null);
      
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_auditoria',
        detalhes: 'Erro ao carregar dados de auditoria'
      });
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
      stats.porAcao[log.acao] = (stats.porAcao[log.acao] || 0) + 1;
      if (log.usuario) {
        stats.porUsuario[log.usuario] = (stats.porUsuario[log.usuario] || 0) + 1;
      }
    });

    setEstatisticas(stats);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `auditoria_${new Date().toISOString().split('T')[0]}`,
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

  const handleExportJSON = () => {
    try {
      const dadosExport = {
        geradoEm: new Date().toISOString(),
        empresa: config?.salao?.nome || 'Sistema',
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
      mostrarSnackbar('Erro ao exportar', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Data/Hora', 'Usuário', 'Ação', 'Entidade', 'ID', 'IP', 'Detalhes'];
      const data = logsFiltrados.map(log => [
        log.data ? new Date(log.data).toLocaleString('pt-BR') : '',
        log.usuario || 'Sistema',
        acoesColors[log.acao]?.label || log.acao,
        log.entidade || '-',
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
      mostrarSnackbar('Erro ao exportar', 'error');
    }
  };

  const handleLimparLogsAntigos = async () => {
    if (!window.confirm('Tem certeza que deseja limpar logs com mais de 90 dias?')) return;

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
      matchesPeriodo = log.data?.split('T')[0] === new Date().toISOString().split('T')[0];
    } else if (filtroPeriodo === 'ontem') {
      const ontem = subDays(new Date(), 1).toISOString().split('T')[0];
      matchesPeriodo = log.data?.split('T')[0] === ontem;
    } else if (filtroPeriodo === 'semana') {
      matchesPeriodo = log.data >= subDays(new Date(), 7).toISOString();
    } else if (filtroPeriodo === 'mes') {
      matchesPeriodo = log.data >= subDays(new Date(), 30).toISOString();
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

  // Renderização mobile
  const renderMobileList = () => {
    if (logsOrdenados.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1" color="textSecondary">
            Nenhum registro encontrado
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ p: 0 }}>
        <AnimatePresence>
          {logsOrdenados.slice(0, 20).map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ListItem
                button
                onClick={() => handleOpenDetalhes(log)}
                sx={{
                  bgcolor: log.acao === 'erro' ? '#ffebee' : 'white',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: acoesColors[log.acao]?.color || '#999' }}>
                    {acoesColors[log.acao]?.icon || <InfoIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {log.usuario || 'Sistema'}
                      </Typography>
                      <Chip
                        label={acoesColors[log.acao]?.label || log.acao}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6rem',
                          bgcolor: `${acoesColors[log.acao]?.color}20`,
                          color: acoesColors[log.acao]?.color,
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {log.data ? new Date(log.data).toLocaleString('pt-BR') : '-'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {log.detalhes}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </motion.div>
          ))}
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
            Filtrar Registros
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
              placeholder="Buscar..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
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

          <Grid item xs={12}>
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

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Período</InputLabel>
              <Select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                label="Período"
              >
                <MenuItem value="todos">Todos</MenuItem>
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
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Início"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fim"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
            </>
          )}

          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setFilterDrawerOpen(false);
                setFiltroAcao('todos');
                setFiltroUsuario('todos');
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
        <RelatorioAuditoria
          ref={printRef}
          logs={logsOrdenados}
          filtros={{
            periodo: filtroPeriodo === 'hoje' ? 'Hoje' :
                     filtroPeriodo === 'ontem' ? 'Ontem' :
                     filtroPeriodo === 'semana' ? 'Últimos 7 dias' :
                     filtroPeriodo === 'mes' ? 'Últimos 30 dias' :
                     filtroPeriodo === 'personalizado' ? `${dataInicio} a ${dataFim}` : 'Todos'
          }}
          estatisticas={estatisticas}
          config={config}
        />
      </Box>

      {/* Header Mobile */}
      {isMobile && (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0', flex: 1 }}>
              Auditoria
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(true)}>
              <Badge badgeContent={filtroAcao !== 'todos' || filtroUsuario !== 'todos' || filtro ? 1 : 0} color="secondary">
                <FilterIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={carregarDados}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Cards de estatísticas mobile */}
          <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
            <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center' }}>
              <Typography variant="caption">Total</Typography>
              <Typography variant="h6">{estatisticas.total}</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#e8f5e9' }}>
              <Typography variant="caption">Hoje</Typography>
              <Typography variant="h6">{estatisticas.hoje}</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="caption">Semana</Typography>
              <Typography variant="h6">{estatisticas.semana}</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, minWidth: 80, textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <Typography variant="caption">Mês</Typography>
              <Typography variant="h6">{estatisticas.mes}</Typography>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Header Desktop */}
      {!isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Auditoria do Sistema
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button startIcon={<PrintIcon />} onClick={handlePrint} variant="outlined">
              Imprimir
            </Button>
            <Button startIcon={<DownloadIcon />} onClick={handleExportJSON} variant="outlined">
              JSON
            </Button>
            <Button startIcon={<DownloadIcon />} onClick={handleExportCSV} variant="outlined">
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
      )}

      {/* Cards de Estatísticas Desktop */}
      {!isMobile && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Total</Typography>
                <Typography variant="h4" sx={{ color: '#9c27b0' }}>
                  {estatisticas.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography color="textSecondary">Hoje</Typography>
                <Typography variant="h4" sx={{ color: '#4caf50' }}>
                  {estatisticas.hoje}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography color="textSecondary">Semana</Typography>
                <Typography variant="h4" sx={{ color: '#ff9800' }}>
                  {estatisticas.semana}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography color="textSecondary">Mês</Typography>
                <Typography variant="h4" sx={{ color: '#2196f3' }}>
                  {estatisticas.mes}
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
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar..."
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
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={filtroPeriodo}
                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                    label="Período"
                  >
                    <MenuItem value="todos">Todos</MenuItem>
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
                  <Grid item xs={12} md={1.5}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Início"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={1.5}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fim"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setFiltroAcao('todos');
                    setFiltroUsuario('todos');
                    setFiltroPeriodo('todos');
                    setFiltro('');
                  }}
                >
                  Limpar
                </Button>
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
                    <TableCell><strong>Data/Hora</strong></TableCell>
                    <TableCell><strong>Usuário</strong></TableCell>
                    <TableCell><strong>Ação</strong></TableCell>
                    <TableCell><strong>Entidade</strong></TableCell>
                    <TableCell><strong>IP</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logsOrdenados.slice(0, 100).map((log, index) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        {log.data ? new Date(log.data).toLocaleString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: '#9c27b0' }}>
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
                      <TableCell>{log.entidade || '-'}</TableCell>
                      <TableCell>{log.ip || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleOpenDetalhes(log)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom Navigation Mobile */}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }} elevation={3}>
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => setBottomNavValue(newValue)}
            showLabels
          >
            <BottomNavigationAction label="Lista" icon={<HistoryIcon />} />
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
                    <Typography variant="body2">{logSelecionado.entidade}</Typography>
                  </Grid>
                )}

                {logSelecionado.entidadeId && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">ID</Typography>
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
                    <Typography variant="caption" color="textSecondary">Dados</Typography>
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

export default Auditoria;
