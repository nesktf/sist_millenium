"use client";

import { useEffect, useState } from "react";
import { DepositoPostAction } from "../api/v1/deposito/route";
import { NaturalezaMovimiento } from "@/generated/prisma";

const prefix_map = new Map([
  [NaturalezaMovimiento.INGRESO.toString(), "ING-"],
  [NaturalezaMovimiento.EGRESO.toString(), "EGR-"],
]);

type Deposito = { id_deposito: number; direccion: string };
type Articulo = { codigo: string; id: number; nombre: string };
type ArticuloSeleccionado = { id: number; nombre: string; cantidad: number };

export default function MovimientoForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [tipo, setTipo] = useState<NaturalezaMovimiento>(
    NaturalezaMovimiento.INGRESO
  );
  const [fecha, setFecha] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [deposito, setDeposito] = useState<string>("");
  const [comprobante, setComprobante] = useState<string>("");

  // Manejo de artículos
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<string>("");
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState<string>("");
  const [articulosAgregados, setArticulosAgregados] = useState<
    ArticuloSeleccionado[]
  >([]);

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
          fetch("/api/v1/prod"),
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

  function agregarArticulo() {
    const erroresTemp: Record<string, string> = {};

    if (!articuloSeleccionado) {
      erroresTemp.articulo = "Selecciona un artículo";
    }

    const cantidad = Number(cantidadSeleccionada);
    if (!cantidadSeleccionada) {
      erroresTemp.cantidad = "Ingresa la cantidad";
    } else if (Number.isNaN(cantidad) || !Number.isFinite(cantidad)) {
      erroresTemp.cantidad = "Número inválido";
    } else if (cantidad <= 0) {
      erroresTemp.cantidad = "Debe ser mayor que 0";
    }

    const yaExiste = articulosAgregados.some(
      (art) => art.id === Number(articuloSeleccionado)
    );
    if (yaExiste) {
      erroresTemp.articulo = "Este artículo ya fue agregado";
    }

    setErrors(erroresTemp);

    if (Object.keys(erroresTemp).length === 0) {
      const articulo = arts.find((a) => a.id === Number(articuloSeleccionado));
      if (articulo) {
        setArticulosAgregados((prev) => [
          ...prev,
          {
            id: articulo.id,
            nombre: articulo.nombre,
            cantidad,
          },
        ]);

        // Limpiar campos
        setArticuloSeleccionado("");
        setCantidadSeleccionada("");
        setErrors({});
      }
    }
  }

  function eliminarArticulo(id: number) {
    setArticulosAgregados((prev) => prev.filter((art) => art.id !== id));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!fecha) e.fecha = "Requerida";
    if (!deposito) e.deposito = "Selecciona un depósito";
    if (articulosAgregados.length === 0)
      e.articulos = "Agrega al menos un artículo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const comprobanteNumero = comprobante.replace(/^\D+/g, ""); // Quita prefijos no numéricos
    const comprobante_str = prefix_map.get(tipo) + comprobanteNumero;

    const form_data = {
      action: DepositoPostAction.new_movimiento,
      tipo,
      id_dst: Number(deposito),
      comprobante: comprobante_str,
      articulos: articulosAgregados.map((art) => ({
        id: art.id,
        stock: art.cantidad,
      })),
      fecha,
    };

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
    <form onSubmit={onSubmit} className="space-y-4 min-w-[32rem]">
      {/* Tipo */}
      <div className="form-control">
        <span className="label-text font-medium mb-2">Tipo de Movimiento</span>
        <div className="join">
          <input
            type="radio"
            name="tipo"
            className="btn join-item"
            aria-label="Ingreso"
            checked={tipo === NaturalezaMovimiento.INGRESO}
            onChange={() => setTipo(NaturalezaMovimiento.INGRESO)}
          />
          <input
            type="radio"
            name="tipo"
            className="btn join-item"
            aria-label="Egreso"
            checked={tipo === NaturalezaMovimiento.EGRESO}
            onChange={() => setTipo(NaturalezaMovimiento.EGRESO)}
          />
        </div>
      </div>

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
        {errors.deposito && (
          <span className="label-text-alt text-error">{errors.deposito}</span>
        )}
      </div>

      {/* Agregar artículos */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-medium">Agregar Artículos</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Artículo */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Artículo</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={articuloSeleccionado}
              onChange={(e) => setArticuloSeleccionado(e.target.value)}
              disabled={loading || arts.length === 0}
            >
              <option value="" disabled>
                {loading ? "Cargando..." : "Selecciona"}
              </option>
              {arts
                .filter(
                  (a) => !articulosAgregados.some((art) => art.id === a.id)
                )
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
            </select>
            {errors.articulo && (
              <span className="label-text-alt text-error">
                {errors.articulo}
              </span>
            )}
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
              value={cantidadSeleccionada}
              onChange={(e) => setCantidadSeleccionada(e.target.value)}
              placeholder="Ej: 5"
            />
            {errors.cantidad && (
              <span className="label-text-alt text-error">
                {errors.cantidad}
              </span>
            )}
          </div>

          {/* Botón agregar */}
          <div className="form-control">
            <button
              type="button"
              className="btn btn-primary"
              onClick={agregarArticulo}
              disabled={!articuloSeleccionado || !cantidadSeleccionada}
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de artículos */}
        {articulosAgregados.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Artículos agregados:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {articulosAgregados.map((art) => (
                <div
                  key={art.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      {art.nombre}
                    </span>
                    <span className="text-gray-700 ml-2">
                      - Cantidad: {art.cantidad}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-error btn-sm"
                    onClick={() => eliminarArticulo(art.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {errors.articulos && (
          <span className="label-text-alt text-error">{errors.articulos}</span>
        )}
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
      {errors.form && (
        <div className="alert alert-error py-2">{errors.form}</div>
      )}

      {/* Acciones */}
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            (document.activeElement as HTMLElement)?.blur();
          }}
        >
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Aceptar"
          )}
        </button>
      </div>
    </form>
  );
}
