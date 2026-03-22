// src/components/Footer.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  TextField,
  Button,
  Snackbar,
  Alert,
  Chip,
  Stack,
  Tooltip,
  Collapse,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Send as SendIcon,
  ArrowUpward as ArrowUpIcon,
  Copyright as CopyrightIcon,
  Security as SecurityIcon,
  LocalOffer as OfferIcon,
  Help as HelpIcon,
  Description as TermsIcon,
  PrivacyTip as PrivacyIcon,
  Store as StoreIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  SupportAgent as SupportIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

function Footer() {
  const [config, setConfig] = useState(null);
  const [emailNewsletter, setEmailNewsletter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    carregarConfiguracoes();
    
    // Detectar scroll para mostrar botão de voltar ao topo
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const carregarConfiguracoes = async () => {
    try {
      const configuracoes = await firebaseService.getAll('configuracoes');
      if (configuracoes && configuracoes.length > 0) {
        setConfig(configuracoes[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!emailNewsletter) {
      setSnackbar({ open: true, message: 'Digite um e-mail válido', severity: 'error' });
      return;
    }

    try {
      // Aqui você pode implementar o envio para sua API de newsletter
      console.log('Inscrição na newsletter:', emailNewsletter);
      
      setSnackbar({ open: true, message: 'Inscrição realizada com sucesso!', severity: 'success' });
      setEmailNewsletter('');
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      setSnackbar({ open: true, message: 'Erro ao realizar inscrição', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const linksRapidos = [
    { label: 'Início', path: '/', icon: <StoreIcon fontSize="small" /> },
    { label: 'Serviços', path: '/servicos', icon: <StarIcon fontSize="small" /> },
    { label: 'Profissionais', path: '/profissionais', icon: <SupportIcon fontSize="small" /> },
    { label: 'Agendamentos', path: '/agendamentos', icon: <CalendarIcon fontSize="small" /> },
    { label: 'Promoções', path: '/promocoes', icon: <OfferIcon fontSize="small" /> },
    { label: 'Contato', path: '/contato', icon: <HelpIcon fontSize="small" /> },
  ];

  const linksInstitucionais = [
    { label: 'Sobre Nós', path: '/sobre', icon: <StoreIcon fontSize="small" /> },
    { label: 'Política de Privacidade', path: '/politica-privacidade', icon: <PrivacyIcon fontSize="small" /> },
    { label: 'Termos de Uso', path: '/termos-uso', icon: <TermsIcon fontSize="small" /> },
    { label: 'Trabalhe Conosco', path: '/trabalhe-conosco', icon: <SupportIcon fontSize="small" /> },
    { label: 'FAQ', path: '/faq', icon: <HelpIcon fontSize="small" /> },
  ];

  const redesSociais = [
    { nome: 'Facebook', icon: <FacebookIcon />, url: config?.salao?.contato?.facebook ? `https://facebook.com/${config.salao.contato.facebook}` : '#', cor: '#1877f2' },
    { nome: 'Instagram', icon: <InstagramIcon />, url: config?.salao?.contato?.instagram ? `https://instagram.com/${config.salao.contato.instagram}` : '#', cor: '#E4405F' },
    { nome: 'Twitter', icon: <TwitterIcon />, url: config?.salao?.contato?.twitter || '#', cor: '#1DA1F2' },
    { nome: 'WhatsApp', icon: <WhatsAppIcon />, url: config?.salao?.contato?.whatsapp ? `https://wa.me/${config.salao.contato.whatsapp}` : '#', cor: '#25D366' },
    { nome: 'YouTube', icon: <YouTubeIcon />, url: config?.salao?.contato?.youtube || '#', cor: '#FF0000' },
    { nome: 'LinkedIn', icon: <LinkedInIcon />, url: config?.salao?.contato?.linkedin || '#', cor: '#0077B5' },
    { nome: 'Pinterest', icon: <PinterestIcon />, url: config?.salao?.contato?.pinterest || '#', cor: '#BD081C' },
  ];

  const formasPagamento = [
    { nome: 'PIX', icon: '⚡', cor: '#32BCAD' },
    { nome: 'Cartão de Crédito', icon: '💳', cor: '#4caf50' },
    { nome: 'Cartão de Débito', icon: '💳', cor: '#2196f3' },
    { nome: 'Dinheiro', icon: '💵', cor: '#ff9800' },
    { nome: 'Boleto', icon: '📄', cor: '#f44336' },
  ];

  if (!config) {
    return null;
  }

  const salao = config.salao || {};

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a2e',
        color: '#fff',
        mt: 'auto',
        position: 'relative',
      }}
    >
      {/* Newsletter */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                📧 Receba Nossas Novidades
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Cadastre-se e receba promoções exclusivas, dicas de beleza e muito mais!
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box component="form" onSubmit={handleNewsletterSubmit} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Seu melhor e-mail"
                  value={emailNewsletter}
                  onChange={(e) => setEmailNewsletter(e.target.value)}
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'transparent' },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SendIcon />}
                  sx={{
                    bgcolor: '#fff',
                    color: '#9c27b0',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  Inscrever
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Logo e Informações */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {salao.logo ? (
                <Avatar
                  src={salao.logo}
                  sx={{ width: 50, height: 50 }}
                />
              ) : (
                <StoreIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {salao.nome || 'Meu Salão'}
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8, lineHeight: 1.6 }}>
              {salao.descricao || 'Profissionais qualificados para realçar sua beleza com excelência e cuidado. Venha nos conhecer!'}
            </Typography>

            {/* Horário de Funcionamento */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon fontSize="small" /> Horário de Funcionamento
              </Typography>
              {config.horarioFuncionamento && Object.entries(config.horarioFuncionamento).map(([dia, horario]) => (
                horario.aberto && (
                  <Typography key={dia} variant="caption" display="block" sx={{ opacity: 0.7 }}>
                    {dia.charAt(0).toUpperCase() + dia.slice(1)}: {horario.abertura} - {horario.fechamento}
                  </Typography>
                )
              ))}
            </Box>

            {/* Contato */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" /> Contato
              </Typography>
              {salao.contato?.telefone && (
                <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
                  📞 {salao.contato.telefone}
                </Typography>
              )}
              {salao.contato?.celular && (
                <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
                  📱 {salao.contato.celular}
                </Typography>
              )}
              {salao.contato?.email && (
                <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
                  ✉️ {salao.contato.email}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Links Rápidos */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
              Links Rápidos
            </Typography>
            <List dense disablePadding>
              {linksRapidos.map((link) => (
                <ListItem
                  key={link.label}
                  disablePadding
                  sx={{ mb: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 30, color: '#9c27b0' }}>
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Link
                        href={link.path}
                        sx={{
                          color: '#fff',
                          textDecoration: 'none',
                          '&:hover': { color: '#9c27b0' },
                          cursor: 'pointer',
                        }}
                      >
                        {link.label}
                      </Link>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Institucional */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
              Institucional
            </Typography>
            <List dense disablePadding>
              {linksInstitucionais.map((link) => (
                <ListItem
                  key={link.label}
                  disablePadding
                  sx={{ mb: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 30, color: '#9c27b0' }}>
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Link
                        href={link.path}
                        sx={{
                          color: '#fff',
                          textDecoration: 'none',
                          '&:hover': { color: '#9c27b0' },
                          cursor: 'pointer',
                        }}
                      >
                        {link.label}
                      </Link>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Redes Sociais e Formas de Pagamento */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
              Siga-nos
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {redesSociais.map((social) => (
                <Tooltip key={social.nome} title={social.nome}>
                  <IconButton
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      bgcolor: social.cor,
                      color: '#fff',
                      '&:hover': {
                        bgcolor: social.cor,
                        opacity: 0.8,
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {social.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#9c27b0' }}>
              Formas de Pagamento
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {formasPagamento.map((forma) => (
                <Chip
                  key={forma.nome}
                  label={`${forma.icon} ${forma.nome}`}
                  size="small"
                  sx={{
                    bgcolor: forma.cor,
                    color: '#fff',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>

            {/* Selo de Segurança */}
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon sx={{ color: '#4caf50' }} />
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Ambiente 100% seguro. Seus dados estão protegidos.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Copyright */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CopyrightIcon sx={{ fontSize: 14 }} />
            {anoAtual} {salao.nome || 'Meu Salão'}. Todos os direitos reservados.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Link href="#" sx={{ color: '#fff', textDecoration: 'none', fontSize: 12, '&:hover': { color: '#9c27b0' } }}>
              Política de Privacidade
            </Link>
            <Link href="#" sx={{ color: '#fff', textDecoration: 'none', fontSize: 12, '&:hover': { color: '#9c27b0' } }}>
              Termos de Uso
            </Link>
            <Link href="#" sx={{ color: '#fff', textDecoration: 'none', fontSize: 12, '&:hover': { color: '#9c27b0' } }}>
              Suporte
            </Link>
          </Box>
        </Box>
      </Container>

      {/* Botão Voltar ao Topo */}
      <Collapse in={showScrollTop} orientation="vertical">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Tooltip title="Voltar ao topo" placement="left">
            <IconButton
              onClick={scrollToTop}
              sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                bgcolor: '#9c27b0',
                color: '#fff',
                '&:hover': {
                  bgcolor: '#7b1fa2',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s',
                zIndex: 1000,
              }}
            >
              <ArrowUpIcon />
            </IconButton>
          </Tooltip>
        </motion.div>
      </Collapse>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Footer;
