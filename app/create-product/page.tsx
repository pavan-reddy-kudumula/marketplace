"use client";

import { createProduct } from "@/actions/product";
import ProductForm, { ProductFormValues } from "@/components/ProductForm";

export default function CreateProductPage() {
  async function handleCreate(values: ProductFormValues) {
    const result = await createProduct(values);
    return result.error ?? null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Product</h1>
        <ProductForm
          submitLabel="Create Product"
          submittingLabel="Creating..."
          onSubmit={handleCreate}
        />
      </div>
    </div>
  );
}
