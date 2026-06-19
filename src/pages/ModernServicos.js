// src/pages/ModernServicos.js (versão corrigida)
import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Tooltip,
  Fab,
  Zoom,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  FilterList as FilterIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import * as XLSX from 'xlsx';

const categories = ['Cabelo', 'Unhas', 'Barba', 'Maquiagem', 'Estética', 'Depilação', 'Massagem'];

function ModernServicos() {
  // Estados existentes
  const [loading, setLoading] = useState(true);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  
  // NOVOS ESTADOS
  const [viewMode, setViewMode] = useState('list'); // 'grid' ou 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos', 'ativo', 'inativo'
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  
  // Diálogos
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState('');
  const [openModeloDialog, setOpenModeloDialog] = useState(false);
  const [openCategoriaDialog, setOpenCategoriaDialog] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [categoriasCustomizadas, setCategoriasCustomizadas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('servicos.categoriasCustomizadas') || '[]');
    } catch (error) {
      return [];
    }
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: 60,
    preco: '',
    categoria: 'Cabelo',
    comissaoProfissional: 50,
    ativo: true,
    profissionaisIds: [] // 👈 IMPORTANTE: Array para associar profissionais
  });

  const categoriasDisponiveis = useMemo(() => Array.from(new Set([
    ...categories,
    ...categoriasCustomizadas,
    ...servicos.map((servico) => servico.categoria).filter(Boolean),
  ])).sort((a, b) => a.localeCompare(b, 'pt-BR')), [categoriasCustomizadas, servicos]);

  useEffect(() => {
    localStorage.setItem('servicos.categoriasCustomizadas', JSON.stringify(categoriasCustomizadas));
  }, [categoriasCustomizadas]);

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

  // FUNÇÕES DE FILTRAGEM
  const getServicosFiltrados = () => {
    return servicos.filter(servico => {
      // Filtro por busca
      const matchesSearch = searchTerm === '' || 
        servico.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servico.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servico.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por categoria
      const matchesCategory = filterCategory === 'todos' || servico.categoria === filterCategory;
      
      // Filtro por status
      const matchesStatus = 
        filterStatus === 'todos' ? true :
        filterStatus === 'ativo' ? servico.ativo === true :
        filterStatus === 'inativo' ? servico.ativo === false : true;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const servicosFiltrados = getServicosFiltrados();

  // Paginação
  const paginatedServicos = servicosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          categoria: selectedService.categoria || categoriasDisponiveis[0] || 'Cabelo',
          comissaoProfissional: selectedService.comissaoProfissional || 50,
          ativo: selectedService.ativo !== undefined ? selectedService.ativo : true,
          profissionaisIds: selectedService.profissionaisIds || [] // 👈 Carregar profissionais associados
        });
      } else {
        setFormData({
          nome: '',
          descricao: '',
          duracao: 60,
          preco: '',
          categoria: categoriasDisponiveis[0] || 'Cabelo',
          comissaoProfissional: 50,
          ativo: true,
          profissionaisIds: [] // 👈 Iniciar vazio
        });
      }
    }
  }, [openDialog, selectedService, categoriasDisponiveis]);

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

  const confirmDeleteAll = async () => {
    if (deleteAllConfirm !== 'EXCLUIR TODOS') {
      mostrarSnackbar('Digite EXCLUIR TODOS para confirmar a exclusão em massa.', 'error');
      return;
    }

    try {
      setLoading(true);
      const idsParaExcluir = servicos.map((servico) => servico.id).filter(Boolean);
      await Promise.all(idsParaExcluir.map((id) => firebaseService.delete('servicos', id)));
      setServicos([]);
      setOpenDeleteAllDialog(false);
      setDeleteAllConfirm('');
      mostrarSnackbar(`${idsParaExcluir.length} serviços excluídos com sucesso.`);
    } catch (error) {
      console.error('Erro ao excluir todos os serviços:', error);
      mostrarSnackbar('Erro ao excluir todos os serviços', 'error');
    } finally {
      setLoading(false);
    }
  };

  const salvarCategoria = () => {
    const categoria = novaCategoria.trim();
    if (!categoria) {
      mostrarSnackbar('Informe o nome da categoria.', 'error');
      return;
    }
    if (categoriasDisponiveis.some((item) => item.toLowerCase() === categoria.toLowerCase())) {
      mostrarSnackbar('Essa categoria já existe.', 'warning');
      return;
    }

    setCategoriasCustomizadas([...categoriasCustomizadas, categoria]);
    setFormData({ ...formData, categoria });
    setNovaCategoria('');
    setOpenCategoriaDialog(false);
    mostrarSnackbar('Categoria cadastrada com sucesso!');
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
        const servicoAtualizado = await firebaseService.update('servicos', selectedService.id, serviceData);
        setServicos(servicos.map(s => 
          s.id === selectedService.id ? { ...s, ...serviceData, ...servicoAtualizado, id: selectedService.id } : s
        ));
        mostrarSnackbar('Serviço atualizado com sucesso!');
      } else {
        const novoServico = await firebaseService.add('servicos', serviceData);
        setServicos([...servicos, { ...serviceData, ...novoServico, id: novoServico?.id || serviceData.id }]);
        mostrarSnackbar('Serviço adicionado com sucesso!');
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      mostrarSnackbar('Erro ao salvar serviço', 'error');
    }
  };

  const camposExportacao = [
    { key: 'id', label: 'ID' },
    { key: 'nome', label: 'Nome' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'duracao', label: 'Duração (min)' },
    { key: 'preco', label: 'Preço' },
    { key: 'comissaoProfissional', label: 'Comissão (%)' },
    { key: 'ativo', label: 'Ativo' },
    { key: 'profissionaisIds', label: 'Profissionais IDs' },
  ];

  const linhaModeloImportacao = {
    Nome: 'Corte Feminino',
    Descrição: 'Corte, lavagem e finalização',
    Categoria: 'Cabelo',
    'Duração (min)': 60,
    Preço: 120,
    'Comissão (%)': 50,
    Ativo: true,
    'Profissionais IDs': 'id_profissional_1;id_profissional_2',
  };

  const baixarModeloImportacao = (formato = 'xlsx') => {
    const nomeBase = `modelo_importacao_servicos`;

    if (formato === 'json') {
      baixarArquivo(JSON.stringify([linhaModeloImportacao], null, 2), `${nomeBase}.json`, 'application/json;charset=utf-8');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet([linhaModeloImportacao]);

    if (formato === 'csv') {
      baixarArquivo(XLSX.utils.sheet_to_csv(worksheet, { FS: ';' }), `${nomeBase}.csv`, 'text/csv;charset=utf-8');
      return;
    }

    if (formato === 'txt') {
      const cabecalho = Object.keys(linhaModeloImportacao).join('	');
      const valores = Object.values(linhaModeloImportacao).join('	');
      baixarArquivo(`${cabecalho}
${valores}`, `${nomeBase}.txt`, 'text/plain;charset=utf-8');
      return;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Serviços');
    XLSX.writeFile(workbook, `${nomeBase}.${formato === 'ods' ? 'ods' : 'xlsx'}`, { bookType: formato === 'ods' ? 'ods' : 'xlsx' });
  };

  const normalizarServico = (servico = {}) => ({
    id: servico.id || servico.ID || '',
    nome: servico.nome || servico.Nome || '',
    descricao: servico.descricao || servico.Descrição || servico.Descricao || '',
    categoria: servico.categoria || servico.Categoria || 'Cabelo',
    duracao: Number(servico.duracao || servico['Duração (min)'] || servico.Duracao || 60),
    preco: Number(String(servico.preco || servico['Preço'] || servico.Preco || 0).replace(',', '.')),
    comissaoProfissional: Number(servico.comissaoProfissional || servico['Comissão (%)'] || servico.Comissao || 50),
    ativo: typeof (servico.ativo ?? servico.Ativo) === 'boolean'
      ? (servico.ativo ?? servico.Ativo)
      : String(servico.ativo ?? servico.Ativo ?? 'true').toLowerCase() !== 'false',
    profissionaisIds: Array.isArray(servico.profissionaisIds)
      ? servico.profissionaisIds
      : String(servico.profissionaisIds || servico['Profissionais IDs'] || '')
        .split(/[;,]/)
        .map((id) => id.trim())
        .filter(Boolean),
  });

  const prepararLinhasExportacao = () => servicosFiltrados.map((servico) => ({
    ID: servico.id || '',
    Nome: servico.nome || '',
    Descrição: servico.descricao || '',
    Categoria: servico.categoria || '',
    'Duração (min)': servico.duracao || '',
    Preço: servico.preco || 0,
    'Comissão (%)': servico.comissaoProfissional ?? 50,
    Ativo: servico.ativo !== false,
    'Profissionais IDs': (servico.profissionaisIds || []).join(';'),
  }));

  const baixarArquivo = (conteudo, nomeArquivo, tipo) => {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarDados = (formato = 'json') => {
    try {
      const data = new Date().toISOString().split('T')[0];
      const linhas = prepararLinhasExportacao();

      if (formato === 'json') {
        baixarArquivo(JSON.stringify({ dataBackup: new Date().toISOString(), versao: '2.0', totalServicos: servicosFiltrados.length, dados: { servicos: servicosFiltrados } }, null, 2), `servicos_backup_${data}.json`, 'application/json;charset=utf-8');
      } else if (formato === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(linhas);
        const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });
        baixarArquivo(csv, `servicos_${data}.csv`, 'text/csv;charset=utf-8');
      } else if (formato === 'txt') {
        const texto = linhas.map((linha) => camposExportacao.map(({ label }) => `${label}: ${linha[label] ?? ''}`).join(' | ')).join('\n');
        baixarArquivo(texto, `servicos_${data}.txt`, 'text/plain;charset=utf-8');
      } else {
        const worksheet = XLSX.utils.json_to_sheet(linhas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Serviços');
        XLSX.writeFile(workbook, `servicos_${data}.${formato === 'ods' ? 'ods' : 'xlsx'}`, { bookType: formato === 'ods' ? 'ods' : 'xlsx' });
      }

      mostrarSnackbar(`Serviços exportados em ${formato.toUpperCase()} com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar dados', 'error');
    }
  };

  const importarArquivo = async (event) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    try {
      setLoading(true);
      const extensao = arquivo.name.split('.').pop()?.toLowerCase();
      const buffer = await arquivo.arrayBuffer();
      let registros = [];

      if (extensao === 'json') {
        const texto = new TextDecoder('utf-8').decode(buffer);
        const json = JSON.parse(texto);
        registros = json?.dados?.servicos || json?.servicos || (Array.isArray(json) ? json : []);
      } else {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        registros = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      }

      if (!Array.isArray(registros) || registros.length === 0) {
        mostrarSnackbar('Arquivo sem serviços para importar', 'warning');
        return;
      }

      let importados = 0;
      let atualizados = 0;
      const servicosAtualizados = [...servicos];

      for (const registro of registros) {
        const servico = normalizarServico(registro);
        if (!servico.nome || !servico.preco || !servico.duracao) continue;

        const payload = { ...servico, updatedAt: new Date().toISOString() };
        const existenteIndex = servicosAtualizados.findIndex((item) => item.id && item.id === servico.id);

        if (servico.id && existenteIndex >= 0) {
          await firebaseService.update('servicos', servico.id, payload);
          servicosAtualizados[existenteIndex] = { ...servicosAtualizados[existenteIndex], ...payload };
          atualizados += 1;
        } else {
          const { id, ...dadosNovoServico } = payload;
          const novoServico = await firebaseService.add('servicos', dadosNovoServico);
          servicosAtualizados.push({ ...dadosNovoServico, ...novoServico, id: novoServico?.id || id });
          importados += 1;
        }
      }

      setServicos(servicosAtualizados);
      mostrarSnackbar(`Importação concluída: ${importados} novos e ${atualizados} atualizados.`);
    } catch (error) {
      console.error('Erro ao importar serviços:', error);
      mostrarSnackbar('Erro ao importar serviços. Verifique o formato do arquivo.', 'error');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const limparFiltros = () => {
    setSearchTerm('');
    setFilterCategory('todos');
    setFilterStatus('todos');
    setPage(0);
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

  // 👇 FUNÇÃO PARA BUSCAR PROFISSIONAIS DO SERVIÇO
  const getProfissionaisDoServico = (servico) => {
    if (!servico.profissionaisIds || servico.profissionaisIds.length === 0) {
      return [];
    }
    
    return profissionais.filter(prof => 
      servico.profissionaisIds.includes(prof.id)
    );
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
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Serviços
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total: {servicosFiltrados.length} serviços
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".json,.csv,.xlsx,.xls,.ods,.txt"
            onChange={importarArquivo}
          />

          <Tooltip title="Importar serviços de JSON, CSV, Excel, ODS ou TXT">
            <Button
              variant="outlined"
              startIcon={<ImportIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
            >
              Importar
            </Button>
          </Tooltip>

          <Button
            variant="outlined"
            onClick={() => setOpenModeloDialog(true)}
            sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
          >
            Modelo
          </Button>

          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            onClick={() => setOpenCategoriaDialog(true)}
            sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
          >
            Categorias
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={servicos.length === 0}
            onClick={() => setOpenDeleteAllDialog(true)}
          >
            Excluir tudo
          </Button>

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Exportar</InputLabel>
            <Select
              value=""
              label="Exportar"
              displayEmpty
              startAdornment={<ExportIcon fontSize="small" sx={{ mr: 1, color: '#9c27b0' }} />}
              onChange={(e) => exportarDados(e.target.value)}
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
              <MenuItem value="ods">ODS</MenuItem>
              <MenuItem value="txt">TXT</MenuItem>
            </Select>
          </FormControl>
          
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
      </Box>

      {/* BARRA DE FILTROS */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filterCategory}
                label="Categoria"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="todos">Todas as categorias</MenuItem>
                {categoriasDisponiveis.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="ativo">Ativos</MenuItem>
                <MenuItem value="inativo">Inativos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newView) => newView && setViewMode(newView)}
                size="small"
              >
                <ToggleButton value="grid">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              
              {(searchTerm || filterCategory !== 'todos' || filterStatus !== 'todos') && (
                <Button
                  size="small"
                  startIcon={<FilterIcon />}
                  onClick={limparFiltros}
                >
                  Limpar filtros
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* CONTEÚDO PRINCIPAL */}
      {servicosFiltrados.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CategoryIcon sx={{ fontSize: 60, color: '#9c27b0', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Nenhum serviço encontrado
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {searchTerm || filterCategory !== 'todos' || filterStatus !== 'todos' 
              ? 'Tente ajustar os filtros' 
              : 'Clique no botão "Novo Serviço" para começar'}
          </Typography>
        </Card>
      ) : (
        <>
          {/* VISUALIZAÇÃO EM GRADE */}
          {viewMode === 'grid' && (
            <Grid container spacing={3}>
              <AnimatePresence>
                {paginatedServicos.map((service, index) => {
                  const profissionaisDoServico = getProfissionaisDoServico(service);

                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={service.id}>
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
                          bgcolor: service.ativo ? 'white' : '#f5f5f5',
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: '0 8px 25px rgba(156,39,176,0.15)'
                          }
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

                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1.1rem' }}>
                              {service.nome}
                            </Typography>

                            {service.descricao && (
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
                                {service.descricao.length > 60 
                                  ? `${service.descricao.substring(0, 60)}...` 
                                  : service.descricao}
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

                            {/* 👇 SEÇÃO DE PROFISSIONAIS ASSOCIADOS - RESTAURADA */}
                            {profissionaisDoServico.length > 0 ? (
                              <>
                                <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: '0.75rem' }}>
                                  Profissionais:
                                </Typography>
                                <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                                  {profissionaisDoServico.map(prof => (
                                    <Tooltip key={prof.id} title={prof.nome}>
                                      <Avatar 
                                        sx={{ width: 32, height: 32, bgcolor: '#9c27b0' }}
                                        src={prof.fotoUrl}
                                      >
                                        {prof.nome?.charAt(0) || <PersonIcon />}
                                      </Avatar>
                                    </Tooltip>
                                  ))}
                                </AvatarGroup>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                                  {profissionaisDoServico.slice(0, 3).map(prof => (
                                    <Chip
                                      key={prof.id}
                                      label={prof.nome.split(' ')[0]}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  ))}
                                  {profissionaisDoServico.length > 3 && (
                                    <Chip
                                      label={`+${profissionaisDoServico.length - 3}`}
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

          {/* VISUALIZAÇÃO EM LISTA */}
          {viewMode === 'list' && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#faf5ff' }}>
                  <TableRow>
                    <TableCell><strong>Nome</strong></TableCell>
                    <TableCell><strong>Categoria</strong></TableCell>
                    <TableCell><strong>Duração</strong></TableCell>
                    <TableCell><strong>Preço</strong></TableCell>
                    <TableCell><strong>Comissão</strong></TableCell>
                    <TableCell><strong>Profissionais</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedServicos.map((service) => {
                    const profissionaisDoServico = getProfissionaisDoServico(service);
                    
                    return (
                      <TableRow 
                        key={service.id}
                        sx={{ 
                          '&:hover': { bgcolor: '#faf5ff' },
                          opacity: service.ativo ? 1 : 0.7
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {service.nome}
                            </Typography>
                            {service.descricao && (
                              <Typography variant="caption" color="textSecondary">
                                {service.descricao.length > 50 
                                  ? `${service.descricao.substring(0, 50)}...` 
                                  : service.descricao}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={service.categoria}
                            size="small"
                            sx={{
                              backgroundColor: '#f3e5f5',
                              color: '#9c27b0',
                              fontSize: '0.75rem'
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatarDuracao(service.duracao)}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, color: '#9c27b0' }}>
                            {formatarPreco(service.preco)}
                          </Typography>
                        </TableCell>
                        <TableCell>{service.comissaoProfissional || 50}%</TableCell>
                        <TableCell>
                          {profissionaisDoServico.length > 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AvatarGroup 
                                max={3} 
                                sx={{ 
                                  '& .MuiAvatar-root': { 
                                    width: 28, 
                                    height: 28,
                                    fontSize: '0.8rem',
                                    bgcolor: '#9c27b0'
                                  } 
                                }}
                              >
                                {profissionaisDoServico.map(prof => (
                                  <Tooltip key={prof.id} title={prof.nome}>
                                    <Avatar src={prof.fotoUrl}>
                                      {prof.nome?.charAt(0) || <PersonIcon />}
                                    </Avatar>
                                  </Tooltip>
                                ))}
                              </AvatarGroup>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={service.ativo ? 'Ativo' : 'Inativo'}
                            size="small"
                            color={service.ativo ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(service)}
                            sx={{ color: '#9c27b0', mr: 1 }}
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* PAGINAÇÃO */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <TablePagination
              component="div"
              count={servicosFiltrados.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[6, 12, 24, 48]}
              labelRowsPerPage="Itens por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Box>
        </>
      )}

      {/* FLOATING ACTION BUTTON */}
      <Zoom in={true} unmountOnExit>
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAdd}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>

      {/* Dialog de Serviço - ATUALIZADO COM SELEÇÃO DE PROFISSIONAIS */}
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
                    {categoriasDisponiveis.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCategoriaDialog(true)}
                  sx={{ mt: 1, color: '#9c27b0' }}
                >
                  Nova categoria
                </Button>
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

              {/* 👇 NOVO CAMPO PARA ASSOCIAR PROFISSIONAIS */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Profissionais</InputLabel>
                  <Select
                    multiple
                    value={formData.profissionaisIds || []}
                    label="Profissionais"
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      profissionaisIds: e.target.value 
                    })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => {
                          const prof = profissionais.find(p => p.id === id);
                          return (
                            <Chip 
                              key={id} 
                              label={prof?.nome || id} 
                              size="small"
                              sx={{ bgcolor: '#f3e5f5' }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {profissionais
                      .filter(prof => prof.ativo !== false)
                      .map(prof => (
                        <MenuItem key={prof.id} value={prof.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              sx={{ width: 24, height: 24, bgcolor: '#9c27b0' }}
                              src={prof.fotoUrl}
                            >
                              {prof.nome?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">{prof.nome}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {prof.especialidade || 'Profissional'}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="textSecondary">
                  Selecione os profissionais que realizam este serviço
                </Typography>
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

      {/* Dialog com modelo de importação */}
      <Dialog open={openModeloDialog} onClose={() => setOpenModeloDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
          Modelo para Importar Serviços
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Use uma linha por serviço. Os campos obrigatórios são Nome, Duração (min) e Preço. Para vincular profissionais, informe os IDs separados por ponto e vírgula.
          </Alert>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {Object.keys(linhaModeloImportacao).map((coluna) => (
                    <TableCell key={coluna}><strong>{coluna}</strong></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {Object.values(linhaModeloImportacao).map((valor, index) => (
                    <TableCell key={index}>{String(valor)}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Também é possível importar JSON no formato de lista de objetos ou no formato de backup com dados.servicos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => baixarModeloImportacao('json')}>Baixar JSON</Button>
          <Button onClick={() => baixarModeloImportacao('csv')}>Baixar CSV</Button>
          <Button onClick={() => baixarModeloImportacao('xlsx')}>Baixar Excel</Button>
          <Button onClick={() => baixarModeloImportacao('ods')}>Baixar ODS</Button>
          <Button onClick={() => baixarModeloImportacao('txt')}>Baixar TXT</Button>
          <Button variant="contained" onClick={() => setOpenModeloDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de cadastro de categorias */}
      <Dialog open={openCategoriaDialog} onClose={() => setOpenCategoriaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#faf5ff' }}>
          Cadastrar Categoria
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nova categoria"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            placeholder="Ex: Sobrancelhas"
          />
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Categorias disponíveis:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categoriasDisponiveis.map((categoria) => (
              <Chip key={categoria} label={categoria} size="small" />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCategoriaDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarCategoria}>Salvar Categoria</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de exclusão em massa */}
      <Dialog open={openDeleteAllDialog} onClose={() => setOpenDeleteAllDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ffebee', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" /> Excluir todos os serviços
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            Esta ação exclui todos os {servicos.length} serviços cadastrados e não poderá ser desfeita.
          </Alert>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Para confirmar, digite exatamente <strong>EXCLUIR TODOS</strong> no campo abaixo.
          </Typography>
          <TextField
            fullWidth
            value={deleteAllConfirm}
            onChange={(e) => setDeleteAllConfirm(e.target.value)}
            placeholder="EXCLUIR TODOS"
            error={deleteAllConfirm.length > 0 && deleteAllConfirm !== 'EXCLUIR TODOS'}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setOpenDeleteAllDialog(false); setDeleteAllConfirm(''); }}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteAllConfirm !== 'EXCLUIR TODOS'}
            onClick={confirmDeleteAll}
          >
            Excluir definitivamente
          </Button>
        </DialogActions>
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
