"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

interface ProductPageProps {
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

export default function ProductPage({ products }: { products: ProductPageProps[] | null }) {
  const router = useRouter();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const category = String(formData.get("category") ?? "").trim();
    const product = String(formData.get("product") ?? "").trim();

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (product) params.set("search", product);

    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : "/products");
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4">
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
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="submit"
            className="h-10 sm:h-[42px] rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700"
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
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 max-w-[1600px] mx-auto">
        {products ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product}/>
          ))
        ) : (
          <h2>Could Not Fetch Products</h2>
        )}
      </div>
    </div>
  );
}
