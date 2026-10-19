import { useRef, useState, useEffect } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ImageUpload = ({ value, onChange }) => {
  const inputRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!value) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const procesarArchivo = (archivo) => {
    if (archivo && archivo.type.startsWith("image/")) {
      onChange(archivo);
    }
  };

  return (
    <div
      className={`addp-upload ${arrastrando ? "arrastrando" : ""}`}
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setArrastrando(true);
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastrando(false);
        procesarArchivo(e.dataTransfer.files[0]);
      }}
    >
      {preview ? (
        <img src={preview} alt="Vista previa del producto" />
      ) : (
        <>
          Arrastrar imagen o seleccionar archivo aquí
          <CloudUploadIcon />
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => procesarArchivo(e.target.files[0])}
      />
    </div>
  );
};

export default ImageUpload;