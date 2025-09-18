"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

enum EstadoProveedor {
  activo = "ACTIVO",
  inactivo = "INACTIVO",
}

export default function ProveedorForm({
  onSuccess,
  proveedor,
}: {
  onSuccess: () => void;
  proveedor?: any;
}) {
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    cuit: "",
    razon_social: "",
    domicilio: "",
    email: "",
    estado: "",
  });

  useEffect(() => {
    console.log("Proveedor recibido:", proveedor);

    if (proveedor) {
      setForm({
        id: proveedor.id || null,
        nombre: proveedor.nombre || "",
        cuit: proveedor.cuit || "",
        razon_social: proveedor.razon_social || "",
        domicilio: proveedor.domicilio || "",
        email: proveedor.email || "",
        estado: proveedor.estado ? proveedor.estado.toUpperCase() : "",
      });
    }
  }, [proveedor]);

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
      cuit: form.cuit.trim(),
      razon_social: form.razon_social.trim(),
      domicilio: form.domicilio.trim(),
      email: form.email.trim(),
      estado: form.estado,
    };

    console.log("Enviando datos:", body); // <--- aquí

    const res = await fetch("/api/v1/proveedor", {
      method: proveedor ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setForm({
        id: null,
        nombre: "",
        cuit: "",
        razon_social: "",
        domicilio: "",
        email: "",
        estado: "",
      });
      Swal.fire({
        title: "¡Éxito!",
        text: proveedor
          ? "El proveedor fue actualizado correctamente."
          : "El proveedor fue agregado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      onSuccess();
    } else {
      const err = await safeJson(res);
      Swal.fire({
        title: "Error",
        text: err?.error || "Error al guardar proveedor",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold">
        {proveedor ? "Editar proveedor" : "Agregar proveedor"}
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
          <span className="label-text">CUIT</span>
          <input
            name="cuit"
            value={form.cuit}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </label>
      </div>

      {/* Razon social / Domicilio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="form-control">
          <span className="label-text">Razon Social</span>
          <input
            name="razon_social"
            value={form.razon_social}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </label>
        <label className="form-control">
          <span className="label-text">Domicilio</span>
          <input
            name="domicilio"
            value={form.domicilio}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </label>
      </div>

      {/* Email / Estado*/}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="form-control">
          <span className="label-text">Email</span>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </label>

        <label className="form-control">
          <span className="label-text">Estado</span>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="">Seleccione estado</option>
            {Object.values(EstadoProveedor).map((estado) => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button type="submit" className="btn btn-primary">
          {proveedor ? "Guardar cambios" : "Aceptar"}
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
