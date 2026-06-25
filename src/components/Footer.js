// src/components/Footer.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Copyright as CopyrightIcon,
  ArrowUpward as ArrowUpIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { firebaseService } from '../services/firebase';

function Footer() {
  const [config, setConfig] = useState(null);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Começa como false para modo full width
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [isFullWidthMode, setIsFullWidthMode] = useState(true); // Detectar se é SiteSalao

  useEffect(() => {
    carregarConfiguracoes();
    
    window.addEventListener('scroll', handleScroll);
    
    // Verificar se estamos no SiteSalao (sem sidebar)
    const checkIfSiteSalao = () => {
      // Verifica se existe sidebar na página
      const sidebar = document.querySelector('.MuiDrawer-paper');
      const isAdminPage = window.location.pathname.includes('/admin') || 
                         window.location.pathname.includes('/dashboard') ||
                         window.location.pathname.includes('/login') && !window.location.pathname.includes('/cliente');
      
      // Se não tem sidebar OU é página de admin com sidebar, ajusta
      if (!sidebar || !isAdminPage) {
        setIsFullWidthMode(true);
        setSidebarOpen(false);
        setSidebarWidth(0);
      } else {
        setIsFullWidthMode(false);
        const width = sidebar.offsetWidth;
        const isOpen = width > 60;
        setSidebarOpen(isOpen);
        setSidebarWidth(isOpen ? width : 70);
      }
    };
    
    // Escutar mudanças no estado do sidebar (apenas para páginas admin)
    const handleSidebarToggle = (event) => {
      if (event.detail && !isFullWidthMode) {
        setSidebarOpen(event.detail.open);
        setSidebarWidth(event.detail.width);
      }
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    
    // Verificar estado inicial
    setTimeout(checkIfSiteSalao, 100);
    
    // Observar mudanças no DOM
    const observer = new MutationObserver(() => {
      checkIfSiteSalao();
    });
    
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
      observer.disconnect();
    };
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

  const salao = config?.salao || {};
  const sistema = config?.sistema || {};
  const nomeSistema = sistema.nome || 'BeautyPro';
  const versaoSistema = sistema.versao || 'v2.0';
  const logoEstabelecimento = salao.logo || config?.sitePublico?.logo || '';
  const nomeEstabelecimento = salao.nomeFantasia || salao.nome || nomeSistema;

  // Estilos base do footer
  const footerStyles = {
    bgcolor: '#1a1a2e',
    color: '#fff',
    mt: 'auto',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
  };

  // Se for modo full width (SiteSalao), ocupa 100% da largura
  if (isFullWidthMode) {
    footerStyles.width = '100%';
    footerStyles.ml = 0;
  } else {
    // Modo com sidebar (páginas admin)
    footerStyles.width = `calc(100% - ${sidebarOpen ? sidebarWidth : 0}px)`;
    footerStyles.ml = sidebarOpen ? `${sidebarWidth}px` : 0;
  }

  return (
    <Box
      component="footer"
      sx={footerStyles}
    >
      <Container maxWidth={isFullWidthMode ? "lg" : false} sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          {/* Logo e Nome */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Avatar src={logoEstabelecimento || undefined} sx={{ width: 36, height: 36, bgcolor: '#9c27b0' }}>
              {!logoEstabelecimento && <BusinessIcon fontSize="small" />}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: '#fff' }}>
                {nomeEstabelecimento}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>
                {nomeSistema} • {versaoSistema}
              </Typography>
            </Box>
          </Box>

          {/* Copyright */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textAlign: 'center' }}>
            <CopyrightIcon sx={{ fontSize: 14, opacity: 0.6 }} />
            <Typography variant="caption" sx={{ opacity: 0.65 }}>
              {anoAtual} {nomeEstabelecimento}. Sistema de gestão para salão de beleza.
            </Typography>
          </Box>

          {/* Links Rápidos */}
          <Stack direction="row" spacing={2}>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (salao.contato?.whatsapp) {
                  window.open('https://wa.me/' + (salao.contato?.whatsapp || ''), '_blank');
                }
              }}
              sx={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: 12,
                opacity: 0.7,
                '&:hover': { opacity: 1, color: '#9c27b0' },
              }}
            >
              Suporte
            </Link>
            <Link
              href="/politica-privacidade"
              sx={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: 12,
                opacity: 0.7,
                '&:hover': { opacity: 1, color: '#9c27b0' },
              }}
            >
              Privacidade
            </Link>
            <Link
              href="/termos-uso"
              sx={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: 12,
                opacity: 0.7,
                '&:hover': { opacity: 1, color: '#9c27b0' },
              }}
            >
              Termos
            </Link>
          </Stack>
        </Stack>
        
        {/* Informações adicionais para o SiteSalao */}
        {isFullWidthMode && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="center">
              <Typography variant="caption" sx={{ opacity: 0.65 }}>
                {nomeSistema} {versaoSistema} • Portal administrativo e portal do cliente
              </Typography>
              {salao.contato?.email && <Chip size="small" icon={<EmailIcon />} label={salao.contato.email} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.08)' }} />}
              {salao.contato?.whatsapp && <Chip size="small" icon={<WhatsAppIcon />} label={salao.contato.whatsapp} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.08)' }} />}
            </Stack>
          </Box>
        )}
      </Container>

      {/* Botão Voltar ao Topo - Ajustado para não sobrepor o sidebar e funcionar no SiteSalao */}
      <AnimatePresence>
        {showScrollTop && (
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
                  right: isFullWidthMode ? '20px' : (sidebarOpen ? `${sidebarWidth + 20}px` : '20px'),
                  bgcolor: '#9c27b0',
                  color: '#fff',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: '#7b1fa2',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease-in-out',
                  zIndex: 1000,
                }}
              >
                <ArrowUpIcon />
              </IconButton>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default Footer;
