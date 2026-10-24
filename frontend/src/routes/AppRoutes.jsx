
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

import HomePage from "../pages/HomePage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import WorkshopsPage from "../features/workshops/pages/WorkshopsPage";
import MyBookingsPage from "../features/bookings/pages/MyBookingsPage";
import AdminDashboardPage from "../features/workshops/pages/AdminDashboardPage";
import NotFoundPage from "../pages/NotFoundPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute allowAdmin />}>
          <Route path="workshops" element={<WorkshopsPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="my-bookings" element={<MyBookingsPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboardPage />} />
        </Route>

        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
