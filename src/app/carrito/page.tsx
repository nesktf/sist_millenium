// src/app/carrito/page.tsx
"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image"; // Usaremos next/image para optimizar las imágenes

export default function CartPage() {
  // Obtenemos todos los datos y funciones del contexto del carrito
  const {
    cartItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Si el carrito está vacío, mostramos un mensaje amigable
  if (cartItems.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Tu Carrito está Vacío</h1>
        <p className="mb-6">
          Parece que todavía no has agregado ningún producto.
        </p>
        <Link href="/" className="btn btn-primary">
          Ver Productos
        </Link>
      </div>
    );
  }

  // Si hay items, mostramos la tabla y el resumen
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tu Carrito de Compras</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna de los items del carrito */}
        <div className="md:col-span-2">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            {/* Mostramos una imagen por defecto si no hay imagenUrl */}
                            <Image
                              src={item.imagenUrl || "/placeholder.png"}
                              alt={item.nombre}
                              width={48}
                              height={48}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{item.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td>${item.precio.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                        className="input input-bordered w-20 text-center"
                      />
                    </td>
                    <td>${(item.precio * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="btn btn-ghost btn-xs text-red-500"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna del resumen de la compra */}
        <div className="md:col-span-1">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Resumen del Pedido</h2>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg my-2">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary w-full">
                  Proceder al Pago
                </button>
                <button
                  onClick={clearCart}
                  className="btn btn-outline btn-sm w-full mt-2"
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}