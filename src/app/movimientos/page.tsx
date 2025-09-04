// app/movimientos/page.tsx
"use client";

import { useState, useEffect } from 'react';
import MovimientosTable from '../components/MovimientosTable';
import MovimientoForm from '../components/MovimientoForm';
import Modal from '../components/Modal';
import Link from 'next/link';

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [depositos, setDepositos] = useState<any[]>([]);
  const [selectedDeposito, setSelectedDeposito] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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
    fetchMovimientos();
  }, [selectedDeposito]);

  async function fetchMovimientos() {
    if (!selectedDeposito) {
      setIsLoading(false);
      setMovimientos([]);
      return;
    }

    setIsLoading(true);
    
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
          fecha: mov.fecha, 
          tipo: mov.tipo, 
          comprobante: mov.comprobante,
          articulo: art.nombre || art.articulo, 
          cantidad: art.cantidad
        }))
      );
      setMovimientos(flattenedMovs);
    }
    setIsLoading(false);
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Historial de Movimientos
      </h1>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setShowForm(true)}
        >
          Cargar Movimiento
        </button>
        <Link href="/">
          <button>Volver a Productos</button>
        </Link>
      </div>

      <div style={{ marginBottom: '1rem' }}>
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

      <MovimientosTable 
        movimientos={movimientos} 
        isLoading={isLoading}
      />

      {/* Modal con formulario */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2>Cargar movimiento</h2>
          <MovimientoForm
            onSuccess={() => { 
              fetchMovimientos(); 
              setShowForm(false); 
            }}
          />
        </Modal>
      )}
    </main>
  );
}