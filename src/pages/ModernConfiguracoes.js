import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { configuracoesService } from '../services/configuracoesService';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function ModernConfiguracoes() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [config, setConfig] = useState(null);
  const [backup, setBackup] = useState(null);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando configurações...');
      
      const data = await configuracoesService.buscar();
      console.log('✅ Configurações carregadas:', data);
      
      // Validar se os dados vieram corretamente
      if (!data || !data.salao) {
        throw new Error('Dados de configuração inválidos');
      }
      
      setConfig(data);
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      setError(error.message || 'Erro ao carregar configurações');
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('🔄 Salvando configurações:', config);
      
      await configuracoesService.atualizar(config);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      const data = await configuracoesService.backup();
      setBackup(data);
      
      // Download do backup
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      toast.success('Backup realizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro no backup:', error);
      toast.error('Erro ao realizar backup');
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        console.log('🔄 Restaurando backup:', backupData);
        
        await configuracoesService.restaurar(backupData);
        await carregarConfiguracoes();
        toast.success('Backup restaurado com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao restaurar:', error);
        toast.error('Erro ao restaurar backup');
      }
    };
    reader.readAsText(file);
  };

  const handleHorarioChange = (dia, campo, valor) => {
    if (!config || !config.horarioFuncionamento) return;
    
    setConfig({
      ...config,
      horarioFuncionamento: {
        ...config.horarioFuncionamento,
        [dia]: {
          ...config.horarioFuncionamento[dia],
          [campo]: valor
        }
      }
    });
  };

  const handleSalaoChange = (campo, valor, subcampo = null) => {
    if (!config || !config.salao) return;
    
    if (subcampo) {
      // Para objetos aninhados (endereco, contato)
      setConfig({
        ...config,
        salao: {
          ...config.salao,
          [campo]: {
            ...config.salao[campo],
            [subcampo]: valor
          }
        }
      });
    } else {
      // Para campos simples
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
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
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: '#faf5ff',
              '& .MuiTab-root': { fontWeight: 600 },
            }}
          >
            <Tab icon={<BusinessIcon />} label="Salão" />
            <Tab icon={<TimeIcon />} label="Horário" />
            <Tab icon={<NotificationsIcon />} label="Notificações" />
            <Tab icon={<PaletteIcon />} label="Aparência" />
            <Tab icon={<BackupIcon />} label="Backup" />
          </Tabs>

          {/* Dados do Salão */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Salão"
                  value={config.salao?.nome || ''}
                  onChange={(e) => handleSalaoChange('nome', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Fantasia"
                  value={config.salao?.nomeFantasia || ''}
                  onChange={(e) => handleSalaoChange('nomeFantasia', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CNPJ"
                  value={config.salao?.cnpj || ''}
                  onChange={(e) => handleSalaoChange('cnpj', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Inscrição Estadual"
                  value={config.salao?.ie || ''}
                  onChange={(e) => handleSalaoChange('ie', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2 }}>
                  Endereço
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Logradouro"
                  value={config.salao?.endereco?.logradouro || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'logradouro')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Complemento"
                  value={config.salao?.endereco?.complemento || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'complemento')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Bairro"
                  value={config.salao?.endereco?.bairro || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'bairro')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={config.salao?.endereco?.cidade || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'cidade')}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="UF"
                  value={config.salao?.endereco?.estado || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'estado')}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={config.salao?.endereco?.cep || ''}
                  onChange={(e) => handleSalaoChange('endereco', e.target.value, 'cep')}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 2 }}>
                  Contato
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={config.salao?.contato?.telefone || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'telefone')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Celular"
                  value={config.salao?.contato?.celular || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'celular')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={config.salao?.contato?.email || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'email')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Site"
                  value={config.salao?.contato?.site || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'site')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Instagram"
                  value={config.salao?.contato?.instagram || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'instagram')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Facebook"
                  value={config.salao?.contato?.facebook || ''}
                  onChange={(e) => handleSalaoChange('contato', e.target.value, 'facebook')}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Horário de Funcionamento */}
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

          {/* Notificações */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
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
                  label="Email"
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
                  label="WhatsApp"
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
                  label="SMS"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
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
            </Grid>
          </TabPanel>

          {/* Aparência */}
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
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.tema?.modoEscuro || false}
                      onChange={(e) => handleTemaChange('modoEscuro', e.target.checked)}
                    />
                  }
                  label="Modo Escuro"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Paper
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: config.tema?.corPrimaria || '#9c27b0',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    Primária
                  </Paper>
                  <Paper
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: config.tema?.corSecundaria || '#ff4081',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    Secundária
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Backup */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info">
                  Faça backup regularmente para garantir a segurança dos seus dados.
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Exportar Backup
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Baixe um arquivo com todos os dados do sistema
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<BackupIcon />}
                      onClick={handleBackup}
                      sx={{
                        background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                      }}
                    >
                      Gerar Backup
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Importar Backup
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Restaure dados de um arquivo de backup anterior
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      component="label"
                      startIcon={<RefreshIcon />}
                    >
                      Selecionar Arquivo
                      <input
                        type="file"
                        hidden
                        accept=".json"
                        onChange={handleRestore}
                      />
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {backup && (
                <Grid item xs={12}>
                  <Alert severity="success">
                    Último backup: {new Date(backup.dataBackup).toLocaleString('pt-BR')}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ModernConfiguracoes;