import React from 'react';
import { useTheme } from '@mui/material/styles';  // ← Hook para acessar o tema
import { Box, Typography } from '@mui/material';

function MeuComponente() {
  const theme = useTheme();  // ← Acessa o tema atual

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.primary.main,  // ← Usando cor primária do tema
      color: theme.palette.primary.contrastText,    // ← Usando cor de contraste
      padding: theme.spacing(2),                     // ← Usando spacing do tema
      borderRadius: theme.shape.borderRadius,        // ← Usando border-radius do tema
    }}>
      <Typography variant="h6">
        Este componente usa as cores do tema!
      </Typography>
    </Box>
  );
}

export default MeuComponente;