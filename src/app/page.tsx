"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/ProductForm";
import Modal from "./components/Modal";
import Swal from "sweetalert2";

export default function HomePage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // 🔎 filtros
  const [filters, setFilters] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    marca: "",
  });

  // 📄 paginación
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    const res = await fetch("/api/v1/prod");
    const data = await res.json();
    setProductos(data);
  }

  const filtered = productos.filter((p) => {
    return (
      (!filters.codigo ||
        p.codigo.toLowerCase().includes(filters.codigo.toLowerCase())) &&
      (!filters.nombre ||
        p.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) &&
      (!filters.categoria ||
        p.categoria?.nombre
          ?.toLowerCase()
          .includes(filters.categoria.toLowerCase())) &&
      (!filters.marca ||
        p.marca?.nombre?.toLowerCase().includes(filters.marca.toLowerCase()))
    );
  });

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

    const res = await fetch(`/api/v1/prod?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchProductos();
      Swal.fire(
        "Eliminado",
        "El producto ha sido eliminado con éxito",
        "success"
      );
    } else {
      const err = await res.json();
      Swal.fire("Error", err.error || "Error al eliminar producto", "error");
    }
  }

  function handleEdit(producto: any) {
    setEditingProduct(producto);
    setShowForm(true);
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1
        style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Productos
      </h1>
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          Agregar producto
        </button>

        <Link href="/movimientos" className="btn btn-secondary">
          Ver Movimientos
        </Link>

        <Link href="/stock" className="btn btn-accent">
          Consultar stock
        </Link>
      </div>

      {/* 🔎 Filtros */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="Filtrar por código"
          value={filters.codigo}
          onChange={(e) => setFilters({ ...filters, codigo: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filtrar por nombre"
          value={filters.nombre}
          onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filtrar por categoría"
          value={filters.categoria}
          onChange={(e) =>
            setFilters({ ...filters, categoria: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Filtrar por marca"
          value={filters.marca}
          onChange={(e) => setFilters({ ...filters, marca: e.target.value })}
        />
      </div>

      {/* 📊 Tabla */}
      <ProductTable
        productos={paginated}
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
        <Modal onClose={() => setShowForm(false)}>
          <h2>{editingProduct ? "Editar producto" : "Agregar producto"}</h2>
          <ProductForm
            producto={editingProduct}
            onSuccess={() => {
              fetchProductos();
              setShowForm(false);
            }}
          />
        </Modal>
      )}
    </main>
  );
}
