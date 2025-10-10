"use client";

export default function DepositoTable({
  deposito,
  onDelete,
  onEdit,
}: {
  deposito: any[];
  onDelete: (id: number) => void;
  onEdit: (deposito: any) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full text-base-content">
        <thead className="bg-base-200">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Direccion</th>
            <th>Cap_max</th>

            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {deposito.map((dep) => (
            <tr key={dep.id}>
              <td>{dep.id}</td>
              <td>{dep.nombre}</td>
              <td>{dep.direccion}</td>
              <td>{dep.cap_max}</td>

              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(dep)}
                    className="btn btn-warning btn-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(dep.id)}
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
