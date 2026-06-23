// src/pages/ModernProfissionais.js
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
  Avatar,
  Rating,
  Paper,
  Alert,
  CircularProgress,
  Badge,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import ProfissionaisSectionNav from '../components/ProfissionaisSectionNav';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const specialties = [
  'Cabelo e Coloração',
  'Barba e Corte Masculino',
  'Unhas',
  'Maquiagem',
  'Estética Facial',
  'Depilação',
  'Massagem',
  'Design de Sobrancelhas',
];

const diasSemana = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo'
];

const COLORS = ['#9c27b0', '#ff4081', '#4caf50', '#ff9800', '#f44336', '#2196f3'];

// Constantes para evitar repetição de valores mágicos
const INITIAL_FORM_DATA = {
  nome: '',
  especialidade: '',
  especialidades: [],
  telefone: '',
  email: '',
  dataContratacao: new Date().toISOString().split('T')[0],
  status: 'ativo',
  comissao: 40,
  precoHora: '',
  historicoPrecos: [],
  foto: null,
  redes: {
    instagram: '',
    facebook: '',
    whatsapp: '',
  },
  horarioTrabalho: '09:00 - 18:00',
  diasTrabalho: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
};

const diasSemanaDisponibilidade = {
  Domingo: 0,
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
};

function ModernProfissionais() {
  const [loading, setLoading] = useState(true);
  const [profissionais, setProfissionais] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedProfessionalDetail, setSelectedProfessionalDetail] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estado do formulário
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [profissionaisData, atendimentosData, servicosData, disponibilidadesData] = await Promise.all([
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('atendimentos').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('disponibilidades').catch(() => []),
      ]);
      
      setProfissionais(profissionaisData || []);
      setAtendimentos(atendimentosData || []);
      setServicos(servicosData || []);
      setDisponibilidades(disponibilidadesData || []);
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
      if (selectedProfessional) {
        // Extrair dados do profissional selecionado para o formulário
        const especialidades = selectedProfessional.especialidades?.length 
          ? selectedProfessional.especialidades 
          : (selectedProfessional.especialidade ? [selectedProfessional.especialidade] : []);
        
        setFormData({
          nome: selectedProfessional.nome || '',
          especialidade: especialidades[0] || '',
          especialidades: especialidades,
          telefone: selectedProfessional.telefone || '',
          email: selectedProfessional.email || '',
          dataContratacao: selectedProfessional.dataContratacao?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: selectedProfessional.status || 'ativo',
          comissao: selectedProfessional.comissao || 40,
          precoHora: selectedProfessional.precoHora || '',
          historicoPrecos: selectedProfessional.historicoPrecos || [],
          foto: selectedProfessional.foto || null,
          redes: {
            instagram: selectedProfessional.redes?.instagram || '',
            facebook: selectedProfessional.redes?.facebook || '',
            whatsapp: selectedProfessional.redes?.whatsapp || '',
          },
          horarioTrabalho: selectedProfessional.horarioTrabalho || '09:00 - 18:00',
          diasTrabalho: selectedProfessional.diasTrabalho || ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
        });
        setFotoPreview(selectedProfessional.foto || null);
      } else {
        setFormData(INITIAL_FORM_DATA);
        setFotoPreview(null);
        setFotoFile(null);
      }
    }
  }, [openDialog, selectedProfessional]);

  // Calcular estatísticas reais para cada profissional
  const getProfissionalStats = (profissionalId) => {
    // Filtrar atendimentos do profissional
    const atendimentosProfissional = atendimentos.filter(a => a.profissionalId === profissionalId);
    
    // Calcular total de serviços realizados
    const servicosRealizados = atendimentosProfissional.length;
    
    // Calcular faturamento total
    let faturamento = 0;
    atendimentosProfissional.forEach(atendimento => {
      const servico = servicos.find(s => s.id === atendimento.servicoId);
      if (servico) {
        faturamento += servico.preco || 0;
      }
    });
    
    // Calcular avaliação média (baseada em notas dos atendimentos)
    const notas = atendimentosProfissional.filter(a => a.avaliacao).map(a => a.avaliacao);
    const avaliacaoMedia = notas.length > 0 
      ? parseFloat((notas.reduce((acc, curr) => acc + curr, 0) / notas.length).toFixed(1))
      : 5.0;
    
    return {
      servicosRealizados,
      faturamento,
      avaliacao: avaliacaoMedia
    };
  };

  // Gerar dados de performance baseados em atendimentos reais
  const gerarPerformanceData = (profissionalId) => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data = [];
    
    // Filtrar atendimentos do profissional
    const atendimentosProfissional = atendimentos.filter(a => a.profissionalId === profissionalId);
    
    // Agrupar por mês (últimos 6 meses)
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const dataMes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesIndex = dataMes.getMonth();
      const ano = dataMes.getFullYear();
      
      const atendimentosMes = atendimentosProfissional.filter(a => {
        const dataAtendimento = a.data?.toDate ? a.data.toDate() : new Date(a.data);
        return dataAtendimento.getMonth() === mesIndex && 
               dataAtendimento.getFullYear() === ano;
      });
      
      let faturamentoMes = 0;
      atendimentosMes.forEach(a => {
        const servico = servicos.find(s => s.id === a.servicoId);
        if (servico) {
          faturamentoMes += servico.preco || 0;
        }
      });
      
      data.push({
        mes: meses[mesIndex],
        atendimentos: atendimentosMes.length,
        faturamento: faturamentoMes,
      });
    }
    
    return data;
  };

  // Gerar dados para gráfico de pizza (distribuição de serviços)
  const gerarDistribuicaoServicos = (profissionalId) => {
    const atendimentosProfissional = atendimentos.filter(a => a.profissionalId === profissionalId);
    const servicosCount = {};
    
    atendimentosProfissional.forEach(a => {
      const servico = servicos.find(s => s.id === a.servicoId);
      if (servico) {
        servicosCount[servico.nome] = (servicosCount[servico.nome] || 0) + 1;
      }
    });
    
    return Object.entries(servicosCount).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const handleAdd = () => {
    setSelectedProfessional(null);
    setOpenDialog(true);
  };

  const handleEdit = (professional) => {
    setSelectedProfessional(professional);
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    setProfessionalToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!professionalToDelete) return;

    try {
      setLoading(true);
      const disponibilidadesProfissional = disponibilidades.filter((item) => item.profissionalId === professionalToDelete);
      await Promise.all(disponibilidadesProfissional.map((item) => firebaseService.delete('disponibilidades', item.id)));
      await firebaseService.delete('profissionais', professionalToDelete);
      setDisponibilidades(disponibilidades.filter((item) => item.profissionalId !== professionalToDelete));
      setProfissionais(profissionais.filter(p => p.id !== professionalToDelete));
      mostrarSnackbar('Profissional e horários vinculados removidos com sucesso!');
    } catch (error) {
      console.error('Erro ao remover profissional:', error);
      mostrarSnackbar(error.message || 'Erro ao remover profissional', 'error');
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
      setProfessionalToDelete(null);
    }
  };

  const handleViewDetails = (professional) => {
    setSelectedProfessionalDetail(professional);
    setOpenDetailDialog(true);
  };

  const handleFotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        mostrarSnackbar('Por favor, selecione uma imagem válida', 'error');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        mostrarSnackbar('A imagem deve ter no máximo 5MB', 'error');
        return;
      }

      setFotoFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    setFormData({ ...formData, foto: null });
  };

  const parseHorarioTrabalho = (horarioTrabalho = '') => {
    const [inicio = '09:00', fim = '18:00'] = horarioTrabalho
      .split('-')
      .map((parte) => parte.trim());

    return {
      horarioInicio: /^\d{2}:\d{2}$/.test(inicio) ? inicio : '09:00',
      horarioFim: /^\d{2}:\d{2}$/.test(fim) ? fim : '18:00',
    };
  };

  const sincronizarDisponibilidades = async (profissionalId, dadosProfissional) => {
    const diasSelecionados = (dadosProfissional.diasTrabalho || [])
      .map((dia) => diasSemanaDisponibilidade[dia])
      .filter((dia) => dia !== undefined);
    const { horarioInicio, horarioFim } = parseHorarioTrabalho(dadosProfissional.horarioTrabalho);
    const disponibilidadesProfissional = disponibilidades.filter((item) => item.profissionalId === profissionalId);
    const novasDisponibilidades = [...disponibilidades];

    for (const diaSemana of Object.values(diasSemanaDisponibilidade)) {
      const existente = disponibilidadesProfissional.find((item) => item.diaSemana === diaSemana);
      const ativo = dadosProfissional.status === 'ativo' && diasSelecionados.includes(diaSemana);
      const payload = {
        profissionalId,
        diaSemana,
        diasSemana: [diaSemana],
        horarioInicio,
        horarioFim,
        intervaloInicio: '',
        intervaloFim: '',
        usarIntervalo: false,
        ativo,
        observacoes: ativo
          ? 'Sincronizado pelo cadastro de profissionais'
          : 'Inativado pelo cadastro de profissionais',
        updatedAt: new Date().toISOString(),
      };

      if (existente) {
        const atualizado = await firebaseService.update('disponibilidades', existente.id, payload);
        const index = novasDisponibilidades.findIndex((item) => item.id === existente.id);
        if (index >= 0) novasDisponibilidades[index] = { ...novasDisponibilidades[index], ...payload, ...atualizado, id: existente.id };
      } else if (diasSelecionados.includes(diaSemana)) {
        const criada = await firebaseService.add('disponibilidades', payload);
        novasDisponibilidades.push({ ...payload, ...criada, id: criada?.id || payload.id });
      }
    }

    setDisponibilidades(novasDisponibilidades);
  };

  const inativarProfissional = async (professional) => {
    try {
      const dadosAtualizados = { ...professional, status: 'inativo', ativo: false, updatedAt: new Date().toISOString() };
      const atualizado = await firebaseService.update('profissionais', professional.id, dadosAtualizados);
      await sincronizarDisponibilidades(professional.id, dadosAtualizados);
      setProfissionais(profissionais.map((item) => (
        item.id === professional.id ? { ...item, ...dadosAtualizados, ...atualizado, id: professional.id } : item
      )));
      mostrarSnackbar('Profissional inativado e horários removidos da disponibilidade.');
    } catch (error) {
      console.error('Erro ao inativar profissional:', error);
      mostrarSnackbar('Erro ao inativar profissional', 'error');
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    
    try {
      // Validar campos obrigatórios
      if (!formData.nome || (!formData.especialidades?.length && !formData.especialidade) || !formData.telefone || !formData.email) {
        mostrarSnackbar('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      let fotoUrl = formData.foto;
      
      // Se houver uma nova foto, fazer upload (simulado - em produção, enviaria para um servidor)
      if (fotoFile) {
        fotoUrl = fotoPreview;
      }

      const precoHoraNumerico = formData.precoHora === '' ? '' : Number(String(formData.precoHora).replace(',', '.'));
      if (precoHoraNumerico !== '' && (Number.isNaN(precoHoraNumerico) || precoHoraNumerico < 0)) {
        mostrarSnackbar('Valor/hora inválido', 'error');
        return;
      }

      const historicoPrecos = Array.isArray(selectedProfessional?.historicoPrecos)
        ? [...selectedProfessional.historicoPrecos]
        : [];
      const precoAnterior = selectedProfessional?.precoHora ?? '';
      if (selectedProfessional && String(precoAnterior) !== String(precoHoraNumerico)) {
        historicoPrecos.push({
          data: new Date().toISOString(),
          valorAnterior: precoAnterior || 0,
          valorNovo: precoHoraNumerico || 0,
          motivo: 'Atualização no cadastro do profissional',
        });
      } else if (!selectedProfessional && precoHoraNumerico !== '') {
        historicoPrecos.push({
          data: new Date().toISOString(),
          valorAnterior: 0,
          valorNovo: precoHoraNumerico,
          motivo: 'Preço inicial do profissional',
        });
      }

      const especialidadesSelecionadas = formData.especialidades?.length 
        ? formData.especialidades 
        : [formData.especialidade].filter(Boolean);

      const profissionalData = {
        ...formData,
        especialidades: especialidadesSelecionadas,
        especialidade: especialidadesSelecionadas[0] || formData.especialidade,
        comissao: Number(formData.comissao) || 0,
        precoHora: precoHoraNumerico,
        historicoPrecos,
        foto: fotoUrl,
        ativo: formData.status === 'ativo',
        updatedAt: new Date().toISOString()
      };

      if (selectedProfessional) {
        const profissionalAtualizado = await firebaseService.update('profissionais', selectedProfessional.id, profissionalData);
        await sincronizarDisponibilidades(selectedProfessional.id, profissionalData);
        setProfissionais(profissionais.map(p => 
          p.id === selectedProfessional.id ? { ...p, ...profissionalData, ...profissionalAtualizado, id: selectedProfessional.id } : p
        ));
        mostrarSnackbar('Profissional atualizado com sucesso!');
      } else {
        const novoProfissional = await firebaseService.add('profissionais', profissionalData);
        const profissionalCriado = { ...profissionalData, ...novoProfissional, id: novoProfissional?.id || profissionalData.id };
        if (profissionalCriado.id) {
          await sincronizarDisponibilidades(profissionalCriado.id, profissionalCriado);
        }
        setProfissionais([...profissionais, profissionalCriado]);
        mostrarSnackbar('Profissional adicionado com sucesso!');
      }
      
      setOpenDialog(false);
      setSelectedProfessional(null);
      setFotoFile(null);
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      mostrarSnackbar(error.message || 'Erro ao salvar profissional', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ativo': return 'success';
      case 'ferias': return 'warning';
      case 'inativo': return 'error';
      default: return 'default';
    }
  };

  const formatarFaturamento = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleDiaTrabalhoChange = (dia) => {
    const novosDias = formData.diasTrabalho.includes(dia)
      ? formData.diasTrabalho.filter(d => d !== dia)
      : [...formData.diasTrabalho, dia];
    
    setFormData({ ...formData, diasTrabalho: novosDias });
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
      <ProfissionaisSectionNav />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Profissionais
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
            Novo Profissional
          </Button>
        </motion.div>
      </Box>

      {profissionais.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Nenhum profissional cadastrado
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Clique no botão "Novo Profissional" para começar
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {profissionais.map((professional, index) => {
              const stats = getProfissionalStats(professional.id);
              
              return (
                <Grid item xs={12} md={6} lg={4} key={professional.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    layout
                  >
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'visible',
                      }}
                      onClick={() => handleViewDetails(professional)}
                    >
                      <CardContent>
                        {/* Status Badge */}
                        <Chip
                          label={professional.status}
                          size="small"
                          color={getStatusColor(professional.status)}
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            textTransform: 'capitalize',
                          }}
                        />

                        {/* Avatar e Informações Básicas */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              professional.foto ? null : (
                                <Avatar sx={{ bgcolor: '#9c27b0', width: 22, height: 22 }}>
                                  <PhotoCameraIcon sx={{ width: 14, height: 14 }} />
                                </Avatar>
                              )
                            }
                          >
                            <Avatar
                              sx={{
                                width: 80,
                                height: 80,
                                bgcolor: '#9c27b0',
                                fontSize: '2rem',
                                mr: 2,
                                border: '4px solid #f3e5f5',
                              }}
                              src={professional.foto}
                            >
                              {professional.nome?.charAt(0)}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {professional.nome}
                            </Typography>
                            <Chip
                              label={(professional.especialidades || [professional.especialidade]).filter(Boolean).join(', ')}
                              size="small"
                              sx={{
                                backgroundColor: '#f3e5f5',
                                color: '#9c27b0',
                                fontWeight: 500,
                                mb: 1,
                              }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating
                                value={stats.avaliacao}
                                precision={0.1}
                                readOnly
                                size="small"
                                emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
                              />
                              <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                                ({stats.avaliacao})
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Estatísticas Rápidas */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                              <Typography variant="caption" color="textSecondary">
                                Serviços
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {stats.servicosRealizados}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6}>
                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                              <Typography variant="caption" color="textSecondary">
                                Faturamento
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
                                {formatarFaturamento(stats.faturamento)}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>

                        {/* Contatos */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{professional.telefone}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">{professional.email}</Typography>
                          </Box>
                        </Box>

                        {/* Redes Sociais */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          {professional.redes?.instagram && (
                            <IconButton 
                              size="small" 
                              sx={{ color: '#E1306C' }}
                              href={`https://instagram.com/${professional.redes.instagram.replace('@', '')}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <InstagramIcon fontSize="small" />
                            </IconButton>
                          )}
                          {professional.redes?.facebook && (
                            <IconButton 
                              size="small" 
                              sx={{ color: '#4267B2' }}
                              href={`https://facebook.com/${professional.redes.facebook}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FacebookIcon fontSize="small" />
                            </IconButton>
                          )}
                          {professional.redes?.whatsapp && (
                            <IconButton 
                              size="small" 
                              sx={{ color: '#25D366' }}
                              href={`https://wa.me/${professional.redes.whatsapp}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <WhatsAppIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>

                        {professional.precoHora !== '' && professional.precoHora !== undefined && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                              Valor/hora: {formatarFaturamento(Number(professional.precoHora) || 0)}
                            </Typography>
                          </Box>
                        )}

                        {/* Horário */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="body2">{professional.horarioTrabalho}</Typography>
                        </Box>

                        {/* Ações */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(professional);
                            }}
                            sx={{ color: '#9c27b0' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {professional.status !== 'inativo' && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                inativarProfissional(professional);
                              }}
                              sx={{ color: '#ff9800' }}
                              title="Inativar profissional"
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(professional.id);
                            }}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>
      )}

      {/* Dialog de Detalhes do Profissional */}
      <Dialog 
        open={openDetailDialog} 
        onClose={() => setOpenDetailDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedProfessionalDetail && (
          <>
            <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 24, height: 24 }}>
                      <PhotoCameraIcon sx={{ width: 14, height: 14 }} />
                    </Avatar>
                  }
                >
                  <Avatar 
                    sx={{ bgcolor: '#9c27b0', width: 80, height: 80, fontSize: '2.5rem' }}
                    src={selectedProfessionalDetail.foto}
                  >
                    {selectedProfessionalDetail.nome?.charAt(0)}
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedProfessionalDetail.nome}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {(selectedProfessionalDetail.especialidades || [selectedProfessionalDetail.especialidade]).filter(Boolean).join(', ')}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              {(() => {
                const stats = getProfissionalStats(selectedProfessionalDetail.id);
                const performanceData = gerarPerformanceData(selectedProfessionalDetail.id);
                const distribuicaoData = gerarDistribuicaoServicos(selectedProfessionalDetail.id);
                
                return (
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    {/* Informações Pessoais */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Informações Pessoais
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Telefone:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {selectedProfessionalDetail.telefone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Email:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {selectedProfessionalDetail.email}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Data Contratação:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {new Date(selectedProfessionalDetail.dataContratacao).toLocaleDateString('pt-BR')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Status:</Typography>
                            <Chip
                              label={selectedProfessionalDetail.status}
                              size="small"
                              color={getStatusColor(selectedProfessionalDetail.status)}
                            />
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Informações Profissionais */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Informações Profissionais
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Comissão:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {selectedProfessionalDetail.comissao}%
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Valor/Hora:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#4caf50' }}>
                              {formatarFaturamento(Number(selectedProfessionalDetail.precoHora) || 0)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Serviços Realizados:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {stats.servicosRealizados}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Faturamento Total:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#4caf50' }}>
                              {formatarFaturamento(stats.faturamento)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Avaliação:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating
                                value={stats.avaliacao}
                                precision={0.1}
                                readOnly
                                size="small"
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                ({stats.avaliacao})
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Horário de Trabalho */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Horário de Trabalho
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ScheduleIcon color="action" />
                              <Typography variant="body1">
                                {selectedProfessionalDetail.horarioTrabalho}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {selectedProfessionalDetail.diasTrabalho?.map(dia => (
                                <Chip
                                  key={dia}
                                  label={dia}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {(selectedProfessionalDetail.historicoPrecos || []).length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HistoryIcon fontSize="small" /> Histórico de Preços
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          {(selectedProfessionalDetail.historicoPrecos || []).slice(-5).reverse().map((item, index) => (
                            <Box key={`${item.data}-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1, borderBottom: index === 4 ? 'none' : '1px solid #eee' }}>
                              <Typography variant="body2" color="textSecondary">
                                {new Date(item.data).toLocaleString('pt-BR')}
                              </Typography>
                              <Typography variant="body2">
                                {formatarFaturamento(Number(item.valorAnterior) || 0)} → {formatarFaturamento(Number(item.valorNovo) || 0)}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {item.motivo}
                              </Typography>
                            </Box>
                          ))}
                        </Paper>
                      </Grid>
                    )}

                    {/* Performance */}
                    {performanceData.some(item => item.atendimentos > 0) && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Performance nos Últimos 6 Meses
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={performanceData}>
                              <defs>
                                <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#9c27b0" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="mes" />
                              <YAxis yAxisId="left" />
                              <Tooltip />
                              <Area 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="atendimentos" 
                                stroke="#9c27b0" 
                                fillOpacity={1} 
                                fill="url(#colorAtendimentos)" 
                                name="Atendimentos"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>
                    )}

                    {/* Distribuição de Serviços */}
                    {distribuicaoData.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Distribuição de Serviços
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={distribuicaoData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={entry => `${entry.name}: ${entry.value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {distribuicaoData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                );
              })()}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setOpenDetailDialog(false)}>Fechar</Button>
              <Button 
                variant="contained"
                onClick={() => {
                  setOpenDetailDialog(false);
                  handleEdit(selectedProfessionalDetail);
                }}
                sx={{
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                }}
              >
                Editar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
          {selectedProfessional ? 'Editar Profissional' : 'Novo Profissional'}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Upload de Foto */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Foto do Profissional
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    badgeContent={
                      fotoPreview && (
                        <IconButton
                          size="small"
                          onClick={handleRemoverFoto}
                          sx={{
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                            width: 24,
                            height: 24,
                          }}
                        >
                          <CloseIcon sx={{ width: 14, height: 14 }} />
                        </IconButton>
                      )
                    }
                  >
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#9c27b0',
                        fontSize: '3rem',
                        border: '4px solid #f3e5f5',
                      }}
                      src={fotoPreview}
                    >
                      {formData.nome?.charAt(0) || '?'}
                    </Avatar>
                  </Badge>
                  
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="foto-upload"
                      type="file"
                      onChange={handleFotoChange}
                    />
                    <label htmlFor="foto-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCameraIcon />}
                        sx={{ mb: 1 }}
                      >
                        {fotoPreview ? 'Trocar Foto' : 'Adicionar Foto'}
                      </Button>
                    </label>
                    <Typography variant="caption" display="block" color="textSecondary">
                      Formatos: JPG, PNG. Máx: 5MB
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Especialidades</InputLabel>
                  <Select
                    multiple
                    value={formData.especialidades || []}
                    label="Especialidades"
                    onChange={(e) => setFormData({
                      ...formData,
                      especialidades: e.target.value,
                      especialidade: e.target.value[0] || ''
                    })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {selected.map((spec) => <Chip key={spec} label={spec} size="small" />)}
                      </Box>
                    )}
                  >
                    {specialties.map(spec => (
                      <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Contratação"
                  type="date"
                  value={formData.dataContratacao}
                  onChange={(e) => setFormData({ ...formData, dataContratacao: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Comissão (%)"
                  value={formData.comissao}
                  onChange={(e) => setFormData({ ...formData, comissao: e.target.value })}
                  type="number"
                  InputProps={{
                    endAdornment: <Typography>%</Typography>,
                    inputProps: { min: 0, max: 100 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valor/Hora"
                  value={formData.precoHora}
                  onChange={(e) => setFormData({ ...formData, precoHora: e.target.value })}
                  type="number"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="ativo">Ativo</MenuItem>
                    <MenuItem value="ferias">Férias</MenuItem>
                    <MenuItem value="inativo">Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário de Trabalho"
                  value={formData.horarioTrabalho}
                  onChange={(e) => setFormData({ ...formData, horarioTrabalho: e.target.value })}
                  placeholder="09:00 - 18:00"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Dias de Trabalho
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {diasSemana.map(dia => (
                    <Chip
                      key={dia}
                      label={dia}
                      onClick={() => handleDiaTrabalhoChange(dia)}
                      color={formData.diasTrabalho.includes(dia) ? 'primary' : 'default'}
                      variant={formData.diasTrabalho.includes(dia) ? 'filled' : 'outlined'}
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: formData.diasTrabalho.includes(dia) ? '#9c27b0' : 'transparent',
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Redes Sociais
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Instagram"
                  value={formData.redes.instagram}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    redes: { ...formData.redes, instagram: e.target.value }
                  })}
                  InputProps={{
                    startAdornment: <InstagramIcon sx={{ mr: 1, color: '#E1306C' }} />,
                  }}
                  placeholder="@usuario"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Facebook"
                  value={formData.redes.facebook}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    redes: { ...formData.redes, facebook: e.target.value }
                  })}
                  InputProps={{
                    startAdornment: <FacebookIcon sx={{ mr: 1, color: '#4267B2' }} />,
                  }}
                  placeholder="usuario"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="WhatsApp"
                  value={formData.redes.whatsapp}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    redes: { ...formData.redes, whatsapp: e.target.value }
                  })}
                  InputProps={{
                    startAdornment: <WhatsAppIcon sx={{ mr: 1, color: '#25D366' }} />,
                  }}
                  placeholder="5511999999999"
                />
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
              {selectedProfessional ? 'Atualizar' : 'Salvar'}
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
            Tem certeza que deseja remover este profissional?
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
            Remover
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

export default ModernProfissionais;
