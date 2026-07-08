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

function Footer() {
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [isFullWidthMode, setIsFullWidthMode] = useState(true);

  // DADOS FIXOS DO SISTEMA (não usa dados do estabelecimento)
  const SISTEMA_NOME = 'SysBeautyPro';
  const SISTEMA_VERSAO = 'v3.0';
  const SISTEMA_DESCRICAO = 'Sistema de gestão para salão de beleza';

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    
    // Verificar se o footer deve ocupar largura total ou compensar sidebar
    const checkIfSiteSalao = () => {
      const pathname = window.location.pathname || '';
      const sidebar = document.querySelector('.MuiDrawer-paper');
      const isClientePortal = pathname.startsWith('/cliente');
      const isMobileViewport = window.innerWidth < 900;
      const isAdminPage = !isClientePortal && (
        pathname.includes('/admin')
        || pathname.includes('/dashboard')
        || (pathname.includes('/login') && !pathname.includes('/cliente'))
      );

      if (!sidebar || !isAdminPage || isClientePortal || isMobileViewport) {
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
    
    // Escutar mudanças no estado do sidebar
    const handleSidebarToggle = (event) => {
      if (event.detail && !isFullWidthMode) {
        setSidebarOpen(event.detail.open);
        setSidebarWidth(event.detail.width);
      }
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    
    setTimeout(checkIfSiteSalao, 100);
    window.addEventListener('resize', checkIfSiteSalao);

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
      window.removeEventListener('resize', checkIfSiteSalao);
      observer.disconnect();
    };
  }, []);

  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerStyles = {
    bgcolor: '#1a1a2e',
    color: '#fff',
    mt: 'auto',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
  };

  if (isFullWidthMode) {
    footerStyles.width = '100%';
    footerStyles.ml = 0;
  } else {
    footerStyles.width = `calc(100% - ${sidebarOpen ? sidebarWidth : 0}px)`;
    footerStyles.ml = sidebarOpen ? `${sidebarWidth}px` : 0;
  }

  return (
    <Box
      component="footer"
      sx={footerStyles}
    >
      <Container maxWidth={isFullWidthMode ? "lg" : false} sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 3 }, overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={{ xs: 1.5, sm: 2 }}
        >
          {/* Logo e Nome do Sistema (fixo) */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1.25, minWidth: 0, maxWidth: '100%' }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#9c27b0' }}>
              <BusinessIcon fontSize="small" />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', textAlign: { xs: 'center', sm: 'left' }, overflowWrap: 'anywhere' }}>
                {SISTEMA_NOME}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.65, display: 'block', textAlign: { xs: 'center', sm: 'left' }, overflowWrap: 'anywhere' }}>
                {SISTEMA_VERSAO}
              </Typography>
            </Box>
          </Box>

          {/* Copyright */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, textAlign: 'center', flexWrap: 'wrap', px: { xs: 1, sm: 0 } }}>
            <CopyrightIcon sx={{ fontSize: 14, opacity: 0.6 }} />
            <Typography variant="caption" sx={{ opacity: 0.65 }}>
              {anoAtual} {SISTEMA_NOME}. {SISTEMA_DESCRICAO}
            </Typography>
          </Box>

          {/* Links Rápidos */}
          <Stack direction="row" spacing={{ xs: 1.25, sm: 2 }} sx={{ flexWrap: 'wrap', rowGap: 0.5, justifyContent: 'center' }}>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // Link para suporte do sistema
                window.open('https://wa.me/5511999999999', '_blank');
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
        
        {/* Informações adicionais do sistema (modo full width) */}
        {isFullWidthMode && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="center" sx={{ flexWrap: 'wrap', px: { xs: 1, sm: 0 } }}>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>
                {SISTEMA_NOME} {SISTEMA_VERSAO} • Portal administrativo e portal do cliente
              </Typography>
              <Chip 
                size="small" 
                icon={<EmailIcon />} 
                label="suporte@sysbeautypro.com" 
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.08)', maxWidth: '100%' }} 
              />
              <Chip 
                size="small" 
                icon={<WhatsAppIcon />} 
                label="(11) 99999-9999" 
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.08)', maxWidth: '100%' }} 
              />
            </Stack>
          </Box>
        )}
      </Container>

      {/* Botão Voltar ao Topo */}
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
