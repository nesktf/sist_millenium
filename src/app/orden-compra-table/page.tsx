"use client";

import { useState, useEffect } from "react";

type Item = {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
};

type OrdenCompra = {
  id: number;
  fecha_esperada: string;
  proveedor: string;
  deposito: string;
  total: number;
  items: Item[];
};

type Proveedor = { id: number; nombre: string };
type Deposito = { id: number; nombre: string };

export default function OrdenesCompraPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [proveedorFilter, setProveedorFilter] = useState("");
  const [depositoFilter, setDepositoFilter] = useState("");
  const [selectedOrden, setSelectedOrden] = useState<OrdenCompra | null>(null);

  // Traer proveedores y depósitos para los selects
  useEffect(() => {
    const fetchFilters = async () => {
      const provRes = await fetch("/api/v1/proveedor");
      const depRes = await fetch("/api/v1/deposito2");
      const provData = await provRes.json();
      const depData = await depRes.json();
      setProveedores(provData);
      setDepositos(depData);
    };
    fetchFilters();
  }, []);

  // Función para traer datos desde la API con filtros
  const fetchOrdenes = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (proveedorFilter) params.append("proveedor", proveedorFilter);
    if (depositoFilter) params.append("deposito", depositoFilter);

    const res = await fetch(`/api/v1/orden-compra?${params.toString()}`);
    const data = await res.json();
    setOrdenes(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrdenes();
  }, [proveedorFilter, depositoFilter]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Órdenes de Compra</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <select
          value={proveedorFilter}
          onChange={(e) => setProveedorFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos los proveedores</option>
          {(proveedores || []).map((p) => (
            <option key={p.id} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>

        <select
          value={depositoFilter}
          onChange={(e) => setDepositoFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos los depósitos</option>
          {(depositos || []).map((d) => (
            <option key={d.id} value={d.nombre}>
              {d.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-base-content">
            <thead className="bg-base-200">
              <tr>
                <th>ID</th>
                <th>Fecha Esperada</th>
                <th>Proveedor</th>
                <th>Depósito</th>
                <th>Total</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td>{orden.id}</td>
                  <td>{new Date(orden.fecha_esperada).toLocaleDateString()}</td>
                  <td>{orden.proveedor}</td>
                  <td>{orden.deposito}</td>
                  <td>{orden.total}</td>
                  <td className="text-center">
                    <button
                      onClick={() => setSelectedOrden(orden)}
                      className="btn btn-sm btn-success"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedOrden && (
        <div className="fixed inset-0 flex justify-center items-start z-50 pt-10">
          <div className="bg-white p-8 rounded-lg w-3/4 max-w-5xl max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4">Detalles Orden de compra</h2>
            <table className="table table-zebra w-full text-base-content">
              <thead className="bg-base-200">
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrden.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.precio}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100">
                  <td className="px-4 py-2">Total</td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2">{selectedOrden.total}</td>
                </tr>
              </tbody>
            </table>
            <button
              onClick={() => setSelectedOrden(null)}
              className="mt-4 btn btn-error w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
