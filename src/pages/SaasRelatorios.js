// src/pages/SaasRelatorios.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
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
import { Assessment as AssessmentIcon, Business as BusinessIcon, WorkspacePremium as WorkspacePremiumIcon } from '@mui/icons-material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, STATUS_ASSINATURA, saasService } from '../services/saasService';
import { ReportHeader, ReportMetricCard, ReportSectionCard, reportPageSx, reportTableSx } from '../components/ReportDesign';

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

  if (loading) return <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={reportPageSx}>
      <ReportHeader
        title="Relatórios do SaaS"
        subtitle="Acompanhe MRR, empresas, assinaturas, faturas em aberto e evolução comercial da plataforma."
        icon={<AssessmentIcon />}
        badge="Visão plataforma"
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
