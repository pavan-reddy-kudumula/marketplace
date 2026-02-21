import { Product, Store } from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProductWithStore = Product & { store: Store};

interface CartItem extends ProductWithStore{
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: ProductWithStore) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          const isItemExists = state.items.find((p) => p.id === product.id);
          let nextCart: CartItem[];
          if (isItemExists) {
            nextCart = state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          } else {
            nextCart = [...state.items, { ...product, quantity: 1 }];
          }
          console.log(nextCart);
          return { items: nextCart };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "shopping-cart",
    },
  ),
);
