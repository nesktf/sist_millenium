// app/components/MovimientoForm.tsx
"use client";

import { useEffect, useState } from "react";

type Tipo = "INGRESO" | "EGRESO" | "STOCK";
type Deposito = { id_deposito: number; direccion: string };
type Articulo = { id_articulo: number; nombre: string };

export default function MovimientoForm({ onSuccess }: { onSuccess: () => void }) {
  const [tipo, setTipo] = useState<Tipo>("INGRESO");
  const [fecha, setFecha] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [deposito, setDeposito] = useState<string>("");
  const [articulo, setArticulo] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("");
  const [comprobante, setComprobante] = useState<string>("");

  const [deps, setDeps] = useState<Deposito[]>([]);
  const [arts, setArts] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const [rDep, rArt] = await Promise.all([
          fetch("/api/v1/deposito", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: 0 }),
          }),
          fetch("/api/v1/prod"), // ajustá si tu endpoint de artículos es otro
        ]);
        const depData = await rDep.json();
        const artData = await rArt.json();
        setDeps(depData.depositos ?? []);
        setArts(artData ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!fecha) e.fecha = "Requerida";
    if (!deposito) e.deposito = "Selecciona un depósito";
    if (!articulo) e.articulo = "Selecciona un artículo";
    const n = Number(cantidad);
    if (!cantidad) e.cantidad = "Requerida";
    else if (Number.isNaN(n) || !Number.isFinite(n)) e.cantidad = "Número inválido";
    else if (n <= 0) e.cantidad = "Debe ser > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/v1/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha,
          tipo,
          comprobante: comprobante || null,
          id_deposito: Number(deposito),
          id_articulo: Number(articulo),
          cantidad: Number(cantidad),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "No se pudo guardar");
      }
      onSuccess();
    } catch (err: any) {
      setErrors({ form: err.message || "Error inesperado" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 min-w-[24rem]">
      {/* Fecha */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Fecha</span>
        </label>
        <input
          type="date"
          className="input input-bordered w-full"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        {errors.fecha && <span className="label-text-alt text-error">{errors.fecha}</span>}
      </div>

      {/* Tipo */}
      <div className="form-control">
        <span className="label-text font-medium mb-2">Tipo de Movimiento</span>
        <div className="join">
          <input
            type="radio"
            name="tipo"
            className="btn join-item"
            aria-label="Ingreso"
            checked={tipo === "INGRESO"}
            onChange={() => setTipo("INGRESO")}
          />
          <input
            type="radio"
            name="tipo"
            className="btn join-item"
            aria-label="Egreso"
            checked={tipo === "EGRESO"}
            onChange={() => setTipo("EGRESO")}
          />
          <input
            type="radio"
            name="tipo"
            className="btn join-item"
            aria-label="Movimiento de stock"
            checked={tipo === "STOCK"}
            onChange={() => setTipo("STOCK")}
          />
        </div>
      </div>

      {/* Depósito */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Depósito</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={deposito}
            onChange={(e) => setDeposito(e.target.value)}
            disabled={loading || deps.length === 0}
          >
            <option value="" disabled>
              {loading ? "Cargando..." : "Selecciona"}
            </option>
            {deps.map((d) => (
              <option key={d.id_deposito} value={d.id_deposito}>
                {d.direccion}
              </option>
            ))}
          </select>
          {errors.deposito && <span className="label-text-alt text-error">{errors.deposito}</span>}
        </div>

        {/* Artículo */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Artículo</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={articulo}
            onChange={(e) => setArticulo(e.target.value)}
            disabled={loading || arts.length === 0}
          >
            <option value="" disabled>
              {loading ? "Cargando..." : "Selecciona"}
            </option>
            {arts.map((a) => (
              <option key={a.id_articulo} value={a.id_articulo}>
                {a.nombre}
              </option>
            ))}
          </select>
          {errors.articulo && <span className="label-text-alt text-error">{errors.articulo}</span>}
        </div>
      </div>

      {/* Cantidad */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Cantidad</span>
        </label>
        <input
          type="number"
          className="input input-bordered w-full"
          inputMode="decimal"
          step="any"
          min={0}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="Ej: 5"
        />
        {errors.cantidad && <span className="label-text-alt text-error">{errors.cantidad}</span>}
      </div>

      {/* Comprobante (opcional) */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Número de Comprobante (opcional)</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={comprobante}
          onChange={(e) => setComprobante(e.target.value)}
          placeholder="Ej: FA-0001-001234"
        />
      </div>

      {/* Errores de formulario */}
      {errors.form && <div className="alert alert-error py-2">{errors.form}</div>}

      {/* Acciones */}
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            // Si tu Modal cierra al hacer onClose en el padre, este botón puede disparar un evento personalizado
            // o podés pasar un onCancel por props. Por ahora, que no haga submit.
            (document.activeElement as HTMLElement)?.blur();
          }}
        >
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? <span className="loading loading-spinner loading-sm" /> : "Aceptar"}
        </button>
      </div>
    </form>
  );
}
