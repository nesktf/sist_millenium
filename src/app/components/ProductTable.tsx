"use client";

export default function ProductTable({ productos }: { productos: any[] }) {
  return (
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
          <th style={thStyle}>Acciones</th>
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
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.75rem",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem",
};
