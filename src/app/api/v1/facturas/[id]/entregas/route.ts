import { prisma } from "@/prisma/instance";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const facturaId = Number(params.id);
  if (isNaN(facturaId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // Buscar la factura con su venta y detalles
    const factura = await prisma.facturaVenta.findUnique({
      where: { id: facturaId },
      include: {
        venta: {
          include: {
            detalle: { include: { articulo: true } },
          },
        },
      },
    });

    if (!factura) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la factura no esté cerrada
    if (["ENTREGADA", "CANCELADA"].includes(factura.estado)) {
      return NextResponse.json(
        { error: "No se puede modificar una factura cerrada." },
        { status: 400 }
      );
    }

    // Verificar existencia y stock suficiente en depósito principal (id = 1)
    for (const detalle of factura.venta.detalle) {
      const articuloDepos = await prisma.articDepos.findFirst({
        where: { id_articulo: detalle.id_articulo, id_deposito: 1 },
      });

      if (!articuloDepos) {
        return NextResponse.json(
          {
            error: `No se encontró el artículo "${detalle.articulo?.nombre}" en el depósito principal.`,
          },
          { status: 400 }
        );
      }

      if (articuloDepos.stock < detalle.cantidad) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para el artículo "${detalle.articulo?.nombre}". Disponible: ${articuloDepos.stock}, requerido: ${detalle.cantidad}.`,
          },
          { status: 400 }
        );
      }
    }

    // Buscar tipo de operación de egreso
    const tipoOperacion = await prisma.tipoOperacion.findFirst({
      where: { naturaleza: "EGRESO" },
    });

    if (!tipoOperacion) {
      return NextResponse.json(
        { error: "No existe tipo de operación EGRESO." },
        { status: 500 }
      );
    }

    // Transacción: actualizar factura + descontar stock + registrar movimientos
    const resultado = await prisma.$transaction(async (tx) => {
      // Actualizar estado de factura
      const facturaActualizada = await tx.facturaVenta.update({
        where: { id: facturaId },
        data: { estado: "ENTREGADA" },
      });

      // Crear movimiento principal
      const movimiento = await tx.movimientoStock.create({
        data: {
          id_deposito: 1,
          fecha_hora: new Date(),
          id_tipo_operacion: tipoOperacion.id,
          num_comprobante: factura.numero,
        },
      });

      // Iterar por cada detalle y aplicar cambios
      for (const detalle of factura.venta.detalle) {
        const articuloDepos = await tx.articDepos.findFirst({
          where: { id_articulo: detalle.id_articulo, id_deposito: 1 },
        });

        if (!articuloDepos) continue;

        await tx.articDepos.update({
          where: { id: articuloDepos.id },
          data: { stock: articuloDepos.stock - detalle.cantidad },
        });

        await tx.detalleMovimiento.create({
          data: {
            id_movimiento: movimiento.id,
            id_artic_depos: articuloDepos.id,
            cantidad: detalle.cantidad,
          },
        });
      }

      return facturaActualizada;
    });

    return NextResponse.json(
      {
        message:
          "Factura entregada, stock actualizado y movimientos registrados.",
        factura: resultado,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[factura-entrega][PATCH]", error);
    return NextResponse.json(
      { error: "Error al procesar entrega." },
      { status: 500 }
    );
  }
}
