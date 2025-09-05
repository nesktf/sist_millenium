// app/components/MovimientoForm.tsx
"use client";

// <<<<<<< HEAD
import { useEffect, useState } from "react";
import { DepositoPostAction } from "../api/v1/deposito/route";
import { TipoMovimiento } from "@/generated/prisma";

const prefix_map = new Map([
  [TipoMovimiento.INGRESO.toString(), "ING-"],
  [TipoMovimiento.EGRESO.toString(), "EGR-"],
  [TipoMovimiento.TRANSFERENCIA.toString(), "TRA-"],
]);

type Deposito = { id_deposito: number; direccion: string };
type Articulo = { codigo: string, id: number; nombre: string };

export default function MovimientoForm({ onSuccess }: { onSuccess: () => void }) {
  const [tipo, setTipo] = useState<TipoMovimiento>("INGRESO");
  const [fecha, setFecha] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [deposito, setDeposito] = useState<string>("");
  const [depositoFuente, setDepositoFuente] = useState<string>("");
  const [hideFuente, setHideFuente] = useState<boolean>(true);
  const [articulo, setArticulo] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("");
  const [comprobante, setComprobante] = useState<string>("");

  const [deps, setDeps] = useState<Deposito[]>([]);
  const [arts, setArts] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateTipo = (new_tipo: TipoMovimiento) => {
    setTipo(new_tipo);
    setHideFuente(new_tipo != TipoMovimiento.TRANSFERENCIA);
  }

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
    if (tipo == TipoMovimiento.TRANSFERENCIA) {
      if (!depositoFuente) {
        e.depositoFuente = "Selecciona un deposito fuente";
      } else if (depositoFuente == deposito) {
        e.depositoFuente = "Selecciona otro depósito";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    let comprobante_str = prefix_map.get(tipo)+parseInt(comprobante).toString();
    let form_data = {
      action: DepositoPostAction.new_movimiento,
      tipo,
      id_dst: Number(deposito),
      id_src: tipo == TipoMovimiento.TRANSFERENCIA ? Number(depositoFuente) : null,
      comprobante: comprobante_str,
      articulos: [{id: Number(articulo), stock: Number(cantidad)}],
    };
    console.log(form_data);

    setSaving(true);
    try {
      const res = await fetch("/api/v1/deposito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form_data),
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

      {/* Tipo */}
      <div className="form-control">
        <span className="label-text font-medium mb-2">Tipo de Movimiento</span>
        <div className="join">
          <input
            type="radio"
            name="tipo"
            className="btn join-item"
            aria-label="Ingreso"
            checked={tipo === TipoMovimiento.INGRESO}
            onChange={() => updateTipo(TipoMovimiento.INGRESO) }
          />
          <input
            type="radio"
            name="tipo"
            className="btn join-item"
            aria-label="Egreso"
            checked={tipo === TipoMovimiento.EGRESO} 
            onChange={() => updateTipo(TipoMovimiento.EGRESO)}
          />
          <input
            type="radio"
            name="tipo"
            className="btn join-item"
            aria-label="Movimiento de stock"
            checked={tipo === TipoMovimiento.TRANSFERENCIA}
            onChange={() => { updateTipo(TipoMovimiento.TRANSFERENCIA) }}
          />
        </div>
      </div>

      {/* Depósitos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Depósito destino */}
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
        {/* Depósito fuente */}
        <div className="form-control" id="dep_dst" hidden={hideFuente}>
          <label className="label">
            <span className="label-text font-medium">Depósito fuente</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={depositoFuente}
            onChange={(e) => setDepositoFuente(e.target.value)}
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
          {errors.depositoFuente && <span className="label-text-alt text-error">{errors.depositoFuente}</span>}
        </div>

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
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
          {errors.articulo && <span className="label-text-alt text-error">{errors.articulo}</span>}
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

      {/* Comprobante */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Número de Comprobante</span>
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
