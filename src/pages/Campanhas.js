// src/pages/Campanhas.js
// VERSÃO COMPLETA - MAIS DE 2000 LINHAS

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
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
  Fade,
  Zoom,
  Grow,
  Collapse,
  Rating,
  Skeleton,
  Fab,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Popover,
  Menu,
  MenuList,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
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
  Pause as PauseIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Cake as CakeIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  FileCopy as FileCopyIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Share as ShareIcon,
  QrCode as QrCodeIcon,
  Link as LinkIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  MoreVert as MoreVertIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  EmailOutlined as EmailOutlinedIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIconAlias,
  Facebook as FacebookIconAlias,
  Instagram as InstagramIconAlias,
  Twitter as TwitterIconAlias,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  TikTok as TikTokIcon,
  Notifications as NotificationsIcon, // <- ADICIONADO
  NotificationsActive as NotificationsActiveIcon,
} from '@mui/icons-material';
import ModuloAvancadoWidget from '../components/ModuloAvancadoWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, addDays, subDays, differenceInDays, isAfter, isBefore, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  Treemap,
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ==================== CONSTANTES ====================
const COLORS = ['#9c27b0', '#ff4081', '#4caf50', '#ff9800', '#f44336', '#2196f3', '#00bcd4', '#795548'];

const statusCampanha = [
  { value: 'rascunho', label: 'Rascunho', color: '#999', icon: <CancelIcon />, descricao: 'Campanha em edição, não será enviada' },
  { value: 'agendada', label: 'Agendada', color: '#2196f3', icon: <ScheduleIcon />, descricao: 'Campanha programada para envio futuro' },
  { value: 'ativa', label: 'Ativa', color: '#4caf50', icon: <PlayArrowIcon />, descricao: 'Campanha em andamento' },
  { value: 'pausada', label: 'Pausada', color: '#ff9800', icon: <PauseIcon />, descricao: 'Campanha temporariamente interrompida' },
  { value: 'encerrada', label: 'Encerrada', color: '#f44336', icon: <CheckIcon />, descricao: 'Campanha finalizada' },
  { value: 'enviando', label: 'Enviando...', color: '#9c27b0', icon: <SendIcon />, descricao: 'Envio em andamento' },
  { value: 'enviada', label: 'Enviada', color: '#4caf50', icon: <CheckIcon />, descricao: 'Campanha enviada com sucesso' },
  { value: 'erro', label: 'Erro no Envio', color: '#f44336', icon: <ErrorIcon />, descricao: 'Falha no envio da campanha' },
];

const tiposCampanha = [
  { value: 'geral', label: 'Geral (todos os clientes)', icon: <PeopleIcon />, descricao: 'Enviar para todos os clientes cadastrados' },
  { value: 'segmentada', label: 'Segmentada (grupo específico)', icon: <FilterIcon />, descricao: 'Enviar apenas para clientes que atendem aos critérios' },
  { value: 'aniversario', label: 'Aniversário', icon: <CakeIcon />, descricao: 'Enviar para clientes aniversariantes do mês/dia' },
  { value: 'primeira_compra', label: 'Primeira Compra', icon: <StarIcon />, descricao: 'Enviar para clientes que nunca compraram' },
  { value: 'recuperacao', label: 'Recuperação (inativos)', icon: <HistoryIcon />, descricao: 'Enviar para clientes inativos' },
  { value: 'vip', label: 'Clientes VIP', icon: <TrophyIcon />, descricao: 'Enviar apenas para clientes VIP (ouro/platina)' },
];

const canaisComunicacao = [
  { value: 'email', label: 'E-mail', icon: <EmailIcon />, cor: '#2196f3', ativo: true },
  { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon />, cor: '#25D366', ativo: true },
  { value: 'sms', label: 'SMS', icon: <PhoneIcon />, cor: '#ff9800', ativo: false },
  { value: 'push', label: 'Notificação Push', icon: <NotificationsIcon />, cor: '#9c27b0', ativo: false },
];

const generos = [
  { value: 'todos', label: 'Todos' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
];

const niveisFidelidade = [
  { value: 'bronze', label: 'Bronze', cor: '#cd7f32' },
  { value: 'prata', label: 'Prata', cor: '#c0c0c0' },
  { value: 'ouro', label: 'Ouro', cor: '#ffd700' },
  { value: 'platina', label: 'Platina', cor: '#e5e4e2' },
];

const periodosRepeticao = [
  { value: 'unica', label: 'Única vez' },
  { value: 'diaria', label: 'Diariamente' },
  { value: 'semanal', label: 'Semanalmente' },
  { value: 'quinzenal', label: 'Quinzenalmente' },
  { value: 'mensal', label: 'Mensalmente' },
  { value: 'trimestral', label: 'Trimestralmente' },
  { value: 'semestral', label: 'Semestralmente' },
  { value: 'anual', label: 'Anualmente' },
];

// ==================== SERVIÇO DE E-MAIL ====================
const enviarEmail = async (configSMTP, destinatario, assunto, conteudo) => {
  try {
    console.log(`📧 Enviando e-mail para ${destinatario}`);
    console.log(`📝 Assunto: ${assunto}`);
    console.log(`📄 Conteúdo: ${conteudo.substring(0, 100)}...`);
    
    // Simulação de envio (substituir por chamada real à API)
    const sucesso = Math.random() > 0.05; // 95% de chance de sucesso
    
    if (sucesso) {
      return { success: true, message: 'E-mail enviado com sucesso', messageId: Date.now().toString() };
    } else {
      throw new Error('Falha no envio do e-mail: servidor SMTP indisponível');
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return { success: false, error: error.message };
  }
};

// Template de e-mail para campanhas (versão completa)
const gerarTemplateEmail = (campanha, cliente, cupom = null, configSalao = {}, configSMTP = {}) => {
  const dataAtual = new Date();
  const dataInicio = new Date(campanha.dataInicio);
  const dataFim = campanha.dataFim ? new Date(campanha.dataFim) : null;
  const logoUrl = configSalao.logo || '';
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${campanha.nome}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
          min-height: 100vh;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .header {
          background: linear-gradient(135deg, #9c27b0 0%, #ff4081 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          position: relative;
          z-index: 1;
        }
        .header p {
          margin: 10px 0 0;
          opacity: 0.9;
          font-size: 14px;
          position: relative;
          z-index: 1;
        }
        .logo {
          max-width: 80px;
          margin-bottom: 15px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .content {
          padding: 35px 30px;
        }
        .content h2 {
          color: #9c27b0;
          margin-top: 0;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .content p {
          line-height: 1.6;
          color: #333;
          margin-bottom: 20px;
        }
        .highlight {
          background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
          padding: 20px;
          border-radius: 16px;
          margin: 25px 0;
          text-align: center;
          border-left: 4px solid #9c27b0;
        }
        .cupom {
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          padding: 25px;
          border-radius: 20px;
          text-align: center;
          margin: 25px 0;
          box-shadow: 0 8px 20px rgba(255,87,34,0.3);
        }
        .cupom-code {
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 3px;
          background: rgba(255,255,255,0.2);
          padding: 12px 20px;
          border-radius: 12px;
          font-family: 'Courier New', monospace;
          margin: 15px 0;
          word-break: break-all;
        }
        .beneficios {
          margin: 20px 0;
          padding: 0;
          list-style: none;
        }
        .beneficios li {
          padding: 10px 0;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .beneficios li:before {
          content: "✓";
          color: #4caf50;
          font-weight: bold;
          font-size: 18px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #9c27b0 0%, #ff4081 100%);
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 50px;
          margin-top: 25px;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 12px rgba(156,39,176,0.3);
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(156,39,176,0.4);
        }
        .footer {
          background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
          padding: 25px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
        }
        .social-links {
          margin: 15px 0;
          display: flex;
          justify-content: center;
          gap: 15px;
        }
        .social-links a {
          color: #9c27b0;
          text-decoration: none;
          font-size: 20px;
        }
        .info {
          font-size: 11px;
          color: #999;
          margin-top: 15px;
          line-height: 1.4;
        }
        .countdown {
          display: inline-block;
          background: rgba(0,0,0,0.8);
          padding: 8px 16px;
          border-radius: 30px;
          font-family: monospace;
          font-size: 14px;
          margin-top: 10px;
        }
        @media (max-width: 600px) {
          .container { border-radius: 16px; }
          .header { padding: 30px 20px; }
          .content { padding: 25px 20px; }
          .cupom-code { font-size: 24px; }
          .button { padding: 12px 24px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo">` : ''}
          <h1>✨ ${campanha.nome} ✨</h1>
          <p>${configSalao.nome || 'Meu Salão'}</p>
        </div>
        <div class="content">
          <h2>Olá, ${cliente.nome || 'cliente'}!</h2>
          <p>${campanha.descricao || 'Temos uma oferta especial preparada especialmente para você!'}</p>
          
          ${campanha.beneficios && campanha.beneficios.length > 0 ? `
            <div class="highlight">
              <strong style="font-size: 16px;">🎁 BENEFÍCIOS EXCLUSIVOS</strong>
              <ul class="beneficios">
                ${campanha.beneficios.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${cupom ? `
            <div class="cupom">
              <p style="margin: 0 0 10px 0; font-size: 14px;">🎟️ USE SEU CUPOM EXCLUSIVO</p>
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
            ${dataFim && differenceInDays(dataFim, new Date()) <= 7 ? `<div class="countdown">⏰ Últimos dias!</div>` : ''}
          </div>
          
          ${campanha.horarioInicio && campanha.horarioFim ? `
            <div class="highlight">
              <strong>⏰ Horário Especial</strong><br>
              ${campanha.horarioInicio} - ${campanha.horarioFim}
            </div>
          ` : ''}
          
          <center>
            <a href="${process.env.REACT_APP_SITE_URL || 'https://seusalao.com.br'}/promocoes?campanha=${campanha.id}&cliente=${cliente.id}" class="button">
              🔥 APROVEITAR OFERTA AGORA
            </a>
          </center>
          
          <div class="info">
            <p>* Termos e condições se aplicam. Consulte as regras da promoção.<br>
            Esta é uma mensagem automática, por favor não responda.<br>
            Para cancelar o recebimento de promoções, <a href="${process.env.REACT_APP_SITE_URL || '#'}/cancelar-promocoes?email=${cliente.email}" style="color: #9c27b0;">clique aqui</a>.</p>
          </div>
        </div>
        <div class="footer">
          <div class="social-links">
            ${configSalao.contato?.instagram ? `<a href="https://instagram.com/${configSalao.contato.instagram}" target="_blank"><InstagramIcon style="font-size: 20px;">📷</InstagramIcon></a>` : ''}
            ${configSalao.contato?.facebook ? `<a href="https://facebook.com/${configSalao.contato.facebook}" target="_blank"><FacebookIcon style="font-size: 20px;">📘</FacebookIcon></a>` : ''}
            ${configSalao.contato?.whatsapp ? `<a href="https://wa.me/${configSalao.contato.whatsapp}" target="_blank"><WhatsAppIcon style="font-size: 20px;">💬</WhatsAppIcon></a>` : ''}
          </div>
          <p>© ${dataAtual.getFullYear()} ${configSalao.nome || 'Meu Salão'} - Todos os direitos reservados.</p>
          <p>${configSalao.endereco?.logradouro || ''} ${configSalao.endereco?.cidade ? `- ${configSalao.endereco.cidade}/${configSalao.endereco.estado}` : ''}</p>
          <p>${configSalao.contato?.telefone || ''} | ${configSalao.contato?.email || ''}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template de e-mail para teste
const gerarTemplateTeste = (configSMTP, configSalao) => {
  const dataAtual = new Date();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Teste de Conexão SMTP</title>
      <style>
        body { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #9c27b0, #ff4081); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .content h2 { color: #9c27b0; margin-top: 0; }
        .info-box { background: #f5f5f5; padding: 15px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .info-box p { margin: 5px 0; }
        .button { display: inline-block; background: #9c27b0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 30px; margin-top: 20px; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Teste de Conexão SMTP</h1>
        </div>
        <div class="content">
          <h2>Olá, ${configSMTP.remetente || configSMTP.usuario}!</h2>
          <p>Esta é uma mensagem de teste para verificar se sua configuração de e-mail está funcionando corretamente.</p>
          <div class="info-box">
            <p><strong>Configurações atuais:</strong></p>
            <p>📡 Servidor: ${configSMTP.host}</p>
            <p>🔌 Porta: ${configSMTP.porta}</p>
            <p>🔒 Segurança: ${configSMTP.seguranca || 'TLS'}</p>
            <p>👤 Usuário: ${configSMTP.usuario}</p>
            <p>📧 Remetente: ${configSMTP.remetente || configSMTP.usuario}</p>
            <p>🏷️ Nome: ${configSMTP.nomeRemetente || configSalao.nome || 'Meu Salão'}</p>
          </div>
          <p>Se você recebeu este e-mail, sua configuração está correta e pronta para uso!</p>
          <center>
            <a href="#" class="button">🎉 Configuração Válida</a>
          </center>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            Data e hora do teste: ${dataAtual.toLocaleString('pt-BR')}<br>
            Esta é uma mensagem automática do sistema de ${configSalao.nome || 'Meu Salão'}.
          </p>
        </div>
        <div class="footer">
          <p>© ${dataAtual.getFullYear()} ${configSalao.nome || 'Meu Salão'} - Sistema de Gestão</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ==================== COMPONENTE PRINCIPAL ====================
function Campanhas() {
  // ==================== ESTADOS ====================
  const [loading, setLoading] = useState(true);
  const [campanhas, setCampanhas] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [configSalao, setConfigSalao] = useState({});
  const [configSMTP, setConfigSMTP] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [openAnaliseDialog, setOpenAnaliseDialog] = useState(false);
  const [campanhaEditando, setCampanhaEditando] = useState(null);
  const [campanhaSelecionada, setCampanhaSelecionada] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [openCompartilharDialog, setOpenCompartilharDialog] = useState(false);
  const [openAgendamentoDialog, setOpenAgendamentoDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Estados para envio
  const [openEnvioDialog, setOpenEnvioDialog] = useState(false);
  const [campanhaParaEnvio, setCampanhaParaEnvio] = useState(null);
  const [etapaEnvio, setEtapaEnvio] = useState(0);
  const [envioProgresso, setEnvioProgresso] = useState(0);
  const [envioStatus, setEnvioStatus] = useState([]);
  const [testandoConexao, setTestandoConexao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [emailTesteDestino, setEmailTesteDestino] = useState('');
  const [clientesElegiveis, setClientesElegiveis] = useState([]);
  const [envioAgendado, setEnvioAgendado] = useState(null);
  
  // Estados para análise
  const [dadosAnalise, setDadosAnalise] = useState(null);
  const [periodoAnalise, setPeriodoAnalise] = useState('mes');
  
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
    tags: [],
    segmento: {
      genero: 'todos',
      idadeMinima: '',
      idadeMaxima: '',
      cidades: [],
      niveis: ['bronze', 'prata', 'ouro', 'platina'],
      ultimaCompraApos: '',
      clientesEspecificos: [],
      valorMinimoGasto: '',
      valorMaximoGasto: '',
      frequenciaMinima: '',
      servicosFavoritos: [],
    },
    canais: {
      email: true,
      whatsapp: true,
      sms: false,
      push: false,
    },
    repeticao: {
      ativo: false,
      periodo: 'mensal',
      dias: 30,
      dataProximoEnvio: null,
    },
    agendamento: {
      dataAgendada: null,
      enviarAutomaticamente: false,
    },
  });

  // ==================== CARREGAMENTO INICIAL ====================
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
      
      await registrarAuditoria('carregar_campanhas', 'listagem', 'Página de campanhas carregada');
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  };

  // ==================== FUNÇÕES DE SEGMENTAÇÃO ====================
  const getClientesElegiveis = (campanha) => {
    let elegiveis = [...clientes];
    
    if (!campanha || campanha.tipo === 'geral') {
      return elegiveis;
    }
    
    if (campanha.tipo === 'segmentada' && campanha.segmento) {
      const seg = campanha.segmento;
      elegiveis = elegiveis.filter(c => {
        let match = true;
        
        // Filtro por gênero
        if (seg.genero !== 'todos' && c.genero !== seg.genero) match = false;
        
        // Filtro por idade
        if (seg.idadeMinima && c.idade < parseInt(seg.idadeMinima)) match = false;
        if (seg.idadeMaxima && c.idade > parseInt(seg.idadeMaxima)) match = false;
        
        // Filtro por cidade
        if (seg.cidades?.length > 0 && !seg.cidades.includes(c.cidade)) match = false;
        
        // Filtro por nível de fidelidade
        if (seg.niveis?.length > 0 && !seg.niveis.includes(c.nivel)) match = false;
        
        // Filtro por clientes específicos
        if (seg.clientesEspecificos?.length > 0 && !seg.clientesEspecificos.includes(c.id)) match = false;
        
        // Filtro por valor mínimo gasto
        if (seg.valorMinimoGasto && (c.totalGasto || 0) < parseFloat(seg.valorMinimoGasto)) match = false;
        
        // Filtro por valor máximo gasto
        if (seg.valorMaximoGasto && (c.totalGasto || 0) > parseFloat(seg.valorMaximoGasto)) match = false;
        
        // Filtro por frequência de compras
        if (seg.frequenciaMinima && (c.totalCompras || 0) < parseInt(seg.frequenciaMinima)) match = false;
        
        // Filtro por última compra
        if (seg.ultimaCompraApos && c.ultimaCompra) {
          const diasDesdeUltimaCompra = differenceInDays(new Date(), new Date(c.ultimaCompra));
          if (diasDesdeUltimaCompra > parseInt(seg.ultimaCompraApos)) match = false;
        }
        
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
    } else if (campanha.tipo === 'primeira_compra') {
      elegiveis = elegiveis.filter(c => !c.ultimaCompra || c.totalCompras === 0);
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
    }
    
    return elegiveis;
  };

  // ==================== FUNÇÕES DE ENVIO ====================
  const testarConexaoSMTP = async () => {
    if (!emailTesteDestino) {
      toast.error('Digite um e-mail para teste');
      return;
    }
    
    if (!configSMTP || !configSMTP.usuario || !configSMTP.senha) {
      toast.error('Configure as credenciais SMTP na página de Configurações!');
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
        toast.success('✅ E-mail de teste enviado com sucesso! Verifique sua caixa de entrada.');
      } else {
        toast.error('❌ Falha no envio: ' + (resultado.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro no teste SMTP:', error);
      toast.error('Erro ao testar conexão SMTP');
    } finally {
      setTestandoConexao(false);
    }
  };

  const handleEnviarCampanha = async (campanha) => {
    if (!configSMTP || !configSMTP.usuario || !configSMTP.senha) {
      toast.error('Configure as credenciais SMTP na página de Configurações primeiro!');
      return;
    }
    
    const elegiveis = getClientesElegiveis(campanha);
    if (elegiveis.length === 0) {
      toast.error('Nenhum cliente elegível para esta campanha');
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
    
    // Atualizar status da campanha
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
      
      // Buscar cupom associado
      let cupomAssociado = null;
      if (campanhaParaEnvio.cuponsAssociados && campanhaParaEnvio.cuponsAssociados.length > 0) {
        const cupomId = campanhaParaEnvio.cuponsAssociados[0];
        cupomAssociado = cupons.find(c => c.id === cupomId);
      }
      
      // Gerar template personalizado
      const template = gerarTemplateEmail(campanhaParaEnvio, cliente, cupomAssociado, configSalao, configSMTP);
      
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
      
      // Delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualizar status a cada 10 envios
      if ((i + 1) % 10 === 0 || i === clientesElegiveis.length - 1) {
        setEnvioStatus([...resultados]);
      }
    }
    
    // Atualizar status final
    const statusFinal = falhas === 0 ? 'enviada' : (enviados > 0 ? 'enviada' : 'erro');
    
    await firebaseService.update('campanhas', campanhaParaEnvio.id, {
      status: statusFinal,
      dataEnvioConcluido: new Date().toISOString(),
      estatisticasEnvio: {
        total: clientesElegiveis.length,
        enviados,
        falhas,
        dataEnvio: new Date().toISOString(),
        tempoExecucao: (Date.now() - inicioTempo) / 1000,
      }
    });
    
    await registrarAuditoria(
      'enviar_campanha',
      campanhaParaEnvio.id,
      `Campanha enviada para ${enviados} clientes`,
      { total: clientesElegiveis.length, enviados, falhas }
    );
    
    setEnviando(false);
    setEtapaEnvio(2);
    await carregarDados();
    
    toast.success(`✅ Envio concluído! ${enviados} e-mails enviados, ${falhas} falhas.`);
  };

  const handleAgendarEnvio = async () => {
    if (!envioAgendado) {
      toast.error('Selecione uma data para agendamento');
      return;
    }
    
    try {
      await firebaseService.update('campanhas', campanhaParaEnvio.id, {
        status: 'agendada',
        agendamentoEnvio: envioAgendado,
        atualizadoEm: new Date().toISOString(),
      });
      
      toast.success(`✅ Campanha agendada para ${new Date(envioAgendado).toLocaleString('pt-BR')}`);
      setOpenAgendamentoDialog(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao agendar:', error);
      toast.error('Erro ao agendar campanha');
    }
  };

  // ==================== FUNÇÕES DE ANÁLISE ====================
  const gerarDadosAnalise = () => {
    const inicio = new Date();
    const fim = new Date();
    
    switch(periodoAnalise) {
      case 'semana':
        inicio.setDate(inicio.getDate() - 7);
        break;
      case 'mes':
        inicio.setMonth(inicio.getMonth() - 1);
        break;
      case 'trimestre':
        inicio.setMonth(inicio.getMonth() - 3);
        break;
      case 'ano':
        inicio.setFullYear(inicio.getFullYear() - 1);
        break;
      default:
        inicio.setMonth(inicio.getMonth() - 1);
    }
    
    const campanhasPeriodo = campanhas.filter(c => new Date(c.criadoEm) >= inicio);
    const totalEnviadas = campanhasPeriodo.filter(c => c.status === 'enviada').length;
    const totalEnviados = campanhasPeriodo.reduce((acc, c) => acc + (c.estatisticasEnvio?.enviados || 0), 0);
    const totalAberturas = campanhasPeriodo.reduce((acc, c) => acc + (c.estatisticasEnvio?.aberturas || 0), 0);
    const totalCliques = campanhasPeriodo.reduce((acc, c) => acc + (c.estatisticasEnvio?.cliques || 0), 0);
    
    return {
      periodo: periodoAnalise,
      totalCampanhas: campanhasPeriodo.length,
      totalEnviadas,
      totalEnviados,
      taxaAbertura: totalEnviados > 0 ? (totalAberturas / totalEnviados) * 100 : 0,
      taxaCliques: totalAberturas > 0 ? (totalCliques / totalAberturas) * 100 : 0,
      campanhasPorTipo: campanhasPeriodo.reduce((acc, c) => {
        acc[c.tipo] = (acc[c.tipo] || 0) + 1;
        return acc;
      }, {}),
      campanhasPorStatus: campanhasPeriodo.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {}),
    };
  };

  const handleAbrirAnalise = () => {
    setDadosAnalise(gerarDadosAnalise());
    setOpenAnaliseDialog(true);
  };

  // ==================== FUNÇÕES DE COMPARTILHAMENTO ====================
  const handleCompartilhar = (campanha) => {
    setCampanhaSelecionada(campanha);
    setOpenCompartilharDialog(true);
  };

  const getLinkCompartilhamento = (campanha) => {
    return `${window.location.origin}/promocoes/${campanha.id}`;
  };

  const copiarLink = async (campanha) => {
    const link = getLinkCompartilhamento(campanha);
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar link');
    }
  };

  // ==================== FUNÇÕES CRUD ====================
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
        tags: campanha.tags || [],
        segmento: campanha.segmento || {
          genero: 'todos',
          idadeMinima: '',
          idadeMaxima: '',
          cidades: [],
          niveis: ['bronze', 'prata', 'ouro', 'platina'],
          ultimaCompraApos: '',
          clientesEspecificos: [],
          valorMinimoGasto: '',
          valorMaximoGasto: '',
          frequenciaMinima: '',
          servicosFavoritos: [],
        },
        canais: campanha.canais || {
          email: true,
          whatsapp: true,
          sms: false,
          push: false,
        },
        repeticao: campanha.repeticao || {
          ativo: false,
          periodo: 'mensal',
          dias: 30,
          dataProximoEnvio: null,
        },
        agendamento: campanha.agendamento || {
          dataAgendada: null,
          enviarAutomaticamente: false,
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
        tags: [],
        segmento: {
          genero: 'todos',
          idadeMinima: '',
          idadeMaxima: '',
          cidades: [],
          niveis: ['bronze', 'prata', 'ouro', 'platina'],
          ultimaCompraApos: '',
          clientesEspecificos: [],
          valorMinimoGasto: '',
          valorMaximoGasto: '',
          frequenciaMinima: '',
          servicosFavoritos: [],
        },
        canais: {
          email: true,
          whatsapp: true,
          sms: false,
          push: false,
        },
        repeticao: {
          ativo: false,
          periodo: 'mensal',
          dias: 30,
          dataProximoEnvio: null,
        },
        agendamento: {
          dataAgendada: null,
          enviarAutomaticamente: false,
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
    
    await registrarAuditoria('visualizar_campanha', campanha.id, `Visualização da campanha ${campanha.nome}`);
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
        await registrarAuditoria('atualizar_campanha', campanhaEditando.id, `Campanha ${formData.nome} atualizada`);
        mostrarSnackbar('Campanha atualizada com sucesso!');
      } else {
        const novaCampanha = await firebaseService.add('campanhas', dadosParaSalvar);
        await registrarAuditoria('criar_campanha', novaCampanha.id, `Nova campanha criada: ${formData.nome}`);
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
      
      await registrarAuditoria('alterar_status_campanha', campanha.id, `Status alterado para ${novoStatus}`);
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
      await registrarAuditoria('duplicar_campanha', resultado.id, `Campanha duplicada de ${campanha.nome}`);
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
        await registrarAuditoria('excluir_campanha', campanha.id, `Campanha ${campanha.nome} excluída`);
        mostrarSnackbar('Campanha excluída com sucesso!');
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir campanha:', error);
        mostrarSnackbar('Erro ao excluir campanha', 'error');
      }
    }
  };

  const handleArquivar = async (campanha) => {
    try {
      const novoStatus = campanha.arquivado ? false : true;
      await firebaseService.update('campanhas', campanha.id, {
        arquivado: novoStatus,
        atualizadoEm: new Date().toISOString()
      });
      mostrarSnackbar(novoStatus ? '📦 Campanha arquivada' : '📂 Campanha desarquivada');
      carregarDados();
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      mostrarSnackbar('Erro ao arquivar campanha', 'error');
    }
  };

  const handleExportar = () => {
    try {
      const dadosExportacao = campanhasFiltradas.map(c => ({
        'Nome': c.nome,
        'Descrição': c.descricao,
        'Tipo': tiposCampanha.find(t => t.value === c.tipo)?.label || c.tipo,
        'Status': statusCampanha.find(s => s.value === c.status)?.label || c.status,
        'Data Início': c.dataInicio ? new Date(c.dataInicio).toLocaleDateString('pt-BR') : '-',
        'Data Fim': c.dataFim ? new Date(c.dataFim).toLocaleDateString('pt-BR') : '-',
        'Alcance': getAlcanceEstimado(c),
        'Cupons': c.cuponsAssociados?.length || 0,
        'E-mails Enviados': c.estatisticasEnvio?.enviados || 0,
        'Taxa Abertura': c.estatisticasEnvio?.aberturas ? `${((c.estatisticasEnvio.aberturas / c.estatisticasEnvio.enviados) * 100).toFixed(1)}%` : '-',
        'Criado em': c.criadoEm ? new Date(c.criadoEm).toLocaleString('pt-BR') : '-',
      }));

      const ws = XLSX.utils.json_to_sheet(dadosExportacao);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Campanhas');
      XLSX.writeFile(wb, `campanhas_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      mostrarSnackbar('✅ Exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      mostrarSnackbar('Erro ao exportar', 'error');
    }
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
    const matchesTipo = filtroTipo === 'todos' || campanha.tipo === filtroTipo;

    return matchesTexto && matchesStatus && matchesTipo;
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

  // Variáveis para tempo de execução
  const inicioTempo = Date.now();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#9c27b0' }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3, maxWidth: '100%', overflowX: 'hidden' }}>
        <ModuloAvancadoWidget moduloId="whatsapp-automacoes" />
        <ModuloAvancadoWidget moduloId="crm-campanhas" />
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CampaignIcon sx={{ fontSize: 40 }} />
              Campanhas de Marketing
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie campanhas promocionais, envie para seus clientes e acompanhe os resultados
            </Typography>
            <Breadcrumbs sx={{ mt: 1 }}>
              <Link color="inherit" href="/dashboard">Dashboard</Link>
              <Typography color="textPrimary">Campanhas</Typography>
            </Breadcrumbs>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={carregarDados}>
              Atualizar
            </Button>
            <Button variant="outlined" startIcon={<BarChartIcon />} onClick={handleAbrirAnalise}>
              Análise
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportar}>
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)' }}
            >
              Nova Campanha
            </Button>
          </Box>
        </Box>

        {/* Alertas de Configuração SMTP */}
        {(!configSMTP || !configSMTP.usuario || !configSMTP.senha) && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3, borderRadius: 2 }}
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
            <Zoom in={true} style={{ transitionDelay: '0ms' }}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fff 0%, #faf5ff 100%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Total de Campanhas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                        {campanhas.length}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        +{campanhas.filter(c => c.status === 'ativa').length} ativas
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                      <CampaignIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Ativas / Agendadas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        {campanhas.filter(c => c.status === 'ativa').length}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        +{campanhas.filter(c => c.status === 'agendada').length} agendadas
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                      <PlayArrowIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Enviadas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                        {campanhas.filter(c => c.status === 'enviada').length}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {campanhas.reduce((acc, c) => acc + (c.estatisticasEnvio?.enviados || 0), 0)} e-mails enviados
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56 }}>
                      <SendIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Alcance Total
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                        {campanhas.reduce((acc, c) => acc + getAlcanceEstimado(c), 0)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        clientes impactados
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                      <PeopleIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Filtros Avançados */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar campanhas por nome, descrição..."
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
              
              <Grid item xs={12} md={3}>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {status.icon}
                          {status.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtroTipo}
                    label="Tipo"
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
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
              
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setFiltro('');
                    setFiltroStatus('todos');
                    setFiltroTipo('todos');
                  }}
                >
                  Limpar Filtros
                </Button>
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
                            {campanha.descricao?.substring(0, 60)}
                            {campanha.descricao?.length > 60 ? '...' : ''}
                          </Typography>
                          {campanha.tags?.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              {campanha.tags.slice(0, 2).map(tag => (
                                <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                              ))}
                              {campanha.tags.length > 2 && (
                                <Chip label={`+${campanha.tags.length - 2}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                              )}
                            </Box>
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
                          {campanha.status === 'enviando' && (
                            <LinearProgress sx={{ mt: 1, height: 4, borderRadius: 2 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {alcance} clientes
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {campanha.cuponsAssociados?.length || 0} cupom(ns)
                          </Typography>
                          {campanha.estatisticasEnvio && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              📧 {campanha.estatisticasEnvio.enviados} enviados
                            </Typography>
                          )}
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
                                  onClick={() => handleEnviarCampanha(campanha)}
                                  sx={{ color: '#ff9800' }}
                                >
                                  <RefreshIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Compartilhar">
                              <IconButton
                                size="small"
                                onClick={() => handleCompartilhar(campanha)}
                                sx={{ color: '#00bcd4' }}
                              >
                                <ShareIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
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
                            
                            <Tooltip title={campanha.arquivado ? 'Desarquivar' : 'Arquivar'}>
                              <IconButton
                                size="small"
                                onClick={() => handleArquivar(campanha)}
                                sx={{ color: campanha.arquivado ? '#ff9800' : '#757575' }}
                              >
                                {campanha.arquivado ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
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
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={campanhasFiltradas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Card>

        {/* ==================== DIALOG DE ENVIO ==================== */}
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
                    
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        onClick={testarConexaoSMTP}
                        disabled={testandoConexao}
                        startIcon={testandoConexao ? <CircularProgress size={20} /> : <EmailIcon />}
                      >
                        {testandoConexao ? 'Testando...' : 'Testar Conexão'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => setOpenAgendamentoDialog(true)}
                        startIcon={<ScheduleIcon />}
                      >
                        Agendar Envio
                      </Button>
                      
                      <Button
                        variant="contained"
                        onClick={handleIniciarEnvio}
                        disabled={clientesElegiveis.length === 0}
                        sx={{ bgcolor: '#4caf50' }}
                        startIcon={<SendIcon />}
                      >
                        Iniciar Envio Agora ({clientesElegiveis.length} clientes)
                      </Button>
                    </Box>
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

        {/* Dialog de Agendamento */}
        <Dialog open={openAgendamentoDialog} onClose={() => setOpenAgendamentoDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white' }}>
            <ScheduleIcon sx={{ mr: 1 }} />
            Agendar Envio
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <DateTimePicker
                label="Data e Hora do Envio"
                value={envioAgendado}
                onChange={(newValue) => setEnvioAgendado(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                ampm={false}
                minDateTime={new Date()}
              />
              <Alert severity="info" sx={{ mt: 2 }}>
                A campanha será enviada automaticamente na data e hora selecionadas.
                Certifique-se de que o servidor estará disponível neste horário.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAgendamentoDialog(false)}>Cancelar</Button>
            <Button onClick={handleAgendarEnvio} variant="contained" sx={{ bgcolor: '#4caf50' }}>
              Confirmar Agendamento
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Compartilhamento */}
        <Dialog open={openCompartilharDialog} onClose={() => setOpenCompartilharDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#00bcd4', color: 'white' }}>
            <ShareIcon sx={{ mr: 1 }} />
            Compartilhar Campanha
          </DialogTitle>
          <DialogContent>
            {campanhaSelecionada && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Compartilhe esta campanha com seus clientes através das redes sociais ou link direto.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Link da Campanha"
                  value={getLinkCompartilhamento(campanhaSelecionada)}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => copiarLink(campanhaSelecionada)}>
                          <FileCopyIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>Compartilhar nas redes sociais:</Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                  <IconButton sx={{ bgcolor: '#25D366', color: 'white' }} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getLinkCompartilhamento(campanhaSelecionada))}`, '_blank')}>
                    <WhatsAppIcon />
                  </IconButton>
                  <IconButton sx={{ bgcolor: '#1877f2', color: 'white' }} onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getLinkCompartilhamento(campanhaSelecionada))}`, '_blank')}>
                    <FacebookIcon />
                  </IconButton>
                  <IconButton sx={{ bgcolor: '#E4405F', color: 'white' }} onClick={() => window.open(`https://www.instagram.com/`, '_blank')}>
                    <InstagramIcon />
                  </IconButton>
                  <IconButton sx={{ bgcolor: '#1DA1F2', color: 'white' }} onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getLinkCompartilhamento(campanhaSelecionada))}&text=${encodeURIComponent(campanhaSelecionada.nome)}`, '_blank')}>
                    <TwitterIcon />
                  </IconButton>
                </Box>
                
                <Alert severity="info" sx={{ mt: 3 }}>
                  <strong>QR Code:</strong> Escaneie o código abaixo para acessar a campanha diretamente pelo celular.
                </Alert>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <QrCodeIcon sx={{ fontSize: 120, color: '#9c27b0' }} />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCompartilharDialog(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Análise */}
        <Dialog open={openAnaliseDialog} onClose={() => setOpenAnaliseDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            <AssessmentIcon sx={{ mr: 1 }} />
            Análise de Campanhas
          </DialogTitle>
          <DialogContent>
            {dadosAnalise && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <ToggleButtonGroup
                    value={periodoAnalise}
                    exclusive
                    onChange={(e, v) => v && setPeriodoAnalise(v)}
                    size="small"
                  >
                    <ToggleButton value="semana">Última Semana</ToggleButton>
                    <ToggleButton value="mes">Último Mês</ToggleButton>
                    <ToggleButton value="trimestre">Último Trimestre</ToggleButton>
                    <ToggleButton value="ano">Último Ano</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: '#f3e5f5' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">Total de Campanhas</Typography>
                        <Typography variant="h4">{dadosAnalise.totalCampanhas}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">E-mails Enviados</Typography>
                        <Typography variant="h4">{dadosAnalise.totalEnviados}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">Taxa de Abertura</Typography>
                        <Typography variant="h4">{dadosAnalise.taxaAbertura.toFixed(1)}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: '#e3f2fd' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">Taxa de Cliques</Typography>
                        <Typography variant="h4">{dadosAnalise.taxaCliques.toFixed(1)}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAnaliseDialog(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Cadastro/Edição */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            {campanhaEditando ? '✏️ Editar Campanha' : '➕ Nova Campanha'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Informações Básicas" />
              <Tab label="Segmentação" />
              <Tab label="Cupons" />
              <Tab label="Metas" />
              <Tab label="Agendamento" />
            </Tabs>

            {tabValue === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome da Campanha *"
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
                    {canaisComunicacao.map(canal => (
                      <FormControlLabel
                        key={canal.value}
                        control={
                          <Switch
                            checked={formData.canais[canal.value]}
                            onChange={() => handleCanaisChange(canal.value)}
                            disabled={!canal.ativo}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {canal.icon}
                            {canal.label}
                            {!canal.ativo && <Chip label="Em breve" size="small" variant="outlined" sx={{ height: 20, ml: 1 }} />}
                          </Box>
                        }
                      />
                    ))}
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
                      {generos.map(g => (
                        <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                      ))}
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor Mínimo Gasto (R$)"
                    name="valorMinimoGasto"
                    type="number"
                    value={formData.segmento.valorMinimoGasto}
                    onChange={handleSegmentoChange}
                    size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor Máximo Gasto (R$)"
                    name="valorMaximoGasto"
                    type="number"
                    value={formData.segmento.valorMaximoGasto}
                    onChange={handleSegmentoChange}
                    size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Frequência Mínima de Compras"
                    name="frequenciaMinima"
                    type="number"
                    value={formData.segmento.frequenciaMinima}
                    onChange={handleSegmentoChange}
                    size="small"
                    helperText="Número mínimo de compras"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Última Compra (dias)"
                    name="ultimaCompraApos"
                    type="number"
                    value={formData.segmento.ultimaCompraApos}
                    onChange={handleSegmentoChange}
                    size="small"
                    helperText="Clientes que compraram nos últimos X dias"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={clientes}
                    getOptionLabel={(option) => `${option.nome} - ${option.email || option.telefone}`}
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
                      {niveisFidelidade.map(nivel => (
                        <MenuItem key={nivel.value} value={nivel.value}>
                          <Checkbox checked={formData.segmento.niveis.indexOf(nivel.value) > -1} />
                          <ListItemText primary={nivel.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={cupons.filter(c => c.ativo)}
                    getOptionLabel={(option) => `${option.codigo} - ${option.descricao || ''} (${option.descontoTipo === 'percentual' ? `${option.valor}%` : `R$ ${option.valor}`})`}
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

            {tabValue === 4 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.repeticao?.ativo || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          repeticao: { ...formData.repeticao, ativo: e.target.checked }
                        })}
                      />
                    }
                    label="Envio Recorrente"
                  />
                  <Typography variant="caption" color="textSecondary" display="block">
                    Configure para que esta campanha seja enviada automaticamente em intervalos regulares
                  </Typography>
                </Grid>
                
                {formData.repeticao?.ativo && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Frequência</InputLabel>
                        <Select
                          value={formData.repeticao?.periodo || 'mensal'}
                          onChange={(e) => setFormData({
                            ...formData,
                            repeticao: { ...formData.repeticao, periodo: e.target.value }
                          })}
                          label="Frequência"
                        >
                          {periodosRepeticao.map(p => (
                            <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Dias de Intervalo"
                        type="number"
                        value={formData.repeticao?.dias || 30}
                        onChange={(e) => setFormData({
                          ...formData,
                          repeticao: { ...formData.repeticao, dias: parseInt(e.target.value) }
                        })}
                        size="small"
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>Agendamento Único</Typography>
                  <DateTimePicker
                    label="Data e Hora do Agendamento"
                    value={formData.agendamento?.dataAgendada ? new Date(formData.agendamento.dataAgendada) : null}
                    onChange={(newValue) => {
                      setFormData({
                        ...formData,
                        agendamento: {
                          ...formData.agendamento,
                          dataAgendada: newValue?.toISOString()
                        }
                      });
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    minDateTime={new Date()}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.agendamento?.enviarAutomaticamente || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          agendamento: { ...formData.agendamento, enviarAutomaticamente: e.target.checked }
                        })}
                      />
                    }
                    label="Enviar automaticamente na data agendada"
                    sx={{ mt: 2 }}
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
                      <TagIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
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
                        {campanhaSelecionada.estatisticasEnvio.tempoExecucao && (
                          <><br />Tempo de execução: {campanhaSelecionada.estatisticasEnvio.tempoExecucao.toFixed(1)} segundos</>
                        )}
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
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={() => {
                    setOpenDetalhesDialog(false);
                    handleCompartilhar(campanhaSelecionada);
                  }}
                >
                  Compartilhar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Speed Dial */}
        <SpeedDial
          ariaLabel="Ações rápidas"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={() => setOpenSpeedDial(false)}
          onOpen={() => setOpenSpeedDial(true)}
          open={openSpeedDial}
        >
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="Nova Campanha"
            onClick={() => handleOpenDialog()}
          />
          <SpeedDialAction
            icon={<SendIcon />}
            tooltipTitle="Enviar Campanha"
            onClick={() => {
              const campanha = campanhas.find(c => c.status === 'rascunho');
              if (campanha) handleEnviarCampanha(campanha);
              else toast.error('Nenhuma campanha disponível para envio');
            }}
          />
          <SpeedDialAction
            icon={<AssessmentIcon />}
            tooltipTitle="Análise de Campanhas"
            onClick={handleAbrirAnalise}
          />
          <SpeedDialAction
            icon={<RefreshIcon />}
            tooltipTitle="Atualizar"
            onClick={carregarDados}
          />
        </SpeedDial>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

export default Campanhas;
