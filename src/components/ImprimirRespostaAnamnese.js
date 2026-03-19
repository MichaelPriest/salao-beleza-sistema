// src/components/ImprimirRespostaAnamnese.js
import React, { forwardRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { firebaseService } from '../services/firebase';

const ImprimirRespostaAnamnese = forwardRef(({ resposta, formulario, cliente, profissional }, ref) => {
  const [dadosCompletos, setDadosCompletos] = useState({
    resposta: resposta,
    formulario: formulario,
    cliente: cliente,
    profissional: profissional,
    atendimento: null,
    agendamento: null,
    servico: null,
    loading: true
  });

  useEffect(() => {
    carregarDadosCompletos();
  }, [resposta]);

  const carregarDadosCompletos = async () => {
    try {
      console.log('🔍 Carregando dados completos para impressão...');
      
      let atendimentoData = null;
      let agendamentoData = null;
      let servicoData = null;
      let profissionalData = profissional;
      
      // 1. Buscar atendimento se tiver ID
      if (resposta?.atendimentoId) {
        try {
          atendimentoData = await firebaseService.getById('atendimentos', resposta.atendimentoId);
          console.log('✅ Atendimento carregado:', atendimentoData);
        } catch (error) {
          console.error('Erro ao buscar atendimento:', error);
        }
      }
      
      // 2. Buscar agendamento se tiver ID
      if (resposta?.agendamentoId) {
        try {
          agendamentoData = await firebaseService.getById('agendamentos', resposta.agendamentoId);
          console.log('✅ Agendamento carregado:', agendamentoData);
        } catch (error) {
          console.error('Erro ao buscar agendamento:', error);
        }
      }
      
      // 3. Buscar serviço
      if (resposta?.servicoId) {
        try {
          servicoData = await firebaseService.getById('servicos', resposta.servicoId);
          console.log('✅ Serviço carregado:', servicoData);
        } catch (error) {
          console.error('Erro ao buscar serviço:', error);
        }
      }
      
      // 4. Buscar profissional se não veio
      if (!profissionalData && resposta?.profissionalId) {
        try {
          profissionalData = await firebaseService.getById('profissionais', resposta.profissionalId);
          console.log('✅ Profissional carregado:', profissionalData);
        } catch (error) {
          console.error('Erro ao buscar profissional:', error);
        }
      }
      
      setDadosCompletos({
        resposta,
        formulario,
        cliente,
        profissional: profissionalData,
        atendimento: atendimentoData,
        agendamento: agendamentoData,
        servico: servicoData,
        loading: false
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados completos:', error);
      setDadosCompletos(prev => ({ ...prev, loading: false }));
    }
  };

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

  const getServicoNome = () => {
    if (dadosCompletos.servico?.nome) return dadosCompletos.servico.nome;
    if (dadosCompletos.resposta?.servicoNome) return dadosCompletos.resposta.servicoNome;
    if (dadosCompletos.atendimento?.servicoNome) return dadosCompletos.atendimento.servicoNome;
    if (dadosCompletos.agendamento?.servicoNome) return dadosCompletos.agendamento.servicoNome;
    return 'Serviço não informado';
  };

  const getProfissionalNome = () => {
    if (dadosCompletos.profissional?.nome) return dadosCompletos.profissional.nome;
    if (dadosCompletos.resposta?.profissionalNome) return dadosCompletos.resposta.profissionalNome;
    if (dadosCompletos.atendimento?.profissionalNome) return dadosCompletos.atendimento.profissionalNome;
    if (dadosCompletos.agendamento?.profissionalNome) return dadosCompletos.agendamento.profissionalNome;
    return 'Profissional não informado';
  };

  const getDataAtendimento = () => {
    if (dadosCompletos.atendimento?.data) return formatarDataSimples(dadosCompletos.atendimento.data);
    if (dadosCompletos.agendamento?.data) return formatarDataSimples(dadosCompletos.agendamento.data);
    if (dadosCompletos.resposta?.dataAgendamento) return formatarDataSimples(dadosCompletos.resposta.dataAgendamento);
    return 'Data não informada';
  };

  const getHorarioAtendimento = () => {
    if (dadosCompletos.atendimento?.horaInicio) return dadosCompletos.atendimento.horaInicio;
    if (dadosCompletos.agendamento?.horario) return dadosCompletos.agendamento.horario;
    if (dadosCompletos.resposta?.horaAgendamento) return dadosCompletos.resposta.horaAgendamento;
    return 'Horário não informado';
  };

  if (dadosCompletos.loading) {
    return (
      <Box ref={ref} sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Carregando dados para impressão...</Typography>
      </Box>
    );
  }

  return (
    <Box ref={ref} sx={{ p: 4, fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* Cabeçalho com logo e título */}
      <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #9c27b0', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1, fontSize: '1.8rem' }}>
          Ficha de Anamnese
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 500, color: '#555', fontSize: '1.2rem' }}>
          {dadosCompletos.formulario?.titulo || dadosCompletos.resposta?.formularioTitulo || 'Formulário de Anamnese'}
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
              {dadosCompletos.cliente?.nome || dadosCompletos.resposta?.clienteNome || 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              CPF
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {dadosCompletos.cliente?.cpf || 'Não informado'}
            </Typography>
          </Grid>

          {dadosCompletos.cliente?.dataNascimento && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary" display="block">
                Data de Nascimento
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                {formatarDataSimples(dadosCompletos.cliente.dataNascimento)}
              </Typography>
            </Grid>
          )}

          {dadosCompletos.cliente?.telefone && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary" display="block">
                Telefone
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                {dadosCompletos.cliente.telefone}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2, borderBottom: '1px solid #9c27b0', pb: 1 }}>
              <WorkIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
              Dados do Atendimento
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              Serviço
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem' }}>
              {getServicoNome()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              Profissional
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {getProfissionalNome()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              <CalendarIcon sx={{ mr: 0.5, fontSize: 14, verticalAlign: 'middle' }} />
              Data do Atendimento
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {getDataAtendimento()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              <ScheduleIcon sx={{ mr: 0.5, fontSize: 14, verticalAlign: 'middle' }} />
              Horário
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {getHorarioAtendimento()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              Respondido em
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {dadosCompletos.resposta?.respondidoEm ? formatarData(dadosCompletos.resposta.respondidoEm) : 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="textSecondary" display="block">
              Status
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
              {dadosCompletos.resposta?.status === 'respondido' ? 'Respondido' : 
               dadosCompletos.resposta?.status === 'visto' ? 'Visualizado' : 
               dadosCompletos.resposta?.status || 'Não informado'}
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

        {dadosCompletos.resposta?.respostas?.map((item, index) => (
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

        {(!dadosCompletos.resposta?.respostas || dadosCompletos.resposta.respostas.length === 0) && (
          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
            Nenhuma resposta encontrada
          </Typography>
        )}
      </Paper>

      {/* Observações do profissional */}
      {dadosCompletos.resposta?.observacoesProfissional && (
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            Observações do Profissional
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.6, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            {dadosCompletos.resposta.observacoesProfissional}
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
