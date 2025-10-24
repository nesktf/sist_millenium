import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { formatCurrency } from "@/utils/currency";

// --- INTERFACES (sin cambios) ---
interface Articulo {
  id: number;
  nombre: string;
}
interface Proveedor {
  id: number;
  nombre: string;
}
interface TipoComprobanteProveedor {
  id: number;
  nombre: string;
  descripcion?: string;
}
interface DetalleComprobante {
  id_articulo: number;
  articulo_nombre: string;
  cantidad: number;
  precio_unitario: number;
  observacion?: string;
}
interface RegistrarComprobanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// --- HELPER FUNCTIONS ---

/** Formatea un número para mostrarlo como moneda (ej: $1.234,56) */
const formatMoney = (amount: number | null | undefined) => {
  if (typeof amount !== 'number') return '$0';
  return `$${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Formatea un número para mostrarlo como cantidad (ej: 1.234) */
const formatQuantity = (quantity: number | null | undefined) => {
  if (typeof quantity !== 'number') return '0';
  return quantity.toLocaleString('es-AR');
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
 * @param value - El string del input
 * @param allowDecimals - Si se deben permitir decimales (default: true)
 */
const formatNumberInput = (value: string, allowDecimals: boolean = true): string => {
  if (!value) return "";
  
  const parts = value.split(",");
  const integerPart = parts[0].replace(/\./g, "").replace(/\D/g, "");
  const formattedInteger = BigInt(integerPart || "0").toLocaleString("es-AR");

  if (allowDecimals) {
    if (parts.length > 1) {
      const decimalPart = parts[1].replace(/\D/g, "");
      return `${formattedInteger},${decimalPart}`;
    } else if (value.endsWith(",")) {
      return `${formattedInteger},`;
    }
  }
  
  return formattedInteger;
};


// --- COMPONENTE TABLA (Actualizado con formato) ---
function ProvComprTable({
  detalles,
  onDelete,
}: {
  detalles: DetalleComprobante[];
  onDelete: (index: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full text-base-content">
        <thead className="bg-base-200">
          <tr>
            <th>Artículo</th>
            <th>Observación</th>
            <th className="text-right">Cantidad</th>
            <th className="text-right">Precio Unitario</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {detalles.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4">
                Aún no se han agregado artículos.
              </td>
            </tr>
          ) : (
            detalles.map((detalle, index) => (
              <tr key={index}>
                <td>{detalle.articulo_nombre}</td>
                <td>{detalle.observacion || "-"}</td>
                <td className="text-right">
                  {/* Formato de display */}
                  {formatQuantity(detalle.cantidad)}
                </td>
                <td className="text-right">
                  {/* Formato de display */}
                  {formatMoney(detalle.precio_unitario)}
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    onClick={() => onDelete(index)}
                    className="btn btn-error btn-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL DEL MODAL (Actualizado) ---
export default function RegistrarComprobanteModal({
  isOpen,
  onClose,
  onSuccess,
}: RegistrarComprobanteModalProps) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [tiposComprobante, setTiposComprobante] = useState<
    TipoComprobanteProveedor[]
  >([]);
  const [detalles, setDetalles] = useState<DetalleComprobante[]>([]);
  const [headerData, setHeaderData] = useState({
    numero: "",
    fecha: new Date().toISOString().split("T")[0],
    letra: "A",
    sucursal: "",
    id_proveedor: "",
    id_tipo_comprobante: "",
  });
  const [detalleData, setDetalleData] = useState({
    id_articulo: "",
    articulo_nombre: "",
    observacion: "",
    cantidad: "", // Ahora es un string formateado
    precio_unitario: "", // Ahora es un string formateado
  });

  const totalActual = detalles.reduce(
    (acc, detalle) => acc + detalle.cantidad * detalle.precio_unitario,
    0
  );

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  async function fetchData() {
    const [provRes, artRes, tiposRes] = await Promise.all([
      fetch("/api/v1/proveedor"),
      fetch("/api/v1/prod"),
      fetch("/api/v1/comprobante-proveedor"),
    ]);

    if (provRes.ok) setProveedores(await provRes.json());
    if (artRes.ok) setArticulos(await artRes.json());
    if (tiposRes.ok) setTiposComprobante(await tiposRes.json());
  }

  const handleHeaderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setHeaderData({ ...headerData, [e.target.name]: e.target.value });
  };

  // --- MODIFICADO para formatear inputs ---
  const handleDetalleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "id_articulo") {
      const selectedArticulo = articulos.find(
        (art) => art.id === parseInt(value)
      );
      setDetalleData({
        ...detalleData,
        id_articulo: value,
        articulo_nombre: selectedArticulo?.nombre || "",
      });
    } else if (name === "cantidad") {
      // Formatear cantidad (sin decimales)
      const formattedValue = formatNumberInput(value, false);
      setDetalleData({ ...detalleData, [name]: formattedValue });
    } else if (name === "precio_unitario") {
      // Formatear precio (con decimales)
      const formattedValue = formatNumberInput(value, true);
      setDetalleData({ ...detalleData, [name]: formattedValue });
    } else {
      setDetalleData({ ...detalleData, [name]: value });
    }
  };

  // --- MODIFICADO para des-formatear ---
  const handleAddDetalle = () => {
    // Usar helper para obtener números reales
    const cantidadNum = unformatNumberInput(detalleData.cantidad);
    const precioNum = unformatNumberInput(detalleData.precio_unitario);

    if (!detalleData.id_articulo || cantidadNum <= 0 || precioNum <= 0) {
      alert(
        "Por favor, selecciona un artículo y asegúrate de que la cantidad y el precio sean mayores a cero."
      );
      return;
    }

    const nuevoDetalle = {
      id_articulo: parseInt(detalleData.id_articulo),
      articulo_nombre: detalleData.articulo_nombre,
      cantidad: cantidadNum, // Guardar el número limpio
      precio_unitario: precioNum, // Guardar el número limpio
      observacion: detalleData.observacion
    };
    
    setDetalles([...detalles, nuevoDetalle]);
    setDetalleData({
      id_articulo: "",
      articulo_nombre: "",
      observacion: "",
      cantidad: "",
      precio_unitario: "",
    });
  };

  const handleDeleteDetalle = (indexToDelete: number) => {
    const nuevosDetalles = detalles.filter((_, index) => index !== indexToDelete);
    setDetalles(nuevosDetalles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !window.confirm("¿Estás seguro de que deseas guardar este comprobante?")
    )
      return;
    if (
      !headerData.id_proveedor ||
      !headerData.id_tipo_comprobante ||
      !headerData.sucursal ||
      detalles.length === 0
    ) {
      alert(
        "Selecciona proveedor, tipo de comprobante, sucursal y agrega al menos un artículo."
      );
      return;
    }
    try {
      const res = await fetch("/api/v1/comprobante-proveedor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...headerData, detalles }),
      });
      const payload = await res.json();
      if (res.ok) {
        const totalRespuesta =
          typeof payload?.total === "number" ? payload.total : totalActual;
        alert(
           // --- FORMATO APLICADO ---
          `¡Comprobante guardado con éxito! Total: ${formatMoney(totalRespuesta)}`
        );
        resetForm();
        onSuccess();
      } else {
        alert(`Error al guardar: ${payload?.error || "Intenta nuevamente"}`);
      }
    } catch (error) {
      alert("Error de conexión al intentar guardar.");
    }
  };

  const resetForm = () => {
    setHeaderData({
      numero: "",
      fecha: new Date().toISOString().split("T")[0],
      letra: "A",
      sucursal: "",
      id_proveedor: "",
      id_tipo_comprobante: "",
    });
    setDetalles([]);
    setDetalleData({
      id_articulo: "",
      articulo_nombre: "",
      observacion: "",
      cantidad: "",
      precio_unitario: "",
    });
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Cargar Comprobante de Proveedor</h2>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* Datos del Comprobante (sin cambios) */}
          <div className="p-3 border rounded-md">
            <h3 className="text-lg font-semibold mb-2">Datos del Comprobante</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <div className="form-control w-full">
                <label htmlFor="id_proveedor" className="label py-1">
                  <span className="label-text">Proveedor</span>
                </label>
                <select
                  id="id_proveedor"
                  name="id_proveedor"
                  value={headerData.id_proveedor}
                  onChange={handleHeaderChange}
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
                <label htmlFor="fecha" className="label py-1">
                  <span className="label-text">Fecha</span>
                </label>
                <input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={headerData.fecha}
                  onChange={handleHeaderChange}
                  className="input input-sm input-bordered w-full"
                />
              </div>
              
              <div className="form-control w-full">
                <label htmlFor="id_tipo_comprobante" className="label py-1">
                  <span className="label-text">Tipo de Comprobante</span>
                </label>
                <select
                  id="id_tipo_comprobante"
                  name="id_tipo_comprobante"
                  value={headerData.id_tipo_comprobante}
                  onChange={handleHeaderChange}
                  className="select select-sm select-bordered w-full"
                  required
                >
                  <option value="" disabled>
                    Seleccionar tipo
                  </option>
                  {tiposComprobante.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control w-full">
                <label htmlFor="letra" className="label py-1">
                  <span className="label-text">Letra</span>
                </label>
                <select
                  id="letra"
                  name="letra"
                  value={headerData.letra}
                  onChange={handleHeaderChange}
                  className="select select-sm select-bordered w-full"
                >
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                </select>
              </div>
              <div className="form-control w-full">
                <label htmlFor="sucursal" className="label py-1">
                  <span className="label-text">Sucursal</span>
                </label>
                <input
                  id="sucursal"
                  name="sucursal"
                  value={headerData.sucursal}
                  onChange={handleHeaderChange}
                  placeholder="0001"
                  className="input input-sm input-bordered w-full"
                />
              </div>
              <div className="form-control w-full">
                <label htmlFor="numero" className="label py-1">
                  <span className="label-text">Número</span>
                </label>
                <input
                  id="numero"
                  name="numero"
                  value={headerData.numero}
                  onChange={handleHeaderChange}
                  className="input input-sm input-bordered w-full"
                />
              </div>
              
            </div>
          </div>
          
          {/* --- MODIFICADO: Inputs de Artículo --- */}
          <div className="p-3 border rounded-md">
            <h3 className="text-lg font-semibold mb-2">Agregar Artículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {/* Select Artículo (sin cambios) */}
              <div className="form-control w-full md:col-span-2">
                <label htmlFor="id_articulo" className="label py-1">
                  <span className="label-text">Artículo</span>
                </label>
                <select
                  id="id_articulo"
                  name="id_articulo"
                  value={detalleData.id_articulo}
                  onChange={handleDetalleChange}
                  className="select select-sm select-bordered w-full"
                >
                  <option value="" disabled>
                    Seleccionar artículo
                  </option>
                  {articulos.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Cantidad */}
              <div className="form-control w-full">
                <label htmlFor="cantidad" className="label py-1">
                  <span className="label-text">Cantidad</span>
                </label>
                <input
                  id="cantidad"
                  name="cantidad"
                  type="text" // Cambiado
                  inputMode="decimal" // Cambiado
                  value={detalleData.cantidad}
                  onChange={handleDetalleChange}
                  placeholder="0"
                  className="input input-sm input-bordered w-full"
                />
              </div>

              {/* Input Precio */}
              <div className="form-control w-full">
                <label htmlFor="precio_unitario" className="label py-1">
                  <span className="label-text">Precio</span>
                </label>
                <input
                  id="precio_unitario"
                  name="precio_unitario"
                  type="text" // Cambiado
                  inputMode="decimal" // Cambiado
                  value={detalleData.precio_unitario}
                  onChange={handleDetalleChange}
                  placeholder="0"
                  className="input input-sm input-bordered w-full"
                />
              </div>

              {/* Input Observación (sin cambios) */}
              <div className="form-control w-full md:col-span-2">
                <label htmlFor="observacion" className="label py-1">
                  <span className="label-text">Observación</span>
                </label>
                <input
                  id="observacion"
                  name="observacion"
                  value={detalleData.observacion}
                  onChange={handleDetalleChange}
                  className="input input-sm input-bordered w-full"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddDetalle}
              className="btn btn-secondary btn-sm mt-3"
            >
              Agregar a la lista
            </button>
          </div>
          {/* --- FIN MODIFICACIÓN --- */}


          {/* Tabla (sin cambios, usa el componente actualizado) */}
          <ProvComprTable detalles={detalles} onDelete={handleDeleteDetalle} />

          {/* Total (MODIFICADO) */}
          <div className="flex justify-end mt-2">
            <span className="text-lg font-semibold">
              {/* --- FORMATO APLICADO --- */}
              Total actual: {formatMoney(totalActual)}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="submit" className="btn btn-primary">
              Guardar Comprobante
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
