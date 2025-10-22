import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { getTodayAR } from "@/utils/dateUtils";

// --- INTERFAZ DE PROPS (Aquí debe estar "orden") ---
interface RegistrarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: any; // <-- ESTA LÍNEA ES FUNDAMENTAL
  onSubmit: (data: any) => void;
}

// --- HELPER FUNCTIONS ---

/** Formatea un número para mostrarlo como moneda (ej: $1.234,56) */
const formatMoney = (amount: number | null | undefined) => {
  if (typeof amount !== 'number') return '$0';
  // 'es-AR' usa puntos para miles y coma para decimales
  return `$${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Limpia y convierte un string de input (ej: "1.234,50") a un número (ej: 1234.50)
 */
const unformatNumberInput = (value: string): number => {
  if (!value) return 0;
  const cleaned = value
    .replace(/\./g, "")   // Quita los puntos de miles
    .replace(",", ".");  // Reemplaza la coma decimal por un punto
  return parseFloat(cleaned) || 0;
};

/**
 * Formatea un string de input (ej: "1234,5") a un string con puntos (ej: "1.234,5")
 */
const formatNumberInput = (value: string): string => {
  if (!value) return "";
  const parts = value.split(",");
  // Formatea la parte entera (quita puntos viejos, quita no-dígitos, convierte a BigInt y formatea)
  const integerPart = parts[0].replace(/\./g, "").replace(/\D/g, "");
  const formattedInteger = BigInt(integerPart || "0").toLocaleString("es-AR");

  if (parts.length > 1) {
    // Si hay parte decimal, la añade (solo dígitos)
    const decimalPart = parts[1].replace(/\D/g, "");
    return `${formattedInteger},${decimalPart}`;
  } else if (value.endsWith(",")) {
    // Si el usuario acaba de escribir la coma
    return `${formattedInteger},`;
  }
  
  return formattedInteger;
};


export default function RegistrarPagoModal({
  isOpen,
  onClose,
  orden, // <-- Y AQUÍ
  onSubmit,
}: RegistrarPagoModalProps) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    monto: "", // 'monto' ahora es un string formateado
    forma_pago: "EFECTIVO",
    referencia: "",
  });

  // Asegúrate que saldoPendiente se calcule bien incluso si orden es null al inicio
  const saldoPendiente = orden?.saldo || 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "monto") {
      // Aplicar formato mientras se escribe
      const formattedValue = formatNumberInput(value);
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Usar el helper para obtener el número real
    const montoNum = unformatNumberInput(formData.monto);

    if (!formData.monto || montoNum <= 0) {
      alert("Por favor, ingrese un monto válido");
      return;
    }

    if (montoNum > saldoPendiente) {
      alert("El monto no puede ser mayor al saldo pendiente");
      return;
    }

    onSubmit({
      id_orden_pago: orden.id,
      fecha: formData.fecha,
      monto: montoNum, // Enviar el número limpio
      forma_pago: formData.forma_pago,
      referencia: formData.referencia || undefined,
    });
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      monto: "",
      forma_pago: "EFECTIVO",
      referencia: "",
    });
  };

  const handlePagarTotal = () => {
    // Usar toLocaleString para obtener el formato regional correcto
    setFormData({ ...formData, monto: saldoPendiente.toLocaleString('es-AR') });
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen || !orden) return null;

  if (orden.estado === "CANCELADO") {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-8">
          <h2 className="text-xl font-bold mb-4">Orden Completamente Pagada</h2>
          <p className="text-base-content/70 mb-4">
            Esta orden ya ha sido pagada en su totalidad y no acepta más pagos.
          </p>
          <div className="alert alert-success">
            <span>Estado: Pagado Completo</span>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Registrar Pago</h2>

      <div className="bg-base-200 p-4 rounded-lg mb-4">
        <h3 className="font-bold mb-2">Información de la Orden</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Número:</span> {orden.numero}
          </div>
          <div>
            <span className="font-semibold">Proveedor:</span>{" "}
            {orden.proveedor?.nombre ||
              orden.comprobante?.proveedor?.nombre ||
              "-"}
          </div>
          <div>
            <span className="font-semibold">Total:</span>{" "}
            {formatMoney(orden.total || 0)}
          </div>
          <div>
            <span className="font-semibold">Saldo Pendiente:</span>{" "}
            <span className="text-warning font-bold">
              {formatMoney(saldoPendiente)}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Fecha de Pago *</span>
          </label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* --- CAMPO DE MONTO MODIFICADO --- */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Monto a Pagar *</span>
            <button
              type="button"
              onClick={handlePagarTotal}
              className="label-text-alt link link-primary"
            >
              Pagar total
            </button>
          </label>
          <input
            type="text" // Cambiado a text
            inputMode="decimal" // Teclado numérico en móvil
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Ingrese el monto (ej: 1.234,50)"
            required
          />
          <label className="label">
            <span className="label-text-alt">
              Máximo: {formatMoney(saldoPendiente)}
            </span>
          </label>
        </div>
        {/* --- FIN CAMPO MODIFICADO --- */}


        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Forma de Pago *</span>
          </label>
          <select
            name="forma_pago"
            value={formData.forma_pago}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label">
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
            className="input input-bordered w-full"
            placeholder="Ej: Nº de transferencia, recibo, etc."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button type="submit" className="btn btn-primary">
            Registrar Pago
          </button>
        </div>
      </form>
    </Modal>
  );
}