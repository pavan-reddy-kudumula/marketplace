"use client";

import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";
import { Product, Store } from "@prisma/client";
import React from "react";

type ProductpageProps = Product & { store: Store }  

export default function ProductPage({ products }: { products: ProductpageProps[] }) {
  const addItem = useCart((state) => state.addItem);
  const removeItem = useCart((state) => state.removeItem);
  const clearCart = useCart((state) => state.clearCart);
  const router = useRouter();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const category = String(formData.get("category") ?? "").trim();
    const product = String(formData.get("product") ?? "").trim();

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (product) params.set("search", product);

    if (params.toString()) {
      router.push(`/?${params.toString()}`);
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-[1600px] mx-auto mb-8"
      >
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Category
            </label>
            <input
              id="category"
              type="text"
              name="category"
              placeholder="e.g. Tech"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="product"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Product
            </label>
            <input
              id="product"
              type="text"
              name="product"
              placeholder="Search products"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            className="h-10 sm:h-[42px] rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </form>
      <div className="max-w-[1600px] mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-4xl text-gray-800 tracking-tight">
            Products
          </h1>
          <button 
            onClick={() => clearCart()}
            className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors duration-200 shadow-md"
          >
            Clear Cart
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 max-w-[1600px] mx-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col"
          >
            <div className="relative overflow-hidden aspect-square">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-md">
                {product.category}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h2 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2 min-h-[3.5rem]">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="truncate">{product.store.name}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                {product.description}
              </p>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-600">
                    ${(product.price / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                    onClick={() => addItem(product)}
                  >
                    Add to cart
                  </button>
                  <button 
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors duration-200 shadow-sm"
                    onClick={() => removeItem(product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
