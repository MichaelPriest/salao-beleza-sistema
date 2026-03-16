// src/theme.js
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff4081',
      light: '#ff79b0',
      dark: '#c60055',
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf5ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(156,39,176,0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(45deg, #7b1fa2 30%, #c60055 90%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(156,39,176,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#e2e8f0',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: '#f3e5f5',
            color: '#9c27b0',
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ba68c8',
      light: '#e1bee7',
      dark: '#9c27b0',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff79b0',
      light: '#ffb2dd',
      dark: '#ff4081',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    divider: '#334155',
    action: {
      hover: '#2d2d2d',
      selected: '#2d2d2d',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(186,104,200,0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #ba68c8 30%, #ff79b0 90%)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(45deg, #9c27b0 30%, #ff4081 90%)',
          },
        },
        outlined: {
          borderColor: '#334155',
          color: '#e2e8f0',
          '&:hover': {
            borderColor: '#ba68c8',
            backgroundColor: 'rgba(186,104,200,0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#1e1e1e',
          border: '1px solid',
          borderColor: '#334155',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(186,104,200,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        outlined: {
          borderColor: '#334155',
          color: '#e2e8f0',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#334155',
          color: '#e2e8f0',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#2d2d2d',
          color: '#ba68c8',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          borderColor: '#334155',
          color: '#e2e8f0',
          '&.Mui-selected': {
            backgroundColor: 'rgba(186,104,200,0.15)',
            color: '#ba68c8',
            '&:hover': {
              backgroundColor: 'rgba(186,104,200,0.25)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(186,104,200,0.08)',
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          borderColor: '#334155',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#e2e8f0',
          '&:hover': {
            backgroundColor: 'rgba(186,104,200,0.08)',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&.Mui-focused': {
            color: '#ba68c8',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#334155',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ba68c8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ba68c8',
          },
        },
        input: {
          color: '#e2e8f0',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: '#94a3b8',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#e2e8f0',
          '&:hover': {
            backgroundColor: 'rgba(186,104,200,0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(186,104,200,0.15)',
            '&:hover': {
              backgroundColor: 'rgba(186,104,200,0.25)',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&.Mui-selected': {
            color: '#ba68c8',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#e2e8f0',
        },
      },
    },
  },
});
