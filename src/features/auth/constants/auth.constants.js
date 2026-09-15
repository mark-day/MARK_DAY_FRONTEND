/* =========================================================
   AUTH CONSTANTS
========================================================= */

export const AUTH_STORAGE_KEYS = {
  IS_LOGGED_IN: "isLoggedIn",
  IS_ADMIN_LOGGED_IN: "isAdminLoggedIn",

  TOKEN: "token",

  EMP_ID: "empId",
  EMP_NAME: "empName",
  NAME: "name",

  ROLE: "role",

  USER: "user",

  REMEMBERED_EMP_ID: "rememberedEmpId",
};

/* =========================================================
   APPLICATION ROLES

   These values match the role values expected by the
   authentication system.

   hradmin is also supported because the existing
   AdminLogin implementation uses that value.
========================================================= */

export const ROLES = {
  EMPLOYEE: "employee",
  MANAGER: "manager",
  ADMIN: "admin",
  HR_ADMIN: "hr_admin",
  HRADMIN: "hradmin",
};

/* =========================================================
   ROLE NORMALIZER
========================================================= */

export const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase();
};