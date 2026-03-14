// src/pages/ClientePerfil.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Badge as BadgeIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { masks, MaskedInput, ImageUpload } from '../utils/plugins';

function ClientePerfil() {
  const navigate = useNavigate();
  const { cliente, atualizarCliente, loading } = useAuthCliente();
  const [editMode, setEditMode] = useState(false);
  const [editSenha, setEditSenha] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmSenha, setShowConfirmSenha] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone || '',
    dataNascimento: cliente?.dataNascimento || '',
    cpf: cliente?.cpf || '',
    genero: cliente?.genero || '',
    cep: cliente?.cep || '',
    logradouro: cliente?.logradouro || '',
    numero: cliente?.numero || '',
    complemento: cliente?.complemento || '',
    bairro: cliente?.bairro || '',
    cidade: cliente?.cidade || '',
    estado: cliente?.estado || '',
    foto: cliente?.foto || null,
    profissionalPreferido: cliente?.profissionalPreferido || '',
    servicosPreferidos: cliente?.servicosPreferidos || [],
    receberPromocoes: cliente?.receberPromocoes !== false,
  });

  const [senhaData, setSenhaData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSenhaChange = (e) => {
    const { name, value } = e.target;
    setSenhaData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    try {
      setSaving(true);
      
      const success = await atualizarCliente(formData);
      if (success) {
        setEditMode(false);
      }
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (!senhaData.novaSenha || !senhaData.confirmarSenha) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (senhaData.novaSenha.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      toast.error('As senhas não conferem');
      return;
    }

    try {
      setSaving(true);
      
      // Verificar senha atual (simples - em produção use hash)
      if (cliente.senha !== senhaData.senhaAtual) {
        toast.error('Senha atual incorreta');
        return;
      }

      const success = await atualizarCliente({ senha: senhaData.novaSenha });
      if (success) {
        setEditSenha(false);
        setSenhaData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      }
      
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setSaving(false);
    }
  };

  const handleVoltar = () => {
    navigate('/cliente/dashboard');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const servicosDisponiveis = [
    'Corte de Cabelo',
    'Manicure',
    'Pedicure',
    'Coloração',
    'Hidratação',
    'Maquiagem',
    'Design de Sobrancelhas',
    'Depilação',
  ];

  if (!cliente) {
    return null;
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={handleVoltar} sx={{ bgcolor: '#f5f5f5' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Meu Perfil
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Card de Foto */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                {editMode ? (
                  <ImageUpload
                    value={formData.foto}
                    onChange={(value) => setFormData({ ...formData, foto: value })}
                    label="Alterar Foto"
                    maxSizeKB={150}
                  />
                ) : (
                  <>
                    <Avatar
                      src={formData.foto}
                      sx={{
                        width: 150,
                        height: 150,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: '#9c27b0',
                        fontSize: '3rem',
                      }}
                    >
                      {!formData.foto && getInitials(formData.nome)}
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                      {formData.nome}
                    </Typography>
                    <Chip
                      label={cliente.status || 'Cliente'}
                      sx={{ bgcolor: '#f3e5f5', color: '#9c27b0' }}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Dados do Perfil */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Informações Pessoais
                  </Typography>
                  {!editMode ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                      sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                    >
                      Editar Perfil
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSalvar}
                      disabled={saving}
                      sx={{ bgcolor: '#9c27b0' }}
                    >
                      {saving ? <CircularProgress size={24} /> : 'Salvar'}
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editMode}
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
                    <MaskedInput
                      mask="telefone"
                      label="Telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
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
                    <MaskedInput
                      mask="data"
                      label="Data de Nascimento"
                      name="dataNascimento"
                      value={formData.dataNascimento}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CakeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <MaskedInput
                      mask="cpf"
                      label="CPF"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" disabled={!editMode}>
                      <InputLabel>Gênero</InputLabel>
                      <Select
                        name="genero"
                        value={formData.genero}
                        label="Gênero"
                        onChange={handleChange}
                      >
                        <MenuItem value="F">Feminino</MenuItem>
                        <MenuItem value="M">Masculino</MenuItem>
                        <MenuItem value="O">Outro</MenuItem>
                        <MenuItem value="N">Prefiro não informar</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Endereço
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <MaskedInput
                      mask="cep"
                      label="CEP"
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Logradouro"
                      name="logradouro"
                      value={formData.logradouro}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      label="Número"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={6} md={4}>
                    <TextField
                      fullWidth
                      label="Complemento"
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={8} md={2}>
                    <TextField
                      fullWidth
                      label="Cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={4} md={1}>
                    <TextField
                      fullWidth
                      label="UF"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      disabled={!editMode}
                      size="small"
                      inputProps={{ maxLength: 2 }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Preferências
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" disabled={!editMode}>
                      <InputLabel>Profissional Preferido</InputLabel>
                      <Select
                        name="profissionalPreferido"
                        value={formData.profissionalPreferido}
                        label="Profissional Preferido"
                        onChange={handleChange}
                      >
                        <MenuItem value="">Nenhum</MenuItem>
                        <MenuItem value="Joana Silva">Joana Silva</MenuItem>
                        <MenuItem value="Carlos Santos">Carlos Santos</MenuItem>
                        <MenuItem value="Ana Oliveira">Ana Oliveira</MenuItem>
                        <MenuItem value="Marcos Souza">Marcos Souza</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" disabled={!editMode}>
                      <InputLabel>Serviços de Interesse</InputLabel>
                      <Select
                        multiple
                        name="servicosPreferidos"
                        value={formData.servicosPreferidos}
                        onChange={handleChange}
                        label="Serviços de Interesse"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {servicosDisponiveis.map((servico) => (
                          <MenuItem key={servico} value={servico}>
                            {servico}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Card de Segurança */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Segurança
                  </Typography>
                  {!editSenha ? (
                    <Button
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => setEditSenha(true)}
                      sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                    >
                      Alterar Senha
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleAlterarSenha}
                      disabled={saving}
                      sx={{ bgcolor: '#9c27b0' }}
                    >
                      {saving ? <CircularProgress size={24} /> : 'Salvar Nova Senha'}
                    </Button>
                  )}
                </Box>

                {editSenha ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Senha Atual"
                        name="senhaAtual"
                        type={showSenha ? 'text' : 'password'}
                        value={senhaData.senhaAtual}
                        onChange={handleSenhaChange}
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowSenha(!showSenha)}
                                edge="end"
                              >
                                {showSenha ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nova Senha"
                        name="novaSenha"
                        type={showNovaSenha ? 'text' : 'password'}
                        value={senhaData.novaSenha}
                        onChange={handleSenhaChange}
                        size="small"
                        helperText="Mínimo 6 caracteres"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNovaSenha(!showNovaSenha)}
                                edge="end"
                              >
                                {showNovaSenha ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Confirmar Nova Senha"
                        name="confirmarSenha"
                        type={showConfirmSenha ? 'text' : 'password'}
                        value={senhaData.confirmarSenha}
                        onChange={handleSenhaChange}
                        size="small"
                        error={senhaData.novaSenha !== senhaData.confirmarSenha && senhaData.confirmarSenha !== ''}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmSenha(!showConfirmSenha)}
                                edge="end"
                              >
                                {showConfirmSenha ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="info">
                    Mantenha sua senha segura e não compartilhe com ninguém.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ClientePerfil;
