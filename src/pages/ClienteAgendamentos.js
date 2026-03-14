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
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';

function ClienteAgendamentos() {
  const navigate = useNavigate();
  const { cliente } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
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
      
      console.log('📌 Buscando agendamentos para clienteId:', cliente.id);
      
      const [agendamentosData, servicosData, profissionaisData] = await Promise.all([
        firebaseService.query('agendamentos', [
          { field: 'clienteId', operator: '==', value: cliente.id }
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
    setFormData({
      servicoId: '',
      profissionalId: '',
      data: '',
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
      
      const hoje = new Date().toISOString().split('T')[0];
      if (formData.data < hoje) {
        toast.error('Não é possível agendar para datas passadas');
        return;
      }

      const novoAgendamento = {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        servicoId: formData.servicoId,
        servicoNome: servico?.nome,
        profissionalId: formData.profissionalId || null,
        profissionalNome: profissionais.find(p => p.id === formData.profissionalId)?.nome || null,
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmado': return 'success';
      case 'pendente': return 'warning';
      case 'cancelado': return 'error';
      case 'finalizado': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Realizado';
      default: return status || 'Pendente';
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const agendamentosFuturos = agendamentos.filter(a => 
    a.status !== 'cancelado' && a.status !== 'finalizado'
  );

  const agendamentosPassados = agendamentos.filter(a => 
    a.status === 'cancelado' || a.status === 'finalizado'
  );

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
          sx={{ bgcolor: '#9c27b0' }}
        >
          Novo Agendamento
        </Button>
      </Box>

      {/* Próximos Agendamentos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Próximos Agendamentos
          </Typography>

          {agendamentosFuturos.length > 0 ? (
            <Grid container spacing={2}>
              {agendamentosFuturos.map((agendamento, index) => (
                <Grid item xs={12} key={index}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ color: '#9c27b0' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {formatarData(agendamento.data)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {agendamento.horario}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body1">
                          {agendamento.servicoNome || 'Serviço'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Profissional: {agendamento.profissionalNome || 'A definir'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Chip
                          label={getStatusLabel(agendamento.status)}
                          color={getStatusColor(agendamento.status)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
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
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                          >
                            Detalhes
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Você não tem agendamentos futuros
              </Typography>
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
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Profissional</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agendamentosPassados.map((agendamento, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatarData(agendamento.data)}</TableCell>
                      <TableCell>{agendamento.servicoNome || 'Serviço'}</TableCell>
                      <TableCell>{agendamento.profissionalNome || '-'}</TableCell>
                      <TableCell>
                        <Chip
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
            <Typography variant="body2" color="textSecondary" align="center">
              Nenhum histórico de agendamentos
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Novo Agendamento */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Novo Agendamento
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Serviço *</InputLabel>
                <Select
                  value={formData.servicoId}
                  label="Serviço *"
                  onChange={(e) => setFormData({ ...formData, servicoId: e.target.value })}
                >
                  {servicos.map(servico => (
                    <MenuItem key={servico.id} value={servico.id}>
                      {servico.nome} - R$ {servico.preco?.toFixed(2)}
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
                  <MenuItem value="">Qualquer profissional</MenuItem>
                  {profissionais.map(prof => (
                    <MenuItem key={prof.id} value={prof.id}>
                      {prof.nome}
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
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
                placeholder="Alguma observação especial?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSalvarAgendamento}
            variant="contained"
            sx={{ bgcolor: '#9c27b0' }}
          >
            Solicitar Agendamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Cancelamento */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle sx={{ color: '#f44336' }}>Cancelar Agendamento</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja cancelar este agendamento?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Voltar</Button>
          <Button onClick={confirmarCancelamento} color="error" variant="contained">
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClienteAgendamentos;
