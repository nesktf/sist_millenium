"use client";

import { EstadoOrdenPago } from "@/generated/prisma";
import { useState } from "react";

type ElemOrdenCompra = {
  id_comprobante: number;
  fecha: Date;
  estado: EstadoOrdenPago;
  cantidad: number;
};

type ComprovanteProv = {
  id_compr: number;
  numero: string;
};

export default function OrdenCompraPage() {
  const [comprobantes, setComprobantes] = useState<Array<ComprovanteProv>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [idCompr, setIdCompr] = useState<number|undefined>(undefined);
  const [cantCompr, setCantCompr] = useState<number|undefined>(undefined);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetch("/api/v1/comprobante-proveedor/sin-orden")
      .then(async (body) => body.json())
      .then((json) => {
        setComprobantes(json.map((compr: any) => {
          return {id_compr: compr.id, numero: compr.numero};
        }));
      })
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main style={{ padding: "2rem" }}>
        <div className="mb-4 flex flex-wrap gap-3">
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Cargar orden de pago
          </h1>
        </div>
      </main>

      <div className="p-3 border rounded-md">
        <h2 className="text-lg font-semibold mb-2">Datos orden de pago</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <div className="form-control w-full">
            <label htmlFor="numero" className="label py-1"><span className="label-text">Número</span></label>
          </div>
        </div>
      </div>

      <span> total </span>
      <button type="submit" className="btn btn-primary mt-3">Guardar orden</button>
    </div>
  )
}
