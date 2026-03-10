// src/contexts/FeedbackContext.js
import React, { createContext, useContext, useState } from 'react';

const FeedbackContext = createContext();

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  return (
    <FeedbackContext.Provider value={{
      snackbar,
      loading,
      showSnackbar,
      hideSnackbar,
      showLoading,
      hideLoading
    }}>
      {children}
    </FeedbackContext.Provider>
  );
};
