// src/pages/MeusPontos.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  LinearProgress,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Zoom,
  Fab,
  Skeleton,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Pagination,
  Stack,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  Redeem as RewardIcon,
  History as HistoryIcon,
  MonetizationOn as CoinIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

// Níveis de fidelidade
const niveis = {
  bronze: { 
    cor: '#cd7f32', 
    corFundo: '#fff3e0', 
    minimo: 0, 
    multiplicador: 1,
    icone: <StarIcon />,
    label: 'Bronze'
  },
  prata: { 
    cor: '#c0c0c0', 
    corFundo: '#f5f5f5', 
    minimo: 500, 
    multiplicador: 1.2,
    icone: <StarIcon />,
    label: 'Prata'
  },
  ouro: { 
    cor: '#ffd700', 
    corFundo: '#fff9e6', 
    minimo: 2000, 
    multiplicador: 1.5,
    icone: <StarIcon />,
    label: 'Ouro'
  },
  platina: { 
    cor: '#e5e4e2', 
    corFundo: '#f0f0f0', 
    minimo: 5000, 
    multiplicador: 2,
    icone: <StarIcon />,
    label: 'Platina'
  },
};

// Benefícios por nível
const beneficios = {
  bronze: ['5% de desconto em serviços', 'Pontuação normal', 'Aniversário: 50 pontos extras'],
  prata: ['10% de desconto em serviços', '1.2x pontos', 'Prioridade no agendamento', 'Cortesia no aniversário'],
  ouro: ['15% de desconto em serviços', '1.5x pontos', 'Agendamento VIP', 'Brinde surpresa', 'Convite para eventos'],
  platina: ['20% de desconto em serviços', '2x pontos', 'Acesso antecipado a promoções', 'Presente de aniversário', 'Consultoria exclusiva'],
};

// Função utilitária para formatar data com segurança
const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '—';
  
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (!isValid(dateObj)) return '—';
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '—';
  }
};

// Componente de Card de Movimentação Mobile
const MovimentacaoMobileCard = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: item.tipo === 'credito' ? '#4caf50' : '#f44336',
                width: 48,
                height: 48,
              }}
            >
              {item.tipo === 'credito' ? <TrendingUpIcon /> : <TrendingDownIcon />}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {item.motivo || 'Movimentação'}
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 700,
                    color: item.tipo === 'credito' ? '#4caf50' : '#f44336'
                  }}
                >
                  {item.tipo === 'credito' ? '+' : '-'}{item.quantidade}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={item.tipo === 'credito' ? 'Crédito' : 'Débito'}
                  color={item.tipo === 'credito' ? 'success' : 'error'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(item.data)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de Card de Recompensa Mobile
const RecompensaMobileCard = ({ recompensa, onResgatar }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          mb: 1.5,
          cursor: 'pointer',
          border: '1px solid',
          borderColor: 'divider',
        }}
        onClick={() => onResgatar(recompensa)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#9c27b0' }}>
              <GiftIcon />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {recompensa.nome}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  size="small"
                  label={recompensa.tipo}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ fontSize: 12, color: '#ff9800' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#ff9800' }}>
                    {recompensa.pontosNecessarios} pontos
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de Impressão
const ImprimirPontos = React.forwardRef(({ cliente, nivel, saldo, movimentacoes, periodo }, ref) => {
  return (
    <Box ref={ref} sx={{ p: 4, backgroundColor: 'white', minHeight: '100vh' }}>
      {/* Cabeçalho */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: '2px solid #9c27b0'
      }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 700 }}>
            Beauty Pro
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Programa de Fidelidade
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2">
            Data: {new Date().toLocaleDateString('pt-BR')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Hora: {new Date().toLocaleTimeString('pt-BR')}
          </Typography>
        </Box>
      </Box>

      {/* Título */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        Extrato de Pontos - {cliente?.nome}
      </Typography>

      {/* Resumo */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: '#f3e5f5' }}>
          <Typography variant="subtitle2" color="textSecondary">Nível Atual</Typography>
          <Typography variant="h5" sx={{ color: niveis[nivel]?.cor, fontWeight: 700, textTransform: 'uppercase' }}>
            {nivel}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: '#fff3e0' }}>
          <Typography variant="subtitle2" color="textSecondary">Saldo de Pontos</Typography>
          <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 700 }}>
            {saldo}
          </Typography>
        </Paper>
      </Box>

      {/* Tabela de Movimentações */}
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#9c27b0' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Data</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tipo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Descrição</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Pontos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimentacoes.map((item, index) => (
              <TableRow key={index} sx={{ 
                '&:nth-of-type(even)': { bgcolor: '#faf5ff' } 
              }}>
                <TableCell>{formatDate(item.data)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={item.tipo === 'credito' ? 'Crédito' : 'Débito'}
                    color={item.tipo === 'credito' ? 'success' : 'error'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </TableCell>
                <TableCell>{item.motivo || '—'}</TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: 600,
                  color: item.tipo === 'credito' ? '#4caf50' : '#f44336'
                }}>
                  {item.tipo === 'credito' ? '+' : '-'}{item.quantidade}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Rodapé */}
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px dashed #ccc' }}>
        <Typography variant="caption" color="textSecondary" display="block" align="center">
          Documento gerado em {new Date().toLocaleString('pt-BR')}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block" align="center">
          Beauty Pro Salon - Sistema de Gerenciamento v2.0
        </Typography>
      </Box>
    </Box>
  );
});

function MeusPontos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const componentRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [pontuacao, setPontuacao] = useState([]);
  const [resgates, setResgates] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [progresso, setProgresso] = useState(0);
  const [pontosFaltantes, setPontosFaltantes] = useState(0);
  const [ultimosPontos, setUltimosPontos] = useState([]);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bottomNavValue, setBottomNavValue] = useState(0);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const carregarUsuario = async () => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (!usuarioStr) {
        mostrarSnackbar('Usuário não encontrado', 'error');
        navigate('/login');
        return;
      }

      const user = JSON.parse(usuarioStr);
      setUsuario(user);

      if (!user.clienteId) {
        mostrarSnackbar('Você não possui um perfil de cliente', 'warning');
        return;
      }

      await carregarDadosCliente(user.clienteId);

      // Registrar acesso na auditoria
      await auditoriaService.registrar('acesso_meus_pontos', {
        entidade: 'fidelidade',
        entidadeId: user.clienteId,
        detalhes: 'Acesso à página Meus Pontos',
      });

    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_usuario_meus_pontos'
      });
    }
  };

  const carregarDadosCliente = async (clienteId) => {
    try {
      setLoading(true);
      
      console.log('🔄 Carregando dados de fidelidade do cliente...');

      const clienteData = await firebaseService.getById('clientes', clienteId);
      setCliente(clienteData);

      const pontuacaoData = await firebaseService.query('pontuacao', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]).catch(() => []);
      
      setPontuacao(pontuacaoData || []);

      const resgatesData = await firebaseService.query('resgates_fidelidade', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]).catch(() => []);
      
      setResgates(resgatesData || []);

      const recompensasData = await firebaseService.getAll('recompensas').catch(() => []);
      setRecompensas(recompensasData || []);

      const pontosGanhos = (pontuacaoData || [])
        .filter(p => p.tipo === 'credito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);

      const pontosGastos = (pontuacaoData || [])
        .filter(p => p.tipo === 'debito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);

      const saldoAtual = pontosGanhos - pontosGastos;
      setSaldo(saldoAtual);

      let nivelAtual = 'bronze';
      if (saldoAtual >= 5000) nivelAtual = 'platina';
      else if (saldoAtual >= 2000) nivelAtual = 'ouro';
      else if (saldoAtual >= 500) nivelAtual = 'prata';
      setNivel(nivelAtual);

      const proximoNivel = nivelAtual === 'bronze' ? 'prata' : 
                          nivelAtual === 'prata' ? 'ouro' : 
                          nivelAtual === 'ouro' ? 'platina' : null;

      if (proximoNivel) {
        const pontosProximo = niveis[proximoNivel].minimo;
        const pontosAtualNivel = niveis[nivelAtual].minimo;
        const progressoCalculado = ((saldoAtual - pontosAtualNivel) / (pontosProximo - pontosAtualNivel)) * 100;
        setProgresso(Math.min(progressoCalculado, 100));
        setPontosFaltantes(pontosProximo - saldoAtual);
      } else {
        setProgresso(100);
        setPontosFaltantes(0);
      }

      const ultimos = [...(pontuacaoData || [])]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 10);
      setUltimosPontos(ultimos);

      console.log('📊 Dados carregados:', {
        saldo: saldoAtual,
        nivel: nivelAtual,
        pontuacoes: pontuacaoData?.length || 0,
        resgates: resgatesData?.length || 0
      });

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_dados_cliente_meus_pontos',
        clienteId
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = async () => {
    try {
      const doc = new jsPDF();
      
      doc.setFillColor(156, 39, 176);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('EXTRATO DE PONTOS', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(cliente?.nome || 'Cliente', 105, 30, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      let yPos = 50;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, 170, 30, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text('Nível:', 25, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(nivel.toUpperCase(), 50, yPos + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Saldo:', 100, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(String(saldo), 120, yPos + 10);
      
      if (nivel !== 'platina') {
        doc.setFont('helvetica', 'bold');
        doc.text('Próximo nível:', 25, yPos + 22);
        doc.setFont('helvetica', 'normal');
        const proximo = nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'platina';
        doc.text(`${proximo.toUpperCase()} (faltam ${pontosFaltantes} pontos)`, 60, yPos + 22);
      }
      
      yPos += 50;

      const tableColumn = ['Data', 'Tipo', 'Descrição', 'Pontos'];
      const tableRows = [];
      
      ultimosPontos.forEach(p => {
        const row = [
          formatDate(p.data),
          p.tipo === 'credito' ? 'Crédito' : 'Débito',
          p.motivo || '—',
          `${p.tipo === 'credito' ? '+' : '-'}${p.quantidade}`,
        ];
        tableRows.push(row);
      });
      
      doc.autoTable({
        startY: yPos,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [156, 39, 176],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
      });
      
      await auditoriaService.registrar('exportar_extrato_pontos', {
        entidade: 'fidelidade',
        entidadeId: cliente?.id,
        detalhes: 'Exportação de extrato de pontos',
        dados: {
          formato: 'PDF',
          saldo,
          nivel
        }
      });
      
      window.open(doc.output('bloburl'), '_blank');
      setOpenPrintDialog(false);
      mostrarSnackbar('PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarSnackbar('Erro ao gerar PDF', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_extrato_pontos_pdf'
      });
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `extrato_pontos_${format(new Date(), 'yyyy-MM-dd')}`,
    onBeforeGetContent: () => {
      mostrarSnackbar('Preparando impressão...', 'info');
    },
    onAfterPrint: () => {
      mostrarSnackbar('Impressão enviada!');
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      mostrarSnackbar('Erro ao imprimir', 'error');
      
      auditoriaService.registrarErro(error, { 
        acao: 'imprimir_extrato_pontos'
      });
    }
  });

  const irParaRecompensas = () => {
    navigate('/fidelidade/recompensas');
  };

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>

        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!cliente) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Alert severity="warning">
          Você não está vinculado a um perfil de cliente.
          Entre em contato com o administrador.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      pb: isMobile ? 10 : 3,
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      {/* Cabeçalho Mobile */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ 
              fontWeight: 700, 
              color: '#9c27b0',
              fontSize: isMobile ? '1.5rem' : '2.125rem'
            }}
          >
            Meus Pontos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {cliente?.nome}
          </Typography>
        </Box>
        
        <Zoom in={true}>
          <Fab
            size="small"
            onClick={() => setOpenPrintDialog(true)}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
            }}
          >
            <PrintIcon />
          </Fab>
        </Zoom>
      </Box>

      {/* Card Principal Mobile */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ 
              bgcolor: niveis[nivel].corFundo,
              border: `2px solid ${niveis[nivel].cor}`,
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: niveis[nivel].cor, 
                  width: 64, 
                  height: 64,
                  margin: '0 auto 12px'
                }}>
                  <TrophyIcon sx={{ fontSize: 32 }} />
                </Avatar>
                
                <Typography variant="h3" sx={{ fontWeight: 700, color: niveis[nivel].cor, mb: 1 }}>
                  {saldo}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Pontos Acumulados
                </Typography>
                
                <Chip
                  label={nivel.toUpperCase()}
                  sx={{
                    bgcolor: niveis[nivel].cor,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    height: 32,
                    mt: 1
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Progresso para o próximo nível
                </Typography>

                {nivel !== 'platina' ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Nível atual: {nivel.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Faltam {pontosFaltantes} pontos
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={progresso}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        mb: 2,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: niveis[nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'platina'].cor,
                        },
                      }}
                    />

                    <Typography variant="caption" color="textSecondary" display="block">
                      Próximo nível: {
                        nivel === 'bronze' ? 'PRATA (500 pontos)' :
                        nivel === 'prata' ? 'OURO (2.000 pontos)' :
                        'PLATINA (5.000 pontos)'
                      }
                    </Typography>
                  </>
                ) : (
                  <Alert severity="success" icon={<TrophyIcon />} sx={{ py: 0 }}>
                    Parabéns! Você atingiu o nível máximo.
                  </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Benefícios do seu nível
                </Typography>

                <Grid container spacing={1}>
                  {beneficios[nivel].map((beneficio, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                        <Typography variant="caption">{beneficio}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Botão Ver Recompensas Mobile */}
      <Box sx={{ mb: 3 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<GiftIcon />}
          onClick={irParaRecompensas}
          sx={{ bgcolor: '#9c27b0' }}
        >
          Ver Recompensas Disponíveis
        </Button>
      </Box>

      {/* Cards de Estatísticas Mobile */}
      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32 }}>
                  <CheckIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                    {pontuacao.filter(p => p.tipo === 'credito').length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Créditos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#f44336', width: 32, height: 32 }}>
                  <CancelIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                    {pontuacao.filter(p => p.tipo === 'debito').length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Débitos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32 }}>
                  <GiftIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                    {resgates.length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Resgates
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 32, height: 32 }}>
                  <StarIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                    {recompensas.length}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Recompensas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Últimas Movimentações */}
      <Card>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Últimas Movimentações
          </Typography>

          <AnimatePresence>
            {ultimosPontos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <InfoIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary">
                    Nenhuma movimentação encontrada
                  </Typography>
                </Paper>
              </motion.div>
            ) : (
              ultimosPontos.map((item, index) => (
                <MovimentacaoMobileCard key={index} item={item} />
              ))
            )}
          </AnimatePresence>

          {pontuacao.length > 10 && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
              Mostrando as 10 últimas movimentações de {pontuacao.length}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Impressão */}
      <Dialog 
        open={openPrintDialog} 
        onClose={() => setOpenPrintDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PrintIcon />
            <Typography variant="h6">Exportar Extrato</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Escolha o formato para exportar:
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePrintPDF}
                  sx={{ 
                    p: 3,
                    bgcolor: '#f44336',
                    '&:hover': { bgcolor: '#d32f2f' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <PictureAsPdfIcon sx={{ fontSize: 40 }} />
                  <Typography variant="body1">PDF</Typography>
                  <Typography variant="caption">Documento profissional</Typography>
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePrint}
                  sx={{ 
                    p: 3,
                    bgcolor: '#2196f3',
                    '&:hover': { bgcolor: '#1976d2' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <PrintIcon sx={{ fontSize: 40 }} />
                  <Typography variant="body1">Imprimir</Typography>
                  <Typography variant="caption">Versão para impressão</Typography>
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  Nível atual: {nivel.toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  Saldo: {saldo} pontos
                </Typography>
                <Typography variant="body2">
                  Total de movimentações: {pontuacao.length}
                </Typography>
              </Alert>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <ImprimirPontos
          ref={componentRef}
          cliente={cliente}
          nivel={nivel}
          saldo={saldo}
          movimentacoes={ultimosPontos}
        />
      </Box>

      {/* Bottom Navigation Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1000,
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => {
              setBottomNavValue(newValue);
              switch(newValue) {
                case 0:
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  break;
                case 1:
                  irParaRecompensas();
                  break;
                case 2:
                  setOpenPrintDialog(true);
                  break;
                default:
                  break;
              }
            }}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root.Mui-selected': {
                color: '#9c27b0',
              },
            }}
          >
            <BottomNavigationAction label="Início" icon={<StarIcon />} />
            <BottomNavigationAction label="Recompensas" icon={<GiftIcon />} />
            <BottomNavigationAction label="Exportar" icon={<PrintIcon />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MeusPontos;
