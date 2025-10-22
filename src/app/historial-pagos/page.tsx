"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DetalleOrdenModal from "@/components/pagos/DetalleOrdenModal";
import { formatDateAR } from "@/utils/dateUtils";

// --- INTERFAZ (con la corrección de 'comprobantes' plural) ---
interface HistorialPago {
  id: number;
  fecha: string;
  monto: number;
  forma_pago: string;
  referencia?: string;
  saldo_anterior: number;
  pendiente_por_pagar: number;
  orden_pago: {
    id: number;
    numero: string;
    proveedor: {
      id: number;
      nombre: string;
    };
    // MODIFICADO
    comprobantes?: Array<{
      letra: string;
      sucursal: string;
      numero: string;
    }>;
  };
}

interface Proveedor {
  id: number;
  nombre: string;
}

// --- HELPER DE FORMATO ---
const formatMoney = (amount: number | null | undefined) => {
  if (typeof amount !== 'number') return '$0';
  return `$${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function HistorialPagosPage() {
  const [pagos, setPagos] = useState<HistorialPago[]>([]);
  const [pagosFiltrados, setPagosFiltrados] = useState<HistorialPago[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [filtroFormaPago, setFiltroFormaPago] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

  // Modal
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchProveedores();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [
    pagos,
    filtroProveedor,
    filtroFormaPago,
    filtroFechaDesde,
    filtroFechaHasta,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/historial-pagos");
      if (res.ok) {
        const data = await res.json();
        setPagos(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const fetchProveedores = async () => {
    try {
      const res = await fetch("/api/v1/proveedor");
      if (res.ok) {
        const data = await res.json();
        setProveedores(
          data.map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching proveedores:", error);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...pagos];

    // Filtro por proveedor
    if (filtroProveedor) {
      resultado = resultado.filter(
        (pago) => pago.orden_pago.proveedor.id === parseInt(filtroProveedor)
      );
    }

    // Filtro por forma de pago
    if (filtroFormaPago) {
      resultado = resultado.filter(
        (pago) => pago.forma_pago === filtroFormaPago
      );
    }

    // Filtro por fecha desde
    if (filtroFechaDesde) {
      resultado = resultado.filter(
        (pago) => new Date(pago.fecha) >= new Date(filtroFechaDesde)
      );
    }

    // Filtro por fecha hasta
    if (filtroFechaHasta) {
      resultado = resultado.filter(
        (pago) => new Date(pago.fecha) <= new Date(filtroFechaHasta)
      );
    }

    setPagosFiltrados(resultado);
  };

  const limpiarFiltros = () => {
    setFiltroProveedor("");
    setFiltroFormaPago("");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
  };

  const handleVerDetalle = async (id_orden_pago: number) => {
    try {
      const res = await fetch(`/api/v1/orden-pago?id=${id_orden_pago}`);
      if (res.ok) {
        const data = await res.json();
        setOrdenSeleccionada(data);
        setShowModalDetalle(true);
      }
    } catch (error) {
      alert("Error al cargar el detalle");
    }
  };

  const getFormaPagoBadge = (forma: string) => {
    switch (forma) {
      case "EFECTIVO":
        return <span className="badge badge-success">Efectivo</span>;
      case "TRANSFERENCIA":
        return <span className="badge badge-info">Transferencia</span>;
      default:
        return <span className="badge badge-neutral">{forma}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <main style={{ padding: "2rem" }}>
        {/* Encabezado y acciones */}
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <Link href="/ordenpago" className="btn btn-outline btn-sm">
            Volver a Órdenes de Pago
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-4">Historial de Pagos</h1>

        {/* Filtros */}
        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-3">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Proveedor</span>
              </label>
              <select
                value={filtroProveedor}
                onChange={(e) => setFiltroProveedor(e.target.value)}
                className="select select-bordered select-sm"
              >
                <option value="">Todos los proveedores</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Forma de Pago</span>
              </label>
              <select
                value={filtroFormaPago}
                onChange={(e) => setFiltroFormaPago(e.target.value)}
                className="select select-bordered select-sm"
              >
                <option value="">Todas las formas</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Fecha Desde</span>
              </label>
              <input
                type="date"
                value={filtroFechaDesde}
                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                className="input input-bordered input-sm"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Fecha Hasta</span>
              </label>
              <input
                type="date"
                value={filtroFechaHasta}
                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                className="input input-bordered input-sm"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-base-content/70">
              Mostrando {pagosFiltrados.length} de {pagos.length} pagos
            </div>
            <button
              onClick={limpiarFiltros}
              className="btn btn-ghost btn-sm"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Tabla de Pagos (MODIFICADA CON FORMATO) */}
        <div className="bg-base-100 rounded-lg shadow overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Fecha</th>
                <th>Orden de Pago</th>
                <th>Proveedor</th>
                <th>Comprobante(s)</th>
                <th>Monto</th>
                <th>Forma de Pago</th>
                <th>Referencia</th>
                <th>Saldo Anterior</th>
                <th>Pendiente</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center p-4">
                    No hay pagos que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                pagosFiltrados.map((pago) => (
                  <tr key={pago.id}>
                    <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                    <td>
                      <span className="font-semibold">
                        {pago.orden_pago.numero}
                      </span>
                    </td>
                    <td>{pago.orden_pago.proveedor.nombre}</td>
                    <td>
                      {/* --- LÓGICA MODIFICADA (plural) --- */}
                      {pago.orden_pago.comprobantes &&
                      pago.orden_pago.comprobantes.length > 0 ? (
                        <div className="flex flex-col text-xs">
                          {pago.orden_pago.comprobantes.map((c) => (
                            <span key={`${c.sucursal}-${c.numero}`}>
                              {`${c.letra}-${c.sucursal}-${c.numero}`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="text-right font-bold text-success">
                      {/* --- FORMATO APLICADO --- */}
                      {formatMoney(pago.monto)}
                    </td>
                    <td>{getFormaPagoBadge(pago.forma_pago)}</td>
                    <td className="text-sm">{pago.referencia || "-"}</td>
                    <td className="text-right">
                      {/* --- FORMATO APLICADO --- */}
                      {formatMoney(pago.saldo_anterior)}
                    </td>
                    <td className="text-right">
                      <span
                        className={
                          pago.pendiente_por_pagar === 0
                            ? "text-success font-bold"
                            : "text-warning font-bold"
                        }
                      >
                        {/* --- FORMATO APLICADO --- */}
                        {formatMoney(pago.pendiente_por_pagar)}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleVerDetalle(pago.orden_pago.id)}
                        className="btn btn-info btn-xs"
                        title="Ver Detalle de la Orden"
                      >
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal (sin cambios) */}
        <DetalleOrdenModal
          isOpen={showModalDetalle}
          onClose={() => {
            setShowModalDetalle(false);
            setOrdenSeleccionada(null);
          }}
          orden={ordenSeleccionada}
        />
      </main>
    </div>
  );
}