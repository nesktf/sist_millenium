"use client";

import { useState, useEffect } from "react";
import MovimientosTable from "../components/MovimientosTable";
import MovimientoForm from "../components/MovimientoForm";
import Modal from "../components/Modal";
import Link from "next/link";
import { DepositoPostAction } from "../api/v1/deposito/route";


export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [depositos, setDepositos] = useState<any[]>([]);
  const [articulos, setArticulos] = useState<any[]>([]); 

  // Estados de los filtros
  const [selectedDeposito, setSelectedDeposito] = useState("all");
  const [selectedTipoMovimiento, setSelectedTipoMovimiento] = useState<string>("all");
  const [selectedArticulo, setSelectedArticulo] = useState("all"); 
  const [selectedFecha, setSelectedFecha] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const resDepositos = await fetch("/api/v1/deposito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 0 }),
      });
      if (resDepositos.ok) {
        const data = await resDepositos.json();
        setDepositos(data.depositos || []);
      }

      const resArticulos = await fetch('/api/v1/prod');
      if (resArticulos.ok) {
        setArticulos(await resArticulos.json());
      }
    }
    fetchData();
  }, []);

  const tiposMovimiento = [
    { value: "INGRESO", label: "Ingreso" },
    { value: "EGRESO", label: "Egreso" },
    { value: "TRANSFERENCIA", label: "Transferencia" }
  ];


  useEffect(() => {
    fetchMovimientos();
  }, [selectedDeposito, selectedTipoMovimiento, selectedFecha, selectedArticulo]);


  async function fetchMovimientos() {
    setIsLoading(true);

    const params = new URLSearchParams();
    if (selectedFecha) params.append('fecha', selectedFecha);
    if (selectedArticulo !== "all") params.append('articuloId', selectedArticulo);

    let res: Response;
    if (selectedDeposito === "all") {
      res = await fetch(`/api/v1/movimientos/all?${params.toString()}`, { cache: "no-store" });
    } else {
      res = await fetch("/api/v1/deposito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: DepositoPostAction.get_movimientos,
          id_deposito: parseInt(selectedDeposito),
          fecha: selectedFecha || undefined,
          articuloId: selectedArticulo === 'all' ? undefined : parseInt(selectedArticulo),
        }),
      });
    }

    if (res.ok) {
      const data = await res.json();
      let flattenedMovs: any[] = [];

      if (selectedDeposito === "all") {
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
        if (Array.isArray(data)) {
          flattenedMovs = data;
        } else {
          const movimientos = data.movimientos || [];
          flattenedMovs = movimientos.flatMap((mov: any) =>
            (mov.articulos || []).map((art: any) => ({
              id_mov_stock: mov.id,
              fecha: mov.fecha,
              tipo: mov.tipo,
              comprobante: mov.comprobante,
              articulo: art.nombre || art.articulo,
              cantidad: art.cantidad,
              deposito: mov.deposito,
            }))
          );
        }
      }
      
      if (selectedTipoMovimiento !== "all") {
        setMovimientos(flattenedMovs.filter((mov: any) => mov.tipo === selectedTipoMovimiento));
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

      <div className="mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
          {/* Selector de depósito */}
          <div className="form-control">
            <label htmlFor="deposito-select" className="label pb-1"><span className="label-text font-medium">Depósito:</span></label>
            <select
              id="deposito-select"
              className="select select-bordered select-sm w-full"
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
          
          {/*NUEVO FILTRO DE ARTÍCULO*/}
          <div className="form-control">
            <label htmlFor="articulo-select" className="label pb-1"><span className="label-text font-medium">Artículo:</span></label>
            <select
              id="articulo-select"
              className="select select-bordered select-sm w-full"
              value={selectedArticulo}
              onChange={(e) => setSelectedArticulo(e.target.value)}
            >
              <option value="all">Todos los Artículos</option>
              {articulos.map((art: any) => (
                <option key={art.id} value={art.id}>
                  {art.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de tipo de movimiento */}
          <div className="form-control">
            <label htmlFor="tipo-select" className="label pb-1"><span className="label-text font-medium">Tipo de Movimiento:</span></label>
            <select
              id="tipo-select"
              className="select select-bordered select-sm w-full"
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
          <div className="form-control">
            <label htmlFor="fecha" className="label pb-1"><span className="label-text font-medium">Fecha:</span></label>
            <input
              id="fecha"
              type="date"
              className="input input-bordered input-sm w-full"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
            />
          </div>
        </div>
      </div>

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
