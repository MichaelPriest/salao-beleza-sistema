// src/pages/ModernRelatorios.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Avatar,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Badge,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  MonetizationOn as MoneyIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Category as CategoryIcon,
  Percent as PercentIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  CreditCard as CreditCardIcon,
  QrCode as QrCodeIcon,
  LocalAtm as LocalAtmIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  TrendingUp,
  ShowChart as ShowChartIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
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
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#9c27b0', '#ff4081', '#7b1fa2', '#ba68c8', '#f8bbd0', '#f3e5f5', '#ce93d8', '#e1bee7', '#4caf50', '#ff9800'];

// Constantes para status e tipos
const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente', icon: '⏳' },
  pago: { color: '#4caf50', label: 'Pago', icon: '✅' },
  atrasado: { color: '#f44336', label: 'Atrasado', icon: '⚠️' },
  cancelado: { color: '#9e9e9e', label: 'Cancelado', icon: '❌' },
  finalizado: { color: '#4caf50', label: 'Finalizado', icon: '✨' },
  confirmado: { color: '#2196f3', label: 'Confirmado', icon: '✓' },
  em_andamento: { color: '#ff9800', label: 'Em Andamento', icon: '🔄' },
};

const formasPagamentoLabels = {
  dinheiro: { label: 'Dinheiro', icon: '💵', color: '#4caf50' },
  cartao_credito: { label: 'Cartão Crédito', icon: '💳', color: '#2196f3' },
  cartao_debito: { label: 'Cartão Débito', icon: '💳', color: '#3f51b5' },
  pix: { label: 'PIX', icon: '⚡', color: '#9c27b0' },
  boleto: { label: 'Boleto', icon: '📄', color: '#ff9800' },
  transferencia: { label: 'Transferência', icon: '🔄', color: '#00bcd4' },
  cheque: { label: 'Cheque', icon: '📝', color: '#795548' },
  credito_loja: { label: 'Crédito Loja', icon: '🏪', color: '#e91e63' },
};

// Funções de formatação
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
};

const formatarData = (data) => {
  if (!data) return '-';
  try {
    if (data.seconds) {
      return new Date(data.seconds * 1000).toLocaleDateString('pt-BR');
    }
    return new Date(data).toLocaleDateString('pt-BR');
  } catch {
    return data;
  }
};

const formatarDataHora = (data) => {
  if (!data) return '-';
  try {
    if (data.seconds) {
      return new Date(data.seconds * 1000).toLocaleString('pt-BR');
    }
    return new Date(data).toLocaleString('pt-BR');
  } catch {
    return data;
  }
};

const formatarNumero = (valor) => {
  return new Intl.NumberFormat('pt-BR').format(valor || 0);
};

const formatarPercentual = (valor) => {
  return `${(valor || 0).toFixed(1)}%`;
};

// Componente de impressão
const RelatorioPrint = React.forwardRef(({ dados, tipoRelatorio, periodo, dataInicio, dataFim, logo, resumos }, ref) => {
  // Funções de formatação para impressão
  const formatarMoedaPrint = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarDataPrint = (data) => {
    if (!data) return '-';
    try {
      if (data.seconds) {
        return new Date(data.seconds * 1000).toLocaleDateString('pt-BR');
      }
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  const formatarDataHoraPrint = (data) => {
    if (!data) return '-';
    try {
      if (data.seconds) {
        return new Date(data.seconds * 1000).toLocaleString('pt-BR');
      }
      return new Date(data).toLocaleString('pt-BR');
    } catch {
      return data;
    }
  };

  const formatarNumeroPrint = (valor) => {
    return new Intl.NumberFormat('pt-BR').format(valor || 0);
  };

  const formatarPercentualPrint = (valor) => {
    return `${(valor || 0).toFixed(1)}%`;
  };

  const getTituloRelatorio = () => {
    const titulos = {
      financeiro: 'Relatório Financeiro',
      atendimentos: 'Relatório de Atendimentos',
      clientes: 'Relatório de Clientes',
      profissionais: 'Relatório de Profissionais',
      comissoes: 'Relatório de Comissões',
      servicos: 'Relatório de Serviços',
      produtos: 'Relatório de Produtos',
      fornecedores: 'Relatório de Fornecedores',
      agenda: 'Relatório de Agenda',
      cancelamentos: 'Relatório de Cancelamentos',
      performance: 'Relatório de Performance',
      fidelidade: 'Relatório de Fidelidade',
    };
    return titulos[tipoRelatorio] || 'Relatório';
  };

  const getIconeRelatorio = () => {
    const icones = {
      financeiro: '💰',
      atendimentos: '💇',
      clientes: '👥',
      profissionais: '👩‍💼',
      comissoes: '💸',
      servicos: '✂️',
      produtos: '📦',
      fornecedores: '🏢',
      agenda: '📅',
      cancelamentos: '❌',
      performance: '📈',
      fidelidade: '⭐',
    };
    return icones[tipoRelatorio] || '📊';
  };

  return (
    <Box ref={ref} sx={{ p: 4, backgroundColor: 'white', minHeight: '100vh' }}>
      {/* Cabeçalho com logo */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4, 
        borderBottom: '3px solid #9c27b0', 
        pb: 2,
        backgroundColor: '#fafafa',
        p: 2,
        borderRadius: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {logo ? (
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                width: 60, 
                height: 60, 
                objectFit: 'contain',
                marginRight: 16,
                borderRadius: 8
              }} 
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <Avatar
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: '#9c27b0',
              fontSize: '28px',
              fontWeight: 'bold',
              mr: 2,
              display: logo ? 'none' : 'flex'
            }}
          >
            {getIconeRelatorio()}
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#9c27b0', letterSpacing: 1 }}>
              Beauty Pro
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ fontWeight: 500 }}>
              {getTituloRelatorio()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
            Período: {formatarDataPrint(dataInicio)} - {formatarDataPrint(dataFim)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>
            Gerado em: {new Date().toLocaleString('pt-BR')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            Usuário: {JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema'}
          </Typography>
        </Box>
      </Box>

      {/* Resumo em Cards */}
      {resumos && resumos.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            {resumos.map((resumo, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary">{resumo.label}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: resumo.color || '#9c27b0' }}>
                    {resumo.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* LISTA DETALHADA DE ATENDIMENTOS */}
      {tipoRelatorio === 'atendimentos' && dados.atendimentosDetalhados && dados.atendimentosDetalhados.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 4 }}>
            Lista de Atendimentos Realizados
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3, mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Data/Hora</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Profissional</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Serviços</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.atendimentosDetalhados.map((atendimento, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatarDataHoraPrint(atendimento.data)}</TableCell>
                    <TableCell>{atendimento.clienteNome || 'Cliente não identificado'}</TableCell>
                    <TableCell>{atendimento.profissionalNome || 'Profissional não identificado'}</TableCell>
                    <TableCell>
                      {atendimento.servicosRealizados?.map(s => s.nome).join(', ') || '-'}
                    </TableCell>
                    <TableCell align="right">{formatarMoedaPrint(atendimento.valorTotal)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={atendimento.status === 'finalizado' ? 'Finalizado' : atendimento.status}
                        size="small"
                        sx={{ bgcolor: '#4caf50', color: 'white' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* LISTA DETALHADA DE CLIENTES */}
      {tipoRelatorio === 'clientes' && dados.clientesDetalhados && dados.clientesDetalhados.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 4 }}>
            Lista de Clientes
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3, mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Nome</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Telefone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Data Cadastro</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Total Gasto</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Atendimentos</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Nível</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.clientesDetalhados.map((cliente, index) => (
                  <TableRow key={index}>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.telefone || '-'}</TableCell>
                    <TableCell>{cliente.email || '-'}</TableCell>
                    <TableCell>{formatarDataPrint(cliente.dataCadastro)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(cliente.totalGasto || 0)}</TableCell>
                    <TableCell align="right">{cliente.totalAtendimentos || 0}</TableCell>
                    <TableCell>
                      <Chip 
                        label={cliente.nivelFidelidade || 'Bronze'}
                        size="small"
                        sx={{ 
                          bgcolor: cliente.nivelFidelidade === 'ouro' ? '#ffd700' : 
                                   cliente.nivelFidelidade === 'prata' ? '#c0c0c0' : '#cd7f32',
                          color: cliente.nivelFidelidade === 'ouro' ? '#000' : '#fff'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* LISTA DETALHADA DE COMISSÕES */}
      {tipoRelatorio === 'comissoes' && dados.comissoesDetalhadas && dados.comissoesDetalhadas.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 4 }}>
            Lista de Comissões
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3, mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Data</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Profissional</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Serviço</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor Serviço</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Comissão</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.comissoesDetalhadas.map((comissao, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatarDataPrint(comissao.data)}</TableCell>
                    <TableCell>{comissao.profissionalNome}</TableCell>
                    <TableCell>{comissao.servicoNome}</TableCell>
                    <TableCell>{comissao.clienteNome || '-'}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(comissao.valorServico)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(comissao.valor)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={comissao.status === 'pago' ? 'Pago' : 'Pendente'}
                        size="small"
                        sx={{ bgcolor: comissao.status === 'pago' ? '#4caf50' : '#ff9800', color: 'white' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* LISTA DETALHADA DE AGENDA */}
      {tipoRelatorio === 'agenda' && dados.agendamentosDetalhados && dados.agendamentosDetalhados.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 4 }}>
            Lista de Agendamentos
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3, mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Data/Hora</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Profissional</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Serviço</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.agendamentosDetalhados.map((agendamento, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatarDataHoraPrint(agendamento.data)}</TableCell>
                    <TableCell>{agendamento.clienteNome}</TableCell>
                    <TableCell>{agendamento.profissionalNome}</TableCell>
                    <TableCell>{agendamento.servicoNome || '-'}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(agendamento.valor)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={statusColors[agendamento.status]?.label || agendamento.status}
                        size="small"
                        sx={{ 
                          bgcolor: statusColors[agendamento.status]?.color || '#9e9e9e', 
                          color: 'white' 
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Conteúdo do relatório por tipo - Financeiro */}
      {tipoRelatorio === 'financeiro' && dados.financeiro && (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
              Resumo Financeiro
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                  <Typography variant="subtitle2" color="textSecondary">Total Receitas</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {formatarMoedaPrint(dados.financeiro.totalReceitas)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                  <Typography variant="subtitle2" color="textSecondary">Total Despesas</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {formatarMoedaPrint(dados.financeiro.totalDespesas)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="subtitle2" color="textSecondary">Lucro Líquido</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: dados.financeiro.lucroLiquido >= 0 ? '#2196f3' : '#f44336' }}>
                    {formatarMoedaPrint(dados.financeiro.lucroLiquido)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                  <Typography variant="subtitle2" color="textSecondary">Margem</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {formatarPercentualPrint(dados.financeiro.margem)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Evolução Diária
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, boxShadow: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Data</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Receitas</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Despesas</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Lucro</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Acumulado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.graficoLinha?.map((row, index) => (
                  <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{row.dia}</TableCell>
                    <TableCell align="right" sx={{ color: '#4caf50' }}>{formatarMoedaPrint(row.receitas)}</TableCell>
                    <TableCell align="right" sx={{ color: '#f44336' }}>{formatarMoedaPrint(row.despesas)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: row.lucro >= 0 ? '#2196f3' : '#f44336' }}>
                      {formatarMoedaPrint(row.lucro)}
                    </TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.acumulado)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Resumo por Forma de Pagamento
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#ff4081' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Forma de Pagamento</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.graficoPizza?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: COLORS[index % COLORS.length],
                          mr: 1 
                        }} />
                        {row.name}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.value)}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.quantidade)}</TableCell>
                    <TableCell align="right">
                      {dados.financeiro?.totalReceitas > 0 
                        ? ((row.value / dados.financeiro.totalReceitas) * 100).toFixed(1)
                        : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Atendimentos - Resumo */}
      {tipoRelatorio === 'atendimentos' && dados.atendimentos && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumeroPrint(dados.atendimentos.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Média por Dia</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {(dados.atendimentos.mediaDia || 0).toFixed(1)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Faturamento</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoedaPrint(dados.atendimentos.faturamento || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Atendimentos por Serviço
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Serviço</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Faturamento</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Ticket Médio</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.value)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.faturamento)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.ticketMedio)}</TableCell>
                    <TableCell align="right">
                      {dados.atendimentos.total > 0 ? ((row.value / dados.atendimentos.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 4 }}>
            Horários Mais Procurados
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#ff4081' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Horário</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.horarios?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.horario}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.quantidade)}</TableCell>
                    <TableCell align="right">
                      {dados.atendimentos.total > 0 ? ((row.quantidade / dados.atendimentos.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Clientes - Resumo */}
      {tipoRelatorio === 'clientes' && dados.clientes && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Total de Clientes</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {formatarNumeroPrint(dados.clientes.totalClientes || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Novos Clientes</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {formatarNumeroPrint(dados.clientes.novosClientes || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Atendimentos</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff4081' }}>
                  {formatarNumeroPrint(dados.clientes.totalAtendimentos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Ticket Médio</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {formatarMoedaPrint(dados.clientes.ticketMedio || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Top 10 Clientes
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Atendimentos</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Total Gasto</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Ticket Médio</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Última Visita</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.topClientes?.map((cliente, index) => (
                  <TableRow key={index}>
                    <TableCell>{cliente.cliente}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={cliente.atendimentos}
                        size="small"
                        sx={{ bgcolor: '#f3e5f5', color: '#9c27b0', fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">{formatarMoedaPrint(cliente.totalGasto)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(cliente.ticketMedio)}</TableCell>
                    <TableCell align="right">{formatarDataPrint(cliente.ultimaVisita)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 4 }}>
            Distribuição por Nível de Fidelidade
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#ff4081' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Nível</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.niveisFidelidade?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip
                        label={row.nivel}
                        size="small"
                        sx={{ bgcolor: row.cor, color: 'white' }}
                      />
                    </TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.quantidade)}</TableCell>
                    <TableCell align="right">
                      {dados.clientes.totalClientes > 0 
                        ? ((row.quantidade / dados.clientes.totalClientes) * 100).toFixed(1)
                        : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Profissionais */}
      {tipoRelatorio === 'profissionais' && dados.profissionais && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumeroPrint(dados.profissionais.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Média por Profissional</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {(dados.profissionais.mediaPorProfissional || 0).toFixed(1)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Comissões</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoedaPrint(dados.profissionais.totalComissoes || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Desempenho por Profissional
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Profissional</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Atendimentos</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Comissões</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Ticket Médio</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Avaliação</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.atendimentos)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.comissoes)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.ticketMedio)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <StarIcon sx={{ fontSize: 16, color: '#ff9800', mr: 0.5 }} />
                        <Typography>{row.avaliacao?.toFixed(1) || '4.5'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {dados.profissionais.total > 0 ? ((row.atendimentos / dados.profissionais.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Comissões - Resumo */}
      {tipoRelatorio === 'comissoes' && dados.comissoes && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Comissões</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarMoedaPrint(dados.comissoes.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Comissões Pagas</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoedaPrint(dados.comissoes.pagas || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Pendentes</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff9800' }}>
                  {formatarMoedaPrint(dados.comissoes.pendentes || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Comissões por Profissional
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Profissional</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor Total</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Pagas</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Pendentes</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>% do Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(dados.comissoes.porProfissional || {}).map(([profissional, valores], index) => (
                  <TableRow key={index}>
                    <TableCell>{profissional}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(valores.total)}</TableCell>
                    <TableCell align="right" sx={{ color: '#4caf50' }}>{formatarMoedaPrint(valores.pagas)}</TableCell>
                    <TableCell align="right" sx={{ color: '#ff9800' }}>{formatarMoedaPrint(valores.pendentes)}</TableCell>
                    <TableCell align="right">
                      {dados.comissoes.total > 0 ? ((valores.total / dados.comissoes.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 4 }}>
            Evolução Mensal das Comissões
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#ff4081' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Mês/Ano</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Total</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Variação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.evolucaoComissoes?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.mes}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.total)}</TableCell>
                    <TableCell align="right" sx={{ color: row.variacao >= 0 ? '#4caf50' : '#f44336' }}>
                      {row.variacao >= 0 ? '↑' : '↓'} {Math.abs(row.variacao).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Serviços */}
      {tipoRelatorio === 'servicos' && dados.servicos && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Serviços</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumeroPrint(dados.servicos.totalServicos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {formatarNumeroPrint(dados.servicos.totalAtendimentos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Ticket Médio</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoedaPrint(dados.servicos.ticketMedio || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Serviços Mais Realizados
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Serviço</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Faturamento</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Ticket Médio</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.value)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.faturamento)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.ticketMedio)}</TableCell>
                    <TableCell align="right">
                      {dados.servicos.totalAtendimentos > 0 
                        ? ((row.value / dados.servicos.totalAtendimentos) * 100).toFixed(1)
                        : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 4 }}>
            Serviços por Categoria
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#ff4081' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Categoria</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Faturamento</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.categoriasServicos?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.categoria}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.quantidade)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.faturamento)}</TableCell>
                    <TableCell align="right">{formatarPercentualPrint(row.percentual)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Produtos */}
      {tipoRelatorio === 'produtos' && dados.produtos && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Total de Produtos</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {formatarNumeroPrint(dados.produtos.totalProdutos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Estoque Total</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff4081' }}>
                  {formatarNumeroPrint(dados.produtos.estoqueTotal || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Valor em Estoque</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {formatarMoedaPrint(dados.produtos.valorEstoque || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Produtos em Falta</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {formatarNumeroPrint(dados.produtos.produtosEmFalta || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Produtos com Estoque Baixo
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Produto</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Estoque Atual</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Estoque Mínimo</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor Unitário</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.produtos.estoqueBaixo?.map((produto, index) => (
                  <TableRow key={index}>
                    <TableCell>{produto.nome}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(produto.quantidade)}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(produto.estoqueMinimo)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(produto.precoVenda)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label="Estoque Baixo"
                        size="small"
                        color="warning"
                        icon={<WarningIcon />}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {(!dados.produtos.estoqueBaixo || dados.produtos.estoqueBaixo.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum produto com estoque baixo
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 4 }}>
            Top 10 Produtos por Valor em Estoque
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#ff4081' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Produto</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor Unitário</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.produtos.topValorEstoque?.map((produto, index) => (
                  <TableRow key={index}>
                    <TableCell>{produto.nome}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(produto.quantidade)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(produto.precoVenda)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(produto.valorTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Fornecedores */}
      {tipoRelatorio === 'fornecedores' && dados.fornecedores && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Fornecedores</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumeroPrint(dados.fornecedores.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Compras</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {formatarNumeroPrint(dados.fornecedores.totalCompras || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Gasto</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoedaPrint(dados.fornecedores.totalGasto || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Fornecedores
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Fornecedor</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Total Compras</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor Total</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Rating</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.compras)}</TableCell>
                    <TableCell align="right">{formatarMoedaPrint(row.valor)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <StarIcon sx={{ fontSize: 16, color: '#ff9800', mr: 0.5 }} />
                        <Typography>{row.rating}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{ bgcolor: row.status === 'ativo' ? '#4caf50' : '#f44336', color: 'white' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Agenda - Resumo */}
      {tipoRelatorio === 'agenda' && dados.agenda && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Agendamentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumeroPrint(dados.agenda.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Confirmados</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarNumeroPrint(dados.agenda.confirmados || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Pendentes</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff9800' }}>
                  {formatarNumeroPrint(dados.agenda.pendentes || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Agendamentos por Dia
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Data</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Total</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Confirmados</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Pendentes</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Cancelados</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.data}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.total)}</TableCell>
                    <TableCell align="right" sx={{ color: '#4caf50' }}>{formatarNumeroPrint(row.confirmados)}</TableCell>
                    <TableCell align="right" sx={{ color: '#ff9800' }}>{formatarNumeroPrint(row.pendentes)}</TableCell>
                    <TableCell align="right" sx={{ color: '#f44336' }}>{formatarNumeroPrint(row.cancelados)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Cancelamentos */}
      {tipoRelatorio === 'cancelamentos' && dados.cancelamentos && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Cancelamentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#f44336' }}>
                  {formatarNumeroPrint(dados.cancelamentos.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Taxa de Cancelamento</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff9800' }}>
                  {formatarPercentualPrint(dados.cancelamentos.taxa || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Perda Estimada</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#f44336' }}>
                  {formatarMoedaPrint(dados.cancelamentos.perdaEstimada || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Motivos de Cancelamento
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Motivo</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.motivo}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.quantidade)}</TableCell>
                    <TableCell align="right">
                      {dados.cancelamentos.total > 0 ? ((row.quantidade / dados.cancelamentos.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Performance */}
      {tipoRelatorio === 'performance' && dados.performance && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Ticket Médio</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {formatarMoedaPrint(dados.performance.ticketMedio || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Faturamento/Dia</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff4081' }}>
                  {formatarMoedaPrint(dados.performance.faturamentoPorDia || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Atendimentos/Dia</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {(dados.performance.atendimentosPorDia || 0).toFixed(1)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Taxa Ocupação</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {formatarPercentualPrint(dados.performance.taxaOcupacao || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Indicadores de Performance
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Indicador</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Meta</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.indicador}</TableCell>
                    <TableCell align="right">{row.valor}</TableCell>
                    <TableCell align="right">{row.meta}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{ bgcolor: row.status === 'Atingida' ? '#4caf50' : '#ff9800', color: 'white' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Fidelidade */}
      {tipoRelatorio === 'fidelidade' && dados.fidelidade && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Pontos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumeroPrint(dados.fidelidade.totalPontos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Pontos Resgatados</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {formatarNumeroPrint(dados.fidelidade.pontosResgatados || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Pontos a Expirar</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff9800' }}>
                  {formatarNumeroPrint(dados.fidelidade.pontosAExpirar || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Top Clientes por Pontos
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Pontos</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Nível</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Próximo Nível</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.cliente}</TableCell>
                    <TableCell align="right">{formatarNumeroPrint(row.pontos)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.nivel}
                        size="small"
                        sx={{ bgcolor: row.cor, color: 'white' }}
                      />
                    </TableCell>
                    <TableCell align="right">{row.proximoNivel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Rodapé com assinaturas */}
      <Box sx={{ mt: 6, pt: 3, borderTop: '2px dashed #ccc' }}>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ borderTop: '1px solid #000', pt: 1, width: '80%', textAlign: 'center' }}>
              Responsável
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ borderTop: '1px solid #000', pt: 1, width: '80%', textAlign: 'center' }}>
              Gerente
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
          Beauty Pro Salon - Sistema de Gerenciamento v2.0
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center' }}>
          Documento gerado eletronicamente em {new Date().toLocaleString('pt-BR')}
        </Typography>
      </Box>
    </Box>
  );
});

function ModernRelatorios() {
  const [loading, setLoading] = useState(true);
  const [tipoRelatorio, setTipoRelatorio] = useState('financeiro');
  const [periodo, setPeriodo] = useState('mensal');
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dados, setDados] = useState({
    financeiro: null,
    atendimentos: null,
    clientes: null,
    profissionais: null,
    comissoes: null,
    servicos: null,
    produtos: null,
    fornecedores: null,
    agenda: null,
    cancelamentos: null,
    performance: null,
    fidelidade: null,
    graficoLinha: [],
    graficoPizza: [],
    grafico: [],
    topClientes: [],
    niveisFidelidade: [],
    categoriasServicos: [],
    horarios: [],
    evolucaoComissoes: [],
    resumos: [],
    atendimentosDetalhados: [],
    clientesDetalhados: [],
    comissoesDetalhadas: [],
    agendamentosDetalhados: [],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [detalhesItem, setDetalhesItem] = useState(null);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [logo, setLogo] = useState(null);

  const componentRef = useRef();

  useEffect(() => {
    carregarConfiguracoes();
    carregarDados();
  }, [tipoRelatorio, periodo, dataInicio, dataFim]);

  const carregarConfiguracoes = async () => {
    try {
      const configData = await firebaseService.getAll('configuracoes').catch(() => []);
      setConfiguracoes(configData);
      
      if (configData && configData.length > 0) {
        const config = configData[0];
        if (config.salao && config.salao.logo) {
          setLogo(config.salao.logo);
        } else if (config.logo) {
          setLogo(config.logo);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDetalhes = (item) => {
    setDetalhesItem(item);
    setDetalhesOpen(true);
  };

  const handleCloseDetalhes = () => {
    setDetalhesOpen(false);
    setDetalhesItem(null);
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const dataInicioObj = new Date(dataInicio);
      const dataFimObj = new Date(dataFim);
      dataFimObj.setHours(23, 59, 59, 999);

      // Buscar todos os dados necessários
      const [
        pagamentos,
        agendamentos,
        clientes,
        profissionais,
        comissoes,
        servicos,
        produtos,
        fornecedores,
      ] = await Promise.all([
        firebaseService.getAll('pagamentos').catch(() => []),
        firebaseService.getAll('agendamentos').catch(() => []),
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('comissoes').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('produtos').catch(() => []),
        firebaseService.getAll('fornecedores').catch(() => []),
      ]);

      // Função auxiliar para converter data
      const converterData = (data) => {
        if (!data) return null;
        if (data.seconds) return new Date(data.seconds * 1000);
        return new Date(data);
      };

      // Filtrar pagamentos
      const pagamentosFiltrados = (pagamentos || []).filter(p => {
        const data = converterData(p.data);
        return data && data >= dataInicioObj && data <= dataFimObj;
      });

      // Filtrar agendamentos
      const agendamentosFiltrados = (agendamentos || []).filter(a => {
        const data = converterData(a.data);
        return data && data >= dataInicioObj && data <= dataFimObj;
      });

      // Filtrar clientes por data de cadastro
      const clientesFiltrados = (clientes || []).filter(c => {
        if (!c.dataCadastro) return false;
        const [ano, mes, dia] = c.dataCadastro.split('-');
        const data = new Date(ano, mes - 1, dia);
        return data >= dataInicioObj && data <= dataFimObj;
      });

      // Filtrar comissões
      const comissoesFiltradas = (comissoes || []).filter(c => {
        const data = converterData(c.data);
        return data && data >= dataInicioObj && data <= dataFimObj;
      });

      // Gerar dados de linha (evolução diária)
      const dias = {};
      const diffDays = Math.ceil((dataFimObj - dataInicioObj) / (1000 * 60 * 60 * 24)) + 1;
      let acumulado = 0;
      
      for (let i = 0; i <= diffDays; i++) {
        const data = new Date(dataInicioObj);
        data.setDate(dataInicioObj.getDate() + i);
        const dia = data.toLocaleDateString('pt-BR');
        dias[dia] = { 
          dia, 
          receitas: 0, 
          despesas: 0, 
          lucro: 0,
          acumulado: 0,
          dinheiro: 0,
          cartao: 0,
          pix: 0,
        };
      }

      pagamentosFiltrados.forEach(p => {
        const data = converterData(p.data);
        if (!data) return;
        const dia = data.toLocaleDateString('pt-BR');
        if (dias[dia] && p.status === 'pago') {
          const valor = Number(p.valor) || 0;
          dias[dia].receitas += valor;
          const forma = (p.formaPagamento || '').toLowerCase();
          if (forma === 'dinheiro') dias[dia].dinheiro += valor;
          else if (forma === 'pix') dias[dia].pix += valor;
          else dias[dia].cartao += valor;
        }
      });

      // Calcular acumulado diário
      const dadosGraficoLinha = Object.values(dias)
        .sort((a, b) => {
          const [diaA, mesA, anoA] = a.dia.split('/');
          const [diaB, mesB, anoB] = b.dia.split('/');
          return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
        })
        .map(row => {
          acumulado += row.receitas - row.despesas;
          return { ...row, lucro: row.receitas - row.despesas, acumulado };
        });

      // Formas de pagamento
      const formasPagamentoMap = {};
      let totalFormas = 0;
      pagamentosFiltrados.forEach(p => {
        if (p.status !== 'pago') return;
        const forma = formasPagamentoLabels[p.formaPagamento]?.label || 'Outros';
        const valor = Number(p.valor) || 0;
        formasPagamentoMap[forma] = (formasPagamentoMap[forma] || 0) + valor;
        totalFormas++;
      });

      const dadosGraficoPizza = Object.keys(formasPagamentoMap)
        .map(cat => ({ 
          name: cat, 
          value: formasPagamentoMap[cat],
          quantidade: pagamentosFiltrados.filter(p => 
            (formasPagamentoLabels[p.formaPagamento]?.label || 'Outros') === cat && p.status === 'pago'
          ).length
        }))
        .sort((a, b) => b.value - a.value);

      // Dados financeiros
      const totalReceitas = pagamentosFiltrados
        .filter(p => p.status === 'pago')
        .reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
      
      const totalDespesas = 0;

      // Atendimentos realizados (finalizados)
      const atendimentosRealizados = agendamentosFiltrados.filter(a => a.status === 'finalizado');
      
      const totalGastoClientes = atendimentosRealizados.reduce((acc, a) => {
        return acc + (a.servicosRealizados || []).reduce((sum, s) => sum + (Number(s.preco) || 0), 0);
      }, 0);      
      
      const servicosMap = {};
      let faturamentoAtendimentos = 0;
      const horariosMap = {};
      
      atendimentosRealizados.forEach(a => {
        const horario = a.horario || '00:00';
        horariosMap[horario] = (horariosMap[horario] || 0) + 1;
        
        const servicosRealizados = a.servicosRealizados || [];
        servicosRealizados.forEach(servico => {
          const servicoNome = servico.nome || servico.id || 'Não identificado';
          servicosMap[servicoNome] = (servicosMap[servicoNome] || 0) + 1;
          faturamentoAtendimentos += Number(servico.preco) || 0;
        });
      });

      const dadosGraficoAtendimentos = Object.keys(servicosMap)
        .map(nome => ({ 
          name: nome, 
          value: servicosMap[nome],
          faturamento: atendimentosRealizados
            .filter(a => (a.servicosRealizados || []).some(s => (s.nome || s.id) === nome))
            .reduce((acc, a) => acc + (a.servicosRealizados || []).reduce((sum, s) => sum + (Number(s.preco) || 0), 0), 0),
          ticketMedio: atendimentosRealizados
            .filter(a => (a.servicosRealizados || []).some(s => (s.nome || s.id) === nome))
            .reduce((acc, a) => acc + (a.servicosRealizados || []).reduce((sum, s) => sum + (Number(s.preco) || 0), 0), 0) / (servicosMap[nome] || 1)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15);

      const horariosData = Object.keys(horariosMap)
        .map(horario => ({ horario, quantidade: horariosMap[horario] }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      // Dados de clientes
      const gastoPorCliente = {};
      const atendimentosPorCliente = {};
      const ultimaVisitaPorCliente = {};
      
      atendimentosRealizados.forEach(a => {
        const clienteId = a.clienteId;
        if (clienteId) {
          atendimentosPorCliente[clienteId] = (atendimentosPorCliente[clienteId] || 0) + 1;
          const valorAtendimento = (a.servicosRealizados || []).reduce((sum, s) => sum + (Number(s.preco) || 0), 0);
          gastoPorCliente[clienteId] = (gastoPorCliente[clienteId] || 0) + valorAtendimento;
          const dataAtendimento = converterData(a.data);
          if (dataAtendimento && (!ultimaVisitaPorCliente[clienteId] || dataAtendimento > ultimaVisitaPorCliente[clienteId])) {
            ultimaVisitaPorCliente[clienteId] = dataAtendimento;
          }
        }
      });

      const topClientes = Object.keys(atendimentosPorCliente)
        .map(id => {
          const cliente = (clientes || []).find(c => c.id === id);
          const totalGasto = gastoPorCliente[id] || 0;
          const atendimentos = atendimentosPorCliente[id];
          return {
            cliente: cliente?.nome || 'Cliente não encontrado',
            atendimentos,
            totalGasto,
            ticketMedio: totalGasto / atendimentos,
            ultimaVisita: ultimaVisitaPorCliente[id],
          };
        })
        .sort((a, b) => b.totalGasto - a.totalGasto)
        .slice(0, 10);

      // Níveis de fidelidade
      const niveis = { bronze: 0, prata: 0, ouro: 0, diamante: 0 };
      (clientes || []).forEach(c => {
        const nivel = c.nivelFidelidade || 'bronze';
        niveis[nivel] = (niveis[nivel] || 0) + 1;
      });

      const niveisFidelidade = Object.keys(niveis).map(nivel => ({
        nivel: nivel.charAt(0).toUpperCase() + nivel.slice(1),
        quantidade: niveis[nivel],
        cor: nivel === 'bronze' ? '#cd7f32' : nivel === 'prata' ? '#c0c0c0' : nivel === 'ouro' ? '#ffd700' : '#b9f2ff'
      }));

      // Categorias de serviços
      const categoriasServicosMap = {};
      (servicos || []).forEach(s => {
        const categoria = s.categoria || 'Geral';
        categoriasServicosMap[categoria] = (categoriasServicosMap[categoria] || 0) + 1;
      });

      const categoriasServicos = Object.keys(categoriasServicosMap).map(cat => ({
        categoria: cat,
        quantidade: categoriasServicosMap[cat],
        faturamento: 0,
        percentual: 0
      }));

      // Dados de profissionais
      const desempenhoProfissionais = {};
      let totalComissoesPeriodo = 0;
      
      atendimentosRealizados.forEach(a => {
        const profissionalId = a.profissionalId;
        if (profissionalId) {
          desempenhoProfissionais[profissionalId] = (desempenhoProfissionais[profissionalId] || 0) + 1;
        }
      });

      const dadosGraficoProfissionais = Object.keys(desempenhoProfissionais)
        .map(id => {
          const profissional = (profissionais || []).find(p => p.id === id);
          const comissoesProf = comissoesFiltradas.filter(c => c.profissionalId === id);
          const totalComissoes = comissoesProf.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
          totalComissoesPeriodo += totalComissoes;
          
          const totalGastoProfissional = atendimentosRealizados
            .filter(a => a.profissionalId === id)
            .reduce((acc, a) => acc + (a.servicosRealizados || []).reduce((sum, s) => sum + (Number(s.preco) || 0), 0), 0);
          const ticketMedio = desempenhoProfissionais[id] > 0 ? totalGastoProfissional / desempenhoProfissionais[id] : 0;
          
          return {
            name: profissional?.nome?.split(' ')[0] || 'Profissional',
            atendimentos: desempenhoProfissionais[id],
            comissoes: totalComissoes,
            ticketMedio: ticketMedio || 0,
            avaliacao: 4.5,
          };
        })
        .sort((a, b) => b.atendimentos - a.atendimentos);

      // Comissões por profissional
      const comissoesPorProfissional = {};
      let totalComissoes = 0;
      let comissoesPagas = 0;
      let comissoesPendentes = 0;
      
      comissoesFiltradas.forEach(c => {
        const profissional = c.profissionalNome || 
          (profissionais.find(p => p.id === c.profissionalId)?.nome) || 
          'Não identificado';
        if (!comissoesPorProfissional[profissional]) {
          comissoesPorProfissional[profissional] = { total: 0, pagas: 0, pendentes: 0 };
        }
        const valor = Number(c.valor) || 0;
        comissoesPorProfissional[profissional].total += valor;
        totalComissoes += valor;
        
        if (c.status === 'pago') {
          comissoesPorProfissional[profissional].pagas += valor;
          comissoesPagas += valor;
        } else {
          comissoesPorProfissional[profissional].pendentes += valor;
          comissoesPendentes += valor;
        }
      });

      // Evolução mensal das comissões
      const comissoesPorMes = {};
      comissoesFiltradas.forEach(c => {
        const data = converterData(c.data);
        if (!data) return;
        const mes = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        const valor = Number(c.valor) || 0;
        comissoesPorMes[mes] = (comissoesPorMes[mes] || 0) + valor;
      });

      const mesesOrdenados = Object.keys(comissoesPorMes).sort((a, b) => {
        const [mesA, anoA] = a.split(' ');
        const [mesB, anoB] = b.split(' ');
        return new Date(anoA, getMonthNumber(mesA)) - new Date(anoB, getMonthNumber(mesB));
      });

      let ultimoValor = 0;
      const evolucaoComissoes = mesesOrdenados.map(mes => {
        const total = comissoesPorMes[mes];
        const variacao = ultimoValor === 0 ? 0 : ((total - ultimoValor) / ultimoValor) * 100;
        ultimoValor = total;
        return { mes, total, variacao };
      });

      // Dados de agenda
      const agendaPorDia = {};
      agendamentosFiltrados.forEach(a => {
        const data = converterData(a.data);
        if (!data) return;
        const dia = data.toLocaleDateString('pt-BR');
        if (!agendaPorDia[dia]) {
          agendaPorDia[dia] = { total: 0, confirmados: 0, pendentes: 0, cancelados: 0 };
        }
        agendaPorDia[dia].total++;
        if (a.status === 'finalizado' || a.status === 'confirmado') agendaPorDia[dia].confirmados++;
        else if (a.status === 'pendente') agendaPorDia[dia].pendentes++;
        else if (a.status === 'cancelado') agendaPorDia[dia].cancelados++;
      });

      const dadosGraficoAgenda = Object.keys(agendaPorDia)
        .map(dia => ({ data: dia, ...agendaPorDia[dia] }))
        .sort((a, b) => {
          const [diaA, mesA, anoA] = a.data.split('/');
          const [diaB, mesB, anoB] = b.data.split('/');
          return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
        });

      // Dados de cancelamentos
      const cancelamentos = agendamentosFiltrados.filter(a => a.status === 'cancelado');
      const motivosCancelamento = {};
      cancelamentos.forEach(c => {
        const motivo = c.observacoes || 'Motivo não informado';
        motivosCancelamento[motivo] = (motivosCancelamento[motivo] || 0) + 1;
      });

      const dadosGraficoCancelamentos = Object.keys(motivosCancelamento)
        .map(motivo => ({ motivo, quantidade: motivosCancelamento[motivo] }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      const taxaCancelamento = agendamentosFiltrados.length > 0 
        ? (cancelamentos.length / agendamentosFiltrados.length) * 100 
        : 0;
      const perdaEstimada = cancelamentos.reduce((acc, c) => {
        const valor = (c.servicosRealizados || []).reduce((sum, s) => sum + (Number(s.preco) || 0), 0);
        return acc + valor;
      }, 0);

      // Dados de performance
      const diasUteis = diffDays;
      const faturamentoPorDia = totalReceitas / (diasUteis || 1);
      const atendimentosPorDia = atendimentosRealizados.length / (diasUteis || 1);
      const capacidadeMaxima = 20;
      const taxaOcupacao = (atendimentosPorDia / capacidadeMaxima) * 100;

      const indicadoresPerformance = [
        { indicador: 'Ticket Médio', valor: formatarMoeda(totalReceitas / (atendimentosRealizados.length || 1)), meta: formatarMoeda(150), status: (totalReceitas / (atendimentosRealizados.length || 1)) >= 150 ? 'Atingida' : 'Não Atingida' },
        { indicador: 'Faturamento/Dia', valor: formatarMoeda(faturamentoPorDia), meta: formatarMoeda(1000), status: faturamentoPorDia >= 1000 ? 'Atingida' : 'Não Atingida' },
        { indicador: 'Atendimentos/Dia', valor: atendimentosPorDia.toFixed(1), meta: '15', status: atendimentosPorDia >= 15 ? 'Atingida' : 'Não Atingida' },
        { indicador: 'Taxa de Ocupação', valor: formatarPercentual(taxaOcupacao), meta: formatarPercentual(70), status: taxaOcupacao >= 70 ? 'Atingida' : 'Não Atingida' },
        { indicador: 'Taxa de Cancelamento', valor: formatarPercentual(taxaCancelamento), meta: formatarPercentual(10), status: taxaCancelamento <= 10 ? 'Atingida' : 'Não Atingida' },
      ];

      // Dados de fidelidade
      const pontosPorCliente = {};
      (clientes || []).forEach(c => {
        if (c.totalPontos && c.totalPontos > 0) {
          pontosPorCliente[c.id] = {
            cliente: c.nome,
            pontos: c.totalPontos,
            nivel: c.nivelFidelidade || 'bronze',
          };
        }
      });

      const topPontos = Object.values(pontosPorCliente)
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, 10)
        .map(item => ({
          ...item,
          cor: item.nivel === 'bronze' ? '#cd7f32' : item.nivel === 'prata' ? '#c0c0c0' : item.nivel === 'ouro' ? '#ffd700' : '#b9f2ff',
          proximoNivel: item.nivel === 'bronze' ? 'Prata (500 pts)' : item.nivel === 'prata' ? 'Ouro (1000 pts)' : 'Diamante (2000 pts)'
        }));

      const totalPontos = (clientes || []).reduce((acc, c) => acc + (c.totalPontos || 0), 0);
      const pontosResgatados = 0;
      const pontosAExpirar = (clientes || []).reduce((acc, c) => {
        if (c.totalPontos && c.totalPontos > 0) {
          return acc + Math.floor(c.totalPontos * 0.1);
        }
        return acc;
      }, 0);

      // Dados de produtos
      const produtosData = produtos || [];
      const totalProdutos = produtosData.length;
      const estoqueTotal = produtosData.reduce((acc, p) => acc + (Number(p.quantidadeEstoque) || 0), 0);
      const valorEstoque = produtosData.reduce((acc, p) => acc + ((Number(p.quantidadeEstoque) || 0) * (Number(p.precoVenda) || 0)), 0);
      const estoqueBaixo = produtosData.filter(p => (Number(p.quantidadeEstoque) || 0) <= (Number(p.estoqueMinimo) || 0));
      const produtosEmFalta = produtosData.filter(p => (Number(p.quantidadeEstoque) || 0) === 0).length;
      
      const topValorEstoque = produtosData
        .map(p => ({
          nome: p.nome,
          quantidade: Number(p.quantidadeEstoque) || 0,
          precoVenda: Number(p.precoVenda) || 0,
          valorTotal: (Number(p.quantidadeEstoque) || 0) * (Number(p.precoVenda) || 0)
        }))
        .sort((a, b) => b.valorTotal - a.valorTotal)
        .slice(0, 10);

      // Dados de fornecedores
      const fornecedoresData = fornecedores || [];
      const totalFornecedores = fornecedoresData.length;
      const compras = await firebaseService.getAll('compras').catch(() => []);
      const comprasFiltradas = (compras || []).filter(c => {
        if (!c.dataCompra) return false;
        const data = new Date(c.dataCompra);
        return data >= dataInicioObj && data <= dataFimObj;
      });
      
      const fornecedoresCompras = {};
      comprasFiltradas.forEach(c => {
        const fornId = c.fornecedorId;
        if (fornId) {
          if (!fornecedoresCompras[fornId]) {
            fornecedoresCompras[fornId] = { compras: 0, valor: 0 };
          }
          fornecedoresCompras[fornId].compras += 1;
          fornecedoresCompras[fornId].valor += Number(c.valorTotal) || 0;
        }
      });

      const dadosGraficoFornecedores = Object.keys(fornecedoresCompras)
        .map(id => {
          const fornecedor = fornecedoresData.find(f => f.id === id);
          return {
            name: fornecedor?.nome || 'Fornecedor',
            compras: fornecedoresCompras[id].compras,
            valor: fornecedoresCompras[id].valor,
            rating: Number(fornecedor?.rating) || 0,
            status: fornecedor?.status || 'ativo',
          };
        })
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);

      const totalGastoFornecedores = Object.values(fornecedoresCompras).reduce((acc, f) => acc + f.valor, 0);
      const totalComprasFornecedores = Object.values(fornecedoresCompras).reduce((acc, f) => acc + f.compras, 0);

      // Dados detalhados para impressão
      const atendimentosDetalhadosData = atendimentosRealizados.map(a => ({
        ...a,
        clienteNome: clientes?.find(c => c.id === a.clienteId)?.nome || 'Cliente não identificado',
        profissionalNome: profissionais?.find(p => p.id === a.profissionalId)?.nome || 'Profissional não identificado',
        valorTotal: (a.servicosRealizados || []).reduce((sum, s) => sum + (Number(s.preco) || 0), 0)
      }));

      const clientesDetalhadosData = (clientes || []).map(c => ({
        ...c,
        totalGasto: gastoPorCliente[c.id] || 0,
        totalAtendimentos: atendimentosPorCliente[c.id] || 0
      }));

      const comissoesDetalhadasData = comissoesFiltradas.map(c => ({
        ...c,
        profissionalNome: profissionais?.find(p => p.id === c.profissionalId)?.nome || c.profissionalNome,
        clienteNome: clientes?.find(cl => cl.id === c.clienteId)?.nome,
        servicoNome: servicos?.find(s => s.id === c.servicoId)?.nome,
        valorServico: c.valorServico || 0
      }));

      const agendamentosDetalhadosData = agendamentosFiltrados.map(a => ({
        ...a,
        clienteNome: clientes?.find(c => c.id === a.clienteId)?.nome || 'Cliente não identificado',
        profissionalNome: profissionais?.find(p => p.id === a.profissionalId)?.nome || 'Profissional não identificado',
        servicoNome: a.servicosRealizados?.[0]?.nome || a.servicoNome,
        valor: (a.servicosRealizados || []).reduce((sum, s) => sum + (Number(s.preco) || 0), 0)
      }));

      // Resumos para impressão
      const resumos = tipoRelatorio === 'financeiro' ? [
        { label: 'Total Receitas', value: formatarMoeda(totalReceitas), color: '#4caf50' },
        { label: 'Total Despesas', value: formatarMoeda(totalDespesas), color: '#f44336' },
        { label: 'Lucro Líquido', value: formatarMoeda(totalReceitas - totalDespesas), color: '#2196f3' },
        { label: 'Margem', value: formatarPercentual(totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0), color: '#ff9800' },
      ] : tipoRelatorio === 'atendimentos' ? [
        { label: 'Atendimentos', value: formatarNumero(atendimentosRealizados.length), color: '#9c27b0' },
        { label: 'Faturamento', value: formatarMoeda(faturamentoAtendimentos), color: '#4caf50' },
        { label: 'Ticket Médio', value: formatarMoeda(faturamentoAtendimentos / (atendimentosRealizados.length || 1)), color: '#ff4081' },
        { label: 'Serviços', value: formatarNumero(Object.keys(servicosMap).length), color: '#ff9800' },
      ] : tipoRelatorio === 'clientes' ? [
        { label: 'Clientes', value: formatarNumero(clientes.length), color: '#9c27b0' },
        { label: 'Novos', value: formatarNumero(clientesFiltrados.length), color: '#4caf50' },
        { label: 'Atendimentos', value: formatarNumero(atendimentosRealizados.length), color: '#ff4081' },
        { label: 'Ticket Médio', value: formatarMoeda(totalGastoClientes / (atendimentosRealizados.length || 1)), color: '#ff9800' },
      ] : [];

      setDados({
        financeiro: {
          totalReceitas,
          totalDespesas,
          lucroLiquido: totalReceitas - totalDespesas,
          margem: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0,
        },
        atendimentos: {
          total: atendimentosRealizados.length,
          mediaDia: diasUteis > 0 ? atendimentosRealizados.length / diasUteis : 0,
          faturamento: faturamentoAtendimentos,
        },
        clientes: {
          totalClientes: clientes.length,
          novosClientes: clientesFiltrados.length,
          totalAtendimentos: atendimentosRealizados.length,
          ticketMedio: totalGastoClientes / (atendimentosRealizados.length || 1),
        },
        profissionais: {
          total: atendimentosRealizados.length,
          mediaPorProfissional: profissionais.length > 0 ? atendimentosRealizados.length / profissionais.length : 0,
          totalComissoes: totalComissoesPeriodo,
        },
        comissoes: {
          total: totalComissoes,
          pagas: comissoesPagas,
          pendentes: comissoesPendentes,
          porProfissional: comissoesPorProfissional,
        },
        servicos: {
          totalServicos: servicos.length,
          totalAtendimentos: atendimentosRealizados.length,
          ticketMedio: totalGastoClientes / (atendimentosRealizados.length || 1),
        },
        produtos: {
          totalProdutos,
          estoqueTotal,
          valorEstoque,
          estoqueBaixo,
          produtosEmFalta,
          topValorEstoque,
        },
        fornecedores: {
          total: totalFornecedores,
          totalCompras: totalComprasFornecedores,
          totalGasto: totalGastoFornecedores,
        },
        agenda: {
          total: agendamentosFiltrados.length,
          confirmados: agendamentosFiltrados.filter(a => a.status === 'finalizado' || a.status === 'confirmado').length,
          pendentes: agendamentosFiltrados.filter(a => a.status === 'pendente').length,
        },
        cancelamentos: {
          total: cancelamentos.length,
          taxa: taxaCancelamento,
          perdaEstimada,
        },
        performance: {
          ticketMedio: totalReceitas / (atendimentosRealizados.length || 1),
          faturamentoPorDia,
          atendimentosPorDia,
          taxaOcupacao,
        },
        fidelidade: {
          totalPontos,
          pontosResgatados,
          pontosAExpirar,
        },
        graficoLinha: dadosGraficoLinha,
        graficoPizza: dadosGraficoPizza,
        grafico: tipoRelatorio === 'atendimentos' ? dadosGraficoAtendimentos :
                tipoRelatorio === 'profissionais' ? dadosGraficoProfissionais :
                tipoRelatorio === 'servicos' ? dadosGraficoAtendimentos :
                tipoRelatorio === 'fornecedores' ? dadosGraficoFornecedores :
                tipoRelatorio === 'agenda' ? dadosGraficoAgenda :
                tipoRelatorio === 'cancelamentos' ? dadosGraficoCancelamentos :
                tipoRelatorio === 'performance' ? indicadoresPerformance :
                tipoRelatorio === 'fidelidade' ? topPontos : [],
        topClientes,
        niveisFidelidade,
        categoriasServicos,
        horarios: horariosData,
        evolucaoComissoes,
        resumos,
        atendimentosDetalhados: atendimentosDetalhadosData,
        clientesDetalhados: clientesDetalhadosData,
        comissoesDetalhadas: comissoesDetalhadasData,
        agendamentosDetalhados: agendamentosDetalhadosData,
      });
      
      mostrarSnackbar('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      mostrarSnackbar('Erro ao carregar dados do relatório', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para obter número do mês
  const getMonthNumber = (mes) => {
    const meses = {
      'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
      'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
    };
    return meses[mes.toLowerCase()] || 0;
  };

  // Função de impressão
  const handlePrint = () => {
    if (!componentRef.current) {
      toast.error('Componente de impressão não está pronto');
      return;
    }
    
    toast.loading('Preparando impressão...', { id: 'print' });
    
    const printContent = componentRef.current;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
    
    toast.success('Relatório enviado para impressão!', { id: 'print' });
  };

  // Exportar para PDF
  const handleExportPDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf' });
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const addHeader = () => {
        doc.setFillColor(156, 39, 176);
        doc.rect(0, 0, pageWidth, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('Beauty Pro Salon', 10, 6);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 60, 6);
      };

      addHeader();
      
      doc.setTextColor(156, 39, 176);
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      doc.text('Beauty Pro', 105, 25, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      const tituloRelatorioObj = {
        financeiro: 'Relatório Financeiro',
        atendimentos: 'Relatório de Atendimentos',
        clientes: 'Relatório de Clientes',
        profissionais: 'Relatório de Profissionais',
        comissoes: 'Relatório de Comissões',
        servicos: 'Relatório de Serviços',
        produtos: 'Relatório de Produtos',
        fornecedores: 'Relatório de Fornecedores',
        agenda: 'Relatório de Agenda',
        cancelamentos: 'Relatório de Cancelamentos',
        performance: 'Relatório de Performance',
        fidelidade: 'Relatório de Fidelidade',
      };
      doc.text(tituloRelatorioObj[tipoRelatorio], 105, 35, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')}`, 105, 42, { align: 'center' });
      
      let yPos = 50;

      // Resumo em cards
      if (dados.resumos && dados.resumos.length > 0) {
        const colWidth = pageWidth / 4 - 10;
        dados.resumos.forEach((resumo, index) => {
          const x = 14 + (index * (colWidth + 5));
          doc.setFillColor(248, 240, 250);
          doc.roundedRect(x, yPos, colWidth, 25, 2, 2, 'F');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(resumo.label, x + 5, yPos + 8);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(resumo.color ? parseInt(resumo.color.slice(1, 3), 16) : 156, 
                           resumo.color ? parseInt(resumo.color.slice(3, 5), 16) : 39, 
                           resumo.color ? parseInt(resumo.color.slice(5, 7), 16) : 176);
          doc.text(resumo.value, x + 5, yPos + 20);
        });
        yPos += 35;
      }

      // Gerar tabela baseada no tipo de relatório (mantido do código original)
      if (tipoRelatorio === 'financeiro' && dados.financeiro && dados.graficoLinha) {
        doc.setFontSize(12);
        doc.setTextColor(156, 39, 176);
        doc.text('Evolução Diária', 14, yPos);
        yPos += 5;
        
        doc.autoTable({
          startY: yPos,
          head: [['Data', 'Receitas (R$)', 'Despesas (R$)', 'Lucro (R$)']],
          body: dados.graficoLinha.slice(0, 30).map(row => [
            row.dia,
            row.receitas.toFixed(2),
            row.despesas.toFixed(2),
            row.lucro.toFixed(2),
          ]),
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176], textColor: 255 },
          styles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
        });
      }

      // Rodapé em todas as páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, pageHeight - 10);
        doc.text('Beauty Pro Salon', 10, pageHeight - 10);
      }
      
      doc.save(`relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF gerado com sucesso!', { id: 'pdf' });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF', { id: 'pdf' });
    }
  };

  // Exportar para Excel
  const handleExportExcel = () => {
    try {
      toast.loading('Gerando Excel...', { id: 'excel' });
      
      let worksheetData = [];
      
      worksheetData.push(['Beauty Pro Salon']);
      const titulosExcel = {
        financeiro: 'Relatório Financeiro',
        atendimentos: 'Relatório de Atendimentos',
        clientes: 'Relatório de Clientes',
        profissionais: 'Relatório de Profissionais',
        comissoes: 'Relatório de Comissões',
        servicos: 'Relatório de Serviços',
        produtos: 'Relatório de Produtos',
        fornecedores: 'Relatório de Fornecedores',
        agenda: 'Relatório de Agenda',
        cancelamentos: 'Relatório de Cancelamentos',
        performance: 'Relatório de Performance',
        fidelidade: 'Relatório de Fidelidade',
      };
      worksheetData.push([titulosExcel[tipoRelatorio]]);
      worksheetData.push([`Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')}`]);
      worksheetData.push([`Gerado em: ${new Date().toLocaleString('pt-BR')}`]);
      worksheetData.push([]);
      
      if (tipoRelatorio === 'financeiro' && dados.financeiro) {
        worksheetData.push(['RESUMO FINANCEIRO']);
        worksheetData.push(['Total Receitas', `R$ ${(dados.financeiro.totalReceitas || 0).toFixed(2)}`]);
        worksheetData.push(['Total Despesas', `R$ ${(dados.financeiro.totalDespesas || 0).toFixed(2)}`]);
        worksheetData.push(['Lucro Líquido', `R$ ${(dados.financeiro.lucroLiquido || 0).toFixed(2)}`]);
        worksheetData.push(['Margem', `${(dados.financeiro.margem || 0).toFixed(1)}%`]);
        worksheetData.push([]);
        
        if (dados.graficoLinha && dados.graficoLinha.length > 0) {
          worksheetData.push(['EVOLUÇÃO DIÁRIA']);
          worksheetData.push(['Data', 'Receitas', 'Despesas', 'Lucro', 'Acumulado']);
          dados.graficoLinha.forEach(row => {
            worksheetData.push([
              row.dia,
              `R$ ${row.receitas.toFixed(2)}`,
              `R$ ${row.despesas.toFixed(2)}`,
              `R$ ${row.lucro.toFixed(2)}`,
              `R$ ${row.acumulado.toFixed(2)}`,
            ]);
          });
        }
      } else if (tipoRelatorio === 'atendimentos' && dados.atendimentos) {
        worksheetData.push(['RESUMO DE ATENDIMENTOS']);
        worksheetData.push(['Total de Atendimentos', dados.atendimentos.total || 0]);
        worksheetData.push(['Média por Dia', (dados.atendimentos.mediaDia || 0).toFixed(1)]);
        worksheetData.push(['Faturamento Total', `R$ ${(dados.atendimentos.faturamento || 0).toFixed(2)}`]);
        worksheetData.push([]);
        
        if (dados.grafico && dados.grafico.length > 0) {
          worksheetData.push(['ATENDIMENTOS POR SERVIÇO']);
          worksheetData.push(['Serviço', 'Quantidade', 'Faturamento', 'Ticket Médio']);
          dados.grafico.forEach(row => {
            worksheetData.push([
              row.name,
              row.value,
              `R$ ${(row.faturamento || 0).toFixed(2)}`,
              `R$ ${(row.ticketMedio || 0).toFixed(2)}`,
            ]);
          });
        }
        
        if (dados.horarios && dados.horarios.length > 0) {
          worksheetData.push([]);
          worksheetData.push(['HORÁRIOS MAIS PROCURADOS']);
          worksheetData.push(['Horário', 'Quantidade']);
          dados.horarios.forEach(row => {
            worksheetData.push([row.horario, row.quantidade]);
          });
        }
      } else if (tipoRelatorio === 'clientes' && dados.clientes) {
        worksheetData.push(['RESUMO DE CLIENTES']);
        worksheetData.push(['Total de Clientes', dados.clientes.totalClientes || 0]);
        worksheetData.push(['Novos Clientes', dados.clientes.novosClientes || 0]);
        worksheetData.push(['Total de Atendimentos', dados.clientes.totalAtendimentos || 0]);
        worksheetData.push(['Ticket Médio', `R$ ${(dados.clientes.ticketMedio || 0).toFixed(2)}`]);
        worksheetData.push([]);
        
        if (dados.topClientes && dados.topClientes.length > 0) {
          worksheetData.push(['TOP CLIENTES']);
          worksheetData.push(['Cliente', 'Atendimentos', 'Total Gasto', 'Ticket Médio', 'Última Visita']);
          dados.topClientes.forEach(cliente => {
            worksheetData.push([
              cliente.cliente,
              cliente.atendimentos,
              `R$ ${(cliente.totalGasto || 0).toFixed(2)}`,
              `R$ ${(cliente.ticketMedio || 0).toFixed(2)}`,
              cliente.ultimaVisita ? new Date(cliente.ultimaVisita).toLocaleDateString('pt-BR') : '-',
            ]);
          });
        }
        
        if (dados.niveisFidelidade && dados.niveisFidelidade.length > 0) {
          worksheetData.push([]);
          worksheetData.push(['NÍVEIS DE FIDELIDADE']);
          worksheetData.push(['Nível', 'Quantidade', '%']);
          dados.niveisFidelidade.forEach(row => {
            worksheetData.push([
              row.nivel,
              row.quantidade,
              `${((row.quantidade / dados.clientes.totalClientes) * 100).toFixed(1)}%`,
            ]);
          });
        }
      } else if (tipoRelatorio === 'profissionais' && dados.grafico && dados.grafico.length > 0) {
        worksheetData.push(['DESEMPENHO POR PROFISSIONAL']);
        worksheetData.push(['Profissional', 'Atendimentos', 'Comissões', 'Ticket Médio', 'Avaliação']);
        dados.grafico.forEach(row => {
          worksheetData.push([
            row.name,
            row.atendimentos,
            `R$ ${(row.comissoes || 0).toFixed(2)}`,
            `R$ ${(row.ticketMedio || 0).toFixed(2)}`,
            row.avaliacao?.toFixed(1) || '4.5',
          ]);
        });
      } else if (tipoRelatorio === 'comissoes' && dados.comissoes) {
        worksheetData.push(['RESUMO DE COMISSÕES']);
        worksheetData.push(['Total de Comissões', `R$ ${(dados.comissoes.total || 0).toFixed(2)}`]);
        worksheetData.push(['Comissões Pagas', `R$ ${(dados.comissoes.pagas || 0).toFixed(2)}`]);
        worksheetData.push(['Comissões Pendentes', `R$ ${(dados.comissoes.pendentes || 0).toFixed(2)}`]);
        worksheetData.push([]);
        
        if (dados.comissoes.porProfissional && Object.keys(dados.comissoes.porProfissional).length > 0) {
          worksheetData.push(['COMISSÕES POR PROFISSIONAL']);
          worksheetData.push(['Profissional', 'Total', 'Pagas', 'Pendentes']);
          Object.entries(dados.comissoes.porProfissional).forEach(([prof, vals]) => {
            worksheetData.push([
              prof,
              `R$ ${vals.total.toFixed(2)}`,
              `R$ ${vals.pagas.toFixed(2)}`,
              `R$ ${vals.pendentes.toFixed(2)}`,
            ]);
          });
        }
        
        if (dados.evolucaoComissoes && dados.evolucaoComissoes.length > 0) {
          worksheetData.push([]);
          worksheetData.push(['EVOLUÇÃO MENSAL DAS COMISSÕES']);
          worksheetData.push(['Mês/Ano', 'Total', 'Variação']);
          dados.evolucaoComissoes.forEach(row => {
            worksheetData.push([
              row.mes,
              `R$ ${row.total.toFixed(2)}`,
              `${row.variacao >= 0 ? '+' : ''}${row.variacao.toFixed(1)}%`,
            ]);
          });
        }
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wscols = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      ws['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
      XLSX.writeFile(wb, `relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Excel gerado com sucesso!', { id: 'excel' });
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      toast.error('Erro ao gerar Excel', { id: 'excel' });
    }
  };

  // Exportar para JSON
  const handleExportJSON = () => {
    const relatorio = {
      titulo: `Relatório ${tipoRelatorio}`,
      tipo: tipoRelatorio,
      periodo,
      dataInicio,
      dataFim,
      geradoEm: new Date().toISOString(),
      usuario: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
      dados: dados,
    };

    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Relatório exportado com sucesso!');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
          Relatórios
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => {
              if (componentRef.current) {
                handlePrint();
              } else {
                toast.error('Componente de impressão não está pronto');
              }
            }}
            size="medium"
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
          >
            Imprimir
          </Button>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={handleExportPDF}
            size="medium"
            color="error"
          >
            PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<ExcelIcon />}
            onClick={handleExportExcel}
            size="medium"
            color="success"
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportJSON}
            size="medium"
          >
            JSON
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Filtros */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de Relatório</InputLabel>
                    <Select
                      value={tipoRelatorio}
                      label="Tipo de Relatório"
                      onChange={(e) => setTipoRelatorio(e.target.value)}
                    >
                      <MenuItem value="financeiro">📊 Financeiro</MenuItem>
                      <MenuItem value="atendimentos">💇 Atendimentos</MenuItem>
                      <MenuItem value="clientes">👥 Clientes</MenuItem>
                      <MenuItem value="profissionais">👩‍💼 Profissionais</MenuItem>
                      <MenuItem value="comissoes">💰 Comissões</MenuItem>
                      <MenuItem value="servicos">✂️ Serviços</MenuItem>
                      <MenuItem value="produtos">📦 Produtos</MenuItem>
                      <MenuItem value="fornecedores">🏢 Fornecedores</MenuItem>
                      <MenuItem value="agenda">📅 Agenda</MenuItem>
                      <MenuItem value="cancelamentos">❌ Cancelamentos</MenuItem>
                      <MenuItem value="performance">📈 Performance</MenuItem>
                      <MenuItem value="fidelidade">⭐ Fidelidade</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Período</InputLabel>
                    <Select
                      value={periodo}
                      label="Período"
                      onChange={(e) => setPeriodo(e.target.value)}
                    >
                      <MenuItem value="diario">Diário</MenuItem>
                      <MenuItem value="semanal">Semanal</MenuItem>
                      <MenuItem value="mensal">Mensal</MenuItem>
                      <MenuItem value="personalizado">Personalizado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {periodo === 'personalizado' && (
                  <>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Data Início"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Data Fim"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráficos por tipo de relatório */}
        {tipoRelatorio === 'financeiro' && dados.graficoLinha && dados.graficoLinha.length > 0 && (
          <>
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon /> Evolução Financeira
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={dados.graficoLinha}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="dia" />
                          <YAxis />
                          <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                          <Legend />
                          <Area type="monotone" dataKey="receitas" fill="#4caf50" fillOpacity={0.3} stroke="#4caf50" name="Receitas" />
                          <Area type="monotone" dataKey="despesas" fill="#f44336" fillOpacity={0.3} stroke="#f44336" name="Despesas" />
                          <Line type="monotone" dataKey="lucro" stroke="#2196f3" strokeWidth={2} name="Lucro" />
                          <Line type="monotone" dataKey="acumulado" stroke="#9c27b0" strokeWidth={2} name="Acumulado" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PieChartIcon /> Distribuição por Forma de Pagamento
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dados.graficoPizza}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {dados.graficoPizza?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </>
        )}

        {tipoRelatorio === 'atendimentos' && dados.grafico && dados.grafico.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon /> Atendimentos por Serviço
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dados.grafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="value" fill="#9c27b0" name="Quantidade" />
                        <Bar yAxisId="right" dataKey="faturamento" fill="#ff4081" name="Faturamento" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {tipoRelatorio === 'clientes' && dados.topClientes && dados.topClientes.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon /> Top Clientes
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dados.topClientes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cliente" angle={-45} textAnchor="end" height={100} interval={0} />
                        <YAxis yAxisId="left" orientation="left" stroke="#9c27b0" />
                        <YAxis yAxisId="right" orientation="right" stroke="#ff4081" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="atendimentos" fill="#9c27b0" name="Atendimentos" />
                        <Bar yAxisId="right" dataKey="totalGasto" fill="#ff4081" name="Total Gasto" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {tipoRelatorio === 'profissionais' && dados.grafico && dados.grafico.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon /> Desempenho dos Profissionais
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dados.grafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#9c27b0" />
                        <YAxis yAxisId="right" orientation="right" stroke="#ff4081" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="atendimentos" fill="#9c27b0" name="Atendimentos" />
                        <Bar yAxisId="right" dataKey="comissoes" fill="#ff4081" name="Comissões" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {tipoRelatorio === 'comissoes' && dados.comissoes?.porProfissional && Object.keys(dados.comissoes.porProfissional).length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PercentIcon /> Comissões por Profissional
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(dados.comissoes.porProfissional).map(([prof, vals]) => ({ name: prof, ...vals }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="total" fill="#9c27b0" name="Total" />
                        <Bar dataKey="pagas" fill="#4caf50" name="Pagas" />
                        <Bar dataKey="pendentes" fill="#ff9800" name="Pendentes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {tipoRelatorio === 'servicos' && dados.grafico && dados.grafico.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon /> Serviços Mais Realizados
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dados.grafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                        <YAxis yAxisId="left" orientation="left" stroke="#9c27b0" />
                        <YAxis yAxisId="right" orientation="right" stroke="#ff4081" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="value" fill="#9c27b0" name="Quantidade" />
                        <Bar yAxisId="right" dataKey="faturamento" fill="#ff4081" name="Faturamento" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {tipoRelatorio === 'produtos' && dados.produtos?.estoqueBaixo && dados.produtos.estoqueBaixo.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StoreIcon /> Produtos com Estoque Baixo
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dados.produtos.estoqueBaixo}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} interval={0} />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="quantidade" fill="#ff9800" name="Estoque Atual" />
                        <Bar dataKey="estoqueMinimo" fill="#f44336" name="Estoque Mínimo" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {tipoRelatorio === 'fornecedores' && dados.grafico && dados.grafico.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon /> Compras por Fornecedor
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dados.grafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                        <YAxis yAxisId="left" orientation="left" stroke="#9c27b0" />
                        <YAxis yAxisId="right" orientation="right" stroke="#ff4081" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="compras" fill="#9c27b0" name="Compras" />
                        <Bar yAxisId="right" dataKey="valor" fill="#ff4081" name="Valor Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {tipoRelatorio === 'agenda' && dados.grafico && dados.grafico.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon /> Agenda por Dia
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dados.grafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" angle={-45} textAnchor="end" height={80} interval={0} />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#9c27b0" name="Total" />
                        <Bar dataKey="confirmados" fill="#4caf50" name="Confirmados" />
                        <Bar dataKey="pendentes" fill="#ff9800" name="Pendentes" />
                        <Bar dataKey="cancelados" fill="#f44336" name="Cancelados" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {tipoRelatorio === 'performance' && dados.grafico && dados.grafico.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShowChartIcon /> Indicadores de Performance
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dados.grafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="indicador" angle={-45} textAnchor="end" height={100} interval={0} />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="valor" fill="#9c27b0" name="Valor" />
                        <Bar dataKey="meta" fill="#ff4081" name="Meta" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {tipoRelatorio === 'fidelidade' && dados.grafico && dados.grafico.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon /> Top Clientes por Pontos
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dados.grafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cliente" angle={-45} textAnchor="end" height={100} interval={0} />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="pontos" fill="#9c27b0" name="Pontos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}
      </Grid>

      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <RelatorioPrint
          ref={componentRef}
          dados={dados}
          tipoRelatorio={tipoRelatorio}
          periodo={periodo}
          dataInicio={dataInicio}
          dataFim={dataFim}
          logo={logo}
          resumos={dados.resumos}
        />
      </Box>

      {/* Dialog de Detalhes */}
      <Dialog open={detalhesOpen} onClose={handleCloseDetalhes} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Detalhes
        </DialogTitle>
        <DialogContent>
          {detalhesItem && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Nome:</strong> {detalhesItem.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Valor:</strong> R$ {(detalhesItem.value || 0).toFixed(2)}
              </Typography>
              {detalhesItem.faturamento && (
                <Typography variant="body1" gutterBottom>
                  <strong>Faturamento:</strong> R$ {(detalhesItem.faturamento || 0).toFixed(2)}
                </Typography>
              )}
              {detalhesItem.atendimentos && (
                <Typography variant="body1" gutterBottom>
                  <strong>Atendimentos:</strong> {detalhesItem.atendimentos}
                </Typography>
              )}
              {detalhesItem.comissoes && (
                <Typography variant="body1" gutterBottom>
                  <strong>Comissões:</strong> R$ {(detalhesItem.comissoes || 0).toFixed(2)}
                </Typography>
              )}
              {detalhesItem.ticketMedio && (
                <Typography variant="body1" gutterBottom>
                  <strong>Ticket Médio:</strong> R$ {(detalhesItem.ticketMedio || 0).toFixed(2)}
                </Typography>
              )}
              {detalhesItem.compras && (
                <Typography variant="body1" gutterBottom>
                  <strong>Compras:</strong> {detalhesItem.compras}
                </Typography>
              )}
              {detalhesItem.rating && (
                <Typography variant="body1" gutterBottom>
                  <strong>Rating:</strong> {detalhesItem.rating} ★
                </Typography>
              )}
              {detalhesItem.cliente && (
                <Typography variant="body1" gutterBottom>
                  <strong>Cliente:</strong> {detalhesItem.cliente}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalhes}>Fechar</Button>
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
  );
}

export default ModernRelatorios;
