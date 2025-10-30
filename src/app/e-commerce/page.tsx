// src/pages/ECommercePage.tsx
"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/lib/auth_ctx";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

// import { Button } from "@/components/ui/button2"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, LogIn } from "lucide-react"

type ArticuloFrontend = {
  id: number;
  codigo: string;
  nombre: string;
  marca?: any;
  categoria?: any;
  imagen: string;
  precio: number;
}

type ProductGridProps = {
  articulos: ArticuloFrontend[];
  onAddToCart: (articulo: ArticuloFrontend) => void;
}

type ProductCardProps = {
  articulo: ArticuloFrontend;
  onAddToCart: (articulo: ArticuloFrontend) => void;
}

type HeaderProps = {
  cartCount: number;
}

const Header = ({ cartCount }: HeaderProps) => {
  const { user, logout } = useAuth();

  const getUserInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Millenium Store</h1>
        { user && (
          <div>
            <Link
              href="/e-commerce/carrito"
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user ? getUserInitials(user.nombre) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.nombre}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      thing
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) }
        { !user && (
          <Link
            href="/e-commerce/login"
            className="relative flex items-center justify-center rounded-full border border-transparent p-2 hover:border-white transition"
            aria-label="Iniciar sesión"
          >
            <LogIn size={28} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2">
                {cartCount}
              </span>
            )}
          </Link>
        )}
    </header>
  );
};

const ProductCard = ({ articulo, onAddToCart }: ProductCardProps) => {
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

const ProductGrid = ({ articulos, onAddToCart }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
      {articulos.map((a) => (
        <ProductCard key={a.id} articulo={a} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default function ECommercePage() {
  const [articulos, setArticulos] = useState<ArticuloFrontend[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // estado para el texto de búsqueda
  const { loadCart, addToCart, itemCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadCart();
    fetch("/api/v1/prod") // apunta a tu endpoint GET
      .then((res) => res.json())
      .then((data) => setArticulos(data));
  }, []);

  const handleAddToCart = (articulo: ArticuloFrontend) => {
    if (!user) {
      router.push("/e-commerce/login")
      return;
    }

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
