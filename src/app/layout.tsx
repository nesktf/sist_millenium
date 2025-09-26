// src/app/layout.tsx (Server Component)
import Sidebar from "../app/components/sidebar";
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Millenium",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="emerald">
      <body className="min-h-screen bg-base-100 text-base-content">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
