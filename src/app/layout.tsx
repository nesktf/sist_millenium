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
            <h2 className="text-xl font-bold mb-6">Millenium</h2>

            {/* Gestión de Depósitos */}
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">
                Gestión de Depósitos
              </h3>
              <ul className="space-y-2 ml-2">
                <li>
                  <Link href="/" className="hover:text-blue-400">
                    Productos
                  </Link>
                </li>
                <li>
                  <Link href="/movimientos" className="hover:text-blue-400">
                    Movimientos de stock
                  </Link>
                </li>
                <li>
                  <Link href="/stock" className="hover:text-blue-400">
                    Consultar Stock
                  </Link>
                </li>
                <li>
                  <Link href="/deposito" className="hover:text-blue-400">
                    Depósitos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Gestión de Compras */}
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Gestión de Compras</h3>
              <ul className="space-y-2 ml-2">
                <li>
                  <Link href="" className="hover:text-blue-400">
                    Registrar Orden de Compra
                  </Link>
                </li>
              </ul>
            </div>

            {/* Gestión de Proveedores */}
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">
                Gestión de Proveedores
              </h3>
              <ul className="space-y-2 ml-2">
                <li>
                  <Link href="/proveedor" className="hover:text-blue-400">
                    Proveedores
                  </Link>
                </li>
                <li>
                  <Link href="" className="hover:text-blue-400">
                    Registrar Comprobante Proveedor
                  </Link>
                </li>
                <li>
                  <Link href="" className="hover:text-blue-400">
                    Registrar Orden de Pago
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
