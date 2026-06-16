import React from 'react';
import { Avatar, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

export const REPORT_COLORS = {
  primary: '#9c27b0',
  primaryDark: '#7b1fa2',
  success: '#2e7d32',
  warning: '#ed6c02',
  info: '#0288d1',
  error: '#d32f2f',
  surface: '#ffffff',
  soft: '#f8f5fb',
  border: 'rgba(156, 39, 176, 0.14)',
};

export const reportPageSx = {
  p: { xs: 2, md: 3 },
  background: 'linear-gradient(180deg, #fbf7ff 0%, #ffffff 42%)',
  minHeight: '100%',
};

export const reportCardSx = {
  height: '100%',
  borderRadius: 3,
  border: `1px solid ${REPORT_COLORS.border}`,
  boxShadow: '0 12px 32px rgba(76, 29, 149, 0.08)',
  overflow: 'hidden',
};

export const reportTableSx = {
  '& .MuiTableHead-root .MuiTableCell-root': {
    bgcolor: REPORT_COLORS.soft,
    color: '#4a235a',
    fontWeight: 800,
    borderBottom: `1px solid ${REPORT_COLORS.border}`,
  },
  '& .MuiTableBody-root .MuiTableRow-root:hover': {
    bgcolor: 'rgba(156, 39, 176, 0.04)',
  },
};

export function ReportHeader({ title, subtitle, icon, badge, actions }) {
  return (
    <Card sx={{ ...reportCardSx, mb: 3, background: 'linear-gradient(135deg, #9c27b0 0%, #6a1b9a 100%)', color: 'white' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {icon && (
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', width: 56, height: 56 }}>
                {icon}
              </Avatar>
            )}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="h4" sx={{ fontWeight: 900 }}>{title}</Typography>
                {badge && <Chip size="small" label={badge} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 700 }} />}
              </Stack>
              {subtitle && <Typography sx={{ opacity: 0.88, mt: 0.5 }}>{subtitle}</Typography>}
            </Box>
          </Stack>
          {actions && <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{actions}</Stack>}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ReportMetricCard({ icon, title, value, helper, color = REPORT_COLORS.primary }) {
  return (
    <Card sx={reportCardSx}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: `${color}18`, color, width: 52, height: 52 }}>{icon}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color, lineHeight: 1.15 }}>{value}</Typography>
            {helper && <Typography variant="caption" color="text.secondary">{helper}</Typography>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ReportSectionCard({ title, subtitle, action, children, sx }) {
  return (
    <Card sx={{ ...reportCardSx, ...sx }}>
      <CardContent>
        {(title || subtitle || action) && (
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Box>
              {title && <Typography variant="h6" sx={{ fontWeight: 900 }}>{title}</Typography>}
              {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
            </Box>
            {action}
          </Stack>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
