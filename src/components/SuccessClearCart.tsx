"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

export default function SuccessClearCart() {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
