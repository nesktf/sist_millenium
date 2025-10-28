// src/context/CartContext.tsx
"use client"; // Muy importante, ya que usaremos hooks de estado y efectos.

import { useAuth } from "@/lib/auth_ctx";
import { createContext, useState, useContext, ReactNode, useMemo } from "react";

// Primero, definimos la estructura de un artículo en el carrito.
// Será tu tipo "Articulo" de Prisma más la cantidad.
// **Asegúrate de que este tipo coincida con tu modelo Articulo de Prisma**
// (con los campos de precio e imagen que sugerí).
export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl?: string | null; // Puede ser opcional
  quantity: number;
}

// Definimos el tipo para el valor de nuestro contexto.
interface CartContextType {
  cartItems: CartItem[];
  loadCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, newQuantity: number) => void;
  clearCart: () => void;
  itemCount: number; // Para mostrar en el ícono del carrito
  cartTotal: number; // El total monetario
}

// Creamos el Contexto con un valor por defecto.
const CartContext = createContext<CartContextType | undefined>(undefined);

// Ahora, creamos el "Proveedor" (Provider).
// Este componente envolverá nuestra aplicación y proveerá el estado del carrito.
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // --- FUNCIONES PARA MANIPULAR EL CARRITO ---
  const loadCart = async () => {
    if (!user) {
      return;
    }

  };

  // Función para agregar un artículo
  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        // Si el item ya existe, solo incrementamos su cantidad
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      // Si es un item nuevo, lo agregamos al array con cantidad 1
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  // Función para eliminar un artículo
  const removeFromCart = (itemId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Función para actualizar la cantidad
  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Si la cantidad es 0 o menos, lo eliminamos
      removeFromCart(itemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };
  
  // Función para vaciar completamente el carrito
  const clearCart = () => {
    setCartItems([]);
  };

  // --- VALORES CALCULADOS (MEMOIZED) ---

  // Calculamos la cantidad total de items para el ícono del carrito.
  // `useMemo` ayuda a optimizar, recalculando solo si `cartItems` cambia.
  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Calculamos el precio total del carrito.
  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  }, [cartItems]);

  // El valor que será accesible por todos los componentes hijos.
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    cartTotal,
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Finalmente, creamos un "Hook" personalizado para usar el contexto más fácilmente.
// Así, en lugar de importar `useContext` y `CartContext` en cada componente,
// solo importaremos `useCart`.
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}
