// src/pages/GerenciarUsuarios.js
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
  Avatar,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
  LinearProgress,
  TablePagination,
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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';

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
    ]
  },
  atendente: {
    nome: 'Atendente',
    cor: '#4caf50',
    icone: <PersonIcon />,
    permissoes: [
      'gerenciar_agendamentos',
      'visualizar_clientes',
    ]
  },
  profissional: {
    nome: 'Profissional',
    cor: '#ff9800',
    icone: <BadgeIcon />,
    permissoes: [
      'visualizar_agenda',
      'gerenciar_atendimentos',
    ]
  }
};

function GerenciarUsuarios() {
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPermissoesDialog, setOpenPermissoesDialog] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cargo: 'atendente',
    telefone: '',
    permissoes: [],
    status: 'ativo',
    avatar: null,
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await firebaseService.getAll('usuarios').catch(() => []);
      setUsuarios(usuariosData || []);
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Se mudar o cargo, atualizar permissões automaticamente
    if (name === 'cargo') {
      setFormData(prev => ({
        ...prev,
        permissoes: CARGOS[value]?.permissoes || []
      }));
    }
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
      // Validações
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

      // Verificar se email já existe
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
        permissoes: formData.permissoes || [],
        status: String(formData.status),
        avatar: formData.avatar,
        updatedAt: new Date().toISOString(),
      };

      // Se for novo usuário, adicionar senha e data de cadastro
      if (!usuarioEditando) {
        dadosParaSalvar.senha = String(formData.senha);
        dadosParaSalvar.dataCadastro = new Date().toISOString();
        dadosParaSalvar.ultimoAcesso = null;
      } else if (formData.senha) {
        // Se estiver editando e senha foi preenchida, atualizar
        dadosParaSalvar.senha = String(formData.senha);
      }

      if (usuarioEditando) {
        await firebaseService.update('usuarios', usuarioEditando.id, dadosParaSalvar);
        
        // Atualizar estado local
        setUsuarios(prev => prev.map(u => 
          u.id === usuarioEditando.id ? { ...u, ...dadosParaSalvar, id: usuarioEditando.id } : u
        ));
        
        mostrarSnackbar('Usuário atualizado com sucesso!');
      } else {
        const novoId = await firebaseService.add('usuarios', dadosParaSalvar);
        setUsuarios([...usuarios, { ...dadosParaSalvar, id: novoId }]);
        mostrarSnackbar('Usuário criado com sucesso!');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      mostrarSnackbar('Erro ao salvar usuário', 'error');
    }
  };

  const handleSalvarPermissoes = async () => {
    try {
      await firebaseService.update('usuarios', usuarioSelecionado.id, {
        permissoes: formData.permissoes,
        updatedAt: new Date().toISOString(),
      });

      // Atualizar estado local
      setUsuarios(prev => prev.map(u => 
        u.id === usuarioSelecionado.id 
          ? { ...u, permissoes: formData.permissoes }
          : u
      ));

      mostrarSnackbar('Permissões atualizadas com sucesso!');
      handleClosePermissoesDialog();
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      mostrarSnackbar('Erro ao salvar permissões', 'error');
    }
  };

  const handleToggleStatus = async (usuario) => {
    try {
      const novoStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo';
      
      await firebaseService.update('usuarios', usuario.id, {
        status: novoStatus,
        updatedAt: new Date().toISOString(),
      });

      // Atualizar estado local
      setUsuarios(prev => prev.map(u => 
        u.id === usuario.id ? { ...u, status: novoStatus } : u
      ));

      mostrarSnackbar(`Usuário ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarSnackbar('Erro ao alterar status do usuário', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await firebaseService.delete('usuarios', confirmDelete.id);
      setUsuarios(usuarios.filter(u => u.id !== confirmDelete.id));
      mostrarSnackbar('Usuário excluído com sucesso!');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      mostrarSnackbar('Erro ao excluir usuário', 'error');
    }
  };

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchesTexto = filtro === '' || 
      usuario.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(filtro.toLowerCase()) ||
      usuario.telefone?.includes(filtro);

    const matchesCargo = filtroCargo === 'todos' || usuario.cargo === filtroCargo;
    const matchesStatus = filtroStatus === 'todos' || usuario.status === filtroStatus;

    return matchesTexto && matchesCargo && matchesStatus;
  });

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

  // Estatísticas
  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.status === 'ativo').length,
    inativos: usuarios.filter(u => u.status === 'inativo').length,
    admins: usuarios.filter(u => u.cargo === 'admin').length,
    gerentes: usuarios.filter(u => u.cargo === 'gerente').length,
    atendentes: usuarios.filter(u => u.cargo === 'atendente').length,
    profissionais: usuarios.filter(u => u.cargo === 'profissional').length,
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
            Gerenciar Usuários
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie todos os usuários do sistema e suas permissões
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
        >
          Novo Usuário
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ bgcolor: '#f3e5f5' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Usuários
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#e8f5e8' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Usuários Ativos
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.ativos}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Usuários Inativos
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {stats.inativos}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Administradores
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {stats.admins}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Profissionais
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {stats.profissionais}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nome, email ou telefone..."
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

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por Cargo</InputLabel>
                <Select
                  value={filtroCargo}
                  label="Filtrar por Cargo"
                  onChange={(e) => setFiltroCargo(e.target.value)}
                >
                  <MenuItem value="todos">Todos os Cargos</MenuItem>
                  {Object.keys(CARGOS).map(cargo => (
                    <MenuItem key={cargo} value={cargo}>
                      {CARGOS[cargo].nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por Status</InputLabel>
                <Select
                  value={filtroStatus}
                  label="Filtrar por Status"
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <MenuItem value="todos">Todos os Status</MenuItem>
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={carregarUsuarios}
              >
                Atualizar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Usuário</strong></TableCell>
                <TableCell><strong>Contato</strong></TableCell>
                <TableCell><strong>Cargo</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Último Acesso</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {paginatedUsuarios.map((usuario, index) => (
                  <motion.tr
                    key={usuario.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={usuario.avatar}
                          sx={{
                            bgcolor: CARGOS[usuario.cargo]?.cor || '#9c27b0',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {usuario.nome?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {usuario.nome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {usuario.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{usuario.email}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {usuario.telefone || 'Telefone não informado'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={CARGOS[usuario.cargo]?.icone}
                        label={CARGOS[usuario.cargo]?.nome || usuario.cargo}
                        size="small"
                        sx={{
                          bgcolor: `${CARGOS[usuario.cargo]?.cor}20`,
                          color: CARGOS[usuario.cargo]?.cor,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={usuario.status === 'ativo' ? <CheckCircleIcon /> : <BlockIcon />}
                        label={usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        size="small"
                        color={usuario.status === 'ativo' ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {usuario.ultimoAcesso 
                          ? new Date(usuario.ultimoAcesso).toLocaleDateString('pt-BR')
                          : 'Nunca acessou'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {usuario.ultimoAcesso 
                          ? new Date(usuario.ultimoAcesso).toLocaleTimeString('pt-BR')
                          : ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(usuario)}
                            sx={{ color: '#9c27b0' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Gerenciar Permissões">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenPermissoesDialog(usuario)}
                            sx={{ color: '#ff4081' }}
                          >
                            <LockIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={usuario.status === 'ativo' ? 'Desativar' : 'Ativar'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(usuario)}
                            sx={{ color: usuario.status === 'ativo' ? '#f44336' : '#4caf50' }}
                          >
                            {usuario.status === 'ativo' ? <BlockIcon /> : <LockOpenIcon />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => setConfirmDelete(usuario)}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {paginatedUsuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="textSecondary">
                      Nenhum usuário encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={usuariosFiltrados.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
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
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
          >
            {usuarioEditando ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Permissões */}
      <Dialog open={openPermissoesDialog} onClose={handleClosePermissoesDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff4081', color: 'white' }}>
          Gerenciar Permissões - {usuarioSelecionado?.nome}
        </DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={handleClosePermissoesDialog}>Cancelar</Button>
          <Button
            onClick={handleSalvarPermissoes}
            variant="contained"
            sx={{ bgcolor: '#ff4081', '&:hover': { bgcolor: '#f50057' } }}
          >
            Salvar Permissões
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle sx={{ color: '#f44336' }}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o usuário <strong>{confirmDelete?.nome}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Esta ação não poderá ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GerenciarUsuarios;
