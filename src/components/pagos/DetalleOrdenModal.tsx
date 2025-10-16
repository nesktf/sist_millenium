import Modal from "@/components/Modal";

interface DetalleOrdenModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: any;
}

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
        return <span className="badge badge-info">En Pago</span>;
      case "CANCELADO":
        return <span className="badge badge-success">Pagado</span>;
      default:
        return <span className="badge badge-neutral">{estado}</span>;
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Detalle de Orden de Pago</h2>

      <div className="space-y-4">
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
              <span className="font-semibold">Total:</span> $
              {orden.total?.toLocaleString() || 0}
            </div>
            <div>
              <span className="font-semibold">Saldo:</span> $
              {orden.saldo?.toLocaleString() || 0}
            </div>
            <div>
              <span className="font-semibold">Proveedor:</span>{" "}
              {orden.proveedor?.nombre || "-"}
            </div>
          </div>
        </div>

        {orden.comprobante && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Comprobante Relacionado</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Tipo:</span>{" "}
                {orden.comprobante.tipo_comprobante?.nombre || "-"}
              </div>
              <div>
                <span className="font-semibold">Número:</span>{" "}
                {orden.comprobante.letra}-{orden.comprobante.sucursal}-
                {orden.comprobante.numero}
              </div>
              <div>
                <span className="font-semibold">Fecha:</span>{" "}
                {new Date(orden.comprobante.fecha).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Total:</span> $
                {orden.comprobante.total?.toLocaleString() || 0}
              </div>
            </div>

            {orden.comprobante.detalles &&
              orden.comprobante.detalles.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-sm mb-2">
                    Artículos del Comprobante:
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="table table-xs w-full">
                      <thead>
                        <tr>
                          <th>Artículo</th>
                          <th>Cantidad</th>
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orden.comprobante.detalles.map((detalle: any) => (
                          <tr key={detalle.id}>
                            <td>{detalle.articulo?.nombre || "-"}</td>
                            <td>{detalle.cantidad}</td>
                            <td>${detalle.precio_unitario?.toLocaleString()}</td>
                            <td>
                              $
                              {(
                                detalle.cantidad * detalle.precio_unitario
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        )}

        {orden.historial_pagos && orden.historial_pagos.length > 0 && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Historial de Pagos</h3>
            <div className="overflow-x-auto">
              <table className="table table-xs w-full">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Forma de Pago</th>
                    <th>Saldo Anterior</th>
                    <th>Pendiente</th>
                    <th>Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.historial_pagos.map((pago: any) => (
                    <tr key={pago.id}>
                      <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                      <td>${pago.monto?.toLocaleString()}</td>
                      <td>{pago.forma_pago}</td>
                      <td>${pago.saldo_anterior?.toLocaleString()}</td>
                      <td>${pago.pendiente_por_pagar?.toLocaleString()}</td>
                      <td>{pago.referencia || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}