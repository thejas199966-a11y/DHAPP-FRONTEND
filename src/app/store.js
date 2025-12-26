import { configureStore } from "@reduxjs/toolkit";
import driverReducer from "../features/driverSlice";
import authReducer from "../features/authSlice";
import languageReducer from '../features/languageSlice';
import commonReducer from '../features/commonSlice';

export const store = configureStore({
  reducer: {
    drivers: driverReducer,
    logins: authReducer,
    language: languageReducer,
    common: commonReducer,
  },
});
