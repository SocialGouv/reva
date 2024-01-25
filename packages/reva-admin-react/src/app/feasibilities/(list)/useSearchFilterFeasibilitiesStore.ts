import { create } from "zustand";

export const useSearchFilterFeasibilitiesStore = create<{
  searchFilter: string;
  setSearchFilter: (input: string) => void;
}>((set) => ({
  searchFilter: "",
  setSearchFilter: (input: string) => set({ searchFilter: input }),
}));
