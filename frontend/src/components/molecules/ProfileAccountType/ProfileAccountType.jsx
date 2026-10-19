import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function ProfileAccountType({ tipo, rolActivo, esVendedor }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#000', mb: 0.5 }}>
        Tipo de Cuenta / Rol Activo
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ border: '1px solid #333', borderRadius: '999px', px: 2, py: 0.8, fontSize: '0.85rem', width: 220, color: '#666' }}>
          {tipo}
        </Box>
        {esVendedor && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#EC3333', mr: 1 }} />
            <Box sx={{ backgroundColor: '#EC3333', color: '#fff', px: 2, py: 0.6, borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
              {rolActivo}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}