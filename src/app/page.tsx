"use client";

import { useEffect, useState } from "react";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/ProductForm";
import Modal from "./components/Modal";

export default function HomePage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    const res = await fetch("/api/v1/prod");
    const data = await res.json();
    setProductos(data);
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1
        style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Productos
      </h1>

      <button onClick={() => setShowForm(true)}>Agregar producto</button>

      <ProductTable productos={productos} />

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2>Agregar producto</h2>
          <ProductForm
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
