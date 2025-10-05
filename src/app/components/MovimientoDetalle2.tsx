"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";

interface MovimientoDetalleData {
  id: number;
  fecha: string;
  tipoOperacion: string;
  naturalezaOperacion: string;
  comprobante: string;
  deposito: {
    nombre: string;
    direccion: string;
  };
  detalles_mov: {
    cantidad: number;
    stockActual: number;
    articulo: {
      nombre: string;
      codigo: string;
    };
  }[];
}

interface MovimientoDetalleProps {
  movimientoId: number;
  onClose: () => void;
}

export default function MovimientoDetalle({
  movimientoId,
  onClose,
}: MovimientoDetalleProps) {
  const [movimiento, setMovimiento] = useState<MovimientoDetalleData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovimientoDetalle() {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/movimientos2/${movimientoId}`);

        if (!response.ok) {
          throw new Error("Error al cargar el detalle del movimiento");
        }

        const data = await response.json();
        setMovimiento(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    fetchMovimientoDetalle();
  }, [movimientoId]);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "INGRESO":
        return "text-success";
      case "EGRESO":
        return "text-error";
      case "TRANSFERENCIA":
        return "text-info";
      default:
        return "text-base-content";
    }
  };

  const getCantidadDisplay = (cantidad: number, tipo: string) => {
    if (tipo === "EGRESO") {
      return -cantidad;
    }
    return cantidad;
  };

  const getCantidadColor = (cantidad: number, tipo: string) => {
    if (tipo === "EGRESO") {
      return "text-error font-semibold";
    }
    if (tipo === "INGRESO") {
      return "text-success font-semibold";
    }
    return "text-base-content";
  };

  return (
    <Modal onClose={onClose}>
      <div className="min-w-[32rem] max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Detalle del Movimiento</h2>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {movimiento && (
          <div className="space-y-6">
            {/* Información general */}
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <h3 className="card-title text-lg">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Fecha:</span>
                    <p className="text-sm">
                      {new Date(movimiento.fecha).toLocaleString("es-AR")}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span>
                    <p
                      className={`text-sm font-semibold ${getTipoColor(
                        movimiento.tipoOperacion
                      )}`}
                    >
                      {movimiento.tipoOperacion}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Comprobante:</span>
                    <p className="text-sm">{movimiento.comprobante}</p>
                  </div>
                  <div>
                    <span className="font-medium">Depósito:</span>
                    <p className="text-sm">{movimiento.deposito.direccion}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles de artículos */}
            <div className="card bg-base-100 border">
              <div className="card-body p-4">
                <h3 className="card-title text-lg mb-4">Artículos</h3>
                <div className="overflow-x-auto">
                  <table className="table table-sm w-full">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="text-right">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimiento.detalles_mov.map((detalle, index) => (
                        <tr key={index}>
                          <td className="font-medium">
                            {detalle.articulo.nombre}
                          </td>
                          <td
                            className={`text-right ${getCantidadColor(
                              detalle.cantidad,
                              movimiento.tipoOperacion
                            )}`}
                          >
                            {getCantidadDisplay(
                              detalle.cantidad,
                              movimiento.tipoOperacion
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Resumen */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total de articulos:</span>
                    <span className="font-bold">
                      {movimiento.detalles_mov.reduce(
                        (total, detalle) => total + detalle.cantidad,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
