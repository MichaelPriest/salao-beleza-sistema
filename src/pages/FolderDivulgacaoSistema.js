import React from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PrintIcon from '@mui/icons-material/Print';
import DevicesIcon from '@mui/icons-material/Devices';
import SpaIcon from '@mui/icons-material/Spa';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import CampaignIcon from '@mui/icons-material/Campaign';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BusinessIcon from '@mui/icons-material/Business';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PaymentsIcon from '@mui/icons-material/Payments';
import BarChartIcon from '@mui/icons-material/BarChart';

const modulos = [
  {
    icon: <CalendarMonthIcon />,
    title: 'Agenda, disponibilidade e atendimentos',
    items: [
      'Agendamentos por profissional, serviço, data e horário',
      'Controle de disponibilidade e organização da agenda diária',
      'Registro do atendimento com serviços, produtos, valores e observações',
      'Histórico completo de atendimentos para consulta rápida',
    ],
  },
  {
    icon: <PeopleAltIcon />,
    title: 'Clientes e relacionamento',
    items: [
      'Cadastro completo de clientes com dados de contato e perfil',
      'Portal do cliente com login, cadastro complementar e recuperação de senha',
      'Histórico do cliente, perfil, notificações e chamados em área exclusiva',
      'Cadastro por indicação para facilitar novas captações',
    ],
  },
  {
    icon: <SpaIcon />,
    title: 'Serviços e profissionais',
    items: [
      'Cadastro e importação de serviços do salão, barbearia ou clínica',
      'Gestão de profissionais, perfil, equipe e recursos humanos',
      'Comissões por profissional e área individual de minhas comissões',
      'Controle operacional para padronizar a execução dos atendimentos',
    ],
  },
  {
    icon: <MedicalInformationIcon />,
    title: 'Anamnese digital',
    items: [
      'Formulários, modelos e respostas de anamnese personalizados',
      'Anamnese vinculada ao atendimento ou agendamento do cliente',
      'Visualização pelo cliente e relatórios para acompanhamento interno',
      'Mais segurança para procedimentos estéticos e serviços especializados',
    ],
  },
  {
    icon: <PointOfSaleIcon />,
    title: 'Financeiro e caixa',
    items: [
      'Controle financeiro centralizado com vendas, receitas e despesas',
      'Contas a pagar, contas a receber e acompanhamento de fluxo de caixa',
      'Compras integradas à rotina de produtos e fornecedores',
      'Indicadores para acompanhar entradas, saídas e resultado do período',
    ],
  },
  {
    icon: <Inventory2Icon />,
    title: 'Estoque e compras',
    items: [
      'Cadastro de produtos, categorias e fornecedores',
      'Entradas de estoque, compras e histórico de movimentações',
      'Organização para reduzir perdas, rupturas e compras de emergência',
      'Visão clara dos itens usados na operação e vendidos ao cliente',
    ],
  },
  {
    icon: <LoyaltyIcon />,
    title: 'Fidelidade, pontos e recompensas',
    items: [
      'Programa de fidelidade com pontos, recompensas e histórico',
      'Área do cliente para consultar pontos e resgatar recompensas',
      'Gestão de indicações para transformar clientes em promotores',
      'Configurações para campanhas de relacionamento recorrente',
    ],
  },
  {
    icon: <CampaignIcon />,
    title: 'Marketing, cupons e campanhas',
    items: [
      'Criação e gestão de cupons promocionais',
      'Campanhas, promoções públicas e página de visualização de ofertas',
      'Análise de cupons para medir uso e retorno das ações',
      'Notificações para manter clientes informados e engajados',
    ],
  },
  {
    icon: <AssessmentIcon />,
    title: 'Relatórios, vendas e performance',
    items: [
      'Dashboard gerencial para acompanhar a operação em tempo real',
      'Relatórios financeiros, análise de vendas e performance da equipe',
      'Indicadores de clientes, agenda, atendimentos, cupons e resultados',
      'Informações estratégicas para decidir com mais confiança',
    ],
  },
  {
    icon: <StorefrontIcon />,
    title: 'Site, portal e experiência digital',
    items: [
      'Página pública do salão com endereço personalizado por empresa',
      'Portal do cliente para agendamentos, histórico, perfil e recompensas',
      'Página de promoções compartilhável para campanhas comerciais',
      'Experiência responsiva para computador, tablet e celular',
    ],
  },
  {
    icon: <BusinessIcon />,
    title: 'Gestão SaaS e multiempresa',
    items: [
      'Administração de empresas, planos, assinaturas e cobranças',
      'Configuração de pagamentos e relatórios para operação SaaS',
      'Seleção de empresa e módulos para unidade, assinatura, site e cobrança',
      'Estrutura preparada para crescimento com múltiplos negócios',
    ],
  },
  {
    icon: <SecurityIcon />,
    title: 'Administração, segurança e suporte',
    items: [
      'Usuários, permissões, configurações e perfil do sistema',
      'Auditoria, logs, backup e rotinas de manutenção',
      'Chamados para clientes e administradores, além de manual do sistema',
      'Páginas de termos de uso, política de privacidade e tratamento de erros',
    ],
  },
];

const numeros = [
  { value: '12+', label: 'módulos integrados' },
  { value: '50+', label: 'rotinas do negócio cobertas' },
  { value: '24h', label: 'acesso online e responsivo' },
  { value: '360°', label: 'visão completa da operação' },
];

const diferenciais = [
  'Sistema online para salão, barbearia, clínica de estética, esmalteria, spa e negócios de beleza.',
  'Do primeiro cadastro ao pós-venda: agenda, atendimento, financeiro, estoque, marketing, fidelidade e relatórios no mesmo lugar.',
  'Portal do cliente para autoatendimento, histórico, agendamentos, pontos, recompensas, anamnese, notificações e chamados.',
  'Recursos administrativos para equipes, empresas, planos, cobranças, permissões, auditoria, backup e suporte.',
  'Layout responsivo, material imprimível e experiência pensada para computador, tablet e celular.',
];

const pilares = [
  { icon: <CloudSyncIcon />, title: 'Operação conectada', text: 'Todos os setores trabalham com a mesma informação, reduzindo retrabalho e falhas de comunicação.' },
  { icon: <NotificationsActiveIcon />, title: 'Relacionamento ativo', text: 'Use notificações, campanhas, cupons, indicações e fidelidade para trazer o cliente de volta.' },
  { icon: <PaymentsIcon />, title: 'Gestão financeira clara', text: 'Acompanhe fluxo de caixa, contas, compras, comissões e resultados sem planilhas paralelas.' },
  { icon: <BarChartIcon />, title: 'Decisão baseada em dados', text: 'Dashboards e análises mostram vendas, performance, cupons e histórico para orientar o crescimento.' },
];

const FolderDivulgacaoSistema = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 3, md: 6 },
        background:
          'radial-gradient(circle at top left, rgba(255, 255, 255, 0.95) 0, rgba(255, 246, 252, 0.85) 34%, rgba(246, 229, 255, 0.92) 62%, rgba(226, 244, 255, 0.95) 100%)',
        '@media print': {
          py: 0,
          background: '#fff',
        },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, '@media print': { display: 'none' } }}>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
            Imprimir folder completo
          </Button>
        </Box>

        <Paper
          elevation={8}
          sx={{
            overflow: 'hidden',
            borderRadius: { xs: 4, md: 7 },
            border: '1px solid rgba(156, 39, 176, 0.12)',
            '@media print': {
              boxShadow: 'none',
              borderRadius: 0,
              border: 'none',
            },
          }}
        >
          <Box
            sx={{
              p: { xs: 3, md: 6 },
              color: '#fff',
              background: 'linear-gradient(135deg, #5e1b8c 0%, #c2185b 48%, #ff8a00 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.16)', right: -80, top: -90 }} />
            <Box sx={{ position: 'absolute', width: 190, height: 190, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', left: -70, bottom: -80 }} />
            <Grid container spacing={4} alignItems="center" sx={{ position: 'relative' }}>
              <Grid item xs={12} md={7}>
                <Chip icon={<AutoAwesomeIcon />} label="Gestão completa para negócios de beleza" sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 800 }} />
                <Typography variant="h2" component="h1" sx={{ fontWeight: 900, lineHeight: 1, mb: 2 }}>
                  O sistema completo para profissionalizar seu salão
                </Typography>
                <Typography variant="h5" sx={{ maxWidth: 760, opacity: 0.96, lineHeight: 1.35 }}>
                  Agenda, clientes, atendimentos, anamnese, financeiro, estoque, marketing, fidelidade, relatórios, portal do cliente e gestão SaaS em uma única plataforma.
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Stack spacing={2}>
                    <Typography variant="h5" sx={{ color: '#7b1fa2', fontWeight: 900 }}>
                      Controle total da operação, do balcão ao pós-venda.
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      Ideal para transformar rotinas manuais em processos digitais, com mais previsibilidade, produtividade e experiência para o cliente.
                    </Typography>
                    <Divider />
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#c2185b', fontWeight: 800 }}>
                      <DevicesIcon />
                      <Typography fontWeight={800}>Acesse pelo computador, tablet ou celular</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ px: { xs: 3, md: 6 }, py: 3, bgcolor: '#fff8fb' }}>
            <Grid container spacing={2}>
              {numeros.map((numero) => (
                <Grid item xs={6} md={3} key={numero.label}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 4, height: '100%' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#c2185b' }}>{numero.value}</Typography>
                    <Typography sx={{ fontWeight: 800, color: '#4a148c' }}>{numero.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ p: { xs: 3, md: 6 } }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#4a148c', mb: 1, textAlign: 'center' }}>
              Todas as funcionalidades reunidas em módulos completos
            </Typography>
            <Typography sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 860, mx: 'auto', mb: 4 }}>
              Um folder mais completo para apresentar tudo que o sistema entrega para gestores, equipe, clientes e operação administrativa.
            </Typography>

            <Grid container spacing={2.5}>
              {modulos.map((modulo) => (
                <Grid item xs={12} md={6} key={modulo.title}>
                  <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderRadius: 4, borderColor: 'rgba(156, 39, 176, 0.18)', bgcolor: 'rgba(255,255,255,0.82)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <Box sx={{ color: '#c2185b', display: 'flex' }}>{modulo.icon}</Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{modulo.title}</Typography>
                    </Stack>
                    <Stack spacing={0.8}>
                      {modulo.items.map((item) => (
                        <Typography key={item} color="text.secondary" sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <Box component="span" sx={{ color: '#2e7d32', fontWeight: 900, lineHeight: 1.5 }}>✓</Box>
                          {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2.5} sx={{ mt: 2 }}>
              {pilares.map((pilar) => (
                <Grid item xs={12} sm={6} md={3} key={pilar.title}>
                  <Paper sx={{ p: 2.5, height: '100%', borderRadius: 4, bgcolor: '#f6efff' }}>
                    <Box sx={{ color: '#7b1fa2', mb: 1 }}>{pilar.icon}</Box>
                    <Typography sx={{ fontWeight: 900, mb: 1 }}>{pilar.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{pilar.text}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4} sx={{ mt: 2 }} alignItems="stretch">
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 5, bgcolor: '#fff8fb' }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#7b1fa2', mb: 2 }}>
                    Por que escolher este sistema?
                  </Typography>
                  <Stack spacing={1.4}>
                    {diferenciais.map((item) => (
                      <Typography key={item} sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                        <Box component="span" sx={{ color: '#2e7d32', fontWeight: 900 }}>✓</Box>
                        {item}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 5, color: '#fff', background: 'linear-gradient(135deg, #4a148c 0%, #ad1457 100%)' }}>
                  <Stack spacing={2}>
                    <SupportAgentIcon fontSize="large" />
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      Pronto para demonstrar uma solução completa?
                    </Typography>
                    <Typography sx={{ opacity: 0.92 }}>
                      Use este folder para apresentar a plataforma, imprimir uma versão comercial ou divulgar o sistema em reuniões, redes sociais e contatos com clientes.
                    </Typography>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.28)' }} />
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
                      <WhatsAppIcon /> WhatsApp: (00) 00000-0000
                    </Typography>
                    <Typography fontWeight={800}>Site: seusistema.com.br</Typography>
                    <Typography fontWeight={800}>Instagram: @seusistema</Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default FolderDivulgacaoSistema;
