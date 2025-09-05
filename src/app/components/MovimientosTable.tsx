// app/components/MovimientosTable.tsx
"use client";

interface Movimiento {
  fecha: string;
  tipo: string;
  comprobante: string;
  articulo: string;
  cantidad: number;
}

export default function MovimientosTable({
  movimientos,
  isLoading,
}: {
  movimientos: Movimiento[];
  isLoading: boolean;
}) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Artículo</th>
            <th>Cantidad</th>
            <th>Tipo</th>
            <th>Comprobante</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="text-center py-4">
                Cargando movimientos...
              </td>
            </tr>
          ) : movimientos.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4">
                No hay movimientos para mostrar.
              </td>
            </tr>
          ) : (
            movimientos.map((mov, index) => (
              <tr key={index}>
                <td>{new Date(mov.fecha).toLocaleString("es-AR")}</td>
                <td>{mov.articulo}</td>
                <td>{mov.cantidad}</td>
                <td>{mov.tipo}</td>
                <td>{mov.comprobante}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
