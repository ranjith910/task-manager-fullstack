import api from "./api";
import { getTodayString } from "../utils/dates";

// drop empty filters, the API rejects e.g. status=""
const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null,
    ),
  );

// returns { data: Task[], pagination }
const getTasks = (params = {}, signal) =>
  api
    .get("/tasks", { params: cleanParams({ ...params, today: getTodayString() }), signal })
    .then((res) => res.data);

const getStats = (signal) =>
  api
    .get("/tasks/stats", { params: { today: getTodayString() }, signal })
    .then((res) => res.data.data);

const createTask = (task) => api.post("/tasks", task).then((res) => res.data.data);

const updateTask = (id, changes) => api.patch(`/tasks/${id}`, changes).then((res) => res.data.data);

const deleteTask = (id) => api.delete(`/tasks/${id}`).then(() => id);

export default { getTasks, getStats, createTask, updateTask, deleteTask };
