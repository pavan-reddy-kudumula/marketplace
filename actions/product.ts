"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

interface ProductType {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  attributes?: JsonValue;
}

interface SearchParams {
  category: string | undefined;
  search: string | undefined;
}

interface UpdateProductProps extends ProductType {
  id: string;
  storeId: string;
}

export async function getProducts({ category, search }: SearchParams) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        category: {
          equals: category,
          mode: "insensitive",
        },
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        category: true,
        description: true,
        stock: true,
        store: {
          select: {
            name: true,
          },
        },
      },
    });
    return { data: products, error: null };
  } catch (error) {
    console.error("Error in getProducts: ", error);
    return { data: null, error: "An Unexpected error occured" };
  }
}

export async function getProduct(id: string) {
  try {
    if (!id?.trim()) {
      return { data: null, error: "Invalid product ID" };
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
        isArchived: false,
      },
      include: {
        store: {
          select: {
            name: true,
            userId: true,
          },
        },
      },
    });

    if (!product) {
      return { data: null, error: "product not found" };
    }
    return { data: product, error: null };
  } catch (error) {
    console.error("Error in getProduct: ", error);
    return { data: null, error: "An Unexpected error occured" };
  }
}

export async function createProduct(product: ProductType) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, error: "Not Authenticated" };
    }

    if (
      !product.name?.trim() ||
      !product.description?.trim() ||
      !product.category?.trim()
    ) {
      return {
        success: false,
        error: "Name, description, and category are required.",
      };
    }
    if (!Array.isArray(product.images) || product.images.length === 0) {
      return { success: false, error: "Please upload at least one image." };
    }
    if (typeof product.price !== "number" || product.price <= 0) {
      return { success: false, error: "Price must be greater than zero." };
    }
    if (product.stock !== undefined && product.stock < 0) {
      return { success: false, error: "Stock cannot be negative." };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
        stores: {
          where: {
            isArchived: false,
          },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return { data: null, error: "User does not exist" };
    }
    
    if (user.role !== UserRole.ADMIN) {
      return { data: null, error: "Not Authorized" };
    }

    if (user.stores.length === 0) {
       return { data: null, error: "You do not have a store" };
    } 

    const newProduct = await prisma.product.create({
      data: {
        name: product.name.trim(),
        description: product.description.trim(),
        price: Math.round(product.price * 100),
        images: product.images,
        category: product.category.trim(),
        storeId: user.stores[0].id,
        stock: product.stock,
        attributes: product.attributes ?? undefined,
      },
    });

    revalidatePath("/products");
    return { data: newProduct, error: null };
  } catch (error) {
    console.error("Error in createProduct: ", error);
    return { data: null, error: "An Unexpected error occured" };
  }
}

export async function updateProduct(productData: UpdateProductProps) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    if (!productData.id?.trim() || !productData.storeId?.trim()) {
      return {
        success: false,
        error: "Missing product or store identification.",
      };
    }
    if (
      !productData.name?.trim() ||
      !productData.description?.trim() ||
      !productData.category?.trim()
    ) {
      return {
        success: false,
        error: "Name, description, and category are required.",
      };
    }
    if (!Array.isArray(productData.images) || productData.images.length === 0) {
      return { success: false, error: "Please upload at least one image." };
    }
    if (typeof productData.price !== "number" || productData.price <= 0) {
      return { success: false, error: "Price must be greater than zero." };
    }
    if (productData.stock !== undefined && productData.stock < 0) {
      return { success: false, error: "Stock cannot be negative." };
    }

    // We check if THIS specific store belongs to the user, and check their role.
    const storeAuthCheck = await prisma.store.findUnique({
      where: {
        id: productData.storeId,
        userId: session.user.id,
        isArchived: false,
      },
      select: {
        id: true,
        user: {
          select: { role: true },
        },
      },
    });

    if (!storeAuthCheck) {
      console.warn(`User ${session.user.id} attempted to update product in unowned store ${productData.storeId}`);
      return { success: false, error: "Store not found or access denied." };
    }

    if (storeAuthCheck.user.role !== UserRole.ADMIN) {
      console.warn(`Non-admin ${session.user.id} attempted to update a product.`);
      return { success: false, error: "You do not have permission to update products." };
    }

    const { id, storeId, ...fields } = productData;

    await prisma.product.update({
      where: {
        id,
        storeId
      },
      data: {
        name: fields.name.trim(),
        description: fields.description.trim(),
        price: Math.round(fields.price * 100),
        images: fields.images,
        category: fields.category.trim(),
        stock: fields.stock,
        attributes: fields.attributes ?? undefined,
      },
    });

    revalidatePath("/products");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in updateProduct: ", error);
    return { success: false, error: "An Unexpected error occured" };
  }
}

export async function deleteProduct(id: string, storeId: string) {
  try {
    if (!id?.trim() || !storeId?.trim()) {
      return { success: false, error: "Missing required information" };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // QUERY 1: Check ONLY the specific store and user role (Highly optimized)
    const storeAuthCheck = await prisma.store.findUnique({
      where: {
        id: storeId,
        userId: session.user.id, // Ensures the user actually owns THIS store
        isArchived: false,
      },
      select: {
        id: true,
        user: {
          select: { role: true }, // Only fetch the role, nothing else
        },
      },
    });

    // Exact error handling for logging
    if (!storeAuthCheck) {
      console.warn(
        `User ${session.user.id} tried to modify unowned store ${storeId}`,
      );
      return { success: false, error: "Store not found or access denied." };
    }

    if (storeAuthCheck.user.role !== UserRole.ADMIN) {
      console.warn(`Non-admin ${session.user.id} attempted to delete product`);
      return { success: false, error: "Admin access required." };
    }

    // QUERY 2: Proceed with the exact update
    await prisma.product.update({
      where: {
        id: id,
        storeId: storeId,
        isArchived: false,
      },
      data: { isArchived: true },
    });

    revalidatePath("/products");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteProduct: ", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}