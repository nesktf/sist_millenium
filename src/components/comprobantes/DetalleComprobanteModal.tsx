import Modal from "@/components/Modal";

interface DetalleComprobanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  comprobante: any;
}

const formatMoney = (amount: number | null | undefined) => {
  if (typeof amount !== 'number') return '$0';
  return `$${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatQuantity = (quantity: number | null | undefined) => {
  if (typeof quantity !== 'number') return '0';
  return quantity.toLocaleString('es-AR');
};

export default function DetalleComprobanteModal({
  isOpen,
  onClose,
  comprobante,
}: DetalleComprobanteModalProps) {
  if (!isOpen || !comprobante) return null;

  const getEstadoPagoBadge = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return <span className="badge badge-warning">Sin pagar</span>;
      case "PARCIAL":
        return <span className="badge badge-info">Pago parcial</span>;
      case "PAGADO":
        return <span className="badge badge-success">Pagado completo</span>;
      default:
        return <span className="badge badge-neutral">{estado}</span>;
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Detalle del Comprobante</h2>

      <div className="space-y-4">
        {/* Info Comprobante */}
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Información del Comprobante</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-semibold">Número:</span>{" "}
              {comprobante.letra}-{comprobante.sucursal}-{comprobante.numero}
            </div>
            <div>
              <span className="font-semibold">Proveedor:</span>{" "}
              {comprobante.proveedor?.nombre || "-"}
            </div>
            <div>
              <span className="font-semibold">Fecha:</span>{" "}
              {new Date(comprobante.fecha).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold">Total:</span>{" "}
              {formatMoney(comprobante.total || 0)}
            </div>
            <div>
              <span className="font-semibold">Estado de Pago:</span>{" "}
              {getEstadoPagoBadge(comprobante.estado_pago || "PENDIENTE")}
            </div>
          </div>
        </div>

        {/* Info de Pagos */}
        {comprobante.total_pagado != null && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Estado de Pagos</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Total del Comprobante:</span>{" "}
                {formatMoney(comprobante.total || 0)}
              </div>
              <div>
                <span className="font-semibold">Total Pagado:</span>{" "}
                <span className="text-success">
                  {formatMoney(comprobante.total_pagado || 0)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Saldo Pendiente:</span>{" "}
                <span className={comprobante.saldo_pendiente > 0 ? "text-warning font-bold" : "text-success"}>
                  {formatMoney(comprobante.saldo_pendiente || 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Órdenes de Pago Asociadas */}
        {comprobante.ordenes_pago && comprobante.ordenes_pago.length > 0 && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Órdenes de Pago</h3>
            <div className="overflow-x-auto">
              <table className="table table-xs w-full">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Fecha</th>
                    <th>Monto Pagado</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobante.ordenes_pago.map((op: any) => (
                    <tr key={op.id}>
                      <td>{op.orden_pago?.numero || "-"}</td>
                      <td>{new Date(op.orden_pago?.fecha).toLocaleDateString()}</td>
                      <td className="text-right font-semibold text-success">
                        {formatMoney(op.monto_pagado || 0)}
                      </td>
                      <td>
                        {op.estado === "PENDIENTE" && (
                          <span className="badge badge-warning badge-xs">Pendiente</span>
                        )}
                        {op.estado === "PARCIAL" && (
                          <span className="badge badge-info badge-xs">Parcial</span>
                        )}
                        {op.estado === "PAGADO" && (
                          <span className="badge badge-success badge-xs">Pagado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan={2} className="text-right">Total Pagado:</td>
                    <td colSpan={2}>
                      {formatMoney(comprobante.total_pagado || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tabla de Artículos */}
        {comprobante.detalles && comprobante.detalles.length > 0 && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Artículos del Comprobante</h3>
            <div className="overflow-x-auto">
              <table className="table table-xs w-full">
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th>Código</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobante.detalles.map((detalle: any) => (
                    <tr key={detalle.id}>
                      <td>{detalle.articulo?.nombre || "-"}</td>
                      <td>{detalle.articulo?.codigo || "-"}</td>
                      <td>
                        {formatQuantity(detalle.cantidad)}
                      </td>
                      <td>
                        {formatMoney(detalle.precio_unitario || 0)}
                      </td>
                      <td>
                        {formatMoney(
                          detalle.cantidad * detalle.precio_unitario
                        )}
                      </td>
                      <td>{detalle.observacion || "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan={4} className="text-right">
                      Total:
                    </td>
                    <td colSpan={2}>
                      {formatMoney(comprobante.total || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Info Orden de Compra */}
        {comprobante.orden_compra && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Orden de Compra Relacionada</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">ID:</span>{" "}
                {comprobante.orden_compra.id}
              </div>
              <div>
                <span className="font-semibold">Total:</span>{" "}
                {formatMoney(comprobante.orden_compra.precio_total || 0)}
              </div>
              <div>
                <span className="font-semibold">Forma de Pago:</span>{" "}
                {comprobante.orden_compra.forma_pago}
              </div>
              <div>
                <span className="font-semibold">Fecha Esperada:</span>{" "}
                {new Date(
                  comprobante.orden_compra.fecha_esperada
                ).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}