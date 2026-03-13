// src/pages/MinhasComissoes.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Snackbar,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Checkbox,
} from '@mui/material';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { useReactToPrint } from 'react-to-print';

// Importações para PDF e Excel
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Ícones
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PercentIcon from '@mui/icons-material/Percent';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import WarningIcon from '@mui/icons-material/Warning';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import StorefrontIcon from '@mui/icons-material/Storefront';

// Componente para impressão
const RelatorioComissoes = React.forwardRef(({ 
  dados, 
  profissional, 
  periodo, 
  filtros,
  configuracoes,
  tipo = 'completo' 
}, ref) => {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <Box ref={ref} sx={{ p: 4, fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Cabeçalho com Logo */}
      <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #9c27b0', pb: 2 }}>
        {configuracoes?.salao?.logo ? (
          <Box sx={{ mb: 2 }}>
            <img 
              src={configuracoes.salao.logo} 
              alt={configuracoes.salao.nomeFantasia || 'Logo do Salão'}
              style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain' }}
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <StorefrontIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
              {configuracoes?.salao?.nomeFantasia || 'Salão de Beleza'}
            </Typography>
          </Box>
        )}
        
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
          Relatório de Comissões
        </Typography>
        
        <Typography variant="h5" sx={{ mt: 1, color: '#555' }}>
          {profissional?.nome || 'Todos os Profissionais'}
        </Typography>
        
        <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
          Período: {periodo}
        </Typography>
        
        <Typography variant="subtitle2" color="textSecondary">
          Emitido em: {new Date().toLocaleString('pt-BR')}
        </Typography>
        
        {configuracoes?.salao?.cnpj && (
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
            CNPJ: {configuracoes.salao.cnpj}
          </Typography>
        )}
      </Box>

      {/* Informações do Profissional (quando selecionado) */}
      {profissional?.id && profissional.id !== 'todos' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#333', borderBottom: '1px solid #ccc', pb: 1 }}>
            Informações do Profissional
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body2" color="textSecondary">Nome</Typography>
                <Typography variant="body1">{profissional.nome}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body2" color="textSecondary">Período</Typography>
                <Typography variant="body1">{periodo}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Resumo */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#333', borderBottom: '1px solid #ccc', pb: 1 }}>
          Resumo do Período
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">Total de Comissões</Typography>
              <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {formatarMoeda(dados.resumo.totalPeriodo)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">A Receber</Typography>
              <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {formatarMoeda(dados.resumo.aReceber)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">Recebido</Typography>
              <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {formatarMoeda(dados.resumo.recebido)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Estatísticas Adicionais */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#333', borderBottom: '1px solid #ccc', pb: 1 }}>
          Estatísticas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Total de Comissões</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {dados.resumo.quantidade}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Comissões Pagas</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {dados.resumo.quantidadePaga}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Comissões Pendentes</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {dados.resumo.quantidadePendente}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Total de Atendimentos</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {dados.atendimentos.length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Atendimentos */}
      {tipo !== 'apenas_comissoes' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#333', borderBottom: '1px solid #ccc', pb: 1 }}>
            Atendimentos no Período
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell><strong>Serviços</strong></TableCell>
                  <TableCell align="right"><strong>Valor</strong></TableCell>
                  <TableCell align="right"><strong>Comissão</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.atendimentos.map((atendimento, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatarData(atendimento.data)}</TableCell>
                    <TableCell>{atendimento.cliente?.nome || '—'}</TableCell>
                    <TableCell>
                      {atendimento.servicos?.map(s => s.nome).join(', ')}
                    </TableCell>
                    <TableCell align="right">{formatarMoeda(atendimento.valorTotal)}</TableCell>
                    <TableCell align="right">
                      <strong>{formatarMoeda(atendimento.comissaoTotal)}</strong>
                    </TableCell>
                    <TableCell>
                      {atendimento.comissaoPaga ? 'Pago' : 'Pendente'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Comissões Detalhadas */}
      {tipo !== 'apenas_atendimentos' && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#333', borderBottom: '1px solid #ccc', pb: 1 }}>
            Detalhamento das Comissões
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Serviço</strong></TableCell>
                  <TableCell align="right"><strong>%</strong></TableCell>
                  <TableCell align="right"><strong>Valor Base</strong></TableCell>
                  <TableCell align="right"><strong>Comissão</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Pagamento</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.comissoes.map((comissao, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatarData(comissao.data)}</TableCell>
                    <TableCell>{comissao.servicoNome}</TableCell>
                    <TableCell align="right">{comissao.percentual}%</TableCell>
                    <TableCell align="right">{formatarMoeda(comissao.valorAtendimento)}</TableCell>
                    <TableCell align="right">
                      <strong>{formatarMoeda(comissao.valor)}</strong>
                    </TableCell>
                    <TableCell>
                      {comissao.status}
                    </TableCell>
                    <TableCell>
                      {comissao.dataPagamento ? formatarData(comissao.dataPagamento) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Resumo por Serviço */}
      {tipo !== 'apenas_atendimentos' && dados.resumo?.porServico && dados.resumo.porServico.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#333', borderBottom: '1px solid #ccc', pb: 1 }}>
            Resumo por Serviço
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                  <TableCell><strong>Serviço</strong></TableCell>
                  <TableCell align="right"><strong>Quantidade</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>% do Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.resumo.porServico.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell align="right">{item.quantidade}</TableCell>
                    <TableCell align="right">{formatarMoeda(item.valor)}</TableCell>
                    <TableCell align="right">
                      {((item.valor / dados.resumo.totalPeriodo) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Rodapé */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary', borderTop: '1px solid #ccc', pt: 2 }}>
        <Typography variant="caption">
          Relatório gerado automaticamente pelo sistema • Documento não fiscal
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Filtros aplicados: {filtros.status !== 'todos' ? `Status: ${filtros.status} • ` : ''}
          Período: {periodo}
        </Typography>
        {configuracoes?.salao?.contato && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {configuracoes.salao.contato.telefone && `Tel: ${configuracoes.salao.contato.telefone} • `}
            {configuracoes.salao.contato.email && `Email: ${configuracoes.salao.contato.email}`}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

function MinhasComissoes() {
  const [loading, setLoading] = useState(true);
  const [comissoes, setComissoes] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [profissional, setProfissional] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Filtros
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroProfissional, setFiltroProfissional] = useState('todos');
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);
  const [openRelatorioDialog, setOpenRelatorioDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    tipo: 'completo',
    incluirResumo: true,
    incluirAtendimentos: true,
    incluirComissoes: true,
    incluirServicos: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Refs para impressão
  const relatorioRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: relatorioRef,
    documentTitle: `Relatorio_Comissoes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '_')}`,
    onBeforePrint: () => {
      mostrarSnackbar('Preparando impressão...', 'info');
    },
    onAfterPrint: () => {
      mostrarSnackbar('Impressão concluída!', 'success');
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      mostrarSnackbar('Erro ao imprimir', 'error');
    },
  });

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = [2024, 2025, 2026, 2027];

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (profissional) {
      carregarComissoes();
      carregarAtendimentos();
    }
  }, [profissional, filtroMes, filtroAno, filtroStatus, filtroProfissional]);

  // Recalcular resumo quando comissões mudarem
  useEffect(() => {
    if (comissoes.length > 0) {
      calcularResumo();
      calcularEstatisticas();
    }
  }, [comissoes]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar configurações do salão
      const configuracoesData = await firebaseService.getAll('configuracoes');
      const configuracoesArray = Array.isArray(configuracoesData) ? configuracoesData : [];
      if (configuracoesArray.length > 0) {
        setConfiguracoes(configuracoesArray[0]);
        console.log('Configurações carregadas:', configuracoesArray[0]);
      }
      
      // Buscar dados do usuário atual do localStorage
      let usuarioLogado = null;
      let profissionalId = null;
      let profissionalNome = '';
      let usuarioTipo = 'profissional';
      
      try {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
          usuarioLogado = JSON.parse(usuarioStr);
          console.log('Usuário logado:', usuarioLogado);
          
          // Verificar se é admin pelo cargo
          usuarioTipo = usuarioLogado?.cargo || 'profissional';
          
          // Se for admin, pode ter profissionalId ou não
          if (usuarioTipo === 'admin') {
            profissionalId = usuarioLogado?.profissionalId || null;
            profissionalNome = usuarioLogado?.nome || 'Administrador';
          } else {
            // Se for profissional, usa o profissionalId
            profissionalId = usuarioLogado?.profissionalId;
            profissionalNome = usuarioLogado?.nome;
          }
        }
      } catch (e) {
        console.warn('Erro ao parsear usuário:', e);
      }

      // Verificar se é admin
      const isAdminUser = usuarioTipo === 'admin';
      setIsAdmin(isAdminUser);

      // Carregar todos os profissionais
      const profissionaisData = await firebaseService.getAll('profissionais');
      const profissionaisArray = Array.isArray(profissionaisData) ? profissionaisData : [];
      console.log('Profissionais carregados:', profissionaisArray);
      setProfissionais(profissionaisArray);

      // Se não for admin e não tiver profissionalId, usar um padrão
      if (!isAdminUser && !profissionalId) {
        // Buscar o primeiro profissional da lista como fallback
        if (profissionaisArray.length > 0) {
          profissionalId = profissionaisArray[0].id;
          profissionalNome = profissionaisArray[0].nome;
        }
      }

      setProfissional({
        id: profissionalId,
        nome: profissionalNome,
        tipo: usuarioTipo
      });

      console.log('Profissional configurado:', { id: profissionalId, nome: profissionalNome, tipo: usuarioTipo });

      // Carregar clientes
      const clientesData = await firebaseService.getAll('clientes');
      const clientesArray = Array.isArray(clientesData) ? clientesData : [];
      console.log('Clientes carregados:', clientesArray);
      setClientes(clientesArray);

      // Carregar comissões
      await carregarComissoes(isAdminUser ? null : profissionalId);
      
      // Carregar atendimentos
      await carregarAtendimentos(isAdminUser ? null : profissionalId);

      console.log('✅ Dados carregados do Firebase');

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarComissoes = async (profissionalId) => {
    try {
      const comissoesData = await firebaseService.getAll('comissoes');
      
      // Garantir que é array
      const comissoesArray = Array.isArray(comissoesData) ? comissoesData : [];
      
      console.log('Todas as comissões:', comissoesArray);
      
      // Filtrar comissões
      let comissoesFiltradas = comissoesArray;
      
      // Se não for admin, filtrar por profissional
      if (profissionalId) {
        comissoesFiltradas = comissoesArray.filter(c => 
          c && c.profissionalId === profissionalId
        );
      } 
      // Se for admin e tiver filtro de profissional selecionado
      else if (isAdmin && filtroProfissional !== 'todos') {
        comissoesFiltradas = comissoesArray.filter(c => 
          c && c.profissionalId === filtroProfissional
        );
      }

      console.log('Comissões filtradas:', comissoesFiltradas);

      // Filtrar por mês/ano
      if (filtroMes && filtroAno) {
        comissoesFiltradas = comissoesFiltradas.filter(c => {
          if (!c) return false;
          // Usar a data da comissão (pode ser dataRegistro, createdAt ou data)
          const dataStr = c.dataRegistro || c.createdAt || c.data;
          if (!dataStr) return false;
          const data = new Date(dataStr);
          return data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno;
        });
      }

      // Filtrar por status
      if (filtroStatus !== 'todos') {
        comissoesFiltradas = comissoesFiltradas.filter(c => c && c.status === filtroStatus);
      }

      // Ordenar por data (mais recentes primeiro)
      comissoesFiltradas.sort((a, b) => {
        const dataA = new Date(a?.dataRegistro || a?.createdAt || a?.data || 0);
        const dataB = new Date(b?.dataRegistro || b?.createdAt || b?.data || 0);
        return dataB - dataA;
      });

      // Formatar dados
      comissoesFiltradas = comissoesFiltradas.map(c => ({
        ...c,
        id: c.id,
        data: c.dataRegistro || c.createdAt || c.data,
        dataFormatada: formatarData(c.dataRegistro || c.createdAt || c.data),
        valor: Number(c.valor) || 0,
        valorAtendimento: Number(c.valorAtendimento) || 0,
        percentual: Number(c.percentual) || 0,
        servicoNome: c.servicoNome || 'Serviço',
        status: c.status || 'pendente'
      }));

      console.log('Comissões processadas:', comissoesFiltradas);
      setComissoes(comissoesFiltradas);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
      setComissoes([]);
    }
  };

  const carregarAtendimentos = async (profissionalId) => {
    try {
      const atendimentosData = await firebaseService.getAll('atendimentos');
      
      // Garantir que é array
      const atendimentosArray = Array.isArray(atendimentosData) ? atendimentosData : [];
      
      console.log('Todos os atendimentos:', atendimentosArray);
      
      // Filtrar atendimentos finalizados
      let atendimentosFiltrados = atendimentosArray.filter(a => a && a.status === 'finalizado');
      
      // Se não for admin, filtrar por profissional
      if (profissionalId) {
        atendimentosFiltrados = atendimentosFiltrados.filter(a => {
          // Verificar se o profissional participou do atendimento
          const temProfissional = a.itensServico?.some(
            item => item && item.profissionalId === profissionalId
          ) || a.servicos?.some(
            s => s && s.profissionalId === profissionalId
          );
          return temProfissional;
        });
      } 
      // Se for admin e tiver filtro de profissional selecionado
      else if (isAdmin && filtroProfissional !== 'todos') {
        atendimentosFiltrados = atendimentosFiltrados.filter(a => {
          const temProfissional = a.itensServico?.some(
            item => item && item.profissionalId === filtroProfissional
          ) || a.servicos?.some(
            s => s && s.profissionalId === filtroProfissional
          );
          return temProfissional;
        });
      }

      console.log('Atendimentos filtrados:', atendimentosFiltrados);

      // Filtrar por mês/ano
      if (filtroMes && filtroAno) {
        atendimentosFiltrados = atendimentosFiltrados.filter(a => {
          if (!a || !a.data) return false;
          const data = new Date(a.data);
          return data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno;
        });
      }

      // Enriquecer atendimentos com dados do cliente e comissões
      const atendimentosProcessados = atendimentosFiltrados.map(atendimento => {
        // Buscar cliente
        const cliente = clientes.find(c => c && c.id === atendimento.clienteId);
        
        // Buscar todas as comissões deste atendimento
        const comissoesDoAtendimento = comissoes.filter(c => 
          c && c.atendimentoId === atendimento.id
        );
        
        // Se for profissional específico, filtrar as comissões dele
        const comissoesDoProfissional = profissionalId 
          ? comissoesDoAtendimento.filter(c => c.profissionalId === profissionalId)
          : comissoesDoAtendimento;
        
        // Calcular comissão total
        const comissaoTotal = comissoesDoProfissional.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
        
        // Verificar se todas as comissões estão pagas
        const todasPagas = comissoesDoProfissional.length > 0 && 
                          comissoesDoProfissional.every(c => c.status === 'pago');
        
        return {
          ...atendimento,
          cliente: cliente || { nome: 'Cliente não encontrado' },
          valorTotal: Number(atendimento.valorTotal) || 0,
          comissaoTotal: comissaoTotal,
          comissaoPaga: todasPagas,
          comissoes: comissoesDoProfissional
        };
      });

      // Ordenar por data (mais recentes primeiro)
      atendimentosProcessados.sort((a, b) => new Date(b.data) - new Date(a.data));

      console.log('Atendimentos processados:', atendimentosProcessados);
      setAtendimentos(atendimentosProcessados);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
      setAtendimentos([]);
    }
  };

  const calcularResumo = () => {
    try {
      // Calcular totais do período
      const totalPeriodo = comissoes
        .filter(c => c && c.status !== 'cancelado')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      
      const aReceber = comissoes
        .filter(c => c && c.status === 'pendente')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      
      const recebido = comissoes
        .filter(c => c && c.status === 'pago')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      
      const cancelado = comissoes
        .filter(c => c && c.status === 'cancelado')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

      // Agrupar por serviço
      const porServico = {};
      comissoes.forEach(c => {
        if (c && c.status !== 'cancelado' && c.servicoNome) {
          const nome = c.servicoNome;
          if (!porServico[nome]) {
            porServico[nome] = {
              nome,
              quantidade: 0,
              valor: 0
            };
          }
          porServico[nome].quantidade++;
          porServico[nome].valor += Number(c.valor) || 0;
        }
      });

      const porServicoArray = Object.values(porServico)
        .sort((a, b) => b.valor - a.valor);

      setResumo({
        totalPeriodo,
        aReceber,
        recebido,
        cancelado,
        porServico: porServicoArray,
        quantidade: comissoes.length,
        quantidadePendente: comissoes.filter(c => c && c.status === 'pendente').length,
        quantidadePaga: comissoes.filter(c => c && c.status === 'pago').length,
        quantidadeCancelada: comissoes.filter(c => c && c.status === 'cancelado').length,
      });

      console.log('Resumo calculado:', {
        totalPeriodo,
        aReceber,
        recebido,
        quantidade: comissoes.length
      });
    } catch (error) {
      console.error('Erro ao calcular resumo:', error);
    }
  };

  const calcularEstatisticas = () => {
    try {
      // Calcular média por atendimento
      const comissoesPagas = comissoes.filter(c => c && c.status === 'pago');
      const mediaPorAtendimento = comissoesPagas.length > 0
        ? comissoesPagas.reduce((acc, c) => acc + (Number(c.valor) || 0), 0) / comissoesPagas.length
        : 0;

      // Agrupar por mês
      const porMes = [];
      const mesesDados = {};

      comissoes.forEach(c => {
        if (!c) return;
        
        const data = new Date(c.dataRegistro || c.createdAt || c.data || 0);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        const chave = `${ano}-${mes}`;
        
        if (!mesesDados[chave]) {
          mesesDados[chave] = {
            mes,
            ano,
            quantidade: 0,
            total: 0
          };
        }
        
        if (c.status !== 'cancelado') {
          mesesDados[chave].quantidade++;
          mesesDados[chave].total += Number(c.valor) || 0;
        }
      });

      Object.keys(mesesDados).sort().forEach(chave => {
        porMes.push(mesesDados[chave]);
      });

      setEstatisticas({
        mediaPorAtendimento,
        porMes: porMes.slice(-6)
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
    }
  };

  // Função para renderizar chip de status
  const renderStatusChip = (status) => {
    switch(status) {
      case 'pago':
        return <Chip icon={<CheckCircleIcon />} label="Pago" size="small" color="success" variant="outlined" />;
      case 'cancelado':
        return <Chip icon={<WarningIcon />} label="Cancelado" size="small" color="error" variant="outlined" />;
      case 'pendente':
      default:
        return <Chip icon={<PendingIcon />} label="Pendente" size="small" color="warning" variant="outlined" />;
    }
  };

  const formatarMoeda = (valor) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor || 0);
    } catch {
      return `R$ ${(valor || 0).toFixed(2)}`;
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return String(data);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDetalhes = (atendimento) => {
    setAtendimentoSelecionado(atendimento);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setAtendimentoSelecionado(null);
  };

  const handleOpenRelatorio = () => {
    setOpenRelatorioDialog(true);
  };

  const handleCloseRelatorio = () => {
    setOpenRelatorioDialog(false);
  };

  const handleExportOptionChange = (event) => {
    const { name, value, checked, type } = event.target;
    setExportOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Função para exportar PDF
  const handleExportPDF = () => {
    try {
      mostrarSnackbar('Gerando PDF...', 'info');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Título com logo (simulado)
      doc.setFontSize(20);
      doc.setTextColor(156, 39, 176); // Roxo
      doc.text(configuracoes?.salao?.nomeFantasia || 'Relatório de Comissões', pageWidth / 2, 20, { align: 'center' });
      
      // Subtítulo
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Relatório de Comissões', pageWidth / 2, 30, { align: 'center' });
      
      // Informações do profissional
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const profissionalNome = profissional?.nome || 'Todos os Profissionais';
      doc.text(`Profissional: ${profissionalNome}`, pageWidth / 2, 40, { align: 'center' });
      
      // Período
      const periodo = `${meses.find(m => m.value === filtroMes)?.label} / ${filtroAno}`;
      doc.setFontSize(10);
      doc.text(`Período: ${periodo}`, pageWidth / 2, 48, { align: 'center' });
      
      // Data de emissão
      doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 56, { align: 'center' });
      
      let yPos = 65;
      
      // Resumo
      if (exportOptions.incluirResumo && resumo) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Resumo do Período', 14, yPos);
        yPos += 8;
        
        const resumoData = [
          ['Total de Comissões', formatarMoeda(resumo.totalPeriodo)],
          ['A Receber', formatarMoeda(resumo.aReceber)],
          ['Recebido', formatarMoeda(resumo.recebido)],
          ['Total de Comissões', resumo.quantidade.toString()],
          ['Comissões Pagas', resumo.quantidadePaga.toString()],
          ['Comissões Pendentes', resumo.quantidadePendente.toString()],
        ];
        
        autoTable(doc, {
          startY: yPos,
          head: [['Descrição', 'Valor']],
          body: resumoData,
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176] },
          margin: { left: 14, right: 14 },
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // Atendimentos
      if (exportOptions.incluirAtendimentos && atendimentosFiltrados.length > 0) {
        // Verificar se precisa de nova página
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Atendimentos no Período', 14, yPos);
        yPos += 8;
        
        const atendimentosData = atendimentosFiltrados.map(a => [
          formatarData(a.data),
          a.cliente?.nome || '—',
          a.servicos?.map(s => s.nome).join(', ') || '—',
          formatarMoeda(a.valorTotal),
          formatarMoeda(a.comissaoTotal),
          a.comissaoPaga ? 'Pago' : 'Pendente'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Data', 'Cliente', 'Serviços', 'Valor', 'Comissão', 'Status']],
          body: atendimentosData,
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 50 },
            3: { cellWidth: 25, halign: 'right' },
            4: { cellWidth: 25, halign: 'right' },
            5: { cellWidth: 20, halign: 'center' },
          },
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // Comissões
      if (exportOptions.incluirComissoes && comissoesFiltradas.length > 0) {
        // Verificar se precisa de nova página
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Detalhamento das Comissões', 14, yPos);
        yPos += 8;
        
        const comissoesData = comissoesFiltradas.map(c => [
          formatarData(c.data),
          c.servicoNome,
          `${c.percentual}%`,
          formatarMoeda(c.valorAtendimento),
          formatarMoeda(c.valor),
          c.status,
          c.dataPagamento ? formatarData(c.dataPagamento) : '—'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Data', 'Serviço', '%', 'Valor Base', 'Comissão', 'Status', 'Pagamento']],
          body: comissoesData,
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 35 },
            2: { cellWidth: 15, halign: 'right' },
            3: { cellWidth: 22, halign: 'right' },
            4: { cellWidth: 22, halign: 'right' },
            5: { cellWidth: 20, halign: 'center' },
            6: { cellWidth: 22, halign: 'center' },
          },
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // Resumo por Serviço
      if (exportOptions.incluirServicos && resumo?.porServico && resumo.porServico.length > 0) {
        // Verificar se precisa de nova página
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Resumo por Serviço', 14, yPos);
        yPos += 8;
        
        const servicosData = resumo.porServico.map(item => [
          item.nome,
          item.quantidade.toString(),
          formatarMoeda(item.valor),
          `${((item.valor / resumo.totalPeriodo) * 100).toFixed(1)}%`
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Serviço', 'Qtd', 'Total', '%']],
          body: servicosData,
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176] },
          margin: { left: 14, right: 14 },
        });
      }
      
      // Salvar PDF
      const fileName = `comissoes_${periodo.replace('/', '_')}_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
      mostrarSnackbar('PDF gerado com sucesso!', 'success');
      handleCloseRelatorio();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarSnackbar('Erro ao gerar PDF', 'error');
    }
  };

  // Função para exportar Excel
  const handleExportExcel = () => {
    try {
      mostrarSnackbar('Gerando planilha...', 'info');
      
      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      const periodo = `${meses.find(m => m.value === filtroMes)?.label} ${filtroAno}`;
      
      // Aba de Resumo
      if (exportOptions.incluirResumo && resumo) {
        const resumoData = [
          ['Resumo do Período'],
          [''],
          ['Descrição', 'Valor'],
          ['Total de Comissões', formatarMoeda(resumo.totalPeriodo)],
          ['A Receber', formatarMoeda(resumo.aReceber)],
          ['Recebido', formatarMoeda(resumo.recebido)],
          [''],
          ['Estatísticas'],
          ['Total de Comissões', resumo.quantidade],
          ['Comissões Pagas', resumo.quantidadePaga],
          ['Comissões Pendentes', resumo.quantidadePendente],
          ['Comissões Canceladas', resumo.quantidadeCancelada || 0],
          ['Total de Atendimentos', atendimentosFiltrados.length],
        ];
        
        const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
        XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
      }
      
      // Aba de Atendimentos
      if (exportOptions.incluirAtendimentos && atendimentosFiltrados.length > 0) {
        const atendimentosData = [
          ['Data', 'Hora', 'Cliente', 'Serviços', 'Valor Total', 'Comissão Total', 'Status'],
          ...atendimentosFiltrados.map(a => [
            formatarData(a.data),
            a.horaInicio || '--:--',
            a.cliente?.nome || '—',
            a.servicos?.map(s => s.nome).join(', ') || '—',
            a.valorTotal,
            a.comissaoTotal,
            a.comissaoPaga ? 'Pago' : 'Pendente'
          ])
        ];
        
        const wsAtendimentos = XLSX.utils.aoa_to_sheet(atendimentosData);
        XLSX.utils.book_append_sheet(wb, wsAtendimentos, 'Atendimentos');
      }
      
      // Aba de Comissões
      if (exportOptions.incluirComissoes && comissoesFiltradas.length > 0) {
        const comissoesData = [
          ['Data', 'Serviço', 'Percentual', 'Valor Base', 'Comissão', 'Status', 'Data Pagamento'],
          ...comissoesFiltradas.map(c => [
            formatarData(c.data),
            c.servicoNome,
            c.percentual,
            c.valorAtendimento,
            c.valor,
            c.status,
            c.dataPagamento ? formatarData(c.dataPagamento) : ''
          ])
        ];
        
        const wsComissoes = XLSX.utils.aoa_to_sheet(comissoesData);
        XLSX.utils.book_append_sheet(wb, wsComissoes, 'Comissões');
      }
      
      // Aba de Resumo por Serviço
      if (exportOptions.incluirServicos && resumo?.porServico && resumo.porServico.length > 0) {
        const servicosData = [
          ['Serviço', 'Quantidade', 'Total', '% do Total'],
          ...resumo.porServico.map(item => [
            item.nome,
            item.quantidade,
            item.valor,
            ((item.valor / resumo.totalPeriodo) * 100).toFixed(1)
          ])
        ];
        
        const wsServicos = XLSX.utils.aoa_to_sheet(servicosData);
        XLSX.utils.book_append_sheet(wb, wsServicos, 'Resumo por Serviço');
      }
      
      // Informações do relatório
      const infoData = [
        ['Informações do Relatório'],
        [''],
        ['Profissional', profissional?.nome || 'Todos os Profissionais'],
        ['Período', periodo],
        ['Data de Emissão', new Date().toLocaleString('pt-BR')],
        ['Status', filtroStatus !== 'todos' ? filtroStatus : 'Todos'],
      ];
      
      const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
      XLSX.utils.book_append_sheet(wb, wsInfo, 'Informações');
      
      // Salvar arquivo
      const fileName = `comissoes_${periodo.replace('/', '_')}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      mostrarSnackbar('Planilha gerada com sucesso!', 'success');
      handleCloseRelatorio();
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      mostrarSnackbar('Erro ao gerar planilha', 'error');
    }
  };

  // Filtrar comissões por busca
  const comissoesFiltradas = comissoes.filter(c => {
    if (!filtroBusca || !c) return true;
    
    const termo = filtroBusca.toLowerCase();
    return (
      (c.servicoNome && c.servicoNome.toLowerCase().includes(termo)) ||
      (c.profissionalNome && c.profissionalNome.toLowerCase().includes(termo)) ||
      (c.atendimentoId && c.atendimentoId.toLowerCase().includes(termo))
    );
  });

  // Filtrar atendimentos por busca
  const atendimentosFiltrados = atendimentos.filter(a => {
    if (!filtroBusca || !a) return true;
    
    const termo = filtroBusca.toLowerCase();
    return (
      (a.cliente?.nome && a.cliente.nome.toLowerCase().includes(termo)) ||
      (a.id && a.id.toLowerCase().includes(termo)) ||
      (a.servicos && a.servicos.some(s => s && s.nome && s.nome.toLowerCase().includes(termo)))
    );
  });

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!profissional && !isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Você não está vinculado a um perfil de profissional.
          Entre em contato com o administrador.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            {isAdmin ? 'Gerenciar Comissões' : 'Minhas Comissões'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isAdmin 
              ? 'Visualize todas as comissões dos profissionais' 
              : profissional?.nome ? `Olá, ${profissional.nome}! Acompanhe suas comissões e rendimentos` : 'Carregando...'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => handlePrint()}
          >
            Imprimir Relatório
          </Button>
          
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleOpenRelatorio}
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Cards de Resumo */}
      {resumo && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                      <AttachMoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        Total do Período
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {formatarMoeda(resumo.totalPeriodo)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {resumo.quantidade} comissões
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                      <PendingIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        A Receber
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                        {formatarMoeda(resumo.aReceber)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {resumo.quantidadePendente} pendentes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        Recebido
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {formatarMoeda(resumo.recebido)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {resumo.quantidadePaga} pagas
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56 }}>
                      <TimelineIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="caption">
                        Média por Comissão
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196f3' }}>
                        {formatarMoeda(estatisticas?.mediaPorAtendimento || 0)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {atendimentos.length} atendimentos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: filtroBusca && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setFiltroBusca('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={isAdmin ? 1 : 2}>
              <FormControl fullWidth size="small">
                <InputLabel>Mês</InputLabel>
                <Select
                  value={filtroMes}
                  label="Mês"
                  onChange={(e) => setFiltroMes(e.target.value)}
                >
                  {meses.map(mes => (
                    <MenuItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={isAdmin ? 1 : 2}>
              <FormControl fullWidth size="small">
                <InputLabel>Ano</InputLabel>
                <Select
                  value={filtroAno}
                  label="Ano"
                  onChange={(e) => setFiltroAno(e.target.value)}
                >
                  {anos.map(ano => (
                    <MenuItem key={ano} value={ano}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {isAdmin && (
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    value={filtroProfissional}
                    label="Profissional"
                    onChange={(e) => setFiltroProfissional(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {profissionais.map(prof => (
                      <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={isAdmin ? 2 : 2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroStatus}
                  label="Status"
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="pago">Pago</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={isAdmin ? 2 : 4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setFiltroBusca('');
                    setFiltroMes(new Date().getMonth() + 1);
                    setFiltroAno(new Date().getFullYear());
                    setFiltroStatus('todos');
                    if (isAdmin) setFiltroProfissional('todos');
                    carregarDados();
                  }}
                >
                  Limpar
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleOpenRelatorio}
                  color="error"
                >
                  PDF
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<TableChartIcon />}
                  onClick={handleOpenRelatorio}
                  color="success"
                >
                  Excel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Comissões" icon={<PercentIcon />} iconPosition="start" />
          <Tab 
            label={
              <Badge badgeContent={atendimentos.length} color="primary">
                Atendimentos
              </Badge>
            } 
            icon={<EventIcon />} 
            iconPosition="start" 
          />
          <Tab label="Resumo por Serviço" icon={<PieChartIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab de Comissões */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Detalhamento das Comissões
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Data</strong></TableCell>
                    {isAdmin && <TableCell><strong>Profissional</strong></TableCell>}
                    <TableCell><strong>Serviço</strong></TableCell>
                    <TableCell align="right"><strong>%</strong></TableCell>
                    <TableCell align="right"><strong>Valor Base</strong></TableCell>
                    <TableCell align="right"><strong>Comissão</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Pagamento</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comissoesFiltradas.length > 0 ? (
                    comissoesFiltradas.map((comissao) => (
                      <TableRow key={comissao.id} hover>
                        <TableCell>
                          {formatarData(comissao.dataRegistro || comissao.createdAt || comissao.data)}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            {comissao.profissionalNome || '—'}
                          </TableCell>
                        )}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptLongIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
                            {comissao.servicoNome}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${comissao.percentual}%`}
                            size="small"
                            variant="outlined"
                            sx={{ bgcolor: '#f3e5f5' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatarMoeda(comissao.valorAtendimento)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="#4caf50">
                            {formatarMoeda(comissao.valor)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(comissao.status)}
                        </TableCell>
                        <TableCell>
                          {comissao.dataPagamento ? (
                            <Tooltip title={`Pago em ${formatarData(comissao.dataPagamento)}`}>
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="Pago"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            </Tooltip>
                          ) : (
                            <Chip
                              icon={<PendingIcon />}
                              label="Aguardando"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 4 }}>
                        <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography color="textSecondary">
                          Nenhuma comissão encontrada para o período
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab de Atendimentos */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Atendimentos Realizados
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Hora</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Serviços</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell align="right"><strong>Comissão</strong></TableCell>
                    <TableCell><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {atendimentosFiltrados.length > 0 ? (
                    atendimentosFiltrados.map((atendimento) => (
                      <TableRow key={atendimento.id} hover>
                        <TableCell>{formatarData(atendimento.data)}</TableCell>
                        <TableCell>
                          {atendimento.horaInicio || '--:--'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ color: '#757575', fontSize: 20 }} />
                            {atendimento.cliente?.nome || '—'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {atendimento.servicos?.map(s => s.nome).join(', ') || 
                           atendimento.itensServico?.map(i => i.nome).join(', ')}
                        </TableCell>
                        <TableCell align="right">
                          {formatarMoeda(atendimento.valorTotal)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="#4caf50">
                            {formatarMoeda(atendimento.comissaoTotal)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Ver detalhes">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetalhes(atendimento)}
                              sx={{ color: '#9c27b0' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography color="textSecondary">
                          Nenhum atendimento encontrado para o período
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab de Resumo por Serviço */}
      {tabValue === 2 && resumo?.porServico && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Comissões por Serviço
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Serviço</strong></TableCell>
                    <TableCell align="right"><strong>Quantidade</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>% do Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resumo.porServico.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell align="right">{item.quantidade}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="#4caf50">
                          {formatarMoeda(item.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${((item.valor / resumo.totalPeriodo) * 100).toFixed(1)}%`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Histórico Mensal */}
      {estatisticas && estatisticas.porMes.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Histórico dos Últimos Meses
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Período</TableCell>
                    <TableCell align="right">Comissões</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estatisticas.porMes.map((mes, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {meses.find(m => m.value === mes.mes)?.label} / {mes.ano}
                      </TableCell>
                      <TableCell align="right">{mes.quantidade}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="#4caf50">
                          {formatarMoeda(mes.total)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Detalhes do Atendimento */}
      <Dialog open={openDetalhesDialog} onClose={handleCloseDetalhes} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes do Atendimento
        </DialogTitle>
        <DialogContent>
          {atendimentoSelecionado && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Data e Hora
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatarData(atendimentoSelecionado.data)} às {atendimentoSelecionado.horaInicio}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Cliente
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {atendimentoSelecionado.cliente?.nome || '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Serviços Realizados
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Serviço</TableCell>
                          <TableCell align="right">Valor</TableCell>
                          <TableCell align="right">Comissão %</TableCell>
                          <TableCell align="right">Sua Comissão</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(atendimentoSelecionado.servicos || atendimentoSelecionado.itensServico || []).map((servico, idx) => {
                          // Buscar a comissão específica para este serviço
                          const comissaoServico = atendimentoSelecionado.comissoes?.find(c => 
                            c.servicoId === (servico.servicoId || servico.id)
                          );
                          
                          return (
                            <TableRow key={idx}>
                              <TableCell>{servico.nome}</TableCell>
                              <TableCell align="right">
                                R$ {(servico.preco || servico.valor || 0).toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                {servico.comissao || comissaoServico?.percentual || 0}%
                              </TableCell>
                              <TableCell align="right">
                                <Typography color="#4caf50" fontWeight={600}>
                                  R$ {(comissaoServico?.valor || 0).toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {comissaoServico && (
                                  <Chip
                                    size="small"
                                    label={comissaoServico.status}
                                    color={comissaoServico.status === 'pago' ? 'success' : 'warning'}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Resumo do Atendimento
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Total do Atendimento
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatarMoeda(atendimentoSelecionado.valorTotal)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Sua Comissão Total
                        </Typography>
                        <Typography variant="h6" color="#4caf50">
                          {formatarMoeda(atendimentoSelecionado.comissaoTotal)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Status das Comissões
                        </Typography>
                        {atendimentoSelecionado.comissoes?.map((c, idx) => (
                          <Chip
                            key={idx}
                            size="small"
                            label={c.status}
                            color={c.status === 'pago' ? 'success' : 'warning'}
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {(!atendimentoSelecionado.comissoes || atendimentoSelecionado.comissoes.length === 0) && (
                          <Typography variant="body2" color="textSecondary">
                            Nenhuma comissão registrada
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Exportação/Relatório */}
      <Dialog open={openRelatorioDialog} onClose={handleCloseRelatorio} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Exportar Relatório
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Opções de Exportação
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PictureAsPdfIcon color="error" /> PDF
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Exportar como documento PDF formatado
                  </Typography>
                  <FormControl component="fieldset" sx={{ mt: 1 }}>
                    <FormLabel component="legend">Incluir no PDF:</FormLabel>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirResumo}
                          onChange={handleExportOptionChange}
                          name="incluirResumo"
                          size="small"
                        />
                      }
                      label="Resumo"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirAtendimentos}
                          onChange={handleExportOptionChange}
                          name="incluirAtendimentos"
                          size="small"
                        />
                      }
                      label="Atendimentos"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirComissoes}
                          onChange={handleExportOptionChange}
                          name="incluirComissoes"
                          size="small"
                        />
                      }
                      label="Comissões"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirServicos}
                          onChange={handleExportOptionChange}
                          name="incluirServicos"
                          size="small"
                        />
                      }
                      label="Resumo por Serviço"
                    />
                  </FormControl>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => {
                      handleExportPDF();
                    }}
                    sx={{ mt: 2 }}
                    disabled={!exportOptions.incluirResumo && !exportOptions.incluirAtendimentos && !exportOptions.incluirComissoes && !exportOptions.incluirServicos}
                  >
                    Gerar PDF
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableChartIcon color="success" /> Excel
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Exportar como planilha Excel
                  </Typography>
                  <FormControl component="fieldset" sx={{ mt: 1 }}>
                    <FormLabel component="legend">Incluir no Excel:</FormLabel>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirResumo}
                          onChange={handleExportOptionChange}
                          name="incluirResumo"
                          size="small"
                        />
                      }
                      label="Resumo"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirAtendimentos}
                          onChange={handleExportOptionChange}
                          name="incluirAtendimentos"
                          size="small"
                        />
                      }
                      label="Atendimentos"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirComissoes}
                          onChange={handleExportOptionChange}
                          name="incluirComissoes"
                          size="small"
                        />
                      }
                      label="Comissões"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirServicos}
                          onChange={handleExportOptionChange}
                          name="incluirServicos"
                          size="small"
                        />
                      }
                      label="Resumo por Serviço"
                    />
                  </FormControl>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<TableChartIcon />}
                    onClick={() => {
                      handleExportExcel();
                    }}
                    sx={{ mt: 2 }}
                    disabled={!exportOptions.incluirResumo && !exportOptions.incluirAtendimentos && !exportOptions.incluirComissoes && !exportOptions.incluirServicos}
                  >
                    Gerar Excel
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PrintIcon /> Impressão
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Imprimir relatório diretamente
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => {
                      handleCloseRelatorio();
                      handlePrint();
                    }}
                  >
                    Imprimir Agora
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRelatorio}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <RelatorioComissoes
          ref={relatorioRef}
          dados={{
            resumo: resumo || { totalPeriodo: 0, aReceber: 0, recebido: 0, quantidade: 0, quantidadePaga: 0, quantidadePendente: 0, quantidadeCancelada: 0, porServico: [] },
            comissoes: comissoesFiltradas,
            atendimentos: atendimentosFiltrados
          }}
          profissional={isAdmin ? { nome: 'Todos os Profissionais', id: 'todos' } : profissional}
          periodo={`${meses.find(m => m.value === filtroMes)?.label} / ${filtroAno}`}
          filtros={{ mes: filtroMes, ano: filtroAno, status: filtroStatus }}
          configuracoes={configuracoes}
          tipo="completo"
        />
      </Box>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MinhasComissoes;
