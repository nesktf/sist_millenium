"use client";

export default function ProveedoresTable({
  proveedores,
  onDelete,
  onEdit,
}: {
  proveedores: any[];
  onDelete: (id: number) => void;
  onEdit: (proveedor: any) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full text-base-content">
        <thead className="bg-base-200">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>CUIT</th>
            <th>Razon Social</th>
            <th>Email</th>
            <th>Estado</th>

            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((prov) => (
            <tr key={prov.id}>
              <td>{prov.id}</td>
              <td>{prov.nombre}</td>
              <td>{prov.cuit}</td>
              <td>{prov.razon_social}</td>
              <td>{prov.email}</td>
              <td>{prov.estado}</td>

              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(prov)}
                    className="btn btn-warning btn-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(prov.id)}
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
