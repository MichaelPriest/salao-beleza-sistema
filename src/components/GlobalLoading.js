// src/components/GlobalLoading.js
import React from 'react';
import { Box, LinearProgress } from '@mui/material';
import { useFeedback } from '../contexts/FeedbackContext';

export const GlobalLoading = () => {
  const { loading } = useFeedback();

  if (!loading) return null;

  return (
    <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
      <LinearProgress color="secondary" />
    </Box>
  );
};
