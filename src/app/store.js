import { configureStore } from "@reduxjs/toolkit";
import driverReducer from "../features/driverSlice";
import authReducer from "../features/authSlice";
import languageReducer from '../features/languageSlice';
import commonReducer from '../features/commonSlice';
import notificationReducer from '../features/notificationSlice';
import userReducer from '../features/userSlice';
import travelsReducer from '../features/travelSlice';
import themeReducer from '../features/themeSlice';

export const store = configureStore({
  reducer: {
    drivers: driverReducer,
    auth: authReducer,
    language: languageReducer,
    common: commonReducer,
    notification: notificationReducer,
    user: userReducer,
    travels: travelsReducer,
    theme: themeReducer,
  },
});
