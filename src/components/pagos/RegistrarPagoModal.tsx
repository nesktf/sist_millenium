import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { getTodayAR } from "@/utils/dateUtils";

interface RegistrarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: any;
  onSubmit: (data: any) => void;
}

export default function RegistrarPagoModal({
  isOpen,
  onClose,
  orden,
  onSubmit,
}: RegistrarPagoModalProps) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    monto: "",
    forma_pago: "EFECTIVO",
    referencia: "",
  });

  const saldoPendiente = orden?.saldo || 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      alert("Por favor, ingrese un monto válido");
      return;
    }

    if (parseFloat(formData.monto) > saldoPendiente) {
      alert("El monto no puede ser mayor al saldo pendiente");
      return;
    }

    onSubmit({
      id_orden_pago: orden.id,
      fecha: formData.fecha,
      monto: parseFloat(formData.monto),
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
    setFormData({ ...formData, monto: saldoPendiente.toString() });
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
            {orden.proveedor?.nombre || orden.comprobante?.proveedor?.nombre || "-"}
          </div>
          <div>
            <span className="font-semibold">Total:</span> $
            {orden.total?.toLocaleString() || 0}
          </div>
          <div>
            <span className="font-semibold">Saldo Pendiente:</span>{" "}
            <span className="text-warning font-bold">
              ${saldoPendiente.toLocaleString()}
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
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            min="0"
            max={saldoPendiente}
            step="0.01"
            className="input input-bordered w-full"
            placeholder="Ingrese el monto"
            required
          />
          <label className="label">
            <span className="label-text-alt">
              Máximo: ${saldoPendiente.toLocaleString()}
            </span>
          </label>
        </div>

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