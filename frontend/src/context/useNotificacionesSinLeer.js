import { useEffect, useState } from 'react';
import { listarNotificaciones, obtenerLeidas, EVENTO_LEIDAS } from '../services/notificationService';

const REVISAR_CADA_MS = 60000;

// Cantidad de notificaciones sin leer del usuario, para el globo del Header.
// Pide la lista a la API al abrir cada pantalla y cada minuto, y se actualiza al instante cuando se marcan como leídas.
export default function useNotificacionesSinLeer(rut) {
  const [sinLeer, setSinLeer] = useState(0);

  useEffect(() => {
    if (!rut) {
      setSinLeer(0);
      return;
    }

    let activo = true;
    let ids = [];

    const contar = () => {
      const leidas = obtenerLeidas(rut);
      if (activo) setSinLeer(ids.filter((id) => !leidas.has(id)).length);
    };

    const cargar = () =>
      listarNotificaciones()
        .then((datos) => {
          ids = datos.map((n) => n.id);
          contar();
        })
        .catch(() => {
          /* si falla, se queda con el último número y se reintenta en el próximo ciclo */
        });

    cargar();
    const temporizador = setInterval(cargar, REVISAR_CADA_MS);
    window.addEventListener(EVENTO_LEIDAS, contar);

    return () => {
      activo = false;
      clearInterval(temporizador);
      window.removeEventListener(EVENTO_LEIDAS, contar);
    };
  }, [rut]);

  return sinLeer;
}