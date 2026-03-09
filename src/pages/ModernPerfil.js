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
import { usuariosService } from '../services/usuariosService';
import { useDados } from '../hooks/useDados';

function ModernPerfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [openSenha, setOpenSenha] = useState(false);
  const [openHistorico, setOpenHistorico] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  
  const { dados: logs } = useDados('logs');
  
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

  const carregarUsuario = () => {
    const user = usuariosService.getUsuarioAtual();
    if (user) {
      setUsuario(user);
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        avatar: user.avatar || null,
      });
      setFotoPreview(user.avatar);
    }
    setLoading(false);
  };

  const handleFotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
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
        // Em produção, você enviaria para um servidor
        // Aqui simulamos salvando o preview como URL
        avatarUrl = fotoPreview;
      }

      const dadosAtualizados = {
        ...formData,
        avatar: avatarUrl,
      };

      const updated = await usuariosService.atualizarPerfil(usuario.id, dadosAtualizados);
      
      // Atualizar o usuário no localStorage
      const userAtual = JSON.parse(localStorage.getItem('usuario') || '{}');
      localStorage.setItem('usuario', JSON.stringify({ ...userAtual, ...dadosAtualizados }));
      
      setUsuario(updated);
      setEditando(false);
      setFotoFile(null);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSenha = async () => {
    if (senhaData.nova !== senhaData.confirmar) {
      toast.error('As senhas não conferem');
      return;
    }

    if (senhaData.nova.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await usuariosService.alterarSenha(usuario.id, senhaData.atual, senhaData.nova);
      setOpenSenha(false);
      setSenhaData({ atual: '', nova: '', confirmar: '' });
      toast.success('Senha alterada com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    usuariosService.logout();
    navigate('/login');
    toast.success('Logout realizado com sucesso!');
  };

  const getAcaoIcon = (acao) => {
    switch(acao) {
      case 'login': return <LoginIcon color="primary" />;
      case 'criar_agendamento': return <CreateIcon color="success" />;
      case 'cancelar_agendamento': return <CancelIcon color="error" />;
      case 'finalizar_atendimento': return <CheckCircleIcon color="success" />;
      default: return <HistoryIcon />;
    }
  };

  const getAcaoLabel = (acao) => {
    switch(acao) {
      case 'login': return 'Login realizado';
      case 'criar_agendamento': return 'Agendamento criado';
      case 'cancelar_agendamento': return 'Agendamento cancelado';
      case 'finalizar_atendimento': return 'Atendimento finalizado';
      default: return acao;
    }
  };

  // Filtrar logs do usuário atual
  const logsDoUsuario = logs
    .filter(log => log.usuarioId === usuario?.id)
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 20);

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
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
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
                        {usuario.nome?.charAt(0)}
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
                  label={usuario.cargo?.toUpperCase()}
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
                  {usuario.telefone}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="textSecondary">
                  Membro desde: {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  Último acesso: {new Date(usuario.ultimoAcesso).toLocaleString('pt-BR')}
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
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Informações Pessoais
                  </Typography>
                  {!editando ? (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      variant="outlined"
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
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      disabled={!editando}
                      placeholder="(11) 99999-9999"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cargo"
                      value={usuario.cargo}
                      disabled
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Permissões
                </Typography>

                <Grid container spacing={1}>
                  {usuario.permissoes?.map((permissao, index) => (
                    <Grid item key={index}>
                      <Chip
                        label={permissao.replace(/_/g, ' ')}
                        sx={{
                          bgcolor: '#f3e5f5',
                          color: '#9c27b0',
                        }}
                      />
                    </Grid>
                  ))}
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Configurações da Conta
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => setOpenSenha(true)}
                      sx={{ justifyContent: 'flex-start', p: 2 }}
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
                      sx={{ justifyContent: 'flex-start', p: 2 }}
                    >
                      Histórico de Atividades
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<LogoutIcon />}
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
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
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
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
          Histórico de Atividades
        </DialogTitle>
        <DialogContent>
          {logsDoUsuario.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography color="textSecondary">
                Nenhuma atividade registrada ainda
              </Typography>
            </Box>
          ) : (
            <List sx={{ mt: 2 }}>
              {logsDoUsuario.map((log, index) => (
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
                          {` — ${new Date(log.data).toLocaleString('pt-BR')}`}
                          {log.ip && ` — IP: ${log.ip}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < logsDoUsuario.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenHistorico(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModernPerfil;