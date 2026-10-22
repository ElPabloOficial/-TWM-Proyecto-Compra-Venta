const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  /**
   * Inicia sesión contra el backend usando Basic Auth.
   * @param {string} rut - RUT con o sin formato (ej: "11.111.111-1" o "11111111-1")
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<object>} Datos del usuario autenticado
   */
  login: async (rut, password) => {
    // 1. Limpiar el RUT: quitar puntos y espacios
    const rutLimpio = rut.replace(/\./g, '').trim();

    // 2. Codificar "rut:clave" en Base64 (Basic Auth)
    const credenciales = btoa(`${rutLimpio}:${password}`);

    // 3. Llamar al backend
    const respuesta = await fetch(`${API_URL}/usuarios/${rutLimpio}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credenciales}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await respuesta.json();

    // 4. Manejar errores del backend
    if (!respuesta.ok) {
      // data.message viene del formato {success, message, data, errors}
      throw new Error(data.message || 'Credenciales incorrectas');
    }

    // 5. Guardar el token y los datos del usuario
    localStorage.setItem('authToken', credenciales);
    localStorage.setItem('usuario', JSON.stringify(data.data));

    // 6. Retornar los datos del usuario
    return data.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
  },

  getUsuarioActual: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },
};