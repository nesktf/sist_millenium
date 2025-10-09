// src/components/Header.tsx
import { ShoppingCart } from "lucide-react";

interface HeaderProps {
  cartCount: number;
}

export const Header = ({ cartCount }: HeaderProps) => {
  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Millenium Store</h1>
      <div className="relative">
        <ShoppingCart size={28} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2">
            {cartCount}
          </span>
        )}
      </div>
    </header>
  );
};
