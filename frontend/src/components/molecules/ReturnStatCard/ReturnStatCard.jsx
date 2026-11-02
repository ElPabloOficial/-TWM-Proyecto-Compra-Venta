import { Box } from "@mui/material";

const ReturnStatCard = ({ title, value }) => {
  return (
    <Box
      sx={{
        width: "160px",
        height: "70px",
        border: "1px solid #e5e5e5",
        borderRadius: "6px",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <Box
        component="span"
        sx={{
          display: "block",
          fontSize: "12px",
          color: "#666",
        }}
      >
        {title}
      </Box> 

      <Box
        component="strong"
        sx={{
          display: "block",
          marginTop: "3px",
          fontSize: "22px",
        }}
      >
        {value}
      </Box>
    </Box>
  );
};

export default ReturnStatCard;