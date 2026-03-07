"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface CheckOutProps {
    id: string;
    quantity: number;
}

export default async function CheckOut(items: CheckOutProps[]) {
    const session = await auth();
    if(!session?.user?.email) {
        throw new Error("Not Authenticated");
    }

    const products = await prisma.product.findMany({
        where: {
            id: {
                in: items.map((i) => i.id)
            }
        },
        select: {
            id: true,
            price: true
        }
    })

    const priceMap = Object.fromEntries(products.map(p => [p.id, p.price]));

    const totalCost = items.reduce((sum, item) => {
        const price = priceMap[item.id] ?? 0;
        return sum + (price * item.quantity);
    }, 0)

    const order = await prisma.order.create({
        data: {
            totalPrice: totalCost,
            user: {
                connect: {
                    email: session?.user?.email
                }
            },
            orderItems: {
                create: items.map((item) => ({
                    product: {
                        connect: { id: item.id }
                    },
                    price: priceMap[item.id],
                    quantity: item.quantity
                }))
            }
        }
    })

    console.log(order);
    
    return order.id
}