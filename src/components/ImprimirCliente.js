import React, { forwardRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

export const ImprimirCliente = forwardRef(({ cliente }, ref) => {
  if (!cliente) return null;

  return (
    <Box ref={ref} sx={{ p: 4, backgroundColor: 'white', color: 'black' }}>
      {/* Cabeçalho */}
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
        Ficha do Cliente
      </Typography>
      
      <Typography variant="subtitle1" align="center" gutterBottom>
        Data da impressão: {new Date().toLocaleDateString('pt-BR')}
      </Typography>
      
      <Divider sx={{ my: 3 }} />

      {/* Informações Pessoais */}
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        Informações Pessoais
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Nome:</Typography>
          <Typography variant="body1">{cliente.nome || '-'}</Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="subtitle2">Status:</Typography>
          <Typography variant="body1">{cliente.status || '-'}</Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="subtitle2">CPF:</Typography>
          <Typography variant="body1">{cliente.cpf || '-'}</Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="subtitle2">RG:</Typography>
          <Typography variant="body1">{cliente.rg || '-'}</Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="subtitle2">Data de Nascimento:</Typography>
          <Typography variant="body1">
            {cliente.dataNascimento 
              ? new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')
              : '-'}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="subtitle2">Data de Cadastro:</Typography>
          <Typography variant="body1">
            {cliente.dataCadastro 
              ? new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')
              : '-'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Contato */}
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        Contato
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Email:</Typography>
          <Typography variant="body1">{cliente.email || '-'}</Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="subtitle2">Telefone Principal:</Typography>
          <Typography variant="body1">{cliente.telefone || '-'}</Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="subtitle2">Telefone Secundário:</Typography>
          <Typography variant="body1">{cliente.telefone2 || '-'}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Endereço */}
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        Endereço
      </Typography>
      
      <Typography variant="body1">
        {cliente.logradouro || ''} {cliente.numero || ''}
        {cliente.complemento && ` - ${cliente.complemento}`}
        <br />
        {cliente.bairro || ''} - {cliente.cidade || ''}/{cliente.estado || ''}
        <br />
        CEP: {cliente.cep || ''}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Preferências */}
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        Preferências
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Profissional Preferido:</Typography>
          <Typography variant="body1">{cliente.preferencias?.profissionalPreferido || '-'}</Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="subtitle2">Receber Notificações:</Typography>
          <Typography variant="body1">{cliente.preferencias?.notificacoes ? 'Sim' : 'Não'}</Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2">Serviços Preferidos:</Typography>
          <Typography variant="body1">
            {cliente.preferencias?.servicosPreferidos?.length > 0 
              ? cliente.preferencias.servicosPreferidos.join(', ')
              : '-'}
          </Typography>
        </Grid>
      </Grid>

      {cliente.observacoes && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
            Observações
          </Typography>
          
          <Typography variant="body1">{cliente.observacoes}</Typography>
        </>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Histórico Resumido */}
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        Resumo Financeiro
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Total Gasto:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
            R$ {cliente.totalGasto?.toFixed(2) || '0,00'}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="subtitle2">Última Visita:</Typography>
          <Typography variant="body1">
            {cliente.ultimaVisita 
              ? new Date(cliente.ultimaVisita).toLocaleDateString('pt-BR')
              : '-'}
          </Typography>
        </Grid>
      </Grid>

      {/* Rodapé */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Documento gerado em {new Date().toLocaleString('pt-BR')}
        </Typography>
      </Box>
    </Box>
  );
});

ImprimirCliente.displayName = 'ImprimirCliente';
