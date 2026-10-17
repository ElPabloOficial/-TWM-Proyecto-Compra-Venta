import Box from '@mui/material/Box';

export default function Footer({
  children,
  backgroundColor = '#EC3333',
  minHeight = 100,
  sx,
}) {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor,
        minHeight,
        display: 'flex',
        alignItems: 'center',
        padding: '20px 32px',
        marginTop: 'auto',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}


/*
===============================================================
EJEMPLO DE USO
===============================================================

import Footer from './components/organisms/Footer/Footer';

function App() {
  return (
    <>
      <main>
        Contenido de la página
      </main>

      <Footer />
    </>
  );
}

---------------------------------------------------------------
PARA AGREGAR CONTENIDO POSTERIORMENTE
---------------------------------------------------------------

<Footer>

  <p>© 2026 CompraVenta</p>

</Footer>

*/