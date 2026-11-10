import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import ProfileTemplate from "../../components/templates/ProfileTemplate/ProfileTemplate";
import ProfileConfigCard from "../../components/organisms/ProfileConfigCard/ProfileConfigCard";
import FormSkeleton from "../../components/molecules/FormSkeleton/FormSkeleton";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import BecomeSellerDialog from "../../components/organisms/BecomeSellerDialog/BecomeSellerDialog";
import { useToast } from "../../context/ToastContext";
import { authService, limpiarRut } from "../../services/authService";
import { isValidRut } from "../../services/format";
import { esNombreValido, esTelefonoValido, esCorreoValido, esUrlValida } from "../../services/validaciones";
import {
  obtenerPerfil,
  listarComunas,
  guardarPerfil,
  cambiarClave,
  convertirEnVendedor,
} from "../../services/profileService";

const CLAVE_MINIMA = 8; // el mismo mínimo que pide el registro

// Revisa el formulario antes de guardar. Devuelve el mensaje del primer error, o "" si todo está bien.
const validarPerfil = (f, esVendedor, tieneEmpresa) => {
  if (!esNombreValido(f.nombre)) return "El nombre solo puede tener letras y debe tener al menos 3 caracteres.";
  if (f.telefonos.some((t) => t && !esTelefonoValido(t))) return "Cada teléfono debe tener 9 dígitos, por ejemplo 912345678.";
  if (f.correo.trim() && !esCorreoValido(f.correo)) return "Ingresa un correo válido, por ejemplo nombre@dominio.cl.";
  if (f.numero !== "" && Number(f.numero) <= 0) return "El número de la dirección debe ser mayor a 0.";
  if (esVendedor) {
    // Con el interruptor de empresa en "Sí", para agregarla hacen falta el RUT y el nombre
    if (!tieneEmpresa && !(f.rutEmpresa && f.nombreEmpresa.trim())) return "Indica el RUT y el nombre de tu empresa, o cambia la opción a \"No\".";
    if (!tieneEmpresa && f.rutEmpresa && !isValidRut(f.rutEmpresa)) return "El RUT de la empresa no es válido, por ejemplo 76.123.456-7.";
    if (f.paginaWeb.trim() && !esUrlValida(f.paginaWeb)) return "La página web debe empezar con http:// o https://, por ejemplo https://mitienda.cl";
  }
  return "";
};

const ProfileScreen = () => {
  const { mostrarToast } = useToast();
  const haySesion = Boolean(authService.getCurrentUser());

  const [perfil, setPerfil] = useState(null);
  const [comunas, setComunas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [dialogoVendedor, setDialogoVendedor] = useState(false);
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
    // Los datos de empresa solo se validan y se envían si es vendedor y tiene el interruptor en "Sí"
    const conEmpresa = perfil.role === "vendedor" && form.conEmpresa;
    const errorForm = validarPerfil(form, conEmpresa, perfil.tieneEmpresa);
    if (errorForm) {
      mostrarToast(errorForm, "error");
      return;
    }

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
      actualizado = await guardarPerfil(
        {
          ...form,
          telefonos: form.telefonos.filter(Boolean), // sin filas vacías
          rutEmpresa: limpiarRut(form.rutEmpresa), // sin puntos y con guion, igual que en el registro
        },
        conEmpresa
      );
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

  // Selector Cliente / Vendedor: un cliente puede pasar a vendedor (pide los datos de su empresa).
  // Un vendedor no necesita "volver" a cliente: ya puede comprar como cualquier cliente.
  const handleCambiarTipo = (tipo) => {
    console.log("[Perfil] Cambiar tipo de cuenta:", { actual: perfil.role, solicitado: tipo });
    if (tipo === "vendedor" && perfil.role !== "vendedor") {
      setDialogoVendedor(true);
    } else if (tipo === "cliente" && perfil.role === "vendedor") {
      mostrarToast("Como vendedor también puedes comprar: ya tienes todo lo de una cuenta de cliente.", "info");
    }
  };

  const handleConvertirEnVendedor = async (empresa) => {
    const actualizado = await convertirEnVendedor(empresa); // si falla, el diálogo muestra el error
    setPerfil(actualizado);
    setVersion((v) => v + 1); // vuelve a armar el formulario con los datos de empresa
    setDialogoVendedor(false);
    mostrarToast("¡Listo! Tu cuenta ahora es de vendedor.");
  };

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
          onCambiarTipo={handleCambiarTipo}
        />
      )}

      <BecomeSellerDialog
        open={dialogoVendedor}
        onClose={() => setDialogoVendedor(false)}
        onGuardar={handleConvertirEnVendedor}
      />
    </ProfileTemplate>
  );
};

export default ProfileScreen;