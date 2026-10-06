import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
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
import logo from '../../assets/logo.png';
import '../../styles/Register.css';

const initialFormData = {
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  nombreTienda: '',
  rutEmpresa: '',
  categoria: '',
  descripcionTienda: '',
  contrasena: '',
  confirmaContrasena: '',
  terminosAceptados: false,
};

const categories = [
  'Alimentos y bebidas',
  'Hogar y decoración',
  'Moda y accesorios',
  'Tecnología',
  'Servicios',
  'Otro',
];

export default function RegisterScreen() {
  const [userType, setUserType] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSuccess(false);
  };

  const handleTabChange = (_event, newValue) => {
    setUserType(newValue);
    setSubmitted(false);
    setSuccess(false);
  };

  const passwordsMatch =
    formData.contrasena === formData.confirmaContrasena;
  const passwordIsLongEnough = formData.contrasena.length >= 8;

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSuccess(false);

    console.log('Datos de registro:', {
      tipoCuenta: userType === 0 ? 'cliente' : 'vendedor',
      ...formData,
    });

    if (
      !event.currentTarget.reportValidity() ||
      !passwordsMatch ||
      !passwordIsLongEnough ||
      !formData.terminosAceptados
    ) {
      return;
    }

    setSuccess(true);
  };

  const passwordField = (name, label, visible, onToggle) => (
    <TextField
      fullWidth
      required
      name={name}
      label={label}
      type={visible ? 'text' : 'password'}
      value={formData[name]}
      onChange={handleChange}
      autoComplete="new-password"
      inputProps={{ minLength: 8 }}
      error={
        submitted &&
        ((name === 'contrasena' && !passwordIsLongEnough) ||
          (name === 'confirmaContrasena' && !passwordsMatch))
      }
      helperText={
        submitted &&
        name === 'contrasena' &&
        !passwordIsLongEnough
          ? 'Usa al menos 8 caracteres.'
          : submitted &&
              name === 'confirmaContrasena' &&
              !passwordsMatch
            ? 'Las contraseñas no coinciden.'
            : ' '
      }
      InputProps={{
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
      }}
    />
  );

  return (
    <main className="register-page">
      <section className="register-card" aria-labelledby="register-title">
        <a className="register-back" href="/" aria-label="Volver al inicio de sesión">
          ← Volver al inicio de sesión
        </a>
        <div className="register-brand">
          <img src={logo} alt="Ahorraton" className="register-logo" />
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
          <Typography component="h2" className="register-section-title">
            {userType === 0 ? 'Datos personales' : 'Datos del vendedor'}
          </Typography>

          <div className="register-fields">
            {userType === 0 ? (
              <>
                <TextField
                  fullWidth
                  required
                  name="nombres"
                  label="Nombre"
                  value={formData.nombres}
                  onChange={handleChange}
                  autoComplete="given-name"
                />
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  required
                  name="nombreTienda"
                  label="Nombre de la tienda"
                  value={formData.nombreTienda}
                  onChange={handleChange}
                  autoComplete="organization"
                />
                <TextField
                  fullWidth
                  required
                  name="rutEmpresa"
                  label="RUT de la empresa"
                  placeholder="12.345.678-9"
                  value={formData.rutEmpresa}
                  onChange={handleChange}
                />
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Categoría</InputLabel>
                  <Select
                    labelId="category-label"
                    name="categoria"
                    value={formData.categoria}
                    label="Categoría"
                    onChange={handleChange}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  required
                  name="nombres"
                  label="Nombre de contacto"
                  value={formData.nombres}
                  onChange={handleChange}
                  autoComplete="name"
                />
                <TextField
                  fullWidth
                  required
                  name="email"
                  label="Correo electrónico"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  required
                  name="telefono"
                  label="Teléfono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  autoComplete="tel"
                />
                <TextField
                  fullWidth
                  required
                  name="descripcionTienda"
                  label="Descripción de la tienda"
                  value={formData.descripcionTienda}
                  onChange={handleChange}
                  multiline
                  minRows={3}
                  className="register-full-width"
                />
              </>
            )}

            {userType === 0 && (
              <>
                <TextField
                  fullWidth
                  required
                  name="rut"
                  label="RUT"
                  placeholder="12.345.678-9"
                  value={formData.rut}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  required
                  name="telefono"
                  label="Teléfono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  autoComplete="tel"
                />
                <TextField
                  fullWidth
                  required
                  name="fechaNacimiento"
                  label="Fecha de nacimiento"
                  type="date"
                  value={formData.fechaNacimiento || ''}
                  onChange={handleChange}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  required
                  name="email"
                  label="Correo electrónico"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </>
            )}
          </div>

          <Typography component="h2" className="register-section-title">
            Dirección y Número
          </Typography>
          <div className="register-fields">
            
            <TextField
              fullWidth
              required
              name="calle"
              label="Calle"
              value={formData.calle}
              onChange={handleChange}
              autoComplete="calle"
            />
            <TextField
              fullWidth
              required
              name="numero"
              label="Número"
              value={formData.numero}
              onChange={handleChange}
              autoComplete="numero"
            />
            <TextField
              fullWidth
              name="Pasaje"
              label="Pasaje"
              value={formData.Pasaje}
              onChange={handleChange}
              autoComplete="pasaje"
            />
            <TextField
              fullWidth
              name="descripcion"
              label="Descripción"
              value={formData.descripcion}
              onChange={handleChange}
              autoComplete="descripcion"
            />
            <TextField
              fullWidth
              name="sector"
              label="Sector"
              value={formData.sector}
              onChange={handleChange}
              autoComplete="sector"
            />
            <TextField
              fullWidth
              required
              name="comuna"
              label="Comuna"
              value={formData.comuna}
              onChange={handleChange}
              autoComplete="comuna"
            />
            <TextField
              fullWidth
              required
              name="region"
              label="Región"
              value={formData.region}
              onChange={handleChange}
              autoComplete="region"
            />
            <TextField
              fullWidth
              required
              name="provincia"
              label="Provincia"
              value={formData.provincia}
              onChange={handleChange}
              autoComplete="provincia"
            />
          </div>

          <Typography component="h2" className="register-section-title">
            Seguridad de la cuenta
          </Typography>
          <div className="register-fields register-password-fields">
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
          {submitted && !formData.terminosAceptados && (
            <Typography className="register-error" role="alert">
              Debes aceptar los términos para continuar.
            </Typography>
          )}

          {success && (
            <Alert severity="success" className="register-success">
              Cuenta creada exitosamente
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            className="register-submit"
            disableElevation
          >
            Crear cuenta
          </Button>
          <Typography className="register-login-link">
            ¿Ya tienes una cuenta? <a href="/">Inicia sesión</a>
          </Typography>
        </Box>
      </section>
    </main>
  );
}
