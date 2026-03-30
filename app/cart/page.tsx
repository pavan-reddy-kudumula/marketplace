import CartClient from "@/components/CartClient";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";

export default async function CartPage() {
  const session = await auth();
  if(session?.user?.role === UserRole.ADMIN) {
    return notFound();
  }
  return <CartClient />;
}