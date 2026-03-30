"use client";

import { useCart } from "@/store/cart";
import CheckOut from "@/actions/checkout";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CartItemControls from "./CartItemControls";

export default function CartClient() {
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clearCart);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enforceStockLimits = useCart((state) => state.enforceStockLimits);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    enforceStockLimits();
  }, [items.length, enforceStockLimits]);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const result = await CheckOut(
        items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          selectedAttributes: item.selectedAttributes,
        }))
      );

      if (result.error || !result.data) {
        setError(result.error ?? "Checkout failed. Please try again.");
        return;
      }

      clearCart();
      router.push(result.data.length === 1 ? `/orders/${result.data[0]}` : "/orders");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-center"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                      📦
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-sm text-gray-400">{item.store.name}</p>
                  {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {Object.entries(item.selectedAttributes)
                        .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`)
                        .join(", ")}
                    </p>
                  )}
                  <p className="text-sm text-indigo-600 font-medium mt-1">
                    ${(item.price / 100).toFixed(2)} each
                  </p>
                </div>

                <CartItemControls product={item}/>

                <div className="text-right shrink-0 w-20">
                  <p className="font-semibold text-gray-800">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate mr-2">{item.name} x {item.quantity}</span>
                    <span className="shrink-0">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between font-bold text-gray-800 text-base">
                  <span>Total</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Checkout"}
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="w-full mt-3 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
