
import { Box, Container, Typography } from "@mui/material";

const currentYear = new Date().getFullYear();

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: 7,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "rgba(255,255,255,.72)",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          © {currentYear} Workshop. Learn something new, together.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
