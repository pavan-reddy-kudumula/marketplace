"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getStore(id: string) {
  try {
    if(!id.trim()) {
      return { data: null, error: "Id cannot be empty"}
    }

    const session = await auth()
    if(!session?.user?.id) {
      return { data: null, error: "Not Authenticated" }
    }

    const store = await prisma.store.findUnique({
      where: {
        id,
        userId: session.user.id,
        isArchived: false
      },
      include: {
        products: true
      }
    })

    if(!store) {
      return { data: null, error: "store does not exist"}
    }

    return { data: store, error: null}
  } catch (error) {
      console.error("getStore error:", error)
      return { data: null, error: "An unexpected error occurred" }
  }
}

export async function createStore(name: string) {
  if (!name?.trim()) {
    return { success: false, error: "store name cannot be empty" };
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not Authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        stores: {
          where: { isArchived: false },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User does not exist" };
    }

    if (user.stores.length > 0) {
      return { success: false, error: "You already have a store" };
    }

    await prisma.$transaction([
      prisma.store.create({
        data: {
          name: name.trim(),
          userId: user.id,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.ADMIN },
      }),
    ]);

    revalidatePath("/profile")
    return { success: true, error: null };
  } catch (error: any) {
    if (error?.code === 11000) {
      return { success: false, error: "You already have a store" };
    }
    console.error("error in createStore", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function updateStore(name: string) {
  if (!name?.trim()) {
    return { success: false, error: "store name cannot be empty" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not Authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        stores: {
          where: { isArchived: false },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User does not exist" };
    }

    if (user.stores.length === 0) {
      return { success: false, error: "You do not have a store" };
    }

    if (user.role !== UserRole.ADMIN) {
      return { success: false, error: "You are not authorized" };
    }

    await prisma.store.update({
      where: { id: user.stores[0].id },
      data: {
        name: name.trim(),
      },
    });

    revalidatePath("/profile")
    return { success: true, error: null };
  } catch (error) {
    console.error("error in updateStore", error instanceof Error ? error.message : String(error));
    return { success: false, error: "Something went wrong" };
  }
}

export async function deleteStore() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not Authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        stores: {
          where: { isArchived: false },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User does not exist" };
    }

    if (user.stores.length === 0) {
      return { success: false, error: "You do not have a store" };
    }

    if (user.role !== UserRole.ADMIN) {
      return { success: false, error: "You are not authorized" };
    }

    await prisma.$transaction([
      prisma.product.updateMany({
        where: { storeId: user.stores[0].id },
        data: { isArchived: true },
      }),
      prisma.store.update({
        where: { id: user.stores[0].id },
        data: { isArchived: true },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.USER },
      }),
    ]);

    revalidatePath("/profile")
    return { success: true, error: null };
  } catch (error) {
    console.error("error in deleteStore", error);
    return { success: false, error: "Something went wrong" };
  }
}