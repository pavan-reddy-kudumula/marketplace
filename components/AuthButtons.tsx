"use client"

import { loginAction, logoutAction } from "@/actions/auth"
 
export function SignIn() {
  return (
    <form action={() => loginAction()}>
      <button 
        type="submit"
      >
        Sign in
      </button>
    </form>
  )
}
 
export function SignOut() {
  return (
    <form action={logoutAction}>
      <button 
        type="submit"
      >
        Sign Out
      </button>
    </form>
  )
}