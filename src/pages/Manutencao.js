// src/pages/Manutencao.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Chip, // 🔥 IMPORTANTE: Adicionar Chip
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Build as BuildIcon,
  Construction as ConstructionIcon,
  Schedule as ScheduleIcon,
  NotificationsActive as NotificationIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Manutencao() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Simular progresso da manutenção
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    // Contador regressivo (simulado)
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 2); // +2 horas

    const countdown = setInterval(() => {
      const now = new Date();
      const diff = endTime - now;
      
      if (diff <= 0) {
        setTimeLeft('Em breve');
        clearInterval(countdown);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}min`);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(countdown);
    };
  }, []);

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
      {/* Ícones de ferramentas animados */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.5,
          }}
          style={{
            position: 'absolute',
            left: `${10 + i * 30}%`,
            top: `${20 + i * 20}%`,
            opacity: 0.1,
          }}
        >
          <ConstructionIcon sx={{ fontSize: 100, color: 'white' }} />
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
              duration: 2,
              repeat: Infinity,
            }}
          >
            <BuildIcon sx={{ fontSize: 120, color: '#9c27b0', mb: 2 }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Typography variant={isMobile ? 'h3' : 'h2'} sx={{ fontWeight: 800, mb: 2 }}>
              Sistema em <span style={{ color: '#9c27b0' }}>Manutenção</span>
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Estamos realizando melhorias no sistema para oferecer uma experiência ainda melhor.
              Voltaremos em breve!
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <ScheduleIcon sx={{ color: '#9c27b0' }} />
                <Typography variant="h6">
                  {`Tempo estimado: ${timeLeft}`}
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#f3e5f5',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                  },
                }}
              />
              
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                {`Progresso: ${Math.round(progress)}%`}
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<NotificationIcon />}
                onClick={() => {
                  // Simular notificação quando voltar
                  alert('Você será notificado quando o sistema voltar!');
                }}
                sx={{
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                }}
              >
                Me notificar
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  px: 4,
                  py: 1.5,
                }}
              >
                Verificar novamente
              </Button>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Box sx={{ mt: 4, p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                <strong>O que está sendo feito:</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip label="Atualização de segurança" size="small" />
                <Chip label="Melhorias de performance" size="small" />
                <Chip label="Novas funcionalidades" size="small" />
                <Chip label="Otimização do banco de dados" size="small" />
              </Box>
            </Box>
          </motion.div>
        </Paper>
      </Container>
    </Box>
  );
}

export default Manutencao;
