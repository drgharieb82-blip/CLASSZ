import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f8f3",
          100: "#e7eadf",
          300: "#aeb8a2",
          600: "#4b5a4d",
          800: "#253129",
          950: "#101613",
        },
        signal: {
          500: "#e85d3f",
          600: "#c94328",
        },
        campus: {
          400: "#18a999",
          500: "#0d9488",
        },
        chalk: "#fffdf7",
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 18px 60px rgba(16, 22, 19, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
