
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import LoadingSpinner from "../components/common/LoadingSpinner";

function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth
  );
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
