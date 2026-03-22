"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct, updateProduct } from "@/actions/product";
import ConfirmModal from "@/components/ConfirmModal";
import ProductForm, { ProductFormValues } from "@/components/ProductForm";

interface ProductDeleteActionProps {
	id: string;
	productName: string;
	storeId: string;
}

interface ProductUpdateActionProps {
	id: string;
	storeId: string;
	name: string;
	description: string;
	price: number;
	images: string[];
	category: string;
	stock: number;
	attributes?: Record<string, string | string[]>;
}

export function ProductUpdateAction({
	id,
	storeId,
	name,
	description,
	price,
	images,
	category,
	stock,
	attributes,
}: ProductUpdateActionProps) {
	const [isEditing, setIsEditing] = useState(false);

	async function handleUpdate(values: ProductFormValues) {
		const trimmedId = id.trim();
		const trimmedStoreId = storeId.trim();

		if (!trimmedId) {
			return "Id should not be empty";
		}

		if (!trimmedStoreId) {
			return "storeId should not be empty";
		}

		const response = await updateProduct({
			...values,
			id: trimmedId,
			storeId: trimmedStoreId,
		});

		if (!response.success) {
			return response.error || "Failed to update product";
		}

		setIsEditing(false);
		return null;
	}

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-gray-800">Manage product</h3>
				<button
					type="button"
					onClick={() => setIsEditing((prev) => !prev)}
					className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
				>
					{isEditing ? "Close editor" : "Update product"}
				</button>
			</div>

			{isEditing && (
				<div className="mt-4 border-t border-gray-100 pt-4">
					<ProductForm
						submitLabel="Update Product"
						submittingLabel="Updating..."
						onSubmit={handleUpdate}
						onCancel={() => setIsEditing(false)}
						initialValues={{
							name,
							description,
							price: price / 100,
							images,
							category,
							stock,
							attributes,
						}}
					/>
				</div>
			)}
		</div>
	);
}

export function ProductDeleteAction({ id, productName, storeId }: ProductDeleteActionProps) {
	const router = useRouter();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isDeletingProduct, setIsDeletingProduct] = useState(false);
	const [deleteProductError, setDeleteProductError] = useState("");

	async function handleDeleteAction() {
		const trimmedId = id.trim();
		const trimmedStoreId = storeId.trim();
		if (!trimmedId) {
			setDeleteProductError("Id should not be empty");
			return;
		}

		if (!trimmedStoreId) {
			setDeleteProductError("storeId should not be empty");
			return;
		}

		setIsDeletingProduct(true);
		setDeleteProductError("");

		try {
			const response = await deleteProduct(trimmedId, trimmedStoreId);
			if (!response.success) {
				setDeleteProductError(response.error || "Failed to delete product");
				return;
			}

			router.push("/products");
			router.refresh();
		} catch (error) {
			setDeleteProductError(error instanceof Error ? error.message : "Failed to delete product");
		} finally {
			setIsDeletingProduct(false);
			setIsDeleteModalOpen(false);
		}
	}

	return (
		<>
			<button
				onClick={() => {
					setDeleteProductError("");
					setIsDeleteModalOpen(true);
				}}
				disabled={isDeletingProduct}
				className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
			>
				{isDeletingProduct ? "Deleting..." : "Delete product"}
			</button>

			{deleteProductError && <p className="mt-2 text-sm text-red-600">{deleteProductError}</p>}

			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDeleteAction}
				title="Delete Product"
				message={`Are you sure you want to delete \"${productName}\"? This action cannot be undone.`}
				isLoading={isDeletingProduct}
			/>
		</>
	);
}
