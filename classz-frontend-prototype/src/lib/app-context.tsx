import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type Lang = "en" | "ar";

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
}

const AppContext = createContext<AppState | null>(null);

const dict: Record<string, { en: string; ar: string }> = {
  "nav.home": { en: "Home", ar: "الرئيسية" },
  "nav.about": { en: "About", ar: "من نحن" },
  "nav.courses": { en: "Courses", ar: "الدورات" },
  "nav.pricing": { en: "Pricing", ar: "الأسعار" },
  "nav.contact": { en: "Contact", ar: "تواصل" },
  "nav.login": { en: "Login", ar: "تسجيل الدخول" },
  "nav.register": { en: "Register", ar: "إنشاء حساب" },
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "hero.title": { en: "Learn Smarter with CLASSZ", ar: "تعلّم بذكاء مع CLASSZ" },
  "hero.subtitle": {
    en: "A premium learning platform that blends structured courses, gamified progress, and an AI study assistant for secondary students and teachers.",
    ar: "منصة تعليمية متميزة تجمع بين الدورات المنظمة والتقدم التفاعلي ومساعد ذكاء اصطناعي للطلاب والمعلمين.",
  },
  "hero.getStarted": { en: "Get started free", ar: "ابدأ مجانًا" },
  "common.search": { en: "Search", ar: "بحث" },
  "common.viewAll": { en: "View all", ar: "عرض الكل" },
  "common.logout": { en: "Log out", ar: "تسجيل الخروج" },
  "common.settings": { en: "Settings", ar: "الإعدادات" },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const t = (localStorage.getItem("classz-theme") as Theme) || "dark";
    const l = (localStorage.getItem("classz-lang") as Lang) || "en";
    setThemeState(t);
    setLangState(l);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("classz-theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    root.setAttribute("lang", lang);
    localStorage.setItem("classz-lang", lang);
  }, [lang]);

  const value: AppState = {
    theme,
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((p) => (p === "dark" ? "light" : "dark")),
    lang,
    setLang: setLangState,
    toggleLang: () => setLangState((p) => (p === "en" ? "ar" : "en")),
    dir: lang === "ar" ? "rtl" : "ltr",
    t: (key) => dict[key]?.[lang] ?? key,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
