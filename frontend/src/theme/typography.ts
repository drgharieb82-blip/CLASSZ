export const typography = {
  fontFamily: {
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    display: '"Poppins", "Inter", ui-sans-serif, system-ui, sans-serif',
    arabic: '"Tajawal", "Cairo", ui-sans-serif, system-ui, sans-serif',
  },
  presets: {
    pageTitle: {
      fontSize: "2.25rem",
      lineHeight: "2.5rem",
      fontWeight: 700,
    },
    sectionTitle: {
      fontSize: "1.5rem",
      lineHeight: "2rem",
      fontWeight: 700,
    },
    cardTitle: {
      fontSize: "1rem",
      lineHeight: "1.5rem",
      fontWeight: 700,
    },
    body: {
      fontSize: "1rem",
      lineHeight: "1.75rem",
      fontWeight: 400,
    },
    caption: {
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    eyebrow: {
      fontSize: "0.75rem",
      lineHeight: "1rem",
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
    },
  },
} as const;

export type TypographyToken = keyof typeof typography.presets;
