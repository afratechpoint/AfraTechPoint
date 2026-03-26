import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantName?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (id: string, variantName?: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) => set((state) => {
        const existing = state.items.find((i) => i.id === product.id && i.variantName === product.variantName);
        if (existing) {
          return {
            items: state.items.map((i) => 
              (i.id === product.id && i.variantName === product.variantName) ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { items: [...state.items, { ...product, quantity: 1 }] };
      }),
      removeItem: (id, variantName) => set((state) => ({
        items: state.items.filter((i) => !(i.id === id && i.variantName === variantName)),
      })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
