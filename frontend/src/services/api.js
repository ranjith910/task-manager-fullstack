import axios from "axios";

const api = axios.create({
  // "/api" works in dev (vite proxy) and in prod (vercel rewrite)
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  // the free API server sleeps when idle and can take up to a minute to wake up
  timeout: 70000,
});

let handleUnauthorized = () => {};
let handleSlowChange = () => {};

// both set from the store, so this file doesn't need to import it
export const setUnauthorizedHandler = (handler) => {
  handleUnauthorized = handler;
};
export const setSlowRequestHandler = (handler) => {
  handleSlowChange = handler;
};

const isSessionCheck = (config = {}) =>
  config.url?.startsWith("/auth/login") ||
  config.url?.startsWith("/auth/register") ||
  (config.url === "/auth/me" && config.method === "get");

// let the UI know when requests are taking long (usually the server waking up)
const SLOW_AFTER_MS = 5000;
let slowRequests = 0;

api.interceptors.request.use((config) => {
  // the first /auth/me has its own "waking up" screen
  const hasOwnLoader = config.url === "/auth/me" && config.method === "get";
  if (!hasOwnLoader) {
    config.slowTimer = setTimeout(() => {
      config.isSlow = true;
      slowRequests += 1;
      if (slowRequests === 1) handleSlowChange(true);
    }, SLOW_AFTER_MS);
  }
  return config;
});

const settle = (config) => {
  if (!config) return;
  clearTimeout(config.slowTimer);
  if (config.isSlow) {
    config.isSlow = false;
    slowRequests -= 1;
    if (slowRequests === 0) handleSlowChange(false);
  }
};

api.interceptors.response.use(
  (response) => {
    settle(response.config);
    return response;
  },
  (error) => {
    settle(error.config);
    // a 401 anywhere else means the session expired or was revoked
    if (error.response?.status === 401 && !isSessionCheck(error.config)) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default api;
