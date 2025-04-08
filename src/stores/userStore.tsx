import { User } from "#/types/User";
import { create } from "zustand";

interface UserStore {
  user: User | undefined;
  updateUser: (user: User) => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: undefined,
  updateUser: (user) => set({ user })
}));

export default useUserStore;
