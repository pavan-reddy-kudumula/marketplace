import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProductWithStore {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  description: string
  store: {
    name: string
  }
}

export type SelectedAttributes = Record<string, string>;

interface CartItem extends ProductWithStore{
  quantity: number;
  selectedAttributes?: SelectedAttributes;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: ProductWithStore, selectedAttributes?: SelectedAttributes) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, selectedAttributes) =>
        set((state) => {
          const isItemExists = state.items.find((p) => p.id === product.id);
          let nextCart: CartItem[];
          if (isItemExists) {
            nextCart = state.items.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                    selectedAttributes: selectedAttributes ?? item.selectedAttributes,
                  }
                : item,
            );
          } else {
            nextCart = [
              ...state.items,
              {
                ...product,
                quantity: 1,
                selectedAttributes,
              },
            ];
          }

          return { items: nextCart };
        }),

      removeItem: (productId) =>
        set((state) => {
          const nextCart = state.items
            .map((item) =>
              item.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0);
          return { items: nextCart };
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "shopping-cart",
    },
  ),
);
