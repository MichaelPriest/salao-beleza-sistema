import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '400px',
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ color: '#9c27b0', mb: 2 }} />
      <Typography variant="h6" color="textSecondary">
        Carregando...
      </Typography>
    </Box>
  );
}

export default LoadingScreen;