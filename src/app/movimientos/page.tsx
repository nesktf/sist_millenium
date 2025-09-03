// app/movimientos/page.tsx
"use client";

import { useState, useEffect } from 'react';
import MovimientosTable from '../components/MovimientosTable'; // Importamos la tabla que creamos
import Link from 'next/link'; // 👇 1. AGREGA ESTA LÍNEA


export default function MovimientosPage() {
  // Usaremos un estado para guardar la lista de movimientos
  const [movimientos, setMovimientos] = useState([]);

  // Usaremos useEffect para que la página pida los datos al cargarse
  useEffect(() => {
    async function fetchMovimientos() {
      // NOTA: Este API endpoint todavía no existe, lo crearemos después.
      // Por ahora, dará un error 404 en la consola del navegador, es normal.
      const res = await fetch('/api/v1/movimientos');
      if (res.ok) {
        const data = await res.json();
        setMovimientos(data);
      }
    }

    fetchMovimientos();
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/">
          <button>
            Volver a Productos
          </button>
        </Link>
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Historial de Movimientos
      </h1>

      {/* Aquí es donde en el futuro pondremos los filtros */}

      <MovimientosTable movimientos={movimientos} />
    </main>
  );
}