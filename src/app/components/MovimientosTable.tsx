// app/components/MovimientosTable.tsx
"use client";

// Definimos una interfaz para decirle a TypeScript cómo son nuestros datos
interface Movimiento {
  id_mov_stock: number;
  fecha_mov: string;
  hora_mov: string;
  producto_nombre: string; // Asumimos que obtendremos el nombre del producto
  tipo_mov: string;
  cantidad: number;
  deposito_origen: string;
  deposito_destino: string;
  tipo_comprobante: string;
  nro_comprobante: string;
}

// El componente recibe la lista de movimientos para mostrar
export default function MovimientosTable({ movimientos }: { movimientos: Movimiento[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
          <th style={{ padding: '12px', textAlign: 'left' }}>Fecha y Hora</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Producto</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Tipo de Movimiento</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Cantidad</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Depósito Origen</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Depósito Destino</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Tipo Comprobante</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Nro. Comprobante</th>
        </tr>
      </thead>
      <tbody>
        {movimientos.length === 0 ? (
          <tr>
            <td colSpan={8} style={{ textAlign: 'center', padding: '16px' }}>
              No hay movimientos para mostrar.
            </td>
          </tr>
        ) : (
          movimientos.map((mov) => (
            <tr key={mov.id_mov_stock} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{new Date(mov.fecha_mov).toLocaleDateString()} {mov.hora_mov}</td>
              <td style={{ padding: '8px' }}>{mov.producto_nombre}</td>
              <td style={{ padding: '8px' }}>{mov.tipo_mov}</td>
              <td style={{ padding: '8px' }}>{mov.cantidad}</td>
              <td style={{ padding: '8px' }}>{mov.deposito_origen}</td>
              <td style={{ padding: '8px' }}>{mov.deposito_destino}</td>
              <td style={{ padding: '8px' }}>{mov.tipo_comprobante}</td>
              <td style={{ padding: '8px' }}>{mov.nro_comprobante}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}