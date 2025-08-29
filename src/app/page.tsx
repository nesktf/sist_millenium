"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    id_categoria: "",
    id_marca: "",
    u_medida: "",
  });

  const [error, setError] = useState(""); // estado de error

  useEffect(() => {
    // fetchProductos() se ejecuta solo una vez al cargar la página
    fetchProductos();
  }, []);

  async function fetchProductos() {
    const res = await fetch("/api/v1/prod"); // hace una solicitud HTTP
    const data = await res.json(); // Esto convierte la respuesta (res) en un objeto JavaScript
    setProductos(data); // Actualiza el estado del componente con la lista de productos que obtuviste del servidor
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // se ejecuta cada vez que el usuario escribe algo en un campo de texto
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // se va a ejecutar cuando el usuario envíe el formulario
    e.preventDefault(); // e.preventDefault() evita que la pagina se recargue

    const res = await fetch("/api/v1/prod", {
      // fetch es una funcion para hacer solicitudes HTTP , await espera que la solicitud termine
      method: "POST", // Metodo para enviar datos
      headers: { "Content-Type": "application/json" }, // Indicamos que es formato json
      body: JSON.stringify({
        // body es el cuerpo de la solicitud - JSON.stringify convierte un objeto de js a json
        codigo: form.codigo, // Enviamos los valores del form
        nombre: form.nombre,
        id_categoria: form.id_categoria ? Number(form.id_categoria) : undefined,
        id_marca: form.id_marca ? Number(form.id_marca) : undefined,
        u_medida: form.u_medida || undefined,
      }),
    });

    if (res.ok) {
      // Si es exitoso el cambio, se limpia todo el formulario
      setForm({
        codigo: "",
        nombre: "",
        id_categoria: "",
        id_marca: "",
        u_medida: "",
      });
      setError(""); // Limpiar error si todo salió bien
      fetchProductos(); // Volver a cargar los productos (actualizamos)
    } else {
      const err = await res.json(); // Si no es exitosa, obtenemos el error
      setError(err.error || "Error al agregar producto"); // Mostrar error
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1
        style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Productos
      </h1>

      {/* Mostrar mensaje de error si existe */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}
      >
        <input
          name="codigo" // El nombre del campo, usado para identificarlo
          value={form.codigo} // El valor actual del campo, tomado del estado "form"
          onChange={handleChange} // // Función que se ejecuta cuando el usuario escribe algo
          placeholder="Código"
          required // Indica que este campo es obligatorio
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
          type="text" // ✅ tipo texto por defecto
        />
        <input
          name="id_marca"
          value={form.id_marca}
          onChange={handleChange}
          placeholder="Marca (ID)"
          type="text" // ✅ tipo texto por defecto
        />
        <input
          name="u_medida"
          value={form.u_medida}
          onChange={handleChange}
          placeholder="Unidad"
        />
        <button type="submit">Agregar</button>
      </form>

      {/* Tabla de productos */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
        }}
      >
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Código</th>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Categoría</th>
            <th style={thStyle}>Marca</th>
            <th style={thStyle}>Unidad</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod) => (
            <tr key={prod.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={tdStyle}>{prod.id}</td>
              <td style={tdStyle}>{prod.codigo}</td>
              <td style={tdStyle}>{prod.nombre}</td>
              <td style={tdStyle}>{prod.categoria?.nombre || "-"}</td>
              <td style={tdStyle}>{prod.marca?.nombre || "-"}</td>
              <td style={tdStyle}>{prod.u_medida || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

// estilos para las celdas
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.75rem",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem",
};
