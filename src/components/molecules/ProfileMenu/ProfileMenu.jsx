import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import PersonIcon from "@mui/icons-material/Person";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InventoryIcon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import CustomButton from "../../atoms/Button/CustomButton";

const ProfileMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const abierto = Boolean(anchorEl);

  const abrir = (e) => setAnchorEl(e.currentTarget);
  const cerrar = () => setAnchorEl(null);

  const irA = (ruta) => {
    cerrar();
    navigate(ruta);
  };

  return (
    <>
      <CustomButton
        variant="primary"
        size="small"
        startIcon={<PersonIcon />}
        onClick={abrir}
        aria-haspopup="true"
        aria-expanded={abierto}
      >
        Perfil
      </CustomButton>

      <Menu
        anchorEl={anchorEl}
        open={abierto}
        onClose={cerrar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ "& .MuiPaper-root": { minWidth: 210, marginTop: 0.5 } }}
      >
        <MenuItem onClick={cerrar}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Mi perfil
        </MenuItem>

        <MenuItem onClick={() => irA("/inventario")}>
          <ListItemIcon>
            <InventoryIcon fontSize="small" />
          </ListItemIcon>
          Gestión de inventario
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => irA("/login")}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;