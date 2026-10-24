
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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
  registerSuccess,
} from "../authSlice";

function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error: authError } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setValidationError("Please complete all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    dispatch(loginStart());

    try {
      const response = await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!response.data) {
        throw new Error("The registration response did not include a user.");
      }

      dispatch(registerSuccess());
      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      dispatch(
        loginFailure(
          err.response?.data?.message || err.message || "Registration failed."
        )
      );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
      <Paper className="auth-panel" elevation={0} sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Create Account
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Register to discover and book workshops.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Full Name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />

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
            autoComplete="new-password"
            slotProps={{ htmlInput: { minLength: 8, maxLength: 128 } }}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
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
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </Box>

        <Typography sx={{ mt: 3, textAlign: "center" }}>
          Already have an account?{" "}
          <RouterLink to="/login">Log in</RouterLink>
        </Typography>
      </Paper>
    </Container>
  );
}

export default RegisterPage;
