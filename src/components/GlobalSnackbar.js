// src/components/GlobalSnackbar.js
import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useFeedback } from '../contexts/FeedbackContext';

const GlobalSnackbar = () => {
  const { snackbar, hideSnackbar } = useFeedback();

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={hideSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={hideSnackbar} 
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
