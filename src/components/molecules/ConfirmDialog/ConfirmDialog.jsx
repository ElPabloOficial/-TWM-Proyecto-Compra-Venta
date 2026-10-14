import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CustomButton from "../../atoms/Button/CustomButton";


const ConfirmDialog = ({
  open,
  titulo = "Confirmar acción",
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}) => {
  return (
    <Dialog open={open} onClose={onCancelar} fullWidth maxWidth="xs">
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <DialogContentText>{mensaje}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: "0 24px 16px" }}>
        <CustomButton variant="secondary" size="small" onClick={onCancelar}>
          {textoCancelar}
        </CustomButton>
        <CustomButton
          variant="primary"
          size="small"
          onClick={onConfirmar}
          sx={{ border: "2px solid #EC3333" }}
        >
          {textoConfirmar}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
