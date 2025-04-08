import { Documents } from "#/components/BotMessageBox";
import { create } from "zustand";

export interface Message {
  uuid: string;
  text: string;
  type: "user" | "bot";
  file?: File | null;
  fileList?: Documents[];
}

interface MessageStore {
  messages: Message[];
  addMessage: (
    uuid: string,
    text: string,
    type: "user" | "bot",
    file?: File | null,
    fileList?: Documents[]
  ) => void;
  cleanMessages: () => void;
}

const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  addMessage: (uuid, text, type, file?, fileList?) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          uuid,
          text,
          type,
          file,
          fileList
        }
      ]
    })),
  cleanMessages: () =>
    set(() => ({
      messages: []
    }))
}));

export default useMessageStore;
