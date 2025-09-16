// app/movimientos/page.tsx
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
  const [articulos, setArticulos] = useState<{ id: number; nombre: string }[]>([]);
  const [selectedArticulo, setSelectedArticulo] = useState<string>(""); // string porque el select devuelve string

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

// Cargar artículos
  useEffect(() => {
    async function fetchArticulos() {
      try {
        const res = await fetch("/api/v1/prod", { method: "GET" });
        if (!res.ok) throw new Error(await res.text());

        const data: { id: number; nombre: string }[] = await res.json();
        setArticulos(data);

        // seleccionar el primero por defecto (opcional)
        if (data.length && !selectedArticulo) {
          setSelectedArticulo(String(data[0].id));
        }
      } catch (e) {
        console.error("Error cargando artículos:", e);
        setArticulos([]);
      }
    }
    fetchArticulos();
  }, []);



  useEffect(() => {
    fetchMovimientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeposito, selectedArticulo, selectedFecha]);

  async function fetchMovimientos() {
    if (!selectedDeposito) {
      setIsLoading(false);
      setMovimientos([]);
      return;
    }

    setIsLoading(true);
    console.log(selectedDeposito);
    console.log(selectedArticulo);
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
          id_articulo: selectedArticulo ? parseInt(selectedArticulo) : undefined,
          fecha: selectedFecha || undefined,
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
          articulo_id: art.id,
          cantidad: art.cantidad,
        }))
      );
        console.log(flattenedMovs);
      if (selectedArticulo) {
        setMovimientos(flattenedMovs);
      } else {
        setMovimientos(flattenedMovs.filter((mov: any) => {
          return mov.articulo_id == Number(selectedArticulo);
        }))
      }
    } else {
      setIsLoading(false);
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

        {/* Selector de depósito */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">

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
        {/* Selector de producto */}

        <div className="flex items-center gap-2 md:col-span-5">
          <label htmlFor="articulo-select" className="font-medium">
            Selecciona un Producto:
          </label>
          <select
            id="articulo-select"
            className="select select-bordered select-sm w-72"
            value={selectedArticulo}
            onChange={(e) => setSelectedArticulo(e.target.value)}
          >
            <option value="all">Todos los Artículos</option>
          
            {articulos.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
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
