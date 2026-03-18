// src/pages/Anamnese/ModelosAnamnese.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Badge,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  ContentCut as CutIcon,
  Spa as SpaIcon,
  Face as FaceIcon,
  Brush as BrushIcon,
  WaterDrop as WaterDropIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';

// Categorias de modelos
const categoriasModelos = [
  { value: 'cabelo', label: 'Cabelo', icon: <CutIcon />, cor: '#9c27b0' },
  { value: 'pele', label: 'Pele', icon: <FaceIcon />, cor: '#ff9800' },
  { value: 'unhas', label: 'Unhas', icon: <BrushIcon />, cor: '#ff4081' },
  { value: 'maquiagem', label: 'Maquiagem', icon: <SpaIcon />, cor: '#e91e63' },
  { value: 'barba', label: 'Barba', icon: <CutIcon />, cor: '#795548' },
  { value: 'depilacao', label: 'Depilação', icon: <WaterDropIcon />, cor: '#00bcd4' },
  { value: 'massagem', label: 'Massagem', icon: <FavoriteIcon />, cor: '#4caf50' },
  { value: 'geral', label: 'Geral', icon: <AssignmentIcon />, cor: '#607d8b' },
];

// Modelos pré-definidos
const modelosPredefinidos = [
  {
    id: 'modelo-capilar-1',
    titulo: 'Anamnese Capilar Básica',
    descricao: 'Avaliação inicial para serviços capilares',
    categoria: 'cabelo',
    usos: 245,
    questoes: [
      {
        id: 'q1',
        tipo: 'radio',
        pergunta: 'Qual seu tipo de cabelo?',
        obrigatoria: true,
        opcoes: ['Liso', 'Ondulado', 'Cacheado', 'Crespo']
      },
      {
        id: 'q2',
        tipo: 'select',
        pergunta: 'Já realizou algum tratamento químico?',
        obrigatoria: true,
        opcoes: ['Sim', 'Não']
      },
      {
        id: 'q3',
        tipo: 'textarea',
        pergunta: 'Descreva seu histórico capilar',
        descricao: 'Procedimentos anteriores, alergias, etc.',
        obrigatoria: false
      },
      {
        id: 'q4',
        tipo: 'checkbox',
        pergunta: 'Quais produtos você usa regularmente?',
        opcoes: ['Shampoo', 'Condicionador', 'Máscara', 'Leave-in', 'Óleo', 'Finalizador']
      }
    ]
  },
  {
    id: 'modelo-pele-1',
    titulo: 'Avaliação de Pele Completa',
    descricao: 'Anamnese detalhada para tratamentos faciais',
    categoria: 'pele',
    usos: 189,
    questoes: [
      {
        id: 'q1',
        tipo: 'radio',
        pergunta: 'Qual seu tipo de pele?',
        opcoes: ['Normal', 'Seca', 'Oleosa', 'Mista', 'Sensível']
      },
      {
        id: 'q2',
        tipo: 'checkbox',
        pergunta: 'Quais preocupações você tem com sua pele?',
        opcoes: ['Acne', 'Manchas', 'Rugas', 'Flacidez', 'Oleosidade', 'Ressecamento']
      },
      {
        id: 'q3',
        tipo: 'radio',
        pergunta: 'Você tem alergia a algum produto?',
        opcoes: ['Sim', 'Não']
      },
      {
        id: 'q4',
        tipo: 'texto',
        pergunta: 'Quais produtos você usa atualmente?',
        placeholder: 'Liste os produtos que você usa'
      }
    ]
  },
  {
    id: 'modelo-unhas-1',
    titulo: 'Avaliação de Unhas',
    descricao: 'Pré-avaliação para manicure e pedicure',
    categoria: 'unhas',
    usos: 156,
    questoes: [
      {
        id: 'q1',
        tipo: 'radio',
        pergunta: 'Tipo de serviço desejado?',
        opcoes: ['Manicure', 'Pedicure', 'Ambos']
      },
      {
        id: 'q2',
        tipo: 'checkbox',
        pergunta: 'Possui algum problema nas unhas?',
        opcoes: ['Fungos', 'Unhas encravadas', 'Micose', 'Fragilidade', 'Manchas']
      },
      {
        id: 'q3',
        tipo: 'radio',
        pergunta: 'Faz uso de esmalte regularmente?',
        opcoes: ['Sim', 'Não']
      }
    ]
  },
  {
    id: 'modelo-alergia-1',
    titulo: 'Ficha de Alergias',
    descricao: 'Levantamento de alergias para procedimentos',
    categoria: 'geral',
    usos: 312,
    questoes: [
      {
        id: 'q1',
        tipo: 'checkbox',
        pergunta: 'Você tem alergia a algum destes produtos?',
        opcoes: ['Químicos', 'Esmaltes', 'Perfumes', 'Corantes', 'Látex']
      },
      {
        id: 'q2',
        tipo: 'textarea',
        pergunta: 'Descreva suas alergias conhecidas',
        descricao: 'Informe quais produtos ou substâncias causam reações'
      },
      {
        id: 'q3',
        tipo: 'radio',
        pergunta: 'Já teve alguma reação alérgica em salão?',
        opcoes: ['Sim', 'Não']
      }
    ]
  },
  {
    id: 'modelo-gestante-1',
    titulo: 'Atendimento Gestante',
    descricao: 'Avaliação para clientes gestantes',
    categoria: 'geral',
    usos: 78,
    questoes: [
      {
        id: 'q1',
        tipo: 'radio',
        pergunta: 'Você está grávida?',
        opcoes: ['Sim', 'Não']
      },
      {
        id: 'q2',
        tipo: 'texto',
        pergunta: 'Quantos meses de gestação?'
      },
      {
        id: 'q3',
        tipo: 'radio',
        pergunta: 'Já realizou procedimentos estéticos durante a gestação?',
        opcoes: ['Sim', 'Não']
      },
      {
        id: 'q4',
        tipo: 'checkbox',
        pergunta: 'Possui alguma restrição médica?',
        opcoes: ['Pressão alta', 'Diabetes gestacional', 'Pré-eclâmpsia', 'Outras']
      }
    ]
  },
  {
    id: 'modelo-pos-operatorio',
    titulo: 'Pós-operatório',
    descricao: 'Acompanhamento para procedimentos pós-operatórios',
    categoria: 'geral',
    usos: 45,
    questoes: [
      {
        id: 'q1',
        tipo: 'texto',
        pergunta: 'Data da cirurgia?',
        tipo: 'data'
      },
      {
        id: 'q2',
        tipo: 'textarea',
        pergunta: 'Tipo de procedimento realizado'
      },
      {
        id: 'q3',
        tipo: 'textarea',
        pergunta: 'Restrições médicas atuais'
      },
      {
        id: 'q4',
        tipo: 'radio',
        pergunta: 'Está em uso de medicamentos?',
        opcoes: ['Sim', 'Não']
      }
    ]
  }
];

function ModelosAnamnese() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modelos, setModelos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  const [busca, setBusca] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    carregarModelos();
  }, []);

  const carregarModelos = async () => {
    try {
      setLoading(true);
      // Buscar modelos do Firebase (se houver)
      const modelosData = await firebaseService.getAll('modelos_anamnese').catch(() => []);
      
      // Combinar com modelos pré-definidos
      const todosModelos = [...modelosPredefinidos, ...(modelosData || [])];
      setModelos(todosModelos);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      toast.error('Erro ao carregar modelos');
    } finally {
      setLoading(false);
    }
  };

  const handleUsarModelo = (modelo) => {
    navigate('/anamnese/formularios', {
      state: { modelo }
    });
  };

  const handleSalvarComoNovo = async (modelo) => {
    try {
      const novoModelo = {
        ...modelo,
        id: undefined,
        usos: 0,
        criadoEm: new Date().toISOString()
      };
      
      await firebaseService.add('modelos_anamnese', novoModelo);
      mostrarSnackbar('Modelo salvo com sucesso!');
      carregarModelos();
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      mostrarSnackbar('Erro ao salvar modelo', 'error');
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const modelosFiltrados = modelos.filter(modelo => {
    const matchCategoria = categoriaSelecionada === 'todos' || modelo.categoria === categoriaSelecionada;
    const matchBusca = busca === '' || 
      modelo.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
      modelo.descricao?.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  const getCategoriaInfo = (categoria) => {
    return categoriasModelos.find(c => c.value === categoria) || categoriasModelos[7];
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
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Modelos de Anamnese
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Modelos prontos para criar seus formulários rapidamente
          </Typography>
        </Box>
      </Box>

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {modelos.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total de Modelos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {categoriasModelos.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Categorias
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {modelos.reduce((acc, m) => acc + (m.usos || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Usos Totais
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar modelos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={categoriaSelecionada}
                  label="Categoria"
                  onChange={(e) => setCategoriaSelecionada(e.target.value)}
                >
                  <MenuItem value="todos">Todas as categorias</MenuItem>
                  {categoriasModelos.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: cat.cor }}>{cat.icon}</Box>
                        {cat.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Modelos */}
      <Grid container spacing={3}>
        {modelosFiltrados.map((modelo, index) => {
          const categoria = getCategoriaInfo(modelo.categoria);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={modelo.id || index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    boxShadow: 6,
                  }
                }}>
                  {/* Badge de popularidade */}
                  {modelo.usos > 200 && (
                    <Badge
                      badgeContent="🔥 Popular"
                      color="error"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                      }}
                    />
                  )}

                  <CardContent sx={{ flex: 1 }}>
                    {/* Cabeçalho com ícone da categoria */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: categoria.cor, width: 48, height: 48 }}>
                        {categoria.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {modelo.titulo}
                        </Typography>
                        <Chip
                          label={categoria.label}
                          size="small"
                          sx={{ bgcolor: `${categoria.cor}20`, color: categoria.cor }}
                        />
                      </Box>
                    </Box>

                    {/* Descrição */}
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {modelo.descricao}
                    </Typography>

                    {/* Questões */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">
                          {modelo.questoes.length} questão(ões)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {modelo.questoes.map((q, i) => (
                            <ListItem key={i}>
                              <ListItemIcon>
                                {q.tipo === 'texto' && '📝'}
                                {q.tipo === 'textarea' && '📄'}
                                {q.tipo === 'radio' && '⚪'}
                                {q.tipo === 'checkbox' && '✅'}
                                {q.tipo === 'select' && '📋'}
                                {q.tipo === 'data' && '📅'}
                                {q.tipo === 'hora' && '⏰'}
                                {q.tipo === 'arquivo' && '📎'}
                              </ListItemIcon>
                              <ListItemText
                                primary={q.pergunta}
                                secondary={q.obrigatoria ? 'Obrigatória' : 'Opcional'}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    {/* Estatísticas de uso */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        Usado {modelo.usos || 0} vezes
                      </Typography>
                      <Box>
                        <Tooltip title="Usar este modelo">
                          <IconButton
                            size="small"
                            onClick={() => handleUsarModelo(modelo)}
                            sx={{ color: '#9c27b0' }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Salvar como novo modelo">
                          <IconButton
                            size="small"
                            onClick={() => handleSalvarComoNovo(modelo)}
                            sx={{ color: '#4caf50' }}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Prévia">
                          <IconButton
                            size="small"
                            sx={{ color: '#2196f3' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}

        {modelosFiltrados.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhum modelo encontrado
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ModelosAnamnese;
