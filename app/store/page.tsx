import Link from "next/link";
import { getStore } from "@/actions/store";
import { getUser } from "@/actions/user";
import ProductCard from "@/components/ProductCard";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";

interface ProductType {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  stock: number
}

export default async function StorePage() {
  const session = await auth();
  if(session?.user?.role === UserRole.USER) {
    return notFound();
  }
  
  const userResult = await getUser();
  if (userResult.error || !userResult.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Unable to load store</h1>
          <p className="text-gray-600 mt-2">
            {userResult.error || "Please log in or create a store first."}
          </p>
        </div>
      </div>
    );
  }

  const userStore = userResult.data.stores?.[0];
  if (!userStore?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No store found</h1>
          <p className="text-gray-600 mt-2">
            Create your store from profile to manage products.
          </p>
          <Link href="/profile" className="mt-4 inline-block text-blue-600">
            Go to profile
          </Link>
        </div>
      </div>
    );
  }

  const storeId = userStore.id;

  const storeResponse = await getStore(storeId);

  if (storeResponse.error || !storeResponse.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Store load error</h1>
          <p className="text-gray-600 mt-2">{storeResponse.error}</p>
        </div>
      </div>
    );
  }

  const store = storeResponse.data;
  const products = store.products as ProductType[]

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-gray-50 to-indigo-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
              <p className="text-gray-600 mt-1">Created: {new Date(store.createdAt).toLocaleString()}</p>
              <p className="text-gray-600 mt-1">Updated: {new Date(store.updatedAt).toLocaleString()}</p>
            </div>
            <div className="text-right mr-3">
              <p className="text-gray-600">Products: {store._count.products}</p>
              <p className="text-gray-600">Orders: {store._count.orders}</p>
            </div>
          </div>
        </header>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-xl font-semibold">No products yet</h2>
            <p className="text-gray-600 mt-2">Add items using "Create Product”.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storeName={store.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
