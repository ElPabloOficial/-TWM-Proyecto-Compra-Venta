import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Header from '../../components/organisms/Header/Header';
import CustomButton from '../../components/atoms/Button/CustomButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

// Datos de prueba para que se vea igual a Figma
const itemsIniciales = [
  { id: 1, nombre: 'Laptop Lenovo 14" - gris', categoria: 'Tecnología', precio: 389990, tipo: 'unidad' },
  { id: 2, nombre: 'Instalación de red interna', categoria: 'TecnoOsono', precio: 0, tipo: 'servicio' },
];

export default function CreateQuoteScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState(itemsIniciales);

  const total = items.reduce((acc, item) => acc + item.precio, 0);

  const eliminarItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const formatoCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Header />

      <Box sx={{ maxWidth: 1000, margin: '0 auto', padding: 4 }}>
        {/* Breadcrumb */}
        <Typography sx={{ fontSize: '0.8rem', color: '#555', mb: 1 }}>
          Mis Cotizaciones <span style={{ margin: '0 8px' }}>›</span>
          <strong style={{ color: '#000' }}>Nueva cotización</strong>
        </Typography>

        {/* Título */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            <span style={{ backgroundColor: '#FFD54F', padding: '0 4px' }}>Solicitar</span> cotización
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#555' }}>
            *Selecciona uno o varios productos/servicios. Valores vigentes por 15 días.
          </Typography>
        </Box>

        {/* Lista de Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 2,
                padding: 2,
                gap: 2,
              }}
            >
              <Box sx={{ width: 80, height: 80, backgroundColor: '#e0e0e0', borderRadius: 1 }} />

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>{item.nombre}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#777' }}>
                  {item.categoria} • {item.tipo === 'unidad' ? `${formatoCLP(item.precio)} c/u` : item.tipo}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #000', borderRadius: 1 }}>
                  <CustomButton variant="text" size="small" sx={{ minWidth: 30, padding: 0 }}><RemoveIcon fontSize="small" /></CustomButton>
                  <Typography sx={{ px: 2, fontWeight: 600 }}>1</Typography>
                  <CustomButton variant="text" size="small" sx={{ minWidth: 30, padding: 0 }}><AddIcon fontSize="small" /></CustomButton>
                </Box>
                <CustomButton variant="text" size="small" onClick={() => eliminarItem(item.id)} sx={{ color: '#000' }}>
                  <DeleteIcon />
                </CustomButton>
              </Box>
            </Box>
          ))}
        </Box>

        <CustomButton variant="primary" fullWidth sx={{ mb: 3, borderRadius: 1, py: 1.5 }}>
          + Agregar otro producto o servicio al catálogo
        </CustomButton>

        <Box sx={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 2, p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>Valor referencial total</Typography>
            <Typography sx={{ fontWeight: 700 }}>{formatoCLP(total)}</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>
            Sujeto a confirmación del emprendedor. Vigencia: 15 días desde la respuesta.
          </Typography>
        </Box>

        <Box sx={{ backgroundColor: '#fff0e5', borderRadius: 2, p: 3, mb: 4 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 600 }}>
            El emprendedor tiene hasta 48 horas para responder. Después de 15 días los valores se ajustan semanalmente y a los 45 días la cotización se elimina automáticamente.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <CustomButton variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </CustomButton>
          <CustomButton variant="primary">
            Enviar solicitud de cotización
          </CustomButton>
        </Box>

      </Box>
    </Box>
  );
}