// src/constants/routes.js

const ROLE_ROUTES = {
  employee: "/dashboard/userhome",

  // Normal admin
  admin: "/admin",

  // HR admin from your backend
  hr_admin: "/hradmin",

  // Keep manager support if your backend uses it
  manager: "/hradmin",
};

export const getRouteByRole = (role) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  return ROLE_ROUTES[normalizedRole] || "/login";
};

export default ROLE_ROUTES;