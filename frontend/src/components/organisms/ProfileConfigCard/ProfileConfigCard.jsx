import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CustomAvatar from '../../atoms/Avatar/CustomAvatar';
import CustomButton from '../../atoms/Button/CustomButton';
import ProfileSection from '../../molecules/ProfileSection/ProfileSection';
import ProfileField from '../../molecules/ProfileField/ProfileField';
import ProfileAccountType from '../../molecules/ProfileAccountType/ProfileAccountType';
import ProfilePassword from '../../molecules/ProfilePassword/ProfilePassword';
import ProfileSwitch from '../../molecules/ProfileSwitch/ProfileSwitch';
import formatRut from '../../../services/format';
import { soloLetras, soloDigitos, telefonoADigitos } from '../../../services/validaciones';

const MAX_TELEFONOS = 5; // el mismo máximo que acepta la API

// "comunas" viene de la API: [{ id, nombre, provincia, region }]. Al elegir una comuna, su provincia
// y su región se completan solas (así la dirección siempre apunta a una comuna que existe).
export default function ProfileConfigCard({ user = {}, comunas = [], guardando = false, onGuardar, onCancelar, onCambiarTipo }) {
  const [form, setForm] = useState({
    nombre: user.name || '',
    rut: user.rut || '',
    // Siempre hay al menos una fila para escribir
    telefonos: user.telefonos?.length ? user.telefonos.map(telefonoADigitos) : [''],
    fechaNacimiento: user.fechaNacimiento || '',
    correo: user.correo || '',
    // Un vendedor puede tener empresa o no: "Sí" muestra los datos de empresa, "No" los oculta
    conEmpresa: Boolean(user.tieneEmpresa),
    rutEmpresa: user.rutEmpresa || '',
    nombreEmpresa: user.nombreEmpresa || '',
    giroComercial: user.giroComercial || '',
    paginaWeb: user.paginaWeb || '',
    direccionLocal: user.direccionLocal || '',
    calle: user.calle || '',
    numero: user.numero || '',
    pasaje: user.pasaje || '',
    descripcion: user.descripcion || '',
    sector: user.sector || '',
    idComuna: user.idComuna ?? '',
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: '',
  });

  const esVendedor = user.role === 'vendedor';

  const cambiar = (campo) => (e) =>
    setForm((anterior) => ({ ...anterior, [campo]: e.target.value }));

  const cambiarTelefono = (indice) => (e) =>
    setForm((anterior) => ({
      ...anterior,
      telefonos: anterior.telefonos.map((t, i) => (i === indice ? soloDigitos(e.target.value, 9) : t)),
    }));

  const agregarTelefono = () =>
    setForm((anterior) =>
      anterior.telefonos.length >= MAX_TELEFONOS
        ? anterior
        : { ...anterior, telefonos: [...anterior.telefonos, ''] }
    );

  const quitarTelefono = (indice) => () =>
    setForm((anterior) => ({
      ...anterior,
      telefonos: anterior.telefonos.filter((_, i) => i !== indice),
    }));

  // El número de la dirección solo admite dígitos (la base de datos lo guarda como entero)
  const cambiarNumero = (e) =>
    setForm((anterior) => ({ ...anterior, numero: soloDigitos(e.target.value, 6) }));

  // Aplica un filtro de validaciones.js a lo que se escribe (por ejemplo, solo letras en el nombre)
  const cambiarFiltrado = (campo, filtro) => (e) =>
    setForm((anterior) => ({ ...anterior, [campo]: filtro(e.target.value) }));

  const comunaSeleccionada = comunas.find((c) => c.id === Number(form.idComuna)) ?? null;

  const handleGuardar = () => {
    console.log('[Perfil] Guardar cambios del perfil:', form);
    onGuardar?.(form);
  };

  return (
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <ProfileSection title="Datos Personales">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '120px 1fr' }, gap: 3, alignItems: 'start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CustomAvatar alt={form.nombre || 'Usuario'} size={90} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'start' }}>
            <ProfileField label="Nombre Completo" value={form.nombre} onChange={cambiarFiltrado('nombre', soloLetras)} placeholder="Ingresa tu nombre" />
            <ProfileField label="RUT" value={form.rut} readOnly />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#000' }}>
                {form.telefonos.length > 1 ? 'Teléfonos de Contacto' : 'Teléfono de Contacto'}
              </Typography>
              {form.telefonos.map((telefono, i) => (
                <ProfileField
                  key={i}
                  value={telefono}
                  onChange={cambiarTelefono(i)}
                  placeholder="912345678"
                  endIcon={
                    form.telefonos.length > 1 ? (
                      <span
                        onClick={quitarTelefono(i)}
                        title="Quitar teléfono"
                        style={{ cursor: 'pointer', display: 'flex' }}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </span>
                    ) : undefined
                  }
                />
              ))}
              {form.telefonos.length < MAX_TELEFONOS && (
                <Typography
                  onClick={agregarTelefono}
                  sx={{ fontSize: '0.75rem', color: '#EC3333', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  + Agregar otro teléfono
                </Typography>
              )}
            </Box>
            <ProfileField label="Fecha de Nacimiento" type="date" value={form.fechaNacimiento} onChange={cambiar('fechaNacimiento')} />
            <ProfileField label="Correo Electrónico" value={form.correo} onChange={cambiar('correo')} placeholder="correo@ejemplo.com" />
          </Box>
        </Box>
      </ProfileSection>

      <ProfileAccountType tipoActivo={esVendedor ? 'vendedor' : 'cliente'} onChange={onCambiarTipo} />

      {esVendedor && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          {/* Si ya tiene empresa queda en "Sí" y bloqueado: la empresa no se puede quitar desde aquí */}
          <ProfileSwitch
            checked={form.conEmpresa}
            disabled={user.tieneEmpresa}
            onChange={(e) => setForm((anterior) => ({ ...anterior, conEmpresa: e.target.checked }))}
            label={form.conEmpresa ? 'Sí' : 'No'}
          />
          <Typography sx={{ color: form.conEmpresa ? '#EC3333' : '#757575', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {form.conEmpresa ? 'Datos de Empresa (Modo Vendedor)' : '¿Tienes empresa? (Modo Vendedor)'}
          </Typography>
        </Box>
      )}

      {esVendedor && form.conEmpresa && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <ProfileField label="RUT de Empresa" value={form.rutEmpresa} onChange={cambiarFiltrado('rutEmpresa', formatRut)} placeholder="76.123.456-7" readOnly={user.tieneEmpresa} />
            <ProfileField label="Nombre" value={form.nombreEmpresa} onChange={cambiar('nombreEmpresa')} placeholder="Nombre de la empresa" />
            <ProfileField label="Giro Comercial" value={form.giroComercial} onChange={cambiar('giroComercial')} placeholder="Giro de la empresa" />
            <ProfileField label="Página Web" value={form.paginaWeb} onChange={cambiar('paginaWeb')} placeholder="https://..." />
            <ProfileField label="Dirección Local" value={form.direccionLocal} placeholder="Sin local registrado" readOnly />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <CustomButton variant="primary" size="small" onClick={() => console.log('Próximamente')}>
              + Agregar otra empresa
            </CustomButton>
          </Box>
        </Box>
      )}

      <ProfileSection title="Dirección y Número">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(6, 1fr)' }, gap: 2 }}>
          <Box sx={{ gridColumn: { md: 'span 2' } }}><ProfileField label="Calle" value={form.calle} onChange={cambiar('calle')} placeholder="Calle" /></Box>
          <Box sx={{ gridColumn: { md: 'span 2' } }}><ProfileField label="Número" value={form.numero} onChange={cambiarNumero} placeholder="Número" inputProps={{ inputMode: 'numeric' }} /></Box>
          <Box sx={{ gridColumn: { md: 'span 2' } }}><ProfileField label="Pasaje" value={form.pasaje} onChange={cambiar('pasaje')} placeholder="Pasaje" /></Box>
          <Box sx={{ gridColumn: { md: 'span 3' } }}><ProfileField label="Descripción" value={form.descripcion} onChange={cambiar('descripcion')} placeholder="Descripción" /></Box>
          <Box sx={{ gridColumn: { md: 'span 3' } }}><ProfileField label="Sector" value={form.sector} onChange={cambiar('sector')} placeholder="Sector" /></Box>
          <Box sx={{ gridColumn: { md: 'span 2' }, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#000' }}>Comuna</Typography>
            <Autocomplete
              options={comunas}
              value={comunaSeleccionada}
              onChange={(_, nueva) => setForm((anterior) => ({ ...anterior, idComuna: nueva?.id ?? '' }))}
              getOptionLabel={(opcion) => opcion.nombre}
              isOptionEqualToValue={(opcion, valor) => opcion.id === valor.id}
              noOptionsText="Sin resultados"
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Selecciona tu comuna"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      '& fieldset': { borderColor: '#333' },
                    },
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ gridColumn: { md: 'span 2' } }}><ProfileField label="Región" value={comunaSeleccionada?.region ?? ''} placeholder="Se completa al elegir la comuna" readOnly /></Box>
          <Box sx={{ gridColumn: { md: 'span 2' } }}><ProfileField label="Provincia" value={comunaSeleccionada?.provincia ?? ''} placeholder="Se completa al elegir la comuna" readOnly /></Box>
        </Box>
      </ProfileSection>

      <ProfileSection title="Acceso">
        <ProfilePassword onChange={(campo, valor) => setForm((anterior) => ({ ...anterior, [campo]: valor }))} />
      </ProfileSection>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <CustomButton variant="secondary" onClick={onCancelar} disabled={guardando}>Cancelar</CustomButton>
        <CustomButton variant="primary" onClick={handleGuardar} disabled={guardando} sx={{ border: '2px solid #EC3333' }}>
          {guardando ? 'Guardando...' : 'Guardar Cambios de Perfil'}
        </CustomButton>
      </Box>
    </Box>
  );
}