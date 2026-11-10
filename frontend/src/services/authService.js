import api from "./api";

const getMe = () => api.get("/auth/me").then((res) => res.data.data);

const login = (credentials) => api.post("/auth/login", credentials).then((res) => res.data.data);

const register = (details) => api.post("/auth/register", details).then((res) => res.data.data);

const logout = () => api.post("/auth/logout").then(() => null);

const updateProfile = (changes) => api.patch("/auth/me", changes).then((res) => res.data.data);

const changePassword = (passwords) =>
  api.patch("/auth/password", passwords).then((res) => res.data.message);

export default { getMe, login, register, logout, updateProfile, changePassword };
