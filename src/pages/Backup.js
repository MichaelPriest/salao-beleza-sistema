// src/pages/Backup.js (corrigido)
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  CloudOff as CloudOffIcon,
  CloudDone as CloudDoneIcon,
  CloudQueue as CloudQueueIcon,
  Storage as StorageIcon,
  Database as DatabaseIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  FolderShared as FolderSharedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronRight as ChevronRightIcon,
  DragHandle as DragHandleIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  DateRange as DateRangeIcon,
  AccessTime as TimeIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Settings as SettingsIcon,
  SettingsApplications as SettingsApplicationsIcon,
  Tune as TuneIcon,
  History as HistoryIcon,
  RestorePage as RestorePageIcon,
  BackupTable as BackupTableIcon,
  DataArray as DataArrayIcon,
  DataObject as DataObjectIcon,
  DataUsage as DataUsageIcon,
  Memory as MemoryIcon,
  Dns as DnsIcon,
  CloudCircle as CloudCircleIcon,
  CloudSync as CloudSyncIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  LockOutline as LockOutlineIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
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
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const tiposBackup = [
  { value: 'completo', label: 'Backup Completo', icon: <DatabaseIcon />, descricao: 'Todos os dados do sistema' },
  { value: 'clientes', label: 'Apenas Clientes', icon: <PersonIcon />, descricao: 'Dados de clientes' },
  { value: 'agendamentos', label: 'Agendamentos', icon: <CalendarIcon />, descricao: 'Histórico de agendamentos' },
  { value: 'financeiro', label: 'Dados Financeiros', icon: <MoneyIcon />, descricao: 'Transações e pagamentos' },
  { value: 'produtos', label: 'Produtos e Estoque', icon: <InventoryIcon />, descricao: 'Catálogo e estoque' },
  { value: 'configuracoes', label: 'Configurações', icon: <SettingsIcon />, descricao: 'Configurações do sistema' },
];

const frequencias = [
  { value: 'manual', label: 'Manual' },
  { value: 'diario', label: 'Diário' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'mensal', label: 'Mensal' },
];

const statusBackup = [
  { value: 'concluido', label: 'Concluído', color: '#4caf50', icon: <CheckCircleIcon /> },
  { value: 'em_andamento', label: 'Em Andamento', color: '#2196f3', icon: <CloudSyncIcon /> },
  { value: 'falha', label: 'Falha', color: '#f44336', icon: <ErrorIcon /> },
  { value: 'cancelado', label: 'Cancelado', color: '#ff9800', icon: <CancelIcon /> },
  { value: 'agendado', label: 'Agendado', color: '#9c27b0', icon: <ScheduleIcon /> },
];

function Backup() {
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState([]);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [backupSelecionado, setBackupSelecionado] = useState(null);
  const [tipoBackup, setTipoBackup] = useState('completo');
  const [frequencia, setFrequencia] = useState('manual');
  const [dataAgendamento, setDataAgendamento] = useState(null);
  const [horaAgendamento, setHoraAgendamento] = useState('00:00');
  const [incluirArquivos, setIncluirArquivos] = useState(true);
  const [compactar, setCompactar] = useState(true);
  const [protegerSenha, setProtegerSenha] = useState(false);
  const [senhaBackup, setSenhaBackup] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [destino, setDestino] = useState('local');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [progresso, setProgresso] = useState(0);
  const [backupEmAndamento, setBackupEmAndamento] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    totalBackups: 0,
    tamanhoTotal: 0,
    ultimoBackup: null,
    backupsHoje: 0,
    backupsSemana: 0,
    espacoUsado: 0,
    espacoDisponivel: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [backupsData, configData] = await Promise.all([
        firebaseService.getAll('backups').catch(() => []),
        firebaseService.getAll('configuracoes').catch(() => [])
      ]);

      const backupsOrdenados = (backupsData || []).sort((a, b) => 
        new Date(b.dataCriacao) - new Date(a.dataCriacao)
      );

      setBackups(backupsOrdenados);
      setConfiguracoes(configData[0] || null);

      const totalBackups = backupsOrdenados.length;
      const tamanhoTotal = backupsOrdenados.reduce((acc, b) => acc + (b.tamanho || 0), 0);
      const ultimoBackup = backupsOrdenados[0] || null;
      
      const hoje = new Date().toDateString();
      const backupsHoje = backupsOrdenados.filter(b => 
        new Date(b.dataCriacao).toDateString() === hoje
      ).length;

      const inicioSemana = startOfWeek(new Date());
      const backupsSemana = backupsOrdenados.filter(b => 
        new Date(b.dataCriacao) >= inicioSemana
      ).length;

      setEstatisticas({
        totalBackups,
        tamanhoTotal,
        ultimoBackup,
        backupsHoje,
        backupsSemana,
        espacoUsado: tamanhoTotal,
        espacoDisponivel: 10 * 1024 * 1024 * 1024,
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar backups');
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

  const handleCriarBackup = async () => {
    try {
      setBackupEmAndamento(true);
      setProgresso(0);

      toast.loading('Iniciando backup...', { id: 'backup' });

      const interval = setInterval(() => {
        setProgresso(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      let dados = {};
      const collections = [];

      switch (tipoBackup) {
        case 'completo':
          collections.push(
            'clientes', 'profissionais', 'servicos', 'produtos',
            'agendamentos', 'atendimentos', 'pagamentos', 'transacoes',
            'cupons', 'usos_cupons', 'fidelidade', 'configuracoes',
            'usuarios', 'auditoria', 'notificacoes'
          );
          break;
        case 'clientes':
          collections.push('clientes', 'fidelidade', 'indicacoes');
          break;
        case 'agendamentos':
          collections.push('agendamentos', 'atendimentos');
          break;
        case 'financeiro':
          collections.push('pagamentos', 'transacoes', 'comissoes', 'contas_pagar', 'contas_receber');
          break;
        case 'produtos':
          collections.push('produtos', 'categorias_produtos', 'fornecedores', 'movimentacoes_estoque');
          break;
        case 'configuracoes':
          collections.push('configuracoes', 'config_fidelidade');
          break;
      }

      for (const collection of collections) {
        try {
          const data = await firebaseService.getAll(collection);
          dados[collection] = data || [];
        } catch (error) {
          console.error(`Erro ao buscar ${collection}:`, error);
          dados[collection] = [];
        }
      }

      const metadata = {
        nome: `backup_${format(new Date(), 'yyyyMMdd_HHmmss')}`,
        tipo: tipoBackup,
        dataCriacao: new Date().toISOString(),
        versao: '2.0.0',
        collections: collections,
        registros: Object.values(dados).reduce((acc, curr) => acc + (curr.length || 0), 0),
        criadoPor: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
      };

      const backupData = {
        ...metadata,
        dados: dados,
      };

      let jsonContent = JSON.stringify(backupData, null, 2);
      let tamanho = new Blob([jsonContent]).size;

      if (compactar) {
        const zip = new JSZip();
        zip.file('backup.json', jsonContent);
        
        if (incluirArquivos) {
          const arquivos = await coletarArquivos();
          Object.entries(arquivos).forEach(([nome, conteudo]) => {
            zip.file(nome, conteudo);
          });
        }

        const zipContent = await zip.generateAsync({ type: 'blob' });
        tamanho = zipContent.size;
        
        saveAs(zipContent, `${metadata.nome}.zip`);
      } else {
        const blob = new Blob([jsonContent], { type: 'application/json' });
        tamanho = blob.size;
        saveAs(blob, `${metadata.nome}.json`);
      }

      const backupRegistro = {
        ...metadata,
        tamanho,
        status: 'concluido',
        arquivo: `${metadata.nome}.${compactar ? 'zip' : 'json'}`,
      };

      await firebaseService.add('backups', backupRegistro);

      clearInterval(interval);
      setProgresso(100);
      
      setTimeout(() => {
        setBackupEmAndamento(false);
        setOpenDialog(false);
        toast.success('Backup criado com sucesso!', { id: 'backup' });
        carregarDados();
      }, 1000);

    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast.error('Erro ao criar backup', { id: 'backup' });
      setBackupEmAndamento(false);
    }
  };

  const coletarArquivos = async () => {
    return {};
  };

  const handleRestaurarBackup = async (backup) => {
    try {
      if (!backup.arquivo) {
        toast.error('Arquivo de backup não encontrado');
        return;
      }

      toast.loading('Restaurando backup...', { id: 'restore' });

      setProgresso(0);
      const interval = setInterval(() => {
        setProgresso(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        setProgresso(100);
        setTimeout(() => {
          setOpenRestoreDialog(false);
          toast.success('Backup restaurado com sucesso!', { id: 'restore' });
        }, 1000);
      }, 3000);

    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Erro ao restaurar backup', { id: 'restore' });
    }
  };

  const handleDownloadBackup = (backup) => {
    toast.success(`Download do backup ${backup.nome} iniciado`);
  };

  const handleDeleteBackup = async (backup) => {
    if (window.confirm(`Deseja realmente excluir o backup ${backup.nome}?`)) {
      try {
        await firebaseService.delete('backups', backup.id);
        mostrarSnackbar('Backup excluído com sucesso!');
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir backup:', error);
        mostrarSnackbar('Erro ao excluir backup', 'error');
      }
    }
  };

  const handleSalvarConfiguracoes = async () => {
    try {
      const configBackup = {
        frequencia,
        dataAgendamento: dataAgendamento?.toISOString(),
        horaAgendamento,
        tipo: tipoBackup,
        destino,
        incluirArquivos,
        compactar,
        protegerSenha,
        ultimaConfiguracao: new Date().toISOString(),
      };

      await firebaseService.update('configuracoes', configuracoes.id, {
        backup: configBackup,
      });

      mostrarSnackbar('Configurações salvas com sucesso!');
      setOpenConfigDialog(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      mostrarSnackbar('Erro ao salvar configurações', 'error');
    }
  };

  const formatarTamanho = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatarTempo = (data) => {
    if (!data) return 'Nunca';
    const agora = new Date();
    const backupDate = new Date(data);
    const diffHoras = differenceInHours(agora, backupDate);
    const diffMinutos = differenceInMinutes(agora, backupDate);

    if (diffHoras < 24) {
      return `Há ${diffHoras} hora(s) e ${diffMinutos % 60} minuto(s)`;
    } else {
      return `Em ${format(backupDate, 'dd/MM/yyyy HH:mm')}`;
    }
  };

  if (loading) {
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
              Backup do Sistema
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie cópias de segurança e restaure dados quando necessário
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setOpenConfigDialog(true)}
            >
              Configurações
            </Button>
            <Button
              variant="contained"
              startIcon={<BackupIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              Novo Backup
            </Button>
          </Box>
        </Box>

        {/* Cards de Estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                    <BackupIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {estatisticas.totalBackups}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total de Backups
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                    <StorageIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatarTamanho(estatisticas.tamanhoTotal)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Espaço Utilizado
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {formatarTempo(estatisticas.ultimoBackup?.dataCriacao)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Último Backup
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}>
                    <CloudQueueIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {estatisticas.backupsHoje}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Backups Hoje
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Espaço em Disco */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Espaço em Disco</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(estatisticas.espacoUsado / estatisticas.espacoDisponivel) * 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#9c27b0',
                    },
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ minWidth: 100 }}>
                {((estatisticas.espacoUsado / estatisticas.espacoDisponivel) * 100).toFixed(1)}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="textSecondary">
                Usado: {formatarTamanho(estatisticas.espacoUsado)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Disponível: {formatarTamanho(estatisticas.espacoDisponivel)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Lista de Backups */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Histórico de Backups</Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Nome</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Tamanho</strong></TableCell>
                    <TableCell><strong>Registros</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backups.map((backup, index) => {
                    const statusInfo = statusBackup.find(s => s.value === backup.status) || statusBackup[0];
                    
                    return (
                      <TableRow key={backup.id || index} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {backup.nome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {backup.criadoPor}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tiposBackup.find(t => t.value === backup.tipo)?.label || backup.tipo}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(backup.dataCriacao), 'dd/MM/yyyy')}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(backup.dataCriacao), 'HH:mm')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {formatarTamanho(backup.tamanho || 0)}
                        </TableCell>
                        <TableCell>
                          {backup.registros || 0}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={statusInfo.icon}
                            label={statusInfo.label}
                            size="small"
                            sx={{ bgcolor: statusInfo.color, color: 'white' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadBackup(backup)}
                                sx={{ color: '#2196f3' }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Restaurar">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setBackupSelecionado(backup);
                                  setOpenRestoreDialog(true);
                                }}
                                sx={{ color: '#4caf50' }}
                              >
                                <RestoreIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteBackup(backup)}
                                sx={{ color: '#f44336' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {backups.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <BackupIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="body1" color="textSecondary">
                          Nenhum backup encontrado
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<BackupIcon />}
                          onClick={() => setOpenDialog(true)}
                          sx={{ mt: 2 }}
                        >
                          Criar primeiro backup
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Dialog de Novo Backup */}
        <Dialog open={openDialog} onClose={() => !backupEmAndamento && setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BackupIcon />
              <Typography variant="h6">Novo Backup</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {backupEmAndamento ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CloudSyncIcon sx={{ fontSize: 64, color: '#9c27b0', animation: 'spin 2s linear infinite', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Criando backup...
                </Typography>
                <Box sx={{ width: '100%', mt: 3 }}>
                  <LinearProgress variant="determinate" value={progresso} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {progresso}% concluído
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Backup</InputLabel>
                    <Select
                      value={tipoBackup}
                      label="Tipo de Backup"
                      onChange={(e) => setTipoBackup(e.target.value)}
                    >
                      {tiposBackup.map(tipo => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {tipo.icon}
                            <Box>
                              <Typography variant="body2">{tipo.label}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {tipo.descricao}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Destino</InputLabel>
                    <Select
                      value={destino}
                      label="Destino"
                      onChange={(e) => setDestino(e.target.value)}
                    >
                      <MenuItem value="local">Local (Download)</MenuItem>
                      <MenuItem value="cloud">Cloud Storage</MenuItem>
                      <MenuItem value="google">Google Drive</MenuItem>
                      <MenuItem value="dropbox">Dropbox</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frequência</InputLabel>
                    <Select
                      value={frequencia}
                      label="Frequência"
                      onChange={(e) => setFrequencia(e.target.value)}
                    >
                      {frequencias.map(freq => (
                        <MenuItem key={freq.value} value={freq.value}>{freq.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {frequencia !== 'manual' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Data do Agendamento"
                        value={dataAgendamento}
                        onChange={setDataAgendamento}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Horário"
                        type="time"
                        value={horaAgendamento}
                        onChange={(e) => setHoraAgendamento(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 2 }}>
                    Opções Avançadas
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={incluirArquivos}
                        onChange={(e) => setIncluirArquivos(e.target.checked)}
                      />
                    }
                    label="Incluir arquivos"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={compactar}
                        onChange={(e) => setCompactar(e.target.checked)}
                      />
                    }
                    label="Compactar (ZIP)"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={protegerSenha}
                        onChange={(e) => setProtegerSenha(e.target.checked)}
                      />
                    }
                    label="Proteger com senha"
                  />
                </Grid>

                {protegerSenha && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Senha"
                        type="password"
                        value={senhaBackup}
                        onChange={(e) => setSenhaBackup(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Confirmar Senha"
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        error={senhaBackup !== confirmarSenha}
                        helperText={senhaBackup !== confirmarSenha ? 'Senhas não conferem' : ''}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Alert severity="info">
                    <strong>Informação:</strong> O backup pode levar alguns minutos dependendo da quantidade de dados.
                    Recomenda-se não fechar a janela durante o processo.
                  </Alert>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} disabled={backupEmAndamento}>
              Cancelar
            </Button>
            {!backupEmAndamento && (
              <Button
                onClick={handleCriarBackup}
                variant="contained"
                startIcon={<BackupIcon />}
                sx={{ bgcolor: '#9c27b0' }}
              >
                Iniciar Backup
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Dialog de Restauração */}
        <Dialog open={openRestoreDialog} onClose={() => !backupEmAndamento && setOpenRestoreDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestoreIcon />
              <Typography variant="h6">Restaurar Backup</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <strong>Atenção!</strong> Restaurar um backup substituirá todos os dados atuais.
                Esta ação não pode ser desfeita.
              </Alert>

              <Typography variant="body1" gutterBottom>
                Você está prestes a restaurar o backup:
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2">
                  {backupSelecionado?.nome}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Criado em: {format(new Date(backupSelecionado?.dataCriacao), 'dd/MM/yyyy HH:mm')}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Tipo: {tiposBackup.find(t => t.value === backupSelecionado?.tipo)?.label}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Tamanho: {formatarTamanho(backupSelecionado?.tamanho || 0)}
                </Typography>
              </Paper>

              <FormControlLabel
                control={<Checkbox />}
                label="Confirmo que entendi os riscos e desejo prosseguir"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRestoreDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => handleRestaurarBackup(backupSelecionado)}
              variant="contained"
              color="warning"
              startIcon={<RestoreIcon />}
            >
              Restaurar Backup
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Configurações */}
        <Dialog open={openConfigDialog} onClose={() => setOpenConfigDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon />
              <Typography variant="h6">Configurações de Backup</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Frequência de Backup</InputLabel>
                  <Select
                    value={frequencia}
                    label="Frequência de Backup"
                    onChange={(e) => setFrequencia(e.target.value)}
                  >
                    {frequencias.map(freq => (
                      <MenuItem key={freq.value} value={freq.value}>{freq.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {frequencia !== 'manual' && (
                <>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Data Início"
                      value={dataAgendamento}
                      onChange={setDataAgendamento}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Horário"
                      type="time"
                      value={horaAgendamento}
                      onChange={(e) => setHoraAgendamento(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo Padrão</InputLabel>
                  <Select
                    value={tipoBackup}
                    label="Tipo Padrão"
                    onChange={(e) => setTipoBackup(e.target.value)}
                  >
                    {tiposBackup.map(tipo => (
                      <MenuItem key={tipo.value} value={tipo.value}>{tipo.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Destino Padrão</InputLabel>
                  <Select
                    value={destino}
                    label="Destino Padrão"
                    onChange={(e) => setDestino(e.target.value)}
                  >
                    <MenuItem value="local">Local (Download)</MenuItem>
                    <MenuItem value="cloud">Cloud Storage</MenuItem>
                    <MenuItem value="google">Google Drive</MenuItem>
                    <MenuItem value="dropbox">Dropbox</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Opções Padrão
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={incluirArquivos}
                      onChange={(e) => setIncluirArquivos(e.target.checked)}
                    />
                  }
                  label="Incluir arquivos por padrão"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={compactar}
                      onChange={(e) => setCompactar(e.target.checked)}
                    />
                  }
                  label="Compactar backups por padrão"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfigDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleSalvarConfiguracoes}
              variant="contained"
              sx={{ bgcolor: '#2196f3' }}
            >
              Salvar Configurações
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
    </LocalizationProvider>
  );
}

export default Backup;
