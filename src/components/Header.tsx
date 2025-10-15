// src/components/Header.tsx
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface HeaderProps {
  cartCount: number;
}

export const Header = ({ cartCount }: HeaderProps) => {
  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Millenium Store</h1>
      <Link
        href="/carrito"
        className="relative flex items-center justify-center rounded-full border border-transparent p-2 hover:border-white transition"
        aria-label="Ir al carrito"
      >
        <ShoppingCart size={28} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2">
            {cartCount}
          </span>
        )}
      </Link>
    </header>
  );
};
