"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { User } from "@prisma/client";

export async function getUser(): Promise<User> {
    const session = await auth();
    const email = session?.user?.email; 
    if(!email) {
        throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            store: {
                select : {
                    id: true,
                    name: true,
                }
            },
            _count: {
                select: {
                    orders: true
                }
            }
        }
    })

    if(!user) {
        throw new Error("User not found in database");
    }
    
    console.log('getUser: Found user:', user);
    return user;
}