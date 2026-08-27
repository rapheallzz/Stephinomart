"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function CartDrawer() {
  const { items, isOpen, close, setQuantity, removeItem, totalPrice } =
    useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsCheckingOut(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
              <h2 className="text-base font-semibold">
                Your Cart {items.length > 0 && `(${items.length})`}
              </h2>
              <button
                onClick={close}
                aria-label="Close cart"
                className="rounded-full p-1.5 hover:bg-black/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-black/40">
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <ul className="space-y-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/5">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-tight">
                              {item.name}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-black/40 hover:text-black/70"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-black/10 px-2 py-1">
                              <button
                                onClick={() =>
                                  setQuantity(item.id, item.quantity - 1)
                                }
                                className="text-black/60 hover:text-black"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-4 text-center text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  setQuantity(item.id, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.stock}
                                className="text-black/60 hover:text-black disabled:opacity-30"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="text-sm font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-black/5 px-6 py-5">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-black/60">Subtotal</span>
                  <span className="text-base font-semibold">
                    {formatPrice(totalPrice())}
                  </span>
                </div>
                {error && (
                  <p className="mb-3 text-xs text-red-600">{error}</p>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isCheckingOut && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isCheckingOut ? "Redirecting to Stripe…" : "Checkout"}
                </button>
                <p className="mt-3 text-center text-[11px] text-black/40">
                  Secure checkout powered by Stripe
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
