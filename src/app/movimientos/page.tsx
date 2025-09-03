// app/movimientos/page.tsx
"use client";

import { useState, useEffect } from 'react';
import MovimientosTable from '../components/MovimientosTable';
import Link from 'next/link';

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [depositos, setDepositos] = useState<any[]>([]);
  const [selectedDeposito, setSelectedDeposito] = useState('all');
  const [isLoading, setIsLoading] = useState(true); // <--- 1. AÑADIMOS EL ESTADO DE CARGA

  useEffect(() => {
    async function fetchDepositos() {
      const res = await fetch('/api/v1/deposito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 0 })
      });
      if (res.ok) {
        const data = await res.json();
        setDepositos(data.depositos);
      }
    }
    fetchDepositos();
  }, []);

  useEffect(() => {
    if (!selectedDeposito) {
        setIsLoading(false); // Si no hay nada seleccionado, no estamos cargando
        setMovimientos([]); // Aseguramos que la tabla esté vacía
        return;
    };

    async function fetchMovimientos() {
      setIsLoading(true); // <--- 2. PONEMOS isLoading EN TRUE ANTES DE BUSCAR
      
      let res;
      if (selectedDeposito === 'all') {
        res = await fetch(`/api/v1/movimientos/all`);
      } else {
        res = await fetch('/api/v1/deposito', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 1,
            id_deposito: parseInt(selectedDeposito)
          })
        });
      }

      if (res.ok) {
        const data = await res.json();
        const dataToFlatten = data.movimientos || data;
        const flattenedMovs = dataToFlatten.flatMap((mov: any) =>
          (mov.articulos || [mov]).map((art: any) => ({
            fecha: mov.fecha, tipo: mov.tipo, comprobante: mov.comprobante,
            articulo: art.nombre || art.articulo, cantidad: art.cantidad
          }))
        );
        setMovimientos(flattenedMovs);
      }
      setIsLoading(false); // <--- 3. PONEMOS isLoading EN FALSE CUANDO TERMINA
    }
    fetchMovimientos();
  }, [selectedDeposito]);

  return (
    <main style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/"><button>Volver a Productos</button></Link>
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Historial de Movimientos
      </h1>
      
      <div>
        <label htmlFor="deposito-select">Selecciona un Depósito: </label>
        <select
          id="deposito-select"
          value={selectedDeposito}
          onChange={(e) => setSelectedDeposito(e.target.value)}
        >
          <option value="all">Todos los Depósitos</option>
          {depositos.map((dep) => (
            <option key={dep.id_deposito} value={dep.id_deposito}>
              {dep.direccion}
            </option>
          ))}
        </select>
      </div>

      {/* 4. PASAMOS EL ESTADO DE CARGA A LA TABLA */}
      <MovimientosTable movimientos={movimientos} isLoading={isLoading} />
    </main>
  );
}