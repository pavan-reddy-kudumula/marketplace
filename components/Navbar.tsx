"use client";

import { useCart } from "@/store/cart";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { SignIn, SignOut } from "./auth-buttons";
import { Session } from "next-auth";
import Image from "next/image";
import { LogIn, Plus, LogOut, ChevronDown, User } from "lucide-react";

export default function Navbar({ session }: { session: Session | null }) {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCart((state) => state.items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-indigo-600">PixelMarket</div>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            <span className="bg-indigo-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
              {isMounted ? items.length : 0}
            </span>
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-4">
              {/* Primary Action Button */}
              <Link
                href="/create-product"
                className="hidden items-center gap-1.5 rounded-full bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-400 ring-1 ring-inset ring-cyan-500/20 transition-all hover:bg-cyan-500 hover:text-white md:flex"
              >
                <Plus className="h-4 w-4" />
                <span>Create</span>
              </Link>

              <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />

              {/* --- USER DROPDOWN --- */}
              <div className="group relative">
                <button className="flex items-center gap-2 outline-none">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 shadow-sm transition-all group-hover:border-cyan-500/50">
                    <Image
                      src={session.user.image || "/avatar.png"}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Subtle chevron indicating dropdown */}
                  <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {/* Dropdown Card */}
                {/* 'pt-2' creates a gap, 'invisible bridge' ensures mouse doesn't lose focus */}
                <div className="absolute right-0 top-full w-60 pt-2 opacity-0 invisible translate-y-2 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
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
                    </div>
                    <div className="p-1">
                      {/* Assuming SignOut renders a button, we wrap it to style standardly */}
                      <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 cursor-pointer">
                        <LogOut className="h-4 w-4" />
                        <div className="w-full text-left">
                          <SignOut />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Optional: Vertical Divider to separate from other links */}
              <div className="hidden h-5 w-px bg-white/10 md:block" />

              {/* The Sign In "Button" Wrapper */}
              <div className="group flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 ring-1 ring-inset ring-white/10 transition-all hover:bg-slate-700 hover:text-white hover:ring-cyan-500/50 hover:shadow-[0_0_10px_-2px_rgba(6,182,212,0.5)]">
                <LogIn className="h-4 w-4 text-cyan-500 transition-transform duration-300 group-hover:-translate-x-0.5" />

                {/* NOTE: Ensure your <SignIn /> component renders a button 
                        with a transparent background or just plain text.
                    */}
                <SignIn />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
