"use client";

import DepositoTable from "../components/DepositoTable";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DepositoForm from "../components/DepositoForm";
import ModalDeposito from "../components/ModalDeposito";
import Link from "next/link";

export default function DepositoPage() {
  const [deposito, setDeposito] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDeposito, setEditingDeposito] = useState<any | null>(null);

  // 🔎 filtros
  const [filters, setFilters] = useState({
    nombre: "",
    direccion: "",
  });

  useEffect(() => {
    fetchDeposito();
  }, []);

  async function fetchDeposito() {
    const res = await fetch("/api/v1/deposito2");
    const data = await res.json();
    setDeposito(data);
  }

  const filtered = deposito.filter((p) => {
    return (
      (!filters.nombre ||
        p.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) &&
      (!filters.direccion ||
        p.direccion.toLowerCase().includes(filters.direccion.toLowerCase()))
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

    const res = await fetch(`/api/v1/deposito2?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchDeposito();
      Swal.fire(
        "Eliminado",
        "El deposito ha sido eliminado con éxito",
        "success"
      );
    } else {
      const err = await res.json();
      Swal.fire("Error", err.error || "Error al eliminar deposito", "error");
    }
  }

  function handleEdit(deposito: any) {
    setEditingDeposito(deposito);
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
          Deposito
        </h1>

        <div className="mb-4 flex flex-wrap gap-3">
          <button
            onClick={() => {
              setEditingDeposito(null);
              setShowForm(true);
            }}
            className="btn btn-primary"
          >
            Agregar Deposito
          </button>
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
            value={filters.direccion}
            onChange={(e) =>
              setFilters({ ...filters, direccion: e.target.value })
            }
          />
        </div>

        {/* 📊 Tabla */}
        <DepositoTable
          deposito={paginated}
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
          <ModalDeposito onClose={() => setShowForm(false)}>
            <h2>{editingDeposito ? "Editar deposito" : "Agregar deposito"}</h2>
            <DepositoForm
              deposito={editingDeposito}
              onSuccess={() => {
                fetchDeposito();
                setShowForm(false);
              }}
            />
          </ModalDeposito>
        )}
      </main>
    </div>
  );
}
