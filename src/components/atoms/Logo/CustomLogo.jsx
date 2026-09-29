import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import logoImage from '../../../assets/logo.png';

export default function CustomLogo({
  text = 'Mi Empresa',
  image = logoImage,
  size = 40,
}) {
  return (
    <Box
      component="a"
      href="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
      }}
    >
      <Box
        component="img"
        src={image}
        alt={text}
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
        }}
      />

      <Typography
        sx={{
          fontSize: `${size * 0.6}px`,
          fontWeight: 'bold',
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

/*
 ============================
  EJEMPLO CON ÍCONO AL FINAL
 ============================

<CustomLogo
  text="Mi Tienda"
  image={MiImagen}
  size={50}
/>
*/