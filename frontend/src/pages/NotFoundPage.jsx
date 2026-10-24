
import { Button, Container, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
      <Typography variant="h1" fontWeight={800}>
        404
      </Typography>

      <Typography variant="h5" gutterBottom>
        Page not found
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The page you are looking for doesn't exist.
      </Typography>

      <Button component={RouterLink} to="/" variant="contained">
        Back to Home
      </Button>
    </Container>
  );
}

export default NotFoundPage;
