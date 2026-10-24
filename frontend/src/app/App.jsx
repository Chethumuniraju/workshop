
import { useEffect } from "react";
import { Alert } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./hooks";
import authService from "../features/auth/authService";
import {
  logout,
  sessionRestoreFailure,
  setUser,
} from "../features/auth/authSlice";
import AppRoutes from "../routes/AppRoutes";

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const sessionError = useAppSelector((state) => state.auth.sessionError);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    authService
      .getCurrentUser()
      .then((response) => {
        if (!response.data) {
          throw new Error("The profile response did not include a user.");
        }
        if (active) {
          dispatch(setUser(response.data));
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        if (error.response?.status === 401) {
          dispatch(logout());
          return;
        }

        dispatch(
          sessionRestoreFailure(
            "Your saved session could not be verified. Check the backend connection or log in again."
          )
        );
      });

    return () => {
      active = false;
    };
  }, [dispatch, token]);

  return (
    <>
      {sessionError && (
        <Alert severity="warning" role="status">
          {sessionError}
        </Alert>
      )}
      <AppRoutes />
    </>
  );
}

export default App;
