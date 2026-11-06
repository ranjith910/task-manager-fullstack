import api from "./api";

const getActivity = (limit = 8, signal) =>
  api.get("/activity", { params: { limit }, signal }).then((res) => res.data.data);

export default { getActivity };
