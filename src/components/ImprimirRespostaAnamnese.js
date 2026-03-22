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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Work as WorkIcon,
  EditNote as EditNoteIcon,
  Image as ImageIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { firebaseService } from '../services/firebase';

// ============================================
// FUNÇÃO PARA PROCESSAR ASSINATURA
// ============================================
const processarAssinatura = (valor) => {
  if (!valor) return null;
  
  if (typeof valor === 'string' && valor.startsWith('data:image')) {
    return valor;
  }
  
  if (typeof valor === 'string' && valor.startsWith('iVBOR')) {
    return `data:image/png;base64,${valor}`;
  }
  
  if (typeof valor === 'string' && valor.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${valor}`;
  }
  
  if (typeof valor === 'string' && valor.includes('base64,')) {
    const parts = valor.split('base64,');
    if (parts[1] && parts[1].length > 100) {
      const tipoImagem = parts[1].startsWith('iVBOR') ? 'png' : 
                         parts[1].startsWith('/9j/') ? 'jpeg' : 'png';
      return `data:image/${tipoImagem};base64,${parts[1]}`;
    }
  }
  
  return null;
};

// ============================================
// VERIFICAR SE É UMA ASSINATURA
// ============================================
const isRespostaAssinatura = (respostaItem) => {
  if (!respostaItem) return false;
  
  const tipo = respostaItem?.tipo;
  if (tipo === 'assinatura') return true;
  
  const pergunta = respostaItem?.pergunta?.toLowerCase() || '';
  const palavrasAssinatura = ['assinatura', 'assinado', 'rubrica', 'signature', 'assinatura digital', 'assinar'];
  
  if (palavrasAssinatura.some(palavra => pergunta.includes(palavra))) {
    return true;
  }
  
  return false;
};

// ============================================
// COMPONENTE DE ASSINATURA PARA IMPRESSÃO
// ============================================
const AssinaturaImpressao = ({ dataUrl, label = "Assinatura Digital" }) => {
  if (!dataUrl) {
    return (
      <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <EditNoteIcon sx={{ fontSize: 32, color: '#999', mb: 0.5 }} />
        <Typography variant="caption" color="textSecondary">
          Assinatura não disponível
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <img
        src={dataUrl}
        alt="Assinatura digital"
        style={{
          maxWidth: '100%',
          maxHeight: '80px',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#faf5ff',
        }}
      />
    </Box>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
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
      let atendimentoData = null;
      let agendamentoData = null;
      let servicoData = null;
      let profissionalData = profissional;
      
      if (resposta?.atendimentoId) {
        atendimentoData = await firebaseService.getById('atendimentos', resposta.atendimentoId).catch(() => null);
      }
      
      if (resposta?.agendamentoId) {
        agendamentoData = await firebaseService.getById('agendamentos', resposta.agendamentoId).catch(() => null);
      }
      
      if (resposta?.servicoId) {
        servicoData = await firebaseService.getById('servicos', resposta.servicoId).catch(() => null);
      }
      
      if (!profissionalData && resposta?.profissionalId) {
        profissionalData = await firebaseService.getById('profissionais', resposta.profissionalId).catch(() => null);
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
      console.error('Erro ao carregar dados:', error);
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

  const respostasProcessadas = dadosCompletos.resposta?.respostas?.map(item => {
    const isAssinatura = isRespostaAssinatura(item);
    const assinaturaSrc = isAssinatura ? processarAssinatura(item.resposta) : null;
    
    return {
      ...item,
      isAssinatura,
      assinaturaSrc,
      displayValue: isAssinatura ? null : item.resposta
    };
  }) || [];

  if (dadosCompletos.loading) {
    return (
      <Box ref={ref} sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Carregando dados para impressão...</Typography>
      </Box>
    );
  }

  return (
    <Box ref={ref} sx={{ 
      p: 3, 
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      maxWidth: '100%',
      backgroundColor: '#fff',
    }}>
      
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 3, 
        pb: 2, 
        borderBottom: '3px solid #9c27b0',
        position: 'relative',
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#9c27b0', 
          mb: 0.5,
          fontSize: '24px',
          letterSpacing: '-0.5px',
        }}>
          FICHA DE ANAMNESE
        </Typography>
        <Typography variant="h6" sx={{ 
          fontWeight: 500, 
          color: '#666', 
          fontSize: '16px',
        }}>
          {dadosCompletos.formulario?.titulo || dadosCompletos.resposta?.formularioTitulo || 'Formulário de Anamnese'}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ 
          mt: 1, 
          display: 'block',
          fontSize: '10px',
        }}>
          Documento gerado em {new Date().toLocaleString('pt-BR')}
        </Typography>
      </Box>

      {/* ============================================ */}
      {/* INFORMAÇÕES DO CLIENTE E ATENDIMENTO */}
      {/* ============================================ */}
      <Box sx={{ mb: 3 }}>
        {/* Cabeçalho das seções */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}>
          <Box sx={{ flex: 1, minWidth: '45%' }}>
            <Box sx={{ 
              bgcolor: '#f3e5f5', 
              p: 1.5, 
              borderRadius: 1,
              borderLeft: '4px solid #9c27b0',
            }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600, 
                color: '#9c27b0', 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '14px',
              }}>
                <PersonIcon sx={{ fontSize: 18 }} /> DADOS DO CLIENTE
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                    {dadosCompletos.cliente?.nome || dadosCompletos.resposta?.clienteNome || 'Não informado'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '10px' }}>
                    CPF
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>
                    {dadosCompletos.cliente?.cpf || 'Não informado'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '10px' }}>
                    Telefone
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>
                    {dadosCompletos.cliente?.telefone || 'Não informado'}
                  </Typography>
                </Grid>
                {dadosCompletos.cliente?.email && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '10px' }}>
                      E-mail
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '12px' }}>
                      {dadosCompletos.cliente.email}
                    </Typography>
                  </Grid>
                )}
                {dadosCompletos.cliente?.dataNascimento && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '10px' }}>
                      Data de Nascimento
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '12px' }}>
                      {formatarDataSimples(dadosCompletos.cliente.dataNascimento)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: '45%' }}>
            <Box sx={{ 
              bgcolor: '#f3e5f5', 
              p: 1.5, 
              borderRadius: 1,
              borderLeft: '4px solid #9c27b0',
            }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600, 
                color: '#9c27b0', 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '14px',
              }}>
                <WorkIcon sx={{ fontSize: 18 }} /> DADOS DO ATENDIMENTO
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontSize: '13px' }}>
                    <strong>Serviço:</strong> {getServicoNome()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontSize: '13px' }}>
                    <strong>Profissional:</strong> {getProfissionalNome()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>
                    <CalendarIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                    {getDataAtendimento()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>
                    <ScheduleIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                    {getHorarioAtendimento()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '10px' }}>
                    Respondido em
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>
                    {dadosCompletos.resposta?.respondidoEm ? formatarData(dadosCompletos.resposta.respondidoEm) : 'Não informado'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ============================================ */}
      {/* RESPOSTAS DO FORMULÁRIO */}
      {/* ============================================ */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ 
          fontWeight: 600, 
          color: '#9c27b0', 
          mb: 1.5,
          borderBottom: '2px solid #9c27b0',
          pb: 0.5,
          fontSize: '16px',
        }}>
          <AssignmentIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
          RESPOSTAS DO FORMULÁRIO
        </Typography>

        <TableContainer component={Box} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell width="40%" sx={{ fontWeight: 600, fontSize: '12px', py: 1 }}>Pergunta</TableCell>
                <TableCell width="60%" sx={{ fontWeight: 600, fontSize: '12px', py: 1 }}>Resposta</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {respostasProcessadas.map((item, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                  <TableCell sx={{ fontSize: '12px', py: 1.5, verticalAlign: 'top' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '12px' }}>
                      {item.pergunta}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '12px', py: 1.5, verticalAlign: 'top' }}>
                    {item.isAssinatura && item.assinaturaSrc ? (
                      <AssinaturaImpressao dataUrl={item.assinaturaSrc} />
                    ) : Array.isArray(item.displayValue) ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {item.displayValue.length > 0 ? (
                          item.displayValue.map((opt, i) => (
                            <Typography key={i} variant="body2" sx={{ 
                              fontSize: '11px',
                              bgcolor: '#f3e5f5',
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              mr: 0.5,
                              mb: 0.5,
                            }}>
                              {opt}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', fontSize: '11px' }}>
                            Nenhuma opção selecionada
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: '12px', lineHeight: 1.4 }}>
                        {item.displayValue || <span style={{ color: '#999', fontStyle: 'italic' }}>Não respondido</span>}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {respostasProcessadas.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Nenhuma resposta encontrada
            </Typography>
          </Box>
        )}
      </Box>

      {/* ============================================ */}
      {/* OBSERVAÇÕES DO PROFISSIONAL */}
      {/* ============================================ */}
      {dadosCompletos.resposta?.observacoesProfissional && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 600, 
            color: '#9c27b0', 
            mb: 1,
            borderBottom: '2px solid #9c27b0',
            pb: 0.5,
            fontSize: '14px',
          }}>
            OBSERVAÇÕES DO PROFISSIONAL
          </Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#fff9e6', 
            borderRadius: 1,
            border: '1px solid #ffe0b2',
          }}>
            <Typography variant="body2" sx={{ fontSize: '12px', lineHeight: 1.5 }}>
              {dadosCompletos.resposta.observacoesProfissional}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ============================================ */}
      {/* RODAPÉ */}
      {/* ============================================ */}
      <Box sx={{ 
        mt: 3, 
        pt: 2, 
        textAlign: 'center', 
        borderTop: '1px solid #e0e0e0',
      }}>
        <Typography variant="caption" sx={{ fontSize: '9px', color: '#999' }}>
          BeautyPro - Sistema para Salão • Documento não fiscal
        </Typography>
        <Typography variant="caption" display="block" sx={{ fontSize: '8px', color: '#ccc', mt: 0.5 }}>
          Este documento é uma impressão oficial do formulário de anamnese
        </Typography>
      </Box>

      {/* ============================================ */}
      {/* ESTILOS PARA IMPRESSÃO */}
      {/* ============================================ */}
      <style type="text/css" dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          /* Remover cores de fundo desnecessárias */
          .MuiPaper-root {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          
          /* Evitar quebras de página dentro de elementos */
          .MuiTableRow-root,
          .MuiBox-root,
          .MuiPaper-root {
            page-break-inside: avoid;
          }
          
          /* Manter cabeçalhos juntos */
          h1, h2, h3, h4, h5, h6,
          .MuiTypography-root {
            page-break-after: avoid;
          }
          
          /* Tabelas */
          table {
            page-break-inside: avoid;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
          
          /* Imagens */
          img {
            max-width: 100% !important;
            page-break-inside: avoid;
          }
          
          /* Margens da página */
          @page {
            size: A4;
            margin: 1.2cm;
          }
          
          /* Ocultar elementos interativos */
          .no-print {
            display: none;
          }
        }
        
        @media screen {
          body {
            background: #f5f5f5;
          }
          [ref] {
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin: 20px auto;
          }
        }
      `}} />
    </Box>
  );
});

ImprimirRespostaAnamnese.displayName = 'ImprimirRespostaAnamnese';

export default ImprimirRespostaAnamnese;
