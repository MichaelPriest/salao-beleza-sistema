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

const recursos = [
  {
    icon: <CalendarMonthIcon />,
    title: 'Agenda inteligente',
    text: 'Controle horários, profissionais, confirmações e histórico de atendimentos em poucos cliques.',
  },
  {
    icon: <PeopleAltIcon />,
    title: 'Clientes organizados',
    text: 'Cadastro completo, preferências, anamnese, aniversários e relacionamento centralizado.',
  },
  {
    icon: <PointOfSaleIcon />,
    title: 'Financeiro completo',
    text: 'Acompanhe vendas, contas a pagar e receber, fluxo de caixa, compras e comissões.',
  },
  {
    icon: <Inventory2Icon />,
    title: 'Estoque sem perdas',
    text: 'Gerencie produtos, fornecedores, entradas, categorias e reposições com mais segurança.',
  },
  {
    icon: <LoyaltyIcon />,
    title: 'Fidelidade e marketing',
    text: 'Crie pontos, recompensas, indicações, cupons e campanhas para vender mais.',
  },
  {
    icon: <AssessmentIcon />,
    title: 'Relatórios estratégicos',
    text: 'Visualize indicadores de vendas, performance, agenda e resultados para decidir melhor.',
  },
];

const diferenciais = [
  'Sistema online para salão, barbearia, clínica de estética e negócios de beleza',
  'Portal do cliente para agendamentos, histórico, pontos e notificações',
  'Permissões por usuário e recursos administrativos para equipes',
  'Layout responsivo para computador, tablet e celular',
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
            Imprimir folder
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
              background:
                'linear-gradient(135deg, #7b1fa2 0%, #c2185b 46%, #ff8a00 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: 260,
                height: 260,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.16)',
                right: -70,
                top: -90,
              }}
            />
            <Grid container spacing={4} alignItems="center" sx={{ position: 'relative' }}>
              <Grid item xs={12} md={7}>
                <Chip
                  icon={<AutoAwesomeIcon />}
                  label="Gestão completa para beleza"
                  sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700 }}
                />
                <Typography variant="h2" component="h1" sx={{ fontWeight: 900, lineHeight: 1, mb: 2 }}>
                  Transforme seu salão em uma operação digital
                </Typography>
                <Typography variant="h5" sx={{ maxWidth: 720, opacity: 0.96, lineHeight: 1.35 }}>
                  Um sistema moderno para agendar, atender, vender, fidelizar clientes e acompanhar todos os números do seu negócio em tempo real.
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Stack spacing={2}>
                    <Typography variant="h5" sx={{ color: '#7b1fa2', fontWeight: 900 }}>
                      Mais controle. Mais clientes. Mais resultado.
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      Centralize agenda, financeiro, estoque, marketing e relacionamento em uma única plataforma fácil de usar.
                    </Typography>
                    <Divider />
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#c2185b', fontWeight: 800 }}>
                      <DevicesIcon />
                      <Typography fontWeight={800}>Acesse de qualquer dispositivo</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: { xs: 3, md: 6 } }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#4a148c', mb: 3, textAlign: 'center' }}>
              Tudo que seu negócio precisa para crescer
            </Typography>
            <Grid container spacing={2.5}>
              {recursos.map((recurso) => (
                <Grid item xs={12} sm={6} md={4} key={recurso.title}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      height: '100%',
                      borderRadius: 4,
                      borderColor: 'rgba(156, 39, 176, 0.18)',
                      bgcolor: 'rgba(255,255,255,0.78)',
                    }}
                  >
                    <Box sx={{ color: '#c2185b', mb: 1 }}>{recurso.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                      {recurso.title}
                    </Typography>
                    <Typography color="text.secondary">{recurso.text}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4} sx={{ mt: 2 }} alignItems="stretch">
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 5, bgcolor: '#fff8fb' }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#7b1fa2', mb: 2 }}>
                    Diferenciais do sistema
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
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 5,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #4a148c 0%, #ad1457 100%)',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
                    Pronto para profissionalizar sua gestão?
                  </Typography>
                  <Typography sx={{ mb: 3, opacity: 0.92 }}>
                    Solicite uma demonstração e veja como simplificar a rotina da sua equipe desde o primeiro atendimento.
                  </Typography>
                  <Stack spacing={1.2}>
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
