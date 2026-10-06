import ProfileConfigCard from "../../components/organisms/ProfileConfigCard/ProfileConfigCard";
import { authService } from "../../services/authService";

const ProfileScreen = () => {
  const user = authService.getCurrentUser() || {
    name: "Marcelo",
    rut: "12345678-9",
    role: "vendedor",
  };

  const handleGuardar = (datos) => {
    console.log("[Profile] Guardar cambios:", datos);
  };

  const handleCancelar = () => {
    console.log("[Profile] Cancelar");
  };

  return (
    <div style={{ padding: 40, background: "#f4f4f4", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#000", marginBottom: 4 }}>Configuración de Perfil</h1>
        <p style={{ color: "#555", fontSize: 14, marginTop: 0, marginBottom: 24 }}>
          Mantén tus datos personales y comerciales actualizados para operar con seguridad en Ahorraton.
        </p>

        <ProfileConfigCard
          user={user}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
        />
      </div>
    </div>
  );
};

export default ProfileScreen;