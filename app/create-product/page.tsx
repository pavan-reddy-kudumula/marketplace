"use client";

import { createProduct } from "@/actions/product";
import { auth } from "@/auth";
import ProductForm, { ProductFormValues } from "@/components/ProductForm";
import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";

export default async function CreateProductPage() {
  const session = await auth();
  if(session?.user?.role === UserRole.USER) {
    return notFound();
  }
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
