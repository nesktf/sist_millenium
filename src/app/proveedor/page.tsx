"use client";

import ProveedoresTable from "@/components/ProveedoresTable";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ProveedorForm from "@/components/ProveedorForm";
import ModalProveedor from "@/components/ModalProveedor";
import Link from "next/link";

export default function ProveedorPage() {
  const [proveedor, setProveedor] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<any | null>(null);

  // 🔎 filtros
  const [filters, setFilters] = useState({
    nombre: "",
    cuit: "",
    razon_social: "",
    email: "",
    estado: "",
  });

  useEffect(() => {
    fetchProveedor();
  }, []);

  async function fetchProveedor() {
    const res = await fetch("/api/v1/proveedor");
    const data = await res.json();
    setProveedor(data);
  }

  const filtered = proveedor.filter((p) => {
    return (
      (!filters.nombre ||
        p.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) &&
      (!filters.cuit ||
        p.cuit.toLowerCase().includes(filters.cuit.toLowerCase())) &&
      (!filters.razon_social ||
        p.razon_social
          .toLowerCase()
          .includes(filters.razon_social.toLowerCase())) &&
      (!filters.email ||
        p.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.estado ||
        p.estado.toLowerCase() == filters.estado.toLowerCase())
    );
  });

  // 📄 paginación
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 👇 Eliminar producto con SweetAlert
  async function handleDelete(id: number) {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    const res = await fetch(`/api/v1/proveedor?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchProveedor();
      Swal.fire(
        "Eliminado",
        "El proveedor ha sido eliminado con éxito",
        "success"
      );
    } else {
      const err = await res.json();
      Swal.fire("Error", err.error || "Error al eliminar proveedor", "error");
    }
  }

  function handleEdit(proveedor: any) {
    setEditingProveedor(proveedor);
    setShowForm(true);
  }

  return (
    <div>
      <main style={{ padding: "2rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          Proveedores
        </h1>

        <div className="mb-4 flex flex-wrap gap-3">
          <button
            onClick={() => {
              setEditingProveedor(null);
              setShowForm(true);
            }}
            className="btn btn-primary"
          >
            Agregar proveedor
          </button>

          <Link href="/proveedor/comprobante" className="btn btn-accent">
            Comprobantes
          </Link>
        </div>

        {/* 🔎 Filtros */}
        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Filtrar por nombre"
            value={filters.nombre}
            onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
          />
          <input
            type="text"
            placeholder="Filtrar por cuit"
            value={filters.cuit}
            onChange={(e) => setFilters({ ...filters, cuit: e.target.value })}
          />
          <input
            type="text"
            placeholder="Filtrar por razon social"
            value={filters.razon_social}
            onChange={(e) =>
              setFilters({ ...filters, razon_social: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Filtrar por email"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
          />
          <select
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="select select-bordered w-full"
          >
            <option value="">Todos</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>

        {/* 📊 Tabla */}
        <ProveedoresTable
          proveedores={paginated}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {/* 📄 Controles de paginación */}
        <div style={{ marginTop: "1rem" }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ marginRight: "0.5rem" }}
          >
            ⬅ Anterior
          </button>
          <span>
            Página {page} de {totalPages || 1}
          </span>
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            style={{ marginLeft: "0.5rem" }}
          >
            Siguiente ➡
          </button>
        </div>

        {/* 📝 Modal con formulario */}
        {showForm && (
          <ModalProveedor onClose={() => setShowForm(false)}>
            <h2>
              {editingProveedor ? "Editar proveedor" : "Agregar proveedor"}
            </h2>
            <ProveedorForm
              proveedor={editingProveedor}
              onSuccess={() => {
                fetchProveedor();
                setShowForm(false);
              }}
            />
          </ModalProveedor>
        )}
      </main>
    </div>
  );
}
