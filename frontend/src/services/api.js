import axios from "axios";

const api = axios.create({
  // "/api" works in dev (vite proxy) and in prod (vercel rewrite)
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 15000,
});

let handleUnauthorized = () => {};

// set from the store, so this file doesn't need to import it
export const setUnauthorizedHandler = (handler) => {
  handleUnauthorized = handler;
};

const isSessionCheck = (config = {}) =>
  config.url?.startsWith("/auth/login") ||
  config.url?.startsWith("/auth/register") ||
  (config.url === "/auth/me" && config.method === "get");

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // a 401 anywhere else means the session expired or was revoked
    if (error.response?.status === 401 && !isSessionCheck(error.config)) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default api;
