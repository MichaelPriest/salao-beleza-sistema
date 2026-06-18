// src/pages/SaasRelatorios.js - VERSÃO MELHORADA
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Payments as PaymentsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, STATUS_ASSINATURA, saasService } from '../services/saasService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const formatCurrency = (value, currency = 'BRL') => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
};

const formatDateFull = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(value));
};

function SaasRelatorios() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [periodoFiltro, setPeriodoFiltro] = useState('todos');

  const carregar = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [empresasData, assinaturasData, faturasData, pagamentosData, planosData] = await Promise.all([
        firebaseService.getAll('empresas').catch(() => []),
        firebaseService.getAll('assinaturas').catch(() => []),
        firebaseService.getAll('faturas_saas').catch(() => []),
        firebaseService.getAll('pagamentos_saas').catch(() => []),
        saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO)),
      ]);
      setEmpresas(empresasData || []);
      setAssinaturas(assinaturasData || []);
      setFaturas(faturasData || []);
      setPagamentos(pagamentosData || []);
      setPlanos(planosData || []);
      
      if (!silent) toast.success('Relatórios carregados!');
    } catch (error) {
      console.error('Erro ao carregar relatórios SaaS:', error);
      if (!silent) toast.error(error.message || 'Erro ao carregar relatórios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const planoPorId = useMemo(() => 
    planos.reduce((acc, plano) => ({ ...acc, [plano.id]: plano }), {}), 
  [planos]);

  const metricas = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    const assinaturasAtivas = assinaturas.filter(item => 
      [STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(item.status)
    );
    
    const assinaturasTrial = assinaturas.filter(item => 
      item.status === STATUS_ASSINATURA.TRIAL
    );
    
    const mrr = assinaturasAtivas.reduce((total, assinatura) => {
      const plano = planoPorId[assinatura.planoId] || PLANOS_PADRAO[assinatura.planoId];
      return total + Number(assinatura.valorMensal || plano?.precoMensal || 0);
    }, 0);
    
    const recebidoMes = pagamentos
      .filter(p => {
        const data = new Date(p.pagoEm || p.createdAt);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
      })
      .reduce((total, p) => total + Number(p.valor || 0), 0);
    
    const recebidoTotal = pagamentos.reduce((total, p) => total + Number(p.valor || 0), 0);
    
    const aberto = faturas
      .filter(f => ['aberta', 'pendente', 'vencida'].includes(f.status))
      .reduce((total, f) => total + Number(f.valor || 0), 0);
    
    const vencidas = faturas.filter(f => 
      ['vencida', 'overdue'].includes(f.status)
    );
    
    const inadimplentes = new Set(vencidas.map(f => f.empresaId)).size;
    
    const taxaConversao = assinaturas.length > 0 
      ? ((assinaturasAtivas.length / assinaturas.length) * 100).toFixed(1) 
      : 0;
    
    const ticketMedio = assinaturasAtivas.length > 0 
      ? mrr / assinaturasAtivas.length 
      : 0;
    
    const inadimplenciaTaxa = faturas.length > 0 
      ? ((vencidas.length / faturas.length) * 100).toFixed(1) 
      : 0;
    
    return {
      totalEmpresas: empresas.length,
      empresasAtivas: empresas.filter(e => e.status === 'ativa' || !e.status).length,
      totalAssinaturas: assinaturas.length,
      assinaturasAtivas: assinaturasAtivas.length,
      assinaturasTrial: assinaturasTrial.length,
      mrr,
      recebidoMes,
      recebidoTotal,
      aberto,
      vencidas: vencidas.length,
      inadimplentes,
      taxaConversao,
      ticketMedio,
      inadimplenciaTaxa,
    };
  }, [assinaturas, faturas, pagamentos, planoPorId, empresas]);

  const resumoPorPlano = useMemo(() => 
    planos.map((plano) => {
      const assinaturasPlano = assinaturas.filter(a => a.planoId === plano.id);
      const ativas = assinaturasPlano.filter(a => 
        [STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(a.status)
      );
      const empresasPlano = new Set(assinaturasPlano.map(a => a.empresaId));
      const receitaPlano = ativas.reduce((total, a) => 
        total + Number(a.valorMensal || plano.precoMensal || 0), 0
      );
      return { 
        plano, 
        total: assinaturasPlano.length, 
        ativas: ativas.length,
        empresas: empresasPlano.size, 
        receitaPlano 
      };
    }).sort((a, b) => b.receitaPlano - a.receitaPlano),
  [assinaturas, planos]);

  const getLinhasExportacao = () => 
    resumoPorPlano.map(({ plano, empresas: totalEmpresas, total: totalAssinaturas, ativas, receitaPlano }) => ({
      plano: plano.nome,
      tipo: plano.tipo || 'individual',
      empresas: totalEmpresas,
      assinaturas: totalAssinaturas,
      ativas,
      mrr: receitaPlano,
      ticketMedio: ativas > 0 ? receitaPlano / ativas : 0,
    }));

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const dataGeracao = new Date().toLocaleString('pt-BR');
    
    // Cabeçalho
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório SaaS - BeautyPro', 14, 14);
    
    doc.setTextColor(90, 90, 90);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${dataGeracao}`, 14, 26);
    
    // Métricas principais
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('Indicadores Principais', 14, 36);
    
    doc.autoTable({
      startY: 42,
      head: [['Indicador', 'Valor', 'Observação']],
      body: [
        ['Empresas', metricas.totalEmpresas, `${metricas.empresasAtivas} ativas`],
        ['Assinaturas Ativas', metricas.assinaturasAtivas, `${metricas.assinaturasTrial} em trial`],
        ['MRR Estimado', formatCurrency(metricas.mrr), 'Receita recorrente mensal'],
        ['Recebido (Mês)', formatCurrency(metricas.recebidoMes), 'Pagamentos confirmados'],
        ['Em Aberto', formatCurrency(metricas.aberto), `${metricas.vencidas} vencidas`],
        ['Inadimplentes', metricas.inadimplentes, `${metricas.inadimplenciaTaxa}% das faturas`],
        ['Taxa de Conversão', `${metricas.taxaConversao}%`, 'Assinaturas ativas/total'],
        ['Ticket Médio', formatCurrency(metricas.ticketMedio), 'Por assinatura ativa'],
      ],
      headStyles: { fillColor: [102, 126, 234], textColor: 255 },
    });
    
    // Resumo por plano
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    const planosY = doc.lastAutoTable.finalY + 10;
    doc.text('Receita por Plano', 14, planosY);
    
    doc.autoTable({
      startY: planosY + 6,
      head: [['Plano', 'Tipo', 'Empresas', 'Assinaturas', 'Ativas', 'MRR']],
      body: getLinhasExportacao().map(l => [
        l.plano, l.tipo, l.empresas, l.assinaturas, l.ativas, formatCurrency(l.mrr)
      ]),
      headStyles: { fillColor: [102, 126, 234], textColor: 255 },
    });
    
    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`BeautyPro SaaS - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    doc.save(`relatorio_saas_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('📄 PDF exportado com sucesso!');
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const resumo = [
      ['RELATÓRIO SAAS - BEAUTYPRO'],
      [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
      [],
      ['INDICADORES PRINCIPAIS'],
      ['Indicador', 'Valor', 'Observação'],
      ['Empresas', metricas.totalEmpresas, `${metricas.empresasAtivas} ativas`],
      ['Assinaturas Ativas', metricas.assinaturasAtivas, `${metricas.assinaturasTrial} em trial`],
      ['MRR Estimado', metricas.mrr, 'Receita recorrente mensal'],
      ['Recebido (Mês)', metricas.recebidoMes, 'Pagamentos confirmados'],
      ['Em Aberto', metricas.aberto, `${metricas.vencidas} vencidas`],
      ['Inadimplentes', metricas.inadimplentes, `${metricas.inadimplenciaTaxa}% das faturas`],
      ['Taxa de Conversão', `${metricas.taxaConversao}%`, 'Assinaturas ativas/total'],
      ['Ticket Médio', metricas.ticketMedio, 'Por assinatura ativa'],
      [],
      ['RECEITA POR PLANO'],
      ['Plano', 'Tipo', 'Empresas', 'Assinaturas', 'Ativas', 'MRR', 'Ticket Médio'],
      ...getLinhasExportacao().map(l => [
        l.plano, l.tipo, l.empresas, l.assinaturas, l.ativas, l.mrr, l.ticketMedio
      ]),
    ];
    
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), 'Relatório SaaS');
    XLSX.writeFile(wb, `relatorio_saas_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('📊 Excel exportado com sucesso!');
  };

  const handleExportJSON = () => {
    const dados = {
      geradoEm: new Date().toISOString(),
      metricas,
      planos: getLinhasExportacao(),
      totalFaturas: faturas.length,
      totalPagamentos: pagamentos.length,
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_saas_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📋 JSON exportado com sucesso!');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary">Carregando relatórios SaaS...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9ff', minHeight: '100vh' }}>
      {/* Header */}
      <Card sx={{ mb: 4, boxShadow: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AssessmentIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                    Relatórios SaaS
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Acompanhe MRR, empresas, assinaturas e evolução da plataforma
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                <Button variant="contained" startIcon={<PdfIcon />} onClick={handleExportPDF}
                  sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, fontWeight: 600 }}>
                  PDF
                </Button>
                <Button variant="contained" startIcon={<ExcelIcon />} onClick={handleExportExcel}
                  sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 600 }}>
                  Excel
                </Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportJSON}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' }, fontWeight: 600 }}>
                  JSON
                </Button>
                <IconButton onClick={() => carregar(true)} disabled={refreshing} sx={{ color: 'white' }}>
                  <RefreshIcon />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cards de Métricas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Empresas', value: metricas.totalEmpresas, icon: <BusinessIcon />, color: 'primary', subtitle: `${metricas.empresasAtivas} ativas` },
          { label: 'Assinaturas Ativas', value: metricas.assinaturasAtivas, icon: <WorkspacePremiumIcon />, color: 'success', subtitle: `${metricas.assinaturasTrial} em trial` },
          { label: 'MRR', value: formatCurrency(metricas.mrr), icon: <TrendingUpIcon />, color: 'info', subtitle: `Ticket: ${formatCurrency(metricas.ticketMedio)}` },
          { label: 'Recebido (Mês)', value: formatCurrency(metricas.recebidoMes), icon: <PaymentsIcon />, color: 'success', subtitle: `Total: ${formatCurrency(metricas.recebidoTotal)}` },
          { label: 'Em Aberto', value: formatCurrency(metricas.aberto), icon: <WarningIcon />, color: 'warning', subtitle: `${metricas.vencidas} vencidas` },
          { label: 'Inadimplência', value: `${metricas.inadimplenciaTaxa}%`, icon: <TrendingDownIcon />, color: 'error', subtitle: `${metricas.inadimplentes} empresas` },
          { label: 'Conversão', value: `${metricas.taxaConversao}%`, icon: <CheckCircleIcon />, color: 'primary', subtitle: 'Assinaturas/total' },
          { label: 'Planos', value: planos.length, icon: <WorkspacePremiumIcon />, color: 'secondary', subtitle: 'Planos ativos' },
        ].map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              boxShadow: 2,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {metric.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {metric.subtitle}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${metric.color}.light`, color: `${metric.color}.main` }}>
                    {metric.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabelas */}
      <Grid container spacing={3}>
        {/* Receita por Plano */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Receita por Plano
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: 700 }}>Plano</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Empresas</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Total</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Ativas</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">MRR</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resumoPorPlano.map(({ plano, empresas: totalEmpresas, total: totalAssinaturas, ativas, receitaPlano }) => (
                      <TableRow key={plano.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.light, fontSize: 14 }}>
                              {plano.nome?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{plano.nome}</Typography>
                              <Typography variant="caption" color="text.secondary">{plano.id}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={plano.tipo || 'individual'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="center">{totalEmpresas}</TableCell>
                        <TableCell align="center">{totalAssinaturas}</TableCell>
                        <TableCell align="center">
                          <Chip label={ativas} size="small" color="success" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatCurrency(receitaPlano)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Últimas Faturas */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Últimas Faturas
              </Typography>
              {faturas.length === 0 ? (
                <Alert severity="info">Nenhuma fatura SaaS gerada ainda.</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 700 }}>Empresa</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...faturas]
                        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                        .slice(0, 8)
                        .map((fatura) => {
                          const empresa = empresas.find(e => e.id === fatura.empresaId);
                          return (
                            <TableRow key={fatura.id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {empresa?.nome || fatura.empresaId?.slice(0, 8)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Venc: {formatDate(fatura.vencimentoEm || fatura.vencimento)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  size="small" 
                                  label={fatura.status || 'aberta'} 
                                  color={
                                    fatura.status === 'paga' ? 'success' :
                                    fatura.status === 'vencida' ? 'error' : 'warning'
                                  }
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(fatura.valor)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SaasRelatorios;
