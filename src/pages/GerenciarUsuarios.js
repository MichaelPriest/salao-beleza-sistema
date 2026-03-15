// src/pages/GerenciarUsuarios.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Avatar,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
  LinearProgress,
  Badge,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Zoom,
  Fab,
  Skeleton,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Pagination,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  SupervisorAccount as GerenteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  CardGiftcard as FidelidadeIcon,
  History as HistoryIcon,
  PointOfSale as PointIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Share as ShareIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Permissions as PermissionsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Constantes para cargos e permissões
const CARGOS = {
  admin: {
    nome: 'Administrador',
    cor: '#9c27b0',
    icone: <AdminIcon />,
    permissoes: [
      'admin',
      'gerenciar_usuarios',
      'gerenciar_clientes',
      'gerenciar_agendamentos',
      'gerenciar_servicos',
      'gerenciar_profissionais',
      'gerenciar_estoque',
      'visualizar_relatorios',
      'configurar_sistema',
      'visualizar_comissoes',
      'gerenciar_backup',
      'gerenciar_fidelidade',
      'visualizar_todos_pontos',
    ]
  },
  gerente: {
    nome: 'Gerente',
    cor: '#ff4081',
    icone: <GerenteIcon />,
    permissoes: [
      'gerenciar_clientes',
      'gerenciar_agendamentos',
      'gerenciar_servicos',
      'gerenciar_profissionais',
      'visualizar_relatorios',
      'visualizar_comissoes',
      'gerenciar_fidelidade',
      'visualizar_todos_pontos',
    ]
  },
  atendente: {
    nome: 'Atendente',
    cor: '#4caf50',
    icone: <PersonIcon />,
    permissoes: [
      'gerenciar_agendamentos',
      'visualizar_clientes',
      'visualizar_pontos_cliente',
    ]
  },
  profissional: {
    nome: 'Profissional',
    cor: '#ff9800',
    icone: <BadgeIcon />,
    permissoes: [
      'visualizar_agenda',
      'gerenciar_atendimentos',
      'visualizar_comissoes',
    ]
  },
  cliente: {
    nome: 'Cliente',
    cor: '#2196f3',
    icone: <PersonIcon />,
    permissoes: [
      'visualizar_meus_agendamentos',
      'visualizar_fidelidade',
      'visualizar_meus_pontos',
      'resgatar_recompensas',
    ]
  }
};

// Função utilitária para formatar data com segurança
const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '—';
  
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (!isValid(dateObj)) return '—';
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '—';
  }
};

// Função para obter iniciais do nome
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Componente para exibir informações de fidelidade do cliente
const FidelidadeInfo = ({ clienteId, pontos, nivel, ultimaAtualizacao }) => {
  const getNivelCor = (nivel) => {
    switch(nivel) {
      case 'bronze': return '#cd7f32';
      case 'prata': return '#C0C0C0';
      case 'ouro': return '#FFD700';
      case 'platina': return '#E5E4E2';
      default: return '#cd7f32';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
      <Tooltip title="Pontos acumulados">
        <Chip
          icon={<StarIcon sx={{ fontSize: 14 }} />}
          label={`${pontos || 0} pts`}
          size="small"
          sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#fff3e0', color: '#f57c00' }}
        />
      </Tooltip>
      <Tooltip title="Nível de fidelidade">
        <Chip
          label={nivel || 'bronze'}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            bgcolor: `${getNivelCor(nivel)}20`,
            color: getNivelCor(nivel),
            fontWeight: 500,
            textTransform: 'uppercase',
          }}
        />
      </Tooltip>
    </Box>
  );
};

// Componente de Card de Usuário Mobile
const UsuarioMobileCard = ({ 
  usuario, 
  cargo, 
  profissionalVinculado, 
  clienteVinculado,
  pontosCliente,
  nivelCliente,
  onEditar, 
  onPermissoes, 
  onPontos,
  onToggleStatus,
  onExcluir 
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          opacity: usuario.status === 'inativo' ? 0.7 : 1,
          bgcolor: usuario.status === 'inativo' ? '#f5f5f5' : 'white',
          '&:hover': {
            boxShadow: 3,
          },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={usuario.avatar}
              sx={{ 
                bgcolor: CARGOS[usuario.cargo]?.cor || '#9c27b0',
                width: 48,
                height: 48,
              }}
            >
              {usuario.nome ? getInitials(usuario.nome) : '?'}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {usuario.nome}
                </Typography>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  icon={CARGOS[usuario.cargo]?.icone}
                  label={CARGOS[usuario.cargo]?.nome || usuario.cargo}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    bgcolor: `${CARGOS[usuario.cargo]?.cor}20`,
                    color: CARGOS[usuario.cargo]?.cor,
                  }}
                />
                
                <Chip
                  size="small"
                  icon={usuario.status === 'ativo' ? <CheckCircleIcon sx={{ fontSize: 12 }} /> : <BlockIcon sx={{ fontSize: 12 }} />}
                  label={usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  color={usuario.status === 'ativo' ? 'success' : 'error'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {usuario.email}
                </Typography>
                {usuario.telefone && (
                  <Typography variant="caption" color="text.secondary">
                    • {usuario.telefone}
                  </Typography>
                )}
              </Box>

              {usuario.cargo === 'cliente' && clienteVinculado && (
                <Box sx={{ mt: 0.5 }}>
                  <FidelidadeInfo 
                    clienteId={usuario.clienteId}
                    pontos={pontosCliente}
                    nivel={nivelCliente}
                  />
                </Box>
              )}

              {(profissionalVinculado || clienteVinculado) && (
                <Box sx={{ mt: 0.5 }}>
                  {profissionalVinculado && (
                    <Chip
                      size="small"
                      icon={<BadgeIcon sx={{ fontSize: 12 }} />}
                      label={`Profissional: ${profissionalVinculado.nome}`}
                      sx={{ height: 20, fontSize: '0.65rem', mr: 0.5 }}
                    />
                  )}
                  {clienteVinculado && (
                    <Chip
                      size="small"
                      icon={<PersonIcon sx={{ fontSize: 12 }} />}
                      label={`Cliente: ${clienteVinculado.nome}`}
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>
              )}

              <Collapse in={expanded}>
                <Box sx={{ 
                  mt: 2, 
                  pt: 2, 
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'flex-end'
                }} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => onEditar(usuario)}
                      sx={{ color: '#9c27b0' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Gerenciar Permissões">
                    <IconButton
                      size="small"
                      onClick={() => onPermissoes(usuario)}
                      sx={{ color: '#ff4081' }}
                    >
                      <LockIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {usuario.cargo === 'cliente' && usuario.clienteId && (
                    <Tooltip title="Gerenciar Pontos">
                      <IconButton
                        size="small"
                        onClick={() => onPontos(usuario)}
                        sx={{ color: '#ff9800' }}
                      >
                        <StarIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title={usuario.status === 'ativo' ? 'Desativar' : 'Ativar'}>
                    <IconButton
                      size="small"
                      onClick={() => onToggleStatus(usuario)}
                      sx={{ color: usuario.status === 'ativo' ? '#f44336' : '#4caf50' }}
                    >
                      {usuario.status === 'ativo' ? <BlockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      onClick={() => onExcluir(usuario)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente Principal
function GerenciarUsuarios() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pontuacaoClientes, setPontuacaoClientes] = useState({});
  const [filtro, setFiltro] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPermissoesDialog, setOpenPermissoesDialog] = useState(false);
  const [openPontosDialog, setOpenPontosDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // Estado para gerenciamento de pontos
  const [pontosForm, setPontosForm] = useState({
    quantidade: '',
    tipo: 'credito',
    motivo: '',
  });

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cargo: 'atendente',
    telefone: '',
    profissionalId: '',
    clienteId: '',
    permissoes: [],
    status: 'ativo',
    avatar: null,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados de usuários...');

      const [usuariosData, profissionaisData, clientesData, pontuacaoData] = await Promise.all([
        firebaseService.getAll('usuarios').catch(err => {
          console.error('Erro ao buscar usuarios:', err);
          return [];
        }),
        firebaseService.getAll('profissionais').catch(err => {
          console.error('Erro ao buscar profissionais:', err);
          return [];
        }),
        firebaseService.getAll('clientes').catch(err => {
          console.error('Erro ao buscar clientes:', err);
          return [];
        }),
        firebaseService.getAll('pontuacao').catch(err => {
          console.error('Erro ao buscar pontuacao:', err);
          return [];
        })
      ]);
      
      setUsuarios(usuariosData || []);
      setProfissionais(profissionaisData || []);
      setClientes(clientesData || []);
      
      // Processar pontuação por cliente
      const pontuacaoPorCliente = {};
      (pontuacaoData || []).forEach(p => {
        if (!pontuacaoPorCliente[p.clienteId]) {
          pontuacaoPorCliente[p.clienteId] = {
            total: 0,
            historico: []
          };
        }
        pontuacaoPorCliente[p.clienteId].historico.push(p);
        if (p.tipo === 'credito') {
          pontuacaoPorCliente[p.clienteId].total += p.quantidade || 0;
        } else if (p.tipo === 'debito') {
          pontuacaoPorCliente[p.clienteId].total -= p.quantidade || 0;
        }
      });
      
      setPontuacaoClientes(pontuacaoPorCliente);

      // Registrar acesso na auditoria
      await auditoriaService.registrar('acesso_gerenciar_usuarios', {
        entidade: 'usuarios',
        detalhes: 'Acesso à página de gerenciamento de usuários',
        dados: {
          totalUsuarios: usuariosData?.length || 0,
          totalProfissionais: profissionaisData?.length || 0,
          totalClientes: clientesData?.length || 0
        }
      });

      console.log('📊 Dados carregados:', {
        usuarios: usuariosData?.length || 0,
        profissionais: profissionaisData?.length || 0,
        clientes: clientesData?.length || 0
      });

      mostrarSnackbar('Dados carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_gerenciar_usuarios',
        detalhes: 'Erro ao carregar dados de usuários'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (usuario = null) => {
    if (usuario) {
      setUsuarioEditando(usuario);
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '',
        confirmarSenha: '',
        cargo: usuario.cargo || 'atendente',
        telefone: usuario.telefone || '',
        profissionalId: usuario.profissionalId || '',
        clienteId: usuario.clienteId || '',
        permissoes: usuario.permissoes || CARGOS[usuario.cargo]?.permissoes || [],
        status: usuario.status || 'ativo',
        avatar: usuario.avatar || null,
      });
    } else {
      setUsuarioEditando(null);
      setFormData({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        cargo: 'atendente',
        telefone: '',
        profissionalId: '',
        clienteId: '',
        permissoes: CARGOS.atendente.permissoes,
        status: 'ativo',
        avatar: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUsuarioEditando(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleOpenPermissoesDialog = (usuario) => {
    setUsuarioSelecionado(usuario);
    setFormData({
      ...formData,
      permissoes: usuario.permissoes || CARGOS[usuario.cargo]?.permissoes || [],
    });
    setOpenPermissoesDialog(true);
  };

  const handleClosePermissoesDialog = () => {
    setOpenPermissoesDialog(false);
    setUsuarioSelecionado(null);
  };

  const handleOpenPontosDialog = (usuario) => {
    setUsuarioSelecionado(usuario);
    setPontosForm({
      quantidade: '',
      tipo: 'credito',
      motivo: '',
    });
    setOpenPontosDialog(true);
  };

  const handleClosePontosDialog = () => {
    setOpenPontosDialog(false);
    setUsuarioSelecionado(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'cargo') {
      setFormData(prev => ({
        ...prev,
        permissoes: CARGOS[value]?.permissoes || []
      }));
    }
  };

  const handlePontosInputChange = (e) => {
    const { name, value } = e.target;
    setPontosForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissaoChange = (permissao) => {
    setFormData(prev => {
      const novasPermissoes = prev.permissoes.includes(permissao)
        ? prev.permissoes.filter(p => p !== permissao)
        : [...prev.permissoes, permissao];
      return { ...prev, permissoes: novasPermissoes };
    });
  };

  const handleSalvar = async () => {
    try {
      if (!formData.nome?.trim()) {
        mostrarSnackbar('Nome é obrigatório', 'error');
        return;
      }

      if (!formData.email?.trim()) {
        mostrarSnackbar('Email é obrigatório', 'error');
        return;
      }

      if (!usuarioEditando && !formData.senha) {
        mostrarSnackbar('Senha é obrigatória para novo usuário', 'error');
        return;
      }

      if (formData.senha && formData.senha.length < 6) {
        mostrarSnackbar('Senha deve ter pelo menos 6 caracteres', 'error');
        return;
      }

      if (formData.senha !== formData.confirmarSenha) {
        mostrarSnackbar('Senhas não conferem', 'error');
        return;
      }

      const emailExistente = usuarios.find(u => 
        u.email === formData.email && u.id !== (usuarioEditando?.id)
      );

      if (emailExistente) {
        mostrarSnackbar('Email já cadastrado', 'error');
        return;
      }

      const dadosParaSalvar = {
        nome: String(formData.nome).trim(),
        email: String(formData.email).toLowerCase().trim(),
        cargo: String(formData.cargo),
        telefone: formData.telefone ? String(formData.telefone).trim() : null,
        profissionalId: formData.profissionalId || null,
        clienteId: formData.clienteId || null,
        permissoes: formData.permissoes || [],
        status: String(formData.status),
        avatar: formData.avatar,
        updatedAt: new Date().toISOString(),
      };

      if (!usuarioEditando) {
        dadosParaSalvar.senha = String(formData.senha);
        dadosParaSalvar.dataCadastro = new Date().toISOString();
        dadosParaSalvar.ultimoAcesso = null;
      } else if (formData.senha) {
        dadosParaSalvar.senha = String(formData.senha);
      }

      if (usuarioEditando) {
        const usuarioAntigo = { ...usuarioEditando };
        
        await firebaseService.update('usuarios', usuarioEditando.id, dadosParaSalvar);
        
        setUsuarios(prev => prev.map(u => 
          u.id === usuarioEditando.id ? { ...u, ...dadosParaSalvar, id: usuarioEditando.id } : u
        ));

        await auditoriaService.registrarAtualizacao(
          'usuarios',
          usuarioEditando.id,
          usuarioAntigo,
          dadosParaSalvar,
          `Atualização do usuário: ${formData.nome}`
        );
        
        mostrarSnackbar('Usuário atualizado com sucesso!');
      } else {
        const novoId = await firebaseService.add('usuarios', dadosParaSalvar);
        setUsuarios([...usuarios, { ...dadosParaSalvar, id: novoId }]);

        await auditoriaService.registrarCriacao(
          'usuarios',
          novoId,
          dadosParaSalvar,
          `Criação do usuário: ${formData.nome}`
        );

        mostrarSnackbar('Usuário criado com sucesso!');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      mostrarSnackbar('Erro ao salvar usuário', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: usuarioEditando ? 'atualizar_usuario' : 'criar_usuario',
        dados: formData
      });
    }
  };

  const handleSalvarPontos = async () => {
    try {
      if (!pontosForm.quantidade || pontosForm.quantidade <= 0) {
        mostrarSnackbar('Quantidade inválida', 'error');
        return;
      }

      if (!pontosForm.motivo.trim()) {
        mostrarSnackbar('Motivo é obrigatório', 'error');
        return;
      }

      const clienteVinculado = clientes.find(c => c.id === usuarioSelecionado.clienteId);
      
      if (!clienteVinculado) {
        mostrarSnackbar('Usuário não está vinculado a um cliente', 'error');
        return;
      }

      const quantidade = parseInt(pontosForm.quantidade);
      
      const pontuacaoData = {
        clienteId: usuarioSelecionado.clienteId,
        clienteNome: clienteVinculado.nome,
        quantidade: quantidade,
        tipo: pontosForm.tipo,
        motivo: pontosForm.motivo,
        data: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        usuarioResponsavel: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
      };

      await firebaseService.add('pontuacao', pontuacaoData);

      await auditoriaService.registrar(
        pontosForm.tipo === 'credito' ? 'credito_pontos_usuario' : 'debito_pontos_usuario',
        {
          entidade: 'pontuacao',
          entidadeId: usuarioSelecionado.clienteId,
          detalhes: `${pontosForm.tipo === 'credito' ? 'Adição' : 'Remoção'} de ${quantidade} pontos para ${clienteVinculado.nome}`,
          dados: {
            usuarioId: usuarioSelecionado.id,
            clienteId: usuarioSelecionado.clienteId,
            quantidade,
            motivo: pontosForm.motivo,
            tipo: pontosForm.tipo
          }
        }
      );

      setPontuacaoClientes(prev => {
        const novo = { ...prev };
        if (!novo[usuarioSelecionado.clienteId]) {
          novo[usuarioSelecionado.clienteId] = { total: 0, historico: [] };
        }
        novo[usuarioSelecionado.clienteId].historico.push(pontuacaoData);
        if (pontuacaoData.tipo === 'credito') {
          novo[usuarioSelecionado.clienteId].total += pontuacaoData.quantidade;
        } else {
          novo[usuarioSelecionado.clienteId].total -= pontuacaoData.quantidade;
        }
        return novo;
      });

      mostrarSnackbar('Pontos adicionados com sucesso!');
      handleClosePontosDialog();
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      mostrarSnackbar('Erro ao adicionar pontos', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'gerenciar_pontos_usuario',
        usuarioId: usuarioSelecionado?.id,
        dados: pontosForm
      });
    }
  };

  const handleSalvarPermissoes = async () => {
    try {
      await firebaseService.update('usuarios', usuarioSelecionado.id, {
        permissoes: formData.permissoes,
        updatedAt: new Date().toISOString(),
      });

      setUsuarios(prev => prev.map(u => 
        u.id === usuarioSelecionado.id 
          ? { ...u, permissoes: formData.permissoes }
          : u
      ));

      await auditoriaService.registrar('atualizar_permissoes', {
        entidade: 'usuarios',
        entidadeId: usuarioSelecionado.id,
        detalhes: `Atualização de permissões do usuário: ${usuarioSelecionado.nome}`,
        dados: {
          permissoes: formData.permissoes
        }
      });

      mostrarSnackbar('Permissões atualizadas com sucesso!');
      handleClosePermissoesDialog();
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      mostrarSnackbar('Erro ao salvar permissões', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'atualizar_permissoes',
        usuarioId: usuarioSelecionado?.id
      });
    }
  };

  const handleToggleStatus = async (usuario) => {
    try {
      const novoStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo';
      
      await firebaseService.update('usuarios', usuario.id, {
        status: novoStatus,
        updatedAt: new Date().toISOString(),
      });

      setUsuarios(prev => prev.map(u => 
        u.id === usuario.id ? { ...u, status: novoStatus } : u
      ));

      await auditoriaService.registrar(
        novoStatus === 'ativo' ? 'ativar_usuario' : 'desativar_usuario',
        {
          entidade: 'usuarios',
          entidadeId: usuario.id,
          detalhes: `Usuário ${novoStatus === 'ativo' ? 'ativado' : 'desativado'}: ${usuario.nome}`,
          dados: { statusAnterior: usuario.status, statusNovo: novoStatus }
        }
      );

      mostrarSnackbar(`Usuário ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarSnackbar('Erro ao alterar status do usuário', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'toggle_status_usuario',
        usuarioId: usuario.id
      });
    }
  };

  const handleDelete = async () => {
    try {
      await firebaseService.delete('usuarios', confirmDelete.id);
      setUsuarios(usuarios.filter(u => u.id !== confirmDelete.id));

      await auditoriaService.registrar('excluir_usuario', {
        entidade: 'usuarios',
        entidadeId: confirmDelete.id,
        detalhes: `Exclusão do usuário: ${confirmDelete.nome}`,
        dados: { usuario: confirmDelete }
      });

      mostrarSnackbar('Usuário excluído com sucesso!');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      mostrarSnackbar('Erro ao excluir usuário', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'excluir_usuario',
        usuarioId: confirmDelete?.id
      });
    }
  };

  const handlePrintPDF = async () => {
    try {
      const doc = new jsPDF();
      
      doc.setFillColor(156, 39, 176);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE USUÁRIOS', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 30, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      let yPos = 50;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, 170, 50, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total de Usuários:', 25, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.total), 70, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Ativos:', 100, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.ativos), 120, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Inativos:', 140, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.inativos), 160, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Clientes:', 25, yPos + 25);
      doc.setFont('helvetica', 'normal');
      doc.text(String(stats.clientes), 50, yPos + 25);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total de Pontos:', 80, yPos + 25);
      doc.setFont('helvetica', 'normal');
      doc.text(String(statsFidelidade.totalPontos), 120, yPos + 25);
      
      yPos += 70;

      const tableColumn = ['Nome', 'Email', 'Cargo', 'Status', 'Pontos'];
      const tableRows = [];
      
      usuariosFiltrados.slice(0, 50).forEach(u => {
        const pontosCliente = u.clienteId ? pontuacaoClientes[u.clienteId]?.total || 0 : 0;
        
        const row = [
          u.nome,
          u.email,
          CARGOS[u.cargo]?.nome || u.cargo,
          u.status === 'ativo' ? 'Ativo' : 'Inativo',
          u.cargo === 'cliente' ? String(pontosCliente) : '-',
        ];
        tableRows.push(row);
      });
      
      doc.autoTable({
        startY: yPos,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [156, 39, 176],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
      });
      
      await auditoriaService.registrar('exportar_relatorio_usuarios', {
        entidade: 'usuarios',
        detalhes: 'Exportação de relatório de usuários',
        dados: {
          formato: 'PDF',
          totalUsuarios: usuariosFiltrados.length,
          stats
        }
      });
      
      window.open(doc.output('bloburl'), '_blank');
      setOpenPrintDialog(false);
      mostrarSnackbar('PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarSnackbar('Erro ao gerar PDF', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_relatorio_usuarios_pdf'
      });
    }
  };

  const handleExportarCSV = async () => {
    try {
      const dadosExport = usuariosFiltrados.map(u => {
        const pontosCliente = u.clienteId ? pontuacaoClientes[u.clienteId]?.total || 0 : 0;
        const profissionalVinculado = profissionais.find(p => p.id === u.profissionalId);
        const clienteVinculado = clientes.find(c => c.id === u.clienteId);
        
        return {
          'Nome': u.nome,
          'Email': u.email,
          'Telefone': u.telefone || '',
          'Cargo': CARGOS[u.cargo]?.nome || u.cargo,
          'Status': u.status === 'ativo' ? 'Ativo' : 'Inativo',
          'Vínculo Profissional': profissionalVinculado?.nome || '',
          'Vínculo Cliente': clienteVinculado?.nome || '',
          'Pontos': u.cargo === 'cliente' ? pontosCliente : '',
          'Data Cadastro': u.dataCadastro ? formatDate(u.dataCadastro) : '',
          'Último Acesso': u.ultimoAcesso ? formatDate(u.ultimoAcesso) : '',
        };
      });

      const headers = ['Nome', 'Email', 'Telefone', 'Cargo', 'Status', 'Vínculo Profissional', 'Vínculo Cliente', 'Pontos', 'Data Cadastro', 'Último Acesso'];
      const csvContent = [
        headers.join(','),
        ...dadosExport.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `usuarios_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      await auditoriaService.registrar('exportar_relatorio_usuarios', {
        entidade: 'usuarios',
        detalhes: 'Exportação de relatório de usuários',
        dados: {
          formato: 'CSV',
          totalUsuarios: usuariosFiltrados.length
        }
      });

      setOpenPrintDialog(false);
      mostrarSnackbar('CSV exportado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      mostrarSnackbar('Erro ao exportar CSV', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_relatorio_usuarios_csv'
      });
    }
  };

  // Determinar nível baseado em pontos
  const getNivelByPontos = (pontos) => {
    if (pontos >= 5000) return 'platina';
    if (pontos >= 2000) return 'ouro';
    if (pontos >= 500) return 'prata';
    return 'bronze';
  };

  // Filtrar usuários
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(usuario => {
      if (tabValue === 1 && usuario.cargo !== 'cliente') return false;
      if (tabValue === 2 && usuario.cargo === 'cliente') return false;

      const matchesTexto = filtro === '' || 
        usuario.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(filtro.toLowerCase()) ||
        usuario.telefone?.includes(filtro);

      const matchesCargo = filtroCargo === 'todos' || usuario.cargo === filtroCargo;
      const matchesStatus = filtroStatus === 'todos' || usuario.status === filtroStatus;

      let matchesNivel = true;
      if (filtroNivel !== 'todos' && usuario.cargo === 'cliente' && usuario.clienteId) {
        const pontosCliente = pontuacaoClientes[usuario.clienteId]?.total || 0;
        const nivelCliente = getNivelByPontos(pontosCliente);
        matchesNivel = nivelCliente === filtroNivel;
      }

      return matchesTexto && matchesCargo && matchesStatus && matchesNivel;
    });
  }, [usuarios, filtro, filtroCargo, filtroStatus, filtroNivel, tabValue, pontuacaoClientes]);

  // Estatísticas
  const stats = useMemo(() => ({
    total: usuarios.length,
    ativos: usuarios.filter(u => u.status === 'ativo').length,
    inativos: usuarios.filter(u => u.status === 'inativo').length,
    admins: usuarios.filter(u => u.cargo === 'admin').length,
    gerentes: usuarios.filter(u => u.cargo === 'gerente').length,
    atendentes: usuarios.filter(u => u.cargo === 'atendente').length,
    profissionais: usuarios.filter(u => u.cargo === 'profissional').length,
    clientes: usuarios.filter(u => u.cargo === 'cliente').length,
  }), [usuarios]);

  // Estatísticas de fidelidade
  const statsFidelidade = useMemo(() => ({
    totalPontos: Object.values(pontuacaoClientes).reduce((acc, c) => acc + (c.total || 0), 0),
    clientesComPontos: Object.keys(pontuacaoClientes).length,
    niveis: {
      bronze: Object.values(pontuacaoClientes).filter(c => getNivelByPontos(c.total) === 'bronze').length,
      prata: Object.values(pontuacaoClientes).filter(c => getNivelByPontos(c.total) === 'prata').length,
      ouro: Object.values(pontuacaoClientes).filter(c => getNivelByPontos(c.total) === 'ouro').length,
      platina: Object.values(pontuacaoClientes).filter(c => getNivelByPontos(c.total) === 'platina').length,
    }
  }), [pontuacaoClientes]);

  // Paginação
  const paginatedUsuarios = usuariosFiltrados.slice(
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    setFiltroCargo('todos');
    setFiltroNivel('todos');
  };

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={6} sm={2.4} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 140 : 60} sx={{ borderRadius: 2, mb: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      pb: isMobile ? 10 : 3,
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      {/* Cabeçalho Mobile */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ 
              fontWeight: 700, 
              color: '#9c27b0',
              fontSize: isMobile ? '1.5rem' : '2.125rem'
            }}
          >
            Usuários
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {stats.total} usuários | {stats.clientes} clientes
          </Typography>
        </Box>
        
        <Zoom in={true}>
          <Fab
            size="small"
            onClick={() => setOpenPrintDialog(true)}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
            }}
          >
            <PrintIcon />
          </Fab>
        </Zoom>
      </Box>

      {/* Cards de Estatísticas Mobile */}
      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ bgcolor: '#f3e5f5' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#e8f5e8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Ativos
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.ativos}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Clientes
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {stats.clientes}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Pontos
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {statsFidelidade.totalPontos}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={6} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  C/ Pontos
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {statsFidelidade.clientesComPontos}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Tabs Mobile */}
      <Paper sx={{ mb: 2, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: isMobile ? '0.7rem' : '0.875rem',
            }
          }}
        >
          <Tab 
            icon={<PersonIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Todos" 
            iconPosition="start"
          />
          <Tab 
            icon={<StarIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Clientes" 
            iconPosition="start"
          />
          <Tab 
            icon={<BadgeIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Funcionários" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Barra de Pesquisa e Filtros */}
      <Paper
        elevation={0}
        sx={{
          p: 0.5,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar usuário..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', ml: 1 }} />
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
          sx={{ ml: 1 }}
        />
        
        <IconButton 
          onClick={() => setOpenFilterDrawer(true)}
          sx={{ 
            mx: 1,
            color: filtroCargo !== 'todos' || filtroStatus !== 'todos' || filtroNivel !== 'todos' ? '#9c27b0' : 'text.secondary'
          }}
        >
          <Badge 
            variant="dot" 
            color="primary"
            invisible={filtroCargo === 'todos' && filtroStatus === 'todos' && filtroNivel === 'todos'}
          >
            <FilterIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={carregarDados} sx={{ color: 'text.secondary' }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Botão Novo Usuário Mobile */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
        >
          Novo Usuário
        </Button>
      </Box>

      {/* Lista de Usuários Mobile */}
      <AnimatePresence>
        {paginatedUsuarios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhum usuário encontrado
              </Typography>
            </Paper>
          </motion.div>
        ) : (
          paginatedUsuarios.map((usuario) => {
            const profissionalVinculado = profissionais.find(p => p.id === usuario.profissionalId);
            const clienteVinculado = clientes.find(c => c.id === usuario.clienteId);
            const pontosCliente = usuario.clienteId ? pontuacaoClientes[usuario.clienteId]?.total || 0 : 0;
            const nivelCliente = usuario.clienteId ? getNivelByPontos(pontosCliente) : null;

            return (
              <UsuarioMobileCard
                key={usuario.id}
                usuario={usuario}
                cargo={CARGOS[usuario.cargo]}
                profissionalVinculado={profissionalVinculado}
                clienteVinculado={clienteVinculado}
                pontosCliente={pontosCliente}
                nivelCliente={nivelCliente}
                onEditar={handleOpenDialog}
                onPermissoes={handleOpenPermissoesDialog}
                onPontos={handleOpenPontosDialog}
                onToggleStatus={handleToggleStatus}
                onExcluir={setConfirmDelete}
              />
            );
          })
        )}
      </AnimatePresence>

      {/* Paginação */}
      {usuariosFiltrados.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(usuariosFiltrados.length / rowsPerPage)}
              page={page + 1}
              onChange={(e, v) => setPage(v - 1)}
              color="primary"
              size={isMobile ? "small" : "large"}
            />
          </Stack>
        </Box>
      )}

      {/* Drawer de Filtros */}
      <SwipeableDrawer
        anchor="bottom"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        onOpen={() => setOpenFilterDrawer(true)}
        disableSwipeToOpen={false}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80vh',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filtros
            </Typography>
            <IconButton onClick={() => setOpenFilterDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Cargo
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            <Button
              fullWidth
              variant={filtroCargo === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroCargo('todos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todos os cargos
            </Button>
            {Object.keys(CARGOS).map(cargo => (
              <Button
                key={cargo}
                fullWidth
                variant={filtroCargo === cargo ? 'contained' : 'outlined'}
                onClick={() => setFiltroCargo(cargo)}
                sx={{ 
                  justifyContent: 'flex-start',
                  color: filtroCargo === cargo ? 'white' : CARGOS[cargo].cor,
                  borderColor: CARGOS[cargo].cor,
                  bgcolor: filtroCargo === cargo ? CARGOS[cargo].cor : 'transparent',
                }}
              >
                {CARGOS[cargo].icone} {CARGOS[cargo].nome}
              </Button>
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Status
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            <Button
              fullWidth
              variant={filtroStatus === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroStatus('todos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todos os status
            </Button>
            <Button
              fullWidth
              variant={filtroStatus === 'ativo' ? 'contained' : 'outlined'}
              onClick={() => setFiltroStatus('ativo')}
              sx={{ 
                justifyContent: 'flex-start',
                color: filtroStatus === 'ativo' ? 'white' : '#4caf50',
                borderColor: '#4caf50',
                bgcolor: filtroStatus === 'ativo' ? '#4caf50' : 'transparent',
              }}
            >
              <CheckCircleIcon sx={{ mr: 1, fontSize: 18 }} />
              Ativos
            </Button>
            <Button
              fullWidth
              variant={filtroStatus === 'inativo' ? 'contained' : 'outlined'}
              onClick={() => setFiltroStatus('inativo')}
              sx={{ 
                justifyContent: 'flex-start',
                color: filtroStatus === 'inativo' ? 'white' : '#f44336',
                borderColor: '#f44336',
                bgcolor: filtroStatus === 'inativo' ? '#f44336' : 'transparent',
              }}
            >
              <BlockIcon sx={{ mr: 1, fontSize: 18 }} />
              Inativos
            </Button>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Nível Fidelidade
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant={filtroNivel === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroNivel('todos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todos os níveis
            </Button>
            {['bronze', 'prata', 'ouro', 'platina'].map((nivel) => (
              <Button
                key={nivel}
                fullWidth
                variant={filtroNivel === nivel ? 'contained' : 'outlined'}
                onClick={() => setFiltroNivel(nivel)}
                sx={{ 
                  justifyContent: 'flex-start',
                  textTransform: 'uppercase',
                }}
              >
                {nivel}
              </Button>
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={() => setOpenFilterDrawer(false)}
            sx={{ bgcolor: '#9c27b0', mt: 3 }}
          >
            Aplicar Filtros
          </Button>
        </Box>
      </SwipeableDrawer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullScreen={isMobile}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#9c27b0', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: isMobile ? 2 : 3,
        }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={handleCloseDialog}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                placeholder="(11) 99999-9999"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Cargo *</InputLabel>
                <Select
                  name="cargo"
                  value={formData.cargo}
                  label="Cargo *"
                  onChange={handleInputChange}
                >
                  {Object.keys(CARGOS).map(cargo => (
                    <MenuItem key={cargo} value={cargo}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {CARGOS[cargo].icone}
                        {CARGOS[cargo].nome}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.cargo === 'profissional' && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Profissional Vinculado</InputLabel>
                  <Select
                    name="profissionalId"
                    value={formData.profissionalId}
                    label="Profissional Vinculado"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {profissionais.map(prof => (
                      <MenuItem key={prof.id} value={prof.id}>
                        {prof.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.cargo === 'cliente' && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cliente Vinculado</InputLabel>
                  <Select
                    name="clienteId"
                    value={formData.clienteId}
                    label="Cliente Vinculado"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {clientes.map(cli => (
                      <MenuItem key={cli.id} value={cli.id}>
                        {cli.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 1, color: '#9c27b0' }}>Segurança</Divider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={usuarioEditando ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
                name="senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={handleInputChange}
                required={!usuarioEditando}
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirmar Senha"
                name="confirmarSenha"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmarSenha}
                onChange={handleInputChange}
                required={!usuarioEditando}
                variant="outlined"
                size="small"
                error={formData.senha !== formData.confirmarSenha && formData.confirmarSenha !== ''}
                helperText={
                  formData.senha !== formData.confirmarSenha && formData.confirmarSenha !== ''
                    ? 'Senhas não conferem'
                    : ''
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={handleCloseDialog} fullWidth={isMobile}>Cancelar</Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
            fullWidth={isMobile}
          >
            {usuarioEditando ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Permissões */}
      <Dialog 
        open={openPermissoesDialog} 
        onClose={handleClosePermissoesDialog}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#ff4081', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: isMobile ? 2 : 3,
        }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={handleClosePermissoesDialog}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            Gerenciar Permissões - {usuarioSelecionado?.nome}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#ff4081', fontWeight: 600 }}>
              Permissões Disponíveis
            </Typography>
            <Grid container spacing={2}>
              {[
                { valor: 'admin', label: 'Administrador Total' },
                { valor: 'gerenciar_usuarios', label: 'Gerenciar Usuários' },
                { valor: 'gerenciar_clientes', label: 'Gerenciar Clientes' },
                { valor: 'gerenciar_agendamentos', label: 'Gerenciar Agendamentos' },
                { valor: 'gerenciar_servicos', label: 'Gerenciar Serviços' },
                { valor: 'gerenciar_profissionais', label: 'Gerenciar Profissionais' },
                { valor: 'gerenciar_estoque', label: 'Gerenciar Estoque' },
                { valor: 'visualizar_relatorios', label: 'Visualizar Relatórios' },
                { valor: 'configurar_sistema', label: 'Configurar Sistema' },
                { valor: 'visualizar_clientes', label: 'Visualizar Clientes' },
                { valor: 'visualizar_agenda', label: 'Visualizar Agenda' },
                { valor: 'gerenciar_atendimentos', label: 'Gerenciar Atendimentos' },
                { valor: 'visualizar_comissoes', label: 'Visualizar Comissões' },
                { valor: 'gerenciar_backup', label: 'Gerenciar Backup' },
                { valor: 'gerenciar_fidelidade', label: 'Gerenciar Fidelidade' },
                { valor: 'visualizar_todos_pontos', label: 'Visualizar Pontos (Todos)' },
                { valor: 'visualizar_pontos_cliente', label: 'Visualizar Pontos do Cliente' },
                { valor: 'visualizar_meus_agendamentos', label: 'Visualizar Meus Agendamentos' },
                { valor: 'visualizar_fidelidade', label: 'Visualizar Fidelidade' },
                { valor: 'visualizar_meus_pontos', label: 'Visualizar Meus Pontos' },
                { valor: 'resgatar_recompensas', label: 'Resgatar Recompensas' },
              ].map((permissao) => (
                <Grid item xs={12} sm={6} key={permissao.valor}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.permissoes?.includes(permissao.valor) || false}
                        onChange={() => handlePermissaoChange(permissao.valor)}
                        color="secondary"
                      />
                    }
                    label={permissao.label}
                    labelPlacement="end"
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={handleClosePermissoesDialog} fullWidth={isMobile}>Cancelar</Button>
          <Button
            onClick={handleSalvarPermissoes}
            variant="contained"
            sx={{ bgcolor: '#ff4081', '&:hover': { bgcolor: '#f50057' } }}
            fullWidth={isMobile}
          >
            Salvar Permissões
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Gerenciamento de Pontos */}
      <Dialog 
        open={openPontosDialog} 
        onClose={handleClosePontosDialog}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#ff9800', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: isMobile ? 2 : 3,
        }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={handleClosePontosDialog}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            Gerenciar Pontos - {usuarioSelecionado?.nome}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Saldo Atual: <strong>{usuarioSelecionado?.clienteId ? pontuacaoClientes[usuarioSelecionado.clienteId]?.total || 0 : 0} pontos</strong>
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de Movimentação</InputLabel>
                  <Select
                    name="tipo"
                    value={pontosForm.tipo}
                    label="Tipo de Movimentação"
                    onChange={handlePontosInputChange}
                  >
                    <MenuItem value="credito">Adicionar Pontos (Crédito)</MenuItem>
                    <MenuItem value="debito">Remover Pontos (Débito)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantidade de Pontos"
                  name="quantidade"
                  type="number"
                  value={pontosForm.quantidade}
                  onChange={handlePontosInputChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StarIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Motivo"
                  name="motivo"
                  value={pontosForm.motivo}
                  onChange={handlePontosInputChange}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Ex: Compra de serviço, Indicação, Aniversário..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={handleClosePontosDialog} fullWidth={isMobile}>Cancelar</Button>
          <Button
            onClick={handleSalvarPontos}
            variant="contained"
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
            fullWidth={isMobile}
          >
            Salvar Movimentação
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Impressão */}
      <Dialog 
        open={openPrintDialog} 
        onClose={() => setOpenPrintDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PrintIcon />
            <Typography variant="h6">Exportar Relatório</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Escolha o formato para exportar:
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePrintPDF}
                  sx={{ 
                    p: 3,
                    bgcolor: '#f44336',
                    '&:hover': { bgcolor: '#d32f2f' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <PictureAsPdfIcon sx={{ fontSize: 40 }} />
                  <Typography variant="body1">PDF</Typography>
                  <Typography variant="caption">Relatório profissional</Typography>
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleExportarCSV}
                  sx={{ 
                    p: 3,
                    bgcolor: '#2196f3',
                    '&:hover': { bgcolor: '#1976d2' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <DownloadIcon sx={{ fontSize: 40 }} />
                  <Typography variant="body1">CSV</Typography>
                  <Typography variant="caption">Planilha/editável</Typography>
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  Total de usuários: {stats.total}
                </Typography>
                <Typography variant="body2">
                  Ativos: {stats.ativos} | Inativos: {stats.inativos}
                </Typography>
                <Typography variant="body2">
                  Clientes: {stats.clientes}
                </Typography>
                <Typography variant="body2">
                  Total de pontos: {statsFidelidade.totalPontos}
                </Typography>
              </Alert>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog 
        open={!!confirmDelete} 
        onClose={() => setConfirmDelete(null)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <WarningIcon sx={{ fontSize: 48, color: '#f44336', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Tem certeza que deseja excluir o usuário <strong>{confirmDelete?.nome}</strong>?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Esta ação não poderá ser desfeita.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={() => setConfirmDelete(null)} fullWidth={isMobile}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDelete}
            fullWidth={isMobile}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bottom Navigation Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1000,
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => {
              setBottomNavValue(newValue);
              switch(newValue) {
                case 0:
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  break;
                case 1:
                  setOpenFilterDrawer(true);
                  break;
                case 2:
                  handleOpenDialog();
                  break;
                case 3:
                  setOpenPrintDialog(true);
                  break;
                default:
                  break;
              }
            }}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root.Mui-selected': {
                color: '#9c27b0',
              },
            }}
          >
            <BottomNavigationAction label="Início" icon={<PersonIcon />} />
            <BottomNavigationAction 
              label="Filtros" 
              icon={
                <Badge 
                  variant="dot" 
                  color="primary"
                  invisible={filtroCargo === 'todos' && filtroStatus === 'todos' && filtroNivel === 'todos'}
                >
                  <FilterIcon />
                </Badge>
              } 
            />
            <BottomNavigationAction label="Novo" icon={<AddIcon />} />
            <BottomNavigationAction label="Exportar" icon={<PrintIcon />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GerenciarUsuarios;
