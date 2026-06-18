// src/pages/SaasPlanos.js
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CopyAll as CopyIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, RECURSOS_SAAS, STATUS_ASSINATURA, saasService } from '../services/saasService';

const formatCurrency = (value, currency = 'BRL') => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const criarPlanoBase = () => ({
  id: '',
  nome: '',
  tipo: 'individual',
  moeda: 'BRL',
  status: 'ativo',
  precoMensal: 0,
  precoPorUnidade: 0,
  limites: {
    unidades: 1,
    usuarios: 5,
    clientes: 500,
    agendamentos: 1000,
    servicos: 50,
    profissionais: 10,
  },
  recursos: [],
  descricao: '',
  destaque: false,
});

const limitesIcons = {
  unidades: <BusinessIcon />,
  usuarios: <PeopleIcon />,
  clientes: <GroupIcon />,
  agendamentos: <AssessmentIcon />,
  servicos: <SpeedIcon />,
  profissionais: <StarIcon />,
};

const limitesLabels = {
  unidades: 'Unidades',
  usuarios: 'Usuários',
  clientes: 'Clientes',
  agendamentos: 'Agendamentos/mês',
  servicos: 'Serviços',
  profissionais: 'Profissionais',
};

const coresTipo = {
  individual: { color: '#667eea', label: 'Individual' },
  multiunidades: { color: '#f093fb', label: 'Multiunidades' },
  enterprise: { color: '#4facfe', label: 'Enterprise' },
};

function SaasPlanos() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planos, setPlanos] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [planoForm, setPlanoForm] = useState(criarPlanoBase());
  const [novoPlano, setNovoPlano] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planoToDelete, setPlanoToDelete] = useState(null);

  const carregar = async () => {
    setLoading(true);
    try {
      const [planosData, assinaturasData] = await Promise.all([
        saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO)),
        firebaseService.getAll('assinaturas').catch(() => []),
      ]);
      setPlanos(planosData);
      setAssinaturas(assinaturasData);
    } catch (error) {
      console.error('Erro ao carregar planos SaaS:', error);
      toast.error(error.message || 'Erro ao carregar planos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const usoPorPlano = useMemo(() => 
    assinaturas.reduce((acc, assinatura) => {
      const planoId = assinatura.planoId || 'individual';
      if (!acc[planoId]) {
        acc[planoId] = { total: 0, ativas: 0, trial: 0, receita: 0 };
      }
      acc[planoId].total += 1;
      if ([STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(assinatura.status)) {
        acc[planoId].ativas += 1;
        acc[planoId].receita += Number(assinatura.valorMensal || 0);
      }
      if (assinatura.status === STATUS_ASSINATURA.TRIAL) {
        acc[planoId].trial += 1;
      }
      return acc;
    }, {}), 
  [assinaturas]);

  const estatisticas = useMemo(() => ({
    totalPlanos: planos.length,
    planosAtivos: planos.filter(p => p.status === 'ativo').length,
    totalAssinaturas: assinaturas.length,
    receitaTotal: Object.values(usoPorPlano).reduce((total, uso) => total + uso.receita, 0),
  }), [planos, assinaturas, usoPorPlano]);

  const editarPlano = (plano) => {
    setPlanoForm({
      ...criarPlanoBase(),
      ...plano,
      limites: {
        ...criarPlanoBase().limites,
        ...(plano.limites || {}),
      },
      recursos: plano.recursos || [],
    });
    setNovoPlano(false);
  };

  const novoPlanoHandler = () => {
    setPlanoForm({
      ...criarPlanoBase(),
      id: `plano_${Date.now()}`,
    });
    setNovoPlano(true);
  };

  const atualizarCampo = (campo, valor) => {
    setPlanoForm((current) => ({ ...current, [campo]: valor }));
  };

  const atualizarLimite = (campo, valor) => {
    setPlanoForm((current) => ({
      ...current,
      limites: {
        ...(current.limites || {}),
        [campo]: Number(valor || 0),
      },
    }));
  };

  const alternarRecurso = (recursoId) => {
    setPlanoForm((current) => {
      const recursos = current.recursos || [];
      return {
        ...current,
        recursos: recursos.includes(recursoId)
          ? recursos.filter((item) => item !== recursoId)
          : [...recursos, recursoId],
      };
    });
  };

  const duplicarPlano = (plano) => {
    const novoPlanoData = {
      ...plano,
      id: `${plano.id}_copia_${Date.now()}`,
      nome: `${plano.nome} (Cópia)`,
    };
    setPlanoForm(novoPlanoData);
    setNovoPlano(true);
    toast.success('Plano duplicado. Edite e salve as alterações.');
  };

  const confirmarExclusao = (plano) => {
    setPlanoToDelete(plano);
    setDeleteDialogOpen(true);
  };

  const excluirPlano = async () => {
    if (!planoToDelete) return;
    
    const uso = usoPorPlano[planoToDelete.id];
    if (uso && uso.total > 0) {
      toast.error(`Não é possível excluir: ${uso.total} assinaturas ativas usam este plano.`);
      setDeleteDialogOpen(false);
      return;
    }

    setSaving(true);
    try {
      await saasService.excluirPlano(planoToDelete.id);
      setPlanos((current) => current.filter(p => p.id !== planoToDelete.id));
      toast.success('Plano excluído com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao excluir plano.');
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
      setPlanoToDelete(null);
    }
  };

  const salvarPlano = async (event) => {
    event.preventDefault();
    if (!planoForm.id || !planoForm.nome) {
      toast.error('Informe o código e o nome do plano.');
      return;
    }

    setSaving(true);
    try {
      const salvo = await saasService.salvarPlano(planoForm);
      setPlanos((current) => {
        const exists = current.some((plano) => plano.id === salvo.id);
        return exists 
          ? current.map((plano) => (plano.id === salvo.id ? salvo : plano)) 
          : [...current, salvo];
      });
      setPlanoForm({
        ...criarPlanoBase(),
        ...salvo,
        limites: { ...criarPlanoBase().limites, ...(salvo.limites || {}) },
        recursos: salvo.recursos || [],
      });
      setNovoPlano(false);
      toast.success(`✅ Plano "${salvo.nome}" salvo com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar plano SaaS:', error);
      toast.error(error.message || 'Erro ao salvar plano.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Carregando planos SaaS...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9ff', minHeight: '100vh' }}>
      {/* Header */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2} 
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Planos e Assinaturas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie planos, valores, limites e recursos disponíveis
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Chip 
            icon={<WorkspacePremiumIcon />} 
            label={`${planos.length} planos`} 
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={novoPlanoHandler}
          >
            Novo Plano
          </Button>
        </Stack>
      </Stack>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total de Planos', value: estatisticas.totalPlanos, icon: <WorkspacePremiumIcon />, color: 'primary' },
          { label: 'Planos Ativos', value: estatisticas.planosAtivos, icon: <CheckCircleIcon />, color: 'success' },
          { label: 'Total Assinaturas', value: estatisticas.totalAssinaturas, icon: <PeopleIcon />, color: 'info' },
          { label: 'Receita Recorrente', value: formatCurrency(estatisticas.receitaTotal), icon: <TrendingUpIcon />, color: 'warning' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              boxShadow: 2,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${stat.color}.light`, color: `${stat.color}.main` }}>
                    {stat.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Editor de Plano */}
        <Grid item xs={12} lg={5}>
          <Card component="form" onSubmit={salvarPlano} sx={{ boxShadow: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: novoPlano ? 'success.light' : 'primary.light' }}>
                  {novoPlano ? <AddIcon /> : <EditIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {novoPlano ? 'Novo Plano' : 'Editar Plano'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure valores, limites e recursos
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={3}>
                <TextField 
                  label="Código do plano" 
                  value={planoForm.id} 
                  onChange={(e) => atualizarCampo('id', e.target.value.trim().toLowerCase())} 
                  fullWidth 
                  required 
                  helperText="Ex.: individual, multiunidades, enterprise"
                />
                
                <TextField 
                  label="Nome comercial" 
                  value={planoForm.nome} 
                  onChange={(e) => atualizarCampo('nome', e.target.value)} 
                  fullWidth 
                  required 
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField 
                      select 
                      label="Tipo" 
                      value={planoForm.tipo} 
                      onChange={(e) => atualizarCampo('tipo', e.target.value)} 
                      fullWidth
                    >
                      <MenuItem value="individual">👤 Individual</MenuItem>
                      <MenuItem value="multiunidades">🏢 Multiunidades</MenuItem>
                      <MenuItem value="enterprise">🏭 Enterprise</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      select 
                      label="Status" 
                      value={planoForm.status || 'ativo'} 
                      onChange={(e) => atualizarCampo('status', e.target.value)} 
                      fullWidth
                    >
                      <MenuItem value="ativo">✅ Ativo</MenuItem>
                      <MenuItem value="inativo">⭕ Inativo</MenuItem>
                      <MenuItem value="oculto">👁️ Oculto</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <Divider>
                  <Chip label="Precificação" color="primary" variant="outlined" />
                </Divider>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField 
                      label="Mensalidade" 
                      type="number" 
                      value={planoForm.precoMensal} 
                      onChange={(e) => atualizarCampo('precoMensal', e.target.value)} 
                      fullWidth 
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      label="Valor por unidade extra" 
                      type="number" 
                      value={planoForm.precoPorUnidade} 
                      onChange={(e) => atualizarCampo('precoPorUnidade', e.target.value)} 
                      fullWidth 
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider>
                  <Chip label="Limites do Plano" color="info" variant="outlined" />
                </Divider>

                <Grid container spacing={2}>
                  {Object.entries(limitesLabels).map(([key, label]) => (
                    <Grid item xs={6} key={key}>
                      <TextField
                        label={label}
                        type="number"
                        value={planoForm.limites?.[key] || 0}
                        onChange={(e) => atualizarLimite(key, e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {limitesIcons[key]}
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                <TextField 
                  label="Descrição para venda" 
                  value={planoForm.descricao || ''} 
                  onChange={(e) => atualizarCampo('descricao', e.target.value)} 
                  fullWidth 
                  multiline 
                  minRows={3}
                  placeholder="Descreva os benefícios do plano..."
                />

                <FormControlLabel
                  control={
                    <Switch 
                      checked={planoForm.destaque || false}
                      onChange={(e) => atualizarCampo('destaque', e.target.checked)}
                    />
                  }
                  label="Destacar plano na landing page"
                />

                <Divider>
                  <Chip label="Recursos Inclusos" color="success" variant="outlined" />
                </Divider>

                <Alert severity="info">
                  Selecione os recursos que este plano oferece. Recursos não marcados 
                  serão ocultados no menu das empresas.
                </Alert>

                <Grid container spacing={1}>
                  {RECURSOS_SAAS.map((recurso) => (
                    <Grid item xs={12} sm={6} key={recurso.id}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 1.5,
                          cursor: 'pointer',
                          bgcolor: (planoForm.recursos || []).includes(recurso.id) 
                            ? `${theme.palette.success.light}20` 
                            : 'transparent',
                          borderColor: (planoForm.recursos || []).includes(recurso.id)
                            ? 'success.main'
                            : 'divider',
                          '&:hover': { bgcolor: theme.palette.action.hover },
                        }}
                        onClick={() => alternarRecurso(recurso.id)}
                      >
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={(planoForm.recursos || []).includes(recurso.id)} 
                              onChange={() => alternarRecurso(recurso.id)}
                            />
                          }
                          label={
                            <Stack>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {recurso.nome}
                              </Typography>
                              {recurso.descricao && (
                                <Typography variant="caption" color="text.secondary">
                                  {recurso.descricao}
                                </Typography>
                              )}
                            </Stack>
                          }
                          sx={{ width: '100%', m: 0 }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  disabled={saving} 
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  fullWidth
                  sx={{ fontWeight: 700 }}
                >
                  {saving ? 'Salvando...' : novoPlano ? 'Criar Plano' : 'Salvar Alterações'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Planos */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Planos Disponíveis
              </Typography>
              
              <Grid container spacing={3}>
                {planos.map((plano) => {
                  const uso = usoPorPlano[plano.id] || { total: 0, ativas: 0, trial: 0, receita: 0 };
                  const tipoConfig = coresTipo[plano.tipo] || coresTipo.individual;
                  
                  return (
                    <Grid item xs={12} key={plano.id}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 3,
                          borderColor: plano.destaque ? 'primary.main' : 'divider',
                          borderWidth: plano.destaque ? 2 : 1,
                          position: 'relative',
                          '&:hover': { boxShadow: 2 },
                        }}
                      >
                        {plano.destaque && (
                          <Chip
                            label="🌟 Destaque"
                            color="primary"
                            size="small"
                            sx={{ position: 'absolute', top: -12, right: 16 }}
                          />
                        )}
                        
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                  {plano.nome}
                                </Typography>
                                <Chip 
                                  label={tipoConfig.label}
                                  size="small"
                                  sx={{ bgcolor: tipoConfig.color, color: 'white' }}
                                />
                              </Stack>
                              
                              <Stack direction="row" spacing={1}>
                                <Chip 
                                  icon={plano.status === 'ativo' ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                  label={plano.status || 'ativo'} 
                                  size="small" 
                                  color={plano.status === 'ativo' ? 'success' : 'default'}
                                  variant="outlined"
                                />
                                <Chip 
                                  icon={<WorkspacePremiumIcon />}
                                  label={`${uso.ativas} ativas`} 
                                  size="small" 
                                  color="primary"
                                  variant="outlined"
                                />
                              </Stack>
                              
                              <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>
                                {formatCurrency(plano.precoMensal, plano.moeda)}
                                <Typography component="span" variant="body2" color="text.secondary">
                                  /mês
                                </Typography>
                              </Typography>
                              
                              {plano.precoPorUnidade > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                  + {formatCurrency(plano.precoPorUnidade)}/unidade extra
                                </Typography>
                              )}
                            </Stack>
                          </Grid>
                          
                          <Grid item xs={12} md={5}>
                            <Stack spacing={1}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                Limites
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {Object.entries(plano.limites || {}).slice(0, 4).map(([key, value]) => (
                                  <Chip
                                    key={key}
                                    icon={limitesIcons[key]}
                                    label={`${limitesLabels[key]}: ${value}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Stack>
                              
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
                                Recursos ({plano.recursos?.length || 0})
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {(plano.recursos || []).slice(0, 4).map((recursoId) => {
                                  const recurso = RECURSOS_SAAS.find(r => r.id === recursoId);
                                  return (
                                    <Chip
                                      key={recursoId}
                                      label={recurso?.nome || recursoId}
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                    />
                                  );
                                })}
                                {(plano.recursos?.length || 0) > 4 && (
                                  <Chip 
                                    label={`+${plano.recursos.length - 4} mais`} 
                                    size="small" 
                                  />
                                )}
                              </Stack>
                            </Stack>
                          </Grid>
                          
                          <Grid item xs={12} md={3}>
                            <Stack spacing={1}>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => editarPlano(plano)}
                                size="small"
                              >
                                Editar
                              </Button>
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<CopyIcon />}
                                onClick={() => duplicarPlano(plano)}
                                size="small"
                              >
                                Duplicar
                              </Button>
                              <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => confirmarExclusao(plano)}
                                size="small"
                                disabled={uso.total > 0}
                              >
                                Excluir {uso.total > 0 ? `(${uso.total} ativas)` : ''}
                              </Button>
                              
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Receita: {formatCurrency(uso.receita)}/mês
                                </Typography>
                                {uso.trial > 0 && (
                                  <Typography variant="caption" color="info.main" display="block">
                                    {uso.trial} em trial
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o plano <strong>{planoToDelete?.nome}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={excluirPlano} color="error" variant="contained" disabled={saving}>
            {saving ? 'Excluindo...' : 'Excluir Plano'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SaasPlanos;
