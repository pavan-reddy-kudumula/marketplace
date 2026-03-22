"use client";

import { useEffect, useMemo, useState } from "react";
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
  attributes?: unknown;
}

interface CartItemControlsProps {
  product: CartProduct;
}

export default function CartItemControls({ product }: CartItemControlsProps) {
  const addItem = useCart((state) => state.addItem);
  const removeItem = useCart((state) => state.removeItem);

  const attributeOptions = useMemo(() => {
    if (!product.attributes || typeof product.attributes !== "object" || Array.isArray(product.attributes)) {
      return [] as Array<{ key: string; values: string[] }>;
    }

    return Object.entries(product.attributes as Record<string, unknown>)
      .map(([key, rawValue]) => {
        const values = Array.isArray(rawValue)
          ? rawValue
              .map((value) => String(value).trim())
              .filter(Boolean)
          : [String(rawValue).trim()].filter(Boolean);

        return { key, values };
      })
      .filter((item) => item.values.length > 0);
  }, [product.attributes]);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (attributeOptions.length === 0) {
      setSelectedAttributes({});
      return;
    }

    setSelectedAttributes((previous) => {
      const next: Record<string, string> = {};
      for (const { key, values } of attributeOptions) {
        const currentValue = previous[key];
        next[key] = currentValue && values.includes(currentValue) ? currentValue : values[0];
      }
      return next;
    });
  }, [attributeOptions]);

  const quantity = useCart(
    (state) => state.items.find((item) => item.id === product.id)?.quantity ?? 0,
  );
  const isOutOfStock = product.stock <= 0;
  const hasReachedStockLimit = quantity >= product.stock;

  function handleAttributeChange(key: string, value: string) {
    setSelectedAttributes((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  const selectedAttributesToSave =
    attributeOptions.length > 0 ? selectedAttributes : undefined;

  return (
    <div className="flex flex-col gap-2">
      {attributeOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attributeOptions.map(({ key, values }) => (
            <label key={key} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium capitalize text-gray-700">{key.replace(/_/g, " ")}</span>
              <select
                value={selectedAttributes[key] ?? values[0]}
                onChange={(e) => handleAttributeChange(key, e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
              >
                {values.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

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
              onClick={() => addItem(product, selectedAttributesToSave)}
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
            onClick={() => addItem(product, selectedAttributesToSave)}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of stock" : "Add"}
          </button>
        )}
      </div>
    </div>
  );
}