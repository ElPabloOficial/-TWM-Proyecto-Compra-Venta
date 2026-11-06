import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/*
 * ProfileAccountType
 *
 * Molécula que muestra el tipo de cuenta / rol activo del usuario.
 * Dos botones: Cliente Comprador y Vendedor Comercial.
 * El activo se pinta de rojo.
 *
 * @param {string} tipoActivo  → "cliente" o "vendedor"
 * @param {Function} onChange  → Callback al cambiar de rol
 */
export default function ProfileAccountType({
  tipoActivo = 'cliente',
  onChange,
}) {
  const esCliente = tipoActivo === 'cliente';
  const esVendedor = tipoActivo === 'vendedor';

  const baseStyles = {
    padding: '10px 24px',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid #EC3333',
    minWidth: 220,
    textAlign: 'center',
  };

  const activoStyles = {
    ...baseStyles,
    backgroundColor: '#EC3333',
    color: '#fff',
  };

  const inactivoStyles = {
    ...baseStyles,
    backgroundColor: '#fff',
    color: '#EC3333',
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#000',
          mb: 1,
        }}
      >
        Tipo de Cuenta / Rol Activo
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box
          component="button"
          type="button"
          onClick={() => onChange?.('cliente')}
          sx={esCliente ? activoStyles : inactivoStyles}
        >
          {esCliente ? 'Cliente Comprador (Activo)' : 'Cliente Comprador'}
        </Box>

        <Box
          component="button"
          type="button"
          onClick={() => onChange?.('vendedor')}
          sx={esVendedor ? activoStyles : inactivoStyles}
        >
          {esVendedor ? 'Vendedor Comercial (Activo)' : 'Vendedor Comercial'}
        </Box>
      </Box>
    </Box>
  );
}