import { NextResponse } from "next/server";
import {
  ArticuloData,
  retrieveArticulos,
  registerArticulo,
  updateArticulo,
  deleteArticulo,
} from "@/prisma/articulo";

// Devolver productos
export async function GET(req: Request) {
  let maybe_arts = await retrieveArticulos();

  if (maybe_arts.hasError()) {
    const error = maybe_arts.error();
    console.log(`ERROR: api/v1/prod @ GET: ${error}`);
    return NextResponse.json({ error }, { status: 500 })
  }

  const arts = maybe_arts.unwrap();
  if (arts.length == 0) {
    return NextResponse.json({ error: "Sin artículos" }, { status: 500 });
  }

  return NextResponse.json(
    arts.map((prod) => {
      let data: ArticuloData = prod.data;
      return {
        id: prod.id,
        codigo: data.getCodigo(),
        nombre: data.getNombre(),
        marca: data.getMarca(),
        categoria: data.getCategoria(),
      };
    })
  )
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
    return await registerArticulo(
      new ArticuloData(codigo, nombre, id_categoria, id_marca)
    ).then((id) => {
      return NextResponse.json({ id }, { status: 201 });
    });
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
    let data = new ArticuloData(
      raw_data.codigo,
      raw_data.nombre,
      raw_data.id_categoria,
      raw_data.id_marca
    );

    let update = updateArticulo(Number(id), data);

    return await updateArticulo({ id: Number(id), data })
      .then(() => {
        return NextResponse.json({});
      })
      .catch((error: any) => {
        return NextResponse.json({ error: error.message }, { status: 500 });
      });
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
