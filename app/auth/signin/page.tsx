"use client"

import { SignIn } from "@/components/AuthButtons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const getErrorMessage = (error: string | null) => {
  switch (error) {
    case "OAuthAccountNotLinked":
      return "An account with this email already exists. Sign in with your existing provider first or use the same provider to link accounts.";
    case "AccessDenied":
      return "Access denied. Please choose another provider or try again.";
    default:
      return null;
  }
};

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage = getErrorMessage(error);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-slate-400">Use GitHub or magic link.</p>
          </div>
          <Link
            href="/"
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/20"
          >
            Back
          </Link>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 mb-4">
            {errorMessage}
          </div>
        ) : null}

        <SignIn />

        <p className="mt-6 text-xs text-slate-400">
          New here? Account is created automatically when you sign in.
        </p>
      </div>
    </main>
  );
}
