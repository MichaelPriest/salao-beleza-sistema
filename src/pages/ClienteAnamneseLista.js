// src/pages/Cliente/ClienteAnamneseLista.js
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
  Avatar,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  ArrowForward as ArrowIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../../services/firebase';
import { useAuthCliente } from '../../contexts/AuthClienteContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function ClienteAnamneseLista() {
  const navigate = useNavigate();
  const { cliente, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [formulariosPendentes, setFormulariosPendentes] = useState([]);
  const [formulariosRespondidos, setFormulariosRespondidos] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);

  useEffect(() => {
    if (cliente) {
      carregarDados();
    }
  }, [cliente]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const uid = firebaseUser?.uid || cliente?.id;
      
      if (!uid) {
        console.error('ID do cliente não encontrado');
        return;
      }

      // Buscar agendamentos do cliente
      const agendamentosData = await firebaseService.query('agendamentos', [
        { field: 'clienteId', operator: '==', value: uid }
      ], 'data', 'desc');

      // Buscar todos os formulários
      const formulariosData = await firebaseService.getAll('formularios_anamnese');

      // Buscar respostas do cliente
      const respostasData = await firebaseService.query('respostas_anamnese', [
        { field: 'clienteId', operator: '==', value: uid }
      ], 'respondidoEm', 'desc');

      // Buscar serviços
      const servicosData = await firebaseService.getAll('servicos');

      setAgendamentos(agendamentosData || []);
      setFormularios(formulariosData || []);
      setServicos(servicosData || []);

      // Processar formulários pendentes
      const pendentes = [];
      const respondidos = [];

      // Mapear respostas por agendamento
      const respostasPorAgendamento = {};
      respostasData.forEach(resp => {
        if (resp.agendamentoId) {
          respostasPorAgendamento[resp.agendamentoId] = resp;
        }
      });

      // Verificar cada agendamento
      for (const agendamento of agendamentosData || []) {
        // Buscar formulários associados ao serviço do agendamento
        const formulariosDoServico = formulariosData.filter(f => 
          f.servicoIds?.includes(agendamento.servicoId) && f.ativo !== false
        );

        for (const formulario of formulariosDoServico) {
          const resposta = respostasPorAgendamento[agendamento.id];
          
          const item = {
            id: `${agendamento.id}_${formulario.id}`,
            agendamentoId: agendamento.id,
            formularioId: formulario.id,
            formularioTitulo: formulario.titulo,
            formularioDescricao: formulario.descricao,
            servicoId: agendamento.servicoId,
            servicoNome: servicosData.find(s => s.id === agendamento.servicoId)?.nome || 'Serviço',
            dataAgendamento: agendamento.data,
            horarioAgendamento: agendamento.horario,
            status: resposta ? 'respondido' : 'pendente',
            respondidoEm: resposta?.respondidoEm,
            respostaId: resposta?.id,
          };

          if (resposta) {
            respondidos.push(item);
          } else {
            pendentes.push(item);
          }
        }
      }

      // Ordenar pendentes por data
      pendentes.sort((a, b) => a.dataAgendamento.localeCompare(b.dataAgendamento));
      
      // Ordenar respondidos por data (mais recentes primeiro)
      respondidos.sort((a, b) => {
        if (a.respondidoEm && b.respondidoEm) {
          return b.respondidoEm.localeCompare(a.respondidoEm);
        }
        return b.dataAgendamento.localeCompare(a.dataAgendamento);
      });

      setFormulariosPendentes(pendentes);
      setFormulariosRespondidos(respondidos);

    } catch (error) {
      console.error('Erro ao carregar formulários:', error);
      toast.error('Erro ao carregar formulários');
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = (agendamentoId, formularioId) => {
    navigate(`/cliente/atendimento/${agendamentoId}/anamnese`);
  };

  const handleVisualizar = (respostaId) => {
    navigate(`/cliente/anamnese/${respostaId}`);
  };

  const formatarData = (data) => {
    if (!data) return '';
    try {
      return format(new Date(data + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  const formatarDataHora = (data) => {
    if (!data) return '';
    try {
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return data;
    }
  };

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
            Formulários de Anamnese
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Preencha os formulários necessários para seus atendimentos
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={carregarDados}
        >
          Atualizar
        </Button>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {formulariosPendentes.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Formulários Pendentes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                  <CheckIcon />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {formulariosRespondidos.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Formulários Respondidos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Formulários Pendentes */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Pendentes
          </Typography>

          {formulariosPendentes.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Você não tem formulários pendentes!
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Todos os formulários necessários já foram preenchidos.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {formulariosPendentes.map((item, index) => (
                <Grid item xs={12} key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="outlined" sx={{ 
                      borderLeft: '4px solid',
                      borderLeftColor: '#ff9800',
                      '&:hover': { boxShadow: 3 }
                    }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EventIcon sx={{ color: '#ff9800' }} />
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {formatarData(item.dataAgendamento)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {item.horarioAgendamento}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {item.formularioTitulo}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.servicoNome}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <Chip
                              label="Pendente"
                              size="small"
                              sx={{ bgcolor: '#ff9800', color: 'white' }}
                            />
                          </Grid>

                          <Grid item xs={12} md={2}>
                            <Button
                              fullWidth
                              variant="contained"
                              endIcon={<ArrowIcon />}
                              onClick={() => handleResponder(item.agendamentoId, item.formularioId)}
                              sx={{ bgcolor: '#ff9800' }}
                            >
                              Responder
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Formulários Respondidos */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Histórico de Respostas
          </Typography>

          {formulariosRespondidos.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhum formulário respondido ainda
              </Typography>
            </Paper>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Formulário</strong></TableCell>
                    <TableCell><strong>Serviço</strong></TableCell>
                    <TableCell><strong>Respondido em</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formulariosRespondidos.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        {formatarData(item.dataAgendamento)}
                        <Typography variant="caption" display="block" color="textSecondary">
                          {item.horarioAgendamento}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.formularioTitulo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.servicoNome} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {formatarDataHora(item.respondidoEm)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Visualizar respostas">
                          <IconButton
                            size="small"
                            onClick={() => handleVisualizar(item.respostaId)}
                            sx={{ color: '#2196f3' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ClienteAnamneseLista;
