// src/components/AddToCartButton.tsx
"use client";

import { useCart, CartItem } from "@/context/CartContext";

// El componente recibirá el artículo que se va a agregar.
// Usamos Omit para no tener que pasar la 'quantity', ya que el contexto la maneja.
type AddToCartButtonProps = {
  item: Omit<CartItem, "quantity">;
};

export default function AddToCartButton({ item }: AddToCartButtonProps) {
  // Obtenemos la función addToCart de nuestro hook personalizado
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Llamamos a la función con el artículo cuando se hace clic
    addToCart(item);
    console.log(`Agregado al carrito: ${item.nombre}`); // Opcional: para verificar en la consola
  };

  return (
    <button className="btn btn-primary" onClick={handleAddToCart}>
      Agregar al Carrito
    </button>
  );
}