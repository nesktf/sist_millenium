"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/currency";

interface Detalle {
  id: number;
  nombreArticulo: string;
  cantidad: number;
  precio: number;
}

interface Factura {
  id: number;
  numero: string;
  total: number;
  estado: string;
  detalle: Detalle[];
}

export default function FacturaDetalle({
  facturaId,
  onClose,
}: {
  facturaId: number;
  onClose: () => void;
}) {
  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFactura = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/facturas/${facturaId}`);
      const data = await res.json();
      setFactura(data);
    } catch (error) {
      console.error("Error al cargar factura:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactura();
  }, [facturaId]);

  const entregarFactura = async () => {
    if (!factura) return;
    const res = await fetch(`/api/v1/facturas/${facturaId}/entregas`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "ENTREGADA" }),
    });
    if (res.ok) {
      setFactura({ ...factura, estado: "ENTREGADA" });
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detalle de Factura</h2>
          <button className="btn btn-sm btn-outline" onClick={onClose}>
            Cerrar
          </button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : factura ? (
          <>
            <p>
              <span className="font-semibold">Número:</span> {factura.numero}
            </p>
            <p>
              <span className="font-semibold">Estado:</span> {factura.estado}
            </p>
            <p>
              <span className="font-semibold">Total:</span> ${factura.total}
            </p>

            <table className="table table-zebra w-full mt-4">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {factura.detalle.map((d) => (
                  <tr key={d.id}>
                    <td>{d.nombreArticulo}</td>
                    <td>{d.cantidad}</td>
                    <td>{formatCurrency(d.precio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>Factura no encontrada.</p>
        )}
      </div>
    </div>
  );
}
