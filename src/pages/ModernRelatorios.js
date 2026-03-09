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
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../services/api';

// Tenta importar o logo, com fallback
let logo;
try {
  logo = require('../assets/logo.png');
} catch (error) {
  console.warn('Logo não encontrado, usando placeholder');
  logo = null;
}

const COLORS = ['#9c27b0', '#ff4081', '#7b1fa2', '#ba68c8', '#f8bbd0', '#f3e5f5'];

// Componente para impressão
const RelatorioPrint = React.forwardRef(({ dados, tipoRelatorio, periodo, dataInicio, dataFim }, ref) => {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
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

      {/* Resumo Executivo */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2 }}>
          Resumo Executivo
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa' }}>
              <Typography variant="subtitle2" color="textSecondary">Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {tipoRelatorio === 'financeiro' 
                  ? formatarMoeda(dados.total)
                  : formatarNumero(dados.total)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa' }}>
              <Typography variant="subtitle2" color="textSecondary">Quantidade</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff4081' }}>
                {formatarNumero(dados.quantidade || dados.total || 0)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa' }}>
              <Typography variant="subtitle2" color="textSecondary">
                {tipoRelatorio === 'financeiro' ? 'Ticket Médio' : 'Média/Dia'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {tipoRelatorio === 'financeiro'
                  ? formatarMoeda(dados.media)
                  : dados.mediaDia?.toFixed(1) || '0'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa' }}>
              <Typography variant="subtitle2" color="textSecondary">Dias no Período</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {Math.ceil((new Date(dataFim) - new Date(dataInicio)) / (1000 * 60 * 60 * 24)) + 1}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Conteúdo do relatório */}
      {tipoRelatorio === 'financeiro' && (
        <>
          {/* Tabela de pagamentos detalhada */}
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 3 }}>
            Detalhamento por Dia
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, boxShadow: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Data</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Dinheiro</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Cartão</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>PIX</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.graficoLinha?.map((row, index) => (
                  <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{row.dia}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.dinheiro)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.cartao)}</TableCell>
                    <TableCell align="right">{formatarMoeda(row.pix)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{formatarMoeda(row.total)}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#f3e5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatarMoeda(dados.graficoLinha?.reduce((acc, row) => acc + row.dinheiro, 0) || 0)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatarMoeda(dados.graficoLinha?.reduce((acc, row) => acc + row.cartao, 0) || 0)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatarMoeda(dados.graficoLinha?.reduce((acc, row) => acc + row.pix, 0) || 0)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatarMoeda(dados.total || 0)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Resumo por forma de pagamento */}
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 3 }}>
            Resumo por Forma de Pagamento
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#ff4081' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Forma de Pagamento</TableCell>
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
                      {dados.total > 0 ? ((row.value / dados.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#f3e5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatarMoeda(dados.total || 0)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'atendimentos' && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Média por Dia</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {(dados.mediaDia || 0).toFixed(1)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 3 }}>
            Atendimentos por Serviço
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Serviço</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Quantidade</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumero(row.value)}</TableCell>
                    <TableCell align="right">
                      {dados.total > 0 ? ((row.value / dados.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'clientes' && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Total de Clientes</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {formatarNumero(dados.totalClientes || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Novos Clientes</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {formatarNumero(dados.novosClientes || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Atendimentos</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff4081' }}>
                  {formatarNumero(dados.totalAtendimentos || 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 3 }}>
            Top 5 Clientes por Atendimentos
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Atendimentos</TableCell>
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
                    <TableCell align="right">
                      {dados.totalAtendimentos > 0 
                        ? ((cliente.atendimentos / dados.totalAtendimentos) * 100).toFixed(1) 
                        : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tipoRelatorio === 'profissionais' && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Total de Atendimentos</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#9c27b0' }}>
                  {formatarNumero(dados.total || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f0fa', boxShadow: 3 }}>
                <Typography variant="subtitle1" color="textSecondary">Média por Profissional</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff4081' }}>
                  {(dados.mediaPorProfissional || 0).toFixed(1)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 2, mt: 3 }}>
            Atendimentos por Profissional
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Profissional</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Atendimentos</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.grafico?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatarNumero(row.atendimentos)}</TableCell>
                    <TableCell align="right">
                      {dados.total > 0 ? ((row.atendimentos / dados.total) * 100).toFixed(1) : 0}%
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
    graficoLinha: [],
    graficoPizza: [],
    grafico: [],
    total: 0,
    quantidade: 0,
    media: 0,
    topClientes: [],
    totalClientes: 0,
    novosClientes: 0,
    totalAtendimentos: 0,
    mediaDia: 0,
    mediaPorProfissional: 0
  });

  const componentRef = useRef();
  const [isPrintReady, setIsPrintReady] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [tipoRelatorio, periodo, dataInicio, dataFim]);

  useEffect(() => {
    // Verificar se o componente de impressão está pronto
    if (componentRef.current) {
      setIsPrintReady(true);
    }
  }, [dados]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      let response;
      switch (tipoRelatorio) {
        case 'financeiro':
          response = await gerarRelatorioFinanceiro();
          break;
        case 'atendimentos':
          response = await gerarRelatorioAtendimentos();
          break;
        case 'clientes':
          response = await gerarRelatorioClientes();
          break;
        case 'profissionais':
          response = await gerarRelatorioProfissionais();
          break;
        default:
          response = {};
          break;
      }
      
      setDados(prevDados => ({
        ...prevDados,
        ...response
      }));
      
      toast.success('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioFinanceiro = async () => {
    try {
      const response = await api.get('/pagamentos');
      const pagamentos = response.data || [];

      const dataInicioObj = new Date(dataInicio);
      const dataFimObj = new Date(dataFim);
      dataFimObj.setHours(23, 59, 59);

      const pagamentosFiltrados = pagamentos.filter(p => {
        const dataPagamento = new Date(p.data);
        return dataPagamento >= dataInicioObj && dataPagamento <= dataFimObj;
      });

      const dias = {};
      pagamentosFiltrados.forEach(p => {
        const data = new Date(p.data);
        const dia = data.toLocaleDateString('pt-BR');
        
        if (!dias[dia]) {
          dias[dia] = { total: 0, dinheiro: 0, cartao: 0, pix: 0 };
        }
        
        const valor = p.valor || 0;
        dias[dia].total += valor;
        
        const forma = p.formaPagamento?.toLowerCase() || '';
        if (forma === 'dinheiro') {
          dias[dia].dinheiro += valor;
        } else if (forma === 'pix') {
          dias[dia].pix += valor;
        } else if (forma?.includes('cartao')) {
          dias[dia].cartao += valor;
        }
      });

      const dadosGrafico = Object.keys(dias).map(dia => ({
        dia,
        total: dias[dia].total,
        dinheiro: dias[dia].dinheiro,
        cartao: dias[dia].cartao,
        pix: dias[dia].pix,
      }));

      const totalPeriodo = pagamentosFiltrados.reduce((acc, p) => acc + (p.valor || 0), 0);
      
      const formasMap = {};
      pagamentosFiltrados.forEach(p => {
        const forma = p.formaPagamento?.toLowerCase() || 'outros';
        const valor = p.valor || 0;
        
        if (forma === 'dinheiro') {
          formasMap['Dinheiro'] = (formasMap['Dinheiro'] || 0) + valor;
        } else if (forma === 'pix') {
          formasMap['PIX'] = (formasMap['PIX'] || 0) + valor;
        } else if (forma?.includes('cartao')) {
          formasMap['Cartão'] = (formasMap['Cartão'] || 0) + valor;
        } else {
          formasMap['Outros'] = (formasMap['Outros'] || 0) + valor;
        }
      });

      const porForma = Object.keys(formasMap)
        .filter(key => formasMap[key] > 0)
        .map(key => ({ name: key, value: formasMap[key] }));

      return {
        graficoLinha: dadosGrafico,
        graficoPizza: porForma,
        total: totalPeriodo,
        quantidade: pagamentosFiltrados.length,
        media: pagamentosFiltrados.length > 0 ? totalPeriodo / pagamentosFiltrados.length : 0,
      };
    } catch (error) {
      console.error('Erro no relatório financeiro:', error);
      return {
        graficoLinha: [],
        graficoPizza: [],
        total: 0,
        quantidade: 0,
        media: 0,
      };
    }
  };

  const gerarRelatorioAtendimentos = async () => {
    try {
      const [atendimentosRes, servicosRes] = await Promise.all([
        api.get('/atendimentos').catch(() => ({ data: [] })),
        api.get('/servicos').catch(() => ({ data: [] })),
      ]);

      const atendimentos = atendimentosRes.data || [];
      const servicos = servicosRes.data || [];

      const dataInicioObj = new Date(dataInicio);
      const dataFimObj = new Date(dataFim);
      dataFimObj.setHours(23, 59, 59);

      const atendimentosFiltrados = atendimentos.filter(a => {
        const dataAtendimento = new Date(a.data);
        return dataAtendimento >= dataInicioObj && dataAtendimento <= dataFimObj;
      });

      const porServico = {};
      atendimentosFiltrados.forEach(a => {
        if (a.itensServico && a.itensServico.length > 0) {
          a.itensServico.forEach(item => {
            const nomeServico = item.nome || 'Serviço';
            porServico[nomeServico] = (porServico[nomeServico] || 0) + 1;
          });
        } else {
          const servico = servicos.find(s => s.id === a.servicoId);
          const nomeServico = servico?.nome || 'Não identificado';
          porServico[nomeServico] = (porServico[nomeServico] || 0) + 1;
        }
      });

      const dadosGrafico = Object.keys(porServico).map(nome => ({
        name: nome,
        value: porServico[nome],
      }));

      const diffTime = Math.abs(new Date(dataFim) - new Date(dataInicio));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      return {
        grafico: dadosGrafico,
        total: atendimentosFiltrados.length,
        mediaDia: diffDays > 0 ? atendimentosFiltrados.length / diffDays : 0,
      };
    } catch (error) {
      console.error('Erro no relatório de atendimentos:', error);
      return {
        grafico: [],
        total: 0,
        mediaDia: 0,
      };
    }
  };

  const gerarRelatorioClientes = async () => {
    try {
      const [clientesRes, atendimentosRes] = await Promise.all([
        api.get('/clientes').catch(() => ({ data: [] })),
        api.get('/atendimentos').catch(() => ({ data: [] })),
      ]);

      const clientes = clientesRes.data || [];
      const atendimentos = atendimentosRes.data || [];

      const dataInicioObj = new Date(dataInicio);
      const dataFimObj = new Date(dataFim);
      dataFimObj.setHours(23, 59, 59);

      const atendimentosFiltrados = atendimentos.filter(a => {
        const dataAtendimento = new Date(a.data);
        return dataAtendimento >= dataInicioObj && dataAtendimento <= dataFimObj;
      });

      const frequencia = {};
      atendimentosFiltrados.forEach(a => {
        const clienteId = a.clienteId;
        frequencia[clienteId] = (frequencia[clienteId] || 0) + 1;
      });

      const topClientes = Object.keys(frequencia)
        .map(id => {
          const cliente = clientes.find(c => c.id === parseInt(id));
          return {
            cliente: cliente?.nome || 'Cliente não encontrado',
            atendimentos: frequencia[id],
          };
        })
        .sort((a, b) => b.atendimentos - a.atendimentos)
        .slice(0, 5);

      const novosClientes = clientes.filter(c => {
        if (!c.dataCadastro) return false;
        const dataCadastro = new Date(c.dataCadastro);
        return dataCadastro >= dataInicioObj && dataCadastro <= dataFimObj;
      }).length;

      return {
        topClientes,
        totalClientes: clientes.length,
        novosClientes,
        totalAtendimentos: atendimentosFiltrados.length,
      };
    } catch (error) {
      console.error('Erro no relatório de clientes:', error);
      return {
        topClientes: [],
        totalClientes: 0,
        novosClientes: 0,
        totalAtendimentos: 0,
      };
    }
  };

  const gerarRelatorioProfissionais = async () => {
    try {
      const [profissionaisRes, atendimentosRes] = await Promise.all([
        api.get('/profissionais').catch(() => ({ data: [] })),
        api.get('/atendimentos').catch(() => ({ data: [] })),
      ]);

      const profissionais = profissionaisRes.data || [];
      const atendimentos = atendimentosRes.data || [];

      const dataInicioObj = new Date(dataInicio);
      const dataFimObj = new Date(dataFim);
      dataFimObj.setHours(23, 59, 59);

      const atendimentosFiltrados = atendimentos.filter(a => {
        const dataAtendimento = new Date(a.data);
        return dataAtendimento >= dataInicioObj && dataAtendimento <= dataFimObj;
      });

      const desempenho = {};
      atendimentosFiltrados.forEach(a => {
        const profissionalId = a.profissionalId;
        desempenho[profissionalId] = (desempenho[profissionalId] || 0) + 1;
      });

      const dadosGrafico = Object.keys(desempenho).map(id => {
        const profissional = profissionais.find(p => p.id === parseInt(id));
        return {
          name: profissional?.nome?.split(' ')[0] || 'Profissional',
          atendimentos: desempenho[id],
        };
      });

      return {
        grafico: dadosGrafico,
        total: atendimentosFiltrados.length,
        mediaPorProfissional: profissionais.length > 0 
          ? atendimentosFiltrados.length / profissionais.length 
          : 0,
      };
    } catch (error) {
      console.error('Erro no relatório de profissionais:', error);
      return {
        grafico: [],
        total: 0,
        mediaPorProfissional: 0,
      };
    }
  };

  // Função de impressão corrigida
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

  const handleExportPDF = () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf' });
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Função para adicionar cabeçalho em cada página
      const addHeader = () => {
        doc.setFillColor(156, 39, 176);
        doc.rect(0, 0, pageWidth, 10, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('Beauty Pro Salon - Sistema de Gerenciamento', 10, 6);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 60, 6);
      };

      // Adicionar cabeçalho
      addHeader();
      
      // Título principal
      doc.setTextColor(156, 39, 176);
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      doc.text('Beauty Pro', 105, 25, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      const tituloRelatorio = tipoRelatorio === 'financeiro' ? 'Relatório Financeiro' :
                            tipoRelatorio === 'atendimentos' ? 'Relatório de Atendimentos' :
                            tipoRelatorio === 'clientes' ? 'Relatório de Clientes' :
                            'Relatório de Profissionais';
      doc.text(tituloRelatorio, 105, 35, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')}`, 105, 42, { align: 'center' });
      
      let yPos = 50;

      if (tipoRelatorio === 'financeiro') {
        // Cards de resumo
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 60, 20, 2, 2, 'F');
        doc.roundedRect(78, yPos, 60, 20, 2, 2, 'F');
        doc.roundedRect(142, yPos, 60, 20, 2, 2, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Total do Período', 24, yPos + 5);
        doc.text('Quantidade', 88, yPos + 5);
        doc.text('Ticket Médio', 152, yPos + 5);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(76, 175, 80);
        doc.text(`R$ ${(dados.total || 0).toFixed(2)}`, 24, yPos + 15);
        
        doc.setTextColor(156, 39, 176);
        doc.text(`${dados.quantidade || 0}`, 88, yPos + 15);
        
        doc.setTextColor(255, 64, 129);
        doc.text(`R$ ${(dados.media || 0).toFixed(2)}`, 152, yPos + 15);
        
        yPos += 30;

        // Tabela de pagamentos
        doc.setFontSize(12);
        doc.setTextColor(156, 39, 176);
        doc.setFont(undefined, 'bold');
        doc.text('Detalhamento por Dia', 14, yPos);
        
        yPos += 5;
        
        doc.autoTable({
          startY: yPos,
          head: [['Data', 'Dinheiro (R$)', 'Cartão (R$)', 'PIX (R$)', 'Total (R$)']],
          body: dados.graficoLinha?.map(row => [
            row.dia,
            row.dinheiro.toFixed(2),
            row.cartao.toFixed(2),
            row.pix.toFixed(2),
            row.total.toFixed(2),
          ]),
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176], textColor: 255 },
          styles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Verificar se precisa de nova página
        if (yPos > pageHeight - 40) {
          doc.addPage();
          addHeader();
          yPos = 20;
        }

        // Tabela de formas de pagamento
        doc.setFontSize(12);
        doc.setTextColor(156, 39, 176);
        doc.setFont(undefined, 'bold');
        doc.text('Resumo por Forma de Pagamento', 14, yPos);
        
        yPos += 5;
        
        doc.autoTable({
          startY: yPos,
          head: [['Forma de Pagamento', 'Valor (R$)', '%']],
          body: dados.graficoPizza?.map(row => [
            row.name,
            row.value.toFixed(2),
            dados.total > 0 ? ((row.value / dados.total) * 100).toFixed(1) : '0',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [255, 64, 129], textColor: 255 },
          styles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
        });
      } else if (tipoRelatorio === 'atendimentos') {
        // Cards de resumo
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 85, 25, 2, 2, 'F');
        doc.roundedRect(107, yPos, 85, 25, 2, 2, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Total de Atendimentos', 24, yPos + 6);
        doc.text('Média por Dia', 117, yPos + 6);
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(156, 39, 176);
        doc.text(`${dados.total || 0}`, 24, yPos + 18);
        
        doc.setTextColor(255, 64, 129);
        doc.text(`${(dados.mediaDia || 0).toFixed(1)}`, 117, yPos + 18);
        
        yPos += 40;

        // Tabela de atendimentos por serviço
        doc.setFontSize(12);
        doc.setTextColor(156, 39, 176);
        doc.setFont(undefined, 'bold');
        doc.text('Atendimentos por Serviço', 14, yPos);
        
        yPos += 5;
        
        doc.autoTable({
          startY: yPos,
          head: [['Serviço', 'Quantidade', '%']],
          body: dados.grafico?.map(row => [
            row.name,
            row.value,
            dados.total > 0 ? ((row.value / dados.total) * 100).toFixed(1) : '0',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176], textColor: 255 },
          styles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
        });
      } else if (tipoRelatorio === 'clientes') {
        // Cards de resumo
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 55, 20, 2, 2, 'F');
        doc.roundedRect(73, yPos, 55, 20, 2, 2, 'F');
        doc.roundedRect(132, yPos, 55, 20, 2, 2, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('Total Clientes', 19, yPos + 5);
        doc.text('Novos Clientes', 78, yPos + 5);
        doc.text('Atendimentos', 137, yPos + 5);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(156, 39, 176);
        doc.text(`${dados.totalClientes || 0}`, 19, yPos + 15);
        
        doc.setTextColor(76, 175, 80);
        doc.text(`${dados.novosClientes || 0}`, 78, yPos + 15);
        
        doc.setTextColor(255, 64, 129);
        doc.text(`${dados.totalAtendimentos || 0}`, 137, yPos + 15);
        
        yPos += 30;

        // Tabela de top clientes
        doc.setFontSize(12);
        doc.setTextColor(156, 39, 176);
        doc.setFont(undefined, 'bold');
        doc.text('Top 5 Clientes por Atendimentos', 14, yPos);
        
        yPos += 5;
        
        doc.autoTable({
          startY: yPos,
          head: [['Cliente', 'Atendimentos', '%']],
          body: dados.topClientes?.map(cliente => [
            cliente.cliente,
            cliente.atendimentos,
            dados.totalAtendimentos > 0 
              ? ((cliente.atendimentos / dados.totalAtendimentos) * 100).toFixed(1)
              : '0',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176], textColor: 255 },
          styles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
        });
      } else if (tipoRelatorio === 'profissionais') {
        // Cards de resumo
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, yPos, 85, 25, 2, 2, 'F');
        doc.roundedRect(107, yPos, 85, 25, 2, 2, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Total de Atendimentos', 24, yPos + 6);
        doc.text('Média por Profissional', 117, yPos + 6);
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(156, 39, 176);
        doc.text(`${dados.total || 0}`, 24, yPos + 18);
        
        doc.setTextColor(255, 64, 129);
        doc.text(`${(dados.mediaPorProfissional || 0).toFixed(1)}`, 117, yPos + 18);
        
        yPos += 40;

        // Tabela de profissionais
        doc.setFontSize(12);
        doc.setTextColor(156, 39, 176);
        doc.setFont(undefined, 'bold');
        doc.text('Atendimentos por Profissional', 14, yPos);
        
        yPos += 5;
        
        doc.autoTable({
          startY: yPos,
          head: [['Profissional', 'Atendimentos', '%']],
          body: dados.grafico?.map(row => [
            row.name,
            row.atendimentos,
            dados.total > 0 ? ((row.atendimentos / dados.total) * 100).toFixed(1) : '0',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176], textColor: 255 },
          styles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
        });
      }

      // Adicionar rodapé em todas as páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, pageHeight - 10);
        doc.text('Beauty Pro Salon - Sistema de Gerenciamento', 10, pageHeight - 10);
      }
      
      doc.save(`relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF gerado com sucesso!', { id: 'pdf' });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF', { id: 'pdf' });
    }
  };

  const handleExportExcel = () => {
    try {
      toast.loading('Gerando Excel...', { id: 'excel' });
      
      let worksheetData = [];
      
      // Cabeçalho do relatório
      worksheetData.push(['Beauty Pro Salon']);
      worksheetData.push([`Relatório ${tipoRelatorio}`]);
      worksheetData.push([`Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')}`]);
      worksheetData.push([`Gerado em: ${new Date().toLocaleString('pt-BR')}`]);
      worksheetData.push([]);
      
      if (tipoRelatorio === 'financeiro') {
        worksheetData.push(['RESUMO FINANCEIRO']);
        worksheetData.push(['Total do Período', `R$ ${(dados.total || 0).toFixed(2)}`]);
        worksheetData.push(['Quantidade de Pagamentos', dados.quantidade || 0]);
        worksheetData.push(['Ticket Médio', `R$ ${(dados.media || 0).toFixed(2)}`]);
        worksheetData.push([]);
        worksheetData.push(['DETALHAMENTO POR DIA']);
        worksheetData.push(['Data', 'Dinheiro', 'Cartão', 'PIX', 'Total']);
        dados.graficoLinha?.forEach(row => {
          worksheetData.push([
            row.dia,
            row.dinheiro,
            row.cartao,
            row.pix,
            row.total,
          ]);
        });
        worksheetData.push([]);
        worksheetData.push(['RESUMO POR FORMA DE PAGAMENTO']);
        worksheetData.push(['Forma', 'Valor', '%']);
        dados.graficoPizza?.forEach(row => {
          worksheetData.push([
            row.name,
            row.value,
            dados.total > 0 ? ((row.value / dados.total) * 100).toFixed(1) : '0',
          ]);
        });
      } else if (tipoRelatorio === 'atendimentos') {
        worksheetData.push(['RESUMO DE ATENDIMENTOS']);
        worksheetData.push(['Total de Atendimentos', dados.total || 0]);
        worksheetData.push(['Média por Dia', (dados.mediaDia || 0).toFixed(1)]);
        worksheetData.push([]);
        worksheetData.push(['ATENDIMENTOS POR SERVIÇO']);
        worksheetData.push(['Serviço', 'Quantidade', '%']);
        dados.grafico?.forEach(row => {
          worksheetData.push([
            row.name,
            row.value,
            dados.total > 0 ? ((row.value / dados.total) * 100).toFixed(1) : '0',
          ]);
        });
      } else if (tipoRelatorio === 'clientes') {
        worksheetData.push(['RESUMO DE CLIENTES']);
        worksheetData.push(['Total de Clientes', dados.totalClientes || 0]);
        worksheetData.push(['Novos Clientes', dados.novosClientes || 0]);
        worksheetData.push(['Atendimentos no Período', dados.totalAtendimentos || 0]);
        worksheetData.push([]);
        worksheetData.push(['TOP 5 CLIENTES']);
        worksheetData.push(['Cliente', 'Atendimentos', '%']);
        dados.topClientes?.forEach(cliente => {
          worksheetData.push([
            cliente.cliente,
            cliente.atendimentos,
            dados.totalAtendimentos > 0 
              ? ((cliente.atendimentos / dados.totalAtendimentos) * 100).toFixed(1)
              : '0',
          ]);
        });
      } else if (tipoRelatorio === 'profissionais') {
        worksheetData.push(['RESUMO DE PROFISSIONAIS']);
        worksheetData.push(['Total de Atendimentos', dados.total || 0]);
        worksheetData.push(['Média por Profissional', (dados.mediaPorProfissional || 0).toFixed(1)]);
        worksheetData.push([]);
        worksheetData.push(['ATENDIMENTOS POR PROFISSIONAL']);
        worksheetData.push(['Profissional', 'Atendimentos', '%']);
        dados.grafico?.forEach(row => {
          worksheetData.push([
            row.name,
            row.atendimentos,
            dados.total > 0 ? ((row.atendimentos / dados.total) * 100).toFixed(1) : '0',
          ]);
        });
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Estilizar células
      const wscols = [
        { wch: 30 }, // Coluna A
        { wch: 15 }, // Coluna B
        { wch: 10 }, // Coluna C
      ];
      ws['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
      XLSX.writeFile(wb, `relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Excel gerado com sucesso!', { id: 'excel' });
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      toast.error('Erro ao gerar Excel', { id: 'excel' });
    }
  };

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
      resumo: {
        total: dados.total,
        quantidade: dados.quantidade || dados.total,
        media: dados.media || dados.mediaDia || 0,
      }
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
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
                      <MenuItem value="financeiro">Financeiro</MenuItem>
                      <MenuItem value="atendimentos">Atendimentos</MenuItem>
                      <MenuItem value="clientes">Clientes</MenuItem>
                      <MenuItem value="profissionais">Profissionais</MenuItem>
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

        {/* Cards de resumo */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card sx={{ bgcolor: '#f8f0fa' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total {tipoRelatorio === 'financeiro' ? 'Faturado' : 'Atendimentos'}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                      {tipoRelatorio === 'financeiro' 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.total || 0)
                        : dados.total || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card sx={{ bgcolor: '#f8f0fa' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Quantidade
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff4081' }}>
                      {new Intl.NumberFormat('pt-BR').format(dados.quantidade || dados.total || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card sx={{ bgcolor: '#f8f0fa' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {tipoRelatorio === 'financeiro' ? 'Ticket Médio' : 'Média por Dia'}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {tipoRelatorio === 'financeiro'
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.media || 0)
                        : (dados.mediaDia || 0).toFixed(1)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>

        {/* Gráficos */}
        {tipoRelatorio === 'financeiro' && (
          <>
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Evolução Financeira
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dados.graficoLinha}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="dia" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                          />
                          <Area type="monotone" dataKey="dinheiro" stackId="1" stroke="#4caf50" fill="#4caf50" />
                          <Area type="monotone" dataKey="cartao" stackId="1" stroke="#ff4081" fill="#ff4081" />
                          <Area type="monotone" dataKey="pix" stackId="1" stroke="#9c27b0" fill="#9c27b0" />
                        </AreaChart>
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
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Formas de Pagamento
                    </Typography>
                    <Box sx={{ height: 300 }}>
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
                          <Tooltip 
                            formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </>
        )}

        {tipoRelatorio !== 'financeiro' && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Distribuição
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dados.grafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#9c27b0" />
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
    </Box>
  );
}

export default ModernRelatorios;