import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const modulos = {
  'agendamento-online': {
    titulo: 'Agendamento online público',
    subtitulo: 'Cadastre solicitações de agendamento público, lista de espera e sinal de reserva.',
    entidade: 'solicitação',
    campoPrincipal: 'Cliente',
    campoSecundario: 'Serviço desejado',
    campoValor: 'Sinal / valor previsto',
    sugestoes: ['Pendente', 'Confirmado', 'Lista de espera', 'Cancelado'],
  },
  'whatsapp-automacoes': {
    titulo: 'Automação por WhatsApp',
    subtitulo: 'Organize templates, campanhas e automações de relacionamento.',
    entidade: 'automação',
    campoPrincipal: 'Nome da campanha/template',
    campoSecundario: 'Público-alvo',
    campoValor: 'Canal ou gatilho',
    sugestoes: ['Rascunho', 'Ativa', 'Pausada', 'Finalizada'],
  },
  'comanda-caixa': {
    titulo: 'Comanda digital e caixa',
    subtitulo: 'Registre comandas, serviços/produtos, formas de pagamento e fechamento operacional.',
    entidade: 'comanda',
    campoPrincipal: 'Cliente ou comanda',
    campoSecundario: 'Serviços/produtos',
    campoValor: 'Valor total',
    sugestoes: ['Aberta', 'Em pagamento', 'Fechada', 'Cancelada'],
  },
  'pacotes-assinaturas': {
    titulo: 'Pacotes, assinaturas e gift cards',
    subtitulo: 'Controle pacotes vendidos, assinaturas, saldo de sessões e vales-presente.',
    entidade: 'pacote',
    campoPrincipal: 'Cliente comprador',
    campoSecundario: 'Pacote/plano/gift card',
    campoValor: 'Valor ou saldo',
    sugestoes: ['Ativo', 'Consumindo', 'Vencido', 'Resgatado'],
  },
  'crm-campanhas': {
    titulo: 'CRM e campanhas inteligentes',
    subtitulo: 'Crie segmentos, campanhas, tarefas comerciais e ações de reativação.',
    entidade: 'ação de CRM',
    campoPrincipal: 'Segmento ou cliente',
    campoSecundario: 'Ação planejada',
    campoValor: 'Cupom/oferta',
    sugestoes: ['Planejada', 'Em execução', 'Convertida', 'Sem retorno'],
  },
  'prontuario-fotos': {
    titulo: 'Prontuário, fotos e assinatura digital',
    subtitulo: 'Registre evolução do cliente, termos, autorização de imagem e observações clínicas.',
    entidade: 'registro',
    campoPrincipal: 'Cliente',
    campoSecundario: 'Procedimento/evolução',
    campoValor: 'Termo/foto/anamnese',
    sugestoes: ['Pendente assinatura', 'Assinado', 'Em acompanhamento', 'Arquivado'],
  },
  'estoque-inteligente': {
    titulo: 'Estoque inteligente',
    subtitulo: 'Acompanhe alertas de estoque mínimo, consumo por serviço e sugestões de compra.',
    entidade: 'alerta',
    campoPrincipal: 'Produto',
    campoSecundario: 'Motivo do alerta',
    campoValor: 'Quantidade/valor',
    sugestoes: ['Comprar', 'Em cotação', 'Pedido feito', 'Resolvido'],
  },
  'saas-onboarding': {
    titulo: 'SaaS, trial e onboarding',
    subtitulo: 'Controle trials, implantação, checklist inicial e evolução de empresas.',
    entidade: 'empresa em onboarding',
    campoPrincipal: 'Empresa',
    campoSecundario: 'Etapa atual',
    campoValor: 'Plano/trial',
    sugestoes: ['Trial', 'Implantando', 'Ativa', 'Risco de churn'],
  },
};

const getStorageKey = (moduloId) => `funcionalidade_avancada_${moduloId}`;

const carregarRegistros = (moduloId) => {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(moduloId)) || '[]');
  } catch {
    return [];
  }
};

const salvarRegistros = (moduloId, registros) => {
  localStorage.setItem(getStorageKey(moduloId), JSON.stringify(registros));
};

const ModuloFuncionalidadeAvancada = () => {
  const { moduloId } = useParams();
  const navigate = useNavigate();
  const modulo = modulos[moduloId];
  const [registros, setRegistros] = useState(() => carregarRegistros(moduloId));
  const [form, setForm] = useState({ principal: '', secundario: '', valor: '', status: modulo?.sugestoes?.[0] || '', observacoes: '' });

  const resumo = useMemo(() => ({
    total: registros.length,
    concluidos: registros.filter((item) => ['Confirmado', 'Fechada', 'Convertida', 'Assinado', 'Resolvido', 'Ativa', 'Resgatado'].includes(item.status)).length,
  }), [registros]);

  if (!modulo) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>Módulo não encontrado</Typography>
          <Button variant="contained" onClick={() => navigate('/funcionalidades-avancadas')}>Voltar para central</Button>
        </Paper>
      </Container>
    );
  }

  const atualizarForm = (field) => (event) => setForm((atual) => ({ ...atual, [field]: event.target.value }));

  const adicionarRegistro = (event) => {
    event.preventDefault();
    if (!form.principal.trim()) return;
    const novoRegistro = {
      id: `${moduloId}-${Date.now()}`,
      ...form,
      criadoEm: new Date().toISOString(),
    };
    const proximos = [novoRegistro, ...registros];
    setRegistros(proximos);
    salvarRegistros(moduloId, proximos);
    setForm({ principal: '', secundario: '', valor: '', status: modulo.sugestoes[0], observacoes: '' });
  };

  const removerRegistro = (registroId) => {
    const proximos = registros.filter((item) => item.id !== registroId);
    setRegistros(proximos);
    salvarRegistros(moduloId, proximos);
  };

  const atualizarStatus = (registroId, status) => {
    const proximos = registros.map((item) => item.id === registroId ? { ...item, status } : item);
    setRegistros(proximos);
    salvarRegistros(moduloId, proximos);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/funcionalidades-avancadas')} sx={{ mb: 2 }}>
        Voltar para funcionalidades avançadas
      </Button>

      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 5, mb: 3, color: '#fff', background: 'linear-gradient(135deg, #4a148c 0%, #c2185b 100%)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box>
            <Chip label="Módulo incluído no sistema" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 900 }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 900, mb: 1 }}>{modulo.titulo}</Typography>
            <Typography variant="h6" sx={{ opacity: 0.92 }}>{modulo.subtitulo}</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center', borderRadius: 4 }}>
              <Typography sx={{ fontWeight: 900, color: '#4a148c' }}>{resumo.total}</Typography>
              <Typography variant="body2" color="text.secondary">registros</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center', borderRadius: 4 }}>
              <Typography sx={{ fontWeight: 900, color: '#2e7d32' }}>{resumo.concluidos}</Typography>
              <Typography variant="body2" color="text.secondary">concluídos</Typography>
            </Paper>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper component="form" onSubmit={adicionarRegistro} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#4a148c', mb: 2 }}>
              Novo(a) {modulo.entidade}
            </Typography>
            <Stack spacing={2}>
              <TextField label={modulo.campoPrincipal} value={form.principal} onChange={atualizarForm('principal')} required fullWidth />
              <TextField label={modulo.campoSecundario} value={form.secundario} onChange={atualizarForm('secundario')} fullWidth />
              <TextField label={modulo.campoValor} value={form.valor} onChange={atualizarForm('valor')} fullWidth />
              <TextField select label="Status" value={form.status} onChange={atualizarForm('status')} fullWidth>
                {modulo.sugestoes.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
              </TextField>
              <TextField label="Observações" value={form.observacoes} onChange={atualizarForm('observacoes')} multiline minRows={3} fullWidth />
              <Button type="submit" variant="contained" size="large" startIcon={<AddIcon />}>Adicionar</Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {registros.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Nenhum registro ainda</Typography>
                  <Typography color="text.secondary">Cadastre o primeiro item para começar a usar este módulo no sistema.</Typography>
                </Paper>
              </Grid>
            ) : registros.map((registro) => (
              <Grid item xs={12} key={registro.id}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{registro.principal}</Typography>
                        <Typography color="text.secondary">{registro.secundario || 'Sem detalhe informado'}</Typography>
                        {registro.valor && <Typography variant="body2" sx={{ mt: 0.5 }}>Valor/indicador: {registro.valor}</Typography>}
                        {registro.observacoes && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{registro.observacoes}</Typography>}
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <TextField select size="small" label="Status" value={registro.status} onChange={(event) => atualizarStatus(registro.id, event.target.value)} sx={{ minWidth: 170 }}>
                          {modulo.sugestoes.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                        </TextField>
                        <Chip icon={<CheckCircleIcon />} label={registro.status} color="primary" variant="outlined" />
                        <Button color="error" startIcon={<DeleteIcon />} onClick={() => removerRegistro(registro.id)}>Remover</Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ModuloFuncionalidadeAvancada;
