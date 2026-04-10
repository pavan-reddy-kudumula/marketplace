"use client";

import { useState, useEffect } from "react";
import { createReview, updateReview, deleteReview, getUserReviewForProduct } from "@/actions/review";
import ConfirmModal from "./ConfirmModal";

interface RatingFormProps {
    productId: string;
    productName: string;
    canReview: boolean;
}

export default function RatingForm({ productId, productName, canReview }: RatingFormProps) {
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState("");
    const [existingReview, setExistingReview] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadReview = async () => {
            if (!canReview) {
                setIsLoading(false);
                return;
            }

            const result = await getUserReviewForProduct(productId);
            if (result.data) {
                setExistingReview(result.data);
                setRating(result.data.rating);
                setComment(result.data.comment || "");
            }
            setIsLoading(false);
        };

        loadReview();
    }, [productId, canReview]);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!rating) {
            setError("Please select a rating");
            return;
        }

        try {
            let result;

            if (existingReview) {
                result = await updateReview({
                    reviewId: existingReview.id,
                    rating,
                    comment: comment || undefined,
                });
            } else {
                result = await createReview({
                    productId,
                    rating,
                    comment: comment || undefined,
                });
            }

            if (result.success) {
                setSuccess(existingReview ? "Rating updated successfully!" : "Rating submitted successfully!");
                setIsEditing(false);
                // Reload the review
                const newResult = await getUserReviewForProduct(productId);
                if (newResult.data) {
                    setExistingReview(newResult.data);
                }
                setComment("");
            } else {
                setError(result.error || "Something went wrong");
            }
        } catch (err) {
            setError("An error occurred while submitting your rating");
        }
    };

    const handleDelete = async () => {
        if (!existingReview) return;
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!existingReview) return;

        setIsDeleting(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await deleteReview(existingReview.id);

            if (result.success) {
                setSuccess("Rating deleted successfully!");
                setExistingReview(null);
                setRating(null);
                setComment("");
                setShowDeleteModal(false);
            } else {
                setError(result.error || "Something went wrong");
                setShowDeleteModal(false);
            }
        } catch (err) {
            setError("An error occurred while deleting your rating");
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!canReview || isLoading) {
        if (!canReview) {
            return null;
        }
        return <div className="animate-pulse h-20 bg-gray-100 rounded" />;
    }

    return (
        <>
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Rating"
                message="Are you sure you want to delete your rating? This action cannot be undone."
                isLoading={isDeleting}
            />
            <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold text-sm mb-3">Your review helps to improve the service</h3>

            {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    {success}
                </div>
            )}

            {existingReview && !isEditing ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`text-lg ${
                                            star <= existingReview.rating
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <span className="text-sm font-medium">
                                {existingReview.rating}/5
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {new Date(existingReview.updatedAt).toLocaleDateString()}
                        </span>
                    </div>

                    {existingReview.comment && (
                        <p className="text-sm text-gray-700 italic">{existingReview.comment}</p>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsEditing(true);
                                setRating(existingReview.rating);
                                setComment(existingReview.comment || "");
                            }}
                            className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-3xl transition-colors ${
                                        star <= (rating || 0)
                                            ? "text-yellow-400 hover:text-yellow-500"
                                            : "text-gray-300 hover:text-yellow-300"
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comment (optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            maxLength={500}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {comment.length}/500 characters
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors"
                        >
                            {existingReview ? "Update Rating" : "Submit Rating"}
                        </button>
                        {existingReview && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setRating(existingReview.rating);
                                    setComment(existingReview.comment || "");
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
        </>
    );
}
