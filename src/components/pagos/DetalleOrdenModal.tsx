import Modal from "@/components/Modal";
import { formatCurrency } from "@/utils/currency";

interface DetalleOrdenModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: any;
}

const formatMoney = (amount: number | null | undefined) => {
  if (typeof amount !== 'number') return '$0';
  return `$${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function DetalleOrdenModal({
  isOpen,
  onClose,
  orden,
}: DetalleOrdenModalProps) {
  if (!isOpen || !orden) return null;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return <span className="badge badge-warning">Pendiente</span>;
      case "PAGADO":
        return <span className="badge badge-success">Pagado</span>;
      case "CANCELADO":
        return <span className="badge badge-error">Cancelado</span>;
      default:
        return <span className="badge badge-neutral">{estado}</span>;
    }
  };

  const getEstadoComprobadoBadge = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return <span className="badge badge-warning badge-sm">Pendiente</span>;
      case "PARCIAL":
        return <span className="badge badge-info badge-sm">Parcial</span>;
      case "PAGADO":
        return <span className="badge badge-success badge-sm">Pagado</span>;
      default:
        return <span className="badge badge-neutral badge-sm">{estado}</span>;
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Detalle de Orden de Pago</h2>

      <div className="space-y-4">
        {/* Información de la Orden */}
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Información de la Orden</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-semibold">Número:</span> {orden.numero}
            </div>
            <div>
              <span className="font-semibold">Estado:</span>{" "}
              {getEstadoBadge(orden.estado)}
            </div>
            <div>
              <span className="font-semibold">Fecha:</span>{" "}
              {new Date(orden.fecha).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold">Total:</span>{" "}
              {formatMoney(orden.total || 0)}
            </div>
            <div>
              <span className="font-semibold">Proveedor:</span>{" "}
              {orden.proveedor?.nombre || "-"}
            </div>
            <div>
              <span className="font-semibold">Forma de Pago:</span>{" "}
              {orden.forma_pago || "-"}
            </div>
            {orden.referencia && (
              <div className="col-span-2">
                <span className="font-semibold">Referencia:</span>{" "}
                {orden.referencia}
              </div>
            )}
          </div>
        </div>

        {/* Comprobantes Relacionados */}
        {orden.comprobantes && orden.comprobantes.length > 0 && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Comprobantes Pagados</h3>
            <div className="overflow-x-auto">
              <table className="table table-xs w-full">
                <thead>
                  <tr>
                    <th>Comprobante</th>
                    <th>Total Comprobante</th>
                    <th>Monto Pagado</th>
                    <th>Saldo Pendiente</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.comprobantes.map((compOrden: any) => (
                    <tr key={compOrden.id}>
                      <td>
                        <div className="text-xs">
                          <div className="font-semibold">
                            {compOrden.comprobante.tipo_comprobante?.nombre || ""}
                          </div>
                          <div>
                            {compOrden.comprobante.letra}-
                            {compOrden.comprobante.sucursal}-
                            {compOrden.comprobante.numero}
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        {formatMoney(compOrden.total_comprobante || 0)}
                      </td>
                      <td className="text-right font-semibold text-success">
                        {formatMoney(compOrden.monto_pagado || 0)}
                      </td>
                      <td className="text-right">
                        {formatMoney(compOrden.saldo_pendiente || 0)}
                      </td>
                      <td>
                        {getEstadoComprobadoBadge(compOrden.estado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan={2} className="text-right">
                      Total Pagado en esta Orden:
                    </td>
                    <td colSpan={3}>
                      {formatMoney(orden.total || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Detalles de Artículos (si hay) */}
        {orden.comprobantes && orden.comprobantes.length > 0 && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Artículos en los Comprobantes</h3>
            {orden.comprobantes.map((compOrden: any) => (
              compOrden.comprobante.detalles && 
              compOrden.comprobante.detalles.length > 0 && (
                <div key={compOrden.id} className="mb-4 last:mb-0">
                  <h4 className="text-sm font-semibold mb-2">
                    Comprobante {compOrden.comprobante.letra}-
                    {compOrden.comprobante.sucursal}-
                    {compOrden.comprobante.numero}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="table table-xs w-full">
                      <thead>
                        <tr>
                          <th>Artículo</th>
                          <th>Código</th>
                          <th>Cantidad</th>
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compOrden.comprobante.detalles.map((detalle: any) => (
                          <tr key={detalle.id}>
                            <td>{detalle.articulo?.nombre || "-"}</td>
                            <td>{detalle.articulo?.codigo || "-"}</td>
                            <td>{detalle.cantidad}</td>
                            <td className="text-right">
                              {formatMoney(detalle.precio_unitario || 0)}
                            </td>
                            <td className="text-right">
                              {formatMoney(
                                (detalle.cantidad || 0) * (detalle.precio_unitario || 0)
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}