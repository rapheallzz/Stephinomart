import productsSeed from "@/data/products.json";
import { Product, InventorySnapshot } from "./types";

/**
 * In-memory inventory store.
 *
 * This stands in for a real database so the demo runs with zero setup.
 * It works correctly in `next dev` (single Node process) and on most
 * single-instance deployments, but will NOT stay in sync across multiple
 * serverless function instances in production.
 *
 * To make this production-real, swap the functions below for calls to
 * Postgres/Supabase/PlanetScale + a cache, or a Redis store (e.g. Upstash)
 * so stock counts are shared and atomic across instances. Keep the same
 * function signatures and nothing else in the app needs to change.
 */

declare global {
  // eslint-disable-next-line no-var
  var __inventoryStore: Map<string, Product> | undefined;
}

function getStore(): Map<string, Product> {
  if (!global.__inventoryStore) {
    global.__inventoryStore = new Map(
      (productsSeed as Product[]).map((p) => [p.id, { ...p } as Product])
    );
  }
  return global.__inventoryStore;
}

export function getAllProducts(): Product[] {
  return Array.from(getStore().values());
}

export function getProduct(id: string): Product | undefined {
  return getStore().get(id);
}

export function getSnapshot(): InventorySnapshot {
  const snapshot: InventorySnapshot = {};
  for (const p of getStore().values()) snapshot[p.id] = p.stock;
  return snapshot;
}

/**
 * Atomically reserve stock for a set of cart lines. Returns the list of
 * lines that could NOT be fully satisfied (empty array = success).
 * Because Node runs single-threaded per request in dev, this simple
 * read-check-write is safe here; a real DB would do this in a transaction
 * (e.g. `UPDATE products SET stock = stock - $qty WHERE id = $id AND stock >= $qty`).
 */
export function reserveStock(
  lines: { id: string; quantity: number }[]
): { id: string; available: number }[] {
  const store = getStore();
  const shortfalls: { id: string; available: number }[] = [];

  for (const line of lines) {
    const product = store.get(line.id);
    if (!product || product.stock < line.quantity) {
      shortfalls.push({ id: line.id, available: product?.stock ?? 0 });
    }
  }

  if (shortfalls.length > 0) return shortfalls;

  for (const line of lines) {
    const product = store.get(line.id)!;
    product.stock -= line.quantity;
    store.set(line.id, product);
  }

  return [];
}

export function restock(id: string, quantity: number): void {
  const store = getStore();
  const product = store.get(id);
  if (product) {
    product.stock += quantity;
    store.set(id, product);
  }
}
