import { create } from "zustand";

const usePreviousPathStore = create<{
  previousPath?: string;
  setPreviousPath: (previousPath: string) => void;
}>((set) => ({
  setPreviousPath: (previousPath: string) => {
    set({ previousPath });
  },
}));

export const usePreviousPath = () => {
  const { previousPath, setPreviousPath } = usePreviousPathStore();
  return { previousPath, setPreviousPath };
};
