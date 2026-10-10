import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Header from '../../organisms/Header/Header';

/*
 * ProfileTemplate
 *
 * Template que envuelve las páginas de perfil.
 * Incluye:
 * - Header (logo, búsqueda, botones)
 * - Breadcrumb ("Inicio › Mi Perfil")
 * - Contenedor principal para el contenido
 *
 * @param {React.ReactNode} children → Contenido de la página
 * @param {string} pageTitle          → Título del breadcrumb (ej: "Mi Perfil")
 */
export default function ProfileTemplate({ children, pageTitle = 'Mi Perfil' }) {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      {/* Header (ya existe en el proyecto) */}
      <Header />

      {/* Breadcrumb + contenido */}
      <Box sx={{ padding: 4 }}>
        <Box sx={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#555',
              mb: 1,
            }}
          >
            Inicio{' '}
            <span style={{ margin: '0 6px', color: '#999' }}>›</span>
            <strong style={{ color: '#000' }}>{pageTitle}</strong>
          </Typography>

          {/* Título de la página */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#000',
              mb: 0.5,
            }}
          >
            Configuración de Perfil
          </Typography>

          <Typography sx={{ fontSize: '0.85rem', color: '#555', mb: 3 }}>
            Mantén tus datos personales y comerciales actualizados para operar con seguridad en Ahorraton.
          </Typography>

          {/* Contenido de la página */}
          {children}
        </Box>
      </Box>
    </Box>
  );
}