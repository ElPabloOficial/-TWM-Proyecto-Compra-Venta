import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';

export default function ProfileSwitch({ checked = false, onChange, label = 'Sí', disabled = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        size="small"
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': { color: '#EC3333' },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#EC3333' },
          // Bloqueado y encendido: sigue rojo (un poco más suave), no gris
          '& .MuiSwitch-switchBase.Mui-checked.Mui-disabled': { color: '#EC3333', opacity: 0.6 },
          '& .MuiSwitch-switchBase.Mui-checked.Mui-disabled + .MuiSwitch-track': { backgroundColor: '#EC3333', opacity: 0.4 },
        }}
      />
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: checked ? '#EC3333' : '#757575' }}>{label}</Typography>
    </Box>
  );
}