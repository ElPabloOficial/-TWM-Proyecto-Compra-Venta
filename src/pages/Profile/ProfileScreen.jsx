import ProfileTemplate from "../../components/templates/ProfileTemplate/ProfileTemplate";
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