import axios from "axios";
import { store } from "./app/store";
import { loginSuccess, logout } from "./features/authSlice";

const setupAxios = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        originalRequest.url.includes("/auth/refresh") ||
        originalRequest.url.includes("/auth/login")
      ) {
        return Promise.reject(error);
      }

      // Check if error is 401 (Unauthorized) and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const state = store.getState();
          const refreshToken = state.auth.refreshToken;

          if (!refreshToken) {
            store.dispatch(logout());
            return Promise.reject(error);
          }

          // Attempt to refresh
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken },
          );

          const { access_token, refresh_token } = response.data;

          store.dispatch(
            loginSuccess({
              token: access_token,
              refresh_token: refresh_token,
              user: state.auth.user,
            }),
          );

          // Update header and retry original request
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
};

export default setupAxios;
