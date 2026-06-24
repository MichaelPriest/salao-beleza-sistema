import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const modulos = {
  'agendamento-online': {
    titulo: 'Agendamento online público',
    descricao: 'Solicitações públicas, lista de espera e sinal de reserva dentro da agenda.',
    entidade: 'solicitação',
    campoPrincipal: 'Cliente',
    campoSecundario: 'Serviço/profissional/horário',
    status: ['Pendente', 'Confirmado', 'Lista de espera', 'Cancelado'],
  },
  'whatsapp-automacoes': {
    titulo: 'Automação por WhatsApp',
    descricao: 'Templates e campanhas de confirmação, lembrete, aniversário e reativação.',
    entidade: 'automação',
    campoPrincipal: 'Campanha/template',
    campoSecundario: 'Público ou gatilho',
    status: ['Rascunho', 'Ativa', 'Pausada', 'Finalizada'],
  },
  'comanda-caixa': {
    titulo: 'Comanda digital e caixa',
    descricao: 'Comandas com serviços, produtos, descontos, pagamentos e baixa operacional.',
    entidade: 'comanda',
    campoPrincipal: 'Cliente/comanda',
    campoSecundario: 'Itens e pagamento',
    status: ['Aberta', 'Em pagamento', 'Fechada', 'Cancelada'],
  },
  'pacotes-assinaturas': {
    titulo: 'Pacotes, assinaturas e gift cards',
    descricao: 'Venda e controle de pacotes, sessões, planos mensais e vales-presente.',
    entidade: 'pacote',
    campoPrincipal: 'Cliente',
    campoSecundario: 'Pacote/plano/gift card',
    status: ['Ativo', 'Consumindo', 'Vencido', 'Resgatado'],
  },
  'crm-campanhas': {
    titulo: 'CRM e campanhas inteligentes',
    descricao: 'Segmentos, funil de retorno, cupons e ações para clientes inativos ou VIPs.',
    entidade: 'ação de CRM',
    campoPrincipal: 'Segmento/cliente',
    campoSecundario: 'Ação planejada',
    status: ['Planejada', 'Em execução', 'Convertida', 'Sem retorno'],
  },
  'prontuario-fotos': {
    titulo: 'Prontuário, fotos e assinatura digital',
    descricao: 'Linha do tempo do cliente, evolução, termos, anamnese e fotos antes/depois.',
    entidade: 'registro',
    campoPrincipal: 'Cliente',
    campoSecundario: 'Procedimento/evolução/termo',
    status: ['Pendente assinatura', 'Assinado', 'Em acompanhamento', 'Arquivado'],
  },
  'estoque-inteligente': {
    titulo: 'Estoque inteligente',
    descricao: 'Alertas de estoque mínimo, consumo por procedimento e sugestão de compra.',
    entidade: 'alerta',
    campoPrincipal: 'Produto',
    campoSecundario: 'Motivo/quantidade',
    status: ['Comprar', 'Em cotação', 'Pedido feito', 'Resolvido'],
  },
  'saas-onboarding': {
    titulo: 'SaaS, trial e onboarding',
    descricao: 'Trials, checklist de implantação, ativação, planos por recurso e métricas SaaS.',
    entidade: 'empresa',
    campoPrincipal: 'Empresa',
    campoSecundario: 'Etapa/plano',
    status: ['Trial', 'Implantando', 'Ativa', 'Risco de churn'],
  },
};

const storageKey = (moduloId) => `funcionalidade_avancada_${moduloId}`;

const carregar = (moduloId) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(moduloId)) || '[]');
  } catch {
    return [];
  }
};

const salvar = (moduloId, registros) => localStorage.setItem(storageKey(moduloId), JSON.stringify(registros));

const ModuloAvancadoWidget = ({ moduloId }) => {
  const modulo = modulos[moduloId];
  const [open, setOpen] = useState(false);
  const [registros, setRegistros] = useState(() => carregar(moduloId));
  const [form, setForm] = useState({ principal: '', secundario: '', status: modulo?.status?.[0] || '' });

  const resumo = useMemo(() => ({
    total: registros.length,
    recentes: registros.slice(0, 3),
  }), [registros]);

  if (!modulo) return null;

  const adicionar = (event) => {
    event.preventDefault();
    if (!form.principal.trim()) return;
    const proximos = [{ id: `${moduloId}-${Date.now()}`, ...form, criadoEm: new Date().toISOString() }, ...registros];
    setRegistros(proximos);
    salvar(moduloId, proximos);
    setForm({ principal: '', secundario: '', status: modulo.status[0] });
  };

  return (
    <Paper sx={{ p: 2.5, mb: 3, borderRadius: 4, border: '1px solid rgba(156, 39, 176, 0.16)', bgcolor: '#fff8fb' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
        <Box>
          <Chip icon={<AutoAwesomeIcon />} label="Funcionalidade avançada incluída" color="secondary" size="small" sx={{ mb: 1, fontWeight: 800 }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#4a148c' }}>{modulo.titulo}</Typography>
          <Typography color="text.secondary">{modulo.descricao}</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`${resumo.total} registros`} color="primary" variant="outlined" />
          <Button variant="contained" endIcon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} onClick={() => setOpen((value) => !value)}>
            Usar módulo
          </Button>
        </Stack>
      </Stack>

      <Collapse in={open}>
        <Box component="form" onSubmit={adicionar} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField label={modulo.campoPrincipal} value={form.principal} onChange={(event) => setForm((atual) => ({ ...atual, principal: event.target.value }))} fullWidth required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label={modulo.campoSecundario} value={form.secundario} onChange={(event) => setForm((atual) => ({ ...atual, secundario: event.target.value }))} fullWidth />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select label="Status" value={form.status} onChange={(event) => setForm((atual) => ({ ...atual, status: event.target.value }))} fullWidth>
                {modulo.status.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button type="submit" variant="contained" fullWidth sx={{ height: '100%' }}><AddIcon /></Button>
            </Grid>
          </Grid>
        </Box>
        <Stack spacing={1} sx={{ mt: 2 }}>
          {resumo.recentes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nenhum(a) {modulo.entidade} cadastrado(a) ainda.</Typography>
          ) : resumo.recentes.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
                <Typography sx={{ fontWeight: 800 }}>{item.principal}</Typography>
                <Typography color="text.secondary">{item.secundario}</Typography>
                <Chip label={item.status} size="small" />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default ModuloAvancadoWidget;
