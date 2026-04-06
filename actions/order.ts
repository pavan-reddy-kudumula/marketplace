"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, UserRole } from "@prisma/client";

export async function getOrderById(id: string) {
  try {
    if (!id?.trim()) {
      return { data: null, error: "Invalid order ID" };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, error: "Not Authenticated" };
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: { id: true },
    });

    if (!currentUser) {
      return { data: null, error: "User does not exist" };
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        store: {
          select: { userId: true },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return { data: null, error: "Order does not exist" };
    }

    // Ensure the order belongs to the requesting user
    if (
      order.user.id !== currentUser.id &&
      order.store.userId !== currentUser.id
    ) {
      return { data: null, error: "Not Authorized" };
    }

    return { data: order, error: null };
  } catch (error) {
    console.error("error in getOrder:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

export async function getPaginatedOrders(page: number = 1, pageSize: number = 10) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, total: 0, error: "Not Authenticated" };
    }

    const skip = (page - 1) * pageSize;

    const [user, totalCount] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          orders: {
            select: {
              id: true,
              status: true,
              isPaid: true,
              totalPrice: true,
              createdAt: true,
              _count: { select: { orderItems: true } },
            },
            orderBy: {
              createdAt: "desc",
            },
            skip,
            take: pageSize,
          },
        },
      }),
      prisma.order.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    if (!user) {
      return { data: null, total: 0, error: "User does not exist" };
    }

    return { 
      data: user.orders, 
      total: totalCount,
      error: null 
    };
  } catch (error) {
    console.error("error in getPaginatedOrders:", error);
    return { data: null, total: 0, error: "An unexpected error occurred" };
  }
}

export async function getPaginatedStoreOrders(page: number = 1, pageSize: number = 10) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, total: 0, error: "Not Authenticated" };
    }

    const skip = (page - 1) * pageSize;

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        _count: { select: { stores: { where: { isArchived: false } } } },
      },
    });

    if (!currentUser) {
      return { data: null, total: 0, error: "User does not exist" };
    }

    if (currentUser._count.stores === 0) {
      return { data: null, total: 0, error: "You do not have a store" };
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: {
          store: { userId: currentUser.id, isArchived: false },
        },
        select: {
          id: true,
          status: true,
          isPaid: true,
          totalPrice: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          _count: { select: { orderItems: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.order.count({
        where: {
          store: { userId: currentUser.id, isArchived: false },
        },
      }),
    ]);

    return { data: orders, total: totalCount, error: null };
  } catch (error) {
    console.error("error in getStoreOrders:", error);
    return { data: null, total: 0, error: "An unexpected error occurred" };
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  try {
    if (!id?.trim()) {
      return { data: null, error: "Invalid order ID" };
    }

    if (!Object.values(OrderStatus).includes(status)) {
      return { data: null, error: "Invalid order status" };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, error: "Not Authenticated" };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return { data: null, error: "User does not exist" };
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        store: { select: { userId: true } },
      },
    });

    if (!order) {
      return { data: null, error: "Order not found" };
    }

    const isStoreOwner = order.store.userId === currentUser.id;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isStoreOwner && !isAdmin) {
      return { data: null, error: "Not Authorized" };
    }

    const terminalStatuses: OrderStatus[] = [
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ];
    if (terminalStatuses.includes(order.status)) {
      return {
        data: null,
        error: "Cannot update a completed or cancelled order",
      };
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return { data: updated, error: null };
  } catch (error) {
    console.error("error in updateOrderStatus:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

export async function cancelOrder(id: string) {
  try {
    if(!id.trim()) {
      return { success: false, error: "Id cannot be empty"}
    }

    const session = await auth()
    if(!session?.user?.id) {
      return { success: false, error: "Not Authenticated"}
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        isPaid: true,
        status: true,
        userId: true
        }
      })

    if(!order) {
      return { success: false, error: "Order does not exist"}
    }

    if(order.userId !== session.user.id) {
      return { success: false, error: "Not Authorized"}
    }

    if(order.status !== OrderStatus.PENDING) {
      return { success: false, error: `Order is ${order.status} and cannot cancel now.`}
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED
      }
    })

    return { success: true, error: null}
  } catch (error) {
      console.error("cancelOrder error:", error)
      return { success: false, error: "An unexpected error occurred"}
  }
}