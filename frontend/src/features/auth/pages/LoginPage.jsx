
import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import authService from "../authService";
import {
  clearAuthError,
  loginFailure,
  loginStart,
  loginSuccess,
} from "../authSlice";

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error: authError } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [validationError, setValidationError] = useState("");
  const error = validationError || authError;

  const handleChange = (event) => {
    dispatch(clearAuthError());
    setValidationError("");
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");

    if (!formData.email.trim() || !formData.password) {
      setValidationError("Please enter your email and password.");
      return;
    }

    dispatch(loginStart());

    try {
      const response = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      });
      const result = response.data;

      if (!result?.token || !result.user) {
        throw new Error("The login response did not include a token and user.");
      }

      dispatch(loginSuccess(result));
      navigate(location.state?.from?.pathname || "/workshops", {
        replace: true,
      });
    } catch (err) {
      dispatch(
        loginFailure(
          err.response?.data?.message || err.message || "Login failed."
        )
      );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
    <Paper className="auth-panel" elevation={0} sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome Back
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Log in to manage your workshop bookings.
        </Typography>

        {location.state?.registered && !error && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Account created. Log in to continue.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, py: 1.3 }}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </Box>

        <Typography sx={{ mt: 3, textAlign: "center" }}>
          Don't have an account?{" "}
          <RouterLink to="/register">Register</RouterLink>
        </Typography>
      </Paper>
    </Container>
  );
}

export default LoginPage;
