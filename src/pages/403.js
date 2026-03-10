// src/pages/403.js
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
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Page403() {
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
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Elementos decorativos */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          style={{
            position: 'absolute',
            width: 50 + i * 30,
            height: 50 + i * 30,
            border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            left: `${10 + i * 20}%`,
            top: `${20 + i * 10}%`,
          }}
        />
      ))}

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
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <LockIcon sx={{ fontSize: 120, color: '#f44336', mb: 2 }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '4rem', md: '6rem' },
                fontWeight: 800,
                background: 'linear-gradient(45deg, #f44336 30%, #ff9800 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                mb: 2,
              }}
            >
              403
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 600, mb: 2 }}>
              Acesso Negado
            </Typography>
            
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Você não tem permissão para acessar esta página.
              Entre em contato com o administrador do sistema se precisar de acesso.
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
                  background: 'linear-gradient(45deg, #f44336 30%, #ff9800 90%)',
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
                startIcon={<SecurityIcon />}
                onClick={() => navigate('/perfil')}
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(244,67,54,0.04)',
                  },
                }}
              >
                Ver Perfil
              </Button>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Box sx={{ mt: 4, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Dica:</strong> Verifique se você está logado com a conta correta
                ou solicite permissões adicionais ao administrador.
              </Typography>
            </Box>
          </motion.div>
        </Paper>
      </Container>
    </Box>
  );
}

export default Page403;
