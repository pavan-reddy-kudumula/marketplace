import { getOrders } from "@/actions/order"
import Link from "next/link"

const STATUS_STYLES: Record<string, string> = {
    PENDING:    "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED:    "bg-purple-100 text-purple-800",
    DELIVERED:  "bg-green-100 text-green-800",
    CANCELLED:  "bg-red-100 text-red-800",
}

export default async function UserOrders() {
    const orders = await getOrders();

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg">You have no orders yet.</p>
                    <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">
                        Browse products
                    </Link>
                </div>
            ) : (
                <div className="border rounded-lg divide-y overflow-hidden">
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
            )}
        </div>
    )
}