// src/components/ProductGrid.tsx
import { ArticuloFrontend } from "@/app/e-commerce/page";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  articulos: ArticuloFrontend[];
  onAddToCart: (articulo: ArticuloFrontend) => void;
}

export const ProductGrid = ({ articulos, onAddToCart }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
      {articulos.map((a) => (
        <ProductCard key={a.id} articulo={a} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};
