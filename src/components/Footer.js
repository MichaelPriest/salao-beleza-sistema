// src/components/Footer.js
// VERSÃO SIMPLES - APENAS PARA O SISTEMA

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
} from '@mui/material';
import {
  Copyright as CopyrightIcon,
  ArrowUpward as ArrowUpIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { firebaseService } from '../services/firebase';

function Footer() {
  const [config, setConfig] = useState(null);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    carregarConfiguracoes();
    
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

  const salao = config?.salao || {};

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a2e',
        color: '#fff',
        mt: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          {/* Logo e Nome */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#9c27b0',
                letterSpacing: 1,
              }}
            >
              {salao.nome || 'BeautyPro'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              v1.0
            </Typography>
          </Box>

          {/* Copyright */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CopyrightIcon sx={{ fontSize: 14, opacity: 0.6 }} />
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              {anoAtual} {salao.nome || 'BeautyPro'}. Todos os direitos reservados.
            </Typography>
          </Box>

          {/* Links Rápidos */}
          <Stack direction="row" spacing={2}>
            <Link
              href="#"
              onClick={() => window.open('https://wa.me/' + (salao.contato?.whatsapp || ''), '_blank')}
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
                  right: 20,
                  bgcolor: '#9c27b0',
                  color: '#fff',
                  width: 40,
                  height: 40,
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
        )}
      </AnimatePresence>
    </Box>
  );
}

export default Footer;
