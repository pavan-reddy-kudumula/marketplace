"use client";

import { useEffect, useState } from "react";
import { getProductReviews } from "@/actions/review";

interface RatingsDisplayProps {
    productId: string;
    currentUserId?: string | null;
}

export default function RatingsDisplay({ productId, currentUserId }: RatingsDisplayProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [avgRating, setAvgRating] = useState(0);

    useEffect(() => {
        const loadReviews = async () => {
            const result = await getProductReviews(productId);
            if (result.data) {
                setReviews(result.data);
                if (result.data.length > 0) {
                    const avg = result.data.reduce((sum, review) => sum + review.rating, 0) / result.data.length;
                    setAvgRating(avg);
                }
            } else if (result.error) {
                setError(result.error);
            }
            setIsLoading(false);
        };

        loadReviews();
    }, [productId]);

    if (isLoading) {
        return <div className="animate-pulse h-40 bg-gray-100 rounded" />;
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No ratings yet. Be the first to rate this product!</p>
            </div>
        );
    }

    const currentUserReview = currentUserId ? reviews.find(r => r.user.id === currentUserId) : null;
    const otherReviews = currentUserId ? reviews.filter(r => r.user.id !== currentUserId) : reviews;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div>
                    <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`text-2xl ${
                                    star <= Math.round(avgRating)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                }`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600">
                        {avgRating.toFixed(1)} out of 5 ({reviews.length} {reviews.length === 1 ? "rating" : "ratings"})
                    </p>
                </div>
            </div>

            <div className="space-y-3 mt-6">
                {currentUserReview && (
                    <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                    {currentUserReview.user.image && (
                                        <img
                                            src={currentUserReview.user.image}
                                            alt={currentUserReview.user.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">{currentUserReview.user.name || "Anonymous"}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {new Date(currentUserReview.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`text-lg ${
                                            star <= currentUserReview.rating
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>

                        {currentUserReview.comment && (
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {currentUserReview.comment}
                            </p>
                        )}
                    </div>
                )}

                {otherReviews.length > 0 && (
                    <>
                        {currentUserReview && (
                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-sm text-gray-500">Other Ratings</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                        )}
                        {otherReviews.map((review) => (
                            <div key={review.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-3 flex-1">
                                        {review.user.image && (
                                            <img
                                                src={review.user.image}
                                                alt={review.user.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{review.user.name || "Anonymous"}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric"
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`text-lg ${
                                                    star <= review.rating
                                                        ? "text-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {review.comment && (
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
