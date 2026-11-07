import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Header from '../../components/organisms/Header/Header';
import CustomButton from '../../components/atoms/Button/CustomButton';

// Datos de prueba simulados
const notificacionesHoy = [
  {
    id: 1,
    titulo: 'Nueva respuesta pública disponible',
    descripcion: 'El vendedor TecnoStore Colombia respondió tu pregunta sobre el producto Laptop Pro X-16 Titanium.',
    hora: 'Hace 10 min',
    tipo: 'mensaje', // Destaca en rojo claro
  },
  {
    id: 2,
    titulo: 'Tienes un mensaje nuevo en tu chat',
    descripcion: 'María J. te envió un mensaje: "Hola, si, tenemos stock disponible para entrega inmediata.."',
    hora: 'Hace 1 hora',
    tipo: 'mensaje', // Destaca en rojo claro
  },
  {
    id: 3,
    titulo: '¡Tu compra ha sido entregada con éxito!',
    descripcion: 'El transportista reportó la entrega exitosa del pedido #AHR-9238B en Bogotá.',
    hora: 'Hace 3 horas',
    tipo: 'sistema', // Fondo blanco
  },
];

const notificacionesAnteriores = [
  {
    id: 4,
    titulo: '¡40% de descuento en Tecnología!',
    descripcion: 'Súper oferta flash: Consigue la Laptop Pro X con envío gratis solo por tiempo limitado.',
    hora: 'Ayer 9:50',
    tipo: 'sistema',
  },
];

export default function NotificationsScreen() {
  const [tabActiva, setTabActiva] = useState('Todas');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <Header />

      <Box sx={{ maxWidth: 1000, margin: '0 auto', padding: 4 }}>
        
        {/* Título */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            <span style={{ backgroundColor: '#FFD54F', padding: '0 4px' }}>Notificaciones</span>
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#555' }}>
            *Mantente al día con todas tus novedades, respuestas, chats y compras.
          </Typography>
        </Box>

        {/* Tabs (Pestañas) */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          {['Todas', 'Mensajes & Preguntas', 'Ofertas'].map((tab) => (
            <Box
              key={tab}
              onClick={() => setTabActiva(tab)}
              sx={{
                px: 3,
                py: 0.5,
                borderRadius: 999,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: tabActiva === tab ? '#EC3333' : '#fff',
                color: tabActiva === tab ? '#fff' : '#555',
                border: tabActiva === tab ? 'none' : '1px solid #ddd',
              }}
            >
              {tab}
            </Box>
          ))}
        </Box>

        {/* SECCIÓN HOY */}
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 2 }}>
          HOY
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {notificacionesHoy.map((notif) => (
            <Box
              key={notif.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 2,
                borderRadius: 1,
                border: notif.tipo === 'mensaje' ? 'none' : '1px solid #e0e0e0',
                backgroundColor: notif.tipo === 'mensaje' ? '#fce4e4' : '#fff', // Rojo claro para mensajes
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                  {notif.titulo}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>
                  {notif.descripcion}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'right', ml: 2, whiteSpace: 'nowrap' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#999', mb: 0.5 }}>
                  {notif.hora}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#EC3333', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  Ver detalle
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* SECCIÓN ANTERIORES */}
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 2 }}>
          ANTERIORES
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notificacionesAnteriores.map((notif) => (
            <Box
              key={notif.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 2,
                borderRadius: 1,
                border: '1px solid #e0e0e0',
                backgroundColor: '#fff',
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                  {notif.titulo}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>
                  {notif.descripcion}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'right', ml: 2, whiteSpace: 'nowrap' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#999', mb: 0.5 }}>
                  {notif.hora}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#EC3333', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  Ver detalle
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

      </Box>
    </Box>
  );
}