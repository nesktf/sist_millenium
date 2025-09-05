// app/components/MovimientoForm.tsx
"use client";

import { useState, useEffect } from "react";
import { DepositoPostAction } from "../api/v1/deposito/route";
import { TipoMovimiento } from "@/generated/prisma";

const prefix_map = new Map([
  [TipoMovimiento.INGRESO.toString(), "ING-"],
  [TipoMovimiento.EGRESO.toString(), "EGR-"],
  [TipoMovimiento.TRANSFERENCIA.toString(), "TRA-"],
]);

export default function MovimientoForm({
  onSuccess,
  movimiento,
}: {
  onSuccess: () => void;
  movimiento?: any;
}) {
  const [form, setForm] = useState({
    id_articulo: "",
    cantidad: "",
    tipo: "INGRESO",
    id_dst: "",
    id_src: "",
    comprobante: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (movimiento) {
      setForm({
        id_articulo: movimiento.id_articulo?.toString() || "",
        cantidad: movimiento.cantidad?.toString() || "",
        tipo: movimiento.tipo || "INGRESO",
        id_dst: movimiento.id_dst.toString() || "",
        id_src: movimiento.id_src.toString() || "",
        comprobante: movimiento.comprobante || "",
      });
    }
  }, [movimiento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!form.id_articulo || !form.cantidad || !form.id_dst) {
      setError("Los campos Artículo, Cantidad y Depósito son obligatorios");
      return;
    }
    if (!form.comprobante) {
      setError("Comprobante inválido");
      return;
    }
    if (form.tipo == TipoMovimiento.TRANSFERENCIA && !form.id_src) {
      setError("Depósito fuente es necesario en transferencia");
      return;
    }
    if (parseInt(form.cantidad) <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    let comprobante = prefix_map.get(form.tipo)+parseInt(form.comprobante).toString();
    const api_data = {
      action: DepositoPostAction.new_movimiento,
      id_dst: Number(form.id_dst),
      id_src: Number(form.id_src) || null,
      tipo: form.tipo,
      comprobante: comprobante,
      articulos: [{id: Number(form.id_articulo), stock: Number(form.cantidad)}],
    }

    await fetch("/api/v1/deposito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(api_data),
    })
    .then((res) => {
      return res.json();
    })
    .then((json_res) => {
      if (json_res.error) {
        console.log(json_res.error);
        setError(json_res.error);
      } else {
        setForm({
          id_articulo: "",
          cantidad: "",
          tipo: "INGRESO",
          id_dst: "",
          id_src: "",
          comprobante: "",
        });
        setError("");
        onSuccess();
      }
    })
    .catch((err) => {
      console.log(err);
      setError(error || "Error al guardar movimiento");
    })
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {/* Radio buttons para tipo de movimiento */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontWeight: "bold" }}>Tipo de Movimiento:</label>
        <div style={{ display: "flex", gap: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <input
              type="radio"
              name="tipo"
              value={TipoMovimiento.INGRESO}
              checked={form.tipo === "INGRESO"}
              onChange={handleChange}
            />
            Ingreso
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <input
              type="radio"
              name="tipo"
              value={TipoMovimiento.EGRESO}
              checked={form.tipo === "EGRESO"}
              onChange={handleChange}
            />
            Egreso
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <input
              type="radio"
              name="tipo"
              value={TipoMovimiento.TRANSFERENCIA}
              checked={form.tipo === "TRANSFERENCIA"}
              onChange={handleChange}
            />
            Movimiento de stock
          </label>
        </div>
      </div>

      <input
        name="id_dst"
        value={form.id_dst}
        onChange={handleChange}
        placeholder="Depósito (ID)"
        type="number"
        required
      />

      <input
        name="id_src"
        value={form.id_src}
        onChange={handleChange}
        placeholder="Deposito fuente (ID)"
        type="number"
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
        name="comprobante"
        value={form.comprobante}
        onChange={handleChange}
        placeholder="Número de Comprobante"
        type="number"
        min="1"
        required
      />
      
      <button type="submit">
        {movimiento ? "Guardar cambios" : "Aceptar"}
      </button>
    </form>
  );
}
