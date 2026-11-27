import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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

// "2022-08-19" -> "19 de agosto de 2022" (se lee como UTC para que la zona horaria no cambie el día)
const fechaLarga = (iso) =>
  iso
    ? new Date(`${String(iso).slice(0, 10)}T00:00:00Z`).toLocaleDateString('es-CL', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
      })
    : '';

// Las direcciones del usuario ya no se editan aquí: se administran en "Mis direcciones" (/direcciones).
export default function ProfileConfigCard({ user = {}, guardando = false, onGuardar, onCancelar, onCambiarTipo, onAgregarEmpresa, onEliminarEmpresa }) {
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
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: '',
  });

  const navigate = useNavigate();
  const esVendedor = user.role === 'vendedor';
  const descuentos = user.descuentos ?? [];
  const cantidadDirecciones = user.cantidadDirecciones ?? 0;
  // Empresas adicionales (todas menos la primera, que se edita inline)
  const empresasAdicionales = (user.empresas ?? []).slice(1);

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

  // Aplica un filtro de validaciones.js a lo que se escribe (por ejemplo, solo letras en el nombre)
  const cambiarFiltrado = (campo, filtro) => (e) =>
    setForm((anterior) => ({ ...anterior, [campo]: filtro(e.target.value) }));

  const handleGuardar = () => {
    // console.log('[Perfil] Guardar cambios del perfil:', form);
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
            {user.miembroDesde && <ProfileField label="Miembro desde" value={fechaLarga(user.miembroDesde)} readOnly />}
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
          {/* Empresa principal (editable inline, como antes) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <ProfileField label="RUT de Empresa" value={form.rutEmpresa} onChange={cambiarFiltrado('rutEmpresa', formatRut)} placeholder="76.123.456-7" readOnly={user.tieneEmpresa} />
            <ProfileField label="Nombre" value={form.nombreEmpresa} onChange={cambiar('nombreEmpresa')} placeholder="Nombre de la empresa" />
            <ProfileField label="Giro Comercial" value={form.giroComercial} onChange={cambiar('giroComercial')} placeholder="Giro de la empresa" />
            <ProfileField label="Página Web" value={form.paginaWeb} onChange={cambiar('paginaWeb')} placeholder="https://..." />
            <ProfileField label="Dirección Local" value={form.direccionLocal} placeholder="Sin local registrado" readOnly />
          </Box>

          {/* Empresas adicionales (solo lectura, con opción de eliminar) */}
          {empresasAdicionales.map((emp) => (
            <Box key={emp.rut} sx={{ mt: 3, pt: 2, borderTop: '1px solid #E0E0E0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#EC3333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Empresa Adicional
                </Typography>
                <CustomButton
                  variant="secondary"
                  size="small"
                  onClick={() => onEliminarEmpresa?.(emp.rut)}
                  disabled={guardando}
                  sx={{ color: '#EF4444', borderColor: '#EF4444', fontSize: '0.75rem', minWidth: 0, px: 1.5 }}
                >
                  <DeleteOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> Quitar
                </CustomButton>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <ProfileField label="RUT de Empresa" value={emp.rut} readOnly />
                <ProfileField label="Nombre" value={emp.nombre} readOnly />
                <ProfileField label="Giro Comercial" value={emp.giro || '—'} readOnly />
                <ProfileField label="Página Web" value={emp.paginaWeb || '—'} readOnly />
                <ProfileField label="Dirección Local" value={emp.direccionLocal || 'Sin local registrado'} readOnly />
              </Box>
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <CustomButton variant="primary" size="small" onClick={() => onAgregarEmpresa?.()}>
              + Agregar otra empresa
            </CustomButton>
          </Box>
        </Box>
      )}

      <ProfileSection title="Mis Direcciones">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#333' }}>
            {cantidadDirecciones === 0
              ? 'Aún no tienes direcciones registradas.'
              : `Tienes ${cantidadDirecciones} ${cantidadDirecciones === 1 ? 'dirección registrada' : 'direcciones registradas'}.`}
          </Typography>
          <CustomButton variant="secondary" size="small" onClick={() => navigate('/direcciones')}>
            Administrar direcciones
          </CustomButton>
        </Box>
      </ProfileSection>

      <ProfileSection title="Mis Descuentos">
        {descuentos.length === 0 ? (
          <Typography sx={{ fontSize: '0.85rem', color: '#757575' }}>
            No tienes descuentos activos por ahora.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {descuentos.map((d) => (
              <Box
                key={d.nombre}
                sx={{ border: '1px solid #EC3333', borderRadius: '20px', px: 2, py: 1, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
              >
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#EC3333' }}>
                  {d.nombre} <Typography component="span" sx={{ fontSize: '0.8rem', color: '#555', fontWeight: 400 }}>· {d.descripcion}</Typography>
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>Válido hasta el {fechaLarga(d.vence)}</Typography>
              </Box>
            ))}
          </Box>
        )}
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