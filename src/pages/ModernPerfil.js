// src/pages/ModernPerfil.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  History as HistoryIcon,
  ExitToApp as LogoutIcon,
  Close as CloseIcon,
  Login as LoginIcon,
  Create as CreateIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';

function ModernPerfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [openSenha, setOpenSenha] = useState(false);
  const [openHistorico, setOpenHistorico] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    avatar: null,
  });
  
  const [senhaData, setSenhaData] = useState({
    atual: '',
    nova: '',
    confirmar: '',
  });

  useEffect(() => {
    carregarUsuario();
  }, []);

  useEffect(() => {
    if (usuario) {
      carregarLogs();
    }
  }, [usuario]);

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const carregarUsuario = () => {
    try {
      const userStr = localStorage.getItem('usuario');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUsuario(user);
        setFormData({
          nome: user.nome || '',
          email: user.email || '',
          telefone: user.telefone || '',
          avatar: user.avatar || null,
        });
        setFotoPreview(user.avatar);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      mostrarSnackbar('Erro ao carregar dados do usuário', 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarLogs = async () => {
    try {
      if (!usuario?.id) return;
      
      const todosLogs = await firebaseService.getAll('logs').catch(() => []);
      
      // Filtrar logs do usuário atual e ordenar por data
      const logsFiltrados = todosLogs
        .filter(log => log.usuarioId === usuario.id)
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 20);
      
      setLogs(logsFiltrados);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  const handleFotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        mostrarSnackbar('Por favor, selecione uma imagem válida', 'error');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        mostrarSnackbar('A imagem deve ter no máximo 5MB', 'error');
        return;
      }

      setFotoFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    setFormData({ ...formData, avatar: null });
  };

  const handleEdit = () => {
    setEditando(true);
  };

  const handleCancel = () => {
    setFormData({
      nome: usuario.nome || '',
      email: usuario.email || '',
      telefone: usuario.telefone || '',
      avatar: usuario.avatar || null,
    });
    setFotoPreview(usuario.avatar);
    setFotoFile(null);
    setEditando(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      let avatarUrl = formData.avatar;
      
      // Se houver uma nova foto, fazer upload (simulado)
      if (fotoFile) {
        // Em produção, você enviaria para um serviço como Cloudinary, S3, etc.
        avatarUrl = fotoPreview;
      }

      const dadosAtualizados = {
        ...formData,
        avatar: avatarUrl,
        updatedAt: new Date().toISOString(),
      };

      // Atualizar no Firebase
      await firebaseService.update('usuarios', usuario.id, dadosAtualizados);
      
      // Atualizar o usuário no estado local
      const usuarioAtualizado = { ...usuario, ...dadosAtualizados };
      setUsuario(usuarioAtualizado);
      
      // Atualizar o usuário no localStorage
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
      
      // Registrar log da ação
      await firebaseService.add('logs', {
        usuarioId: usuario.id,
        acao: 'atualizar_perfil',
        detalhes: 'Perfil atualizado',
        data: new Date().toISOString(),
        ip: '127.0.0.1', // Em produção, pegaria o IP real
      });
      
      setEditando(false);
      setFotoFile(null);
      mostrarSnackbar('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      mostrarSnackbar('Erro ao atualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSenha = async () => {
    if (senhaData.nova !== senhaData.confirmar) {
      mostrarSnackbar('As senhas não conferem', 'error');
      return;
    }

    if (senhaData.nova.length < 6) {
      mostrarSnackbar('A nova senha deve ter no mínimo 6 caracteres', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Verificar senha atual
      const usuarios = await firebaseService.getAll('usuarios').catch(() => []);
      const usuarioAtual = usuarios.find(u => u.id === usuario.id);
      
      if (!usuarioAtual || usuarioAtual.senha !== senhaData.atual) {
        mostrarSnackbar('Senha atual incorreta', 'error');
        setLoading(false);
        return;
      }

      // Atualizar senha
      await firebaseService.update('usuarios', usuario.id, {
        senha: senhaData.nova,
        updatedAt: new Date().toISOString(),
      });

      // Registrar log
      await firebaseService.add('logs', {
        usuarioId: usuario.id,
        acao: 'alterar_senha',
        detalhes: 'Senha alterada',
        data: new Date().toISOString(),
        ip: '127.0.0.1',
      });

      setOpenSenha(false);
      setSenhaData({ atual: '', nova: '', confirmar: '' });
      mostrarSnackbar('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      mostrarSnackbar('Erro ao alterar senha', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/login');
    mostrarSnackbar('Logout realizado com sucesso!');
  };

  const getAcaoIcon = (acao) => {
    switch(acao) {
      case 'login': return <LoginIcon sx={{ color: '#2196f3' }} />;
      case 'logout': return <ExitToAppIcon sx={{ color: '#9e9e9e' }} />;
      case 'criar_agendamento': return <CreateIcon sx={{ color: '#4caf50' }} />;
      case 'cancelar_agendamento': return <CancelIcon sx={{ color: '#f44336' }} />;
      case 'finalizar_atendimento': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'atualizar_perfil': return <EditIcon sx={{ color: '#ff9800' }} />;
      case 'alterar_senha': return <LockIcon sx={{ color: '#9c27b0' }} />;
      default: return <HistoryIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getAcaoLabel = (acao) => {
    const acoes = {
      'login': 'Login realizado',
      'logout': 'Logout realizado',
      'criar_agendamento': 'Agendamento criado',
      'cancelar_agendamento': 'Agendamento cancelado',
      'finalizar_atendimento': 'Atendimento finalizado',
      'atualizar_perfil': 'Perfil atualizado',
      'alterar_senha': 'Senha alterada',
    };
    return acoes[acao] || acao;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!usuario) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Usuário não encontrado. Faça login novamente.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Ir para Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 4 }}>
        Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Card do Perfil */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      editando ? (
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: '#9c27b0',
                            color: 'white',
                            '&:hover': { bgcolor: '#7b1fa2' },
                            width: 36,
                            height: 36,
                          }}
                          component="label"
                        >
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={handleFotoChange}
                          />
                          <PhotoCameraIcon fontSize="small" />
                        </IconButton>
                      ) : null
                    }
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      badgeContent={
                        editando && fotoPreview ? (
                          <IconButton
                            size="small"
                            onClick={handleRemoverFoto}
                            sx={{
                              bgcolor: 'error.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'error.dark' },
                              width: 24,
                              height: 24,
                            }}
                          >
                            <CloseIcon sx={{ width: 14, height: 14 }} />
                          </IconButton>
                        ) : null
                      }
                    >
                      <Avatar
                        src={fotoPreview}
                        sx={{
                          width: 150,
                          height: 150,
                          bgcolor: '#9c27b0',
                          fontSize: '4rem',
                          border: '4px solid #f3e5f5',
                        }}
                      >
                        {usuario.nome?.charAt(0) || 'U'}
                      </Avatar>
                    </Badge>
                  </Badge>
                </Box>

                {!editando && (
                  <IconButton
                    sx={{
                      position: 'relative',
                      top: -20,
                      bgcolor: '#9c27b0',
                      color: 'white',
                      '&:hover': { bgcolor: '#7b1fa2' },
                    }}
                    size="small"
                    onClick={handleEdit}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}

                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {usuario.nome}
                </Typography>

                <Chip
                  label={usuario.cargo?.toUpperCase() || 'USUÁRIO'}
                  size="small"
                  sx={{
                    bgcolor: '#f3e5f5',
                    color: '#9c27b0',
                    fontWeight: 600,
                    mb: 2,
                  }}
                />

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {usuario.email}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {usuario.telefone || 'Telefone não informado'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="textSecondary">
                  Membro desde: {usuario.dataCadastro ? new Date(usuario.dataCadastro).toLocaleDateString('pt-BR') : 'Não informado'}
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  Último acesso: {usuario.ultimoAcesso ? new Date(usuario.ultimoAcesso).toLocaleString('pt-BR') : 'Não informado'}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Informações do Perfil */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                    Informações Pessoais
                  </Typography>
                  {!editando ? (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      variant="outlined"
                      sx={{ color: '#9c27b0', borderColor: '#9c27b0' }}
                    >
                      Editar
                    </Button>
                  ) : (
                    <Box>
                      <Button onClick={handleCancel} sx={{ mr: 1 }}>
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{
                          background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                        }}
                      >
                        Salvar
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      disabled={!editando}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editando}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      disabled={!editando}
                      size="small"
                      placeholder="(11) 99999-9999"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cargo"
                      value={usuario.cargo || 'Não informado'}
                      disabled
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
                  Permissões
                </Typography>

                <Grid container spacing={1}>
                  {usuario.permissoes?.length > 0 ? (
                    usuario.permissoes.map((permissao, index) => (
                      <Grid item key={index}>
                        <Chip
                          label={permissao.replace(/_/g, ' ')}
                          size="small"
                          sx={{
                            bgcolor: '#f3e5f5',
                            color: '#9c27b0',
                          }}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Nenhuma permissão especial
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Ações da Conta */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
                  Configurações da Conta
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => setOpenSenha(true)}
                      sx={{ 
                        justifyContent: 'flex-start', 
                        p: 2,
                        borderColor: '#9c27b0',
                        color: '#9c27b0',
                        '&:hover': {
                          borderColor: '#7b1fa2',
                          backgroundColor: '#f3e5f5',
                        }
                      }}
                    >
                      Alterar Senha
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HistoryIcon />}
                      onClick={() => setOpenHistorico(true)}
                      sx={{ 
                        justifyContent: 'flex-start', 
                        p: 2,
                        borderColor: '#ff4081',
                        color: '#ff4081',
                        '&:hover': {
                          borderColor: '#f50057',
                          backgroundColor: '#fce4ec',
                        }
                      }}
                    >
                      Histórico de Atividades
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<ExitToAppIcon />}
                      onClick={handleLogout}
                      sx={{ justifyContent: 'flex-start', p: 2 }}
                    >
                      Sair do Sistema
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Dialog de Alterar Senha */}
      <Dialog open={openSenha} onClose={() => setOpenSenha(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Alterar Senha
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha Atual"
                type="password"
                value={senhaData.atual}
                onChange={(e) => setSenhaData({ ...senhaData, atual: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nova Senha"
                type="password"
                value={senhaData.nova}
                onChange={(e) => setSenhaData({ ...senhaData, nova: e.target.value })}
                helperText="Mínimo de 6 caracteres"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                type="password"
                value={senhaData.confirmar}
                onChange={(e) => setSenhaData({ ...senhaData, confirmar: e.target.value })}
                error={senhaData.nova !== senhaData.confirmar && senhaData.confirmar !== ''}
                helperText={
                  senhaData.nova !== senhaData.confirmar && senhaData.confirmar !== ''
                    ? 'As senhas não conferem'
                    : ''
                }
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenSenha(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleChangeSenha}
            disabled={
              !senhaData.atual || 
              !senhaData.nova || 
              !senhaData.confirmar || 
              senhaData.nova !== senhaData.confirmar ||
              senhaData.nova.length < 6
            }
            sx={{
              background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
            }}
          >
            Alterar Senha
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Histórico de Atividades */}
      <Dialog 
        open={openHistorico} 
        onClose={() => setOpenHistorico(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Histórico de Atividades
        </DialogTitle>
        <DialogContent>
          {logs.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography color="textSecondary">
                Nenhuma atividade registrada ainda
              </Typography>
            </Box>
          ) : (
            <List sx={{ mt: 2 }}>
              {logs.map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      {getAcaoIcon(log.acao)}
                    </ListItemIcon>
                    <ListItemText
                      primary={getAcaoLabel(log.acao)}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                          >
                            {log.detalhes}
                          </Typography>
                          {` — ${log.data ? new Date(log.data).toLocaleString('pt-BR') : 'Data não informada'}`}
                          {log.ip && ` — IP: ${log.ip}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < logs.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenHistorico(false)}>Fechar</Button>
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

export default ModernPerfil;
