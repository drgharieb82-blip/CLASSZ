export const colors = {
  light: {
    primary: {
      50: "#eefdfb",
      100: "#d4f8f3",
      500: "#0d9488",
      600: "#0f766e",
      700: "#115e59",
    },
    secondary: {
      50: "#f5f3ff",
      100: "#ede9fe",
      500: "#7c3aed",
      600: "#6d28d9",
      700: "#5b21b6",
    },
    success: {
      50: "#ecfdf5",
      100: "#d1fae5",
      500: "#10b981",
      600: "#059669",
    },
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      500: "#f59e0b",
      600: "#d97706",
    },
    error: {
      50: "#fef2f2",
      100: "#fee2e2",
      500: "#ef4444",
      600: "#dc2626",
    },
    neutral: {
      0: "#ffffff",
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      500: "#64748b",
      700: "#334155",
      900: "#0f172a",
      950: "#020617",
    },
  },
  dark: {
    primary: {
      50: "#ccfbf1",
      100: "#99f6e4",
      500: "#2dd4bf",
      600: "#14b8a6",
      700: "#0f766e",
    },
    secondary: {
      50: "#ede9fe",
      100: "#ddd6fe",
      500: "#a78bfa",
      600: "#8b5cf6",
      700: "#7c3aed",
    },
    success: {
      50: "#d1fae5",
      100: "#a7f3d0",
      500: "#34d399",
      600: "#10b981",
    },
    warning: {
      50: "#fef3c7",
      100: "#fde68a",
      500: "#fbbf24",
      600: "#f59e0b",
    },
    error: {
      50: "#fee2e2",
      100: "#fecaca",
      500: "#f87171",
      600: "#ef4444",
    },
    neutral: {
      0: "#020617",
      50: "#0f172a",
      100: "#1e293b",
      200: "#334155",
      300: "#475569",
      500: "#94a3b8",
      700: "#cbd5e1",
      900: "#f8fafc",
      950: "#ffffff",
    },
  },
} as const;

export type ThemeColors = typeof colors;
