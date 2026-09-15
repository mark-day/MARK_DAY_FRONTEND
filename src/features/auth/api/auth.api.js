import axios from "axios";

const BACKEND_URL = (
  import.meta.env.VITE_API_URL ||
  "https://attendance-backend-final-4.onrender.com"
).replace(/\/$/, "");

/* =========================================================
   API URLS
========================================================= */

export const AUTH_API_URLS = {
  LOGIN: `${BACKEND_URL}/api/auth/login`,

  SEND_OTP: `${BACKEND_URL}/api/auth/send-otp`,

  VERIFY_OTP: `${BACKEND_URL}/api/auth/verify-otp`,

  RESET_PASSWORD: `${BACKEND_URL}/api/auth/reset-password`,
};

/* =========================================================
   DEFAULT REQUEST CONFIG
========================================================= */

const requestConfig = {
  timeout: 20000,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

/* =========================================================
   LOGIN
========================================================= */

export const loginRequest = async ({
  empId,
  password,
}) => {
  console.info(
    "[AUTH API] POST",
    AUTH_API_URLS.LOGIN
  );

  try {
    return await axios.post(
      AUTH_API_URLS.LOGIN,
      {
        empId,
        password,
      },
      requestConfig
    );
  } catch (firstError) {
    /* -----------------------------------------------
       Render transient 404 retry
    ----------------------------------------------- */

    if (
      firstError?.response?.status !== 404
    ) {
      throw firstError;
    }

    console.warn(
      "[AUTH API] Login returned 404. Retrying once..."
    );

    await new Promise((resolve) =>
      window.setTimeout(
        resolve,
        700
      )
    );

    return axios.post(
      AUTH_API_URLS.LOGIN,
      {
        empId,
        password,
      },
      requestConfig
    );
  }
};

/* =========================================================
   SEND OTP
========================================================= */

export const sendOtpRequest = async (
  phone
) => {
  return axios.post(
    AUTH_API_URLS.SEND_OTP,
    {
      phone,
    },
    requestConfig
  );
};

/* =========================================================
   VERIFY OTP
========================================================= */

export const verifyOtpRequest = async ({
  phone,
  otp,
}) => {
  return axios.post(
    AUTH_API_URLS.VERIFY_OTP,
    {
      phone,
      otp,
    },
    requestConfig
  );
};

/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPasswordRequest = async ({
  phone,
  newPassword,
}) => {
  return axios.post(
    AUTH_API_URLS.RESET_PASSWORD,
    {
      phone,
      newPassword,
    },
    requestConfig
  );
};