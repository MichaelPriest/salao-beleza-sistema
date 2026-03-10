// src/components/EnderecoForm.js
import React from 'react';
import { Grid, TextField } from '@mui/material';
import { CepInput } from '../utils/plugins';

export const EnderecoForm = ({ endereco, onChange, onCepFound }) => {
  
  const handleChange = (campo) => (e) => {
    onChange(campo, e.target.value);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <CepInput
          fullWidth
          label="CEP"
          value={endereco.cep || ''}
          onChange={handleChange('cep')}
          onCepFound={onCepFound}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          label="Logradouro"
          value={endereco.logradouro || ''}
          onChange={handleChange('logradouro')}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Número"
          value={endereco.numero || ''}
          onChange={handleChange('numero')}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          label="Complemento"
          value={endereco.complemento || ''}
          onChange={handleChange('complemento')}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Bairro"
          value={endereco.bairro || ''}
          onChange={handleChange('bairro')}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Cidade"
          value={endereco.cidade || ''}
          onChange={handleChange('cidade')}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Estado"
          value={endereco.estado || ''}
          onChange={handleChange('estado')}
          inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
          size="small"
          placeholder="UF"
        />
      </Grid>
    </Grid>
  );
};
