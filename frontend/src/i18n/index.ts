import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import arCommon from "./ar/common.json";
import enCommon from "./en/common.json";

export const supportedLanguages = ["en", "ar"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const storageKey = "classz.language";

function getInitialLanguage(): SupportedLanguage {
  const savedLanguage = localStorage.getItem(storageKey);
  return savedLanguage === "ar" ? "ar" : "en";
}

export function applyDocumentLanguage(language: string) {
  const normalizedLanguage: SupportedLanguage = language === "ar" ? "ar" : "en";
  document.documentElement.lang = normalizedLanguage;
  document.documentElement.dir = normalizedLanguage === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.language = normalizedLanguage;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    ar: { common: arCommon },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

applyDocumentLanguage(i18n.language);

i18n.on("languageChanged", (language) => {
  const normalizedLanguage: SupportedLanguage = language === "ar" ? "ar" : "en";
  localStorage.setItem(storageKey, normalizedLanguage);
  applyDocumentLanguage(normalizedLanguage);
});

export default i18n;
