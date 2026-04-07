"use client";

import { useCart } from "@/store/cart";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { SignOut } from "./AuthButtons";
import { Session } from "next-auth";
import Image from "next/image";
import { Plus, ChevronDown, User, Settings } from "lucide-react";

export default function Navbar({ session }: { session: Session | null }) {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCart((state) => state.items);
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-indigo-600">PixelMarket</div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/products" className="navbar-item">
            Products
          </Link>
          {isAdmin && (
            <Link href="/store" className="navbar-item">
              Store
            </Link>
          )}
          {!isAdmin && (
            <Link
              href="/cart"
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <span className="bg-indigo-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
                {isMounted ? items.length : 0}
              </span>
            </Link>
          )}
          {session?.user ? (
            <div className="flex items-center gap-4">
              {/* Primary Action Button - Admin only, Users see orders */}
              {isAdmin && (
                <Link href="/create-product" className="navbar-item">
                  <Plus className="h-4 w-4" />
                  <span>Create Product</span>
                </Link>
              )}
              <Link href="/orders" className="navbar-item">
                <span>{isAdmin ? "Store Orders" : "My Orders"}</span>
              </Link>

              <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />

              {/* --- USER DROPDOWN --- */}
              <div className="group relative">
                <button className="flex items-center gap-2 outline-none">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 shadow-sm transition-all group-hover:border-cyan-500/50">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {(session?.user?.name || session?.user?.email)?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Subtle chevron indicating dropdown */}
                  <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {/* Dropdown Card */}
                {/* 'pt-2' creates a gap, 'invisible bridge' ensures mouse doesn't lose focus */}
                <div className="absolute right-0 top-full w-60 pt-2 z-50 opacity-0 invisible translate-y-2 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl ring-1 ring-black/5">
                    {/* User Header */}
                    <div className="border-b border-white/5 bg-white/5 px-4 py-3">
                      <p className="truncate text-sm font-medium text-white">
                        {session.user.name || "User"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {session.user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-1">
                      <Link
                        href="/profile"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </div>
                    <div className="p-1 w-full">
                      <SignOut />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden h-5 w-px bg-white/10 md:block" />

              <Link
                href="/auth/signin"
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
