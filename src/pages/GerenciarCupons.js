// src/pages/GerenciarCupons.js
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
  Tabs,
  Tab,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
  LocalOffer as TagIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Print as PrintIcon,
  Palette as PaletteIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cupomService } from '../services/cupomService';
import { firebaseService } from '../services/firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const tiposCupom = [
  { value: 'percentual', label: 'Percentual', icon: <PercentIcon /> },
  { value: 'fixo', label: 'Valor Fixo', icon: <MoneyIcon /> },
  { value: 'frete', label: 'Frete Grátis', icon: <ShoppingCartIcon /> },
  { value: 'produto', label: 'Produto Específico', icon: <InventoryIcon /> },
];

const diasSemana = [
  { value: 'segunda', label: 'Segunda' },
  { value: 'terca', label: 'Terça' },
  { value: 'quarta', label: 'Quarta' },
  { value: 'quinta', label: 'Quinta' },
  { value: 'sexta', label: 'Sexta' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

const clientesElegiveis = [
  { value: 'todos', label: 'Todos os clientes' },
  { value: 'novos', label: 'Apenas novos clientes' },
  { value: 'vip', label: 'Apenas clientes VIP' },
  { value: 'lista', label: 'Lista específica' },
];

const estilosCupom = [
  { value: 'classico', label: 'Clássico', cor: '#9c27b0' },
  { value: 'moderno', label: 'Moderno', cor: '#2196f3' },
  { value: 'elegante', label: 'Elegante', cor: '#4caf50' },
  { value: 'vibrante', label: 'Vibrante', cor: '#ff9800' },
  { value: 'luxo', label: 'Luxo', cor: '#9c27b0' },
];

function GerenciarCupons() {
  const [loading, setLoading] = useState(true);
  const [cupons, setCupons] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistoricoDialog, setOpenHistoricoDialog] = useState(false);
  const [openImpressaoDialog, setOpenImpressaoDialog] = useState(false);
  const [cupomSelecionado, setCupomSelecionado] = useState(null);
  const [historicoUsos, setHistoricoUsos] = useState([]);
  const [cupomEditando, setCupomEditando] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [configuracoes, setConfiguracoes] = useState(null);
  
  // Dados para selects
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // Estado para customização de cupom
  const [customizacao, setCustomizacao] = useState({
    estilo: 'classico',
    corPrimaria: '#9c27b0',
    corSecundaria: '#ff4081',
    mostrarLogo: true,
    mostrarQrCode: true,
    mensagemPersonalizada: '',
    quantidade: 1,
    disposicao: 'vertical', // 'vertical' ou 'horizontal'
    tamanhoPapel: 'A4', // 'A4', 'A5', 'Carta'
  });

  // Estado do formulário
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    tipo: 'percentual',
    valor: '',
    valorMinimo: '',
    valorMaximoDesconto: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    diasSemana: [],
    horarioInicio: '',
    horarioFim: '',
    usoMaximo: '',
    usoMaximoPorCliente: 1,
    clientesElegiveis: 'todos',
    listaClientesIds: [],
    niveisPermitidos: ['bronze', 'prata', 'ouro', 'platina'],
    servicosElegiveis: 'todos',
    listaServicosIds: [],
    produtosElegiveis: 'todos',
    listaProdutosIds: [],
    ativo: true,
    primeiroAcesso: false,
    customizacao: {
      estilo: 'classico',
      corPrimaria: '#9c27b0',
      corSecundaria: '#ff4081',
      mostrarLogo: true,
      mostrarQrCode: true,
      mensagemPersonalizada: '',
    }
  });

  useEffect(() => {
    carregarUsuario();
    carregarDados();
    carregarClientesServicosProdutos();
    carregarConfiguracoes();
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

  const carregarConfiguracoes = async () => {
    try {
      const configs = await firebaseService.getAll('configuracoes').catch(() => []);
      if (configs && configs.length > 0) {
        setConfiguracoes(configs[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const dados = await cupomService.listarCupons();
      setCupons(dados);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  const carregarClientesServicosProdutos = async () => {
    try {
      const [clientesData, servicosData, produtosData] = await Promise.all([
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('produtos').catch(() => [])
      ]);
      setClientes(clientesData || []);
      setServicos(servicosData || []);
      setProdutos(produtosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (cupom = null) => {
    if (cupom) {
      setCupomEditando(cupom);
      setFormData({
        codigo: cupom.codigo || '',
        descricao: cupom.descricao || '',
        tipo: cupom.tipo || 'percentual',
        valor: cupom.valor || '',
        valorMinimo: cupom.valorMinimo || '',
        valorMaximoDesconto: cupom.valorMaximoDesconto || '',
        dataInicio: cupom.dataInicio || new Date().toISOString().split('T')[0],
        dataFim: cupom.dataFim || '',
        diasSemana: cupom.diasSemana || [],
        horarioInicio: cupom.horarioInicio || '',
        horarioFim: cupom.horarioFim || '',
        usoMaximo: cupom.usoMaximo || '',
        usoMaximoPorCliente: cupom.usoMaximoPorCliente || 1,
        clientesElegiveis: cupom.clientesElegiveis || 'todos',
        listaClientesIds: cupom.listaClientesIds || [],
        niveisPermitidos: cupom.niveisPermitidos || ['bronze', 'prata', 'ouro', 'platina'],
        servicosElegiveis: cupom.servicosElegiveis || 'todos',
        listaServicosIds: cupom.listaServicosIds || [],
        produtosElegiveis: cupom.produtosElegiveis || 'todos',
        listaProdutosIds: cupom.listaProdutosIds || [],
        ativo: cupom.ativo !== false,
        primeiroAcesso: cupom.primeiroAcesso || false,
        customizacao: cupom.customizacao || {
          estilo: 'classico',
          corPrimaria: '#9c27b0',
          corSecundaria: '#ff4081',
          mostrarLogo: true,
          mostrarQrCode: true,
          mensagemPersonalizada: '',
        }
      });
    } else {
      setCupomEditando(null);
      setFormData({
        codigo: '',
        descricao: '',
        tipo: 'percentual',
        valor: '',
        valorMinimo: '',
        valorMaximoDesconto: '',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: '',
        diasSemana: [],
        horarioInicio: '',
        horarioFim: '',
        usoMaximo: '',
        usoMaximoPorCliente: 1,
        clientesElegiveis: 'todos',
        listaClientesIds: [],
        niveisPermitidos: ['bronze', 'prata', 'ouro', 'platina'],
        servicosElegiveis: 'todos',
        listaServicosIds: [],
        produtosElegiveis: 'todos',
        listaProdutosIds: [],
        ativo: true,
        primeiroAcesso: false,
        customizacao: {
          estilo: 'classico',
          corPrimaria: '#9c27b0',
          corSecundaria: '#ff4081',
          mostrarLogo: true,
          mostrarQrCode: true,
          mensagemPersonalizada: '',
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCupomEditando(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCustomizacaoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      customizacao: {
        ...prev.customizacao,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSalvar = async () => {
    try {
      if (!formData.codigo) {
        mostrarSnackbar('Código do cupom é obrigatório', 'error');
        return;
      }

      if (!formData.valor || formData.valor <= 0) {
        mostrarSnackbar('Valor do desconto é obrigatório', 'error');
        return;
      }

      const dadosParaSalvar = {
        ...formData,
        valor: parseFloat(formData.valor),
        valorMinimo: formData.valorMinimo ? parseFloat(formData.valorMinimo) : 0,
        valorMaximoDesconto: formData.valorMaximoDesconto ? parseFloat(formData.valorMaximoDesconto) : null,
        usoMaximo: formData.usoMaximo ? parseInt(formData.usoMaximo) : null,
        usoMaximoPorCliente: parseInt(formData.usoMaximoPorCliente) || 1,
        criadoPor: usuario?.id,
        criadoPorNome: usuario?.nome,
      };

      if (cupomEditando) {
        await cupomService.atualizarCupom(cupomEditando.id, dadosParaSalvar);
        mostrarSnackbar('Cupom atualizado com sucesso!');
      } else {
        await cupomService.criarCupom(dadosParaSalvar);
        mostrarSnackbar('Cupom criado com sucesso!');
      }

      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      mostrarSnackbar(error.message || 'Erro ao salvar cupom', 'error');
    }
  };

  const handleToggleStatus = async (cupom) => {
    try {
      await cupomService.atualizarCupom(cupom.id, {
        ativo: !cupom.ativo
      });
      mostrarSnackbar(`Cupom ${!cupom.ativo ? 'ativado' : 'desativado'} com sucesso!`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarSnackbar('Erro ao alterar status', 'error');
    }
  };

  const handleVerHistorico = async (cupom) => {
    try {
      setCupomSelecionado(cupom);
      const historico = await cupomService.historicoUso(cupom.id);
      setHistoricoUsos(historico);
      setOpenHistoricoDialog(true);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      mostrarSnackbar('Erro ao carregar histórico', 'error');
    }
  };

  const handleAbrirImpressao = (cupom) => {
    setCupomSelecionado(cupom);
    setCustomizacao({
      estilo: cupom.customizacao?.estilo || 'classico',
      corPrimaria: cupom.customizacao?.corPrimaria || '#9c27b0',
      corSecundaria: cupom.customizacao?.corSecundaria || '#ff4081',
      mostrarLogo: cupom.customizacao?.mostrarLogo !== false,
      mostrarQrCode: cupom.customizacao?.mostrarQrCode !== false,
      mensagemPersonalizada: cupom.customizacao?.mensagemPersonalizada || '',
      quantidade: 1,
      disposicao: 'vertical',
      tamanhoPapel: 'A4',
    });
    setOpenImpressaoDialog(true);
  };

  const gerarCupomHTML = (index = 0) => {
    const corPrimaria = customizacao.corPrimaria;
    const corSecundaria = customizacao.corSecundaria;
    const fonte = configuracoes?.tema?.fonte || 'Poppins';
    
    const larguraCupom = customizacao.disposicao === 'horizontal' ? '300px' : '400px';
    const margem = customizacao.disposicao === 'horizontal' ? '10px' : '20px auto';
    
    return `
      <div class="cupom-item" style="
        max-width: ${larguraCupom};
        width: 100%;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        position: relative;
        margin: ${margem};
        break-inside: avoid;
        page-break-inside: avoid;
      ">
        ${customizacao.estilo === 'moderno' ? `
          <div style="border: 2px solid ${corPrimaria}; border-radius: 16px;">
        ` : ''}
        ${customizacao.estilo === 'elegante' ? `
          <div style="border: 1px solid #e0e0e0; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        ` : ''}
        ${customizacao.estilo === 'vibrante' ? `
          <div style="background: linear-gradient(135deg, ${corPrimaria}10, ${corSecundaria}10);">
        ` : ''}
        ${customizacao.estilo === 'luxo' ? `
          <div style="border: 1px solid gold; box-shadow: 0 0 30px rgba(255,215,0,0.2);">
        ` : ''}
        
        <div style="background: ${corPrimaria}; color: white; padding: 20px; text-align: center; position: relative;">
          <div style="position: absolute; bottom: -10px; left: 0; right: 0; height: 20px; background: linear-gradient(to bottom right, transparent 49%, ${corPrimaria} 50%);"></div>
          ${customizacao.mostrarLogo && configuracoes?.salao?.logo ? `
            <img src="${configuracoes.salao.logo}" alt="Logo" style="max-width: 120px; max-height: 60px; object-fit: contain; margin-bottom: 10px;">
          ` : ''}
          <div style="font-size: 24px; font-weight: bold; margin: 10px 0 5px;">CUPOM DE DESCONTO</div>
        </div>
        
        <div style="padding: 30px 20px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px; margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 8px; display: inline-block;">
            ${cupomSelecionado?.codigo}
          </div>
          
          <div style="font-size: 48px; font-weight: bold; color: ${corPrimaria}; margin: 20px 0;">
            ${cupomSelecionado?.tipo === 'percentual' 
              ? `${cupomSelecionado?.valor}% OFF` 
              : `R$ ${cupomSelecionado?.valor?.toFixed(2)} OFF`}
            ${cupomSelecionado?.tipo === 'percentual' && cupomSelecionado?.valorMaximoDesconto ? 
              `<br><small style="font-size: 18px; color: #666;">Limitado a R$ ${cupomSelecionado.valorMaximoDesconto.toFixed(2)}</small>` : ''}
          </div>
          
          <div style="color: #666; margin: 20px 0; line-height: 1.6;">
            ${cupomSelecionado?.descricao || 'Aproveite esta oferta especial!'}
          </div>
          
          ${cupomSelecionado?.dataFim ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
              <strong style="color: ${corSecundaria};">Válido até:</strong> ${new Date(cupomSelecionado.dataFim).toLocaleDateString('pt-BR')}
            </div>
          ` : ''}
          
          <div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px;">
            <strong>Regras do cupom:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${cupomSelecionado?.valorMinimo > 0 ? 
                `<li>Valor mínimo da compra: R$ ${cupomSelecionado.valorMinimo.toFixed(2)}</li>` : ''}
              ${cupomSelecionado?.usoMaximo ? 
                `<li>Limite de ${cupomSelecionado.usoMaximo} uso(s) total(is)</li>` : ''}
              ${cupomSelecionado?.usoMaximoPorCliente > 1 ? 
                `<li>Máximo de ${cupomSelecionado.usoMaximoPorCliente} uso(s) por cliente</li>` : ''}
              ${cupomSelecionado?.primeiroAcesso ? 
                '<li>Válido apenas para primeiro atendimento</li>' : ''}
              ${cupomSelecionado?.clientesElegiveis === 'novos' ? 
                '<li>Válido apenas para novos clientes</li>' : ''}
              ${cupomSelecionado?.clientesElegiveis === 'vip' ? 
                '<li>Válido apenas para clientes VIP</li>' : ''}
            </ul>
          </div>
          
          ${customizacao.mostrarQrCode ? `
            <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 8px; display: inline-block;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(cupomSelecionado?.codigo || '')}" alt="QR Code" style="width: 120px; height: 120px;">
            </div>
          ` : ''}
          
          ${customizacao.mensagemPersonalizada ? `
            <div style="font-style: italic; color: ${corSecundaria}; margin: 20px 0; padding: 10px; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc;">
              "${customizacao.mensagemPersonalizada}"
            </div>
          ` : ''}
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0;">
          <div style="margin-bottom: 10px;">
            <strong>${configuracoes?.salao?.nome || 'BeautyPro'}</strong><br>
            ${configuracoes?.salao?.contato?.telefone ? `Tel: ${configuracoes.salao.contato.telefone}<br>` : ''}
            ${configuracoes?.salao?.contato?.whatsapp ? `WhatsApp: ${configuracoes.salao.contato.whatsapp}<br>` : ''}
            ${configuracoes?.salao?.endereco?.cidade ? `${configuracoes.salao.endereco.cidade} - ${configuracoes.salao.endereco.estado}` : ''}
          </div>
          <div>*Apresente este cupom no momento do atendimento</div>
        </div>
        
        ${customizacao.estilo !== 'classico' ? '</div>' : ''}
        ${customizacao.estilo !== 'classico' ? '</div>' : ''}
      </div>
    `;
  };

  const handleImprimirCupom = () => {
    const quantidade = customizacao.quantidade;
    const disposicao = customizacao.disposicao;
    const tamanhoPapel = customizacao.tamanhoPapel;
    const fonte = configuracoes?.tema?.fonte || 'Poppins';
    
    // Gerar HTML para todos os cupons
    let cuponsHTML = '';
    for (let i = 0; i < quantidade; i++) {
      cuponsHTML += gerarCupomHTML(i);
    }
    
    // Definir layout baseado na disposição
    const displayLayout = disposicao === 'horizontal' 
      ? 'display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;' 
      : 'display: block;';
    
    const janelaImpressao = window.open('', '_blank');
    
    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Cupom ${cupomSelecionado?.codigo} - ${quantidade} cópia(s)</title>
          <style>
            body { 
              font-family: '${fonte}', sans-serif;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
            }
            .cupons-container {
              ${displayLayout}
              max-width: ${tamanhoPapel === 'A4' ? '1200px' : tamanhoPapel === 'A5' ? '600px' : '1000px'};
              margin: 0 auto;
            }
            .cupom-item {
              transition: transform 0.2s;
            }
            @media print {
              body {
                padding: 0;
                background: white;
              }
              .cupons-container {
                display: ${disposicao === 'horizontal' ? 'flex' : 'block'};
                flex-wrap: ${disposicao === 'horizontal' ? 'wrap' : 'nowrap'};
                justify-content: center;
                gap: 20px;
                max-width: 100%;
              }
              .cupom-item {
                box-shadow: none;
                border: 1px solid #eee;
                margin: 0 auto 20px auto;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="cupons-container">
            ${cuponsHTML}
          </div>
          <div class="no-print" style="text-align: center; margin-top: 30px; padding: 20px;">
            <button onclick="window.print()" style="
              background: ${customizacao.corPrimaria};
              color: white;
              border: none;
              padding: 12px 30px;
              border-radius: 8px;
              cursor: pointer;
              margin-right: 15px;
              font-family: ${fonte};
              font-size: 16px;
              font-weight: bold;
            ">🖨️ Imprimir ${quantidade} Cupom(ns)</button>
            <button onclick="window.close()" style="
              background: #f44336;
              color: white;
              border: none;
              padding: 12px 30px;
              border-radius: 8px;
              cursor: pointer;
              font-family: ${fonte};
              font-size: 16px;
              font-weight: bold;
            ">✖️ Fechar</button>
          </div>
          <script>
            // Impedir que os botões apareçam na impressão
            window.onbeforeprint = function() {
              document.querySelectorAll('.no-print').forEach(el => el.style.display = 'none');
            };
            window.onafterprint = function() {
              document.querySelectorAll('.no-print').forEach(el => el.style.display = 'block');
            };
          </script>
        </body>
      </html>
    `);
    
    janelaImpressao.document.close();
    setOpenImpressaoDialog(false);
  };

  const handleDownloadPDF = () => {
    // Criar uma nova janela para visualização antes de imprimir
    const quantidade = customizacao.quantidade;
    const disposicao = customizacao.disposicao;
    const fonte = configuracoes?.tema?.fonte || 'Poppins';
    
    let cuponsHTML = '';
    for (let i = 0; i < quantidade; i++) {
      cuponsHTML += gerarCupomHTML(i);
    }
    
    const displayLayout = disposicao === 'horizontal' 
      ? 'display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;' 
      : 'display: block;';
    
    const janelaVisualizacao = window.open('', '_blank');
    
    janelaVisualizacao.document.write(`
      <html>
        <head>
          <title>Cupom ${cupomSelecionado?.codigo} - ${quantidade} cópia(s)</title>
          <style>
            body { 
              font-family: '${fonte}', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .cupons-container {
              ${displayLayout}
              max-width: 1200px;
              margin: 0 auto;
            }
            @media print {
              body {
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="cupons-container">
            ${cuponsHTML}
          </div>
        </body>
      </html>
    `);
    
    janelaVisualizacao.document.close();
    janelaVisualizacao.focus();
    janelaVisualizacao.print();
  };

  const cuponsFiltrados = cupons.filter(cupom => {
    const matchesTexto = filtro === '' || 
      cupom.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
      cupom.descricao?.toLowerCase().includes(filtro.toLowerCase());

    const matchesTipo = filtroTipo === 'todos' || cupom.tipo === filtroTipo;
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativo' && cupom.ativo) ||
      (filtroStatus === 'inativo' && !cupom.ativo);

    return matchesTexto && matchesTipo && matchesStatus;
  });

  const paginatedCupons = cuponsFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getTipoIcon = (tipo) => {
    const t = tiposCupom.find(t => t.value === tipo);
    return t?.icon || <TagIcon />;
  };

  const getStatusColor = (ativo, usosAtuais, usoMaximo) => {
    if (!ativo) return 'error';
    if (usoMaximo && usosAtuais >= usoMaximo) return 'warning';
    return 'success';
  };

  const getStatusLabel = (ativo, usosAtuais, usoMaximo) => {
    if (!ativo) return 'Inativo';
    if (usoMaximo && usosAtuais >= usoMaximo) return 'Esgotado';
    return 'Ativo';
  };

  const formatarData = (data) => {
    if (!data) return '';
    if (data.toDate) {
      return data.toDate().toLocaleDateString('pt-BR') + ' ' + 
             data.toDate().toLocaleTimeString('pt-BR');
    }
    return new Date(data).toLocaleDateString('pt-BR') + ' ' + 
           new Date(data).toLocaleTimeString('pt-BR');
  };

  const formatarMoeda = (valor) => {
    if (!valor && valor !== 0) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
              Cupons de Desconto
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gerencie todos os cupons e promoções
            </Typography>
          </Box>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              Novo Cupom
            </Button>
          </motion.div>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por código ou descrição..."
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
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtroTipo}
                    label="Tipo"
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <MenuItem value="todos">Todos os tipos</MenuItem>
                    {tiposCupom.map(tipo => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                    <MenuItem value="ativo">Ativos</MenuItem>
                    <MenuItem value="inativo">Inativos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={carregarDados}
                >
                  Atualizar
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabela de Cupons */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Código</strong></TableCell>
                  <TableCell><strong>Descrição</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell align="right"><strong>Desconto</strong></TableCell>
                  <TableCell><strong>Validade</strong></TableCell>
                  <TableCell><strong>Usos</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCupons.map((cupom, index) => (
                  <motion.tr
                    key={cupom.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                        {cupom.codigo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{cupom.descricao}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getTipoIcon(cupom.tipo)}
                        label={tiposCupom.find(t => t.value === cupom.tipo)?.label || cupom.tipo}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {cupom.tipo === 'percentual' ? `${cupom.valor}%` : formatarMoeda(cupom.valor)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {cupom.dataFim ? (
                        <Box>
                          <Typography variant="body2">
                            até {new Date(cupom.dataFim).toLocaleDateString('pt-BR')}
                          </Typography>
                          {new Date(cupom.dataFim) < new Date() && cupom.ativo && (
                            <Chip
                              label="Expirado"
                              size="small"
                              color="error"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Sem validade
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {cupom.usosAtuais || 0} / {cupom.usoMaximo || '∞'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(cupom.ativo, cupom.usosAtuais, cupom.usoMaximo)}
                        color={getStatusColor(cupom.ativo, cupom.usosAtuais, cupom.usoMaximo)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Histórico de uso">
                          <IconButton
                            size="small"
                            onClick={() => handleVerHistorico(cupom)}
                            sx={{ color: '#2196f3' }}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Imprimir Cupom">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrirImpressao(cupom)}
                            sx={{ color: '#4caf50' }}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(cupom)}
                            sx={{ color: '#ff4081' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={cupom.ativo ? 'Desativar' : 'Ativar'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(cupom)}
                            sx={{ color: cupom.ativo ? '#f44336' : '#4caf50' }}
                          >
                            {cupom.ativo ? <CancelIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))}
                {paginatedCupons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <TagIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Nenhum cupom encontrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={cuponsFiltrados.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* Dialog de Histórico de Uso */}
        <Dialog open={openHistoricoDialog} onClose={() => setOpenHistoricoDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon />
              <Typography variant="h6">
                Histórico de Uso - {cupomSelecionado?.codigo}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {historicoUsos.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Nenhum uso registrado para este cupom
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Data</strong></TableCell>
                      <TableCell><strong>Cliente</strong></TableCell>
                      <TableCell align="right"><strong>Valor Original</strong></TableCell>
                      <TableCell align="right"><strong>Desconto</strong></TableCell>
                      <TableCell align="right"><strong>Valor Final</strong></TableCell>
                      <TableCell><strong>Atendimento</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historicoUsos.map((uso, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatarData(uso.data)}</TableCell>
                        <TableCell>{uso.clienteNome || 'N/A'}</TableCell>
                        <TableCell align="right">{formatarMoeda(uso.valorOriginal || uso.valorTotal)}</TableCell>
                        <TableCell align="right" sx={{ color: '#4caf50' }}>
                          - {formatarMoeda(uso.descontoAplicado || uso.valorDesconto)}
                        </TableCell>
                        <TableCell align="right">{formatarMoeda(uso.valorFinal)}</TableCell>
                        <TableCell>
                          <Chip
                            label={`#${uso.atendimentoId?.slice(-6) || 'N/A'}`}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenHistoricoDialog(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Impressão/Customização de Cupom */}
        <Dialog open={openImpressaoDialog} onClose={() => setOpenImpressaoDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaletteIcon />
              <Typography variant="h6">
                Customizar e Imprimir Cupom - {cupomSelecionado?.codigo}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Estilo do Cupom
                </Typography>
                <RadioGroup
                  value={customizacao.estilo}
                  onChange={(e) => setCustomizacao({ ...customizacao, estilo: e.target.value })}
                >
                  <Grid container spacing={2}>
                    {estilosCupom.map((estilo) => (
                      <Grid item xs={6} key={estilo.value}>
                        <Paper
                          variant={customizacao.estilo === estilo.value ? 'elevation' : 'outlined'}
                          elevation={customizacao.estilo === estilo.value ? 3 : 0}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: customizacao.estilo === estilo.value ? `2px solid ${estilo.cor}` : '1px solid #e0e0e0',
                            '&:hover': {
                              borderColor: estilo.cor,
                            }
                          }}
                          onClick={() => setCustomizacao({ ...customizacao, estilo: estilo.value })}
                        >
                          <FormControlLabel
                            value={estilo.value}
                            control={<Radio />}
                            label={estilo.label}
                            sx={{ m: 0 }}
                          />
                          <Box
                            sx={{
                              width: '100%',
                              height: 4,
                              bgcolor: estilo.cor,
                              borderRadius: 2,
                              mt: 1
                            }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Cores
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Cor Primária"
                      type="color"
                      value={customizacao.corPrimaria}
                      onChange={(e) => setCustomizacao({ ...customizacao, corPrimaria: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PaletteIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Cor Secundária"
                      type="color"
                      value={customizacao.corSecundaria}
                      onChange={(e) => setCustomizacao({ ...customizacao, corSecundaria: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PaletteIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Opções de Exibição
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={customizacao.mostrarLogo}
                          onChange={(e) => setCustomizacao({ ...customizacao, mostrarLogo: e.target.checked })}
                        />
                      }
                      label="Mostrar Logo da Empresa"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={customizacao.mostrarQrCode}
                          onChange={(e) => setCustomizacao({ ...customizacao, mostrarQrCode: e.target.checked })}
                        />
                      }
                      label="Mostrar QR Code"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mensagem Personalizada"
                  multiline
                  rows={2}
                  value={customizacao.mensagemPersonalizada}
                  onChange={(e) => setCustomizacao({ ...customizacao, mensagemPersonalizada: e.target.value })}
                  placeholder="Ex: Apresente este cupom e ganhe um brinde especial!"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Configurações de Impressão
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Quantidade de cópias</Typography>
                    <Slider
                      value={customizacao.quantidade}
                      onChange={(e, newValue) => setCustomizacao({ ...customizacao, quantidade: newValue })}
                      min={1}
                      max={50}
                      step={1}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 10, label: '10' },
                        { value: 25, label: '25' },
                        { value: 50, label: '50' },
                      ]}
                      valueLabelDisplay="auto"
                    />
                    <Typography align="center">{customizacao.quantidade} cópia(s)</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Disposição</InputLabel>
                      <Select
                        value={customizacao.disposicao}
                        label="Disposição"
                        onChange={(e) => setCustomizacao({ ...customizacao, disposicao: e.target.value })}
                      >
                        <MenuItem value="vertical">Vertical (um abaixo do outro)</MenuItem>
                        <MenuItem value="horizontal">Horizontal (lado a lado)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Tamanho do Papel</InputLabel>
                      <Select
                        value={customizacao.tamanhoPapel}
                        label="Tamanho do Papel"
                        onChange={(e) => setCustomizacao({ ...customizacao, tamanhoPapel: e.target.value })}
                      >
                        <MenuItem value="A4">A4 (210x297mm)</MenuItem>
                        <MenuItem value="A5">A5 (148x210mm)</MenuItem>
                        <MenuItem value="Carta">Carta (216x279mm)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Prévia do Cupom
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        <strong>{cupomSelecionado?.codigo}</strong>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {cupomSelecionado?.descricao}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" sx={{ color: customizacao.corPrimaria }}>
                        {cupomSelecionado?.tipo === 'percentual' 
                          ? `${cupomSelecionado?.valor}% OFF` 
                          : formatarMoeda(cupomSelecionado?.valor)}
                      </Typography>
                    </Box>
                  </Box>
                  {customizacao.mensagemPersonalizada && (
                    <Typography variant="caption" sx={{ color: customizacao.corSecundaria, display: 'block', mt: 1 }}>
                      "{customizacao.mensagemPersonalizada}"
                    </Typography>
                  )}
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                    {customizacao.quantidade} cópia(s) • Disposição: {customizacao.disposicao === 'vertical' ? 'Vertical' : 'Horizontal'} • Papel: {customizacao.tamanhoPapel}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenImpressaoDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleImprimirCupom}
              variant="contained"
              startIcon={<PrintIcon />}
              sx={{ bgcolor: '#4caf50' }}
            >
              Visualizar e Imprimir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Cadastro/Edição */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            {cupomEditando ? 'Editar Cupom' : 'Novo Cupom'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Informações Básicas */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Código do Cupom"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  required
                  size="small"
                  placeholder="Ex: PROMO10"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Descrição"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  size="small"
                  placeholder="Ex: 10% de desconto em todos os serviços"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de Desconto</InputLabel>
                  <Select
                    name="tipo"
                    value={formData.tipo}
                    label="Tipo de Desconto"
                    onChange={handleInputChange}
                  >
                    {tiposCupom.map(tipo => (
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

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={formData.tipo === 'percentual' ? 'Percentual (%)' : 'Valor (R$)'}
                  name="valor"
                  type="number"
                  value={formData.valor}
                  onChange={handleInputChange}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: formData.tipo === 'percentual' ? 
                      <InputAdornment position="start">%</InputAdornment> : 
                      <InputAdornment position="start">R$</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Valor Mínimo da Compra"
                  name="valorMinimo"
                  type="number"
                  value={formData.valorMinimo}
                  onChange={handleInputChange}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>
                  }}
                />
              </Grid>

              {formData.tipo === 'percentual' && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Valor Máx. do Desconto"
                    name="valorMaximoDesconto"
                    type="number"
                    value={formData.valorMaximoDesconto}
                    onChange={handleInputChange}
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>
                    }}
                  />
                </Grid>
              )}

              {/* Validade */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                  Período de Validade
                </Typography>
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
                <FormControl fullWidth size="small">
                  <InputLabel>Dias da Semana (opcional)</InputLabel>
                  <Select
                    multiple
                    name="diasSemana"
                    value={formData.diasSemana}
                    label="Dias da Semana (opcional)"
                    onChange={handleInputChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={diasSemana.find(d => d.value === value)?.label} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {diasSemana.map(dia => (
                      <MenuItem key={dia.value} value={dia.value}>
                        <Checkbox checked={formData.diasSemana.indexOf(dia.value) > -1} />
                        <ListItemText primary={dia.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
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

              <Grid item xs={12} md={3}>
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

              {/* Limites de Uso */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                  Limites de Uso
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Uso Máximo Total"
                  name="usoMaximo"
                  type="number"
                  value={formData.usoMaximo}
                  onChange={handleInputChange}
                  size="small"
                  helperText="Deixe em branco para ilimitado"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Uso Máximo por Cliente"
                  name="usoMaximoPorCliente"
                  type="number"
                  value={formData.usoMaximoPorCliente}
                  onChange={handleInputChange}
                  size="small"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              {/* Restrições de Cliente */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                  Restrições de Cliente
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Clientes Elegíveis</InputLabel>
                  <Select
                    name="clientesElegiveis"
                    value={formData.clientesElegiveis}
                    label="Clientes Elegíveis"
                    onChange={handleInputChange}
                  >
                    {clientesElegiveis.map(opcao => (
                      <MenuItem key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {formData.clientesElegiveis === 'lista' && (
                <Grid item xs={12} md={8}>
                  <Autocomplete
                    multiple
                    options={clientes}
                    getOptionLabel={(option) => `${option.nome} - ${option.telefone || ''}`}
                    value={clientes.filter(c => formData.listaClientesIds.includes(c.id))}
                    onChange={(e, newValue) => {
                      setFormData({
                        ...formData,
                        listaClientesIds: newValue.map(c => c.id)
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Selecionar Clientes"
                        size="small"
                        placeholder="Buscar clientes..."
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Níveis Permitidos</InputLabel>
                  <Select
                    multiple
                    name="niveisPermitidos"
                    value={formData.niveisPermitidos}
                    label="Níveis Permitidos"
                    onChange={handleInputChange}
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
                        <Checkbox checked={formData.niveisPermitidos.indexOf(nivel) > -1} />
                        <ListItemText primary={nivel.toUpperCase()} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Restrições de Serviços/Produtos */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                  Restrições de Serviços
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Serviços Elegíveis</InputLabel>
                  <Select
                    name="servicosElegiveis"
                    value={formData.servicosElegiveis}
                    label="Serviços Elegíveis"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="todos">Todos os serviços</MenuItem>
                    <MenuItem value="lista">Apenas selecionados</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.servicosElegiveis === 'lista' && (
                <Grid item xs={12} md={8}>
                  <Autocomplete
                    multiple
                    options={servicos}
                    getOptionLabel={(option) => `${option.nome} - R$ ${option.preco?.toFixed(2)}`}
                    value={servicos.filter(s => formData.listaServicosIds.includes(s.id))}
                    onChange={(e, newValue) => {
                      setFormData({
                        ...formData,
                        listaServicosIds: newValue.map(s => s.id)
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Selecionar Serviços"
                        size="small"
                        placeholder="Buscar serviços..."
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                  Produtos Elegíveis
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Produtos Elegíveis</InputLabel>
                  <Select
                    name="produtosElegiveis"
                    value={formData.produtosElegiveis}
                    label="Produtos Elegíveis"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="todos">Todos os produtos</MenuItem>
                    <MenuItem value="lista">Apenas selecionados</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.produtosElegiveis === 'lista' && (
                <Grid item xs={12} md={8}>
                  <Autocomplete
                    multiple
                    options={produtos}
                    getOptionLabel={(option) => `${option.nome} - R$ ${option.precoVenda?.toFixed(2)}`}
                    value={produtos.filter(p => formData.listaProdutosIds.includes(p.id))}
                    onChange={(e, newValue) => {
                      setFormData({
                        ...formData,
                        listaProdutosIds: newValue.map(p => p.id)
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Selecionar Produtos"
                        size="small"
                        placeholder="Buscar produtos..."
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Customização do Cupom */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mt: 2, mb: 1 }}>
                  Customização do Cupom
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Opções de Personalização</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Estilo do Cupom</InputLabel>
                          <Select
                            name="estilo"
                            value={formData.customizacao.estilo}
                            label="Estilo do Cupom"
                            onChange={handleCustomizacaoChange}
                          >
                            {estilosCupom.map(estilo => (
                              <MenuItem key={estilo.value} value={estilo.value}>
                                {estilo.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Cor Primária"
                          name="corPrimaria"
                          type="color"
                          value={formData.customizacao.corPrimaria}
                          onChange={handleCustomizacaoChange}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Cor Secundária"
                          name="corSecundaria"
                          type="color"
                          value={formData.customizacao.corSecundaria}
                          onChange={handleCustomizacaoChange}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.customizacao.mostrarLogo}
                              onChange={handleCustomizacaoChange}
                              name="mostrarLogo"
                            />
                          }
                          label="Mostrar logo da empresa"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.customizacao.mostrarQrCode}
                              onChange={handleCustomizacaoChange}
                              name="mostrarQrCode"
                            />
                          }
                          label="Mostrar QR Code"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Mensagem Personalizada"
                          name="mensagemPersonalizada"
                          multiline
                          rows={2}
                          value={formData.customizacao.mensagemPersonalizada}
                          onChange={handleCustomizacaoChange}
                          placeholder="Ex: Apresente este cupom e ganhe um brinde especial!"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Opções adicionais */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.ativo}
                        onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      />
                    }
                    label="Cupom ativo"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.primeiroAcesso}
                        onChange={(e) => setFormData({ ...formData, primeiroAcesso: e.target.checked })}
                      />
                    }
                    label="Apenas para primeiro acesso"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={handleSalvar}
              variant="contained"
              sx={{ bgcolor: '#9c27b0' }}
            >
              {cupomEditando ? 'Atualizar' : 'Criar Cupom'}
            </Button>
          </DialogActions>
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

export default GerenciarCupons;
