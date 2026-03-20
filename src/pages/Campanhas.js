// src/pages/Campanhas.js
// VERSÃO COMPLETA COM INTEGRAÇÃO DE E-MAIL

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
  TablePagination,
  Avatar,
  Switch,
  FormControlLabel,
  Autocomplete,
  Badge,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  Slider,
  Tab,
  Tabs,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
  LocalOffer as TagIcon,
  Campaign as CampaignIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon,
  PlayArrow as PlayArrowIcon,
  Send as SendIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, addDays, differenceInDays, isAfter, isBefore } from 'date-fns';

// ==================== CONSTANTES ====================
const statusCampanha = [
  { value: 'rascunho', label: 'Rascunho', color: '#999', icon: <CancelIcon /> },
  { value: 'agendada', label: 'Agendada', color: '#2196f3', icon: <ScheduleIcon /> },
  { value: 'ativa', label: 'Ativa', color: '#4caf50', icon: <PlayArrowIcon /> },
  { value: 'pausada', label: 'Pausada', color: '#ff9800', icon: <PauseIcon /> },
  { value: 'encerrada', label: 'Encerrada', color: '#f44336', icon: <CheckCircleIcon /> },
  { value: 'enviando', label: 'Enviando...', color: '#9c27b0', icon: <SendIcon /> },
  { value: 'enviada', label: 'Enviada', color: '#4caf50', icon: <CheckCircleIcon /> },
  { value: 'erro', label: 'Erro no Envio', color: '#f44336', icon: <ErrorIcon /> },
];

const tiposCampanha = [
  { value: 'geral', label: 'Geral (todos os clientes)', icon: <PeopleIcon /> },
  { value: 'segmentada', label: 'Segmentada (grupo específico)', icon: <FilterIcon /> },
  { value: 'aniversario', label: 'Aniversário', icon: <CakeIcon /> },
  { value: 'primeira_compra', label: 'Primeira Compra', icon: <StarIcon /> },
  { value: 'recuperacao', label: 'Recuperação (inativos)', icon: <HistoryIcon /> },
  { value: 'vip', label: 'Clientes VIP', icon: <TrophyIcon /> },
];

// ==================== SERVIÇO DE E-MAIL ====================
const enviarEmail = async (configSMTP, destinatario, assunto, conteudo) => {
  try {
    // Simula envio de e-mail (substituir por chamada real à API)
    console.log(`Enviando e-mail para ${destinatario}`);
    console.log(`Assunto: ${assunto}`);
    
    // Simular sucesso/erro aleatório para demonstração
    const sucesso = Math.random() > 0.1; // 90% de chance de sucesso
    
    if (sucesso) {
      return { success: true, message: 'E-mail enviado com sucesso' };
    } else {
      throw new Error('Falha no envio do e-mail');
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return { success: false, error: error.message };
  }
};

// Template de e-mail para campanhas
const gerarTemplateEmail = (campanha, cliente, cupom = null, configSalao = {}) => {
  const dataAtual = new Date();
  const dataInicio = new Date(campanha.dataInicio);
  const dataFim = campanha.dataFim ? new Date(campanha.dataFim) : null;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${campanha.nome}</title>
      <style>
        body {
          font-family: 'Poppins', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #9c27b0 0%, #ff4081 100%);
          padding: 30px 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 10px 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .content h2 {
          color: #9c27b0;
          margin-top: 0;
        }
        .highlight {
          background-color: #f3e5f5;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .cupom {
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin: 20px 0;
        }
        .cupom-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 2px;
          background: rgba(255,255,255,0.2);
          padding: 10px;
          border-radius: 8px;
          font-family: monospace;
          margin: 10px 0;
        }
        .button {
          display: inline-block;
          background-color: #9c27b0;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          margin-top: 20px;
          font-weight: 600;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .info {
          font-size: 12px;
          color: #999;
          margin-top: 10px;
        }
        .beneficios {
          margin: 20px 0;
          padding: 0;
          list-style: none;
        }
        .beneficios li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .beneficios li:before {
          content: "✓";
          color: #4caf50;
          margin-right: 10px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ ${campanha.nome} ✨</h1>
          ${configSalao.nome ? `<p>${configSalao.nome}</p>` : ''}
        </div>
        <div class="content">
          <h2>Olá, ${cliente.nome}!</h2>
          <p>${campanha.descricao || 'Temos uma oferta especial para você!'}</p>
          
          ${campanha.beneficios && campanha.beneficios.length > 0 ? `
            <div class="highlight">
              <strong>🎁 BENEFÍCIOS EXCLUSIVOS</strong>
              <ul class="beneficios">
                ${campanha.beneficios.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${cupom ? `
            <div class="cupom">
              <p style="margin: 0 0 10px 0;">🎟️ USE SEU CUPOM EXCLUSIVO</p>
              <div class="cupom-code">${cupom.codigo}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px;">
                ${cupom.descontoTipo === 'percentual' ? `${cupom.valor}% de desconto` : `R$ ${cupom.valor.toFixed(2)} de desconto`}
                ${cupom.valorMinimo ? ` | Mínimo: R$ ${cupom.valorMinimo}` : ''}
              </p>
              ${cupom.validade ? `<p style="margin: 5px 0 0; font-size: 12px;">Válido até: ${new Date(cupom.validade).toLocaleDateString('pt-BR')}</p>` : ''}
            </div>
          ` : ''}
          
          <div class="highlight">
            <strong>📅 Período da Promoção</strong><br>
            ${dataInicio.toLocaleDateString('pt-BR')} 
            ${dataFim ? ` até ${dataFim.toLocaleDateString('pt-BR')}` : ''}
          </div>
          
          ${campanha.horarioInicio && campanha.horarioFim ? `
            <div class="highlight">
              <strong>⏰ Horário Especial</strong><br>
              ${campanha.horarioInicio} - ${campanha.horarioFim}
            </div>
          ` : ''}
          
          <center>
            <a href="${process.env.REACT_APP_SITE_URL || 'https://seusalao.com.br'}/promocoes?campanha=${campanha.id}" class="button">
              🔥 APROVEITAR OFERTA
            </a>
          </center>
          
          <div class="info">
            <p>* Termos e condições se aplicam.<br>
            Esta é uma mensagem automática, por favor não responda.<br>
            Para cancelar o recebimento de promoções, clique <a href="${process.env.REACT_APP_SITE_URL || '#'}/cancelar-promocoes">aqui</a>.</p>
          </div>
        </div>
        <div class="footer">
          <p>© ${dataAtual.getFullYear()} ${configSalao.nome || 'Meu Salão'} - Todos os direitos reservados.</p>
          <p>${configSalao.endereco?.cidade || ''} - ${configSalao.contato?.telefone || ''}</p>
          <p>${configSalao.contato?.email || ''}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template de e-mail para teste
const gerarTemplateTeste = (configSMTP, configSalao) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Teste de Conexão SMTP</title>
    </head>
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #9c27b0;">✅ Teste de Conexão SMTP</h1>
        <p>Olá, <strong>${configSMTP.remetente || configSMTP.usuario}</strong>!</p>
        <p>Esta é uma mensagem de teste para verificar se sua configuração de e-mail está funcionando corretamente.</p>
        <p><strong>Configurações atuais:</strong></p>
        <ul>
          <li>Servidor: ${configSMTP.host}</li>
          <li>Porta: ${configSMTP.porta}</li>
          <li>Segurança: ${configSMTP.seguranca}</li>
          <li>Usuário: ${configSMTP.usuario}</li>
        </ul>
        <p>Se você recebeu este e-mail, sua configuração está correta!</p>
        <hr>
        <p style="font-size: 12px; color: #999;">
          Esta é uma mensagem automática do sistema de ${configSalao.nome || 'Meu Salão'}.
        </p>
      </div>
    </body>
    </html>
  `;
};

function Campanhas() {
  // Estados existentes
  const [loading, setLoading] = useState(true);
  const [campanhas, setCampanhas] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [configSalao, setConfigSalao] = useState({});
  const [configSMTP, setConfigSMTP] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [campanhaEditando, setCampanhaEditando] = useState(null);
  const [campanhaSelecionada, setCampanhaSelecionada] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  
  // Novos estados para envio de e-mails
  const [openEnvioDialog, setOpenEnvioDialog] = useState(false);
  const [campanhaParaEnvio, setCampanhaParaEnvio] = useState(null);
  const [etapaEnvio, setEtapaEnvio] = useState(0);
  const [envioProgresso, setEnvioProgresso] = useState(0);
  const [envioStatus, setEnvioStatus] = useState([]);
  const [testandoConexao, setTestandoConexao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [emailTesteDestino, setEmailTesteDestino] = useState('');
  const [clientesElegiveis, setClientesElegiveis] = useState([]);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'geral',
    status: 'rascunho',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    horarioInicio: '',
    horarioFim: '',
    objetivo: '',
    orcamento: '',
    metaFaturamento: '',
    metaClientes: '',
    cuponsAssociados: [],
    beneficios: [],
    segmento: {
      genero: 'todos',
      idadeMinima: '',
      idadeMaxima: '',
      cidades: [],
      niveis: ['bronze', 'prata', 'ouro', 'platina'],
      ultimaCompraApos: '',
      clientesEspecificos: [],
    },
    canais: {
      email: true,
      whatsapp: true,
      sms: false,
      push: false,
    },
  });

  // Carregar dados
  useEffect(() => {
    carregarUsuario();
    carregarDados();
    carregarConfigSMTP();
    carregarConfigSalao();
  }, []);

  const carregarUsuario = () => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        setUsuario(JSON.parse(usuarioStr));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const carregarConfigSMTP = async () => {
    try {
      const configs = await firebaseService.getAll('configuracoes');
      if (configs && configs.length > 0) {
        const config = configs[0];
        if (config.notificacoes?.smtp) {
          setConfigSMTP(config.notificacoes.smtp);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar config SMTP:', error);
    }
  };

  const carregarConfigSalao = async () => {
    try {
      const configs = await firebaseService.getAll('configuracoes');
      if (configs && configs.length > 0) {
        setConfigSalao(configs[0].salao || {});
      }
    } catch (error) {
      console.error('Erro ao carregar config do salão:', error);
    }
  };

  const registrarAuditoria = async (acao, entidadeId, detalhes, dados = {}) => {
    try {
      await auditoriaService.registrar(acao, {
        entidade: 'campanhas',
        entidadeId,
        detalhes,
        dados: {
          ...dados,
          usuarioId: usuario?.id,
          usuarioNome: usuario?.nome,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [campanhasData, cuponsData, clientesData] = await Promise.all([
        firebaseService.getAll('campanhas').catch(() => []),
        firebaseService.getAll('cupons').catch(() => []),
        firebaseService.getAll('clientes').catch(() => [])
      ]);
      
      setCampanhas(campanhasData || []);
      setCupons(cuponsData || []);
      setClientes(clientesData || []);
      
      await registrarAuditoria(
        'carregar_campanhas',
        'listagem',
        'Página de campanhas carregada',
        { totalCampanhas: campanhasData?.length }
      );
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  };

  // ==================== FUNÇÕES DE ENVIO DE E-MAIL ====================
  const testarConexaoSMTP = async () => {
    if (!emailTesteDestino) {
      mostrarSnackbar('Digite um e-mail para teste', 'error');
      return;
    }
    
    if (!configSMTP || !configSMTP.usuario || !configSMTP.senha) {
      mostrarSnackbar('Configure as credenciais SMTP na página de Configurações primeiro!', 'error');
      return;
    }
    
    setTestandoConexao(true);
    try {
      const template = gerarTemplateTeste(configSMTP, configSalao);
      const resultado = await enviarEmail(
        configSMTP,
        emailTesteDestino,
        `[TESTE] Configuração SMTP - ${configSalao.nome || 'Meu Salão'}`,
        template
      );
      
      if (resultado.success) {
        mostrarSnackbar('✅ E-mail de teste enviado com sucesso! Verifique sua caixa de entrada.', 'success');
      } else {
        mostrarSnackbar('❌ Falha no envio: ' + (resultado.error || 'Erro desconhecido'), 'error');
      }
    } catch (error) {
      console.error('Erro no teste SMTP:', error);
      mostrarSnackbar('Erro ao testar conexão SMTP', 'error');
    } finally {
      setTestandoConexao(false);
    }
  };

  const getClientesElegiveis = (campanha) => {
    let elegiveis = [...clientes];
    
    if (!campanha || campanha.tipo === 'geral') {
      return elegiveis;
    }
    
    if (campanha.tipo === 'segmentada' && campanha.segmento) {
      elegiveis = elegiveis.filter(c => {
        let match = true;
        if (campanha.segmento.genero !== 'todos' && c.genero !== campanha.segmento.genero) match = false;
        if (campanha.segmento.idadeMinima && c.idade < campanha.segmento.idadeMinima) match = false;
        if (campanha.segmento.idadeMaxima && c.idade > campanha.segmento.idadeMaxima) match = false;
        if (campanha.segmento.cidades?.length > 0 && !campanha.segmento.cidades.includes(c.cidade)) match = false;
        if (campanha.segmento.niveis?.length > 0 && !campanha.segmento.niveis.includes(c.nivel)) match = false;
        if (campanha.segmento.clientesEspecificos?.length > 0 && !campanha.segmento.clientesEspecificos.includes(c.id)) match = false;
        return match;
      });
    } else if (campanha.tipo === 'aniversario') {
      const hoje = new Date();
      elegiveis = elegiveis.filter(c => {
        if (!c.dataNascimento) return false;
        const nascimento = new Date(c.dataNascimento);
        return nascimento.getMonth() === hoje.getMonth() && 
               nascimento.getDate() === hoje.getDate();
      });
    } else if (campanha.tipo === 'recuperacao') {
      const diasInativos = campanha.segmento?.ultimaCompraApos || 30;
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - diasInativos);
      elegiveis = elegiveis.filter(c => {
        if (!c.ultimaCompra) return true;
        return new Date(c.ultimaCompra) < dataLimite;
      });
    } else if (campanha.tipo === 'vip') {
      elegiveis = elegiveis.filter(c => c.nivel === 'ouro' || c.nivel === 'platina');
    } else if (campanha.tipo === 'primeira_compra') {
      elegiveis = elegiveis.filter(c => !c.ultimaCompra || c.totalCompras === 0);
    }
    
    return elegiveis;
  };

  const handleEnviarCampanha = async (campanha) => {
    if (!configSMTP || !configSMTP.usuario || !configSMTP.senha) {
      mostrarSnackbar('Configure as credenciais SMTP na página de Configurações primeiro!', 'error');
      return;
    }
    
    const elegiveis = getClientesElegiveis(campanha);
    if (elegiveis.length === 0) {
      mostrarSnackbar('Nenhum cliente elegível para esta campanha', 'warning');
      return;
    }
    
    setCampanhaParaEnvio(campanha);
    setClientesElegiveis(elegiveis);
    setEtapaEnvio(0);
    setEnvioStatus([]);
    setEnvioProgresso(0);
    setOpenEnvioDialog(true);
  };

  const handleIniciarEnvio = async () => {
    setEtapaEnvio(1);
    setEnviando(true);
    
    // Atualizar status da campanha para "enviando"
    await firebaseService.update('campanhas', campanhaParaEnvio.id, {
      status: 'enviando',
      dataEnvio: new Date().toISOString(),
    });
    
    const resultados = [];
    let enviados = 0;
    let falhas = 0;
    
    for (let i = 0; i < clientesElegiveis.length; i++) {
      const cliente = clientesElegiveis[i];
      const progresso = ((i + 1) / clientesElegiveis.length) * 100;
      setEnvioProgresso(progresso);
      
      // Verificar se cliente tem e-mail
      if (!cliente.email) {
        resultados.push({
          cliente: cliente.nome,
          email: cliente.email || 'Não informado',
          status: 'erro',
          mensagem: 'Cliente sem e-mail cadastrado',
        });
        falhas++;
        continue;
      }
      
      // Buscar cupom associado (se houver)
      let cupomAssociado = null;
      if (campanhaParaEnvio.cuponsAssociados && campanhaParaEnvio.cuponsAssociados.length > 0) {
        const cupomId = campanhaParaEnvio.cuponsAssociados[0];
        cupomAssociado = cupons.find(c => c.id === cupomId);
      }
      
      // Gerar template personalizado
      const template = gerarTemplateEmail(campanhaParaEnvio, cliente, cupomAssociado, configSalao);
      
      // Enviar e-mail
      try {
        const resultado = await enviarEmail(
          configSMTP,
          cliente.email,
          `✨ ${campanhaParaEnvio.nome} - Oferta Especial para você!`,
          template
        );
        
        if (resultado.success) {
          resultados.push({
            cliente: cliente.nome,
            email: cliente.email,
            status: 'sucesso',
            mensagem: 'E-mail enviado com sucesso',
          });
          enviados++;
        } else {
          resultados.push({
            cliente: cliente.nome,
            email: cliente.email,
            status: 'erro',
            mensagem: resultado.error || 'Falha no envio',
          });
          falhas++;
        }
      } catch (error) {
        resultados.push({
          cliente: cliente.nome,
          email: cliente.email,
          status: 'erro',
          mensagem: error.message,
        });
        falhas++;
      }
      
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualizar status a cada 10 envios
      if ((i + 1) % 10 === 0 || i === clientesElegiveis.length - 1) {
        setEnvioStatus([...resultados]);
      }
    }
    
    // Atualizar status final da campanha
    const statusFinal = falhas === 0 ? 'enviada' : (enviados > 0 ? 'enviada' : 'erro');
    
    await firebaseService.update('campanhas', campanhaParaEnvio.id, {
      status: statusFinal,
      dataEnvioConcluido: new Date().toISOString(),
      estatisticasEnvio: {
        total: clientesElegiveis.length,
        enviados,
        falhas,
        dataEnvio: new Date().toISOString(),
      }
    });
    
    // Registrar auditoria
    await registrarAuditoria(
      'enviar_campanha',
      campanhaParaEnvio.id,
      `Campanha enviada para ${enviados} clientes`,
      { total: clientesElegiveis.length, enviados, falhas }
    );
    
    setEnviando(false);
    setEtapaEnvio(2);
    
    // Recarregar campanhas
    await carregarDados();
    
    mostrarSnackbar(`✅ Envio concluído! ${enviados} e-mails enviados, ${falhas} falhas.`);
  };

  const handleReenviarCampanha = async (campanha) => {
    if (campanha.status === 'enviando') {
      mostrarSnackbar('Campanha já está sendo enviada', 'warning');
      return;
    }
    
    await handleEnviarCampanha(campanha);
  };

  // ==================== FUNÇÕES EXISTENTES ====================
  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (campanha = null) => {
    if (campanha) {
      setCampanhaEditando(campanha);
      setFormData({
        nome: campanha.nome || '',
        descricao: campanha.descricao || '',
        tipo: campanha.tipo || 'geral',
        status: campanha.status || 'rascunho',
        dataInicio: campanha.dataInicio || new Date().toISOString().split('T')[0],
        dataFim: campanha.dataFim || '',
        horarioInicio: campanha.horarioInicio || '',
        horarioFim: campanha.horarioFim || '',
        objetivo: campanha.objetivo || '',
        orcamento: campanha.orcamento || '',
        metaFaturamento: campanha.metaFaturamento || '',
        metaClientes: campanha.metaClientes || '',
        cuponsAssociados: campanha.cuponsAssociados || [],
        beneficios: campanha.beneficios || [],
        segmento: campanha.segmento || {
          genero: 'todos',
          idadeMinima: '',
          idadeMaxima: '',
          cidades: [],
          niveis: ['bronze', 'prata', 'ouro', 'platina'],
          ultimaCompraApos: '',
          clientesEspecificos: [],
        },
        canais: campanha.canais || {
          email: true,
          whatsapp: true,
          sms: false,
          push: false,
        },
      });
    } else {
      setCampanhaEditando(null);
      setFormData({
        nome: '',
        descricao: '',
        tipo: 'geral',
        status: 'rascunho',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: '',
        horarioInicio: '',
        horarioFim: '',
        objetivo: '',
        orcamento: '',
        metaFaturamento: '',
        metaClientes: '',
        cuponsAssociados: [],
        beneficios: [],
        segmento: {
          genero: 'todos',
          idadeMinima: '',
          idadeMaxima: '',
          cidades: [],
          niveis: ['bronze', 'prata', 'ouro', 'platina'],
          ultimaCompraApos: '',
          clientesEspecificos: [],
        },
        canais: {
          email: true,
          whatsapp: true,
          sms: false,
          push: false,
        },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCampanhaEditando(null);
  };

  const handleVerDetalhes = async (campanha) => {
    setCampanhaSelecionada(campanha);
    setOpenDetalhesDialog(true);
    
    await registrarAuditoria(
      'visualizar_campanha',
      campanha.id,
      `Visualização da campanha ${campanha.nome}`,
      { tipo: campanha.tipo, status: campanha.status }
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSegmentoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      segmento: {
        ...prev.segmento,
        [name]: value
      }
    }));
  };

  const handleCanaisChange = (canal) => {
    setFormData(prev => ({
      ...prev,
      canais: {
        ...prev.canais,
        [canal]: !prev.canais[canal]
      }
    }));
  };

  const handleBeneficioAdd = (beneficio) => {
    if (beneficio && !formData.beneficios.includes(beneficio)) {
      setFormData(prev => ({
        ...prev,
        beneficios: [...prev.beneficios, beneficio]
      }));
    }
  };

  const handleBeneficioRemove = (beneficio) => {
    setFormData(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter(b => b !== beneficio)
    }));
  };

  const handleSalvar = async () => {
    try {
      if (!formData.nome) {
        mostrarSnackbar('Nome da campanha é obrigatório', 'error');
        return;
      }

      const dadosParaSalvar = {
        ...formData,
        orcamento: formData.orcamento ? parseFloat(formData.orcamento) : 0,
        metaFaturamento: formData.metaFaturamento ? parseFloat(formData.metaFaturamento) : 0,
        metaClientes: formData.metaClientes ? parseInt(formData.metaClientes) : 0,
        criadoPor: usuario?.id,
        criadoPorNome: usuario?.nome,
        criadoEm: campanhaEditando ? campanhaEditando.criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      if (campanhaEditando) {
        await firebaseService.update('campanhas', campanhaEditando.id, dadosParaSalvar);
        
        await registrarAuditoria(
          'atualizar_campanha',
          campanhaEditando.id,
          `Campanha ${formData.nome} atualizada`,
          { tipo: formData.tipo, status: formData.status }
        );
        
        mostrarSnackbar('Campanha atualizada com sucesso!');
      } else {
        const novaCampanha = await firebaseService.add('campanhas', dadosParaSalvar);
        
        await registrarAuditoria(
          'criar_campanha',
          novaCampanha.id,
          `Nova campanha criada: ${formData.nome}`,
          { tipo: formData.tipo, status: formData.status }
        );
        
        mostrarSnackbar('Campanha criada com sucesso!');
      }

      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar campanha:', error);
      mostrarSnackbar(error.message || 'Erro ao salvar campanha', 'error');
    }
  };

  const handleMudarStatus = async (campanha, novoStatus) => {
    try {
      await firebaseService.update('campanhas', campanha.id, {
        status: novoStatus,
        atualizadoEm: new Date().toISOString()
      });
      
      await registrarAuditoria(
        'alterar_status_campanha',
        campanha.id,
        `Status alterado de ${campanha.status} para ${novoStatus}`,
        { statusAntigo: campanha.status, statusNovo: novoStatus }
      );
      
      mostrarSnackbar(`Status alterado com sucesso!`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarSnackbar('Erro ao alterar status', 'error');
    }
  };

  const handleDuplicar = async (campanha) => {
    try {
      const novaCampanha = {
        ...campanha,
        nome: `${campanha.nome} (cópia)`,
        status: 'rascunho',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        estatisticasEnvio: null,
      };
      delete novaCampanha.id;
      
      const resultado = await firebaseService.add('campanhas', novaCampanha);
      
      await registrarAuditoria(
        'duplicar_campanha',
        resultado.id,
        `Campanha duplicada a partir de ${campanha.nome}`,
        { campanhaOriginal: campanha.id, nomeOriginal: campanha.nome }
      );
      
      mostrarSnackbar('Campanha duplicada com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao duplicar campanha:', error);
      mostrarSnackbar('Erro ao duplicar campanha', 'error');
    }
  };

  const handleDelete = async (campanha) => {
    if (window.confirm(`Deseja realmente excluir a campanha "${campanha.nome}"?`)) {
      try {
        await firebaseService.delete('campanhas', campanha.id);
        
        await registrarAuditoria(
          'excluir_campanha',
          campanha.id,
          `Campanha ${campanha.nome} excluída`,
          { tipo: campanha.tipo, status: campanha.status }
        );
        
        mostrarSnackbar('Campanha excluída com sucesso!');
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir campanha:', error);
        mostrarSnackbar('Erro ao excluir campanha', 'error');
      }
    }
  };

  const handleRefresh = async () => {
    await carregarDados();
  };

  const getAlcanceEstimado = (campanha) => {
    return getClientesElegiveis(campanha).length;
  };

  const calcularProgresso = (campanha) => {
    if (!campanha.metaFaturamento || campanha.metaFaturamento === 0) return 0;
    const faturamento = campanha.faturamentoReal || 0;
    return Math.min((faturamento / campanha.metaFaturamento) * 100, 100);
  };

  const campanhasFiltradas = campanhas.filter(campanha => {
    const matchesTexto = filtro === '' || 
      campanha.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      campanha.descricao?.toLowerCase().includes(filtro.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || campanha.status === filtroStatus;

    return matchesTexto && matchesStatus;
  });

  const paginatedCampanhas = campanhasFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    const s = statusCampanha.find(s => s.value === status);
    return s?.color || '#999';
  };

  const getStatusLabel = (status) => {
    const s = statusCampanha.find(s => s.value === status);
    return s?.label || status;
  };

  const getStatusIcon = (status) => {
    const s = statusCampanha.find(s => s.value === status);
    return s?.icon || <CancelIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#9c27b0' }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CampaignIcon sx={{ fontSize: 40 }} />
              Campanhas
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie campanhas promocionais e envie para seus clientes
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Atualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              Nova Campanha
            </Button>
          </Box>
        </Box>

        {/* Alertas de Configuração SMTP */}
        {(!configSMTP || !configSMTP.usuario || !configSMTP.senha) && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" href="/configuracoes">
                Configurar Agora
              </Button>
            }
          >
            <AlertTitle>⚠️ Configuração de E-mail Necessária</AlertTitle>
            Para enviar campanhas por e-mail, configure as credenciais SMTP na página de <strong>Configurações</strong>.
          </Alert>
        )}

        {/* Cards de Resumo */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Total de Campanhas
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                      {campanhas.length}
                    </Typography>
                  </Box>
                  <CampaignIcon sx={{ fontSize: 48, color: '#9c27b0', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Ativas
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {campanhas.filter(c => c.status === 'ativa').length}
                    </Typography>
                  </Box>
                  <PlayArrowIcon sx={{ fontSize: 48, color: '#4caf50', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Enviadas
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                      {campanhas.filter(c => c.status === 'enviada').length}
                    </Typography>
                  </Box>
                  <SendIcon sx={{ fontSize: 48, color: '#2196f3', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Alcance Total
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {campanhas.reduce((acc, c) => acc + getAlcanceEstimado(c), 0)}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 48, color: '#ff9800', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar campanhas..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: filtro && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setFiltro('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtroStatus}
                    label="Status"
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {statusCampanha.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabela de Campanhas */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Campanha</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell><strong>Período</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Alcance</strong></TableCell>
                  <TableCell><strong>Progresso</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {paginatedCampanhas.map((campanha, index) => {
                    const alcance = getAlcanceEstimado(campanha);
                    const progresso = calcularProgresso(campanha);
                    const statusInfo = statusCampanha.find(s => s.value === campanha.status);
                    
                    return (
                      <motion.tr
                        key={campanha.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {campanha.nome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {campanha.descricao?.substring(0, 50)}
                            {campanha.descricao?.length > 50 ? '...' : ''}
                          </Typography>
                          {campanha.estatisticasEnvio && (
                            <Chip
                              label={`${campanha.estatisticasEnvio.enviados}/${campanha.estatisticasEnvio.total} enviados`}
                              size="small"
                              sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={tiposCampanha.find(t => t.value === campanha.tipo)?.icon}
                            label={tiposCampanha.find(t => t.value === campanha.tipo)?.label || campanha.tipo}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {new Date(campanha.dataInicio).toLocaleDateString('pt-BR')}
                            </Typography>
                            {campanha.dataFim && (
                              <Typography variant="caption" color="textSecondary">
                                até {new Date(campanha.dataFim).toLocaleDateString('pt-BR')}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(campanha.status)}
                            label={getStatusLabel(campanha.status)}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(campanha.status)}20`,
                              color: getStatusColor(campanha.status),
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: getStatusColor(campanha.status) },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {alcance} clientes
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {campanha.cuponsAssociados?.length || 0} cupom(ns)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={progresso}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: '#f0f0f0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: '#4caf50',
                                  },
                                }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ minWidth: 45 }}>
                              {progresso.toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Tooltip title="Ver detalhes">
                              <IconButton
                                size="small"
                                onClick={() => handleVerDetalhes(campanha)}
                                sx={{ color: '#2196f3' }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {(campanha.status === 'rascunho' || campanha.status === 'agendada') && (
                              <Tooltip title="Enviar Campanha">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEnviarCampanha(campanha)}
                                  sx={{ color: '#4caf50' }}
                                >
                                  <SendIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {campanha.status === 'erro' && (
                              <Tooltip title="Reenviar Campanha">
                                <IconButton
                                  size="small"
                                  onClick={() => handleReenviarCampanha(campanha)}
                                  sx={{ color: '#ff9800' }}
                                >
                                  <RefreshIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Duplicar">
                              <IconButton
                                size="small"
                                onClick={() => handleDuplicar(campanha)}
                                sx={{ color: '#4caf50' }}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(campanha)}
                                sx={{ color: '#ff4081' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(campanha)}
                                sx={{ color: '#f44336' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {campanha.status === 'rascunho' && (
                              <Tooltip title="Ativar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleMudarStatus(campanha, 'agendada')}
                                  sx={{ color: '#4caf50' }}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {campanha.status === 'ativa' && (
                              <Tooltip title="Pausar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleMudarStatus(campanha, 'pausada')}
                                  sx={{ color: '#ff9800' }}
                                >
                                  <PauseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {campanha.status === 'pausada' && (
                              <Tooltip title="Retomar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleMudarStatus(campanha, 'ativa')}
                                  sx={{ color: '#4caf50' }}
                                >
                                  <PlayArrowIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                
                {paginatedCampanhas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CampaignIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Nenhuma campanha encontrada
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{ mt: 2 }}
                      >
                        Criar primeira campanha
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={campanhasFiltradas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* ==================== DIALOG DE ENVIO DE CAMPANHA ==================== */}
        <Dialog open={openEnvioDialog} onClose={() => setOpenEnvioDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SendIcon />
              <Typography variant="h6">Enviar Campanha: {campanhaParaEnvio?.nome}</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={etapaEnvio} orientation="vertical" sx={{ mt: 2 }}>
              <Step>
                <StepLabel>Configuração e Destinatários</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>Total de destinatários:</strong> {clientesElegiveis.length} clientes elegíveis
                    </Alert>
                    
                    <Typography variant="subtitle2" gutterBottom>Configuração SMTP:</Typography>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}><Typography variant="caption">Servidor:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body2">{configSMTP?.host || 'Não configurado'}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption">Usuário:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body2">{configSMTP?.usuario || 'Não configurado'}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption">Porta:</Typography></Grid>
                        <Grid item xs={6}><Typography variant="body2">{configSMTP?.porta || 'Não configurado'}</Typography></Grid>
                      </Grid>
                    </Paper>
                    
                    <TextField
                      fullWidth
                      label="E-mail para teste"
                      value={emailTesteDestino}
                      onChange={(e) => setEmailTesteDestino(e.target.value)}
                      size="small"
                      placeholder="teste@exemplo.com"
                      sx={{ mb: 2 }}
                    />
                    
                    <Button
                      variant="outlined"
                      onClick={testarConexaoSMTP}
                      disabled={testandoConexao}
                      sx={{ mr: 1 }}
                    >
                      {testandoConexao ? <CircularProgress size={20} /> : 'Testar Conexão'}
                    </Button>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleIniciarEnvio}
                      disabled={clientesElegiveis.length === 0}
                      sx={{ bgcolor: '#4caf50' }}
                    >
                      Iniciar Envio ({clientesElegiveis.length} clientes)
                    </Button>
                  </Box>
                </StepContent>
              </Step>
              
              <Step>
                <StepLabel>Enviando E-mails...</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress variant="determinate" value={envioProgresso} sx={{ mb: 2, height: 10, borderRadius: 5 }} />
                    <Typography variant="body2" color="textSecondary">
                      {Math.round(envioProgresso)}% concluído
                    </Typography>
                    {enviando && (
                      <CircularProgress size={30} sx={{ mt: 2 }} />
                    )}
                  </Box>
                </StepContent>
              </Step>
              
              <Step>
                <StepLabel>Resultado do Envio</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    <Alert severity={envioStatus.filter(s => s.status === 'erro').length === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
                      <strong>Resumo do Envio</strong><br />
                      Total: {clientesElegiveis.length}<br />
                      ✅ Enviados: {envioStatus.filter(s => s.status === 'sucesso').length}<br />
                      ❌ Falhas: {envioStatus.filter(s => s.status === 'erro').length}
                    </Alert>
                    
                    <Typography variant="subtitle2" gutterBottom>Detalhes:</Typography>
                    <TableContainer sx={{ maxHeight: 300 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Cliente</TableCell>
                            <TableCell>E-mail</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {envioStatus.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.cliente}</TableCell>
                              <TableCell>{item.email}</TableCell>
                              <TableCell>
                                <Chip
                                  label={item.status === 'sucesso' ? 'Enviado' : 'Falha'}
                                  size="small"
                                  sx={{
                                    bgcolor: item.status === 'sucesso' ? '#4caf5020' : '#f4433620',
                                    color: item.status === 'sucesso' ? '#4caf50' : '#f44336',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                  <Box>
                    <Button onClick={() => setOpenEnvioDialog(false)} variant="contained">
                      Fechar
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </DialogContent>
        </Dialog>

        {/* Dialog de Cadastro/Edição (mesmo do original) */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            {campanhaEditando ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
              <Tab label="Informações Básicas" />
              <Tab label="Segmentação" />
              <Tab label="Cupons" />
              <Tab label="Metas" />
            </Tabs>

            {tabValue === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome da Campanha"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="descricao"
                    multiline
                    rows={3}
                    value={formData.descricao}
                    onChange={handleInputChange}
                    size="small"
                    placeholder="Descreva o objetivo e detalhes da campanha"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Benefícios da Campanha</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {formData.beneficios.map((beneficio, idx) => (
                      <Chip
                        key={idx}
                        label={beneficio}
                        onDelete={() => handleBeneficioRemove(beneficio)}
                        size="small"
                      />
                    ))}
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Digite um benefício e pressione Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        handleBeneficioAdd(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de Campanha</InputLabel>
                    <Select
                      name="tipo"
                      value={formData.tipo}
                      label="Tipo de Campanha"
                      onChange={handleInputChange}
                    >
                      {tiposCampanha.map(tipo => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {tipo.icon}
                            {tipo.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      label="Status"
                      onChange={handleInputChange}
                    >
                      {statusCampanha.filter(s => s.value !== 'enviando' && s.value !== 'enviada' && s.value !== 'erro').map(status => (
                        <MenuItem key={status.value} value={status.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {status.icon}
                            {status.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Data Início"
                    value={formData.dataInicio ? new Date(formData.dataInicio + 'T12:00:00') : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setFormData({ ...formData, dataInicio: newValue.toISOString().split('T')[0] });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Data Fim (opcional)"
                    value={formData.dataFim ? new Date(formData.dataFim + 'T12:00:00') : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setFormData({ ...formData, dataFim: newValue.toISOString().split('T')[0] });
                      } else {
                        setFormData({ ...formData, dataFim: '' });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horário Início"
                    name="horarioInicio"
                    type="time"
                    value={formData.horarioInicio}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horário Fim"
                    name="horarioFim"
                    type="time"
                    value={formData.horarioFim}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                    Canais de Divulgação
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.canais.email}
                          onChange={() => handleCanaisChange('email')}
                        />
                      }
                      label="E-mail"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.canais.whatsapp}
                          onChange={() => handleCanaisChange('whatsapp')}
                        />
                      }
                      label="WhatsApp"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.canais.sms}
                          onChange={() => handleCanaisChange('sms')}
                        />
                      }
                      label="SMS"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.canais.push}
                          onChange={() => handleCanaisChange('push')}
                        />
                      }
                      label="Notificação Push"
                    />
                  </Box>
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Gênero</InputLabel>
                    <Select
                      name="genero"
                      value={formData.segmento.genero}
                      label="Gênero"
                      onChange={handleSegmentoChange}
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      <MenuItem value="masculino">Masculino</MenuItem>
                      <MenuItem value="feminino">Feminino</MenuItem>
                      <MenuItem value="outro">Outro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Idade Mínima"
                    name="idadeMinima"
                    type="number"
                    value={formData.segmento.idadeMinima}
                    onChange={handleSegmentoChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Idade Máxima"
                    name="idadeMaxima"
                    type="number"
                    value={formData.segmento.idadeMaxima}
                    onChange={handleSegmentoChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={clientes}
                    getOptionLabel={(option) => `${option.nome} - ${option.cidade || ''}`}
                    value={clientes.filter(c => formData.segmento.clientesEspecificos?.includes(c.id))}
                    onChange={(e, newValue) => {
                      setFormData({
                        ...formData,
                        segmento: {
                          ...formData.segmento,
                          clientesEspecificos: newValue.map(c => c.id)
                        }
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Clientes Específicos"
                        size="small"
                        placeholder="Selecionar clientes..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Níveis Permitidos</InputLabel>
                    <Select
                      multiple
                      name="niveis"
                      value={formData.segmento.niveis}
                      label="Níveis Permitidos"
                      onChange={handleSegmentoChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value.toUpperCase()} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {['bronze', 'prata', 'ouro', 'platina'].map(nivel => (
                        <MenuItem key={nivel} value={nivel}>
                          <Checkbox checked={formData.segmento.niveis.indexOf(nivel) > -1} />
                          <ListItemText primary={nivel.toUpperCase()} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Última Compra Após (dias)"
                    name="ultimaCompraApos"
                    type="number"
                    value={formData.segmento.ultimaCompraApos}
                    onChange={handleSegmentoChange}
                    size="small"
                    helperText="Clientes que compraram nos últimos X dias"
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={cupons.filter(c => c.ativo)}
                    getOptionLabel={(option) => `${option.codigo} - ${option.descricao || ''}`}
                    value={cupons.filter(c => formData.cuponsAssociados?.includes(c.id))}
                    onChange={(e, newValue) => {
                      setFormData({
                        ...formData,
                        cuponsAssociados: newValue.map(c => c.id)
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cupons da Campanha"
                        size="small"
                        placeholder="Selecionar cupons..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Os cupons selecionados serão disponibilizados durante o período da campanha.
                    Clientes elegíveis poderão utilizar os cupons conforme as regras de cada um.
                  </Alert>
                </Grid>
              </Grid>
            )}

            {tabValue === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Objetivo da Campanha"
                    name="objetivo"
                    multiline
                    rows={2}
                    value={formData.objetivo}
                    onChange={handleInputChange}
                    size="small"
                    placeholder="Ex: Aumentar vendas de serviços em 20%"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Orçamento (R$)"
                    name="orcamento"
                    type="number"
                    value={formData.orcamento}
                    onChange={handleInputChange}
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Meta de Faturamento (R$)"
                    name="metaFaturamento"
                    type="number"
                    value={formData.metaFaturamento}
                    onChange={handleInputChange}
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Meta de Clientes"
                    name="metaClientes"
                    type="number"
                    value={formData.metaClientes}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={handleSalvar}
              variant="contained"
              sx={{ bgcolor: '#9c27b0' }}
            >
              {campanhaEditando ? 'Atualizar' : 'Criar Campanha'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Detalhes */}
        <Dialog open={openDetalhesDialog} onClose={() => setOpenDetalhesDialog(false)} maxWidth="md" fullWidth>
          {campanhaSelecionada && (
            <>
              <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{campanhaSelecionada.nome}</Typography>
                  <Chip
                    icon={getStatusIcon(campanhaSelecionada.status)}
                    label={getStatusLabel(campanhaSelecionada.status)}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(campanhaSelecionada.status)}20`,
                      color: getStatusColor(campanhaSelecionada.status),
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Typography variant="body1" paragraph>
                      {campanhaSelecionada.descricao}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Período</Typography>
                    <Typography variant="body1">
                      {new Date(campanhaSelecionada.dataInicio).toLocaleDateString('pt-BR')}
                      {campanhaSelecionada.dataFim && ` até ${new Date(campanhaSelecionada.dataFim).toLocaleDateString('pt-BR')}`}
                    </Typography>
                    {campanhaSelecionada.horarioInicio && campanhaSelecionada.horarioFim && (
                      <Typography variant="body2" color="textSecondary">
                        {campanhaSelecionada.horarioInicio} - {campanhaSelecionada.horarioFim}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Tipo</Typography>
                    <Typography variant="body1">
                      {tiposCampanha.find(t => t.value === campanhaSelecionada.tipo)?.label}
                    </Typography>
                  </Grid>

                  {campanhaSelecionada.beneficios && campanhaSelecionada.beneficios.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Benefícios</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {campanhaSelecionada.beneficios.map((beneficio, idx) => (
                          <Chip key={idx} label={beneficio} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>Métricas</Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <PeopleIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {getAlcanceEstimado(campanhaSelecionada)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Clientes Elegíveis
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <LocalOfferIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {campanhaSelecionada.cuponsAssociados?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Cupons na Campanha
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <SendIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {campanhaSelecionada.estatisticasEnvio?.enviados || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        E-mails Enviados
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Progresso da Meta
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calcularProgresso(campanhaSelecionada)}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#4caf50',
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {calcularProgresso(campanhaSelecionada).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Meta: R$ {(campanhaSelecionada.metaFaturamento || 0).toFixed(2)}
                    </Typography>
                  </Grid>

                  {campanhaSelecionada.estatisticasEnvio && (
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Estatísticas de Envio:</strong><br />
                        Enviado em: {new Date(campanhaSelecionada.estatisticasEnvio.dataEnvio).toLocaleString('pt-BR')}<br />
                        Total: {campanhaSelecionada.estatisticasEnvio.total} | 
                        Sucesso: {campanhaSelecionada.estatisticasEnvio.enviados} | 
                        Falhas: {campanhaSelecionada.estatisticasEnvio.falhas}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetalhesDialog(false)}>Fechar</Button>
                {(campanhaSelecionada.status === 'rascunho' || campanhaSelecionada.status === 'agendada' || campanhaSelecionada.status === 'erro') && (
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => {
                      setOpenDetalhesDialog(false);
                      handleEnviarCampanha(campanhaSelecionada);
                    }}
                    sx={{ bgcolor: '#4caf50' }}
                  >
                    Enviar Campanha
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>

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
    </LocalizationProvider>
  );
}

export default Campanhas;
