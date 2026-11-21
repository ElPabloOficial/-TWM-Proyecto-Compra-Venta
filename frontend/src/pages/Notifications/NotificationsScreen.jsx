import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Header from '../../components/organisms/Header/Header';
import CustomButton from '../../components/atoms/Button/CustomButton';
import ErrorState from '../../components/molecules/ErrorState/ErrorState';
import useCart from '../../context/useCart';
import { listarNotificaciones, obtenerLeidas, guardarLeidas } from '../../services/notificationService';

const TABS = [
  { nombre: 'Todas', filtro: () => true },
  { nombre: 'Mensajes & Preguntas', filtro: (n) => n.tipo === 'mensaje' },
  { nombre: 'Ofertas', filtro: (n) => n.tipo === 'oferta' },
];

const dosDigitos = (n) => String(n).padStart(2, '0');
const formatoFecha = (f) => `${dosDigitos(f.getDate())}-${dosDigitos(f.getMonth() + 1)}-${f.getFullYear()}`;
const mismoDia = (a, b) => a.toDateString() === b.toDateString();

// "Hace 10 min", "Hace 3 horas", "Ayer 9:50"; si el dato no trae hora, solo "Hoy", "Ayer" o la fecha
function textoFecha(notif, ahora) {
  const fecha = new Date(notif.fecha);
  if (Number.isNaN(fecha.getTime())) return '';

  const ayer = new Date(ahora);
  ayer.setDate(ayer.getDate() - 1);

  if (notif.soloFecha) {
    if (mismoDia(fecha, ahora)) return 'Hoy';
    if (mismoDia(fecha, ayer)) return 'Ayer';
    return formatoFecha(fecha);
  }

  const minutos = Math.floor((ahora - fecha) / 60000);
  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;
  if (mismoDia(fecha, ahora)) {
    const horas = Math.floor(minutos / 60);
    return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  }
  if (mismoDia(fecha, ayer)) return `Ayer ${fecha.getHours()}:${dosDigitos(fecha.getMinutes())}`;
  return formatoFecha(fecha);
}

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const { user } = useCart();
  const rut = user?.rut ?? null;

  const [tabActiva, setTabActiva] = useState('Todas');
  const [notificaciones, setNotificaciones] = useState([]);
  const [leidas, setLeidas] = useState(() => new Set());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);

  // Carga las notificaciones desde la API (GET /notificaciones) y recuerda cuáles ya se leyeron en este navegador
  useEffect(() => {
    if (!rut) return;
    let activo = true;

    setCargando(true);
    setError('');
    setLeidas(obtenerLeidas(rut));

    listarNotificaciones()
      .then((datos) => {
        if (activo) setNotificaciones(datos);
      })
      .catch((e) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [rut, recarga]);

  const ahora = new Date();
  const inicioDeHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  const visibles = useMemo(() => {
    const { filtro } = TABS.find((t) => t.nombre === tabActiva) ?? TABS[0];
    return notificaciones.filter(filtro);
  }, [notificaciones, tabActiva]);

  const hoy = visibles.filter((n) => new Date(n.fecha) >= inicioDeHoy);
  const anteriores = visibles.filter((n) => new Date(n.fecha) < inicioDeHoy);
  const sinLeer = notificaciones.filter((n) => !leidas.has(n.id)).length;

  const marcarLeida = (id) => {
    if (leidas.has(id)) return;
    const nuevas = new Set(leidas).add(id);
    setLeidas(nuevas);
    guardarLeidas(rut, nuevas);
  };

  const marcarTodasLeidas = () => {
    const nuevas = new Set(leidas);
    notificaciones.forEach((n) => nuevas.add(n.id));
    setLeidas(nuevas);
    guardarLeidas(rut, nuevas);
  };

  const abrir = (notif) => {
    marcarLeida(notif.id);
    if (notif.ruta) navigate(notif.ruta);
  };

  const tarjeta = (notif) => {
    const nueva = !leidas.has(notif.id);
    // Los mensajes y preguntas van en rojo claro mientras están sin leer; al verlos pasan a blanco
    const destacada = notif.tipo === 'mensaje' && nueva;

    return (
      <Box
        key={notif.id}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 2,
          borderRadius: 1,
          border: destacada ? 'none' : '1px solid #e0e0e0',
          backgroundColor: destacada ? '#fce4e4' : '#fff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {nueva && (
            <Box
              aria-label="Sin leer"
              sx={{ width: 8, height: 8, mt: 0.8, borderRadius: '50%', backgroundColor: '#EC3333', flexShrink: 0 }}
            />
          )}
          <Box>
            <Typography sx={{ fontWeight: nueva ? 700 : 600, fontSize: '0.9rem', mb: 0.5 }}>{notif.titulo}</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>{notif.descripcion}</Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'right', ml: 2, whiteSpace: 'nowrap' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#999', mb: 0.5 }}>{textoFecha(notif, ahora)}</Typography>
          <Box
            component="button"
            type="button"
            onClick={() => abrir(notif)}
            sx={{
              p: 0,
              border: 'none',
              background: 'none',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
              color: '#EC3333',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Ver detalle
          </Box>
        </Box>
      </Box>
    );
  };

  const seccion = (titulo, items, ultimo) => (
    <>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 2 }}>{titulo}</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: ultimo ? 0 : 4 }}>
        {items.length > 0 ? (
          items.map(tarjeta)
        ) : (
          <Typography sx={{ fontSize: '0.85rem', color: '#777' }}>No hay notificaciones.</Typography>
        )}
      </Box>
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <Header />

      <Box sx={{ maxWidth: 1000, margin: '0 auto', padding: 4 }}>
        {/* Título */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Notificaciones
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#555' }}>
              *Mantente al día con todas tus novedades, respuestas, chats y compras.
              {rut && !cargando && !error && sinLeer > 0 && ` Tienes ${sinLeer} sin leer.`}
            </Typography>
          </Box>

          {rut && !cargando && !error && sinLeer > 0 && (
            <CustomButton
              variant="primary"
              size="medium"
              onClick={marcarTodasLeidas}
              sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Marcar todas como leídas
            </CustomButton>
          )}
        </Box>

        {!rut ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>Inicia sesión para ver tus notificaciones</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#555', mb: 2 }}>
              Tus novedades aparecen aquí cuando entras a tu cuenta.
            </Typography>
            <CustomButton
              variant="primary"
              size="medium"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Iniciar sesión
            </CustomButton>
          </Box>
        ) : cargando ? (
          <p role="status">Cargando tus notificaciones...</p>
        ) : error ? (
          <ErrorState titulo="No pudimos cargar tus notificaciones" detalle={error} onReintentar={() => setRecarga((n) => n + 1)} />
        ) : (
          <>
            {/* Tabs (Pestañas) */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              {TABS.map(({ nombre }) => (
                <Box
                  key={nombre}
                  onClick={() => setTabActiva(nombre)}
                  sx={{
                    px: 3,
                    py: 0.5,
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: tabActiva === nombre ? '#EC3333' : '#fff',
                    color: tabActiva === nombre ? '#fff' : '#555',
                    border: tabActiva === nombre ? 'none' : '1px solid #ddd',
                  }}
                >
                  {nombre}
                </Box>
              ))}
            </Box>

            {notificaciones.length === 0 ? (
              <Typography sx={{ fontSize: '0.9rem', color: '#555' }}>Aún no tienes notificaciones.</Typography>
            ) : (
              <>
                {seccion('HOY', hoy, false)}
                {seccion('ANTERIORES', anteriores, true)}
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}