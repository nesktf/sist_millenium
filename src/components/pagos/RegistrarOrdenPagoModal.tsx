import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { getTodayAR } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/currency";

// --- INTERFACES ---
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
  tipo_comprobante: {
    nombre: string;
  };
}

interface RegistrarOrdenPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  proveedores: Proveedor[];
  onSubmit: (data: any) => void;
}

// --- HELPER FUNCTIONS ---


const formatMoney = (amount: number | null | undefined) => {
  if (typeof amount !== 'number') return '$0';
  return `$${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};


const unformatNumberInput = (value: string): number => {
  if (!value) return 0;
  const cleaned = value
    .replace(/\./g, "")   // Quita los puntos de miles
    .replace(",", ".");  // Reemplaza la coma decimal por un punto
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
    // Datos de la Orden
    numero: "",
    fecha: today,
    id_proveedor: "",
    ids_comprobantes: [] as number[],
    
    // Datos del Pago
    fecha_pago: today,
    monto_pago: "",
    forma_pago: "EFECTIVO",
    referencia: "",
  });

  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loadingComprobantes, setLoadingComprobantes] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (formData.id_proveedor) {
      fetchComprobantesByProveedor(parseInt(formData.id_proveedor));
    } else {
      setComprobantes([]);
      setTotal(0);
      setFormData(prev => ({ ...prev, ids_comprobantes: [], monto_pago: "" }));
    }
  }, [formData.id_proveedor]);

  useEffect(() => {
    if (formData.ids_comprobantes.length > 0) {
      const nuevoTotal = comprobantes
        .filter((c) => formData.ids_comprobantes.includes(c.id))
        .reduce((acc, curr) => acc + curr.total, 0);
      setTotal(nuevoTotal);
    } else {
      setTotal(0);
      setFormData(prev => ({ ...prev, monto_pago: "" }));
    }
  }, [formData.ids_comprobantes, comprobantes]);

  const fetchComprobantesByProveedor = async (id_proveedor: number) => {
    try {
      setLoadingComprobantes(true);
      const res = await fetch(
        `/api/v1/comprobante-proveedor/sin-orden?id_proveedor=${id_proveedor}`
      );
      if (res.ok) {
        const data = await res.json();
        setComprobantes(data);
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
    
    if (name === "monto_pago") {
      const formattedValue = formatNumberInput(value);
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleComprobanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = parseInt(e.target.value);
    const isChecked = e.target.checked;

    setFormData((prev) => {
      const newIds = isChecked
        ? [...prev.ids_comprobantes, id]
        : prev.ids_comprobantes.filter((compId) => compId !== id);
      
      return { ...prev, ids_comprobantes: newIds };
    });
  };

  const handlePagarTotal = () => {
    setFormData({ ...formData, monto_pago: total.toLocaleString('es-AR') });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones de Orden
    if (!formData.numero.trim()) {
      alert("Por favor, ingrese un número de orden");
      return;
    }
    if (!formData.id_proveedor) {
      alert("Por favor, seleccione un proveedor");
      return;
    }
    if (formData.ids_comprobantes.length === 0) {
      alert("Por favor, seleccione al menos un comprobante");
      return;
    }

    // Validaciones de Pago
    const montoNum = unformatNumberInput(formData.monto_pago);

    if (montoNum <= 0) {
      alert("Por favor, ingrese un monto a pagar válido");
      return;
    }
    if (montoNum > total) {
      alert("El monto a pagar no puede ser mayor que el total de la orden");
      return;
    }

    // Enviar todos los datos juntos
    onSubmit({
      // Datos Orden
      numero: formData.numero,
      fecha: formData.fecha,
      id_proveedor: parseInt(formData.id_proveedor),
      ids_comprobantes: formData.ids_comprobantes,
      total, // El total calculado
      
      // Datos Pago
      fecha_pago: formData.fecha_pago,
      monto_pago: montoNum, // El número limpio
      forma_pago: formData.forma_pago,
      referencia: formData.referencia || undefined,
    });
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      fecha: today,
      id_proveedor: "",
      ids_comprobantes: [],
      fecha_pago: today,
      monto_pago: "",
      forma_pago: "EFECTIVO",
      referencia: "",
    });
    setComprobantes([]);
    setTotal(0);
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto p-1">
        <h2 className="text-xl font-bold mb-4">Registrar Orden y Pago</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- SECCIÓN DATOS DE LA ORDEN --- */}
          <div className="p-3 border rounded-md border-base-300">
            <h3 className="text-lg font-semibold mb-2">1. Datos de la Orden</h3>
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
                  <span className="label-text">Fecha de Orden *</span>
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

              <div className="form-control w-full md:col-span-2">
                <label className="label py-1">
                  <span className="label-text">Comprobantes a incluir *</span>
                </label>
                <div
                  className="p-2 border rounded-lg border-base-300 bg-base-100 max-h-36 overflow-y-auto space-y-2"
                  style={{ minHeight: "6rem" }}
                >
                  {!formData.id_proveedor ? (
                    <span className="text-xs text-base-content/60 p-2 block text-center">
                      Primero seleccione un proveedor
                    </span>
                  ) : loadingComprobantes ? (
                    <span className="text-xs text-base-content/60 p-2 block text-center">
                      Cargando...
                    </span>
                  ) : comprobantes.length === 0 ? (
                    <span className="text-xs text-warning p-2 block text-center">
                      No hay comprobantes sin orden
                    </span>
                  ) : (
                    comprobantes.map((comp) => (
                      <label
                        key={comp.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-base-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={comp.id}
                          checked={formData.ids_comprobantes.includes(comp.id)}
                          onChange={handleComprobanteChange}
                          className="checkbox checkbox-xs"
                        />
                        <span className="text-xs">
                          {comp.tipo_comprobante.nombre} {comp.letra}-
                          {comp.sucursal}-{comp.numero} |
                          <span className="font-semibold ml-1">
                            {formatMoney(comp.total)}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="form-control w-full md:col-span-2">
                <label className="label py-1">
                  <span className="label-text">Total de la Orden</span>
                </label>
                <input
                  type="text"
                  value={total > 0 ? formatMoney(total) : "-"}
                  className="input input-sm input-bordered w-full font-bold"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* --- SECCIÓN DATOS DEL PAGO --- */}
          <div className="p-3 border rounded-md border-base-300">
            <h3 className="text-lg font-semibold mb-2">2. Datos del Pago</h3>

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text">Fecha de Pago *</span>
              </label>
              <input
                type="date"
                name="fecha_pago"
                value={formData.fecha_pago}
                onChange={handleChange}
                className="input input-sm input-bordered w-full"
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text">Monto a Pagar *</span>
                {total > 0 && (
                  <button
                    type="button"
                    onClick={handlePagarTotal}
                    className="label-text-alt link link-primary"
                  >
                    Pagar total ({formatMoney(total)})
                  </button>
                )}
              </label>
              <input
                type="text"
                inputMode="decimal"
                name="monto_pago"
                value={formData.monto_pago}
                onChange={handleChange}
                className="input input-sm input-bordered w-full"
                placeholder="0,00"
                required
                disabled={total === 0}
              />
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
                <span className="label-text">
                  Referencia{" "}
                  <span className="text-xs text-base-content/60">(opcional)</span>
                </span>
              </label>
              <input
                type="text"
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
                className="input input-sm input-bordered w-full"
                placeholder="Ej: Nº de transferencia, recibo, etc."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="submit" className="btn btn-primary">
              Registrar Orden
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
