// src/pages/ModernRelatorios.js
// Versão melhorada com mais relatórios e integração completa

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
} from 'recharts';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Tenta importar o logo, com fallback
let logo;
try {
  logo = require('../assets/logo.png');
} catch (error) {
  console.warn('Logo não encontrado, usando placeholder');
  logo = null;
}

const COLORS = ['#9c27b0', '#ff4081', '#7b1fa2', '#ba68c8', '#f8bbd0', '#f3e5f5', '#ce93d8', '#e1bee7'];

// Constantes para status e tipos
const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente' },
  pago: { color: '#4caf50', label: 'Pago' },
  atrasado: { color: '#f44336', label: 'Atrasado' },
  cancelado: { color: '#9e9e9e', label: 'Cancelado' },
  finalizado: { color: '#4caf50', label: 'Finalizado' },
  confirmado: { color: '#2196f3', label: 'Confirmado' },
};

const formasPagamentoLabels = {
  dinheiro: { label: 'Dinheiro', icon: '💵' },
  cartao_credito: { label: 'Cartão Crédito', icon: '💳' },
  cartao_debito: { label: 'Cartão Débito', icon: '💳' },
  pix: { label: 'PIX', icon: '⚡' },
  boleto: { label: 'Boleto', icon: '📄' },
  transferencia: { label: 'Transferência', icon: '🔄' },
  cheque: { label: 'Cheque', icon: '📝' },
  credito_loja: { label: 'Crédito Loja', icon: '🏪' },
};

// Componente para impressão
const RelatorioPrint = React.forwardRef(({ dados, tipoRelatorio, periodo, dataInicio, dataFim }, ref) => {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (data) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  const formatarNumero = (valor) => {
    return new Intl.NumberFormat('pt-BR').format(valor || 0);
  };

  const getTituloRelatorio = () => {
    switch(tipoRelatorio) {
      case 'financeiro': return 'Relatório Financeiro';
      case 'atendimentos': return 'Relatório de Atendimentos';
      case 'clientes': return 'Relatório de Clientes';
      case 'profissionais': return 'Relatório de Profissionais';
      case 'comissoes': return 'Relatório de Comissões';
      case 'servicos': return 'Relatório de Serviços';
      case 'produtos': return 'Relatório de Produtos';
      case 'fornecedores': return 'Relatório de Fornecedores';
      default: return 'Relatório';
    }
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
          <Avatar
            src={logo}
            alt="Logo"
            sx={{ 
              width: 70, 
              height: 70, 
              bgcolor: '#9c27b0',
              fontSize: '24px',
              fontWeight: 'bold',
              mr: 2
            }}
            imgProps={{
              onError: (e) => {
                e.target.style.display = 'none';
              }
            }}
          >
            BP
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
            Período: {formatarData(dataInicio)} - {formatarData(dataFim)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>
            Gerado em: {new Date().toLocaleString('pt-BR')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            Usuário: {JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema'}
          </Typography>
        </Box>
      </Box>

      {/* Informações do salão */}
      <Box sx={{ 
        mb: 4, 
        p: 2, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 1,
        border: '1px solid #e0e0e0'
      }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Beauty Pro Salon</Typography>
            <Typography variant="body2" color="textSecondary">Rua da Beleza, 100 - Jardins</Typography>
            <Typography variant="body2" color="textSecondary">São Paulo - SP, 01234-567</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Contato</Typography>
            <Typography variant="body2" color="textSecondary">Tel: (11) 3333-4444</Typography>
            <Typography variant="body2" color="textSecondary">Email: contato@beautypro.com</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Conteúdo do relatório */}
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
                    {formatarMoeda(dados.financeiro.totalReceitas)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                  <Typography variant="subtitle2" color="textSecondary">Total Despesas</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {formatarMoeda(dados.financeiro.totalDespesas)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="subtitle2" color="textSecondary">Lucro Líquido</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: dados.financeiro.lucroLiquido >= 0 ? '#2196f3' : '#f44336' }}>
                    {formatarMoeda(dados.financeiro.lucroLiquido)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                  <Typography variant="subtitle2" color="textSecondary">Margem</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {dados.financeiro.margem.toFixed(1)}%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Detalhamento por Dia
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, boxShadow: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Data</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Receitas</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Despesas</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Lucro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.graficoLinha?.map((row, index) => (
                  <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{row.dia}</TableCell>
                    <TableCell align="right" sx={{ color: '#4caf50' }}>{formatarMoeda(row.receitas)}</TableCell>
                    <TableCell align="right" sx={{ color: '#f44336' }}>{formatarMoeda(row.despesas)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: row.lucro >= 0 ? '#2196f3' : '#f44336' }}>
                      {formatarMoeda(row.lucro)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Resumo por Categoria
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#ff4081' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Categoria</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor</TableCell>
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
                    <TableCell align="right">{formatarMoeda(row.value)}</TableCell>
                    <TableCell align="right">
                      {dados.financeiro?.totalReceitas + dados.financeiro?.totalDespesas > 0 
                        ? ((row.value / (dados.financeiro?.totalReceitas + dados.financeiro?.totalDespesas)) * 100).toFixed(1)
                        : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'atendimentos' && dados.atendimentos && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.atendimentos.total || 0)}
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
                  {formatarMoeda(dados.atendimentos.faturamento || 0)}
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
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumero(row.value)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.faturamento)}</TableCell>
                    <TableCell align="right">
                      {dados.atendimentos.total > 0 ? ((row.value / dados.atendimentos.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'clientes' && dados.clientes && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Total de Clientes</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {formatarNumero(dados.clientes.totalClientes || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Novos Clientes</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {formatarNumero(dados.clientes.novosClientes || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Atendimentos</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff4081' }}>
                  {formatarNumero(dados.clientes.totalAtendimentos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Ticket Médio</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {formatarMoeda(dados.clientes.ticketMedio || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Top 5 Clientes
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Atendimentos</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Total Gasto</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
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
                    <TableCell align="right">{formatarMoeda(cliente.totalGasto)}</TableCell>
                    <TableCell align="right">
                      {dados.clientes.totalAtendimentos > 0 
                        ? ((cliente.atendimentos / dados.clientes.totalAtendimentos) * 100).toFixed(1)
                        : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'profissionais' && dados.profissionais && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.profissionais.total || 0)}
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
                  {formatarMoeda(dados.profissionais.totalComissoes || 0)}
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
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumero(row.atendimentos)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.comissoes)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.ticketMedio)}</TableCell>
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

      {tipoRelatorio === 'comissoes' && dados.comissoes && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Comissões</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarMoeda(dados.comissoes.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Comissões Pagas</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoeda(dados.comissoes.pagas || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Pendentes</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff9800' }}>
                  {formatarMoeda(dados.comissoes.pendentes || 0)}
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
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(dados.comissoes.porProfissional || {}).map(([profissional, valores], index) => (
                  <TableRow key={index}>
                    <TableCell>{profissional}</TableCell>
                    <TableCell align="right">{formatarMoeda(valores.total)}</TableCell>
                    <TableCell align="right">{formatarMoeda(valores.pagas)}</TableCell>
                    <TableCell align="right">{formatarMoeda(valores.pendentes)}</TableCell>
                    <TableCell align="right">
                      {dados.comissoes.total > 0 ? ((valores.total / dados.comissoes.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'servicos' && dados.servicos && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Serviços</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.servicos.totalServicos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {formatarNumero(dados.servicos.totalAtendimentos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Ticket Médio</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoeda(dados.servicos.ticketMedio || 0)}
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
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumero(row.value)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.faturamento)}</TableCell>
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
        </>
      )}

      {tipoRelatorio === 'produtos' && dados.produtos && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Produtos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.produtos.totalProdutos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Estoque Total</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {formatarNumero(dados.produtos.estoqueTotal || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Valor em Estoque</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoeda(dados.produtos.valorEstoque || 0)}
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
                    <TableCell align="right">{formatarNumero(produto.quantidade)}</TableCell>
                    <TableCell align="right">{formatarNumero(produto.estoqueMinimo)}</TableCell>
                    <TableCell align="right">{formatarMoeda(produto.precoVenda)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label="Estoque Baixo"
                        size="small"
                        color="warning"
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
        </>
      )}

      {tipoRelatorio === 'fornecedores' && dados.fornecedores && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Fornecedores</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.fornecedores.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Compras</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {formatarNumero(dados.fornecedores.totalCompras || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Gasto</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoeda(dados.fornecedores.totalGasto || 0)}
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
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumero(row.compras)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.valor)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${row.rating} ★`}
                        size="small"
                        sx={{ bgcolor: '#ff9800', color: 'white' }}
                      />
                    </TableCell>
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
          Beauty Pro Salon - Sistema de Gerenciamento v1.0
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
    graficoLinha: [],
    graficoPizza: [],
    grafico: [],
    topClientes: [],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [detalhesItem, setDetalhesItem] = useState(null);

  const componentRef = useRef();

  useEffect(() => {
    carregarDados();
  }, [tipoRelatorio, periodo, dataInicio, dataFim]);

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
        transacoes,
        atendimentos,
        clientes,
        profissionais,
        comissoes,
        servicos,
        produtos,
        fornecedores,
      ] = await Promise.all([
        firebaseService.getAll('transacoes').catch(() => []),
        firebaseService.getAll('historico_atendimentos').catch(() => []),
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('comissoes').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('produtos').catch(() => []),
        firebaseService.getAll('fornecedores').catch(() => []),
      ]);

      // Filtrar por período
      const transacoesFiltradas = (transacoes || []).filter(t => {
        if (!t.data) return false;
        const data = new Date(t.data);
        return data >= dataInicioObj && data <= dataFimObj;
      });

      const atendimentosFiltrados = (atendimentos || []).filter(a => {
        if (!a.data) return false;
        const data = new Date(a.data);
        return data >= dataInicioObj && data <= dataFimObj;
      });

      const clientesFiltrados = (clientes || []).filter(c => {
        if (!c.dataCadastro) return false;
        const data = new Date(c.dataCadastro);
        return data >= dataInicioObj && data <= dataFimObj;
      });

      const comissoesFiltradas = (comissoes || []).filter(c => {
        if (!c.data) return false;
        const data = new Date(c.data);
        return data >= dataInicioObj && data <= dataFimObj;
      });

      // Gerar dados de linha (evolução diária)
      const dias = {};
      const diffDays = Math.ceil((dataFimObj - dataInicioObj) / (1000 * 60 * 60 * 24)) + 1;
      
      for (let i = 0; i <= diffDays; i++) {
        const data = new Date(dataInicioObj);
        data.setDate(dataInicioObj.getDate() + i);
        const dia = data.toLocaleDateString('pt-BR');
        dias[dia] = { 
          dia, 
          receitas: 0, 
          despesas: 0, 
          lucro: 0,
          dinheiro: 0,
          cartao: 0,
          pix: 0,
        };
      }

      transacoesFiltradas.forEach(t => {
        if (!t.data) return;
        const data = new Date(t.data).toLocaleDateString('pt-BR');
        if (dias[data]) {
          const valor = Number(t.valor) || 0;
          if (t.tipo === 'receita' && t.status === 'pago') {
            dias[data].receitas += valor;
            const forma = (t.formaPagamento || '').toLowerCase();
            if (forma === 'dinheiro') dias[data].dinheiro += valor;
            else if (forma === 'pix') dias[data].pix += valor;
            else dias[data].cartao += valor;
          } else if (t.tipo === 'despesa' && t.status === 'pago') {
            dias[data].despesas += valor;
          }
          dias[data].lucro = dias[data].receitas - dias[data].despesas;
        }
      });

      const dadosGraficoLinha = Object.values(dias).sort((a, b) => {
        const [diaA, mesA, anoA] = a.dia.split('/');
        const [diaB, mesB, anoB] = b.dia.split('/');
        return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
      });

      // Gerar dados de pizza (categorias)
      const categorias = {};
      transacoesFiltradas.forEach(t => {
        if (t.status !== 'pago') return;
        let cat = t.categoria || 'Outros';
        if (t.origem === 'comissao') cat = 'Comissões';
        if (t.origem === 'compra') cat = 'Compras';
        const valor = Number(t.valor) || 0;
        categorias[cat] = (categorias[cat] || 0) + valor;
      });

      const dadosGraficoPizza = Object.keys(categorias)
        .map(cat => ({ name: cat, value: categorias[cat] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      // Dados financeiros
      const totalReceitas = transacoesFiltradas
        .filter(t => t.tipo === 'receita' && t.status === 'pago')
        .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
      
      const totalDespesas = transacoesFiltradas
        .filter(t => t.tipo === 'despesa' && t.status === 'pago')
        .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

      // Dados de atendimentos
      const servicosMap = {};
      let faturamentoAtendimentos = 0;
      atendimentosFiltrados.forEach(a => {
        const servico = a.servicoNome || a.servicoId || 'Não identificado';
        servicosMap[servico] = (servicosMap[servico] || 0) + 1;
        faturamentoAtendimentos += Number(a.valor) || 0;
      });

      const dadosGraficoAtendimentos = Object.keys(servicosMap)
        .map(nome => ({ 
          name: nome, 
          value: servicosMap[nome],
          faturamento: (atendimentosFiltrados.filter(a => (a.servicoNome || a.servicoId) === nome).reduce((acc, a) => acc + (Number(a.valor) || 0), 0))
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Dados de clientes
      const frequenciaClientes = {};
      let totalGastoClientes = 0;
      atendimentosFiltrados.forEach(a => {
        const clienteId = a.clienteId;
        if (clienteId) {
          frequenciaClientes[clienteId] = (frequenciaClientes[clienteId] || 0) + 1;
          totalGastoClientes += Number(a.valor) || 0;
        }
      });

      const topClientes = Object.keys(frequenciaClientes)
        .map(id => {
          const cliente = (clientes || []).find(c => c.id === id);
          const totalGasto = atendimentosFiltrados
            .filter(a => a.clienteId === id)
            .reduce((acc, a) => acc + (Number(a.valor) || 0), 0);
          return {
            cliente: cliente?.nome || 'Cliente não encontrado',
            atendimentos: frequenciaClientes[id],
            totalGasto: totalGasto,
          };
        })
        .sort((a, b) => b.atendimentos - a.atendimentos)
        .slice(0, 5);

      const ticketMedioClientes = totalGastoClientes / (atendimentosFiltrados.length || 1);

      // Dados de profissionais
      const desempenhoProfissionais = {};
      let totalComissoesPeriodo = 0;
      atendimentosFiltrados.forEach(a => {
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
          const ticketMedio = (atendimentosFiltrados
            .filter(a => a.profissionalId === id)
            .reduce((acc, a) => acc + (Number(a.valor) || 0), 0)) / (desempenhoProfissionais[id] || 1);
          return {
            name: profissional?.nome?.split(' ')[0] || 'Profissional',
            atendimentos: desempenhoProfissionais[id],
            comissoes: totalComissoes,
            ticketMedio: ticketMedio || 0,
          };
        })
        .sort((a, b) => b.atendimentos - a.atendimentos);

      // Dados de comissões
      const comissoesPorProfissional = {};
      comissoesFiltradas.forEach(c => {
        const profissional = c.profissionalNome || c.profissionalId || 'Não identificado';
        if (!comissoesPorProfissional[profissional]) {
          comissoesPorProfissional[profissional] = { total: 0, pagas: 0, pendentes: 0 };
        }
        const valor = Number(c.valor) || 0;
        comissoesPorProfissional[profissional].total += valor;
        if (c.status === 'pago') {
          comissoesPorProfissional[profissional].pagas += valor;
        } else {
          comissoesPorProfissional[profissional].pendentes += valor;
        }
      });

      const totalComissoes = comissoesFiltradas.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      const comissoesPagas = comissoesFiltradas.filter(c => c.status === 'pago').reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      const comissoesPendentes = totalComissoes - comissoesPagas;

      // Dados de serviços
      const servicosAtendimentos = {};
      let totalAtendimentosServicos = 0;
      atendimentosFiltrados.forEach(a => {
        const servicoNome = a.servicoNome || 'Não identificado';
        servicosAtendimentos[servicoNome] = (servicosAtendimentos[servicoNome] || 0) + 1;
        totalAtendimentosServicos++;
      });

      const dadosGraficoServicos = Object.keys(servicosAtendimentos)
        .map(nome => ({
          name: nome,
          value: servicosAtendimentos[nome],
          faturamento: atendimentosFiltrados
            .filter(a => (a.servicoNome || a.servicoId) === nome)
            .reduce((acc, a) => acc + (Number(a.valor) || 0), 0)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      const ticketMedioServicos = totalGastoClientes / (totalAtendimentosServicos || 1);

      // Dados de produtos
      const produtosData = produtos || [];
      const totalProdutos = produtosData.length;
      const estoqueTotal = produtosData.reduce((acc, p) => acc + (Number(p.quantidadeEstoque) || 0), 0);
      const valorEstoque = produtosData.reduce((acc, p) => acc + ((Number(p.quantidadeEstoque) || 0) * (Number(p.precoVenda) || 0)), 0);
      const estoqueBaixo = produtosData.filter(p => (Number(p.quantidadeEstoque) || 0) <= (Number(p.estoqueMinimo) || 0));

      // Dados de fornecedores
      const fornecedoresData = fornecedores || [];
      const totalFornecedores = fornecedoresData.length;
      const comprasData = await firebaseService.getAll('compras').catch(() => []);
      const comprasFiltradas = (comprasData || []).filter(c => {
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
          };
        })
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);

      const totalGastoFornecedores = Object.values(fornecedoresCompras).reduce((acc, f) => acc + f.valor, 0);
      const totalComprasFornecedores = Object.values(fornecedoresCompras).reduce((acc, f) => acc + f.compras, 0);

      setDados({
        financeiro: {
          totalReceitas,
          totalDespesas,
          lucroLiquido: totalReceitas - totalDespesas,
          margem: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0,
        },
        atendimentos: {
          total: atendimentosFiltrados.length,
          mediaDia: diffDays > 0 ? atendimentosFiltrados.length / diffDays : 0,
          faturamento: faturamentoAtendimentos,
        },
        clientes: {
          totalClientes: clientes.length,
          novosClientes: clientesFiltrados.length,
          totalAtendimentos: atendimentosFiltrados.length,
          ticketMedio: ticketMedioClientes,
        },
        profissionais: {
          total: atendimentosFiltrados.length,
          mediaPorProfissional: profissionais.length > 0 ? atendimentosFiltrados.length / profissionais.length : 0,
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
          totalAtendimentos: totalAtendimentosServicos,
          ticketMedio: ticketMedioServicos,
        },
        produtos: {
          totalProdutos,
          estoqueTotal,
          valorEstoque,
          estoqueBaixo,
        },
        fornecedores: {
          total: totalFornecedores,
          totalCompras: totalComprasFornecedores,
          totalGasto: totalGastoFornecedores,
        },
        graficoLinha: dadosGraficoLinha,
        graficoPizza: dadosGraficoPizza,
        grafico: tipoRelatorio === 'atendimentos' ? dadosGraficoAtendimentos :
                tipoRelatorio === 'profissionais' ? dadosGraficoProfissionais :
                tipoRelatorio === 'servicos' ? dadosGraficoServicos :
                tipoRelatorio === 'fornecedores' ? dadosGraficoFornecedores : [],
        topClientes,
      });
      
      mostrarSnackbar('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      mostrarSnackbar('Erro ao carregar dados do relatório', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função de impressão
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      toast.loading('Preparando impressão...', { id: 'print' });
    },
    onAfterPrint: () => {
      toast.success('Relatório enviado para impressão!', { id: 'print' });
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      toast.error('Erro ao imprimir relatório', { id: 'print' });
    }
  });

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
      const tituloRelatorio = {
        financeiro: 'Relatório Financeiro',
        atendimentos: 'Relatório de Atendimentos',
        clientes: 'Relatório de Clientes',
        profissionais: 'Relatório de Profissionais',
        comissoes: 'Relatório de Comissões',
        servicos: 'Relatório de Serviços',
        produtos: 'Relatório de Produtos',
        fornecedores: 'Relatório de Fornecedores',
      }[tipoRelatorio];
      doc.text(tituloRelatorio, 105, 35, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')}`, 105, 42, { align: 'center' });
      
      let yPos = 50;

      // Cards de resumo baseado no tipo
      const formatarMoedaPDF = (valor) => `R$ ${(valor || 0).toFixed(2)}`;
      const formatarNumeroPDF = (valor) => new Intl.NumberFormat('pt-BR').format(valor || 0);

      if (tipoRelatorio === 'financeiro' && dados.financeiro) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Receitas', 19, yPos + 6);
        doc.text('Total Despesas', 78, yPos + 6);
        doc.text('Lucro Líquido', 137, yPos + 6);
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.financeiro.totalReceitas), 19, yPos + 18);
        doc.setTextColor(244, 67, 54);
        doc.text(formatarMoedaPDF(dados.financeiro.totalDespesas), 78, yPos + 18);
        doc.setTextColor(dados.financeiro.lucroLiquido >= 0 ? 33, 150, 243 : 244, 67, 54);
        doc.text(formatarMoedaPDF(dados.financeiro.lucroLiquido), 137, yPos + 18);
        
        yPos += 35;

        // Tabela de evolução diária
        if (dados.graficoLinha && dados.graficoLinha.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.setFont(undefined, 'bold');
          doc.text('Evolução Diária', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Data', 'Receitas (R$)', 'Despesas (R$)', 'Lucro (R$)']],
            body: dados.graficoLinha.map(row => [
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
          yPos = doc.lastAutoTable.finalY + 15;
        }
      } else if (tipoRelatorio === 'atendimentos' && dados.atendimentos) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 85, 25, 2, 2, 'F');
        doc.roundedRect(107, yPos, 85, 25, 2, 2, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Total de Atendimentos', 24, yPos + 6);
        doc.text('Faturamento Total', 117, yPos + 6);
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.atendimentos.total), 24, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.atendimentos.faturamento), 117, yPos + 18);
        
        yPos += 35;

        if (dados.grafico && dados.grafico.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Atendimentos por Serviço', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Serviço', 'Quantidade', 'Faturamento (R$)']],
            body: dados.grafico.map(row => [
              row.name,
              row.value,
              (row.faturamento || 0).toFixed(2),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'clientes' && dados.clientes) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Clientes', 19, yPos + 6);
        doc.text('Novos Clientes', 78, yPos + 6);
        doc.text('Ticket Médio', 137, yPos + 6);
        
        doc.setFontSize(12);
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.clientes.totalClientes), 19, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarNumeroPDF(dados.clientes.novosClientes), 78, yPos + 18);
        doc.setTextColor(255, 64, 129);
        doc.text(formatarMoedaPDF(dados.clientes.ticketMedio), 137, yPos + 18);
        
        yPos += 35;

        if (dados.topClientes && dados.topClientes.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Top 5 Clientes', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Cliente', 'Atendimentos', 'Total Gasto (R$)']],
            body: dados.topClientes.map(cliente => [
              cliente.cliente,
              cliente.atendimentos,
              (cliente.totalGasto || 0).toFixed(2),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'profissionais' && dados.profissionais) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 85, 25, 2, 2, 'F');
        doc.roundedRect(107, yPos, 85, 25, 2, 2, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Total de Atendimentos', 24, yPos + 6);
        doc.text('Média por Profissional', 117, yPos + 6);
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.profissionais.total), 24, yPos + 18);
        doc.setTextColor(255, 64, 129);
        doc.text((dados.profissionais.mediaPorProfissional || 0).toFixed(1), 117, yPos + 18);
        
        yPos += 35;

        if (dados.grafico && dados.grafico.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Atendimentos por Profissional', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Profissional', 'Atendimentos', 'Comissões (R$)']],
            body: dados.grafico.map(row => [
              row.name,
              row.atendimentos,
              (row.comissoes || 0).toFixed(2),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'comissoes' && dados.comissoes) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Comissões', 19, yPos + 6);
        doc.text('Comissões Pagas', 78, yPos + 6);
        doc.text('Comissões Pendentes', 137, yPos + 6);
        
        doc.setFontSize(10);
        doc.setTextColor(156, 39, 176);
        doc.text(formatarMoedaPDF(dados.comissoes.total), 19, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.comissoes.pagas), 78, yPos + 18);
        doc.setTextColor(255, 152, 0);
        doc.text(formatarMoedaPDF(dados.comissoes.pendentes), 137, yPos + 18);
        
        yPos += 35;

        if (dados.comissoes.porProfissional && Object.keys(dados.comissoes.porProfissional).length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Comissões por Profissional', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Profissional', 'Total (R$)', 'Pagas (R$)', 'Pendentes (R$)']],
            body: Object.entries(dados.comissoes.porProfissional).map(([prof, vals]) => [
              prof,
              vals.total.toFixed(2),
              vals.pagas.toFixed(2),
              vals.pendentes.toFixed(2),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'servicos' && dados.servicos) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Serviços', 19, yPos + 6);
        doc.text('Atendimentos', 78, yPos + 6);
        doc.text('Ticket Médio', 137, yPos + 6);
        
        doc.setFontSize(10);
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.servicos.totalServicos), 19, yPos + 18);
        doc.setTextColor(255, 64, 129);
        doc.text(formatarNumeroPDF(dados.servicos.totalAtendimentos), 78, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.servicos.ticketMedio), 137, yPos + 18);
        
        yPos += 35;

        if (dados.grafico && dados.grafico.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Serviços Mais Realizados', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Serviço', 'Quantidade', 'Faturamento (R$)']],
            body: dados.grafico.map(row => [
              row.name,
              row.value,
              (row.faturamento || 0).toFixed(2),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'produtos' && dados.produtos) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Produtos', 19, yPos + 6);
        doc.text('Estoque Total', 78, yPos + 6);
        doc.text('Valor Estoque', 137, yPos + 6);
        
        doc.setFontSize(10);
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.produtos.totalProdutos), 19, yPos + 18);
        doc.setTextColor(33, 150, 243);
        doc.text(formatarNumeroPDF(dados.produtos.estoqueTotal), 78, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.produtos.valorEstoque), 137, yPos + 18);
        
        yPos += 35;

        if (dados.produtos.estoqueBaixo && dados.produtos.estoqueBaixo.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Produtos com Estoque Baixo', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Produto', 'Estoque Atual', 'Estoque Mínimo']],
            body: dados.produtos.estoqueBaixo.map(p => [
              p.nome,
              formatarNumeroPDF(p.quantidade),
              formatarNumeroPDF(p.estoqueMinimo),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'fornecedores' && dados.fornecedores) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Fornecedores', 19, yPos + 6);
        doc.text('Total Compras', 78, yPos + 6);
        doc.text('Total Gasto', 137, yPos + 6);
        
        doc.setFontSize(10);
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.fornecedores.total), 19, yPos + 18);
        doc.setTextColor(33, 150, 243);
        doc.text(formatarNumeroPDF(dados.fornecedores.totalCompras), 78, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.fornecedores.totalGasto), 137, yPos + 18);
        
        yPos += 35;

        if (dados.grafico && dados.grafico.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Fornecedores', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Fornecedor', 'Compras', 'Valor Total (R$)', 'Rating']],
            body: dados.grafico.map(row => [
              row.name,
              row.compras,
              (row.valor || 0).toFixed(2),
              `${row.rating} ★`,
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
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
      worksheetData.push([`Relatório ${{
        financeiro: 'Financeiro',
        atendimentos: 'Atendimentos',
        clientes: 'Clientes',
        profissionais: 'Profissionais',
        comissoes: 'Comissões',
        servicos: 'Serviços',
        produtos: 'Produtos',
        fornecedores: 'Fornecedores',
      }[tipoRelatorio]}`]);
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
          worksheetData.push(['Data', 'Receitas', 'Despesas', 'Lucro']);
          dados.graficoLinha.forEach(row => {
            worksheetData.push([
              row.dia,
              `R$ ${row.receitas.toFixed(2)}`,
              `R$ ${row.despesas.toFixed(2)}`,
              `R$ ${row.lucro.toFixed(2)}`,
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
          worksheetData.push(['Serviço', 'Quantidade', 'Faturamento']);
          dados.grafico.forEach(row => {
            worksheetData.push([
              row.name,
              row.value,
              `R$ ${(row.faturamento || 0).toFixed(2)}`,
            ]);
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
          worksheetData.push(['TOP 5 CLIENTES']);
          worksheetData.push(['Cliente', 'Atendimentos', 'Total Gasto']);
          dados.topClientes.forEach(cliente => {
            worksheetData.push([
              cliente.cliente,
              cliente.atendimentos,
              `R$ ${(cliente.totalGasto || 0).toFixed(2)}`,
            ]);
          });
        }
      } else if (tipoRelatorio === 'profissionais' && dados.profissionais) {
        worksheetData.push(['RESUMO DE PROFISSIONAIS']);
        worksheetData.push(['Total de Atendimentos', dados.profissionais.total || 0]);
        worksheetData.push(['Média por Profissional', (dados.profissionais.mediaPorProfissional || 0).toFixed(1)]);
        worksheetData.push(['Total de Comissões', `R$ ${(dados.profissionais.totalComissoes || 0).toFixed(2)}`]);
        worksheetData.push([]);
        
        if (dados.grafico && dados.grafico.length > 0) {
          worksheetData.push(['DESEMPENHO POR PROFISSIONAL']);
          worksheetData.push(['Profissional', 'Atendimentos', 'Comissões', 'Ticket Médio']);
          dados.grafico.forEach(row => {
            worksheetData.push([
              row.name,
              row.atendimentos,
              `R$ ${(row.comissoes || 0).toFixed(2)}`,
              `R$ ${(row.ticketMedio || 0).toFixed(2)}`,
            ]);
          });
        }
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
      } else if (tipoRelatorio === 'servicos' && dados.servicos) {
        worksheetData.push(['RESUMO DE SERVIÇOS']);
        worksheetData.push(['Total de Serviços', dados.servicos.totalServicos || 0]);
        worksheetData.push(['Total de Atendimentos', dados.servicos.totalAtendimentos || 0]);
        worksheetData.push(['Ticket Médio', `R$ ${(dados.servicos.ticketMedio || 0).toFixed(2)}`]);
        worksheetData.push([]);
        
        if (dados.grafico && dados.grafico.length > 0) {
          worksheetData.push(['SERVIÇOS MAIS REALIZADOS']);
          worksheetData.push(['Serviço', 'Quantidade', 'Faturamento']);
          dados.grafico.forEach(row => {
            worksheetData.push([
              row.name,
              row.value,
              `R$ ${(row.faturamento || 0).toFixed(2)}`,
            ]);
          });
        }
      } else if (tipoRelatorio === 'produtos' && dados.produtos) {
        worksheetData.push(['RESUMO DE PRODUTOS']);
        worksheetData.push(['Total de Produtos', dados.produtos.totalProdutos || 0]);
        worksheetData.push(['Estoque Total', dados.produtos.estoqueTotal || 0]);
        worksheetData.push(['Valor em Estoque', `R$ ${(dados.produtos.valorEstoque || 0).toFixed(2)}`]);
        worksheetData.push([]);
        
        if (dados.produtos.estoqueBaixo && dados.produtos.estoqueBaixo.length > 0) {
          worksheetData.push(['PRODUTOS COM ESTOQUE BAIXO']);
          worksheetData.push(['Produto', 'Estoque Atual', 'Estoque Mínimo', 'Valor Unitário']);
          dados.produtos.estoqueBaixo.forEach(p => {
            worksheetData.push([
              p.nome,
              p.quantidade,
              p.estoqueMinimo,
              `R$ ${(p.precoVenda || 0).toFixed(2)}`,
            ]);
          });
        }
      } else if (tipoRelatorio === 'fornecedores' && dados.fornecedores) {
        worksheetData.push(['RESUMO DE FORNECEDORES']);
        worksheetData.push(['Total de Fornecedores', dados.fornecedores.total || 0]);
        worksheetData.push(['Total de Compras', dados.fornecedores.totalCompras || 0]);
        worksheetData.push(['Total Gasto', `R$ ${(dados.fornecedores.totalGasto || 0).toFixed(2)}`]);
        worksheetData.push([]);
        
        if (dados.grafico && dados.grafico.length > 0) {
          worksheetData.push(['FORNECEDORES']);
          worksheetData.push(['Fornecedor', 'Compras', 'Valor Total', 'Rating']);
          dados.grafico.forEach(row => {
            worksheetData.push([
              row.name,
              row.compras,
              `R$ ${(row.valor || 0).toFixed(2)}`,
              `${row.rating} ★`,
            ]);
          });
        }
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wscols = [{ wch: 30 }, { wch: 20 }, { wch: 20 }];
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

        {/* Gráficos */}
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
                      <PieChartIcon /> Distribuição por Categoria
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
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#9c27b0" name="Quantidade" />
                        <Bar dataKey="faturamento" fill="#ff4081" name="Faturamento" />
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

      {/* Snackbar */}// src/pages/ModernRelatorios.js
// VERSÃO CORRIGIDA - Sem erros de sintaxe

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
} from 'recharts';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Tenta importar o logo, com fallback
let logo;
try {
  logo = require('../assets/logo.png');
} catch (error) {
  console.warn('Logo não encontrado, usando placeholder');
  logo = null;
}

const COLORS = ['#9c27b0', '#ff4081', '#7b1fa2', '#ba68c8', '#f8bbd0', '#f3e5f5', '#ce93d8', '#e1bee7'];

// Constantes para status e tipos
const statusColors = {
  pendente: { color: '#ff9800', label: 'Pendente' },
  pago: { color: '#4caf50', label: 'Pago' },
  atrasado: { color: '#f44336', label: 'Atrasado' },
  cancelado: { color: '#9e9e9e', label: 'Cancelado' },
  finalizado: { color: '#4caf50', label: 'Finalizado' },
  confirmado: { color: '#2196f3', label: 'Confirmado' },
};

const formasPagamentoLabels = {
  dinheiro: { label: 'Dinheiro', icon: '💵' },
  cartao_credito: { label: 'Cartão Crédito', icon: '💳' },
  cartao_debito: { label: 'Cartão Débito', icon: '💳' },
  pix: { label: 'PIX', icon: '⚡' },
  boleto: { label: 'Boleto', icon: '📄' },
  transferencia: { label: 'Transferência', icon: '🔄' },
  cheque: { label: 'Cheque', icon: '📝' },
  credito_loja: { label: 'Crédito Loja', icon: '🏪' },
};

// Componente para impressão
const RelatorioPrint = React.forwardRef(({ dados, tipoRelatorio, periodo, dataInicio, dataFim }, ref) => {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (data) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  const formatarNumero = (valor) => {
    return new Intl.NumberFormat('pt-BR').format(valor || 0);
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
    };
    return titulos[tipoRelatorio] || 'Relatório';
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
          <Avatar
            src={logo}
            alt="Logo"
            sx={{ 
              width: 70, 
              height: 70, 
              bgcolor: '#9c27b0',
              fontSize: '24px',
              fontWeight: 'bold',
              mr: 2
            }}
            imgProps={{
              onError: (e) => {
                e.target.style.display = 'none';
              }
            }}
          >
            BP
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
            Período: {formatarData(dataInicio)} - {formatarData(dataFim)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>
            Gerado em: {new Date().toLocaleString('pt-BR')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            Usuário: {JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema'}
          </Typography>
        </Box>
      </Box>

      {/* Informações do salão */}
      <Box sx={{ 
        mb: 4, 
        p: 2, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 1,
        border: '1px solid #e0e0e0'
      }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Beauty Pro Salon</Typography>
            <Typography variant="body2" color="textSecondary">Rua da Beleza, 100 - Jardins</Typography>
            <Typography variant="body2" color="textSecondary">São Paulo - SP, 01234-567</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Contato</Typography>
            <Typography variant="body2" color="textSecondary">Tel: (11) 3333-4444</Typography>
            <Typography variant="body2" color="textSecondary">Email: contato@beautypro.com</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Conteúdo do relatório */}
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
                    {formatarMoeda(dados.financeiro.totalReceitas)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                  <Typography variant="subtitle2" color="textSecondary">Total Despesas</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {formatarMoeda(dados.financeiro.totalDespesas)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="subtitle2" color="textSecondary">Lucro Líquido</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: dados.financeiro.lucroLiquido >= 0 ? '#2196f3' : '#f44336' }}>
                    {formatarMoeda(dados.financeiro.lucroLiquido)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                  <Typography variant="subtitle2" color="textSecondary">Margem</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {dados.financeiro.margem.toFixed(1)}%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Detalhamento por Dia
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, boxShadow: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Data</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Receitas</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Despesas</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Lucro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.graficoLinha?.map((row, index) => (
                  <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{row.dia}</TableCell>
                    <TableCell align="right" sx={{ color: '#4caf50' }}>{formatarMoeda(row.receitas)}</TableCell>
                    <TableCell align="right" sx={{ color: '#f44336' }}>{formatarMoeda(row.despesas)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: row.lucro >= 0 ? '#2196f3' : '#f44336' }}>
                      {formatarMoeda(row.lucro)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Resumo por Categoria
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#ff4081' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Categoria</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Valor</TableCell>
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
                    <TableCell align="right">{formatarMoeda(row.value)}</TableCell>
                    <TableCell align="right">
                      {dados.financeiro?.totalReceitas + dados.financeiro?.totalDespesas > 0 
                        ? ((row.value / (dados.financeiro?.totalReceitas + dados.financeiro?.totalDespesas)) * 100).toFixed(1)
                        : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'atendimentos' && dados.atendimentos && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.atendimentos.total || 0)}
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
                  {formatarMoeda(dados.atendimentos.faturamento || 0)}
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
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumero(row.value)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.faturamento)}</TableCell>
                    <TableCell align="right">
                      {dados.atendimentos.total > 0 ? ((row.value / dados.atendimentos.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'clientes' && dados.clientes && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Total de Clientes</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {formatarNumero(dados.clientes.totalClientes || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Novos Clientes</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {formatarNumero(dados.clientes.novosClientes || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Atendimentos</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff4081' }}>
                  {formatarNumero(dados.clientes.totalAtendimentos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Ticket Médio</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {formatarMoeda(dados.clientes.ticketMedio || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
            Top 5 Clientes
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Atendimentos</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Total Gasto</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
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
                    <TableCell align="right">{formatarMoeda(cliente.totalGasto)}</TableCell>
                    <TableCell align="right">
                      {dados.clientes.totalAtendimentos > 0 
                        ? ((cliente.atendimentos / dados.clientes.totalAtendimentos) * 100).toFixed(1)
                        : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'profissionais' && dados.profissionais && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.profissionais.total || 0)}
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
                  {formatarMoeda(dados.profissionais.totalComissoes || 0)}
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
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumero(row.atendimentos)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.comissoes)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.ticketMedio)}</TableCell>
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

      {tipoRelatorio === 'comissoes' && dados.comissoes && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Comissões</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarMoeda(dados.comissoes.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Comissões Pagas</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoeda(dados.comissoes.pagas || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Pendentes</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff9800' }}>
                  {formatarMoeda(dados.comissoes.pendentes || 0)}
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
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(dados.comissoes.porProfissional || {}).map(([profissional, valores], index) => (
                  <TableRow key={index}>
                    <TableCell>{profissional}</TableCell>
                    <TableCell align="right">{formatarMoeda(valores.total)}</TableCell>
                    <TableCell align="right">{formatarMoeda(valores.pagas)}</TableCell>
                    <TableCell align="right">{formatarMoeda(valores.pendentes)}</TableCell>
                    <TableCell align="right">
                      {dados.comissoes.total > 0 ? ((valores.total / dados.comissoes.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'servicos' && dados.servicos && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Serviços</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.servicos.totalServicos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {formatarNumero(dados.servicos.totalAtendimentos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Ticket Médio</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoeda(dados.servicos.ticketMedio || 0)}
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
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumero(row.value)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.faturamento)}</TableCell>
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
        </>
      )}

      {tipoRelatorio === 'produtos' && dados.produtos && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Produtos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.produtos.totalProdutos || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Estoque Total</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {formatarNumero(dados.produtos.estoqueTotal || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Valor em Estoque</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoeda(dados.produtos.valorEstoque || 0)}
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
                    <TableCell align="right">{formatarNumero(produto.quantidade)}</TableCell>
                    <TableCell align="right">{formatarNumero(produto.estoqueMinimo)}</TableCell>
                    <TableCell align="right">{formatarMoeda(produto.precoVenda)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label="Estoque Baixo"
                        size="small"
                        color="warning"
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
        </>
      )}

      {tipoRelatorio === 'fornecedores' && dados.fornecedores && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Fornecedores</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.fornecedores.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Compras</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {formatarNumero(dados.fornecedores.totalCompras || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total Gasto</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {formatarMoeda(dados.fornecedores.totalGasto || 0)}
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
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumero(row.compras)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.valor)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${row.rating} ★`}
                        size="small"
                        sx={{ bgcolor: '#ff9800', color: 'white' }}
                      />
                    </TableCell>
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
          Beauty Pro Salon - Sistema de Gerenciamento v1.0
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
    graficoLinha: [],
    graficoPizza: [],
    grafico: [],
    topClientes: [],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [detalhesItem, setDetalhesItem] = useState(null);

  const componentRef = useRef();

  useEffect(() => {
    carregarDados();
  }, [tipoRelatorio, periodo, dataInicio, dataFim]);

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
    // ... (mesma função carregarDados do código anterior)
  };

  // Função de impressão
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      toast.loading('Preparando impressão...', { id: 'print' });
    },
    onAfterPrint: () => {
      toast.success('Relatório enviado para impressão!', { id: 'print' });
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      toast.error('Erro ao imprimir relatório', { id: 'print' });
    }
  });

  // Função para formatar moeda no PDF
  const formatarMoedaPDF = (valor) => `R$ ${(valor || 0).toFixed(2)}`;
  const formatarNumeroPDF = (valor) => new Intl.NumberFormat('pt-BR').format(valor || 0);

  // Exportar para PDF - CORRIGIDO
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
      };
      doc.text(tituloRelatorioObj[tipoRelatorio], 105, 35, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')}`, 105, 42, { align: 'center' });
      
      let yPos = 50;

      if (tipoRelatorio === 'financeiro' && dados.financeiro) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Receitas', 19, yPos + 6);
        doc.text('Total Despesas', 78, yPos + 6);
        doc.text('Lucro Líquido', 137, yPos + 6);
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        
        // Receitas - Verde
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.financeiro.totalReceitas), 19, yPos + 18);
        
        // Despesas - Vermelho
        doc.setTextColor(244, 67, 54);
        doc.text(formatarMoedaPDF(dados.financeiro.totalDespesas), 78, yPos + 18);
        
        // Lucro - CORRIGIDO: usando if separado
        if (dados.financeiro.lucroLiquido >= 0) {
          doc.setTextColor(33, 150, 243); // Azul para lucro positivo
        } else {
          doc.setTextColor(244, 67, 54); // Vermelho para prejuízo
        }
        doc.text(formatarMoedaPDF(dados.financeiro.lucroLiquido), 137, yPos + 18);
        
        yPos += 35;

        // Tabela de evolução diária
        if (dados.graficoLinha && dados.graficoLinha.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.setFont(undefined, 'bold');
          doc.text('Evolução Diária', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Data', 'Receitas (R$)', 'Despesas (R$)', 'Lucro (R$)']],
            body: dados.graficoLinha.map(row => [
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
          yPos = doc.lastAutoTable.finalY + 15;
        }
      } else if (tipoRelatorio === 'atendimentos' && dados.atendimentos) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 85, 25, 2, 2, 'F');
        doc.roundedRect(107, yPos, 85, 25, 2, 2, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Total de Atendimentos', 24, yPos + 6);
        doc.text('Faturamento Total', 117, yPos + 6);
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.atendimentos.total), 24, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.atendimentos.faturamento), 117, yPos + 18);
        
        yPos += 35;

        if (dados.grafico && dados.grafico.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Atendimentos por Serviço', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Serviço', 'Quantidade', 'Faturamento (R$)']],
            body: dados.grafico.map(row => [
              row.name,
              row.value,
              (row.faturamento || 0).toFixed(2),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'clientes' && dados.clientes) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Clientes', 19, yPos + 6);
        doc.text('Novos Clientes', 78, yPos + 6);
        doc.text('Ticket Médio', 137, yPos + 6);
        
        doc.setFontSize(12);
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.clientes.totalClientes), 19, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarNumeroPDF(dados.clientes.novosClientes), 78, yPos + 18);
        doc.setTextColor(255, 64, 129);
        doc.text(formatarMoedaPDF(dados.clientes.ticketMedio), 137, yPos + 18);
        
        yPos += 35;

        if (dados.topClientes && dados.topClientes.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Top 5 Clientes', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Cliente', 'Atendimentos', 'Total Gasto (R$)']],
            body: dados.topClientes.map(cliente => [
              cliente.cliente,
              cliente.atendimentos,
              (cliente.totalGasto || 0).toFixed(2),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'profissionais' && dados.profissionais) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 85, 25, 2, 2, 'F');
        doc.roundedRect(107, yPos, 85, 25, 2, 2, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Total de Atendimentos', 24, yPos + 6);
        doc.text('Média por Profissional', 117, yPos + 6);
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.profissionais.total), 24, yPos + 18);
        doc.setTextColor(255, 64, 129);
        doc.text((dados.profissionais.mediaPorProfissional || 0).toFixed(1), 117, yPos + 18);
        
        yPos += 35;

        if (dados.grafico && dados.grafico.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Atendimentos por Profissional', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Profissional', 'Atendimentos', 'Comissões (R$)']],
            body: dados.grafico.map(row => [
              row.name,
              row.atendimentos,
              (row.comissoes || 0).toFixed(2),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'comissoes' && dados.comissoes) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Comissões', 19, yPos + 6);
        doc.text('Comissões Pagas', 78, yPos + 6);
        doc.text('Comissões Pendentes', 137, yPos + 6);
        
        doc.setFontSize(10);
        doc.setTextColor(156, 39, 176);
        doc.text(formatarMoedaPDF(dados.comissoes.total), 19, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.comissoes.pagas), 78, yPos + 18);
        doc.setTextColor(255, 152, 0);
        doc.text(formatarMoedaPDF(dados.comissoes.pendentes), 137, yPos + 18);
        
        yPos += 35;

        if (dados.comissoes.porProfissional && Object.keys(dados.comissoes.porProfissional).length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Comissões por Profissional', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Profissional', 'Total (R$)', 'Pagas (R$)', 'Pendentes (R$)']],
            body: Object.entries(dados.comissoes.porProfissional).map(([prof, vals]) => [
              prof,
              vals.total.toFixed(2),
              vals.pagas.toFixed(2),
              vals.pendentes.toFixed(2),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'servicos' && dados.servicos) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Serviços', 19, yPos + 6);
        doc.text('Atendimentos', 78, yPos + 6);
        doc.text('Ticket Médio', 137, yPos + 6);
        
        doc.setFontSize(10);
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.servicos.totalServicos), 19, yPos + 18);
        doc.setTextColor(255, 64, 129);
        doc.text(formatarNumeroPDF(dados.servicos.totalAtendimentos), 78, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.servicos.ticketMedio), 137, yPos + 18);
        
        yPos += 35;

        if (dados.grafico && dados.grafico.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Serviços Mais Realizados', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Serviço', 'Quantidade', 'Faturamento (R$)']],
            body: dados.grafico.map(row => [
              row.name,
              row.value,
              (row.faturamento || 0).toFixed(2),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'produtos' && dados.produtos) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Produtos', 19, yPos + 6);
        doc.text('Estoque Total', 78, yPos + 6);
        doc.text('Valor Estoque', 137, yPos + 6);
        
        doc.setFontSize(10);
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.produtos.totalProdutos), 19, yPos + 18);
        doc.setTextColor(33, 150, 243);
        doc.text(formatarNumeroPDF(dados.produtos.estoqueTotal), 78, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.produtos.valorEstoque), 137, yPos + 18);
        
        yPos += 35;

        if (dados.produtos.estoqueBaixo && dados.produtos.estoqueBaixo.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Produtos com Estoque Baixo', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Produto', 'Estoque Atual', 'Estoque Mínimo']],
            body: dados.produtos.estoqueBaixo.map(p => [
              p.nome,
              formatarNumeroPDF(p.quantidade),
              formatarNumeroPDF(p.estoqueMinimo),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
      } else if (tipoRelatorio === 'fornecedores' && dados.fornecedores) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 25, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 25, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Fornecedores', 19, yPos + 6);
        doc.text('Total Compras', 78, yPos + 6);
        doc.text('Total Gasto', 137, yPos + 6);
        
        doc.setFontSize(10);
        doc.setTextColor(156, 39, 176);
        doc.text(formatarNumeroPDF(dados.fornecedores.total), 19, yPos + 18);
        doc.setTextColor(33, 150, 243);
        doc.text(formatarNumeroPDF(dados.fornecedores.totalCompras), 78, yPos + 18);
        doc.setTextColor(76, 175, 80);
        doc.text(formatarMoedaPDF(dados.fornecedores.totalGasto), 137, yPos + 18);
        
        yPos += 35;

        if (dados.grafico && dados.grafico.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(156, 39, 176);
          doc.text('Fornecedores', 14, yPos);
          yPos += 5;
          
          doc.autoTable({
            startY: yPos,
            head: [['Fornecedor', 'Compras', 'Valor Total (R$)', 'Rating']],
            body: dados.grafico.map(row => [
              row.name,
              row.compras,
              (row.valor || 0).toFixed(2),
              `${row.rating} ★`,
            ]),
            theme: 'striped',
            headStyles: { fillColor: [156, 39, 176], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });
        }
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
      };
      worksheetData.push([titulosExcel[tipoRelatorio]]);
      worksheetData.push([`Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')}`]);
      worksheetData.push([`Gerado em: ${new Date().toLocaleString('pt-BR')}`]);
      worksheetData.push([]);
      
      // ... (restante da exportação Excel igual ao anterior)
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wscols = [{ wch: 30 }, { wch: 20 }, { wch: 20 }];
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

        {/* Cards de resumo e gráficos - manter o mesmo do código anterior */}
        {/* ... */}
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
