// src/components/ImprimirCliente.js
import React, { forwardRef, useState, useEffect } from 'react';
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
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import { firebaseService } from '../services/firebase';

export const ImprimirCliente = forwardRef(({ cliente }, ref) => {
  const [dadosCompletos, setDadosCompletos] = useState({
    loading: true,
    pontuacao: {
      total: 0,
      creditos: 0,
      debitos: 0,
      nivel: 'bronze'
    },
    ultimosAtendimentos: []
  });

  useEffect(() => {
    if (cliente?.id) {
      carregarDadosCliente();
    }
  }, [cliente]);

  const carregarDadosCliente = async () => {
    try {
      console.log('🔍 Carregando dados completos do cliente para impressão:', cliente.id);
      
      // 🔥 BUSCAR PONTUAÇÃO DO CLIENTE
      let pontuacaoData = [];
      try {
        pontuacaoData = await firebaseService.query('pontuacao', [
          { field: 'clienteId', operator: '==', value: cliente.id }
        ]);
        console.log('✅ Pontuação carregada:', pontuacaoData.length);
      } catch (error) {
        console.error('Erro ao carregar pontuação:', error);
      }

      // Calcular totais
      const creditos = pontuacaoData
        .filter(p => p.tipo === 'credito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);
      
      const debitos = pontuacaoData
        .filter(p => p.tipo === 'debito')
        .reduce((acc, p) => acc + (p.quantidade || 0), 0);
      
      const saldo = creditos - debitos;

      // Determinar nível
      let nivel = 'bronze';
      if (saldo >= 5000) nivel = 'platina';
      else if (saldo >= 2000) nivel = 'ouro';
      else if (saldo >= 500) nivel = 'prata';

      // 🔥 BUSCAR ÚLTIMOS 5 ATENDIMENTOS
      let atendimentosData = [];
      try {
        atendimentosData = await firebaseService.query('atendimentos', [
          { field: 'clienteId', operator: '==', value: cliente.id }
        ], 'data', 'desc');
        console.log('✅ Atendimentos carregados:', atendimentosData.length);
      } catch (error) {
        console.error('Erro ao carregar atendimentos:', error);
      }

      // Buscar serviços e profissionais para os atendimentos
      const atendimentosCompletos = await Promise.all(
        atendimentosData.slice(0, 5).map(async (atend) => {
          let servicoNome = atend.servicoNome;
          let profissionalNome = atend.profissionalNome;
          
          // Buscar serviço se não tiver nome
          if (!servicoNome && atend.servicoId) {
            try {
              const servico = await firebaseService.getById('servicos', atend.servicoId);
              servicoNome = servico?.nome;
            } catch (error) {
              console.error('Erro ao buscar serviço:', error);
            }
          }
          
          // Buscar profissional se não tiver nome
          if (!profissionalNome && atend.profissionalId) {
            try {
              const profissional = await firebaseService.getById('profissionais', atend.profissionalId);
              profissionalNome = profissional?.nome;
            } catch (error) {
              console.error('Erro ao buscar profissional:', error);
            }
          }
          
          return {
            ...atend,
            servicoNome: servicoNome || 'Serviço',
            profissionalNome: profissionalNome || 'Profissional',
            dataFormatada: atend.data ? new Date(atend.data).toLocaleDateString('pt-BR') : '-',
            valorFormatado: atend.valorTotal ? `R$ ${atend.valorTotal.toFixed(2)}` : 'R$ 0,00'
          };
        })
      );

      setDadosCompletos({
        loading: false,
        pontuacao: {
          total: saldo,
          creditos,
          debitos,
          nivel
        },
        ultimosAtendimentos: atendimentosCompletos
      });

    } catch (error) {
      console.error('❌ Erro ao carregar dados do cliente:', error);
      setDadosCompletos(prev => ({ ...prev, loading: false }));
    }
  };

  const getNivelInfo = (nivel) => {
    const niveis = {
      bronze: { cor: '#cd7f32', nome: 'Bronze' },
      prata: { cor: '#c0c0c0', nome: 'Prata' },
      ouro: { cor: '#ffd700', nome: 'Ouro' },
      platina: { cor: '#e5e4e2', nome: 'Platina' }
    };
    return niveis[nivel] || niveis.bronze;
  };

  if (!cliente) return null;

  if (dadosCompletos.loading) {
    return (
      <Box ref={ref} sx={{ p: 4, textAlign: 'center', backgroundColor: 'white' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Carregando dados para impressão...</Typography>
      </Box>
    );
  }

  const nivelInfo = getNivelInfo(dadosCompletos.pontuacao.nivel);

  return (
    <Box ref={ref} sx={{ p: 4, backgroundColor: 'white', color: 'black', maxWidth: '800px', margin: '0 auto' }}>
      {/* Cabeçalho */}
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
        Ficha do Cliente
      </Typography>
      
      <Typography variant="subtitle1" align="center" gutterBottom>
        Data da impressão: {new Date().toLocaleDateString('pt-BR')}
      </Typography>
      
      <Divider sx={{ my: 3 }} />

      {/* 🔥 SEÇÃO DE FIDELIDADE */}
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        <span style={{ marginRight: '8px' }}>⭐</span> Programa de Fidelidade
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#faf5ff' }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary">Pontos Totais</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
              {dadosCompletos.pontuacao.total}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary">Pontos Ganhos</Typography>
            <Typography variant="body1" sx={{ color: '#4caf50' }}>
              +{dadosCompletos.pontuacao.creditos}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="textSecondary">Pontos Usados</Typography>
            <Typography variant="body1" sx={{ color: '#f44336' }}>
              -{dadosCompletos.pontuacao.debitos}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">Nível</Typography>
            <Chip
              label={nivelInfo.nome.toUpperCase()}
              size="small"
              sx={{
                bgcolor: nivelInfo.cor,
                color: dadosCompletos.pontuacao.nivel === 'ouro' ? '#000' : '#fff',
                fontWeight: 600,
                mt: 0.5
              }}
            />
          </Grid>
        </Grid>
      </Paper>

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
        
        {cliente.indicadoPorNome && (
          <Grid item xs={12}>
            <Typography variant="subtitle2">Indicado por:</Typography>
            <Typography variant="body1">{cliente.indicadoPorNome}</Typography>
          </Grid>
        )}
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

      {/* Resumo Financeiro */}
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

      {/* 🔥 ÚLTIMOS 5 ATENDIMENTOS */}
      {dadosCompletos.ultimosAtendimentos.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
            Últimos 5 Atendimentos
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Serviço</strong></TableCell>
                  <TableCell><strong>Profissional</strong></TableCell>
                  <TableCell align="right"><strong>Valor</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dadosCompletos.ultimosAtendimentos.map((atend, index) => (
                  <TableRow key={atend.id || index}>
                    <TableCell>{atend.dataFormatada}</TableCell>
                    <TableCell>{atend.servicoNome}</TableCell>
                    <TableCell>{atend.profissionalNome}</TableCell>
                    <TableCell align="right">{atend.valorFormatado}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Rodapé */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Documento gerado em {new Date().toLocaleString('pt-BR')}
        </Typography>
        <Typography variant="caption" display="block" color="textSecondary">
          BeautyPro - Sistema para Salão
        </Typography>
      </Box>

      {/* Estilos de impressão */}
      <style type="text/css" dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { 
            margin: 0; 
            padding: 0;
            background: white;
            font-size: 12px;
          }
          .MuiPaper-root {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `}} />
    </Box>
  );
});

ImprimirCliente.displayName = 'ImprimirCliente';
