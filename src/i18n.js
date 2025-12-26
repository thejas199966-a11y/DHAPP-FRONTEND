import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend"; // <--- Import this

i18n
  //.use(LanguageDetector) // Optional: Auto-detects user language
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem("appLanguage") || "en",
    fallbackLng: "en",

    // Configuration for the plugin
    backend: {
      // Path where resources get loaded from
      loadPath: "/locales/{{lng}}/translations.json",
    },

    interpolation: {
      escapeValue: false,
    },

    // React Suspense support (Important for loading)
    react: {
      useSuspense: true,
    },
  });

export default i18n;
