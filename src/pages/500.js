// src/pages/500.js
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Refresh as RefreshIcon,
  BugReport as BugIcon,
  Error as ErrorIcon,
  ReportProblem as ReportIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Page500() {
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
      {/* Animação de "erro" no fundo */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * 200 - 100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
          style={{
            position: 'absolute',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.1)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          ERROR
        </motion.div>
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
              rotate: [0, 10, -10, 10, -10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <ErrorIcon sx={{ fontSize: 120, color: '#ff9800', mb: 2 }} />
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
                background: 'linear-gradient(45deg, #ff9800 30%, #f44336 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                mb: 2,
              }}
            >
              500
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 600, mb: 2 }}>
              Erro Interno do Servidor
            </Typography>
            
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Ocorreu um erro inesperado no servidor. Nossa equipe foi notificada
              e está trabalhando para resolver o problema.
            </Typography>

            <Alert severity="error" sx={{ mb: 4, textAlign: 'left' }}>
              <AlertTitle>Detalhes do Erro</AlertTitle>
              <Typography variant="body2" component="div">
                <Chip 
                  label="Código: 500" 
                  size="small" 
                  color="error" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  label={`Timestamp: ${new Date().toLocaleString('pt-BR')}`} 
                  size="small" 
                  variant="outlined" 
                  sx={{ mb: 1 }} 
                />
              </Typography>
            </Alert>
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
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{
                  background: 'linear-gradient(45deg, #ff9800 30%, #f44336 90%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                }}
              >
                Tentar Novamente
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                sx={{
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(255,152,0,0.04)',
                  },
                }}
              >
                Voltar ao Início
              </Button>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Box sx={{ mt: 4 }}>
              <Button
                startIcon={<BugIcon />}
                onClick={() => {
                  // Aqui você pode abrir um modal de report de erro
                  alert('Erro reportado à equipe de desenvolvimento!');
                }}
                sx={{ color: '#666' }}
              >
                Reportar este erro
              </Button>
            </Box>
          </motion.div>
        </Paper>
      </Container>
    </Box>
  );
}

export default Page500;
