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
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const modulos = {
  'agendamento-online': {
    titulo: 'Agendamento online público',
    descricao: 'Solicitações públicas, lista de espera, confirmação e sinal de reserva dentro da agenda.',
    entidade: 'solicitação',
    status: ['Pendente', 'Confirmado', 'Lista de espera', 'Cancelado'],
    fields: [
      { name: 'cliente', label: 'Cliente', required: true },
      { name: 'servico', label: 'Serviço desejado' },
      { name: 'profissional', label: 'Profissional' },
      { name: 'dataHora', label: 'Data e horário' },
      { name: 'sinal', label: 'Sinal / valor previsto' },
    ],
  },
  'whatsapp-automacoes': {
    titulo: 'Automação por WhatsApp',
    descricao: 'Templates e campanhas de confirmação, lembrete, aniversário e reativação.',
    entidade: 'automação',
    status: ['Rascunho', 'Ativa', 'Pausada', 'Finalizada'],
    fields: [
      { name: 'nome', label: 'Nome da campanha/template', required: true },
      { name: 'gatilho', label: 'Gatilho' },
      { name: 'publico', label: 'Público-alvo' },
      { name: 'mensagem', label: 'Mensagem', multiline: true },
    ],
  },
  'comanda-caixa': {
    titulo: 'Comanda digital e caixa',
    descricao: 'Comandas com serviços, produtos, descontos, pagamentos e baixa operacional.',
    entidade: 'comanda',
    status: ['Aberta', 'Em pagamento', 'Fechada', 'Cancelada'],
    fields: [
      { name: 'cliente', label: 'Cliente/comanda', required: true },
      { name: 'servicos', label: 'Serviços' },
      { name: 'produtos', label: 'Produtos' },
      { name: 'pagamento', label: 'Forma de pagamento' },
      { name: 'valor', label: 'Valor total' },
    ],
  },
  'pacotes-assinaturas': {
    titulo: 'Pacotes, assinaturas e gift cards',
    descricao: 'Venda e controle de pacotes, sessões, planos mensais e vales-presente.',
    entidade: 'pacote',
    status: ['Ativo', 'Consumindo', 'Vencido', 'Resgatado'],
    fields: [
      { name: 'cliente', label: 'Cliente', required: true },
      { name: 'tipo', label: 'Pacote/plano/gift card' },
      { name: 'saldo', label: 'Saldo de sessões ou valor' },
      { name: 'validade', label: 'Validade' },
    ],
  },
  'crm-campanhas': {
    titulo: 'CRM e campanhas inteligentes',
    descricao: 'Segmentos, funil de retorno, cupons e ações para clientes inativos ou VIPs.',
    entidade: 'ação de CRM',
    status: ['Planejada', 'Em execução', 'Convertida', 'Sem retorno'],
    fields: [
      { name: 'segmento', label: 'Segmento/cliente', required: true },
      { name: 'acao', label: 'Ação planejada' },
      { name: 'cupom', label: 'Cupom/oferta' },
      { name: 'retorno', label: 'Previsão de retorno' },
    ],
  },
  'prontuario-fotos': {
    titulo: 'Prontuário, fotos e assinatura digital',
    descricao: 'Linha do tempo do cliente, evolução, termos, anamnese e fotos antes/depois.',
    entidade: 'registro',
    status: ['Pendente assinatura', 'Assinado', 'Em acompanhamento', 'Arquivado'],
    fields: [
      { name: 'cliente', label: 'Cliente', required: true },
      { name: 'procedimento', label: 'Procedimento/evolução' },
      { name: 'termo', label: 'Termo/anamnese/foto' },
      { name: 'observacoes', label: 'Observações clínicas', multiline: true },
    ],
  },
  'estoque-inteligente': {
    titulo: 'Estoque inteligente',
    descricao: 'Alertas de estoque mínimo, consumo por procedimento e sugestão de compra.',
    entidade: 'alerta',
    status: ['Comprar', 'Em cotação', 'Pedido feito', 'Resolvido'],
    fields: [
      { name: 'produto', label: 'Produto', required: true },
      { name: 'motivo', label: 'Motivo do alerta' },
      { name: 'quantidade', label: 'Quantidade sugerida' },
      { name: 'fornecedor', label: 'Fornecedor' },
    ],
  },
  'saas-onboarding': {
    titulo: 'SaaS, trial e onboarding',
    descricao: 'Trials, checklist de implantação, ativação, planos por recurso e métricas SaaS.',
    entidade: 'empresa',
    status: ['Trial', 'Implantando', 'Ativa', 'Risco de churn'],
    fields: [
      { name: 'empresa', label: 'Empresa', required: true },
      { name: 'plano', label: 'Plano/trial' },
      { name: 'etapa', label: 'Etapa atual' },
      { name: 'responsavel', label: 'Responsável' },
    ],
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

const criarFormInicial = (modulo) => ({
  status: modulo?.status?.[0] || '',
  ...(modulo?.fields || []).reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}),
});

const getTituloRegistro = (modulo, registro) => registro[modulo.fields[0]?.name] || 'Registro sem título';

const getDescricaoRegistro = (modulo, registro) => modulo.fields
  .slice(1, 3)
  .map((field) => registro[field.name])
  .filter(Boolean)
  .join(' • ');

const ModuloAvancadoWidget = ({ moduloId }) => {
  const modulo = modulos[moduloId];
  const [open, setOpen] = useState(false);
  const [registros, setRegistros] = useState(() => carregar(moduloId));
  const [form, setForm] = useState(() => criarFormInicial(modulo));

  const resumo = useMemo(() => ({
    total: registros.length,
    recentes: registros.slice(0, 4),
  }), [registros]);

  if (!modulo) return null;

  const adicionar = (event) => {
    event.preventDefault();
    const campoObrigatorio = modulo.fields.find((field) => field.required) || modulo.fields[0];
    if (!String(form[campoObrigatorio.name] || '').trim()) return;
    const proximos = [{ id: `${moduloId}-${Date.now()}`, ...form, criadoEm: new Date().toISOString() }, ...registros];
    setRegistros(proximos);
    salvar(moduloId, proximos);
    setForm(criarFormInicial(modulo));
  };

  const remover = (id) => {
    const proximos = registros.filter((registro) => registro.id !== id);
    setRegistros(proximos);
    salvar(moduloId, proximos);
  };

  return (
    <Paper sx={{ p: 2.5, mb: 3, borderRadius: 4, border: '1px solid rgba(156, 39, 176, 0.16)', bgcolor: '#fff8fb' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
        <Box>
          <Chip icon={<AutoAwesomeIcon />} label="Funcionalidade integrada ao módulo" color="secondary" size="small" sx={{ mb: 1, fontWeight: 800 }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#4a148c' }}>{modulo.titulo}</Typography>
          <Typography color="text.secondary">{modulo.descricao}</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`${resumo.total} registros`} color="primary" variant="outlined" />
          <Button variant="contained" endIcon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} onClick={() => setOpen((value) => !value)}>
            Usar {modulo.entidade}
          </Button>
        </Stack>
      </Stack>

      <Collapse in={open}>
        <Box component="form" onSubmit={adicionar} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {modulo.fields.map((field) => (
              <Grid item xs={12} md={field.multiline ? 12 : 3} key={field.name}>
                <TextField
                  label={field.label}
                  value={form[field.name] || ''}
                  onChange={(event) => setForm((atual) => ({ ...atual, [field.name]: event.target.value }))}
                  fullWidth
                  required={field.required}
                  multiline={field.multiline}
                  minRows={field.multiline ? 3 : undefined}
                />
              </Grid>
            ))}
            <Grid item xs={12} md={3}>
              <TextField select label="Status" value={form.status} onChange={(event) => setForm((atual) => ({ ...atual, status: event.target.value }))} fullWidth>
                {modulo.status.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button type="submit" variant="contained" fullWidth sx={{ height: '100%' }} startIcon={<AddIcon />}>Adicionar</Button>
            </Grid>
          </Grid>
        </Box>
        <Stack spacing={1} sx={{ mt: 2 }}>
          {resumo.recentes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nenhum(a) {modulo.entidade} cadastrado(a) ainda.</Typography>
          ) : resumo.recentes.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{getTituloRegistro(modulo, item)}</Typography>
                  <Typography variant="body2" color="text.secondary">{getDescricaoRegistro(modulo, item) || 'Sem detalhes adicionais'}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={item.status} size="small" />
                  <Button color="error" size="small" startIcon={<DeleteIcon />} onClick={() => remover(item.id)}>Remover</Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default ModuloAvancadoWidget;
