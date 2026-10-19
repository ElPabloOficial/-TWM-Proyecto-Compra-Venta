import { Box } from "@mui/material";

import ReturnRequest from "../../molecules/ReturnRequest/ReturnRequest";

const ReturnRequestList = ({ requests, onStatusChange }) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "850px",
      }}
    >
      {requests.map((request) => (
        <ReturnRequest
          key={request.id}
          {...request}
          onStatusChange={onStatusChange}
        />
      ))}
    </Box>
  );
};

export default ReturnRequestList;