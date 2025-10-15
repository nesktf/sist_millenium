// src/pages/ECommercePage.tsx
"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";

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
  const [articulos, setArticulos] = useState<ArticuloFrontend[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // estado para el texto de búsqueda
  const { addToCart, itemCount } = useCart();

  useEffect(() => {
    fetch("/api/v1/prod") // apunta a tu endpoint GET
      .then((res) => res.json())
      .then((data) => setArticulos(data));
  }, []);

  const handleAddToCart = (articulo: ArticuloFrontend) => {
    const precio =
      articulo.precio !== undefined && articulo.precio !== null
        ? Number(articulo.precio)
        : 0;

    addToCart({
      id: articulo.id,
      nombre: articulo.nombre,
      precio,
      imagenUrl: articulo.imagen ? `/images/${articulo.imagen}` : undefined,
    });
  };

  const filteredArticulos = articulos.filter((a) =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header cartCount={itemCount} />

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
