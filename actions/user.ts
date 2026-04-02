"use server";

import { prisma } from "@/lib/prisma";
import { auth, update } from "@/auth";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

interface UpdateUserProps {
  name?: string;
  image?: string;
}

export async function getUser() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, error: "Not Authenticated" };
    }

    const isAdmin = session?.user?.role === UserRole.ADMIN;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        stores: isAdmin
          ? {
              where: { isArchived: false },
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return { data: null, error: "User does not exist" };
    }

    return { data: user, error: null };
  } catch (error) {
    console.error("getUser error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

export async function updateUser({ name, image }: UpdateUserProps) {
  try {
    if (!name && !image) {
      return { success: false, error: "No fields to update" };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not Authenticated" };
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        image,
      },
    });

    revalidatePath("/profile");
    return { success: true, error: null };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2025") {
      return { success: false, error: "User does not exist" };
    }
    console.error("updateUser error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateUserRole() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not Authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { _count: { select: { orders: true } } },
    });

    if (!user) {
      return { success: false, error: "User does not exist" };
    }

    if (user.role === UserRole.ADMIN) {
      return { success: false, error: "User is already an admin" };
    }

    if (user._count.orders > 0) {
      return {
        success: false,
        error: "Cannot register as admin after placing orders",
      };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: UserRole.ADMIN },
    });

    await update({ user: { role: UserRole.ADMIN } });

    revalidatePath('/', 'layout');
    return { success: true, error: null };
  } catch (error) {
    console.error("updateUserRole error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}