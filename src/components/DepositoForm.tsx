"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function DepositoForm({
  onSuccess,
  deposito,
}: {
  onSuccess: () => void;
  deposito?: any;
}) {
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    direccion: "",
    cap_max: "",
  });

  useEffect(() => {
    console.log("Deposito recibido:", deposito);

    if (deposito) {
      setForm({
        id: deposito.id || null,
        nombre: deposito.nombre || "",
        direccion: deposito.direccion || "",
        cap_max: deposito.cap_max || "",
      });
    }
  }, [deposito]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const body = {
      id: form.id,
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      cap_max: form.cap_max.trim(),
    };

    console.log("Enviando datos:", body); // <--- aquí

    const res = await fetch("/api/v1/deposito2", {
      method: deposito ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setForm({
        id: null,
        nombre: "",
        direccion: "",
        cap_max: "",
      });
      Swal.fire({
        title: "¡Éxito!",
        text: deposito
          ? "El deposito fue actualizado correctamente."
          : "El deposito fue agregado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      onSuccess();
    } else {
      const err = await safeJson(res);
      Swal.fire({
        title: "Error",
        text: err?.error || "Error al guardar deposito",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold">
        {deposito ? "Editar deposito" : "Agregar deposito"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="form-control">
          <span className="label-text">Nombre</span>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
          />
        </label>
        <label className="form-control">
          <span className="label-text">Direccion</span>
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </label>
      </div>

      {/* cap_max */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="form-control">
          <span className="label-text">Capacidad Maxima</span>
          <input
            name="cap_max"
            value={form.cap_max}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </label>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button type="submit" className="btn btn-primary">
          {deposito ? "Guardar cambios" : "Aceptar"}
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
