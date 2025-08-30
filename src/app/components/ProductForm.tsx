"use client";

import { useState } from "react";

export default function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    id_categoria: "",
    id_marca: "",
    u_medida: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/v1/prod", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: form.codigo,
        nombre: form.nombre,
        id_categoria: form.id_categoria ? Number(form.id_categoria) : undefined,
        id_marca: form.id_marca ? Number(form.id_marca) : undefined,
        u_medida: form.u_medida || undefined,
      }),
    });

    if (res.ok) {
      setForm({
        codigo: "",
        nombre: "",
        id_categoria: "",
        id_marca: "",
        u_medida: "",
      });
      setError("");
      onSuccess(); // 👈 avisar al padre que se completó
    } else {
      const err = await res.json();
      setError(err.error || "Error al agregar producto");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        name="codigo"
        value={form.codigo}
        onChange={handleChange}
        placeholder="Código"
        required
      />
      <input
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Nombre"
        required
      />
      <input
        name="id_categoria"
        value={form.id_categoria}
        onChange={handleChange}
        placeholder="Categoría (ID)"
      />
      <input
        name="id_marca"
        value={form.id_marca}
        onChange={handleChange}
        placeholder="Marca (ID)"
      />
      <input
        name="u_medida"
        value={form.u_medida}
        onChange={handleChange}
        placeholder="Unidad"
      />
      <button type="submit">Aceptar</button>
    </form>
  );
}
