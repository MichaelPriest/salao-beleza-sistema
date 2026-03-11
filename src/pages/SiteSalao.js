// src/pages/SiteSalao.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Rating,
  Chip,
  Divider,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fab,
  Drawer,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Schedule as ScheduleIcon,
  Spa as SpaIcon,
  ContentCut as CutIcon,
  Brush as BrushIcon,
  Face as FaceIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { siteService } from '../services/siteService';

// Mapa de nomes dos dias
const nomesDias = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

// Componente de Loading
const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <SpaIcon sx={{ fontSize: 60, color: '#9c27b0' }} />
    </motion.div>
  </Box>
);

function SiteSalao() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [config, setConfig] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  
  const [openAgendamento, setOpenAgendamento] = useState(false);
  const [agendamentoData, setAgendamentoData] = useState({
    clienteNome: '',
    clienteEmail: '',
    clienteTelefone: '',
    servicoId: '',
    profissionalId: '',
    data: '',
    horario: '',
    observacoes: ''
  });
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dados das redes sociais
  const [redesAtivas, setRedesAtivas] = useState({
    instagram: false,
    facebook: false,
    whatsapp: false
  });

  // URLs das redes sociais
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUser, setInstagramUser] = useState('');

  // Depoimentos simulados
  const depoimentos = [
    { id: 1, nome: 'Maria Silva', comentario: 'Melhor salão da cidade! Atendimento excelente.', avaliacao: 5 },
    { id: 2, nome: 'João Santos', comentario: 'Profissionais muito qualificados. Ambiente agradável.', avaliacao: 5 },
    { id: 3, nome: 'Ana Oliveira', comentario: 'Sempre saio satisfeita. Recomendo!', avaliacao: 5 },
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [configData, servicosData, profissionaisData] = await Promise.all([
        siteService.buscarConfiguracoes(),
        siteService.buscarServicos(),
        siteService.buscarProfissionais(),
      ]);
      
      setConfig(configData);
      setServicos(servicosData);
      setProfissionais(profissionaisData);
      
      // Verificar quais redes sociais estão configuradas
      const contato = configData?.salao?.contato || {};
      const instagramAtivo = !!contato.instagram;
      const facebookAtivo = !!contato.facebook;
      
      setRedesAtivas({
        instagram: instagramAtivo,
        facebook: facebookAtivo,
        whatsapp: !!contato.whatsapp
      });

      // Configurar URLs das redes
      if (instagramAtivo) {
        const user = contato.instagram.replace('@', '').trim();
        setInstagramUser(user);
        setInstagramUrl(`https://instagram.com/${user}`);
      }
      
      if (facebookAtivo) {
        let fbUrl = contato.facebook;
        if (!fbUrl.startsWith('http')) {
          fbUrl = `https://facebook.com/${fbUrl}`;
        }
        setFacebookUrl(fbUrl);
      }
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os dados do salão. Tente novamente mais tarde.');
      toast.error('Erro ao carregar dados do salão');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    }
  };

  const gerarHorariosDisponiveis = () => {
    const horarios = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
    ];
    setHorariosDisponiveis(horarios);
  };

  const handleAgendamentoSubmit = async () => {
    try {
      if (!agendamentoData.clienteNome || !agendamentoData.clienteEmail || !agendamentoData.clienteTelefone) {
        mostrarSnackbar('Preencha todos os dados do cliente', 'error');
        return;
      }
      if (!agendamentoData.servicoId || !agendamentoData.profissionalId || !agendamentoData.data || !agendamentoData.horario) {
        mostrarSnackbar('Selecione serviço, profissional, data e horário', 'error');
        return;
      }

      const servico = servicos.find(s => s.id === agendamentoData.servicoId);
      const profissional = profissionais.find(p => p.id === agendamentoData.profissionalId);

      // Verificar disponibilidade
      const disponivel = await siteService.verificarDisponibilidade(
        agendamentoData.profissionalId,
        agendamentoData.data,
        agendamentoData.horario
      );

      if (!disponivel) {
        mostrarSnackbar('Horário não disponível. Escolha outro horário.', 'error');
        return;
      }

      await siteService.criarAgendamento({
        clienteNome: agendamentoData.clienteNome,
        clienteEmail: agendamentoData.clienteEmail,
        clienteTelefone: agendamentoData.clienteTelefone,
        profissionalId: agendamentoData.profissionalId,
        profissionalNome: profissional?.nome,
        servicoId: agendamentoData.servicoId,
        servicoNome: servico?.nome,
        valor: servico?.preco,
        data: agendamentoData.data,
        horario: agendamentoData.horario,
        observacoes: agendamentoData.observacoes
      });
      
      mostrarSnackbar('Agendamento realizado com sucesso! Entraremos em contato para confirmar.', 'success');
      setOpenAgendamento(false);
      setAgendamentoData({
        clienteNome: '',
        clienteEmail: '',
        clienteTelefone: '',
        servicoId: '',
        profissionalId: '',
        data: '',
        horario: '',
        observacoes: ''
      });
      
    } catch (error) {
      console.error('Erro ao agendar:', error);
      mostrarSnackbar('Erro ao realizar agendamento', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const salaoNome = config?.salao?.nome || 'Beauty Pro';
  const salaoLogo = config?.salao?.logo;
  const salaoEndereco = config?.salao?.endereco;
  const contato = config?.salao?.contato || {};

  // Função para formatar horário de funcionamento
  const formatarHorarioFuncionamento = () => {
    if (!config?.horarioFuncionamento) return 'Segunda a Sexta: 09:00 - 19:00 | Sábado: 09:00 - 18:00';
    
    const diasAbertos = Object.entries(config.horarioFuncionamento)
      .filter(([_, h]) => h.aberto)
      .map(([dia, h]) => `${nomesDias[dia]}: ${h.abertura} - ${h.fechamento}`);
    
    return diasAbertos.join(' | ');
  };

  return (
    <Box sx={{ bgcolor: '#faf5ff', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'white', 
          color: '#9c27b0',
          boxShadow: '0 2px 20px rgba(156,39,176,0.1)',
        }}
      >
        <Toolbar>
          {salaoLogo ? (
            <Box
              component="img"
              src={salaoLogo}
              alt={salaoNome}
              sx={{
                height: 50,
                width: 'auto',
                maxWidth: 150,
                mr: 2,
                objectFit: 'contain',
              }}
            />
          ) : (
            <SpaIcon sx={{ fontSize: 40, mr: 1, color: '#9c27b0' }} />
          )}
          
          {!salaoLogo && (
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, color: '#9c27b0' }}>
              {salaoNome}
            </Typography>
          )}
          
          {isMobile ? (
            <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ color: '#9c27b0' }}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, justifyContent: 'flex-end' }}>
              {['home', 'servicos', 'profissionais', 'redes', 'contato'].map((item) => (
                <Button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  sx={{
                    color: activeSection === item ? '#9c27b0' : '#666',
                    fontWeight: activeSection === item ? 600 : 400,
                  }}
                >
                  {item === 'home' ? 'Início' : 
                   item === 'servicos' ? 'Serviços' : 
                   item === 'profissionais' ? 'Profissionais' : 
                   item === 'redes' ? 'Redes Sociais' : 'Contato'}
                </Button>
              ))}
              <Button
                variant="contained"
                onClick={() => setOpenAgendamento(true)}
                sx={{
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                  color: 'white',
                  ml: 2,
                }}
              >
                Agendar Agora
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ sx: { width: 280, bgcolor: '#faf5ff' } }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {salaoLogo && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Box
                component="img"
                src={salaoLogo}
                alt={salaoNome}
                sx={{
                  height: 60,
                  width: 'auto',
                  mx: 'auto',
                  mb: 1,
                }}
              />
            </Box>
          )}
          
          <List>
            {['home', 'servicos', 'profissionais', 'redes', 'contato'].map((item) => (
              <ListItem key={item} button onClick={() => scrollToSection(item)}>
                <ListItemText 
                  primary={item === 'home' ? 'Início' : 
                          item === 'servicos' ? 'Serviços' : 
                          item === 'profissionais' ? 'Profissionais' : 
                          item === 'redes' ? 'Redes Sociais' : 'Contato'}
                />
              </ListItem>
            ))}
            <ListItem>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOpenAgendamento(true);
                }}
                sx={{
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                  color: 'white',
                  mt: 2,
                }}
              >
                Agendar Agora
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Espaçador */}
      <Toolbar id="home" />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
                Realce sua{' '}
                <span style={{ color: '#9c27b0' }}>Beleza</span>
              </Typography>
              <Typography variant="h5" color="textSecondary" sx={{ mb: 3 }}>
                O melhor salão para cuidar de você com profissionais qualificados e atendimento personalizado.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => setOpenAgendamento(true)}
                sx={{
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Agende seu Horário
              </Button>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Salão de Beleza"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 40px rgba(156,39,176,0.2)',
                }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Serviços Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }} id="servicos">
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 6 }}>
            Nossos <span style={{ color: '#9c27b0' }}>Serviços</span>
          </Typography>

          {servicos.length === 0 ? (
            <Typography align="center" color="textSecondary">
              Em breve novos serviços serão disponibilizados.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {servicos.map((servico, index) => (
                <Grid item xs={12} sm={6} md={4} key={servico.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10 }}
                  >
                    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
                      <CardContent>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: '#9c27b0',
                            position: 'absolute',
                            top: -30,
                            left: 20,
                          }}
                        >
                          {servico.categoria === 'Cabelo' ? <CutIcon /> :
                           servico.categoria === 'Unhas' ? <BrushIcon /> :
                           servico.categoria === 'Maquiagem' ? <FaceIcon /> :
                           <SpaIcon />}
                        </Avatar>
                        
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {servico.nome}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            {servico.descricao || 'Serviço de qualidade com profissionais especializados.'}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              label={`${servico.duracao} min`}
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 600 }}>
                              R$ {servico.preco?.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Profissionais Section */}
      <Box sx={{ py: 8 }} id="profissionais">
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 6 }}>
            Nossa <span style={{ color: '#9c27b0' }}>Equipe</span>
          </Typography>

          {profissionais.length === 0 ? (
            <Typography align="center" color="textSecondary">
              Em breve nossa equipe será apresentada.
            </Typography>
          ) : (
            <Grid container spacing={4}>
              {profissionais.map((prof, index) => (
                <Grid item xs={12} sm={6} md={4} key={prof.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card sx={{ textAlign: 'center', p: 2 }}>
                      <Avatar
                        src={prof.foto}
                        sx={{
                          width: 120,
                          height: 120,
                          mx: 'auto',
                          mb: 2,
                          border: '4px solid #9c27b0',
                        }}
                      >
                        {prof.nome?.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {prof.nome}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {prof.especialidade}
                      </Typography>
                      <Rating value={5} readOnly size="small" />
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Redes Sociais Section - Versão com Cards e Links Diretos */}
      {(redesAtivas.instagram || redesAtivas.facebook) && (
        <Box sx={{ bgcolor: 'white', py: 8 }} id="redes">
          <Container maxWidth="lg">
            <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 2 }}>
              Siga-nos nas <span style={{ color: '#9c27b0' }}>Redes Sociais</span>
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 6 }}>
              Acompanhe nosso trabalho e novidades
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              {/* Instagram Card */}
              {redesAtivas.instagram && instagramUser && (
                <Grid item xs={12} md={6} lg={redesAtivas.facebook ? 4 : 6}>
                  <Card 
                    sx={{ 
                      textAlign: 'center', 
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 10px 40px rgba(225,48,108,0.3)',
                      }
                    }}
                    onClick={() => window.open(instagramUrl, '_blank')}
                  >
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#E1306C',
                        mb: 2,
                      }}
                    >
                      <InstagramIcon sx={{ fontSize: 60 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Instagram
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                      @{instagramUser}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<InstagramIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(instagramUrl, '_blank');
                      }}
                      sx={{
                        bgcolor: '#E1306C',
                        '&:hover': { bgcolor: '#C13584' },
                        mt: 2
                      }}
                    >
                      Seguir no Instagram
                    </Button>
                  </Card>
                </Grid>
              )}

              {/* Facebook Card */}
              {redesAtivas.facebook && facebookUrl && (
                <Grid item xs={12} md={6} lg={redesAtivas.instagram ? 4 : 6}>
                  <Card 
                    sx={{ 
                      textAlign: 'center', 
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 10px 40px rgba(66,103,178,0.3)',
                      }
                    }}
                    onClick={() => window.open(facebookUrl, '_blank')}
                  >
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#4267B2',
                        mb: 2,
                      }}
                    >
                      <FacebookIcon sx={{ fontSize: 60 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Facebook
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                      {contato.facebook}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<FacebookIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(facebookUrl, '_blank');
                      }}
                      sx={{
                        bgcolor: '#4267B2',
                        '&:hover': { bgcolor: '#365899' },
                        mt: 2
                      }}
                    >
                      Curtir no Facebook
                    </Button>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Contato Section */}
      <Box sx={{ py: 8 }} id="contato">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
                Entre em <span style={{ color: '#9c27b0' }}>Contato</span>
              </Typography>
              
              <List>
                {salaoEndereco && (salaoEndereco.logradouro || salaoEndereco.cidade) && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Endereço"
                      secondary={`${salaoEndereco.logradouro || ''}, ${salaoEndereco.numero || ''} - ${salaoEndereco.bairro || ''}, ${salaoEndereco.cidade || ''}/${salaoEndereco.estado || ''}`}
                    />
                  </ListItem>
                )}
                
                {contato.telefone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Telefone"
                      secondary={contato.telefone}
                    />
                  </ListItem>
                )}
                
                {contato.email && (
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email"
                      secondary={contato.email}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon sx={{ color: '#9c27b0' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Horário de Funcionamento"
                    secondary={formatarHorarioFuncionamento()}
                  />
                </ListItem>
              </List>

              {/* Ícones das redes no contato */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {redesAtivas.whatsapp && contato.whatsapp && (
                  <IconButton 
                    href={`https://wa.me/${contato.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    sx={{ color: '#25D366' }}
                  >
                    <WhatsAppIcon />
                  </IconButton>
                )}
                
                {redesAtivas.instagram && instagramUser && (
                  <IconButton 
                    href={instagramUrl} 
                    target="_blank" 
                    sx={{ color: '#E1306C' }}
                  >
                    <InstagramIcon />
                  </IconButton>
                )}
                
                {redesAtivas.facebook && facebookUrl && (
                  <IconButton 
                    href={facebookUrl} 
                    target="_blank" 
                    sx={{ color: '#4267B2' }}
                  >
                    <FacebookIcon />
                  </IconButton>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: '#f3e5f5' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
                  Faça seu Agendamento
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Preencha o formulário abaixo e entraremos em contato para confirmar seu horário.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Seu Nome"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Melhor horário"
                      size="small"
                      placeholder="Ex: Manhã"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => setOpenAgendamento(true)}
                      sx={{
                        background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                        color: 'white',
                      }}
                    >
                      Solicitar Agendamento
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#9c27b0', color: 'white', py: 3, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {salaoLogo ? (
                  <Box
                    component="img"
                    src={salaoLogo}
                    alt={salaoNome}
                    sx={{
                      height: 30,
                      width: 'auto',
                      mr: 1,
                      bgcolor: 'white',
                      borderRadius: 1,
                      p: 0.5,
                    }}
                  />
                ) : (
                  <SpaIcon sx={{ mr: 1 }} />
                )}
                {!salaoLogo && (
                  <Typography variant="h6">{salaoNome}</Typography>
                )}
              </Box>
            </Grid>
            <Grid item>
              <Typography variant="body2">
                © {new Date().getFullYear()} - Todos os direitos reservados
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Botão flutuante do WhatsApp */}
      {redesAtivas.whatsapp && contato.whatsapp && (
        <Fab
          color="success"
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
          href={`https://wa.me/${contato.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
        >
          <WhatsAppIcon />
        </Fab>
      )}

      {/* Dialog de Agendamento */}
      <Dialog open={openAgendamento} onClose={() => setOpenAgendamento(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Agendar Horário
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Seu Nome"
                value={agendamentoData.clienteNome}
                onChange={(e) => setAgendamentoData({ ...agendamentoData, clienteNome: e.target.value })}
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Seu Email"
                type="email"
                value={agendamentoData.clienteEmail}
                onChange={(e) => setAgendamentoData({ ...agendamentoData, clienteEmail: e.target.value })}
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={agendamentoData.clienteTelefone}
                onChange={(e) => setAgendamentoData({ ...agendamentoData, clienteTelefone: e.target.value })}
                size="small"
                required
                placeholder="(11) 99999-9999"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Serviço</InputLabel>
                <Select
                  value={agendamentoData.servicoId}
                  label="Serviço"
                  onChange={(e) => setAgendamentoData({ ...agendamentoData, servicoId: e.target.value })}
                >
                  {servicos.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.nome} - R$ {s.preco?.toFixed(2)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Profissional</InputLabel>
                <Select
                  value={agendamentoData.profissionalId}
                  label="Profissional"
                  onChange={(e) => {
                    setAgendamentoData({ ...agendamentoData, profissionalId: e.target.value });
                    gerarHorariosDisponiveis();
                  }}
                >
                  {profissionais.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Data"
                value={agendamentoData.data}
                onChange={(e) => {
                  setAgendamentoData({ ...agendamentoData, data: e.target.value });
                  gerarHorariosDisponiveis();
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Horário</InputLabel>
                <Select
                  value={agendamentoData.horario}
                  label="Horário"
                  onChange={(e) => setAgendamentoData({ ...agendamentoData, horario: e.target.value })}
                >
                  {horariosDisponiveis.map(h => (
                    <MenuItem key={h} value={h}>{h}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={2}
                value={agendamentoData.observacoes}
                onChange={(e) => setAgendamentoData({ ...agendamentoData, observacoes: e.target.value })}
                size="small"
                placeholder="Alguma observação especial?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAgendamento(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAgendamentoSubmit}
            sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
          >
            Confirmar Agendamento
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SiteSalao;
