"use client";

import { useState } from "react";
import Link from "next/link";

export class ProvComprTupleElem {
  id: number;
  articulo: string;
  cantidad: number;
  precio: number;
  observacion?: string;

  constructor(id: number, articulo: string, cantidad: number,
              precio: number, observacion?: string) {
    this.id = id;
    this.articulo = articulo;
    this.cantidad = cantidad;
    this.precio = precio;
    this.observacion = observacion;
  }
};

function ProvComprTable(input: {elems: Array<ProvComprTupleElem>}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full text-base-content">
        <thead className="bg-base-200">
          <tr>
            <th>Articulo</th>
            <th>Observación</th>
            <th className="text-right">Cantidad</th>
            <th className="text-right">Precio Unitario</th>
          </tr>
        </thead>
        <tbody>
          {input.elems.map((elem) => (
            <tr key={elem.id}>
              <td>{elem.articulo}</td>
              <td>{elem?.observacion || "-"}</td>
              <td className="text-right">{elem.cantidad}</td>
              <td className="text-right">${elem.precio.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


function FormHeader() {
  const [proveedores, setProveedores ] = useState<any[]>([
    { id: 1, nombre: "test"}
  ]);
  return (
    <div>
      <h1>input header</h1>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Num comprobante */}
          <div className="flex items-center gap-2 md:col-span-6">
            <label className="label">
              <span className="label-text font-medium mb-2">Número</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-half"
              name="numero"
            />
          </div>

          {/* Fecha */}
          <div className="flex items-center gap-2 md:col-span-6">
            <label className="label">
              <span className="label-text font-medium mb-2">Fecha</span>
            </label>

            <input
              type="date"
              className="input input-bordered w-half"
              name="fecha"
            />
          </div>

          {/* Letra */}
          <div className="flex items-center gap-2 md:col-span-6">
            <label className="label">
              <span className="label-text font-medium mb-2">Letra</span>
            </label>
            <select
              className="select select-bordered">
              <option key="A">A</option>
              <option key="B">B</option>
              <option key="C">C</option>
            </select>
          </div>

          {/* Proveedor*/} 
          <div className="flex items-center gap-2 md:col-span-6">
            <label className="label">
              <span className="label-text font-medium mb-2">Proveedor</span>
            </label>
            <select
              className="select select-bordered">
              <option value="none" disabled>Seleccionar proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>{prov.nombre}</option>
              ))}
            </select>
          </div>

        </div>
    </div>
  )
}

function FormInput() {
  const [articulos, setArticulos] = useState<any[]>([
    { id: 1, nombre: "test-1", },
    { id: 2, nombre: "test-2", },
  ]);
  return (
    <div>
      <h1>input data</h1>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Articulo */}
          <div className="flex items-center gap-2 md:col-span-6">
            <label className="label">
              <span className="label-text font-medium mb-2">Articulo</span>
            </label>
            <select
              className="select select-bordered">
              <option value="none" disabled>Seleccionar articulo</option>
              {articulos.map((art) => (
                <option key={art.id} value={art.id}>{art.nombre}</option>
              ))}
            </select>
          </div>

          {/* Observación */}
          <div className="flex items-center gap-2 md:col-span-6">
            <label className="label">
              <span className="label-text font-medium mb-2">Observación</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-half"
              name="numero"
            />
          </div>

          {/* Cantidad */}
          <div className="flex items-center gap-2 md:col-span-6">
            <label className="label">
              <span className="label-text font-medium mb-2">Cantidad</span>
            </label>
            <input
              type="number"
              min={0}
              className="input input-bordered w-half"
              name="numero"
              placeholder="0"
            />
          </div>

          {/* Precio */}
          <div className="flex items-center gap-2 md:col-span-6">
            <label className="label">
              <span className="label-text font-medium mb-2">Precio</span>
            </label>
            <input
              type="number"
              min={0}
              className="input input-bordered w-half"
              name="numero"
              placeholder="0"
            />
          </div>

        </div>
    </div>
  );
}

export default function ComprProveedorPage() {
  let things = [new ProvComprTupleElem(1, "thing", 2, 3)]
  return (
    <div>
      <main style={{ padding: "2rem" }}>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link href="/proveedor" className="btn btn-outline btn-sm">
            Volver a proveedores
          </Link>
        </div>

        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}>Cargar comprobante de proveedor</h1>

        <form className="space-y- min-w-[32rem]">
          <div id="header" className="mb-4 gap-3">
            {FormHeader()}
          </div>
   
          <div id="main-input" className="mb-4 gap-3">
            {FormInput()}
          </div>

        <ProvComprTable
          elems={things}
          />

        </form>
      </main>
    </div>
  )
}
