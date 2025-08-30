import { NextResponse } from "next/server";
import {
  getProducts,
  createArticulo,
  updateArticulo,
  deleteArticulo,
} from "@/app/prisma";

// TODO:
// 1. Registrar producto -> Registrar un nuevo producto. POST para productos
// 2. Actualizar producto -> Modificar productos existentes. PUT para productos
// 3. Gestionar depósitos -> Registrar y modificar datos de los depósitos. POST & PUT para depósitos
// 4. Generar requerimientos de reposición -> Generar req. rep automáticamente. Ejecutar registor en la DB cuando stock llege a un número límite.
// 5. Gestionar ingreso de stock -> Actualizar stocks, incrementar numerito
// 6. Gestionar egreso de stock -> Actualizar stocks, decrementar numerito
// 7. Transferir stock entre depósitos -> Actualizar stocks, incrementar numerito en un lado decrementar en otro
// 8. Consultar disponibilidad de stock -> GET para los stocks
// 9. Generar requerimientos de reposición -> Duplicado del 4. Ignorar

// Devolver productos
export async function GET(req: Request) {
  const prods = await getProducts();
  return NextResponse.json(prods);
}

// Agregar producto
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { codigo, nombre, id_categoria, id_marca, u_medida } = body;

    // Validación básica
    if (typeof codigo !== "string" || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes o inválidos" },
        { status: 400 }
      );
    }

    const nuevoArticulo = await createArticulo({
      codigo,
      nombre,
      id_categoria,
      id_marca,
      u_medida,
    });

    return NextResponse.json(nuevoArticulo, { status: 201 });
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
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    const actualizado = await updateArticulo(Number(id), data);
    return NextResponse.json(actualizado);
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
