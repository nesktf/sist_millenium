import Modal from "@/components/Modal";
import { formatCurrency } from "@/utils/currency";

interface DetalleComprobanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  comprobante: any;
}

// --- HELPER FUNCTIONS ---
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

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Detalle del Comprobante</h2>

      <div className="space-y-4">
        {/* Info Comprobante (MODIFICADO) */}
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Información del Comprobante</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-semibold">Tipo:</span>{" "}
              {comprobante.tipo_comprobante?.nombre || "-"}
            </div>
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
              {/* --- FORMATO APLICADO --- */}
              {formatMoney(comprobante.total || 0)}
            </div>
            <div>
              <span className="font-semibold">Estado:</span>{" "}
              {comprobante.orden_pago ? (
                <span className="badge badge-success">Con orden de pago</span>
              ) : (
                <span className="badge badge-warning">Sin orden de pago</span>
              )}
            </div>
          </div>
        </div>

        {/* Info Orden de Pago (MODIFICADO) */}
        {comprobante.orden_pago && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Orden de Pago Asociada</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Número:</span>{" "}
                {comprobante.orden_pago.numero}
              </div>
              <div>
                <span className="font-semibold">Estado:</span>{" "}
                {comprobante.orden_pago.estado === "PENDIENTE" && (
                  <span className="badge badge-warning">Pendiente</span>
                )}
                {comprobante.orden_pago.estado === "PAGADO" && (
                  <span className="badge badge-info">En Pago</span>
                )}
                {comprobante.orden_pago.estado === "CANCELADO" && (
                  <span className="badge badge-success">PAGADO</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Fecha:</span>{" "}
                {new Date(comprobante.orden_pago.fecha).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Saldo:</span>{" "}
                {/* --- FORMATO APLICADO --- */}
                {formatMoney(comprobante.orden_pago.saldo || 0)}
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Artículos (MODIFICADO) */}
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
                        {/* --- FORMATO APLICADO --- */}
                        {formatQuantity(detalle.cantidad)}
                      </td>
                      <td>
                        {/* --- FORMATO APLICADO --- */}
                        {formatMoney(detalle.precio_unitario || 0)}
                      </td>
                      <td>
                        {/* --- FORMATO APLICADO --- */}
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
                      {/* --- FORMATO APLICADO --- */}
                      {formatMoney(comprobante.total || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Info Orden de Compra (MODIFICADO) */}
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
                {/* --- FORMATO APLICADO --- */}
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
