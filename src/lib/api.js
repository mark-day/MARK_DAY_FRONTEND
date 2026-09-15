import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error(
    "VITE_API_URL is not configured. Check your .env file."
  );
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token if your backend uses one.
// This does not interfere with your current localStorage auth.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized API request.");
    }

    return Promise.reject(error);
  }
);

export default api;