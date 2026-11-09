import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/BarChart'; // O DashboardIcon
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import SyncIcon from '@mui/icons-material/Sync';
import ChatIcon from '@mui/icons-material/Chat';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import logoImage from '../../../assets/logo.png'; // Ajusta la ruta si es necesario

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, ruta: '/admin' },
  { id: 'usuarios', label: 'Usuarios', icon: <PeopleIcon />, ruta: '/usuarios' },
  { id: 'categorias', label: 'Categorías', icon: <FolderIcon />, ruta: '/categorias' },
  { id: 'transacciones', label: 'Transacciones', icon: <SyncIcon />, ruta: '/transacciones' },
  { id: 'envios', label: 'Costos de envío', icon: <LocalShippingIcon />, ruta: '/envios' },
  { id: 'mensajeria', label: 'Mensajería', icon: <ChatIcon />, ruta: '/mensajes' },
];

export default function AdminSidebar({ onSelect }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // La opción activa sale de la URL; si no coincide ninguna, es el Dashboard
  const activo =
    menuItems.find((m) => pathname === m.ruta || pathname.startsWith(m.ruta + '/'))?.id ?? 'dashboard';

  const handleSelect = (item) => {
    navigate(item.ruta);
    onSelect?.(item.id);
  };

  return (
    <Box
      sx={{
        width: 220,
        minHeight: '100vh',
        backgroundColor: '#2b2b2b',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
      }}
    >
      {/* Título superior */}
      <Typography sx={{ fontWeight: 'bold', color: '#aaa', mb: 3, fontSize: '0.9rem' }}>
        MenuADMIN
      </Typography>

      {/* Logo */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <img src={logoImage} alt="Logo" style={{ width: 60 }} />
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mt: 1 }}>
          Menu Administrador
        </Typography>
      </Box>

      {/* Items del menú */}
      <Box sx={{ width: '100%', px: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {menuItems.map((item) => {
          const isActive = activo === item.id;
          return (
            <Box
              key={item.id}
              onClick={() => handleSelect(item)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                padding: '10px 16px',
                borderRadius: 1,
                cursor: 'pointer',
                backgroundColor: isActive ? '#EC3333' : 'transparent',
                color: '#fff',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: isActive ? '#EC3333' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {/* Ícono */}
              <Box sx={{ display: 'flex', alignItems: 'center', color: isActive ? '#fff' : '#aaa' }}>
                {item.icon}
              </Box>
              {/* Texto */}
              <Typography sx={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}