// AdminUserDetailScreen.jsx
//
// Ficha completa de un usuario para el administrador (se abre con el ojo de Gestión de Usuarios):
// su cuenta, si ha comprado o vendido, qué tiene en proceso
// y sus compras y ventas más recientes. Datos reales de la API (GET /admin/usuarios/{rut}).
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import AdminTemplate from "../../components/templates/SellerTemplate/SellerTemplate";
import ErrorState from "../../components/molecules/ErrorState/ErrorState";
import { obtenerUsuarioDetalle } from "../../services/adminService";

import "../../styles/Transaction.css"; // colores de los estados (status-badge)
import "../../styles/AdminUserDetail.css";

const pesos = (n) => `$${Number(n).toLocaleString("es-CL")}`;

const fecha = (iso) => (iso ? new Date(iso).toLocaleDateString("es-CL") : "-");

const ROLES = { cliente: "Cliente", vendedor: "Vendedor", ambos: "Cliente y vendedor", administrador: "Administrador", admin: "Administrador" };
const CLASE_ESTADO = { completada: "completed", anulada: "cancelled", pendiente: "pending" };

// Migas de pan: "Gestión de Usuarios › Nombre" (la primera parte vuelve a la lista)
const Migas = ({ actual, onVolver }) => (
  <nav className="ud-migas" aria-label="Ruta de navegación">
    <button type="button" className="ud-miga-link" onClick={onVolver}>
      Gestión de Usuarios
    </button>
    <span className="ud-miga-sep">›</span>
    <strong>{actual}</strong>
  </nav>
);

const Tile = ({ titulo, valor, destacada = false }) => (
  <div className={`ud-tile ${destacada ? "destacada" : ""}`}>
    <span className="ud-tile-valor">{valor}</span>
    <span className="ud-tile-titulo">{titulo}</span>
  </div>
);

// Tabla de las compras (contraparte = vendedor) o ventas (contraparte = cliente) más recientes
const TablaVentas = ({ filas, columnaContraparte }) =>
  filas.length === 0 ? (
    <div className="ud-vacio">Sin movimientos todavía.</div>
  ) : (
    <div className="ud-scroll">
      <table className="ud-tabla">
        <thead>
          <tr>
            <th>N°</th>
            <th>Fecha</th>
            <th>{columnaContraparte}</th>
            <th className="num">Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((v) => (
            <tr key={v.id}>
              <td>{v.codigo}</td>
              <td>{fecha(v.fecha)}</td>
              <td>{v.contraparte}</td>
              <td className="num">{pesos(v.total)}</td>
              <td>
                <span className={`status-badge ${CLASE_ESTADO[v.tipoEstado]}`}>{v.estado}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

const AdminUserDetailScreen = () => {
  const { rut } = useParams();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Sube al pedir "Reintentar" para volver a ejecutar la carga
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true; // evita actualizar el estado si la pantalla se cerró antes de que llegue la respuesta

    const cargar = async () => {
      try {
        const datos = await obtenerUsuarioDetalle(rut);
        if (activo) setUsuario(datos);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [rut, intento]);

  const reintentar = () => {
    setCargando(true);
    setError("");
    setIntento((n) => n + 1);
  };

  const volver = () => navigate("/usuarios");

  if (cargando || error || !usuario) {
    return (
      <AdminTemplate sinMenu>
        <Migas actual="Usuario" onVolver={volver} />
        <Box sx={{ marginTop: 2 }}>
          {error ? (
            <ErrorState titulo="No pudimos cargar al usuario" detalle={error} onReintentar={reintentar} />
          ) : (
            <Box sx={{ padding: 3, textAlign: "center", color: "#666", fontSize: 13 }}>Cargando usuario...</Box>
          )}
        </Box>
      </AdminTemplate>
    );
  }

  const { compras, ventas, actividad, publicaciones } = usuario;
  const tipo = String(usuario.tipo ?? "").toLowerCase();
  const esVendedor = tipo === "vendedor" || tipo === "ambos";
  // Se muestra la parte de vendedor si tiene el rol o ya publicó o vendió algo
  const mostrarVendedor = esVendedor || ventas.cantidad > 0 || publicaciones.productos + publicaciones.servicios > 0;

  return (
    <AdminTemplate sinMenu>
      <Migas actual={usuario.nombre} onVolver={volver} />

      <div className="ud-cabecera">
        <h1>{usuario.nombre}</h1>
        <div className="ud-sub">
          <span>{usuario.rut}</span>
          <span className="ud-chip">{ROLES[tipo] ?? usuario.tipo}</span>
          <span>Miembro desde {fecha(usuario.registro)}</span>
        </div>
      </div>

      {/* ---------- Respuestas rápidas ---------- */}
      <div className="ud-resumen">
        <div className={`ud-resumen-item ${compras.cantidad > 0 ? "si" : ""}`}>
          <span className="ud-resumen-titulo">¿Ha comprado?</span>
          <span className="ud-resumen-valor">
            {compras.cantidad > 0 ? `Sí (${compras.cantidad} ${compras.cantidad === 1 ? "compra" : "compras"})` : "No"}
          </span>
        </div>
        <div className={`ud-resumen-item ${ventas.cantidad > 0 ? "si" : ""}`}>
          <span className="ud-resumen-titulo">¿Ha vendido?</span>
          <span className="ud-resumen-valor">
            {ventas.cantidad > 0 ? `Sí (${ventas.cantidad} ${ventas.cantidad === 1 ? "venta" : "ventas"})` : "No"}
          </span>
        </div>
        <div className={`ud-resumen-item ${compras.enProceso > 0 ? "alerta" : ""}`}>
          <span className="ud-resumen-titulo">¿Tiene compras en proceso?</span>
          <span className="ud-resumen-valor">{compras.enProceso > 0 ? `Sí (${compras.enProceso})` : "No"}</span>
        </div>
        {mostrarVendedor && (
          <div className={`ud-resumen-item ${ventas.porDespachar > 0 ? "alerta" : ""}`}>
            <span className="ud-resumen-titulo">¿Tiene pedidos por despachar?</span>
            <span className="ud-resumen-valor">{ventas.porDespachar > 0 ? `Sí (${ventas.porDespachar})` : "No"}</span>
          </div>
        )}
      </div>

      {/* ---------- Cuenta, contacto y direcciones ---------- */}
      <div className="ud-grid">
        <div className="ud-card">
          <h2>Cuenta</h2>
          <dl className="ud-datos">
            <dt>Ha iniciado sesión</dt>
            <dd>{usuario.sesionIniciada ? "Sí" : "Nunca"}</dd>
            <dt>Fecha de nacimiento</dt>
            <dd>
              {fecha(usuario.fechaNacimiento)}
              {usuario.edad !== null && ` (${usuario.edad} años)`}
            </dd>
            <dt>Registrado el</dt>
            <dd>{fecha(usuario.registro)}</dd>
          </dl>
        </div>

        <div className="ud-card">
          <h2>Contacto</h2>
          <dl className="ud-datos">
            <dt>Correos</dt>
            <dd>{usuario.correos.length > 0 ? usuario.correos.join(", ") : "Sin correo"}</dd>
            <dt>Teléfonos</dt>
            <dd>{usuario.telefonos.length > 0 ? usuario.telefonos.join(", ") : "Sin teléfono"}</dd>
          </dl>
        </div>

        <div className="ud-card">
          <h2>Direcciones</h2>
          {usuario.direcciones.length === 0 ? (
            <div className="ud-vacio">Sin direcciones guardadas.</div>
          ) : (
            <ol className="ud-lista">
              {usuario.direcciones.map((d) => (
                <li key={d.id}>
                  {d.texto}
                  <small>{d.lugar}</small>
                </li>
              ))}
            </ol>
          )}
        </div>

        {usuario.empresas.length > 0 && (
          <div className="ud-card">
            <h2>Empresa</h2>
            {usuario.empresas.map((e) => (
              <dl className="ud-datos" key={e.rut}>
                <dt>Nombre</dt>
                <dd>{e.nombre}</dd>
                <dt>RUT</dt>
                <dd>{e.rut}</dd>
                <dt>Giro</dt>
                <dd>{e.giro || "-"}</dd>
                <dt>Página web</dt>
                <dd>{e.paginaWeb || "-"}</dd>
              </dl>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Como comprador ---------- */}
      <div className="ud-card">
        <h2>Como comprador</h2>
        <div className="ud-tiles">
          <Tile titulo="Compras" valor={compras.cantidad} />
          <Tile titulo="Monto comprado" valor={pesos(compras.monto)} />
          <Tile titulo="Compras en proceso" valor={compras.enProceso} destacada={compras.enProceso > 0} />
          <Tile titulo="Última compra" valor={fecha(compras.ultima)} />
          <Tile titulo="Cotizaciones" valor={actividad.cotizaciones} />
          <Tile titulo="Devoluciones" valor={actividad.devoluciones} />
          <Tile titulo="Reseñas escritas" valor={actividad.resenias} />
          <Tile titulo="Preguntas hechas" valor={actividad.preguntas} />
          <Tile titulo="En favoritos" valor={actividad.favoritos} />
        </div>
        <div className="ud-subtitulo">Compras más recientes</div>
        <TablaVentas filas={compras.recientes} columnaContraparte="Vendedor" />
      </div>

      {/* ---------- Como vendedor ---------- */}
      {mostrarVendedor && (
        <div className="ud-card">
          <h2>Como vendedor</h2>
          <div className="ud-tiles">
            <Tile titulo="Productos publicados" valor={publicaciones.productos} />
            <Tile titulo="Servicios publicados" valor={publicaciones.servicios} />
            <Tile titulo="Ventas" valor={ventas.cantidad} />
            <Tile titulo="Monto vendido" valor={pesos(ventas.monto)} />
            <Tile titulo="Ventas en proceso" valor={ventas.enProceso} destacada={ventas.enProceso > 0} />
            <Tile titulo="Por despachar" valor={ventas.porDespachar} destacada={ventas.porDespachar > 0} />
            <Tile titulo="Última venta" valor={fecha(ventas.ultima)} />
          </div>
          <div className="ud-subtitulo">Ventas más recientes</div>
          <TablaVentas filas={ventas.recientes} columnaContraparte="Cliente" />
        </div>
      )}
    </AdminTemplate>
  );
};

export default AdminUserDetailScreen;
