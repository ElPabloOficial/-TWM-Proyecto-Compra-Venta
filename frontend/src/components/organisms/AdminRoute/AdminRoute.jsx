import { Navigate } from "react-router-dom";
import { authService } from "../../../services/authService";

/*
 * AdminRoute
 *
 * Envuelve las pantallas que solo puede ver un administrador:
 *   <Route path="/usuarios" element={<AdminRoute><UsersScreen /></AdminRoute>} />
 *
 * - Sin sesión iniciada -> va a /login
 * - Con sesión pero sin ser administrador -> vuelve a /inicio
 *
 * Ojo: esto solo oculta las pantallas. La seguridad real está en la API
 * ([Authorize(Roles = "Administrador")] en AdminController).
 */
const AdminRoute = ({ children }) => {
  const usuario = authService.getCurrentUser();

  if (!usuario) return <Navigate to="/login" replace />;
  if (!authService.esAdmin()) return <Navigate to="/inicio" replace />;

  return children;
};

export default AdminRoute;
