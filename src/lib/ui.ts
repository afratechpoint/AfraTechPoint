"use strict";

import { create } from 'zustand';

interface UIStore {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useUI = create<UIStore>((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
