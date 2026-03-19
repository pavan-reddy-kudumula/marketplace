"use client";

import { useState } from "react";
import Image from "next/image";
import { createProduct } from "@/actions/product";
import CloudinaryUploadButton from "@/components/CloudinaryUploadButton";

const MAX_IMAGES = 5;

interface AttributePair {
  key: string;
  value: string;
}

export default function CreateProductPage() {
  const [images, setImages] = useState<string[]>([]);
  const [attributePairs, setAttributePairs] = useState<AttributePair[]>([{ key: "", value: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleUploadImage(url: string) {
    setError(null);
    setImages((prev) => {
      if (prev.length >= MAX_IMAGES) {
        setError(`You can upload up to ${MAX_IMAGES} images only.`);
        return prev;
      }

      return [...prev, url];
    });
  }

  function updateAttributePair(index: number, field: keyof AttributePair, value: string) {
    setAttributePairs((prev) =>
      prev.map((pair, currentIndex) =>
        currentIndex === index ? { ...pair, [field]: value } : pair
      )
    );
  }

  function addAttributePair() {
    setAttributePairs((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeAttributePair(index: number) {
    setAttributePairs((prev) => {
      const next = prev.filter((_, currentIndex) => currentIndex !== index);
      return next.length === 0 ? [{ key: "", value: "" }] : next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const priceRaw = Number(formData.get("price"));
    const stockRaw = Number(formData.get("stock"));
    const category = String(formData.get("category") ?? "").trim();

    if (!name || !description || !category) {
      setError("All fields are required.");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    if (isNaN(priceRaw) || priceRaw <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    if (isNaN(stockRaw) || stockRaw < 0) {
      setError("Stock must be 0 or a positive number.");
      return;
    }

    const attributes: Record<string, string | string[]> = {};
    for (const pair of attributePairs) {
      const key = pair.key.trim();
      const value = pair.value.trim();

      if (!key && !value) {
        continue;
      }

      if (!key || !value) {
        setError("Each attribute must include both key and value.");
        return;
      }

      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        setError(`Duplicate attribute key: ${key}`);
        return;
      }

      const values = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (values.length === 0) {
        setError(`Attribute value for \"${key}\" is empty.`);
        return;
      }

      attributes[key] = values.length === 1 ? values[0] : values;
    }

    try {
      setLoading(true);
      const result = await createProduct({
        name,
        description,
        price: priceRaw,
        images,
        category,
        stock: stockRaw,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Product</h1>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="name">
              Product Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Wireless Headphones"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe your product..."
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="price">
              Price ($)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 29.99"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="category">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              placeholder="e.g. Electronics"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="stock">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Attributes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                Attributes (optional)
              </label>
              <button
                type="button"
                onClick={addAttributePair}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                + Add attribute
              </button>
            </div>

            {attributePairs.map((pair, index) => (
              <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
                <input
                  type="text"
                  value={pair.key}
                  onChange={(e) => updateAttributePair(index, "key", e.target.value)}
                  placeholder="Key (e.g. shirt color)"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={pair.value}
                  onChange={(e) => updateAttributePair(index, "value", e.target.value)}
                  placeholder="Value(s), comma separated (e.g. red, green, blue)"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => removeAttributePair(index)}
                  className="h-10 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Images ({images.length}/{MAX_IMAGES})
            </label>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {images.map((url, index) => (
                  <div key={index} className="relative group w-24 h-24">
                    <Image
                      src={url}
                      alt={`Product image ${index + 1}`}
                      fill
                      sizes="96px"
                      className="rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <CloudinaryUploadButton
              multiple
              disabled={images.length >= MAX_IMAGES}
              onUpload={handleUploadImage}
              className="flex items-center gap-2 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-100 hover:border-indigo-400 transition-colors w-full justify-center"
            >
              <span className="text-lg leading-none">+</span>
              {images.length >= MAX_IMAGES ? "Maximum images reached" : "Upload Images"}
            </CloudinaryUploadButton>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
