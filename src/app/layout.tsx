// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link"; // Asegúrate de importar Link para la navegación

export const metadata = {
  title: "Millenium",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="emerald">
      <body className="min-h-screen bg-base-100 text-base-content">
        <div className="flex">
          {/* Menú Lateral Fijo */}
          <div className="w-64 h-screen bg-gray-800 text-white p-4">
            <h2 className="text-xl font-bold mb-4">Millenium</h2>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-lg hover:text-blue-400">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/movimientos"
                  className="text-lg hover:text-blue-400"
                >
                  Movimientos
                </Link>
              </li>
              <li>
                <Link href="/stock" className="text-lg hover:text-blue-400">
                  Stock
                </Link>
              </li>
              <li>
                <Link href="/proveedor" className="text-lg hover:text-blue-400">
                  Proveedores
                </Link>
              </li>
            </ul>
          </div>
          {/* Contenido principal */}
          <div className="flex-1 p-6">
            {children} {/* Aquí se renderiza el contenido de cada página */}
          </div>
        </div>
      </body>
    </html>
  );
}
