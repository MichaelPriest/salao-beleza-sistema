import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Assignment as FormIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckIcon,
  ContentCut as ServiceIcon,
  Dashboard as DashboardIcon,
  EmojiEvents as LoyaltyIcon,
  ExpandMore as ExpandMoreIcon,
  HelpCenter as HelpIcon,
  Inventory as InventoryIcon,
  ManageAccounts as UsersIcon,
  Notifications as NotificationsIcon,
  Payments as FinanceIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const adminSections = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros passos e acesso administrativo',
    icon: <AdminIcon />,
    summary: 'Login, permissões, empresa e preparação inicial do sistema.',
    steps: [
      'Acesse a página de login administrativo e informe o email e a senha do usuário da empresa.',
      'Em Minha Empresa, confirme dados cadastrais, unidades, assinatura, cobrança e página pública.',
      'Em Configurações, revise dados do salão, horários, notificações, aparência e fidelidade.',
      'Em Usuários, cadastre a equipe e conceda somente as permissões necessárias para cada função.',
    ],
    tips: ['Cada empresa trabalha em um tenant isolado.', 'Não compartilhe usuários administrativos entre funcionários.'],
  },
  {
    id: 'dashboard',
    title: 'Dashboard e notificações',
    icon: <DashboardIcon />,
    summary: 'Acompanhe indicadores, alertas e atividades recentes.',
    steps: [
      'Use o Dashboard para acompanhar atendimentos, vendas, clientes e indicadores do período.',
      'Abra Notificações para consultar avisos operacionais e marque itens concluídos como lidos.',
      'Use os atalhos dos cartões para acessar rapidamente o módulo relacionado.',
    ],
  },
  {
    id: 'agenda',
    title: 'Agenda, disponibilidade e atendimentos',
    icon: <CalendarIcon />,
    summary: 'Organize horários, profissionais, serviços e conclusão dos atendimentos.',
    steps: [
      'Cadastre serviços e profissionais antes de montar a agenda.',
      'Configure a disponibilidade de cada profissional e os horários de funcionamento.',
      'Crie ou confirme agendamentos informando cliente, serviços, profissional, data e horário.',
      'Na hora do serviço, abra Atendimentos, registre itens, pagamentos e finalize o atendimento.',
      'Consulte o Histórico de Atendimentos para revisar serviços realizados anteriormente.',
    ],
    tips: ['Evite sobreposição de horários.', 'Confirme dados do cliente antes de finalizar o atendimento.'],
  },
  {
    id: 'clientes',
    title: 'Clientes e acesso ao portal',
    icon: <PersonIcon />,
    summary: 'Cadastro, perfil, senha do portal, histórico e relacionamento.',
    steps: [
      'Em Clientes, clique em Novo Cliente e preencha os dados pessoais obrigatórios.',
      'Na aba Acesso Portal, defina uma senha inicial para permitir o login pelo portal do cliente.',
      'Use Editar Cliente para atualizar contato, endereço, preferências e observações.',
      'Consulte detalhes, histórico, pontos, indicações e formulários associados ao cliente.',
      'Se o cliente esquecer a senha, oriente-o a usar Recuperar senha na página de login do portal.',
    ],
    tips: ['Nunca armazene senhas em observações.', 'O email do cliente deve ser único no serviço de autenticação.'],
  },
  {
    id: 'servicos-equipe',
    title: 'Serviços, profissionais e comissões',
    icon: <ServiceIcon />,
    summary: 'Catálogo, equipe, preços, duração e regras de comissão.',
    steps: [
      'Cadastre serviços com nome, preço, duração e status.',
      'Cadastre profissionais e vincule os serviços que cada um executa.',
      'Configure disponibilidade e regras de comissão quando aplicável.',
      'Revise comissões no módulo correspondente após a conclusão dos atendimentos.',
    ],
  },
  {
    id: 'anamnese',
    title: 'Anamnese e formulários',
    icon: <FormIcon />,
    summary: 'Crie formulários por serviço e acompanhe respostas do cliente.',
    steps: [
      'Em Anamnese e Formulários, crie um formulário e adicione perguntas, obrigatoriedade e tipos de resposta.',
      'Vincule o formulário a um ou mais serviços da empresa e mantenha-o ativo.',
      'Quando o cliente tiver um agendamento com serviço vinculado, o formulário aparecerá no portal.',
      'Consulte Respostas e Relatórios para revisar formulários enviados e assinaturas digitais.',
    ],
    tips: ['Vincule sempre ao serviço correto.', 'Revise perguntas obrigatórias antes de publicar.'],
  },
  {
    id: 'fidelidade',
    title: 'Fidelidade, recompensas, indicações e cupons',
    icon: <LoyaltyIcon />,
    summary: 'Configure benefícios e acompanhe o relacionamento com clientes.',
    steps: [
      'Em Configurações > Fidelidade, defina pontos por real, bônus, validade e níveis.',
      'Cadastre recompensas e regras de resgate.',
      'Use Indicações para acompanhar clientes indicados e bônus.',
      'Crie cupons e campanhas com validade, limite e regras claras de utilização.',
    ],
  },
  {
    id: 'estoque',
    title: 'Estoque, produtos, entradas, compras e fornecedores',
    icon: <InventoryIcon />,
    summary: 'Controle itens, movimentações e abastecimento.',
    steps: [
      'Cadastre categorias, produtos e fornecedores.',
      'Registre entradas e compras para atualizar o estoque.',
      'Revise movimentações e itens com estoque baixo regularmente.',
      'Evite excluir produtos com histórico; prefira desativá-los.',
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro, caixa e relatórios',
    icon: <FinanceIcon />,
    summary: 'Acompanhe recebimentos, pagamentos, fluxo e resultados.',
    steps: [
      'Registre contas a receber e contas a pagar com vencimentos corretos.',
      'Acompanhe o fluxo de caixa e confira os pagamentos dos atendimentos.',
      'Use relatórios e análises para comparar vendas, serviços e performance.',
      'Revise cobranças SaaS e assinatura em Minha Empresa.',
    ],
  },
  {
    id: 'configuracoes',
    title: 'Configurações, segurança e manutenção',
    icon: <SettingsIcon />,
    summary: 'Personalize o sistema e mantenha dados protegidos.',
    steps: [
      'Revise horários, canais de notificação, aparência e dados do salão.',
      'Use Backup antes de alterações importantes ou limpeza de dados.',
      'Consulte Auditoria e Logs para investigar ações e erros.',
      'Restrinja configurações, backup e limpeza somente a administradores autorizados.',
    ],
    tips: ['A limpeza de dados é irreversível.', 'Faça backup antes de operações críticas.'],
  },
];

const clientSections = [
  {
    id: 'acesso',
    title: 'Acesso e criação da conta',
    icon: <PersonIcon />,
    summary: 'Entre com email/senha ou Google no link correto da empresa.',
    steps: [
      'Acesse sempre o link público enviado pelo salão para entrar no tenant correto.',
      'Use Entrar com Google ou informe email e senha cadastrados.',
      'No primeiro acesso com Google, complete os dados solicitados.',
      'Se esquecer a senha, use Recuperar senha na tela de login.',
    ],
    tips: ['Não use o link de outro salão.', 'Mantenha seu email e telefone atualizados.'],
  },
  {
    id: 'dashboard-cliente',
    title: 'Dashboard do cliente',
    icon: <DashboardIcon />,
    summary: 'Visão geral de agendamentos, pontos, recompensas e avisos.',
    steps: [
      'Consulte os próximos agendamentos e atividades recentes.',
      'Veja seu saldo de pontos, nível de fidelidade e recompensas disponíveis.',
      'Use os atalhos para acessar rapidamente cada área do portal.',
    ],
  },
  {
    id: 'agendamentos-cliente',
    title: 'Solicitar e acompanhar agendamentos',
    icon: <CalendarIcon />,
    summary: 'Escolha serviços, data, horário e profissional.',
    steps: [
      'Abra Agendamentos e clique para solicitar um novo horário.',
      'Selecione um ou mais serviços disponíveis.',
      'Escolha profissional, data e horário; adicione observações se necessário.',
      'Acompanhe o status e cancele solicitações pendentes quando permitido.',
    ],
  },
  {
    id: 'formularios-cliente',
    title: 'Anamnese e formulários',
    icon: <FormIcon />,
    summary: 'Responda formulários vinculados aos seus serviços agendados.',
    steps: [
      'Abra Anamnese para ver formulários pendentes e respondidos.',
      'Selecione o formulário relacionado ao agendamento e responda todos os campos obrigatórios.',
      'Confira os dados e envie; formulários enviados ficam disponíveis para visualização.',
      'Quando solicitado, faça a assinatura digital diretamente na tela.',
    ],
    tips: ['Responda com informações verdadeiras.', 'Em caso de dúvida sobre saúde ou procedimento, fale com o profissional.'],
  },
  {
    id: 'fidelidade-cliente',
    title: 'Pontos, recompensas e indicações',
    icon: <LoyaltyIcon />,
    summary: 'Acompanhe benefícios oferecidos pela empresa.',
    steps: [
      'Abra Meus Pontos para consultar saldo e movimentações.',
      'Abra Recompensas para conhecer os benefícios disponíveis.',
      'Siga as regras informadas pelo salão para solicitar resgates.',
      'Use indicações quando a empresa oferecer bônus por novos clientes.',
    ],
  },
  {
    id: 'historico-cliente',
    title: 'Histórico, perfil e notificações',
    icon: <NotificationsIcon />,
    summary: 'Consulte atendimentos e mantenha seus dados atualizados.',
    steps: [
      'Abra Histórico para consultar serviços realizados anteriormente.',
      'Abra Perfil para atualizar dados pessoais, contato e preferências.',
      'Abra Notificações para acompanhar confirmações, lembretes e benefícios.',
      'Ao terminar, use Sair para encerrar o acesso com segurança.',
    ],
  },
];

function ManualSistema({ audience = 'admin' }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const sections = audience === 'cliente' ? clientSections : adminSections;
  const title = audience === 'cliente' ? 'Manual do Portal do Cliente' : 'Manual Administrativo do Sistema';
  const subtitle = audience === 'cliente'
    ? 'Aprenda a usar sua conta, agendamentos, formulários e benefícios.'
    : 'Guia completo para configurar, operar e administrar o sistema do salão.';

  const filteredSections = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sections;
    return sections.filter((section) => [section.title, section.summary, ...(section.steps || []), ...(section.tips || [])]
      .some((value) => value?.toLowerCase().includes(term)));
  }, [search, sections]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Card sx={{ mb: 3, color: 'white', background: 'linear-gradient(135deg, #7b1fa2 0%, #ec407a 100%)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <HelpIcon fontSize="large" />
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{title}</Typography>
              </Stack>
              <Typography sx={{ opacity: 0.92 }}>{subtitle}</Typography>
            </Box>
            <Chip label={`${sections.length} tópicos`} sx={{ bgcolor: 'rgba(255,255,255,.2)', color: 'white', alignSelf: 'flex-start' }} />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar no manual: agendamento, senha, formulário, financeiro..."
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button fullWidth variant="outlined" sx={{ height: '100%' }} onClick={() => navigate(audience === 'cliente' ? '/cliente/dashboard' : '/dashboard')}>
            Voltar ao dashboard
          </Button>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        Os dados exibidos no sistema pertencem somente à empresa acessada. Sempre confirme se você está no link e no usuário corretos antes de cadastrar ou alterar informações.
      </Alert>

      {filteredSections.length === 0 ? (
        <Alert severity="warning">Nenhum tópico encontrado para “{search}”.</Alert>
      ) : filteredSections.map((section) => (
        <Accordion
          key={section.id}
          expanded={expanded === section.id}
          onChange={(_, open) => setExpanded(open ? section.id : false)}
          sx={{ mb: 1.5, borderRadius: '12px !important', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ color: '#9c27b0', display: 'flex' }}>{section.icon}</Box>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{section.title}</Typography>
                <Typography variant="body2" color="text.secondary">{section.summary}</Typography>
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Passo a passo</Typography>
            <List dense disablePadding>
              {section.steps.map((step, index) => (
                <ListItem key={step} alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary={`${index + 1}. ${step}`} />
                </ListItem>
              ))}
            </List>
            {section.tips?.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <strong>Atenção:</strong> {section.tips.join(' ')}
              </Alert>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <BusinessIcon color="primary" />
            <Box>
              <Typography sx={{ fontWeight: 700 }}>Ainda precisa de ajuda?</Typography>
              <Typography variant="body2" color="text.secondary">
                Entre em contato com o responsável da empresa e informe a tela, a ação realizada e a mensagem de erro exibida.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ManualSistema;
