import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { useTextoFecha } from "../../atoms/DateField/fechaUtils";
import SelectorCalendario from "../../atoms/DateField/SelectorCalendario";

// TextField de MUI para fechas: se escribe y se ve como dd/mm/aaaa.
//   value / onChange -> fecha ISO (AAAA-MM-DD); onChange entrega "" mientras no sea válida
//   min / max        -> límites opcionales (AAAA-MM-DD); fuera de rango se marca como no válida
// El resto de las propiedades (label, name, required, fullWidth, error, helperText...) pasan a TextField.
const DateTextField = ({ value, onChange, min, max, error, helperText, ...props }) => {
  const { texto, escribir, elegir, invalida } = useTextoFecha(value, onChange, { min, max });

  return (
    <TextField
      {...props}
      value={texto}
      onChange={escribir}
      placeholder="dd/mm/aaaa"
      error={Boolean(error) || invalida}
      helperText={invalida ? "Ingresa una fecha válida (dd/mm/aaaa)." : helperText}
      autoComplete="off"
      slotProps={{
        inputLabel: { shrink: true },
        htmlInput: { inputMode: "numeric", maxLength: 10 },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <SelectorCalendario value={value} min={min} max={max} onElegir={elegir} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default DateTextField;
