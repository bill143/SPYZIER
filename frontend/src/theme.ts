import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    glass: {
      background: string;
      border: string;
    };
  }
  interface PaletteOptions {
    glass?: {
      background: string;
      border: string;
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00B4D8',
      light: '#48CAE4',
      dark: '#0077B6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0077B6',
      light: '#0096C7',
      dark: '#023E8A',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0e1a',
      paper: '#111827',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      disabled: '#475569',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
    glass: {
      background: 'rgba(17, 24, 39, 0.6)',
      border: 'rgba(0, 180, 216, 0.15)',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500, color: '#94a3b8' },
    subtitle2: { fontWeight: 500, color: '#94a3b8' },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5, color: '#94a3b8' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    caption: { color: '#64748b', fontSize: '0.75rem' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0e1a',
          backgroundImage:
            'radial-gradient(ellipse at 20% 50%, rgba(0, 119, 182, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0, 180, 216, 0.05) 0%, transparent 40%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 180, 216, 0.1)',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 180, 216, 0.2)',
            borderColor: 'rgba(0, 180, 216, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111827',
          border: '1px solid rgba(148, 163, 184, 0.08)',
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
        },
        elevation2: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontWeight: 600,
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: '0 4px 14px rgba(0, 180, 216, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 180, 216, 0.45)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 180, 216, 0.3)',
          '&:hover': {
            borderColor: '#00B4D8',
            backgroundColor: 'rgba(0, 180, 216, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.7rem',
          borderRadius: 6,
          letterSpacing: '0.04em',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: '#94a3b8',
            fontWeight: 600,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(148, 163, 184, 0.06)',
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 180, 216, 0.05)',
          },
          '&:last-child td': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            '& fieldset': {
              borderColor: 'rgba(148, 163, 184, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 180, 216, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00B4D8',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111827',
          border: '1px solid rgba(0, 180, 216, 0.15)',
          borderRadius: 16,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 48,
          '&.Mui-selected': {
            color: '#00B4D8',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#00B4D8',
          height: 2,
          borderRadius: 2,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: 'rgba(148, 163, 184, 0.1)',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1e293b',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: 8,
          fontSize: '0.75rem',
        },
        arrow: {
          color: '#1e293b',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          padding: '10px 12px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: alpha('#00B4D8', 0.15),
            '&:hover': {
              backgroundColor: alpha('#00B4D8', 0.2),
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 180, 216, 0.08)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(10, 14, 26, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0d1220',
          borderRight: '1px solid rgba(148, 163, 184, 0.08)',
        },
      },
    },
  },
});

export default theme;
