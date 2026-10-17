
import IconButton from '@mui/material/IconButton';

/*
 * CustomIconButton
 *
 * Componente reutilizable basado en el componente
 * IconButton de Material UI.
 *
 * El botón utiliza un fondo blanco y un ícono de color negro.
 *
 * @param {string} ariaLabel
 * Texto descriptivo utilizado por tecnologías de asistencia
 * como lectores de pantalla.
 *
 * @param {'small'|'medium'|'large'} size
 * Define el tamaño del botón.
 *
 * @param {React.ReactNode} children
 * Contenido del botón, normalmente un componente de ícono.
 *
 * @param {Object} props
 * Permite recibir otras propiedades compatibles con
 * el componente IconButton de Material UI, como:
 * onClick, disabled, sx, etc.
 *
 * @returns {JSX.Element}
 * Retorna un IconButton personalizado.
 */

export default function CustomIconButton({
  ariaLabel = '',
  size = 'medium',
  children,
  ...props
}) {
  return (
    <IconButton
      aria-label={ariaLabel}
      size={size}
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#000000',
      }}
      {...props}
    >
      {children}
    </IconButton>
  );
}


/*
  ============================
  EJEMPLO DE USO
  ============================

  import CustomIconButton from './CustomIconButton';

  import EditIcon from '@mui/icons-material/Edit';
  import DeleteIcon from '@mui/icons-material/Delete';

  function Example() {
    return (
      <>
        <CustomIconButton
          ariaLabel="Editar"
          onClick={() => console.log('Editar')}
        >
          <EditIcon />
        </CustomIconButton>

        <CustomIconButton
          ariaLabel="Eliminar"
          onClick={() => console.log('Eliminar')}
        >
          <DeleteIcon />
        </CustomIconButton>
      </>
    );
  }
*/
