import { create } from "zustand";

type ThemeMode = "light" | "dark";

type ThemeState = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

const preferredTheme = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: preferredTheme(),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "dark" ? "light" : "dark",
    })),
}));
