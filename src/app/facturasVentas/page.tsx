"use client";

import { useState, useEffect } from "react";
import FacturaDetalle from "@/components/FacturaDetalle";

type Factura = {
  id: number;
  numero: string;
  total: number;
  estado: string;
};

export default function FacturasTable() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<number | null>(
    null
  );

  // FILTRO ESTADO
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);

  const fetchFacturas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/facturas");
      const data = await res.json();
      setFacturas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar facturas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch(`/api/v1/facturas/${id}/entregas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Mostramos el mensaje de error del back
        alert(data.error || "Error al entregar la factura");
        return; // NO actualizamos el estado local
      }

      // Solo si el back responde ok, actualizamos localmente
      setFacturas((prev) =>
        prev.map((f) => (f.id === id ? { ...f, estado: nuevoEstado } : f))
      );
    } catch (error) {
      console.error("Error al entregar factura:", error);
      alert("Error de conexión o inesperado");
    }
  };

  const facturasFiltradas = selectedEstado
    ? facturas.filter((f) => f.estado === selectedEstado)
    : facturas;

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Facturas de Venta</h1>

      {/* FILTRO DE ESTADO */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div className="form-control">
          <label htmlFor="estado-select" className="label pb-1">
            <span className="label-text font-medium">Estado:</span>
          </label>
          <select
            id="estado-select"
            className="select select-bordered select-sm w-full"
            value={selectedEstado ?? ""}
            onChange={(e) => setSelectedEstado(e.target.value || null)}
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PREPARACION">En Preparación</option>
            <option value="ENVIADA">Enviada</option>
            <option value="ENTREGADA">Entregada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Número</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Cargando facturas...
                </td>
              </tr>
            ) : facturasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No hay facturas para mostrar.
                </td>
              </tr>
            ) : (
              facturasFiltradas.map((factura) => (
                <tr key={factura.id}>
                  <td>{factura.id}</td>
                  <td>{factura.numero}</td>
                  <td>${factura.total}</td>
                  <td>{factura.estado}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setFacturaSeleccionada(factura.id)}
                    >
                      Ver Detalle
                    </button>
                    {factura.estado !== "ENTREGADA" &&
                      factura.estado !== "CANCELADA" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => cambiarEstado(factura.id, "ENTREGADA")}
                        >
                          Entregar
                        </button>
                      )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {facturaSeleccionada && (
        <FacturaDetalle
          facturaId={facturaSeleccionada}
          onClose={() => setFacturaSeleccionada(null)}
        />
      )}
    </>
  );
}
