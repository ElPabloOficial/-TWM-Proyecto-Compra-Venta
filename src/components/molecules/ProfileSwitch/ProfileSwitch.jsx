import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';

/*
 * ProfileSwitch
 *
 * Molécula con un switch (toggle) que muestra un título
 * y una descripción. Se usa en el perfil para activar
 * opciones como "Restricción de edad".
 *
 * @param {boolean} checked     → Estado del switch
 * @param {Function} onChange   → Callback al cambiar
 * @param {string} label        → Texto del título (ej: "Sí")
 * @param {string} description  → Texto descriptivo
 */
export default function ProfileSwitch({
  checked = false,
  onChange,
  label = 'Sí',
  description = '',
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        mb: 3,
      }}
    >
      <Switch
        checked={checked}
        onChange={onChange}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#EC3333',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#EC3333',
          },
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', pt: 0.8 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.85rem',
            color: '#EC3333',
          }}
        >
          {label}
        </Typography>
        {description && (
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#555',
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}