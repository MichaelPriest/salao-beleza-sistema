// src/pages/EmpresaLanding.js
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Room as RoomIcon,
  Spa as SpaIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { siteService } from '../services/siteService';

const getEmpresaContato = (empresa, configuracoes) => ({
  telefone: empresa?.telefone || configuracoes?.salao?.contato?.telefone || configuracoes?.salao?.contato?.whatsapp || '',
  whatsapp: configuracoes?.salao?.contato?.whatsapp || empresa?.telefone || '',
  email: empresa?.email || configuracoes?.salao?.contato?.email || '',
  endereco: configuracoes?.salao?.endereco || empresa?.endereco || {},
});

const formatEndereco = (endereco = {}) => {
  const partes = [endereco.logradouro, endereco.numero, endereco.bairro, endereco.cidade, endereco.estado].filter(Boolean);
  return partes.join(', ');
};

function EmpresaLanding() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [landing, setLanding] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await siteService.buscarLandingEmpresa(slug);
        if (!data) {
          setError('Página da empresa não encontrada ou indisponível.');
          return;
        }
        setLanding(data);
        window.sessionStorage.setItem('empresa_publica_slug', slug);
        window.sessionStorage.setItem('empresa_publica_id', data.empresa.id);
      } catch (err) {
        console.error('Erro ao carregar landing da empresa:', err);
        setError(err.message || 'Erro ao carregar página da empresa.');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [slug]);

  const empresa = landing?.empresa;
  const sitePublico = empresa?.sitePublico || {};
  const config = landing?.configuracoes || {};
  const servicos = landing?.servicos || [];
  const profissionais = landing?.profissionais || [];
  const contato = useMemo(() => getEmpresaContato(empresa, config), [empresa, config]);
  const corPrimaria = sitePublico.corPrimaria || '#9c27b0';
  const titulo = sitePublico.titulo || config?.salao?.nome || empresa?.nome || 'Beauty Pro';
  const subtitulo = sitePublico.subtitulo || 'Agende seus serviços online com facilidade.';
  const logo = sitePublico.logo || config?.salao?.logo;
  const loginUrl = `/cliente/login?empresa=${encodeURIComponent(slug)}`;
  const cadastroUrl = `/cliente/cadastro?empresa=${encodeURIComponent(slug)}`;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      <Box sx={{ background: `linear-gradient(135deg, ${corPrimaria} 0%, #ff4081 100%)`, color: 'white', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={logo || undefined} sx={{ width: 72, height: 72, bgcolor: 'white', color: corPrimaria }}>
                    {!logo && <SpaIcon fontSize="large" />}
                  </Avatar>
                  <Box>
                    <Chip label="Página oficial" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 1 }} />
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>{titulo}</Typography>
                  </Box>
                </Stack>
                <Typography variant="h5" sx={{ opacity: 0.95 }}>{subtitulo}</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button component={RouterLink} to={loginUrl} size="large" variant="contained" startIcon={<LoginIcon />} sx={{ bgcolor: 'white', color: corPrimaria, '&:hover': { bgcolor: '#f5f5f5' } }}>
                    Entrar na área do cliente
                  </Button>
                  <Button component={RouterLink} to={cadastroUrl} size="large" variant="outlined" startIcon={<PersonAddIcon />} sx={{ borderColor: 'white', color: 'white' }}>
                    Criar conta
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Contato e acesso</Typography>
                  <Stack spacing={1.5}>
                    {contato.telefone && <Typography><PhoneIcon sx={{ verticalAlign: 'middle', mr: 1, color: corPrimaria }} />{contato.telefone}</Typography>}
                    {contato.whatsapp && <Typography><WhatsAppIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#25D366' }} />{contato.whatsapp}</Typography>}
                    {formatEndereco(contato.endereco) && <Typography><RoomIcon sx={{ verticalAlign: 'middle', mr: 1, color: corPrimaria }} />{formatEndereco(contato.endereco)}</Typography>}
                    <Typography variant="body2" color="text.secondary">Link da empresa: {empresa.linkPublico || window.location.href}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {sitePublico.mostrarServicos !== false && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Serviços</Typography>
          <Grid container spacing={3}>
            {servicos.length === 0 ? (
              <Grid item xs={12}><Alert severity="info">Esta empresa ainda não publicou serviços.</Alert></Grid>
            ) : servicos.slice(0, 9).map((servico) => (
              <Grid item xs={12} md={4} key={servico.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{servico.nome}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>{servico.descricao || 'Serviço disponível para agendamento.'}</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip label={`${servico.duracao || 30} min`} />
                      <Typography sx={{ color: corPrimaria, fontWeight: 800 }}>R$ {Number(servico.preco || 0).toFixed(2)}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {sitePublico.mostrarProfissionais !== false && profissionais.length > 0 && (
        <Container maxWidth="lg" sx={{ pb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Equipe</Typography>
          <Grid container spacing={3}>
            {profissionais.slice(0, 6).map((profissional) => (
              <Grid item xs={12} sm={6} md={4} key={profissional.id}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar src={profissional.foto || undefined} sx={{ width: 88, height: 88, mx: 'auto', mb: 2, bgcolor: corPrimaria }}>
                      {profissional.nome?.charAt(0) || 'P'}
                    </Avatar>
                    <Typography sx={{ fontWeight: 700 }}>{profissional.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">{profissional.especialidade || profissional.cargo || 'Profissional'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </Box>
  );
}

export default EmpresaLanding;
