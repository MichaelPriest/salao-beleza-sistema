// src/components/ImprimirRespostaAnamnese.js
import React, { forwardRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';

const ImprimirRespostaAnamnese = forwardRef(({ resposta, formulario, cliente, profissional }, ref) => {
  const formatarData = (data) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return data;
    }
  };

  const formatarDataSimples = (data) => {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  return (
    <Box ref={ref} sx={{ p: 4, fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* Cabeçalho com logo e título */}
      <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #9c27b0', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1, fontSize: '1.8rem' }}>
          Ficha de Anamnese
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 500, color: '#555', fontSize: '1.2rem' }}>
          {formulario?.titulo || 'Formulário de Anamnese'}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
          Emitido em: {new Date().toLocaleString('pt-BR')}
        </Typography>
      </Box>

      {/* Informações do cliente e atendimento */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: '#faf5ff' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2, borderBottom: '1px solid #9c27b0', pb: 1 }}>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
              Dados do Cliente
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              Nome do Cliente
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {resposta?.clienteNome || cliente?.nome || 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              CPF
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {cliente?.cpf || 'Não informado'}
            </Typography>
          </Grid>

          {cliente?.dataNascimento && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary" display="block">
                Data de Nascimento
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                {formatarDataSimples(cliente.dataNascimento)}
              </Typography>
            </Grid>
          )}

          {cliente?.telefone && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary" display="block">
                Telefone
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                {cliente.telefone}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2, borderBottom: '1px solid #9c27b0', pb: 1 }}>
              <BadgeIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
              Dados do Atendimento
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              Serviço
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem' }}>
              {resposta?.servicoNome || 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              Profissional
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {resposta?.profissionalNome || profissional?.nome || 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              <CalendarIcon sx={{ mr: 0.5, fontSize: 14, verticalAlign: 'middle' }} />
              Data do Atendimento
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {resposta?.dataAgendamento ? formatarDataSimples(resposta.dataAgendamento) : 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              <ScheduleIcon sx={{ mr: 0.5, fontSize: 14, verticalAlign: 'middle' }} />
              Horário
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {resposta?.horaAgendamento || 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              Respondido em
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {resposta?.respondidoEm ? formatarData(resposta.respondidoEm) : 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              Status
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {resposta?.status === 'respondido' ? 'Respondido' : 
               resposta?.status === 'visto' ? 'Visualizado' : 
               resposta?.status || 'Não informado'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Respostas do formulário */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0', mb: 3, borderBottom: '1px solid #9c27b0', pb: 1 }}>
          <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Respostas do Formulário
        </Typography>

        {resposta?.respostas?.map((item, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
              {index + 1}. {item.pergunta}
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: '#f9f9f9',
                borderLeft: '4px solid #9c27b0',
                borderRadius: '4px'
              }}
            >
              {item.tipo === 'checkbox' && Array.isArray(item.resposta) ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {item.resposta.length > 0 ? (
                    item.resposta.map((opt, i) => (
                      <Chip
                        key={i}
                        label={opt}
                        size="small"
                        sx={{
                          bgcolor: '#f3e5f5',
                          color: '#9c27b0',
                          fontWeight: 500
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      Nenhuma opção selecionada
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {item.resposta || <span style={{ color: '#999', fontStyle: 'italic' }}>Não respondido</span>}
                </Typography>
              )}
            </Paper>
          </Box>
        ))}

        {(!resposta?.respostas || resposta.respostas.length === 0) && (
          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
            Nenhuma resposta encontrada
          </Typography>
        )}
      </Paper>

      {/* Observações do profissional */}
      {resposta?.observacoesProfissional && (
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            Observações do Profissional
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.6, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            {resposta.observacoesProfissional}
          </Typography>
        </Paper>
      )}

      {/* Rodapé */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary', borderTop: '1px solid #ccc', pt: 2 }}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          Documento gerado em {new Date().toLocaleString('pt-BR')}
        </Typography>
        <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', mt: 0.5 }}>
          BeautyPro - Sistema para Salão • Documento não fiscal
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
            page-break-inside: avoid;
          }
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
          }
          table {
            page-break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
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

ImprimirRespostaAnamnese.displayName = 'ImprimirRespostaAnamnese';

export default ImprimirRespostaAnamnese;
