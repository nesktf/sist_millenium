import Sidebar from "@/components/sidebar";
import "./globals.css";
import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext"; // 1. IMPORTAMOS NUESTRO PROVIDER
import { AuthProvider } from "@/lib/auth_ctx";

export const metadata = {
  title: "Millenium",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="emerald">
      <body className="min-h-screen bg-base-100 text-base-content">
        <AuthProvider>
          <CartProvider>
            <div className="flex">
              <Sidebar />
              <main className="ml-64 flex-1 p-6">{children}</main>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
