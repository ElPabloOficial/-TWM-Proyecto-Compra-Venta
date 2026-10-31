import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ventaService } from "../../services/ventaService";
import { reviewService } from "../../services/reviewService"

import { useState } from "react";
import { Box, Typography, Alert } from "@mui/material";

import Header from "../../components/organisms/Header/Header";
import Footer from "../../components/organisms/Footer/Footer";
import CustomButton from "../../components/atoms/Button/CustomButton";
import CustomIconButton from "../../components/atoms/IconButton/CustomIconButton";
import CustomDialog from "../../components/atoms/CustomDialog/CustomDialog";

import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

const PurchaseHistory = () => {
  
  const [expandedPurchase, setExpandedPurchase] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!reviewSuccess) return;
    
    const temporizador = setTimeout(() => {
      setReviewSuccess("");
    }, 4000);
  
    return () => clearTimeout(temporizador);
  }, [reviewSuccess]);

  useEffect(() => {
    const cargarCompras = async () => {
      try {
        setLoading(true);
        setError("");

        const respuesta = await ventaService.getMisCompras();
        respuesta.forEach((venta) => {
        console.log("Venta:", venta.id_venta);
        console.log("Total recibido:", venta.total_venta);
        console.log("Productos:", venta.productos);
        
        });

    const comprasFormateadas = respuesta.map((venta) => ({
      id: venta.id_venta,
      date: new Date(venta.fecha).toLocaleDateString("es-CL"),
      status: venta.estado,
      total: venta.total,
      products: (venta.productos ?? []).map((producto) => ({
        id: producto.id,
        name: producto.nombre,
        quantity: producto.cantidad,
        price: producto.total,
        image: producto.imagen,
        type: "producto",
      })),
    
      services: (venta.servicios ?? []).map((servicio) => ({
        id: servicio.id,
        name: servicio.nombre,
        quantity: servicio.cantidad,
        price: servicio.total,
        image: servicio.imagen,
        type: "servicio",
      })),
    }));

        setPurchases(comprasFormateadas);

        if (comprasFormateadas.length > 0) {
          setExpandedPurchase(comprasFormateadas[0].id);
        }
      } catch (error) {
        console.error("Error al cargar las compras:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarCompras();
  }, []);

  const togglePurchase = (id) => {
    setExpandedPurchase((current) => (current === id ? null : id));
  };

  const formatPrice = (price) => {
    const valor = Number(price ?? 0);
    
    return `$ ${valor.toLocaleString("es-CL")}`;
  };

  const handleReturn = (purchaseId, productId, productquantity) => {
    navigate("/devolucion", {
      state: {
        id_venta: purchaseId,
        id_producto: productId,
        cantidad: productquantity,
      },
    });
  };

  const handleReview = (id, tipo) => {
    console.log("Escribir reseña");
    console.log("ID:", id);
    console.log("Tipo:", tipo);

    setReviewItem({
      id,
      tipo,
    });

    setReviewOpen(true);
  };

  const handleCloseReview = () => {
    setReviewOpen(false);
    setReviewItem(null);
    setReviewRating(5);
    setReviewComment("");
  };

  const handleSubmitReview = async () => {
    if (!reviewItem) return;

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Debes seleccionar una calificación.");
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError("");
      setReviewSuccess("");

      const respuesta = await reviewService.crearResenia(
        reviewItem.tipo,
        reviewItem.id,
        reviewRating,
        reviewComment.trim()
      );

      console.log("Reseña creada:", respuesta);

      setReviewSuccess("¡Tu reseña se publicó correctamente!");

      handleCloseReview();

    } catch (error) {
      console.error("Error al publicar reseña:", error);
      setReviewError(error.message);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F8F9FA",
      }}
    >

    <CustomDialog
      open={reviewOpen}
      onClose={handleCloseReview}
      title="Escribir reseña"
      maxWidth="sm"
      fullWidth
      actions={
        <CustomButton
          variant="primary"
          onClick={handleSubmitReview}
          disabled={reviewLoading}
        >
          {reviewLoading ? "Publicando..." : "Publicar reseña"}
        </CustomButton>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography>
          {reviewItem?.tipo === "producto"
            ? "Reseña del producto"
            : "Reseña del servicio"}
        </Typography>
          
        <Typography>
          ID: {reviewItem?.id}
        </Typography>
          
        <Typography sx={{ fontWeight: 600 }}>
          Calificación
        </Typography>
          
        <Box sx={{ display: "flex", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((estrella) => (
            <CustomIconButton
              key={estrella}
              ariaLabel={`Calificar con ${estrella} estrellas`}
              onClick={() => setReviewRating(estrella)}
            >
              <StarBorderOutlinedIcon
                sx={{
                  color:
                    estrella <= reviewRating
                      ? "#F59E0B"
                      : "#94A3B8",
                }}
              />
            </CustomIconButton>
          ))}
        </Box>
        
        <Box
          component="textarea"
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder="Escribe tu comentario..."
          rows={4}
          sx={{
            width: "100%",
            resize: "vertical",
            padding: 1.5,
            border: "1px solid #CBD5E1",
            borderRadius: "6px",
            fontFamily: "inherit",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
      </Box>

      {reviewError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {reviewError}
        </Alert>
      )}

    </CustomDialog>

      <Header />

      <Box
        component="main"
        sx={{
          width: "100%",
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 5 },
          flex: 1,
        }}
      >
        {/* Título */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1F2937",
              mb: 1,
            }}
          >
            Historial de compras
          </Typography>

          <Typography
            sx={{
              color: "#6B7280",
              fontSize: "16px",
            }}
          >
            Revisa tus compras anteriores y gestiona tus pedidos.
          </Typography>
        </Box>
        
        {reviewSuccess && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            {reviewSuccess}
          </Alert>
        )}

        {/* HISTORIAL */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#1F2937",
            mb: 2,
          }}
        >
          Compras anteriores
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {loading ? (
            <Typography sx={{ color: "#64748B", py: 3 }}>
              Cargando historial de compras...
            </Typography>
          ) : error ? (
            <Typography sx={{ color: "error.main", py: 3 }}>
              {error}
            </Typography>
          ) : purchases.length === 0 ? (
            <Typography sx={{ color: "#64748B", py: 3 }}>
              Todavía no tienes compras registradas.
            </Typography>
          ) : (
            purchases.map((purchase) => {
            const isExpanded = expandedPurchase === purchase.id;

            return (
              <Box
                key={purchase.id}
                sx={{
                  backgroundColor: "#FFF",
                  border: "1px solid #D9E2EC",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {/* CABECERA DE COMPRA */}
                <Box
                  onClick={() => togglePurchase(purchase.id)}
                  sx={{
                    px: { xs: 2, md: 3 },
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#F8FAFC",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ShoppingBagOutlinedIcon
                        sx={{
                          color: "#1F2937",
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "17px",
                          color: "#1F2937",
                        }}
                      >
                        Pedido #{purchase.id}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "14px",
                          color: "#6B7280",
                        }}
                      >
                        {purchase.date} &nbsp;•&nbsp; {purchase.status}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#6B7280",
                        }}
                      >
                        Total de la compra
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "17px",
                          color: "#1F2937",
                        }}
                      >
                        {formatPrice(purchase.total)}
                      </Typography>
                    </Box>

                    <CustomIconButton
                      ariaLabel={isExpanded ? "Contraer compra" : "Expandir compra"}
                      onClick={() => togglePurchase(purchase.id)}
                    >
                      {isExpanded ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </CustomIconButton>
                  </Box>
                </Box>

                {/* PRODUCTOS */}
                {isExpanded && (
                  <Box
                    sx={{
                      borderTop: "1px solid #E5E7EB",
                      p: { xs: 2, md: 3 },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#1F2937",
                        mb: 2,
                      }}
                    >
                      Productos de la compra ({purchase.products.length})
                    </Typography>

                    <Box
                      sx={{
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      {purchase.products.map((product, index) => (
                        <Box
                          key={product.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2,
                            borderBottom:
                              index !== purchase.products.length - 1
                                ? "1px solid #E5E7EB"
                                : "none",
                            flexWrap: { xs: "wrap", md: "nowrap" },
                          }}
                        >
                          {/* IMAGEN */}
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              backgroundColor: "#F3F4F6",
                              borderRadius: "8px",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            <Box
                              component="img"
                              src={product.image}
                              alt={product.name}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </Box>

                          {/* INFORMACIÓN */}
                          <Box
                            sx={{
                              flex: 1,
                              minWidth: "200px",
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#64748B",
                                fontSize: "13px",
                                mb: 0.3,
                              }}
                            >
                              ID: {product.id}
                            </Typography>

                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: "#1F2937",
                                fontSize: "16px",
                              }}
                            >
                              {product.name}
                            </Typography>

                            <Typography
                              sx={{
                                color: "#64748B",
                                fontSize: "14px",
                              }}
                            >
                              Cantidad: {product.quantity}
                            </Typography>

                            <Typography
                              sx={{
                                color: "#64748B",
                                fontSize: "14px",
                              }}
                            >
                              Precio: {formatPrice(product.price)}
                            </Typography>
                          </Box>

                          {/* ACCIONES INDIVIDUALES */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1.5,
                              alignItems: "center",
                              flexWrap: "wrap",
                              justifyContent: "flex-end",
                            }}
                          >
                            <CustomButton
                              variant="secondary"
                              startIcon={<StarBorderOutlinedIcon />}
                              onClick={() => handleReview(product.id, "producto")}
                            >
                              Escribir reseña
                            </CustomButton>

                            <CustomButton
                              variant="tertiary"
                              startIcon={<ReplayOutlinedIcon />}
                              onClick={() => handleReturn(purchase.id,product.id,product.quantity)}
                            >
                              Devolver producto
                            </CustomButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {/* SERVICIOS */}
                    {purchase.services.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#1F2937",
                            mb: 2,
                          }}
                        >
                          Servicios de la compra ({purchase.services.length})
                        </Typography>
                        
                        <Box
                          sx={{
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          {purchase.services.map((service, index) => (
                            <Box
                              key={service.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 2,
                                borderBottom:
                                  index !== purchase.services.length - 1
                                    ? "1px solid #E5E7EB"
                                    : "none",
                                flexWrap: { xs: "wrap", md: "nowrap" },
                              }}
                            >
                              {/* IMAGEN */}
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  backgroundColor: "#F3F4F6",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                {service.image && (
                                  <Box
                                    component="img"
                                    src={service.image}
                                    alt={service.name}
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                )}
                              </Box>
                              
                              {/* INFORMACIÓN */}
                              <Box
                                sx={{
                                  flex: 1,
                                  minWidth: "200px",
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: "#64748B",
                                    fontSize: "13px",
                                    mb: 0.3,
                                  }}
                                >
                                  ID: {service.id}
                                </Typography>
                                
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    color: "#1F2937",
                                    fontSize: "16px",
                                  }}
                                >
                                  {service.name}
                                </Typography>
                                
                                <Typography
                                  sx={{
                                    color: "#64748B",
                                    fontSize: "14px",
                                  }}
                                >
                                  Cantidad: {service.quantity}
                                </Typography>
                                
                                <Typography
                                  sx={{
                                    color: "#64748B",
                                    fontSize: "14px",
                                  }}
                                >
                                  Precio: {formatPrice(service.price)}
                                </Typography>
                              </Box>
                                
                              {/* ACCIONES */}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1.5,
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <CustomButton
                                  variant="secondary"
                                  startIcon={<StarBorderOutlinedIcon />}
                                  onClick={() => handleReview(service.id, "servicio")}
                                >
                                  Escribir reseña
                                </CustomButton>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* TOTAL */}
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid #E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <ShoppingBagOutlinedIcon
                          sx={{
                            color: "#475569",
                          }}
                        />

                        <Box>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              color: "#64748B",
                            }}
                          >
                            Total de la compra
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "13px",
                              color: "#64748B",
                            }}
                          >
                            {purchase.products.length + purchase.services.length} artículo
                            {purchase.products.length + purchase.services.length !== 1 ? "s" : ""}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "18px",
                          color: "#1F2937",
                        }}
                      >
                        {formatPrice(purchase.total)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })
        )}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default PurchaseHistory; 