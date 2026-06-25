// src/pages/ClienteDashboard.js - VERSÃO ATUALIZADA COM INDICAÇÕES
import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Badge,
  Fab,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  alpha,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  CardGiftcard as GiftIcon,
  History as HistoryIcon,
  Event as EventIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  DateRange as DateRangeIcon,
  Redeem as RedeemIcon,
  Assessment as AssessmentIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // 🔥 IMPORTANTE: Importar o toast
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { useFidelidadeAtiva } from '../hooks/useFidelidadeAtiva';
import { QRCodeCanvas } from 'qrcode.react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAgendamentoStatusInfo } from '../utils/agendamentoStatus';
import { formatLocalDate, formatLocalDateTime, getLocalDateInputValue } from '../utils/dateTimeUtils';

function TabPanel({ children, value, index, isMobile }) {
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && (
        <Box sx={{
          p: isMobile ? 1 : 3,
          width: '100%'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Componente Mobile otimizado para cards
const MobileCard = ({ children, onClick, active }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileTap={{ scale: 0.98 }}
    style={{ width: '100%' }}
  >
    <Card
      onClick={onClick}
      sx={{
        mb: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: active ? '4px solid #9c27b0' : 'none',
        backgroundColor: active ? '#faf5ff' : 'white',
        '&:active': {
          backgroundColor: '#f3e5f5',
        }
      }}
    >
      {children}
    </Card>
  </motion.div>
);

// Componente de carregamento otimizado
const LoadingSkeleton = () => (
  <Box sx={{ width: '100%', p: 2 }}>
    <LinearProgress sx={{ mb: 2 }} />
    <Grid container spacing={2}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#f0f0f0' }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ width: '60%', height: 20, bgcolor: '#f0f0f0', mb: 1 }} />
                  <Box sx={{ width: '40%', height: 16, bgcolor: '#f0f0f0' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

// Componente de Indicações para o Cliente (CORRIGIDO)
const IndicacoesCliente = ({ clienteId, clienteNome, saldoPontos, onPontosAtualizados }) => {
  const [indicacoes, setIndicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);
  const [indicacaoSelecionada, setIndicacaoSelecionada] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
  });
  const [config, setConfig] = useState({ pontosIndicacao: 100, diasValidadeIndicacao: 30 });
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    confirmadas: 0,
    pontosGanhos: 0,
  });

  useEffect(() => {
    if (clienteId) {
      carregarIndicacoes();
      carregarConfiguracoes();
    }
  }, [clienteId]);

  const carregarConfiguracoes = async () => {
    try {
      const configs = await firebaseService.getAll('config_fidelidade');
      if (configs && configs.length > 0) {
        setConfig(configs[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const carregarIndicacoes = async () => {
    try {
      setLoading(true);
      const indicacoesData = await firebaseService.query('indicacoes', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]);

      setIndicacoes(indicacoesData || []);

      const statsData = {
        total: indicacoesData?.length || 0,
        pendentes: indicacoesData?.filter(i => i.status === 'pendente').length || 0,
        confirmadas: indicacoesData?.filter(i => i.status === 'confirmada').length || 0,
        pontosGanhos: indicacoesData?.filter(i => i.status === 'confirmada').reduce((acc, i) => acc + (i.pontosGanhos || 0), 0) || 0,
      };
      setStats(statsData);

      if (onPontosAtualizados && statsData.pontosGanhos !== stats.pontosGanhos) {
        onPontosAtualizados(statsData.pontosGanhos);
      }
    } catch (error) {
      console.error('Erro ao carregar indicações:', error);
      toast.error('Erro ao carregar indicações');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ nome: '', email: '', telefone: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔥 FUNÇÃO CORRIGIDA - SEM ERRO DE DATA
  const handleSalvarIndicacao = async () => {
    try {
      if (!formData.nome) {
        toast.error('Nome do indicado é obrigatório');
        return;
      }

      // 🔥 Criar datas de forma segura
      const agora = new Date();
      const dataAtualISO = agora.toISOString();

      const dataExpiracao = new Date();
      dataExpiracao.setDate(agora.getDate() + (config.diasValidadeIndicacao || 30));
      const dataExpiracaoISO = dataExpiracao.toISOString();

      // 🔥 Validar se as datas são válidas
      if (isNaN(agora.getTime()) || isNaN(dataExpiracao.getTime())) {
        console.error('Datas inválidas:', { agora, dataExpiracao });
        toast.error('Erro ao processar datas. Tente novamente.');
        return;
      }

      const indicacaoData = {
        clienteId: clienteId,
        clienteNome: clienteNome || 'Cliente',
        clienteIndicadoId: null,
        clienteIndicadoNome: formData.nome.trim(),
        clienteIndicadoEmail: formData.email?.trim() || '',
        clienteIndicadoTelefone: formData.telefone?.trim() || '',
        status: 'pendente',
        pontosGanhos: 0,
        pontosBonus: config.pontosIndicacao || 100,
        dataCriacao: dataAtualISO,
        dataExpiracao: dataExpiracaoISO,
        createdAt: dataAtualISO,
        updatedAt: dataAtualISO,
      };

      console.log('Salvando indicação:', indicacaoData);

      await firebaseService.add('indicacoes', indicacaoData);

      toast.success('Indicação registrada com sucesso!');
      handleCloseDialog();
      carregarIndicacoes();
    } catch (error) {
      console.error('Erro ao salvar indicação:', error);
      toast.error('Erro ao salvar indicação: ' + (error.message || 'Tente novamente'));
    }
  };

  // 🔥 FUNÇÃO CORRIGIDA PARA COPIAR LINK
  const handleCopiarLink = (indicacao) => {
    if (!indicacao || !indicacao.id) {
      toast.error('Erro ao gerar link de indicação');
      return;
    }
    const link = `${window.location.origin}/cadastro?indicacao=${indicacao.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  // 🔥 FUNÇÃO CORRIGIDA PARA ABRIR QR CODE
  const handleAbrirQRCode = (indicacao) => {
    if (!indicacao || !indicacao.id) {
      toast.error('Erro ao gerar QR Code');
      return;
    }
    setIndicacaoSelecionada(indicacao);
    setOpenQrCodeDialog(true);
  };

  // 🔥 FUNÇÃO CORRIGIDA PARA FORMATAR DATA
  const formatarData = (data) => {
    if (!data) return '-';
    try {
      const date = new Date(data);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  // 🔥 FUNÇÃO CORRIGIDA PARA STATUS
  const getStatusInfo = (status) => {
    const statusMap = {
      pendente: { label: 'Pendente', color: '#ff9800', icon: <ScheduleIcon /> },
      confirmada: { label: 'Confirmada', color: '#4caf50', icon: <CheckIcon /> },
      cancelada: { label: 'Cancelada', color: '#f44336', icon: <CancelIcon /> },
      expirada: { label: 'Expirada', color: '#9e9e9e', icon: <InfoIcon /> },
    };
    return statusMap[status] || statusMap.pendente;
  };

  if (loading) {
    return <CircularProgress size={24} />;
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 1, md: 2 } }}>
      {/* Card de Resumo de Indicações */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', py: 1, bgcolor: '#f3e5f5' }}>
            <PersonAddIcon sx={{ color: '#9c27b0', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              {stats.total}
            </Typography>
            <Typography variant="caption">Total</Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', py: 1, bgcolor: '#fff3e0' }}>
            <ScheduleIcon sx={{ color: '#ff9800', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
              {stats.pendentes}
            </Typography>
            <Typography variant="caption">Pendentes</Typography>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ textAlign: 'center', py: 1, bgcolor: '#e8f5e9' }}>
            <CheckIcon sx={{ color: '#4caf50', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
              {stats.confirmadas}
            </Typography>
            <Typography variant="caption">Confirmadas</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Botão Nova Indicação */}
      <Button
        fullWidth
        variant="contained"
        startIcon={<PersonAddIcon />}
        onClick={handleOpenDialog}
        sx={{
          mb: 3,
          background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
        }}
      >
        Nova Indicação
      </Button>

      {/* Lista de Indicações */}
      {indicacoes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonAddIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Você ainda não fez nenhuma indicação
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Indique amigos e ganhe {config.pontosIndicacao} pontos por cada indicação confirmada!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#faf5ff' }}>
                <TableCell>Indicado</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Pontos</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {indicacoes.map((indicacao) => {
                const statusInfo = getStatusInfo(indicacao.status);
                // 🔥 Verificar se a indicação expirou
                const isExpirada = indicacao.status === 'pendente' &&
                                   indicacao.dataExpiracao &&
                                   new Date(indicacao.dataExpiracao) < new Date();

                const statusAtual = isExpirada ? 'expirada' : indicacao.status;
                const statusAtualInfo = getStatusInfo(statusAtual);

                return (
                  <TableRow key={indicacao.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {indicacao.clienteIndicadoNome || 'Nome não informado'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {indicacao.clienteIndicadoEmail || indicacao.clienteIndicadoTelefone || 'Sem contato'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatarData(indicacao.dataCriacao)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={statusAtualInfo.icon}
                        label={statusAtualInfo.label}
                        sx={{
                          bgcolor: alpha(statusAtualInfo.color, 0.1),
                          color: statusAtualInfo.color,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 600, color: '#9c27b0' }}>
                        {indicacao.status === 'confirmada'
                          ? `+${indicacao.pontosGanhos || 0}`
                          : `+${indicacao.pontosBonus || config.pontosIndicacao}`}
                      </Typography>
                      {indicacao.status === 'pendente' && !isExpirada && (
                        <Typography variant="caption" color="textSecondary">
                          (pendente)
                        </Typography>
                      )}
                      {isExpirada && (
                        <Typography variant="caption" color="error">
                          (expirada)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Copiar link">
                          <IconButton
                            size="small"
                            onClick={() => handleCopiarLink(indicacao)}
                            sx={{ color: '#9c27b0' }}
                            disabled={isExpirada}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="QR Code">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrirQRCode(indicacao)}
                            sx={{ color: '#9c27b0' }}
                            disabled={isExpirada}
                          >
                            <QrCodeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Informação de Bônus */}
      <Alert severity="info" sx={{ mt: 3 }} icon={<InfoIcon />}>
        <Typography variant="body2">
          <strong>Como funciona?</strong><br />
          • Indique um amigo compartilhando o link ou QR Code<br />
          • Quando ele se cadastrar e realizar o primeiro atendimento, você ganha <strong>{config.pontosIndicacao} pontos</strong><br />
          • Quanto mais indicações, mais pontos você acumula!
        </Typography>
      </Alert>

      {/* Dialog Nova Indicação */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Nova Indicação
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do indicado *"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Ao se cadastrar, o indicado ganhará um bônus e você receberá {config.pontosIndicacao} pontos quando a indicação for confirmada.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvarIndicacao} sx={{ bgcolor: '#9c27b0' }}>
            Registrar Indicação
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog QR Code */}
      <Dialog open={openQrCodeDialog} onClose={() => setOpenQrCodeDialog(false)} maxWidth="xs" fullWidth>
        {indicacaoSelecionada && indicacaoSelecionada.id && (
          <>
            <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white', textAlign: 'center' }}>
              QR Code da Indicação
            </DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <QRCodeCanvas
                  value={`${window.location.origin}/cadastro?indicacao=${indicacaoSelecionada.id}`}
                  size={256}
                  level="H"
                  includeMargin
                  style={{
                    margin: '0 auto',
                    padding: 16,
                    background: 'white',
                    borderRadius: 8,
                  }}
                />
                <Typography variant="body1" sx={{ mt: 2, fontWeight: 500 }}>
                  {indicacaoSelecionada.clienteIndicadoNome || 'Indicação'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Escaneie para cadastrar o indicado
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="contained"
                onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = `qrcode-indicacao-${indicacaoSelecionada.id}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                  }
                }}
                sx={{ bgcolor: '#9c27b0' }}
              >
                Download
              </Button>
              <Button onClick={() => setOpenQrCodeDialog(false)}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

function ClienteDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const { cliente, logout, loading: authLoading, firebaseUser } = useAuthCliente();
  const { fidelidadeAtiva } = useFidelidadeAtiva();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Dados do cliente
  const [agendamentos, setAgendamentos] = useState([]);
  const [pontuacoes, setPontuacoes] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [nivel, setNivel] = useState('bronze');
  const [proximosAgendamentos, setProximosAgendamentos] = useState([]);
  const [historicoAtendimentos, setHistoricoAtendimentos] = useState([]);
  const [recompensasDisponiveis, setRecompensasDisponiveis] = useState([]);
  const [resgatesRecentes, setResgatesRecentes] = useState([]);
  const [indicacoesResumo, setIndicacoesResumo] = useState({ total: 0, confirmadas: 0 });
  const [profissionais, setProfissionais] = useState([]);

  const niveis = {
    bronze: { cor: '#cd7f32', nome: 'Bronze', minimo: 0, proximo: 500, bg: '#fff3e0' },
    prata: { cor: '#c0c0c0', nome: 'Prata', minimo: 500, proximo: 2000, bg: '#f5f5f5' },
    ouro: { cor: '#ffd700', nome: 'Ouro', minimo: 2000, proximo: 5000, bg: '#fff9e6' },
    platina: { cor: '#e5e4e2', nome: 'Platina', minimo: 5000, proximo: null, bg: '#f0f0f0' },
  };

  useEffect(() => {
    if (!cliente && !authLoading) {
      navigate('/cliente/login');
    } else if (cliente) {
      carregarDados();
    }
  }, [cliente, authLoading]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const uid = firebaseUser?.uid;
      const clienteDocId = cliente?.id;

      if (!uid && !clienteDocId) {
        console.error('❌ IDs não encontrados');
        setError('Erro de autenticação. Faça login novamente.');
        return;
      }

      const idsParaBuscar = [];
      if (uid) idsParaBuscar.push(uid);
      if (clienteDocId && clienteDocId !== uid) idsParaBuscar.push(clienteDocId);

      const [
        profissionaisData,
        agendamentosData,
        pontuacoesData,
        recompensasData,
        resgatesData,
        atendimentosData,
        indicacoesData
      ] = await Promise.allSettled([
        firebaseService.getAll('profissionais'),
        Promise.all(idsParaBuscar.map(id =>
          firebaseService.query('agendamentos', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc')
        )),
        Promise.all(idsParaBuscar.map(id =>
          firebaseService.query('pontuacao', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc')
        )),
        firebaseService.query('recompensas', [
          { field: 'ativo', operator: '==', value: true }
        ]),
        Promise.all(idsParaBuscar.map(id =>
          firebaseService.query('resgates_fidelidade', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc')
        )),
        Promise.all(idsParaBuscar.map(id =>
          firebaseService.query('atendimentos', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'data', 'desc')
        )),
        Promise.all(idsParaBuscar.map(id =>
          firebaseService.query('indicacoes', [
            { field: 'clienteId', operator: '==', value: id }
          ], 'dataCriacao', 'desc')
        ))
      ]);

      if (profissionaisData.status === 'fulfilled') {
        setProfissionais(profissionaisData.value || []);
      }

      if (agendamentosData.status === 'fulfilled') {
        const todosAgendamentos = agendamentosData.value.flat();
        const agendamentosUnicos = Array.from(new Map(todosAgendamentos.map(item => [item.id, item])).values());
        setAgendamentos(agendamentosUnicos);
      }

      if (pontuacoesData.status === 'fulfilled') {
        const todasPontuacoes = pontuacoesData.value.flat();
        const pontuacoesUnicas = Array.from(new Map(todasPontuacoes.map(item => [item.id, item])).values());
        setPontuacoes(pontuacoesUnicas);
      }

      if (recompensasData.status === 'fulfilled') {
        const recompensasOrdenadas = (recompensasData.value || []).sort((a, b) =>
          ((a.pontosNecessarios ?? a.pontos ?? 0) - (b.pontosNecessarios ?? b.pontos ?? 0))
        );
        setRecompensasDisponiveis(recompensasOrdenadas.slice(0, 3));
      }

      if (resgatesData.status === 'fulfilled') {
        const todosResgates = resgatesData.value.flat();
        const resgatesUnicos = Array.from(new Map(todosResgates.map(item => [item.id, item])).values());
        setResgatesRecentes(resgatesUnicos);
      }

      if (atendimentosData.status === 'fulfilled') {
        const todosAtendimentos = atendimentosData.value.flat();
        const atendimentosUnicos = Array.from(new Map(todosAtendimentos.map(item => [item.id, item])).values());
        setHistoricoAtendimentos(atendimentosUnicos?.slice(0, 10) || []);
      }

      if (indicacoesData.status === 'fulfilled') {
        const todasIndicacoes = indicacoesData.value.flat();
        const indicacoesUnicas = Array.from(new Map(todasIndicacoes.map(item => [item.id, item])).values());
        setIndicacoesResumo({
          total: indicacoesUnicas.length,
          confirmadas: indicacoesUnicas.filter((item) => item.status === 'confirmada').length,
        });
      }

    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
      setError('Alguns dados não puderam ser carregados. Tente atualizar a página.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular saldo e nível
  useEffect(() => {
    const creditos = pontuacoes
      .filter(p => p.tipo === 'credito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);
    const debitos = pontuacoes
      .filter(p => p.tipo === 'debito')
      .reduce((acc, p) => acc + (p.quantidade || 0), 0);

    const debitosResgates = resgatesRecentes.reduce((acc, r) => acc + Number(r.pontosGastos || r.pontos || 0), 0);
    const saldoAtual = Math.max(0, creditos - Math.max(debitos, debitosResgates));
    setSaldo(saldoAtual);

    let nivelAtual = 'bronze';
    if (saldoAtual >= 5000) nivelAtual = 'platina';
    else if (saldoAtual >= 2000) nivelAtual = 'ouro';
    else if (saldoAtual >= 500) nivelAtual = 'prata';
    setNivel(nivelAtual);

    const hoje = getLocalDateInputValue();
    const proximos = agendamentos
      .filter(a => a.data >= hoje && a.status !== 'cancelado' && a.status !== 'finalizado')
      .sort((a, b) => a.data.localeCompare(b.data));
    setProximosAgendamentos(proximos.slice(0, 3));

  }, [pontuacoes, agendamentos, resgatesRecentes]);

  const handleLogout = () => {
    logout();
    navigate('/cliente/login');
  };

  const handleAgendar = () => {
    navigate('/cliente/agendamentos');
  };

  const handleVerRecompensas = () => {
    navigate('/cliente/recompensas');
  };

  const handleRefresh = () => {
    carregarDados();
  };

  const handlePontosAtualizados = (pontosGanhos) => {
    // Atualizar saldo quando houver mudança nos pontos por indicação
    carregarDados();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatarData = (data) => formatLocalDate(data, isMobile ? {
    day: '2-digit',
    month: '2-digit',
  } : {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formatarDataHora = (data) => {
    if (isMobile) {
      return formatLocalDateTime(data);
    }
    return formatLocalDateTime(data);
  };

  const getStatusColor = (status) => getAgendamentoStatusInfo(status).color;

  const getStatusLabel = (status) => {
    const info = getAgendamentoStatusInfo(status);
    return isMobile ? info.curto : info.label;
  };

  const getNivelInfo = () => {
    return niveis[nivel] || niveis.bronze;
  };

  const getPontosProximoNivel = () => {
    const info = getNivelInfo();
    return info.proximo ? info.proximo - saldo : 0;
  };

  const getProgressoProximoNivel = () => {
    const info = getNivelInfo();
    if (!info.proximo) return 100;
    return Math.min((saldo / info.proximo) * 100, 100);
  };

  const getProximoNivelNome = () => {
    if (nivel === 'bronze') return 'Prata';
    if (nivel === 'prata') return 'Ouro';
    if (nivel === 'ouro') return 'Platina';
    return null;
  };

  if (authLoading) {
    return <LoadingSkeleton />;
  }

  if (!cliente) {
    return null;
  }

  const nivelInfo = getNivelInfo();
  const pontosFaltantes = getPontosProximoNivel();
  const progresso = getProgressoProximoNivel();
  const proximoNivel = getProximoNivelNome();

  // Versão Mobile do Dashboard
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
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={cliente.foto}
              sx={{ width: 40, height: 40, bgcolor: '#9c27b0' }}
            >
              {!cliente.foto && getInitials(cliente.nome)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {cliente.nome?.split(' ')[0]}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {fidelidadeAtiva ? `${nivelInfo.nome} • ${saldo} pts` : 'Portal do cliente'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => navigate('/cliente/perfil')}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Conteúdo Principal Mobile */}
        <Box sx={{ p: 2 }}>
          {/* Card de Boas Vindas */}
          <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Olá, {cliente.nome?.split(' ')[0]}! 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {proximosAgendamentos.length > 0
                  ? `Você tem ${proximosAgendamentos.length} agendamento(s) agendados`
                  : 'Nenhum agendamento pendente'}
              </Typography>
            </CardContent>
          </Card>

          {/* Cards de Estatísticas */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', py: 1 }}>
                <CalendarIcon sx={{ color: '#9c27b0', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {proximosAgendamentos.length}
                </Typography>
                <Typography variant="caption">Agend.</Typography>
              </Card>
            </Grid>
            <Grid item xs={4} sx={{ display: fidelidadeAtiva ? 'block' : 'none' }}>
              <Card sx={{ textAlign: 'center', py: 1 }}>
                <StarIcon sx={{ color: '#ff9800', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {saldo}
                </Typography>
                <Typography variant="caption">Pontos</Typography>
              </Card>
            </Grid>
            <Grid item xs={4} sx={{ display: fidelidadeAtiva ? 'block' : 'none' }}>
              <Card sx={{ textAlign: 'center', py: 1 }}>
                <GiftIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {recompensasDisponiveis.length}
                </Typography>
                <Typography variant="caption">Recomp.</Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Card de Fidelidade */}
          <Card sx={{ mb: 2, bgcolor: nivelInfo.bg, display: fidelidadeAtiva ? 'block' : 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrophyIcon sx={{ fontSize: 40, color: nivelInfo.cor }} />
                <Box>
                  <Typography variant="subtitle2">Nível {nivelInfo.nome}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {saldo} pts
                  </Typography>
                </Box>
              </Box>
              {proximoNivel && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Progresso</Typography>
                    <Typography variant="caption">{pontosFaltantes} pts faltam</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progresso}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: nivelInfo.cor,
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Tabs Mobile */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Agendamentos" icon={<EventIcon />} iconPosition="start" />
              <Tab label="Histórico" icon={<HistoryIcon />} iconPosition="start" />
              <Tab sx={{ display: fidelidadeAtiva ? 'flex' : 'none' }} label="Resgates" icon={<GiftIcon />} iconPosition="start" />
              <Tab sx={{ display: fidelidadeAtiva ? 'flex' : 'none' }} label="Indicações" icon={<PersonAddIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0} isMobile>
            {loading ? (
              <CircularProgress />
            ) : proximosAgendamentos.length > 0 ? (
              <AnimatePresence>
                {proximosAgendamentos.map((agendamento, index) => (
                  <MobileCard key={agendamento.id || index}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {formatarData(agendamento.data)} • {agendamento.horario}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {agendamento.servicos?.[0]?.nome || agendamento.servicoNome}
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusLabel(agendamento.status)}
                          color={getStatusColor(agendamento.status)}
                          size="small"
                        />
                      </Box>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/cliente/agendamentos')}
                        sx={{ mt: 1, borderColor: '#9c27b0', color: '#9c27b0' }}
                      >
                        Ver detalhes
                      </Button>
                    </CardContent>
                  </MobileCard>
                ))}
              </AnimatePresence>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Nenhum agendamento futuro
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleAgendar}
                  sx={{ mt: 1, bgcolor: '#9c27b0' }}
                >
                  Agendar agora
                </Button>
              </Paper>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1} isMobile>
            {loading ? (
              <CircularProgress />
            ) : historicoAtendimentos.length > 0 ? (
              <AnimatePresence>
                {historicoAtendimentos.slice(0, 5).map((atend, index) => {
                  const profissional = profissionais.find(p => p.id === atend.profissionalId);
                  return (
                    <MobileCard key={atend.id || index}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {formatarData(atend.data)}
                          </Typography>
                          <Chip size="small" label="Realizado" color="success" />
                        </Box>
                        <Typography variant="body2">{atend.servicoNome}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            {profissional?.nome || 'Profissional'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#4caf50' }}>
                            R$ {atend.valorTotal?.toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </MobileCard>
                  );
                })}
              </AnimatePresence>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <HistoryIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Nenhum histórico encontrado
                </Typography>
              </Paper>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2} isMobile>
            {loading ? (
              <CircularProgress />
            ) : resgatesRecentes.length > 0 ? (
              <AnimatePresence>
                {resgatesRecentes.map((resgate, index) => (
                  <MobileCard key={resgate.id || index}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {resgate.recompensaNome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatarDataHora(resgate.data)}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`-${resgate.pontosGastos}`}
                          sx={{ bgcolor: '#ffebee', color: '#f44336' }}
                        />
                      </Box>
                    </CardContent>
                  </MobileCard>
                ))}
              </AnimatePresence>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <GiftIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Nenhum resgate realizado
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleVerRecompensas}
                  sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                >
                  Ver recompensas
                </Button>
              </Paper>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3} isMobile>
            <IndicacoesCliente
              clienteId={cliente.id || firebaseUser?.uid}
              clienteNome={cliente.nome}
              saldoPontos={saldo}
              onPontosAtualizados={handlePontosAtualizados}
            />
          </TabPanel>
        </Box>

        {/* FAB para ações rápidas */}
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              bgcolor: '#9c27b0',
              '&:hover': { bgcolor: '#7b1fa2' }
            }}
            onClick={handleAgendar}
          >
            <CalendarIcon />
          </Fab>
        </Zoom>
      </Box>
    );
  }

  // Versão Desktop
  return (
    <Box>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={cliente.foto}
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#9c27b0',
              border: '3px solid white',
              boxShadow: '0 4px 15px rgba(156,39,176,0.3)'
            }}
          >
            {!cliente.foto && getInitials(cliente.nome)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Olá, {cliente.nome?.split(' ')[0]}!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {cliente.email} • Cliente desde {formatarData(cliente.dataCadastro)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Atualizar">
            <IconButton onClick={handleRefresh} sx={{ color: '#9c27b0' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Configurações">
            <IconButton onClick={() => navigate('/cliente/perfil')} sx={{ color: '#9c27b0' }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sair">
            <IconButton onClick={handleLogout} sx={{ color: '#f44336' }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card sx={{ bgcolor: '#f3e5f5', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}><EventIcon /></Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                      {proximosAgendamentos.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Próximos agendamentos</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3} sx={{ display: fidelidadeAtiva ? 'block' : 'none' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}><StarIcon /></Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {saldo}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Pontos acumulados</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3} sx={{ display: fidelidadeAtiva ? 'block' : 'none' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card sx={{ bgcolor: '#e8f5e8', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}><GiftIcon /></Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {recompensasDisponiveis.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Recompensas disponíveis</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3} sx={{ display: fidelidadeAtiva ? 'block' : 'none' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card sx={{ bgcolor: '#f3e5f5', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}><PersonAddIcon /></Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                      {indicacoesResumo.total}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Indicações</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Card de Fidelidade */}
      <Card sx={{
        mb: 4,
        display: fidelidadeAtiva ? 'block' : 'none',
        background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
      }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'white' }}>
                <TrophyIcon sx={{ fontSize: 64 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Nível {nivelInfo.nome.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {saldo} pontos acumulados
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {proximoNivel && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'white' }}>
                    <Typography variant="body2">Progresso para Nível {proximoNivel}</Typography>
                    <Typography variant="body2">{pontosFaltantes} pontos faltam</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progresso}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                      },
                    }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Próximos Agendamentos" />
          <Tab label="Histórico" />
          <Tab sx={{ display: fidelidadeAtiva ? 'flex' : 'none' }} label="Resgates" />
          <Tab sx={{ display: fidelidadeAtiva ? 'flex' : 'none' }} label="Indicações" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0} isMobile={false}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Seus Agendamentos</Typography>
                {loading ? (
                  <CircularProgress />
                ) : proximosAgendamentos.length > 0 ? (
                  proximosAgendamentos.map((agendamento, index) => (
                    <Card key={agendamento.id || index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon sx={{ color: '#9c27b0' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {formatarData(agendamento.data)} às {agendamento.horario || '--:--'}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {agendamento.servicos?.[0]?.nome || agendamento.servicoNome}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Chip label={getStatusLabel(agendamento.status)} color={getStatusColor(agendamento.status)} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Button variant="outlined" size="small" fullWidth sx={{ borderColor: '#9c27b0', color: '#9c27b0' }} onClick={() => navigate('/cliente/agendamentos')}>Detalhes</Button>
                        </Grid>
                      </Grid>
                    </Card>
                  ))
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary" gutterBottom>Você não tem agendamentos futuros</Typography>
                    <Button variant="contained" onClick={handleAgendar} sx={{ mt: 2, bgcolor: '#9c27b0' }}>Agendar Agora</Button>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: fidelidadeAtiva ? 'block' : 'none' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Recompensas em Destaque</Typography>
                {loading ? (
                  <CircularProgress />
                ) : recompensasDisponiveis.length > 0 ? (
                  recompensasDisponiveis.map((recompensa, index) => (
                    <Card key={recompensa.id || index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <GiftIcon sx={{ color: '#ff9800' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{recompensa.nome}</Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary" display="block">{recompensa.descricao}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Chip size="small" label={`${recompensa.pontosNecessarios ?? recompensa.pontos ?? 0} pontos`} sx={{ bgcolor: saldo >= (recompensa.pontosNecessarios ?? recompensa.pontos ?? 0) ? '#e8f5e8' : '#fff3e0', color: saldo >= (recompensa.pontosNecessarios ?? recompensa.pontos ?? 0) ? '#4caf50' : '#ff9800' }} />
                        <Button size="small" sx={{ color: '#9c27b0' }} onClick={() => navigate('/cliente/recompensas')}>Ver</Button>
                      </Box>
                    </Card>
                  ))
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">Nenhuma recompensa disponível no momento</Typography>
                  </Paper>
                )}
                <Button fullWidth variant="outlined" onClick={handleVerRecompensas} sx={{ mt: 2, borderColor: '#9c27b0', color: '#9c27b0' }}>Ver Todas as Recompensas</Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1} isMobile={false}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Histórico de Atendimentos</Typography>
            {loading ? (
              <CircularProgress />
            ) : historicoAtendimentos.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Serviço</TableCell>
                      <TableCell>Profissional</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell sx={{ display: fidelidadeAtiva ? 'table-cell' : 'none' }} align="right">Pontos</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historicoAtendimentos.map((atendimento, index) => {
                      const profissional = profissionais.find(p => p.id === atendimento.profissionalId);
                      return (
                        <TableRow key={atendimento.id || index}>
                          <TableCell>{formatarData(atendimento.data)}</TableCell>
                          <TableCell>{atendimento.servicoNome}</TableCell>
                          <TableCell>{profissional?.nome || 'Profissional'}</TableCell>
                          <TableCell align="right">R$ {atendimento.valorTotal?.toFixed(2)}</TableCell>
                          <TableCell sx={{ display: fidelidadeAtiva ? 'table-cell' : 'none' }} align="right"><Chip size="small" label={`+${atendimento.pontosGanhos || 0}`} sx={{ bgcolor: '#fff3e0', color: '#ff9800' }} /></TableCell>
                          <TableCell align="center"><Chip size="small" label="Realizado" color="success" /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">Nenhum histórico de atendimentos encontrado</Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2} isMobile={false}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Histórico de Resgates</Typography>
            {loading ? (
              <CircularProgress />
            ) : resgatesRecentes.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Recompensa</TableCell>
                      <TableCell align="right">Pontos Gastos</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resgatesRecentes.map((resgate, index) => (
                      <TableRow key={resgate.id || index}>
                        <TableCell>{formatarDataHora(resgate.data)}</TableCell>
                        <TableCell>{resgate.recompensaNome}</TableCell>
                        <TableCell align="right"><Chip size="small" label={`-${resgate.pontosGastos || 0}`} sx={{ bgcolor: '#ffebee', color: '#f44336' }} /></TableCell>
                        <TableCell align="center"><Chip size="small" label={resgate.utilizado ? 'Utilizado' : 'Disponível'} color={resgate.utilizado ? 'default' : 'success'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <GiftIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">Você ainda não resgatou nenhuma recompensa</Typography>
                <Button variant="outlined" onClick={handleVerRecompensas} sx={{ mt: 2, borderColor: '#9c27b0', color: '#9c27b0' }}>Ver Recompensas Disponíveis</Button>
              </Paper>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={3} isMobile={false}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Minhas Indicações</Typography>
            <IndicacoesCliente
              clienteId={cliente.id || firebaseUser?.uid}
              clienteNome={cliente.nome}
              saldoPontos={saldo}
              onPontosAtualizados={handlePontosAtualizados}
            />
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}

export default ClienteDashboard;
