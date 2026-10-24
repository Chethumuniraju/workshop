
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Link as RouterLink,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";

function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            gap: { xs: 1, sm: 2 },
            minHeight: 72,
            flexWrap: "wrap",
            py: 1,
          }}
        >
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              textDecoration: "none",
              mr: "auto",
              flexShrink: 0,
            }}
          >
            <Box className="brand-mark">
              <EventAvailableRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{ lineHeight: 1.15 }}
              >
                Workshop
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Learn together
              </Typography>
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={{ xs: 0.25, sm: 0.75 }}
            sx={{
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button
              component={NavLink}
              to="/workshops"
              className={`nav-link${pathname.startsWith("/workshops") ? " active" : ""}`}
            >
              Workshops
            </Button>

            {isAuthenticated && user?.role === "user" && (
              <Button
                component={NavLink}
                to="/my-bookings"
                className={`nav-link${pathname === "/my-bookings" ? " active" : ""}`}
              >
                My Bookings
              </Button>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <Button
                component={NavLink}
                to="/admin"
                className={`nav-link${pathname.startsWith("/admin") ? " active" : ""}`}
              >
                Admin
              </Button>
            )}

            {!isAuthenticated ? (
              <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, ml: 0.5 }}>
                <Button component={RouterLink} to="/login" className="nav-link">
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="small"
                >
                  Register
                </Button>
              </Box>
            ) : (
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "center", ml: 0.5 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: { xs: "none", md: "block" }, maxWidth: 150 }}
                  noWrap
                >
                  {user?.name}
                </Typography>
                <Button onClick={handleLogout} color="inherit" size="small">
                  Logout
                </Button>
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
