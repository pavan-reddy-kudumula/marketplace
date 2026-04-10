"use server";

import Razorpay from "razorpay";
import { auth } from "@/auth";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(amount: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { data: null, error: "Not Authenticated" };
  }

  try {
    const options = {
      amount: Math.round(amount), // Amount in paise/cents
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return { data: order, error: null };
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return { data: null, error: "Failed to create payment order" };
  }
}
