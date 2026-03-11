// src/pages/ImportarServicos.js
import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { importarServicos } from '../scripts/importarServicos';

function ImportarServicos() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleImportar = async () => {
    setLoading(true);
    const result = await importarServicos();
    setResultado(result);
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Importar Serviços
        </Typography>
        
        <Typography variant="body1" paragraph>
          Clique no botão abaixo para importar todos os serviços para o Firebase.
        </Typography>

        <Button
          variant="contained"
          onClick={handleImportar}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Importar Serviços'}
        </Button>

        {resultado && (
          <Alert severity="success">
            Importação concluída! {resultado.importados} serviços importados, {resultado.erros} erros.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}

export default ImportarServicos;
