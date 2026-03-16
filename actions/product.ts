"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

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
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        store: {
          select: {
            name: true,
          },
        },
      },
    });
    return products;
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
      !product.category?.trim() ||
      !Array.isArray(product.images) ||
      product.images.length === 0 ||
      typeof product.price !== "number" ||
      product.price <= 0 ||
      (product.stock !== undefined && product.stock < 0)
    ) {
      return { data: null, error: "Invalid product data" };
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

    if (user.stores.length === 0 || user.role !== UserRole.ADMIN) {
      return { data: null, error: "Not Authorized" };
    }

    const newProduct = await prisma.product.create({
      data: {
        name: product.name.trim(),
        description: product.description.trim(),
        price: Math.round(product.price),
        images: product.images,
        category: product.category.trim(),
        storeId: user.stores[0].id,
        stock: product.stock,
        attributes: product.attributes ?? undefined,
      },
    });

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

    if (!productData.id?.trim()) {
      return { success: false, error: "Invalid product ID" };
    }

    if (
      !productData.name?.trim() ||
      !productData.description?.trim() ||
      !productData.category?.trim() ||
      !Array.isArray(productData.images) ||
      productData.images.length === 0 ||
      typeof productData.price !== "number" ||
      productData.price <= 0 ||
      (productData.stock !== undefined && productData.stock < 0)
    ) {
      return { success: false, error: "Invalid product data" };
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        stores: {
          where: {
            isArchived: false,
          },
          select: {
            id: true,
          },
        },
        role: true,
      },
    });

    if (!currentUser) {
      return { success: false, error: "User does not exist" };
    }

    if (currentUser.stores.length === 0 || currentUser.role !== UserRole.ADMIN) {
      return { success: false, error: "You do not have a store" };
    }

    const { id, ...fields } = productData;

    await prisma.product.update({
      where: {
        id,
        storeId: currentUser.stores[0].id,
      },
      data: {
        name: fields.name.trim(),
        description: fields.description.trim(),
        price: Math.round(fields.price),
        images: fields.images,
        category: fields.category.trim(),
        stock: fields.stock,
        attributes: fields.attributes ?? undefined,
      },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in updateProduct: ", error);
    return { success: false, error: "An Unexpected error occured" };
  }
}

export async function deleteProduct(id: string) {
  try {
    if (!id?.trim()) {
      return { success: false, error: "Invalid product ID" };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        stores: {
          where: {
            isArchived: false,
          },
          select: {
            id: true,
          },
        },
        role: true,
      },
    });

    if (!currentUser) {
      return { success: false, error: "User does not exist" };
    }

    if (currentUser.role !== UserRole.ADMIN) {
      return { success: false, error: "Not authorized" };
    }

    if (currentUser.stores.length === 0) {
      return { success: false, error: "You do not have a store" };
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
        storeId: currentUser.stores[0].id,
        isArchived: false,
      },
      select: { id: true },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    await prisma.product.update({
      where: { id },
      data: { isArchived: true },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteProduct: ", error);
    return { success: false, error: "An Unexpected error occured" };
  }
}
