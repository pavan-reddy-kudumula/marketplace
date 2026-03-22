import { getProduct } from "@/actions/product";
import CartItemControls from "@/components/CartItemControls";
import { ProductDeleteAction, ProductUpdateAction } from "@/components/ProductActions";
import ProductImageGallery from "@/components/ProductImageGallery";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

function formatAttributeValue(value: unknown): string {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (value === null || value === undefined) return "-";
	if (Array.isArray(value)) {
		return value
			.map((item) =>
				typeof item === "string" || typeof item === "number" || typeof item === "boolean"
					? String(item)
					: JSON.stringify(item),
			)
			.join(", ");
	}

	return JSON.stringify(value);
}

function normalizeFormAttributes(
	value: unknown,
): Record<string, string | string[]> | undefined {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return undefined;
	}

	const normalized: Record<string, string | string[]> = {};

	for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
		if (Array.isArray(raw)) {
			const values = raw
				.map((item) =>
					typeof item === "string" || typeof item === "number" || typeof item === "boolean"
						? String(item)
						: "",
				)
				.filter(Boolean);

			if (values.length > 0) {
				normalized[key] = values;
			}
			continue;
		}

		if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
			normalized[key] = String(raw);
		}
	}

	return Object.keys(normalized).length > 0 ? normalized : undefined;
}

interface ProductDetailPageProps {
	params: {
		id: string;
	};
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
	const { id } = await params;
	const session = await auth();

	if (!session?.user?.id) {
		redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/products/${id}`)}`);
	}

	const result = await getProduct(id);

	if (result.error === "product not found" || result.error === "Invalid product ID") {
		notFound();
	}

	if (!result.data) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 px-4 py-12">
				<div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
					<h1 className="text-2xl font-bold text-gray-800">Unable to load product</h1>
					<p className="mt-2 text-sm text-gray-600">
						{result.error ?? "An unexpected error occurred."}
					</p>
					<Link
						href="/products"
						className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
					>
						Back to products
					</Link>
				</div>
			</div>
		);
	}

	const product = result.data;
	const attributes =
		product.attributes && typeof product.attributes === "object" && !Array.isArray(product.attributes)
			? Object.entries(product.attributes)
			: [];
	const formAttributes = normalizeFormAttributes(product.attributes);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 px-4 py-10">
			<div className="mx-auto max-w-6xl">
				<Link href="/products" className="mb-6 inline-block text-sm font-medium text-indigo-700 hover:underline">
					← Back to products
				</Link>

				<div className="grid gap-8 rounded-2xl bg-white p-6 shadow-md md:p-8">
					<div>
						<ProductImageGallery images={product.images} productName={product.name} />
					</div>

					<div className="flex flex-col">
						<span className="mb-3 inline-flex w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
							{product.category}
						</span>
						<h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
						<p className="mt-2 text-sm text-gray-500">Sold by {product.store.name}</p>

						<p className="mt-5 text-3xl font-bold text-indigo-600">${(product.price / 100).toFixed(2)}</p>

						<div className="mt-4">
							<CartItemControls product={product} />
						</div>

						<div className="mt-6 border-t border-gray-100 pt-6">
							<h2 className="text-base font-semibold text-gray-800">Description</h2>
							<p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
								{product.description}
							</p>
						</div>

						{attributes.length > 0 && (
							<div className="mt-6 border-t border-gray-100 pt-6">
								<h2 className="text-base font-semibold text-gray-800">Attributes</h2>
								<div className="mt-3 space-y-2 text-sm">
									{attributes.map(([key, value]) => (
										<div key={key} className="flex items-start justify-between gap-4 rounded-md bg-gray-50 px-3 py-2">
											<span className="font-medium capitalize text-gray-700">{key.replace(/_/g, " ")}</span>
											<span className="text-right text-gray-600">{formatAttributeValue(value)}</span>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
							<p>
								<span className="font-semibold text-gray-800">In stock:</span>{" "}
								{product.stock > 0 ? `${product.stock} available` : "Out of stock"}
							</p>
							<p className="mt-1">
								<span className="font-semibold text-gray-800">Store:</span> {product.store.name}
							</p>
						</div>

						{product.store.userId === session.user.id && (
							<div className="mt-4 space-y-3">
								<ProductUpdateAction
									id={product.id}
									storeId={product.storeId}
									name={product.name}
									description={product.description}
									price={product.price}
									images={product.images}
									category={product.category}
									stock={product.stock}
									attributes={formAttributes}
								/>
								<ProductDeleteAction id={product.id} storeId={product.storeId} productName={product.name} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
