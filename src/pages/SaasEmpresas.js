// src/pages/SaasEmpresas.js
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Business as BusinessIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import firebaseService from '../services/firebase';
import { PLANOS_PADRAO, STATUS_ASSINATURA, saasService } from '../services/saasService';

const formatDate = (value) => (value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value)) : '-');

const getStatusColor = (status) => ({ trial: 'info', ativa: 'success', pendente: 'warning', inadimplente: 'error', cancelada: 'default', expirada: 'error' }[status] || 'default');

function SaasEmpresas() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [planos, setPlanos] = useState([]);

  const assinaturaPorEmpresa = useMemo(() => assinaturas.reduce((acc, assinatura) => ({ ...acc, [assinatura.empresaId || assinatura.id]: assinatura }), {}), [assinaturas]);
  const planoPorId = useMemo(() => [...Object.values(PLANOS_PADRAO), ...planos].reduce((acc, plano) => ({ ...acc, [plano.id]: plano }), {}), [planos]);

  const carregar = async () => {
    setLoading(true);
    try {
      const [empresasData, unidadesData, assinaturasData, planosData] = await Promise.all([
        firebaseService.getAll('empresas').catch(() => []),
        firebaseService.getAll('unidades').catch(() => []),
        firebaseService.getAll('assinaturas').catch(() => []),
        saasService.listarPlanos().catch(() => Object.values(PLANOS_PADRAO)),
      ]);
      setEmpresas(empresasData);
      setUnidades(unidadesData);
      setAssinaturas(assinaturasData);
      setPlanos(planosData);
    } catch (error) {
      console.error('Erro ao carregar empresas SaaS:', error);
      toast.error(error.message || 'Erro ao carregar empresas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const atualizarStatus = async (assinatura, status) => {
    setSaving(true);
    try {
      await firebaseService.update('assinaturas', assinatura.id || assinatura.empresaId, { status, updatedAt: new Date().toISOString() });
      toast.success('Status atualizado.');
      await carregar();
    } catch (error) {
      toast.error(error.message || 'Erro ao atualizar status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Empresas e tenants</Typography>
          <Typography color="text.secondary">Gestão isolada dos contratantes, unidades, link público e status de assinatura.</Typography>
        </Box>
        <Chip icon={<BusinessIcon />} label={`${empresas.length} empresas`} color="primary" />
      </Stack>

      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Plano</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Unidades</TableCell>
                  <TableCell>Financeiro</TableCell>
                  <TableCell>Link público</TableCell>
                  <TableCell>Próxima cobrança</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empresas.map((empresa) => {
                  const assinatura = assinaturaPorEmpresa[empresa.id];
                  const plano = planoPorId[assinatura?.planoId || empresa.planoId] || PLANOS_PADRAO.individual;
                  const totalUnidades = unidades.filter((unidade) => unidade.empresaId === empresa.id).length;
                  return (
                    <TableRow key={empresa.id}>
                      <TableCell><Typography sx={{ fontWeight: 700 }}>{empresa.nome}</Typography><Typography variant="caption" color="text.secondary">{empresa.documento || empresa.id}</Typography></TableCell>
                      <TableCell>{plano.nome}</TableCell>
                      <TableCell><Chip size="small" label={assinatura?.status || 'sem assinatura'} color={getStatusColor(assinatura?.status)} /></TableCell>
                      <TableCell>{totalUnidades}</TableCell>
                      <TableCell><Typography variant="body2">{empresa.cobranca?.emailFinanceiro || empresa.email || '-'}</Typography><Typography variant="caption" color="text.secondary">Venc. dia {empresa.cobranca?.diaVencimento || assinatura?.diaVencimento || '-'}</Typography></TableCell>
                      <TableCell>{empresa.slug ? <Button size="small" href={empresa.linkPublico || `/e/${empresa.slug}`} target="_blank" rel="noreferrer" startIcon={<OpenInNewIcon />}>Abrir</Button> : '-'}</TableCell>
                      <TableCell>{formatDate(assinatura?.proximaCobrancaEm)}</TableCell>
                      <TableCell align="right"><Stack direction="row" spacing={1} justifyContent="flex-end">{assinatura && assinatura.status !== STATUS_ASSINATURA.ATIVA && <Button size="small" disabled={saving} onClick={() => atualizarStatus(assinatura, STATUS_ASSINATURA.ATIVA)}>Ativar</Button>}{assinatura && assinatura.status !== STATUS_ASSINATURA.INADIMPLENTE && <Button size="small" color="warning" disabled={saving} onClick={() => atualizarStatus(assinatura, STATUS_ASSINATURA.INADIMPLENTE)}>Inadimplente</Button>}</Stack></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SaasEmpresas;
