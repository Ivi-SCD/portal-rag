import { create } from "zustand";

export type Prompt = {
  prompt: string;
  titulo: string;
  type: "favorite";
};

export interface recommendedPrompt {
  created_at: string;
  created_by: string;
  descricao: string;
  id_dominio: string;
  prompt: string;
  titulo: string;
  updated_at: string;
  type: "recommended";
}

interface PromptStore {
  recommendedPrompts: recommendedPrompt[];
  favoritePrompts: Prompt[];
  promptToApply: string | undefined;
  addRecommendedPrompt: (prompt: recommendedPrompt) => void;
  removeRecommendedPrompt: (prompt: recommendedPrompt) => void;
  setRecommendedPrompt: (promptList: recommendedPrompt[]) => void;
  addFavoritePrompt: (prompt: Prompt) => void;
  removeFavoritePrompt: (prompt: Prompt) => void;
  setFavoritePrompt: (promptList: Prompt[]) => void;
  setPromptToApply: (prompt: string | undefined) => void;
}

const usePromptStore = create<PromptStore>((set) => ({
  recommendedPrompts: [],
  favoritePrompts: [],
  promptToApply: undefined,
  addRecommendedPrompt: (prompt) =>
    set((state) => ({
      recommendedPrompts: [...state.recommendedPrompts, prompt]
    })),
  setRecommendedPrompt: (promptList) =>
    set(() => ({
      recommendedPrompts: promptList
    })),
  removeRecommendedPrompt: (prompt) =>
    set((state) => ({
      recommendedPrompts: state.recommendedPrompts.filter(
        (p) => p.titulo !== prompt.titulo
      )
    })),
  addFavoritePrompt: (prompt) =>
    set((state) => ({
      favoritePrompts: [...state.favoritePrompts, prompt]
    })),
  removeFavoritePrompt: (prompt) =>
    set((state) => ({
      favoritePrompts: state.favoritePrompts.filter((p) => p !== prompt)
    })),
  setFavoritePrompt: (promptList) =>
    set(() => ({
      favoritePrompts: promptList
    })),
  setPromptToApply: (promptToApply) => set({ promptToApply })
}));

export default usePromptStore;
