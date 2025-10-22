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
    // Buscar la factura con su venta y detalles, incluyendo el nombre de los artículos
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

    // Validar estado
    if (factura.estado === "ENTREGADA" || factura.estado === "CANCELADA") {
      return NextResponse.json(
        { error: "No se puede modificar una factura cerrada." },
        { status: 400 }
      );
    }

    // 🔹 Validar que todos los artículos existan en el depósito principal antes de actualizar
    for (const detalle of factura.venta.detalle) {
      const articDepos = await prisma.articDepos.findFirst({
        where: { id_articulo: detalle.id_articulo, id_deposito: 1 },
      });

      if (!articDepos) {
        return NextResponse.json(
          {
            error: `No se encontró el artículo "${detalle.articulo?.nombre}" en el depósito principal`,
          },
          { status: 400 }
        );
      }
    }

    // 🔹 Si pasaron todas las validaciones, actualizar estado a ENTREGADA
    const facturaActualizada = await prisma.facturaVenta.update({
      where: { id: facturaId },
      data: { estado: "ENTREGADA" },
    });

    // 🔹 Descontar stock y registrar movimientos
    for (const detalle of factura.venta.detalle) {
      const articDepos = await prisma.articDepos.findFirst({
        where: { id_articulo: detalle.id_articulo, id_deposito: 1 },
      });

      if (articDepos) {
        await prisma.articDepos.update({
          where: { id: articDepos.id },
          data: { stock: Math.max(0, articDepos.stock - detalle.cantidad) },
        });

        const tipoOperacion = await prisma.tipoOperacion.findFirst({
          where: { naturaleza: "EGRESO" },
        });

        if (!tipoOperacion) {
          return NextResponse.json(
            { error: "No existe operación de tipo EGRESO" },
            { status: 500 }
          );
        }

        await prisma.movimientoStock.create({
          data: {
            id_deposito: 1,
            fecha_hora: new Date(),
            id_tipo_operacion: tipoOperacion.id,
            num_comprobante: factura.numero,
            detalles_mov: {
              create: {
                id_artic_depos: articDepos.id,
                cantidad: detalle.cantidad,
              },
            },
          },
        });
      }
    }

    return NextResponse.json(
      {
        message: "Entrega registrada y stock actualizado.",
        factura: facturaActualizada,
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
