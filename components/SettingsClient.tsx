"use client";

import { useState, SubmitEvent } from "react";
import { UserRole } from "@prisma/client";
import { ShieldCheck } from "lucide-react";
import { updateUserRole } from "@/actions/user";

interface SettingsClientProps {
  user: {
    id: string;
    role: UserRole;
    _count?: {
      orders: number;
    };
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user.role === UserRole.ADMIN;
  const placedOrders = user._count?.orders ?? 0;
  const canRegister = !isAdmin && placedOrders === 0;

  async function handleUpdateUserRole(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canRegister || isAdmin) return;

    setError("");
    setIsLoading(true);

    const response = await updateUserRole();

    setIsLoading(false);

    if (!response.success) {
      setError(response.error || "Unable to update role");
      return;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <ShieldCheck className="h-6 w-6 text-indigo-500" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Store Role Registration</h1>
            <p className="text-sm text-slate-500">Convert your account into an admin store profile when eligible.</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Register as Store Account</h2>
              <p className="text-sm text-slate-500">
                A user can register as store admin only if they are not already admin and have not placed any orders.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Current user role: <strong>{user.role}</strong>
              </p>
              <p className="text-sm text-slate-600">
                Orders placed: <strong>{placedOrders}</strong>
              </p>
            </div>

            <form onSubmit={handleUpdateUserRole}>
              <button
                type="submit"
                disabled={!canRegister || isLoading}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isAdmin
                    ? "cursor-not-allowed bg-green-100 text-green-700"
                    : canRegister
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "cursor-not-allowed bg-slate-200 text-slate-500"
                }`}
              >
                {isLoading ? "Updating..." : isAdmin ? "Admin" : canRegister ? "Register as Admin" : "Not eligible"}
              </button>
            </form>
          </div>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
