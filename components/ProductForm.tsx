"use client";

import { useState } from "react";
import Image from "next/image";
import CloudinaryUploadButton from "@/components/CloudinaryUploadButton";

const MAX_IMAGES = 5;

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
}

interface ProductFormProps {
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<string | null | undefined>;
  initialValues?: Partial<ProductFormValues>;
  onCancel?: () => void;
}

export default function ProductForm({
  submitLabel,
  submittingLabel,
  onSubmit,
  initialValues,
  onCancel,
}: ProductFormProps) {
  const [images, setImages] = useState<string[]>(initialValues?.images ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
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

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
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

    try {
      setLoading(true);
      const submitError = await onSubmit({
        name,
        description,
        price: priceRaw,
        images,
        category,
        stock: stockRaw,
      });

      if (submitError) {
        setError(submitError);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor="name">
          Product Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Wireless Headphones"
          required
          defaultValue={initialValues?.name ?? ""}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Describe your product..."
          required
          defaultValue={initialValues?.description ?? ""}
          className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor="price">
          Price (₹)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 199.99"
          required
          defaultValue={initialValues?.price !== undefined ? String(initialValues.price) : ""}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor="category">
          Category
        </label>
        <input
          id="category"
          name="category"
          type="text"
          placeholder="e.g. Electronics"
          required
          defaultValue={initialValues?.category ?? ""}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700" htmlFor="stock">
          Stock
        </label>
        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          required
          defaultValue={
            initialValues?.stock !== undefined ? String(initialValues.stock) : "0"
          }
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Images ({images.length}/{MAX_IMAGES})
        </label>

        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((url, index) => (
              <div key={index} className="group relative h-24 w-24">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="96px"
                  className="rounded-lg border border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
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
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-600 transition-colors hover:border-indigo-400 hover:bg-indigo-100"
        >
          <span className="text-lg leading-none">+</span>
          {images.length >= MAX_IMAGES ? "Maximum images reached" : "Upload Images"}
        </CloudinaryUploadButton>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? submittingLabel : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="h-11 rounded-lg border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}