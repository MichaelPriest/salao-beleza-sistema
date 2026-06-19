import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import {
  Badge as BadgeIcon,
  ContentCut as ContentCutIcon,
  Groups as GroupsIcon,
  Money as MoneyIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const links = [
  { label: 'Profissionais', path: '/profissionais', icon: <BadgeIcon fontSize="small" /> },
  { label: 'RH', path: '/rh', icon: <GroupsIcon fontSize="small" /> },
  { label: 'Disponibilidade', path: '/disponibilidade', icon: <ScheduleIcon fontSize="small" /> },
  { label: 'Serviços', path: '/servicos', icon: <ContentCutIcon fontSize="small" /> },
  { label: 'Comissões', path: '/minhas-comissoes', icon: <MoneyIcon fontSize="small" /> },
];

function ProfissionaisSectionNav({ subtitle = 'Cadastros, serviços, horários, comissões e RH integrados em um só fluxo.' }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Paper sx={{ p: 2, mb: 3, border: '1px solid #f3e5f5', bgcolor: '#fff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#9c27b0' }}>
            Profissionais e Serviços
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Button
                key={link.path}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                startIcon={link.icon}
                onClick={() => navigate(link.path)}
                sx={active ? { bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } } : { borderColor: '#9c27b0', color: '#9c27b0' }}
              >
                {link.label}
              </Button>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}

export default ProfissionaisSectionNav;
