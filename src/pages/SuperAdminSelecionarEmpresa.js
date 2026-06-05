import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Login as LoginIcon,
  Search as SearchIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { firebaseService, clearTenantContext, getTenantContext, setTenantContext } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';
import { isSaasPlatformAdmin } from '../utils/saasAccess';

function SuperAdminSelecionarEmpresa() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [tenantAtual, setTenantAtual] = useState(getTenantContext());
  const usuario = usuariosService.getUsuarioAtual();

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        if (!isSaasPlatformAdmin(usuario)) {
          toast.error('Acesso restrito ao superadmin da plataforma.');
          navigate('/dashboard', { replace: true });
          return;
        }
        const data = await firebaseService.getAll('empresas').catch(() => []);
        setEmpresas((data || []).sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''))));
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        toast.error(error.message || 'Erro ao carregar empresas.');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [navigate]);

  const empresasFiltradas = useMemo(() => {
    const termo = filtro.trim().toLowerCase();
    if (!termo) return empresas;
    return empresas.filter((empresa) => [empresa.nome, empresa.razaoSocial, empresa.email, empresa.documento, empresa.slug]
      .filter(Boolean)
      .some((valor) => String(valor).toLowerCase().includes(termo)));
  }, [empresas, filtro]);

  const atualizarUsuarioLocal = (empresa = null) => {
    const atual = usuariosService.getUsuarioAtual() || usuario || {};
    const atualizado = empresa
      ? {
          ...atual,
          empresaId: empresa.id,
          empresaNome: empresa.nome,
          empresa,
          tenantAssumidoPorSuperadmin: true,
        }
      : {
          ...atual,
          empresaId: null,
          empresaNome: null,
          empresa: null,
          unidadeId: null,
          unidade: null,
          tenantAssumidoPorSuperadmin: false,
        };

    localStorage.setItem('usuario', JSON.stringify(atualizado));
    window.dispatchEvent(new Event('usuarioAtualizado'));
    return atualizado;
  };

  const acessarEmpresa = (empresa) => {
    clearTenantContext();
    setTenantContext({ empresaId: empresa.id, empresa });
    atualizarUsuarioLocal(empresa);
    setTenantAtual(getTenantContext());
    toast.success(`Contexto alterado para ${empresa.nome}.`);
    navigate('/dashboard', { replace: true });
  };

  const sairDoTenant = () => {
    clearTenantContext();
    atualizarUsuarioLocal(null);
    setTenantAtual(getTenantContext());
    toast.success('Contexto da empresa removido.');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Acessar empresa como superadmin</Typography>
          <Typography color="text.secondary">
            Escolha um tenant para entrar na área administrativa da empresa e realizar ajustes para o cliente.
          </Typography>
        </Box>
        <Chip icon={<WorkspacePremiumIcon />} color="primary" label={`${empresas.length} empresa(s)`} />
      </Stack>

      {tenantAtual.empresaId && (
        <Alert severity="info" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={sairDoTenant}>Sair do tenant</Button>}>
          Você está atuando em: <strong>{tenantAtual.empresa?.nome || tenantAtual.empresaId}</strong>.
        </Alert>
      )}

      <TextField
        fullWidth
        label="Buscar empresa por nome, documento, email ou slug"
        value={filtro}
        onChange={(event) => setFiltro(event.target.value)}
        sx={{ mb: 3 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />

      <Grid container spacing={2}>
        {empresasFiltradas.map((empresa) => {
          const ativa = tenantAtual.empresaId === empresa.id;
          return (
            <Grid item xs={12} md={6} lg={4} key={empresa.id}>
              <Card sx={{ height: '100%', border: ativa ? '2px solid #9c27b0' : '1px solid', borderColor: ativa ? '#9c27b0' : 'divider' }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: ativa ? '#9c27b0' : '#f3e5f5', color: ativa ? 'white' : '#9c27b0' }}>
                      <BusinessIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{empresa.nome || 'Empresa sem nome'}</Typography>
                      <Typography variant="body2" color="text.secondary">{empresa.razaoSocial || empresa.email || empresa.slug || empresa.id}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                        <Chip size="small" label={empresa.status || 'ativa'} color={empresa.status === 'inativa' ? 'default' : 'success'} />
                        {empresa.planoId && <Chip size="small" variant="outlined" label={`Plano: ${empresa.planoId}`} />}
                        {empresa.slug && <Chip size="small" variant="outlined" label={empresa.slug} />}
                      </Stack>
                    </Box>
                  </Stack>
                  <Button
                    fullWidth
                    variant={ativa ? 'outlined' : 'contained'}
                    startIcon={<LoginIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => acessarEmpresa(empresa)}
                  >
                    {ativa ? 'Entrar novamente' : 'Acessar admin da empresa'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {empresasFiltradas.length === 0 && (
        <Alert severity="warning">Nenhuma empresa encontrada para o filtro informado.</Alert>
      )}
    </Box>
  );
}

export default SuperAdminSelecionarEmpresa;
