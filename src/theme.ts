// src/theme.ts

import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9c27b0', // Bright, deep purple
    },
    secondary: {
      main: '#f48fb1', // Light pink for accents
    },
    background: {
      default: '#1a2035', // Very dark navy/blue
      paper: '#283149',   // Slightly lighter, dark blue for cards
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
    // --- UPDATED CUSTOM VISUALIZATION COLORS ---
    custom: {
      // For white clause background
      trueTextDark: '#1b5e20', // Very dark green
      falseTextDark: '#b71c1c',// Very dark red

      // For dark clause background
      trueTextLight: '#a5d6a7', // Light green
      falseTextLight: '#ef9a9a', // Light red

      // For clause backgrounds themselves
      trueBg: 'rgba(76, 175, 80, 0.2)',
      falseBg: 'rgba(211, 47, 47, 0.2)',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h2: { fontWeight: 500 },
    h3: { fontWeight: 500 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
  },
});

theme = responsiveFontSizes(theme);

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      trueTextDark: string;
      falseTextDark: string;
      trueTextLight: string;
      falseTextLight: string;
      trueBg: string;
      falseBg: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      trueTextDark: string;
      falseTextDark: string;
      trueTextLight: string;
      falseTextLight: string;
      trueBg: string;
      falseBg: string;
    };
  }
}

export default theme;