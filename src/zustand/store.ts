import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAdressStore = create<{
  selectedAdress: null | string;
  setSelectedAdress: (selectedAdress: null | string) => void;
}>()(
  persist(
    (set) => ({
      selectedAdress: null,
      setSelectedAdress: (selectedAdress) => set({ selectedAdress }),
    }),
    {
      name: "adress-store",
    },
  ),
);
