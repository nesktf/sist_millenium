import { NextResponse } from "next/server";
import {
  ArticuloDepositoData,
  DepositoData,
  MovimientoStockData,
  registerDeposito,
  registerMovimiento,
  retrieveDepositos,
} from "@/app/prisma";
import { NaturalezaMovimiento } from "@/generated/prisma";
import prisma from "@/app/prisma";

//nuevo handler para GET (en consultar stock para q filtro me devuelva los depositos)
export async function GET(req: Request) {
  return await retrieveDepositos()
    .then((depos) => {
      return NextResponse.json(
        depos.map((depo) => {
          let data: DepositoData = depo.data;
          return {
            id: depo.id,
            nombre: data.getNombre(),
            direccion: data.getDireccion(),
            capacidad: data.getCap(),
          };
        })
      );
    })
    .catch((err) => {
      return NextResponse.json({ error: err.message }, { status: 500 });
    });
}

export enum DepositoPostAction {
  get_depositos = 0,
  get_movimientos = 1,
  new_deposito = 2,
  new_movimiento = 3,
}

function buildDateRange(fecha: string, timezoneOffset?: number) {
  const [year, month, day] = String(fecha).split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Fecha inválida");
  }

  const offsetMinutes =
    typeof timezoneOffset === "number" && !Number.isNaN(timezoneOffset)
      ? timezoneOffset
      : 0;
  const baseUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0);
  const startDate = new Date(baseUtcMs + offsetMinutes * 60 * 1000);
  const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

  return { startDate, endDate };
}

async function getMovimientos(req: any) {
  try {
    const { id_deposito, fecha, tipo, articuloId } = req;
    const timezoneOffset =
      typeof req.timezoneOffset === "number"
        ? req.timezoneOffset
        : Number(req.timezoneOffset);

    if (typeof id_deposito !== "number") {
      return NextResponse.json(
        { error: "Código de depósito inválido" },
        { status: 400 }
      );
    }

    const whereClause: any = {
      id_deposito: id_deposito,
    };

    if (tipo && tipo !== "all") {
      whereClause.tipo = tipo;
    }
    if (articuloId && articuloId !== "all") {
      whereClause.detalles_mov = {
        some: {
          artic_depos: {
            id_articulo: articuloId,
          },
        },
      };
    }
    if (fecha) {
      try {
        const { startDate, endDate } = buildDateRange(fecha, timezoneOffset);
        whereClause.fecha_hora = {
          gte: startDate,
          lt: endDate,
        };
      } catch (err) {
        return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
      }
    }

    // --- Usamos Prisma directamente para asegurar que la consulta sea correcta ---
    const movimientos = await prisma.movimientoStock.findMany({
      where: whereClause,
      include: {
        deposito: true,
        tipo_comprobante: true,
        detalles_mov: {
          include: { artic_depos: { include: { articulo: true } } },
        },
      },
      orderBy: { fecha_hora: "desc" },
    });

    const resultadoAplanado = movimientos.flatMap((mov) =>
      mov.detalles_mov.map((detalle) => ({
        id_mov_stock: mov.id,
        fecha: mov.fecha_hora,
        comprobante: `${mov.tipo_comprobante?.nombre || ""} - ${
          mov.num_comprobante || ""
        }`,
        articulo: detalle.artic_depos.articulo.nombre,
        cantidad: detalle.cantidad,
        deposito: mov.deposito.direccion,
      }))
    );

    return NextResponse.json(resultadoAplanado);
  } catch (error) {
    console.error("Error en getMovimientos:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud de movimientos" },
      { status: 500 }
    );
  }
}

async function getDepositos() {
  let depos = await retrieveDepositos();
  if (depos.length == 0) {
    return NextResponse.json({ error: "No entries" }, { status: 400 });
  }
  return NextResponse.json({
    depositos: depos.map((depo) => {
      return {
        id_deposito: depo.id,
        nombre: depo.data.getNombre(),
        direccion: depo.data.getDireccion(),
        capacidad: depo.data.getCap(),
      };
    }),
  });
}

async function makeDeposito(req: any) {
  let { nombre, direccion, capacidad } = req;
  if (typeof nombre != "string") {
    return NextResponse.json(
      { error: "Nombre de depósito inválido" },
      { status: 400 }
    );
  }
  if (typeof direccion != "string") {
    return NextResponse.json(
      { error: "Dirección de depósito inválida" },
      { status: 400 }
    );
  }
  // if (typeof(capacidad) != "number" || typeof(capacidad) != "undefined") {
  //   return NextResponse.json({ error: "Capacidad de depósito inválida"}, { status: 400 });
  // }
  let id = await registerDeposito(
    new DepositoData(nombre, direccion, capacidad)
  );
  return NextResponse.json({ id_deposito: id });
}

async function makeMovimiento(req: any) {
  let { id_dst, id_src, tipoOperacionId, articulos, comprobante } = req;

  if (typeof id_dst !== "number") {
    return NextResponse.json({ error: "Deposito invalido" }, { status: 400 });
  }

  if (typeof tipoOperacionId !== "number") {
    return NextResponse.json(
      { error: "Tipo de operacion invalido" },
      { status: 400 }
    );
  }

  if (typeof comprobante !== "string") {
    return NextResponse.json(
      { error: "Tipo de comprobante invalido" },
      { status: 400 }
    );
  }

  if (!Array.isArray(articulos)) {
    return NextResponse.json({ error: "Articulos invalidos" }, { status: 400 });
  }

  // Buscar el tipoOperacion en la BD por ID
  const tipoOperacion = await prisma.tipoOperacion.findUnique({
    where: { id: tipoOperacionId },
  });

  if (!tipoOperacion) {
    return NextResponse.json(
      { error: `Tipo de operación id=${tipoOperacionId} no existe` },
      { status: 400 }
    );
  }

  // Parsear artículos
  let articulos_parsed = articulos.map((articulo) => {
    let { id, stock } = articulo;
    if (typeof id !== "number") throw new Error("ID articulo invalido");
    if (typeof stock !== "number") throw new Error("Stock invalido");
    return new ArticuloDepositoData(id, stock);
  });

  // Crear movimiento
  const parsed_data = new MovimientoStockData(
    id_dst,
    articulos_parsed,
    comprobante
  );

  try {
    let result = await registerMovimiento(parsed_data, tipoOperacion.nombre);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Comprobante duplicado" },
        { status: 400 }
      );
    }
    console.error("Error al registrar movimiento:", err);
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const handleError = (error: any) => {
    console.error(`Error POST deposito: ${error}`);
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  };
  let json = await req.json();
  let action = json.action;
  if (typeof action != "number") {
    return NextResponse.json({ error: "No action" }, { status: 400 });
  }

  switch (action) {
    case DepositoPostAction.get_depositos:
      return await getDepositos().catch(handleError);
    case DepositoPostAction.get_movimientos:
      console.log("AAAAAAAAAA");
      console.log("AAAAAAAAAA");
      return await getMovimientos(json).catch(handleError);
    case DepositoPostAction.new_deposito:
      return makeDeposito(json).catch(handleError);
    case DepositoPostAction.new_movimiento:
      return makeMovimiento(json).catch(handleError);
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
