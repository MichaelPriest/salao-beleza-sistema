// src/components/ImprimirCliente.js
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
} from '@mui/material';

export const ImprimirCliente = React.forwardRef(({ cliente }, ref) => {
  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarTelefone = (tel) => {
    if (!tel) return '-';
    return tel;
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
        <Box>
          <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 700 }}>
            Beauty Pro
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Ficha do Cliente
          </Typography>
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

      {/* Foto e Nome */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        {cliente.foto ? (
          <Box
            component="img"
            src={cliente.foto}
            alt={cliente.nome}
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              objectFit: 'cover',
              mb: 2,
              border: '3px solid #9c27b0'
            }}
          />
        ) : (
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: '#9c27b0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              mx: 'auto',
              color: 'white',
              fontSize: '3rem',
              fontWeight: 600
            }}
          >
            {cliente.nome?.charAt(0)}
          </Box>
        )}
        <Typography variant="h4" gutterBottom>
          {cliente.nome}
        </Typography>
        <Chip
          label={cliente.status || 'Regular'}
          sx={{
            bgcolor: cliente.status === 'VIP' ? '#f3e5f5' : 
                     cliente.status === 'Novo' ? '#e8f5e9' : '#e3f2fd',
            color: cliente.status === 'VIP' ? '#9c27b0' :
                   cliente.status === 'Novo' ? '#2e7d32' : '#1976d2',
            fontWeight: 600,
            fontSize: '1rem',
            px: 2
          }}
        />
      </Box>

      {/* Informações Pessoais */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#faf5ff' }}>
        <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, fontWeight: 600 }}>
          Informações Pessoais
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Email</Typography>
            <Typography variant="body1">{cliente.email || '-'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Telefone</Typography>
            <Typography variant="body1">{formatarTelefone(cliente.telefone)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Telefone 2</Typography>
            <Typography variant="body1">{formatarTelefone(cliente.telefone2) || '-'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">CPF</Typography>
            <Typography variant="body1">{cliente.cpf || '-'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">RG</Typography>
            <Typography variant="body1">{cliente.rg || '-'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">Data Nascimento</Typography>
            <Typography variant="body1">{formatarData(cliente.dataNascimento)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Endereço */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#faf5ff' }}>
        <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, fontWeight: 600 }}>
          Endereço
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1">
              {cliente.logradouro || ''} {cliente.numero || ''}
              {cliente.complemento && ` - ${cliente.complemento}`}
            </Typography>
            <Typography variant="body1">
              {cliente.bairro || ''} - {cliente.cidade || ''}/{cliente.estado || ''}
            </Typography>
            <Typography variant="body1">CEP: {cliente.cep || ''}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Estatísticas */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#faf5ff' }}>
        <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, fontWeight: 600 }}>
          Estatísticas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary">Data Cadastro</Typography>
            <Typography variant="body1">{formatarData(cliente.dataCadastro)}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary">Última Visita</Typography>
            <Typography variant="body1">{formatarData(cliente.ultimaVisita) || '-'}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary">Total Gasto</Typography>
            <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 600 }}>
              R$ {cliente.totalGasto?.toFixed(2) || '0,00'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Observações */}
      {cliente.observacoes && (
        <Paper sx={{ p: 3, bgcolor: '#faf5ff' }}>
          <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, fontWeight: 600 }}>
            Observações
          </Typography>
          <Typography variant="body1">{cliente.observacoes}</Typography>
        </Paper>
      )}

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
