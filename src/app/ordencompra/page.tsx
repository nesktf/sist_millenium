"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { APIFormaPago } from "../../app/api/v1/orden-compra/types/route"; // import enum compartido

type ArticuloData = {
  id: number;
  nombre: string;
};

type ArticuloEntry = {
  articulo: ArticuloData;
  precio: number;
  cantidad: number;
};

export default function OrdenCompraPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [articulos, setArticulos] = useState<Array<ArticuloData>>([]);
  const [currEntry, setCurrEntry] = useState<ArticuloEntry>({
    articulo: { id: 0, nombre: "" },
    precio: 0,
    cantidad: 0,
  });
  const [entries, setEntries] = useState<Array<ArticuloEntry>>([]);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [formaPago, setFormaPago] = useState<APIFormaPago>(
    APIFormaPago.EFECTIVO
  );

  const [fechaEsperada, setFechaEsperada] = useState<string>("");
  const [idDeposito, setIdDeposito] = useState<number>(0);
  const [idProveedor, setIdProveedor] = useState<number>(0);

  const [depositos, setDepositos] = useState<{ id: number; nombre: string }[]>(
    []
  );
  const [proveedores, setProveedores] = useState<
    { id: number; nombre: string }[]
  >([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const body = await fetch("/api/v1/prod");
      const json = await body.json();
      const arts = json.map((item: any) => ({
        id: item.id,
        nombre: item.nombre,
      }));
      setArticulos(arts);
      if (arts.length > 0)
        setCurrEntry({
          articulo: arts[0],
          precio: 0,
          cantidad: 0,
        });

      // Depósitos
      const depRes = await fetch("/api/v1/deposito2");
      const deps = await depRes.json();
      console.log("Depósitos:", deps);

      setDepositos(deps);

      // Proveedores
      const provRes = await fetch("/api/v1/proveedor");
      const provs = await provRes.json();
      console.log("Proveedores:", provs);

      setProveedores(provs);

      // Opcional: inicializar selects
      if (deps.length > 0) setIdDeposito(deps[0].id);
      if (provs.length > 0) setIdProveedor(provs[0].id);
    } catch (err) {
      console.log(`${err}`);
      setArticulos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name == "id_articulo") {
      const selected = articulos.find((art) => art.id == parseInt(value));
      if (!selected) {
        return;
      }
      setCurrEntry({
        ...currEntry,
        articulo: { id: selected.id, nombre: selected.nombre },
      });
    } else {
      setCurrEntry({
        ...currEntry,
        [name]: value === "" ? 0 : parseInt(value),
      });
    }
  };

  const handleAddEntry = () => {
    if (currEntry.articulo.id === 0) {
      void Swal.fire({
        title: "Seleccioná un artículo",
        text: "Elegí un artículo válido antes de agregarlo a la orden.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    if (currEntry.precio <= 0) {
      void Swal.fire({
        title: "Precio inválido",
        text: "Ingresá un precio mayor a cero para el artículo seleccionado.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    if (currEntry.cantidad <= 0) {
      void Swal.fire({
        title: "Cantidad inválida",
        text: "Ingresá una cantidad mayor a cero para el artículo seleccionado.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const prev_entry = entries.find(
      (entry) => entry.articulo.id == currEntry.articulo.id
    );
    if (prev_entry) {
      void Swal.fire({
        title: "Artículo duplicado",
        text: "Ese artículo ya fue agregado. Eliminá el existente o elegí otro.",
        icon: "info",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    let new_entries = [
      ...entries,
      {
        articulo: {
          id: currEntry.articulo.id,
          nombre: currEntry.articulo.nombre,
        },
        precio: currEntry.precio,
        cantidad: currEntry.cantidad,
      },
    ];
    setTotalEntries(
      new_entries.reduce(
        (total, entry) => total + entry.precio * entry.cantidad,
        0
      )
    );
    setEntries(new_entries);
  };

  const handleDeleteEntry = (idx: number) => {
    let new_entries = entries.filter((_, entry_idx) => idx != entry_idx);
    setTotalEntries(
      new_entries.reduce(
        (total, entry) => total + entry.precio * entry.cantidad,
        0
      )
    );
    setEntries(new_entries);
  };

  const handleSubmit = async () => {
    if (entries.length === 0) {
      void Swal.fire({
        title: "Sin artículos",
        text: "Agregá al menos un artículo antes de registrar la orden.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "¿Registrar orden de compra?",
      text: "Se creará la orden con los artículos seleccionados.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    const fechaIso = fechaEsperada
      ? new Date(fechaEsperada).toISOString()
      : undefined;

    try {
      const response = await fetch("/api/v1/orden-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: entries.map((entry) => ({
            id: entry.articulo.id,
            cantidad: entry.cantidad,
            precio: entry.precio,
          })),
          forma_pago: formaPago,
          fecha_esperada: fechaIso,
          id_deposito: idDeposito,
          id_proveedor: idProveedor,
        }),
      });

      const json = await response.json();
      if (!response.ok || json.error) {
        throw json;
      }

      await Swal.fire({
        title: "¡Orden de compra registrada!",
        html: `<p class="text-base">Se generó correctamente.</p><p class="mt-2 font-semibold">ID: ${json.data.id}</p>`,
        icon: "success",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
        background: "#f3f4f6",
        color: "#1f2937",
      });

      setEntries([]);
      setTotalEntries(0);
      setCurrEntry({
        articulo: { id: 0, nombre: "" },
        precio: 0,
        cantidad: 0,
      });
      setFormaPago(APIFormaPago.EFECTIVO);
    } catch (err: any) {
      console.error("❌ Error detallado:", err);
      void Swal.fire({
        title: "No pudimos registrar la orden",
        text:
          err?.error ??
          err?.message ??
          "Ocurrió un inconveniente al registrar la orden.",
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <main style={{ padding: "2rem" }}>
        <div className="mb-4 flex flex-wrap gap-3">
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Cargar orden de compra
          </h1>
        </div>

        <div className="p-3 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Datos de la orden</h2>
          
          <div className="form-control w-full">
            <label htmlFor="id_proveedor" className="label py-1">
              <span className="label-text">Proveedor</span>
            </label>
            <select
              id="id_proveedor"
              name="id_proveedor"
              value={idProveedor}
              onChange={(e) => setIdProveedor(Number(e.target.value))}
              className="select select-sm select-bordered w-full"
            >
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full">
            <label htmlFor="fecha_esperada" className="label py-1">
              <span className="label-text">Fecha esperada</span>
            </label>
            <input
              type="date"
              id="fecha_esperada"
              name="fecha_esperada"
              value={fechaEsperada}
              onChange={(e) => setFechaEsperada(e.target.value)}
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div className="form-control w-full">
            <label htmlFor="id_deposito" className="label py-1">
              <span className="label-text">Depósito</span>
            </label>
            <select
              id="id_deposito"
              name="id_deposito"
              value={idDeposito}
              onChange={(e) => setIdDeposito(Number(e.target.value))}
              className="select select-sm select-bordered w-full"
            >
              {depositos.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.nombre}
                </option>
              ))}
            </select>
          </div>

          
          <div className="form-control w-full">
            <label htmlFor="forma_pago" className="label py-1">
              <span className="label-text">Forma de pago</span>
            </label>
            <select
              id="forma_pago"
              name="forma_pago"
              value={formaPago}
              onChange={(e) => setFormaPago(parseInt(e.target.value))}
              className="select select-sm select-bordered w-full"
            >
              <option value={APIFormaPago.EFECTIVO}>EFECTIVO</option>
              <option value={APIFormaPago.TRANSFERENCIA}>TRANSFERENCIA</option>
            </select>
          </div>
        </div>

        <div className="p-3 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Agregar artículo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <div className="form-control w-full md:col-span-2">
              <label htmlFor="id_articulo" className="label py-1">
                <span className="label-text">Artículo</span>
              </label>
              <select
                id="id_articulo"
                name="id_articulo"
                value={currEntry.articulo.id}
                onChange={handleEntryChange}
                className="select select-sm select-bordered w-full"
              >
                <option value="" disabled>
                  Seleccionar artículo
                </option>
                {articulos.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label htmlFor="cantidad" className="label py-1">
                <span className="label-text">Cantidad</span>
              </label>
              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min={0}
                value={currEntry.cantidad}
                onChange={handleEntryChange}
                placeholder="0"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label htmlFor="precio_unitario" className="label py-1">
                <span className="label-text">Precio</span>
              </label>
              <input
                id="precio"
                name="precio"
                type="number"
                min={0}
                value={currEntry.precio}
                onChange={handleEntryChange}
                placeholder="0"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <button
              type="button"
              onClick={handleAddEntry}
              className="btn btn-secondary btn-sm mt-3"
            >
              Agregar a la lista
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-base-content">
            <thead className="bg-base-200">
              <tr>
                <th>Artículo</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {entries.length == 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    Aún no se han agregado artículos.
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{entry.articulo.nombre}</td>
                    <td className="text-right">{entry.cantidad}</td>
                    <td className="text-right">{entry.precio}</td>
                    <td className="text-right">
                      {entry.cantidad * entry.precio}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(idx)}
                        className="btn btn-error btn-xs"
                      >
                        Eliiminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-right">
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Total: ${totalEntries}
          </h1>
        </div>
        <button
          type="submit"
          className="btn btn-primary mt-3"
          onClick={handleSubmit}
        >
          Guardar orden
        </button>
      </main>
    </div>
  );
}
