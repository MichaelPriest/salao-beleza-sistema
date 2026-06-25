// src/pages/ModernConfiguracoes.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Chip,
  Snackbar,
  Avatar,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Save as SaveIcon,
  Business as BusinessIcon,
  AccessTime as TimeIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Backup as BackupIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  DeleteSweep as CleanIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  CardGiftcard as GiftIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  History as HistoryIcon,
  NotificationsActive as NotificationsActiveIcon,
  LocalShipping as ShippingIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { masks, MaskedInput } from '../utils/plugins';
import { backupService } from '../services/backupService';
import { collection, getDocs, deleteDoc, doc, writeBatch, db } from '../services/firebase';
import SaasGestao from './SaasGestao';
import { notificarFidelidadeConfigAtualizada } from '../hooks/useFidelidadeAtiva';

// Componente de loading personalizado
const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <BusinessIcon sx={{ fontSize: 60, color: '#9c27b0' }} />
    </motion.div>
  </Box>
);

const withTimeout = (promise, timeoutMs, fallbackValue, timeoutMessage) => {
  let timeoutId;
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(timeoutMessage);
      resolve(fallbackValue);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};


const CONFIG_TAB_INDEX = {
  salao: 0,
  horario: 1,
  notificacoes: 2,
  aparencia: 3,
  fidelidade: 4,
  backup: 5,
  limpeza: 6,
  empresa: 7,
  painelChamada: 8,
};

const EMPRESA_TAB_INDEX = {
  dados: 0,
  empresa: 0,
  unidades: 1,
  assinatura: 3,
  cobranca: 4,
  site: 5,
};

const getConfigTabFromSearch = (search = '') => {
  const tab = new URLSearchParams(search).get('tab');
  return CONFIG_TAB_INDEX[tab] ?? 0;
};

const getEmpresaTabFromSearch = (search = '') => {
  const tab = new URLSearchParams(search).get('empresaTab');
  const parsedTab = Number(tab || 0);
  return EMPRESA_TAB_INDEX[tab] ?? (Number.isNaN(parsedTab) ? 0 : parsedTab);
};


const getUsuarioAtual = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario') || '{}');
  } catch {
    return {};
  }
};

const usuarioEhSuperadmin = (usuario = {}) => ['superadmin', 'super_admin', 'saas_admin'].includes(String(usuario.cargo || usuario.role || usuario.perfil || '').toLowerCase())
  || usuario.superadmin === true
  || usuario.isSuperAdmin === true;

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Componente para configuração de níveis
const ConfiguracaoNivel = ({ nivel, dados, onUpdate }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: dados?.corFundo || '#f5f5f5' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: dados?.cor || '#999', width: 32, height: 32 }}>
              <TrophyIcon sx={{ fontSize: 18, color: '#fff' }} />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: dados?.cor || '#999', textTransform: 'uppercase' }}>
              {nivel}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Pontos Mínimos"
            type="number"
            size="small"
            value={dados?.minimo || 0}
            onChange={(e) => onUpdate(nivel, 'minimo', parseInt(e.target.value) || 0)}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Multiplicador"
            type="number"
            size="small"
            inputProps={{ step: 0.1, min: 1 }}
            value={dados?.multiplicador || 1}
            onChange={(e) => onUpdate(nivel, 'multiplicador', parseFloat(e.target.value) || 1)}
            InputProps={{
              endAdornment: <InputAdornment position="end">x</InputAdornment>
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Cor (hex)"
            size="small"
            type="color"
            value={dados?.cor || '#999999'}
            onChange={(e) => onUpdate(nivel, 'cor', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ width: 20, height: 20, bgcolor: dados?.cor || '#999', borderRadius: 1 }} />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Benefícios"
            size="small"
            placeholder="Separe por vírgula"
            value={dados?.beneficios?.join(', ') || dados?.benefícios?.join(', ') || ''}
            onChange={(e) => onUpdate(nivel, 'beneficios', e.target.value.split(',').map(b => b.trim()))}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

function ModernConfiguracoes() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [tabValue, setTabValue] = useState(() => getConfigTabFromSearch(window.location.search));
  const [empresaInitialTab, setEmpresaInitialTab] = useState(() => getEmpresaTabFromSearch(window.location.search));
  const [config, setConfig] = useState(null);
  const [backup, setBackup] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [usuarioAtual] = useState(() => getUsuarioAtual());
  const isSuperadmin = usuarioEhSuperadmin(usuarioAtual);
  
  // Estados para limpeza de dados
  const [openCleanDialog, setOpenCleanDialog] = useState(false);
  const [cleanStep, setCleanStep] = useState(0);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [cleanResults, setCleanResults] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [deletingInProgress, setDeletingInProgress] = useState({});
  
  // Lista completa de coleções do Firebase
  const colecoes = [
    'agendamentos',
    'atendimentos',
    'auditoria',
    'caixa',
    'categorias_produtos',
    'clientes',
    'comissoes',
    'compras',
    'config_fidelidade',
    'configuracoes',
    'contas_pagar',
    'contas_receber',
    'entradas',
    'fornecedores',
    'indicacoes',
    'logs',
    'movimentacoes_estoque',
    'notificacoes',
    'notificacoes_cliente',
    'pagamentos',
    'pontuacao',
    'produtos',
    'profissionais',
    'recompensas',
    'resgates_fidelidade',
    'servicos',
    'transacoes',
    'usuarios'
  ];

  const [selectedCollections, setSelectedCollections] = useState(
    colecoes.reduce((acc, colecao) => {
      acc[colecao] = true;
      return acc;
    }, {})
  );

  // Mapeamento de ícones por coleção
  const getIconForCollection = (colecao) => {
    switch(colecao) {
      case 'agendamentos': return <EventIcon fontSize="small" />;
      case 'atendimentos': return <EventIcon fontSize="small" />;
      case 'auditoria': return <HistoryIcon fontSize="small" />;
      case 'caixa': return <MoneyIcon fontSize="small" />;
      case 'categorias_produtos': return <CategoryIcon fontSize="small" />;
      case 'clientes': return <PersonIcon fontSize="small" />;
      case 'comissoes': return <MoneyIcon fontSize="small" />;
      case 'compras': return <ShoppingCartIcon fontSize="small" />;
      case 'config_fidelidade': return <TrophyIcon fontSize="small" />;
      case 'configuracoes': return <SettingsIcon fontSize="small" />;
      case 'contas_pagar': return <ReceiptIcon fontSize="small" />;
      case 'contas_receber': return <ReceiptIcon fontSize="small" />;
      case 'entradas': return <InventoryIcon fontSize="small" />;
      case 'fornecedores': return <ShippingIcon fontSize="small" />;
      case 'indicacoes': return <GiftIcon fontSize="small" />;
      case 'logs': return <HistoryIcon fontSize="small" />;
      case 'movimentacoes_estoque': return <InventoryIcon fontSize="small" />;
      case 'notificacoes': return <NotificationsActiveIcon fontSize="small" />;
      case 'notificacoes_cliente': return <NotificationsActiveIcon fontSize="small" />;
      case 'pagamentos': return <MoneyIcon fontSize="small" />;
      case 'pontuacao': return <StarIcon fontSize="small" />;
      case 'produtos': return <InventoryIcon fontSize="small" />;
      case 'profissionais': return <PersonIcon fontSize="small" />;
      case 'recompensas': return <GiftIcon fontSize="small" />;
      case 'resgates_fidelidade': return <GiftIcon fontSize="small" />;
      case 'servicos': return <BusinessIcon fontSize="small" />;
      case 'transacoes': return <ReceiptIcon fontSize="small" />;
      case 'usuarios': return <PeopleIcon fontSize="small" />;
      default: return <StorageIcon fontSize="small" />;
    }
  };

  // Usuário a ser preservado
  const USUARIO_PRESERVADO = 'michael.rodrigoraimundo@gmail.com';

  // Configurações de fidelidade
  const [fidelidadeConfig, setFidelidadeConfig] = useState({
    ativo: true,
    pontosPorReal: 10,
    bonusAniversario: 50,
    bonusIndicacao: 100,
    bonusPrimeiroAtendimento: 100,
    nivelInicial: 'bronze',
    expiracaoPontos: 365,
    niveis: {
      bronze: {
        cor: '#cd7f32',
        corFundo: '#fff3e0',
        minimo: 0,
        multiplicador: 1,
        beneficios: ['5% de desconto em serviços', 'Pontuação normal']
      },
      prata: {
        cor: '#c0c0c0',
        corFundo: '#f5f5f5',
        minimo: 500,
        multiplicador: 1.2,
        beneficios: ['10% de desconto em serviços', '1.2x pontos', 'Prioridade no agendamento']
      },
      ouro: {
        cor: '#ffd700',
        corFundo: '#fff9e6',
        minimo: 2000,
        multiplicador: 1.5,
        beneficios: ['15% de desconto em serviços', '1.5x pontos', 'Agendamento VIP']
      },
      platina: {
        cor: '#e5e4e2',
        corFundo: '#f0f0f0',
        minimo: 5000,
        multiplicador: 2,
        beneficios: ['20% de desconto em serviços', '2x pontos', 'Acesso antecipado a promoções']
      }
    },
    regrasEspeciais: {
      aniversario: true,
      indicacao: true,
      primeiraCompra: true,
      avaliacao: true
    }
  });

  const diasSemana = [
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
    'domingo'
  ];

  const nomesDias = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  const opcoesSMTP = [
    { value: 'gmail', label: 'Gmail', host: 'smtp.gmail.com', port: 587 },
    { value: 'outlook', label: 'Outlook/Hotmail', host: 'smtp-mail.outlook.com', port: 587 },
    { value: 'yahoo', label: 'Yahoo Mail', host: 'smtp.mail.yahoo.com', port: 587 },
    { value: 'custom', label: 'Personalizado', host: '', port: 587 },
  ];

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  useEffect(() => {
    const nextTab = getConfigTabFromSearch(location.search);
    const nextEmpresaTab = getEmpresaTabFromSearch(location.search);
    setTabValue(nextTab);
    setEmpresaInitialTab(nextEmpresaTab);
  }, [location.search]);

  // Carregar configurações de fidelidade
  useEffect(() => {
    const carregarFidelidadeConfig = async () => {
      try {
        const fidelidade = await withTimeout(
          firebaseService.getAll('config_fidelidade').catch(() => []),
          8000,
          [],
          'Tempo limite ao carregar configurações de fidelidade. Mantendo padrão local.'
        );
        if (fidelidade && fidelidade.length > 0) {
          setFidelidadeConfig(fidelidade[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de fidelidade:', error);
      }
    };
    
    carregarFidelidadeConfig();
  }, []);

  useEffect(() => {
    const carregarUltimoBackup = async () => {
      if (config) {
        const ultimo = await backupService.buscarUltimoBackup();
        setBackup(ultimo);
      }
    };
    
    carregarUltimoBackup();
  }, [config]);

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const configuracoes = await withTimeout(
        firebaseService.getAll('configuracoes').catch((erroBusca) => {
          console.error('❌ Erro ao buscar configurações:', erroBusca);
          return [];
        }),
        8000,
        [],
        'Tempo limite ao carregar configurações. Usando configuração padrão local.'
      );
      
      if (!configuracoes || configuracoes.length === 0) {
        const configPadrao = {
          salao: {
            nome: '',
            nomeFantasia: '',
            cnpj: '',
            ie: '',
            logo: null,
            endereco: {
              logradouro: '',
              complemento: '',
              bairro: '',
              cidade: '',
              estado: '',
              cep: ''
            },
            contato: {
              telefone: '',
              celular: '',
              email: '',
              site: '',
              instagram: '',
              facebook: '',
              whatsapp: ''
            }
          },
          horarioFuncionamento: {
            segunda: { aberto: true, abertura: '09:00', fechamento: '19:00' },
            terca: { aberto: true, abertura: '09:00', fechamento: '19:00' },
            quarta: { aberto: true, abertura: '09:00', fechamento: '19:00' },
            quinta: { aberto: true, abertura: '09:00', fechamento: '19:00' },
            sexta: { aberto: true, abertura: '09:00', fechamento: '19:00' },
            sabado: { aberto: true, abertura: '09:00', fechamento: '18:00' },
            domingo: { aberto: false, abertura: '09:00', fechamento: '13:00' }
          },
          notificacoes: {
            email: true,
            whatsapp: true,
            sms: false,
            lembreteAgendamento: 24,
            promocoes: true,
            smtp: {
              servidor: 'gmail',
              host: 'smtp.gmail.com',
              porta: 587,
              usuario: '',
              senha: '',
              seguranca: 'tls',
              remetente: '',
              nomeRemetente: ''
            }
          },
          tema: {
            corPrimaria: '#9c27b0',
            corSecundaria: '#ff4081',
            modoEscuro: false,
            fonte: 'Poppins',
            borderRadius: 12,
          },
          updatedAt: new Date().toISOString()
        };
        
        setConfig({ ...configPadrao, id: 'configuracoes_padrao' });
        firebaseService.add('configuracoes', configPadrao)
          .then((novoId) => {
            if (novoId) {
              setConfig((configAtual) => (
                configAtual?.id === 'configuracoes_padrao'
                  ? { ...configAtual, id: novoId }
                  : configAtual
              ));
            }
          })
          .catch((erroCriacao) => {
            console.error('❌ Erro ao criar configuração padrão:', erroCriacao);
            mostrarSnackbar('Configurações padrão carregadas localmente. Salve novamente quando a conexão normalizar.', 'warning');
          });
        if (configPadrao.salao.logo) {
          setLogoPreview(configPadrao.salao.logo);
        }
      } else {
        setConfig(configuracoes[0]);
        if (configuracoes[0].salao?.logo) {
          setLogoPreview(configuracoes[0].salao.logo);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      setError(error.message || 'Erro ao carregar configurações');
      mostrarSnackbar('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar configurações de fidelidade
  const salvarFidelidadeConfig = async () => {
    try {
      const configs = await firebaseService.getAll('config_fidelidade').catch(() => []);
      
      if (configs && configs.length > 0) {
        await firebaseService.update('config_fidelidade', configs[0].id, {
          ...fidelidadeConfig,
          updatedAt: new Date().toISOString()
        });
      } else {
        await firebaseService.add('config_fidelidade', {
          ...fidelidadeConfig,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      notificarFidelidadeConfigAtualizada(fidelidadeConfig);
      mostrarSnackbar('Configurações de fidelidade salvas!', 'success');
    } catch (error) {
      console.error('Erro ao salvar fidelidade:', error);
      mostrarSnackbar('Erro ao salvar configurações de fidelidade', 'error');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Salvar configurações principais
      const configAtualizada = {
        ...config,
        updatedAt: new Date().toISOString()
      };
      
      if (config.id === 'configuracoes_padrao') {
        const novoId = await firebaseService.add('configuracoes', configAtualizada);
        setConfig({ ...configAtualizada, id: novoId });
      } else {
        await firebaseService.update('configuracoes', config.id, configAtualizada);
        setConfig(configAtualizada);
      }
      
      // Salvar configurações de fidelidade
      await salvarFidelidadeConfig();
      
      // Aplicar tema globalmente
      aplicarTema(configAtualizada.tema);
      
      mostrarSnackbar('Todas as configurações salvas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      mostrarSnackbar('Erro ao salvar configurações', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Função para atualizar nível de fidelidade
  const handleNivelUpdate = (nivel, campo, valor) => {
    setFidelidadeConfig(prev => ({
      ...prev,
      niveis: {
        ...(prev?.niveis || {}),
        [nivel]: {
          ...((prev?.niveis || {})[nivel] || {}),
          [campo]: valor
        }
      }
    }));
  };

  const aplicarTema = (tema) => {
    const modoEscuroAtivo = Boolean(tema?.modoEscuro);
    if (modoEscuroAtivo) {
      document.body.classList.add('modo-escuro');
    } else {
      document.body.classList.remove('modo-escuro');
    }
    
    document.documentElement.style.setProperty('--cor-primaria', tema?.corPrimaria || '#9c27b0');
    document.documentElement.style.setProperty('--cor-secundaria', tema?.corSecundaria || '#ff4081');
    localStorage.setItem('modoEscuro', String(modoEscuroAtivo));
    window.dispatchEvent(new CustomEvent('temaAtualizado', { detail: { modoEscuro: modoEscuroAtivo, tema } }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        handleSalaoChange('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    setLogoPreview(null);
    handleSalaoChange('logo', null);
  };

  const handleBackup = async () => {
    try {
      setSaving(true);
      await backupService.criarBackup();
      
      const ultimoBackup = await backupService.buscarUltimoBackup();
      setBackup(ultimoBackup);
      
      mostrarSnackbar('Backup completo realizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro no backup:', error);
      mostrarSnackbar('Erro ao realizar backup', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await backupService.restaurarBackup(file);
      await carregarConfiguracoes();
      mostrarSnackbar('Backup restaurado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao restaurar:', error);
      mostrarSnackbar('Erro ao restaurar backup', 'error');
    }
    
    event.target.value = '';
  };

  const handleHorarioChange = (dia, campo, valor) => {
    if (!config || !config.horarioFuncionamento) return;
    
    setConfig({
      ...config,
      horarioFuncionamento: {
        ...config.horarioFuncionamento,
        [dia]: {
          ...(config.horarioFuncionamento[dia] || {}),
          [campo]: valor
        }
      }
    });
  };

  const handleSalaoChange = (campo, valor, subcampo = null) => {
    if (!config || !config.salao) return;
    
    if (subcampo) {
      setConfig({
        ...config,
        salao: {
          ...config.salao,
          [campo]: {
            ...(config.salao[campo] || {}),
            [subcampo]: valor
          }
        }
      });
    } else {
      setConfig({
        ...config,
        salao: {
          ...config.salao,
          [campo]: valor
        }
      });
    }
  };

  const handleNotificacaoChange = (campo, valor) => {
    if (!config || !config.notificacoes) return;
    
    setConfig({
      ...config,
      notificacoes: {
        ...config.notificacoes,
        [campo]: valor
      }
    });
  };

  const handleSMTPChange = (campo, valor) => {
    if (!config || !config.notificacoes?.smtp) return;
    
    if (campo === 'servidor') {
      const opcao = opcoesSMTP.find(o => o.value === valor);
      setConfig({
        ...config,
        notificacoes: {
          ...config.notificacoes,
          smtp: {
            ...config.notificacoes.smtp,
            servidor: valor,
            host: opcao?.host || '',
            porta: opcao?.port || 587
          }
        }
      });
    } else {
      setConfig({
        ...config,
        notificacoes: {
          ...config.notificacoes,
          smtp: {
            ...config.notificacoes.smtp,
            [campo]: valor
          }
        }
      });
    }
  };


  const handlePainelChamadaChange = (campo, valor) => {
    setConfig({
      ...config,
      painelChamada: {
        ...(config.painelChamada || {}),
        [campo]: valor,
      },
    });
  };

  const handleTemaChange = (campo, valor) => {
    if (!config || !config.tema) return;
    
    setConfig({
      ...config,
      tema: {
        ...config.tema,
        [campo]: valor
      }
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const testarConexaoSMTP = async () => {
    mostrarSnackbar('Testando conexão SMTP...', 'info');
    setTimeout(() => {
      mostrarSnackbar('Conexão SMTP testada com sucesso!', 'success');
    }, 2000);
  };

  // ============================================
  // FUNÇÕES PARA LIMPEZA DE DADOS - CORRIGIDAS (SEM toast.info)
  // ============================================

  const handleOpenCleanDialog = () => {
    if (!isSuperadmin) {
      toast.error('A limpeza de dados é exclusiva para superadmin.');
      return;
    }
    setOpenCleanDialog(true);
    setCleanStep(0);
    setCleanResults(null);
    setConfirmText('');
    setCleaningProgress(0);
  };

  const handleCloseCleanDialog = () => {
    setOpenCleanDialog(false);
  };

  const handleSelectAllCollections = (checked) => {
    const newSelected = {};
    Object.keys(selectedCollections).forEach(key => {
      newSelected[key] = checked;
    });
    setSelectedCollections(newSelected);
  };

  const handleCollectionToggle = (collection) => {
    setSelectedCollections(prev => ({
      ...prev,
      [collection]: !prev[collection]
    }));
  };

  // 🔥 FUNÇÃO DE LIMPEZA CORRIGIDA - SEM toast.info
  const handleCleanData = async () => {
    if (!isSuperadmin) {
      toast.error('A limpeza de dados é exclusiva para superadmin.');
      return;
    }
    if (confirmText !== 'LIMPAR DADOS') {
      toast.error('Digite "LIMPAR DADOS" para confirmar');
      return;
    }

    try {
      setCleaning(true);
      setCleanStep(1);
      setCleaningProgress(0);
      setDeletingInProgress({});

      // Fazer backup automático antes de limpar (sem toast.info)
      toast('🔄 Fazendo backup automático...', {
        icon: '⏳',
        duration: 3000
      });
      
      let backupRealizado = null;
      try {
        backupRealizado = await backupService.criarBackup();
        toast.success('✅ Backup automático concluído!');
      } catch (backupError) {
        console.warn('⚠️ Backup automático falhou, continuando mesmo assim:', backupError);
        toast('⚠️ Backup automático falhou, mas a limpeza continuará', {
          icon: '⚠️',
          duration: 5000
        });
      }
      setCleaningProgress(10);

      const resultados = {};
      const erros = [];
      
      // Contar registros ANTES da limpeza
      const contagemAntes = {};
      for (const [collection, selected] of Object.entries(selectedCollections)) {
        if (selected) {
          try {
            const docs = await firebaseService.getAll(collection);
            contagemAntes[collection] = docs.length;
            console.log(`📊 ${collection}: ${docs.length} documentos encontrados`);
          } catch (error) {
            console.warn(`⚠️ Erro ao contar ${collection}:`, error);
            contagemAntes[collection] = 0;
          }
        }
      }

      setCleaningProgress(20);

      // Limpar cada coleção selecionada
      const colecoesParaLimpar = Object.entries(selectedCollections)
        .filter(([_, selected]) => selected)
        .map(([collection]) => collection);

      const totalColecoes = colecoesParaLimpar.length;
      let colecoesProcessadas = 0;

      for (const collection of colecoesParaLimpar) {
        try {
          console.log(`🧹 Limpando coleção: ${collection}`);
          setDeletingInProgress(prev => ({ ...prev, [collection]: true }));

          // Buscar todos os documentos da coleção
          const documentos = await firebaseService.getAll(collection);
          
          if (collection === 'usuarios') {
            // Para usuários, preservar o usuário específico
            const usuariosParaManter = documentos.filter(u => 
              u.email?.toLowerCase() === USUARIO_PRESERVADO.toLowerCase()
            );
            
            const usuariosParaDeletar = documentos.filter(u => 
              u.email?.toLowerCase() !== USUARIO_PRESERVADO.toLowerCase()
            );

            console.log(`👥 Usuários: ${documentos.length} total, ${usuariosParaManter.length} manter, ${usuariosParaDeletar.length} deletar`);

            // Deletar usuários que não são o preservado
            let deletados = 0;
            for (const usuario of usuariosParaDeletar) {
              try {
                await firebaseService.delete(collection, usuario.id);
                deletados++;
                console.log(`✅ Usuário ${usuario.id} (${usuario.email}) deletado`);
              } catch (error) {
                console.error(`❌ Erro ao deletar usuário ${usuario.id}:`, error);
                erros.push({ collection, id: usuario.id, error: error.message });
              }
            }

            resultados[collection] = {
              total: documentos.length,
              mantidos: usuariosParaManter.length,
              removidos: deletados
            };
          } else {
            // Para outras coleções, deletar todos
            let deletados = 0;
            for (const doc of documentos) {
              try {
                await firebaseService.delete(collection, doc.id);
                deletados++;
                console.log(`✅ Documento ${collection}/${doc.id} deletado`);
              } catch (error) {
                console.error(`❌ Erro ao deletar ${collection}/${doc.id}:`, error);
                erros.push({ collection, id: doc.id, error: error.message });
              }
            }
            
            resultados[collection] = {
              total: documentos.length,
              removidos: deletados
            };
          }

          colecoesProcessadas++;
          const progresso = 20 + (70 * colecoesProcessadas / totalColecoes);
          setCleaningProgress(Math.min(progresso, 90));
          
          setDeletingInProgress(prev => ({ ...prev, [collection]: false }));

        } catch (error) {
          console.error(`Erro ao processar coleção ${collection}:`, error);
          erros.push({ collection, error: error.message });
          setDeletingInProgress(prev => ({ ...prev, [collection]: false }));
        }
      }

      setCleaningProgress(95);

      // Verificar se os dados foram realmente deletados
      const contagemDepois = {};
      for (const collection of colecoesParaLimpar) {
        try {
          const docs = await firebaseService.getAll(collection);
          contagemDepois[collection] = docs.length;
        } catch (error) {
          contagemDepois[collection] = 'erro';
        }
      }

      setCleaningProgress(100);
      
      // Adicionar verificação ao resultado
      const resultadoFinal = {
        resultados,
        erros,
        backup: backupRealizado,
        contagemAntes,
        contagemDepois
      };
      
      setCleanResults(resultadoFinal);
      setCleanStep(2);

      // Mostrar resumo
      const totalRemovidos = Object.values(resultados).reduce((acc, r) => acc + (r.removidos || 0), 0);
      toast.success(`✅ Limpeza concluída! ${totalRemovidos} registros removidos.`);

    } catch (error) {
      console.error('❌ Erro durante limpeza:', error);
      toast.error('Erro durante a limpeza de dados');
      setCleanStep(0);
    } finally {
      setCleaning(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={carregarConfiguracoes}>
              Tentar novamente
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!config) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Nenhuma configuração encontrada
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Configurações
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
          }}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              '& .MuiTab-root': { fontWeight: 600, minHeight: 64 },
            }}
          >
            <Tab icon={<BusinessIcon />} label="Salão/Empresa" />
            <Tab icon={<TimeIcon />} label="Horário" />
            <Tab icon={<NotificationsIcon />} label="Notificações" />
            <Tab icon={<PaletteIcon />} label="Aparência" />
            <Tab icon={<TrophyIcon />} label="Fidelidade" />
            <Tab icon={<BackupIcon />} label="Backup" />
            <Tab icon={<CleanIcon />} label="Limpeza" disabled={!isSuperadmin} />
            <Tab icon={<BusinessIcon />} label="SaaS, cobrança e unidades" />
            <Tab icon={<EventIcon />} label="Painel de Chamada" />
          </Tabs>

          {/* Dados do Salão e Empresa */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
                  Logo do Salão/Empresa
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Avatar
                    src={logoPreview}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '2px dashed #9c27b0',
                      bgcolor: '#f3e5f5',
                    }}
                  >
                    {!logoPreview && <BusinessIcon sx={{ fontSize: 60 }} />}
                  </Avatar>
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="logo-upload"
                      type="file"
                      onChange={handleLogoUpload}
                    />
                    <label htmlFor="logo-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                        sx={{ mr: 1 }}
                      >
                        Upload Logo
                      </Button>
                    </label>
                    {logoPreview && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleLogoRemove}
                      >
                        Remover
                      </Button>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }} color="textSecondary">
                      Formatos: PNG, JPG. Tamanho recomendado: 200x200px
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Salão"
                  value={config.salao?.nome || ''}
                  onChange={(e) => handleSalaoChange('nome', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Fantasia"
                  value={config.salao?.nomeFantasia || ''}
                  onChange={(e) => handleSalaoChange('nomeFantasia', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MaskedInput
                  mask="cnpj"
                  label="CNPJ"
                  name="cnpj"
                  value={config.salao?.cnpj || ''}
                  onChange={(e) => handleSalaoChange('cnpj', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Inscrição Estadual"
                  value={config.salao?.ie || ''}
                  onChange={(e) => handleSalaoChange('ie', e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2, color: '#9c27b0' }}>
                  Endereço
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Logradouro"
                  value={config.salao?.endereco?.logradouro || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'logradouro')}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Complemento"
                  value={config.salao?.endereco?.complemento || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'complemento')}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Bairro"
                  value={config.salao?.endereco?.bairro || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'bairro')}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={config.salao?.endereco?.cidade || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'cidade')}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="UF"
                  value={config.salao?.endereco?.estado || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'estado')}
                  size="small"
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <MaskedInput
                  mask="cep"
                  label="CEP"
                  name="cep"
                  value={config.salao?.endereco?.cep || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'cep')}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2, color: '#9c27b0' }}>
                  Contato
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <MaskedInput
                  mask="telefoneFixo"
                  label="Telefone"
                  name="telefone"
                  value={config.salao?.contato?.telefone || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'telefone')}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MaskedInput
                  mask="telefone"
                  label="Celular"
                  name="celular"
                  value={config.salao?.contato?.celular || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'celular')}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={config.salao?.contato?.email || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'email')}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Site"
                  value={config.salao?.contato?.site || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'site')}
                  size="small"
                  placeholder="www.exemplo.com"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Instagram"
                  value={config.salao?.contato?.instagram || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'instagram')}
                  size="small"
                  placeholder="@usuario"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Facebook"
                  value={config.salao?.contato?.facebook || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'facebook')}
                  size="small"
                  placeholder="facebook.com/usuario"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MaskedInput
                  mask="telefone"
                  label="WhatsApp"
                  name="whatsapp"
                  value={config.salao?.contato?.whatsapp || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'whatsapp')}
                  size="small"
                  helperText="Número para contato no WhatsApp"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Gestão SaaS da empresa */}
          <TabPanel value={tabValue} index={7}>
            <SaasGestao initialTab={empresaInitialTab} embedded />
          </TabPanel>

          {/* Horário de Funcionamento */}

          <TabPanel value={tabValue} index={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info">
                  Configure o comportamento da página pública /painel-chamada usada em TVs ou monitores de recepção.
                </Alert>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Título do painel" value={config.painelChamada?.titulo || 'Painel de Chamada'} onChange={(e) => handlePainelChamadaChange('titulo', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Mensagem de apoio" value={config.painelChamada?.subtitulo || 'Acompanhe os próximos atendimentos em tempo real.'} onChange={(e) => handlePainelChamadaChange('subtitulo', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="number" label="Atualizar a cada (segundos)" value={config.painelChamada?.intervaloAtualizacao || 30} onChange={(e) => handlePainelChamadaChange('intervaloAtualizacao', Number(e.target.value || 30))} size="small" inputProps={{ min: 5 }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="number" label="Qtd. próximos chamados" value={config.painelChamada?.quantidadeProximos || 8} onChange={(e) => handlePainelChamadaChange('quantidadeProximos', Number(e.target.value || 8))} size="small" inputProps={{ min: 1, max: 20 }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="color" label="Cor principal" value={config.painelChamada?.corPrimaria || '#7b1fa2'} onChange={(e) => handlePainelChamadaChange('corPrimaria', e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Mensagem quando não houver chamada" value={config.painelChamada?.mensagemVazio || 'Aguardando próximo cliente'} onChange={(e) => handlePainelChamadaChange('mensagemVazio', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel control={<Switch checked={config.painelChamada?.mostrarProximos !== false} onChange={(e) => handlePainelChamadaChange('mostrarProximos', e.target.checked)} />} label="Mostrar fila de próximos clientes" />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Voz do áudio de chamada</InputLabel>
                  <Select
                    label="Voz do áudio de chamada"
                    value={config.painelChamada?.tipoVoz || 'feminina'}
                    onChange={(e) => handlePainelChamadaChange('tipoVoz', e.target.value)}
                  >
                    <MenuItem value="feminina">Feminina</MenuItem>
                    <MenuItem value="masculina">Masculina</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel control={<Switch checked={config.painelChamada?.anunciarAutomaticamente !== false} onChange={(e) => handlePainelChamadaChange('anunciarAutomaticamente', e.target.checked)} />} label="Anunciar chamada automaticamente" />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {diasSemana.map(dia => (
                <Grid item xs={12} key={dia}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={config.horarioFuncionamento?.[dia]?.aberto || false}
                              onChange={(e) => handleHorarioChange(dia, 'aberto', e.target.checked)}
                            />
                          }
                          label={nomesDias[dia]}
                        />
                      </Grid>
                      {config.horarioFuncionamento?.[dia]?.aberto && (
                        <>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="Abertura"
                              type="time"
                              value={config.horarioFuncionamento?.[dia]?.abertura || '09:00'}
                              onChange={(e) => handleHorarioChange(dia, 'abertura', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="Fechamento"
                              type="time"
                              value={config.horarioFuncionamento?.[dia]?.fechamento || '19:00'}
                              onChange={(e) => handleHorarioChange(dia, 'fechamento', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Notificações e SMTP */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              {/* Canais de Notificação */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
                  Canais de Notificação
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notificacoes?.email || false}
                      onChange={(e) => handleNotificacaoChange('email', e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="primary" />
                      <span>Email</span>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notificacoes?.whatsapp || false}
                      onChange={(e) => handleNotificacaoChange('whatsapp', e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WhatsAppIcon sx={{ color: '#25D366' }} />
                      <span>WhatsApp</span>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notificacoes?.sms || false}
                      onChange={(e) => handleNotificacaoChange('sms', e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmsIcon color="info" />
                      <span>SMS</span>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Configurações de Notificação */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Lembrete de Agendamento</InputLabel>
                  <Select
                    value={config.notificacoes?.lembreteAgendamento || 24}
                    label="Lembrete de Agendamento"
                    onChange={(e) => handleNotificacaoChange('lembreteAgendamento', e.target.value)}
                  >
                    <MenuItem value={1}>1 hora antes</MenuItem>
                    <MenuItem value={2}>2 horas antes</MenuItem>
                    <MenuItem value={6}>6 horas antes</MenuItem>
                    <MenuItem value={12}>12 horas antes</MenuItem>
                    <MenuItem value={24}>24 horas antes</MenuItem>
                    <MenuItem value={48}>48 horas antes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notificacoes?.promocoes || false}
                      onChange={(e) => handleNotificacaoChange('promocoes', e.target.checked)}
                    />
                  }
                  label="Receber promoções"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2, color: '#9c27b0' }}>
                  Configuração SMTP (Email)
                </Typography>
              </Grid>

              {/* Configurações SMTP */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Servidor SMTP</InputLabel>
                  <Select
                    value={config.notificacoes?.smtp?.servidor || 'gmail'}
                    label="Servidor SMTP"
                    onChange={(e) => handleSMTPChange('servidor', e.target.value)}
                  >
                    {opcoesSMTP.map(opcao => (
                      <MenuItem key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Host SMTP"
                  value={config.notificacoes?.smtp?.host || ''}
                  onChange={(e) => handleSMTPChange('host', e.target.value)}
                  size="small"
                  placeholder="smtp.gmail.com"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Porta"
                  type="number"
                  value={config.notificacoes?.smtp?.porta || 587}
                  onChange={(e) => handleSMTPChange('porta', e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Segurança</InputLabel>
                  <Select
                    value={config.notificacoes?.smtp?.seguranca || 'tls'}
                    label="Segurança"
                    onChange={(e) => handleSMTPChange('seguranca', e.target.value)}
                  >
                    <MenuItem value="none">Sem segurança</MenuItem>
                    <MenuItem value="ssl">SSL</MenuItem>
                    <MenuItem value="tls">TLS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Usuário"
                  value={config.notificacoes?.smtp?.usuario || ''}
                  onChange={(e) => handleSMTPChange('usuario', e.target.value)}
                  size="small"
                  placeholder="seu@email.com"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Senha"
                  type={showPassword.smtp ? 'text' : 'password'}
                  value={config.notificacoes?.smtp?.senha || ''}
                  onChange={(e) => handleSMTPChange('senha', e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        size="small"
                        onClick={() => togglePasswordVisibility('smtp')}
                      >
                        {showPassword.smtp ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Email Remetente"
                  value={config.notificacoes?.smtp?.remetente || ''}
                  onChange={(e) => handleSMTPChange('remetente', e.target.value)}
                  size="small"
                  placeholder="naoresponda@seusalao.com"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Nome Remetente"
                  value={config.notificacoes?.smtp?.nomeRemetente || ''}
                  onChange={(e) => handleSMTPChange('nomeRemetente', e.target.value)}
                  size="small"
                  placeholder="Meu Salão"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={testarConexaoSMTP}
                >
                  Testar Configuração SMTP
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Aparência e Personalização */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cor Primária"
                  type="color"
                  value={config.tema?.corPrimaria || '#9c27b0'}
                  onChange={(e) => handleTemaChange('corPrimaria', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cor Secundária"
                  type="color"
                  value={config.tema?.corSecundaria || '#ff4081'}
                  onChange={(e) => handleTemaChange('corSecundaria', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fonte Principal</InputLabel>
                  <Select
                    value={config.tema?.fonte || 'Poppins'}
                    label="Fonte Principal"
                    onChange={(e) => handleTemaChange('fonte', e.target.value)}
                  >
                    <MenuItem value="Poppins">Poppins</MenuItem>
                    <MenuItem value="Roboto">Roboto</MenuItem>
                    <MenuItem value="Montserrat">Montserrat</MenuItem>
                    <MenuItem value="Open Sans">Open Sans</MenuItem>
                    <MenuItem value="Lato">Lato</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Border Radius"
                  type="number"
                  value={config.tema?.borderRadius || 12}
                  onChange={(e) => handleTemaChange('borderRadius', e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: <Typography>px</Typography>
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Visualização
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: config.tema?.corPrimaria,
                        '&:hover': { bgcolor: config.tema?.corPrimaria }
                      }}
                    >
                      Botão Primário
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: config.tema?.corSecundaria,
                        '&:hover': { bgcolor: config.tema?.corSecundaria }
                      }}
                    >
                      Botão Secundário
                    </Button>
                    <Chip
                      label="Chip Exemplo"
                      sx={{
                        bgcolor: `${config.tema?.corPrimaria}20`,
                        color: config.tema?.corPrimaria
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.tema?.modoEscuro || false}
                      onChange={(e) => handleTemaChange('modoEscuro', e.target.checked)}
                      icon={<LightModeIcon />}
                      checkedIcon={<DarkModeIcon />}
                    />
                  }
                  label={config.tema?.modoEscuro ? 'Modo Escuro' : 'Modo Claro'}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Paper
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: config.tema?.corPrimaria || '#9c27b0',
                      borderRadius: config.tema?.borderRadius || 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: 3,
                    }}
                  >
                    Primária
                  </Paper>
                  <Paper
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: config.tema?.corSecundaria || '#ff4081',
                      borderRadius: config.tema?.borderRadius || 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: 3,
                    }}
                  >
                    Secundária
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Aba de Fidelidade */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Configure as regras do programa de fidelidade. Os clientes acumulam pontos que podem ser trocados por recompensas.
                </Alert>
              </Grid>

              {/* Ativar/Desativar Fidelidade */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: '#faf5ff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrophyIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Programa de Fidelidade
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Ative ou desative o sistema de pontos para clientes
                      </Typography>
                    </Box>
                    <Switch
                      checked={fidelidadeConfig?.ativo || false}
                      onChange={(e) => setFidelidadeConfig({ ...fidelidadeConfig, ativo: e.target.checked })}
                      color="primary"
                    />
                  </Box>
                </Paper>
              </Grid>

              {fidelidadeConfig?.ativo && (
                <>
                  {/* Regras Básicas */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
                      Regras Básicas
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Pontos por R$1"
                      type="number"
                      size="small"
                      value={fidelidadeConfig?.pontosPorReal || 10}
                      onChange={(e) => setFidelidadeConfig({ ...fidelidadeConfig, pontosPorReal: parseInt(e.target.value) || 0 })}
                      helperText="Quantos pontos o cliente ganha por real gasto"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><StarIcon /></InputAdornment>
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Expiração dos Pontos"
                      type="number"
                      size="small"
                      value={fidelidadeConfig?.expiracaoPontos || 365}
                      onChange={(e) => setFidelidadeConfig({ ...fidelidadeConfig, expiracaoPontos: parseInt(e.target.value) || 0 })}
                      helperText="Dias até os pontos expirarem"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">dias</InputAdornment>
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Nível Inicial</InputLabel>
                      <Select
                        value={fidelidadeConfig?.nivelInicial || 'bronze'}
                        label="Nível Inicial"
                        onChange={(e) => setFidelidadeConfig({ ...fidelidadeConfig, nivelInicial: e.target.value })}
                      >
                        <MenuItem value="bronze">Bronze</MenuItem>
                        <MenuItem value="prata">Prata</MenuItem>
                        <MenuItem value="ouro">Ouro</MenuItem>
                        <MenuItem value="platina">Platina</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Bônus Especiais */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2, color: '#9c27b0' }}>
                      Bônus Especiais
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Bônus Aniversário"
                      type="number"
                      size="small"
                      value={fidelidadeConfig?.bonusAniversario || 50}
                      onChange={(e) => setFidelidadeConfig({ ...fidelidadeConfig, bonusAniversario: parseInt(e.target.value) || 0 })}
                      helperText="Pontos extras no aniversário"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><StarIcon /></InputAdornment>
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Bônus Indicação"
                      type="number"
                      size="small"
                      value={fidelidadeConfig?.bonusIndicacao || 100}
                      onChange={(e) => setFidelidadeConfig({ ...fidelidadeConfig, bonusIndicacao: parseInt(e.target.value) || 0 })}
                      helperText="Pontos por indicação"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><StarIcon /></InputAdornment>
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Bônus Primeiro Atendimento"
                      type="number"
                      size="small"
                      value={fidelidadeConfig?.bonusPrimeiroAtendimento || 100}
                      onChange={(e) => setFidelidadeConfig({ ...fidelidadeConfig, bonusPrimeiroAtendimento: parseInt(e.target.value) || 0 })}
                      helperText="Pontos na primeira visita"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><StarIcon /></InputAdornment>
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={fidelidadeConfig?.regrasEspeciais?.aniversario || false}
                            onChange={(e) => setFidelidadeConfig({
                              ...fidelidadeConfig,
                              regrasEspeciais: {
                                ...(fidelidadeConfig?.regrasEspeciais || {}),
                                aniversario: e.target.checked
                              }
                            })}
                          />
                        }
                        label="Ativar bônus de aniversário"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={fidelidadeConfig?.regrasEspeciais?.indicacao || false}
                            onChange={(e) => setFidelidadeConfig({
                              ...fidelidadeConfig,
                              regrasEspeciais: {
                                ...(fidelidadeConfig?.regrasEspeciais || {}),
                                indicacao: e.target.checked
                              }
                            })}
                          />
                        }
                        label="Ativar bônus de indicação"
                      />
                    </Box>
                  </Grid>

                  {/* Configuração dos Níveis */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2, color: '#9c27b0' }}>
                      Configuração dos Níveis
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Personalize os níveis do programa de fidelidade. Quanto maior o nível, mais benefícios o cliente tem.
                    </Typography>
                  </Grid>

                  {Object.entries(fidelidadeConfig?.niveis || {}).map(([nivel, dados]) => (
                    <Grid item xs={12} key={nivel}>
                      <ConfiguracaoNivel
                        nivel={nivel}
                        dados={dados}
                        onUpdate={handleNivelUpdate}
                      />
                    </Grid>
                  ))}

                  {/* Preview dos Níveis */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, bgcolor: '#f5f5f5', mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Preview dos Níveis
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {Object.entries(fidelidadeConfig?.niveis || {}).map(([nivel, dados]) => (
                          <Chip
                            key={nivel}
                            label={`${nivel.toUpperCase()} - ${dados?.multiplicador || 1}x`}
                            sx={{
                              bgcolor: dados?.cor || '#999',
                              color: nivel === 'ouro' ? '#000' : '#fff',
                              fontWeight: 600,
                              py: 2,
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                </>
              )}
            </Grid>
          </TabPanel>

          {/* Backup */}
          <TabPanel value={tabValue} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Faça backup regularmente para garantir a segurança dos seus dados. O backup completo inclui todas as coleções do sistema.
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                        <DownloadIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Exportar Backup
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Baixe um arquivo com todos os dados do sistema
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      O backup incluirá:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3, maxHeight: 200, overflow: 'auto', p: 1 }}>
                      {colecoes.map(colecao => (
                        <Chip 
                          key={colecao}
                          label={colecao.replace(/_/g, ' ')} 
                          size="small"
                          icon={getIconForCollection(colecao)}
                        />
                      ))}
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<BackupIcon />}
                      onClick={handleBackup}
                      sx={{
                        background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                      }}
                    >
                      Gerar Backup Completo
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#ff4081', width: 56, height: 56 }}>
                        <UploadIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Importar Backup
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Restaure dados de um arquivo de backup anterior
                        </Typography>
                      </Box>
                    </Box>

                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <strong>Atenção:</strong> A restauração substituirá todos os dados atuais. Faça um backup antes de prosseguir.
                    </Alert>

                    <Button
                      fullWidth
                      variant="outlined"
                      component="label"
                      size="large"
                      startIcon={<UploadIcon />}
                    >
                      Selecionar Arquivo de Backup
                      <input
                        type="file"
                        hidden
                        accept=".json"
                        onChange={handleRestore}
                      />
                    </Button>

                    <Typography variant="caption" display="block" sx={{ mt: 2 }} color="textSecondary">
                      Formatos aceitos: .json (gerado pelo sistema)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {backup && (
                <Grid item xs={12}>
                  <Alert 
                    severity="success"
                    action={
                      <Button color="inherit" size="small" onClick={handleBackup}>
                        Novo Backup
                      </Button>
                    }
                  >
                    <strong>Último backup:</strong> {new Date(backup.dataBackup).toLocaleString('pt-BR')}
                    {backup.dados && typeof backup.dados === 'object' && (
                      <Typography variant="caption" display="block">
                        Total de registros: {
                          Object.values(backup.dados || {}).reduce((acc, arr) => {
                            if (Array.isArray(arr)) {
                              return acc + arr.length;
                            }
                            return acc;
                          }, 0)
                        }
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Aba de Limpeza de Dados */}
          <TabPanel value={tabValue} index={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert 
                  severity={isSuperadmin ? 'warning' : 'info'}
                  sx={{ mb: 3 }}
                  icon={<WarningIcon />}
                >
                  <strong>Área Restrita - Limpeza de Dados</strong>
                  <br />
                  {isSuperadmin ? (
                    <>
                      Esta operação irá remover permanentemente os dados das coleções selecionadas.
                      A coleção <strong>usuários</strong> será preservada, mantendo apenas o usuário <strong>{USUARIO_PRESERVADO}</strong>.
                      Recomenda-se fazer um backup antes de prosseguir.
                    </>
                  ) : (
                    <>Somente usuários superadmin podem acessar ou executar a limpeza de dados do sistema.</>
                  )}
                </Alert>
              </Grid>

              {isSuperadmin && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: '#fff3e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#f44336', width: 56, height: 56 }}>
                      <CleanIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Limpar Dados do Sistema
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Selecione as coleções que deseja limpar. A coleção "usuários" manterá apenas o usuário administrador.
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<CleanIcon />}
                    onClick={handleOpenCleanDialog}
                    sx={{ mb: 3 }}
                  >
                    Iniciar Limpeza de Dados
                  </Button>

                  <Typography variant="caption" color="textSecondary" display="block">
                    Esta ação é irreversível. Todos os dados selecionados serão permanentemente removidos.
                  </Typography>
                </Paper>
              </Grid>
              )}
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Dialog de Limpeza de Dados */}
      <Dialog 
        open={openCleanDialog} 
        onClose={handleCloseCleanDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            <Typography variant="h6">Limpeza de Dados</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {cleanStep === 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Selecione as coleções para limpar:
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button 
                  size="small" 
                  onClick={() => handleSelectAllCollections(true)}
                >
                  Selecionar todas
                </Button>
                <Button 
                  size="small" 
                  onClick={() => handleSelectAllCollections(false)}
                >
                  Desmarcar todas
                </Button>
              </Box>

              <Grid container spacing={1} sx={{ maxHeight: 400, overflow: 'auto', p: 1 }}>
                {colecoes.map((colecao) => (
                  <Grid item xs={12} sm={6} md={4} key={colecao}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCollections[colecao] || false}
                          onChange={() => handleCollectionToggle(colecao)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getIconForCollection(colecao)}
                          <Typography variant="body2">
                            {colecao.replace(/_/g, ' ')}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <strong>Nota sobre usuários:</strong> A coleção "usuários" será preservada, mantendo apenas o usuário <strong>{USUARIO_PRESERVADO}</strong>. 
                Todos os outros usuários serão removidos.
              </Alert>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Confirmação"
                  placeholder='Digite "LIMPAR DADOS" para confirmar'
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  size="small"
                  helperText="Esta ação não pode ser desfeita"
                />
              </Box>
            </Box>
          )}

          {cleanStep === 1 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Limpando dados...
              </Typography>
              <CircularProgress size={60} sx={{ my: 3, color: '#f44336' }} />
              <LinearProgress variant="determinate" value={cleaningProgress} sx={{ mt: 2, height: 10, borderRadius: 5 }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {cleaningProgress}% concluído
              </Typography>
              
              {/* Mostrar progresso das coleções */}
              {Object.entries(deletingInProgress).filter(([_, progress]) => progress).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Processando: {Object.entries(deletingInProgress).filter(([_, progress]) => progress).map(([col]) => col).join(', ')}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {cleanStep === 2 && cleanResults && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Limpeza concluída com sucesso!
                {cleanResults.backup && (
                  <Typography variant="caption" display="block">
                    Backup automático criado em: {new Date(cleanResults.backup.dataBackup).toLocaleString('pt-BR')}
                  </Typography>
                )}
              </Alert>

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Resultados da Limpeza:
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, maxHeight: 300, overflow: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Coleção</TableCell>
                      <TableCell align="right">Antes</TableCell>
                      <TableCell align="right">Depois</TableCell>
                      <TableCell align="right">Removidos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(cleanResults.resultados).map(([collection, res]) => (
                      <TableRow key={collection}>
                        <TableCell>{collection}</TableCell>
                        <TableCell align="right">{res.total}</TableCell>
                        <TableCell align="right">{collection === 'usuarios' ? res.mantidos || 0 : 0}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#f44336' }}>
                          {res.removidos}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totais */}
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Total de registros removidos:</Typography>
                  <Typography variant="h6" sx={{ color: '#f44336' }}>
                    {Object.values(cleanResults.resultados).reduce((acc, r) => acc + (r.removidos || 0), 0)}
                  </Typography>
                </Box>
              </Paper>

              {cleanResults.erros && cleanResults.erros.length > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Erros encontrados:</Typography>
                  {cleanResults.erros.map((erro, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      {erro.collection}{erro.id ? `/${erro.id}` : ''}: {erro.error}
                    </Typography>
                  ))}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {cleanStep === 0 && (
            <>
              <Button onClick={handleCloseCleanDialog}>Cancelar</Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCleanData}
                disabled={confirmText !== 'LIMPAR DADOS' || cleaning}
              >
                {cleaning ? 'Limpando...' : 'Confirmar Limpeza'}
              </Button>
            </>
          )}
          {cleanStep === 1 && (
            <Button onClick={handleCloseCleanDialog} disabled>
              Aguarde...
            </Button>
          )}
          {cleanStep === 2 && (
            <Button onClick={handleCloseCleanDialog} variant="contained">
              Fechar
            </Button>
          )}
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

export default ModernConfiguracoes;
