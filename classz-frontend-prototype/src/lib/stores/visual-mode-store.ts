import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VisualMode = "teen" | "adult";

interface VisualModeState {
  mode: VisualMode;
  userAge: number | null;
  setAge: (age: number) => void;
  setMode: (mode: VisualMode) => void;
}

export const useVisualModeStore = create<VisualModeState>()(
  persist(
    (set) => ({
      mode: "teen",
      userAge: null,

      setAge: (age) => {
        set({ userAge: age, mode: age > 18 ? "adult" : "teen" });
      },

      setMode: (mode) => set({ mode }),
    }),
    { name: "classz-visual-mode" },
  ),
);

export function useIsTeenMode(): boolean {
  return useVisualModeStore((s) => s.mode === "teen");
}
