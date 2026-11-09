import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import { useNavigate, useLocation } from 'react-router-dom';

import CustomLogo from '../../atoms/Logo/CustomLogo';
import SearchBar from '../../molecules/SearchBar/SearchBar';
import ProfileMenu from '../../molecules/ProfileMenu/ProfileMenu';
import CustomButton from '../../atoms/Button/CustomButton';
import CategoryMenu from '../CategoryMenu/CategoryMenu';

import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import useCart from '../../../context/useCart';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, user } = useCart();
  const [categoriasAbiertas, setCategoriasAbiertas] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // En el catálogo la barra muestra la búsqueda activa (y se vacía si se quita desde la URL)
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') ?? '';
    setBusqueda(location.pathname === '/catalogo' ? q : '');
  }, [location.pathname, location.search]);

  // Buscar lleva al catálogo con ?q=texto (sin texto, al catálogo completo)
  const buscar = () => {
    const texto = busqueda.trim();
    console.log('[Búsqueda] Buscar:', { texto });
    setCategoriasAbiertas(false);
    navigate(texto ? `/catalogo?q=${encodeURIComponent(texto)}` : '/catalogo');
  };

  // Ofertas, Productos y Servicios abren el catálogo ya filtrado por ese tipo
  const irACatalogo = (tipo) => {
    setCategoriasAbiertas(false);
    navigate(`/catalogo?estado=${tipo}`);
  };

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
        <Box
          sx={{
            '& *': {
              color: '#FFFFFF !important',
            },
          }}
        >
          <CustomLogo
            text="Ahorraton"
            size={50}
          />
        </Box>

        {/* Barra de búsqueda */}
        <Box
          sx={{
            flex: 1,
            marginRight: 4, // separa la barra de los botones
          }}
        >
          <SearchBar
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onSearch={buscar}
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
              minHeight: '36px',
            },

            '& > button:first-of-type': {
              borderRadius: '0px 0 0 0px',
            },

            '& > button:last-of-type': {
              borderRadius: '0 0px 0px 0',
            },

            '& > button:not(:last-of-type)': {
              borderRight: '1px solid rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          <CustomButton
            variant="primary"
            size="small"
            startIcon={<FavoriteIcon />}
            onClick={() => navigate(user ? '/listasdedeseos' : '/login')}
          >
            Favoritos
          </CustomButton>

          <CustomButton
            variant="primary"
            size="small"
            startIcon={
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            }
            onClick={() => navigate(user ? '/carrito' : '/login')}
          >
            Carrito
          </CustomButton>

          <CustomButton
            variant="primary"
            size="small"
            startIcon={<NotificationsIcon />}
            onClick={() => navigate(user ? '/notificaciones' : '/login')}
          >
            Notificaciones
          </CustomButton>

          {/* Botón Perfil con menú desplegable */}
          <ProfileMenu />
        </Box>
      </Box>

      {/* =====================================================
          SEGUNDA FRANJA
          4 botones
          ===================================================== */}
      {/* Segunda franja + menú de categorías */}
      <Box
        sx={{ position: 'relative' }}
        onMouseLeave={() => setCategoriasAbiertas(false)}
      >
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
            aria-haspopup="true"
            aria-expanded={categoriasAbiertas}
            onMouseEnter={() => setCategoriasAbiertas(true)}
            onClick={() => setCategoriasAbiertas((v) => !v)}
            sx={{
              border: 'none',
              borderRadius: 0,
              ...(categoriasAbiertas && { backgroundColor: '#EC3333', color: '#FFFFFF' }),
            }}
          >
            Categorias
          </CustomButton>

          <CustomButton
            variant="secondary"
            size="small"
            onClick={() => irACatalogo('oferta')}
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
            onClick={() => irACatalogo('producto')}
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
            onClick={() => irACatalogo('servicio')}
            sx={{
              border: 'none',
              borderRadius: 0,
            }}
          >
            Servicios
          </CustomButton>
        </Box>
        <CategoryMenu
          abierto={categoriasAbiertas}
          onCerrar={() => setCategoriasAbiertas(false)}
        />
      </Box>
    </Box>
  );
};

export default Header;


/*
===============================================================
EJEMPLO DE USO
===============================================================

import Header from './components/organisms/Header/Header';

const App = () => {
  return (
    <>
      <Header />

      <main>
        Contenido de la página
      </main>
    </>
  );
};

export default App;

===============================================================
*/