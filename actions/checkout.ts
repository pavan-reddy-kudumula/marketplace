"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CheckOutProps {
  id: string;
  quantity: number;
}

interface CheckOutOptions {
  paymentId?: string;
}

export default async function CheckOut(
  items: CheckOutProps[],
  options?: CheckOutOptions,
) {
  try {
    const paymentId = options?.paymentId?.trim() || null;

    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, error: "Not Authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      return { data: null, error: "user does not exist" };
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((i) => i.id) },
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        price: true,
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        stock: true,
      },
    });

    if (products.length !== items.length) {
      return { data: null, error: "One or more products are unavailable" };
    }

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    // Validate stock before creating any orders
    for (const item of items) {
      if (productMap[item.id].stock < item.quantity) {
        return {
          data: null,
          error: "Insufficient stock for one or more items",
        };
      }
    }

    // Group cart items by store
    const itemsByStore = items.reduce<Record<string, CheckOutProps[]>>(
      (acc, item) => {
        const { store } = productMap[item.id];
        if (!acc[store.id]) {
          acc[store.id] = [];
        }
        acc[store.id].push(item);
        return acc;
      },
      {},
    );

    const createdOrderIds = await prisma.$transaction(async (tx) => {
      const orderIds: string[] = [];

      for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
        const totalPrice = storeItems.reduce(
          (sum, item) => sum + productMap[item.id].price * item.quantity,
          0,
        );

        const order = await tx.order.create({
          data: {
            totalPrice,
            isPaid: Boolean(paymentId),
            paymentId,
            userId: user.id,
            storeId,
            storeName: productMap[storeItems[0].id].store.name,
            orderItems: {
              create: storeItems.map((item) => ({
                productId: item.id,
                productName: productMap[item.id].name,
                price: productMap[item.id].price,
                quantity: item.quantity,
              })),
            },
          },
        });

        orderIds.push(order.id);
      }

      // Atomically decrement stock for all purchased products
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return orderIds;
    });

    return { data: createdOrderIds, error: null };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      data: null,
      error: "An unexpected error occurred during checkout",
    };
  }
}