
import { useState } from "react";
import { Box } from "@mui/material";

import CustomButton from "../../atoms/Button/CustomButton";
import CustomInput from "../../atoms/TextField/CustomInput";

export default function ProductReviews({ 
    product,
    reviews,
    type = "product",
}) {
    const isService = type === "service";
    const [question, setQuestion] = useState("");

    const enviarPregunta = () => {
        if (!question.trim()) return;

        console.log("Pregunta enviada:", question);

        setQuestion("");
    };

    return (
        <Box
            sx={{
                backgroundColor: "white",
                p: 2,
                mt: 1,
                borderRadius: 1,
            }}
        >
            {/* Título */}
            <Box
                component="h2"
                sx={{ fontSize: 16, m: 0, mb: 2 }}
            >
                {isService
                    ? "Opiniones de Clientes"
                    : "Opiniones de Compradores"}
            </Box>

            {/* Resumen */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    mb: 2,
                }}
            >
                <Box>
                    <Box
                        sx={{
                            fontSize: 35,
                            fontWeight: "bold",
                        }}
                    >
                        {product.rating}
                    </Box>

                    <Box sx={{ color: "#F5B400" }}>
                        {"★".repeat(Math.round(product.rating))}
                    </Box>

                    <Box sx={{ fontSize: 10, color: "#777" }}>
                        ({product.cantidadResenas} reseñas de clientes)
                    </Box>
                </Box>

                {/* Distribución ilustrativa */}
                <Box sx={{ fontSize: 12, color: "#777" }}>
                    {[5, 4, 3, 2, 1].map((estrella) => (
                        <Box
                            key={estrella}
                            sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                            }}
                        >
                            <Box sx={{ color: "#F5B400" }}>
                                {estrella} ★
                            </Box>

                            <Box
                                sx={{
                                    width: 100,
                                    height: 8,
                                    backgroundColor: "#eee",
                                    borderRadius: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: `${estrella * 20}%`,
                                        height: "100%",
                                        backgroundColor: "#F5B400",
                                        borderRadius: 1,
                                    }}
                                />
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Lista de reseñas */}
            {reviews.map((review) => (
                <Box
                    key={review.id}
                    sx={{
                        border: "1px solid #ddd",
                        p: 1.5,
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                        }}
                    >
                        <Box sx={{ fontWeight: "bold", fontSize: 13 }}>
                            {review.usuario}
                        </Box>

                        <Box sx={{ color: "#F5B400" }}>
                            {"★".repeat(review.rating)}
                        </Box>
                    </Box>

                    <Box sx={{ color: "#777", fontSize: 10, mt: 0.5 }}>
                        {review.fecha}
                    </Box>

                    <Box sx={{ fontSize: 12, mt: 1 }}>
                        {review.comentario}
                    </Box>
                </Box>
            ))}

            {/* Preguntas */}
            <Box sx={{ mt: 3 }}>
                <Box
                    component="h2"
                    sx={{
                        fontSize: 16,
                        m: 0,
                        pb: 1,
                        borderBottom: "1px solid #ddd",
                    }}
                >
                    Preguntas y Respuestas Públicas
                </Box>

                <Box sx={{ fontSize: 12, fontWeight: "bold", mt: 2, mb: 1 }}>
                    {isService
                        ? "Escribe tu pregunta sobre el servicio:"
                        : "Escribe tu pregunta sobre el producto:"}
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "left",
                        gap: 2,
                        flexWrap: "wrap",
                        flexDirection: "column"
                    }}
                >
                    <Box sx={{ width: { xs: "100%", sm: 320 } }}>
                        <CustomInput
                            sx={{width:'500px'}}
                            placeholder="Escribe tu pregunta..."
                            value={question}

                            onChange={(value) =>
                                setQuestion(
                                    typeof value === "string"
                                        ? value
                                        : value.target.value
                                )
                            }
                        />
                    </Box>

                    <CustomButton
                        sx={{width:'200px'}}
                        onClick={enviarPregunta}
                        >
                        Enviar Pregunta
                    </CustomButton>
                </Box>
            </Box>
        </Box>
    );
};