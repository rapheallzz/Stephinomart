"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import useSWR from "swr";
import { Minus, Plus } from "lucide-react";
import { Product, InventorySnapshot } from "@/lib/types";
import { useCartStore } from "@/store/cartStore";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const { data } = useSWR<{ inventory: InventorySnapshot }>(
    "/api/inventory",
    fetcher,
    { refreshInterval: 4000 }
  );
  const stock = data?.inventory?.[product.id] ?? product.stock;
  const isOut = stock <= 0;

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 sm:grid-cols-2 sm:gap-14 sm:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black/5"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 640px) 45vw, 90vw"
          className="object-cover"
          priority
        />
      </motion.div>

      <div>
        <p className="text-xs uppercase tracking-wide text-black/40">
          {product.category}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {product.name}
        </h1>
        <p className="mt-3 text-lg font-medium">
          {formatPrice(product.price)}
        </p>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-black/60">
          {product.description}
        </p>

        <p className="mt-6 text-xs font-medium">
          {isOut ? (
            <span className="text-red-600">Out of stock</span>
          ) : stock <= 5 ? (
            <span className="text-accent">Only {stock} left in stock</span>
          ) : (
            <span className="text-black/40">In stock</span>
          )}
        </p>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-full border border-black/10 px-3 py-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="text-black/60 hover:text-black"
            >
              <Minus size={14} />
            </button>
            <span className="w-4 text-center text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              disabled={quantity >= stock}
              aria-label="Increase quantity"
              className="text-black/60 hover:text-black disabled:opacity-30"
            >
              <Plus size={14} />
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => addItem({ ...product, stock }, quantity)}
            disabled={isOut}
            className="flex-1 rounded-full bg-ink py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isOut ? "Sold out" : "Add to cart"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
