import CustomAvatar from "../../components/atoms/Avatar/CustomAvatar";
import ProfileSection from "../../components/molecules/ProfileSection/ProfileSection";
import ProfileField from "../../components/molecules/ProfileField/ProfileField";

const ProfileScreen = () => {
  return (
    <div style={{ padding: 40, background: "#f4f4f4", minHeight: "100vh" }}>
      <h1 style={{ color: "#000", marginBottom: 4 }}>Configuración de Perfil</h1>
      <p style={{ color: "#555", fontSize: 14, marginTop: 0, marginBottom: 24 }}>
        Mantén tus datos personales y comerciales actualizados para operar con seguridad en Ahorraton.
      </p>

      <div style={{ background: "#fff", padding: 24, borderRadius: 8, maxWidth: 1100 }}>
        <ProfileSection title="Datos Personales">
          <CustomAvatar alt="Marcelo" size={90} />

          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ProfileField label="Nombre Completo" placeholder="Ingresa tu nombre" />
            <ProfileField label="RUT" placeholder="12345678-9" />
            <ProfileField label="Teléfono de Contacto" placeholder="+56 9 1234 5678" />
            <ProfileField label="Fecha de Nacimiento" type="date" />
            <ProfileField label="Correo Electrónico" placeholder="correo@ejemplo.com" />
          </div>
        </ProfileSection>
      </div>
    </div>
  );
};

export default ProfileScreen;