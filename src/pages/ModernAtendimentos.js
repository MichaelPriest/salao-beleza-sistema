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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { usuariosService } from '../services/usuariosService';
import { Timestamp } from 'firebase/firestore';

// Importar o logo
import logo from '../assets/logo.png';

// 🔥 FUNÇÃO PARA OBTER DADOS DO CLIENTE DE FORMA SEGURA
const getClienteData = (clienteId, clientes) => {
  if (!clienteId || !clientes) return null;
  
  // Buscar cliente pelo ID (pode ser o uid do Firebase Auth ou o id do documento)
  const cliente = clientes.find(c => 
    c.id === clienteId || 
    c.uid === clienteId || 
    c.googleUid === clienteId
  );
  
  if (!cliente) return null;
  
  // Retornar objeto padronizado com todos os campos necessários
  return {
    id: cliente.id || cliente.uid || cliente.googleUid,
    nome: cliente.nome || cliente.displayName || 'Cliente',
    telefone: cliente.telefone || cliente.phoneNumber || 'Não informado',
    email: cliente.email || '',
    cpf: cliente.cpf || '',
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
    status: cliente.status || 'Ativo'
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
    especialidade: profissional.especialidade || '',
    foto: profissional.foto || profissional.photoURL || null
  };
};

function ModernAtendimentos() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [cargo, setCargo] = useState('');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openFilter, setOpenFilter] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
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
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      
      const [atendimentosData, clientesData, profissionaisData, servicosData, pagamentosData, configData] = await Promise.all([
        firebaseService.getAll('atendimentos'),
        firebaseService.getAll('clientes'),
        firebaseService.getAll('profissionais'),
        firebaseService.getAll('servicos'),
        firebaseService.getAll('pagamentos'),
        carregarConfiguracoes()
      ]);

      setAtendimentos(atendimentosData || []);
      setClientes(clientesData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);
      setPagamentos(pagamentosData || []);
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

    // Cliente: ver apenas seus próprios atendimentos
    if (cargo === 'cliente' && usuario.clienteId) {
      return atendimentosList.filter(a => a.clienteId === usuario.clienteId);
    }

    // Profissional: ver apenas seus atendimentos
    if (cargo === 'profissional' && usuario.profissionalId) {
      return atendimentosList.filter(a => a.profissionalId === usuario.profissionalId);
    }

    // Admin, Gerente, Atendente: ver todos
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
          principal: item.principal || false
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
          principal: true
        });
      }
    }
    
    return servicosLista;
  };

  // Função para obter o pagamento do atendimento
  const getPagamentoAtendimento = (atendimentoId) => {
    return pagamentos?.find(p => p.atendimentoId === atendimentoId);
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
    
    return total;
  };

  // Obter lista de serviços para exibição resumida
  const getServicosResumo = (atendimento) => {
    const servicos = getTodosServicos(atendimento);
    return servicos.map(s => s.nome).join(', ');
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
      servicosResumo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filtros.status === 'todos' || atendimento.status === filtros.status;
    
    // Para profissionais, o filtro de profissional não se aplica
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
    // Profissionais e clientes não podem iniciar/finalizar? Profissionais podem continuar
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

  const handleImprimir = (atendimento) => {
    // Clientes podem imprimir? Talvez sim
    const cliente = getClienteData(atendimento.clienteId, clientes);
    const profissional = getProfissionalData(atendimento.profissionalId, profissionais);
    const todosServicos = getTodosServicos(atendimento);
    const produtos = atendimento.itensProduto || [];
    const valorTotal = calcularValorTotal(atendimento);
    const pagamento = getPagamentoAtendimento(atendimento.id);
    
    // Dados da empresa
    const empresa = config?.salao || {
      nome: 'Serena',
      cnpj: '3971163300015',
      endereco: { logradouro: '', bairro: '', cidade: '', estado: '', cep: '' },
      contato: { telefone: '', email: '' }
    };

    const logoUrl = logo || '';

    const estilo = `
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { 
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px; 
          border-bottom: 2px solid #9c27b0; 
          padding-bottom: 20px;
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .logo {
          max-height: 60px;
          max-width: 150px;
        }
        .empresa-info {
          text-align: right;
        }
        .empresa-nome { 
          color: #9c27b0; 
          font-size: 24px; 
          font-weight: bold; 
          margin: 0; 
        }
        .empresa-detalhe { 
          color: #666; 
          font-size: 12px; 
          margin: 5px 0; 
        }
        .titulo { 
          color: #9c27b0; 
          font-size: 18px; 
          margin: 20px 0 10px; 
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 10px; 
          margin: 20px 0; 
        }
        .info-item { 
          margin: 5px 0; 
        }
        .info-label { 
          color: #666; 
          font-size: 12px; 
        }
        .info-value { 
          font-weight: bold; 
          margin: 0; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
        }
        th { 
          background-color: #9c27b0; 
          color: white; 
          padding: 10px; 
          text-align: left; 
        }
        td { 
          padding: 10px; 
          border-bottom: 1px solid #ddd; 
        }
        .total { 
          font-size: 18px; 
          font-weight: bold; 
          color: #9c27b0; 
          margin-top: 20px; 
          text-align: right; 
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
          border-top: 1px solid #ddd; 
          padding-top: 20px; 
        }
      </style>
    `;

    const conteudo = `
      <html>
        <head>
          <title>Comprovante de Atendimento</title>
          ${estilo}
        </head>
        <body>
          <div class="header">
            <div class="logo-container">
              <img src="${logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'">
              <div>
                <h1 class="empresa-nome">${empresa.nome || 'Serena'}</h1>
                ${empresa.nomeFantasia ? `<p class="empresa-detalhe">${empresa.nomeFantasia}</p>` : ''}
              </div>
            </div>
            <div class="empresa-info">
              ${empresa.cnpj ? `<p class="empresa-detalhe">CNPJ: ${empresa.cnpj}</p>` : ''}
              ${empresa.endereco?.logradouro ? `<p class="empresa-detalhe">${empresa.endereco.logradouro}</p>` : ''}
              ${empresa.contato?.telefone ? `<p class="empresa-detalhe">Tel: ${empresa.contato.telefone}</p>` : ''}
            </div>
          </div>

          <h2 class="titulo">COMPROVANTE DE ATENDIMENTO</h2>
          
          <div class="info-grid">
            <div class="info-item">
              <p class="info-label">Cliente</p>
              <p class="info-value">${cliente?.nome || 'N/A'}</p>
              <p class="info-label">Telefone: ${cliente?.telefone || ''}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Profissional</p>
              <p class="info-value">${profissional?.nome || 'N/A'}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Data</p>
              <p class="info-value">${new Date(atendimento.data).toLocaleDateString('pt-BR')}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Horário</p>
              <p class="info-value">${atendimento.horaInicio || ''} - ${atendimento.horaFim || ''}</p>
            </div>
          </div>

          <h3 class="titulo">Serviços Realizados</h3>
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

          ${produtos.length > 0 ? `
            <h3 class="titulo">Produtos Utilizados</h3>
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
                    <td align="right">${p.quantidade}</td>
                    <td align="right">R$ ${(p.preco || 0).toFixed(2)}</td>
                    <td align="right">R$ ${((p.preco || 0) * (p.quantidade || 1)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <div class="total">
            <p>Total: R$ ${valorTotal.toFixed(2)}</p>
            ${pagamento ? `
              <p style="font-size: 14px; color: #666;">
                Forma de Pagamento: ${
                  pagamento.formaPagamento === 'dinheiro' ? 'Dinheiro' :
                  pagamento.formaPagamento === 'cartao_credito' ? 'Cartão de Crédito' :
                  pagamento.formaPagamento === 'cartao_debito' ? 'Cartão de Débito' :
                  pagamento.formaPagamento === 'pix' ? 'PIX' : pagamento.formaPagamento
                }
                ${pagamento.parcelas > 1 ? ` (${pagamento.parcelas}x)` : ''}
              </p>
            ` : ''}
          </div>

          ${atendimento.observacoes ? `
            <div style="margin-top: 20px;">
              <p class="info-label">Observações</p>
              <p>${atendimento.observacoes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
            <p>Obrigado pela preferência!</p>
          </div>
        </body>
      </html>
    `;
    
    const janela = window.open('', '_blank');
    janela.document.write(conteudo);
    janela.print();
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
                  : "Buscar por cliente, profissional ou serviço..."
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
                          <TableCell>{profissional?.nome || 'N/A'}</TableCell>
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
                              <Tooltip title="Imprimir">
                                <IconButton
                                  size="small"
                                  onClick={() => handleImprimir(atendimento)}
                                >
                                  <PrintIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
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
              Detalhes do Atendimento
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
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
                      <Typography variant="caption" color="textSecondary">
                        {getClienteData(selectedAtendimento.clienteId, clientes)?.telefone}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {cargo !== 'cliente' && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Profissional</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                      {getProfissionalData(selectedAtendimento.profissionalId, profissionais)?.nome}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Serviços Realizados
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {getTodosServicos(selectedAtendimento).map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {item.nome} {item.principal && '(Principal)'}
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
                            <Typography variant="body2">{item.nome} x{item.quantidade}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              R$ {((item.preco || 0) * (item.quantidade || 1)).toFixed(2)}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total</Typography>
                      <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                        R$ {calcularValorTotal(selectedAtendimento).toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Data</Typography>
                  <Typography variant="body1">
                    {new Date(selectedAtendimento.data).toLocaleDateString('pt-BR')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Horário</Typography>
                  <Typography variant="body1">
                    {selectedAtendimento.horaInicio} - {selectedAtendimento.horaFim || 'Em andamento'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Duração</Typography>
                  <Typography variant="body1">
                    {calcularDuracao(selectedAtendimento.horaInicio, selectedAtendimento.horaFim)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip
                    icon={getStatusIcon(selectedAtendimento.status)}
                    label={getStatusLabel(selectedAtendimento.status)}
                    color={getStatusColor(selectedAtendimento.status)}
                  />
                </Grid>
                
                {/* Mostrar forma de pagamento se existir */}
                {pagamentos && (
                  (() => {
                    const pagamento = getPagamentoAtendimento(selectedAtendimento.id);
                    return pagamento ? (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">Forma de Pagamento</Typography>
                        <Chip
                          label={
                            pagamento.formaPagamento === 'dinheiro' ? 'Dinheiro' :
                            pagamento.formaPagamento === 'cartao_credito' ? 'Cartão de Crédito' :
                            pagamento.formaPagamento === 'cartao_debito' ? 'Cartão de Débito' :
                            pagamento.formaPagamento === 'pix' ? 'PIX' : pagamento.formaPagamento
                          }
                          size="small"
                          color="primary"
                          sx={{ mt: 0.5 }}
                        />
                        {pagamento.parcelas > 1 && (
                          <Typography variant="caption" display="block" color="textSecondary">
                            {pagamento.parcelas}x
                          </Typography>
                        )}
                      </Grid>
                    ) : null;
                  })()
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="textSecondary">Observações</Typography>
                  <Typography variant="body1">
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
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => {
                    setOpenDetails(false);
                    handleImprimir(selectedAtendimento);
                  }}
                >
                  Imprimir
                </Button>
              )}
            </DialogActions>
          </>
        )}
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
