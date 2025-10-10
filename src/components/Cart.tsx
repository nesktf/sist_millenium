// src/components/Cart.tsx
import { Articulo } from "@/app/data/mockData";

interface CartProps {
  cart: Articulo[];
  onRemove: (id: number) => void;
}

export const Cart = ({ cart, onRemove }: CartProps) => {
  const total = cart.reduce((acc, item) => acc + item.precio, 0);

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">🛒 Carrito</h2>
      {cart.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between border-b py-2">
              <span>{item.nombre}</span>
              <button
                className="text-red-600"
                onClick={() => onRemove(item.id)}
              >
                Quitar
              </button>
            </div>
          ))}
          <p className="mt-4 font-semibold">Total: ${total.toLocaleString()}</p>
        </>
      )}
    </div>
  );
};
