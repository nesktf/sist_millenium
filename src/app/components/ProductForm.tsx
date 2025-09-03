"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ProductForm({
  onSuccess,
  producto,
}: {
  onSuccess: () => void;
  producto?: any;
}) {
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    id_categoria: "",
    id_marca: "",
  });

  useEffect(() => {
    if (producto) {
      setForm({
        codigo: producto.codigo || "",
        nombre: producto.nombre || "",
        id_categoria: producto.id_categoria?.toString() || "",
        id_marca: producto.id_marca?.toString() || "",
      });
    }
  }, [producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      codigo: form.codigo,
      nombre: form.nombre,
      id_categoria: form.id_categoria.trim()
        ? Number(form.id_categoria)
        : undefined,
      id_marca: form.id_marca.trim() ? Number(form.id_marca) : undefined,
    };

    const res = await fetch("/api/v1/prod", {
      method: producto ? "PUT" : "POST", // 👈 decide si crea o edita
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto ? { id: producto.id, ...body } : body),
    });

    if (res.ok) {
      setForm({
        codigo: "",
        nombre: "",
        id_categoria: "",
        id_marca: "",
      });

      Swal.fire({
        title: "¡Éxito!",
        text: producto
          ? "El producto fue actualizado correctamente."
          : "El producto fue agregado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      onSuccess();
    } else {
      const err = await res.json();
      Swal.fire({
        title: "Error",
        text: err.error || "Error al guardar producto",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
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
      <button type="submit">{producto ? "Guardar cambios" : "Aceptar"}</button>
    </form>
  );
}
