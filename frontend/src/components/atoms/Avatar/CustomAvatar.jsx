import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

/*
 * CustomAvatar
 *
 * Átomo que muestra la foto de perfil del usuario.
 * Si no hay imagen, muestra la inicial del nombre
 * sobre un fondo gris claro.
 *
 * @param {string} src   → URL o ruta de la imagen del usuario
 * @param {string} alt   → Nombre del usuario (también texto alternativo)
 * @param {number} size  → Tamaño en píxeles del avatar
 */
export default function CustomAvatar({ src, alt = '', size = 90 }) {
  const inicial = alt?.trim()?.[0]?.toUpperCase() || '?';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Avatar
        src={src}
        alt={alt}
        sx={{
          width: size,
          height: size,
          bgcolor: '#d9d9d9',
          color: '#888',
          fontSize: size * 0.4,
        }}
      >
        {!src && inicial}
      </Avatar>
    </Box>
  );
}