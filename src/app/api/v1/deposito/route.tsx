import { NextRequest, NextResponse } from "next/server";
import {
  ArticuloDepositoData,
  DepositoData,
  MovimientoStockData,
  registerDeposito,
  registerMovimiento,
  retrieveDepositos,
  retrieveMovimientos
} from "@/app/prisma";
import { TipoMovimiento } from "@/generated/prisma";


//nuevo handler para GET (en consultar stock para q filtro me devuelva los depositos)
export async function GET(req: Request) {
  return await retrieveDepositos()
    .then((depos) => {
      return NextResponse.json(
        depos.map((depo) => {
          let data: DepositoData = depo.data;
          return {
            id: depo.id,
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
};

async function getMovimientos(req: any) {
  let id_deposito = req.id_deposito;
  if (typeof(id_deposito) != "number") {
    return NextResponse.json({ error: "Código de depósito inválido"}, { status: 400 });
  }
  let id_articulo: number | null = null;
  let maybe_articulo = req.id_articulo;
  if (maybe_articulo && typeof(maybe_articulo) == "number") {
    id_articulo = Number(maybe_articulo);
  console.log(id_articulo)
  } else {
  console.log("NOTHING")
  }

  let movs = await retrieveMovimientos(Number(id_deposito), id_articulo);
  if (movs.length == 0) {
    return NextResponse.json({ error: "No entries" }, { status: 400 });
  }
  return NextResponse.json({ id_deposito: Number(id_deposito), movimientos: movs });
}

async function getDepositos() {
  let depos = await retrieveDepositos();
  if (depos.length == 0) {
    return NextResponse.json({ error: "No entries" }, { status: 400 });
  }
  return NextResponse.json({
    depositos: depos.map((depo) => {
      depo.data.getDireccion
      return {
        id_deposito: depo.id,
        direccion: depo.data.getDireccion(),
        capacidad: depo.data.getCap(),
      };
    }),
  });
}

async function makeDeposito(req: any) {
  let { direccion, capacidad } = req;
  if (typeof(direccion) != "string") {
    return NextResponse.json({ error: "Dirección de depósito inválida"}, { status: 400 });
  }
  // if (typeof(capacidad) != "number" || typeof(capacidad) != "undefined") {
  //   return NextResponse.json({ error: "Capacidad de depósito inválida"}, { status: 400 });
  // }
  let id = await registerDeposito(new DepositoData(direccion, capacidad));
  return NextResponse.json({id_deposito: id});
}

async function makeMovimiento(req: any) {
  let { id_dst, id_src, tipo, articulos, comprobante } = req;
  if (typeof(id_dst) != "number") {
    return NextResponse.json({ error: "Deposito invalido"}, { status: 400 });
  }
  if (tipo != TipoMovimiento.INGRESO &&
      tipo != TipoMovimiento.TRANSFERENCIA &&
      tipo != TipoMovimiento.EGRESO) {
    return NextResponse.json({ error: "Tipo de movimiento invalido"}, { status: 400 });
  }
  if (typeof(comprobante) != "string") {
    return NextResponse.json({ error: "Tipo de comprobante invalido"}, { status: 400 });
  }
  if (tipo == TipoMovimiento.TRANSFERENCIA && typeof(id_src) != "number") {
    return NextResponse.json({ error: "Deposito fuente invalido"}, { status: 400 });
  }
  if (!Array.isArray(articulos)) {
    return NextResponse.json({ error: "Articulos invalidos"}, { status: 400 });
  }
  let articulos_parsed = articulos.map((articulo) => {
    let { id, stock } = articulo;
    if (typeof(id) != "number") {
      throw new Error("ID articulo invalido");
    }
    if (typeof(stock) != "number") {
      throw new Error("ID stock invalido");
    }
    return new ArticuloDepositoData(id, stock);
  });

  var parsed_data = (() => {
    if (tipo == TipoMovimiento.TRANSFERENCIA) {
      return MovimientoStockData.fromTransfer(id_dst, id_src, comprobante, articulos_parsed);
    } else {
      return new MovimientoStockData(id_dst, tipo, articulos_parsed, comprobante);
    }
  })();
  let result = await registerMovimiento(parsed_data);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const handleError = (error: any) => {
    console.error(`Error POST deposito: ${error}`);
    return NextResponse.json({ error: `${error}`}, { status: 500 });
  }
  let json = await req.json();
  let action = json.action;
  if (typeof(action) != "number") {
    return NextResponse.json({ error: "No action" }, { status: 400 });
  }

  switch (action) {
    case DepositoPostAction.get_depositos:
      return await getDepositos().catch(handleError);
    case DepositoPostAction.get_movimientos:
  console.log("AAAAAAAAAA")
  console.log("AAAAAAAAAA")
      return await getMovimientos(json).catch(handleError);
    case DepositoPostAction.new_deposito:
      return makeDeposito(json).catch(handleError);
    case DepositoPostAction.new_movimiento:
      return makeMovimiento(json).catch(handleError);
    default:
      return NextResponse.json({error: "Invalid action" }, { status: 400 });
  }
}
