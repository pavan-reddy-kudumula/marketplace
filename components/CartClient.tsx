"use client";

import { useCart } from "@/store/cart";
import { createRazorpayOrder } from "@/actions/razorpay";
import CheckOut from "@/actions/checkout";
import { getUser } from "@/actions/user";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CartItemControls from "./CartItemControls";

export default function CartClient() {
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clearCart);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [userLoading, setUserLoading] = useState(true);

  const enforceStockLimits = useCart((state) => state.enforceStockLimits);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    enforceStockLimits();
  }, [items.length, enforceStockLimits]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const result = await getUser();
        if (result.data) {
          setPhone(result.data.phone || "");
          setAddress(result.data.address || "");
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setUserLoading(false);
      }
    }
    fetchUserData();
  }, []);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    if (!address || address.trim() === "") {
      setError("Address is required for checkout");
      setLoading(false);
      return;
    }

    try {
      if (typeof window === "undefined" || !(window as any).Razorpay) {
        setError("Razorpay SDK not loaded. Please try again.");
        return;
      }

      const orderResult = await createRazorpayOrder(total);

      if (orderResult.error || !orderResult.data) {
        setError(orderResult.error || "Failed to create payment order");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResult.data.amount,
        currency: orderResult.data.currency,
        name: "Marketplace App",
        description: "Test Transaction",
        order_id: orderResult.data.id,
        prefill: {
          contact: phone,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        handler: async function (response: any) {
          try {
            setLoading(true);
            const result = await CheckOut(
              items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                selectedAttributes: item.selectedAttributes,
              })),
              { 
                phone: phone.trim(), 
                address: address.trim(),
                paymentId: response.razorpay_payment_id 
              }
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
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        setError(response.error.description || "Payment failed");
        setLoading(false);
      });

      paymentObject.open();

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Initialization failed. Please try again.");
      setLoading(false);
    }
    // We don't set loading to false in finally here because it needs to stay true while the handler runs or modal is open
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
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>


        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4"
              >
                <div className="flex gap-4 items-center">
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
                    <p className="font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-sm text-gray-400">{item.store.name}</p>
                    {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {Object.entries(item.selectedAttributes)
                          .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`)
                          .join(", ")}
                      </p>
                    )}
                    <p className="text-sm text-indigo-600 font-medium mt-1">
                      ₹{(item.price / 100).toFixed(2)} each
                    </p>
                  </div>

                  <div className="text-right shrink-0 w-20">
                    <p className="font-semibold text-gray-800">
                      ₹{((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <CartItemControls product={item}/>
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
                    <span className="shrink-0">₹{((item.price * item.quantity) / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between font-bold text-gray-800 text-base">
                  <span>Total</span>
                  <span>₹{(total / 100).toFixed(2)}</span>
                </div>
              </div>

              {!userLoading && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

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
    </>
  );
}
