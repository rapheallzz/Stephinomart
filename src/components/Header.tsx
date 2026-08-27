"use client";

import Link from "next/link";
import CartButton from "./CartButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          FIELDWORK
        </Link>
        <nav className="hidden gap-8 text-sm text-black/60 sm:flex">
          <span className="cursor-default">New Arrivals</span>
          <span className="cursor-default">Outerwear</span>
          <span className="cursor-default">Accessories</span>
        </nav>
        <CartButton />
      </div>
    </header>
  );
}
