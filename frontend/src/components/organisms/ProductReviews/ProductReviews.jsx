import { useEffect, useState } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";

import CustomButton from "../../atoms/Button/CustomButton";
import CustomInput from "../../atoms/TextField/CustomInput";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { questionService } from "../../../services/questionService";

export default function ProductReviews({
    product,
    reviews,
    type = "product",
}) {
    const isService = type === "service";

    const [question, setQuestion] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [errorQuestions, setErrorQuestions] = useState("");
    const [successQuestion, setSuccessQuestion] = useState("");
    const [mostrarResenas, setMostrarResenas] = useState(true);
    const [mostrarPreguntas, setMostrarPreguntas] = useState(true);

    const cantidadResenas = reviews.length;

    const promedio =
        cantidadResenas > 0
            ? reviews.reduce(
                (total, review) => total + Number(review.rating || 0),
                0
              ) / cantidadResenas
            : 0;

    // Calcular porcentaje de cada calificación
    const calcularPorcentaje = (estrella) => {
        if (cantidadResenas === 0) return 0;

        const cantidad = reviews.filter(
            (review) => Number(review.rating) === estrella
        ).length;

        return (cantidad / cantidadResenas) * 100;
    };

    // Obtener preguntas del producto o servicio
    const cargarPreguntas = async () => {
        if (!product?.id) return;

        try {
            setLoadingQuestions(true);
            setErrorQuestions("");

            const resultado = isService
                ? await questionService.obtenerPreguntasServicio(product.id)
                : await questionService.obtenerPreguntasProducto(product.id);

            setQuestions(resultado);
        } catch (error) {
            console.error("Error al obtener preguntas:", error);
            setErrorQuestions(error.message);
        } finally {
            setLoadingQuestions(false);
        }
    };

    useEffect(() => {
        cargarPreguntas();
    }, [product?.id, type]);

    // Publicar pregunta
    const enviarPregunta = async () => {
        if (!question.trim()) {
            setErrorQuestions("Debes escribir una pregunta.");
            return;
        }

        try {
            setErrorQuestions("");
            setSuccessQuestion("");

            await questionService.crearPregunta(
                isService ? "servicio" : "producto",
                product.id,
                question.trim()
            );

            setQuestion("");
            setSuccessQuestion("Tu pregunta fue enviada correctamente.");

            await cargarPreguntas();
        } catch (error) {
            console.error("Error al enviar pregunta:", error);
            setErrorQuestions(error.message);
        }
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
                        {promedio.toFixed(1)}
                    </Box>

                    <Box sx={{ color: "#F5B400" }}>
                        {"★".repeat(Math.round(promedio))}
                    </Box>

                    <Box sx={{ fontSize: 10, color: "#777" }}>
                        ({cantidadResenas} reseñas de clientes)
                    </Box>
                </Box>

                {/* Distribución de calificaciones */}
                <Box sx={{ fontSize: 12, color: "#777" }}>
                    {[5, 4, 3, 2, 1].map((estrella) => {
                        const porcentaje = calcularPorcentaje(estrella);

                        return (
                            <Box
                                key={estrella}
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    alignItems: "center",
                                }}
                            >
                                <Box sx={{ color: "#F5B400", minWidth: 30 }}>
                                    {estrella} ★
                                </Box>

                                <Box
                                    sx={{
                                        width: 100,
                                        height: 8,
                                        backgroundColor: "#eee",
                                        borderRadius: 1,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: `${porcentaje}%`,
                                            height: "100%",
                                            backgroundColor: "#F5B400",
                                            borderRadius: 1,
                                            transition: "width 0.3s ease",
                                        }}
                                    />
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* Lista de reseñas */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 1,
                }}
            >
                <CustomButton
                    variant="tertiary"
                    onClick={() => setMostrarResenas(!mostrarResenas)}
                    endIcon={
                        mostrarResenas
                            ? <KeyboardArrowUpIcon />
                            : <KeyboardArrowDownIcon />
                    }
                >
                    {mostrarResenas ? "Ocultar comentarios" : "Mostrar comentarios"}
                </CustomButton>
            </Box>
            
            {mostrarResenas && reviews.map((review) => (
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

            {/* Preguntas y respuestas */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #ddd",
                    pb: 1,
                }}
            >
                <Box
                    component="h2"
                    sx={{ fontSize: 16, m: 0 }}
                >
                    Preguntas y Respuestas Públicas
                </Box>
            
                <CustomButton
                    variant="tertiary"
                    onClick={() => setMostrarPreguntas(!mostrarPreguntas)}
                    endIcon={
                        mostrarPreguntas
                            ? <KeyboardArrowUpIcon />
                            : <KeyboardArrowDownIcon />
                    }
                >
                    {mostrarPreguntas ? "Ocultar" : "Mostrar"}
                </CustomButton>
            </Box>
            <Box sx={{ mt: 3 }}>
                
            {mostrarPreguntas && (
                <Box>
                    {/* Formulario */}
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
                            flexDirection: "column",
                        }}
                    >
                        <Box sx={{ width: { xs: "100%", sm: 320 } }}>
                            <CustomInput
                                sx={{ width: "500px" }}
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
                            sx={{ width: "200px" }}
                            onClick={enviarPregunta}
                        >
                            Enviar Pregunta
                        </CustomButton>
                    </Box>
                </Box>
            )}
                {/* Mensajes */}
                {errorQuestions && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {errorQuestions}
                    </Alert>
                )}

                {successQuestion && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {successQuestion}
                    </Alert>
                )}

                {/* Cargando preguntas */}
                {loadingQuestions && (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                        <CircularProgress size={25} />
                    </Box>
                )}

                {/* Lista de preguntas */}
                {!loadingQuestions && questions.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        {questions.map((item) => (
                            <Box
                                key={item.id}
                                sx={{
                                    border: "1px solid #ddd",
                                    borderRadius: 1,
                                    p: 1.5,
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    sx={{ fontWeight: "bold", fontSize: 13 }}
                                >
                                    {item.usuario}
                                </Typography>

                                <Typography
                                    sx={{ color: "#777", fontSize: 10, mt: 0.5 }}
                                >
                                    {item.fecha
                                        ? new Date(item.fecha).toLocaleDateString("es-CL")
                                        : ""}
                                </Typography>

                                <Typography sx={{ fontSize: 13, mt: 1 }}>
                                    {item.pregunta}
                                </Typography>

                                {/* Respuesta del vendedor */}
                                {item.respuesta && (
                                    <Box
                                        sx={{
                                            backgroundColor: "#f5f5f5",
                                            borderLeft: "3px solid #EC3333",
                                            p: 1.5,
                                            mt: 2,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: 12,
                                            }}
                                        >
                                            Respuesta del vendedor
                                        </Typography>

                                        <Typography sx={{ fontSize: 12, mt: 0.5 }}>
                                            {item.respuesta}
                                        </Typography>

                                        {item.fecha_respuesta && (
                                            <Typography
                                                sx={{
                                                    color: "#777",
                                                    fontSize: 10,
                                                    mt: 0.5,
                                                }}
                                            >
                                                {new Date(item.fecha_respuesta).toLocaleDateString("es-CL")}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                )}

                {!loadingQuestions && questions.length === 0 && !errorQuestions && (
                    <Typography sx={{ color: "#777", fontSize: 12, mt: 2 }}>
                        Todavía no hay preguntas. ¡Sé el primero en preguntar!
                    </Typography>
                )}
            </Box>
        </Box>
    );
}