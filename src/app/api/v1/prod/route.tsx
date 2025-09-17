import { NextResponse } from "next/server";
import {
  ArticuloData,
  retrieveArticulos,
  registerArticulo,
  updateArticulo,
  deleteArticulo,
} from "@/app/prisma";

// Devolver productos
export async function GET(req: Request) {
  return await retrieveArticulos()
  .then((prods) => {
    return NextResponse.json(
      prods.map((prod) => {
        let data: ArticuloData = prod.data;
        return {
          codigo: data.getCodigo(),
          nombre: data.getNombre(),
          id: prod.id,
          marca: prod.marca,
          categoria: prod.categoria,
        }
      })
    );
  })
}

// Agregar producto
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { codigo, nombre, id_categoria, id_marca } = body;

    // Validación básica
    if (typeof codigo !== "string" || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes o inválidos" },
        { status: 400 }
      );
    }
    return await registerArticulo(new ArticuloData(codigo, nombre, id_categoria, id_marca))
    .then((id) => {
      return NextResponse.json({id}, {status: 201})
    })
  } catch (error) {
    console.error("Error al crear artículo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...raw_data } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }
    let data = new ArticuloData(raw_data.codigo, raw_data.nombre,
                                raw_data.id_categoria, raw_data.id_marca);

    return await updateArticulo({id: Number(id), data})
    .then(() => {
      return NextResponse.json({});
    })
    .catch((error: any) => {
      return NextResponse.json({ error: error.message }, { status: 500 });
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    await deleteArticulo(Number(id));
    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
