"use client"

import { useState } from "react"
import { OrderStatus } from "@prisma/client"
import { cancelOrder, updateOrderStatus } from "@/actions/order"
import ConfirmModal from "./ConfirmModal"

interface OrderActionsClientProps {
  orderId: string
  currentStatus: OrderStatus
  canCancel: boolean
  canUpdateStatus: boolean
  nextStatuses: OrderStatus[]
}

export default function OrderActionsClient({
  orderId,
  currentStatus,
  canCancel,
  canUpdateStatus,
  nextStatuses,
}: OrderActionsClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"cancel" | "updateStatus" | null>(null)

  const handleCancelOrder = async () => {
    setIsLoading(true)
    try {
      await cancelOrder(orderId)
      setIsConfirmOpen(false)
      // Optionally refresh or redirect
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    setIsLoading(true)
    try {
      await updateOrderStatus(orderId, selectedStatus)
      setIsConfirmOpen(false)
      // Optionally refresh or redirect
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (confirmAction === "cancel") {
      await handleCancelOrder()
    } else if (confirmAction === "updateStatus") {
      await handleUpdateStatus()
    }
  }

  const handleOpenConfirm = (action: "cancel" | "updateStatus") => {
    setConfirmAction(action)
    setIsConfirmOpen(true)
  }

  if (!canCancel && !canUpdateStatus) {
    return null
  }

  return (
    <>
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3">Order Actions</h2>
        <div className="border rounded-lg px-4 py-4 space-y-4">
          {canCancel && (
            <div>
              <button
                onClick={() => handleOpenConfirm("cancel")}
                disabled={isLoading}
                className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Cancel Order
              </button>
              <p className="mt-2 text-xs text-gray-500">You can cancel this order only while it is pending.</p>
            </div>
          )}

          {canUpdateStatus && (
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm text-gray-700">
                Update Status
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  {nextStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => handleOpenConfirm("updateStatus")}
                disabled={isLoading || selectedStatus === currentStatus}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Save Status
              </button>
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        title={
          confirmAction === "cancel"
            ? "Cancel Order"
            : "Update Order Status"
        }
        message={
          confirmAction === "cancel"
            ? "Are you sure you want to cancel this order? This action cannot be undone."
            : `Are you sure you want to update the order status to ${selectedStatus}?`
        }
        color={
          confirmAction === "cancel"
            ? "red"
            : "blue"
        }
      />
    </>
  )
}
