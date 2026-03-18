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

// ✅ Função segura para obter a data no formato YYYY-MM-DD
const getDataString = (data) => {
  if (!data) return '';
  try {
    if (typeof data === 'string') {
      return data.split('T')[0];
    }
    if (data instanceof Date) {
      return data.toISOString().split('T')[0];
    }
    if (data?.toDate) {
      return data.toDate().toISOString().split('T')[0];
    }
    return '';
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '';
  }
};

// ✅ Função segura para comparar datas
const compararData = (logData, dataReferencia) => {
  try {
    if (!logData) return false;
    
    let logDataStr = '';
    if (typeof logData === 'string') {
      logDataStr = logData.split('T')[0];
    } else if (logData instanceof Date) {
      logDataStr = logData.toISOString().split('T')[0];
    } else if (logData?.toDate) {
      logDataStr = logData.toDate().toISOString().split('T')[0];
    } else {
      return false;
    }
    
    return logDataStr === dataReferencia;
  } catch (error) {
    console.warn('Erro ao comparar datas:', error);
    return false;
  }
};

// ✅ Função segura para verificar se data é maior ou igual
const dataMaiorOuIgual = (logData, dataReferencia) => {
  try {
    if (!logData || !dataReferencia) return false;
    
    const logDate = new Date(logData);
    const refDate = new Date(dataReferencia);
    
    if (isNaN(logDate.getTime()) || isNaN(refDate.getTime())) return false;
    
    return logDate >= refDate;
  } catch (error) {
    console.warn('Erro ao comparar datas:', error);
    return false;
  }
};

// ✅ Função segura para verificar intervalo de datas
const dataNoIntervalo = (logData, inicio, fim) => {
  try {
    if (!logData || !inicio || !fim) return false;
    
    const logDate = new Date(logData);
    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim + 'T23:59:59');
    
    if (isNaN(logDate.getTime()) || isNaN(inicioDate.getTime()) || isNaN(fimDate.getTime())) return false;
    
    return logDate >= inicioDate && logDate <= fimDate;
  } catch (error) {
    console.warn('Erro ao verificar intervalo:', error);
    return false;
  }
};

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
  
  // 🔥 Estado para usuário atual
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [config, setConfig] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('todos');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [filtroEntidade, setFiltroEntidade] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [dataInicio, setDataInicio] = useState(getDataString(new Date()));
  const [dataFim, setDataFim] = useState(getDataString(new Date()));
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

  // 🔥 Carregar usuário atual
  useEffect(() => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        setUsuarioAtual(JSON.parse(usuarioStr));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    calcularEstatisticas();
  }, [logs]);

  // 🔥 Função para registrar na auditoria
  const registrarAuditoria = async (acao, entidadeId, detalhes, dados = {}) => {
    try {
      await auditoriaService.registrar(acao, {
        entidade: 'auditoria',
        entidadeId,
        detalhes,
        dados: {
          ...dados,
          usuarioId: usuarioAtual?.id,
          usuarioNome: usuarioAtual?.nome,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // 🔥 LOG TÉCNICO
      await firebaseService.log('info', 'Carregando dados de auditoria');
      
      const [logsData, usuariosData, configData] = await Promise.all([
        firebaseService.getAll('auditoria').catch(() => []),
        firebaseService.getAll('usuarios').catch(() => []),
        firebaseService.getAll('configuracoes').catch(() => []),
      ]);
      
      setLogs(logsData || []);
      setUsuarios(usuariosData || []);
      setConfig(configData?.[0] || null);
      
      // 🔥 AUDITORIA
      await registrarAuditoria(
        'carregar_auditoria',
        'listagem',
        'Página de auditoria carregada',
        { totalRegistros: logsData?.length }
      );
      
      // 🔥 LOG TÉCNICO
      await firebaseService.log('success', 'Dados de auditoria carregados', {
        totalLogs: logsData?.length
      });
      
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      
      // 🔥 LOG DE ERRO
      await firebaseService.log('error', 'Erro ao carregar dados de auditoria', {
        error: error.message
      });
      
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
    const hoje = getDataString(new Date());
    const seteDiasAtras = subDays(new Date(), 7).toISOString();
    const trintaDiasAtras = subDays(new Date(), 30).toISOString();

    const stats = {
      total: logs.length,
      hoje: logs.filter(log => compararData(log.data, hoje)).length,
      semana: logs.filter(log => dataMaiorOuIgual(log.data, seteDiasAtras)).length,
      mes: logs.filter(log => dataMaiorOuIgual(log.data, trintaDiasAtras)).length,
      porAcao: {},
      porUsuario: {},
    };

    logs.forEach(log => {
      if (log?.acao) {
        stats.porAcao[log.acao] = (stats.porAcao[log.acao] || 0) + 1;
      }
      if (log?.usuario) {
        stats.porUsuario[log.usuario] = (stats.porUsuario[log.usuario] || 0) + 1;
      }
    });

    setEstatisticas(stats);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `auditoria_${getDataString(new Date())}`,
    onBeforeGetContent: async () => {
      toast.loading('Preparando impressão...', { id: 'print' });
      
      // 🔥 AUDITORIA
      await registrarAuditoria(
        'imprimir_relatorio',
        'impressao',
        'Relatório de auditoria impresso',
        { totalRegistros: logsOrdenados.length }
      );
    },
    onAfterPrint: () => {
      toast.success('Impressão enviada!', { id: 'print' });
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      toast.error('Erro ao imprimir', { id: 'print' });
    }
  });

  const handleExportJSON = async () => {
    try {
      // 🔥 LOG TÉCNICO
      await firebaseService.log('info', 'Exportando auditoria para JSON', {
        totalRegistros: logsFiltrados.length
      });
      
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
      link.download = `auditoria_${getDataString(new Date())}.json`;
      link.click();
      
      // 🔥 AUDITORIA
      await registrarAuditoria(
        'exportar_json',
        'exportacao',
        `Dados exportados para JSON (${logsFiltrados.length} registros)`,
        { formato: 'json', totalRegistros: logsFiltrados.length }
      );
      
      mostrarSnackbar('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      // 🔥 LOG TÉCNICO
      await firebaseService.log('info', 'Exportando auditoria para CSV', {
        totalRegistros: logsFiltrados.length
      });
      
      const headers = ['Data/Hora', 'Usuário', 'Ação', 'Entidade', 'ID', 'IP', 'Detalhes'];
      const data = logsFiltrados.map(log => [
        log.data ? new Date(log.data).toLocaleString('pt-BR') : '',
        log.usuario || 'Sistema',
        acoesColors[log.acao]?.label || log.acao || '-',
        log.entidade || '-',
        log.entidadeId || '-',
        log.ip || '-',
        (log.detalhes || '').replace(/"/g, '""'),
      ]);

      const csvContent = [headers, ...data]
        .map(row => row.map(cell => `"${cell || ''}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `auditoria_${getDataString(new Date())}.csv`;
      link.click();
      
      // 🔥 AUDITORIA
      await registrarAuditoria(
        'exportar_csv',
        'exportacao',
        `Dados exportados para CSV (${logsFiltrados.length} registros)`,
        { formato: 'csv', totalRegistros: logsFiltrados.length }
      );
      
      mostrarSnackbar('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar', 'error');
    }
  };

  const handleLimparLogsAntigos = async () => {
    if (!window.confirm('Tem certeza que deseja limpar logs com mais de 90 dias?')) return;

    try {
      // 🔥 LOG TÉCNICO
      await firebaseService.log('warning', 'Iniciando limpeza de logs antigos');
      
      const noventaDiasAtras = subDays(new Date(), 90).toISOString();
      const logsAntigos = logs.filter(log => dataMaiorOuIgual(noventaDiasAtras, log.data) === false);
      
      for (const log of logsAntigos) {
        if (log?.id) {
          await firebaseService.delete('auditoria', log.id);
        }
      }
      
      // 🔥 AUDITORIA
      await registrarAuditoria(
        'limpar_logs_antigos',
        'limpeza',
        `Limpeza de logs antigos (${logsAntigos.length} registros)`,
        { totalRemovidos: logsAntigos.length, dias: 90 }
      );
      
      toast.success(`${logsAntigos.length} logs antigos removidos!`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      toast.error('Erro ao limpar logs');
    }
  };

  const handleRefresh = async () => {
    // 🔥 LOG TÉCNICO
    await firebaseService.log('info', 'Atualização manual da auditoria');
    await carregarDados();
  };

  const handleFiltroChange = async (tipo, valor) => {
    // 🔥 LOG TÉCNICO (opcional - pode ser removido se gerar muitos logs)
    // await firebaseService.log('debug', 'Filtro alterado', { tipo, valor });
  };

  // ✅ FILTRO CORRIGIDO - sem usar .split diretamente
  const logsFiltrados = logs.filter(log => {
    if (!log) return false;

    // Filtrar por texto - com verificações de tipo
    const textoBusca = filtro.toLowerCase();
    const matchesTexto = filtro === '' || 
      (typeof log.usuario === 'string' && log.usuario.toLowerCase().includes(textoBusca)) ||
      (typeof log.detalhes === 'string' && log.detalhes.toLowerCase().includes(textoBusca)) ||
      (typeof log.ip === 'string' && log.ip.includes(filtro)) ||
      (typeof log.entidadeId === 'string' && log.entidadeId.includes(filtro)) ||
      (typeof log.acao === 'string' && log.acao.toLowerCase().includes(textoBusca)) ||
      (typeof log.entidade === 'string' && log.entidade.toLowerCase().includes(textoBusca));

    // Filtrar por ação
    const matchesAcao = filtroAcao === 'todos' || log.acao === filtroAcao;

    // Filtrar por usuário
    const matchesUsuario = filtroUsuario === 'todos' || 
      (filtroUsuario === 'Sistema' && !log.usuario) ||
      log.usuario === filtroUsuario;

    // Filtrar por entidade
    const matchesEntidade = filtroEntidade === 'todos' || log.entidade === filtroEntidade;

    // Filtrar por período - usando funções seguras
    let matchesPeriodo = true;
    
    if (filtroPeriodo !== 'todos' && log.data) {
      try {
        const hoje = getDataString(new Date());
        
        if (filtroPeriodo === 'hoje') {
          matchesPeriodo = compararData(log.data, hoje);
        } else if (filtroPeriodo === 'ontem') {
          const ontem = getDataString(subDays(new Date(), 1));
          matchesPeriodo = compararData(log.data, ontem);
        } else if (filtroPeriodo === 'semana') {
          const seteDiasAtras = subDays(new Date(), 7);
          matchesPeriodo = dataMaiorOuIgual(log.data, seteDiasAtras);
        } else if (filtroPeriodo === 'mes') {
          const trintaDiasAtras = subDays(new Date(), 30);
          matchesPeriodo = dataMaiorOuIgual(log.data, trintaDiasAtras);
        } else if (filtroPeriodo === 'personalizado' && dataInicio && dataFim) {
          matchesPeriodo = dataNoIntervalo(log.data, dataInicio, dataFim);
        }
      } catch (error) {
        console.warn('Erro ao processar data do log:', error);
        matchesPeriodo = false;
      }
    }

    return matchesTexto && matchesAcao && matchesUsuario && matchesEntidade && matchesPeriodo;
  });

  // Ordenar por data (mais recentes primeiro)
  const logsOrdenados = [...logsFiltrados].sort((a, b) => {
    if (!a?.data) return 1;
    if (!b?.data) return -1;
    try {
      return new Date(b.data) - new Date(a.data);
    } catch {
      return 0;
    }
  });

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDetalhes = async (log) => {
    setLogSelecionado(log);
    setOpenDetalhesDialog(true);
    
    // 🔥 AUDITORIA
    await registrarAuditoria(
      'visualizar_log',
      log.id,
      `Visualização de log de auditoria`,
      { acao: log.acao, usuario: log.usuario }
    );
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
              key={log?.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ListItem
                button
                onClick={() => handleOpenDetalhes(log)}
                sx={{
                  bgcolor: log?.acao === 'erro' ? '#ffebee' : 'white',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: acoesColors[log?.acao]?.color || '#999' }}>
                    {acoesColors[log?.acao]?.icon || <InfoIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2">
                        {log?.usuario || 'Sistema'}
                      </Typography>
                      <Chip
                        label={acoesColors[log?.acao]?.label || log?.acao || '-'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6rem',
                          bgcolor: `${acoesColors[log?.acao]?.color}20`,
                          color: acoesColors[log?.acao]?.color,
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {log?.data ? new Date(log.data).toLocaleString('pt-BR') : '-'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {log?.detalhes}
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
              onChange={(e) => {
                setFiltro(e.target.value);
                handleFiltroChange('texto', e.target.value);
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Ação</InputLabel>
              <Select
                value={filtroAcao}
                onChange={(e) => {
                  setFiltroAcao(e.target.value);
                  handleFiltroChange('acao', e.target.value);
                }}
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
                onChange={(e) => {
                  setFiltroUsuario(e.target.value);
                  handleFiltroChange('usuario', e.target.value);
                }}
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
                onChange={(e) => {
                  setFiltroPeriodo(e.target.value);
                  handleFiltroChange('periodo', e.target.value);
                }}
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
                  onChange={(e) => {
                    setDataInicio(e.target.value);
                    handleFiltroChange('dataInicio', e.target.value);
                  }}
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
                  onChange={(e) => {
                    setDataFim(e.target.value);
                    handleFiltroChange('dataFim', e.target.value);
                  }}
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
            <IconButton onClick={handleRefresh}>
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
              onClick={handleRefresh}
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
                  onChange={(e) => {
                    setFiltro(e.target.value);
                    handleFiltroChange('texto', e.target.value);
                  }}
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
                    onChange={(e) => {
                      setFiltroAcao(e.target.value);
                      handleFiltroChange('acao', e.target.value);
                    }}
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
                    onChange={(e) => {
                      setFiltroUsuario(e.target.value);
                      handleFiltroChange('usuario', e.target.value);
                    }}
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
                    onChange={(e) => {
                      setFiltroPeriodo(e.target.value);
                      handleFiltroChange('periodo', e.target.value);
                    }}
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
                      onChange={(e) => {
                        setDataInicio(e.target.value);
                        handleFiltroChange('dataInicio', e.target.value);
                      }}
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
                      onChange={(e) => {
                        setDataFim(e.target.value);
                        handleFiltroChange('dataFim', e.target.value);
                      }}
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
                    <TableRow key={log?.id || index} hover>
                      <TableCell>
                        {log?.data ? new Date(log.data).toLocaleString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: '#9c27b0' }}>
                            {log?.usuario?.charAt(0) || 'S'}
                          </Avatar>
                          {log?.usuario || 'Sistema'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={acoesColors[log?.acao]?.icon}
                          label={acoesColors[log?.acao]?.label || log?.acao || '-'}
                          size="small"
                          sx={{
                            bgcolor: `${acoesColors[log?.acao]?.color}20`,
                            color: acoesColors[log?.acao]?.color,
                          }}
                        />
                      </TableCell>
                      <TableCell>{log?.entidade || '-'}</TableCell>
                      <TableCell>{log?.ip || '-'}</TableCell>
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
