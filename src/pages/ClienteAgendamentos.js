// src/pages/ClienteAgendamentos.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';

function ClienteAgendamentos() {
  const navigate = useNavigate();
  const { cliente, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [formData, setFormData] = useState({
    servicoId: '',
    profissionalId: '',
    data: '',
    horario: '',
    observacoes: '',
  });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  useEffect(() => {
    if (cliente) {
      carregarDados();
    }
  }, [cliente]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // 🔥 Usar UID do Firebase ou ID do documento
      const uid = firebaseUser?.uid || cliente?.id;
      console.log('📌 Buscando agendamentos para clienteId:', uid);
      
      const [agendamentosData, servicosData, profissionaisData] = await Promise.all([
        firebaseService.query('agendamentos', [
          { field: 'clienteId', operator: '==', value: uid }
        ], 'data', 'desc'),
        firebaseService.getAll('servicos'),
        firebaseService.getAll('profissionais')
      ]);

      console.log('✅ Agendamentos encontrados:', agendamentosData?.length || 0);
      setAgendamentos(agendamentosData || []);
      setServicos(servicosData || []);
      setProfissionais(profissionaisData || []);
      
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleNovoAgendamento = () => {
    // Pré-selecionar data para amanhã
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataFormatada = amanha.toISOString().split('T')[0];
    
    setFormData({
      servicoId: '',
      profissionalId: '',
      data: dataFormatada,
      horario: '',
      observacoes: '',
    });
    setOpenDialog(true);
  };

  const handleSalvarAgendamento = async () => {
    try {
      if (!formData.servicoId || !formData.data || !formData.horario) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const servico = servicos.find(s => s.id === formData.servicoId);
      const profissional = profissionais.find(p => p.id === formData.profissionalId);
      
      const hoje = new Date().toISOString().split('T')[0];
      if (formData.data < hoje) {
        toast.error('Não é possível agendar para datas passadas');
        return;
      }

      // 🔥 Usar UID do Firebase para o clienteId
      const uid = firebaseUser?.uid || cliente?.id;

      const novoAgendamento = {
        clienteId: uid,
        clienteNome: cliente.nome,
        clienteEmail: cliente.email,
        clienteTelefone: cliente.telefone,
        servicoId: formData.servicoId,
        servicoNome: servico?.nome,
        servicoPreco: servico?.preco,
        servicoDuracao: servico?.duracao,
        profissionalId: formData.profissionalId || null,
        profissionalNome: profissional?.nome || null,
        data: formData.data,
        horario: formData.horario,
        observacoes: formData.observacoes,
        status: 'pendente',
        origem: 'cliente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await firebaseService.add('agendamentos', novoAgendamento);
      
      toast.success('Agendamento solicitado com sucesso!');
      setOpenDialog(false);
      carregarDados();
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
    }
  };

  const handleCancelarAgendamento = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setOpenCancelDialog(true);
  };

  const confirmarCancelamento = async () => {
    try {
      await firebaseService.update('agendamentos', selectedAgendamento.id, {
        status: 'cancelado',
        updatedAt: new Date().toISOString()
      });

      toast.success('Agendamento cancelado com sucesso!');
      setOpenCancelDialog(false);
      carregarDados();
      
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const handleVerDetalhes = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setOpenDetailsDialog(true);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmado': return 'success';
      case 'pendente': return 'warning';
      case 'cancelado': return 'error';
      case 'finalizado': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Realizado';
      default: return status || 'Pendente';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmado': return <CheckIcon fontSize="small" />;
      case 'pendente': return <ScheduleIcon fontSize="small" />;
      case 'cancelado': return <CancelIcon fontSize="small" />;
      case 'finalizado': return <CheckCircleIcon fontSize="small" />;
      default: return <EventIcon fontSize="small" />;
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return data;
    }
  };

  const isDataValida = (data) => {
    const hoje = new Date().toISOString().split('T')[0];
    return data >= hoje;
  };

  const agendamentosFuturos = agendamentos
    .filter(a => a.status !== 'cancelado' && a.status !== 'finalizado')
    .sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario));

  const agendamentosPassados = agendamentos
    .filter(a => a.status === 'cancelado' || a.status === 'finalizado')
    .sort((a, b) => b.data.localeCompare(a.data));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Meus Agendamentos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie seus horários e serviços
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNovoAgendamento}
          sx={{ 
            bgcolor: '#9c27b0',
            '&:hover': { bgcolor: '#7b1fa2' }
          }}
        >
          Novo Agendamento
        </Button>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {agendamentosFuturos.length}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Agendamentos futuros
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {agendamentos.filter(a => a.status === 'pendente').length}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Pendentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {agendamentos.filter(a => a.status === 'confirmado').length}
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Confirmados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Próximos Agendamentos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Próximos Agendamentos
          </Typography>

          {agendamentosFuturos.length > 0 ? (
            <Grid container spacing={2}>
              {agendamentosFuturos.map((agendamento, index) => (
                <Grid item xs={12} key={agendamento.id || index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2,
                        borderLeft: '4px solid',
                        borderLeftColor: 
                          agendamento.status === 'confirmado' ? '#4caf50' :
                          agendamento.status === 'pendente' ? '#ff9800' : '#9c27b0',
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon sx={{ color: '#9c27b0' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {formatarData(agendamento.data)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <TimeIcon sx={{ color: '#ff4081', fontSize: 16 }} />
                            <Typography variant="body2" color="textSecondary">
                              {agendamento.horario}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {agendamento.servicoNome || 'Serviço'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Profissional: {agendamento.profissionalNome || 'A definir'}
                          </Typography>
                          {agendamento.observacoes && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              Obs: {agendamento.observacoes}
                            </Typography>
                          )}
                        </Grid>
                        
                        <Grid item xs={12} sm={2}>
                          <Chip
                            icon={getStatusIcon(agendamento.status)}
                            label={getStatusLabel(agendamento.status)}
                            color={getStatusColor(agendamento.status)}
                            size="small"
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleVerDetalhes(agendamento)}
                              sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                            >
                              Detalhes
                            </Button>
                            {agendamento.status === 'pendente' && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleCancelarAgendamento(agendamento)}
                              >
                                Cancelar
                              </Button>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Você não tem agendamentos futuros
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNovoAgendamento}
                sx={{ mt: 2, bgcolor: '#9c27b0' }}
              >
                Agendar Agora
              </Button>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Agendamentos */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Histórico
          </Typography>

          {agendamentosPassados.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Data</TableCell>
                    <TableCell>Horário</TableCell>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Profissional</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agendamentosPassados.map((agendamento, index) => (
                    <TableRow key={agendamento.id || index} hover>
                      <TableCell>{formatarData(agendamento.data)}</TableCell>
                      <TableCell>{agendamento.horario || '--:--'}</TableCell>
                      <TableCell>{agendamento.servicoNome || 'Serviço'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            src={profissionais.find(p => p.id === agendamento.profissionalId)?.foto}
                            sx={{ width: 24, height: 24 }}
                          >
                            {agendamento.profissionalNome?.charAt(0) || '?'}
                          </Avatar>
                          {agendamento.profissionalNome || '-'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(agendamento.status)}
                          label={getStatusLabel(agendamento.status)}
                          color={getStatusColor(agendamento.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
              Nenhum histórico de agendamentos encontrado
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Novo Agendamento */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon />
            <Typography variant="h6">Novo Agendamento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Serviço *</InputLabel>
                <Select
                  value={formData.servicoId}
                  label="Serviço *"
                  onChange={(e) => setFormData({ ...formData, servicoId: e.target.value })}
                >
                  {servicos.map(servico => (
                    <MenuItem key={servico.id} value={servico.id}>
                      <Box>
                        <Typography variant="body2">{servico.nome}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          R$ {servico.preco?.toFixed(2)} • {servico.duracao} min
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Profissional</InputLabel>
                <Select
                  value={formData.profissionalId}
                  label="Profissional"
                  onChange={(e) => setFormData({ ...formData, profissionalId: e.target.value })}
                >
                  <MenuItem value="">Qualquer profissional disponível</MenuItem>
                  {profissionais.map(prof => (
                    <MenuItem key={prof.id} value={prof.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={prof.foto} sx={{ width: 24, height: 24 }}>
                          {prof.nome?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{prof.nome}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {prof.especialidade}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Data *"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size="small"
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                error={formData.data && !isDataValida(formData.data)}
                helperText={formData.data && !isDataValida(formData.data) ? 'Data inválida' : ''}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Horário *</InputLabel>
                <Select
                  value={formData.horario}
                  label="Horário *"
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                >
                  {timeSlots.map(time => (
                    <MenuItem key={time} value={time}>{time}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                size="small"
                placeholder="Alguma observação especial? (ex: alergias, preferências)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSalvarAgendamento}
            variant="contained"
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
          >
            Solicitar Agendamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Cancelamento */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CancelIcon />
            <Typography variant="h6">Cancelar Agendamento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
            Tem certeza que deseja cancelar este agendamento?
          </Typography>
          {selectedAgendamento && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2">
                <strong>Data:</strong> {formatarData(selectedAgendamento.data)} às {selectedAgendamento.horario}
              </Typography>
              <Typography variant="body2">
                <strong>Serviço:</strong> {selectedAgendamento.servicoNome}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Voltar</Button>
          <Button onClick={confirmarCancelamento} color="error" variant="contained">
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon />
            <Typography variant="h6">Detalhes do Agendamento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAgendamento && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Data</Typography>
                  <Typography variant="body2">
                    {formatarData(selectedAgendamento.data)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Horário</Typography>
                  <Typography variant="body2">{selectedAgendamento.horario}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Serviço</Typography>
                  <Typography variant="body2">{selectedAgendamento.servicoNome}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Profissional</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar 
                      src={profissionais.find(p => p.id === selectedAgendamento.profissionalId)?.foto}
                      sx={{ width: 32, height: 32 }}
                    >
                      {selectedAgendamento.profissionalNome?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {selectedAgendamento.profissionalNome || 'A definir'}
                    </Typography>
                  </Box>
                </Grid>
                {selectedAgendamento.observacoes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Observações</Typography>
                    <Typography variant="body2">{selectedAgendamento.observacoes}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Status</Typography>
                  <Chip
                    label={getStatusLabel(selectedAgendamento.status)}
                    color={getStatusColor(selectedAgendamento.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Solicitado em</Typography>
                  <Typography variant="body2">
                    {formatarData(selectedAgendamento.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Fechar</Button>
          {selectedAgendamento?.status === 'pendente' && (
            <Button 
              color="error" 
              onClick={() => {
                setOpenDetailsDialog(false);
                handleCancelarAgendamento(selectedAgendamento);
              }}
            >
              Cancelar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClienteAgendamentos;
