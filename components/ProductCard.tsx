"use client";

import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    description: string;
    category: string;
    stock: number;
    store?: {
      name: string;
    };
  };
  storeName?: string;
}

export default function ProductCard({ product, storeName }: ProductCardProps) {
  const vendorName = storeName || product.store?.name || "Unknown Store";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden aspect-square">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-md">
            {product.category}
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <Link href={`/products/${product.id}`} className="block">
          <h2 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2 min-h-[3.5rem] hover:text-indigo-700 transition-colors duration-200">
            {product.name}
          </h2>
        </Link>

        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span className="truncate">{vendorName}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex gap-2 items-center justify-between mb-3">
            <span className="text-2xl font-bold text-indigo-600">
              ₹{(product.price / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
