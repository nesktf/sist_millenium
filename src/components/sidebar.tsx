"use client";

import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const toggleMenu = (menu: string) =>
    setOpenMenu(openMenu === menu ? null : menu);

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-gray-900 text-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold tracking-wide">Millenium</h2>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {/* Ecommerce */}
        <div className="mb-4">
          <Link
            href="/e-commerce"
            className="block px-4 py-2 text-left font-semibold rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
          >
            E-commerce
          </Link>
        </div>

        {/* Gestión de Depósitos */}
        <div className="mb-4">
          <button
            className="w-full flex justify-between items-center px-4 py-2 text-left font-semibold rounded hover:bg-gray-800 transition-colors"
            onClick={() => toggleMenu("depositos")}
          >
            Gestión de Depósitos
            <span
              className={`transform transition-transform ${
                openMenu === "depositos" ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
          </button>
          {openMenu === "depositos" && (
            <ul className="mt-2 ml-4 space-y-1 text-gray-200">
              <li>
                <Link
                  href="/"
                  className="block px-2 py-1 rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/movimientos"
                  className="block px-2 py-1 rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
                >
                  Movimientos de stock
                </Link>
              </li>
              <li>
                <Link
                  href="/stock"
                  className="block px-2 py-1 rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
                >
                  Consultar Stock
                </Link>
              </li>
              <li>
                <Link
                  href="/deposito"
                  className="block px-2 py-1 rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
                >
                  Depósitos
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Gestión de Compras */}
        <div className="mb-4">
          <button
            className="w-full flex justify-between items-center px-4 py-2 text-left font-semibold rounded hover:bg-gray-800 transition-colors"
            onClick={() => toggleMenu("compras")}
          >
            Gestión de Compras
            <span
              className={`transform transition-transform ${
                openMenu === "compras" ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
          </button>
          {openMenu === "compras" && (
            <ul className="mt-2 ml-4 space-y-1 text-gray-200">
              <li>
                <Link
                  href="/ordencompra"
                  className="block px-2 py-1 rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
                >
                  Registrar Orden de Compra
                </Link>
              </li>
              <li>
                <Link
                  href="/orden-compra-table"
                  className="block px-2 py-1 rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
                >
                  Ver Orden de Compra
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Gestión de Proveedores */}
        <div className="mb-4">
          <button
            className="w-full flex justify-between items-center px-4 py-2 text-left font-semibold rounded hover:bg-gray-800 transition-colors"
            onClick={() => toggleMenu("proveedores")}
          >
            Gestión de Proveedores
            <span
              className={`transform transition-transform ${
                openMenu === "proveedores" ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
          </button>
          {openMenu === "proveedores" && (
            <ul className="mt-2 ml-4 space-y-1 text-gray-200">
              <li>
                <Link
                  href="/proveedor"
                  className="block px-2 py-1 rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
                >
                  Proveedores
                </Link>
              </li>
              <li>
                <Link
                  href="/proveedor/comprobante"
                  className="block px-2 py-1 rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
                >
                  Registrar Comprobante Proveedor
                </Link>
              </li>
              <li>
                <Link
                  href="/ordenpago"
                  className="block px-2 py-1 rounded hover:bg-gray-800 hover:text-blue-400 transition-colors"
                >
                  Registrar Orden de Pago
                </Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </div>
  );
}
