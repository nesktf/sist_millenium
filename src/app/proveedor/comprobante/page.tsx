// app/proveedor/comprobante/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RegistrarComprobanteModal from "@/components/comprobantes/RegistrarComprobanteModal";
import DetalleComprobanteModal from "@/components/comprobantes/DetalleComprobanteModal";

interface Comprobante {
  id: number;
  fecha: string;
  letra: string;
  sucursal: string;
  numero: string;
  total: number;
  proveedor: {
    id: number;
    nombre: string;
  };
  tipo_comprobante: {
    id: number;
    nombre: string;
  };
  orden_pago?: {
    id: number;
    numero: string;
  } | null;
}

interface Proveedor {
  id: number;
  nombre: string;
}

interface TipoComprobante {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function ComprobanteProveedorPage() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [tiposComprobante, setTiposComprobante] = useState<TipoComprobante[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroSinOrden, setFiltroSinOrden] = useState(false);

  // Modales
  const [showModalRegistrar, setShowModalRegistrar] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState<any>(null);

  useEffect(() => {
    fetchProveedores();
    fetchTiposComprobante();
  }, []);

  useEffect(() => {
    fetchComprobantes();
  }, [filtroProveedor, filtroTipo, filtroSinOrden]);

  const fetchComprobantes = async () => {
    try {
      setLoading(true);
      let url = "/api/v1/comprobante-proveedor/lista?";
      if (filtroProveedor) url += `id_proveedor=${filtroProveedor}&`;
      if (filtroTipo) url += `id_tipo=${filtroTipo}&`;
      if (filtroSinOrden) url += `sin_orden=true&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setComprobantes(data);
      }
    } catch (error) {
      console.error("Error fetching comprobantes:", error);
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

  const fetchTiposComprobante = async () => {
    try {
      const res = await fetch("/api/v1/tipo-comprobante-proveedor");
      if (res.ok) {
        const data = await res.json();
        setTiposComprobante(data);
      }
    } catch (error) {
      console.error("Error fetching tipos de comprobante:", error);
    }
  };

  const handleVerDetalle = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/comprobante-proveedor/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComprobanteSeleccionado(data);
        setShowModalDetalle(true);
      }
    } catch (error) {
      alert("Error al cargar el detalle");
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
              Registrar Comprobante
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Comprobantes de Proveedores</h1>

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
                <span className="label-text">Tipo de Comprobante</span>
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="select select-bordered select-sm"
              >
                <option value="">Todos los tipos</option>
                {tiposComprobante.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Estado</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  checked={filtroSinOrden}
                  onChange={(e) => setFiltroSinOrden(e.target.checked)}
                  className="checkbox checkbox-sm"
                />
                <span className="label-text">Sin orden de pago</span>
              </label>
            </div>

            <div className="form-control flex justify-end">
              <label className="label">
                <span className="label-text">&nbsp;</span>
              </label>
              <button
                onClick={() => {
                  setFiltroProveedor("");
                  setFiltroTipo("");
                  setFiltroSinOrden(false);
                }}
                className="btn btn-ghost btn-sm"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de comprobantes */}
        <div className="bg-base-100 rounded-lg shadow overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Tipo</th>
                <th>Número</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Orden de Pago</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comprobantes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    No hay comprobantes registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                comprobantes.map((comp) => (
                  <tr key={comp.id}>
                    <td>{comp.tipo_comprobante.nombre}</td>
                    <td className="font-semibold">
                      {comp.letra}-{comp.sucursal}-{comp.numero}
                    </td>
                    <td>{comp.proveedor.nombre}</td>
                    <td>{new Date(comp.fecha).toLocaleDateString()}</td>
                    <td className="text-right">
                      ${comp.total?.toLocaleString() || 0}
                    </td>
                    <td>
                      {comp.orden_pago ? (
                        <span className="badge badge-success">
                          {comp.orden_pago.numero}
                        </span>
                      ) : (
                        <span className="badge badge-warning">Sin asignar</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleVerDetalle(comp.id)}
                        className="btn btn-info btn-xs"
                        title="Ver Detalle"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modales */}
        <RegistrarComprobanteModal
          isOpen={showModalRegistrar}
          onClose={() => setShowModalRegistrar(false)}
          onSuccess={() => {
            setShowModalRegistrar(false);
            fetchComprobantes();
          }}
        />

        <DetalleComprobanteModal
          isOpen={showModalDetalle}
          onClose={() => {
            setShowModalDetalle(false);
            setComprobanteSeleccionado(null);
          }}
          comprobante={comprobanteSeleccionado}
        />
      </main>
    </div>
  );
}