import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import CustomInput from '../../atoms/TextField/CustomInput';

/*
 * ProfileAccountType
 *
 * Molécula que muestra el tipo de cuenta / rol activo del usuario.
 * Incluye: un label, el tipo de cuenta (input deshabilitado),
 * un radio button y un chip rojo con el rol activo.
 *
 * @param {string} tipo       → Tipo de cuenta (ej: "Cliente Comprador")
 * @param {string} rolActivo  → Texto del chip rojo (ej: "Vendedor Comercial (Activo)")
 * @param {boolean} esVendedor → Si es vendedor, muestra el chip
 */
export default function ProfileAccountType({
  tipo = 'Cliente Comprador',
  rolActivo = 'Vendedor Comercial (Activo)',
  esVendedor = false,
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#000',
          mb: 0.5,
        }}
      >
        Tipo de Cuenta / Rol Activo
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <CustomInput
          value={tipo}
          disabled
          sx={{
            border: '1px solid #333',
            borderRadius: '999px',
            ml: 0,
            px: 2,
            py: 0.8,
            fontSize: '0.85rem',
            width: 220,
            backgroundColor: '#fff',
          }}
        />

        {esVendedor && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Radio
              checked
              size="small"
              sx={{
                color: '#EC3333',
                '&.Mui-checked': { color: '#EC3333' },
                p: 0.5,
              }}
            />
            <Box
              sx={{
                backgroundColor: '#EC3333',
                color: '#fff',
                px: 2,
                py: 0.6,
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {rolActivo}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}