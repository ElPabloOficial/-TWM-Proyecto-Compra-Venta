import Box from '@mui/material/Box';

import CustomLogo from '../../atoms/Logo/CustomLogo';
import SearchBar from '../../molecules/SearchBar/SearchBar';
import CustomButton from '../../atoms/Button/CustomButton';

import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';

export default function Header() {

  return (
    <Box>

      <Box
  sx={{
    backgroundColor: '#EC3333',

    display: 'flex',
    alignItems: 'center',

    gap: 2,

    padding: '12px 32px',

    flexWrap: 'nowrap',
  }}
>
  {/* Logo */}
  <CustomLogo
    text="Ahorraton"
    size={35}
  />

  {/* Barra de búsqueda */}
  <Box
    sx={{
      flex: 1,
      marginRight: 4, // separa la barra de los botones
    }}
  >
    <SearchBar
      placeholder="Buscar producto..."
    />
  </Box>

  {/* Grupo de botones */}
  <Box
    sx={{
      display: 'flex',
      gap: 0,

      '& > button': {
        borderRadius: 0,
        minHeight: '36px'
      },

      '& > button:first-of-type': {
        borderRadius: '0px 0 0 0px'
      },

      '& > button:last-of-type': {
        borderRadius: '0 0px 0px 0'
      },

      '& > button:not(:last-of-type)': {
        borderRight: '1px solid rgba(255, 255, 255, 0.3)'
    }
  }}
  >

    <CustomButton
      variant="primary"
      size="small"
      startIcon={<FavoriteIcon />}
    >
      Favoritos
    </CustomButton>

    <CustomButton
      variant="primary"
      size="small"
      startIcon={<ShoppingCartIcon />}
    >
      Carrito
    </CustomButton>

    <CustomButton
      variant="primary"
      size="small"
      startIcon={<NotificationsIcon />}
    >
      Notificaciones
    </CustomButton>

    <CustomButton
      variant="primary"
      size="small"
      startIcon={<PersonIcon />}
    >
      Perfil
    </CustomButton>

  </Box>
</Box>

      {/* =====================================================
    SEGUNDA FRANJA
    4 botones
    ===================================================== */}
<Box
  sx={{
    backgroundColor: '#FFFFFF',

    display: 'flex',
    alignItems: 'center',

    gap: 0,

    padding: 0,

    border: '1px solid #000000',
    borderRadius: 0,

    overflow: 'hidden',

    width: '100%',
    boxSizing: 'border-box',
  
  }}
>
  <CustomButton
    variant="secondary"
    size="small"
    sx={{
      border: 'none',
      borderRadius: 0,
    }}
  >
    Categorias
  </CustomButton>

  <CustomButton
    variant="secondary"
    size="small"
    sx={{
      border: 'none',
      borderRadius: 0,
    }}
  >
    Ofertas
  </CustomButton>

  <CustomButton
    variant="secondary"
    size="small"
    sx={{
      border: 'none',
      borderRadius: 0,
    }}
  >
    Productos
  </CustomButton>

  <CustomButton
    variant="secondary"
    size="small"
    sx={{
      border: 'none',
      borderRadius: 0,
    }}
  >
    Servicios
  </CustomButton>
</Box>

    </Box>
    
  );
}


/*
===============================================================
EJEMPLO DE USO
===============================================================

import Header from './components/organisms/Header/Header';

function App() {
  return (
    <>
      <Header />

      <main>
        Contenido de la página
      </main>
    </>
  );
}

export default App;

===============================================================
*/