import { useState } from 'react';
import Box from '@mui/material/Box';
import ProfileField from '../ProfileField/ProfileField';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

/*
 * ProfilePassword
 *
 * Molécula que agrupa los 3 campos de contraseña:
 * - Contraseña Actual
 * - Nueva contraseña
 * - Confirmar nueva contraseña
 *
 * Cada campo tiene un ícono de ojo para mostrar/ocultar.
 */
export default function ProfilePassword({ onChange }) {
  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const toggleIcon = (visible, setVisible) => (
    <span
      onClick={() => setVisible(!visible)}
      style={{ cursor: 'pointer', display: 'flex' }}
    >
      {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
    </span>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      <ProfileField
        label="Contraseña Actual"
        type={verActual ? 'text' : 'password'}
        placeholder="••••••••"
        onChange={(e) => onChange?.('passwordActual', e.target.value)}
        endIcon={toggleIcon(verActual, setVerActual)}
      />
      <ProfileField
        label="Nueva contraseña"
        type={verNueva ? 'text' : 'password'}
        placeholder="••••••••"
        onChange={(e) => onChange?.('passwordNueva', e.target.value)}
        endIcon={toggleIcon(verNueva, setVerNueva)}
      />
      <ProfileField
        label="Confirmar nueva contraseña"
        type={verConfirmar ? 'text' : 'password'}
        placeholder="••••••••"
        onChange={(e) => onChange?.('passwordConfirmar', e.target.value)}
        endIcon={toggleIcon(verConfirmar, setVerConfirmar)}
      />
    </Box>
  );
}