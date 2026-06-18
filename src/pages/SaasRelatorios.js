// src/pages/SaasRelatorios.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Assessment as AssessmentIcon, Business as BusinessIcon, WorkspacePremium as WorkspacePremiumIcon, Print as PrintIcon, PictureAsPdf as PdfIcon, TableChart as ExcelIcon, Download as DownloadIcon } from '@mui/icons-material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, STATUS_ASSINATURA, saasService } from '../services/saasService';
import { ReportHeader, ReportMetricCard, ReportSectionCard, reportPageSx, reportTableSx } from '../components/ReportDesign';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const formatCurrency = (value, currency = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));
const formatDate = (value) => (value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : '-');

function SaasRelatorios() {
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [planos, setPlanos] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const [empresasData, assinaturasData, faturasData, pagamentosData, planosData] = await Promise.all([
          firebaseService.getAll('empresas').catch(() => []),
          firebaseService.getAll('assinaturas').catch(() => []),
          firebaseService.getAll('faturas_saas').catch(() => []),
          firebaseService.getAll('pagamentos_saas').catch(() => []),
          saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO)),
        ]);
        setEmpresas(empresasData);
        setAssinaturas(assinaturasData);
        setFaturas(faturasData);
        setPagamentos(pagamentosData);
        setPlanos(planosData);
      } catch (error) {
        console.error('Erro ao carregar relatórios SaaS:', error);
        toast.error(error.message || 'Erro ao carregar relatórios.');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const planoPorId = useMemo(() => planos.reduce((acc, plano) => ({ ...acc, [plano.id]: plano }), {}), [planos]);

  const metricas = useMemo(() => {
    const assinaturasAtivas = assinaturas.filter((item) => [STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(item.status));
    const mrr = assinaturasAtivas.reduce((total, assinatura) => {
      const plano = planoPorId[assinatura.planoId] || PLANOS_PADRAO[assinatura.planoId];
      return total + Number(assinatura.valorMensal || plano?.precoMensal || 0);
    }, 0);
    const recebido = pagamentos.reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0);
    const aberto = faturas.filter((fatura) => ['aberta', 'pendente', 'vencida'].includes(fatura.status)).reduce((total, fatura) => total + Number(fatura.valor || 0), 0);
    const inadimplentes = new Set(faturas.filter((fatura) => ['vencida', 'overdue'].includes(fatura.status)).map((fatura) => fatura.empresaId)).size;
    return { assinaturasAtivas: assinaturasAtivas.length, mrr, recebido, aberto, inadimplentes };
  }, [assinaturas, faturas, pagamentos, planoPorId]);

  const resumoPorPlano = useMemo(() => planos.map((plano) => {
    const assinaturasPlano = assinaturas.filter((assinatura) => assinatura.planoId === plano.id);
    const empresasPlano = new Set(assinaturasPlano.map((assinatura) => assinatura.empresaId));
    const receitaPlano = assinaturasPlano.reduce((total, assinatura) => total + Number(assinatura.valorMensal || plano.precoMensal || 0), 0);
    return { plano, assinaturas: assinaturasPlano.length, empresas: empresasPlano.size, receitaPlano };
  }), [assinaturas, planos]);

  const getLinhasExportacao = () => resumoPorPlano.map(({ plano, empresas: totalEmpresas, assinaturas: totalAssinaturas, receitaPlano }) => ({
    plano: plano.nome,
    empresas: totalEmpresas,
    assinaturas: totalAssinaturas,
    mrr: receitaPlano,
  }));

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFillColor(156, 39, 176);
    doc.rect(0, 0, 210, 14, 'F');
    doc.setTextColor(156, 39, 176);
    doc.setFontSize(18);
    doc.text('Relatórios do SaaS', 14, 28);
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 36);
    doc.autoTable({
      startY: 44,
      head: [['Indicador', 'Valor']],
      body: [
        ['Assinaturas ativas', metricas.assinaturasAtivas],
        ['MRR estimado', formatCurrency(metricas.mrr)],
        ['Em aberto', formatCurrency(metricas.aberto)],
        ['Empresas inadimplentes', metricas.inadimplentes],
      ],
      headStyles: { fillColor: [156, 39, 176] },
    });
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Plano', 'Empresas', 'Assinaturas', 'MRR']],
      body: getLinhasExportacao().map((linha) => [linha.plano, linha.empresas, linha.assinaturas, formatCurrency(linha.mrr)]),
      headStyles: { fillColor: [156, 39, 176] },
    });
    doc.save(`relatorio_saas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const resumo = [
      ['Relatórios do SaaS'],
      [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
      [],
      ['Indicador', 'Valor'],
      ['Assinaturas ativas', metricas.assinaturasAtivas],
      ['MRR estimado', metricas.mrr],
      ['Em aberto', metricas.aberto],
      ['Empresas inadimplentes', metricas.inadimplentes],
      [],
      ['Plano', 'Empresas', 'Assinaturas', 'MRR'],
      ...getLinhasExportacao().map((linha) => [linha.plano, linha.empresas, linha.assinaturas, linha.mrr]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), 'SaaS');
    XLSX.writeFile(wb, `relatorio_saas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify({ metricas, planos: getLinhasExportacao(), faturas }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_saas_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={reportPageSx}>
      <ReportHeader
        title="Relatórios do SaaS"
        subtitle="Acompanhe MRR, empresas, assinaturas, faturas em aberto e evolução comercial da plataforma."
        icon={<AssessmentIcon />}
        badge="Visão plataforma"
        actions={<>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}>Imprimir</Button>
          <Button variant="contained" color="error" startIcon={<PdfIcon />} onClick={handleExportPDF}>PDF</Button>
          <Button variant="contained" color="success" startIcon={<ExcelIcon />} onClick={handleExportExcel}>Excel</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportJSON} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)' }}>JSON</Button>
        </>}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}><ReportMetricCard icon={<WorkspacePremiumIcon />} title="Assinaturas ativas" value={metricas.assinaturasAtivas} helper={`${assinaturas.length} contratos cadastrados`} /></Grid>
        <Grid item xs={12} md={3}><ReportMetricCard icon={<ReceiptLongIcon />} title="MRR estimado" value={formatCurrency(metricas.mrr)} helper="Receita recorrente mensal" color="success" /></Grid>
        <Grid item xs={12} md={3}><ReportMetricCard icon={<ReceiptLongIcon />} title="Em aberto" value={formatCurrency(metricas.aberto)} helper="Faturas pendentes/vencidas" color="warning" /></Grid>
        <Grid item xs={12} md={3}><ReportMetricCard icon={<BusinessIcon />} title="Empresas inadimplentes" value={metricas.inadimplentes} helper={`${empresas.length} empresas totais`} color="error" /></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ReportSectionCard title="Receita por plano" subtitle="Distribuição de contratos e MRR por plano comercial.">
              <TableContainer>
                <Table size="small" sx={reportTableSx}>
                  <TableHead><TableRow><TableCell>Plano</TableCell><TableCell>Empresas</TableCell><TableCell>Assinaturas</TableCell><TableCell align="right">MRR</TableCell></TableRow></TableHead>
                  <TableBody>
                    {resumoPorPlano.map(({ plano, empresas: totalEmpresas, assinaturas: totalAssinaturas, receitaPlano }) => (
                      <TableRow key={plano.id}>
                        <TableCell><Typography fontWeight={700}>{plano.nome}</Typography><Typography variant="caption" color="text.secondary">{plano.id}</Typography></TableCell>
                        <TableCell>{totalEmpresas}</TableCell>
                        <TableCell>{totalAssinaturas}</TableCell>
                        <TableCell align="right">{formatCurrency(receitaPlano)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
          </ReportSectionCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <ReportSectionCard title="Últimas faturas" subtitle="Acompanhamento operacional dos recebíveis SaaS.">
              {faturas.length === 0 ? <Alert severity="info">Nenhuma fatura SaaS gerada ainda.</Alert> : (
                <TableContainer>
                  <Table size="small" sx={reportTableSx}>
                    <TableHead><TableRow><TableCell>Empresa</TableCell><TableCell>Vencimento</TableCell><TableCell>Status</TableCell><TableCell align="right">Valor</TableCell></TableRow></TableHead>
                    <TableBody>
                      {[...faturas].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 10).map((fatura) => (
                        <TableRow key={fatura.id}>
                          <TableCell>{empresas.find((empresa) => empresa.id === fatura.empresaId)?.nome || fatura.empresaId}</TableCell>
                          <TableCell>{formatDate(fatura.vencimento)}</TableCell>
                          <TableCell><Chip size="small" label={fatura.status || 'aberta'} /></TableCell>
                          <TableCell align="right">{formatCurrency(fatura.valor)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
          </ReportSectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SaasRelatorios;
