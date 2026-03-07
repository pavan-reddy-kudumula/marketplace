"use server"

import { auth } from "@/auth"
import {prisma} from "@/lib/prisma"

export async function createStore(name: string) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("Not Authenticated");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true },
    });

    if (!user) {
        throw new Error("Not Authenticated");
    }

    if (user.store) {
        throw new Error("You already have a store!");
    }

    const newStore = await prisma.store.create({
        data: {
            name,
            userId: user.id,
        },
    });

    return newStore;
}