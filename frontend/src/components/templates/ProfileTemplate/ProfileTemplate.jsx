import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Header from '../../organisms/Header/Header';

export default function ProfileTemplate({ children, pageTitle = 'Mi Perfil' }) {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Header />
      <Box sx={{ padding: 4 }}>
        <Box sx={{ maxWidth: 1100, margin: '0 auto' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#555', mb: 1 }}>
            Inicio <span style={{ margin: '0 6px', color: '#999' }}>›</span>
            <strong style={{ color: '#000' }}>{pageTitle}</strong>
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', mb: 0.5 }}>
            Configuración de Perfil
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#555', mb: 3 }}>
            Mantén tus datos personales y comerciales actualizados para operar con seguridad en Ahorraton.
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
}