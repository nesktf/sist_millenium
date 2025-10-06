"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

type Opcion = { id: number; nombre: string };

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

  const [categorias, setCategorias] = useState<Opcion[]>([]);
  const [marcas, setMarcas] = useState<Opcion[]>([]);
  const [cargandoOpts, setCargandoOpts] = useState(true);

  useEffect(() => {
    // Cargar opciones (nombres) para los selects
    (async () => {
      try {
        const [rc, rm] = await Promise.all([
          fetch("/api/v1/categorias", { cache: "no-store" }),
          fetch("/api/v1/marcas", { cache: "no-store" }),
        ]);
        const [cats, mks] = await Promise.all([rc.json(), rm.json()]);
        setCategorias(Array.isArray(cats) ? cats : []);
        setMarcas(Array.isArray(mks) ? mks : []);
      } catch {
        // si fallan, dejamos listas vacías (los selects quedarán sin opciones)
      } finally {
        setCargandoOpts(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (producto) {
      setForm({
        codigo: producto.codigo || "",
        nombre: producto.nombre || "",
        id_categoria:
          (producto.id_categoria ?? producto?.categoria?.id ?? "").toString(),
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

      {/* Categoría / Marca con SELECT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="form-control">
          <span className="label-text">Categoría</span>
          <select
            name="id_categoria"
            value={form.id_categoria}
            onChange={handleChange}
            className="select select-bordered w-full"
            disabled={cargandoOpts}
          >
            <option value="">(Sin categoría)</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="form-control">
          <span className="label-text">Marca</span>
          <select
            name="id_marca"
            value={form.id_marca}
            onChange={handleChange}
            className="select select-bordered w-full"
            disabled={cargandoOpts}
          >
            <option value="">(Sin marca)</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
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
