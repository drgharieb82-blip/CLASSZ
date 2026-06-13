export const shadows = {
  none: "none",
  xs: "0 1px 2px rgba(15, 23, 42, 0.06)",
  sm: "0 4px 14px rgba(15, 23, 42, 0.08)",
  md: "0 12px 32px rgba(15, 23, 42, 0.10)",
  lg: "0 22px 60px rgba(15, 23, 42, 0.14)",
  focus: "0 0 0 4px rgba(13, 148, 136, 0.18)",
  dark: {
    sm: "0 4px 18px rgba(0, 0, 0, 0.22)",
    md: "0 14px 38px rgba(0, 0, 0, 0.28)",
    lg: "0 24px 70px rgba(0, 0, 0, 0.36)",
  },
} as const;

export type ShadowToken = keyof typeof shadows;
