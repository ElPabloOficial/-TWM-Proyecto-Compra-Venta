import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import * as api from "../services/servicioService";

export const modalidades = ["Presencial", "Online", "A domicilio"];

const ServiceContext = createContext(null);

export const ServiciosProvider = ({ children }) => {
  const [serviciosApi, setServiciosApi] = useState([]);
  const [cargando, setCargando] = useState(() => Boolean(authService.getCurrentUser()));
  const [error, setError] = useState("");
  const recargar = useCallback(async ({ silencioso = false } = {}) => {
    if (!authService.getCurrentUser()) {
      setServiciosApi([]);
      setCargando(false);
      return;
    }

    if (!silencioso) setCargando(true);
    setError("");
    try {
      setServiciosApi(await api.listarMisServicios());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);
  const servicios = serviciosApi.map((s) => ({ ...s, estadoOferta: api.calcularEstadoOferta(s) }));
  const agregarServicio = async (datos) => {
    try {
      await api.crearServicio(datos);
    } finally {
      await recargar({ silencioso: true });
    }
  };

  const actualizarServicio = async (datos) => {
    const original = serviciosApi.find((s) => s.id === datos.id);
    try {
      await api.actualizarServicio(datos, original);
    } finally {
      await recargar({ silencioso: true });
    }
  };

  const eliminarServicio = async (id) => {
    await api.eliminarServicio(id);
    await recargar({ silencioso: true });
  };

  return (
    <ServiceContext.Provider
      value={{
        servicios,
        cargando,
        error,
        recargar,
        agregarServicio,
        actualizarServicio,
        eliminarServicio,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServicios = () => useContext(ServiceContext);
