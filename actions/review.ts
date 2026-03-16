"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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