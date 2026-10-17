// src/service/LoginService.js
import api from "../api/api";
import { checkLogicalError, handleApiError } from "../utils/errorHandler";


export const loginUser = async (username, password) => {
  try {
    const { data } = await api.post("/login", { username, password });
    const result = checkLogicalError(data);

    return result;
  } catch (err) {
    throw new Error(handleApiError(err));
  }
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me", {
    skipLoader: true,
    skipLogout: true,
  });
  return checkLogicalError(data);
};

export const logoutUser = async () => {
  await api.post("/auth/logout", null, {
    skipLoader: true,
    skipLogout: true,
    skipAuthRefresh: true,
  });
};