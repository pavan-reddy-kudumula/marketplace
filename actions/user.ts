"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

interface UpdateUserProps {
    name?: string
    image?: string
}

export async function getUser() {
    try {
        const session = await auth();
        if(!session?.user?.id) {
            return { data: null, error: "Not Authenticated" }
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                stores: {
                    where: {
                        isArchived: false
                    },
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
            return { data: null, error: "User does not exist" }
        }
        
        return { data: user, error: null };
    } catch (error) {
        console.error("getUser error:", error);
        return { data: null, error: "An unexpected error occurred" };
    }
}

export async function updateUser({name, image}: UpdateUserProps) {
    try {
        if(!name && !image) {
            return { success: false, error: "No fields to update" }
        }

        const session = await auth()
        if(!session?.user?.id) {
            return { success: false, error: "Not Authenticated"}
        }

        await prisma.user.update({
            where: {
                id: session.user.id
            },
            data: {
                name,
                image
            }
        })

        return { success: true, error: null}
    } catch (error: any) {
        if(error?.code === "P2025") {
            return { success: false, error: "User does not exist"}
        }
        console.error("updateUser error:", error)
        return { success: false, error: "An unexpected error occurred" }
    }
}