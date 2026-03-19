import { getOrderById } from "@/actions/order"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

const STATUS_STYLES: Record<string, string> = {
    PENDING:    "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED:    "bg-purple-100 text-purple-800",
    DELIVERED:  "bg-green-100 text-green-800",
    CANCELLED:  "bg-red-100 text-red-800",
}

const STATUS_DESCRIPTIONS: Record<string, string> = {
    PENDING:    "Your order has been placed and is awaiting processing.",
    PROCESSING: "Your order is being prepared.",
    SHIPPED:    "Your order is on its way.",
    DELIVERED:  "Your order has been delivered.",
    CANCELLED:  "This order has been cancelled.",
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const order = await getOrderById(id)

    if (!order) {
        notFound()
    }

    const subtotal = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            {/* Back link */}
            <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6">
                ← Back to orders
            </Link>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Order Details</h1>
                    <p className="text-sm text-gray-500 font-mono mt-1">#{order.id.slice(-12).toUpperCase()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {order.status}
                    </span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        order.isPaid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}>
                        {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                </div>
            </div>

            {/* Status message */}
            <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-gray-600 mb-6">
                {STATUS_DESCRIPTIONS[order.status]}
            </div>

            {/* Order meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-sm">
                <div>
                    <p className="text-gray-500">Date placed</p>
                    <p className="font-medium mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric"
                        })}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500">Last updated</p>
                    <p className="font-medium mt-0.5">
                        {new Date(order.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric"
                        })}
                    </p>
                </div>
                {order.paymentId && (
                    <div>
                        <p className="text-gray-500">Payment ID</p>
                        <p className="font-medium font-mono mt-0.5 truncate">{order.paymentId}</p>
                    </div>
                )}
            </div>

            {/* Items */}
            <section className="mb-8">
                <h2 className="text-base font-semibold mb-3">Items ({order.orderItems.length})</h2>
                <div className="border rounded-lg divide-y overflow-hidden">
                    {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 px-4 py-4">
                            {item.product.images[0] ? (
                                <div className="relative h-20 w-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                    <Image
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-20 w-20 flex-shrink-0 rounded bg-gray-100" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{order.store.name}</p>
                                <p className="text-sm text-gray-500">{item.product.category}</p>
                                <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                                <p className="text-xs text-gray-400">${(item.price / 100).toFixed(2)} each</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Shipping info */}
            {(order.address || order.phone) && (
                <section className="mb-8">
                    <h2 className="text-base font-semibold mb-3">Shipping Information</h2>
                    <div className="border rounded-lg px-4 py-4 text-sm space-y-1">
                        {order.address && (
                            <div className="flex gap-2">
                                <span className="text-gray-500 w-20 flex-shrink-0">Address</span>
                                <span>{order.address}</span>
                            </div>
                        )}
                        {order.phone && (
                            <div className="flex gap-2">
                                <span className="text-gray-500 w-20 flex-shrink-0">Phone</span>
                                <span>{order.phone}</span>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Price summary */}
            <section>
                <h2 className="text-base font-semibold mb-3">Price Summary</h2>
                <div className="border rounded-lg px-4 py-4 text-sm space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${(subtotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span>${(order.totalPrice / 100).toFixed(2)}</span>
                    </div>
                </div>
            </section>
        </div>
    )
}