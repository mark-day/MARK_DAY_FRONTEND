import {
  AUTH_STORAGE_KEYS,
  normalizeRole,
} from "../constants/auth.constants";

/* =========================================================
   SAFE STORAGE
========================================================= */

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(
        `[AUTH] Failed to read localStorage key "${key}":`,
        error
      );

      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(
        `[AUTH] Failed to save localStorage key "${key}":`,
        error
      );
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(
        `[AUTH] Failed to remove localStorage key "${key}":`,
        error
      );
    }
  },
};

/* =========================================================
   SAVE AUTH SESSION
========================================================= */

export const saveAuthSession = ({
  empId,
  name,
  role,
  token,
}) => {
  const normalizedRole = normalizeRole(role);

  storage.set(
    AUTH_STORAGE_KEYS.IS_LOGGED_IN,
    "true"
  );

  storage.set(
    AUTH_STORAGE_KEYS.EMP_ID,
    empId || ""
  );

  storage.set(
    AUTH_STORAGE_KEYS.EMP_NAME,
    name || ""
  );

  storage.set(
    AUTH_STORAGE_KEYS.NAME,
    name || ""
  );

  storage.set(
    AUTH_STORAGE_KEYS.ROLE,
    normalizedRole
  );

  /* -----------------------------------------------
     Store complete authenticated user object
  ----------------------------------------------- */

  storage.set(
    AUTH_STORAGE_KEYS.USER,
    JSON.stringify({
      empId: empId || "",
      empName: name || "",
      role: normalizedRole,
    })
  );

  /* -----------------------------------------------
     Token

     Never store password.
  ----------------------------------------------- */

  if (token) {
    storage.set(
      AUTH_STORAGE_KEYS.TOKEN,
      token
    );
  } else {
    storage.remove(
      AUTH_STORAGE_KEYS.TOKEN
    );
  }

  /* -----------------------------------------------
     IMPORTANT

     Employee login must not inherit an old admin
     session.
  ----------------------------------------------- */

  storage.remove(
    AUTH_STORAGE_KEYS.IS_ADMIN_LOGGED_IN
  );

  return {
    empId: empId || "",
    name: name || "",
    role: normalizedRole,
    token: token || null,
  };
};

/* =========================================================
   GET AUTH SESSION
========================================================= */

export const getAuthSession = () => {
  const isLoggedIn =
    storage.get(
      AUTH_STORAGE_KEYS.IS_LOGGED_IN
    ) === "true";

  const token =
    storage.get(
      AUTH_STORAGE_KEYS.TOKEN
    );

  const empId =
    storage.get(
      AUTH_STORAGE_KEYS.EMP_ID
    );

  const empName =
    storage.get(
      AUTH_STORAGE_KEYS.EMP_NAME
    );

  const role = normalizeRole(
    storage.get(
      AUTH_STORAGE_KEYS.ROLE
    )
  );

  if (!isLoggedIn) {
    return null;
  }

  return {
    isLoggedIn,
    token,
    empId,
    empName,
    role,
  };
};

/* =========================================================
   GET CURRENT USER
========================================================= */

export const getCurrentUser = () => {
  const rawUser =
    storage.get(
      AUTH_STORAGE_KEYS.USER
    );

  if (!rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser);

    return {
      ...user,
      role: normalizeRole(user?.role),
    };
  } catch (error) {
    console.error(
      "[AUTH] Invalid stored user object:",
      error
    );

    return null;
  }
};

/* =========================================================
   GET TOKEN
========================================================= */

export const getToken = () => {
  return storage.get(
    AUTH_STORAGE_KEYS.TOKEN
  );
};

/* =========================================================
   GET ROLE
========================================================= */

export const getRole = () => {
  return normalizeRole(
    storage.get(
      AUTH_STORAGE_KEYS.ROLE
    )
  );
};

/* =========================================================
   IS AUTHENTICATED
========================================================= */

export const isAuthenticated = () => {
  return (
    storage.get(
      AUTH_STORAGE_KEYS.IS_LOGGED_IN
    ) === "true"
  );
};

/* =========================================================
   LOGOUT
========================================================= */

export const clearAuthSession = () => {
  storage.remove(
    AUTH_STORAGE_KEYS.IS_LOGGED_IN
  );

  storage.remove(
    AUTH_STORAGE_KEYS.IS_ADMIN_LOGGED_IN
  );

  storage.remove(
    AUTH_STORAGE_KEYS.TOKEN
  );

  storage.remove(
    AUTH_STORAGE_KEYS.EMP_ID
  );

  storage.remove(
    AUTH_STORAGE_KEYS.EMP_NAME
  );

  storage.remove(
    AUTH_STORAGE_KEYS.NAME
  );

  storage.remove(
    AUTH_STORAGE_KEYS.ROLE
  );

  storage.remove(
    AUTH_STORAGE_KEYS.USER
  );
};

/* =========================================================
   REMEMBERED EMPLOYEE ID
========================================================= */

export const saveRememberedEmpId = (
  empId
) => {
  storage.set(
    AUTH_STORAGE_KEYS.REMEMBERED_EMP_ID,
    empId
  );
};

export const getRememberedEmpId = () => {
  return storage.get(
    AUTH_STORAGE_KEYS.REMEMBERED_EMP_ID
  );
};

export const clearRememberedEmpId = () => {
  storage.remove(
    AUTH_STORAGE_KEYS.REMEMBERED_EMP_ID
  );
};