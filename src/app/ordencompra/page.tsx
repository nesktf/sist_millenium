"use client";

import { useEffect, useState } from "react";
import { APIFormaPago } from "@/app/api/v1/orden-compra/route";

type ArticuloData = {
  id: number;
  nombre: string;
};

type ArticuloEntry = {
  articulo: ArticuloData;
  precio: number;
  cantidad: number;
};

type ProveedorData = {
  id: number;
  nombre: string;
};

type OrdenInfo = {
  numero: string;
  fechaEmision: string;
  fechaEntrega: string;
  proveedorId: string;
  responsable: string;
  observaciones: string;
  condicionesPago: string;
};

export default function OrdenCompraPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [articulos, setArticulos] = useState<Array<ArticuloData>>([]);
  const [proveedores, setProveedores] = useState<Array<ProveedorData>>([]);
  const [currEntry, setCurrEntry] = useState<ArticuloEntry>({
    articulo: { id: 0, nombre: "" },
    precio: 0,
    cantidad: 0,
  });
  const [entries, setEntries] = useState<Array<ArticuloEntry>>([]);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [formaPago, setFormaPago] = useState<APIFormaPago>(APIFormaPago.EFECTIVO);
  const [ordenInfo, setOrdenInfo] = useState<OrdenInfo>({
    numero: "",
    fechaEmision: "",
    fechaEntrega: "",
    proveedorId: "",
    responsable: "",
    observaciones: "",
    condicionesPago: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [articulosRes, proveedoresRes] = await Promise.all([
          fetch("/api/v1/prod"),
          fetch("/api/v1/proveedor"),
        ]);

        if (articulosRes.ok) {
          const articulosJson = await articulosRes.json();
          const arts = Array.isArray(articulosJson)
            ? articulosJson.map((item: any) => ({ id: item.id, nombre: item.nombre }))
            : [];
          setArticulos(arts);
          if (arts.length > 0) {
            setCurrEntry((prev) => ({ ...prev, articulo: arts[0] }));
          }
        }

        if (proveedoresRes.ok) {
          const proveedoresJson = await proveedoresRes.json();
          const provs = Array.isArray(proveedoresJson)
            ? proveedoresJson.map((prov: any) => ({ id: prov.id, nombre: prov.nombre }))
            : [];
          setProveedores(provs);
        }
      } catch (err) {
        console.error("Error al cargar datos de orden de compra:", err);
        setArticulos([]);
        setProveedores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOrdenInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOrdenInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleEntryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "id_articulo") {
      const selected = articulos.find((art) => art.id === Number(value));
      if (selected) {
        setCurrEntry((prev) => ({ ...prev, articulo: { id: selected.id, nombre: selected.nombre } }));
      }
    } else {
      const parsed = Number(value);
      setCurrEntry((prev) => ({ ...prev, [name]: Number.isFinite(parsed) ? parsed : 0 }));
    }
  };

  const handleAddEntry = () => {
    if (currEntry.precio <= 0) {
      alert("Coloca un precio mayor a 0");
      return;
    }
    if (currEntry.cantidad <= 0) {
      alert("Coloca una cantidad mayor a 0");
      return;
    }
    const yaExiste = entries.some((entry) => entry.articulo.id === currEntry.articulo.id);
    if (yaExiste) {
      alert("Selecciona otro artículo o elimina el existente");
      return;
    }

    const nuevosEntries = [
      ...entries,
      {
        articulo: { id: currEntry.articulo.id, nombre: currEntry.articulo.nombre },
        precio: currEntry.precio,
        cantidad: currEntry.cantidad,
      },
    ];
    setEntries(nuevosEntries);
    setTotalEntries(
      nuevosEntries.reduce((total, entry) => total + entry.precio * entry.cantidad, 0)
    );
    setCurrEntry((prev) => ({ ...prev, precio: 0, cantidad: 0 }));
  };

  const handleDeleteEntry = (idx: number) => {
    const nuevosEntries = entries.filter((_, entryIdx) => idx !== entryIdx);
    setEntries(nuevosEntries);
    setTotalEntries(
      nuevosEntries.reduce((total, entry) => total + entry.precio * entry.cantidad, 0)
    );
  };

  const handleSubmit = async () => {
    const onError = (err: any) => {
      console.error(err);
      alert(`Error: ${err}`);
    };

    try {
      if (!ordenInfo.proveedorId) {
        alert("Selecciona un proveedor");
        return;
      }
      if (!ordenInfo.numero) {
        alert("Ingresa un número de orden");
        return;
      }
      if (!ordenInfo.fechaEmision) {
        alert("Selecciona la fecha de emisión");
        return;
      }
      if (entries.length === 0) {
        alert("Agrega al menos un artículo");
        return;
      }

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
          numero: ordenInfo.numero,
          fecha_emision: ordenInfo.fechaEmision,
          fecha_entrega: ordenInfo.fechaEntrega || null,
          proveedor_id: ordenInfo.proveedorId ? Number(ordenInfo.proveedorId) : null,
          responsable: ordenInfo.responsable || null,
          observaciones: ordenInfo.observaciones || null,
          condiciones_pago: ordenInfo.condicionesPago || null,
        }),
      });
      const json = await response.json();
      if (!response.ok || json.error) {
        onError(json.error ?? "No se pudo guardar la orden");
        return;
      }

      alert(`Orden de compra cargada! ID: ${json.data.id}`);
      setEntries([]);
      setCurrEntry({ articulo: { id: articulos[0]?.id ?? 0, nombre: articulos[0]?.nombre ?? "" }, precio: 0, cantidad: 0 });
      setTotalEntries(0);
      setFormaPago(APIFormaPago.EFECTIVO);
      setOrdenInfo({
        numero: "",
        fechaEmision: "",
        fechaEntrega: "",
        proveedorId: "",
        responsable: "",
        observaciones: "",
        condicionesPago: "",
      });
    } catch (err) {
      onError(err);
    }
  };

  return (
    <div>
      <main style={{ padding: "2rem" }}>
        <div className="mb-4 flex flex-wrap gap-3">
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Cargar orden de compra
          </h1>
        </div>

        <div className="p-3 border rounded-md space-y-3">
          <h2 className="text-lg font-semibold mb-1">Datos generales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <div className="form-control w-full">
              <label htmlFor="numero" className="label py-1"><span className="label-text">Número de orden</span></label>
              <input
                id="numero"
                name="numero"
                value={ordenInfo.numero}
                onChange={handleOrdenInfoChange}
                className="input input-sm input-bordered w-full"
                placeholder="OC-0001"
              />
            </div>
            <div className="form-control w-full">
              <label htmlFor="fechaEmision" className="label py-1"><span className="label-text">Fecha de emisión</span></label>
              <input
                id="fechaEmision"
                name="fechaEmision"
                type="date"
                value={ordenInfo.fechaEmision}
                onChange={handleOrdenInfoChange}
                className="input input-sm input-bordered w-full"
              />
            </div>
            <div className="form-control w-full">
              <label htmlFor="fechaEntrega" className="label py-1"><span className="label-text">Fecha estimada de entrega</span></label>
              <input
                id="fechaEntrega"
                name="fechaEntrega"
                type="date"
                value={ordenInfo.fechaEntrega}
                onChange={handleOrdenInfoChange}
                className="input input-sm input-bordered w-full"
              />
            </div>
            <div className="form-control w-full">
              <label htmlFor="proveedorId" className="label py-1"><span className="label-text">Proveedor</span></label>
              <select
                id="proveedorId"
                name="proveedorId"
                value={ordenInfo.proveedorId}
                onChange={handleOrdenInfoChange}
                className="select select-sm select-bordered w-full"
                disabled={loading || proveedores.length === 0}
              >
                <option value="" disabled>
                  {loading ? "Cargando..." : "Seleccionar proveedor"}
                </option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control w-full">
              <label htmlFor="responsable" className="label py-1"><span className="label-text">Responsable</span></label>
              <input
                id="responsable"
                name="responsable"
                value={ordenInfo.responsable}
                onChange={handleOrdenInfoChange}
                className="input input-sm input-bordered w-full"
                placeholder="Nombre del responsable"
              />
            </div>
            <div className="form-control w-full">
              <label htmlFor="condicionesPago" className="label py-1"><span className="label-text">Condiciones de pago</span></label>
              <input
                id="condicionesPago"
                name="condicionesPago"
                value={ordenInfo.condicionesPago}
                onChange={handleOrdenInfoChange}
                className="input input-sm input-bordered w-full"
                placeholder="Ej: 30 días, contado, etc."
              />
            </div>
            <div className="form-control md:col-span-2">
              <label htmlFor="observaciones" className="label py-1"><span className="label-text">Observaciones</span></label>
              <textarea
                id="observaciones"
                name="observaciones"
                rows={3}
                value={ordenInfo.observaciones}
                onChange={handleOrdenInfoChange}
                className="textarea textarea-bordered"
                placeholder="Notas adicionales para el proveedor"
              />
            </div>
          </div>
        </div>

        <div className="p-3 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Datos de la orden</h2>

          <div className="form-control w-full">
            <label htmlFor="forma_pago" className="label py-1">
              <span className="label-text">Forma de pago</span>
            </label>
            <select
              id="forma_pago"
              name="forma_pago"
              value={formaPago}
              onChange={(e) => setFormaPago(Number(e.target.value))}
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
              <label htmlFor="id_articulo" className="label py-1"><span className="label-text">Artículo</span></label>
              <select
                id="id_articulo"
                name="id_articulo"
                value={currEntry.articulo.id || ""}
                onChange={handleEntryChange}
                className="select select-sm select-bordered w-full"
              >
                <option value="" disabled>
                  {loading ? "Cargando..." : "Seleccionar artículo"}
                </option>
                {articulos.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label htmlFor="cantidad" className="label py-1"><span className="label-text">Cantidad</span></label>
              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min={0}
                value={currEntry.cantidad || ""}
                onChange={handleEntryChange}
                placeholder="0"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label htmlFor="precio" className="label py-1"><span className="label-text">Precio</span></label>
              <input
                id="precio"
                name="precio"
                type="number"
                min={0}
                value={currEntry.precio || ""}
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
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    Aún no se han agregado artículos.
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr key={`${entry.articulo.id}-${idx}`}>
                    <td>{entry.articulo.nombre}</td>
                    <td className="text-right">{entry.cantidad}</td>
                    <td className="text-right">{entry.precio}</td>
                    <td className="text-right">{entry.cantidad * entry.precio}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(idx)}
                        className="btn btn-error btn-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-right">
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Total: ${totalEntries}
          </h1>
        </div>
        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={handleSubmit}
        >
          Guardar orden
        </button>
      </main>
    </div>
  );
}
