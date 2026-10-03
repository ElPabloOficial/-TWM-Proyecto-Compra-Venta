import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Header from "../../organisms/Header/Header";
import Sidebar from "../../organisms/Sidebar/Sidebar";

const AdminTemplate = ({ children }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f4f4" }}>
      <Header />

      {/* Barra lateral: aparece al presionar el botón ☰ */}
      <Drawer
        anchor="left"
        open={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        sx={{ "& .MuiDrawer-paper": { backgroundColor: "#2b2b2b" } }}
      >
        <Sidebar onSelect={() => setMenuAbierto(false)} />
      </Drawer>

      <Box
        component="main"
        sx={{ display: "flex", alignItems: "flex-start", gap: 1, padding: 4 }}
      >
        <IconButton
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
          sx={{ marginTop: "-4px" }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AdminTemplate;