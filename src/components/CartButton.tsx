"use client";

import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

export default function CartButton() {
  const toggle = useCartStore((s) => s.toggle);
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <button
      onClick={toggle}
      aria-label="Open cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
    >
      <ShoppingBag size={20} strokeWidth={1.75} />
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            key={totalItems}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white"
          >
            {totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
