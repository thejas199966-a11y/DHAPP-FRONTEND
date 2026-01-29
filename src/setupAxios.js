import axios from "axios";
import { store } from "./app/store";
import { loginSuccess, logout } from "./features/authSlice";

const setupAxios = () => {
  // 1. Response Interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Check if error is 401 (Unauthorized) and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Get the refresh token from Redux state
          const state = store.getState();
          const refreshToken = state.auth.refreshToken;

          if (!refreshToken) {
            // No refresh token? Logout.
            store.dispatch(logout());
            return Promise.reject(error);
          }

          // Attempt to refresh
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken },
          );

          const { access_token, refresh_token } = response.data;

          // Update Redux with new tokens
          store.dispatch(
            loginSuccess({
              token: access_token,
              refresh_token: refresh_token,
              user: state.auth.user,
            }),
          );

          // Update the header of the failed request with the NEW token
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;

          // Retry the original request
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed (e.g., refresh token also expired)? Logout.
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
};

export default setupAxios;
