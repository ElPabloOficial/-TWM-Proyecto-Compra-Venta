// src/services/authService.js
//
// Inicio de sesión contra la API (.NET): POST /usuarios/login (LoginDto) y luego JWT (Bearer).
// Mantiene la misma interfaz que la versión con datos de prueba (login, logout,
// getCurrentUser) y el mismo formato de usuario { id, name, rut, role }, para no
// tener que cambiar el resto de la aplicación.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5097/api';

// "12.345.678-k" -> "12345678-K" (así se guardan los RUT en la base de datos)
export const limpiarRut = (rut) => String(rut).replace(/[.\s]/g, '').toUpperCase();

// Convierte el usuario que entrega la API al formato que ya usa la aplicación.
// El rol dual de la base de datos ("ambos") se trata como "vendedor", porque ese
// usuario ve todo lo del cliente y además el panel de vendedor.
const adaptarUsuario = (u) => ({
    id: u.rut,
    name: u.nombre,
    rut: u.rut,
    role: u.tipousuario === 'ambos' ? 'vendedor' : u.tipousuario,
    tipousuario: u.tipousuario,
    fechanacimiento: u.fechanacimiento,
});

export const authService = {
    async login(rut, password) {
        const rutLimpio = limpiarRut(rut);
        console.log(`[authService] login() "${rutLimpio}"`);

        let respuesta;
        try {
            respuesta = await fetch(`${API_URL}/usuarios/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rut: rutLimpio, clave: password }),
            });
        } catch {
            // fetch solo rechaza ante fallos de red: servidor apagado, URL mal escrita o CORS
            console.warn('[authService] No se pudo contactar a la API en', API_URL);
            throw new Error('No se pudo conectar con el servidor. Revisa que la API esté encendida.');
        }

        const cuerpo = await respuesta.json().catch(() => null);

        // Cuando la clave o el RUT no coinciden, la API responde 401
        if (respuesta.status === 401) {
            console.warn(`[authService] Inicio fallido: RUT o contraseña inválida para "${rutLimpio}"`);
            throw new Error('RUT o contraseña inválida');
        }

        if (!respuesta.ok) {
            console.warn('[authService] La API respondió con error:', respuesta.status, cuerpo);
            throw new Error(cuerpo?.message ?? 'No se pudo iniciar sesión.');
        }

        const token = cuerpo.data.token;

        const user = adaptarUsuario(cuerpo.data.usuario);
        console.log('[authService] Usuario autenticado exitosamente:', user);

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { user, token };
    },

    async logout() {
        console.log('[authService] logout()');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // JWT que entregó la API al iniciar sesión (dura 2 horas)
    getToken() {
        return localStorage.getItem('authToken');
    },

    // Encabezado para las rutas protegidas de la API:
    //   fetch(url, { headers: { ...authService.getAuthHeader() } })
    getAuthHeader() {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    },
};

if (import.meta.env.DEV) {
    window.authService = authService;
    console.log('[Dev Mode] authService is now globally available on window.authService');
}