import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomInput from '../../atoms/TextField/CustomInput';
import { useTextoFecha, hoyISO } from '../../atoms/DateField/fechaUtils';
import SelectorCalendario from '../../atoms/DateField/SelectorCalendario';

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
 * @param {boolean} readOnly    → Campo solo de lectura (se ve gris y no se puede editar)
 * @param {Object} sx           → Estilos extra (opcional)
 */
export default function ProfileField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  endIcon,
  readOnly = false,
  sx,
  ...props
}) {
  // type="date": se escribe y se ve como dd/mm/aaaa. "onChange" recibe un evento con la fecha ISO
  // (AAAA-MM-DD) en target.value, igual que los demás campos. Límites: nacimiento desde 1940 hasta hoy.
  const esFecha = type === 'date';
  const fecha = useTextoFecha(
    esFecha ? value : '',
    (iso) => onChange?.({ target: { value: iso } }),
    { min: '1940-01-01', max: hoyISO() },
  );

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
        type={esFecha ? 'text' : type}
        value={esFecha ? fecha.texto : value}
        onChange={esFecha ? fecha.escribir : onChange}
        placeholder={esFecha ? 'dd/mm/aaaa' : placeholder}
        inputProps={esFecha ? { inputMode: 'numeric', maxLength: 10 } : undefined}
        endIcon={
          esFecha ? (
            <SelectorCalendario value={value} min="1940-01-01" max={hoyISO()} onElegir={fecha.elegir} />
          ) : (
            endIcon
          )
        }
        readOnly={readOnly}
        sx={{
          border: '1px solid #333',
          borderRadius: '999px',
          ml: 0,
          px: 2,
          py: 0.8,
          fontSize: '0.85rem',
          ...(readOnly && { backgroundColor: '#f4f4f4', color: '#666' }),
        }}
        {...props}
      />
    </Box>
  );
}