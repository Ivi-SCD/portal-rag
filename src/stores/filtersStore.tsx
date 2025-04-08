import { create } from "zustand";

export interface Filter {
  type: "public" | "private";
  name: string;
  selected: boolean;
}

interface FilterStore {
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
  toggleFilter: (nome: string) => void;
}

const useFilterStore = create<FilterStore>((set) => ({
  filters: [],
  setFilters: (filters) => set({ filters }),
  toggleFilter: (nome) =>
    set((state) => ({
      filters: state.filters.map((filter) =>
        filter.name === nome ? { ...filter, selected: !filter.selected } : filter
      )
    }))
}));

export default useFilterStore;
