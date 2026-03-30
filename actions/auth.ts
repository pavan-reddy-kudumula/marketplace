"use server"

import { signIn, signOut } from "@/auth" 

export async function loginAction(provider: "github" | "resend", formData?: FormData) {
    if (provider === "resend") {
        const email = formData?.get("email") as string;
        await signIn("resend", { email, redirectTo: "/" });
    } else {
        await signIn("github", { redirectTo: "/"});
    }
}

export async function logoutAction() {
    await signOut();
}