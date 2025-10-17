"use client";

import { useEffect, useState } from "react";
import { DepositoPostAction } from "@/app/api/v1/movimientos/deposito-actions/route";
import { NaturalezaMovimiento } from "@/generated/prisma";

const prefix_map = new Map([
  [NaturalezaMovimiento.INGRESO.toString(), "ING-"],
  [NaturalezaMovimiento.EGRESO.toString(), "EGR-"],
]);

export type Deposito = { id_deposito: number; nombre: string; direccion: string };

type Articulo = { codigo: string; id: number; nombre: string };
type ArticuloSeleccionado = { id: number; nombre: string; cantidad: number };
type TipoOperacion = {
  id: number;
  nombre: string;
  naturaleza: "INGRESO" | "EGRESO";
};

export default function MovimientoForm({
  onSuccess,
  initialDeposito,
}: {
  onSuccess: () => void;
  initialDeposito?: string;
}) {
  const [tipo, setTipo] = useState<NaturalezaMovimiento>(
    NaturalezaMovimiento.INGRESO
  );
  const [fecha, setFecha] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [deposito, setDeposito] = useState<string>(initialDeposito || "");
  const [comprobante, setComprobante] = useState<string>("");

  const [tiposOperacion, setTiposOperacion] = useState<TipoOperacion[]>([]);
  const [tipoOperacionSeleccionado, setTipoOperacionSeleccionado] = useState<
    number | ""
  >("");

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
        const [rDep, rArt, rTipoOp] = await Promise.all([
          fetch("/api/v1/deposito", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: 0 }),
          }),
          fetch("/api/v1/prod"),
          fetch("/api/v1/tipo_operacion"), // endpoint que devuelve los tipos de operación
        ]);

        // Depósitos
        let depData: any[] = [];
        if (rDep.ok) {
          try {
            const json = await rDep.json();
            depData = json.depositos ?? [];
          } catch {
            console.error("No se pudo parsear JSON de depósitos");
          }
        } else {
          console.error("Error fetch depósitos", rDep.status);
        }

        // Artículos
        let artData: any[] = [];
        if (rArt.ok) {
          try {
            artData = await rArt.json();
          } catch {
            console.error("No se pudo parsear JSON de artículos");
          }
        } else {
          console.error("Error fetch artículos", rArt.status);
        }

        // Tipos de operación
        let tipoOpData: TipoOperacion[] = [];
        if (rTipoOp.ok) {
          try {
            tipoOpData = await rTipoOp.json();
          } catch {
            console.error("No se pudo parsear JSON de tipos de operación");
          }
        } else {
          console.error("Error fetch tipos de operación", rTipoOp.status);
        }

        setDeps(depData);
        setArts(artData);
        setTiposOperacion(tipoOpData);
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

    const comprobante_str = comprobante;

    const form_data = {
      action: DepositoPostAction.new_movimiento,
      tipoOperacionId: Number(tipoOperacionSeleccionado),
      id_dst: Number(deposito),
      comprobante: comprobante_str,
      articulos: articulosAgregados.map((art) => ({
        id: art.id,
        stock: art.cantidad,
      })),
      fecha,
    };
    console.log(form_data); // Añadir esto para revisar la estructura

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

  // Asumimos que `deposito` ya tiene un valor
  const depositoSeleccionado = deps.find(
    (d) => d.id_deposito.toString() === deposito
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4 min-w-[32rem]">
      {/* Cabecera con depósito elegido */}
      {depositoSeleccionado && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Depósito seleccionado</div>
            <div className="font-semibold text-gray-800">{depositoSeleccionado.nombre}</div>
            <div className="text-gray-600">{depositoSeleccionado.direccion}</div>
              
           
          
        </div>
      )}

      {/* Tipo de Operación */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Tipo de Operación</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={tipoOperacionSeleccionado}
          onChange={(e) => setTipoOperacionSeleccionado(Number(e.target.value))}
          disabled={loading || tiposOperacion.length === 0}
        >
          <option value="" disabled>
            {loading ? "Cargando..." : "Selecciona"}
          </option>
          {tiposOperacion.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre} ({t.naturaleza})
            </option>
          ))}
        </select>
        {errors.tipoOperacion && (
          <span className="label-text-alt text-error">
            {errors.tipoOperacion}
          </span>
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
