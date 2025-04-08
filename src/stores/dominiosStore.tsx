import { create } from "zustand";

export interface Dominio {
  access: "public" | "private";
  created_at: string;
  created_by: string;
  admin: string | string[];
  id_dominio: string;
  updated_at: string;
}

interface DominioStore {
  dominios: Dominio[];
  setDominios: (dominios: Dominio[]) => void;
}

const useDominiosStore = create<DominioStore>((set) => ({
  dominios: [],
  setDominios: (dominios) => set({ dominios })
}));

export default useDominiosStore;
