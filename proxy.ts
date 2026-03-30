import { auth } from "@/auth"
 
export const proxy = auth((req) => {
  // Redirect unauthenticated users to the custom sign-in page.
  // Keep this path out of the redirect target to avoid an infinite loop.
  if (!req.auth && req.nextUrl.pathname !== "/auth/signin") {
    const newUrl = new URL("/auth/signin", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})
 
export const config = {
  matcher: ["/create-product", "/store", "/profile", "/orders/:id*"],
}