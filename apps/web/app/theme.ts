'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565c0',
    },
  },
  typography: {
    fontFamily: 'var(--font-system), sans-serif',
  },
});

export default theme;
