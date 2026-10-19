import { useState } from 'react';
import AdminSidebar from '../../components/organisms/AdminSidebar/AdminSidebar';
import Box from '@mui/material/Box';

const AdminScreen = () => {
  const [seccionActiva, setSeccionActiva] = useState('dashboard');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* El menú de la izquierda */}
      <AdminSidebar 
        activo={seccionActiva} 
        onSelect={(id) => setSeccionActiva(id)} 
      />

      {/* El contenido de la derecha (vacío por ahora) */}
      <Box sx={{ flex: 1, backgroundColor: '#f4f4f4' }}>
        {/* Aquí irá el contenido de cada sección en el futuro */}
      </Box>
    </Box>
  );
};

export default AdminScreen;