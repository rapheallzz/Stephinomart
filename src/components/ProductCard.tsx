"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/types";
import { useCartStore } from "@/store/cartStore";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function ProductCard({
  product,
  liveStock,
}: {
  product: Product;
  liveStock?: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const stock = liveStock ?? product.stock;
  const isOut = stock <= 0;
  const isLow = stock > 0 && stock <= 5;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col"
    >
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-black/5"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isOut && (
          <span className="absolute left-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-medium text-white">
            Sold out
          </span>
        )}
        {isLow && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-white">
            Only {stock} left
          </span>
        )}
      </Link>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-sm font-medium leading-tight hover:underline">
              {product.name}
            </h3>
          </Link>
          <p className="mt-0.5 text-xs text-black/40">{product.category}</p>
        </div>
        <span className="whitespace-nowrap text-sm font-medium">
          {formatPrice(product.price)}
        </span>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => addItem({ ...product, stock }, 1)}
        disabled={isOut}
        className="mt-3 w-full rounded-full border border-black/10 py-2.5 text-xs font-medium transition-colors hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/5 disabled:text-black/30 disabled:hover:bg-transparent"
      >
        {isOut ? "Sold out" : "Add to cart"}
      </motion.button>
    </motion.div>
  );
}
