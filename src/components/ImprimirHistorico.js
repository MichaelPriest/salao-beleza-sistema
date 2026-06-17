// src/components/ImprimirHistorico.js
import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { getEmpresaImpressao } from '../utils/reportExportUtils';

export const ImprimirHistorico = React.forwardRef(({ atendimentos, clienteNome, periodo, empresa }, ref) => {
  const empresaDados = getEmpresaImpressao(empresa);
  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const calcularTotal = () => {
    return atendimentos.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Box ref={ref} sx={{ p: 4, backgroundColor: 'white', minHeight: '100vh' }}>
      {/* Cabeçalho */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: '2px solid #9c27b0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {empresaDados.logo && (
            <Box component="img" src={empresaDados.logo} alt="Logo da empresa" sx={{ width: 64, height: 64, objectFit: 'contain' }} />
          )}
          <Box>
            <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 700 }}>
              {empresaDados.nome}
            </Typography>
            {empresaDados.razaoSocial && (
              <Typography variant="subtitle2" color="textSecondary">
                {empresaDados.razaoSocial}
              </Typography>
            )}
            {empresaDados.cnpj && <Typography variant="body2">CNPJ: {empresaDados.cnpj}</Typography>}
            {empresaDados.endereco && <Typography variant="body2" color="textSecondary">{empresaDados.endereco}</Typography>}
            {[empresaDados.telefone, empresaDados.whatsapp, empresaDados.email].filter(Boolean).length > 0 && (
              <Typography variant="body2" color="textSecondary">
                {[empresaDados.telefone, empresaDados.whatsapp, empresaDados.email].filter(Boolean).join(' • ')}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2">
            Data: {new Date().toLocaleDateString('pt-BR')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Hora: {new Date().toLocaleTimeString('pt-BR')}
          </Typography>
        </Box>
      </Box>

      {/* Título do Relatório */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        Histórico de Atendimentos
        {clienteNome && ` - ${clienteNome}`}
      </Typography>

      {periodo && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
          Período: {periodo}
        </Typography>
      )}

      {/* Resumo */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: '#f3e5f5' }}>
          <Typography variant="subtitle2" color="textSecondary">
            Total de Atendimentos
          </Typography>
          <Typography variant="h5" sx={{ color: '#9c27b0', fontWeight: 700 }}>
            {atendimentos.length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: '#e8f5e9' }}>
          <Typography variant="subtitle2" color="textSecondary">
            Valor Total
          </Typography>
          <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 700 }}>
            {formatarMoeda(calcularTotal())}
          </Typography>
        </Paper>
      </Box>

      {/* Tabela de Atendimentos */}
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#9c27b0' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Data</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Hora</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Profissional</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Serviços</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Valor</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {atendimentos.map((atendimento, index) => (
              <TableRow key={atendimento.id} sx={{ 
                '&:nth-of-type(even)': { bgcolor: '#faf5ff' } 
              }}>
                <TableCell>{formatarData(atendimento.data)}</TableCell>
                <TableCell>{atendimento.horaInicio || '-'}</TableCell>
                <TableCell>{atendimento.profissionalNome || 'N/I'}</TableCell>
                <TableCell>
                  {atendimento.itensServico?.map(s => s.nome).join(', ') || 'Serviço'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#4caf50' }}>
                  {formatarMoeda(atendimento.valorTotal)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(atendimento.status)}
                    size="small"
                    color={atendimento.status === 'finalizado' ? 'success' : 'error'}
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Rodapé */}
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px dashed #ccc' }}>
        <Typography variant="caption" color="textSecondary" display="block" align="center">
          Documento gerado em {new Date().toLocaleString('pt-BR')}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block" align="center">
          Beauty Pro Salon - Sistema de Gerenciamento v2.0
        </Typography>
      </Box>
    </Box>
  );
});
