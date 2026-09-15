import { Navigate, Outlet } from "react-router-dom";
import {
  isAuthenticated,
} from "../../features/auth/services/auth.service";
import { ROUTES } from "../../constants/routes";

/* =========================================================
   PROTECTED ROUTE
========================================================= */

export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
      />
    );
  }

  return <Outlet />;
}