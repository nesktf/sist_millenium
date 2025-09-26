"use client";

import { EstadoOrdenPago } from "@/generated/prisma";
import { useEffect, useState } from "react";
import { APIFormaPago } from "../api/v1/orden-compra/route";

type ArticuloData = {
  id: number,
  nombre: string,
};

type ArticuloEntry = {
  articulo: ArticuloData,
  precio: number,
  cantidad: number,
};


export default function OrdenCompraPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [articulos, setArticulos] = useState<Array<ArticuloData>>([]);
  const [currEntry, setCurrEntry] = useState<ArticuloEntry>({
    articulo: { id: 0, nombre: "" },
    precio: 0,
    cantidad: 0
  });
  const [entries, setEntries] = useState<Array<ArticuloEntry>>([]);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [formaPago, setFormaPago] = useState<APIFormaPago>(APIFormaPago.EFECTIVO);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetch("/api/v1/prod")
      .then(async (body) => body.json())
      .then((json: Array<any>) => {
        let arts = json.map((item) => {
          return { id: item.id, nombre: item.nombre };
        });
        setArticulos(arts);
        setCurrEntry({ ...currEntry, articulo: arts[0] });
      })
    } catch (err) {
      console.log(`${err}`)
      setArticulos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name == "id_articulo") {
      const selected = articulos.find(art => art.id == parseInt(value));
      if (!selected) {
        return;
      }
      setCurrEntry({ ...currEntry, articulo: { id: selected.id, nombre: selected.nombre }});
    } else {
      setCurrEntry({ ...currEntry, [name]: parseInt(value) });
    }
  };

  const handleAddEntry = () => {
    if (currEntry.precio == 0) {
      alert("Coloca un precio mayor a 0");
      return;
    }
    if (currEntry.cantidad == 0) {
      alert("Coloca una cantidad mayor a 0");
      return;
    }
    let prev_entry = entries.find(entry => entry.articulo.id == currEntry.articulo.id);
    if (prev_entry) {
      alert("Seleccionar otro articulo o eliminar el existente");
      return;
    }
    let new_entries = [...entries, {
      articulo: { id: currEntry.articulo.id, nombre: currEntry.articulo.nombre },
      precio: currEntry.precio,
      cantidad: currEntry.cantidad,
    }];
    setTotalEntries(new_entries.reduce((total, entry) => total + entry.precio*entry.cantidad, 0));
    setEntries(new_entries);
  };

  const handleDeleteEntry = (idx: number) => {
    let new_entries = entries.filter((_, entry_idx) => idx != entry_idx);
    setTotalEntries(new_entries.reduce((total, entry) => total + entry.precio*entry.cantidad, 0));
    setEntries(new_entries);
  }

  const handleSubmit = async () => {
    const onError = (err: any) => {
      console.log(`${err}`)
      alert(`Error: ${err}`);
    };
    try {
      await fetch('/api/v1/orden-compra', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: entries.map((entry) => {
            return { id: entry.articulo.id, cantidad: entry.cantidad, precio: entry.precio };
          }),
          forma_pago: formaPago,
        }),
      })
      .then((body) => body.json())
      .then((json) => {
        if (json.error) {
          onError(json);
          return;
        }
        alert(`Orden de compra cargada! ID: ${json.data.id}`);
        setEntries([]);
        setCurrEntry({
          articulo: { id: 0, nombre: "" },
          precio: 0,
          cantidad: 0
        })
        setFormaPago(APIFormaPago.EFECTIVO);
      });
    } catch(err) {
      onError(err)
    }
  };

  useEffect(() => {
    fetchData()
  }, []);

  return (
    <div>
      <main style={{ padding: "2rem" }}>
        <div className="mb-4 flex flex-wrap gap-3">
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Cargar orden de compra
          </h1>
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
              onChange={(e) => setFormaPago(parseInt(e.target.value))}
              className="select select-sm select-bordered w-full">
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
                value={currEntry.articulo.id}
                onChange={handleEntryChange}
                className="select select-sm select-bordered w-full">
                <option value="" disabled>Seleccionar artículo</option>
                {articulos.map((art) => (
                  <option key={art.id} value={art.id}>{art.nombre}</option>
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
                value={currEntry.cantidad}
                onChange={handleEntryChange}
                placeholder="0"
                className="input input-sm input-bordered w-full" />
            </div>

            <div className="form-control w-full">
              <label htmlFor="precio_unitario" className="label py-1"><span className="label-text">Precio</span></label>
              <input
                id="precio"
                name="precio"
                type="number"
                min={0}
                value={currEntry.precio}
                onChange={handleEntryChange}
                placeholder="0"
                className="input input-sm input-bordered w-full" />
            </div>

            <button
              type="button"
              onClick={handleAddEntry}
              className="btn btn-secondary btn-sm mt-3">
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
            { entries.length == 0 ? (
              <tr><td colSpan={5} className="text-center p-4">Aún no se han agregado artículos.</td></tr>
            ) : (
              entries.map((entry, idx) => (
                <tr key={idx}>
                  <td>{entry.articulo.nombre}</td>
                  <td className="text-right">{entry.cantidad}</td>
                  <td className="text-right">{entry.precio}</td>
                  <td className="text-right">{entry.cantidad*entry.precio}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(idx)}
                      className="btn btn-error btn-xs">
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Total: ${totalEntries}
          </h1>
        </div>
        <button
          type="submit"
          className="btn btn-primary mt-3"
          onClick={handleSubmit}>
            Guardar orden
        </button>
      </main>
    </div>
  )
}
