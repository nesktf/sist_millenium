"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";   
import { ArrowLeft } from "lucide-react"; 

type Fila = {
  codigo: string; articulo: string; categoria: string; marca: string;
  deposito: string; stock: number; stock_min: number; estado: "OK"|"REPONER"|string;
};

type Deposito = {id: number; direccion: string;
};

export default function ConsultarStockPage() {
  const [codigo, setCodigo] = useState("");
  const [depositoId, setDepositoId] = useState("");            // seleccionado
  const [depositos, setDepositos] = useState<Deposito[]>([]);  // lista desde la BDD
  const [filas, setFilas] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();

  // 👇 este useEffect carga los depósitos al abrir la página
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/deposito", { cache: "no-store" });
        const data = await r.json();
        setDepositos(Array.isArray(data) ? data : []);
      } catch {
        setDepositos([]);
      }
    })();
  }, []);



async function buscar() {
  const q = codigo.trim(); 
  if (!q) return;

  setLoading(true); 
  setErr(null); 
  setFilas([]);

  try {
    const qs = new URLSearchParams({ codigo: q });
    if (depositoId) qs.set("depositoId", depositoId);   // 👈 agrega el filtro

    const res = await fetch(`/api/v1/stock?${qs.toString()}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al consultar");
    setFilas(Array.isArray(data) ? data : []);
  } catch (e: any) {
    setErr(e?.message || "Error inesperado");
  } finally {
    setLoading(false);
  }
}





  return (
    <main style={{ padding: "2rem" }}>
      <button
        onClick={() => router.back()}
        className="btn btn-ghost btn-sm p-0 min-h-0 h-auto"
      >
        <ArrowLeft className="w-4 h-4" /> Volver 
        
      </button>

      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Consultar stock</h1>
      
      {/* filtros */}
      <div style={{ display: "flex", gap: ".5rem", marginBottom: "1rem" }}>
        
        
        {/* select de depósitos */}
  <select
    value={depositoId}
    onChange={(e) => setDepositoId(e.target.value)}
    className="select select-bordered"
  >
    <option value="">Todos los depósitos</option>
    {depositos.map((d) => (
      <option key={d.id} value={String(d.id)}>
        {d.direccion}
      </option>
    ))}
  </select>

        
        <input
          style={{ border: "1px solid #ccc", padding: ".5rem", width: "22rem" }}
          placeholder="Código de artículo (ej: abc123)"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
        />
        <button onClick={buscar} className="btn btn-primary ml-2">Buscar</button>
      </div>

      {loading && <p>Cargando…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

{filas.length > 0 && (
( 
<table className="table w-full border border-white">
  <thead className="border-b border-white">
    <tr>
      <th>Código</th>
      <th>Artículo</th>
      <th>Categoría</th>
      <th>Marca</th>
      <th>Depósito</th>
      <th>Stock</th>
      <th>Stock min</th>
      <th>Estado</th>
    </tr>
  </thead>
  <tbody>
    {filas.map((f, i) => (
      <tr key={`${f.codigo}-${i}`} className="border-b border-white">
        <td>{f.codigo}</td>
        <td>{f.articulo}</td>
        <td>{f.categoria}</td>
        <td>{f.marca}</td>
        <td>{f.deposito}</td>
        <td>{f.stock}</td>
        <td>{f.stock_min}</td>
        <td className={f.estado === "OK" ? "text-green-500" : "text-red-500"}>
          {f.estado}
        </td>
      </tr>
    ))}
  </tbody>
</table>
)
)}
  
      {!loading && !err && codigo.trim() && filas.length === 0 && (
      <p style={{ marginTop: 8 }}>
      No se encontraron resultados para <b>{codigo}</b>.
      </p>
    )}

    </main>
  );
}
