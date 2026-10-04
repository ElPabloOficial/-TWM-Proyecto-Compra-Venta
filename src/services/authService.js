// src/services/authService.js

// BD Local
import mockUsers from './users.json';

export const authService = {
    async login(rut, password) {
        console.log(`[authService] login() "${rut}"`);
        console.log('[authService] Simulando espera (800ms)...');

        await new Promise((resolve) => setTimeout(resolve, 800));

        console.log('[authService] Autenticando usuario...');
        const foundUser = mockUsers.find(
            (u) => u.rut === rut && u.password === password
        );

        if (!foundUser) {
            console.warn(`[authService] Inicio fallido: RUT o contraseña inválida para "${rut}"`);
            throw new Error('RUT o contraseña inválida');
        }

        console.log('[authService] Usuario autenticado exitosamente:', foundUser);

        const mockResponse = {
            user: { id: foundUser.id, name: foundUser.name, rut: foundUser.rut, role: foundUser.role },
            token: 'mock-jwt-token-xyz123'
        };

        localStorage.setItem('authToken', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        console.log('[authService] Tokens de sesión guardados localmente.');

        return mockResponse;
    },

    async logout() {
        console.log('[authService] logout()');
        await new Promise((resolve) => setTimeout(resolve, 300));

        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        console.log('[authService] Session cerrada.');
    },

    getCurrentUser() {
        console.log('[authService] getCurrentUser()');
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        console.log('[authService] Usuario retornado:', user);
        return user;
    }
};


if (import.meta.env.DEV) {
    window.authService = authService;
    console.log('[Dev Mode] authService is now globally available on window.authService');
}
