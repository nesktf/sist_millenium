"use client";

import { useState } from "react";
import MovimientoDetalle from "./MovimientoDetalle";

interface Movimiento {
  id_mov_stock: number;
  fecha: string;
  tipo: string;
  comprobante: string;
  articulo: string;
  cantidad: number;
  deposito?: string;
}

export default function MovimientosTable({
  movimientos,
  isLoading,
}: {
  movimientos: Movimiento[];
  isLoading: boolean;
}) {
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<number | null>(null);

  // Agrupar movimientos por id_mov_stock para mostrar una fila por movimiento
  const movimientosAgrupados = movimientos.reduce((acc, mov) => {
    if (!acc[mov.id_mov_stock]) {
      acc[mov.id_mov_stock] = {
        id_mov_stock: mov.id_mov_stock,
        fecha: mov.fecha,
        tipo: mov.tipo,
        comprobante: mov.comprobante,
        deposito: mov.deposito,
        articulos: []
      };
    }
    acc[mov.id_mov_stock].articulos.push({
      articulo: mov.articulo,
      cantidad: mov.cantidad
    });
    return acc;
  }, {} as Record<number, any>);

  const movimientosArray = Object.values(movimientosAgrupados)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const extractNumeroComprobante = (comprobante: string) => {
    // Extraer solo el número del comprobante (después del último guión)
    const partes = comprobante.split(' - ');
    return partes[partes.length - 1] || comprobante;
  };

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
            ) : movimientosArray.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No hay movimientos para mostrar.
                </td>
              </tr>
            ) : (
              movimientosArray.map((mov, index) => (
                <tr key={`${mov.id_mov_stock}-${index}`}>
                  <td>{new Date(mov.fecha).toLocaleString("es-AR")}</td>
                  <td>
                    <span className={`badge ${
                      mov.tipo === 'INGRESO' ? 'badge-success' : 
                      mov.tipo === 'EGRESO' ? 'badge-error' : 
                      'badge-info'
                    }`}>
                      {mov.tipo}
                    </span>
                  </td>
                  <td>{extractNumeroComprobante(mov.comprobante)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setMovimientoSeleccionado(mov.id_mov_stock)}
                    >
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