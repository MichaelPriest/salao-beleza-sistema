// src/pages/ModernAtendimentos.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Timer as TimerIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  WhatsApp as WhatsAppIcon,
  Business as BusinessIcon,
  PlayArrow as PlayIcon,
  Block as BlockIcon,
  ExpandMore as ExpandMoreIcon,
  Receipt as ReceiptIcon,
  LocalOffer as CouponIcon,
  Star as StarIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';
import { Timestamp } from '../services/firebase';

// Importar o logo
import logo from '../assets/logo.png';

// 🔥 FUNÇÃO PARA OBTER DADOS DO CLIENTE DE FORMA SEGURA
const getClienteData = (clienteId, clientes) => {
  if (!clienteId || !clientes) return null;
  
  const cliente = clientes.find(c => 
    c.id === clienteId || 
    c.uid === clienteId || 
    c.googleUid === clienteId
  );
  
  if (!cliente) return null;
  
  return {
    id: cliente.id || cliente.uid || cliente.googleUid,
    nome: cliente.nome || cliente.displayName || 'Cliente',
    telefone: cliente.telefone || cliente.phoneNumber || 'Não informado',
    email: cliente.email || '',
    cpf: cliente.cpf || cliente.documento || '',
    rg: cliente.rg || '',
    foto: cliente.foto || cliente.photoURL || cliente.avatar || null,
    dataNascimento: cliente.dataNascimento || '',
    genero: cliente.genero || '',
    cep: cliente.cep || '',
    logradouro: cliente.logradouro || '',
    numero: cliente.numero || '',
    complemento: cliente.complemento || '',
    bairro: cliente.bairro || '',
    cidade: cliente.cidade || '',
    estado: cliente.estado || '',
    status: cliente.status || 'Ativo',
    observacoes: cliente.observacoes || '',
    indicadoPor: cliente.indicadoPor || '',
    indicadoPorNome: cliente.indicadoPorNome || '',
    nivel: cliente.nivel || 'bronze',
    pontos: cliente.pontos || 0,
  };
};

// 🔥 FUNÇÃO PARA OBTER DADOS DO PROFISSIONAL
const getProfissionalData = (profissionalId, profissionais) => {
  if (!profissionalId || !profissionais) return null;
  
  const profissional = profissionais.find(p => 
    p.id === profissionalId || 
    p.uid === profissionalId
  );
  
  if (!profissional) return null;
  
  return {
    id: profissional.id || profissional.uid,
    nome: profissional.nome || profissional.displayName || 'Profissional',
    especialidade: profissional.especialidade || profissional.cargo || '',
    foto: profissional.foto || profissional.photoURL || null,
    telefone: profissional.telefone || '',
    email: profissional.email || '',
    comissao: profissional.comissao || 40,
  };
};

function ModernAtendimentos() {
  const [comandasDigitais, setComandasDigitais] = useState([]);
  const [novaComandaDigital, setNovaComandaDigital] = useState({ cliente: '', itens: '', valor: '' });

  const abrirComandaDigital = () => {
    if (!novaComandaDigital.cliente.trim()) return;
    setComandasDigitais((atuais) => [{ id: Date.now(), ...novaComandaDigital, status: 'Aberta' }, ...atuais]);
    setNovaComandaDigital({ cliente: '', itens: '', valor: '' });
  };

  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [cargo, setCargo] = useState('');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openFilter, setOpenFilter] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [selectedAtendimento, setSelectedAtendimento] = useState(null);
  const [config, setConfig] = useState(null);
  const [filtros, setFiltros] = useState({
    status: 'todos',
    profissional: 'todos',
    periodo: 'todos',
  });

  // Estados para dados do Firebase
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [fidelidade, setFidelidade] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para opções de impressão
  const [printOptions, setPrintOptions] = useState({
    incluirLogo: true,
    incluirEndereco: true,
    incluirContato: true,
    incluirRedesSociais: true,
    incluirFidelidade: true,
    incluirCupons: true,
    incluirQRCode: true,
    incluirAssinatura: true,
    formato: 'A4',
  });

  // Carregar dados do usuário
  useEffect(() => {
    const user = usuariosService.getUsuarioAtual();
    setUsuario(user);
    setCargo(user?.cargo || '');
    
    carregarTodosDados();
  }, []);

  const carregarTodosDados = async () => {
    try {
      setLoading(true);
      
      const [atendimentosData, clientesData, profissionaisData, servicosData, produtosData, pagamentosData, cuponsData, fidelidadeData, configData] = await Promise.all([
        firebaseService.getAll('atendimentos'),
        firebaseService.getAll('clientes'),
        firebaseService.getAll('profissionais'),
        firebaseService.getAll('servicos'),
        firebaseService.getAll('produtos'),
        firebaseService.getAll('pagamentos'),
        firebaseService.getAll('cupons'),
        firebaseService.getAll('pontuacao'),
        carregarConfiguracoes()
      ]);

      setAtendimentos(atendimentosData || []);
      setClientes(clientesData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);
      setProdutos(produtosData || []);
      setPagamentos(pagamentosData || []);
      setCupons(cuponsData || []);
      setFidelidade(fidelidadeData || []);
      setConfig(configData);

      console.log('✅ Dados carregados do Firebase');
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const carregarConfiguracoes = async () => {
    try {
      const configs = await firebaseService.getAll('configuracoes');
      return configs[0] || null;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return null;
    }
  };

  // Função para filtrar atendimentos por cargo
  const filtrarAtendimentosPorUsuario = (atendimentosList) => {
    if (!usuario) return atendimentosList;

    if (cargo === 'cliente' && usuario.clienteId) {
      return atendimentosList.filter(a => a.clienteId === usuario.clienteId);
    }

    if (cargo === 'profissional' && usuario.profissionalId) {
      return atendimentosList.filter(a => a.profissionalId === usuario.profissionalId);
    }

    return atendimentosList;
  };

  // Função para obter o serviço por ID
  const getServicoById = (id) => {
    return servicos.find(s => s.id === id);
  };

  // Função para obter todos os serviços do atendimento
  const getTodosServicos = (atendimento) => {
    const servicosLista = [];
    
    if (atendimento.itensServico && atendimento.itensServico.length > 0) {
      atendimento.itensServico.forEach(item => {
        servicosLista.push({
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          principal: item.principal || false,
          duracao: item.duracao || 0
        });
      });
    } 
    else if (atendimento.servicoId) {
      const servico = getServicoById(atendimento.servicoId);
      if (servico) {
        servicosLista.push({
          id: servico.id,
          nome: servico.nome,
          preco: servico.preco,
          principal: true,
          duracao: servico.duracao || 0
        });
      }
    }
    
    return servicosLista;
  };

  // Função para obter o pagamento do atendimento
  const getPagamentoAtendimento = (atendimentoId) => {
    return pagamentos?.find(p => p.atendimentoId === atendimentoId);
  };

  // Função para obter cupons aplicados
  const getCuponsAplicados = (atendimento) => {
    if (!atendimento.cuponsAplicados) return [];
    return atendimento.cuponsAplicados;
  };

  // Função para obter pontos de fidelidade do atendimento
  const getPontosFidelidade = (atendimento) => {
    return fidelidade?.filter(f => f.atendimentoId === atendimento.id) || [];
  };

  // Calcular valor total do atendimento
  const calcularValorTotal = (atendimento) => {
    if (atendimento.valorTotal) {
      return atendimento.valorTotal;
    }
    
    let total = 0;
    const servicos = getTodosServicos(atendimento);
    total += servicos.reduce((acc, s) => acc + (s.preco || 0), 0);
    
    if (atendimento.itensProduto && atendimento.itensProduto.length > 0) {
      total += atendimento.itensProduto.reduce((acc, item) => 
        acc + ((item.preco || 0) * (item.quantidade || 1)), 0);
    }
    
    if (atendimento.descontoTotal) {
      total -= atendimento.descontoTotal;
    }
    
    return total;
  };

  // Calcular subtotal (sem descontos)
  const calcularSubtotal = (atendimento) => {
    let total = 0;
    const servicos = getTodosServicos(atendimento);
    total += servicos.reduce((acc, s) => acc + (s.preco || 0), 0);
    
    if (atendimento.itensProduto && atendimento.itensProduto.length > 0) {
      total += atendimento.itensProduto.reduce((acc, item) => 
        acc + ((item.preco || 0) * (item.quantidade || 1)), 0);
    }
    
    return total;
  };

  // Obter lista de serviços para exibição resumida
  const getServicosResumo = (atendimento) => {
    const servicos = getTodosServicos(atendimento);
    return servicos.map(s => s.nome).join(', ');
  };

  // Calcular duração total
  const calcularDuracaoTotal = (atendimento) => {
    const servicos = getTodosServicos(atendimento);
    const totalMinutos = servicos.reduce((acc, s) => acc + (s.duracao || 0), 0);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas}h ${minutos}min`;
  };

  // Calcular estatísticas baseado no cargo
  const calcularStats = () => {
    const atendimentosFiltrados = filtrarAtendimentosPorUsuario(atendimentos);
    
    return {
      total: atendimentosFiltrados.length,
      finalizados: atendimentosFiltrados.filter(a => a.status === 'finalizado').length,
      em_andamento: atendimentosFiltrados.filter(a => a.status === 'em_andamento').length,
      agendados: atendimentosFiltrados.filter(a => a.status === 'agendado').length,
      cancelados: atendimentosFiltrados.filter(a => a.status === 'cancelado').length,
      totalFaturado: atendimentosFiltrados
        .filter(a => a.status === 'finalizado')
        .reduce((acc, a) => acc + calcularValorTotal(a), 0),
    };
  };

  const stats = calcularStats();

  // Filtrar atendimentos
  const atendimentosFiltradosPorUsuario = filtrarAtendimentosPorUsuario(atendimentos);
  
  const filteredAtendimentos = atendimentosFiltradosPorUsuario.filter(atendimento => {
    const cliente = getClienteData(atendimento.clienteId, clientes);
    const profissional = getProfissionalData(atendimento.profissionalId, profissionais);
    const servicosResumo = getServicosResumo(atendimento);
    const dataAtendimento = new Date(atendimento.data);
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    
    const matchesSearch = searchTerm === '' || 
      cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profissional?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicosResumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atendimento.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filtros.status === 'todos' || atendimento.status === filtros.status;
    
    const matchesProfissional = cargo === 'profissional' || 
      filtros.profissional === 'todos' || 
      atendimento.profissionalId === filtros.profissional;
    
    let matchesPeriodo = true;
    if (filtros.periodo === 'hoje') {
      matchesPeriodo = atendimento.data === hoje.toISOString().split('T')[0];
    } else if (filtros.periodo === 'semana') {
      matchesPeriodo = dataAtendimento >= inicioSemana && dataAtendimento <= fimSemana;
    } else if (filtros.periodo === 'mes') {
      matchesPeriodo = dataAtendimento.getMonth() === hoje.getMonth() && 
                      dataAtendimento.getFullYear() === hoje.getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesProfissional && matchesPeriodo;
  });

  const handleFinalizar = (id) => {
    if (cargo === 'cliente') {
      toast.error('Você não tem permissão para acessar esta funcionalidade');
      return;
    }
    navigate(`/atendimento/${id}`);
  };

  const handleVerDetalhes = (atendimento) => {
    console.log('Abrindo detalhes do atendimento:', atendimento);
    setSelectedAtendimento(atendimento);
    setOpenDetails(true);
  };

  const handleCancelar = async (id) => {
    if (cargo === 'cliente') {
      toast.error('Você não tem permissão para cancelar atendimentos');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja cancelar este atendimento?')) {
      try {
        await firebaseService.update('atendimentos', id, { 
          status: 'cancelado',
          updatedAt: Timestamp.now(),
          canceladoPor: usuario?.nome || 'Sistema',
          canceladoEm: Timestamp.now()
        });
        toast.success('Atendimento cancelado com sucesso!');
        carregarTodosDados();
      } catch (error) {
        console.error('Erro ao cancelar atendimento:', error);
        toast.error('Erro ao cancelar atendimento');
      }
    }
  };

  const handleReabrir = async (id) => {
    if (cargo === 'cliente' || cargo === 'profissional') {
      toast.error('Você não tem permissão para reabrir atendimentos');
      return;
    }
    
    if (window.confirm('Deseja reabrir este atendimento?')) {
      try {
        await firebaseService.update('atendimentos', id, { 
          status: 'em_andamento',
          updatedAt: Timestamp.now()
        });
        toast.success('Atendimento reaberto!');
        carregarTodosDados();
      } catch (error) {
        console.error('Erro ao reabrir atendimento:', error);
        toast.error('Erro ao reabrir atendimento');
      }
    }
  };

  const handleOpenPrintDialog = (atendimento) => {
    setSelectedAtendimento(atendimento);
    setOpenPrintDialog(true);
  };

  const handleImprimir = () => {
    const atendimento = selectedAtendimento;
    const cliente = getClienteData(atendimento.clienteId, clientes);
    const profissional = getProfissionalData(atendimento.profissionalId, profissionais);
    const todosServicos = getTodosServicos(atendimento);
    const produtos = atendimento.itensProduto || [];
    const subtotal = calcularSubtotal(atendimento);
    const valorTotal = calcularValorTotal(atendimento);
    const pagamento = getPagamentoAtendimento(atendimento.id);
    const cuponsAplicados = getCuponsAplicados(atendimento);
    const pontosFidelidade = getPontosFidelidade(atendimento);
    const data = new Date();
    
    // Dados da empresa
    const empresa = config?.salao || {
      nome: 'Serena',
      cnpj: '39.711.633/0001-5',
      ie: '123.456.789.012',
      nomeFantasia: 'Serena Beauty',
      endereco: { 
        logradouro: 'Rua Exemplo, 123', 
        bairro: 'Centro', 
        cidade: 'São Paulo', 
        estado: 'SP', 
        cep: '01000-000' 
      },
      contato: { 
        telefone: '(11) 99999-9999', 
        email: 'contato@serena.com',
        whatsapp: '(11) 99999-9999',
        instagram: '@serenabeauty',
        facebook: '/serenabeauty',
        site: 'www.serena.com'
      }
    };

    const logoUrl = logo || empresa.logo || '';

    const getFormaPagamentoLabel = (forma) => {
      const formas = {
        'dinheiro': 'Dinheiro',
        'cartao_credito': 'Cartão de Crédito',
        'cartao_debito': 'Cartão de Débito',
        'pix': 'PIX',
        'boleto': 'Boleto',
        'transferencia': 'Transferência',
        'credito_loja': 'Crédito na Loja'
      };
      return formas[forma] || forma;
    };

    const estilo = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: #f5f5f5;
          display: flex;
          justify-content: center;
        }
        
        .print-container {
          max-width: ${printOptions.formato === 'A4' ? '210mm' : printOptions.formato === 'A5' ? '148mm' : '80mm'};
          width: 100%;
          background: white;
          margin: 0 auto;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .content {
          padding: ${printOptions.formato.includes('termica') ? '5mm' : '15mm'};
        }
        
        .header { 
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px; 
          border-bottom: 2px solid #9c27b0; 
          padding-bottom: 15px;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo {
          max-height: ${printOptions.formato.includes('termica') ? '40px' : '60px'};
          max-width: ${printOptions.formato.includes('termica') ? '100px' : '150px'};
        }
        
        .empresa-info {
          text-align: right;
          font-size: ${printOptions.formato.includes('termica') ? '10px' : '12px'};
        }
        
        .empresa-nome { 
          color: #9c27b0; 
          font-size: ${printOptions.formato.includes('termica') ? '16px' : '24px'}; 
          font-weight: bold; 
          margin: 0; 
        }
        
        .empresa-detalhe { 
          color: #666; 
          font-size: ${printOptions.formato.includes('termica') ? '8px' : '11px'}; 
          margin: 2px 0; 
        }
        
        .titulo { 
          color: #9c27b0; 
          font-size: ${printOptions.formato.includes('termica') ? '14px' : '18px'}; 
          margin: 15px 0 10px; 
          text-align: center;
          font-weight: bold;
        }
        
        .info-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 10px; 
          margin: 15px 0; 
          font-size: ${printOptions.formato.includes('termica') ? '10px' : '12px'};
        }
        
        .info-item { 
          margin: 3px 0; 
        }
        
        .info-label { 
          color: #666; 
          font-size: ${printOptions.formato.includes('termica') ? '8px' : '10px'}; 
          margin-bottom: 2px;
        }
        
        .info-value { 
          font-weight: bold; 
          margin: 0; 
          font-size: ${printOptions.formato.includes('termica') ? '10px' : '14px'};
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 15px 0; 
          font-size: ${printOptions.formato.includes('termica') ? '9px' : '12px'};
        }
        
        th { 
          background-color: #9c27b0; 
          color: white; 
          padding: ${printOptions.formato.includes('termica') ? '5px' : '8px'}; 
          text-align: left; 
          font-size: ${printOptions.formato.includes('termica') ? '9px' : '12px'};
        }
        
        td { 
          padding: ${printOptions.formato.includes('termica') ? '5px' : '8px'}; 
          border-bottom: 1px solid #ddd; 
        }
        
        .total-section { 
          margin-top: 20px; 
          text-align: right; 
          border-top: 2px solid #9c27b0; 
          padding-top: 15px; 
        }
        
        .total { 
          font-size: ${printOptions.formato.includes('termica') ? '14px' : '18px'}; 
          font-weight: bold; 
          color: #9c27b0; 
        }
        
        .subtotal {
          font-size: ${printOptions.formato.includes('termica') ? '11px' : '14px'};
          color: #666;
        }
        
        .desconto {
          color: #4caf50;
          font-weight: bold;
        }
        
        .pagamento-info {
          margin-top: 10px;
          font-size: ${printOptions.formato.includes('termica') ? '10px' : '12px'};
        }
        
        .footer { 
          margin-top: 30px; 
          text-align: center; 
          color: #666; 
          font-size: ${printOptions.formato.includes('termica') ? '8px' : '10px'}; 
          border-top: 1px solid #ddd; 
          padding-top: 15px; 
        }
        
        .redes-sociais {
          margin-top: 10px;
          font-size: ${printOptions.formato.includes('termica') ? '8px' : '10px'};
        }
        
        .qr-code {
          text-align: center;
          margin: 15px 0;
        }
        
        .qr-code img {
          width: ${printOptions.formato.includes('termica') ? '60px' : '100px'};
          height: ${printOptions.formato.includes('termica') ? '60px' : '100px'};
        }
        
        .assinatura {
          margin-top: 30px;
          text-align: center;
        }
        
        .assinatura-linha {
          width: 200px;
          border-top: 1px solid #000;
          margin: 20px auto 5px;
        }
        
        .cupom-item {
          background: #f3e5f5;
          padding: 5px;
          margin: 3px 0;
          border-radius: 3px;
          font-size: ${printOptions.formato.includes('termica') ? '8px' : '11px'};
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .print-container {
            box-shadow: none;
            max-width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    `;

    const conteudo = `
      <html>
        <head>
          <title>Comprovante de Atendimento #${atendimento.id?.slice(-6) || '000000'}</title>
          ${estilo}
        </head>
        <body>
          <div class="print-container">
            <div class="content">
              <!-- Cabeçalho -->
              <div class="header">
                <div class="logo-container">
                  ${printOptions.incluirLogo && logoUrl ? `
                    <img src="${logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'">
                  ` : ''}
                  <div>
                    <h1 class="empresa-nome">${empresa.nome || 'Serena'}</h1>
                    ${empresa.nomeFantasia && printOptions.formato !== 'termica' ? `
                      <p class="empresa-detalhe">${empresa.nomeFantasia}</p>
                    ` : ''}
                  </div>
                </div>
                <div class="empresa-info">
                  ${empresa.cnpj ? `<p class="empresa-detalhe">CNPJ: ${empresa.cnpj}</p>` : ''}
                  ${empresa.ie ? `<p class="empresa-detalhe">IE: ${empresa.ie}</p>` : ''}
                  ${printOptions.incluirEndereco && empresa.endereco?.logradouro ? `
                    <p class="empresa-detalhe">
                      ${empresa.endereco.logradouro}${empresa.endereco.numero ? `, ${empresa.endereco.numero}` : ''}
                      ${empresa.endereco.bairro ? `<br>${empresa.endereco.bairro}` : ''}
                      ${empresa.endereco.cidade ? `<br>${empresa.endereco.cidade} - ${empresa.endereco.estado}` : ''}
                      ${empresa.endereco.cep ? `<br>CEP: ${empresa.endereco.cep}` : ''}
                    </p>
                  ` : ''}
                </div>
              </div>

              <!-- Título -->
              <h2 class="titulo">COMPROVANTE DE ATENDIMENTO</h2>
              <p style="text-align: center; font-size: 12px; color: #666; margin-bottom: 15px;">
                #${atendimento.id?.slice(-6) || '000000'}
              </p>
              
              <!-- Informações do Cliente e Profissional -->
              <div class="info-grid">
                <div class="info-item">
                  <p class="info-label">Cliente</p>
                  <p class="info-value">${cliente?.nome || 'N/A'}</p>
                  ${cliente?.cpf ? `<p class="empresa-detalhe">CPF: ${cliente.cpf}</p>` : ''}
                  ${printOptions.incluirContato && cliente?.telefone ? `
                    <p class="empresa-detalhe">Tel: ${cliente.telefone}</p>
                  ` : ''}
                  ${cliente?.email ? `<p class="empresa-detalhe">Email: ${cliente.email}</p>` : ''}
                </div>
                <div class="info-item">
                  <p class="info-label">Profissional</p>
                  <p class="info-value">${profissional?.nome || 'N/A'}</p>
                  ${profissional?.especialidade ? `
                    <p class="empresa-detalhe">${profissional.especialidade}</p>
                  ` : ''}
                </div>
                <div class="info-item">
                  <p class="info-label">Data</p>
                  <p class="info-value">${new Date(atendimento.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <div class="info-item">
                  <p class="info-label">Horário</p>
                  <p class="info-value">${atendimento.horaInicio || ''} - ${atendimento.horaFim || ''}</p>
                </div>
                <div class="info-item">
                  <p class="info-label">Duração</p>
                  <p class="info-value">${calcularDuracaoTotal(atendimento)}</p>
                </div>
                <div class="info-item">
                  <p class="info-label">Status</p>
                  <p class="info-value" style="color: ${atendimento.status === 'finalizado' ? '#4caf50' : '#ff9800'}">
                    ${atendimento.status === 'finalizado' ? 'Finalizado' : 
                      atendimento.status === 'em_andamento' ? 'Em Andamento' : 
                      atendimento.status === 'agendado' ? 'Agendado' : 'Cancelado'}
                  </p>
                </div>
              </div>

              <!-- Serviços -->
              <h3 class="titulo" style="font-size: 14px; text-align: left;">Serviços Realizados</h3>
              <table>
                <thead>
                  <tr>
                    <th>Serviço</th>
                    <th align="right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  ${todosServicos.map(s => `
                    <tr>
                      <td>${s.nome} ${s.principal ? '(Principal)' : ''}</td>
                      <td align="right">R$ ${(s.preco || 0).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Produtos -->
              ${produtos.length > 0 ? `
                <h3 class="titulo" style="font-size: 14px; text-align: left;">Produtos Utilizados</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th align="right">Qtd</th>
                      <th align="right">Preço Unit.</th>
                      <th align="right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${produtos.map(p => `
                      <tr>
                        <td>${p.nome}</td>
                        <td align="right">${p.quantidadeVenda || p.quantidade || 1}</td>
                        <td align="right">R$ ${(p.preco || 0).toFixed(2)}</td>
                        <td align="right">R$ ${((p.preco || 0) * (p.quantidadeVenda || p.quantidade || 1)).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}

              <!-- Cupons Aplicados -->
              ${printOptions.incluirCupons && cuponsAplicados.length > 0 ? `
                <h3 class="titulo" style="font-size: 14px; text-align: left;">Cupons Aplicados</h3>
                ${cuponsAplicados.map(cupom => `
                  <div class="cupom-item">
                    <strong>${cupom.codigo}</strong> - ${cupom.descricao || ''}
                    <span style="float: right; color: #4caf50;">-R$ ${(cupom.valorDescontoCalculado || cupom.valor || 0).toFixed(2)}</span>
                  </div>
                `).join('')}
              ` : ''}

              <!-- Resumo Financeiro -->
              <div class="total-section">
                <p class="subtotal">Subtotal: R$ ${subtotal.toFixed(2)}</p>
                ${(atendimento.descontoTotal || 0) > 0 ? `
                  <p class="desconto">Descontos: -R$ ${(atendimento.descontoTotal || 0).toFixed(2)}</p>
                ` : ''}
                <p class="total">Total: R$ ${valorTotal.toFixed(2)}</p>
                
                ${pagamento ? `
                  <div class="pagamento-info">
                    <p><strong>Forma de Pagamento:</strong> ${getFormaPagamentoLabel(pagamento.formaPagamento)}</p>
                    ${pagamento.parcelas > 1 ? `<p><strong>Parcelas:</strong> ${pagamento.parcelas}x</p>` : ''}
                    ${pagamento.observacoes ? `<p><strong>Obs:</strong> ${pagamento.observacoes}</p>` : ''}
                  </div>
                ` : ''}
              </div>

              <!-- Pontos de Fidelidade -->
              ${printOptions.incluirFidelidade && pontosFidelidade.length > 0 ? `
                <div style="margin-top: 20px; padding: 10px; background: #fff3e0; border-radius: 5px;">
                  <p style="font-weight: bold; color: #ff9800;">⭐ Fidelidade</p>
                  ${pontosFidelidade.map(p => `
                    <p style="font-size: 12px; margin: 2px 0;">
                      +${p.quantidade} pontos - ${p.motivo || 'Atendimento'}
                    </p>
                  `).join('')}
                  <p style="font-size: 12px; margin-top: 5px;">
                    <strong>Saldo atual:</strong> ${(cliente?.pontos || 0) + pontosFidelidade.reduce((acc, p) => acc + p.quantidade, 0)} pontos
                  </p>
                </div>
              ` : ''}

              <!-- Observações -->
              ${atendimento.observacoes ? `
                <div style="margin-top: 20px;">
                  <p class="info-label">Observações</p>
                  <p style="font-size: 12px;">${atendimento.observacoes}</p>
                </div>
              ` : ''}

              <!-- QR Code -->
              ${printOptions.incluirQRCode && !printOptions.formato.includes('termica') ? `
                <div class="qr-code">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(atendimento.id || '')}" alt="QR Code">
                  <p style="font-size: 10px; color: #666;">ID: ${atendimento.id?.slice(-6) || '000000'}</p>
                </div>
              ` : ''}

              <!-- Assinatura -->
              ${printOptions.incluirAssinatura ? `
                <div class="assinatura">
                  <div class="assinatura-linha"></div>
                  <p style="font-size: 12px;">Assinatura do Cliente</p>
                </div>
              ` : ''}

              <!-- Redes Sociais -->
              ${printOptions.incluirRedesSociais && !printOptions.formato.includes('termica') ? `
                <div class="redes-sociais">
                  ${empresa.contato?.instagram ? `<p>📱 Instagram: ${empresa.contato.instagram}</p>` : ''}
                  ${empresa.contato?.facebook ? `<p>📘 Facebook: ${empresa.contato.facebook}</p>` : ''}
                  ${empresa.contato?.site ? `<p>🌐 Site: ${empresa.contato.site}</p>` : ''}
                </div>
              ` : ''}

              <!-- Rodapé -->
              <div class="footer">
                <p>Documento gerado em ${data.toLocaleString('pt-BR')}</p>
                <p>Obrigado pela preferência! Volte sempre.</p>
                ${printOptions.incluirContato && empresa.contato?.whatsapp ? `
                  <p>WhatsApp: ${empresa.contato.whatsapp}</p>
                ` : ''}
              </div>
            </div>
          </div>
          
          <!-- Botões de controle (não aparecem na impressão) -->
          <div class="no-print" style="text-align: center; margin-top: 30px; padding: 20px;">
            <button onclick="window.print()" style="
              background: #9c27b0;
              color: white;
              border: none;
              padding: 12px 30px;
              border-radius: 8px;
              cursor: pointer;
              margin-right: 15px;
              font-size: 16px;
              font-weight: bold;
            ">🖨️ Imprimir</button>
            <button onclick="window.close()" style="
              background: #f44336;
              color: white;
              border: none;
              padding: 12px 30px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
            ">✖️ Fechar</button>
          </div>
          
          <script>
            window.onbeforeprint = function() {
              document.querySelectorAll('.no-print').forEach(el => el.style.display = 'none');
            };
            window.onafterprint = function() {
              document.querySelectorAll('.no-print').forEach(el => el.style.display = 'block');
            };
          </script>
        </body>
      </html>
    `;
    
    const janela = window.open('', '_blank');
    janela.document.write(conteudo);
    janela.document.close();
    setOpenPrintDialog(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'finalizado': return 'success';
      case 'em_andamento': return 'warning';
      case 'agendado': return 'info';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'finalizado': return <CheckIcon />;
      case 'em_andamento': return <TimerIcon />;
      case 'agendado': return <ScheduleIcon />;
      case 'cancelado': return <CancelIcon />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'finalizado': return 'Finalizado';
      case 'em_andamento': return 'Em Andamento';
      case 'agendado': return 'Agendado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const calcularDuracao = (inicio, fim) => {
    if (!inicio || !fim) return '---';
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fim.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    const horas = Math.floor(diff / 60);
    const minutos = diff % 60;
    return `${horas}h ${minutos}min`;
  };

  const handleEnviarWhatsApp = (atendimento) => {
    const cliente = getClienteData(atendimento.clienteId, clientes);
    if (!cliente?.telefone) {
      toast.error('Cliente não possui telefone cadastrado');
      return;
    }
    
    const numero = cliente.telefone.replace(/\D/g, '');
    const valorTotal = calcularValorTotal(atendimento);
    const servicos = getServicosResumo(atendimento);
    
    const mensagem = `Olá ${cliente.nome}! Seu atendimento foi realizado com sucesso! 🎉\n\n` +
      `📋 *Serviços:* ${servicos}\n` +
      `💰 *Valor:* R$ ${valorTotal.toFixed(2)}\n\n` +
      `Obrigado pela preferência! 🙏`;
    
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            {cargo === 'cliente' ? 'Meus Atendimentos' : 'Atendimentos'}
          </Typography>
          {cargo === 'cliente' && (
            <Typography variant="body2" color="textSecondary">
              Acompanhe o histórico dos seus atendimentos
            </Typography>
          )}
          {cargo === 'profissional' && (
            <Typography variant="body2" color="textSecondary">
              Gerencie seus atendimentos realizados
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={carregarTodosDados}
        >
          Atualizar
        </Button>
      </Box>

      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 4, bgcolor: '#fff8fb', border: '1px solid rgba(156, 39, 176, 0.16)' }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#4a148c', mb: 1 }}>Comanda digital e caixa integrados</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Lance serviços, produtos e valor total no fluxo de atendimentos antes de finalizar o caixa.</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField label="Cliente/comanda" value={novaComandaDigital.cliente} onChange={(e) => setNovaComandaDigital({ ...novaComandaDigital, cliente: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={3}><TextField label="Serviços e produtos" value={novaComandaDigital.itens} onChange={(e) => setNovaComandaDigital({ ...novaComandaDigital, itens: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={3}><TextField label="Valor total" value={novaComandaDigital.valor} onChange={(e) => setNovaComandaDigital({ ...novaComandaDigital, valor: e.target.value })} fullWidth /></Grid>
          <Grid item xs={12} md={3}><Button variant="contained" fullWidth sx={{ height: '100%' }} onClick={abrirComandaDigital}>Abrir comanda</Button></Grid>
        </Grid>
        {comandasDigitais.length > 0 && <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>{comandasDigitais.map((item) => <Chip key={item.id} label={`${item.cliente} • R$ ${item.valor || '0'} • ${item.status}`} color="secondary" variant="outlined" />)}</Box>}
      </Paper>
      {/* Cards de Estatísticas - Adaptados por cargo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={cargo === 'cliente' ? 4 : 2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ bgcolor: '#f3e5f5' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={cargo === 'cliente' ? 4 : 2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ bgcolor: '#e8f5e8' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Finalizados
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {stats.finalizados}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        {cargo !== 'cliente' && (
          <Grid item xs={12} sm={6} md={2.4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card sx={{ bgcolor: '#fff3e0' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Em Andamento
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {stats.em_andamento}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={cargo === 'cliente' ? 4 : 2.4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Agendados
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  {stats.agendados}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        {cargo !== 'cliente' && (
          <Grid item xs={12} sm={6} md={2.4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card sx={{ bgcolor: '#ffebee' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Cancelados
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {stats.cancelados}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}
      </Grid>

      {/* Card de Faturamento - Apenas para admin/gerente/atendente */}
      {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && (
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)' }}>
          <CardContent>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Faturamento Total
                </Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  R$ {stats.totalFaturado.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item>
                <MoneyIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.3)' }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Atendimentos em Andamento em Destaque - Apenas para não-clientes */}
      {cargo !== 'cliente' && stats.em_andamento > 0 && (
        <Card sx={{ mb: 4, border: '2px solid #ff9800' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimerIcon sx={{ color: '#ff9800', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                Atendimentos em Andamento ({stats.em_andamento})
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              {atendimentosFiltradosPorUsuario
                .filter(a => a.status === 'em_andamento')
                .slice(0, 3)
                .map(atendimento => {
                  const cliente = getClienteData(atendimento.clienteId, clientes);
                  const profissional = getProfissionalData(atendimento.profissionalId, profissionais);
                  const servicosResumo = getServicosResumo(atendimento);

                  return (
                    <Grid item xs={12} md={4} key={atendimento.id}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={cliente?.foto} 
                            sx={{ 
                              bgcolor: '#ff9800', 
                              mr: 2, 
                              width: 48, 
                              height: 48 
                            }}
                          >
                            {!cliente?.foto && cliente?.nome?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {cliente?.nome}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {servicosResumo.length > 30 ? servicosResumo.substring(0, 30) + '...' : servicosResumo}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Profissional:</strong> {profissional?.nome}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Início:</strong> {atendimento.horaInicio}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Duração:</strong> {calcularDuracao(atendimento.horaInicio, atendimento.horaFim)}
                          </Typography>
                        </Box>

                        <LinearProgress 
                          variant="determinate" 
                          value={75} 
                          sx={{ mb: 2, height: 6, borderRadius: 3 }}
                        />
                        
                        <Button
                          fullWidth
                          variant="contained"
                          color="warning"
                          startIcon={<TimerIcon />}
                          onClick={() => handleFinalizar(atendimento.id)}
                        >
                          Continuar
                        </Button>
                      </Card>
                    </Grid>
                  );
                })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Barra de Pesquisa e Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={cargo === 'cliente' ? 12 : 6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={cargo === 'cliente' 
                  ? "Buscar em seus atendimentos..." 
                  : "Buscar por cliente, profissional, serviço ou ID..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
            </Grid>
            {cargo !== 'cliente' && (
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setOpenFilter(true)}
                  sx={{ height: '56px' }}
                >
                  Filtrar por Período, Status e Profissional
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Atendimentos */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#faf5ff' }}>
                  <TableCell><strong>Cliente</strong></TableCell>
                  {cargo !== 'cliente' && <TableCell><strong>Profissional</strong></TableCell>}
                  <TableCell><strong>Serviços</strong></TableCell>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Horário</strong></TableCell>
                  <TableCell><strong>Duração</strong></TableCell>
                  <TableCell><strong>Valor</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAtendimentos
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((atendimento) => {
                    const cliente = getClienteData(atendimento.clienteId, clientes);
                    const profissional = getProfissionalData(atendimento.profissionalId, profissionais);
                    const todosServicos = getTodosServicos(atendimento);
                    const servicosResumo = todosServicos.map(s => s.nome).join(', ');
                    const valorTotal = calcularValorTotal(atendimento);

                    return (
                      <TableRow key={atendimento.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              src={cliente?.foto} 
                              sx={{ 
                                width: 32, 
                                height: 32, 
                                bgcolor: '#9c27b0' 
                              }}
                            >
                              {!cliente?.foto && cliente?.nome?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {cliente?.nome || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {cliente?.telefone || ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {cargo !== 'cliente' && (
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {profissional?.nome || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {profissional?.especialidade || ''}
                              </Typography>
                            </Box>
                          </TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body2">
                            {servicosResumo.length > 30 ? servicosResumo.substring(0, 30) + '...' : servicosResumo}
                          </Typography>
                          {todosServicos.length > 1 && (
                            <Chip 
                              label={`${todosServicos.length} serviços`} 
                              size="small" 
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {atendimento.data ? new Date(atendimento.data).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>
                          {atendimento.horaInicio || '-'}
                          {atendimento.horaFim && ` - ${atendimento.horaFim}`}
                        </TableCell>
                        <TableCell>
                          {calcularDuracao(atendimento.horaInicio, atendimento.horaFim)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                            R$ {valorTotal.toFixed(2)}
                          </Typography>
                          {(atendimento.descontoTotal || 0) > 0 && (
                            <Typography variant="caption" sx={{ color: '#ff9800', display: 'block' }}>
                              Desconto: R$ {atendimento.descontoTotal.toFixed(2)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(atendimento.status)}
                            label={getStatusLabel(atendimento.status)}
                            size="small"
                            color={getStatusColor(atendimento.status)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Ver detalhes">
                              <IconButton
                                size="small"
                                onClick={() => handleVerDetalhes(atendimento)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {cargo !== 'cliente' && atendimento.status === 'em_andamento' && (
                              <Tooltip title="Continuar">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => handleFinalizar(atendimento.id)}
                                >
                                  <TimerIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {cargo !== 'cliente' && atendimento.status === 'agendado' && (
                              <Tooltip title="Iniciar">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleFinalizar(atendimento.id)}
                                >
                                  <PlayIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {atendimento.status === 'finalizado' && (
                              <>
                                <Tooltip title="Imprimir">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenPrintDialog(atendimento)}
                                  >
                                    <PrintIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Enviar WhatsApp">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEnviarWhatsApp(atendimento)}
                                    sx={{ color: '#25D366' }}
                                  >
                                    <WhatsAppIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}

                            {(cargo === 'admin' || cargo === 'gerente') && atendimento.status === 'finalizado' && (
                              <Tooltip title="Reabrir">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleReabrir(atendimento.id)}
                                >
                                  <RefreshIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {(cargo === 'admin' || cargo === 'gerente' || cargo === 'atendente') && 
                              atendimento.status !== 'cancelado' && atendimento.status !== 'finalizado' && (
                              <Tooltip title="Cancelar">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleCancelar(atendimento.id)}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {filteredAtendimentos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={cargo === 'cliente' ? 8 : 9} align="center" sx={{ py: 8 }}>
                      <ScheduleIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        Nenhum atendimento encontrado
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
            count={filteredAtendimentos.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Linhas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        {selectedAtendimento && (
          <>
            <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Detalhes do Atendimento</Typography>
                <Chip
                  icon={getStatusIcon(selectedAtendimento.status)}
                  label={getStatusLabel(selectedAtendimento.status)}
                  size="small"
                  sx={{ bgcolor: 'white', color: '#9c27b0', fontWeight: 'bold' }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Cabeçalho com IDs */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      ID do Atendimento: {selectedAtendimento.id}
                    </Typography>
                    {selectedAtendimento.agendamentoId && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        ID do Agendamento: {selectedAtendimento.agendamentoId}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Cliente */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Cliente</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Avatar 
                      src={getClienteData(selectedAtendimento.clienteId, clientes)?.foto}
                      sx={{ width: 48, height: 48, bgcolor: '#9c27b0' }}
                    >
                      {!getClienteData(selectedAtendimento.clienteId, clientes)?.foto && 
                        getClienteData(selectedAtendimento.clienteId, clientes)?.nome?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {getClienteData(selectedAtendimento.clienteId, clientes)?.nome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {getClienteData(selectedAtendimento.clienteId, clientes)?.telefone}
                      </Typography>
                      {getClienteData(selectedAtendimento.clienteId, clientes)?.email && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          {getClienteData(selectedAtendimento.clienteId, clientes)?.email}
                        </Typography>
                      )}
                      {getClienteData(selectedAtendimento.clienteId, clientes)?.indicadoPorNome && (
                        <Chip
                          size="small"
                          label={`Indicado por: ${getClienteData(selectedAtendimento.clienteId, clientes)?.indicadoPorNome}`}
                          sx={{ mt: 0.5, bgcolor: '#fff3e0', fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Grid>

                {/* Profissional */}
                {cargo !== 'cliente' && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Profissional</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Avatar 
                        src={getProfissionalData(selectedAtendimento.profissionalId, profissionais)?.foto}
                        sx={{ width: 48, height: 48, bgcolor: '#ff9800' }}
                      >
                        {!getProfissionalData(selectedAtendimento.profissionalId, profissionais)?.foto && 
                         getProfissionalData(selectedAtendimento.profissionalId, profissionais)?.nome?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {getProfissionalData(selectedAtendimento.profissionalId, profissionais)?.nome}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block">
                          {getProfissionalData(selectedAtendimento.profissionalId, profissionais)?.especialidade}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Comissão: {getProfissionalData(selectedAtendimento.profissionalId, profissionais)?.comissao}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Data e Hora */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">Data</Typography>
                  <Typography variant="body1">
                    {new Date(selectedAtendimento.data).toLocaleDateString('pt-BR')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">Horário</Typography>
                  <Typography variant="body1">
                    {selectedAtendimento.horaInicio} - {selectedAtendimento.horaFim || 'Em andamento'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">Duração</Typography>
                  <Typography variant="body1">
                    {calcularDuracao(selectedAtendimento.horaInicio, selectedAtendimento.horaFim)}
                  </Typography>
                </Grid>

                {/* Serviços */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Serviços Realizados
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {getTodosServicos(selectedAtendimento).map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {item.nome} {item.principal && '(Principal)'}
                          {item.duracao > 0 && ` - ${item.duracao}min`}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          R$ {(item.preco || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                    
                    {selectedAtendimento.itensProduto && selectedAtendimento.itensProduto.length > 0 && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Produtos Utilizados
                        </Typography>
                        {selectedAtendimento.itensProduto.map((item, idx) => (
                          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              {item.nome} x{item.quantidadeVenda || item.quantidade || 1}
                              {item.semCobranca && <Chip size="small" label="Cortesia" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.semCobranca ? 'Grátis' : `R$ ${((item.preco || 0) * (item.quantidadeVenda || item.quantidade || 1)).toFixed(2)}`}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    )}

                    {/* Cupons Aplicados */}
                    {selectedAtendimento.cuponsAplicados && selectedAtendimento.cuponsAplicados.length > 0 && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Cupons Aplicados
                        </Typography>
                        {selectedAtendimento.cuponsAplicados.map((cupom, idx) => (
                          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              <CouponIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              {cupom.codigo} - {cupom.descricao || ''}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                              -R$ {(cupom.valorDescontoCalculado || cupom.valor || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    )}

                    {/* Resumo Financeiro */}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">R$ {calcularSubtotal(selectedAtendimento).toFixed(2)}</Typography>
                    </Box>
                    {(selectedAtendimento.descontoTotal || 0) > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#4caf50' }}>
                        <Typography variant="body2">Descontos:</Typography>
                        <Typography variant="body2">- R$ {(selectedAtendimento.descontoTotal || 0).toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total</Typography>
                      <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                        R$ {calcularValorTotal(selectedAtendimento).toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Pagamento */}
                {pagamentos && (() => {
                  const pagamento = getPagamentoAtendimento(selectedAtendimento.id);
                  return pagamento ? (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Forma de Pagamento</Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Chip
                              label={
                                pagamento.formaPagamento === 'dinheiro' ? 'Dinheiro' :
                                pagamento.formaPagamento === 'cartao_credito' ? 'Cartão de Crédito' :
                                pagamento.formaPagamento === 'cartao_debito' ? 'Cartão de Débito' :
                                pagamento.formaPagamento === 'pix' ? 'PIX' : pagamento.formaPagamento
                              }
                              color="primary"
                              size="small"
                            />
                            {pagamento.parcelas > 1 && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>Parcelas:</strong> {pagamento.parcelas}x
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2">
                              <strong>Valor pago:</strong> R$ {pagamento.valor?.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {pagamento.data?.toDate ? pagamento.data.toDate().toLocaleString('pt-BR') : new Date(pagamento.data).toLocaleString('pt-BR')}
                            </Typography>
                          </Grid>
                          {pagamento.observacoes && (
                            <Grid item xs={12}>
                              <Typography variant="body2">
                                <strong>Obs:</strong> {pagamento.observacoes}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    </Grid>
                  ) : null;
                })()}

                {/* Fidelidade */}
                {fidelidade && (() => {
                  const pontos = getPontosFidelidade(selectedAtendimento);
                  return pontos.length > 0 ? (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Pontos de Fidelidade</Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#fff3e0' }}>
                        {pontos.map((p, idx) => (
                          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">
                              <StarIcon sx={{ fontSize: 14, color: '#ff9800', mr: 0.5, verticalAlign: 'middle' }} />
                              {p.motivo || 'Atendimento'}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                              +{p.quantidade} pontos
                            </Typography>
                          </Box>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">
                          <strong>Saldo atual:</strong> {(getClienteData(selectedAtendimento.clienteId, clientes)?.pontos || 0) + pontos.reduce((acc, p) => acc + p.quantidade, 0)} pontos
                        </Typography>
                      </Paper>
                    </Grid>
                  ) : null;
                })()}

                {/* Observações */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="textSecondary">Observações</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {selectedAtendimento.observacoes || 'Sem observações'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setOpenDetails(false)}>Fechar</Button>
              {cargo !== 'cliente' && selectedAtendimento.status === 'agendado' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setOpenDetails(false);
                    handleFinalizar(selectedAtendimento.id);
                  }}
                >
                  Iniciar Atendimento
                </Button>
              )}
              {cargo !== 'cliente' && selectedAtendimento.status === 'em_andamento' && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    setOpenDetails(false);
                    handleFinalizar(selectedAtendimento.id);
                  }}
                >
                  Continuar
                </Button>
              )}
              {selectedAtendimento.status === 'finalizado' && (
                <>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => {
                      setOpenDetails(false);
                      handleOpenPrintDialog(selectedAtendimento);
                    }}
                  >
                    Imprimir
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: '#25D366', color: 'white' }}
                    onClick={() => {
                      setOpenDetails(false);
                      handleEnviarWhatsApp(selectedAtendimento);
                    }}
                  >
                    WhatsApp
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog de Opções de Impressão */}
      <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PrintIcon />
            <Typography variant="h6">Opções de Impressão</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Formato do Papel</InputLabel>
                <Select
                  value={printOptions.formato}
                  label="Formato do Papel"
                  onChange={(e) => setPrintOptions({ ...printOptions, formato: e.target.value })}
                >
                  <MenuItem value="A4">A4 (210x297mm)</MenuItem>
                  <MenuItem value="A5">A5 (148x210mm)</MenuItem>
                  <MenuItem value="termica_80mm">Térmica 80mm</MenuItem>
                  <MenuItem value="termica_58mm">Térmica 58mm</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>O que incluir no comprovante:</Typography>
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.incluirLogo}
                    onChange={(e) => setPrintOptions({ ...printOptions, incluirLogo: e.target.checked })}
                  />
                }
                label="Logo da Empresa"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.incluirEndereco}
                    onChange={(e) => setPrintOptions({ ...printOptions, incluirEndereco: e.target.checked })}
                  />
                }
                label="Endereço"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.incluirContato}
                    onChange={(e) => setPrintOptions({ ...printOptions, incluirContato: e.target.checked })}
                  />
                }
                label="Contato"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.incluirRedesSociais}
                    onChange={(e) => setPrintOptions({ ...printOptions, incluirRedesSociais: e.target.checked })}
                  />
                }
                label="Redes Sociais"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.incluirFidelidade}
                    onChange={(e) => setPrintOptions({ ...printOptions, incluirFidelidade: e.target.checked })}
                  />
                }
                label="Pontos de Fidelidade"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.incluirCupons}
                    onChange={(e) => setPrintOptions({ ...printOptions, incluirCupons: e.target.checked })}
                  />
                }
                label="Cupons Aplicados"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.incluirQRCode}
                    onChange={(e) => setPrintOptions({ ...printOptions, incluirQRCode: e.target.checked })}
                  />
                }
                label="QR Code"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.incluirAssinatura}
                    onChange={(e) => setPrintOptions({ ...printOptions, incluirAssinatura: e.target.checked })}
                  />
                }
                label="Campo de Assinatura"
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>Dica:</strong> Para impressoras térmicas, recomenda-se desativar o QR Code e as redes sociais para economizar papel.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleImprimir}
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{ bgcolor: '#4caf50' }}
          >
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Filtros - Apenas para não-clientes */}
      {cargo !== 'cliente' && (
        <Dialog open={openFilter} onClose={() => setOpenFilter(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
            Filtrar Atendimentos
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={filtros.periodo}
                    label="Período"
                    onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="hoje">Hoje</MenuItem>
                    <MenuItem value="semana">Esta semana</MenuItem>
                    <MenuItem value="mes">Este mês</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtros.status}
                    label="Status"
                    onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="agendado">Agendado</MenuItem>
                    <MenuItem value="em_andamento">Em Andamento</MenuItem>
                    <MenuItem value="finalizado">Finalizado</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Profissional</InputLabel>
                  <Select
                    value={filtros.profissional}
                    label="Profissional"
                    onChange={(e) => setFiltros({ ...filtros, profissional: e.target.value })}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    {profissionais.map(prof => (
                      <MenuItem key={prof.id} value={prof.id}>{prof.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenFilter(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={() => setOpenFilter(false)}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
              }}
            >
              Aplicar Filtros
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default ModernAtendimentos;
