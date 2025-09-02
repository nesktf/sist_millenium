"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/ProductForm";
import Modal from "./components/Modal";

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

  // 👇 Eliminar producto
  async function handleDelete(id: number) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    const res = await fetch(`/api/v1/prod?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchProductos();
    else {
      const err = await res.json();
      console.error(err.error || "Error al eliminar producto");
    }
  }

  function handleEdit(producto: any) {
    setEditingProduct(producto);
    setShowForm(true);
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Productos
      </h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
        >
          Agregar producto
      </button>
        <Link href="/stock">
          <button>Consultar stock</button>
        </Link>
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
            onSuccess={() => { fetchProductos(); setShowForm(false); }}
          />
        </Modal>
      )}
    </main>
  );
}
