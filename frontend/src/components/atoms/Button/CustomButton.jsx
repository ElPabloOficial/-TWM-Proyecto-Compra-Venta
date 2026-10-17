
import Button from '@mui/material/Button';

/*
 * CustomButton
 *
 * Componente reutilizable basado en el componente Button de Material UI.
 *
 * Permite utilizar diferentes estilos predefinidos:
 * primary, secondary, tertiary, approve y reject.
 *
 * @param {React.ReactNode} children
 * Contenido que se mostrará dentro del botón.
 *
 * @param {React.ReactNode} startIcon
 * Ícono que se mostrará al inicio del botón.
 *
 * @param {'primary'|'secondary'|'tertiary'|'approve'|'reject'} variant
 * Define el estilo visual personalizado del botón.
 *
 * @param {'small'|'medium'|'large'} size
 * Define el tamaño del botón.
 *
 * @param {boolean} hover
 * Permite activar o desactivar el efecto hover.
 *
 * @param {Object} props
 * Permite recibir otras propiedades de Material UI.
 */

export default function CustomButton({
  children,
  startIcon,
  variant = 'primary',
  size = 'medium',
  hover = true,
  sx,
  ...props
}) {

  /*
   * Estilos principales de cada variante.
   */
  const styles = {

    primary: {
      backgroundColor: '#EC3333',
      color: '#FFFFFF',
    },

    secondary: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      border: '2px solid #000000',
    },

    tertiary: {
      backgroundColor: '#FEFEFE',
      color: '#EC3333',
      border: '2px solid #EC3333',
    },

    approve: {
      backgroundColor: 'rgba(22, 163, 74, 0.1216)',
      color: '#16A34A',
    },

    reject: {
      backgroundColor: 'rgba(239, 68, 68, 0.1216)',
      color: '#EF4444',
    },
  };

  /*
   * Estilos que se aplican cuando el mouse
   * pasa sobre el botón.
   */
  const hoverStyles = {

    primary: {
      '&:hover': {
        backgroundColor: '#FFFF',
        color: '#EC3333'
      },
    },

    secondary: {
      '&:hover': {
        backgroundColor: '#EC3333',
        color: '#FFFFFF',
      },
    },

    tertiary: {
      '&:hover': {
        backgroundColor: '#EC3333',
        color: '#FFFFFF',
      },
    },

    approve: {
      '&:hover': {
        backgroundColor: 'rgba(22, 163, 74, 0.25)',
      },
    },

    reject: {
      '&:hover': {
        backgroundColor: 'rgba(239, 68, 68, 0.25)',
      },
    },
  };

  return (
    <Button
      variant="text"
      size={size}
      startIcon={startIcon}
      sx={{
        ...styles[variant],
        ...(hover ? hoverStyles[variant] : {}),
        ...sx,
        // Elimina la sombra propia de MUI
        boxShadow: 'none',
        // Evita que MUI cambie el color al hacer click
        '&:active': {
          boxShadow: 'none',
        },
      }}
      
      {...props}
    >
      {children}
    </Button>
  );
}
/*
  ============================
  EJEMPLO DE USO
  ============================

  import CustomButton from './CustomButton';
  import AddIcon from '@mui/icons-material/Add';

  function Example() {
    const handleClick = () => {
      console.log('Botón presionado');
    };

    return (
      <>
        <CustomButton
          variant="primary"
          size="medium"
          onClick={handleClick}
        >
          Guardar
        </CustomButton>

        <CustomButton
          variant="secondary"
          size="medium"
          onClick={handleClick}
        >
          Cancelar
        </CustomButton>

        <CustomButton
          variant="tertiary"
          size="small"
        >
          Editar
        </CustomButton>

        <CustomButton
          variant="approve"
          size="medium"
        >
          Aprobar
        </CustomButton>

        <CustomButton
          variant="reject"
          size="medium"
        >
          Rechazar
        </CustomButton>

        <CustomButton
          variant="primary"
          startIcon={<AddIcon />}
        >
          Agregar
        </CustomButton>
      </>
    );
  }
*/
