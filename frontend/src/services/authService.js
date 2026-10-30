
const API_URL = import.meta.env.VITE_API_URL;

export const authService = {

  // Iniciar sesión
  login: async (rut, password) => {

    const rutLimpio = rut
      .replace(/\./g, '')
      .trim();

    const respuesta = await fetch(
      `${API_URL}/usuarios/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rut: rutLimpio,
          clave: password,
        }),
      }
    );

    const data = await respuesta.json();

    // Comprobar respuesta del backend
    if (!respuesta.ok) {
      throw new Error(
        data.message || 'No fue posible iniciar sesión'
      );
    }

    // Obtener información del backend
    const token = data.data.token;
    const usuario = data.data.usuario;

    // Guardar JWT
    localStorage.setItem('authToken', token);

    // Guardar usuario
    localStorage.setItem(
      'usuario',
      JSON.stringify(usuario)
    );

    return usuario;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const usuario = localStorage.getItem('usuario');

    return usuario ? JSON.parse(usuario) : null;
  },

  // Obtener JWT
  getToken: () => {
    return localStorage.getItem('authToken');
  },
};
