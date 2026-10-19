import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';

/*
 * CustomInput
 *
 * Componente reutilizable basado en el componente
 * InputBase de Material UI.
 *
 * Permite crear campos de texto personalizados,
 * incluyendo la posibilidad de agregar íconos al
 * inicio o al final del campo.
 *
 * @param {string} placeholder
 * Texto que se muestra cuando el campo está vacío.
 *
 * @param {string|number} value
 * Valor actual del campo.
 *
 * @param {'text'|'password'|'email'|'number'|'search'|'tel'|'url'} type
 * Define el tipo de dato que puede ingresar el usuario.
 *
 * @param {React.ReactNode} startIcon
 * Ícono que se muestra al inicio del campo.
 *
 * @param {React.ReactNode} endIcon
 * Ícono que se muestra al final del campo.
 *
 * @param {Object} props
 * Permite recibir otras propiedades compatibles
 * con InputBase, como:
 * onChange, disabled, required, name, id, etc.
 *
 * @returns {JSX.Element}
 * Retorna un campo de entrada personalizado.
 */
export default function CustomInput({
  placeholder = '',
  value,
  type = 'text',
  startIcon,
  endIcon,
  sx,
  ...props
}) {
  return (
    <InputBase
      sx={{
        border: '2px solid #000',
        borderRadius: '5px',
        ml: 1,
        flex: 1,
        ...sx
      }}
      placeholder={placeholder}
      value={value}
      type={type}
      startAdornment={
        startIcon ? (
          <InputAdornment position="start">
            {startIcon}
          </InputAdornment>
        ) : null
      }
      endAdornment={
        endIcon ? (
          <InputAdornment position="end">
            {endIcon}
          </InputAdornment>
        ) : null
      }
      {...props}
    />
  );
}


/*
  ============================
  EJEMPLO CON ÍCONO AL FINAL
  ============================

  import VisibilityIcon from '@mui/icons-material/Visibility';

  <CustomInput
    placeholder="Contraseña"
    type="password"
    endIcon={<VisibilityIcon />}
  />


  ============================
  EJEMPLO CON ÍCONOS EN AMBOS LADOS
  ============================

  import SearchIcon from '@mui/icons-material/Search';
  import ClearIcon from '@mui/icons-material/Clear';

  <CustomInput
    placeholder="Buscar producto"
    startIcon={<SearchIcon />}
    endIcon={<ClearIcon />}
  />
*/