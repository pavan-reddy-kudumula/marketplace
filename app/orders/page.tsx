import { getPaginatedOrders, getPaginatedStoreOrders } from "@/actions/order"
import Link from "next/link"
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

const STATUS_STYLES: Record<string, string> = {
    PENDING:    "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED:    "bg-purple-100 text-purple-800",
    DELIVERED:  "bg-green-100 text-green-800",
    CANCELLED:  "bg-red-100 text-red-800",
}

const PAGE_SIZE = 10;

async function OrdersList({ page }: { page: number }) {
    const session = await auth();
    const isAdmin = session?.user?.role === UserRole.ADMIN;
    const result = isAdmin ? 
        await getPaginatedStoreOrders(page, PAGE_SIZE) :
        await getPaginatedOrders(page, PAGE_SIZE)
    
    if (result.error) {
        return (
            <div className="text-center py-10 text-red-500">
                <p>{result.error}</p>
            </div>
        )
    }

    const orders = result.data || [];
    const total = result.total || 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    if (orders.length === 0 && page === 1) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p className="text-lg">You have no orders yet.</p>
                {!isAdmin && <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">
                    Browse products
                </Link> }
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-2">{isAdmin ? "Store Orders" : "My Orders"}</h1>
            <p className="text-sm text-gray-500 mb-6">Total: {total} orders</p>

            <div className="border rounded-lg divide-y overflow-hidden mb-6">
                {orders.map((order) => (
                    <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
                    >
                        {/* Left: ID + date */}
                        <div>
                            <p className="text-sm font-mono font-medium text-gray-900">
                                #{order.id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric", month: "short", day: "numeric"
                                })}
                            </p>
                        </div>

                        {/* Middle: item count + badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500">
                                {order._count.orderItems} {order._count.orderItems === 1 ? "item" : "items"}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                                {order.status}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                order.isPaid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                            }`}>
                                {order.isPaid ? "Paid" : "Unpaid"}
                            </span>
                        </div>

                        {/* Right: total + arrow */}
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">${(order.totalPrice / 100).toFixed(2)}</span>
                            <span className="text-gray-400 text-sm">›</span>
                        </div>
                    </Link>
                ))}
            </div>

            {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} />}
        </div>
    )
}

function PaginationControls({ page, totalPages }: { page: number; totalPages: number }) {
    const renderPaginationLinks = () => {
        const links: ReactNode[] = [];
        const maxVisible = 5;
        let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            links.push(
                <Link
                    key="1"
                    href={`?page=1`}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                    1
                </Link>
            );
            if (startPage > 2) {
                links.push(<span key="ellipsis-start" className="px-2">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            links.push(
                <Link
                    key={i}
                    href={`?page=${i}`}
                    className={`px-2 py-1 border rounded ${
                        i === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "hover:bg-gray-100"
                    }`}
                >
                    {i}
                </Link>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                links.push(<span key="ellipsis-end" className="px-2">...</span>);
            }
            links.push(
                <Link
                    key={totalPages}
                    href={`?page=${totalPages}`}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                    {totalPages}
                </Link>
            );
        }

        return links;
    };

    return (
        <div className="flex items-center justify-center gap-2">
            {page > 1 && (
                <Link
                    href={`?page=${page - 1}`}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    Previous
                </Link>
            )}
            {renderPaginationLinks()}
            {page < totalPages && (
                <Link
                    href={`?page=${page + 1}`}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                    Next
                </Link>
            )}
        </div>
    );
}

export default async function Orders({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const params = await searchParams;
    const parsedPage = Number.parseInt(params.page ?? "1", 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    return <OrdersList page={page} />
}