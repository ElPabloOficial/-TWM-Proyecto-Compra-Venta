import Box from "@mui/material/Box";

const StatCard = ({ titulo, valor }) => {
  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        borderRadius: 1,
        padding: 2,
        minWidth: 180,
        backgroundColor: "#fff",
      }}
    >
      <Box sx={{ fontSize: 13 }}>{titulo}</Box>
      <Box sx={{ fontSize: 24, fontWeight: 700, marginTop: 1 }}>{valor}</Box>
    </Box>
  );
};

export default StatCard;