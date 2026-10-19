import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';

export default function ProfileSwitch({ checked = false, onChange, label = 'Sí' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Switch
        checked={checked}
        onChange={onChange}
        size="small"
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': { color: '#EC3333' },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#EC3333' },
        }}
      />
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#EC3333' }}>{label}</Typography>
    </Box>
  );
}