import ProfileTemplate from "../../components/templates/ProfileTemplate/ProfileTemplate";
import ProfileConfigCard from "../../components/organisms/ProfileConfigCard/ProfileConfigCard";

const ProfileScreen = () => {
  // 🎭 SIMULACIÓN: datos falsos para probar el diseño
  // TODO: cuando el backend esté listo, usar authService.getCurrentUser()
  const user = {
    name: "Marcelo González",
    rut: "11.111.111-1",
    role: "vendedor",
    telefono: "+56 9 8765 4321",
    correo: "marcelo@ejemplo.com",
    fechaNacimiento: "1995-03-15",
    rutEmpresa: "76.543.210-K",
    nombreEmpresa: "TecnoMarket SpA",
    giroComercial: "Venta de electrónica",
    paginaWeb: "https://tecnomarket.cl",
    direccionLocal: "Av. Providencia 1234",
    calle: "Av. Providencia",
    numero: "1234",
    pasaje: "",
    descripcion: "Depto 501",
    sector: "Centro",
    comuna: "Providencia",
    region: "Metropolitana",
    provincia: "Santiago",
  };

  const handleGuardar = (datos) => {
    console.log("[Profile] Guardar cambios:", datos);
  };

  const handleCancelar = () => {
    console.log("[Profile] Cancelar");
  };

  return (
    <ProfileTemplate>
      <ProfileConfigCard
        user={user}
        onGuardar={handleGuardar}
        onCancelar={handleCancelar}
      />
    </ProfileTemplate>
  );
};

export default ProfileScreen;