// src/pages/ClienteHistorico.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  History as HistoryIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { useAuthCliente } from '../contexts/AuthClienteContext';
import { ReportHeader, ReportMetricCard, ReportSectionCard, reportPageSx, reportTableSx } from '../components/ReportDesign';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

function ClienteHistorico() {
  const { cliente } = useAuthCliente();
  const [loading, setLoading] = useState(true);
  const [atendimentos, setAtendimentos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    totalAtendimentos: 0,
    totalGasto: 0,
    servicosFavoritos: [],
  });

  const getClienteIds = () => Array.from(new Set([
    cliente?.id,
    cliente?.authUid,
    cliente?.googleUid,
  ].filter(Boolean)));

  useEffect(() => {
    if (cliente) {
      carregarHistorico();
    }
  }, [cliente]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);

      const idsCliente = getClienteIds();
      const atendimentosPorId = await Promise.all(idsCliente.map((id) =>
        firebaseService.query('atendimentos', [
          { field: 'clienteId', operator: '==', value: id }
        ], 'data', 'desc')
      ));
      const atendimentosData = Array.from(new Map(atendimentosPorId.flat().map((item) => [item.id, item])).values());

      setAtendimentos(atendimentosData || []);

      const totalGasto = (atendimentosData || []).reduce((acc, a) => acc + (a.valorTotal || 0), 0);

      // Contar serviços mais frequentes
      const servicosCount = {};
      (atendimentosData || []).forEach(a => {
        if (a.servicoNome) {
          servicosCount[a.servicoNome] = (servicosCount[a.servicoNome] || 0) + 1;
        }
      });

      const servicosFavoritos = Object.entries(servicosCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([nome, count]) => ({ nome, count }));

      setEstatisticas({
        totalAtendimentos: atendimentosData?.length || 0,
        totalGasto,
        servicosFavoritos,
      });

    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getLinhasHistorico = () => atendimentos.map((atendimento) => ([
    formatarData(atendimento.data),
    atendimento.servicoNome || 'Serviço',
    atendimento.profissionalNome || '-',
    Number(atendimento.valorTotal || 0),
  ]));

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFillColor(156, 39, 176);
    doc.rect(0, 0, 210, 14, 'F');
    doc.setTextColor(156, 39, 176);
    doc.setFontSize(18);
    doc.text('Meu Histórico', 14, 28);
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Cliente: ${cliente?.nome || cliente?.email || '-'}`, 14, 36);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 42);
    doc.autoTable({
      startY: 50,
      head: [['Data', 'Serviço', 'Profissional', 'Valor']],
      body: getLinhasHistorico().map((linha) => [linha[0], linha[1], linha[2], `R$ ${Number(linha[3] || 0).toFixed(2)}`]),
      headStyles: { fillColor: [156, 39, 176] },
    });
    doc.save(`meu_historico_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Meu Histórico'],
      [`Cliente: ${cliente?.nome || cliente?.email || '-'}`],
      [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
      [],
      ['Data', 'Serviço', 'Profissional', 'Valor'],
      ...getLinhasHistorico(),
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico');
    XLSX.writeFile(wb, `meu_historico_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={reportPageSx}>
      <ReportHeader
        title="Meu Histórico"
        subtitle="Acompanhe todos os atendimentos, valores investidos e preferências de serviços."
        icon={<HistoryIcon />}
        badge="Cliente"
        actions={<>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}>Imprimir</Button>
          <Button variant="contained" color="error" startIcon={<PdfIcon />} onClick={handleExportPDF}>PDF</Button>
          <Button variant="contained" color="success" startIcon={<ExcelIcon />} onClick={handleExportExcel}>Excel</Button>
        </>}
      />

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ReportMetricCard icon={<HistoryIcon />} title="Atendimentos realizados" value={estatisticas.totalAtendimentos} />
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ReportMetricCard icon={<MoneyIcon />} title="Total investido" value={`R$ ${estatisticas.totalGasto.toFixed(2)}`} color="#4caf50" />
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ReportMetricCard icon={<PersonIcon />} title="Serviço favorito" value={estatisticas.servicosFavoritos[0]?.nome || '-'} helper={estatisticas.servicosFavoritos[0] ? `${estatisticas.servicosFavoritos[0].count} visita(s)` : 'Sem recorrência'} color="#ff9800" />
          </motion.div>
        </Grid>
      </Grid>

      {/* Lista de Atendimentos */}
      <ReportSectionCard title="Todos os atendimentos" subtitle="Histórico organizado por data, serviço, profissional e valor.">

          {atendimentos.length > 0 ? (
            <TableContainer>
              <Table sx={reportTableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Profissional</TableCell>
                    <TableCell align="right">Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {atendimentos.map((atendimento, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatarData(atendimento.data)}</TableCell>
                      <TableCell>{atendimento.servicoNome || 'Serviço'}</TableCell>
                      <TableCell>{atendimento.profissionalNome || '-'}</TableCell>
                      <TableCell align="right">
                        R$ {atendimento.valorTotal?.toFixed(2) || '0,00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" color="textSecondary">
                Nenhum atendimento encontrado
              </Typography>
            </Box>
          )}
      </ReportSectionCard>
    </Box>
  );
}

export default ClienteHistorico;
