// src/pages/ModernAtendimento.js
import React, { useState, useEffect, useRef } from 'react';
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
  Badge,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  PersonAdd as PersonAddIcon,
  LocalOffer as CouponIcon,
  Percent as PercentIcon,
  ShoppingCart as FreteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as ValidIcon,
  Cancel as InvalidIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Lock as LockIcon,
  ReceiptLong as ReceiptLongIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { cupomService } from '../services/cupomService';
import { Timestamp } from '../services/timestamp';

// Lista de unidades de medida
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

// Formas de pagamento
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

// Componente para exibir cupom aplicado
const CupomAplicado = ({ cupom, onRemover }) => {
  const getIcon = () => {
    switch (cupom.tipo) {
      case 'percentual': return <PercentIcon fontSize="small" />;
      case 'fixo': return <MoneyIcon fontSize="small" />;
      case 'frete': return <FreteIcon fontSize="small" />;
      case 'produto': return <InventoryIcon fontSize="small" />;
      default: return <CouponIcon fontSize="small" />;
    }
  };

  const getDescricao = () => {
    if (cupom.tipo === 'percentual') {
      return `${cupom.valor}% de desconto`;
    } else if (cupom.tipo === 'fixo') {
      return `R$ ${cupom.valor?.toFixed(2)} de desconto`;
    } else if (cupom.tipo === 'frete') {
      return 'Frete grátis';
    } else {
      return 'Desconto em produto';
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1,
        bgcolor: '#f3e5f5',
        borderColor: '#9c27b0',
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Badge
          color="success"
          variant="dot"
          sx={{ '& .MuiBadge-badge': { right: 2, top: 2 } }}
        >
          <Avatar sx={{ bgcolor: '#9c27b0', width: 32, height: 32 }}>
            {getIcon()}
          </Avatar>
        </Badge>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {cupom.codigo}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {cupom.descricao || getDescricao()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#9c27b0' }}>
            {cupom.tipo === 'percentual' ? `${cupom.valor}%` : `R$ ${cupom.valor?.toFixed(2)}`}
          </Typography>
          {cupom.valorDescontoCalculado > 0 && (
            <Typography variant="caption" color="success.main">
              - R$ {cupom.valorDescontoCalculado?.toFixed(2)}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onRemover} sx={{ color: '#f44336' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

// Componente para validação de cupom
const ValidadorCupom = ({ valorTotal, itensServico, cliente, onCupomValido }) => {
  const [codigoCupom, setCodigoCupom] = useState('');
  const [validando, setValidando] = useState(false);
  const [cupomEncontrado, setCupomEncontrado] = useState(null);
  const [erro, setErro] = useState('');

  const handleBuscarCupom = async () => {
    if (!codigoCupom.trim()) {
      setErro('Digite um código de cupom');
      return;
    }

    setValidando(true);
    setErro('');
    setCupomEncontrado(null);

    try {
      const cupom = await cupomService.buscarCupomPorCodigo(codigoCupom);

      if (!cupom) {
        setErro('Cupom não encontrado');
        return;
      }

      const validacao = await cupomService.validarCupom(
        cupom.codigo,
        cliente?.id,
        valorTotal,
        itensServico
      );

      if (!validacao.valido) {
        setErro(validacao.motivo || 'Cupom inválido');
        return;
      }

      setCupomEncontrado({
        ...cupom,
        ...validacao,
      });

    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      setErro('Erro ao validar cupom');
    } finally {
      setValidando(false);
    }
  };

  const handleAplicarCupom = () => {
    if (cupomEncontrado) {
      onCupomValido(cupomEncontrado);
      setCodigoCupom('');
      setCupomEncontrado(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Digite o código do cupom"
          value={codigoCupom}
          onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleBuscarCupom()}
          error={!!erro}
          helperText={erro}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CouponIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          onClick={handleBuscarCupom}
          disabled={validando}
          sx={{ minWidth: '100px' }}
        >
          {validando ? <CircularProgress size={24} /> : 'Validar'}
        </Button>
      </Box>

      {cupomEncontrado && (
        <Fade in>
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 2,
              bgcolor: '#e8f5e8',
              borderColor: '#4caf50',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ValidIcon sx={{ color: '#4caf50' }} />
              <Typography variant="subtitle2" sx={{ color: '#4caf50' }}>
                Cupom válido!
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {cupomEncontrado.codigo}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {cupomEncontrado.descricao || 
                (cupomEncontrado.tipo === 'percentual' 
                  ? `${cupomEncontrado.valor}% de desconto`
                  : cupomEncontrado.tipo === 'fixo'
                    ? `R$ ${cupomEncontrado.valor?.toFixed(2)} de desconto`
                    : 'Desconto aplicável')}
            </Typography>

            {cupomEncontrado.motivo && (
              <Typography variant="caption" color="info.main" sx={{ display: 'block', mb: 1 }}>
                {cupomEncontrado.motivo}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
              <Button size="small" onClick={() => setCupomEncontrado(null)}>
                Cancelar
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleAplicarCupom}
                sx={{ bgcolor: '#4caf50' }}
              >
                Aplicar Cupom
              </Button>
            </Box>
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

function ModernAtendimento() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Refs para controle de duplicidade
  const processandoRef = useRef(false);
  const ultimaAcaoRef = useRef({ tipo: '', timestamp: 0, hash: '' });
  const pagamentosProcessadosRef = useRef(new Set());
  const pontosProcessadosRef = useRef(new Set());
  const cuponsProcessadosRef = useRef(new Set());
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [atendimento, setAtendimento] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [profissional, setProfissional] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [usuario, setUsuario] = useState(null);
  
  // Configurações de fidelidade
  const [fidelidadeConfig, setFidelidadeConfig] = useState(null);
  const [pontosCliente, setPontosCliente] = useState(0);
  const [nivelCliente, setNivelCliente] = useState('bronze');
  const [pontosGanhos, setPontosGanhos] = useState(0);
  const [bonusAplicados, setBonusAplicados] = useState([]);
  
  // Configurações do sistema
  const [configuracoes, setConfiguracoes] = useState(null);
  
  // Estado para cupons
  const [cuponsAplicados, setCuponsAplicados] = useState([]);
  const [mostrarValidadorCupom, setMostrarValidadorCupom] = useState(false);
  const [descontoTotalCupons, setDescontoTotalCupons] = useState(0);
  const [cuponsProximosExpiracao, setCuponsProximosExpiracao] = useState([]);
  
  // 🔥 ESTADOS PARA ANAMNESE
  const [respostasAnamnese, setRespostasAnamnese] = useState(null);
  const [openAnamneseDialog, setOpenAnamneseDialog] = useState(false);
  
  // Itens do atendimento - ARRAYS
  const [itensServico, setItensServico] = useState([]);
  const [itensProduto, setItensProduto] = useState([]);
  
  // Controles para adicionar itens
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidadeProduto, setQuantidadeProduto] = useState(1);
  
  // Controle para item sem cobrança
  const [itemSemCobranca, setItemSemCobranca] = useState(false);
  
  // Busca nos selects
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

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  // Função para gerar hash de uma ação
  const gerarHashAcao = (tipo, dados) => {
    try {
      const str = `${tipo}_${JSON.stringify(dados || {})}_${Date.now()}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString();
    } catch (error) {
      return `${Date.now()}_${Math.random()}`;
    }
  };

  // Função para verificar duplicidade
  const verificarDuplicidade = (tipo, dados, intervaloMs = 3000) => {
    try {
      const agora = Date.now();
      const hash = gerarHashAcao(tipo, dados);
      
      if (ultimaAcaoRef.current.tipo === tipo && 
          ultimaAcaoRef.current.hash === hash && 
          agora - ultimaAcaoRef.current.timestamp < intervaloMs) {
        console.warn(`⚠️ Ação duplicada detectada: ${tipo}`);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  // Função para registrar ação processada
  const registrarAcaoProcessada = (tipo, dados) => {
    try {
      ultimaAcaoRef.current = {
        tipo,
        timestamp: Date.now(),
        hash: gerarHashAcao(tipo, dados)
      };
    } catch (error) {
      // Ignora erro
    }
  };

  // 🔥 FUNÇÃO DE AUDITORIA CORRIGIDA - SEM ERROS DE UNDEFINED
  const registrarAuditoria = async (acao, entidadeId, detalhes, dados = {}) => {
    try {
      if (verificarDuplicidade('auditoria', { acao, entidadeId }, 5000)) {
        console.log('🔄 Auditoria duplicada ignorada:', acao);
        return;
      }

      // 🔥 Função para limpar dados (remover undefined, null, funções)
      const limparDados = (obj) => {
        if (obj === undefined || obj === null) return null;
        if (typeof obj !== 'object') return obj;
        if (obj instanceof Date) return obj.toISOString();
        if (obj instanceof Timestamp) return obj.toDate().toISOString();
        
        const limpo = {};
        
        Object.keys(obj).forEach(key => {
          try {
            const valor = obj[key];
            
            if (valor === undefined || valor === null) {
              // Ignora undefined/null
              return;
            } else if (typeof valor === 'function') {
              // Ignora funções
              return;
            } else if (typeof valor === 'object') {
              // Recursivamente limpa objetos aninhados
              const valorLimpo = limparDados(valor);
              if (valorLimpo && Object.keys(valorLimpo).length > 0) {
                limpo[key] = valorLimpo;
              }
            } else if (typeof valor === 'number' && isNaN(valor)) {
              // Ignora NaN
              return;
            } else if (typeof valor === 'string' && valor === '') {
              // Mantém string vazia
              limpo[key] = '';
            } else {
              // Mantém valores válidos
              limpo[key] = valor;
            }
          } catch (e) {
            // Ignora erros ao processar chave
          }
        });
        
        return limpo;
      };

      const usuarioId = usuario?.id || 'sistema';
      const usuarioNome = usuario?.nome || 'Sistema';
      
      // 🔥 Garantir que todos os dados são seguros
      const dadosSeguros = {
        ...dados,
        usuarioId,
        usuarioNome,
        timestamp: new Date().toISOString(),
        hash: gerarHashAcao('auditoria', { acao, entidadeId })
      };

      // 🔥 Garantir que cliente não seja undefined
      if (dadosSeguros.cliente === undefined) {
        dadosSeguros.cliente = null;
      } else if (dadosSeguros.cliente && typeof dadosSeguros.cliente === 'object') {
        // Extrair apenas campos seguros do cliente
        const clienteObj = dadosSeguros.cliente;
        dadosSeguros.cliente = {
          id: clienteObj.id || '',
          nome: clienteObj.nome || '',
          email: clienteObj.email || '',
          telefone: clienteObj.telefone || ''
        };
      }

      // 🔥 Garantir que profissional não seja undefined
      if (dadosSeguros.profissional === undefined) {
        dadosSeguros.profissional = null;
      } else if (dadosSeguros.profissional && typeof dadosSeguros.profissional === 'object') {
        const profObj = dadosSeguros.profissional;
        dadosSeguros.profissional = {
          id: profObj.id || '',
          nome: profObj.nome || ''
        };
      }

      // 🔥 Converter arrays para contagem (para evitar objetos grandes)
      if (dadosSeguros.itensServico !== undefined && Array.isArray(dadosSeguros.itensServico)) {
        dadosSeguros.quantidadeServicos = dadosSeguros.itensServico.length;
        delete dadosSeguros.itensServico;
      }
      
      if (dadosSeguros.itensProduto !== undefined && Array.isArray(dadosSeguros.itensProduto)) {
        dadosSeguros.quantidadeProdutos = dadosSeguros.itensProduto.length;
        delete dadosSeguros.itensProduto;
      }

      const auditoriaData = {
        acao: acao || 'acao_nao_especificada',
        entidade: 'atendimentos',
        entidadeId: entidadeId || id || 'sem_id',
        detalhes: detalhes || '',
        dados: limparDados(dadosSeguros) || {},
        data: Timestamp.now()
      };

      console.log('📝 Registrando auditoria:', JSON.stringify(auditoriaData, (key, value) => {
        if (value && value._methodName) return undefined; // Remove funções do Firebase
        return value;
      }, 2).substring(0, 500)); // Limita log para não poluir

      await firebaseService.add('auditoria', auditoriaData);
      
      registrarAcaoProcessada('auditoria', { acao, entidadeId });
    } catch (error) {
      console.error('❌ Erro ao registrar auditoria (não crítico):', error);
      // Não interrompe o fluxo principal se auditoria falhar
    }
  };

  // ============================================
  // FUNÇÕES DE CÁLCULO
  // ============================================

  const calcularTotalServicos = () => {
    return itensServico.reduce((acc, item) => acc + (item.preco || 0), 0);
  };

  const calcularTotalProdutos = () => {
    return itensProduto.reduce((acc, item) => {
      if (item.semCobranca) return acc;
      return acc + ((item.preco || 0) * (item.quantidadeVenda || 1));
    }, 0);
  };

  const calcularSubtotal = () => {
    return calcularTotalServicos() + calcularTotalProdutos();
  };

  const calcularDescontoCupons = () => {
    let descontoTotal = 0;
    const subtotal = calcularSubtotal();

    cuponsAplicados.forEach(cupom => {
      if (cupom.tipo === 'percentual') {
        let valorDesconto = (subtotal * cupom.valor) / 100;
        
        if (cupom.valorMaximoDesconto && valorDesconto > cupom.valorMaximoDesconto) {
          valorDesconto = cupom.valorMaximoDesconto;
        }
        
        descontoTotal += valorDesconto;
        cupom.valorDescontoCalculado = valorDesconto;
        
      } else if (cupom.tipo === 'fixo') {
        descontoTotal += cupom.valor;
        cupom.valorDescontoCalculado = cupom.valor;
      }
    });

    if (descontoTotal > subtotal) {
      descontoTotal = subtotal;
    }

    setDescontoTotalCupons(descontoTotal);
    return descontoTotal;
  };

  const calcularValorTotal = () => {
    return calcularSubtotal() - descontoTotalCupons;
  };

  const calcularTotalPago = () => {
    return pagamentos.reduce((acc, p) => acc + (p.valor || 0), 0);
  };

  const calcularSaldoRestante = () => {
    return calcularValorTotal() - calcularTotalPago();
  };

  const getUnidadeSimbolo = (unidade) => {
    const unidadeEncontrada = UNIDADES_MEDIDA.find(u => u.value === unidade);
    return unidadeEncontrada?.simbolo || unidade;
  };

  const calcularQuantidadeDisponivel = (produto, quantidadeVenda) => {
    if (!produto) return 0;
    const estoqueEmUnidadeVenda = produto.quantidadeEstoque * (produto.fatorConversao || 1);
    return Math.floor(estoqueEmUnidadeVenda);
  };

  const converterParaEstoque = (produto, quantidadeVenda) => {
    if (!produto) return 0;
    return quantidadeVenda / (produto.fatorConversao || 1);
  };

  // ============================================
  // FUNÇÕES DE CARREGAMENTO
  // ============================================

  // Carregar usuário atual
  useEffect(() => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const usuarioData = JSON.parse(usuarioStr);
        setUsuario(usuarioData);
        console.log('✅ Usuário carregado:', usuarioData);
      } else {
        console.warn('⚠️ Nenhum usuário encontrado no localStorage');
        setUsuario({ id: 'sistema', nome: 'Sistema' });
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    carregarServicosEProdutos();
    carregarConfigFidelidade();
    carregarConfiguracoes();
    carregarRespostasAnamnese();
  }, [id]);

  useEffect(() => {
    if (atendimento && atendimento.horaInicio && !atendimento.horaFim) {
      const calcularTempo = () => {
        const inicio = new Date(`${atendimento.data}T${atendimento.horaInicio}`);
        const agora = new Date();
        const diff = Math.floor((agora - inicio) / 60000);
        const horas = Math.floor(diff / 60);
        const minutos = diff % 60;
        setTempoDecorrido(`${horas}h ${minutos}min`);
      };

      calcularTempo();
      const interval = setInterval(calcularTempo, 60000);
      return () => clearInterval(interval);
    }
  }, [atendimento]);

  useEffect(() => {
    if (cliente?.id && fidelidadeConfig?.ativo) {
      carregarPontosCliente(cliente.id);
    }
  }, [cliente, fidelidadeConfig]);

  useEffect(() => {
    if (fidelidadeConfig?.ativo && cliente) {
      calcularPontosGanhos();
    }
  }, [itensServico, fidelidadeConfig, cliente]);

  useEffect(() => {
    calcularDescontoCupons();
  }, [cuponsAplicados, itensServico, itensProduto]);

  const carregarConfigFidelidade = async () => {
    try {
      const configs = await firebaseService.getAll('config_fidelidade').catch(() => []);
      if (configs && configs.length > 0) {
        setFidelidadeConfig(configs[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de fidelidade:', error);
    }
  };

  const carregarConfiguracoes = async () => {
    try {
      const configs = await firebaseService.getAll('configuracoes').catch(() => []);
      if (configs && configs.length > 0) {
        setConfiguracoes(configs[0]);
        console.log('✅ Configurações carregadas:', configs[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const carregarPontosCliente = async (clienteId) => {
    try {
      const pontuacoes = await firebaseService.query('pontuacao', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]);

      const saldo = pontuacoes.reduce((acc, p) => {
        return acc + (p.tipo === 'credito' ? p.quantidade : -p.quantidade);
      }, 0);

      setPontosCliente(saldo);

      let nivel = 'bronze';
      if (fidelidadeConfig?.niveis) {
        if (saldo >= (fidelidadeConfig.niveis.platina?.minimo || 5000)) nivel = 'platina';
        else if (saldo >= (fidelidadeConfig.niveis.ouro?.minimo || 2000)) nivel = 'ouro';
        else if (saldo >= (fidelidadeConfig.niveis.prata?.minimo || 500)) nivel = 'prata';
      }
      setNivelCliente(nivel);
    } catch (error) {
      console.error('Erro ao carregar pontos do cliente:', error);
    }
  };

  const calcularPontosGanhos = () => {
    if (!fidelidadeConfig?.ativo) return;

    const valorServicos = calcularTotalServicos();
    let pontos = 0;
    const bonus = [];

    const pontosPorReal = fidelidadeConfig.pontosPorReal || 10;
    pontos += Math.floor(valorServicos * pontosPorReal);

    const multiplicador = fidelidadeConfig.niveis?.[nivelCliente]?.multiplicador || 1;
    if (multiplicador > 1) {
      pontos = Math.floor(pontos * multiplicador);
      bonus.push(`Multiplicador ${nivelCliente}: ${multiplicador}x`);
    }

    if (fidelidadeConfig.regrasEspeciais?.primeiraCompra && !cliente?.ultimaVisita) {
      pontos += fidelidadeConfig.bonusPrimeiroAtendimento || 0;
      bonus.push(`Primeiro atendimento: +${fidelidadeConfig.bonusPrimeiroAtendimento} pontos`);
    }

    setPontosGanhos(pontos);
    setBonusAplicados(bonus);
  };

  // 🔥 FUNÇÃO PARA CARREGAR RESPOSTAS DA ANAMNESE
  const carregarRespostasAnamnese = async () => {
    if (!id) return;
    
    try {
      // Buscar respostas associadas ao atendimento
      const respostas = await firebaseService.query('respostas_anamnese', [
        { field: 'atendimentoId', operator: '==', value: id }
      ]);
      
      if (respostas.length > 0) {
        setRespostasAnamnese(respostas[0]);
        console.log('✅ Respostas de anamnese carregadas:', respostas[0]);
      } else {
        // Se não encontrar pelo atendimento, tentar pelo agendamento
        if (atendimento?.agendamentoId) {
          const respostasAgendamento = await firebaseService.query('respostas_anamnese', [
            { field: 'agendamentoId', operator: '==', value: atendimento.agendamentoId }
          ]);
          
          if (respostasAgendamento.length > 0) {
            setRespostasAnamnese(respostasAgendamento[0]);
            console.log('✅ Respostas de anamnese carregadas via agendamento:', respostasAgendamento[0]);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar respostas de anamnese:', error);
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const atendimentoData = await firebaseService.getById('atendimentos', id);
      setAtendimento(atendimentoData);
      setObservacoes(atendimentoData.observacoes || '');

      const [clienteData, profissionalData] = await Promise.all([
        firebaseService.getById('clientes', atendimentoData.clienteId),
        firebaseService.getById('profissionais', atendimentoData.profissionalId)
      ]);

      setCliente(clienteData);
      setProfissional(profissionalData);

      if (atendimentoData.itensServico && atendimentoData.itensServico.length > 0) {
        setItensServico(atendimentoData.itensServico);
      } else if (atendimentoData.servicoId) {
        const servicoData = await firebaseService.getById('servicos', atendimentoData.servicoId);
        setItensServico([{
          id: servicoData.id,
          nome: servicoData.nome,
          preco: servicoData.preco,
          duracao: servicoData.duracao,
          principal: true
        }]);
      }

      if (atendimentoData.itensProduto) {
        setItensProduto(atendimentoData.itensProduto);
      }

      if (atendimentoData.cuponsAplicados) {
        setCuponsAplicados(atendimentoData.cuponsAplicados);
        // Preencher set de cupons processados
        atendimentoData.cuponsAplicados.forEach(c => {
          if (c.id) cuponsProcessadosRef.current.add(c.id);
        });
      }

      const pagamentosData = await firebaseService.query('pagamentos', [
        { field: 'atendimentoId', operator: '==', value: id }
      ]);
      setPagamentos(pagamentosData || []);
      
      // Preencher set de pagamentos processados
      pagamentosData.forEach(p => {
        if (p.id) pagamentosProcessadosRef.current.add(p.id);
      });

      // 🔥 Chamada de auditoria corrigida - passando dados seguros
      await registrarAuditoria(
        'acesso_atendimento',
        id,
        `Acesso ao atendimento`,
        { 
          clienteId: clienteData?.id,
          clienteNome: clienteData?.nome,
          profissionalId: profissionalData?.id,
          profissionalNome: profissionalData?.nome
        }
      );

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

  // ============================================
  // FUNÇÕES DE MANIPULAÇÃO DE ITENS
  // ============================================

  const servicosFiltrados = servicosDisponiveis.filter(servico => 
    servico.nome?.toLowerCase().includes(buscaServico.toLowerCase()) ||
    servico.categoria?.toLowerCase().includes(buscaServico.toLowerCase())
  );

  const produtosFiltrados = produtosDisponiveis.filter(produto => 
    produto.nome?.toLowerCase().includes(buscaProduto.toLowerCase()) ||
    produto.categoria?.toLowerCase().includes(buscaProduto.toLowerCase()) ||
    produto.descricao?.toLowerCase().includes(buscaProduto.toLowerCase())
  );

  const handleAdicionarServico = () => {
    if (!servicoSelecionado) {
      toast.error('Selecione um serviço');
      return;
    }

    if (itensServico.some(item => item.id === servicoSelecionado.id)) {
      toast.error('Serviço já adicionado');
      return;
    }

    setItensServico([...itensServico, {
      id: servicoSelecionado.id,
      nome: servicoSelecionado.nome,
      preco: servicoSelecionado.preco,
      duracao: servicoSelecionado.duracao,
      principal: itensServico.length === 0
    }]);

    setServicoSelecionado(null);
    setBuscaServico('');
    toast.success('Serviço adicionado!');
  };

  const handleAdicionarProduto = () => {
    if (!produtoSelecionado) {
      toast.error('Selecione um produto');
      return;
    }

    if (quantidadeProduto <= 0) {
      toast.error('Quantidade inválida');
      return;
    }

    const quantidadeDisponivel = calcularQuantidadeDisponivel(produtoSelecionado, quantidadeProduto);
    
    if (quantidadeProduto > quantidadeDisponivel) {
      toast.error(
        `Quantidade indisponível. Disponível: ${quantidadeDisponivel} ${getUnidadeSimbolo(produtoSelecionado.unidadeVenda)}`
      );
      return;
    }

    const quantidadeEstoque = converterParaEstoque(produtoSelecionado, quantidadeProduto);

    const produtoExistente = itensProduto.find(item => item.id === produtoSelecionado.id);
    
    if (produtoExistente) {
      setItensProduto(itensProduto.map(item => 
        item.id === produtoSelecionado.id 
          ? { 
              ...item, 
              quantidadeVenda: item.quantidadeVenda + quantidadeProduto,
              quantidadeEstoque: item.quantidadeEstoque + quantidadeEstoque,
              semCobranca: item.semCobranca
            }
          : item
      ));
    } else {
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

    const novaQuantidadeEstoque = produtoSelecionado.quantidadeEstoque - quantidadeEstoque;
    firebaseService.update('produtos', produtoSelecionado.id, {
      quantidadeEstoque: novaQuantidadeEstoque,
      updatedAt: Timestamp.now()
    });

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
        usuario: usuario?.nome || 'Sistema'
      };
      await firebaseService.add('movimentacoes_estoque', movimentacao);
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
    }
  };

  const handleRemoverServico = (index) => {
    const novosItens = itensServico.filter((_, i) => i !== index);
    if (itensServico[index].principal && novosItens.length > 0) {
      novosItens[0].principal = true;
    }
    setItensServico(novosItens);
  };

  const handleRemoverProduto = (index) => {
    const itemRemovido = itensProduto[index];
    
    if (itemRemovido) {
      firebaseService.getById('produtos', itemRemovido.id).then(produto => {
        const novaQuantidade = (produto.quantidadeEstoque || 0) + itemRemovido.quantidadeEstoque;
        firebaseService.update('produtos', itemRemovido.id, {
          quantidadeEstoque: novaQuantidade,
          updatedAt: Timestamp.now()
        });
        
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

  // ============================================
  // FUNÇÕES DE CUPONS
  // ============================================

  const handleAplicarCupom = (cupom) => {
    if (cuponsAplicados.some(c => c.id === cupom.id)) {
      toast.error('Este cupom já foi aplicado');
      return;
    }

    if (verificarDuplicidade('aplicar_cupom', { cupomId: cupom.id })) {
      toast.error('Operação já foi processada. Aguarde um momento.');
      return;
    }

    setCuponsAplicados([...cuponsAplicados, cupom]);
    cuponsProcessadosRef.current.add(cupom.id);
    setMostrarValidadorCupom(false);
    
    toast.success(`Cupom ${cupom.codigo} aplicado com sucesso!`);
    registrarAcaoProcessada('aplicar_cupom', { cupomId: cupom.id });
    
    registrarAuditoria(
      'aplicar_cupom',
      id,
      `Cupom ${cupom.codigo} aplicado`,
      { cupomId: cupom.id, valorDesconto: cupom.valor }
    );
  };

  const handleRemoverCupom = (index) => {
    const cupomRemovido = cuponsAplicados[index];
    
    if (verificarDuplicidade('remover_cupom', { cupomId: cupomRemovido.id })) {
      toast.error('Operação já foi processada. Aguarde um momento.');
      return;
    }

    const novosCupons = cuponsAplicados.filter((_, i) => i !== index);
    setCuponsAplicados(novosCupons);
    cuponsProcessadosRef.current.delete(cupomRemovido.id);
    
    toast.info(`Cupom ${cupomRemovido.codigo} removido`);
    registrarAcaoProcessada('remover_cupom', { cupomId: cupomRemovido.id });
    
    registrarAuditoria(
      'remover_cupom',
      id,
      `Cupom ${cupomRemovido.codigo} removido`,
      { cupomId: cupomRemovido.id }
    );
  };

  const verificarCuponsProximosExpiracao = async () => {
    try {
      if (!cliente?.id) return;
      
      const cupons = await cupomService.verificarCuponsExpirados(cliente.id);
      setCuponsProximosExpiracao(cupons);
      
      if (cupons.length > 0) {
        toast.info(`${cupons.length} cupom(ns) próximo(s) de expirar!`, {
          icon: '⏰',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao verificar cupons próximos de expirar:', error);
    }
  };

  useEffect(() => {
    if (cliente?.id) {
      verificarCuponsProximosExpiracao();
    }
  }, [cliente]);

  // ============================================
  // FUNÇÕES DE ATENDIMENTO
  // ============================================

  const handleConfirmarAtendimento = async () => {
    if (verificarDuplicidade('confirmar_atendimento', { id })) {
      toast.error('Operação já foi processada. Aguarde um momento.');
      return;
    }

    if (processandoRef.current) {
      toast.error('Já existe uma operação em andamento');
      return;
    }

    try {
      processandoRef.current = true;
      setSaving(true);
      
      const valorTotal = calcularValorTotal();
      
      const dadosAtendimento = {
        observacoes,
        itensServico: itensServico,
        itensProduto: itensProduto,
        cuponsAplicados: cuponsAplicados,
        descontoTotal: descontoTotalCupons,
        valorTotal,
        status: 'em_andamento',
        updatedAt: Timestamp.now()
      };

      await firebaseService.update('atendimentos', id, dadosAtendimento);

      await registrarAuditoria(
        'confirmar_atendimento',
        id,
        `Atendimento confirmado`,
        { 
          valorTotal, 
          quantidadeServicos: itensServico.length, 
          quantidadeProdutos: itensProduto.length 
        }
      );

      setActiveStep(1);
      toast.success('Atendimento confirmado!');
      registrarAcaoProcessada('confirmar_atendimento', { id });
      
    } catch (error) {
      console.error('Erro ao confirmar atendimento:', error);
      toast.error('Erro ao confirmar atendimento');
    } finally {
      processandoRef.current = false;
      setSaving(false);
    }
  };

  // ============================================
  // FUNÇÕES DE PAGAMENTO
  // ============================================

  const criarTransacaoFinanceira = async (pagamento) => {
    try {
      const transacao = {
        tipo: 'receita',
        descricao: `Atendimento - ${cliente?.nome || 'Cliente'}`,
        valor: pagamento.valor,
        data: new Date().toISOString().split('T')[0],
        dataVencimento: new Date().toISOString().split('T')[0],
        categoria: 'Serviços',
        formaPagamento: pagamento.formaPagamento,
        status: 'pago',
        clienteId: cliente?.id || null,
        atendimentoId: id,
        observacoes: `Pagamento referente ao atendimento ${id}. Forma: ${FORMAS_PAGAMENTO.find(f => f.value === pagamento.formaPagamento)?.label || pagamento.formaPagamento}${pagamento.parcelas > 1 ? ` em ${pagamento.parcelas}x` : ''}. ${pagamento.observacoes || ''}`,
        parcelas: pagamento.parcelas || 1,
        dataPagamento: new Date().toISOString(),
        origem: 'atendimento',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const transacaoId = await firebaseService.add('transacoes', transacao);

      await registrarAuditoria(
        'criar_transacao',
        transacaoId,
        `Transação financeira criada para atendimento`,
        { valor: pagamento.valor, formaPagamento: pagamento.formaPagamento }
      );

      return transacaoId;
    } catch (error) {
      console.error('❌ Erro ao criar transação financeira:', error);
      throw error;
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

  const handleSalvarPagamento = async () => {
    const dadosPagamento = {
      formaPagamento: pagamentoForm.formaPagamento,
      valor: pagamentoForm.valor,
      parcelas: pagamentoForm.parcelas
    };

    if (verificarDuplicidade('salvar_pagamento', dadosPagamento)) {
      toast.error('Pagamento já foi processado. Aguarde um momento.');
      return;
    }

    if (processandoRef.current) {
      toast.error('Já existe uma operação em andamento');
      return;
    }

    try {
      processandoRef.current = true;
      setSaving(true);

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
        const valorAlterado = Math.abs(pagamentoEditando.valor - pagamentoData.valor) > 0.01;
        
        if (!valorAlterado) {
          toast.error('Nenhuma alteração no valor do pagamento');
          return;
        }

        await firebaseService.update('pagamentos', pagamentoEditando.id, pagamentoData);
        pagamentoSalvo = { ...pagamentoData, id: pagamentoEditando.id };
        setPagamentos(pagamentos.map(p => p.id === pagamentoEditando.id ? pagamentoSalvo : p));
        
        await registrarAuditoria(
          'atualizar_pagamento',
          pagamentoEditando.id,
          `Pagamento atualizado`,
          { valor: pagamentoData.valor, formaPagamento: pagamentoData.formaPagamento }
        );
        
        toast.success('Pagamento atualizado!');
      } else {
        const pagamentoExistente = pagamentos.find(p => 
          Math.abs(p.valor - pagamentoData.valor) < 0.01 && 
          p.formaPagamento === pagamentoData.formaPagamento
        );

        if (pagamentoExistente) {
          toast.error('Já existe um pagamento com este valor e forma de pagamento');
          return;
        }

        pagamentoSalvo = await firebaseService.add('pagamentos', pagamentoData);
        pagamentosProcessadosRef.current.add(pagamentoSalvo.id);
        setPagamentos([...pagamentos, pagamentoSalvo]);
        
        await registrarAuditoria(
          'criar_pagamento',
          pagamentoSalvo.id,
          `Pagamento registrado`,
          { valor: pagamentoData.valor, formaPagamento: pagamentoData.formaPagamento }
        );
        
        toast.success('Pagamento registrado!');

        await criarTransacaoFinanceira(pagamentoSalvo);
      }

      handleClosePagamentoDialog();
      registrarAcaoProcessada('salvar_pagamento', dadosPagamento);
      
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      toast.error('Erro ao salvar pagamento');
    } finally {
      processandoRef.current = false;
      setSaving(false);
    }
  };

  const handleRemoverPagamento = async (pagamentoId) => {
    if (verificarDuplicidade('remover_pagamento', { pagamentoId })) {
      toast.error('Operação já foi processada. Aguarde um momento.');
      return;
    }

    if (window.confirm('Deseja remover este pagamento?')) {
      try {
        const transacoes = await firebaseService.query('transacoes', [
          { field: 'atendimentoId', operator: '==', value: id }
        ]);

        for (const transacao of transacoes) {
          await firebaseService.delete('transacoes', transacao.id);
        }

        await firebaseService.delete('pagamentos', pagamentoId);
        pagamentosProcessadosRef.current.delete(pagamentoId);
        setPagamentos(pagamentos.filter(p => p.id !== pagamentoId));
        
        await registrarAuditoria(
          'remover_pagamento',
          pagamentoId,
          `Pagamento removido`,
          { atendimentoId: id }
        );
        
        toast.success('Pagamento e transações removidos!');
        registrarAcaoProcessada('remover_pagamento', { pagamentoId });
        
      } catch (error) {
        console.error('Erro ao remover pagamento:', error);
        toast.error('Erro ao remover pagamento');
      }
    }
  };

  // ============================================
  // FUNÇÕES DE FIDELIDADE - CORRIGIDAS
  // ============================================

  const registrarUsoCupom = async (cupom) => {
    try {
      if (cuponsProcessadosRef.current.has(cupom.id)) {
        console.log(`🔄 Cupom ${cupom.codigo} já foi processado`);
        return;
      }

      await cupomService.registrarUso(cupom.id, {
        cupomCodigo: cupom.codigo,
        atendimentoId: id,
        clienteId: cliente?.id,
        clienteNome: cliente?.nome,
        valorDesconto: cupom.valorDescontoCalculado || 0,
        valorTotal: calcularValorTotal(),
      });
      
      cuponsProcessadosRef.current.add(cupom.id);
      console.log(`✅ Uso do cupom ${cupom.codigo} registrado`);
    } catch (error) {
      console.error('❌ Erro ao registrar uso do cupom:', error);
    }
  };

  // 🔥 FUNÇÃO CORRIGIDA PARA ADICIONAR PONTOS DE FIDELIDADE
  const adicionarPontosFidelidade = async () => {
    if (!fidelidadeConfig?.ativo) {
      console.log('ℹ️ Fidelidade não está ativa');
      return;
    }

    if (pontosGanhos <= 0) {
      console.log('ℹ️ Nenhum ponto a ser adicionado');
      return;
    }

    if (!cliente?.id) {
      console.log('ℹ️ Cliente não identificado');
      return;
    }

    try {
      const pontosKey = `${id}_${cliente.id}`;
      
      // Verificar se já processou estes pontos
      if (pontosProcessadosRef.current.has(pontosKey)) {
        console.log('🔄 Pontos já foram processados para este atendimento');
        return;
      }

      console.log('🎯 Adicionando pontos de fidelidade:', {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        pontos: pontosGanhos,
        nivel: nivelCliente
      });

      // Registrar pontuação no Firebase
      const pontuacaoData = {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        quantidade: pontosGanhos,
        tipo: 'credito',
        motivo: `Atendimento finalizado - ${itensServico.map(s => s.nome).join(', ')}`,
        data: new Date().toISOString(),
        atendimentoId: id,
        nivelNoMomento: nivelCliente,
        multiplicadorAplicado: fidelidadeConfig.niveis?.[nivelCliente]?.multiplicador || 1,
        bonusAplicados: bonusAplicados,
        createdAt: Timestamp.now()
      };

      await firebaseService.add('pontuacao', pontuacaoData);
      
      // Marcar como processado
      pontosProcessadosRef.current.add(pontosKey);
      
      // Atualizar estado local
      setPontosCliente(prev => {
        const novoSaldo = prev + pontosGanhos;
        console.log(`✅ Saldo de pontos atualizado: ${prev} -> ${novoSaldo}`);
        return novoSaldo;
      });

      // Registrar na auditoria
      await registrarAuditoria(
        'adicionar_pontos_fidelidade',
        cliente.id,
        `${pontosGanhos} pontos adicionados por atendimento`,
        { 
          atendimentoId: id, 
          pontos: pontosGanhos, 
          nivel: nivelCliente,
          bonus: bonusAplicados
        }
      );

      // Mostrar toast de sucesso
      toast.success(`🏆 +${pontosGanhos} pontos de fidelidade!`, {
        icon: '⭐',
        duration: 4000
      });

      console.log('✅ Pontos de fidelidade adicionados com sucesso:', pontosGanhos);
      
    } catch (error) {
      console.error('❌ Erro ao adicionar pontos de fidelidade:', error);
      toast.error('Erro ao adicionar pontos de fidelidade');
    }
  };

  const processarIndicacao = async () => {
    if (!cliente?.indicadoPor) {
      console.log('ℹ️ Cliente não foi indicado por ninguém');
      return;
    }

    try {
      const configFidelidade = await firebaseService.getAll('config_fidelidade').catch(() => []);
      const config = configFidelidade[0] || { 
        pontosIndicacao: 100,
        bonusIndicacao: 100
      };

      const pontosBonus = config.pontosIndicacao || config.bonusIndicacao || 100;

      const indicacoesExistentes = await firebaseService.query('indicacoes', [
        { field: 'clienteIndicadoId', operator: '==', value: cliente.id },
        { field: 'status', operator: '==', value: 'confirmada' }
      ]);

      const jaFoiConfirmada = indicacoesExistentes.length > 0;

      if (jaFoiConfirmada) {
        console.log('⚠️ Indicação já foi confirmada anteriormente');
        return;
      }

      const indicacoesPendentes = await firebaseService.query('indicacoes', [
        { field: 'clienteIndicadoId', operator: '==', value: cliente.id },
        { field: 'status', operator: '==', value: 'pendente' }
      ]);

      if (indicacoesPendentes.length === 0) {
        console.log('ℹ️ Nenhuma indicação pendente encontrada');
        return;
      }

      const indicacao = indicacoesPendentes[0];

      const clienteIndicador = await firebaseService.getById('clientes', indicacao.clienteId);
      if (!clienteIndicador) {
        console.error('❌ Cliente que indicou não encontrado');
        return;
      }

      await firebaseService.update('indicacoes', indicacao.id, {
        status: 'confirmada',
        pontosGanhos: pontosBonus,
        dataConfirmacao: new Date().toISOString(),
        updatedAt: Timestamp.now()
      });

      const pontuacaoData = {
        clienteId: indicacao.clienteId,
        clienteNome: indicacao.clienteNome,
        quantidade: pontosBonus,
        tipo: 'credito',
        motivo: `Bônus por indicação de ${cliente.nome}`,
        data: new Date().toISOString(),
        indicacaoId: indicacao.id,
        atendimentoId: id,
        createdAt: Timestamp.now()
      };

      await firebaseService.add('pontuacao', pontuacaoData);

      await registrarAuditoria(
        'confirmar_indicacao',
        indicacao.id,
        `Indicação confirmada: ${indicacao.clienteIndicadoNome} realizou primeiro atendimento`,
        {
          clienteIndicadorId: indicacao.clienteId,
          clienteIndicadorNome: indicacao.clienteNome,
          clienteIndicadoId: cliente.id,
          clienteIndicadoNome: cliente.nome,
          pontosBonus
        }
      );

      toast.success(`🎉 ${pontosBonus} pontos creditados para ${indicacao.clienteNome} por indicação!`);

    } catch (error) {
      console.error('❌ Erro ao processar indicação:', error);
    }
  };

  // ============================================
  // FUNÇÃO PRINCIPAL: FINALIZAR ATENDIMENTO - CORRIGIDA
  // ============================================

  const handleFinalizarAtendimento = async () => {
    if (verificarDuplicidade('finalizar_atendimento', { id })) {
      toast.error('Atendimento já está sendo finalizado. Aguarde um momento.');
      return;
    }

    if (processandoRef.current) {
      toast.error('Já existe uma operação em andamento');
      return;
    }

    if (atendimento.status === 'finalizado') {
      toast.error('Este atendimento já foi finalizado');
      return;
    }

    try {
      processandoRef.current = true;
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
      console.log('📊 Dados do atendimento:', {
        valorTotal,
        totalPago,
        pontosGanhos,
        fidelidadeAtiva: fidelidadeConfig?.ativo,
        itensServico: itensServico.length,
        itensProduto: itensProduto.length,
        cupons: cuponsAplicados.length
      });
  
      // 1. Buscar o agendamento associado
      let agendamentoId = null;
      
      if (atendimento.agendamentoId) {
        agendamentoId = atendimento.agendamentoId;
      } else {
        const agendamentos = await firebaseService.query('agendamentos', [
          { field: 'profissionalId', operator: '==', value: atendimento.profissionalId },
          { field: 'data', operator: '==', value: atendimento.data },
          { field: 'status', operator: '==', value: 'agendado' }
        ]);
  
        const servicoId = atendimento.servicoId || itensServico[0]?.id;
        const agendamentoCorrespondente = agendamentos.find(ag => {
          if (ag.servicos && Array.isArray(ag.servicos)) {
            return ag.servicos.some(s => s.id === servicoId);
          }
          return ag.servicoId === servicoId;
        });
  
        if (agendamentoCorrespondente) {
          agendamentoId = agendamentoCorrespondente.id;
        }
      }
  
      // 2. Atualizar o atendimento
      const dadosAtendimento = {
        status: 'finalizado',
        horaFim: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        valorTotal,
        descontoTotal: descontoTotalCupons,
        itensServico,
        itensProduto,
        cuponsAplicados,
        pontosGanhos: fidelidadeConfig?.ativo ? pontosGanhos : 0,
        updatedAt: Timestamp.now()
      };
  
      if (agendamentoId) {
        dadosAtendimento.agendamentoId = agendamentoId;
      }
  
      await firebaseService.update('atendimentos', id, dadosAtendimento);
  
      // 3. Registrar uso dos cupons
      for (const cupom of cuponsAplicados) {
        await registrarUsoCupom(cupom);
      }
  
      // 4. Atualizar agendamento
      if (agendamentoId) {
        const agendamentoAtual = await firebaseService.getById('agendamentos', agendamentoId);
        
        if (agendamentoAtual) {
          const dadosAgendamento = {
            status: 'finalizado',
            atendimentoRealizado: true,
            atendimentoId: id,
            updatedAt: Timestamp.now()
          };
  
          if (agendamentoAtual.servicos && Array.isArray(agendamentoAtual.servicos)) {
            const servicoRealizado = atendimento.servicoId || itensServico[0]?.id;
            dadosAgendamento.servicosRealizados = agendamentoAtual.servicos.map(s => ({
              ...s,
              realizado: s.id === servicoRealizado
            }));
          }
  
          await firebaseService.update('agendamentos', agendamentoId, dadosAgendamento);
        }
      }
  
      // 5. Registrar comissão
      const profissional = await firebaseService.getById('profissionais', atendimento.profissionalId);
      const servicoPrincipal = itensServico.find(item => item.principal) || itensServico[0];
      const percentual = profissional?.comissao || 40;
      const valorComissao = (calcularTotalServicos() * percentual) / 100;
  
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
  
      if (agendamentoId) {
        comissaoData.agendamentoId = agendamentoId;
      }
  
      await firebaseService.add('comissoes', comissaoData);
  
      // 🔥 6. ADICIONAR PONTOS DE FIDELIDADE (AGORA ANTES DE PROCESSAR INDICAÇÃO)
      if (fidelidadeConfig?.ativo && pontosGanhos > 0) {
        console.log('🎯 Chamando adicionarPontosFidelidade com:', {
          pontosGanhos,
          fidelidadeAtiva: fidelidadeConfig.ativo
        });
        await adicionarPontosFidelidade();
      } else {
        console.log('ℹ️ Pontos NÃO adicionados - verifique:', {
          fidelidadeAtiva: fidelidadeConfig?.ativo,
          pontosGanhos,
          existeConfig: !!fidelidadeConfig
        });
      }
  
      // 7. Processar indicação (após pontos)
      await processarIndicacao();
  
      // 8. Atualizar cliente
      await firebaseService.update('clientes', cliente.id, {
        ultimaVisita: new Date().toISOString().split('T')[0],
        totalGasto: (cliente.totalGasto || 0) + calcularTotalServicos(),
        updatedAt: Timestamp.now()
      });

      // 9. Registrar na auditoria
      await registrarAuditoria(
        'finalizar_atendimento',
        id,
        `Atendimento finalizado`,
        { 
          valorTotal, 
          descontoTotal: descontoTotalCupons,
          quantidadeServicos: itensServico.length, 
          quantidadeProdutos: itensProduto.length,
          quantidadeCupons: cuponsAplicados.length,
          quantidadePagamentos: pagamentos.length,
          pontosGanhos: fidelidadeConfig?.ativo ? pontosGanhos : 0,
          clienteId: cliente?.id,
          clienteNome: cliente?.nome,
          profissionalId: profissional?.id,
          profissionalNome: profissional?.nome
        }
      );
  
      setActiveStep(3);
      toast.success('Atendimento finalizado com sucesso!');
      registrarAcaoProcessada('finalizar_atendimento', { id });
      
    } catch (error) {
      console.error('❌ Erro ao finalizar atendimento:', error);
      toast.error('Erro ao finalizar atendimento');
    } finally {
      processandoRef.current = false;
      setSaving(false);
    }
  };

  // ============================================
  // FUNÇÃO PARA GERAR COMPROVANTE
  // ============================================

  const gerarTextoComprovante = (formato = 'texto') => {
    const subtotal = calcularSubtotal();
    const valorTotal = calcularValorTotal();
    const totalPago = calcularTotalPago();
    const data = new Date();
    const produtosCobrados = itensProduto.filter(p => !p.semCobranca);
    const produtosCortesia = itensProduto.filter(p => p.semCobranca);
    
    const linha = formato === 'html' ? '<hr/>' : '\n' + '═'.repeat(40) + '\n';
    const linhaDupla = formato === 'html' ? '<hr style="border-top: 2px solid #000"/>' : '\n' + '█'.repeat(40) + '\n';
    const negritoInicio = formato === 'html' ? '<strong>' : '*';
    const negritoFim = formato === 'html' ? '</strong>' : '*';
    const quebraLinha = formato === 'html' ? '<br/>' : '\n';
    
    let texto = '';
    
    // Cabeçalho com Logo (apenas para HTML)
    texto += formato === 'html' ? '<div style="font-family: monospace; padding: 20px; max-width: 400px; margin: 0 auto;">' : '';
    
    if (formato === 'html' && configuracoes?.salao?.logo) {
      texto += `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${configuracoes.salao.logo}" alt="Logo" style="max-width: 150px; max-height: 80px; object-fit: contain;">
        </div>
      `;
    }
    
    texto += `${linhaDupla}`;
    
    // Nome da empresa com estilo
    if (formato === 'html') {
      texto += `<div style="text-align: center; font-size: 18px; font-weight: bold; margin: 5px 0;">${configuracoes?.salao?.nome || 'BeautyPro'}</div>`;
      texto += `<div style="text-align: center; font-size: 12px;">ATENDIMENTO #${id.slice(-6)}</div>`;
    } else {
      texto += `${' '.repeat(8)}${negritoInicio}${configuracoes?.salao?.nome || 'BeautyPro'}${negritoFim}${quebraLinha}`;
      texto += `${' '.repeat(6)}ATENDIMENTO #${id.slice(-6)}${quebraLinha}`;
    }
    
    texto += `${linha}`;
    
    // Informações do estabelecimento
    if (configuracoes?.salao) {
      if (formato === 'html') {
        texto += `<div style="font-size: 11px;">`;
      }
      
      if (configuracoes.salao.cnpj) texto += `CNPJ: ${configuracoes.salao.cnpj}${quebraLinha}`;
      if (configuracoes.salao.ie) texto += `IE: ${configuracoes.salao.ie}${quebraLinha}`;
      
      // Endereço
      if (configuracoes.salao.endereco) {
        const end = configuracoes.salao.endereco;
        const enderecoCompleto = [
          end.logradouro,
          end.bairro,
          end.cidade,
          end.estado,
          end.cep
        ].filter(Boolean).join(', ');
        if (enderecoCompleto) texto += `${enderecoCompleto}${quebraLinha}`;
      }
      
      // Contato
      if (configuracoes.salao.contato) {
        const cont = configuracoes.salao.contato;
        if (cont.telefone) texto += `Tel: ${cont.telefone}${quebraLinha}`;
        if (cont.whatsapp) texto += `WhatsApp: ${cont.whatsapp}${quebraLinha}`;
        if (cont.email) texto += `Email: ${cont.email}${quebraLinha}`;
      }
      
      if (formato === 'html') {
        texto += `</div>`;
      }
    }
    texto += `${linha}`;
    
    // Data e hora
    texto += `Data: ${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR')}${quebraLinha}`;
    texto += `Cliente: ${cliente?.nome || 'Não informado'}${quebraLinha}`;
    texto += `Profissional: ${profissional?.nome || 'Não informado'}${quebraLinha}`;
    texto += `${linha}`;
    
    // Serviços
    texto += `${negritoInicio}SERVIÇOS REALIZADOS:${negritoFim}${quebraLinha}`;
    itensServico.forEach((item, idx) => {
      texto += `${idx + 1}. ${item.nome}${quebraLinha}`;
      texto += `   R$ ${item.preco?.toFixed(2)}${quebraLinha}`;
    });
    texto += `${linha}`;
    
    // Produtos cobrados
    if (produtosCobrados.length > 0) {
      texto += `${negritoInicio}PRODUTOS:${negritoFim}${quebraLinha}`;
      produtosCobrados.forEach((item, idx) => {
        const total = (item.preco || 0) * (item.quantidadeVenda || 1);
        texto += `${idx + 1}. ${item.nome}${quebraLinha}`;
        texto += `   ${item.quantidadeVenda} ${getUnidadeSimbolo(item.unidadeVenda)} x R$ ${item.preco?.toFixed(2)} = R$ ${total.toFixed(2)}${quebraLinha}`;
      });
      texto += `${linha}`;
    }
    
    // Produtos cortesia
    if (produtosCortesia.length > 0) {
      texto += `${negritoInicio}CORTESIA:${negritoFim}${quebraLinha}`;
      produtosCortesia.forEach((item, idx) => {
        texto += `${idx + 1}. ${item.nome} - ${item.quantidadeVenda} ${getUnidadeSimbolo(item.unidadeVenda)}${quebraLinha}`;
        texto += `   ${negritoInicio}GRÁTIS${negritoFim}${quebraLinha}`;
      });
      texto += `${linha}`;
    }
    
    // Cupons aplicados
    if (cuponsAplicados.length > 0) {
      texto += `${negritoInicio}CUPONS APLICADOS:${negritoFim}${quebraLinha}`;
      cuponsAplicados.forEach((cupom, idx) => {
        texto += `${idx + 1}. ${cupom.codigo} - ${cupom.descricao || ''}${quebraLinha}`;
        texto += `   Desconto: R$ ${cupom.valorDescontoCalculado?.toFixed(2)}${quebraLinha}`;
      });
      texto += `${linha}`;
    }
    
    // Resumo financeiro
    texto += `${negritoInicio}RESUMO:${negritoFim}${quebraLinha}`;
    texto += `Subtotal: R$ ${subtotal.toFixed(2)}${quebraLinha}`;
    if (descontoTotalCupons > 0) {
      texto += `Descontos: -R$ ${descontoTotalCupons.toFixed(2)}${quebraLinha}`;
    }
    texto += `${negritoInicio}Total: R$ ${valorTotal.toFixed(2)}${negritoFim}${quebraLinha}`;
    texto += `Pago: R$ ${totalPago.toFixed(2)}${quebraLinha}`;
    
    if (Math.abs(valorTotal - totalPago) > 0.01) {
      texto += `Restante: R$ ${(valorTotal - totalPago).toFixed(2)}${quebraLinha}`;
    }
    texto += `${linha}`;
    
    // Pagamentos
    texto += `${negritoInicio}PAGAMENTOS:${negritoFim}${quebraLinha}`;
    pagamentos.forEach((p, idx) => {
      const forma = FORMAS_PAGAMENTO.find(f => f.value === p.formaPagamento)?.label || p.formaPagamento;
      texto += `${idx + 1}. ${forma}`;
      if (p.parcelas > 1) texto += ` (${p.parcelas}x)`;
      texto += `: R$ ${p.valor?.toFixed(2)}${quebraLinha}`;
    });
    texto += `${linha}`;
    
    // 🔥 FIDELIDADE - AGORA MOSTRANDO OS PONTOS GANHOS
    if (fidelidadeConfig?.ativo && pontosGanhos > 0) {
      texto += `${negritoInicio}FIDELIDADE:${negritoFim}${quebraLinha}`;
      texto += `Pontos ganhos neste atendimento: +${pontosGanhos}${quebraLinha}`;
      texto += `Saldo anterior: ${pontosCliente} pontos${quebraLinha}`;
      texto += `Novo saldo: ${pontosCliente + pontosGanhos} pontos${quebraLinha}`;
      texto += `Nível atual: ${nivelCliente.toUpperCase()}${quebraLinha}`;
      if (bonusAplicados.length > 0) {
        texto += `Bônus aplicados: ${bonusAplicados.join(', ')}${quebraLinha}`;
      }
      texto += `${linha}`;
    }
    
    // Rodapé
    if (formato === 'html') {
      texto += `<div style="text-align: center; margin-top: 20px;">`;
    }
    
    texto += `${negritoInicio}AGRADECEMOS A PREFERÊNCIA!${negritoFim}${quebraLinha}`;
    texto += `Volte sempre!${quebraLinha}`;
    
    // Redes sociais
    if (configuracoes?.salao?.contato) {
      const cont = configuracoes.salao.contato;
      const redes = [];
      if (cont.instagram) redes.push(`Instagram: @${cont.instagram.replace('@', '')}`);
      if (cont.facebook) redes.push(`Facebook: ${cont.facebook}`);
      if (cont.site) redes.push(`Site: ${cont.site}`);
      
      if (redes.length > 0) {
        texto += `${linha}`;
        redes.forEach(rede => {
          texto += `${rede}${quebraLinha}`;
        });
      }
    }
    
    if (formato === 'html') {
      texto += `</div>`;
    }
    
    texto += `${linhaDupla}`;
    
    if (formato === 'html') {
      texto += '</div>';
    }
    
    return texto;
  };

  const handleEnviarComprovante = async (metodo) => {
    if (verificarDuplicidade('enviar_comprovante', { metodo }, 10000)) {
      toast.error('Comprovante já foi enviado recentemente. Aguarde um momento.');
      return;
    }
  
    try {
      if (metodo === 'whatsapp') {
        const numero = cliente?.telefone?.replace(/\D/g, '') || '';
        if (!numero) {
          toast.error('Cliente não possui telefone cadastrado');
          return;
        }
        
        const mensagem = gerarTextoComprovante('texto');
        window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`, '_blank');
        
        await registrarAuditoria(
          'enviar_comprovante_whatsapp',
          id,
          `Comprovante enviado por WhatsApp`,
          { clienteId: cliente?.id, clienteNome: cliente?.nome }
        );
        
        toast.success('WhatsApp aberto para envio!');
        registrarAcaoProcessada('enviar_comprovante', { metodo });
        
      } else if (metodo === 'email') {
        toast.success('Comprovante enviado por email!');
        registrarAcaoProcessada('enviar_comprovante', { metodo });
        
      } else if (metodo === 'print') {
        const janelaImpressao = window.open('', '_blank');
        const corPrimaria = configuracoes?.tema?.corPrimaria || '#9c27b0';
        const corSecundaria = configuracoes?.tema?.corSecundaria || '#ff4081';
        const fonte = configuracoes?.tema?.fonte || 'Courier New';
        
        janelaImpressao.document.write(`
          <html>
            <head>
              <title>Comprovante de Atendimento #${id.slice(-6)}</title>
              <style>
                body { 
                  font-family: '${fonte}', monospace; 
                  padding: 20px; 
                  background: #fff;
                  color: #333;
                  display: flex;
                  justify-content: center;
                }
                .container {
                  max-width: 400px;
                  width: 100%;
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .logo {
                  max-width: 150px;
                  max-height: 80px;
                  object-fit: contain;
                  margin-bottom: 10px;
                }
                .empresa-nome {
                  font-size: 18px;
                  font-weight: bold;
                  color: ${corPrimaria};
                  margin: 5px 0;
                }
                .atendimento-id {
                  font-size: 12px;
                  color: #666;
                }
                .linha {
                  border-top: 1px dashed #ccc;
                  margin: 10px 0;
                }
                .linha-dupla {
                  border-top: 2px solid ${corPrimaria};
                  margin: 15px 0;
                }
                .destaque {
                  font-weight: bold;
                  color: ${corSecundaria};
                }
                .total {
                  font-size: 16px;
                  font-weight: bold;
                  color: ${corPrimaria};
                }
                .rodape {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #666;
                }
                .redes {
                  font-size: 11px;
                  color: #888;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                td {
                  padding: 3px 0;
                }
                .valor {
                  text-align: right;
                }
                @media print {
                  body { 
                    padding: 0; 
                    background: white;
                  }
                  .container {
                    box-shadow: none;
                    padding: 10px;
                  }
                  button { 
                    display: none; 
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                ${gerarTextoComprovante('html')}
                <div style="text-align: center; margin-top: 20px;">
                  <button onclick="window.print()" style="
                    background: ${corPrimaria};
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                    font-family: ${fonte};
                  ">🖨️ Imprimir</button>
                  <button onclick="window.close()" style="
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: ${fonte};
                  ">✖️ Fechar</button>
                </div>
              </div>
            </body>
          </html>
        `);
        janelaImpressao.document.close();
        
        registrarAcaoProcessada('enviar_comprovante', { metodo });
      }
    } catch (error) {
      toast.error('Erro ao enviar comprovante');
    }
  };

  // ============================================
  // FUNÇÕES DE NAVEGAÇÃO
  // ============================================

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

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

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

  const subtotal = calcularSubtotal();
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

              {/* Alertas de cupons próximos de expirar */}
              {cuponsProximosExpiracao.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  {cuponsProximosExpiracao.map((cupom, idx) => (
                    <Alert 
                      key={idx} 
                      severity="warning" 
                      icon={<TimerIcon />}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2">
                        <strong>{cupom.codigo}</strong> expira em {cupom.diasRestantes} dias
                      </Typography>
                    </Alert>
                  ))}
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
                    {cliente?.indicadoPorNome && (
                      <Chip
                        icon={<PersonAddIcon />}
                        label={`Indicado por: ${cliente.indicadoPorNome}`}
                        size="small"
                        sx={{ mt: 0.5, bgcolor: '#fff3e0', color: '#ff9800', height: 20 }}
                      />
                    )}
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

              {/* 🔥 Card de Fidelidade - AGORA MOSTRANDO PONTOS GANHOS */}
              {fidelidadeConfig?.ativo && (
                <Box sx={{ mb: 3, p: 2, bgcolor: '#faf5ff', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrophyIcon sx={{ color: '#9c27b0' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Fidelidade
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Nível atual:
                    </Typography>
                    <Chip
                      label={nivelCliente.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: fidelidadeConfig.niveis?.[nivelCliente]?.cor || '#9c27b0',
                        color: nivelCliente === 'ouro' ? '#000' : '#fff',
                        fontWeight: 600
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Pontos atuais:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#ff9800' }}>
                      {pontosCliente}
                    </Typography>
                  </Box>

                  {/* 🔥 MOSTRAR PONTOS A GANHAR COM DESTAQUE */}
                  {pontosGanhos > 0 && atendimento.status !== 'finalizado' && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      p: 1,
                      bgcolor: '#e8f5e8',
                      borderRadius: 1,
                      border: '1px solid #4caf50',
                      mb: 1
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ⭐ Pontos a ganhar:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        +{pontosGanhos}
                      </Typography>
                    </Box>
                  )}

                  {/* 🔥 MOSTRAR PONTOS GANHOS SE JÁ FINALIZADO */}
                  {pontosGanhos > 0 && atendimento.status === 'finalizado' && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      p: 1,
                      bgcolor: '#e8f5e8',
                      borderRadius: 1,
                      border: '1px solid #4caf50',
                      mb: 1
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ⭐ Pontos ganhos:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        +{pontosGanhos}
                      </Typography>
                    </Box>
                  )}

                  {bonusAplicados.map((bonus, idx) => (
                    <Chip
                      key={idx}
                      label={bonus}
                      size="small"
                      sx={{ mt: 1, mr: 1, bgcolor: '#fff3e0' }}
                    />
                  ))}
                </Box>
              )}

              {/* 🔥 BOTÃO DE ANAMNESE */}
              {respostasAnamnese && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => setOpenAnamneseDialog(true)}
                    sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                  >
                    Ver Anamnese do Cliente
                  </Button>
                </Box>
              )}

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

              {/* Lista de Cupons Aplicados */}
              {cuponsAplicados.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                    Cupons Aplicados
                  </Typography>
                  {cuponsAplicados.map((cupom, index) => (
                    <CupomAplicado
                      key={index}
                      cupom={cupom}
                      onRemover={() => handleRemoverCupom(index)}
                    />
                  ))}
                </>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Resumo de Valores */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">R$ {subtotal.toFixed(2)}</Typography>
                </Box>
                
                {descontoTotalCupons > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, color: '#4caf50' }}>
                    <Typography variant="body2">Descontos:</Typography>
                    <Typography variant="body2">- R$ {descontoTotalCupons.toFixed(2)}</Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    R$ {valorTotal.toFixed(2)}
                  </Typography>
                </Box>
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
                        disabled={saving || processandoRef.current}
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
                      Adicionar Itens e Cupons
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      Adicione serviços adicionais, produtos utilizados e cupons de desconto.
                    </Alert>

                    {/* Seção de Cupons */}
                    <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#faf5ff' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CouponIcon sx={{ color: '#9c27b0' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Cupons de Desconto
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => setMostrarValidadorCupom(!mostrarValidadorCupom)}
                        >
                          {mostrarValidadorCupom ? 'Fechar' : 'Adicionar Cupom'}
                        </Button>
                      </Box>

                      <Collapse in={mostrarValidadorCupom}>
                        <ValidadorCupom
                          valorTotal={subtotal}
                          itensServico={itensServico}
                          cliente={cliente}
                          onCupomValido={handleAplicarCupom}
                        />
                      </Collapse>

                      {cuponsAplicados.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Cupons aplicados:
                          </Typography>
                          {cuponsAplicados.map((cupom, index) => (
                            <CupomAplicado
                              key={index}
                              cupom={cupom}
                              onRemover={() => handleRemoverCupom(index)}
                            />
                          ))}
                        </Box>
                      )}
                    </Paper>

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
                        <Box sx={{ textAlign: 'right' }}>
                          {descontoTotalCupons > 0 && (
                            <Typography variant="body2" color="textSecondary" sx={{ textDecoration: 'line-through' }}>
                              R$ {subtotal.toFixed(2)}
                            </Typography>
                          )}
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                            R$ {valorTotal.toFixed(2)}
                          </Typography>
                        </Box>
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
                        disabled={itensServico.length === 0 || saving || processandoRef.current}
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
                          disabled={saldoRestante <= 0 || saving || processandoRef.current}
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
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleOpenPagamentoDialog(pagamento)}
                                      disabled={saving || processandoRef.current}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleRemoverPagamento(pagamento.id)}
                                      disabled={saving || processandoRef.current}
                                    >
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
                      <Button onClick={() => setActiveStep(1)} disabled={saving || processandoRef.current}>
                        Voltar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleFinalizarAtendimento}
                        startIcon={<CheckIcon />}
                        disabled={saving || processandoRef.current || Math.abs(calcularSaldoRestante()) > 0.01 || atendimento.status === 'finalizado'}
                        sx={{
                          background: Math.abs(calcularSaldoRestante()) <= 0.01 && atendimento.status !== 'finalizado'
                            ? 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)' 
                            : 'grey',
                          '&:hover': {
                            background: Math.abs(calcularSaldoRestante()) <= 0.01 && atendimento.status !== 'finalizado'
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
                      {cuponsAplicados.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <CouponIcon sx={{ verticalAlign: 'middle', mr: 0.5, color: '#9c27b0' }} />
                          <strong>{cuponsAplicados.length} cupom(ns)</strong> aplicados com sucesso!
                        </Box>
                      )}
                      {/* 🔥 MOSTRAR PONTOS GANHOS NO ALERTA DE SUCESSO */}
                      {fidelidadeConfig?.ativo && pontosGanhos > 0 && (
                        <Box sx={{ 
                          mt: 2, 
                          p: 1.5, 
                          bgcolor: '#fff3cd', 
                          border: '1px solid #ffeeba', 
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <StarIcon sx={{ color: '#ff9800', fontSize: 28 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#856404' }}>
                              🎉 {pontosGanhos} PONTOS DE FIDELIDADE GANHOS!
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#856404' }}>
                              Cliente agora tem {pontosCliente + pontosGanhos} pontos no total
                            </Typography>
                          </Box>
                        </Box>
                      )}
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

                        {cuponsAplicados.length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                              Cupons Aplicados:
                            </Typography>
                            {cuponsAplicados.map((cupom, idx) => (
                              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">
                                  {cupom.codigo} - {cupom.descricao || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                                  -R$ {cupom.valorDescontoCalculado?.toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                          </Grid>
                        )}

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Subtotal:</Typography>
                            <Typography variant="body2">R$ {subtotal.toFixed(2)}</Typography>
                          </Box>
                          {descontoTotalCupons > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">Descontos:</Typography>
                              <Typography variant="body2" sx={{ color: '#4caf50' }}>
                                -R$ {descontoTotalCupons.toFixed(2)}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
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

                        {/* 🔥 Informações de fidelidade no comprovante - AGORA MOSTRANDO CORRETAMENTE */}
                        {fidelidadeConfig?.ativo && pontosGanhos > 0 && (
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: '#faf5ff', 
                              borderRadius: 1,
                              border: '1px solid #9c27b0'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <StarIcon sx={{ color: '#ff9800' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  FIDELIDADE
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">Pontos ganhos neste atendimento:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                  +{pontosGanhos}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">Saldo anterior:</Typography>
                                <Typography variant="body2">{pontosCliente} pontos</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Novo saldo:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                                  {pontosCliente + pontosGanhos} pontos
                                </Typography>
                              </Box>
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={`Nível: ${nivelCliente.toUpperCase()}`}
                                  size="small"
                                  sx={{
                                    bgcolor: fidelidadeConfig.niveis?.[nivelCliente]?.cor || '#9c27b0',
                                    color: nivelCliente === 'ouro' ? '#000' : '#fff',
                                  }}
                                />
                              </Box>
                            </Box>
                          </Grid>
                        )}
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
                          Imprimir Cupom
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
          <Button onClick={handleClosePagamentoDialog} disabled={saving || processandoRef.current}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvarPagamento}
            variant="contained"
            disabled={saving || processandoRef.current}
            sx={{ bgcolor: '#9c27b0' }}
          >
            {pagamentoEditando ? 'Atualizar' : 'Registrar Pagamento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔥 DIALOG DE ANAMNESE */}
      <Dialog open={openAnamneseDialog} onClose={() => setOpenAnamneseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon />
            <Typography variant="h6">Anamnese - {respostasAnamnese?.formularioTitulo}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Informações do cliente */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Cliente
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {cliente?.nome}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Serviço
                  </Typography>
                  <Typography variant="body1">
                    {atendimento?.servicoNome}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Profissional
                  </Typography>
                  <Typography variant="body1">
                    {profissional?.nome}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Respondido em
                  </Typography>
                  <Typography variant="body1">
                    {respostasAnamnese?.respondidoEm ? new Date(respostasAnamnese.respondidoEm).toLocaleString('pt-BR') : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Respostas */}
            <Typography variant="h6" gutterBottom>
              Respostas:
            </Typography>
            
            {respostasAnamnese?.respostas?.map((resposta, index) => (
              <Accordion key={index} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {resposta.pergunta}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {resposta.tipo === 'checkbox' && Array.isArray(resposta.resposta) ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {resposta.resposta.map((item, i) => (
                        <Chip key={i} label={item} size="small" />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body1">
                      {resposta.resposta}
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}

            {/* Observações do profissional */}
            <TextField
              fullWidth
              label="Observações do profissional"
              multiline
              rows={3}
              value={respostasAnamnese?.observacoesProfissional || ''}
              placeholder="Adicione observações sobre este formulário..."
              sx={{ mt: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAnamneseDialog(false)}>Fechar</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenAnamneseDialog(false);
              // Opcional: navegar para página de edição
            }}
          >
            Editar Observações
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModernAtendimento;
