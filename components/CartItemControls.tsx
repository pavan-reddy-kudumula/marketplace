"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

interface CartProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  stock: number;
  store: {
    name: string;
  };
}

interface CartItemControlsProps {
  product: CartProduct;
}

export default function CartItemControls({ product }: CartItemControlsProps) {
  const addItem = useCart((state) => state.addItem);
  const removeItem = useCart((state) => state.removeItem);
  const updateItemStock = useCart((state) => state.updateItemStock);

  useEffect(() => {
    if (product.id) {
      updateItemStock(product.id, product.stock);
    }
  }, [product.id, product.stock, updateItemStock]);

  const quantity = useCart(
    (state) => state.items.find((item) => item.id === product.id)?.quantity ?? 0,
  );
  const isOutOfStock = product.stock <= 0;
  const hasReachedStockLimit = quantity >= product.stock;

  return (
    <div className="flex flex-col gap-2">
      <div className="inline-flex w-fit items-center rounded-lg border border-indigo-300 bg-transparent p-1">
        {quantity > 0 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 w-8 rounded-md bg-transparent text-lg font-bold leading-none text-indigo-700 transition-colors duration-200 hover:bg-indigo-50"
              onClick={() => removeItem(product.id)}
            >
              -
            </button>
            <p className="min-w-6 text-center text-sm font-bold text-indigo-700">
              {quantity}
            </p>
            <button
              type="button"
              className="h-8 w-8 rounded-md bg-transparent text-lg font-bold leading-none text-indigo-700 transition-colors duration-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              onClick={() => addItem(product)}
              disabled={hasReachedStockLimit}
              aria-label={hasReachedStockLimit ? "Maximum stock reached" : "Increase quantity"}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="rounded-md bg-transparent px-4 py-1.5 text-sm font-semibold text-indigo-700 transition-colors duration-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
            onClick={() => addItem(product)}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of stock" : "Add"}
          </button>
        )}
      </div>
    </div>
  );
}