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

export const usePastSearchesStore = create<{
  pastSearches: string[];
  addPastSearch: (search: string) => void;
  removePastSearch: (search: string) => void;
}>()(
  persist(
    (set) => ({
      pastSearches: [],
      addPastSearch: (search) =>
        set((state) => ({
          pastSearches: [search, ...state.pastSearches],
        })),
      removePastSearch: (search) => {
        set((state) => ({
          pastSearches: state.pastSearches.filter((s) => s !== search),
        }));
      },
    }),
    {
      name: "past-searches-store",
    },
  ),
);
