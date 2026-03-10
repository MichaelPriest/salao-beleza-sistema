// src/components/GlobalLoading.js
import React from 'react';
import { Box, LinearProgress, Typography, Paper } from '@mui/material';
import { useFeedback } from '../contexts/FeedbackContext';

const GlobalLoading = () => {
  const { loading, loadingMessage } = useFeedback();

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(3px)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minWidth: 300,
          borderRadius: 2,
        }}
      >
        <Box sx={{ width: '100%' }}>
          <LinearProgress color="secondary" />
        </Box>
        <Typography variant="body1" color="textSecondary">
          {loadingMessage}
        </Typography>
      </Paper>
    </Box>
  );
};

// Exportação default (é isso que está causando o erro? Vamos verificar)
export default GlobalLoading;
