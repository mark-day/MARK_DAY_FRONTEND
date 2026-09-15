import { Navigate, Outlet } from "react-router-dom";
import {
  getRole,
  isAuthenticated,
} from "../../features/auth/services/auth.service";
import { ROUTES } from "../../constants/routes";

/* =========================================================
   ROLE ROUTE
========================================================= */

export default function RoleRoute({
  allowedRoles = [],
}) {
  const authenticated =
    isAuthenticated();

  if (!authenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
      />
    );
  }

  const currentRole = getRole();

  const normalizedAllowedRoles =
    allowedRoles.map((role) =>
      String(role)
        .trim()
        .toLowerCase()
    );

  if (
    !normalizedAllowedRoles.includes(
      currentRole
    )
  ) {
    const fallbackRoute =
      currentRole === "hr_admin" ||
      currentRole === "hradmin"
        ? ROUTES.HR_ADMIN
        : currentRole === "admin" ||
          currentRole === "manager"
        ? ROUTES.ADMIN
        : ROUTES.EMPLOYEE_HOME;

    return (
      <Navigate
        to={fallbackRoute}
        replace
      />
    );
  }

  return <Outlet />;
}