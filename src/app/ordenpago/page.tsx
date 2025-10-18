"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RegistrarOrdenPagoModal from "@/components/pagos/RegistrarOrdenPagoModal";
import DetalleOrdenModal from "@/components/pagos/DetalleOrdenModal";
import RegistrarPagoModal from "@/components/pagos/RegistrarPagoModal";
import { formatDateAR } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/currency";

interface OrdenPago {
  id: number;
  numero: string;
  fecha: string;
  estado: "PENDIENTE" | "PAGADO" | "CANCELADO";
  saldo?: number;
  total: number;
  proveedor?: {
    id: number;
    nombre: string;
  };
  comprobante?: {
    letra: string;
    sucursal: string;
    numero: string;
    proveedor: {
      nombre: string;
    };
  };
}

interface Proveedor {
  id: number;
  nombre: string;
}

export default function OrdenPagoPage() {
  const [ordenes, setOrdenes] = useState<OrdenPago[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  // Modales
  const [showModalRegistrar, setShowModalRegistrar] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [showModalPago, setShowModalPago] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchProveedores();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filtroProveedor, filtroEstado]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = "/api/v1/orden-pago?";
      if (filtroProveedor) url += `id_proveedor=${filtroProveedor}&`;
      if (filtroEstado) url += `estado=${filtroEstado}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrdenes(data);
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

  const handleRegistrarOrden = async (data: any) => {
    try {
      const res = await fetch("/api/v1/orden-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("¡Orden de pago registrada con éxito!");
        setShowModalRegistrar(false);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Error al registrar: ${errorData.error}`);
      }
    } catch (error) {
      alert("Error de conexión al intentar registrar la orden.");
    }
  };

  const handleVerDetalle = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/orden-pago?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrdenSeleccionada(data);
        setShowModalDetalle(true);
      }
    } catch (error) {
      alert("Error al cargar el detalle");
    }
  };

  const handleAbrirModalPago = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/orden-pago?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrdenSeleccionada(data);
        setShowModalPago(true);
      }
    } catch (error) {
      alert("Error al cargar la orden");
    }
  };

  const handleRegistrarPago = async (data: any) => {
    try {
      const res = await fetch("/api/v1/historial-pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("¡Pago registrado con éxito!");
        setShowModalPago(false);
        setOrdenSeleccionada(null);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Error al registrar el pago: ${errorData.error}`);
      }
    } catch (error) {
      alert("Error de conexión al intentar registrar el pago.");
    }
  };

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
        <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            <Link href="/proveedor" className="btn btn-outline btn-sm">
              Volver a Proveedores
            </Link>
            <button
              onClick={() => setShowModalRegistrar(true)}
              className="btn btn-primary btn-sm"
            >
              Registrar Orden de Pago
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Órdenes de Pago</h1>

        {/* Filtros */}
        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <h3 className="font-bold mb-3">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <span className="label-text">Estado</span>
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="select select-bordered select-sm"
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="PAGADO">En Pago</option>
                <option value="CANCELADO">Pagado</option>
              </select>
            </div>

            <div className="form-control flex justify-end">
              <label className="label">
                <span className="label-text">&nbsp;</span>
              </label>
              <button
                onClick={() => {
                  setFiltroProveedor("");
                  setFiltroEstado("");
                }}
                className="btn btn-ghost btn-sm"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de órdenes */}
        <div className="bg-base-100 rounded-lg shadow overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Número</th>
                <th>Comprobante</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    No hay órdenes de pago registradas con los filtros
                    seleccionados.
                  </td>
                </tr>
              ) : (
                ordenes.map((orden) => (
                  <tr key={orden.id}>
                    <td className="font-semibold">{orden.numero}</td>
                    <td>
                      {orden.comprobante
                        ? `${orden.comprobante.letra}-${orden.comprobante.sucursal}-${orden.comprobante.numero}`
                        : "-"}
                    </td>
                    <td>
                      {orden.proveedor?.nombre ||
                        orden.comprobante?.proveedor?.nombre ||
                        "-"}
                    </td>
                    <td>{new Date(orden.fecha).toLocaleDateString()}</td>
                    <td className="text-right">
                      {formatCurrency(orden.total ?? 0)}
                    </td>
                    <td className="text-right">
                      <span
                        className={
                          orden.saldo === 0
                            ? "text-success font-bold"
                            : "text-warning font-bold"
                        }
                      >
                        {formatCurrency(orden.saldo ?? 0)}
                      </span>
                    </td>
                    <td>{getEstadoBadge(orden.estado)}</td>
                    <td className="text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleVerDetalle(orden.id)}
                          className="btn btn-info btn-xs"
                          title="Ver Detalle"
                        >
                          Ver
                        </button>
                        {(orden.estado === "PENDIENTE" || orden.estado === "PAGADO") && orden.saldo! > 0 && (
                          <button
                            onClick={() => handleAbrirModalPago(orden.id)}
                            className="btn btn-success btn-xs"
                            title="Registrar Pago"
                          >
                            Pagar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modales */}
        <RegistrarOrdenPagoModal
          isOpen={showModalRegistrar}
          onClose={() => setShowModalRegistrar(false)}
          proveedores={proveedores}
          onSubmit={handleRegistrarOrden}
        />

        <DetalleOrdenModal
          isOpen={showModalDetalle}
          onClose={() => {
            setShowModalDetalle(false);
            setOrdenSeleccionada(null);
          }}
          orden={ordenSeleccionada}
        />

        <RegistrarPagoModal
          isOpen={showModalPago}
          onClose={() => {
            setShowModalPago(false);
            setOrdenSeleccionada(null);
          }}
          orden={ordenSeleccionada}
          onSubmit={handleRegistrarPago}
        />
      </main>
    </div>
  );
}
