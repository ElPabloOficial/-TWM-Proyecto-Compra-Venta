import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomAvatar from '../../atoms/Avatar/CustomAvatar';
import CustomButton from '../../atoms/Button/CustomButton';
import ProfileSection from '../../molecules/ProfileSection/ProfileSection';
import ProfileField from '../../molecules/ProfileField/ProfileField';
import ProfileAccountType from '../../molecules/ProfileAccountType/ProfileAccountType';
import ProfilePassword from '../../molecules/ProfilePassword/ProfilePassword';
import ProfileSwitch from '../../molecules/ProfileSwitch/ProfileSwitch';

/*
 * ProfileConfigCard
 *
 * Organismo que contiene toda la tarjeta de configuración
 * del perfil. Agrupa todas las secciones (Datos Personales,
 * Empresa, Dirección, Acceso) y los botones finales.
 */
export default function ProfileConfigCard({
  user = {},
  onGuardar,
  onCancelar,
}) {
  const [restriccionEdad, setRestriccionEdad] = useState(false);

  const [form, setForm] = useState({
    nombre: user.name || '',
    rut: user.rut || '',
    telefono: '',
    fechaNacimiento: '',
    correo: '',
    rutEmpresa: '',
    nombreEmpresa: '',
    giroComercial: '',
    paginaWeb: '',
    direccionLocal: '',
    calle: '',
    numero: '',
    pasaje: '',
    descripcion: '',
    sector: '',
    comuna: '',
    region: '',
    provincia: '',
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: '',
  });

  const esVendedor = user.role === 'vendedor';

  const cambiar = (campo) => (e) =>
    setForm({ ...form, [campo]: e.target.value });

  const handleGuardar = () => {
    console.log('[Profile] Guardar:', form);
    onGuardar?.(form);
  };

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        padding: 3,
        borderRadius: 2,
      }}
    >
      {/* DATOS PERSONALES */}
      <ProfileSection title="Datos Personales">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '120px 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          {/* Columna izquierda: Avatar + "Cambiar foto" */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CustomAvatar alt={form.nombre || 'Usuario'} size={90} />
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#EC3333',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Cambiar foto
            </Typography>
          </Box>

          {/* Columna derecha: los campos */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <ProfileField
              label="Nombre Completo"
              value={form.nombre}
              onChange={cambiar('nombre')}
              placeholder="Ingresa tu nombre"
            />
            <ProfileField
              label="RUT"
              value={form.rut}
              onChange={cambiar('rut')}
              placeholder="12345678-9"
            />
            <ProfileField
              label="Teléfono de Contacto"
              value={form.telefono}
              onChange={cambiar('telefono')}
              placeholder="+56 9 1234 5678"
            />
            <ProfileField
              label="Fecha de Nacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={cambiar('fechaNacimiento')}
            />
            <ProfileField
              label="Correo Electrónico"
              value={form.correo}
              onChange={cambiar('correo')}
              placeholder="correo@ejemplo.com"
            />
          </Box>
        </Box>
      </ProfileSection>

      {/* TIPO DE CUENTA */}
      <ProfileAccountType
        tipo={esVendedor ? 'Vendedor Comercial' : 'Cliente Comprador'}
        rolActivo="Vendedor Comercial (Activo)"
        esVendedor={esVendedor}
      />

      {/* SWITCH */}
      <ProfileSwitch
        checked={restriccionEdad}
        onChange={(e) => setRestriccionEdad(e.target.checked)}
        label="Sí"
        description="Requiere restricción de edad"
      />

      {/* DATOS DE EMPRESA (solo vendedor) */}
      {esVendedor && (
        <ProfileSection title="Datos de Empresa (Modo Vendedor)">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <ProfileField
              label="RUT de Empresa"
              value={form.rutEmpresa}
              onChange={cambiar('rutEmpresa')}
              placeholder="76.123.456-7"
            />
            <ProfileField
              label="Nombre"
              value={form.nombreEmpresa}
              onChange={cambiar('nombreEmpresa')}
              placeholder="Nombre de la empresa"
            />
            <ProfileField
              label="Giro Comercial"
              value={form.giroComercial}
              onChange={cambiar('giroComercial')}
              placeholder="Giro de la empresa"
            />
            <ProfileField
              label="Página Web"
              value={form.paginaWeb}
              onChange={cambiar('paginaWeb')}
              placeholder="https://..."
            />
            <ProfileField
              label="Dirección Local"
              value={form.direccionLocal}
              onChange={cambiar('direccionLocal')}
              placeholder="Dirección"
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <CustomButton
              variant="primary"
              size="small"
              onClick={() => console.log('Próximamente: agregar otra empresa')}
            >
              + Agregar otra empresa
            </CustomButton>
          </Box>
        </ProfileSection>
      )}

      {/* DIRECCIÓN Y NÚMERO */}
      <ProfileSection title="Dirección y Número">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(6, 1fr)' },
            gap: 2,
          }}
        >
          <Box sx={{ gridColumn: { md: 'span 2' } }}>
            <ProfileField label="Calle" value={form.calle} onChange={cambiar('calle')} placeholder="Calle" />
          </Box>
          <Box sx={{ gridColumn: { md: 'span 2' } }}>
            <ProfileField label="Número" value={form.numero} onChange={cambiar('numero')} placeholder="Número" />
          </Box>
          <Box sx={{ gridColumn: { md: 'span 2' } }}>
            <ProfileField label="Pasaje" value={form.pasaje} onChange={cambiar('pasaje')} placeholder="Pasaje" />
          </Box>

          <Box sx={{ gridColumn: { md: 'span 3' } }}>
            <ProfileField label="Descripción" value={form.descripcion} onChange={cambiar('descripcion')} placeholder="Descripción" />
          </Box>
          <Box sx={{ gridColumn: { md: 'span 3' } }}>
            <ProfileField label="Sector" value={form.sector} onChange={cambiar('sector')} placeholder="Sector" />
          </Box>

          <Box sx={{ gridColumn: { md: 'span 2' } }}>
            <ProfileField label="Comuna" value={form.comuna} onChange={cambiar('comuna')} placeholder="Comuna" />
          </Box>
          <Box sx={{ gridColumn: { md: 'span 2' } }}>
            <ProfileField label="Región" value={form.region} onChange={cambiar('region')} placeholder="Región" />
          </Box>
          <Box sx={{ gridColumn: { md: 'span 2' } }}>
            <ProfileField label="Provincia" value={form.provincia} onChange={cambiar('provincia')} placeholder="Provincia" />
          </Box>
        </Box>
      </ProfileSection>

      {/* ACCESO */}
      <ProfileSection title="Acceso">
        <ProfilePassword
          onChange={(campo, valor) => setForm({ ...form, [campo]: valor })}
        />
      </ProfileSection>

      {/* BOTONES FINALES */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3,
        }}
      >
        <CustomButton variant="secondary" onClick={onCancelar}>
          Cancelar
        </CustomButton>
        <CustomButton
          variant="primary"
          onClick={handleGuardar}
          sx={{ border: '2px solid #EC3333' }}
        >
          Guardar Cambios de Perfil
        </CustomButton>
      </Box>
    </Box>
  );
}