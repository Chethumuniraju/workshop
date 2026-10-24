
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SearchIcon from "@mui/icons-material/Search";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { useAppSelector } from "../app/hooks";

function HomePage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const features = [
    {
      icon: <SearchIcon fontSize="large" />,
      title: "Discover Workshops",
      description: "Explore upcoming workshops and find topics that interest you.",
      to: "/workshops",
    },
    {
      icon: <EventAvailableIcon fontSize="large" />,
      title: isAdmin ? "Manage Workshops" : "Book Your Seat",
      description: isAdmin
        ? "Create, update, and manage the upcoming workshop schedule."
        : "Reserve your seat in a workshop with a simple booking process.",
      to: isAdmin ? "/admin" : "/workshops",
    },
    {
      icon: <ConfirmationNumberIcon fontSize="large" />,
      title: isAdmin ? "Explore Listings" : "Manage Bookings",
      description: isAdmin
        ? "Review the workshops currently available to participants."
        : "View your reservations and cancel bookings when needed.",
      to: isAdmin ? "/workshops" : "/my-bookings",
    },
  ];

  return (
    <Box sx={{ minHeight: "100%", py: { xs: 4, md: 7 } }}>
      <Container maxWidth="lg">
        <Paper
          className="hero-banner"
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6, md: 9 },
            borderRadius: { xs: 4, md: 6 },
            background:
              "radial-gradient(circle at 86% 17%, rgba(233, 164, 91, 0.22), transparent 15rem), linear-gradient(120deg, #e8f3ee 0%, #f6f8f4 60%, #fbf3e8 100%)",
          }}
        >
          <Box sx={{ maxWidth: 720, position: "relative" }}>
            <Typography className="eyebrow" sx={{ mb: 2 }}>
              Find your next favorite skill
            </Typography>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: "2.7rem", sm: "3.5rem", md: "4.25rem" },
                lineHeight: 1.08,
              }}
            >
              Make room for
              <Box component="span" sx={{ display: "block", color: "primary.main" }}>
                something new.
              </Box>
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 560, mb: 4, fontWeight: 400, lineHeight: 1.7 }}
            >
              Discover hands-on workshops, meet curious people, and reserve a seat
              for your next learning experience.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                component={RouterLink}
                to="/workshops"
                variant="contained"
                size="large"
                endIcon={<EventAvailableIcon />}
              >
                Browse workshops
              </Button>

              {!isAuthenticated ? (
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "rgba(20,107,91,.3)",
                    bgcolor: "rgba(255,255,255,.5)",
                  }}
                >
                  Create an account
                </Button>
              ) : (
                <Button
                  component={RouterLink}
                  to={isAdmin ? "/admin" : "/my-bookings"}
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "rgba(20,107,91,.3)",
                    bgcolor: "rgba(255,255,255,.5)",
                  }}
                >
                  {isAdmin ? "Manage workshops" : "My bookings"}
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>

        <Box sx={{ mt: { xs: 6, md: 8 }, mb: 3 }}>
          <Typography className="eyebrow" sx={{ mb: 1 }}>
            Your next chapter starts here
          </Typography>
          <Typography variant="h4" component="h2">
            A better way to learn by doing
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {features.map((feature) => (
            <Grid size={{ xs: 12, md: 4 }} key={feature.title}>
              <Paper
                className="feature-card"
                component={RouterLink}
                to={feature.to}
                elevation={0}
              >
                <Box className="feature-icon">{feature.icon}</Box>

                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>

                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;
