"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import Orders from "@/app/orders/page";

interface ReviewProps {
    rating: number;
    comment?: string;
}

interface CreateReviewProps extends ReviewProps {
    productId: string;
}

interface UpdateReviewProps extends ReviewProps {
    reviewId: string;
}

export async function getProductReviews(productId: string) {
    try {
        if(!productId?.trim()) {
            return { data: null, error: "productId cannot be empty" }
        }

        const reviews = await prisma.review.findMany({
            where: {
                productId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return { data: reviews, error: null }
    } catch (error: any) {
        console.error("getProductReviews error:", error)
        return { data: null, error: "An unexpected error occurred" }
    }
}

export async function getUserReviewForProduct(productId: string) {
    try {
        if(!productId?.trim()) {
            return { data: null, error: "productId cannot be empty" }
        }

        const session = await auth()

        if(!session?.user?.id) {
            return { data: null, error: null }  // Not authenticated, return no review
        }

        const review = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId
                }
            }
        })

        return { data: review, error: null }
    } catch (error: any) {
        console.error("getUserReviewForProduct error:", error)
        return { data: null, error: "An unexpected error occurred" }
    }
}

export async function canReviewProduct(productId: string) {
    try {
        if(!productId?.trim()) {
            return { success: false, error: "productId cannot be empty" }
        }

        const session = await auth()

        if(!session?.user?.id) {
            return { success: false, error: null }  // Not authenticated, return no review
        }

        const orders = await prisma.order.findFirst({
            where: {
                userId: session.user.id,
                status: OrderStatus.DELIVERED,
                orderItems: {
                    some: {
                        productId
                    }
                }
            },
            select: { id: true }
        })

        if(!orders) {
            return { success: false, error: "Cannot review" }
        }
        
        return { success: true, error: null }
    } catch (error) {
        return { success: false, error: "An unexpected error occured" }
    }
}

export async function createReview({productId, rating, comment}: CreateReviewProps) {
    try {
        if(!productId?.trim()) {
            return { success: false, error: "productId cannot be empty" }
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return { success: false, error: "rating must be an integer from 1 to 5" }
        }

        const session = await auth()

        if(!session?.user?.id) {
            return { success: false, error: "Not Authenticated" }
        }

        await prisma.review.create({
            data: {
                userId: session.user.id,
                productId: productId.trim(),
                rating,
                comment: comment?.trim() || undefined
            }
        })
        
        revalidatePath(`/products/${productId}`)
        return { success: true, error: null }
    } catch (error) {
        console.error("createReview error:", error)
        return { success: false, error: "An unexpected error occurred" }
    }
}

export async function updateReview({reviewId, rating, comment}: UpdateReviewProps) {
    try {
        if(!reviewId?.trim()) {
            return { success: false, error: "reviewId cannot be empty" }
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return { success: false, error: "rating must be an integer from 1 to 5" }
        }

        const session = await auth()

        if(!session?.user?.id) {
            return { success: false, error: "Not Authenticated" }
        }

        await prisma.review.update({
            where: {
                id: reviewId,
                userId: session.user.id
            },
            data: {
                rating,
                comment: comment?.trim() || undefined
            }
        })
        
        return { success: true, error: null }

    } catch (error: any) {
        console.error("updateReview error:", error)
        if (error?.code === "P2025") {
            return { success: false, error: "Review not found or not authorized" }
        }
        return { success: false, error: "An unexpected error occurred" }
    }
}

export async function deleteReview(id: string) {
    try {
        if(!id?.trim()) {
            return { success: false, error: "id cannot be empty" }
        }

        const session = await auth()

        if(!session?.user?.id) {
            return { success: false, error: "Not Authenticated" }
        }

        await prisma.review.delete({
            where: {
                id,
                userId: session.user.id
            }
        })
        
        return { success: true, error: null }
    } catch (error: any) {
        console.error("deleteReview error:", error)
        if (error?.code === "P2025") {
            return { success: false, error: "Review not found or not authorized" }
        }
        return { success: false, error: "An unexpected error occurred" }
    }
}