import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

function ErrorScreen({ error, onRetry }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '400px',
        p: 3,
      }}
    >
      <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
        {error || 'Erro ao carregar dados'}
      </Alert>
      {onRetry && (
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{
            background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
          }}
        >
          Tentar novamente
        </Button>
      )}
    </Box>
  );
}

export default ErrorScreen;