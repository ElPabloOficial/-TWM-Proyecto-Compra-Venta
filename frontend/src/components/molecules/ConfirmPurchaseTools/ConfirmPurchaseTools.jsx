import { Link } from "react-router-dom";
import Box from "@mui/material/Box";

const ROJO = "#EC3333";
const ROJO_SUAVE = "#FDE7E7";
const tarjeta = { border: "1px solid #E0E0E0", borderRadius: 2, padding: 2, backgroundColor: "#fff" };

const formatearPrecio = (numero) => `$${Number(numero).toLocaleString("es-CL")}`;

// Dónde se entrega el pedido y con qué empresa de despacho. Los servicios no necesitan dirección.
//   requiereDespacho -> si el carrito tiene al menos un producto
//   direcciones      -> [{ id, texto, detalle }] las direcciones del usuario
//   opciones         -> [{ id, nombre, costo, dias }] empresas que pueden llevar el pedido (la API ya las filtra)
const ConfirmPurchaseTools = ({
  requiereDespacho,
  direcciones,
  direccionId,
  onElegirDireccion,
  cargando,
  opciones = [],
  empresaId = "",
  onElegirEmpresa = () => {},
  cargandoOpciones = false,
  errorOpciones = "",
}) => {
  if (!requiereDespacho) {
    return (
      <Box sx={tarjeta}>
        <Box sx={{ fontSize: 13 }}>Sin despacho</Box>
        <Box sx={{ fontSize: 12, color: "#666", marginTop: 1 }}>
          Tu compra solo tiene servicios, así que no necesitas una dirección de entrega.
        </Box>
      </Box>
    );
  }

  return (
    <>
    <Box sx={tarjeta}>
      <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <Box component="span">Enviar a</Box>
        <Box component={Link} to="/direcciones" sx={{ color: ROJO, textDecoration: "none" }}>
          Administrar direcciones
        </Box>
      </Box>

      {cargando ? (
        <Box sx={{ fontSize: 12, color: "#666", marginTop: 1 }}>Cargando tus direcciones...</Box>
      ) : direcciones.length === 0 ? (
        <Box sx={{ fontSize: 12, color: ROJO, marginTop: 1 }}>
          No tienes direcciones guardadas. Agrega una en “Administrar direcciones” para poder recibir tu pedido.
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 1.5 }}>
          {direcciones.map((d) => {
            const activa = String(d.id) === String(direccionId);
            return (
              <Box
                key={d.id}
                component="button"
                type="button"
                aria-pressed={activa}
                onClick={() => onElegirDireccion(String(d.id))}
                sx={{
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: 1.5,
                  borderRadius: 1,
                  border: `1px solid ${activa ? ROJO : "#E0E0E0"}`,
                  backgroundColor: activa ? ROJO_SUAVE : "#fff",
                }}
              >
                <Box sx={{ fontSize: 14 }}>{d.texto}</Box>
                {d.detalle && <Box sx={{ fontSize: 12, color: "#666" }}>{d.detalle}</Box>}
              </Box>
            );
          })}
        </Box>
      )}

    </Box>

    <Box sx={tarjeta}>
      <Box sx={{ fontSize: 13 }}>Empresa de despacho</Box>

      {cargandoOpciones ? (
        <Box sx={{ fontSize: 12, color: "#666", marginTop: 1 }}>Buscando empresas que puedan llevar tu pedido...</Box>
      ) : errorOpciones ? (
        <Box role="alert" sx={{ fontSize: 12, color: ROJO, marginTop: 1 }}>{errorOpciones}</Box>
      ) : opciones.length === 0 ? (
        <Box role="alert" sx={{ fontSize: 12, color: ROJO, marginTop: 1 }}>
          Ninguna empresa de despacho puede transportar este pedido por su peso o tamaño. Prueba con menos unidades o
          compra los productos por separado.
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 1.5 }}>
          {opciones.map((o) => {
            const activa = String(o.id) === String(empresaId);
            return (
              <Box
                key={o.id}
                component="button"
                type="button"
                aria-pressed={activa}
                onClick={() => onElegirEmpresa(String(o.id))}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: 1.5,
                  borderRadius: 1,
                  border: `1px solid ${activa ? ROJO : "#E0E0E0"}`,
                  backgroundColor: activa ? ROJO_SUAVE : "#fff",
                }}
              >
                <Box>
                  <Box sx={{ fontSize: 14 }}>{o.nombre}</Box>
                  {o.dias != null && (
                    <Box sx={{ fontSize: 12, color: "#666" }}>
                      Llega en {o.dias} {o.dias === 1 ? "día" : "días"} aprox.
                    </Box>
                  )}
                </Box>
                <Box sx={{ fontSize: 14, fontWeight: 700 }}>{formatearPrecio(o.costo)}</Box>
              </Box>
            );
          })}
        </Box>
      )}

      <Box sx={{ fontSize: 11, color: "#888", marginTop: 1.5 }}>
        El precio del envío depende del peso y el tamaño de tu pedido y de la empresa que elijas. Se paga junto con la compra.
      </Box>
    </Box>
    </>
  );
};

export default ConfirmPurchaseTools;
