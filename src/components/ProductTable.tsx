"use client";

export default function ProductTable({
  productos,
  onDelete,
  onEdit,
}: {
  productos: any[];
  onDelete: (id: number) => void;
  onEdit: (producto: any) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full text-base-content">
        <thead className="bg-base-200">
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Marca</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.id}</td>
              <td>{prod.codigo}</td>
              <td>{prod.nombre}</td>
              <td>{prod.categoria?.nombre || "-"}</td>
              <td>{prod.marca?.nombre || "-"}</td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(prod)}
                    className="btn btn-warning btn-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(prod.id)}
                    className="btn btn-error btn-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
