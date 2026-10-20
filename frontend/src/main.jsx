import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import './index.css'
import App from './App.jsx'

import './services/authService.js';

// MUI usa Roboto por defecto; con "inherit" usa la misma tipografía que el resto de la página
const theme = createTheme({
  typography: { fontFamily: 'inherit' },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)