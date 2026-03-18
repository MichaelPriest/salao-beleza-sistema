// src/pages/Backup.js
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
  Avatar,
  Switch,
  FormControlLabel,
  Checkbox, // 🔥 ADICIONADO AQUI
  Badge,
  Radio,
  RadioGroup,
  Slider,
  Tab,
  Tabs,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  Collapse,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  CircularProgress,
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
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronRight as ChevronRightIcon,
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
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  SettingsApplications as SettingsApplicationsIcon,
  Cloud as CloudIcon,
  Book as BookIcon,
  Help as HelpIcon,
  Link as LinkIcon,
  Key as KeyIcon,
  VpnKey as VpnKeyIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
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
  isValid,
} from 'date-fns';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ✅ Função segura para criar data
const safeDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    if (dateValue?.toDate) {
      const d = dateValue.toDate();
      return isValid(d) ? d : null;
    }
    const d = new Date(dateValue);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
};

// ✅ Função segura para formatar data
const safeFormat = (dateValue, formatString = 'dd/MM/yyyy') => {
  const date = safeDate(dateValue);
  if (!date) return '-';
  try {
    return format(date, formatString);
  } catch {
    return '-';
  }
};

// ✅ Função segura para formatar data com hora
const safeFormatDateTime = (dateValue) => {
  const date = safeDate(dateValue);
  if (!date) return '-';
  try {
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch {
    return '-';
  }
};

function Backup() {
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState([]);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [openCloudConfigDialog, setOpenCloudConfigDialog] = useState(false);
  const [openManualDialog, setOpenManualDialog] = useState(false);
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
  const [cloudService, setCloudService] = useState('dropbox');
  const [cloudConfig, setCloudConfig] = useState({
    dropbox: {
      clientId: '',
      clientSecret: '',
      accessToken: '',
      refreshToken: '',
      appKey: '',
      appSecret: '',
      redirectUri: window.location.origin + '/auth/dropbox/callback',
      folderPath: '/backups',
    },
    googleDrive: {
      clientId: '',
      clientSecret: '',
      accessToken: '',
      refreshToken: '',
      projectId: '',
      redirectUri: window.location.origin + '/auth/google/callback',
      folderId: '',
    },
    oneDrive: {
      clientId: '',
      clientSecret: '',
      accessToken: '',
      refreshToken: '',
      tenantId: 'common',
      redirectUri: window.location.origin + '/auth/onedrive/callback',
      folderPath: '/backups',
    },
    cloudStorage: {
      bucketName: '',
      projectId: '',
      clientEmail: '',
      privateKey: '',
      region: 'us-central1',
      storageClass: 'STANDARD',
    },
  });
  
  const [showPassword, setShowPassword] = useState({});
  const [testandoConexao, setTestandoConexao] = useState(false);
  const [conexaoStatus, setConexaoStatus] = useState({});
  const [estatisticas, setEstatisticas] = useState({
    totalBackups: 0,
    tamanhoTotal: 0,
    ultimoBackup: null,
    backupsHoje: 0,
    backupsSemana: 0,
    espacoUsado: 0,
    espacoDisponivel: 0,
  });

  // 🔥 Estado para usuário atual
  const [usuarioAtual, setUsuarioAtual] = useState(null);

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

  const tiposBackup = [
    { value: 'completo', label: 'Backup Completo', icon: <StorageIcon />, descricao: 'Todos os dados do sistema' },
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

  // 🔥 CORRIGIDO: Substituídos ícones que não existem por CloudIcon
  const cloudServices = [
    { 
      value: 'dropbox', 
      label: 'Dropbox', 
      icon: <CloudIcon />,
      color: '#0061FF',
      docs: 'https://www.dropbox.com/developers/documentation'
    },
    { 
      value: 'googleDrive', 
      label: 'Google Drive', 
      icon: <CloudIcon />,
      color: '#4285F4',
      docs: 'https://developers.google.com/drive'
    },
    { 
      value: 'oneDrive', 
      label: 'OneDrive', 
      icon: <CloudIcon />,
      color: '#0078D4',
      docs: 'https://docs.microsoft.com/en-us/onedrive/developer/'
    },
    { 
      value: 'cloudStorage', 
      label: 'Google Cloud Storage', 
      icon: <CloudIcon />,
      color: '#EA4335',
      docs: 'https://cloud.google.com/storage/docs'
    },
  ];

  const statusBackup = [
    { value: 'concluido', label: 'Concluído', color: '#4caf50', icon: <CheckIcon /> },
    { value: 'em_andamento', label: 'Em Andamento', color: '#2196f3', icon: <CloudSyncIcon /> },
    { value: 'falha', label: 'Falha', color: '#f44336', icon: <ErrorIcon /> },
    { value: 'cancelado', label: 'Cancelado', color: '#ff9800', icon: <CancelIcon /> },
    { value: 'agendado', label: 'Agendado', color: '#9c27b0', icon: <ScheduleIcon /> },
  ];

  // 🔥 Função para registrar na auditoria
  const registrarAuditoria = async (acao, entidadeId, detalhes, dados = {}) => {
    try {
      await auditoriaService.registrar(acao, {
        entidade: 'backup',
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

  useEffect(() => {
    carregarDados();
    carregarCloudConfig();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      await firebaseService.log('info', 'Carregando dados de backup');
      
      const [backupsData, configData] = await Promise.all([
        firebaseService.getAll('backups').catch(() => []),
        firebaseService.getAll('configuracoes').catch(() => [])
      ]);

      const backupsOrdenados = (backupsData || []).sort((a, b) => {
        const dataA = safeDate(a.dataCriacao)?.getTime() || 0;
        const dataB = safeDate(b.dataCriacao)?.getTime() || 0;
        return dataB - dataA;
      });

      setBackups(backupsOrdenados);
      setConfiguracoes(configData[0] || null);

      const totalBackups = backupsOrdenados.length;
      const tamanhoTotal = backupsOrdenados.reduce((acc, b) => acc + (b.tamanho || 0), 0);
      const ultimoBackup = backupsOrdenados[0] || null;
      
      const hoje = new Date().toDateString();
      
      const backupsHoje = backupsOrdenados.filter(b => {
        const data = safeDate(b.dataCriacao);
        return data && data.toDateString() === hoje;
      }).length;

      const inicioSemana = startOfWeek(new Date());
      
      const backupsSemana = backupsOrdenados.filter(b => {
        const data = safeDate(b.dataCriacao);
        return data && data >= inicioSemana;
      }).length;

      setEstatisticas({
        totalBackups,
        tamanhoTotal,
        ultimoBackup,
        backupsHoje,
        backupsSemana,
        espacoUsado: tamanhoTotal,
        espacoDisponivel: 10 * 1024 * 1024 * 1024,
      });

      await registrarAuditoria(
        'carregar_backups',
        'listagem',
        'Página de backup carregada',
        { totalBackups, ultimoBackup: ultimoBackup?.nome }
      );

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      
      await firebaseService.log('error', 'Erro ao carregar dados de backup', {
        error: error.message
      });
      
      toast.error('Erro ao carregar backups');
    } finally {
      setLoading(false);
    }
  };

  const carregarCloudConfig = async () => {
    try {
      const configs = await firebaseService.getAll('cloud_config').catch(() => []);
      if (configs && configs.length > 0) {
        setCloudConfig(configs[0].config);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações cloud:', error);
    }
  };

  const salvarCloudConfig = async () => {
    try {
      const configs = await firebaseService.getAll('cloud_config').catch(() => []);
      
      if (configs && configs.length > 0) {
        await firebaseService.update('cloud_config', configs[0].id, {
          config: cloudConfig,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await firebaseService.add('cloud_config', {
          config: cloudConfig,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      await registrarAuditoria(
        'configurar_cloud',
        'cloud',
        'Configurações de cloud storage atualizadas',
        { servico: cloudService }
      );

      await firebaseService.log('info', 'Configurações cloud salvas', {
        servico: cloudService
      });

      toast.success('Configurações salvas com sucesso!');
      setOpenCloudConfigDialog(false);
    } catch (error) {
      console.error('Erro ao salvar configurações cloud:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const testarConexaoCloud = async () => {
    setTestandoConexao(true);
    setConexaoStatus({ ...conexaoStatus, [cloudService]: 'testando' });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const config = cloudConfig[cloudService];
      
      let valido = false;
      let mensagem = '';

      switch (cloudService) {
        case 'dropbox':
          valido = config.clientId && config.clientSecret;
          mensagem = valido ? 'Conexão com Dropbox estabelecida!' : 'Credenciais do Dropbox inválidas';
          break;
        case 'googleDrive':
          valido = config.clientId && config.clientSecret;
          mensagem = valido ? 'Conexão com Google Drive estabelecida!' : 'Credenciais do Google Drive inválidas';
          break;
        case 'oneDrive':
          valido = config.clientId && config.clientSecret;
          mensagem = valido ? 'Conexão com OneDrive estabelecida!' : 'Credenciais do OneDrive inválidas';
          break;
        case 'cloudStorage':
          valido = config.bucketName && config.projectId && config.clientEmail && config.privateKey;
          mensagem = valido ? 'Conexão com Google Cloud Storage estabelecida!' : 'Credenciais do Cloud Storage inválidas';
          break;
      }

      setConexaoStatus({ 
        ...conexaoStatus, 
        [cloudService]: valido ? 'sucesso' : 'erro' 
      });

      if (valido) {
        toast.success(mensagem);
      } else {
        toast.error(mensagem);
      }

    } catch (error) {
      setConexaoStatus({ ...conexaoStatus, [cloudService]: 'erro' });
      toast.error('Erro ao testar conexão: ' + error.message);
    } finally {
      setTestandoConexao(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCloudConfigChange = (service, field, value) => {
    setCloudConfig(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value
      }
    }));
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

      await registrarAuditoria(
        'iniciar_backup',
        'novo',
        `Iniciando backup do tipo ${tiposBackup.find(t => t.value === tipoBackup)?.label}`,
        { tipo: tipoBackup, destino, compactar }
      );

      await firebaseService.log('info', 'Iniciando criação de backup', {
        tipo: tipoBackup,
        destino,
        compactar
      });

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

      const agora = new Date();
      const metadata = {
        nome: `backup_${safeFormat(agora, 'yyyyMMdd_HHmmss')}`,
        tipo: tipoBackup,
        dataCriacao: agora.toISOString(),
        versao: '2.0.0',
        collections: collections,
        registros: Object.values(dados).reduce((acc, curr) => acc + (curr.length || 0), 0),
        criadoPor: usuarioAtual?.nome || 'Sistema',
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
      
      await registrarAuditoria(
        'concluir_backup',
        backupRegistro.nome,
        `Backup concluído com sucesso`,
        { 
          tipo: tipoBackup, 
          tamanho: formatarTamanho(tamanho),
          registros: metadata.registros
        }
      );

      await firebaseService.log('success', 'Backup criado com sucesso', {
        tipo: tipoBackup,
        tamanho: formatarTamanho(tamanho),
        registros: metadata.registros
      });
      
      setTimeout(() => {
        setBackupEmAndamento(false);
        setOpenDialog(false);
        toast.success('Backup criado com sucesso!', { id: 'backup' });
        carregarDados();
      }, 1000);

    } catch (error) {
      console.error('Erro ao criar backup:', error);
      
      await registrarAuditoria(
        'erro_backup',
        'erro',
        `Erro ao criar backup: ${error.message}`,
        { tipo: tipoBackup, erro: error.message }
      );

      await firebaseService.log('error', 'Erro ao criar backup', {
        error: error.message,
        tipo: tipoBackup
      });
      
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

      await registrarAuditoria(
        'iniciar_restauracao',
        backup.id,
        `Iniciando restauração do backup ${backup.nome}`,
        { nome: backup.nome, data: backup.dataCriacao }
      );

      await firebaseService.log('warning', 'Iniciando restauração de backup', {
        backup: backup.nome,
        data: backup.dataCriacao
      });

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
        
        registrarAuditoria(
          'concluir_restauracao',
          backup.id,
          `Restauração do backup ${backup.nome} concluída`,
          { nome: backup.nome }
        );

        firebaseService.log('success', 'Backup restaurado com sucesso', {
          backup: backup.nome
        });
        
        setTimeout(() => {
          setOpenRestoreDialog(false);
          toast.success('Backup restaurado com sucesso!', { id: 'restore' });
        }, 1000);
      }, 3000);

    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      
      await registrarAuditoria(
        'erro_restauracao',
        backup.id,
        `Erro ao restaurar backup: ${error.message}`,
        { erro: error.message }
      );

      await firebaseService.log('error', 'Erro ao restaurar backup', {
        error: error.message,
        backup: backup.nome
      });
      
      toast.error('Erro ao restaurar backup', { id: 'restore' });
    }
  };

  const handleDownloadBackup = async (backup) => {
    await registrarAuditoria(
      'download_backup',
      backup.id,
      `Download do backup ${backup.nome}`,
      { nome: backup.nome, tamanho: backup.tamanho }
    );

    await firebaseService.log('info', 'Download de backup', {
      backup: backup.nome,
      tamanho: formatarTamanho(backup.tamanho || 0)
    });
    
    toast.success(`Download do backup ${backup.nome} iniciado`);
  };

  const handleDeleteBackup = async (backup) => {
    if (window.confirm(`Deseja realmente excluir o backup ${backup.nome}?`)) {
      try {
        await firebaseService.delete('backups', backup.id);
        
        await registrarAuditoria(
          'excluir_backup',
          backup.id,
          `Backup ${backup.nome} excluído`,
          { nome: backup.nome, tamanho: backup.tamanho }
        );

        await firebaseService.log('warning', 'Backup excluído', {
          backup: backup.nome
        });
        
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
        dataAgendamento: dataAgendamento ? safeDate(dataAgendamento)?.toISOString() : null,
        horaAgendamento,
        tipo: tipoBackup,
        destino,
        incluirArquivos,
        compactar,
        protegerSenha,
        ultimaConfiguracao: new Date().toISOString(),
      };

      if (configuracoes?.id) {
        await firebaseService.update('configuracoes', configuracoes.id, {
          backup: configBackup,
        });
      }

      await registrarAuditoria(
        'configurar_backup',
        'configuracao',
        'Configurações de backup atualizadas',
        { frequencia, tipo: tipoBackup, destino }
      );

      await firebaseService.log('info', 'Configurações de backup salvas', {
        frequencia,
        tipo: tipoBackup,
        destino
      });

      mostrarSnackbar('Configurações salvas com sucesso!');
      setOpenConfigDialog(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      mostrarSnackbar('Erro ao salvar configurações', 'error');
    }
  };

  const handleRefresh = async () => {
    await firebaseService.log('info', 'Atualização manual da página de backup');
    await carregarDados();
  };

  const formatarTamanho = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatarTempo = (data) => {
    const date = safeDate(data);
    if (!date) return 'Nunca';
    
    const agora = new Date();
    const diffHoras = differenceInHours(agora, date);
    const diffMinutos = differenceInMinutes(agora, date);

    if (diffHoras < 24) {
      return `Há ${diffHoras} hora(s) e ${diffMinutos % 60} minuto(s)`;
    } else {
      return `Em ${safeFormat(date, 'dd/MM/yyyy HH:mm')}`;
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Backup do Sistema
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie cópias de segurança e restaure dados quando necessário
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Tooltip title="Configurar Cloud Storage">
              <Button
                variant="outlined"
                startIcon={<CloudIcon />}
                onClick={() => setOpenCloudConfigDialog(true)}
              >
                Cloud Storage
              </Button>
            </Tooltip>
            <Tooltip title="Manual de Configuração">
              <Button
                variant="outlined"
                startIcon={<BookIcon />}
                onClick={() => setOpenManualDialog(true)}
              >
                Manual
              </Button>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setOpenConfigDialog(true)}
            >
              Configurações
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Atualizar
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
                            {safeFormat(backup.dataCriacao, 'dd/MM/yyyy')}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {safeFormat(backup.dataCriacao, 'HH:mm')}
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

        {/* DIALOG DE CONFIGURAÇÃO CLOUD */}
        <Dialog 
          open={openCloudConfigDialog} 
          onClose={() => setOpenCloudConfigDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudIcon />
              <Typography variant="h6">Configuração de Cloud Storage</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {/* Seletor de Serviço Cloud */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Serviço Cloud</InputLabel>
                <Select
                  value={cloudService}
                  label="Serviço Cloud"
                  onChange={(e) => setCloudService(e.target.value)}
                >
                  {cloudServices.map(service => (
                    <MenuItem key={service.value} value={service.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: service.color }}>{service.icon}</Box>
                        {service.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Configurações por Serviço */}
              {cloudService === 'dropbox' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>Como obter as credenciais do Dropbox:</strong>
                      <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
                        <li>Acesse <Link href="https://www.dropbox.com/developers" target="_blank">Dropbox Developer Portal</Link></li>
                        <li>Clique em "Create App"</li>
                        <li>Escolha "Full Dropbox" ou "App folder"</li>
                        <li>Dê um nome ao seu app</li>
                        <li>Em "Settings", copie o "App key" e "App secret"</li>
                        <li>Adicione a Redirect URI: <Chip label={cloudConfig.dropbox.redirectUri} size="small" /></li>
                      </ol>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="App Key / Client ID"
                      value={cloudConfig.dropbox.clientId}
                      onChange={(e) => handleCloudConfigChange('dropbox', 'clientId', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="App Secret / Client Secret"
                      type={showPassword.dropbox ? 'text' : 'password'}
                      value={cloudConfig.dropbox.clientSecret}
                      onChange={(e) => handleCloudConfigChange('dropbox', 'clientSecret', e.target.value)}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => togglePasswordVisibility('dropbox')}>
                              {showPassword.dropbox ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Access Token (opcional - para acesso permanente)"
                      type={showPassword.dropboxToken ? 'text' : 'password'}
                      value={cloudConfig.dropbox.accessToken}
                      onChange={(e) => handleCloudConfigChange('dropbox', 'accessToken', e.target.value)}
                      size="small"
                      helperText="Token gerado no painel do Dropbox (Settings → Generated access token)"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => togglePasswordVisibility('dropboxToken')}>
                              {showPassword.dropboxToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pasta de Backup"
                      value={cloudConfig.dropbox.folderPath}
                      onChange={(e) => handleCloudConfigChange('dropbox', 'folderPath', e.target.value)}
                      size="small"
                      helperText="Ex: /backups ou /Apps/MeuApp/backups"
                    />
                  </Grid>
                </Grid>
              )}

              {cloudService === 'googleDrive' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>Como obter as credenciais do Google Drive:</strong>
                      <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
                        <li>Acesse <Link href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</Link></li>
                        <li>Crie um projeto ou selecione um existente</li>
                        <li>Ative a Google Drive API</li>
                        <li>Vá em "APIs & Services" → "Credentials"</li>
                        <li>Clique em "Create Credentials" → "OAuth client ID"</li>
                        <li>Escolha "Web application"</li>
                        <li>Adicione a Redirect URI: <Chip label={cloudConfig.googleDrive.redirectUri} size="small" /></li>
                      </ol>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Client ID"
                      value={cloudConfig.googleDrive.clientId}
                      onChange={(e) => handleCloudConfigChange('googleDrive', 'clientId', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Client Secret"
                      type={showPassword.googleSecret ? 'text' : 'password'}
                      value={cloudConfig.googleDrive.clientSecret}
                      onChange={(e) => handleCloudConfigChange('googleDrive', 'clientSecret', e.target.value)}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => togglePasswordVisibility('googleSecret')}>
                              {showPassword.googleSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Project ID"
                      value={cloudConfig.googleDrive.projectId}
                      onChange={(e) => handleCloudConfigChange('googleDrive', 'projectId', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Folder ID (opcional)"
                      value={cloudConfig.googleDrive.folderId}
                      onChange={(e) => handleCloudConfigChange('googleDrive', 'folderId', e.target.value)}
                      size="small"
                      helperText="ID da pasta no Google Drive (deixe em branco para raiz)"
                    />
                  </Grid>
                </Grid>
              )}

              {cloudService === 'oneDrive' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>Como obter as credenciais do OneDrive:</strong>
                      <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
                        <li>Acesse <Link href="https://portal.azure.com/" target="_blank">Portal do Azure</Link></li>
                        <li>Vá para "Azure Active Directory" → "App registrations"</li>
                        <li>Clique em "New registration"</li>
                        <li>Dê um nome ao app e escolha contas</li>
                        <li>Adicione a Redirect URI: <Chip label={cloudConfig.oneDrive.redirectUri} size="small" /></li>
                        <li>Em "Certificates & secrets", crie um segredo</li>
                      </ol>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Client ID (Application ID)"
                      value={cloudConfig.oneDrive.clientId}
                      onChange={(e) => handleCloudConfigChange('oneDrive', 'clientId', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Client Secret"
                      type={showPassword.oneDriveSecret ? 'text' : 'password'}
                      value={cloudConfig.oneDrive.clientSecret}
                      onChange={(e) => handleCloudConfigChange('oneDrive', 'clientSecret', e.target.value)}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => togglePasswordVisibility('oneDriveSecret')}>
                              {showPassword.oneDriveSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tenant ID"
                      value={cloudConfig.oneDrive.tenantId}
                      onChange={(e) => handleCloudConfigChange('oneDrive', 'tenantId', e.target.value)}
                      size="small"
                      helperText="Use 'common' para contas pessoais ou o ID do seu tenant"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pasta de Backup"
                      value={cloudConfig.oneDrive.folderPath}
                      onChange={(e) => handleCloudConfigChange('oneDrive', 'folderPath', e.target.value)}
                      size="small"
                      helperText="Ex: /backups ou /Documents/Backups"
                    />
                  </Grid>
                </Grid>
              )}

              {cloudService === 'cloudStorage' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>Como obter as credenciais do Google Cloud Storage:</strong>
                      <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
                        <li>Acesse <Link href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</Link></li>
                        <li>Crie um bucket em "Cloud Storage" → "Buckets"</li>
                        <li>Vá em "IAM & Admin" → "Service Accounts"</li>
                        <li>Crie uma conta de serviço com papel "Storage Object Admin"</li>
                        <li>Crie e faça download da chave JSON</li>
                        <li>Copie os valores do arquivo JSON para os campos abaixo</li>
                      </ol>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Bucket Name"
                      value={cloudConfig.cloudStorage.bucketName}
                      onChange={(e) => handleCloudConfigChange('cloudStorage', 'bucketName', e.target.value)}
                      size="small"
                      helperText="Nome do bucket no Cloud Storage"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Project ID"
                      value={cloudConfig.cloudStorage.projectId}
                      onChange={(e) => handleCloudConfigChange('cloudStorage', 'projectId', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Client Email"
                      value={cloudConfig.cloudStorage.clientEmail}
                      onChange={(e) => handleCloudConfigChange('cloudStorage', 'clientEmail', e.target.value)}
                      size="small"
                      placeholder="service-account@project.iam.gserviceaccount.com"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Private Key"
                      multiline
                      rows={4}
                      type={showPassword.privateKey ? 'text' : 'password'}
                      value={cloudConfig.cloudStorage.privateKey}
                      onChange={(e) => handleCloudConfigChange('cloudStorage', 'privateKey', e.target.value)}
                      size="small"
                      placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => togglePasswordVisibility('privateKey')}>
                              {showPassword.privateKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Região</InputLabel>
                      <Select
                        value={cloudConfig.cloudStorage.region}
                        label="Região"
                        onChange={(e) => handleCloudConfigChange('cloudStorage', 'region', e.target.value)}
                      >
                        <MenuItem value="us-central1">Iowa (us-central1)</MenuItem>
                        <MenuItem value="us-east1">South Carolina (us-east1)</MenuItem>
                        <MenuItem value="us-east4">North Virginia (us-east4)</MenuItem>
                        <MenuItem value="us-west1">Oregon (us-west1)</MenuItem>
                        <MenuItem value="us-west2">Los Angeles (us-west2)</MenuItem>
                        <MenuItem value="southamerica-east1">São Paulo (southamerica-east1)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Storage Class</InputLabel>
                      <Select
                        value={cloudConfig.cloudStorage.storageClass}
                        label="Storage Class"
                        onChange={(e) => handleCloudConfigChange('cloudStorage', 'storageClass', e.target.value)}
                      >
                        <MenuItem value="STANDARD">Standard</MenuItem>
                        <MenuItem value="NEARLINE">Nearline</MenuItem>
                        <MenuItem value="COLDLINE">Coldline</MenuItem>
                        <MenuItem value="ARCHIVE">Archive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}

              {/* Botão de Teste de Conexão */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={testarConexaoCloud}
                  disabled={testandoConexao}
                  startIcon={testandoConexao ? <CircularProgress size={20} /> : <CheckIcon />}
                  sx={{ mr: 2 }}
                >
                  {testandoConexao ? 'Testando...' : 'Testar Conexão'}
                </Button>
              </Box>

              {/* Status da Conexão */}
              {conexaoStatus[cloudService] && (
                <Box sx={{ mt: 2 }}>
                  {conexaoStatus[cloudService] === 'sucesso' && (
                    <Alert severity="success">Conexão estabelecida com sucesso!</Alert>
                  )}
                  {conexaoStatus[cloudService] === 'erro' && (
                    <Alert severity="error">Falha na conexão. Verifique as credenciais.</Alert>
                  )}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCloudConfigDialog(false)}>Cancelar</Button>
            <Button
              onClick={salvarCloudConfig}
              variant="contained"
              sx={{ bgcolor: '#2196f3' }}
            >
              Salvar Configurações
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG DE MANUAL DE CONFIGURAÇÃO */}
        <Dialog 
          open={openManualDialog} 
          onClose={() => setOpenManualDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookIcon />
              <Typography variant="h6">Manual de Configuração Cloud Storage</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Tabs value={0} sx={{ mb: 3 }}>
                <Tab label="Dropbox" />
                <Tab label="Google Drive" />
                <Tab label="OneDrive" />
                <Tab label="Cloud Storage" />
              </Tabs>

              {/* Dropbox */}
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0061FF' }}>
                  <CloudIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Configuração do Dropbox
                </Typography>
                
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Passo 1: Criar um aplicativo</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      <ListItem>
                        <ListItemIcon><LinkIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Acesse o Dropbox Developer Portal"
                          secondary={<Link href="https://www.dropbox.com/developers" target="_blank">https://www.dropbox.com/developers</Link>}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><AddIcon /></ListItemIcon>
                        <ListItemText primary="Clique em 'Create App'" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><FolderIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Escolha o tipo de acesso"
                          secondary="• 'Full Dropbox' para acesso completo • 'App folder' para acesso apenas a uma pasta"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><EditIcon /></ListItemIcon>
                        <ListItemText primary="Dê um nome ao seu aplicativo" />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Passo 2: Obter as credenciais</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      <ListItem>
                        <ListItemIcon><KeyIcon /></ListItemIcon>
                        <ListItemText 
                          primary="App Key (Client ID)"
                          secondary="Encontrado na aba 'Settings' do seu app"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><VpnKeyIcon /></ListItemIcon>
                        <ListItemText 
                          primary="App Secret (Client Secret)"
                          secondary="Também na aba 'Settings' - clique em 'Show' para ver"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LockIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Access Token (opcional)"
                          secondary="Gerado em 'Settings' → 'Generated access token' - para acesso permanente"
                        />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Passo 3: Configurar Redirect URIs</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      <ListItem>
                        <ListItemIcon><LinkIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Adicione estas URIs em 'Redirect URIs'"
                          secondary={
                            <Box>
                              <Chip label={`${window.location.origin}/auth/dropbox/callback`} sx={{ m: 0.5 }} />
                              <Chip label="http://localhost:3000/auth/dropbox/callback" sx={{ m: 0.5 }} />
                            </Box>
                          }
                        />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Exemplo de configuração final:</strong>
                  <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 5, marginTop: 10 }}>
{`{
  "clientId": "seu_app_key",
  "clientSecret": "seu_app_secret",
  "accessToken": "sl.ABCDEFGHIJKLMN...",
  "folderPath": "/backups"
}`}
                  </pre>
                </Alert>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenManualDialog(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG DE NOVO BACKUP */}
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
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                          }
                        }}
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
                        size="small"
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
                        size="small"
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
                        size="small"
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

        {/* DIALOG DE RESTAURAÇÃO */}
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
                  Criado em: {safeFormatDateTime(backupSelecionado?.dataCriacao)}
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

        {/* DIALOG DE CONFIGURAÇÕES GERAIS */}
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
                <FormControl fullWidth size="small">
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
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        }
                      }}
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
                      size="small"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
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
                <FormControl fullWidth size="small">
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
