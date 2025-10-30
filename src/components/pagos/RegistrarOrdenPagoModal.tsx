import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Modal from "@/components/Modal";

interface Proveedor {
  id: number;
  nombre: string;
}

interface Comprobante {
  id: number;
  fecha: string;
  letra: string;
  sucursal: string;
  numero: string;
  total: number;
  saldo_pendiente: number;
  total_pagado: number;
  tipo_comprobante: {
    nombre: string;
  };
}

interface ComprobanteSeleccionado {
  id_comprobante: number;
  monto_pagado: string;
  saldo_pendiente: number;
  total: number;
  comprobante_info: Comprobante;
}

interface RegistrarOrdenPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  proveedores: Proveedor[];
  onSubmit: (data: any) => void;
}

const formatMoney = (amount: number | null | undefined) => {
  if (typeof amount !== 'number') return '$0';
  return `$${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const unformatNumberInput = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
};

const formatNumberInput = (value: string): string => {
  if (!value) return "";
  const parts = value.split(",");
  const integerPart = parts[0].replace(/\./g, "").replace(/\D/g, "");
  const formattedInteger = BigInt(integerPart || "0").toLocaleString("es-AR");

  if (parts.length > 1) {
    const decimalPart = parts[1].replace(/\D/g, "");
    return `${formattedInteger},${decimalPart}`;
  } else if (value.endsWith(",")) {
    return `${formattedInteger},`;
  }
  
  return formattedInteger;
};

export default function RegistrarOrdenPagoModal({
  isOpen,
  onClose,
  proveedores,
  onSubmit,
}: RegistrarOrdenPagoModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    numero: "",
    fecha: today,
    id_proveedor: "",
    forma_pago: "EFECTIVO",
    referencia: "",
  });

  const [comprobantesDisponibles, setComprobantesDisponibles] = useState<Comprobante[]>([]);
  const [comprobantesSeleccionados, setComprobantesSeleccionados] = useState<ComprobanteSeleccionado[]>([]);
  const [loadingComprobantes, setLoadingComprobantes] = useState(false);

  useEffect(() => {
    if (formData.id_proveedor) {
      fetchComprobantesByProveedor(parseInt(formData.id_proveedor));
    } else {
      setComprobantesDisponibles([]);
      setComprobantesSeleccionados([]);
    }
  }, [formData.id_proveedor]);

  const fetchComprobantesByProveedor = async (id_proveedor: number) => {
    try {
      setLoadingComprobantes(true);
      const res = await fetch(
        `/api/v1/comprobante-proveedor/sin-orden?id_proveedor=${id_proveedor}`
      );
      if (res.ok) {
        const data = await res.json();
        setComprobantesDisponibles(data);
      }
    } catch (error) {
      console.error("Error al cargar comprobantes:", error);
    } finally {
      setLoadingComprobantes(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAgregarComprobante = (comprobante: Comprobante) => {
    const yaExiste = comprobantesSeleccionados.find(
      c => c.id_comprobante === comprobante.id
    );
    
    if (yaExiste) {
      void Swal.fire({
        title: "Comprobante ya agregado",
        text: "Seleccionaste este comprobante previamente.",
        icon: "info",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setComprobantesSeleccionados([
      ...comprobantesSeleccionados,
      {
        id_comprobante: comprobante.id,
        monto_pagado: comprobante.saldo_pendiente.toLocaleString('es-AR'),
        saldo_pendiente: comprobante.saldo_pendiente,
        total: comprobante.total,
        comprobante_info: comprobante,
      },
    ]);
  };

  const handleQuitarComprobante = (id_comprobante: number) => {
    setComprobantesSeleccionados(
      comprobantesSeleccionados.filter(c => c.id_comprobante !== id_comprobante)
    );
  };

  const handleChangeMonto = (id_comprobante: number, value: string) => {
    const formattedValue = formatNumberInput(value);
    setComprobantesSeleccionados(
      comprobantesSeleccionados.map(c =>
        c.id_comprobante === id_comprobante
          ? { ...c, monto_pagado: formattedValue }
          : c
      )
    );
  };

  const handlePagarTotalComprobante = (id_comprobante: number) => {
    setComprobantesSeleccionados(
      comprobantesSeleccionados.map(c =>
        c.id_comprobante === id_comprobante
          ? { ...c, monto_pagado: c.saldo_pendiente.toLocaleString('es-AR') }
          : c
      )
    );
  };

  const calcularTotalOrden = () => {
    return comprobantesSeleccionados.reduce(
      (sum, c) => sum + unformatNumberInput(c.monto_pagado),
      0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      void Swal.fire({
        title: "Número de orden requerido",
        text: "Ingresá un número de orden para continuar.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    if (!formData.id_proveedor) {
      void Swal.fire({
        title: "Seleccioná un proveedor",
        text: "Elegí el proveedor al que corresponde la orden de pago.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    if (comprobantesSeleccionados.length === 0) {
      void Swal.fire({
        title: "Sin comprobantes",
        text: "Agregá al menos un comprobante para registrar la orden.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    // Validar montos
    for (const comp of comprobantesSeleccionados) {
      const monto = unformatNumberInput(comp.monto_pagado);
      if (monto <= 0) {
        void Swal.fire({
          title: "Monto inválido",
          text: `El monto del comprobante ${comp.comprobante_info.letra}-${comp.comprobante_info.sucursal}-${comp.comprobante_info.numero} debe ser mayor a cero.`,
          icon: "warning",
          confirmButtonColor: "#2563eb",
        });
        return;
      }
      if (monto > comp.saldo_pendiente) {
        void Swal.fire({
          title: "Monto excedido",
          text: `El monto ingresado supera el saldo pendiente del comprobante ${comp.comprobante_info.letra}-${comp.comprobante_info.sucursal}-${comp.comprobante_info.numero}.`,
          icon: "warning",
          confirmButtonColor: "#2563eb",
        });
        return;
      }
    }

    onSubmit({
      numero: formData.numero,
      fecha: formData.fecha,
      id_proveedor: parseInt(formData.id_proveedor),
      forma_pago: formData.forma_pago,
      referencia: formData.referencia || undefined,
      comprobantes: comprobantesSeleccionados.map(c => ({
        id_comprobante: c.id_comprobante,
        monto_pagado: unformatNumberInput(c.monto_pagado),
      })),
    });
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      fecha: today,
      id_proveedor: "",
      forma_pago: "EFECTIVO",
      referencia: "",
    });
    setComprobantesDisponibles([]);
    setComprobantesSeleccionados([]);
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto p-1">
        <h2 className="text-xl font-bold mb-4">Registrar Orden de Pago</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datos de la Orden */}
          <div className="p-3 border rounded-md border-base-300">
            <h3 className="text-lg font-semibold mb-2">Datos de la Orden</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text">Número de Orden *</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="input input-sm input-bordered w-full"
                  placeholder="Ej: OP-2025-001"
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text">Fecha *</span>
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="input input-sm input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control w-full md:col-span-2">
                <label className="label py-1">
                  <span className="label-text">Proveedor *</span>
                </label>
                <select
                  name="id_proveedor"
                  value={formData.id_proveedor}
                  onChange={handleChange}
                  className="select select-sm select-bordered w-full"
                  required
                >
                  <option value="" disabled>
                    Seleccionar proveedor
                  </option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text">Forma de Pago *</span>
                </label>
                <select
                  name="forma_pago"
                  value={formData.forma_pago}
                  onChange={handleChange}
                  className="select select-sm select-bordered w-full"
                  required
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text">Referencia (opcional)</span>
                </label>
                <input
                  type="text"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleChange}
                  className="input input-sm input-bordered w-full"
                  placeholder="Nº de transferencia, recibo, etc."
                />
              </div>
            </div>
          </div>

          {/* Comprobantes Disponibles */}
          <div className="p-3 border rounded-md border-base-300">
            <h3 className="text-lg font-semibold mb-2">Comprobantes Disponibles</h3>
            <div
              className="p-2 border rounded-lg border-base-300 bg-base-100 max-h-48 overflow-y-auto space-y-2"
              style={{ minHeight: "8rem" }}
            >
              {!formData.id_proveedor ? (
                <span className="text-xs text-base-content/60 p-2 block text-center">
                  Primero seleccione un proveedor
                </span>
              ) : loadingComprobantes ? (
                <span className="text-xs text-base-content/60 p-2 block text-center">
                  Cargando...
                </span>
              ) : comprobantesDisponibles.length === 0 ? (
                <span className="text-xs text-warning p-2 block text-center">
                  No hay comprobantes con saldo pendiente
                </span>
              ) : (
                comprobantesDisponibles.map((comp) => {
                  const yaSeleccionado = comprobantesSeleccionados.some(
                    c => c.id_comprobante === comp.id
                  );
                  
                  return (
                    <div
                      key={comp.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        yaSeleccionado ? 'bg-success/10' : 'hover:bg-base-200'
                      }`}
                    >
                      <div className="flex-1">
                        <span className="text-xs font-semibold">
                          {comp.tipo_comprobante.nombre} {comp.letra}-{comp.sucursal}-{comp.numero}
                        </span>
                        <div className="text-xs text-base-content/70">
                          Total: {formatMoney(comp.total)} | 
                          Pagado: {formatMoney(comp.total_pagado)} | 
                          <span className="font-semibold text-warning">
                            {' '}Pendiente: {formatMoney(comp.saldo_pendiente)}
                          </span>
                        </div>
                      </div>
                      {!yaSeleccionado && (
                        <button
                          type="button"
                          onClick={() => handleAgregarComprobante(comp)}
                          className="btn btn-primary btn-xs ml-2"
                        >
                          Agregar
                        </button>
                      )}
                      {yaSeleccionado && (
                        <span className="badge badge-success badge-sm ml-2">
                          Agregado
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Comprobantes Seleccionados */}
          {comprobantesSeleccionados.length > 0 && (
            <div className="p-3 border rounded-md border-base-300">
              <h3 className="text-lg font-semibold mb-2">Comprobantes a Pagar</h3>
              <div className="overflow-x-auto">
                <table className="table table-xs w-full">
                  <thead>
                    <tr>
                      <th>Comprobante</th>
                      <th>Saldo Pendiente</th>
                      <th>Monto a Pagar</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprobantesSeleccionados.map((comp) => (
                      <tr key={comp.id_comprobante}>
                        <td>
                          <div className="text-xs">
                            <div className="font-semibold">
                              {comp.comprobante_info.letra}-
                              {comp.comprobante_info.sucursal}-
                              {comp.comprobante_info.numero}
                            </div>
                            <div className="text-base-content/70">
                              {comp.comprobante_info.tipo_comprobante.nombre}
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          {formatMoney(comp.saldo_pendiente)}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={comp.monto_pagado}
                              onChange={(e) =>
                                handleChangeMonto(comp.id_comprobante, e.target.value)
                              }
                              className="input input-xs input-bordered w-24"
                              placeholder="0,00"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handlePagarTotalComprobante(comp.id_comprobante)
                              }
                              className="btn btn-ghost btn-xs"
                              title="Pagar total"
                            >
                              💯
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuitarComprobante(comp.id_comprobante)
                            }
                            className="btn btn-error btn-xs"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td colSpan={2} className="text-right">
                        Total de la Orden:
                      </td>
                      <td colSpan={2}>
                        {formatMoney(calcularTotalOrden())}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button type="submit" className="btn btn-primary">
              Registrar Orden de Pago
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
