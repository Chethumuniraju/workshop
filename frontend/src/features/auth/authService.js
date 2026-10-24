
import api from "../../services/api";

const register = async (userData) => {
  const response = await api.post("/api/auth/register", userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await api.post("/api/auth/login", credentials);
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};

const authService = {
  register,
  login,
  getCurrentUser,
};

export default authService;
