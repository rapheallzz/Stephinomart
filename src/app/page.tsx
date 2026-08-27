import { getAllProducts } from "@/lib/inventory";
import ProductGrid from "@/components/ProductGrid";

export default function HomePage() {
  const products = getAllProducts();

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24">
      <section className="py-16 sm:py-24">
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Everyday gear, built to last.
        </h1>
        <p className="mt-4 max-w-md text-black/60">
          Durable essentials for people who are hard on their things.
          Small-batch, restocked often.
        </p>
      </section>

      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-black/50">
            All products
          </h2>
          <span className="text-xs text-black/40">
            {products.length} items
          </span>
        </div>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
