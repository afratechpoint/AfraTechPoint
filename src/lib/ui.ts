"use strict";

import { create } from 'zustand';

interface UIStore {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useUI = create<UIStore>((set) => ({
  isCartOpen: false,
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
