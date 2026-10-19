import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';

/*
 * ProfileSwitch
 *
 * Molécula con un switch (toggle) simple.
 * Muestra solo el label al lado del switch.
 *
 * @param {boolean} checked   → Estado del switch
 * @param {Function} onChange → Callback al cambiar
 * @param {string} label      → Texto al lado (ej: "Sí")
 */
export default function ProfileSwitch({
  checked = false,
  onChange,
  label = 'Sí',
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Switch
        checked={checked}
        onChange={onChange}
        size="small"
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#EC3333',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#EC3333',
          },
        }}
      />
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '0.85rem',
          color: '#EC3333',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}