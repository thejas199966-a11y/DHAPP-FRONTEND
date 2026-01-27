import { configureStore } from "@reduxjs/toolkit";
import driverReducer from "../features/driverSlice";
import authReducer from "../features/authSlice";
import languageReducer from "../features/languageSlice";
import notificationReducer from "../features/notificationSlice";
import userReducer from "../features/userSlice";
import travelsReducer from "../features/travelSlice";
import themeReducer from "../features/themeSlice";
import authModalReducer from "../features/authModalSlice";
import tripReducer from "../features/tripSlice";
import locationReducer from "../features/locationSlice";
import towTruckDriverReducer from "../features/towTruckDriverSlice";
import towTripReducer from "../features/towTripSlice";

export const store = configureStore({
  reducer: {
    drivers: driverReducer,
    auth: authReducer,
    language: languageReducer,
    notification: notificationReducer,
    user: userReducer,
    travels: travelsReducer,
    theme: themeReducer,
    authModal: authModalReducer,
    trips: tripReducer,
    location: locationReducer,
    towTruckDrivers: towTruckDriverReducer,
    towTrips: towTripReducer
  },
});
