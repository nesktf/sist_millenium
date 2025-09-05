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
        id_categoria:
          (producto.id_categoria ?? producto?.categoria?.id ?? "")
            .toString(),
        id_marca: (producto.id_marca ?? producto?.marca?.id ?? "").toString(),
      });
    }
  }, [producto]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const body = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      id_categoria: form.id_categoria.trim()
        ? Number(form.id_categoria)
        : undefined,
      id_marca: form.id_marca.trim() ? Number(form.id_marca) : undefined,
      ...(producto?.id ? { id: producto.id } : {}),
    };

    const res = await fetch("/api/v1/prod", {
      method: producto ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setForm({ codigo: "", nombre: "", id_categoria: "", id_marca: "" });
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
      const err = await safeJson(res);
      Swal.fire({
        title: "Error",
        text: err?.error || "Error al guardar producto",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    }
  }

return (
  <form onSubmit={handleSubmit} className="space-y-6">
    <h2 className="text-2xl font-semibold">
      {producto ? "Editar producto" : "Agregar producto"}
    </h2>

    {/* Código / Nombre */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="form-control">
        <span className="label-text">Código</span>
        <input
          name="codigo"
          value={form.codigo}
          onChange={handleChange}
          placeholder="TEC001"
          required
          className="input input-bordered w-full"
        />
      </label>

      <label className="form-control">
        <span className="label-text">Nombre</span>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Teclado Mecánico RGB"
          required
          className="input input-bordered w-full"
        />
      </label>
    </div>

    {/* Categoría / Marca */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="form-control">
        <span className="label-text">Categoría (ID)</span>
        <input
          name="id_categoria"
          value={form.id_categoria}
          onChange={handleChange}
          placeholder="Opcional"
          inputMode="numeric"
          className="input input-bordered w-full"
        />
      </label>

      <label className="form-control">
        <span className="label-text">Marca (ID)</span>
        <input
          name="id_marca"
          value={form.id_marca}
          onChange={handleChange}
          placeholder="Opcional"
          inputMode="numeric"
          className="input input-bordered w-full"
        />
      </label>
    </div>

    <div className="mt-2 flex justify-end gap-2">
      <button type="submit" className="btn btn-primary">
        {producto ? "Guardar cambios" : "Aceptar"}
      </button>
    </div>
  </form>
);
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
