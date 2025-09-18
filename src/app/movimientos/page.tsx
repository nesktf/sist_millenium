"use client";

import { useState, useEffect } from "react";
import MovimientosTable from "../components/MovimientosTable";
import MovimientoForm from "../components/MovimientoForm";
import Modal from "../components/Modal";
import Link from "next/link";
import { DepositoPostAction } from "../api/v1/deposito/route";

type ArticuloOpt = { id_articulo: number; nombre: string };

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [depositos, setDepositos] = useState<any[]>([]);
  const [selectedDeposito, setSelectedDeposito] = useState("all");
  const [selectedTipoMovimiento, setSelectedTipoMovimiento] = useState<string>("all");

  const [selectedFecha, setSelectedFecha] = useState("");
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

  // Cargar tipos de movimiento
  const tiposMovimiento = [
    { value: "INGRESO", label: "Ingreso" },
    { value: "EGRESO", label: "Egreso" },
    { value: "TRANSFERENCIA", label: "Transferencia" }
  ];

  useEffect(() => {
    fetchMovimientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeposito, selectedTipoMovimiento, selectedFecha]);

  async function fetchMovimientos() {
    setIsLoading(true);
    console.log(selectedDeposito);
    console.log(selectedTipoMovimiento);
    console.log(selectedFecha);

    let res: Response;
    if (selectedDeposito === "all") {
      res = await fetch(`/api/v1/movimientos/all`, { cache: "no-store" });
    } else {
      res = await fetch("/api/v1/deposito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: DepositoPostAction.get_movimientos,
          id_deposito: parseInt(selectedDeposito),
          fecha: selectedFecha || undefined,
        }),
      });
    }

    if (res.ok) {
      const data = await res.json();
      let flattenedMovs: any[] = [];

      if (selectedDeposito === "all") {
        // Para todos los depósitos, los datos vienen directamente como array
        flattenedMovs = (data || []).map((mov: any) => ({
          id_mov_stock: mov.id_mov_stock,
          fecha: mov.fecha,
          tipo: mov.tipo,
          comprobante: mov.comprobante,
          articulo: mov.articulo,
          cantidad: mov.cantidad,
          deposito: mov.deposito,
        }));
      } else {
        // Para depósito específico, los datos vienen en data.movimientos
        const movimientos = data.movimientos || [];
        flattenedMovs = movimientos.flatMap((mov: any) =>
          (mov.articulos || []).map((art: any) => ({
            id_mov_stock: mov.id, // Usar mov.id en lugar de mov.id_mov_stock
            fecha: mov.fecha,
            tipo: mov.tipo,
            comprobante: mov.comprobante,
            articulo: art.nombre || art.articulo,
            cantidad: art.cantidad,
            deposito: mov.deposito,
          }))
        );
      }
      
      console.log(flattenedMovs);
      
      // Filtrar por tipo de movimiento si no es "all"
      if (selectedTipoMovimiento !== "all") {
        setMovimientos(flattenedMovs.filter((mov: any) => {
          return mov.tipo === selectedTipoMovimiento;
        }));
      } else {
        setMovimientos(flattenedMovs);
      }
    } else {
      setMovimientos([]);
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

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">
          {/* Selector de depósito */}
          <div className="flex items-center gap-2 md:col-span-4">
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
          
          {/* Selector de tipo de movimiento */}
          <div className="flex items-center gap-2 md:col-span-5">
            <label htmlFor="tipo-select" className="font-medium">
              Tipo de Movimiento:
            </label>
            <select
              id="tipo-select"
              className="select select-bordered select-sm w-72"
              value={selectedTipoMovimiento}
              onChange={(e) => setSelectedTipoMovimiento(e.target.value)}
            >
              <option value="all">Todos los Tipos</option>
              {tiposMovimiento.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Selector de fecha */}
          <div className="flex items-center gap-2 md:col-span-3">
            <label htmlFor="fecha" className="font-medium">
              Fecha:
            </label>
            <input
              id="fecha"
              type="date"
              className="input input-bordered input-sm"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
            />
          </div>
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