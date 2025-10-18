import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { getTodayAR } from "@/utils/dateUtils";

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
  detalles?: Array<{
    cantidad: number;
    precio_unitario: number;
  }>;
}

interface RegistrarOrdenPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  proveedores: Proveedor[];
  onSubmit: (data: any) => void;
}

export default function RegistrarOrdenPagoModal({
  isOpen,
  onClose,
  proveedores,
  onSubmit,
}: RegistrarOrdenPagoModalProps) {
  const [formData, setFormData] = useState({
    numero: "",
    fecha: new Date().toISOString().split("T")[0],
    id_proveedor: "",
    id_comprobante: "",
    estado: "PENDIENTE",
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
    }
  }, [formData.id_proveedor]);

  useEffect(() => {
    if (formData.id_comprobante) {
      const comprobante = comprobantes.find(
        (c) => c.id === parseInt(formData.id_comprobante)
      );
      if (comprobante) {
        setTotal(comprobante.total);
      }
    } else {
      setTotal(0);
    }
  }, [formData.id_comprobante, comprobantes]);

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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      alert("Por favor, ingrese un número de orden");
      return;
    }

    if (!formData.id_proveedor) {
      alert("Por favor, seleccione un proveedor");
      return;
    }

    if (!formData.id_comprobante) {
      alert("Por favor, seleccione un comprobante");
      return;
    }

    onSubmit({
      numero: formData.numero,
      fecha: formData.fecha,
      id_proveedor: parseInt(formData.id_proveedor),
      id_comprobante: parseInt(formData.id_comprobante),
      total,
      estado: formData.estado,
    });
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      fecha: new Date().toISOString().split("T")[0],
      id_proveedor: "",
      id_comprobante: "",
      estado: "PENDIENTE",
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
      <div className="max-h-full">
        <h2 className="text-xl font-bold mb-4">Registrar Orden de Pago</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Proveedor *</span>
          </label>
          <select
            name="id_proveedor"
            value={formData.id_proveedor}
            onChange={handleChange}
            className="select select-bordered w-full"
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
          <label className="label">
            <span className="label-text">Comprobante *</span>
          </label>
          <select
            name="id_comprobante"
            value={formData.id_comprobante}
            onChange={handleChange}
            className="select select-bordered w-full"
            disabled={!formData.id_proveedor || loadingComprobantes}
            required
          >
            <option value="" disabled>
              {loadingComprobantes
                ? "Cargando comprobantes..."
                : formData.id_proveedor
                ? "Seleccionar comprobante"
                : "Primero seleccione un proveedor"}
            </option>
            {comprobantes.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.tipo_comprobante.nombre} - {comp.letra}-{comp.sucursal}-
                {comp.numero} - ${comp.total.toLocaleString()} (
                {new Date(comp.fecha).toLocaleDateString()})
              </option>
            ))}
          </select>
          {formData.id_proveedor && comprobantes.length === 0 && !loadingComprobantes && (
            <label className="label">
              <span className="label-text-alt text-warning">
                Este proveedor no tiene comprobantes sin orden de pago
              </span>
            </label>
          )}
        </div>


        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Total de la Orden</span>
          </label>
          <input
            type="text"
            value={total ? `$${total.toLocaleString()}` : "-"}
            className="input input-bordered w-full"
            disabled
          />
        </div>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Fecha de Orden *</span>
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
            <span className="label-text">Número de Orden *</span>
          </label>
          <input
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Ej: OP-2025-001"
            required
          />
        </div>

        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Estado</span>
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="PAGADO">En Pago</option>
            <option value="CANCELADO">Pagado Completo</option>
          </select>
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