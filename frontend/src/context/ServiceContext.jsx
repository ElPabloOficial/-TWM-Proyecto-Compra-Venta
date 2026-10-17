import { createContext, useContext, useState } from "react";

export const modalidades = ["Presencial", "Online", "A domicilio"];

// TEMPORAL: datos de ejemplo hasta que se conecte el backend
const serviciosIniciales = [
  { id: 1, codigo: "SRV-001", nombre: "Instalación de redes", descripcion: "Cableado y configuración de red", categoriaId: 1, modalidad: "A domicilio", duracion: 120, precio: 45000, restriccionEdad: false, oferta: 0, ofertaInicio: "", ofertaFin: "" },
  { id: 2, codigo: "SRV-002", nombre: "Soporte técnico remoto", descripcion: "Asistencia por videollamada", categoriaId: 2, modalidad: "Online", duracion: 60, precio: 15000, restriccionEdad: false, oferta: 20, ofertaInicio: "2026-10-01", ofertaFin: "2026-10-31" },
  { id: 3, codigo: "SRV-003", nombre: "Mantención de equipos", descripcion: "Limpieza y revisión general", categoriaId: 1, modalidad: "Presencial", duracion: 90, precio: 25000, restriccionEdad: true, oferta: 0, ofertaInicio: "", ofertaFin: "" },
];

const ServiceContext = createContext(null);

export const ServiciosProvider = ({ children }) => {
  const [servicios, setServicios] = useState(serviciosIniciales);

  const agregarServicio = (servicio) => {
    setServicios((prev) => [...prev, { ...servicio, id: Date.now() }]);
  };

  const actualizarServicio = (servicio) => {
    setServicios((prev) => prev.map((s) => (s.id === servicio.id ? servicio : s)));
  };

  const eliminarServicio = (id) => {
    setServicios((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <ServiceContext.Provider
      value={{ servicios, agregarServicio, actualizarServicio, eliminarServicio }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServicios = () => useContext(ServiceContext);