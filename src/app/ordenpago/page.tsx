"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Modal from "@/components/Modal"; // Ajusta la ruta según tu estructura

// --- INTERFACES ---
interface ComprobanteProveedor {
  id: number;
  proveedor: { nombre: string };
  fecha: string;
  letra: string;
  sucursal: string;
  numero: string;
  tipo_comprobante: { nombre: string };
  detalles?: Array<{
    cantidad: number;
    precio_unitario: number;
  }>;
}

interface OrdenPago {
  id: number;
  id_comprobante: number;
  fecha: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'CANCELADO';
  cantidad?: number;
  forma_pago?: string;
  referencia?: string;
  responsable?: string;
  observaciones?: string;
  comprobante?: ComprobanteProveedor;
}

// --- COMPONENTE PARA REGISTRAR ORDEN DE PAGO ---
function RegistrarOrdenPagoModal({
  isOpen,
  onClose,
  comprobantes,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  comprobantes: ComprobanteProveedor[];
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    id_comprobante: '',
    fecha: new Date().toISOString().split('T')[0],
    cantidad: '',
    estado: 'PENDIENTE' as 'PENDIENTE' | 'PAGADO' | 'CANCELADO',
    forma_pago: 'EFECTIVO',
    referencia: '',
    responsable: '',
    observaciones: '',
  });

  // Calcular total del comprobante seleccionado
  const calcularTotal = (idComprobante: string) => {
    if (!idComprobante) return 0;
    
    const comprobante = comprobantes.find(c => c.id === parseInt(idComprobante));
    if (!comprobante || !comprobante.detalles) return 0;
    
    return comprobante.detalles.reduce((total, detalle) => {
      return total + (detalle.cantidad * detalle.precio_unitario);
    }, 0);
  };

  const totalComprobante = calcularTotal(formData.id_comprobante);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'id_comprobante') {
      // Cuando cambia el comprobante, calcular y actualizar el total automáticamente
      const total = calcularTotal(value);
      setFormData({ 
        ...formData, 
        [name]: value,
        cantidad: total ? total.toString() : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_comprobante) {
      alert("Por favor, selecciona un comprobante.");
      return;
    }
    if (!formData.cantidad || Number(formData.cantidad) <= 0) {
      alert('Ingrese un monto válido');
      return;
    }
    onSubmit({
      ...formData,
      id_comprobante: parseInt(formData.id_comprobante),
      cantidad: formData.cantidad ? Number(formData.cantidad) : null,
    });
  };

  const resetForm = () => {
    setFormData({
      id_comprobante: '',
      fecha: new Date().toISOString().split('T')[0],
      cantidad: '',
      estado: 'PENDIENTE',
      forma_pago: 'EFECTIVO',
      referencia: '',
      responsable: '',
      observaciones: '',
    });
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Registrar Orden de Pago</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Comprobante a Pagar *</span>
          </label>
          <select 
            name="id_comprobante"
            value={formData.id_comprobante}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="" disabled>Seleccionar comprobante</option>
            {comprobantes.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.proveedor.nombre} - {comp.letra}-{comp.sucursal}-{comp.numero} ({new Date(comp.fecha).toLocaleDateString()})
              </option>
            ))}
          </select>
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
            <span className="label-text">Monto *</span>
          </label>
          <input
            type="number"
            name="cantidad"
            min={0}
            step="0.01"
            value={formData.cantidad}
            onChange={handleChange}
            placeholder="Ingrese el monto a pagar"
            className="input input-bordered w-full"
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
            <option value="PAGADO">Pagado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Forma de Pago</span>
          </label>
          <select
            name="forma_pago"
            value={formData.forma_pago}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="CHEQUE">Cheque</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Referencia / Nº de operación</span>
            </label>
            <input
              type="text"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Ej: Nº de transferencia"
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Responsable</span>
            </label>
            <input
              type="text"
              name="responsable"
              value={formData.responsable}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Quién registra el pago"
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Observaciones</span>
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="textarea textarea-bordered"
            rows={3}
            placeholder="Notas adicionales del pago"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button type="submit" className="btn btn-primary">
            Registrar Orden
          </button>
        </div>
      </form>
    </Modal>
  );
}

// --- COMPONENTE PARA LA TABLA DE ÓRDENES ---
function OrdenesTable({ 
  ordenes, 
  onPagar 
}: { 
  ordenes: OrdenPago[];
  onPagar: (id: number) => void;
}) {
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <span className="badge badge-warning">Pendiente</span>;
      case 'PAGADO':
        return <span className="badge badge-success">Pagado</span>;
      case 'CANCELADO':
        return <span className="badge badge-error">Cancelado</span>;
      default:
        return <span className="badge badge-neutral">{estado}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full text-base-content">
        <thead className="bg-base-200">
          <tr>
            <th>ID</th>
            <th>Comprobante</th>
            <th>Proveedor</th>
            <th>Fecha Orden</th>
            <th>Estado</th>
            <th>Forma Pago</th>
            <th>Referencia</th>
            <th>Responsable</th>
            <th>Cantidad</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center p-4">
                No hay órdenes de pago registradas.
              </td>
            </tr>
          ) : (
            ordenes.map((orden) => (
              <tr key={orden.id}>
                <td>{orden.id}</td>
                <td>
                  {orden.comprobante ? 
                    `${orden.comprobante.letra}-${orden.comprobante.sucursal}-${orden.comprobante.numero}` : 
                    '-'
                  }
                </td>
                <td>{orden.comprobante?.proveedor.nombre || '-'}</td>
                <td>{new Date(orden.fecha).toLocaleDateString()}</td>
                <td>{getEstadoBadge(orden.estado)}</td>
                <td>{orden.forma_pago || '-'}</td>
                <td>{orden.referencia || '-'}</td>
                <td>{orden.responsable || '-'}</td>
                <td className="text-right">
                  {orden.cantidad ? `$${orden.cantidad.toLocaleString()}` : '-'}
                </td>
                <td className="text-center">
                  {orden.estado === 'PENDIENTE' && (
                    <button
                      onClick={() => onPagar(orden.id)}
                      className="btn btn-success btn-xs"
                    >
                      Pagar
                    </button>
                  )}
                  {orden.estado !== 'PENDIENTE' && (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function OrdenPagoPage() {
  const [ordenes, setOrdenes] = useState<OrdenPago[]>([]);
  const [comprobantes, setComprobantes] = useState<ComprobanteProveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch órdenes de pago
      const ordenesRes = await fetch('/api/v1/orden-pago');
      if (ordenesRes.ok) {
        const ordenesData = await ordenesRes.json();
        setOrdenes(ordenesData);
      }

      // Fetch comprobantes disponibles (sin orden de pago)
      const comprobantesRes = await fetch('/api/v1/comprobante-proveedor/sin-orden');
      if (comprobantesRes.ok) {
        const comprobantesData = await comprobantesRes.json();
        setComprobantes(comprobantesData);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarOrden = async (data: any) => {
    try {
      const res = await fetch('/api/v1/orden-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert('¡Orden de pago registrada con éxito!');
        setShowModal(false);
        fetchData(); // Recargar datos
      } else {
        const errorData = await res.json();
        alert(`Error al registrar: ${errorData.error}`);
      }
    } catch (error) {
      alert('Error de conexión al intentar registrar la orden.');
    }
  };

  const handlePagar = (id: number) => {
    // Placeholder para la funcionalidad de pago
    alert(`Funcionalidad de pago para la orden ${id} - Por implementar`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <main style={{ padding: "2rem" }}>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link href="/proveedor" className="btn btn-outline btn-sm">
            Volver a proveedores
          </Link>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm"
          >
            Registrar Orden de Pago
          </button>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Órdenes de Pago
        </h1>
        
        <div className="bg-base-100 rounded-lg shadow p-4">
          <OrdenesTable ordenes={ordenes} onPagar={handlePagar} />
        </div>

        <RegistrarOrdenPagoModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          comprobantes={comprobantes}
          onSubmit={handleRegistrarOrden}
        />
      </main>
    </div>
  );
}
