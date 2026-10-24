
import { Box, CircularProgress, Typography } from "@mui/material";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Box
      sx={{
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}

export default LoadingSpinner;
