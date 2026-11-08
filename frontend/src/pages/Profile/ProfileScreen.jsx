import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import ProfileTemplate from "../../components/templates/ProfileTemplate/ProfileTemplate";
import ProfileConfigCard from "../../components/organisms/ProfileConfigCard/ProfileConfigCard";
import FormSkeleton from "../../components/molecules/FormSkeleton/FormSkeleton";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { useToast } from "../../context/ToastContext";
import { authService } from "../../services/authService";
import {
  obtenerPerfil,
  listarComunas,
  guardarPerfil,
  cambiarClave,
} from "../../services/profileService";

const CLAVE_MINIMA = 8; // el mismo mínimo que pide el registro

const ProfileScreen = () => {
  const { mostrarToast } = useToast();
  const haySesion = Boolean(authService.getCurrentUser());

  const [perfil, setPerfil] = useState(null);
  const [comunas, setComunas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  // Al cambiar vuelve a armarse el formulario: descarta lo escrito y limpia los campos de contraseña
  const [version, setVersion] = useState(0);

  // Sube al pedir "Reintentar" para volver a ejecutar la carga
  const [intento, setIntento] = useState(0);

  // El estado inicial ya es "cargando", así que aquí solo se actualiza cuando llega la respuesta
  useEffect(() => {
    if (!haySesion) return;
    let activo = true; // evita actualizar el estado si la pantalla se cerró antes de que llegue la respuesta

    const cargar = async () => {
      try {
        const [datos, listaComunas] = await Promise.all([
          obtenerPerfil(),
          listarComunas().catch(() => {
            mostrarToast("No se pudo cargar la lista de comunas.", "error");
            return [];
          }),
        ]);
        if (!activo) return;
        setPerfil(datos);
        setComunas(listaComunas);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [haySesion, intento, mostrarToast]);

  const reintentar = () => {
    setCargando(true);
    setError("");
    setIntento((n) => n + 1);
  };

  const handleGuardar = async (form) => {
    const quiereCambiarClave = Boolean(
      form.passwordActual || form.passwordNueva || form.passwordConfirmar
    );

    // Se revisa la contraseña antes de guardar nada, para no dejar el perfil a medias
    if (quiereCambiarClave) {
      if (!form.passwordActual || !form.passwordNueva) {
        mostrarToast("Para cambiar la contraseña ingresa la actual y la nueva.", "error");
        return;
      }
      if (form.passwordNueva.length < CLAVE_MINIMA) {
        mostrarToast(`La nueva contraseña debe tener al menos ${CLAVE_MINIMA} caracteres.`, "error");
        return;
      }
      if (form.passwordNueva !== form.passwordConfirmar) {
        mostrarToast("Las contraseñas nuevas no coinciden.", "error");
        return;
      }
    }

    setGuardando(true);

    let actualizado;
    try {
      actualizado = await guardarPerfil(form, perfil.role === "vendedor");
    } catch (e) {
      mostrarToast(e.message, "error");
      setGuardando(false);
      return;
    }

    // El nombre guardado en la sesión también cambia, sin pedir volver a iniciar sesión
    authService.actualizarUsuario({ name: actualizado.name });
    setPerfil(actualizado);

    if (quiereCambiarClave) {
      try {
        await cambiarClave({ claveActual: form.passwordActual, claveNueva: form.passwordNueva });
        mostrarToast("Perfil y contraseña actualizados correctamente.");
      } catch (e) {
        mostrarToast(`Perfil guardado, pero no se cambió la contraseña: ${e.message}`, "error");
      }
    } else {
      mostrarToast("Perfil actualizado correctamente.");
    }

    setVersion((v) => v + 1);
    setGuardando(false);
  };

  const handleCancelar = () => setVersion((v) => v + 1);

  if (!haySesion) return <Navigate to="/login" replace />;

  return (
    <ProfileTemplate>
      {cargando ? (
        <FormSkeleton campos={8} />
      ) : error ? (
        <ErrorState
          titulo="No pudimos cargar tu perfil"
          detalle={error}
          onReintentar={reintentar}
        />
      ) : (
        <ProfileConfigCard
          key={version}
          user={perfil}
          comunas={comunas}
          guardando={guardando}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
        />
      )}
    </ProfileTemplate>
  );
};

export default ProfileScreen;
