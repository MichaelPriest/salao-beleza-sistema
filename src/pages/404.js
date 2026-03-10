// src/pages/404.js
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Page404() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Elementos decorativos animados */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          borderRadius: ['20%', '50%', '20%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.1)',
          top: '-100px',
          right: '-100px',
        }}
      />
      
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, -180, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(255,255,255,0.05)',
          bottom: '-150px',
          left: '-150px',
          borderRadius: '50%',
        }}
      />

      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <ErrorIcon sx={{ fontSize: 120, color: '#9c27b0', mb: 2 }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', md: '10rem' },
                fontWeight: 800,
                background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                mb: 2,
              }}
            >
              404
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 600, mb: 2 }}>
              Página Não Encontrada
            </Typography>
            
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              A página que você está procurando pode ter sido removida, 
              teve seu nome alterado ou está temporariamente indisponível.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                sx={{
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                }}
              >
                Ir para Dashboard
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#ff4081',
                    backgroundColor: 'rgba(156,39,176,0.04)',
                  },
                }}
              >
                Voltar
              </Button>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="textSecondary">
                Ou tente buscar o que precisa:
              </Typography>
              <Button
                startIcon={<SearchIcon />}
                onClick={() => navigate('/')}
                sx={{ mt: 1, color: '#9c27b0' }}
              >
                Buscar no sistema
              </Button>
            </Box>
          </motion.div>
        </Paper>
      </Container>
    </Box>
  );
}

export default Page404;
