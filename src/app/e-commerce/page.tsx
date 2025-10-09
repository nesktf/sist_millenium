// src/pages/ECommercePage.tsx
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { Cart } from "@/components/Cart";
import { Footer } from "@/components/Footer";

export interface ArticuloFrontend {
  id: number;
  codigo: string;
  nombre: string;
  marca?: any;
  categoria?: any;
  imagen: string;
  precio: number;
}

export default function ECommercePage() {
  const [cart, setCart] = useState<ArticuloFrontend[]>([]);
  const [articulos, setArticulos] = useState<ArticuloFrontend[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // estado para el texto de búsqueda

  useEffect(() => {
    fetch("/api/v1/prod") // apunta a tu endpoint GET
      .then((res) => res.json())
      .then((data) => setArticulos(data));
  }, []);

  const handleAddToCart = (articulo: ArticuloFrontend) => {
    setCart((prev) => [...prev, articulo]);
  };

  const handleRemove = (id: number) => {
    setCart((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredArticulos = articulos.filter((a) =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header cartCount={cart.length} />

      <main className="flex-1 container mx-auto mt-12">
        <div className="px-6 mb-8 flex justify-end">
          <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-md flex items-center">
            <img src="/search.svg" alt="Buscar" className="w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Buscar artículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-none focus:outline-none"
            />
          </div>
        </div>
        <ProductGrid
          articulos={filteredArticulos}
          onAddToCart={handleAddToCart}
        />
      </main>

      <Footer />
    </div>
  );
}
