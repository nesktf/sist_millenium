// src/components/ProductCard.tsx
import { ArticuloFrontend } from "@/app/e-commerce/page";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";

interface ProductCardProps {
  articulo: ArticuloFrontend;
  onAddToCart: (articulo: ArticuloFrontend) => void;
}

export const ProductCard = ({ articulo, onAddToCart }: ProductCardProps) => {
  // ruta a la imagen en /public/images
  const imagePath = `/images/${articulo.imagen}`; // correcto

  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center transition hover:shadow-lg">
      <img
        src={imagePath}
        alt={articulo.nombre}
        width={300}
        height={200}
        className="w-full h-48 object-cover rounded-lg"
      />
      <h2 className="font-semibold text-lg">{articulo.nombre}</h2>
      <p className="text-gray-700 font-medium mt-1">{formatCurrency(articulo.precio)}</p>

      <Button
        className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
        onClick={() => onAddToCart(articulo)}
      >
        Agregar al carrito
      </Button>
    </div>
  );
};
