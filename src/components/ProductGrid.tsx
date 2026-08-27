"use client";

import useSWR from "swr";
import { Product, InventorySnapshot } from "@/lib/types";
import ProductCard from "./ProductCard";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProductGrid({ products }: { products: Product[] }) {
  // Polls every 4s so stock counts reflect other shoppers checking out
  // elsewhere, without a full page reload. Swap to a WebSocket/SSE
  // subscription for push-based updates instead of polling.
  const { data } = useSWR<{ inventory: InventorySnapshot }>(
    "/api/inventory",
    fetcher,
    { refreshInterval: 4000 }
  );

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          liveStock={data?.inventory?.[product.id]}
        />
      ))}
    </div>
  );
}
