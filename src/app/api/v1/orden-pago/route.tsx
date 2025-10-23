import { NextResponse } from "next/server";
import {
  retrieveOrdenPagoList,
  retrieveOrdenPago,
  updateOrdenPagoEstado,
  registerOrdenPagoConPagoInicial, 
} from "@/prisma/pagos";
import { EstadoOrdenPago, FormaDePago } from "@/generated/prisma"; 

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const id_proveedor = searchParams.get("id_proveedor");
    const estado = searchParams.get("estado");

    if (id) {
      const orden = await retrieveOrdenPago(parseInt(id));
      if (!orden) {
        return NextResponse.json(
          { error: "Orden de pago no encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(orden);
    }

    // Construir filtros
    const filters: any = {};
    if (id_proveedor) {
      filters.id_proveedor = parseInt(id_proveedor);
    }
    if (estado && Object.values(EstadoOrdenPago).includes(estado as any)) {
      filters.estado = estado as EstadoOrdenPago;
    }

    const ordenes = await retrieveOrdenPagoList(filters);
    return NextResponse.json(ordenes);
  } catch (error) {
    console.error("Error al obtener órdenes de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


// --- 2. FUNCIÓN POST COMPLETAMENTE MODIFICADA ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      // Datos Orden
      numero,
      fecha,
      id_proveedor,
      ids_comprobantes,
      total,
      
      // Datos Pago
      fecha_pago,
      monto_pago,
      forma_pago,
      referencia,
    } = body;

    // 3. Validación actualizada para todos los campos
    if (
      !numero ||
      !fecha ||
      !id_proveedor ||
      !ids_comprobantes || 
      !Array.isArray(ids_comprobantes) || 
      ids_comprobantes.length === 0 ||
      total == null || 
      
      // Validar campos de pago
      !fecha_pago ||
      monto_pago == null ||
      !forma_pago
    ) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para la orden o el pago inicial" },
        { status: 400 }
      );
    }
    
    // Validar monto
    const montoNum = parseFloat(monto_pago);
    if (montoNum <= 0) {
      return NextResponse.json(
        { error: "El monto a pagar debe ser mayor a cero" },
        { status: 400 }
      );
    }
    if (montoNum > parseFloat(total)) {
      return NextResponse.json(
        { error: "El monto a pagar no puede ser mayor al total" },
        { status: 400 }
      );
    }


    // 4. Llamar a la nueva función de la DB
    const nuevaOrdenId = await registerOrdenPagoConPagoInicial({
      // Orden
      numero,
      fecha: new Date(fecha),
      id_proveedor: parseInt(id_proveedor),
      ids_comprobantes: ids_comprobantes.map((id: any) => parseInt(id)),
      total: parseFloat(total), 
      
      // Pago
      fecha_pago: new Date(fecha_pago),
      monto_pago: montoNum,
      forma_pago: forma_pago as FormaDePago,
      referencia: referencia,
    });

    // Devolver la orden recién creada
    const nuevaOrden = await retrieveOrdenPago(nuevaOrdenId);
    return NextResponse.json(nuevaOrden, { status: 201 });

  } catch (error: any) {
    console.error("Error al crear orden de pago:", error);
    
    // Devolver el mensaje de error de la transacción (ej: monto > total)
    if (error.message.includes("El monto del pago")) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return NextResponse.json(
        { error: "Falta ID o estado" },
        { status: 400 }
      );
    }

    const success = await updateOrdenPagoEstado(
      parseInt(id),
      estado as EstadoOrdenPago
    );

    if (!success) {
      return NextResponse.json(
        { error: "Error al actualizar orden de pago" },
        { status: 500 }
      );
    }

    const ordenActualizada = await retrieveOrdenPago(parseInt(id));
    return NextResponse.json(ordenActualizada);
  } catch (error) {
    console.error("Error al crear orden de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}