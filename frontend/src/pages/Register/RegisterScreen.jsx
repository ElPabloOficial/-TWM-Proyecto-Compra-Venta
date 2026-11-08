import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DateTextField from '../../components/molecules/DateTextField/DateTextField';
import { hoyISO } from '../../components/atoms/DateField/fechaUtils';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import formatRut, { isValidRut } from '../../services/format';
import { pedir } from '../../services/apiClient';
import { authService, limpiarRut } from '../../services/authService';
import { obtenerComunas } from '../../services/addressService';
import logo from '../../assets/logo.png';
import '../../styles/Register.css';

const initialFormData = {
  // Usuario
  nombre: '',
  rut: '',
  telefono: '',
  fechaNacimiento: '',
  email: '',
  // Empresa (solo vendedor)
  nombreEmpresa: '',
  rutEmpresa: '',
  giro: '',
  paginaWeb: '',
  // Dirección
  calle: '',
  numero: '',
  pasaje: '',
  sector: '',
  descripcion: '',
  region: '', // nombre de la región (solo sirve para filtrar)
  provincia: '', // nombre de la provincia (solo sirve para filtrar)
  comuna: '', // id de la comuna: es lo único que guarda la base de datos
  // Seguridad
  contrasena: '',
  confirmaContrasena: '',
  terminosAceptados: false,
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Lista de nombres sin repetir, ordenada, en el formato { id, nombre } que usa el <Select>
const unicos = (nombres) =>
  [...new Set(nombres)]
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map((nombre) => ({ id: nombre, nombre }));

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(0); // 0 = cliente, 1 = vendedor
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiWarning, setApiWarning] = useState('');

  const [todasLasComunas, setTodasLasComunas] = useState([]);
  const [ubicacionError, setUbicacionError] = useState(false);

  const isVendor = userType === 1;

  /* ---------- Región → Provincia → Comuna ----------
     La API solo tiene GET /comunas, que devuelve [{ id, nombre, provincia, region }].
     De esa lista única se arman los tres selectores dependientes. */
  useEffect(() => {
    let activo = true;
    obtenerComunas()
      .then((lista) => activo && setTodasLasComunas(lista))
      .catch(() => activo && setUbicacionError(true));
    return () => {
      activo = false;
    };
  }, []);

  const regiones = useMemo(
    () => unicos(todasLasComunas.map((c) => c.region)),
    [todasLasComunas],
  );

  const provincias = useMemo(
    () =>
      unicos(
        todasLasComunas.filter((c) => c.region === formData.region).map((c) => c.provincia),
      ),
    [todasLasComunas, formData.region],
  );

  const comunas = useMemo(
    () =>
      todasLasComunas.filter(
        (c) => c.region === formData.region && c.provincia === formData.provincia,
      ),
    [todasLasComunas, formData.region, formData.provincia],
  );

  /* ---------- Handlers ---------- */
  const update = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    setSuccess(false);
    setApiError('');
  };

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    update(name, type === 'checkbox' ? checked : value);
  };

  const handleRutChange = (event) => update(event.target.name, formatRut(event.target.value));

  const handleDigitsChange = (maxLength) => (event) =>
    update(event.target.name, event.target.value.replace(/\D/g, '').slice(0, maxLength));

  const handleLettersChange = (event) =>
    update(event.target.name, event.target.value.replace(/[^\p{L}\s'-]/gu, ''));

  const handleRegionChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      region: event.target.value,
      provincia: '',
      comuna: '',
    }));
    setApiError('');
  };

  const handleProvinciaChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      provincia: event.target.value,
      comuna: '',
    }));
    setApiError('');
  };

  const handleTabChange = (_event, newValue) => {
    setUserType(newValue);
    setSubmitted(false);
    setSuccess(false);
    setApiError('');
  };

  /* ---------- Validación (mismos límites que la base de datos) ---------- */
  const errors = useMemo(() => {
    const f = formData;
    const e = {};

    if (f.nombre.trim().length < 3) e.nombre = 'Ingresa tu nombre completo.';
    if (!isValidRut(f.rut)) e.rut = 'Ingresa un RUT válido, ej: 12.345.678-5.';
    if (!/^\d{9}$/.test(f.telefono)) e.telefono = 'Ingresa 9 dígitos, ej: 912345678.';
    if (!f.fechaNacimiento) e.fechaNacimiento = 'Selecciona tu fecha de nacimiento.';
    else if (f.fechaNacimiento < '1940-01-01' || f.fechaNacimiento > hoyISO())
      e.fechaNacimiento = 'La fecha no es válida.';
    if (!isValidEmail(f.email)) e.email = 'Ingresa un correo válido, ej: nombre@dominio.cl.';

    if (isVendor) {
      if (!f.nombreEmpresa.trim()) e.nombreEmpresa = 'Ingresa el nombre de la empresa.';
      if (!isValidRut(f.rutEmpresa)) e.rutEmpresa = 'Ingresa un RUT válido, ej: 76.123.456-7.';
      if (f.paginaWeb && !/^https?:\/\/\S+\.\S+$/i.test(f.paginaWeb.trim()))
        e.paginaWeb = 'Incluye http:// o https://, ej: https://mitienda.cl';
    }

    if (!f.calle.trim()) e.calle = 'Ingresa la calle.';
    if (!f.numero || Number(f.numero) <= 0) e.numero = 'Ingresa un número mayor a 0.';
    if (!f.region) e.region = 'Selecciona una región.';
    if (!f.provincia) e.provincia = 'Selecciona una provincia.';
    if (!f.comuna) e.comuna = 'Selecciona una comuna.';

    if (f.contrasena.length < 8) e.contrasena = 'Usa al menos 8 caracteres.';
    if (f.contrasena !== f.confirmaContrasena)
      e.confirmaContrasena = 'Las contraseñas no coinciden.';
    if (!f.terminosAceptados) e.terminosAceptados = 'Debes aceptar los términos para continuar.';

    return e;
  }, [formData, isVendor]);

  const hasError = (name) => submitted && Boolean(errors[name]);
  // ' ' reserva el espacio del mensaje para que todas las filas queden alineadas
  const help = (name) => (submitted && errors[name]) || ' ';

  /* ---------- Envío ----------
     1) POST /usuarios      -> crea el usuario (Usuario)
     2) POST /usuarios/login -> la API necesita un token para el paso siguiente
     3) PUT  /perfil         -> guarda correo, teléfono, dirección y (vendedor) empresa */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSuccess(false);
    setApiError('');
    setApiWarning('');

    if (Object.keys(errors).length > 0 || submitting) return;

    const f = formData;
    const rut = limpiarRut(f.rut);
    setSubmitting(true);

    // La contraseña nunca se imprime: solo se confirma que se capturó
    console.log('[Registro] Registrar usuario:', {
      rut,
      nombre: f.nombre.trim(),
      fechanacimiento: f.fechaNacimiento,
      tipousuario: isVendor ? 'vendedor' : 'cliente',
      contrasena: '[oculta]',
    });

    // ---- Paso 1: crear el usuario ----
    try {
      await pedir('/usuarios', {
        method: 'POST',
        body: {
          rut,
          nombre: f.nombre.trim(),
          clave: f.contrasena,
          fechanacimiento: f.fechaNacimiento, // "YYYY-MM-DD"
          tipousuario: isVendor ? 'vendedor' : 'cliente',
        },
      });
    } catch (error) {
      setApiError(error.message);
      setSubmitting(false);
      return;
    }

    // ---- Pasos 2 y 3: iniciar sesión y completar el perfil ----
    try {
      await authService.login(rut, f.contrasena);

      await pedir('/perfil', {
        method: 'PUT',
        body: {
          correo: f.email.trim().toLowerCase(),
          telefonos: [f.telefono],
          direccion: {
            calle: f.calle.trim(),
            numero: Number(f.numero),
            pasaje: f.pasaje.trim(),
            descripcion: f.descripcion.trim(),
            sector: f.sector.trim(),
            id_comuna: Number(f.comuna),
          },
          empresa: isVendor
            ? {
                rut: limpiarRut(f.rutEmpresa),
                nombre: f.nombreEmpresa.trim(),
                giro: f.giro.trim(),
                paginaweb: f.paginaWeb.trim(),
              }
            : undefined,
        },
      });
    } catch (error) {
      // El usuario ya existe: si repitiera el formulario, la API respondería "RUT ya registrado".
      // Por eso se le lleva a su perfil para terminar de completar los datos.
      setApiWarning(
        `Tu cuenta se creó, pero no se pudieron guardar todos tus datos: ${error.message} ` +
          'Te llevamos a tu perfil para que los completes.',
      );
      setSubmitting(false);
      setTimeout(() => navigate('/perfil'), 3500);
      return;
    }

    // Todo salió bien: se cierra la sesión local y se envía a iniciar sesión
    await authService.logout();
    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => navigate('/login'), 1500);
  };

  /* ---------- Piezas reutilizables ---------- */
  const field = (name, label, props = {}) => (
    <TextField
      fullWidth
      name={name}
      label={label}
      value={formData[name]}
      onChange={handleChange}
      error={hasError(name)}
      helperText={help(name)}
      {...props}
    />
  );

  const selectField = (name, label, options, onChange, disabled = false) => (
    <FormControl fullWidth required disabled={disabled} error={hasError(name)}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        name={name}
        value={formData[name]}
        label={label}
        onChange={onChange}
        MenuProps={{ PaperProps: { style: { maxHeight: 280 } } }}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.nombre}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{help(name)}</FormHelperText>
    </FormControl>
  );

  const passwordField = (name, label, visible, onToggle) =>
    field(name, label, {
      required: true,
      type: visible ? 'text' : 'password',
      autoComplete: 'new-password',
      InputProps: {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={onToggle}
              edge="end"
            >
              {visible ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      },
    });

  /* ---------- Render ---------- */
  return (
    <main className="register-page">
      <section className="register-card" aria-labelledby="register-title">
        <div className="register-brand">
          <Link to="/inicio" aria-label="Ir al inicio">
            <img src={logo} alt="Ahorraton" className="register-logo" />
          </Link>
          <Typography component="h1" id="register-title" className="register-title">
            Crear cuenta
          </Typography>
          <Typography className="register-subtitle">
            ¿Qué tipo de cuenta deseas crear?
          </Typography>
        </div>

        <Tabs
          value={userType}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="Tipo de cuenta"
          className="register-tabs"
        >
          <Tab label="Cliente" id="register-tab-0" />
          <Tab label="Vendedor" id="register-tab-1" />
        </Tabs>

        <Box
          component="form"
          className="register-form"
          role="tabpanel"
          aria-labelledby={`register-tab-${userType}`}
          onSubmit={handleSubmit}
          noValidate
        >
          {/* ---- Datos personales ---- */}
          <Typography component="h2" className="register-section-title">
            {isVendor ? 'Datos del responsable' : 'Datos personales'}
          </Typography>
          <div className="register-fields">
            {field('nombre', 'Nombre completo', {
              required: true,
              onChange: handleLettersChange,
              autoComplete: 'name',
              inputProps: { maxLength: 100 },
            })}
            {field('rut', 'RUT', {
              required: true,
              placeholder: '12.345.678-5',
              onChange: handleRutChange,
              inputProps: { maxLength: 12 },
            })}
            {field('telefono', 'Teléfono', {
              required: true,
              type: 'tel',
              placeholder: '912345678',
              onChange: handleDigitsChange(9),
              autoComplete: 'tel-national',
              inputProps: { inputMode: 'numeric' },
            })}
            <div>
              <DateTextField
                fullWidth
                required
                name="fechaNacimiento"
                label="Fecha de nacimiento"
                value={formData.fechaNacimiento}
                onChange={(iso) => update('fechaNacimiento', iso)}
                min="1940-01-01"
                max={hoyISO()}
              />
              <FormHelperText error>{help('fechaNacimiento')}</FormHelperText>
            </div>
            {field('email', 'Correo electrónico', {
              required: true,
              type: 'email',
              autoComplete: 'email',
              className: 'register-full-width',
              inputProps: { maxLength: 100 },
            })}
          </div>

          {/* ---- Datos de la empresa (solo vendedor) ---- */}
          {isVendor && (
            <>
              <Typography component="h2" className="register-section-title">
                Datos de la empresa
              </Typography>
              <div className="register-fields">
                {field('nombreEmpresa', 'Nombre de la empresa o tienda', {
                  required: true,
                  autoComplete: 'organization',
                  inputProps: { maxLength: 100 },
                })}
                {field('rutEmpresa', 'RUT de la empresa', {
                  required: true,
                  placeholder: '76.123.456-7',
                  onChange: handleRutChange,
                  inputProps: { maxLength: 12 },
                })}
                {field('giro', 'Giro (opcional)', {
                  placeholder: 'Ej: Venta al por menor de alimentos',
                  inputProps: { maxLength: 100 },
                })}
                {field('paginaWeb', 'Página web (opcional)', {
                  type: 'url',
                  placeholder: 'https://mitienda.cl',
                  autoComplete: 'url',
                  inputProps: { maxLength: 100 },
                })}
              </div>
            </>
          )}

          {/* ---- Dirección ---- */}
          <Typography component="h2" className="register-section-title">
            {isVendor ? 'Dirección de la empresa' : 'Dirección'}
          </Typography>
          <div className="register-fields">
            {field('calle', 'Calle', {
              required: true,
              autoComplete: 'address-line1',
              inputProps: { maxLength: 100 },
            })}
            {field('numero', 'Número', {
              required: true,
              onChange: handleDigitsChange(6),
              inputProps: { inputMode: 'numeric' },
            })}
            {field('pasaje', 'Pasaje (opcional)', { inputProps: { maxLength: 100 } })}
            {field('sector', 'Sector (opcional)', { inputProps: { maxLength: 100 } })}
            {field('descripcion', 'Descripción o referencia (opcional)', {
              placeholder: 'Ej: Depto 402, casa esquina portón negro',
              className: 'register-full-width',
              inputProps: { maxLength: 100 },
            })}
            {selectField('region', 'Región', regiones, handleRegionChange)}
            {selectField(
              'provincia',
              'Provincia',
              provincias,
              handleProvinciaChange,
              !formData.region,
            )}
            <div className="register-full-width">
              {selectField('comuna', 'Comuna', comunas, handleChange, !formData.provincia)}
            </div>
          </div>
          {ubicacionError && (
            <Alert severity="warning" className="register-alert">
              No pudimos cargar las comunas. Revisa que la API esté encendida y recarga la
              página.
            </Alert>
          )}

          {/* ---- Seguridad ---- */}
          <Typography component="h2" className="register-section-title">
            Seguridad de la cuenta
          </Typography>
          <div className="register-fields">
            {passwordField('contrasena', 'Contraseña', showPassword, () =>
              setShowPassword((visible) => !visible),
            )}
            {passwordField(
              'confirmaContrasena',
              'Confirmar contraseña',
              showConfirmPassword,
              () => setShowConfirmPassword((visible) => !visible),
            )}
          </div>

          <FormControlLabel
            className="register-terms"
            control={
              <Checkbox
                name="terminosAceptados"
                checked={formData.terminosAceptados}
                onChange={handleChange}
                color="error"
              />
            }
            label="Acepto los términos y condiciones"
          />
          {hasError('terminosAceptados') && (
            <Typography className="register-error" role="alert">
              {errors.terminosAceptados}
            </Typography>
          )}

          {apiError && (
            <Alert severity="error" className="register-alert">
              {apiError}
            </Alert>
          )}
          {apiWarning && (
            <Alert severity="warning" className="register-alert">
              {apiWarning}
            </Alert>
          )}
          {success && (
            <Alert severity="success" className="register-alert">
              Cuenta creada exitosamente. Te llevamos al inicio de sesión…
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            className="register-submit"
            disableElevation
            disabled={submitting || success}
          >
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>

          <Typography className="register-login-link">
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </Typography>
        </Box>
      </section>
    </main>
  );
}