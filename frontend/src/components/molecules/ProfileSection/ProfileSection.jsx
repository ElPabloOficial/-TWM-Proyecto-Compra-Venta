import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/*
 * ProfileSection
 *
 * Molécula que agrupa un bloque del formulario de perfil.
 * Muestra un título rojo en mayúsculas y el contenido
 * que se le pase como children.
 *
 * @param {string} title     → Texto del título (ej: "Datos Personales")
 * @param {React.ReactNode} children → Contenido de la sección
 */
export default function ProfileSection({ title, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          color: '#EC3333',
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}