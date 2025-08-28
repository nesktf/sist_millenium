// app/layout.tsx o app/layout.js
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Millenium",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
