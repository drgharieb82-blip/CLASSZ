import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ParentSelectedChildState {
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
}

export const useParentSelectedChildStore = create<ParentSelectedChildState>()(
  persist(
    (set) => ({
      selectedChildId: null,
      setSelectedChildId: (id) => set({ selectedChildId: id }),
    }),
    { name: "classz-parent-selected-child" },
  ),
);
