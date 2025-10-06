"use client";

import { useState } from "react";
import MovimientoDetalle from "@/components/MovimientoDetalle";

interface Movimiento {
  id_mov_stock: number;
  fecha: string;
  comprobante: string;
  tipoOperacion: string;
  naturaleza: string;
}

export default function MovimientosTable({
  movimientos,
  isLoading,
}: {
  movimientos: Movimiento[];
  isLoading: boolean;
}) {
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<
    number | null
  >(null);
  return (
    <>
      <div className="overflow-x-auto mt-4">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Nro. Comprobante</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  Cargando movimientos...
                </td>
              </tr>
            ) : movimientos.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No hay movimientos para mostrar.
                </td>
              </tr>
            ) : (
              movimientos.map((mov) => (
                <tr key={mov.id_mov_stock}>
                  <td>{new Date(mov.fecha).toLocaleString("es-AR")}</td>
                  <td>
                    <span
                      className={`badge ${
                        mov.naturaleza === "INGRESO"
                          ? "badge-success"
                          : mov.naturaleza === "EGRESO"
                          ? "badge-error"
                          : "badge-info"
                      }`}
                    >
                      {mov.tipoOperacion}
                    </span>
                  </td>
                  <td>{mov.comprobante || "—"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() =>
                        setMovimientoSeleccionado(mov.id_mov_stock)
                      }
                    >
                      {" "}
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {movimientoSeleccionado && (
        <MovimientoDetalle
          movimientoId={movimientoSeleccionado}
          onClose={() => setMovimientoSeleccionado(null)}
        />
      )}
    </>
  );
}
