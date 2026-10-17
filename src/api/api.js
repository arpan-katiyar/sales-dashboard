import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let loaderInstance;
export const setLoader = (loader) => {
  loaderInstance = loader;
};

const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let refreshPromise = null;

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function isAuthEndpoint(url = "") {
  return (
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout") ||
    url.endsWith("/login")
  );
}

function dispatchLogout() {
  window.dispatchEvent(
    new CustomEvent("app:logout", {
      detail: { reason: "unauthorized", status: 401, message: "Session expired" },
    }),
  );
}

api.interceptors.request.use((config) => {
  if (!config.skipLoader) {
    loaderInstance?.startLoading();
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (!response.config.skipLoader) {
      loaderInstance?.stopLoading();
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    if (original && !original.skipLoader) {
      loaderInstance?.stopLoading();
    }

    const status = error?.response?.status;
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !original.skipAuthRefresh &&
      !isAuthEndpoint(original.url)
    ) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch (refreshError) {
        if (!original.skipLogout) {
          dispatchLogout();
        }
        return Promise.reject(refreshError);
      }
    }

    if (status === 401 && original && !original.skipLogout && !isAuthEndpoint(original.url)) {
      dispatchLogout();
    }

    return Promise.reject(error);
  },
);

export default api;
