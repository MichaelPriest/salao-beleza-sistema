// src/pages/ModernServicos.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';

const categories = ['Cabelo', 'Unhas', 'Barba', 'Maquiagem', 'Estética', 'Depilação', 'Massagem'];

function ModernServicos() {
  const [loading, setLoading] = useState(true);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: 60,
    preco: '',
    categoria: 'Cabelo',
    comissaoProfissional: 50,
    ativo: true
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [servicosData, profissionaisData] = await Promise.all([
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
      ]);
      
      setServicos(servicosData || []);
      setProfissionais(profissionaisData || []);
      toast.success('Dados carregados!');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Reset form quando abrir modal
  useEffect(() => {
    if (openDialog) {
      if (selectedService) {
        setFormData({
          nome: selectedService.nome || '',
          descricao: selectedService.descricao || '',
          duracao: selectedService.duracao || 60,
          preco: selectedService.preco || '',
          categoria: selectedService.categoria || 'Cabelo',
          comissaoProfissional: selectedService.comissaoProfissional || 50,
          ativo: selectedService.ativo !== undefined ? selectedService.ativo : true
        });
      } else {
        setFormData({
          nome: '',
          descricao: '',
          duracao: 60,
          preco: '',
          categoria: 'Cabelo',
          comissaoProfissional: 50,
          ativo: true
        });
      }
    }
  }, [openDialog, selectedService]);

  const handleAdd = () => {
    setSelectedService(null);
    setOpenDialog(true);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    setServiceToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await firebaseService.delete('servicos', serviceToDelete);
      setServicos(servicos.filter(s => s.id !== serviceToDelete));
      mostrarSnackbar('Serviço excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      mostrarSnackbar('Erro ao excluir serviço', 'error');
    }
    setOpenDeleteDialog(false);
    setServiceToDelete(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    
    try {
      // Validar campos obrigatórios
      if (!formData.nome || !formData.duracao || !formData.preco) {
        mostrarSnackbar('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      // Validar preço
      const precoNumerico = parseFloat(formData.preco.toString().replace(',', '.'));
      if (isNaN(precoNumerico) || precoNumerico <= 0) {
        mostrarSnackbar('Preço inválido', 'error');
        return;
      }

      const serviceData = {
        ...formData,
        preco: precoNumerico,
        duracao: parseInt(formData.duracao),
        comissaoProfissional: parseInt(formData.comissaoProfissional) || 50,
        updatedAt: new Date().toISOString()
      };

      if (selectedService) {
        await firebaseService.update('servicos', selectedService.id, serviceData);
        setServicos(servicos.map(s => 
          s.id === selectedService.id ? { ...serviceData, id: selectedService.id } : s
        ));
        mostrarSnackbar('Serviço atualizado com sucesso!');
      } else {
        const novoId = await firebaseService.add('servicos', serviceData);
        setServicos([...servicos, { ...serviceData, id: novoId }]);
        mostrarSnackbar('Serviço adicionado com sucesso!');
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      mostrarSnackbar('Erro ao salvar serviço', 'error');
    }
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const formatarDuracao = (minutos) => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  // Função para verificar se um profissional realiza este serviço
  const profissionalRealizaServico = (profissional, servico) => {
    // Verificar pela especialidade
    if (profissional.especialidade && 
        profissional.especialidade.toLowerCase().includes(servico.categoria.toLowerCase())) {
      return true;
    }
    
    // Verificar pelo nome
    if (servico.nome.toLowerCase().includes('cabelo') && 
        profissional.especialidade?.toLowerCase().includes('cabelo')) {
      return true;
    }
    
    if (servico.nome.toLowerCase().includes('barba') && 
        profissional.especialidade?.toLowerCase().includes('barba')) {
      return true;
    }
    
    return false;
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Serviços
        </Typography>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              color: 'white',
              boxShadow: '0 3px 15px rgba(156,39,176,0.3)',
            }}
          >
            Novo Serviço
          </Button>
        </motion.div>
      </Box>

      {servicos.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Nenhum serviço cadastrado
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Clique no botão "Novo Serviço" para começar
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {servicos.map((service, index) => {
              // Encontrar profissionais que realizam este serviço
              const profissionaisDoServico = profissionais.filter(prof => 
                profissionalRealizaServico(prof, service)
              );

              return (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    layout
                  >
                    <Card sx={{ 
                      height: '100%', 
                      position: 'relative',
                      opacity: service.ativo ? 1 : 0.7,
                      bgcolor: service.ativo ? 'white' : '#f5f5f5'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Chip 
                            label={service.categoria}
                            size="small"
                            sx={{
                              backgroundColor: '#f3e5f5',
                              color: '#9c27b0',
                              fontWeight: 600,
                            }}
                          />
                          <Box>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEdit(service)}
                              sx={{ color: '#9c27b0' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(service.id)}
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {service.nome}
                        </Typography>

                        {service.descricao && (
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            {service.descricao}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="textSecondary">
                              {formatarDuracao(service.duracao)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AttachMoneyIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                              {formatarPreco(service.preco)}
                            </Typography>
                          </Box>
                        </Box>

                        {service.comissaoProfissional && (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                            Comissão: {service.comissaoProfissional}%
                          </Typography>
                        )}

                        {profissionaisDoServico.length > 0 ? (
                          <>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Profissionais:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {profissionaisDoServico.slice(0, 4).map(prof => (
                                <Chip
                                  key={prof.id}
                                  label={prof.nome.split(' ')[0]}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                              {profissionaisDoServico.length > 4 && (
                                <Chip
                                  label={`+${profissionaisDoServico.length - 4}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </>
                        ) : (
                          <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                            Nenhum profissional vinculado
                          </Typography>
                        )}

                        {!service.ativo && (
                          <Chip
                            label="Inativo"
                            size="small"
                            color="error"
                            sx={{ position: 'absolute', top: 10, right: 10 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>
      )}

      {/* Dialog de Serviço */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
          {selectedService ? 'Editar Serviço' : 'Novo Serviço'}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Nome do Serviço"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={formData.categoria}
                    label="Categoria"
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={2}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Breve descrição do serviço"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duração (minutos)"
                  type="number"
                  value={formData.duracao}
                  onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                  InputProps={{ inputProps: { min: 15, step: 15 } }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preço"
                  type="number"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Comissão do Profissional (%)"
                  type="number"
                  value={formData.comissaoProfissional}
                  onChange={(e) => setFormData({ ...formData, comissaoProfissional: e.target.value })}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.ativo ? 'true' : 'false'}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'true' })}
                  >
                    <MenuItem value="true">Ativo</MenuItem>
                    <MenuItem value="false">Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              {selectedService ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Tem certeza que deseja excluir este serviço?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Esta ação não poderá ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={confirmDelete}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ModernServicos;
