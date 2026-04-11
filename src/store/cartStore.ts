import { create } from 'zustand';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  thumbnail?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isOpen: false,
  addItem: (item) => set((state) => {
    if (state.items.find(i => i.id === item.id)) return state;
    return { items: [...state.items, item], isOpen: true };
  }),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
