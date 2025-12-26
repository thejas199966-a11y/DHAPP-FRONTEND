import { createSlice } from "@reduxjs/toolkit";

// Helper to check localStorage first, else default to 'en'
const savedLanguage = localStorage.getItem("appLanguage") || "en";

const languageSlice = createSlice({
  name: "language",
  initialState: {
    code: savedLanguage, // 'en', 'hi', 'kn'
    label:
      savedLanguage === "en"
        ? "English"
        : savedLanguage === "hi"
        ? "Hindi"
        : "Kannada",
  },
  reducers: {
    setLanguage: (state, action) => {
      state.code = action.payload.code;
      state.label = action.payload.label;
      // Persist to localStorage so it remembers after refresh
      localStorage.setItem("appLanguage", action.payload.code);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
