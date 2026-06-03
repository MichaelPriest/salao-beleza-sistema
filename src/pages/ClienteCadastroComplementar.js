// src/pages/ClienteCadastroComplementar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as WcIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { formatarCPF, removerMascaraCPF, validarCPF } from '../utils/cpfUtils';

function ClienteCadastroComplementar() {
  const navigate = useNavigate();
  const { completarCadastroGoogle, loading } = useAuthCliente();
  const [loadingComplementar, setLoadingComplementar] = useState(false);
  const [error, setError] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  
  const [dadosComplementares, setDadosComplementares] = useState({
    cpf: '',
    telefone: '',
    dataNascimento: '',
    genero: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  useEffect(() => {
    const pendingStr = sessionStorage.getItem('pending_google_user');
    if (!pendingStr) {
      toast.error('Sessão expirada. Faça login novamente.');
      navigate('/cliente/login');
      return;
    }
    setPendingUser(JSON.parse(pendingStr));
  }, [navigate]);

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setDadosComplementares(prev => ({
            ...prev,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || '',
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleCpfChange = (e) => {
    const cpfFormatado = formatarCPF(e.target.value);
    setDadosComplementares({ ...dadosComplementares, cpf: cpfFormatado });
    
    if (cpfFormatado.length === 14) {
      const cpfLimpo = removerMascaraCPF(cpfFormatado);
      if (!validarCPF(cpfLimpo)) {
        setCpfError('CPF inválido');
      } else {
        setCpfError('');
      }
    } else {
      setCpfError('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDadosComplementares(prev => ({ ...prev, [name]: value }));
    
    if (name === 'cep') {
      buscarCep(value);
    }
  };

  const handleSubmit = async () => {
    const cpfLimpo = removerMascaraCPF(dadosComplementares.cpf);
    if (!validarCPF(cpfLimpo)) {
      setCpfError('CPF inválido');
      return;
    }

    if (!dadosComplementares.cpf) {
      setError('CPF é obrigatório');
      return;
    }

    try {
      setLoadingComplementar(true);
      setError('');
      
      const result = await completarCadastroGoogle(dadosComplementares);
      
      if (result?.success) {
        toast.success('Cadastro completado com sucesso!');
        navigate('/cliente/dashboard');
      } else {
        setError(result?.error || 'Erro ao completar cadastro');
      }
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao processar cadastro');
    } finally {
      setLoadingComplementar(false);
    }
  };

  if (!pendingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', p: 2 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 800 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
              Complete seu Cadastro
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
              Olá {pendingUser.nome}! Precisamos de mais algumas informações para finalizar seu cadastro.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF *"
                  name="cpf"
                  value={dadosComplementares.cpf}
                  onChange={handleCpfChange}
                  error={!!cpfError}
                  helperText={cpfError || 'Digite apenas números'}
                  required
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><BadgeIcon /></InputAdornment>),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="telefone"
                  value={dadosComplementares.telefone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><PhoneIcon /></InputAdornment>),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Nascimento"
                  name="dataNascimento"
                  value={dadosComplementares.dataNascimento}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><CakeIcon /></InputAdornment>),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gênero</InputLabel>
                  <Select
                    name="genero"
                    value={dadosComplementares.genero}
                    onChange={handleChange}
                    label="Gênero"
                    startAdornment={<InputAdornment position="start"><WcIcon /></InputAdornment>}
                  >
                    <MenuItem value="feminino">Feminino</MenuItem>
                    <MenuItem value="masculino">Masculino</MenuItem>
                    <MenuItem value="outro">Outro</MenuItem>
                    <MenuItem value="nao_informar">Prefiro não informar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CEP"
                  name="cep"
                  value={dadosComplementares.cep}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><LocationIcon /></InputAdornment>),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Logradouro" name="logradouro" value={dadosComplementares.logradouro} onChange={handleChange} />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField fullWidth label="Número" name="numero" value={dadosComplementares.numero} onChange={handleChange} />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField fullWidth label="Complemento" name="complemento" value={dadosComplementares.complemento} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Bairro" name="bairro" value={dadosComplementares.bairro} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Cidade" name="cidade" value={dadosComplementares.cidade} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField fullWidth label="UF" name="estado" value={dadosComplementares.estado} onChange={handleChange} inputProps={{ maxLength: 2 }} />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/cliente/login')}>Cancelar</Button>
              <Button fullWidth variant="contained" onClick={handleSubmit} disabled={loadingComplementar || !!cpfError || !dadosComplementares.cpf} sx={{ bgcolor: '#9c27b0' }}>
                {loadingComplementar ? <CircularProgress size={24} /> : 'Finalizar Cadastro'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

export default ClienteCadastroComplementar;
