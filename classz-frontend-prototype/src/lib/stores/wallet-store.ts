import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transaction {
  id: string;
  type: "recharge" | "purchase";
  amount: number;
  description: string;
  date: string;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  recharge: (amount: number, method: string) => void;
  deduct: (amount: number, description: string) => boolean;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],

      recharge: (amount, method) => {
        set((state) => ({
          balance: state.balance + amount,
          transactions: [
            {
              id: `tx-${Date.now()}`,
              type: "recharge",
              amount,
              description: `Recharged via ${method}`,
              date: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        }));
      },

      deduct: (amount, description) => {
        const { balance } = get();
        if (balance < amount) return false;
        set((state) => ({
          balance: state.balance - amount,
          transactions: [
            {
              id: `tx-${Date.now()}`,
              type: "purchase",
              amount: -amount,
              description,
              date: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        }));
        return true;
      },
    }),
    { name: "classz-wallet" },
  ),
);
