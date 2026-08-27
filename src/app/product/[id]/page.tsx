import { notFound } from "next/navigation";
import { getAllProducts, getProduct } from "@/lib/inventory";
import ProductDetail from "@/components/ProductDetail";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: p.id }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProduct(params.id);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
