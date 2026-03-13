// src/pages/Fidelidade.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  Redeem as RewardIcon,
} from '@mui/icons-material';
import { useFirebase } from '../hooks/useFirebase';

const niveis = {
  bronze: { cor: '#cd7f32', minimo: 0, multiplicador: 1 },
  prata: { cor: '#c0c0c0', minimo: 500, multiplicador: 1.2 },
  ouro: { cor: '#ffd700', minimo: 2000, multiplicador: 1.5 },
  platina: { cor: '#e5e4e2', minimo: 5000, multiplicador: 2 },
};

function Fidelidade() {
  const { data: clientes } = useFirebase('clientes');
  const { data: pontuacao } = useFirebase('pontuacao');
  
  const [clientesFidelidade, setClientesFidelidade] = useState([]);

  useEffect(() => {
    // Calcular pontuação e nível de cada cliente
    const dados = clientes?.map(cliente => {
      const pontos = pontuacao?.filter(p => p.clienteId === cliente.id)
        .reduce((acc, p) => acc + p.pontos, 0) || 0;
      
      let nivel = 'bronze';
      if (pontos >= 5000) nivel = 'platina';
      else if (pontos >= 2000) nivel = 'ouro';
      else if (pontos >= 500) nivel = 'prata';
      
      return {
        ...cliente,
        pontos,
        nivel,
        proximoNivel: niveis[nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'platina'],
        pontosFaltantes: niveis[nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'platina'].minimo - pontos,
      };
    }).sort((a, b) => b.pontos - a.pontos);
    
    setClientesFidelidade(dados);
  }, [clientes, pontuacao]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Programa de Fidelidade
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(niveis).map(([nivel, config]) => (
          <Grid item xs={12} sm={6} md={3} key={nivel}>
            <Card sx={{ 
              bgcolor: `${config.cor}20`,
              border: `2px solid ${config.cor}`,
              textAlign: 'center'
            }}>
              <CardContent>
                <StarIcon sx={{ fontSize: 40, color: config.cor }} />
                <Typography variant="h5" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {nivel}
                </Typography>
                <Typography variant="body2">
                  Mínimo: R$ {config.minimo}
                </Typography>
                <Typography variant="body2">
                  {config.multiplicador}x pontos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Ranking de Clientes
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Posição</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Nível</TableCell>
                  <TableCell>Pontos</TableCell>
                  <TableCell>Progresso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientesFidelidade?.map((cliente, index) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      {index < 3 ? (
                        <TrophyIcon sx={{ color: index === 0 ? 'gold' : index === 1 ? 'silver' : '#cd7f32' }} />
                      ) : index + 1}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={cliente.foto}>
                          {cliente.nome?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{cliente.nome}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {cliente.telefone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cliente.nivel}
                        sx={{
                          bgcolor: `${niveis[cliente.nivel].cor}20`,
                          color: niveis[cliente.nivel].cor,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">{cliente.pontos}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <LinearProgress
                          variant="determinate"
                          value={(cliente.pontos / cliente.proximoNivel.minimo) * 100}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                        <Typography variant="caption">
                          Faltam {cliente.pontosFaltantes} pontos para {cliente.proximoNivel}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Fidelidade;
