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
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
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
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  Computer as ComputerIcon,
  PhoneAndroid as PhoneAndroidIcon,
  QrCode as QrCodeIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
  Info as InfoIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  Share as ShareIcon,
  ContactPhone as ContactIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { siteService } from '../services/siteService';
import { QRCodeSVG } from 'qrcode.react';

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

// Mapa de ícones para o menu
const menuItems = [
  { id: 'home', label: 'Início', icon: <HomeIcon /> },
  { id: 'servicos', label: 'Serviços', icon: <StoreIcon /> },
  { id: 'profissionais', label: 'Profissionais', icon: <PeopleIcon /> },
  { id: 'redes', label: 'Redes Sociais', icon: <ShareIcon /> },
  { id: 'contato', label: 'Contato', icon: <ContactIcon /> },
  { id: 'tutorial', label: 'Área Restrita', icon: <LockIcon /> },
];

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

// Função para sanitizar strings
const sanitizarString = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
};

// Função para sanitizar arrays de dados
const sanitizarServicos = (servicos) => {
  if (!Array.isArray(servicos)) return [];
  return servicos.map(servico => ({
    id: servico.id || `servico_${Date.now()}_${Math.random()}`,
    nome: sanitizarString(servico.nome, 'Serviço'),
    descricao: sanitizarString(servico.descricao, 'Serviço de qualidade com profissionais especializados.'),
    categoria: sanitizarString(servico.categoria, 'Outros'),
    preco: typeof servico.preco === 'number' && !isNaN(servico.preco) ? servico.preco : 0,
    duracao: typeof servico.duracao === 'number' && !isNaN(servico.duracao) ? servico.duracao : 30,
  }));
};

const sanitizarProfissionais = (profissionais) => {
  if (!Array.isArray(profissionais)) return [];
  return profissionais.map(prof => ({
    id: prof.id || `prof_${Date.now()}_${Math.random()}`,
    nome: sanitizarString(prof.nome, 'Profissional'),
    especialidade: sanitizarString(prof.especialidade, 'Especialidade'),
    foto: sanitizarString(prof.foto, ''),
    avaliacao: typeof prof.avaliacao === 'number' && !isNaN(prof.avaliacao) ? prof.avaliacao : 5,
  }));
};

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

  // URL base para o sistema
  const baseUrl = window.location.origin;

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
      
      setConfig(configData || {});
      setServicos(sanitizarServicos(servicosData));
      setProfissionais(sanitizarProfissionais(profissionaisData));
      
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
      if (instagramAtivo && contato.instagram) {
        const user = String(contato.instagram).replace('@', '').trim();
        setInstagramUser(user);
        setInstagramUrl(`https://instagram.com/${user}`);
      }
      
      if (facebookAtivo && contato.facebook) {
        let fbUrl = String(contato.facebook);
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

  // Função para formatar horário de funcionamento
  const formatarHorarioFuncionamento = () => {
    if (!config?.horarioFuncionamento) return 'Segunda a Sexta: 09:00 - 19:00 | Sábado: 09:00 - 18:00';
    
    const diasAbertos = Object.entries(config.horarioFuncionamento)
      .filter(([_, h]) => h && h.aberto === true)
      .map(([dia, h]) => {
        const nomeDia = nomesDias[dia] || dia;
        const abertura = h.abertura || '09:00';
        const fechamento = h.fechamento || '18:00';
        return `${nomeDia}: ${abertura} - ${fechamento}`;
      });
    
    return diasAbertos.length > 0 ? diasAbertos.join(' | ') : 'Segunda a Sexta: 09:00 - 19:00 | Sábado: 09:00 - 18:00';
  };

  // Função para obter ícone do serviço
  const getServicoIcon = (categoria) => {
    const cat = sanitizarString(categoria).toLowerCase();
    if (cat.includes('cabelo')) return <CutIcon />;
    if (cat.includes('unha')) return <BrushIcon />;
    if (cat.includes('maquiagem')) return <FaceIcon />;
    return <SpaIcon />;
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

  const salaoNome = sanitizarString(config?.salao?.nome, 'Beauty Pro');
  const salaoLogo = config?.salao?.logo ? String(config.salao.logo) : null;
  const salaoEndereco = config?.salao?.endereco || {};
  const contato = config?.salao?.contato || {};

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
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo e Nome */}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => scrollToSection('home')}>
            {salaoLogo ? (
              <Box
                component="img"
                src={salaoLogo}
                alt={salaoNome}
                sx={{
                  width: 200,
                  height: 200,
                  objectFit: 'contain',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  border: 'none',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <SpaIcon sx={{ fontSize: { xs: 30, sm: 40 }, mr: 1, color: '#9c27b0' }} />
            )}
            
            {!salaoLogo && (
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {salaoNome}
              </Typography>
            )}
          </Box>
          
          {/* Menu Desktop */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  startIcon={item.icon}
                  sx={{
                    color: activeSection === item.id ? '#9c27b0' : '#666',
                    fontWeight: activeSection === item.id ? 600 : 400,
                    '&:hover': {
                      backgroundColor: 'rgba(156,39,176,0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          ) : (
            <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ color: '#9c27b0' }}>
              <MenuIcon />
            </IconButton>
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
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                component="img"
                src={salaoLogo}
                alt={salaoNome}
                sx={{
                  width: 200,
                  height: 200,
                  objectFit: 'contain',
                  mx: 'auto',
                  mb: 1,
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  border: 'none',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 600 }}>
                {salaoNome}
              </Typography>
            </Box>
          )}
          
          <List>
            {menuItems.map((item) => (
              <ListItem 
                key={item.id} 
                button 
                onClick={() => scrollToSection(item.id)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: activeSection === item.id ? 'rgba(156,39,176,0.1)' : 'transparent',
                }}
              >
                <ListItemIcon sx={{ color: activeSection === item.id ? '#9c27b0' : '#666' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{ color: activeSection === item.id ? '#9c27b0' : '#666' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Espaçador para o header fixo */}
      <Toolbar id="home" />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2, 
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } 
                }}
              >
                Realce sua{' '}
                <span style={{ color: '#9c27b0' }}>Beleza</span>
              </Typography>
              <Typography variant="h5" color="textSecondary" sx={{ mb: 3, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                O melhor salão para cuidar de você com profissionais qualificados e atendimento personalizado.
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Para agendar um horário, acesse a Área do Cliente e faça login ou cadastre-se.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => scrollToSection('tutorial')}
                sx={{
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Área do Cliente
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

      {/* Seção de Área Restrita - TUTORIAL */}
      <Box sx={{ bgcolor: 'white', py: { xs: 4, md: 8 } }} id="tutorial">
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            Área <span style={{ color: '#9c27b0' }}>Restrita</span>
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 6, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Acesse o sistema administrativo ou a área do cliente
          </Typography>

          <Grid container spacing={4}>
            {/* Acesso Administrativo */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)',
                    border: '2px solid #9c27b0',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 40px rgba(156,39,176,0.2)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      bgcolor: 'rgba(156,39,176,0.1)',
                    }}
                  />
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#9c27b0',
                        mb: 2,
                        mx: 'auto',
                      }}
                    >
                      <AdminIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                      Administração
                    </Typography>
                    <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
                      Acesso exclusivo para administradores, gerentes, atendentes e profissionais do salão.
                    </Typography>

                    <Accordion sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 600 }}>💻 Como acessar no Computador</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><ComputerIcon sx={{ color: '#9c27b0' }} /></ListItemIcon>
                            <ListItemText 
                              primary="1. Abra seu navegador"
                              secondary="Chrome, Firefox, Edge ou Safari"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><LoginIcon sx={{ color: '#9c27b0' }} /></ListItemIcon>
                            <ListItemText 
                              primary="2. Acesse o link:"
                              secondary={
                                <Link 
                                  href={`${baseUrl}/login`} 
                                  target="_blank" 
                                  sx={{ fontWeight: 600, color: '#9c27b0' }}
                                >
                                  {baseUrl}/login
                                </Link>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><DashboardIcon sx={{ color: '#9c27b0' }} /></ListItemIcon>
                            <ListItemText 
                              primary="3. Faça login com seu email e senha"
                              secondary="Use as credenciais fornecidas pelo administrador"
                            />
                          </ListItem>
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 600 }}>📱 Como acessar no Celular</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><PhoneAndroidIcon sx={{ color: '#9c27b0' }} /></ListItemIcon>
                            <ListItemText 
                              primary="1. Abra o navegador do celular"
                              secondary="Chrome, Safari ou navegador padrão"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><QrCodeIcon sx={{ color: '#9c27b0' }} /></ListItemIcon>
                            <ListItemText 
                              primary="2. Acesse o mesmo link ou escaneie o QR Code"
                            />
                          </ListItem>
                        </List>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <QRCodeSVG
                            value={`${baseUrl}/login`}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#9c27b0"
                            level="H"
                          />
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        size="large"
                        href="/login"
                        startIcon={<AdminIcon />}
                        sx={{
                          background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                          color: 'white',
                          px: 4,
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        Acessar Painel Administrativo
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>

            {/* Área do Cliente */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    p: 3,
                    background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)',
                    border: '2px solid #ff9800',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 40px rgba(255,152,0,0.2)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,152,0,0.1)',
                    }}
                  />
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#ff9800',
                        mb: 2,
                        mx: 'auto',
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                      Área do Cliente
                    </Typography>
                    <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
                      Acesse sua área exclusiva para agendar serviços, acompanhar agendamentos, histórico e programa de fidelidade.
                    </Typography>

                    <Accordion sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 600 }}>💻 Como acessar no Computador</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><ComputerIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                            <ListItemText 
                              primary="1. Abra seu navegador"
                              secondary="Chrome, Firefox, Edge ou Safari"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><LoginIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                            <ListItemText 
                              primary="2. Acesse o link:"
                              secondary={
                                <Link 
                                  href={`${baseUrl}/cliente/login`} 
                                  target="_blank" 
                                  sx={{ fontWeight: 600, color: '#ff9800' }}
                                >
                                  {baseUrl}/cliente/login
                                </Link>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><DashboardIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                            <ListItemText 
                              primary="3. Faça login com seu email e senha"
                              secondary="Use as credenciais criadas no cadastro"
                            />
                          </ListItem>
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 600 }}>📱 Como acessar no Celular</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><PhoneAndroidIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                            <ListItemText 
                              primary="1. Abra o navegador do celular"
                              secondary="Chrome, Safari ou navegador padrão"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><QrCodeIcon sx={{ color: '#ff9800' }} /></ListItemIcon>
                            <ListItemText 
                              primary="2. Acesse o mesmo link ou escaneie o QR Code"
                            />
                          </ListItem>
                        </List>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <QRCodeSVG
                            value={`${baseUrl}/cliente/login`}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#ff9800"
                            level="H"
                          />
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        size="large"
                        href="/cliente/login"
                        startIcon={<PersonIcon />}
                        sx={{
                          background: 'linear-gradient(45deg, #ff9800 30%, #f44336 90%)',
                          color: 'white',
                          px: 4,
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        Acessar Área do Cliente
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Informações adicionais */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Paper sx={{ mt: 4, p: 3, bgcolor: '#f3e5f5', borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    <InfoIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#9c27b0' }} />
                    Primeiro acesso?
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Para a área administrativa, suas credenciais são fornecidas pelo administrador do sistema.
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Para a área do cliente, você pode se cadastrar clicando em "Criar conta" na página de login.
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • O sistema é responsivo e funciona perfeitamente em qualquer dispositivo.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Badge badgeContent="Novo" color="secondary">
                    <SchoolIcon sx={{ fontSize: 60, color: '#9c27b0' }} />
                  </Badge>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        </Container>
      </Box>

      {/* Serviços Section */}
      <Box sx={{ bgcolor: 'white', py: { xs: 4, md: 8 } }} id="servicos">
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              fontWeight: 700, 
              mb: 6,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
            }}
          >
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
                    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible', transition: '0.3s' }}>
                      <CardContent>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: '#9c27b0',
                            position: 'absolute',
                            top: -30,
                            left: 20,
                            boxShadow: '0 4px 10px rgba(156,39,176,0.3)',
                          }}
                        >
                          {getServicoIcon(servico.categoria)}
                        </Avatar>
                        
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {servico.nome}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            {servico.descricao}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              label={`${servico.duracao} min`}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                            />
                            <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 600 }}>
                              R$ {servico.preco.toFixed(2)}
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
      <Box sx={{ py: { xs: 4, md: 8 } }} id="profissionais">
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              fontWeight: 700, 
              mb: 6,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
            }}
          >
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
                    <Card sx={{ textAlign: 'center', p: 3, transition: '0.3s' }}>
                      <Avatar
                        src={prof.foto || undefined}
                        sx={{
                          width: 120,
                          height: 120,
                          mx: 'auto',
                          mb: 2,
                          border: '4px solid #9c27b0',
                        }}
                      >
                        {prof.nome.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {prof.nome}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {prof.especialidade}
                      </Typography>
                      <Rating value={prof.avaliacao} readOnly size="small" sx={{ color: '#ff9800' }} />
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Redes Sociais Section */}
      {(redesAtivas.instagram || redesAtivas.facebook) && (
        <Box sx={{ bgcolor: 'white', py: { xs: 4, md: 8 } }} id="redes">
          <Container maxWidth="lg">
            <Typography 
              variant="h3" 
              align="center" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              Siga-nos nas <span style={{ color: '#9c27b0' }}>Redes Sociais</span>
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 6, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Acompanhe nosso trabalho e novidades
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              {/* Instagram Card */}
              {redesAtivas.instagram && instagramUser && (
                <Grid item xs={12} md={6} lg={redesAtivas.facebook ? 4 : 6}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
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
                  </motion.div>
                </Grid>
              )}

              {/* Facebook Card */}
              {redesAtivas.facebook && facebookUrl && (
                <Grid item xs={12} md={6} lg={redesAtivas.instagram ? 4 : 6}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
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
                  </motion.div>
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Contato Section */}
      <Box sx={{ py: { xs: 4, md: 8 } }} id="contato">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
                }}
              >
                Entre em <span style={{ color: '#9c27b0' }}>Contato</span>
              </Typography>
              
              <List>
                {(salaoEndereco.logradouro || salaoEndereco.cidade) && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon sx={{ color: '#9c27b0' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Endereço"
                      secondary={[
                        salaoEndereco.logradouro || '',
                        salaoEndereco.numero ? `, ${salaoEndereco.numero}` : '',
                        salaoEndereco.bairro ? ` - ${salaoEndereco.bairro}` : '',
                        salaoEndereco.cidade ? `, ${salaoEndereco.cidade}` : '',
                        salaoEndereco.estado ? `/${salaoEndereco.estado}` : ''
                      ].filter(Boolean).join('') || 'Endereço não informado'}
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
                    href={`https://wa.me/${String(contato.whatsapp).replace(/\D/g, '')}`} 
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
              <Paper sx={{ p: 3, bgcolor: '#f3e5f5', borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
                  Precisa de ajuda?
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Entre em contato conosco através dos canais acima ou acesse a Área do Cliente para agendar seus serviços.
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  <strong>💡 Dica:</strong> Para agendar, cancelar ou reagendar horários, acesse a{" "}
                  <Link href="/cliente/login" sx={{ color: '#9c27b0', fontWeight: 600 }}>
                    Área do Cliente
                  </Link>{" "}
                  com seu login e senha.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#9c27b0', color: 'white', py: 3, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                {salaoLogo && (
                  <Box
                    component="img"
                    src={salaoLogo}
                    alt={salaoNome}
                    sx={{
                      width: 200,
                      height: 200,
                      objectFit: 'contain',
                      mr: 1,
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      border: 'none',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <Typography variant="body2">
                  © {new Date().getFullYear()} - {salaoNome} - Todos os direitos reservados
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Botão flutuante do WhatsApp */}
      {redesAtivas.whatsapp && contato.whatsapp && (
        <Fab
          color="success"
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20,
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
          href={`https://wa.me/${String(contato.whatsapp).replace(/\D/g, '')}`}
          target="_blank"
        >
          <WhatsAppIcon />
        </Fab>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SiteSalao;
