"use client"

import { loginAction, logoutAction } from "@/actions/auth"
import { LogIn, LogOut } from "lucide-react"

export function SignIn() {
  return (
    <form action={() => loginAction()} className="w-full">
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 ring-1 ring-inset ring-white/10 transition-all hover:bg-slate-700 hover:text-white hover:ring-cyan-500/50 hover:shadow-[0_0_10px_-2px_rgba(6,182,212,0.5)]"
      >
        <LogIn className="h-4 w-4 text-cyan-500" />
        Sign in
      </button>
    </form>
  )
}

export function SignOut() {
  return (
    <form action={logoutAction} className="w-full">
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </form>
  )
}