import { create } from "zustand";

interface CategorySheetType {
  isOpen: boolean;
  toggleCategorySheet: () => void;
  closeSheet: () => void;
}

export const useCategorySheetStore = create<CategorySheetType>((set) => {
  return {
    isOpen: false,
    toggleCategorySheet() {
      set((prev) => {
        return {
          ...prev,
          isOpen: !prev.isOpen,
        };
      });
    },
    closeSheet() {
      set((prev) => {
        return {
          ...prev,
          isOpen: false,
        };
      });
    },
  };
});
