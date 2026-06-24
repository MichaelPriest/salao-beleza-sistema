import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import BusinessIcon from '@mui/icons-material/Business';
import AddTaskIcon from '@mui/icons-material/AddTask';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CampaignIcon from '@mui/icons-material/Campaign';
import PaymentsIcon from '@mui/icons-material/Payments';

const funcionalidades = [
  {
    id: 'agendamento-online',
    icon: <CalendarMonthIcon />,
    titulo: 'Agendamento online público',
    categoria: 'Vendas e atendimento',
    status: 'Pronto para especificação',
    prioridade: 'Alta',
    objetivo: 'Permitir que o cliente escolha serviço, profissional, data e horário sem depender da recepção.',
    entregas: [
      'Página pública de agendamento por empresa',
      'Seleção de unidade, serviço, profissional e horário disponível',
      'Confirmação, reagendamento, cancelamento e lista de espera',
      'Pagamento de sinal para reduzir faltas',
    ],
    kpis: ['No-show', 'Agendamentos online', 'Conversão do site'],
  },
  {
    id: 'whatsapp-automacoes',
    icon: <WhatsAppIcon />,
    titulo: 'Automação por WhatsApp',
    categoria: 'Relacionamento',
    status: 'Pronto para integração',
    prioridade: 'Alta',
    objetivo: 'Automatizar lembretes, confirmações, pós-atendimento e reativação de clientes.',
    entregas: [
      'Templates de lembrete 24h e 2h antes do atendimento',
      'Mensagens de aniversário, pós-atendimento e avaliação',
      'Campanhas segmentadas para clientes inativos',
      'Links de ação para confirmar, remarcar ou cancelar',
    ],
    kpis: ['Taxa de confirmação', 'Clientes reativados', 'Avaliações recebidas'],
  },
  {
    id: 'comanda-caixa',
    icon: <PointOfSaleIcon />,
    titulo: 'Comanda digital e caixa',
    categoria: 'Operação financeira',
    status: 'Pronto para protótipo',
    prioridade: 'Alta',
    objetivo: 'Unificar atendimento, serviços, produtos, descontos, pagamentos, baixa de estoque e comissão.',
    entregas: [
      'Abertura de comanda por atendimento ou cliente avulso',
      'Serviços, produtos, descontos e formas de pagamento',
      'Abertura, sangria, suprimento e fechamento de caixa',
      'Recibo, baixa de estoque e comissão automática',
    ],
    kpis: ['Diferença de caixa', 'Ticket médio', 'Comissões calculadas'],
  },
  {
    id: 'pacotes-assinaturas',
    icon: <LoyaltyIcon />,
    titulo: 'Pacotes, assinaturas e gift cards',
    categoria: 'Receita recorrente',
    status: 'Pronto para modelagem',
    prioridade: 'Alta',
    objetivo: 'Criar novas fontes de receita com pacotes de sessões, planos mensais e vale-presente.',
    entregas: [
      'Venda de pacotes com saldo, validade e consumo por atendimento',
      'Planos mensais com recorrência e benefícios',
      'Gift cards com código único, valor, validade e resgate',
      'Relatórios de pacotes vendidos, usados e vencidos',
    ],
    kpis: ['Receita recorrente', 'Pacotes vendidos', 'Saldo de sessões'],
  },
  {
    id: 'crm-campanhas',
    icon: <PeopleAltIcon />,
    titulo: 'CRM e campanhas inteligentes',
    categoria: 'Marketing',
    status: 'Pronto para regras',
    prioridade: 'Alta',
    objetivo: 'Segmentar clientes e criar ações automáticas para vender mais para a base atual.',
    entregas: [
      'Segmentos de inativos, aniversariantes, VIPs e clientes por serviço',
      'Campanhas automáticas com cupons e notificações',
      'Ranking de indicações e recompensas automáticas',
      'Funil de retorno e tarefas comerciais',
    ],
    kpis: ['Clientes reativados', 'Uso de cupons', 'Receita por campanha'],
  },
  {
    id: 'prontuario-fotos',
    icon: <MedicalInformationIcon />,
    titulo: 'Prontuário, fotos e assinatura digital',
    categoria: 'Experiência premium',
    status: 'Pronto para segurança',
    prioridade: 'Alta',
    objetivo: 'Criar linha do tempo completa do cliente com anamnese, histórico, fotos e termos assinados.',
    entregas: [
      'Prontuário com histórico, observações, alergias e procedimentos',
      'Fotos antes/depois por atendimento',
      'Autorização de uso de imagem',
      'Assinatura digital em anamnese e termos com data/hora',
    ],
    kpis: ['Anamneses assinadas', 'Evoluções registradas', 'Risco operacional'],
  },
  {
    id: 'estoque-inteligente',
    icon: <Inventory2Icon />,
    titulo: 'Estoque inteligente',
    categoria: 'Compras e produtos',
    status: 'Pronto para parametrização',
    prioridade: 'Média',
    objetivo: 'Reduzir perdas e faltas com alertas, consumo por serviço e sugestão de compra.',
    entregas: [
      'Estoque mínimo, alertas e sugestão de compra',
      'Consumo automático por serviço/procedimento',
      'Curva ABC, giro, validade e custo médio',
      'Ordem de compra e recebimento parcial',
    ],
    kpis: ['Rupturas', 'Produtos vencidos', 'Giro de estoque'],
  },
  {
    id: 'saas-onboarding',
    icon: <BusinessIcon />,
    titulo: 'SaaS, trial e onboarding',
    categoria: 'Escala da plataforma',
    status: 'Pronto para implantação gradual',
    prioridade: 'Média',
    objetivo: 'Aumentar ativação e monetização com trial, checklist, planos por recurso e métricas SaaS.',
    entregas: [
      'Trial automatizado com prazo, bloqueio suave e checklist inicial',
      'Tour guiado e dados de exemplo',
      'Upgrade/downgrade por plano e recurso',
      'Métricas de MRR, churn, ativação e inadimplência',
    ],
    kpis: ['Ativação', 'MRR', 'Churn'],
  },
];

const fases = [
  { titulo: 'Fase 1 — Vender e reter', itens: ['Agendamento online', 'WhatsApp', 'CRM', 'Campanhas', 'Avaliações'] },
  { titulo: 'Fase 2 — Operação profissional', itens: ['Comanda digital', 'Caixa', 'Pacotes', 'DRE', 'Estoque automático'] },
  { titulo: 'Fase 3 — Experiência premium', itens: ['Prontuário', 'Fotos', 'Assinatura digital', 'Orçamentos', 'Checkout'] },
  { titulo: 'Fase 4 — Escala SaaS', itens: ['Trial', 'Onboarding', 'Planos por recurso', 'Billing', 'Métricas SaaS'] },
];

const statusColor = {
  Alta: 'error',
  Média: 'warning',
  Baixa: 'info',
};

const CentralFuncionalidadesAvancadas = () => {
  const [busca, setBusca] = useState('');
  const [tarefas, setTarefas] = useState([]);

  const funcionalidadesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return funcionalidades;
    return funcionalidades.filter((item) => [
      item.titulo,
      item.categoria,
      item.status,
      item.prioridade,
      item.objetivo,
      ...item.entregas,
      ...item.kpis,
    ].join(' ').toLowerCase().includes(termo));
  }, [busca]);

  const adicionarTarefa = (funcionalidade) => {
    const novaTarefa = {
      id: `${funcionalidade.id}-${Date.now()}`,
      titulo: `Detalhar ${funcionalidade.titulo}`,
      modulo: funcionalidade.titulo,
    };
    setTarefas((atuais) => [novaTarefa, ...atuais].slice(0, 8));
  };

  const totalAltaPrioridade = funcionalidades.filter((item) => item.prioridade === 'Alta').length;
  const progressoRoadmap = Math.round((totalAltaPrioridade / funcionalidades.length) * 100);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 5, mb: 3, color: '#fff', background: 'linear-gradient(135deg, #4a148c 0%, #c2185b 55%, #ff8a00 100%)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
          <Box>
            <Chip icon={<AutoAwesomeIcon />} label="Central de evolução do sistema" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 900 }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 900, mb: 1 }}>
              Funcionalidades avançadas discutidas
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 900, opacity: 0.92 }}>
              Painel para organizar e iniciar a implantação dos módulos de crescimento, operação, experiência premium e escala SaaS.
            </Typography>
          </Box>
          <Paper sx={{ p: 2.5, minWidth: 260, borderRadius: 4 }}>
            <Typography sx={{ color: '#4a148c', fontWeight: 900 }}>Prioridades altas</Typography>
            <Typography variant="h3" sx={{ color: '#c2185b', fontWeight: 900 }}>{totalAltaPrioridade}/{funcionalidades.length}</Typography>
            <LinearProgress variant="determinate" value={progressoRoadmap} sx={{ mt: 1, height: 8, borderRadius: 99 }} />
          </Paper>
        </Stack>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {fases.map((fase) => (
          <Grid item xs={12} md={3} key={fase.titulo}>
            <Card sx={{ height: '100%', borderRadius: 4 }}>
              <CardContent>
                <Typography sx={{ fontWeight: 900, color: '#4a148c', mb: 1 }}>{fase.titulo}</Typography>
                <Stack spacing={0.8}>
                  {fase.itens.map((item) => (
                    <Typography key={item} variant="body2" sx={{ display: 'flex', gap: 1 }}>
                      <Box component="span" sx={{ color: '#2e7d32', fontWeight: 900 }}>✓</Box>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
          <TextField
            label="Buscar funcionalidade, KPI ou entrega"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip icon={<TrendingUpIcon />} label={`${funcionalidades.length} módulos`} color="primary" />
            <Chip icon={<CampaignIcon />} label="Marketing + operação" color="secondary" />
            <Chip icon={<PaymentsIcon />} label="Receita e caixa" color="success" />
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {funcionalidadesFiltradas.map((funcionalidade) => (
              <Grid item xs={12} md={6} key={funcionalidade.id}>
                <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid rgba(156, 39, 176, 0.12)' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <Box sx={{ color: '#c2185b', display: 'flex' }}>{funcionalidade.icon}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{funcionalidade.titulo}</Typography>
                        <Typography variant="body2" color="text.secondary">{funcionalidade.categoria}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                      <Chip size="small" label={funcionalidade.prioridade} color={statusColor[funcionalidade.prioridade] || 'default'} />
                      <Chip size="small" label={funcionalidade.status} variant="outlined" />
                    </Stack>

                    <Typography color="text.secondary" sx={{ mb: 2 }}>{funcionalidade.objetivo}</Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Typography sx={{ fontWeight: 900, mb: 1 }}>Entregas principais</Typography>
                    <Stack spacing={0.8} sx={{ mb: 2 }}>
                      {funcionalidade.entregas.map((entrega) => (
                        <Typography key={entrega} variant="body2" sx={{ display: 'flex', gap: 1 }}>
                          <Box component="span" sx={{ color: '#2e7d32', fontWeight: 900 }}>✓</Box>
                          {entrega}
                        </Typography>
                      ))}
                    </Stack>

                    <Typography sx={{ fontWeight: 900, mb: 1 }}>KPIs sugeridos</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                      {funcionalidade.kpis.map((kpi) => <Chip key={kpi} label={kpi} size="small" variant="outlined" />)}
                    </Stack>

                    <Stack spacing={1}>
                      <Button fullWidth variant="contained" startIcon={<AddTaskIcon />} onClick={() => adicionarTarefa(funcionalidade)}>
                        Criar tarefa de implantação
                      </Button>
                      <Chip label="Disponível na página do módulo correspondente" color="success" variant="outlined" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 4, position: { lg: 'sticky' }, top: 24 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#4a148c', mb: 1 }}>
              Tarefas criadas nesta sessão
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Use os botões dos cards para montar rapidamente uma fila inicial de implantação.
            </Typography>
            <Stack spacing={1.5}>
              {tarefas.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">Nenhuma tarefa criada ainda.</Typography>
                </Paper>
              ) : tarefas.map((tarefa, index) => (
                <Paper key={tarefa.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography sx={{ fontWeight: 900 }}>{index + 1}. {tarefa.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">Módulo: {tarefa.modulo}</Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CentralFuncionalidadesAvancadas;
