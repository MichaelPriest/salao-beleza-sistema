// src/pages/ClienteAnamneseLista.js - VERSÃO OTIMIZADA PARA MOBILE
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
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Zoom,
  SwipeableDrawer,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  CardActions,
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
  FilterList as FilterIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente de card para formulário pendente (mobile)
const PendenteMobileCard = ({ item, onResponder }) => {
  const [expanded, setExpanded] = useState(false);

  const formatarData = (data) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return data;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 1.5,
          borderLeft: '4px solid',
          borderLeftColor: '#ff9800',
          borderRadius: 1.5,
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          {/* Cabeçalho com data */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ color: '#ff9800', fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatarData(item.dataAgendamento)}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                {item.horarioAgendamento}
              </Typography>
            </Box>
            <Chip
              label="Pendente"
              size="small"
              sx={{
                bgcolor: '#ff9800',
                color: 'white',
                height: 20,
                fontSize: '0.6rem'
              }}
            />
          </Box>

          {/* Título do formulário */}
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {item.formularioTitulo}
          </Typography>

          {/* Serviço */}
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
            {item.servicoNome}
          </Typography>

          {/* Botão Responder */}
          <Button
            fullWidth
            size="small"
            variant="contained"
            endIcon={<ArrowIcon />}
            onClick={() => onResponder(item.agendamentoId, item.formularioId)}
            sx={{ 
              bgcolor: '#ff9800',
              '&:hover': { bgcolor: '#f57c00' },
              mt: 0.5,
              fontSize: '0.7rem',
              py: 0.5
            }}
          >
            Responder Agora
          </Button>

          {/* Expandir para mais detalhes (opcional) */}
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ fontSize: '0.6rem', color: '#666' }}
            >
              {expanded ? 'Menos detalhes' : 'Mais detalhes'}
            </Button>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" display="block" color="textSecondary">
                <strong>ID:</strong> {item.agendamentoId.slice(-6)}
              </Typography>
              {item.formularioDescricao && (
                <Typography variant="caption" display="block" color="textSecondary">
                  <strong>Descrição:</strong> {item.formularioDescricao}
                </Typography>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de card para formulário respondido (mobile)
const RespondidoMobileCard = ({ item, onVisualizar }) => {
  const formatarData = (data) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return data;
    }
  };

  const formatarDataHora = (data) => {
    if (!data) return '-';
    try {
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return data;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
    >
      <Card variant="outlined" sx={{ mb: 1.5, borderRadius: 1.5 }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          {/* Cabeçalho com data */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EventIcon sx={{ color: '#4caf50', fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatarData(item.dataAgendamento)}
              </Typography>
            </Box>
            <Chip
              label="Respondido"
              size="small"
              sx={{
                bgcolor: '#4caf50',
                color: 'white',
                height: 20,
                fontSize: '0.6rem'
              }}
            />
          </Box>

          {/* Título do formulário */}
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {item.formularioTitulo}
          </Typography>

          {/* Serviço */}
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
            {item.servicoNome}
          </Typography>

          {/* Data da resposta */}
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
            Respondido: {formatarDataHora(item.respondidoEm)}
          </Typography>

          {/* Botão Visualizar */}
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => onVisualizar(item.respostaId)}
            sx={{ 
              borderColor: '#2196f3',
              color: '#2196f3',
              fontSize: '0.7rem',
              py: 0.5
            }}
          >
            Visualizar Respostas
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de filtro mobile
const MobileFilterDrawer = ({ open, onClose, filterType, setFilterType }) => {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '70vh'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Filtrar por
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {[
            { value: 'todos', label: 'Todos os formulários' },
            { value: 'pendentes', label: 'Apenas pendentes', color: '#ff9800' },
            { value: 'respondidos', label: 'Apenas respondidos', color: '#4caf50' },
          ].map((item) => (
            <ListItem
              key={item.value}
              button
              onClick={() => {
                setFilterType(item.value);
                onClose();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: filterType === item.value ? (item.color ? `${item.color}20` : '#f3e5f5') : 'transparent',
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: filterType === item.value ? 600 : 400,
                    color: item.color || 'inherit'
                  }
                }}
              />
              {filterType === item.value && (
                <CheckIcon sx={{ color: item.color || '#9c27b0', fontSize: 20 }} />
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  );
};

function ClienteAnamneseLista() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { cliente, firebaseUser } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [formulariosPendentes, setFormulariosPendentes] = useState([]);
  const [formulariosRespondidos, setFormulariosRespondidos] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  
  // Estados para mobile
  const [filterType, setFilterType] = useState('todos');
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const getClienteIds = () => Array.from(new Set([
    firebaseUser?.uid,
    cliente?.id,
    cliente?.authUid,
    cliente?.googleUid,
  ].filter(Boolean)));

  const getAgendamentoServicoIds = (agendamento = {}) => Array.from(new Set([
    agendamento.servicoId,
    ...(agendamento.servicosIds || []),
    ...(agendamento.servicoIds || []),
    ...(agendamento.servicos || []).map((servico) => servico.id),
  ].flat().filter(Boolean)));

  const formularioAtendeServico = (formulario, servicoIds = []) => {
    const idsFormulario = formulario.servicoIds || formulario.servicosIds || [];
    return idsFormulario.some((servicoId) => servicoIds.includes(servicoId));
  };

  useEffect(() => {
    if (cliente) {
      carregarDados();
    }
  }, [cliente]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const idsCliente = getClienteIds();
      
      if (idsCliente.length === 0) {
        console.error('ID do cliente não encontrado');
        return;
      }

      // Buscar agendamentos do cliente usando todos os vínculos possíveis do portal.
      const agendamentosPorId = await Promise.all(idsCliente.map((id) =>
        firebaseService.query('agendamentos', [
          { field: 'clienteId', operator: '==', value: id }
        ], 'data', 'desc')
      ));
      const agendamentosData = Array.from(new Map(agendamentosPorId.flat().map((item) => [item.id, item])).values());

      // Buscar todos os formulários
      const formulariosData = await firebaseService.getAll('formularios_anamnese');

      // Buscar respostas do cliente usando todos os vínculos possíveis do portal.
      const respostasPorId = await Promise.all(idsCliente.map((id) =>
        firebaseService.query('respostas_anamnese', [
          { field: 'clienteId', operator: '==', value: id }
        ], 'respondidoEm', 'desc')
      ));
      const respostasData = Array.from(new Map(respostasPorId.flat().map((item) => [item.id, item])).values());

      // Buscar serviços
      const servicosData = await firebaseService.getAll('servicos');

      setAgendamentos(agendamentosData || []);
      setFormularios(formulariosData || []);
      setServicos(servicosData || []);

      // Processar formulários pendentes
      const pendentes = [];
      const respondidos = [];

      // Mapear respostas por agendamento e formulário para não marcar todos os formulários
      // do agendamento como respondidos quando apenas um deles foi enviado.
      const respostasPorAgendamentoFormulario = {};
      respostasData.forEach(resp => {
        if (resp.agendamentoId && resp.formularioId) {
          respostasPorAgendamentoFormulario[`${resp.agendamentoId}_${resp.formularioId}`] = resp;
        }
      });

      // Verificar cada agendamento
      for (const agendamento of agendamentosData || []) {
        // Buscar formulários associados a qualquer serviço do agendamento.
        const servicoIdsAgendamento = getAgendamentoServicoIds(agendamento);
        const formulariosDoServico = formulariosData.filter(f => 
          formularioAtendeServico(f, servicoIdsAgendamento) && f.ativo !== false
        );

        for (const formulario of formulariosDoServico) {
          const resposta = respostasPorAgendamentoFormulario[`${agendamento.id}_${formulario.id}`];
          
          const item = {
            id: `${agendamento.id}_${formulario.id}`,
            agendamentoId: agendamento.id,
            formularioId: formulario.id,
            formularioTitulo: formulario.titulo,
            formularioDescricao: formulario.descricao,
            servicoId: servicoIdsAgendamento[0],
            servicoNome: agendamento.servicosNomes || servicoIdsAgendamento.map((servicoId) => servicosData.find(s => s.id === servicoId)?.nome).filter(Boolean).join(', ') || 'Serviço',
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
    const query = formularioId ? `?formularioId=${encodeURIComponent(formularioId)}` : '';
    navigate(`/cliente/agendamento/${agendamentoId}/anamnese${query}`);
  };

  const handleVisualizar = (respostaId) => {
    navigate(`/cliente/anamnese/${respostaId}`);
  };

  const handleVerDetalhes = (item) => {
    setSelectedItem(item);
    setOpenDetalhesDialog(true);
  };

  const formatarData = (data) => {
    if (!data) return '';
    try {
      if (isMobile) {
        return format(new Date(data + 'T12:00:00'), "dd/MM", { locale: ptBR });
      }
      return format(new Date(data + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  const formatarDataHora = (data) => {
    if (!data) return '';
    try {
      const d = new Date(data);
      if (isMobile) {
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
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

  // VERSÃO MOBILE
  if (isMobile) {
    return (
      <Box sx={{ pb: 7 }}>
        {/* Header Mobile */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'white',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Anamnese
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={() => setOpenFilterDrawer(true)}>
              <Badge badgeContent={filterType !== 'todos' ? 1 : 0} color="secondary">
                <FilterIcon fontSize="small" />
              </Badge>
            </IconButton>
            <IconButton size="small" onClick={carregarDados}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Cards de Resumo Mobile */}
        <Grid container spacing={1} sx={{ p: 2, pb: 1 }}>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#fff3e0', textAlign: 'center', py: 1 }}>
              <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32, mx: 'auto', mb: 0.5 }}>
                <AssignmentIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {formulariosPendentes.length}
              </Typography>
              <Typography variant="caption">Pendentes</Typography>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#e8f5e9', textAlign: 'center', py: 1 }}>
              <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32, mx: 'auto', mb: 0.5 }}>
                <CheckIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {formulariosRespondidos.length}
              </Typography>
              <Typography variant="caption">Respondidos</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Lista de Pendentes */}
        {filterType !== 'respondidos' && (
          <Box sx={{ px: 2, mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AssignmentIcon sx={{ color: '#ff9800', fontSize: 16 }} />
              Pendentes ({formulariosPendentes.length})
            </Typography>
            
            <AnimatePresence>
              {formulariosPendentes.length > 0 ? (
                formulariosPendentes.map((item) => (
                  <PendenteMobileCard
                    key={item.id}
                    item={item}
                    onResponder={handleResponder}
                  />
                ))
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <CheckIcon sx={{ fontSize: 32, color: '#4caf50', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Nenhum pendente!
                  </Typography>
                </Paper>
              )}
            </AnimatePresence>
          </Box>
        )}

        {/* Lista de Respondidos */}
        {filterType !== 'pendentes' && (
          <Box sx={{ px: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <HistoryIcon sx={{ color: '#4caf50', fontSize: 16 }} />
              Histórico ({formulariosRespondidos.length})
            </Typography>
            
            <AnimatePresence>
              {formulariosRespondidos.length > 0 ? (
                formulariosRespondidos.slice(0, 5).map((item) => (
                  <RespondidoMobileCard
                    key={item.id}
                    item={item}
                    onVisualizar={handleVisualizar}
                  />
                ))
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Nenhum respondido
                  </Typography>
                </Paper>
              )}
              
              {formulariosRespondidos.length > 5 && (
                <Button
                  fullWidth
                  size="small"
                  onClick={() => setFilterType('respondidos')}
                  sx={{ color: '#9c27b0', mt: 0.5 }}
                >
                  Ver mais {formulariosRespondidos.length - 5}
                </Button>
              )}
            </AnimatePresence>
          </Box>
        )}

        {/* Filter Drawer */}
        <MobileFilterDrawer
          open={openFilterDrawer}
          onClose={() => setOpenFilterDrawer(false)}
          filterType={filterType}
          setFilterType={setFilterType}
        />

        {/* Dialog de Detalhes */}
        <Dialog open={openDetalhesDialog} onClose={() => setOpenDetalhesDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white', py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Detalhes do Formulário</Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 2 }}>
            {selectedItem && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedItem.formularioTitulo}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  {selectedItem.formularioDescricao}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Data</Typography>
                    <Typography variant="body2">{selectedItem.dataAgendamento}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Horário</Typography>
                    <Typography variant="body2">{selectedItem.horarioAgendamento}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Serviço</Typography>
                    <Typography variant="body2">{selectedItem.servicoNome}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button size="small" onClick={() => setOpenDetalhesDialog(false)}>Fechar</Button>
            {selectedItem?.status === 'pendente' && (
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  setOpenDetalhesDialog(false);
                  handleResponder(selectedItem.agendamentoId, selectedItem.formularioId);
                }}
                sx={{ bgcolor: '#ff9800' }}
              >
                Responder
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // VERSÃO DESKTOP (original mantida)
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
