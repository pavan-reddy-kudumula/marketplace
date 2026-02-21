"use client";

import { useCart } from "@/store/cart";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCart((state) => state.items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <div>PixelMarket</div>
      <div>
        Cart: {isMounted ? totalItems : 0}
      </div>
    </nav>
  );
}