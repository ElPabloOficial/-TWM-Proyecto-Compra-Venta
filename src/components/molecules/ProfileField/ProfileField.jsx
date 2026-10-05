import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomInput from '../../atoms/TextField/CustomInput';

/*
 * ProfileField
 *
 * Molécula que muestra una etiqueta (label) y un campo
 * de entrada (input) con estilo de píldora redondeada.
 *
 * Se usa en el formulario de perfil para todos los campos
 * (nombre, RUT, teléfono, correo, etc.)
 *
 * @param {string} label        → Texto de la etiqueta
 * @param {string} value        → Valor del campo
 * @param {Function} onChange   → Función al cambiar el valor
 * @param {string} type         → Tipo de input (text, email, password, date...)
 * @param {string} placeholder  → Texto de ayuda dentro del campo
 * @param {React.ReactNode} endIcon → Ícono al final del campo (opcional)
 * @param {Object} sx           → Estilos extra (opcional)
 */
export default function ProfileField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  endIcon,
  sx,
  ...props
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ...sx }}>
      {label && (
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#000',
          }}
        >
          {label}
        </Typography>
      )}

      <CustomInput
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        endIcon={endIcon}
        sx={{
          border: '1px solid #333',
          borderRadius: '999px',
          ml: 0,
          px: 2,
          py: 0.8,
          fontSize: '0.85rem',
        }}
        {...props}
      />
    </Box>
  );
}