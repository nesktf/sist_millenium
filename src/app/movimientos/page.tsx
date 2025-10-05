"use client";

import { useState, useEffect } from "react";
import MovimientosTable from "../components/MovimientosTable2";
import Link from "next/link";
import MovimientoForm, { Deposito } from "../components/MovimientoForm";
import Modal from "../components/Modal";

interface Depositos {
  id: number;
  nombre: string;
  direccion: string;
  cap_max: number | null;
}

export default function MovimientosPage() {
  const [selectedDepositoAdd, setSelectedDepositoAdd] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  // NATURALEZA
  const [selectedNaturaleza, setSelectedNaturaleza] = useState<string | null>(
    null
  );

  //DEPOSITO
  const [depositos, setDepositos] = useState<Depositos[]>([]);
  const [selectedDeposito, setSelectedDeposito] = useState<number | null>(null);

  //MOVIMIENTOS
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/deposito2")
      .then((res) => res.json())
      .then(setDepositos);
  }, []);

  // ✅ Encapsulamos la lógica de carga en una función reutilizable
  const fetchMovimientos = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDeposito)
        params.append("depositoId", selectedDeposito.toString());
      if (selectedNaturaleza) params.append("naturaleza", selectedNaturaleza);

      const res = await fetch(`/api/v1/movimientos2?${params.toString()}`);
      const data = await res.json();

      console.log("📦 Datos recibidos:", data);
      setMovimientos(data);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Se ejecuta automáticamente al cambiar los filtros
  useEffect(() => {
    fetchMovimientos();
  }, [selectedDeposito, selectedNaturaleza]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historial de Movimientos</h1>

      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        {/* IZQUIERDA: FILTROS */}
        <div className="flex flex-wrap gap-4">
          <div className="form-control">
            <label htmlFor="deposito-select" className="label pb-1">
              <span className="label-text font-medium">Depósito:</span>
            </label>
            <select
              value={selectedDeposito ?? ""}
              onChange={(e) => setSelectedDeposito(Number(e.target.value))}
              className="select select-bordered select-sm w-full"
              id="deposito-select"
            >
              <option value="">Todos los depósitos</option>
              {depositos.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label htmlFor="tipo-select" className="label pb-1">
              <span className="label-text font-medium">
                Tipo de Movimiento:
              </span>
            </label>
            <select
              value={selectedNaturaleza ?? ""}
              onChange={(e) => setSelectedNaturaleza(e.target.value || null)}
              className="select select-bordered select-sm w-full"
              id="tipo-select"
            >
              <option value="">Todos</option>
              <option value="INGRESO">Ingreso</option>
              <option value="EGRESO">Egreso</option>
            </select>
          </div>
        </div>

        {/* DERECHA: DEPÓSITO + BOTÓN CARGAR MOVIMIENTO */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="form-control">
            <label htmlFor="deposito-add-select" className="label pb-1">
              <span className="label-text font-medium">Depósito a Cargar:</span>
            </label>
            <select
              id="deposito-add-select"
              className="select select-bordered select-sm w-full"
              value={selectedDepositoAdd}
              onChange={(e) => setSelectedDepositoAdd(e.target.value)}
            >
              <option value="" disabled>
                Selecciona un depósito
              </option>
              {depositos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.direccion}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
          >
            Cargar Movimiento
          </button>
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
            initialDeposito={selectedDepositoAdd}
          />
        </Modal>
      )}
    </main>
  );
}
