import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProductWithStore {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  description: string
  stock: number
  store: {
    name: string
  }
}

interface CartItem extends ProductWithStore{
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: ProductWithStore) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  updateItemStock: (productId: string, stock: number) => void;
  enforceStockLimits: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          if (product.stock <= 0) {
            return state;
          }

          const existingItem = state.items.find((p) => p.id === product.id);
          if (existingItem) {
            if (existingItem.quantity >= product.stock) {
              return state;
            }

            const nextCart = state.items.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: Math.min(item.quantity + 1, product.stock),
                    stock: product.stock,
                  }
                : item,
            );
            return { items: nextCart };
          }

          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity: 1,
                stock: product.stock,
              },
            ],
          };
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

      updateItemStock: (productId, stock) =>
        set((state) => {
          const nextCart = state.items
            .map((item) => {
              if (item.id !== productId) return item;

              if (stock <= 0) {
                return null;
              }

              return {
                ...item,
                stock,
                quantity: Math.min(item.quantity, stock),
              };
            })
            .filter((item): item is CartItem => item !== null);

          return { items: nextCart };
        }),

      enforceStockLimits: () =>
        set((state) => {
          const nextCart = state.items
            .map((item) => {
              if (item.stock <= 0) return null;
              if (item.quantity > item.stock) {
                return { ...item, quantity: item.stock };
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null);

          return { items: nextCart };
        }),
    }),
    {
      name: "shopping-cart",
    },
  ),
);
