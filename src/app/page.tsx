"use client";

import { useEffect, useState } from "react";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/ProductForm";
import Modal from "./components/Modal";
import Link from 'next/link';

export default function HomePage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    const res = await fetch("/api/v1/prod");
    const data = await res.json();
    setProductos(data);
  }

  // 👇 Eliminar producto
  async function handleDelete(id: number) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    const res = await fetch(`/api/v1/prod?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchProductos();
    } else {
      const err = await res.json();
      alert(err.error || "Error al eliminar producto");
    }
  }

  // 👇 Editar producto
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

      <button
        onClick={() => {
          setEditingProduct(null);
          setShowForm(true);
        }}
      >
        Agregar producto
      </button>
      {/* Boton Ver Movimientos */}
        <Link href="/movimientos">
          <button>
            Ver Movimientos
          </button>
        </Link>

      <ProductTable
        productos={productos}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2>{editingProduct ? "Editar producto" : "Agregar producto"}</h2>
          <ProductForm
            producto={editingProduct} // 👈 le pasamos datos si es edición
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
