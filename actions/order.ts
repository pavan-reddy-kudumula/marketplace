"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getOrderById(id: string) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("Not Authenticated");
    }

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: {
                select: { name: true, email: true }
            },
            orderItems: {
                include: {
                    product: {
                        include: {
                            store: { select: { name: true } }
                        }
                    }
                }
            }
        }
    });

    if (!order) {
        return null;
    }

    // Ensure the order belongs to the requesting user
    if (order.user.email !== session.user.email) {
        throw new Error("Forbidden");
    }

    return order;
}

export async function getOrders() {
    const session = await auth();
    if(!session?.user?.email) {
        throw new Error("Not Authenticated");
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        select: {
            orders: {
                select: {
                    id: true,
                    status: true,
                    isPaid: true,
                    totalPrice: true,
                    createdAt: true,
                    _count: { select: { orderItems: true } }
                },
                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    })

    if(!user) {
        throw new Error("Not Authenticated");
    }

    return user.orders;
}