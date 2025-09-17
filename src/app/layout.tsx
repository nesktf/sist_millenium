// app/layout.tsx o app/layout.js
// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Millenium",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="emerald">
      <body className="min-h-screen bg-base-100 text-base-content">
        {children}
      </body>
    </html>

  );
}
