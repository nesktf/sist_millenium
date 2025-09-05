// app/movimientos/page.tsx
"use client";

import { useState, useEffect } from "react";
import MovimientosTable from "../components/MovimientosTable";
import MovimientoForm from "../components/MovimientoForm";
import Modal from "../components/Modal";
import Link from "next/link";

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [depositos, setDepositos] = useState<any[]>([]);
  const [selectedDeposito, setSelectedDeposito] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchDepositos() {
      const res = await fetch("/api/v1/deposito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        setDepositos(data.depositos || []);
      }
    }
    fetchDepositos();
  }, []);

  useEffect(() => {
    fetchMovimientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeposito]);

  async function fetchMovimientos() {
    if (!selectedDeposito) {
      setIsLoading(false);
      setMovimientos([]);
      return;
    }

    setIsLoading(true);

    let res: Response;
    if (selectedDeposito === "all") {
      res = await fetch(`/api/v1/movimientos/all`, { cache: "no-store" });
    } else {
      res = await fetch("/api/v1/deposito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 1,
          id_deposito: parseInt(selectedDeposito),
        }),
      });
    }

    if (res.ok) {
      const data = await res.json();
      const dataToFlatten = data.movimientos || data;
      const flattenedMovs = (dataToFlatten || []).flatMap((mov: any) =>
        (mov.articulos || [mov]).map((art: any) => ({
          fecha: mov.fecha,
          tipo: mov.tipo,
          comprobante: mov.comprobante,
          articulo: art.nombre || art.articulo,
          cantidad: art.cantidad,
        }))
      );
      setMovimientos(flattenedMovs);
    }

    setIsLoading(false);
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historial de Movimientos</h1>

      {/* Header con botones y selector */}
      <div className="mb-4">
        {/* Botones */}
        <div className="flex gap-4 mb-3">
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
          >
            Cargar Movimiento
          </button>
          <Link href="/" className="btn btn-outline btn-sm">
            Volver a Productos
          </Link>
        </div>

        {/* Selector de depósito */}
        <div className="flex items-center gap-2">
          <label htmlFor="deposito-select" className="font-medium">
            Selecciona un Depósito:
          </label>
          <select
            id="deposito-select"
            className="select select-bordered select-sm w-56"
            value={selectedDeposito}
            onChange={(e) => setSelectedDeposito(e.target.value)}
          >
            <option value="all">Todos los Depósitos</option>
            {depositos.map((dep: any) => (
              <option key={dep.id_deposito} value={dep.id_deposito}>
                {dep.direccion}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de movimientos */}
      <MovimientosTable movimientos={movimientos} isLoading={isLoading} />

      {/* Modal con formulario */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2 className="text-lg font-semibold mb-2">Cargar movimiento</h2>
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
