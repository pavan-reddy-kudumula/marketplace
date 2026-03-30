"use client"

import { loginAction, logoutAction } from "@/actions/auth"
import { LogIn, LogOut, Mail } from "lucide-react"

export function SignIn() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      {/* GitHub Login - Existing logic */}
      <form action={() => loginAction("github")} className="w-full">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 ring-1 ring-inset ring-white/10 transition-all hover:bg-slate-700 hover:text-white hover:ring-cyan-500/50"
        >
          <LogIn className="h-4 w-4 text-cyan-500" />
          Sign in with GitHub
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-700"></div>
        <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase">Or</span>
        <div className="flex-grow border-t border-slate-700"></div>
      </div>

      {/* Magic Link Login */}
      <form action={(formData) => loginAction("resend", formData)} className="flex flex-col gap-2">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-cyan-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]"
        >
          Send Magic Link
        </button>
      </form>
    </div>
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