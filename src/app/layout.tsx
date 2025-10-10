// src/app/layout.tsx
import Sidebar from "../app/components/sidebar";
import "./globals.css";
import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext"; // 1. IMPORTAMOS NUESTRO PROVIDER

export const metadata = {
  title: "Millenium",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="emerald">
      <body>
        {/* 2. ENVOLVEMOS EL CONTENIDO CON EL CARTPROVIDER */}
        <CartProvider>
          <div className="flex min-h-screen bg-base-100 text-base-content">
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}