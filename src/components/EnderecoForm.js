// src/components/EnderecoForm.js
import React from 'react';
import { Grid, TextField } from '@mui/material';
import { CepInput, masks } from '../utils/plugins';

export const EnderecoForm = ({ endereco, onChange, onCepFound }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <CepInput
          fullWidth
          label="CEP"
          name="cep"
          value={endereco.cep || ''}
          onChange={(e) => onChange('cep', masks.cep(e.target.value))}
          onCepFound={onCepFound}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          label="Logradouro"
          name="logradouro"
          value={endereco.logradouro || ''}
          onChange={(e) => onChange('logradouro', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Número"
          name="numero"
          value={endereco.numero || ''}
          onChange={(e) => onChange('numero', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          label="Complemento"
          name="complemento"
          value={endereco.complemento || ''}
          onChange={(e) => onChange('complemento', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Bairro"
          name="bairro"
          value={endereco.bairro || ''}
          onChange={(e) => onChange('bairro', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Cidade"
          name="cidade"
          value={endereco.cidade || ''}
          onChange={(e) => onChange('cidade', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Estado"
          name="estado"
          value={endereco.estado || ''}
          onChange={(e) => onChange('estado', e.target.value.toUpperCase())}
          inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
          size="small"
          placeholder="UF"
        />
      </Grid>
    </Grid>
  );
};