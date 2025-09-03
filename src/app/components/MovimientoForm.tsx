// app/components/MovimientoForm.tsx
"use client";

import { useState, useEffect } from "react";

export default function MovimientoForm({
  onSuccess,
  movimiento,
}: {
  onSuccess: () => void;
  movimiento?: any;
}) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0], // fecha actual por defecto
    id_articulo: "",
    cantidad: "",
    tipo: "INGRESO",
    id_deposito: "",
    num_comprobante: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (movimiento) {
      setForm({
        fecha: movimiento.fecha?.split('T')[0] || new Date().toISOString().split('T')[0],
        id_articulo: movimiento.id_articulo?.toString() || "",
        cantidad: movimiento.cantidad?.toString() || "",
        tipo: movimiento.tipo || "INGRESO",
        id_deposito: movimiento.id_deposito?.toString() || "",
        num_comprobante: movimiento.num_comprobante || "",
      });
    }
  }, [movimiento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!form.id_articulo || !form.cantidad || !form.id_deposito) {
      setError("Los campos Artículo, Cantidad y Depósito son obligatorios");
      return;
    }

    if (parseInt(form.cantidad) <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    const body = {
      fecha_hora: new Date(form.fecha + 'T00:00:00').toISOString(),
      tipo: form.tipo,
      id_deposito: Number(form.id_deposito),
      num_comprobante: form.num_comprobante.trim() || null,
      detalles: [{
        id_articulo: Number(form.id_articulo),
        cantidad: Number(form.cantidad)
      }]
    };

    const res = await fetch("/api/v1/movimientos", {
      method: movimiento ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movimiento ? { id: movimiento.id, ...body } : body),
    });

    if (res.ok) {
      setForm({
        fecha: new Date().toISOString().split('T')[0],
        id_articulo: "",
        cantidad: "",
        tipo: "INGRESO",
        id_deposito: "",
        num_comprobante: "",
      });
      setError("");
      onSuccess();
    } else {
      const err = await res.json();
      setError(err.error || "Error al guardar movimiento");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <input
        name="fecha"
        type="date"
        value={form.fecha}
        onChange={handleChange}
        required
        style={{ padding: "0.5rem" }}
      />
      
      {/* Radio buttons para tipo de movimiento */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontWeight: "bold" }}>Tipo de Movimiento:</label>
        <div style={{ display: "flex", gap: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <input
              type="radio"
              name="tipo"
              value="INGRESO"
              checked={form.tipo === "INGRESO"}
              onChange={handleChange}
            />
            Ingreso
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <input
              type="radio"
              name="tipo"
              value="EGRESO"
              checked={form.tipo === "EGRESO"}
              onChange={handleChange}
            />
            Egreso
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <input
              type="radio"
              name="tipo"
              value="TRANSFERENCIA"
              checked={form.tipo === "TRANSFERENCIA"}
              onChange={handleChange}
            />
            Movimiento de stock
          </label>
        </div>
      </div>

      <input
        name="id_deposito"
        value={form.id_deposito}
        onChange={handleChange}
        placeholder="Depósito (ID)"
        type="number"
        required
      />
      
      <input
        name="id_articulo"
        value={form.id_articulo}
        onChange={handleChange}
        placeholder="Artículo (ID)"
        type="number"
        required
      />
      
      <input
        name="cantidad"
        value={form.cantidad}
        onChange={handleChange}
        placeholder="Cantidad"
        type="number"
        min="1"
        required
      />
      
      <input
        name="num_comprobante"
        value={form.num_comprobante}
        onChange={handleChange}
        placeholder="Número de Comprobante (opcional)"
      />
      
      <button type="submit">
        {movimiento ? "Guardar cambios" : "Aceptar"}
      </button>
    </form>
  );
}