// app/components/MovimientosTable.tsx
"use client";

interface Movimiento {
  fecha: string;
  tipo: string;
  comprobante: string;
  articulo: string;
  cantidad: number;
}

// El componente ahora recibe 'isLoading'
export default function MovimientosTable({ movimientos, isLoading }: { movimientos: Movimiento[], isLoading: boolean }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
          <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Artículo</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Cantidad</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Tipo</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Comprobante</th>
        </tr>
      </thead>
      <tbody>
        {/* --- LÓGICA DE MENSAJES CORREGIDA --- */}
        {isLoading ? (
          <tr>
            <td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>
              Cargando movimientos...
            </td>
          </tr>
        ) : movimientos.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>
              No hay movimientos para mostrar.
            </td>
          </tr>
        ) : (
          movimientos.map((mov, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{new Date(mov.fecha).toLocaleString('es-AR')}</td>
              <td style={{ padding: '8px' }}>{mov.articulo}</td>
              <td style={{ padding: '8px' }}>{mov.cantidad}</td>
              <td style={{ padding: '8px' }}>{mov.tipo}</td>
              <td style={{ padding: '8px' }}>{mov.comprobante}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}