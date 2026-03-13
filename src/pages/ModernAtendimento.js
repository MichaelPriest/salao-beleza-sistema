// src/pages/ModernAtendimento.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Fade,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Timer as TimerIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  RemoveShoppingCart as NoCostIcon,
  CompareArrows as ConversionIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';

// 🔥 Lista de unidades de medida
const UNIDADES_MEDIDA = [
  { value: 'un', label: 'Unidade', simbolo: 'un' },
  { value: 'pç', label: 'Peça', simbolo: 'pç' },
  { value: 'cx', label: 'Caixa', simbolo: 'cx' },
  { value: 'pct', label: 'Pacote', simbolo: 'pct' },
  { value: 'kit', label: 'Kit', simbolo: 'kit' },
  { value: 'par', label: 'Par', simbolo: 'par' },
  { value: 'dz', label: 'Dúzia', simbolo: 'dz' },
  { value: 'kg', label: 'Quilograma', simbolo: 'kg' },
  { value: 'g', label: 'Grama', simbolo: 'g' },
  { value: 'mg', label: 'Miligrama', simbolo: 'mg' },
  { value: 'L', label: 'Litro', simbolo: 'L' },
  { value: 'ml', label: 'Mililitro', simbolo: 'ml' },
  { value: 'm', label: 'Metro', simbolo: 'm' },
  { value: 'cm', label: 'Centímetro', simbolo: 'cm' },
  { value: 'mm', label: 'Milímetro', simbolo: 'mm' },
  { value: 'm²', label: 'Metro Quadrado', simbolo: 'm²' },
  { value: 'fr', label: 'Frasco', simbolo: 'fr' },
  { value: 'tb', label: 'Tablete', simbolo: 'tb' },
];

// 🔥 Formas de pagamento
const FORMAS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '⚡' },
  { value: 'boleto', label: 'Boleto', icon: '📄' },
  { value: 'transferencia', label: 'Transferência', icon: '🔄' },
  { value: 'credito_loja', label: 'Crédito na Loja', icon: '🏪' },
];

const steps = ['Confirmar Atendimento', 'Adicionar Itens', 'Registrar Pagamentos', 'Finalizar'];

function ModernAtendimento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [atendimento, setAtendimento] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [profissional, setProfissional] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  
  // Itens do atendimento - ARRAYS
  const [itensServico, setItensServico] = useState([]);
  const [itensProduto, setItensProduto] = useState([]);
  
  // Controles para adicionar itens
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidadeProduto, setQuantidadeProduto] = useState(1);
  
  // 🔥 NOVO: controle para item sem cobrança
  const [itemSemCobranca, setItemSemCobranca] = useState(false);
  
  // 🔥 NOVO: busca nos selects
  const [buscaServico, setBuscaServico] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  
  // Pagamentos - ARRAY
  const [pagamentos, setPagamentos] = useState([]);
  const [openPagamentoDialog, setOpenPagamentoDialog] = useState(false);
  const [pagamentoEditando, setPagamentoEditando] = useState(null);
  const [pagamentoForm, setPagamentoForm] = useState({
    formaPagamento: 'dinheiro',
    valor: '',
    parcelas: 1,
    observacoes: ''
  });

  const [tempoDecorrido, setTempoDecorrido] = useState('');

  // Listas de serviços e produtos disponíveis
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);

  useEffect(() => {
    carregarDados();
    carregarServicosEProdutos();
  }, [id]);

  useEffect(() => {
    // Calcular tempo decorrido se o atendimento estiver em andamento
    if (atendimento && atendimento.horaInicio && !atendimento.horaFim) {
      const calcularTempo = () => {
        const inicio = new Date(`${atendimento.data}T${atendimento.horaInicio}`);
        const agora = new Date();
        const diff = Math.floor((agora - inicio) / 60000); // minutos
        const horas = Math.floor(diff / 60);
        const minutos = diff % 60;
        setTempoDecorrido(`${horas}h ${minutos}min`);
      };

      calcularTempo();
      const interval = setInterval(calcularTempo, 60000);
      return () => clearInterval(interval);
    }
  }, [atendimento]);

  // Calcular valor total dos serviços
  const calcularTotalServicos = () => {
    return itensServico.reduce((acc, item) => acc + (item.preco || 0), 0);
  };

  // Calcular valor total dos produtos (considerando itens sem cobrança)
  const calcularTotalProdutos = () => {
    return itensProduto.reduce((acc, item) => {
      if (item.semCobranca) return acc; // Não cobra se for sem cobrança
      return acc + ((item.preco || 0) * (item.quantidadeVenda || 1));
    }, 0);
  };

  // Calcular valor total do atendimento
  const calcularValorTotal = () => {
    return calcularTotalServicos() + calcularTotalProdutos();
  };

  // Calcular total pago
  const calcularTotalPago = () => {
    return pagamentos.reduce((acc, p) => acc + (p.valor || 0), 0);
  };

  // Calcular saldo restante
  const calcularSaldoRestante = () => {
    return calcularValorTotal() - calcularTotalPago();
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar atendimento
      const atendimentoData = await firebaseService.getById('atendimentos', id);
      setAtendimento(atendimentoData);
      setObservacoes(atendimentoData.observacoes || '');

      // Buscar dados relacionados
      const [clienteData, profissionalData] = await Promise.all([
        firebaseService.getById('clientes', atendimentoData.clienteId),
        firebaseService.getById('profissionais', atendimentoData.profissionalId)
      ]);

      setCliente(clienteData);
      setProfissional(profissionalData);

      // Carregar itens do atendimento - ARRAY de serviços
      if (atendimentoData.itensServico && atendimentoData.itensServico.length > 0) {
        setItensServico(atendimentoData.itensServico);
      } else if (atendimentoData.servicoId) {
        // Se tiver apenas servicoId, buscar o serviço
        const servicoData = await firebaseService.getById('servicos', atendimentoData.servicoId);
        setItensServico([{
          id: servicoData.id,
          nome: servicoData.nome,
          preco: servicoData.preco,
          duracao: servicoData.duracao,
          principal: true
        }]);
      }

      // Carregar itens de produto - ARRAY de produtos
      if (atendimentoData.itensProduto) {
        setItensProduto(atendimentoData.itensProduto);
      }

      // Carregar pagamentos - ARRAY de pagamentos
      const pagamentosData = await firebaseService.query('pagamentos', [
        { field: 'atendimentoId', operator: '==', value: id }
      ]);
      setPagamentos(pagamentosData || []);

      // Verificar status para definir o step atual
      if (atendimentoData.status === 'finalizado') {
        setActiveStep(3);
      } else if (pagamentosData.length > 0) {
        setActiveStep(2);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do atendimento');
    } finally {
      setLoading(false);
    }
  };

  const carregarServicosEProdutos = async () => {
    try {
      const [servicosData, produtosData] = await Promise.all([
        firebaseService.getAll('servicos'),
        firebaseService.getAll('produtos')
      ]);
      setServicosDisponiveis(servicosData || []);
      setProdutosDisponiveis(produtosData || []);
    } catch (error) {
      console.error('Erro ao carregar serviços e produtos:', error);
    }
  };

  // 🔥 Função para obter o símbolo da unidade
  const getUnidadeSimbolo = (unidade) => {
    const unidadeEncontrada = UNIDADES_MEDIDA.find(u => u.value === unidade);
    return unidadeEncontrada?.simbolo || unidade;
  };

  // 🔥 Função para calcular quantidade em estoque baseado na unidade de venda
  const calcularQuantidadeDisponivel = (produto, quantidadeVenda) => {
    if (!produto) return 0;
    
    const estoqueEmUnidadeVenda = produto.quantidadeEstoque * (produto.fatorConversao || 1);
    return Math.floor(estoqueEmUnidadeVenda);
  };

  // 🔥 Função para converter quantidade de venda para estoque
  const converterParaEstoque = (produto, quantidadeVenda) => {
    if (!produto) return 0;
    return quantidadeVenda / (produto.fatorConversao || 1);
  };

  // 🔥 Filtrar serviços pela busca
  const servicosFiltrados = servicosDisponiveis.filter(servico => 
    servico.nome?.toLowerCase().includes(buscaServico.toLowerCase()) ||
    servico.categoria?.toLowerCase().includes(buscaServico.toLowerCase())
  );

  // 🔥 Filtrar produtos pela busca
  const produtosFiltrados = produtosDisponiveis.filter(produto => 
    produto.nome?.toLowerCase().includes(buscaProduto.toLowerCase()) ||
    produto.categoria?.toLowerCase().includes(buscaProduto.toLowerCase()) ||
    produto.descricao?.toLowerCase().includes(buscaProduto.toLowerCase())
  );

  // Adicionar serviço ao ARRAY itensServico
  const handleAdicionarServico = () => {
    if (!servicoSelecionado) {
      toast.error('Selecione um serviço');
      return;
    }

    // Verificar se o serviço já foi adicionado
    if (itensServico.some(item => item.id === servicoSelecionado.id)) {
      toast.error('Serviço já adicionado');
      return;
    }

    // Adicionar ao array
    setItensServico([...itensServico, {
      id: servicoSelecionado.id,
      nome: servicoSelecionado.nome,
      preco: servicoSelecionado.preco,
      duracao: servicoSelecionado.duracao,
      principal: itensServico.length === 0 // Primeiro serviço é principal
    }]);

    setServicoSelecionado(null);
    setBuscaServico('');
    toast.success('Serviço adicionado!');
  };

  // 🔥 Adicionar produto ao ARRAY itensProduto (com unidades de medida)
  const handleAdicionarProduto = () => {
    if (!produtoSelecionado) {
      toast.error('Selecione um produto');
      return;
    }

    if (quantidadeProduto <= 0) {
      toast.error('Quantidade inválida');
      return;
    }

    // Calcular quantidade disponível na unidade de venda
    const quantidadeDisponivel = calcularQuantidadeDisponivel(produtoSelecionado, quantidadeProduto);
    
    if (quantidadeProduto > quantidadeDisponivel) {
      toast.error(
        `Quantidade indisponível. Disponível: ${quantidadeDisponivel} ${getUnidadeSimbolo(produtoSelecionado.unidadeVenda)}`
      );
      return;
    }

    // Calcular quanto será baixado do estoque
    const quantidadeEstoque = converterParaEstoque(produtoSelecionado, quantidadeProduto);

    // Verificar se o produto já foi adicionado
    const produtoExistente = itensProduto.find(item => item.id === produtoSelecionado.id);
    
    if (produtoExistente) {
      // Atualizar quantidade no array
      setItensProduto(itensProduto.map(item => 
        item.id === produtoSelecionado.id 
          ? { 
              ...item, 
              quantidadeVenda: item.quantidadeVenda + quantidadeProduto,
              quantidadeEstoque: item.quantidadeEstoque + quantidadeEstoque,
              semCobranca: item.semCobranca // Manter status de cobrança
            }
          : item
      ));
    } else {
      // Adicionar novo item ao array
      setItensProduto([...itensProduto, {
        id: produtoSelecionado.id,
        nome: produtoSelecionado.nome,
        preco: produtoSelecionado.precoVenda,
        unidadeEstoque: produtoSelecionado.unidadeEstoque,
        unidadeVenda: produtoSelecionado.unidadeVenda,
        fatorConversao: produtoSelecionado.fatorConversao || 1,
        quantidadeVenda: quantidadeProduto,
        quantidadeEstoque: quantidadeEstoque,
        semCobranca: itemSemCobranca,
        apenasBaixa: itemSemCobranca
      }]);
    }

    // Atualizar estoque (sempre dá baixa, independente de cobrança)
    const novaQuantidadeEstoque = produtoSelecionado.quantidadeEstoque - quantidadeEstoque;
    firebaseService.update('produtos', produtoSelecionado.id, {
      quantidadeEstoque: novaQuantidadeEstoque,
      updatedAt: Timestamp.now()
    });

    // Registrar movimentação de estoque
    registrarMovimentacaoEstoque(
      produtoSelecionado, 
      quantidadeEstoque, 
      produtoSelecionado.unidadeEstoque,
      itemSemCobranca ? 'uso_sem_cobranca' : 'venda'
    );

    setProdutoSelecionado(null);
    setQuantidadeProduto(1);
    setItemSemCobranca(false);
    setBuscaProduto('');
    toast.success(
      itemSemCobranca 
        ? `Produto adicionado (sem cobrança)! ${quantidadeProduto} ${getUnidadeSimbolo(produtoSelecionado.unidadeVenda)}` 
        : `Produto adicionado! ${quantidadeProduto} ${getUnidadeSimbolo(produtoSelecionado.unidadeVenda)}`
    );
  };

  // 🔥 Registrar movimentação de estoque
  const registrarMovimentacaoEstoque = async (produto, quantidade, unidade, tipo) => {
    try {
      const movimentacao = {
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: quantidade,
        unidade: unidade,
        tipo: tipo,
        data: new Date().toISOString(),
        atendimentoId: id,
        usuario: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema'
      };
      await firebaseService.add('movimentacoes_estoque', movimentacao);
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
    }
  };

  // Remover serviço do ARRAY itensServico
  const handleRemoverServico = (index) => {
    const novosItens = itensServico.filter((_, i) => i !== index);
    // Se removeu o principal, definir o primeiro como principal
    if (itensServico[index].principal && novosItens.length > 0) {
      novosItens[0].principal = true;
    }
    setItensServico(novosItens);
  };

  // 🔥 Remover produto do ARRAY itensProduto (com devolução ao estoque)
  const handleRemoverProduto = (index) => {
    const itemRemovido = itensProduto[index];
    
    // Devolver ao estoque
    if (itemRemovido) {
      firebaseService.getById('produtos', itemRemovido.id).then(produto => {
        const novaQuantidade = (produto.quantidadeEstoque || 0) + itemRemovido.quantidadeEstoque;
        firebaseService.update('produtos', itemRemovido.id, {
          quantidadeEstoque: novaQuantidade,
          updatedAt: Timestamp.now()
        });
        
        // Registrar devolução
        registrarMovimentacaoEstoque(
          produto, 
          itemRemovido.quantidadeEstoque, 
          itemRemovido.unidadeEstoque,
          'devolucao'
        );
      });
    }

    const novosItens = itensProduto.filter((_, i) => i !== index);
    setItensProduto(novosItens);
  };

  const handleConfirmarAtendimento = async () => {
    try {
      setSaving(true);
      
      const valorTotal = calcularValorTotal();
      
      // Preparar dados para salvar - garantindo que são arrays
      const dadosAtendimento = {
        observacoes,
        itensServico: itensServico, // Array
        itensProduto: itensProduto, // Array
        valorTotal,
        status: 'em_andamento',
        updatedAt: Timestamp.now()
      };

      // Atualizar atendimento
      await firebaseService.update('atendimentos', id, dadosAtendimento);

      setActiveStep(1);
      toast.success('Atendimento confirmado!');
    } catch (error) {
      console.error('Erro ao confirmar atendimento:', error);
      toast.error('Erro ao confirmar atendimento');
    } finally {
      setSaving(false);
    }
  };

  // 🔥 Função para criar transação financeira
  const criarTransacaoFinanceira = async (pagamento) => {
    try {
      console.log('💰 CRIANDO TRANSAÇÃO FINANCEIRA - INÍCIO');
      
      const transacao = {
        tipo: 'receita',
        descricao: `Atendimento - ${cliente?.nome}`,
        valor: pagamento.valor,
        data: new Date().toISOString().split('T')[0],
        dataVencimento: new Date().toISOString().split('T')[0],
        categoria: 'Serviços',
        formaPagamento: pagamento.formaPagamento,
        status: 'pago',
        clienteId: cliente?.id,
        atendimentoId: id,
        observacoes: `Pagamento referente ao atendimento ${id}. Forma: ${FORMAS_PAGAMENTO.find(f => f.value === pagamento.formaPagamento)?.label || pagamento.formaPagamento}${pagamento.parcelas > 1 ? ` em ${pagamento.parcelas}x` : ''}. ${pagamento.observacoes || ''}`,
        parcelas: pagamento.parcelas || 1,
        dataPagamento: new Date().toISOString(),
        origem: 'atendimento',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log('📌 Dados da transação:', transacao);
      
      const transacaoId = await firebaseService.add('transacoes', transacao);
      console.log('✅ Transação criada com ID:', transacaoId);

      // 🔥 Verificar se a transação foi criada
      setTimeout(async () => {
        const transacoes = await firebaseService.getAll('transacoes');
        const minhaTransacao = transacoes.find(t => t.atendimentoId === id);
        console.log('🔍 Verificação - Transação encontrada:', minhaTransacao);
      }, 2000);

      return transacaoId;
    } catch (error) {
      console.error('❌ Erro ao criar transação financeira:', error);
      throw error;
    }
  };

  // Adicionar pagamento ao ARRAY pagamentos
  const handleSalvarPagamento = async () => {
    try {
      const valorTotal = calcularValorTotal();
      const totalPago = calcularTotalPago();
      const saldoRestante = valorTotal - totalPago;

      if (!pagamentoForm.valor || pagamentoForm.valor <= 0) {
        toast.error('Valor inválido');
        return;
      }

      if (pagamentoForm.valor > saldoRestante && !pagamentoEditando) {
        toast.error(`Valor máximo permitido: R$ ${saldoRestante.toFixed(2)}`);
        return;
      }

      const agora = Timestamp.now();
      
      const pagamentoData = {
        atendimentoId: id,
        clienteId: cliente.id,
        valor: parseFloat(pagamentoForm.valor),
        formaPagamento: pagamentoForm.formaPagamento,
        parcelas: pagamentoForm.parcelas || 1,
        observacoes: pagamentoForm.observacoes,
        status: 'pago',
        data: agora,
        createdAt: pagamentoEditando?.createdAt || agora,
        updatedAt: agora
      };

      let pagamentoSalvo;

      if (pagamentoEditando) {
        // Atualizar pagamento no array
        await firebaseService.update('pagamentos', pagamentoEditando.id, pagamentoData);
        pagamentoSalvo = { ...pagamentoData, id: pagamentoEditando.id };
        setPagamentos(pagamentos.map(p => p.id === pagamentoEditando.id ? pagamentoSalvo : p));
        toast.success('Pagamento atualizado!');
      } else {
        // Adicionar novo pagamento ao array
        pagamentoSalvo = await firebaseService.add('pagamentos', pagamentoData);
        setPagamentos([...pagamentos, pagamentoSalvo]);
        toast.success('Pagamento registrado!');

        // 🔥 CRIAR TRANSAÇÃO FINANCEIRA AUTOMATICAMENTE
        console.log('💰 Chamando criarTransacaoFinanceira para novo pagamento');
        await criarTransacaoFinanceira(pagamentoSalvo);
      }

      handleClosePagamentoDialog();
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      toast.error('Erro ao salvar pagamento');
    }
  };

  // Remover pagamento do ARRAY pagamentos
  const handleRemoverPagamento = async (pagamentoId) => {
    if (window.confirm('Deseja remover este pagamento?')) {
      try {
        // Buscar transações relacionadas a este atendimento
        const transacoes = await firebaseService.query('transacoes', [
          { field: 'atendimentoId', operator: '==', value: id }
        ]);

        // Remover transações relacionadas
        for (const transacao of transacoes) {
          await firebaseService.delete('transacoes', transacao.id);
        }

        // Remover pagamento
        await firebaseService.delete('pagamentos', pagamentoId);
        setPagamentos(pagamentos.filter(p => p.id !== pagamentoId));
        
        toast.success('Pagamento e transações removidos!');
      } catch (error) {
        console.error('Erro ao remover pagamento:', error);
        toast.error('Erro ao remover pagamento');
      }
    }
  };

  const handleOpenPagamentoDialog = (pagamento = null) => {
    if (pagamento) {
      setPagamentoEditando(pagamento);
      setPagamentoForm({
        formaPagamento: pagamento.formaPagamento || 'dinheiro',
        valor: pagamento.valor,
        parcelas: pagamento.parcelas || 1,
        observacoes: pagamento.observacoes || ''
      });
    } else {
      setPagamentoEditando(null);
      setPagamentoForm({
        formaPagamento: 'dinheiro',
        valor: '',
        parcelas: 1,
        observacoes: ''
      });
    }
    setOpenPagamentoDialog(true);
  };

  const handleClosePagamentoDialog = () => {
    setOpenPagamentoDialog(false);
    setPagamentoEditando(null);
  };

  const handleFinalizarAtendimento = async () => {
    try {
      setSaving(true);
      
      const valorTotal = calcularValorTotal();
      const totalPago = calcularTotalPago();
      const saldoRestante = valorTotal - totalPago;
      const MARGEM_ERRO = 0.01;
  
      if (Math.abs(saldoRestante) > MARGEM_ERRO) {
        toast.error(`Valor total ainda não foi pago! Restante: R$ ${saldoRestante.toFixed(2)}`);
        return;
      }
  
      console.log('🔥 FINALIZANDO ATENDIMENTO - INÍCIO');
      console.log('📌 Atendimento ID:', id);
      console.log('📌 Valor total:', valorTotal);
      console.log('📌 Itens serviço:', itensServico);
      console.log('📌 Itens produto:', itensProduto);
      console.log('📌 Pagamentos:', pagamentos);
  
      // 1. Buscar o agendamento associado a este atendimento
      let agendamentoId = null;
      if (atendimento.agendamentoId) {
        agendamentoId = atendimento.agendamentoId;
        console.log('📌 Agendamento ID encontrado:', agendamentoId);
      }
  
      // 2. Atualizar o atendimento no Firebase
      console.log('📌 Atualizando atendimento...');
      await firebaseService.update('atendimentos', id, {
        status: 'finalizado',
        horaFim: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        valorTotal,
        itensServico,
        itensProduto,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Atendimento atualizado');
  
      // 3. Se houver agendamento vinculado, atualizar para finalizado
      if (agendamentoId) {
        console.log('📌 Atualizando agendamento...');
        await firebaseService.update('agendamentos', agendamentoId, {
          status: 'finalizado',
          atendimentoRealizado: true,
          updatedAt: Timestamp.now()
        });
        console.log('✅ Agendamento atualizado para finalizado');
      }
  
      // 4. Buscar dados para comissão
      const profissional = await firebaseService.getById('profissionais', atendimento.profissionalId);
      const servicoPrincipal = itensServico.find(item => item.principal) || itensServico[0];
      
      console.log('📌 Profissional:', profissional);
      console.log('📌 Serviço principal:', servicoPrincipal);
  
      // 5. Calcular e registrar comissão (apenas sobre serviços, não sobre produtos)
      const percentual = profissional?.comissao || 40;
      const valorComissao = (calcularTotalServicos() * percentual) / 100;
  
      console.log('📊 Cálculo da comissão:');
      console.log('   - Percentual:', percentual);
      console.log('   - Valor serviços:', calcularTotalServicos());
      console.log('   - Comissão:', valorComissao);
  
      const comissaoData = {
        atendimentoId: id,
        profissionalId: atendimento.profissionalId,
        profissionalNome: profissional?.nome || atendimento.profissionalNome,
        servicoId: servicoPrincipal?.id || atendimento.servicoId,
        servicoNome: servicoPrincipal?.nome || atendimento.servicoNome || 'Serviço',
        valorAtendimento: calcularTotalServicos(),
        percentual,
        valor: valorComissao,
        data: atendimento.data,
        status: 'pendente',
        dataRegistro: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      console.log('📌 Salvando comissão no Firebase...');
      const comissaoId = await firebaseService.add('comissoes', comissaoData);
      console.log('✅ Comissão registrada com ID:', comissaoId);
  
      // 6. Atualizar cliente
      console.log('📌 Atualizando cliente...');
      await firebaseService.update('clientes', cliente.id, {
        ultimaVisita: new Date().toISOString().split('T')[0],
        totalGasto: (cliente.totalGasto || 0) + calcularTotalServicos(), // Só serviços entram no total gasto
        updatedAt: Timestamp.now()
      });
  
      setActiveStep(3);
      toast.success('Atendimento finalizado com sucesso!');
      
      // 7. Verificar se a comissão foi criada
      setTimeout(async () => {
        const comissoes = await firebaseService.getAll('comissoes');
        const minhaComissao = comissoes.find(c => c.atendimentoId === id);
        console.log('🔍 Verificação pós-finalização - Comissão encontrada:', minhaComissao);
        
        const transacoes = await firebaseService.getAll('transacoes');
        const minhasTransacoes = transacoes.filter(t => t.atendimentoId === id);
        console.log('🔍 Verificação pós-finalização - Transações encontradas:', minhasTransacoes);
  
        if (agendamentoId) {
          const agendamento = await firebaseService.getById('agendamentos', agendamentoId);
          console.log('🔍 Verificação pós-finalização - Agendamento atualizado:', agendamento);
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao finalizar atendimento:', error);
      toast.error('Erro ao finalizar atendimento');
    } finally {
      setSaving(false);
    }
  };

  const handleEnviarComprovante = async (metodo) => {
    try {
      const valorTotal = calcularValorTotal();
      const totalPago = calcularTotalPago();
      
      if (metodo === 'whatsapp') {
        const numero = cliente?.telefone?.replace(/\D/g, '') || '';
        
        // Filtrar produtos sem cobrança para não aparecer no comprovante de pagamento
        const produtosCobrados = itensProduto.filter(p => !p.semCobranca);
        
        const mensagem = `Olá ${cliente?.nome}, seu atendimento foi finalizado!\n\n` +
          `📋 *Serviços realizados:*\n${itensServico.map(s => `• ${s.nome}: R$ ${s.preco?.toFixed(2)}`).join('\n')}\n\n` +
          (produtosCobrados.length > 0 ? 
            `🛍️ *Produtos:*\n${produtosCobrados.map(p => 
              `• ${p.nome} (${p.quantidadeVenda} ${getUnidadeSimbolo(p.unidadeVenda)}): R$ ${((p.preco || 0) * (p.quantidadeVenda || 1)).toFixed(2)}`
            ).join('\n')}\n\n` 
            : '') +
          `💰 *Total: R$ ${valorTotal.toFixed(2)}*\n` +
          `💳 *Pago: R$ ${totalPago.toFixed(2)}*\n\n` +
          `Obrigado pela preferência!`;
        
        window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`, '_blank');
        toast.success('WhatsApp aberto para envio!');
      } else if (metodo === 'email') {
        toast.success('Comprovante enviado por email!');
      } else if (metodo === 'print') {
        window.print();
      }
    } catch (error) {
      toast.error('Erro ao enviar comprovante');
    }
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const formatarDataFirebase = (timestamp) => {
    if (!timestamp) return '';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('pt-BR');
    }
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  const formatarHoraFirebase = (timestamp) => {
    if (!timestamp) return '';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleTimeString('pt-BR');
    }
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!atendimento || !cliente || !profissional) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleVoltar}>
            Voltar
          </Button>
        }>
          Atendimento não encontrado
        </Alert>
      </Box>
    );
  }

  const valorTotal = calcularValorTotal();
  const totalPago = calcularTotalPago();
  const saldoRestante = calcularSaldoRestante();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={handleVoltar} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {atendimento.status === 'finalizado' ? 'Detalhes do Atendimento' : 'Finalizar Atendimento'}
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Informações do Atendimento */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Resumo do Atendimento
              </Typography>

              {/* Timer para atendimento em andamento */}
              {atendimento.status === 'em_andamento' && tempoDecorrido && (
                <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimerIcon sx={{ color: '#ff9800' }} />
                    <Typography variant="body2" color="textSecondary">
                      Tempo em atendimento:
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 600 }}>
                      {tempoDecorrido}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Cliente
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={cliente?.avatar} sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                    {cliente?.nome?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {cliente?.nome}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {cliente?.telefone}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Profissional
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profissional?.nome}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Data/Hora
                  </Typography>
                  <Typography variant="body1">
                    {new Date(atendimento.data).toLocaleDateString('pt-BR')}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {atendimento.horaInicio}
                    {atendimento.horaFim && ` - ${atendimento.horaFim}`}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Lista de Serviços - ARRAY */}
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Serviços
              </Typography>
              {itensServico.length > 0 ? (
                itensServico.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.nome} {item.principal && '(Principal)'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      R$ {(item.preco || 0).toFixed(2)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  Nenhum serviço registrado
                </Typography>
              )}

              {/* Lista de Produtos - ARRAY */}
              {itensProduto.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                    Produtos
                  </Typography>
                  {itensProduto.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {item.nome} {item.quantidadeVenda} {getUnidadeSimbolo(item.unidadeVenda)}
                        {item.semCobranca && (
                          <Chip
                            label="Sem cobrança"
                            size="small"
                            sx={{ ml: 1, bgcolor: '#ff9800', color: 'white', height: 20 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.semCobranca ? 'Grátis' : `R$ ${((item.preco || 0) * (item.quantidadeVenda || 1)).toFixed(2)}`}
                      </Typography>
                    </Box>
                  ))}
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Valor Total
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  R$ {valorTotal.toFixed(2)}
                </Typography>
              </Box>

              {/* Resumo de Pagamentos - ARRAY */}
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Pagamentos
                </Typography>
                {pagamentos.map((p, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      {FORMAS_PAGAMENTO.find(f => f.value === p.formaPagamento)?.label || p.formaPagamento}
                      {p.parcelas > 1 ? ` (${p.parcelas}x)` : ''}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      R$ {p.valor?.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Pago:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                    R$ {totalPago.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Restante:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: saldoRestante > 0 ? '#f44336' : '#4caf50' }}>
                    R$ {saldoRestante.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {(atendimento.observacoes || observacoes) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Observações
                    </Typography>
                    <Typography variant="body2">
                      {atendimento.observacoes || observacoes}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Status atual */}
              <Box sx={{ mt: 3 }}>
                <Chip
                  icon={atendimento.status === 'finalizado' ? <CheckIcon /> : <ScheduleIcon />}
                  label={atendimento.status === 'finalizado' ? 'Finalizado' : 'Em Andamento'}
                  color={atendimento.status === 'finalizado' ? 'success' : 'warning'}
                  sx={{ width: '100%', py: 2 }}
                />
              </Box>

              {/* Link para o financeiro */}
              {atendimento.status === 'finalizado' && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AccountBalanceIcon />}
                    onClick={() => navigate('/financeiro')}
                    sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                  >
                    Ver no Financeiro
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Conteúdo do Step */}
        <Grid item xs={12} md={8}>
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent>
                {activeStep === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Confirmar Atendimento
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      {atendimento.status === 'em_andamento' 
                        ? 'Atendimento já está em andamento. Você pode adicionar observações antes de prosseguir.'
                        : 'Verifique os dados e adicione observações sobre o atendimento.'}
                    </Alert>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Observações do atendimento"
                          multiline
                          rows={4}
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          placeholder="Registre aqui qualquer observação sobre o atendimento (produtos utilizados, preferências do cliente, etc.)"
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        variant="contained"
                        onClick={handleConfirmarAtendimento}
                        startIcon={<CheckIcon />}
                        disabled={saving}
                        sx={{
                          background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                        }}
                      >
                        {saving ? 'Salvando...' : 'Confirmar Atendimento'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Adicionar Itens
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      Adicione serviços adicionais ou produtos utilizados durante o atendimento.
                    </Alert>

                    {/* Adicionar Serviço */}
                    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Adicionar Serviço
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Autocomplete
                            options={servicosFiltrados}
                            getOptionLabel={(option) => `${option.nome} - R$ ${option.preco?.toFixed(2)}`}
                            value={servicoSelecionado}
                            onChange={(e, newValue) => setServicoSelecionado(newValue)}
                            inputValue={buscaServico}
                            onInputChange={(e, newValue) => setBuscaServico(newValue)}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                label="Buscar serviço..." 
                                size="small"
                                placeholder="Digite para buscar..."
                              />
                            )}
                            renderOption={(props, option) => (
                              <li {...props}>
                                <Box>
                                  <Typography variant="body2">{option.nome}</Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {option.categoria} - R$ {option.preco?.toFixed(2)}
                                  </Typography>
                                </Box>
                              </li>
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAdicionarServico}
                            sx={{ height: '40px' }}
                          >
                            Adicionar
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Adicionar Produto */}
                    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Adicionar Produto
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Autocomplete
                            options={produtosFiltrados}
                            getOptionLabel={(option) => 
                              `${option.nome} - R$ ${option.precoVenda?.toFixed(2)}`
                            }
                            value={produtoSelecionado}
                            onChange={(e, newValue) => setProdutoSelecionado(newValue)}
                            inputValue={buscaProduto}
                            onInputChange={(e, newValue) => setBuscaProduto(newValue)}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                label="Buscar produto..." 
                                size="small"
                                placeholder="Digite para buscar..."
                              />
                            )}
                            renderOption={(props, option) => {
                              const disponivel = calcularQuantidadeDisponivel(option, 1);
                              return (
                                <li {...props}>
                                  <Box>
                                    <Typography variant="body2">{option.nome}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      R$ {option.precoVenda?.toFixed(2)} | 
                                      Estoque: {option.quantidadeEstoque} {getUnidadeSimbolo(option.unidadeEstoque)} 
                                      ({disponivel} {getUnidadeSimbolo(option.unidadeVenda)})
                                    </Typography>
                                  </Box>
                                </li>
                              );
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Quantidade"
                            value={quantidadeProduto}
                            onChange={(e) => setQuantidadeProduto(parseFloat(e.target.value) || 1)}
                            InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={itemSemCobranca}
                                onChange={(e) => setItemSemCobranca(e.target.checked)}
                                icon={<InventoryIcon />}
                                checkedIcon={<NoCostIcon />}
                              />
                            }
                            label="Sem cobrança"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAdicionarProduto}
                            sx={{ height: '40px' }}
                          >
                            Adicionar
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Lista de Serviços Adicionados - ARRAY */}
                    {itensServico.length > 0 && (
                      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                          Serviços Adicionados
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Serviço</TableCell>
                                <TableCell align="right">Valor</TableCell>
                                <TableCell align="center">Ações</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {itensServico.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    {item.nome}
                                    {item.principal && (
                                      <Chip 
                                        label="Principal" 
                                        size="small" 
                                        sx={{ ml: 1, bgcolor: '#9c27b0', color: 'white', height: 20 }} 
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell align="right">R$ {(item.preco || 0).toFixed(2)}</TableCell>
                                  <TableCell align="center">
                                    <IconButton size="small" onClick={() => handleRemoverServico(index)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    )}

                    {/* Lista de Produtos Adicionados - ARRAY */}
                    {itensProduto.length > 0 && (
                      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                          Produtos Adicionados
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Produto</TableCell>
                                <TableCell align="right">Quantidade</TableCell>
                                <TableCell align="right">Unidade</TableCell>
                                <TableCell align="right">Preço Unit.</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Ações</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {itensProduto.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.nome}</TableCell>
                                  <TableCell align="right">{item.quantidadeVenda}</TableCell>
                                  <TableCell align="right">{getUnidadeSimbolo(item.unidadeVenda)}</TableCell>
                                  <TableCell align="right">
                                    {item.semCobranca ? 'Grátis' : `R$ ${(item.preco || 0).toFixed(2)}`}
                                  </TableCell>
                                  <TableCell align="right">
                                    {item.semCobranca ? 'Grátis' : `R$ ${((item.preco || 0) * (item.quantidadeVenda || 1)).toFixed(2)}`}
                                  </TableCell>
                                  <TableCell align="center">
                                    {item.semCobranca ? (
                                      <Chip
                                        label="Sem cobrança"
                                        size="small"
                                        sx={{ bgcolor: '#ff9800', color: 'white', height: 20 }}
                                      />
                                    ) : (
                                      <Chip
                                        label="Cobrado"
                                        size="small"
                                        sx={{ bgcolor: '#4caf50', color: 'white', height: 20 }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton size="small" onClick={() => handleRemoverProduto(index)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    )}

                    {/* Total */}
                    <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f3e5f5' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6">Total a pagar:</Typography>
                          <Typography variant="caption" color="textSecondary">
                            *Itens marcados como "sem cobrança" não entram no total
                          </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                          R$ {valorTotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Button onClick={() => setActiveStep(0)}>
                        Voltar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(2)}
                        startIcon={<PaymentIcon />}
                        disabled={itensServico.length === 0}
                        sx={{
                          background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                        }}
                      >
                        Ir para Pagamentos
                      </Button>
                    </Box>
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Registrar Pagamentos
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Valor total: R$ {valorTotal.toFixed(2)}</span>
                        <span>Pago: R$ {totalPago.toFixed(2)}</span>
                        <span style={{ color: saldoRestante > 0 ? '#f44336' : '#4caf50', fontWeight: 'bold' }}>
                          Restante: R$ {saldoRestante.toFixed(2)}
                        </span>
                      </Box>
                    </Alert>

                    {/* Lista de Pagamentos - ARRAY */}
                    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Pagamentos Registrados
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenPagamentoDialog()}
                          disabled={saldoRestante <= 0}
                          size="small"
                        >
                          Adicionar Pagamento
                        </Button>
                      </Box>

                      {pagamentos.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                          Nenhum pagamento registrado
                        </Typography>
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Forma</TableCell>
                                <TableCell align="right">Valor</TableCell>
                                <TableCell>Parcelas</TableCell>
                                <TableCell>Data</TableCell>
                                <TableCell align="center">Ações</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {pagamentos.map((pagamento, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    {FORMAS_PAGAMENTO.find(f => f.value === pagamento.formaPagamento)?.label || pagamento.formaPagamento}
                                  </TableCell>
                                  <TableCell align="right">R$ {pagamento.valor?.toFixed(2)}</TableCell>
                                  <TableCell>{pagamento.parcelas > 1 ? `${pagamento.parcelas}x` : '-'}</TableCell>
                                  <TableCell>{formatarDataFirebase(pagamento.data)}</TableCell>
                                  <TableCell align="center">
                                    <IconButton size="small" onClick={() => handleOpenPagamentoDialog(pagamento)}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleRemoverPagamento(pagamento.id)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Button onClick={() => setActiveStep(1)} disabled={saving}>
                        Voltar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleFinalizarAtendimento}
                        startIcon={<CheckIcon />}
                        disabled={saving || Math.abs(calcularSaldoRestante()) > 0.01}
                        sx={{
                          background: Math.abs(calcularSaldoRestante()) <= 0.01 
                            ? 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)' 
                            : 'grey',
                          '&:hover': {
                            background: Math.abs(calcularSaldoRestante()) <= 0.01 
                              ? 'linear-gradient(45deg, #45a049 30%, #4caf50 90%)' 
                              : 'grey',
                          },
                        }}
                      >
                        {saving ? 'Finalizando...' : 'Finalizar Atendimento'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {activeStep === 3 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#4caf50' }}>
                      <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Atendimento Finalizado com Sucesso!
                    </Typography>

                    <Alert severity="success" sx={{ mb: 3 }}>
                      Pagamentos registrados, comissão calculada e transação lançada no financeiro.
                    </Alert>

                    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Comprovante de Pagamento
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Cliente:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {cliente?.nome}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Profissional:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {profissional?.nome}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Data:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Date().toLocaleDateString('pt-BR')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Hora:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Date().toLocaleTimeString('pt-BR')}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Serviços Realizados:
                          </Typography>
                          {itensServico.map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{item.nome}</Typography>
                              <Typography variant="body2">R$ {(item.preco || 0).toFixed(2)}</Typography>
                            </Box>
                          ))}
                        </Grid>

                        {itensProduto.filter(p => !p.semCobranca).length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                              Produtos (cobrados):
                            </Typography>
                            {itensProduto.filter(p => !p.semCobranca).map((item, idx) => (
                              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">
                                  {item.nome} {item.quantidadeVenda} {getUnidadeSimbolo(item.unidadeVenda)}
                                </Typography>
                                <Typography variant="body2">R$ {((item.preco || 0) * (item.quantidadeVenda || 1)).toFixed(2)}</Typography>
                              </Box>
                            ))}
                          </Grid>
                        )}

                        {itensProduto.filter(p => p.semCobranca).length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                              Produtos (cortesia):
                            </Typography>
                            {itensProduto.filter(p => p.semCobranca).map((item, idx) => (
                              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">
                                  {item.nome} {item.quantidadeVenda} {getUnidadeSimbolo(item.unidadeVenda)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#ff9800' }}>Grátis</Typography>
                              </Box>
                            ))}
                          </Grid>
                        )}

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Total:</Typography>
                            <Typography variant="h6" sx={{ color: '#9c27b0' }}>
                              R$ {valorTotal.toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Pagamentos:
                          </Typography>
                          {pagamentos.map((pagamento, idx) => (
                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">
                                {FORMAS_PAGAMENTO.find(f => f.value === pagamento.formaPagamento)?.label || pagamento.formaPagamento}
                                {pagamento.parcelas > 1 ? ` (${pagamento.parcelas}x)` : ''}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                R$ {pagamento.valor?.toFixed(2)}
                              </Typography>
                            </Box>
                          ))}
                        </Grid>
                      </Grid>
                    </Paper>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Enviar comprovante para o cliente
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                      <Tooltip title="Abrir WhatsApp">
                        <Button
                          variant="outlined"
                          startIcon={<WhatsAppIcon />}
                          onClick={() => handleEnviarComprovante('whatsapp')}
                          sx={{ color: '#25D366', borderColor: '#25D366' }}
                        >
                          WhatsApp
                        </Button>
                      </Tooltip>
                      <Tooltip title="Enviar por email">
                        <Button
                          variant="outlined"
                          startIcon={<EmailIcon />}
                          onClick={() => handleEnviarComprovante('email')}
                        >
                          Email
                        </Button>
                      </Tooltip>
                      <Tooltip title="Imprimir comprovante">
                        <Button
                          variant="outlined"
                          startIcon={<PrintIcon />}
                          onClick={() => handleEnviarComprovante('print')}
                        >
                          Imprimir
                        </Button>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/atendimentos')}
                      >
                        Ver todos atendimentos
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/financeiro')}
                        startIcon={<AccountBalanceIcon />}
                        sx={{
                          background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                        }}
                      >
                        Ver no Financeiro
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Dialog de Pagamento */}
      <Dialog open={openPagamentoDialog} onClose={handleClosePagamentoDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: pagamentoEditando ? '#ff4081' : '#9c27b0', color: 'white' }}>
          {pagamentoEditando ? 'Editar Pagamento' : 'Novo Pagamento'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Forma de Pagamento</FormLabel>
                <RadioGroup
                  row
                  value={pagamentoForm.formaPagamento}
                  onChange={(e) => setPagamentoForm({ ...pagamentoForm, formaPagamento: e.target.value })}
                >
                  {FORMAS_PAGAMENTO.map(fp => (
                    <FormControlLabel 
                      key={fp.value}
                      value={fp.value} 
                      control={<Radio />} 
                      label={`${fp.icon} ${fp.label}`} 
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Valor"
                value={pagamentoForm.valor}
                onChange={(e) => setPagamentoForm({ ...pagamentoForm, valor: e.target.value })}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  inputProps: { min: 0.01, step: 0.01, max: saldoRestante }
                }}
                helperText={`Máximo: R$ ${saldoRestante.toFixed(2)}`}
              />
            </Grid>

            {pagamentoForm.formaPagamento === 'cartao_credito' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Parcelas</InputLabel>
                  <Select
                    value={pagamentoForm.parcelas}
                    label="Parcelas"
                    onChange={(e) => setPagamentoForm({ ...pagamentoForm, parcelas: e.target.value })}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                      <MenuItem key={num} value={num}>{num}x</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={2}
                value={pagamentoForm.observacoes}
                onChange={(e) => setPagamentoForm({ ...pagamentoForm, observacoes: e.target.value })}
                size="small"
                placeholder="Observações sobre o pagamento..."
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                <strong>Importante:</strong> Ao registrar o pagamento, uma transação será automaticamente criada no módulo financeiro.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePagamentoDialog}>Cancelar</Button>
          <Button
            onClick={handleSalvarPagamento}
            variant="contained"
            sx={{ bgcolor: '#9c27b0' }}
          >
            {pagamentoEditando ? 'Atualizar' : 'Registrar Pagamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModernAtendimento;
